import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pages } from '../routes/pages.js';
import { render } from '../routes/render.js';
import { subdomains } from '../routes/subdomains.js';
import { keys } from '../routes/keys.js';
import { verify } from '../routes/verify.js';
import { initDatabase, closeDatabase, backfillAttestationIndexes } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import { rmSync } from 'fs';
import { validateAttestation, isValidSignedPageRef } from '../utils/validation.js';
import { createTestSigner, jsonSignedRequest, jsonCapSignedRequest, createSignedHeaders, type TestSigner } from './helpers/signing.js';

const TEST_DB_PATH = './data/test-cap-attestation.lmdb';
const TEST_DB_SUFFIXES = [
  '', '-subdomains', '-agent-keys', '-nonces', '-audit',
  '-owner-index', '-recipient-index',
  '-attestation-subject-index', '-attestation-type-subject-index',
];

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
  // Signature now covers the full request target (path + query string).
  const headers = createSignedHeaders({
    signer,
    method: 'GET',
    path,
    body: '',
    timestamp,
    nonce,
  });
  return new Request(`http://localhost${path}`, { method: 'GET', headers });
}

function toBase64Url(str: string): string {
  return Buffer.from(str).toString('base64url');
}

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) {
    try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {}
  }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  alice = await createTestSigner(`cap-att-alice-${Date.now()}`);
  bob = await createTestSigner(`cap-att-bob-${Date.now()}`);
  carol = await createTestSigner(`cap-att-carol-${Date.now()}`);

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

// ─── Group 1: Validation ──────────────────────────────────

describe('Validation', () => {
  it('should accept a valid attestation with agent subject', () => {
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent' as const, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
      context: 'Identity verified through domain control proof',
    };
    expect(validateAttestation(attestation)).toBeNull();
  });

  it('should accept a valid attestation with asset subject', () => {
    const attestation = {
      type: 'review',
      subject: { kind: 'asset' as const, id: 'agent-alice-123/my-analysis' },
    };
    expect(validateAttestation(attestation)).toBeNull();
  });

  it('should accept attestation with optional fields', () => {
    const attestation = {
      type: 'trust',
      subject: { kind: 'agent' as const, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
      context: 'Trusted for code review',
      metadata: { scope: 'code-review', level: 'full' },
      timestamp: '2026-06-05T09:00:00Z',
    };
    expect(validateAttestation(attestation)).toBeNull();
  });

  it('should reject attestation missing type', () => {
    const attestation = {
      subject: { kind: 'agent' as const, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
    };
    expect(validateAttestation(attestation)).not.toBeNull();
    expect(validateAttestation(attestation)!.field).toBe('attestation.type');
  });

  it('should reject attestation missing subject', () => {
    const attestation = { type: 'verify' };
    expect(validateAttestation(attestation)).not.toBeNull();
    expect(validateAttestation(attestation)!.field).toBe('attestation.subject');
  });

  it('should reject attestation with invalid subject kind', () => {
    const attestation = {
      type: 'verify',
      subject: { kind: 'organization' as any, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
    };
    expect(validateAttestation(attestation)).not.toBeNull();
    expect(validateAttestation(attestation)!.field).toBe('attestation.subject.kind');
  });

  it('should reject agent subject with bad fingerprint (not 43 chars)', () => {
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent' as const, id: 'short-id' },
    };
    expect(validateAttestation(attestation)).not.toBeNull();
    expect(validateAttestation(attestation)!.field).toBe('attestation.subject.id');
  });

  it('should reject asset subject with bad signed page ref (no slash)', () => {
    const attestation = {
      type: 'review',
      subject: { kind: 'asset' as const, id: 'noslash' },
    };
    expect(validateAttestation(attestation)).not.toBeNull();
  });

  it('should reject oversized context (>500 chars)', () => {
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent' as const, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
      context: 'x'.repeat(501),
    };
    expect(validateAttestation(attestation)).not.toBeNull();
    expect(validateAttestation(attestation)!.field).toBe('attestation.context');
  });

  it('should reject nested metadata values', () => {
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent' as const, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
      metadata: { nested: { deep: 'value' } },
    };
    expect(validateAttestation(attestation)).not.toBeNull();
    expect(validateAttestation(attestation)!.field).toBe('attestation.metadata');
  });

  it('should reject array metadata values', () => {
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent' as const, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
      metadata: { scope: ['read', 'write'] },
    };
    expect(validateAttestation(attestation)).not.toBeNull();
  });

  it('should reject invalid timestamp', () => {
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent' as const, id: 'HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0' },
      timestamp: 'not-a-date',
    };
    expect(validateAttestation(attestation)).not.toBeNull();
    expect(validateAttestation(attestation)!.field).toBe('attestation.timestamp');
  });
});

