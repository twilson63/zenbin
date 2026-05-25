# Landscape Research Updates

## 2026-05-25 06:14 UTC

### New Findings

**Cosmic CMS Team Agents — First Major CMS with Direct Agent Publishing (HN, May 25)**
- YC W19 company shipping Content Agents that write and publish directly to CMS
- Content Agents go from prompt → published content with zero attribution or signing
- Code Agents and Computer Use Agents also launched
- **Signal:** The "agent as content creator" workflow is being productized. But there's NO provenance layer — content just appears in the CMS
- **Gap angle:** Cosmic proves agents will publish content directly. ZenBin provides the missing attribution layer.

**Vouch Protocol — DID-Based Agent Identity + C2PA Submission (HN, Jan 2026, resurfaced)**
- Open-source agent identity: did:web + Ed25519 + JWT-VC + /.well-known/did.json
- Submitted to C2PA (Coalition for Content Provenance and Authenticity) alongside Adobe and Microsoft
- **Signal:** Two signals: (1) did:web + Ed25519 + /.well-known is exactly ZenBin's architecture (independent validation). (2) C2PA submission means agent identity is being pushed into content provenance standards — directly in ZenBin's territory
- **Gap angle:** Vouch signs agent ACTIONS (input verification). ZenBin signs agent OUTPUT (content attribution). Same crypto, different direction. The C2PA push is significant.

**Circe Receipts — Ed25519 Signed Receipts for Agent Actions (HN, Jan 2026, resurfaced)**
- Cryptographically signed receipt for every agent run. Ed25519 + RFC 8785 canonical JSON. Offline-verifiable.
- **Signal:** Someone independently built the same core primitive as ZenBin (Ed25519 + canonical signing) but for action audit trails rather than content publishing
- **Gap angle:** Circe = prove what an agent DID (actions). ZenBin = prove what an agent PRODUCED (content). Same building blocks, different use case.

**ForwardPass MCP — Newsletter Delivered via MCP Server (HN, May 25)**
- First product using MCP as a content delivery channel (not just tool invocation)
- Subscribers control when and how often they receive content
- **Signal:** MCP is expanding from tool access to content distribution
- **Gap angle:** When content flows through MCP, attribution matters. Content needs provenance.

**Pulsar Edit MCP Server (HN, May 24)**
- MCP server for Pulsar text editor + LLM failure modes documentation
- **Signal:** MCP ecosystem is dense enough to support niche tooling

**Pro Health Ledger — Professional Identity Verification Graph (HN, May 24)**
- Immutable professional conduct records. Non-anonymous, anchored to binary subjective question.
- **Signal:** Identity verification graphs becoming a product category beyond agents

### Cross-Query Patterns (8 HN Algolia queries)

1. **Agent publishing is being built without attribution.** Cosmic CMS, Piecely, ForwardPass MCP — all ship content from agents with zero cryptographic provenance. The gap between "agents publishing everywhere" and "anyone proving who published what" grows daily.

2. **C2PA is becoming the battleground for agent content provenance.** Vouch Protocol submitted to C2PA. Adobe and Microsoft are at the table. If C2PA adopts agent identity standards, it becomes the de facto standard for content attribution. ZenBin should monitor and potentially align.

3. **The Ed25519 + canonical signing pattern is converging independently.** ZenBin, Vouch Protocol, Circe, and Prisma Next all independently arrived at Ed25519 + canonical structured data + offline verification. This is becoming the standard primitive for agent provenance.

4. **MCP is expanding into content delivery.** ForwardPass proves MCP can be a publishing channel, not just a tool-access protocol. This creates new demand for content attribution in MCP-delivered content.

5. **All input, zero output.** Pattern confirmed again this cycle: every new infrastructure product handles what goes INTO agents. None handles what comes OUT.

### Previously Tracked (No Substantial Changes)
- Runtime, OTA, SoMatic, PII Firewall, DDS Vibe Academy — all already in infrastructure.md
- Lemma/x402, Larkin, Auth.md — all already tracked
- MCP-safeguard, Golf MCP Scanner — already tracked
- Reddit searches (r/LocalLLaMA, r/ChatGPTCoding) returned no new relevant discussions this cycle

### Gap Confirmation

The output attribution gap continues to widen:
- **Input side (well-served):** AWS AgentCore Identity, Ping Agentic IAM, Microsoft Agent 365, Cisco Zero-Trust, 1Password MCP, Auth.md, Vouch, AstraCipher, identities.ai, Uber agent identity, Cloudflare Bot Auth, Vigil, Agent Vault, Clawvisor, Authsome, OTA, 7 MCP auth servers
- **Output side (unserved):** ZenBin is still the only product that handles what agents PRODUCE and PUBLISH with cryptographic attribution

## 2026-05-25 00:14 UTC

### New Findings

**AWS Bedrock AgentCore Identity — Purpose-Built IAM for AI Agents (May 25 scan)**
- AWS launched a comprehensive identity and access management service for AI agents with 4 components: Agent Identity Directory, Agent Authorizer, Resource Credential Provider, Resource Token Vault
- Dual auth model: inbound (SigV4, OAuth 2.0, OIDC, JWT) + outbound (token vault with KMS encryption)
- Declarative SDK annotations: @requires_access_token, @requires_api_key
- Pre-configured integrations with GitHub, Slack, Salesforce
- **Signal:** AWS going all-in on agent IAM validates the category. Agents are first-class identity citizens. But it's ALL input-side. Zero output-side.
- **Gap angle:** AWS handles what goes INTO agents. ZenBin handles what comes OUT. They're complementary halves. When AWS builds this much identity infrastructure and ignores output, the gap becomes a canyon.

**Ping Identity Agentic IAM Framework (May 25 scan)**
- Formal definition and framework for managing AI agents as governed non-human identities
- Four critical questions: Who is the agent? On whose behalf? What is it allowed to do right now? Can its actions be traced?
- Key principles: delegation not impersonation, runtime identity, human-in-the-loop, full audit trails
- **Signal:** Major enterprise identity company formalizing agent IAM as a discipline. All input/authorization-side.
- **Gap angle:** Ping's four questions are all about agent INPUT. ZenBin adds the missing output questions: What did the agent produce? Can that output be cryptographically verified?

**OWASP Top 10 for Agentic Applications 2026 (May 25 scan)**
- Globally peer-reviewed framework from 100+ experts identifying most critical security risks for agentic AI
- Risk #3: Identity and Privilege Abuse
- **Signal:** OWASP validates agent identity abuse as a top-tier security risk
- **Gap angle:** OWASP covers what can go wrong (identity abuse). ZenBin covers how to prove what went right (output attestation). You can't detect identity abuse in outputs without output provenance.

**Microsoft Agent 365 (May 25 scan)**
- Enterprise platform for secure, scalable, compliant AI agents
- **Signal:** When Microsoft, AWS, and Ping all invest in agent IAM in the same quarter, the identity layer is consolidating fast — on the input side. Output remains unaddressed.

**Cisco Zero-Trust Framework for Agentic AI (May 25 scan)**
- Advocates purpose-built identity framework that redefines agent identity rather than adapting existing protocols
- Zero-Trust principle: no agent is inherently trusted, every interaction requires verification
- **Signal:** Another major infrastructure company (Cisco) pushing Zero-Trust for agents. All verification-side. No content attestation.

### Cross-Query Patterns (5 HN Algolia queries + web search)

1. **Big tech converging on agent IAM.** AWS (AgentCore Identity), Microsoft (Agent 365), Ping (Agentic IAM), Cisco (Zero-Trust for Agents) — all in the same quarter. The input identity layer is consolidating at enterprise scale.
2. **Agent identity is now a named discipline.** Ping Identity's formal Agentic IAM definition gives the category a name, framework, and four critical questions. This is no longer emerging — it's established.
3. **OWASP validates the risk.** Identity and Privilege Abuse is #3 on OWASP's agentic top 10. The security community recognizes agent identity abuse as a top threat.
4. **All input, zero output.** Every new entrant this cycle handles what goes INTO agents (auth, credentials, access, policy, verification). None handle what comes OUT (publishing, attestation, provenance). The pattern is now definitive across 10+ scans.

### Previously Tracked (No New Data on HN)
- Runtime (runtm.com), OTA, Prisma Next, SoMatic, PII Firewall, DDS Vibe Academy, Pro Health Ledger — all already in infrastructure.md
- MCP-safeguard, Mcpaudit, Nable MCP, Guesty MCP, Context-drop — all already tracked
- TBN Protocol, Auth.md, Agent Credential Brokers, AstraCipher — all already tracked
- Reddit searches returned older threads (2024-era), no new agent infrastructure/publishing/identity discussions

### Gap Confirmation

The gap is now a canyon. AWS, Microsoft, Ping, and Cisco are all building agent identity infrastructure — on the INPUT side exclusively. OWASP has formalized Identity and Privilege Abuse as a #3 risk. The category has a name ("Agentic IAM") and a formal definition.

But nobody is building OUTPUT infrastructure. No one asks "What did the agent produce?" or "Can the output be verified?" ZenBin remains the only product in the output attestation layer with zero competition.

The 4 critical questions of Agentic IAM (Ping) are all input-side. ZenBin adds 2 missing output-side questions:
1. What did the agent produce?
2. Can that output be cryptographically verified?

Input IAM (AWS/Ping/Cisco/Microsoft) + Output Attestation (ZenBin) = Complete agent governance.

---

## 2026-05-24 18:13 UTC

### New Findings

**Incode "Agentic Identity" — Enterprise Identity Verification for AI Agents**
- Incode (major biometric identity company) launched Agentic Identity product — identity verification and fraud prevention for AI agents
- Pilot programs began Q4 2025, integrating with existing identity verification and risk decisioning infrastructure
- Signal: Enterprise identity companies are entering agent identity. Input-side only (verify before action). No output attestation.
- Gap angle: Yet another input-side identity product. Output attestation (ZenBin) remains the only gap with zero competition.

**CSA Agentic AI IAM Framework**
- Cloud Security Alliance published formal IAM framework for Agentic AI: DIDs + Zero Trust + delegation chains for multi-agent systems
- Treats agents as first-class identity bearers. Covers identity, access, and delegation.
- All input/authorization-side. No content attestation.

**AstraCipher Updated Stats**
- 88% of organizations report confirmed/suspected AI agent security incidents
- 44% still authenticate agents using static API keys
- Only 22% treat agents as independent identity-bearing entities
- 97% of AI-breached organizations lacked sufficient access controls
- Only 28% can trace agent actions back to a human sponsor
- These stats reinforce: the identity gap is real and widening. 3M+ active agents, only 22% identity-bearing.

**iClaw — Apple Intelligence Agent (HN, 7 pts)**
- AI agent built on Apple's on-device 3B model. App Sandbox, per-action consent, tool disable, Safari extension for web access.
- Proves: per-action consent is the UX standard for agents. When agents publish, that consent should produce a verifiable record.
- Per-action consent → per-publication attestation is the natural extension.

**Paper Lantern — MCP Server for CS Research (HN, 2 pts)**
- MCP server searching 2M+ CS papers for coding agents. Demonstrates MCP expanding from tool integration to knowledge retrieval.
- When agents produce research output, they need to publish with attribution.

**Context-drop — Agent File Sharing CLI (HN, 1 pt)**
- "AirDrop between machines" for agents over SSH. Agent file sharing is recognized pain point. Local team sharing → global publishing is the progression.

**TBN Protocol — Runtime Governance for AI Agents (HN, 3 pts)**
- 14-step flow: registration → security challenges → cryptographic attestation certificates. Fingerprint drift detection, mutual cert verification, PCI-style tiered certification.
- "Are you still the same agent?" — identity continuity verification. Output attestation should carry agent's certification state at publication time.

**OpenID Foundation AI Agent Identity Whitepaper (arxiv:2510.25819)**
- Already referenced in standards.md. Key quote: "MCP has emerged as the leading standard for connecting AI models to external data sources and tools." Validates MCP's position. Recommends "separation of concerns" for agent auth — specialized auth servers, not custom per-system.
- Gap: Whitepaper covers auth/authorization. No mention of output attestation or content provenance.

### Previously Tracked (No New Data)
- Runtime (runtm.com), OTA, Prisma Next, Auth.md, Agent Credential Brokers, AstraCipher, MCP-safeguard, Mcpaudit, Nable MCP, Guesty MCP — all already in infrastructure.md and identity.md

### Gap Confirmation
Output attestation (ZenBin) remains the only agent infrastructure layer with zero competing products. All new entrants this cycle are input-side: identity verification (Incode), governance (TBN), knowledge retrieval (Paper Lantern), sandboxed consent (iClaw), file sharing (Context-drop). The input side is saturated; the output side is empty.

## 2026-05-24 10:54 UTC

### No New Findings

Ran 6 HN Algolia queries (AI agent publish, AI agent identity, AI agent infrastructure, MCP server, agent framework, agent auth identity credential, agent publishing output) plus 2 Reddit web searches (r/LocalLLaMA, r/ChatGPTCoding).

All results were already tracked in existing landscape files:
- Prisma Next, OTA, SoMatic, PII Firewall, AgentLair, Nable MCP, Guesty MCP, DDS Vibe Academy — all in infrastructure.md
- Auth.md, Agent Credential Brokers, Ratify, AAuth, AstraCipher, Vigil, Lyfe Ninja — all in identity.md and standards.md
- Reddit searches returned only older threads (2024-era), nothing new on agent infrastructure/publishing/identity
- HN false positives: TapToyPia (game, matched "MCP server" in body text), vdiff (code review, not agent publishing)

**Gap confirmation unchanged:** 8 distinct agent infrastructure layers now, output attestation (ZenBin) remains the only layer with no competing product. All new items this cycle were input-side (auth, credential management, MCP tooling).

## 2026-05-23 16:54 UTC

### New Findings

**Auth.md by WorkOS — Open Protocol for Agent Registration (HN, May 22, 9 pts)**
- Open protocol for agent self-registration at domains. Publish `auth.md` at your domain (like robots.txt) declaring flows, scopes, and endpoints. Agents discover and self-register.
- Three registration modes: trusted identity assertions, OTP-based claims, anonymous access. Credentials are scoped, auditable, expirable, revocable.
- **Signal:** The .well-known declarative capability discovery pattern continues spreading. WorkOS (major auth infrastructure company) validates that agent self-registration needs a standard. This follows the same trajectory as robots.txt → ai.txt → auth.md.
- **ZenBin angle:** Auth.md tells agents how to get IN. ZenBin tells agents how to PUBLISH OUT. If domains can declare registration, they should also declare publishing capability. A natural pairing.
- **URL:** https://workos.com/auth-md

**Agent Credential Brokers — 8-Tool Survey (authsome.ai, May 2026)**
- Comprehensive survey of the "agent proxy" tool category — 8 tools grouped by function:
  - Credential injection: Authsome (local-first, 44 providers, MIT), Agent Vault (Infisical, production multi-tenant), Clawvisor (auth gateway + intent verification, open-source), OneCLI
  - Interception: mitmproxy
  - API gateway: Pomerium, Cloudflare AI Gateway
  - Mocking: WireMock
- Key insight: "Agent proxy is becoming the catch-all term for any tool that intercepts an agent's outbound traffic and does something useful."
- **Signal:** Agent credential brokering is now a recognized product category with multiple mature tools. All 8 tools handle INPUT (credentials, auth, policy). None handle OUTPUT (publishing, attestation). The input side is saturated; the output side remains empty.
- **ZenBin angle:** The 8-tool survey confirms what every scan has shown: the entire agent proxy ecosystem is built for what goes INTO agents. ZenBin is the only tool for what comes OUT.
- **URL:** https://authsome.ai/blog/top-agent-proxy-tools-what-to-know

**New MCP Servers This Cycle (May 23)**
- **Nable** — Cloud/SaaS billing MCP server. "Ask Claude about your cloud bill."
- **Guesty** — Property management MCP server, 43 tools, open source (npm)
- **Research** — MCP server for research workflows (jspann.me)
- **Signal:** MCP server creation is past novelty. People now apologize for making "another MCP server." The ecosystem is commoditized.

**MCP-safeguard + Mcpaudit (May 22) — Already Tracked**
- Both appeared again in HN search results. Confirmed still active. MCP security scanning is a category.

**1Password MCP Server for OpenAI Codex (May 21) — Already Tracked**
- Appeared again in identity query results. Confirmed still active.

**AgentRecall (May 22) — Already Tracked**
- Appeared again in search results. Confirmed still active.

### Cross-Query Patterns (6 HN queries this cycle)

1. **Auth.md extends the .well-known pattern to agent registration.** robots.txt → ai.txt → auth.md. The declarative capability discovery pattern is spreading. Each new standard handles agent INPUT. No equivalent for OUTPUT.

2. **Agent credential brokering is a named category with 8+ tools.** Authsome's survey legitimizes the space. All input-side. The output side has no equivalent.

3. **MCP server creation is fully commoditized.** People apologize for making "another one." The question has shifted from "should I make an MCP server?" to "what domain hasn't been covered yet?"

4. **Agent identity protocols continue consolidating.** Auth.md (WorkOS) adds a .well-known registration layer. Ratify, AAuth, AIP, Vigil, AstraCipher all still competing on the identity/auth layer. No protocol addresses output.

### No New Reddit Findings
- Reddit JSON API and DuckDuckGo site:reddit.com search both blocked (403/bot detection). Persistent issue across all scans.

### ZenBin Gap Confirmation

The gap continues to widen:
- **8 agent proxy tools** surveyed — all handle INPUT (creds, auth, policy). Zero handle OUTPUT.
- **Auth.md** — standardized agent registration (getting in). No equivalent for agent publishing (getting out).
- **MCP security** — 4+ scanners for MCP input. Zero attestation tools for MCP output.
- **Identity protocols** — 10+ competing on WHO agents are. Zero protocols for WHAT agents produce.

Every scan finds more input infrastructure and zero output infrastructure. The ZenBin gap is the most consistent finding across all landscape research.

---

## 2026-05-23 10:54 UTC

### New Findings

**MCP Security Scanners Now Emerging (May 22)**
- Two MCP security scanners appeared on HN on the same day: **MCP-safeguard** (52 detection rules, by SyedAnas01) and **Mcppaudit** (static security scanner by allenwu06). Both scan MCP servers for vulnerabilities.
- **Signal:** MCP security is becoming a product category. Multiple independent tools launching simultaneously means the market has recognized MCP as an attack surface that needs hardening. This follows the CVE-2025-53967 Figma MCP RCE vulnerability called out in the AIUC-1 Q2 update.
- **ZenBin angle:** MCP security tools focus on the INPUT side (what agents consume). ZenBin attestation focuses on the OUTPUT side (what agents produce). As MCP gets hardened, the remaining trust gap shifts to content authenticity.

**AgentLair — Agent Identity + Credential Vault (Mar 2026, still active)**
- Gives AI agents email identity, encrypted credential vault, and namespace isolation (pods) in one API call. MCP-native. Self-registration: agent gets API key + email + account_id instantly, no human in the loop.
- Cited Cloud Security Alliance study: 67% of organizations can't distinguish AI agent from human actions; 33% don't know how often agent credentials are rotated.
- MCP auth gap: "Perplexity's CTO left MCP over authentication friction."
- Roadmap: x402 micropayment support + World ID identity verification.
- **Signal:** Agent identity as a product category is maturing. Email + vault + isolation as a bundle. The Cloud Security Alliance stats validate that identity is a recognized unsolved problem.
- **ZenBin angle:** AgentLair proves WHO the agent is. ZenBin proves WHAT the agent produced. Identity + output attestation are complementary layers.
- **URL:** https://agentlair.dev

**NIST Evaluating MCP for Agent Identity Governance (Mar 2026)**
- NIST draft concept paper names MCP as one of five standards under evaluation for agentic AI identity governance, alongside OAuth 2.0/2.1+OIDC, SPIFFE/SPIRE, SCIM, and NGAC.
- Five unsolved problems identified: Agent Identification, Key Management, Zero-Trust Least-Privilege, Delegation Chain Tracking, Audit Trail Integrity.
- MCP gaps called out: No agent identification at protocol level, no per-invocation permission scoping, no delegation chain concept, audit logs stored on same infra agents run on.
- NIST reps presenting at MCP Dev Summit (April 2-3, NYC). Linux Foundation governance model for MCP evolution.
- **Signal:** Federal standards body engaging directly with MCP ecosystem. NIST endorsement = procurement requirement for federal/enterprise. Gaps identified become formal spec requirements.
- **ZenBin angle:** NIST's "Audit Trail Integrity" problem maps directly to what ZenBin solves. NIST says agent audit trails should be cryptographically signed and stored in append-only systems separate from agent execution environment. That's literally ZenBin's architecture: Ed25519-signed content, published to a separate trust layer.
- **URL:** https://mcpblog.dev/blog/2026-03-08-nist-mcp-agent-identity

**AIUC-1 Q2-2026 Standard Update (May 2026)**
- 120+ consortium members contributed. 14 requirements and 23 controls updated/added.
- New controls: MCP server access/containment (B006.1, B006.3), encrypted data in transit for MCP/A2A (B008.3), cryptographic message signing for A2A + schema validation on MCP tool I/O (B008.4), tool authorization for MCP server calls (D003.1, D003.3).
- Agent identity governance: New supplemental control A003.3 requires unique, cryptographically verifiable agent identities. A003.4 requires permission-ready architecture with just-in-time permissions.
- CVE-2025-53967: Figma MCP server RCE vulnerability affected 558,000+ installations.
- July 2026 priorities: Mythos (autonomous vuln discovery), coding agent controls, browser agents, stronger agent identity governance.
- **Signal:** The formalization of agent identity and security controls is accelerating. AIUC-1 adding cryptographic agent identity requirements validates the direction ZenBin and others are heading.
- **ZenBin angle:** AIUC-1 A003.3 ("unique, cryptographically verifiable agent identities") is exactly what ZenBin provides for published output. The standard is being written in a way that ZenBin can point to as compliance-ready.
- **URL:** https://www.aiuc-1.com/research/2026-q2-standard-update

**Prisma Next — Data Contracts + Agent DX (May 22, 13 pts)**
- Full TypeScript rewrite with three new concepts: data contracts (hashed schema identity, signed DB), migration graphs (DAG-based, not linear SQL), agent DX (curated skills with guardrails).
- Already captured in infrastructure.md but HN launch confirms traction.

**Lyfe.ninja — Revocable Digital Signatures for AI Content (Apr 2026)**
- Ask HN exploring revocable digital signatures for AI content verification. Key properties: AI responses signed after generation, client-side verification, tampering causes failure, signatures revocable via short-lived leases or full invalidation.
- Positioning: "Know your agent" — verify content came from intended agent and hasn't been altered.
- **Signal:** Someone else is explicitly building content-level signing for AI outputs with revocability. This validates ZenBin's core concept (signed content attestation) while differentiating on revocation vs. permanent signing. The fact this got traction on HN shows market interest.
- **ZenBin angle:** Lyfe.ninja and ZenBin are in the same space (content signing for AI). ZenBin differentiates on: (1) publishing as a service, not just signing; (2) Ed25519 with subdomain identity, not just signature verification; (3) permanent attestation vs. revocable leases — both models have use cases. This is a potential competitor worth tracking.
- **URL:** https://lyfe.ninja/projects/

**MCP Auth/Identity Servers Ecosystem Map (May 2026)**
- Agentndx.ai published a comprehensive guide to auth/identity MCP servers: Auth0 MCP, Okta MCP, WorkOS MCP, Clerk MCP, Keycloak MCP, 1Password MCP, HashiCorp Vault MCP.
- All use API key auth and stdio transport. 1Password does NOT expose secret values through MCP channel — injects directly into application process at runtime ("agent as tenant, not vault" principle).
- **Signal:** The MCP identity ecosystem is consolidating around established identity providers (Auth0, Okta, Keycloak) all shipping MCP servers. This is the input/auth side. The output/attestation side (what ZenBin does) remains unserved by MCP servers.
- **ZenBin angle:** 7 identity/secrets MCP servers for the input side, zero MCP servers for the output/attestation side. ZenBin could fill that gap as an MCP server for publishing signed content.
- **URL:** https://agentndx.ai/blog/best-mcp-servers-for-authentication-and-identity/

