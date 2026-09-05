import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { logs } from '../routes/logs.js';
import { verifyApiKey } from '../middleware/verifyApiKey.js';
import { closeLogDatabase, initLogDatabase } from '../storage/logs.js';
import { config } from '../config.js';
import { createAgent, registerLogAgents } from './logHelpers.js';

const app = new Hono();
app.use('*', cors());
app.use('/v1/*', verifyApiKey);
app.route('/v1/logs', logs);
app.get('/v1/quota-check', (c) => c.json({ ok: true }));
const owner = createAgent();
const writer = createAgent();
const outsider = createAgent();
const id = () => `log-${randomUUID()}`;
beforeAll(async () => { await registerLogAgents(); initLogDatabase(); });
afterAll(closeLogDatabase);

function post(path: string, body: unknown, agent = owner, method = 'POST') {
  const req = agent.request(path, body, { method });
  req.headers.set('User-Agent', randomUUID());
  return app.request(path, req);
}

describe('Public logs API', () => {
  it('allows owner and allowlisted writer, with public identity, time and unchanged metadata', async () => {
    const path = `/v1/logs/${id()}`;
    const created = await post(path, { allowed_writers: [writer.fingerprint] });
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ owner_fingerprint: owner.fingerprint, allowed_writers: [writer.fingerprint], entry_count: 0 });
    const metadata = '  {"event":"ready", "message":"雪 <script>alert(1)</script>"}  ';
    const before = Date.now();
    for (const agent of [owner, writer]) {
      const res = await post(`${path}/entries`, { metadata }, agent);
      expect(res.status).toBe(201);
      const entry = await res.json();
      expect(entry.agent_fingerprint).toBe(agent.fingerprint);
      expect(entry.metadata).toBe(metadata);
      expect(Date.parse(entry.timestamp)).toBeGreaterThanOrEqual(before);
      expect(Date.parse(entry.timestamp)).toBeLessThanOrEqual(Date.now());
    }
    expect((await post(`${path}/entries`, { metadata: '{}' }, outsider)).status).toBe(403);
    expect((await post(path, {}, outsider)).status).toBe(409);
    const page = await app.request(`${path}/entries?limit=1`);
    expect(page.headers.get('Content-Type')).toContain('application/json');
    expect(page.headers.get('Cache-Control')).toBe('no-store');
    expect(await page.json()).toMatchObject({ next_after: 1, has_more: true, entries: [{ sequence: 1, metadata }] });
    expect(await (await app.request(`${path}/entries?after=1`)).json()).toMatchObject({ next_after: 2, has_more: false, entries: [{ sequence: 2 }] });
    expect(await (await app.request(`${path}/entries?after=2`)).json()).toEqual({ next_after: 2, has_more: false, entries: [] });
    expect(await (await app.request(path)).json()).toMatchObject({ entry_count: 2 });
  });

  it('requires signatures and rejects altered and replayed requests without appending', async () => {
    const path = `/v1/logs/${id()}`;
    expect((await app.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(401);
    expect((await post(path, {})).status).toBe(201);
    const req = owner.request(`${path}/entries`, { metadata: '{}' });
    expect((await app.request(`${path}/entries`, { ...req, body: '{"metadata":"null"}' })).status).toBe(401);
    expect((await app.request(`${path}/entries`, req)).status).toBe(201);
    expect((await app.request(`${path}/entries`, req)).status).toBe(409);
    expect(await (await app.request(path)).json()).toMatchObject({ entry_count: 1 });
  });

  it.each([null, [], 1, 'null', '{', { allowed_writers: null }, { allowed_writers: {} }, { allowed_writers: ['invalid'] },
    { allowed_writers: ['!'.repeat(43)] }, { allowed_writers: [writer.fingerprint, writer.fingerprint] },
    { owner_fingerprint: outsider.fingerprint }, { allowed_writers: Array.from({ length: 101 }, (_, i) => Buffer.from(String(i).padStart(32, '0')).toString('base64url')) },
  ])('rejects invalid create input %j', async (body) => {
    expect((await post(`/v1/logs/${id()}`, body)).status).toBe(400);
  });

  it('accepts 100 unique writers', async () => {
    const writers = Array.from({ length: 100 }, (_, i) => Buffer.from(String(i).padStart(32, '0')).toString('base64url'));
    expect((await post(`/v1/logs/${id()}`, { allowed_writers: writers })).status).toBe(201);
  });

  it.each([{}, { metadata: {} }, { metadata: null }, { metadata: '' }, { metadata: '{' }, { metadata: '{}', timestamp: 'forged' }, { metadata: '{}', agent_fingerprint: outsider.fingerprint }])('rejects invalid entry input %j', async (body) => {
    expect((await post(`/v1/logs/${id()}/entries`, body)).status).toBe(400);
  });

  it('accepts JSON scalar strings and enforces metadata UTF-8 byte limit', async () => {
    const path = `/v1/logs/${id()}`;
    await post(path, {});
    for (const metadata of ['null', '42', 'false', '"text"', '[1,2]', '"' + 'x'.repeat(16382) + '"']) {
      expect((await post(`${path}/entries`, { metadata })).status).toBe(201);
    }
    expect((await post(`${path}/entries`, { metadata: '"' + 'x'.repeat(16383) + '"' })).status).toBe(413);
    expect((await post(`${path}/entries`, { metadata: '"' + '雪'.repeat(6000) + '"' })).status).toBe(413);
  });

  it('counts raw bytes for oversized bodies even with understated Content-Length', async () => {
    const path = `/v1/logs/${id()}`;
    const req = owner.request(path, { allowed_writers: [], padding: 'a'.repeat(65536) });
    req.headers.set('Content-Length', '1');
    expect((await app.request(path, req)).status).toBe(413);
  });

  it.each(['after=-1', 'after=1.5', 'after=9007199254740992', 'after=01', 'limit=0', 'limit=101', 'limit=1e2', 'after=', 'limit=', 'limit=1&limit=2', 'after=0&after=1', 'unknown=1'])('rejects invalid read query %s', async (query) => {
    expect((await app.request(`/v1/logs/${id()}/entries?${query}`)).status).toBe(400);
  });

  it('validates IDs, missing resources, content type and mutation queries', async () => {
    expect((await post('/v1/logs/bad%3Aid', {})).status).toBe(400);
    expect((await app.request('/v1/logs/' + 'x'.repeat(129))).status).toBe(400);
    expect((await app.request('/v1/logs/missing')).status).toBe(404);
    expect((await app.request('/v1/logs/missing/entries')).status).toBe(404);
    expect((await post('/v1/logs/missing/entries', { metadata: '{}' })).status).toBe(404);
    expect((await post('/v1/logs/query?overwrite=true', {})).status).toBe(400);
    const req = owner.request('/v1/logs/wrong-type', {});
    req.headers.set('Content-Type', 'text/plain');
    expect((await app.request('/v1/logs/wrong-type', req)).status).toBe(400);
  });

  it('keeps public polling and CORS available after monthly publication quota is exhausted', async () => {
    const path = `/v1/logs/${id()}`;
    await post(path, {});
    const headers = { 'User-Agent': randomUUID(), Origin: 'https://visualizer.example' };
    for (let i = 0; i < config.freeTier.monthlyLimit; i++) expect((await app.request('/v1/quota-check', { headers })).status).toBe(200);
    expect((await app.request('/v1/quota-check', { headers })).status).toBe(429);
    const read = await app.request(`${path}/entries`, { headers });
    expect(read.status).toBe(200);
    expect(read.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect((await app.request(path, { method: 'HEAD', headers })).status).toBe(200);
    const write = owner.request(`${path}/entries`, { metadata: '{}' });
    write.headers.set('User-Agent', headers['User-Agent']);
    expect((await app.request(`${path}/entries`, write)).status).toBe(429);
    const preflight = await app.request(`${path}/entries`, { method: 'OPTIONS', headers: { ...headers, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'x-zenbin-public-key,x-zenbin-signature,content-digest' } });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('Access-Control-Allow-Headers')).toContain('x-zenbin-signature');
  });
});


