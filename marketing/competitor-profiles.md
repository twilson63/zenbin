# Competitor Profiles — ZenBin.org

**Generated:** 2026-05-15
**Depth:** Quick scan (key facts + positioning + pricing + SEO summary)
**Product:** ZenBin — Publishing API for AI agents. Ed25519 keypairs, no accounts, cryptographic provenance, TTL pages, Arweave permanence (planned), Stripe billing.

---

## Competitor 1: here.now

### At a Glance

| Metric | Value |
|--------|-------|
| URL | https://here.now |
| Tagline | "Instant web hosting for agents" |
| Founded | 2025 (estimated) |
| Headquarters | Unknown |
| Team size | Small/indie (estimated) |
| Funding | Unknown (likely bootstrapped or seed) |
| Pricing | Free (no paid tier visible) |
| Open source | Skill repo: github.com/heredotnow/skill (MIT) |
| HN traction | Show HN: 2 points |

### Positioning & Messaging

**Primary value proposition:** "The fastest way for agents to publish websites and store files in the cloud."

**Target audience:** AI agent developers and operators using Claude Code, OpenClaw, Cursor, Codex, Amp, or any HTTP-capable agent.

**Positioning angle:** Speed and simplicity — agents publish sites in 3 steps, no account needed for anonymous sites. Multi-file support with Cloudflare edge delivery.

**Key messaging themes:**
- Instant publishing with no account (24hr anonymous tier)
- Multi-file sites (not just single pages)
- Cloud drives for private agent storage
- Agent-native onboarding (skill install, email verification)
- Custom domains and password protection

### Product & Features

**Core capabilities:**
- **Sites** — publish HTML, documents, images, PDFs, videos, and static files to live URLs at `slug.here.now` or custom domains
- **Drives** — private cloud storage for agent files (like Google Drive for agents)
- **Multi-file publishing** — upload entire multi-file sites (HTML + CSS + JS + assets)
- **Incremental deploys** — update individual files without republishing the whole site
- **Password protection** — require authentication before visitors can see content
- **Payment gating** — charge visitors in stablecoins on the Tempo network
- **Custom domains** — bring your own domain
- **Viewer metadata** — title, description, OG images per site
- **TTL** — sites can have time-to-live (anonymous sites expire in 24 hours)

**Notable differentiators:**
- Anonymous publishing with 24hr expiry — no signup required
- Payment gating via stablecoins (crypto-native monetization)
- Multi-file site support (closer to a static hosting platform than a page publisher)
- Cloud Drive concept for private agent storage
- Skill install for OpenClaw, Cursor, Codex, and Hermes integrations
- `/.well-known/skills/here.now` endpoint for agent discovery

**Agent integration:** Skill system (`npx skills add heredotnow/skill --skill here-now -g`), plus direct API for agents that can make HTTP requests.

### Pricing

| Tier | Price | Key Inclusions |
|------|-------|---------------|
| Anonymous | Free | Sites expire after 24 hours, lower limits |
| Free account | Free | Permanent sites, unlimited pages, custom domains |

**Billing:** No paid tier visible. Entirely free.
**Free trial:** N/A — free product.
**Notable:** No SLA, no uptime guarantees, no revenue model visible. VC-subsidized or side project economics unclear.

### Customers & Social Proof

**Named customers:** None visible on homepage.
**Social proof:** "Works with Claude Code, OpenClaw, Cursor, Codex, Amp" — integration claims, not customer testimonials.
**Review ratings:** None found.
**HN traction:** 2 points on Show HN — minimal market awareness.

### Strengths & Weaknesses

**Strengths:**
- Free and frictionless (no account for anonymous)
- Multi-file sites with incremental deploys
- Cloud Drives for private storage (unique feature)
- Custom domains on free tier
- Payment gating for content monetization
- Broad agent compatibility (skill for every major agent framework)

**Weaknesses:**
- No cryptographic identity or content provenance (API keys via email verification)
- No paid tier = no SLA, no sustainability guarantee
- 3-step publish flow (create → upload → finalize) vs. ZenBin's single POST
- Email-based accounts (agents can't check email independently)
- No Markdown support
- No subdomain namespacing for multi-agent setups
- No video size tiers or limits specified
- No Arweave permanence or content verification
- Minimal market awareness (2 HN points)
- No visibility into team, funding, or roadmap

### Competitive Implications for ZenBin

**Where they're strong vs. us:** Multi-file sites, custom domains, cloud drives, payment gating, and zero cost. They're more of a "Netlify for agents" — full static hosting — while ZenBin is a "publishing API for agent output."

**Where we're strong vs. them:** Cryptographic identity (Ed25519 keypairs), single-step publishing, no accounts needed (agents truly autonomous), content provenance and verification, Arweave permanence (planned), TTL control, Stripe billing (fiat, not crypto), Markdown support.

**Opportunities:** here.now's free model is a land grab with no visible revenue. We position on sustainability and provenance: "Free today, gone tomorrow vs. durable by design." Their 3-step flow is clunky for simple publishes. Their email-based accounts are fundamentally wrong for agents (agents can't check email). Their lack of content provenance is a gap that grows as agent identity becomes a real concern (AAuth, Ratify, IETF drafts all converging on this).

