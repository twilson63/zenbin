import { open, Database } from 'lmdb';
import { config } from '../config.js';
import type {
  Page,
  PageAuth,
  Subdomain,
  AgentKey,
  NonceRecord,
  AuditLogRecord,
  SaveResult,
  SubdomainResult,
  Plan,
  StoredJwk,
} from '../types.js';

// Re-export types for backward compatibility
export type {
  Page,
  PageAuth,
  Subdomain,
  AgentKey,
  NonceRecord,
  AuditLogRecord,
  SaveResult,
  SubdomainResult,
  Plan,
  StoredJwk,
};

let db: Database<Page, string>;
let subdomainDb: Database<Subdomain, string>;
let agentKeyDb: Database<AgentKey, string>;
let nonceDb: Database<NonceRecord, string>;
let auditLogDb: Database<AuditLogRecord, string>;
let ownerIndexDb: Database<PageSummary, string>;
let recipientIndexDb: Database<PageSummary, string>;

// PageSummary — lightweight metadata for listing, never includes content
export interface PageSummary {
  id: string;
  subdomain: string | null;
  title?: string;
  content_type?: string;
  has_markdown: boolean;
  has_image: boolean;
  has_video: boolean;
  ownerKeyId: string;
  recipientKeyId?: string;
  created_at: string;
  updated_at: string;
  etag: string;
}

export function initDatabase(): {
  pages: Database<Page, string>;
  subdomains: Database<Subdomain, string>;
  agentKeys: Database<AgentKey, string>;
  nonces: Database<NonceRecord, string>;
  auditLogs: Database<AuditLogRecord, string>;
  ownerIndex: Database<PageSummary, string>;
  recipientIndex: Database<PageSummary, string>;
} {
  if (!db) {
    db = open<Page, string>({
      path: config.lmdbPath,
      compression: true,
    });
  }
  if (!subdomainDb) {
    subdomainDb = open<Subdomain, string>({
      path: `${config.lmdbPath}-subdomains`,
      compression: true,
    });
  }
  if (!agentKeyDb) {
    agentKeyDb = open<AgentKey, string>({
      path: `${config.lmdbPath}-agent-keys`,
      compression: true,
    });
  }
  if (!nonceDb) {
    nonceDb = open<NonceRecord, string>({
      path: `${config.lmdbPath}-nonces`,
      compression: true,
    });
  }
  if (!auditLogDb) {
    auditLogDb = open<AuditLogRecord, string>({
      path: `${config.lmdbPath}-audit`,
      compression: true,
    });
  }
  if (!ownerIndexDb) {
    ownerIndexDb = open<PageSummary, string>({
      path: `${config.lmdbPath}-owner-index`,
      compression: true,
    });
  }
  if (!recipientIndexDb) {
    recipientIndexDb = open<PageSummary, string>({
      path: `${config.lmdbPath}-recipient-index`,
      compression: true,
    });
  }

  return {
    pages: db,
    subdomains: subdomainDb,
    agentKeys: agentKeyDb,
    nonces: nonceDb,
    auditLogs: auditLogDb,
    ownerIndex: ownerIndexDb,
    recipientIndex: recipientIndexDb,
  };
}

/**
 * Backfill the owner index from existing pages.
 * Called once after database initialization to ensure all pages
 * (including those created before the owner index existed) are indexed.
 */
export function backfillOwnerIndex(): { indexed: number; skipped: number } {
  const pagesDb = getDatabase();
  let indexed = 0;
  let skipped = 0;

  for (const key of pagesDb.getKeys({})) {
    const page = pagesDb.get(key);
    if (!page) continue;

    if (!page.ownerKeyId) {
      skipped++;
      continue;
    }

    // Check if already indexed
    const idxDb = getOwnerIndexDatabase();
    const idxKey = ownerIndexKey(page);
    const existing = idxDb.get(idxKey);
    if (existing) {
      continue; // Already indexed
    }

    addPageToOwnerIndex(page);
    indexed++;
  }

  return { indexed, skipped };
}

