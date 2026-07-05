import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { bodyLimit } from 'hono/body-limit';
import dotenv from 'dotenv';
import { config } from './config.js';
import { initDatabase, closeDatabase, backfillOwnerIndex, backfillRecipientIndex, backfillKeyFingerprints, backfillAttestationIndexes, cleanupExpiredNonces, listPublicPageIds } from './storage/db.js';
import { initVideoStorage } from './storage/video.js';
import { createServices, type Services } from './services/container.js';
import { pages } from './routes/pages.js';
import { render } from './routes/render.js';
import { agent } from './routes/agent.js';
import { stats } from './routes/stats.js';
import { wellKnown } from './routes/wellKnown.js';
import { subdomains } from './routes/subdomains.js';
import { rateLimit } from './middleware/rateLimit.js';
import { proxyRateLimit } from './middleware/proxyRateLimit.js';
import { proxy } from './routes/proxy.js';
import { verifyApiKey } from './middleware/verifyApiKey.js';
import { initAnalytics, closeAnalytics, trackError } from './analytics/posthog.js';
import { serveLandingPage } from './routes/landing.js';
import { billing } from './routes/billing.js';
import { serveSubdomainPage } from './routes/subdomainRender.js';
import { adminKeys } from './routes/adminKeys.js';
import { keys } from './routes/keys.js';
import { verify } from './routes/verify.js';

// Type for context variables
type Variables = {
  subdomain: string;
  services: Services;
};

const app = new Hono<{ Variables: Variables }>();

// Initialize services
const services = createServices();

// Middleware
app.use('*', logger());
app.use('*', cors());
// Hard transport-level body cap: reject oversized payloads before any handler
// buffers the full body (e.g. signed-agent digest verification reads it whole).
app.use('*', bodyLimit({
  maxSize: config.maxRequestBodyBytes,
  onError: (c) => c.json({ error: 'Request body too large' }, 413),
}));
app.use('*', rateLimit);

// Inject services into request context
app.use('*', async (c, next) => {
  c.set('services', services);
  await next();
});

// Subdomain detection middleware
app.use('*', async (c, next) => {
  // Strip any port, then require the host to actually be under our base domain
  // before treating the first label as a subdomain. Without this, any host with
  // ≥3 labels (e.g. a spoofed Host header or foo.attacker.com pointed here) is
  // routed as a subdomain.
  const host = (c.req.header('host') || '').split(':')[0].toLowerCase();
  const baseDomain = config.subdomains.baseDomain.toLowerCase();
  const suffix = `.${baseDomain}`;

  if (host.endsWith(suffix)) {
    const labels = host.slice(0, -suffix.length).split('.');
    // Exactly one label in front of the base domain → a subdomain.
    if (labels.length === 1 && labels[0]) {
      const potentialSubdomain = labels[0];
      const reserved = new Set(config.subdomains.reservedNames);
      if (!reserved.has(potentialSubdomain) && potentialSubdomain !== 'www') {
        c.set('subdomain', potentialSubdomain);
      }
    }
  }

  await next();
});

// API Key verification (must be after rateLimit to avoid abuse)
app.use('/v1/*', verifyApiKey);
app.use('/api/proxy/*', verifyApiKey);

// Well-known endpoints (for agent discoverability)
app.route('/.well-known', wellKnown);

// Robots.txt - Allow social media crawlers
app.get('/robots.txt', (c) => {
  const robotsTxt = `# Allow all crawlers to access public pages
User-agent: *
Allow: /p/
Allow: /

# Allow social media crawlers full access for link previews
User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Pinterest
Allow: /

User-agent: Googlebot
Allow: /

# Disallow API endpoints from indexing
Disallow: /v1/
Disallow: /api/

Sitemap: ${config.baseUrl}/sitemap.xml
`;
  c.header('Content-Type', 'text/plain; charset=utf-8');
  return c.body(robotsTxt);
});

