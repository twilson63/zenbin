import { describe, it, expect } from 'vitest';
import type {
  Plan,
  PlanLimits,
  BillingInfo,
  Page,
  PageAuth,
  Subdomain,
  AgentKey,
  NonceRecord,
  AuditLogRecord,
  SaveResult,
  SubdomainResult,
  StoredJwk,
  LimitCheckResult,
} from '../types.js';

describe('Type imports', () => {
  it('should accept valid Plan values', () => {
    const plans: Plan[] = ['free', 'pro', 'enterprise'];
    expect(plans).toHaveLength(3);
    expect(plans).toContain('free');
    expect(plans).toContain('pro');
    expect(plans).toContain('enterprise');
  });

  it('should define PlanLimits structure', () => {
    const limits: PlanLimits = {
      pagesPerMonth: 100,
      subdomains: 1,
      maxPageSize: 2097152,
      videoStorageBytes: 0,
    };
    expect(limits.pagesPerMonth).toBe(100);
    expect(limits.subdomains).toBe(1);
  });

  it('should define BillingInfo with plan and usage counters', () => {
    const billing: BillingInfo = {
      plan: 'free',
      monthlyPageCount: 0,
      monthlySubdomainCount: 0,
    };
    expect(billing.plan).toBe('free');
    expect(billing.monthlyPageCount).toBe(0);
    expect(billing.stripeCustomerId).toBeUndefined();
  });

  it('should define BillingInfo with Stripe fields', () => {
    const billing: BillingInfo = {
      plan: 'pro',
      stripeCustomerId: 'cus_123',
      subscriptionId: 'sub_456',
      monthlyPageCount: 42,
      monthlySubdomainCount: 3,
      billingCycleStart: '2026-05-01T00:00:00.000Z',
    };
    expect(billing.stripeCustomerId).toBe('cus_123');
    expect(billing.subscriptionId).toBe('sub_456');
    expect(billing.billingCycleStart).toBeDefined();
  });

  it('should define AgentKey with billing fields', () => {
    const key: AgentKey = {
      keyId: 'test-key',
      publicJwk: {} as StoredJwk,
      status: 'active',
      scopes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plan: 'pro',
      monthlyPageCount: 5,
      monthlySubdomainCount: 1,
    };
    expect(key.plan).toBe('pro');
    expect(key.monthlyPageCount).toBe(5);
  });

  it('should define LimitCheckResult for allowed case', () => {
    const result: LimitCheckResult = { allowed: true };
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should define LimitCheckResult for blocked case', () => {
    const result: LimitCheckResult = { allowed: false, reason: 'Free tier limit exceeded' };
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Free tier limit exceeded');
  });

  it('should define Page with all content fields', () => {
    const page: Page = {
      id: 'test',
      html: '<h1>Hello</h1>',
      encoding: 'utf-8',
      content_type: 'text/html; charset=utf-8',
      etag: 'abc123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(page.id).toBe('test');
    expect(page.video).toBeUndefined();
  });

  it('should define SaveResult', () => {
    const result: SaveResult = {
      page: {} as Page,
      created: true,
    };
    expect(result.created).toBe(true);
  });

  it('should define SubdomainResult', () => {
    const result: SubdomainResult = {
      subdomain: {} as Subdomain,
      created: true,
    };
    expect(result.created).toBe(true);
  });
});