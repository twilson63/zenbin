/**
 * Hashing, fingerprints, and Ed25519 signature envelopes — WebCrypto only,
 * so the same code runs in Node >= 20 and modern browsers.
 */
import { canonicalBytes, toBase64url, fromBase64url } from './encoding.js';

export interface Ed25519Jwk {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;       // base64url raw public key
  d?: string;      // base64url raw private key (never transmitted)
}

export interface SignatureEnvelope<P = unknown> {
  payload: P;
  signerFingerprint: string;
  publicKey: Ed25519Jwk;
  signature: string; // base64url Ed25519 over JCS(payload)
}

const subtle = globalThis.crypto.subtle;

export async function sha256(bytes: Uint8Array): Promise<string> {
  return toBase64url(new Uint8Array(await subtle.digest('SHA-256', bytes as BufferSource)));
}

/** objectHash: SHA-256 of the JCS canonical bytes (data-model § 2.2). */
export async function objectHash(payload: unknown): Promise<string> {
  return sha256(canonicalBytes(payload));
}

/** blobHash: SHA-256 of raw content bytes (data-model § 2.2). */
export async function blobHash(bytes: Uint8Array): Promise<string> {
  return sha256(bytes);
}

// Ed25519 SubjectPublicKeyInfo is a fixed 12-byte DER prefix + 32 raw key bytes,
// so fingerprints need no ASN.1 library.
const SPKI_PREFIX = new Uint8Array([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]);

/** fingerprint: base64url(SHA-256(SPKI-DER(publicKey))) (data-model § 2.1). */
export async function fingerprint(publicKey: Ed25519Jwk): Promise<string> {
  const raw = fromBase64url(publicKey.x);
  if (raw.length !== 32) throw new Error('Ed25519 public key must be 32 bytes');
  const spki = new Uint8Array(SPKI_PREFIX.length + 32);
  spki.set(SPKI_PREFIX);
  spki.set(raw, SPKI_PREFIX.length);
  return sha256(spki);
}

export async function generateKeyPair(): Promise<{ publicJwk: Ed25519Jwk; privateJwk: Ed25519Jwk; fingerprint: string }> {
  const pair = (await subtle.generateKey('Ed25519', true, ['sign', 'verify'])) as CryptoKeyPair;
  const publicJwk = (await subtle.exportKey('jwk', pair.publicKey)) as Ed25519Jwk;
  const privateJwk = (await subtle.exportKey('jwk', pair.privateKey)) as Ed25519Jwk;
  return { publicJwk: stripJwk(publicJwk), privateJwk, fingerprint: await fingerprint(publicJwk) };
}

function stripJwk(jwk: Ed25519Jwk): Ed25519Jwk {
  return { kty: 'OKP', crv: 'Ed25519', x: jwk.x };
}

async function importPublic(jwk: Ed25519Jwk): Promise<CryptoKey> {
  return subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x }, 'Ed25519', false, ['verify']);
}

async function importPrivate(jwk: Ed25519Jwk): Promise<CryptoKey> {
  if (!jwk.d) throw new Error('private JWK required (missing "d")');
  return subtle.importKey('jwk', { ...jwk, key_ops: ['sign'] }, 'Ed25519', false, ['sign']);
}

/** Sign a payload into a self-contained envelope (data-model § 2.4). */
export async function signEnvelope<P>(
  payload: P,
  privateJwk: Ed25519Jwk,
  publicJwk: Ed25519Jwk
): Promise<SignatureEnvelope<P>> {
  const key = await importPrivate(privateJwk);
  const sig = await subtle.sign('Ed25519', key, canonicalBytes(payload) as BufferSource);
  return {
    payload,
    signerFingerprint: await fingerprint(publicJwk),
    publicKey: stripJwk(publicJwk),
    signature: toBase64url(new Uint8Array(sig)),
  };
}

export interface EnvelopeVerdict {
  ok: boolean;
  /** objectHash of the payload — the envelope's reference identity. */
  hash: string;
  errors: string[];
}

/** Verify an envelope per data-model § 2.4 / § 6.1 steps 1–2. */
export async function verifyEnvelope(env: SignatureEnvelope): Promise<EnvelopeVerdict> {
  const errors: string[] = [];
  const hash = await objectHash(env.payload);
  let fp = '';
  try {
    fp = await fingerprint(env.publicKey);
  } catch (e) {
    errors.push(`invalid public key: ${(e as Error).message}`);
  }
  if (fp && fp !== env.signerFingerprint) {
    errors.push('signerFingerprint does not match the embedded public key');
  }
  if (errors.length === 0) {
    try {
      const key = await importPublic(env.publicKey);
      const ok = await subtle.verify(
        'Ed25519',
        key,
        fromBase64url(env.signature) as BufferSource,
        canonicalBytes(env.payload) as BufferSource
      );
      if (!ok) errors.push('Ed25519 signature does not verify over the canonical payload bytes');
    } catch (e) {
      errors.push(`signature verification failed: ${(e as Error).message}`);
    }
  }
  return { ok: errors.length === 0, hash, errors };
}
