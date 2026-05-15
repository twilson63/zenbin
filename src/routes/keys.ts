import { Hono } from 'hono';
import { getAgentKey, saveAgentKey, saveAuditLog } from '../storage/db.js';
import { validateEd25519PublicJwk } from '../utils/httpSignature.js';

const keys = new Hono();

keys.post('/register', async (c) => {
  let body: {
    keyId?: string;
    publicJwk?: Record<string, string | boolean | undefined>;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.keyId || typeof body.keyId !== 'string') {
    return c.json({ error: 'keyId is required' }, 400);
  }

  if (!body.publicJwk || typeof body.publicJwk !== 'object') {
    return c.json({ error: 'publicJwk is required' }, 400);
  }

  const trimmedKeyId = body.keyId.trim();
  if (!trimmedKeyId) {
    return c.json({ error: 'keyId is required' }, 400);
  }

  if (trimmedKeyId.length > 128) {
    return c.json({ error: 'keyId must be 128 characters or less' }, 400);
  }

  if (!/^[A-Za-z0-9._:-]+$/.test(trimmedKeyId)) {
    return c.json({ error: 'keyId may only contain letters, numbers, dots, underscores, colons, and hyphens' }, 400);
  }

  if (!validateEd25519PublicJwk(body.publicJwk)) {
    return c.json({ error: 'publicJwk must be a valid Ed25519 public JWK' }, 400);
  }

  const existing = getAgentKey(trimmedKeyId);
  if (existing) {
    return c.json({ error: `Signing key '${trimmedKeyId}' already exists` }, 409);
  }

  const key = await saveAgentKey({
    keyId: trimmedKeyId,
    publicJwk: body.publicJwk,
    scopes: [],
    status: 'active',
  });

  await saveAuditLog({
    action: 'self_register_key',
    targetType: 'agent_key',
    keyId: key.keyId,
    status: 'accepted',
    metadata: {
      self_service: true,
    },
  });

  return c.json({
    keyId: key.keyId,
    status: key.status,
    scopes: key.scopes,
    created_at: key.created_at,
    updated_at: key.updated_at,
  }, 201);
});

// GET /:keyId/jwk — Get the public JWK for a signing key (provenance verification)
keys.get('/:keyId/jwk', (c) => {
  const keyId = decodeURIComponent(c.req.param('keyId'));
  const agentKey = getAgentKey(keyId);

  if (!agentKey) {
    return c.json({ error: 'Key not found' }, 404);
  }

  if (agentKey.status === 'revoked') {
    return c.json({ error: 'Key has been revoked' }, 410);
  }

  return c.json({
    keyId: agentKey.keyId,
    publicJwk: agentKey.publicJwk,
    status: agentKey.status,
    created_at: agentKey.created_at,
  });
});

export { keys };
