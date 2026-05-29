# AI Agent Identity Landscape

Last updated: 2026-05-29 06:14 UTC

## The Big Picture

Agent identity is the hottest emerging topic in 2026. The industry has recognized that agents can't stay anonymous service accounts forever — they need first-class identity, delegation chains, and cryptographic proof.

The IETF AIP draft (the most comprehensive agent identity spec yet) joins AAuth, Ratify, Facet/KYAPay, Microsoft AGT, and Cisco zero-trust. OWASP published the first formal risk taxonomy ("identity abuse" as a top-10 risk). CrowdStrike acquired SGNL for $740M and Palo Alto acquired CyberArk for $25B — both citing agentic identity as a driver.

The gap: **All identity protocols prove WHO the agent is and WHO authorized it. None prove WHAT the agent produced.** ZenBin's output attestation layer is unaddressed by any of these.

### New (2026-05-29)

**Rootcx — Delegation & Intersection Model (May 28)**
- Article: "AI Agent Governance: Identity, Delegation & Permissions in Practice"
- Three models: impersonation (bad — agent inherits all user perms), service accounts (bad — no accountability), delegation (correct)
- Intersection model: effective authority = agent role ∩ human permissions. Narrower always wins.
- "The agent carries no tokens. Checks no permissions. Knows nothing about the delegating user. All authorization happens at the platform level."
- Autonomous triggers: no delegation context = deny. No exceptions.
- **ZenBin connection:** ZenBin's Ed25519 signing is the output-side version — agent signs with its own key (identity), key is bound to agent (delegation), content is verifiable (attestation).
- URL: https://rootcx.com/blog/ai-agent-governance-implementation

**Agent Trust Stack — 10-Layer Framework (May 28)**
- Article: "The Agent Trust Stack: A Layered Framework" (citizenofthecloud.com)
- 10 layers: 0-Compute/Runtime, 1-Model, 2-**Identity**, 3-Reputation, 4-Policy/Commitment, 5-Capability Restriction, 6-Verification, 7-Integration, 8-Monitoring, 9-Governance
- Key quote: "Without Layer 2 [Identity], every other trust mechanism is anchored to nothing."
- Layer 4 = signed, versioned declarations of scope/capabilities — "converts vague promises into specific, signed, auditable commitments"
- **ZenBin connection:** ZenBin operates at Layer 2 (identity via Ed25519 keypairs) and Layer 4 (signed content = policy commitment). The trust stack gives us the vocabulary to position ZenBin.
- URL: https://www.citizenofthecloud.com/blog/agent-trust-stack-layered-framework

**AstraCipher — W3C DIDs + Post-Quantum Crypto for Agents (MCP Server)**
- Open-source SDK for verifiable agent identity
- did:astracipher:mainnet:abc123 (W3C DID method)
- Verifiable Credentials for capabilities, permissions, trust levels
- NIST post-quantum cryptography (ML-DSA-65 FIPS 204)
- Available as MCP server
- **ZenBin connection:** Complementary — AstraCipher proves WHO the agent is (Layer 2), ZenBin proves WHAT the agent produced (output attestation). AstraCipher DIDs could be the identity layer that ZenBin content signatures reference.
- URL: https://astracipher.com, https://github.com/san-techie21/astracipher

**Eco.com — Four Models of Agent Identity for Commerce**
- Four implementation models: tokenized identities (Mastercard Agent Pay), attestation headers (Visa Trusted Agent Protocol), Verifiable Credentials (Google AP2), DIDs (crypto-native agents)
- Each maps to a different trust anchor: card network, acquirer, issuer-signed VC, self-sovereign
- **ZenBin connection:** All four models are input-side (proving who can transact). None address output-side (proving what was produced).
- URL: https://eco.com/support/en/articles/15192005-agent-identity-verification-how-ai-agents-authenticate-purchases-in-2026

**KYA (Know Your Agent) — Agent KYC for Crypto/Web3**
- Emerging standard analogous to KYC but for AI agents
- ERC-8004: identity and legal framework for autonomous agents on-chain
- Trust scores, verification protocols, machine identity
- **ZenBin connection:** Another input-side identity model. KYA asks "who is this agent?" before allowing actions. ZenBin asks "did this agent produce this?" after the action.
- URL: https://calmops.com/web3/kyc-know-your-agent-ai-identity-complete-guide/

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

