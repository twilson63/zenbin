import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Hono } from 'hono';
import { billing } from '../routes/billing.js';
import { initDatabase, closeDatabase, saveAgentKey, getAgentKey, updateAgentKeyPlan } from '../storage/db.js';
import { rmSync } from 'fs';
import { createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-billing-routes.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit'];

const app = new Hono();
app.route('/v1/billing', billing);

let freeSigner: TestSigner;
let noCustomerSigner: TestSigner;
let proSigner: TestSigner;

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();

  freeSigner = await createTestSigner(`billing-route-free-${Date.now()}`);
  noCustomerSigner = await createTestSigner(`billing-route-no-customer-${Date.now()}`);
  proSigner = await createTestSigner(`billing-route-pro-${Date.now()}`);
  await updateAgentKeyPlan(proSigner.keyId, 'pro', 'cus_test_pro', 'sub_test_pro');
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
});

describe('GET /v1/billing/usage', () => {
  it('should return usage for free key', async () => {
    const res = await app.request('/v1/billing/usage', jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/billing/usage',
    }));
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.plan).toBe('free');
    expect(body.pagesUsed).toBe(0);
    expect(body.subdomainsUsed).toBe(0);
    expect(body.limits.pagesPerMonth).toBe(100);
    expect(body.limits.subdomains).toBe(1);
  });

  it('should return usage for pro key', async () => {
    const res = await app.request('/v1/billing/usage', jsonSignedRequest({
      signer: proSigner,
      method: 'POST',
      path: '/v1/billing/usage',
    }));
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.plan).toBe('pro');
    expect(body.limits.pagesPerMonth).toBeNull(); // Infinity serializes to null in JSON
    expect(body.limits.subdomains).toBe(5);
  });

  it('should reject unsigned request', async () => {
    const res = await app.request('/v1/billing/usage', { method: 'POST' });
    expect(res.status).toBe(401);
  });
});

describe('POST /v1/billing/checkout', () => {
  it('should reject free plan checkout', async () => {
    const res = await app.request('/v1/billing/checkout', jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/billing/checkout',
      body: { plan: 'free' },
    }));
    expect(res.status).toBe(400);
  });

  it('should reject invalid plan', async () => {
    const res = await app.request('/v1/billing/checkout', jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/billing/checkout',
      body: { plan: 'platinum' },
    }));
    expect(res.status).toBe(400);
  });

  it('should default to pro plan when no body', async () => {
    // This will fail because Stripe isn't configured in test env,
    // but it should reach the Stripe call (not fail on validation)
    const res = await app.request('/v1/billing/checkout', jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/billing/checkout',
      body: {},
    }));
    // 200 when Stripe test env is configured; otherwise 503 (not configured) or 500 (Stripe call fails)
    expect([200, 500, 503]).toContain(res.status);
  });

  it('should reject unsigned request', async () => {
    const res = await app.request('/v1/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /v1/billing/portal', () => {
  it('should reject key without Stripe customer ID', async () => {
    const res = await app.request('/v1/billing/portal', jsonSignedRequest({
      signer: noCustomerSigner,
      method: 'POST',
      path: '/v1/billing/portal',
      body: {},
    }));
    expect(res.status).toBe(404);
    const body = await res.json() as any;
    expect(body.error).toContain('No billing account');
  });

  it('should reject unsigned request', async () => {
    const res = await app.request('/v1/billing/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /v1/billing/webhook', () => {
  it('should return 503 when webhook secret not configured', async () => {
    const originalValue = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    
    const res = await app.request('/v1/billing/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'test' }),
    });
    expect(res.status).toBe(503);
    
    if (originalValue) process.env.STRIPE_WEBHOOK_SECRET = originalValue;
  });

  it('should reject request without Stripe signature when secret IS configured', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    
    const res = await app.request('/v1/billing/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'checkout.session.completed', data: { object: {} } }),
    });
    expect(res.status).toBe(400);
    
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });
});