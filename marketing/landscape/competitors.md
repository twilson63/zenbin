# Competitors & Adjacent Projects

## Direct Competitors (Agent Publishing/Hosting)

### AccessAgent.ai ⚠️ DIRECT COMPETITOR

- **URL:** accessagent.ai
- **What:** "Web Hosting for AI Agents" — the most direct competitor to ZenBin found so far
- **Key features:**
  - No accounts, no API keys — uses Ethereum wallet signatures (personal_sign) for auth
  - Agent generates local Ethereum keypair, signs requests like `SimpleHosting:Create:my-site:timestamp`
  - Server recovers signer address from signature — records as site owner
  - Replay-proof (5-minute timestamp window)
  - Upload zip, get live URL instantly (your-site.accessagent.ai)
  - Custom domains, stats dashboard, update/delete via API
  - Full REST API with agent-readable guide at /api/guide
  - 300 prompt ideas for Claude Code / ChatGPT / Cursor / Windsurf
  - Multi-file sites (HTML, JS, CSS, images, audio, fonts)
- **Auth model:** Ethereum wallet signatures (personal_sign). Agent creates wallet locally, signs each request. No stored tokens, no sessions.
- **Signal:** Explicitly marketing to agents, not humans. "No accounts, no API keys" is their tagline. They built an agent-readable API guide.
- **Founded:** Feb 2026 (blog post dated Feb 28, 2026)
- **HN presence:** Not found on HN yet — discovered via web search for "static site hosting for agents"

### VibeDrop ⚠️ DIRECT COMPETITOR

- **URL:** vibedrop.cc
- **What:** "Agent-native static host for AI-generated sites" — deploys any folder to a public URL in one tool call
- **Founded:** Apr 2026 (Show HN Apr 23, 2026)
- **Key features:**
  - Zero config, zero account — first call auto-provisions an anonymous key at ~/.vibedrop
  - CLI: `npx @vibedrop/cli deploy ./my-site`
  - MCP server: `npx @vibedrop/mcp` (Claude Code, Cursor, Windsurf)
  - Skill file at vibedrop.cc/skill.md (follows Anthropic skill format) — agent reads it and self-installs
  - Cloudflare Workers + R2 + D1 backend, 300+ edge cities
  - Sub-100ms TTFB
  - Free tier: 7-day TTL (30 days once claimed), 25MB/site, 3 concurrent sites
  - Pro tier: $5/month, permanent sites, 50MB/site, custom subdomain + custom domain, password protection
  - Atomic deploys with versioned storage, instant rollbacks
  - Sites on *.vibedrop.site (domain isolation)
- **Auth model:** Anonymous API key auto-provisioned on first deploy. Claim via one-time URL + email signin. No Ed25519, no cryptographic identity.
- **Signal:** Explicitly built for agents. Blog post: "The deeper problem isn't onboarding UX. It's that every existing host assumes the deployer is a human driving a dashboard. None of them were designed for an agent." Very aligned with ZenBin's thesis.
- **Philosophy:** "The skill file is the product" — compete on quality of agent instructions, not vendor integrations. Protocol surface stays small.
- **HN traction:** Show HN got 1 point, 0 comments. Still early.
- **Differentiation vs ZenBin:** No Ed25519 identity, no Markdown-native rendering (only static HTML), no `/.well-known/agent.md` discovery, no signed content provenance. Uses anonymous API keys (not standards-aligned). But execution is polished — Cloudflare edge, MCP server, skill.md, one-command deploys.

### here.now

- **URL:** here.now
- **What:** "Instant web hosting for agents." Another direct competitor.
  - API key auth (email verification or dashboard). No Ed25519 signing. Anonymous sites expire in 24 hours.
  - Multi-file sites (HTML, JS, CSS, images, video), incremental deploys, custom domains, password protection, payment gating (stablecoins)
  - 3-step publish: create → upload → finalize
  - HN launch got only 2 points — market hasn't noticed them yet

### ZenBin vs AccessAgent vs here.now vs VibeDrop

