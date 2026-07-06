import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { subdomains } from '../routes/subdomains.js';
import { adminSubdomains } from '../routes/adminSubdomains.js';
import { initDatabase, closeDatabase, updateAgentKeyPlan } from '../storage/db.js';
import { config } from '../config.js';
import { rmSync } from 'fs';
import { createSignedHeaders, createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';
import { createServices, type Services } from '../services/container.js';

const TEST_DB_PATH = './data/test-admin-subdomains.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

type Variables = { subdomain: string; services: Services };

let testId: number;
const uniqueId = (base: string) => `${base}-${testId++}`;
let signer: TestSigner;
let otherSigner: TestSigner;

const services = createServices();

const app = new Hono<{ Variables: Variables }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);
app.route('/v1/admin/subdomains', adminSubdomains);

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try {
      rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`admin-sd-owner-${Date.now()}`);
  otherSigner = await createTestSigner(`admin-sd-other-${Date.now()}`);

  await updateAgentKeyPlan(signer.keyId, 'enterprise');
  await updateAgentKeyPlan(otherSigner.keyId, 'enterprise');
});

beforeEach(() => {
  testId = Date.now();
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try {
      rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
});

describe('Admin Subdomain Management', () => {
  describe('DELETE /v1/admin/subdomains/:name (release)', () => {
    it('should release subdomain ownership (admin)', async () => {
      const name = uniqueId('release-test');
      // Claim with signer
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      // Release as admin
      const res = await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': config.admin.token },
      });
      expect(res.status).toBe(200);
      const body = await res.json() as { name: string; ownerKeyId: string | undefined; released: boolean };
      expect(body.name).toBe(name);
      expect(body.released).toBe(true);
      expect(body.ownerKeyId).toBeUndefined();
    });

    it('should reject release without admin token', async () => {
      const name = uniqueId('no-admin-release');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const res = await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'DELETE',
      });
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent subdomain', async () => {
      const res = await app.request(`/v1/admin/subdomains/nonexistent-${testId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': config.admin.token },
      });
      expect(res.status).toBe(404);
    });

    it('should allow re-claim after release', async () => {
      const name = uniqueId('reclaim-test');
      // Claim with signer
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      // Release as admin
      await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': config.admin.token },
      });

      // Re-claim with other signer
      const res = await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer: otherSigner, method: 'POST', path: `/v1/subdomains/${name}` }));
      expect(res.status).toBe(201);
      const body = await res.json() as { name: string };
      expect(body.name).toBe(name);
    });
  });

  describe('PATCH /v1/admin/subdomains/:name (transfer)', () => {
    it('should transfer subdomain ownership (admin)', async () => {
      const name = uniqueId('transfer-test');
      // Claim with signer
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      // Transfer to otherSigner
      const res = await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.admin.token,
        },
        body: JSON.stringify({ ownerKeyId: otherSigner.keyId }),
      });
      expect(res.status).toBe(200);
      const body = await res.json() as { name: string; ownerKeyId: string; transferred: boolean };
      expect(body.name).toBe(name);
      expect(body.transferred).toBe(true);
      expect(body.ownerKeyId).toBe(otherSigner.keyId);
    });

    it('should reject transfer without admin token', async () => {
      const name = uniqueId('no-admin-transfer');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const res = await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerKeyId: otherSigner.keyId }),
      });
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent subdomain', async () => {
      const res = await app.request(`/v1/admin/subdomains/nonexistent-${testId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.admin.token,
        },
        body: JSON.stringify({ ownerKeyId: otherSigner.keyId }),
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 for non-existent target key', async () => {
      const name = uniqueId('invalid-key-transfer');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const res = await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.admin.token,
        },
        body: JSON.stringify({ ownerKeyId: 'nonexistent-key-12345' }),
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing ownerKeyId in body', async () => {
      const name = uniqueId('missing-owner');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const res = await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.admin.token,
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('should allow new key to publish after transfer', async () => {
      const name = uniqueId('publish-after-transfer');
      // Claim with signer
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      // Transfer to otherSigner
      await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.admin.token,
        },
        body: JSON.stringify({ ownerKeyId: otherSigner.keyId }),
      });

      // otherSigner publishes a page under the subdomain
      const pageHtml = '<html><head><title>Test</title></head><body><p>Published after transfer</p></body></html>';
      const publishRes = await app.request(`/v1/pages/test-page`, {
        ...jsonSignedRequest({ signer: otherSigner, method: 'POST', path: '/v1/pages/test-page', body: { html: pageHtml } }),
        headers: {
          ...jsonSignedRequest({ signer: otherSigner, method: 'POST', path: '/v1/pages/test-page', body: { html: pageHtml } }).headers,
          'X-Subdomain': name,
        },
      });
      expect(publishRes.status).toBe(201);
    });

    it('should reject old key from publishing after transfer', async () => {
      const name = uniqueId('old-key-blocked');
      // Claim with signer
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      // Transfer to otherSigner
      await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.admin.token,
        },
        body: JSON.stringify({ ownerKeyId: otherSigner.keyId }),
      });

      // Old signer tries to publish
      const pageHtml = '<html><head><title>Test</title></head><body><p>Old key</p></body></html>';
      const publishRes = await app.request(`/v1/pages/test-page`, {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/pages/test-page', body: { html: pageHtml } }),
        headers: {
          ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/pages/test-page', body: { html: pageHtml } }).headers,
          'X-Subdomain': name,
        },
      });
      expect(publishRes.status).toBe(403);
    });

    it('should keep existing pages accessible after transfer', async () => {
      const name = uniqueId('pages-survive');
      // Claim with signer
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      // Publish a page
      const pageHtml = '<html><head><title>Survives Transfer</title></head><body><p>Still here</p></body></html>';
      await app.request(`/v1/pages/my-page`, {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/pages/my-page', body: { html: pageHtml } }),
        headers: {
          ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/pages/my-page', body: { html: pageHtml } }).headers,
          'X-Subdomain': name,
        },
      });

      // Transfer to otherSigner
      await app.request(`/v1/admin/subdomains/${name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': config.admin.token,
        },
        body: JSON.stringify({ ownerKeyId: otherSigner.keyId }),
      });

      // Check the subdomain still has pages
      const pagesRes = await app.request(`/v1/subdomains/${name}/pages`, {
        ...createSignedHeaders({ signer: otherSigner, method: 'GET', path: `/v1/subdomains/${name}/pages`, body: '' }),
      });
      expect(pagesRes.status).toBe(200);
      const pagesBody = await pagesRes.json() as { pages: { id: string }[]; total: number };
      expect(pagesBody.total).toBeGreaterThan(0);
      expect(pagesBody.pages.some(p => p.id === 'my-page')).toBe(true);
    });
  });
});