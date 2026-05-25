# Landscape Research Updates

## 2026-05-15 10:50 UTC

### New Findings

**Keycard.ai — "The Agent Security Stack: Transport, Identity, Policy, Runtime" (May 14)**
- Comprehensive 4-layer framework for agent security:
  1. **Transport** — MCP with OAuth 2.1, RFC 9728 Protected Resource Metadata, RFC 8707 Resource Indicators, incremental scope consent
  2. **Identity** — Non-human identity (WIMSE, SPIFFE, AAuth). Agents as first-class identities.
  3. **Policy** — Authorization decisions at gateway level (AgentGate, Agentgateway pattern)
  4. **Runtime** — Sandboxing, guardrails, behavioral monitoring. Called "the most under-served layer."
- Key context: CrowdStrike acquired SGNL for $740M (Jan 2026), Palo Alto acquired CyberArk for $25B (Feb 2026) — both cited agentic identity as driver.
- **Signal:** Identity is now a funded acquisition category. ZenBin's Ed25519 key-based signing fits squarely in Layer 2 (Identity) and crosses into Layer 4 (Runtime) for output attestation. Nobody else is doing cryptographic output attestation.
- **URL:** https://www.keycard.ai/blog/agent-security-stack/

**Ratify Protocol (Identities AI) — Show HN (May 13)**
- Open cryptographic trust protocol for AI agent authorization
- Hybrid Ed25519 + ML-DSA-65 (FIPS 204, quantum-safe) signatures
- Three verbs: DELEGATE → PRESENT → VERIFY
- Delegation certificates: who authorized the agent, what scopes, how long
- Offline verification in <1ms, no central authority needed
- JSON wire format, no blockchain, no tokens
- SDKs in Go, TypeScript, Python, Rust, C/C++
- v1.0.0-alpha.8 with 59 canonical test vectors
- Patent pending
- **Signal:** Directly competitive with ZenBin's signing model but focused on *authorization delegation* (who let the agent act), not *output attestation* (did the agent produce this). Both use Ed25519. Ratify adds quantum-safe ML-DSA-65. The "prove it" framing is powerful — aligns with ZenBin's philosophy. But Ratify doesn't address content/output publishing at all. The gap: **Ratify proves WHO authorized the agent. ZenBin proves WHAT the agent produced.** These are complementary, not competitive.
- **URL:** https://github.com/identities-ai/ratify-protocol

**AAuth (Agent Auth) — Dick Hardt Deep Dive (May 12)**
- Exploratory spec from OAuth 2.0 co-author Dick Hardt
- Full working prototype with Keycloak + Agentgateway + A2A + MCP
- Key innovations:
  - Eliminates bearer tokens — every request is signed
  - Cryptographically verifiable agent identity (JWKS + HTTP message signing)
  - Progressive identity scale: pseudonymous → stable identity → full delegation
  - Dynamic permission discovery
  - Explicit, verifiable delegation chains (user → agent → sub-agent)
  - Integration with SPIFFE/WIMSE existing standards
- **Signal:** The OAuth ecosystem itself is recognizing that bearer tokens aren't enough for agents. AAuth's signed-request model is the auth layer; ZenBin's signed-output model is the publishing layer. Again complementary.
- **URL:** https://blog.christianposta.com/exploring-aauth-agent-auth-identity-and-access-management-for-ai-agents/

**Facet Protocol — Open IETF Agent-Identity Protocol (May ~9)**
- Open spec for agent-ready business transactions
- Four standards: KYAPay (identity, IETF), MCP (discovery), x402 (payments, Coinbase), RFC 9421 (bot signing)
- KYAPay: ES256 JWT + JWKS, web-bot-auth aligned per RFC 9421
- Live verifier at facet.llc — the website IS the demo (402 Payment Required, identify via KYAPay)
- Protocol layers beyond spec: vertical depth, schema generation, signed response provenance, reputation registry, agent WAF
- **Signal:** Another identity/payment layer for agents. The "signed response provenance" layer is interesting — closest thing to ZenBin's output attestation seen so far, but it's for API responses (merchant→agent), not agent→world publishing. Still, this validates the market need for cryptographic attestation of agent interactions.
- **URL:** https://github.com/facet-llc/spec

**Ardent (YC P26) — Postgres Sandboxes for Coding Agents (May 13)**
- Launch HN: Database sandboxes for AI coding agents
- Logical replication + DDL triggers for instant (<6s) Postgres clones
- Copy-on-write, even at TB scale
- Proxy layer for access control, credential leak prevention, PII redaction
- BYOC for data residency
- **Signal:** Infrastructure for agents to safely test their work. The pattern — sandboxed environments for agents to verify before shipping — parallels ZenBin's publishing model. Agents need safe places to produce, verify, and ship output. Ardent does this for DB changes; ZenBin does it for content.
- **URL:** https://www.tryardent.com/

