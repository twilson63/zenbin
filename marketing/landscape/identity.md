# AI Agent Identity Landscape

Last updated: 2026-05-25 12:14 UTC

### Prisma Next — Hash-as-Identity + Signing in Mainstream Dev Tools (May 2026)
- **What:** Full Prisma rewrite in TypeScript. Data contracts are hashed to give identity (like git commits) and that hash is used to SIGN the database. If DB is signed with contract hash, app knows it's compatible. Migrations as graphs with precheck/postcheck verification.
- **Key insight:** "Data contracts and verified, hashed, deterministic migrations are strong enough primitives to safely delegate this work to an agent." Prisma Next ships "curated skills with guardrails on every operation" — explicitly designing for agent delegation.
- **Signal:** A mainstream ORM (millions of users) now uses hash-as-identity + signing as its core model. The pattern is escaping crypto/auth into general developer tools. Prisma validates that guardrails + verified operations are how you make agents safe.
- **ZenBin angle:** Prisma signs databases with contract hashes. ZenBin signs published content with agent key hashes. Same primitive, different domain. The hash-as-identity convergence validates ZenBin's approach.
- **URL:** https://github.com/prisma/prisma-next

### Prisma Next — Hash-as-Identity + Signing in Mainstream Dev Tools (May 2026)
- **What:** Full Prisma rewrite in TypeScript. Data contracts are hashed to give identity (like git commits) and that hash is used to SIGN the database. If DB is signed with contract hash, app knows it's compatible. Migrations as graphs with precheck/postcheck verification.
- **Key insight:** "Data contracts and verified, hashed, deterministic migrations are strong enough primitives to safely delegate this work to an agent." Prisma Next ships "curated skills with guardrails on every operation" — explicitly designing for agent delegation.
- **Signal:** A mainstream ORM (millions of users) now uses hash-as-identity + signing as its core model. The pattern is escaping crypto/auth into general developer tools. Prisma validates that guardrails + verified operations are how you make agents safe.
- **ZenBin angle:** Prisma signs databases with contract hashes. ZenBin signs published content with agent key hashes. Same primitive, different domain. The hash-as-identity convergence validates ZenBin's approach.
- **URL:** https://github.com/prisma/prisma-next

### Circe — Offline-Verifiable Signed Receipts for Agent Actions (Jan 2026, HN)
- **What:** Cryptographically signed receipt for AI agent execution. Each agent run emits a canonical JSON receipt signed with Ed25519 (RFC 8785 JSON canonicalization). Offline-verifiable — no network calls, no issuer dependency. Tamper-evident: any mutation flips the SHA-256 hash and invalidates the signature.
- **Key design:** Deterministic signing (Ed25519), canonical JSON, standalone verifier script. Positioned as a small integrity/provenance primitive to compose with higher-level agent frameworks.
- **Signal:** Someone independently built Ed25519 + canonical JSON signing for agent output — almost exactly ZenBin's model but framed as a receipt for agent *actions* rather than published *content*. Validates the signing pattern. The "receipt" framing is interesting: it's about proving what an agent DID (action provenance), while ZenBin is about proving what an agent PRODUCED (content provenance).
- **ZenBin angle:** Circe validates the core crypto primitive (Ed25519 + canonical JSON + offline verification). The difference: Circe receipts are for internal audit trails; ZenBin signatures are for public content attribution. Same building blocks, different use case.
- **URL:** https://github.com/wv26296-ux/circe-receipts

### Vouch Protocol — DID-Based Agent Identity + C2PA Submission (Jan 2026, HN)
- **What:** Open-source standard for AI agent identity using W3C Decentralized Identifiers (did:web). Agent generates Ed25519 key pair, publishes public key to domain's `/.well-known/did.json`, signs every action with JWT-VC (Verifiable Credential). Recently submitted to C2PA (Coalition for Content Provenance and Authenticity) alongside Adobe and Microsoft.
- **Key design:** Four steps — Identity (key pair), Resolution (/.well-known/did.json), Signing (JWT-VC), Verification (no central server needed). Positions against X.509 CA model as too expensive/slow for billions of agents.
- **Signal:** Two massive signals: (1) The did:web + Ed25519 + /.well-known pattern is exactly what ZenBin uses. Vouch independently arrived at the same architecture. (2) C2PA submission means agent identity is being pushed as a content provenance standard — directly in ZenBin's territory.
- **ZenBin angle:** Vouch is the closest architectural sibling to ZenBin. Both: Ed25519, did:web, /.well-known, offline verification. Key difference: Vouch signs agent ACTIONS (input/intent verification). ZenBin signs agent OUTPUT (content/publishing). The C2PA submission is significant — it's pushing decentralized agent identity into content provenance standards, which is exactly where ZenBin lives.
- **URL:** https://github.com/vouch-protocol/vouch

