# AI Agent Infrastructure Landscape

Last updated: 2026-05-15

## MCP (Model Context Protocol) Ecosystem

### Manufact / mcp-use — MCP Developer Tooling
- **What:** Open-source full-stack SDK for building MCP servers and clients, plus Inspector tool
- **Key features:**
  - HMR (Hot Module Replacement) for MCP — live reload using protocol primitives (notifications/tools/list_changed)
  - Browser-based Inspector: localhost chat UI for testing MCP servers, BYOK
  - Tunnel feature: stable public URL for testing on real clients (ChatGPT, claude.ai) without reinstalling
  - Automated cross-client testing: browser agents install apps and run tests on actual clients
  - Screenshot + screen recording of full conversations for debugging and team sharing
  - CLI integration: `npx @mcp-use/inspector` or `npx create-mcp-use-app`
- **Founder:** Pietro (pzullo on HN)
- **URL:** https://manufact.com, https://github.com/mcp-use/mcp-use
- **Signal:** MCP development is painful enough that dev tooling is a funded company. The testing pain point is real — same model, different clients = wildly different behavior.

### Ledgr — Self-hosted Finance MCP
- **What:** Self-hosted personal finance app with Plaid bank sync AND an MCP server
- **Signal:** MCP is becoming a standard feature, not a novelty. "Our app has an MCP server" is now a differentiator.
- **URL:** https://github.com/KenTaniguchi-R/ledgr

### Hoop — Infra Access Gateway with MCP
- **What:** Open-source infrastructure access gateway that exposes session recordings via MCP server
- **Use case:** Agents query their own session history, surface insights like "you run this query every week"
- **Signal:** MCP as a query interface for data. Not just tool-calling — making organizational data agent-accessible.
- **URL:** https://github.com/hoophq/hoop

### Ably — Durable Sessions for AI Agents
- **What:** Realtime infrastructure company (10-year history, trillions of transactions) formalizing "Durable Sessions" as a category for AI agents
- **Key insight:** After 40+ customer discovery calls, found that 35/37 AI platforms have no stream resumption, 33/37 can't detect agent crashes. The transport layer between agent and user is broken.
- **Concept:** "Durable Sessions" — persistent sessions that survive disconnects, ordered delivery with catch-up, multi-device fan-out, presence, bidirectional comms. The same infrastructure WhatsApp uses for humans, but for agents.
- **Ecosystem:** ElectricSQL, EMQX, Convex, Vercel all converging on same pattern. Vercel building DurableAgent class. TanStack AI shipping ConnectionAdapter.
- **Analogy:** Durable Execution (Temporal) made backends crash-proof. Durable Sessions make the experience crash-proof. Complementary layers.
- **URL:** https://ably.com/blog/durable-sessions-infrastructure-layer-ai-agents, https://durablesessions.ai

### MCPSafe — Security Scanner for MCP Servers
- **What:** Free security scanner for MCP servers using 5-LLM consensus
- **Approach:** Multiple LLMs audit MCP server configurations and flag security concerns
- **Signal:** MCP security is becoming a concern as adoption grows. Tooling emerging to audit MCP servers.
- **URL:** https://mcpsafe.io

### Sysdig — Headless Cloud Security
- **What:** Cloud security company launching "Headless Cloud Security" — security capabilities consumable via APIs, AI agents, IDEs, CI/CD
- **Key insight:** Engineering teams rapidly adopting agentic and CLI-first workflows (Claude Code, Cursor, MCP servers). Security teams lag by 6-18 months but the gap won't hold.
- **Signal:** Enterprise security tools building agent-first consumption models. MCP as input standard is taken for granted.
- **URL:** https://www.sysdig.com/learn-cloud-native/what-is-headless-cloud-security

### Torrix — Self-Hosted LLM Observability
- **What:** Single Docker container LLM observability backed by SQLite — no Postgres, no Redis
- **Key features:**
  - HTTP proxy or Python/Node SDK for LLM call logging (tokens, cost, latency, traces)
  - Cost forecasting, hard budget caps, PII masking, model routing, evals
  - MCP server so AI assistants can query your own logs
  - OTLP/HTTP ingestion for OpenTelemetry users
