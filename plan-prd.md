# PRD: CAP-Tree v0.3 HTTP Binding for ZenBin

**Status:** ✅ Implemented (commit `a39d5f7`, branch `feat/cap-tree-v0.3-host`) — see § 11
**Date:** 2026-06-11
**Spec:** https://github.com/twilson63/cap-tree — normative references below are
`data-model.md` (DM §) and `http-binding.md` (HB §) in that repo.
**Showcase / context:** https://zenbin.org/p/cap-tree-v0-3-showcase

## 1. Goal

Make ZenBin the first conformant CAP-Tree v0.3 **host**: content-addressed
object storage, tree read endpoints, refs-chain enforcement, and a discovery
document — alongside (not replacing) the existing v0.2 pages API. When this
ships, the rebuilt zen-vcs client has a live host to push/pull/clone against,
and the HB § 8 conformance criteria can be evaluated against zenbin.org.

**Definition of done:** all acceptance criteria in § 8 pass; the committed
spec test vectors round-trip byte-exactly through the new endpoints; existing
v0.2 tests stay green.

## 2. Non-goals (explicitly out of scope)

- No changes to existing pages/keys/billing/subdomain behavior. v0.2 pages
  and v0.3 objects coexist; nothing is migrated.
- No policy gating of merges. Per HB § 5, the host MUST NOT reject a merge
  root for failing its declared policy — policy is a client-side verdict.
  (Optional advisory annotation is a stretch goal, § 9.)
- No human-facing HTML rendering of tree objects (`/p/...`-style). Later.
- No encrypted blobs, no chunking *enforcement* (chunk manifests are just
  objects; the host stores them like any other).
- No sharding integration (the `src/sharding/` module stays unused for now).
- No npm publish of zen-vcs or client work — this PRD is server-only.

## 3. Dependency: `cap-tree-core`

All canonicalization, hashing, envelope verification, structural validation,
and chain verification MUST come from `cap-tree-core` (the reference library
in the spec repo, `core/`) — do not reimplement any of it in ZenBin.

The package is not on npm yet. Resolution order:

