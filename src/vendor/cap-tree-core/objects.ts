/**
 * CAP-Tree v0.3 object types and structural validation (data-model § 3–§ 5).
 * Structural validation is § 6.1 step 3 — it checks shape, not signatures
 * or chains; those live in verify.ts.
 */
import { HASH_RE } from './encoding.js';

export const SPEC_VERSION = 3;

export interface ObjectRef {
  id?: string;
  hash: string;
}

export interface TreeEntry {
  path: string;
  kind: 'blob' | 'tree';
  ref: ObjectRef;
}

export interface Policy {
  requiredApprovals: number;
  reviewers: string[];
  selfReview: boolean;
}

export interface TreeRoot {
  type: 'tree-root';
  specVersion: number;
  ownerFingerprint: string;
  adminFingerprints: string[];
  entries: TreeEntry[];
  parents: ObjectRef[];
  policy: Policy | null;
  approvals: ObjectRef[];
  message: string;
  timestamp: string;
  rotateTo?: string;
}

export interface Tree {
  type: 'tree';
  specVersion: number;
  entries: TreeEntry[];
}

export interface Refs {
  type: 'refs';
  specVersion: number;
  treeId: string;
  seq: number;
  prev: string | null;
  branches: Record<string, ObjectRef>;
  tags: Record<string, ObjectRef>;
  timestamp: string;
}

export interface ReviewRequest {
  type: 'review-request';
  specVersion: number;
  root: ObjectRef;
  target: ObjectRef;
  authorFingerprint: string;
  reviewerFingerprint: string;
  message: string;
  timestamp: string;
}

export type ReviewOutcome = 'approved' | 'changes-requested' | 'commented';

export interface ReviewResponse {
  type: 'review-response';
  specVersion: number;
  request: ObjectRef;
  root: ObjectRef;
  outcome: ReviewOutcome;
  reviewerFingerprint: string;
  message: string;
  timestamp: string;
}

export interface ChunkManifest {
  type: 'chunks';
  specVersion: number;
  totalBytes: number;
  chunks: ObjectRef[];
}

export type CapObject = TreeRoot | Tree | Refs | ReviewRequest | ReviewResponse | ChunkManifest;

// --- Path rules (data-model § 4) ---

/**
 * Validate a single path segment. Returns the NFC-normalized segment.
 * Throws on violation — materializing clients treat these as errors,
 * never warnings (path-traversal defense).
 */
export function validatePathSegment(segment: string): string {
  const nfc = segment.normalize('NFC');
  if (nfc.length === 0) throw new Error('path segment must not be empty');
  if (nfc === '.' || nfc === '..') throw new Error(`path segment must not be "${nfc}"`);
  if (/[\/\\\u0000]/.test(nfc)) throw new Error('path segment must not contain "/", "\\\\", or NUL');
  if (new TextEncoder().encode(nfc).length > 255) throw new Error('path segment exceeds 255 bytes');
  return nfc;
}

const enc = new TextEncoder();
function utf8Compare(a: string, b: string): number {
  const ab = enc.encode(a), bb = enc.encode(b);
  const n = Math.min(ab.length, bb.length);
  for (let i = 0; i < n; i++) {
    const d = ab[i]! - bb[i]!;
    if (d !== 0) return d;
  }
  return ab.length - bb.length;
}

// --- Structural validation ---

function isFingerprint(s: unknown): s is string {
  return typeof s === 'string' && HASH_RE.test(s);
}
function isRef(r: unknown): r is ObjectRef {
  return (
    typeof r === 'object' && r !== null &&
    isFingerprint((r as ObjectRef).hash) &&
    ((r as ObjectRef).id === undefined || typeof (r as ObjectRef).id === 'string')
  );
}

function validateEntries(entries: unknown, errors: string[]): void {
  if (!Array.isArray(entries)) { errors.push('entries must be an array'); return; }
  const seen = new Set<string>();
  let prev: string | null = null;
  for (const e of entries as TreeEntry[]) {
    if (typeof e !== 'object' || e === null) { errors.push('entry must be an object'); continue; }
    try { validatePathSegment(e.path); } catch (err) { errors.push((err as Error).message); }
    if (e.kind !== 'blob' && e.kind !== 'tree') errors.push(`entry "${e.path}": kind must be "blob" or "tree"`);
    if (!isRef(e.ref)) errors.push(`entry "${e.path}": invalid ref`);
    if (seen.has(e.path)) errors.push(`duplicate entry path "${e.path}"`);
    seen.add(e.path);
    if (prev !== null && utf8Compare(prev, e.path) >= 0) {
      errors.push(`entries not sorted by path: "${prev}" >= "${e.path}"`);
    }
    prev = e.path;
  }
}