**Threats:** If here.now adds cryptographic signing or paid tiers, they could narrow the differentiation. Their multi-file support and custom domains are genuinely useful features we should consider. Their Cloud Drive concept is novel and addresses a real need (agent file storage).

---

## Competitor 2: AgentLair

### At a Glance

| Metric | Value |
|--------|-------|
| URL | Unknown (HN discussion reference) |
| Tagline | Agent hosting/authentication platform (inferred from context) |
| Founded | Unknown |
| Headquarters | Unknown |
| Team size | Unknown |
| Funding | Unknown |
| Pricing | Unknown |
| Traction | Mentioned in HN discussions on agent identity/auth |

### Positioning & Messaging

**Note:** AgentLair appeared in HN discussions about agent identity and authentication. No live product site was found at the time of profiling. This profile is based on community discussion context only.

**Inferred positioning:** Agent hosting platform with focus on agent authentication and identity.

**Key messaging themes (inferred):**
- Agent identity management
- Agent authentication for production deployments
- Secure agent operations

### Product & Features

**Inferred capabilities:**
- Agent identity and authentication services
- Agent hosting infrastructure

**Note:** Without a live product site, detailed feature analysis is not possible.

### Pricing

Unknown — no pricing page found.

### Strengths & Weaknesses

**Strengths:**
- Mentioned in active HN conversations about agent identity (validates the market need)
- Early mover in agent identity/auth space

**Weaknesses:**
- No visible product (as of research date)
- No website, documentation, or public-facing materials found
- Cannot verify claims or assess competitive positioning

### Competitive Implications for ZenBin

**Where they're strong vs. us:** Unknown — insufficient data.

**Where we're strong vs. them:** We have a live product with cryptographic identity (Ed25519), published API, and agent discovery (`/.well-known/agent.md`). AgentLair appears to be pre-product or stealth.

**Opportunities:** Monitor for launch. Agent identity is converging rapidly (AAuth, IETF, Ratify, AI Agent Passport) — if AgentLair launches with a competing auth model, we need to reassess.

**Threats:** Low currently. May become relevant if they ship a complete agent hosting + identity platform.

**Status:** 🟡 Watch — no actionable competitive intelligence yet. Revisit if product surfaces.

---

## Competitor 3: Samma Suit

### At a Glance

| Metric | Value |
|--------|-------|
| URL | https://www.samma.it (Cloudflare-protected, content inaccessible) |
| Tagline | Agent auth/security platform (inferred from context) |
| Founded | Unknown |
| Headquarters | Unknown (Italian TLD suggests Italy-based) |
| Team size | Unknown |
| Funding | Unknown |
| Pricing | Unknown |

### Positioning & Messaging

**Note:** Samma Suit was mentioned alongside AgentLair in HN conversations about agent authentication and security. The website (samma.it) is behind Cloudflare bot protection and could not be scraped for content. This profile is based on community context only.

**Inferred positioning:** Agent authentication and security — likely focused on agent identity verification and secure agent operations.

**Key messaging themes (inferred):**
- Agent authentication
- Agent security for production deployments
- Possibly aligned with emerging agent identity standards (AAuth, WIMSE)

### Product & Features

**Inferred capabilities:**
- Agent authentication/security services
- Possible alignment with IETF agent auth drafts

**Note:** Website inaccessible due to Cloudflare protection. Cannot verify product details.

### Pricing

Unknown — website inaccessible.

### Strengths & Weaknesses

**Strengths:**
- Appearing in agent identity conversations (validates market need)
- Italian/European base could appeal to EU market (GDPR compliance angle)

**Weaknesses:**
- No accessible product documentation
- Cloudflare bot protection suggests early stage or defensive posture
- Unknown market position

### Competitive Implications for ZenBin

**Where they're strong vs. us:** Unknown — insufficient data. Potential EU/GDPR angle.

**Where we're strong vs. them:** Live product, published API, cryptographic identity with Ed25519, agent discovery protocol, content provenance. We're shipping while they may still be building.