- **Target:** Teams logging hundreds to low thousands of LLM calls per day
- **Pricing:** Community edition free (1 user, 7-day retention). Pro adds teams, RBAC, 30-day retention.
- **Signal:** Agent observability fragmenting into sub-categories. "Simple self-hosted" as a positioning. Agents querying their own logs via MCP is a notable pattern.
- **URL:** https://github.com/torrix-ai/install

### Recursant — Mesh-based Agent Control Plane
- **What:** AI agent governance platform using Istio/sidecar pattern for agent isolation at network layer
- **Approach:** Govern agents across stacks and clouds for compliance. Sidecar proxy pattern from service mesh applied to agents.
- **Signal:** Enterprise agent governance is becoming a category. Compliance risk from agents using different frameworks/runtimes.
- **URL:** https://github.com/ajensenwaud/recursant

### Voker (YC S24) — Agent Analytics
- **What:** Agent analytics platform — visibility into what users ask agents and whether agents deliver
- **Key primitives:** Intents, Corrections, Resolutions. Processes LLM calls via SDK to annotate conversations.
- **Insight:** 90%+ of YC founders only know agents fail from customer complaints. No structured analytics for agent products.
- **Signal:** Agent observability is fragmenting — traces (existing), evals (existing), analytics (new). Voker owns the "what are users asking" layer.
- **URL:** https://voker.ai

### Graphmind — Persistent Memory + Graph for Agents
- **What:** MCP server + CLI + GUI that builds a graph of functions/classes/calls (AST parsing) + semantic embeddings for codebase navigation
- **Claim:** Same query goes from 1.4M tokens (grep) to 257 tokens (graph query). 5,700x reduction.
- **Signal:** Agent memory/context optimization is a hot area. MCP servers as the delivery mechanism for specialized intelligence.
- **URL:** https://github.com/aouicher/graphmind

### Elecz — MCP Server for Electricity Data
- **What:** Read-only MCP server + REST API for real-time electricity prices across 40 countries / 100+ bidding zones
- **Signal:** MCP servers being built for every niche data domain. The "API wrapper as MCP server" pattern is commoditized.

### Monghoul — MongoDB GUI with Built-in MCP
- **What:** Desktop MongoDB GUI (Tauri + Bun + tRPC) with schema-aware autocomplete and built-in MCP server for AI control
- **Signal:** MCP as a feature checkbox for developer tools. "Also has an MCP server" is becoming expected.

### Ardent (YC P26) — Postgres Sandboxes for Coding Agents (May 2026)
- **What:** Database sandboxes for AI coding agents — instant (<6s) production-like clones via logical replication + DDL triggers
- **Approach:** Kafka-scaled replication stream onto read replicas with copy-on-write + autoscaling compute (Neon branching engine)
- **Key features:**
  - No platform migration required — works on any hosted Postgres
  - <6s clone spin-up, even at TB scale
  - Proxy layer for access control, credential leak prevention
  - PII redaction via SQL that runs on branches before delivery
  - BYOC for full data residency
  - Anonymization for development clones
- **Signal:** Infrastructure for agents to safely test their work before shipping. The sandbox→verify→ship pattern parallels ZenBin's publish→verify→attest flow. Ardent does it for DB changes; ZenBin does it for content.
- **URL:** https://www.tryardent.com/

### Deckard — iCloud MCP Server (May 2026)
- **What:** MCP server for Apple iCloud services with per-agent identity and ACL
- **Signal:** Personal multi-agent identity model maturing. When you run 4+ agents across machines, per-agent auth is essential. The MCP ecosystem is moving from "any client can call any tool" to "authenticated, scoped, identity-aware tool access."
- **URL:** https://mike.lapidak.is/posts/icloud-mcp-server-deckard/

### MementoVault — Self-hosted AI Context Manager via MCP (May 2026)
- **What:** Open-source, self-hosted context manager for AI agents served via MCP
- **Signal:** Persistent agent context is becoming a product category. MCP as the delivery mechanism for structured memory.
- **URL:** https://mementovault.meltinbitfarm.cloud

