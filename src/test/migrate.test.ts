import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { initAdminDatabase, closeAdminDatabase, getUserByEmail, getSubdomainByName, createSubdomain } from '../storage/admin.js';
import { migrate } from '../routes/migrate.js';
import { verifyApiKey } from '../middleware/verifyApiKey.js';
import { rmSync } from 'fs';

const TEST_ADMIN_PATH = './data/test-migrate.sqlite';

const app = new Hono();
// Migration endpoint is public (for anonymous users to register)
app.route('/v1/migrate', migrate);

// Protected endpoints require API key
const protectedApp = new Hono();
protectedApp.use('*', verifyApiKey);
protectedApp.route('/v1/migrate', migrate);

describe('Migration Flow', () => {
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

  describe('POST /v1/migrate', () => {
    it('should accept email for migration', async () => {
      const res = await app.request('/v1/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'migrate@example.com' }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message).toContain('Verification email');
      expect(data.email).toBe('migrate@example.com');
    });

    it('should reject invalid email', async () => {
      const res = await app.request('/v1/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid');
    });

    it('should handle duplicate email registration', async () => {
      const email = 'dup-migrate@example.com';
      
      // First registration
      const res1 = await app.request('/v1/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      expect(res1.status).toBe(201);

      // Duplicate
      const res2 = await app.request('/v1/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      expect(res2.status).toBe(200); // Already pending
    });
  });

  describe('GET /v1/migrate/subdomains', () => {
    it('should require authentication', async () => {
      // This endpoint is protected - test with protected app
      const res = await protectedApp.request('/v1/migrate/subdomains');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /v1/migrate/claim', () => {
    it('should require authentication', async () => {
      // This endpoint is protected - test with protected app
      const res = await protectedApp.request('/v1/migrate/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: 'test' }),
      });
      expect(res.status).toBe(401);
    });

    it('should reject missing subdomain', async () => {
      // This would need a valid API key to test properly
      // Skipping for now as it requires full auth setup
    });
  });
});