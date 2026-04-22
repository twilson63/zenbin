import { createHash, createPublicKey, verify } from 'crypto';

type StoredJwk = Record<string, string | boolean | undefined>;

export interface SignatureHeaders {
  keyId: string;
  timestamp: string;
  nonce: string;
  contentDigest: string;
  signature: string;
}

export function buildCanonicalRequest(input: {
  method: string;
  path: string;
  timestamp: string;
  nonce: string;
  contentDigest: string;
}): string {
  return [
    input.method.toUpperCase(),
    input.path,
    input.timestamp,
    input.nonce,
    input.contentDigest,
  ].join('\n');
}

export function createContentDigest(body: string): string {
  const digest = createHash('sha256').update(body).digest('base64');
  return `sha-256=:${digest}:`;
}

export function parseContentDigest(contentDigest: string): string | null {
  const match = /^sha-256=:([A-Za-z0-9+/=]+):$/.exec(contentDigest.trim());
  return match ? match[1] : null;
}

export function normalizeSignatureHeader(signature: string): string {
  return signature.trim().replace(/^:/, '').replace(/:$/, '');
}

export function decodeBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64');
}

export function verifyBodyDigest(body: string, contentDigest: string): boolean {
  return createContentDigest(body) === contentDigest;
}

export function verifyEd25519Signature(input: {
  publicJwk: StoredJwk;
  canonical: string;
  signature: string;
}): boolean {
  const publicKey = createPublicKey({
    key: input.publicJwk,
    format: 'jwk',
  });

  return verify(
    null,
    Buffer.from(input.canonical, 'utf-8'),
    publicKey,
    decodeBase64Url(normalizeSignatureHeader(input.signature)),
  );
}
