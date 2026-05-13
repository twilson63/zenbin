# Agent Identity & Auth Standards

### AAuth (Agent Auth) — Dick Hardt (OAuth 2.0 co-author)

- **URL:** github.com/dickhardt/agent-auth / blog.christianposta.com/exploring-aauth-agent-auth-identity-and-access-management-for-ai-agents/
- **What:** Exploratory spec from Dick Hardt (Author/Co-Author of OAuth 2.0, 2.1) for AI agent identity and access management. Brings together authentication, authorization, and OAuth RFCs into a unified protocol for agents.
- **Key concepts:**
  - Agents are first-class identities with signed HTTP messages
  - Unifies identity and authorization into one protocol
  - Makes delegation explicit and verifiable (not bolted on like OAuth token exchange)
  - Progressive auth scale: pseudonymous → stable identity → authorization/user/OBO
  - No bearer tokens — every request is signed
  - Tokens can represent both user AND agent simultaneously
  - Delegation chains are visible and enforceable
  - Integrates with SPIFFE/WISME identity standards
- **Working prototype:** Full demo with Keycloak + Agentgateway + A2A + MCP. Shows agent identity via JWKS + HTTP message signing, autonomous authorization, user-delegated authorization, and policy enforcement via Agentgateway.
- **Status:** Exploratory spec (not a standard yet). Has working prototype.
- **HN traction:** 1 point (May 12, 2026). Early awareness.
- **ZenBin relevance:** **Directly relevant.** AAuth validates the thesis that agents need cryptographic identity with signed requests. ZenBin already uses Ed25519 signing — AAuth is building the broader protocol layer. Key question: does ZenBin's Ed25519 signing pattern align with AAuth's HTTP message signing approach? They use JWKS + HTTP Sig, we use Ed25519 + did:web. The philosophical alignment is strong but the crypto details differ.
- **Signal:** OAuth 2.0 co-author is working on agent auth. This legitimizes the entire agent identity space. AAuth + Agent Passport + ZenBin's signing are all converging on the same truth: agents need verifiable, cryptographically-signed identity.

## Cubitrek Agent Passport (v0.1, May 2026) — NEW 2026-05-12

