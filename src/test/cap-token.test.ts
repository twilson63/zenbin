import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { sign } from 'crypto';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { render } from '../routes/render.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import {
  generateTestSigner,
  createTestSigner,
  createSignedHeaders,
  createCapSignedHeaders,
  jsonSignedRequest,
  type TestSigner,
} from './helpers/signing.js';
import { parseCapToken, verifyCapToken } from '../utils/auth.js';
import { config } from '../config.js';
import type { Page } from '../types.js';

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/p', render);

let signer: TestSigner;
let recipientSigner: TestSigner;
let otherSigner: TestSigner;

function toBase64Url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(str: string): Buffer {
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64');
}

function toBase64UrlStr(str: string): string {
  return toBase64Url(Buffer.from(str, 'utf-8'));
}

/**
 * Generate a CAP access token for testing.
 * Canonical string: CAP_TOKEN\n{path}\n{expires}
 */
function generateCapToken(signer: TestSigner, path: string, ttlSeconds: number): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const nonce = `test-nonce-${Date.now()}`;
  const canonical = `CAP_TOKEN\n${path}\n${expires}`;

  const signature = sign(
    null,
    Buffer.from(canonical, 'utf-8'),
    { key: signer.privateJwk, format: 'jwk' },
  );

  return [
    'v1',
    toBase64UrlStr(signer.keyId),
    toBase64UrlStr(String(expires)),
    toBase64UrlStr(nonce),
    toBase64Url(signature),
  ].join('.');
}

function generateExpiredCapToken(signer: TestSigner, path: string): string {
  const expires = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  const nonce = `test-nonce-expired-${Date.now()}`;
  const canonical = `CAP_TOKEN\n${path}\n${expires}`;

  const signature = sign(
    null,
    Buffer.from(canonical, 'utf-8'),
    { key: signer.privateJwk, format: 'jwk' },
  );

  return [
    'v1',
    toBase64UrlStr(signer.keyId),
    toBase64UrlStr(String(expires)),
    toBase64UrlStr(nonce),
    toBase64Url(signature),
  ].join('.');
}

function generateFarFutureCapToken(signer: TestSigner, path: string): string {
  // Beyond MAX_TTL (86400s = 24h)
  const expires = Math.floor(Date.now() / 1000) + 200000;
  const nonce = `test-nonce-far-${Date.now()}`;
  const canonical = `CAP_TOKEN\n${path}\n${expires}`;

  const signature = sign(
    null,
    Buffer.from(canonical, 'utf-8'),
    { key: signer.privateJwk, format: 'jwk' },
  );

  return [
    'v1',
    toBase64UrlStr(signer.keyId),
    toBase64UrlStr(String(expires)),
    toBase64UrlStr(nonce),
    toBase64Url(signature),
  ].join('.');
}

function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

describe('CAP Access Token — parseCapToken', () => {
  it('should parse a well-formed v1 token', () => {
    const s = generateTestSigner('test-parser');
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const nonce = 'test-nonce';
    const canonical = `CAP_TOKEN\n/p/test\n${expires}`;
    const signature = sign(null, Buffer.from(canonical, 'utf-8'), { key: s.privateJwk, format: 'jwk' });

    const token = [
      'v1',
      toBase64UrlStr(s.keyId),
      toBase64UrlStr(String(expires)),
      toBase64UrlStr(nonce),
      toBase64Url(signature),
    ].join('.');

    const result = parseCapToken(token);
    expect(result).not.toBeNull();
    expect(result!.version).toBe('v1');
    expect(result!.keyId).toBe(s.keyId);
    expect(result!.expires).toBe(expires);
    expect(result!.nonce).toBe(nonce);
  });

  it('should return null for invalid version', () => {
    const token = 'v2.a.b.c.d';
    expect(parseCapToken(token)).toBeNull();
  });

  it('should return null for wrong number of parts', () => {
    expect(parseCapToken('v1.a.b')).toBeNull();
    expect(parseCapToken('v1.a.b.c.d.e')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseCapToken('')).toBeNull();
  });

  it('should return null for invalid base64url', () => {
    expect(parseCapToken('v1.!!!.b.c.d')).toBeNull();
  });
});

