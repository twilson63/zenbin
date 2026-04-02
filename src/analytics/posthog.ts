import { PostHog } from 'posthog-node';
import { createHash } from 'crypto';
import { config } from '../config.js';

let client: PostHog | null = null;

/**
 * Initialize PostHog client
 * Falls back to no-op if POSTHOG_KEY is not configured or fails to initialize
 */
export function initAnalytics(): void {
  if (config.posthogKey) {
    try {
      client = new PostHog(config.posthogKey, {
        host: 'https://us.i.posthog.com',
      });
      console.log('PostHog analytics initialized');
    } catch (error) {
      console.error('Failed to initialize PostHog analytics:', error);
      client = null;
    }
  } else {
    console.log('PostHog key not configured - analytics disabled');
  }
}

/**
 * Shutdown PostHog client gracefully
 */
export async function closeAnalytics(): Promise<void> {
  if (client) {
    await client.shutdown();
    client = null;
  }
}

/**
 * Track a page view event
 */
export function trackPageView(params: {
  pageId: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: `page:${params.pageId}`,
      event: 'page_view',
      properties: {
        app: 'zenbin',
        page_id: params.pageId,
        referrer: params.referrer || null,
        user_agent: params.userAgent || null,
        ip_hash: params.ip ? hashIp(params.ip) : null,
      },
    });
  } catch (error) {
    console.error('PostHog trackPageView error:', error);
  }
}

/**
 * Track an API call event
 */
export function trackApiCall(params: {
  endpoint: string;
  method: string;
  pageId?: string;
  apiKeyId?: string;
  statusCode: number;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: params.apiKeyId ? `key:${hashApiKey(params.apiKeyId)}` : 'anonymous',
      event: 'api_call',
      properties: {
        app: 'zenbin',
        endpoint: params.endpoint,
        method: params.method,
        page_id: params.pageId || null,
        api_key_hash: params.apiKeyId ? hashApiKey(params.apiKeyId) : null,
        status_code: params.statusCode,
      },
    });
  } catch (error) {
    console.error('PostHog trackApiCall error:', error);
  }
}

/**
 * Track a page created event
 */
export function trackPageCreated(params: {
  pageId: string;
  hasAuth: boolean;
  contentType: string;
  hasMarkdown: boolean;
  hasImage: boolean;
  hasVideo: boolean;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: `page:${params.pageId}`,
      event: 'page_created',
      properties: {
        app: 'zenbin',
        page_id: params.pageId,
        has_auth: params.hasAuth,
        content_type: params.contentType,
        has_markdown: params.hasMarkdown,
        has_image: params.hasImage,
        has_video: params.hasVideo,
      },
    });
  } catch (error) {
    console.error('PostHog trackPageCreated error:', error);
  }
}

/**
 * Hash an IP address for privacy
 */
function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * Hash an API key ID for privacy
 */
function hashApiKey(keyId: string): string {
  return createHash('sha256').update(keyId).digest('hex').substring(0, 16);
}