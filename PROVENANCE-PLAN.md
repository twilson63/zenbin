# Content Provenance Verification — TDD Implementation Plan

## Issue
GitHub #21 — Cryptographic provenance verification for published content

## Goal
When an agent publishes a page, the signature and public key are stored and exposed on reads, so any consumer can verify who created it.

## Design Decisions
- Store `publishSignature`, `contentDigest`, `publishTimestamp`, `publishNonce`, `publishMethod`, and `publishPath` on the `Page` record
- Add `GET /v1/keys/:keyId/jwk` endpoint to expose public keys
- Add provenance fields to page read responses (JSON and HTML metadata)
- Add `POST /v1/verify` endpoint for programmatic verification
- All new fields are optional — existing pages without signatures still work fine
- No billing interaction — verification is free for all plans

## Phases

### Phase 0: Types & Storage
- [x] Add provenance fields to the `Page` type in `src/storage/db.ts`
- [x] Update `savePage` in `src/storage/db.ts` to persist these fields
- [x] Write tests for signed publish/read verification

### Phase 1: Persist Signature on Publish
- [x] In `src/routes/pages.ts` POST handler, capture signature, digest, timestamp, nonce, method, and path
- [x] Pass them to `savePage` so they're stored on the page record
- [x] Include `signature`, `contentDigest`, `keyId`, `verificationUrl`, `keyUrl`, and canonical fields in the publish response JSON
- [x] Write tests: published pages should have signature and contentDigest in response

### Phase 2: Expose Public Keys
- [x] Add `GET /v1/keys/:keyId/jwk` endpoint that returns the public JWK for a key
- [x] Write tests: returns 200 with JWK for valid keyId, 404 for unknown keyId

### Phase 3: Provenance on Read
- [x] Add provenance fields to page read responses (JSON: `/p/:id` when `Accept: application/json`)
- [x] Add `<meta>` tags and HTTP headers to rendered HTML pages with signature and keyId
- [x] Write tests: GET page returns provenance fields

### Phase 4: Verification Endpoint
- [x] Add `POST /v1/verify` endpoint that takes `keyId`, `content`, `signature`, `contentDigest`, timestamp, nonce, method, and path
- [x] Look up the public key, verify digest and signature against the canonical request
- [x] Return `{ valid: boolean, keyId, verifiedAt }`
- [x] Write tests: signed publish smoke verifies locally and through `/v1/verify`

### Phase 5: Agent Documentation
- [x] Update `/.well-known/agent.md` with provenance documentation
- [x] Update `/.well-known/skill.md` with verification instructions
- [x] Add provenance section to README
- [x] Update installed ZenBin agent skill with artifact verification workflow

## Testing Strategy
- All tests follow existing patterns in `src/test/`
- New test file: `src/test/provenance.test.ts`
- Existing tests must continue passing at every step
- Test backward compatibility: pages published before provenance should still work without signature fields