// ─── isValidSignedPageRef ─────────────────────────────────

describe('isValidSignedPageRef', () => {
  it('should accept valid signed page refs', () => {
    expect(isValidSignedPageRef('agent-alice-123/my-page')).toBe(true);
    expect(isValidSignedPageRef('key_456/analysis')).toBe(true);
    expect(isValidSignedPageRef('a/b')).toBe(true);
  });

  it('should reject refs without slash', () => {
    expect(isValidSignedPageRef('noslash')).toBe(false);
  });

  it('should reject refs with empty segments', () => {
    expect(isValidSignedPageRef('/page')).toBe(false);
    expect(isValidSignedPageRef('owner/')).toBe(false);
    expect(isValidSignedPageRef('/')).toBe(false);
  });

  it('should reject refs with multiple slashes', () => {
    expect(isValidSignedPageRef('owner/path/page')).toBe(false);
  });

  it('should reject refs with special chars', () => {
    expect(isValidSignedPageRef('own er/page')).toBe(false);
    expect(isValidSignedPageRef('owner/pa ge')).toBe(false);
  });
});

// ─── Group 2: Publish with attestation (body) ──────────────

describe('Publish with attestation (body)', () => {
  it('should publish a page with attestation in body', async () => {
    const id = uniqueId('att-body');
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent', id: bob.publicKeyFingerprint },
      context: 'Identity verified',
    };
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Verified</h1>', attestation },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.attestation).toBeDefined();
    expect(data.attestation.type).toBe('verify');
    expect(data.attestation.subject.kind).toBe('agent');
    expect(data.attestation.subject.id).toBe(bob.publicKeyFingerprint);
    expect(data.attestation.context).toBe('Identity verified');
  });

  it('should return attestation in GET response', async () => {
    const id = uniqueId('att-get');
    const attestation = {
      type: 'trust',
      subject: { kind: 'agent', id: carol.publicKeyFingerprint },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Trusted</h1>', attestation },
    }));

    const listRes = await app.request(signedGet(alice, '/v1/pages'));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    const found = data.pages.find((p: any) => p.id === id);
    expect(found).toBeDefined();
    expect(found.attestation).toBeDefined();
    expect(found.attestation.type).toBe('trust');
  });
});

// ─── Group 3: Publish with attestation (header) ─────────────

describe('Publish with attestation (header)', () => {
  it('should publish with CAP-Attestation header (base64url)', async () => {
    const id = uniqueId('att-hdr');
    const attestation = {
      type: 'endorse',
      subject: { kind: 'asset', id: `${alice.keyId}/my-analysis` },
      context: 'Great analysis',
    };
    const headerValue = toBase64Url(JSON.stringify(attestation));
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Endorsed</h1>' },
      headers: { 'CAP-Attestation': headerValue },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.attestation).toBeDefined();
    expect(data.attestation.type).toBe('endorse');
    expect(data.attestation.subject.kind).toBe('asset');
  });

  it('should accept X-Zenbin-Attestation legacy header', async () => {
    const id = uniqueId('att-legacy-hdr');
    const attestation = {
      type: 'flag',
      subject: { kind: 'asset', id: `${bob.keyId}/suspicious-page` },
      context: 'Contains unverified claims',
    };
    const headerValue = toBase64Url(JSON.stringify(attestation));
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Flagged</h1>' },
      headers: { 'X-Zenbin-Attestation': headerValue },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.attestation).toBeDefined();
    expect(data.attestation.type).toBe('flag');
  });

  it('should prioritize CAP-Attestation header over body', async () => {
    const id = uniqueId('att-priority');
    const headerAttestation = {
      type: 'verify',
      subject: { kind: 'agent', id: bob.publicKeyFingerprint },
      context: 'From header',
    };
    const bodyAttestation = {
      type: 'trust',
      subject: { kind: 'agent', id: carol.publicKeyFingerprint },
      context: 'From body',
    };
    const headerValue = toBase64Url(JSON.stringify(headerAttestation));
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Priority</h1>', attestation: bodyAttestation },
      headers: { 'CAP-Attestation': headerValue },
    }));
    expect(res.status).toBe(201);
    const data = await res.json() as any;
    expect(data.attestation.type).toBe('verify');
    expect(data.attestation.context).toBe('From header');
  });

  it('should reject invalid base64url in CAP-Attestation header', async () => {
    const id = uniqueId('att-bad-hdr');
    const res = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Bad Header</h1>' },
      headers: { 'CAP-Attestation': 'not-valid-base64!!!' },
    }));
    expect(res.status).toBe(400);
  });
});

