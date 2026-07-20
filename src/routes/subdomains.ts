import { Context, Hono } from 'hono';
import { config } from '../config.js';
import { hasScope, requireSignedAgent } from '../middleware/signedAgent.js';
import { ErrorCodes, errorResponse } from '../errors.js';
import type { Services } from '../services/container.js';
import { normalizeCustomHostname } from '../services/customDomainService.js';

const subdomains = new Hono();

const RESERVED_NAMES = new Set(config.subdomains.reservedNames);
const SUBDOMAIN_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;

subdomains.use('*', requireSignedAgent);

function getServices(c: Context): Services {
  return c.get('services')!;
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
    return errorResponse(ErrorCodes.SUBDOMAIN_INVALID_NAME, validation.error ?? 'Invalid subdomain name', 400);
  }

  const existing = services.subdomains.get(name);
  if (existing) {
    return errorResponse(ErrorCodes.SUBDOMAIN_TAKEN, `Subdomain '${name}' is already taken`, 409);
  }

  // ─── Atomic plan-limit check + claim ─────────────────────
  // The ownership-cap check and the claim write happen in one transaction so
  // concurrent claims cannot both pass, and the cap is enforced against the
  // number of subdomains actually owned (not a resettable monthly counter).
  const agentKey = keyId ? await services.keys.checkAndResetCycle(keyId) : undefined;
  const plan = agentKey ? (agentKey.plan || 'free') : 'free';
  const claim = services.subdomains.reserveAndClaim(name, keyId, plan);
  if (!claim.allowed) {
    return c.json({
      error: claim.reason,
      plan,
      upgradeUrl: `${config.baseUrl}/v1/billing/checkout?plan=pro`,
    }, 402);
  }
  if (!claim.created || !claim.subdomain) {
    // Lost the race: the name was claimed between our check and the reserve.
    return errorResponse(ErrorCodes.SUBDOMAIN_TAKEN, `Subdomain '${name}' is already taken`, 409);
  }

  const subdomain = claim.subdomain;
  const created = claim.created;
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
    return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, `Subdomain '${name}' not found`, 404);
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
    return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, `Subdomain '${name}' not found`, 404);
  }

  const cursor = c.req.query('cursor');
  const limitParam = c.req.query('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 200);

  const result = services.pages.listBySubdomainPaginated(name, cursor, limit);

  const baseUrl = config.baseUrl.replace(/^https?:\/\//, '');
  const protocol = config.baseUrl.startsWith('https') ? 'https' : 'http';

  const pages = result.pages.map((p) => {
    const subdomainPath = p.id === 'index' ? '/' : `/${p.id}`;
    return {
      id: p.id,
      path: subdomainPath,
      title: p.title || null,
      url: `${protocol}://${name}.${baseUrl}${subdomainPath}`,
      has_markdown: p.has_markdown,
      has_image: p.has_image,
      has_video: p.has_video,
      created_at: p.created_at,
      updated_at: p.updated_at,
      etag: p.etag,
    };
  });

  return c.json({
    subdomain: name,
    url: `${protocol}://${name}.${baseUrl}`,
    pages,
    total: result.total,
    next_cursor: result.next_cursor,
  });
});


interface CustomDomainBody {
  hostname?: unknown;
  primary?: unknown;
}

function customDomainResponse(domain: import('../types.js').CustomDomain) {
  return {
    hostname: domain.hostname,
    subdomain: domain.subdomain,
    status: domain.lifecycleStatus,
    verification_status: domain.verificationStatus,
    certificate_status: domain.certificateStatus,
    primary: domain.primaryDomain,
    dns: domain.verificationToken ? {
      ownership: {
        type: 'TXT',
        name: `_zenbin-verification.${domain.hostname}`,
        value: `zenbin-verification=${domain.verificationToken}`,
      },
      routing: {
        type: 'CNAME_OR_ALIAS',
        name: domain.hostname,
        value: config.customDomains.routingTarget,
      },
    } : undefined,
    error_code: domain.lastErrorCode,
    error_detail: domain.lastErrorDetail,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt,
    verified_at: domain.verifiedAt,
    activated_at: domain.activatedAt,
  };
}

