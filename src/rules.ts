/**
 * ZenBin Business Rules
 *
 * Pure functions — no DB, no HTTP, no side effects.
 * All business logic lives here. Routes and services call these.
 */

import type { Plan, PlanLimits, LimitCheckResult, AgentKey } from './types.js';

// ─── Plan Limits ────────────────────────────────────────────

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    pagesPerMonth: 100,
    subdomains: 1,
    maxPageSize: 512_000,      // 512KB
    videoStorageBytes: 0,
  },
  pro: {
    pagesPerMonth: Infinity,
    subdomains: 5,
    maxPageSize: 512_000,      // 512KB
    videoStorageBytes: 52_428_800,  // 50MB
  },
  enterprise: {
    pagesPerMonth: Infinity,
    subdomains: Infinity,
    maxPageSize: 2_097_152,    // 2MB
    videoStorageBytes: Infinity,
  },
};

// ─── Plan Limit Checks ─────────────────────────────────────

export function checkPageLimit(plan: Plan, monthlyPageCount: number): LimitCheckResult {
  const limit = PLAN_LIMITS[plan].pagesPerMonth;
  if (monthlyPageCount >= limit) {
    return {
      allowed: false,
      reason: `Free tier limit of ${limit} pages per month exceeded. Upgrade to Pro for unlimited pages.`,
    };
  }
  return { allowed: true };
}

export function checkSubdomainLimit(plan: Plan, currentCount: number): LimitCheckResult {
  const limit = PLAN_LIMITS[plan].subdomains;
  if (currentCount >= limit) {
    if (limit === Infinity) return { allowed: true };
    return {
      allowed: false,
      reason: `${plan === 'free' ? 'Free tier' : 'Pro plan'} limit of ${limit} subdomain${limit !== 1 ? 's' : ''} reached. Upgrade for more.`,
    };
  }
  return { allowed: true };
}

export function checkPageSizeLimit(plan: Plan, contentSize: number): LimitCheckResult {
  const limit = PLAN_LIMITS[plan].maxPageSize;
  if (contentSize > limit) {
    return {
      allowed: false,
      reason: `Page content size (${formatBytes(contentSize)}) exceeds ${plan} tier limit of ${formatBytes(limit)}.`,
    };
  }
  return { allowed: true };
}

export function checkVideoStorageLimit(plan: Plan, videoSize: number): LimitCheckResult {
  const limit = PLAN_LIMITS[plan].videoStorageBytes;
  if (limit === 0) {
    return {
      allowed: false,
      reason: 'Video uploads are not available on the free tier. Upgrade to Pro.',
    };
  }
  if (videoSize > limit) {
    return {
      allowed: false,
      reason: `Video size (${formatBytes(videoSize)}) exceeds ${plan} tier limit of ${formatBytes(limit)}.`,
    };
  }
  return { allowed: true };
}

// ─── Authorization Rules ────────────────────────────────────

export function canManageSubdomain(
  ownerKeyId: string | undefined,
  keyId: string,
  hasOverrideScope: boolean,
): boolean {
  if (hasOverrideScope) return true;
  if (!ownerKeyId) return false;
  return ownerKeyId === keyId;
}

export function canModifyPage(
  pageOwnerKeyId: string | undefined,
  keyId: string,
  hasOverrideScope: boolean,
): { allowed: boolean; reason?: string } {
  if (hasOverrideScope) return { allowed: true };
  if (!pageOwnerKeyId) {
    return {
      allowed: false,
      reason: 'This page predates signed ownership and requires admin migration before it can be updated',
    };
  }
  if (pageOwnerKeyId !== keyId) {
    return { allowed: false, reason: 'This signing key does not own the page' };
  }
  return { allowed: true };
}

// ─── Utility ────────────────────────────────────────────────

export function getPlanFromKey(agentKey: AgentKey): Plan {
  return agentKey.plan || 'free';
}

export function isBillingCycleExpired(billingCycleStart: string | undefined, windowMs: number): boolean {
  if (!billingCycleStart) return true; // No cycle set = expired, reset needed
  return Date.now() - new Date(billingCycleStart).getTime() > windowMs;
}

function formatBytes(bytes: number): string {
  if (bytes === Infinity) return '∞';
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${bytes}B`;
}