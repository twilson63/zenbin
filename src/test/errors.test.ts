import { describe, it, expect } from 'vitest';
import { ErrorCodes, errorResponse } from '../errors.js';

describe('ErrorCodes', () => {
  it('should define page error codes', () => {
    expect(ErrorCodes.PAGE_NOT_FOUND).toBe('PAGE_NOT_FOUND');
    expect(ErrorCodes.PAGE_LIMIT_EXCEEDED).toBe('PAGE_LIMIT_EXCEEDED');
    expect(ErrorCodes.PAGE_OWNERSHIP_REQUIRED).toBe('PAGE_OWNERSHIP_REQUIRED');
    expect(ErrorCodes.PAGE_PREDATES_OWNERSHIP).toBe('PAGE_PREDATES_OWNERSHIP');
    expect(ErrorCodes.PAGE_AUTH_REQUIRED).toBe('PAGE_AUTH_REQUIRED');
    expect(ErrorCodes.PAGE_INVALID_CREDENTIALS).toBe('PAGE_INVALID_CREDENTIALS');
    expect(ErrorCodes.PAGE_AUTH_RATE_LIMITED).toBe('PAGE_AUTH_RATE_LIMITED');
    expect(ErrorCodes.PAGE_INVALID_ID).toBe('PAGE_INVALID_ID');
    expect(ErrorCodes.PAGE_INVALID_BODY).toBe('PAGE_INVALID_BODY');
    expect(ErrorCodes.PAGE_INVALID_AUTH).toBe('PAGE_INVALID_AUTH');
  });

  it('should define subdomain error codes', () => {
    expect(ErrorCodes.SUBDOMAIN_NOT_FOUND).toBe('SUBDOMAIN_NOT_FOUND');
    expect(ErrorCodes.SUBDOMAIN_TAKEN).toBe('SUBDOMAIN_TAKEN');
    expect(ErrorCodes.SUBDOMAIN_LIMIT_EXCEEDED).toBe('SUBDOMAIN_LIMIT_EXCEEDED');
    expect(ErrorCodes.SUBDOMAIN_OWNERSHIP_REQUIRED).toBe('SUBDOMAIN_OWNERSHIP_REQUIRED');
    expect(ErrorCodes.SUBDOMAIN_PREDATES_OWNERSHIP).toBe('SUBDOMAIN_PREDATES_OWNERSHIP');
    expect(ErrorCodes.SUBDOMAIN_INVALID_NAME).toBe('SUBDOMAIN_INVALID_NAME');
    expect(ErrorCodes.SUBDOMAIN_MAX_PAGES_EXCEEDED).toBe('SUBDOMAIN_MAX_PAGES_EXCEEDED');
  });

  it('should define key error codes', () => {
    expect(ErrorCodes.KEY_NOT_FOUND).toBe('KEY_NOT_FOUND');
    expect(ErrorCodes.KEY_ALREADY_EXISTS).toBe('KEY_ALREADY_EXISTS');
    expect(ErrorCodes.KEY_BLOCKED).toBe('KEY_BLOCKED');
    expect(ErrorCodes.KEY_REVOKED).toBe('KEY_REVOKED');
  });

  it('should define auth error codes', () => {
    expect(ErrorCodes.INVALID_SIGNATURE).toBe('INVALID_SIGNATURE');
    expect(ErrorCodes.SIGNING_HEADERS_REQUIRED).toBe('SIGNING_HEADERS_REQUIRED');
    expect(ErrorCodes.UNKNOWN_SIGNING_KEY).toBe('UNKNOWN_SIGNING_KEY');
    expect(ErrorCodes.INVALID_TIMESTAMP).toBe('INVALID_TIMESTAMP');
    expect(ErrorCodes.CONTENT_DIGEST_MISMATCH).toBe('CONTENT_DIGEST_MISMATCH');
    expect(ErrorCodes.NONCE_ALREADY_USED).toBe('NONCE_ALREADY_USED');
    expect(ErrorCodes.API_KEY_REQUIRED).toBe('API_KEY_REQUIRED');
    expect(ErrorCodes.INVALID_API_KEY).toBe('INVALID_API_KEY');
    expect(ErrorCodes.ADMIN_TOKEN_REQUIRED).toBe('ADMIN_TOKEN_REQUIRED');
    expect(ErrorCodes.INVALID_ADMIN_TOKEN).toBe('INVALID_ADMIN_TOKEN');
  });

  it('should define rate limiting and billing error codes', () => {
    expect(ErrorCodes.RATE_LIMITED).toBe('RATE_LIMITED');
    expect(ErrorCodes.BILLING_STRIPE_NOT_CONFIGURED).toBe('BILLING_STRIPE_NOT_CONFIGURED');
    expect(ErrorCodes.BILLING_KEY_NOT_FOUND).toBe('BILLING_KEY_NOT_FOUND');
    expect(ErrorCodes.BILLING_INVALID_PLAN).toBe('BILLING_INVALID_PLAN');
  });

  it('should define general error codes', () => {
    expect(ErrorCodes.INVALID_JSON).toBe('INVALID_JSON');
    expect(ErrorCodes.INVALID_REQUEST).toBe('INVALID_REQUEST');
    expect(ErrorCodes.VIDEO_NOT_FOUND).toBe('VIDEO_NOT_FOUND');
    expect(ErrorCodes.MARKDOWN_NOT_FOUND).toBe('MARKDOWN_NOT_FOUND');
    expect(ErrorCodes.IMAGE_NOT_FOUND).toBe('IMAGE_NOT_FOUND');
  });
});

describe('errorResponse', () => {
  it('should return a Response with error message and error_code', async () => {
    const response = errorResponse(ErrorCodes.PAGE_NOT_FOUND, 'Page not found', 404);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Page not found');
    expect(body.error_code).toBe('PAGE_NOT_FOUND');
  });

  it('should include extra fields when provided', async () => {
    const response = errorResponse(
      ErrorCodes.PAGE_LIMIT_EXCEEDED,
      'Free tier limit of 100 pages per month exceeded',
      402,
      { plan: 'free', upgradeUrl: 'https://zenbin.org/v1/billing/checkout?plan=pro' },
    );

    expect(response.status).toBe(402);
    const body = await response.json();
    expect(body.error).toBe('Free tier limit of 100 pages per month exceeded');
    expect(body.error_code).toBe('PAGE_LIMIT_EXCEEDED');
    expect(body.plan).toBe('free');
    expect(body.upgradeUrl).toBe('https://zenbin.org/v1/billing/checkout?plan=pro');
  });

  it('should set Content-Type to application/json', () => {
    const response = errorResponse(ErrorCodes.KEY_NOT_FOUND, 'Key not found', 404);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should work for all common HTTP status codes', async () => {
    const cases = [
      { code: ErrorCodes.INVALID_JSON, status: 400 },
      { code: ErrorCodes.SIGNING_HEADERS_REQUIRED, status: 401 },
      { code: ErrorCodes.PAGE_OWNERSHIP_REQUIRED, status: 403 },
      { code: ErrorCodes.PAGE_NOT_FOUND, status: 404 },
      { code: ErrorCodes.PAGE_LIMIT_EXCEEDED, status: 402 },
      { code: ErrorCodes.RATE_LIMITED, status: 429 },
      { code: ErrorCodes.KEY_REVOKED, status: 410 },
    ];

    for (const { code, status } of cases) {
      const response = errorResponse(code, 'test', status);
      expect(response.status).toBe(status);
      const body = await response.json();
      expect(body.error_code).toBe(code);
    }
  });
});