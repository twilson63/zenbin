# AI Agent Standards Landscape

Last updated: 2026-05-29 06:14 UTC

## Active Standards & Specs

### MCP (Model Context Protocol) — Anthropic
- **Status:** De facto standard for connecting AI models to external tools and data. Donated to Linux Foundation's Agentic AI Foundation.
- **Adoption:** 97M+ monthly SDK downloads, 10,000+ public MCP servers. Cited by OpenID Foundation whitepaper as "the leading standard for connecting AI models to external data sources and tools"
- **Ecosystem:** Manufact/mcp-use SDK + Inspector, Ledgr, Hoop, dozens of MCP servers
- **Key spec features:** notifications/tools/list_changed for HMR, resource templates, sampling, MCP Apps (tools returning interactive UI), structured Task API (SEP-1686)
- **2026 Roadmap (May 2026):**
  1. Transport Evolution & Scalability — Stateless sessions for horizontal scaling, `.well-known` metadata for server discovery
  2. Agent Communication — Tasks primitive iterating toward production (retry, expiry, lifecycle)
  3. Governance Maturation — Delegated SEP review, contributor ladder, removing core maintainer bottleneck
  4. Enterprise Readiness — Audit trails, SSO auth, gateway behavior, config portability (mostly as extensions)
  - On the Horizon: triggers/event-driven updates, streamed/reference-based result types, deeper security/auth work, extensions ecosystem
  - Active SEPs: SEP-1932 (DPoP), SEP-1933 (Workload Identity Federation)
- **MCP v2 Beta (March 2026):** Breaking changes, stricter auth, structured Task API for A2A delegation in Google ADK
- **Microsoft Agent Governance Toolkit (AGT):** Open-source runtime governance layer for MCP tool execution
- **72% context window problem:** Tool schemas consuming 72% of context window when connecting to multiple servers
- **Gap:** No standard for agent output/publishing. MCP is read/action, not write/publish. The 2026 roadmap has zero mention of content attribution or what happens after agents produce durable output.

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

### IETF Draft: AI Agent Auth & Authorization (draft-klrc-aiagent-auth-00)
- **What:** Standards-track approach to agent auth using WIMSE + OAuth 2.0
- **Key concepts:**
  - Agents are workloads (WIMSE model)
  - Agent Identifier (unique, verifiable)
  - Agent Credentials (provisioning, rotation)
  - Agent Attestation (proof of identity/state)
  - Three auth models: user-delegated, agent-own, system/agent-to-agent
  - WIMSE Proof Tokens (WPTs) for application-layer auth
  - HTTP Message Signatures (RFC 9421) for request integrity
  - OAuth 2.0 delegation with security best practices
- **Approach:** Extend existing standards, not invent new ones
- **Status:** Internet-Draft, expires Sept 2026
- **URL:** https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/, https://www.ietf.org/archive/id/draft-klrc-aiagent-auth-00.html

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

### AI Agent Passport — Stacy Starchum / Jay Volpenheim
- **What:** Open identity standard — signed, verifiable JSON document that travels with an AI agent
- **Approach:** Ed25519 signatures, DID-based owner identity, scoped permissions, spend limits, registry verification
- **Key features:**
  - Cryptographic proof of agent ownership
  - Scoped permissions (read, book, purchase)
  - Enforced spend limits (per-transaction, per-day, per-month)
  - Registry-verified trust levels
  - Instant revocation of compromised agents
- **SDKs:** Python, Node.js stubs
- **Status:** RFC — actively seeking feedback before v1
- **URL:** https://github.com/StacyStarchum/Ai-agent-passport-
- **Relationship to others:** Transactional trust layer ("agent driver's license") — complementary to AAuth's auth protocol and IETF's workload model

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

### HDP (Human Delegation Provenance) — IETF Internet-Draft (draft-helixar-hdp-agentic-delegation-00)
- **What:** Lightweight token-based protocol that cryptographically captures and verifies human authorization in multi-agent delegation chains. Published as IETF Internet-Draft, April 2026.
- **Approach:** Ed25519-signed append-only delegation chain. Each agent's delegation action is a signed "hop." Verification requires only the issuer's Ed25519 public key and session identifier — fully offline, no registry or third-party trust anchor.
- **Key insight:** Existing standards (OAuth 2.0 Token Exchange RFC 8693, JWT RFC 7519, UCAN, Intent Provenance Protocol) all fail to address multi-hop, append-only, human-provenance requirements of agentic systems. HDP fills that gap.
- **Properties:** Offline verification, append-only chain, scope attenuation (child ≤ parent), human-provenance binding
- **Reference implementation:** TypeScript SDK (@helixar_ai/hdp on npm), Python integrations
- **Status:** v0.1, open for review. IETF Internet-Draft expires September 2026.
- **URL:** https://arxiv.org/abs/2604.04522, https://github.com/Helixar-AI/HDP
- **Relationship to others:** HDP is delegation-chain focused (like Ratify) but optimized for human→agent provenance specifically. Unlike AAuth (web auth) or AIP (comprehensive identity), HDP targets one narrow problem: proving the human authorized the chain. Still input-side — proves WHO authorized WHAT, not what the agent PUBLISHED.

