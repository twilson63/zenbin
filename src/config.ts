import 'dotenv/config';

// ZenBin Configuration
// Uses getters to ensure env vars are read at access time, not module load time

export const config = {
  // Server
  get port() { return parseInt(process.env.PORT || '3000', 10); },
  get host() { return process.env.HOST || '0.0.0.0'; },
  get baseUrl() { return process.env.BASE_URL || 'http://localhost:3000'; },

  // Storage
  get lmdbPath() { return process.env.LMDB_PATH || './data/zenbin.lmdb'; },

  // Limits
  get maxPayloadSize() { return parseInt(process.env.MAX_PAYLOAD_SIZE || '524288', 10); },
  get maxImageSize() { return parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10); },
  get maxIdLength() { return parseInt(process.env.MAX_ID_LENGTH || '128', 10); },

  // Media settings
  allowedImageTypes: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  get videoStoragePath() { return process.env.VIDEO_STORAGE_PATH || './data/videos'; },
  get maxVideoSize() { return parseInt(process.env.MAX_VIDEO_SIZE || '52428800', 10); },
  allowedVideoTypes: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ],

  // Rate Limiting
  get rateLimitWindowMs() { return parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); },
  get rateLimitMaxRequests() { return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); },

  // Proxy
  get proxyTimeoutMs() { return parseInt(process.env.PROXY_TIMEOUT_MS || '30000', 10); },
  get proxyMaxRequestSize() { return parseInt(process.env.PROXY_MAX_REQUEST_SIZE || '5242880', 10); },
  get proxyMaxResponseSize() { return parseInt(process.env.PROXY_MAX_RESPONSE_SIZE || '5242880', 10); },
  get proxyAllowedDomains() { return process.env.PROXY_ALLOWED_DOMAINS?.split(',').filter(Boolean) || []; },
  get proxyRateLimitMax() { return parseInt(process.env.PROXY_RATE_LIMIT_MAX || '5', 10); },
  get proxyRateLimitWindowMs() { return parseInt(process.env.PROXY_RATE_LIMIT_WINDOW_MS || '60000', 10); },
  get proxyMaxRedirects() { return parseInt(process.env.PROXY_MAX_REDIRECTS || '3', 10); },

  // Auth
  get auth() {
    return {
      bcryptRounds: parseInt(process.env.AUTH_BCRYPT_ROUNDS || '10', 10),
      tokenLength: parseInt(process.env.AUTH_TOKEN_LENGTH || '32', 10),
      minPasswordLength: parseInt(process.env.AUTH_MIN_PASSWORD_LENGTH || '8', 10),
      maxFailedAttempts: parseInt(process.env.AUTH_MAX_FAILED_ATTEMPTS || '5', 10),
      failedAttemptWindowMs: parseInt(process.env.AUTH_FAILED_ATTEMPT_WINDOW_MS || '900000', 10),
      lockoutDurationMs: parseInt(process.env.AUTH_LOCKOUT_DURATION_MS || '900000', 10),
    };
  },

  signedPublishing: {
    maxTimestampSkewMs: parseInt(process.env.SIGNED_PUBLISHING_MAX_TIMESTAMP_SKEW_MS || '300000', 10),
    nonceTtlMs: parseInt(process.env.SIGNED_PUBLISHING_NONCE_TTL_MS || '300000', 10),
  },

  get admin() {
    return {
      token: process.env.ADMIN_TOKEN || '',
    };
  },

  // Analytics
  get posthogKey() { return process.env.POSTHOG_KEY || ''; },
  get posthogHost() { return process.env.POSTHOG_HOST || 'https://us.i.posthog.com'; },

  // Free Tier
  get freeTier() {
    return {
      monthlyLimit: parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || '100', 10),
      monthlyWindowMs: parseInt(process.env.FREE_TIER_WINDOW_MS || '2592000000', 10),
    };
  },

  // Subdomains
  get subdomains() {
    return {
      enabled: process.env.SUBDOMAINS_ENABLED !== 'false',
      maxLength: parseInt(process.env.SUBDOMAIN_MAX_LENGTH || '63', 10),
      maxPagesPerSubdomain: parseInt(process.env.SUBDOMAIN_MAX_PAGES || '10000', 10),
      reservedNames: (process.env.SUBDOMAIN_RESERVED_NAMES || 'www,api,mail,admin,blog,docs,help,support,status,billing,account,accounts,app,apps,dashboard,cdn,static,assets,img,images,image,forum,forums,wiki,news,m,dev,staging,test,testing,sandbox,beta,alpha,lab,labs,store,shop,pricing,legal,privacy,terms,security, careers,jobs,contact,about,home').split(',').filter(Boolean),
      baseDomain: process.env.SUBDOMAIN_BASE_DOMAIN || 'zenbin.org',
    };
  },

  // Sharding (Content-Addressed Storage)
  get sharding() {
    return {
      enabled: process.env.SHARDING_ENABLED === 'true',
      shardCount: parseInt(process.env.SHARD_COUNT || '1', 10),
      hashLength: parseInt(process.env.SHARD_HASH_LENGTH || '16', 10),
      metadataPath: process.env.SHARD_METADATA_PATH || '',
    };
  },
} as const;

// Validation
export const ID_PATTERN = /^[A-Za-z0-9._-]+$/;
