import { Hono } from 'hono';
import { verifyEd25519Signature, buildCanonicalRequest, decodeBase64Url } from '../utils/httpSignature.js';
import { createHash } from 'crypto';
import { ErrorCodes, errorResponse } from '../errors.js';
import type { Services } from '../services/container.js';

type StoredJwk = Record<string, string | boolean | undefined>;

const verify = new Hono();

function getServices(c: any): Services {
  return c.get('services')!;
}

interface VerifyRequestBody {
  keyId: string;
  content: string;
  signature: string;
  contentDigest?: string;
  timestamp?: string;
  nonce?: string;
  method?: string;
  path?: string;
}

// POST /v1/verify — Verify a signature against content and a public key
verify.post('/', async (c) => {
  let body: VerifyRequestBody;
  try {
    body = await c.req.json();
  } catch {
    return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400);
  }

  if (!body.keyId || typeof body.keyId !== 'string') {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'keyId is required', 400);
  }

  if (!body.content || typeof body.content !== 'string') {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'content is required', 400);
  }

  if (!body.signature || typeof body.signature !== 'string') {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'signature is required', 400);
  }

  const services = getServices(c);
  const agentKey = services.keys.get(body.keyId);

  if (!agentKey) {
    return errorResponse(ErrorCodes.KEY_NOT_FOUND, 'Key not found', 404);
  }

  if (agentKey.status === 'revoked') {
    return errorResponse(ErrorCodes.KEY_REVOKED, 'Key has been revoked', 410, { keyId: body.keyId });
  }

  if (agentKey.status === 'blocked') {
    return errorResponse(ErrorCodes.KEY_BLOCKED, 'Key has been blocked', 403, { keyId: body.keyId });
  }

  // Build the canonical request for verification
  // If timestamp, nonce, method, and path are provided, use the full canonical format
  // Otherwise, verify the signature directly against the content
  const method = (body.method || 'POST').toUpperCase();
  const path = body.path || '/v1/pages/verify';
  const timestamp = body.timestamp || new Date().toISOString();
  const nonce = body.nonce || 'verify';

  let contentDigest: string;
  if (body.contentDigest) {
    contentDigest = body.contentDigest;
  } else {
    // Compute SHA-256 digest of the content
    const hash = createHash('sha256').update(body.content).digest('base64');
    contentDigest = `sha-256=:${hash}:`;
  }

  // Verify the content digest matches
  const expectedDigest = createHash('sha256').update(body.content).digest('base64');
  const providedDigest = contentDigest.replace(/^sha-256=:|:$/g, '');
  if (providedDigest !== expectedDigest) {
    return c.json({
      valid: false,
      error: 'Content digest mismatch',
      keyId: body.keyId,
    }, 400);
  }

  const canonical = buildCanonicalRequest({
    method,
    path,
    timestamp,
    nonce,
    contentDigest,
  });

  const isValid = verifyEd25519Signature({
    publicJwk: agentKey.publicJwk as StoredJwk,
    canonical,
    signature: body.signature,
  });

  return c.json({
    valid: isValid,
    keyId: body.keyId,
    verifiedAt: new Date().toISOString(),
    ...(isValid ? {} : { error: 'Signature verification failed' }),
  });
});

export { verify };