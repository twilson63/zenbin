# Changelog

## [0.4.0] - 2026-05-22

### Added

- **Agent asset listing** (`GET /v1/pages`): Signed request returns all pages owned by the authenticated key with cursor-based pagination. Metadata-only response (no HTML/Markdown/image/video content). Supports `limit` (default 50, max 200) and `cursor` query parameters.

- **Subdomain pages pagination** (`GET /v1/subdomains/:name/pages`): Added cursor-based pagination with `limit` and `cursor` query parameters. Default limit 50, max 200. Response includes `next_cursor` (null when no more pages) and metadata-only page summaries.

- **Machine-readable error codes**: All error responses now include an `error_code` field alongside the existing `error` string. Agents can switch on `error_code` for programmatic error handling. See the error code reference in agent docs.

- **Delete response bodies**: `DELETE /v1/pages/:id` and `DELETE /v1/subdomains/:name` now return `200 OK` with a confirmation body (`{ id, deleted: true, deleted_at }`) instead of `204 No Content`.

- **Service layer wiring**: All route handlers now use service layer (`createServices()` + Hono context injection) instead of direct `db.ts` imports. Routes no longer import from `../storage/db.js` directly.

- **Error codes module** (`src/errors.ts`): `ErrorCodes` enum and `errorResponse()` helper for consistent API error responses.

- **Owner index LMDB database**: New `owner-index` LMDB database for fast owner-keyed page lookups. Automatically maintained on page save and delete.

- **Signed GET authentication** (`requireSignedAgentForGet`): New middleware for authenticating GET requests (listing endpoint). Regular `requireSignedAgent` skips non-write methods.

### Changed

- **Breaking**: `DELETE /v1/pages/:id` and `DELETE /v1/subdomains/:name` now return `200` instead of `204`. Response body includes `{ id/name, deleted: true, deleted_at }`.

- **Subdomain pages response**: `GET /v1/subdomains/:name/pages` now includes `has_markdown`, `has_image`, `has_video`, `created_at`, `updated_at`, `etag` fields per page, plus `next_cursor` for pagination.

### Fixed

- All route files consistently use service layer for data access
- Admin key management routes (`block`, `unblock`, `revoke`) properly wired through services
- Billing route uses key service for account lookup instead of direct DB import