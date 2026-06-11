import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { objects } from '../routes/objects.js';
import { initDatabase, closeDatabase, updateAgentKeyPlan } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import { rmSync } from 'fs';
import { createTestSigner, createCapSignedHeaders, type TestSigner } from './helpers/signing.js';
import {
  objectHash, blobHash, signEnvelope,
  type SignatureEnvelope, type TreeRoot, type Ed25519Jwk,
} from '../vendor/cap-tree-core/index.js';
import vectors from './fixtures/cap-tree-vectors.json';
import ownerKeys from './fixtures/cap-tree-keypair-owner.json';
import reviewerKeys from './fixtures/cap-tree-keypair-reviewer.json';

const CAP_CT = 'application/vnd.cap-tree+json';
const TEST_DB_PATH = './data/test-cap-tree-objects.lmdb';
const TEST_DB_SUFFIXES = [
  '', '-subdomains', '-agent-keys', '-nonces', '-audit',
  '-owner-index', '-recipient-index',
  '-attestation-subject-index', '-attestation-type-subject-index',
  '-objects', '-tree-index', '-refs',
];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => { c.set('services', services); await next(); });
app.route('/v1/objects', objects);

let signer: TestSigner;
const owner = ownerKeys as { publicJwk: Ed25519Jwk; privateJwk: Ed25519Jwk };
const reviewer = reviewerKeys as { publicJwk: Ed25519Jwk; privateJwk: Ed25519Jwk };
const vecObjects = vectors.objects as Record<string, any>;

/** The signature envelope for a named vector (vectors nest it under `.envelope`). */
function envOf(name: string): SignatureEnvelope {
  return vecObjects[name].envelope as SignatureEnvelope;
}
function payloadOf(name: string): TreeRoot {
  return vecObjects[name].envelope.payload as TreeRoot;
}

function publishEnvelope(env: SignatureEnvelope): Request {
  const body = JSON.stringify(env);
  const headers = { 'Content-Type': CAP_CT, ...createCapSignedHeaders({ signer, method: 'POST', path: '/v1/objects', body }) };
  return new Request('http://localhost/v1/objects', { method: 'POST', headers, body });
}
function publishBlob(content: string): Request {
  const headers = { 'Content-Type': 'application/octet-stream', ...createCapSignedHeaders({ signer, method: 'POST', path: '/v1/objects', body: content }) };
  return new Request('http://localhost/v1/objects', { method: 'POST', headers, body: content });
}

beforeAll(async () => {
  for (const suffix of TEST_DB_SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {} }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`cap-tree-obj-${Date.now()}`);
  await updateAgentKeyPlan(signer.keyId, 'enterprise');
});