| Feature | ZenBin | AccessAgent.ai | here.now | VibeDrop |
|---------|--------|----------------|----------|----------|
| Agent identity | Ed25519 keypairs (self-register) | Ethereum wallet (personal_sign) | API key (email verification) | Anonymous API key (auto-provisioned) |
| Account needed | No (agents self-register keys) | No (wallet-generated) | Yes (email-based) | No (auto-provisioned) |
| Publishing | Single signed POST | Upload zip + sign | 3-step (create/upload/finalize) | CLI/MCP deploy folder |
| Content types | HTML, Markdown, images, video | HTML, JS, CSS, images, audio, fonts | HTML, files, images, PDFs, video | Static files only (HTML/CSS/JS) |
| Multi-file | No (single payload per page) | Yes (zip upload) | Yes (multi-file with incremental deploys) | Yes (folder deploy) |
| Subdomains | Yes (first-class) | Yes (*.accessagent.ai) | Yes (handle.here.now) | Yes (*.vibedrop.site) |
| Custom domains | No | Yes | Yes | Yes (Pro only) |
| Password protection | No | No | Yes | Yes (Pro only) |
| Payment gating | Stripe ($2.99/$9.99/mo) | Unknown | Stablecoins (Tempo network) | $5/mo Pro |
| Pricing | Free 100pg/mo, Pro $2.99/mo | Unknown | Free, no visible pricing page | Free (7d TTL) / $5/mo Pro |
| Anonymous tier | No | Yes (wallet-generated) | Yes (24hr expiry) | Yes (7d TTL) |
| Agent discovery | `/.well-known/agent.md` | Agent-readable API guide | Skill install command | Skill.md + MCP server |
| Private storage | No | Unknown | Yes (Drives) | No |
| Edge CDN | Render | Unknown | Cloudflare | Cloudflare |
| Open source | Yes (GitHub) | No | Skill open, platform proprietary | No ("~500 lines of Cloudflare Worker") |
| Auth replay protection | Ed25519 signature + timestamp | Ethereum personal_sign + 5min window | API key | API key |
| Crypto standard | Ed25519 (emerging standard) | Ethereum/secp256k1 (established) | None (API key) | None (API key) |
| MCP server | No | No | No | Yes (`@vibedrop/mcp`) |
| Skill file | No | No | No | Yes (vibedrop.cc/skill.md) |
| Markdown rendering | Yes (native) | No (HTML only) | No (HTML only) | No (HTML only) |
| Signed content | Yes (Ed25519 per-page signatures) | No | No | No |

### Key Differentiation Points

1. **Crypto identity alignment:** ZenBin uses Ed25519, which aligns with the emerging AI agent identity standard (AI Agent Passport, IETF draft, FIDO). AccessAgent uses Ethereum's secp256k1 — established but not aligned with the agent identity ecosystem. VibeDrop and here.now use anonymous API keys — no cryptographic identity at all.
2. **Content type advantage:** ZenBin supports Markdown natively. AccessAgent, VibeDrop, and here.now are all HTML-only (or static files only). Markdown-native is uniquely agent-friendly.
3. **Emerging standards:** ZenBin's `/.well-known/agent.md` follows the Google A2A pattern. AccessAgent has agent-readable API docs but no discovery standard. VibeDrop has a skill.md but no well-known discovery.
4. **Content provenance:** Only ZenBin signs content with Ed25519 per-page signatures. No other competitor offers cryptographic proof of content origin.
5. **Agent-native auth:** No accounts, no email verification — agents self-register Ed25519 keys. VibeDrop auto-provisions API keys (no crypto identity). AccessAgent uses Ethereum wallets (crypto but not standards-aligned).
6. **Skill file / MCP:** VibeDrop has both a skill.md (Anthropic format) AND an MCP server. This is a UX advantage ZenBin should match or exceed.
7. **Market validation:** AccessAgent, VibeDrop, and here.now all validate the same thesis — "hosting platforms were designed for humans, not agents."

## Other Adjacent Projects