### Pro Health Ledger — Identity Verification Graph for Professional Conduct (May 2026, HN)
- **What:** Immutable record of professional conduct. Non-anonymous — anchored to a binary subjective question ("Would you work with them again?"). 1 flag credit per vouch. GDPR/DPDP compliant with removal audit trail. Built with JavaScript + Vercel, GitHub Issues as database.
- **Signal:** Another identity verification system, but for human professionals not agents. Shows the broader trend: identity verification graphs are becoming a product category. The "how do we verify X actually worked with Y" problem applies equally to humans and agents.
- **ZenBin angle:** Pro Health Ledger verifies professional relationships. ZenBin verifies agent-author relationships. Same verification graph problem, different domain. The credit system (earn trust before flagging) is a pattern worth watching for agent reputation systems.
- **URL:** https://ProHealthLedger.org

### Auth.md by WorkOS — Open Agent Registration Protocol (May 2026)
- **What:** Open protocol for agent self-registration at domains. Publish auth.md at your domain declaring flows, scopes, and endpoints. Like robots.txt but for agent signup.
- **Key design:** Three flows (trusted identity assertions, OTP-based claims, anonymous access). Scoped, auditable, expirable, revocable credentials.
- **Signal:** The .well-known pattern (robots.txt → ai.txt → auth.md) is becoming standard for declarative agent capability discovery. WorkOS (major auth infra company) validates this as a real need.
- **ZenBin angle:** Auth.md = input (how agents get in). ZenBin = output (how agents publish out). A domain that declares auth.md could also declare a publishing standard.
- **URL:** https://workos.com/auth-md

### Agent Credential Brokers — Survey of 8 Tools (authsome.ai, May 2026)
- **What:** Comprehensive survey of the "agent proxy" tool category — 8 tools grouped by what they solve: credential injection (Authsome, Agent Vault, Clawvisor, OneCLI), interception (mitmproxy), API gateway (Pomerium, Cloudflare AI Gateway), mocking (WireMock).
- **Key insight:** "Agent proxy is becoming the catch-all term for any tool that intercepts an agent's outbound traffic and does something useful: inject credentials, filter requests, log traffic, enforce policy, mock responses."
- **Notable tools:**
  - **Authsome** — Local-first credential broker for personal/dev machines. 44 bundled providers, device code flow, MIT licensed.
  - **Agent Vault** (Infisical) — Production credential broker. Go binary, web UI + MITM proxy, multi-tenant, "don't run on same machine as agent" threat model.
  - **Clawvisor** — Authorization gateway with task-scoped human approval + LLM-powered intent verification. Open-source.
- **Signal:** Agent credential brokering is becoming a recognized product category with multiple approaches (local-first vs production, credential injection vs authorization gateway). All 8 tools handle INPUT (credentials/auth/policy). None handle OUTPUT (publishing/attestation).
- **ZenBin angle:** The entire agent proxy category handles what goes INTO agents (creds, auth, policy). ZenBin handles what comes OUT (signed, attributed, published content). The 8-tool survey validates the input side is well-served. The output side remains empty.
- **URL:** https://authsome.ai/blog/top-agent-proxy-tools-what-to-know

## The Big Picture

Agent identity is the hottest emerging topic in 2026. The industry has recognized that agents can't stay anonymous service accounts forever — they need first-class identity, delegation chains, and cryptographic proof.

Three new identity protocols this week (Ratify, AAuth, Facet/KYAPay) plus the Keycard 4-layer security framework confirm this is becoming a funded category. CrowdStrike acquired SGNL for $740M and Palo Alto acquired CyberArk for $25B — both citing agentic identity as a driver.

Since last update: Five more major identity entrants confirmed the space is rapidly professionalizing:
- **identities.ai (Ratify Protocol):** Full open-source protocol with SDKs in 4 languages, hybrid post-quantum signing (Ed25519 + ML-DSA-65), offline sub-millisecond verification. The most production-ready agent identity standard seen. Three-verb model: Delegate, Present, Verify. No vendor in the path.
- **AstraCipher:** Open-source post-quantum SDK (W3C DIDs + Verifiable Credentials + NIST FIPS 204/203). Integration with A2A and MCP. Stats: 88% orgs report agent security incidents, only 22% treat agents as identity-bearing.
- **Uber:** Published architecture for solving agent identity crisis internally — Agent Registry, identity propagation across agent hops, per-agent access policies. When agents chain (A→B→C), originating human identity gets lost without explicit propagation.
- **Cloudflare Web Bot Auth:** Cryptographic ID cards for agents at HTTP request level. Agent Registry for key discovery. SSL/TLS but for bots.
- **Vigil (Agent Auth):** DID + Ed25519 + challenge-response + Verifiable Credentials. "Google Sign-In for agents" positioning with dashboard for managing agent behavior and permissions.

New this cycle: Deckard (per-agent identity + ACL for Apple services via MCP) shows the personal multi-agent identity model maturing. When you run 4+ agents across different machines, per-agent auth is essential, not optional.

**New (May 19 16:50):** Parag Agrawal's Parallel/Index introduces Shapley-value-based output attribution — the first economic model that ties compensation to what an agent produced and which sources contributed. This is conceptually adjacent to identity: if you're compensating based on output, you need to prove who produced it. Output identity is becoming an economic necessity, not just a security concern.