// llms.txt - AI/LLM discoverability
app.get('/llms.txt', async (c) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const llmsTxt = fs.readFileSync(path.join(__dirname, '../public/llms.txt'), 'utf-8');
    c.header('Content-Type', 'text/plain; charset=utf-8');
    return c.body(llmsTxt);
  } catch {
    return c.notFound();
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sitemap.xml - dynamically generated from public pages
app.get('/sitemap.xml', (c) => {
  const baseUrl = config.baseUrl;
  const publicPages = listPublicPageIds();

  const urls: string[] = [`  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`];

  for (const page of publicPages) {
    const pageUrl = page.subdomain
      ? `https://${page.subdomain}.${baseUrl.replace('https://', '')}/p/${page.id}`
      : `${baseUrl}/p/${page.id}`;
    const lastmod = page.updated_at ? `<lastmod>${page.updated_at}</lastmod>` : '';
    urls.push(`  <url><loc>${pageUrl}</loc>${lastmod}<changefreq>monthly</changefreq><priority>0.6</priority></url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  c.header('Content-Type', 'application/xml; charset=utf-8');
  return c.body(sitemap);
});

// API routes
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);
app.route('/v1/stats', stats);
app.route('/v1/keys', keys);
app.route('/v1/verify', verify);
app.route('/v1/admin/keys', adminKeys);
app.route('/v1/billing', billing);

// Agent instructions
app.route('/api/agent', agent);

// Proxy endpoint (with stricter rate limiting)
app.use('/api/proxy/*', proxyRateLimit);
app.route('/api/proxy', proxy);

// Render routes (for /p/{id} paths - backwards compatibility)
app.route('/p', render);

// Root path handler - landing page for main domain, subdomain page for subdomains
app.get('/', async (c) => {
  const subdomain = c.get('subdomain');
  
  if (subdomain) {
    // Subdomain request - render subdomain index page
    return serveSubdomainPage(c, subdomain, '/');
  }
  
  // Main domain request - render landing page
  return serveLandingPage(c);
});

// Catch-all route for other paths (subdomain pages or 404)
app.get('/*', async (c) => {
  const subdomain = c.get('subdomain');
  const path = c.req.path;
  
  if (subdomain) {
    // Subdomain request - render subdomain page
    return serveSubdomainPage(c, subdomain, path);
  }
  
  // Main domain request - not found for other paths
  return c.json({ error: 'Not found' }, 404);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  
  const endpoint = c.req.path;
  const method = c.req.method;
  const statusCode = 500;
  
  trackError({
    error: err.message || String(err),
    stack: err.stack,
    endpoint,
    method,
    statusCode,
  });
  
  return c.json({ error: 'Internal server error' }, 500);
});

// Initialize database and start server
async function main() {
  // Load environment variables FIRST (ESM requires explicit path)
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  
  try {
    console.log('Initializing database...');
    initDatabase();
    console.log(`Database initialized at ${config.lmdbPath}`);

    // Backfill owner index for pages created before the listing feature
    const backfillResult = backfillOwnerIndex();
    if (backfillResult.indexed > 0 || backfillResult.skipped > 0) {
      console.log(`Owner index backfill: ${backfillResult.indexed} indexed, ${backfillResult.skipped} skipped (no ownerKeyId)`);
    }

    // Backfill recipient index for pages created before the recipient feature
    const recipientBackfillResult = backfillRecipientIndex();
    if (recipientBackfillResult.indexed > 0 || recipientBackfillResult.skipped > 0) {
      console.log(`Recipient index backfill: ${recipientBackfillResult.indexed} indexed, ${recipientBackfillResult.skipped} skipped (no recipientKeyId)`);
    }

    // Backfill attestation indexes for pages that have attestation data
    const attestationBackfillResult = backfillAttestationIndexes();
    if (attestationBackfillResult.indexed > 0 || attestationBackfillResult.skipped > 0) {
      console.log(`Attestation index backfill: ${attestationBackfillResult.indexed} indexed, ${attestationBackfillResult.skipped} skipped`);
    }

    // Backfill publicKeyFingerprint for keys that don't have one
    const fpResult = backfillKeyFingerprints();
    if (fpResult.updated > 0 || fpResult.skipped > 0) {
      console.log(`Key fingerprint backfill: ${fpResult.updated} updated, ${fpResult.skipped} skipped (already have fingerprint)`);
    }

    console.log('Initializing video storage...');
    initVideoStorage();
    console.log(`Video storage initialized at ${config.videoStoragePath}`);

    console.log('Initializing analytics...');
    initAnalytics();

    // Periodically sweep expired nonces so the nonce store does not grow
    // without bound (honest clients never re-present a nonce, so the inline
    // cleanup never fires for them).
    const nonceSweep = setInterval(() => {
      try {
        cleanupExpiredNonces();
      } catch (err) {
        console.error('Nonce sweep failed:', err);
      }
    }, 10 * 60 * 1000);
    nonceSweep.unref();

    // Security warnings for missing secrets
    if (!process.env.ZENBIN_JWT_SECRET) {
      console.warn('[ZenBin] WARNING: ZENBIN_JWT_SECRET is not set. JWT-based API key verification is disabled.');
    }
    if (!process.env.ADMIN_TOKEN) {
      console.warn('[ZenBin] WARNING: ADMIN_TOKEN is not set. Admin API routes are disabled.');
    }

    const server = serve({
      fetch: app.fetch,
      port: config.port,
      hostname: config.host,
    }, (info) => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███████╗███████╗███╗   ██╗██████╗ ██╗███╗   ██╗         ║
║   ╚══███╔╝██╔════╝████╗  ██║██╔══██╗██║████╗  ██║         ║
║     ███╔╝ █████╗  ██╔██╗ ██║██████╔╝██║██╔██╗ ██║         ║
║    ███╔╝  ██╔══╝  ██║╚██╗██║██╔══██╗██║██║╚██╗██║         ║
║   ███████╗███████╗██║ ╚████║██████╔╝██║██║ ╚████║         ║
║   ╚══════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═══╝         ║
║                                                           ║
║   Headless HTML Sandbox                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Server running at http://${info.address}:${info.port}

Endpoints:
  GET  /                        - Landing page
  GET  /robots.txt              - Robots.txt for crawlers
  GET  /llms.txt                - LLM discoverability file
  GET  /sitemap.xml             - XML sitemap for search engines
  GET  /.well-known/agent.md     - Agent setup: keygen → register → publish
  GET  /.well-known/skill.md     - Agent instructions
  GET  /.well-known/register.md  - Agent key registration + signing guide
  GET  /v1/stats                - Site statistics
  POST /v1/keys/register        - Self-register signing key
  GET  /v1/admin/keys           - List signing keys (admin)
  POST /v1/admin/keys          - Register signing key (admin)
  POST /v1/subdomains/{name}    - Claim a subdomain
  GET  /v1/subdomains/{name}    - Get subdomain info
  GET  /v1/subdomains/{name}/pages - List subdomain pages
  DELETE /v1/subdomains/{name}  - Delete subdomain
  POST /v1/pages/{id}           - Create or replace a page (signed)
  POST /v1/billing/usage        - Get current plan usage (signed)
  POST /v1/billing/checkout    - Create Stripe checkout session (signed)
  POST /v1/billing/portal      - Create Stripe customer portal (signed)
  POST /v1/billing/webhook     - Stripe webhook handler
  GET  /p/{id}                  - Render page in browser
  GET  /p/{id}/raw              - Fetch raw HTML
  GET  /p/{id}/md               - Fetch markdown source
  GET  /p/{id}/image            - Fetch image content
  GET  /p/{id}/video            - Stream video content (with Range support)
  GET  /{path} (subdomain)      - Render subdomain page
  GET  /api/agent               - Agent instructions (markdown)
  GET  /api/agent/register      - Agent key registration + signing guide
  POST /api/proxy               - Proxy external requests (CORS bypass)
  GET  /health                  - Health check

Subdomain routing:
  {name}.${config.subdomains.baseDomain}/  - Subdomain root page
  {name}.${config.subdomains.baseDomain}/{path} - Subdomain nested pages

Configuration:
  Max payload size: ${config.maxPayloadSize} bytes
  Rate limit: ${config.rateLimitMaxRequests} requests per ${config.rateLimitWindowMs / 1000}s
  Proxy rate limit: ${config.proxyRateLimitMax} requests per ${config.proxyRateLimitWindowMs / 1000}s

API Key Configuration:
  JWT Secret: ${process.env.ZENBIN_JWT_SECRET ? 'configured' : 'NOT SET (using default)'}
  Free tier: 10 requests/month
`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      await closeAnalytics();
      await closeDatabase();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