### Agent Infrastructure
- **Samma Suit** (sammasuit.com) — Open-source 8-layer security framework. Crypto identity signing, permission inheritance, kill switches. Complementary — they handle auth/security, we handle publishing. [Potential partnership]
- **Manifold** (github.com/intelligencedev/manifold) — Flow-based UI for AI agent workflows. Not a publishing platform but agents that produce output need somewhere to put it.
- **Microsoft Agent Governance Toolkit** (github.com/microsoft/agent-governance-toolkit) — MIT-licensed, 7 packages in 5 languages. Runtime policy enforcement, identity, SRE for agents. Framework-agnostic: LangChain, CrewAI, OpenAI Agents SDK, LangGraph, Haystack, PydanticAI, Dify, LlamaIndex. Addresses all 10 OWASP agentic AI risks. Aspiration to move to a foundation. Complementary — they handle runtime governance, we handle output publishing.
- **Airbyte Agents** — Unified data layer for agents. "Context Store" pre-indexed from replication connectors. Argues MCP wrappers are insufficient. 80-90% fewer tokens than vendor MCPs. Solves data *input*; ZenBin solves *output*.
- **Mochi.js** (mochijs.com) — Bun-native, raw-CDP browser automation library. MIT, open-source. Anti-WAF focus. Not publishing, but agents that browse need this.
- **Flue** (104 pts on HN) — TypeScript agent framework gaining traction. PyFlue is Python clone.

### Agent Identity & Auth
- **AI Agent Passport** — RFC-stage open standard for verified AI agent identity using Ed25519 + did:web. Same crypto as ZenBin. They handle identity for transactions; we handle identity for publishing. Potential integration partner. GitHub: StacyStarchum/Ai-agent-passport-. Registry: registry.agentpassport.dev.
- **AIAgentMark™** — Commercial entity (aiagentmark.com) branding the "AI Agent Passport™" as self-sovereign identity standard for personal AI agents. v1.0 released. Backed by DigiCert's 3-layer trust architecture (DNS enforcement + agent identity + hardware-rooted model protection). Enterprise PKI credibility for Ed25519-based identity.
- **Samma Suit METTA** — Crypto identity signing for agents. Similar to ZenBin's Ed25519 approach but for security policies, not publishing.
- **MCPS** (mcp-secure.dev) — Cryptographic identity and message signing layer for MCP agents. ECDSA P-256 agent passports. Scanned 39 agent frameworks against OWASP Top 10 — found 41% of MCP servers have zero authentication.
- **IETF draft-klrc-aiagent-auth-00** — Internet-Draft for AI agent auth. WIMSE identifiers, mTLS, HTTP Message Signatures, OAuth 2.0 Token Exchange.
- **OpenClaw SKILL.md** — Agent extensibility pattern. ZenBin's `/.well-known/agent.md` follows this.
- **Strata/CSA Survey** — Only 18% confident IAM can manage agents. 44% static API keys. 55% cite data exposure as top concern. 40% increasing budgets for agent identity.
- **Token Security Predictions** — Agents becoming biggest, most privileged identity type. Long-lived credentials polluting agent identity. MCP hygiene causing credential leaks. NHI-first IAM is the future.
- **arXiv 2604.23280** — Academic paper identifying 5 structural gaps in AI identity (semantic intent verification, recursive delegation accountability, identity integrity, governance opacity, operational sustainability). Concludes foundational research needed.
- **Microsoft Agent Governance Toolkit** — See Agent Infrastructure section. Runtime security governance for agents.

### Agent Deployment/Runtime
- **Terminal Use (YC W26)** — "Vercel for filesystem-based agents." Gives agents a runtime and filesystem. Complementary — they run agents, we publish their output.
- **E2B, Daytona** — Agent sandboxing and runtime. Complementary.

