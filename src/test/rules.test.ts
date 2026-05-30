import { describe, it, expect } from 'vitest';
import {
  PLAN_LIMITS,
  checkPageLimit,
  checkSubdomainLimit,
  checkPageSizeLimit,
  checkVideoStorageLimit,
  canManageSubdomain,
  canModifyPage,
  getPlanFromKey,
  isBillingCycleExpired,
} from '../rules.js';
import type { AgentKey, StoredJwk } from '../types.js';

// ─── Plan Limits Constants ──────────────────────────────────

describe('PLAN_LIMITS', () => {
  it('should have limits for all three plans', () => {
    expect(PLAN_LIMITS.free).toBeDefined();
    expect(PLAN_LIMITS.pro).toBeDefined();
    expect(PLAN_LIMITS.enterprise).toBeDefined();
  });

  it('free tier should have limited pages and subdomains', () => {
    expect(PLAN_LIMITS.free.pagesPerMonth).toBe(100);
    expect(PLAN_LIMITS.free.subdomains).toBe(1);
    expect(PLAN_LIMITS.free.videoStorageBytes).toBe(0);
  });

  it('pro tier should have unlimited pages', () => {
    expect(PLAN_LIMITS.pro.pagesPerMonth).toBe(Infinity);
    expect(PLAN_LIMITS.pro.subdomains).toBe(5);
    expect(PLAN_LIMITS.pro.videoStorageBytes).toBe(52_428_800);
  });

  it('enterprise tier should be unlimited', () => {
    expect(PLAN_LIMITS.enterprise.pagesPerMonth).toBe(Infinity);
    expect(PLAN_LIMITS.enterprise.subdomains).toBe(Infinity);
    expect(PLAN_LIMITS.enterprise.videoStorageBytes).toBe(Infinity);
  });
});

// ─── Page Limit Checks ──────────────────────────────────────

describe('checkPageLimit', () => {
  it('should allow free tier under limit', () => {
    const result = checkPageLimit('free', 50);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should block free tier at limit', () => {
    const result = checkPageLimit('free', 100);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('100');
    expect(result.reason).toContain('Pro');
  });

  it('should block free tier over limit', () => {
    const result = checkPageLimit('free', 150);
    expect(result.allowed).toBe(false);
  });

  it('should allow free tier at 99 pages (one more allowed)', () => {
    const result = checkPageLimit('free', 99);
    expect(result.allowed).toBe(true);
  });

  it('should always allow pro tier', () => {
    expect(checkPageLimit('pro', 1000).allowed).toBe(true);
    expect(checkPageLimit('pro', 10000).allowed).toBe(true);
  });

  it('should always allow enterprise tier', () => {
    expect(checkPageLimit('enterprise', 1000000).allowed).toBe(true);
  });
});

// ─── Subdomain Limit Checks ─────────────────────────────────

describe('checkSubdomainLimit', () => {
  it('should allow free tier with 0 subdomains', () => {
    expect(checkSubdomainLimit('free', 0).allowed).toBe(true);
  });

  it('should block free tier at 1 subdomain', () => {
    const result = checkSubdomainLimit('free', 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('1 subdomain');
  });

  it('should allow pro tier under 5 subdomains', () => {
    expect(checkSubdomainLimit('pro', 4).allowed).toBe(true);
  });

  it('should block pro tier at 5 subdomains', () => {
    const result = checkSubdomainLimit('pro', 5);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('5');
  });

  it('should always allow enterprise tier', () => {
    expect(checkSubdomainLimit('enterprise', 100).allowed).toBe(true);
  });
});

// ─── Page Size Limit Checks ─────────────────────────────────

describe('checkPageSizeLimit', () => {
  it('should allow content under free tier limit', () => {
    expect(checkPageSizeLimit('free', 100_000).allowed).toBe(true);
  });

  it('should block content over free tier limit', () => {
    const result = checkPageSizeLimit('free', 2_200_000);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('exceeds');
  });

  it('should allow all tiers up to 2MB', () => {
    expect(checkPageSizeLimit('free', 2_000_000).allowed).toBe(true);
    expect(checkPageSizeLimit('pro', 2_000_000).allowed).toBe(true);
  });

  it('should allow enterprise tier up to 2MB', () => {
    expect(checkPageSizeLimit('enterprise', 2_000_000).allowed).toBe(true);
  });

  it('should block enterprise tier over 2MB', () => {
    expect(checkPageSizeLimit('enterprise', 2_200_000).allowed).toBe(false);
  });
});

// ─── Video Storage Limit Checks ─────────────────────────────

describe('checkVideoStorageLimit', () => {
  it('should block video on free tier entirely', () => {
    const result = checkVideoStorageLimit('free', 1024);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('not available on the free tier');
  });

  it('should allow video under pro tier limit', () => {
    expect(checkVideoStorageLimit('pro', 10_000_000).allowed).toBe(true);
  });

  it('should block video over pro tier limit', () => {
    expect(checkVideoStorageLimit('pro', 60_000_000).allowed).toBe(false);
  });

  it('should always allow video on enterprise tier', () => {
    expect(checkVideoStorageLimit('enterprise', 1_000_000_000).allowed).toBe(true);
  });
});

// ─── Authorization Rules ────────────────────────────────────

describe('canManageSubdomain', () => {
  it('should allow owner', () => {
    expect(canManageSubdomain('key-1', 'key-1', false)).toBe(true);
  });

  it('should allow override scope', () => {
    expect(canManageSubdomain('key-1', 'key-2', true)).toBe(true);
  });

  it('should block non-owner without override', () => {
    expect(canManageSubdomain('key-1', 'key-2', false)).toBe(false);
  });

  it('should block when no owner set', () => {
    expect(canManageSubdomain(undefined, 'key-1', false)).toBe(false);
  });

  it('should allow override when no owner set', () => {
    expect(canManageSubdomain(undefined, 'key-1', true)).toBe(true);
  });
});

describe('canModifyPage', () => {
  it('should allow owner', () => {
    expect(canModifyPage('key-1', 'key-1', false).allowed).toBe(true);
  });

  it('should allow override scope', () => {
    expect(canModifyPage('key-1', 'key-2', true).allowed).toBe(true);
  });

  it('should block non-owner', () => {
    const result = canModifyPage('key-1', 'key-2', false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('does not own');
  });

  it('should block pages without owner (pre-signed)', () => {
    const result = canModifyPage(undefined, 'key-1', false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('predates signed ownership');
  });

  it('should allow override for pre-signed pages', () => {
    expect(canModifyPage(undefined, 'key-1', true).allowed).toBe(true);
  });
});

// ─── Utility Functions ──────────────────────────────────────

describe('getPlanFromKey', () => {
  it('should return the plan from the key', () => {
    const key = { plan: 'pro' } as AgentKey;
    expect(getPlanFromKey(key)).toBe('pro');
  });

  it('should default to free if plan is undefined', () => {
    const key = { plan: undefined as any } as AgentKey;
    expect(getPlanFromKey(key)).toBe('free');
  });
});

describe('isBillingCycleExpired', () => {
  it('should return true when no cycle start set', () => {
    expect(isBillingCycleExpired(undefined, 2592000000)).toBe(true);
  });

  it('should return false when within billing cycle', () => {
    const recent = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    expect(isBillingCycleExpired(recent, 2592000000)).toBe(false);
  });

  it('should return true when cycle has passed', () => {
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 - 1).toISOString();
    expect(isBillingCycleExpired(old, 2592000000)).toBe(true);
  });
});