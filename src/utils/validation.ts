import { config, ID_PATTERN } from '../config.js';

export interface ValidationError {
  field: string;
  message: string;
}

export interface PageAuthInput {
  password?: string;
  urlToken?: boolean;
}

/**
 * Validate a page ID
 */
export function validateId(id: string): ValidationError | null {
  if (!id || id.length === 0) {
    return { field: 'id', message: 'Page ID is required' };
  }

  if (id.length > config.maxIdLength) {
    return { field: 'id', message: `Page ID must be ${config.maxIdLength} characters or less` };
  }

  if (!ID_PATTERN.test(id)) {
    return { field: 'id', message: 'Page ID can only contain letters, numbers, dots, underscores, and hyphens' };
  }

  return null;
}

/**
 * Validate request body for creating/updating a page
 */
export function validatePageBody(body: unknown): ValidationError | null {
  if (!body || typeof body !== 'object') {
    return { field: 'body', message: 'Request body must be a JSON object' };
  }

  const data = body as Record<string, unknown>;

  // Validate encoding if provided
  if (data.encoding !== undefined) {
    if (data.encoding !== 'utf-8' && data.encoding !== 'base64') {
      return { field: 'encoding', message: 'encoding must be "utf-8" or "base64"' };
    }
  }

  // Validate markdown field if provided
  let markdownSize = 0;
  if (data.markdown !== undefined) {
    if (typeof data.markdown !== 'string') {
      return { field: 'markdown', message: 'markdown must be a string' };
    }
    if (data.markdown_encoding === 'base64') {
      try {
        const decoded = Buffer.from(data.markdown as string, 'base64');
        markdownSize = decoded.length;
      } catch {
        return { field: 'markdown', message: 'Invalid base64 encoding for markdown' };
      }
    } else {
      markdownSize = Buffer.byteLength(data.markdown as string, 'utf-8');
    }
  }

  // Validate html field if provided
  let htmlSize = 0;
  if (data.html !== undefined) {
    if (typeof data.html !== 'string') {
      return { field: 'html', message: 'html must be a string' };
    }
    if (data.encoding === 'base64') {
      try {
        const decoded = Buffer.from(data.html as string, 'base64');
        htmlSize = decoded.length;
      } catch {
        return { field: 'html', message: 'Invalid base64 encoding' };
      }
    } else {
      htmlSize = Buffer.byteLength(data.html as string, 'utf-8');
    }
  }

  // Validate image field if provided
  let imageSize = 0;
  if (data.image !== undefined) {
    if (typeof data.image !== 'string') {
      return { field: 'image', message: 'image must be a base64-encoded string' };
    }
    try {
      const decoded = Buffer.from(data.image as string, 'base64');
      imageSize = decoded.length;
    } catch {
      return { field: 'image', message: 'Invalid base64 encoding for image' };
    }
    if (imageSize > config.maxImageSize) {
      return { 
        field: 'image', 
        message: `Image size exceeds maximum of ${config.maxImageSize} bytes` 
      };
    }
  }

  // Validate video field if provided
  let videoSize = 0;
  if (data.video !== undefined) {
    if (typeof data.video !== 'string') {
      return { field: 'video', message: 'video must be a base64-encoded string' };
    }
    try {
      const decoded = Buffer.from(data.video as string, 'base64');
      videoSize = decoded.length;
    } catch {
      return { field: 'video', message: 'Invalid base64 encoding for video' };
    }
    if (videoSize > config.maxVideoSize) {
      return { 
        field: 'video', 
        message: `Video size exceeds maximum of ${config.maxVideoSize} bytes (${Math.round(config.maxVideoSize / 1024 / 1024)}MB)` 
      };
    }
  }

  // At least one of html, markdown, image, or video must be provided
  if (!data.html && !data.markdown && !data.image && !data.video) {
    return { field: 'body', message: 'At least one of html, markdown, image, or video is required' };
  }

  // For image-only pages, validate content_type is an image type
  const isImagePage = data.image && !data.html && !data.markdown && !data.video;
  if (isImagePage) {
    const contentType = data.content_type as string | undefined;
    if (!contentType) {
      return { field: 'content_type', message: 'content_type is required for image pages' };
    }
    if (typeof contentType !== 'string') {
      return { field: 'content_type', message: 'content_type must be a string' };
    }
    if (!(config.allowedImageTypes as readonly string[]).includes(contentType)) {
      return { 
        field: 'content_type', 
        message: `content_type must be one of: ${config.allowedImageTypes.join(', ')}` 
      };
    }
  }

  // For video-only pages, validate content_type is a video type
  const isVideoPage = data.video && !data.html && !data.markdown && !data.image;
  if (isVideoPage) {
    const contentType = data.content_type as string | undefined;
    if (!contentType) {
      return { field: 'content_type', message: 'content_type is required for video pages' };
    }
    if (typeof contentType !== 'string') {
      return { field: 'content_type', message: 'content_type must be a string' };
    }
    if (!(config.allowedVideoTypes as readonly string[]).includes(contentType)) {
      return { 
        field: 'content_type', 
        message: `content_type must be one of: ${config.allowedVideoTypes.join(', ')}` 
      };
    }
  }

  // If both html/markdown and image are provided, content_type must still be valid
  if (data.content_type !== undefined && typeof data.content_type !== 'string') {
    return { field: 'content_type', message: 'content_type must be a string' };
  }

  // Check combined size for html/markdown
  const totalSize = htmlSize + markdownSize;
  if (totalSize > config.maxPayloadSize) {
    return { 
      field: 'body', 
      message: `Combined content size exceeds maximum of ${config.maxPayloadSize} bytes` 
    };
  }

  // Validate title if provided
  if (data.title !== undefined && typeof data.title !== 'string') {
    return { field: 'title', message: 'title must be a string' };
  }

  // Validate markdown_encoding if provided
  if (data.markdown_encoding !== undefined) {
    if (data.markdown_encoding !== 'utf-8' && data.markdown_encoding !== 'base64') {
      return { field: 'markdown_encoding', message: 'markdown_encoding must be "utf-8" or "base64"' };
    }
  }

  return null;
}

