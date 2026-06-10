import type { Context } from 'hono';
import type { Page } from '../storage/db.js';
import type { Attestation } from '../types.js';

/** Escape a value for safe use inside a double-quoted HTML attribute. */
function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Inject CAP Protocol provenance meta tags into HTML.
 * Adds <meta> tags for key-id, signature, digest, version, and recipient.
 */
export function injectProvenanceMeta(html: string, page: Page): string {
  if (!page.ownerKeyId && !page.publishSignature && !page.recipientKeyId && !page.attestation) {
    return html;
  }

  const metaTags: string[] = [];
  const meta = (name: string, content: string) => {
    metaTags.push(`  <meta name="${name}" content="${escapeHtmlAttr(content)}">`);
  };
  if (page.ownerKeyId) {
    meta('cap:key-id', page.ownerKeyId);
    meta('cap:key-url', `/v1/keys/${page.ownerKeyId}/jwk`);
  }
  if (page.publishSignature) {
    meta('cap:signature', page.publishSignature);
  }
  if (page.contentDigest) {
    meta('cap:digest', page.contentDigest);
  }
  if (page.ownerKeyId || page.publishSignature) {
    meta('cap:version', '0.1');
    meta('cap:verification-url', '/v1/verify');
  }
  if (page.recipientKeyId) {
    meta('cap:recipient-key-id', page.recipientKeyId);
  }

  // Attestation meta tags
  if (page.attestation) {
    meta('cap:attestation-type', page.attestation.type);
    meta('cap:attestation-subject-kind', page.attestation.subject.kind);
    meta('cap:attestation-subject-id', page.attestation.subject.id);
  }

  const provenanceBlock = metaTags.join('\n');

  // Inject before </head> if it exists, otherwise prepend
  if (html.includes('</head>')) {
    return html.replace('</head>', `${provenanceBlock}\n</head>`);
  }
  // No <head> — prepend as a block
  return `<!-- CAP Provenance -->\n${provenanceBlock}\n${html}`;
}

/**
 * Inject CAP Protocol provenance HTTP headers into response.
 * Adds both CAP-* and X-Zenbin-* headers for backward compatibility.
 */
export function injectProvenanceHttpHeaders(c: Context, page: Page): void {
  // CAP Protocol headers (CAP-Attest v0.1)
  if (page.ownerKeyId) {
    c.header('CAP-Version', '0.1');
    c.header('CAP-Key-Id', page.ownerKeyId);
    // Legacy X-Zenbin header for backward compatibility
    c.header('X-Zenbin-Key-Id', page.ownerKeyId);
  }
  if (page.publishSignature) {
    c.header('CAP-Signature', page.publishSignature);
    c.header('X-Zenbin-Signature', page.publishSignature);
  }
  if (page.contentDigest) {
    c.header('CAP-Digest', page.contentDigest);
    c.header('X-Zenbin-Content-Digest', page.contentDigest);
  }
  if (page.publishTimestamp) {
    c.header('CAP-Timestamp', page.publishTimestamp);
    c.header('X-Zenbin-Timestamp', page.publishTimestamp);
  }
  if (page.publishNonce) {
    c.header('CAP-Nonce', page.publishNonce);
    c.header('X-Zenbin-Nonce', page.publishNonce);
  }
  if (page.publishMethod) {
    c.header('X-Zenbin-Signed-Method', page.publishMethod);
  }
  if (page.publishPath) {
    c.header('X-Zenbin-Signed-Path', page.publishPath);
  }
  if (page.recipientKeyId) {
    c.header('CAP-Recipient-Key-Id', page.recipientKeyId);
    c.header('X-Zenbin-Recipient-Key-Id', page.recipientKeyId);
  }

  // Attestation headers
  if (page.attestation) {
    c.header('CAP-Attestation-Type', page.attestation.type);
    c.header('CAP-Attestation-Subject-Kind', page.attestation.subject.kind);
    c.header('CAP-Attestation-Subject-Id', page.attestation.subject.id);
    // Legacy X-Zenbin aliases
    c.header('X-Zenbin-Attestation-Type', page.attestation.type);
    c.header('X-Zenbin-Attestation-Subject-Kind', page.attestation.subject.kind);
    c.header('X-Zenbin-Attestation-Subject-Id', page.attestation.subject.id);
  }
}