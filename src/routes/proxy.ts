import { Hono } from 'hono';
import { config } from '../config.js';
import { validateProxyRequest, ProxyRequest } from '../utils/validation.js';
import { resolveAndValidate } from '../utils/ssrf.js';

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

const proxy = new Hono();

proxy.post('/', async (c) => {
  // 1. Verify Content-Type is application/json
  const contentType = c.req.header('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return c.json({ error: 'Content-Type must be application/json' }, 403);
  }

  // 2. Verify request origin via Referer/Origin header matches config.baseUrl
  const referer = c.req.header('referer');
  const origin = c.req.header('origin');
  const baseUrlOrigin = new URL(config.baseUrl).origin;

  let originValid = false;
  if (origin) {
    originValid = origin === baseUrlOrigin;
  } else if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      originValid = refererOrigin === baseUrlOrigin;
    } catch {
      originValid = false;
    }
  }

  if (!originValid) {
    return c.json({ error: 'Request must originate from ZenBin page' }, 403);
  }

  // 3. Check request body size against config.proxyMaxRequestSize
  const contentLength = c.req.header('content-length');
  if (contentLength && parseInt(contentLength, 10) > config.proxyMaxRequestSize) {
    return c.json({ error: 'Request body too large' }, 413);
  }

  // 4. Parse and validate request body
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON in request body' }, 400);
  }

  const validationError = validateProxyRequest(body, config.proxyTimeoutMs);
  if (validationError) {
    return c.json({ error: `${validationError.field}: ${validationError.message}` }, 400);
  }

  const proxyReq = body as ProxyRequest;

  // 5. Check domain allowlist
  if (config.proxyAllowedDomains.length > 0) {
    const targetUrl = new URL(proxyReq.url);
    const hostname = targetUrl.hostname.toLowerCase();
    const isAllowed = config.proxyAllowedDomains.some(
      domain => hostname === domain.toLowerCase() || hostname.endsWith('.' + domain.toLowerCase())
    );
    if (!isAllowed) {
      return c.json({ error: 'Target domain is not in the allowlist' }, 400);
    }
  }

  // 6. SSRF validation (resolveAndValidate)
  try {
    await resolveAndValidate(proxyReq.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SSRF validation failed';
    return c.json({ error: message }, 400);
  }

  // 7. Build headers for outgoing request
  const outgoingHeaders: Record<string, string> = {
    'User-Agent': 'ZenBin-Proxy/1.0',
  };

  if (proxyReq.contentType) {
    outgoingHeaders['Content-Type'] = proxyReq.contentType;
  } else if (proxyReq.body !== undefined) {
    outgoingHeaders['Content-Type'] = 'application/json';
  }

  if (proxyReq.accept) {
    outgoingHeaders['Accept'] = proxyReq.accept;
  }

  // Build auth header
  if (proxyReq.auth) {
    switch (proxyReq.auth.type) {
      case 'bearer':
        outgoingHeaders['Authorization'] = `Bearer ${proxyReq.auth.credentials}`;
        break;
      case 'basic':
        outgoingHeaders['Authorization'] = `Basic ${proxyReq.auth.credentials}`;
        break;
      case 'api-key':
        const headerName = proxyReq.auth.headerName || 'X-API-Key';
        outgoingHeaders[headerName] = proxyReq.auth.credentials;
        break;
    }
  }

  // 8. Make fetch with timeout and redirect limit
  const method = (proxyReq.method || 'GET').toUpperCase();
  const timeout = proxyReq.timeout || config.proxyTimeoutMs;
  const maxRedirects = config.proxyMaxRedirects;

  let currentUrl = proxyReq.url;
  let redirectCount = 0;
  let response: Response | null = null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    while (redirectCount <= maxRedirects) {
      const fetchOptions: RequestInit = {
        method: redirectCount === 0 ? method : 'GET', // Follow redirects with GET
        headers: outgoingHeaders,
        signal: controller.signal,
        redirect: 'manual',
      };

      // Only include body on first request and if method supports it
      if (redirectCount === 0 && proxyReq.body !== undefined && !['GET', 'HEAD'].includes(method)) {
        fetchOptions.body = JSON.stringify(proxyReq.body);
      }

      response = await fetch(currentUrl, fetchOptions);

      // Check for redirect
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          break; // No location header, treat as final response
        }

        // Resolve relative URLs
        const redirectUrl = new URL(location, currentUrl).toString();

        // Validate redirect target for SSRF
        try {
          await resolveAndValidate(redirectUrl);
        } catch (err) {
          clearTimeout(timeoutId);
          const message = err instanceof Error ? err.message : 'SSRF validation failed on redirect';
          return c.json({ error: `Redirect blocked: ${message}` }, 400);
        }

        // Check domain allowlist for redirect
        if (config.proxyAllowedDomains.length > 0) {
          const redirectHostname = new URL(redirectUrl).hostname.toLowerCase();
          const isAllowed = config.proxyAllowedDomains.some(
            domain => redirectHostname === domain.toLowerCase() || redirectHostname.endsWith('.' + domain.toLowerCase())
          );
          if (!isAllowed) {
            clearTimeout(timeoutId);
            return c.json({ error: 'Redirect target domain is not in the allowlist' }, 400);
          }
        }

        currentUrl = redirectUrl;
        redirectCount++;

        if (redirectCount > maxRedirects) {
          clearTimeout(timeoutId);
          return c.json({ error: `Too many redirects (max: ${maxRedirects})` }, 502);
        }

        continue;
      }

      // Not a redirect, we have our final response
      break;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      return c.json({ error: 'Request timed out' }, 504);
    }
    const message = err instanceof Error ? err.message : 'Failed to fetch target URL';
    return c.json({ error: message }, 502);
  }

  clearTimeout(timeoutId);

  if (!response) {
    return c.json({ error: 'No response received' }, 502);
  }

  // 9. Check response size against config.proxyMaxResponseSize
  const responseContentLength = response.headers.get('content-length');
  if (responseContentLength && parseInt(responseContentLength, 10) > config.proxyMaxResponseSize) {
    return c.json({ error: 'Response too large' }, 502);
  }

  // Read response body with size limit
  let responseBody: string;
  try {
    const reader = response.body?.getReader();
    if (!reader) {
      responseBody = '';
    } else {
      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalSize += value.length;
        if (totalSize > config.proxyMaxResponseSize) {
          reader.cancel();
          return c.json({ error: 'Response too large' }, 502);
        }

        chunks.push(value);
      }

      const decoder = new TextDecoder();
      const decodedChunks = chunks.map(chunk => decoder.decode(chunk, { stream: true }));
      decodedChunks.push(decoder.decode()); // Flush remaining bytes for multi-byte characters
      responseBody = decodedChunks.join('');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read response body';
    return c.json({ error: message }, 502);
  }

  // 10. Parse response and strip sensitive headers
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Strip Set-Cookie headers
    if (lowerKey !== 'set-cookie') {
      responseHeaders[key] = value;
    }
  });

  // Try to parse response as JSON, otherwise return as text
  let parsedBody: unknown;
  const responseContentType = response.headers.get('content-type') || '';
  if (responseContentType.includes('application/json')) {
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = responseBody;
    }
  } else {
    parsedBody = responseBody;
  }

  // 11. Return ProxyResponse
  const proxyResponse: ProxyResponse = {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: parsedBody,
  };

  return c.json(proxyResponse);
});

export { proxy };