### DiscordMcp — Server Control via MCP (May 2026)
- **What:** Controlling servers through MCP
- **Signal:** MCP expanding from data access to operational control.

### N8n-MCP — Workflow Generation via MCP (May 2026)
- **What:** MCP server for generating and debugging n8n workflows
- **Signal:** MCP as the interface for workflow automation. Agents creating and debugging workflows.

### Sinain — Screen/Audio Context into Knowledge Graph + MCP (May 2026)
- **What:** Capture screen and audio context into a local knowledge graph, share via MCP or peer-to-peer
- **Signal:** Peer-to-peer agent context sharing. Decentralized knowledge graphs as agent memory.

### vdiff — Agent Code Review with Structural Metrics (May 2026)
- **What:** CLI that analyzes git diffs using tree-sitter AST + LLM reasoning. Structured output with risk scores, dependency graphs, blast radius, review memory.
- **Key signal:** Runs locally, BYOK, no code leaves your machine. "I didn't want the tool publishing the code to a third-party server."
- **Signal:** Agents reviewing agent output (code) with structured evidence. The verification-before-merge pattern. Local-first trust model.
- **URL:** https://github.com/4bk/vdiff

## Market Data

### Anthropic 2026 State of AI Agents Report
- **Source:** Anthropic + Material research firm, 500+ technical leaders surveyed
- **Key findings:**
  - 57% deploy agents for multi-stage workflows; 16% for cross-functional processes
  - 90% use AI for development; 86% deploy agents for production code
  - Data analysis + report generation: 60% (highest impact use case)
  - Internal process automation: 48%
  - 56% plan research and reporting agents in next year
  - 80% report measurable economic returns
  - Top challenges: integration (46%), data access/quality (42%), change management (39%)
- **Signal for ZenBin:** Report generation is the #2 enterprise use case for agents. Agents are producing output at scale. No one builds infrastructure for that output.
- **URL:** https://claude.com/blog/how-enterprises-are-building-ai-agents-in-2026

## Agent Builders / Embedded AI

### Gigacatalyst — Embedded AI Builder for SaaS
- **What:** AI customization layer that lets non-technical users build governed apps via natural language inside your SaaS product
- **How it works:** Connects to product APIs, learns data model + design system, generates apps with validation + sandboxing + proxy layer for auth/tenant isolation
- **Traction:** 2000+ daily users, 900+ apps built, 70% 30-day retention
- **Signal:** "Embedded AI" is a category. SaaS companies want agents that build inside their platform, not outside it.
- **URL:** https://gigacatalyst.com

### Hypercubic / Hopper — Agentic Interface for Mainframes
- **What:** TN3270 terminal + mainframe-aware panels + AI agent that operates across z/OS surfaces
- **Design principle:** Preserve fidelity of the environment, make it accessible to agents
- **Signal:** Enterprise agents operating inside legacy systems. Sensitive operations require approval; terminal always visible.
- **URL:** https://www.hypercubic.ai/hopper

## Key Trends

1. **MCP is the standard connector** — Not just a protocol, now the default way agents connect to tools/data. Three separate HN posts this week featuring MCP.
2. **Dev tooling around MCP is maturing** — Inspector, HMR, tunnel testing, cross-client automation. The "Vite for MCP" moment.
3. **Agent-specific auth is emerging** — AAuth, IETF draft, OpenID whitepaper, AI Agent Passport. The industry knows bearer tokens aren't enough.
4. **Embedded AI in SaaS** — Gigacatalyst pattern: agents build inside existing products, governed by the host platform.
5. **Agent output is an afterthought** — Everyone's focused on input (MCP, tools, context) and auth. Nobody's building dedicated output/publishing infrastructure. This is ZenBin's gap.
6. **Durable Sessions as a category** — Ably, ElectricSQL, Convex, Vercel all converging on session persistence for agents. The transport layer between agent and user is becoming infrastructure.
7. **Agent governance/control planes** — Recursant (Istio/sidecar pattern for agent governance), Voker (agent analytics/primitives). The "how do we control these things" layer is forming.
8. **MCP dev tooling is a funded category** — Manufact raised funding to build "Vite for MCP." HMR, Inspector, tunnel, cross-client testing.

