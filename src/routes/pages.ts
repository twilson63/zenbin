import { Context, Hono } from 'hono';
import { config } from '../config.js';
import { checkAuthRateLimit, recordFailedAttempt, resetAuthAttempts } from '../middleware/authRateLimit.js';
import { hasScope, requireSignedAgent, requireSignedAgentForGet } from '../middleware/signedAgent.js';
import { checkPageLimit, getPlanFromKey, isBillingCycleExpired } from '../rules.js';
import { ErrorCodes, errorResponse } from '../errors.js';
import { generateEtag } from '../utils/etag.js';
import { isValidFingerprint } from '../utils/fingerprint.js';
import { generateUrlToken, hashPassword, parseBasicAuth, verifyPassword } from '../utils/auth.js';
import { decodeHtml, decodeMarkdown, validateAuthInput, validateId, validatePageBody, validateAttestation } from '../utils/validation.js';
import { trackApiCall, trackPageCreated, trackPageDeleted, trackPageUpdated } from '../analytics/posthog.js';
import { validateSubdomainName } from './subdomains.js';
import type { Services } from '../services/container.js';
import type { Page, Attestation } from '../types.js';

const pages = new Hono();

/**
 * Request payload accepted by POST /v1/pages/:id.
 *
 * Notes for maintainers:
 * - html and markdown may be sent together in the same publish.
 * - html uses `encoding`; markdown uses `markdown_encoding` with `encoding` as fallback.
 * - image and video are expected to be base64 strings.
 * - content_type remains the legacy binary/document content type.
 * - image_content_type and video_content_type allow storing both assets on one page.
 */
interface CreatePageBody {
  html?: string;
  markdown?: string;
  image?: string;
  image_content_type?: string;
  video?: string;
  video_content_type?: string;
  encoding?: 'utf-8' | 'base64';
  markdown_encoding?: 'utf-8' | 'base64';
  content_type?: string;
  title?: string;
  subdomain?: string;
  auth?: {
    password?: string;
    urlToken?: boolean;
    signToRead?: boolean;
  } | null;
  recipientKeyId?: string;
  attestation?: Attestation | null;
}

pages.use('*', requireSignedAgent);

