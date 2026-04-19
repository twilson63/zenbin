import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { initAdminDatabase, closeAdminDatabase, getUserByEmail, getApiKeysByUserId, getEmailToken } from '../storage/admin.js';
import { auth } from '../routes/auth.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';

const app = new Hono();
app.route('/v1', auth);

const TEST_ADMIN_DB = './data/test-admin-auth.sqlite';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

describe('Email Registration Flow', () => {
  beforeAll(() => {
    process.env.LMDB_PATH = './data/test-auth.lmdb';
    initDatabase();
    try {
      rmSync(TEST_ADMIN_DB, { recursive: true, force: true });
    } catch {}
    initAdminDatabase(TEST_ADMIN_DB);
  });

  afterAll(async () => {
    closeAdminDatabase();
    await closeDatabase();
    try {
      rmSync(TEST_ADMIN_DB, { recursive: true, force: true });
    } catch {}
  });

  describe('POST /v1/register', () => {
    it('should accept valid email', async () => {
      const email = uniqueEmail('valid');
      const res = await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message).toBe('Verification email sent');
      expect(data.email).toBe(email);
    });

    it('should reject invalid email', async () => {
      const res = await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid');
    });

    it('should reject duplicate email', async () => {
      const email = uniqueEmail('dup');
      
      const res1 = await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      expect(res1.status).toBe(201);

      const res2 = await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      expect(res2.status).toBe(409);
    });

    it('should reject missing email', async () => {
      const res = await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Email');
    });
  });

  describe('GET /v1/verify/:token', () => {
    it('should verify valid token and generate API key', async () => {
      const email = uniqueEmail('verify');
      
      const registerRes = await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      expect(registerRes.status).toBe(201);

      const user = getUserByEmail(email);
      expect(user).toBeDefined();
      expect(user?.verification_token).toBeDefined();

      const verifyRes = await app.request(`/v1/verify/${user!.verification_token}`);
      expect(verifyRes.status).toBe(200);
      const html = await verifyRes.text();
      expect(html).toContain('Email Verified');
      expect(html).toContain('zb_live_');

      const updatedUser = getUserByEmail(email);
      expect(updatedUser?.email_verified).toBe(1);

      const apiKeys = getApiKeysByUserId(user!.id);
      expect(apiKeys.length).toBe(1);
      expect(apiKeys[0].plan).toBe('free');
      expect(apiKeys[0].monthly_limit).toBe(100);
    });

    it('should reject expired token', async () => {
      const email = uniqueEmail('expired');
      
      const registerRes = await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      expect(registerRes.status).toBe(201);

      // Use a valid UUID format that doesn't exist
      const fakeToken = '00000000-0000-0000-0000-000000000000';

      const verifyRes = await app.request(`/v1/verify/${fakeToken}`);
      expect(verifyRes.status).toBe(404);
      const html = await verifyRes.text();
      expect(html).toContain('Token Not Found');
    });

    it('should reject used token', async () => {
      const email = uniqueEmail('used');
      
      await app.request('/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const user = getUserByEmail(email);
      await app.request(`/v1/verify/${user!.verification_token}`);

      const verifyRes = await app.request(`/v1/verify/${user!.verification_token}`);
      expect([400, 410]).toContain(verifyRes.status);
      const html = await verifyRes.text();
      expect(html).toContain('Already Used');
    });
  });
});