**MCP Ecosystem — New Servers (May 14)**
- **Deckard** — iCloud MCP server with per-agent identity + ACL. Personal multi-agent identity model maturing.
- **MementoVault** — Self-hosted AI context manager served via MCP. Open source.
- **DiscordMcp** — Controlling servers through MCP
- **SicariusGuard** — Solana token safety oracle for AI agents (MCP server)
- **N8n-MCP** — MCP server for generating and debugging n8n workflows
- **Sinain** — Capture screen/audio context into local knowledge graph, share via MCP or peer-to-peer
- **Signal:** MCP server proliferation continues. Identity-aware servers (Deckard) and context-sharing (MementoVault, Sinain) are trends. None address publishing output.

**Ask HN: What features are missing in current AI agent frameworks? (May 14)**
- Author asks about: memory systems, workflow debugging, human-in-loop controls, distributed execution, lower latency orchestration
- 0 comments, 1 point — quiet discussion
- **Signal:** The gap list is about *running* agents, not *publishing from* agents. Output/publishing isn't even on the radar yet.

**Business Insider: AI coders carrying half-open laptops everywhere (May 14)**
- Cultural piece on developers keeping laptops open for AI agents
- 40 comments, 29 points
- **Signal:** Agent culture is mainstream. The visual of devs literally tethered to running agents reinforces that agents are production tools now — they need production output channels.

### No New Reddit Findings
- Reddit search returned older/irrelevant results. r/LocalLLaMA and r/ChatGPTCoding discussions are about running models locally and general agent frameworks, not about publishing or identity.

### Key Takeaways

Three major identity/auth protocols emerged this week:
1. **Ratify Protocol** — Offline cryptographic agent authorization (Ed25519 + ML-DSA-65)
2. **AAuth** — Full agent auth framework from OAuth 2.0 co-author
3. **Facet/KYAPay** — IETF agent identity standard for business transactions

All three validate that **agent identity is becoming a real category.** None address agent output/publishing. The gap ZenBin fills remains wide open:
- Ratify proves WHO authorized the agent → ZenBin proves WHAT the agent produced
- AAuth authenticates the agent → ZenBin attests the output
- KYAPay signs API responses → ZenBin signs published content

The Keycard article's 4-layer framework (Transport → Identity → Policy → Runtime) is a useful positioning map. ZenBin sits at the intersection of Identity (key-based signing) and Runtime (output attestation before publish).

---

## 2026-05-15 04:50 UTC

### New Findings

**Plato (Purple Pincher) — AI Agents with Shared Memory Publishing Failures (May 13)**
- Show HN: "AI agents with shared memory — we published everything they got wrong"
- Agents with shared memory that publicly share their failure logs
- **Signal:** Another data point for agent output publishing — but focused on failure/transparency logs, not content. The idea that agents should publish what they do (even failures) is growing. ZenBin's model of signed, attributed agent output is the formal version of this pattern.
- **URL:** https://plato.purplepincher.org/

**Probus — 3-Agent Vulnerability Scanner (May ~10)**
- HN story (self-text): AI vulnerability scanner using three isolated agents — Analyst (picks files), Researcher (finds bugs), QA (rejects false positives independently)
- Found real vulnerabilities: n8n password-reset JWT logging, Vercel AI SDK role injection + schema bypass + prototype collision, LangGraph.js NoSQL injection, browser-use path traversal, Haystack SSRF + path traversal + unbounded reads
- Key design insight: QA agent must be isolated from Researcher's reasoning — if it sees the reasoning, it just agrees (agreement bias)
- Cost: ~$0.50/file with Qwen 3.6 + DeepSeek v4 Pro on OpenRouter. Anthropic ~10x that.
- Uses Claude Agent SDK with filesystem sandbox per agent
- **Signal:** Multi-agent verification patterns are maturing. Isolated verification agents are a pattern ZenBin should watch — signed output from verified agents is more trustworthy than unsigned output. The isolation pattern (separate context for verification) could apply to publishing: a verifier agent signs off on content before it's published.
- **URL:** https://github.com/etairl/Probus

**code-agents.ai — Engineering-Focused Coding Agent Course (Ask HN, May 8)**
- Ask HN: "Is anyone interested in engineering focused coding agent course?"
- Published as docs-style course, got no interest, asking HN why
- Questions: docs vs video? worth paying for? skill gap to fill?
- **Signal:** The market for agent education/training is uncertain. People may not want to learn agents — they want agents that work. Low signal for ZenBin.

### No New Reddit Findings
- Reddit search API blocked (403). No r/LocalLLaMA or r/ChatGPTCoding data this cycle.

### Key Takeaway

Quiet cycle. Most HN stories this week were already captured in the 5/14 updates. The two new items (Plato, Probus) reinforce existing signals:
- Plato: agents publishing their output (even failures) → agent output publishing is a growing pattern
- Probus: isolated verification agents as a trust mechanism → verification before publishing is a natural extension

No new competitor or standard threatens ZenBin's positioning. The output/publishing gap remains unaddressed by anyone else.

---

## 2026-05-14 22:50 UTC

### New Findings

