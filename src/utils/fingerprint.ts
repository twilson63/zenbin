import crypto from 'node:crypto';

/**
 * Compute the public key fingerprint from an Ed25519 JWK.
 * SHA-256 of the decoded 'x' field, base64url-encoded.
 * Always 43 characters. Globally unique per key.
 */
export function computeFingerprint(publicJwk: { x: string }): string {
  const pubKeyBuf = Buffer.from(publicJwk.x, 'base64url');
  return crypto.createHash('sha256').update(pubKeyBuf).digest('base64url');
}

/**
 * Validate that a string looks like a public key fingerprint.
 * Must be exactly 43 base64url characters.
 */
export function isValidFingerprint(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value);
}