### Ardent (YC P26) — Postgres Sandboxes for Coding Agents
- **What:** Instant production-like database clones (sandboxes) for coding agents to test against
- **How it works:** Logical replication + DDL triggers, copy-on-write branching via Neon, spin up in <6s even at TB scale
- **Key features:** Proxy layer for access control, credential isolation, split-plane BYOC architecture, PII redaction via registered SQL
- **Traction:** YC P26 launch, 89 pts on HN, 35 comments, front page (up from 52→80→89 pts)
- **Signal:** Sandbox/isolation infra for agents is a funded category. Pattern: give agents safe environments to work in. Still input/testing focused — output/publishing unaddressed.
- **URL:** https://www.tryardent.com/

### Sinain — Context OS for Agents
- **What:** Captures screen + audio continuously, distills into local knowledge graph. Accessible via MCP, web UI, and HUD overlay.
- **Key features:**
  - 82.8% IPR on LongMemEval (ICLR 2025)
  - Peer-to-peer context sharing via WebRTC (data never touches a server)
  - 4 privacy modes: off / standard (auto-redact) / strict / paranoid (fully local, Ollama + whisper.cpp)
  - HUD overlay invisible to screen capture
  - Agent-agnostic: feeds any MCP-compatible agent (Claude Code, Codex, Goose, Junie)
- **Signal:** Agent context/input getting rich and continuous. "Context OS" — captures everything an agent might need. Still input-focused. No output counterpart.
- **URL:** https://anthillnet.com, https://github.com/anthillnet/sinain-hud

### Recursant (Updated) — Full Mesh Architecture
- **What:** Enterprise agentic mesh platform — "Istio for AI agents"
- **Architecture:** Control plane (Flask + React + PostgreSQL + Redis + Kafka) + data plane (Python sidecar per agent pod)
- **Key features:** mTLS between agents, A2A protocol, interceptor pipeline (auth/authz/compliance/PII redaction/guardrails/audit/rate limiting)
- **Agent-agnostic:** Works with LangChain, LangGraph, CrewAI, custom HTTP
- **Full mortgage origination demo:** Hub-and-spoke NetworkPolicy enforcement, audit trail
- **Signal:** Service mesh pattern applied to agents. The k8s/cloud-native evolution is playing out for agent infra.
- **URL:** https://github.com/ajensenwaud/recursant

### AgentGate — Policy Decision Point for Agents
- **What:** Open-source PDP that sits between AI agents and their tools, evaluating every action against identity, scope, purpose, and behavior
- **Key features:**
  - Trust scoring: identity 25%, delegation chain 25%, purpose alignment (embeddings) 30%, behavioral velocity 20%
  - Scope attenuation across delegation chains
  - Three outcomes: PERMIT / ESCALATE / DENY
  - Natural language policy rules
  - LangChain integration via AgentGateToolkit
- **Signal:** Behavioral authorization is new. Purpose alignment via embeddings is novel. Input/control focused.
- **URL:** https://github.com/ElamOlame31/agentgate-public

### Deckard — Per-Agent Identity + ACL for Apple Services MCP Server
- **What:** Mac-resident MCP server for Mail, Calendar, iCloud Drive, Voice Memos, Reminders, Contacts. Per-agent tokens, scoped ACLs, content filtering (both directions), full audit log.
- **Origin story:** Author runs multiple agents (Claude Code on Mac, OpenClaw on Proxmox VM, Paperclip agent on Linux LXC, Hermes on Telegram). Existing MCP servers gave all-or-nothing access. Each agent gets its own token + ACL profile.
- **Key insight:** "Which agent is calling?" Once you ask that question, the answer can't be "it doesn't matter." Per-agent identity and scoped access is essential when agents cross trust boundaries.
- **Security model:** Rocky (local Mac) gets full surface but mail.send still requires approval dialog. Eleanor (tailnet) gets read-only mail+calendar. Each agent's scope is bounded.
- **Signal:** The personal agent identity/access model is maturing beyond single-agent-on-single-machine. Real deployments need per-agent auth + scoped access. Output/publishing is still unaddressed — who approved this agent to publish on behalf of this person?
- **URL:** https://github.com/lapidakis/Deckard

