import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { proxy } from '../routes/proxy.js';
import { validateProxyRequest } from '../utils/validation.js';
import { isPrivateIP } from '../utils/ssrf.js';

// Create test app
const app = new Hono();
app.route('/api/proxy', proxy);

// Helper to make valid proxy requests
const validHeaders = {
  'Content-Type': 'application/json',
  'Origin': 'http://localhost:3000',
};

describe('POST /api/proxy - Validation Tests', () => {
  it('should return 403 when Content-Type header is missing', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('Content-Type');
  });

  it('should return 400 for invalid JSON body', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: 'not valid json',
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('Invalid JSON');
  });

  it('should return 400 when url field is missing', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ method: 'GET' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('url');
  });

  it('should return 400 for invalid URL format', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ url: 'not-a-valid-url' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('url');
  });

  it('should return 400 for invalid HTTP method', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ url: 'https://example.com', method: 'INVALID' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('method');
  });

  it('should return 400 for invalid auth type', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({
        url: 'https://example.com',
        auth: { type: 'invalid', credentials: 'secret' },
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('auth.type');
  });
});

describe('POST /api/proxy - SSRF Protection Tests', () => {
  it('should block localhost (127.0.0.1)', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ url: 'http://127.0.0.1/test' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('private');
  });

  it('should block private IPs (10.x.x.x)', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ url: 'http://10.0.0.1/api' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('private');
  });

  it('should block private IPs (192.168.x.x)', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ url: 'http://192.168.1.1/api' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('private');
  });

  it('should block metadata endpoint (169.254.169.254)', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: validHeaders,
      body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('private');
  });
});

describe('POST /api/proxy - Origin Restriction Tests', () => {
  it('should return 403 when both Referer and Origin headers are missing', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('originate');
  });

  it('should return 403 for invalid origin', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://evil.com',
      },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('originate');
  });

  it('should return 403 for invalid referer', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://evil.com/page',
      },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    expect(res.status).toBe(403);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('originate');
  });

  it('should accept valid Referer header', async () => {
    const res = await app.request('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'http://localhost:3000/p/somepage',
      },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    // Should not be 403 - may fail later due to DNS, but origin check passes
    expect(res.status).not.toBe(403);
  });
});

describe('isPrivateIP - Unit Tests', () => {
  it('should identify localhost (127.0.0.1) as private', () => {
    expect(isPrivateIP('127.0.0.1')).toBe(true);
  });

  it('should identify localhost range (127.x.x.x) as private', () => {
    expect(isPrivateIP('127.0.0.255')).toBe(true);
    expect(isPrivateIP('127.255.255.255')).toBe(true);
  });

  it('should identify 10.x.x.x as private', () => {
    expect(isPrivateIP('10.0.0.1')).toBe(true);
    expect(isPrivateIP('10.255.255.255')).toBe(true);
  });

  it('should identify 172.16-31.x.x as private', () => {
    expect(isPrivateIP('172.16.0.1')).toBe(true);
    expect(isPrivateIP('172.31.255.255')).toBe(true);
    // 172.32.x.x should not be private
    expect(isPrivateIP('172.32.0.1')).toBe(false);
  });

  it('should identify 192.168.x.x as private', () => {
    expect(isPrivateIP('192.168.0.1')).toBe(true);
    expect(isPrivateIP('192.168.255.255')).toBe(true);
  });

  it('should identify metadata endpoint (169.254.169.254) as private', () => {
    expect(isPrivateIP('169.254.169.254')).toBe(true);
  });

  it('should identify link-local range (169.254.x.x) as private', () => {
    expect(isPrivateIP('169.254.0.1')).toBe(true);
    expect(isPrivateIP('169.254.255.255')).toBe(true);
  });

  it('should identify 0.0.0.0/8 as private', () => {
    expect(isPrivateIP('0.0.0.0')).toBe(true);
    expect(isPrivateIP('0.255.255.255')).toBe(true);
  });

  it('should not identify public IPs as private', () => {
    expect(isPrivateIP('8.8.8.8')).toBe(false);
    expect(isPrivateIP('1.1.1.1')).toBe(false);
    expect(isPrivateIP('93.184.216.34')).toBe(false);
  });

  it('should identify IPv6 localhost (::1) as private', () => {
    expect(isPrivateIP('::1')).toBe(true);
  });

  it('should identify IPv6 unique local (fc00::/7) as private', () => {
    expect(isPrivateIP('fc00::1')).toBe(true);
    expect(isPrivateIP('fd00::1')).toBe(true);
  });

  it('should identify IPv6 link-local (fe80::/10) as private', () => {
    expect(isPrivateIP('fe80::1')).toBe(true);
  });

  it('should identify IPv4-mapped IPv6 localhost (::ffff:127.0.0.1) as private', () => {
    expect(isPrivateIP('::ffff:127.0.0.1')).toBe(true);
  });

  it('should identify IPv4-mapped IPv6 private IPs as private', () => {
    expect(isPrivateIP('::ffff:10.0.0.1')).toBe(true);
    expect(isPrivateIP('::ffff:192.168.1.1')).toBe(true);
    expect(isPrivateIP('::ffff:172.16.0.1')).toBe(true);
  });

  it('should identify IPv4-mapped IPv6 metadata endpoint as private', () => {
    expect(isPrivateIP('::ffff:169.254.169.254')).toBe(true);
  });

  it('should not identify IPv4-mapped IPv6 public IPs as private', () => {
    expect(isPrivateIP('::ffff:8.8.8.8')).toBe(false);
    expect(isPrivateIP('::ffff:1.1.1.1')).toBe(false);
  });
});

