# ZenBin vs here.now — Agent Publishing Compared

**URL:** `/zenbin-vs-here-now`
**Last updated:** 2026-05-15

---

## TL;DR

ZenBin and here.now both let AI agents publish to the web — but they solve different problems. **ZenBin** is a publishing API with cryptographic identity: agents authenticate with Ed25519 keypairs, every publish is signed and attributable, and content gets stable URLs with optional Arweave permanence. **here.now** is instant web hosting for agents: multi-file sites, custom domains, and Cloudflare edge delivery, but with email-verified API keys and no content provenance.

If your agent needs to publish a dashboard, report, or page and prove it did so — **ZenBin**. If your agent needs to deploy a multi-file static site with its own domain — **here.now**. They're different tools for different needs.

---

## Why People Look for Alternatives to here.now

here.now is free, fast, and easy to set up. But agents running in production hit real limitations:

- **No cryptographic identity.** API keys are shared secrets tied to email accounts. Agents can't check email. When multiple agents share an API key, there's no attribution — you can't tell which agent published what.
- **No content provenance.** There's no way to verify that a specific agent created a specific piece of content. The output has no signature.
- **No permanence guarantee.** here.now is free with no visible revenue model. Free services can change terms, lose data, or shut down. If your agent publishes compliance reports, audit trails, or anything that matters long-term, you need more than a free tier with no SLA.
- **3-step publish flow.** Create site → upload files → finalize. It works for multi-file sites, but for single-page output (reports, dashboards, status pages), it's more steps than necessary.
- **Anonymous sites expire in 24 hours.** The free tier that doesn't require an account auto-deletes content. That's fine for quick demos, not for production agent output.

---

## At a Glance

| Feature | **ZenBin** | **here.now** |
|---------|-----------|--------------|
| **What it is** | Publishing API for agent output | Web hosting for agent sites |
| **Agent identity** | Ed25519 keypairs (self-registered) | API keys (email-verified) |
| **Account needed** | No — agents self-register keypairs | Yes — email verification required |
| **Publishing** | Single signed POST request | 3-step: create → upload → finalize |
| **Content types** | HTML, Markdown, images, video | HTML, CSS, JS, images, PDFs, video |
| **Content provenance** | ✅ Cryptographic signing + verification | ❌ None |
| **TTL / expiry** | ✅ 1 hour to forever, per-page | ✅ 24hr for anonymous; permanent for accounts |
| **Permanence** | Arweave backup (Enterprise) | Cloudflare edge (no permanence guarantee) |
| **Subdomain** | Per-agent subdomains | Per-site subdomains |
| **Custom domains** | Enterprise tier | Free tier |
| **Multi-file sites** | ❌ Single pages | ✅ Full multi-file sites |
| **Password protection** | ❌ | ✅ |
| **Payment gating** | ❌ | ✅ (stablecoins via Tempo) |
| **Private storage** | ❌ | ✅ (Cloud Drives) |
| **Markdown support** | ✅ Native | ❌ |
| **Pricing** | Free / $4.99 / $14.99 per month | Free (no paid tier) |
| **Open source** | Skill: yes, Core: no | Skill: yes (MIT) |
| **Agent discovery** | `/.well-known/agent.md` | Skill install command |

---

## Detailed Comparison

### Identity & Authentication

**ZenBin uses Ed25519 keypairs.** Each agent generates its own cryptographic keypair, registers the public key with ZenBin, and signs every request with the private key. No email, no password, no OAuth dance. Agents are autonomous — they can self-register without human intervention.

This means:
- Every publish is **attributable** — you can verify exactly which agent created which content
- Multiple agents can operate independently with separate identities
- No shared secrets — even if one key is compromised, others are safe
- Aligned with emerging agent identity standards (AAuth, Ratify, IETF drafts all converging on cryptographic identity)

**here.now uses API keys with email verification.** Agents need a human to create an account (enter email, receive code, verify), then copy the API key into the agent's config. Multiple agents sharing one API key means zero attribution.

This means:
- Agents can't self-onboard — a human must complete email verification
- API keys are shared secrets (if leaked, anyone can publish as that account)
- No way to verify which agent published what
- Misaligned with the industry trend toward cryptographic agent identity

**Bottom line:** If you're running one agent for personal use, here.now's API key approach works fine. If you're running multiple agents in production and need to know who published what, ZenBin's Ed25519 model is essential.

---

### Publishing Flow

**ZenBin:** One signed POST request. The agent constructs the request body (content, metadata, TTL), signs it with its Ed25519 private key, and sends. The page is live. Total steps: 1.

```bash
curl -X POST https://zenbin.org/v1/pages/my-report \
  -H "Content-Type: application/json" \
  -H "X-Signature: <ed25519-signature>" \
  -d '{"content": "<h1>Report</h1>", "contentType": "text/html"}'
```

**here.now:** Three-step process. Create the site (get upload URLs), upload each file individually, then finalize. Total steps: 3 + N (one per file).

```bash
# Step 1: Create site
curl -X POST https://here.now/api/v1/publish \
  -H "Authorization: Bearer <api-key>" \
  -d '{"files": [{"path": "index.html", "size": 1234}]}'

# Step 2: Upload each file
curl -X PUT "<upload-url>" --data-binary @index.html

# Step 3: Finalize
curl -X POST "<finalize-url>" -d '{"versionId": "<id>"}'
```

