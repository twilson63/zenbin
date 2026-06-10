import { Context, Next } from 'hono';
import crypto from 'node:crypto';
import { config } from '../config.js';

/** Constant-time string compare via fixed-length SHA-256 digests. */
function safeEqual(a: string, b: string): boolean {
  const ah = crypto.createHash('sha256').update(a).digest();
  const bh = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}

export async function requireAdmin(c: Context, next: Next) {
  const token = c.req.header('X-Admin-Token') || c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  const expected = config.admin.token;

  // Fail closed when no admin token is configured; otherwise compare in
  // constant time so the long-lived admin secret is not leaked via timing.
  if (!expected || !token || !safeEqual(token, expected)) {
    return c.json({ error: 'Admin authentication required' }, 401);
  }

  await next();
}
