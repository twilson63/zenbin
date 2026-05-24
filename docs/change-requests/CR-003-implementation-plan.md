# CR-003 Implementation Plan

**Branch:** `feat/cr003-listing-and-cleanup`
**Base:** `main` (278 tests passing)
**Goal:** Wire service layer, add agent asset listing, add pagination, add error codes, fix delete responses

---

## Step 1: Create Hono service context + error codes module

**What:** Set up the dependency injection plumbing and the shared error codes module.

**Files changed:**
- `src/index.ts` — add `createServices()` call, inject via Hono context middleware
- `src/errors.ts` — new file, define `ErrorCodes` enum and helper `errorResponse()`
- `src/types.ts` — add `Services` type import for Hono context

**Success criteria:**
- [ ] `createServices()` is called once at app startup in `src/index.ts`
- [ ] Services are available in route handlers via `c.get('services')`
- [ ] `src/errors.ts` exports `ErrorCodes` const enum with at least: `PAGE_NOT_FOUND`, `SUBDOMAIN_NOT_FOUND`, `PAGE_LIMIT_EXCEEDED`, `SUBDOMAIN_LIMIT_EXCEEDED`, `SUBDOMAIN_TAKEN`, `KEY_NOT_FOUND`, `KEY_ALREADY_EXISTS`, `OWNERSHIP_REQUIRED`, `AUTH_REQUIRED`, `INVALID_CREDENTIALS`, `RATE_LIMITED`, `INVALID_SIGNATURE`, `INVALID_REQUEST`
- [ ] `errorResponse(code, message, status)` returns `{ error: message, error_code: code }` with correct HTTP status
- [ ] All 278 existing tests still pass
- [ ] New test file `src/test/errors.test.ts` covers `errorResponse()` helper

---

## Step 2: Wire pages route to service layer

**What:** Refactor `src/routes/pages.ts` to use services instead of direct `db.ts` imports. Add methods to `IPageService` and `PageService` as needed.

**Files changed:**
- `src/routes/pages.ts` — replace all `db.ts` imports with service calls via `c.get('services')`
- `src/services/interfaces.ts` — add `listByOwner(keyId, cursor?, limit?)` to `IPageService`
- `src/services/pageService.ts` — implement `listByOwner` (full scan for now, index added in Step 5)
- `src/services/keyService.ts` — add `getAgentKey`, `incrementUsage`, `resetUsage` if not already present
- `src/services/auditService.ts` — ensure `save` method covers all audit actions from pages route
- `src/types.ts` — add Hono `Variables` type that includes `services`

**Success criteria:**
- [ ] `pages.ts` has zero imports from `../storage/db.js`
- [ ] All page operations (save, get, delete, billing checks, audit logs) go through services
- [ ] `IPageService` has a `listByOwner` method (even if initial impl is full scan)
- [ ] All 278 existing tests still pass
- [ ] No behavioral changes — same request/response shapes

---

## Step 3: Wire remaining routes to service layer

**What:** Migrate `subdomains.ts`, `keys.ts`, `billing.ts`, `stats.ts`, `adminKeys.ts`, `verify.ts` to use services. Add service methods as needed.

**Files changed:**
- `src/routes/subdomains.ts`
- `src/routes/keys.ts`
- `src/routes/billing.ts`
- `src/routes/stats.ts`
- `src/routes/adminKeys.ts`
- `src/routes/verify.ts`
- `src/services/interfaces.ts` — add any missing methods
- Corresponding service implementations

**What stays as direct DB access:**
- `src/routes/render.ts` — read-only rendering, no service needed yet (can be Step 3b if we want)
- `src/routes/subdomainRender.ts` — same, read-only
- `src/middleware/signedAgent.ts` — auth middleware, direct DB access is fine here

