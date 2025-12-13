import { Hono } from 'hono';
import { config } from '../config.js';

const agent = new Hono();

const getAgentInstructions = () => `# ZenBin API — Agent Instructions

You can publish HTML pages to ZenBin using a simple API. Each page gets a unique URL that can be shared or viewed in a browser.

## Base URL

\`${config.baseUrl}\`

## Publishing a Page

To publish an HTML page, send a POST request:

\`\`\`
POST ${config.baseUrl}/v1/pages/{id}
Content-Type: application/json

{
  "html": "<your HTML content>",
  "title": "Optional page title"
}
\`\`\`

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| \`id\` | Yes | Unique page identifier (URL path). Use only: \`A-Z\`, \`a-z\`, \`0-9\`, \`.\`, \`_\`, \`-\` |
| \`html\` | Yes | The HTML content to publish |
| \`title\` | No | Page title (metadata only) |
| \`encoding\` | No | Set to \`"base64"\` if html is base64-encoded |

### Response

\`\`\`json
{
  "id": "my-page",
  "url": "${config.baseUrl}/p/my-page",
  "raw_url": "${config.baseUrl}/p/my-page/raw",
  "etag": "\"...\""
}
\`\`\`

- \`url\` — The URL where the page can be viewed in a browser
- \`raw_url\` — The URL to fetch the raw HTML

## Example

### Simple HTML page

\`\`\`bash
curl -X POST ${config.baseUrl}/v1/pages/my-demo \\
  -H "Content-Type: application/json" \\
  -d '{"html":"<!DOCTYPE html><html><head><title>Demo</title></head><body><h1>Hello!</h1></body></html>"}'
\`\`\`

### Complete page with styling

\`\`\`bash
curl -X POST ${config.baseUrl}/v1/pages/styled-page \\
  -H "Content-Type: application/json" \\
  -d '{
    "html": "<!DOCTYPE html><html><head><meta charset=utf-8><meta name=viewport content=width=device-width,initial-scale=1><title>My Page</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;line-height:1.6;padding:2rem;max-width:800px;margin:0 auto}</style></head><body><h1>Welcome</h1><p>This is a styled page.</p></body></html>",
    "title": "Styled Page"
  }'
\`\`\`

## Guidelines for Agents

1. **Generate complete HTML documents** — Include \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, and \`<body>\` tags
2. **Include inline styles** — External stylesheets may be blocked by CSP; use \`<style>\` tags or inline styles
3. **Use unique IDs** — Choose descriptive, unique page IDs (e.g., \`report-2024-01-15\`, \`demo-chart-v2\`)
4. **Keep pages self-contained** — All CSS and JS should be inline; external resources may be restricted
5. **Escape JSON properly** — When embedding HTML in JSON, escape quotes and special characters
6. **Use base64 for complex HTML** — If your HTML has many special characters, encode it as base64:

\`\`\`json
{
  "encoding": "base64",
  "html": "PCFET0NUWVBFIGh0bWw+..."
}
\`\`\`

## Limits

- Maximum HTML size: ${Math.round(config.maxPayloadSize / 1024)}KB
- Maximum ID length: ${config.maxIdLength} characters
- Allowed ID characters: \`A-Za-z0-9._-\`

## Viewing Pages

After publishing, users can view the page at:

\`\`\`
${config.baseUrl}/p/{id}
\`\`\`

Or fetch the raw HTML at:

\`\`\`
${config.baseUrl}/p/{id}/raw
\`\`\`
`;

// GET /api/agent - Return agent instructions as markdown
agent.get('/', (c) => {
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(getAgentInstructions());
});

export { agent };
