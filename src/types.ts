/**
 * ZenBin Shared Type Definitions
 *
 * Central type definitions for the entire application.
 * Services, routes, and storage all import from here.
 */

// ─── Attestation ───────────────────────────────────────────

export interface Attestation {
  /** What kind of claim this is */
  type: string;

  /** What the claim is about */
  subject: {
    /** "agent" or "asset" */
    kind: 'agent' | 'asset';

    /** For agent: SHA-256 fingerprint of the subject's Ed25519 public key (43-char base64url)
     *  For asset: signed page reference — {ownerKeyId}/{pageId} */
    id: string;
  };

  /** Optional: human-readable context about this claim */
  context?: string;

  /** Optional: structured metadata (type-specific) */
  metadata?: Record<string, unknown>;

  /** Optional: timestamp when the attestation was made (defaults to CAP-Timestamp) */
  timestamp?: string;
}

// ─── Stored JWK ───────────────────────────────────────────

type StoredJwk = Record<string, string | boolean | undefined>;
export type { StoredJwk };

// ─── Plans & Billing ───────────────────────────────────────

/** Agent key plan tier */
export type Plan = 'free' | 'pro' | 'enterprise';

/** Plan-specific resource limits */
export interface PlanLimits {
  pagesPerMonth: number;
  subdomains: number;
  maxPageSize: number;
  videoStorageBytes: number;
}

/** Billing info attached to an agent key */
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

// ─── Agent Key ──────────────────────────────────────────────

export interface AgentKey {
  keyId: string;
  publicJwk: StoredJwk;
  /** SHA-256 of the Ed25519 public key, base64url-encoded (43 chars). Derived from publicJwk.x at registration. */
  publicKeyFingerprint: string;
  status: 'active' | 'blocked' | 'revoked';
  scopes: string[];
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  blocked_reason?: string;
  blocked_at?: string;
  revoked_at?: string;
  // Billing fields
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
  targetType: 'page' | 'subdomain' | 'agent_key' | 'auth';
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
