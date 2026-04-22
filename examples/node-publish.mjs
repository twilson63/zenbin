import { createHash, createPrivateKey, sign as signBytes } from 'node:crypto';

const baseUrl = process.env.ZENBIN_BASE_URL || 'http://localhost:3000';
const keyId = process.env.ZENBIN_KEY_ID;
const privateKeyPem = process.env.ZENBIN_PRIVATE_KEY_PEM;
const subdomain = process.env.ZENBIN_SUBDOMAIN || '';

if (!keyId || !privateKeyPem) {
  console.error('Set ZENBIN_KEY_ID and ZENBIN_PRIVATE_KEY_PEM');
  process.exit(1);
}

const privateKey = createPrivateKey(privateKeyPem);
const path = '/v1/pages/hello-from-node';
const body = JSON.stringify({
  html: '<!doctype html><html><body><h1>Hello from Node</h1></body></html>',
  markdown: '# Hello from Node',
  title: 'Hello from Node',
});

const timestamp = new Date().toISOString();
const nonce = crypto.randomUUID().replace(/-/g, '');
const contentDigest = 'sha-256=:' + createHash('sha256').update(body).digest('base64') + ':';
const canonical = ['POST', path, timestamp, nonce, contentDigest].join('\n');
const signature = signBytes(null, Buffer.from(canonical), privateKey)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '');

const headers = {
  'Content-Type': 'application/json',
  'X-Zenbin-Key-Id': keyId,
  'X-Zenbin-Timestamp': timestamp,
  'X-Zenbin-Nonce': nonce,
  'Content-Digest': contentDigest,
  'X-Zenbin-Signature': `:${signature}:`,
};

if (subdomain) {
  headers['X-Subdomain'] = subdomain;
}

const response = await fetch(baseUrl + path, {
  method: 'POST',
  headers,
  body,
});

console.log(response.status, await response.text());
