// JWT Verification Middleware for ZenBin
// Verifies API keys from the ZenBin Portal

import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Environment variable - must match portal's ZENBIN_JWT_SECRET
const ZENBIN_JWT_SECRET = process.env.ZENBIN_JWT_SECRET || 'change-me-in-production';

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
    const decoded = jwt.verify(token, ZENBIN_JWT_SECRET) as JwtPayload;
    
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
  // Use IP + user agent as client identifier for free tier
  const ip = c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown';
  const ua = c.req.header('User-Agent') || 'unknown';
  return `${ip}:${ua.slice(0, 50)}`;
}

function trackUsage(userId: string, limit: number) {
  // In production, track in Redis with daily/weekly rolling window
  // This is a simplified version
  console.log(`[API Key] User ${userId} - limit: ${limit}`);
}