// ─── Group 4: Attestation indexing ──────────────────────────

describe('Attestation indexing', () => {
  it('should create attestation indexes on publish', async () => {
    const id = uniqueId('att-idx');
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent', id: bob.publicKeyFingerprint },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Indexed</h1>', attestation },
    }));

    // Query by subject should find it
    const listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${bob.publicKeyFingerprint}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should remove attestation indexes when attestation is set to null', async () => {
    const id = uniqueId('att-remove');
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent', id: carol.publicKeyFingerprint },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>To Remove</h1>', attestation },
    }));

    // Should appear in query
    let listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${carol.publicKeyFingerprint}`));
    let data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);

    // Remove attestation by setting to null
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>No Attestation</h1>', attestation: null },
    }));

    // Should no longer appear in attestation query
    listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${carol.publicKeyFingerprint}`));
    data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(false);
  });

  it('should update indexes when attestation changes', async () => {
    const id = uniqueId('att-update');
    const attestation1 = {
      type: 'verify',
      subject: { kind: 'agent', id: bob.publicKeyFingerprint },
    };
    const attestation2 = {
      type: 'trust',
      subject: { kind: 'agent', id: carol.publicKeyFingerprint },
    };

    // Publish with first attestation
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Original</h1>', attestation: attestation1 },
    }));

    // Should appear in bob's attestation query
    let listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${bob.publicKeyFingerprint}`));
    let data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);

    // Update with different attestation
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Updated</h1>', attestation: attestation2 },
    }));

    // Should no longer appear in bob's query
    listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${bob.publicKeyFingerprint}`));
    data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(false);

    // Should appear in carol's query
    listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${carol.publicKeyFingerprint}`));
    data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });
});

// ─── Group 5: One-per-agent-per-subject ─────────────────────

describe('One-per-agent-per-subject', () => {
  it('should overwrite index when same agent attests about same subject on different page', async () => {
    const subject = bob.publicKeyFingerprint;
    const id1 = uniqueId('att-overwrite1');
    const id2 = uniqueId('att-overwrite2');

    // Alice attests about Bob on page 1
    await app.request(`/v1/pages/${id1}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id1}`,
      body: { html: '<h1>Verify 1</h1>', attestation: { type: 'verify', subject: { kind: 'agent', id: subject } } },
    }));

    // Alice attests about Bob on page 2 (overwrites index)
    await app.request(`/v1/pages/${id2}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id2}`,
      body: { html: '<h1>Verify 2</h1>', attestation: { type: 'verify', subject: { kind: 'agent', id: subject } } },
    }));

    // Query should return the latest (page 2) since last-write-wins at index level
    const listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${subject}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    // The index should have the latest page for this agent+subject combo
    expect(data.pages.length).toBeGreaterThanOrEqual(1);
    // Find the entry from alice
    const aliceEntries = data.pages.filter((p: any) => p.keyId === alice.keyId);
    expect(aliceEntries.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Group 6: Query endpoints ──────────────────────────────

describe('Query endpoints', () => {
  it('should query by attestation.subject (agent fingerprint)', async () => {
    const id = uniqueId('att-q-agent');
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent', id: bob.publicKeyFingerprint },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Agent Query</h1>', attestation },
    }));

    const listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${bob.publicKeyFingerprint}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should query by attestation.subject (asset signed page ref)', async () => {
    const id = uniqueId('att-q-asset');
    const assetRef = `${alice.keyId}/my-analysis`;
    const attestation = {
      type: 'review',
      subject: { kind: 'asset', id: assetRef },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: bob,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Asset Query</h1>', attestation },
    }));

    // URL-encode the slash in the subject
    const listRes = await app.request(signedGet(bob, `/v1/pages?attestation.subject=${encodeURIComponent(assetRef)}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should query by attestation.type AND attestation.subject', async () => {
    const id = uniqueId('att-q-type-subj');
    const attestation = {
      type: 'endorse',
      subject: { kind: 'asset', id: `${alice.keyId}/my-page` },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: bob,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Type+Subject</h1>', attestation },
    }));

    const subject = `${alice.keyId}/my-page`;
    const listRes = await app.request(signedGet(bob, `/v1/pages?attestation.type=endorse&attestation.subject=${encodeURIComponent(subject)}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });

  it('should return 400 for type-only query without subject', async () => {
    const res = await app.request(signedGet(alice, '/v1/pages?attestation.type=verify'));
    expect(res.status).toBe(400);
    const data = await res.json() as any;
    expect(data.error).toContain('attestation.type requires attestation.subject');
  });

  it('should include attestation field in query results', async () => {
    const id = uniqueId('att-q-field');
    const attestation = {
      type: 'certify',
      subject: { kind: 'asset', id: `${alice.keyId}/api-docs` },
      context: 'Certified accurate',
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: carol,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Certified</h1>', attestation },
    }));

    const subject = `${alice.keyId}/api-docs`;
    const listRes = await app.request(signedGet(carol, `/v1/pages?attestation.subject=${encodeURIComponent(subject)}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    const found = data.pages.find((p: any) => p.id === id);
    expect(found).toBeDefined();
    expect(found.attestation).toBeDefined();
    expect(found.attestation.type).toBe('certify');
    expect(found.attestation.context).toBe('Certified accurate');
  });

  it('should support pagination with attestation queries', async () => {
    const subject = bob.publicKeyFingerprint;
    // Create multiple attestations about Bob
    const ids = [uniqueId('att-page-1'), uniqueId('att-page-2'), uniqueId('att-page-3')];
    for (const id of ids) {
      await app.request(`/v1/pages/${id}`, jsonSignedRequest({
        signer: alice,
        method: 'POST',
        path: `/v1/pages/${id}`,
        body: { html: `<h1>Page ${id}</h1>`, attestation: { type: 'verify', subject: { kind: 'agent', id: subject } } },
      }));
    }

    const listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${subject}&limit=2`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.length).toBeLessThanOrEqual(2);
    // Should have a next_cursor if there are more results
    if (data.total > 2) {
      expect(data.next_cursor).not.toBeNull();
    }
  });

  it('should support since filter with attestation queries', async () => {
    const subject = carol.publicKeyFingerprint;
    const id = uniqueId('att-since');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Since Filter</h1>', attestation: { type: 'trust', subject: { kind: 'agent', id: subject } } },
    }));

    // Query with since filter that should include this page
    const since = '2020-01-01T00:00:00Z';
    const listRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${subject}&since=${since}`));
    expect(listRes.status).toBe(200);
    const data = await listRes.json() as any;
    expect(data.pages.some((p: any) => p.id === id)).toBe(true);
  });
});

