# AI Agent Standards Landscape

Last updated: 2026-05-25 12:14 UTC

### Vouch Protocol C2PA Submission — Agent Identity in Content Provenance Standards (Jan 2026)
- **What:** Vouch Protocol submitted to C2PA (Coalition for Content Provenance and Authenticity) alongside Adobe and Microsoft, proposing decentralized agent identity as a content provenance standard. Uses did:web + Ed25519 + JWT-VC. Pushes for W3C DIDs as the identity layer for agent-generated content.
- **Signal:** C2PA is THE content provenance standard body (Adobe, Microsoft, BBC, Nikon, etc.). An agent identity protocol being submitted there means the content provenance world is starting to think about agent attribution. This is directly in ZenBin's territory.
- **ZenBin angle:** C2PA currently handles human content provenance (who took this photo, who edited this video). Vouch is pushing agent identity into that framework. ZenBin should monitor C2PA closely — if they adopt agent identity, it could become the standard that ZenBin implements or interoperates with.
- **URL:** https://github.com/vouch-protocol/vouch

### Piecely — Content Marketplace with AI Agent API (Apr 2026, HN)
- **What:** Content marketplace where creators publish encrypted content, set prices or funding goals, and buyers pay to unlock it. Three models: Pay to Reveal (fixed price), Traditional Crowdfund, Dominant Assurance Contract (creators put up own money as commitment). Has an API for AI agents and a ChatGPT integration. Agents "immediately recognize the dominant strategy" in DAC model.
- **Key insight:** Content marketplace with explicit AI agent access. Agents can discover, evaluate, and purchase content programmatically. But content is encrypted until paid — provenance is tied to payment, not creation.
- **Signal:** AI agents as content consumers is a recognized use case. The next step is agents as content producers — which needs provenance and signing.
- **ZenBin angle:** Piecely handles content monetization (pay to unlock). ZenBin handles content attribution (prove who created it). They're complementary. When agents start producing marketable content, both payment and provenance will be needed.
- **URL:** https://piecely.app

### Auth.md — Open Protocol for Agent Registration (WorkOS, May 2026)
- **What:** Open protocol for agent self-registration at any domain. Publish an `auth.md` file at your domain (like `robots.txt` or `.well-known/`) declaring the flows, scopes, and endpoints an agent needs to register. Agents discover, read the auth.md, and self-provision access.
- **Key design:** Three registration modes: trusted identity assertions, OTP-based claim flows, or anonymous access. Credentials issued are scoped, auditable, expirable, revocable.
- **Signal:** The `.well-known` pattern (robots.txt → ai.txt → auth.md) is becoming the standard for declarative agent capability discovery. WorkOS (auth infrastructure company) building this validates that agent self-registration is a real need. Like agent.email's self-signup flow but generalized as a protocol.
- **ZenBin angle:** Auth.md tells agents how to GET IN. ZenBin tells agents how to PUBLISH OUT. Complementary — auth.md is the input/onboarding standard, ZenBin is the output/publishing standard. If a domain declares agent registration via auth.md, that same domain could declare agent publishing via a similar standard.
- **URL:** https://workos.com/auth-md

## Active Standards & Specs

