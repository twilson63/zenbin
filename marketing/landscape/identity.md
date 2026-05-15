# AI Agent Identity Landscape

Last updated: 2026-05-15

## The Big Picture

Agent identity is the hottest emerging topic in 2026. The industry has recognized that agents can't stay anonymous service accounts forever — they need first-class identity, delegation chains, and cryptographic proof.

Three new identity protocols this week (Ratify, AAuth, Facet/KYAPay) plus the Keycard 4-layer security framework confirm this is becoming a funded category. CrowdStrike acquired SGNL for $740M and Palo Alto acquired CyberArk for $25B — both citing agentic identity as a driver.

New this cycle: Deckard (per-agent identity + ACL for Apple services via MCP) shows the personal multi-agent identity model maturing. When you run 4+ agents across different machines, per-agent auth is essential, not optional.

The gap: **All identity protocols prove WHO the agent is and WHO authorized it. None prove WHAT the agent produced.** ZenBin's output attestation layer is unaddressed.

## Key Players & Standards

### IETF Draft: AI Agent Authentication & Authorization (draft-klrc-aiagent-auth-00)
- **What:** Formal IETF Internet-Draft proposing auth/authz model for AI agents
- **Approach:** Leverages existing WIMSE (Workload Identity in Multi-System Environments) + OAuth 2.0 family
- **Key idea:** Agents are workloads — treat them like workloads with their own identity, credentials, attestation
- **Covers:** Agent identifiers, credential provisioning, transport & application layer auth, delegation (user→agent, agent→agent, system→agent)
- **Status:** Active draft, expires Sept 2026
- **URL:** https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/

### AAuth (Agent Auth) — Dick Hardt
- **What:** Exploratory spec from OAuth 2.0 author Dick Hardt
- **Approach:** Unifies authn/authz into one protocol built for agent-to-agent communication
- **Key features:**
  - Cryptographically verifiable agent identity (signed HTTP messages, no bearer tokens)
  - Progressive identity scale: pseudonymous → stable identity → full delegation
  - Dynamic permission discovery
  - Cryptographic binding of permission requests to agents
  - Explicit, verifiable delegation chains
  - Integration with SPIFFE/WIMSE
- **Working prototype:** Full demo with Keycloak, Agentgateway, A2A, and MCP
- **URL:** https://github.com/dickhardt/agent-auth

### OpenID Foundation — AI Agent Identity Whitepaper
- **What:** Whitepaper from OpenID Foundation's AI Identity Management Community Group
- **Key findings:**
  - Current auth standards work for simple, bounded agents
  - MCP emerging as the leading standard for connecting AI models to external resources
  - "Autonomy inflection point" approaching — agents spawning sub-agents, crossing org boundaries
  - Current frameworks break down at recursive delegation, cross-domain trust, and autonomous scale
  - Recommends "separation of concerns" — specialized auth servers, not custom security per app
- **URL:** https://openid.net/new-whitepaper-tackles-ai-agent-identity-challenges/

### Strata / CSA Survey: Agent Identity Crisis (2026)
- **What:** Cloud Security Alliance survey of 285 IT/security pros on agent identity governance
- **Key findings:**
  - Only 18% highly confident current IAM can handle agent identities
  - 44% use static API keys, 43% username/password, 35% shared service accounts for agents
  - Only 28% can trace agent actions to a human sponsor across all environments
  - Only 21% maintain real-time inventory of active agents
  - Just 23% have formal enterprise-wide agent identity strategy
  - 55% cite sensitive data exposure as top concern
  - 40% increasing identity/security budgets specifically for AI agent risks
  - Human-in-the-loop rated essential but no architectural approach for HITL checkpoints at policy thresholds

## Ratify Protocol — Identities AI, Inc.
- **What:** Open cryptographic trust protocol for human-to-agent and agent-to-agent interactions
- **Approach:** Signed delegation certificates with hybrid Ed25519 + ML-DSA-65 (NIST FIPS 204) signatures — quantum-safe by design
- **Key features:**
  - Three verbs: DELEGATE, PRESENT, VERIFY — symmetric for human→agent and agent→agent
  - Offline verification in <1ms, no central authority or network call needed
  - Delegation chains with scope attenuation — child agent can never exceed parent permissions
  - JSON wire format, no blockchain, no tokens, no central issuer
  - 59 canonical test vectors, cross-language interop proven (Go, TypeScript, Python, Rust)
