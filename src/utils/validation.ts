import { config, ID_PATTERN } from '../config.js';

export interface ValidationError {
  field: string;
  message: string;
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

  // Validate html field
  if (!data.html || typeof data.html !== 'string') {
    return { field: 'html', message: 'html field is required and must be a string' };
  }

  // Validate encoding if provided
  if (data.encoding !== undefined) {
    if (data.encoding !== 'utf-8' && data.encoding !== 'base64') {
      return { field: 'encoding', message: 'encoding must be "utf-8" or "base64"' };
    }
  }

  // Validate content_type if provided
  if (data.content_type !== undefined && typeof data.content_type !== 'string') {
    return { field: 'content_type', message: 'content_type must be a string' };
  }

  // Validate title if provided
  if (data.title !== undefined && typeof data.title !== 'string') {
    return { field: 'title', message: 'title must be a string' };
  }

  // Calculate actual HTML size (decode base64 if needed)
  let htmlSize: number;
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

  if (htmlSize > config.maxPayloadSize) {
    return { 
      field: 'html', 
      message: `HTML content exceeds maximum size of ${config.maxPayloadSize} bytes` 
    };
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
    }
  }

  return null;
}
