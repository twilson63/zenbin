import { describe, it, expect } from 'vitest';
import { computeFingerprint, isValidFingerprint } from '../utils/fingerprint.js';

describe('Fingerprint Utility', () => {
  it('should compute a 43-char base64url fingerprint from an Ed25519 JWK', () => {
    // Real Ed25519 public key (x field is 43 chars base64url)
    const publicJwk = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: '11qYAYKxCrfVS_7kOfsSVBJE8D7A7LJW8DT6JVC-AgY',
    };
    const fp = computeFingerprint(publicJwk);
    expect(fp).toHaveLength(43);
    expect(isValidFingerprint(fp)).toBe(true);
    // Should only contain base64url chars
    expect(fp).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('should produce the same fingerprint for the same key', () => {
    const publicJwk = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: '11qYAYKxCrfVS_7kOfsSVBJE8D7A7LJW8DT6JVC-AgY',
    };
    const fp1 = computeFingerprint(publicJwk);
    const fp2 = computeFingerprint(publicJwk);
    expect(fp1).toBe(fp2);
  });

  it('should produce different fingerprints for different keys', () => {
    const key1 = { kty: 'OKP', crv: 'Ed25519', x: '11qYAYKxCrfVS_7kOfsSVBJE8D7A7LJW8DT6JVC-AgY' };
    const key2 = { kty: 'OKP', crv: 'Ed25519', x: '22qYAYKxCrfVS_7kOfsSVBJE8D7A7LJW8DT6JVC-AgY' };
    expect(computeFingerprint(key1)).not.toBe(computeFingerprint(key2));
  });

  it('should reject invalid fingerprints', () => {
    expect(isValidFingerprint('')).toBe(false);
    expect(isValidFingerprint('too-short')).toBe(false);
    expect(isValidFingerprint('this-is-exactly-43-chars-but-has+invalid=chars!')).toBe(false);
    expect(isValidFingerprint('agent-bob-456')).toBe(false);
  });

  it('should accept valid 43-char base64url strings', () => {
    expect(isValidFingerprint('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')).toBe(true);
    expect(isValidFingerprint('HkAg5hCk_bJeekd4Y11qmstbyWDWyS7Urw4xynREsv0')).toBe(true);
  });
});