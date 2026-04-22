import { Context, Next } from 'hono';
import { config } from '../config.js';

export async function requireAdmin(c: Context, next: Next) {
  const token = c.req.header('X-Admin-Token') || c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!token || token !== config.admin.token) {
    return c.json({ error: 'Admin authentication required' }, 401);
  }

  await next();
}
