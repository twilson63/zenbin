import { Context, Hono } from 'hono';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getAgentKey, listAgentKeys, listAuditLogsForKey, saveAgentKey, saveAuditLog, updateAgentKeyStatus } from '../storage/db.js';

const adminKeys = new Hono();

adminKeys.use('*', requireAdmin);

adminKeys.get('/', (c) => {
  return c.json({ keys: listAgentKeys() });
});

adminKeys.post('/', async (c) => {
  let body: {
    keyId?: string;
    publicJwk?: Record<string, string | boolean | undefined>;
    scopes?: string[];
    status?: 'active' | 'blocked' | 'revoked';
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.keyId || !body.publicJwk) {
    return c.json({ error: 'keyId and publicJwk are required' }, 400);
  }

  const existing = getAgentKey(body.keyId);
  if (existing) {
    return c.json({ error: `Signing key '${body.keyId}' already exists` }, 409);
  }

  const key = await saveAgentKey({
    keyId: body.keyId,
    publicJwk: body.publicJwk,
    scopes: body.scopes,
    status: body.status,
  });

  await saveAuditLog({
    action: 'admin_create_key',
    targetType: 'agent_key',
    keyId: key.keyId,
    status: 'accepted',
  });

  return c.json(key, 201);
});

adminKeys.get('/:keyId', (c) => {
  const key = getAgentKey(c.req.param('keyId'));
  if (!key) {
    return c.json({ error: 'Signing key not found' }, 404);
  }

  return c.json(key);
});

adminKeys.get('/:keyId/activity', (c) => {
  const keyId = c.req.param('keyId');
  const key = getAgentKey(keyId);
  if (!key) {
    return c.json({ error: 'Signing key not found' }, 404);
  }

  return c.json({
    key,
    activity: listAuditLogsForKey(keyId),
  });
});

async function changeKeyStatus(
  c: Context,
  status: 'active' | 'blocked' | 'revoked',
) {
  let body: { reason?: string } = {};

  try {
    if (c.req.header('Content-Length') !== '0') {
      body = await c.req.json();
    }
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const keyId = c.req.param('keyId')!;
  const updated = await updateAgentKeyStatus(keyId, status, body.reason);

  if (!updated) {
    return c.json({ error: 'Signing key not found' }, 404);
  }

  await saveAuditLog({
    action: `admin_${status}_key`,
    targetType: 'agent_key',
    keyId,
    status: 'accepted',
    reason: body.reason,
  });

  return c.json(updated);
}

adminKeys.post('/:keyId/block', (c) => changeKeyStatus(c, 'blocked'));
adminKeys.post('/:keyId/unblock', (c) => changeKeyStatus(c, 'active'));
adminKeys.post('/:keyId/revoke', (c) => changeKeyStatus(c, 'revoked'));

export { adminKeys };
