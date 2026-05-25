import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { render } from '../routes/render.js';
import { subdomains } from '../routes/subdomains.js';
import { keys } from '../routes/keys.js';
import { verify } from '../routes/verify.js';
import { initDatabase, closeDatabase } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import { rmSync } from 'fs';
import { createTestSigner, jsonSignedRequest, createSignedHeaders, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-cap-recipient.lmdb';
const TEST_DB_SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index'];

const services = createServices();
const app = new Hono<{ Variables: { subdomain: string; services: Services } }>();
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);
app.route('/p', render);
app.route('/v1/keys', keys);
app.route('/v1/verify', verify);

let testId: number;
const uniqueId = (base: string) => `${base}-${testId++}`;
let alice: TestSigner;
let bob: TestSigner;
let carol: TestSigner;

function signedGet(signer: TestSigner, path: string): Request {
  const timestamp = new Date().toISOString();
  const nonce = `nonce-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  alice = await createTestSigner(`cap-recipient-alice-${Date.now()}`);
  bob = await createTestSigner(`cap-recipient-bob-${Date.now()}`);
  carol = await createTestSigner(`cap-recipient-carol-${Date.now()}`);

  // Upgrade to enterprise to avoid billing limits
  const { updateAgentKeyPlan } = await import('../storage/db.js');
  await updateAgentKeyPlan(alice.keyId, 'enterprise');
  await updateAgentKeyPlan(bob.keyId, 'enterprise');
  await updateAgentKeyPlan(carol.keyId, 'enterprise');
});

beforeEach(() => {
  testId = Date.now();
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
});

// ─── Phase 1: Data Model + Storage ──────────────────────

describe('Phase 1: Data Model + Storage', () => {
  it('should accept optional recipientKeyId on Page type', () => {
    const page = { id: 'test', recipientKeyId: 'agent-bob-456' } as any;
    expect(page.recipientKeyId).toBe('agent-bob-456');
  });

  it('should work without recipientKeyId on Page type', () => {
    const page = { id: 'test' } as any;
    expect(page.recipientKeyId).toBeUndefined();
  });

  it('should create and query recipient index entries', async () => {
    const id = uniqueId('recipient-idx');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Recipient Index Test</h1>', recipientKeyId: bob.keyId },
    }));
    expect(res.status).toBe(201);

    // Bob should see it in recipient=me query
    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should remove recipient index entry on delete', async () => {
    const id = uniqueId('recipient-del');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>To Delete</h1>', recipientKeyId: bob.keyId },
    }));

    // Verify Bob can see it
    let listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    let data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);

    // Delete the page
    await app.request(`/v1/pages/${id}`, {
      method: 'DELETE',
      headers: {
        ...createSignedHeaders({
          signer: alice,
          method: 'DELETE',
          path: `/v1/pages/${id}`,
          body: '',
        }),
      },
    });

    // Bob should no longer see it
    listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(false);
  });

  it('should list recipient pages newest first', async () => {
    const ids = [uniqueId('r-newest-1'), uniqueId('r-newest-2'), uniqueId('r-newest-3')];
    for (const id of ids) {
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer: alice,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: { html: `<h1>${id}</h1>`, recipientKeyId: bob.keyId },
      }));
      // Small delay to ensure different timestamps
      await new Promise(r => setTimeout(r, 10));
    }

    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    const foundIds = data.pages.filter((p: any) => ids.includes(p.id)).map((p: any) => p.id);
    // Should be newest first (reverse insertion order since IDs are timestamp-based)
    expect(foundIds.length).toBe(3);
  });

  it('should handle recipient index no-op when page has no recipient', async () => {
    const id = uniqueId('no-recipient');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>No Recipient</h1>' },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBeUndefined();
  });

  it('should filter recipient results with since parameter', async () => {
    const since = new Date(Date.now() - 1000).toISOString();
    const id = uniqueId('since-filter');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Since Filter</h1>', recipientKeyId: bob.keyId },
    }));

    const listRes = await app.request(signedGet(bob, `/v1/pages?recipient=me&since=${encodeURIComponent(since)}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should filter owner results with since parameter', async () => {
    const since = new Date(Date.now() - 1000).toISOString();
    const id = uniqueId('owner-since');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Owner Since</h1>' },
    }));

    const listRes = await app.request(signedGet(alice, `/v1/pages?since=${encodeURIComponent(since)}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });
});

// ─── Phase 2: Publish + Query ────────────────────────────

describe('Phase 2: Publish + Query', () => {
  it('should store recipient from body field', async () => {
    const id = uniqueId('pub-body');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Body Recipient</h1>', recipientKeyId: bob.keyId },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe(bob.keyId);
  });

  it('should store recipient from CAP-Recipient-Key-Id header', async () => {
    const id = uniqueId('pub-cap-header');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>CAP Header</h1>' },
      headers: { 'CAP-Recipient-Key-Id': bob.keyId },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe(bob.keyId);
  });

  it('should store recipient from X-Zenbin-Recipient-Key-Id header (legacy)', async () => {
    const id = uniqueId('pub-zenbin-header');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>ZenBin Header</h1>' },
      headers: { 'X-Zenbin-Recipient-Key-Id': bob.keyId },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe(bob.keyId);
  });

  it('should give CAP header priority over body field', async () => {
    const id = uniqueId('pub-priority');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Priority</h1>', recipientKeyId: 'body-value' },
      headers: { 'CAP-Recipient-Key-Id': 'header-value' },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe('header-value');
  });

  it('should create undirected page without recipientKeyId', async () => {
    const id = uniqueId('pub-no-recipient');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>No Recipient</h1>' },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBeUndefined();
  });

  it('should add recipient on update', async () => {
    const id = uniqueId('pub-add-recipient');
    // Publish without recipient
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Add Recipient</h1>' },
    }));

    // Update with recipient
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Add Recipient Updated</h1>', recipientKeyId: bob.keyId },
    }));
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe(bob.keyId);

    // Verify Bob can see it
    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    const listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should update recipient index when recipient changes', async () => {
    const id = uniqueId('pub-change-recipient');
    // Publish directed to Bob
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Change Recipient</h1>', recipientKeyId: bob.keyId },
    }));

    // Change recipient to Carol
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Changed to Carol</h1>', recipientKeyId: carol.keyId },
    }));

    // Bob should no longer see it
    let listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    let listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);

    // Carol should see it
    listRes = await app.request(signedGet(carol, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should remove recipient from page', async () => {
    const id = uniqueId('pub-remove-recipient');
    // Publish with recipient
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Remove Recipient</h1>', recipientKeyId: bob.keyId },
    }));

    // Remove recipient (set to empty string → treated as undefined)
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>No Recipient Now</h1>', recipientKeyId: '' },
    }));

    // Bob should no longer see it in recipient query
    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    const listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);
  });

  it('should return only pages directed at auth key with ?recipient=me', async () => {
    const id1 = uniqueId('pub-rec-only-1');
    const id2 = uniqueId('pub-rec-only-2');
    const id3 = uniqueId('pub-rec-only-3');

    // 2 pages to Bob, 1 to Carol
    await app.request(`/v1/pages/${id1}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id1}`,
      body: { html: '<h1>To Bob 1</h1>', recipientKeyId: bob.keyId },
    }));
    await app.request(`/v1/pages/${id2}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id2}`,
      body: { html: '<h1>To Bob 2</h1>', recipientKeyId: bob.keyId },
    }));
    await app.request(`/v1/pages/${id3}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id3}`,
      body: { html: '<h1>To Carol</h1>', recipientKeyId: carol.keyId },
    }));

    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    const data = await listRes.json() as any;
    expect(data.pages.every((p: any) => p.recipientKeyId === bob.keyId)).toBe(true);
    expect(data.pages.some((p: any) => p.id === id3)).toBe(false);
  });

  it('should return recipient pages across subdomains', async () => {
    // Claim subdomain
    const subdomain = `recsub${Date.now()}`;
    await app.request(`/v1/subdomains/${subdomain}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/subdomains/${subdomain}`,
      body: {},
    }));

    const id = uniqueId('rec-cross-sub');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Cross Subdomain</h1>', recipientKeyId: bob.keyId },
      headers: { 'X-Subdomain': subdomain },
    }));

    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    const data = await listRes.json() as any;
    const found = data.pages.find((p: any) => p.id === id);
    expect(found).toBeDefined();
    expect(found.subdomain).toBe(subdomain);
  });

  it('should not mix recipient and owner queries', async () => {
    // Alice owns pages, some directed to Bob
    const id1 = uniqueId('mixed-1');
    const id2 = uniqueId('mixed-2');

    await app.request(`/v1/pages/${id1}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id1}`,
      body: { html: '<h1>Alice Owns</h1>' },
    }));
    await app.request(`/v1/pages/${id2}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id2}`,
      body: { html: '<h1>Alice to Bob</h1>', recipientKeyId: bob.keyId },
    }));

    // Owner query should return both
    const ownerRes = await app.request(signedGet(alice, '/v1/pages'));
    const ownerData = await ownerRes.json() as any;
    expect(ownerData.pages.some((p: any) => p.id === id1)).toBe(true);
    expect(ownerData.pages.some((p: any) => p.id === id2)).toBe(true);

    // Recipient query should only return the directed one
    const recRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    const recData = await recRes.json() as any;
    expect(recData.pages.some((p: any) => p.id === id2)).toBe(true);
    expect(recData.pages.some((p: any) => p.id === id1)).toBe(false);
  });

  it('should treat empty string recipientKeyId as no recipient', async () => {
    const id = uniqueId('empty-recipient');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Empty Recipient</h1>', recipientKeyId: '' },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    // Empty string should be treated as undefined
    expect(data.recipientKeyId).toBeUndefined();
  });

  it('should accept non-existent keyId as recipient', async () => {
    const id = uniqueId('nonexistent-recipient');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Nonexistent Recipient</h1>', recipientKeyId: 'agent-nonexistent-456' },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe('agent-nonexistent-456');
  });

  it('should clean up recipient index on page delete', async () => {
    const id = uniqueId('delete-recipient');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Delete Me</h1>', recipientKeyId: bob.keyId },
    }));

    // Bob sees it
    let listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    let listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);

    // Delete
    await app.request(`/v1/pages/${id}`, {
      method: 'DELETE',
      headers: createSignedHeaders({ signer: alice, method: 'DELETE', path: `/v1/pages/${id}`, body: '' }),
    });

    // Bob no longer sees it
    listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);
  });
});

// ─── Phase 3: Provenance ──────────────────────────────────

describe('Phase 3: Provenance', () => {
  it('should include CAP-Recipient-Key-Id response header on page with recipient', async () => {
    const id = uniqueId('prov-cap-header');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Provenance CAP</h1>', recipientKeyId: bob.keyId },
    }));

    const res = await app.request(`/p/${id}`);
    expect(res.headers.get('CAP-Recipient-Key-Id')).toBe(bob.keyId);
  });

  it('should include X-Zenbin-Recipient-Key-Id response header', async () => {
    const id = uniqueId('prov-zenbin-header');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Provenance ZenBin</h1>', recipientKeyId: bob.keyId },
    }));

    const res = await app.request(`/p/${id}`);
    expect(res.headers.get('X-Zenbin-Recipient-Key-Id')).toBe(bob.keyId);
  });

  it('should omit recipient headers when page has no recipient', async () => {
    const id = uniqueId('prov-no-recipient');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>No Provenance Recipient</h1>' },
    }));

    const res = await app.request(`/p/${id}`);
    expect(res.headers.get('CAP-Recipient-Key-Id')).toBeNull();
    expect(res.headers.get('X-Zenbin-Recipient-Key-Id')).toBeNull();
  });

  it('should include cap:recipient-key-id meta tag in HTML', async () => {
    const id = uniqueId('prov-meta');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<html><head></head><body><h1>Meta Tag Test</h1></body></html>', recipientKeyId: bob.keyId },
    }));

    const res = await app.request(`/p/${id}`);
    const html = await res.text();
    expect(html).toContain(`name="cap:recipient-key-id" content="${bob.keyId}"`);
  });

  it('should include recipientKeyId in JSON metadata', async () => {
    const id = uniqueId('prov-json');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>JSON Meta</h1>', recipientKeyId: bob.keyId },
    }));

    const res = await app.request(`/p/${id}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe(bob.keyId);
  });

  it('should include recipientKeyId in page list summary', async () => {
    const id = uniqueId('prov-list');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>List Summary</h1>', recipientKeyId: bob.keyId },
    }));

    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    const data = await listRes.json() as any;
    const found = data.pages.find((p: any) => p.id === id);
    expect(found).toBeDefined();
    expect(found.recipientKeyId).toBe(bob.keyId);
  });

  it('should include recipientKeyId in owner page list', async () => {
    const id = uniqueId('prov-owner-list');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Owner List</h1>', recipientKeyId: bob.keyId },
    }));

    const listRes = await app.request(signedGet(alice, '/v1/pages'));
    const data = await listRes.json() as any;
    const found = data.pages.find((p: any) => p.id === id);
    expect(found).toBeDefined();
    expect(found.recipientKeyId).toBe(bob.keyId);
  });

  it('should include recipientKeyId in publish response', async () => {
    const id = uniqueId('prov-pub-res');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Publish Response</h1>', recipientKeyId: bob.keyId },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.recipientKeyId).toBe(bob.keyId);
  });

  it('should include both CAP and X-Zenbin headers consistently', async () => {
    const id = uniqueId('prov-dual');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Dual Headers</h1>', recipientKeyId: bob.keyId },
    }));

    const res = await app.request(`/p/${id}`);
    expect(res.headers.get('CAP-Recipient-Key-Id')).toBe(bob.keyId);
    expect(res.headers.get('X-Zenbin-Recipient-Key-Id')).toBe(bob.keyId);
  });
});