**New (May 23):** NIST formally evaluates MCP as one of 5 standards for agentic AI identity governance (alongside OAuth 2.0/2.1+OIDC, SPIFFE/SPIRE, SCIM, NGAC). Five unsolved problems identified: Agent Identification, Key Management, Zero-Trust Least-Privilege, Delegation Chain Tracking, Audit Trail Integrity. NIST's "Audit Trail Integrity" problem maps directly to ZenBin's architecture (cryptographically signed, append-only, separate from agent execution environment).

**New (May 23):** AIUC-1 Q2-2026 standard update adds A003.3 (unique, cryptographically verifiable agent identities) and A003.4 (JIT permission architecture). 120+ consortium members. MCP security controls formalized across auth, transport, and tool governance. Figma MCP RCE (CVE-2025-53967, 558K+ installations) cited as evidence of the threat.

**New (May 23):** 7 identity/secrets MCP servers now in production (Auth0, Okta, WorkOS, Clerk, Keycloak, 1Password, HashiCorp Vault). The entire MCP identity ecosystem is for INPUT/AUTH — zero servers for OUTPUT/ATTESTATION. This is the clearest gap ZenBin can fill.

**New (May 23):** AgentLair — agent identity + credential vault + namespace isolation in one API call. Cloud Security Alliance: 67% can't distinguish AI agent from human actions. Perplexity CTO left MCP over auth friction. AgentLair bundles email + vault + pods vs. ZenBin's focus on output identity.

**New (May 23):** Lyfe.ninja — revocable digital signatures for AI content verification. Ask HN post exploring product-market fit for content-level signing of AI outputs with revocability. Key properties: AI responses signed after generation, client-side verification, tampering causes failure, signatures revocable via short-lived leases. Low traction (3 pts) confirms the gap exists but hasn't converged. Direct competitor space to ZenBin (content signing) with different model (revocable leases vs. permanent attestation).

**New (May 20):** Lemma Oracle brings ZK proofs + BBS+ selective disclosure to agent identity inside x402 payment headers. Their roadmap explicitly maps did:key → agentId with role/scope/spendLimit. This is the most direct tech overlap with ZenBin's identity model — both use cryptographic proofs + agent identity, but Lemma is access/payment-focused while ZenBin is output/attribution-focused.

**New (May 20):** ChronoGuard implements mTLS-based agent identity verification for browser automation fleets, plus hash-chained audit logs. Network-layer agent identity is maturing.

**New (May 21):** TBN Protocol introduces runtime governance infrastructure for AI agents — 14-step flow from registration through security challenges to cryptographic attestation certificates. Notable: fingerprint drift detection means agent identity is not just "who are you" but "are you still the same agent you were when certified?" If the bot's configuration changes (wrong model, exceeded budget, changed endpoint), it must re-certify. This is identity continuity verification — a step beyond one-time registration. Trust handshakes between bots use mutual certificate verification. Certification levels (STANDARD → COMMUNITY) mirror what PCI compliance did for payments.

**New (May 20, evening):** Silicon Psyche's Posture Sequence Analysis (PSA) — a behavioral health monitor for LLMs/agents with 6 classifiers (Input Intent, Adversarial Stress, Sycophancy, Hallucination Risk, Persuasion Technique, Action-Risk). Not identity per se, but behavioral profiling: builds a "fingerprint" of how a specific agent behaves under different conditions. Their C5 Action-Risk Classifier tracks tool calls, delegations, context handoffs, and cross-agent contagion — which implicitly requires knowing *which agent* did *what*. Integration with LangFuse and ElevenLabs evals. This is identity via behavior rather than cryptography — complementary to AAuth/Keycard.

**New (May 20, evening):** SRM paper (arxiv:2603.22350) on detecting slow-burn risk in AI-agent sessions before execution. Risk detection at the session level implies session identity and continuity — you need to know this is the *same agent session* over time to detect slow-burn drift. Another signal that agent sessions need first-class identity.

**New (May 21, morning):** Agent.email (YCS25, AgentMail) — agents self-provision email inboxes via curl, claim with human OTP. 1:1 agent:human mapping (many-to-one coming). The "restricted until claimed" trust model is a delegation chain: human authorizes → agent gets limited capabilities → human confirms → full access. This is service-provisioning identity, not output identity — the agent has an inbox but can't prove what it wrote. They shortened messageIDs because agents hallucinated completions on longer ones (a production-proven UX insight for agent-facing systems).

The gap: **All identity protocols prove WHO the agent is and WHO authorized it. None prove WHAT the agent produced.** ZenBin's output attestation layer is unaddressed. Five new entrants this cycle confirm the pattern:
- **Ratify:** Proves delegation chain (who authorized, what scope, what expiry). Doesn't attest what the agent published.
- **AstraCipher:** Proves agent identity + capability credentials. Doesn't attest published output.
- **Uber:** Propagates human identity through agent chains for API access. Doesn't carry identity to published content.
- **Web Bot Auth:** Proves an HTTP request came from a known agent. Doesn't prove content was produced by that agent.
- **Vigil:** Proves agent identity at authentication time. Doesn't prove content provenance at publish time.

