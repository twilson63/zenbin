import { Hono, Context } from 'hono';
import { getPage } from '../storage/db.js';
import { validateId } from '../utils/validation.js';
import { generateEtag, etagMatches } from '../utils/etag.js';
import { verifyPassword, verifyUrlToken, parseBasicAuth } from '../utils/auth.js';
import { checkAuthRateLimit, recordFailedAttempt, resetAuthAttempts } from '../middleware/authRateLimit.js';
import { trackPageView } from '../analytics/posthog.js';
import { injectPostHog, shouldInjectPostHog } from '../utils/posthog-inject.js';
import { videoExists, getVideoPath, getVideoStats, createVideoStream, getVideoMimeType } from '../storage/video.js';
import type { Page } from '../storage/db.js';

const render = new Hono();

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
    "connect-src *", // Allow hosted apps to make fetch/WebSocket requests
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

/**
 * Verify page authentication
 * Returns null if auth succeeds, or a Response if it fails
 */
async function verifyPageAuth(c: Context, page: Page): Promise<Response | null> {
  // Public page - no auth needed
  if (!page.auth) {
    return null;
  }

  const pageId = page.id;

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

// GET /p/:id - Render page in browser
// GET /p/:id/image - Serve image directly
render.get('/:id', async (c) => {
  const id = c.req.param('id');

  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  const page = getPage(id);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
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
    c.header('Content-Disposition', `inline; filename="${id}.md"`);
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
    c.header('Content-Disposition', `inline; filename="${id}.md"`);
    c.header('ETag', mdEtag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');

    return c.body(page.markdown);
  }

  // If page has image but no HTML, serve image directly
  if (page.image && !page.html) {
    const imgEtag = generateEtag(page.image);
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, imgEtag)) {
      return c.body(null, 304);
    }

    const imageBuffer = Buffer.from(page.image, 'base64');
    
    c.header('Content-Type', page.content_type);
    c.header('Content-Disposition', `inline; filename="${id}"`);
    c.header('ETag', imgEtag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');

    // Track page view
    trackPageView({
      pageId: id,
      referrer: c.req.header('Referer'),
      userAgent: c.req.header('User-Agent'),
      ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
    });

    return c.body(imageBuffer);
  }

  // If page has video but no HTML, redirect to the video endpoint
  if (page.video && !page.html) {
    return c.redirect(`/p/${id}/video`, 302);
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
  c.header('Content-Type', page.content_type || 'text/html; charset=utf-8');

  // Track page view
  trackPageView({
    pageId: id,
    referrer: c.req.header('Referer'),
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
  });

  /**
 * Inject a subtle "Powered by hyper.io" footer into HTML pages
 */
function injectFooter(html: string): string {
  const footer = `
<style>
.zenbin-footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 8px 16px; background: rgba(0,0,0,0.85); font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: #888; text-align: center; z-index: 9999; }
.zenbin-footer a { color: #10b981; text-decoration: none; }
.zenbin-footer a:hover { text-decoration: underline; }
</style>
<div class="zenbin-footer">
  powered by <a href="https://hyper.io" target="_blank">hyper.io</a>
</div>`;
  
  // Inject before </body> or append to end
  if (html.includes('</body>')) {
    return html.replace('</body>', `${footer}</body>`);
  }
  return html + footer;
}

// Inject PostHog tracking for HTML pages
  const html = shouldInjectPostHog(page.content_type || 'text/html')
    ? injectFooter(injectPostHog(page.html))
    : injectFooter(page.html);

  return c.body(html);
});

// GET /p/:id/image - Serve image directly
render.get('/:id/image', async (c) => {
  const id = c.req.param('id');

  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  const page = getPage(id);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }

  if (!page.image) {
    return c.json({ error: 'Page has no image content' }, 404);
  }

  const imgEtag = generateEtag(page.image);
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, imgEtag)) {
    return c.body(null, 304);
  }

  const imageBuffer = Buffer.from(page.image, 'base64');

  c.header('Content-Type', page.content_type);
  c.header('Content-Disposition', `inline; filename="${id}"`);
  c.header('ETag', imgEtag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');

  // Track page view (image)
  trackPageView({
    pageId: id,
    referrer: c.req.header('Referer'),
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
  });

  return c.body(imageBuffer);
});

