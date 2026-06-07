# AI Agent Identity Landscape

Last updated: 2026-06-07 12:14 UTC

## AstraCipher — Post-Quantum Agent Identity SDK (June 2026)

- **What:** Open-source SDK (BSL 1.1 → Apache 2.0) giving every AI agent a W3C DID with post-quantum cryptographic keys (ML-DSA-65 + ECDSA P-256 hybrid signing, ML-KEM-768 key encapsulation).
- **Identity model:** Verifiable Credentials for capability boundaries and permissions. Trust chains with depth limits (Creator → Authorizer → Agent → Sub-agent).
- **Stats:** Claims 3M active AI agents in US/UK with 1.5M running without oversight. 88% of orgs report AI agent security incidents. 44% still use static API keys for agent auth. Only 22% treat agents as identity-bearing entities.
- **Integrations:** MCP Server adapter, Google A2A adapter, Python SDK, CLI. Compliance engine covers 10+ regulatory frameworks (EU AI Act, SOC 2, HIPAA, GDPR, ISO 42001, etc.).
- **Key insight:** "MCP has 97M monthly SDK downloads but no built-in agent identity. A2A connects agents but trusts you to handle auth. AstraCipher is that missing layer."
- **ZenBin angle:** AstraCipher provides WHO an agent is (identity layer). ZenBin provides WHAT an agent published (output provenance layer). Same crypto primitives (Ed25519/DID), different scope. AstraCipher validates ZenBin's signing model direction.
- **URL:** https://astracipher.com/ | GitHub: https://github.com/san-techie21/astracipher

## Agentic Provenance Protocol (APP) — "Certificate Authority for AI Agents" (2026)

- **What:** Protocol positioning as CA-like infrastructure for agent identity, ownership, provenance, and revocation. Provides cryptographic identity, verified ownership, immutable provenance records, and revocation infrastructure for enterprise agent deployments.
- **Scope:** Runtime provenance — verifying that an AI action was performed by a specific agent. NOT content/output provenance.
- **ZenBin angle:** APP certifies the EXECUTION origin of actions. ZenBin certifies the PUBLISHING origin of content. Complementary — APP says "this agent ran this task," ZenBin says "this agent produced this content."
- **URL:** https://agenticprovenanceprotocol.com/

## Presenc.ai — Agent Reputation and Identity Landscape Research (May 2026)

- **What:** Research report tracking protocol-level identity and reputation infrastructure for agents.
- **Key findings:**
  - W3C Verifiable Credentials won the agent identity standards war. VCs adopted by AAIF, Google AP2, Anthropic, Visa.
  - Cross-platform reputation portability does NOT exist yet. Salesforce reputation doesn't transfer to Microsoft; Anthropic history doesn't transfer to OpenAI.
  - Reputation depreciates faster than identity. Designed to recover from single bad events but compound on systematic patterns (credit-score dynamics).
  - Cloudflare evolving from bot-identity to agent-identity (Verified Bot → Verified Agent).
  - On-chain agent IDs (x402-adjacent) growing for crypto-native flows.
  - OAuth-for-Agents is the missing piece — IETF working groups drafting but no shipping standard yet.
- **Identity primitives tracked:** W3C VC Data Model, W3C DID Core, AP2 Mandate Signing (60+ partners), Cloudflare Verified Bot Token, on-chain agent IDs (x402), OAuth-for-Agents extensions.
- **Reputation systems tracked:** Salesforce Trust Score, Microsoft Agent Trust Rating, AAIF Agent Reputation Network, Cloudflare Bot Score, Anthropic Agent Trust History, Visa Agent Behaviour Score.
- **ZenBin angle:** Identity standards are converging (VCs + DIDs). Reputation is siloed per-platform. NEITHER addresses output/content provenance. ZenBin's signed output creates portable, verifiable reputation signals — anyone can verify what an agent published without platform lock-in.
- **URL:** https://presenc.ai/research/agent-reputation-and-identity-2026

## Circe — Deterministic, Offline-Verifiable Receipts for AI Agent Actions (Jan 2026, re-surfed June 2026)

- **What:** Cryptographically signed receipt system for agent actions. Each agent run emits a receipt recording what the agent decided, what it did, and what changed — as a single canonical JSON artifact.
- **Signing:** Ed25519 signatures over canonical JSON (RFC 8785-style). SHA-256 hash for tamper evidence. Offline verification — no network calls, no dependencies on the issuer.
- **Positioning:** Not a logging system, observability platform, or policy engine. An integrity/provenance primitive intended to compose with higher-level agent frameworks.
- **ZenBin angle:** Circe validates that Ed25519 + canonical signing is the emerging standard for agent provenance. Circe signs agent *actions* (runtime provenance). ZenBin signs agent *content* (output provenance). Same cryptographic primitive, different scope. Circe doesn't handle publishing or content delivery — that's ZenBin's layer.
- **URL:** https://github.com/wv26296-ux/circe-receipts | HN: https://news.ycombinator.com/item?id=46687551

## Five Eyes Agentic AI Security Guidance (May 2026)

- **What:** CISA, NSA, and counterparts in AU/CA/NZ/UK published coordinated guidance requiring cryptographic agent identity. "Construct each agent as a distinct principal with a cryptographically anchored identity."
- **Five risk categories:** privilege, design/config flaws, behavioral, structural, accountability.
- **Key message:** Agentic AI doesn't need new security frameworks — fold into zero trust, defense-in-depth, least privilege. But agents MUST have distinct cryptographic identities.
- **Signal:** Strongest regulatory signal yet. Six allied cyber agencies treating cryptographic agent identity as a foundational security requirement, not a best practice.
- **ZenBin angle:** ZenBin's Ed25519 signing provides exactly the kind of cryptographic identity anchoring required — but for content output, not just runtime identity.
- **URL:** https://www.cisa.gov/news-events/news/careful-adoption-agentic-ai-services

## Google Agent Identity — Gemini Enterprise Agent Platform (April 2026)

- **What:** Google Cloud Next '26 introduced Agent Identity as a core component of the Gemini Enterprise Agent Platform. Every agent gets a unique cryptographic ID with defined authorization policies that are traceable and auditable. Paired with Agent Registry and Agent Gateway.
- **Signal:** Google is making cryptographic agent identity a first-class platform feature for enterprise agents.
- **ZenBin angle:** Google handles runtime auth/authorization (WHO the agent is). ZenBin handles output provenance (WHAT the agent produced). Complementary layers.

## Lyrie.ai — Agent Trust Protocol (ATP) (May 2026)

- **What:** Open cryptographic standard for AI agent identity verification. Five primitives: identity, scope, attestation, delegation, revocation.
- **License:** MIT-licensed reference implementation. IETF submission pending.
- **Signal:** Another open protocol standardizing agent identity. Focus on trust/verification layer.
- **URL:** https://www.shashi.co/2026/05/the-agent-trust-problem-has-proposal.html

## CSA — "AI Agent Identity Is Being Solved Backwards" (May 2026)