### MCP Ecosystem
- **Endara** — MCP server aggregator. Single endpoint for all MCP servers. JS execution mode collapses 50+ tools into 3 meta-tools. The "MCP of MCPs" pattern.
- **ToolMesh** — Converts REST APIs into MCP tools via declarative YAML. Code Mode compresses 50k+ tokens to ~1k. Credential injection pattern (never reach the model) similar to ZenBin's signed tokens.
- **Codebadger** — MCP server for static code analysis with Joern.
- **Sigma Guard** — MCP server for contradiction checks in graph memory. "Verify before memory write" — conceptually parallel to ZenBin's verify-before-publish.
- **Lune** — MCP server for scientific knowledge grounding.
- **Unlinked** — MCP server for LinkedIn.
- **Biopharma Catalyst MCP** — Forensic verdicts on biopharma catalyst plays. Niche MCP server.
- **GAIIA** — Agentic API interrogator MCP. Free/OSS.
- **ClawHub.ai** — Skill registry for OpenClaw agents. 13K+ skills.
- **Airbyte Agents MCP** — Unified data layer MCP. Not just a wrapper — provides pre-indexed context store. Benchmarks show 80-90% fewer tokens than vendor MCPs for cross-system queries. Open-sourced benchmark harness.

### Agent Tooling & Discovery
- **Postiz Agent** (postiz.com/agent) — CLI for AI agents to post to 30+ social platforms. Markets directly to agents with SKILL.md. Key insight: they market to agents, not humans.
- **agent-data** (agent-data.dev) — CLI for giving agents real-time structured data without browser automation. Mentions OpenClaw explicitly.
- **Vdiff** (github.com/4bk/vdiff) — CLI for reviewing AI-generated code. Tree-sitter AST diffs + LLM reasoning. Local-first, BYOK. Validates "agent output review" as a category.
- **AlertMole** (alertmole.com) — Scheduled AI agent that monitors the web and notifies only on condition triggers. Shows agents producing output that needs delivery channels.
- **Lyfe.ninja** — Revocable digital signatures for AI-generated content. "Know your agent" — verifying content provenance. Client-side verification, tampering detection, revocable via short-lived leases. HN Ask (3 pts). Asks "Is content-level verification for AI outputs something you'd actually want?" Validates ZenBin's content provenance thesis but from a revocability angle rather than attribution.
- **accept.md** — HTTP content negotiation library for Markdown. Returns Markdown when `Accept: text/markdown` is sent. Validates that agents need Markdown, not just HTML. Complementary to ZenBin (makes existing sites Markdown-friendly; ZenBin renders Markdown natively).
- **AgentPages** (github.com/idorozin/AgentPages) — GitHub Pages for Agents. Agents live in repo, maintain Astro site via GitHub Actions cron. Another custom publishing pipeline that ZenBin could simplify. 1 pt on HN.

### Agent-Generated Publishing (Custom Pipelines)
These projects all built custom publishing pipelines. ZenBin would simplify them:
- **HN Job Trends** (hn-job-trends.gantryops.dev) — Agent-classified HN jobs published as static Next.js site. Has `llms.txt` for agent discovery.
- **Dependicus** (descriptinc.github.io/dependicus/) — Agent-assigned dependency tickets published as dashboard.
- **UltraLab** (ultralab.tw) — 4-agent fleet on free tier, auto-posts blog articles to Discord.
- **Airlock** — Cyborg agents compiled to Go binaries. Agents render webpages from inside themselves. More complex than ZenBin's publish-to-URL model.

### Multi-Agent Coordination
- **WUPHF** (wuphf.team) — Local-first multi-agent workspace. Agents review each other's work. Uses git + wiki as publishing surface. ZenBin could be their web publishing layer.

## Agent Output Handling — The Gap

Current patterns for agent output:
- Agents output to chat windows (ephemeral)
- Agents output to sandboxes (temporary)
- Agents output to GitHub (version control, not publishing)
- Agents output to S3/cloud storage (files, not web pages)

**Two competitors now exist (AccessAgent.ai, here.now) but the space is still wide open.** None of them align with the emerging Ed25519 agent identity standard, and none support Markdown-first publishing with `/.well-known/agent.md` discovery.

### ShipPage ⚠️ DIRECT COMPETITOR

