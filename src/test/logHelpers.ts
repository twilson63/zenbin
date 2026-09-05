import { randomUUID } from 'node:crypto';
import { saveAgentKey } from '../storage/db.js';
import { createSignedHeaders, generateTestSigner } from './helpers/signing.js';

const agents: ReturnType<typeof generateTestSigner>[] = [];
export function createAgent() {
  const agent = generateTestSigner(`log-agent-${randomUUID()}`);
  agents.push(agent);
  return {
    ...agent,
    fingerprint: agent.publicKeyFingerprint,
    identity(nonce = randomUUID(), timestamp = Date.now()) {
      return { keyId: agent.keyId, fingerprint: agent.publicKeyFingerprint, nonce, timestamp };
    },
    request(path: string, data: unknown, options: { nonce?: string; timestamp?: string; method?: string } = {}) {
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      const method = options.method ?? 'POST';
      const headers = new Headers(createSignedHeaders({ signer: agent, method, path, body, nonce: options.nonce ?? randomUUID(), timestamp: options.timestamp }));
      headers.set('Content-Type', 'application/json');
      return { method, body, headers };
    },
  };
}
export async function registerLogAgents() {
  for (const agent of agents) await saveAgentKey({ keyId: agent.keyId, publicJwk: agent.publicJwk, publicKeyFingerprint: agent.publicKeyFingerprint, scopes: [], status: 'active' });
}