### ArkForge Trust Layer — Cryptographic Proof for Agent Transactions (March 2026)
- **What:** Certifying proxy that produces cryptographic proofs for agent API transactions. Three independent witnesses: Ed25519 signature + RFC 3161 Timestamp Authority + Sigstore Rekor transparency log.
- **How it works:** Agent sends API call through Trust Layer proxy. Proxy forwards to target API, captures response, produces proof:
  - Witness 1: Ed25519 signature on chain_hash (SHA-256 of request + response + payment_id + timestamp + fingerprints)
  - Witness 2: RFC 3161 TSA (DigiCert/Sectigo/FreeTSA pool) — proves proof existed at that moment
  - Witness 3: Sigstore Rekor append-only transparency log — same log Linux Foundation uses for supply chain security
- **Key insight:** Logs are mutable, timestamps are forgeable, API responses vanish. In disputes, "here's our database" isn't enough. EU AI Act Article 14 demands more.
- **Properties:** To forge a proof, you'd need to compromise ArkForge's key + a WebTrust-certified TSA + the public Sigstore log simultaneously.
- **Use cases:** Agent-to-agent commerce, compliance-sensitive sectors (finance, healthcare, legal), multi-tenant agent platforms
- **Pricing:** Free tier: 500 proofs/month
- **URL:** https://arkforge.tech/trust/, https://dev.to/arkforge-ceo/how-we-built-cryptographic-proof-for-ai-agent-transactions-2p8g
- **Relationship to others:** Closest analogue to Darwin Agentic Cloud but for API transactions (not compute execution). Darwin attests to compute provenance; ArkForge attests to transaction provenance. Neither addresses publishing provenance (what content the agent created and published). Three-way complementarity: Darwin (compute) + ArkForge (transactions) + ZenBin (publishing).

### EqhoIDs Agent-to-Agent Trust Protocol (2026)
- **What:** Open protocol for agent-to-agent identity verification, delegation, and accountability using Ed25519 passports, delegation chains, and signed receipts.
- **Key insight:** Google A2A and Anthropic MCP solve interoperability, but neither provides protocol-level answers for identity verification, delegation of authority, or accountability between agents from different creators.
- **Approach:** Each agent registered with Ed25519 key pair, enabling cryptographic signing of payloads. Delegation chains and signed receipts for accountability.
- **Signal:** Another independent convergence on Ed25519 as the trust primitive for agent identity. The space is rapidly fragmenting into many competing protocols, all converging on the same crypto primitives but optimizing for different trust models.
- **Relationship to others:** Complements A2A (communication) and MCP (tool-calling) with a trust layer. Overlaps with Ratify (delegation) and HDP (human provenance) but focuses on agent-to-agent trust specifically.

### A2A (Agent-to-Agent Protocol) — Google
- **Context:** Referenced in AAuth prototype; inter-agent communication protocol
- **Status:** Emerging, less mature than MCP for tool connectivity

### IETF Draft: Agent Identity Protocol (AIP) — draft-singla-agent-identity-protocol-01
- **What:** The most comprehensive IETF Internet-Draft for agent identity to date. Defines decentralized identity, delegation, and authorization for autonomous AI agents.
- **Key features:**
  - W3C DID method (`did:aip`) with agent identity objects
  - Capability-based authorization with cryptographic delegation chains
  - Credential tokens with TTL, refresh, and explicit MCP integration (Section 8.4: Token Exchange for MCP)
  - Three architecture tiers: Core Identity, Credential/Delegation, Enterprise
  - Revocation management (CRL + push notifications)
  - DPoP and approval envelope support
  - Engagement objects for scoped, time-limited authorizations
