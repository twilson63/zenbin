import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  initDatabase,
  closeDatabase,
  saveAgentKey,
  getAgentKey,
  getAgentKeyDatabase,
  updateAgentKeyPlan,
  incrementAgentKeyUsage,
  resetAgentKeyUsage,
} from '../storage/db.js';
import { rmSync } from 'fs';
import { billingService } from '../services/billingService.js';

const TEST_DB_PATH = './data/test-billing-data.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index'];

beforeAll(() => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
});

describe('AgentKey billing fields', () => {
  it('should default plan to free for new keys', async () => {
    const key = await saveAgentKey({
      keyId: 'billing-test-default',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test' },
    });
    expect(key.plan).toBe('free');
    expect(key.monthlyPageCount).toBe(0);
    expect(key.monthlySubdomainCount).toBe(0);
    expect(key.stripeCustomerId).toBeUndefined();
  });

  it('should persist plan when explicitly set', async () => {
    const key = await saveAgentKey({
      keyId: 'billing-test-pro',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test2' },
      plan: 'pro',
    });
    expect(key.plan).toBe('pro');

    // Re-read from DB
    const retrieved = getAgentKey('billing-test-pro');
    expect(retrieved?.plan).toBe('pro');
  });

  it('should preserve existing billing fields on re-save', async () => {
    await saveAgentKey({
      keyId: 'billing-test-persist',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test3' },
    });

    // Update plan
    await updateAgentKeyPlan('billing-test-persist', 'pro', 'cus_abc', 'sub_xyz');

    // Re-save without plan — should keep existing
    const updated = await saveAgentKey({
      keyId: 'billing-test-persist',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test3' },
    });
    expect(updated.plan).toBe('pro');
    expect(updated.stripeCustomerId).toBe('cus_abc');
  });

  it('should not break old keys without billing fields', async () => {
    // Simulate old key by creating one and verifying defaults
    const key = await saveAgentKey({
      keyId: 'billing-test-legacy',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test4' },
    });
    expect(key.plan).toBe('free');
    expect(key.monthlyPageCount).toBe(0);
  });
});

describe('updateAgentKeyPlan', () => {
  it('should upgrade key from free to pro', async () => {
    await saveAgentKey({
      keyId: 'billing-test-upgrade',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test5' },
    });

    const updated = await updateAgentKeyPlan('billing-test-upgrade', 'pro', 'cus_new', 'sub_new');
    expect(updated?.plan).toBe('pro');
    expect(updated?.stripeCustomerId).toBe('cus_new');
    expect(updated?.subscriptionId).toBe('sub_new');
  });

  it('should downgrade key from pro to free', async () => {
    await saveAgentKey({
      keyId: 'billing-test-downgrade',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test6' },
      plan: 'pro',
    });

    const updated = await updateAgentKeyPlan('billing-test-downgrade', 'free');
    expect(updated?.plan).toBe('free');
  });

  it('should return undefined for non-existent key', async () => {
    const result = await updateAgentKeyPlan('nonexistent', 'pro');
    expect(result).toBeUndefined();
  });
});

describe('incrementAgentKeyUsage', () => {
  it('should increment monthly page count', async () => {
    await saveAgentKey({
      keyId: 'billing-test-increment-page',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test7' },
    });

    await incrementAgentKeyUsage('billing-test-increment-page', 'monthlyPageCount');
    await incrementAgentKeyUsage('billing-test-increment-page', 'monthlyPageCount');

    const key = getAgentKey('billing-test-increment-page');
    expect(key?.monthlyPageCount).toBe(2);
  });

  it('should increment monthly subdomain count', async () => {
    await saveAgentKey({
      keyId: 'billing-test-increment-sub',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test8' },
    });

    await incrementAgentKeyUsage('billing-test-increment-sub', 'monthlySubdomainCount');

    const key = getAgentKey('billing-test-increment-sub');
    expect(key?.monthlySubdomainCount).toBe(1);
  });

  it('should not throw for non-existent key', async () => {
    await expect(incrementAgentKeyUsage('nonexistent', 'monthlyPageCount')).resolves.toBeUndefined();
  });
});

describe('billing webhook lifecycle', () => {
  it('should downgrade a key to free when subscription is deleted', async () => {
    await saveAgentKey({
      keyId: 'billing-test-cancel-webhook',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test-cancel' },
    });
    await updateAgentKeyPlan('billing-test-cancel-webhook', 'pro', 'cus_cancel', 'sub_cancel');
    await incrementAgentKeyUsage('billing-test-cancel-webhook', 'monthlyPageCount');

    await billingService.handleWebhook({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_cancel',
          customer: 'cus_cancel',
        },
      },
    });

    const key = getAgentKey('billing-test-cancel-webhook');
    expect(key?.plan).toBe('free');
    expect(key?.stripeCustomerId).toBe('cus_cancel');
    expect(key?.subscriptionId).toBe('');
    expect(key?.monthlyPageCount).toBe(0);
  });

  it('should reset expired usage cycle when usage is read', async () => {
    await saveAgentKey({
      keyId: 'billing-test-expired-usage',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test-expired' },
    });
    await incrementAgentKeyUsage('billing-test-expired-usage', 'monthlyPageCount');
    const key = getAgentKey('billing-test-expired-usage');
    expect(key).toBeDefined();
    if (key) {
      key.billingCycleStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      getAgentKeyDatabase().putSync(key.keyId, key);
    }

    const usage = await billingService.getUsage('billing-test-expired-usage');
    expect(usage.pagesUsed).toBe(0);
  });
});

describe('resetAgentKeyUsage', () => {
  it('should reset counters and set new billing cycle start', async () => {
    await saveAgentKey({
      keyId: 'billing-test-reset',
      publicJwk: { kty: 'OKP', crv: 'Ed25519', x: 'test9' },
    });

    // Increment some usage
    await incrementAgentKeyUsage('billing-test-reset', 'monthlyPageCount');
    await incrementAgentKeyUsage('billing-test-reset', 'monthlyPageCount');
    await incrementAgentKeyUsage('billing-test-reset', 'monthlySubdomainCount');

    // Reset
    await resetAgentKeyUsage('billing-test-reset');

    const key = getAgentKey('billing-test-reset');
    expect(key?.monthlyPageCount).toBe(0);
    expect(key?.monthlySubdomainCount).toBe(0);
    expect(key?.billingCycleStart).toBeDefined();
  });

  it('should not throw for non-existent key', async () => {
    await expect(resetAgentKeyUsage('nonexistent')).resolves.toBeUndefined();
  });
});