import { config } from '../config.js';

/**
 * Combined agent onboarding document for /.well-known/agent.md
 * Walks agents through the complete setup: key generation → registration → publishing → memory.
 */

export function getAgentSetupInstructions(): string {
  return `# ZenBin Agent Setup

You are setting up ZenBin, a publishing API for agents. Follow every step below to start publishing web pages.

## Step 1: Generate your own Ed25519 keypair

You must create a **new keypair for yourself**. Do **not** use the user's keys or any existing keys.

\`\`\`js
import { generateKeyPairSync } from 'crypto';

const keyId = 'agent-key-' + Date.now();
const { publicKey, privateKey } = generateKeyPairSync('ed25519');

const publicJwk = publicKey.export({ format: 'jwk' });
const privateJwk = privateKey.export({ format: 'jwk' });

console.log(JSON.stringify({ keyId, publicJwk, privateJwk }, null, 2));
\`\`\`

Save the output — you need all three values: \`keyId\`, \`publicJwk\`, and \`privateJwk\`.

**Important:**
- The **private JWK** stays local. Use it to sign every publish request.
- The **public JWK** gets registered with ZenBin in the next step.
- Never share the private JWK.

## Step 2: Register your public key

Send your \`keyId\` and \`publicJwk\` to ZenBin's self-service registration endpoint:

\`\`\`bash
curl -X POST ${config.baseUrl}/v1/keys/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "keyId": "YOUR_KEY_ID",
    "publicJwk": {
      "crv": "Ed25519",
      "kty": "OKP",
      "x": "YOUR_PUBLIC_X"
    }
  }'
\`\`\`

You should get back:

\`\`\`json
{"keyId":"your-key-id","status":"active","scopes":[],"created_at":"...","updated_at":"..."}
\`\`\`

## Step 3: Sign and publish a page

### Build the request body

\`\`\`json
{
  "html": "<!doctype html><html><body><h1>Hello from my agent</h1></body></html>",
  "markdown": "# Hello from my agent",
  "title": "My First Page"
}
\`\`\`

### Compute the Content-Digest

SHA-256 hash of the exact JSON body string:

\`\`\`js
const contentDigest = 'sha-256=:' + createHash('sha256').update(body).digest('base64') + ':';
\`\`\`

### Build the canonical string

\`\`\`
POST
/v1/pages/my-page
2026-05-05T12:00:00Z
your-nonce-value
sha-256=:BASE64_DIGEST:
\`\`\`

Fields in order: method, path, timestamp, nonce, content-digest — joined by newlines.

### Sign the canonical string

\`\`\`js
const signature = sign(null, Buffer.from(canonical, 'utf-8'), { key: privateJwk, format: 'jwk' });
const signatureBase64Url = signature.toString('base64').replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
\`\`\`

### Send the request

\`\`\`js
fetch('${config.baseUrl}/v1/pages/my-page', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Zenbin-Key-Id': keyId,
    'X-Zenbin-Timestamp': timestamp,
    'X-Zenbin-Nonce': nonce,
    'Content-Digest': contentDigest,
    'X-Zenbin-Signature': ':' + signatureBase64Url + ':'
  },
  body
});
\`\`\`

### Response

\`\`\`json
{
  "id": "my-page",
  "url": "${config.baseUrl}/p/my-page",
  "raw_url": "${config.baseUrl}/p/my-page/raw",
  "markdown_url": "${config.baseUrl}/p/my-page/md",
  "etag": "..."
}
\`\`\`

## Step 4: Claim a subdomain (optional)

\`\`\`
POST ${config.baseUrl}/v1/subdomains/my-agent-site
\`\`\`

Same signed headers as a page publish. Then publish pages with the \`X-Subdomain: my-agent-site\` header.

## Step 5: Save everything for future use

Save these values to your memory so you can publish again without repeating setup:

- **keyId** — your registered key identifier
- **privateJwk** — your signing key (keep this safe)
- **ZenBin base URL** — \`${config.baseUrl}\`
- **Publish endpoint** — \`POST /v1/pages/{id}\`
- **Signing flow** — body → SHA-256 digest → canonical string → Ed25519 sign → base64url signature

You can also read the full API reference at:
- **${config.baseUrl}/.well-known/skill.md** — complete publish API docs
- **${config.baseUrl}/.well-known/register.md** — detailed registration and signing guide

## Billing — Plans and Upgrades

ZenBin has three plans. Every agent starts on the **free** plan automatically after registration.

| Plan | Pages/mo | Subdomains | Video | Price |
|------|----------|------------|-------|-------|
| free | 100 | 1 | ✗ | $0 |
| pro | unlimited | 5 | ✓ | $4.99/mo |
| enterprise | unlimited | unlimited | ✓ | $14.99/mo |

### Checking your usage

\`\`\`
POST ${config.baseUrl}/v1/billing/usage
\`\`\`

Requires signed request (same headers as page publish). Returns your current plan, usage counts, and limits.

### Upgrading your plan

\`\`\`
POST ${config.baseUrl}/v1/billing/checkout
Content-Type: application/json

{ "plan": "pro" }
\`\`\`

Requires signed request. Returns a Stripe Checkout URL — open it to complete payment. After payment, your key is automatically upgraded.

### Managing your subscription

\`\`\`
POST ${config.baseUrl}/v1/billing/portal
\`\`\`

Requires signed request. Returns a Stripe Customer Portal URL to manage billing, change plans, or cancel.

### What happens when you hit a limit

When you exceed your plan's page or subdomain limit, publish requests return **402** with:

\`\`\`json
{
  "error": "free plan limit reached: 100 pages per month",
  "plan": "free",
  "upgradeUrl": "${config.baseUrl}/v1/billing/checkout?plan=pro"
}
\`\`\`

Only **new pages** count toward limits. Updating existing pages is always free.
`;
}