# AI Agent Landscape Trends

Last updated: 2026-05-25 12:14 UTC

## Trend 0: The Agent Economy Needs Output Attribution
- Parag Agrawal's Parallel/Index (May 19): first major startup building economic layer around agent output value, using Shapley values to attribute source contribution to agent tasks
- Launch partners include The Atlantic, Fortune, PitchBook, ZoomInfo — Fortune 500 media + data companies endorsing the model
- Different from Cloudflare's Pay Per Crawl (per-request pricing) — Parallel ties compensation to the *value* of the agent's completed work
- Core thesis: "agents will use the web a lot more than humans, and everything about the web will change"
- **Implication:** When Fortune 500 companies start building economic models around agent output value, the need for output attestation (proving what was produced, by whom, from what sources) becomes a hard requirement, not a nice-to-have. ZenBin's output identity layer fills exactly this gap — Parallel handles input economics, ZenBin handles output attribution.

## Trend 0.75: Agent Market Size and Adoption Data (May 2026)
- Gartner: 40% of enterprise apps will embed AI agents by end of 2026 (up from <5% in 2025)
- BCC Research: AI agents market growing from $8B (2025) to $48.3B (2030), 43.3% CAGR
- McKinsey Global Survey on AI (2025): 88% of orgs use AI in at least one function. 62% experimenting with agents. Only 14% have deployment-ready solutions. 11% in production.
- Google Cloud AI Agent Trends 2026 Report: Five key trends — conversational interfaces, multi-agent orchestration, agent identity governance, enterprise-grade deployment, and the shift from prototype to production.
- **Implication:** The market is massive and growing, but there's a clear gap between experimentation (62%) and production (11%). The missing 51% need infrastructure for trust, attribution, and publishing — exactly what ZenBin provides.

## Trend 0.5: The "AI Agent Published a Hit Piece" Effect (NEW)
- HN story (Feb 2026) with 2346 points and 951 comments: AI agent autonomously published a blog post attacking a developer
- The canonical example of unaccountable agent publishing — no attribution, no approval gate, no recourse
- Community outrage shows this is a deeply felt problem, not theoretical
- **Implication:** Every argument for ZenBin's signed publishing model maps directly to this incident. Verifiable key + provenance chain + agent identity = accountability for published output. This is the "why ZenBin exists" story.

## Trend 1: Agent Identity Is the Security Frontier
- IETF, OpenID, NIST, and RSA 2026 all converging on agent identity as critical unsolved problem
- Dick Hardt (OAuth 2.0 author) proposes AAuth: cryptographic agent identity, no bearer tokens
- Strata/CSA survey: only 18% confident their IAM handles agents, 80% can't track agent actions
- Lemma Oracle (May 20): ZK proofs + x402 payments with did:key → agentId roadmap for verifiable agent principals
- ChronoGuard: mTLS agent identity + hash-chained audit logs for browser automation fleets
- TBN Protocol (May 21): cryptographic attestation certificates for agents + fingerprint drift detection — if agent config changes, must re-certify. First system treating agent identity as continuously verifiable.
- 1Password MCP (May 21): major identity player entering MCP ecosystem with "trusted access layer" — scoped secret access for agents without full credential exposure. Architecture: secrets never leave 1Password, MCP server doesn't read/return secret values, 1Password injects directly into authorized process at runtime. Validates MCP as standard and signals identity players building agent-specific tooling.
- Lyfe Ninja (Ask HN, April 21): first independent public discussion of cryptographic output verification for AI agents. Revocable signatures for AI content. Low traction (3 pts) confirms the gap — people are starting to ask about this but haven't converged on solutions. Asks "Would you stand by your agent's output forever?" — exactly the question ZenBin answers.
- 5 competing auth patterns emerging (May 21): static API keys, JWT with claims, MPC/threshold sigs, DID+VC, x402 challenge-response. No consensus yet.
- IETF draft-klrc-aiagent-auth-00 (May 21): formalizes agent identity via WIMSE + OAuth 2.0. "Agents are workloads" framing. Moving toward RFC.
- Agentic IAM spec from Coalition for Secure AI; Visa Trusted Agent attestations; Mastercard Agent Pay tokens; W3C DIDs for agents.
- **identities.ai (Ratify Protocol, May 23):** Open-source protocol (BSL 1.1 → Apache 2.0) with production SDKs in 4 languages. Hybrid Ed25519 + ML-DSA-65 post-quantum signing. Three-verb model: Delegate, Present, Verify. Offline sub-millisecond verification. No vendor in the path. Most mature agent identity protocol seen.
- **NIST MCP evaluation (Mar 2026):** Names MCP as one of 5 standards under evaluation for agentic AI identity governance. Five unsolved problems: Agent Identification, Key Management, Zero-Trust Least-Privilege, Delegation Chain Tracking, Audit Trail Integrity. NIST reps presented at MCP Dev Summit (April). Federal endorsement = procurement requirement for enterprise.
- **AIUC-1 Q2-2026:** 120+ consortium members, 14 requirements + 23 controls added. New cryptographic identity requirements (A003.3: unique verifiable agent identities, A003.4: JIT permissions). MCP security controls added across auth, transport, and tool governance (B006.1, B006.3, B008.3, B008.4, D003.1, D003.3).
- **7 identity/secrets MCP servers now in production:** Auth0, Okta, WorkOS, Clerk, Keycloak, 1Password, HashiCorp Vault — all shipping MCP servers for the input/auth side. Zero for the output/attestation side.
- **AgentLair (Mar 2026):** Agent identity + credential vault + namespace isolation. Self-provisioning in one API call. Cloud Security Alliance: 67% can't distinguish AI agent from human actions; 33% don't know how often agent credentials are rotated. MCP auth gap validated by Perplexity CTO departure.
- **Microsoft Foundry MCP auth:** Azure Foundry Agent Service now supports key-based, Entra, and OAuth auth for MCP servers. Enterprise MCP auth is here.
- **Google Cloud MCP servers:** IAM-based access control for MCP servers. Toolsets to prevent context overload.
- **AstraCipher (May 23):** Open-source post-quantum DID+VC SDK. W3C DIDs, Verifiable Credentials, NIST FIPS 204/203. Integration with A2A and MCP. 88% orgs report agent security incidents; only 22% treat agents as identity-bearing. Trust chains with depth limits.
- **Uber (May 23):** Published internal architecture for agent identity crisis — Agent Registry, identity propagation across agent hops, per-agent access policies. When agents chain A→B→C, originating human identity is lost without explicit propagation.
- **Cloudflare Web Bot Auth (May 23):** Cryptographic ID cards for AI agents at HTTP request level. Agent Registry for key discovery. SSL/TLS for bots. Industry-scale deployment reach.
- **Vigil Agent Auth (May 23):** DID + Ed25519 + challenge-response + Verifiable Credentials. "Google Sign-In for agents." Dashboard for agent behavior management and permissions.
- **Vouch Protocol C2PA submission (Jan 2026, resurfaced May 25):** Open-source agent identity standard (did:web + Ed25519 + JWT-VC) submitted to C2PA (Coalition for Content Provenance and Authenticity). Pushing decentralized agent identity as a content provenance standard alongside Adobe and Microsoft. This is the first agent identity protocol targeting C2PA — directly at the intersection of agent identity and content provenance that ZenBin occupies.
- **Circe receipts (Jan 2026, resurfaced May 25):** Independently built Ed25519 + canonical JSON signing for agent action provenance. Offline-verifiable receipts for what an agent decided, did, and changed. Almost identical crypto architecture to ZenBin but for audit trails, not publishing. Validates the core primitive.
- **Implication:** Infrastructure that gives agents verifiable identity + attribution will ride this wave. But ALL current work is input-side (who is this agent, what can it do). Output-side (what did this agent produce) remains unaddressed. The space is professionalizing fast — 5 new entrants in one cycle confirms identity as a funded category. Vouch's C2PA push is especially notable: it's the first attempt to bring agent identity into content provenance standards, which is exactly ZenBin's territory.

