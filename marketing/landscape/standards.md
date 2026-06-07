# AI Agent Standards Landscape

Last updated: 2026-06-07 12:14 UTC

## Presenc.ai — Agent Reputation and Identity Layer Research (May 2026)

- **What:** Comprehensive landscape analysis of protocol-level identity and reputation infrastructure for AI agents.
- **Identity primitives in production:** W3C Verifiable Credentials (adopted by AAIF, Google, Anthropic, Visa), W3C DIDs (did:web, did:key, did:ion), AP2 Mandate Signing (60+ partners), Cloudflare Verified Bot Token, on-chain agent IDs (x402), OAuth-for-Agents extensions (IETF draft, not yet deployed).
- **Reputation systems in production:** Salesforce Trust Score, Microsoft Agent Trust Rating, AAIF Agent Reputation Network (emerging), Cloudflare Bot Score, Anthropic Agent Trust History, Visa Agent Behaviour Score.
- **Key takeaways:**
  1. VCs won the agent identity standards war
  2. Cross-platform reputation portability doesn't exist yet
  3. Reputation depreciates faster than identity (credit-score dynamics)
  4. Cloudflare evolving from bot-identity to agent-identity
  5. On-chain agent IDs growing for crypto-native flows
  6. OAuth-for-Agents is the missing piece — no shipping standard yet
- **For brands:** "Publish a verifiable credential for each agent identity, register with AAIF and major-platform agent registries, maintain reputation hygiene."
- **ZenBin angle:** Identity layer is converging (VCs + DIDs). Reputation is siloed. But NEITHER addresses output/content provenance. ZenBin fills the publishing gap: signed output creates portable, verifiable reputation signals without platform lock-in.
- **URL:** https://presenc.ai/research/agent-reputation-and-identity-2026

## Microsoft Agent Governance Toolkit (April 2026)

- **What:** Open-source toolkit providing runtime security for AI agents: policy enforcement, identity management, and reliability controls.
- **Part of:** Growing regulatory pressure (OWASP Top 10 for Agentic Applications, EU AI Act August 2026 full applicability, NIST concept paper on AI agent identity).
- **Scope:** Runtime governance — what agents can do, how they're identified, how they fail safely. NOT content/output governance.
- **ZenBin angle:** Microsoft is building runtime governance. Output governance (what agents publish, how to verify it) remains unaddressed.
- **URL:** https://opensource.microsoft.com/blog/2026/04/02/introducing-the-agent-governance-toolkit-open-source-runtime-security-for-ai-agents/

## MCP Server Config Security — "Before You Add an MCP Server to Your IDE, Read the Config" (June 5, 2026)

