import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { objects } from '../routes/objects.js';
import { trees, reviews } from '../routes/trees.js';
import { wellKnown } from '../routes/wellKnown.js';
import { initDatabase, closeDatabase, updateAgentKeyPlan } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import { rmSync } from 'fs';
import { createTestSigner, createCapSignedHeaders, type TestSigner } from './helpers/signing.js';
import { type SignatureEnvelope } from 'cap-tree-core';
import vectors from './fixtures/cap-tree-vectors.json';

const CAP_CT = 'application/vnd.cap-tree+json';
const TEST_DB_PATH = './data/test-cap-tree-reads.lmdb';
const SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index', '-attestation-subject-index', '-attestation-type-subject-index', '-objects', '-tree-index', '-refs'];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => { c.set('services', services); await next(); });
app.route('/v1/objects', objects);
app.route('/v1/trees', trees);
app.route('/v1/reviews', reviews);
app.route('/.well-known', wellKnown);

let signer: TestSigner;
const vo = vectors.objects as Record<string, any>;
const treeId = vectors.treeId as string;
const genesisHash = vo.genesisRoot.hash as string;
const secondHash = vo.secondRoot.hash as string;
const featureHash = vo.featureRoot.hash as string;
const blobHashStr = vo.blob.hash as string;
const reviewerFp = vectors.keys.reviewer.fingerprint as string;

function publishEnvelope(env: SignatureEnvelope): Request {
  const body = JSON.stringify(env);
  const headers = { 'Content-Type': CAP_CT, ...createCapSignedHeaders({ signer, method: 'POST', path: '/v1/objects', body }) };
  return new Request('http://localhost/v1/objects', { method: 'POST', headers, body });
}
const envOf = (name: string): SignatureEnvelope => vo[name].envelope as SignatureEnvelope;

beforeAll(async () => {
  for (const s of SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${s}`, { recursive: true, force: true }); } catch {} }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`cap-tree-reads-${Date.now()}`);
  await updateAgentKeyPlan(signer.keyId, 'enterprise');
  for (const n of ['genesisRoot', 'secondRoot', 'featureRoot', 'subtree', 'reviewRequest', 'reviewResponse']) {
    const res = await app.request(publishEnvelope(envOf(n)));
    expect(res.status, `prereq ${n}`).toBe(201);
  }
});

afterAll(async () => {
  await closeDatabase();
  for (const s of SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${s}`, { recursive: true, force: true }); } catch {} }
});

describe('CAP-Tree reads — tree endpoints, reviews, discovery', () => {
  it('GET roots/{hash} returns the root envelope (404 for non-members)', async () => {
    const ok = await app.request(`http://localhost/v1/trees/${treeId}/roots/${secondHash}`);
    expect(ok.status).toBe(200);
    expect((await ok.json()).payload.type).toBe('tree-root');

    const miss = await app.request(`http://localhost/v1/trees/${treeId}/roots/${'B'.repeat(43)}`);
    expect(miss.status).toBe(404);
  });

  it('roots history walks ancestry newest-first', async () => {
    const res = await app.request(`http://localhost/v1/trees/${treeId}/roots/${featureHash}/history`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.roots.map((r: any) => r.hash)).toEqual([featureHash, secondHash, genesisHash]);
    expect(body.roots[0].entryCount).toBeGreaterThanOrEqual(0);
  });

  it('roots history pagination: next_cursor resumes the walk', async () => {
    const page1 = await (await app.request(`http://localhost/v1/trees/${treeId}/roots/${featureHash}/history?limit=2`)).json();
    expect(page1.roots.map((r: any) => r.hash)).toEqual([featureHash, secondHash]);
    expect(page1.next_cursor).toBe(secondHash);
    const page2 = await (await app.request(`http://localhost/v1/trees/${treeId}/roots/${featureHash}/history?limit=2&cursor=${page1.next_cursor}`)).json();
    expect(page2.roots.map((r: any) => r.hash)).toEqual([genesisHash]);
    expect(page2.next_cursor).toBeNull();
  });

  it('resolve walks a subtree path to its terminal entry', async () => {
    const res = await app.request(`http://localhost/v1/trees/${treeId}/resolve?root=${genesisHash}&path=docs/README.md`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.path).toBe('docs/README.md');
    expect(body.kind).toBe('blob');
    expect(body.ref.hash).toBe(blobHashStr);
  });

  it('resolve returns 404 PATH_NOT_FOUND for a missing path', async () => {
    const res = await app.request(`http://localhost/v1/trees/${treeId}/resolve?root=${genesisHash}&path=docs/nope.md`);
    expect(res.status).toBe(404);
    expect((await res.json()).error_code).toBe('PATH_NOT_FOUND');
  });

  it('reviews query filters by tree/type/outcome', async () => {
    const all = await app.request(`http://localhost/v1/trees/${treeId}/refs`); // tree exists sanity (404 refs ok)
    expect([200, 404]).toContain(all.status);

    const res = await app.request(`http://localhost/v1/reviews?tree=${treeId}&type=review-response&outcome=approved`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reviews.length).toBe(1);
    expect(body.reviews[0].payload.type).toBe('review-response');
    expect(body.reviews[0].payload.outcome).toBe('approved');
    expect(body.reviews[0].payload.reviewerFingerprint).toBe(reviewerFp);

    const requests = await app.request(`http://localhost/v1/reviews?tree=${treeId}&type=review-request`);
    expect((await requests.json()).reviews.length).toBe(1);
  });

  it('serves /.well-known/cap-tree.json with the discovery shape', async () => {
    const res = await app.request('http://localhost/.well-known/cap-tree.json');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.protocol).toBe('cap-tree');
    expect(body.specVersion).toBe(3);
    expect(body.endpoints).toEqual({ objects: '/v1/objects', trees: '/v1/trees', keys: '/v1/keys' });
    expect(typeof body.maxObjectBytes).toBe('number');
    expect(body.operator).toContain('ZenBin');
  });
});
