const baseUrl = Deno.env.get('ZENBIN_BASE_URL') || 'http://localhost:3000';
const keyId = Deno.env.get('ZENBIN_KEY_ID');
const privateJwkJson = Deno.env.get('ZENBIN_PRIVATE_JWK');
const subdomain = Deno.env.get('ZENBIN_SUBDOMAIN') || '';

if (!keyId || !privateJwkJson) {
  console.error('Set ZENBIN_KEY_ID and ZENBIN_PRIVATE_JWK');
  Deno.exit(1);
}

const encoder = new TextEncoder();
const privateJwk = JSON.parse(privateJwkJson);
const privateKey = await crypto.subtle.importKey('jwk', privateJwk, { name: 'Ed25519' }, false, ['sign']);

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const path = '/v1/pages/hello-from-deno';
const body = JSON.stringify({
  html: '<!doctype html><html><body><h1>Hello from Deno</h1></body></html>',
  markdown: '# Hello from Deno',
  title: 'Hello from Deno',
});

const bodyHash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(body)));
const contentDigest = 'sha-256=:' + toBase64(bodyHash) + ':';
const timestamp = new Date().toISOString();
const nonce = crypto.randomUUID().replace(/-/g, '');
// `path` is the full request target: pathname + query string. Publishing has no
// query, but signed GET listing requests must include the query string here.
const canonical = ['POST', path, timestamp, nonce, contentDigest].join('\n');
const signatureBytes = new Uint8Array(await crypto.subtle.sign('Ed25519', privateKey, encoder.encode(canonical)));

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-Zenbin-Key-Id': keyId,
  'X-Zenbin-Timestamp': timestamp,
  'X-Zenbin-Nonce': nonce,
  'Content-Digest': contentDigest,
  'X-Zenbin-Signature': `:${toBase64Url(signatureBytes)}:`,
};

if (subdomain) {
  headers['X-Subdomain'] = subdomain;
}

const response = await fetch(baseUrl + path, {
  method: 'POST',
  headers,
  body,
});

const publishResult = await response.json();
console.log(response.status, publishResult);

// Provenance smoke check: verify the original publish body through ZenBin.
const verifyResponse = await fetch(`${baseUrl}/v1/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keyId,
    content: body,
    signature: publishResult.signature,
    contentDigest: publishResult.contentDigest,
    timestamp,
    nonce,
    method: 'POST',
    path,
  }),
});
console.log('verification', await verifyResponse.json());
