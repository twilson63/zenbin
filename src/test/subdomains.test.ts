import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { subdomains } from '../routes/subdomains.js';
import { serveSubdomainPage, subdomainRender } from '../routes/subdomainRender.js';
import { stats } from '../routes/stats.js';
import { render } from '../routes/render.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { config } from '../config.js';
import { rmSync } from 'fs';
import { createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-subdomains.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit'];

// Type for context variables
type Variables = { subdomain: string };

// Generate unique IDs for each test run
let testId: number;
const uniqueId = (base: string) => `${base}-${testId++}`;
let signer: TestSigner;
let otherSigner: TestSigner;

// Create test apps
const app = new Hono<{ Variables: Variables }>();
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);
app.route('/v1/stats', stats);
app.route('/p', render);

const prodLikeApp = new Hono<{ Variables: Variables }>();
prodLikeApp.route('/v1/pages', pages);
prodLikeApp.route('/v1/subdomains', subdomains);
prodLikeApp.route('/v1/stats', stats);
prodLikeApp.route('/p', render);

// Subdomain detection middleware for testing (not needed for API tests, but useful for subdomain render)
app.use('*', async (c, next) => {
  const host = c.req.header('host') || '';
  const parts = host.split('.');
  if (parts.length >= 3) {
    const potentialSubdomain = parts[0].toLowerCase();
    const reserved = new Set(config.subdomains.reservedNames);
    if (!reserved.has(potentialSubdomain) && potentialSubdomain !== 'www') {
      c.set('subdomain', potentialSubdomain);
    }
  }
  await next();
});
prodLikeApp.use('*', async (c, next) => {
  const host = c.req.header('host') || '';
  const parts = host.split('.');
  if (parts.length >= 3) {
    const potentialSubdomain = parts[0].toLowerCase();
    const reserved = new Set(config.subdomains.reservedNames);
    if (!reserved.has(potentialSubdomain) && potentialSubdomain !== 'www') {
      c.set('subdomain', potentialSubdomain);
    }
  }
  await next();
});
app.route('/', subdomainRender);
prodLikeApp.get('/', async (c) => {
  const subdomain = c.get('subdomain');
  if (subdomain) {
    return serveSubdomainPage(c, subdomain, '/');
  }
  return c.json({ error: 'Not found' }, 404);
});
prodLikeApp.get('/*', async (c) => {
  const subdomain = c.get('subdomain');
  if (subdomain) {
    return serveSubdomainPage(c, subdomain, c.req.path);
  }
  return c.json({ error: 'Not found' }, 404);
});

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try {
      rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`subdomain-owner-${Date.now()}`);
  otherSigner = await createTestSigner(`subdomain-other-${Date.now()}`);

  // Upgrade test signers to enterprise so billing limits don't interfere with existing tests
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
    try {
      rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
});

