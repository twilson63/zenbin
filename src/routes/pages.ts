import { Hono } from 'hono';
import { config } from '../config.js';
import { savePage, getPage } from '../storage/db.js';
import { generateEtag } from '../utils/etag.js';
import { validateId, validatePageBody, decodeHtml } from '../utils/validation.js';

const pages = new Hono();

interface CreatePageBody {
  html: string;
  encoding?: 'utf-8' | 'base64';
  content_type?: string;
  title?: string;
}

// POST /v1/pages/:id - Create or replace a page
pages.post('/:id', async (c) => {
  const id = c.req.param('id');

  // Validate ID
  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  // Parse and validate body
  let body: CreatePageBody;
  try {
    body = await c.req.json<CreatePageBody>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const bodyError = validatePageBody(body);
  if (bodyError) {
    return c.json({ error: bodyError.message }, 400);
  }

  // Check if ID is already taken
  const existing = getPage(id);
  if (existing) {
    return c.json({ error: `Page ID "${id}" is already taken` }, 409);
  }

  // Decode HTML if base64 encoded
  const decodedHtml = decodeHtml(body.html, body.encoding);

  // Generate ETag from decoded content
  const etag = generateEtag(decodedHtml);

  // Save to database
  const { page, created } = await savePage(
    id,
    {
      html: decodedHtml, // Store decoded HTML
      encoding: 'utf-8', // Always store as utf-8
      content_type: body.content_type,
      title: body.title,
    },
    etag
  );

  // Build response URLs
  const baseUrl = config.baseUrl;
  const response = {
    id: page.id,
    url: `${baseUrl}/p/${page.id}`,
    raw_url: `${baseUrl}/p/${page.id}/raw`,
    etag: page.etag,
  };

  c.header('ETag', page.etag);
  
  return c.json(response, 201);
});

export { pages };
