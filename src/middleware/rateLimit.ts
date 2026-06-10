import { Context, Next } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import { config } from '../config.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Hard cap on distinct tracked keys, to bound memory if an attacker rotates
// identities faster than the cleanup interval.
const MAX_RATE_LIMIT_ENTRIES = 100_000;

// Simple in-memory rate limiter
// For production, consider using Redis or a distributed store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

function getClientIp(c: Context): string {
  // Only trust proxy headers when explicitly running behind a trusted proxy —
  // otherwise X-Forwarded-For is client-spoofable and defeats the limiter.
  if (config.trustProxy) {
    const forwarded = c.req.header('x-forwarded-for');
    if (forwarded) {
      const parts = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
      // Rightmost hop is the one added by our trusted proxy.
      if (parts.length > 0) return parts[parts.length - 1];
    }
    const realIp = c.req.header('x-real-ip');
    if (realIp) return realIp;
  }

  // Fall back to the real socket address.
  try {
    return getConnInfo(c).remote.address || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function rateLimit(c: Context, next: Next) {
  const ip = getClientIp(c);
  const now = Date.now();
  const windowMs = config.rateLimitWindowMs;
  const maxRequests = config.rateLimitMaxRequests;

  let entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt < now) {
    // New window
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    // Bound memory: if the store is saturated, evict expired entries first.
    if (rateLimitStore.size >= MAX_RATE_LIMIT_ENTRIES) {
      for (const [k, e] of rateLimitStore.entries()) {
        if (e.resetAt < now) rateLimitStore.delete(k);
      }
    }
    rateLimitStore.set(ip, entry);
  } else {
    entry.count++;
  }

  // Set rate limit headers
  const remaining = Math.max(0, maxRequests - entry.count);
  c.header('X-RateLimit-Limit', maxRequests.toString());
  c.header('X-RateLimit-Remaining', remaining.toString());
  c.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    c.header('Retry-After', retryAfter.toString());
    return c.json(
      { error: 'Too many requests. Please try again later.' },
      429
    );
  }

  await next();
}
