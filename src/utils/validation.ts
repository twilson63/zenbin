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