1. **Preferred:** Tom publishes `cap-tree-core@0.3.0` (`cd core && npm publish`
   in the spec repo — it's ready; `prepublishOnly` runs the suite). Then
   `npm install cap-tree-core` here.
2. **Fallback if not published when you start:** vendor it — copy the spec
   repo's `core/src/` into `vendor/cap-tree-core/` with its LICENSE, build it
   with the existing tsconfig, and leave a `// VENDORED from` header noting
   the commit. Swap to the npm package when available.

Key imports you will use: `verifyEnvelope`, `validateObject`, `objectHash`,
`blobHash`, `verifyRootChain`, `verifyRefs`, `canonicalize`, `HASH_RE`, and
the types (`SignatureEnvelope`, `TreeRoot`, `Refs`, `ObjectRef`).

Also copy `test-vectors/vectors.json` from the spec repo into
`src/test/fixtures/cap-tree-vectors.json` (with a header comment naming the
source commit). The integration tests in § 7 are driven by it.

## 4. Storage design

Follow the existing pattern in `src/storage/db.ts` (`initDatabase()` opens
named LMDB instances; key-naming conventions documented at the top).

### 4.1 New LMDB databases

| Instance | Path suffix | Key → Value |
|---|---|---|
| `objectDb` | `{lmdbPath}-objects` | `{hash}` → `StoredObject` |
| `treeIndexDb` | `{lmdbPath}-tree-index` | see § 4.3 |
| `refsDb` | `{lmdbPath}-refs` | see § 4.4 |

### 4.2 StoredObject

```typescript
interface StoredObject {
  hash: string;                       // objectHash or blobHash — also the key
  kind: 'envelope' | 'blob';
  envelope?: SignatureEnvelope;       // kind === 'envelope'
  blobBase64?: string;                // kind === 'blob' (raw bytes, base64)
  objectType?: string;                // payload.type for envelopes
  uploaderKeyId: string;              // ZenBin agent key that published it
  size: number;                       // bytes of canonical/raw content
  created_at: string;                 // ISO 8601 (server clock)
}
```

Objects are **immutable**: a second publish at an existing hash is a no-op
returning the stored record (idempotent, HB § 3.1 step 3). There is no
update or delete path in v0.3.

### 4.3 treeIndexDb keys

Written when a `tree-root` envelope is stored:

- `root:{treeId}:{rootHash}` → `{ parents: string[], timestamp, message }` —
  membership + cheap history metadata. `treeId` is the genesis hash (DM § 3.1);
  for a genesis root, `treeId === rootHash`.
- `rootmeta:{rootHash}` → `{ treeId, ownerFingerprint }` — reverse lookup so
  reviews and refs can resolve which tree a root belongs to.
- `reviewref:{referencedRootHash}:{objectHash}` → `{ objectType, recipient }`
  — written for `review-request` (keyed by `payload.root.hash` and
  `payload.target.hash`) and `review-response` (keyed by `payload.root.hash`),
  powering the `/v1/reviews` query (§ 5.6).

Determining `treeId` on publish: run `verifyRootChain` from cap-tree-core
with a resolver backed by `objectDb` (§ 5.2). The walk both validates the
root and yields `genesisHash` = treeId. Ancestors must already be stored —
publish order is parents-first, which the binding's design already implies
(you cannot reference what doesn't hash-resolve).

### 4.4 refsDb keys

- `head:{treeId}` → `{ seq, hash }` — current chain head.
- `chain:{treeId}:{seq}` (zero-padded to 10 digits for lexicographic order)
  → the stored refs **envelope hash** (the envelope itself lives in
  `objectDb` like every other object).

The full refs history is retained (it's the equivocation-evidence trail).

## 5. Endpoints

New route module: `src/routes/objects.ts` and `src/routes/trees.ts`,
registered in `src/index.ts` alongside the existing `app.route()` calls:

```typescript
app.route('/v1/objects', objects);
app.route('/v1/trees', trees);
app.route('/v1/reviews', reviews);   // may live in trees.ts
```

Add a service following the DI pattern: `IObjectService` in
`src/services/interfaces.ts`, implemented in `src/services/objectService.ts`,
wired in `src/services/container.ts`. Routes stay thin; validation +
storage logic lives in the service.

### 5.1 `POST /v1/objects` — publish

Auth: existing `signedAgent` middleware (`requireSignedAgent`), which already
handles CAP-*/X-Zenbin-* header aliases, the canonical string, timestamp skew
(300 s default), and nonce replay via `nonceDb`. **No new signing code.**
Note this satisfies HB § 2.1 — the request signature (transport auth, any
registered ZenBin key) is distinct from the envelope signature (protocol
authorship); both are checked.

Two content types:

- `application/vnd.cap-tree+json` — body is a signature envelope.
  1. `verifyEnvelope(env)` → 422 `CAP_ENVELOPE_INVALID` on failure.
  2. `validateObject(env.payload)` → 422 `CAP_OBJECT_INVALID` with the
     violation list in the body.
  3. Compute `hash = objectHash(env.payload)`. If stored: return **200**
     with the existing record (idempotent).
  4. Type-specific host validation (§ 5.2). Failures → 422.
  5. Store; write indexes; return **201**
     `{ hash, url: "{baseUrl}/v1/objects/{hash}", received }`.
- `application/octet-stream` — raw blob bytes.
  1. `hash = blobHash(bytes)`; idempotent-200 if present.
  2. Enforce `config.capTree.maxObjectBytes` → 413 `OBJECT_TOO_LARGE`.
  3. Store as `kind: 'blob'`; return 201.

Size limit: add `capTree.maxObjectBytes` to `src/config.ts` (env
`CAP_TREE_MAX_OBJECT_BYTES`, default `10485760`). Applies to both kinds
(canonical bytes length for envelopes).

Billing: count each **201** (not idempotent 200s) against the key's monthly
quota via the existing `reservePageQuota`/`releasePageQuota` mechanism —
objects consume page quota 1:1 for now. Per HB § 7, quota exhaustion is a
plain 402/429; it MUST NOT vary by object type or content.

### 5.2 Host-side validation (HB § 5) — the heart of this PRD

For `tree-root` envelopes:

1. Build a resolver over `objectDb`:
   `const resolve = async (ref) => objectDb lookup → stored envelope ?? null`.
2. **Genesis** (`parents: []`): require `env.signerFingerprint ===
   payload.ownerFingerprint` (422 `CAP_OWNER_MISMATCH`). treeId = its hash.
3. **Non-genesis:** run `verifyRootChain(env, candidateTreeId, resolve)`
   where `candidateTreeId` comes from `rootmeta:{parents[0].hash}` (422
   `CAP_PARENT_UNKNOWN` if the first parent isn't a stored, indexed root).
   A failed chain verdict → 422 `CAP_CHAIN_INVALID` with `verdict.errors`.
   This single call covers: parents resolvable **and** hash-verified, owner
   signing (including § 7.2 key rotation), and structural integrity of every
   ancestor — do not re-derive any of it by hand.
4. **Entry refs are NOT required to resolve** at publish time (DM allows
   trees referencing blobs the host hasn't seen; clients verify on fetch).
   Do not validate entry existence — only entry *format* (already covered
   by `validateObject`).
5. **Merge roots:** validated exactly like any root. Do NOT evaluate policy
   (HB § 5: "MUST NOT reject a merge root solely for failing the declared
   policy").

For `refs` envelopes:

1. Resolve `treeId` — must have a stored genesis (`root:{treeId}:{treeId}`
   exists) → 422 `CAP_TREE_UNKNOWN`.
2. Owner check: every branch/tag target must be a stored root of this tree
   (`rootmeta` lookup) → 422 `CAP_REF_TARGET_UNKNOWN`; the refs envelope
   signer must equal the tree's current owner. Determine current owner via
   `verifyRootChain` on the `branches.main` target (or any target) — its
   verified tip owner is authoritative. Mismatch → 403 `CAP_NOT_OWNER`.
3. Chain extension: read `head:{treeId}`.
   - No head: require `seq === 1 && prev === null`, else 409 `CAP_REFS_CONFLICT`.
   - Head `{seq: n, hash: h}`: require `seq === n + 1 && prev === h`, else
     **409** `CAP_REFS_CONFLICT` with `{ currentSeq: n, currentHash: h }` in
     the body (the client needs this to recover — it's the
     `--force-with-lease` handshake).
4. Store envelope in `objectDb`, write `chain:` entry, advance `head:`.
   These writes MUST be atomic (single LMDB transaction —
   `db.transaction(() => …)` per the lmdb package API) so a concurrent
   publish can't fork the chain.

For `review-request` / `review-response` / `tree` / `chunks`: structural
validation only (already done), plus `reviewref:` index writes for review
types. No authorization beyond a valid envelope — HB § 6 allows anyone to
publish review messages; whether they *count* is policy, i.e. not ours.

### 5.3 `GET /v1/objects/{hash}` — retrieve

Unauthenticated (HB § 2.1: reads are open). 404 `OBJECT_NOT_FOUND` on miss.

- Envelope: `Content-Type: application/vnd.cap-tree+json`, body is the
  stored envelope **exactly as stored** (clients re-hash what they receive —
  do not re-serialize through any transform that could reorder keys; store
  and return the raw canonical-envelope JSON string).
- Blob: `Content-Type: application/octet-stream`, raw bytes.
- Send `ETag: "{hash}"` and `Cache-Control: public, max-age=31536000, immutable`
  — content addressing makes this safe and is a free CDN win.

### 5.4 Tree read endpoints (HB § 4)

All unauthenticated, all returning full ObjectRefs (`{id?, hash}`) so every
hop is client-verifiable. All are derivable from `objectDb` + indexes.

- `GET /v1/trees/{treeId}` and `GET /v1/trees/{treeId}/refs` — current refs
  envelope (via `head:` → `chain:` → `objectDb`). 404 `CAP_TREE_UNKNOWN` /
  404 `REFS_NOT_FOUND` if no refs published yet.
- `GET /v1/trees/{treeId}/refs/history?since={seq}&limit={n}` — refs
  envelopes newest-first from the `chain:` index. Cursor = seq. Default
  limit 20, max 100 (mirror `listPagesByOwner` conventions).
- `GET /v1/trees/{treeId}/roots/{rootHash}` — the root envelope, 404 if not
  a member of this tree (check `root:{treeId}:{rootHash}`).
- `GET /v1/trees/{treeId}/roots/{rootHash}/history?limit={n}` — ancestor
  walk: BFS over `parents` via stored envelopes, newest-first, returning
  `{ roots: [{ hash, parents, message, timestamp, entryCount }], next_cursor }`.
- `GET /v1/trees/{treeId}/resolve?root={rootHash}&path=a/b/c` — split path
  on `/`, walk subtree entries (fetch each `tree` object by hash), return
  the terminal entry's `{ path, kind, ref }`. 404 `PATH_NOT_FOUND` on a miss
  or on traversal through a `blob`.

### 5.5 Discovery (HB § 1)

Add to `src/routes/wellKnown.ts`:

```
GET /.well-known/cap-tree.json
```

```json
{
  "protocol": "cap-tree",
  "specVersion": 3,
  "endpoints": { "objects": "/v1/objects", "trees": "/v1/trees", "keys": "/v1/keys" },
  "maxObjectBytes": <config.capTree.maxObjectBytes>,
  "operator": "ZenBin (zenbin.org)"
}
```

Use `config.baseUrl` only for docs; the endpoint paths are relative per the
binding. Also append a short CAP-Tree v0.3 section to the agent docs
templates in `src/docs/agentInstructions.ts` (skill.md) pointing at the
discovery doc and the spec repo.

### 5.6 `GET /v1/reviews` (HB § 4 query)

Query params: `tree` (required), `type` (`review-request` | `review-response`),
`recipient` (fingerprint), `outcome`, `root` (rootHash), `limit`, `cursor`.
Implementation: iterate `reviewref:{rootHash}:` for each root of the tree —
or, when `root=` is given, just that prefix — then filter by the remaining
params against stored envelopes. Returns `{ reviews: [envelope...],
next_cursor }`. Keep it simple; this is a convenience index, not a search
engine (HB § 4: "hosts provide them as indexes").

## 6. Errors

Extend `src/errors.ts` ErrorCodes (keep the established
`{ error, error_code }` shape and `errorResponse()` builder):

`CAP_ENVELOPE_INVALID` (422), `CAP_OBJECT_INVALID` (422),
`CAP_OWNER_MISMATCH` (422), `CAP_PARENT_UNKNOWN` (422),
`CAP_CHAIN_INVALID` (422), `CAP_TREE_UNKNOWN` (404),
`CAP_REF_TARGET_UNKNOWN` (422), `CAP_NOT_OWNER` (403),
`CAP_REFS_CONFLICT` (409), `OBJECT_NOT_FOUND` (404),
`OBJECT_TOO_LARGE` (413), `REFS_NOT_FOUND` (404), `PATH_NOT_FOUND` (404).

422 bodies for validation failures MUST include an `errors: string[]` array
carrying the verdict/violation messages from cap-tree-core — clients debug
against these.

## 7. Tests

Follow the conventions in `src/test/cap-attestation.test.ts` (vitest,
`initDatabase()` in beforeAll, `createTestSigner` + `jsonCapSignedRequest`
helpers from `src/test/helpers/signing.ts`, enterprise plan to bypass
billing, unique IDs per test).

New files:

1. **`src/test/cap-tree-objects.test.ts`** — publish/retrieve:
   - Every envelope in `fixtures/cap-tree-vectors.json` publishes (201) in
     dependency order: genesisRoot → secondRoot → featureRoot →
     reviewRequest → reviewResponse → mergeRoot → refsSeq1 → refsSeq2.
   - Re-publishing any → 200 with identical record (idempotency).
   - `GET /v1/objects/{hash}` returns bytes that re-hash to the address
     (assert via cap-tree-core `objectHash`/`blobHash`, not string compare).
   - Blob publish + retrieve round-trips the vector blob.
   - Tampered envelope (mutate `message`) → 422 `CAP_ENVELOPE_INVALID`.
   - Root with unknown parent → 422 `CAP_PARENT_UNKNOWN`.
   - Root signed by a non-owner key (sign with a second test signer's
     protocol key) → 422 `CAP_CHAIN_INVALID`.
   - Oversize blob → 413.
   - Merge root **without** approvals (policy-violating but valid) →
     **201**. This is the "host MUST NOT police policy" regression test.
2. **`src/test/cap-tree-refs.test.ts`** — chain enforcement:
   - seq 1 → 201; seq 2 with correct prev → 201; head advances.
   - seq 2 replayed → 200 (idempotent, same hash).
   - Conflicting seq 2 (different branches, valid signature) → 409 with
     `currentSeq`/`currentHash` in body.
   - seq gap (1 → 3) → 409.
   - Refs signed by non-owner → 403 `CAP_NOT_OWNER`.
   - `refs/history` returns the chain newest-first.
3. **`src/test/cap-tree-reads.test.ts`** — tree endpoints + discovery:
   - roots/{hash}, roots history walk, resolve?path= through the vector
     subtree (`docs/README.md`), reviews query by tree/type/outcome,
   - `/.well-known/cap-tree.json` shape matches HB § 1.
4. **Lifecycle test (`src/test/cap-tree-lifecycle.test.ts`)** — the HB § 8
   criterion, in-process: using cap-tree-core's `generateKeyPair` +
   `signEnvelope`, create a fresh tree (genesis → 3 commits → branch →
   review request → approval from a second keypair → merge → refs updates),
   publish everything through the API, then "clone": fetch refs → walk →
   verify with `verifyRootChain`/`verifyMerge`/`verifyRefs` against only
   what the API returned. This test doubles as the conformance-suite seed.

Existing test suites MUST stay green (`npx vitest run`).

## 8. Acceptance criteria

1. All four new test files pass; full suite green; `npm run typecheck` clean.
2. All 8 vector envelopes + the vector blob round-trip byte-exactly and are
   served at their vector-stated hashes (HB § 8 criterion 2).
3. Publish is idempotent; objects are immutable (no path mutates a stored
   object).
4. Refs chain: out-of-order/conflicting seq rejected with 409 + recovery
   info; chain writes atomic; full history retrievable.
5. A policy-violating merge is accepted (201) — with a test proving it.
6. GET endpoints work unauthenticated; POST requires a valid signed request
   from a registered key with replay protection (existing middleware).
7. `/.well-known/cap-tree.json` served and accurate.
8. No regression in v0.2 endpoints (full existing suite green).
9. No new runtime dependency other than `cap-tree-core` (or its vendored
   copy).

## 9. Stretch goals (do not block on these)

- Advisory policy annotation on root reads: `"policyEvaluation"` field
  computed via cap-tree-core `verifyMerge`, clearly marked advisory (HB § 5
  allows it; clients must not rely on it).
- `HEAD /v1/objects/{hash}` for cheap existence checks.
- Per-uploader object listing (`GET /v1/objects?uploader=me`) mirroring the
  pages owner index.

## 10. Sequencing for the implementing agent

1. Dependency in place (§ 3) + fixtures copied.
2. Storage (§ 4): db.ts additions, types, objectService + interfaces +
   container wiring. Unit-testable without routes.
3. `POST/GET /v1/objects` with envelope/blob handling + § 5.2 validation.
   Land cap-tree-objects.test.ts here.
4. Refs enforcement + cap-tree-refs.test.ts.
5. Tree reads + reviews + discovery + cap-tree-reads.test.ts.
6. Lifecycle test, docs template updates, typecheck/lint pass.

Each step leaves the repo green; commit per step.

## 11. Progress (updated 2026-06-11)

Implementation complete and verified in commit `a39d5f7` on
`feat/cap-tree-v0.3-host`. Re-verified today: **429/429 tests pass (27
files)** and `npm run typecheck` is clean.

### Sequencing (§ 10) — all done

| Step | Status | Notes |
|---|---|---|
| 1. Dependency + fixtures | ✅ | Vendored (§ 3 fallback) into `src/vendor/cap-tree-core/` — package was not on npm. Vectors at `src/test/fixtures/cap-tree-vectors.json`. |
| 2. Storage | ✅ | Landed as a dedicated module `src/storage/capTreeDb.ts` (objects / tree-index / refs envs) rather than additions inside `db.ts`; refs head advance uses an atomic `transactionSync`. |
| 3. `POST/GET /v1/objects` + § 5.2 validation | ✅ | `src/routes/objects.ts`, `src/services/objectService.ts`; `cap-tree-objects.test.ts`. |
| 4. Refs enforcement | ✅ | 409 conflict carries `currentSeq`/`currentHash`; `cap-tree-refs.test.ts`. |
| 5. Tree reads + reviews + discovery | ✅ | `src/routes/trees.ts`, `/.well-known/cap-tree.json`; `cap-tree-reads.test.ts`. |
| 6. Lifecycle test + docs + typecheck | ✅ | `cap-tree-lifecycle.test.ts` (build → publish → clone → verify, API-only resolver); agent docs updated in `src/docs/agentInstructions.ts`. |

### Acceptance criteria (§ 8) — all met

1. ✅ Four new test files pass; full suite green (429/429); typecheck clean.
2. ✅ All 8 vector envelopes + vector blob round-trip byte-exactly at their
   stated hashes.
3. ✅ Publish idempotent (re-publish → 200, identical record); no mutation path.
4. ✅ Refs conflicts/gaps → 409 with recovery info; atomic writes; full history.
5. ✅ Policy-violating merge accepted (201) — regression test in place.
6. ✅ Reads open; publishes require signed requests via existing middleware.
7. ✅ Discovery doc served and accurate.
8. ✅ v0.2 suite unchanged and green.
9. ✅ No new runtime dependency (cap-tree-core is vendored).

### Deviations from plan

- cap-tree-core was **vendored** (`src/vendor/cap-tree-core/`, MIT, with
  source-commit header) per the § 3 fallback — swap to the npm package once
  `cap-tree-core@0.3.0` is published. `tsconfig` gained `DOM` in `lib` for
  WebCrypto types.
- New storage lives in `src/storage/capTreeDb.ts` instead of extending
  `db.ts` directly (`db.ts` only gained init wiring).
- Test keypair fixtures added (`cap-tree-keypair-owner.json`,
  `cap-tree-keypair-reviewer.json`); `setup.ts` now cleans the
  content-addressed envs between files so fixed-hash objects don't leak.

### Open items

- § 9 stretch goals not implemented (by design — non-blocking): advisory
  `policyEvaluation` annotation, `HEAD /v1/objects/{hash}`, per-uploader
  listing.
- Swap vendored copy for `cap-tree-core@0.3.0` from npm when published.
- HB § 8 conformance evaluation against the deployed zenbin.org (post-deploy).
