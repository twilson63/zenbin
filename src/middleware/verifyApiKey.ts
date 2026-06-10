// JWT Verification Middleware for ZenBin
// Verifies API keys from the ZenBin Portal

import { Context, Next } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// JWT secret must be configured via ZENBIN_JWT_SECRET environment variable.
// If not set, JWT-based API key verification is disabled and requests fall through
// to the free tier handler. This is intentional — the primary auth model is
// Ed25519 signed requests, not JWT.
const ZENBIN_JWT_SECRET = process.env.ZENBIN_JWT_SECRET || '';

// In-memory usage tracking (replace with Redis for production)
const freeUsage = new Map<string, { count: number; resetTime: number }>();

interface JwtPayload {
  sub: string;
  email: string;
  plan: string;
  monthlyRequests: number;
  apiKeyId: string;
}

// Extend Hono's context variables
declare module 'hono' {
  interface ContextVariableMap {
    user?: JwtPayload & { plan: string };
    services?: import('../services/container.js').Services;
  }
}

export async function verifyApiKey(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const apiKey = c.req.header('X-API-Key');

  // No API key provided - apply free tier limits
  if (!authHeader && !apiKey) {
    return handleFreeTier(c, next);
  }

  const token = apiKey || authHeader?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'API key required' }, 401);
  }

  try {
    const decoded = jwt.verify(token, ZENBIN_JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
    
    // Attach user info to context
    c.set('user', { ...decoded, plan: decoded.plan });
    
    // Track usage for rate limiting
    trackUsage(decoded.sub, decoded.monthlyRequests);
    
    await next();
  } catch (err) {
    // Invalid token - try as legacy key or reject
    if (token.startsWith('zb_live_')) {
      return c.json({ error: 'Invalid API key' }, 401);
    }
    return handleFreeTier(c, next);
  }
}

async function handleFreeTier(c: Context, next: Next) {
  const clientId = getClientId(c);
  const now = Date.now();
  
  let usage = freeUsage.get(clientId);
  
  // Reset if window expired
  if (!usage || now > usage.resetTime) {
    usage = { count: 0, resetTime: now + config.freeTier.monthlyWindowMs };
    freeUsage.set(clientId, usage);
  }
  
  if (usage.count >= config.freeTier.monthlyLimit) {
    c.header('Retry-After', String(Math.floor((usage.resetTime - now) / 1000)));
    return c.json({ 
      error: 'Free tier limit exceeded',
      limit: config.freeTier.monthlyLimit,
      resetsAt: new Date(usage.resetTime).toISOString(),
    }, 429);
  }
  
  usage.count++;
  c.set('user', { plan: 'free', monthlyRequests: config.freeTier.monthlyLimit } as any);
  await next();
}

function getClientId(c: Context): string {
  // Derive the client IP from the real socket unless explicitly behind a
  // trusted proxy. Client-supplied X-Forwarded-For is spoofable and would let
  // a caller reset the free-tier counter by rotating the header.
  let ip = 'unknown';
  if (config.trustProxy) {
    const forwarded = c.req.header('X-Forwarded-For');
    if (forwarded) {
      const parts = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) ip = parts[parts.length - 1];
    } else {
      ip = c.req.header('X-Real-IP') || 'unknown';
    }
  } else {
    try {
      ip = getConnInfo(c).remote.address || 'unknown';
    } catch {
      ip = 'unknown';
    }
  }
  const ua = c.req.header('User-Agent') || 'unknown';
  return `${ip}:${ua.slice(0, 50)}`;
}

function trackUsage(userId: string, limit: number) {
  // In production, track in Redis with daily/weekly rolling window
  // This is a simplified version
  console.log(`[API Key] User ${userId} - limit: ${limit}`);
}

