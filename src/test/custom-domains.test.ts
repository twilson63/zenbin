import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { rmSync } from 'fs';
import { pages } from '../routes/pages.js';
import { subdomains } from '../routes/subdomains.js';
import { serveSubdomainPage } from '../routes/subdomainRender.js';
import { closeDatabase, initDatabase } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import { CustomDomainService, type CustomHostnameProvider, type DnsResolver } from '../services/customDomainService.js';
import { createTestSigner, jsonSignedRequest, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-custom-domains.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-custom-domains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

type Variables = { services: Services; subdomain: string };

class TestDns implements DnsResolver {
  records = new Map<string, string[]>();
  async lookupTxt(name: string): Promise<string[]> { return this.records.get(name) ?? []; }
}

class TestProvider implements CustomHostnameProvider {
  createCalls = 0;
  deleteCalls = 0;
  async create(hostname: string) {
    this.createCalls += 1;
    return { id: `provider:${hostname}`, certificateStatus: 'active' as const };
  }
  async status() { return { certificateStatus: 'active' as const }; }
  async delete() { this.deleteCalls += 1; }
}

let signer: TestSigner;
let otherSigner: TestSigner;
let dns: TestDns;
let provider: TestProvider;
let services: Services;
let app: Hono<{ Variables: Variables }>;
let sequence = 0;
const unique = (prefix: string) => `${prefix}-${Date.now()}-${sequence++}`;

function attachDomain(subdomain: string, hostname: string) {
  return app.request(`/v1/subdomains/${subdomain}/domains`, jsonSignedRequest({
    signer, method: 'POST', path: `/v1/subdomains/${subdomain}/domains`, body: { hostname },
  }));
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.LMDB_PATH = TEST_DB_PATH;
  for (const suffix of TEST_DB_SUFFIXES) rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
  initDatabase();
  signer = await createTestSigner(`custom-domain-owner-${Date.now()}`);
  otherSigner = await createTestSigner(`custom-domain-other-${Date.now()}`);
  const { updateAgentKeyPlan } = await import('../storage/db.js');
  await updateAgentKeyPlan(signer.keyId, 'enterprise');
  await updateAgentKeyPlan(otherSigner.keyId, 'enterprise');
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true });
});

beforeEach(() => {
  dns = new TestDns();
  provider = new TestProvider();
  services = createServices();
  services.domains = new CustomDomainService({ dns, provider });
  app = new Hono<{ Variables: Variables }>();
  app.use('*', async (c, next) => { c.set('services', services); await next(); });
  app.route('/v1/pages', pages);
  app.route('/v1/subdomains', subdomains);
  app.get('/*', async (c) => {
    const host = (c.req.header('host') || '').split(':')[0];
    const domain = services.domains.getActiveForHost(host);
    if (!domain) return c.json({ error: 'Not found' }, 404);
    return serveSubdomainPage(c, domain.subdomain, c.req.path);
  });
});

