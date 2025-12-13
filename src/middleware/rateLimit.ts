import { Context, Next } from 'hono';
import { config } from '../config.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

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
