import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { render } from '../routes/render.js';
import { initDatabase, closeDatabase, getDatabase, getPage } from '../storage/db.js';
import { resetAuthAttempts } from '../middleware/authRateLimit.js';
import { rmSync } from 'fs';
import { createSignedHeaders, createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';
import { createServices, type Services } from '../services/container.js';

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/p', render);
const TEST_DB_PATH = './data/test-auth.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

// Helper to create Basic Auth header
function basicAuth(password: string, username: string = ''): string {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
}

// Helper to generate unique page IDs
function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function signedGetRequest(signer: TestSigner, path: string, timestamp?: string, nonce?: string): Request {
  const pathForSigning = path.split('?')[0];
  const headers = createSignedHeaders({
    signer,
    method: 'GET',
    path: pathForSigning,
    body: '',
    timestamp,
    nonce,
  });
  return new Request(`http://localhost${path}`, { method: 'GET', headers });
}

describe('Page Authentication', () => {
  let signer: TestSigner;
  let otherSigner: TestSigner;

  beforeAll(async () => {
    for (const suffix of TEST_DB_SUFFIXES) {
      try {
        rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
      } catch {
        // Ignore if doesn't exist
      }
    }
    process.env.LMDB_PATH = TEST_DB_PATH;
    initDatabase();
    signer = await createTestSigner(`auth-test-signer-${Date.now()}`);
    otherSigner = await createTestSigner(`auth-test-other-${Date.now()}`);

    // Upgrade test signer to enterprise so billing limits don't interfere with existing tests
    const { updateAgentKeyPlan } = await import('../storage/db.js');
    await updateAgentKeyPlan(signer.keyId, 'enterprise');
    await updateAgentKeyPlan(otherSigner.keyId, 'enterprise');
  });

  afterAll(async () => {
    await closeDatabase();
    for (const suffix of TEST_DB_SUFFIXES) {
      try {
        rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Page Creation with Auth', () => {
    it('should create a page with password protection', async () => {
        const id = uniqueId('pass');
        const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>Secret</h1>',
          auth: { password: 'testpassword123' }
          },
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBe(id);
      expect(data.url).toContain(`/p/${id}`);
      expect(data.secret_url).toBeUndefined(); // No token requested
    });

    it('should create a page with URL token', async () => {
      const id = uniqueId('token');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>Token Page</h1>',
          auth: { urlToken: true }
          },
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.secret_url).toBeDefined();
      expect(data.secret_url).toContain('?token=');
      expect(data.secret_raw_url).toBeDefined();
      expect(data.secret_raw_url).toContain('?token=');
    });

    it('should create a page with both password and URL token', async () => {
      const id = uniqueId('both');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>Dual Auth</h1>',
          auth: { password: 'testpassword123', urlToken: true }
          },
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.secret_url).toBeDefined();
    });

    it('should reject password shorter than 8 characters', async () => {
      const id = uniqueId('short');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>Test</h1>',
          auth: { password: 'short' }
          },
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('8 characters');
    });

    it('should treat empty auth object as public/cleared auth', async () => {
      const id = uniqueId('empty');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>Test</h1>',
          auth: {}
          },
        }),
      });

      expect(res.status).toBe(201);
      const page = getPage(id);
      expect(page?.auth).toBeUndefined();
    });

    it('should create public page without auth', async () => {
      const id = uniqueId('public');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>Public</h1>'
          },
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.secret_url).toBeUndefined();
    });

    it('should create a sign-to-read page with recipientKeyId', async () => {
      const id = uniqueId('sign-read-create');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
            html: '<h1>Sign to Read</h1>',
            recipientKeyId: signer.publicKeyFingerprint,
            auth: { signToRead: true },
          },
        }),
      });

      expect(res.status).toBe(201);
      const page = getPage(id);
      expect(page?.auth?.signToRead).toBe(true);
      expect(page?.recipientKeyId).toBe(signer.publicKeyFingerprint);
    });

    it('should reject sign-to-read without recipientKeyId', async () => {
      const id = uniqueId('sign-read-no-recipient');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
            html: '<h1>Missing Recipient</h1>',
            auth: { signToRead: true },
          },
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('recipientKeyId');
    });

    it('should treat signToRead false as unset', async () => {
      const id = uniqueId('sign-read-false');
      const res = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
            html: '<h1>Public False</h1>',
            auth: { signToRead: false },
          },
        }),
      });

      expect(res.status).toBe(201);
      const page = getPage(id);
      expect(page?.auth).toBeUndefined();
    });
  });

  describe('Sign-to-Read Pages', () => {
    it('should return 401 without a signature', async () => {
      const id = uniqueId('sign-read-unsigned');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Private</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true },
        },
      }));

      const res = await app.request(`/p/${id}`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.hint).toBe('sign-to-read');
    });

    it('should return 200 with a matching signed GET', async () => {
      const id = uniqueId('sign-read-match');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Private Match</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true },
        },
      }));

      const res = await app.request(signedGetRequest(signer, `/p/${id}`));
      expect(res.status).toBe(200);
      expect(await res.text()).toContain('Private Match');
    });

    it('should return 401 with a signed GET from the wrong key', async () => {
      const id = uniqueId('sign-read-wrong-key');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Private Wrong Key</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true },
        },
      }));

      const res = await app.request(signedGetRequest(otherSigner, `/p/${id}`));
      expect(res.status).toBe(401);
    });

    it('should return 401 with an expired signed GET timestamp', async () => {
      const id = uniqueId('sign-read-expired');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Private Expired</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true },
        },
      }));

      const oldTimestamp = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const res = await app.request(signedGetRequest(signer, `/p/${id}`, oldTimestamp));
      expect(res.status).toBe(401);
    });

    it('should return 401 when a signed GET nonce is reused', async () => {
      const id = uniqueId('sign-read-reused-nonce');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Private Nonce</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true },
        },
      }));

      const timestamp = new Date().toISOString();
      const nonce = uniqueId('nonce');
      const first = await app.request(signedGetRequest(signer, `/p/${id}`, timestamp, nonce));
      expect(first.status).toBe(200);
      const second = await app.request(signedGetRequest(signer, `/p/${id}`, timestamp, nonce));
      expect(second.status).toBe(401);
    });

    it('should keep public pages readable without signatures', async () => {
      const id = uniqueId('sign-read-public');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: { html: '<h1>Still Public</h1>' },
      }));

      const res = await app.request(`/p/${id}`);
      expect(res.status).toBe(200);
    });

    it('should allow clearing sign-to-read auth from an existing page', async () => {
      const id = uniqueId('sign-read-clear');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Private Then Public</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true },
        },
      }));

      const clearRes = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Public Again</h1>',
          auth: {},
        },
      }));
      expect(clearRes.status).toBe(200);
      expect(getPage(id)?.auth).toBeUndefined();

      const readRes = await app.request(`/p/${id}`);
      expect(readRes.status).toBe(200);
      expect(await readRes.text()).toContain('Public Again');
    });

    it('should allow clearing auth with null from an existing page', async () => {
      const id = uniqueId('sign-read-clear-null');
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Private Then Null Public</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true },
        },
      }));

      const clearRes = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Public Again Null</h1>',
          auth: null,
        },
      }));
      expect(clearRes.status).toBe(200);
      expect(getPage(id)?.auth).toBeUndefined();
    });

    it('should allow either correct password or matching signature when both are configured', async () => {
      const id = uniqueId('sign-read-password');
      const password = 'testpassword123';
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: {
          html: '<h1>Dual Private</h1>',
          recipientKeyId: signer.publicKeyFingerprint,
          auth: { signToRead: true, password },
        },
      }));

      resetAuthAttempts(id);
      const passwordRes = await app.request(`/p/${id}`, {
        headers: { Authorization: basicAuth(password) },
      });
      expect(passwordRes.status).toBe(200);

      resetAuthAttempts(id);
      const signedRes = await app.request(signedGetRequest(signer, `/p/${id}`));
      expect(signedRes.status).toBe(200);
    });
  });

  describe('Accessing Protected Pages', () => {
    let passwordPageId: string;
    let tokenPageId: string;
    let urlToken: string;
    const password = 'testpassword123';

    beforeAll(async () => {
      // Create password-protected page
      passwordPageId = uniqueId('access-pass');
        await app.request(`/v1/pages/${passwordPageId}`, {
          ...jsonSignedRequest({
            signer,
            method: 'POST',
            path: `/v1/pages/${passwordPageId}`,
            body: {
          html: '<h1>Password Protected</h1>',
          auth: { password }
            },
          }),
        });

      // Create token-protected page
      tokenPageId = uniqueId('access-token');
        const tokenRes = await app.request(`/v1/pages/${tokenPageId}`, {
          ...jsonSignedRequest({
            signer,
            method: 'POST',
            path: `/v1/pages/${tokenPageId}`,
            body: {
          html: '<h1>Token Protected</h1>',
          auth: { urlToken: true }
            },
          }),
        });
      const tokenData = await tokenRes.json();
      const url = new URL(tokenData.secret_url);
      urlToken = url.searchParams.get('token')!;
    });

    it('should return 401 without auth for protected page', async () => {
      const res = await app.request(`/p/${passwordPageId}`);
      expect(res.status).toBe(401);
      expect(res.headers.get('WWW-Authenticate')).toBe(`Basic realm="ZenBin-${passwordPageId}"`);
    });

    it('should return 401 with wrong password', async () => {
      resetAuthAttempts(passwordPageId);
      const res = await app.request(`/p/${passwordPageId}`, {
        headers: { Authorization: basicAuth('wrongpassword') }
      });
      expect(res.status).toBe(401);
    });

    it('should return 200 with correct password', async () => {
      resetAuthAttempts(passwordPageId);
      const res = await app.request(`/p/${passwordPageId}`, {
        headers: { Authorization: basicAuth(password) }
      });
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Password Protected');
    });

    it('should return 200 with valid URL token', async () => {
      const res = await app.request(`/p/${tokenPageId}?token=${urlToken}`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Token Protected');
    });

    it('should return 401 with invalid URL token', async () => {
      resetAuthAttempts(tokenPageId);
      const res = await app.request(`/p/${tokenPageId}?token=invalidtoken`);
      expect(res.status).toBe(401);
    });

    it('should work with raw endpoint and password', async () => {
      resetAuthAttempts(passwordPageId);
      const res = await app.request(`/p/${passwordPageId}/raw`, {
        headers: { Authorization: basicAuth(password) }
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('text/plain');
    });

    it('should work with raw endpoint and URL token', async () => {
      const res = await app.request(`/p/${tokenPageId}/raw?token=${urlToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Public Pages Still Work', () => {
    it('should access public page without auth', async () => {
      const id = uniqueId('still-public');
      await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: { html: '<h1>Public</h1>' },
        }),
      });

      const res = await app.request(`/p/${id}`);
      expect(res.status).toBe(200);
    });
  });

  describe('ETag Caching with Auth', () => {
    it('should return 304 for authenticated request with matching ETag', async () => {
      const id = uniqueId('etag');
      const password = 'testpassword123';

      // Create page
      const createRes = await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>ETag Test</h1>',
          auth: { password }
          },
        }),
      });
      const { etag } = await createRes.json();

      // First request to get content
      resetAuthAttempts(id);
      const firstRes = await app.request(`/p/${id}`, {
        headers: { Authorization: basicAuth(password) }
      });
      expect(firstRes.status).toBe(200);

      // Second request with If-None-Match
      const secondRes = await app.request(`/p/${id}`, {
        headers: {
          Authorization: basicAuth(password),
          'If-None-Match': etag
        }
      });
      expect(secondRes.status).toBe(304);
    });
  });

  describe('Brute Force Protection', () => {
    it('should lock out after too many failed attempts', async () => {
      const id = uniqueId('brute');
      await app.request(`/v1/pages/${id}`, {
        ...jsonSignedRequest({
          signer,
          method: 'POST',
          path: `/v1/pages/${id}`,
          body: {
          html: '<h1>Brute Force Test</h1>',
          auth: { password: 'correctpassword' }
          },
        }),
      });

      // Reset any existing attempts
      resetAuthAttempts(id);

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await app.request(`/p/${id}`, {
          headers: { Authorization: basicAuth('wrongpassword') }
        });
      }

      // Next attempt should be rate limited
      const res = await app.request(`/p/${id}`, {
        headers: { Authorization: basicAuth('wrongpassword') }
      });
      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeDefined();
    });
  });
});