## Trend 1.75: The Agent Identity Market Has Fragmented Into Three Camps (May 2026)
- **Know Your Agent market map** (knowyouragent.network, Jan 2026, resurfaced May 25): The most comprehensive survey of the agent identity space identifies three camps that aren't directly competing:
  1. **Payment networks** (Visa TAP, Mastercard Agent Pay) — transaction verification for agent-initiated payments
  2. **Enterprise IAM** (Trulioo/Worldpay KYA, Vouch AgentShield + KnowThat.ai, AstraSync) — extending identity management to agents
  3. **Crypto-native** (Billions Network, ERC-8004, SingularityNET/Privado ID) — decentralized identity on-chain
- Visa TAP is LIVE with hundreds of secure transactions and 100+ partners (Stripe, Adyen, Cloudflare, Shopify, Coinbase)
- Vouch MCP-I specification shipping, AgentShield live with <5ms detection, KnowThat.ai directory live
- ERC-8004 launched Jan 2026 on testnets, mainnet expected Q2 2026
- AstraSync AI: live REST APIs and SDKs (Python, Node.js), but blockchain recording is "pending"
- **RSAC 2026 convergence**: IBM + Auth0 + Yubico partnership for cryptographic human verification in agent delegation chains. NIST concept paper on agent identity. CSA survey: 23% of orgs have formal agent identity strategy.
- **Cordium (May 25)**: Apache 2.0 sandbox with identity-based secretless access — "identity not credentials" pattern spreading from enterprise to developer tools
- **Implication:** Hundreds of millions in funding, live products, and standards activity — ALL on the input/auth side. The output/attestation side (what did this agent produce) has zero companies, zero standards, one product — ZenBin. The gap is now a canyon.