Every new entrant solves the input/authorization side. The output/attestation side remains ZenBin's alone.

**New (May 21, afternoon):** 1Password MCP Server for OpenAI Codex — a "trusted access layer" that lets agents access secrets without seeing them. Scoped, delegated secret access. This is a major identity/security player building agent-specific MCP tooling. The pattern (agents get delegated, scoped capabilities instead of full credentials) reinforces the principle that agent identity should be narrow and verifiable, not broad and anonymous.

**New (May 22, morning):** Lyfe Ninja (Ask HN, April 21) — revocable digital signatures for AI content verification. The author built a system that signs AI responses after generation, verifies client-side, and can revoke signatures via hard (delete signing model) or soft (revoke lease) mechanisms. Key properties: no key management, distributed verification, embedded metadata, revocable by design. They explicitly frame this as "know your agent" — verifying that AI-generated content came from the intended agent and hasn't been altered. The question they're asking: "Would you want to stand by your AI agent's output forever? I think not." This is the closest direct competitor concept to ZenBin's output attestation — revocable signatures for AI output. However, it's framed as a question (Ask HN), not a launched product, and focuses on streaming chat verification, not publishing. The revocability angle is interesting — ZenBin's approach of permanent Ed25519 signatures differs from their revocable model. Key distinction: they solve verification of chat output (ephemeral), ZenBin solves attestation of published output (permanent).

**New (May 22, morning):** Bawbel — open-source scanner for agentic AI components (MCP servers specifically). Scanned top 100 Smithery servers, found 22 with at least one vulnerability (4 CRITICAL, 24 HIGH). Most common finding: tool description injection (AVE-2026-00002) — tool descriptions containing behavioral instructions targeting the agent instead of describing the tool. Not identity per se, but security scanning for agent-facing infrastructure is becoming a real category.

**New (May 22, morning):** Silicon Psyche PSA (re-confirmed May 21 HN post, 10 pts, 6 comments) — behavioral health monitor for LLMs/agents with 6 classifiers. Action-Risk Classifier (C5) tracks cross-agent contagion, tool calls, delegations, and context handoffs. Integration with LangFuse and ElevenLabs evals. This is behavioral identity — profiling what an agent *does* rather than cryptographic proof of who it *is*. Complementary to AAuth/Keycard.

**New (May 22, morning):** Dari-docs (23 pts, 7 comments) — agent documentation QA tool that runs agents against your docs to find where they falter. Supports live verification with test credentials. Input-side optimization. No equivalent for agent output QA.

**New (May 21, evening):** Agent authentication patterns are consolidating into 5 distinct approaches (chenagent.dev deep dive): (1) Static API keys with scope limiting, (2) JWT with agent claims, (3) Threshold signatures / MPC-based identity (Lit Protocol), (4) Verifiable credentials with DID anchors (World AgentKit), (5) x402 challenge-response. No consensus yet. The DID+VC pattern is most relevant to ZenBin — it proves "I am agent X, authorized by human Y, with credentials Z from authority W."

**New (May 21, evening):** IETF Internet-Draft draft-klrc-aiagent-auth-00 formalizes agent auth via WIMSE (Workload Identity in Multi-System Environments) + OAuth 2.0. Defines Agent Identifier, Agent Credentials, Agent Attestation, Agent Credential Provisioning. Key sections: WIMSE Proof Tokens, HTTP Message Signatures for agent auth, OAuth 2.0 delegation. The "agents are workloads" framing treats agents like service mesh identities. Moving toward RFC status.

**New (May 21, evening):** Agentic IAM ecosystem is expanding rapidly: Coalition for Secure AI published Agentic IAM spec, Visa has Trusted Agent attestations, Mastercard has Agent Pay tokens, W3C DIDs are being used for agent identity. Aport.io covers pre-action authorization patterns. Signets.ai covers agent payment verification. All focus on input-side (who is this agent, what can it access). None address output-side (what did this agent produce).

**New (May 21, afternoon):** Runtime (YC P26) — sandboxed coding agents for teams. RBAC scoped per human AND per agent. Agents are first-class principals with their own permissions. The execution-sandboxing layer of the agent trust stack is getting venture backing. Runtime treats agent identity as a first-class concept: each agent has its own access scope, separate from the human who triggered it.

**New (May 21, afternoon):** opub — donated compute for open-source projects. Addresses the cost problem of agent compute. Not identity per se, but reinforces that agent infra is becoming a funded category with its own economics.

**New (May 22, morning):** Lyfe Ninja (Ask HN, April 21) — revocable digital signatures for AI content verification. Asks whether content-level verification for AI outputs is something developers want. Signs AI responses, verifies client-side, revocable via hard/soft mechanisms. "Would you want to stand by your AI agent's output forever?" This is the closest conceptual overlap with ZenBin — but framed as a question not a product, and focused on ephemeral chat verification, not permanent publishing attestation. Only 3 pts, 2 comments — low traction, suggesting the market hasn't converged on this problem yet. Gap confirmation: even the person asking this question hasn't found product-market fit for output verification.

