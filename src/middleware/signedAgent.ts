import { Context, Next } from 'hono';
import { config } from '../config.js';
import { getAgentKey, registerUsedNonce, saveAuditLog, touchAgentKey, type AgentKey } from '../storage/db.js';
import { buildCanonicalRequest, verifyBodyDigest, verifyEd25519Signature } from '../utils/httpSignature.js';

interface SignedAgentContext {
  key: AgentKey;
  rawBody: string;
}

interface OptionalSignedHeaders {
  keyId?: string;
  timestamp?: string;
  nonce?: string;
  contentDigest?: string;
  signature?: string;
}

interface RequiredSignedHeaders {
  keyId: string;
  timestamp: string;
  nonce: string;
  contentDigest: string;
  signature: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    signedAgent?: SignedAgentContext;
    rawBody?: string;
  }
}

function getSignedHeaders(c: Context): OptionalSignedHeaders {
  return {
    keyId: c.req.header('X-Zenbin-Key-Id'),
    timestamp: c.req.header('X-Zenbin-Timestamp'),
    nonce: c.req.header('X-Zenbin-Nonce'),
    contentDigest: c.req.header('Content-Digest'),
    signature: c.req.header('X-Zenbin-Signature'),
  };
}

function isWriteMethod(method: string): boolean {
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

function hasAllHeaders(headers: OptionalSignedHeaders): headers is RequiredSignedHeaders {
  return Boolean(
    headers.keyId
      && headers.timestamp
      && headers.nonce
      && headers.contentDigest
      && headers.signature,
  );
}

async function reject(c: Context, status: number, error: string, keyId?: string, metadata?: Record<string, string>) {
  await saveAuditLog({
    action: 'signed_write',
    targetType: 'auth',
    keyId,
    status: 'rejected',
    reason: error,
    metadata,
  });
  return c.json({ error }, status as 401 | 403);
}

export function hasScope(agentKey: AgentKey, scope: string): boolean {
  return agentKey.scopes.includes(scope);
}

export async function requireSignedAgent(c: Context, next: Next) {
  if (!isWriteMethod(c.req.method)) {
    await next();
    return;
  }

  const headers = getSignedHeaders(c);
  if (!hasAllHeaders(headers)) {
    return reject(c, 401, 'Signed request headers are required');
  }

  const agentKey = getAgentKey(headers.keyId);
  if (!agentKey) {
    return reject(c, 401, 'Unknown signing key', headers.keyId);
  }

  if (agentKey.status === 'blocked') {
    return reject(c, 403, 'Signing key is blocked', headers.keyId);
  }

  if (agentKey.status === 'revoked') {
    return reject(c, 403, 'Signing key is revoked', headers.keyId);
  }

  const requestTime = Date.parse(headers.timestamp);
  if (Number.isNaN(requestTime)) {
    return reject(c, 401, 'Invalid signing timestamp', headers.keyId);
  }

  if (Math.abs(Date.now() - requestTime) > config.signedPublishing.maxTimestampSkewMs) {
    return reject(c, 401, 'Signing timestamp is outside the allowed window', headers.keyId);
  }

  const rawBody = await c.req.text();
  if (!verifyBodyDigest(rawBody, headers.contentDigest)) {
    return reject(c, 401, 'Content digest mismatch', headers.keyId);
  }

  const canonical = buildCanonicalRequest({
    method: c.req.method,
    path: c.req.path,
    timestamp: headers.timestamp,
    nonce: headers.nonce,
    contentDigest: headers.contentDigest,
  });

  if (!verifyEd25519Signature({
    publicJwk: agentKey.publicJwk,
    canonical,
    signature: headers.signature,
  })) {
    return reject(c, 401, 'Invalid request signature', headers.keyId);
  }

  const nonceAccepted = await registerUsedNonce(
    headers.keyId,
    headers.nonce,
    new Date(requestTime + config.signedPublishing.nonceTtlMs).toISOString(),
  );

  if (!nonceAccepted) {
    return reject(c, 401, 'Nonce has already been used', headers.keyId);
  }

  await touchAgentKey(headers.keyId);
  c.set('rawBody', rawBody);
  c.set('signedAgent', { key: agentKey, rawBody });
  await next();
}
