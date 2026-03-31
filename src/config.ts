// ZenBin Configuration

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // Storage
  lmdbPath: process.env.LMDB_PATH || './data/zenbin.lmdb',

  // Limits
  maxPayloadSize: parseInt(process.env.MAX_PAYLOAD_SIZE || '524288', 10), // 512KB default
  maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10), // 5MB default
  maxIdLength: parseInt(process.env.MAX_ID_LENGTH || '128', 10),

  // Image settings
  allowedImageTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Proxy
  proxyTimeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS || '30000', 10),
  proxyMaxRequestSize: parseInt(process.env.PROXY_MAX_REQUEST_SIZE || '5242880', 10),
  proxyMaxResponseSize: parseInt(process.env.PROXY_MAX_RESPONSE_SIZE || '5242880', 10),
  proxyAllowedDomains: process.env.PROXY_ALLOWED_DOMAINS?.split(',').filter(Boolean) || [],
  proxyRateLimitMax: parseInt(process.env.PROXY_RATE_LIMIT_MAX || '5', 10),
  proxyRateLimitWindowMs: parseInt(process.env.PROXY_RATE_LIMIT_WINDOW_MS || '60000', 10),
  proxyMaxRedirects: parseInt(process.env.PROXY_MAX_REDIRECTS || '3', 10),

  // Auth
  auth: {
    bcryptRounds: parseInt(process.env.AUTH_BCRYPT_ROUNDS || '10', 10),
    tokenLength: parseInt(process.env.AUTH_TOKEN_LENGTH || '32', 10),
    minPasswordLength: parseInt(process.env.AUTH_MIN_PASSWORD_LENGTH || '8', 10),
    maxFailedAttempts: parseInt(process.env.AUTH_MAX_FAILED_ATTEMPTS || '5', 10),
    failedAttemptWindowMs: parseInt(process.env.AUTH_FAILED_ATTEMPT_WINDOW_MS || '900000', 10), // 15 minutes
    lockoutDurationMs: parseInt(process.env.AUTH_LOCKOUT_DURATION_MS || '900000', 10), // 15 minutes
  },

  // Analytics
  posthogKey: process.env.POSTHOG_KEY || '',

  // Free Tier
  freeTier: {
    monthlyLimit: parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || '100', 10),
    monthlyWindowMs: parseInt(process.env.FREE_TIER_WINDOW_MS || '2592000000', 10), // 30 days
  },

  // Subdomains
  subdomains: {
    enabled: process.env.SUBDOMAINS_ENABLED !== 'false', // default true
    maxLength: parseInt(process.env.SUBDOMAIN_MAX_LENGTH || '63', 10),
    maxPagesPerSubdomain: parseInt(process.env.SUBDOMAIN_MAX_PAGES || '10000', 10),
    reservedNames: (process.env.SUBDOMAIN_RESERVED_NAMES || 'www,api,mail,admin,blog,docs,help,support,status,billing,account,accounts,app,apps,dashboard,cdn,static,assets,img,images,image,forum,forums,wiki,news,m,dev,staging,test,testing,sandbox,beta,alpha,lab,labs,store,shop,pricing,legal,privacy,terms,security, careers,jobs,contact,about,home').split(',').filter(Boolean),
    baseDomain: process.env.SUBDOMAIN_BASE_DOMAIN || 'zenbin.org', // Fixed: zenbin.org
  },
} as const;

// Validation
export const ID_PATTERN = /^[A-Za-z0-9._-]+$/;