function requireDomainOwner(c: Context, name: string): { keyId: string; subdomain: import('../types.js').Subdomain } | Response {
  const subdomain = getServices(c).subdomains.get(name);
  const keyId = getSignedKey(c);
  if (!subdomain) return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, `Subdomain '${name}' not found`, 404);
  if (!keyId || subdomain.ownerKeyId !== keyId) {
    return errorResponse(ErrorCodes.CUSTOM_DOMAIN_OWNERSHIP_REQUIRED, 'This signing key does not own the destination subdomain', 403);
  }
  return { keyId, subdomain };
}

subdomains.post('/:name/domains', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const ownership = requireDomainOwner(c, name);
  if (ownership instanceof Response) return ownership;

  let body: CustomDomainBody;
  try {
    body = await c.req.json<CustomDomainBody>();
  } catch {
    return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400);
  }
  if (typeof body.hostname !== 'string') {
    return errorResponse(ErrorCodes.CUSTOM_DOMAIN_INVALID, 'hostname must be a string', 400);
  }

  const result = getServices(c).domains.create(body.hostname, name, ownership.keyId);
  if (result.invalid) return errorResponse(ErrorCodes.CUSTOM_DOMAIN_INVALID, 'Invalid custom hostname', 400);
  if (result.conflict) return errorResponse(ErrorCodes.CUSTOM_DOMAIN_TAKEN, 'Custom hostname is already claimed', 409);

  await getServices(c).audit.save({
    action: 'custom_domain_attach', targetType: 'custom_domain', keyId: ownership.keyId, subdomain: name, status: 'accepted',
    metadata: { hostname: result.domain!.hostname },
  });
  return c.json(customDomainResponse(result.domain!), 201);
});

subdomains.get('/:name/domains', (c) => {
  const name = c.req.param('name').toLowerCase();
  const ownership = requireDomainOwner(c, name);
  if (ownership instanceof Response) return ownership;
  return c.json({ subdomain: name, domains: getServices(c).domains.list(name).map(customDomainResponse) });
});

subdomains.post('/:name/domains/:hostname/verify', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const ownership = requireDomainOwner(c, name);
  if (ownership instanceof Response) return ownership;
  const hostname = normalizeCustomHostname(c.req.param('hostname'));
  const domain = hostname ? getServices(c).domains.get(hostname) : undefined;
  if (!domain || domain.subdomain !== name) return errorResponse(ErrorCodes.CUSTOM_DOMAIN_NOT_FOUND, 'Custom domain not found', 404);

  const result = await getServices(c).domains.verify(hostname!);
  await getServices(c).audit.save({
    action: result.errorCode ? 'custom_domain_verify_failed' : 'custom_domain_verify', targetType: 'custom_domain', keyId: ownership.keyId, subdomain: name,
    status: result.errorCode ? 'rejected' : 'accepted', reason: result.errorCode, metadata: { hostname: hostname! },
  });
  if (result.errorCode === 'CUSTOM_DOMAIN_DNS_MISMATCH') return errorResponse(ErrorCodes.CUSTOM_DOMAIN_DNS_MISMATCH, result.domain.lastErrorDetail || 'DNS ownership verification failed', 409, { domain: customDomainResponse(result.domain) });
  if (result.errorCode === 'CUSTOM_DOMAIN_PROVIDER_ERROR') return errorResponse(ErrorCodes.CUSTOM_DOMAIN_PROVIDER_ERROR, result.domain.lastErrorDetail || 'Managed hostname provider failed', 502, { domain: customDomainResponse(result.domain) });
  return c.json(customDomainResponse(result.domain), result.errorCode ? 202 : 200);
});

