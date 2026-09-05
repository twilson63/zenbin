import { open, Database } from 'lmdb';
import { config } from '../config.js';
import { checkLogSigner, logLimits, type LogSigner } from '../utils/logSignature.js';

export interface PendingLogTransfer {
  new_owner_fingerprint: string;
  initiated_at: string;
  retain_previous_owner: boolean;
}

export interface PublicLog {
  id: string;
  owner_fingerprint: string;
  allowed_writers: string[];
  created_at: string;
  entry_count: number;
  revision: number;
  pending_transfer: PendingLogTransfer | null;
}

type StoredLog = Omit<PublicLog, 'revision' | 'pending_transfer'> & Partial<Pick<PublicLog, 'revision' | 'pending_transfer'>>;
export interface LogEntry {
  sequence: number;
  timestamp: string;
  agent_fingerprint: string;
  metadata: string;
}

type MutationError = { error: string; status: 401 | 403 | 404 | 409 };
type MutationResult<T> = { value: T } | MutationError;
interface LogStore {
  logs: Database<StoredLog, string>;
  entries: Database<LogEntry, string>;
  nonces: Database<number, string>;
  expiries: Database<boolean, string>;
}
let store: LogStore | undefined;

export function initLogDatabase(): void {
  if (store) return;
  // User IDs must not collide with named-database descriptors in the unnamed DB.
  const logs = open<StoredLog, string>({ path: `${config.lmdbPath}-logs`, name: 'logs', compression: true, maxDbs: 4 });
  store = {
    logs,
    entries: logs.openDB<LogEntry, string>({ name: 'entries' }),
    nonces: logs.openDB<number, string>({ name: 'nonces' }),
    expiries: logs.openDB<boolean, string>({ name: 'expiries' }),
  };
}
function getStore(): LogStore {
  if (!store) throw new Error('Log database not initialized');
  return store;
}
function normalize(log: StoredLog): PublicLog {
  return { ...log, revision: log.revision ?? 0, pending_transfer: log.pending_transfer ?? null };
}
function nonceKey(signer: LogSigner): string { return `${signer.fingerprint}:${signer.nonce}`; }
function entryKey(id: string, sequence: number): string { return `${id}:${String(sequence).padStart(16, '0')}`; }

function checkWrite(db: LogStore, signer: LogSigner, now: number): MutationError | undefined {
  const invalid = checkLogSigner(signer, now);
  if (invalid) return invalid;
  const expiry = db.nonces.get(nonceKey(signer));
  if (expiry !== undefined && expiry >= now) return { error: 'Request nonce already used', status: 409 };
}

function consumeNonce(db: LogStore, signer: LogSigner, now: number): void {
  // Only successful mutations clean a bounded batch. Equality is still in the signing window.
  const expired = db.expiries.getKeys({ end: String(now).padStart(16, '0'), limit: 100 }).asArray;
  for (const key of expired) {
    const identity = key.slice(17);
    const expiry = Number(key.slice(0, 16));
    if (db.nonces.get(identity) === expiry) db.nonces.removeSync(identity);
    db.expiries.removeSync(key);
  }
  const expiry = signer.timestamp + config.signedPublishing.maxTimestampSkewMs;
  db.nonces.putSync(nonceKey(signer), expiry);
  db.expiries.putSync(`${String(expiry).padStart(16, '0')}:${nonceKey(signer)}`, true);
}

export async function createLog(id: string, allowedWriters: string[], signer: LogSigner): Promise<MutationResult<PublicLog>> {
  const db = getStore();
  return db.logs.transaction(() => {
    const now = Date.now();
    const invalid = checkWrite(db, signer, now);
    if (invalid) return invalid;
    if (db.logs.get(id)) return { error: 'Log ID already taken', status: 409 };
    const log: PublicLog = { id, owner_fingerprint: signer.fingerprint, allowed_writers: [...allowedWriters], created_at: new Date(now).toISOString(), entry_count: 0, revision: 0, pending_transfer: null };
    db.logs.putSync(id, log);
    consumeNonce(db, signer, now);
    return { value: log };
  });
}