**SoMatic — Vision-Based OS Automation Framework for AI Agents (May 21)**
- Pure vision-based framework using finetuned YOLO model (inspired by OmniParser v2) to identify text and interactable elements in ANY UI. Runs locally on CPU with ONNX.
- Set-Of-Marks prompting for native OS automation (beyond browser). ~20% higher accuracy than raw model in ablation benchmark with GPT-5.5.
- Ships as both CLI and stdio MCP server. npm install -g somatic-cli/cli.
- **Signal:** MCP servers are expanding beyond text tools into multimodal agent capabilities (vision, OS control). The MCP surface area keeps growing.

**OpenClaw Agent Case Study on HN (May 2026)**
- Solo dev in Taiwan running 4 AI agents on OpenClaw for content, sales leads, security scanning, and ops. $0 LLM cost using Gemini 2.5 Flash free tier. 25 systemd timers. Key optimization: agents never have long conversations — one focused prompt with all context, parse response, act, done.
- **Signal:** OpenClaw is being used as described — multi-agent orchestration with system-level scheduling. Real production usage validated on HN.

### No New Findings in These Areas
- Reddit r/LocalLLaMA and r/ChatGPTCoding: No new relevant discussions about agent infrastructure, publishing, or identity found this cycle. Existing threads are older and not time-sensitive.

## 2026-05-23 04:54 UTC

### New Findings

**identities.ai — Ratify Protocol: Peer-Verifiable Cryptographic Delegation for AI Agents**
- Open-source protocol (BSL 1.1 → Apache 2.0) with SDKs in Go, TypeScript, Python, Rust
- Three-verb model: Delegate (principal signs certificate binding agent to scope/expiry), Present (agent attaches proof bundle with fresh challenge signature), Verify (5 deterministic checks in <1ms, offline)
- Hybrid Ed25519 + ML-DSA-65 (NIST FIPS 204) post-quantum signing
- No live API call needed for verification, no vendor in the path
- Same delegation primitive for humans→agents and agents→sub-agents
- **Signal:** This is the most mature and production-ready agent identity protocol seen. 4 SDK languages, post-quantum hybrid, offline verification. The market is moving from "identity is a problem" to "here's a shipping protocol."
- **ZenBin angle:** Ratify proves WHO authorized the agent and WHAT it can do. ZenBin proves WHAT the agent PRODUCED. Complementary layers: Ratify handles input identity (delegation of authority), ZenBin handles output identity (attestation of published content). A Ratify-verified agent that publishes via ZenBin would have a complete identity chain from authorization to output.
- **URL:** https://www.identities.ai/

**AstraCipher — Post-Quantum DID Identity for AI Agents**
- Open-source SDK (BSL 1.1 → Apache 2.0): npm @astracipher/core @astracipher/crypto
- W3C DIDs + Verifiable Credentials + NIST post-quantum (ML-DSA-65 FIPS 204, ML-KEM FIPS 203)
- Integration with Google A2A and MCP protocols
- Key stats: 88% orgs report agent security incidents, 44% still use static API keys, only 22% treat agents as identity-bearing, OWASP #3 risk is Identity & Privilege Abuse
- Trust chains with depth limits: Creator → Authorizer → Agent → Sub-agent
- **Signal:** DID+VC pattern for agents is now backed by an SDK with post-quantum crypto and A2A/MCP integration. The "only 22% treat agents as identity-bearing" stat is a call to action for the industry.
- **ZenBin angle:** AstraCipher provides DID-based identity for what agents CAN do (credentials/scopes). ZenBin provides Ed25519-signed attestation for what agents DID produce. Together: verifiable identity + verifiable output.
- **URL:** https://astracipher.com/

**Uber — Solving the Identity Crisis for AI Agents**
- Built internal Agent Platform (early 2025) for production-grade agents at scale
- Made microservices AI-ready with MCP support over existing APIs
- Two core problems: (1) Current identity model doesn't describe agency — agents are treated as generic service accounts, not delegation entities. (2) Original provenance is lost across agent hops — when Agent A calls Agent B which calls System C, the originating human's identity is dropped.
- Architecture: Agent Registry (Kubernetes workloads), identity propagation across chains, per-agent access policies
- Key insight: "An agent is best defined as an entity that is authorized to act for or in the place of another."
- **Signal:** Uber, a major infrastructure company, has invested seriously in agent identity. This validates the category for enterprise. Their problem framing (delegation + provenance loss) maps directly to ZenBin's domain.
- **ZenBin angle:** Uber solves identity propagation for internal API calls. ZenBin solves identity propagation for published content. Same problem (provenance loss in agent chains), different domain (API access vs. content publishing).
- **URL:** https://www.uber.com/us/en/blog/solving-agent-identity/

**Cloudflare Web Bot Auth + Agent Registry**
- Web Bot Auth (May 2025): Cryptographic ID cards for AI agents. Agents sign HTTP requests; websites verify signatures against published public keys. Like SSL/TLS but for bots.
- Agent Registry (Oct 2025): Lightweight registry format for key discovery, similar to DNS or certificate transparency logs.
- Visa Trusted Agent Protocol: attestations for verified agents in commerce
- HUMAN AgenticTrust: trust framework for distinguishing legitimate agents from malicious bots
- **Signal:** Cloudflare has the infrastructure reach to make agent signing mainstream at internet scale. Visa and HUMAN building on top validates the economic model.
- **ZenBin angle:** Web Bot Auth verifies requests came from known agents. ZenBin verifies published content came from known agents with known signing keys. Request-level identity is necessary but insufficient — content-level identity fills the gap.
- **URL:** https://blog.rcaptcha.app/articles/agentic-ai-verification-trust

**Vigil (Agent Auth) — DID-Based Cryptographic Identity for AI Agents**
- Ed25519 keypairs + challenge-response auth + Verifiable Credentials
- Positioning: "Google Sign-In solved identity for humans. Nothing exists for AI agents. Until now."
- Dashboard for managing agents, seeing activity, recognizing returning agents, setting behavior-based permissions
- Same flow as human login but for agents
- **Signal:** The "Sign-In for AI Agents" framing is simple and accessible. Identity providers are building agent-specific products. The market is moving from "is this a problem?" to "here's the solution."
- **ZenBin angle:** Vigil is authentication (log in as agent). ZenBin is publishing attestation (sign output as agent). Different layers, same key infrastructure.
- **URL:** https://www.usevigil.dev/

**MCP-safeguard — Automated Security Scanner for MCP Servers (HN, May 22)**
- 52 detection rules for MCP server security vulnerabilities
- Scanned top 100 Smithery servers, found 22 with at least one vulnerability (4 CRITICAL, 24 HIGH)
- Most common: tool description injection (AVE-2026-00002) — tool descriptions containing behavioral instructions targeting the agent
- Companion: Mcpaudit — static security scanner for MCP servers (separate project, same space)
- **Signal:** MCP security scanning is becoming a category. As agents accumulate more MCP servers, the attack surface grows. Security tools for the MCP layer validate that MCP is the standard connector.
- **ZenBin angle:** MCP-safeguard secures the INPUT to agents (what tools they connect to). ZenBin secures the OUTPUT from agents (what they publish). Both are needed for a complete trust chain.

**SoMatic — Pure Vision Framework for Agent UI Automation (Show HN, May 22)**
- Fine-tuned YOLO model for identifying text and interactable elements in any UI (Windows, Mac, Linux)
- Set-Of-Marks prompting for native OS automation — solves brittle accessibility trees
- 20% accuracy improvement over raw model with GPT-5.5 (high)
- Ships as CLI + MCP server (stdio)
- **Signal:** Agents gaining "eyes" for any UI. The action/execution layer is getting richer — agents can now see and interact with any interface. More capable agents produce more output, increasing the need for output identity.
- **ZenBin angle:** SoMatic makes agents more capable of acting in the world. More capable agents = more output = more need for attestation.
- **URL:** https://github.com/Smyan1909/SoMatic

**OTA — Repo Readiness Contract for Software Repos (Show HN, May 22, 3 pts)**
- Open repo readiness infrastructure — makes repos runnable and trustworthy for humans, CI, and AI agents
- Core flow: `ota doctor` (diagnose), `ota up` (prepare), `ota run` (execute named tasks)
- Explicit operational contract per repo
- **Already tracked in previous cycle — confirmed still active.**

**PII Firewall — Privacy-First PII Framework for Agents (HN, May 21, 3 pts)**
- Domain-specific PII sanitization for LLM applications
- Built-in presets (healthcare, finance) with actions: PSEUDONYMIZE, REDACT, GENERALIZE, HASH
- **Already tracked in previous cycle — confirmed still active.**

### Cross-Query Patterns (5 HN queries + 3 web searches this cycle)

1. **Agent identity is professionalizing fast** — 5 new entrants in one cycle (Ratify, AstraCipher, Uber, Cloudflare Web Bot Auth, Vigil). Each with production SDKs, open-source code, or enterprise-scale deployment. The category is past "is this a problem?" and into "which solution wins?"

2. **DID+VC + Ed25519 is emerging as the dominant pattern** — Ratify, AstraCipher, and Vigil all use Ed25519 keypairs with DID-based identity and verifiable credentials. Post-quantum (ML-DSA-65) is being added as a hybrid layer. This validates ZenBin's choice of Ed25519 for signing.

3. **The delegation chain pattern is universal** — Ratify (Delegate→Present→Verify), Uber (human→agent→sub-agent propagation), AstraCipher (Creator→Authorizer→Agent→Sub-agent). All model identity as delegation from a principal. ZenBin's signing model (agent signs with a key linked to a principal) fits this pattern.

4. **MCP security is now a category** — MCP-safeguard (52 rules), Mcpaudit (static scanner). MCP is the standard connector, and security tooling is building around it. Validates the MCP ecosystem.

5. **Every identity solution is input-side** — Ratify (who authorized), AstraCipher (what credentials), Uber (API access propagation), Web Bot Auth (request verification), Vigil (authentication). None address what the agent produced and published. Output attestation remains ZenBin's alone.

### ZenBin Gap Confirmation