- **What:** Medium article highlighting that MCP server configs can effectively execute code on your machine. Users blindly adding MCP servers to IDEs without reviewing config is a growing security concern.
- **Signal:** MCP adoption is exploding but security awareness is lagging. The ease of adding MCP servers (one-click in IDEs) masks the underlying risk — each server gets filesystem access, network access, and code execution. This reinforces the need for identity/auth layers in MCP (MCPS already addresses this) and for output provenance (ZenBin's layer).
- **URL:** https://medium.com/open-ai/before-you-add-an-mcp-server-to-your-ide-read-the-config-like-it-can-execute-code-4334dc3e80b9 | HN: https://news.ycombinator.com/item?id=48418092

## Active Standards & Specs

### MCP Design Efficiency — Now Measurable (MCP-Eval, June 2026)
- **What:** First quantitative benchmark of MCP server design quality. Two MCP servers for the same app, same 40 tasks. Well-designed MCP-A used 637k input tokens; poorly-designed MCP-B used 3.17M (5× more). Same pass rate.
- **Root causes:** (1) Incomplete query responses forcing extra round-trips; (2) Raw JSON API data dumped into context; (3) Too many tools (47 vs 14) increasing decision burden.
- **Design principles:** Return what the agent needs for the NEXT action. Minimize tool count. Format responses for LLM consumption.
- **Signal:** MCP is maturing from "works" to "works efficiently." Token efficiency is now a measurable, published standard of quality.
- **ZenBin relevance:** ZenBin's API follows these principles — minimal endpoints, structured responses, LLM-friendly design.
- **URL:** https://github.com/Code-MonkeyZhang/mcp-eval | HN: https://news.ycombinator.com/item?id=48407391

### MCP (Model Context Protocol) — Anthropic
- **Status:** De facto standard for connecting AI models to external tools and data
- **Adoption:** Cited by OpenID Foundation whitepaper as "the leading standard for connecting AI models to external data sources and tools"
- **Ecosystem:** mcp-use SDK, Inspector tool, Ledgr, Hoop, dozens of MCP servers
- **Key spec features:** notifications/tools/list_changed for HMR, resource templates, sampling
- **Gap:** No standard for agent output/publishing. MCP is read/action, not write/publish.

- **Gap:** No standard for agent output/publishing. MCP is read/action, not write/publish.

### Jin Protocol — Agent Intent Protocol (AIP) + Jin Shield (June 2026)
- **What:** Open standard (CC0) for making websites/APIs legible to AI agents. AIP (.well-known/jin.json manifest mapping endpoints to natural language triggers) + Jin Shield (RS256 JWT passport verification gateway).
- **Identity model:** Centralized registry (meetjin.com) issues RS256 JWT passports. Agents register for free. Shield validates locally using cached JWKS keys (zero external network hops).
- **Web-agent interaction:** AIP serves as machine-readable sitemap for agent discovery. Shield protects endpoints from unauthorized scrapers while allowing verified agents through.
- **12 framework scanners:** Out-of-box route extraction for Next.js, Express, FastAPI, Django, Flask, Laravel, Rails, Fastify, Hono, NestJS, tRPC, and OpenAPI.
- **Status:** v0.2.6, npm package `@papercargo/jin-cli`, Apache 2.0 tooling
- **Relationship:** Web→agent access layer. Complements MCP (tool connection) by adding intent discovery and access control. Like MCPS but for web-access identity rather than MCP transport identity.
- **URL:** https://github.com/meetjin/jin

### Nori Skillsets — Agent Config Package Registry (June 2026)
- **What:** CLI + registry for managing agent skillsets as packages. Switch configs between agents with single command. Translates same skillset into each agent's expected format (MCP configs, AGENTS.md, skills, subagents, slash commands).
- **Key contribution:** Skillset-as-package pattern. Private registries for teams. Supports Claude Code, Cursor, Codex, Gemini CLI, OpenClaw, and 10+ agents.
- **Relationship:** Config/input management. Packages what the agent knows and can do. No output-side management.
- **URL:** https://github.com/tilework-tech/nori-skillsets

### AI Capability Registry — GitOps Capability Routing (June 2026)
- **What:** Dynamic capability routing for agents. Capabilities as versioned infrastructure with task/role/keyword routing indexes, trust tiers (trusted/reviewed/candidate), and pinned submodule dependencies.
- **Key contribution:** Explicit, auditable capability management. Agents load only what the current task needs. GitOps-style reproducibility.
- **Relationship:** Input-side capability management. Manages what agents can DO. No output-side attestation.
- **URL:** https://github.com/Friz-zy/ai-capability-registry

### AAuth (Agent Auth) — Dick Hardt
- **What:** Exploratory spec for agent-to-agent auth, unifying authn/authz
- **Built on:** OAuth 2.0 lessons (PKCE, DPoP, RAR, PAR, etc.) + HTTP message signing + discovery
- **Key contributions:**
  - Cryptographic identity for agents (JWKS + signed messages, no bearer tokens)
  - Unified identity + authorization in one protocol
  - Progressive identity: pseudonymous → stable → delegated
  - Explicit delegation chains (user → agent → sub-agent)
- **Prototype:** Working demo with Keycloak + Agentgateway + A2A + MCP
- **URL:** https://github.com/dickhardt/agent-auth

### MCPS — Cryptographic Security Layer for MCP (March 2026)
- **What:** MCPS adds a TLS-like security layer on top of MCP. Agent Passports (ECDSA P-256 signed identity), message signing (every JSON-RPC call wrapped in signed envelope), tool integrity (signed definitions prevent poisoning), replay protection (nonce + timestamp window), trust levels L0-L4, and real-time revocation via Trust Authority.
- **Security audit:** 39 agent frameworks scanned against OWASP Agentic AI Top 10: 13 FAIL, 17 WARN, 9 PASS. MCP has no identity layer — 41% of MCP servers have zero authentication (TapAuth research). CVE-2025-6514 scored CVSS 9.6.
- **Relationship:** MCP transport security. Like TLS for the agent↔tool communication layer. Complementary to ZenBin (which is like TLS for agent→consumer content layer).
- **URL:** https://mcp-secure.dev | https://github.com/razashariff/mcps

### MCP 2026 Roadmap — Official Protocol Update (June 2026)
- **What:** MCP core maintainers published the 2026 roadmap, shifting from release-milestone planning to Working Group-driven priority areas. Four priority areas: (1) Transport Evolution & Scalability (stateless sessions, horizontal scaling, .well-known metadata for server discovery), (2) Agent Communication (Tasks primitive lifecycle gaps — retry semantics, result expiry), (3) Governance Maturation (contributor ladder, WG delegation model), (4) Enterprise Readiness (audit trails, SSO-integrated auth, gateway behavior, configuration portability).
- **Key changes:** Streamable HTTP replaces deprecated HTTP+SSE. Session management via MCP-Session-Id header. DNS-rebinding protection (Origin header validation, 127.0.0.1 binding). No new transports this cycle — deliberate decision to keep the set small.
- **On the horizon (not top-4 but community interest):** Triggers/event-driven updates, streamed/reference-based result types, deeper security/authorization work (SEP-1932 DPoP, SEP-1933 Workload Identity Federation), extensions ecosystem maturation.
- **Governance shift:** SEPs aligned with priority areas get expedited review. SEPs outside priorities face longer timelines. Working Groups can accept SEPs in their domain without full Core Maintainer review.
- **Enterprise note:** Enterprise readiness expected to land as extensions, not core spec changes.
- **ZenBin angle:** MCP is formalizing transport and enterprise auth, but still has no output layer. The Tasks primitive covers agent↔tool interaction. No mechanism for agents to publish verifiable output. The .well-known metadata pattern for server discovery is analogous to what ZenBin could do for content discovery.
- **URL:** https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/ | Roadmap doc: https://modelcontextprotocol.io/development/roadmap

### Enterprise MCP Auth Patterns — OAuth 2.1 Compliance for MCP (May 2026)
- **What:** Detailed engineering guide on deploying MCP servers with spec-correct OAuth 2.1 + PKCE S256 authorization per the 2025-11-25 spec. Four enterprise deployment topologies: single-tenant stdio, multi-tenant row-isolated, federated gateway, and edge-cached read-only.
- **Key specs:** MCP 2025-11-25 mandates OAuth 2.1 + PKCE S256, RFC 9728 Protected Resource Metadata, RFC 8707 Resource Indicators. Token passthrough is explicitly FORBIDDEN — this is critical. Each MCP server must have its own audience-bound token.
- **Critical clarification:** Servers expose Tools/Prompts/Resources. Clients expose Sampling/Roots/Elicitation. Treating Sampling or Elicitation as server features produces incorrect security boundaries.
- **Four patterns:** (1) Single-tenant stdio (local process, env-based creds), (2) Multi-tenant row-isolated (separate schema per tenant, separate OAuth clients), (3) Federated gateway (central gateway aggregates multiple MCP servers, PRM delegation, per-backend tokens), (4) Edge-cached read-only (CDN-like pattern for static resources, short-lived tokens).
- **Security:** DNS-rebinding protection required. Confused-deputy attack surface explicitly called out. Dynamic Client Registration (RFC 7591) enables zero-config client onboarding for agent fleets.
- **ZenBin angle:** MCP is formalizing enterprise auth at the transport/tool layer. The spec explicitly bans token passthrough (each server gets its own audience-bound token). This reinforces the principle that identity and access must be scoped per-resource — exactly what ZenBin's signing model does for content. The enterprise readiness work is all about input; output provenance remains unaddressed.
- **URL:** https://www.digitalapplied.com/blog/mcp-server-patterns-enterprise-ai-agents

### GEF-SPEC-1.0 (Guard Execution Format) — GuardClaw (June 2026)
- **What:** Minimal protocol for cryptographic agent execution audit. JSONL ledger with SHA-256 causal hash chaining + Ed25519 per-entry signatures. Offline verification via CLI — anyone with the public key can verify full history without the original runtime.
- **Key design:** RFC 8785 canonicalized envelopes, SHA-256 causal chain, Ed25519 signatures, deterministic tamper detection.
- **Benchmarks:** ~762 writes/sec, ~9k verifies/sec, ~39MB RAM for 1M entries.
- **Relationship:** Execution audit layer. Proves what the agent DID (in what order, with what results). Complementary to ZenBin which proves what the agent PRODUCED (published content attestation). Same Ed25519 + hash chain pattern.
- **URL:** https://github.com/viruswami5511/guardclaw

### IETF Draft: AI Agent Auth & Authorization (draft-klrc-aiagent-auth-00)
- **What:** Standards-track approach to agent auth using WIMSE + OAuth 2.0
- **Key concepts:**
  - Agents are workloads (WIMSE model)
  - Agent Identifier (unique, verifiable)
  - Agent Credentials (provisioning, rotation)
  - Agent Attestation (proof of identity/state)
  - Three auth models: user-delegated, agent-own, system/agent-to-agent
- **Approach:** Extend existing standards, not invent new ones
- **Status:** Internet-Draft, expires Sept 2026
- **URL:** https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/

### OpenID Foundation — AI Agent Identity Whitepaper
- **What:** Community Group whitepaper on identity management for agentic AI
- **Key positions:**
  - Current OAuth/OIDC work for simple agents
  - MCP is the leading tool-connection standard
  - "Autonomy inflection point" will break current models
  - Need: recursive delegation, cross-domain trust, agent-native identity
  - Recommends separation of concerns for auth
- **URL:** https://openid.net/new-whitepaper-tackles-ai-agent-identity-challenges/

### NIST — AI Agent Identity Concept Paper
- **What:** Concept paper on identification, authorization, auditing, non-repudiation for AI agents
- **Focus:** Prompt injection controls, agent governance
- **Status:** Public comment period closed April 2026
- **URL:** https://csrc.nist.gov/pubs/other/2026/02/05/accelerating-the-adoption-of-software-and-ai-agent/ipd


### Proveyouragent — Ed25519 + DPoP Agent Identity Library (June 2026)
- **What:** Implementation-oriented agent identity library using signed software statements and DPoP proofs for every request.
- **Built on:** OAuth 2.0 Dynamic Client Registration / software statements (RFC 7591), DPoP (RFC 9449), Ed25519 keypairs, DNS/operator-domain trust anchor.
- **Key contributions:**
  - Agent-owned keypair and signed identity document.
  - Request-bound proof covering HTTP method + URI so stolen tokens are not replayable without the private key.
  - Explicit operator domain and optional model/prompt hash in the identity statement.
  - Delegation chains with human principal, orchestrator, sub-agent, and scope attenuation.
- **Status:** Open-source Python library, early/low-HN-engagement but concrete runnable implementation.
- **URL:** https://github.com/lujainkhalil/proveyouragent | HN: https://news.ycombinator.com/item?id=48354556
- **Relationship:** Sits between AAuth and AI Agent Passport: less protocol-heavy than AAuth, more request-auth focused than Passport. Like ZenBin, it favors Ed25519 and simple signed artifacts; unlike ZenBin, the signed artifact is an auth credential/request proof, not a durable published output.

### AI Agent Passport — Stacy Starchum / Jay Volpenheim
- **What:** Open identity standard — signed, verifiable JSON document that travels with an AI agent
- **Approach:** Ed25519 signatures, DID-based owner identity, scoped permissions, spend limits, registry verification
- **Key features:**
  - Cryptographic proof of agent ownership
  - Scoped permissions (read, write, book, purchase, communicate, execute)
  - Enforced spend limits (per-transaction, per-day, per-month; v1.1 also includes lifetime cap and confirmation threshold)
  - Registry-verified trust levels and real-time revocation checks
  - v1.1 schema adds owner jurisdiction/legal entity, builder/model/framework metadata, operational/restricted countries, regulatory frameworks, merchant/MCC scoping, renewal lifecycle, and registry-signed reputation fields
- **SDKs:** Python, Node.js stubs; SDKs still target `ai-agent-passport/v1` while `passport-v1.1.json` is present, so implementation appears pre-release/inconsistent
- **Status:** RFC — actively seeking feedback before v1; checked 2026-06-01 09:00 UTC: main remains `235e75d` (2026-05-10 initial commit), no tags/releases, no open/closed issues or PRs via GitHub API
- **Registry:** `https://registry.agentpassport.dev` was not reachable on 2026-06-01 (`ENOTFOUND` DNS), so registry verification/reputation remains aspirational for now
- **URL:** https://github.com/StacyStarchum/Ai-agent-passport-
- **Relationship to others:** Transactional trust layer ("agent driver's license") — complementary to AAuth's auth protocol and IETF's workload model
- **Impact on ZenBin Ed25519 model:** Aligned on Ed25519 key identity and signed canonical JSON, but Passport frames the key around owner/deployer authorization and commerce permissions rather than content provenance. ZenBin can keep Ed25519 as the agent publishing key while optionally mapping a Passport `agent_id`/owner DID into publisher metadata.
- **Integration opportunity:** Support optional `X-Agent-Passport` ingestion or attach a Passport reference/hash to ZenBin publications. This could let transaction-oriented agents publish signed receipts, audit pages, or merchant-facing artifacts with both ZenBin content provenance and Passport authorization context. Avoid hard dependency until the registry resolves and v1/v1.1 SDK/schema mismatch is cleaned up.

### Ratify Protocol — Identities AI, Inc.
- **What:** Open cryptographic trust protocol for human-to-agent and agent-to-agent authorization
- **Approach:** Three verbs: DELEGATE, PRESENT, VERIFY. Same primitive for both directions.
- **Key features:**
  - Hybrid signatures: Ed25519 + ML-DSA-65 (NIST FIPS 204, quantum-safe)
  - Offline verification in <1ms, no central authority needed
  - Delegation chains with scope attenuation (child ≤ parent)
  - JSON wire format, no blockchain, no tokens, no central issuer
  - Cross-language interop: Go, TypeScript, Python, Rust, C/C++
  - 59 canonical test vectors, reference implementation complete
- **Status:** v1.0.0-alpha.8, patent pending, CC-BY-4.0 spec
- **URL:** https://github.com/identities-ai/ratify-protocol
- **Relationship to others:** Offline/edge-optimized (drones, vehicles, voice) — complementary to AAuth's web/API focus and IETF's enterprise workload model

### Facet Protocol / KYAPay — IETF Agent-Identity Standard (May 2026)
- **What:** Open IETF agent-identity protocol with shipped reference implementation. Index for agent-ready businesses.
- **Approach:** Four standards stacked: KYAPay (identity, IETF), MCP (discovery), x402 (payments, Coinbase/USDC on Base L2), RFC 9421 (bot signing)
- **Key features:**
  - KYAPay: ES256 JWT + JWKS, web-bot-auth aligned per RFC 9421
  - Live verifier at facet.llc (402 Payment Required → identify via KYAPay)
  - Signed response provenance layer
  - Reputation registry, agent WAF, vertical depth, schema generation
  - TypeScript SDK: @facet/sdk-js with verifier + Terminal client
  - 10 conformance test vectors, CI-verified
- **Status:** v0.0.x (spec, schemas, verifier, Terminal client). v0.1.0 planned with Ed25519 audit-record verifier
- **URL:** https://github.com/facet-llc/spec
- **Relationship to others:** Transactional identity for agent↔business commerce. Closest to a "signed response provenance" model (merchant→agent), but not agent→world publishing.

### Keycard.ai — Agent Security Stack Framing (May 2026)
- **What:** Comprehensive framework mapping agent security into 4 layers: Transport, Identity, Policy, Runtime
- **Layer 1: Transport** — MCP with OAuth 2.1, RFC 9728 (Protected Resource Metadata), RFC 8707 (Resource Indicators), incremental scope consent
- **Layer 2: Identity** — Non-human identity standards (WIMSE, SPIFFE, AAuth). Agents as first-class identities.
- **Layer 3: Policy** — Authorization decisions at gateway level (AgentGate, Agentgateway, CEL-based policies)
- **Layer 4: Runtime** — Sandboxing, guardrails, behavioral monitoring. Called "the most under-served layer."
- **Notable absence:** No output/publishing layer in the model. The stack covers input through runtime only.
- **URL:** https://www.keycard.ai/blog/agent-security-stack/

### AgentGate PDP — Agent Authorization Layer
- **What:** Open-source Policy Decision Point for AI agents, sitting between agents and tools
- **Approach:** Evaluate every action against identity, scope, purpose, and real-time behavior
- **Key features:**
  - Trust scoring across 4 dimensions (identity 25%, delegation 25%, purpose alignment 30%, behavioral velocity 20%)
  - Scope attenuation across delegation chains
  - Human-in-the-loop escalation (ESCALATE outcome, 90s timeout)
  - Natural language policy rules
  - LangChain integration
- **Status:** Open source, initial release
- **URL:** https://github.com/ElamOlame31/agentgate-public
- **Relationship:** Enforcement layer — complements identity protocols by evaluating actions in real-time


### RootCX - AI Agent Governance: Identity, Delegation & Permissions in Practice (May 2026)
- **What:** Practical governance model for agent identity, delegation, and permissions.
- **Core argument:** Two common patterns fail: impersonating the user gives the agent the user's full blast radius, and static service accounts lose human accountability. The durable model is: agent has its own identity, acts on behalf of a human, and effective authority is the intersection of agent role and delegator authority.
- **Key phrase:** "The ceiling is the agent's role. The floor is the delegator. The effective authority is always the intersection."
- **Implementation principle:** The agent carries no tokens and does not check its own permissions; policy enforcement happens outside the agent process.
- **Status:** Thought-leadership / implementation framing, not a formal spec.
- **URL:** https://rootcx.com/blog/ai-agent-governance-implementation
- **Relationship:** Reinforces AAuth/IETF/Ratify direction: identity and delegation are externalized from prompts into infrastructure. For ZenBin, the analogous publishing rule is that publish rights should be external to the agent's text generation and bound to a verifiable key/delegation.

### Citizen of the Cloud - Agent Trust Stack (May 2026)
- **What:** 10-layer taxonomy for agent trust: compute/runtime, model, identity, reputation/history, authorization/policy, memory/context, tools/actions, transaction layer, interface layer, and governance/audit.
- **Key contribution:** Separates "who is this agent?" from "what is it allowed to do?", "what did it do?", and "is the runtime trustworthy?" This mirrors the market's move away from monolithic "agent security" claims.
- **Output relevance:** The taxonomy includes transaction/interface/governance layers, but still does not define a concrete signed publishing artifact or public content URL as a standard primitive.
- **Status:** Framework / market taxonomy.
- **URL:** https://www.citizenofthecloud.com/blog/agent-trust-stack-layered-framework
- **Relationship:** Useful positioning map: ZenBin is not the whole trust stack. It is the signed artifact/publication layer that can feed reputation, interface, and audit layers.

### OWASP - Practical Guide for Secure MCP Server Development (May 2026)
- **What:** Security guidance for MCP servers as delegated, tool-integrated connection points between assistants and external systems.
- **Focus:** Strong authn/authz, strict validation, session isolation, hardened deployment, and reducing chained-tool blast radius.
- **Status:** OWASP guidance, not a wire protocol.
- **URL:** https://genai.owasp.org/resource/a-practical-guide-for-secure-mcp-server-development/
- **Relationship:** MCP security is formalizing around tool access. It still leaves the output/publishing side untouched.

### A2A (Agent-to-Agent Protocol) — Google
- **Context:** Referenced in AAuth prototype; inter-agent communication protocol
- **Status:** Emerging, less mature than MCP for tool connectivity

### Proveyouragent — Cryptographic Identity for AI Agents (June 2026)
- **What:** Open-source Python library giving each agent an Ed25519 keypair, a signed software statement (identity document), and DPoP request signing per RFC 9449
- **Built on:** Ed25519, OAuth 2.0 Dynamic Client Registration (RFC 7591), DPoP (RFC 9449), HTTP Message Signatures (RFC 9421)
- **Key features:** Per-agent keypair, signed software statements, DPoP proof per request, delegation chains with scope narrowing, revocation registry
- **No blockchain, no DID:** DNS as trust anchor, public key at well-known URL
- **URL:** https://github.com/lujainkhalil/proveyouragent
- **Relationship:** Input-side identity (agent→API authentication). ZenBin is output-side identity (content provenance). Same crypto primitives, different problem.

### Presenc AI — Agent Reputation & Identity Landscape (May 2026)
- **What:** Comprehensive survey of production identity and reputation infrastructure for agents
- **Key finding:** W3C Verifiable Credentials won the agent identity standards war. Cross-platform reputation portability doesn't exist yet. OAuth-for-Agents is the missing piece.
- **Identity primitives in production:** W3C VC (AAIF/Google/Anthropic/Visa), W3C DID (did:web/did:key/did:ion), Google AP2 mandate signing (60+ partners), Cloudflare Verified Bot → agent, x402 on-chain agent IDs
- **Reputation systems:** Salesforce Trust Score, Microsoft Agent Trust Rating, AAIF Agent Reputation Network (emerging), Anthropic Agent Trust History, Visa Agent Behaviour Score
- **URL:** https://presenc.ai/research/agent-reputation-and-identity-2026
- **Relationship:** Confirms identity standards converging, but no mention of output provenance. ZenBin fills the output attestation gap.

## Where Standards Are Headed

### Provenance Protocol — Global Identity, Origin & Lineage Standard (provenanceprotocol.org, June 2026)
- **What:** Universal framework for verifying AI agent provenance — who created an agent, what data/models it's built on, what actions it performed, which entities own/operate it, and lineage of outputs/decisions.
- **Architecture:** Provenance Protocol (governance/rules) → Provenance Layer (infrastructure: identity, lineage, logging, validation) → Provenance Registry (lookup/audit index). Explicitly non-crypto, institution-ready.
- **Frames itself as "WHOIS for AI agents."** Six capabilities: agent identity, model/data lineage, ownership/custody, action provenance, multi-agent traceability, real-world asset provenance.
- **Status:** In development, v1.0 spec not yet released. Accepting early collaboration.
- **Relationship to ZenBin:** Provenance Protocol defines WHAT to track (identity, lineage, ownership, actions). ZenBin provides HOW to prove it cryptographically (Ed25519 signing, content digests). They're complementary — a registry needs something to register, and ZenBin content is exactly what a provenance registry should index.
- **URL:** https://provenanceprotocol.org/

### Microsoft Agent Governance Toolkit — Runtime Security Standard (April 2026)
- **What:** MIT-licensed, 7-package toolkit for deterministic, sub-millisecond policy enforcement on agent actions. First toolkit to address all 10 OWASP Top 10 for Agentic Applications (2026).
- **Key insight:** Applies OS kernel patterns (privilege rings, process isolation) + service mesh patterns (mTLS, identity) + SRE patterns (SLOs, circuit breakers) to AI agents.
- **Framework integrations:** LangChain, CrewAI, LlamaIndex, OpenAI Agents SDK, Haystack, LangGraph, PydanticAI, Dify. Multi-language: Python, TypeScript, Rust, Go, .NET.
- **Relationship to ZenBin:** Agent Governance Toolkit governs INPUT (what actions agents can take). ZenBin governs OUTPUT (what agents produced, verified). Different sides of the same governance coin.
- **URL:** https://github.com/microsoft/agent-governance-toolkit

### OWASP Top 10 for Agentic Applications (2026)
- **What:** First formal taxonomy of risks for autonomous AI agents. Published Dec 2025.
- **Key risks:** Goal hijacking, tool misuse, identity abuse, memory poisoning, cascading failures, rogue agents.
- **Relationship:** Microsoft Agent Governance Toolkit is the first implementation addressing all 10 risks. Identity abuse (risk #3) is directly relevant to ZenBin's identity layer.
- **URL:** https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

1. **Agent identity becomes a first-class concept** — Not "service account with a token" but cryptographic identity with attestation. RootCX/Citizen of the Cloud/OWASP join AAuth, IETF draft, Passport, Ratify, Facet/KYAPay, AgentGate, NIST, and now Proveyouragent in making identity/delegation explicit. W3C VC has won as the identity primitive. Provenance Protocol wants to be the "WHOIS for agents." Authentic Marketing / AI-ID.org is building artifact signing + blockchain archival for agent output.
2. **Delegation chains are mandatory** — Who authorized this agent? On whose behalf? Prove it. Ratify's DELEGATE→PRESENT→VERIFY, AAuth's delegation chains, RootCX's "agent ceiling / delegator floor", and Proveyouragent's scope-narrowing delegation all formalize this.
3. **MCP for input, [gap] for output** — MCP handles tool/context connection. No equivalent standard for agent publishing/output.
4. **Progressive trust models** — Start anonymous/pseudonymous, scale to verified identity with delegation
5. **Policy enforcement at infrastructure layer** — Gateway pattern (Agentgateway) rather than per-app security. Microsoft Agent Governance Toolkit is the most complete implementation.
6. **Quantum-safe signatures emerging** — Ratify mandates hybrid Ed25519 + ML-DSA-65. Facet plans Ed25519 audit records. Post-quantum is becoming a differentiator.
7. **Offline-first verification** — Ratify's <1ms offline verification is a new pattern. No network hop, no central authority.
8. **Secretless via MCP** — NHIMG/Akeyless promotes MCP as mediation point for short-lived, task-scoped credentials instead of static secrets. Input-side credential hygiene formalizing; output-side attestation unaddressed.
9. **Reputation is siloed per-platform** — Presenc confirms no cross-platform reputation portability exists yet. AAIF Agent Reputation Network is the most credible proposal but still working-group stage.
10. **Payment networks are the most deployed agent identity** — Visa TAP is live with 100+ partners; Mastercard Agent Pay is in pilot. Both use RFC 9421 HTTP Message Signatures. Centralized, transaction-focused, but production.
11. **Agent identity has three non-competing camps** — Payment networks (Visa/Mastercard), enterprise IAM (Trulioo/Vouched), crypto-native (Billions Network/ERC-8004). They solve different problems for different customers and haven't converged.
12. **Provenance stacks are aligning on Ed25519 + W3C VC + did:key** — Authentic Marketing's provenance stack proposal uses the exact same primitives as ZenBin (Ed25519, did:key, W3C VC). The market is converging on these as the building blocks.
13. **Output provenance is emerging as a distinct category** — Authentic Marketing/AI-ID.org is building "cryptographic provenance for AI agent output" with artifact signing + blockchain archival. This is directly adjacent to ZenBin's core proposition. EU AI Act traceability requirements (Aug 2026 enforcement) create urgency.
14. **NIST and EU are formalizing requirements** — NIST NCCoE "AI Agent Identity" concept paper (Feb 2026), EU AI Act Articles 11/12 traceability enforcement (Aug 2026). Provenance is moving from nice-to-have to regulatory requirement.

- **MCP hits consumer apps.** Strava and Tredict now ship MCP servers for end-user agent access. This validates MCP as the de facto standard for agent-tool interaction — and highlights the gap: no equivalent standard for agent publishing/output.

## ZenBin Opportunity

- **MCP is for input.** The output side — publishing, presenting, sharing agent-produced content — has no equivalent standard.
- **AAuth/Ratify/KYAPay/Proveyouragent define who an agent IS or how it signs requests, not what an agent CREATES.** ZenBin can be the output layer: signed, verifiable, attributable agent content.
- **The visibility gap is real.** 80% of orgs can't track agent actions. Published output with identity/provenance is a transparency win.
- **Keycard's 4-layer model has no output layer.** Transport → Identity → Policy → Runtime covers everything EXCEPT what happens after the agent produces something. That's ZenBin's Layer 5.