describe('custom domains', () => {
  it('normalizes, protects ownership, and rejects globally duplicate hostnames', async () => {
    const subdomain = unique('custom-owner');
    await app.request(`/v1/subdomains/${subdomain}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${subdomain}` }));

    const created = await attachDomain(subdomain, 'MiXeD.Example.com.');
    expect(created.status).toBe(201);
    const body = await created.json() as { hostname: string; dns: { ownership: { value: string } } };
    expect(body.hostname).toBe('mixed.example.com');
    expect(body.dns.ownership.value).toMatch(/^zenbin-verification=/);

    const wrongOwner = await app.request(`/v1/subdomains/${subdomain}/domains`, jsonSignedRequest({
      signer: otherSigner, method: 'POST', path: `/v1/subdomains/${subdomain}/domains`, body: { hostname: 'other.example.com' },
    }));
    expect(wrongOwner.status).toBe(403);

    const duplicate = await attachDomain(subdomain, 'mixed.example.com');
    expect(duplicate.status).toBe(409);
    const invalid = await attachDomain(subdomain, 'localhost');
    expect(invalid.status).toBe(400);
  });

  it('requires the exact TXT record before provisioning and activates idempotently', async () => {
    const subdomain = unique('dns-owner');
    await app.request(`/v1/subdomains/${subdomain}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${subdomain}` }));
    const created = await attachDomain(subdomain, 'verify.example.com');
    expect(created.status).toBe(201);
    const body = await created.json() as { dns: { ownership: { name: string; value: string } } };

    const path = `/v1/subdomains/${subdomain}/domains/verify.example.com/verify`;
    const mismatch = await app.request(path, jsonSignedRequest({ signer, method: 'POST', path }));
    expect(mismatch.status).toBe(409);
    expect(provider.createCalls).toBe(0);

    dns.records.set(body.dns.ownership.name, [body.dns.ownership.value]);
    const verified = await app.request(path, jsonSignedRequest({ signer, method: 'POST', path }));
    expect(verified.status).toBe(200);
    expect((await verified.json() as { status: string }).status).toBe('active');
    expect(provider.createCalls).toBe(1);

    const retry = await app.request(path, jsonSignedRequest({ signer, method: 'POST', path }));
    expect(retry.status).toBe(200);
    expect(provider.createCalls).toBe(1);
  });

  it('serves active custom hosts through the existing renderer and deactivates before deletion', async () => {
    const subdomain = unique('route-owner');
    await app.request(`/v1/subdomains/${subdomain}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${subdomain}` }));
    const published = await app.request('/v1/pages/about', jsonSignedRequest({
      signer, method: 'POST', path: '/v1/pages/about', headers: { 'X-Subdomain': subdomain }, body: { html: '<h1>Custom route</h1>' },
    }));
    expect(published.status).toBe(201);

    const created = await attachDomain(subdomain, 'route.example.com');
    const body = await created.json() as { dns: { ownership: { name: string; value: string } } };
    dns.records.set(body.dns.ownership.name, [body.dns.ownership.value]);
    const verifyPath = `/v1/subdomains/${subdomain}/domains/route.example.com/verify`;
    await app.request(verifyPath, jsonSignedRequest({ signer, method: 'POST', path: verifyPath }));

    const routed = await app.request('/about', { headers: { host: 'route.example.com' } });
    expect(routed.status).toBe(200);
    expect(await routed.text()).toContain('Custom route');

    const deletePath = `/v1/subdomains/${subdomain}/domains/route.example.com`;
    const deleted = await app.request(deletePath, jsonSignedRequest({ signer, method: 'DELETE', path: deletePath }));
    expect(deleted.status).toBe(200);
    expect(provider.deleteCalls).toBe(1);
    expect((await app.request('/about', { headers: { host: 'route.example.com' } })).status).toBe(404);
  });

  it('cleans up an attached domain before deleting its subdomain', async () => {
    const subdomain = unique('cleanup-owner');
    await app.request(`/v1/subdomains/${subdomain}`, jsonSignedRequest({ signer, method: 'POST', path: `/v1/subdomains/${subdomain}` }));
    const created = await attachDomain(subdomain, 'cleanup.example.com');
    const body = await created.json() as { dns: { ownership: { name: string; value: string } } };
    dns.records.set(body.dns.ownership.name, [body.dns.ownership.value]);
    const verifyPath = `/v1/subdomains/${subdomain}/domains/cleanup.example.com/verify`;
    await app.request(verifyPath, jsonSignedRequest({ signer, method: 'POST', path: verifyPath }));

    const deletePath = `/v1/subdomains/${subdomain}`;
    const deleted = await app.request(deletePath, jsonSignedRequest({ signer, method: 'DELETE', path: deletePath }));
    expect(deleted.status).toBe(200);
    expect(provider.deleteCalls).toBe(1);
    expect(services.domains.get('cleanup.example.com')).toBeUndefined();
  });
});
