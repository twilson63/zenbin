/**
 * ZenBin Shared Type Definitions
 *
 * Central type definitions for the entire application.
 * Services, routes, and storage all import from here.
 */

// ─── Attestation ───────────────────────────────────────────

export interface Attestation {
  type: string;
  subject: { kind: 'agent' | 'asset'; id: string };
  context?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

// ─── Stored JWK ───────────────────────────────────────────

type StoredJwk = Record<string, string | boolean | undefined>;
export type { StoredJwk };

// ─── Plans & Billing ───────────────────────────────────────

export type Plan = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  pagesPerMonth: number;
  subdomains: number;
  maxPageSize: number;
  videoStorageBytes: number;
}

export interface BillingInfo {
  plan: Plan;
  stripeCustomerId?: string;
  subscriptionId?: string;
  monthlyPageCount: number;
  monthlySubdomainCount: number;
  billingCycleStart?: string;
}

// ─── Page ───────────────────────────────────────────────────

export interface PageAuth {
  passwordHash?: string;
  urlTokenHash?: string;
  signToRead?: boolean;
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
  publishSignature?: string;
  contentDigest?: string;
  publishTimestamp?: string;
  publishNonce?: string;
  publishMethod?: string;
  publishPath?: string;
  recipientKeyId?: string;
  attestation?: Attestation;
  status?: 'active' | 'removed';
}

// ─── Subdomain ──────────────────────────────────────────────

export interface Subdomain {
  name: string;
  created_at: string;
  updated_at: string;
  page_count: number;
  ownerKeyId?: string;
}

// ─── Custom domains ─────────────────────────────────────────

export type CustomDomainLifecycleStatus = 'pending_dns' | 'provisioning' | 'active' | 'error' | 'deleting';
export type CustomDomainVerificationStatus = 'pending' | 'verified' | 'failed';
export type CustomDomainCertificateStatus = 'pending' | 'active' | 'failed';

/** A custom hostname aliases a signed-owner subdomain; it never owns content itself. */
export interface CustomDomain {
  hostname: string;
  subdomain: string;
  ownerKeyId: string;
  verificationToken?: string;
  verificationTokenHash: string;
  verificationStatus: CustomDomainVerificationStatus;
  certificateStatus: CustomDomainCertificateStatus;
  lifecycleStatus: CustomDomainLifecycleStatus;
  provider?: string;
  providerHostnameId?: string;
  primaryDomain: boolean;
  lastErrorCode?: string;
  lastErrorDetail?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  activatedAt?: string;
}

// ─── Agent Key ─────────────────────────────────────────────

export interface AgentKey {
  keyId: string;
  publicJwk: StoredJwk;
  publicKeyFingerprint: string;
  status: 'active' | 'blocked' | 'revoked';
  scopes: string[];
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  blocked_reason?: string;
  blocked_at?: string;
  revoked_at?: string;
  plan: Plan;
  stripeCustomerId?: string;
  subscriptionId?: string;
  monthlyPageCount: number;
  monthlySubdomainCount: number;
  billingCycleStart?: string;
}

// ─── Nonce ──────────────────────────────────────────────────

export interface NonceRecord {
  id: string;
  keyId: string;
  nonce: string;
  expires_at: string;
  created_at: string;
}

// ─── Audit ──────────────────────────────────────────────────

export interface AuditLogRecord {
  id: string;
  action: string;
  targetType: 'page' | 'subdomain' | 'custom_domain' | 'agent_key' | 'auth';
  keyId?: string;
  pageId?: string;
  subdomain?: string;
  status: 'accepted' | 'rejected';
  reason?: string;
  created_at: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// ─── Result Types ──────────────────────────────────────────

export interface SaveResult {
  page: Page;
  created: boolean;
}

export interface SubdomainResult {
  subdomain: Subdomain;
  created: boolean;
}

// ─── Plan Limit Check ───────────────────────────────────────

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
}
