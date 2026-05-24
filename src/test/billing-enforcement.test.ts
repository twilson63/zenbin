import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { subdomains } from '../routes/subdomains.js';
import { initDatabase, closeDatabase, saveAgentKey, updateAgentKeyPlan, incrementAgentKeyUsage, getAgentKey } from '../storage/db.js';
import { rmSync } from 'fs';
import { createTestSigner, generateTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';
import { createServices, type Services } from '../services/container.js';

const TEST_DB_PATH = './data/test-billing-enforce.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index'];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);

let testId: number;
const uniqueId = (base: string) => `${base}-${testId++}`;
let freeSigner: TestSigner;
let proSigner: TestSigner;
let enterpriseSigner: TestSigner;

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();

  freeSigner = await createTestSigner(`billing-free-${Date.now()}`);
  proSigner = await createTestSigner(`billing-pro-${Date.now()}`);
  enterpriseSigner = await createTestSigner(`billing-ent-${Date.now()}`);

  // Upgrade the pro and enterprise signers
  await updateAgentKeyPlan(proSigner.keyId, 'pro');
  await updateAgentKeyPlan(enterpriseSigner.keyId, 'enterprise');
});

beforeEach(() => {
  testId = Date.now();
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
});

describe('Billing enforcement on page publish', () => {
  it('should allow free tier key to publish under limit', async () => {
    const id = uniqueId('free-page');
    const res = await app.request('/v1/pages/' + id, jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/pages/' + id,
      body: { html: '<h1>Free page</h1>' },
    }));
    expect(res.status).toBe(201);
  });

  it('should block free tier key at page limit', async () => {
    // Set usage to limit
    const key = getAgentKey(freeSigner.keyId);
    if (key) {
      // Increment to 99 so the next publish hits 100 (the one above + 99 = 100)
      for (let i = key.monthlyPageCount; i < 99; i++) {
        await incrementAgentKeyUsage(freeSigner.keyId, 'monthlyPageCount');
      }
    }

    const id = uniqueId('free-blocked');
    const res = await app.request('/v1/pages/' + id, jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/pages/' + id,
      body: { html: '<h1>Should be blocked</h1>' },
    }));
    // This publish should succeed (brings count to 100, which equals limit)
    // But the NEXT one should fail
    expect(res.status === 201 || res.status === 402).toBeTruthy();

    // One more — should definitely be blocked
    const id2 = uniqueId('free-blocked-2');
    const res2 = await app.request('/v1/pages/' + id2, jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/pages/' + id2,
      body: { html: '<h1>Definitely blocked</h1>' },
    }));
    expect(res2.status).toBe(402);

    const body = await res2.json() as any;
    expect(body.error).toBeDefined();
    expect(body.upgradeUrl).toBeDefined();
  });

  it('should allow pro tier key unlimited pages', async () => {
    // Publish several pages
    for (let i = 0; i < 5; i++) {
      const id = uniqueId(`pro-page-${i}`);
      const res = await app.request('/v1/pages/' + id, jsonSignedRequest({
        signer: proSigner,
        method: 'POST',
        path: '/v1/pages/' + id,
        body: { html: '<h1>Pro page</h1>' },
      }));
      expect(res.status).toBe(201);
    }
  });

  it('should allow enterprise tier key unlimited pages', async () => {
    const id = uniqueId('ent-page');
    const res = await app.request('/v1/pages/' + id, jsonSignedRequest({
      signer: enterpriseSigner,
      method: 'POST',
      path: '/v1/pages/' + id,
      body: { html: '<h1>Enterprise page</h1>' },
    }));
    expect(res.status).toBe(201);
  });
});

describe('Billing enforcement on subdomain claim', () => {
  it('should allow free tier key to claim first subdomain', async () => {
    const name = uniqueId('free-sub');
    const res = await app.request('/v1/subdomains/' + name, jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/subdomains/' + name,
      body: {},
    }));
    expect(res.status).toBe(201);
  });

  it('should block free tier key from claiming second subdomain', async () => {
    const name = uniqueId('free-sub-blocked');
    const res = await app.request('/v1/subdomains/' + name, jsonSignedRequest({
      signer: freeSigner,
      method: 'POST',
      path: '/v1/subdomains/' + name,
      body: {},
    }));
    expect(res.status).toBe(402);
  });

  it('should allow pro tier key up to 5 subdomains', async () => {
    for (let i = 0; i < 5; i++) {
      const name = uniqueId(`pro-sub-${i}`);
      const res = await app.request('/v1/subdomains/' + name, jsonSignedRequest({
        signer: proSigner,
        method: 'POST',
        path: '/v1/subdomains/' + name,
        body: {},
      }));
      expect(res.status).toBe(201);
    }
  });

  it('should block pro tier key from claiming 6th subdomain', async () => {
    const name = uniqueId('pro-sub-blocked');
    const res = await app.request('/v1/subdomains/' + name, jsonSignedRequest({
      signer: proSigner,
      method: 'POST',
      path: '/v1/subdomains/' + name,
      body: {},
    }));
    expect(res.status).toBe(402);
  });

  it('should allow enterprise tier key unlimited subdomains', async () => {
    const name = uniqueId('ent-sub');
    const res = await app.request('/v1/subdomains/' + name, jsonSignedRequest({
      signer: enterpriseSigner,
      method: 'POST',
      path: '/v1/subdomains/' + name,
      body: {},
    }));
    expect(res.status).toBe(201);
  });
});