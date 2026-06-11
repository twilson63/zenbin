/**
 * ObjectService — CAP-Tree v0.3 object publish/retrieve + host-side validation
 * (PRD § 5). All canonicalization/hashing/verification comes from
 * cap-tree-core; this service orchestrates it, enforces the host rules
 * (HB § 5), and maintains the storage indexes. Routes stay thin.
 */
import { config } from '../config.js';
import {
  verifyEnvelope,
  validateObject,
  objectHash,
  blobHash,
  canonicalize,
  canonicalBytes,
  verifyRootChain,
  type SignatureEnvelope,
  type ObjectRef,
  type TreeRoot,
  type Refs,
  type ReviewRequest,
  type ReviewResponse,
  type Tree,
  type Resolver,
} from 'cap-tree-core';
import {
  getObject,
  hasObject,
  putObject,
  putRootIndex,
  putRootMeta,
  getRootMeta,
  isRootMember,
  treeExists,
  listRootHashesOfTree,
  putReviewRef,
  listReviewRefObjectHashes,
  getRefsHead,
  getChainEntry,
  listRefsChain,
  extendRefsChain,
  type StoredObject,
} from '../storage/capTreeDb.js';
import { ErrorCodes, type ErrorCode } from '../errors.js';
import type { IObjectService } from './interfaces.js';

function nowIso(): string {
  return new Date().toISOString();
}

/** A failure the route renders via errorResponse(code, message, httpStatus, extra). */
export interface PublishError {
  status: 'error';
  code: ErrorCode;
  httpStatus: number;
  message: string;
  errors?: string[];
  extra?: Record<string, unknown>;
}
export type PublishResult =
  | { status: 'created'; stored: StoredObject }
  | { status: 'exists'; stored: StoredObject }
  | PublishError;

function err(code: ErrorCode, httpStatus: number, message: string, errors?: string[], extra?: Record<string, unknown>): PublishError {
  return { status: 'error', code, httpStatus, message, errors, extra };
}

/** Resolver over objectDb — fetches stored envelopes by reference (HB § 5). */
const resolve: Resolver = async (ref: ObjectRef) => {
  const o = getObject(ref.hash);
  return o && o.kind === 'envelope' && o.envelope ? o.envelope : null;
};

export class ObjectService implements IObjectService {
  // ─── Publish ──────────────────────────────────────────────

  /** Publish a signature envelope (PRD § 5.1 / § 5.2). */
  async publishEnvelope(env: SignatureEnvelope, uploaderKeyId: string): Promise<PublishResult> {
    // 1. Envelope signature.
    const verdict = await verifyEnvelope(env);
    if (!verdict.ok) {
      return err(ErrorCodes.CAP_ENVELOPE_INVALID, 422, 'Envelope failed verification', verdict.errors);
    }
    const hash = verdict.hash;

    // 2. Structural validation.
    const violations = validateObject(env.payload);
    if (violations.length > 0) {
      return err(ErrorCodes.CAP_OBJECT_INVALID, 422, 'Object failed structural validation', violations);
    }

    // Canonical size guard (both kinds; HB § 7 is content-blind).
    const size = canonicalBytes(env.payload).length;
    if (size > config.capTree.maxObjectBytes) {
      return err(ErrorCodes.OBJECT_TOO_LARGE, 413, `Object exceeds ${config.capTree.maxObjectBytes} bytes`);
    }

    // 3. Idempotency — immutable objects (HB § 3.1 step 3).
    const existing = getObject(hash);
    if (existing) {
      return { status: 'exists', stored: existing };
    }

    const payload = env.payload as { type?: string };
    const clean: SignatureEnvelope = {
      payload: env.payload,
      signerFingerprint: env.signerFingerprint,
      publicKey: env.publicKey,
      signature: env.signature,
    };

    // 4. Type-specific host validation (PRD § 5.2).
    switch (payload.type) {
      case 'tree-root':
        return this.publishTreeRoot(clean, env as SignatureEnvelope<TreeRoot>, hash, size, uploaderKeyId);
      case 'refs':
        return this.publishRefs(clean, env as SignatureEnvelope<Refs>, hash, size, uploaderKeyId);
      case 'review-request':
      case 'review-response':
        return this.publishReview(clean, env, hash, size, uploaderKeyId);
      case 'tree':
      case 'chunks':
        // Structural validation only — store as-is.
        return this.store(clean, hash, payload.type, size, uploaderKeyId);
      default:
        return err(ErrorCodes.CAP_OBJECT_INVALID, 422, 'Unknown object type', [`unknown object type: ${String(payload.type)}`]);
    }
  }

