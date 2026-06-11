/**
 * cap-tree-core — reference implementation of the CAP-Tree v0.3 data model.
 * https://github.com/twilson63/cap-tree
 *
 * VENDORED from twilson63/cap-tree `core/src/` at commit
 * 1967f2a402f453f2adc4251e6a828ed3c1d3eb1b (MIT, Copyright (c) 2026 Tom Wilson).
 * Do not edit these files — replace this directory with the `cap-tree-core` npm
 * package (import specifier unchanged) once it is published. See ./LICENSE.
 */
export { canonicalize, canonicalBytes, toBase64url, fromBase64url, HASH_RE } from './encoding.js';
export {
  sha256, objectHash, blobHash, fingerprint, generateKeyPair,
  signEnvelope, verifyEnvelope,
  type Ed25519Jwk, type SignatureEnvelope, type EnvelopeVerdict,
} from './crypto.js';
export {
  SPEC_VERSION, validateObject, validatePathSegment,
  type ObjectRef, type TreeEntry, type Policy, type TreeRoot, type Tree,
  type Refs, type ReviewRequest, type ReviewResponse, type ReviewOutcome,
  type ChunkManifest, type CapObject,
} from './objects.js';
export {
  verifyObject, verifyRootChain, verifyMerge, verifyRefs,
  type Resolver, type Verdict, type ChainVerdict, type MergeVerdict, type RefsVerdict,
} from './verify.js';