// ─── Group 7: Provenance headers and meta tags ──────────────

describe('Provenance headers and meta tags', () => {
  it('should include attestation meta tags in HTML pages', async () => {
    const id = uniqueId('att-meta');
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent', id: bob.publicKeyFingerprint },
      context: 'Verified via DNS',
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<html><head></head><body><h1>Attested</h1></body></html>', attestation },
    }));

    const readRes = await app.request(`http://localhost/p/${id}`);
    expect(readRes.status).toBe(200);
    const html = await readRes.text();
    expect(html).toContain('cap:attestation-type');
    expect(html).toContain('content="verify"');
    expect(html).toContain('cap:attestation-subject-kind');
    expect(html).toContain('content="agent"');
    expect(html).toContain('cap:attestation-subject-id');
    expect(html).toContain(bob.publicKeyFingerprint);
  });

  it('should include attestation in JSON metadata response', async () => {
    const id = uniqueId('att-json');
    const attestation = {
      type: 'endorse',
      subject: { kind: 'asset', id: `${alice.keyId}/my-docs` },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: bob,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Endorsed</h1>', attestation },
    }));

    const readRes = await app.request(`http://localhost/p/${id}`, {
      headers: { Accept: 'application/json' },
    });
    expect(readRes.status).toBe(200);
    const data = await readRes.json() as any;
    expect(data.attestation).toBeDefined();
    expect(data.attestation.type).toBe('endorse');
  });

  it('should include CAP and X-Zenbin attestation headers in HTTP response', async () => {
    const id = uniqueId('att-headers');
    const attestation = {
      type: 'review',
      subject: { kind: 'asset', id: `${carol.keyId}/analysis` },
    };
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Reviewed</h1>', attestation },
    }));

    const readRes = await app.request(`http://localhost/p/${id}`);
    expect(readRes.status).toBe(200);
    expect(readRes.headers.get('CAP-Attestation-Type')).toBe('review');
    expect(readRes.headers.get('CAP-Attestation-Subject-Kind')).toBe('asset');
    expect(readRes.headers.get('X-Zenbin-Attestation-Type')).toBe('review');
    expect(readRes.headers.get('X-Zenbin-Attestation-Subject-Kind')).toBe('asset');
  });

  it('should not include attestation headers for pages without attestation', async () => {
    const id = uniqueId('att-no-att');
    await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>No Attestation</h1>' },
    }));

    const readRes = await app.request(`http://localhost/p/${id}`);
    expect(readRes.status).toBe(200);
    expect(readRes.headers.get('CAP-Attestation-Type')).toBeNull();
    expect(readRes.headers.get('X-Zenbin-Attestation-Type')).toBeNull();
  });
});

