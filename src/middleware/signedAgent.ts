import { Context, Next } from 'hono';
import { config } from '../config.js';
import { ErrorCodes } from '../errors.js';
import { getAgentKey, registerUsedNonce, saveAuditLog, touchAgentKey, type AgentKey } from '../storage/db.js';
import { buildCanonicalRequest, verifyBodyDigest, verifyEd25519Signature } from '../utils/httpSignature.js';

export interface SignedAgentContext {
  key: AgentKey;
  rawBody: string;
  contentDigest: string;
  signature: string;
  timestamp: string;
  nonce: string;
  method: string;
  path: string;
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
    services?: import('../services/container.js').Services;
  }
}

function getSignedHeaders(c: Context): OptionalSignedHeaders {
  // CAP headers take priority, X-Zenbin headers are legacy fallback
  return {
    keyId: c.req.header('CAP-Key-Id') || c.req.header('X-Zenbin-Key-Id'),
    timestamp: c.req.header('CAP-Timestamp') || c.req.header('X-Zenbin-Timestamp'),
    nonce: c.req.header('CAP-Nonce') || c.req.header('X-Zenbin-Nonce'),
    contentDigest: c.req.header('CAP-Digest') || c.req.header('Content-Digest'),
    signature: c.req.header('CAP-Signature') || c.req.header('X-Zenbin-Signature'),
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

async function reject(c: Context, status: number, error: string, keyId?: string, metadata?: Record<string, string>, errorCode?: string) {
  await saveAuditLog({
    action: 'signed_write',
    targetType: 'auth',
    keyId,
    status: 'rejected',
    reason: error,
    metadata,
  });
  const body: Record<string, unknown> = {
    error,
    error_code: errorCode || 'UNKNOWN',
  };
  return c.json(body, status as 401 | 403);
}

export function hasScope(agentKey: AgentKey, scope: string): boolean {
  return agentKey.scopes.includes(scope);
}

export async function requireSignedAgent(c: Context, next: Next) {
  if (!isWriteMethod(c.req.method)) {
    await next();
    return;
  }

  return verifySignedRequest(c, next);
}

/**
 * Verify signed request for GET endpoints (listing, etc.)
 * Same as requireSignedAgent but doesn't skip for non-write methods.
 */
export async function requireSignedAgentForGet(c: Context, next: Next) {
  return verifySignedRequest(c, next);
}

async function verifySignedRequest(c: Context, next: Next) {
  const result = await verifySignedAgent(c);
  if (result instanceof Response) {
    return result;
  }

  await next();
}

export async function verifySignedAgent(c: Context): Promise<SignedAgentContext | Response> {
  const headers = getSignedHeaders(c);
  if (!hasAllHeaders(headers)) {
    return reject(c, 401, 'Signed request headers are required', undefined, undefined, ErrorCodes.SIGNING_HEADERS_REQUIRED);
  }

  const agentKey = getAgentKey(headers.keyId);
  if (!agentKey) {
    return reject(c, 401, 'Unknown signing key', headers.keyId, undefined, ErrorCodes.UNKNOWN_SIGNING_KEY);
  }

  if (agentKey.status === 'blocked') {
    return reject(c, 403, 'Signing key is blocked', headers.keyId, undefined, ErrorCodes.KEY_BLOCKED);
  }

  if (agentKey.status === 'revoked') {
    return reject(c, 403, 'Signing key is revoked', headers.keyId, undefined, ErrorCodes.KEY_REVOKED);
  }

  const requestTime = Date.parse(headers.timestamp);
  if (Number.isNaN(requestTime)) {
    return reject(c, 401, 'Invalid signing timestamp', headers.keyId, undefined, ErrorCodes.INVALID_TIMESTAMP);
  }

  if (Math.abs(Date.now() - requestTime) > config.signedPublishing.maxTimestampSkewMs) {
    return reject(c, 401, 'Signing timestamp is outside the allowed window', headers.keyId, undefined, ErrorCodes.INVALID_TIMESTAMP);
  }

  const rawBody = await c.req.text();
  if (!verifyBodyDigest(rawBody, headers.contentDigest)) {
    return reject(c, 401, 'Content digest mismatch', headers.keyId, undefined, ErrorCodes.CONTENT_DIGEST_MISMATCH);
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
    return reject(c, 401, 'Invalid request signature', headers.keyId, undefined, ErrorCodes.INVALID_SIGNATURE);
  }

  const nonceAccepted = await registerUsedNonce(
    headers.keyId,
    headers.nonce,
    new Date(requestTime + config.signedPublishing.nonceTtlMs).toISOString(),
  );

  if (!nonceAccepted) {
    return reject(c, 401, 'Nonce has already been used', headers.keyId, undefined, ErrorCodes.NONCE_ALREADY_USED);
  }

  await touchAgentKey(headers.keyId);
  c.set('rawBody', rawBody);
  c.set('signedAgent', {
    key: agentKey,
    rawBody,
    contentDigest: headers.contentDigest,
    signature: headers.signature,
    timestamp: headers.timestamp,
    nonce: headers.nonce,
    method: c.req.method,
    path: c.req.path,
  });

  return c.get('signedAgent')!;
}