**Success criteria:**
- [ ] All write routes have zero imports from `../storage/db.js`
- [ ] `signedAgent.ts` middleware still imports from `db.ts` (acceptable — it's auth infra, not business logic)
- [ ] `render.ts` and `subdomainRender.ts` still import `getPage` from `db.ts` (acceptable — read-only rendering)
- [ ] All 278 existing tests still pass
- [ ] No behavioral changes

---

## Step 4: Add owner index and agent asset listing endpoint

**What:** Create the LMDB owner index and the `GET /v1/pages` endpoint. This is the flagship feature.

**Files changed:**
- `src/storage/db.ts` — add `ownerIndexDb` LMDB database, `addPageToOwnerIndex()`, `removePageFromOwnerIndex()`, `listPagesByOwner()` functions. Update `savePage` and `deletePage` to maintain the index.
- `src/services/interfaces.ts` — add `listByOwner(keyId, cursor?, limit?)` return type with pagination
- `src/services/pageService.ts` — implement `listByOwner` using the owner index
- `src/routes/pages.ts` — add `GET /` handler (signed request required, returns pages owned by the authenticated key)
- `src/types.ts` — add `PageSummary` type (metadata only, no HTML content)
- `src/docs/agentInstructions.ts` — document the new endpoint
- New test file: `src/test/page-listing.test.ts`

**Endpoint spec:**

```
GET /v1/pages
Headers: X-Zenbin-Key-Id, X-Zenbin-Timestamp, X-Zenbin-Nonce, Content-Digest, X-Zenbin-Signature
Query params: ?cursor=abc123&limit=50

Response 200:
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
      "created_at": "...",
      "updated_at": "...",
      "etag": "..."
    }
  ],
  "total": 42,
  "cursor": "nextCursorValue"
}
```

- `cursor` is `null`/absent when there are no more pages
- Default `limit` is 50, max is 200
- Response never includes `html`, `markdown`, `image`, or `video` fields — only metadata
- Signed request required — the keyId from the signature determines the owner filter
- `subdomain` is `null` for standalone pages, the subdomain name for subdomain pages

**Success criteria:**
- [ ] `GET /v1/pages` with valid signed request returns 200 with page list owned by that key
- [ ] Response contains `pages` array with metadata-only `PageSummary` objects (no `html`, no `markdown`, no `image`, no `video`)
- [ ] Each page summary includes: `id`, `url`, `title`, `content_type`, `has_markdown`, `has_image`, `has_video`, `subdomain`, `created_at`, `updated_at`, `etag`
- [ ] Standalone pages have `subdomain: null`, subdomain pages have the subdomain name
- [ ] Pagination works: `cursor` and `limit` query params, `total` count returned
- [ ] Default limit is 50, max is 200
- [ ] Unsigned GET request returns 401
- [ ] Owner index LMDB database is created and maintained on page save and delete
- [ ] Existing page save/delete operations still update the index correctly
- [ ] All 278 existing tests + new listing tests pass

---

## Step 5: Add pagination to subdomain pages endpoint

**What:** Add cursor-based pagination to `GET /v1/subdomains/{name}/pages`.

**Files changed:**
- `src/routes/subdomains.ts` — update `GET /:name/pages` handler
- `src/services/interfaces.ts` — update `ISubdomainService.listPages()` signature
- `src/services/subdomainService.ts` — implement paginated listing
- `src/docs/agentInstructions.ts` — document pagination params

**Success criteria:**
- [ ] `GET /v1/subdomains/{name}/pages?limit=50&cursor=abc` returns paginated results
- [ ] Response includes `total` count and `next_cursor` (null when no more pages)
- [ ] Default limit is 50, max is 200
- [ ] Backwards compatible — existing calls without pagination params still work (returns first 50)
- [ ] All tests pass

---

## Step 6: Add error codes to all responses

**What:** Add `error_code` field to every error response across all routes.

**Files changed:**
- `src/routes/pages.ts` — replace all `c.json({ error: '...' }, status)` with `errorResponse()`
- `src/routes/subdomains.ts` — same
- `src/routes/keys.ts` — same
- `src/routes/billing.ts` — same
- `src/routes/verify.ts` — same
- `src/routes/adminKeys.ts` — same
- `src/middleware/signedAgent.ts` — same (auth errors)
- `src/middleware/authRateLimit.ts` — same (rate limit errors)
- `src/docs/agentInstructions.ts` — document error codes

**Success criteria:**
- [ ] Every error response includes both `error` (string) and `error_code` (string)
- [ ] Error codes are consistent and match the `ErrorCodes` enum
- [ ] Existing error messages unchanged (backwards compatible — just adding a field)
- [ ] 402 responses still include `plan` and `upgradeUrl` alongside `error_code`
- [ ] All tests pass
- [ ] New test: `src/test/error-codes.test.ts` validates that all error responses include `error_code`

---

## Step 7: Change delete responses from 204 to 200 with body

**What:** Update DELETE endpoints to return 200 with a confirmation body instead of 204 empty.

**Files changed:**
- `src/routes/pages.ts` — change `c.body(null, 204)` to `c.json({ id, deleted: true, deleted_at })`
- `src/routes/subdomains.ts` — same for subdomain delete
- `src/test/api.test.ts` — update delete tests to expect 200 + body
- `src/test/subdomains.test.ts` — update delete tests to expect 200 + body
- `src/docs/agentInstructions.ts` — document new delete response shape

**Success criteria:**
- [ ] `DELETE /v1/pages/:id` returns 200 with `{ id, deleted: true, deleted_at }`
- [ ] `DELETE /v1/subdomains/:name` returns 200 with `{ name, deleted: true, deleted_at }`
- [ ] `deleted_at` is an ISO 8601 timestamp
- [ ] All tests pass (including updated delete tests)

---

## Step 8: Update agent documentation

**What:** Update the agent-facing docs to cover all new features.

**Files changed:**
- `src/docs/agentInstructions.ts` — add listing endpoint docs, pagination docs, error codes reference, delete response docs
- `src/docs/registerInstructions.ts` — no changes expected
- `src/docs/agentSetupInstructions.ts` — no changes expected

**Success criteria:**
- [ ] `GET /.well-known/skill.md` includes docs for listing, pagination, error codes, and delete responses
- [ ] `GET /api/agent` includes the same
- [ ] Error codes table is present in documentation
- [ ] All examples use correct request/response shapes

---

## Step 9: Integration test pass + documentation

**What:** Run full test suite, add integration tests for the new listing endpoint, update CHANGELOG.

**Files changed:**
- `src/test/page-listing.test.ts` — comprehensive tests for the listing endpoint
- `src/test/error-codes.test.ts` — tests for error code presence
- `CHANGELOG.md` — document all changes
- `docs/change-requests/CR-003-code-review-improvements.md` — update status

**Success criteria:**
- [ ] All 278+ tests pass
- [ ] New listing endpoint tests cover: empty list, paginated list, cursor continuation, wrong key, expired key, blocked key
- [ ] Error code tests cover at least 10 different error scenarios
- [ ] CHANGELOG.md has entry for CR-003 with all changes listed
- [ ] `git diff main` shows no unintended changes to existing behavior

---

## Summary

| Step | Description | Key Deliverable |
|------|-------------|----------------|
| 1 | Service context + error codes module | DI plumbing, `ErrorCodes`, `errorResponse()` |
| 2 | Wire pages route | `pages.ts` uses services, zero db imports |
| 3 | Wire remaining routes | All write routes use services |
| 4 | Owner index + listing endpoint | `GET /v1/pages` with pagination |
| 5 | Subdomain pages pagination | `GET /v1/subdomains/{name}/pages?cursor=&limit=` |
| 6 | Error codes everywhere | `error_code` in all responses |
| 7 | Delete response bodies | 200 + `{ id, deleted, deleted_at }` |
| 8 | Update agent docs | skill.md, agent docs endpoint |
| 9 | Integration tests + changelog | Full test pass, CHANGELOG.md |

**Total estimated steps:** 9
**Dependencies:** Steps 1-3 are sequential (each builds on the previous). Steps 4-7 depend on Step 3. Steps 6-7 can be done in parallel after Step 3. Steps 8-9 are final.