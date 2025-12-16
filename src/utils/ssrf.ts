import { promises as dns } from 'dns';

// Blocked hostnames
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
]);

/**
 * Check if an IP address is private/internal (SSRF protection)
 */
export function isPrivateIP(ip: string): boolean {
  // Explicit cloud metadata endpoint block
  if (ip === '169.254.169.254') {
    return true;
  }

  // Check for IPv6
  if (ip.includes(':')) {
    return isPrivateIPv6(ip);
  }

  return isPrivateIPv4(ip);
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid IP, treat as blocked
  }

  const [a, b] = parts;

  // 127.0.0.0/8 (localhost)
  if (a === 127) {
    return true;
  }

  // 10.0.0.0/8 (private)
  if (a === 10) {
    return true;
  }

  // 172.16.0.0/12 (private) - 172.16.0.0 to 172.31.255.255
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  // 192.168.0.0/16 (private)
  if (a === 192 && b === 168) {
    return true;
  }

  // 169.254.0.0/16 (link-local, cloud metadata)
  if (a === 169 && b === 254) {
    return true;
  }

  // 0.0.0.0/8 (current network)
  if (a === 0) {
    return true;
  }

  return false;
}

function isPrivateIPv6(ip: string): boolean {
  // Check for IPv4-mapped IPv6 addresses (::ffff:192.168.1.1) first
  // These should be validated against IPv4 private ranges
  if (ip.includes('.')) {
    const match = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (match) {
      return isPrivateIPv4(match[1]);
    }
  }

  const normalized = normalizeIPv6(ip);

  // ::1 (localhost)
  if (normalized === '0000:0000:0000:0000:0000:0000:0000:0001') {
    return true;
  }

  // Check for IPv4-mapped addresses in normalized form (::ffff:7f00:1 = 127.0.0.1)
  if (normalized.startsWith('0000:0000:0000:0000:0000:ffff:')) {
    const lastTwoSegments = normalized.slice(-9); // "7f00:0001"
    const [hex1, hex2] = lastTwoSegments.split(':');
    const a = parseInt(hex1.slice(0, 2), 16);
    const b = parseInt(hex1.slice(2, 4), 16);
    const c = parseInt(hex2.slice(0, 2), 16);
    const d = parseInt(hex2.slice(2, 4), 16);
    return isPrivateIPv4(`${a}.${b}.${c}.${d}`);
  }

  // fc00::/7 (unique local) - fc00:: to fdff::
  const firstSegment = parseInt(normalized.substring(0, 4), 16);
  if (firstSegment >= 0xfc00 && firstSegment <= 0xfdff) {
    return true;
  }

  // fe80::/10 (link-local) - fe80:: to febf::
  if (firstSegment >= 0xfe80 && firstSegment <= 0xfebf) {
    return true;
  }

  return false;
}

function normalizeIPv6(ip: string): string {
  // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.1)
  if (ip.includes('.')) {
    const match = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (match) {
      // This is an IPv4-mapped address, check the IPv4 part
      const ipv4Parts = match[1].split('.').map(Number);
      const hex1 = ((ipv4Parts[0] << 8) | ipv4Parts[1]).toString(16).padStart(4, '0');
      const hex2 = ((ipv4Parts[2] << 8) | ipv4Parts[3]).toString(16).padStart(4, '0');
      return `0000:0000:0000:0000:0000:ffff:${hex1}:${hex2}`;
    }
  }

  // Expand :: notation
  let segments: string[];
  if (ip.includes('::')) {
    const [left, right] = ip.split('::');
    const leftParts = left ? left.split(':') : [];
    const rightParts = right ? right.split(':') : [];
    const missing = 8 - leftParts.length - rightParts.length;
    const middleParts = Array(missing).fill('0000');
    segments = [...leftParts, ...middleParts, ...rightParts];
  } else {
    segments = ip.split(':');
  }

  // Normalize each segment to 4 hex digits
  return segments.map(s => s.padStart(4, '0').toLowerCase()).join(':');
}

/**
 * Resolve a URL's hostname to IP and validate it's not private
 * Throws an error if the URL is invalid or points to a private IP
 */
export async function resolveAndValidate(urlString: string): Promise<{ hostname: string; ip: string }> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error('Invalid URL');
  }

  // Only allow http and https protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https protocols are allowed');
  }

  const hostname = url.hostname;

  // Check blocked hostnames
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) {
    throw new Error('Hostname is blocked');
  }

  // Check if hostname is already an IP address
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^\[?([a-fA-F0-9:]+)\]?$/;

  let ip: string;

  if (ipv4Regex.test(hostname)) {
    ip = hostname;
  } else if (ipv6Regex.test(hostname)) {
    // Remove brackets if present
    ip = hostname.replace(/^\[|\]$/g, '');
  } else {
    // Resolve DNS
    try {
      const addresses = await dns.resolve4(hostname);
      if (addresses.length === 0) {
        throw new Error('No DNS records found');
      }
      ip = addresses[0];
    } catch (err) {
      // Try IPv6 if IPv4 fails
      try {
        const addresses = await dns.resolve6(hostname);
        if (addresses.length === 0) {
          throw new Error('No DNS records found');
        }
        ip = addresses[0];
      } catch {
        throw new Error('DNS resolution failed');
      }
    }
  }

  // Validate the resolved IP
  if (isPrivateIP(ip)) {
    throw new Error('URL resolves to a private/internal IP address');
  }

  return { hostname, ip };
}
