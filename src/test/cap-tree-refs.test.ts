import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { objects } from '../routes/objects.js';
import { trees } from '../routes/trees.js';
import { initDatabase, closeDatabase, updateAgentKeyPlan } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import { rmSync } from 'fs';
import { createTestSigner, createCapSignedHeaders, type TestSigner } from './helpers/signing.js';
import { signEnvelope, type SignatureEnvelope, type Refs, type Ed25519Jwk } from '../vendor/cap-tree-core/index.js';
import vectors from './fixtures/cap-tree-vectors.json';
import ownerKeys from './fixtures/cap-tree-keypair-owner.json';
import reviewerKeys from './fixtures/cap-tree-keypair-reviewer.json';

const CAP_CT = 'application/vnd.cap-tree+json';
const TEST_DB_PATH = './data/test-cap-tree-refs.lmdb';
const SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index', '-attestation-subject-index', '-attestation-type-subject-index', '-objects', '-tree-index', '-refs'];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => { c.set('services', services); await next(); });
app.route('/v1/objects', objects);
app.route('/v1/trees', trees);

let signer: TestSigner;
const owner = ownerKeys as { publicJwk: Ed25519Jwk; privateJwk: Ed25519Jwk };
const reviewer = reviewerKeys as { publicJwk: Ed25519Jwk; privateJwk: Ed25519Jwk };
const vo = vectors.objects as Record<string, any>;
const treeId = vectors.treeId as string;
const seq1Hash = vo.refsSeq1.hash as string;
const seq2Hash = vo.refsSeq2.hash as string;

function publishEnvelope(env: SignatureEnvelope): Request {
  const body = JSON.stringify(env);
  const headers = { 'Content-Type': CAP_CT, ...createCapSignedHeaders({ signer, method: 'POST', path: '/v1/objects', body }) };
  return new Request('http://localhost/v1/objects', { method: 'POST', headers, body });
}
const envOf = (name: string): SignatureEnvelope => vo[name].envelope as SignatureEnvelope;
const refsPayload = (name: string): Refs => vo[name].envelope.payload as Refs;

async function publishRefs(payload: Refs, keys: { publicJwk: Ed25519Jwk; privateJwk: Ed25519Jwk }) {
  const env = await signEnvelope(payload, keys.privateJwk, keys.publicJwk);
  return app.request(publishEnvelope(env));
}

beforeAll(async () => {
  for (const s of SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${s}`, { recursive: true, force: true }); } catch {} }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`cap-tree-refs-${Date.now()}`);
  await updateAgentKeyPlan(signer.keyId, 'enterprise');
  // Prereqs: the roots that the refs target must be stored first.
  for (const n of ['genesisRoot', 'secondRoot', 'featureRoot']) {
    const res = await app.request(publishEnvelope(envOf(n)));
    expect(res.status, `prereq ${n}`).toBe(201);
  }
});

afterAll(async () => {
  await closeDatabase();
  for (const s of SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${s}`, { recursive: true, force: true }); } catch {} }
});

describe('CAP-Tree refs — chain enforcement', () => {
  it('publishes seq 1 → 201 and exposes it as the current refs', async () => {
    const res = await app.request(publishEnvelope(envOf('refsSeq1')));
    expect(res.status).toBe(201);
    const cur = await app.request(`http://localhost/v1/trees/${treeId}/refs`);
    expect(cur.status).toBe(200);
    expect((await cur.json()).payload.seq).toBe(1);
  });

  it('rejects a seq gap (1 → 3) with 409 + recovery info', async () => {
    const payload: Refs = { ...refsPayload('refsSeq2'), seq: 3, prev: seq1Hash, timestamp: '2031-01-01T00:00:00Z' };
    const res = await publishRefs(payload, owner);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error_code).toBe('CAP_REFS_CONFLICT');
    expect(body.currentSeq).toBe(1);
    expect(body.currentHash).toBe(seq1Hash);
  });

  it('publishes seq 2 with correct prev → 201 and advances the head', async () => {
    const res = await app.request(publishEnvelope(envOf('refsSeq2')));
    expect(res.status).toBe(201);
    const cur = await app.request(`http://localhost/v1/trees/${treeId}/refs`);
    expect((await cur.json()).payload.seq).toBe(2);
  });

  it('replaying seq 2 is idempotent → 200 with same hash', async () => {
    const res = await app.request(publishEnvelope(envOf('refsSeq2')));
    expect(res.status).toBe(200);
    expect((await res.json()).hash).toBe(seq2Hash);
  });

  it('rejects a conflicting seq 2 (different object) with 409 + recovery info', async () => {
    const payload: Refs = { ...refsPayload('refsSeq2'), timestamp: '2032-02-02T00:00:00Z' };
    const res = await publishRefs(payload, owner);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error_code).toBe('CAP_REFS_CONFLICT');
    expect(body.currentSeq).toBe(2);
    expect(body.currentHash).toBe(seq2Hash);
  });

  it('rejects refs signed by a non-owner → 403 CAP_NOT_OWNER', async () => {
    const payload: Refs = { ...refsPayload('refsSeq2'), seq: 3, prev: seq2Hash, timestamp: '2033-03-03T00:00:00Z' };
    const res = await publishRefs(payload, reviewer);
    expect(res.status).toBe(403);
    expect((await res.json()).error_code).toBe('CAP_NOT_OWNER');
  });

  it('refs/history returns the chain newest-first', async () => {
    const res = await app.request(`http://localhost/v1/trees/${treeId}/refs/history`);
    expect(res.status).toBe(200);
    const body = await res.json();
    const seqs = body.refs.map((e: any) => e.payload.seq);
    expect(seqs).toEqual([2, 1]);
  });
});