### MCP (Model Context Protocol) — Anthropic
- **Status:** De facto standard for connecting AI models to external tools and data
- **Adoption:** Cited by OpenID Foundation whitepaper as "the leading standard for connecting AI models to external data sources and tools"
- **Ecosystem:** mcp-use SDK, Inspector tool, Ledgr, Hoop, dozens of MCP servers
- **Key spec features:** notifications/tools/list_changed for HMR, resource templates, sampling
- **Gap:** No standard for agent output/publishing. MCP is read/action, not write/publish.
- **Security tooling (May 2026):** Three MCP security/compliance tools now exist — MCPSafe (security scanner), korrel-dev/mcp-audits (RFC 9728 compliance audits), MCP-safeguard (open-source security scanner). MCP security is becoming table stakes.
- **SaaS MCP pattern (May 2026):** "Set up a remote MCP server for your SaaS" is becoming a standard integration tutorial (docsalot.dev). Like "add a REST API" in 2015.
- **1Password MCP (May 21):** Major identity/security player releasing official MCP server for OpenAI Codex. "Trusted access layer" — agents get scoped secret access without full credential exposure. Validates MCP as the standard and shows enterprise identity players building agent-specific tooling. Architecture: MCP server does NOT read or return secret values through the MCP channel, does NOT surface secrets in model context, does NOT write to disk. 1Password injects secrets directly into the application process at runtime — values exist in memory only for the authorized process. This is the "agent as tenant, not vault" principle made concrete.
- **SoMatic MCP (May 21):** Vision-based OS automation framework includes stdio MCP server for direct screenshot parsing. MCP is expanding beyond text tools into multimodal agent capabilities.
- **WhoDB MCP (April):** Database management CLI that doubles as MCP server for agents. MCP as a standard surface for any tool that agents need to interact with.

### IETF Draft: AI Agent Auth & Authorization (draft-klrc-aiagent-auth-00)
- **Status:** Internet-Draft, expires Sept 2026, moving toward RFC
- **What:** Formal standard model for AI agent authentication and authorization
- **Built on:** WIMSE (Workload Identity in Multi-System Environments) architecture + OAuth 2.0 family
- **Key concepts:**
  - Agent Identifier — unique identity for each agent
  - Agent Credentials — how agents prove who they are
  - Agent Attestation — verified claims about agent capabilities
  - Agent Credential Provisioning — lifecycle management of agent creds
  - WIMSE Proof Tokens (WPTs) — for transport-layer agent auth
  - HTTP Message Signatures — for application-layer agent auth
  - OAuth 2.0 delegation — user delegates to agent, agent gets own auth, agents auth to other agents
- **Key framing:** "Agents are workloads" — treats agents like service mesh identities
- **URL:** https://www.ietf.org/archive/id/draft-klrc-aiagent-auth-00.html
- **Source:** discovered 2026-05-21

### Agent Authentication Patterns (2026 Consolidation)
- **Source:** chenagent.dev article, May 2026
- **What:** 5 distinct agent auth patterns now in production:
  1. Static API keys with scope limiting — simple, no delegation, good for single-hop service-to-service
  2. JWT with agent claims — task-scoped, short-lived, but needs trusted authority; revocation is hard
  3. Threshold signatures / MPC-based identity (Lit Protocol PKP) — private key never in one place, but high latency
  4. Verifiable credentials with DID anchors — World AgentKit uses World ID → agent DID; proves human-behind-agent
  5. x402 challenge-response — HTTP-native, newest, payment-gated identity
- **Key insight:** "API keys work when there is one caller and one service. In multi-agent systems, this breaks immediately."
- **Gap:** All 5 patterns prove WHO the agent is and WHO authorized it. None prove WHAT the agent produced.
- **URL:** https://chenagent.dev/articles/agent-authentication-patterns-2026

### Agentic IAM (Coalition for Secure AI, April 2026)
- **What:** Defines how to represent, authenticate, authorize, and govern AI agents as verifiable, auditable identities
- **Key concepts:** Lifecycle management, context-and-intent-aware access, risk-based controls comparable to human/service identities
- **URL:** https://www.coalitionforsecureai.org/wp-content/uploads/2026/04/agentic-identity-and-access-control.pdf

