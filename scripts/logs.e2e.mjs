import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fingerprintOf, signLogRequest } from '../examples/logClient.mjs';

async function startServer(directory, overrides = {}) {
  const child = spawn(process.execPath, ['dist/index.js'], {
    env: {
      ...process.env,
      PORT: '0', HOST: '127.0.0.1', BASE_URL: 'http://localhost',
      LMDB_PATH: join(directory, 'pages.lmdb'), VIDEO_STORAGE_PATH: join(directory, 'videos'),
      POSTHOG_KEY: '', RATE_LIMIT_MAX_REQUESTS: '500', FREE_TIER_MONTHLY_LIMIT: '4',
      RATE_LIMIT_WINDOW_MS: '60000', SUBDOMAINS_ENABLED: 'true',
      ...overrides,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // Consume output without writing request information or environment values to test reports.
  child.stderr.resume();
  try {
    const baseUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server startup timed out')), 15000);
      const fail = (error) => { clearTimeout(timer); reject(error); };
      child.once('error', fail);
      child.once('exit', (code) => fail(new Error(`Server exited before readiness (${code})`)));
      let output = '';
      child.stdout.on('data', (chunk) => {
        output = (output + chunk.toString()).slice(-8192);
        const match = output.match(/Server running at http:\/\/127\.0\.0\.1:(\d+)/);
        if (match) {
          clearTimeout(timer);
          resolve(`http://127.0.0.1:${match[1]}`);
        }
      });
    });
    return { child, baseUrl };
  } catch (error) {
    await stopServer(child);
    throw error;
  }
}

async function stopServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
  try { await exited; } finally { clearTimeout(timer); }
}