- **What:** Cloud Security Alliance published assessment that traditional IAM fails for non-deterministic agents. Two bad options: over-privileged broad credentials or accumulated entitlement tracking (cleanup, not prevention).
- **Right answer:** Ephemeral credential brokers — credentials issued at execution, scoped to task, expire on completion. SPIFFE/SPIRE SVIDs and OIDC-federated tokens as the path forward.
- **Signal:** Validates ephemeral, scoped credentials for agents. The "solved backwards" framing is exactly right — identity-first, not access-control-first.
- **URL:** https://cloudsecurityalliance.org/blog/2026/05/08/ai-agent-identity-is-being-solved-backwards-and-the-window-to-fix-it-is-now

## Authentic Marketing / AI-ID.org — Cryptographic Provenance for Agent Output (March 2026)

- **What:** Five-phase provenance stack: Ed25519 signing → PKI + timestamps → Agent Identity (did:key + W3C VC) → Agent Commerce (A2A + L402) → Arweave archival.
- **Standards used:** RFC 8032 (Ed25519), FIPS 180-4 (SHA-256), RFC 5280 (X.509/CRL), RFC 3161 (TSP), W3C DID Core + did:key, W3C VC 2.0, in-toto/SLSA v1.0, RFC 7515 (JWS), FIPS 204 (ML-DSA-65 post-quantum).
- **Agent identity:** HKDF-SHA256 derivation from single master seed, did:key for identity, W3C VC 2.0 with dual proofs (Ed25519 + ML-DSA-65).
- **16 open standards, zero proprietary protocols.** Addresses NIST NCCoE (Feb 2026) and EU AI Act (Aug 2026 enforcement).
- **ZenBin comparison:** Uses Ed25519 + SLSA for content provenance (same primitives as CAP). Key differences: they use did:key + W3C VC + blockchain archival; ZenBin uses Ed25519 + canonical string signing + recipient-directed publishing. They're enterprise/compliance-heavy; ZenBin is web-native and lightweight.
- **Signal:** The closest direct adjacent effort to ZenBin's CAP. Validates the market need for content provenance.
- **URL:** https://ai-id.org/wp-content/uploads/2026/03/authentic-signing-deck-0320-v2.html

## IETF Agent Identity Protocol (AIP) Draft (March 2026)

- **What:** IETF draft formalizing Identity-Bound Capability Tokens (IBCTs) — fusing identity, attenuated authorization, and provenance into a single append-only chain.
- **Two wire formats:** Compact mode (JWT with Ed25519) for single-hop; chained mode (Biscuit with Datalog policies) for multi-hop delegation.
- **Signal:** IETF formalizing agent identity delegation chains. Ed25519 is the standard signing algorithm. Validates ZenBin's choice of Ed25519.
- **Referenced by:** Codex CLI v0.121 release notes.

## Codex CLI v0.121 — Agent Identity Feature Flag (June 2026)

- **What:** OpenAI/Codex introduces `use_agent_identity` feature flag for cryptographic attribution in multi-agent workflows. Each agent gets a verifiable identity assertion attached to API calls and tool invocations.
- **Implementation:** Likely Biscuit-style tokens (offline attenuation, append-only chains, Ed25519 signatures).
- **Integration:** OpenTelemetry for per-agent cost attribution, audit trails, scope violation detection.
- **Signal:** OpenAI is actively building cryptographic agent identity into their developer tooling. Normalizes the pattern for every developer using OpenAI.
- **URL:** https://codex.danielvaughan.com/2026/04/15/agent-identity-stack-cryptographic-attribution-multi-agent-audit-trails/

## Cordium — Identity-Based Infrastructure Access (May 2026)

- **What:** FOSS sandbox platform (Kubernetes + Octelium) that eliminates credential injection. Agents access infrastructure via identity-aware proxy, not embedded secrets.
- **Access model:** Identity + policy-as-code replaces API keys, SSH keys, database passwords in sandboxes. Octelium proxy holds credentials outside the sandbox.
- **Signal:** The credential-to-identity shift is now implemented at the infrastructure level (not just protocol proposals). This validates the Ed25519 key-pair identity pattern that ZenBin uses for content signing.
- **Parallel:** Cordium does for infrastructure access what ZenBin does for content publishing — both replace secrets/credentials with cryptographic identity.
- **URL:** https://github.com/octelium/cordium

## MCP Trust Gap (June 2026)

- **What:** Growing concern that MCP server configs can execute arbitrary code. No signing, verification, or sandboxing by default. Users install MCP servers without reviewing permissions.
- **Trust model:** "Install and pray" — any MCP server can request filesystem, network, or command execution access.
- **Signal:** MCP's trust model is incomplete for production agents. Input direction (MCP) lacks verification; output direction (publishing) lacks attribution. Both need cryptographic verification.
- **URL:** https://medium.com/open-ai/before-you-add-an-mcp-server-to-your-ide-read-the-config-like-it-can-execute-code-4334dc3e80b9

## The Big Picture

Agent identity is the hottest emerging topic in 2026. The industry has recognized that agents can't stay anonymous service accounts forever — they need first-class identity, delegation chains, and cryptographic proof.

Identity-based, secretless access is now a recognized design principle (Cordium eliminates credential injection, Jin uses RS256 JWT passports with cached JWKS, AAuth and MCPS formalize agent identity). The pattern ZenBin uses — Ed25519 signing of canonical strings — is now part of a broader movement toward cryptographic agent identity without bearer tokens.

Three new identity protocols this week (Ratify, AAuth, Facet/KYAPay) plus the Keycard 4-layer security framework confirm this is becoming a funded category. CrowdStrike acquired SGNL for $740M and Palo Alto acquired CyberArk for $25B — both citing agentic identity as a driver.

New this cycle: Jin Protocol (RS256 JWT passports + Jin Shield for web-agent identity verification) adds a web-scale agent identity layer using .well-known discovery + asymmetric crypto. Nori Skillsets provides agent config registries with private sharing. AI Capability Registry treats agent capabilities as versioned infrastructure with trust tiers.

New this cycle: Vouch Protocol (Ed25519 + did:web + JWT-VC, submitted to C2PA) aligns closely with ZenBin's approach but on the identity/input side. MCPS (MCP Secure) adds cryptographic identity and message signing directly to MCP — like TLS for the agent transport layer. Both reinforce the pattern: cryptographic identity for agents is becoming table stakes, but output-side provenance remains unaddressed.

New this cycle: Deckard (per-agent identity + ACL for Apple services via MCP) shows the personal multi-agent identity model maturing. When you run 4+ agents across different machines, per-agent auth is essential, not optional.

New this cycle: Zylos.ai published a detailed design pattern for signed action envelopes and agent provenance — combining workload identity (SPIFFE), delegated authorization (signed task grants), W3C PROV provenance, and hash-chained tamper-evident journals. This is the most complete input-side audit trail design for agent runtimes. Still no output-side provenance.

New this cycle: GitHub commit verification logic flaw exposed — the "Verified" badge verifies the committer's key but displays next to the author's name. AI agents can set any author/committer via environment variables. This is the real-world failure mode that cryptographic output provenance (ZenBin/CAP) solves.

New this cycle: Provenance Protocol (provenanceprotocol.org) proposes itself as the "WHOIS for AI agents" — a universal framework for verifying agent identity, origin, lineage, and accountability. Non-crypto, institution-ready. v1.0 spec not yet released.