### MementoVault — Self-Hosted AI Context Manager via MCP
- **What:** Open-source, self-hosted AI context manager served via MCP protocol. Keeps AI context structured and reusable across MCP-compatible clients.
- **Signal:** MCP as a delivery mechanism for agent memory/context. The pattern of "MCP server as [domain] interface" continues to expand.
- **URL:** https://mementovault.meltinbitfarm.cloud

### Sunex Optics — MCP Server for Camera Hardware
- **What:** MCP server for choosing best lens/CMOS image cameras
- **Signal:** Even niche hardware domains now ship MCP servers. The "API wrapper as MCP server" pattern is fully commoditized.
- **URL:** https://sunex-ai.com

### DiscordMcp — Controlling Servers Through MCP
- **What:** MCP server for controlling Discord servers
- **Signal:** MCP as a control/management interface, not just data retrieval. Agents operating infrastructure via MCP.
- **URL:** https://blog.rastrian.dev/post/discordmcp-controlling-servers-through-mcp

### N8n-MCP — Workflow Generation MCP Server
- **What:** MCP server for generating and debugging n8n workflows
- **Signal:** MCP as a workflow automation interface. Agents composing and debugging automation pipelines.
- **URL:** https://github.com/AutomateLab-tech/n8n-mcp

### SicariusGuard — Solana Token Safety Oracle MCP Server
- **What:** MCP server that acts as a token safety oracle for AI agents on Solana
- **Signal:** MCP servers as trust/safety layers for agents in financial contexts. Agents need verified data to make safe decisions.
- **URL:** https://github.com/Chronolapse411/sicarius-guard

### Auto Agent Protocol — A2A Profile for Car Dealerships
- **What:** Open A2A profile enabling AI agents to interact with car dealerships. Domain-specific A2A implementation for automotive retail.
- **Signal:** A2A is moving from theory to domain-specific implementations. When domain-specific A2A profiles appear, agent-to-agent communication is becoming practical. Output publishing is the other half — agents need to produce, not just converse.
- **URL:** https://github.com/auto-agent-protocol/auto-agent-protocol