**New (May 23):** identities.ai — Ratify Protocol: peer-verifiable cryptographic delegation for AI agents. Open standard (BSL 1.1 → Apache 2.0) with SDKs in Go, TypeScript, Python, Rust. Three-verb protocol: Delegate (principal signs certificate binding agent to scope/expiry), Present (agent attaches proof bundle with fresh challenge signature), Verify (third party runs 5 deterministic checks in <1ms, offline). Hybrid Ed25519 + ML-DSA-65 (NIST FIPS 204) post-quantum signing. Same delegation primitive works for humans→agents and agents→sub-agents. Key differentiator: no live API call needed for verification, no vendor in the path. This is the most mature agent identity protocol seen so far — production-ready SDKs, post-quantum, offline-verified. **ZenBin angle:** Ratify proves WHO authorized the agent and WHAT it can do. ZenBin proves WHAT the agent PRODUCED. These are complementary: Ratify handles input identity (delegation of authority), ZenBin handles output identity (attestation of published content). A Ratify-verified agent that publishes via ZenBin would have a complete identity chain from authorization to output.

**New (May 23):** AstraCipher — open-source SDK for post-quantum cryptographic identity for AI agents. W3C DIDs + Verifiable Credentials + NIST post-quantum crypto (ML-DSA-65 FIPS 204, ML-KEM FIPS 203). Integration with Google A2A and MCP protocols. Key stats cited: 88% of organizations report confirmed/suspected AI agent security incidents; 44% still use static API keys; only 22% treat agents as identity-bearing entities. OWASP Top 10 for Agentic Applications 2026 lists Identity & Privilege Abuse as #3 risk. Trust chains with depth limits: Creator → Authorizer → Agent → Sub-agent. BSL 1.1 → Apache 2.0 license. npm: @astracipher/core @astracipher/crypto. **ZenBin angle:** AstraCipher provides DID-based agent identity with verifiable credentials for what agents CAN do. ZenBin provides Ed25519-signed attestation for what agents DID produce. The credential model (scope/expiry) is input-side; publishing attestation is output-side. Together they'd give agents both capability verification and output provenance.

**New (May 23):** Uber — Solving the Identity Crisis for AI Agents (blog post, May 2025). Uber built internal Agent Platform in early 2025 for composing, deploying, and operating production agents at scale. Made microservices AI-ready with MCP support. Two core problems identified: (1) Current identity model doesn't describe agency — agents act on behalf of humans but existing IAM treats them as generic service accounts. (2) Original provenance isn't carried forward across agent hops — when Agent A calls Agent B which calls System C, the originating human's identity is lost. Architecture: Agent Registry (agents deployed as Kubernetes workloads), identity propagation across agent chains, per-agent access policies. Key insight: "An agent is best defined as an entity that is authorized to act for or in the place of another." **ZenBin angle:** Uber's identity propagation problem is exactly the delegation chain problem, but for API access. When agents publish content (not just call APIs), the provenance chain needs to carry forward too. Uber solves this for internal microservices; ZenBin solves it for public-facing published output.

**New (May 23):** Cloudflare Web Bot Auth protocol (May 2025) + Agent Registry (Oct 2025) — cryptographic ID cards for AI agents. Agents sign every HTTP request with a cryptographic signature; websites verify against published public keys. Like SSL/TLS certificates but for bots. Registry format solves key discovery: distributed, queryable database mapping agent identifiers to verification credentials. rCAPTCHA analysis article covers this plus Visa's Trusted Agent Protocol and HUMAN's AgenticTrust. **ZenBin angle:** Web Bot Auth verifies that a REQUEST came from a known agent. ZenBin verifies that PUBLISHED CONTENT came from a known agent with a known signing key. Request-level identity is necessary but insufficient — you also need content-level identity. Cloudflare has the infrastructure reach to make agent signing mainstream for HTTP; ZenBin could ride that wave for content publishing.

**New (May 23):** Vigil (Agent Auth) — DID-based cryptographic identity for AI agents. Ed25519 keypairs + challenge-response auth + Verifiable Credentials. Positioning: "Google Sign-In solved identity for humans. Nothing exists for AI agents. Until now." Dashboard to manage agents, see activity, recognize returning agents, set permissions based on behavior. Same flow as human login but for agents. **ZenBin angle:** Vigil is authentication infrastructure (log in as an agent). ZenBin is publishing infrastructure (sign output as an agent). Authentication and attestation are different layers. Vigil proves the agent is who it claims to be at request time; ZenBin proves the content was produced by the claimed agent at publish time.

**New (May 21, afternoon):** MCP-safeguard — first automated security scanner for MCP servers. Third MCP security tool (after MCPSafe and korrel-dev audits). MCP ecosystem is hitting maturity where security tooling is a requirement.

