// API Key Verification Middleware for ZenBin
// Validates API keys from SQLite database (zb_live_, zb_agent_) and JWT (legacy)

import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import {
  getApiKeyById,
  checkMonthlyLimit,
  incrementUsage,
} from '../storage/admin.js';

// Environment variable - must match portal's ZENBIN_JWT_SECRET
const ZENBIN_JWT_SECRET = process.env.ZENBIN_JWT_SECRET || 'change-me-in-production';

// In-memory usage tracking for free tier (replace with Redis for production)
const freeUsage = new Map<string, { count: number; resetTime: number }>();

interface JwtPayload {
  sub: string;
  email: string;
  plan: string;
  monthlyRequests: number;
  apiKeyId: string;
}

interface ApiKeyUser {
  id: string;
  user_id: string;
  type: string;
  plan: string;
  monthly_limit: number;
}

// Extend Hono's context variables
declare module 'hono' {
  interface ContextVariableMap {
    user?: ApiKeyUser | JwtPayload;
    apiKey?: string;
  }
}

export async function verifyApiKey(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const apiKeyHeader = c.req.header('X-API-Key');

  // Extract token from either source
  const token = apiKeyHeader || authHeader?.replace('Bearer ', '');

  // No API key provided - reject (registration required)
  if (!token) {
    return c.json({
      error: 'API key required',
      message: 'Register at /v1/register to get your free API key',
      docs: 'https://zenbin.org/docs/api-keys',
    }, 401);
  }

  // Check if it's a ZenBin-issued key (zb_live_, zb_agent_, zb_test_)
  if (token.startsWith('zb_')) {
    return validateZenBinKey(c, next, token);
  }

  // Check if it's a JWT (legacy portal keys)
  if (token.includes('.')) {
    return validateJwt(c, next, token);
  }

  // Invalid key format
  return c.json({ error: 'Invalid API key format' }, 401);
}

async function validateZenBinKey(c: Context, next: Next, token: string) {
  // Look up key in SQLite
  const key = getApiKeyById(token);

  if (!key) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  if (key.revoked_at) {
    return c.json({ error: 'API key revoked' }, 401);
  }

  // Check monthly limit
  const limitCheck = checkMonthlyLimit(token);
  if (!limitCheck.allowed) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    c.header('X-RateLimit-Limit', String(key.monthly_limit));
    c.header('X-RateLimit-Remaining', '0');
    c.header('X-RateLimit-Reset', nextMonth.toISOString());
    
    return c.json({
      error: 'Monthly limit exceeded',
      limit: key.monthly_limit,
      usage: limitCheck.used,
      resetsAt: nextMonth.toISOString(),
    }, 429);
  }

  // Attach user info to context
  c.set('user', {
    id: key.user_id,
    user_id: key.user_id,
    type: key.type,
    plan: key.plan,
    monthly_limit: key.monthly_limit,
  } as ApiKeyUser);
  c.set('apiKey', token);

  // Track usage
  const period = getCurrentPeriod();
  incrementUsage(token, period, 1, 0);

  await next();
}

async function validateJwt(c: Context, next: Next, token: string) {
  try {
    const decoded = jwt.verify(token, ZENBIN_JWT_SECRET) as JwtPayload;

    // Attach user info to context
    c.set('user', { ...decoded, plan: decoded.plan || 'free' });

    await next();
  } catch (err) {
    return c.json({ error: 'Invalid API key' }, 401);
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
  c.set('user', {
    id: clientId,
    plan: 'free',
    monthly_limit: config.freeTier.monthlyLimit,
  } as ApiKeyUser);

  await next();
}

function getClientId(c: Context): string {
  // Use IP + user agent as client identifier for free tier
  const ip = c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown';
  const ua = c.req.header('User-Agent') || 'unknown';
  return `${ip}:${ua.slice(0, 50)}`;
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function requirePlan(...allowedPlans: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const userPlan = 'plan' in user ? user.plan : 'free';

    if (!allowedPlans.includes(userPlan)) {
      return c.json({
        error: 'Plan upgrade required',
        currentPlan: userPlan,
        requiredPlans: allowedPlans,
      }, 403);
    }

    await next();
  };
}

// Optional: Skip API key for certain routes (e.g., health, registration)
export function optionalApiKey(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const apiKeyHeader = c.req.header('X-API-Key');

  if (!authHeader && !apiKeyHeader) {
    // No key provided, continue without user context
    return next();
  }

  // Key provided, validate it
  return verifyApiKey(c, next);
}