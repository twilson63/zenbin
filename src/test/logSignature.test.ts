import { beforeAll, describe, expect, it } from 'vitest';
import { createAgent, registerLogAgents } from './logHelpers.js';
import { verifyLogSignature } from '../utils/logSignature.js';
import { updateAgentKeyStatus } from '../storage/db.js';
import { config } from '../config.js';
const agent = createAgent();
const blocked = createAgent();
const revoked = createAgent();
const path = '/v1/logs/activity';
beforeAll(async () => {
  await registerLogAgents();
  await updateAgentKeyStatus(blocked.keyId, 'blocked');
  await updateAgentKeyStatus(revoked.keyId, 'revoked');
});
function verify(request: ReturnType<typeof agent.request>, target = path, now = Date.now()) {
  return verifyLogSignature(request.method, target, request.headers, Buffer.from(request.body), now);
}
describe('Registered log signatures', () => {
  it('uses existing ZenBin signer and fingerprint, including CAP aliases', () => {
    const req = agent.request(path, {});
    expect(verify(req)).toMatchObject({ fingerprint: agent.fingerprint, keyId: agent.keyId });
    for (const [legacy, cap] of [['X-Zenbin-Key-Id', 'CAP-Key-Id'], ['X-Zenbin-Timestamp', 'CAP-Timestamp'], ['X-Zenbin-Nonce', 'CAP-Nonce'], ['Content-Digest', 'CAP-Digest'], ['X-Zenbin-Signature', 'CAP-Signature']]) {
      req.headers.set(cap, req.headers.get(legacy)!);
      req.headers.delete(legacy);
    }
    expect(verify(req)).toMatchObject({ fingerprint: agent.fingerprint });
    req.headers.set('CAP-Key-Id', 'unknown');
    req.headers.set('X-Zenbin-Key-Id', agent.keyId);
    expect(verify(req)).toMatchObject({ status: 401 });
  });
  it.each(['body', 'method', 'path', 'key', 'digest', 'signature', 'nonce', 'timestamp'])('rejects tampered %s', (field) => {
    const req = agent.request(path, {});
    if (field === 'body') req.body = '{ "allowed_writers": [] }';
    if (field === 'method') req.method = 'DELETE';
    if (field === 'key') req.headers.set('X-Zenbin-Key-Id', blocked.keyId);
    if (field === 'digest') req.headers.set('Content-Digest', 'sha-256=:wrong:');
    if (field === 'signature') req.headers.set('X-Zenbin-Signature', `:${'A'.repeat(86)}:`);
    if (field === 'nonce') req.headers.set('X-Zenbin-Nonce', 'different-valid-nonce');
    if (field === 'timestamp') req.headers.set('X-Zenbin-Timestamp', new Date(Date.now() + 1000).toISOString());
    expect(verify(req, field === 'path' ? path + '/entries' : path)).toHaveProperty('error');
  });
  it.each([blocked, revoked])('rejects unavailable key $keyId', (key) => {
    expect(verify(key.request(path, {}))).toMatchObject({ status: 403 });
  });
  it.each(['unknown', ''])('rejects missing/unknown registered key %s', (keyId) => {
    const req = agent.request(path, {}); req.headers.set('X-Zenbin-Key-Id', keyId);
    expect(verify(req)).toMatchObject({ status: 401 });
  });
  it.each([-1, 1])('rejects stale or too-far future timestamps (%i)', (direction) => {
    const now = Date.now();
    expect(verify(agent.request(path, {}, { timestamp: new Date(now + direction * (config.signedPublishing.maxTimestampSkewMs + 1)).toISOString() }), path, now)).toMatchObject({ status: 401 });
  });
  it.each(['short', 'x'.repeat(129), 'not allowed nonce'])('rejects invalid nonce %s', (nonce) => {
    expect(verify(agent.request(path, {}, { nonce }))).toMatchObject({ status: 401 });
  });
});
