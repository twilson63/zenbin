/**
 * Base64url (RFC 4648 § 5, no padding) and JCS (RFC 8785) for the CAP-Tree
 * object profile. Pure functions, no platform dependencies.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const REVERSE: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) REVERSE[ALPHABET[i]!] = i;

export function toBase64url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!, b = bytes[i + 1], c = bytes[i + 2];
    out += ALPHABET[a >> 2]!;
    out += ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)]!;
    if (b !== undefined) out += ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)]!;
    if (c !== undefined) out += ALPHABET[c & 63]!;
  }
  return out;
}

export function fromBase64url(s: string): Uint8Array {
  const out = new Uint8Array(Math.floor((s.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < s.length; i += 4) {
    const a = REVERSE[s[i]!], b = REVERSE[s[i + 1]!];
    if (a === undefined || b === undefined) throw new Error('invalid base64url');
    out[o++] = (a << 2) | (b >> 4);
    const cChar = s[i + 2];
    if (cChar !== undefined) {
      const c = REVERSE[cChar];
      if (c === undefined) throw new Error('invalid base64url');
      out[o++] = ((b & 15) << 4) | (c >> 2);
      const dChar = s[i + 3];
      if (dChar !== undefined) {
        const d = REVERSE[dChar];
        if (d === undefined) throw new Error('invalid base64url');
        out[o++] = ((c & 3) << 6) | d;
      }
    }
  }
  return out.subarray(0, o);
}

/** 43-char base64url SHA-256 string (fingerprints, hashes). */
export const HASH_RE = /^[A-Za-z0-9_-]{43}$/;

/**
 * RFC 8785 canonicalization, restricted to the CAP-Tree object profile:
 * strings, integers, booleans, null, arrays, objects. Non-integer numbers
 * never appear in CAP-Tree objects and are rejected (data-model § 2.2).
 * RFC 8785 string escaping matches ECMAScript JSON.stringify; property
 * names sort by UTF-16 code units (the JS default string ordering).
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || !Number.isFinite(value)) {
      throw new Error('CAP-Tree objects may only contain integer numbers');
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonicalize((value as Record<string, unknown>)[k])}`);
    return `{${entries.join(',')}}`;
  }
  throw new Error(`cannot canonicalize value of type ${typeof value}`);
}

export function canonicalBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalize(value));
}
