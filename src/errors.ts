/**
 * ZenBin Error Codes
 *
 * Machine-readable error codes for all API responses.
 * Agents can use these to programmatically handle errors
 * without parsing English text.
 *
 * Backwards compatible: responses include both `error` (string)
 * and `error_code` (string). Existing clients that only read
 * `error` continue to work.
 */

export const ErrorCodes = {
  // Page errors
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  PAGE_LIMIT_EXCEEDED: 'PAGE_LIMIT_EXCEEDED',
  PAGE_OWNERSHIP_REQUIRED: 'PAGE_OWNERSHIP_REQUIRED',
  PAGE_PREDATES_OWNERSHIP: 'PAGE_PREDATES_OWNERSHIP',
  PAGE_AUTH_REQUIRED: 'PAGE_AUTH_REQUIRED',
  PAGE_INVALID_CREDENTIALS: 'PAGE_INVALID_CREDENTIALS',
  PAGE_AUTH_RATE_LIMITED: 'PAGE_AUTH_RATE_LIMITED',
  PAGE_INVALID_ID: 'PAGE_INVALID_ID',
  PAGE_INVALID_BODY: 'PAGE_INVALID_BODY',
  PAGE_INVALID_AUTH: 'PAGE_INVALID_AUTH',

  // Subdomain errors
  SUBDOMAIN_NOT_FOUND: 'SUBDOMAIN_NOT_FOUND',
  SUBDOMAIN_TAKEN: 'SUBDOMAIN_TAKEN',
  SUBDOMAIN_LIMIT_EXCEEDED: 'SUBDOMAIN_LIMIT_EXCEEDED',
  SUBDOMAIN_OWNERSHIP_REQUIRED: 'SUBDOMAIN_OWNERSHIP_REQUIRED',
  SUBDOMAIN_PREDATES_OWNERSHIP: 'SUBDOMAIN_PREDATES_OWNERSHIP',
  SUBDOMAIN_INVALID_NAME: 'SUBDOMAIN_INVALID_NAME',
  SUBDOMAIN_MAX_PAGES_EXCEEDED: 'SUBDOMAIN_MAX_PAGES_EXCEEDED',

  // Key errors
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  KEY_ALREADY_EXISTS: 'KEY_ALREADY_EXISTS',
  KEY_BLOCKED: 'KEY_BLOCKED',
  KEY_REVOKED: 'KEY_REVOKED',

  // Auth errors
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  SIGNING_HEADERS_REQUIRED: 'SIGNING_HEADERS_REQUIRED',
  UNKNOWN_SIGNING_KEY: 'UNKNOWN_SIGNING_KEY',
  INVALID_TIMESTAMP: 'INVALID_TIMESTAMP',
  CONTENT_DIGEST_MISMATCH: 'CONTENT_DIGEST_MISMATCH',
  NONCE_ALREADY_USED: 'NONCE_ALREADY_USED',
  API_KEY_REQUIRED: 'API_KEY_REQUIRED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  ADMIN_TOKEN_REQUIRED: 'ADMIN_TOKEN_REQUIRED',
  INVALID_ADMIN_TOKEN: 'INVALID_ADMIN_TOKEN',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Billing errors
  BILLING_STRIPE_NOT_CONFIGURED: 'BILLING_STRIPE_NOT_CONFIGURED',
  BILLING_KEY_NOT_FOUND: 'BILLING_KEY_NOT_FOUND',
  BILLING_INVALID_PLAN: 'BILLING_INVALID_PLAN',

  // General errors
  INVALID_JSON: 'INVALID_JSON',
  INVALID_REQUEST: 'INVALID_REQUEST',
  VIDEO_NOT_FOUND: 'VIDEO_NOT_FOUND',
  MARKDOWN_NOT_FOUND: 'MARKDOWN_NOT_FOUND',
  IMAGE_NOT_FOUND: 'IMAGE_NOT_FOUND',

  // CAP-Tree v0.3 errors (PRD § 6). 422 bodies carry an `errors: string[]`.
  CAP_ENVELOPE_INVALID: 'CAP_ENVELOPE_INVALID',        // 422
  CAP_OBJECT_INVALID: 'CAP_OBJECT_INVALID',            // 422
  CAP_OWNER_MISMATCH: 'CAP_OWNER_MISMATCH',            // 422
  CAP_PARENT_UNKNOWN: 'CAP_PARENT_UNKNOWN',            // 422
  CAP_CHAIN_INVALID: 'CAP_CHAIN_INVALID',              // 422
  CAP_TREE_UNKNOWN: 'CAP_TREE_UNKNOWN',                // 404
  CAP_REF_TARGET_UNKNOWN: 'CAP_REF_TARGET_UNKNOWN',    // 422
  CAP_NOT_OWNER: 'CAP_NOT_OWNER',                      // 403
  CAP_REFS_CONFLICT: 'CAP_REFS_CONFLICT',              // 409
  OBJECT_NOT_FOUND: 'OBJECT_NOT_FOUND',                // 404
  OBJECT_TOO_LARGE: 'OBJECT_TOO_LARGE',                // 413
  REFS_NOT_FOUND: 'REFS_NOT_FOUND',                    // 404
  PATH_NOT_FOUND: 'PATH_NOT_FOUND',                    // 404
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Build a standard error response with both human-readable message
 * and machine-readable error code.
 *
 * Returns the Hono-compatible JSON response object.
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  extra?: Record<string, unknown>,
): Response {
  const body: Record<string, unknown> = {
    error: message,
    error_code: code,
    ...extra,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}