/**
 * Backfill the recipient index from existing pages.
 * Called once after database initialization to ensure all pages
 * (including those created before the recipient index existed) are indexed.
 */
export function backfillRecipientIndex(): { indexed: number; skipped: number } {
  const pagesDb = getDatabase();
  let indexed = 0;
  let skipped = 0;

  for (const key of pagesDb.getKeys({})) {
    const page = pagesDb.get(key);
    if (!page) continue;

    if (!page.recipientKeyId) {
      skipped++;
      continue;
    }

    // Check if already indexed
    const idxDb = getRecipientIndexDatabase();
    const idxKey = recipientIndexKey(page);
    const existing = idxDb.get(idxKey);
    if (existing) {
      continue; // Already indexed
    }

    addPageToRecipientIndex(page);
    indexed++;
  }

  return { indexed, skipped };
}

export function getDatabase(): Database<Page, string> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function getSubdomainDatabase(): Database<Subdomain, string> {
  if (!subdomainDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return subdomainDb;
}

export function getAgentKeyDatabase(): Database<AgentKey, string> {
  if (!agentKeyDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return agentKeyDb;
}

export function getNonceDatabase(): Database<NonceRecord, string> {
  if (!nonceDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return nonceDb;
}

export function getAuditLogDatabase(): Database<AuditLogRecord, string> {
  if (!auditLogDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return auditLogDb;
}

export function getOwnerIndexDatabase(): Database<PageSummary, string> {
  if (!ownerIndexDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return ownerIndexDb;
}

export function getRecipientIndexDatabase(): Database<PageSummary, string> {
  if (!recipientIndexDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return recipientIndexDb;
}

function pageStorageKey(id: string, subdomain?: string): string {
  return subdomain ? `${subdomain}:${id}` : id;
}

function nonceStorageKey(keyId: string, nonce: string): string {
  return `${keyId}:${nonce}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function savePage(
  id: string,
  data: {
    html?: string;
    markdown?: string;
    image?: string;
    image_content_type?: string;
    video?: string;
    video_content_type?: string;
    encoding?: 'utf-8' | 'base64';
    content_type?: string;
    title?: string;
    subdomain?: string;
    auth?: { passwordHash?: string; urlTokenHash?: string };
    ownerKeyId?: string;
    publishSignature?: string;
    contentDigest?: string;
    publishTimestamp?: string;
    publishNonce?: string;
    publishMethod?: string;
    publishPath?: string;
    recipientKeyId?: string;
    status?: 'active' | 'removed';
  },
  etag: string,
): Promise<SaveResult> {
  const pagesDb = getDatabase();
  const key = pageStorageKey(id, data.subdomain);
  const existing = pagesDb.get(key);
  const now = nowIso();

  const page: Page = {
    id,
    subdomain: data.subdomain,
    html: data.html || '',
    markdown: data.markdown,
    image: data.image,
    image_content_type: data.image_content_type || existing?.image_content_type,
    video: data.video,
    video_content_type: data.video_content_type || existing?.video_content_type,
    encoding: data.encoding || 'utf-8',
    content_type: data.content_type || 'text/html; charset=utf-8',
    title: data.title,
    etag,
    created_at: existing?.created_at || now,
    updated_at: now,
    auth: data.auth,
    ownerKeyId: existing?.ownerKeyId || data.ownerKeyId,
    lastUpdatedByKeyId: data.ownerKeyId || existing?.lastUpdatedByKeyId,
    publishSignature: data.publishSignature || existing?.publishSignature,
    contentDigest: data.contentDigest || existing?.contentDigest,
    publishTimestamp: data.publishTimestamp || existing?.publishTimestamp,
    publishNonce: data.publishNonce || existing?.publishNonce,
    publishMethod: data.publishMethod || existing?.publishMethod,
    publishPath: data.publishPath || existing?.publishPath,
    recipientKeyId: data.recipientKeyId !== undefined ? (data.recipientKeyId || undefined) : existing?.recipientKeyId,
    status: data.status || existing?.status || 'active',
  };

  pagesDb.putSync(key, page);

  // Update owner index
  addPageToOwnerIndex(page);

  // Update recipient index: remove old entry if recipient changed, add new if present
  if (existing?.recipientKeyId && existing.recipientKeyId !== page.recipientKeyId) {
    removePageFromRecipientIndex(existing);
  }
  addPageToRecipientIndex(page);

  return {
    page,
    created: !existing,
  };
}

export function getPage(id: string, subdomain?: string): Page | undefined {
  return getDatabase().get(pageStorageKey(id, subdomain));
}

export async function deletePage(id: string, subdomain?: string): Promise<boolean> {
  const pagesDb = getDatabase();
  const key = pageStorageKey(id, subdomain);
  const existing = pagesDb.get(key);
  if (!existing) {
    return false;
  }
  pagesDb.removeSync(key);

  // Remove from owner index
  removePageFromOwnerIndex(existing);

  // Remove from recipient index
  removePageFromRecipientIndex(existing);

  return true;
}

export function getPageCount(): number {
  let count = 0;
  for (const _key of getDatabase().getKeys()) {
    count += 1;
  }
  return count;
}

export function listPagesBySubdomain(subdomain: string): Page[] {
  const pagesDb = getDatabase();
  const prefix = `${subdomain}:`;
  const pages: Page[] = [];

  for (const key of pagesDb.getKeys({ start: prefix })) {
    if (key.startsWith(prefix)) {
      const page = pagesDb.get(key);
      if (page) {
        pages.push(page);
      }
    }
  }

  return pages;
}

export function listPagesBySubdomainPaginated(
  subdomain: string,
  cursor?: string,
  limit: number = 50,
): { pages: PageSummary[]; total: number; next_cursor: string | null } {
  const pagesDb = getDatabase();
  const prefix = `${subdomain}:`;
  const pages: PageSummary[] = [];
  let total = 0;

  // Cursor is the last page ID (within this subdomain) from the previous page
  const startAfterKey = cursor ? `${subdomain}:${cursor}` : undefined;

  for (const key of pagesDb.getKeys({ start: prefix })) {
    if (!key.startsWith(prefix)) break;
    total++;

    if (startAfterKey && key <= startAfterKey) {
      continue;
    }

    if (pages.length < limit) {
      const page = pagesDb.get(key);
      if (page) {
        pages.push({
          id: page.id,
          subdomain: page.subdomain ?? null,
          title: page.title,
          content_type: page.content_type,
          has_markdown: !!page.markdown,
          has_image: !!page.image,
          has_video: !!page.video,
          ownerKeyId: page.ownerKeyId || '',
          recipientKeyId: page.recipientKeyId,
          created_at: page.created_at,
          updated_at: page.updated_at,
          etag: page.etag,
        });
      }
    }
  }

  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const nextCursor = total > pages.length && lastPage ? lastPage.id : null;

  return { pages, total, next_cursor: nextCursor };
}

export async function saveSubdomain(name: string, ownerKeyId?: string): Promise<SubdomainResult> {
  const existing = getSubdomainDatabase().get(name);
  const now = nowIso();

  const subdomain: Subdomain = {
    name,
    created_at: existing?.created_at || now,
    updated_at: now,
    page_count: existing?.page_count || 0,
    ownerKeyId: existing?.ownerKeyId || ownerKeyId,
  };

  getSubdomainDatabase().putSync(name, subdomain);

  return {
    subdomain,
    created: !existing,
  };
}

export function getSubdomain(name: string): Subdomain | undefined {
  return getSubdomainDatabase().get(name);
}

export async function deleteSubdomain(name: string): Promise<boolean> {
  const existing = getSubdomainDatabase().get(name);
  if (!existing) {
    return false;
  }

  const pagesDb = getDatabase();
  const prefix = `${name}:`;
  for (const key of pagesDb.getKeys({ start: prefix })) {
    if (key.startsWith(prefix)) {
      pagesDb.removeSync(key);
    }
  }

  getSubdomainDatabase().removeSync(name);
  return true;
}

export function getSubdomainCount(): number {
  let count = 0;
  for (const _key of getSubdomainDatabase().getKeys()) {
    count += 1;
  }
  return count;
}

export function incrementSubdomainPageCount(name: string): void {
  const subdomain = getSubdomainDatabase().get(name);
  if (subdomain) {
    subdomain.page_count += 1;
    subdomain.updated_at = nowIso();
    getSubdomainDatabase().putSync(name, subdomain);
  }
}

export function decrementSubdomainPageCount(name: string): void {
  const subdomain = getSubdomainDatabase().get(name);
  if (subdomain && subdomain.page_count > 0) {
    subdomain.page_count -= 1;
    subdomain.updated_at = nowIso();
    getSubdomainDatabase().putSync(name, subdomain);
  }
}

export async function saveAgentKey(input: {
  keyId: string;
  publicJwk: AgentKey['publicJwk'];
  scopes?: string[];
  status?: AgentKey['status'];
  plan?: Plan;
}): Promise<AgentKey> {
  const existing = getAgentKey(input.keyId);
  const now = nowIso();
  const record: AgentKey = {
    keyId: input.keyId,
    publicJwk: input.publicJwk,
    scopes: input.scopes || existing?.scopes || [],
    status: input.status || existing?.status || 'active',
    created_at: existing?.created_at || now,
    updated_at: now,
    last_seen_at: existing?.last_seen_at,
    blocked_reason: existing?.blocked_reason,
    blocked_at: existing?.blocked_at,
    revoked_at: existing?.revoked_at,
    // Billing fields — default to free tier for backward compat
    plan: input.plan || existing?.plan || 'free',
    stripeCustomerId: existing?.stripeCustomerId,
    subscriptionId: existing?.subscriptionId,
    monthlyPageCount: existing?.monthlyPageCount || 0,
    monthlySubdomainCount: existing?.monthlySubdomainCount || 0,
    billingCycleStart: existing?.billingCycleStart,
  };

  getAgentKeyDatabase().putSync(input.keyId, record);
  return record;
}

export function getAgentKey(keyId: string): AgentKey | undefined {
  return getAgentKeyDatabase().get(keyId);
}

export function listAgentKeys(): AgentKey[] {
  const keys: AgentKey[] = [];
  for (const keyId of getAgentKeyDatabase().getKeys()) {
    const record = getAgentKeyDatabase().get(keyId);
    if (record) {
      keys.push(record);
    }
  }
  return keys;
}

export function getAgentKeyCount(status?: AgentKey['status']): number {
  let count = 0;
  for (const keyId of getAgentKeyDatabase().getKeys()) {
    if (!status) {
      count += 1;
      continue;
    }

    const record = getAgentKeyDatabase().get(keyId);
    if (record?.status === status) {
      count += 1;
    }
  }
  return count;
}

export async function updateAgentKeyStatus(
  keyId: string,
  status: AgentKey['status'],
  reason?: string,
): Promise<AgentKey | undefined> {
  const existing = getAgentKey(keyId);
  if (!existing) {
    return undefined;
  }

  const now = nowIso();
  const updated: AgentKey = {
    ...existing,
    status,
    updated_at: now,
    blocked_reason: status === 'blocked' ? reason : existing.blocked_reason,
    blocked_at: status === 'blocked' ? now : existing.blocked_at,
    revoked_at: status === 'revoked' ? now : existing.revoked_at,
  };

  getAgentKeyDatabase().putSync(keyId, updated);
  return updated;
}

export async function touchAgentKey(keyId: string): Promise<void> {
  const existing = getAgentKey(keyId);
  if (!existing) {
    return;
  }

  getAgentKeyDatabase().putSync(keyId, {
    ...existing,
    last_seen_at: nowIso(),
    updated_at: nowIso(),
  });
}

export async function registerUsedNonce(keyId: string, nonce: string, expiresAt: string): Promise<boolean> {
  const nonceKey = nonceStorageKey(keyId, nonce);
  const existing = getNonceDatabase().get(nonceKey);
  const now = new Date();

  if (existing) {
    if (new Date(existing.expires_at).getTime() > now.getTime()) {
      return false;
    }
    getNonceDatabase().removeSync(nonceKey);
  }

  const record: NonceRecord = {
    id: nonceKey,
    keyId,
    nonce,
    created_at: now.toISOString(),
    expires_at: expiresAt,
  };

  getNonceDatabase().putSync(nonceKey, record);
  return true;
}

export async function saveAuditLog(record: Omit<AuditLogRecord, 'id' | 'created_at'>): Promise<AuditLogRecord> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const stored: AuditLogRecord = {
    ...record,
    id,
    created_at: nowIso(),
  };

  if (process.env.NODE_ENV === 'test') {
    return stored;
  }

  getAuditLogDatabase().putSync(id, stored);
  return stored;
}

export function listAuditLogsForKey(keyId: string): AuditLogRecord[] {
  const logs: AuditLogRecord[] = [];
  for (const id of getAuditLogDatabase().getKeys()) {
    const record = getAuditLogDatabase().get(id);
    if (record?.keyId === keyId) {
      logs.push(record);
    }
  }
  return logs.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ─── Owner Index ──────────────────────────────────────────

function ownerIndexKey(page: Page): string {
  const suffix = page.subdomain ? `${page.subdomain}:${page.id}` : page.id;
  return `${page.ownerKeyId}/${suffix}`;
}

export function addPageToOwnerIndex(page: Page): void {
  if (!page.ownerKeyId) return;
  const idxDb = getOwnerIndexDatabase();
  const key = ownerIndexKey(page);
  const summary: PageSummary = {
    id: page.id,
    subdomain: page.subdomain ?? null,
    title: page.title,
    content_type: page.content_type,
    has_markdown: !!page.markdown,
    has_image: !!page.image,
    has_video: !!page.video,
    ownerKeyId: page.ownerKeyId,
    recipientKeyId: page.recipientKeyId,
    created_at: page.created_at,
    updated_at: page.updated_at,
    etag: page.etag,
  };
  idxDb.putSync(key, summary);
}

export function removePageFromOwnerIndex(page: Page): void {
  if (!page.ownerKeyId) return;
  const idxDb = getOwnerIndexDatabase();
  const key = ownerIndexKey(page);
  try {
    idxDb.removeSync(key);
  } catch {
    // Key may not exist if page predates owner index
  }
}

export function listPagesByOwner(
  ownerKeyId: string,
  cursor?: string,
  limit: number = 50,
  since?: string,
): { pages: PageSummary[]; total: number; next_cursor: string | null } {
  const idxDb = getOwnerIndexDatabase();
  const prefix = `${ownerKeyId}/`;
  const pages: PageSummary[] = [];
  let total = 0;
  let startAfterKey: string | undefined;

  if (cursor) {
    startAfterKey = cursor;
  }

  for (const key of idxDb.getKeys({ start: prefix })) {
    if (!key.startsWith(prefix)) break;
    total++;

    if (startAfterKey && key <= startAfterKey) {
      continue;
    }

    if (pages.length < limit) {
      const summary = idxDb.get(key);
      if (summary) {
        // Apply since filter (inclusive)
        if (since && summary.created_at < since) continue;
        pages.push(summary);
      }
    }
  }

  const nextCursor = total > pages.length ? pages[pages.length - 1] ? `${prefix}${pages[pages.length - 1].subdomain ? pages[pages.length - 1].subdomain + ':' : ''}${pages[pages.length - 1].id}` : null : null;

  return { pages, total, next_cursor: nextCursor };
}

// ─── Recipient Index ───────────────────────────────────────

function recipientIndexKey(page: Page): string {
  const suffix = page.subdomain ? `${page.subdomain}:${page.id}` : page.id;
  return `${page.recipientKeyId}/${suffix}`;
}

export function addPageToRecipientIndex(page: Page): void {
  if (!page.recipientKeyId) return;
  const idxDb = getRecipientIndexDatabase();
  const key = recipientIndexKey(page);
  const summary: PageSummary = {
    id: page.id,
    subdomain: page.subdomain ?? null,
    title: page.title,
    content_type: page.content_type,
    has_markdown: !!page.markdown,
    has_image: !!page.image,
    has_video: !!page.video,
    ownerKeyId: page.ownerKeyId || '',
    recipientKeyId: page.recipientKeyId,
    created_at: page.created_at,
    updated_at: page.updated_at,
    etag: page.etag,
  };
  idxDb.putSync(key, summary);
}

export function removePageFromRecipientIndex(page: Page): void {
  if (!page.recipientKeyId) return;
  const idxDb = getRecipientIndexDatabase();
  const key = recipientIndexKey(page);
  try {
    idxDb.removeSync(key);
  } catch {
    // Key may not exist
  }
}

export function listPagesByRecipient(
  recipientKeyId: string,
  cursor?: string,
  limit: number = 50,
  since?: string,
): { pages: PageSummary[]; total: number; next_cursor: string | null } {
  const idxDb = getRecipientIndexDatabase();
  const prefix = `${recipientKeyId}/`;
  const pages: PageSummary[] = [];
  let total = 0;
  let startAfterKey: string | undefined;

  if (cursor) {
    startAfterKey = cursor;
  }

  for (const key of idxDb.getKeys({ start: prefix })) {
    if (!key.startsWith(prefix)) break;
    total++;

    if (startAfterKey && key <= startAfterKey) {
      continue;
    }

    const summary = idxDb.get(key);
    if (!summary) continue;

    // Apply since filter (inclusive)
    if (since && summary.created_at < since) continue;

    if (pages.length < limit) {
      pages.push(summary);
    }
  }

  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const nextCursor = total > pages.length && lastPage ? `${recipientKeyId}/${lastPage.subdomain ? lastPage.subdomain + ':' : ''}${lastPage.id}` : null;

  return { pages, total, next_cursor: nextCursor };
}

// ─── Billing-Related Storage ───────────────────────────────

export async function updateAgentKeyPlan(
  keyId: string,
  plan: Plan,
  stripeCustomerId?: string,
  subscriptionId?: string,
): Promise<AgentKey | undefined> {
  const existing = getAgentKey(keyId);
  if (!existing) return undefined;

  const updated: AgentKey = {
    ...existing,
    plan,
    stripeCustomerId: stripeCustomerId ?? existing.stripeCustomerId,
    subscriptionId: subscriptionId ?? existing.subscriptionId,
    updated_at: nowIso(),
  };

  getAgentKeyDatabase().putSync(keyId, updated);
  return updated;
}

export async function incrementAgentKeyUsage(
  keyId: string,
  field: 'monthlyPageCount' | 'monthlySubdomainCount',
): Promise<void> {
  const existing = getAgentKey(keyId);
  if (!existing) return;

  getAgentKeyDatabase().putSync(keyId, {
    ...existing,
    [field]: (existing[field] || 0) + 1,
    updated_at: nowIso(),
  });
}

export async function resetAgentKeyUsage(keyId: string): Promise<void> {
  const existing = getAgentKey(keyId);
  if (!existing) return;

  getAgentKeyDatabase().putSync(keyId, {
    ...existing,
    monthlyPageCount: 0,
    monthlySubdomainCount: 0,
    billingCycleStart: nowIso(),
    updated_at: nowIso(),
  });
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = undefined as unknown as Database<Page, string>;
  }
  if (subdomainDb) {
    await subdomainDb.close();
    subdomainDb = undefined as unknown as Database<Subdomain, string>;
  }
  if (agentKeyDb) {
    await agentKeyDb.close();
    agentKeyDb = undefined as unknown as Database<AgentKey, string>;
  }
  if (nonceDb) {
    await nonceDb.close();
    nonceDb = undefined as unknown as Database<NonceRecord, string>;
  }
  if (auditLogDb) {
    await auditLogDb.close();
    auditLogDb = undefined as unknown as Database<AuditLogRecord, string>;
  }
  if (ownerIndexDb) {
    await ownerIndexDb.close();
    ownerIndexDb = undefined as unknown as Database<PageSummary, string>;
  }
  if (recipientIndexDb) {
    await recipientIndexDb.close();
    recipientIndexDb = undefined as unknown as Database<PageSummary, string>;
  }
}