test('production HTTP public logs and existing pages survive restart', { timeout: 60000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'zenbin-logs-e2e-'));
  let server;
  const agent = () => ({ ...generateKeyPairSync('ed25519'), keyId: `e2e-key-${randomUUID()}` });
  const owner = agent();
  const writer = agent();
  const outsider = agent();
  const agents = [owner, writer, outsider];
  const path = `/v1/logs/e2e-${randomUUID()}`;
  const pageId = `e2e-page-${randomUUID()}`;
  let replay;
  const metadata = ' {"event":"ready","text":"雪 <script>untrusted</script>"} ';
  const request = (target, options = {}) => fetch(server.baseUrl + target, { ...options, signal: AbortSignal.timeout(10000) });
  const write = (key, target, data, method = 'POST') => {
    const keyId = agents.find((agent) => agent.privateKey === key).keyId;
    const options = signLogRequest(keyId, key, target, data, { method });
    // Distinct callers avoid conflating API authorization tests with per-client free quotas.
    options.headers['User-Agent'] = randomUUID();
    return request(target, options);
  };
  try {
    server = await startServer(directory);
    for (const agent of agents) {
      const registration = await request('/v1/keys/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': randomUUID() }, body: JSON.stringify({ keyId: agent.keyId, publicJwk: agent.publicKey.export({ format: 'jwk' }) }) });
      assert.equal(registration.status, 201);
      assert.equal((await registration.json()).publicKeyFingerprint, fingerprintOf(agent.publicKey));
    }

    await t.test('create, owner/writer append, outsider denial and immutable identity', async () => {
      const created = await write(owner.privateKey, path, { allowed_writers: [fingerprintOf(writer.publicKey)] });
      assert.equal(created.status, 201);
      assert.deepEqual(await created.json(), {
        id: path.split('/').at(-1), owner_fingerprint: fingerprintOf(owner.publicKey),
        allowed_writers: [fingerprintOf(writer.publicKey)], created_at: (await (await request(path)).json()).created_at, entry_count: 0, revision: 0, pending_transfer: null,
      });
      assert.equal((await write(outsider.privateKey, path, {})).status, 409);
      assert.equal((await write(owner.privateKey, `${path}/entries`, { metadata })).status, 201);
      replay = signLogRequest(writer.keyId, writer.privateKey, `${path}/entries`, { metadata: '{"event":"done"}' });
      const written = await request(`${path}/entries`, replay);
      assert.equal(written.status, 201);
      const entry = await written.json();
      assert.equal(entry.agent_fingerprint, fingerprintOf(writer.publicKey));
      assert.equal(entry.sequence, 2);
      assert.ok(Math.abs(Date.now() - Date.parse(entry.timestamp)) < 5000);
      assert.equal((await write(outsider.privateKey, `${path}/entries`, { metadata: '{}' })).status, 403);
      assert.equal((await request(`${path}/entries`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': randomUUID() }, body: '{"metadata":"{}"}' })).status, 401);
    });

    await t.test('public cursor pagination, CORS and exhausted publication quota', async () => {
      const headers = { 'User-Agent': 'e2e-exhausted', Origin: 'https://visualizer.example' };
      for (let i = 0; i < 4; i++) assert.equal((await request('/v1/stats', { headers })).status, 200);
      assert.equal((await request('/v1/stats', { headers })).status, 429);
      const response = await request(`${path}/entries?limit=1`, { headers });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('access-control-allow-origin'), '*');
      assert.match(response.headers.get('content-type'), /application\/json/);
      const page = await response.json();
      assert.equal(page.next_after, 1);
      assert.equal(page.has_more, true);
      assert.equal(page.entries[0].metadata, metadata);
      const next = await (await request(`${path}/entries?after=${page.next_after}`, { headers })).json();
      assert.equal(next.next_after, 2);
      assert.equal(next.has_more, false);
      assert.equal(next.entries.length, 1);
      assert.deepEqual(await (await request(`${path}/entries?after=2`, { headers })).json(), { entries: [], next_after: 2, has_more: false });
      assert.equal((await request(path, { method: 'HEAD', headers })).status, 200);
      const deniedWrite = signLogRequest(owner.keyId, owner.privateKey, `${path}/entries`, { metadata: '{}' });
      deniedWrite.headers['User-Agent'] = headers['User-Agent'];
      assert.equal((await request(`${path}/entries`, deniedWrite)).status, 429);
      const preflight = await request(`${path}/entries`, { method: 'OPTIONS', headers: { ...headers, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-digest,x-zenbin-signature' } });
      assert.equal(preflight.status, 204);
      assert.match(preflight.headers.get('access-control-allow-headers'), /x-zenbin-signature/);
    });

    await t.test('concurrent HTTP writes have contiguous unique sequences', async () => {
      const responses = await Promise.all(Array.from({ length: 12 }, (_, i) => write(i % 2 ? owner.privateKey : writer.privateKey, `${path}/entries`, { metadata: JSON.stringify({ index: i }) })));
      for (const response of responses) assert.equal(response.status, 201);
      const page = await (await request(`${path}/entries`)).json();
      assert.deepEqual(page.entries.map((entry) => entry.sequence), Array.from({ length: 14 }, (_, i) => i + 1));
      assert.equal((await (await request(path)).json()).entry_count, 14);
    });

    await t.test('existing page publishing/rendering and agent discovery work', async () => {
      const response = await write(owner.privateKey, `/v1/pages/${pageId}`, { html: '<h1>Existing page regression check</h1>' });
      assert.equal(response.status, 201);
      assert.match(await (await request(`/p/${pageId}/raw`)).text(), /Existing page regression check/);
      for (const target of ['/api/agent', '/.well-known/skill.md']) {
        const result = await request(target);
        assert.equal(result.status, 200);
        const text = await result.text();
        assert.match(text, /expected_revision/);
        assert.match(text, /allowed_writers/);
        assert.match(text, /metadata.*string/);
      }
    });

    await t.test('owner edits writers, cancels nominations and leaves a pending handoff', async () => {
      assert.equal((await write(owner.privateKey, `${path}/writers`, { allowed_writers: [], expected_revision: 0 }, 'PUT')).status, 200);
      assert.equal((await write(writer.privateKey, `${path}/entries`, { metadata: '{}' })).status, 403);
      assert.equal((await write(owner.privateKey, `${path}/writers`, { allowed_writers: [fingerprintOf(writer.publicKey)], expected_revision: 0 }, 'PUT')).status, 409);
      assert.equal((await write(owner.privateKey, `${path}/transfer`, { new_owner_fingerprint: fingerprintOf(writer.publicKey), expected_revision: 1 })).status, 200);
      assert.equal((await write(owner.privateKey, `${path}/transfer`, { expected_revision: 2 }, 'DELETE')).status, 200);
      assert.equal((await write(writer.privateKey, `${path}/transfer/accept`, { expected_revision: 2 })).status, 409);
      assert.equal((await write(owner.privateKey, `${path}/transfer`, { new_owner_fingerprint: fingerprintOf(writer.publicKey), expected_revision: 3 })).status, 200);
      assert.equal((await write(writer.privateKey, `${path}/entries`, { metadata: '{}' })).status, 403);
      assert.equal((await (await request(path)).json()).revision, 4);
    });

    await t.test('restart preserves writers, records and replay protection', async () => {
      await stopServer(server.child);
      server = await startServer(directory);
      const log = await (await request(path)).json();
      assert.equal(log.entry_count, 14);
      assert.equal(log.owner_fingerprint, fingerprintOf(owner.publicKey));
      assert.deepEqual(log.allowed_writers, []);
      assert.equal(log.revision, 4);
      assert.equal(log.pending_transfer.new_owner_fingerprint, fingerprintOf(writer.publicKey));
      assert.equal((await (await request(`${path}/entries?limit=1`)).json()).entries[0].metadata, metadata);
      assert.equal((await request(`${path}/entries`, replay)).status, 409);
      assert.equal((await write(outsider.privateKey, `${path}/entries`, { metadata: '{}' })).status, 403);
      assert.equal((await write(outsider.privateKey, `${path}/transfer/accept`, { expected_revision: 4 })).status, 403);
      const acceptance = await write(writer.privateKey, `${path}/transfer/accept`, { expected_revision: 4 });
      assert.equal(acceptance.status, 200);
      assert.equal((await acceptance.json()).owner_fingerprint, fingerprintOf(writer.publicKey));
      assert.equal((await write(owner.privateKey, `${path}/entries`, { metadata: '{}' })).status, 403);
      assert.equal((await write(owner.privateKey, `${path}/writers`, { allowed_writers: [], expected_revision: 5 }, 'PUT')).status, 403);
      const added = await write(writer.privateKey, `${path}/entries`, { metadata: 'null' });
      assert.equal(added.status, 201);
      assert.equal((await added.json()).sequence, 15);
      assert.match(await (await request(`/p/${pageId}/raw`)).text(), /Existing page regression check/);
    });
    await t.test('explicit retention grants former owner writer access only', async () => {
      const retained = `${path}-retained`;
      assert.equal((await write(owner.privateKey, retained, {})).status, 201);
      assert.equal((await write(owner.privateKey, `${retained}/transfer`, { new_owner_fingerprint: fingerprintOf(writer.publicKey), expected_revision: 0, retain_previous_owner: true })).status, 200);
      assert.equal((await write(writer.privateKey, `${retained}/transfer/accept`, { expected_revision: 1 })).status, 200);
      assert.equal((await write(owner.privateKey, `${retained}/entries`, { metadata: '{}' })).status, 201);
      assert.equal((await write(owner.privateKey, `${retained}/writers`, { allowed_writers: [], expected_revision: 2 }, 'PUT')).status, 403);
    });
    await t.test('transport limits reject chunked oversize and honor a stricter global cap', async () => {
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(40 * 1024).fill(32));
          controller.enqueue(new Uint8Array(40 * 1024).fill(32));
          controller.close();
        },
      });
      const chunked = await request(`${path}/entries`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': randomUUID() }, body, duplex: 'half' });
      assert.equal(chunked.status, 413);
      await stopServer(server.child);
      server = await startServer(directory, { MAX_REQUEST_BODY_BYTES: '1024' });
      const oversized = await write(writer.privateKey, `${path}/entries`, { metadata: JSON.stringify({ text: 'x'.repeat(1100) }) });
      assert.equal(oversized.status, 413);
      assert.equal((await (await request(path)).json()).entry_count, 15);
    });
  } finally {
    if (server) await stopServer(server.child);
    await rm(directory, { recursive: true, force: true });
  }
});
