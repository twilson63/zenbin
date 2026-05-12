import { Context, Hono } from 'hono';
import { config } from '../config.js';
import { checkAuthRateLimit, recordFailedAttempt, resetAuthAttempts } from '../middleware/authRateLimit.js';
import { hasScope, requireSignedAgent } from '../middleware/signedAgent.js';
import { decrementSubdomainPageCount, deletePage as deletePageFromDb, getPage, getSubdomain, incrementSubdomainPageCount, saveAuditLog, savePage } from '../storage/db.js';
import { deleteVideo, saveVideo } from '../storage/video.js';
import { generateEtag } from '../utils/etag.js';
import { generateUrlToken, hashPassword, parseBasicAuth, verifyPassword } from '../utils/auth.js';
import { decodeHtml, decodeMarkdown, validateAuthInput, validateId, validatePageBody } from '../utils/validation.js';
import { trackApiCall, trackPageCreated, trackPageDeleted, trackPageUpdated } from '../analytics/posthog.js';
import { validateSubdomainName } from './subdomains.js';

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
  };
}

pages.use('*', requireSignedAgent);

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
    return c.json({ error: 'Too many failed authentication attempts' }, 429);
  }

  const authHeader = c.req.header('Authorization');
  const basicAuth = parseBasicAuth(authHeader);
  const realm = subdomain ? `ZenBin-${subdomain}-${id}` : `ZenBin-${id}`;

  if (!basicAuth) {
    c.header('WWW-Authenticate', `Basic realm="${realm}"`);
    return c.json({ error: 'Authentication required for this page' }, 401);
  }

  const validPassword = await verifyPassword(basicAuth.password, passwordHash);
  if (!validPassword) {
    recordFailedAttempt(id);
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  resetAuthAttempts(id);
  return null;
}

pages.post('/:id', async (c) => {
  const id = c.req.param('id');
  const keyId = getSignedKey(c);
  const subdomainHeader = c.req.header('X-Subdomain');
  const subdomain = subdomainHeader ? subdomainHeader.toLowerCase() : undefined;

  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  if (subdomain) {
    const subdomainValidation = validateSubdomainName(subdomain);
    if (!subdomainValidation.valid) {
      return c.json({ error: subdomainValidation.error }, 400);
    }

    const existingSubdomain = getSubdomain(subdomain);
    if (!existingSubdomain) {
      return c.json({ error: `Subdomain '${subdomain}' does not exist. Claim it first with POST /v1/subdomains/${subdomain}` }, 404);
    }

    const canManageSubdomain = existingSubdomain.ownerKeyId === keyId || currentKeyCanOverride(c, 'subdomains:write:any');
    if (!canManageSubdomain) {
      return c.json({ error: 'This signing key does not control the requested subdomain' }, 403);
    }

    if (!getPage(id, subdomain) && existingSubdomain.page_count >= config.subdomains.maxPagesPerSubdomain) {
      return c.json({ error: `Subdomain '${subdomain}' has reached the maximum of ${config.subdomains.maxPagesPerSubdomain} pages` }, 403);
    }
  }

  let body: CreatePageBody;
  try {
    const rawBody = c.get('rawBody') || await c.req.text();
    body = JSON.parse(rawBody) as CreatePageBody;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const bodyError = validatePageBody(body);
  if (bodyError) {
    return c.json({ error: bodyError.message }, 400);
  }

  if (body.auth) {
    const authError = validateAuthInput(body.auth);
    if (authError) {
      return c.json({ error: authError.message }, 400);
    }
  }

  const existingPage = subdomain ? getPage(id, subdomain) : getPage(id);
  if (existingPage) {
    const sameOwner = existingPage.ownerKeyId === keyId;
    const canOverride = currentKeyCanOverride(c, 'pages:update:any');

    if (!existingPage.ownerKeyId && !canOverride) {
      return c.json({ error: 'This page predates signed ownership and requires admin migration before it can be updated' }, 403);
    }

    if (!sameOwner && !canOverride) {
      return c.json({ error: 'This signing key does not own the page' }, 403);
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
    videoPath = await saveVideo(id, videoBuffer, videoMimeType, subdomain);
    if (existingPage?.video && existingPage.video !== videoPath) {
      await deleteVideo(existingPage.video);
    }
  } else if (existingPage?.video) {
    await deleteVideo(existingPage.video);
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

  let authData: { passwordHash?: string; urlTokenHash?: string } | undefined;
  let urlToken: string | undefined;

  if (body.auth) {
    authData = {};

    if (body.auth.password) {
      authData.passwordHash = await hashPassword(body.auth.password);
    }

    if (body.auth.urlToken) {
      const tokenResult = generateUrlToken();
      urlToken = tokenResult.token;
      authData.urlTokenHash = tokenResult.hash;
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

  const { page, created } = await savePage(
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
      status: 'active',
    },
    etag,
  );

  if (created && subdomain) {
    incrementSubdomainPageCount(subdomain);
  }

  const baseUrl = config.baseUrl;
  const protocol = baseUrl.startsWith('https') ? 'https' : 'http';
  const domain = baseUrl.replace(/^https?:\/\//, '');
  const subdomainPath = page.id === 'index' ? '/' : `/${page.id}`;
  const subdomainOrigin = subdomain ? `${protocol}://${subdomain}.${domain}` : undefined;
  const pageUrl = subdomain ? `${subdomainOrigin}${subdomainPath}` : `${baseUrl}/p/${page.id}`;

  const response: Record<string, string> = {
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

  await saveAuditLog({
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

  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  const page = subdomain ? getPage(id, subdomain) : getPage(id);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const sameOwner = page.ownerKeyId === keyId;
  const canOverride = currentKeyCanOverride(c, 'pages:delete:any');
  if (!page.ownerKeyId && !canOverride) {
    return c.json({ error: 'This page predates signed ownership and requires admin migration before it can be deleted' }, 403);
  }
  if (!sameOwner && !canOverride) {
    return c.json({ error: 'This signing key does not own the page' }, 403);
  }

  if (subdomain) {
    const parentSubdomain = getSubdomain(subdomain);
    if (!parentSubdomain) {
      return c.json({ error: `Subdomain '${subdomain}' not found` }, 404);
    }
    const canManageSubdomain = parentSubdomain.ownerKeyId === keyId || currentKeyCanOverride(c, 'subdomains:write:any');
    if (!canManageSubdomain) {
      return c.json({ error: 'This signing key does not control the requested subdomain' }, 403);
    }
  }

  if (page.auth?.passwordHash) {
    const authError = await verifyPageWriteAuth(c, id, subdomain, page.auth.passwordHash);
    if (authError) {
      return authError;
    }
  }

  const deleted = await deletePageFromDb(id, subdomain);
  if (!deleted) {
    return c.json({ error: 'Failed to delete page' }, 500);
  }

  if (page.video) {
    await deleteVideo(page.video);
  }

  if (subdomain) {
    decrementSubdomainPageCount(subdomain);
  }

  trackPageDeleted({
    pageId: id,
    subdomain,
    hadAuth: !!page.auth,
    contentType: page.content_type || 'text/html',
  });

  await saveAuditLog({
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

  return c.body(null, 204);
});

export { pages };
