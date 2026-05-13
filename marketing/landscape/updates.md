# Research Update Log

Chronological log of automated landscape research findings. Each entry is a brief summary — see the topic-specific files for details.

## Update #25 — 2026-05-12 22:50 UTC

- **ShipPage** (shippage.ai) — ⚠️ NEW DIRECT COMPETITOR. Zero-config HTML publishing for AI agents. Cloudflare Workers + R2 + KV. Auto-registers on first call (returns API key + claim URL). OpenClaw skill + MCP server. Free: 20 publishes/month, 14-day retention, 500KB/page. Pro: permanent pages, 5MB/page, password protection. MIT-licensed. **Best DX in the space** — auto-registration means zero friction on first use. Uses /p/slug URLs (no subdomains). No Ed25519, no signed content, no /.well-known/agent.md. Added to competitors.md with full comparison table.

- **AAuth (Agent Auth)** — OAuth 2.0 co-author Dick Hardt published exploratory spec for agent identity and access management. Agents as first-class identities, no bearer tokens, signed HTTP messages, explicit delegation chains. Working prototype with Keycloak + Agentgateway + A2A + MCP. HN: 1 pt (just posted). **High-signal:** When the OAuth 2.0 co-author says agents need cryptographic identity, that validates ZenBin's Ed25519 approach. Added to standards.md.

- **Manufact / mcp-use** (HN, 6 pts) — Open-source MCP dev tools. Launched MCP Inspector with HMR (like Vite for MCP). Key insight: "Testing MCP servers is a pain" — config is hard, agent capabilities vary wildly across clients. They solve it with browser-based agent testing on real clients. Added to infrastructure.md.

- **Gigacatalyst** (HN, 33 pts, front page) — Embedded AI builder for SaaS platforms. Agentic API discovery, proxy layer for auth/tenant isolation/rate limiting, 900+ apps built. Adjacent to ZenBin — they build inside SaaS, we publish to the web. Their proxy layer pattern (controlled, logged, observed, version-controlled) is worth studying. Added to infrastructure.md.

- **Hoop MCP server** (HN, 2 pts) — Open-source infra access gateway with MCP server for querying session history. Validates the pattern: give agents API access to data locked in dashboards. Parallel to ZenBin giving agents API access to publishing locked in CMS dashboards. Added to infrastructure.md.

- **Hypercubic / Hopper** (HN, 40 pts, front page) — Agentic development environment for mainframes/COBOL. Key design principle: preserve fidelity of the environment, make it accessible to agents. Same insight for ZenBin: don't wrap publishing in abstractions, give agents a native API. Added to infrastructure.md.

- **WordPress.com agent publishing** (TechCrunch, Mar 2026) — WordPress.com now lets AI agents draft, edit, and publish posts. Validates the market thesis (agents need web publishing) but takes a CMS-first approach. Not agent-native. Added to competitors.md.

- **Key insights:**
  1. **ShipPage is the most dangerous competitor yet on DX.** Auto-registration on first call, MCP + OpenClaw skill, Cloudflare edge. ZenBin needs to match the zero-friction first-call experience while keeping Ed25519 underneath. Consider: auto-generate Ed25519 keypair on first call, return agent ID + keypair in response.
  2. **AAuth validates agent identity as a mainstream concern.** OAuth 2.0 co-author building agent auth specs means this is no longer a niche — it's becoming infrastructure-grade. ZenBin's Ed25519 signing is aligned with this trajectory.
  3. **MCP dev tooling is a real pain point** (Manufact). The MCP ecosystem needs better testing, better dev loops, and better client compatibility. ZenBin should publish an MCP server.
  4. **WordPress entering agent publishing** is market validation. They solve agents-in-CMS; we solve agents-as-publishers. Different segments.
  5. **ShipPage's comparison table** explicitly lists "Agent identity system" as a feature, positioning crypto identity as table stakes. We're aligned but ShipPage's auto-registration is smoother UX than ZenBin's current self-registration flow.

---

## Update #24 — 2026-05-12 10:50 UTC