export async function appendLogEntry(id: string, metadata: string, signer: LogSigner): Promise<MutationResult<LogEntry>> {
  const db = getStore();
  return db.logs.transaction(() => {
    const now = Date.now();
    const invalid = checkWrite(db, signer, now);
    if (invalid) return invalid;
    const stored = db.logs.get(id);
    if (!stored) return { error: 'Log not found', status: 404 };
    const log = normalize(stored);
    if (log.owner_fingerprint !== signer.fingerprint && !log.allowed_writers.includes(signer.fingerprint)) return { error: 'Agent is not allowed to write to this log', status: 403 };
    if (log.entry_count >= logLimits.entries) return { error: 'Log entry limit reached', status: 409 };
    const entry: LogEntry = { sequence: log.entry_count + 1, timestamp: new Date(now).toISOString(), agent_fingerprint: signer.fingerprint, metadata };
    db.entries.putSync(entryKey(id, entry.sequence), entry);
    db.logs.putSync(id, { ...log, entry_count: entry.sequence });
    consumeNonce(db, signer, now);
    return { value: entry };
  });
}

async function manageLog(id: string, revision: number, signer: LogSigner, recipient: boolean, change: (log: PublicLog, now: number) => PublicLog | MutationError): Promise<MutationResult<PublicLog>> {
  const db = getStore();
  return db.logs.transaction(() => {
    const now = Date.now();
    const invalid = checkWrite(db, signer, now);
    if (invalid) return invalid;
    const stored = db.logs.get(id);
    if (!stored) return { error: 'Log not found', status: 404 };
    const log = normalize(stored);
    if (recipient && !log.pending_transfer) return { error: 'No pending ownership transfer', status: 409 };
    const authorized = recipient ? log.pending_transfer!.new_owner_fingerprint : log.owner_fingerprint;
    if (authorized !== signer.fingerprint) return { error: recipient ? 'Only the nominated agent can accept ownership' : 'Only the current owner can manage this log', status: 403 };
    if (log.revision !== revision || log.revision >= Number.MAX_SAFE_INTEGER) return { error: 'Log revision conflict; read the current log and retry', status: 409 };
    const updated = change(log, now);
    if ('error' in updated) return updated;
    updated.revision = log.revision + 1;
    db.logs.putSync(id, updated);
    consumeNonce(db, signer, now);
    return { value: updated };
  });
}

export function updateLogWriters(id: string, writers: string[], revision: number, signer: LogSigner) {
  return manageLog(id, revision, signer, false, (log) => ({ ...log, allowed_writers: [...writers] }));
}
export function nominateLogOwner(id: string, fingerprint: string, retain: boolean, revision: number, signer: LogSigner) {
  return manageLog(id, revision, signer, false, (log, now) => {
    if (fingerprint === log.owner_fingerprint) return { error: 'New owner must be a different agent', status: 409 };
    return { ...log, pending_transfer: { new_owner_fingerprint: fingerprint, initiated_at: new Date(now).toISOString(), retain_previous_owner: retain } };
  });
}
export function cancelLogTransfer(id: string, revision: number, signer: LogSigner) {
  return manageLog(id, revision, signer, false, (log) => {
    if (!log.pending_transfer) return { error: 'No pending ownership transfer', status: 409 };
    return { ...log, pending_transfer: null };
  });
}
export function acceptLogTransfer(id: string, revision: number, signer: LogSigner) {
  return manageLog(id, revision, signer, true, (log) => {
    const transfer = log.pending_transfer!;
    const writers = log.allowed_writers.filter((writer) => writer !== log.owner_fingerprint && writer !== transfer.new_owner_fingerprint);
    if (transfer.retain_previous_owner) writers.push(log.owner_fingerprint);
    if (writers.length > logLimits.writers) return { error: 'Retaining the previous owner exceeds the writer limit', status: 409 };
    return { ...log, owner_fingerprint: transfer.new_owner_fingerprint, allowed_writers: writers, pending_transfer: null };
  });
}
export function getLog(id: string): PublicLog | undefined {
  const log = getStore().logs.get(id);
  return log ? normalize(log) : undefined;
}
export function readLogEntries(id: string, after: number, limit: number) {
  const { entries } = getStore();
  if (after >= logLimits.entries) return { entries: [], next_after: after, has_more: false };
  const page = entries.getRange({ start: entryKey(id, after + 1), end: `${id};`, limit: limit + 1 }).asArray.map(({ value }) => value);
  const hasMore = page.length > limit;
  if (hasMore) page.pop();
  return { entries: page, next_after: page.at(-1)?.sequence ?? after, has_more: hasMore };
}
export async function closeLogDatabase(): Promise<void> {
  if (!store) return;
  const current = store;
  store = undefined;
  await current.entries.close();
  await current.nonces.close();
  await current.expiries.close();
  await current.logs.close();
}
