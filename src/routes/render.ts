import { Hono } from 'hono';
import { getPage } from '../storage/db.js';
import { validateId } from '../utils/validation.js';
import { etagMatches } from '../utils/etag.js';

const render = new Hono();

// Security headers for sandboxed rendering
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'none'",
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

// GET /p/:id - Render page in browser
render.get('/:id', (c) => {
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

  // Check If-None-Match for caching
  const ifNoneMatch = c.req.header('If-None-Match');
  if (etagMatches(ifNoneMatch, page.etag)) {
    return c.body(null, 304);
  }

  // Set security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(key, value);
  }

  // Set caching headers
  c.header('ETag', page.etag);
  c.header('Cache-Control', 'public, max-age=0, must-revalidate');

  // Return HTML
  c.header('Content-Type', page.content_type || 'text/html; charset=utf-8');
  return c.body(page.html);
});

// GET /p/:id/raw - Fetch raw HTML
render.get('/:id/raw', (c) => {
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

  return c.body(page.html);
});

export { render };
