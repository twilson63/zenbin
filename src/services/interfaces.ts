/**
 * ZenBin Service Interfaces
 *
 * Abstract contracts that route handlers depend on.
 * Implementations live in src/services/implementations/.
 * This allows swapping DB, adding caching, or mocking for tests.
 */

import type {
  Page,
  Subdomain,
  AgentKey,
  NonceRecord,
  AuditLogRecord,
  SaveResult,
  SubdomainResult,
  Plan,
  LimitCheckResult,
} from '../types.js';

// ─── Page Service ───────────────────────────────────────────

export interface IPageService {
  save(id: string, data: {
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
  }, etag: string): Promise<SaveResult>;

  get(id: string, subdomain?: string): Page | undefined;
  delete(id: string, subdomain?: string): Promise<boolean>;
  count(): number;
  listBySubdomain(subdomain: string): Page[];
}

// ─── Subdomain Service ──────────────────────────────────────

export interface ISubdomainService {
  save(name: string, ownerKeyId?: string): Promise<SubdomainResult>;
  get(name: string): Subdomain | undefined;
  delete(name: string): Promise<boolean>;
  count(): number;
  incrementPageCount(name: string): void;
  decrementPageCount(name: string): void;
}

// ─── Key Service ────────────────────────────────────────────

export interface IKeyService {
  save(input: {
    keyId: string;
    publicJwk: AgentKey['publicJwk'];
    scopes?: string[];
    status?: AgentKey['status'];
    plan?: Plan;
  }): Promise<AgentKey>;
  get(keyId: string): AgentKey | undefined;
  list(): AgentKey[];
  count(status?: AgentKey['status']): number;
  updateStatus(keyId: string, status: AgentKey['status'], reason?: string): Promise<AgentKey | undefined>;
  touch(keyId: string): Promise<void>;
  updatePlan(keyId: string, plan: Plan, stripeCustomerId?: string, subscriptionId?: string): Promise<AgentKey | undefined>;
  incrementUsage(keyId: string, field: 'monthlyPageCount' | 'monthlySubdomainCount'): Promise<void>;
  resetUsage(keyId: string): Promise<void>;
}

// ─── Nonce Service ──────────────────────────────────────────

export interface INonceService {
  register(keyId: string, nonce: string, expiresAt: string): Promise<boolean>;
}

// ─── Audit Service ──────────────────────────────────────────

export interface IAuditService {
  save(record: Omit<AuditLogRecord, 'id' | 'created_at'>): Promise<AuditLogRecord>;
  listForKey(keyId: string): AuditLogRecord[];
}

// ─── Video Service ──────────────────────────────────────────

export interface IVideoService {
  save(id: string, buffer: Buffer, mimeType: string, subdomain?: string): Promise<string>;
  delete(path: string): Promise<void>;
  exists(path: string): boolean;
  getPath(id: string, subdomain?: string): string;
  getMimeType(path: string): string | undefined;
}

// ─── Billing Service ────────────────────────────────────────

export interface IBillingService {
  createCheckoutSession(keyId: string, plan: Plan): Promise<{ url: string; sessionId: string }>;
  createPortalSession(stripeCustomerId: string): Promise<{ url: string }>;
  getUsage(keyId: string): Promise<{
    plan: Plan;
    pagesUsed: number;
    subdomainsUsed: number;
    limits: { pagesPerMonth: number; subdomains: number };
  }>;
  handleWebhook(event: { type: string; data: { object: any } }): Promise<void>;
  recordMeterEvent(keyId: string, eventName: string, value: number): Promise<void>;
}