- **AI Agent Passport** (HN, May 10, 2 pts) — Re-posted. Reviewed full GitHub spec: Ed25519 + did:web, scoped permissions, spend limits, registry-verified trust. Status: RFC. Python + Node SDK stubs referenced but not in repo. Spec docs still 404. Registry (registry.agentpassport.dev) still offline. No traction growth. Unchanged from previous updates. Already tracked in standards.md.
- **OfficeOS** (HN, May 11, 2 pts) — Already tracked. GitHub now shows fuller detail: .NET-based control plane, Docker/K8s deployment, pod-per-agent isolation, attached browsers, managed tools + MCP. Complementary to ZenBin (they manage agent ops; we publish agent output).
- **iClaw** (HN, Apr 28, 7 pts) — AI agent built on Apple Intelligence 3B AFM model. Sandbox-first design (App Sandbox, explicit consent for create/delete actions, tool disabling). LoRA adapter for instruction following. Safari Extension for web access. Signal: on-device agents with safety-by-design are emerging. Not a direct competitor but validates the trend toward sandboxed agents with controlled output capabilities.
- **DialtoneApp Network** (HN, Apr 21, 2 pts) — Card payments for bot commerce. Bot budget owners register cards; website owners list purchasable items via `.well-known/*` files; bots discover and transact. Uses `.well-known` for agent discovery — **very aligned with ZenBin's `/.well-known/agent.md` approach**. Reviewed Stripe machine payments, Skyfire, Crossmint, Google Universal Commerce Protocol, MCP, A2A. Signal: `.well-known` is emerging as the standard pattern for agent discovery, same as ZenBin uses.
- **Google A2A Protocol** (HN, Apr 27, 2 pts) — Agent-to-agent communication standard. Already widely known. No new developments.
- **MCP servers (niche)** — World Cup History MCP (May 12, 1 pt), narrative trading MCP (May 11, 3 pts). Long tail continues. Low relevance to ZenBin.
- **Airlock** (HN, May 7, 4 pts) — Already tracked. Self-upgrading compiled Go agent binaries with embedded web servers. Confirmed active.
- **Agent hosting market maturation** — Multiple 2026 comparison articles (Shakudo, dev.to, OpenClaw Launcher, fast.io) ranking AI agent hosting platforms. Signal: the market is being formally categorized. None focus on agent output/publishing — all focus on compute/runtime.
- **Reddit** — Still blocked (403 on JSON API). DuckDuckGo search returns stale results. No fresh r/LocalLLaMA or r/ChatGPTCoding data.
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **Key insights:**
  1. **`.well-known` is the emerging agent discovery standard.** DialtoneApp uses it for bot commerce, ZenBin uses it for agent.md. This is converging into a web standard pattern. We should lean into this positioning.
  2. **On-device agents with safety-by-design** (iClaw) are a new category — sandboxed, consent-gated agents that run locally. These agents still need to publish output, and they need lightweight, no-setup publishing (exactly ZenBin).
  3. **AI Agent Passport is still vapor.** 4+ cycles tracking it. Spec is well-structured but no implementation, no registry, 2 pts. The identity thesis is right but execution is stalled. ZenBin is shipping Ed25519 identity today.
  4. **Agent hosting is becoming a commodity category** with comparison listicles. Everyone focuses on compute/runtime. Nobody focuses on output/publishing. That's our gap.

---

## Update #23 — 2026-05-11 22:50 UTC

- **SolidInvoice MCP server** (HN, May 11, 2 pts) — Open-source invoicing app now ships with a built-in MCP server at `/_mcp`. Uses OAuth 2.1 for auth, company-scoped permissions, read/write scopes. Supports Claude Desktop, Claude Code, Cursor, Codex CLI, Goose. Signal: SaaS apps are starting to ship MCP servers as a first-class feature, not just API wrappers. Added to infrastructure.md.
- **MCP budget/cost awareness** (HN, May 11, Polish Substack) — Article titled "Why MCP servers eat your AI budget." Signal: Growing awareness that MCP tool calls are expensive. Relevant to ZenBin — our API is lightweight (publish/read, not chatty tool calls).
- **BetterDB self-tuning cache agent** (HN, May 8, 7 pts) — Agent that tunes its own Redis cache via MCP. Two-tier caching (exact + semantic). Agent suggests and applies config changes, monitors results. Validates the "agent-maintained content/infrastructure" pattern. Added to infrastructure.md.
- **Ramble** (HN, May 1, 4 pts) — iOS voice notes app that sends HMAC-SHA256 signed webhooks to agents. Uses Apple App Attest instead of accounts. Interesting auth/identity signal — signed webhooks as the trust mechanism for agent input, similar to ZenBin's Ed25519 signed output.
- **MCP narrative trading server** (HN, May 11, 2 pts) — MCP server for trading intelligence. Low relevance to ZenBin (niche finance use case).
- **No new competitors found.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **Reddit** — Still blocked (403 on JSON API, DuckDuckGo search returns old results). No fresh r/LocalLLaMA or r/ChatGPTCoding data.
- **Key insights:**
  1. **SaaS + MCP is becoming a product category.** SolidInvoice is the latest example of a traditional SaaS app shipping MCP as a feature. This validates the direction but also means more noise in the MCP ecosystem.
  2. **MCP cost concerns are emerging.** The "MCP budget tax" article signals that people are noticing MCP tool calls are expensive. ZenBin's publish API is a single call, not a chatty MCP conversation — this is a differentiator.
  3. **Signed webhooks as identity/auth pattern.** Ramble uses HMAC-SHA256 signed webhooks; AI Agent Passport uses Ed25519; ZenBin uses Ed25519. The pattern is converging: cryptographic verification of agent input/output is becoming standard practice.
  4. **Agent-maintained infrastructure pattern persists.** BetterDB (self-tuning cache), SLayer (self-maintaining semantic layer), WUPHF (self-updating wiki). Agents that maintain things need a place to publish the results. ZenBin is that place.

---

## Update #22 — 2026-05-11 16:50 UTC

