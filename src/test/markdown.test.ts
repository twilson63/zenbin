import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { render } from '../routes/render.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';
import { createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';
import { createServices, type Services } from '../services/container.js';

const TEST_DB_PATH = './data/test-markdown.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/p', render);

let testId: number;
const uniqueId = (base: string) => `${base}-${testId++}`;
let signer: TestSigner;

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try {
      rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`markdown-test-signer-${Date.now()}`);
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

describe('POST /v1/pages/:id with markdown', () => {
  it('should create a page with markdown (utf-8)', async () => {
    const pageId = uniqueId('md-page');
    const res = await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html><body>HTML content</body></html>',
        markdown: '# Hello\n\nThis is markdown.',
        },
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json() as { id: string; markdown_url: string };
    expect(data.id).toBe(pageId);
    expect(data.markdown_url).toContain(`/p/${pageId}/md`);
  });

  it('should create a page with markdown (base64)', async () => {
    const pageId = uniqueId('md-base64');
    const markdown = '# Base64 Markdown\n\nContent here.';
    const base64Markdown = Buffer.from(markdown).toString('base64');

    const res = await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html><body>Content</body></html>',
        markdown: base64Markdown,
        markdown_encoding: 'base64',
        },
      }),
    });

    expect(res.status).toBe(201);

    const mdRes = await app.request(`/p/${pageId}/md`);
    const content = await mdRes.text();
    expect(content).toBe(markdown);
  });

  it('should create a page with markdown only (no HTML)', async () => {
    const pageId = uniqueId('md-only');
    const res = await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        markdown: '# Markdown Only\n\nNo HTML here.',
        },
      }),
    });

    expect(res.status).toBe(201);
    
    const mdRes = await app.request(`/p/${pageId}/md`);
    expect(mdRes.status).toBe(200);
    expect(mdRes.headers.get('Content-Type')).toContain('text/markdown');
  });

  it('should include markdown_url in response when markdown is provided', async () => {
    const pageId = uniqueId('md-url');
    const res = await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        markdown: '# Test',
        },
      }),
    });

    const data = await res.json() as Record<string, string>;
    expect(data.markdown_url).toBeDefined();
    expect(data.markdown_url).toContain(`/p/${pageId}/md`);
  });

  it('should not include markdown_url when no markdown is provided', async () => {
    const pageId = uniqueId('no-md');
    const res = await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        },
      }),
    });

    const data = await res.json() as Record<string, unknown>;
    expect(data.markdown_url).toBeUndefined();
  });

  it('should reject when neither html nor markdown is provided', async () => {
    const pageId = uniqueId('empty');
    const res = await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        title: 'No content',
        },
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /p/:id/md', () => {
  it('should return markdown with correct content type', async () => {
    const pageId = uniqueId('md-get');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        markdown: '# Title\n\nContent',
        },
      }),
    });

    const res = await app.request(`/p/${pageId}/md`);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    expect(res.headers.get('Content-Disposition')).toContain(`${pageId}.md`);
    
    const content = await res.text();
    expect(content).toBe('# Title\n\nContent');
  });

  it('should return 404 when page has no markdown', async () => {
    const pageId = uniqueId('no-md-page');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        },
      }),
    });

    const res = await app.request(`/p/${pageId}/md`);
    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent page', async () => {
    const res = await app.request(`/p/${uniqueId('nonexistent')}/md`);
    expect(res.status).toBe(404);
  });

  it('should support ETag caching', async () => {
    const pageId = uniqueId('md-etag');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        markdown: '# ETag test',
        },
      }),
    });

    const firstRes = await app.request(`/p/${pageId}/md`);
    const etag = firstRes.headers.get('ETag');
    expect(etag).toBeDefined();

    const cachedRes = await app.request(`/p/${pageId}/md`, {
      headers: { 'If-None-Match': etag! },
    });
    expect(cachedRes.status).toBe(304);
  });
});

describe('GET /p/:id with Accept: text/markdown', () => {
  it('should return markdown when Accept header requests it', async () => {
    const pageId = uniqueId('accept-md');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html><body>HTML</body></html>',
        markdown: '# Markdown Version',
        },
      }),
    });

    const res = await app.request(`/p/${pageId}`, {
      headers: { 'Accept': 'text/markdown' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    
    const content = await res.text();
    expect(content).toBe('# Markdown Version');
  });

  it('should return HTML without Accept header', async () => {
    const pageId = uniqueId('no-accept');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html><body>HTML</body></html>',
        markdown: '# Markdown',
        },
      }),
    });

    const res = await app.request(`/p/${pageId}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    
    const content = await res.text();
    expect(content).toContain('HTML');
  });

  it('should return markdown when page has no HTML but has markdown', async () => {
    const pageId = uniqueId('md-only-page');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        markdown: '# Markdown Only Page',
        },
      }),
    });

    const res = await app.request(`/p/${pageId}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    
    const content = await res.text();
    expect(content).toBe('# Markdown Only Page');
  });
});

describe('Auth for markdown endpoint', () => {
  it('should require auth for protected page markdown', async () => {
    const pageId = uniqueId('auth-md');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        markdown: '# Secret Markdown',
        auth: { password: 'secret123' },
        },
      }),
    });

    const res = await app.request(`/p/${pageId}/md`);
    expect(res.status).toBe(401);
  });

  it('should return markdown with valid auth', async () => {
    const pageId = uniqueId('auth-md-valid');
    await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        markdown: '# Protected Content',
        auth: { password: 'mypassword' },
        },
      }),
    });

    const credentials = Buffer.from('user:mypassword').toString('base64');
    const res = await app.request(`/p/${pageId}/md`, {
      headers: { 'Authorization': `Basic ${credentials}` },
    });

    expect(res.status).toBe(200);
    const content = await res.text();
    expect(content).toBe('# Protected Content');
  });

  it('should work with URL token for markdown', async () => {
    const pageId = uniqueId('token-md');
    const createRes = await app.request(`/v1/pages/${pageId}`, {
      ...jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${pageId}`,
        body: {
        html: '<html></html>',
        markdown: '# Token Protected',
        auth: { urlToken: true },
        },
      }),
    });

    const data = await createRes.json() as Record<string, string>;
    const secretUrl = data.secret_markdown_url;
    expect(secretUrl).toBeDefined();

    const res = await app.request(secretUrl!);
    expect(res.status).toBe(200);
    const content = await res.text();
    expect(content).toBe('# Token Protected');
  });
});