**Opportunities:** Potential partnership rather than competition — if Samma Suit focuses on agent auth/security, they complement rather than compete with our publishing layer. The agent identity stack needs both auth (who is this agent?) and output attribution (what did this agent produce?).

**Threats:** Low currently. If they expand into publishing, reassess.

**Status:** 🟡 Watch — monitor for product launch. Consider partnership outreach if they focus purely on auth.

---

## Competitor 4: Postiz

### At a Glance

| Metric | Value |
|--------|-------|
| URL | https://postiz.com |
| Tagline | "The All-in-One agentic social media scheduling tool" |
| Founded | Unknown |
| Headquarters | Unknown |
| Team size | Small team (indie/small company) |
| Funding | Unknown |
| Pricing | $29–$99/mo |
| Open source | Yes (28K+ GitHub stars) |
| Platforms | 32 social media platforms |

### Positioning & Messaging

**Primary value proposition:** "Plan, generate, and schedule posts automatically to 30+ social media networks — then review and edit everything in a visual calendar."

**Target audience:** Content creators, small brands, businesses, and agencies who want to automate social media posting. Also targets AI agents (Claude, ChatGPT, Codex, OpenClaw) for agentic scheduling.

**Positioning angle:** All-in-one social media management with AI agent integration. Self-hosted option available.

**Key messaging themes:**
- Agentic scheduling — agents drive Postiz through CLI and MCP server
- 30+ social media platforms supported
- Self-hosted (no monthly fees) or cloud platform
- Open-source (28K+ GitHub stars — strong community signal)
- Visual calendar for scheduling and review
- AI copilot for content generation
- Cross-posting across platforms

### Product & Features

**Core capabilities:**
- **Social media scheduling** — plan, generate, and schedule posts across 30+ platforms
- **AI Agent integration** — prompt from Claude, ChatGPT, Codex, or OpenClaw; they drive Postiz through CLI and MCP server
- **Cross-posting** — publish to multiple platforms simultaneously
- **AI content assistant** — generate and refine social media posts
- **AI image generation** — Canva-like editor + AI image generation
- **Team collaboration** — team management, customer groups, delegation
- **Analytics** — comprehensive performance tracking
- **Auto-actions** — auto-post, auto-like, auto-comment at milestones
- **RSS auto-post** — automated content from RSS feeds
- **Public API** — OAuth2, SDK, public API for developer integration
- **n8n / Make.com / Zapier** — automation platform integrations
- **OpenClaw / Hermes / Claude Code** — agent integrations via MCP server

**Notable differentiators:**
- 28K+ GitHub stars — significant open-source community
- Self-hosted option (free, no monthly fees)
- 32 platform support including YouTube, TikTok, X/Twitter, LinkedIn, Reddit, Discord, Slack, Instagram, Facebook, Medium, Dev.to, Hashnode, WordPress, Pinterest
- Agent-native integration (MCP server, CLI)
- `/.well-known/agent.md` implementation (same pattern as ZenBin)
- Video upload support (YouTube, TikTok)

**Agent integration:** MCP server, OpenClaw skill, Claude Code plugin, ChatGPT integration, Codex plugin, public API with OAuth2.

### Pricing

| Tier | Price | Key Inclusions |
|------|-------|---------------|
| Standard | $29/mo | 5 channels, 400 posts/mo, AI copilot, 3 AI videos/mo, API |
| Team | $39/mo | 10 channels, unlimited posts, unlimited members, 10 AI videos/mo |
| Pro | $49/mo | 30 channels, unlimited posts, unlimited members, 300 AI images/mo |
| Ultimate | $99/mo | 100 channels, unlimited posts, unlimited members, 500 AI images/mo |
| Self-hosted | Free (setup cost) | All features, self-hosted on your infrastructure |

**Billing:** Monthly, no annual discount visible.
**Notable:** Channel-based pricing (not user-based). Self-hosted option is genuinely free. Open-source with MIT license.

### Customers & Social Proof

**Named customers:** None prominent on homepage.
**Social proof:** 28K+ GitHub stars, testimonials from users on X/Twitter and G2, n8n integration tutorial.
**Review ratings:** G2 reviews present (positive sentiment about ease of use and time-saving).
**Key testimonial themes:** Easy setup, time-saving, multi-platform scheduling, cost-effective vs. competitors.

### Strengths & Weaknesses

**Strengths:**
- Massive open-source community (28K+ GitHub stars)
- Self-hosted option eliminates recurring costs
- 32 platform support — broadest in category
- Agent-native integration (MCP, CLI, OpenClaw, Claude)
- `/.well-known/agent.md` — aligned with agent discovery pattern
- Established product with real users and reviews
- Visual calendar UI — polished UX for human operators
- AI content generation built-in

