import type { Context } from 'hono';
import { checkAuthRateLimit, recordFailedAttempt, resetAuthAttempts } from './authRateLimit.js';
import { verifySignedAgent } from './signedAgent.js';
import type { Page } from '../storage/db.js';

export type SignToReadResult =
  | { kind: 'not-applicable' }
  | { kind: 'authorized' }
  | { kind: 'response'; response: Response };

function getSigningKeyId(c: Context): string | undefined {
  return c.req.header('CAP-Key-Id') || c.req.header('X-Zenbin-Key-Id') || undefined;
}

function signToReadRateLimitScope(c: Context, pageId: string): string | undefined {
  const keyId = getSigningKeyId(c);
  return keyId ? `sign-to-read:${pageId}:${keyId}` : undefined;
}

export function hasSignedReadHeaders(c: Context): boolean {
  return Boolean(
    getSigningKeyId(c)
      && (c.req.header('CAP-Timestamp') || c.req.header('X-Zenbin-Timestamp'))
      && (c.req.header('CAP-Nonce') || c.req.header('X-Zenbin-Nonce'))
      && (c.req.header('CAP-Digest') || c.req.header('Content-Digest'))
      && (c.req.header('CAP-Signature') || c.req.header('X-Zenbin-Signature')),
  );
}

/**
 * Verify optional sign-to-read access control for a rendered page.
 *
 * Return values:
 * - not-applicable: page is not sign-to-read, or caller should fall through to password/token auth
 * - authorized: matching signed GET authorizes the read
 * - response: auth failed and this response should be returned
 */
export async function verifySignToRead(c: Context, page: Page, pageId: string): Promise<SignToReadResult> {
  if (!page.auth?.signToRead) {
    return { kind: 'not-applicable' };
  }

  if (!hasSignedReadHeaders(c)) {
    if (!page.auth.passwordHash && !page.auth.urlTokenHash) {
      // Do not page-lock on unsigned requests. A spammer should not be able to
      // deny access to the legitimate recipient by omitting signing headers.
      return { kind: 'response', response: c.json({ error: 'Signature required', hint: 'sign-to-read' }, 401) };
    }
    return { kind: 'not-applicable' };
  }

  const rateLimitScope = signToReadRateLimitScope(c, pageId);
  if (rateLimitScope) {
    const rateCheck = checkAuthRateLimit(rateLimitScope);
    if (!rateCheck.allowed) {
      c.header('Retry-After', String(rateCheck.retryAfter));
      return { kind: 'response', response: c.json({ error: 'Too many failed authentication attempts' }, 429) };
    }
  }

  const result = await verifySignedAgent(c);
  if (result instanceof Response) {
    if (rateLimitScope) recordFailedAttempt(rateLimitScope);
    return { kind: 'response', response: result };
  }

  if (result.key.publicKeyFingerprint !== page.recipientKeyId) {
    if (rateLimitScope) recordFailedAttempt(rateLimitScope);
    return { kind: 'response', response: c.json({ error: 'Not authorized' }, 401) };
  }

  if (rateLimitScope) resetAuthAttempts(rateLimitScope);
  return { kind: 'authorized' };
}
