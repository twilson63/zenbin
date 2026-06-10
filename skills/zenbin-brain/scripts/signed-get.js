#!/usr/bin/env node
// Signed GET helper for ZenBin sign-to-read pages.
// Usage: node signed-get.js <slug-or-url> --subdomain <name> [--format html|md] [--keyfile path] [--json] [--verify]

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DEFAULT_KEYS = path.join(process.env.HOME || '/home/node', '.openclaw/workspace/.zenbin-keys.json');

function parseArgs(argv) {
  const args = { positional: [] };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args.positional.push(arg);
    }
  }
  return args;
}

function usage() {
  console.error('Usage: node signed-get.js <slug-or-url> --subdomain <name> [--format html|md] [--keyfile path] [--json] [--verify]');
  console.error('       ZENBIN_SUBDOMAIN may be used instead of --subdomain for slug inputs.');
}

function loadKeys(keyfile) {
  if (!fs.existsSync(keyfile)) throw new Error(`Key file not found: ${keyfile}`);
  return JSON.parse(fs.readFileSync(keyfile, 'utf8'));
}

// `target` must be the full request target: pathname + query string. The
// server signs path+query, so query parameters must be included here too.
function signGet(target, keys) {
  const timestamp = new Date().toISOString();
  const nonce = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const digest = crypto.createHash('sha256').update('').digest('base64');
  const contentDigest = `sha-256=:${digest}:`;
  const canonical = ['GET', target, timestamp, nonce, contentDigest].join('\n');
  const privateKey = crypto.createPrivateKey({ key: keys.privateJwk, format: 'jwk' });
  const signature = crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey);
  return {
    'X-Zenbin-Key-Id': keys.keyId,
    'X-Zenbin-Timestamp': timestamp,
    'X-Zenbin-Nonce': nonce,
    'Content-Digest': contentDigest,
    'X-Zenbin-Signature': `:${signature.toString('base64url')}:`,
  };
}

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: 'GET',
      headers,
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

function isUrl(input) {
  return input.startsWith('http://') || input.startsWith('https://');
}

function resolveSubdomain(input, args) {
  if (isUrl(input)) return null;
  const subdomain = args.subdomain || process.env.ZENBIN_SUBDOMAIN;
  if (!subdomain) {
    throw new Error('Missing subdomain. Pass --subdomain <name> or set ZENBIN_SUBDOMAIN.');
  }
  return subdomain;
}

function buildUrl(input, subdomain, format) {
  if (isUrl(input)) {
    const u = new URL(input);
    if (format === 'md' && !u.pathname.endsWith('/md')) u.pathname = u.pathname.replace(/\/$/, '') + '/md';
    return u;
  }
  const slug = input.replace(/^\//, '').replace(/\/md$/, '');
  const suffix = format === 'md' ? '/md' : '';
  return new URL(`https://${subdomain}.zenbin.org/${slug}${suffix}`);
}

function authHint(status) {
  if (status === 401) return 'Authentication required or rejected. Check that the request is signed with a registered key and that timestamp/nonce/digest are valid.';
  if (status === 403) return "Your key is not authorized for this page. Check that the key fingerprint matches the page's recipientKeyId.";
  return null;
}

function emitJson(payload) {
  console.log(JSON.stringify(payload, null, 2));
}

async function main() {
  const args = parseArgs(process.argv);
  const input = args.positional[0];
  if (!input || args.help) {
    usage();
    process.exit(input ? 0 : 1);
  }

  const format = args.format || 'html';
  if (!['html', 'md'].includes(format)) throw new Error('--format must be html or md');

  const subdomain = resolveSubdomain(input, args);
  const url = buildUrl(input, subdomain, format);
  const keys = loadKeys(args.keyfile || process.env.ZENBIN_KEYS_PATH || DEFAULT_KEYS);

  if (args.verify) {
    const unsigned = await get(url.toString());
    const signed = await get(url.toString(), signGet(url.pathname + url.search, keys));
    const ok = unsigned.status === 401 && signed.status === 200;
    const result = {
      ok,
      url: url.toString(),
      unsigned: { status: unsigned.status, hint: authHint(unsigned.status) },
      signed: { status: signed.status, hint: authHint(signed.status) },
    };
    if (args.json) emitJson(result);
    else {
      console.log(`${ok ? '✓' : '✗'} private sign-to-read verification ${ok ? 'passed' : 'failed'}`);
      console.log(`unsigned GET: HTTP ${unsigned.status}${result.unsigned.hint ? ` — ${result.unsigned.hint}` : ''}`);
      console.log(`signed GET:   HTTP ${signed.status}${result.signed.hint ? ` — ${result.signed.hint}` : ''}`);
    }
    process.exit(ok ? 0 : 1);
  }

  const res = await get(url.toString(), signGet(url.pathname + url.search, keys));
  if (args.json) {
    emitJson({ status: res.status, url: url.toString(), headers: res.headers, body: res.body, hint: authHint(res.status) });
    process.exit(res.status === 200 ? 0 : 1);
  }

  if (res.status !== 200) {
    console.error(`HTTP ${res.status} ${url}`);
    const hint = authHint(res.status);
    if (hint) console.error(`Hint: ${hint}`);
    if (res.body) console.error(res.body.slice(0, 1000));
    process.exit(1);
  }

  process.stdout.write(res.body);
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
