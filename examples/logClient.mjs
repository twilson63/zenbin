import { createHash, generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function fingerprintOf(publicKey) {
  return createHash('sha256').update(Buffer.from(publicKey.export({ format: 'jwk' }).x, 'base64url')).digest('base64url');
}

/** Use an existing registered keyId and private KeyObject; never transmit private key material. */
export function signLogRequest(keyId, privateKey, path, data, options = {}) {
  const body = JSON.stringify(data);
  const method = options.method ?? 'POST';
  const timestamp = options.timestamp ?? new Date().toISOString();
  const nonce = options.nonce ?? randomUUID();
  const digest = `sha-256=:${createHash('sha256').update(body).digest('base64')}:`;
  const message = [method, path, timestamp, nonce, digest].join('\n');
  return {
    method, body,
    headers: {
      'Content-Type': 'application/json', 'CAP-Version': '0.1', 'CAP-Key-Id': keyId,
      'CAP-Timestamp': timestamp, 'CAP-Nonce': nonce, 'CAP-Digest': digest,
      'CAP-Signature': `:${sign(null, Buffer.from(message), privateKey).toString('base64url')}:`,
    },
  };
}

export async function registerDemoAgent(baseUrl) {
  const keys = generateKeyPairSync('ed25519');
  const keyId = `log-demo-${randomUUID()}`;
  const response = await fetch(new URL('/v1/keys/register', baseUrl), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyId, publicJwk: keys.publicKey.export({ format: 'jwk' }) }),
  });
  if (!response.ok) throw new Error(`Registration failed (${response.status})`);
  return { ...keys, keyId, fingerprint: fingerprintOf(keys.publicKey) };
}

// This demo registers disposable keys in the selected server. Use lasting keys for real logs.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const baseUrl = process.argv[2] ?? 'http://localhost:3000';
  const owner = await registerDemoAgent(baseUrl);
  const writer = await registerDemoAgent(baseUrl);
  const path = `/v1/logs/demo-${randomUUID()}`;
  async function mutate(agent, target, data, method = 'POST') {
    const response = await fetch(new URL(target, baseUrl), signLogRequest(agent.keyId, agent.privateKey, target, data, { method }));
    if (!response.ok) throw new Error(`Log request failed (${response.status}): ${await response.text()}`);
    return response.json();
  }
  let log = await mutate(owner, path, {});
  log = await mutate(owner, `${path}/writers`, { allowed_writers: [writer.fingerprint], expected_revision: log.revision }, 'PUT');
  await mutate(writer, `${path}/entries`, { metadata: JSON.stringify({ event: 'started' }) });
  log = await mutate(owner, `${path}/transfer`, { new_owner_fingerprint: writer.fingerprint, expected_revision: log.revision });
  await mutate(writer, `${path}/transfer/accept`, { expected_revision: log.revision });
  const response = await fetch(new URL(`${path}/entries?after=0&limit=50`, baseUrl));
  if (!response.ok) throw new Error(`Read failed (${response.status})`);
  console.log(JSON.stringify({ url: new URL(path, baseUrl).href, ...await response.json() }, null, 2));
}
