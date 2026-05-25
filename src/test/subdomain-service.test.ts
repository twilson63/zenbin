import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SubdomainService } from '../services/subdomainService.js';
import { KeyService } from '../services/keyService.js';
import { initDatabase, closeDatabase, saveAgentKey, getAgentKey } from '../storage/db.js';
import { rmSync } from 'fs';
import { createTestSigner, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-subdomain-service.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

let freeSigner: TestSigner;
let proSigner: TestSigner;

const subdomainService = new SubdomainService();
const services_keys = new KeyService();

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();

  freeSigner = await createTestSigner(`sub-svc-free-${Date.now()}`);
  proSigner = await createTestSigner(`sub-svc-pro-${Date.now()}`, 'pro');
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
});

describe('SubdomainService', () => {
  describe('save and get', () => {
    it('should save a new subdomain', async () => {
      const result = await subdomainService.save('mysite', freeSigner.keyId);
      expect(result.created).toBe(true);
      expect(result.subdomain.name).toBe('mysite');
    });

    it('should return existing subdomain on duplicate save', async () => {
      const result = await subdomainService.save('mysite', freeSigner.keyId);
      expect(result.created).toBe(false);
    });

    it('should get a subdomain by name', () => {
      const sub = subdomainService.get('mysite');
      expect(sub).toBeDefined();
      expect(sub!.name).toBe('mysite');
    });

    it('should return undefined for non-existent subdomain', () => {
      const sub = subdomainService.get('nonexistent');
      expect(sub).toBeUndefined();
    });
  });

  describe('count', () => {
    it('should return subdomain count', () => {
      const count = subdomainService.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('checkClaimLimit', () => {
    it('should allow claim for free plan under limit', () => {
      const result = subdomainService.checkClaimLimit(freeSigner.keyId);
      // Free plan allows 1 subdomain; we already created one, but count is monthlySubdomainCount
      // which starts at 0, so this should be allowed
      expect(result.allowed).toBe(true);
    });

    it('should block claim for free plan over limit', async () => {
      // Increment usage via the key service to reach the limit
      await services_keys.incrementUsage(freeSigner.keyId, 'monthlySubdomainCount');
      const result = subdomainService.checkClaimLimit(freeSigner.keyId);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Free tier');
      // Reset
      await services_keys.resetUsage(freeSigner.keyId);
    });

    it('should always allow pro plan claims', () => {
      const result = subdomainService.checkClaimLimit(proSigner.keyId);
      expect(result.allowed).toBe(true);
    });
  });

  describe('page count', () => {
    it('should increment page count', () => {
      subdomainService.incrementPageCount('mysite');
      const sub = subdomainService.get('mysite');
      expect(sub!.page_count).toBeGreaterThanOrEqual(1);
    });

    it('should decrement page count', () => {
      const before = subdomainService.get('mysite')!.page_count;
      subdomainService.decrementPageCount('mysite');
      const after = subdomainService.get('mysite')!.page_count;
      expect(after).toBe(before - 1);
    });
  });

  describe('delete', () => {
    it('should delete a subdomain', async () => {
      await subdomainService.save('deleteme', freeSigner.keyId);
      const deleted = await subdomainService.delete('deleteme');
      expect(deleted).toBe(true);
      expect(subdomainService.get('deleteme')).toBeUndefined();
    });
  });
});