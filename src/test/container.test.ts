import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServices } from '../services/container.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { rmSync } from 'fs';
import type { Services } from '../services/container.js';

const TEST_DB_PATH = './data/test-container.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index'];

let services: Services;

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  services = createServices();
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
});

describe('Service Container', () => {
  it('should create all services', () => {
    expect(services.pages).toBeDefined();
    expect(services.subdomains).toBeDefined();
    expect(services.keys).toBeDefined();
    expect(services.nonces).toBeDefined();
    expect(services.audit).toBeDefined();
    expect(services.videos).toBeDefined();
    expect(services.billing).toBeDefined();
  });

  it('should have pages service with expected methods', () => {
    expect(typeof services.pages.save).toBe('function');
    expect(typeof services.pages.get).toBe('function');
    expect(typeof services.pages.delete).toBe('function');
    expect(typeof services.pages.count).toBe('function');
    expect(typeof services.pages.listBySubdomain).toBe('function');
    expect(typeof services.pages.checkPublishLimit).toBe('function');
    expect(typeof services.pages.trackPageCreation).toBe('function');
  });

  it('should have subdomains service with expected methods', () => {
    expect(typeof services.subdomains.save).toBe('function');
    expect(typeof services.subdomains.get).toBe('function');
    expect(typeof services.subdomains.delete).toBe('function');
    expect(typeof services.subdomains.count).toBe('function');
    expect(typeof services.subdomains.checkClaimLimit).toBe('function');
    expect(typeof services.subdomains.trackSubdomainClaim).toBe('function');
  });

  it('should have keys service with expected methods', () => {
    expect(typeof services.keys.save).toBe('function');
    expect(typeof services.keys.get).toBe('function');
    expect(typeof services.keys.list).toBe('function');
    expect(typeof services.keys.count).toBe('function');
    expect(typeof services.keys.updatePlan).toBe('function');
    expect(typeof services.keys.incrementUsage).toBe('function');
    expect(typeof services.keys.resetUsage).toBe('function');
  });

  it('should have nonces service with expected methods', () => {
    expect(typeof services.nonces.register).toBe('function');
  });

  it('should have audit service with expected methods', () => {
    expect(typeof services.audit.save).toBe('function');
    expect(typeof services.audit.listForKey).toBe('function');
  });

  it('should have videos service with expected methods', () => {
    expect(typeof services.videos.save).toBe('function');
    expect(typeof services.videos.delete).toBe('function');
    expect(typeof services.videos.exists).toBe('function');
    expect(typeof services.videos.getPath).toBe('function');
    expect(typeof services.videos.getMimeType).toBe('function');
  });

  it('should have billing service with expected methods', () => {
    expect(typeof services.billing.createCheckoutSession).toBe('function');
    expect(typeof services.billing.createPortalSession).toBe('function');
    expect(typeof services.billing.getUsage).toBe('function');
    expect(typeof services.billing.handleWebhook).toBe('function');
    expect(typeof services.billing.recordMeterEvent).toBe('function');
  });

  it('should allow pages service to save and get', async () => {
    const { page, created } = await services.pages.save('container-test-page', {
      html: '<p>container test</p>',
      ownerKeyId: 'test-key',
      status: 'active',
    }, 'etag-container');

    expect(created).toBe(true);
    expect(page.id).toBe('container-test-page');

    const retrieved = services.pages.get('container-test-page');
    expect(retrieved).toBeDefined();
    expect(retrieved!.html).toBe('<p>container test</p>');
  });

  it('should allow subdomains service to save and get', async () => {
    const result = await services.subdomains.save('container-test-sub');
    expect(result.created).toBe(true);
    expect(result.subdomain.name).toBe('container-test-sub');

    const retrieved = services.subdomains.get('container-test-sub');
    expect(retrieved).toBeDefined();
  });
});