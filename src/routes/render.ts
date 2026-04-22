import { promises as fs } from 'fs';
import { Hono, Context } from 'hono';
import { getPage } from '../storage/db.js';
import { validateId } from '../utils/validation.js';
import { generateEtag, etagMatches } from '../utils/etag.js';
import { verifyPassword, verifyUrlToken, parseBasicAuth } from '../utils/auth.js';
import { checkAuthRateLimit, recordFailedAttempt, resetAuthAttempts } from '../middleware/authRateLimit.js';
import { trackPageView } from '../analytics/posthog.js';
import { injectPostHog, shouldInjectPostHog } from '../utils/posthog-inject.js';
import { getVideoMimeType, getVideoPath, videoExists } from '../storage/video.js';
import type { Page } from '../storage/db.js';

const render = new Hono();

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

async function serveStoredVideo(c: Context, page: Page, filename: string) {
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
  c.header('Content-Disposition', `inline; filename="${filename}"`);
  c.header('ETag', etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  return c.body(await fs.readFile(filePath));
}

function serveBinary(c: Context, bodyBase64: string, contentType: string, filename: string) {
  const etag = generateEtag(bodyBase64);
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, etag)) {
    return c.body(null, 304);
  }

  const buffer = Buffer.from(bodyBase64, 'base64');
  c.header('Content-Type', contentType);
  c.header('Content-Disposition', `inline; filename="${filename}"`);
  c.header('ETag', etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  return c.body(buffer);
}

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

async function verifyPageAuth(c: Context, page: Page): Promise<Response | null> {
  if (!page.auth) {
    return null;
  }

  const pageId = page.id;
  const rateCheck = checkAuthRateLimit(pageId);
  if (!rateCheck.allowed) {
    c.header('Retry-After', String(rateCheck.retryAfter));
    return c.json({ error: 'Too many failed authentication attempts' }, 429);
  }

  const urlToken = c.req.query('token');
  if (urlToken && page.auth.urlTokenHash) {
    if (verifyUrlToken(urlToken, page.auth.urlTokenHash)) {
      resetAuthAttempts(pageId);
      return null;
    }
    recordFailedAttempt(pageId);
  }

  const authHeader = c.req.header('Authorization');
  const basicAuth = parseBasicAuth(authHeader);

  if (!basicAuth) {
    c.header('WWW-Authenticate', `Basic realm="ZenBin-${pageId}"`);
    return c.json({ error: 'Authentication required' }, 401);
  }

  if (page.auth.passwordHash) {
    const validPassword = await verifyPassword(basicAuth.password, page.auth.passwordHash);
    if (validPassword) {
      resetAuthAttempts(pageId);
      return null;
    }
  }

  recordFailedAttempt(pageId);
  c.header('WWW-Authenticate', `Basic realm="ZenBin-${pageId}"`);
  return c.json({ error: 'Invalid credentials' }, 401);
}

function trackRequestView(c: Context, pageId: string) {
  trackPageView({
    pageId,
    referrer: c.req.header('Referer'),
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
  });
}

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

  const acceptHeader = c.req.header('Accept') || '';
  const wantsMarkdown = acceptHeader.includes('text/markdown');

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
    trackRequestView(c, id);
    return c.body(page.markdown);
  }

  if (!page.html && page.markdown) {
    const mdEtag = generateEtag(page.markdown);
    const ifNoneMatch = c.req.header('If-None-Match');
    if (etagMatches(ifNoneMatch, mdEtag)) {
      return c.body(null, 304);
    }

    c.header('Content-Type', 'text/markdown; charset=utf-8');
    c.header('ETag', mdEtag);
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
    trackRequestView(c, id);
    return c.body(page.markdown);
  }

  if (page.image && !page.html) {
    trackRequestView(c, id);
    return serveBinary(c, page.image, getImageContentType(page), id);
  }

  if (page.video && !page.html) {
    trackRequestView(c, id);
    return serveStoredVideo(c, page, id);
  }

  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, page.etag)) {
    return c.body(null, 304);
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(key, value);
  }

  c.header('Content-Type', getDocumentContentType(page));
  c.header('ETag', page.etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');

  trackRequestView(c, id);

  const html = shouldInjectPostHog(page.html)
    ? injectPostHog(page.html)
    : page.html;

  return c.body(html);
});

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

  trackRequestView(c, id);
  return serveBinary(c, page.image, getImageContentType(page), id);
});

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

  trackRequestView(c, id);
  return serveStoredVideo(c, page, id);
});

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
  trackRequestView(c, id);
  return c.body(page.markdown);
});

render.get('/:id/raw', async (c) => {
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

  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, page.etag)) {
    return c.body(null, 304);
  }

  c.header('Content-Type', 'text/plain; charset=utf-8');
  c.header('Content-Disposition', `inline; filename="${id}.html"`);
  c.header('ETag', page.etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  trackRequestView(c, id);
  return c.body(page.html);
});

export { render };