describe('CAP Access Token — verifyCapToken', () => {
  beforeEach(async () => {
    signer = await createTestSigner(`cap-owner-${uniqueId('key')}`);
    recipientSigner = await createTestSigner(`cap-recipient-${uniqueId('key')}`);
    otherSigner = await createTestSigner(`cap-other-${uniqueId('key')}`);
  });

  it('should authorize owner key token on owned page', () => {
    const token = generateCapToken(signer, '/p/test-page', 3600);
    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
    };

    const result = verifyCapToken(token, '/p/test-page', page);
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.keyId).toBe(signer.keyId);
    }
  });

  it('should authorize recipient key token on signToRead page', () => {
    const token = generateCapToken(recipientSigner, '/p/private-page', 3600);
    const page: Page = {
      id: 'private-page',
      html: '<h1>Private</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
      recipientKeyId: recipientSigner.publicKeyFingerprint,
      auth: { signToRead: true },
    };

    const result = verifyCapToken(token, '/p/private-page', page);
    expect(result.authorized).toBe(true);
  });

  it('should reject expired tokens', () => {
    const token = generateExpiredCapToken(signer, '/p/test-page');
    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
    };

    const result = verifyCapToken(token, '/p/test-page', page);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toContain('expired');
    }
  });

  it('should reject tokens beyond MAX_TTL', () => {
    const token = generateFarFutureCapToken(signer, '/p/test-page');
    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
    };

    const result = verifyCapToken(token, '/p/test-page', page);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toContain('TTL');
    }
  });

  it('should reject tokens from unknown keys', () => {
    const unknownSigner = generateTestSigner('unknown-key'); // not registered
    const token = generateCapToken(unknownSigner, '/p/test-page', 3600);
    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
    };

    const result = verifyCapToken(token, '/p/test-page', page);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toContain('Unknown');
    }
  });

  it('should reject tokens from non-owner, non-recipient key', () => {
    const token = generateCapToken(otherSigner, '/p/test-page', 3600);
    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
    };

    const result = verifyCapToken(token, '/p/test-page', page);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toContain('Not authorized');
    }
  });

  it('should reject recipient key token on non-signToRead page', () => {
    const token = generateCapToken(recipientSigner, '/p/test-page', 3600);
    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
      recipientKeyId: recipientSigner.publicKeyFingerprint,
      // No auth.signToRead — recipient key is NOT authorized
    };

    const result = verifyCapToken(token, '/p/test-page', page);
    expect(result.authorized).toBe(false);
  });

  it('should reject token with wrong path (path binding)', () => {
    const token = generateCapToken(signer, '/p/original-page', 3600);
    const page: Page = {
      id: 'different-page',
      html: '<h1>Different</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
    };

    const result = verifyCapToken(token, '/p/different-page', page);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toContain('signature');
    }
  });

  it('should reject tokens with invalid signature', () => {
    const token = generateCapToken(signer, '/p/test-page', 3600);
    // Tamper with signature
    const parts = token.split('.');
    parts[4] = toBase64UrlStr('tampered-signature');
    const tamperedToken = parts.join('.');

    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: signer.keyId,
    };

    const result = verifyCapToken(tamperedToken, '/p/test-page', page);
    expect(result.authorized).toBe(false);
  });
});

