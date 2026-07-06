import { Context, Hono } from 'hono';
import { ErrorCodes, errorResponse } from '../errors.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import type { Services } from '../services/container.js';

const adminSubdomains = new Hono();

// All admin subdomain routes require admin authentication
adminSubdomains.use('*', requireAdmin);

function getServices(c: Context): Services {
  return c.get('services')!;
}

// DELETE /v1/admin/subdomains/:name — Release subdomain ownership.
// Clears ownerKeyId so any key can claim it via POST /v1/subdomains/:name.
// Does NOT delete pages. Existing pages remain accessible.
adminSubdomains.delete('/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const services = getServices(c);

  const result = services.subdomains.releaseOwnership(name);
  if (result.error) {
    return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, result.error, result.status || 404);
  }

  await services.audit.save({
    action: 'admin_subdomain_release',
    targetType: 'subdomain',
    subdomain: name,
    status: 'accepted',
  });

  return c.json({
    name: result.subdomain!.name,
    ownerKeyId: result.subdomain!.ownerKeyId,
    released: true,
    updated_at: result.subdomain!.updated_at,
  });
});

// PATCH /v1/admin/subdomains/:name — Transfer subdomain ownership to a new key.
// Body: { "ownerKeyId": "new-key-id" }
// The new key must be registered and active. Does NOT touch pages.
adminSubdomains.patch('/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const services = getServices(c);

  let body: { ownerKeyId?: string };
  try {
    body = await c.req.json();
  } catch {
    return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400);
  }

  if (!body.ownerKeyId || typeof body.ownerKeyId !== 'string') {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'ownerKeyId is required', 400);
  }

  const result = services.subdomains.transferOwnership(name, body.ownerKeyId);
  if (result.error) {
    const code = result.status === 404 ? ErrorCodes.SUBDOMAIN_NOT_FOUND : ErrorCodes.INVALID_REQUEST;
    return errorResponse(code, result.error, result.status || 400);
  }

  await services.audit.save({
    action: 'admin_subdomain_transfer',
    targetType: 'subdomain',
    subdomain: name,
    status: 'accepted',
    metadata: { newOwnerKeyId: body.ownerKeyId },
  });

  return c.json({
    name: result.subdomain!.name,
    ownerKeyId: result.subdomain!.ownerKeyId,
    transferred: true,
    updated_at: result.subdomain!.updated_at,
  });
});

export { adminSubdomains };