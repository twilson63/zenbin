import crypto from 'node:crypto';
import { open, Database } from 'lmdb';
import { config } from '../config.js';
import { deleteVideo } from './video.js';
import { PLAN_LIMITS, isBillingCycleExpired } from '../rules.js';
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
  Attestation,
  CustomDomain,
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
  Attestation,
  CustomDomain,
};

let db: Database<Page, string>;
let subdomainDb: Database<Subdomain, string>;
let customDomainDb: Database<CustomDomain, string>;
let agentKeyDb: Database<AgentKey, string>;
let nonceDb: Database<NonceRecord, string>;
let auditLogDb: Database<AuditLogRecord, string>;
let ownerIndexDb: Database<PageSummary, string>;
let recipientIndexDb: Database<PageSummary, string>;
let attestationSubjectIndexDb: Database<PageSummary, string>;
let attestationTypeSubjectIndexDb: Database<PageSummary, string>;

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
  attestation?: import('../types.js').Attestation;
  created_at: string;
  updated_at: string;
  etag: string;
}

export function initDatabase(): {
  pages: Database<Page, string>;
  subdomains: Database<Subdomain, string>;
  customDomains: Database<CustomDomain, string>;
  agentKeys: Database<AgentKey, string>;
  nonces: Database<NonceRecord, string>;
  auditLogs: Database<AuditLogRecord, string>;
  ownerIndex: Database<PageSummary, string>;
  recipientIndex: Database<PageSummary, string>;
  attestationSubjectIndex: Database<PageSummary, string>;
  attestationTypeSubjectIndex: Database<PageSummary, string>;
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
  if (!customDomainDb) {
    customDomainDb = open<CustomDomain, string>({
      path: `${config.lmdbPath}-custom-domains`,
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
  if (!attestationSubjectIndexDb) {
    attestationSubjectIndexDb = open<PageSummary, string>({
      path: `${config.lmdbPath}-attestation-subject-index`,
      compression: true,
    });
  }
  if (!attestationTypeSubjectIndexDb) {
    attestationTypeSubjectIndexDb = open<PageSummary, string>({
      path: `${config.lmdbPath}-attestation-type-subject-index`,
      compression: true,
    });
  }

  return {
    pages: db,
    subdomains: subdomainDb,
    customDomains: customDomainDb,
    agentKeys: agentKeyDb,
    nonces: nonceDb,
    auditLogs: auditLogDb,
    ownerIndex: ownerIndexDb,
    recipientIndex: recipientIndexDb,
    attestationSubjectIndex: attestationSubjectIndexDb,
    attestationTypeSubjectIndex: attestationTypeSubjectIndexDb,
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
 * Backfill publicKeyFingerprint for existing keys that don't have one.
 * Called once after database initialization.
 */
export function backfillKeyFingerprints(): { updated: number; skipped: number } {
  const keysDb = getAgentKeyDatabase();
  let updated = 0;
  let skipped = 0;

  for (const keyId of keysDb.getKeys()) {
    const key = keysDb.get(keyId);
    if (!key) continue;

    if (key.publicKeyFingerprint) {
      skipped++;
      continue;
    }

    // Compute fingerprint from public JWK
    const x = key.publicJwk?.x;
    if (!x || typeof x !== 'string') {
      skipped++;
      continue;
    }

    const pubKeyBuf = Buffer.from(x as string, 'base64url');
    const fingerprint = crypto.createHash('sha256').update(pubKeyBuf).digest('base64url');

    key.publicKeyFingerprint = fingerprint;
    keysDb.putSync(keyId, key);
    updated++;
  }

  return { updated, skipped };
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

export function getCustomDomainDatabase(): Database<CustomDomain, string> {
  if (!customDomainDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return customDomainDb;
}

export function getAgentKeyDatabase(): Database<AgentKey, string> {
  if (!customDomainDb) {
    customDomainDb = open<CustomDomain, string>({
      path: `${config.lmdbPath}-custom-domains`,
      compression: true,
    });
  }
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

export function getAttestationSubjectIndexDatabase(): Database<PageSummary, string> {
  if (!attestationSubjectIndexDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return attestationSubjectIndexDb;
}

export function getAttestationTypeSubjectIndexDatabase(): Database<PageSummary, string> {
  if (!attestationTypeSubjectIndexDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return attestationTypeSubjectIndexDb;
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
    auth?: { passwordHash?: string; urlTokenHash?: string; signToRead?: boolean };
    ownerKeyId?: string;
    publishSignature?: string;
    contentDigest?: string;
    publishTimestamp?: string;
    publishNonce?: string;
    publishMethod?: string;
    publishPath?: string;
    recipientKeyId?: string | null;
    attestation?: import('../types.js').Attestation | null;
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
    recipientKeyId: data.recipientKeyId === null ? undefined : (data.recipientKeyId !== undefined ? data.recipientKeyId : existing?.recipientKeyId),
    attestation: data.attestation === null ? undefined : (data.attestation !== undefined ? data.attestation : existing?.attestation),
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

  // Update attestation indexes: remove old if changed, add new if present
  if (existing?.attestation && existing.attestation !== page.attestation) {
    removePageFromAttestationIndexes(existing);
  }
  if (page.attestation) {
    addPageToAttestationIndexes(page);
  }

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

  // Remove from attestation indexes
  if (existing.attestation) {
    removePageFromAttestationIndexes(existing);
  }

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
  // Whether at least one post-cursor entry exists beyond the current page.
  let hasMore = false;

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
          attestation: page.attestation,
          created_at: page.created_at,
          updated_at: page.updated_at,
          etag: page.etag,
        });
      }
    } else {
      // A post-cursor entry exists past this page → there is a next page.
      hasMore = true;
    }
  }

  // Only emit a cursor when there is genuinely more after the last returned
  // page (previously `total > pages.length` was true on the final page too,
  // since `total` counts the whole collection, causing a spurious empty fetch).
  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const nextCursor = hasMore && lastPage ? lastPage.id : null;

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
    if (!key.startsWith(prefix)) break;
    const page = pagesDb.get(key);
    if (!page) continue;

    // Maintain every index and clean up video files, mirroring deletePage —
    // a raw removeSync here would leave phantom index entries and orphan videos.
    removePageFromOwnerIndex(page);
    removePageFromRecipientIndex(page);
    if (page.attestation) {
      removePageFromAttestationIndexes(page);
    }
    if (page.video) {
      await deleteVideo(page.video);
    }
    pagesDb.removeSync(key);
  }

  getSubdomainDatabase().removeSync(name);
  return true;
}

export function createCustomDomain(input: {
  hostname: string;
  subdomain: string;
  ownerKeyId: string;
  verificationToken: string;
  verificationTokenHash: string;
}): { domain: CustomDomain; created: boolean } {
  const domains = getCustomDomainDatabase();
  return domains.transactionSync(() => {
    const existing = domains.get(input.hostname);
    if (existing) return { domain: existing, created: false };
    // MVP supports one hostname per subdomain; later aliases require an explicit
    // product-level expansion rather than accidentally becoming supported here.
    for (const key of domains.getKeys()) {
      const candidate = domains.get(key);
      if (candidate?.subdomain === input.subdomain) return { domain: candidate, created: false };
    }
    const now = nowIso();
    const domain: CustomDomain = {
      hostname: input.hostname,
      subdomain: input.subdomain,
      ownerKeyId: input.ownerKeyId,
      verificationToken: input.verificationToken,
      verificationTokenHash: input.verificationTokenHash,
      verificationStatus: 'pending',
      certificateStatus: 'pending',
      lifecycleStatus: 'pending_dns',
      primaryDomain: listCustomDomainsBySubdomain(input.subdomain).length === 0,
      createdAt: now,
      updatedAt: now,
    };
    domains.putSync(input.hostname, domain);
    return { domain, created: true };
  });
}

export function getCustomDomain(hostname: string): CustomDomain | undefined {
  return getCustomDomainDatabase().get(hostname);
}

export function getActiveCustomDomain(hostname: string): CustomDomain | undefined {
  const domain = getCustomDomain(hostname);
  return domain?.lifecycleStatus === 'active' && domain.certificateStatus === 'active' && domain.verificationStatus === 'verified'
    ? domain
    : undefined;
}

export function listCustomDomainsBySubdomain(subdomain: string): CustomDomain[] {
  const domains: CustomDomain[] = [];
  for (const hostname of getCustomDomainDatabase().getKeys()) {
    const domain = getCustomDomainDatabase().get(hostname);
    if (domain?.subdomain === subdomain) domains.push(domain);
  }
  return domains.sort((a, b) => a.hostname.localeCompare(b.hostname));
}

export function updateCustomDomain(hostname: string, patch: Partial<Omit<CustomDomain, 'hostname' | 'createdAt'>>): CustomDomain | undefined {
  const domains = getCustomDomainDatabase();
  const existing = domains.get(hostname);
  if (!existing) return undefined;
  const updated: CustomDomain = { ...existing, ...patch, hostname, createdAt: existing.createdAt, updatedAt: nowIso() };
  domains.putSync(hostname, updated);
  return updated;
}

export function deleteCustomDomain(hostname: string): boolean {
  const domains = getCustomDomainDatabase();
  if (!domains.get(hostname)) return false;
  domains.removeSync(hostname);
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
  publicKeyFingerprint?: string;
  scopes?: string[];
  status?: AgentKey['status'];
  plan?: Plan;
}): Promise<AgentKey> {
  const existing = getAgentKey(input.keyId);
  const now = nowIso();
  const record: AgentKey = {
    keyId: input.keyId,
    publicJwk: input.publicJwk,
    publicKeyFingerprint: input.publicKeyFingerprint || existing?.publicKeyFingerprint || '',
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
  const nDb = getNonceDatabase();
  const now = Date.now();

  // Atomic insert-if-absent: the get-check-put runs inside one transaction so
  // concurrent replays of the same captured signature cannot all succeed.
  return nDb.transactionSync(() => {
    const existing = nDb.get(nonceKey);
    if (existing && new Date(existing.expires_at).getTime() > now) {
      return false; // still-valid nonce already used → replay
    }

    const record: NonceRecord = {
      id: nonceKey,
      keyId,
      nonce,
      created_at: new Date(now).toISOString(),
      expires_at: expiresAt,
    };
    nDb.putSync(nonceKey, record);
    return true;
  });
}

/**
 * Remove expired nonce records. Without this the nonce store grows linearly
 * with every signed request ever made (honest clients never re-present a
 * nonce, so the inline cleanup in registerUsedNonce never fires for them).
 * Call periodically from the server entry point.
 */
export function cleanupExpiredNonces(): number {
  const nDb = getNonceDatabase();
  const now = Date.now();
  let removed = 0;
  for (const key of nDb.getKeys()) {
    const rec = nDb.get(key);
    if (rec && new Date(rec.expires_at).getTime() <= now) {
      nDb.removeSync(key);
      removed++;
    }
  }
  return removed;
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
    attestation: page.attestation,
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

    if (startAfterKey && key <= startAfterKey) {
      continue;
    }

    const summary = idxDb.get(key);
    if (!summary) continue;

    // Apply since filter (inclusive)
    if (since && summary.created_at < since) continue;

    total++;
    if (pages.length < limit) {
      pages.push(summary);
    }
  }

  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const nextCursor = total > pages.length && lastPage ? `${prefix}${lastPage.subdomain ? lastPage.subdomain + ':' : ''}${lastPage.id}` : null;

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
    attestation: page.attestation,
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

    if (startAfterKey && key <= startAfterKey) {
      continue;
    }

    const summary = idxDb.get(key);
    if (!summary) continue;

    // Apply since filter (inclusive)
    if (since && summary.created_at < since) continue;

    total++;
    if (pages.length < limit) {
      pages.push(summary);
    }
  }

  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const nextCursor = total > pages.length && lastPage ? `${recipientKeyId}/${lastPage.subdomain ? lastPage.subdomain + ':' : ''}${lastPage.id}` : null;

  return { pages, total, next_cursor: nextCursor };
}

// ─── Attestation Indexes ────────────────────────────────────

function attestationSubjectIndexKey(page: Page): string {
  const subjectId = page.attestation!.subject.id;
  const ownerKeyId = page.ownerKeyId || '';
  const storageKey = page.subdomain ? `${page.subdomain}:${page.id}` : page.id;
  return `${encodeURIComponent(subjectId)}:${ownerKeyId}:${storageKey}`;
}

function attestationTypeSubjectIndexKey(page: Page): string {
  const att = page.attestation!;
  const subjectId = att.subject.id;
  const ownerKeyId = page.ownerKeyId || '';
  const storageKey = page.subdomain ? `${page.subdomain}:${page.id}` : page.id;
  return `${att.type}:${encodeURIComponent(subjectId)}:${ownerKeyId}:${storageKey}`;
}

export function addPageToAttestationIndexes(page: Page): void {
  if (!page.attestation || !page.ownerKeyId) return;

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
    attestation: page.attestation,
    created_at: page.created_at,
    updated_at: page.updated_at,
    etag: page.etag,
  };

  const subjectKey = attestationSubjectIndexKey(page);
  getAttestationSubjectIndexDatabase().putSync(subjectKey, summary);

  const typeSubjectKey = attestationTypeSubjectIndexKey(page);
  getAttestationTypeSubjectIndexDatabase().putSync(typeSubjectKey, summary);
}

export function removePageFromAttestationIndexes(page: Page): void {
  if (!page.attestation || !page.ownerKeyId) return;

  const subjectKey = attestationSubjectIndexKey(page);
  try {
    getAttestationSubjectIndexDatabase().removeSync(subjectKey);
  } catch {
    // Key may not exist
  }

  const typeSubjectKey = attestationTypeSubjectIndexKey(page);
  try {
    getAttestationTypeSubjectIndexDatabase().removeSync(typeSubjectKey);
  } catch {
    // Key may not exist
  }
}

export function listAttestationsBySubject(
  subjectId: string,
  cursor?: string,
  limit: number = 50,
  since?: string,
): { pages: PageSummary[]; total: number; next_cursor: string | null } {
  const idxDb = getAttestationSubjectIndexDatabase();
  const encodedSubjectId = encodeURIComponent(subjectId);
  const prefix = `${encodedSubjectId}:`;
  const pages: PageSummary[] = [];
  let total = 0;

  for (const key of idxDb.getKeys({ start: prefix })) {
    if (!key.startsWith(prefix)) break;

    if (cursor && key <= cursor) {
      continue;
    }

    const summary = idxDb.get(key);
    if (!summary) continue;

    // Apply since filter (inclusive)
    if (since && summary.created_at < since) continue;

    total++;
    if (pages.length < limit) {
      pages.push(summary);
    }
  }

  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const nextCursor = total > pages.length && lastPage
    ? `${encodedSubjectId}:${lastPage.ownerKeyId}:${lastPage.subdomain ? lastPage.subdomain + ':' : ''}${lastPage.id}`
    : null;

  return { pages, total, next_cursor: nextCursor };
}

export function listAttestationsByTypeAndSubject(
  type: string,
  subjectId: string,
  cursor?: string,
  limit: number = 50,
  since?: string,
): { pages: PageSummary[]; total: number; next_cursor: string | null } {
  const idxDb = getAttestationTypeSubjectIndexDatabase();
  const encodedSubjectId = encodeURIComponent(subjectId);
  const prefix = `${type}:${encodedSubjectId}:`;
  const pages: PageSummary[] = [];
  let total = 0;

  for (const key of idxDb.getKeys({ start: prefix })) {
    if (!key.startsWith(prefix)) break;

    if (cursor && key <= cursor) {
      continue;
    }

    const summary = idxDb.get(key);
    if (!summary) continue;

    // Apply since filter (inclusive)
    if (since && summary.created_at < since) continue;

    total++;
    if (pages.length < limit) {
      pages.push(summary);
    }
  }

  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const nextCursor = total > pages.length && lastPage
    ? `${type}:${encodedSubjectId}:${lastPage.ownerKeyId}:${lastPage.subdomain ? lastPage.subdomain + ':' : ''}${lastPage.id}`
    : null;

  return { pages, total, next_cursor: nextCursor };
}

export function backfillAttestationIndexes(): { indexed: number; skipped: number } {
  const pagesDb = getDatabase();
  let indexed = 0;
  let skipped = 0;

  for (const key of pagesDb.getKeys({})) {
    const page = pagesDb.get(key);
    if (!page) continue;

    if (!page.attestation || !page.ownerKeyId) {
      skipped++;
      continue;
    }

    // Check if already indexed
    const subjectKey = attestationSubjectIndexKey(page);
    const idxDb = getAttestationSubjectIndexDatabase();
    const existing = idxDb.get(subjectKey);
    if (existing) {
      continue; // Already indexed
    }

    addPageToAttestationIndexes(page);
    indexed++;
  }

  return { indexed, skipped };
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

/**
 * Atomically check the page quota and reserve one slot for a NEW page.
 * Resetting an expired billing cycle, the limit check, and the increment all
 * happen inside one LMDB transaction so concurrent publishes cannot each pass
 * the check before any increment lands. Call releasePageQuota on failure paths.
 */
export function reservePageQuota(
  keyId: string,
  windowMs: number,
): { allowed: boolean; reason?: string; plan: Plan } {
  const akDb = getAgentKeyDatabase();
  return akDb.transactionSync(() => {
    const existing = akDb.get(keyId);
    // Unknown key: nothing to meter (mirrors prior free/0 fallback behaviour).
    if (!existing) return { allowed: true, plan: 'free' as Plan };

    let rec = existing;
    if (isBillingCycleExpired(existing.billingCycleStart, windowMs)) {
      rec = { ...existing, monthlyPageCount: 0, monthlySubdomainCount: 0, billingCycleStart: nowIso() };
    }
    const plan: Plan = rec.plan || 'free';
    const limit = PLAN_LIMITS[plan].pagesPerMonth;
    const count = rec.monthlyPageCount || 0;
    if (count >= limit) {
      // Persist the cycle reset even when rejecting, so the window advances.
      if (rec !== existing) akDb.putSync(keyId, { ...rec, updated_at: nowIso() });
      return {
        allowed: false,
        reason: `Free tier limit of ${limit} pages per month exceeded. Upgrade to Pro for unlimited pages.`,
        plan,
      };
    }
    akDb.putSync(keyId, { ...rec, monthlyPageCount: count + 1, updated_at: nowIso() });
    return { allowed: true, plan };
  });
}

/** Release a previously reserved page slot (e.g. the publish failed). */
export function releasePageQuota(keyId: string): void {
  const akDb = getAgentKeyDatabase();
  akDb.transactionSync(() => {
    const existing = akDb.get(keyId);
    if (!existing) return;
    const count = existing.monthlyPageCount || 0;
    if (count <= 0) return;
    akDb.putSync(keyId, { ...existing, monthlyPageCount: count - 1, updated_at: nowIso() });
  });
}

/** Count subdomains actually owned by a key (used for the ownership cap). */
export function countSubdomainsByOwner(ownerKeyId: string): number {
  const sdDb = getSubdomainDatabase();
  let owned = 0;
  for (const key of sdDb.getKeys()) {
    const s = sdDb.get(key);
    if (s?.ownerKeyId === ownerKeyId) owned++;
  }
  return owned;
}

/**
 * Atomically enforce the subdomain ownership cap and claim the name in one
 * transaction. The cap is checked against the number of subdomains the key
 * actually owns (not a monthly counter that resets), and the claim is written
 * inside the same transaction so two concurrent claims cannot both pass.
 */
export function reserveAndClaimSubdomain(
  name: string,
  ownerKeyId: string | undefined,
  plan: Plan,
): { allowed: boolean; reason?: string; created: boolean; subdomain?: Subdomain } {
  const sdDb = getSubdomainDatabase();
  return sdDb.transactionSync(() => {
    const existing = sdDb.get(name);
    if (existing) {
      return { allowed: true, created: false, subdomain: existing };
    }

    const limit = PLAN_LIMITS[plan].subdomains;
    if (limit !== Infinity && ownerKeyId) {
      let owned = 0;
      for (const key of sdDb.getKeys()) {
        const s = sdDb.get(key);
        if (s?.ownerKeyId === ownerKeyId) {
          owned++;
          if (owned >= limit) break;
        }
      }
      if (owned >= limit) {
        return {
          allowed: false,
          created: false,
          reason: `${plan === 'free' ? 'Free tier' : 'Pro plan'} limit of ${limit} subdomain${limit !== 1 ? 's' : ''} reached. Upgrade for more.`,
        };
      }
    }

    const now = nowIso();
    const subdomain: Subdomain = {
      name,
      created_at: now,
      updated_at: now,
      page_count: 0,
      ownerKeyId,
    };
    sdDb.putSync(name, subdomain);
    return { allowed: true, created: true, subdomain };
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
  if (customDomainDb) {
    await customDomainDb.close();
    customDomainDb = undefined as unknown as Database<CustomDomain, string>;
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
  if (attestationSubjectIndexDb) {
    await attestationSubjectIndexDb.close();
    attestationSubjectIndexDb = undefined as unknown as Database<PageSummary, string>;
  }
  if (attestationTypeSubjectIndexDb) {
    await attestationTypeSubjectIndexDb.close();
    attestationTypeSubjectIndexDb = undefined as unknown as Database<PageSummary, string>;
  }
}
