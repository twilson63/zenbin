import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as admin from '../storage/admin.js';
import { rmSync, existsSync } from 'fs';

const TEST_ADMIN_PATH = './data/test-admin.sqlite';

describe('Admin Database', () => {
  beforeAll(() => {
    try {
      rmSync(TEST_ADMIN_PATH, { recursive: true, force: true });
    } catch { /* ignore */ }
    admin.initAdminDatabase(TEST_ADMIN_PATH);
  });

  afterAll(() => {
    admin.closeAdminDatabase();
    try {
      rmSync(TEST_ADMIN_PATH, { recursive: true, force: true });
    } catch { /* ignore */ }
  });

  describe('Database initialization', () => {
    it('should initialize database', () => {
      expect(existsSync(TEST_ADMIN_PATH)).toBe(true);
    });
  });

  describe('User CRUD', () => {
    it('should create a user', () => {
      const user: admin.User = {
        id: 'user-1',
        email: 'test@example.com',
        email_verified: 0,
        created_at: Date.now(),
      };
      const created = admin.createUser(user);
      expect(created.id).toBe('user-1');
      expect(created.email).toBe('test@example.com');
    });

    it('should get user by id', () => {
      const user = admin.getUserById('user-1');
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should get user by email', () => {
      const user = admin.getUserByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.id).toBe('user-1');
    });

    it('should update user', () => {
      const updated = admin.updateUser('user-1', { email_verified: 1 });
      expect(updated?.email_verified).toBe(1);
    });

    it('should delete user', () => {
      const deleted = admin.deleteUser('user-1');
      expect(deleted).toBe(true);
      expect(admin.getUserById('user-1')).toBeUndefined();
    });
  });

  describe('API Key CRUD', () => {
    it('should create a user first', () => {
      const user: admin.User = {
        id: 'key-user-1',
        email: 'keyuser@example.com',
        email_verified: 1,
        created_at: Date.now(),
      };
      admin.createUser(user);
    });

    it('should create an API key', () => {
      const apiKey: admin.ApiKey = {
        id: 'key-1',
        user_id: 'key-user-1',
        type: 'admin',
        plan: 'free',
        monthly_limit: 100,
        created_at: Date.now(),
      };
      const created = admin.createApiKey(apiKey);
      expect(created.id).toBe('key-1');
      expect(created.plan).toBe('free');
    });

    it('should get API key by id', () => {
      const key = admin.getApiKeyById('key-1');
      expect(key).toBeDefined();
      expect(key?.user_id).toBe('key-user-1');
    });

    it('should get API keys by user id', () => {
      const keys = admin.getApiKeysByUserId('key-user-1');
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should update API key', () => {
      const updated = admin.updateApiKey('key-1', { monthly_limit: 500 });
      expect(updated?.monthly_limit).toBe(500);
    });

    it('should revoke API key', () => {
      const revoked = admin.revokeApiKey('key-1');
      expect(revoked?.revoked_at).toBeDefined();
    });
  });

  describe('Usage tracking', () => {
    it('should log usage', () => {
      const log = admin.logUsage({
        id: 0,
        key_id: 'key-1',
        period: '2026-04',
        requests: 10,
        bytes_sent: 1024,
        timestamp: Date.now(),
      });
      expect(log.id).toBeGreaterThan(0);
    });

    it('should get usage for key and period', () => {
      const usage = admin.getUsageForKey('key-1', '2026-04');
      expect(usage).toBeDefined();
      expect(usage?.requests).toBe(10);
    });

    it('should increment usage', () => {
      admin.incrementUsage('key-1', '2026-04', 5, 512);
      const usage = admin.getUsageForKey('key-1', '2026-04');
      expect(usage?.requests).toBe(15);
      expect(usage?.bytes_sent).toBe(1536);
    });
  });

  describe('Monthly limit enforcement', () => {
    const limitKeyId = 'limit-test-key';
    beforeAll(() => {
      const apiKey: admin.ApiKey = {
        id: limitKeyId,
        user_id: 'key-user-1',
        type: 'api',
        plan: 'free',
        monthly_limit: 500,
        created_at: Date.now(),
      };
      admin.createApiKey(apiKey);
      admin.incrementUsage(limitKeyId, '2026-04', 15, 1536);
    });

    it('should check monthly limit with available quota', () => {
      const result = admin.checkMonthlyLimit(limitKeyId);
      expect(result.allowed).toBe(true);
      expect(result.used).toBe(15);
      expect(result.remaining).toBe(485);
    });

    it('should deny when limit exceeded', () => {
      admin.updateApiKey(limitKeyId, { monthly_limit: 10 });
      const result = admin.checkMonthlyLimit(limitKeyId);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should deny for non-existent key', () => {
      const result = admin.checkMonthlyLimit('non-existent');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Email Tokens', () => {
    it('should create email token', () => {
      const token: admin.EmailToken = {
        token: 'verify-token-1',
        user_id: 'key-user-1',
        email: 'keyuser@example.com',
        type: 'verification',
        expires_at: Date.now() + 3600000,
      };
      const created = admin.createEmailToken(token);
      expect(created.token).toBe('verify-token-1');
    });

    it('should get email token', () => {
      const token = admin.getEmailToken('verify-token-1');
      expect(token).toBeDefined();
      expect(token?.type).toBe('verification');
    });

    it('should use email token', () => {
      const used = admin.useEmailToken('verify-token-1');
      expect(used).toBeDefined();
      expect(used?.used_at).toBeDefined();
    });

    it('should not use expired token', () => {
      const expiredToken: admin.EmailToken = {
        token: 'expired-token',
        user_id: 'key-user-1',
        email: 'keyuser@example.com',
        type: 'verification',
        expires_at: Date.now() - 1000,
      };
      admin.createEmailToken(expiredToken);
      const used = admin.useEmailToken('expired-token');
      expect(used).toBeUndefined();
    });
  });

  describe('Subdomains', () => {
    it('should create subdomain', () => {
      const sub: admin.Subdomain = {
        name: 'testsub',
        user_id: 'key-user-1',
        key_id: 'key-1',
        page_count: 0,
        created_at: Date.now(),
      };
      const created = admin.createSubdomain(sub);
      expect(created.name).toBe('testsub');
    });

    it('should get subdomain by name', () => {
      const sub = admin.getSubdomainByName('testsub');
      expect(sub).toBeDefined();
      expect(sub?.user_id).toBe('key-user-1');
    });

    it('should get subdomains by user id', () => {
      const subs = admin.getSubdomainsByUserId('key-user-1');
      expect(subs.length).toBeGreaterThan(0);
    });

    it('should update subdomain', () => {
      const updated = admin.updateSubdomain('testsub', { page_count: 5 });
      expect(updated?.page_count).toBe(5);
    });

    it('should delete subdomain', () => {
      const deleted = admin.deleteSubdomain('testsub');
      expect(deleted).toBe(true);
      expect(admin.getSubdomainByName('testsub')).toBeUndefined();
    });
  });
});