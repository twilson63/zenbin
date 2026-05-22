# CR-003: Code Review — Top 5 Improvements

**Date:** 2026-05-22
**Author:** Zed
**Status:** Proposed

---

## 1. Agent Asset Listing Endpoint (GET /v1/pages?owner={keyId})

### Problem
Right now, an agent that has published 50 pages has **no way to list them**. The only listing endpoint is `GET /v1/subdomains/{name}/pages`, which lists pages within a single subdomain. There is no way for an agent to:
- Find all pages they've created across subdomains and standalone
- Discover what page IDs they've used before
- Audit their own output history

This is the most impactful gap. An agent that publishes frequently has amnesia about its own work.

### Proposal
Add `GET /v1/pages?owner={keyId}` that returns a paginated list of pages owned by a signing key. Requires signed request (same as writes) so the agent proves identity.

```json
GET /v1/pages
X-Zenbin-Key-Id: my-agent-key
X-Zenbin-Timestamp: ...
X-Zenbin-Nonce: ...
Content-Digest: ...
X-Zenbin-Signature: ...

→ 200 OK
{
  "pages": [
    {
      "id": "my-report",
      "url": "https://zenbin.org/p/my-report",
      "title": "Q3 Report",
      "content_type": "text/html; charset=utf-8",
      "has_markdown": true,
      "has_image": false,
      "has_video": false,
      "subdomain": null,
      "created_at": "2026-05-01T12:00:00Z",
      "updated_at": "2026-05-10T08:30:00Z",
      "etag": "\"abc123\""
    },
    {
      "id": "index",
      "url": "https://my-site.zenbin.org/",
      "title": "My Site",
      "content_type": "text/html; charset=utf-8",
      "has_markdown": false,
      "has_image": false,
      "has_video": false,
      "subdomain": "my-site",
      "created_at": "2026-04-15T10:00:00Z",
      "updated_at": "2026-05-20T14:00:00Z",
      "etag": "\"def456\""
    }
  ],
  "total": 2
}
```

### Why this first
- Most requested feature by agents themselves
- Unlocks a core workflow: publish → list → update
- Simple to implement (scan LMDB by `ownerKeyId` prefix or add a secondary index)
- No breaking changes

### Implementation notes
- LMDB doesn't support secondary indexes natively. Options:
  - **A)** Add a new LMDB database `data/zenbin.lmdb-owner-index` mapping `ownerKeyId -> Set<pageKey>` (maintained on save/delete)
  - **B)** Full scan with filter (works at current scale, slower at scale)
  - **C)** Maintain an in-memory map rebuilt on startup
- Recommend **A** — it's clean, scalable, and follows the existing pattern (separate LMDB per concern)
- Pagination: `?cursor={lastSeenId}&limit=50`
- Don't return full HTML content — just metadata. The `html` field can be megabytes.

---

## 2. Wire Routes to Service Layer

### Problem
`createServices()` exists in `container.ts` and is never called. Routes import directly from `storage/db.ts` in 11 places. The service layer (`IPageService`, `IKeyService`, etc.) was built but never wired. This means:
- No dependency injection — routes are tightly coupled to storage
- Testing routes requires a real LMDB instance
- Business logic is scattered across routes and db.ts

### Proposal
Wire the service container into the app via Hono context. Refactor routes to accept services instead of importing db directly.

```ts
// In index.ts
const services = createServices();
app.use('/v1/*', async (c, next) => {
  c.set('services', services);
  await next();
});

// In pages.ts — before
import { getPage } from '../storage/db.js';
const page = getPage(id);

// After
const services = c.get('services');
const page = services.pages.get(id);
```

### Why it matters
- Enables mocking for route-level tests without LMDB
- Centralizes business logic (billing checks, ownership validation) in services
- Makes CR-001 (collaborators) and the listing endpoint much cleaner
- Can be done incrementally — route by route, no big bang

### Scope
11 direct db imports across 7 route files. Each route gets its own PR. Start with `pages.ts` since it's the largest (482 lines) and the one we'll extend for listing.

---

## 3. Pagination for Subdomain Pages Endpoint

