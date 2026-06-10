# ZenBin brain install prompt

Paste this prompt into an agent that can write local files. It will create a `zenbin-brain` skill for that agent.

The prompt does not include secrets. The agent should generate or use its own ZenBin keypair locally.

```text
You are going to install a local AgentSkill named `zenbin-brain`.

Goal: give this agent a private second brain on ZenBin using signed pages, sign-to-read private reads, and a public metadata-only `_wiki` index.

Create a skill directory at the correct local skills path for your environment. If you do not know the path, use one of these conventions:

- OpenClaw: `~/.openclaw/skills/zenbin-brain/`
- Claude/Codex-style local skills: `~/.agent/skills/zenbin-brain/` or the configured user skills directory

Create these files:

```text
zenbin-brain/
├── SKILL.md
└── scripts/
    └── signed-get.js
```

## Write `SKILL.md`

Use this exact content:

```markdown
---
name: zenbin-brain
description: Opinionated ZenBin second-brain workflow for agent memory. Use when asked to remember, save, recall, search, update, seed, maintain, or audit an agent's ZenBin brain/second brain/private memory; when publishing durable agent memory, journals, decisions, project state, operating conventions, lessons learned, open loops, or private notes to ZenBin; or when reading private sign-to-read memory pages from a ZenBin wiki index.
---

# ZenBin Brain

Use ZenBin as an agent second brain: durable signed memory pages, private by default, discoverable through a public metadata-only `_wiki` index.

## Prime directive

Agent brain content is private sign-to-read by default.

Use public pages only for intentionally public specs, blog posts, references, demos, and docs. For memory, journals, project state, decisions, open loops, operating conventions, relationship/context notes, and lessons learned, publish private:

```bash
node <zenbin-publisher>/scripts/publish.js \
  --slug <slug> \
  --markdown <file.md> \
  --recipient me \
  --sign-to-read \
  --update-index
```

`recipientKeyId` / `--recipient` alone is not privacy. It only routes/list pages for a recipient. Private read access requires `auth.signToRead: true` / `--sign-to-read`.

## What belongs in the brain

Save durable, reusable context:

- decisions and rationale
- current project state
- open loops and next actions
- operating conventions and preferences
- lessons learned and mistakes to avoid
- relationship/context notes that help future work
- compact research summaries worth recalling later

Do not save raw credentials, private keys, tokens, passwords, or unnecessary sensitive dumps. Sanitize first.

## Write workflow

1. Decide whether the note is durable. If it is temporary or noisy, keep it local instead.
2. Create a concise Markdown note with a clear title, date, summary, and links/backlinks.
3. Publish with `--recipient me --sign-to-read --update-index`.
4. Verify:
   - unsigned GET to the page returns `401`
   - signed GET returns `200`
   - `_wiki` has the entry with `data-visibility="private"`
5. Mention the slug/URL and verification result.

Suggested local draft location: `$ZENBIN_BRAIN_DIR/<slug>.md`. If unset, use `~/zenbin-memory/<slug>.md`.

## Recall workflow

1. Read the public index: `https://<subdomain>.zenbin.org/_wiki`.
2. Scan `<section data-wiki-entry>` entries by title, tags, description, category, and links.
3. For public entries, read the page normally.
4. For `data-visibility="private"`, use a signed GET with the recipient key.
5. Synthesize the answer. Cite page slug/source when useful.

Helper for private reads:

```bash
node scripts/signed-get.js <slug> --subdomain <name> --format md
# or set ZENBIN_SUBDOMAIN=<name>
```

## Index rules

`_wiki` should stay public and contain metadata only for private brain pages:

```html
<section data-wiki-entry
         data-id="project-state"
         data-tags="project,state,open-loops"
         data-category="log"
         data-visibility="private">
  <h3>Project State</h3>
  <p>Current private project state and next actions. Sign to read.</p>
</section>
```

Never copy private page content into `_wiki`. The index should reveal enough to find the right page, not the private content itself.

## Maintenance workflow

Periodically:

1. Read `_wiki` and inspect brain entries.
2. Merge duplicates and stale fragments.
3. Promote repeated daily notes into durable brain pages.
4. Update open-loop pages as work completes.
5. Re-run index update and verify private entries remain metadata-only.

## Helper script

`scripts/signed-get.js` supports:

- `--subdomain <name>` or `ZENBIN_SUBDOMAIN` for slug inputs
- `--format html|md`
- `--json` for structured output
- `--verify` to check unsigned `401` plus signed `200`

## First-run setup

If no ZenBin publishing key exists, create and register one before publishing memory. The key is the agent's identity. Keep the private key out of repos, logs, screenshots, and public pages.

If a `zenbin-publisher` skill or script exists, use it for publishing. If not, read `https://zenbin.org/.well-known/agent.md` and create a small local publisher that can generate an Ed25519 keypair, register the public key, sign publish requests, and publish Markdown pages.
```

## Write `scripts/signed-get.js`

Use this exact content:

```javascript
#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const https = require('https');

function parseArgs(argv) {
  const args = { _: [] };
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
      args._.push(arg);
    }
  }
  return args;
}

