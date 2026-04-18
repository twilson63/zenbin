import { Hono } from 'hono';
import { config } from '../config.js';
import { saveSubdomain, getSubdomain, deleteSubdomain, listPagesBySubdomain } from '../storage/db.js';
import { validateId } from '../utils/validation.js';
import { trackSubdomainEvent, trackApiCall } from '../analytics/posthog.js';

const subdomains = new Hono();

// Reserved subdomain names that cannot be claimed
const RESERVED_NAMES = new Set(config.subdomains.reservedNames);

// Valid subdomain name pattern (alphanumeric and hyphens, must start with letter)
const SUBDOMAIN_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;

// Validate subdomain name
function validateSubdomainName(name: string): { valid: boolean; error?: string } {
  // Check length
  if (name.length < 3) {
    return { valid: false, error: 'Subdomain must be at least 3 characters' };
  }
  if (name.length > config.subdomains.maxLength) {
    return { valid: false, error: `Subdomain must be at most ${config.subdomains.maxLength} characters` };
  }
  
  // Check pattern
  if (!SUBDOMAIN_PATTERN.test(name)) {
    return { valid: false, error: 'Subdomain must start with a letter, contain only lowercase letters, numbers, and hyphens, and end with a letter or number' };
  }
  
  // Check reserved
  if (RESERVED_NAMES.has(name)) {
    return { valid: false, error: `Subdomain '${name}' is reserved` };
  }
  
  return { valid: true };
}

// POST /v1/subdomains/:name - Claim a subdomain
subdomains.post('/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();
  
  // Validate name
  const validation = validateSubdomainName(name);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }
  
  // Check if subdomain exists
  const existing = getSubdomain(name);
  if (existing) {
    return c.json({ error: `Subdomain '${name}' is already taken` }, 409);
  }
  
  // Claim the subdomain
  const { subdomain, created } = await saveSubdomain(name);

  // Track subdomain creation
  if (created) {
    trackSubdomainEvent('subdomain_created', name);
  }

  trackApiCall({
    endpoint: '/v1/subdomains/:name',
    method: 'POST',
    statusCode: created ? 201 : 200,
  });

  const baseUrl = config.baseUrl.replace(/^https?:\/\//, '');
  const protocol = config.baseUrl.startsWith('https') ? 'https' : 'http';
  
  return c.json({
    name: subdomain.name,
    url: `${protocol}://${subdomain.name}.${baseUrl}`,
    created_at: subdomain.created_at,
  }, created ? 201 : 200);
});

// GET /v1/subdomains/:name - Get subdomain info
subdomains.get('/:name', (c) => {
  const name = c.req.param('name').toLowerCase();
  
  const subdomain = getSubdomain(name);
  if (!subdomain) {
    return c.json({ error: `Subdomain '${name}' not found` }, 404);
  }
  
  const baseUrl = config.baseUrl.replace(/^https?:\/\//, '');
  const protocol = config.baseUrl.startsWith('https') ? 'https' : 'http';
  
  return c.json({
    name: subdomain.name,
    url: `${protocol}://${subdomain.name}.${baseUrl}`,
    page_count: subdomain.page_count,
    created_at: subdomain.created_at,
    updated_at: subdomain.updated_at,
  });
});

// GET /v1/subdomains/:name/pages - List pages in subdomain
subdomains.get('/:name/pages', (c) => {
  const name = c.req.param('name').toLowerCase();
  
  const subdomain = getSubdomain(name);
  if (!subdomain) {
    return c.json({ error: `Subdomain '${name}' not found` }, 404);
  }
  
  const pages = listPagesBySubdomain(name);
  
  const baseUrl = config.baseUrl.replace(/^https?:\/\//, '');
  const protocol = config.baseUrl.startsWith('https') ? 'https' : 'http';
  
  return c.json({
    subdomain: name,
    url: `${protocol}://${name}.${baseUrl}`,
    pages: pages.map(page => ({
      id: page.id,
      path: page.id === 'index' ? '/' : `/${page.id}`,
      title: page.title,
      url: `${protocol}://${name}.${baseUrl}${page.id === 'index' ? '/' : `/${page.id}`}`,
    })),
    total: pages.length,
  });
});

// DELETE /v1/subdomains/:name - Delete a subdomain and all its pages
subdomains.delete('/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();

  const existing = getSubdomain(name);
  if (!existing) {
    return c.json({ error: `Subdomain '${name}' not found` }, 404);
  }

  const pageCount = existing.page_count;
  const deleted = await deleteSubdomain(name);

  if (!deleted) {
    return c.json({ error: `Failed to delete subdomain '${name}'` }, 500);
  }

  // Track subdomain deletion
  trackSubdomainEvent('subdomain_deleted', name, { pageCount });

  trackApiCall({
    endpoint: '/v1/subdomains/:name',
    method: 'DELETE',
    statusCode: 204,
  });

  return c.body(null, 204);
});

export { subdomains, validateSubdomainName };