- **Comparison:** Unlike AAuth (OAuth-evolved, bearer-token-free) and AI Agent Passport (driver's license model), Ratify is offline-first and quantum-safe. No live verification endpoint needed.
- **Status:** v1.0.0-alpha.7, reference implementation complete, patent pending
- **URL:** https://github.com/identities-ai/ratify-protocol
- **Signal:** Fourth identity/auth protocol in the space. Each optimizes for different trust models. Fragmentation is real.

## AgentGate — Policy Decision Point for AI Agents
- **What:** Open-source PDP (Policy Decision Point) that sits between AI agents and their tools
- **Approach:** Every action evaluated against identity, scope, declared purpose, and real-time behavior
- **Key features:**
  - Three outcomes: PERMIT, ESCALATE, DENY
  - Trust scoring: identity (25%), delegation chain (25%), purpose alignment via embeddings (30%), behavioral velocity (20%)
  - Scope attenuation across delegation chains — child never exceeds parent
  - Human-in-the-loop escalation with auto-deny after 90s timeout
  - Natural language policy rules ("Agents must never delete files")
  - LangChain integration via AgentGateToolkit
- **URL:** https://github.com/ElamOlame31/agentgate-public
- **Signal:** Granular authorization at the action level for agents. Purpose alignment via embeddings is novel. Still input-side — controlling what agents CAN do, not what they PRODUCE.

### NIST — AI Agent Identity Concept Paper
- **What:** Concept paper on identification, authorization, auditing, and non-repudiation of AI agents
- **Focus:** Controls for prompt injection prevention/mitigation
- **Status:** Open for public comment through April 2026
- **URL:** https://csrc.nist.gov/pubs/other/2026/02/05/accelerating-the-adoption-of-software-and-ai-agent/ipd

### IBM Think 2026 — Identity Focus
- **What:** IBM's Think 2026 conference featured identity as a major theme for agentic AI
- **Signal:** Enterprise identity vendors are prioritizing agent identity

### RSA Conference 2026
- **What:** Agent identity and next-gen enterprise authentication were prominent themes
- **Signal:** Passwordless for both humans and non-human identities emerging; Yubico and others pushing hardware-based agent auth

## Emerging Patterns

1. **Agents as first-class identities** — Not service accounts, not human delegates. Unique cryptographic identity.
2. **Delegation chains** — User → Agent → Sub-agent must be traceable and verifiable
3. **Signed requests, no bearer tokens** — AAuth pattern: every request cryptographically signed
4. **Progressive trust** — Start pseudonymous, advance to stable identity, then full delegation
5. **Policy enforcement at the gateway** — Agentgateway pattern: central policy point for auth/authz decisions
6. **MCP as the connection standard** — OpenID whitepaper explicitly names MCP as the leading standard for agent↔resource interaction

### AI Agent Passport (Stacy Starchum / Jay Volpenheim)
- **What:** Open identity standard for AI agents — signed, verifiable JSON document that travels with an agent
- **Approach:** Ed25519 cryptographic signatures, DID-based owner identity, scoped permissions, spend limits, registry-verified trust levels
- **Analogy:** "Like OAuth for humans → AI Agent Passport for agents"
- **Key features:**
  - Who owns this agent (cryptographically verified via DIDs)
  - What it's allowed to do (scoped permissions)
  - How much it can spend (enforced limits per transaction/day/month)
  - Whether to trust it (registry-verified status)
  - Instant revocation of compromised agents
- **SDKs:** Python and Node.js stubs available
- **Status:** RFC (Request for Comments) — seeking community feedback before v1 finalization
- **URL:** https://github.com/StacyStarchum/Ai-agent-passport-
- **Signal:** Early-stage but well-structured. Focuses on transactional trust (spend limits, permissions) rather than identity-for-auth like AAuth. More of an "agent driver's license" than an "agent identity framework" — complementary to AAuth/IETF work.



### Keycard.ai — Agent Security Stack Framing (May 2026)
- **What:** Comprehensive blog post mapping agent security into 4 layers: Transport, Identity, Policy, Runtime
- **Layer 1: Transport** — MCP with OAuth 2.1, Protected Resource Metadata (RFC 9728), Resource Indicators (RFC 8707), incremental scope consent (Nov 2025 revision)
- **Layer 2: Identity** — Non-human identity standards (WIMSE, SPIFFE, AAuth). Agents need first-class identity, not borrowed service accounts.
- **Layer 3: Policy** — Authorization decisions at the gateway. AgentGate, Agentgateway, CEL-based policies.
- **Layer 4: Runtime** — Sandboxing, guardrails, behavioral monitoring. The most under-served layer per Keycard.
- **Market signal:** CrowdStrike acquired SGNL for $740M (Jan 2026), Palo Alto acquired CyberArk for $25B (Feb 2026) — both cited agentic identity as driver
- **Notable absence:** No output/publishing layer in the model. The stack covers input through runtime only.
- **URL:** https://www.keycard.ai/blog/agent-security-stack/

### Facet Protocol / KYAPay — Open IETF Agent-Identity Standard (May 2026)
- **What:** Open IETF agent-identity protocol with shipped reference implementation. Index for agent-ready businesses.
- **Approach:** Four standards stacked: KYAPay (identity, IETF), MCP (discovery), x402 (payments, Coinbase/USDC on Base L2), RFC 9421 (bot signing)
- **Key features:**
  - KYAPay: ES256 JWT + JWKS, web-bot-auth aligned per RFC 9421
  - Live verifier at facet.llc — the website IS the demo (402 Payment Required, identify via KYAPay)
  - Signed response provenance layer (closest thing to ZenBin's output attestation seen so far, but for API responses not publishing)
  - Reputation registry, agent WAF, vertical depth, schema generation
  - TypeScript SDK: @facet/sdk-js with verifier + Terminal client
  - 10 conformance test vectors, CI-verified
- **Status:** v0.0.x (spec, schemas, verifier, Terminal client). v0.1.0 planned with Ed25519 audit-record verifier.
- **URL:** https://github.com/facet-llc/spec
- **Signal:** Sixth identity protocol in the space. Focuses on agent↔business transactions. The "signed response provenance" layer is the closest any competitor comes to ZenBin's output attestation, but it's for merchant→agent API responses, not agent→world publishing.

### Lyfe Ninja — Revocable Digital Signatures for AI Output (Apr 2026)
- **What:** Ask HN exploring revocable digital signatures for verifying AI agent outputs
- **Approach:** AI responses are signed after generation, verified client-side, tampering causes verification failure. Signatures are revocable (short-lived leases or full invalidation).
- **Key framing:** "Know your agent" — verify that AI-generated content came from the intended agent and hasn't been altered
- **Key quote:** "Would you want to stand by your AI agent's output forever? I think not."
- **Properties:** Distributed verification, embedded metadata, no key management
- **Status:** Exploratory, asking market validation question. No product yet.
- **Signal:** Closest competitor concept to ZenBin's output provenance. But Lyfe Ninja is asking the verification question; ZenBin answers the publishing question. Verification without a publishing layer is incomplete.
- **URL:** https://lyfe.ninja/projects/

## Gaps ZenBin Fills

- **Agent publishing identity:** Most identity work focuses on auth (who is this agent?) not on presentation (what does this agent produce?). ZenBin gives agents a public, verifiable identity through their published output.
- **Output provenance:** No standard addresses "this content was created by agent X on behalf of user Y" in a user-verifiable way. ZenBin's signed publishing creates an auditable trail. Lyfe Ninja is asking about verification of AI outputs (closest concept) but has no product.
- **The 80% visibility gap:** Strata survey shows 80% of orgs can't track what agents are doing. Published agent output with identity is a step toward transparency.
- **No output-layer auth:** Six auth/security frameworks now (AAuth, IETF, Passport, Ratify, AgentGate, Keycard stack model) — all address input-side (who can this agent BE, what can it DO, how is it secured). None address output-side (who created this content, can I verify it came from a real agent?). The Keycard 4-layer model explicitly has no output layer.
- **Personal agent identity is scaling:** Deckard proves that even individual users running multiple agents need per-agent identity + scoped access. This is the personal-scale version of the enterprise identity problem. Output identity scales the same way — which agent published this, on whose behalf, with what scope?
- **Revocable signatures emerging:** Lyfe Ninja's Ask HN shows someone is thinking about signing AI outputs — but framing it as a question, not a product. The concept of verifiable agent output is emerging in developer consciousness, but nobody has productized it. ZenBin's Ed25519 signed publishing is the product version.