**New (May 21, afternoon):** SoMatic — vision-based OS automation for agents via YOLO + MCP server. Agents can now navigate any UI by sight, not just DOM/accessibility-tree. Expands the surface of what agents can interact with, including publishing platforms without APIs.

**New (May 21, afternoon):** Open Prompt Hub — "GitHub for prompts" with versioning, forking, security scanning. You can verify the prompt but not what the agent produced from it. Reinforces the output-attribution gap.

**New (May 21, afternoon):** Larkin — authorization middleware for x402 agent payments. Agent payment auth is now a product category. Part of the financial identity layer for agents.

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

### Pi MCP Bridge Auth Pattern — Persistent Workspace for All AI Tools (May 2026)
- **What:** Identity architect's DIY auth stack for giving multiple AI tools shared persistent workspace
- **Auth layers:** Clerk OAuth at MCP connection + shared-secret origin proxy (Cloudflare Worker) + TOTP gateway for tool execution (human enters code, agent calls TOTP tool)
- **Key insight:** "One Clerk OAuth app, one TOTP code, one workspace. Any MCP-compatible tool connects with three strings."
- **Security:** Every tool call logged with SHA256 hashes, every file write creates backup, all on a disposable VPS
- **Signal:** When identity architects build for themselves, they layer OAuth + TOTP + shared-secret + hash logging. The auth stack is getting deep even for personal use. Output identity (which agent published what) is still unaddressed.

### InsForge Backend Branching — Identity Primitive for Agent Isolation (May 2026)
- **What:** YC P26 company offering isolated backend branches (DB, auth, storage, functions, schedules) per agent task
- **Identity angle:** Each branch is an identity boundary — the agent works in isolation, human reviews diffs, then merges or discards
- **Auth model:** Split-plane architecture — BYOC for data residency, proxy layer for credential isolation
- **Signal:** The "isolation + review + merge" pattern is a primitive form of output attestation. But it's for database changes, not content publishing. The concept of "agent produces, human verifies, then it goes live" is exactly what ZenBin does for web content.

## Gaps ZenBin Fills

