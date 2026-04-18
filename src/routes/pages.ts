import { Hono } from 'hono';
import { config } from '../config.js';
import { savePage, getPage, getSubdomain, incrementSubdomainPageCount, decrementSubdomainPageCount } from '../storage/db.js';
import { generateEtag } from '../utils/etag.js';
import { validateId, validatePageBody, decodeHtml, decodeMarkdown, validateAuthInput } from '../utils/validation.js';
import { hashPassword, generateUrlToken, verifyPassword, parseBasicAuth } from '../utils/auth.js';
import { validateSubdomainName } from './subdomains.js';
import { trackApiCall, trackPageCreated, trackPageUpdated, trackPageDeleted } from '../analytics/posthog.js';
import { checkAuthRateLimit, recordFailedAttempt, resetAuthAttempts } from '../middleware/authRateLimit.js';
import { deletePage as deletePageFromDb } from '../storage/db.js';
import { saveVideo, deleteVideo } from '../storage/video.js';

const pages = new Hono();

interface CreatePageBody {
  html?: string;
  markdown?: string;
  image?: string;
  video?: string;  // Base64-encoded video data
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

// POST /v1/pages/:id - Create or replace a page
pages.post('/:id', async (c) => {
  const id = c.req.param('id');
  
  // Get subdomain from header
  const subdomainHeader = c.req.header('X-Subdomain');
  const subdomain = subdomainHeader ? subdomainHeader.toLowerCase() : undefined;

  // Validate ID
  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  // Validate subdomain if provided
  if (subdomain) {
    const subdomainValidation = validateSubdomainName(subdomain);
    if (!subdomainValidation.valid) {
      return c.json({ error: subdomainValidation.error }, 400);
    }
    
    // Check if subdomain exists
    const existingSubdomain = getSubdomain(subdomain);
    if (!existingSubdomain) {
      return c.json({ error: `Subdomain '${subdomain}' does not exist. Claim it first with POST /v1/subdomains/${subdomain}` }, 404);
    }
    
    // Check page count limit
    if (existingSubdomain.page_count >= config.subdomains.maxPagesPerSubdomain) {
      return c.json({ error: `Subdomain '${subdomain}' has reached the maximum of ${config.subdomains.maxPagesPerSubdomain} pages` }, 403);
    }
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

  // Validate auth if provided
  if (body.auth) {
    const authError = validateAuthInput(body.auth);
    if (authError) {
      return c.json({ error: authError.message }, 400);
    }
  }

  // Check for existing page
  const existingPage = subdomain ? getPage(id, subdomain) : getPage(id);
  
  // For non-subdomain pages: require overwrite=true to replace
  // For subdomain pages: allow update (ownership via subdomain claim)
  if (existingPage && !subdomain) {
    const overwrite = c.req.query('overwrite') === 'true';
    if (!overwrite) {
      return c.json({ error: `Page ID "${id}" is already taken. Use ?overwrite=true to replace.` }, 409);
    }
    // For pages with auth, verify password before allowing overwrite
    if (existingPage.auth?.passwordHash) {
      const authHeader = c.req.header('Authorization');
      const basicAuth = parseBasicAuth(authHeader);
      
      if (!basicAuth) {
        c.header('WWW-Authenticate', `Basic realm="ZenBin-${id}"`);
        return c.json({ error: 'Authentication required to overwrite this page' }, 401);
      }
      
      const validPassword = await verifyPassword(basicAuth.password, existingPage.auth.passwordHash);
      if (!validPassword) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }
    }
  }
  
  if (existingPage && subdomain) {
    // For subdomain pages, verify ownership via password if set
    if (existingPage.auth?.passwordHash) {
      const authHeader = c.req.header('Authorization');
      const basicAuth = parseBasicAuth(authHeader);
      
      if (!basicAuth) {
        c.header('WWW-Authenticate', `Basic realm="ZenBin-${subdomain}-${id}"`);
        return c.json({ error: 'Authentication required to update this page' }, 401);
      }
      
      const validPassword = await verifyPassword(basicAuth.password, existingPage.auth.passwordHash);
      if (!validPassword) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }
    }
  }

  // Decode HTML if given
  const decodedHtml = body.html ? decodeHtml(body.html, body.encoding) : undefined;

  // Decode markdown if provided
  const decodedMarkdown = body.markdown 
    ? decodeMarkdown(body.markdown, body.markdown_encoding || body.encoding) 
    : undefined;

  // Image is stored as base64 (validated already)
  const imageData = body.image;

  // Handle video: decode base64 and save to filesystem
  let videoPath: string | undefined;
  if (body.video) {
    const videoBuffer = Buffer.from(body.video, 'base64');
    videoPath = await saveVideo(id, videoBuffer, body.content_type || 'video/mp4', subdomain);
  }

  // Generate ETag from combined content
  const etagContent = (decodedHtml || '') + (decodedMarkdown || '') + (imageData || '') + (videoPath || '');
  const etag = generateEtag(etagContent);

  // Process auth if provided
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
  }