describe('CAP Access Token — render routes integration', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    signer = await createTestSigner(`cap-render-owner-${uniqueId('key')}`);
    recipientSigner = await createTestSigner(`cap-render-recipient-${uniqueId('key')}`);
  });

  it('should render a public page with valid owner cap_token', async () => {
    const pageId = uniqueId('cap-public');
    await app.request(`/v1/pages/${pageId}`, {
      ...{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createSignedHeaders({ signer, method: 'POST', path: `/v1/pages/${pageId}`, body: JSON.stringify({ html: '<h1>Public Page</h1>' }) }),
        },
        body: JSON.stringify({ html: '<h1>Public Page</h1>' }),
      },
    });

    const token = generateCapToken(signer, `/p/${pageId}`, 3600);
    const res = await app.request(`/p/${pageId}?cap_token=${token}`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Public Page');
  });

  it('should render a signToRead page with valid recipient cap_token', async () => {
    const pageId = uniqueId('cap-private');
    await app.request(`/v1/pages/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createCapSignedHeaders({
          signer,
          method: 'POST',
          path: `/v1/pages/${pageId}`,
          body: JSON.stringify({
            html: '<h1>Private Page</h1>',
            recipientKeyId: recipientSigner.publicKeyFingerprint,
            auth: { signToRead: true },
          }),
        }),
      },
      body: JSON.stringify({
        html: '<h1>Private Page</h1>',
        recipientKeyId: recipientSigner.publicKeyFingerprint,
        auth: { signToRead: true },
      }),
    });

    const token = generateCapToken(recipientSigner, `/p/${pageId}`, 3600);
    const res = await app.request(`/p/${pageId}?cap_token=${encodeURIComponent(token)}`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Private Page');
  });

  it('should reject expired cap_token with 401', async () => {
    const pageId = uniqueId('cap-expired');
    await app.request(`/v1/pages/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createSignedHeaders({ signer, method: 'POST', path: `/v1/pages/${pageId}`, body: JSON.stringify({ html: '<h1>Test</h1>' }) }),
      },
      body: JSON.stringify({ html: '<h1>Test</h1>' }),
    });

    const token = generateExpiredCapToken(signer, `/p/${pageId}`);
    const res = await app.request(`/p/${pageId}?cap_token=${encodeURIComponent(token)}`);
    expect(res.status).toBe(401);
  });

  it('should reject cap_token from wrong key with 401', async () => {
    const otherKey = await createTestSigner(`cap-wrong-${uniqueId('key')}`);
    const pageId = uniqueId('cap-wrong');
    await app.request(`/v1/pages/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createSignedHeaders({ signer, method: 'POST', path: `/v1/pages/${pageId}`, body: JSON.stringify({ html: '<h1>Test</h1>' }) }),
      },
      body: JSON.stringify({ html: '<h1>Test</h1>' }),
    });

    const token = generateCapToken(otherKey, `/p/${pageId}`, 3600);
    const res = await app.request(`/p/${pageId}?cap_token=${encodeURIComponent(token)}`);
    expect(res.status).toBe(401);
  });

  it('should fall through to existing auth when no cap_token present', async () => {
    const pageId = uniqueId('cap-fallback');
    await app.request(`/v1/pages/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createSignedHeaders({ signer, method: 'POST', path: `/v1/pages/${pageId}`, body: JSON.stringify({ html: '<h1>Public</h1>' }) }),
      },
      body: JSON.stringify({ html: '<h1>Public</h1>' }),
    });

    // No cap_token — should render normally (public page)
    const res = await app.request(`/p/${pageId}`);
    expect(res.status).toBe(200);
  });

  it('should work with all content variants', async () => {
    const pageId = uniqueId('cap-variants');
    const mdContent = '# Markdown Content\n\nHello **world**.';
    await app.request(`/v1/pages/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createSignedHeaders({ signer, method: 'POST', path: `/v1/pages/${pageId}`, body: JSON.stringify({ html: '<h1>Test</h1>', markdown: mdContent }) }),
      },
      body: JSON.stringify({ html: '<h1>Test</h1>', markdown: mdContent }),
    });

    // HTML
    const htmlToken = generateCapToken(signer, `/p/${pageId}`, 3600);
    const htmlRes = await app.request(`/p/${pageId}?cap_token=${encodeURIComponent(htmlToken)}`);
    expect(htmlRes.status).toBe(200);

    // Markdown
    const mdToken = generateCapToken(signer, `/p/${pageId}/md`, 3600);
    const mdRes = await app.request(`/p/${pageId}/md?cap_token=${encodeURIComponent(mdToken)}`);
    expect(mdRes.status).toBe(200);
  });
});

describe('CAP Access Token — blocked/revoked keys', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should reject cap_token from blocked key', async () => {
    const blockedKey = await createTestSigner(`cap-blocked-${uniqueId('key')}`);
    // Block the key directly in DB
    const { updateAgentKeyStatus } = await import('../storage/db.js');
    await updateAgentKeyStatus(blockedKey.keyId, 'blocked', 'test-block');

    const page: Page = {
      id: 'test-page',
      html: '<h1>Test</h1>',
      encoding: 'utf-8',
      content_type: 'text/html',
      etag: 'abc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ownerKeyId: blockedKey.keyId,
    };

    const token = generateCapToken(blockedKey, '/p/test-page', 3600);
    const result = verifyCapToken(token, '/p/test-page', page);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.reason).toContain('blocked');
    }
  });
});