New this cycle: Presenc.ai published the most comprehensive survey of agent identity/reputation infrastructure in May 2026. Key finding: W3C Verifiable Credentials won the identity standards war. Cross-platform reputation portability does NOT yet exist. OAuth-for-Agents is the missing piece. AP2 Mandate Signing has 60+ partners.

New this cycle: Bob Renze published practical 3-layer agent identity (Static/Runtime/Stateful) with provenance chains for production agents. Ad-hoc but directionally aligned with ZenBin's CAP signing.

New this cycle: Authentic Marketing / AI-ID.org is building "cryptographic provenance for AI agent output" with artifact signing + blockchain archival. Directly adjacent to ZenBin. References NIST NCCoE (Feb 2026) and EU AI Act traceability requirements (Aug 2026 enforcement).

New this cycle: Microsoft Agent Governance Toolkit — MIT-licensed runtime security for AI agents. Addresses all 10 OWASP agentic AI risks with sub-millisecond policy enforcement. Framework integrations: LangChain, CrewAI, LlamaIndex, OpenAI Agents SDK, etc.

New this cycle: GitHub commit verification logic flaw exposed — the "Verified" badge verifies the committer's key but displays next to the author's name. AI agents can set any author/committer via environment variables. This is the real-world failure mode that cryptographic output provenance (ZenBin/CAP) solves.

### Jin Protocol — Agent Intent Layer + RS256 JWT Identity & Shield (Show HN, June 4, 2026)
- **What:** Open standard + tooling for making websites/APIs legible to AI agents. Two components: Agent Intent Protocol (AIP) — a .well-known/jin.json manifest mapping endpoints to natural language triggers, and Jin Shield — a security gateway that validates RS256 JWT "passports" issued by the Jin registry.
- **Identity model:** Agents register at meetjin.com, receive a cryptographic RS256 JWT passport. Jin Shield validates passports locally using cached JWKS public keys (zero network hops on verification). Unauthorized scrapers get 403 Forbidden.
- **Trust anchor:** The Jin registry (meetjin.com) is the centralized identity provider — unlike Vouch's decentralized did:web model or Proveyouragent's DNS-as-trust-anchor approach.
- **Scope:** Web→agent interaction layer ("can this agent access my API?"). Not agent→agent or agent→output.
- **Signal:** Agent identity is spreading to the web-access layer. Websites want to verify agents before granting access, not just block bots. This is the agent equivalent of API key verification, but with cryptographic identity instead of static tokens.
- **ZenBin overlap/contrast:** Jin authenticates the agent requesting access (input-side identity). ZenBin signs the agent's published output (output-side provenance). Jin asks "is this agent authorized to access my API?" ZenBin asks "did this agent actually produce this content?" Same crypto primitives (asymmetric keys, signed tokens), different problem.
- **URL:** https://github.com/meetjin/jin | HN: https://news.ycombinator.com/item?id=48397992

### GitHub Commit Verification Flaw — Author ≠ Committer Identity Gap (Ask HN, May 26, 2026)
- **What:** GitHub's "Verified" badge sits next to the author's name and avatar, but it verifies the committer's GPG/SSH key. Author and committer can be completely different people, and the author field is freely settable via environment variables. The "Partially verified" badge only appears if the impersonated user has enabled vigilant mode — which most haven't, including Linus Torvalds.
- **Impact:** With AI agents now generating commits, this identity gap is actively exploitable. An agent (or attacker) can set author=anyone, sign with their own key, and get a green "Verified" badge next to the impersonated identity.
- **Signal:** Identity attribution in provenance systems is brittle even in the most widely-used platform. The gap between "who is shown" and "who is verified" is exactly the kind of problem that output-side provenance must solve correctly.
- **ZenBin angle:** ZenBin's CAP signing ties the key to the content and the author, not just the submission. The signature proves who produced the artifact, not just who submitted it. This is the output-side fix for the same problem GitHub has on the commit side.
- **URL:** https://news.ycombinator.com/item?id=48274410

### Darwin Agentic Cloud — Ed25519-Signed Compute Attestations (Ask HN, May 27, 2026)
- **What:** Darwin Agentic Cloud (featured in "Bill Gates AI on AI" memo) sits between agents and compute infrastructure. When an agent says "run this code," Darwin routes to AWS Lambda, Modal, Akash, or local Docker, executes in a sandboxed environment with cost caps, and produces an Ed25519-signed attestation binding workload, output, sandbox, cost, and signer into a tamper-evident receipt. Receipts are independently verifiable forever, no Darwin dependency needed.
- **Signal:** Attestation infrastructure for agent compute is emerging as a category. The memo explicitly calls out "verifiable trust" as crucial and notes that API keys and signed JWTs are insufficient for agentic compute.
- **ZenBin overlap/contrast:** Darwin attests to compute execution (what ran, where, how much it cost). ZenBin attests to published output (who produced this content, when, with what key). Same Ed25519 primitive, different problem: Darwin is compute attestation, ZenBin is content attestation.
- **URL:** https://news.ycombinator.com/item?id=48289469

The gap: **All identity protocols prove WHO the agent is and WHO authorized it. None prove WHAT the agent produced.** ZenBin's output attestation layer is unaddressed.

