import { promises as fs } from 'fs';
import { Hono, Context, Next } from 'hono';
import { config } from '../config.js';
import { getPage, getSubdomain } from '../storage/db.js';
import { validateId } from '../utils/validation.js';
import { generateEtag, etagMatches } from '../utils/etag.js';
import { verifyPassword, verifyUrlToken, parseBasicAuth } from '../utils/auth.js';
import { checkAuthRateLimit, recordFailedAttempt, resetAuthAttempts } from '../middleware/authRateLimit.js';
import { verifySignToRead } from '../middleware/signToRead.js';
import { getVideoMimeType, getVideoPath, videoExists } from '../storage/video.js';
import { injectProvenanceMeta, injectProvenanceHttpHeaders } from '../utils/provenance.js';
import { injectPostHog, shouldInjectPostHog } from '../utils/posthog-inject.js';
import type { Page } from '../storage/db.js';

// Type for context variables
type Variables = {
  subdomain: string;
};

const subdomainRender = new Hono<{ Variables: Variables }>();

subdomainRender.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const normalizedPath = url.pathname.replace(/\/{2,}/g, '/');
  if (normalizedPath !== url.pathname) {
    return c.redirect(`${normalizedPath}${url.search}`, 307);
  }
  await next();
});

function getDocumentContentType(page: Page): string {
  if (page.html && (page.content_type?.startsWith('image/') || page.content_type?.startsWith('video/'))) {
    return 'text/html; charset=utf-8';
  }
  return page.content_type || 'text/html; charset=utf-8';
}

function getImageContentType(page: Page): string {
  return page.image_content_type || (page.image ? page.content_type : '') || 'application/octet-stream';
}

function getVideoContentType(page: Page): string {
  return page.video_content_type || (page.video ? page.content_type : '') || 'application/octet-stream';
}

function buildSubdomainPageId(path: string): string {
  if (path === '' || path === '/') {
    return 'index';
  }
  return path.slice(1);
}

function buildBinaryResponse(c: Context, bodyBase64: string, contentType: string) {
  const etag = generateEtag(bodyBase64);
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, etag)) {
    return c.body(null, 304);
  }

  const buffer = Buffer.from(bodyBase64, 'base64');
  c.header('Content-Type', contentType);
  c.header('ETag', etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  return c.body(buffer);
}

async function buildStoredVideoResponse(c: Context, page: Page) {
  if (!page.video || !videoExists(page.video)) {
    return c.json({ error: 'Video file not found' }, 404);
  }

  const filePath = getVideoPath(page.video);
  const stats = await fs.stat(filePath);
  const etag = generateEtag(`${page.video}:${stats.size}:${stats.mtimeMs}`);
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, etag)) {
    return c.body(null, 304);
  }

  c.header('Content-Type', getVideoContentType(page) || getVideoMimeType(page.video));
  c.header('ETag', etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  return c.body(await fs.readFile(filePath));
}

// Security headers for sandboxed rendering
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self' https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "media-src 'self' https:",
    "frame-src 'self' https:",
    "connect-src *",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
  'X-Frame-Options': 'DENY',
};

