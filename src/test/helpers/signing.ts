import { createHash, generateKeyPairSync, sign } from 'crypto';
import { saveAgentKey } from '../../storage/db.js';
import { computeFingerprint } from '../../utils/fingerprint.js';

export interface TestSigner {
  keyId: string;
  publicJwk: Record<string, string | boolean | undefined>;
  privateJwk: Record<string, string | boolean | undefined>;
  /** SHA-256 fingerprint of the Ed25519 public key (43-char base64url) */
  publicKeyFingerprint: string;
}

export function generateTestSigner(keyId: string): TestSigner {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const publicJwk = publicKey.export({ format: 'jwk' }) as Record<string, string | boolean | undefined>;
  const privateJwk = privateKey.export({ format: 'jwk' }) as Record<string, string | boolean | undefined>;
  const publicKeyFingerprint = computeFingerprint(publicJwk as { x: string });
  return { keyId, publicJwk, privateJwk, publicKeyFingerprint };
}

export async function createTestSigner(keyId: string, scopes: string[] = []): Promise<TestSigner> {
  const signer = generateTestSigner(keyId);
  await saveAgentKey({ keyId, publicJwk: signer.publicJwk, publicKeyFingerprint: signer.publicKeyFingerprint, scopes });
  return signer;
}

function createContentDigest(body: string): string {
  const digest = createHash('sha256').update(body).digest('base64');
  return `sha-256=:${digest}:`;
}

function toBase64Url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function createSignedHeaders(input: {
  signer: TestSigner;
  method: string;
  path: string;
  body?: string;
  timestamp?: string;
  nonce?: string;
}): HeadersInit {
  const body = input.body || '';
  const timestamp = input.timestamp || new Date().toISOString();
  const nonce = input.nonce || `${Date.now()}${Math.random().toString(16).slice(2)}`;
  const contentDigest = createContentDigest(body);
  const canonical = [input.method.toUpperCase(), input.path, timestamp, nonce, contentDigest].join('\n');

  const signature = sign(
    null,
    Buffer.from(canonical, 'utf-8'),
    {
      key: input.signer.privateJwk,
      format: 'jwk',
    },
  );

  return {
    'X-Zenbin-Key-Id': input.signer.keyId,
    'X-Zenbin-Timestamp': timestamp,
    'X-Zenbin-Nonce': nonce,
    'Content-Digest': contentDigest,
    'X-Zenbin-Signature': `:${toBase64Url(signature)}:`,
  };
}

/**
 * Create CAP Protocol v0.1 signed headers.
 * Uses CAP-* headers instead of X-Zenbin-* headers.
 */
export function createCapSignedHeaders(input: {
  signer: TestSigner;
  method: string;
  path: string;
  body?: string;
  timestamp?: string;
  nonce?: string;
}): HeadersInit {
  const body = input.body || '';
  const timestamp = input.timestamp || new Date().toISOString();
  const nonce = input.nonce || `${Date.now()}${Math.random().toString(16).slice(2)}`;
  const contentDigest = createContentDigest(body);
  const canonical = [input.method.toUpperCase(), input.path, timestamp, nonce, contentDigest].join('\n');

  const signature = sign(
    null,
    Buffer.from(canonical, 'utf-8'),
    {
      key: input.signer.privateJwk,
      format: 'jwk',
    },
  );

  return {
    'CAP-Version': '0.1',
    'CAP-Key-Id': input.signer.keyId,
    'CAP-Timestamp': timestamp,
    'CAP-Nonce': nonce,
    'CAP-Digest': contentDigest,
    'CAP-Signature': `:${toBase64Url(signature)}:`,
  };
}

export function jsonCapSignedRequest(input: {
  signer: TestSigner;
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp?: string;
  nonce?: string;
}): RequestInit {
  const body = input.body === undefined ? '' : JSON.stringify(input.body);
  return {
    method: input.method,
    headers: {
      'Content-Type': 'application/json',
      ...createCapSignedHeaders({
        signer: input.signer,
        method: input.method,
        path: input.path,
        body,
        timestamp: input.timestamp,
        nonce: input.nonce,
      }),
      ...(input.headers || {}),
    },
    body: body || undefined,
  };
}

export function jsonSignedRequest(input: {
  signer: TestSigner;
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp?: string;
  nonce?: string;
}): RequestInit {
  const body = input.body === undefined ? '' : JSON.stringify(input.body);
  return {
    method: input.method,
    headers: {
      'Content-Type': 'application/json',
      ...createSignedHeaders({
        signer: input.signer,
        method: input.method,
        path: input.path,
        body,
        timestamp: input.timestamp,
        nonce: input.nonce,
      }),
      ...(input.headers || {}),
    },
    body: body || undefined,
  };
}
