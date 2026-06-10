import { Hono } from 'hono';
import { ErrorCodes, errorResponse } from '../errors.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validateEd25519PublicJwk } from '../utils/httpSignature.js';
import { computeFingerprint } from '../utils/fingerprint.js';
import type { Services } from '../services/container.js';

const adminKeys = new Hono();

// All admin key routes require admin authentication
adminKeys.use('*', requireAdmin);

function getServices(c: any): Services {
  return c.get('services')!;
}

// GET /v1/admin/keys — List all agent keys
adminKeys.get('/', async (c) => {
  const services = getServices(c);
  const keys = services.keys.list();
  return c.json({ keys });
});

// POST /v1/admin/keys — Register a new agent key (admin)
adminKeys.post('/', async (c) => {
  let body: {
    keyId?: string;
    publicJwk?: Record<string, string | boolean | undefined>;
    scopes?: string[];
    status?: string;
  };

  try {
    body = await c.req.json();
  } catch {
    return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400);
  }

  if (!body.keyId || typeof body.keyId !== 'string') {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'keyId is required', 400);
  }

  if (!body.publicJwk || typeof body.publicJwk !== 'object') {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'publicJwk is required', 400);
  }

  const trimmedKeyId = body.keyId.trim();
  if (!trimmedKeyId) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'keyId is required', 400);
  }
  if (trimmedKeyId.length > 128) {
    return errorResponse(ErrorCodes.PAGE_INVALID_ID, 'keyId must be 128 characters or less', 400);
  }
  if (!/^[A-Za-z0-9._:-]+$/.test(trimmedKeyId)) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'keyId may only contain letters, numbers, dots, underscores, colons, and hyphens', 400);
  }

  // Validate the JWK the same way self-service registration does, so an
  // admin-registered key has a usable key and a fingerprint (required to
  // receive directed pages and to verify signatures).
  if (!validateEd25519PublicJwk(body.publicJwk)) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'publicJwk must be a valid Ed25519 public JWK', 400);
  }

  const services = getServices(c);
  const existing = services.keys.get(trimmedKeyId);
  if (existing) {
    return errorResponse(ErrorCodes.KEY_ALREADY_EXISTS, `Signing key '${trimmedKeyId}' already exists`, 409);
  }

  const key = await services.keys.save({
    keyId: trimmedKeyId,
    publicJwk: body.publicJwk as Record<string, string | boolean | undefined>,
    publicKeyFingerprint: computeFingerprint(body.publicJwk as { x: string }),
    scopes: body.scopes || [],
    status: (body.status as 'active' | 'blocked' | 'revoked') || 'active',
  });

  await services.audit.save({
    action: 'admin_register_key',
    targetType: 'agent_key',
    keyId: key.keyId,
    status: 'accepted',
  });

  return c.json({
    keyId: key.keyId,
    publicJwk: key.publicJwk,
    status: key.status,
    scopes: key.scopes,
    created_at: key.created_at,
    updated_at: key.updated_at,
  }, 201);
});

// PATCH /v1/admin/keys/:keyId — Update key status (block/unblock/revoke)
adminKeys.patch('/:keyId', async (c) => {
  const keyId = c.req.param('keyId');
  const services = getServices(c);

  let body: { status?: string; reason?: string };
  try {
    body = await c.req.json();
  } catch {
    return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400);
  }

  if (!body.status || !['active', 'blocked', 'revoked'].includes(body.status)) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'status must be one of: active, blocked, revoked', 400);
  }

  const existing = services.keys.get(keyId);
  if (!existing) {
    return errorResponse(ErrorCodes.KEY_NOT_FOUND, 'Key not found', 404);
  }

  const updated = await services.keys.updateStatus(keyId, body.status as 'active' | 'blocked' | 'revoked', body.reason);

  await services.audit.save({
    action: `admin_${body.status}_key`,
    targetType: 'agent_key',
    keyId,
    status: 'accepted',
    reason: body.reason,
  });

  return c.json({
    keyId: updated!.keyId,
    status: updated!.status,
    updated_at: updated!.updated_at,
  });
});

// GET /v1/admin/keys/:keyId — Get a single key
adminKeys.get('/:keyId', (c) => {
  const keyId = c.req.param('keyId');
  const services = getServices(c);
  const key = services.keys.get(keyId);
  if (!key) {
    return errorResponse(ErrorCodes.KEY_NOT_FOUND, 'Signing key not found', 404);
  }
  return c.json(key);
});

// GET /v1/admin/keys/:keyId/activity — Get key with audit logs
adminKeys.get('/:keyId/activity', (c) => {
  const keyId = c.req.param('keyId');
  const services = getServices(c);
  const key = services.keys.get(keyId);
  if (!key) {
    return errorResponse(ErrorCodes.KEY_NOT_FOUND, 'Signing key not found', 404);
  }
  const activity = services.audit.listForKey(keyId);
  return c.json({ key, activity });
});

// GET /v1/admin/keys/:keyId/audit — Get audit logs for a key
adminKeys.get('/:keyId/audit', async (c) => {
  const keyId = c.req.param('keyId');
  const services = getServices(c);

  const existing = services.keys.get(keyId);
  if (!existing) {
    return errorResponse(ErrorCodes.KEY_NOT_FOUND, 'Key not found', 404);
  }

  const logs = services.audit.listForKey(keyId);
  return c.json({ logs });
});

// POST /v1/admin/keys/:keyId/block — Block a key
adminKeys.post('/:keyId/block', (c) => changeKeyStatus(c, 'blocked'));

// POST /v1/admin/keys/:keyId/unblock — Unblock a key
adminKeys.post('/:keyId/unblock', (c) => changeKeyStatus(c, 'active'));

// POST /v1/admin/keys/:keyId/revoke — Revoke a key
adminKeys.post('/:keyId/revoke', (c) => changeKeyStatus(c, 'revoked'));

async function changeKeyStatus(
  c: any,
  status: 'active' | 'blocked' | 'revoked',
) {
  let body: { reason?: string } = {};
  try {
    if (c.req.header('Content-Length') !== '0') {
      body = await c.req.json();
    }
  } catch {
    return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const keyId = c.req.param('keyId')!;
  const services = getServices(c);
  const updated = await services.keys.updateStatus(keyId, status, body.reason);

  if (!updated) {
    return errorResponse(ErrorCodes.KEY_NOT_FOUND, 'Signing key not found', 404);
  }

  await services.audit.save({
    action: `admin_${status}_key`,
    targetType: 'agent_key',
    keyId,
    status: 'accepted',
    reason: body.reason,
  });

  return c.json(updated);
}

export { adminKeys };