subdomains.patch('/:name/domains/:hostname', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const ownership = requireDomainOwner(c, name);
  if (ownership instanceof Response) return ownership;
  const hostname = normalizeCustomHostname(c.req.param('hostname'));
  const domain = hostname ? getServices(c).domains.get(hostname) : undefined;
  if (!domain || domain.subdomain !== name) return errorResponse(ErrorCodes.CUSTOM_DOMAIN_NOT_FOUND, 'Custom domain not found', 404);
  let body: CustomDomainBody;
  try { body = await c.req.json<CustomDomainBody>(); } catch { return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400); }
  if (typeof body.primary !== 'boolean') return errorResponse(ErrorCodes.INVALID_REQUEST, 'primary must be a boolean', 400);
  const updated = getServices(c).domains.setPrimary(hostname!, body.primary)!;
  await getServices(c).audit.save({ action: 'custom_domain_primary_change', targetType: 'custom_domain', keyId: ownership.keyId, subdomain: name, status: 'accepted', metadata: { hostname, primary: body.primary } });
  return c.json(customDomainResponse(updated));
});

subdomains.delete('/:name/domains/:hostname', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const ownership = requireDomainOwner(c, name);
  if (ownership instanceof Response) return ownership;
  const hostname = normalizeCustomHostname(c.req.param('hostname'));
  const domain = hostname ? getServices(c).domains.get(hostname) : undefined;
  if (!domain || domain.subdomain !== name) return errorResponse(ErrorCodes.CUSTOM_DOMAIN_NOT_FOUND, 'Custom domain not found', 404);
  const result = await getServices(c).domains.delete(hostname!);
  await getServices(c).audit.save({
    action: result.errorCode ? 'custom_domain_delete_failed' : 'custom_domain_delete', targetType: 'custom_domain', keyId: ownership.keyId, subdomain: name,
    status: result.errorCode ? 'rejected' : 'accepted', reason: result.errorCode, metadata: { hostname: hostname! },
  });
  if (result.errorCode) return errorResponse(ErrorCodes.CUSTOM_DOMAIN_PROVIDER_ERROR, result.domain?.lastErrorDetail || 'Managed hostname cleanup failed', 502);
  return c.json({ hostname: hostname!, deleted: true, deleted_at: new Date().toISOString() });
});

subdomains.delete('/:name', async (c) => {
  const name = c.req.param('name').toLowerCase();
  const keyId = getSignedKey(c);
  const services = getServices(c);
  const subdomain = services.subdomains.get(name);

  if (!subdomain) {
    return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, `Subdomain '${name}' not found`, 404);
  }

  const sameOwner = subdomain.ownerKeyId === keyId;
  const allowed = sameOwner || canOverride(c, 'subdomains:delete:any');
  if (!subdomain.ownerKeyId && !allowed) {
    return errorResponse(ErrorCodes.SUBDOMAIN_PREDATES_OWNERSHIP, 'This subdomain predates signed ownership and requires admin migration before it can be deleted', 403);
  }
  if (!allowed) {
    return errorResponse(ErrorCodes.SUBDOMAIN_OWNERSHIP_REQUIRED, 'This signing key does not own the subdomain', 403);
  }

  const domainCleanup = await services.domains.deleteAllForSubdomain(name);
  if (domainCleanup.errorCode) {
    return errorResponse(ErrorCodes.CUSTOM_DOMAIN_PROVIDER_ERROR, 'Custom-domain routing was deactivated but provider cleanup must be retried before deleting this subdomain', 503);
  }

  const deleted = await services.subdomains.delete(name);
  if (!deleted) {
    return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, `Subdomain '${name}' not found`, 404);
  }

  await services.audit.save({
    action: 'subdomain_delete',
    targetType: 'subdomain',
    keyId,
    subdomain: name,
    status: 'accepted',
  });

  return c.json({
    name,
    deleted: true,
    deleted_at: new Date().toISOString(),
  });
});

export { subdomains, validateSubdomainName };