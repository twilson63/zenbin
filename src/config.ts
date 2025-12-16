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
  maxIdLength: parseInt(process.env.MAX_ID_LENGTH || '128', 10),

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
} as const;

// Validation
export const ID_PATTERN = /^[A-Za-z0-9._-]+$/;
