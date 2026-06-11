/**
 * CAP-Tree v0.3 storage (PRD § 4).
 *
 * Three LMDB environments — content-addressed objects, tree membership/history
 * indexes, and the per-tree refs chain — following the same open()/accessor
 * pattern as db.ts. Objects are immutable and content-addressed: a write at an
 * existing hash is a no-op. The refs chain head is the only mutable state, and
 * it is advanced inside a single transaction so concurrent publishes cannot
 * fork the chain.
 *
 * Note: separate open() calls are separate LMDB environments, so a transaction
 * cannot span them. That is fine — the only atomicity requirement (HB § 5 refs)
 * is the head/chain advance, which lives entirely in refsDb. Object bytes are
 * stored first (idempotent); an orphaned object from a failed chain write is
 * harmless.
 */
import { open, Database } from 'lmdb';
import { config } from '../config.js';
import type { SignatureEnvelope } from '../vendor/cap-tree-core/index.js';

// ─── Stored value shapes ────────────────────────────────────

/** A stored CAP-Tree object — keyed by its content address (PRD § 4.2). */
export interface StoredObject {
  hash: string;                       // objectHash or blobHash — also the key
  kind: 'envelope' | 'blob';
  envelope?: SignatureEnvelope;       // kind === 'envelope'
  blobBase64?: string;                // kind === 'blob' (raw bytes, base64)
  objectType?: string;                // payload.type for envelopes
  uploaderKeyId: string;              // ZenBin agent key that published it
  size: number;                       // bytes of canonical/raw content
  created_at: string;                 // ISO 8601 (server clock)
}

/** treeIndexDb `root:{treeId}:{rootHash}` value. */
export interface RootIndexEntry {
  parents: string[];
  timestamp: string;
  message: string;
}

/** treeIndexDb `rootmeta:{rootHash}` value. */
export interface RootMeta {
  treeId: string;
  ownerFingerprint: string;
}

/** treeIndexDb `reviewref:{referencedRootHash}:{objectHash}` value. */
export interface ReviewRefEntry {
  objectType: string;
  recipient?: string;
}

/** refsDb `head:{treeId}` value. */
export interface RefsHead {
  seq: number;
  hash: string;
}

type TreeIndexValue = RootIndexEntry | RootMeta | ReviewRefEntry;
type RefsValue = RefsHead | string;

// ─── Environments ───────────────────────────────────────────

let objectDb: Database<StoredObject, string>;
let treeIndexDb: Database<TreeIndexValue, string>;
let refsDb: Database<RefsValue, string>;

/** Open the CAP-Tree environments (idempotent). Called from initDatabase(). */
export function initCapTreeDb(): void {
  if (!objectDb) {
    objectDb = open<StoredObject, string>({ path: `${config.lmdbPath}-objects`, compression: true });
  }
  if (!treeIndexDb) {
    treeIndexDb = open<TreeIndexValue, string>({ path: `${config.lmdbPath}-tree-index`, compression: true });
  }
  if (!refsDb) {
    refsDb = open<RefsValue, string>({ path: `${config.lmdbPath}-refs`, compression: true });
  }
}

export async function closeCapTreeDb(): Promise<void> {
  if (objectDb) { await objectDb.close(); objectDb = undefined as unknown as Database<StoredObject, string>; }
  if (treeIndexDb) { await treeIndexDb.close(); treeIndexDb = undefined as unknown as Database<TreeIndexValue, string>; }
  if (refsDb) { await refsDb.close(); refsDb = undefined as unknown as Database<RefsValue, string>; }
}

function getObjectDb(): Database<StoredObject, string> {
  if (!objectDb) throw new Error('CAP-Tree DB not initialized. Call initDatabase() first.');
  return objectDb;
}
function getTreeIndexDb(): Database<TreeIndexValue, string> {
  if (!treeIndexDb) throw new Error('CAP-Tree DB not initialized. Call initDatabase() first.');
  return treeIndexDb;
}
function getRefsDb(): Database<RefsValue, string> {
  if (!refsDb) throw new Error('CAP-Tree DB not initialized. Call initDatabase() first.');
  return refsDb;
}

// ─── Key helpers ────────────────────────────────────────────

const rootKey = (treeId: string, rootHash: string) => `root:${treeId}:${rootHash}`;
const rootMetaKey = (rootHash: string) => `rootmeta:${rootHash}`;
const reviewRefKey = (referencedRootHash: string, objectHash: string) => `reviewref:${referencedRootHash}:${objectHash}`;
const headKey = (treeId: string) => `head:${treeId}`;
const chainKey = (treeId: string, seq: number) => `chain:${treeId}:${String(seq).padStart(10, '0')}`;

// ─── Object storage ─────────────────────────────────────────

export function getObject(hash: string): StoredObject | undefined {
  return getObjectDb().get(hash);
}

export function hasObject(hash: string): boolean {
  return getObjectDb().get(hash) !== undefined;
}

