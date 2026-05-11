# Content Provenance Verification — TDD Implementation Plan

## Issue
GitHub #21 — Cryptographic provenance verification for published content

## Goal
When an agent publishes a page, the signature and public key are stored and exposed on reads, so any consumer can verify who created it.

## Design Decisions
- Store `publishSignature` and `contentDigest` on the `Page` record (both are already computed at publish time — just persist them)
- Add `GET /v1/keys/:keyId/jwk` endpoint to expose public keys
- Add provenance fields to page read responses (JSON and HTML metadata)
- Add `POST /v1/verify` endpoint for programmatic verification
- All new fields are optional — existing pages without signatures still work fine
- No billing interaction — verification is free for all plans

## Phases

### Phase 0: Types & Storage
- [ ] Add `publishSignature` and `contentDigest` to `Page` type in `src/types.ts`
- [ ] Update `savePage` in `src/storage/db.ts` to persist these fields
- [ ] Write tests for new Page fields (backward compat — undefined values)

### Phase 1: Persist Signature on Publish
- [ ] In `src/routes/pages.ts` POST handler, capture `X-Zenbin-Signature` and `Content-Digest` headers
- [ ] Pass them to `savePage` so they're stored on the page record
- [ ] Include `signature`, `contentDigest`, `keyId`, and `verificationUrl` in the publish response JSON
- [ ] Write tests: published pages should have signature and contentDigest in response

### Phase 2: Expose Public Keys
- [ ] Add `GET /v1/keys/:keyId/jwk` endpoint that returns the public JWK for a key
- [ ] Write tests: returns 200 with JWK for valid keyId, 404 for unknown keyId

### Phase 3: Provenance on Read
- [ ] Add provenance fields to page read responses (JSON: `/p/:id` when `Accept: application/json`)
- [ ] Add `<meta>` tags to rendered HTML pages with signature and keyId
- [ ] Write tests: GET page returns provenance fields

### Phase 4: Verification Endpoint
- [ ] Add `POST /v1/verify` endpoint that takes `keyId`, `content`, `signature`, and optionally `contentDigest`
- [ ] Look up the public key, verify the signature against the content
- [ ] Return `{ valid: boolean, keyId, verifiedAt }`
- [ ] Write tests: valid signature, invalid signature, unknown keyId

### Phase 5: Agent Documentation
- [ ] Update `/.well-known/agent.md` with provenance documentation
- [ ] Update `/.well-known/skill.md` with verification instructions
- [ ] Add provenance section to README

## Testing Strategy
- All tests follow existing patterns in `src/test/`
- New test file: `src/test/provenance.test.ts`
- Existing tests must continue passing at every step
- Test backward compatibility: pages published before provenance should still work without signature fields