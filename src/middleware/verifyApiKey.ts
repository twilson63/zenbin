// JWT Verification Middleware for ZenBin
// Verifies API keys from the ZenBin Portal

import { Context, Next } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getAgentKey } from '../storage/db.js';
import { buildCanonicalRequest, verifyBodyDigest, verifyEd25519Signature } from '../utils/httpSignature.js';

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

/**
 * True when the request carries a valid Ed25519 signature from a key on a
 * paid plan (pro/enterprise). Such requests skip the anonymous free-tier
 * bucket: the key holder is already identified, per-key quotas (pages,
 * subdomains) are still enforced downstream, and the route-level signature
 * check (nonce replay protection, key status) still runs.
 *
 * This check is read-only — it never registers nonces, touches keys, or
 * writes audit logs — so the downstream verification is unaffected. Anything
 * unsigned, signed by an unknown/free-plan key, or failing verification falls
 * through to the anonymous bucket as before.
 */
async function hasPaidPlanSignature(c: Context): Promise<boolean> {
  // CAP headers take priority, X-Zenbin headers are legacy fallback
  const keyId = c.req.header('CAP-Key-Id') || c.req.header('X-Zenbin-Key-Id');
  const timestamp = c.req.header('CAP-Timestamp') || c.req.header('X-Zenbin-Timestamp');
  const nonce = c.req.header('CAP-Nonce') || c.req.header('X-Zenbin-Nonce');
  const contentDigest = c.req.header('CAP-Digest') || c.req.header('Content-Digest');
  const signature = c.req.header('CAP-Signature') || c.req.header('X-Zenbin-Signature');
  if (!keyId || !timestamp || !nonce || !contentDigest || !signature) return false;

  const agentKey = getAgentKey(keyId);
  if (!agentKey) return false;
  if (agentKey.plan !== 'pro' && agentKey.plan !== 'enterprise') return false;

  const requestTime = Date.parse(timestamp);
  if (Number.isNaN(requestTime)) return false;
  if (Math.abs(Date.now() - requestTime) > config.signedPublishing.maxTimestampSkewMs) return false;

  let rawBody: string;
  try {
    rawBody = await c.req.text();
  } catch {
    return false;
  }
  if (!verifyBodyDigest(rawBody, contentDigest)) return false;

  const url = new URL(c.req.url);
  const canonical = buildCanonicalRequest({
    method: c.req.method,
    path: `${url.pathname}${url.search}`,
    timestamp,
    nonce,
    contentDigest,
  });

  try {
    return verifyEd25519Signature({ publicJwk: agentKey.publicJwk, canonical, signature });
  } catch {
    return false;
  }
}

export async function verifyApiKey(c: Context, next: Next) {
  // Public polling does not consume monthly publication quota.
  if ((c.req.method === 'GET' || c.req.method === 'HEAD') && /^\/v1\/logs\/[^/]+(?:\/entries)?$/.test(c.req.path)) return next();
  // Paid-plan signed requests are identified by key and quota'd per key —
  // they never draw from the anonymous free-tier bucket.
  if (await hasPaidPlanSignature(c)) {
    await next();
    return;
  }
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

