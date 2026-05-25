# AI Agent Standards Landscape

Last updated: 2026-05-15

## Active Standards & Specs

### MCP (Model Context Protocol) — Anthropic
- **Status:** De facto standard for connecting AI models to external tools and data
- **Adoption:** Cited by OpenID Foundation whitepaper as "the leading standard for connecting AI models to external data sources and tools"
- **Ecosystem:** mcp-use SDK, Inspector tool, Ledgr, Hoop, dozens of MCP servers
- **Key spec features:** notifications/tools/list_changed for HMR, resource templates, sampling
- **Gap:** No standard for agent output/publishing. MCP is read/action, not write/publish.

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

### A2A (Agent-to-Agent Protocol) — Google
- **Context:** Referenced in AAuth prototype; inter-agent communication protocol
- **Status:** Emerging, less mature than MCP for tool connectivity

## Where Standards Are Headed

1. **Agent identity becomes a first-class concept** — Not "service account with a token" but cryptographic identity with attestation. Seven+ identity/auth specs now (AAuth, IETF draft, Passport, Ratify, Facet/KYAPay, AgentGate, NIST).
2. **Delegation chains are mandatory** — Who authorized this agent? On whose behalf? Prove it. Ratify's DELEGATE→PRESENT→VERIFY and AAuth's delegation chains both formalize this.
3. **MCP for input, [gap] for output** — MCP handles tool/context connection. No equivalent standard for agent publishing/output.
4. **Progressive trust models** — Start anonymous/pseudonymous, scale to verified identity with delegation
5. **Policy enforcement at infrastructure layer** — Gateway pattern (Agentgateway) rather than per-app security
6. **Quantum-safe signatures emerging** — Ratify mandates hybrid Ed25519 + ML-DSA-65. Facet plans Ed25519 audit records. Post-quantum is becoming a differentiator.
7. **Offline-first verification** — Ratify's <1ms offline verification is a new pattern. No network hop, no central authority.

## ZenBin Opportunity

- **MCP is for input.** The output side — publishing, presenting, sharing agent-produced content — has no equivalent standard.
- **AAuth/Ratify/KYAPay define who an agent IS, not what an agent CREATES.** ZenBin can be the output layer: signed, verifiable, attributable agent content.
- **The visibility gap is real.** 80% of orgs can't track agent actions. Published output with identity/provenance is a transparency win.
- **Keycard's 4-layer model has no output layer.** Transport → Identity → Policy → Runtime covers everything EXCEPT what happens after the agent produces something. That's ZenBin's Layer 5.