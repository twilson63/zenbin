import bcrypt from 'bcryptjs';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { config } from '../config.js';
import { verifyEd25519Signature, decodeBase64Url } from './httpSignature.js';
import { getAgentKey } from '../storage/db.js';
import type { Page } from '../types.js';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.auth.bcryptRounds);
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a URL token and its hash
 * Returns the plain token (to return to user) and hash (to store)
 */
export function generateUrlToken(): { token: string; hash: string } {
  const token = randomBytes(config.auth.tokenLength).toString('hex');
  const hash = createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

/**
 * Verify a URL token against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyUrlToken(token: string, hash: string): boolean {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(tokenHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Parse HTTP Basic Auth header
 * Returns null if header is missing or invalid
 */
export function parseBasicAuth(header: string | undefined): { username: string; password: string } | null {
  if (!header || !header.startsWith('Basic ')) {
    return null;
  }

  try {
    const base64 = header.slice(6);
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const colonIndex = decoded.indexOf(':');
    
    if (colonIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, colonIndex),
      password: decoded.slice(colonIndex + 1),
    };
  } catch {
    return null;
  }
}

// ─── CAP Access Token ──────────────────────────────────────────

/**
 * Parsed CAP access token components.
 */
export interface ParsedCapToken {
  version: string;
  keyId: string;
  expires: number;
  nonce: string;
  signature: string;
}

/**
 * Result of CAP token verification.
 */
export type CapTokenResult =
  | { authorized: true; keyId: string }
  | { authorized: false; reason: string };

/**
 * Parse a CAP access token string into its components.
 * Token format: v1.{base64url(keyId)}.{base64url(expires)}.{base64url(nonce)}.{base64url(signature)}
 * Returns null if the token is malformed.
 */
export function parseCapToken(token: string): ParsedCapToken | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 5) {
    return null;
  }

  const [version, keyIdB64, expiresB64, nonceB64, signatureB64] = parts;

  if (version !== 'v1') {
    return null;
  }

  try {
    const keyId = Buffer.from(decodeBase64Url(keyIdB64)).toString('utf-8');
    const expiresStr = Buffer.from(decodeBase64Url(expiresB64)).toString('utf-8');
    const expires = parseInt(expiresStr, 10);
    if (Number.isNaN(expires) || expires < 0) {
      return null;
    }
    const nonce = Buffer.from(decodeBase64Url(nonceB64)).toString('utf-8');
    // signature stays as base64url string for verifyEd25519Signature
    // but we need the raw bytes for crypto.verify
    const signature = signatureB64; // keep as base64url

    return { version, keyId, expires, nonce, signature };
  } catch {
    return null;
  }
}

/**
 * Verify a CAP access token against a page.
 *
 * Checks:
 * 1. Token parses correctly
 * 2. Token is not expired
 * 3. Token is not beyond MAX_TTL
 * 4. Key exists and is active
 * 5. Signature is valid for CAP_TOKEN\n{path}\n{expires}
 * 6. Key is either the page owner or the designated recipient
 */
export function verifyCapToken(token: string, requestPath: string, page: Page): CapTokenResult {
  const parsed = parseCapToken(token);
  if (!parsed) {
    return { authorized: false, reason: 'Invalid cap_token format' };
  }

  const now = Math.floor(Date.now() / 1000);

  // Check expiry
  if (parsed.expires < now) {
    return { authorized: false, reason: 'cap_token expired' };
  }

  // Check max TTL
  if (parsed.expires > now + config.capToken.maxTtlSeconds) {
    return { authorized: false, reason: 'cap_token exceeds maximum TTL' };
  }

  // Look up key
  const agentKey = getAgentKey(parsed.keyId);
  if (!agentKey) {
    return { authorized: false, reason: 'Unknown signing key' };
  }

  if (agentKey.status === 'blocked') {
    return { authorized: false, reason: 'Signing key is blocked' };
  }

  if (agentKey.status === 'revoked') {
    return { authorized: false, reason: 'Signing key is revoked' };
  }

  // Build canonical string
  const canonical = `CAP_TOKEN\n${requestPath}\n${parsed.expires}`;

  // Verify signature
  if (!verifyEd25519Signature({
    publicJwk: agentKey.publicJwk,
    canonical,
    signature: parsed.signature,
  })) {
    return { authorized: false, reason: 'Invalid cap_token signature' };
  }

  // Check authorization: owner key or recipient key
  const isOwner = page.ownerKeyId === parsed.keyId;
  const isRecipient = page.auth?.signToRead && page.recipientKeyId === agentKey.publicKeyFingerprint;

  if (!isOwner && !isRecipient) {
    return { authorized: false, reason: 'Not authorized: key is not page owner or designated recipient' };
  }

  return { authorized: true, keyId: parsed.keyId };
}