// GET /v1/pages — List pages owned by or directed to the authenticated key
pages.get('/', requireSignedAgentForGet, (c) => {
  const signedAgent = c.get('signedAgent');
  const keyId = signedAgent?.key?.keyId || getSignedKey(c);
  const keyFingerprint = signedAgent?.key?.publicKeyFingerprint;
  const services = getServices(c);
  const cursor = c.req.query('cursor');
  const limitParam = c.req.query('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 200);
  const recipientParam = c.req.query('recipient');
  const since = c.req.query('since') || undefined;

  let result;
  const attestationSubject = c.req.query('attestation.subject');
  const attestationType = c.req.query('attestation.type');

  if (attestationSubject && attestationType) {
    // Query by type AND subject
    result = services.pages.listAttestationsByTypeAndSubject(attestationType, attestationSubject, cursor, limit, since);
  } else if (attestationSubject) {
    // Query by subject only
    result = services.pages.listAttestationsBySubject(attestationSubject, cursor, limit, since);
  } else if (attestationType) {
    // Type-only query is not supported (would need type-only index)
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'attestation.type requires attestation.subject — type-only queries are not supported', 400);
  } else if (recipientParam === 'me') {
    // recipient=me resolves to the authenticated key's fingerprint
    const recipientFingerprint = keyFingerprint || keyId;
    result = services.pages.listByRecipient(recipientFingerprint, cursor, limit, since);
  } else {
    result = services.pages.listByOwner(keyId, cursor, limit, since);
  }

  const baseUrl = config.baseUrl;
  const protocol = baseUrl.startsWith('https') ? 'https' : 'http';
  const domain = baseUrl.replace(/^https?:\/\//, '');

  const pages = result.pages.map((p) => {
    const subdomainOrigin = p.subdomain ? `${protocol}://${p.subdomain}.${domain}` : undefined;
    const subdomainPath = p.id === 'index' ? '/' : `/${p.id}`;
    const pageUrl = p.subdomain ? `${subdomainOrigin}${subdomainPath}` : `${baseUrl}/p/${p.id}`;

    const item: Record<string, unknown> = {
      id: p.id,
      url: pageUrl,
      title: p.title || null,
      content_type: p.content_type || null,
      has_markdown: p.has_markdown,
      has_image: p.has_image,
      has_video: p.has_video,
      subdomain: p.subdomain,
      created_at: p.created_at,
      updated_at: p.updated_at,
      etag: p.etag,
    };

    // Include ownerKeyId so consumers can verify sender signatures
    if (p.ownerKeyId) {
      item.keyId = p.ownerKeyId;
      item.keyUrl = `${baseUrl}/v1/keys/${encodeURIComponent(p.ownerKeyId)}/jwk`;
    }

    if (p.recipientKeyId) {
      item.recipientKeyId = p.recipientKeyId;
    }

    if (p.attestation) {
      item.attestation = p.attestation;
    }

    return item;
  });

  return c.json({
    pages,
    total: result.total,
    next_cursor: result.next_cursor,
  });
});

function getServices(c: Context): Services {
  return c.get('services')!;
}

function getSignedKey(c: Context): string {
  const signedAgent = c.get('signedAgent');
  if (!signedAgent) {
    throw new Error('Signed agent context missing');
  }
  return signedAgent.key.keyId;
}

function currentKeyCanOverride(c: Context, scope: string): boolean {
  const signedAgent = c.get('signedAgent');
  return Boolean(signedAgent && hasScope(signedAgent.key, scope));
}

async function verifyPageWriteAuth(c: Context, id: string, subdomain: string | undefined, passwordHash: string) {
  const rateLimit = checkAuthRateLimit(id);
  if (!rateLimit.allowed) {
    c.header('Retry-After', String(rateLimit.retryAfter));
    return errorResponse(ErrorCodes.PAGE_AUTH_RATE_LIMITED, 'Too many failed authentication attempts', 429);
  }

  const authHeader = c.req.header('Authorization');
  const basicAuth = parseBasicAuth(authHeader);
  const realm = subdomain ? `ZenBin-${subdomain}-${id}` : `ZenBin-${id}`;

  if (!basicAuth) {
    c.header('WWW-Authenticate', `Basic realm="${realm}"`);
    return errorResponse(ErrorCodes.PAGE_AUTH_REQUIRED, 'Authentication required for this page', 401);
  }

  const validPassword = await verifyPassword(basicAuth.password, passwordHash);
  if (!validPassword) {
    recordFailedAttempt(id);
    return errorResponse(ErrorCodes.PAGE_INVALID_CREDENTIALS, 'Invalid credentials', 401);
  }

  resetAuthAttempts(id);
  return null;
}

pages.post('/:id', async (c) => {
  const id = c.req.param('id');
  const keyId = getSignedKey(c);
  const subdomainHeader = c.req.header('X-Subdomain');
  const subdomain = subdomainHeader ? subdomainHeader.toLowerCase() : undefined;
  const services = getServices(c);

  const idError = validateId(id);
  if (idError) {
    return errorResponse(ErrorCodes.PAGE_INVALID_ID, idError.message, 400);
  }

  if (subdomain) {
    const subdomainValidation = validateSubdomainName(subdomain);
    if (!subdomainValidation.valid) {
      return errorResponse(ErrorCodes.SUBDOMAIN_INVALID_NAME, subdomainValidation.error ?? 'Invalid subdomain name', 400);
    }

    const existingSubdomain = services.subdomains.get(subdomain);
    if (!existingSubdomain) {
      return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, `Subdomain '${subdomain}' does not exist. Claim it first with POST /v1/subdomains/${subdomain}`, 404);
    }

    const canManageSubdomain = existingSubdomain.ownerKeyId === keyId || currentKeyCanOverride(c, 'subdomains:write:any');
    if (!canManageSubdomain) {
      return errorResponse(ErrorCodes.SUBDOMAIN_OWNERSHIP_REQUIRED, 'This signing key does not control the requested subdomain', 403);
    }

    if (!services.pages.get(id, subdomain) && existingSubdomain.page_count >= config.subdomains.maxPagesPerSubdomain) {
      return errorResponse(ErrorCodes.SUBDOMAIN_MAX_PAGES_EXCEEDED, `Subdomain '${subdomain}' has reached the maximum of ${config.subdomains.maxPagesPerSubdomain} pages`, 403);
    }
  }

  let body: CreatePageBody;
  try {
    const rawBody = c.get('rawBody') || await c.req.text();
    body = JSON.parse(rawBody) as CreatePageBody;
  } catch {
    return errorResponse(ErrorCodes.INVALID_JSON, 'Invalid JSON body', 400);
  }

  const bodyError = validatePageBody(body);
  if (bodyError) {
    return errorResponse(ErrorCodes.PAGE_INVALID_BODY, bodyError.message, 400);
  }

  if (body.auth !== undefined && body.auth !== null) {
    const authError = validateAuthInput(body.auth);
    if (authError) {
      return errorResponse(ErrorCodes.PAGE_INVALID_AUTH, authError.message, 400);
    }
  }

  // ─── Plan limit check ────────────────────────────────────
  // Only enforce for NEW pages, not updates
  const preExistingPage = subdomain ? services.pages.get(id, subdomain) : services.pages.get(id);
  if (!preExistingPage) {
    let agentKey = await services.keys.checkAndResetCycle(keyId);
    const plan = agentKey ? getPlanFromKey(agentKey) : 'free';
    const pageLimit = checkPageLimit(plan, agentKey?.monthlyPageCount || 0);
    if (!pageLimit.allowed) {
      return c.json({
        error: pageLimit.reason,
        plan,
        upgradeUrl: `${config.baseUrl}/v1/billing/checkout?plan=pro`,
      }, 402);
    }
  }

  const existingPage = preExistingPage;
  if (existingPage) {
    const sameOwner = existingPage.ownerKeyId === keyId;
    const canOverride = currentKeyCanOverride(c, 'pages:update:any');

    if (!existingPage.ownerKeyId && !canOverride) {
      return errorResponse(ErrorCodes.PAGE_PREDATES_OWNERSHIP, 'This page predates signed ownership and requires admin migration before it can be updated', 403);
    }

    if (!sameOwner && !canOverride) {
      return errorResponse(ErrorCodes.PAGE_OWNERSHIP_REQUIRED, 'This signing key does not own the page', 403);
    }

    if (existingPage.auth?.passwordHash) {
      const authError = await verifyPageWriteAuth(c, id, subdomain, existingPage.auth.passwordHash);
      if (authError) {
        return authError;
      }
    }
  }

  const decodedHtml = body.html ? decodeHtml(body.html, body.encoding) : undefined;
  const decodedMarkdown = body.markdown
    ? decodeMarkdown(body.markdown, body.markdown_encoding || body.encoding)
    : undefined;
  const imageData = body.image;

  let videoPath: string | undefined;
  if (body.video) {
    const videoMimeType = body.video_content_type || body.content_type || existingPage?.video_content_type || existingPage?.content_type || 'video/mp4';
    const videoBuffer = Buffer.from(body.video, 'base64');
    videoPath = await services.pages.saveVideoFile(id, videoBuffer, videoMimeType, subdomain);
    if (existingPage?.video && existingPage.video !== videoPath) {
      await services.pages.deleteVideoFile(existingPage.video);
    }
  } else if (existingPage?.video) {
    await services.pages.deleteVideoFile(existingPage.video);
  }

  const etagContent = [
    decodedHtml || '',
    decodedMarkdown || '',
    imageData || '',
    videoPath || '',
    body.image_content_type || existingPage?.image_content_type || '',
    body.video_content_type || existingPage?.video_content_type || '',
  ].join('');
  const etag = generateEtag(etagContent);

  let authData: { passwordHash?: string; urlTokenHash?: string; signToRead?: boolean } | undefined;
  let urlToken: string | undefined;

  if (body.auth !== undefined) {
    authData = {};

    if (body.auth?.password) {
      authData.passwordHash = await hashPassword(body.auth.password);
    }

    if (body.auth?.urlToken) {
      const tokenResult = generateUrlToken();
      urlToken = tokenResult.token;
      authData.urlTokenHash = tokenResult.hash;
    }

    if (body.auth?.signToRead === true) {
      authData.signToRead = true;
    }

    if (!authData.passwordHash && !authData.urlTokenHash && !authData.signToRead) {
      authData = undefined;
    }
  } else if (existingPage?.auth) {
    authData = existingPage.auth;
  }

  const signedAgent = c.get('signedAgent');
  const contentDigest = signedAgent?.contentDigest || c.req.header('Content-Digest') || '';
  const publishSignature = signedAgent?.signature || c.req.header('X-Zenbin-Signature') || '';
  const publishTimestamp = signedAgent?.timestamp || c.req.header('X-Zenbin-Timestamp') || '';
  const publishNonce = signedAgent?.nonce || c.req.header('X-Zenbin-Nonce') || '';
  const publishMethod = signedAgent?.method || c.req.method;
  const publishPath = signedAgent?.path || c.req.path;

  // Extract recipientKeyId from header (priority) or body
  // Explicit empty string from header or body means "remove recipient" → pass null
  // Not provided at all means "no change" → pass undefined
  const capRecipientHeader = c.req.header('CAP-Recipient-Key-Id') ?? c.req.header('X-Zenbin-Recipient-Key-Id');
  let recipientKeyId: string | null | undefined;
  if (capRecipientHeader !== undefined) {
    // Header present: use its value (empty string → null = remove)
    recipientKeyId = capRecipientHeader || null;
  } else if (body.recipientKeyId !== undefined) {
    // Body field present: use its value (empty string → null = remove)
    recipientKeyId = body.recipientKeyId || null;
  } else {
    // Neither provided: keep existing value
    recipientKeyId = undefined;
  }

  // Validate recipientKeyId is a 43-char base64url fingerprint (when present)
  if (recipientKeyId && !isValidFingerprint(recipientKeyId)) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'recipientKeyId must be a 43-character base64url public key fingerprint (SHA-256 of the Ed25519 public key)', 400);
  }

  const effectiveRecipientKeyId = recipientKeyId === undefined ? existingPage?.recipientKeyId : (recipientKeyId || undefined);
  if (authData?.signToRead && !effectiveRecipientKeyId) {
    return errorResponse(ErrorCodes.PAGE_INVALID_AUTH, 'auth.signToRead requires recipientKeyId', 400);
  }

  // Extract attestation from header (priority) or body
  // CAP-Attestation header is base64url-encoded JSON
  // X-Zenbin-Attestation is the legacy alias
  // null in body means "remove attestation"
  let attestation: Attestation | null | undefined;
  const capAttestationHeader = c.req.header('CAP-Attestation') ?? c.req.header('X-Zenbin-Attestation');
  if (capAttestationHeader !== undefined) {
    // Header present: decode base64url JSON
    try {
      const decoded = Buffer.from(capAttestationHeader, 'base64url').toString('utf-8');
      const parsed = JSON.parse(decoded);
      attestation = parsed;
    } catch {
      return errorResponse(ErrorCodes.INVALID_REQUEST, 'CAP-Attestation header must be valid base64url-encoded JSON', 400);
    }
  } else if (body.attestation !== undefined) {
    // Body field present: use its value (null = remove)
    attestation = body.attestation;
  } else {
    // Neither provided: keep existing value
    attestation = undefined;
  }

  // Validate attestation if present (not null and not undefined)
  if (attestation && attestation !== null) {
    const attError = validateAttestation(attestation);
    if (attError) {
      return errorResponse(ErrorCodes.INVALID_REQUEST, attError.message, 400);
    }
  }

  const { page, created } = await services.pages.save(
    id,
    {
      html: decodedHtml,
      markdown: decodedMarkdown,
      image: imageData,
      image_content_type: body.image_content_type,
      video: videoPath,
      video_content_type: body.video_content_type,
      encoding: 'utf-8',
      content_type: body.content_type,
      title: body.title,
      subdomain,
      auth: authData,
      ownerKeyId: keyId,
      publishSignature,
      contentDigest,
      publishTimestamp,
      publishNonce,
      publishMethod,
      publishPath,
      recipientKeyId,
      attestation,
      status: 'active',
    },
    etag,
  );

  if (created && subdomain) {
    services.pages.incrementSubdomainPageCount(subdomain);
  }

  // Track usage for billing
  if (created) {
    services.pages.trackPageCreation(keyId);
  }

  const baseUrl = config.baseUrl;
  const protocol = baseUrl.startsWith('https') ? 'https' : 'http';
  const domain = baseUrl.replace(/^https?:\/\//, '');
  const subdomainPath = page.id === 'index' ? '/' : `/${page.id}`;
  const subdomainOrigin = subdomain ? `${protocol}://${subdomain}.${domain}` : undefined;
  const pageUrl = subdomain ? `${subdomainOrigin}${subdomainPath}` : `${baseUrl}/p/${page.id}`;

  const response: Record<string, unknown> = {
    id: page.id,
    url: pageUrl,
    etag: page.etag,
    keyId,
  };

  if (page.publishSignature) {
    response.signature = page.publishSignature;
  }
  if (page.contentDigest) {
    response.contentDigest = page.contentDigest;
  }
  if (page.publishTimestamp) {
    response.timestamp = page.publishTimestamp;
  }
  if (page.publishNonce) {
    response.nonce = page.publishNonce;
  }
  if (page.publishMethod) {
    response.signedMethod = page.publishMethod;
  }
  if (page.publishPath) {
    response.signedPath = page.publishPath;
  }
  response.verificationUrl = `${baseUrl}/v1/verify`;
  response.keyUrl = `${baseUrl}/v1/keys/${encodeURIComponent(keyId)}/jwk`;
  response.capVersion = '0.1';

  if (page.recipientKeyId) {
    response.recipientKeyId = page.recipientKeyId;
  }

  if (page.attestation) {
    response.attestation = page.attestation;
  }

  if (subdomain) {
    response.subdomain = subdomain;
    response.path = subdomainPath;
    response.raw_url = `${subdomainOrigin}${subdomainPath === '/' ? '/raw' : `${subdomainPath}/raw`}`;
  } else {
    response.raw_url = `${baseUrl}/p/${page.id}/raw`;
  }

  if (page.markdown) {
    response.markdown_url = subdomain
      ? `${subdomainOrigin}${subdomainPath === '/' ? '/md' : `${subdomainPath}/md`}`
      : `${baseUrl}/p/${page.id}/md`;
  }

  if (page.image) {
    response.image_url = subdomain
      ? `${subdomainOrigin}${subdomainPath === '/' ? '/image' : `${subdomainPath}/image`}`
      : `${baseUrl}/p/${page.id}/image`;
  }

  if (page.video) {
    response.video_url = subdomain
      ? `${subdomainOrigin}${subdomainPath === '/' ? '/video' : `${subdomainPath}/video`}`
      : `${baseUrl}/p/${page.id}/video`;
  }

  if (urlToken) {
    response.secret_url = `${pageUrl}?token=${urlToken}`;
    if (subdomain) {
      response.secret_raw_url = `${subdomainOrigin}${subdomainPath === '/' ? '/raw' : `${subdomainPath}/raw`}?token=${urlToken}`;
      if (page.markdown) {
        response.secret_markdown_url = `${subdomainOrigin}${subdomainPath === '/' ? '/md' : `${subdomainPath}/md`}?token=${urlToken}`;
      }
      if (page.image) {
        response.secret_image_url = `${subdomainOrigin}${subdomainPath === '/' ? '/image' : `${subdomainPath}/image`}?token=${urlToken}`;
      }
      if (page.video) {
        response.secret_video_url = `${subdomainOrigin}${subdomainPath === '/' ? '/video' : `${subdomainPath}/video`}?token=${urlToken}`;
      }
    } else {
      response.secret_raw_url = `${pageUrl}/raw?token=${urlToken}`;
      if (page.markdown) {
        response.secret_markdown_url = `${pageUrl}/md?token=${urlToken}`;
      }
      if (page.image) {
        response.secret_image_url = `${pageUrl}/image?token=${urlToken}`;
      }
      if (page.video) {
        response.secret_video_url = `${pageUrl}/video?token=${urlToken}`;
      }
    }
  }

  const contentSize = (decodedHtml?.length || 0) + (decodedMarkdown?.length || 0) + (imageData?.length || 0) + (body.video?.length || 0);
  if (created) {
    trackPageCreated({
      pageId: page.id,
      hasAuth: !!authData,
      contentType: page.content_type || 'text/html',
      hasMarkdown: !!page.markdown,
      hasImage: !!page.image,
      hasVideo: !!page.video,
      subdomain,
      contentSize,
    });
  } else {
    trackPageUpdated({
      pageId: page.id,
      hasAuth: !!authData,
      contentType: page.content_type || 'text/html',
      subdomain,
      contentSize,
    });
  }

  await services.audit.save({
    action: created ? 'page_create' : 'page_update',
    targetType: 'page',
    keyId,
    pageId: page.id,
    subdomain,
    status: 'accepted',
  });

  trackApiCall({
    endpoint: '/v1/pages/:id',
    method: 'POST',
    pageId: page.id,
    statusCode: created ? 201 : 200,
  });

  c.header('ETag', page.etag);
  return c.json(response, created ? 201 : 200);
});