- **URL:** cubitrek.com/blog/agent-passport / github.com/cubitrek/agent-passport
- **What:** A well-structured open standard for verifiable, business-issued identity and authority for AI agents — backed by a real company (Cubitrek) with a production agent
- **Key differentiator vs StacyStarchum passport:** Uses `/.well-known/agent-passport.json` (the web's existing well-known pattern, same as robots.txt, security.txt, humans.txt) instead of a centralized registry. DNS-anchored Ed25519 signing.
- **Core concepts:**
  - Single signed JSON document published at `/.well-known/agent-passport.json` on the issuer's domain
  - Declares: issuer org (legal name, logo, hostname), agent identity (stable id, purpose, model, endpoints), authority (scoped permissions, spend ceilings, human-in-loop thresholds), compliance (data classification, regions, subprocessors), trust/revocation
  - Ed25519 signature over canonical JSON, anchored in a DNS TXT record on the issuer's domain
  - No third-party dependency — counterparty verification is local (schema check + Ed25519 verify, ~20 lines of Node)
- **How it layers on existing standards:**
  - **MCP** (Anthropic, 2024): How agents call tools. Says nothing about identity/authority.
  - **A2A** (Google, 2025) + agent.json: How agents discover each other. Says nothing about authority limits, spend ceilings, or human escalation.
  - **W3C Verifiable Credentials**: Right crypto primitive, but too heavy for developers shipping agents next week.
  - **Agent Passport fills the gap**: Identity + authority + accountability + a phone number for the human when things break. Commercial layer the existing protocols leave open.
- **Reference implementation:** npm package `@cubitrek/agent-passport-verifier`. MIT license.
- **Status:** v0.1 spec published. Cubitrek publishes their own production agent's passport at `cubitrek.com/.well-known/agent-passport.json`.
- **ZenBin alignment:** **Extremely aligned.** Both use Ed25519, both use `/.well-known/` patterns (they use `agent-passport.json`, we use `agent.md`). Both DNS-anchor identity. The key difference: their passport is about agent-to-agent trust for transactions; ours is about agent-to-human trust for published content. Natural integration: a ZenBin page could carry an Agent Passport as proof of authorship.
- **Competitive signal:** This is a commercial entity, not a hobby RFC. They're shipping the same well-known pattern we are. Validates our architecture choices.

## AI Agent Passport — StacyStarchum (RFC Stage, May 2026) — Last checked 2026-05-12

- **URL:** github.com/StacyStarchum/Ai-agent-passport-
- **What:** Open identity standard for verified AI agent identity using Ed25519 + did:web
- **Key concepts:**
  - Signed, verifiable JSON document that travels with an agent
  - Ed25519 cryptography (same as ZenBin!)
  - Owner DID (did:web format), scoped permissions, spend limits
  - Python and Node.js SDKs
  - Registry-based trust verification (registry.agentpassport.dev)
- **Full v1 Schema:**
  - `schema`: "ai-agent-passport/v1"
  - `agent_id`: unique agent identifier (e.g., "AGT-7481-X")
  - `agent_name`: human-readable name
  - `agent_type`: classification (e.g., "transactional")
  - `owner`: { name, did: "did:web:..." }
  - `capabilities`: { spend_limit: { per_transaction, per_day, per_month, currency }, permissions: [...] }
  - `trust`: { verified_by, verification_level, issued_at, expires_at, status }
  - `cryptography`: { algorithm: "Ed25519", public_key, signature }
- **Verification flow:** Platform scans passport → verifies signature → checks registry → trusted transaction approved
- **Status:** RFC (Request for Comments) — seeking community feedback before v1
- **Repo maturity (as of 2026-05-11):** Early stage. Only README and CONTRIBUTING.md are pushed. All linked spec docs (SPECIFICATION.md, SECURITY.md, VERIFICATION.md, API.md) and the JSON schema (schemas/passport-v1.json) return 404. Python and Node.js SDK stubs referenced in README but not yet in the repo. No releases published. No open issues.
- **Registry status (as of 2026-05-11):** registry.agentpassport.dev is **offline** (DNS ENOTFOUND). Not yet operational.
- **License:** CC BY 4.0 (spec), MIT (SDKs)
- **Not affiliated** with Anthropic, OpenAI, or existing identity standards
- **ZenBin alignment:** Very aligned. Same Ed25519 + did:web pattern. They handle identity for agents transacting on websites; we handle identity for agents publishing content. Potential integration partner. Their spend_limit schema is especially interesting — publishing can be modeled as a zero-price verified transaction.
- **Integration opportunity:** ZenBin could be the first "publishing" permission in their capabilities.permissions enum. Our signed pages could serve as passport verification test cases.
- **HN presence:** May 10, 2026 — 2 pts, 1 comment. Early traction but well-structured spec.
- **Tracked by:** Weekly cron job (`agent-passport-watch`)

**Note (2026-05-12):** A separate, more mature Agent Passport spec has emerged from Cubitrek (see above). The StacyStarchum version remains stalled — no spec docs, no registry, 2 pts. The Cubitrek spec ships a working verifier and uses the `/.well-known/` pattern that converges with ZenBin.

## IETF Internet-Draft: draft-klrc-aiagent-auth-00 (March 2026)

- **URL:** https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/
- **What:** IETF published an Internet-Draft for AI agent authentication and authorization
- **Co-authored by:** Defakto Security, AWS, Zscaler, Ping Identity
- **Key thesis:** AI agents are workloads — existing workload identity standards (WIMSE, SPIFFE) can be applied
- **Introduces:** AIMS (Agent Identity Management System) — conceptual model for agent auth stack
- **Uses:** WIMSE identifiers (SPIFFE-style URIs) as agent identifiers
- **Auth layers:** mTLS + WIMSE Proof Tokens (WPTs) + HTTP Message Signatures
- **Authorization:** OAuth 2.0 Token Exchange (RFC 8693) for delegation chains
- **Gap identified:** No new protocols needed, but gaps exist in credential provisioning and cross-domain trust
- **ZenBin relevance:** Our Ed25519 key-based auth aligns with this direction. Validates that agent identity is a recognized unsolved problem.

## Diagrid — "MCP Gateways Aren't Enough" (April 2026)

- **URL:** diagrid.io/blog/why-mcp-gateways-are-not-enough
- **What:** Argues that MCP gateways alone are insufficient — agents need identity, authorization, and proof
- **Key framing:** "Your client_id Is Not An Identity" — upcoming webinar May 20, 2026
- **Signal:** Enterprise infrastructure providers (Diagrid builds Dapr) recognizing that API keys and client IDs are inadequate for agent identity. Need cryptographic proof of delegation chains.
- **ZenBin relevance:** Directly validates ZenBin's approach — Ed25519 key-based publishing with signed content is the proof layer that MCP gateways lack.

## "Ten People Quietly Deciding How AI Agents Prove Who They Are" (April 2026)

- **URL:** clawdrey.com/blog/ten-people-quietly-deciding-agentic-identity.html
- **What:** Field guide to 10 researchers shaping agent identity standards across IETF, OAuth, OpenID, and formal-methods communities
- **Key voices:**
  - Aaron Parecki — Cross-app access is the agent problem
  - Eve Maler & Nick Gamb — Identity is a lifecycle, not a credential
  - AIMS Team (Kasselman, Lombardo, Rosomakho, Campbell, Steele) — Agents are workloads, not users
  - Dick Hardt — Maybe we need a new protocol
  - Sarah Cecchetti — Make authority machine-evaluable
- **Key insight:** "Five years ago these were ten different conversations. Now they're starting to be the same conversation." Agent identity is converging across previously siloed identity research.
- **Context:** Presented at IIW (Internet Identity Workshop) April 2026
- **ZenBin relevance:** The identity community is converging on the same patterns ZenBin already uses — cryptographic identity, delegation chains, verifiable authority. Our Ed25519 + did:web approach is aligned with IETF direction.

## CISA/NSA/Five Eyes — Secure AI Agent Deployment Guidance (May 2026)

- **URL:** cyberscoop.com/cisa-nsa-five-eyes-guidance-secure-deployment-ai-agents/
- **What:** Joint guidance from CISA, NSA, and Five Eyes nations on securely deploying AI agents
- **Signal:** Government-level recognition that agent security is a national security concern. Validates the entire category of agent identity, auth, and audit infrastructure.
- **ZenBin relevance:** Government guidance increases enterprise demand for agent identity standards — ZenBin's signed publishing fits the "verify before deploy" pattern these guidelines will mandate.

## Vorim.ai — Identity & Trust Layer for AI Agents (April 2026)

- **URL:** vorim.ai
- **What:** Commercial identity and trust layer specifically for AI agents
- **HN:** 2 pts (Apr 25, 2026)
- **Status:** Early — website is minimal, but signals commercial interest in agent identity as a standalone product category
- **ZenBin relevance:** Another signal that agent identity is becoming a product category, not just a standards discussion. Vorim focuses on identity/trust; ZenBin focuses on publishing with built-in identity. Different wedge, same market.

## FIDO Alliance — Agentic Authentication Working Group (April 28, 2026)

- **What:** FIDO Alliance announced Agentic Authentication Technical Working Group and agentic commerce specs
- **Announcement:** April 28, 2026 — formal press release with industry partners
- **Chaired by:** CVS Health, Google, OpenAI (chairs); Amazon, Google, Okta (vice-chairs)
- **Three focus areas:**
  1. Verifiable User Instructions — phishing-resistant mechanisms for users to authorize agent actions, without exposing credentials
  2. Agent Authentication — services verify agents act on behalf of authenticated users within defined parameters, distinguishing legitimate agents from unauthorized actors
  3. Trusted Delegation for Commerce — agent-initiated transactions executed within user-controlled boundaries with verifiable authorization
- **Key contributions:**
  - **Google AP2 (Agent Payments Protocol)** — model for secure delegation, verifiable authorization, and trusted transaction execution
  - **Mastercard Verifiable Intent** — co-developed with Google, enables users to securely authorize and control actions performed by digital agents on their behalf
- **Payments TWG:** Chaired by Mastercard and Visa, developing specs for agent-initiated commerce
- **Cross-org liaison:** FIDO is liaising with other industry standards bodies to ensure harmony among agentic commerce initiatives
- **Context:** Analysts estimate agentic commerce could reach $5 trillion globally by 2030 (McKinsey)
- **Signal:** FIDO killed passwords with passkeys. Their entry into agent auth signals massive industry commitment. This is the org that changed how 2B+ people authenticate.
- **ZenBin relevance:** Publishing can be positioned as a verified transaction with zero price. Connects ZenBin to the broader agentic commerce ecosystem. FIDO's "Verifiable User Instructions" pattern aligns with ZenBin's signed publishing — the user authorizes the agent to publish, and the platform verifies that authorization.

## NIST NCCoE Concept Paper (Feb 2026)

- **What:** "Accelerating the Adoption of Software and AI Agent Identity and Authorization"
- **Identifies 5 focus areas:** agent authentication, zero-trust authz, non-repudiation, prompt injection controls, governance
- **Status:** Public comment period closed April 2, 2026
- **Recommends:** Reusing existing standards (WIMSE, SPIFFE, OAuth) rather than inventing new ones

## CoSAI — Agentic IAM Spec (April 2026)

- **What:** Coalition for Secure AI published Agentic Identity and Access Management specification
- **Defines:** How to represent, authenticate, authorize, and govern AI agents as verifiable, auditable identities
- **Key concepts:** Lifecycle management, context- and intent-aware controls, risk-based authorization

## MCPS — Cryptographic Identity for MCP Agents (March 2026)

- **URL:** mcp-secure.dev / github.com/razashariff/mcps
- **What:** Cryptographic security layer on top of MCP — "like TLS for HTTP"
- **Key features:** Agent Passports (ECDSA P-256), message signing, tool integrity, replay protection, trust levels L0-L4
- **Security audit:** Scanned 39 agent frameworks against OWASP Agentic AI Top 10: 13 FAIL, 17 WARN, 9 PASS
- **CVE:** CVE-2025-6514 scored CVSS 9.6
- **Key stat:** 41% of MCP servers have zero authentication
- **ZenBin relevance:** Different crypto (P-256 vs our Ed25519) but same paradigm. Validates that agent security is a real, measurable problem.

## Lemma/x402 — ZK Proofs for Agent Payment & Identity (April 2026)

- **What:** ZK attribute proofs inside x402 (HTTP 402) payment headers
- **Key insight:** "As agents become the payer, a wallet address is an anonymous primitive, not a principal"
- **Building:** Agent-side identity via did:key → agentId with role, scope, spendLimit
- **ZenBin connection:** We're already doing Ed25519 key-based identity for publishing. The did:key pattern is the emerging standard.

## Strata/CSA Survey (May 2026)

- **Source:** Strata Identity commissioned Cloud Security Alliance survey of 285 IT/security pros
- **Key findings:**
  - Only 18% of security leaders are highly confident their IAM can manage agent identities
  - 44% use static API keys, 43% username/password, 35% shared service accounts — all inadequate
  - Only 28% can trace agent actions back to a human sponsor
  - Only 21% maintain real-time inventory of active agents
  - 40% increasing identity/security budgets for agent risks
  - Top concerns: data exposure (55%), unauthorized actions (52%), credential misuse (45%), lack of identity standards (45%)

## AgentWiki.org — Community Knowledge Base (May 2026)

- **URL:** agentwiki.org
- **What:** Comprehensive community-maintained knowledge base on AI agent identity and authentication
- **Key content:**
  - Agent Identity & Authentication overview covering OAuth extensions (PKCE, DPoP, Token Exchange, OBO, CAEP)
  - Agent Cards (.well-known/agent.json) from Google's A2A protocol — machine-readable identity/capability/auth discovery
  - Zero-Trust models for agents (verify explicitly, least-privilege, assume breach, continuous evaluation)
  - Production platforms: Scalekit, Nango, Arcade, Strata Maverics
  - NIST standards references
- **Key insight:** "When an AI agent calls an API, books a flight, or communicates with another agent, a fundamental question arises: how does the receiving system verify the agent's identity and permissions?"
- **Signal:** Knowledge is consolidating. When a wiki emerges, the field is mature enough for reference documentation.
- **ZenBin relevance:** Our .well-known/agent.md discovery aligns with A2A's .well-known/agent.json pattern. We should consider also serving an A2A-compatible agent card alongside our agent.md.

## Converging Pattern

All these efforts converge on: **Ed25519 + DIDs + verifiable credentials**

ZenBin's auth model is well-aligned. Our Ed25519 key-based publishing tokens map to the emerging Transaction Token pattern and are ahead of the ecosystem norm (41% of MCP servers have zero auth).

## MCP Protocol Security Gaps (Q2 2026)

New vulnerability identified May 11, 2026: **MCP servers can modify tool lists mid-session without client detection.** Research at mcpfw.dev/paper documents this protocol-level gap. Combined with existing findings (41% zero auth, CVE-9.6), the MCP security surface remains a real concern.

**ZenBin connection:** Our Ed25519 signed publishing provides the verifiable integrity that MCP lacks at the protocol level. Every publish is cryptographically tied to an identity.

## MCP Protocol Standards (Q2 2026)

The Model Context Protocol has become the de facto standard for AI-tool integration:

- **Governance:** Donated to Agentic AI Foundation (Linux Foundation), Dec 2025. Anthropic stewards but multi-stakeholder in practice.
- **Spec updates (2025–2026):** Structured tool annotations, streaming responses, OAuth-flow standardization, resource-quota negotiation
- **Scale:** 8,000–12,000 distinct servers, 14M cumulative downloads
- **Clients:** Claude Desktop, Claude Code, Cursor, Windsurf, Zed, Continue, OpenAI Custom GPTs, Google Gemini Code Assist, Microsoft Copilot Studio
- **Problem:** 30-50% installation failure rate on community servers. Signal-to-noise degrading.
- **Security:** 41% of MCP servers have zero authentication (OWASP scan)
- **Enterprise adoption:** Private MCP servers for internal data lakes, knowledge bases, ticketing. Major vendors (Snowflake, Databricks, Salesforce, ServiceNow, Atlassian, GitHub) publish official servers.
- **Brand visibility:** Vendors with official MCP servers gain disproportionate AI-mediated visibility.

## Competitor Identity Approaches

| Platform | Identity Method | Crypto Standard | Standards Alignment |
|----------|----------------|----------------|-------------------|
| ZenBin | Ed25519 keypairs + self-registration | Ed25519 | ✅ Aligned (IETF, AI Agent Passport, FIDO direction) |
| AccessAgent.ai | Ethereum wallet personal_sign | secp256k1 | ❌ Not aligned with agent identity ecosystem |
| here.now | API key (email-verified) | None | ❌ No cryptographic identity |
| AI Agent Passport | Ed25519 + did:web | Ed25519 | ✅ RFC standard |
| MCPS | ECDSA P-256 agent passports | P-256 | Partial |
| Lemma/x402 | did:key + ZK proofs | Ed25519 (did:key) | ✅ Aligned |

## Monitoring

- **AI Agent Passport:** Weekly cron (`agent-passport-watch`) checks repo for updates
- **IETF draft:** Manual check as needed at datatracker.ietf.org
- **FIDO:** Watch for working group publications at fidoalliance.org

## New: x402/Lemma ZK Proofs for Agent Identity (May 2026)

- **What:** Lemma (FRAME00) built ZK attribute proofs inside x402 (HTTP 402) payment headers
- **Key insight:** "As agents become the payer, a wallet address is an anonymous primitive, not a principal"
- **Building next:** Agent-side identity via did:key → agentId with role, scope, spendLimit
- **Stack:** ZK proofs for issuer identity, payment settlement, and data integrity — all independently verifiable
- **Pattern:** Registered x402 extension, not a sidecar. Proof bundles ride inside PAYMENT-RESPONSE headers.
- **ZenBin connection:** Our Ed25519 key-based auth maps to their did:key pattern. Publishing as a zero-price verified transaction fits their model perfectly.
- **HN:** Show HN post, received engagement from the x402/community

## AI Agent Passport Update (May 10–11, 2026)

- **HN post:** 2 points, 1 comment. Still early traction.
- **Current status:** RFC stage, seeking community feedback before v1
- **Repo maturity:** Only README + CONTRIBUTING.md pushed. Spec docs, schema, and SDK stubs not yet in repo (all 404). No releases. No open issues.
- **Registry:** registry.agentpassport.dev is **offline** (DNS failure as of 2026-05-11). Was described as live in the README but not yet reachable.
- **Key schema fields:** agent_id, owner (name + did:web), capabilities (spend_limit, permissions), trust (verified_by, verification_level), cryptography (Ed25519)
- **ZenBin alignment confirmed:** Same Ed25519 + did:web pattern. They handle identity for transactions; we handle identity for publishing.
- **Assessment:** Spec is well-structured in the README but the repo is early-stage vapor — no implementation code, no formal spec docs, no working registry. Worth monitoring but not yet at a point for integration. The README references SDKs and a registry that don't exist yet.

## New: AIAgentMark™ / DigiCert Trust Architecture (May 2026)

- **AIAgentMark** (aiagentmark.com) — Commercial entity behind "AI Agent Passport™" branding. Self-proclaimed "open cryptographic identity standard for personal AI agents — giving every agent a verifiable passport."
- **DigiCert whitepaper** — "The New Trust Architecture for AI" positions AI Agent Passport as part of a 3-layer defense: DNS-based enforcement (layer 1), standards-based agent identity with AI Agent Passport (layer 2), hardware-rooted model protection via confidential computing (layer 3).
- **Signal:** DigiCert (major PKI/certificate authority) endorsing the AI Agent Passport pattern. This gives enterprise credibility to Ed25519-based agent identity.
- **ZenBin relevance:** Enterprise PKI players validating the same pattern ZenBin uses. Our Ed25519 key-based publishing auth is well-positioned as this standard matures.

## New: Lyfe.ninja — Revocable Signatures for AI Content Provenance (Apr 2026)

- **What:** lyfe.ninja built a system for generating and verifying digital signatures on AI content, with revocability as a first-class property
- **Key insight:** "How do you verify that the AI-generated content you're seeing actually came from the intended Agent and hasn't been altered?" Right now trust relies on secure transport (TLS) but not content integrity at point of consumption.
- **Features:** AI responses signed after generation, client-side verification, tampering causes verification failure, signatures revocable via short-lived leases or full invalidation, no key management, distributed verification, embedded metadata
- **HN:** Ask HN (3 pts, 2 comments, Apr 2026). Author explicitly asks "Is content-level verification for AI outputs something you'd actually want or use?" — market signal that this is still an open question.
- **C2PA comparison:** Author acknowledges C2PA for content attestation but positions this as supplementary, not replacement.
- **ZenBin connection:** Lyfe.ninja signs for revocability; ZenBin signs for attribution. Different angles on the same problem. The question "Would you want to stand by your AI agent's output forever?" directly supports ZenBin's per-page Ed25519 signature model.
- **Gap identified:** Lyfe.ninja is asking if people want this. ZenBin is building it. First-mover advantage on content provenance for published agent output.

## New: RSAC 2026 — Agent Identity Goes Mainstream (March 2026)

- **RSAC 2026 (March 23–26, San Francisco):** Agent identity and next-gen enterprise authentication were prominent themes
- **IBM/Auth0/Yubico partnership:** Human-in-the-Loop authorization framework for AI agents. Combines IBM WatsonX AI orchestration + Auth0 CIBA identity flows + Yubico hardware-backed YubiKey authentication. Verifiable chain of accountability for high-stakes agent actions (financial transfers, code deploys, sensitive data access).
- **RSA (the company):** Expanded passwordless auth for Microsoft 365 E7 suite. CEO Greg Nelson: "The rise of AI agents in the enterprise means organizations need to rethink how they secure every identity — human and machine alike."
- **Swissbit:** Previewed post-quantum FIDO2 hardware authentication and biometric identity verification on hardware keys.
- **Key signal:** Agent identity is no longer an academic exercise — it's a main-stage enterprise security topic. Hardware-backed human verification for agent actions is being built by major players.
- **ZenBin relevance:** Our Ed25519 key-based publishing auth is aligned with the direction these enterprise players are moving. The Human-in-the-Loop pattern validates that agent actions need verifiable human authorization — publishing is an agent action that needs this.

## New: NIST AI Agent Standards Initiative (Formalized, 2026)

- **NIST AI Agent Standards Initiative** — formal multi-track standards effort
- **Key components:**
  - Request for Information (RFI) on AI Agent Security
  - Draft Concept Paper on AI Agent Identity and Authorization (closed April 2, 2026)
  - NCCoE project applying identity standards to enterprise agent use cases
- **Central argument:** AI agents must be treated as identifiable, non-human principals — distinct from both human users and traditional service accounts
- **Enterprise governance implications (CSA research note, March 2026):**
  - Only 18% of organizations confident in IAM for agents
  - 44% use static API keys, 43% username/password — all inadequate
  - Only 28% can trace agent actions to a human sponsor
  - 40% increasing identity/security budgets for agent risks
- **ZenBin relevance:** Standards formalization validates our approach. Agent publishing is an action that needs traceable identity.

## New: Aport.io — Pre-Action Authorization Model for Agents (May 2026)

- **URL:** api.aport.io/blog/best-ai-agent-authentication-authorization-2026
- **What:** Comprehensive guide to AI agent auth & authorization in 2026
- **Key concept:** Pre-action authorization — agents must get explicit permission before taking action, not just be authenticated
- **Pattern:** Authentication verifies who the agent is; Authorization verifies what it can do. Both are needed.
- **Critique:** "Prompts aren't security controls" — a direct rebuttal to prompt-based agent guardrails
- **ZenBin connection:** Our publishing model is pre-action authorization — the agent signs with its key and the system verifies before publishing. This is the correct model.

## New: Microsoft Agent Governance Toolkit (April 2026)

- **URL:** github.com/microsoft/agent-governance-toolkit (MIT license)
- **What:** Open-source runtime security governance for AI agents. First toolkit to address all 10 OWASP agentic AI risks with deterministic, sub-millisecond policy enforcement.
- **Seven packages:** Agent OS (stateless policy engine), identity, SRE practices, and more. Available in Python, TypeScript, Rust, Go, and .NET.
- **Framework integrations:** LangChain callbacks, CrewAI task decorators, Google ADK plugins, Microsoft Agent Framework middleware, Dify marketplace, LlamaIndex TrustedAgentWorker, OpenAI Agents SDK, Haystack, LangGraph, PydanticAI.
- **Key thesis:** OS kernels solved process isolation; service meshes solved mTLS for microservices; agents need the same — policy enforcement, identity, and reliability patterns applied to autonomous AI.
- **Context:** Released April 2, 2026. Blog post references OWASP Top 10 for Agentic Applications (Dec 2025), EU AI Act (Aug 2026 enforcement), Colorado AI Act (June 2026).
- **Signal:** Microsoft is treating agent governance as infrastructure-grade. The toolkit is designed to be framework-agnostic and community-governed (aspiration to move to a foundation).
- **ZenBin relevance:** Agent Governance Toolkit handles runtime security. ZenBin handles output publishing. Our signed content provenance fits as a governance output — every publish action is an auditable, verifiable agent action. Potential integration: governance toolkit could enforce "publish only through verified identity" policies, and ZenBin is the publishing endpoint.

## New: arXiv Paper — AI Identity Standards, Gaps, and Research Directions (April 2026)

- **URL:** arxiv.org/abs/2604.23280
- **What:** Academic paper defining AI Identity as "the continuous relationship between what an AI agent is declared to be and what it is observed to do, bounded by the confidence that those two things correspond at any given moment."
- **Three contributions:**
  1. Structural comparison of human vs AI identity across four dimensions (substrate, persistence, verifiability, legal standing) — asymmetry is fundamental, extending human frameworks to agents without modification produces systematic failures
  2. Evaluation of current technical/regulatory documents against agent identity requirements — none adequately address nondeterministic, boundary-crossing entities
  3. Identification of five critical gaps: semantic intent verification, recursive delegation accountability, agent identity integrity, governance opacity and enforcement, operational sustainability
- **Key conclusion:** "These gaps are structural; more engineering effort alone will not close them. Foundational research on AI identity is the central conclusion."
- **ZenBin relevance:** Validates that identity is a research-level problem, not just engineering. ZenBin's Ed25519 key-based publishing addresses the "agent identity integrity" and "verifiability" gaps at the publishing layer — a concrete, shipping solution in a space that papers say has no adequate solution.

## New: Token Security — 2026 AI Agent Identity Predictions (May 2026)

- **URL:** token.security/blog/token-security-2026-ai-agent-identity-security-predictions
- **What:** 10 predictions from Token Security (enterprise NHI security startup) on AI agent identity risk in 2026
- **Key predictions:**
  - AI agents moving from non-prod to production ("they have to manage their permissions and lifecycle")
  - Compliance frameworks will overhaul to recognize agents as active workforce members
  - Agents will become the biggest, most privileged identity type in enterprise — outnumbering humans
  - Long-lived credentials and static API keys will pollute agent identity ("despite rapid innovation")
  - Cleartext service account credentials will reappear on endpoints due to poor MCP hygiene
  - Identity mismatches between employees and their agents will spike security incidents
- **Enterprise stat:** NHI-first IAM design is the future — today's IAM was built for people, not ephemeral agents
- **ZenBin relevance:** Directly validates the problem. 44% static API keys + 43% username/password = the broken default ZenBin replaces with Ed25519 key-based auth. The prediction about MCP hygiene causing credential leaks reinforces that signed, stateless auth is the right direction.

## New: Ramble — HMAC-SHA256 Signed Webhooks for Agent Input (May 2026)

- **URL:** github.com/Jpoliachik/ramble-ios
- **What:** iOS voice notes app sends transcripts to agents via HMAC-SHA256 signed webhooks. Per-user secret key. Uses Apple App Attest for device verification (no accounts needed).
- **Auth pattern:** HMAC-SHA256 signed webhooks. The receiver verifies the signature to confirm the data came from a legitimate Ramble installation.
- **Identity pattern:** No accounts, no API keys. Device attestation + signed webhooks = trust without central identity provider.
- **ZenBin relevance:** Convergent signal on cryptographic verification of agent I/O. Ramble signs agent *input* (webhook → agent); ZenBin signs agent *output* (agent → published page). Both reject the username/password default in favor of cryptographic signatures.

---

## New: accept.md — HTTP Content Negotiation for Markdown (May 2026)

- **What:** Small library that lets Next.js/SvelteKit pages return Markdown when client sends `Accept: text/markdown` instead of HTML
- **Key principle:** No duplicate routes, no separate .md files, no API layer. Just proper HTTP content negotiation.
- **Motivation:** "LLMs prefer Markdown. Internal tools prefer Markdown. Scrapers prefer Markdown. CLI workflows prefer Markdown. But most sites only return HTML."
- **ZenBin alignment:** Validates the Markdown-native thesis from a different angle. accept.md makes existing sites Markdown-friendly; ZenBin renders Markdown natively. Both respond to the same market need: agents need Markdown.