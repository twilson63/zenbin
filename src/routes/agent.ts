import { Hono } from 'hono';
import { config } from '../config.js';

const agent = new Hono();

const getAgentInstructions = () => `# ZenBin API — Agent Instructions

You can publish HTML pages to ZenBin using a simple API. Each page gets a unique URL that can be shared or viewed in a browser.

## Base URL

\`${config.baseUrl}\`

## Publishing a Page

Send a POST request with a JSON body containing your HTML content:

\`\`\`
POST ${config.baseUrl}/v1/pages/{id}
Content-Type: application/json
\`\`\`

### Request Body

| Field | Required | Description |
|-------|----------|-------------|
| \`html\` | Yes | The HTML content (plain text or base64-encoded) |
| \`encoding\` | No | \`"utf-8"\` (default) or \`"base64"\` — specifies how the \`html\` field is encoded |
| \`title\` | No | Page title (metadata only) |
| \`content_type\` | No | Content-Type header for the page (default: \`text/html; charset=utf-8\`) |

### URL Path Parameter

| Parameter | Description |
|-----------|-------------|
| \`id\` | Unique page identifier. Allowed characters: \`A-Z\`, \`a-z\`, \`0-9\`, \`.\`, \`_\`, \`-\` |

### Response

**Success (201 Created):**

\`\`\`json
{
  "id": "my-page",
  "url": "${config.baseUrl}/p/my-page",
  "raw_url": "${config.baseUrl}/p/my-page/raw",
  "etag": "\"...\""
}
\`\`\`

- \`url\` — View the rendered page in a browser
- \`raw_url\` — Fetch the raw HTML content

**Error: ID Already Taken (409 Conflict):**

\`\`\`json
{
  "error": "Page ID \\"my-page\\" is already taken"
}
\`\`\`

Page IDs are permanent and cannot be overwritten. Choose a unique ID for each page.

## Encoding Options

### Option 1: Plain Text (encoding: "utf-8")

Send HTML as a plain string. You must escape special JSON characters (quotes, backslashes, newlines).

\`\`\`json
{
  "encoding": "utf-8",
  "html": "<!DOCTYPE html><html><head><title>Demo</title></head><body><h1>Hello!</h1></body></html>"
}
\`\`\`

### Option 2: Base64 Encoded (encoding: "base64")

**Recommended for complex HTML.** Encode your HTML as base64 to avoid JSON escaping issues.

\`\`\`json
{
  "encoding": "base64",
  "html": "PCFET0NUWVBFIGh0bWw+PGh0bWw+PGhlYWQ+PHRpdGxlPkRlbW88L3RpdGxlPjwvaGVhZD48Ym9keT48aDE+SGVsbG8hPC9oMT48L2JvZHk+PC9odG1sPg=="
}
\`\`\`

The server will decode the base64 content and store/render it as HTML.

## Examples

### Example 1: Plain text HTML

\`\`\`bash
curl -X POST ${config.baseUrl}/v1/pages/hello \\
  -H "Content-Type: application/json" \\
  -d '{"html":"<h1>Hello World</h1>"}'
\`\`\`

### Example 2: Base64 encoded HTML

\`\`\`bash
# The base64 below decodes to: <!DOCTYPE html><html><body><h1>Hello!</h1></body></html>
curl -X POST ${config.baseUrl}/v1/pages/hello-b64 \\
  -H "Content-Type: application/json" \\
  -d '{
    "encoding": "base64",
    "html": "PCFET0NUWVBFIGh0bWw+PGh0bWw+PGJvZHk+PGgxPkhlbGxvITwvaDE+PC9ib2R5PjwvaHRtbD4="
  }'
\`\`\`

### Example 3: Full page with styling

\`\`\`bash
curl -X POST ${config.baseUrl}/v1/pages/styled \\
  -H "Content-Type: application/json" \\
  -d '{
    "encoding": "utf-8",
    "html": "<!DOCTYPE html><html><head><meta charset=utf-8><style>body{font-family:system-ui;padding:2rem}</style></head><body><h1>Styled Page</h1></body></html>",
    "title": "My Styled Page"
  }'
\`\`\`

## Guidelines for Agents

1. **Use base64 encoding** — Strongly recommended to avoid JSON escaping issues with quotes, newlines, and special characters
2. **Generate complete HTML documents** — Include \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, and \`<body>\` tags
3. **Use inline styles** — External stylesheets may be blocked; use \`<style>\` tags or inline \`style\` attributes
4. **Keep pages self-contained** — All CSS and JS should be inline
5. **Use unique IDs** — Choose descriptive page IDs (e.g., \`report-2024-01-15\`, \`chart-demo-v2\`)

## Limits

- Maximum HTML size: ${Math.round(config.maxPayloadSize / 1024)}KB
- Maximum ID length: ${config.maxIdLength} characters
- Allowed ID characters: \`A-Za-z0-9._-\`

## Viewing Pages

After publishing, the page is available at:

- **Rendered:** \`${config.baseUrl}/p/{id}\`
- **Raw HTML:** \`${config.baseUrl}/p/{id}/raw\`

## Making External API Calls (Proxy)

ZenBin-hosted pages can make external API calls through the built-in proxy to bypass CORS restrictions.

### Endpoint

\`\`\`
POST ${config.baseUrl}/api/proxy
Content-Type: application/json
\`\`\`

### Request Body

| Field | Required | Description |
|-------|----------|-------------|
| \`url\` | Yes | Target URL (must be http/https) |
| \`method\` | No | HTTP method (default: "GET") |
| \`body\` | No | Request body to forward (JSON) |
| \`timeout\` | No | Timeout in ms (max: 30000) |
| \`contentType\` | No | Content-Type for outgoing request |
| \`accept\` | No | Accept header for outgoing request |
| \`auth\` | No | Authentication configuration (see below) |

### Authentication Options

| Type | Usage | Result Header |
|------|-------|---------------|
| \`bearer\` | \`{ type: "bearer", credentials: "token" }\` | \`Authorization: Bearer token\` |
| \`basic\` | \`{ type: "basic", credentials: "base64" }\` | \`Authorization: Basic base64\` |
| \`api-key\` | \`{ type: "api-key", credentials: "key", headerName: "X-API-Key" }\` | \`X-API-Key: key\` |

### Response

\`\`\`json
{
  "status": 200,
  "statusText": "OK",
  "headers": { "content-type": "application/json" },
  "body": { ... }
}
\`\`\`

### Example Usage

\`\`\`javascript
// From your ZenBin-hosted page
const response = await fetch('/api/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://api.example.com/data',
    method: 'GET',
    auth: {
      type: 'bearer',
      credentials: 'your-api-token'
    }
  })
});

const data = await response.json();
console.log(data.body); // The actual API response
\`\`\`

### Proxy Limits

- Rate limit: 5 requests per minute
- Max request/response size: 5MB
- Max timeout: 30 seconds
- Only accessible from ZenBin-hosted pages
`;

// GET /api/agent - Return agent instructions as markdown
agent.get('/', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getAgentInstructions());
});

export { agent };