- **Status:** Internet-Draft, expires October 20, 2026
- **URL:** https://www.ietf.org/archive/id/draft-singla-agent-identity-protocol-01.html
- **Relationship:** Supersedes/supercharges the earlier IETF agent auth draft (draft-klrc-aiagent-auth-00). AIP includes MCP token exchange as a first-class concept, acknowledging MCP as the standard transport. Still focused on WHO agents are and WHAT they're authorized to do — not on WHAT they produce.

### MCP 2026 Official Roadmap
- **What:** MCP project's 2026 roadmap, shifting from release milestones to priority-area working groups
- **Four priority areas:**
  1. Transport Evolution & Scalability — Stateless sessions, horizontal scaling, `.well-known` metadata for server discovery
  2. Agent Communication — Tasks primitive (SEP-1686) iterating: retry semantics, result expiry
  3. Governance Maturation — Contributor ladder, delegated SEP review for working groups
  4. Enterprise Readiness — Audit trails, SSO-integrated auth, gateway behavior, config portability (mostly as extensions)
- **On the Horizon:** Triggers/events, streamed/reference results, deeper security/auth, extensions ecosystem
- **Active SEPs:** SEP-1932 (DPoP), SEP-1933 (Workload Identity Federation)
- **Adoption:** 97M+ monthly SDK downloads, 81K+ GitHub stars as of March 2026
- **URL:** https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
- **Key signal:** Zero mention of output/publishing. MCP is all about getting data and tools TO agents. The output side is completely unaddressed.

### Microsoft Agent Governance Toolkit (AGT)
- **What:** Open-source (MIT) runtime security toolkit for AI agents addressing all 10 OWASP Agentic AI risks
- **Seven packages:** Agent OS (policy engine), DID-based identity, MCP security gateway, execution rings, Cross-Model Verification Kernel, circuit breakers/SLO enforcement, approval workflows
- **Framework integrations:** LangChain, CrewAI, Google ADK, Microsoft Agent Framework, Dify, LlamaIndex, Haystack, PydanticAI, OpenAI Agents SDK
- **Cross-language:** Python, TypeScript, .NET, Rust, Go
- **URL:** https://github.com/microsoft/agent-governance-toolkit
- **Relationship:** Governance layer that validates the market. Uses DID-based identity (who the agent is) + MCP gateway (what the agent can access). No output attestation.

### OWASP Top 10 for Agentic Applications (2026)
- **What:** First formal taxonomy of risks for autonomous AI agents, published December 2025
- **The 10 risks:** Goal hijacking, tool misuse, identity abuse, supply chain risks, code execution, memory poisoning, insecure communications, cascading failures, human-agent trust exploitation, rogue agents
- **Referenced by:** Microsoft AGT, EU AI Act (August 2026 enforcement), Colorado AI Act (June 2026)
- **URL:** https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

### OpenID Foundation — AI Agent Identity Management Whitepaper
- **What:** Community Group whitepaper on identity challenges for agentic AI
- **Key finding:** Current agent-centric protocols (like MCP) highlight the demand for clarified auth/authz practices. Autonomous agents raise complex questions about scalable access control, agent identity, and inter-agent trust.
- **URL:** https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf

### Cisco Zero-Trust Identity Framework for Agentic AI
- **What:** Zero-trust framework paper advocating purpose-built agent identity rather than adapting existing protocols
- **Core principle:** No agent (internal or external) is inherently trusted. Every interaction requires verification.
- **URL:** https://community.cisco.com/t5/security-blogs/a-new-identity-framework-for-ai-agents/ba-p/5294337

### AgentDID — Decentralized Identity for AI Agents (arXiv:2511.02841)
- **What:** Academic paper presenting a conceptual framework and prototype for agents with self-sovereign digital identities
- **Approach:** W3C DID + W3C Verifiable Credentials, ledger-anchored, cross-domain trust
- **Key finding:** Technically feasible, but "limitations once an agent's LLM is in sole charge to control the respective security procedures"
- **Accepted:** ICAART 2026 conference
- **URL:** https://arxiv.org/abs/2511.02841

### AgentPKI — Passport-based Edge Identity for Agents (May 2026)
- **What:** Open protocol (Apache 2.0) for agent identity on the public internet. Short-lived PASETO v4 passports signed with Ed25519.
- **Approach:** Three-tier trust — T1 DNS-verified (free), T2 KYB-verified, T3 hardware-attested. Verifier fetches issuer public key from `/.well-known/agentpki-issuer.json`.
- **Key features:**
  - Sub-50ms p99 edge verification
  - Mode A: bearer header (simple). Mode B: RFC 9421 HTTP Message Signatures (integrity)
  - CRL for revocation. 24h max passport lifetime.
  - Interop: MCP, A2A, Kite, SPIFFE, OWASP ANS
  - Self-serve issuer dashboard: claim domain, mint keys, deploy Worker
