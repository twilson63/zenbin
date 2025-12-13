import { createHash } from 'crypto';

/**
 * Generate an ETag from content using SHA-256
 * Returns a quoted string suitable for HTTP ETag header
 */
export function generateEtag(content: string): string {
  const hash = createHash('sha256')
    .update(content, 'utf-8')
    .digest('hex')
    .slice(0, 32); // Use first 32 chars of hash
  return `"${hash}"`;
}

/**
 * Check if the If-None-Match header matches the current ETag
 */
export function etagMatches(ifNoneMatch: string | undefined, etag: string): boolean {
  if (!ifNoneMatch) {
    return false;
  }
  
  // Handle multiple ETags (comma-separated)
  const tags = ifNoneMatch.split(',').map(t => t.trim());
  
  // Check for wildcard or exact match
  return tags.includes('*') || tags.includes(etag);
}