- **OfficeOS** (HN, May 11, 2 pts) — Open-source infrastructure for scaling/managing AI agents. github.com/officeos-co/officeos. New agent ops platform. Complementary to ZenBin (they manage agent operations; we publish agent output). Added to infrastructure.md.
- **Mozaik** (HN, May 11, 2 pts) — TypeScript framework for building reactive AI agents. github.com/jigjoy-ai/mozaik. New framework entry. Framework-agnostic ZenBin works with any agent. Added to infrastructure.md.
- **SLayer** (HN, May 11, 10 pts, 2 comments) — Open-source semantic layer maintained by your agent. github.com/MotleyAI/slayer. Best traction this cycle. Key insight: existing semantic layers built for static BI dashboards, but agents need to iterate and learn. Agents edit columns/measures, create models, save natural-language memories. Validates "agent-maintained content" pattern (same as WUPHF wiki). Added to infrastructure.md.
- **MCP security paper** (HN, May 11, 2 pts) — mcpfw.dev/paper finds MCP servers can modify tool list mid-session; clients have no mechanism to detect. Protocol-level security gap. Validates need for cryptographic verification (ZenBin provides via Ed25519 signing). Added to standards.md and infrastructure.md.
- **AI Agent Passport** (HN, May 10, 2 pts, 1 comment) — Re-posted. Still early traction. No changes to repo (still only README + CONTRIBUTING.md, spec docs 404, registry offline). Already tracked.
- **Airbyte Agents** — CEO's detailed HN post. Already tracked. No changes.
- **WUPHF** — New Show HN (May 11, 1 pt) with full architecture description (gossip + adoption scoring). Already tracked.
- **F500 agent mandate thread** (14 pts, 9+ comments) — Still getting engagement. "Is this the SWE workflow of the future?" Already tracked.
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **Reddit** — Still blocked (403 on JSON API). No fresh r/LocalLLaMA or r/ChatGPTCoding data for 4+ consecutive cycles.
- **Key insights:**
  1. **SLayer (10 pts) is the strongest signal this cycle.** The "agent-maintained content" pattern keeps appearing — WUPHF wiki, SLayer semantic layer, UltraLab content pipeline, Cosmic CMS agents. Every time agents build or maintain something structured, they need a publishing surface. ZenBin is that surface.
  2. **MCP protocol-level security gaps** are being documented. Tool list modification without client detection is a new class of vulnerability. Ed25519 signing (ZenBin's approach) provides cryptographic integrity that MCP lacks.
  3. **New agent infra/framework launches daily** but with minimal traction (1-2 pts). The market is getting crowded at the infrastructure layer but nobody is solving the output/publishing gap.
  4. **AI Agent Passport is vapor.** 4+ updates tracking it, repo still has no implementation code, spec docs 404, registry offline. The Ed25519 + did:web thesis is sound but execution is stalled. ZenBin is already shipping Ed25519 identity for publishing.

---

## Update #21 — 2026-05-11 10:50 UTC

- **No new findings this cycle.** All HN stories already tracked in Updates #19–20 (Airbyte Agents, AI Agent Passport, F500 agent mandate, WUPHF, Ultralab.tw, MCP server proliferation). No new stories with >3 points or new competitors discovered.
- **Reddit:** Still blocked (403 on JSON API, DuckDuckGo bot detection on search). No fresh r/LocalLLaMA or r/ChatGPTCoding data for 3 consecutive cycles.
- **DuckDuckGo web search:** Hit bot-detection challenge. Unavailable this cycle.
- **AI Agent Passport** (github.com/StacyStarchum/Ai-agent-passport-) — Reviewed in detail. Ed25519-signed JSON passport, scoped permissions, spend limits, registry-verified status. Python + Node SDKs. Status: RFC (Request for Comments). Still 2 pts on HN, no traction growth. Already tracked in standards.md.
- **MCP server long tail:** Biopharma Catalyst MCP, GAIIA, Unlinked (LinkedIn), Lune, Codebadger — all still 1-3 pts. No breakout MCP servers this cycle.
- **Landscape stable.** No material changes since Update #20 (~1 hour ago). Reducing cadence seems appropriate given low signal density at hourly intervals.

---

## Update #20 — 2026-05-11 09:50 UTC

- **Ultralab.tw** (HN, May 2026) — Solo dev in Taiwan running 4 AI agents on OpenClaw + Gemini 2.5 Flash free tier. Agents handle content generation, community engagement, security scanning, and ops. Key architecture: agents read pre-computed intelligence files (local markdown, 0 LLM tokens), one focused prompt per action, research pipeline costs 0 LLM tokens. Results: 27 automated Threads accounts, 12K+ followers, 3.3M+ views. Monthly cost: $0 LLM + ~$5 infra. Publishing is fully automated: blog posts, Discord notifications, social posts — all agent-driven. **Validates ZenBin's core thesis**: agents that produce content need publishing infrastructure. Ultralab built their own pipeline (git push → blog → Discord), but this is exactly the kind of custom plumbing ZenBin replaces. Added to infrastructure.md.
- **WUPHF** (HN, May 11, ~1 pt but 260 pts on earlier post) — Multi-agent office framework using "gossip" to prevent context drift. Built on Karpathy's autoresearch architecture. Uses git worktrees, per-agent notebooks, adoption-scored wiki promotion. Agents publish to shared wiki with credibility scoring. Already tracked. No new changes.
- **AI Agent Passport** — Still 2 pts on HN. No traction growth. Unchanged. Still tracked.
- **Airbyte Agents** — Already tracked. No changes.
- **F500 agent mandate thread** — Already tracked. No changes.
- **MCP server proliferation** — Biopharma Catalyst MCP, GAIIA, Unlinked, Lune, Codebadger all already tracked. No new MCP servers with significant traction this cycle.
- **Mochi.js** — Already tracked in infrastructure.md. Bun-native browser automation, not agent publishing but relevant to agent automation.
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **Reddit** — Fully blocked (403 on old.reddit.com, DuckDuckGo bot detection on search). No fresh r/LocalLLaMA or r/ChatGPTCoding data.
- **Key insights:**
  1. **Ultralab.tw is a live proof point** for ZenBin's thesis. Real agents, real publishing, real automation — but cobbled together with custom scripts and git hooks. Every agent pipeline that publishes to the web is a potential ZenBin user. The "$0 LLM cost" angle (pre-computed intelligence files) is interesting — agents that minimize token usage will also want publishing that minimizes friction.
  2. **No new signal this cycle.** Landscape is stable. The major trends (identity formalizing, MCP maturing, publishing gap) continue unchanged. Next meaningful update likely when AI Agent Passport gains traction, FIDO agentic auth publishes specs, or a new competitor appears.

---

## Update #19 — 2026-05-11 08:50 UTC

- **Google Workspace MCP server** (May 1, 2026) — Now in public developer preview. Provides MCP tools for Gmail, Drive, Calendar, Chat, and People Dictionary. Includes a tiered usage model for agentic actions at scale. Validates MCP as the default integration layer — Google is shipping MCP as first-class, not an afterthought. Added to infrastructure.md.
- **MCP ecosystem maturation article** (dev.to, May 2026) — "The MCP Server Ecosystem in 2026" article confirms: question has shifted from "can agents access tools?" to "which MCP server do I use?" Knowledge base MCP is the largest unmet demand. MCP is now governed by Linux Foundation Agentic AI Foundation, not Anthropic alone. Key insight: MCP decouples tool capability from agent identity — this is architecturally aligned with ZenBin's approach.
- **MCP + Agent explained article** (mcpplaygroundonline, 2026) — Clear 3-layer architecture: Model → Agent Framework → MCP Servers. MCP is "the wire," not the loop. Nov 2025 spec added elicitations, structured output, and MCP Apps surface. MCP Apps is new — a presentation layer beyond tools. Relevant to ZenBin: if MCP adds a publishing/presentation surface, we need to track whether it overlaps or complements.
- **WUPHF** (HN, May 11, 2026, 1 pt) — Multi-agent office framework using "gossip" to prevent context drift. Built on Karpathy's autoresearch architecture (branches + results.tsv + PR-as-contribution). Uses git worktrees, per-agent notebooks, adoption-scored wiki promotion. Interesting pattern: agents publishing to shared wiki with credibility scoring. Already tracked in competitors.md as "Multi-Agent Coordination."
- **Airbyte Agents** (HN, May 2026) — Already tracked in Update #18. CEO argues MCP wrappers are insufficient, pre-indexed Context Store is the answer. Benchmarks show 80-90% fewer tokens than vendor MCPs. Open-sourced benchmark harness.
- **AI Agent Passport** (HN, May 10, 2026) — Still at 2 pts. No traction. Stacy Starchum project. GitHub repo with v1 schema. Already tracked.
- **MCP server proliferation continues:** Biopharma Catalyst MCP, GAIIA (agentic API interrogator), Unlinked (LinkedIn MCP), Codebadger (static analysis with Joern), Lune (science grounding for agents). All 1-3 pts on HN. Long-tail ecosystem growth.
- **F500 agent mandate thread** (HN, May 10, 11 pts) — Engineer at top-10 F500 told not to write code by hand, must use Claude + proprietary agent framework. Agent-driven code reviews, shipping code they don't understand. Reinforces traceability and identity gaps.
- **Code Agents course** (HN, May 8) — Ask HN about engineering-focused coding agent courses. Low interest signals that agent skill training is still immature.
- **Microsoft Power Apps MCP server** (April 2026) — Shipped MCP inside Power Apps with human-approval feed. 1,100 enterprise system connections, no code. MCP going low-code.
- **Reddit searches** — DuckDuckGo rate-limited (bot detection). No fresh Reddit data this cycle.
- **Key insights:**
  1. **Google Workspace MCP** validates MCP as enterprise-grade infrastructure. Google tiering agent actions separately from human API calls is a de facto recognition that agents need different auth/identity patterns.
  2. **MCP Apps surface** (Nov 2025 spec addition) is a new presentation/output layer in MCP. Could compete with or complement ZenBin's publishing. Need to monitor.
  3. **Knowledge base MCP is the largest unmet demand** in the MCP ecosystem. ZenBin's Markdown-native publishing could serve as a knowledge base MCP server — this is a strategic opportunity.
  4. **Agent identity standard conversations are converging** (tracked in Update #17/18). Google's tiering model adds another data point: even Google treats agent actions differently from human ones.
  5. **No new direct competitors.** The landscape for "agent-native publishing with identity" remains essentially ZenBin alone.

---

## Update #18 — 2026-05-11 07:50 UTC

- **Microsoft Agent Governance Toolkit** (April 2026) — MIT-licensed, 7 packages, 5 languages (Python, TypeScript, Rust, Go, .NET). Runtime policy enforcement for agents at sub-millisecond latency. Addresses all 10 OWASP agentic AI risks. Framework integrations: LangChain, CrewAI, OpenAI Agents SDK, LangGraph, Haystack, PydanticAI, Dify, LlamaIndex. Aspiration to move to a foundation. Added to infrastructure.md and competitors.md.
- **arXiv paper on AI Identity** (2604.23280, April 2026) — Academic paper identifying 5 structural gaps: semantic intent verification, recursive delegation accountability, agent identity integrity, governance opacity, operational sustainability. Concludes these are foundational research problems, not just engineering. Added to standards.md.
- **Token Security 2026 predictions** — Agents moving to production with broken identity (44% static API keys, 43% passwords). MCP hygiene causing credential leaks. NHI-first IAM is the future. Added to standards.md and competitors.md.
- **Strata/CSA survey** — Only 18% of orgs confident in IAM for agents. 55% cite data exposure, 40% increasing identity/security budgets. Already tracked but now with more detail.
- **AI Agent Passport** — Still at 2 pts on HN (May 10 post). No traction growth. Unchanged from Update #17.
- **Airbyte Agents** — HN front-page, 150+ pts. CEO post arguing MCP wrappers are insufficient, pre-indexed Context Store is the answer. Benchmarks: 80-90% fewer tokens than vendor MCPs. Open-sourced benchmark harness. Added to competitors.md under infrastructure.
- **F500 agent mandate thread** (10 pts, 9 comments) — Engineer told not to write code, must use Claude + proprietary framework. Shipping code they don't understand. Already tracked but reinforces traceability gap.
- **MCP servers continue proliferating (low signal):** Biopharma Catalyst MCP, GAIIA (agentic API interrogator), Unlinked (LinkedIn), Codebadger (static analysis), Lune (science grounding), Sigma Guard (graph memory contradiction checks). All 1-3 pts. Long-tail.
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **Reddit search** — No fresh relevant discussions on r/LocalLLaMA or r/ChatGPTCoding found via DuckDuckGo.
- **Key insight:** Enterprise agent governance is becoming infrastructure-grade. Microsoft's toolkit, the arXiv paper, and Token Security's predictions all converge on the same conclusion: agent identity and governance are structural requirements, not optional add-ons. The arXiv paper explicitly says "more engineering effort alone will not close" the gaps. ZenBin's Ed25519 signed publishing addresses the "agent identity integrity" and "verifiability" gaps at the publishing layer — a concrete solution in a space where even researchers say there are structural holes.

---

## Update #17 — 2026-05-11 06:50 UTC

- **Identity standards converging fast.** Clawdrey Hepburn's IIW field guide identifies 10 researchers across IETF, OAuth, OpenID, and formal-methods communities whose conversations are merging. Diagrid's "MCP Gateways Aren't Enough" post (upcoming webinar May 20) argues client_id ≠ identity. Government-level recognition via CISA/NSA/Five Eyes joint guidance on secure agent deployment.
- **Atlas Trust Infrastructure** (12 pts, HN May 5) — proof chains for agent actions. Not just logs — cryptographic proof chains binding intent, capability, policy, evidence. Validates ZenBin's signed content as a proof chain primitive.
- **AI Agent Passport** — now tracked in standards.md. Full v1 schema with Ed25519 + did:web. Python/Node SDKs. RFC stage.
- **Vorim.ai** — commercial agent identity/trust layer. Minimal site, early stage, but signals identity as product category.
- **Selvedge MCP** — captures *why* agents changed code (provenance). Complementary to ZenBin's *who published* provenance.
- **Ohita** — API key management for AI agents. Validates that API keys are still the default (problem ZenBin solves with Ed25519).
- **Endara** — MCP aggregator (single endpoint). "MCP of MCPs" pattern continues.
- **Flue framework** (104 pts) — TypeScript agent framework gaining traction. PyFlue is Python clone.
- **Kestrel** — sovereign agent framework. Self-hosted, privacy-first.
- **CISA/NSA/Five Eyes guidance** — joint publication on secure AI agent deployment. Government-level recognition of agent security as national security concern.
- **StackOverflow MCP explainer** — "What is an MCP server?" mainstreaming.
- **Cloudflare Agents Week** — infrastructure for running agents at scale.
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **Reddit search blocked** (DuckDuckGo bot detection). No fresh r/LocalLLaMA or r/ChatGPTCoding.
- **Key insight:** The identity community is converging. Previously siloed conversations (workload identity, OAuth, policy languages, agent safety) are now "the same conversation in different accents." Standards will crystallize faster than expected. ZenBin is well-positioned with Ed25519 + did:web alignment. Proof chains (Atlas) are the next evolution beyond audit logs — ZenBin's signed publishing should be a node in that chain.

---

## Update #16 — 2026-05-11 04:50 UTC

- **No major new developments.** Market remains in consolidation phase.
- **AI Agent Passport** — full GitHub repo confirmed with detailed v1 schema: agent_id, owner (did:web), capabilities (spend_limit per transaction/day/month, permissions array), trust (verified_by, verification_level, status), cryptography (Ed25519 public key + signature). Python and Node SDKs. RFC stage. Registry at registry.agentpassport.dev. Still early HN traction (2 pts). No changes since Update #14.
- **Cosmic CMS Team Agents** (HN, Mar 31, 1 pt) — Headless CMS (YC W19) launched Team Agents: persistent AI team members in Slack/WhatsApp/Telegram. Content agents write + publish directly to CMS. Code agents open PRs. Computer use agents browse web. Another example of agents publishing output, but locked to CMS ecosystem. Validates that agent publishing is a real need, but CMS-bound rather than web-native like ZenBin.
- **Probus** (HN) — 3-agent vulnerability scanner. Found real bugs in n8n (JWT logging), Vercel AI SDK (role injection, schema bypass), LangGraph.js (NoSQL injection), browser-use (path traversal). Validates multi-agent architecture pattern where agents produce and publish findings.
- **MCP servers continue proliferating (low-signal):** Biopharma Catalyst MCP (forensic verdicts on pharma plays), GAIIA (agentic API interrogator), Unlinked (LinkedIn MCP, 3 pts). All niche, 1-3 pts. Long-tail.
- **F500 agent mandate thread** (10 pts, 9 comments) — "Is this the SWE workflow of the future?" Engineer at top-10 F500 told not to write code by hand, must use Claude + proprietary framework with 100+ agents. Shipping code they don't understand. Management says SWEs won't be needed. Reinforces traceability gap — who is accountable for agent output?
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **Reddit search blocked** (403/bot detection). No fresh r/LocalLLaMA or r/ChatGPTCoding discussions accessible.
- **Key insight:** Cosmic CMS validates the agent publishing need from the CMS side. Agent Passport validates identity from the commerce/transaction side. ZenBin sits at the intersection — web-native publishing with crypto identity — and neither competitor nor standard covers that exact spot yet.

---

## Update #15 — 2026-05-11 03:50 UTC

- **No major new developments.** Landscape largely unchanged since Update #14 (1 hour ago).
- **AI Agent Passport** — still at 2 pts on HN. No traction growth. GitHub repo live with Python/Node SDKs and registry. RFC stage. Unchanged.
- **MCP servers continue proliferating (low-signal):** Biopharma Catalyst MCP (forensic verdicts on pharma plays), GAIIA (agentic API interrogator), Codebadger (static analysis w/ Joern), Lune (science grounding), Unlinked (LinkedIn). All 1-3 pts. Long-tail niche servers.
- **"Is writing code by hand still necessary?"** HN thread (3 pts) — reinforces agent workflow anxiety and the traceability gap. Not new signal.
- **iClaw (Apple Intelligence agent)** — 6 pts. Agent built on Apple's 3B on-device model with explicit permission model for create/delete operations. Safety pattern maturation continues.
- **WUPHF** — Already tracked. 260 pts, 115 comments on HN. Multi-agent workspace with adoption-scored wiki. Agents need publishing.
- **Airbyte Agents CEO post** — Already tracked. Detailed benchmarks showing MCP wrappers are insufficient for agents.
- **Reddit search blocked** (DuckDuckGo bot detection). No fresh r/LocalLLaMA or r/ChatGPTCoding discussions accessible.
- **Key insight:** Market is in a consolidation phase — new entrants are niche MCP servers, not new competitors or standards. The competitive landscape (AccessAgent.ai, here.now, VibeDrop) and standards landscape (AI Agent Passport, IETF, FIDO, NIST) are stable. ZenBin's differentiation remains: Ed25519 identity alignment, Markdown-native, `/.well-known/agent.md`, signed content provenance.

---

## Update #14 — 2026-05-11 02:50 UTC

- **RSAC 2026 confirmed agent identity as main-stage enterprise topic.** IBM/Auth0/Yubico partnership for Human-in-the-Loop agent authorization. RSA expanding passwordless for AI agents. Swissbit previewing post-quantum FIDO2 keys. Agent identity is no longer academic — it's enterprise security priority #1.
- **NIST AI Agent Standards Initiative formalized.** Concept paper on agent identity and authorization closed April 2. Agents must be treated as identifiable, non-human principals. CSA research note confirms: only 18% of organizations confident in IAM for agents.
- **IETF draft-klrc-aiagent-auth-00 confirmed live** (March 2026). WIMSE + OAuth 2.0 model for agent auth. Agents are workloads. No new protocols needed — extend existing standards.
- **Aport.io published agent auth guide** (May 2026). Key framing: "Prompts aren't security controls." Pre-action authorization is the correct model. Validates ZenBin's verify-before-publish approach.
- **AI Agent Passport still on HN** (2 pts, May 10). Ed25519 + did:web. RFC stage. Python/Node SDKs live. Registry live at registry.agentpassport.dev.
- **Airbyte Agents CEO detailed post** on HN. Key insight: "APIs assume you already know what to query, whereas agents need first to discover what matters." 47-step agent traces producing wrong answers. Context Store solves input discovery.
- **F500 agent mandate anxiety** — HN thread "Is this the SWE workflow of the future?" (10 pts, 9 comments). Engineers told not to write code by hand, ship what they don't understand. Traceability gap highlighted.
- **New MCP servers:** GAIIA (API interrogator), Unlinked (LinkedIn), Lune (science grounding), Codebadger (static analysis), Sigma Guard (memory consistency).
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- Reddit search blocked (403/bot detection). HN Algolia worked.
- **Key insight:** The agent identity space is rapidly formalizing at the enterprise level (NIST, IETF, FIDO, RSAC). ZenBin's Ed25519 + key-based publishing auth is well-aligned with all emerging standards. The "publishing as zero-price verified transaction" framing connects ZenBin to the broader agentic commerce ecosystem.

- **Burrow** (Show HN, Apr 2026) — Runtime security for AI agents. Sits between agent and machine, intercepts tool calls. Plain-language policies. Works with Claude Code, Cursor, Copilot, Windsurf, CrewAI, LangChain. Free tier for individuals, paid for teams. Validates the "verify before action" pattern that ZenBin also uses (verify before publish).
- **Remy/MindStudio** (Show HN) — AI agent that builds full-stack TypeScript apps from annotated markdown. Same spec compiles to web app, REST API, conversational agent, or MCP server. Interesting that MCP server is a first-class output target for agents.
- **Statespace** (Show HN, Apr 2026) — Search engine for llms.txt sites. Crawled millions of AI-friendly doc pages. Available as MCP server + SDK + CLI. Validates agent content discovery on the input side.
- **Biopharma Catalyst MCP** (May 11) — Already tracked. Niche domain MCP server.
- **GAIIA MCP** (May 11) — Already tracked. API interrogator MCP server.
- **AI Agent Passport** (May 10, 2 pts) — Already tracked. No changes.

## Update #17 — 2026-05-11 05:50 UTC

- **Burrow** (Show HN, Apr 14, 3 pts) — Runtime security for AI agents. Intercepts tool calls at the framework level with plain-language policies. Free for individuals. Validates the "verify before action" pattern. Same model as ZenBin's verify-before-publish, applied at a different point in the agent lifecycle.
- **Remy/MindStudio** (Show HN) — Agent that compiles annotated markdown specs into full-stack apps. Key insight: **MCP server is now a first-class output target** alongside web apps and APIs. When agents produce MCP servers, they need hosting. Potential ZenBin use case.
- **Statespace** (Show HN, Apr 28, 3 pts) — Search engine for llms.txt sites. Crawled millions of pages. Offers MCP server, CLI, and SDK for agent access. Validates the content discovery pattern — Statespace is input discovery, ZenBin is output publishing.
- **No new direct competitors.** AccessAgent.ai, here.now, VibeDrop unchanged.
- **No new identity/auth standards.** AI Agent Passport, IETF draft, FIDO, NIST, CoSAI all unchanged.
- **Reddit search results were all older threads** — no fresh 2026 discussions on r/LocalLLaMA or r/ChatGPTCoding about agent publishing/identity.
- **Key insight:** Agent security interception (Burrow), content discovery (Statespace), and publishing (ZenBin) are all the same "verify before action" pattern applied at different lifecycle points. This framing could strengthen ZenBin's positioning — "we verify content provenance before it goes live, the same way Burrow verifies tool calls before they execute."

- Initial competitive scan. here.now identified as closest competitor.
- Samma Suit, Manifold, Postiz identified as adjacent.
- No direct competitors found. Agent output publishing gap confirmed.
- Created detailed here.now comparison table.

## Update #2 — 2026-05-10 (13:50 UTC)

- IETF draft-klrc-aiagent-auth-00 published. Validates Ed25519 approach.
- Airbyte Agents launched (150 pts on HN). Input-side solution. ZenBin is output-side.
- Strata/CSA survey: 18% confident in IAM for agents, 44% use static API keys.
- 7-layer agent infrastructure map identified. Publishing not represented.
- Anthropic survey: 80% see measurable ROI from agents.
- CoSAI Agentic IAM spec published.
- Google A2A uses `/.well-known/agent.json` — validates our pattern.

## Update #3 — 2026-05-10 (14:50 UTC)

- AI Agent Passport appeared on HN. Ed25519 + did:web, same crypto as ZenBin. RFC stage.
- Endara launched — MCP server aggregator ("MCP of MCPs" pattern emerging).
- WUPHF — multi-agent workspace with adoption-scored wiki. Agents need publishing.
- StackOverflow MCP explainer — MCP has reached mainstream awareness.
- F500 agent mandate HN thread — enterprise adoption accelerating but creating control anxiety.
- No new direct competitors.

## Update #4 — 2026-05-10 (15:50 UTC)

- FIDO Alliance Agentic Authentication Working Group announced (Google, OpenAI, Amazon, Okta).
- IETF AIMS draft deep dive: authorization is "TODO Security." 53% of MCP servers use static API keys.
- NIST + CoSAI formalize agent identity. Recommend reusing existing standards.
- Key insight: publishing = zero-price verified transaction. Connects to agentic commerce ecosystem.
- No new direct competitors.

## Update #5 — 2026-05-10 (16:50 UTC)

- Airlock (cyborg agent platform) — agents compile to Go binaries, render webpages internally.
- MCPS (mcp-secure.dev) — cryptographic identity layer for MCP. ECDSA P-256. OWASP scan: 41% MCP servers have zero auth.
- Agent-generated static sites identified as real pattern (HN Job Trends, Dependicus, UltraLab).
- No new direct competitors.

## Update #6 — 2026-05-10 (17:50 UTC)

- Terminal Use (YC W26) — "Vercel for filesystem-based agents." Validates agent deployment market.
- ToolMesh — REST APIs → MCP tools via YAML. Credential injection pattern parallels ZenBin's signed tokens.
- AI Agent Passport confirmed live on HN.
- MCP aggregation now a category (Endara + ToolMesh).
- No new direct competitors.

## Update #7 — 2026-05-10 (18:50 UTC)

- FIDO Alliance working group details (Google AP2, Mastercard Verifiable Intent).
- IETF AIMS deep dive: 53% of 5,200+ open-source MCP servers use static API keys.
- NIST + CoSAI formalize agent identity.
- Key insight: publishing = zero-price verified transaction.
- No new direct competitors.

## Update #8 — 2026-05-10 (19:50 UTC)

- AI Agent Passport confirmed on HN (2 pts).
- Lune — MCP server for scientific knowledge grounding.
- Unlinked — MCP server for LinkedIn.
- HN threads: "SWE workflow of the future" and "writing code by hand" reinforce need for traceable agent output.
- No new direct competitors.

## Update #9 — 2026-05-10 (20:50 UTC)

- AI Agent Passport on HN (Ed25519 + did:web, same as ZenBin).
- Airbyte Agents confirmed front-page with benchmarks.
- Daemons (Charlie Labs) — "cleaning up after agents" — validates agent output management pain point.
- Lemma/x402 — ZK proofs for agent payments. did:key identity pattern.
- MCP aggregation category confirmed (ToolMesh + Endara).
- No new direct competitors.

## Update #10 — 2026-05-10 (21:50 UTC)

- AI Agent Passport GitHub confirmed live — Ed25519 + did:web, RFC stage, Python/Node SDKs, registry.agentpassport.dev is live. Schema includes agent_id, owner, capabilities (spend_limit, permissions), trust (verification_level), cryptography (Ed25519). Still early on HN (2 pts).
- Lemma/x402 ZK proofs deep dive — registered x402 extension for agent identity in payment headers. did:key → agentId with role/scope/spendLimit. Publishing = zero-price verified transaction.
- Sigma Guard (Show HN, May 10) — cellular sheaf cohomology for contradiction detection in agent memory. Verify-before-write pattern parallels ZenBin's verify-before-publish.
- Lune (Show HN, May 10) — MCP server for scientific knowledge grounding (luneresearch.com). Adds domain expertise to agents.
- Unlinked (Show HN, May 10) — MCP server for LinkedIn (github.com/larsbaunwall/Unlinked).
- Codebadger (Show HN, May 10) — MCP server for static code analysis with Joern.
- Vdiff (Show HN, May 2) — CLI for reviewing AI-generated code. Tree-sitter + LLM = structured risk reports. Local-first, BYOK. Validates "agent output review" as category.
- HN thread "Is this the SWE workflow of the future?" (9 pts, 9 comments) — F500 mandating agent frameworks, shipping code they don't understand. Traceability gap highlighted.
- DuckDuckGo search blocked (bot detection). Reddit scraping blocked (403).
## Update #11 — 2026-05-10 22:50 UTC

- **AccessAgent.ai identified as DIRECT COMPETITOR** — "Web Hosting for AI Agents." Ethereum wallet auth (personal_sign), zip uploads, agent-readable API guide, 300 prompt ideas, custom domains, stats. Founded Feb 2026. Markets explicitly to agents ("No accounts, no API keys"). Uses secp256k1 (not Ed25519) — not aligned with emerging agent identity standards.
- **MCP ecosystem stats (Presenc AI Q2 2026):** 8,000-12,000 servers (from ~50 at launch), 14M cumulative downloads, 175x growth. Major enterprise adoption (Snowflake, Databricks, Salesforce, GitHub all have official servers). 30-50% community server failure rate. 41% zero auth.
- **MCP 2026 Roadmap** published — transport scalability, agent communication, governance maturation, enterprise readiness.
- **Airbyte Agents benchmarks detailed:** 80-90% fewer tokens than vendor MCPs for cross-system queries. Gong: 80%, Zendesk: 90%, Linear: 75%, Salesforce: 16%.
- **Microsoft "Open Agentic Web" post** (Build 2025) — positions agents as the next internet layer. Validates agent infrastructure thesis.
- **Agent publishing now contested:** 2 direct competitors (AccessAgent.ai, here.now) + custom pipelines. ZenBin differentiates on Ed25519 identity alignment, Markdown-native, `/.well-known/agent.md` discovery.
- Reddit search blocked (403). HN Algolia worked.
- No new adjacent competitors beyond AccessAgent.ai.

## Update #12 — 2026-05-10 23:50 UTC

- **AI Agent Passport on HN** (May 10) — 2 pts, 1 comment. Still early traction. GitHub repo confirmed live with Python/Node SDKs, registry.agentpassport.dev live.
- **AIAgentMark™ discovered** (aiagentmark.com) — Commercial entity behind "AI Agent Passport™" branding. Self-sovereign identity standard v1.0 for personal AI agents. DigiCert whitepaper positions AI Agent Passport as layer 2 of a 3-layer trust architecture (DNS enforcement → agent identity → hardware-rooted model protection). Enterprise PKI credibility for Ed25519-based identity.
- **Airbyte Agents press coverage confirmed** — Business Wire/Morningstar, Yahoo Finance, simplenews.ai picked up the May 5 launch. Mainstream tech press validation for "agent infrastructure" as a market.
- **New MCP servers (Show HN, May 10):** Unlinked (LinkedIn), Lune (science grounding), Codebadger (static analysis with Joern), Sigma Guard (memory contradiction detection via sheaf cohomology). Mochi.js (44 pts) — browser automation library, not MCP but relevant to agent automation.
- **F500 agent mandate thread** — "Is this the SWE workflow of the future?" (9 pts, 9 comments) highlights traceability gap.
- **Key insight:** DigiCert (major PKI/CA) endorsing Ed25519-based agent identity validates ZenBin's auth direction at the enterprise level.
- Reddit search blocked (403). HN Algolia worked.
- No new direct competitors.

## Update #13 — 2026-05-11 01:50 UTC

- **Airbyte Agents (continued traction)** — CEO Michel Tricot's detailed HN post about Airbyte Agents (Context Store for agents). Key quote: "Most MCPs don't fix the data problem. They're thin wrappers over APIs, so agents inherit their weak primitives." Benchmarks: 80-90% fewer tokens than vendor MCPs. Validates input-side agent infrastructure market.
- **AI Agent Passport reappeared on HN (May 10)** — 2 pts, 1 comment. Still early traction but the GitHub repo is live with Python/Node SDKs. Ed25519 + did:web, RFC stage. Registry live at registry.agentpassport.dev.
- **Lyfe.ninja (revocable digital signatures for AI content)** — Ask HN post (3 pts, 2 comments). "Know your agent" — verifying AI-generated content provenance. Key insight: revocable signatures for agent output, client-side verification, tampering detection. C2PA supplementary. Very aligned with ZenBin's content provenance angle.
- **AgentPages (GitHub Pages for Agents)** — Show HN (1 pt, 3 comments). Agents live in GitHub repo, maintain a static site via GitHub Actions cron. Researches topics, edits Astro source, deploys to GitHub Pages. Another custom publishing pipeline that ZenBin could simplify.
- **accept.md (Markdown content negotiation)** — HTTP Accept: text/markdown returns Markdown instead of HTML. No duplicate routes, no separate .md files. Works with Next.js and SvelteKit. Validates ZenBin's Markdown-native thesis — agents and LLMs prefer Markdown.
- **WUPHF wiki layer (260 pts, 115 comments)** — Karpathy-style LLM wiki maintained by agents using markdown + git. Provenance visible in git log. 85% recall@20 on BM25. Validates that agent-maintained Markdown is a real, high-engagement pattern.
- **GAIIA MCP server** — Free/OSS agentic API interrogator. New MCP server for API discovery (May 11).
- **Unlinked MCP server** — MCP server for LinkedIn (3 pts, 1 comment). Another MCP server entering the ecosystem.
- **Lune MCP server** — Scientific knowledge grounding for agents (1 pt, 0 comments).
- **Codebadger MCP server** — Static code analysis with Joern via MCP (1 pt, 0 comments).
- **iClaw (Apple Intelligence agent)** — Agent built on Apple's 3B on-device model. Explicit permission model for create/delete operations. 6 pts. Shows agent safety patterns maturing.
- **No new direct competitors found.** All existing competitors (AccessAgent.ai, here.now, VibeDrop) unchanged since last scan.
- Reddit search returned only older/irrelevant results — no fresh discussions found on r/LocalLLaMA or r/ChatGPTCoding about agent publishing/identity.