- **Signal:** Well-designed for bot-defense use case. But it's transport identity ("let this agent past your firewall"), not content identity ("this content was produced by this agent").
- **URL:** https://agentpki.dev/

### Five Eyes Guidance — Agent Identity Boundaries (May 1, 2026)
- **What:** 30-page guidance from CISA, NSA, and counterparts in AU/CA/NZ/UK directing teams to construct identity boundaries for autonomous agents
- **Reported by:** AgentLux blog (May 2026)
- **Signal:** Government-level regulatory push. Focuses on access control and audit, not content provenance.
- **URL:** https://agentlux.ai/blog/ai-agent-identity-why-cryptographic-credentials-matter-in-2026

## Where Standards Are Headed

1. **Agent identity has commodified** — Eight+ identity/auth specs now (AAuth, IETF draft, AIP, Passport, Ratify, Facet/KYAPay, AgentGate, AgentPKI, NIST, Cisco zero-trust, AgentDID, VAOS). The question "who is this agent?" has many competing answers. The question "what did this agent produce?" has zero.
2. **Delegation chains are mandatory** — Who authorized this agent? On whose behalf? Prove it. Ratify's DELEGATE→PRESENT→VERIFY, AAuth's delegation chains, AIP's capability-based delegation all formalize this.
3. **MCP for input, [gap] for output** — MCP handles tool/context connection. 2026 roadmap confirms this is all they're building. No equivalent standard for agent publishing/output.
4. **Progressive trust models** — Start anonymous/pseudonymous, scale to verified identity with delegation
5. **Policy enforcement at infrastructure layer** — Gateway pattern (Agentgateway, Microsoft AGT) rather than per-app security
6. **Quantum-safe signatures emerging** — Ratify mandates hybrid Ed25519 + ML-DSA-65. Facet plans Ed25519 audit records. Post-quantum is becoming a differentiator.
7. **Offline-first verification** — Ratify's <1ms offline verification is a new pattern. No network hop, no central authority.
8. **MCP token exchange is being standardized** — AIP Section 8.4 defines Token Exchange for MCP, acknowledging MCP as the de facto transport. This formalizes the bridge between identity and tool-calling.
9. **OWASP Agentic AI Top 10 creates formal risk taxonomy** — Gives enterprise security teams a reference framework. "Identity abuse" as a top-10 risk validates the identity problem.
10. **Government guidance is now formal** — Five Eyes (CISA/NSA + 4 agencies) published identity boundary guidance May 1, 2026. Regulatory tailwind is real.
11. **MCP security is a product category** — MCPSafe (scanner), Aigis (firewall), FlowLink (proxy/firewall). Input-side security is maturing. Output-side security is nonexistent.
12. **MCP ecosystem has reached distribution maturity** — Speakeasy's "every MCP server needs an install page" argument shows the ecosystem has enough servers that discovery is now a problem. Security tooling, dev tooling, and distribution all exist. MCP won input.
13. **Output validation is entering the agent stack** — CircleCI's Chunk sidecars validate agent-generated code before CI. This is the first major infrastructure player to build "validate agent output before publishing." Code-only, but the pattern is clear: validate-then-publish is becoming infrastructure.
14. **Triple-witness proof is the gold standard for agent transactions** — ArkForge combines Ed25519 + RFC 3161 TSA + Sigstore Rekor for independently verifiable, tamper-evident proofs. The three-witness model (signature + timestamp + transparency log) is stronger than any single attestation. Darwin Agentic Cloud uses Ed25519 + public keylist for compute attestations. ZenBin uses Ed25519 for publishing attestations. The pattern converges.
15. **Human delegation provenance is becoming an IETF standard** — HDP (draft-helixar-hdp) formalizes multi-hop delegation chains with Ed25519. Every identity protocol now agrees: delegation must be cryptographically verifiable. The output question remains unaddressed.
16. **Agent-to-agent trust is emerging as a distinct problem** — EqhoIDs identifies that A2A + MCP solve interoperability but NOT trust between agents from different creators. The trust layer is being built on top of communication/transport layers, not alongside them.

## ZenBin Opportunity