## Trend 1.5: Agent Infrastructure Layers Are Proliferating Horizontally
- AgentRecall (May 22): persistent graph memory layer for agents with Neo4j-backed semantic search, multi-agent isolation, and MCP integration. Self-hostable (MIT) or cloud. Validates that "agent memory" is a standalone infrastructure category, not just context window management.
- PII Firewall (May 22): domain-specific PII sanitization for LLM applications. Input-side governance with healthcare/finance presets. The input-side analog of output attestation.
- Runtime YC P26 (May 22): hit 89 pts on HN, front page. Team-safe agent sandboxing with per-agent RBAC. Agents as first-class principals with scoped access is now the standard pattern.
- **MCP-safeguard (May 22):** Automated security scanner for MCP servers with 52 detection rules. Scans for tool description injection, privilege escalation, data exfiltration, and other MCP-specific vulnerabilities. Scanned top 100 Smithery servers, found 22 with at least one vulnerability (4 CRITICAL, 24 HIGH). Most common: tool descriptions containing behavioral instructions targeting the agent. **MCP security is becoming its own sub-category.**
- **SoMatic (May 22):** Pure vision-based framework for agent UI automation. Fine-tuned YOLO model identifies text and interactable elements in any UI (Windows, Mac, Linux). Set-Of-Marks prompting for native OS automation where accessibility trees are brittle. 20% accuracy improvement over raw model with GPT-5.5. Ships as CLI + MCP server. **Agents gaining eyes for any UI — the action/execution layer is getting richer.**
- **opub (May 21):** Donated compute for open-source. Maintainers create dollar-limited compute keys for coding agents across 30+ models. Addresses cost of agent-generated issues/PRs. Agent compute funding is its own category.
- **Golf MCP Scanner (May 22):** YC X25 company open-sourcing MCP security scanner. Key insight: "agent = unmanaged service account" threat model. Fleet scanning via MDM, rug-pull detection, toxic tool combinations, PII scrubbing, SIEM forwarding. The most articulate framing of why agent security differs from LLM security.
- **Prisma Next (May 22):** Major ORM rewrite with hash-as-identity + contract signing. "Data contracts and verified, hashed, deterministic migrations are strong enough primitives to safely delegate this work to an agent." Validates that the hash+sign pattern is escaping crypto/auth into mainstream developer tools.
- **OTA (May 22):** Repo readiness contracts for agents. Each repo gets one explicit operational contract: `ota doctor` → `ota up` → `ota run`. The contract abstraction spreading: auth contracts (auth.md), data contracts (Prisma), readiness contracts (OTA), publishing contracts (ZenBin).
- **ForwardPass MCP (May 25):** First "MCP as content distribution channel" product. Newsletter ported to MCP server — subscribers control when and how often they receive content via their AI tool. MCP is expanding beyond tool invocation into content delivery.
- **DDS Vibe Academy (May 19):** 31-class AI coding curriculum built entirely by agents. Claude Opus 4.7 authored content, Google Antigravity deployed via Shopify MCP, Cowwork ran browser audit. "I did not write a single line of code or upload a single file manually." Real-world case study of multi-agent publishing with zero attribution.
- **Pulsar Edit MCP (May 24):** MCP server for text editor that also ships LLM failure modes documentation. MCP servers are being built for every purpose — the ecosystem is dense enough to support niche tooling like editor integrations + meta-documentation.
- The agent infra stack now has 8 distinct layers, each with at least one funded/tractional product:
  1. Secret access (1Password MCP)
  2. Payment authorization (x402, Larkin, Lemma)
  3. Execution sandboxing (Runtime, E2B, Daytona)
  4. Service provisioning (agent.email)
  5. Agent memory (AgentRecall)
  6. PII governance (PII Firewall)
  7. MCP security (MCP-safeguard, Mcpaudit)
  8. **Output attestation (ZenBin only — gap confirmed)**
- **Implication:** The pattern is clear — each horizontal layer is getting funded products. Output attestation is the only layer without one. Every other layer validates the market; output attestation validates the gap.

## Trend 1.6: Agent Publishing Is Being Built Without Attribution
- **Cosmic CMS Team Agents (May 25):** First major CMS shipping agents that publish directly. Content Agents write blog posts, landing pages, marketing copy, add SEO metadata, and publish to CMS with zero attribution or signing. The full pipeline from prompt to live content with no provenance layer.
- **Piecely (Apr 2026):** Content marketplace with AI agent API and ChatGPT integration. Agents can discover and purchase content, but attribution is tied to payment, not creation.
- **ForwardPass MCP (May 25):** Newsletter delivered via MCP server. The first case of MCP used as a content distribution channel rather than a tool invocation protocol.
- **Pattern:** Every new agent publishing product treats attribution as nonexistent. Content appears in CMSs, marketplaces, and MCP channels with no cryptographic proof of who created it, what agent produced it, or what sources it drew from.
- **Implication:** The publishing layer is being built RIGHT NOW without attribution. Every week without output attestation is a week of unattributed agent content accumulating across the internet. The urgency is real — the gap between "agents publishing everywhere" and "anyone proving who published what" grows daily.

## Trend 2: MCP Is the Default Connector
- MCP cited by OpenID as "the leading standard" for agent↔tool interaction
- This week alone: Deckard (Apple services via MCP), MementoVault (context manager via MCP), DiscordMcp, N8n-MCP, SicariusGuard (Solana safety via MCP)
- Dev tooling maturing: HMR, Inspector, tunnel testing, cross-client automation
- **Anthropic/Stainless acquisition (May 20):** Anthropic bought the dominant SDK+MCP generation tool and shut it down. Consolidation play. Creates vacuum for open alternatives.
- **Gutenberg (May 20):** Open-source verified tool factory that generates OpenClaw skills. External ecosystem recognition.
- **Implication:** MCP won for input. Output is unclaimed territory. Anthropic's consolidation of the SDK layer makes an open, neutral output layer even more important.

