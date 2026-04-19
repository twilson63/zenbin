import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { verifyApiKey } from '../middleware/verifyApiKey.js';
import { initAdminDatabase, closeAdminDatabase, createApiKey, createUser, getUserByEmail } from '../storage/admin.js';
import { rmSync } from 'fs';

const TEST_ADMIN_PATH = './data/test-apikey.sqlite';

// Test app with protected route
const createTestApp = () => {
  const app = new Hono();
  app.use('*', verifyApiKey);
  app.get('/protected', (c) => c.json({ success: true, user: c.get('user') }));
  return app;
};

describe('API Key Middleware', () => {
  beforeAll(() => {
    try {
      rmSync(TEST_ADMIN_PATH, { recursive: true, force: true });
    } catch { /* ignore */ }
    initAdminDatabase(TEST_ADMIN_PATH);
  });

  afterAll(() => {
    closeAdminDatabase();
    try {
      rmSync(TEST_ADMIN_PATH, { recursive: true, force: true });
    } catch { /* ignore */ }
  });

  describe('zb_live_ keys', () => {
    it('should reject requests without API key', async () => {
      const app = createTestApp();
      const res = await app.request('/protected');
      
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('API key required');
    });

    it('should reject invalid API key', async () => {
      const app = createTestApp();
      const res = await app.request('/protected', {
        headers: { 'X-API-Key': 'zb_live_invalidkey' },
      });
      
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Invalid API key');
    });

    it('should accept valid API key', async () => {
      // Create user and key
      const user = createUser({
        id: 'test-user-1',
        email: 'keytest@example.com',
        email_verified: 1,
        created_at: Date.now(),
      });
      
      const key = createApiKey({
        id: 'zb_live_testkey1234567890123456789012',
        user_id: user.id,
        type: 'live',
        plan: 'free',
        monthly_limit: 100,
        created_at: Date.now(),
      });

      const app = createTestApp();
      const res = await app.request('/protected', {
        headers: { 'X-API-Key': key.id },
      });
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
    });

    it('should reject revoked API key', async () => {
      const user = createUser({
        id: 'test-user-2',
        email: 'revoked@example.com',
        email_verified: 1,
        created_at: Date.now(),
      });
      
      const key = createApiKey({
        id: 'zb_live_revokedkey123456789012345678',
        user_id: user.id,
        type: 'live',
        plan: 'free',
        monthly_limit: 100,
        created_at: Date.now(),
        revoked_at: Date.now(),
      });

      const app = createTestApp();
      const res = await app.request('/protected', {
        headers: { 'X-API-Key': key.id },
      });
      
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('revoked');
    });
  });

  describe('Authorization header', () => {
    it('should accept Bearer token', async () => {
      const user = createUser({
        id: 'test-user-3',
        email: 'bearer@example.com',
        email_verified: 1,
        created_at: Date.now(),
      });
      
      const key = createApiKey({
        id: 'zb_live_bearerkey12345678901234567890',
        user_id: user.id,
        type: 'live',
        plan: 'free',
        monthly_limit: 100,
        created_at: Date.now(),
      });

      const app = createTestApp();
      const res = await app.request('/protected', {
        headers: { 'Authorization': `Bearer ${key.id}` },
      });
      
      expect(res.status).toBe(200);
    });
  });

  describe('Invalid formats', () => {
    it('should reject random string', async () => {
      const app = createTestApp();
      const res = await app.request('/protected', {
        headers: { 'X-API-Key': 'random-string' },
      });
      
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Invalid');
    });
  });
});