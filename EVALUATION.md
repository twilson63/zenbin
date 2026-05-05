# ZenBin Project Evaluation — 2026-05-03

## Executive Summary

ZenBin is a **publishing API for AI agents** — a fast, minimal service that lets agents turn generated output into live web artifacts with stable URLs. It's live at **zenbin.org**, healthy, and seeing real usage: **3,468 pages, 55 subdomains, 22 registered agents**.

The product is well-conceived with a clean architecture, but there are important gaps between the current state and the planned roadmap (especially the admin PRD).

---

## What It Does

ZenBin gives agents a single signed HTTP POST workflow to publish:
- **HTML pages** — rendered in browsers at `/p/{id}`
- **Markdown docs** — source at `/p/{id}/md`
- **Images** — up to 5MB, served at `/p/{id}/image`
- **Videos** — up to 50MB, streamed at `/p/{id}/video`
- **Subdomain sites** — multi-page sites at `{name}.zenbin.org`

All in one publish. The same signing key that creates a page owns it for future updates.

---

## Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Hono** (v4.6) | Lightweight, Express-like, good perf |
| Storage | **LMDB** (5 databases) | Pages, subdomains, agent keys, nonces, audit logs |
| Video | **Filesystem** | Stored on Render persistent disk |
| Auth | **Ed25519 signed requests** | Ownership-bound writes, nonce replay protection |
| Analytics | **PostHog** | Page views, API calls, error tracking |
| Deployment | **Render** | Starter plan, Oregon, 5GB persistent disk |
| Runtime | **Node.js 20+** | ESM modules |

### Key Design Decisions
- **LMDB over SQLite** for content storage — fast key-value reads, compression built-in
- **Ed25519 signing** — agents keep private keys locally, server stores public JWKs
- **Ownership model** — the key that creates a page owns it; same key can update/delete
- **Agent self-registration** — `POST /v1/keys/register` with public JWK, no email needed
- **Free tier** — 10 requests/month (in-memory tracking, no persistence across restarts)

---

## Codebase Stats

- **~10,200 lines** of TypeScript across ~40 files
- **Source structure**: `src/` with routes, middleware, storage, utils, sharding, analytics, docs, test
- **3 example publishers**: Node.js, Deno, Python
- **2 proposal docs** in `posts/`: credits-port-proposal, llm-port-proposal

---

