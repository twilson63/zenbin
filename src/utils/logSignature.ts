import { createHash } from 'node:crypto';
import { config } from '../config.js';
import { getAgentKey } from '../storage/db.js';
import { computeFingerprint } from './fingerprint.js';
import { buildCanonicalRequest, verifyEd25519Signature } from './httpSignature.js';

export const logLimits = {
  bodyBytes: 64 * 1024,
  metadataBytes: 16 * 1024,
  writers: 100,
  entries: 100_000,
  pageSize: 100,
} as const;

export interface LogSigner {
  keyId: string;
  fingerprint: string;
  nonce: string;
  timestamp: number;
}

export interface LogAuthError {
  error: string;
  status: 401 | 403;
}

/** Log replay records commit with the mutation, not before handler validation. */
export function verifyLogSignature(method: string, path: string, headers: Headers, body: Uint8Array, now = Date.now()): LogSigner | LogAuthError {
  const get = (cap: string, legacy: string) => headers.get(cap) || headers.get(legacy) || '';
  const keyId = get('CAP-Key-Id', 'X-Zenbin-Key-Id');
  const timestamp = get('CAP-Timestamp', 'X-Zenbin-Timestamp');
  const nonce = get('CAP-Nonce', 'X-Zenbin-Nonce');
  const signature = get('CAP-Signature', 'X-Zenbin-Signature');
  const digest = get('CAP-Digest', 'Content-Digest');
  const invalid: LogAuthError = { error: 'Valid registered Ed25519 signature required', status: 401 };
  if (!keyId || keyId.length > 128 || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce) || !/^:[A-Za-z0-9_-]{86}:$/.test(signature)) return invalid;
  const key = getAgentKey(keyId);
  if (!key) return invalid;
  if (key.status !== 'active') return { error: 'Signing key is not active', status: 403 };
  const time = Date.parse(timestamp);
  if (!Number.isFinite(time) || Math.abs(now - time) > config.signedPublishing.maxTimestampSkewMs) return invalid;
  if (digest !== `sha-256=:${createHash('sha256').update(body).digest('base64')}:`) return invalid;
  const signatureBytes = Buffer.from(signature.slice(1, -1), 'base64url');
  if (signatureBytes.length !== 64 || signatureBytes.toString('base64url') !== signature.slice(1, -1)) return invalid;
  try {
    const canonical = buildCanonicalRequest({ method, path, timestamp, nonce, contentDigest: digest });
    if (!verifyEd25519Signature({ publicJwk: key.publicJwk, canonical, signature })) return invalid;
    return { keyId, fingerprint: computeFingerprint(key.publicJwk as { x: string }), nonce, timestamp: time };
  } catch {
    return invalid;
  }
}

/** Registry lives in another environment; this is a fresh check, not a cross-DB transaction. */
export function checkLogSigner(signer: LogSigner, now: number): LogAuthError | undefined {
  if (Math.abs(now - signer.timestamp) > config.signedPublishing.maxTimestampSkewMs) {
    return { error: 'Signing timestamp is outside the allowed window', status: 401 };
  }
  const key = getAgentKey(signer.keyId);
  if (!key || key.status !== 'active' || computeFingerprint(key.publicJwk as { x: string }) !== signer.fingerprint) {
    return { error: 'Signing key is not active', status: 403 };
  }
}