// ─── Phase 5: Integration ──────────────────────────────────

describe('Phase 5: Integration Tests', () => {
  it('full directed content flow: publish → query → read', async () => {
    // Alice publishes a page directed to Bob
    const id = uniqueId('int-flow');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Task Results</h1>', recipientKeyId: bob.keyId },
    }));

    // Bob queries ?recipient=me — sees the page
    let listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    let listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);

    // Bob reads the page — sees recipientKeyId in headers and metadata
    const pageRes = await app.request(`/p/${id}`, { headers: { Accept: 'application/json' } });
    const pageData = await pageRes.json() as any;
    expect(pageData.recipientKeyId).toBe(bob.keyId);

    // Alice queries ?recipient=me — does NOT see the page (she owns it)
    listRes = await app.request(signedGet(alice, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);

    // Carol queries ?recipient=me — does NOT see the page
    listRes = await app.request(signedGet(carol, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);
  });

  it('directed content with since filter for incremental sync', async () => {
    const t1 = new Date(Date.now() - 2000).toISOString();
    await new Promise(r => setTimeout(r, 50));

    const id1 = uniqueId('int-since-1');
    await app.request(`/v1/pages/${id1}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id1}`,
      body: { html: '<h1>First</h1>', recipientKeyId: bob.keyId },
    }));

    await new Promise(r => setTimeout(r, 50));
    const t2 = new Date().toISOString();
    await new Promise(r => setTimeout(r, 50));

    const id2 = uniqueId('int-since-2');
    await app.request(`/v1/pages/${id2}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id2}`,
      body: { html: '<h1>Second</h1>', recipientKeyId: bob.keyId },
    }));

    // since=T1 → both pages
    let listRes = await app.request(signedGet(bob, `/v1/pages?recipient=me&since=${encodeURIComponent(t1)}`));
    let listData = await listRes.json() as any;
    expect(listData.pages.length).toBeGreaterThanOrEqual(2);

    // since=T2 → only second page
    listRes = await app.request(signedGet(bob, `/v1/pages?recipient=me&since=${encodeURIComponent(t2)}`));
    listData = await listRes.json() as any;
    const foundIds = listData.pages.map((p: any) => p.id);
    expect(foundIds).toContain(id2);
  });

  it('undirected pages are invisible to recipient queries', async () => {
    const id = uniqueId('int-undirected');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Undirected</h1>' },
    }));

    const listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    const listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);

    // Alice still sees it as owner
    const ownerRes = await app.request(signedGet(alice, '/v1/pages'));
    const ownerData = await ownerRes.json() as any;
    expect(ownerData.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('changing recipient reassigns page between feeds', async () => {
    const id = uniqueId('int-reassign');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Reassign</h1>', recipientKeyId: bob.keyId },
    }));

    // Bob sees it
    let listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    let listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);

    // Change to Carol
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Reassigned to Carol</h1>', recipientKeyId: carol.keyId },
    }));

    // Bob no longer sees it
    listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);

    // Carol sees it
    listRes = await app.request(signedGet(carol, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('removing recipient makes page invisible in recipient feeds', async () => {
    const id = uniqueId('int-remove-rec');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Will Lose Recipient</h1>', recipientKeyId: bob.keyId },
    }));

    // Bob sees it
    let listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    let listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);

    // Remove recipient
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>No More Recipient</h1>', recipientKeyId: '' },
    }));

    // Bob no longer sees it in recipient feed
    listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);

    // Page URL still works
    const pageRes = await app.request(`/p/${id}`);
    expect(pageRes.status).toBe(200);
  });

  it('verification works for directed pages', async () => {
    const id = uniqueId('int-verify');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Verify Me</h1>', recipientKeyId: bob.keyId },
    }));

    // Verify recipientKeyId is in the JSON metadata (recipientKeyId is NOT part of signature verification)
    const pageRes = await app.request(`/p/${id}`, {
      headers: { Accept: 'application/json' },
    });
    const pageData = await pageRes.json() as any;
    expect(pageData.recipientKeyId).toBe(bob.keyId);
    expect(pageData.capVersion).toBe('0.1');
  });

  it('backward compatibility: pages without recipient still work', async () => {
    const id = uniqueId('int-backward');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Old Style</h1>' },
    }));

    // GET /v1/pages still lists owned pages
    const listRes = await app.request(signedGet(alice, '/v1/pages'));
    const listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);

    // GET /p/:id still renders
    const pageRes = await app.request(`/p/${id}`);
    expect(pageRes.status).toBe(200);

    // No recipient headers
    expect(pageRes.headers.get('CAP-Recipient-Key-Id')).toBeNull();

    // ?recipient=me does not return this page
    const recRes = await app.request(signedGet(alice, '/v1/pages?recipient=me'));
    const recData = await recRes.json() as any;
    expect(recData.pages.some((p: any) => p.id === id)).toBe(false);
  });

  it('delete page cleans up recipient index', async () => {
    const id = uniqueId('int-delete');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Delete Me</h1>', recipientKeyId: bob.keyId },
    }));

    // Bob sees it
    let listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    let listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(true);

    // Delete
    await app.request(`/v1/pages/${id}`, {
      method: 'DELETE',
      headers: createSignedHeaders({ signer: alice, method: 'DELETE', path: `/v1/pages/${id}`, body: '' }),
    });

    // Bob no longer sees it
    listRes = await app.request(signedGet(bob, '/v1/pages?recipient=me'));
    listData = await listRes.json() as any;
    expect(listData.pages.some((p: any) => p.id === id)).toBe(false);
  });
});