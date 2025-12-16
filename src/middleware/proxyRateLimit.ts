import { Context, Next } from 'hono';
import { config } from '../config.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Separate in-memory rate limiter for proxy endpoint
// For production, consider using Redis or a distributed store
const proxyRateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of proxyRateLimitStore.entries()) {
    if (entry.resetAt < now) {
      proxyRateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

function getClientIp(c: Context): string {
  // Check common proxy headers
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = c.req.header('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default (in production, you'd want the actual IP)
  return 'unknown';
}

export async function proxyRateLimit(c: Context, next: Next) {
  const ip = getClientIp(c);
  const key = `proxy:${ip}`;
  const now = Date.now();
  const windowMs = config.proxyRateLimitWindowMs ?? 60000;
  const maxRequests = config.proxyRateLimitMax ?? 5;

  let entry = proxyRateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    proxyRateLimitStore.set(key, entry);
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