- **URL:** shippage.ai
- **What:** "Instant HTML Publishing for AI Agents" — zero-config publishing service built on Cloudflare Workers
- **Founded:** Apr 2026 (discovered May 2026)
- **Key features:**
  - Zero config, zero registration — auto-registers agent on first publish call
  - POST HTML/Markdown, get back a public URL instantly
  - OpenClaw skill (`clawhub install shippage`) AND MCP server (`npx shippage-mcp`)
  - Works with Claude Code, Claude Desktop, Cursor, or any HTTP client
  - Auto-registration: first call returns an API key and claim URL
  - Free tier: 20 publishes/month, 14-day retention, 500KB per page
  - Pro tier: permanent pages, 5MB per page, password protection, custom slugs
  - Cloudflare Workers + R2 + KV backend
  - Sub-100ms response time (edge-deployed globally)
  - MIT-licensed
- **Auth model:** Auto-register on first call. No API key needed to start. First publish returns `sk_...` key and claim URL. Simpler than Ed25519 but less cryptographically rigorous.
- **Comparison table from their site (them vs PageDrop vs Manual Deploy):** They highlight: zero config ✓, agent identity system ✓, page management (CRUD) ✓, password protection ✓, custom URL slugs ✓, OpenClaw + MCP ecosystem ✓, auto-expiry & cleanup ✓
- **Signal:** Very close positioning to ZenBin. Key differences: they auto-register (no key management burden but no cryptographic identity), they support HTML + Markdown input (matching ZenBin), they have MCP + OpenClaw skill integration. Their free tier is more limited (20 vs 100 publishes/month) and pages expire in 14 days.
- **Differentiation vs ZenBin:** No Ed25519 cryptographic identity (just auto-provisioned API keys), no signed content provenance, no `/.well-known/agent.md` discovery, no subdomains (uses /p/slug URLs), no Stripe payment gating. But execution is polished — MCP + OpenClaw skill, Cloudflare edge, clean API. **Strongest competitor yet on developer experience.**

### ZenBin vs ShipPage

| Feature | ZenBin | ShipPage |
|---------|--------|----------|
| Agent identity | Ed25519 keypairs (self-register) | Auto-provisioned API key |
| Account needed | No | No (auto-register) |
| Publishing | Single signed POST | Single POST (auto-register on first) |
| Content types | HTML, Markdown, images, video | HTML, Markdown |
| Subdomains | Yes (first-class) | No (/p/slug URLs) |
| Custom domains | No | No |
| Password protection | No (Stripe gating) | Yes (Pro) |
| Pricing | Free 100pg/mo, Pro $2.99/mo | Free 20pg/mo, Pro (pricing TBD) |
| MCP server | No | Yes |
| OpenClaw skill | Yes | Yes |
| Markdown rendering | Yes (native) | Yes |
| Signed content | Yes (Ed25519 per-page signatures) | No |
| Agent discovery | `/.well-known/agent.md` | No |
| Edge CDN | Render | Cloudflare Workers |
| Open source | Yes | MIT-licensed |
| Max page size | Unknown | 500KB (free) / 5MB (Pro) |

### WordPress.com Agent Publishing

- **URL:** wordpress.com (announced March 2026)
- **What:** WordPress.com now allows AI agents to draft, edit, and publish posts
- **Signal:** Major platform embracing agent publishing. Validates that agents need web publishing, but WordPress's approach is CMS-first (agents as content contributors), not agent-native (agents as first-class publishers). Very different UX — WordPress is heavyweight, requires an account, and is designed for human-managed sites.
- **ZenBin relevance:** Validates the market thesis. WordPress solves agent-in-CMS; ZenBin solves agent-as-publisher. Different segments.

## Search Sources
- HN Algolia API: `https://hn.algolia.com/api/v1/search_by_date?query=...&tags=story`
- Reddit: r/LocalLLaMA, r/ChatGPTCoding (blocks scraping)
- Keywords: AI agent publish, AI agent identity, AI agent infrastructure, MCP server, agent framework, agent output