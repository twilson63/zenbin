# ZenBin

A headless HTML sandbox — publish and serve HTML documents via a simple API.

## Overview

ZenBin is a lightweight web service that lets you publish HTML documents to unique IDs and view them at predictable URLs. It's optimized for fast sharing, demos, prototypes, and lightweight hosting of single-page HTML documents.

## Features

- **Simple API** — Store HTML by ID with a single POST request
- **Instant rendering** — View pages at `/p/{id}` in any browser
- **Raw access** — Fetch original HTML at `/p/{id}/raw`
- **Proxy endpoint** — Make external API calls from hosted pages (CORS bypass)
- **Safe by default** — Sandboxed rendering with restrictive security headers
- **ETag caching** — Efficient caching with `If-None-Match` support
- **Rate limiting** — Built-in abuse protection
- **Fast storage** — LMDB for high-performance reads/writes

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

The server starts at `http://localhost:3000` by default.

## API Reference

### Create or Replace a Page

```bash
POST /v1/pages/{id}
Content-Type: application/json
```

**Request body:**
```json
{
  "html": "<!doctype html><html><body>Hello World</body></html>",
  "title": "My Page",
  "encoding": "utf-8",
  "content_type": "text/html; charset=utf-8"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `html` | Yes | HTML content (string) |
| `title` | No | Page title (metadata) |
| `encoding` | No | `utf-8` (default) or `base64` |
| `content_type` | No | Content-Type header (default: `text/html; charset=utf-8`) |

**Response:**
```json
{
  "id": "my-page",
  "url": "http://localhost:3000/p/my-page",
  "raw_url": "http://localhost:3000/p/my-page/raw",
  "etag": "\"abc123...\""
}
```

- Returns `201 Created` for new pages
- Returns `200 OK` when replacing existing pages

### View a Page

```bash
GET /p/{id}
```

Returns the HTML page with security headers applied. Supports `If-None-Match` for caching (returns `304 Not Modified` if unchanged).

### Fetch Raw HTML

```bash
GET /p/{id}/raw
```

Returns the raw HTML as `text/plain` with a `Content-Disposition` header for downloading.

### Health Check

```bash
GET /health
```

Returns `{"status": "ok", "timestamp": "..."}`.

### Agent Instructions

```bash
GET /api/agent
```

Returns markdown instructions for AI agents on how to use the API.

### Proxy External Requests

```bash
POST /api/proxy
Content-Type: application/json
```

Allows ZenBin-hosted pages to make external HTTP requests through the server, bypassing CORS restrictions.

**Request body:**
```json
{
  "url": "https://api.example.com/data",
  "method": "GET",
  "auth": {
    "type": "bearer",
    "credentials": "your-token"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Target URL (http/https only) |
| `method` | No | HTTP method (default: `GET`) |
| `body` | No | Request body to forward (JSON) |
| `timeout` | No | Timeout in ms (max: 30000) |
| `contentType` | No | Content-Type for outgoing request |
| `accept` | No | Accept header for outgoing request |
| `auth` | No | Authentication config (see below) |

**Authentication types:**

| Type | Usage | Result Header |
|------|-------|---------------|
| `bearer` | `{ type: "bearer", credentials: "token" }` | `Authorization: Bearer token` |
| `basic` | `{ type: "basic", credentials: "base64" }` | `Authorization: Basic base64` |
| `api-key` | `{ type: "api-key", credentials: "key", headerName: "X-API-Key" }` | `X-API-Key: key` |

**Response:**
```json
{
  "status": 200,
  "statusText": "OK",
  "headers": { "content-type": "application/json" },
  "body": { ... }
}
```

**Security:** Only requests originating from ZenBin-hosted pages are allowed. SSRF protection blocks private IPs and internal endpoints.

## Examples

### Simple page

```bash
curl -X POST http://localhost:3000/v1/pages/hello \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello World</h1>"}'
```

### Styled page

```bash
curl -X POST http://localhost:3000/v1/pages/demo \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><head><style>body{font-family:sans-serif;padding:2rem}</style></head><body><h1>Demo</h1><p>This is a demo page.</p></body></html>",
    "title": "Demo Page"
  }'
```

### Base64 encoded content

```bash
# Encode your HTML
HTML_BASE64=$(echo -n '<h1>Encoded</h1>' | base64)

curl -X POST http://localhost:3000/v1/pages/encoded \
  -H "Content-Type: application/json" \
  -d "{\"encoding\":\"base64\",\"html\":\"$HTML_BASE64\"}"
```

## Configuration

Configure via environment variables or `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `BASE_URL` | `http://localhost:3000` | Base URL for generated links |
| `LMDB_PATH` | `./data/zenbin.lmdb` | Database path |
| `MAX_PAYLOAD_SIZE` | `524288` | Max HTML size in bytes (512KB) |
| `MAX_ID_LENGTH` | `128` | Max page ID length |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `PROXY_TIMEOUT_MS` | `30000` | Max timeout for proxy requests |
| `PROXY_MAX_REQUEST_SIZE` | `5242880` | Max proxy request body (5MB) |
| `PROXY_MAX_RESPONSE_SIZE` | `5242880` | Max proxy response size (5MB) |
| `PROXY_ALLOWED_DOMAINS` | `` | Comma-separated domain allowlist (empty = all) |
| `PROXY_RATE_LIMIT_MAX` | `5` | Max proxy requests per window |
| `PROXY_RATE_LIMIT_WINDOW_MS` | `60000` | Proxy rate limit window (ms) |
| `PROXY_MAX_REDIRECTS` | `3` | Max redirects to follow |

## Page ID Rules

Page IDs must:
- Contain only letters, numbers, dots, underscores, and hyphens (`A-Za-z0-9._-`)
- Be 128 characters or less (configurable)

Valid examples: `my-page`, `demo.v2`, `user_123`, `Report-2024.01`

## Security

Pages are served with restrictive security headers:

- `Content-Security-Policy` — Restricts external resources
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`
- `X-Frame-Options: DENY`

## Deploy to Render

ZenBin includes a `render.yaml` Blueprint for easy deployment to [Render.com](https://render.com).

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/twilson63/zenbin)

### Manual Setup

1. Fork or clone this repository
2. Create a new **Blueprint** in Render Dashboard
3. Connect your repository
4. Set the `BASE_URL` environment variable to your Render URL (e.g., `https://zenbin.onrender.com`)
5. Deploy

### What's Included

The Blueprint configures:
- **Web Service** — Node.js runtime on the Starter plan
- **Persistent Disk** — 1GB mounted at `/var/data` for LMDB storage
- **Health Check** — Monitors `/health` endpoint
- **Environment Variables** — Pre-configured for production

### Limitations

Due to Render's persistent disk constraints:
- **Single instance only** — Services with attached disks cannot scale horizontally
- **No zero-downtime deploys** — Brief downtime during redeploys (a few seconds)

For multi-instance deployments, consider replacing LMDB with Render Postgres or Redis.

## Development

```bash
# Run with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## License

MIT