// Placeholder HTML for new/empty subdomains
const getPlaceholderPage = (subdomain: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subdomain} - ZenBin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%);
      color: #e8e8ed;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #f97316;
    }
    p {
      color: #8b8b99;
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }
    code {
      background: #12121a;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-family: 'SF Mono', Monaco, monospace;
      color: #22c55e;
    }
    a {
      color: #f97316;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${subdomain}</h1>
    <p>This subdomain is ready for content.</p>
    <p><code>POST /v1/pages/index -H "X-Subdomain: ${subdomain}"</code></p>
    <p style="margin-top: 2rem; font-size: 0.9rem;">
      <a href="https://zenbin.org">ZenBin</a> — Publish from your AI agent
    </p>
  </div>
</body>
</html>`;

// 404 page for subdomains
const getNotFoundPage = (subdomain: string, path: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - ${subdomain}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%);
      color: #e8e8ed;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 6rem;
      color: #f97316;
    }
    p {
      color: #8b8b99;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    code {
      background: #12121a;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, monospace;
      color: #e8e8ed;
    }
    a {
      color: #f97316;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Page not found: <code>${path}</code></p>
    <p>Subdomain: <code>${subdomain}</code></p>
    <p style="margin-top: 2rem;">
      <a href="/">Return home</a>
    </p>
  </div>
</body>
</html>`;

// Non-existent subdomain page
const getNonExistentSubdomainPage = (subdomain: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subdomain not found - ZenBin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%);
      color: #e8e8ed;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #ef4444;
    }
    p {
      color: #8b8b99;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    code {
      background: #12121a;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-family: 'SF Mono', Monaco, monospace;
      color: #e8e8ed;
    }
    a {
      color: #f97316;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Subdomain not found</h1>
    <p><code>${subdomain}</code> doesn't exist yet.</p>
    <p style="margin-top: 1rem;"><code>POST /v1/subdomains/${subdomain}</code></p>
    <p style="margin-top: 2rem; font-size: 0.9rem;">
      <a href="https://zenbin.org">ZenBin</a> — Publish from your AI agent
    </p>
  </div>
</body>
</html>`;

/**
 * Verify page authentication
 * Returns null if auth succeeds, or a Response if it fails
 */
async function verifyPageAuth(c: Context, page: Page): Promise<Response | null> {
  // Public page - no auth needed
  if (!page.auth) {
    return null;
  }

  const pageId = page.subdomain ? `${page.subdomain}:${page.id}` : page.id;

  // Check rate limit first
  const rateCheck = checkAuthRateLimit(pageId);
  if (!rateCheck.allowed) {
    c.header('Retry-After', String(rateCheck.retryAfter));
    return c.json({ error: 'Too many failed authentication attempts' }, 429);
  }

  // Check URL token first (query param)
  const urlToken = c.req.query('token');
  if (urlToken && page.auth.urlTokenHash) {
    if (verifyUrlToken(urlToken, page.auth.urlTokenHash)) {
      resetAuthAttempts(pageId);
      return null; // Success
    }
    // Invalid token - record failure and continue to password check
    recordFailedAttempt(pageId);
  }

  const signToReadResult = await verifySignToRead(c, page, pageId);
  if (signToReadResult.kind === 'authorized') {
    return null;
  }
  if (signToReadResult.kind === 'response') {
    return signToReadResult.response;
  }

  // Check Basic Auth header
  const authHeader = c.req.header('Authorization');
  const basicAuth = parseBasicAuth(authHeader);

  if (!basicAuth) {
    // No auth provided - prompt for password
    c.header('WWW-Authenticate', `Basic realm="ZenBin-${pageId}"`);
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Verify password
  if (page.auth.passwordHash) {
    const validPassword = await verifyPassword(basicAuth.password, page.auth.passwordHash);
    if (validPassword) {
      resetAuthAttempts(pageId);
      return null; // Success
    }
  }

  // Auth failed
  recordFailedAttempt(pageId);
  c.header('WWW-Authenticate', `Basic realm="ZenBin-${pageId}"`);
  return c.json({ error: 'Invalid credentials' }, 401);
}

// Middleware to extract subdomain from host header
const extractSubdomain = async (c: Context, next: Next) => {
  const host = c.req.header('host') || '';
  
  // Check if this is a subdomain request
  // host format: subdomain.zenbin.io or just zenbin.io
  const parts = host.split('.');
  
  if (parts.length >= 3) {
    // This looks like a subdomain request: something.zenbin.io
    const potentialSubdomain = parts[0].toLowerCase();
    
    // Check if it's a reserved name (should route to main site)
    const reserved = new Set(config.subdomains.reservedNames);
    if (!reserved.has(potentialSubdomain) && potentialSubdomain !== 'www') {
      // This is a real subdomain request
      c.set('subdomain', potentialSubdomain);
    }
  }
  
  await next();
};

// Check if this is a subdomain request - if not, skip to next route
const requireSubdomain = async (c: Context, next: Next) => {
  const subdomain = c.get('subdomain');
  if (!subdomain) {
    // Not a subdomain request - call next() to let other routes handle it
    return next();
  }
  // Is a subdomain request - continue to the route handlers
  await next();
};

// Apply middleware to all routes
subdomainRender.use('*', extractSubdomain, requireSubdomain);

// GET /* - Render subdomain page (only handles subdomain requests)
subdomainRender.get('/*', async (c) => {
  const subdomain = c.get('subdomain');
  
  // Double-check we have a subdomain (should always be true due to requireSubdomain middleware)
  if (!subdomain) {
    return c.notFound();
  }
  
  // Check if subdomain exists
  const subdomainObj = getSubdomain(subdomain);
  if (!subdomainObj) {
    c.header('Content-Type', 'text/html; charset=utf-8');
    return c.body(getNonExistentSubdomainPage(subdomain), 404);
  }
  
  // Get the path and detect explicit asset/source suffixes before normal page rendering.
  const path = c.req.path;
  let explicitView: 'raw' | 'md' | 'image' | 'video' | null = null;
  let pageLookupPath = path;
  for (const suffix of ['/raw', '/md', '/image', '/video'] as const) {
    if (path === suffix || path.endsWith(suffix)) {
      explicitView = suffix.slice(1) as 'raw' | 'md' | 'image' | 'video';
      pageLookupPath = path.slice(0, -suffix.length) || '/';
      break;
    }
  }
  const pageId = buildSubdomainPageId(pageLookupPath);
  
  // Validate page ID
  const idError = validateId(pageId);
  if (idError) {
    c.header('Content-Type', 'text/html; charset=utf-8');
    return c.body(getNotFoundPage(subdomain, path), 404);
  }
  
  // Get the page
  const page = getPage(pageId, subdomain);
  
  // If no page found
  if (!page) {
    // Special case: if requesting root and no index page, show placeholder
    if (pageId === 'index') {
      c.header('Content-Type', 'text/html; charset=utf-8');
      return c.body(getPlaceholderPage(subdomain));
    }
    
    // Otherwise, show 404
    c.header('Content-Type', 'text/html; charset=utf-8');
    return c.body(getNotFoundPage(subdomain, path), 404);
  }
  
  // Check authentication
  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }
  
  // Inject CAP Protocol provenance headers for ALL response types
  injectProvenanceHttpHeaders(c, page);
  if (explicitView === 'raw') {
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, page.etag)) {
      return c.body(null, 304);
    }
    c.header('Content-Type', 'text/plain; charset=utf-8');
    c.header('ETag', page.etag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    return c.body(page.html);
  }

  if (explicitView === 'md') {
    if (!page.markdown) {
      return c.json({ error: 'Page has no markdown content' }, 404);
    }
    const mdEtag = generateEtag(page.markdown);
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, mdEtag)) {
      return c.body(null, 304);
    }
    c.header('Content-Type', 'text/markdown; charset=utf-8');
    c.header('ETag', mdEtag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    return c.body(page.markdown);
  }

  if (explicitView === 'image') {
    if (!page.image) {
      return c.json({ error: 'Page has no image content' }, 404);
    }
    return buildBinaryResponse(c, page.image, getImageContentType(page));
  }

  if (explicitView === 'video') {
    if (!page.video) {
      return c.json({ error: 'Page has no video content' }, 404);
    }
    return buildStoredVideoResponse(c, page);
  }

  // Check Accept header for markdown
  const acceptHeader = c.req.header('Accept') || '';
  const wantsMarkdown = acceptHeader.includes('text/markdown');
  
  // If client wants markdown and page has it, return markdown
  if (wantsMarkdown && page.markdown) {
    const mdEtag = generateEtag(page.markdown);
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, mdEtag)) {
      return c.body(null, 304);
    }
    
    c.header('Content-Type', 'text/markdown; charset=utf-8');
    c.header('ETag', mdEtag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    return c.body(page.markdown);
  }
  
  // If no HTML but has markdown, return markdown
  if (!page.html && page.markdown) {
    const mdEtag = generateEtag(page.markdown);
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, mdEtag)) {
      return c.body(null, 304);
    }
    
    c.header('Content-Type', 'text/markdown; charset=utf-8');
    c.header('ETag', mdEtag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    return c.body(page.markdown);
  }
  
  if (page.image && !page.html) {
    return buildBinaryResponse(c, page.image, getImageContentType(page));
  }

  if (page.video && !page.html) {
    return buildStoredVideoResponse(c, page);
  }

  // Check If-None-Match for caching HTML
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, page.etag)) {
    return c.body(null, 304);
  }
  
  // Set security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(key, value);
  }
  
  c.header('ETag', page.etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  c.header('Content-Type', getDocumentContentType(page));
  
  // CAP Protocol provenance meta tags (HTTP headers already injected after auth check)
  let html = page.html;
  html = injectProvenanceMeta(html, page);
  html = shouldInjectPostHog(html) ? injectPostHog(html) : html;
  
  return c.body(html);
});

// GET /*/raw - Fetch raw HTML from subdomain
subdomainRender.get('/*/raw', extractSubdomain, async (c) => {
  const subdomain = c.get('subdomain');
  
  if (!subdomain) {
    return c.redirect(config.baseUrl, 302);
  }
  
  const path = c.req.path.replace('/raw', '');
  const pageId = buildSubdomainPageId(path);
  
  // Validate page ID
  const idError = validateId(pageId);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }
  
  // Get page
  const page = getPage(pageId, subdomain);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }
  
  // Check authentication
  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }
  
  // Inject CAP Protocol provenance headers for ALL response types
  injectProvenanceHttpHeaders(c, page);
  
  // Check If-None-Match for caching
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, page.etag)) {
    return c.body(null, 304);
  }
  
  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('ETag', page.etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  
  return c.body(page.html);
});

// GET /*/md - Fetch markdown from subdomain
subdomainRender.get('/*/md', extractSubdomain, async (c) => {
  const subdomain = c.get('subdomain');
  
  if (!subdomain) {
    return c.redirect(config.baseUrl, 302);
  }
  
  const path = c.req.path.replace('/md', '');
  const pageId = buildSubdomainPageId(path);
  
  // Validate page ID
  const idError = validateId(pageId);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }
  
  // Get page
  const page = getPage(pageId, subdomain);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }
  
  // Check authentication
  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }
  
  // Inject CAP Protocol provenance headers for ALL response types
  injectProvenanceHttpHeaders(c, page);
  
  if (!page.markdown) {
    return c.json({ error: 'Page has no markdown content' }, 404);
  }
  
  const mdEtag = generateEtag(page.markdown);
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, mdEtag)) {
    return c.body(null, 304);
  }
  
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  c.header('ETag', mdEtag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  
  return c.body(page.markdown);
});

// GET /*/image - explicit image endpoint for subdomain pages
subdomainRender.get('/*/image', extractSubdomain, async (c) => {
  const subdomain = c.get('subdomain');
  if (!subdomain) {
    return c.redirect(config.baseUrl, 302);
  }

  const path = c.req.path.replace('/image', '');
  const pageId = buildSubdomainPageId(path);
  const idError = validateId(pageId);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  const page = getPage(pageId, subdomain);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }

  // Inject CAP Protocol provenance headers for ALL response types
  injectProvenanceHttpHeaders(c, page);

  if (!page.image) {
    return c.json({ error: 'Page has no image content' }, 404);
  }

  return buildBinaryResponse(c, page.image, getImageContentType(page));
});

// GET /*/video - explicit video endpoint for subdomain pages
subdomainRender.get('/*/video', extractSubdomain, async (c) => {
  const subdomain = c.get('subdomain');
  if (!subdomain) {
    return c.redirect(config.baseUrl, 302);
  }

  const path = c.req.path.replace('/video', '');
  const pageId = buildSubdomainPageId(path);
  const idError = validateId(pageId);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  const page = getPage(pageId, subdomain);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }

  // Inject CAP Protocol provenance headers for ALL response types
  injectProvenanceHttpHeaders(c, page);

  if (!page.video) {
    return c.json({ error: 'Page has no video content' }, 404);
  }

  return buildStoredVideoResponse(c, page);
});

export { subdomainRender };

// Export a function to serve subdomain pages directly (for use in unified handler)
export async function serveSubdomainPage(c: any, subdomain: string, path: string) {
  // Check if subdomain exists
  const subdomainObj = getSubdomain(subdomain);
  if (!subdomainObj) {
    c.header('Content-Type', 'text/html; charset=utf-8');
    return c.body(getNonExistentSubdomainPage(subdomain), 404);
  }
  
  // Detect explicit asset/source suffixes before normal page rendering.
  let explicitView: 'raw' | 'md' | 'image' | 'video' | null = null;
  let pageLookupPath = path;
  for (const suffix of ['/raw', '/md', '/image', '/video'] as const) {
    if (path === suffix || path.endsWith(suffix)) {
      explicitView = suffix.slice(1) as 'raw' | 'md' | 'image' | 'video';
      pageLookupPath = path.slice(0, -suffix.length) || '/';
      break;
    }
  }

  const pageId = buildSubdomainPageId(pageLookupPath);
  
  // Validate page ID
  const idError = validateId(pageId);
  if (idError) {
    c.header('Content-Type', 'text/html; charset=utf-8');
    return c.body(getNotFoundPage(subdomain, path), 404);
  }
  
  // Get the page
  const page = getPage(pageId, subdomain);
  
  // If no page found
  if (!page) {
    // Special case: if requesting root and no index page, show placeholder
    if (pageId === 'index') {
      c.header('Content-Type', 'text/html; charset=utf-8');
      return c.body(getPlaceholderPage(subdomain));
    }
    
    // Otherwise, show 404
    c.header('Content-Type', 'text/html; charset=utf-8');
    return c.body(getNotFoundPage(subdomain, path), 404);
  }
  
  // Check authentication
  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }

  // Inject CAP Protocol provenance headers for ALL response types
  injectProvenanceHttpHeaders(c, page);

  if (explicitView === 'raw') {
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, page.etag)) {
      return c.body(null, 304);
    }
    c.header('Content-Type', 'text/plain; charset=utf-8');
    c.header('ETag', page.etag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    return c.body(page.html);
  }

  if (explicitView === 'md') {
    if (!page.markdown) {
      return c.json({ error: 'Page has no markdown content' }, 404);
    }
    const mdEtag = generateEtag(page.markdown);
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, mdEtag)) {
      return c.body(null, 304);
    }
    c.header('Content-Type', 'text/markdown; charset=utf-8');
    c.header('ETag', mdEtag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    return c.body(page.markdown);
  }

  if (explicitView === 'image') {
    if (!page.image) {
      return c.json({ error: 'Page has no image content' }, 404);
    }
    return buildBinaryResponse(c, page.image, getImageContentType(page));
  }

  if (explicitView === 'video') {
    if (!page.video) {
      return c.json({ error: 'Page has no video content' }, 404);
    }
    return buildStoredVideoResponse(c, page);
  }
  
  if (page.image && !page.html) {
    return buildBinaryResponse(c, page.image, getImageContentType(page));
  }

  if (page.video && !page.html) {
    return buildStoredVideoResponse(c, page);
  }
  
  // Check If-None-Match for caching
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, page.etag)) {
    return c.body(null, 304);
  }
  
  // Set security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(key, value);
  }
  
  c.header('Content-Type', getDocumentContentType(page));
  c.header('ETag', page.etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  
  // CAP Protocol provenance meta tags (HTTP headers already injected after auth check)
  let html = page.html;
  html = injectProvenanceMeta(html, page);
  html = shouldInjectPostHog(html) ? injectPostHog(html) : html;
  
  return c.body(html);
}
