import { Context, Next } from 'hono';
import { trackApiCall, trackShardDistribution, capture } from '../analytics/posthog.js';
import { getShardDistribution } from '../sharding/metadata.js';

/**
 * Telemetry middleware - Track API calls and shard distribution
 *
 * Tracks:
 * - Request duration
 * - Endpoint, method, status
 * - Subdomain usage
 * - Shard distribution (periodic)
 */
export async function telemetryMiddleware(c: Context, next: Next) {
  const start = Date.now();

  // Run the handler
  await next();

  const duration = Date.now() - start;
  const path = c.req.path;
  const method = c.req.method;
  const status = c.res.status;
  const subdomain = c.get('subdomain') || null;
  const apiKeyId = c.get('apiKeyId') || null;

  // Track API call
  trackApiCall({
    endpoint: path,
    method,
    statusCode: status,
    apiKeyId: apiKeyId || undefined,
    pageId: extractPageId(path),
  });

  // Add timing header
  c.header('X-Response-Time', `${duration}ms`);

  // Periodically track shard distribution (1% of requests)
  if (Math.random() < 0.01) {
    try {
      const distribution = getShardDistribution();
      trackShardDistribution(distribution);
    } catch {
      // Metadata index might not be initialized
    }
  }
}

/**
 * Extract page ID from path if present
 */
function extractPageId(path: string): string | undefined {
  // Match /p/{id} or /v1/pages/{id}
  const match = path.match(/\/(?:p|v1\/pages)\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : undefined;
}

/**
 * Track subdomain-specific events
 */
export function trackSubdomainEvent(
  event: 'subdomain_created' | 'subdomain_deleted' | 'subdomain_page_added',
  subdomain: string,
  metadata?: Record<string, unknown>
): void {
  capture({
    distinctId: `subdomain:${subdomain}`,
    event,
    properties: {
      app: 'zenbin',
      subdomain,
      ...metadata,
    },
  });
}