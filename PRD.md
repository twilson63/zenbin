# ZenBin — Product Requirements Document (PRD)

## Summary
ZenBin is a **headless HTML sandbox**: a simple web service + API that lets anyone **publish an HTML document to an ID**, then view it later at a predictable URL path. ZenBin is optimized for *fast sharing, demos, prototypes, and lightweight hosting of single-page HTML documents*.

## Goals
- Provide a dead-simple API to **store HTML by ID**.
- Provide a dead-simple web path to **render HTML by ID** in a browser.
- Provide a raw fetch path to **retrieve the original HTML**.
- Make rendering **safe by default** (sandboxed, restrictive headers).

## Non-Goals
- Full website hosting (multi-file sites, assets, CDN pipelines).
- Server-side code execution.
- User accounts, billing, or complex permissions (v1).
- WYSIWYG editor UI (API-first / headless).

## Users & Use Cases
- Developers sharing a repro/demo page with a stable URL.
- AI/agent workflows producing HTML output and publishing it.
- Teams sharing quick internal prototypes.
- Event pages, “single-file” landing pages, receipts, reports.

## Core Concepts
- **Page ID**: a unique identifier used as the storage key and URL path segment.
- **HTML Document**: a single HTML payload stored and later served.
- **Sandboxed Rendering**: HTML is served with security headers that restrict active content and exfiltration.

## API Requirements (v1)

### 1) Create or Replace a Page
**Endpoint**
- `POST /v1/pages/{id}`

**Request**
- Content-Type: `application/json`
- Body includes HTML and optional metadata.
- HTML MAY be Base64-encoded to reduce escaping issues.

Example body:
```json
{
  "encoding": "utf-8",
  "content_type": "text/html; charset=utf-8",
  "html": "<!doctype html><html><body>Hello</body></html>",
  "title": "Hello Page"
}
```

Base64 variant:
```json
{
  "encoding": "base64",
  "content_type": "text/html; charset=utf-8",
  "html": "PCFkb2N0eXBlIGh0bWw+PGh0bWw+PGJvZHk+SGVsbG88L2JvZHk+PC9odG1sPg=="
}
```

**Responses**
- `201 Created` when new
- `200 OK` when replaced
- Response includes canonical view URLs

Example response:
```json
{
  "id": "my-demo",
  "url": "https://zenben.example/p/my-demo",
  "raw_url": "https://zenben.example/p/my-demo/raw",
  "etag": "\"<opaque>\""
}
```

**Constraints**
- Max HTML payload size (configurable): e.g. 256KB–1MB
- Allowed ID charset: `[A-Za-z0-9._-]` (no slashes)
- Overwrite behavior: allowed by default (v1), optional protection via signature token (future)

---

### 2) Render a Page (Browser View)
**Endpoint**
- `GET /p/{id}`

**Behavior**
- Returns `200 OK` with `Content-Type: text/html; charset=utf-8`
- Browser renders the stored HTML

**Required Security Headers (safe by default)**
- `Content-Security-Policy`: restrictive default (no external network by default unless configured)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Cross-Origin-Opener-Policy: same-origin` (or a deliberate alternative)
- `Cross-Origin-Resource-Policy: same-site` (or a deliberate alternative)

**Caching**
- Provide `ETag`
- Support `If-None-Match` returning `304 Not Modified`

---

### 3) Fetch Raw HTML
**Endpoint**
- `GET /p/{id}/raw`

**Behavior**
- Returns the stored HTML without rendering UI chrome
- Suggested headers:
  - `Content-Type: text/plain; charset=utf-8` (or `text/html` if preferred)
  - `Content-Disposition: inline; filename="{id}.html"`

---

## Operational Requirements
- **Availability**: basic production-grade uptime for a small web service.
- **Rate Limits**: protect against abuse (per-IP and/or per-key in future).
- **Abuse Controls**: payload size limit, ID validation, request throttling.
- **Storage**: durable object store or KV store keyed by `id`.

## Data Model (Minimal)
- `id` (string, primary key)
- `html` (string/blob)
- `encoding` (`utf-8` | `base64`)
- `content_type` (string)
- `title` (optional string)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `etag` (string/hash)

## UX Notes (Headless)
- ZenBen has **no required UI**.
- The `/p/{id}` route is the “product surface” in the browser.
- The `/p/{id}/raw` route supports tooling and downloads.

## Success Metrics
- Time from `POST` to viewable URL < 1s (p50)
- Successful render rate (2xx) > 99%
- Low abuse incidents / stable rate limiting
- Simple integration: a single curl command works

## Open Questions / Future Enhancements
- Optional auth (API keys) and per-tenant namespaces
- Signed writes to prevent overwrites (HMAC)
- TTL / expiration (`ttl_seconds`)
- Versions/history (`/p/{id}/v/{n}`)
- Asset bundling (multi-file) and import maps (v2+)
