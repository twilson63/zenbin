import { describe, it, expect } from 'vitest';
import type {
  IPageService,
  ISubdomainService,
  IKeyService,
  INonceService,
  IAuditService,
  IVideoService,
  IBillingService,
} from '../services/interfaces.js';

describe('Service interfaces', () => {
  it('should define IPageService shape', () => {
    const mock: IPageService = {
      save: async () => ({ page: {} as any, created: true }),
      get: () => undefined,
      delete: async () => true,
      count: () => 0,
      listBySubdomain: () => [],
    };
    expect(typeof mock.save).toBe('function');
    expect(typeof mock.get).toBe('function');
    expect(typeof mock.delete).toBe('function');
    expect(typeof mock.count).toBe('function');
    expect(typeof mock.listBySubdomain).toBe('function');
  });

  it('should define ISubdomainService shape', () => {
    const mock: ISubdomainService = {
      save: async () => ({ subdomain: {} as any, created: true }),
      get: () => undefined,
      delete: async () => true,
      count: () => 0,
      incrementPageCount: () => {},
      decrementPageCount: () => {},
    };
    expect(typeof mock.save).toBe('function');
    expect(typeof mock.incrementPageCount).toBe('function');
  });

  it('should define IKeyService shape with billing methods', () => {
    const mock: IKeyService = {
      save: async () => ({} as any),
      get: () => undefined,
      list: () => [],
      count: () => 0,
      updateStatus: async () => undefined,
      touch: async () => {},
      updatePlan: async () => undefined,
      incrementUsage: async () => {},
      resetUsage: async () => {},
    };
    expect(typeof mock.updatePlan).toBe('function');
    expect(typeof mock.incrementUsage).toBe('function');
    expect(typeof mock.resetUsage).toBe('function');
  });

  it('should define INonceService shape', () => {
    const mock: INonceService = {
      register: async () => true,
    };
    expect(typeof mock.register).toBe('function');
  });

  it('should define IAuditService shape', () => {
    const mock: IAuditService = {
      save: async () => ({} as any),
      listForKey: () => [],
    };
    expect(typeof mock.save).toBe('function');
    expect(typeof mock.listForKey).toBe('function');
  });

  it('should define IVideoService shape', () => {
    const mock: IVideoService = {
      save: async () => '/path/to/video',
      delete: async () => {},
      exists: () => false,
      getPath: () => '/path',
      getMimeType: () => undefined,
    };
    expect(typeof mock.save).toBe('function');
    expect(typeof mock.delete).toBe('function');
  });

  it('should define IBillingService shape', () => {
    const mock: IBillingService = {
      createCheckoutSession: async () => ({ url: 'https://checkout.stripe.com', sessionId: 'cs_123' }),
      createPortalSession: async () => ({ url: 'https://billing.stripe.com' }),
      getUsage: async () => ({
        plan: 'free',
        pagesUsed: 0,
        subdomainsUsed: 0,
        limits: { pagesPerMonth: 100, subdomains: 1 },
      }),
      handleWebhook: async () => {},
      recordMeterEvent: async () => {},
    };
    expect(typeof mock.createCheckoutSession).toBe('function');
    expect(typeof mock.createPortalSession).toBe('function');
    expect(typeof mock.getUsage).toBe('function');
    expect(typeof mock.handleWebhook).toBe('function');
    expect(typeof mock.recordMeterEvent).toBe('function');
  });
});