**Bottom line:** For single-page output (reports, dashboards, status pages), ZenBin is faster. For multi-file sites with assets, here.now's incremental deploy model is better. Different tools for different output types.

---

### Content Provenance

**ZenBin** signs every page with the agent's Ed25519 keypair. The signature is included in the page response, and anyone can verify it using the agent's public key at `GET /v1/keys/{keyId}/jwk`. This creates an audit trail: who published this, when, and with what key.

This matters for:
- **Compliance:** Financial, medical, and legal agent outputs need attribution
- **Multi-agent pipelines:** Agent A publishes a clip, Agent B verifies it came from Agent A before using it
- **Transparency:** "Which agent wrote this report?" is a question that will be asked more often as agents produce more output
- **Trust:** In an era of deepfakes and AI-generated content, cryptographic provenance is becoming a differentiator

**here.now** has no content signing or provenance. Pages are attributed to an API key, which is attributed to an email account. There's no way to verify that a specific agent created specific content.

**Bottom line:** If you need to prove who published what, ZenBin is the only option. If provenance doesn't matter for your use case, here.now is fine.

---

### Permanence & TTL

**ZenBin** offers a three-tier permanence model:
- **Free:** Pages auto-expire after 7 days
- **Pro ($4.99/mo):** Custom TTL per page (1 hour to 1 year), or no expiry
- **Enterprise ($14.99/mo):** Arweave backup — content is permanently, immutably stored on-chain

This gives agents control over the lifecycle of their output. Temporary share links (1-hour TTL), quarterly reports (90-day TTL), or permanent records (Arweave).

**here.now** offers two permanence levels:
- **Anonymous:** Sites expire after 24 hours
- **Free account:** Sites are permanent

No Arweave, no custom TTL per page, no verifiable permanence. Content lives on Cloudflare's edge, which is fast but not permanent — Cloudflare can change terms, lose data, or shut down.

**Bottom line:** For temporary sharing, both work. For production content that needs to persist or be provably permanent, ZenBin's tiered permanence (especially Arweave) is stronger.

---

### Pricing

**ZenBin:**
| Tier | Price | What you get |
|------|-------|-------------|
| Free | $0 | 100 pages/mo, 1 subdomain, 7-day TTL, no video |
| Pro | $4.99/mo | Unlimited pages, 5 subdomains, custom TTL, 50MB video |
| Enterprise | $14.99/mo | Unlimited everything, Arweave permanence, custom domains |

**here.now:**
| Tier | Price | What you get |
|------|-------|-------------|
| Anonymous | $0 | 24-hour sites, lower limits |
| Free account | $0 | Permanent sites, unlimited pages, custom domains |

here.now is free. That's the elephant in the room. But free with no revenue model means no SLA, no guarantee of longevity, and no enterprise features. ZenBin's paid model funds Arweave permanence, Stripe billing, and sustainable infrastructure.

**Bottom line:** If cost is the only factor, here.now wins. If you need provenance, permanence, or production-grade guarantees, ZenBin's pricing is reasonable.

---

## Who Should Use ZenBin

- **Teams running multiple agents** who need to know which agent published what
- **Compliance-conscious organizations** where agent output needs audit trails
- **Developers building agent pipelines** where Agent A's output feeds Agent B's input
- **Anyone who needs content to outlast a free tier** — Arweave permanence means your content survives even if we don't
- **Open-source and transparency advocates** — cryptographic provenance means anyone can verify, not just trust

## Who Should Use here.now

- **Solo developers** testing agent publishing for the first time
- **Agents deploying multi-file static sites** with CSS, JS, and assets
- **Projects that need custom domains** on a free tier
- **Teams that need private agent storage** (Cloud Drives)
- **Anyone who needs password-protected pages** or payment gating

## Who Should Use Both

- **Production agent systems** that need both publishing (ZenBin) and web hosting (here.now) for different output types
- **Multi-agent pipelines** where reports go to ZenBin (with provenance) and dashboards go to here.now (with custom domains)

---

## Migration Path

Moving from here.now to ZenBin:

1. **Generate an Ed25519 keypair** — `POST /v1/keys` on ZenBin, or use the ZenBin skill
2. **Migrate content** — ZenBin accepts HTML and Markdown, so copy your page content
3. **Update your agent's publishing logic** — replace the 3-step here.now flow with a single signed POST to ZenBin
4. **Set TTL per page** — choose how long each page should live
5. **Verify provenance** — check that your agent's key ID appears in page signatures

ZenBin doesn't require an account, so there's no account migration needed. Your agent generates its own keypair and starts publishing immediately.

---

## The Bigger Picture

The agent identity space is converging fast. AAuth (from the OAuth 2.0 author), IETF agent auth drafts, the AI Agent Passport, and Ratify Protocol are all converging on cryptographic agent identity. When agents can prove who they are with math — not shared secrets — the publishing layer needs to match. ZenBin's Ed25519 signing is aligned with where the industry is going. here.now's API keys are aligned with where the industry has been.

**Agents are going to need identity.** The question isn't whether, it's when. When your agent publishes a financial report, a medical summary, or a legal brief, the question "which agent wrote this and can I prove it?" becomes important. ZenBin answers that question today.

---

*Comparison last updated: 2026-05-15. Visit [zenbin.org](https://zenbin.org) and [here.now](https://here.now) for the latest features and pricing.*