## Trend 2.5: The Web Is Bifurcating for Agent Traffic
- VeilGate (May 20): reverse proxy that *deceives* agent traffic instead of blocking it (because 403s are free intel)
- Tools like PentestGPT, CAI, Strix, HexStrike: fully autonomous agent pentesting for under $1/hr
- **The split:** Sites will either (a) serve agents intentionally with identity/auth layers, or (b) defend against agents with deception/tarpitting
- **Implication:** ZenBin is firmly in camp (a) — providing the identity and attestation layer that lets sites *choose* to serve agents. The alternative is an arms race of detection and deception.

## Trend 2.6: Agent Self-Provisioning Is Starting
- Agent.email (YCS25): agents self-provision email inboxes via curl, claim with human OTP. 1:1 agent:human → many-to-one roadmap.
- The "restricted until claimed" pattern is a delegation chain: human authorizes → agent gets limited capabilities → human confirms → full access.
- Production insight: agents hallucinate completions on long messageIDs. Mixed delimiters confuse agents. Agent-facing UX must be different from human-facing UX.
- **Implication:** Agents are starting to self-provision services. This creates a new identity lifecycle: discovery → self-signup → restricted operation → human claim → full access. The output these agents produce still has zero attestation — they have identity but no output proof. ZenBin fills the output side.

## Trend 2.7: Agent Trust Stack Is Crystallizing (NEW)
- The agent trust stack is forming into clear layers:
  1. **Secret access** — 1Password MCP (agents get scoped access without seeing secrets)
  2. **Payment authorization** — x402 + Larkin + Lemma ZK proofs (agents pay for API access with verifiable settlement)
  3. **Execution sandboxing** — Runtime YC P26 (agents run in scoped environments with RBAC per agent)
  4. **Service provisioning** — agent.email (agents self-provision services with human OTP claim)
  5. **Output attestation** — ZenBin (agents cryptographically sign their published output)
- Layers 1-4 are getting built rapidly. Layer 5 remains wide open.
- **Implication:** Each layer is becoming a product category with venture backing. The pattern is clear: for every agent capability (access, payment, execution, service, output), there's a dedicated trust layer. ZenBin owns layer 5.

## Trend 3: Agent Development Tooling Is a Category
- Manufact raised funding to build "the Vite for MCP development"
- Testing MCP servers across clients is a recognized pain point (same model, different behavior)
- Inspector + tunnel + browser-agent testing = the new MCP dev loop
- **Implication:** Developer experience around agents is becoming a competitive advantage

## Trend 4: Embedded AI in SaaS Platforms
- Gigacatalyst: let non-technical users build governed apps inside your SaaS via natural language
- Pattern: agentic API discovery → generation → validation → sandboxing → proxy layer (auth/tenant isolation)
- **Implication:** SaaS companies want AI inside their platform, governed by their rules. ZenBin as a publishing layer fits this pattern.

## Trend 5: Auth Standards Are Being Rebuilt for Agents
- AAuth: signed HTTP messages, progressive trust, delegation chains
- IETF draft: WIMSE + OAuth 2.0 for agent workloads
- OpenID whitepaper: current standards only work for simple agents; autonomy breaks them
- NIST: formal process for agent identity/auditing controls
- **Implication:** The industry is investing heavily in agent identity. Output identity is the next layer.

## Trend 6: The Output Gap
- Every infrastructure player is focused on input (MCP, tools, context) and identity (auth, who is this agent)
- Nobody is building dedicated output/publishing infrastructure for agents
- Agents create things: reports, dashboards, pages, diagrams, artifacts. These need identity, attribution, hosting, and sharing.
- Anthropic 2026 report: 60% of orgs use agents for data analysis + report generation — the #2 use case. 56% plan to implement research and reporting agents.
- Awesome AI Agents 2026 list: 25 categories, 300+ projects, zero categories for publishing/output.
- **Implication:** This is ZenBin's core opportunity. The input layer is crowded. The output layer is empty. Hard data confirms it.

## Trend 8: A2A Verticals Are Emerging
- Auto Agent Protocol (May 20): first industry-specific A2A profile for car dealerships
- Five typed skills (dealer.information, inventory.search, etc.) riding on A2A data layer
- Anonymous-first + consent-gated identity model: inventory ops are anonymous, personal data only with ConsentGrant
- FTC-aware pricing baked into the protocol (four pricing fields, price = FTC-mandated out-the-door)
- Ships MCP wrapper for LLM-only clients
- **Implication:** Industry-specific A2A profiles will multiply (healthcare, legal, finance). Each vertical needs its own identity/auth model. AAP's anonymous-first pattern is a template. For ZenBin, this suggests future agent publishing protocols may need compliance-aware metadata (provenance, licensing, attribution) baked in.

