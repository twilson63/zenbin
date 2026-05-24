import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { subdomains } from '../routes/subdomains.js';
import { keys } from '../routes/keys.js';
import { render } from '../routes/render.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';
import { createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';
import { createServices, type Services } from '../services/container.js';

const TEST_DB_PATH = './data/test-cr003.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index'];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);
app.route('/v1/keys', keys);
app.route('/p', render);

let testId: number;
const uniqueId = (base: string) => `${base}-${testId++}`;
let signer: TestSigner;

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`cr003-test-${Date.now()}`);

  const { updateAgentKeyPlan } = await import('../storage/db.js');
  await updateAgentKeyPlan(signer.keyId, 'enterprise');
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

describe('CR-003 Integration: Error Codes', () => {
  it('should include error_code in 400 responses (invalid subdomain name)', async () => {
    const res = await app.request(`/v1/subdomains/ab`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/subdomains/ab`,
      body: {},
    }));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string; error_code: string };
    expect(body.error).toBeDefined();
    expect(body.error_code).toBeDefined();
    expect(body.error_code).toBe('SUBDOMAIN_INVALID_NAME');
  });

  it('should include error_code in 404 page not found', async () => {
    const id = uniqueId('nonexistent');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer,
      method: 'DELETE',
      path: `/v1/pages/${id}`,
      body: '',
    }));
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string; error_code: string };
    expect(body.error_code).toBe('PAGE_NOT_FOUND');
  });

  it('should include error_code in 403 ownership error', async () => {
    const otherSigner = await createTestSigner(`other-cr003-${Date.now()}`);
    const id = uniqueId('owned-page');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Owned</h1>' },
    }));

    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: otherSigner,
      method: 'DELETE',
      path: `/v1/pages/${id}`,
      body: '',
    }));
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string; error_code: string };
    expect(body.error_code).toBe('PAGE_OWNERSHIP_REQUIRED');
  });

  it('should include error_code in 409 subdomain taken', async () => {
    const name = `taken${Date.now()}`;
    await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/subdomains/${name}`,
      body: {},
    }));

    const res = await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/subdomains/${name}`,
      body: {},
    }));
    expect(res.status).toBe(409);
    const body = await res.json() as { error: string; error_code: string };
    expect(body.error_code).toBe('SUBDOMAIN_TAKEN');
  });

  it('should include error_code in key not found', async () => {
    const res = await app.request('/v1/keys/nonexistent-key/jwk', {
      method: 'GET',
    });
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string; error_code: string };
    expect(body.error_code).toBe('KEY_NOT_FOUND');
  });
});

describe('CR-003 Integration: Delete Response Bodies', () => {
  it('should return 200 with confirmation body when deleting a page', async () => {
    const id = uniqueId('del-page');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Delete Me</h1>' },
    }));

    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer,
      method: 'DELETE',
      path: `/v1/pages/${id}`,
      body: '',
    }));
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; deleted: boolean; deleted_at: string };
    expect(body.id).toBe(id);
    expect(body.deleted).toBe(true);
    expect(body.deleted_at).toBeDefined();
    expect(new Date(body.deleted_at).getTime()).toBeGreaterThan(0);
  });

  it('should return 200 with confirmation body when deleting a subdomain', async () => {
    const name = `delsub${Date.now()}`;
    await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/subdomains/${name}`,
      body: {},
    }));

    const res = await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({
      signer,
      method: 'DELETE',
      path: `/v1/subdomains/${name}`,
      body: '',
    }));
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string; deleted: boolean; deleted_at: string };
    expect(body.name).toBe(name);
    expect(body.deleted).toBe(true);
    expect(body.deleted_at).toBeDefined();
  });
});