// GET /p/:id/md - Return markdown source
render.get('/:id/md', async (c) => {
  const id = c.req.param('id');

  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  const page = getPage(id);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }

  if (!page.markdown) {
    return c.json({ error: 'Page has no markdown content' }, 404);
  }

  const mdEtag = generateEtag(page.markdown);
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, mdEtag)) {
    return c.body(null, 304);
  }

  c.header('Content-Type', 'text/markdown; charset=utf-8');
  c.header('Content-Disposition', `inline; filename="${id}.md"`);
  c.header('ETag', mdEtag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');

  // Track page view (markdown)
  trackPageView({
    pageId: id,
    referrer: c.req.header('Referer'),
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
  });

  return c.body(page.markdown);
});

// GET /p/:id/raw - Fetch raw HTML
render.get('/:id/raw', async (c) => {
  const id = c.req.param('id');

  // Validate ID
  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  // Get page from database
  const page = getPage(id);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  // Check authentication
  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }

  // Check If-None-Match for caching
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, page.etag)) {
    return c.body(null, 304);
  }

  // Set headers for raw content
  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Content-Disposition', `inline; filename="${id}.html"`);
  c.header('ETag', page.etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');

  // Track page view (raw)
  trackPageView({
    pageId: id,
    referrer: c.req.header('Referer'),
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
  });

  return c.body(page.html);
});

// GET /p/:id/video - Stream video with Range support
render.get('/:id/video', async (c) => {
  const id = c.req.param('id');

  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  const page = getPage(id);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const authResponse = await verifyPageAuth(c, page);
  if (authResponse) {
    return authResponse;
  }

  if (!page.video) {
    return c.json({ error: 'Page has no video content' }, 404);
  }

  // Check if video file exists
  if (!videoExists(page.video)) {
    return c.json({ error: 'Video file not found' }, 404);
  }

  // Get video stats for size
  const stats = await getVideoStats(page.video);
  if (!stats) {
    return c.json({ error: 'Video file not found' }, 404);
  }

  const fileSize = stats.size;
  const mimeType = getVideoMimeType(page.video);

  // Handle Range request for video seeking
  const range = c.req.header('Range');
  
  if (range) {
    // Parse Range header (e.g., "bytes=0-1023")
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    
    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      return c.json({ error: 'Invalid range' }, 416);
    }

    const chunkSize = end - start + 1;
    const stream = createVideoStream(page.video, { start, end });

    if (!stream) {
      return c.json({ error: 'Failed to stream video' }, 500);
    }

    c.header('Content-Type', mimeType);
    c.header('Content-Length', String(chunkSize));
    c.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    c.header('Accept-Ranges', 'bytes');
    c.header('Cache-Control', 'public, max-age=31536000'); // Cache videos for 1 year

    // Track page view (video)
    trackPageView({
      pageId: id,
      referrer: c.req.header('Referer'),
      userAgent: c.req.header('User-Agent'),
      ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
    });

    return new Response(stream as any, { status: 206 });
  }

  // Full file request (no Range header)
  const stream = createVideoStream(page.video);
  
  if (!stream) {
    return c.json({ error: 'Failed to stream video' }, 500);
  }

  c.header('Content-Type', mimeType);
  c.header('Content-Length', String(fileSize));
  c.header('Accept-Ranges', 'bytes');
  c.header('Cache-Control', 'public, max-age=31536000'); // Cache videos for 1 year

  // Track page view (video)
  trackPageView({
    pageId: id,
    referrer: c.req.header('Referer'),
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
  });

  return new Response(stream as any);
});

export { render };