pages.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const keyId = getSignedKey(c);
  const subdomainHeader = c.req.header('X-Subdomain');
  const subdomain = subdomainHeader ? subdomainHeader.toLowerCase() : undefined;
  const services = getServices(c);

  const idError = validateId(id);
  if (idError) {
    return errorResponse(ErrorCodes.PAGE_INVALID_ID, idError.message, 400);
  }

  const page = subdomain ? services.pages.get(id, subdomain) : services.pages.get(id);
  if (!page) {
    return errorResponse(ErrorCodes.PAGE_NOT_FOUND, 'Page not found', 404);
  }

  const sameOwner = page.ownerKeyId === keyId;
  const canOverride = currentKeyCanOverride(c, 'pages:delete:any');
  if (!page.ownerKeyId && !canOverride) {
    return errorResponse(ErrorCodes.PAGE_PREDATES_OWNERSHIP, 'This page predates signed ownership and requires admin migration before it can be deleted', 403);
  }
  if (!sameOwner && !canOverride) {
    return errorResponse(ErrorCodes.PAGE_OWNERSHIP_REQUIRED, 'This signing key does not own the page', 403);
  }

  if (subdomain) {
    const parentSubdomain = services.subdomains.get(subdomain);
    if (!parentSubdomain) {
      return errorResponse(ErrorCodes.SUBDOMAIN_NOT_FOUND, `Subdomain '${subdomain}' not found`, 404);
    }
    const canManageSubdomain = parentSubdomain.ownerKeyId === keyId || currentKeyCanOverride(c, 'subdomains:write:any');
    if (!canManageSubdomain) {
      return errorResponse(ErrorCodes.SUBDOMAIN_OWNERSHIP_REQUIRED, 'This signing key does not control the requested subdomain', 403);
    }
  }

  if (page.auth?.passwordHash) {
    const authError = await verifyPageWriteAuth(c, id, subdomain, page.auth.passwordHash);
    if (authError) {
      return authError;
    }
  }

  const deleted = await services.pages.delete(id, subdomain);
  if (!deleted) {
    return errorResponse(ErrorCodes.PAGE_NOT_FOUND, 'Failed to delete page', 500);
  }

  trackPageDeleted({
    pageId: id,
    subdomain,
    hadAuth: !!page.auth,
    contentType: page.content_type || 'text/html',
  });

  await services.audit.save({
    action: 'page_delete',
    targetType: 'page',
    keyId,
    pageId: id,
    subdomain,
    status: 'accepted',
  });

  trackApiCall({
    endpoint: '/v1/pages/:id',
    method: 'DELETE',
    pageId: id,
    statusCode: 204,
  });

  return c.json({
    id,
    deleted: true,
    deleted_at: new Date().toISOString(),
  });
});

export { pages };