### KnowYourAgent.network — Comprehensive Agent Identity Landscape (Jan 2026)
- **What:** Survey of every company building AI agent identity infrastructure in 2026. Organized into three camps: payment networks (transaction verification), enterprise security (IAM extension), and crypto-native (decentralized identity).
- **Key players mapped:**
  - **Visa Trusted Agent Protocol (TAP):** Live since Oct 2025 with Cloudflare. 100+ partners (Stripe, Adyen, Microsoft, Shopify). Uses RFC 9421 HTTP Message Signatures. Centralized — agents onboarded through Visa's "Intelligent Commerce" vetting.
  - **Mastercard Agent Pay:** Announced Apr 2025. Pilot stage, less detail than Visa. Also centralized.
  - **Trulioo + Worldpay — Digital Agent Passport:** 5-layer verification (developer provenance, user binding, permission scopes, behavior telemetry, risk scoring). Framework stage, no public KYA API yet. But Worldpay processes $2.5T/year — if required for transactions, instantly the largest agent identity system by volume.
  - **Vouched AgentShield + KnowThat.ai:** AgentShield detects AI agents (<5ms). KnowThat.ai is a public agent reputation directory (Yelp for AI agents). Published MCP-I spec (identity extension to MCP). $22M raised.
  - **Billions Network:** W3C DIDs + ZK proofs. "DeepTrust" framework with 4 identity layers. AI agent features are roadmap Phase 2. $30M raised, ~$200M pre-market valuation. Human identity verification is live; AI identity is not.
  - **ERC-8004:** Ethereum standard for AI agent identity. Launched Jan 2026. Testnets only, mainnet expected Q2 2026. Uses regular NFTs for identity (transferable — can sell your agent's identity on OpenSea). Some projects adding soulbound layers (ERC-5192) to prevent this.
  - **AstraSync AI:** Know Your Agent platform with REST APIs and SDKs. Live APIs, working code. No announced funding. "Web2 simplicity, Web3 security." Proprietary identifiers, not W3C DIDs.
- **Key insight from landscape:** The three camps aren't competing yet — they're solving different problems for different customers. Payment identity, enterprise IAM, and decentralized identity are parallel tracks.
- **Gap:** No one addresses output/content provenance. Every identity protocol proves who the agent is and who authorized it. None prove what the agent produced.
- **URL:** https://knowyouragent.network/every-company-building-ai-agent-identity-in-2026

### Authentic Marketing / ai-id.org — Cryptographic Provenance Stack for Agent Output (Mar 2026)
- **What:** Technical briefing proposing a 5-phase provenance stack for multi-agent AI orchestration. Ed25519 signing per artifact, PKI with CRL revocation, RFC 3161 + Bitcoin timestamps, did:key agent identity, DSSE/SLSA provenance attestations, Arweave permanent archival with post-quantum (ML-DSA-65) signatures.
- **5 phases:**
  1. **Artifact Signing (Who created it?):** Ed25519 signatures on every output
  2. **PKI + Timestamps (Authorized? When?):** Two-tier CA, RFC 3161 instant + Bitcoin permanent timestamps
  3. **Agent Identity (What process?):** W3C VC + did:key per agent, HKDF-derived key hierarchy (1 seed → 33 agent keys)
  4. **Agent Commerce (Can I transact?):** A2A Agent Cards (v0.3.0) with JWS signatures, L402 payment tokens
  5. **Permanent Archival (Where is the record?):** Arweave permaweb with ML-DSA-65 post-quantum signatures
- **Standards used:** RFC 8032 (Ed25519), W3C DID Core, W3C VC 2.0, in-toto/SLSA, RFC 7515 (JWS), FIPS 204 (ML-DSA-65)
- **NIST alignment:** Maps to NIST SP 800-53 AU-10 (non-repudiation), NIST CSF 2.0 PR.DS-01 (data integrity), NIST NCCoE AI Agent Identity concept paper (Feb 2026), EU AI Act Articles 11/12 (traceability, Aug 2026 enforcement)
- **Key quote:** "A notary, chain of custody, and permanent archive in one automated layer."
- **Signal:** This is the closest external spec to what ZenBin does. Phase 1 (artifact signing) and Phase 3 (agent identity via did:key + W3C VC) directly overlap with ZenBin's CAP signing model. The difference: this is a slide deck/proposal, not a deployed system. ZenBin is running.
- **ZenBin overlap/contrast:** Same Ed25519 signing primitive. Same did:key identity model. Same W3C VC credential structure. This proposal adds PKI hierarchy, CRL revocation, blockchain archival, and post-quantum signatures — all things ZenBin could layer on. The core signing model is aligned.
- **URL:** https://ai-id.org/wp-content/uploads/2026/03/authentic-signing-deck-0320-v2.html

### Proveyouragent (June 2026) — Ed25519 + DPoP for Agent Identity
- **What:** Open-source Python library (by lujainkhalil) giving each agent an Ed25519 keypair, a signed software statement (identity document), and DPoP request signing
- **Built on:** Ed25519, OAuth 2.0 Dynamic Client Registration (RFC 7591), DPoP (RFC 9449), HTTP Message Signatures (RFC 9421)
- **Key features:**
  - Each agent gets an Ed25519 keypair; private key never leaves the agent
  - Software statement = signed JWT declaring operator domain, agent name, scopes, model, prompt hash
  - DPoP proof per request binds token to key (stolen tokens are useless without the private key)
  - HTTP Message Signatures for request body integrity
  - Delegation chains: scope can only shrink as it passes down (orchestrator → sub-agent)
  - Revocation registry for compromised tokens without affecting sibling chains
- **No blockchain, no DID:** Uses DNS as trust anchor — public key at well-known URL
- **HN:** Posted June 1, minimal engagement (2 points)
- **URL:** https://github.com/lujainkhalil/proveyouragent
- **ZenBin overlap/contrast:** Proveyouragent focuses on agent→API request authentication (who is making this API call). ZenBin's CAP signing focuses on output provenance (who produced this artifact/content). Same crypto primitives (Ed25519), different problem. Proveyouragent is input-side identity; ZenBin is output-side identity.

### GuardClaw — Ed25519 Execution Audit for Agent Actions (June 2026)
- **What:** GEF-SPEC-1.0 (Guard Execution Format) — JSONL ledger with SHA-256 causal hash chaining + Ed25519 per-entry signatures for agent execution audit. Offline verification via CLI. Anyone with the public key can verify the full history without the original runtime.
- **Key design:** Each entry is SHA-256 chained to its predecessor (causal hash) and Ed25519 signed by the agent's key. Tampering with any entry deterministically breaks the chain. No server required — pure JSONL file.
- **Benchmarks:** ~762 writes/sec, ~9k verifies/sec, ~39MB RAM for 1M entries.
- **Limitation:** If the signing key is compromised, past history can be rewritten. Key management is out of scope.
- **Signal:** Agent execution provenance is being formalized as a spec. Ed25519 + hash chain is becoming the standard pattern for agent audit trails.
- **ZenBin overlap:** GuardClaw signs what agents DID (execution logs). ZenBin signs what agents PRODUCED (published content). Same Ed25519 + hash chain pattern. GuardClaw could feed into ZenBin — the execution audit becomes part of the content provenance chain.
- **URL:** https://github.com/viruswami5511/guardclaw

### Presenc AI — Agent Reputation & Identity Landscape Report (May 2026)
- **What:** Comprehensive landscape analysis of agent identity and reputation infrastructure in production, May 2026
- **Key findings:**
  - **W3C Verifiable Credentials won the agent identity standards war** — VC Data Model is now the dominant agent-identity primitive across AAIF, Google AP2, Anthropic, Visa. Vendor proposals to invent new agent-identity primitives have largely lost momentum.
  - **Cross-platform reputation portability does not yet exist.** Salesforce reputation doesn't transfer to Microsoft; Anthropic agent history doesn't transfer to OpenAI. AAIF Agent Reputation Network is the most credible cross-platform proposal but still in working-group stage.
  - **Reputation depreciates faster than identity.** An agent's DID/mandate key is durable; its reputation can decay sharply on a single bad interaction. Production systems use credit-score dynamics, not binary trust/distrust.
  - **Cloudflare evolving from bot-identity to agent-identity.** Verified Bot program expanding to verified-agent status for Cloudflare-fronted sites.
  - **On-chain agent IDs (x402-adjacent) growing** — Coinbase x402 standard uses wallet addresses as agent IDs for crypto-native flows.
  - **OAuth-for-Agents is the missing piece.** Current OAuth assumes human authorizing an app; chained agent-to-agent delegations don't fit. IETF working groups drafting extensions but no shipping standard yet.
- **Identity primitives in production (May 2026):**
  | Primitive | Standard | Status |
  |---|---|---|
  | Verifiable Credentials | W3C VC Data Model | Production via AAIF; Google, Anthropic, Visa |
  | Decentralized Identifiers | W3C DID Core | Production for agent identity; did:web, did:key, did:ion |
  | AP2 Mandate Signing | Google AP2 spec | Production; 60+ partners signing mandates with agent keys |
  | Cloudflare Verified Bot Token | Proprietary → evolving | Production for crawler identity; expanding to agent flows |
  | OAuth-for-Agents extensions | Draft IETF | Working-group level; not yet widely deployed |
  | On-chain agent IDs | Coinbase x402 | Production for crypto-native agent flows |
- **Reputation systems in production:** Salesforce Trust Score, Microsoft Agent Trust Rating, AAIF Agent Reputation Network (emerging), Cloudflare Bot Score, Anthropic Agent Trust History, Visa Agent Behaviour Score
- **URL:** https://presenc.ai/research/agent-reputation-and-identity-2026
- **ZenBin angle:** Presenc confirms that identity standards have converged on W3C VC + DIDs, but reputation remains siloed per-platform. There is NO mention of output provenance or content attestation. The gap ZenBin fills (proving what an agent produced, not just who it is) is completely unaddressed in this landscape.

### NHIMG/Akeyless — AI Agent Identity Security: 2026 Deployment Guide
- **What:** Deployment guide from Akeyless/NHIMG on securing AI agent identities, positioning secrets management for the agentic era
- **Key stats:** 144:1 ratio of non-human to human identities; 80% of orgs using AI agents admit agents have taken unintended actions; 1 in 5 orgs has had a security incident tied to an AI agent
- **Core argument:** Agents are "adaptive actors" not predictable scripts. The question isn't what they produce but WHO they are and what authority they wield. Need Zero Standing Privileges (ZSP) — if a token doesn't exist until the task starts, it can't be stolen while idle.
- **Salesloft-Drift post-mortem:** 2025 attack used long-lived OAuth tokens for standing access. "Valid authentication is not secure authority."
- **Secretless horizon via MCP:** Agents use mediation points (MCP servers) that authenticate with infrastructure identity (K8s service accounts, GitHub JWT) and provision short-lived, task-scoped credentials. Identity verified at access time; secret expires when task completes.
- **URL:** https://nhimg.org/ai-agent-identity-security-the-2026-deployment-guide
- **ZenBin angle:** The "secretless via MCP" pattern validates the direction of signing content at publish time rather than managing long-lived credentials. But the entire guide is about agent→infrastructure auth (input side). Output attestation is unaddressed.

### GitHub Commit Verification Logic Flaw (HN, May 26, 2026)
- **What:** Detailed HN post exposing that GitHub's green "Verified" badge verifies the committer's key, not the author's. The author field is freely settable via GIT_AUTHOR_NAME/EMAIL environment variables.
- **Attack pattern:** Anyone can create commits displaying as "Verified" next to any GitHub user's name — sign with your own GPG/SSH key, set the author to the target user. The badge sits next to the author, but validates the committer.
- **Defense gap:** Vigilant Mode (which catches author≠committer) is opt-in and gated on the *victim's* account settings, not the attacker's. Most users, including Linus Torvalds, haven't enabled it.
- **Core insight:** Platform-level identity badges are misleading when they verify something different from what they appear to verify. The "Verified" badge implies author verification but only provides committer verification.
- **URL:** https://news.ycombinator.com/item?id=48274410
- **ZenBin angle:** This is the platform-level version of the problem ZenBin solves. GitHub's verification is a signature that doesn't bind to the claimed identity. ZenBin's Ed25519 signing with canonical strings (METHOD\nPATH\nTIMESTAMP\nNONCE\nCONTENT_DIGEST) cryptographically binds the signer to the specific content. No ambiguity about who produced what. When platforms get identity verification wrong at scale, the solution is content-bound cryptographic attestation, not more platform badges.

### Harvey — Why We Built Our Own Cloud Agent Infrastructure (June 2, 2026)
- **What:** Harvey (legal AI, valued at $3B+) explains why they built their own agent runtime instead of using Anthropic/OpenAI managed agents or cloud provider runtimes
- **Three hard blockers:**
  1. **Multi-model is table stakes** — Law firms can't lock to a single model (conflict of interest, confidentiality). Firms need to run on any model. Single-model runtime = company-level risk.
  2. **Zero Data Retention (ZDR)** — Not "retention then deletion" but architecturally no durable storage of customer data. Agent state persistence and ZDR are mutually exclusive by design.
  3. **Cost optimization** — Per-task cost of routing everything to frontier models is unsustainable. They see 3-5x cost reduction by routing each task to the smallest sufficient model.
- **Key insight on lock-in:** "The lock-in is no longer just your model, it's your entire agent workforce. The agents your teams have built, tuned, and come to rely on live inside that provider's runtime, in its formats and against its orchestration. You can't pick them up and move them."
- **URL:** https://www.harvey.ai/blog/why-we-built-our-own-cloud-agent-infrastructure
- **ZenBin angle:** Harvey's reasoning validates a core ZenBin thesis: if you can't own your agent's output and move it, you're locked in. ZDR means firms need agents that can produce portable, self-certifying output. Signed content with Ed25519 keys that the customer controls is the output-side equivalent of Harvey's ZDR principle.

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


### Proveyouragent — Ed25519 + DPoP Agent Identity (HN June 1, 2026)
- **What:** Small Python library giving each AI agent an Ed25519 keypair, signed software statement, and per-request DPoP proof so services can verify which agent made a request.
- **Built on:** Ed25519, OAuth 2.0 Dynamic Client Registration / software statements (RFC 7591), and DPoP (RFC 9449).
- **Key pattern:** Public keys are published under the operator domain; requests carry `X-Agent-Statement` and `X-Agent-DPoP`; servers verify signature, expiry, scope, method/URI binding, freshness, and replay `jti`.
- **Delegation:** Supports root human mandate → orchestrator → sub-agent delegation chains with scope attenuation; escalation beyond parent scope is rejected.
- **Design choices:** DNS as trust anchor, no blockchain/DID dependency, Ed25519 only, pluggable replay cache for production.
- **Signal:** The agent identity field is converging on simple composable primitives: agent-owned key, operator accountability, signed request, scope enforcement, delegation chain. This is very close to ZenBin's signed publishing mental model, but it signs API calls, not published artifacts.
- **URL:** https://github.com/lujainkhalil/proveyouragent | HN: https://news.ycombinator.com/item?id=48354556

### Cordium — Identity-Based Secretless Access for Agent Sandboxes (Show HN, May 31, 2026)
- **What:** FOSS sandbox platform (Apache 2.0) on Kubernetes + Octelium that eliminates credential injection into agent sandboxes. Uses identity-aware proxy (ZTNA model) to grant access to APIs, SSH, databases, K8s without injecting secrets.
- **Identity model:** Access is based on identity + policy-as-code, not credentials. The upstream credential is held by the Octelium-protected resource outside the sandbox.
- **Signal:** The "identity, not credentials" pattern is spreading from enterprise infra (BeyondCorp/ZTNA) into agent sandboxing. Agents authenticate as identities, not as bearers of injected secrets.
- **ZenBin contrast:** Cordium proves WHO the agent IS on the input side. ZenBin signs WHAT the agent PRODUCES on the output side. Same Ed25519 primitives, complementary direction.
- **URL:** https://github.com/octelium/cordium

## Emerging Patterns

1. **Agents as first-class identities** — Not service accounts, not human delegates. Unique cryptographic identity.
2. **Delegation chains** — User → Agent → Sub-agent must be traceable and verifiable
3. **Signed requests, no bearer tokens** — AAuth pattern: every request cryptographically signed
4. **Progressive trust** — Start pseudonymous, advance to stable identity, then full delegation
5. **Policy enforcement at the gateway** — Agentgateway pattern: central policy point for auth/authz decisions
6. **Identity, not credentials** — Cordium/ZTNA pattern: agents authenticate as identities (policy-as-code), not as bearers of injected secrets. Credentials stay outside the sandbox.
7. **MCP as the connection standard** — OpenID whitepaper explicitly names MCP as the leading standard for agent↔resource interaction

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



### Vouch Protocol — Open Identity for AI Agents (C2PA + did:web) (Jan 2026)
- **What:** Open-source standard for AI agent identity using W3C Decentralized Identifiers (did:web) and Ed25519 key pairs. Replaces X.509 Certificate Authorities with domain-rooted trust.
- **How it works:**
  1. Agent generates Ed25519 key pair
  2. Publishes public key to domain (/.well-known/did.json) — domain becomes root of trust
  3. Signs every prompt/action using JWT-VC (Verifiable Credential)
  4. Any system can verify "This action came from the Agent at domain X" without a central server
- **C2PA submission:** Submitted to the Coalition for Content Provenance and Authenticity to push this decentralized model as a standard alongside Adobe and Microsoft
- **Comparison:** Like AAuth (cryptographic identity, no CA) but uses did:web + JWT-VC instead of HTTP Message Signatures. Like Ratify (Ed25519, decentralized verification) but web-native instead of offline-first. Closer to ZenBin's approach (Ed25519 + domain-rooted trust) than any other identity protocol.
- **ZenBin overlap:** Vouch Protocol and ZenBin CAP both use Ed25519 + domain-rooted identity. Vouch signs actions/requests (input-side). ZenBin signs published content (output-side). Vouch's C2PA submission aligns with content provenance — the same space ZenBin operates in, but Vouch addresses provenance of who created it (identity layer), while ZenBin addresses provenance of what was created (content layer).
- **URL:** https://github.com/vouch-protocol/vouch | https://news.ycombinator.com/item?id=46668263

### MCPS (MCP Secure) — Cryptographic Identity and Message Signing for MCP (Mar 2026)
- **What:** Security layer on top of MCP — like TLS for HTTP. Adds agent passports (ECDSA P-256), signed message envelopes for every JSON-RPC call, tool integrity (signed definitions prevent poisoning), replay protection (nonce + timestamp), and trust levels L0-L4.
- **Problem it solves:** MCP has no identity layer, no message signing, no tool integrity. 41% of MCP servers have zero authentication (TapAuth research). CVE-2025-6514 scored CVSS 9.6.
- **Scan results:** Tested against 39 agent frameworks on OWASP Agentic AI Top 10. 13 FAIL, 17 WARN, 9 PASS. Open Interpreter scored 80/100 risk. AutoGPT 65. Even LangChain flagged WARN for prompt injection.
- **Mitigates:** 8/10 OWASP MCP risks. Zero dependencies.
- **Comparison:** MCPS addresses MCP transport security (who is calling what tool, and is the tool definition trustworthy?). Different layer from Vouch (agent identity) and ZenBin (output provenance). MCPS = request integrity, Vouch = agent identity, ZenBin = content provenance.
- **URL:** https://mcp-secure.dev | https://news.ycombinator.com/item?id=47367404

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

### APS IETF Draft — Agent Passport System for Cryptographic Identity & Delegation (Mar 2026)
- **What:** IETF Internet-Draft (draft-pidlisnyi-aps-00, expires Sept 2026) specifying the Agent Passport System — a formal protocol for cryptographic identity, faceted authority attenuation, and governance for AI agent systems.
- **Identity model:** Ed25519-based agent passports (self-signed, no central authority). DID method: `did:aps:z<base58btc-encoded-public-key>`. Each passport binds a public key to agent ID, name, owner, and TTL.
- **Delegation:** Seven-dimension scoped delegation (scope, spend, depth, time, reputation, values, reversibility) modeled as a product lattice. Authority can only attenuate, never amplify — monotone narrowing. Cascade revocation: revoking any delegation invalidates all descendants.
- **Policy chain:** Three-signature chain (intent, evaluation, receipt) binding who requested, what was evaluated, and what was delivered.
- **Reputation:** Bayesian reputation-gated authority — agents with higher reputation scores get broader delegation scopes.
- **Institutional governance:** Charters, offices, approval policies, federation primitives for multi-agent orgs.
- **MCP binding:** 120 MCP tool bindings specified. Explicitly addresses the identity/authorization gap in MCP and A2A ("MCP provides no built-in authentication layer. A2A uses self-declared identities with no attestation mechanism").
- **Status:** IETF Draft, March 2026. Reference implementations in TypeScript and Python, 1,634 tests across 85 modules. Apache-2.0 SDKs.
- **Signal:** The most comprehensive agent identity specification yet — IETF-track, formal lattice math, governance primitives. This is the "OAuth for agents" attempt. Seven-dimension delegation is sophisticated but may be over-engineered for most current use cases.
- **ZenBin overlap/contrast:** APS handles identity and delegation for agent actions (who is this agent, what can it do). ZenBin handles identity for agent output (who published this content, can I verify it). APS's policy chain (intent→evaluation→receipt) is the input-side equivalent of ZenBin's output-side provenance chain. Both use Ed25519. APS scopes authority; ZenBin scopes publishing.
- **URL:** https://www.ietf.org/archive/id/draft-pidlisnyi-aps-00.html

### Agent Identity (AID) Protocol — Ed25519 + OAuth 2.0 for Agent Auth (2026)
- **What:** Open protocol for AI agent authentication and authorization. v0.3.0, RFC 8628 aligned. Ed25519 cryptographic identity, OAuth 2.0 token exchange, scoped JWTs. Agent-initiated registration with human approval.
- **Identity model:** Ed25519 keypair = agent identity. No shared secrets, no passwords, no rotation. Private key never leaves the agent's machine. Human admin registers agent's public key with auth server and assigns a role.
- **Auth flow:** Agent proves identity → exchanges for scoped RS256 JWT → calls any API with JWT → API validates via standard JWKS endpoint. No AID-specific logic needed on the target API side — standard JWT validation works.
- **Key differentiator:** Works with existing API gateways (AWS Gateway, Cloudflare, nginx) because output is just standard JWTs. No custom middleware needed on the consuming side.
- **Three-party model:** Human admin (creates roles, registers agents) → AI agent (has Ed25519 identity, gets scoped tokens) → Target API (validates JWT via JWKS). Agents cannot self-register or escalate.
- **Status:** v0.3.0, RFC 8628 aligned. Backed by 23blocks. CLI tools: `aid-init`, `aid-register`, `aid-token`.
- **Signal:** Same Ed25519 identity pattern as Proveyouragent and APS, but with a pragmatic OAuth 2.0 integration layer. The "works with existing gateways" angle is smart — lowest adoption friction. Like Proveyouragent, this is input-side auth only.
- **ZenBin overlap/contrast:** AID authenticates agents to APIs (input-side). ZenBin authenticates agents' published output (output-side). AID's JWT approach is stateful (requires auth server); ZenBin's Ed25519 signing is stateless (verify with public key alone).
- **URL:** https://agentids.org/

### Lyfe Ninja — Revocable Digital Signatures for AI Output (Apr 2026)
- **What:** Ask HN exploring revocable digital signatures for verifying AI agent outputs
- **Approach:** AI responses are signed after generation, verified client-side, tampering causes verification failure. Signatures are revocable (short-lived leases or full invalidation).
- **Key framing:** "Know your agent" — verify that AI-generated content came from the intended agent and hasn't been altered
- **Key quote:** "Would you want to stand by your AI agent's output forever? I think not."
- **Properties:** Distributed verification, embedded metadata, no key management
- **Status:** Exploratory, asking market validation question. No product yet.
- **Signal:** Closest competitor concept to ZenBin's output provenance. But Lyfe Ninja is asking the verification question; ZenBin answers the publishing question. Verification without a publishing layer is incomplete.
- **URL:** https://lyfe.ninja/projects/

### Zylos.ai — Signed Action Envelopes & Agent Provenance (April 2026 research)
- **What:** Comprehensive design pattern for production agent audit trails combining four disciplines: workload identity (SPIFFE/SVIDs), delegated authorization (signed task grants), signed action envelopes (in-toto/DSSE-style), and hash-chained tamper-evident journals.
- **Key insight:** "When something goes wrong, 'the agent did it' is not an actionable answer." Need to reconstruct: which agent instance, which model/prompt/toolset, which user instruction, which policy decision, what the agent saw, exact tool request/response, which artifacts were modified, whether the record was changed after the fact.
- **W3C PROV mapping:** Entities (input docs, prompts, tool responses, patches, reports), Activities (LLM calls, retrieval steps, shell commands, policy evaluations, commits), Agents (human principal, AI instance, runtime process, tool server). Distinguishes attribution, association, delegation.
- **Signed action envelope contains:** agent identity (SPIFFE ID), runtime metadata (name, version, model, toolset digest), delegation reference, policy decision ID, tool input/output digests (SHA-256), artifact subjects with digests, timestamps.
- **Hash-chained journal:** Simple append-only structure where each event hash chains to the previous. Prevents record deletion. Combined with signed envelopes for tamper evidence.
- **NIST 2026 concept work cited:** Organizations need strong agent identification, authorization, binding to human intent, tamper-proof logs, and non-repudiation.
- **Status:** Research/design pattern. No product, but detailed enough to implement.
- **Signal:** The most complete input-side audit trail design for agent runtimes. Combines identity + delegation + provenance + signing in one coherent system. But stops at the tool-call boundary — doesn't address published output provenance.
- **ZenBin overlap/contrast:** Zylos signs every tool action; ZenBin signs published output. Both use Ed25519 + canonical strings + SHA-256 digests. Zylos needs SPIFFE infrastructure (heavy); ZenBin needs only a public key (light). The gap: no one is connecting input-side audit (Zylos) with output-side publishing provenance (ZenBin) into a single chain.
- **URL:** https://zylos.ai/en/research/2026-04-25-agent-identity-provenance-signed-audit-trails

### Provenance Protocol — WHOIS for AI Agents (June 2026)
- **What:** Universal framework for verifying AI agent provenance: identity, origin, lineage, ownership, actions. Non-crypto, institution-ready, technology-agnostic.
- **Architecture:** Provenance Protocol (governance/rules) → Provenance Layer (infrastructure: identity, lineage, logging, validation) → Provenance Registry (lookup/audit index).
- **Six capabilities:** Agent identity, model/data lineage, ownership/custody, action provenance, multi-agent traceability, real-world asset provenance.
- **Status:** In development. v1.0 spec not yet released. Accepting early collaboration.
- **Signal:** Multiple orgs are racing to define agent identity registries. Provenance Protocol is governance-first, broad scope (not just agents, also digital property, data pipelines, real-world assets). May be too broad to ship quickly.
- **ZenBin overlap:** Provenance Protocol defines WHAT to track (identity, lineage, ownership, actions). ZenBin provides HOW to prove it cryptographically (Ed25519 signing, content digests). A registry without content is empty; ZenBin content without a registry is discoverable only by direct link. They're complementary.
- **URL:** https://provenanceprotocol.org/

### Presenc.ai — Agent Reputation and Identity Layer (May 2026 Landscape)
- **What:** Comprehensive survey of identity/reputation infrastructure in May 2026. The most complete snapshot of who's building what.
- **Key findings:**
  - W3C Verifiable Credentials won the identity standards war (adopted by AAIF, Google AP2, Anthropic, Visa).
  - Cross-platform reputation portability does NOT yet exist (Salesforce, Microsoft, Anthropic reputations are siloed).
  - AAIF Agent Reputation Network is the most credible cross-platform proposal but still working-group stage.
  - Cloudflare Verified Bot program evolving from crawler-identity to verified-agent-identity.
  - On-chain agent IDs (x402-adjacent) growing for crypto-native flows.
  - OAuth-for-Agents is the missing piece — current OAuth assumes human authorizing app; chained agent delegation doesn't fit.
  - AP2 Mandate Signing: 60+ partners signing mandates with agent keys.
  - Reputation depreciates faster than identity — single bad interaction can tank an agent's score.
- **Signal:** Identity standards are consolidating (VC won), but reputation and cross-platform trust remain unsolved. The gap between identity (who are you?) and provenance (what did you produce?) is still wide open.
- **ZenBin angle:** ZenBin's CAP signing produces verifiable credentials for CONTENT, not just identity. The reputation layer needs something to be reputable ABOUT — that's output provenance, which is ZenBin's territory.
- **URL:** https://presenc.ai/research/agent-reputation-and-identity-2026

### Bob Renze — 3-Layer Agent Identity in Production (March 2026)
- **What:** Practical blog post on agent identity: Static (who I am), Runtime (when I ran), Stateful (what I knew). No standard format, no framework — just what works in production.
- **Static identity:** Agent ID, human owner, git commit hash, environment.
- **Runtime identity:** Session ID, process ID, parent ID for subagent chains, activation timestamp.
- **Stateful identity:** Context window size, memory IDs referenced, tools available, config overrides.
- **Provenance chain example:** "Published blog post → Agent: rhythm-worker → Session: sess_abc123 → Subagent: yes → Parent: main_2026-03-10 → Git commit: 7a8f9d2 → Model: ollama-cloud/kimi-k2.5 → Task ID: 1451"
- **Signal:** Production operators are building identity chains ad-hoc. The provenance chain pattern (who → when → what version → what model → what task) is emerging organically. No standard format exists.
- **ZenBin angle:** Renze's provenance chain is a manual, ad-hoc version of what ZenBin's CAP signing does cryptographically. CAP binds content + timestamp + nonce + key to a signature. Renze's chain binds agent + session + version + model + task. They're complementary — CAP proves the output, Renze's chain explains the input.
- **URL:** https://blog.bobrenze.com/2026/03/10/ai-agent-identity-provenance-production/

### Authentic Marketing / AI-ID.org — Cryptographic Provenance for Agent Output (March 2026)
- **What:** Directly in ZenBin's territory — "Agent Identities, Artifact Signing & Blockchain Archival." A 5-phase provenance stack.
- **Phases:** Artifact signing → PKI+timestamps → agent identity → agent commerce → permanent archival.
- **References:** NIST NCCoE "AI Agent Identity" concept paper (Feb 2026), EU AI Act Articles 11/12 traceability (Aug 2026 enforcement).
- **Timeline:** Feb 2026 NCCoE concept → Mar 2026 working implementation → Aug 2026 EU AI Act enforcement → 2027 Expected NIST guidance.
- **Primitives:** Ed25519, did:key, W3C VC, DSSE/SLSA, Arweave for archival, ML-DSA-65 for post-quantum.
- **Signal:** First explicit competitor signal in the output/publishing provenance space. Someone is building artifact signing for AI output, which is ZenBin's core value proposition.
- **ZenBin overlap:** Same Ed25519 + did:key + W3C VC building blocks. Key difference: Authentic Marketing adds blockchain archival (Arweave); ZenBin uses simple Ed25519 verification without blockchain dependency. The EU AI Act timeline (Aug 2026) creates regulatory urgency for provenance solutions.
- **URL:** https://ai-id.org/wp-content/uploads/2026/03/authentic-signing-deck-0320-v2.html

### Microsoft Agent Governance Toolkit — Runtime Security for AI Agents (April 2026)
- **What:** MIT-licensed, 7-package toolkit for deterministic, sub-millisecond policy enforcement on agent actions. First toolkit to address all 10 OWASP Top 10 for Agentic Applications (2026).
- **Philosophy:** Apply OS kernel patterns (privilege rings, process isolation) + service mesh patterns (mTLS, identity) + SRE patterns (SLOs, circuit breakers) to AI agents.
- **Key components:** Agent OS (stateless policy engine), identity management, SRE practices.
- **Framework integrations:** LangChain, CrewAI, LlamaIndex, OpenAI Agents SDK, Haystack, LangGraph, PydanticAI, Dify. Multi-language: Python, TypeScript, Rust, Go, .NET.
- **Aspiration:** Move to foundation governance.
- **Signal:** Microsoft treating agent governance as infrastructure, not feature. The OS analogy is explicit.
- **ZenBin angle:** Agent Governance Toolkit governs agent INPUT (what actions can an agent take). ZenBin governs agent OUTPUT (what did the agent produce, can you verify it). Both are governance layers, but on different sides of the agent.
- **URL:** https://github.com/microsoft/agent-governance-toolkit

### GitHub Commit Verification Logic Flaw — Identity Spoofing via Author/Committer Mismatch (Ask HN, May 26, 2026)
- **What:** Detailed writeup of GitHub's "Verified" badge trust gap. The badge verifies the committer's GPG key, but displays next to the author's name. Author and committer can be different people.
- **The exploit:** A commit with author=torvalds, committer=anyone, verification.verified=true shows Linus Torvalds with a green checkmark, but the signing key belongs to someone else.
- **GitHub's defense:** "Partially verified" badge for author≠committer is opt-in (vigilant mode), off by default, gated on the impersonated user's settings — not the attacker's. Most GitHub users (including Linus) haven't enabled it.
- **AI agent amplification:** Agents can set any author/committer identity via GIT_AUTHOR_NAME, GIT_AUTHOR_EMAIL, GIT_COMMITTER_NAME, GIT_COMMITTER_EMAIL. The rise of AI-generated commits makes this a growing problem.
- **Status:** Bug bounty dismissed by MSRC. Posted publicly after waiting.
- **Signal:** The provenance problem is real and worsening. GitHub's identity model was designed for humans controlling their own keys, not for agents acting on behalf of humans. The "Verified" badge creates false confidence.
- **ZenBin angle:** Validates the ZenBin/CAP approach — don't trust mutable identity fields, trust cryptographic signatures. GitHub's "Verified" badge is a false positive factory for agent-generated content. ZenBin's signing binds content to a specific key, not a mutable name field.

## Gaps ZenBin Fills

- **Agent publishing identity:** Most identity work focuses on auth (who is this agent?) not on presentation (what does this agent produce?). ZenBin gives agents a public, verifiable identity through their published output.
- **Output provenance:** No standard addresses "this content was created by agent X on behalf of user Y" in a user-verifiable way. ZenBin's signed publishing creates an auditable trail. Authentic Marketing/AI-ID.org is the first adjacent effort (artifact signing + blockchain archival), but adds blockchain dependency. ZenBin stays lightweight.
- **The 80% visibility gap:** Strata survey shows 80% of orgs can't track what agents are doing. Published agent output with identity is a step toward transparency.
- **Provenance Protocol gap:** Provenance Protocol defines WHAT to register (identity, lineage, ownership). ZenBin provides verifiable CONTENT to register. They need each other — a registry without content is empty; content without a registry is discoverable only by direct link.
- **Microsoft governance gap:** Agent Governance Toolkit governs INPUT (what actions agents take). Nobody governs OUTPUT (what agents produce). Both governance layers are needed.
- **No output-layer auth:** Nine auth/security frameworks now (AAuth, IETF APS, AID, Passport, Ratify, AgentGate, Keycard stack model, Vouch Protocol, MCPS) — all address input-side (who can this agent BE, what can it DO, how is it secured). None address output-side (who created this content, can I verify it came from a real agent?). The Keycard 4-layer model explicitly has no output layer. APS is the most comprehensive (7-dimension lattice, IETF draft) but still input-side only.
- **GitHub "Verified" badge is a false positive factory:** The commit verification flaw shows that mutable identity fields (author/committer) combined with key-bound verification create a trust gap. AI agents make this worse because they can set any identity via environment variables. This is the real-world failure mode that cryptographic output provenance (ZenBin/CAP) solves — trust the signature, not the mutable metadata.
- **Input-side audit trails are maturing, output-side provenance is not:** Zylos.ai's signed action envelope pattern is the most complete input-side audit design yet (SPIFFE workload identity + delegated task grants + signed action envelopes + hash-chained journals). But it stops at the tool-call boundary — who called what, when, under what policy. The question of "who produced this published artifact and can I verify it independently?" remains unaddressed. This is exactly ZenBin's territory.
- **Personal agent identity is scaling:** Deckard proves that even individual users running multiple agents need per-agent identity + scoped access. This is the personal-scale version of the enterprise identity problem. Output identity scales the same way — which agent published this, on whose behalf, with what scope?
- **Revocable signatures emerging:** Lyfe Ninja's Ask HN shows someone is thinking about signing AI outputs — but framing it as a question, not a product. The concept of verifiable agent output is emerging in developer consciousness, but nobody has productized it. ZenBin's Ed25519 signed publishing is the product version.