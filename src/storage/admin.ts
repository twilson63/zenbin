import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

export interface User {
  id: string;
  email: string;
  email_verified: number;
  verification_token?: string;
  verification_expires?: number;
  created_at: number;
  last_login?: number;
}

export interface ApiKey {
  id: string;
  user_id: string;
  type: string;
  plan: string;
  name?: string;
  monthly_limit: number;
  created_at: number;
  last_used?: number;
  revoked_at?: number;
}

export interface UsageLog {
  id: number;
  key_id: string;
  period: string;
  requests: number;
  bytes_sent: number;
  endpoint?: string;
  timestamp: number;
}

export interface EmailToken {
  token: string;
  user_id: string;
  email: string;
  type: string;
  expires_at: number;
  used_at?: number;
}

export interface Subdomain {
  name: string;
  user_id?: string;
  key_id?: string;
  page_count: number;
  created_at: number;
}

let db: Database.Database | null = null;

export function initAdminDatabase(dbPath?: string): Database.Database {
  if (db) {
    return db;
  }

  const adminPath = dbPath || path.resolve('./data/admin.sqlite');
  const dir = path.dirname(adminPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(adminPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = OFF');

  runMigrations(db);

  return db;
}

export function getAdminDatabase(): Database.Database {
  if (!db) {
    throw new Error('Admin database not initialized. Call initAdminDatabase() first.');
  }
  return db;
}

function runMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT,
      verification_expires INTEGER,
      created_at INTEGER NOT NULL,
      last_login INTEGER
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      type TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      name TEXT,
      monthly_limit INTEGER DEFAULT 100,
      created_at INTEGER NOT NULL,
      last_used INTEGER,
      revoked_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_id TEXT NOT NULL REFERENCES api_keys(id),
      period TEXT NOT NULL,
      requests INTEGER DEFAULT 1,
      bytes_sent INTEGER DEFAULT 0,
      endpoint TEXT,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      email TEXT NOT NULL,
      type TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS subdomains (
      name TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      key_id TEXT REFERENCES api_keys(id),
      page_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_key_period ON usage_logs(key_id, period);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
  `);
}

// ============ User CRUD ============

export function createUser(user: User): User {
  const db = getAdminDatabase();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, email_verified, verification_token, verification_expires, created_at, last_login)
    VALUES (@id, @email, @email_verified, @verification_token, @verification_expires, @created_at, @last_login)
  `);
  stmt.run({
    ...user,
    verification_token: user.verification_token ?? null,
    verification_expires: user.verification_expires ?? null,
    last_login: user.last_login ?? null,
  });
  return user;
}

export function getUserById(id: string): User | undefined {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const db = getAdminDatabase();
  const existing = getUserById(id);
  if (!existing) {
    return undefined;
  }
  const updated = { ...existing, ...updates };
  const stmt = db.prepare(`
    UPDATE users SET
      email = @email,
      email_verified = @email_verified,
      verification_token = @verification_token,
      verification_expires = @verification_expires,
      last_login = @last_login
    WHERE id = @id
  `);
  stmt.run({
    ...updated,
    verification_token: updated.verification_token ?? null,
    verification_expires: updated.verification_expires ?? null,
    last_login: updated.last_login ?? null,
  });
  return updated;
}

export function deleteUser(id: string): boolean {
  const db = getAdminDatabase();
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============ API Key CRUD ============

export function createApiKey(key: ApiKey): ApiKey {
  const db = getAdminDatabase();
  const stmt = db.prepare(`
    INSERT INTO api_keys (id, user_id, type, plan, name, monthly_limit, created_at, last_used, revoked_at)
    VALUES (@id, @user_id, @type, @plan, @name, @monthly_limit, @created_at, @last_used, @revoked_at)
  `);
  stmt.run({
    ...key,
    name: key.name ?? null,
    last_used: key.last_used ?? null,
    revoked_at: key.revoked_at ?? null,
  });
  return key;
}

export function getApiKeyById(id: string): ApiKey | undefined {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM api_keys WHERE id = ?');
  return stmt.get(id) as ApiKey | undefined;
}

export function getApiKeysByUserId(userId: string): ApiKey[] {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM api_keys WHERE user_id = ?');
  return stmt.all(userId) as ApiKey[];
}

export function updateApiKey(id: string, updates: Partial<ApiKey>): ApiKey | undefined {
  const db = getAdminDatabase();
  const existing = getApiKeyById(id);
  if (!existing) {
    return undefined;
  }
  const updated = { ...existing, ...updates };
  const stmt = db.prepare(`
    UPDATE api_keys SET
      user_id = @user_id,
      type = @type,
      plan = @plan,
      name = @name,
      monthly_limit = @monthly_limit,
      last_used = @last_used,
      revoked_at = @revoked_at
    WHERE id = @id
  `);
  stmt.run({
    ...updated,
    name: updated.name ?? null,
    last_used: updated.last_used ?? null,
    revoked_at: updated.revoked_at ?? null,
  });
  return updated;
}

export function revokeApiKey(id: string): ApiKey | undefined {
  return updateApiKey(id, { revoked_at: Date.now() });
}

// ============ Usage Tracking ============

export function logUsage(log: UsageLog): UsageLog {
  const db = getAdminDatabase();
  const stmt = db.prepare(`
    INSERT INTO usage_logs (key_id, period, requests, bytes_sent, endpoint, timestamp)
    VALUES (@key_id, @period, @requests, @bytes_sent, @endpoint, @timestamp)
  `);
  const result = stmt.run({
    ...log,
    endpoint: log.endpoint ?? null,
  });
  return { ...log, id: result.lastInsertRowid as number };
}

export function getUsageForKey(keyId: string, period: string): UsageLog | undefined {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM usage_logs WHERE key_id = ? AND period = ?');
  return stmt.get(keyId, period) as UsageLog | undefined;
}

export function getUsageForKeyInRange(keyId: string, startTime: number, endTime: number): UsageLog[] {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM usage_logs WHERE key_id = ? AND timestamp >= ? AND timestamp <= ?');
  return stmt.all(keyId, startTime, endTime) as UsageLog[];
}

export function incrementUsage(keyId: string, period: string, requests: number = 1, bytesSent: number = 0): void {
  const db = getAdminDatabase();
  const existing = getUsageForKey(keyId, period);
  if (existing) {
    const stmt = db.prepare(`
      UPDATE usage_logs SET requests = requests + ?, bytes_sent = bytes_sent + ?
      WHERE key_id = ? AND period = ?
    `);
    stmt.run(requests, bytesSent, keyId, period);
  } else {
    const log: UsageLog = {
      id: 0,
      key_id: keyId,
      period,
      requests,
      bytes_sent: bytesSent,
      timestamp: Date.now(),
    };
    logUsage(log);
  }
}

// ============ Monthly Limit Enforcement ============

export function checkMonthlyLimit(keyId: string): { allowed: boolean; remaining: number; used: number } {
  const key = getApiKeyById(keyId);
  if (!key || key.revoked_at) {
    return { allowed: false, remaining: 0, used: 0 };
  }

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const usage = getUsageForKey(keyId, period);

  const used = usage?.requests || 0;
  const remaining = key.monthly_limit - used;
  const allowed = remaining > 0;

  return { allowed, remaining: Math.max(0, remaining), used };
}

// ============ Email Token CRUD ============

export function createEmailToken(token: EmailToken): EmailToken {
  const db = getAdminDatabase();
  const stmt = db.prepare(`
    INSERT INTO email_tokens (token, user_id, email, type, expires_at, used_at)
    VALUES (@token, @user_id, @email, @type, @expires_at, @used_at)
  `);
  stmt.run({
    ...token,
    used_at: token.used_at ?? null,
  });
  return token;
}

export function getEmailToken(token: string): EmailToken | undefined {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM email_tokens WHERE token = ?');
  return stmt.get(token) as EmailToken | undefined;
}

export function useEmailToken(token: string): EmailToken | undefined {
  const db = getAdminDatabase();
  const existing = getEmailToken(token);
  if (!existing || existing.used_at) {
    return undefined;
  }
  if (existing.expires_at < Date.now()) {
    return undefined;
  }
  const stmt = db.prepare('UPDATE email_tokens SET used_at = ? WHERE token = ?');
  stmt.run(Date.now(), token);
  return existing;
}

export function deleteEmailToken(token: string): boolean {
  const db = getAdminDatabase();
  const stmt = db.prepare('DELETE FROM email_tokens WHERE token = ?');
  const result = stmt.run(token);
  return result.changes > 0;
}

// ============ Subdomain CRUD ============

export function createSubdomain(subdomain: Subdomain): Subdomain {
  const db = getAdminDatabase();
  const stmt = db.prepare(`
    INSERT INTO subdomains (name, user_id, key_id, page_count, created_at)
    VALUES (@name, @user_id, @key_id, @page_count, @created_at)
  `);
  stmt.run({
    ...subdomain,
    user_id: subdomain.user_id ?? null,
    key_id: subdomain.key_id ?? null,
  });
  return subdomain;
}

export function getSubdomainByName(name: string): Subdomain | undefined {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM subdomains WHERE name = ?');
  return stmt.get(name) as Subdomain | undefined;
}

export function getSubdomainsByUserId(userId: string): Subdomain[] {
  const db = getAdminDatabase();
  const stmt = db.prepare('SELECT * FROM subdomains WHERE user_id = ?');
  return stmt.all(userId) as Subdomain[];
}

export function updateSubdomain(name: string, updates: Partial<Subdomain>): Subdomain | undefined {
  const db = getAdminDatabase();
  const existing = getSubdomainByName(name);
  if (!existing) {
    return undefined;
  }
  const updated = { ...existing, ...updates };
  const stmt = db.prepare(`
    UPDATE subdomains SET
      user_id = @user_id,
      key_id = @key_id,
      page_count = @page_count
    WHERE name = @name
  `);
  stmt.run({
    ...updated,
    user_id: updated.user_id ?? null,
    key_id: updated.key_id ?? null,
  });
  return updated;
}

export function deleteSubdomain(name: string): boolean {
  const db = getAdminDatabase();
  const stmt = db.prepare('DELETE FROM subdomains WHERE name = ?');
  const result = stmt.run(name);
  return result.changes > 0;
}

export function closeAdminDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}