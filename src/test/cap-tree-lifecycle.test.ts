/**
 * HB § 8 conformance seed: build a fresh tree with cap-tree-core, publish every
 * object through the API, then "clone" — fetch refs, walk, and verify using
 * ONLY what the API returns (the resolver fetches via GET /v1/objects).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { objects } from '../routes/objects.js';
import { trees } from '../routes/trees.js';
import { initDatabase, closeDatabase, updateAgentKeyPlan } from '../storage/db.js';
import { createServices, type Services } from '../services/container.js';
import { rmSync } from 'fs';
import { createTestSigner, createCapSignedHeaders, type TestSigner } from './helpers/signing.js';
import {
  generateKeyPair, signEnvelope, objectHash,
  verifyRootChain, verifyMerge, verifyRefs,
  type SignatureEnvelope, type TreeRoot, type Refs, type Policy, type ObjectRef, type Resolver,
} from 'cap-tree-core';

const CAP_CT = 'application/vnd.cap-tree+json';
const TEST_DB_PATH = './data/test-cap-tree-lifecycle.lmdb';
const SUFFIXES = ['', '-subdomains', '-agent-keys', '-nonces', '-audit', '-owner-index', '-recipient-index', '-attestation-subject-index', '-attestation-type-subject-index', '-objects', '-tree-index', '-refs'];

const services = createServices();
const app = new Hono<{ Variables: { services: Services } }>();
app.use('*', async (c, next) => { c.set('services', services); await next(); });
app.route('/v1/objects', objects);
app.route('/v1/trees', trees);

let signer: TestSigner;
let owner: Awaited<ReturnType<typeof generateKeyPair>>;
let reviewer: Awaited<ReturnType<typeof generateKeyPair>>;

function publish(env: SignatureEnvelope): Request {
  const body = JSON.stringify(env);
  const headers = { 'Content-Type': CAP_CT, ...createCapSignedHeaders({ signer, method: 'POST', path: '/v1/objects', body }) };
  return new Request('http://localhost/v1/objects', { method: 'POST', headers, body });
}

// Resolver used by the "clone" — fetches envelopes ONLY through the public API.
const apiResolver: Resolver = async (ref: ObjectRef) => {
  const res = await app.request(`http://localhost/v1/objects/${ref.hash}`);
  if (res.status !== 200) return null;
  return (await res.json()) as SignatureEnvelope;
};

const T = (n: number) => `2026-01-0${n}T00:00:00Z`;

beforeAll(async () => {
  for (const s of SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${s}`, { recursive: true, force: true }); } catch {} }
  process.env.LMDB_PATH = TEST_DB_PATH;
  initDatabase();
  signer = await createTestSigner(`cap-tree-life-${Date.now()}`);
  await updateAgentKeyPlan(signer.keyId, 'enterprise');
  owner = await generateKeyPair();
  reviewer = await generateKeyPair();
});

afterAll(async () => {
  await closeDatabase();
  for (const s of SUFFIXES) { try { rmSync(`${TEST_DB_PATH}${s}`, { recursive: true, force: true }); } catch {} }
});

describe('CAP-Tree lifecycle — build, publish, clone, verify', () => {
  it('round-trips a full tree through the API and verifies the clone', async () => {
    const policy: Policy = { requiredApprovals: 1, reviewers: [reviewer.fingerprint], selfReview: false };
    const baseRoot = (over: Partial<TreeRoot>): TreeRoot => ({
      type: 'tree-root', specVersion: 3, ownerFingerprint: owner.fingerprint,
      adminFingerprints: [], entries: [], parents: [], policy, approvals: [],
      message: '', timestamp: T(1), ...over,
    });
    const sign = (p: unknown, k: typeof owner | typeof reviewer) => signEnvelope(p, k.privateJwk, k.publicJwk);
    const hash = (p: unknown) => objectHash(p);

    // Genesis → c1 → c2 (main), branch b1 off c1.
    const genesis = baseRoot({ message: 'genesis', timestamp: T(1) });
    const genesisHash = await hash(genesis);
    const treeId = genesisHash;

    const c1 = baseRoot({ parents: [{ hash: genesisHash }], message: 'c1', timestamp: T(2) });
    const c1Hash = await hash(c1);
    const c2 = baseRoot({ parents: [{ hash: c1Hash }], message: 'c2', timestamp: T(3) });
    const c2Hash = await hash(c2);
    const b1 = baseRoot({ parents: [{ hash: c1Hash }], message: 'feature b1', timestamp: T(4) });
    const b1Hash = await hash(b1);

    const reviewRequest = {
      type: 'review-request', specVersion: 3, root: { hash: b1Hash }, target: { hash: c2Hash },
      authorFingerprint: owner.fingerprint, reviewerFingerprint: reviewer.fingerprint,
      message: 'please review', timestamp: T(5),
    };
    const reqHash = await hash(reviewRequest);
    const reviewResponse = {
      type: 'review-response', specVersion: 3, request: { hash: reqHash }, root: { hash: b1Hash },
      outcome: 'approved', reviewerFingerprint: reviewer.fingerprint, message: 'lgtm', timestamp: T(6),
    };
    const respHash = await hash(reviewResponse);

    const merge = baseRoot({
      parents: [{ hash: c2Hash }, { hash: b1Hash }], approvals: [{ hash: respHash }],
      message: 'merge b1 into main', timestamp: T(7),
    });
    const mergeHash = await hash(merge);

    const refs1: Refs = { type: 'refs', specVersion: 3, treeId, seq: 1, prev: null, branches: { main: { hash: c2Hash } }, tags: {}, timestamp: T(8) };
    const refs1Hash = await hash(refs1);
    const refs2: Refs = { type: 'refs', specVersion: 3, treeId, seq: 2, prev: refs1Hash, branches: { main: { hash: mergeHash } }, tags: {}, timestamp: T(9) };

    // Publish everything, parents-first.
    const steps: Array<[string, SignatureEnvelope]> = [
      ['genesis', await sign(genesis, owner)],
      ['c1', await sign(c1, owner)],
      ['c2', await sign(c2, owner)],
      ['b1', await sign(b1, owner)],
      ['reviewRequest', await sign(reviewRequest, owner)],
      ['reviewResponse', await sign(reviewResponse, reviewer)],
      ['merge', await sign(merge, owner)],
      ['refs1', await sign(refs1, owner)],
      ['refs2', await sign(refs2, owner)],
    ];
    for (const [name, env] of steps) {
      const res = await app.request(publish(env));
      expect(res.status, `publish ${name}`).toBe(201);
    }

    // ─── Clone: fetch current refs, then verify using only the API. ───
    const refsRes = await app.request(`http://localhost/v1/trees/${treeId}/refs`);
    expect(refsRes.status).toBe(200);
    const currentRefs = (await refsRes.json()) as SignatureEnvelope<Refs>;
    expect(currentRefs.payload.seq).toBe(2);

    const mainTip = currentRefs.payload.branches.main!;
    expect(mainTip.hash).toBe(mergeHash);

    const mergeEnv = (await apiResolver(mainTip)) as SignatureEnvelope<TreeRoot>;
    expect(mergeEnv).not.toBeNull();

    const chain = await verifyRootChain(mergeEnv, treeId, apiResolver);
    expect(chain.ok, `chain errors: ${chain.errors.join('; ')}`).toBe(true);
    expect(chain.genesisHash).toBe(treeId);

    const mergeVerdict = await verifyMerge(mergeEnv, treeId, apiResolver);
    expect(mergeVerdict.ok, `merge errors: ${mergeVerdict.errors.join('; ')}`).toBe(true);
    expect(mergeVerdict.policySatisfied).toBe(true);
    expect(mergeVerdict.countedApprovals).toBe(1);

    const refsVerdict = await verifyRefs(currentRefs, { treeId, resolve: apiResolver });
    expect(refsVerdict.ok, `refs errors: ${refsVerdict.errors.join('; ')}`).toBe(true);
    expect(refsVerdict.equivocation).toBe(false);
  });
});