- **MCP is for input.** The 2026 roadmap confirms: 97M+ SDK downloads, zero mention of output/publishing. The output side — publishing, presenting, sharing agent-produced content — has no equivalent standard.
- **Every identity protocol proves WHO the agent is, not WHAT the agent CREATES.** AAuth/Ratify/KYAPay/AIP all focus on identity and authorization. ZenBin can be the output attestation layer: signed, verifiable, attributable agent content.
- **The visibility gap is real.** 80% of orgs can't track agent actions (Strata/CSA). OWASP lists "identity abuse" as a top-10 risk. Published output with identity/provenance is a transparency win.
- **Keycard's 4-layer model has no output layer.** Transport → Identity → Policy → Runtime covers everything EXCEPT what happens after the agent produces something. That's ZenBin's Layer 5.
- **GitHub's verification flaw proves even mature platforms can't solve content identity.** When the world's largest code platform can't reliably tie content to its creator (Verified badge checks committer key, not author identity), the need for a dedicated content attestation layer is clear. Agent commits make this worse.
- **Kernel zero-day (Dirty Frag) proves sandboxing alone isn't enough.** declaw.ai showed containers fail <2s against kernel exploits. Even microVMs with strong isolation still need orthogonal proof of output origin. Isolation ≠ attestation.
- **Daemons (70 pts on HN) validates the pain point.** They pivoted their entire company from building agents to cleaning up agent output. The output management problem is real and acknowledged.
- **AIP's MCP token exchange section** validates MCP as transport but shows that even the most comprehensive identity spec doesn't address output/publishing.
- **CircleCI's Chunk sidecars** validate agent-generated code before publishing to CI. First major infra player to treat agent output validation as infrastructure. Code-only, but the pattern validates ZenBin's broader vision: validate-then-publish for all agent output.
- **Open Prompt Hub** is publishing infrastructure for prompts (agent input). It validates that "publishing for agents" is a recognizable category. ZenBin does the same for agent output (what agents create).
- **GitHub's Verified badge proves committer but not author** (May 26 disclosure). The world's largest code platform has a well-documented identity gap: the green checkmark verifies the signing key holder, not the content author. Agent-generated commits make this worse. This is a real-world precedent for the content identity problem ZenBin solves.
- **Tigera's accountability framework explicitly recognizes the output gap** (May 26-27). Network policies, API gateways, and RBAC are all input-side controls. The security industry consensus is building: current controls cover what agents can access, not what they produce.
- **Darwin Agentic Cloud positions attestation as a protocol** (May 27). “Distributed attestation as the protocol for agentic programming” is a strategic vision that validates ZenBin's bet on signed content identity as infrastructure, not just a feature.
- **RootCX's governance framework formalizes the delegation model** (May 28). The "impersonation = trap, service account = trap, delegation = correct" model is the clearest articulation yet. The "agent knows nothing" pattern (all auth outside the agent) directly parallels ZenBin's approach to output signing.
- **Agent Trust Stack (11-layer framework) explicitly names output provenance as a gap** (May 28). Layer 7 (Audit & Provenance) asks "what did the agent actually do, and can we prove the record is complete and untampered?" — that's ZenBin's core value proposition. No other player addresses this layer.
- **CIAM guide shows 10-30% of auth volume is now agent traffic** (May 28). The `sub=agent, act=human` pattern is becoming standard for access tokens. This solves identity-for-access; ZenBin adds identity-for-output.
- **MCP AuthFlow and AgentAuth.co show MCP auth becoming a product category** (May 27-28). The access side is being solved. Output/publishing auth remains unaddressed.
- **AG2B introduces browser-side agent loops with WebMCP** (May 28). If agents run in-browser, client-side signing becomes viable. Thin proxy pattern aligns with ZenBin's publish API design.
- **VAEN packages agent harnesses as portable .agent files** (May 27). Agent portability is becoming a thing. ZenBin packages the output side (verifiable publications) — complementary to harness portability.
- **AstraCipher introduces W3C DIDs + post-quantum crypto specifically for AI agents** (May 28). MCP server for agent identity verification. Solves "who is this agent?" — ZenBin solves "what did this agent produce?" Complementary.
- **Rootcx delegation/intersection model formalizes agent governance** (May 28). "Impersonation = trap, service account = trap, delegation = correct." Effective authority = agent role ∩ human permissions. ZenBin's signing model is the output-side implementation of this principle.
- **Eco.com documents four commerce identity models for agents** (May 28). Tokenized identities (Mastercard), attestation headers (Visa), VCs (Google), DIDs (crypto). All input-side. Output attestation is unclaimed.
- **KYA (Know Your Agent) emerges as the agent equivalent of KYC** (May 28). ERC-8004 for on-chain agent identity. Trust scores, verification protocols. Another input-side identity standard.