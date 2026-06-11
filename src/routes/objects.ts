/**
 * CAP-Tree v0.3 object endpoints (PRD § 5.1 / § 5.3).
 *
 * POST /v1/objects        — publish an envelope or a raw blob (signed request).
 * GET  /v1/objects/{hash} — retrieve, unauthenticated, immutable + cacheable.
 *
 * Routes are thin: all validation/storage/indexing lives in ObjectService.
 */
import { Context, Hono } from 'hono';
import { config } from '../config.js';
import { requireSignedAgent } from '../middleware/signedAgent.js';
import { ErrorCodes, errorResponse } from '../errors.js';
import { HASH_RE, type SignatureEnvelope } from 'cap-tree-core';
import type { Services } from '../services/container.js';

const objects = new Hono();

const CAP_CONTENT_TYPE = 'application/vnd.cap-tree+json';

function getServices(c: Context): Services {
  return c.get('services')!;
}
function getSignedKey(c: Context): string {
  const signedAgent = c.get('signedAgent');
  if (!signedAgent) throw new Error('Signed agent context missing');
  return signedAgent.key.keyId;
}

// POST /v1/objects — publish (signed). Envelope or blob by Content-Type.
objects.post('/', requireSignedAgent, async (c) => {
  const keyId = getSignedKey(c);
  const services = getServices(c);
  const contentType = c.req.header('content-type') || '';

  // Objects consume monthly page quota 1:1 (HB § 7 — content-blind). Reserve
  // optimistically, release on anything that is not a fresh 201.
  const reservation = services.pages.reservePageQuota(keyId);
  if (!reservation.allowed) {
    return c.json({
      error: reservation.reason,
      plan: reservation.plan,
      upgradeUrl: `${config.baseUrl}/v1/billing/checkout?plan=pro`,
    }, 402);
  }

  let result;
  if (contentType.includes(CAP_CONTENT_TYPE)) {
    let env: SignatureEnvelope;
    try {
      env = JSON.parse(c.get('rawBody') || (await c.req.text())) as SignatureEnvelope;
    } catch {
      services.pages.releasePageQuota(keyId);
      return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON envelope', 400);
    }
    result = await services.objects.publishEnvelope(env, keyId);
  } else if (contentType.includes('application/octet-stream')) {
    const bytes = new Uint8Array(await c.req.arrayBuffer());
    result = await services.objects.publishBlob(bytes, keyId);
  } else {
    services.pages.releasePageQuota(keyId);
    return errorResponse(
      ErrorCodes.INVALID_REQUEST,
      `Content-Type must be ${CAP_CONTENT_TYPE} or application/octet-stream`,
      415,
    );
  }

  if (result.status !== 'created') {
    services.pages.releasePageQuota(keyId);
  }

  if (result.status === 'error') {
    return errorResponse(result.code, result.message, result.httpStatus, {
      ...(result.errors ? { errors: result.errors } : {}),
      ...(result.extra ?? {}),
    });
  }

  const stored = result.stored;
  return c.json(
    {
      hash: stored.hash,
      url: `${config.baseUrl}/v1/objects/${stored.hash}`,
      received: stored.created_at,
    },
    result.status === 'created' ? 201 : 200,
  );
});

// GET /v1/objects/{hash} — retrieve (open). Content-addressed → immutable cache.
objects.get('/:hash', (c) => {
  const hash = c.req.param('hash');
  if (!HASH_RE.test(hash)) {
    return errorResponse(ErrorCodes.OBJECT_NOT_FOUND, 'Object not found', 404);
  }
  const services = getServices(c);
  const stored = services.objects.get(hash);
  if (!stored) {
    return errorResponse(ErrorCodes.OBJECT_NOT_FOUND, 'Object not found', 404);
  }

  c.header('ETag', `"${hash}"`);
  c.header('Cache-Control', 'public, max-age=31536000, immutable');

  if (stored.kind === 'blob') {
    c.header('Content-Type', 'application/octet-stream');
    return c.body(Buffer.from(stored.blobBase64 ?? '', 'base64'));
  }

  c.header('Content-Type', CAP_CONTENT_TYPE);
  return c.body(services.objects.envelopeBytes(stored));
});

export { objects };