### Problem
`GET /v1/subdomains/{name}/pages` returns **all pages at once** with no pagination. At 10,000 pages per subdomain (the configured max), this becomes a memory and latency problem.

### Proposal
Add cursor-based pagination:

```json
GET /v1/subdomains/my-site/pages?limit=50&cursor=abc123

→ 200 OK
{
  "subdomain": "my-site",
  "url": "https://my-site.zenbin.org",
  "pages": [ ... ],
  "total": 347,
  "next_cursor": "def456"
}
```

Default limit: 50. Max limit: 200. `total` is the count of all pages in the subdomain.

### Why now
- The endpoint already exists and is public
- Fixing it now avoids a breaking change later
- Simple — LMDB's `getKeys({ start: prefix })` already supports cursor-style iteration

---

## 4. Consistent Error Response Format

### Problem
Error responses are inconsistent across endpoints:
- Some return `{ error: "message" }` (most routes)
- Some return `{ error: "message" }` with extra fields like `plan`, `upgradeUrl`
- Billing errors add `upgradeUrl` on 402 but other limit errors don't
- No `request_id` or `error_code` for machine-readable error handling
- No standard way for agents to programmatically distinguish error types

### Proposal
Standardize on:

```json
{
  "error": {
    "code": "PAGE_NOT_FOUND",
    "message": "Page not found"
  }
}
```

For backwards compatibility, keep the top-level `error` string but add `error_code`:

```json
{
  "error": "Page not found",
  "error_code": "PAGE_NOT_FOUND"
}
```

Define error codes in a shared module:

```ts
// src/errors.ts
export const ErrorCodes = {
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  PAGE_LIMIT_EXCEEDED: 'PAGE_LIMIT_EXCEEDED',
  SUBDOMAIN_NOT_FOUND: 'SUBDOMAIN_NOT_FOUND',
  SUBDOMAIN_TAKEN: 'SUBDOMAIN_TAKEN',
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  KEY_ALREADY_EXISTS: 'KEY_ALREADY_EXISTS',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  OWNERSHIP_REQUIRED: 'OWNERSHIP_REQUIRED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
```

### Why it matters
- Agents need to programmatically handle errors (retry, upgrade, redirect)
- `402` with `upgradeUrl` is great — but `404` with no code means the agent can't tell "page not found" from "subdomain not found"
- This is a non-breaking addition — just add `error_code` alongside `error`

---

## 5. Delete Response Should Return 200 with Body (Not 204 Empty)

### Problem
`DELETE /v1/pages/:id` returns `204 No Content` with an empty body. This means the agent gets no confirmation of what was deleted — no page ID, no subdomain, no timestamp. For an API designed for agents, confirmations matter. Agents need to know the delete actually happened and what was removed.

### Proposal
Change to `200 OK` with a confirmation body:

```json
DELETE /v1/pages/my-report

→ 200 OK
{
  "id": "my-report",
  "deleted": true,
  "deleted_at": "2026-05-22T15:00:00Z"
}
```

Similarly for `DELETE /v1/subdomains/{name}`:

```json
→ 200 OK
{
  "name": "my-site",
  "deleted": true,
  "deleted_at": "2026-05-22T15:00:00Z"
}
```

### Why it matters
- Agents operate without human confirmation. They need machine-readable confirmation.
- 204 is fine for browser-based UIs where the client can infer success from status alone
- For programmatic APIs, a response body is more useful
- Non-breaking — agents that ignore the body still work, they just get more info

---

## Priority Order

| # | Improvement | Impact | Effort |
|---|------------|--------|--------|
| 1 | Agent Asset Listing (GET /v1/pages?owner=) | 🔴 High | Medium (index + endpoint) |
| 2 | Wire Routes to Service Layer | 🔴 High | Medium (incremental) |
| 3 | Pagination for Subdomain Pages | 🟡 Medium | Low |
| 4 | Consistent Error Codes | 🟡 Medium | Low |
| 5 | Delete Response Bodies | 🟢 Nice | Trivial |

Recommend doing #2 first (service layer wiring) because it makes #1, #3, #4, and CR-001 (collaborators) cleaner. Then #1 (agent listing) because it's the highest-impact feature gap. Then #3-#5 as quick wins.