function validatePolicy(policy: unknown, errors: string[]): void {
  if (policy === null) return;
  const p = policy as Policy;
  if (typeof p !== 'object' || p === null) { errors.push('policy must be an object or null'); return; }
  if (!Number.isInteger(p.requiredApprovals) || p.requiredApprovals < 0) errors.push('policy.requiredApprovals must be an integer >= 0');
  if (!Array.isArray(p.reviewers) || !p.reviewers.every(isFingerprint)) errors.push('policy.reviewers must be an array of fingerprints');
  if (typeof p.selfReview !== 'boolean') errors.push('policy.selfReview must be a boolean');
}

/**
 * Structural validation for any CAP-Tree object (§ 6.1 step 3).
 * Returns a list of violations; empty list means structurally valid.
 */
export function validateObject(payload: unknown): string[] {
  const errors: string[] = [];
  const o = payload as Partial<CapObject> & Record<string, unknown>;
  if (typeof o !== 'object' || o === null) return ['object payload required'];
  if (o.specVersion !== SPEC_VERSION) errors.push(`unsupported specVersion: ${String(o.specVersion)}`);

  switch (o.type) {
    case 'tree-root': {
      const r = o as TreeRoot;
      if (!isFingerprint(r.ownerFingerprint)) errors.push('ownerFingerprint must be a 43-char base64url fingerprint');
      if (!Array.isArray(r.adminFingerprints) || !r.adminFingerprints.every(isFingerprint)) errors.push('adminFingerprints must be an array of fingerprints');
      validateEntries(r.entries, errors);
      if (!Array.isArray(r.parents) || !r.parents.every(isRef)) errors.push('parents must be an array of ObjectRefs with hashes');
      validatePolicy(r.policy === undefined ? null : r.policy, errors);
      if (r.policy === undefined) errors.push('policy is required (use null for none)');
      if (!Array.isArray(r.approvals) || !r.approvals.every(isRef)) errors.push('approvals must be an array of ObjectRefs');
      if (typeof r.message !== 'string') errors.push('message must be a string');
      if (typeof r.timestamp !== 'string') errors.push('timestamp must be a string');
      if (r.rotateTo !== undefined && !isFingerprint(r.rotateTo)) errors.push('rotateTo must be a fingerprint');
      break;
    }
    case 'tree':
      validateEntries((o as Tree).entries, errors);
      break;
    case 'refs': {
      const r = o as Refs;
      if (!isFingerprint(r.treeId)) errors.push('treeId must be a 43-char base64url hash');
      if (!Number.isInteger(r.seq) || r.seq < 1) errors.push('seq must be an integer >= 1');
      if (r.seq === 1 ? r.prev !== null : !isFingerprint(r.prev as string)) {
        errors.push('prev must be null iff seq == 1, otherwise the previous refs objectHash');
      }
      for (const group of ['branches', 'tags'] as const) {
        const m = r[group];
        if (typeof m !== 'object' || m === null || Object.values(m).some((v) => !isRef(v))) {
          errors.push(`${group} must map names to ObjectRefs`);
        }
      }
      if (typeof r.timestamp !== 'string') errors.push('timestamp must be a string');
      break;
    }
    case 'review-request': {
      const r = o as ReviewRequest;
      if (!isRef(r.root)) errors.push('root must be an ObjectRef');
      if (!isRef(r.target)) errors.push('target must be an ObjectRef');
      if (!isFingerprint(r.authorFingerprint)) errors.push('authorFingerprint must be a fingerprint');
      if (!isFingerprint(r.reviewerFingerprint)) errors.push('reviewerFingerprint must be a fingerprint');
      break;
    }
    case 'review-response': {
      const r = o as ReviewResponse;
      if (!isRef(r.request)) errors.push('request must be an ObjectRef');
      if (!isRef(r.root)) errors.push('root must be an ObjectRef');
      if (!['approved', 'changes-requested', 'commented'].includes(r.outcome)) errors.push('outcome must be approved | changes-requested | commented');
      if (!isFingerprint(r.reviewerFingerprint)) errors.push('reviewerFingerprint must be a fingerprint');
      break;
    }
    case 'chunks': {
      const r = o as ChunkManifest;
      if (!Number.isInteger(r.totalBytes) || r.totalBytes < 0) errors.push('totalBytes must be an integer >= 0');
      if (!Array.isArray(r.chunks) || !r.chunks.every(isRef)) errors.push('chunks must be an array of ObjectRefs');
      break;
    }
    default:
      errors.push(`unknown object type: ${String(o.type)}`);
  }
  return errors;
}