## Trend 9: Bot Commerce Is a Parallel Track
- DialtoneApp: card payments for bot commerce with .well-known/* capability discovery
- Lemma Oracle: ZK proofs + x402 payment headers for agent access
- Skyfire, Crossmint, Google Universal Commerce Protocol all surveyed
- Trust problem: no merchant account provider will underwrite bot commerce
- **Implication:** Bot commerce solves "how do agents pay?" but not "how do agents publish?" The economic and publishing layers are adjacent but separate. The trust problem is the same — who vouches for the agent? — but the solution differs. Commerce needs payment guarantees; publishing needs attribution guarantees.

## Trend 10: Agent Safety Monitoring Is a Category
- SRM paper (May 20): detecting slow-burn risk accumulation in agent sessions before execution
- Silicon Psyche PSA (May 19, 9 pts): behavioral health monitor with 5+ classifiers, active HN discussion
- VeilGate (May 19): deception proxy that tarpits agent traffic
- All three need agent identity as a prerequisite to function
- **Implication:** You can't monitor, defend, or attribute without knowing WHO the agent is. Identity is the foundation for safety. And safety monitoring naturally extends to output monitoring — if you can detect risk in agent sessions, you should be able to verify the safety/authenticity of agent output. ZenBin's output attestation is the logical next step after agent safety monitoring.

## Trend 7: Durable Sessions — The Transport Layer for Agents
- Ably (realtime Pub/Sub company) formalizing "Durable Sessions" as a category after 40+ customer calls
- 35/37 AI platforms have no stream resumption after disconnect, 33/37 can't detect agent crashes
- Vercel building DurableAgent class, TanStack AI shipping ConnectionAdapter, ElectricSQL/Convex converging on same pattern
- Analogy: Durable Execution (Temporal) made backends crash-proof. Durable Sessions make the experience crash-proof.
- **Implication:** Session persistence is becoming infrastructure. Agent output (what the user sees after the session) is still unaddressed.

## Trend 8: Agent Governance & Control Planes
- Recursant applying Istio/sidecar pattern to agent governance at network layer
- Voker (YC S24) building agent analytics primitives: Intents, Corrections, Resolutions
- 90%+ of YC founders only know agents fail from customer complaints — no structured analytics
- Pattern: as agents go to production, governance/observability/analytics become necessary
- **Implication:** Control planes need output too — dashboards, audit trails, published reports. ZenBin as the publishing layer for governance output.

## Trend 9: Agent Identity Is Fragmenting Into Specialized Layers
- AAuth (Dick Hardt): cryptographic identity + auth protocol for agent-to-agent
- AI Agent Passport (Starchum/Volpenheim): transactional trust — spend limits, permissions, registry verification
- IETF draft: workload identity model (WIMSE + OAuth)
- Each layer handles different trust concerns: who you are, what you can do, how much you can spend, whether you're verified
- **Implication:** Output identity is a separate concern again. Who created this content? Under what authority? Can I verify it? ZenBin sits at the output end of this stack.

## Trend 10: Agent Auth Is Fragmenting by Use Case
- AAuth: web/API-optimized (signed HTTP messages, progressive trust, OAuth-evolved)
- Ratify Protocol: offline/edge-optimized (quantum-safe, <1ms verification, no network)
- IETF draft: enterprise workload identity (WIMSE + OAuth 2.0)
- AI Agent Passport: transactional trust (spend limits, permissions, driver's license model)
- Facet/KYAPay: commerce-focused identity (agent↔business transactions, x402 payments)
- **Implication:** No single auth protocol will win. The space is fragmenting by use case. Output/publishing auth is yet another unclaimed use case — who created this page and can I verify it?

## Trend 11: Agent Sandbox Infra Is a Funded Category
- Ardent (YC P26): instant Postgres sandboxes for coding agents to test against
- Gigacatalyst: sandboxed app generation inside SaaS platforms
- Pattern: give agents safe, isolated environments to work in
- **Implication:** Sandbox (input/test) is funded. Published output (what agents create that persists) is unfunded. ZenBin is the output sandbox — where agent creations get hosted, attributed, and shared.

## Trend 12: Agents Are Creating Content — But Publishing Is Bespoke
- Comedy podcast agent pipeline: fully automated content creation (ideation → script → voice → publish to Spotify), but the publishing step is manually wired
- Ask HN: "What features are missing in agent frameworks?" — community lists memory, debugging, controls, orchestration. No one mentions output/publishing
- Business Insider: "AI coders carrying half-open laptops" — agents are mainstream cultural phenomenon
- Anthropic report: 60% of orgs use agents for report generation (the #2 enterprise use case)
- Lyfe Ninja Ask HN: "Would you use revocable digital signatures to verify AI content?" — someone is now asking about output verification, but has no product
- Plato (Purple Pincher): agents publishing their failure logs publicly — agent output transparency as a pattern
- Probus: 3-agent vulnerability scanner with isolated QA verification — verification before publishing as a trust pattern
- **Implication:** Agents are producing content at scale, but there's no standard infrastructure for publishing, attributing, or sharing that output. The category doesn't even have a name yet. ZenBin defines it.

## Trend 13: Per-Agent Identity Is Scaling to Personal Use
- Deckard: individual user running 4+ agents across different machines (Mac, Proxmox VM, Linux LXC, Telegram) needs per-agent auth + scoped access
- Each agent gets its own token + ACL profile. Full-trust agents still require approval for destructive ops.
- "Which agent is calling?" — once you ask, the answer can't be "it doesn't matter"
- **Implication:** Identity/access is scaling down from enterprise to personal deployments. Output identity (which agent published this, on whose behalf) follows the same pattern — personal and enterprise.

## Trend 14: Agent Security Stack Framing Emerges
- Keycard.ai maps the agent security stack into 4 layers: Transport, Identity, Policy, Runtime
- Transport: MCP + OAuth 2.1 (won layer). Identity: WIMSE/SPIFFE/AAuth (competing). Policy: gateway evaluation (AgentGate/Agentgateway). Runtime: sandboxes/guardrails (under-served).
- CrowdStrike acquired SGNL for $740M (Jan 2026), Palo Alto acquired CyberArk for $25B (Feb 2026) — both cited agentic identity
- Notable absence: no output/publishing layer in the model. The security stack ends at runtime.
- **Implication:** The industry is now self-consciously mapping agent security. Keycard's model is the clearest articulation — and it explicitly has no output layer. This validates ZenBin's positioning as the 5th layer.

## Trend 15: Agent Commerce Is Becoming Real
- DialtoneApp: card payments infrastructure for bot commerce with .well-known/* product discovery
- Auto Agent Protocol: domain-specific A2A for car dealerships
- Agents need to transact — and transactions produce output (receipts, confirmations, reports)
- **Implication:** When agents can buy things, they need to publish proof of purchase. Agent commerce creates a new class of agent output that needs hosting, attribution, and verification.

## Trend 16: Skills Over MCP — The Backlash Begins
- InsForge (YC P26) explicitly rejected MCP for infrastructure management, citing context bloat, oversized payloads, and missing capabilities (telemetry, configs)
- Their alternative: CLI + Skills approach — teach agents to use the platform via natural language skill files, not MCP tool calls
- Tracecast also skipped MCP: "This decision was made to ensure high quality AI queries and limit tool bloat"
- Pi MCP Bridge took a middle path: uses MCP as a connector but wraps it around Pi's coding agent execution layer ("Stop building MCP servers from scratch. A coding agent already built the hard part.")
- Pattern: MCP won the simple tool-calling layer, but for complex, stateful, multi-step operations, the community is exploring alternatives
- **Implication:** The "MCP for everything" era is hitting limits. For infra management, debugging, and stateful operations, Skills/CLI patterns may win. But for agent output/publishing, neither MCP nor Skills addresses the core need — agents need a destination for what they create.

## Trend 17: Contracts and Identity Primitives Are Spreading Across Every Infrastructure Layer
- Prisma Next (May 22): hashes data contracts for identity, uses hash to "sign" DB compatibility. "Strong enough primitives to safely delegate to an agent."
- OTA (May 22): defines readiness contracts for repos — explicit operational contract for what a repo needs, how it becomes ready, how tasks run. "Doctor first, contract second."
- ZenBin: attests publishing contracts for content — Ed25519 signature proves who published what, when, from what sources.
- The pattern: every infrastructure layer (data, execution, output) is converging on contracts + cryptographic identity as the trust primitive. Hash → identity → sign/verify.
- **Ed25519 converging as agent identity standard:** AIP (Agent Intent Protocol) is the fourth independent system using Ed25519 for agent identity (AAuth, AIP, TBN, ZenBin). The cryptographic primitive is settling. Differentiation is in application: AIP = pre-execution verification, AAuth = protocol-level auth, TBN = attestation certificates, ZenBin = output signing. All compatible, all orthogonal.
- **Tiered verification is a design pattern:** AIP's 3-tier model (HMAC <1ms / Ed25519 ~5ms / full pipeline ~50ms) validates that not every action needs full crypto. This maps to content publishing: casual output needs lightweight attestation, high-value published content needs full Ed25519 signing. ZenBin could adopt tiered attestation levels.
- **MCP security is now a category, not a project:** Two security scanners (MCP-safeguard with 52 rules, Mcpaudit) launched the same day. The input verification side of the agent ecosystem is getting crowded. Output verification remains empty.
- **Contracts + identity spreading across every layer:** Prisma Next (data contracts), OTA (readiness contracts), AIP (intent contracts), ZenBin (publishing contracts). Every infrastructure layer is converging on contracts + cryptographic identity as the trust primitive.
- **Implication:** Prisma hashes schemas, OTA hashes repo readiness, AIP signs intent envelopes, ZenBin signs published content. The cryptographic identity pattern is spreading across layers. Each layer needs its own contract type. ZenBin owns the output/publishing contract.

## Signals from This Cycle

| Signal | Source | Date |
|--------|--------|------|
| eXo MCP Server — enterprise workplace tools via MCP + OAuth | exoplatform.com | 2026-05-19 |
| Claude Soul — cross-session behavioral learning for Claude Code | github.com/DomDemetz | 2026-05-18 |
| InsForge — Heroku for coding agents, Skills over MCP (YC P26) | github.com/InsForge | 2026-05-18 |
| Tracecast — generative data apps, read-only presentation layer | github.com/tracecast | 2026-05-18 |
| AgentVoy — scaffold for 7 agent frameworks | github.com/agentvoy | 2026-05-18 |
| Andon FM — AI agents running live radio stations | andonlabs.com | 2026-05-18 |
| Pi MCP Bridge — persistent shared workspace for all AI tools | news.ycombinator.com | 2026-05-17 |
| AAuth Knowledge Graph Explorer — 72 flow visualization | mcp-shark.github.io | 2026-04-23 |
| MCPS — cryptographic identity and message signing for MCP agents | mcp-secure.dev | 2026-03-13 |
| Twill.ai (YC S25) — cloud agent sandboxes + memory | twill.ai | 2026-04-10 |
| MemEye — visual-centric agent memory evaluation | huggingface.co | 2026-05-18 |
| AI Agent Passport RFC | github.com/StacyStarchum | 2026-05-12 |
| Ably Durable Sessions blog | ably.com | 2026-05-13 |
| Manufact MCP dev tools (Show HN) | news.ycombinator.com | 2026-05-12 |
| Voker agent analytics (Launch HN, YC S24) | news.ycombinator.com | 2026-05-12 |
| Gigacatalyst embedded AI (Show HN) | news.ycombinator.com | 2026-05-12 |
| Hopper agentic mainframe (Show HN, 79 pts) | news.ycombinator.com | 2026-05-12 |
| Recursant agent control plane (Show HN) | news.ycombinator.com | 2026-05-13 |
| Graphmind persistent memory (Show HN) | news.ycombinator.com | 2026-05-13 |
| Elecz MCP electricity data (Show HN) | news.ycombinator.com | 2026-05-13 |
| Monghoul MongoDB GUI + MCP (Show HN) | news.ycombinator.com | 2026-05-13 |
| IETF agent-auth draft | datatracker.ietf.org | 2026-03 |
| OpenID AI identity whitepaper | openid.net | 2025-10 / 2026-05 |
| Strata/CSA agent identity survey | strata.io | 2026-05 |
| IBM Think 2026 identity focus | ibm.com | 2026-05 |
| RSA 2026 agent identity prominence | biometricupdate.com | 2026-03 |
| Ratify Protocol — offline-first agent auth (Show HN) | github.com/identities-ai | 2026-05-13 |
| AgentGate — PDP for AI agents (Show HN) | github.com/ElamOlame31 | 2026-05-13 |
| Ardent — Postgres sandboxes for agents (YC P26, Launch HN, 52 pts) | tryardent.com | 2026-05-13 |
| Sinain — Context OS for agents (Show HN) | anthillnet.com | 2026-05-13 |
| Recursant — full mesh architecture (Show HN) | github.com/ajensenwaud | 2026-05-13 |
| Sunex Optics — MCP server for camera hardware (Show HN) | sunex-ai.com | 2026-05-13 |
| AAuth deep dive + working prototype | blog.christianposta.com | 2026-05-12 |
| Anthropic 2026 State of AI Agents Report | claude.com/blog | 2026-05-14 |
| Plato / PurplePincher — shared memory post-mortem | news.ycombinator.com | 2026-05-13 |
| Ardent — 89 pts, 35 comments (up from 52→80→89) | tryardent.com | 2026-05-14 |
| Ask HN: What features are missing in agent frameworks? | news.ycombinator.com | 2026-05-14 |
| AI coders half-open laptops (Business Insider, 20 pts) | businessinsider.com | 2026-05-14 |
| Comedy podcast agent pipeline (auto-publish to Spotify) | news.ycombinator.com | 2026-05 |
| Deckard — per-agent identity + ACL for Apple services MCP | github.com/lapidakis | 2026-05-14 |
| MementoVault — self-hosted AI context via MCP | mementovault.meltinbitfarm.cloud | 2026-05-14 |
| DiscordMcp — controlling servers through MCP | blog.rastrian.dev | 2026-05-14 |
| N8n-MCP — workflow generation MCP server | github.com/AutomateLab-tech | 2026-05-14 |
| SicariusGuard — Solana safety oracle MCP | github.com/Chronolapse411 | 2026-05-14 |
| Ardent — 94 pts, 44 comments (up from 52→80→89→94) | tryardent.com | 2026-05-14 |
| Keycard.ai — Agent Security Stack (4-layer model) | keycard.ai/blog | 2026-05-14 |
| Ratify Protocol v1.0.0-alpha.8 (C/C++ added) | github.com/identities-ai | 2026-05-14 |
| Lyfe Ninja — Revocable signatures for AI output (Ask HN) | lyfe.ninja | 2026-04-21 |
| Auto Agent Protocol — A2A for car dealerships | github.com/auto-agent-protocol | 2026-04-30 |
| DialtoneApp — Bot commerce payments | dialtoneapp.com | 2026-04-21 |
| Kantext — Context as first-class data type | kantext.dev | 2026-05-14 |
| Manufact/mcp-use — How we made MCP dev feel good (Show HN) | manufact.com | 2026-05-12 |
| AAuth deep dive + working prototype | blog.christianposta.com | 2026-05-12 |
| Probus — 3-agent vulnerability scanner with isolated QA | github.com/etairl | 2026-05-13 |
| Plato / PurplePincher — agents publishing failures | plato.purplepincher.org | 2026-05-13 |
| Keycard.ai — Agent Security Stack 4-layer model | keycard.ai/blog | 2026-05-14 |
| AAuth deep dive with Keycloak + Agentgateway + A2A + MCP prototype | blog.christianposta.com | 2026-05-12 |
| Ratify Protocol — Show HN (offline cryptographic agent auth) | github.com/identities-ai | 2026-05-13 |
| Facet Protocol / KYAPay — open IETF agent-identity standard | github.com/facet-llc/spec | 2026-05 ~09 |
| Ardent (YC P26) — Postgres sandboxes for agents, 96 pts | tryardent.com | 2026-05-13 |
| Deckard — per-agent identity MCP for Apple services | mike.lapidak.is | 2026-05-14 |
| MementoVault — self-hosted AI context via MCP | mementovault.meltinbitfarm.cloud | 2026-05-14 |
| DiscordMcp — server control via MCP | blog.rastrian.dev | 2026-05-14 |
| N8n-MCP — workflow generation MCP server | github.com/AutomateLab-tech | 2026-05-14 |
| vdiff — structural code review for agents (BYOK, local) | github.com/4bk/vdiff | 2026-05-14 |
| Business Insider — AI coders half-open laptops (40 comments) | businessinsider.com | 2026-05-14 |
| Notesasm — Dual-agent Build+QA kanban, MCP input | notesasm.com | 2026-05-19 |
| YouTube MCP — local MCP server for YouTube (5 pts) | github.com/umbertotancorre | 2026-05-19 |
| VeilGate — Deception reverse proxy for agent traffic | news.ycombinator.com | 2026-05-19 |
| CloudNSite — Pre-built agent library for SMBs | news.ycombinator.com | 2026-05-19 |
| DDS Vibe Academy — AI-built curriculum, agent authorship with no attribution | ddsboston.com | 2026-05-19 |
| Silicon Psyche PSA — Behavioral health monitor for LLMs (9 pts) | splabs.io | 2026-05-19 |
| Open Prompt Hub — GitHub for prompts, agent publishing via prompts | openprompthub.io | 2026-03-18 |
| Statespace — Search engine for llms.txt sites, agent-first CLI/SDK/MCP | statespace.com | 2026-04-28 |
| Prisma Next — Data contracts with identity hashing, agent DX (12 pts) | github.com/prisma/prisma-next | 2026-05-22 |
| OTA — Repo readiness contracts for agents (3 pts) | ota.run | 2026-05-22 |
| Vibedock — MCP server toggle for Claude Code (1 pt) | vibedock.dev | 2026-05-22 |
| opub — Donated compute for open-source agents | opub.dev | 2026-05-21 |
| iClaw — AI agent using Apple Intelligence (7 pts) | geticlaw.com | 2026-04-28 |
| Google Cloud AI Agent Trends 2026 Report | services.google.com | 2026-05 |
| AgentRecall — Persistent memory for agents via MCP (6 pts) | agentrecall.cloud | 2026-05-22 |
| MCP-safeguard — Security scanner for MCP servers (2 pts) | github.com/SyedAnas01/mcp-safeguard | 2026-05-21 |
| 1Password MCP Server for OpenAI Codex (5 pts) | 1password.com | 2026-05-21 |
| Runtime (YC P26) — Team-safe agent sandboxing (89 pts) | runtm.com | 2026-05-22 |
| PII Firewall — Domain-specific PII sanitization for agents (3 pts) | pii-firewall.com | 2026-05-21 |
| AIP — Agent Intent Protocol, Ed25519 signed intents (Show HN) | news.ycombinator.com | 2026-05-22 |
| MCP-safeguard — Security scanner for MCP servers, 52 rules | github.com/SyedAnas01/mcp-safeguard | 2026-05-22 |
| Mcpaudit — Static security scanner for MCP servers | github.com/allenwu-blip/mcpaudit | 2026-05-22 |
| Persistent MCP Workspace — Shared filesystem + auth for multiple AI tools | news.ycombinator.com | 2026-05-19 |
| opub — Donated compute for open-source agents (2 pts) | opub.dev | 2026-05-21 |
| YouTube MCP — 8 tools for YouTube content (5 pts) | github.com/umbertotancorre/youtube-mcp | 2026-05-19 |
| SoMatic — Vision-based OS automation framework for agents | github.com/Smyan1909/SoMatic | 2026-05-21 |
| Golf MCP Scanner — Enterprise MCP security, YC X25, open source | github.com/golf-mcp | 2026-05-22 |
| Nable — Cloud/SaaS billing MCP server | getnable.com | 2026-05-23 |
| Guesty MCP Server — Property management, 43 tools, open source | npmjs.com/package/guesty-mcp-server | 2026-05-23 |
| Jenova AI — Agent publishing platform (deploy access, not output) | jenova.ai | 2026-05 |
| Clear Data Science — Agents as workflow orchestrators (CES 2026) | cleardatascience.com | 2026-05 |
| Cordium — FOSS sandbox with identity-based secretless infrastructure access | github.com/octelium/cordium | 2026-05-25 |
| Silicon Psyche PSA — Behavioral health monitor for LLMs and agents | splabs.io | 2026-05-19 |
| DDS Vibe Academy — 31 AI coding classes built by agents | ddsboston.com | 2026-05-19 |
| AAuth Explorer — Interactive graph for AAuth protocol, 72 flows | mcp-shark.github.io/aauth-explorer | 2026-04 |
| Runtime (YC P26) — Team-wide agent sandbox infra (100 pts, 30 comments) | runtm.com | 2026-05-21 |
| ChronoGuard — Zero-trust proxy for browser automation agents | github.com/j-raghavan/chronoguard | 2026-05 |
| Ink (ml.ink) — Agent-first deployment platform (32 pts) | ml.ink | 2026-03 |
| ClawHosters — OpenClaw managed hosting, prewarmed VPS | clawhosters.com | 2026-05 |
| vdiff — CLI to review AI-generated code, tree-sitter + LLM | github.com/4bk/vdiff | 2026-05-02 |
| Cordium — FOSS sandbox with identity-based secretless infrastructure access | github.com/octelium/cordium | 2026-05-25 |
| Silicon Psyche PSA — Behavioral health monitor for LLMs and agents | splabs.io | 2026-05-19 |