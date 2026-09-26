import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { rmSync } from 'fs';
import { verifyApiKey } from '../middleware/verifyApiKey.js';
import { initDatabase, closeDatabase, updateAgentKeyPlan } from '../storage/db.js';
import { createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-paid-bypass.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-custom-domains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

// Small bucket so exhaustion is fast. config.freeTier reads this env live.
const LIMIT = 3;

const app = new Hono();
app.use('/v1/*', verifyApiKey);
app.post('/v1/echo', (c) => c.json({ ok: true }));

let paid: TestSigner;
let free: TestSigner;
let savedLimit: string | undefined;

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch { /* ignore */ }
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  savedLimit = process.env.FREE_TIER_MONTHLY_LIMIT;
  process.env.FREE_TIER_MONTHLY_LIMIT = String(LIMIT);
  initDatabase();
  paid = await createTestSigner(`paid-bypass-paid-${Date.now()}`);
  await updateAgentKeyPlan(paid.keyId, 'enterprise');
  free = await createTestSigner(`paid-bypass-free-${Date.now()}`);
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch { /* ignore */ }
  }
  if (savedLimit === undefined) delete process.env.FREE_TIER_MONTHLY_LIMIT;
  else process.env.FREE_TIER_MONTHLY_LIMIT = savedLimit;
});

const unsigned = (ua: string): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'User-Agent': ua },
  body: '{}',
});

const signed = (signer: TestSigner, ua: string): RequestInit =>
  jsonSignedRequest({ signer, method: 'POST', path: '/v1/echo', body: {}, headers: { 'User-Agent': ua } });

async function exhaust(ua: string) {
  for (let i = 0; i < LIMIT; i++) {
    expect((await app.request('/v1/echo', unsigned(ua))).status).toBe(200);
  }
  expect((await app.request('/v1/echo', unsigned(ua))).status).toBe(429);
}

describe('anonymous free-tier bucket vs signed keys', () => {
  it('429s unsigned requests once the bucket is exhausted', async () => {
    await exhaust('paid-bypass-unsigned/1.0');
  });

  it('lets a valid enterprise-signed request through on an exhausted bucket', async () => {
    const ua = 'paid-bypass-enterprise/1.0';
    await exhaust(ua);
    expect((await app.request('/v1/echo', signed(paid, ua))).status).toBe(200);
    // The bucket itself stays exhausted for everyone else
    expect((await app.request('/v1/echo', unsigned(ua))).status).toBe(429);
  });

  it('still 429s free-plan signed requests on an exhausted bucket', async () => {
    const ua = 'paid-bypass-free/1.0';
    await exhaust(ua);
    expect((await app.request('/v1/echo', signed(free, ua))).status).toBe(429);
  });

  it('still 429s forged enterprise-signed requests on an exhausted bucket', async () => {
    const ua = 'paid-bypass-forged/1.0';
    await exhaust(ua);
    const tampered = { ...signed(paid, ua), body: '{"tampered":true}' } as RequestInit;
    expect((await app.request('/v1/echo', tampered)).status).toBe(429);
  });
});