afterAll(async () => {
  await closeDatabase();
  for (const suffix of TEST_DB_SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${suffix}`, { recursive: true, force: true }); } catch {} }
});

describe('CAP-Tree objects — publish & retrieve', () => {
  // Dependency order: parents before children, targets before refs.
  const order = ['genesisRoot', 'secondRoot', 'featureRoot', 'reviewRequest', 'reviewResponse', 'mergeRoot', 'refsSeq1', 'refsSeq2'];

  it('publishes every vector envelope (201) at its stated hash', async () => {
    for (const name of order) {
      const env = envOf(name);
      const res = await app.request(publishEnvelope(env));
      expect(res.status, `${name} should publish`).toBe(201);
      const body = await res.json();
      expect(body.hash, `${name} hash`).toBe(vecObjects[name].hash);
    }
  });

  it('is idempotent — re-publishing returns 200 with the same hash', async () => {
    for (const name of order) {
      const res = await app.request(publishEnvelope(envOf(name)));
      expect(res.status, `${name} re-publish`).toBe(200);
      const body = await res.json();
      expect(body.hash).toBe(vecObjects[name].hash);
    }
  });

  it('GET returns envelope bytes that re-hash to the address', async () => {
    for (const name of order) {
      const hash = vecObjects[name].hash;
      const res = await app.request(`http://localhost/v1/objects/${hash}`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain(CAP_CT);
      expect(res.headers.get('etag')).toBe(`"${hash}"`);
      const env = JSON.parse(await res.text());
      expect(await objectHash(env.payload)).toBe(hash);
    }
  });

  it('publishes and retrieves a blob, round-tripping its bytes', async () => {
    const content = vecObjects.blob.contentUtf8 as string;
    const res = await app.request(publishBlob(content));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.hash).toBe(vecObjects.blob.hash);

    const get = await app.request(`http://localhost/v1/objects/${vecObjects.blob.hash}`);
    expect(get.status).toBe(200);
    expect(get.headers.get('content-type')).toBe('application/octet-stream');
    const bytes = new Uint8Array(await get.arrayBuffer());
    expect(await blobHash(bytes)).toBe(vecObjects.blob.hash);
    expect(new TextDecoder().decode(bytes)).toBe(content);
  });

  it('GET unknown hash → 404 OBJECT_NOT_FOUND', async () => {
    const res = await app.request('http://localhost/v1/objects/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    expect(res.status).toBe(404);
    expect((await res.json()).error_code).toBe('OBJECT_NOT_FOUND');
  });

  it('tampered envelope → 422 CAP_ENVELOPE_INVALID', async () => {
    const env = envOf('secondRoot');
    const tampered = { ...env, payload: { ...env.payload, message: 'tampered' } };
    const res = await app.request(publishEnvelope(tampered));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error_code).toBe('CAP_ENVELOPE_INVALID');
    expect(Array.isArray(body.errors)).toBe(true);
  });

  it('root with unknown parent → 422 CAP_PARENT_UNKNOWN', async () => {
    const base = payloadOf('secondRoot');
    const payload: TreeRoot = {
      ...base,
      parents: [{ hash: 'A'.repeat(43) }], // valid 43-char base64url, but unknown
      message: 'orphan',
    };
    const env = await signEnvelope(payload, owner.privateJwk, owner.publicJwk);
    const res = await app.request(publishEnvelope(env));
    expect(res.status).toBe(422);
    expect((await res.json()).error_code).toBe('CAP_PARENT_UNKNOWN');
  });

  it('root signed by a non-owner key → 422 CAP_CHAIN_INVALID', async () => {
    const base = payloadOf('secondRoot');
    // Valid parent (genesis is published), but signed by the reviewer key.
    const payload: TreeRoot = { ...base, message: 'usurped' };
    const env = await signEnvelope(payload, reviewer.privateJwk, reviewer.publicJwk);
    const res = await app.request(publishEnvelope(env));
    expect(res.status).toBe(422);
    expect((await res.json()).error_code).toBe('CAP_CHAIN_INVALID');
  });

  it('oversize blob → 413 OBJECT_TOO_LARGE', async () => {
    const prev = process.env.CAP_TREE_MAX_OBJECT_BYTES;
    process.env.CAP_TREE_MAX_OBJECT_BYTES = '8';
    try {
      const res = await app.request(publishBlob('this is definitely more than eight bytes'));
      expect(res.status).toBe(413);
      expect((await res.json()).error_code).toBe('OBJECT_TOO_LARGE');
    } finally {
      if (prev === undefined) delete process.env.CAP_TREE_MAX_OBJECT_BYTES;
      else process.env.CAP_TREE_MAX_OBJECT_BYTES = prev;
    }
  });

  it('policy-violating merge (zero approvals) is accepted → 201', async () => {
    // The host MUST NOT police policy (HB § 5). Build a merge over the two
    // published roots with NO approvals and publish it.
    const merge = payloadOf('mergeRoot');
    const payload: TreeRoot = { ...merge, approvals: [], message: 'merge without approvals' };
    const env = await signEnvelope(payload, owner.privateJwk, owner.publicJwk);
    const res = await app.request(publishEnvelope(env));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.hash).toBe(await objectHash(payload));
  });
});
