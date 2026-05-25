import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PageService } from '../services/pageService.js';
import { KeyService } from '../services/keyService.js';
import { initDatabase, closeDatabase, saveAgentKey, getAgentKey } from '../storage/db.js';
import { rmSync } from 'fs';
import { createTestSigner, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-page-service.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

let freeSigner: TestSigner;
let proSigner: TestSigner;

const pageService = new PageService();
const keyService = new KeyService();

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();

  freeSigner = await createTestSigner(`page-svc-free-${Date.now()}`);
  proSigner = await createTestSigner(`page-svc-pro-${Date.now()}`, 'pro');
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
});

describe('PageService', () => {
  describe('save and get', () => {
    it('should save a new page and return created=true', async () => {
      const { page, created } = await pageService.save('test-page-1', {
        html: '<h1>Hello</h1>',
        ownerKeyId: freeSigner.keyId,
        status: 'active',
      }, 'etag-1');

      expect(created).toBe(true);
      expect(page.id).toBe('test-page-1');
      expect(page.html).toBe('<h1>Hello</h1>');
    });

    it('should update an existing page and return created=false', async () => {
      const { page, created } = await pageService.save('test-page-1', {
        html: '<h1>Updated</h1>',
        ownerKeyId: freeSigner.keyId,
        status: 'active',
      }, 'etag-2');

      expect(created).toBe(false);
      expect(page.html).toBe('<h1>Updated</h1>');
    });

    it('should get a page by id', async () => {
      const page = pageService.get('test-page-1');
      expect(page).toBeDefined();
      expect(page!.id).toBe('test-page-1');
    });

    it('should return undefined for non-existent page', () => {
      const page = pageService.get('nonexistent');
      expect(page).toBeUndefined();
    });
  });

  describe('count', () => {
    it('should return the total page count', () => {
      const count = pageService.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('checkPublishLimit', () => {
    it('should allow updates to existing pages regardless of plan', () => {
      const result = pageService.checkPublishLimit(freeSigner.keyId, 'test-page-1');
      expect(result.allowed).toBe(true);
    });

    it('should allow new pages for free plan under limit', () => {
      const result = pageService.checkPublishLimit(freeSigner.keyId, 'brand-new-page-under-limit');
      expect(result.allowed).toBe(true);
    });

    it('should block new pages for free plan over limit', async () => {
      // Increment usage to reach the free limit of 100
      for (let i = 0; i < 100; i++) {
        await keyService.incrementUsage(freeSigner.keyId, 'monthlyPageCount');
      }
      const result = pageService.checkPublishLimit(freeSigner.keyId, 'brand-new-page-over-limit');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Free tier');
      // Reset
      await keyService.resetUsage(freeSigner.keyId);
    });

    it('should always allow pro plan', () => {
      const result = pageService.checkPublishLimit(proSigner.keyId, 'pro-new-page');
      expect(result.allowed).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a page and return true', async () => {
      await pageService.save('delete-me', {
        html: '<p>bye</p>',
        ownerKeyId: freeSigner.keyId,
        status: 'active',
      }, 'etag-del');

      const deleted = await pageService.delete('delete-me');
      expect(deleted).toBe(true);

      const page = pageService.get('delete-me');
      expect(page).toBeUndefined();
    });

    it('should return false for non-existent page', async () => {
      const deleted = await pageService.delete('nonexistent-page');
      expect(deleted).toBe(false);
    });
  });
});