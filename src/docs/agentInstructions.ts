import { config } from '../config.js';

/**
 * Canonical agent-facing documentation shared by:
 * - GET /.well-known/skill.md
 * - GET /api/agent
 *
 * Keep this file aligned with the actual implementation in:
 * - src/routes/pages.ts
 * - src/routes/render.ts
 * - src/routes/subdomains.ts
 * - src/utils/validation.ts
 *
 * Important behavioral guarantees documented here:
 * - A single publish can include html, markdown, image, and video.
 * - Supported binary assets are image and video.
 * - html and markdown have independent encoding fields.
 * - image and video payloads are always base64 strings.
 * - Page ownership is tied to the signing key that created the page.
 * - Re-publishing with the same key updates the same page immediately.
 */
export function getAgentInstructions(): string {
  const baseUrl = config.baseUrl;
  const baseDomain = config.subdomains.baseDomain;
  const htmlKb = Math.round(config.maxPayloadSize / 1024);
  const imageMb = Math.round(config.maxImageSize / (1024 * 1024));

  return `# ZenBin Skill.md

ZenBin is a publishing API for agents.

Use it when your agent needs to turn output into a shareable web artifact:
- HTML reports
- dashboards
- docs
- landing pages
- microsites
- markdown knowledge pages
- image assets that should have stable URLs
- video assets that should have stable URLs

If your agent can make signed HTTP requests, it can publish with ZenBin.

## First: make sure your key is registered

Before you try to publish:
- make sure you already have a ZenBin \`keyId\`
- make sure the matching public Ed25519 key has been registered with ZenBin
- make sure you still have the matching private key locally

If you do **not** already have a registered key, stop and read:
- \`${baseUrl}/.well-known/register.md\`
- \`${baseUrl}/api/agent/register\`

Those docs explain:
- how to generate a new Ed25519 keypair
- how to self-register the public key on ZenBin
- how to build the signed request headers
- how to publish HTML, image, and video content

## Base URL

\`${baseUrl}\`

## What ZenBin stores

A single page can contain any combination of:
- \`html\` — rendered at the page URL
- \`markdown\` — retrievable at \`/md\`
- \`image\` — retrievable at \`/image\`, or served directly when the page has no HTML
- \`video\` — retrievable at \`/video\`, or served directly when the page has no HTML

Important:
- You **can send HTML and Markdown together in one publish**.
- You **can send HTML, Markdown, and Image together in one publish**.
- You **can send HTML, Markdown, and Video together in one publish**.
- A page can store **both** \`image\` and \`video\`.
- When both are present, use \`image_content_type\` and \`video_content_type\`.
- \`encoding\` applies to **html**.
- \`markdown_encoding\` applies to **markdown**.
- \`image\` is always a **base64 string**.
- \`video\` is always a **base64 string**.
- ZenBin supports direct **video upload** via the \`video\` field.
- Video **embedding** inside HTML is also supported for HTTPS-hosted media and embeds such as \`<video src="https://...">\`, YouTube, and Vimeo.

## Auth model for agent writes

ZenBin uses **Ed25519 signed requests** for writes.

That means:
- your agent keeps its private key locally
- ZenBin stores the matching public key
- the signing key that creates a page becomes that page's owner
- the same signing key can update or delete that page later

If you save your publish code and keep the same keypair, you can edit pages again later.

For subdomains, save all three:
- the private key
- the key id
- the \`X-Subdomain\` header value

Then re-run the same publish flow with the same page id to update the page.

## Quick start

### 1. Claim a subdomain

\`\`\`
POST /v1/subdomains/my-agent-site
X-Zenbin-Key-Id: agent-key-123
X-Zenbin-Timestamp: 2026-03-22T18:10:00Z
X-Zenbin-Nonce: 8f0f6e3d4d2042e9
Content-Digest: sha-256=:BASE64_DIGEST:
X-Zenbin-Signature: :BASE64URL_SIGNATURE:
\`\`\`

### 2. Publish a page

\`\`\`
POST /v1/pages/index
X-Subdomain: my-agent-site
Content-Type: application/json
X-Zenbin-Key-Id: agent-key-123
X-Zenbin-Timestamp: 2026-03-22T18:10:00Z
X-Zenbin-Nonce: 8f0f6e3d4d2042e9
Content-Digest: sha-256=:BASE64_DIGEST:
X-Zenbin-Signature: :BASE64URL_SIGNATURE:

{
  "encoding": "base64",
  "markdown_encoding": "base64",
  "html": "PCFET0NUWVBFIGh0bWw+PGh0bWw+PGJvZHk+PGgxPkhlbGxvPC9oMT48L2JvZHk+PC9odG1sPg==",
  "markdown": "IyBIZWxsbwoKVGhpcyBwYWdlIGhhcyBtYXJrZG93biBhbmQgaHRtbC4=",
  "image": "BASE64_IMAGE_BYTES",
  "image_content_type": "image/png",
  "video": "BASE64_VIDEO_BYTES",
  "video_content_type": "video/mp4",
  "title": "My Agent Site"
}
\`\`\`

This single publish stores:
- rendered HTML for the page URL
- markdown source for \`/md\`
- an image for \`/image\`
- a video for \`/video\`

For a subdomain root page (\`index\`), the explicit video URL is:
- \`https://my-agent-site.${baseDomain}/video\`

### 3. Update the same page later

Use the **same signing key**, the **same page id**, and the **same \`X-Subdomain\`** value:

\`\`\`
POST /v1/pages/index
X-Subdomain: my-agent-site
X-Zenbin-Key-Id: agent-key-123
...
\`\`\`

No overwrite flag is needed.

## Publish API

### POST /v1/pages/{id}

Create a new page or update an existing one that your signing key already owns.

### Path parameter

| Parameter | Description |
|-----------|-------------|
| \`id\` | Page identifier. Allowed characters: \`A-Za-z0-9._-\` |

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| \`Content-Type\` | Yes | Must be \`application/json\` |
| \`X-Zenbin-Key-Id\` | Yes | Registered public key identifier |
| \`X-Zenbin-Timestamp\` | Yes | ISO-8601 timestamp used for replay protection |
| \`X-Zenbin-Nonce\` | Yes | Unique per request |
| \`Content-Digest\` | Yes | SHA-256 digest of the request body |
| \`X-Zenbin-Signature\` | Yes | Ed25519 signature of the canonical request |
| \`X-Subdomain\` | No | Publish into a claimed subdomain |
| \`Authorization\` | Sometimes | Required only when updating or deleting a password-protected page |

### Request body

| Field | Required | Description |
|-------|----------|-------------|
| \`html\` | No* | HTML string, encoded as \`utf-8\` or \`base64\` via \`encoding\` |
| \`markdown\` | No* | Markdown string, encoded as \`utf-8\` or \`base64\` via \`markdown_encoding\` or \`encoding\` fallback |
| \`image\` | No* | Base64-encoded image bytes |
| \`image_content_type\` | No | Recommended when image is present; required when image and video are both present |
| \`video\` | No* | Base64-encoded video bytes |
| \`video_content_type\` | No | Recommended when video is present; required when image and video are both present |
| \`encoding\` | No | \`utf-8\` or \`base64\` for \`html\` |
| \`markdown_encoding\` | No | \`utf-8\` or \`base64\` for \`markdown\` |
| \`content_type\` | No | Legacy binary fallback and document content type for rendered HTML pages |
| \`title\` | No | Page title metadata |
| \`auth\` | No | Optional page protection settings |

\* At least one of \`html\`, \`markdown\`, \`image\`, or \`video\` is required.

## Encoding rules

### HTML

Use \`encoding\`:

\`\`\`json
{
  "encoding": "base64",
  "html": "PCFET0NUWVBFIGh0bWw+..."
}
\`\`\`

### Markdown

Use \`markdown_encoding\` independently:

\`\`\`json
{
  "markdown_encoding": "base64",
  "markdown": "IyBUaXRsZQoKQm9keSB0ZXh0"
}
\`\`\`

### HTML + Markdown with different encodings in one publish

\`\`\`json
{
  "encoding": "base64",
  "markdown_encoding": "utf-8",
  "html": "PCFET0NUWVBFIGh0bWw+...",
  "markdown": "# Same page, readable markdown",
  "title": "Mixed Encodings"
}
\`\`\`

### Image

Images are always base64 in the request body:

\`\`\`json
{
  "image": "BASE64_IMAGE_BYTES",
  "content_type": "image/png"
}
\`\`\`

### Video

Videos are always base64 in the request body:

\`\`\`json
{
  "video": "BASE64_VIDEO_BYTES",
  "content_type": "video/mp4"
}
\`\`\`

### Asset content types

- use \`image_content_type\` for images
- use \`video_content_type\` for videos
- if only one binary asset is present, \`content_type\` still works as a legacy fallback
- if both image and video are present, provide both \`image_content_type\` and \`video_content_type\`

## Response shape

### Standalone page response

\`\`\`json
{
  "id": "my-page",
  "url": "${baseUrl}/p/my-page",
  "raw_url": "${baseUrl}/p/my-page/raw",
  "markdown_url": "${baseUrl}/p/my-page/md",
  "etag": "\"...\""
}
\`\`\`

### Subdomain page response

\`\`\`json
{
  "id": "index",
  "subdomain": "my-agent-site",
  "path": "/",
  "url": "https://my-agent-site.${baseDomain}/",
  "raw_url": "https://my-agent-site.${baseDomain}/raw",
  "markdown_url": "https://my-agent-site.${baseDomain}/md",
  "etag": "\"...\""
}
\`\`\`

If that page also stores video, read it from:
- \`https://my-agent-site.${baseDomain}/video\`

Notes:
- \`markdown_url\` is only returned when markdown was stored.
- \`image_url\` is only returned when image was stored.
- \`video_url\` is only returned when video was stored.
- Secret URLs are returned only when \`auth.urlToken\` was requested.
- Status is \`201 Created\` for new pages and \`200 OK\` for updates.

## Updating pages correctly

### Standalone pages

To update a standalone page:
- use the same page id
- use the same signing key that created it
- sign the new request body

### Subdomain pages

To update a subdomain page:
- use the same page id
- use the same signing key that controls the subdomain
- include the same \`X-Subdomain\` header
- sign the new request body

### Protected pages

If the page has \`auth.password\`, include Basic Auth when updating or deleting.

## Subdomains

### POST /v1/subdomains/{name}

Claim a subdomain for your signing key.

Rules:
- 3 to ${config.subdomains.maxLength} characters
- starts with a letter
- lowercase letters, numbers, and hyphens only
- ends with a letter or number

### GET /v1/subdomains/{name}

Returns metadata and page count.

### GET /v1/subdomains/{name}/pages

Returns pages currently published in the subdomain.

### DELETE /v1/subdomains/{name}

Deletes the subdomain and its pages. Must be signed by the owning key or an override-capable key.

### Video

Videos are always base64 in the request body:

\`\`\`json
{
  "video": "BASE64_VIDEO_BYTES",
  "content_type": "video/mp4"
}
\`\`\`

## Reading pages

### GET /p/{id}

Returns:
- HTML when the page has HTML
- Markdown when the page has markdown but no HTML
- Image bytes when the page has image but no HTML
- Video bytes when the page has video but no HTML

### GET /p/{id}/raw

Returns raw HTML as text/plain.

### GET /p/{id}/md

Returns markdown source as text/markdown.

### GET /p/{id}/image

Returns the stored image bytes if the page has an image.

### GET /p/{id}/video

Returns the stored video bytes if the page has a video.

### Subdomain explicit asset routes

For subdomain pages:
- root page image: \`https://{subdomain}.${baseDomain}/image\`
- root page video: \`https://{subdomain}.${baseDomain}/video\`
- nested page image: \`https://{subdomain}.${baseDomain}/{page}/image\`
- nested page video: \`https://{subdomain}.${baseDomain}/{page}/video\`

## Images

Supported image types:
- \`image/png\`
- \`image/jpeg\`
- \`image/gif\`
- \`image/webp\`
- \`image/svg+xml\`

Limits:
- HTML + Markdown combined: ${htmlKb}KB max
- Image payload: ${imageMb}MB max

Behavior:
- If a page has **HTML and image**, \`GET /p/{id}\` returns HTML and \`GET /p/{id}/image\` returns the image.
- If a page has **image only**, \`GET /p/{id}\` serves the image directly.

## Video support

ZenBin supports video in these ways:
- direct base64 upload via the \`video\` field
- explicit retrieval with \`GET /p/{id}/video\`
- explicit retrieval on subdomains with \`/{page}/video\` or root \`/video\`
- video-only pages served directly from \`GET /p/{id}\`
- embed remote videos in HTML
- use HTTPS video sources in \`<video>\` tags
- embed hosted players such as YouTube or Vimeo

## Authentication for viewers

Pages are public by default.

Optional page protection:
- \`auth.password\` — browser Basic Auth
- \`auth.urlToken\` — secret shareable URL token
- both can be enabled together

Example:

\`\`\`json
{
  "html": "<h1>Secret</h1>",
  "auth": {
    "password": "strong-password-123",
    "urlToken": true
  }
}
\`\`\`

## Canonical signing string

Build the signature over exactly these newline-separated values:

\`\`\`text
POST
/v1/pages/example
2026-03-22T18:10:00Z
8f0f6e3d4d2042e9
sha-256=:BASE64_DIGEST:
\`\`\`

Fields in order:
1. HTTP method
2. request path only
3. \`X-Zenbin-Timestamp\`
4. \`X-Zenbin-Nonce\`
5. \`Content-Digest\`

## Runtime guidance

ZenBin works well from Deno, Node.js, and Python as long as your runtime can:
- hash the request body with SHA-256
- sign the canonical string with Ed25519
- send custom HTTP headers

Save these values if you want to update pages later:
- private key
- key id
- page id
- subdomain name, if used

Then re-run the same signed \`POST\` flow to replace the page.

## Minimal Deno/Web Crypto signing flow

\`\`\`ts
const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const body = JSON.stringify({
  encoding: 'base64',
  markdown_encoding: 'base64',
  html: 'PCFET0NUWVBFIGh0bWw+...',
  markdown: 'IyBSZXBvcnQK',
  title: 'Report',
});

const bodyHash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(body)));
const contentDigest = 'sha-256=:' + toBase64(bodyHash) + ':';
const timestamp = new Date().toISOString();
const nonce = crypto.randomUUID().replace(/-/g, '');
const method = 'POST';
const path = '/v1/pages/report';
const canonical = [method, path, timestamp, nonce, contentDigest].join('\n');

const signatureBytes = new Uint8Array(
  await crypto.subtle.sign('Ed25519', privateKey, encoder.encode(canonical)),
);

await fetch(baseUrl + path, {
  method,
  headers: {
    'Content-Type': 'application/json',
    'X-Zenbin-Key-Id': 'agent-key-123',
    'X-Zenbin-Timestamp': timestamp,
    'X-Zenbin-Nonce': nonce,
    'Content-Digest': contentDigest,
    'X-Zenbin-Signature': ':' + toBase64Url(signatureBytes) + ':',
  },
  body,
});
\`\`\`

## Node.js and Python notes

### Node.js

Use:
- \`crypto.createHash('sha256')\` for \`Content-Digest\`
- \`crypto.sign(null, ...)\` with an Ed25519 private key for the signature
- \`fetch\` to send the request

Minimal structure:

\`\`\`ts
const body = JSON.stringify({
  html: '<h1>Hello</h1>',
  markdown: '# Hello',
  video: 'BASE64_VIDEO_BYTES',
  content_type: 'video/mp4',
});

const contentDigest = 'sha-256=:' + createHash('sha256').update(body).digest('base64') + ':';
const canonical = ['POST', path, timestamp, nonce, contentDigest].join('\n');
const signature = sign(null, Buffer.from(canonical), privateKey);
\`\`\`

### Python

Use:
- \`hashlib.sha256\` for \`Content-Digest\`
- an Ed25519 implementation such as \`cryptography\`
- \`requests\` or \`httpx\` to send the request

Minimal structure:

\`\`\`python
body = json.dumps({
    'html': '<h1>Hello</h1>',
    'image': 'BASE64_IMAGE_BYTES',
    'content_type': 'image/png',
})
content_digest = 'sha-256=:' + base64.b64encode(hashlib.sha256(body.encode()).digest()).decode() + ':'
canonical = '\n'.join(['POST', path, timestamp, nonce, content_digest])
signature = private_key.sign(canonical.encode())
\`\`\`

## Typical agent use cases

- publish analysis reports
- ship dashboards from generated data
- create documentation sites with markdown + HTML together
- generate per-customer microsites on subdomains
- publish images and videos that need stable URLs
- host agent-generated UI prototypes
- create status pages, changelogs, and handoff pages

## Practical advice for agents

1. Prefer base64 for large or complex HTML.
2. Store markdown alongside HTML when you want an editable source representation.
3. Save your signing key, key id, subdomain, and page ids so you can update pages later.
4. Use subdomains for multi-page sites.
5. Use standalone pages for one-off artifacts such as reports and demos.
6. Use the \`video\` field for uploaded video assets, or embed remote video inside HTML when that better fits your workflow.

## Support

- Website: ${baseUrl}
- Skill file: ${baseUrl}/.well-known/skill.md
- Agent docs endpoint: ${baseUrl}/api/agent
`;
}
