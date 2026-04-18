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
  subdomain?: string;
  contentSize: number;
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
        subdomain: params.subdomain || null,
        content_size_bytes: params.contentSize,
      },
    });
  } catch (error) {
    console.error('PostHog trackPageCreated error:', error);
  }
}

/**
 * Track a page updated event
 */
export function trackPageUpdated(params: {
  pageId: string;
  hasAuth: boolean;
  contentType: string;
  subdomain?: string;
  contentSize: number;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: `page:${params.pageId}`,
      event: 'page_updated',
      properties: {
        app: 'zenbin',
        page_id: params.pageId,
        has_auth: params.hasAuth,
        content_type: params.contentType,
        subdomain: params.subdomain || null,
        content_size_bytes: params.contentSize,
      },
    });
  } catch (error) {
    console.error('PostHog trackPageUpdated error:', error);
  }
}

/**
 * Track a page deleted event
 */
export function trackPageDeleted(params: {
  pageId: string;
  subdomain?: string;
  hadAuth: boolean;
  contentType: string;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: `page:${params.pageId}`,
      event: 'page_deleted',
      properties: {
        app: 'zenbin',
        page_id: params.pageId,
        subdomain: params.subdomain || null,
        had_auth: params.hadAuth,
        content_type: params.contentType,
      },
    });
  } catch (error) {
    console.error('PostHog trackPageDeleted error:', error);
  }
}

/**
 * Track a subdomain event
 */
export function trackSubdomainEvent(
  event: 'subdomain_created' | 'subdomain_deleted',
  subdomain: string,
  metadata?: {
    pageCount?: number;
  reason?: string;
  }
): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: `subdomain:${subdomain}`,
      event,
      properties: {
        app: 'zenbin',
        subdomain,
        page_count: metadata?.pageCount || 0,
        reason: metadata?.reason || null,
      },
    });
  } catch (error) {
    console.error('PostHog trackSubdomainEvent error:', error);
  }
}

/**
 * Track authentication events
 */
export function trackAuthEvent(params: {
  event: 'auth_success' | 'auth_failed' | 'auth_rate_limited';
  pageId: string;
  authType: 'password' | 'url_token' | 'basic';
  subdomain?: string;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: `page:${params.pageId}`,
      event: params.event,
      properties: {
        app: 'zenbin',
        page_id: params.pageId,
        auth_type: params.authType,
        subdomain: params.subdomain || null,
      },
    });
  } catch (error) {
    console.error('PostHog trackAuthEvent error:', error);
  }
}

/**
 * Track server errors
 */
export function trackError(params: {
  error: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: 'system',
      event: 'server_error',
      properties: {
        app: 'zenbin',
        error: params.error,
        stack: params.stack || null,
        endpoint: params.endpoint || null,
        method: params.method || null,
        status_code: params.statusCode || null,
      },
    });
  } catch (error) {
    console.error('PostHog trackError error:', error);
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

/**
 * Track shard distribution
 */
export function trackShardDistribution(distribution: Map<string, number>): void {
  if (!client) return;

  try {
    const total = Array.from(distribution.values()).reduce((a, b) => a + b, 0);
    const shards = Array.from(distribution.entries()).map(([shard, count]) => ({
      shard,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    client.capture({
      distinctId: 'system',
      event: 'shard_distribution',
      properties: {
        app: 'zenbin',
        total_pages: total,
        shard_count: distribution.size,
        shards,
      },
    });
  } catch (error) {
    console.error('PostHog trackShardDistribution error:', error);
  }
}

/**
 * Track content hash (for deduplication metrics)
 */
export function trackContentHash(params: {
  contentHash: string;
  isDuplicate: boolean;
  shard: string;
  size: number;
}): void {
  if (!client) return;

  try {
    client.capture({
      distinctId: 'system',
      event: 'content_hash_created',
      properties: {
        app: 'zenbin',
        content_hash_prefix: params.contentHash.slice(0, 8),
        is_duplicate: params.isDuplicate,
        shard: params.shard,
        content_size_bytes: params.size,
      },
    });
  } catch (error) {
    console.error('PostHog trackContentHash error:', error);
  }
}

/**
 * Generic capture function
 */
export function capture(params: {
  distinctId: string;
  event: string;
  properties: Record<string, unknown>;
}): void {
  if (!client) return;

  try {
    client.capture(params);
  } catch (error) {
    console.error('PostHog capture error:', error);
  }
}