// ─── Group 8: Round-trip ───────────────────────────────────

describe('Round-trip', () => {
  it('should publish → query → read with full attestation verification', async () => {
    const id = uniqueId('att-roundtrip');
    const attestation = {
      type: 'verify',
      subject: { kind: 'agent', id: bob.publicKeyFingerprint },
      context: 'Round-trip test',
      metadata: { method: 'dns-txt', domain: 'example.com' },
      timestamp: '2026-06-05T09:00:00Z',
    };

    // 1. Publish
    const publishRes = await app.request(`/v1/pages/${id}`, jsonSignedRequest({
      signer: alice,
      method: 'POST',
      path: `/v1/pages/${id}`,
      body: { html: '<h1>Round Trip</h1>', attestation },
    }));
    expect(publishRes.status).toBe(201);
    const publishData = await publishRes.json() as any;
    expect(publishData.attestation).toBeDefined();
    expect(publishData.attestation.type).toBe('verify');

    // 2. Query
    const queryRes = await app.request(signedGet(alice, `/v1/pages?attestation.subject=${bob.publicKeyFingerprint}`));
    expect(queryRes.status).toBe(200);
    const queryData = await queryRes.json() as any;
    const found = queryData.pages.find((p: any) => p.id === id);
    expect(found).toBeDefined();
    expect(found.attestation.type).toBe('verify');
    expect(found.attestation.subject.id).toBe(bob.publicKeyFingerprint);
    expect(found.attestation.context).toBe('Round-trip test');
    expect(found.attestation.metadata).toEqual({ method: 'dns-txt', domain: 'example.com' });

    // 3. Read (JSON)
    const readRes = await app.request(`http://localhost/p/${id}`, {
      headers: { Accept: 'application/json' },
    });
    expect(readRes.status).toBe(200);
    const readData = await readRes.json() as any;
    expect(readData.attestation).toBeDefined();
    expect(readData.attestation.type).toBe('verify');

    // 4. Read (HTML - check headers)
    const htmlRes = await app.request(`http://localhost/p/${id}`);
    expect(htmlRes.headers.get('CAP-Attestation-Type')).toBe('verify');
    expect(htmlRes.headers.get('CAP-Attestation-Subject-Id')).toBe(bob.publicKeyFingerprint);
  });
});

// ─── Group 9: Backfill migration ────────────────────────────

describe('Backfill migration', () => {
  it('should index existing pages and be idempotent', () => {
    const result = backfillAttestationIndexes();
    // Running on an empty/fresh db should work fine
    expect(result).toHaveProperty('indexed');
    expect(result).toHaveProperty('skipped');

    // Running again should be idempotent (no new indexes)
    const result2 = backfillAttestationIndexes();
    expect(result2.indexed).toBe(0);
  });
});