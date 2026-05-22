import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { subdomains } from '../routes/subdomains.js';
import { render } from '../routes/render.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';
import { createTestSigner, jsonSignedRequest, createSignedHeaders, type TestSigner } from './helpers/signing.js';
import { createServices, type Services } from '../services/container.js';

const TEST_DB_PATH = './data/test-page-listing.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index'];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);
app.route('/p', render);

let testId: number;
const uniqueId = (base: string) => `${base}-${testId++}`;
let signer: TestSigner;
let otherSigner: TestSigner;

/**
 * Create a signed GET request for listing pages.
 */
function signedGetRequest(signer: TestSigner, path: string): Request {
  const timestamp = new Date().toISOString();
  const nonce = `nonce-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  // Strip query params from the path used for signing (c.req.path doesn't include them)
  const pathForSigning = path.split('?')[0];

  const headers = createSignedHeaders({
    signer,
    method: 'GET',
    path: pathForSigning,
    body: '',
    timestamp,
    nonce,
  });

  return new Request(`http://localhost${path}`, {
    method: 'GET',
    headers,
  });
}

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`listing-test-signer-${Date.now()}`);
  otherSigner = await createTestSigner(`listing-test-other-${Date.now()}`);

  // Upgrade to enterprise to avoid billing limits
  const { updateAgentKeyPlan } = await import('../storage/db.js');
  await updateAgentKeyPlan(signer.keyId, 'enterprise');
  await updateAgentKeyPlan(otherSigner.keyId, 'enterprise');
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

describe('GET /v1/pages — Agent Asset Listing', () => {
  it('should require signed request', async () => {
    const res = await app.request('/v1/pages', {
      method: 'GET',
    });
    expect(res.status).toBe(401);
  });

  it('should return empty list for new key', async () => {
    const freshSigner = await createTestSigner(`fresh-listing-${Date.now()}`);
    const res = await app.request(signedGetRequest(freshSigner, '/v1/pages'));
    expect(res.status).toBe(200);
    const body = await res.json() as { pages: unknown[]; total: number; next_cursor: string | null };
    expect(body.pages).toHaveLength(0);
    expect(body.total).toBe(0);
    expect(body.next_cursor).toBeNull();
  });

  it('should list pages owned by the authenticated key', async () => {
    // Create 3 pages
    const ids = [uniqueId('list-a'), uniqueId('list-b'), uniqueId('list-c')];
    for (const id of ids) {
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: { html: `<h1>${id}</h1>` },
      }));
    }

    const res = await app.request(signedGetRequest(signer, '/v1/pages'));
    expect(res.status).toBe(200);
    const body = await res.json() as { pages: Array<{ id: string; url: string; title: string | null; subdomain: string | null; has_markdown: boolean; has_image: boolean; has_video: boolean; etag: string; created_at: string; updated_at: string }>; total: number; next_cursor: string | null };
    expect(body.total).toBeGreaterThanOrEqual(3);
    expect(body.pages.length).toBeGreaterThanOrEqual(3);

    // Verify metadata-only response — no html, markdown, image, video fields
    for (const p of body.pages) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('url');
      expect(p).toHaveProperty('etag');
      expect(p).toHaveProperty('has_markdown');
      expect(p).toHaveProperty('has_image');
      expect(p).toHaveProperty('has_video');
      expect(p).toHaveProperty('subdomain');
      expect(p).toHaveProperty('created_at');
      expect(p).toHaveProperty('updated_at');
      expect((p as any).html).toBeUndefined();
      expect((p as any).markdown).toBeUndefined();
      expect((p as any).image).toBeUndefined();
      expect((p as any).video).toBeUndefined();
    }
  });

  it('should only list pages owned by the authenticated key', async () => {
    // Create a page with otherSigner
    const otherId = uniqueId('other-page');
    await app.request(`/v1/pages/${otherId}`, jsonSignedRequest({
      signer: otherSigner,
      method: 'POST',
      path: `/v1/pages/${otherId}`,
      body: { html: '<h1>Other</h1>' },
    }));

    // List with signer — should NOT include otherSigner's page
    const res = await app.request(signedGetRequest(signer, '/v1/pages'));
    expect(res.status).toBe(200);
    const body = await res.json() as { pages: Array<{ id: string }>; total: number };
    const pageIds = body.pages.map((p) => p.id);
    expect(pageIds).not.toContain(otherId);
  });

  it('should include subdomain pages with subdomain field set', async () => {
    // Claim a subdomain
    const subdomain = `list${Date.now()}`;
    await app.request(`/v1/subdomains/${subdomain}`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/subdomains/${subdomain}`,
      body: {},
    }));

    // Publish a page to the subdomain
    const pageId = uniqueId('sub-list');
    await app.request(`/v1/pages/${pageId}`, jsonSignedRequest({
      signer,
      method: 'POST',
      path: `/v1/pages/${pageId}`,
      body: { html: '<h1>Subdomain Page</h1>' },
      headers: { 'X-Subdomain': subdomain },
    }));

    const res = await app.request(signedGetRequest(signer, '/v1/pages'));
    expect(res.status).toBe(200);
    const body = await res.json() as { pages: Array<{ id: string; subdomain: string | null }> };
    const subPage = body.pages.find((p) => p.id === pageId);
    expect(subPage).toBeDefined();
    expect(subPage!.subdomain).toBe(subdomain);
  });

  it('should respect limit parameter', async () => {
    // Create pages
    for (let i = 0; i < 5; i++) {
      const id = uniqueId(`lim${i}`);
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: { html: `<h1>Limit ${i}</h1>` },
      }));
    }

    const res = await app.request(signedGetRequest(signer, '/v1/pages?limit=2'));
    expect(res.status).toBe(200);
    const body = await res.json() as { pages: unknown[]; total: number; next_cursor: string | null };
    expect(body.pages.length).toBeLessThanOrEqual(2);
    if (body.total > 2) {
      expect(body.next_cursor).not.toBeNull();
    }
  });

  it('should cap limit at 200', async () => {
    const res = await app.request(signedGetRequest(signer, '/v1/pages?limit=999'));
    expect(res.status).toBe(200);
    const body = await res.json() as { pages: unknown[] };
    expect(body.pages.length).toBeLessThanOrEqual(200);
  });

  it('should default limit to 50', async () => {
    const res = await app.request(signedGetRequest(signer, '/v1/pages'));
    expect(res.status).toBe(200);
    const body = await res.json() as { pages: unknown[] };
    expect(body.pages.length).toBeLessThanOrEqual(50);
  });
});