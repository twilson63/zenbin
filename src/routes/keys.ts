import { Hono } from 'hono';
import { getApiKeyById, checkMonthlyLimit } from '../storage/admin.js';

const keys = new Hono();

// GET /v1/keys/me - Get current API key info
keys.get('/me', async (c) => {
  const apiKey = c.get('apiKey');

  if (!apiKey) {
    return c.json({ error: 'API key not found in context' }, 401);
  }

  const key = getApiKeyById(apiKey);
  if (!key) {
    return c.json({ error: 'API key not found' }, 404);
  }

  const limitCheck = checkMonthlyLimit(apiKey);
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return c.json({
    key_id: key.id,
    type: key.type,
    plan: key.plan,
    name: key.name,
    limit: key.monthly_limit,
    usage: limitCheck.used,
    remaining: limitCheck.remaining,
    period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    reset_at: nextMonth.toISOString(),
    created_at: new Date(key.created_at).toISOString(),
    last_used: key.last_used ? new Date(key.last_used).toISOString() : null,
  });
});

export { keys };