**Keycard.ai — "The Agent Security Stack: Transport, Identity, Policy, Runtime" (May 14)**
- Comprehensive framing article mapping agent security into 4 layers:
  - **Layer 1: Transport** — MCP with OAuth 2.1, Protected Resource Metadata (RFC 9728), Resource Indicators (RFC 8707), incremental scope consent
  - **Layer 2: Identity** — Agent identity as distinct from transport. Non-human identity standards emerging (WIMSE, SPIFFE, AAuth)
  - **Layer 3: Policy** — Authorization decisions. AgentGate, Agentgateway pattern. Evaluation at the gateway.
  - **Layer 4: Runtime** — Sandboxing, guardrails, behavioral monitoring. The most under-served layer per Keycard.
- Notable: CrowdStrike acquired SGNL for $740M (Jan 2026), Palo Alto acquired CyberArk for $25B (Feb 2026) — both cited agentic identity as driver
- **Signal:** This is the best framing of the agent security stack to date. Clear taxonomy. Also notable: no "output" or "publishing" layer exists in their model — the stack covers input through runtime only. Output/publishing is outside the current mental model.
- **URL:** https://www.keycard.ai/blog/agent-security-stack/

**Ratify Protocol Updated to v1.0.0-alpha.8**
- Incremented from alpha.7 → alpha.8
- Added C/C++ language interop (now 5 languages: Go, TypeScript, Python, Rust, C/C++)
- Patent pending status maintained
- **Signal:** Protocol continues maturing. Cross-language interop is table stakes for identity protocols.

**Lyfe Ninja — Revocable Digital Signatures for AI Agent Output (Ask HN, Apr 21)**
- Ask HN: "Would you use revocable digital signatures to verify AI/other content?"
- Core concept: AI responses are **signed** after generation, verified client-side, tampering causes verification failure, signatures are **revocable** (short-lived leases or full invalidation)
- "Know your agent" framing: verify that AI-generated content came from the intended agent and hasn't been altered
- Uses distributed verification, embedded metadata, no key management
- Key quote: "Would you want to stand by your AI agent's output forever? I think not." — argues revocability is essential
- **Signal:** DIRECTLY relevant to ZenBin. Someone else is thinking about signing AI agent outputs, but from a verification/revocation angle rather than a publishing angle. They're asking the market question — "would people actually use this?" — and the answer isn't clear yet. ZenBin's signed publishing with Ed25519 is a specific implementation of this concept, but with a different focus: publishing identity and attribution vs. verification and revocation.
- **Gap opportunity:** Lyfe Ninja is asking "how do you verify AI output?" — ZenBin answers "how do you publish it with identity?" Different question, complementary answer.
- **URL:** https://lyfe.ninja/projects/

**Auto Agent Protocol — A2A Profile for Car Dealerships (May 14)**
- Open A2A profile enabling AI agents to interact with car dealerships
- Domain-specific A2A implementation (automotive retail)
- **Signal:** A2A is moving from theory to domain-specific implementations. When domain-specific A2A profiles appear, it means agent-to-agent communication is becoming practical. Output publishing is the other half — agents need to produce, not just converse.
- **URL:** https://github.com/auto-agent-protocol/auto-agent-protocol