  private store(env: SignatureEnvelope, hash: string, objectType: string, size: number, uploaderKeyId: string): PublishResult {
    const stored: StoredObject = {
      hash,
      kind: 'envelope',
      envelope: env,
      objectType,
      uploaderKeyId,
      size,
      created_at: nowIso(),
    };
    putObject(stored);
    return { status: 'created', stored };
  }

  private async publishTreeRoot(
    clean: SignatureEnvelope,
    env: SignatureEnvelope<TreeRoot>,
    hash: string,
    size: number,
    uploaderKeyId: string,
  ): Promise<PublishResult> {
    const root = env.payload;
    let treeId: string;

    if (root.parents.length === 0) {
      // Genesis — signer must be the declared owner; treeId is this hash.
      if (env.signerFingerprint !== root.ownerFingerprint) {
        return err(ErrorCodes.CAP_OWNER_MISMATCH, 422, 'Genesis root signer is not the declared owner');
      }
      treeId = hash;
    } else {
      // Non-genesis — first parent must be a stored, indexed root; the chain
      // walk validates parents, owner signing (incl. rotation), and structure.
      const parentMeta = getRootMeta(root.parents[0]!.hash);
      if (!parentMeta) {
        return err(ErrorCodes.CAP_PARENT_UNKNOWN, 422, 'First parent is not a known root', [
          `parent ${root.parents[0]!.hash} is not a stored, indexed root`,
        ]);
      }
      treeId = parentMeta.treeId;
      const chain = await verifyRootChain(env, treeId, resolve);
      if (!chain.ok) {
        return err(ErrorCodes.CAP_CHAIN_INVALID, 422, 'Root chain verification failed', chain.errors);
      }
    }

    const result = this.store(clean, hash, 'tree-root', size, uploaderKeyId);
    putRootIndex(treeId, hash, {
      parents: root.parents.map((p) => p.hash),
      timestamp: root.timestamp,
      message: root.message,
    });
    putRootMeta(hash, { treeId, ownerFingerprint: root.ownerFingerprint });
    return result;
  }

  private async publishRefs(
    clean: SignatureEnvelope,
    env: SignatureEnvelope<Refs>,
    hash: string,
    size: number,
    uploaderKeyId: string,
  ): Promise<PublishResult> {
    const refs = env.payload;

    // 1. Tree must have a stored genesis. (§ 5.2 refs step 1 — 422 here, vs the
    //    404 used by GET tree reads for the same code.)
    if (!treeExists(refs.treeId)) {
      return err(ErrorCodes.CAP_TREE_UNKNOWN, 422, 'Refs target an unknown tree');
    }

    // 2. Every branch/tag target must be a stored root of this tree, and the
    //    signer must be the tree's current owner (authoritative via chain walk).
    const targets = [...Object.values(refs.branches), ...Object.values(refs.tags)];
    if (targets.length === 0) {
      return err(ErrorCodes.CAP_REF_TARGET_UNKNOWN, 422, 'Refs must name at least one branch or tag target');
    }
    for (const ref of targets) {
      if (!isRootMember(refs.treeId, ref.hash)) {
        return err(ErrorCodes.CAP_REF_TARGET_UNKNOWN, 422, 'A refs target is not a stored root of this tree', [
          `target ${ref.hash} is not a member of tree ${refs.treeId}`,
        ]);
      }
    }
    const ownerRef = refs.branches['main'] ?? targets[0]!;
    const ownerEnv = (await resolve(ownerRef)) as SignatureEnvelope<TreeRoot> | null;
    if (!ownerEnv) {
      return err(ErrorCodes.CAP_REF_TARGET_UNKNOWN, 422, 'Refs target object is unavailable');
    }
    const ownerChain = await verifyRootChain(ownerEnv, refs.treeId, resolve);
    if (!ownerChain.ok) {
      return err(ErrorCodes.CAP_CHAIN_INVALID, 422, 'Refs target failed chain verification', ownerChain.errors);
    }
    const currentOwner = ownerEnv.payload.rotateTo ?? ownerEnv.payload.ownerFingerprint;
    if (env.signerFingerprint !== currentOwner && env.signerFingerprint !== ownerEnv.payload.ownerFingerprint) {
      return err(ErrorCodes.CAP_NOT_OWNER, 403, 'Refs not signed by the tree owner');
    }

    // 3. Atomic chain extension. Object is stored only on success, so a stored
    //    refs is always a chain member → generic idempotency stays correct.
    const ext = extendRefsChain(refs.treeId, refs.seq, refs.prev, hash);
    if (!ext.ok) {
      if (ext.currentSeq === refs.seq && ext.currentHash === hash) {
        // This exact refs object is already the chain head but wasn't stored —
        // a crash between extend and store, or a concurrent duplicate publish.
        // Heal: store it and report success rather than a conflict.
        return this.store(clean, hash, refs.type, size, uploaderKeyId);
      }
      return err(ErrorCodes.CAP_REFS_CONFLICT, 409, 'Refs chain conflict', undefined, {
        currentSeq: ext.currentSeq,
        currentHash: ext.currentHash,
      });
    }
    return this.store(clean, hash, refs.type, size, uploaderKeyId);
  }