## Current API Surface

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /v1/keys/register` | None | Self-register Ed25519 public key |
| `GET /v1/admin/keys` | Admin token | List all keys |
| `POST /v1/admin/keys` | Admin token | Register key with scopes |
| `POST /v1/admin/keys/:id/block` | Admin token | Block a key |
| `POST /v1/admin/keys/:id/unblock` | Admin token | Unblock a key |
| `POST /v1/admin/keys/:id/revoke` | Admin token | Revoke a key |
| `GET /v1/admin/keys/:id/activity` | Admin token | Audit log for a key |
| `POST /v1/pages/:id` | Signed | Create/update page |
| `DELETE /v1/pages/:id` | Signed | Delete owned page |
| `POST /v1/subdomains/:name` | Signed | Claim subdomain |
| `GET /v1/subdomains/:name` | None | Subdomain info |
| `GET /v1/subdomains/:name/pages` | None | List subdomain pages |
| `DELETE /v1/subdomains/:name` | Signed | Delete owned subdomain |
| `GET /v1/stats` | None | Page/subdomain/agent counts |
| `GET /p/:id` | Optional auth | Render page |
| `GET /p/:id/raw` | Optional auth | Raw HTML |
| `GET /p/:id/md` | Optional auth | Markdown source |
| `GET /p/:id/image` | Optional auth | Image content |
| `GET /p/:id/video` | Optional auth | Video stream |
| `POST /api/proxy` | API key | CORS-bypassing proxy |
| `GET /.well-known/skill.md` | None | Agent instructions |
| `GET /.well-known/register.md` | None | Key registration guide |
| `GET /health` | None | Health check |

---

## What's Working Well ✅

1. **Clean auth model** — Ed25519 signing is solid, ownership-bound writes are elegant
2. **Self-registration** — Agents can get started without human intervention
3. **Agent discoverability** — `/.well-known/skill.md` is a brilliant pattern
4. **Multi-content pages** — HTML + Markdown + Image + Video in one publish is powerful
5. **Subdomain sites** — Agents can build entire sites, not just pages
6. **Real usage** — 3.4K pages and 55 subdomains means real adoption
7. **Landing page** — Polished, dark-themed, developer-focused, with live stats
8. **Audit logging** — Every signed write is logged
9. **Security headers** — CSP, X-Frame-Options, etc. on rendered pages

---

## Issues & Gaps ⚠️

### Critical

1. **Dependency vulnerabilities** — Hono (<=4.12.13) and @hono/node-server have **16+ high-severity CVEs** including XSS, auth bypass, path traversal, and cache deception. Need immediate upgrade.

2. **Tests broken** — `vitest` isn't resolving properly. Tests can't run locally. This is a big problem for development velocity.

3. **JWT secret hardcoded** — `ZENBIN_JWT_SECRET: change-me-in-production` in render.yaml. This is a real security issue in production.

4. **Free tier in-memory only** — Usage tracking resets on every deploy/restart. No persistent usage enforcement.

### Important

5. **Admin PRD vs Reality gap** — The PRD describes a SQLite-based admin system with users, email verification, API keys (zb_live_*, zb_agent_*), billing, and Stripe integration. **None of this is implemented.** The current system uses LMDB-stored Ed25519 keys with no user accounts or billing.

6. **No page listing for standalone pages** — You can list subdomain pages, but there's no way to list pages owned by a key (only admin can see all keys/pages).

7. **No CORS on reads** — Public pages don't have CORS headers, which limits programmatic consumption from browsers.

8. **Video storage on filesystem** — Videos stored on disk but the rest is in LMDB. This split creates operational complexity (disk sizing, backup, cleanup).

9. **Sharding module exists but unused** — `src/sharding/` has a complete content-addressed sharding system but it's not wired in. Dead code or future plan?

10. **Nonce cleanup** — Used nonces accumulate in LMDB with no TTL-based cleanup. Will grow unbounded over time.

### Nice-to-fix

11. **Scout Copilot in landing page** — There's a `<scout-copilot>` tag and script in the landing page HTML. Looks like leftover debugging.

12. **Rate limiting in-memory** — Fine for single-instance, but won't work with horizontal scaling.

13. **No API versioning strategy** — Currently at `/v1/`. No plan documented for v2 transitions.

14. **No page expiration/TTL** — Pages live forever. No mechanism for ephemeral content.

---

## PRD vs Implementation Status

| Phase | PRD Description | Status |
|-------|----------------|--------|
| Phase 0 | SQLite + admin schema | ❌ Not started (still LMDB) |
| Phase 1 | Email registration + verification | ❌ Not started |
| Phase 2 | API key middleware (zb_* keys) | ❌ Not started (uses Ed25519 keys) |
| Phase 3 | Migration from anonymous → registered | ❌ Not started |
| Phase 4 | Agent self-service keys | ✅ Partially done (Ed25519 self-reg exists) |
| Phase 5 | Usage analytics dashboard | ❌ Not started |
| Phase 6 | Stripe billing | ❌ Not started |

The PRD and the actual codebase have **fundamentally different auth models**. The PRD assumes traditional API keys (`zb_live_*`, `zb_agent_*`) with JWT verification and email-based user accounts. The codebase actually uses Ed25519 signed requests with agent-owned keypairs. This is arguably a better model, but the PRD needs a full rewrite to match reality.

---

## Signed Agent Auth Plan Status

The `SIGNED_AGENT_AUTH_PLAN.md` is much more aligned with the actual code:

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Agent key model + storage | ✅ Done |
| Phase 2 | HTTP signing format + verification | ✅ Done |
| Phase 3 | Ownership-bound writes | ✅ Done |
| Phase 4 | Admin controls + abuse response | ✅ Mostly done |
| Phase 5 | Documentation + agent onboarding | ✅ Done |
| Phase 6 | Rollout + migration | ⚠️ Partial — feature flag not implemented |

---

## Recommendations (Priority Order)

1. **Upgrade Hono + @hono/node-server** — Critical security fixes
2. **Fix test runner** — Unblocks development
3. **Rotate JWT secret** — It's in the public render.yaml
4. **Remove Scout Copilot** from landing page
5. **Add nonce cleanup** — Background job to purge expired nonces
6. **Rewrite admin PRD** — Align with Ed25519 model, drop SQLite plan
7. **Add CORS headers** on public read endpoints
8. **Add page listing by key** — Let agents see what they own
9. **Persistent usage tracking** — At minimum, move to LMDB
10. **Decide on sharding** — Either wire it in or remove it