- **Agent publishing identity:** Most identity work focuses on auth (who is this agent?) not on presentation (what does this agent produce?). ZenBin gives agents a public, verifiable identity through their published output.
- **Output provenance:** No standard addresses "this content was created by agent X on behalf of user Y" in a user-verifiable way. ZenBin's signed publishing creates an auditable trail. Lyfe Ninja is asking about verification of AI outputs (closest concept) but has no product.
- **The 80% visibility gap:** Strata survey shows 80% of orgs can't track what agents are doing. Published agent output with identity is a step toward transparency.
- **No output-layer auth:** Six auth/security frameworks now (AAuth, IETF, Passport, Ratify, AgentGate, Keycard stack model) — all address input-side (who can this agent BE, what can it DO, how is it secured). None address output-side (who created this content, can I verify it came from a real agent?). The Keycard 4-layer model explicitly has no output layer.
- **Personal agent identity is scaling:** Deckard proves that even individual users running multiple agents need per-agent identity + scoped access. This is the personal-scale version of the enterprise identity problem. Output identity scales the same way — which agent published this, on whose behalf, with what scope?
- **Revocable signatures emerging:** Lyfe Ninja's Ask HN shows someone is thinking about signing AI outputs — but framing it as a question, not a product. The concept of verifiable agent output is emerging in developer consciousness, but nobody has productized it. ZenBin's Ed25519 signed publishing is the product version.
- **Anonymous-first identity models appearing:** Auto Agent Protocol (AAP) uses anonymous-by-default with consent-gated escalation — inventory queries are anonymous, personal data only with explicit ConsentGrant. This is a privacy-first pattern that contrasts with ZenBin's attribution-first pattern, but the principle (identity only when needed, scoped to purpose) is the same. For publishing, the inverse applies: attribution is the default, anonymity requires deliberate action.
- **Agent safety monitoring needs identity:** SRM paper (slow-burn risk detection) and Silicon Psyche PSA (behavioral health monitor with 5+ classifiers) both need to know WHO the agent is to detect WHAT's going wrong. Identity is the foundation for safety monitoring. Safety monitoring naturally extends to output monitoring — if you can detect risk in sessions, you should verify output authenticity. ZenBin's output attestation is the next layer after session monitoring.
- **Consent-gated data flow is a pattern:** AAP's ConsentGrant model and DialtoneApp's owner-approved-rules model both show that the agent identity space is converging on scoped, consent-based access. Output identity follows the same principle: publishing is an intentional, consented, scoped action — not ambient data leakage.
- **Contract hashing for identity spreading beyond DB schemas:** Prisma Next (May 22) hashes data contracts to give them identity (like git commits) and uses those hashes to "sign" DB compatibility. This is the same cryptographic pattern ZenBin uses for content identity (Ed25519 signing). The hash→identity→sign/verify pattern is proving out across infrastructure layers. Prisma applies it to data schemas, OTA applies it to repo readiness, ZenBin applies it to published content.
- **MCP security scanning emerging:** MCP-safeguard (52 detection rules, May 22) and Mcpaudit (static security scanner, May 22) both launched the same day, confirming MCP security is now a dedicated category. When the input connector (MCP) gets security scanning, the output endpoint (publishing) needs security attestation.
- **Ed25519 converging as the agent identity standard:** AIP (Agent Intent Protocol, May 22) uses Ed25519 keypairs for agent identity with DID-based identifiers, signed Intent Envelopes, and 8-step verification. This makes four independent systems now using Ed25519: AAuth, AIP, TBN Protocol, and ZenBin. The cryptographic primitive is settling. Differentiation is in application: AIP = pre-execution verification, AAuth = protocol-level auth, TBN = attestation certificates, ZenBin = output signing. All compatible, all orthogonal.
- **Tiered verification is a design pattern:** AIP's 3-tier model (HMAC <1ms for low-risk, Ed25519 ~5ms for normal, full pipeline ~50ms for high-value) validates that not every action needs full crypto. This maps to content publishing: casual output needs lightweight attestation, high-value published content needs full Ed25519 signing. ZenBin could adopt tiered attestation levels.
- **mTLS for agent identity is now production-grade:** ChronoGuard (May 24) uses mTLS for agent identity verification in a zero-trust proxy for browser automation agents. The service mesh pattern (Envoy + mTLS + OPA) is being applied to agents. mTLS = transport-level identity. Ed25519 signing = content-level identity. They're complementary layers.
- **Hash-chain audit logging parallels content signing:** ChronoGuard's hash-chained immutable audit logs track every agent access request. This is the same cryptographic provenance pattern as ZenBin's content signing — hash chains prove the sequence of events/access, Ed25519 signatures prove the origin of content. Different directions (inbound access vs outbound publication), same trust primitive.
- **Incode "Agentic Identity" (May 24 scan):** Incode launched Agentic Identity — identity verification and fraud prevention infrastructure specifically for AI agents. Integrates with existing identity verification, risk decisioning, and fraud prevention systems. Pilot programs in Q4 2025. Positioning: verify and secure AI agents in the era of autonomous computing. This is a major biometric identity company entering agent identity — enterprise-grade human identity verification applied to agents. Input-side (verify the agent before it acts). No output-side product.
- **CSA Agentic AI IAM Framework (cloudsecurityalliance.org):** Cloud Security Alliance published a formal IAM framework for Agentic AI covering identities, access, and delegation in multi-agent systems using DIDs and Zero Trust. The framework treats agents as first-class identity bearers within Zero Trust architectures. Key concepts: decentralized identifiers for agent identity, trust chains for delegation, and least-privilege scoping. All input/authorization-side. No content attestation.
- **AstraCipher fresh stats (May 24 scan):** Updated stats from AstraCipher landing page reinforce the identity gap: 88% of organizations report confirmed/suspected AI agent security incidents. 44% still authenticate agents using static API keys. Only 22% treat agents as independent identity-bearing entities. 97% of AI-breached organizations lacked sufficient access controls. Only 28% can trace agent actions back to a human sponsor. The gap between agent deployment (3M+ active) and agent identity maturity (22% identity-bearing) is widening.
- **AWS Bedrock AgentCore Identity (May 25 scan):** AWS launched a comprehensive IAM service purpose-built for AI agents. Four components: Agent Identity Directory (unique identities per agent with ARN metadata), Agent Authorizer (validates who can invoke which agent), Resource Credential Provider (manages outbound OAuth/API keys for agents accessing GitHub, Slack, Salesforce etc.), and Resource Token Vault (securely stores user OAuth tokens for agent-on-behalf-of flows). Dual auth model: inbound (SigV4, OAuth 2.0, OIDC, JWT) and outbound (token vault with KMS encryption). SDK integration via declarative annotations (@requires_access_token, @requires_api_key). This is AWS going all-in on agent IAM — a major cloud provider treating agents as first-class identity citizens. **All input-side:** who can invoke the agent, what the agent can access, how to store credentials. Zero output-side: no attestation, no publishing identity, no content provenance. When AWS builds this much identity infrastructure for agent INPUT and nothing for agent OUTPUT, the gap becomes a canyon.
- **Ping Identity Agentic IAM Framework (May 25 scan):** Ping Identity published a formal Agentic IAM definition and framework. Key principles: (1) Treat every agent as a managed non-human identity (NHI) with ownership and lifecycle controls. (2) Delegation, not impersonation — agents act through authenticated delegation, never by using human credentials. (3) Runtime identity — access decisions evaluated continuously at the moment of action, not statically. (4) Human-in-the-loop for high-risk actions. (5) Full audit trail linking agent actions to human sponsors. Four critical questions: Who is the agent? On whose behalf? What is it allowed to do right now? Can its actions be traced? **All input/authorization-side.** The framework is thorough about what goes INTO agents but silent on what comes OUT. Ping's framework asks "who is the agent?" — ZenBin answers "what did the agent produce?"
- **OWASP Top 10 for Agentic Applications 2026 (May 25 scan):** Globally peer-reviewed framework from 100+ experts identifying the most critical security risks for autonomous/agentic AI. Key risk #3: Identity & Privilege Abuse. The list provides operational guidance for securing agents that plan, act, and decide across complex workflows. Validates that identity abuse in agentic systems is a recognized top-tier security concern. Relevant to ZenBin: if identity abuse is #3 risk, then content provenance (proving what an agent actually produced) is the natural mitigation counterpart. You can't detect identity abuse in outputs without output attestation.
- **Microsoft Agent 365 (May 25 scan):** Microsoft announced Agent 365 — enterprise platform for secure, scalable, compliant AI agents. Details still emerging. Signals Microsoft's enterprise play in agent infrastructure. When Microsoft, AWS, and Ping all invest in agent IAM in the same quarter, the identity layer is consolidating fast — on the input side. Output remains unaddressed.