  private publishReview(
    clean: SignatureEnvelope,
    env: SignatureEnvelope,
    hash: string,
    size: number,
    uploaderKeyId: string,
  ): PublishResult {
    const result = this.store(clean, hash, (env.payload as { type: string }).type, size, uploaderKeyId);
    const p = env.payload as ReviewRequest | ReviewResponse;
    if (p.type === 'review-request') {
      const entry = { objectType: 'review-request', recipient: p.reviewerFingerprint };
      putReviewRef(p.root.hash, hash, entry);
      putReviewRef(p.target.hash, hash, entry);
    } else {
      putReviewRef(p.root.hash, hash, { objectType: 'review-response', recipient: p.reviewerFingerprint });
    }
    return result;
  }

  /** Publish a raw blob (PRD § 5.1). */
  async publishBlob(bytes: Uint8Array, uploaderKeyId: string): Promise<PublishResult> {
    const hash = await blobHash(bytes);
    const existing = getObject(hash);
    if (existing) {
      return { status: 'exists', stored: existing };
    }
    if (bytes.length > config.capTree.maxObjectBytes) {
      return err(ErrorCodes.OBJECT_TOO_LARGE, 413, `Object exceeds ${config.capTree.maxObjectBytes} bytes`);
    }
    const stored: StoredObject = {
      hash,
      kind: 'blob',
      blobBase64: Buffer.from(bytes).toString('base64'),
      uploaderKeyId,
      size: bytes.length,
      created_at: nowIso(),
    };
    putObject(stored);
    return { status: 'created', stored };
  }

  // ─── Retrieve ─────────────────────────────────────────────

  get(hash: string): StoredObject | undefined {
    return getObject(hash);
  }

  /** Deterministic canonical bytes for a stored envelope (PRD § 5.3). */
  envelopeBytes(stored: StoredObject): string {
    return canonicalize(stored.envelope as unknown);
  }

  // ─── Tree reads (PRD § 5.4) ───────────────────────────────

  treeExists(treeId: string): boolean {
    return treeExists(treeId);
  }

  /** Current refs envelope for a tree, or null if none published. */
  currentRefs(treeId: string): SignatureEnvelope<Refs> | null {
    const head = getRefsHead(treeId);
    if (!head) return null;
    const o = getObject(head.hash);
    return o?.envelope ? (o.envelope as SignatureEnvelope<Refs>) : null;
  }

  refsHistory(treeId: string, before: number | undefined, limit: number): { entries: SignatureEnvelope<Refs>[]; next_cursor: number | null } {
    const chain = listRefsChain(treeId, { before, limit: limit + 1 });
    const hasMore = chain.length > limit;
    const page = chain.slice(0, limit);
    const entries = page
      .map((e) => getObject(e.hash)?.envelope as SignatureEnvelope<Refs> | undefined)
      .filter((e): e is SignatureEnvelope<Refs> => !!e);
    const next_cursor = hasMore ? page[page.length - 1]!.seq : null;
    return { entries, next_cursor };
  }

  /** A root envelope, only if it is a member of the given tree. */
  rootOfTree(treeId: string, rootHash: string): SignatureEnvelope<TreeRoot> | null {
    if (!isRootMember(treeId, rootHash)) return null;
    const o = getObject(rootHash);
    return o?.envelope ? (o.envelope as SignatureEnvelope<TreeRoot>) : null;
  }