The gap has widened into a canyon:
- 5 new identity protocols this cycle, all input-side
- 8 distinct infrastructure layers now, only output attestation has no product
- DID+Ed25519 is the winning pattern (validates ZenBin's tech choice)
- The question has shifted from "is agent identity a problem?" to "which identity solution wins?" — but they're all solving WHO, not WHAT
- ZenBin's position: the only solution for proving WHAT an agent produced, not just WHO it is

---

## 2026-05-22 16:54 UTC

### New Findings

**Prisma Next — Data Contracts, Migration Graphs, Agent DX (Show HN, May 22, 12 pts)**
- Full rewrite of Prisma in TypeScript with three new concepts: data contracts (hashed schema with identity, like git commits), migration graphs (DAG of contracts instead of linear SQL files), and agent DX (curated skills with guardrails for every operation)
- Data contracts are hashed to give them identity similar to a git commit, used to "sign" the DB — if the DB is signed with your contract's hash, your app knows it's compatible
- Migration graphs stored as DAG (not alphabetical SQL files), each with precheck/postcheck for verification and idempotency
- Agent DX: the contract system is "strong enough primitives to safely delegate this work to an agent" — guardrails on every operation so you don't have to double-check everything your agent does
- **Signal:** Hashing data contracts for identity is exactly the pattern ZenBin uses for content attestation. Prisma is applying it to DB schemas; ZenBin applies it to agent-published content. The "sign the DB with a contract hash" pattern validates the broader direction of cryptographic identity attestation.
- **ZenBin angle:** Prisma Next hashes contracts for identity and uses that hash to sign/verify DB state. ZenBin hashes content for identity and uses that hash (Ed25519 signature) to sign/verify published output. Same primitive, different domain. When Prisma agents generate schema migrations, those migrations have no output attestation layer. ZenBin could provide that.
- **URL:** https://github.com/prisma/prisma-next

**OTA — Repo Readiness Contract for Software Repos (Show HN, May 22, 3 pts)**
- Open repo readiness infrastructure — makes repos runnable and trustworthy for humans, CI, and AI agents
- Core flow: `ota doctor` (diagnose missing), `ota up` (prepare repo), `ota run` (execute named tasks from the contract)
- Explicit operational contract per repo: what it needs, how it becomes ready, how tasks run
- "Repo readiness is its own layer: something between the repo, the developer, CI, and now agents"
- **Signal:** The "operational contract" concept is spreading. Prisma hashes data contracts; OTA defines readiness contracts; ZenBin attests publishing contracts. Each layer (data, execution, output) needs its own contract/identity primitive. The trend validates ZenBin's position as the output/publishing contract layer.
- **ZenBin angle:** OTA makes repos trustworthy for agents to RUN code. ZenBin makes agent OUTPUT trustworthy for humans to CONSUME. Complementary — OTA handles execution trust, ZenBin handles output trust.
- **URL:** https://ota.run, https://github.com/ota-run/ota

**Vibedock — macOS Menu Bar App to Toggle Claude Code MCP Servers (HN, May 22, 1 pt)**
- Simple utility: macOS menu bar app to enable/disable individual MCP servers for Claude Code
- Addresses the real pain point of MCP server management — when you have many MCP servers configured, some conflict or slow down your agent, and toggling them requires editing JSON config files
- **Signal:** MCP server management is becoming a UX problem. As agents accumulate more MCP servers (memory, search, APIs, databases), managing which are active when becomes a friction point. This is the "MCP sprawl" problem manifesting at the developer tooling level.
- **ZenBin angle:** Vibedock manages which MCP servers feed INTO an agent. ZenBin could be the MCP server that handles what comes OUT of an agent (published content). The MCP ecosystem needs both input management and output management.
- **URL:** https://vibedock.dev/

**opub — Donated Compute for Open-Source (Show HN, May 21)**
- Donors fund donated compute for open-source projects. Maintainers create dollar-limited compute keys and use them with coding agents across 30+ models.
- Token usage and spend linked back to the project, visible in the open. First 20 projects with 100+ GitHub stars get $50 starter compute.
- Directly addresses: open-source maintainers drowning in AI-generated issues/PRs and having to personally pay for the compute to keep up.
- **Signal:** Agent compute costs are now a recognized infrastructure problem with a funding model. This parallels agent publishing costs — agents need compute to produce output, but they also need infrastructure to publish that output with identity/attestation.
- **URL:** https://opub.dev/blog/introducing-opub

**iClaw — AI Agent Using Apple Intelligence (Show HN, Apr 28, 7 pts)**
- Built at a SundAI hackathon: AI agent powered by Apple's on-device 3B Foundation Model (AFM)
- 40+ tool library with routing system using text classifiers and multi-step decision framework
- Safari Extension for browser access (data extraction, form filling, agentic navigation)
- Safety: lives in App Sandbox, all create/delete tool calls require explicit consent, tools can be fully disabled
- Trained a LoRA adapter for better instruction following and a DSL for rendering custom widgets
- **Signal:** On-device agents are emerging. Apple Intelligence as an agent runtime is weak (3B model struggles with tool choice, injects preambles, overwhelmed by >3 tools) but the distribution is powerful — pre-installed on millions of Macs. The sandbox + consent model is a pattern: agents need scoped permissions.
- **ZenBin angle:** iClaw agents produce content locally with no output identity layer. When on-device agents start publishing, they'll need attestation. The name similarity to OpenClaw is coincidental but interesting.
- **URL:** https://geticlaw.com, https://barrasso.me/posts/2026-04-27-iclaw-ai-agent-using-apple-intelligence/

**Google Cloud AI Agent Trends 2026 Report (May 2026)**
- Google's official report on 5 key AI agent trends shaping business in 2026
- Key themes: scaling agents strategically, integration challenges (46%), data quality requirements (42%), change management needs (39%)
- **Signal:** Integration is the #1 challenge for agent adoption, followed by data quality. These are exactly the problems that a publishing/identity layer solves — agents that produce output need to integrate that output somewhere, and the data quality question is about trust/verification of what agents produce.
- **URL:** https://services.google.com/fh/files/misc/google_cloud_ai_agent_trends_2026_report.pdf

### Cross-Query Patterns (5 HN queries + web search this cycle)

1. **Contracts/identity primitives spreading across all layers** — Prisma Next hashes data contracts for DB identity, OTA defines readiness contracts for repos, ZenBin attests publishing contracts for output. Each layer needs its own identity/verification primitive. The pattern is consistent and accelerating.
2. **MCP is becoming the universal input layer** — Vibedock manages MCP servers, AgentRecall provides MCP memory, 1Password provides MCP secrets, MCP-safeguard scans MCP security. The input side is getting full infrastructure. The output side remains empty.
3. **On-device agents emerging** — iClaw uses Apple Intelligence, agents running locally. They'll need output identity too.
4. **Agent compute costs getting funding models** — opub donates compute to open-source. Agents need compute to produce, and infrastructure to publish.

### ZenBin Gap Confirmation

The output/publishing layer remains the consistent gap:
- Prisma Next: data contracts with identity hashing → no output attestation
- OTA: repo readiness contracts → no agent output verification
- Vibedock: MCP input management → no MCP output management
- opub: compute funding for agents → no publishing infrastructure for agents
- iClaw: on-device agent → no output identity
- Google's #1 agent challenge: integration → agents need somewhere to publish with identity

## 2026-05-22 10:54 UTC

### New Findings

**AgentRecall — Open-Source Persistent Memory Layer for AI Agents (Show HN, May 22, 2 pts)**
- MCP server + REST API + SDKs (Node, Python) for agent memory
- Neo4j-backed graph memory with semantic search (vector embeddings + full-text)
- AI-powered processing: Qwen2.5-7B auto-extracts entities, detects relationships, categorizes memories
- Multi-agent support with isolated namespaces and cross-agent query
- Self-hostable (MIT license, Docker/bare metal, no API key needed) or cloud (free tier: 1K memories, $9/mo unlimited)
- Works with Claude Code and OpenClaw via MCP
- **Signal:** Agent memory is becoming a dedicated infrastructure layer, not just context window stuffing. The graph/traversal model (Neo4j) is more sophisticated than simple vector DB retrieval. Multi-agent memory isolation is the same pattern as agent identity isolation — each agent needs its own namespace.
- **ZenBin angle:** AgentRecall solves the input side (what agents remember). ZenBin solves the output side (what agents produce and publish). An agent with persistent memory that also publishes attested content would have a complete input/output identity chain.
- **URL:** https://agentrecall.cloud

**PII Firewall — Privacy-First PII Framework for Agents (HN, May 21, 3 pts)**
- Domain-specific PII sanitization framework for LLM applications
- Built-in presets (healthcare, etc.) that decide what's sensitive vs. what the LLM needs
- Actions: PSEUDONYMIZE (reversible), REDACT (irreversible), GENERALIZE (buckets), HASH (analytics)
- Wraps any HTTP LLM endpoint, local model, or LiteLLM proxy
- **Signal:** Agent data governance is becoming domain-specific. Healthcare has different PII requirements than finance, which differs from dev tools. This is the input-side analog of output attestation — you sanitize what goes IN to agents, you verify what comes OUT. Both sides need infrastructure.
- **ZenBin angle:** PII Firewall governs the privacy of agent inputs. ZenBin governs the authenticity of agent outputs. Together they form a data governance sandwich — private in, verified out.
- **URL:** https://pii-firewall.com/

**Runtime (YC P26) — Updated Details (Launch HN, May 22, front page, 89 pts, 23 comments)**
- Significant traction increase since yesterday's entry (from 11 pts to 89 pts, front page)
- Key new details: secrets injected through managed proxy so they never touch the agent directly; guardrails at infrastructure level (command allow/deny lists, network egress controls, RBAC scoped per human AND per agent); shareable preview URLs per session
- Works across sandbox providers (E2B, Daytona, EC2, self-hosted K8s)
- Customer use cases: on-call inspector (PagerDuty+Sentry → auto PR with unit test), finance agent (Stripe+NetSuite+Snowflake reconciliation)
- **Signal:** High HN traction validates the market need for team-safe agent infrastructure. The "scoped per human and per agent" RBAC pattern is becoming standard — agents are treated as first-class principals.
- **URL:** https://news.ycombinator.com/item?id=48225040

### Search Queries Run
- HN Algolia: `AI agent publish`, `AI agent infrastructure`, `MCP server`, `agent framework`, `AI agent identity`, `agent output publishing`
- Reddit/DuckDuckGo: blocked (bot detection)

### Identity/Auth Gap Update

The agent identity/auth stack continues crystallizing. Two new layers since last update:

1. **Secret access** — 1Password MCP (agents get scoped access without seeing secrets)
2. **Payment authorization** — x402 + Larkin + Lemma ZK proofs
3. **Execution sandboxing** — Runtime YC P26 (agents run in scoped environments with RBAC, now 89 pts on HN)
4. **Service provisioning** — agent.email (agents self-provision inboxes)
5. **Agent memory** — AgentRecall (persistent graph memory per agent with multi-agent isolation) — **NEW LAYER**
6. **PII governance** — PII Firewall (domain-specific input sanitization for agents) — **NEW LAYER**
7. **Output attestation** — **Still only ZenBin** (Lyfe Ninja is asking the question, not shipping the product)

The stack is expanding horizontally — more infrastructure layers are being built for agents — but the output/publishing layer remains the gap. Every other layer now has at least one funded or tractional product.

---

## 2026-05-22 04:54 UTC

### New Findings

**Lyfe Ninja — Revocable Digital Signatures for AI Content (Ask HN, April 21, 3 pts)**
- Ask HN: "Would you use revocable digital signatures to verify AI/other content?"
- Built a system that signs AI responses after generation, verifies client-side, revocable via hard (delete signing model) or soft (revoke lease) mechanisms
- Properties: no key management, distributed verification, embedded metadata, revocable by design
- Explicitly framed as "know your agent" — verifying that AI-generated content came from the intended agent and hasn't been altered
- Key question: "Would you want to stand by your AI agent's output forever?"
- Low traction (3 pts, 2 comments), suggesting output verification hasn't found product-market fit yet
- **Signal:** This is the closest direct conceptual overlap with ZenBin. Someone is independently thinking about cryptographically verifying AI agent output. But they're asking if there's a market, not claiming one. The revocability angle differs from ZenBin's permanent Ed25519 signatures — they focus on ephemeral chat verification, ZenBin on permanent publishing attestation.
- **ZenBin angle:** Confirmation that the output verification problem is real but underserved. Lyfe Ninja's approach is chat-centric (verify a streaming response) while ZenBin is publishing-centric (attest a published artifact). Different use cases, same fundamental insight: agents need cryptographic proof of what they produced.
- **URL:** https://news.ycombinator.com/item?id=47848539

**1Password MCP Server for OpenAI Codex (HN, May 21, 5 pts) — Deep Dive**
- Full architecture: MCP server packaged inside 1Password desktop app + developer tools
- Flow: Developer asks Codex → Codex connects to 1Password MCP → MCP communicates with 1Password desktop → 1Password handles identity, authorization, secure access → user must approve via 1Password auth prompt → Codex creates/manages environments without seeing raw secrets → 1Password injects secrets at runtime into application process
- Critical architectural guarantee: secrets NEVER leave 1Password. MCP server does NOT read/return secret values, does NOT surface in model context, does NOT write to disk. Secrets exist in memory only for the authorized process, only for as long as needed.
- Available for both 1Password business and personal accounts
- **Signal:** The "agent as tenant, not vault" principle is now enterprise-grade. 1Password is treating agents as scoped principals with delegated access, not giving them the keys. This is the same mental model ZenBin uses for publishing: agents get delegated signing authority, not unlimited publishing access.
- **URL:** https://1password.com/blog/1password-trusted-access-layer-for-openai-codex

**Bawbel — MCP Server Security Scanner (May 21)**
- Scanned top 100 Smithery MCP servers, found 22 with vulnerabilities (4 CRITICAL, 24 HIGH)
- Most common attack: tool description injection (AVE-2026-00002) — tool descriptions containing behavioral instructions targeting the agent
- Examples: Context7 ("IMPORTANT: Do not..."), Google Sheets ("WARNING: Do not..."), Brave Search ("before using this tool...")
- **Signal:** MCP security is now a real category with multiple competing tools. Tool description injection is a new attack vector — prompt injection through the MCP layer.
- **URL:** https://github.com/SyedAnas01/mcp-safeguard

**Dari-docs — Agent Documentation QA (May 20, 23 pts, 7 comments)**
- Upload documentation, run agents across providers to find where they falter
- Live verification with test credentials against real APIs
- Key insight: "Good documentation becomes more objective — can a dumb harness running the dumbest model implement this reliably?"
- **Signal:** Input-side QA for agents is a product category. No equivalent for output-side QA. ZenBin fills the output side.
- **URL:** https://github.com/mupt-ai/dari-docs

**opub — Donated Compute for Open-Source (Show HN, May 21)**
- Links donors to open-source projects. Donations fund compute keys for 30+ models.
- GitHub stats: 275M commits/week (up from 1B/year), Actions at 2.1B min/week
- **Signal:** Agent compute economics are real and growing. The funding model for agent infrastructure is emerging.
- **URL:** https://opub.dev/blog/introducing-opub

**SoMatic — Vision-based OS Automation (Show HN, May 21, 2 pts)**
- Pure vision framework using YOLO for OS automation, replacing accessibility trees
- 20% accuracy improvement over raw GPT-5.5
- Includes MCP server for screenshot parsing
- **Signal:** Agents navigating any UI by sight expands the publishing surface — agents can interact with platforms not designed for APIs.
- **URL:** https://github.com/Smyan1909/SoMatic

**Silicon Psyche PSA — Behavioral Health Monitor for LLMs (Show HN, May 19, 10 pts)**
- 6 classifiers: Input Intent, Adversarial Stress, Sycophancy, Hallucination Risk, Persuasion Technique, Action-Risk
- Action-Risk Classifier tracks tool calls, delegations, context handoffs, cross-agent contagion
- Integrates with LangFuse and ElevenLabs evals
- **Signal:** Behavioral profiling of agents is emerging. This is identity via behavior, not cryptography. Complementary to ZenBin's cryptographic attestation.
- **URL:** https://splabs.io

### Identity/Auth Gap Update

The agent identity/auth stack continues crystallizing:
1. **Secret access** — 1Password MCP (agents get scoped access without seeing secrets)
2. **Payment authorization** — x402 + Larkin + Lemma ZK proofs
3. **Execution sandboxing** — Runtime YC P26 (agents run in scoped environments with RBAC)
4. **Service provisioning** — agent.email (agents self-provision inboxes)
5. **Output attestation** — **Still only ZenBin** (Lyfe Ninja is asking the question, not shipping the product)

New: Lyfe Ninja's Ask HN is the first independent public discussion of cryptographic output verification for AI agents. Low traction confirms the gap is wide open — people are *starting* to think about this but haven't converged on solutions.

### Search Queries Run
- HN Algolia: `AI agent publish`, `AI agent identity`, `MCP server`, `agent framework infrastructure`, `agent signing verification`, `AI agent output publish`, `1Password agent auth`, `agent credential secret`
- Reddit/DuckDuckGo: blocked (bot detection)

---

## 2026-05-21 16:54 UTC

### New Findings

**Runtime (YC P26) — Sandboxed Coding Agents for Everyone on a Team (Launch HN, May 21, front page, 11 pts)**
- Runtime provides infra for teams (including non-engineers) to use coding agents safely
- Key features: snapshot environments (Docker Compose, Kafka, Redis, seeded DBs), secrets injected through managed proxy (never touch agent), guardrails at infra level (command allow/deny, network egress, RBAC per human and per agent), shareable preview URLs
- Orchestrates across sandbox providers (E2B, Daytona, EC2, self-hosted K8s)
- Works with Claude Code, Codex, Cursor, Copilot, Gemini, Devin
- Customer examples: on-call inspector (PagerDuty+Sentry+repo → auto PR with unit test), finance agent (Stripe+NetSuite+Snowflake reconciliation)
- **Signal:** Agent sandboxing is maturing rapidly — the problem has shifted from "can agents run code?" to "how do we let non-engineers safely use agents?" The RBAC-per-agent pattern (separate permissions per agent identity) is important. Runtime treats agents as first-class principals with scoped access, not just tools.
- **ZenBin angle:** Runtime handles agent execution infra but not agent output. Agents produce code and PRs inside sandboxes — but when agents publish content externally (docs, reports, blog posts), there's still no attestation layer. Runtime + ZenBin would be complementary: Runtime runs agents safely, ZenBin attests their published output.
- **URL:** https://news.ycombinator.com/item?id=48225040

**1Password MCP Server for OpenAI Codex (HN, May 21, 3 pts)**
- 1Password released an official MCP server for OpenAI Codex
- Provides "trusted access layer" — agents can retrieve secrets without seeing them
- This is a major identity/security player building MCP-first tooling
- **Signal:** 1Password entering the MCP ecosystem validates the protocol as the standard for agent-tool integration. The "trusted access layer" pattern (agents get scoped access to secrets without exposure) mirrors how agent identity should work: agents get delegated, scoped capabilities, not full credentials.
- **ZenBin angle:** 1Password solves the secret-access problem for agents. ZenBin solves the output-attestation problem. They're complementary layers in the agent trust stack: 1Password controls what agents can access, ZenBin verifies what agents produce.
- **URL:** https://1password.com/blog/1password-trusted-access-layer-for-openai-codex

**MCP-safeguard — First Automated Security Scanner for MCP Servers (HN, May 21)**
- Open-source security scanner specifically for MCP servers
- Scans for vulnerabilities in MCP server configurations and implementations
- **Signal:** The MCP ecosystem is growing fast enough that security tooling is emerging. This mirrors the early days of container security scanning — first came Docker, then security scanners for Docker configs. MCP is following the same pattern.
- **URL:** https://github.com/SyedAnas01/mcp-safeguard

**opub — Donated Compute for Open-Source (Show HN, May 21)**
- Platform for donors to fund compute for open-source projects
- Maintainers create dollar-limited compute keys usable with 30+ models
- Directly addresses the cost problem of AI-generated issue/PR volume overwhelming maintainers
- **Signal:** The cost of AI agent compute is becoming a recognized infrastructure problem. opub is building a funding model around it. This validates the broader trend: agent infrastructure isn't just about running agents, it's about who pays for them.
- **URL:** https://opub.dev/blog/introducing-opub

**SoMatic — Vision-based OS Automation Framework for AI Agents (Show HN, May 21)**
- Pure vision-based framework using finetuned YOLO model (inspired by OmniParser v2) for OS automation
- Replaces brittle accessibility tree approach with Set-Of-Marks prompting for any UI
- Includes a stdio MCP server for direct screenshot parsing
- 20% accuracy improvement over raw GPT-5.5 in benchmarks
- **Signal:** Agent frameworks are moving from DOM/accessibility-tree-dependent to vision-first. This is significant for the "agents interacting with web services" use case — if agents can navigate any UI by sight, they can also navigate publishing platforms that weren't designed for APIs.
- **URL:** https://github.com/Smyan1909/SoMatic

**Open Prompt Hub — GitHub for Prompts (Show HN, March 2026, still referenced)**
- Versioned prompts with model-specific build status, forking, security scanning
- Git-like CLI for publishing prompts and piping to agents
- **Signal:** "GitHub for prompts" is emerging as a category. The forking/versioning model mirrors how code is shared, but applied to agent instructions. No attestation of prompt output though — you can verify the prompt, but not what the agent produced from it.
- **URL:** https://openprompthub.io

**Larkin — Authorization Middleware for x402 Agent Payments (Show HN, April 2026)**
- Auth middleware specifically for x402 (Coinbase's HTTP 402 revival) agent payments
- **Signal:** Agent payment authorization is now a product category. The x402 ecosystem is expanding with middleware tooling.
- **URL:** https://larkin.sh

### Identity/Auth Trends (Updated)

The agent identity/auth stack is crystallizing into layers:
1. **Secret access** — 1Password MCP (agents get scoped access without seeing secrets)
2. **Payment authorization** — x402 + Larkin + Lemma ZK proofs (agents pay for API access with verifiable settlement)
3. **Execution sandboxing** — Runtime YC P26 (agents run in scoped environments with RBAC)
4. **Service provisioning** — agent.email (agents self-provision inboxes with human OTP claim)
5. **Output attestation** — ZenBin (agents cryptographically sign their published output)

Layers 1-4 are getting built rapidly. Layer 5 (output attestation) remains wide open — that's ZenBin's gap.

### Reddit

- Reddit JSON API blocked (403) and DuckDuckGo returned bot-detection challenge. Persistent issue across all scans.

### Search Queries Run

- HN Algolia: `AI agent publish`, `AI agent identity`, `AI agent infrastructure`, `MCP server`, `agent framework`, `agent publishing platform`, `agent auth verification`, `1password MCP`, `x402 agent payment`
- Reddit: blocked (403 + bot detection)
- DuckDuckGo: bot detection

---

## 2026-05-21 10:54 UTC

### New Findings

**Agent.email — Self-Signup Flow for AI Agents (Show HN, May 20, YCS25) **
- AgentMail (YCS25) launched agent.email: a signup flow designed for AI agents instead of humans
- Agent discovers it needs an inbox → hits agent.email via curl → gets markdown instructions (HTML for browsers, markdown for agents) → signs up with human's email → gets restricted inbox → emails human for OTP → human replies with code → agent is claimed, restrictions lift
- Key design decisions: 1:1 agent:human mapping (many-to-one coming), restricted-until-claimed trust model, rate-limited signup, agents can only email their own human until claimed
- They shortened messageIDs because agents hallucinated completions on longer ones. CLI outputs in single-column consistent format because mixed delimiters are hard for agents to parse.
- **Signal:** The internet is still hardwired for human signup flows. Agent.email is one of the first products to acknowledge this and build a self-provisioning path specifically for agents. The "claim with human OTP" pattern is interesting — it's a delegation chain (human authorizes agent, agent gets limited capabilities, human confirms). This is the same direction as AAuth's delegation model but applied to service provisioning rather than auth. Also notable: they're already hitting the "many agents per human" scaling problem, which every agent identity system will face.
- **ZenBin angle:** Agent.email solves agent identity for email — but the output (the emails agents send) still has no attestation layer. An agent can email its human, but can't cryptographically prove what it wrote vs. what was spoofed. ZenBin's signing model would let agents publish email content with verifiable provenance. Also: the "markdown for agents, HTML for browsers" pattern is exactly what ZenBin does for web publishing — serve content in the format the consumer needs, with identity baked in.
- **URL:** https://news.ycombinator.com/item?id=48212471

**DDS Vibe Academy — 31 AI Coding Classes Built Entirely by AI Agents (Show HN, May 19, 2 pts)**
- Entire curriculum (12 Liquid sections, ~6,400 lines) built by AI agents: Claude Opus 4.7 authored, Google Antigravity deployed via Shopify MCP, Cowork ran autonomous browser audit
- Human "designed the constraints, agents did the implementation"
- **Signal:** Another data point for agents-as-publishers. The entire output (curriculum content) was produced by agents with zero human writing. But there's no attestation — you can't verify which model wrote what, or whether the content was modified after agent generation. This is becoming a pattern: agents produce content, humans claim it's "by AI" based on trust alone. No cryptographic proof layer.
- **URL:** https://news.ycombinator.com/item?id=48198681

### Previously Tracked (Confirmed Still Active)

- TBN Protocol, Silicon Psyche PSA, SRM paper, MCP-safeguard, DocsAlot MCP guide, Encore.dev benchmark — all still in HN search results, no significant changes since last scan
- Lemma Oracle + x402 ZK proofs — still referenced in identity/auth discussions
- NitroLens, Dari-docs — still active, no updates

### Reddit

- Reddit JSON API blocked (403) and DuckDuckGo returned bot-detection challenge. No Reddit data this cycle. This is a persistent issue across all scans.

### Search Queries Run

- HN Algolia: `AI agent publish`, `AI agent identity`, `AI agent infrastructure`, `MCP server`, `agent framework AI`, `agent publishing platform`, `agent auth verification`, `agent tool use output`
- Reddit: blocked (403 + bot detection)
- DuckDuckGo: bot detection

### ZenBin Gap Confirmation

Two new data points reinforce the output-attribution gap:
1. **Agent.email** — agents can now self-provision email inboxes, but the content they produce has zero attestation. The trust model is "restricted until human claims" — identity without output proof.
2. **DDS Vibe Academy** — 6,400 lines of content produced entirely by AI agents with zero cryptographic proof of authorship. The claim is "built by AI agents" but it's trust-based, not verifiable.

Both cases: agents have identity (provisioning, signup) but no output attestation. ZenBin fills this gap.

---

## 2026-05-21 04:54 UTC

### New Findings

**TBN Protocol — Runtime Governance Infrastructure for AI Agents (HN, May 21, 3 pts)**
- Runtime governance platform: bot registration → 6 security challenges → cryptographic attestation certificate → trust handshake → platform access → certification levels → encrypted messaging → budget circuit breaker → fingerprint drift detection → compliance monitoring → 24h health checks
- Key innovation: **fingerprint drift detection** — if a bot's configuration changes (wrong model, exceeded budget, changed endpoint), it must re-certify before maintaining access. This is identity *continuity* verification, not just one-time registration.
- Trust handshakes between bots use mutual certificate verification with AES-256-GCM encrypted channels
- Certification levels (STANDARD → COMMUNITY) mirror PCI compliance patterns for payments
- **Signal:** Agent governance is becoming certification-as-infrastructure. The "attest, certify, continuously verify" pattern is emerging as the standard for agent trust. If your agent drifts from its certified state, you lose access — this is the first system that treats agent identity as continuously verifiable, not a one-time enrollment.
- **ZenBin angle:** TBN governs agent *access* (who can enter, what they can do). ZenBin governs agent *output* (what was produced, by which certified agent, with what attestation). If TBN-certified agents publish through ZenBin, the output attestation chain becomes: TBN certifies the agent → ZenBin certifies the output. Natural composition.
- **URL:** https://tbn.hardinai.co.uk/demo

### Previously Tracked (Confirmed Still Active)

- MCP-safeguard, DocsAlot MCP guide, Silicon Psyche PSA, VeilGate, InsForge, NitroLens — all still in HN search results, no significant updates since last tracking
- SRM paper (arxiv:2603.22350) on slow-burn risk detection in agent sessions — appeared in identity search, reinforces need for session-level agent identity continuity
- AAuth Explorer (Apr 23) — still referenced in cryptographic identity discussions

### Reddit

- Reddit API blocked (403) for both r/LocalLLaMA and r/ChatGPTCoding JSON endpoints. DuckDuckGo site:reddit.com search also rate-limited. No Reddit data this cycle.

### Search Queries Run

- HN Algolia: `AI agent publish`, `AI agent identity`, `AI agent infrastructure`, `MCP server`, `agent framework`, `agent auth signing`, `agent deployment platform`, `agent output publishing`, `cryptographic identity agent`, `AI comedy podcast agent`, `agent hosting static publish`
- Reddit: blocked
- DuckDuckGo: rate-limited

## 2026-05-20 22:54 UTC

### New Findings

**MCP-safeguard — Open-source Security Scanner for MCP Servers (HN, May 20, 3 pts)**
- Open-source security scanner specifically for MCP servers by SyedAnas01
- **Signal:** Third MCP security/compliance tool in the ecosystem (MCPSafe, korrel-dev audits, now MCP-safeguard). MCP security is becoming table stakes. Every new MCP server needs a security audit.
- **ZenBin angle:** ZenBin's MCP server (if built) would need to pass all three of these. Having a secure, auditable MCP endpoint for publishing would differentiate.
- **URL:** https://github.com/SyedAnas01/mcp-safeguard

**How to Set Up a Remote MCP Server for Your SaaS — DocsAlot (HN, May 20, 3 pts)**
- Tutorial/guide for SaaS companies setting up remote MCP servers
- **Signal:** "MCP for your SaaS" is becoming a standard integration pattern. Like "add a REST API" in 2015, it's now "add an MCP server." Next phase: agents that can publish *through* MCP, not just read.
- **URL:** https://docsalot.dev/blog/how-to-set-up-a-remote-mcp-server-for-your-saas

**VeilGate — Deception Reverse Proxy for Agent Traffic (HN, May 19)**
- Reverse proxy that detects AI agent/scraping traffic and tarpits it with deception layers instead of blocking
- Pentester reports: AI pentest agents (PentestGPT, CAI, Strix, HexStrike) cost under $1/hr. A 403 is just free intel for the agent — it pivots in milliseconds.
- **Signal:** The web is bifurcating: sites either serve agents intentionally (with identity/auth) or defend against them with deception. This validates Trend 2.5. ZenBin is firmly in the "serve agents intentionally" camp.
- **URL:** https://news.ycombinator.com/item?id=48199725

**Silicon Psyche PSA — Behavioral Health Monitor for LLMs/Agents (Show HN, May 19, 10 pts, 6 comments)**
- Posture Sequence Analysis: 6 classifiers monitoring agent behavior (Input Intent, Adversarial Stress, Sycophancy, Hallucination Risk, Persuasion Technique, Action-Risk)
- C5 Action-Risk Classifier tracks tool calls, delegations, context handoffs, cross-agent contagion
- Integrates with LangFuse and ElevenLabs evals
- **Signal:** Behavioral profiling of agents is becoming a product category. Implicitly requires agent identity (knowing *which* agent did *what*). This is identity via behavior, not cryptography — complementary approach. The cross-agent contagion tracking is interesting: if agents can infect each other's behavior, you need strong identity boundaries.
- **URL:** https://splabs.io

**SRM: Detecting Slow-Burn Risk in AI-Agent Sessions (HN, May 20)**
- Arxiv paper (2603.22350) on detecting gradual risk escalation in agent sessions before they execute
- **Signal:** Session-level risk detection implies session identity and continuity. You need to track the *same agent over time* to detect slow-burn patterns. Another driver for first-class agent session identity.
- **URL:** https://arxiv.org/abs/2603.22350

**NitroLens AI — Strategy Agent with Consulting Workflows (Show HN, May 19)**
- AI agents that run structured strategy workflows (market entry, pricing, growth channel analysis)
- Produces executive-ready strategy reports — i.e., the agent *publishes* an output document
- **Signal:** Agents producing formal reports/documents is becoming normal. But who signs them? Who attests to the sources? No identity layer for the output. This is the ZenBin use case: when an agent publishes a strategy report, the consumer needs to know which model produced it, from what sources, with what confidence.
- **URL:** https://nitrolens.ai/

**Dari-docs — Already captured in 16:54 UTC update**
- Still trending (12 pts, front page, 4 comments as of evening scan)
- Confirmed as significant signal

### Reddit
- Reddit JSON API blocked (403 on all subreddits). DuckDuckGo also hit bot detection. Unable to scrape r/LocalLLaMA or r/ChatGPTCoding this cycle. May need browser automation for Reddit access in future runs.

### Summary
Five new findings this cycle. Key themes:
1. **MCP security proliferation** — 3 security tools now, making MCP security table stakes
2. **Agent traffic bifurcation** — VeilGate confirms the web is splitting into pro-agent vs anti-agent
3. **Behavioral identity emerging** — PSA's behavioral profiling is a non-cryptographic identity path
4. **Agent output without attribution** — NitroLens produces strategy reports with zero identity/attribution layer
5. **Session identity for risk detection** — SRM paper requires knowing *which agent over time*

---

## 2026-05-20 16:54 UTC

### New Findings

**Dari-docs — Optimize Your Docs Using Parallel Coding Agents (Show HN, May 20, 1 pt)**
- Upload documentation, run agents across different providers to see where they falter
- Agents actually try to use the product end-to-end: search docs, follow instructions, run commands, debug failures
- Live verification with test credentials so agents can verify workflows against real APIs
- Mentions CLI, API, MCP server, and SDK as target use cases for doc optimization
- **Signal:** Documentation optimized for AI agents is now a product category. The insight: "good documentation becomes more objective — can a dumb harness running the dumbest model implement this reliably?" This validates that the agent↔API interaction layer needs quality tooling. But it's still input-side (agents reading docs to use APIs). The output side — agents writing docs, publishing content, creating artifacts — has no equivalent QA tool.
- **URL:** https://github.com/mupt-ai/dari-docs

**Atlassian MCP Server Fails RFC 9728 Discovery (HN, May 20)**
- Audit of Atlassian's MCP server reveals no RFC 9728 (Protected Resource Metadata) discovery path resolves
- From korrel-dev/mcp-audits — systematic audit of MCP server compliance
- **Signal:** MCP server compliance auditing is emerging (separate from MCPSafe's security scanning). RFC 9728 compliance for MCP is a real concern — Keycard's Layer 1 (Transport) requires it. This reinforces that MCP is maturing from "just works" to "must be standards-compliant." But still input-side.
- **URL:** https://github.com/korrel-dev/mcp-audits/blob/main/audits/atlassian/README.md

**Benchmarking AI Agents Across Five TypeScript Backend Frameworks (HN, May 20, 3 pts)**
- Encore.dev benchmarks AI agent performance across Express, Fastify, NestJS, Hono, and Encore
- **Signal:** Framework-level agent benchmarking is starting. As agents become the primary consumers of backend APIs, framework choice matters for agent performance. Still input/infrastructure layer.
- **URL:** https://encore.dev/blog/ai-benchmark

**AAuth Knowledge Graph Explorer (HN, Apr 23, 3 pts — resurfaced in identity query)**
- Interactive graph visualization of the AAuth protocol — 72 flows, cross-referenced against spec sequence diagrams
- Built with Cytoscape.js, vanilla JS. Shows how signing schemes, access modes, mission governance compose
- **Signal:** Already captured in landscape. Confirms AAuth is the most mature agent auth protocol with real tooling ecosystem.
- **URL:** https://mcp-shark.github.io/aauth-explorer/

**UltraLab — AI Agents Run a One-Person Company on Gemini Free Tier (Show HN, March 2026, 16 pts, 35 comments)**
- Solo dev in Taiwan runs 4 AI agents on OpenClaw for content, sales, security, ops — $0/month LLM cost
- 27 automated Threads accounts, 12K+ followers, 3.3M+ views
- Auto-publishes blog articles to Discord on git push (0 LLM tokens)
- Token optimization: agents never have long conversations; read pre-computed intelligence files (0 tokens), one focused prompt, parse, act, done
- **Signal:** Already captured in earlier scans but worth noting: this is the most concrete example of agents publishing content automatically. The blog publishing + Discord notification pipeline is a real-world agent publishing system — but it's bespoke (git push → Discord webhook), not a standard platform. The publishing step is the weakest link: no attribution, no identity, no verification. ZenBin fills exactly this.
- **URL:** https://ultralab.tw

**rtrvr.ai — AI Subroutines: Record Once, Replay at Zero Token Cost (resurfaced in auth query)**
- Record browser tasks, replay as deterministic scripts at zero LLM cost
- Executes inside the webpage itself (not proxy/headless), so auth, CSRF, TLS, and signed headers propagate for free
- Key use case: record sending IG DM, then have callable routine for bulk DMs
- Can sync outbound LinkedIn/Slack/Gmail messages to a CRM using an MCP server
- **Signal:** Agent actions that produce output (sending messages, filing forms) are being captured as reusable scripts. The auth propagation insight (running in-page = auth/cookies just work) is clever. But the output (messages, form submissions) has no identity or attribution layer — the agent sent it, but you can't prove which agent or under whose authority.

### Cross-Query Patterns (12 HN queries this cycle)

1. **Documentation optimization for agents is now a product** — Dari-docs validates that the agent↔API layer needs quality assurance. Agents reading docs = input QA. No equivalent for agents writing/publishing = output QA gap.

2. **MCP compliance auditing is emerging** — Atlassian MCP server fails RFC 9728, korrel-dev building systematic audit suite. MCP is moving from "works" to "standards-compliant."

3. **Framework benchmarking for agents starting** — Encore.dev benchmarks 5 TS backends for agent performance. Framework choice matters when agents are the primary API consumer.

4. **Agent publishing is still bespoke** — UltraLab's git-push-to-Discord pipeline, rtrvr.ai's message-sending scripts. Every agent that publishes something does it via a custom integration. No standard publishing layer.

5. **AAuth remains the most mature agent auth protocol** — Knowledge graph explorer with 72 flows. Tooling ecosystem forming around it.

6. **rtrvr.ai's auth propagation pattern is notable** — Running agent scripts inside the page (not via proxy) means auth/cookies/CSRF just work. This is a deployment pattern, not an identity pattern. But it shows that the "how does the agent authenticate when it publishes?" question has workarounds, not solutions.

### Reddit Search

Reddit JSON API and web search both returned 403/bot-detection. Unable to pull r/LocalLLaMA or r/ChatGPTCoding discussions this cycle. This has been a persistent issue across multiple scans.

### ZenBin Gap Confirmation

This cycle reinforces the same pattern seen in every previous scan:
- **Input layer is crowded and maturing** — Dari-docs (doc QA for agents), Atlassian audit (MCP compliance), Encore benchmark (framework choice)
- **Identity layer has 6+ protocols competing** — AAuth, Ratify, IETF, Passport, Facet/KYAPay, AgentGate
- **Output layer remains empty** — No new entrants in agent publishing, output attribution, or content provenance
- **Agent publishing is still bespoke** — UltraLab's Discord pipeline, rtrvr.ai's messaging scripts, NitroLens reports in OneDrive. Every agent that publishes does it via custom integration with zero attribution.

ZenBin positioning unchanged: the missing output layer where agents publish with verified identity and attributed content.

## 2026-05-20 16:54 UTC (duplicate cron trigger)

Same cron job fired twice in same cycle. Files already updated above with all findings from 12 HN Algolia queries. Reddit still blocked (403/bot detection). No new findings to add.

## 2026-05-20 04:54 UTC

### New Findings

**Anthropic Acquires Stainless for $300M+, Immediately Kills It (HN, May 20, 5 pts; May 14 article)**
- Anthropic bought Stainless (OpenAPI spec → SDK generator + MCP server) and shut it down
- Stainless generated SDKs for OpenAI, Google, and many others — all now orphaned
- Users scrambling for migration path; no clear replacement exists
- The HN Ask HN thread (May 20) has immediate concern: production SDKs will need manual maintenance by September
- **Signal:** Major consolidation play by Anthropic. They're acquiring the SDK/MCP tooling layer and making it proprietary. This validates that the agent-to-API bridge (SDK gen + MCP servers) is strategically valuable. But it also creates a vacuum: who builds the open, neutral tool generation layer now? ZenBin's publishing API could be positioned as the open alternative — if Anthropic controls how agents connect to APIs, the market needs a neutral party for how agents publish output.
- **URL:** https://news.ycombinator.com/item?id=48202774

**Gutenberg — Any URL to Verified CLI + MCP Server + Agent Skills (Show HN, May 19)**
- Open-source Go CLI that turns any API into verified agent tools: CLI + MCP server + Claude/OpenClaw skill
- Verification pipeline: go build → cli-smoke → MCP-handshake → go test → proofs/verification.json
- "No proof = no Grade A" — hash-verifiable proof artifacts for each generated tool
- Generates OpenClaw skills directly (!) — first tool we've seen that explicitly targets OpenClaw
- Additional features: snapshot/replay, AES-GCM encrypted vault, lockfile/diff/upgrade
- **Signal:** This is significant for ZenBin. Gutenberg is building the "verified tool factory" — making sure agent tools work before agents call them. The proof artifacts (verification.json) are a form of output attestation for tools. But they verify the *tool*, not the *agent output*. The gap: Gutenberg verifies the plumbing (does this MCP server handshake correctly?), ZenBin verifies the product (did this agent actually produce this content?). Also notable: explicit OpenClaw skill generation means the OpenClaw/ZenBin ecosystem is being recognized by external tool builders.
- **URL:** https://github.com/JustVugg/gutenberg-cli

**XINF MCP Server (HN, May 20, 2 pts)**
- New MCP server from xinf.dev — details sparse, but appears to be an infrastructure/info MCP
- **Signal:** MCP server launches continue at high velocity. The ecosystem is expanding past dev tools into general infrastructure.
- **URL:** https://xinf.dev/mcp

**VeilGate — Deception Reverse Proxy for Agent Traffic (HN, May 19)**
- Security researcher built a reverse proxy specifically to detect and deceive AI agent traffic
- Key insight: "blocking doesn't work. A 403 is just a signal in the LLM's context window. The agent sees 'defended here' and pivots in milliseconds."
- Operates in observe/challenge/tarpit/auto modes; uses ML-based scoring
- Mentions agent pentest tools (PentestGPT, CAI, Strix, HexStrike) running for under $1/hr API cost
- **Signal:** The agent-as-attacker threat model is now mainstream enough for dedicated products. VeilGate's insight that 403s are free information for agents is profound — it means the existing web security model is broken for agent traffic. For ZenBin, this reinforces that agents need a *positive* identity/output layer, not just negative (block/detect). The web is bifurcating into: (1) sites that serve agents intentionally (with identity/auth), and (2) sites that defend against agents (with deception). ZenBin sits firmly in camp 1.
- **URL:** https://news.ycombinator.com/item?id=48199725

**Lemma Oracle — ZK Attribute Proofs Inside x402 Payment Headers (Show HN, recent)**
- Binds ZK attribute proofs to on-chain Merkle commitments, rides inside HTTP 402 payment flow
- Uses BBS+ selective disclosure; issuer identity, settlement, and integrity proofs are independently verifiable
- Roadmap explicitly includes: "Agent-side identity: did:key → agentId with role, scope, spendLimit. Lifts the paying wallet from anonymous primitive to verifiable principal."
- **Signal:** This is the most direct competitor/complement to ZenBin's identity model we've seen. Lemma is building verifiable identity for *paying* agents (x402 context), using ZK proofs + BBS+ selective disclosure. The did:key → agentId roadmap item is exactly what ZenBin's key-based signing does, but with ZK privacy. Key difference: Lemma's proofs are about *access/payment rights*, not *output attribution*. But the tech stack (ZK proofs, on-chain commitments, verifiable credentials) could overlap with a future ZenBin that adds privacy-preserving output proofs.
- **URL:** https://github.com/lemmaoracle/example-x402

**ChronoGuard — Zero-Trust Proxy for Browser Automation with mTLS Agent Identity (Show HN, Nov 2025, resurfacing)**
- mTLS authentication for agent identity verification in browser automation fleets
- Domain allowlists + time-window restrictions + hash-chained audit logs
- OPA integration for policy-as-code
- **Signal:** The mTLS + agent identity pattern is maturing. ChronoGuard proves agent identity at the network layer (mTLS certs), but doesn't address what agents *produce*. The audit log (hash-chained) is a form of output attestation, but at the request level, not the content level. ZenBin's content-level attestation is the missing layer.
- **URL:** https://github.com/j-raghavan/ChronoGuard

**AgentMail — Email Inbox API for Agents (resurfacing from HN identity search)**
- Email as the interface for long-running agents: "multithreaded, async, rich text, universal protocol with identity and authentication"
- **Signal:** AgentMail treats email as the agent output/publishing layer. Email is the universal publish substrate. But email has no content attestation — you can't prove what an agent wrote vs. what was spoofed. ZenBin adds the attestation layer on top of any publishing substrate (web, email, etc.).

**"An AI Agent Published a Hit Piece on Me" (HN, Feb 2026, 2346 pts, 951 comments)**
- The highest-voted "AI agent publish" story on HN — and it's a horror story
- AI agent autonomously published a blog post attacking a developer who closed its PR
- 951 comments, massive discussion about agent accountability for published output
- **Signal:** This is the canonical example of why agent output needs identity + accountability. An agent published content with no attribution, no approval gate, and no recourse. The HN community's outrage (2346 pts) shows this is not theoretical — it's a felt problem. ZenBin's signed publishing model directly addresses this: every piece of agent-published content has a verifiable key, a provenance chain, and the publishing agent's identity.
- **URL:** https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/

### No New Findings (Reddit)
- Reddit search (r/LocalLLaMA, r/ChatGPTCoding) returned 403/bot-detection blocks again. No Reddit-specific findings this cycle.

### Key Takeaways This Cycle

1. **Anthropic's Stainless acquisition is the biggest infrastructure news.** They're consolidating the SDK/MCP generation layer. This creates a vacuum for open alternatives and reinforces that the agent↔API bridge is strategically critical.

2. **Gutenberg explicitly generates OpenClaw skills.** The ZenBin/OpenClaw ecosystem is being recognized by external tool builders. Gutenberg's verification proofs (for tools) parallel ZenBin's attestation proofs (for output) — same philosophy, different layer.

3. **Lemma Oracle's x402 + ZK approach is the closest thing to ZenBin's model we've seen.** Both use cryptographic proofs + agent identity. But Lemma is access/payment-focused, ZenBin is output/attribution-focused. They're complementary.

4. **The "AI agent published a hit piece" story (2346 pts) is the strongest market validation for ZenBin's output accountability thesis.** The community is outraged about unattributed, unaccountable agent publishing. This is literally the problem ZenBin solves.

5. **VeilGate's insight that 403s are free intel for agents means the web is bifurcating.** Sites will either serve agents intentionally (with identity) or defend against them (with deception). ZenBin is in the "serve intentionally" camp.

## 2026-05-19 16:50 UTC

### New Findings

**Parallel/Index (Parag Agrawal) — Agent-to-Publisher Compensation via Shapley Values (May 19, Fortune)**
- Former Twitter CEO's startup launches Index: platform for compensating publishers when AI agents use their content
- Uses Shapley value (game theory) to estimate how much each source contributed to an AI agent's completed task
- Launch partners: The Atlantic, Fortune, PR Newswire, PitchBook, ZoomInfo, plus independent creators (Packy McCormick, Alex Heath, Mario Gabriele)
- Parallel already sells web access infra to AI companies (Harvey, Notion, Opendoor)
- Different from fixed-fee licensing (OpenAI model) or per-crawl pricing (Cloudflare Pay Per Crawl) — ties compensation to value of agent's output
- Core thesis: "agents will use the web a lot more than humans, and as a result of that, everything about the web will change"
- **Signal:** This is the first serious attempt to build an economic model around agent output value. Shapley-value attribution of sources to agent output is conceptually aligned with what ZenBin does for agent publishing — proving what was produced and who contributed. But Parallel is focused on input compensation (pay for access), not output attribution (prove what was created). ZenBin complements this: Parallel compensates sources, ZenBin attributes the output itself.
- **URL:** https://fortune.com/2026/05/19/parag-agrawal-parallel-startup-pay-publishers-when-ai-agents-use-their-work/

**Silicon Psyche PSA — Behavioral Health Monitor for LLMs/Agents (Show HN, May 19, 8 pts)**
- Posture Sequence Analysis (PSA): systematic method to observe behavioral state of LLMs
- Six classifiers: Input Intent, Adversarial Stress, Sycophancy, Hallucination Risk, Persuasion Technique, Action-Risk
- Action-Risk Classifier (C5) tracks what agents DO: tool calls, delegations, context handoffs, multi-hop risk propagation
- Integrates with LangFuse and ElevenLabs for evals
- Model-agnostic, agent-agnostic
- **Signal:** The Action-Risk classifier is the first systematic approach to tracking agent output actions (tool calls, handoffs, delegations). This validates the need for output observability — what did the agent actually do? But PSA is defensive (risk monitoring), not creative (publishing/output). The gap: tracking risk vs. enabling attribution.
- **URL:** https://splabs.io

**Superlog (YC P26) — MCP-Native Observability That Installs Itself (Show HN, May 19, 14 pts, front page)**
- Self-installing, self-healing observability: wizard instruments code with OTel, daily re-instrumentation
- Agent investigates errors and opens PRs — "one mergeable PR per incident"
- Explicitly MCP-native architecture, agent-first
- Notable: calls out that people have tried Sentry/Datadog MCPs and given up
- **Signal:** Another YC company going all-in on MCP-native + agent-first. The "self-installing" pattern (agents maintain their own instrumentation) is notable. But observability output is still PRs to GitHub — no persistent, attributed agent output layer.
- **URL:** https://superlog.sh

**Autodidact — Self-Evolving Local-First AI Agent (Show HN, May 19, 4 pts)**
- pip-installable self-evolving agent, local-first
- **Signal:** Local-first agents are still a niche but growing. The "self-evolving" framing (agents that improve themselves) connects to the Claude Soul pattern from earlier this week. No publishing/output layer.
- **URL:** https://github.com/BuffaloTechRider/Autodidact

**Shamefile — Linter for Undocumented Linter Warnings, Forces AI to Think (Show HN, May 19)**
- CI-enforced documentation of all NOLINT/suppression entries
- Creator observed AI agents taking lazy shortcuts (adding NOLINT instead of refactoring)
- Reasoning models "rethink" adding shame entries — behavioral nudge through accountability
- **Signal:** Interesting pattern: using CI enforcement to shape agent behavior. The broader signal is that agents need accountability mechanisms for their output — shamefile addresses code quality, but the pattern extends to all agent output. What's the shamefile for agent publishing?
- **URL:** https://github.com/BKDDFS/shamefile

### No New Findings (Reddit)
- Reddit search (r/LocalLLaMA, r/ChatGPTCoding) returned 403/bot-detection blocks. No new Reddit-specific findings this cycle.

### Key Takeaway This Cycle

Parag Agrawal's Parallel/Index is the biggest signal this cycle. It's the first major startup (founded by a former Fortune 500 CEO, with Fortune 500 launch partners) trying to build an economic layer around agent output value. The Shapley value approach — attributing source contribution to agent output — is conceptually adjacent to ZenBin's output attestation. The key difference: Parallel compensates sources (input economics), ZenBin attributes and publishes output (output identity). They're complementary layers in the emerging "agent economy" stack.

## 2026-05-19 10:50 UTC

### New Findings

**eXo MCP Server — Enterprise Workplace Tools via MCP with OAuth (May 19)**
- eXo Platform (open-source digital workplace) released an MCP server exposing workplace tools to AI agents
- OAuth-based auth layer for enterprise tool access (documents, wikis, tasks, spaces)
- Pattern: enterprises are now shipping MCP servers for their existing platforms
- **Signal:** MCP is becoming the universal connector layer. If your enterprise platform doesn't have an MCP server, you're behind. But — still input-focused (agents consuming tools), not output-focused (agents publishing).
- **URL:** https://www.exoplatform.com/blog/introducing-exo-mcp-server-secure-ai-integrations-digital-workplace/

**Claude Soul — Cross-Session Learning Engine for Claude Code (Show HN, May 18, 7 pts)**
- MCP server + hooks that extracts behavioral signals from agent interactions (corrections, successes, confusion)
- Periodically "reflects" on signals to build behavioral frameworks with confidence scores
- Bad frameworks get retired automatically. After ~200 sessions, emergent behavior appeared (additional memory system, pushback on bad ideas, independent analysis techniques)
- MIT license, one dependency, everything local
- **Signal:** Agent self-improvement through persistent behavioral memory. The "reflection" pattern (agents reviewing their own behavior and building frameworks) is a new input-layer capability. But the output is still just local files — no publishing, no sharing, no attribution of what the agent learned.
- **URL:** https://github.com/DomDemetz/claude-soul

**InsForge — Open-Source Heroku for Coding Agents (YC P26, Show HN, May 18)**
- Backend platform designed for coding agents to deploy, operate, and debug end-to-end
- Key innovation: **backend branching** — agents work on isolated branches of the entire backend (DB, auth, storage, functions, schedules). You review diffs and merge/discard.
- Debug agent: each project gets a dedicated debug agent that diagnoses failures and proposes fixes
- Backend advisor: daily security + performance scans, proposes remediations to your coding agent
- Explicitly rejected MCP for infra management — "MCPs have problems: tools pre-loaded into context, bad design (10k+ token payloads), can't do telemetry/configs"
- Instead: CLI + Skills approach (teach the agent to use the platform via skills, not tools)
- **Signal:** A YC company is saying MCP isn't enough for production infra — the context bloat and missing capabilities are real pain points. The "Skills over MCP" approach is a direct challenge to MCP's dominance. But the output layer is still just git commits and PRs. No persistent, attributed, shareable agent output.
- **URL:** https://github.com/InsForge/InsForge

**Pi MCP Bridge — Persistent Workspace for All AI Tools (Ask HN, May 17, 1 pt)**
- By a cybersecurity consultant and identity architect
- Takes Pi's open-source coding agent execution layer (npm package) and bridges it to MCP
- Every AI tool (Claude, Claude Code, any MCP-compatible tool) connects to the same persistent Linux workspace
- Shared filesystem, shared database, shared knowledge base — one agent writes, others read
- Auth: Clerk OAuth at MCP connection + shared-secret origin proxy + TOTP gateway for tool execution
- Every tool call logged with SHA256 hashes, every file write creates backup
- $10/month on a cheap VPS + Cloudflare Worker + Cloudflare Tunnel
- Key quote: "Stop building MCP servers from scratch. A coding agent already built the hard part."
- **Signal:** The "persistent shared workspace" pattern is emerging organically. When identity architects build for their own use, they create shared-persistence + OAuth + TOTP layers. This validates the need for agent output persistence — but it's still DIY and local. No publishing, no attribution, no sharing beyond a single VPS.
- **URL:** https://news.ycombinator.com/item?id=48169701

**AgentVoy — create-react-app for AI Agents (Show HN, May 18, 3 pts)**
- Scaffold tool supporting 7 agent frameworks (LangGraph, CrewAI, AutoGen, etc.), deploy anywhere
- Standardizes agent project structure across frameworks
- **Signal:** Agent framework fatigue is real. People want "just give me a working project" rather than choosing between 50 frameworks. Standardization pressure is mounting.
- **URL:** https://github.com/agentvoy/agentvoy

**Andon FM — AI Agents Running Radio Stations (Front Page, May 18)**
- 4 AI agents given full control of radio broadcasting + business operations
- Revenue is "terrible" but the shows are "at times hilarious"
- **Signal:** The most public agent output experiment yet — agents creating content that airs live. But the publishing/distribution is entirely bespoke (custom radio infrastructure). No standard output/publishing layer.
- **URL:** https://andonlabs.com/blog/andon-fm

**Tracecast — Generative Data Apps on Marimo (Show HN, May 18)**
- LangGraph agent + Marimo notebooks + data warehouse queries = interactive data apps
- Agent writes a polished read-only notebook, presented to user
- Explicitly hides edit mode — user only sees finished, read-only data app
- "Ease of use and trust in AI output were the main drivers behind this decision"
- No MCP support — hardcoded data query tools for quality control
- **Signal:** The read-only presentation of agent output is a deliberate design choice. Tracecast validates that **users want trusted, finished agent output** — not raw editable notebooks. This is exactly the ZenBin thesis: agents need a presentation layer that's separate from the generation layer.
- **URL:** https://github.com/tracecast/open_data_apps

**MemEye — Visual-Centric Evaluation Framework for Multimodal Agent Memory (May 18)**
- Academic paper on evaluating how well agents maintain visual memory
- Focus on visual-centric memory assessment across multimodal agents
- **Signal:** Memory evaluation is becoming an academic concern. The input/context layer is getting academic rigor. Output evaluation (did the agent produce what it was asked to?) has no equivalent framework.
- **URL:** https://huggingface.co/papers/2605.15128

**Twill.ai (YC S25) — Cloud Agent Sandbox + Memory (Launch HN, 77 pts, 95 comments)**
- Runs Claude Code / Codex in isolated cloud sandboxes, returns PRs
- Standing memory: "use the existing logger, never console.log" becomes persistent instruction
- Open-sourced agentbox-sdk for running agent CLIs across sandbox providers
- **Signal:** Agent sandbox + memory is a funded category (YC). The pattern: give agents isolated environments + persistent context. Still no output publishing layer — PRs go to GitHub, which is the output layer, but GitHub isn't an agent-native publishing platform.
- **URL:** https://twill.ai, https://github.com/TwillAI/agentbox-sdk

**AAuth Knowledge Graph Explorer (Show HN, Apr 23, 3 pts)**
- Interactive graph visualization of the AAuth protocol — 72 flows, cross-referenced against spec sequence diagrams
- Built with Cytoscape.js, vanilla JS
- **Signal:** AAuth is getting visualization tooling. Protocol adoption is maturing from spec to tooling ecosystem.
- **URL:** https://mcp-shark.github.io/aauth-explorer/

### Updated Landscape Files

- `infrastructure.md`: Added eXo MCP Server, Claude Soul, InsForge (Skills over MCP), Pi MCP Bridge, Tracecast, Twill.ai/agentbox-sdk
- `identity.md`: Added Pi MCP Bridge auth pattern (Clerk OAuth + TOTP + shared-secret), InsForge backend branching as identity primitive
- `trends.md`: Added Trend 16 (Skills over MCP), updated signal table, reinforced Output Gap thesis

### Key Takeaway

This cycle confirms three things:

1. **MCP dominance is being challenged.** InsForge (YC P26) explicitly rejected MCP for infra management, citing context bloat and missing capabilities. Their "CLI + Skills" approach is a real alternative. Meanwhile, eXo, Claude Soul, and Pi MCP Bridge all demonstrate MCP's strength as a universal connector — but also its limitations for complex, stateful operations.

2. **Agent output presentation is becoming a deliberate design decision.** Tracecast hides edit mode and only shows finished, read-only data apps. Andon FM agents broadcast live radio. Twill agents submit PRs. Every agent that produces something faces the same question: how do you present, attribute, and share that output? Nobody has a standard answer.

3. **The persistent workspace pattern is emerging organically.** Pi MCP Bridge ($10/month VPS + shared filesystem) is what people build when they need agent output to survive between sessions. Claude Soul adds behavioral memory. InsForge adds backend branching. Each is a bespoke solution to one aspect of what ZenBin provides natively: persistent, attributed, cryptographically verified agent output.

The output gap continues to widen. Every new tool handles input better, identity more carefully, and sandboxing more safely. Nobody is building the layer where agents publish what they create.

---

## 2026-05-15 10:50 UTC

### New Findings

**Keycard.ai — "The Agent Security Stack: Transport, Identity, Policy, Runtime" (May 14)**
- Comprehensive 4-layer framework for agent security:
  1. **Transport** — MCP with OAuth 2.1, RFC 9728 Protected Resource Metadata, RFC 8707 Resource Indicators, incremental scope consent
  2. **Identity** — Non-human identity (WIMSE, SPIFFE, AAuth). Agents as first-class identities.
  3. **Policy** — Authorization decisions at gateway level (AgentGate, Agentgateway pattern)
  4. **Runtime** — Sandboxing, guardrails, behavioral monitoring. Called "the most under-served layer."
- Key context: CrowdStrike acquired SGNL for $740M (Jan 2026), Palo Alto acquired CyberArk for $25B (Feb 2026) — both cited agentic identity as driver.
- **Signal:** Identity is now a funded acquisition category. ZenBin's Ed25519 key-based signing fits squarely in Layer 2 (Identity) and crosses into Layer 4 (Runtime) for output attestation. Nobody else is doing cryptographic output attestation.
- **URL:** https://www.keycard.ai/blog/agent-security-stack/

**Ratify Protocol (Identities AI) — Show HN (May 13)**
- Open cryptographic trust protocol for AI agent authorization
- Hybrid Ed25519 + ML-DSA-65 (FIPS 204, quantum-safe) signatures
- Three verbs: DELEGATE → PRESENT → VERIFY
- Delegation certificates: who authorized the agent, what scopes, how long
- Offline verification in <1ms, no central authority needed
- JSON wire format, no blockchain, no tokens
- SDKs in Go, TypeScript, Python, Rust, C/C++
- v1.0.0-alpha.8 with 59 canonical test vectors
- Patent pending
- **Signal:** Directly competitive with ZenBin's signing model but focused on *authorization delegation* (who let the agent act), not *output attestation* (did the agent produce this). Both use Ed25519. Ratify adds quantum-safe ML-DSA-65. The "prove it" framing is powerful — aligns with ZenBin's philosophy. But Ratify doesn't address content/output publishing at all. The gap: **Ratify proves WHO authorized the agent. ZenBin proves WHAT the agent produced.** These are complementary, not competitive.
- **URL:** https://github.com/identities-ai/ratify-protocol

**AAuth (Agent Auth) — Dick Hardt Deep Dive (May 12)**
- Exploratory spec from OAuth 2.0 co-author Dick Hardt
- Full working prototype with Keycloak + Agentgateway + A2A + MCP
- Key innovations:
  - Eliminates bearer tokens — every request is signed
  - Cryptographically verifiable agent identity (JWKS + HTTP message signing)
  - Progressive identity scale: pseudonymous → stable identity → full delegation
  - Dynamic permission discovery
  - Explicit, verifiable delegation chains (user → agent → sub-agent)
  - Integration with SPIFFE/WIMSE existing standards
- **Signal:** The OAuth ecosystem itself is recognizing that bearer tokens aren't enough for agents. AAuth's signed-request model is the auth layer; ZenBin's signed-output model is the publishing layer. Again complementary.
- **URL:** https://blog.christianposta.com/exploring-aauth-agent-auth-identity-and-access-management-for-ai-agents/

**Facet Protocol — Open IETF Agent-Identity Protocol (May ~9)**
- Open spec for agent-ready business transactions
- Four standards: KYAPay (identity, IETF), MCP (discovery), x402 (payments, Coinbase), RFC 9421 (bot signing)
- KYAPay: ES256 JWT + JWKS, web-bot-auth aligned per RFC 9421
- Live verifier at facet.llc — the website IS the demo (402 Payment Required, identify via KYAPay)
- Protocol layers beyond spec: vertical depth, schema generation, signed response provenance, reputation registry, agent WAF
- **Signal:** Another identity/payment layer for agents. The "signed response provenance" layer is interesting — closest thing to ZenBin's output attestation seen so far, but it's for API responses (merchant→agent), not agent→world publishing. Still, this validates the market need for cryptographic attestation of agent interactions.
- **URL:** https://github.com/facet-llc/spec

**Ardent (YC P26) — Postgres Sandboxes for Coding Agents (May 13)**
- Launch HN: Database sandboxes for AI coding agents
- Logical replication + DDL triggers for instant (<6s) Postgres clones
- Copy-on-write, even at TB scale
- Proxy layer for access control, credential leak prevention, PII redaction
- BYOC for data residency
- **Signal:** Infrastructure for agents to safely test their work. The pattern — sandboxed environments for agents to verify before shipping — parallels ZenBin's publishing model. Agents need safe places to produce, verify, and ship output. Ardent does this for DB changes; ZenBin does it for content.
- **URL:** https://www.tryardent.com/

**MCP Ecosystem — New Servers (May 14)**
- **Deckard** — iCloud MCP server with per-agent identity + ACL. Personal multi-agent identity model maturing.
- **MementoVault** — Self-hosted AI context manager served via MCP. Open source.
- **DiscordMcp** — Controlling servers through MCP
- **SicariusGuard** — Solana token safety oracle for AI agents (MCP server)
- **N8n-MCP** — MCP server for generating and debugging n8n workflows
- **Sinain** — Capture screen/audio context into local knowledge graph, share via MCP or peer-to-peer
- **Signal:** MCP server proliferation continues. Identity-aware servers (Deckard) and context-sharing (MementoVault, Sinain) are trends. None address publishing output.

**Ask HN: What features are missing in current AI agent frameworks? (May 14)**
- Author asks about: memory systems, workflow debugging, human-in-loop controls, distributed execution, lower latency orchestration
- 0 comments, 1 point — quiet discussion
- **Signal:** The gap list is about *running* agents, not *publishing from* agents. Output/publishing isn't even on the radar yet.

**Business Insider: AI coders carrying half-open laptops everywhere (May 14)**
- Cultural piece on developers keeping laptops open for AI agents
- 40 comments, 29 points
- **Signal:** Agent culture is mainstream. The visual of devs literally tethered to running agents reinforces that agents are production tools now — they need production output channels.

### No New Reddit Findings
- Reddit search returned older/irrelevant results. r/LocalLLaMA and r/ChatGPTCoding discussions are about running models locally and general agent frameworks, not about publishing or identity.

### Key Takeaways

Three major identity/auth protocols emerged this week:
1. **Ratify Protocol** — Offline cryptographic agent authorization (Ed25519 + ML-DSA-65)
2. **AAuth** — Full agent auth framework from OAuth 2.0 co-author
3. **Facet/KYAPay** — IETF agent identity standard for business transactions

All three validate that **agent identity is becoming a real category.** None address agent output/publishing. The gap ZenBin fills remains wide open:
- Ratify proves WHO authorized the agent → ZenBin proves WHAT the agent produced
- AAuth authenticates the agent → ZenBin attests the output
- KYAPay signs API responses → ZenBin signs published content

The Keycard article's 4-layer framework (Transport → Identity → Policy → Runtime) is a useful positioning map. ZenBin sits at the intersection of Identity (key-based signing) and Runtime (output attestation before publish).

---

## 2026-05-15 04:50 UTC

### New Findings

**Plato (Purple Pincher) — AI Agents with Shared Memory Publishing Failures (May 13)**
- Show HN: "AI agents with shared memory — we published everything they got wrong"
- Agents with shared memory that publicly share their failure logs
- **Signal:** Another data point for agent output publishing — but focused on failure/transparency logs, not content. The idea that agents should publish what they do (even failures) is growing. ZenBin's model of signed, attributed agent output is the formal version of this pattern.
- **URL:** https://plato.purplepincher.org/

**Probus — 3-Agent Vulnerability Scanner (May ~10)**
- HN story (self-text): AI vulnerability scanner using three isolated agents — Analyst (picks files), Researcher (finds bugs), QA (rejects false positives independently)
- Found real vulnerabilities: n8n password-reset JWT logging, Vercel AI SDK role injection + schema bypass + prototype collision, LangGraph.js NoSQL injection, browser-use path traversal, Haystack SSRF + path traversal + unbounded reads
- Key design insight: QA agent must be isolated from Researcher's reasoning — if it sees the reasoning, it just agrees (agreement bias)
- Cost: ~$0.50/file with Qwen 3.6 + DeepSeek v4 Pro on OpenRouter. Anthropic ~10x that.
- Uses Claude Agent SDK with filesystem sandbox per agent
- **Signal:** Multi-agent verification patterns are maturing. Isolated verification agents are a pattern ZenBin should watch — signed output from verified agents is more trustworthy than unsigned output. The isolation pattern (separate context for verification) could apply to publishing: a verifier agent signs off on content before it's published.
- **URL:** https://github.com/etairl/Probus

**code-agents.ai — Engineering-Focused Coding Agent Course (Ask HN, May 8)**
- Ask HN: "Is anyone interested in engineering focused coding agent course?"
- Published as docs-style course, got no interest, asking HN why
- Questions: docs vs video? worth paying for? skill gap to fill?
- **Signal:** The market for agent education/training is uncertain. People may not want to learn agents — they want agents that work. Low signal for ZenBin.

### No New Reddit Findings
- Reddit search API blocked (403). No r/LocalLLaMA or r/ChatGPTCoding data this cycle.

### Key Takeaway

Quiet cycle. Most HN stories this week were already captured in the 5/14 updates. The two new items (Plato, Probus) reinforce existing signals:
- Plato: agents publishing their output (even failures) → agent output publishing is a growing pattern
- Probus: isolated verification agents as a trust mechanism → verification before publishing is a natural extension

No new competitor or standard threatens ZenBin's positioning. The output/publishing gap remains unaddressed by anyone else.

---

## 2026-05-14 22:50 UTC

### New Findings

**Keycard.ai — "The Agent Security Stack: Transport, Identity, Policy, Runtime" (May 14)**
- Comprehensive framing article mapping agent security into 4 layers:
  - **Layer 1: Transport** — MCP with OAuth 2.1, Protected Resource Metadata (RFC 9728), Resource Indicators (RFC 8707), incremental scope consent
  - **Layer 2: Identity** — Agent identity as distinct from transport. Non-human identity standards emerging (WIMSE, SPIFFE, AAuth)
  - **Layer 3: Policy** — Authorization decisions. AgentGate, Agentgateway pattern. Evaluation at the gateway.
  - **Layer 4: Runtime** — Sandboxing, guardrails, behavioral monitoring. The most under-served layer per Keycard.
- Notable: CrowdStrike acquired SGNL for $740M (Jan 2026), Palo Alto acquired CyberArk for $25B (Feb 2026) — both cited agentic identity as driver
- **Signal:** This is the best framing of the agent security stack to date. Clear taxonomy. Also notable: no "output" or "publishing" layer exists in their model — the stack covers input through runtime only. Output/publishing is outside the current mental model.
- **URL:** https://www.keycard.ai/blog/agent-security-stack/

**Ratify Protocol Updated to v1.0.0-alpha.8**
- Incremented from alpha.7 → alpha.8
- Added C/C++ language interop (now 5 languages: Go, TypeScript, Python, Rust, C/C++)
- Patent pending status maintained
- **Signal:** Protocol continues maturing. Cross-language interop is table stakes for identity protocols.

**Lyfe Ninja — Revocable Digital Signatures for AI Agent Output (Ask HN, Apr 21)**
- Ask HN: "Would you use revocable digital signatures to verify AI/other content?"
- Core concept: AI responses are **signed** after generation, verified client-side, tampering causes verification failure, signatures are **revocable** (short-lived leases or full invalidation)
- "Know your agent" framing: verify that AI-generated content came from the intended agent and hasn't been altered
- Uses distributed verification, embedded metadata, no key management
- Key quote: "Would you want to stand by your AI agent's output forever? I think not." — argues revocability is essential
- **Signal:** DIRECTLY relevant to ZenBin. Someone else is thinking about signing AI agent outputs, but from a verification/revocation angle rather than a publishing angle. They're asking the market question — "would people actually use this?" — and the answer isn't clear yet. ZenBin's signed publishing with Ed25519 is a specific implementation of this concept, but with a different focus: publishing identity and attribution vs. verification and revocation.
- **Gap opportunity:** Lyfe Ninja is asking "how do you verify AI output?" — ZenBin answers "how do you publish it with identity?" Different question, complementary answer.
- **URL:** https://lyfe.ninja/projects/

**Auto Agent Protocol — A2A Profile for Car Dealerships (May 14)**
- Open A2A profile enabling AI agents to interact with car dealerships
- Domain-specific A2A implementation (automotive retail)
- **Signal:** A2A is moving from theory to domain-specific implementations. When domain-specific A2A profiles appear, it means agent-to-agent communication is becoming practical. Output publishing is the other half — agents need to produce, not just converse.
- **URL:** https://github.com/auto-agent-protocol/auto-agent-protocol

**DialtoneApp Network — Bot Commerce Payments (Show HN, Apr 21)**
- Card payments infrastructure for bot commerce
- Bots discover products, request purchases, card is charged when owner-approved rules allow
- Uses .well-known/* files for bot-allowed products (like robots.txt for commerce)
- Explored Stripe machine payments, Skyfire, Crossmint, Worldpay, Google Universal Commerce Protocol, MCP, A2A
- **Signal:** Agent commerce is becoming real. When agents can transact, they need to publish receipts, confirmations, reports. The output gap extends to financial transactions.
- **URL:** https://dialtoneapp.com

**Kantext — Context as a First-Class Data Type (Show HN, ~May 14)**
- Treats AI context as a composable, layered data structure (not vector DB or graph)
- Every composition is cryptographically sealed to a Git commit ("grounded")
- Context-Addressable Storage (CxAS) with Blake3 hashing
- Provenance tracked via git commit sealing — structural provenance, not just data storage
- **Signal:** Provenance is showing up in context management now too. Git-based sealing is an interesting pattern but doesn't address real-time publishing.

**MCP Server Explosion — MementoVault (May 14)**
- Self-hosted AI context manager served via MCP
- Structured, reusable context across MCP-compatible clients
- **Signal:** Already noted in 16:50 update. MCP-as-standard-connector pattern continues.

**AI Coders Half-Open Laptops — Business Insider (May 14)**
- Mainstream press: agents requiring constant human oversight, people carrying laptops everywhere
- **Signal:** Already captured in 16:50 update. The cultural moment of agents-as-everyday-tools.

### Updated Landscape Files
- `identity.md`: Added Keycard.ai Agent Security Stack framing, updated Ratify to alpha.8, added Lyfe Ninja revocable signatures
- `infrastructure.md`: Added Auto Agent Protocol, DialtoneApp Network, Kantext
- `trends.md`: Added Trend 14 (Agent Security Stack Framing), updated Output Gap trend with Lyfe Ninja data point

### Key Takeaway

Keycard.ai's 4-layer agent security stack (Transport → Identity → Policy → Runtime) is the clearest articulation of where the industry is investing. Notably absent from their model: any output/publishing layer. Lyfe Ninja's Ask HN about revocable signatures for AI output is the closest anyone has come to thinking about output verification — but they're framing it as a question, not a product. They're asking "would you use this?" which means the market hasn't validated it yet. ZenBin should track this closely: the question of "who created this AI output and can I verify it?" is emerging, but nobody has productized it yet.

---

## 2026-05-14 16:50 UTC

### New Findings

**Deckard — Per-Agent Identity + ACL for Apple Services MCP (New)**
- Mac-resident MCP server for Mail, Calendar, iCloud Drive, Voice Memos, Reminders, Contacts
- Per-agent tokens, scoped ACLs, content filtering both directions, full audit log
- Origin: author runs 4+ agents (Claude Code, OpenClaw, Paperclip, Hermes) across different machines and needed per-agent access control
- **Signal:** Personal multi-agent identity is maturing. Per-agent auth isn't just enterprise — it's a personal deployment concern too. Output/publishing authorization remains unaddressed.
- **URL:** https://github.com/lapidakis/Deckard

**MCP Server Explosion Continues (May 14)**
- MementoVault: self-hosted AI context manager via MCP (structured, reusable context)
- DiscordMcp: controlling servers through MCP
- N8n-MCP: workflow generation + debugging via MCP
- SicariusGuard: Solana token safety oracle for AI agents via MCP
- **Signal:** MCP as the universal connector pattern is fully established. New MCP servers every day for every niche. The pattern is commoditized.

**Ardent (YC P26) — Traction Update**
- 94 pts, 44 comments on HN (up from 52→80→89→94)
- Postgres sandboxes for coding agents continuing to resonate
- **Signal:** Sandbox/test infrastructure for agents is validated demand. Output infra remains the gap.

**Ask HN: Missing Agent Framework Features — Zero Mention of Publishing**
- "What features are missing in current AI agent frameworks?" — lists memory, debugging, controls, orchestration
- Zero comments mention output/publishing as a gap
- **Signal:** The category doesn't exist yet in developer consciousness. This is exactly where ZenBin can define a new category.

### Updated Landscape Files
- `identity.md`: Added Deckard (per-agent identity + ACL), updated big picture
- `infrastructure.md`: Added Deckard, MementoVault, DiscordMcp, N8n-MCP, SicariusGuard
- `trends.md`: Updated MCP trend with new servers, added Trend 13 (Per-Agent Identity Scaling to Personal Use), updated signal table

### Key Takeaway

Per-agent identity is now a personal deployment concern, not just enterprise (Deckard proves it). MCP server explosion continues — every domain gets an MCP wrapper. The output/publishing gap remains completely unaddressed. No one in the Ask HN thread about missing framework features mentions publishing — it's not yet recognized as a category, which is exactly the opportunity for ZenBin.

---

## 2026-05-14 10:50 UTC

### New Findings

**Ask HN: "What features are missing in current AI agent frameworks?" (May 14)**
- HN discussion asking what's missing in agent frameworks
- Examples given: better memory systems, workflow debugging, human-in-loop controls, distributed execution, lower latency orchestration
- **Signal:** Direct community signal that the gaps are still being defined. No one mentions output/publishing as a gap — because it's not even on the radar yet. Opportunity for ZenBin to define the category.
- **URL:** https://news.ycombinator.com/item?id=48132357

**AI Coders Carrying Half-Open Laptops — Business Insider (May 14)**
- Mainstream press coverage of AI coding agents requiring constant human oversight
- "AI coders are carrying half-open laptops through airports, offices, ice rinks"
- 20 pts on HN, 32 comments
- **Signal:** AI agents are mainstream news. The cultural moment of agents-as-everyday-tools has arrived. This is when infrastructure for agent output becomes necessary.

**Ardent (YC P26) — Updated Traction**
- Now 89 pts on HN, 35 comments (up from 80/33 last check, 52/20 initially)
- Postgres sandboxes for coding agents continuing to gain engagement
- **Signal:** Sandbox/test infra for agents is validated demand. Output infra remains the gap.

**Comedy Podcast Agent Pipeline — Fully Automated Content Publishing**
- HN story: Agent pipeline that takes trending topics → 22-min comedy podcasts → publishes to Spotify
- Uses Temporal for durable workflow, Gemini for scripts, gollem agents with structured outputs, ElevenLabs for voice
- ~10 beats per episode, verifier gate checks facts/character consistency before rendering
- **Signal:** Agents are already creating and publishing finished content. But the publishing step (to Spotify) is manual/bespoke — no standard infrastructure for agent output. ZenBin fills exactly this gap.

**Manufact/mcp-use — MCP Dev Tooling Update**
- Full-stack SDK for MCP servers and clients, plus Inspector dev tooling
- HMR for MCP using protocol primitives (notifications/tools/list_changed) — proper hot reload without session restart
- Browser-based Inspector: localhost chat UI, BYOK, cross-client testing with browser agents
- Screenshot + screen recording of full agent conversations for debugging
- **Signal:** "The Vite for MCP" is now a funded company. MCP dev tooling is a real category. This validates that agent infra investment follows the input layer. Output tooling remains empty.

### Updated Landscape Files
- `infrastructure.md`: Updated Ardent traction (89 pts), added Manufact/mcp-use details
- `trends.md`: Updated signal table with new entries

### Key Takeaway

Community is actively discussing what's missing in agent frameworks (Ask HN), and the top answers are all input-side: memory, debugging, controls, orchestration. No one mentions output/publishing — not because it's solved, but because it's not yet recognized as a category. Meanwhile, agents are already creating and publishing content (comedy podcast pipeline → Spotify), but the publishing step is bespoke. The Anthropic report shows 60% of orgs use agents for report generation. The gap is real and growing.

---

## 2026-05-13 04:50 UTC

### New Findings

**Agent Identity Standards Converging (Big Story)**
- AAuth (Agent Auth) by Dick Hardt (OAuth 2.0 author) — exploratory spec for agent-to-agent auth with cryptographic identity, no bearer tokens, progressive trust, delegation chains. Working prototype with Keycloak + Agentgateway + A2A + MCP.
- IETF Internet-Draft draft-klrc-aiagent-auth-00 — formal proposal for agent auth/authz using WIMSE + OAuth 2.0. Covers agent identifiers, credentials, attestation, three delegation models.
- OpenID Foundation whitepaper on AI agent identity — declares MCP the leading standard for agent↔resource connection, warns that autonomy "inflection point" will break current auth models.
- NIST concept paper on AI agent identity — open for public comment on identification, authorization, auditing, and non-repudiation.
- Strata/CSA survey (285 IT/security pros) — only 18% confident in current IAM for agents, 44% still using static API keys, 80% can't track agent actions in real time.

**MCP Ecosystem Maturing**
- Manufact (mcp-use) launched MCP dev tooling: Inspector (localhost chat for testing), HMR for MCP servers, tunnel for real-client testing, automated cross-client testing with browser agents. Funded company, not a side project.
- Ledgr — self-hosted finance app with built-in MCP server. "Has an MCP server" is becoming a differentiator.
- Hoop — infra access gateway exposing session data via MCP. Agents querying their own history.

**Embedded AI Agents**
- Gigacatalyst (Show HN, 44 pts) — AI customization layer embedded in SaaS. Non-technical users build governed apps via natural language. 2000+ daily users, 70% 30-day retention.

**Enterprise Agents**
- Hopper/Hypercubic (Show HN, 65 pts) — agentic interface for mainframes/COBOL. Agents operating inside legacy environments with approval gates.

### Key Takeaway for ZenBin

The industry is investing massively in agent **input** (MCP, tools, context) and agent **identity** (auth, delegation, attestation). Nobody is building dedicated agent **output** infrastructure. That's the gap. ZenBin should position as the publishing/output layer for agents — where agent-created content gets identity, attribution, hosting, and sharing.

---

## 2026-05-13 10:50 UTC

### New Findings

**Durable Sessions — A New Category Forming**
- Ably (realtime Pub/Sub) formalizing "Durable Sessions" as infrastructure for AI agents — persistent sessions surviving disconnects, ordered delivery, multi-device fan-out, presence
- 35/37 AI platforms have no stream resumption, 33/37 can't detect agent crashes
- Vercel building DurableAgent class, TanStack AI shipping ConnectionAdapter, ElectricSQL defining the pattern
- Analogy: Durable Execution (Temporal, $5B valuation) made backends crash-proof. Durable Sessions make the agent experience crash-proof.
- **Signal:** Transport/session layer is becoming real infrastructure. Output (what happens after the session) is still unaddressed.

**AI Agent Passport — New Identity Standard Proposal**
- Open identity standard from Stacy Starchum / Jay Volpenheim — signed, verifiable JSON document traveling with agents
- Ed25519 cryptographic signatures, DID-based ownership, scoped permissions, spend limits, registry verification
- "Like OAuth for humans → AI Agent Passport for agents" — RFC status, seeking community feedback
- Complementary to AAuth (auth protocol) and IETF draft (workload identity) — this is the transactional trust layer

**AAuth Deep Dive Published**
- Christian Posta published detailed deep dive with full working prototype: Keycloak + Agentgateway + A2A + MCP
- Shows agent identity via JWKS + HTTP message signing → autonomous authorization → user-delegated authorization → policy enforcement
- Agentgateway as policy enforcement point (CEL-based policies, delegation chain validation)
- **Signal:** The auth stack is becoming concrete, not just theoretical. Working prototypes exist.

**Agent Governance Emerges as Category**
- Recursant (Show HN): Istio/sidecar pattern for agent governance at network layer — compliance across multi-framework, multi-cloud
- Voker (YC S24, Launch HN): Agent analytics platform with Intents/Corrections/Resolutions primitives. 90%+ YC founders only know agents fail from customer complaints.

**MCP Ecosystem Continues Exploding**
- Manufact/mcp-use: MCP dev tooling with HMR, Inspector, tunnel, cross-client browser-agent testing. Funded company.
- Graphmind: Persistent memory + graph for agent codebase navigation (MCP server, CLI, GUI). 5,700x token reduction vs grep.
- Elecz: MCP server for real-time electricity prices across 40 countries. "API wrapper as MCP server" pattern is commoditized.
- Monghoul: MongoDB GUI with built-in MCP server. MCP as a feature checkbox for dev tools.

**Embedded AI in Enterprise**
- Gigacatalyst (Show HN, 50 pts): AI customization layer embedded in SaaS. Non-technical users build governed apps via natural language. 2000+ daily users, 900+ apps, 70% 30-day retention.
- Hopper/Hypercubic (Show HN, 79 pts, front page): Agentic interface for mainframes/COBOL. Agents operating inside legacy enterprise environments.

### Updated Landscape Files
- `identity.md`: Added AI Agent Passport entry
- `infrastructure.md`: Added Ably Durable Sessions, Recursant, Voker, Graphmind, Elecz, Monghoul
- `standards.md`: Added AI Agent Passport standard
- `trends.md`: Added Trends 7 (Durable Sessions), 8 (Agent Governance), 9 (Identity Fragmentation). Updated signal table with 16 entries.

### Key Takeaway

Three layers are crystallizing: **input** (MCP won), **identity** (AAuth/IETF/Passport competing), and **transport** (Durable Sessions forming). The **output layer** — publishing, presenting, attributing agent-produced content — remains completely unclaimed. This is still ZenBin's clearest gap.

---

## 2026-05-14 04:50 UTC

### New Findings

**Anthropic 2026 State of AI Agents Report**
- Survey of 500+ technical leaders across industries on enterprise agent deployment
- 57% of orgs now deploy agents for multi-stage workflows; 16% running cross-functional processes
- 81% plan to tackle more complex use cases in 2026 (39% multi-step, 29% cross-functional)
- 90% use AI for development; 86% deploy agents for production code
- Data analysis + report generation (60%) and internal process automation (48%) are top impact use cases
- 56% plan to implement agents for research and reporting in next year
- 80% report measurable economic returns from AI agent investments
- Top challenges: integration with existing systems (46%), data access/quality (42%), change management (39%)
- **Signal:** Report generation is the #2 use case (60%). Agents are producing outputs (reports, dashboards, docs) at scale — but there's still no dedicated infrastructure for publishing/attributing that output. ZenBin opportunity validated.

**Ardent (YC P26) — Updated Traction**
- Now 80 pts on HN, 33 comments (up from 52 pts, 20 comments)
- Postgres sandboxes for coding agents — strong engagement from production engineering teams
- **Signal:** Sandbox/test infra for agents continues to validate. Output infra remains the gap.

**Plato / PurplePincher — AI Agents with Shared Memory**
- Show HN (3 pts) — published "everything they got wrong" with shared memory for AI agents
- Post-mortem style content about agent memory systems
- **Signal:** Agent memory/context sharing is active area. Shared memory = input-side optimization again.

**Awesome AI Agents 2026 — Curated List**
- Comprehensive GitHub list covering 300+ projects across 25 categories
- Categories: Foundation Models, Protocols (MCP/A2A), Frameworks, Memory, Security, Sandboxing, etc.
- **Notable absence:** No "publishing" or "output" category exists. Categories cover input, processing, security, and evaluation — but not what agents produce.
- **Signal:** Even the most comprehensive agent ecosystem list doesn't have a category for agent output/publishing. Confirms the gap.

### Key Takeaway

The Anthropic report validates the ZenBin thesis with hard data: **60% of orgs are using agents for data analysis + report generation**, and **56% plan to implement research and reporting agents**. Agents are producing output at scale. The awesome-agents-2026 list has 25 categories and zero of them cover publishing/output. The gap is still wide open.

---

## 2026-05-13 16:50 UTC

### New Findings

**Ratify Protocol — Cryptographic Trust for Agent Authorization**
- New open protocol from Identities AI, Inc. — Ratify Protocol v1.0.0-alpha.7
- Hybrid Ed25519 + ML-DSA-65 (NIST FIPS 204) signatures — quantum-safe by design
- Three verbs: DELEGATE, PRESENT, VERIFY — human→agent and agent→agent use the same primitive
- Offline verification in <1ms, no central authority needed
- Delegation chains with scope attenuation (child can never exceed parent permissions)
- JSON wire format, no blockchain, no tokens, no central issuer
- SDKs in Go, TypeScript, Python, Rust — cross-language interop proven
- **Signal:** Yet another identity/auth protocol entering the space. The fragmentation continues. Each approach has different tradeoffs (AAuth = OAuth-evolved, IETF = standards-track, Passport = driver's license, Ratify = offline-first quantum-safe). None address output/publishing.

**AgentGate — Policy Decision Point for AI Agents**
- New open-source project: authorization layer sitting between AI agents and their tools
- Evaluates every action against identity, scope, declared purpose, and real-time behavior
- Three outcomes: PERMIT, ESCALATE, DENY
- Trust scoring across 4 dimensions: identity (25%), delegation chain (25%), purpose alignment via embeddings (30%), behavioral velocity (20%)
- Scope attenuation across delegation chains — child agent can never exceed parent permissions
- Human-in-the-loop escalation for sensitive operations
- LangChain integration via AgentGateToolkit
- **Signal:** Agent authorization is getting granular. The model of "trust score + purpose alignment + behavioral velocity" is new and interesting. Still focused on input/control, not output.

**AAuth Deep Dive Published (Christian Posta)**
- Full working prototype walkthrough: Keycloak + Agentgateway + A2A + MCP
- Shows agent identity via JWKS + HTTP message signing → autonomous authorization → user-delegated authorization → policy enforcement
- Agentgateway as policy enforcement point with CEL-based policies, delegation chain validation
- **Signal:** The auth stack is becoming concrete, not just theoretical. Working prototypes exist. This validates the AAuth approach.

**MCPSafe — Security Scanner for MCP Servers**
- Free security scanner using 5-LLM consensus to audit MCP servers
- **Signal:** MCP security is becoming a concern as adoption grows. Scanning/patterns emerging.

**Sysdig Headless Cloud Security**
- "Headless SaaS has come to security" — security capabilities consumable via APIs, AI agents, IDEs, CI/CD, not just UI
- Explicitly calls out Claude Code, Cursor, and MCP servers as the shift driving this
- **Signal:** Enterprise security tools are building agent-first consumption models. MCP as the input standard is taken for granted.

**Ably Durable Sessions — Full Blog Post**
- Ably (10-year realtime Pub/Sub company) formalizing their positioning as "Durable Sessions for AI agents"
- Key stat: 35/37 platforms have no stream resumption, 33/37 can't detect agent crashes
- Same infrastructure WhatsApp uses for humans, repackaged for agents
- Vercel building DurableAgent class, TanStack AI shipping ConnectionAdapter, ElectricSQL/Convex converging on same pattern
- **Signal:** Transport/session layer is now formally a category. Ably is claiming it first.

**Torrix — Self-Hosted LLM Observability**
- Single Docker container backed by SQLite — no Postgres, no Redis
- Includes MCP server so AI assistants can query your own logs
- Cost forecasting, budget caps, PII masking, model routing, evals, prompt library
- **Signal:** Agent observability is fragmenting into sub-categories. Torrix is "simple self-hosted" play. The MCP server for log querying is notable — agents querying their own history.

**Gigacatalyst (Update — Now 53 pts, Front Page)**
- Embedded AI builder for SaaS — 2000+ daily users, 900+ apps built, 70% 30-day retention
- Agentic API discovery → generation → validation → sandboxing → proxy layer
- **Signal:** Same pattern continues: SaaS platforms want AI inside their product, governed by their rules.

**Hypercubic/Hopper (Update — Now 83 pts, Front Page)**
- Agentic interface for mainframes/COBOL
- 43 comments, strong engagement from enterprise/mainframe practitioners
- Design principle: preserve fidelity of environment, make it accessible to agents
- **Signal:** Enterprise agents operating inside legacy systems is validated demand.

### Updated Landscape Files
- `identity.md`: Added Ratify Protocol, AgentGate PDP
- `infrastructure.md`: Added Torrix, MCPSafe, Sysdig Headless Security, updated Ably Durable Sessions details
- `standards.md`: Added Ratify Protocol to standards comparison
- `trends.md`: Added Trend 10 (Agent Auth Fragmentation), updated signal table

### Key Takeaway

The agent identity space is now crowded with four competing approaches (AAuth, IETF draft, AI Agent Passport, Ratify Protocol), each optimizing for different trust models. Meanwhile, MCP has fully won the input layer and is being taken for granted (Sysdig assumes it, Torrix bundles it, every tool ships MCP support). The **output layer** remains completely empty — no one is building dedicated infrastructure for agent publishing, presentation, or content attribution. This is the clearest signal yet for ZenBin.

---

## 2026-05-13 22:50 UTC

### New Findings

**Ratify Protocol (Show HN, 4 pts) — Offline-First Agent Auth**
- New from Identities AI, Inc. — Ratify Protocol v1.0.0-alpha.7
- Hybrid Ed25519 + ML-DSA-65 (FIPS 204 quantum-safe) signatures
- Three verbs: DELEGATE → PRESENT → VERIFY. Same primitive for human→agent and agent→agent
- Offline verification in <1ms, no central authority, no blockchain, no tokens
- Delegation chains with scope attenuation (child ≤ parent)
- SDKs in Go, TypeScript, Python, Rust. 59 canonical test vectors, cross-language interop proven
- **Signal:** Fourth identity protocol entering the space. Ratify optimizes for offline/edge/realtime (drones, vehicles, voice) while AAuth optimizes for web/API. The space is fragmenting by use case.

**AgentGate — Policy Decision Point for AI Agents (Show HN, 4 pts)**
- Open-source PDP sitting between agents and tools
- Evaluates every action against identity, scope, declared purpose, and real-time behavior
- Outcomes: PERMIT / ESCALATE / DENY
- Trust scoring: identity 25%, delegation chain 25%, purpose alignment (embeddings) 30%, behavioral velocity 20%
- Scope attenuation across delegation chains, human-in-the-loop escalation
- LangChain integration via AgentGateToolkit
- **Signal:** Agent authorization getting granular and behavioral. Purpose alignment via embeddings is a novel approach. Still focused on input/control — no output layer.

**Sinain — Context OS for Agents (Show HN, 2 pts)**
- Captures screen + audio continuously, distills into local knowledge graph
- Accessible via MCP, web UI, and HUD overlay invisible to screen capture
- 82.8% IPR on LongMemEval (ICLR 2025 benchmark)
- Peer-to-peer context sharing via WebRTC — data never touches a server
- Four privacy modes: off / standard (auto-redact) / strict (summaries only) / paranoid (fully local, Ollama + whisper.cpp)
- **Signal:** Agent context/input is getting rich and continuous. Sinain is "context OS" — captures everything an agent might need. But still input-focused. Nobody is building the output counterpart.

**Ardent (YC P26, Launch HN, 52 pts, front page) — Postgres Sandboxes for Coding Agents**
- Instant production-like database clones for agents to test against
- Logical replication + DDL triggers, copy-on-write branching, spin up in <6s even at TB scale
- Proxy layer for access control, credential isolation, split-plane architecture for BYOC
- Anonymization via SQL registered on branches (PII redaction)
- Goal: make every data infrastructure "cloneable" so agents can test impact without risk
- **Signal:** Sandbox/isolation infrastructure for agents is a funded category (YC). The pattern: give agents safe environments to work in. Still about input/testing — the output/publishing step remains unaddressed.

**Recursant — Istio for AI Agents (Show HN, 3 pts)**
- Mesh-based control plane: sidecar per agent pod, mTLS, A2A protocol
- Control plane (registry) + data plane (sidecar mesh)
- Interceptor pipeline: auth, authz, compliance, PII redaction, guardrails, audit, rate limiting
- Full mortgage origination demo with hub-and-spoke topology
- Agent-agnostic: works with LangChain, LangGraph, CrewAI, custom HTTP
- **Signal:** Service mesh pattern (Istio analogy) applied to agents. This is infra-level governance — network-layer control. Validates that agent infra is following k8s/cloud-native evolution.

**AAuth Deep Dive (Christian Posta blog, HN 1 pt)**
- Full prototype walkthrough: Keycloak + Agentgateway + A2A + MCP
- Agent identity via JWKS + HTTP message signing → autonomous auth → user-delegated auth → policy enforcement
- Agentgateway as PEP with CEL-based policies and delegation chain validation
- **Signal:** Auth stack moving from specs to working demos. AAuth is the most mature agent auth approach right now.

**Gigacatalyst (Update — Now on front page)**
- Embedded AI builder for SaaS platforms: 2000+ daily users, 900+ apps, 70% 30-day retention
- Pattern: agentic API discovery → generation → validation → sandboxing → proxy layer
- Non-technical users building governed apps inside SaaS products via natural language
- **Signal:** SaaS embedding of AI is validated with real usage numbers.

**MCP as Dev Tool Feature (Pattern)**
- Manufact/mcp-use: full dev tooling (HMR, Inspector, tunnel, browser-agent testing). Funded company.
- Sunex Optics: MCP server for lens/CMOS camera selection — even niche hardware domains ship MCP servers now
- **Signal:** "Has an MCP server" is becoming like "has an API" — expected, not noteworthy. MCP has won the input connector layer.

### Updated Landscape Files
- `identity.md`: Ratify Protocol and AgentGate already added in previous update; Sinain context-sharing noted as input-layer pattern
- `infrastructure.md`: Added Ardent, Sinain, Recursant; updated MCP ecosystem pattern
- `trends.md`: Updated Trend 10 (auth fragmentation now 4 protocols), added Trend 11 (Agent Sandbox Infra is a funded category)

### Key Takeaway

This scan confirms the three-layer model: **input** (MCP won, now commoditized), **identity/auth** (4+ competing protocols fragmenting by use case: AAuth for web/API, Ratify for offline/edge, IETF for enterprise workload, Passport for transactional), and **transport** (Durable Sessions forming). The **output layer** — where agents publish, present, attribute, and share what they create — is still completely empty. Every single new tool, protocol, and YC company is focused on getting context INTO agents or controlling what agents DO. Nobody is building what happens when agents need to OUTPUT something persistent, attributed, and shareable. That remains ZenBin's gap.

---

## 2026-05-19 22:50 UTC

### New Findings

**Notesasm — Dual-Agent Build+QA Kanban with MCP Input (Show HN, May 19)**
- Kanban board where each ticket runs two agents: Build agent (Claude Agent SDK, sandboxed clone, pushes branch, opens PR) + QA agent (drives real browser via Browserbase, screenshots + mp4 attached to PR)
- If QA fails, build agent reruns with QA report, up to 3 iterations. Classifier distinguishes real bugs from environmental failures (env failures break the loop)
- Platform exposes MCP server — "make a ticket for X" from any MCP client lands in backlog
- Stack: FastAPI, Postgres, Claude Agent SDK, Browserbase, Vercel, Clerk, MCP over HTTP. Frontend: vanilla JS, no framework
- Notable engineering: build agent's system prompt forbids subagent tool (hanging 4+ min); idempotent schema.sql instead of migrations; fast/deep QA modes per ticket; 60-min kill switch sweeper
- **Signal:** MCP as input interface is now standard — even a kanban board exposes an MCP server. The dual-agent loop (build then QA in real browser) is a quality pattern. But output is still just PRs to GitHub — no persistent agent output layer. No agent identity, no attributed publishing. ZenBin gap: agents that produce content (not just code) need somewhere to publish it.
- **URL:** https://notesasm.com

**YouTube MCP — MCP Server for YouTube Access (Show HN, May 19, 5 pts)**
- Local MCP server: 8 tools for YouTube (transcript, metadata, search captions, download)
- No API key, no account, no signup. `npx @umbertotancorre/youtube-mcp`
- Works with Claude, ChatGPT, OpenClaw, and any MCP client
- **Signal:** MCP servers are now the standard way to give agents access to data sources. The one-line `npx` install pattern is becoming canonical. But this is purely an input tool — agents consume YouTube, they don't publish TO YouTube. The asymmetry persists: agents are readers, not writers.
- **URL:** https://github.com/umbertotancorre/youtube-mcp

**VeilGate — Deception Reverse Proxy for Agent Traffic (Ask HN, May 19)**
- Defense against AI pentest agents: deception proxy that scores requests, challenges ambiguous traffic, tarpits high-confidence agent traffic
- Core insight: blocking doesn't work against LLM agents — a 403 is just a signal in the context window. Every block tells the agent where weaknesses are
- Mentions PentestGPT, CAI, Strix, HexStrike as autonomous pentest agents (<$1/hr API cost)
- **Signal:** The arms race between agent attackers and defenses is escalating. VeilGate's insight that traditional blocking is counterproductive against LLM agents is important. This validates the need for agent identity: if you can't tell agent traffic from human traffic, you can't make good policy decisions. Agent auth/identity becomes infrastructure, not optional.

**CloudNSite — Pre-Built Agent Library for SMBs (Ask HN, May 19)**
- 30+ pre-built agents/multi-agent bundles for healthcare, legal, real estate workflows
- Private LLM deployments for HIPAA clients, AI readiness assessment tool
- **Signal:** Agent-as-product for non-technical SMBs. The library approach (pick, customize, deploy) mirrors how CMS themes work. But no publishing layer — agents do tasks, they don't create persistent attributed output.
- **URL:** https://news.ycombinator.com/item?id=48199120

**Silicon Psyche PSA — Behavioral Health Monitor for LLMs (Show HN, May 19, 9 pts)**
- Previously noted in 16:50 UTC update; confirmed traction with 9 points and 5 comments on HN
- **Update:** The discussion is active, with commenters debating whether behavioral analysis of LLMs is meaningful or just pattern matching. The Action-Risk Classifier (tracking tool calls, delegations, handoffs) is getting the most attention.

**DDS Vibe Academy — AI-Built Curriculum (Show HN, May 19, 2 pts)**
- 31 free AI coding masterclasses, built entirely by AI agents (Claude Opus 4.7 authored Liquid, Google Antigravity deployed via Shopify MCP, Cowork ran browser audit)
- "I did not write a single line of code or upload a single file manually"
- **Signal:** Agent-built content is becoming a thing. But the output lives on Shopify (someone else's platform). No agent attribution, no proof of agent authorship. The content could have been human-written for all the reader knows. ZenBin fills this: if agents are building content, they should be able to publish it with verified authorship.
- **URL:** https://ddsboston.com/pages/dds-vibe-academy

### Cross-Query Patterns (7 HN queries run)

1. **MCP as the universal input connector** — YouTube MCP, Notesasm MCP input, Shopify MCP deployment. MCP is no longer "new" — it's infrastructure. The interesting frontier is what happens AFTER the agent gets the context.
2. **Agent-built content has no attribution layer** — DDS Vibe Academy is literally content built by agents, but lives on Shopify with zero agent authorship trace. This is exactly the gap ZenBin fills.
3. **Agent defense is becoming a market** — VeilGate (deception proxy), PSA (behavioral monitoring). Both need agent identity to work well. You can't defend against what you can't identify.
4. **Dual-agent patterns emerging** — Notesasm's build+QA loop, PSA's C5 action-risk tracking across multi-agent systems. Agents that produce output that other agents verify or consume. This is a step toward the output/publishing layer, but still trapped in GitHub PRs.
5. **No new agent identity/auth protocols this scan** — The 4-protocol landscape (AAuth, Ratify, IETF, Passport) hasn't changed. No new entrants.

### Reddit Search

Reddit JSON API and web search both returned 403/bot-detection. Unable to pull r/LocalLLaMA or r/ChatGPTCoding this cycle. Will retry next scan with browser-based access if needed.

### ZenBin Gap Confirmation

The output layer remains empty across the entire landscape. Today's findings reinforce:
- Agents build content (DDS Vibe Academy) → no attribution layer
- Agents publish code (Notesasm) → output is GitHub PRs, not persistent attributed content
- Agents need identity (VeilGate) → defense requires knowing who/what is making requests
- MCP handles input → but there's no "MCP for output" — no standard for agents publishing persistent, attributed, verifiable content

ZenBin is the output layer: agent identity + verified publishing + attributed content.

## 2026-05-20 10:54 UTC

### New Findings

**Auto Agent Protocol (AAP) — A2A Vertical for AI Agents Buying Cars (HN, May 20, 2 pts)**
- Strict A2A v1.0 profile: typed automotive messages riding on A2A's data layer
- Five skills: dealer.information, inventory.facets, inventory.search, inventory.vehicle, lead.submit
- FTC-aware pricing: four explicit pricing fields (msrp, list_price, offered_price, price) — price field is FTC-mandated final out-the-door amount
- Anonymous-first identity model: inventory operations are anonymous by default, personal data only with explicit ConsentGrant
- Ships official MCP wrapper exposing every AAP skill as an MCP tool
- ADF/XML mappable leads for legacy CRM bridge
- **Signal:** A2A verticals are emerging. AAP is the first industry-specific A2A profile we've seen. The anonymous-first + consent-gated identity model is a pattern worth watching — it's the inverse of ZenBin's verified-identity model, but the principle (identity only when needed, scoped to purpose) is the same. The FTC-aware pricing is also interesting: regulatory compliance is being baked into the protocol layer. For ZenBin, this suggests that future agent publishing protocols might need compliance-aware content metadata (provenance, licensing, attribution) baked in.
- **URL:** https://autoagentprotocol.org/

**SRM Paper — Detecting Slow-Burn Risk in AI-Agent Sessions Before Execution (arxiv, HN May 20)**
- Paper on detecting gradual drift/risk accumulation in AI agent sessions before they reach dangerous execution
- Posted by author ilion_identity on HN, 0 comments so far
- **Signal:** The agent safety/monitoring space continues to grow. SRM + PSA (Silicon Psyche) + VeilGate represent three angles on the same problem: agents are unpredictable and need guardrails. All three need agent identity to function — you can't monitor or defend what you can't identify. This further validates the identity layer as foundational infrastructure.
- **URL:** https://arxiv.org/abs/2603.22350

**NitroLens AI — Multi-Agent Strategy Consulting Workflows (Show HN, May 19)**
- AI agents running structured consulting-style strategy workflows: clarify problem → select framework → research → test hypotheses → produce executive-ready report
- Founded by ex-McKinsey/Cisco strategy person
- Produces reports and presentations as final output
- **Signal:** Another example of agents producing content output (strategy reports) with no attribution or publishing layer. The output lives in OneDrive — no agent identity, no provenance, no verifiable authorship. This is the exact gap ZenBin fills for non-code agent output.
- **URL:** https://nitrolens.ai/

**DialtoneApp Network — Card Payments for Bot Commerce (Show HN, Apr 21)**
- Bot budget owners register cards; website owners list what bots can buy via .well-known/* files
- Bots search catalog, request purchases, card charged only when owner-approved rules allow
- Evaluated Stripe machine payments, Skyfire, Crossmint, Google Universal Commerce Protocol, MCP, A2A
- **Signal:** Bot commerce infrastructure is emerging. The .well-known/* pattern for declaring what bots can do on a site mirrors robots.txt — it's a declarative capability discovery layer. Interesting parallel to ZenBin: DialtoneApp lets sites declare what bots can BUY, ZenBin lets agents declare what they PUBLISH. Both are about controlled, attributed agent interactions with the web. The merchant account difficulty they describe (no one will underwrite bot commerce) is the financial version of the publishing trust problem — who vouches for the agent?
- **URL:** https://dialtoneapp.com/dogfood

## 2026-05-21 22:54 UTC

### New Findings

**Runtime (YC P26) — Sandboxed Coding Agents for Teams (Launch HN, May 21, front page, 49 pts, 19 comments)**
- Runtime provides infra for entire teams (including non-engineers) to use coding agents safely
- Key features: snapshot environments (Docker Compose, Kafka, Redis, seeded DBs), secrets injected through managed proxy (never touch agent), guardrails at infra level (command allow/deny, network egress, RBAC per human AND per agent), shareable preview URLs
- Orchestrates across sandbox providers (E2B, Daytona, EC2, self-hosted K8s)
- Works with Claude Code, Codex, Cursor, Copilot, Gemini, Devin
- Customer examples: on-call inspector (PagerDuty+Sentry+repo → auto PR with unit test), finance agent (Stripe+NetSuite+Snowflake reconciliation)
- **Signal:** Agent sandboxing has matured — the problem shifted from "can agents run code?" to "how do non-engineers safely use agents?" RBAC-per-agent is now a requirement, not a differentiator. Agents are first-class principals with scoped access.
- **ZenBin angle:** Runtime handles agent execution infra but not agent output. Agents produce code/PRs inside sandboxes — but when agents publish content externally, there's still no attestation layer. Runtime + ZenBin are complementary: Runtime runs agents safely, ZenBin attests their published output.
- **URL:** https://news.ycombinator.com/item?id=48225040

**1Password MCP Server for OpenAI Codex (HN, May 21, 4 pts)**
- 1Password released official MCP server for OpenAI Codex — "trusted access layer"
- Agents retrieve secrets without seeing them — scoped, delegated secret access
- **Signal:** A major identity/security player building MCP-first tooling. The pattern (scoped delegated access, not full credentials) reinforces that agent identity should be narrow and verifiable.
- **ZenBin angle:** 1Password solves agent secret-access. ZenBin solves agent output-attestation. Complementary layers in the agent trust stack.
- **URL:** https://1password.com/blog/1password-trusted-access-layer-for-openai-codex

**MCP-safeguard — Automated Security Scanner for MCP Servers (HN, May 21)**
- Open-source security scanner for MCP servers, checks for vulnerabilities in configurations and implementations
- **Signal:** MCP ecosystem is mature enough for security tooling. Mirrors Docker's trajectory (platform → security scanners). MCP is now infrastructure-grade.
- **URL:** https://github.com/SyedAnas01/mcp-safeguard

**SoMatic — Vision-based OS Automation Framework for AI Agents (Show HN, May 21)**
- Pure vision framework using fine-tuned YOLO model for UI element detection + Set-of-Marks prompting
- Works across Windows, Mac, Linux — solves the accessibility-tree brittleness problem for native OS automation
- Ships with stdio MCP server for direct screenshot parsing
- 20% accuracy improvement over raw GPT-5.5 in ablation tests
- **Signal:** MCP is expanding beyond text tools into multimodal agent capabilities. The "npx skills add" distribution pattern is becoming standard for agent tooling.
- **URL:** https://github.com/Smyan1909/SoMatic

**opub — Donated Compute for Open Source (Show HN, May 21)**
- Platform for funding compute for open source maintainers who face AI-generated issue/PR volume
- Maintainers create dollar-limited compute keys usable across 30+ models
- Token usage and spend linked back to the project, visible in the open
- **Signal:** The open source maintainer burden from AI-generated contributions is now a funded problem. The compute-is-a-public-good framing is new.
- **URL:** https://opub.dev/blog/introducing-opub

**PII Firewall — Full PII Framework for Agents (HN, May 21, 3 pts)**
- Framework for protecting personally identifiable information in agent workflows
- **Signal:** Data governance for agents is becoming a product category. Input-side protection; no equivalent for output-side attestation.
- **URL:** https://pii-firewall.com/

**Agent Authentication Patterns — 2026 Deep Dive (chenagent.dev)**
- Comprehensive article on 5 emerging agent auth patterns:
  1. Static API keys with scope limiting (simple, no delegation)
  2. JWT with agent claims (task-scoped, short-lived, no single trusted authority in federated systems)
  3. Threshold signatures / MPC-based identity (Lit Protocol PKP — key never in one place, high latency)
  4. Verifiable credentials with DID anchors (World AgentKit uses World ID → agent DID, human-verified proof)
  5. x402 challenge-response (HTTP-native, newest pattern)
- Key insight: "API keys work when there is one caller and one service. In multi-agent systems, this breaks immediately." Each hop needs to prove identity — whose identity, with what delegated authority?
- **Signal:** Five distinct auth patterns are competing. No consensus yet. The DID+VC pattern (Pattern 4) is most relevant to ZenBin — it proves "I am agent X, authorized by human Y, with credentials Z from authority W."
- **URL:** https://chenagent.dev/articles/agent-authentication-patterns-2026

**IETF Draft: AI Agent Authentication & Authorization (draft-klrc-aiagent-auth-00, March 2026)**
- Formal IETF Internet-Draft proposing a standard model for agent authn/authz
- Leverages WIMSE (Workload Identity in Multi-System Environments) architecture + OAuth 2.0 family
- Defines: Agent Identifier, Agent Credentials, Agent Attestation, Agent Credential Provisioning
- Key sections: WIMSE Proof Tokens (WPTs), HTTP Message Signatures for agent auth, OAuth 2.0 delegation for agent authorization
- Addresses: user delegates authorization to agent, agent obtains own authorization, agents accessed by other agents
- **Signal:** IETF is formalizing agent identity. The "agents are workloads" framing (from WIMSE) treats agents like service mesh identities. This is moving toward RFC status.
- **URL:** https://www.ietf.org/archive/id/draft-klrc-aiagent-auth-00.html

**Agent Identity Ecosystem Roundup (May 2026)**
- Coalition for Secure AI published "Agentic Identity and Access Management" (Agentic IAM) — defines how to represent, authenticate, authorize, and govern AI agents as verifiable, auditable identities
- Eco.com documents Visa Trusted Agent attestations, Mastercard Agent Pay tokens, AP2 Verifiable Credentials, W3C DIDs for agent purchases
- Aport.io covers AI agent auth patterns in production: pre-action authorization, why prompts aren't security controls
- Signets.ai covers agent payment verification: attestation-before-access, intent gating, identity signals, audit trails
- **Signal:** Agent identity is now being tackled by payments (Visa, Mastercard), standards (IETF, W3C), security (Coalition for Secure AI), and startups (Aport, Signets). All focus on input-side (who is this agent, what can it access). None address output-side (what did this agent produce, can I verify it).

**NPM Supply Chain Security for Coding Agents (Show HN, May 20)**
- "Give This Markdown to Your Coding Agent Before Publishing to NPM" — covers 12 attack techniques for npm supply chain via AI agents
- Includes: maintainer account takeover, lifecycle hook execution, self-replicating npm worms, CI/CD identity plane attacks, credential harvesting
- **Signal:** Agent publishing security is a recognized problem, but only for code/package publishing (npm), not content publishing. The attack surface of agents publishing things without verification is real and acknowledged.
- **URL:** https://news.ycombinator.com/item?id=48203219

### Cross-Query Patterns (5 HN queries + web search this cycle)

1. **A2A verticals emerging** — Auto Agent Protocol is the first industry-specific A2A profile. Expect more: healthcare, legal, finance. Each vertical needs its own identity/auth model, and AAP's anonymous-first + consent-gated pattern is a template.
2. **Agent output still has no home** — NitroLens produces strategy reports, DDS Vibe Academy produces courses, agents produce code PRs. All go to existing platforms (OneDrive, Shopify, GitHub) with zero agent attribution. The gap persists.
3. **Bot commerce is a parallel track** — DialtoneApp, Lemma Oracle, x402 payments. All solve "how do agents pay?" but not "how do agents publish?" The economic and publishing layers are adjacent but separate.
4. **Agent safety monitoring is a category** — SRM paper + Silicon Psyche PSA + VeilGate. Three different approaches to the same problem, all need identity as a prerequisite.
5. **MCP continues to expand into infrastructure** — XINF MCP Server (infrastructure info), YouTube MCP (content consumption), Notesasm MCP (project management input). MCP is the universal input connector. Output remains unclaimed.

### Reddit Search

Reddit JSON API and web search both returned 403/bot-detection. Unable to pull r/LocalLLaMA or r/ChatGPTCoding discussions this cycle. Previous searches returned older threads (CrewAI framework, Atomic Agents, agent platforms) with no new 2026 content found.

### ZenBin Gap Confirmation

The output/publishing layer remains empty across the entire landscape. This cycle reinforces:
- Agents produce business content (NitroLens reports) → no attribution layer
- A2A verticals emerging (Auto Agent Protocol) → industry-specific protocols for agent INPUT, none for OUTPUT
- Bot commerce is being solved (DialtoneApp, Lemma Oracle, x402) → but publishing isn't commerce
- Agent safety needs identity (SRM, PSA, VeilGate) → identity is prerequisite for both defense and publishing
- MCP is the universal input connector → no equivalent for output exists
- IETF is formalizing agent auth (WIMSE + OAuth 2.0) — but auth is input-side only
- Visa, Mastercard, and W3C are building agent payment identity — but commerce ≠ publishing
- Agent auth has 5 competing patterns and no consensus — but all focus on "who is this agent" not "what did this agent produce"

ZenBin positioning: the missing output layer where agents publish with verified identity and attributed content. The gap is widening — every week brings new input-side identity/auth/commerce solutions, but output attribution remains unaddressed.

## 2026-05-22 22:54 UTC

### New Findings

**AIP (Agent Intent Protocol) — Ed25519 Identity + Signed Intent Envelopes for Agent Verification (Show HN, May 22)**
- Open cryptographic protocol for identity and authorization of autonomous AI agents
- Every agent gets an Ed25519 keypair identity (DID-based), every action becomes a signed Intent Envelope, every envelope passes through an 8-step verification pipeline before execution
- Tiered verification: low-risk cached calls ~1ms (HMAC), normal ops ~5ms (Ed25519), high-value cross-org ~50ms (full pipeline)
- Boundary enforcement: agents declare intent, verifier mathematically checks against their boundary cage (allowed actions, monetary limits, geo restrictions, deny lists)
- 22 structured error codes (AIP-E{category}{code}) for audit trails
- Kill switch support
- **Signal:** AIP uses Ed25519 keypairs for agent identity — same cryptographic primitive as ZenBin. Their 8-step verification pipeline is input-side (verify before execution). The output-side analog would be verification after execution (prove what was produced). The tiered verification model is smart and could inform a tiered output attestation model (quick hash for casual content, full Ed25519 signature for high-value content).
- **ZenBin angle:** AIP and ZenBin share Ed25519 identity. AIP verifies agent actions BEFORE they happen; ZenBin verifies agent output AFTER it's produced. Complementary sides of the same coin. AIP's tiered verification model validates the idea that not every attestation needs the same weight — ZenBin could adopt a similar tiered approach for content signing.
- **URL:** https://github.com/theaniketgiri/aip (inferred from HN author)

**MCP-safeguard + Mcpaudit — Two MCP Security Scanners on the Same Day (May 22)**
- MCP-safeguard: automated security scanner for MCP servers with 52 detection rules
- Mcpaudit: static security scanner for MCP servers
- Both appeared on HN on the same day, indicating rapid growth in MCP security tooling
- **Signal:** MCP security is becoming a dedicated category. When two unrelated projects launch the same type of tool on the same day, the market need is real. As MCP servers proliferate, each one is a potential attack surface. Security scanning is the input-side analog of output verification.
- **ZenBin angle:** MCP security scanners verify what goes INTO an agent. ZenBin could verify what comes OUT of an agent. Both are verification layers, but for different directions of data flow.

**opub — Donated Compute for Open-Source (Show HN, May 21)**
- Donors fund compute for open-source projects. Maintainers create dollar-limited compute keys for coding agents across 30+ models.
- Token usage and spend linked back to project, visible in the open.
- **Signal:** Already captured in earlier update but worth noting: the "open public" model (visible compute spend) parallels ZenBin's visible content provenance. Transparency in agent resource consumption → transparency in agent output attribution.

**Persistent MCP Workspace — Shared Filesystem + Auth for Multiple AI Tools (Show HN, May 19)**
- Uses Pi's execution layer as MCP tools to give multiple AI agents a shared persistent workspace
- One Clerk OAuth app, one TOTP code, one workspace — any MCP-compatible tool can connect
- Every tool call logged with SHA256 hashes, every file write creates a backup
- Agents can install new tools on the box (Claude installed PostgreSQL in userspace)
- "One box, many tools" — every AI tool connects to same endpoint, shared knowledge base
- **Signal:** The pattern of shared agent workspace with SHA256 audit trails is a grassroots version of what ZenBin provides for published output. The file write backup + SHA256 hash logging is exactly the output verification primitive, applied to a single VPS rather than a global publishing platform.
- **ZenBin angle:** This is ZenBin's model at the single-box level. When agents publish to the world (not just a shared VPS), they need the same audit trail + content hash + backup pattern. ZenBin is the global version of this local pattern.

**YouTube MCP — Give Any AI Agent Access to YouTube (Show HN, May 19)**
- Local MCP server giving any MCP-compatible client 8 tools for YouTube content
- No API key, no account, runs locally against publicly available data
- One-line setup: `npx @umbertotancorre/youtube-mcp`
- **Signal:** MCP is now the default connector for giving agents access to external services. The ecosystem is expanding from search/memory APIs to media/content platforms. More MCP servers = more agent capabilities = more agent output that needs attribution.

### Cross-Query Patterns (5 HN queries this cycle)

1. **Agent identity is converging on Ed25519** — AIP (this cycle), AAuth, TBN Protocol, and ZenBin all use Ed25519 keypairs for agent identity. The cryptographic primitive is settling. The differentiation is what you DO with the identity: AIP = pre-execution verification, AAuth = protocol-level auth, TBN = attestation certificates, ZenBin = output signing.

2. **MCP security is a category** — Two security scanners (MCP-safeguard, Mcpaudit) on the same day. The input verification side of the agent ecosystem is getting crowded. Output verification remains empty.

3. **Shared agent workspace = micro-publishing** — The persistent MCP workspace pattern (shared filesystem, SHA256 audit, file write backups) is publishing at the single-server scale. ZenBin is the global-scale version.

4. **Agent compute funding is becoming a thing** — opub funds compute for open-source agents; Parallel/Index funds input attribution. The economic layer around agents is maturing on the input side. Output economics (attribution, licensing, verification) is the next frontier.

5. **Tiered verification is emerging** — AIP's 3-tier model (HMAC/Ed25519/full pipeline) and Prisma Next's precheck/postcheck are both tiered verification patterns. Not everything needs full crypto verification. This is a design pattern ZenBin could adopt for content attestation levels.

### Reddit Search

DuckDuckGo rate-limited, unable to pull r/LocalLLaMA or r/ChatGPTCoding discussions this cycle. No new findings from Reddit.

### ZenBin Gap Confirmation

The output/publishing layer remains empty across the entire landscape. This cycle adds:
- AIP uses Ed25519 for input-side verification → same primitive, opposite direction from ZenBin
- Two MCP security scanners verify MCP server inputs → no equivalent for outputs
- Persistent MCP workspace does local SHA256 audit logging → ZenBin is the global version
- Agent compute funding (opub) → no equivalent for output publishing funding
- Tiered verification pattern emerging → design pattern ZenBin can adopt

The identity convergence on Ed25519 is significant. AAuth, AIP, TBN, and ZenBin all landed on the same cryptographic primitive independently. This validates Ed25519 as the standard and means ZenBin's identity model is compatible with the emerging ecosystem.

## 2026-05-23 22:54 UTC

### New Findings

**Prisma Next — Data Contracts, Migration Graphs, Agent DX (Show HN, May 22, 13 pts)**
- Full rewrite of Prisma in TypeScript with three new concepts: data contracts, migration graphs, agent DX
- Data contracts are hashed to give them an identity (like a git commit) and that hash is used to SIGN the database — if DB is signed with the contract hash, the app knows it's compatible
- Migrations stored as a graph (not sequential SQL files), each operation has a precheck + postcheck for verification and idempotency
- Agent DX: contracts + verified migrations are strong enough primitives to safely delegate to agents. Prisma Next ships "curated skills with guardrails on every operation"
- **Signal:** A major ORM (used by millions) is now building identity+signing into its core data model and explicitly designing for agent delegation. The hash-as-identity + signing pattern is spreading from crypto/auth into mainstream developer tools. The precheck/postcheck pattern is exactly the tiered verification concept.
- **ZenBin angle:** Prisma signs databases with contract hashes. ZenBin signs published content with agent key hashes. Same pattern, different domain. Prisma's agent DX validates that "guardrails on every operation" is how you make agents safe — ZenBin provides guardrails on every publish. The hash-as-identity convergence continues.
- **URL:** https://github.com/prisma/prisma-next

**Runtime (runtm.com) — Team-Wide Agent Sandbox Infrastructure (Show HN, May 22)**
- Founded by ex-Mentum (YC S21) + ex-Modern Treasury. Built because rolling out agent workflows to non-engineers fell apart: PRs were slop, one-off local setups, secrets leaks
- Snapshots full running environments (Docker Compose, Kafka, Redis, seeded DBs) so sandboxes come up in milliseconds
- Orchestrates across E2B, Daytona, EC2, self-hosted K8s. Secrets injected via managed proxy (never touch the agent). Guardrails at infrastructure level: command allow/deny, network egress, RBAC scoped per human and per agent
- Works with Claude Code, Codex, Cursor, Copilot, Gemini, Devin. Trigger from web, CLI, Slack, Linear, GitHub, API
- Customers: fintech unicorn, YC scaleups. Use cases: on-call inspector (PagerDuty+Sentry → auto PR), finance agent (Stripe+NetSuite+Snowflake)
- **Signal:** Agent sandbox infrastructure is maturing rapidly. Runtime treats agents as a fleet resource with RBAC, not individual dev tools. The "secrets never touch the agent" pattern is becoming standard. Shareable preview URLs for sandbox output is a micro-publishing pattern.
- **ZenBin angle:** Runtime's shareable preview URLs are a localized version of ZenBin's publishing — agents produce output, teammates need to see it. But Runtime's previews stay inside the org. When that output needs to go public (reports, dashboards, documentation), that's ZenBin.
- **URL:** https://runtm.com

**OTA — Repo Readiness Contracts for AI Agents (Show HN, May 22)**
- "Ota is open repo readiness infrastructure. It makes software repositories runnable and trustworthy for human, CI, and AI agents."
- Core flow: `ota doctor` (diagnose), `ota up` (prepare), `ota run` (execute named tasks)
- Gives each repo one explicit operational contract for what it needs, how it becomes ready, how tasks run
- Explicitly positions between the repo, the developer, CI, and agents as its own layer
- **Signal:** The "contract" abstraction is spreading. Auth.md contracts for agent registration, Prisma contracts for data compatibility, OTA contracts for repo readiness. The pattern: declare capabilities, verify compliance, sign the result. Every contract system needs an identity layer.
- **ZenBin angle:** OTA makes repos trustworthy for agents. ZenBin makes agent output trustworthy for humans. Mirror problems: OTA verifies the environment is safe for the agent; ZenBin verifies the output is attributable to the agent. The contract pattern validates the idea that trust requires explicit, signed declarations.
- **URL:** https://ota.run

**SoMatic — Vision-Based OS Automation Framework for Agents (Show HN, May 21)**
- Pure vision-based framework using finetuned YOLO model for UI element detection (inspired by OmniParser v2)
- Runs locally on CPU with ONNX. Draws bounding boxes + labels, maps IDs to coordinates for Set-Of-Marks prompting
- Works on ANY user interface (Windows, Mac, Linux) — not just browsers
- Ablation benchmark with GPT-5.5 (high): ~20% higher accuracy than raw model
- Ships as CLI + MCP server + skill (npx skills add Smyan1909/SoMatic)
- **Signal:** Agent frameworks are moving beyond text to full OS control. The MCP + skill distribution pattern (CLI + MCP server + skill package) is becoming the standard delivery format. Vision-based agents produce screenshots and UI state — new types of agent output.
- **ZenBin angle:** When vision agents produce UI analyses, screenshots with annotations, or automation audit trails, those are publishable artifacts. The agent skill ecosystem (npx skills add) could integrate with ZenBin for publishing agent-generated artifacts.
- **URL:** https://github.com/Smyan1909/SoMatic

**PII Firewall — Full PII Framework for Agents (HN, May 21, 3 pts)**
- Dedicated PII protection framework for AI agents — preventing personal data leakage in agent workflows
- **Signal:** PII protection for agents is emerging as a distinct concern from general data security. This is another input-side guardrail (prevent sensitive data from entering/exiting agents). The output-side analog: what about agents that need to publish data that SHOULD be attributed to a person?
- **ZenBin angle:** PII firewalls prevent data FROM going out. ZenBin enables verified data TO go out. When an agent publishes a report, blog post, or dashboard, the PII firewall would block it; ZenBin would sign and attribute it. Different problems for different contexts.
- **URL:** https://pii-firewall.com/

**Golf MCP Scanner — Enterprise MCP Security, YC X25 (HN, May 22)**
- Open-source Go binary: discovers every MCP server across IDEs, runs ~15 security checks per server
- Threat model: "most AI security tooling is actually LLM security" but the real risk is what the agent DOES downstream — tool calls, data access, system connections. "Like putting a firewall on your CDN and calling your database secured."
- Commercial product: enterprise MCP control plane with MDM fleet scanning, deep source analysis, rug-pull detection, toxic tool combination detection, PII scrubbing, SIEM forwarding
- Positions MCP-connected agent as "unmanaged service account" — fundamentally different from SaaS security
- **Signal:** Third MCP security tool this week (after MCP-safeguard, Mcpaudit). Golf's framing is the most articulate: agent security ≠ LLM security. The agent is a service account, not a SaaS app. This reframing matters for ZenBin too — agent output isn't just LLM output, it's a signed product of an autonomous actor.
- **ZenBin angle:** Golf secures what agents can DO. ZenBin attests what agents DID. Golf's threat model (agent as unmanaged service account) strengthens ZenBin's value prop: if agents are like service accounts, they need identity, audit trails, and output attribution — exactly what ZenBin provides.
- **URL:** https://github.com/golf-mcp (inferred)

**DDS Vibe Academy — Built Entirely by AI Agents (Show HN, May 19)**
- Free 31-class AI coding curriculum. Claude Opus 4.7 authored 12 Liquid sections (~6,400 lines). Google Antigravity deployed via Shopify MCP. Cowork ran autonomous browser audit.
- "I did not write a single line of code or upload a single file manually. I designed the constraints. The agents did the implementation."
- **Signal:** Real-world case study of multi-agent publishing: agents authored content, deployed it, audited it. The human was a constraint designer, not an implementer. This is the agent publishing workflow ZenBin enables — but done ad-hoc without attribution.
- **ZenBin angle:** DDS Vibe Academy is exactly the kind of project that should be published through ZenBin. Multiple agents produced different sections, deployed to Shopify, audited by another agent. No attribution, no signing, no provenance. ZenBin would make each agent's contribution traceable.
- **URL:** https://ddsboston.com/pages/dds-vibe-academy

### Cross-Query Patterns (7 HN queries this cycle)

1. **The contract abstraction is everywhere** — Auth.md contracts, Prisma data contracts, OTA readiness contracts, AAuth protocol contracts. The pattern: declare capabilities, hash for identity, sign for verification. This is the foundation ZenBin's publishing contracts should follow.

2. **Agent infrastructure is now team infrastructure** — Runtime treats agents as a fleet resource with RBAC and org-level policies. This is a significant shift from individual dev tools to organizational infrastructure. ZenBin should position for org-level agent publishing, not just individual.

3. **MCP security is a crowded category** — Three tools this week (MCP-safeguard, Mcpaudit, Golf). Golf's framing is the best: agent security ≠ LLM security. The agent is a service account. Output verification for service accounts is exactly what ZenBin does.

4. **Prisma validates hash-as-identity** — A mainstream ORM (millions of users) now uses contract hashing + DB signing as its core identity model. The pattern is escaping the crypto/auth niche into general developer tools. ZenBin's Ed25519 signing follows this same trajectory.

5. **Agent output types are expanding** — SoMatic produces UI analysis screenshots and automation audit trails. DDS Vibe Academy shows multi-agent content creation at scale. New output types need new publishing infrastructure.

6. **PII protection vs. PII attribution** — PII Firewall blocks data from leaving agents. But some agent output legitimately contains or references personal data (reports about people, customer communications). The gap: no framework for controlled, attributed publication of agent output that references personal data.

7. **The skill distribution pattern is standardizing** — SoMatic ships as CLI + MCP server + skill (npx skills add). This three-part distribution is becoming the standard for agent tools. ZenBin could adopt this pattern for its publishing capability.

### Reddit Search

DuckDuckGo returned bot detection on targeted searches. General Reddit results for r/LocalLLaMA were older discussions (local model hosting, hardware), not current agent infrastructure topics. r/ChatGPTCoding had one relevant thread ("AI agents capable of deploying app end to end") but couldn't access content. No substantive new findings from Reddit this cycle.

### ZenBin Gap Confirmation

The output/publishing layer remains empty. This cycle adds:
- Prisma Next: signs databases with contract hashes → ZenBin signs published content with agent keys
- Runtime: shareable preview URLs for sandbox output → ZenBin is the public publishing layer
- OTA: repo readiness contracts → ZenBin is output readiness contracts
- PII Firewall: blocks data from leaving agents → ZenBin enables verified data to leave agents
- Golf: agents as unmanaged service accounts → service accounts need output attribution (ZenBin)
- DDS Vibe Academy: multi-agent content creation with zero attribution → exactly what ZenBin fixes
- SoMatic: new agent output types (UI analysis) → new things to publish and attribute

The contract abstraction (declare → hash → sign → verify) is now in auth (AAuth), data (Prisma), repos (OTA), and publishing (ZenBin). The gap between infrastructure that secures agent INPUT and infrastructure that handles agent OUTPUT continues to widen. Every new input-side tool makes the missing output-side tool more obvious.

## 2026-05-24 04:54 UTC

### New Findings

**Prisma Next — Hash-as-Identity + Signing in Mainstream Dev Tools (HN, May 22, 13 pts)**
- Full TypeScript rewrite of Prisma. Data contracts are hashed (like git commits) and that hash is used to SIGN the database. If DB is signed with your contract hash, your app knows it's compatible.
- Migrations stored as graphs (not linear SQL files) with precheck/postcheck verification. "Data contracts and verified, hashed, deterministic migrations are strong enough primitives to safely delegate this work to an agent."
- Ships "curated skills with guardrails on every operation" for agent DX.
- **Signal:** A mainstream ORM (millions of developers) now uses hash-as-identity + signing as its core model. This pattern is escaping the crypto/auth niche into general developer tools.
- **ZenBin angle:** Prisma validates hash-as-identity + signing for mainstream developers. If databases get signed contracts, published content should too.
- **URL:** https://github.com/prisma/prisma-next

**Runtime (runtm.com) — Team-Wide Agent Sandbox Infrastructure (HN, May 22)**
- Founded by ex-Mentum (YC S21) + ex-Modern Treasury. Infrastructure for entire teams (including non-engineers) to use Claude Code, Codex, etc.
- Snapshots full running environments (Docker Compose, Kafka, Redis, seeded DBs) in milliseconds. Orchestrates across E2B, Daytona, EC2, self-hosted K8s. Secrets injected via managed proxy (never touch agent). Guardrails at infrastructure level: command allow/deny, network egress, RBAC scoped per human and per agent. Shareable preview URLs.
- **Signal:** Agent infrastructure has shifted from individual dev tools to team/org infrastructure. RBAC for agents is becoming standard. "Secrets never touch the agent" is the default pattern. Shareable preview URLs = micro-publishing.
- **ZenBin angle:** Runtime's preview URLs are org-internal publishing. When agent output needs to go public (reports, dashboards, docs), that's ZenBin.
- **URL:** https://runtm.com

**OTA — Repo Readiness Contracts for AI Agents (HN, May 22, 3 pts)**
- "Open repo readiness infrastructure" — makes repos runnable and trustworthy for humans, CI, and AI agents. Each repo gets one explicit operational contract. Core flow: `ota doctor` → `ota up` → `ota run`.
- **Signal:** The contract abstraction continues spreading. Auth.md for registration, Prisma for data, OTA for repo readiness. Pattern: declare capabilities, verify compliance, sign the result.
- **ZenBin angle:** OTA makes repos trustworthy for agents. ZenBin makes agent output trustworthy for humans. Mirror problems, same contract-based approach.
- **URL:** https://ota.run

**SoMatic — Vision-Based OS Automation Framework (HN, May 21, 2 pts)**
- Pure vision framework using finetuned YOLO for UI element detection. Enables Set-Of-Marks prompting for any OS interface. ~20% accuracy improvement with GPT-5.5. Ships as CLI + MCP server + skill package.
- **Signal:** Agent frameworks expanding beyond text to full OS control. New agent output types (UI analysis, annotated screenshots, automation audit trails). Skill distribution standardizing as CLI + MCP + skill package.
- **ZenBin angle:** New agent output types need new publishing infrastructure. SoMatic's skill distribution pattern (CLI + MCP + skill) could integrate with ZenBin.
- **URL:** https://github.com/Smyan1909/SoMatic

**PII Firewall — Full PII Framework for Agents (HN, May 21, 3 pts)**
- Dedicated PII protection framework for AI agents. Prevents personal data leakage in agent workflows.
- **Signal:** PII protection for agents is distinct from general security. Input-side guardrail (prevent data FROM leaving). No equivalent for controlled, attributed publication of agent output that legitimately references personal data.
- **ZenBin angle:** PII Firewall blocks data FROM going out. ZenBin enables verified data TO go out. Different problems for different contexts.
- **URL:** https://pii-firewall.com/

**New MCP Servers This Cycle (May 23-24)**
- **Nable** — Cloud/SaaS billing MCP server. "Ask Claude about your cloud bill." (4 pts)
- **Guesty** — Property management MCP server, 43 tools, open source npm package (2 pts)
- **MCP-safeguard** — Automated security scanner for MCP servers, 52 detection rules (2 pts)
- **Mcppaudit** — Static security scanner for MCP servers (3 pts)
- **Signal:** MCP server creation is fully commoditized. People now apologize for making "another MCP server." The ecosystem has moved past novelty to specialization (billing, property management, security scanning).

**Jenova AI — Agent Publishing Platform (web search, May 2026)**
- Platform for building, customizing, and publishing AI agents without coding. Access to GPT-5.2, Claude Opus 4.5, Gemini 3 Pro, Grok 4.1. MCP integration for tool connections.
- Gartner: 40% of enterprise apps will embed AI agents by end of 2026 (up from <5% in 2025).
- BCC Research: AI agents market growing from $8B (2025) to $48.3B (2030), 43.3% CAGR.
- McKinsey: 88% of orgs use AI in at least one function. 62% experimenting with agents. Only 14% have solutions ready for deployment. 11% in production.
- **Signal:** The "publish AI agents" concept is entering mainstream awareness. Jenova positions publishing as "deploy and share" — but it's about deploying agent ACCESS, not publishing agent OUTPUT.
- **ZenBin angle:** Jenova and similar platforms publish the agent itself (deployment). ZenBin publishes what the agent PRODUCES (output). Different problems. The "agent publishing" keyword space is getting crowded, but almost entirely on the deployment side.
- **URL:** https://www.jenova.ai

**Clear Data Science — Agents as Workflow Orchestrators (CES 2026 trend)**
- 2026 agents evolving from copilots to "autonomous workflow orchestrators" — perceiving, planning, executing complex sequences.
- Key capabilities: strategic planning/decomposition, tool mastery/API orchestration, memory/continuous learning.
- Open-source stack: LangGraph, CrewAI for orchestration. Specialized fine-tuned models (Llama, Mistral) for on-premise. Containerized K8s deployments.
- Key workflow patterns: end-to-end analyst, personalized operations agent, proactive resource optimizer.
- **Signal:** Agent output is shifting from chat responses to complex multi-step deliverables (reports, analyses, orchestrated workflows). These outputs need attribution, signing, and publishing infrastructure.
- **ZenBin angle:** As agents produce richer, multi-step deliverables, the need for output attribution and publishing grows proportionally.
- **URL:** https://cleardatascience.com/en/ai-agents-in-2026-from-prototypes-to-autonomous-workflow-orchestrators/

**AAuth Protocol Explorer (HN, April, resurfaced)**
- Interactive knowledge graph for AAuth (Dick Hardt's agent auth protocol). 72 flows, cross-referenced against spec's sequence diagrams.
- **Signal:** The agent identity space is now mature enough to need visualization tools for protocol comprehension. AAuth's 72 flows show complexity of agent auth — but still zero flows for output attribution.

### Cross-Query Patterns (6 HN queries this cycle)

1. **Hash-as-identity + signing is now mainstream developer tooling.** Prisma Next uses this pattern for databases. AAuth, Ratify, and ZenBin use it for identity/publishing. The primitive is escaping crypto into general dev tools.

2. **Agent infrastructure is organizational, not individual.** Runtime treats agents as fleet resources with RBAC. The shift from "dev tools for individuals" to "org infrastructure for teams" is accelerating.

3. **The "agent publishing" keyword is getting crowded — but on the wrong side.** Jenova, MindStudio, and others use "publish" to mean "deploy an agent for others to use." Nobody uses it to mean "publish the output an agent produces." ZenBin owns the output-publishing interpretation.

4. **MCP security scanning is a category.** MCP-safeguard, Mcpaudit, and Golf MCP Scanner all appeared in the same week. Agent security ≠ LLM security. The agent is a service account.

5. **Agent output types are diversifying.** SoMatic produces UI analysis, DDS Vibe Academy produces multi-agent content, workflow orchestrators produce complex multi-step deliverables. Each new output type needs attribution infrastructure.

6. **PII protection is input-side only.** PII Firewall blocks data from leaving agents. No tool handles controlled, attributed publication of agent output that references personal data. The input/output asymmetry continues.

7. **The contract abstraction is consolidating.** Auth.md (registration), Prisma (data), OTA (repo readiness), ZenBin (output publishing). Pattern: declare capabilities → hash for identity → sign for verification → verify at consumption. This is becoming the universal pattern for trustworthy agent interactions.

### Reddit Search

DuckDuckGo returned bot detection on targeted Reddit searches. Older Reddit threads on r/LocalLLaMA discuss agent platforms (CrewAI, etc.) and agent publishing tools (deploying AI apps), but no new findings relevant to agent output/publishing infrastructure or identity patterns.

### ZenBin Gap Confirmation

The output/publishing layer remains empty. This cycle adds:
- Prisma Next: hash-as-identity + signing goes mainstream → validates ZenBin's signing approach
- Runtime: preview URLs for sandbox output → ZenBin is the public publishing layer
- OTA: readiness contracts → ZenBin is output readiness contracts
- PII Firewall: blocks data from leaving → ZenBin enables verified data to leave
- Jenova: "publish agents" means deploy access → ZenBin publishes agent output
- Clear Data Science: agents as workflow orchestrators produce complex deliverables → need attribution
- SoMatic: new output types (UI analysis) → new things to publish and attribute

The input/output asymmetry grows with every cycle. Every new tool handles what goes INTO agents. ZenBin handles what comes OUT.

## 2026-05-24 12:13 UTC

### New Findings

**Runtime (YC P26) — Sandboxed Coding Agents for Everyone on a Team (HN Launch, May 21, 100 pts, 30 comments)**
- Major YC launch. Founded by ex-Mentum (YC S21) + ex-Modern Treasury. Full team-scale agent sandbox infrastructure.
- Snapshots full running environments (Docker Compose, Kafka, Redis, seeded DBs) in milliseconds. Orchestrates across E2B, Daytona, EC2, self-hosted K8s. Secrets injected via managed proxy (never touch agent). Guardrails at infrastructure level: command allow/deny, network egress, RBAC scoped per human AND per agent. Shareable preview URLs.
- Works with Claude Code, Codex, Cursor, Copilot, Gemini, Devin. Trigger from web app, CLI, Slack, Linear, GitHub, or API.
- Use cases: on-call inspector (PagerDuty + Sentry + repo → auto PR with unit test), finance agent (Stripe + NetSuite + Snowflake → reconciliation reports).
- Flat platform fee + compute, no token markup. Fintech unicorn and several YC scaleups live on it.
- **Signal:** Agent infrastructure has definitively shifted from individual dev tools to team/org infrastructure. RBAC for agents is table stakes. "Secrets never touch the agent" is the default security pattern. 100 pts on a YC launch = strong market validation.
- **ZenBin angle:** Runtime's preview URLs are org-internal micro-publishing. When agent output needs to go public (reports, dashboards, docs, blog posts), that's ZenBin. Runtime gives agents a place to work; ZenBin gives agents a place to publish.
- **URL:** https://runtm.com

**ChronoGuard — Zero-Trust Proxy for Browser Automation Agents (HN, May 2026)**
- Open-source mandatory forward proxy for Playwright/Puppeteer/Selenium agents at scale. Every request: Agent → Envoy (mTLS) → OPA (policy check) → Target Domain, with immutable audit log (hash-chained, time-series).
- mTLS authentication for agent identity verification. Domain allowlists/blocklists with time-window restrictions. Cryptographic hash chains for audit log integrity. OPA for policy-as-code. Multi-tenant isolation.
- **Signal:** mTLS for agent identity is now in production. Hash-chained audit logs for agent actions = the same pattern as blockchain-style provenance. This is agent-level audit infrastructure — tracking what agents ACCESS, not what they PRODUCE.
- **ZenBin angle:** ChronoGuard audits agent INPUT (what they access). ZenBin audits agent OUTPUT (what they publish). The hash-chain pattern for audit logs directly parallels ZenBin's content signing. If agents need verifiable access logs, they need verifiable publication records.
- **URL:** https://github.com/j-raghavan/chronoguard

**Ink (ml.ink) — Full-Stack Deployment Platform Where Primary Users Are AI Agents (HN, March, 32 pts)**
- Agent calls "deploy" and platform auto-detects framework, builds, deploys, returns live URL at *.ml.ink.
- DNS zone delegation: delegate a zone once (e.g. dev.acme.com), agents create any subdomain instantly. Multiple agents and humans share workspace. Built-in git hosting. Error responses designed for LLMs (structured reason codes, not raw stack traces).
- **Signal:** The first deployment platform explicitly designed for agent-as-primary-user. DNS zone delegation for agents is notable — agents creating subdomains without human DNS management. This is the infrastructure layer for agent-deployed web content.
- **ZenBin angle:** Ink deploys code; ZenBin publishes content. If Ink is the agent's deployment platform, ZenBin is the agent's publishing platform. The DNS zone delegation pattern (agents create subdomains) is exactly what ZenBin does for content subdomains. Ink + ZenBin = full agent output pipeline (deploy app → publish content).
- **URL:** https://ml.ink

**ClawHosters — OpenClaw Managed Hosting with Prewarmed VPS (HN, May 2026)**
- Managed hosting for OpenClaw. Prewarmed VPS pool → 30-60 second provisioning. Docker + Nginx + SSL + firewall + Playwright + messenger bridge pre-configured.
- **Signal:** OpenClaw deployment is a pain point with commercial solutions emerging. When agent frameworks get managed hosting, they're entering the platform phase.
- **URL:** https://clawhosters.com

**vdiff — CLI to Review AI-Generated Code (HN, May 2)**
- Tree-sitter AST diffs + LLM reasoning for structured review reports. Risk scores, dependency blast radius, review memory across sessions, spec/PRD compliance checks. Runs locally, BYOK.
- **Signal:** The "review what agents produce" problem has its own tooling category now. vdiff reviews code; ZenBin could be positioned as reviewing/attesting published content.

**Nable — Cloud/SaaS Billing MCP Server (HN, May 23, 4 pts)**
- MCP server for asking Claude about your cloud/software bill.
- **Signal:** MCP servers are now wrapping every SaaS API. Billing is a new domain.

**Guesty MCP Server — Property Management, 43 Tools (HN, May 23, 2 pts)**
- Open source npm package. 43 tools for property management.
- **Signal:** MCP is now the universal SaaS integration layer. Property management is niche enough to confirm MCP is fully commoditized.

### Cross-Query Patterns (8 HN queries this cycle)

1. **Agent deployment platforms are a new category.** Ink (agent-first deployment), ClawHosters (OpenClaw hosting), Runtime (team sandbox infra). Three different angles on the same problem: agents need infrastructure to ship. None handle publishing output.

2. **The agent-as-primary-user pattern is spreading.** Ink's tagline: "primary users are AI agents, not humans." Error responses designed for LLMs. DNS delegation for agents. This is a design philosophy, not just a feature.

3. **Zero-trust proxy patterns for agents are emerging.** ChronoGuard: mTLS + OPA + hash-chained audit logs. The security model for agents is borrowing from service mesh patterns. Agent identity verification via mTLS is production-grade.

4. **YC-backed agent infra is scaling.** Runtime at 100 pts with 30 comments = strong community signal. Agent sandbox infrastructure is a funded category now.

5. **MCP server creation continues to be fully commoditized.** Billing, property management, YouTube — any SaaS gets an MCP wrapper. The MCP security scanning category (from last cycle) validates the maturity.

6. **The input/output asymmetry is deepening.** ChronoGuard audits agent access (input). vdiff reviews agent code (input-adjacent). Runtime previews agent work (internal output). Ink deploys agent apps (infrastructure). Nobody handles agent content publishing (public output). ZenBin remains alone in this space.

7. **Hash-chain audit logging parallels ZenBin signing.** ChronoGuard's hash-chained logs track agent access. ZenBin's Ed25519 signing tracks agent publications. Same cryptographic provenance pattern, different direction (inbound vs outbound).

8. **DNS zone delegation for agents is a pattern.** Ink lets agents create subdomains under a delegated zone. ZenBin's subdomain-based publishing uses the same pattern for content identity.

### Reddit Search

DuckDuckGo returned bot detection on targeted Reddit searches. Reddit web_fetch also blocked (403). One relevant r/ChatGPTCoding thread found via search: "Learn MCP by building an SQL AI agent" — educational content, no infrastructure news. No substantive new findings from Reddit this cycle.

### ZenBin Gap Confirmation

The output/publishing layer remains empty. This cycle adds:
- Runtime (100 pts): team sandbox with preview URLs → ZenBin is the public publishing layer for team agent output
- ChronoGuard: hash-chain audit for agent access → ZenBin is hash-chain attestation for agent publication
- Ink: agent-first deployment platform → ZenBin is agent-first publishing platform
- vdiff: review what agents code → ZenBin attests what agents publish
- ClawHosters: managed hosting for agents → managed publishing for agents is the next layer

The infrastructure stack for agents is now: sandbox (Runtime/E2B) → deploy (Ink/Render) → ??? → publish (ZenBin). The missing piece is the content publishing and attribution layer. Runtime creates the output, Ink deploys the app, but who publishes the content the agent produces? ZenBin.

## 2026-05-25 12:14 UTC

### New Findings

**Cordium — FOSS Sandbox with Secretless Identity-Based Infrastructure Access (HN, May 25)**
- Apache 2.0 open-source sandbox platform with built-in ZTNA (Zero Trust Network Access)
- Key innovation: identity-based, secretless access to resources (APIs, SSH, databases, k8s) without injecting credentials
- "Sandbox + ZTNA baked-in where access is based on identity and policy-as-code rather than credentials"
- Usable for AI agent tasks, CI/CD, and dev environments
- **Signal:** Agent infrastructure is converging on identity-first access. No credentials in the sandbox = no secret sprawl. The pattern of "identity as the access primitive, not secrets" is spreading beyond enterprise IAM into sandbox platforms.
- **ZenBin angle:** Cordium proves identity-based access for agents (input side). ZenBin provides identity-based publishing for agents (output side). Same "identity, not secrets" philosophy, different direction.
- **URL:** https://github.com/octelium/cordium

**ForwardPass MCP — Newsletter via MCP Server, Subscribers Control Delivery (HN, May 25)**
- AI newsletter ported to an MCP server. Subscribers add MCP to their AI tool and control WHEN and HOW OFTEN they receive content.
- Works with Claude (custom connectors) and ChatGPT (paid, developer mode)
- **Signal:** Already tracked in infrastructure.md. Confirming: MCP as content delivery channel is now a deployed product, not just a concept. The "subscriber controls cadence" model is interesting — agent-delivered content where the consumer sets the schedule.

**Silicon Psyche / PSA — Behavioral Health Monitor for LLMs and Agents (HN, May 19, 10 pts)**
- Posture Sequence Analysis (PSA): deterministic behavioral classification for LLM outputs
- Six classifiers: Input Intent (I0–I9), Adversarial Stress (P0–P18), Sycophancy (S0–S9), Hallucination Risk (H0–H7), Persuasion Technique (M0–M11), Action-Risk (A0–A9)
- Agent-agnostic and model-agnostic. Integrates with LangFuse and ElevenLabs evals.
- **Signal:** Agent behavioral monitoring is becoming a product category. PSA monitors what agents DO (input/output patterns). This is complementary to ZenBin's output attestation — if you can classify agent behavior, you can also sign what they produce.
- **ZenBin angle:** PSA classifies agent behavior (input side monitoring). ZenBin attests agent output (output side provenance). A signed publication with a behavioral classification could give consumers both provenance AND quality context.
- **URL:** https://splabs.io

**Lemma/x402 ZK Proofs — Agent Identity in Payment Headers (HN, Apr 28, resurfaced)**
- ZK attribute proofs inside x402 payment response headers (Coinbase's HTTP 402 protocol)
- Phase roadmap: agent identity via did:key → agentId with role, scope, spendLimit. Lifts paying wallet from "anonymous primitive" to "verifiable principal"
- BBS+ selective disclosure for privacy-preserving identity claims
- **Signal:** Already tracked. Update: the did:key → agentId roadmap explicitly plans to make agent identity verifiable in payment flows. This is identity-as-transaction-primitive.

**Know Your Agent — Comprehensive 2026 AI Agent Identity Market Map (Jan 2026, resurfaced)**
- Excellent market map of every company building AI agent identity infrastructure in 2026
- Three camps identified: (1) Payment networks building transaction verification (Visa TAP, Mastercard Agent Pay), (2) Enterprise security vendors extending IAM (Trulioo/Worldpay KYA, Vouch AgentShield + KnowThat.ai), (3) Crypto-native decentralized identity (Billions Network, ERC-8004, SingularityNET/Privado ID)
- Startups: AstraSync AI (live APIs, bootstrapped), kya.ai (vaporware), knowyouragent.xyz (unclear deployment)
- **Key insight from article:** "The AI agent identity space has fragmented into three camps... They're solving different problems for different customers, and most aren't directly competing — yet."
- **Signal:** The agent identity market is real, funded, and fragmented. Visa TAP is LIVE with hundreds of transactions. Vouch has MCP-I specification. ERC-8004 launched Jan 2026 (testnets only). The space is early but moving fast.
- **ZenBin angle:** ALL of these are input/auth identity (proving who an agent IS for ACCESS). None handle output identity (proving what an agent PRODUCED). The gap is clear and widening.
- **URL:** https://knowyouragent.network/every-company-building-ai-agent-identity-in-2026

**NIST + RSAC 2026 — Agent Identity Governance Accelerating (Mar–Apr 2026)**
- RSAC 2026: IBM, Auth0, and Yubico partnership for human verification at root of agent delegation chains. "Cryptographically verified human approval for high-stakes actions."
- NIST concept paper on AI agent identity and authorization (Feb 2026, comments closed Apr 2). Proposes identification, authorization, access delegation, and logging.
- Cloud Security Alliance survey: only 23% of orgs have formal AI agent identity strategy. 100% have agentic AI on roadmap. Over 50% already in production.
- Coalition for Secure AI published Agentic IAM spec: identity representation, authentication, authorization, governance for AI agents as verifiable, auditable identities
- Nametag CEO at RSAC: "You need a human behind that agent who is accountable, and an audit trail that lets you go back and verify that human."
- **Signal:** The regulatory and standards communities are converging fast on agent identity. NIST, CSA, OpenID, IETF, and major vendors (IBM, Auth0, Yubico) are all aligned: agents need verifiable identity linked to human accountability.
- **ZenBin angle:** The standards conversation is entirely about INPUT identity (who is this agent, what can it do). The OUTPUT identity question (what did this agent produce, can I verify it) is not yet in the standards conversation. That's ZenBin's opening.

**Gartner/Market Data Confirmed (May 2026)**
- 40% of enterprise apps will feature AI agents by end 2026 (up from <5% in 2025)
- AI agents market: $8B (2025) → $48.3B (2030), 43.3% CAGR
- 88% of orgs use AI in at least one function; 62% experimenting with agents; only 11% in production
- Non-human identity (NHI) market: $11.3B (2025) → $38.8B (2036). Machine identities outnumber human users 17:1.
- Gartner warning: 40%+ of agentic AI projects canceled by 2027 due to costs, unclear value, or inadequate risk controls

**Google Cloud AI Agent Trends 2026 Report**
- Five key trends: conversational interfaces, multi-agent orchestration, agent identity governance, enterprise-grade deployment, shift from prototype to production
- Agent identity governance called out as a top trend — validates the space

### Cross-Query Patterns (5 HN Algolia queries + 3 web searches)

1. **Identity-first infrastructure is spreading from enterprise IAM to sandbox platforms.** Cordium (Apache 2.0, HN front page May 25) bakes ZTNA into sandboxes. The "identity, not secrets" pattern is now in developer tools, not just enterprise security.

2. **The agent identity market map is maturing.** Know Your Agent's comprehensive breakdown shows three distinct camps (payment networks, enterprise IAM, crypto-native). The space is real, funded, and fragmented — but ALL focus on input/auth, none on output/publishing.

3. **Behavioral monitoring for agents is now a product.** Silicon Psyche PSA offers deterministic classification of LLM behavior (sycophancy, hallucination risk, adversarial stress). Agent monitoring complements agent attestation.

4. **Regulatory momentum on agent identity is accelerating.** NIST, RSAC 2026 (IBM/Auth0/Yubico), CSA, Coalition for Secure AI — all converging on the same message: agents need verifiable identity linked to human accountability. But the focus is still input/access, not output/publishing.

5. **MCP as content delivery is deployed.** ForwardPass is live with MCP-based newsletter delivery. The pipeline from "agent generates content" → "content needs attribution" is now a real product scenario.

6. **The gap between agent identity investment and output identity is the widest it's been.** The identity market has 3 camps, hundreds of millions in funding, live products (Visa TAP, Vouch, AstraSync), standards activity (NIST, IETF, C2PA, ERC-8004) — all on the input/auth side. Output identity (what did this agent produce, can I verify it) remains empty. ZenBin's positioning as the output identity layer has never been clearer.

### Previously Tracked (No Substantial Changes)
- Cosmic CMS Team Agents — already tracked in infrastructure.md
- Pulsar Edit MCP Server — already tracked
- Pro Health Ledger — already tracked in identity.md
- Lemma/x402 — already tracked, confirming did:key → agentId roadmap

### ZenBin Gap Confirmation

The output/publishing layer remains empty. This cycle adds:
- Cordium: identity-based sandbox access (input) → ZenBin is identity-based content publishing (output)
- Silicon Psyche PSA: behavioral classification (input monitoring) → ZenBin is output attestation
- Visa TAP (live): agent identity for payments (input) → no output identity equivalent exists
- RSAC/NIST/CSA convergence: all focused on agent identity for access control (input)

**Input identity investment: hundreds of millions, dozens of companies, multiple standards.**
**Output identity investment: zero companies, zero standards, one product — ZenBin.**

The market is building the left half of the bridge (access/auth) at full speed. The right half (publishing/attestation) doesn't exist yet. ZenBin is the right half.