/** Store an immutable object. Caller must check existence for idempotency. */
export function putObject(obj: StoredObject): void {
  getObjectDb().putSync(obj.hash, obj);
}

// ─── Tree index ─────────────────────────────────────────────

export function putRootIndex(treeId: string, rootHash: string, entry: RootIndexEntry): void {
  getTreeIndexDb().putSync(rootKey(treeId, rootHash), entry);
}

export function getRootIndex(treeId: string, rootHash: string): RootIndexEntry | undefined {
  return getTreeIndexDb().get(rootKey(treeId, rootHash)) as RootIndexEntry | undefined;
}

export function isRootMember(treeId: string, rootHash: string): boolean {
  return getTreeIndexDb().get(rootKey(treeId, rootHash)) !== undefined;
}

export function putRootMeta(rootHash: string, meta: RootMeta): void {
  getTreeIndexDb().putSync(rootMetaKey(rootHash), meta);
}

export function getRootMeta(rootHash: string): RootMeta | undefined {
  return getTreeIndexDb().get(rootMetaKey(rootHash)) as RootMeta | undefined;
}

/** Is there a stored genesis root for this tree (`root:{treeId}:{treeId}`)? */
export function treeExists(treeId: string): boolean {
  return isRootMember(treeId, treeId);
}

/** All root hashes that belong to a tree (membership index scan). */
export function listRootHashesOfTree(treeId: string): string[] {
  const prefix = `${rootKey(treeId, '')}`; // `root:{treeId}:`
  const out: string[] = [];
  for (const key of getTreeIndexDb().getKeys({ start: prefix })) {
    if (typeof key !== 'string' || !key.startsWith(prefix)) break;
    out.push(key.slice(prefix.length));
  }
  return out;
}

export function putReviewRef(referencedRootHash: string, objectHash: string, entry: ReviewRefEntry): void {
  getTreeIndexDb().putSync(reviewRefKey(referencedRootHash, objectHash), entry);
}

/** Object hashes of review messages referencing a given root. */
export function listReviewRefObjectHashes(referencedRootHash: string): Array<{ objectHash: string; entry: ReviewRefEntry }> {
  const prefix = `reviewref:${referencedRootHash}:`;
  const out: Array<{ objectHash: string; entry: ReviewRefEntry }> = [];
  for (const { key, value } of getTreeIndexDb().getRange({ start: prefix })) {
    if (typeof key !== 'string' || !key.startsWith(prefix)) break;
    out.push({ objectHash: key.slice(prefix.length), entry: value as ReviewRefEntry });
  }
  return out;
}

// ─── Refs chain ─────────────────────────────────────────────

export function getRefsHead(treeId: string): RefsHead | undefined {
  return getRefsDb().get(headKey(treeId)) as RefsHead | undefined;
}

export function getChainEntry(treeId: string, seq: number): string | undefined {
  return getRefsDb().get(chainKey(treeId, seq)) as string | undefined;
}

/**
 * The refs chain newest-first. `before` (exclusive seq) drives the cursor.
 * Returns `{ seq, hash }` entries.
 */
export function listRefsChain(
  treeId: string,
  opts: { before?: number; limit: number },
): Array<{ seq: number; hash: string }> {
  const prefix = `chain:${treeId}:`;
  const all: Array<{ seq: number; hash: string }> = [];
  for (const { key, value } of getRefsDb().getRange({ start: prefix })) {
    if (typeof key !== 'string' || !key.startsWith(prefix)) break;
    const seq = parseInt(key.slice(prefix.length), 10);
    all.push({ seq, hash: value as string });
  }
  all.sort((a, b) => b.seq - a.seq); // newest-first
  const filtered = opts.before === undefined ? all : all.filter((e) => e.seq < opts.before!);
  return filtered.slice(0, opts.limit);
}

export type ChainExtendResult =
  | { ok: true }
  | { ok: false; currentSeq: number; currentHash: string | null };

/**
 * Atomically extend the refs chain (PRD § 5.2 refs step 4). The head read,
 * seq/prev check, chain write, and head advance happen in one transaction so a
 * concurrent publish cannot fork the chain. The refs envelope must already be
 * stored in objectDb (idempotent).
 */
export function extendRefsChain(
  treeId: string,
  seq: number,
  prev: string | null,
  refsObjectHash: string,
): ChainExtendResult {
  const db = getRefsDb();
  return db.transactionSync<ChainExtendResult>(() => {
    const head = db.get(headKey(treeId)) as RefsHead | undefined;
    if (!head) {
      if (!(seq === 1 && prev === null)) {
        return { ok: false, currentSeq: 0, currentHash: null };
      }
    } else if (!(seq === head.seq + 1 && prev === head.hash)) {
      return { ok: false, currentSeq: head.seq, currentHash: head.hash };
    }
    db.putSync(chainKey(treeId, seq), refsObjectHash);
    db.putSync(headKey(treeId), { seq, hash: refsObjectHash });
    return { ok: true };
  });
}