describe('Log management API', () => {
  it('updates ACL with revision checks and transfers only after recipient accepts', async () => {
    const path = `/v1/logs/${id()}`;
    await post(path, {});
    const edited = await post(`${path}/writers`, { allowed_writers: [writer.fingerprint], expected_revision: 0 }, owner, 'PUT');
    expect(edited.status).toBe(200);
    expect(await edited.json()).toMatchObject({ revision: 1 });
    expect((await post(`${path}/entries`, { metadata: '{}' }, writer)).status).toBe(201);
    expect((await post(`${path}/writers`, { allowed_writers: [], expected_revision: 0 }, owner, 'PUT')).status).toBe(409);
    expect((await post(`${path}/writers`, { allowed_writers: [], expected_revision: 1 }, writer, 'PUT')).status).toBe(403);
    expect((await post(`${path}/writers`, { allowed_writers: [], expected_revision: 1 }, owner, 'PUT')).status).toBe(200);
    expect((await post(`${path}/entries`, { metadata: '{}' }, writer)).status).toBe(403);
    const nomination = await post(`${path}/transfer`, { new_owner_fingerprint: writer.fingerprint, expected_revision: 2 });
    expect(nomination.status).toBe(200);
    expect(await nomination.json()).toMatchObject({ owner_fingerprint: owner.fingerprint, revision: 3, pending_transfer: { new_owner_fingerprint: writer.fingerprint, retain_previous_owner: false } });
    expect((await post(`${path}/transfer/accept`, { expected_revision: 3 }, outsider)).status).toBe(403);
    const accepted = await post(`${path}/transfer/accept`, { expected_revision: 3 }, writer);
    expect(accepted.status).toBe(200);
    expect(await accepted.json()).toMatchObject({ owner_fingerprint: writer.fingerprint, revision: 4, pending_transfer: null, entry_count: 1 });
    expect((await post(`${path}/entries`, { metadata: '{}' }, owner)).status).toBe(403);
    expect((await post(`${path}/writers`, { allowed_writers: [], expected_revision: 4 }, owner, 'PUT')).status).toBe(403);
    expect((await post(`${path}/entries`, { metadata: '{}' }, writer)).status).toBe(201);
  });
  it('requires signed DELETE, cancels pending transfers, and rejects tampered methods', async () => {
    const path = `/v1/logs/${id()}`;
    await post(path, {});
    await post(`${path}/transfer`, { new_owner_fingerprint: writer.fingerprint, expected_revision: 0 });
    const unsigned = await app.request(`${path}/transfer`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: '{"expected_revision":1}' });
    expect(unsigned.status).toBe(401);
    const req = owner.request(`${path}/transfer`, { expected_revision: 1 }, { method: 'PUT' });
    expect((await app.request(`${path}/transfer`, { ...req, method: 'DELETE' })).status).toBe(401);
    const cancel = await post(`${path}/transfer`, { expected_revision: 1 }, owner, 'DELETE');
    expect(cancel.status).toBe(200);
    expect(await cancel.json()).toMatchObject({ revision: 2, pending_transfer: null });
    expect((await post(`${path}/transfer/accept`, { expected_revision: 2 }, writer)).status).toBe(409);
  });
  it.each([
    ['PUT', '/writers', {}],
    ['PUT', '/writers', { allowed_writers: [], expected_revision: -1 }],
    ['PUT', '/writers', { allowed_writers: [], expected_revision: '0' }],
    ['PUT', '/writers', { allowed_writers: [], expected_revision: 0.5 }],
    ['PUT', '/writers', { allowed_writers: [], expected_revision: 9007199254740992 }],
    ['PUT', '/writers', { allowed_writers: [], expected_revision: 0, extra: true }],
    ['PUT', '/writers', { allowed_writers: [writer.fingerprint, writer.fingerprint], expected_revision: 0 }],
    ['POST', '/transfer', { new_owner_fingerprint: 'invalid', expected_revision: 0 }],
    ['POST', '/transfer', { new_owner_fingerprint: owner.fingerprint, expected_revision: 0 }],
    ['POST', '/transfer', { new_owner_fingerprint: writer.fingerprint, expected_revision: 0, retain_previous_owner: 'yes' }],
    ['POST', '/transfer/accept', { expected_revision: null }],
    ['DELETE', '/transfer', { expected_revision: 0, retain_previous_owner: true }],
  ])('validates %s %s body %j', async (method, suffix, body) => {
    expect((await post(`/v1/logs/${id()}${suffix}`, body, owner, method)).status).toBe(400);
  });
  it.each(['PUT', 'DELETE'])('supports browser preflight and denies unsigned %s', async (method) => {
    const target = `/v1/logs/${id()}/${method === 'PUT' ? 'writers' : 'transfer'}`;
    const response = await app.request(target, { method: 'OPTIONS', headers: { Origin: 'https://visualizer.example', 'Access-Control-Request-Method': method, 'Access-Control-Request-Headers': 'cap-key-id,cap-signature' } });
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain(method);
    expect((await app.request(target, { method, headers: { 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(401);
  });
  it('rejects management replay and keeps successful-only nonce semantics', async () => {
    const path = `/v1/logs/${id()}`;
    await post(path, {});
    const edit = owner.request(`${path}/writers`, { allowed_writers: [], expected_revision: 0 }, { method: 'PUT' });
    edit.headers.set('User-Agent', randomUUID());
    expect((await app.request(`${path}/writers`, edit)).status).toBe(200);
    expect((await app.request(`${path}/writers`, edit)).status).toBe(409);
  });
});