  /**
   * Ancestor walk (BFS over parents), newest-first. The BFS order is
   * deterministic, so `cursor` (a previous page's next_cursor, a root hash)
   * resumes the walk by skipping everything up to and including it.
   */
  rootHistory(treeId: string, rootHash: string, limit: number, cursor?: string): { roots: Array<{ hash: string; parents: string[]; message: string; timestamp: string; entryCount: number }>; next_cursor: string | null } {
    const out: Array<{ hash: string; parents: string[]; message: string; timestamp: string; entryCount: number }> = [];
    const seen = new Set<string>();
    const queue: string[] = [rootHash];
    let emitting = cursor === undefined;
    let hasMore = false;
    while (queue.length > 0) {
      const h = queue.shift()!;
      if (seen.has(h)) continue;
      seen.add(h);
      if (!isRootMember(treeId, h)) continue;
      const o = getObject(h);
      const root = o?.envelope?.payload as TreeRoot | undefined;
      if (!root || root.type !== 'tree-root') continue;
      if (emitting) {
        if (out.length >= limit) { hasMore = true; break; }
        out.push({
          hash: h,
          parents: root.parents.map((p) => p.hash),
          message: root.message,
          timestamp: root.timestamp,
          entryCount: root.entries.length,
        });
      } else if (h === cursor) {
        emitting = true;
      }
      for (const p of root.parents) queue.push(p.hash);
    }
    const next_cursor = hasMore && out.length > 0 ? out[out.length - 1]!.hash : null;
    return { roots: out, next_cursor };
  }

  /**
   * Resolve a path within a root's subtree (PRD § 5.4). Walks `tree` objects by
   * hash. Returns the terminal entry, or null on a miss / traversal through a
   * blob.
   */
  async resolvePath(treeId: string, rootHash: string, path: string): Promise<{ path: string; kind: 'blob' | 'tree'; ref: ObjectRef } | null> {
    const root = this.rootOfTree(treeId, rootHash);
    if (!root) return null;
    const segments = path.split('/').filter((s) => s.length > 0);
    if (segments.length === 0) return null;

    let entries = root.payload.entries;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!;
      const entry = entries.find((e) => e.path === seg);
      if (!entry) return null;
      const isLast = i === segments.length - 1;
      if (isLast) {
        return { path: segments.join('/'), kind: entry.kind, ref: entry.ref };
      }
      // Need to descend — entry must be a tree.
      if (entry.kind !== 'tree') return null;
      const o = getObject(entry.ref.hash);
      const sub = o?.envelope?.payload as Tree | undefined;
      if (!sub || sub.type !== 'tree') return null;
      entries = sub.entries;
    }
    return null;
  }

  // ─── Reviews (PRD § 5.6) ──────────────────────────────────

  queryReviews(params: {
    treeId: string;
    type?: string;
    recipient?: string;
    outcome?: string;
    root?: string;
    limit: number;
    cursor?: string;
  }): { reviews: SignatureEnvelope[]; next_cursor: string | null } {
    // Collect candidate review object hashes from the reviewref index.
    const rootHashes = params.root ? [params.root] : listRootHashesOfTree(params.treeId);
    const seen = new Set<string>();
    const candidates: string[] = [];
    for (const rh of rootHashes) {
      for (const { objectHash } of listReviewRefObjectHashes(rh)) {
        if (!seen.has(objectHash)) {
          seen.add(objectHash);
          candidates.push(objectHash);
        }
      }
    }
    candidates.sort();

    const reviews: SignatureEnvelope[] = [];
    let started = !params.cursor;
    let next_cursor: string | null = null;
    for (const h of candidates) {
      if (!started) {
        if (h === params.cursor) started = true;
        continue;
      }
      const o = getObject(h);
      const env = o?.envelope;
      if (!env) continue;
      const p = env.payload as ReviewRequest | ReviewResponse;
      if (params.type && p.type !== params.type) continue;
      if (params.recipient && p.reviewerFingerprint !== params.recipient) continue;
      if (params.outcome && (p.type !== 'review-response' || p.outcome !== params.outcome)) continue;
      if (reviews.length >= params.limit) {
        next_cursor = h;
        break;
      }
      reviews.push(env);
    }
    return { reviews, next_cursor };
  }
}

export const objectService = new ObjectService();
