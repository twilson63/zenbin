import { open, Database } from 'lmdb';
import { config } from '../config.js';

type StoredJwk = Record<string, string | boolean | undefined>;

export interface PageAuth {
  passwordHash?: string;
  urlTokenHash?: string;
}

export interface Page {
  id: string;
  subdomain?: string;
  html: string;
  markdown?: string;
  image?: string;
  image_content_type?: string;
  video?: string;
  video_content_type?: string;
  encoding: 'utf-8' | 'base64';
  content_type: string;
  title?: string;
  etag: string;
  created_at: string;
  updated_at: string;
  auth?: PageAuth;
  ownerKeyId?: string;
  lastUpdatedByKeyId?: string;
  status?: 'active' | 'removed';
}

export interface Subdomain {
  name: string;
  created_at: string;
  updated_at: string;
  page_count: number;
  ownerKeyId?: string;
}

export interface AgentKey {
  keyId: string;
  publicJwk: StoredJwk;
  status: 'active' | 'blocked' | 'revoked';
  scopes: string[];
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  blocked_reason?: string;
  blocked_at?: string;
  revoked_at?: string;
}

export interface NonceRecord {
  id: string;
  keyId: string;
  nonce: string;
  expires_at: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  targetType: 'page' | 'subdomain' | 'agent_key' | 'auth';
  keyId?: string;
  pageId?: string;
  subdomain?: string;
  status: 'accepted' | 'rejected';
  reason?: string;
  created_at: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface SaveResult {
  page: Page;
  created: boolean;
}

export interface SubdomainResult {
  subdomain: Subdomain;
  created: boolean;
}

let db: Database<Page, string>;
let subdomainDb: Database<Subdomain, string>;
let agentKeyDb: Database<AgentKey, string>;
let nonceDb: Database<NonceRecord, string>;
let auditLogDb: Database<AuditLogRecord, string>;

export function initDatabase(): {
  pages: Database<Page, string>;
  subdomains: Database<Subdomain, string>;
  agentKeys: Database<AgentKey, string>;
  nonces: Database<NonceRecord, string>;
  auditLogs: Database<AuditLogRecord, string>;
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

  return {
    pages: db,
    subdomains: subdomainDb,
    agentKeys: agentKeyDb,
    nonces: nonceDb,
    auditLogs: auditLogDb,
  };
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
    status: data.status || existing?.status || 'active',
  };

  pagesDb.putSync(key, page);

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
  return true;
}

export function getPageCount(): number {
  return getDatabase().getKeys().asArray.length;
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
  return getSubdomainDatabase().getKeys().asArray.length;
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
  publicJwk: StoredJwk;
  scopes?: string[];
  status?: AgentKey['status'];
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
}