**Weaknesses:**
- Fundamentally a social media tool, not a publishing platform — outputs go to social platforms, not to standalone URLs
- No cryptographic identity or content provenance
- No subdomain/page hosting — agents schedule posts, they don't publish content
- No permanence guarantees (depends on social platforms)
- Agent integration is about scheduling existing content, not about agents creating and publishing original content
- Pricing is social-media-oriented ($29–99/mo based on channels), not agent-oriented
- No TTL, no versioning, no content verification

### Competitive Implications for ZenBin

**Where they're strong vs. us:** Social media distribution breadth (32 platforms), open-source community (28K stars), self-hosted option, visual calendar UX, established user base.

**Where we're strong vs. them:** We're fundamentally different products. Postiz distributes content to social platforms; ZenBin publishes content to the open web. Postiz doesn't host pages, verify provenance, or give agents a web presence. Different problems, different solutions.

**Opportunities:** Partnership opportunity — Postiz is for social distribution, ZenBin is for web publishing. An agent could publish a report to ZenBin and then schedule social posts about it via Postiz. We're complementary, not competitive.

**Threats:** Low direct threat. Postiz could add web page hosting, but their architecture is social scheduling, not web publishing. The `/.well-known/agent.md` alignment suggests they understand the agent ecosystem — they could become a distribution partner.

**Status:** 🟢 Adjacent — not a direct competitor. Consider integration/partnership.

---

## Summary: Competitive Landscape

### Comparison Table

| Dimension | **ZenBin** | **here.now** | **AgentLair** | **Samma Suit** | **Postiz** |
|-----------|-----------|--------------|----------------|----------------|------------|
| **Category** | Agent publishing API | Agent web hosting | Agent auth (pre-product) | Agent security (stealth) | Social media scheduling |
| **Live product** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Agent identity** | Ed25519 keypairs | API key (email) | Unknown | Unknown | OAuth2 |
| **No accounts needed** | ✅ Self-register keypairs | ❌ Email verification | Unknown | Unknown | ❌ OAuth flow |
| **Content provenance** | ✅ Cryptographic signing | ❌ | Unknown | Unknown | ❌ |
| **Single-step publish** | ✅ One signed POST | ❌ 3-step flow | N/A | N/A | N/A (scheduling) |
| **Markdown support** | ✅ | ❌ | Unknown | Unknown | ❌ |
| **Video support** | ✅ (50MB–∞) | ✅ | Unknown | Unknown | ✅ (YouTube, TikTok) |
| **TTL / expiry** | ✅ (1hr–∞) | ✅ (24hr anon) | Unknown | Unknown | ❌ |
| **Permanence** | Arweave (planned) | Cloudflare edge | Unknown | Unknown | Depends on platform |
| **Custom domains** | Enterprise tier | ✅ Free tier | Unknown | Unknown | ❌ (posts to platforms) |
| **Multi-file sites** | ❌ (single pages) | ✅ | Unknown | Unknown | N/A |
| **Subdomain namespacing** | ✅ Per-agent subdomains | ✅ Per-site subdomains | Unknown | Unknown | N/A |
| **Pricing** | Free / $4.99 / $14.99 | Free | Unknown | Unknown | $29–99/mo |
| **Open source** | Skill open, core closed | Skill open (MIT) | Unknown | Unknown | ✅ (28K stars) |
| **Agent discovery** | `/.well-known/agent.md` | Skill install | Unknown | Unknown | `/.well-known/agent.md` |

### Key Takeaways

1. **No direct competitors in agent output publishing.** here.now is the closest (web hosting for agents), but they're a static hosting platform, not a publishing API with identity. Postiz is social distribution, not web publishing. AgentLair and Samma Suit are pre-product or stealth.

2. **here.now is the primary comparison target.** They're live, free, and address the same basic need (agents publishing to the web). But their identity model (email-verified API keys) and lack of provenance leave a clear differentiation wedge.

3. **The identity gap is widening.** The agent identity space (AAuth, IETF, Ratify, AI Agent Passport) is converging on cryptographic agent identity. ZenBin's Ed25519 keypairs are aligned with this trend; here.now's email API keys are not.

4. **Postiz is a partnership opportunity, not a threat.** They do social distribution (posting to 32 platforms); we do web publishing (creating standalone content). An agent could publish to ZenBin and schedule posts via Postiz.

5. **The output layer is still unclaimed.** The entire industry is focused on input (MCP), identity (AAuth/IETF), and transport (Durable Sessions). Nobody is building dedicated output/publishing infrastructure for agents. This is ZenBin's category to define.

---

*Profiles generated 2026-05-15. Revisit quarterly or when competitors ship significant updates.*