## IETF Draft: Agent Identity Protocol (AIP) — draft-singla-agent-identity-protocol-01
- **What:** The most comprehensive IETF Internet-Draft for agent identity to date. Defines decentralized identity, delegation, and authorization for autonomous AI agents.
- **Key features:**
  - W3C DID method (`did:aip`) with agent identity objects
  - Capability-based authorization with cryptographic delegation chains
  - Credential tokens with TTL, refresh, and explicit MCP integration (Section 8.4: Token Exchange for MCP)
  - Three architecture tiers: Core Identity, Credential/Delegation, Enterprise
  - Revocation management (CRL + Registry Push Notification Protocol)
  - DPoP and approval envelope support
  - Engagement objects for scoped, time-limited authorizations
  - 9,500+ tests across all packages
- **Status:** Internet-Draft, expires October 20, 2026
- **URL:** https://www.ietf.org/archive/id/draft-singla-agent-identity-protocol-01.html
- **Signal:** Most comprehensive spec yet. Combines DIDs + capability-based auth + delegation + MCP integration. Validates that MCP is the standard transport. But still focused on WHO agents are and WHAT they're authorized to do — not on WHAT they produce.

### Microsoft Agent Governance Toolkit (AGT)
- **What:** Open-source (MIT) runtime security toolkit for AI agents addressing all 10 OWASP Agentic AI risks
- **Approach:** OS kernel-inspired architecture — privilege rings, process isolation, SRE patterns applied to agents
- **Key features:**
  - Agent OS: Stateless policy engine intercepting every action at sub-ms latency
  - DID-based identity with behavioral trust scoring
  - MCP security gateway for tool misuse prevention
  - Execution rings with resource limits (code execution risk)
  - Cross-Model Verification Kernel (CMVK) for memory poisoning defense
  - Circuit breakers and SLO enforcement for cascading failure prevention
  - Approval workflows with quorum logic for human-agent trust
  - Framework integrations: LangChain, CrewAI, Google ADK, Microsoft Agent Framework, Dify, LlamaIndex, Haystack, PydanticAI, OpenAI Agents SDK
  - Cross-language: Python, TypeScript, .NET, Rust, Go
- **URL:** https://github.com/microsoft/agent-governance-toolkit
- **Signal:** Microsoft is investing heavily in agent governance. The DID-based identity + behavioral trust scoring + MCP gateway validates the market. Addresses "identity abuse" as a top-10 risk. But still input/control-focused — no output attestation.

### Cisco Zero-Trust Identity Framework for Agentic AI
- **What:** Zero-trust framework advocating purpose-built agent identity rather than adapting existing protocols
- **Core principle:** No agent (internal or external) is inherently trusted. Every interaction requires verification.
- **Signal:** Enterprise security vendor formally recognizing that agent identity needs purpose-built solutions. Zero-trust model aligns with ZenBin's cryptographic signing — every output must be independently verifiable.