### Cordium — FOSS Sandbox with Identity-Based Secretless Access (May 2026, HN)
- **What:** Apache 2.0 open-source sandbox platform that provides identity-based, secretless secure access to infrastructure resources (APIs, SSH, databases, k8s) without injecting credentials into the sandbox. Originally a remote dev environment for Octelium, grew into a general-purpose sandbox for AI agent tasks, CI/CD, and dev environments.
- **Key design:** Sandbox + ZTNA baked-in. Access to infrastructure based on identity and policy-as-code rather than credentials. No API keys, SSH keys, or database passwords injected into sandboxes.
- **Signal:** The "identity, not secrets" pattern has jumped from enterprise IAM into developer sandbox tools. When even sandbox platforms treat identity as the access primitive, the pattern is mainstream. Also validates that agent sandboxing is a recognized category.
- **ZenBin angle:** Cordium proves identity-based access for agents (input side — "who is this agent and what can it access?"). ZenBin provides identity-based publishing for agents (output side — "what did this agent produce and can you verify it?"). Same identity-first philosophy, opposite direction.
- **URL:** https://github.com/octelium/cordium

### Know Your Agent — 2026 AI Agent Identity Market Map (Jan 2026)
- **What:** Comprehensive market map of every company building AI agent identity infrastructure in 2026. Organized into three camps: (1) Payment networks (Visa TAP, Mastercard Agent Pay), (2) Enterprise IAM (Trulioo/Worldpay KYA, Vouch AgentShield + KnowThat.ai), (3) Crypto-native (Billions Network, ERC-8004, SingularityNET/Privado ID). Plus startups: AstraSync AI (live APIs, bootstrapped), kya.ai (vaporware), knowyouragent.xyz (unclear deployment).
- **Key findings:** Visa TAP is LIVE with hundreds of secure transactions and 100+ partners. Vouch MCP-I specification is shipping. ERC-8004 launched Jan 2026 (testnets only, mainnet expected Q2 2026). Trulioo/Worldpay Digital Agent Passport is framework-stage (no API yet). Billions Network has $30M funding but agent features are roadmap Phase 2.
- **Signal:** The agent identity market is real, funded, and fragmented into three non-competing camps. The common thread: ALL focus on input/auth (who the agent IS and what it can ACCESS). None handle output/publishing identity (what the agent PRODUCED and whether it can be VERIFIED).
- **ZenBin angle:** The most comprehensive market map confirms what ZenBin's landscape research has been tracking: the entire agent identity investment flows to the input side. Output identity is an unclaimed market.
- **URL:** https://knowyouragent.network/every-company-building-ai-agent-identity-in-2026

### RSAC 2026 + NIST + CSA — Agent Identity Governance Convergence (Mar–Apr 2026)
- **What:** Three major regulatory/standards bodies converged on agent identity governance in early 2026. RSAC 2026: IBM, Auth0, Yubico partnership for cryptographic human verification in agent delegation chains. NIST: concept paper on AI agent identity and authorization (Feb 2026, comments closed Apr 2). CSA: survey showing only 23% of orgs have formal agent identity strategy, while 100% have agentic AI on roadmap. Coalition for Secure AI: published Agentic IAM spec defining identity representation, authentication, authorization, and governance.
- **Key quotes:** Nametag CEO at RSAC: "You need a human behind that agent who is accountable, and an audit trail that lets you go back and verify that human." IBM/Auth0/Yubico: "Cryptographically verified human approval for high-stakes actions."
- **Signal:** Regulatory and standards communities are converging on agent identity. The common message: agents need verifiable identity linked to human accountability. But the focus is entirely on input/access governance. The question of output attestation (proving what an agent produced) is not yet in the regulatory conversation.
- **ZenBin angle:** When NIST, RSAC, CSA, and major vendors all converge on agent identity governance and NONE of them address output attestation, that's both a gap and an opportunity. ZenBin is building the missing half of the agent identity story.
- **URLs:** https://identigate.com/blog/posts/2026-03-22-ai-agent-identity-human-verification/ | https://www.coalitionforsecureai.org/wp-content/uploads/2026/04/agentic-identity-and-access-control.pdf | https://openid.net/new-whitepaper-tackles-ai-agent-identity-challenges/