/**
 * Validate auth configuration for a page
 */
export function validateAuthInput(auth: unknown): ValidationError | null {
  if (!auth || typeof auth !== 'object') {
    return { field: 'auth', message: 'auth must be an object' };
  }

  const data = auth as Record<string, unknown>;

  // At least one auth method must be specified
  if (data.password === undefined && data.urlToken === undefined) {
    return { field: 'auth', message: 'auth must include password and/or urlToken' };
  }

  // Validate password if provided
  if (data.password !== undefined) {
    if (typeof data.password !== 'string') {
      return { field: 'auth.password', message: 'auth.password must be a string' };
    }
    if (data.password.length < config.auth.minPasswordLength) {
      return { 
        field: 'auth.password', 
        message: `auth.password must be at least ${config.auth.minPasswordLength} characters` 
      };
    }
  }

  // Validate urlToken if provided
  if (data.urlToken !== undefined && typeof data.urlToken !== 'boolean') {
    return { field: 'auth.urlToken', message: 'auth.urlToken must be a boolean' };
  }

  return null;
}

/**
 * Decode HTML content from request body
 */
export function decodeHtml(html: string, encoding: 'utf-8' | 'base64' = 'utf-8'): string {
  if (encoding === 'base64') {
    return Buffer.from(html, 'base64').toString('utf-8');
  }
  return html;
}

/**
 * Decode markdown content from request body
 */
export function decodeMarkdown(markdown: string, encoding: 'utf-8' | 'base64' = 'utf-8'): string {
  if (encoding === 'base64') {
    return Buffer.from(markdown, 'base64').toString('utf-8');
  }
  return markdown;
}

/**
 * Proxy request interfaces
 */
export interface ProxyAuth {
  type: 'bearer' | 'basic' | 'api-key';
  credentials: string;
  headerName?: string; // For api-key type only
}

export interface ProxyRequest {
  url: string;
  method?: string;
  body?: unknown;
  timeout?: number;
  contentType?: string;
  accept?: string;
  auth?: ProxyAuth;
}

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

// Headers that should not be overridden via auth.headerName
const BLOCKED_HEADER_NAMES = new Set([
  'host',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'upgrade',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'authorization', // Already handled by bearer/basic auth types
]);

/**
 * Validate a proxy request body
 */
export function validateProxyRequest(body: unknown, maxTimeout: number): ValidationError | null {
  if (!body || typeof body !== 'object') {
    return { field: 'body', message: 'Request body must be a JSON object' };
  }

  const data = body as Record<string, unknown>;

  // Validate URL is present and valid
  if (!data.url || typeof data.url !== 'string') {
    return { field: 'url', message: 'url field is required and must be a string' };
  }

  try {
    const parsedUrl = new URL(data.url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { field: 'url', message: 'url must use http or https protocol' };
    }
  } catch {
    return { field: 'url', message: 'url must be a valid URL' };
  }

  // Validate method if provided
  if (data.method !== undefined) {
    if (typeof data.method !== 'string') {
      return { field: 'method', message: 'method must be a string' };
    }
    if (!ALLOWED_METHODS.includes(data.method.toUpperCase())) {
      return { field: 'method', message: `method must be one of: ${ALLOWED_METHODS.join(', ')}` };
    }
  }

  // Validate timeout if provided
  if (data.timeout !== undefined) {
    if (typeof data.timeout !== 'number' || data.timeout <= 0) {
      return { field: 'timeout', message: 'timeout must be a positive number' };
    }
    if (data.timeout > maxTimeout) {
      return { field: 'timeout', message: `timeout must not exceed ${maxTimeout}ms` };
    }
  }

  // Validate contentType if provided
  if (data.contentType !== undefined && typeof data.contentType !== 'string') {
    return { field: 'contentType', message: 'contentType must be a string' };
  }

  // Validate accept if provided
  if (data.accept !== undefined && typeof data.accept !== 'string') {
    return { field: 'accept', message: 'accept must be a string' };
  }

  // Validate auth if provided
  if (data.auth !== undefined) {
    if (typeof data.auth !== 'object' || data.auth === null) {
      return { field: 'auth', message: 'auth must be an object' };
    }

    const auth = data.auth as Record<string, unknown>;
    
    if (!['bearer', 'basic', 'api-key'].includes(auth.type as string)) {
      return { field: 'auth.type', message: 'auth.type must be "bearer", "basic", or "api-key"' };
    }

    if (typeof auth.credentials !== 'string' || auth.credentials.length === 0) {
      return { field: 'auth.credentials', message: 'auth.credentials is required and must be a non-empty string' };
    }

    if (auth.type === 'api-key' && auth.headerName !== undefined) {
      if (typeof auth.headerName !== 'string' || auth.headerName.length === 0) {
        return { field: 'auth.headerName', message: 'auth.headerName must be a non-empty string' };
      }
      if (BLOCKED_HEADER_NAMES.has(auth.headerName.toLowerCase())) {
        return { field: 'auth.headerName', message: 'auth.headerName cannot override restricted headers' };
      }
    }
  }

  return null;
}