### DialtoneApp Network — Bot Commerce Payments
- **What:** Card payments infrastructure for bot commerce. Bots discover products, request purchases, cards charged when owner-approved rules allow.
- **Key features:** .well-known/* files for bot-allowed products (like robots.txt for commerce), registered card management, rule-based approval
- **Explored:** Stripe machine payments, Skyfire, Crossmint, Worldpay, Google Universal Commerce Protocol, MCP, A2A
- **Signal:** Agent commerce is becoming real. When agents can transact, they need to publish receipts, confirmations, reports. The output gap extends to financial transactions.
- **URL:** https://dialtoneapp.com

### Kantext — Context as a First-Class Data Type
- **What:** Treats AI context as a composable, layered data structure with structural provenance (not just vector DB or graph)
- **Key features:**
  - Declared Language: Declarable Shapes with layers for Value, Meaning, Space, Bond, Compose, Boundary
  - Context-Addressable Storage (CxAS): content + structure separated, Blake3 hashed, stored in global append-only DashMap
  - Holograph: 2-stage k-way merge of up to 62 Frames, using BpTree/EliasFano/WaveletMatrix (pure Rust)
  - Cryptographic sealing to Git commits ("grounded" — every composition traceable to source commit)
  - 20MB/s parse→holograph, ~1-75µs query latency, 880K points/sec composition
- **Signal:** Provenance is showing up in context management. Git-based sealing is an interesting pattern but doesn't address real-time publishing. The idea that agent output should be cryptographically traceable is spreading.
- **URL:** https://kantext.dev

### Manufact/mcp-use — MCP Dev Tooling (Updated May 14)
- **What:** Open-source full-stack SDK for building MCP servers and clients, plus Inspector dev tooling
- **New detail (HN post, 6 pts, 0 comments):** Detailed Show HN about how they made MCP development feel good
  - HMR for MCP using protocol primitives (notifications/tools/list_changed) — proper hot reload without session restart
  - Browser-based Inspector: localhost chat UI, BYOK, cross-client testing with browser agents
  - Screenshot + screen recording of full agent conversations for debugging and team sharing
  - Testing pain: same model on different clients (GPT-5.5 local vs ChatGPT) yields wildly different behavior
  - "The Vite for MCP" — local dev loop + cross-client testing
- **URL:** https://manufact.com/blog/mcp-testing

## Agent Content Publishing (Nascent)

### Comedy Podcast Agent Pipeline — Fully Automated Content Creation
- **What:** Agent pipeline that takes trending topics and produces fully rendered ~22-minute comedy podcast episodes with three AI characters
- **How it works:** Premise ideation → research → outline → script writing (writers' room with punch-up passes and verification gates) → voice synthesis (ElevenLabs) → music bed mixing → publishing to Spotify
- **Stack:** Temporal for durable workflow orchestration, Gemini for scripts, gollem agents with structured outputs, Postgres + Apache AGE for graph queries, Qdrant for vector search, ElevenLabs for multi-voice dialogue
- **Key feature:** Verifier gate checks factual claims, forbidden phrases, and character voice consistency before rendering
- **Signal:** Agents are already creating finished, publishable content. But the publishing step (to Spotify) is manual/bespoke — no standard infrastructure for agent output. This is exactly the gap ZenBin fills.
- **URL:** https://news.ycombinator.com (HN story)

### Probus — 3-Agent Vulnerability Scanner
- **What:** AI vulnerability scanner using three isolated agents — Analyst (picks files to scan), Researcher (finds bugs), QA (independently rejects false positives)
- **Real results:** Found bugs in n8n (JWT logging), Vercel AI SDK (role injection, schema bypass, prototype collision), LangGraph.js (NoSQL injection), browser-use (path traversal), Haystack (SSRF, path traversal, unbounded reads)
- **Key design insight:** QA agent must be isolated from Researcher's reasoning — if it sees the reasoning, it just agrees (agreement bias). Separate context = independent verification.
- **Cost:** ~$0.50/file with Qwen 3.6 + DeepSeek v4 Pro. Anthropic ~10x.
- **Signal:** Multi-agent verification patterns maturing. Isolated verification agents are a trust pattern. Applies to publishing: a verifier agent could sign off on content before it's published via ZenBin, creating a trust chain.
- **URL:** https://github.com/etairl/Probus

### Plato (Purple Pincher) — Agents Publishing Their Failures
- **What:** AI agents with shared memory that publicly share everything they got wrong
- **Signal:** Agents publishing their output — even failures. The idea that agents should have public, transparent output is growing. ZenBin formalizes this with signed, attributed publishing.
- **URL:** https://plato.purplepincher.org/

### Ask HN: What Features Are Missing in AI Agent Frameworks?
- **What:** Community discussion (May 14, 2026) asking what gaps exist in agent frameworks
- **Examples given:** Better memory systems, workflow debugging, human-in-loop controls, distributed execution, lower latency orchestration
- **Signal:** Direct signal that the community's framework gaps are all input/processing side. Output/publishing is not mentioned — not because it's solved, but because it's not yet recognized as a framework concern. Opportunity for ZenBin to define the category.
- **URL:** https://news.ycombinator.com/item?id=48132357

### AI Coders Carrying Half-Open Laptops (Business Insider)
- **What:** Mainstream press coverage of AI coding agents requiring constant human oversight
- **Traction:** 20 pts on HN, 32 comments
- **Signal:** AI agents are now mainstream cultural news. The cultural moment of agents-as-everyday-tools has arrived. When agents become everyday, infrastructure for what they produce becomes necessary.
- **URL:** https://www.businessinsider.com/coders-keep-laptops-open-in-public-ai-agent-2026-5