describe('validateProxyRequest - Unit Tests', () => {
  const maxTimeout = 30000;

  it('should return error for non-object body', () => {
    expect(validateProxyRequest(null, maxTimeout)).toEqual({
      field: 'body',
      message: 'Request body must be a JSON object',
    });
    expect(validateProxyRequest('string', maxTimeout)).toEqual({
      field: 'body',
      message: 'Request body must be a JSON object',
    });
  });

  it('should return error for missing url', () => {
    const result = validateProxyRequest({}, maxTimeout);
    expect(result?.field).toBe('url');
  });

  it('should return error for non-string url', () => {
    const result = validateProxyRequest({ url: 123 }, maxTimeout);
    expect(result?.field).toBe('url');
  });

  it('should return error for invalid url format', () => {
    const result = validateProxyRequest({ url: 'not-a-url' }, maxTimeout);
    expect(result?.field).toBe('url');
    expect(result?.message).toContain('valid URL');
  });

  it('should return error for non-http/https protocols', () => {
    const result = validateProxyRequest({ url: 'ftp://example.com' }, maxTimeout);
    expect(result?.field).toBe('url');
    expect(result?.message).toContain('http');
  });

  it('should return error for invalid method', () => {
    const result = validateProxyRequest({ url: 'https://example.com', method: 'INVALID' }, maxTimeout);
    expect(result?.field).toBe('method');
  });

  it('should accept valid methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
    for (const method of methods) {
      const result = validateProxyRequest({ url: 'https://example.com', method }, maxTimeout);
      expect(result).toBeNull();
    }
  });

  it('should return error for timeout exceeding max', () => {
    const result = validateProxyRequest({ url: 'https://example.com', timeout: 60000 }, maxTimeout);
    expect(result?.field).toBe('timeout');
    expect(result?.message).toContain('30000');
  });

  it('should return error for invalid timeout type', () => {
    const result = validateProxyRequest({ url: 'https://example.com', timeout: 'fast' }, maxTimeout);
    expect(result?.field).toBe('timeout');
  });

  describe('Auth Validation', () => {
    it('should return error for invalid auth type', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'oauth', credentials: 'token' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.type');
    });

    it('should return error for missing auth credentials', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'bearer' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.credentials');
    });

    it('should return error for empty auth credentials', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'bearer', credentials: '' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.credentials');
    });

    it('should accept valid bearer auth', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'bearer', credentials: 'mytoken123' },
      }, maxTimeout);
      expect(result).toBeNull();
    });

    it('should accept valid basic auth', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'basic', credentials: 'dXNlcjpwYXNz' },
      }, maxTimeout);
      expect(result).toBeNull();
    });

    it('should accept valid api-key auth', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'api-key', credentials: 'secret-key' },
      }, maxTimeout);
      expect(result).toBeNull();
    });

    it('should accept api-key auth with custom header name', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'api-key', credentials: 'secret-key', headerName: 'X-Custom-Key' },
      }, maxTimeout);
      expect(result).toBeNull();
    });

    it('should return error for empty headerName on api-key auth', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'api-key', credentials: 'secret-key', headerName: '' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.headerName');
    });

    it('should reject blocked header names (Host)', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'api-key', credentials: 'secret-key', headerName: 'Host' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.headerName');
      expect(result?.message).toContain('restricted');
    });

    it('should reject blocked header names (Authorization)', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'api-key', credentials: 'secret-key', headerName: 'Authorization' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.headerName');
      expect(result?.message).toContain('restricted');
    });

    it('should reject blocked header names case-insensitively', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'api-key', credentials: 'secret-key', headerName: 'content-length' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.headerName');
      expect(result?.message).toContain('restricted');
    });

    it('should reject Transfer-Encoding header', () => {
      const result = validateProxyRequest({
        url: 'https://example.com',
        auth: { type: 'api-key', credentials: 'secret-key', headerName: 'Transfer-Encoding' },
      }, maxTimeout);
      expect(result?.field).toBe('auth.headerName');
    });
  });

  it('should accept valid proxy request', () => {
    const result = validateProxyRequest({
      url: 'https://api.example.com/data',
      method: 'POST',
      body: { key: 'value' },
      timeout: 5000,
      contentType: 'application/json',
      accept: 'application/json',
      auth: { type: 'bearer', credentials: 'token123' },
    }, maxTimeout);
    expect(result).toBeNull();
  });
});