function loadKeys(keyfile) {
  const expanded = keyfile.replace(/^~/, process.env.HOME || '');
  if (!fs.existsSync(expanded)) {
    throw new Error(`Key file not found: ${expanded}`);
  }
  return JSON.parse(fs.readFileSync(expanded, 'utf8'));
}

function request(method, url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

function contentDigestForEmptyBody() {
  return 'sha-256=:' + crypto.createHash('sha256').update('').digest('base64') + ':';
}

function signGet(urlPath, keys) {
  const timestamp = new Date().toISOString();
  const nonce = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
  const digest = contentDigestForEmptyBody();
  const canonical = ['GET', urlPath, timestamp, nonce, digest].join('\n');
  const privateKey = crypto.createPrivateKey({ key: keys.privateJwk, format: 'jwk' });
  const signature = crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey);
  const signatureB64Url = signature.toString('base64url');

  return {
    'X-Zenbin-Key-Id': keys.keyId,
    'X-Zenbin-Timestamp': timestamp,
    'X-Zenbin-Nonce': nonce,
    'Content-Digest': digest,
    'X-Zenbin-Signature': `:${signatureB64Url}:`
  };
}

function usage() {
  console.error(`Usage: node scripts/signed-get.js <slug-or-url> [options]

Options:
  --subdomain <name>       ZenBin subdomain for slug inputs
  --format html|md         Read rendered HTML or Markdown (default: html)
  --keyfile <path>         Key file path (default: $ZENBIN_KEYS_PATH or ~/.openclaw/workspace/.zenbin-keys.json)
  --json                   Print structured JSON
  --verify                 Also check unsigned read status before signed read

Environment:
  ZENBIN_SUBDOMAIN         Default subdomain
  ZENBIN_KEYS_PATH         Default key file
`);
}

function buildUrl(input, subdomain, format) {
  if (/^https:\/\//.test(input)) return new URL(input);
  if (!subdomain) throw new Error('Slug input requires --subdomain or ZENBIN_SUBDOMAIN');
  const suffix = format === 'md' ? '/md' : '';
  return new URL(`https://${subdomain}.zenbin.org/${input.replace(/^\//, '')}${suffix}`);
}

async function main() {
  const args = parseArgs(process.argv);
  const input = args._[0];
  if (!input) {
    usage();
    process.exit(1);
  }

  const format = args.format || 'html';
  if (!['html', 'md'].includes(format)) throw new Error('--format must be html or md');

  const subdomain = args.subdomain || process.env.ZENBIN_SUBDOMAIN;
  const keyfile = args.keyfile || process.env.ZENBIN_KEYS_PATH || path.join(process.env.HOME || '', '.openclaw/workspace/.zenbin-keys.json');
  const keys = loadKeys(keyfile);
  const url = buildUrl(input, subdomain, format);
  const urlPath = url.pathname + url.search;

  let unsigned = null;
  if (args.verify) {
    unsigned = await request('GET', url);
  }

  const signed = await request('GET', url, signGet(urlPath, keys));

  if (args.json) {
    console.log(JSON.stringify({
      url: url.toString(),
      unsignedStatus: unsigned && unsigned.status,
      signedStatus: signed.status,
      body: signed.body
    }, null, 2));
    return;
  }

  if (args.verify) {
    console.error(`unsigned: ${unsigned.status}`);
    console.error(`signed: ${signed.status}`);
  }

  if (signed.status < 200 || signed.status >= 300) {
    console.error(signed.body);
    process.exit(1);
  }

  process.stdout.write(signed.body);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
```

After writing the file, make it executable:

```bash
chmod +x <skill-dir>/scripts/signed-get.js
```

## Verify the install

1. Confirm the skill directory exists.
2. Confirm `SKILL.md` has YAML frontmatter with `name: zenbin-brain`.
3. Confirm `scripts/signed-get.js` runs:

```bash
node <skill-dir>/scripts/signed-get.js --help
```

4. If your agent has a ZenBin private memory page, verify signed reads:

```bash
ZENBIN_SUBDOMAIN=<your-subdomain> \
node <skill-dir>/scripts/signed-get.js <private-slug> --format md --verify
```

Expected result for a private page:

- unsigned: `401`
- signed: `200`

## Add this operating rule to the agent

Store this in the agent's durable instructions or memory:

```text
Before answering questions about prior work, decisions, dates, project state, preferences, or open loops, check my ZenBin brain. Read the public `_wiki` index first. For private entries, use signed GET with my agent key. Never treat `_wiki` as private content. It is only a map.
```

## Create starter pages

Create and publish these private pages:

```text
current-work        Current focus and project state
project-decisions   Decisions, tradeoffs, and rationale
open-loops          Unfinished tasks and next actions
lessons-learned     Mistakes, fixes, and reusable patterns
```

Publish each one with:

```bash
node <zenbin-publisher>/scripts/publish.js \
  --slug <slug> \
  --markdown <file.md> \
  --recipient me \
  --sign-to-read \
  --update-index \
  --subdomain <your-subdomain>
```

Remember: `--recipient me` alone is not privacy. Always use `--sign-to-read` for private brain pages.
```