  // Save to database
  const { page, created } = await savePage(
    id,
    {
      html: decodedHtml,
      markdown: decodedMarkdown,
      image: imageData,
      video: videoPath,
      encoding: 'utf-8',
      content_type: body.content_type,
      title: body.title,
      subdomain: subdomain,
      auth: authData,
    },
    etag
  );
  
  // Increment subdomain page count if this is a new page
  if (created && subdomain) {
    incrementSubdomainPageCount(subdomain);
  }

  // Build response URLs
  const baseUrl = config.baseUrl;
  const protocol = baseUrl.startsWith('https') ? 'https' : 'http';
  const domain = baseUrl.replace(/^https?:\/\//, '');
  
  let pageUrl: string;
  if (subdomain) {
    // Subdomain URL: https://{subdomain}.{domain}/{path}
    const path = page.id === 'index' ? '/' : `/${page.id}`;
    pageUrl = `${protocol}://${subdomain}.${domain}${path}`;
  } else {
    // Regular URL: https://{domain}/p/{id}
    pageUrl = `${baseUrl}/p/${page.id}`;
  }
  
  const response: Record<string, string> = {
    id: page.id,
    url: pageUrl,
    etag: page.etag,
  };
  
  // Add subdomain info if applicable
  if (subdomain) {
    response.subdomain = subdomain;
    response.path = page.id === 'index' ? '/' : `/${page.id}`;
  }
  
  // Add raw URL
  if (subdomain) {
    response.raw_url = `${pageUrl}/raw`;
  } else {
    response.raw_url = `${baseUrl}/p/${page.id}/raw`;
  }

  // Add markdown URL if markdown was provided
  if (page.markdown) {
    if (subdomain) {
      response.markdown_url = `${pageUrl}/md`;
    } else {
      response.markdown_url = `${baseUrl}/p/${page.id}/md`;
    }
  }

  // Add secret URLs if token was generated
  if (urlToken) {
    response.secret_url = `${pageUrl}?token=${urlToken}`;
    response.secret_raw_url = `${pageUrl}/raw?token=${urlToken}`;
    if (page.markdown) {
      response.secret_markdown_url = `${pageUrl}/md?token=${urlToken}`;
    }
  }

  // Add image URL if image was provided
  if (page.image) {
    if (subdomain) {
      response.image_url = `${pageUrl}/image`;
    } else {
      response.image_url = `${baseUrl}/p/${page.id}/image`;
    }
  }

  // Add video URL if video was provided
  if (page.video) {
    if (subdomain) {
      response.video_url = `${pageUrl}/video`;
    } else {
      response.video_url = `${baseUrl}/p/${page.id}/video`;
    }
  }

  // Track page creation or update
  const contentSize = (decodedHtml?.length || 0) + (decodedMarkdown?.length || 0) + (imageData?.length || 0);
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

  // Track API call
  trackApiCall({
    endpoint: '/v1/pages/:id',
    method: 'POST',
    pageId: page.id,
    statusCode: created ? 201 : 200,
  });

  c.header('ETag', page.etag);
  return c.json(response, created ? 201 : 200);
});

// DELETE /v1/pages/:id - Delete a page
pages.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const subdomainHeader = c.req.header('X-Subdomain');
  const subdomain = subdomainHeader ? subdomainHeader.toLowerCase() : undefined;

  // Validate ID
  const idError = validateId(id);
  if (idError) {
    return c.json({ error: idError.message }, 400);
  }

  // Get page
  const page = subdomain ? getPage(id, subdomain) : getPage(id);
  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  // If page has auth, verify password
  if (page.auth?.passwordHash) {
    const authHeader = c.req.header('Authorization');
    const basicAuth = parseBasicAuth(authHeader);
    const realm = subdomain ? `ZenBin-${subdomain}-${id}` : `ZenBin-${id}`;
    
    if (!basicAuth) {
      c.header('WWW-Authenticate', `Basic realm="${realm}"`);
      return c.json({ error: 'Authentication required to delete this page' }, 401);
    }
    
    const validPassword = await verifyPassword(basicAuth.password, page.auth.passwordHash);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
  }

  // Delete the page
  const deleted = await deletePageFromDb(id, subdomain);
  if (!deleted) {
    return c.json({ error: 'Failed to delete page' }, 500);
  }

  // Delete video file if exists
  if (page.video) {
    await deleteVideo(page.video);
  }

  // Decrement subdomain page count if applicable
  if (subdomain) {
    decrementSubdomainPageCount(subdomain);
  }

  // Track page deletion
  trackPageDeleted({
    pageId: id,
    subdomain,
    hadAuth: !!page.auth,
    contentType: page.content_type || 'text/html',
  });

  // Track API call
  trackApiCall({
    endpoint: '/v1/pages/:id',
    method: 'DELETE',
    pageId: id,
    statusCode: 204,
  });

  return c.body(null, 204);
});

export { pages };