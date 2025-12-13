import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { render } from '../routes/render.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';

const TEST_DB_PATH = './data/test-api.lmdb';

// Create test app
const app = new Hono();
app.route('/v1/pages', pages);
app.route('/p', render);

beforeAll(() => {
  try {
    rmSync(TEST_DB_PATH, { recursive: true, force: true });
  } catch { /* ignore */ }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
});

afterAll(async () => {
  await closeDatabase();
  try {
    rmSync(TEST_DB_PATH, { recursive: true, force: true });
  } catch { /* ignore */ }
});

describe('POST /v1/pages/:id', () => {
  it('should create a new page', async () => {
    const res = await app.request('/v1/pages/test-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: '<!doctype html><html><body>Hello World</body></html>',
        title: 'Test Page',
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json() as { id: string; url: string; raw_url: string; etag: string };
    expect(data.id).toBe('test-page');
    expect(data.url).toContain('/p/test-page');
    expect(data.raw_url).toContain('/p/test-page/raw');
    expect(data.etag).toBeDefined();
  });

  it('should update an existing page', async () => {
    const res = await app.request('/v1/pages/test-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: '<!doctype html><html><body>Updated Content</body></html>',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json() as { id: string };
    expect(data.id).toBe('test-page');
  });

  it('should accept base64 encoded content', async () => {
    const html = '<!doctype html><html><body>Base64 Test</body></html>';
    const base64Html = Buffer.from(html).toString('base64');

    const res = await app.request('/v1/pages/base64-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encoding: 'base64',
        html: base64Html,
      }),
    });

    expect(res.status).toBe(201);
  });

  it('should reject invalid page IDs', async () => {
    const res = await app.request('/v1/pages/invalid/id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: '<html></html>',
      }),
    });

    // This will be 404 because the route doesn't match
    expect(res.status).toBe(404);
  });

  it('should reject invalid ID characters', async () => {
    const res = await app.request('/v1/pages/bad@id!', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: '<html></html>',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('should reject missing html field', async () => {
    const res = await app.request('/v1/pages/no-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'No HTML',
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /p/:id', () => {
  it('should render a page', async () => {
    // First create a page
    await app.request('/v1/pages/render-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: '<!doctype html><html><body>Render Test</body></html>',
      }),
    });

    // Then fetch it
    const res = await app.request('/p/render-test');
    
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Content-Security-Policy')).toBeDefined();
    
    const html = await res.text();
    expect(html).toContain('Render Test');
  });

  it('should return 404 for non-existent page', async () => {
    const res = await app.request('/p/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('should support ETag caching', async () => {
    // Create a page
    const createRes = await app.request('/v1/pages/etag-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: '<!doctype html><html><body>ETag Test</body></html>',
      }),
    });
    
    const etag = createRes.headers.get('ETag');
    expect(etag).toBeDefined();

    // Request with matching ETag
    const cachedRes = await app.request('/p/etag-test', {
      headers: { 'If-None-Match': etag! },
    });
    
    expect(cachedRes.status).toBe(304);
  });
});

describe('GET /p/:id/raw', () => {
  it('should return raw HTML', async () => {
    // Create a page
    await app.request('/v1/pages/raw-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: '<!doctype html><html><body>Raw Test</body></html>',
      }),
    });

    // Fetch raw
    const res = await app.request('/p/raw-test/raw');
    
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(res.headers.get('Content-Disposition')).toContain('raw-test.html');
    
    const html = await res.text();
    expect(html).toContain('Raw Test');
  });
});
