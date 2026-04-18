import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import dotenv from 'dotenv';
import { config } from './config.js';
import { initDatabase, closeDatabase } from './storage/db.js';
import { initVideoStorage } from './storage/video.js';
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
import { initAnalytics, closeAnalytics } from './analytics/posthog.js';
import { serveLandingPage } from './routes/landing.js';
import { serveSubdomainPage } from './routes/subdomainRender.js';

// Type for context variables
type Variables = {
  subdomain: string;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', rateLimit);

// Subdomain detection middleware
app.use('*', async (c, next) => {
  const host = c.req.header('host') || '';
  const baseDomain = config.subdomains.baseDomain;
  
  // Check if this is a subdomain request
  const parts = host.split('.');
  if (parts.length >= 3) {
    const potentialSubdomain = parts[0].toLowerCase();
    const reserved = new Set(config.subdomains.reservedNames);
    if (!reserved.has(potentialSubdomain) && potentialSubdomain !== 'www') {
      c.set('subdomain', potentialSubdomain);
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

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/v1/pages', pages);
app.route('/v1/subdomains', subdomains);
app.route('/v1/stats', stats);

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

    console.log('Initializing video storage...');
    initVideoStorage();
    console.log(`Video storage initialized at ${config.videoStoragePath}`);

    console.log('Initializing analytics...');
    initAnalytics();

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
  GET  /.well-known/skill.md    - Agent instructions
  GET  /v1/stats                - Site statistics
  POST /v1/subdomains/{name}    - Claim a subdomain
  GET  /v1/subdomains/{name}    - Get subdomain info
  GET  /v1/subdomains/{name}/pages - List subdomain pages
  DELETE /v1/subdomains/{name}  - Delete subdomain
  POST /v1/pages/{id}           - Create or replace a page (use X-Subdomain header for subdomains)
  GET  /p/{id}                  - Render page in browser
  GET  /p/{id}/raw              - Fetch raw HTML
  GET  /p/{id}/md               - Fetch markdown source
  GET  /p/{id}/image            - Fetch image content
  GET  /p/{id}/video            - Stream video content (with Range support)
  GET  /{path} (subdomain)      - Render subdomain page
  GET  /api/agent               - Agent instructions (markdown)
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