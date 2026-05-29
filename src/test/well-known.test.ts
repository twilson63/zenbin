import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { wellKnown } from '../routes/wellKnown.js';

const app = new Hono();
app.route('/.well-known', wellKnown);

describe('well-known skill docs', () => {
  it('documents the wiki index convention and auto-index workflow', async () => {
    const res = await app.request('/.well-known/skill.md');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/markdown');

    const body = await res.text();
    expect(body).toContain('## Wiki index convention');
    expect(body).toContain('After every successful `POST /v1/pages/{slug}`, update `_wiki`');
    expect(body).toContain('<section data-wiki-entry');
    expect(body).toContain('data-visibility="private"');
  });

  it('documents sign-to-read private page access', async () => {
    const res = await app.request('/.well-known/skill.md');
    const body = await res.text();

    expect(body).toContain('auth.signToRead');
    expect(body).toContain('Signed GET reads use the same CAP/X-Zenbin Ed25519 headers');
    expect(body).toContain('Pages without `auth.signToRead` keep the old behavior');
  });
});