describe('Subdomains', () => {
  describe('Claim Subdomain', () => {
    it('should claim an available subdomain', async () => {
      const name = uniqueId('my-test-site');
      const res = await app.request(`/v1/subdomains/${name}`, {
        ...jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }),
      });
      expect(res.status).toBe(201);
      const body = await res.json() as { name: string; url: string; created_at: string };
      expect(body.name).toBe(name);
      expect(body.url).toContain(name);
      expect(body.created_at).toBeDefined();
    });

    it('should normalize subdomain to lowercase', async () => {
      const requestedName = uniqueId('MyTestSite');
      const res = await app.request(`/v1/subdomains/${requestedName}`, {
        ...jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${requestedName}` }),
      });
      expect(res.status).toBe(201);
      const body = await res.json() as { name: string };
      expect(body.name).toBe(body.name.toLowerCase());
    });

    it('should reject already taken subdomain', async () => {
      const name = uniqueId('my-site');
      // First claim
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));
      
      // Second claim
      const res = await app.request(`/v1/subdomains/${name}`, {
        ...jsonSignedRequest({ signer: otherSigner, method: 'POST', path: `/v1/subdomains/${name}` }),
      });
      expect(res.status).toBe(409);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('already taken');
    });

    it('should reject reserved subdomain names', async () => {
      const res = await app.request('/v1/subdomains/www', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/subdomains/www' }),
      });
      expect(res.status).toBe(400);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('reserved');
    });

    it('should reject api as reserved', async () => {
      const res = await app.request('/v1/subdomains/api', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/subdomains/api' }),
      });
      expect(res.status).toBe(400);
    });

    it('should reject subdomain that is too short', async () => {
      const res = await app.request('/v1/subdomains/ab', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/subdomains/ab' }),
      });
      expect(res.status).toBe(400);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('at least 3 characters');
    });

    it('should reject invalid subdomain patterns', async () => {
      const res = await app.request('/v1/subdomains/123site', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/subdomains/123site' }),
      });
      expect(res.status).toBe(400);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('start with a letter');
    });

    it('should reject subdomain ending with hyphen', async () => {
      const res = await app.request('/v1/subdomains/my-site-', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/subdomains/my-site-' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('Get Subdomain Info', () => {
    it('should get subdomain info', async () => {
      const name = uniqueId('test-site');
      // Claim first
        await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));
      
      const res = await app.request(`/v1/subdomains/${name}`);
      expect(res.status).toBe(200);
      const body = await res.json() as { name: string; page_count: number };
      expect(body.name).toBe(name);
      expect(body.page_count).toBe(0);
    });

    it('should return 404 for non-existent subdomain', async () => {
      const res = await app.request('/v1/subdomains/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('Publish to Subdomain', () => {
    it('should publish index page to subdomain', async () => {
      const name = uniqueId('test-site');
      // Claim subdomain first
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));
      
      // Publish index page
        const res = await app.request('/v1/pages/index', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/index',
          headers: { 'X-Subdomain': name },
          body: { html: '<h1>Hello Subdomain!</h1>' },
        }),
      });
      
      expect(res.status).toBe(201);
      const body = await res.json() as { id: string; subdomain: string; url: string; path: string };
      expect(body.id).toBe('index');
      expect(body.subdomain).toBe(name);
      expect(body.url).toContain(name);
      expect(body.path).toBe('/');
    });

    it('should publish nested path to subdomain', async () => {
      const name = uniqueId('test-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));
      
      const res = await app.request('/v1/pages/about', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/about',
          headers: { 'X-Subdomain': name },
          body: { html: '<h1>About</h1>' },
        }),
      });
      
      expect(res.status).toBe(201);
      const body = await res.json() as { url: string; path: string };
      expect(body.url).toContain(name);
      expect(body.path).toBe('/about');
    });

    it('should serve explicit video endpoint on subdomains', async () => {
      const name = uniqueId('video-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const publishRes = await app.request('/v1/pages/index', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/index',
          headers: { 'X-Subdomain': name },
          body: {
            html: '<h1>Home</h1>',
            video: Buffer.from('subdomain-video').toString('base64'),
            content_type: 'video/mp4',
          },
        }),
      });

      expect(publishRes.status).toBe(201);

      const videoRes = await app.request('/video', {
        headers: { host: `${name}.${config.subdomains.baseDomain}` },
      });

      expect(videoRes.status).toBe(200);
      expect(videoRes.headers.get('content-type')).toContain('video/mp4');
      expect(await videoRes.text()).toBe('subdomain-video');
    });

    it('should normalize double-slash root video paths on subdomains', async () => {
      const name = uniqueId('video-root-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const publishRes = await app.request('/v1/pages/index', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/index',
          headers: { 'X-Subdomain': name },
          body: {
            html: '<h1>Home</h1>',
            video: Buffer.from('subdomain-video-double-slash').toString('base64'),
            content_type: 'video/mp4',
          },
        }),
      });

      expect(publishRes.status).toBe(201);

      const redirected = await app.request(`https://${name}.${config.subdomains.baseDomain}//video`, {
        redirect: 'manual',
        headers: { host: `${name}.${config.subdomains.baseDomain}` },
      });
      expect(redirected.status).toBe(307);
      expect(redirected.headers.get('location')).toBe('/video');
    });

    it('should serve nested video endpoints in the production-style subdomain handler', async () => {
      const name = uniqueId('prod-video-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const publishRes = await app.request('/v1/pages/intro', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/intro',
          headers: { 'X-Subdomain': name },
          body: {
            html: '<h1>Intro</h1>',
            video: Buffer.from('nested-intro-video').toString('base64'),
            video_content_type: 'video/mp4',
          },
        }),
      });

      expect(publishRes.status).toBe(201);
      const payload = await publishRes.json() as { video_url: string };
      expect(payload.video_url).toContain('/intro/video');

      const videoRes = await prodLikeApp.request('/intro/video', {
        headers: { host: `${name}.${config.subdomains.baseDomain}` },
      });
      expect(videoRes.status).toBe(200);
      expect(videoRes.headers.get('content-type')).toContain('video/mp4');
      expect(await videoRes.text()).toBe('nested-intro-video');
    });

    it('should support both image and video on the same subdomain page', async () => {
      const name = uniqueId('media-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));

      const publishRes = await app.request('/v1/pages/index', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/index',
          headers: { 'X-Subdomain': name },
          body: {
            html: '<h1>Home</h1>',
            image: Buffer.from('subdomain-image').toString('base64'),
            image_content_type: 'image/png',
            video: Buffer.from('subdomain-video-2').toString('base64'),
            video_content_type: 'video/mp4',
          },
        }),
      });

      expect(publishRes.status).toBe(201);
      const payload = await publishRes.json() as { image_url: string; video_url: string };
      expect(payload.image_url).toContain('/image');
      expect(payload.video_url).toContain('/video');

      const imageRes = await app.request('/image', {
        headers: { host: `${name}.${config.subdomains.baseDomain}` },
      });
      expect(imageRes.status).toBe(200);
      expect(imageRes.headers.get('content-type')).toContain('image/png');
      expect(await imageRes.text()).toBe('subdomain-image');

      const videoRes = await app.request('/video', {
        headers: { host: `${name}.${config.subdomains.baseDomain}` },
      });
      expect(videoRes.status).toBe(200);
      expect(videoRes.headers.get('content-type')).toContain('video/mp4');
      expect(await videoRes.text()).toBe('subdomain-video-2');
    });

    it('should reject publish to non-existent subdomain', async () => {
      const res = await app.request('/v1/pages/index', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/index',
          headers: { 'X-Subdomain': 'nonexistent' },
          body: { html: '<h1>Test</h1>' },
        }),
      });
      
      expect(res.status).toBe(404);
      const body = await res.json() as { error: string };
      expect(body.error).toContain('does not exist');
    });

    it('should reject duplicate page in same subdomain', async () => {
      const name = uniqueId('test-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));
      
      // First publish
      await app.request('/v1/pages/index', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/index',
          headers: { 'X-Subdomain': name },
          body: { html: '<h1>First</h1>' },
        }),
      });
      
      // Second publish to same page - now updates
      const res = await app.request('/v1/pages/index', {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: '/v1/pages/index',
          headers: { 'X-Subdomain': name },
          body: { html: '<h1>Second</h1>' },
        }),
      });
      
      expect(res.status).toBe(200); // Update returns 200
    });
  });

  describe('List Subdomain Pages', () => {
    it('should list pages in subdomain', async () => {
      const name = uniqueId('test-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));
      
      // Publish a few pages
      await app.request('/v1/pages/index', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/pages/index', headers: { 'X-Subdomain': name }, body: { html: '<h1>Home</h1>' } }),
      });
      await app.request('/v1/pages/about', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/pages/about', headers: { 'X-Subdomain': name }, body: { html: '<h1>About</h1>' } }),
      });
      
      const res = await app.request(`/v1/subdomains/${name}/pages`);
      expect(res.status).toBe(200);
      const body = await res.json() as { pages: Array<{ id: string; path: string }>; total: number };
      expect(body.pages).toHaveLength(2);
      expect(body.total).toBe(2);
      expect(body.pages.find(p => p.id === 'index')?.path).toBe('/');
      expect(body.pages.find(p => p.id === 'about')?.path).toBe('/about');
    });
  });

  describe('Delete Subdomain', () => {
    it('should delete subdomain and all its pages', async () => {
      const name = uniqueId('test-site');
      await app.request(`/v1/subdomains/${name}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${name}` }));
      await app.request('/v1/pages/index', {
        ...jsonSignedRequest({ signer, method: 'POST', path: '/v1/pages/index', headers: { 'X-Subdomain': name }, body: { html: '<h1>Test</h1>' } }),
      });
      
      const res = await app.request(`/v1/subdomains/${name}`, {
        ...jsonSignedRequest({ signer, method: 'DELETE', path: `/v1/subdomains/${name}` }),
      });
      
      expect(res.status).toBe(204);
      
      // Verify subdomain is gone
      const checkRes = await app.request(`/v1/subdomains/${name}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent subdomain', async () => {
      const res = await app.request('/v1/subdomains/nonexistent', {
        ...jsonSignedRequest({ signer, method: 'DELETE', path: '/v1/subdomains/nonexistent' }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('Statistics', () => {
    it('should include subdomain count in stats', async () => {
      const site1 = uniqueId('site1');
      const site2 = uniqueId('site2');
      await app.request(`/v1/subdomains/${site1}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${site1}` }));
      await app.request(`/v1/subdomains/${site2}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${site2}` }));
      
      const res = await app.request('/v1/stats');
      expect(res.status).toBe(200);
      const body = await res.json() as { subdomains: number };
      expect(body.subdomains).toBeGreaterThanOrEqual(2);
    });
  });
});
