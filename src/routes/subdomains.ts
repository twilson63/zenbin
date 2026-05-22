import { Context, Hono } from 'hono';
import { config } from '../config.js';
import { hasScope, requireSignedAgent } from '../middleware/signedAgent.js';
import type { Services } from '../services/container.js';

const subdomains = new Hono();

const RESERVED_NAMES = new Set(config.subdomains.reservedNames);
const SUBDOMAIN_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;

subdomains.use('*', requireSignedAgent);

function getServices(c: Context): Services {
  return c.get('services');
}

function getSignedKey(c: Context): string | undefined {
  return c.get('signedAgent')?.key.keyId;
}

function canOverride(c: Context, scope: string): boolean {
  const signedAgent = c.get('signedAgent');
  return Boolean(signedAgent && hasScope(signedAgent.key, scope));
}

/**
 * Validate claimable subdomain names.
 * The same rules are used for both documentation and request handling, so keep these
 * constraints in sync with the agent-facing docs.
 */
function validateSubdomainName(name: string): { valid: boolean; error?: string } {
  if (name.length < 3) {
    return { valid: false, error: 'Subdomain must be at least 3 characters' };
  }
  if (name.length > config.subdomains.maxLength) {
    return { valid: false, error: `Subdomain must be at most ${config.subdomains.maxLength} characters` };
  }

  if (!SUBDOMAIN_PATTERN.test(name)) {
    return { valid: false, error: 'Subdomain must start with a letter, contain only lowercase letters, numbers, and hyphens, and end with a letter or number' };
  }

  if (RESERVED_NAMES.has(name)) {
    return { valid: false, error: `Subdomain '${name}' is reserved` };
  }

  return { valid: true };
}

// POST /v1/subdomains/:name - claim ownership of a subdomain for the current signing key.
subdomains.post('/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const keyId = getSignedKey(c);
  const services = getServices(c);

  const validation = validateSubdomainName(name);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const existing = services.subdomains.get(name);
  if (existing) {
    return c.json({ error: `Subdomain '${name}' is already taken` }, 409);
  }

  // ─── Plan limit check ────────────────────────────────────
  let agentKey = keyId ? await services.keys.checkAndResetCycle(keyId) : undefined;
  const subdomainLimit = services.subdomains.checkClaimLimit(keyId || '');
  if (!subdomainLimit.allowed) {
    const plan = agentKey ? (agentKey.plan || 'free') : 'free';
    return c.json({
      error: subdomainLimit.reason,
      plan,
      upgradeUrl: `${config.baseUrl}/v1/billing/checkout?plan=pro`,
    }, 402);
  }

  const { subdomain, created } = await services.subdomains.save(name, keyId);
  const baseUrl = config.baseUrl.replace(/^https?:\/\//, '');
  const protocol = config.baseUrl.startsWith('https') ? 'https' : 'http';

  await services.audit.save({
    action: 'subdomain_create',
    targetType: 'subdomain',
    keyId,
    subdomain: name,
    status: 'accepted',
  });

  // Track usage for billing
  if (keyId) {
    services.subdomains.trackSubdomainClaim(keyId);
  }

  return c.json({
    name: subdomain.name,
    url: `${protocol}://${subdomain.name}.${baseUrl}`,
    created_at: subdomain.created_at,
  }, created ? 201 : 200);
});

subdomains.get('/:name', (c) => {
  const name = c.req.param('name').toLowerCase();
  const services = getServices(c);
  const subdomain = services.subdomains.get(name);
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

subdomains.get('/:name/pages', (c) => {
  const name = c.req.param('name').toLowerCase();
  const services = getServices(c);
  const subdomain = services.subdomains.get(name);
  if (!subdomain) {
    return c.json({ error: `Subdomain '${name}' not found` }, 404);
  }

  const pages = services.pages.listBySubdomain(name);
  const baseUrl = config.baseUrl.replace(/^https?:\/\//, '');
  const protocol = config.baseUrl.startsWith('https') ? 'https' : 'http';

  return c.json({
    subdomain: name,
    url: `${protocol}://${name}.${baseUrl}`,
    pages: pages.map((page) => ({
      id: page.id,
      path: page.id === 'index' ? '/' : `/${page.id}`,
      title: page.title,
      url: `${protocol}://${name}.${baseUrl}${page.id === 'index' ? '/' : `/${page.id}`}`,
    })),
    total: pages.length,
  });
});

subdomains.delete('/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const keyId = getSignedKey(c);
  const services = getServices(c);
  const subdomain = services.subdomains.get(name);

  if (!subdomain) {
    return c.json({ error: `Subdomain '${name}' not found` }, 404);
  }

  const sameOwner = subdomain.ownerKeyId === keyId;
  const allowed = sameOwner || canOverride(c, 'subdomains:delete:any');
  if (!subdomain.ownerKeyId && !allowed) {
    return c.json({ error: 'This subdomain predates signed ownership and requires admin migration before it can be deleted' }, 403);
  }
  if (!allowed) {
    return c.json({ error: 'This signing key does not own the subdomain' }, 403);
  }

  const deleted = await services.subdomains.delete(name);
  if (!deleted) {
    return c.json({ error: `Subdomain '${name}' not found` }, 404);
  }

  await services.audit.save({
    action: 'subdomain_delete',
    targetType: 'subdomain',
    keyId,
    subdomain: name,
    status: 'accepted',
  });

  return c.body(null, 204);
});

export { subdomains, validateSubdomainName };