### AgentDID — Decentralized Identity for AI Agents (arXiv:2511.02841)
- **What:** Academic paper presenting a conceptual framework and prototype for agents with self-sovereign digital identities
- **Approach:** W3C DID + W3C Verifiable Credentials, ledger-anchored, cross-domain trust
- **Key finding:** Technically feasible, but "limitations once an agent's LLM is in sole charge to control the respective security procedures"
- **Signal:** Academic validation of DID-based agent identity. The limitation finding (LLMs can't reliably manage their own security) reinforces the need for simple, deterministic verification — which is exactly what Ed25519 signature verification provides.

## Emerging Patterns

1. **Agents as first-class identities** — Not service accounts, not human delegates. Unique cryptographic identity.
2. **Delegation chains are mandatory** — User → Agent → Sub-agent must be traceable and verifiable. AIP formalizes this with capability-based delegation.
3. **Signed requests, no bearer tokens** — AAuth pattern: every request cryptographically signed
4. **Progressive trust** — Start pseudonymous, advance to stable identity, then full delegation
5. **Policy enforcement at the gateway** — Agentgateway pattern + Microsoft AGT: central policy point for auth/authz decisions
6. **MCP as the connection standard** — OpenID whitepaper explicitly names MCP as the leading standard. AIP includes MCP token exchange. Microsoft AGT includes an MCP security gateway.
7. **Identity fragmentation accelerating** — 8+ identity/auth specs now (AAuth, IETF, AIP, Passport, Ratify, Facet/KYAPay, AgentGate, Cisco zero-trust). Each optimizes for different trust models. Fragmentation is real.
8. **OWASP Agentic AI Top 10 creates reference taxonomy** — "Identity abuse" as top-10 risk validates identity as a security problem. Formal taxonomy gives enterprise teams a framework.
9. **Governance is becoming production software** — Microsoft AGT is MIT-licensed, cross-language, framework-integrated. Not a spec — shipping code.

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

### GitHub Commit Verification Logic Flaw — Identity Spoofing via Author/Committer Mismatch
- **What:** HN post detailing how GitHub's "Verified" badge verifies the committer's key, not the author's identity. The author field is freely settable, so a spoofed commit can show `author=torvalds, committer=anyone, verification.verified=true` with a green checkmark.
- **Key detail:** GitHub has a "Partially verified" badge that detects author≠committer mismatch, but ONLY when the impersonated user has enabled "vigilant mode" — an opt-in setting most users haven't enabled, including Linus Torvalds.
- **Relevance to AI agents:** With Shai Hulud and AI agents now authoring commits, the committer≠author identity gap is a live attack surface. Agents pushing code creates the same author/committer identity ambiguity — who actually wrote this?
- **Signal:** Git commit identity is a mess. The verified badge doesn't verify what people think it verifies. This is exactly the problem domain where ZenBin's cryptographic signing model operates — proving WHAT was produced by WHOM, with a verifiable signature on the content, not just on the committer identity.
- **URL:** HN story 48274410 (Ask HN, May 26, 2026)

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

### AgentPKI — Passport-based Edge Identity for Agents (May 2026)
- **What:** Open protocol (Apache 2.0) for agent identity on the public internet. Short-lived PASETO v4 passports signed with Ed25519, verified at the edge in <50ms.
- **Three trust tiers:** T1 DNS-verified (free), T2 KYB-verified (commerce), T3 hardware-attested (finance/healthcare)
- **Key properties:** No shared secrets, no blockchain, no vendor API callout. Verifier fetches issuer's public key from `/.well-known/agentpki-issuer.json` (KV-cached). CRL for revocation.
- **Mode A:** Bearer header (simple). **Mode B:** RFC 9421 HTTP Message Signatures bound to request body (integrity).
- **Interop:** MCP, A2A, Kite, SPIFFE, OWASP ANS
- **Target users:** Agent platforms (mint passports), websites/APIs (verify at edge), bot-defense vendors (drop-in trust signal)
- **Signal:** Identity commoditization continues. AgentPKI is well-designed for the "let agents past bot-defense" problem. But it's transport identity, not content identity. The passport proves the agent is legitimate at request time — it says nothing about what the agent published afterwards.
- **URL:** https://agentpki.dev/

### VAOS — Agent Identity as MCP Server (May 2026)
- **What:** MCP server that gives agents cryptographic identity with 60-second credentials. No SDK, one JSON block.
- **Tagline:** "Your AI Agent Doesn't Have an Identity. Here's Why That's a Problem."
- **Signal:** Agent identity is now an MCP service — plug it in and your agent has credentials. The commoditization is accelerating. Still focused on who the agent is, not what it produces.
- **URL:** https://vaos.sh/blog/ai-agent-identity-mcp-server

### SC World — MCP Identity Crisis Analysis (May 2026)
- **What:** Analysis arguing MCP's core problem isn't the protocol — it's that human identity disappears when an agent connects
- **Key insight:** MCP server sees authenticated agent with static API key, not the human user behind it. Identity delegation is the missing piece.
- **Signal:** Mainstream recognition that agent auth is broken. The next question after "who authorized this agent?" is "what did this agent produce on my behalf?" — which is ZenBin territory.
- **URL:** https://www.scworld.com/perspective/mcp-isnt-a-protocol-problem-its-an-identity-crisis-nobody-is-treating

### Five Eyes Guidance — Agent Identity Boundaries (May 2026)
- **What:** CISA, NSA, and counterparts in AU/CA/NZ/UK published 30-page guidance directing teams to construct identity boundaries for autonomous agents
- **Reported by:** AgentLux blog
- **Signal:** Government-level push for agent identity. Regulatory tailwind is real. Regulations focus on access control and audit — not on content provenance. Yet.
- **URL:** https://agentlux.ai/blog/ai-agent-identity-why-cryptographic-credentials-matter-in-2026

### Dock Labs — Digital Identity MCP Server (March 2026)
- **What:** MCP server exposing digital identity infrastructure to agents with structured access control
- **Key feature:** Expose only specific identity functions to agents, keep other operations off-limits. MCP as a security intermediary.
- **Signal:** Identity infrastructure is wrapping itself in MCP. Agents can verify and manage identities via MCP. Still identity verification, not content attestation.
- **URL:** https://www.biometricupdate.com/202603/dock-labs-launches-ai-agent-mcp-server-for-digital-identity

## Identity Space Summary (as of May 27, 2026)

The agent identity space is now **saturated** with protocols and products:

| Player | What It Proves | Method | Focus |
|--------|---------------|--------|-------|
| AgentPKI | Agent is legitimate | PASETO v4 passport, Ed25519 | Bot defense |
| AAuth | Agent identity + delegation | Signed HTTP messages | Auth protocol |
| Ratify | Who authorized the agent | Ed25519 + ML-DSA-65 delegation certs | Authorization |
| Facet/KYAPay | Agent identity for commerce | ES256 JWT + JWKS | Payments |
| IETF Draft (klrc) | Agent as workload | WIMSE + OAuth 2.0 | Standardization |
| VAOS | Agent has credentials | MCP server, 60s credentials | Quick identity |
| Microsoft AGT | Agent identity in Azure | Azure Active Directory | Enterprise |
| Entra Agent ID | Agent as separate identity category | Microsoft Entra | Enterprise governance |
| Cisco Zero-Trust | Agent identity in network | Network identity | Enterprise |
| Darwin Agentic Cloud | Computation is trustworthy | Ed25519-signed attestation receipts | Compute provenance |
| ArkForge Trust Layer | API transaction happened as claimed | Ed25519 + RFC 3161 TSA + Sigstore Rekor | Transaction provenance |
| HDP | Human authorized the delegation chain | Ed25519 append-only delegation tokens | Delegation provenance |
| EqhoIDs | Agent identity + delegation between different creators | Ed25519 passports + delegation chains | Agent-to-agent trust |

**What none of them prove: "This content was produced by this agent."** The output attestation gap is ZenBin's territory and it remains completely empty.

### ArkForge Trust Layer — 3-Witness Cryptographic Proof for Agent Transactions (March 2026)
- **What:** Certifying proxy producing cryptographic proofs for every agent API transaction. Three independent witnesses: (1) Ed25519 signature on canonical JSON chain hash, (2) RFC 3161 Timestamp Authority (DigiCert/Sectigo/FreeTSA pool), (3) Sigstore Rekor append-only transparency log.
- **Key insight:** Logs are mutable, timestamps are forgeable, API responses vanish. EU AI Act Article 14 demands more than "here's our database." In agent-to-agent commerce, who arbitrates when things go wrong?
- **Properties:** Forging a proof requires compromising ArkForge's key + a WebTrust-certified TSA + the public Sigstore log simultaneously. No single point of failure.
- **Use cases:** Agent-to-agent commerce, compliance-sensitive sectors (finance, healthcare, legal), multi-tenant agent platforms
- **URL:** https://arkforge.tech/trust/, https://dev.to/arkforge-ceo/how-we-built-cryptographic-proof-for-ai-agent-transactions-2p8g
- **Signal:** The triple-witness model (signature + timestamp + transparency log) is the strongest attestation pattern seen yet. ArkForge attests to API transaction provenance; Darwin attests to compute execution provenance; ZenBin attests to publishing provenance. Three complementary attestation layers for three different agent trust questions.

### HDP (Human Delegation Provenance) — IETF Internet-Draft (April 2026)
- **What:** Lightweight token-based protocol for cryptographically capturing human authorization in multi-agent delegation chains. IETF Internet-Draft (draft-helixar-hdp-agentic-delegation-00).
- **Approach:** Ed25519-signed append-only chain. Each agent delegation action is a signed hop. Verification is fully offline — only needs issuer's Ed25519 public key and session ID.
- **Key insight:** Existing standards (OAuth 2.0 Token Exchange, JWT, UCAN, Intent Provenance Protocol) all fail the multi-hop, append-only, human-provenance requirements of agentic systems.
- **Reference implementation:** TypeScript SDK (@helixar_ai/hdp on npm), Python integrations. Open-source at github.com/Helixar-AI/HDP.
- **URL:** https://arxiv.org/abs/2604.04522
- **Signal:** Fifth delegation-focused protocol in the space (AAuth, Ratify, AIP, HDP, EqhoIDs). All converge on Ed25519. All focus on proving WHO authorized WHAT. None address WHAT the agent PUBLISHED as a result.

### EqhoIDs — Agent-to-Agent Trust Protocol (2026)
- **What:** Open protocol for agent-to-agent identity verification, delegation, and accountability using Ed25519 passports, delegation chains, and signed receipts.
- **Key insight:** A2A and MCP solve interoperability but NOT trust between agents from different creators. There's no protocol-level answer for identity verification, delegation of authority, or accountability.
- **Approach:** Each agent registered with Ed25519 key pair for cryptographic signing of payloads.
- **Signal:** Another independent convergence on Ed25519. The identity space continues fragmenting — every new protocol solves a slightly different trust question, all using the same crypto primitives.

### Darwin Agentic Cloud — Ed25519 Attestations for Compute Provenance (May 27, 2026)
- **What:** Trust layer between agents and compute infrastructure. Routes workloads to Lambda/Modal/Akash/Docker, executes in sandboxed Firecracker microVMs, returns Ed25519-signed attestation receipts.
- **Key insight:** "Verifiable trust will be crucial to delivering the benefits of [autonomous systems]." Current models (API keys, signed JWTs, trust-on-first-use) are insufficient for agent trust.
- **Properties:** Receipts are independently verifiable forever, by anyone, with no dependency on Darwin. Every receipt binds workload + output + sandbox + cost + signer.
- **MCP integration:** Available via `darwin run` CLI or Claude Desktop.
- **Signal:** Strongest independent validation of ZenBin's approach yet. Darwin converges on the same three design decisions: (1) Ed25519 signing, (2) independently verifiable receipts, (3) platform trust is insufficient. Darwin proves *computation provenance* (how something was made); ZenBin proves *publishing provenance* (who made it). Complementary layers.
- **URL:** HN story 48289469

### mcp-authflow — OAuth 2.0 Framework for MCP Server Authentication (May 27, 2026)
- **What:** Open-source OAuth 2.0 authentication framework specifically designed for MCP servers
- **Signal:** MCP auth is becoming a product category. OAuth for MCP solves caller identity (who can call this server), not output identity (who produced this content). Caller auth + output attestation = complete identity chain.
- **URL:** github.com/brooksmcmillin/mcp-authflow

### AgentSafeLabs — Security Evaluation Framework for AI Agents (May 27, 2026)
- **What:** Open-source security evaluation framework (safelabs-eval) for assessing agent trustworthiness
- **Signal:** Agent security evaluation is becoming a standalone product — like SOC 2 for agents. Evaluates agents before they run (is this agent safe?). ZenBin attests to what they produce after (did this agent publish this?). Pre-flight security + post-flight attestation = complete trust chain.
- **URL:** github.com/AgentSafeLabs/safelabs-eval

### Lelu — Authorization Engine for AI Agents (May 27, 2026)
- **What:** Open-source authorization engine that lives inside your agent. Confidence-aware gating, human-in-the-loop review, Rego policy-driven authorization.
- **Key features:** Confidence scoring (low-confidence actions route to humans), human-in-the-loop review queue, Rego policies for allow/deny/require-review, integrations with major AI SDKs (Vercel, LangChain, OpenAI, Anthropic, CrewAI, etc.)
- **Identity model:** Agents carry identity + confidence scores; authorization decisions are per-action based on actor, action, and resource. Audit trail included.
- **Signal:** Agent authorization (what actions an agent can take) is now a standalone product category, separate from agent identity (who the agent is) and output attestation (what the agent produced). Lelu sits between identity and output — it governs actions, not provenance.
- **URL:** lelu-ai.com

### RSAC 2026: IBM / Auth0 / Yubico Partnership on Agent Identity (March 2026)
- **What:** IBM, Auth0, and Yubico announced partnership at RSAC 2026 to solve human verification for AI agent actions
- **Key framing:** "Proving that a verified human approved high-risk actions taken by autonomous agents"
- **Context:** Nametag CEO Aaron Painter: "We're not far from a world where someone says 'I didn't do that — my agent did.' You need a human behind that agent who is accountable, and an audit trail that lets you go back and verify that human."
- **Signal:** Three major identity/security vendors converging on the same problem: agent actions need human accountability. The audit trail framing is exactly ZenBin's territory — cryptographic proof that links content back to a human-verifiable identity.
- **URL:** identigate.com, RSAC 2026

### NIST Public Comment Period on AI Agent Identity (Feb-April 2026)
- **What:** NIST opened public comment period on AI agent identity and authorization, concept paper on identification, authorization, auditing, and non-repudiation
- **Focus:** Controls for prompt injection prevention/mitigation; agent identification and authorization frameworks
- **Status:** Public comment period closed April 2026
- **Signal:** Government standardization of agent identity is underway. NIST's focus on non-repudiation is notable — that's the legal term for "you can't deny you published this," which is exactly what ZenBin's Ed25519 signatures provide.
- **URL:** https://csrc.nist.gov/pubs/other/2026/02/05/accelerating-the-adoption-of-software-and-ai-agent/ipd

### IETF Draft: AI Agent Authentication & Authorization (draft-klrc-aiagent-auth-00, March 2026)
- **What:** Formal IETF Internet-Draft proposing auth/authz model for AI agents. Comprehensive structure covering agent identifiers, credentials, attestation, provisioning, authentication (transport + application layer), and authorization.
- **Approach:** Leverages WIMSE (Workload Identity in Multi-System Environments) architecture + OAuth 2.0 family specifications. "Agents are workloads" — treat them like workloads with own identity, credentials, and attestation.
- **Key sections:** Agent Identity Management System, Agent Identifier, Agent Credentials, Agent Attestation, Agent Credential Provisioning, Transport Layer Auth, Application Layer Auth (WIMSE Proof Tokens, HTTP Message Signatures), Agent Authorization (OAuth 2.0 delegation)
- **Three delegation patterns:** User delegates authorization to agent; agent obtains own authorization; agents accessed by systems or other agents
- **Status:** Active draft, expires September 2026
- **Signal:** IETF is formalizing agent auth as an extension of workload identity. The "agents are workloads" framing means identity protocols will converge on WIMSE + OAuth — but neither addresses content/output provenance. The attestation section covers WHO agents are, not WHAT they produce.
- **URL:** https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/, https://www.ietf.org/archive/id/draft-klrc-aiagent-auth-00.html

### Analytics Insight: Top Identity/Authentication Platforms for AI Agents in 2026 (May 2026)
- **What:** Market overview of identity/authentication platforms competing on agent governance
- **Key players profiled:**
  - **Microsoft Entra Agent ID** — registers agents as separate identity category, distinct from employees/software
  - **Merge** — integration-focused, gives visibility into how agents move across enterprise systems
  - **Nango** — OAuth management across hundreds of APIs for agent-driven products
  - **Auth0/Okta** — expanding existing identity platforms for agent authentication (still developing)
  - **HashiCorp Vault** — secrets management for agent credentials, short-lived tokens
- **Key insight:** The competitive battleground has shifted from authentication to **governance** — who granted access, what agents can do, how every action is logged and audited
- **Gartner stat:** 40% of large enterprises now run autonomous agents in production (up from <10% two years ago)
- **Signal:** The market is coalescing around governance as the differentiator. Authentication is table stakes. But governance = who did what, not who published what. ZenBin's output attestation layer is the missing governance piece — audit trail for what agents PUBLISH, not just what they ACCESS.
- **URL:** https://www.analyticsinsight.net/artificial-intelligence/top-identity-and-authentication-platforms-for-ai-agents-in-2026

### CurrentAffair.today: AI Agent Identity Crisis (May 27, 2026)
- **What:** Comprehensive analysis of why OAuth 2.0 and human-centric auth fail for autonomous agents
- **Three critical failures of OAuth for agents:**
  1. **MFA Barrier** — agents can't solve captchas or check phones; forcing agents past MFA is a security nightmare
  2. **Coarse-Grained Scopes** — "Write Access" to GitHub means an agent can delete repos; need intent-based authorization
  3. **Delegation Chain** — if Agent A delegates to Agent B, how does B prove it has the user's permission? Traditional tokens don't propagate well
- **Key stat:** 78% of organizations have no documented policy for creating or revoking AI identities (Cloud Security Alliance, early 2026)
- **Emerging standards mentioned:** WIMSE, AIMS, SPIFFE/SPIRE
- **Signal:** The identity crisis framing is going mainstream. The delegation chain problem is exactly what ZenBin's Ed25519 signing addresses at the content level — if Agent A publishes content and Agent B publishes content, both can be independently verified back to their delegator. Content-level delegation provenance is the missing piece.
- **URL:** https://www.currentaffair.today/blog/technology-13/ai-agent-identity-crisis-653

### Identigate: Agent Identity & Human Verification (March 2026)
- **What:** Analysis of the "human verification" gap in agent identity chains
- **Key findings:**
  - 40% of enterprise apps will feature task-specific AI agents by end-2026 (Gartner), but only 23% of orgs have formal agent identity strategy
  - Machine identities now outnumber human users 17:1 in large organizations
  - Non-Human Identity (NHI) access management market: $11.3B in 2025, projected $38.8B by 2036
  - Teams continue sharing human credentials with agents in absence of better solutions
- **Key framing:** "Authenticated but not verified" — agents have credentials but no verified link to an accountable human
- **RSAC 2026 announcements:** IBM/Auth0/Yubico partnership, NIST public comment period, CSA research
- **Signal:** The market gap is explicit: authentication (credentials) without verification (provable link to human). ZenBin provides the verification layer for published content — not just that an agent has credentials, but that the content it published is cryptographically linked to an accountable identity.
- **URL:** https://identigate.com/blog/posts/2026-03-22-ai-agent-identity-human-verification/

### Tigera: Five Pillars of AI Agent Accountability (May 26, 2026)
- **What:** Diagnostic framework for engineering leaders on AI agent accountability. Five pillars: identity, traceability, governance, security, compliance.
- **Signal:** "Accountability" is the enterprise framing for what indies call "provenance" or "attestation." Same problem, different vocabulary. "Identity" and "traceability" are two of the five pillars — both addressed by ZenBin: cryptographic identity (who published) and content traceability (what was published, when, with what signature).
- **URL:** tigera.io/blog/the-five-pillars-of-ai-agent-accountability

### Tigera: Agent Accountability Gap — Why Network Policies, API Gateways, & RBAC Aren't Enough (May 27, 2026)
- **What:** Follow-up to the five pillars post, arguing that network policies, API gateways, and RBAC are insufficient for agent accountability because they're all input-side controls that don't address what agents produce.
- **Signal:** Explicit recognition that current security controls cover agent INPUT (what agents can access) but not agent OUTPUT (what agents produce). This is the exact gap ZenBin fills — output-level attestation.
- **URL:** https://www.tigera.io/blog/the-ai-agent-accountability-gap-why-network-policies-api-gateways-and-rbac-are-not-enough/

### declaw.ai — Agent Sandbox Integrity and the Dirty Frag Zero-Day (May 28, 2026)
- **What:** Tested Dirty Frag kernel zero-day (CVE-2026-43284) against container vs. microVM sandboxes. Container sandbox: root in <2s. Firecracker microVM: exploit contained inside guest.
- **Key argument:** Kernel exploits operate below container isolation. What matters isn't permissions but kernel sharing. For multi-tenant agent platforms, "as long as we're patched" is the gap.
- **Signal:** Validates that agent execution environments need stronger isolation than containers. For identity, this means the trust boundary for agent outputs depends on execution isolation — a compromised container means compromised identity. ZenBin's Ed25519 signing is orthogonal: even if execution is compromised, the published output's signature is still verifiable.
- **URL:** https://declaw.ai/blog/dirty-frag-microvm-isolation

### RootCX — Agent Governance: Identity, Delegation & Permissions (May 28, 2026)
- **What:** Comprehensive framework for agent identity governance. Three models: impersonation (agent acts as user = trap), service account (static credential = trap), delegation (agent has own identity, acts on behalf of user = correct).
- **Key model:** Effective authority = intersection of agent role ceiling AND delegator floor. The narrower scope always wins.
- **8-point governance check:** own identity, capability ceiling, intersection authority, deny-without-delegator, auth-unaware agent, standing mandates for cron, short-lived audience-bound tokens, dual-identity audit
- **RFC 8693 token exchange:** identity-only tokens (no capabilities), 120-second lifetime, audience-bound
- **Signal:** RootCX is building a governance platform on the delegation model. Their "agent knows nothing" pattern (all auth outside agent process) is the same design philosophy ZenBin uses for output: the agent doesn't self-attest; the platform validates and signs. RootCX handles input governance; ZenBin handles output provenance. They're complementary layers.
- **URL:** https://rootcx.com/blog/ai-agent-governance-implementation

### The Agent Trust Stack — 11-Layer Framework (May 28, 2026)
- **What:** Layered trust taxonomy for agent infrastructure. 7 trust layers (0-7) + 3 operational layers (8-10).
- **Trust layers:** 0=Compute/Runtime, 1=Model, 2=Identity, 3=Reputation/History, 4=Policy/Commitment, 5=Capability Restriction, 6=Action Verification, 7=Audit/Provenance
- **Operational layers:** 8=Orchestration, 9=Integration, 10=Interface
- **Key insight:** "Agent trust is often discussed as though it were a single property. It is not." Vendors at one layer often claim guarantees that only make sense at another.
- **ZenBin positioning:** Sits at the intersection of Layer 2 (Identity — agent keypairs), Layer 4 (Policy — signed content commitments), and Layer 7 (Audit/Provenance — cryptographic proof of what was produced). The framework explicitly asks "what did the agent actually do, and can we prove the record is complete and untampered?" — that's ZenBin's core value proposition.
- **URL:** https://www.citizenofthecloud.com/blog/agent-trust-stack-layered-framework

### CIAM Agent Identity via MCP — guptadeepak.com (May 28, 2026)
- **What:** Guide to authenticating non-human identities via MCP. Key data: 10-30% of auth volume now from agents (Descope/Auth0 2026 telemetry).
- **Pattern:** `sub=agent, act=human` token claims — separating agent vs human tokens for different rate limits, scopes, and audit treatment
- **Dynamic Client Registration (RFC 7591):** agents register at runtime, get client_id/client_secret on the fly
- **Web Bot Auth (IETF draft):** cryptographic bot identity at network layer (HTTP Message Signatures)
- **Vendor snapshot:** Descope (MCP-native), Auth0 (partial via Actions), Stytch (partial), Ory (partial), Curity (standards-purist)
- **Signal:** The `sub=agent, act=human` pattern is becoming standard for access tokens. This is identity-for-access. ZenBin adds identity-for-output: who produced this content. Both are needed.
- **URL:** https://guptadeepak.com/ciam-compass/guides/ai-agent-identity-mcp/

### GitHub Commit Verification Logic Flaw (May 26, 2026)
- **What:** GitHub's "Verified" badge verifies the committer's signing key, not the author's identity. Author and committer can be different people, but the UI shows the author next to the green "Verified" badge.
- **Impact:** AI agents can exploit this — commit as anyone, sign with own key, display as "Verified" next to the impersonated author's name.
- **Defense:** Vigilant mode is opt-in, off by default, gated on the impersonated user's settings (not the attacker's).
- **Signal:** This is a real-world provenance failure that ZenBin solves. GitHub proves who signed the commit, not who wrote the code. When agents produce content, you need to know WHO produced it. ZenBin's per-agent-key signing model addresses this exact class of problem.
- **URL:** (HN discussion, story_id 48274410)

### Grove — Per-Segment Provenance in Personal Knowledge (May 28, 2026)
- **What:** Open-source MCP server for Obsidian vaults with per-segment provenance/blame. Every write is a git commit with provenance trailers that distinguish "user's standing thinking" from "AI's moment-in-time synthesis."
- **Pattern:** Git-backed provenance with attribution trailers on commits. Read path surfaces blame so future readers know what's human vs AI.
- **History:** Was a hosted product (April–May 2026), pivoted to open-source single-user. Multi-tenant SaaS stripped.
- **Signal:** Provenance spreading from compute (Darwin) and decisions (Circe) into personal knowledge management. Grove does per-note provenance in private; ZenBin does per-page provenance in public. Same concept, different scope and audience.
- **URL:** https://github.com/jmilinovich/grove