### MCP Security Tooling (May 2026)
- Three+ MCP security/compliance tools now exist:
  - **MCPSafe** — security scanner
  - **korrel-dev/mcp-audits** — RFC 9728 compliance audits
  - **MCP-safeguard** — open-source security scanner with 52 detection rules (https://github.com/SyedAnas01/mcp-safeguard)
  - **Mcpaudit** — static security scanner for MCP servers (https://github.com/allenwu-blip/mcpaudit)
- Both MCP-safeguard and Mcpaudit launched on the same day (May 22), confirming MCP security as a category
- 1Password MCP Server for OpenAI Codex — "trusted access layer" for scoped secret access
- **MCP Auth/Identity Server Ecosystem (May 2026):** Agentndx.ai published comprehensive guide listing 7 identity/secrets MCP servers now in production: Auth0 MCP, Okta MCP, WorkOS MCP, Clerk MCP, Keycloak MCP, 1Password MCP, HashiCorp Vault MCP. All use API key auth + stdio transport. Key pattern: 1Password does NOT expose secret values through MCP channel — injects directly into application process at runtime ("agent as tenant, not vault"). 7 identity MCP servers for the input/auth side, zero for the output/attestation side.
- **NIST MCP Evaluation (Mar 2026):** NIST draft concept paper names MCP as one of five standards under evaluation for agentic AI identity governance, alongside OAuth 2.0/2.1+OIDC, SPIFFE/SPIRE, SCIM, and NGAC. Five unsolved problems identified: Agent Identification, Key Management, Zero-Trust Least-Privilege, Delegation Chain Tracking, Audit Trail Integrity. MCP gaps: no agent identification at protocol level, no per-invocation permission scoping, no delegation chain concept, audit logs stored on same infra agents run on. NIST reps presenting at MCP Dev Summit (April 2-3, NYC). Linux Foundation governance model for MCP evolution.
- **AIUC-1 Q2-2026 Standard Update (May 2026):** 120+ consortium members contributed. 14 requirements and 23 controls updated/added. New controls: B006.1 (MCP server access containment), B006.3 (runtime sandboxing for MCP), B008.3 (encrypted data in transit for MCP/A2A), B008.4 (cryptographic message signing for A2A + schema validation on MCP tool I/O), D003.1 (tool authorization for MCP server calls), D003.3 (MCP server-level metadata logging). Agent identity: A003.3 (unique, cryptographically verifiable agent identities), A003.4 (permission-ready architecture with JIT permissions). CVE-2025-53967 (Figma MCP RCE, 558K+ installations) cited. July 2026 priorities: Mythos (autonomous vuln discovery), coding agent controls, browser agents, stronger agent identity governance.
- **Signal:** MCP is now infrastructure-grade with security tooling, enterprise identity players, federal standards evaluation, and consortium-level governance

### SoMatic MCP Server (May 2026)
- Vision-based OS automation framework ships with stdio MCP server
- MCP expanding beyond text tools into multimodal agent capabilities
- "npx skills add" distribution pattern becoming standard

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
- **Approach:** Ed25519 signatures, DID-based owner identity (did:web), scoped permissions, spend limits, registry verification
- **Key features:**
  - Cryptographic proof of agent ownership
  - Scoped permissions (read, book, purchase)
  - Enforced spend limits (per-transaction, per-day, per-month)
  - Registry-verified trust levels (verified_by: registry.agentpassport.dev)
  - Instant revocation of compromised agents
  - Schema version: ai-agent-passport/v1
  - Agent type classification (e.g., "transactional")
  - Owner identity via did:web DID method
  - Python SDK: PassportIssuer class with Ed25519 private key
  - Node.js SDK: PassportVerifier class with registry-based verification
- **SDKs:** Python stub, Node.js stub (both referenced in README but not yet in repo — 404 on /sdk/python/README.md and /sdk/node/README.md)
- **Status:** RFC — actively seeking feedback before v1. No releases published. No open issues. Referenced docs (SPECIFICATION.md, SECURITY.md, VERIFICATION.md, API.md, passport-v1.json) all return 404 — appear to be planned but not yet pushed to the repo.
- **Registry:** https://registry.agentpassport.dev — **UNREACHABLE** (DNS ENOTFOUND). The registry hostname referenced in the spec and Node.js SDK example does not resolve. This is a significant gap — the verification flow depends on this registry.
- **Example passport JSON** (from README):
  ```json
  {
    "schema": "ai-agent-passport/v1",
    "agent_id": "AGT-7481-X",
    "agent_name": "TravelBot Pro",
    "agent_type": "transactional",
    "owner": { "name": "Jay Volpenheim", "did": "did:web:jay-volpenhein.agent" },
    "capabilities": {
      "spend_limit": { "per_transaction": 100, "per_day": 200, "per_month": 500, "currency": "USD" },
      "permissions": ["read", "book", "purchase"]
    },
    "trust": { "verified_by": "registry.agentpassport.dev", "verification_level": "high", "issued_at": "2026-05-04", "expires_at": "2027-05-04", "status": "VERIFIED" },
    "cryptography": { "algorithm": "Ed25519", "public_key": "ed25519:abc123...", "signature": "def456..." }
  }
  ```
- **Roadmap** (from README): Spec draft → JSON Schema → Python SDK stub → Node.js SDK stub → Reference registry implementation → W3C/industry consortium submission → Security audit
- **Licensing:** Dual — CC BY 4.0 (spec/schemas), MIT (SDK code)
- **URL:** https://github.com/StacyStarchum/Ai-agent-passport-
- **Relationship to others:** Transactional trust layer ("agent driver's license") — complementary to AAuth's auth protocol and IETF's workload model

#### AI Agent Passport — 2026-05-25 Watch Update
- **Maturity assessment:** Early RFC stage. README is a well-structured vision document with example code, but actual spec docs, schemas, SDK implementations, and the reference registry are all not yet available (404s). The roadmap lists these as upcoming milestones. This is pre-implementation.
- **Registry not operational:** registry.agentpassport.dev does not resolve (DNS ENOTFOUND). The core verification flow (PassportVerifier checks status against registry) cannot function without it. This is the most critical gap — the trust model depends on a centralized registry that doesn't exist yet.
- **No releases, no issues, no PRs:** The repo appears to be a single-commit README-only project so far. Zero community engagement visible (no issues, no PRs, no releases).
- **Ed25519 confirmed:** The spec explicitly uses Ed25519 as the cryptography algorithm with a `public_key` field prefixed `ed25519:`. This aligns with ZenBin's Ed25519 identity model. The key format is `ed25519:<base64>` which is simple and practical.
- **did:web for owner identity:** Uses did:web as the DID method for owner identity. This is a lighter-weight approach than did:key or did:ion — relies on DNS/web PKI for resolution, which pairs well with the registry model but creates a DNS dependency.
- **Spend limits as a first-class concept:** Uniquely includes per-transaction, per-day, per-month spend limits as a structured part of the passport. No other spec in the landscape does this. This is the "driver's license" angle — not just identity, but transactional authority with financial bounds.
- **ZenBin integration opportunity — content attestation:** Passport defines WHO an agent IS and WHAT it can DO/SPEND. It does NOT define WHAT an agent PRODUCES. A natural integration: when a ZenBin page is published with an Ed25519 signature, the publisher's Agent Passport could be referenced as the identity claim, creating a chain: Passport (identity + permissions) → ZenBin page (output attestation). The same Ed25519 key that signs the passport could sign the page content.
- **ZenBin integration opportunity — permission gating:** Passport's `permissions` and `spend_limit` fields could gate ZenBin API access. Agents with a valid passport and appropriate permissions could get higher rate limits or premium features. Passport verification (once the registry exists) could replace or complement API key auth.
- **Key risk:** Centralized registry as single point of failure/trust. If registry.agentpassport.dev goes down or is compromised, the entire verification chain breaks. This is a fundamental architectural concern that ZenBin's decentralized model (verify against the publisher's public key, no registry needed) avoids.

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

### AIP (Agent Intent Protocol) — theaniketgiri
- **What:** Open cryptographic protocol for identity and authorization of autonomous AI agents
- **Approach:** Ed25519 keypair per agent (DID-based), every action becomes a signed Intent Envelope, every envelope passes through 8-step verification pipeline before execution
- **Key features:**
  - Tiered verification: HMAC <1ms (low-risk), Ed25519 ~5ms (normal), full pipeline ~50ms (high-value cross-org)
  - Boundary enforcement: agents declare intent, verifier checks against boundary cage (allowed actions, monetary limits, geo restrictions, deny lists)
  - 22 structured error codes (AIP-E{category}{code})
  - Kill switch support
  - `@shield(actions=["transfer_funds"], limit=100.0)` decorator pattern
- **Status:** Show HN, May 22 2026
- **URL:** https://news.ycombinator.com/item?id=48240714
- **Relationship to others:** Input-side verification (before execution). Complementary to ZenBin's output-side attestation (after production). Same Ed25519 primitive as AAuth, TBN, Ratify, and ZenBin.

### A2A (Agent-to-Agent Protocol) — Google
- **Context:** Referenced in AAuth prototype; inter-agent communication protocol
- **Status:** Emerging, less mature than MCP for tool connectivity
- **Note:** AstraCipher (May 2026) explicitly integrates with A2A, validating it as a real standard for inter-agent communication

### Cloudflare Web Bot Auth Protocol (May 2025) + Agent Registry (Oct 2025)
- **What:** Cryptographic ID cards for AI agents at the HTTP request level. Agents sign every request; websites verify against published public keys.
- **Approach:** Like SSL/TLS certificates but for bots. Agent operators publish public keys; agents sign request details with private key; websites verify.
- **Registry:** Lightweight distributed key discovery format (Oct 2025), similar to DNS or certificate transparency logs
- **Status:** Deployed at Cloudflare scale — has the infrastructure reach to become the HTTP-level standard for bot identification
- **Industry adoption:** Visa Trusted Agent Protocol (attestations for verified commerce agents), HUMAN AgenticTrust (trust framework for legitimate vs malicious bots)
- **URL:** https://blog.rcaptcha.app/articles/agentic-ai-verification-trust
- **Relationship to others:** Web Bot Auth handles request-level identification. Ratify handles delegation-level authorization. AAuth handles web/API auth. ZenBin handles content-level attestation. Different layers of the same problem.

### AstraCipher — Open-Source DID Identity for Agents (May 2026)
- **What:** Open-source SDK (BSL 1.1 → Apache 2.0) for post-quantum cryptographic identity for AI agents
- **Approach:** W3C DIDs + Verifiable Credentials + NIST post-quantum (ML-DSA-65 FIPS 204, ML-KEM FIPS 203). Trust chains with depth limits: Creator → Authorizer → Agent → Sub-agent.
- **Integrations:** Google A2A protocol, MCP protocol
- **Stats:** 88% orgs report agent security incidents, 44% still use static API keys, only 22% treat agents as identity-bearing, OWASP #3 risk is Identity & Privilege Abuse
- **URL:** https://astracipher.com/
- **npm:** @astracipher/core @astracipher/crypto
- **Relationship to others:** DID+VC approach similar to Ratify's certificate model but with W3C standard identifiers. AstraCipher focuses on identity and credentials; Ratify focuses on delegation and verification. Complementary.

### Vigil (Agent Auth) — DID-Based Agent Identity (May 2026)
- **What:** "Google Sign-In for AI agents." DID-based cryptographic identity with Ed25519 keypairs, challenge-response auth, and Verifiable Credentials.
- **Approach:** Same authentication flow as human login, but for agents. Dashboard for managing agents, seeing activity, recognizing returning agents, setting behavior-based permissions.
- **URL:** https://www.usevigil.dev/
- **Relationship to others:** Authentication-focused (prove who you are at login). Ratify is authorization-focused (prove what you're allowed to do). AstraCipher is identity+credentials-focused (prove your identity and qualifications). Each solves a different sub-problem of agent identity.

## Where Standards Are Heading

1. **Agent identity becomes a first-class concept** — Not "service account with a token" but cryptographic identity with attestation. Ten+ identity/auth specs now (AAuth, IETF draft, Passport, Ratify, Facet/KYAPay, AgentGate, NIST, Web Bot Auth, AstraCipher, Vigil).
2. **Delegation chains are mandatory** — Who authorized this agent? On whose behalf? Prove it. Ratify's DELEGATE→PRESENT→VERIFY, Uber's identity propagation, AstraCipher's trust chains, and AAuth's delegation chains all formalize this.
3. **DID+Ed25519+post-quantum emerging as the pattern** — Ratify, AstraCipher, Vigil, and Agent Passport all use Ed25519 keypairs with DID-based identity. ML-DSA-65 being added as hybrid layer. Validates ZenBin's choice of Ed25519. Agent Passport explicitly uses `ed25519:` key prefix format.
4. **MCP for input, [gap] for output** — MCP handles tool/context connection. No equivalent standard for agent publishing/output.
5. **Progressive trust models** — Start anonymous/pseudonymous, scale to verified identity with delegation
6. **Policy enforcement at infrastructure layer** — Gateway pattern (Agentgateway) rather than per-app security
7. **Quantum-safe signatures emerging** — Ratify mandates hybrid Ed25519 + ML-DSA-65. AstraCipher adds ML-DSA-65 + ML-KEM. Facet plans Ed25519 audit records. Post-quantum is becoming a differentiator.
8. **Offline-first verification** — Ratify's <1ms offline verification is a new pattern. No network hop, no central authority.
9. **Enterprise-scale deployment** — Uber, Cloudflare, and Visa are all building agent identity infrastructure at production scale. The category is past experimentation.

## ZenBin Opportunity

- **MCP is for input.** The output side — publishing, presenting, sharing agent-produced content — has no equivalent standard.
- **AAuth/Ratify/KYAPay/AstraCipher/Vigil define who an agent IS, not what an agent CREATES.** ZenBin can be the output layer: signed, verifiable, attributable agent content.
- **The visibility gap is real.** 80% of orgs can't track agent actions. Published output with identity/provenance is a transparency win.
- **Keycard's 4-layer model has no output layer.** Transport → Identity → Policy → Runtime covers everything EXCEPT what happens after the agent produces something. That's ZenBin's Layer 5.
- **Ed25519 is the winning key algorithm.** Ratify, AstraCipher, Vigil all use Ed25519. ZenBin's choice of Ed25519 for content signing is validated by the market.
- **Web Bot Auth at Cloudflare scale** proves that cryptographic agent signing works at internet scale. ZenBin can ride that infrastructure for content publishing.
- **MCP security scanning is now a category.** MCP-safeguard (May 21) is the first automated security scanner for MCP servers. When the input connector gets dedicated security tooling, the output endpoint needs dedicated attestation.
- **Contract hashing as identity is spreading.** Prisma Next hashes data contracts for DB identity verification. OTA defines readiness contracts for repo execution. The hash→identity→sign/verify pattern is becoming the standard for proving state integrity across layers. ZenBin applies it to content publishing.
- **Agent Passport is an early but strategically positioned integration target.** Same Ed25519 primitive as ZenBin. When an agent with a Passport publishes to ZenBin, the same key that proves identity in the Passport can prove authorship of the content — creating a natural identity→output chain. However, Passport's centralized registry (currently offline) is a trust bottleneck ZenBin doesn't need (ZenBin verifies against the publisher's public key directly). If Passport gains traction, ZenBin could accept Passport-verified identity as an optional trust signal, while keeping key-based verification as the foundation.

### OWASP Top 10 for Agentic Applications 2026
- **What:** Globally peer-reviewed security framework from 100+ industry experts identifying the most critical risks for autonomous/agentic AI systems. Risk #3: Identity & Privilege Abuse. Provides operational guidance for securing agents that plan, act, and decide across complex workflows.
- **Signal:** Identity abuse in agentic systems is now a formally recognized top-tier security risk by OWASP. The world's leading application security organization is telling enterprises: agent identity is a real attack vector. This validates the entire agent identity category.
- **ZenBin angle:** If identity abuse is #3 risk, content provenance (proving what an agent actually produced) is the natural mitigation. You can't detect identity abuse in outputs without output attestation. OWASP covers what can go wrong. ZenBin covers how to prove what went right.

### Ping Identity Agentic IAM Framework
- **What:** Formal definition and framework for Agentic IAM — managing AI agents as governed non-human identities (NHIs). Four critical questions: Who is the agent? On whose behalf? What is it allowed to do right now? Can its actions be traced? Key principles: delegation not impersonation, runtime identity (continuous access evaluation), human-in-the-loop for high-risk actions, and full audit trails.
- **Signal:** A major enterprise identity company is formalizing agent IAM as a discipline. Ping's framework asks the right input questions but has no output-side questions. Adding "What did the agent produce?" and "Can the output be verified?" completes the picture.
- **ZenBin angle:** Ping's four questions are all about agent INPUT (who, on-behalf-of, allowed-actions, traceability). ZenBin adds the missing output questions: what did the agent produce, and can that output be cryptographically verified? Input IAM + output attestation = complete agent governance.

### Coalition for Secure AI — Agentic Identity and Access Management Spec (Apr 2026)
- **What:** Formal specification defining Agentic IAM: how to represent, authenticate, authorize, and govern AI agents as verifiable, auditable identities with lifecycle, context- and intent-aware, risk-based controls comparable to those applied to human and service identities.
- **Signal:** Another standards body formalizing agent identity governance. The spec covers identification, authentication, authorization, and governance — but is entirely input-side (who is this agent, what can it do). Output identity (what did this agent produce) is not addressed.
- **URL:** https://www.coalitionforsecureai.org/wp-content/uploads/2026/04/agentic-identity-and-access-control.pdf

### NIST Concept Paper — AI Agent Identity and Authorization (Feb 2026)
- **What:** NIST released a concept paper proposing four areas for agentic AI identity: identification (distinguishing agents from humans), authorization (defining agent rights), access delegation (linking user identities to agents), and logging (linking agent actions to their non-human entity). Public comment period closed April 2, 2026.
- **Signal:** The US federal standards body is actively evaluating agent identity. NIST named MCP as one of 5 standards under evaluation. This will drive procurement requirements for enterprise.
- **URL:** https://www.hoganlovells.com/en/publications/shaping-the-future-of-ai-security-nist-seeking-input-on-agent-identity-authorization

### ERC-8004 — Ethereum Standard for AI Agent Identity (Jan 2026)
- **What:** Emerging Ethereum standard for AI agent identity registration, reputation storage, and validation on-chain. Backed by Ethereum Foundation, Coinbase, Google, and MetaMask. ChaosChain built the first reference implementation with contracts on five testnets and an explorer at 8004scan.io. Mainnet expected Q2 2026.
- **Key insight:** ERC-8004 uses regular NFTs for identity tokens — meaning agent identity could be sold/transferred. Some projects are adding soulbound token layers (ERC-5192) to prevent transfer.
- **Signal:** On-chain agent identity is being formalized. The transferability issue (selling agent reputation) is a known problem being addressed.
- **URL:** https://eips.ethereum.org/EIPS/eip-8004

### Vouch MCP-I Specification — Identity Extension for MCP (May 2026)
- **What:** MCP-I is an identity extension to Anthropic's Model Context Protocol. Published by Vouch (AgentShield + KnowThat.ai). Defines how agents prove their identity within MCP tool calls. Uses W3C DIDs and Verifiable Credentials.
- **Signal:** The first attempt to add identity to MCP. Validates MCP as the standard and shows that identity within MCP tool calls is a recognized need.
- **URL:** https://modelcontextprotocol-identity.io