**DialtoneApp Network — Bot Commerce Payments (Show HN, Apr 21)**
- Card payments infrastructure for bot commerce
- Bots discover products, request purchases, card is charged when owner-approved rules allow
- Uses .well-known/* files for bot-allowed products (like robots.txt for commerce)
- Explored Stripe machine payments, Skyfire, Crossmint, Worldpay, Google Universal Commerce Protocol, MCP, A2A
- **Signal:** Agent commerce is becoming real. When agents can transact, they need to publish receipts, confirmations, reports. The output gap extends to financial transactions.
- **URL:** https://dialtoneapp.com

**Kantext — Context as a First-Class Data Type (Show HN, ~May 14)**
- Treats AI context as a composable, layered data structure (not vector DB or graph)
- Every composition is cryptographically sealed to a Git commit ("grounded")
- Context-Addressable Storage (CxAS) with Blake3 hashing
- Provenance tracked via git commit sealing — structural provenance, not just data storage
- **Signal:** Provenance is showing up in context management now too. Git-based sealing is an interesting pattern but doesn't address real-time publishing.

**MCP Server Explosion — MementoVault (May 14)**
- Self-hosted AI context manager served via MCP
- Structured, reusable context across MCP-compatible clients
- **Signal:** Already noted in 16:50 update. MCP-as-standard-connector pattern continues.

**AI Coders Half-Open Laptops — Business Insider (May 14)**
- Mainstream press: agents requiring constant human oversight, people carrying laptops everywhere
- **Signal:** Already captured in 16:50 update. The cultural moment of agents-as-everyday-tools.

### Updated Landscape Files
- `identity.md`: Added Keycard.ai Agent Security Stack framing, updated Ratify to alpha.8, added Lyfe Ninja revocable signatures
- `infrastructure.md`: Added Auto Agent Protocol, DialtoneApp Network, Kantext
- `trends.md`: Added Trend 14 (Agent Security Stack Framing), updated Output Gap trend with Lyfe Ninja data point

### Key Takeaway

Keycard.ai's 4-layer agent security stack (Transport → Identity → Policy → Runtime) is the clearest articulation of where the industry is investing. Notably absent from their model: any output/publishing layer. Lyfe Ninja's Ask HN about revocable signatures for AI output is the closest anyone has come to thinking about output verification — but they're framing it as a question, not a product. They're asking "would you use this?" which means the market hasn't validated it yet. ZenBin should track this closely: the question of "who created this AI output and can I verify it?" is emerging, but nobody has productized it yet.

---

## 2026-05-14 16:50 UTC

### New Findings

**Deckard — Per-Agent Identity + ACL for Apple Services MCP (New)**
- Mac-resident MCP server for Mail, Calendar, iCloud Drive, Voice Memos, Reminders, Contacts
- Per-agent tokens, scoped ACLs, content filtering both directions, full audit log
- Origin: author runs 4+ agents (Claude Code, OpenClaw, Paperclip, Hermes) across different machines and needed per-agent access control
- **Signal:** Personal multi-agent identity is maturing. Per-agent auth isn't just enterprise — it's a personal deployment concern too. Output/publishing authorization remains unaddressed.
- **URL:** https://github.com/lapidakis/Deckard

**MCP Server Explosion Continues (May 14)**
- MementoVault: self-hosted AI context manager via MCP (structured, reusable context)
- DiscordMcp: controlling servers through MCP
- N8n-MCP: workflow generation + debugging via MCP
- SicariusGuard: Solana token safety oracle for AI agents via MCP
- **Signal:** MCP as the universal connector pattern is fully established. New MCP servers every day for every niche. The pattern is commoditized.

**Ardent (YC P26) — Traction Update**
- 94 pts, 44 comments on HN (up from 52→80→89→94)
- Postgres sandboxes for coding agents continuing to resonate
- **Signal:** Sandbox/test infrastructure for agents is validated demand. Output infra remains the gap.

**Ask HN: Missing Agent Framework Features — Zero Mention of Publishing**
- "What features are missing in current AI agent frameworks?" — lists memory, debugging, controls, orchestration
- Zero comments mention output/publishing as a gap
- **Signal:** The category doesn't exist yet in developer consciousness. This is exactly where ZenBin can define a new category.

### Updated Landscape Files
- `identity.md`: Added Deckard (per-agent identity + ACL), updated big picture
- `infrastructure.md`: Added Deckard, MementoVault, DiscordMcp, N8n-MCP, SicariusGuard
- `trends.md`: Updated MCP trend with new servers, added Trend 13 (Per-Agent Identity Scaling to Personal Use), updated signal table

### Key Takeaway

Per-agent identity is now a personal deployment concern, not just enterprise (Deckard proves it). MCP server explosion continues — every domain gets an MCP wrapper. The output/publishing gap remains completely unaddressed. No one in the Ask HN thread about missing framework features mentions publishing — it's not yet recognized as a category, which is exactly the opportunity for ZenBin.

---

## 2026-05-14 10:50 UTC

### New Findings

**Ask HN: "What features are missing in current AI agent frameworks?" (May 14)**
- HN discussion asking what's missing in agent frameworks
- Examples given: better memory systems, workflow debugging, human-in-loop controls, distributed execution, lower latency orchestration
- **Signal:** Direct community signal that the gaps are still being defined. No one mentions output/publishing as a gap — because it's not even on the radar yet. Opportunity for ZenBin to define the category.
- **URL:** https://news.ycombinator.com/item?id=48132357

**AI Coders Carrying Half-Open Laptops — Business Insider (May 14)**
- Mainstream press coverage of AI coding agents requiring constant human oversight
- "AI coders are carrying half-open laptops through airports, offices, ice rinks"
- 20 pts on HN, 32 comments
- **Signal:** AI agents are mainstream news. The cultural moment of agents-as-everyday-tools has arrived. This is when infrastructure for agent output becomes necessary.

**Ardent (YC P26) — Updated Traction**
- Now 89 pts on HN, 35 comments (up from 80/33 last check, 52/20 initially)
- Postgres sandboxes for coding agents continuing to gain engagement
- **Signal:** Sandbox/test infra for agents is validated demand. Output infra remains the gap.

**Comedy Podcast Agent Pipeline — Fully Automated Content Publishing**
- HN story: Agent pipeline that takes trending topics → 22-min comedy podcasts → publishes to Spotify
- Uses Temporal for durable workflow, Gemini for scripts, gollem agents with structured outputs, ElevenLabs for voice
- ~10 beats per episode, verifier gate checks facts/character consistency before rendering
- **Signal:** Agents are already creating and publishing finished content. But the publishing step (to Spotify) is manual/bespoke — no standard infrastructure for agent output. ZenBin fills exactly this gap.

**Manufact/mcp-use — MCP Dev Tooling Update**
- Full-stack SDK for MCP servers and clients, plus Inspector dev tooling
- HMR for MCP using protocol primitives (notifications/tools/list_changed) — proper hot reload without session restart
- Browser-based Inspector: localhost chat UI, BYOK, cross-client testing with browser agents
- Screenshot + screen recording of full agent conversations for debugging
- **Signal:** "The Vite for MCP" is now a funded company. MCP dev tooling is a real category. This validates that agent infra investment follows the input layer. Output tooling remains empty.

### Updated Landscape Files
- `infrastructure.md`: Updated Ardent traction (89 pts), added Manufact/mcp-use details
- `trends.md`: Updated signal table with new entries

### Key Takeaway

Community is actively discussing what's missing in agent frameworks (Ask HN), and the top answers are all input-side: memory, debugging, controls, orchestration. No one mentions output/publishing — not because it's solved, but because it's not yet recognized as a category. Meanwhile, agents are already creating and publishing content (comedy podcast pipeline → Spotify), but the publishing step is bespoke. The Anthropic report shows 60% of orgs use agents for report generation. The gap is real and growing.

---

## 2026-05-13 04:50 UTC

### New Findings

**Agent Identity Standards Converging (Big Story)**
- AAuth (Agent Auth) by Dick Hardt (OAuth 2.0 author) — exploratory spec for agent-to-agent auth with cryptographic identity, no bearer tokens, progressive trust, delegation chains. Working prototype with Keycloak + Agentgateway + A2A + MCP.
- IETF Internet-Draft draft-klrc-aiagent-auth-00 — formal proposal for agent auth/authz using WIMSE + OAuth 2.0. Covers agent identifiers, credentials, attestation, three delegation models.
- OpenID Foundation whitepaper on AI agent identity — declares MCP the leading standard for agent↔resource connection, warns that autonomy "inflection point" will break current auth models.
- NIST concept paper on AI agent identity — open for public comment on identification, authorization, auditing, and non-repudiation.
- Strata/CSA survey (285 IT/security pros) — only 18% confident in current IAM for agents, 44% still using static API keys, 80% can't track agent actions in real time.

**MCP Ecosystem Maturing**
- Manufact (mcp-use) launched MCP dev tooling: Inspector (localhost chat for testing), HMR for MCP servers, tunnel for real-client testing, automated cross-client testing with browser agents. Funded company, not a side project.
- Ledgr — self-hosted finance app with built-in MCP server. "Has an MCP server" is becoming a differentiator.
- Hoop — infra access gateway exposing session data via MCP. Agents querying their own history.

**Embedded AI Agents**
- Gigacatalyst (Show HN, 44 pts) — AI customization layer embedded in SaaS. Non-technical users build governed apps via natural language. 2000+ daily users, 70% 30-day retention.

**Enterprise Agents**
- Hopper/Hypercubic (Show HN, 65 pts) — agentic interface for mainframes/COBOL. Agents operating inside legacy environments with approval gates.

### Key Takeaway for ZenBin

The industry is investing massively in agent **input** (MCP, tools, context) and agent **identity** (auth, delegation, attestation). Nobody is building dedicated agent **output** infrastructure. That's the gap. ZenBin should position as the publishing/output layer for agents — where agent-created content gets identity, attribution, hosting, and sharing.

---

## 2026-05-13 10:50 UTC

### New Findings

**Durable Sessions — A New Category Forming**
- Ably (realtime Pub/Sub) formalizing "Durable Sessions" as infrastructure for AI agents — persistent sessions surviving disconnects, ordered delivery, multi-device fan-out, presence
- 35/37 AI platforms have no stream resumption, 33/37 can't detect agent crashes
- Vercel building DurableAgent class, TanStack AI shipping ConnectionAdapter, ElectricSQL defining the pattern
- Analogy: Durable Execution (Temporal, $5B valuation) made backends crash-proof. Durable Sessions make the agent experience crash-proof.
- **Signal:** Transport/session layer is becoming real infrastructure. Output (what happens after the session) is still unaddressed.

**AI Agent Passport — New Identity Standard Proposal**
- Open identity standard from Stacy Starchum / Jay Volpenheim — signed, verifiable JSON document traveling with agents
- Ed25519 cryptographic signatures, DID-based ownership, scoped permissions, spend limits, registry verification
- "Like OAuth for humans → AI Agent Passport for agents" — RFC status, seeking community feedback
- Complementary to AAuth (auth protocol) and IETF draft (workload identity) — this is the transactional trust layer

**AAuth Deep Dive Published**
- Christian Posta published detailed deep dive with full working prototype: Keycloak + Agentgateway + A2A + MCP
- Shows agent identity via JWKS + HTTP message signing → autonomous authorization → user-delegated authorization → policy enforcement
- Agentgateway as policy enforcement point (CEL-based policies, delegation chain validation)
- **Signal:** The auth stack is becoming concrete, not just theoretical. Working prototypes exist.

**Agent Governance Emerges as Category**
- Recursant (Show HN): Istio/sidecar pattern for agent governance at network layer — compliance across multi-framework, multi-cloud
- Voker (YC S24, Launch HN): Agent analytics platform with Intents/Corrections/Resolutions primitives. 90%+ YC founders only know agents fail from customer complaints.

**MCP Ecosystem Continues Exploding**
- Manufact/mcp-use: MCP dev tooling with HMR, Inspector, tunnel, cross-client browser-agent testing. Funded company.
- Graphmind: Persistent memory + graph for agent codebase navigation (MCP server, CLI, GUI). 5,700x token reduction vs grep.
- Elecz: MCP server for real-time electricity prices across 40 countries. "API wrapper as MCP server" pattern is commoditized.
- Monghoul: MongoDB GUI with built-in MCP server. MCP as a feature checkbox for dev tools.

**Embedded AI in Enterprise**
- Gigacatalyst (Show HN, 50 pts): AI customization layer embedded in SaaS. Non-technical users build governed apps via natural language. 2000+ daily users, 900+ apps, 70% 30-day retention.
- Hopper/Hypercubic (Show HN, 79 pts, front page): Agentic interface for mainframes/COBOL. Agents operating inside legacy enterprise environments.

### Updated Landscape Files
- `identity.md`: Added AI Agent Passport entry
- `infrastructure.md`: Added Ably Durable Sessions, Recursant, Voker, Graphmind, Elecz, Monghoul
- `standards.md`: Added AI Agent Passport standard
- `trends.md`: Added Trends 7 (Durable Sessions), 8 (Agent Governance), 9 (Identity Fragmentation). Updated signal table with 16 entries.

### Key Takeaway

Three layers are crystallizing: **input** (MCP won), **identity** (AAuth/IETF/Passport competing), and **transport** (Durable Sessions forming). The **output layer** — publishing, presenting, attributing agent-produced content — remains completely unclaimed. This is still ZenBin's clearest gap.

---

## 2026-05-14 04:50 UTC

### New Findings

**Anthropic 2026 State of AI Agents Report**
- Survey of 500+ technical leaders across industries on enterprise agent deployment
- 57% of orgs now deploy agents for multi-stage workflows; 16% running cross-functional processes
- 81% plan to tackle more complex use cases in 2026 (39% multi-step, 29% cross-functional)
- 90% use AI for development; 86% deploy agents for production code
- Data analysis + report generation (60%) and internal process automation (48%) are top impact use cases
- 56% plan to implement agents for research and reporting in next year
- 80% report measurable economic returns from AI agent investments
- Top challenges: integration with existing systems (46%), data access/quality (42%), change management (39%)
- **Signal:** Report generation is the #2 use case (60%). Agents are producing outputs (reports, dashboards, docs) at scale — but there's still no dedicated infrastructure for publishing/attributing that output. ZenBin opportunity validated.

**Ardent (YC P26) — Updated Traction**
- Now 80 pts on HN, 33 comments (up from 52 pts, 20 comments)
- Postgres sandboxes for coding agents — strong engagement from production engineering teams
- **Signal:** Sandbox/test infra for agents continues to validate. Output infra remains the gap.

**Plato / PurplePincher — AI Agents with Shared Memory**
- Show HN (3 pts) — published "everything they got wrong" with shared memory for AI agents
- Post-mortem style content about agent memory systems
- **Signal:** Agent memory/context sharing is active area. Shared memory = input-side optimization again.

**Awesome AI Agents 2026 — Curated List**
- Comprehensive GitHub list covering 300+ projects across 25 categories
- Categories: Foundation Models, Protocols (MCP/A2A), Frameworks, Memory, Security, Sandboxing, etc.
- **Notable absence:** No "publishing" or "output" category exists. Categories cover input, processing, security, and evaluation — but not what agents produce.
- **Signal:** Even the most comprehensive agent ecosystem list doesn't have a category for agent output/publishing. Confirms the gap.

### Key Takeaway

The Anthropic report validates the ZenBin thesis with hard data: **60% of orgs are using agents for data analysis + report generation**, and **56% plan to implement research and reporting agents**. Agents are producing output at scale. The awesome-agents-2026 list has 25 categories and zero of them cover publishing/output. The gap is still wide open.

---

## 2026-05-13 16:50 UTC

### New Findings

**Ratify Protocol — Cryptographic Trust for Agent Authorization**
- New open protocol from Identities AI, Inc. — Ratify Protocol v1.0.0-alpha.7
- Hybrid Ed25519 + ML-DSA-65 (NIST FIPS 204) signatures — quantum-safe by design
- Three verbs: DELEGATE, PRESENT, VERIFY — human→agent and agent→agent use the same primitive
- Offline verification in <1ms, no central authority needed
- Delegation chains with scope attenuation (child can never exceed parent permissions)
- JSON wire format, no blockchain, no tokens, no central issuer
- SDKs in Go, TypeScript, Python, Rust — cross-language interop proven
- **Signal:** Yet another identity/auth protocol entering the space. The fragmentation continues. Each approach has different tradeoffs (AAuth = OAuth-evolved, IETF = standards-track, Passport = driver's license, Ratify = offline-first quantum-safe). None address output/publishing.

**AgentGate — Policy Decision Point for AI Agents**
- New open-source project: authorization layer sitting between AI agents and their tools
- Evaluates every action against identity, scope, declared purpose, and real-time behavior
- Three outcomes: PERMIT, ESCALATE, DENY
- Trust scoring across 4 dimensions: identity (25%), delegation chain (25%), purpose alignment via embeddings (30%), behavioral velocity (20%)
- Scope attenuation across delegation chains — child agent can never exceed parent permissions
- Human-in-the-loop escalation for sensitive operations
- LangChain integration via AgentGateToolkit
- **Signal:** Agent authorization is getting granular. The model of "trust score + purpose alignment + behavioral velocity" is new and interesting. Still focused on input/control, not output.

**AAuth Deep Dive Published (Christian Posta)**
- Full working prototype walkthrough: Keycloak + Agentgateway + A2A + MCP
- Shows agent identity via JWKS + HTTP message signing → autonomous authorization → user-delegated authorization → policy enforcement
- Agentgateway as policy enforcement point with CEL-based policies, delegation chain validation
- **Signal:** The auth stack is becoming concrete, not just theoretical. Working prototypes exist. This validates the AAuth approach.

**MCPSafe — Security Scanner for MCP Servers**
- Free security scanner using 5-LLM consensus to audit MCP servers
- **Signal:** MCP security is becoming a concern as adoption grows. Scanning/patterns emerging.

**Sysdig Headless Cloud Security**
- "Headless SaaS has come to security" — security capabilities consumable via APIs, AI agents, IDEs, CI/CD, not just UI
- Explicitly calls out Claude Code, Cursor, and MCP servers as the shift driving this
- **Signal:** Enterprise security tools are building agent-first consumption models. MCP as the input standard is taken for granted.

**Ably Durable Sessions — Full Blog Post**
- Ably (10-year realtime Pub/Sub company) formalizing their positioning as "Durable Sessions for AI agents"
- Key stat: 35/37 platforms have no stream resumption, 33/37 can't detect agent crashes
- Same infrastructure WhatsApp uses for humans, repackaged for agents
- Vercel building DurableAgent class, TanStack AI shipping ConnectionAdapter, ElectricSQL/Convex converging on same pattern
- **Signal:** Transport/session layer is now formally a category. Ably is claiming it first.

**Torrix — Self-Hosted LLM Observability**
- Single Docker container backed by SQLite — no Postgres, no Redis
- Includes MCP server so AI assistants can query your own logs
- Cost forecasting, budget caps, PII masking, model routing, evals, prompt library
- **Signal:** Agent observability is fragmenting into sub-categories. Torrix is "simple self-hosted" play. The MCP server for log querying is notable — agents querying their own history.

**Gigacatalyst (Update — Now 53 pts, Front Page)**
- Embedded AI builder for SaaS — 2000+ daily users, 900+ apps built, 70% 30-day retention
- Agentic API discovery → generation → validation → sandboxing → proxy layer
- **Signal:** Same pattern continues: SaaS platforms want AI inside their product, governed by their rules.

**Hypercubic/Hopper (Update — Now 83 pts, Front Page)**
- Agentic interface for mainframes/COBOL
- 43 comments, strong engagement from enterprise/mainframe practitioners
- Design principle: preserve fidelity of environment, make it accessible to agents
- **Signal:** Enterprise agents operating inside legacy systems is validated demand.

### Updated Landscape Files
- `identity.md`: Added Ratify Protocol, AgentGate PDP
- `infrastructure.md`: Added Torrix, MCPSafe, Sysdig Headless Security, updated Ably Durable Sessions details
- `standards.md`: Added Ratify Protocol to standards comparison
- `trends.md`: Added Trend 10 (Agent Auth Fragmentation), updated signal table

### Key Takeaway

The agent identity space is now crowded with four competing approaches (AAuth, IETF draft, AI Agent Passport, Ratify Protocol), each optimizing for different trust models. Meanwhile, MCP has fully won the input layer and is being taken for granted (Sysdig assumes it, Torrix bundles it, every tool ships MCP support). The **output layer** remains completely empty — no one is building dedicated infrastructure for agent publishing, presentation, or content attribution. This is the clearest signal yet for ZenBin.

---

## 2026-05-13 22:50 UTC

### New Findings

**Ratify Protocol (Show HN, 4 pts) — Offline-First Agent Auth**
- New from Identities AI, Inc. — Ratify Protocol v1.0.0-alpha.7
- Hybrid Ed25519 + ML-DSA-65 (FIPS 204 quantum-safe) signatures
- Three verbs: DELEGATE → PRESENT → VERIFY. Same primitive for human→agent and agent→agent
- Offline verification in <1ms, no central authority, no blockchain, no tokens
- Delegation chains with scope attenuation (child ≤ parent)
- SDKs in Go, TypeScript, Python, Rust. 59 canonical test vectors, cross-language interop proven
- **Signal:** Fourth identity protocol entering the space. Ratify optimizes for offline/edge/realtime (drones, vehicles, voice) while AAuth optimizes for web/API. The space is fragmenting by use case.

**AgentGate — Policy Decision Point for AI Agents (Show HN, 4 pts)**
- Open-source PDP sitting between agents and tools
- Evaluates every action against identity, scope, declared purpose, and real-time behavior
- Outcomes: PERMIT / ESCALATE / DENY
- Trust scoring: identity 25%, delegation chain 25%, purpose alignment (embeddings) 30%, behavioral velocity 20%
- Scope attenuation across delegation chains, human-in-the-loop escalation
- LangChain integration via AgentGateToolkit
- **Signal:** Agent authorization getting granular and behavioral. Purpose alignment via embeddings is a novel approach. Still focused on input/control — no output layer.

**Sinain — Context OS for Agents (Show HN, 2 pts)**
- Captures screen + audio continuously, distills into local knowledge graph
- Accessible via MCP, web UI, and HUD overlay invisible to screen capture
- 82.8% IPR on LongMemEval (ICLR 2025 benchmark)
- Peer-to-peer context sharing via WebRTC — data never touches a server
- Four privacy modes: off / standard (auto-redact) / strict (summaries only) / paranoid (fully local, Ollama + whisper.cpp)
- **Signal:** Agent context/input is getting rich and continuous. Sinain is "context OS" — captures everything an agent might need. But still input-focused. Nobody is building the output counterpart.

**Ardent (YC P26, Launch HN, 52 pts, front page) — Postgres Sandboxes for Coding Agents**
- Instant production-like database clones for agents to test against
- Logical replication + DDL triggers, copy-on-write branching, spin up in <6s even at TB scale
- Proxy layer for access control, credential isolation, split-plane architecture for BYOC
- Anonymization via SQL registered on branches (PII redaction)
- Goal: make every data infrastructure "cloneable" so agents can test impact without risk
- **Signal:** Sandbox/isolation infrastructure for agents is a funded category (YC). The pattern: give agents safe environments to work in. Still about input/testing — the output/publishing step remains unaddressed.

**Recursant — Istio for AI Agents (Show HN, 3 pts)**
- Mesh-based control plane: sidecar per agent pod, mTLS, A2A protocol
- Control plane (registry) + data plane (sidecar mesh)
- Interceptor pipeline: auth, authz, compliance, PII redaction, guardrails, audit, rate limiting
- Full mortgage origination demo with hub-and-spoke topology
- Agent-agnostic: works with LangChain, LangGraph, CrewAI, custom HTTP
- **Signal:** Service mesh pattern (Istio analogy) applied to agents. This is infra-level governance — network-layer control. Validates that agent infra is following k8s/cloud-native evolution.

**AAuth Deep Dive (Christian Posta blog, HN 1 pt)**
- Full prototype walkthrough: Keycloak + Agentgateway + A2A + MCP
- Agent identity via JWKS + HTTP message signing → autonomous auth → user-delegated auth → policy enforcement
- Agentgateway as PEP with CEL-based policies and delegation chain validation
- **Signal:** Auth stack moving from specs to working demos. AAuth is the most mature agent auth approach right now.

**Gigacatalyst (Update — Now on front page)**
- Embedded AI builder for SaaS platforms: 2000+ daily users, 900+ apps, 70% 30-day retention
- Pattern: agentic API discovery → generation → validation → sandboxing → proxy layer
- Non-technical users building governed apps inside SaaS products via natural language
- **Signal:** SaaS embedding of AI is validated with real usage numbers.

**MCP as Dev Tool Feature (Pattern)**
- Manufact/mcp-use: full dev tooling (HMR, Inspector, tunnel, browser-agent testing). Funded company.
- Sunex Optics: MCP server for lens/CMOS camera selection — even niche hardware domains ship MCP servers now
- **Signal:** "Has an MCP server" is becoming like "has an API" — expected, not noteworthy. MCP has won the input connector layer.

### Updated Landscape Files
- `identity.md`: Ratify Protocol and AgentGate already added in previous update; Sinain context-sharing noted as input-layer pattern
- `infrastructure.md`: Added Ardent, Sinain, Recursant; updated MCP ecosystem pattern
- `trends.md`: Updated Trend 10 (auth fragmentation now 4 protocols), added Trend 11 (Agent Sandbox Infra is a funded category)

### Key Takeaway

This scan confirms the three-layer model: **input** (MCP won, now commoditized), **identity/auth** (4+ competing protocols fragmenting by use case: AAuth for web/API, Ratify for offline/edge, IETF for enterprise workload, Passport for transactional), and **transport** (Durable Sessions forming). The **output layer** — where agents publish, present, attribute, and share what they create — is still completely empty. Every single new tool, protocol, and YC company is focused on getting context INTO agents or controlling what agents DO. Nobody is building what happens when agents need to OUTPUT something persistent, attributed, and shareable. That remains ZenBin's gap.