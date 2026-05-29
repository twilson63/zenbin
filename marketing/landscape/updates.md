# Landscape Research Updates

## 2026-05-29 06:14 UTC

### New Findings

**AI Agent Governance: Identity, Delegation & Permissions in Practice (rootcx.com, May 28, HN story 48308648)**
- Author: seyz
- Comprehensive article on three models of agent identity: impersonation (bad), service accounts (bad), delegation (correct)
- Key insight: **Intersection model** — agent has its own identity, acts on behalf of a human. Effective permissions = intersection of agent role (ceiling) and human permissions (floor). Narrower scope always wins.
- "The agent carries no tokens. Checks no permissions. Knows nothing about the delegating user. All authorization happens at the platform level."
- Autonomous triggers (cron/webhooks): "No delegation context = deny. No exceptions."
- Audit integrity: audit trail must show both agent identity AND delegator identity
- **Signal:** The delegation/intersection model is becoming consensus for enterprise agent auth. Rootcx articulates it clearly: identity is the anchor, delegation is the mechanism, intersection is the enforcement. This is exactly how ZenBin's signing model works — the agent signs with its own key, and the key is bound to the agent's identity. The key IS the delegation proof.
- **ZenBin relevance:** ZenBin's Ed25519 keypair is a concrete implementation of the "agent has its own identity" principle. Every published page carries both the content and the cryptographic proof of which agent produced it. This is the output-side equivalent of rootcx's input-side delegation model.
- **URL:** https://rootcx.com/blog/ai-agent-governance-implementation

**The Agent Trust Stack: A Layered Framework (citizenofthecloud.com, May 28, HN story 48311546)**
- Author: williamk101
- 10-layer framework for evaluating agent trust infrastructure:
  - Layers 0-6 (trust establishment): Compute/Runtime → Model → **Identity** → Reputation → Policy/Commitment → Capability Restriction → Verification
  - Layers 7-9 (trust operationalization): Integration → Monitoring → Governance
- Key quote: "An agent system without a Layer 2 [Identity] binding cannot distinguish a legitimate agent making a permitted call from a spoofed request impersonating that agent, which makes every downstream guarantee meaningless because there is no verifiable subject to apply it to."
- Layer 2 (Identity) = keypair management, agent registration, signed request headers, identity challenges, operator binding
- Layer 4 (Policy) = signed, versioned declarations of scope and capabilities — "converts vague vendor promises into specific, signed, auditable commitments"
- Layer 6 (Verification) = formal verification of agent behavior against specifications
- **Signal:** The trust stack makes identity foundational (Layer 2) and explicitly states that without it, every other layer is meaningless. Signed policy declarations (Layer 4) are exactly what ZenBin does for content — every page is a signed, versioned declaration. The framework validates that identity + signing is the right abstraction.
- **ZenBin relevance:** ZenBin operates at Layers 2 (identity via Ed25519 keypairs) and 4 (signed content as policy commitment). The trust stack framework provides the conceptual vocabulary to position ZenBin within the broader agent trust ecosystem.
- **URL:** https://www.citizenofthecloud.com/blog/agent-trust-stack-layered-framework

**AG2B (Agent to Browser) — Browser-side Agent Runtime with WebMCP (Show HN, May 28, story 48308148)**
- Author: notmedia
- TypeScript agent runtime that runs entirely in the browser
- Two primitives: Tools (existing client functions wrapped for agent use) and Scopes (live context injection on each iteration)
- WebMCP plugin: exposes agent's tools through browser API (already testable in Chrome)
- Security model: agent can only call delegated tools, tools already hit authenticated/permission-checked endpoints
- Provider-agnostic (OpenAI/Anthropic built in, custom providers supported)
- React bindings (headless hooks + drop-in chat), Vue coming
- **Signal:** Browser-side agent runtime is a new pattern. Instead of running agents on servers and sending results to browsers, AG2B runs the agent loop where the UI already lives. This eliminates the server-side orchestrator and the tool registry duplication. The WebMCP integration shows MCP expanding beyond server-side to browser-side tool exposure.
- **URL:** https://github.com/ag2b/ag2b, https://ag2b.ai

**AstraCipher — W3C DID + Verifiable Credentials for AI Agents (MCP Server)**
- Open-source SDK giving every AI agent a verifiable, quantum-safe identity
- Built on W3C DIDs (did:astracipher:mainnet:abc123), Verifiable Credentials, and NIST post-quantum cryptography (ML-DSA-65 FIPS 204)
- Available as MCP server on mcpservers.org and mcpmarket.com
- **Signal:** Agent identity is becoming a product category. AstraCipher is building DID-based identity specifically for agents — not humans, not IoT devices, but AI agents. The MCP server integration means agents can verify each other's identities through the same protocol they use to exchange tools. The post-quantum crypto angle signals that agent identity is being taken seriously enough to future-proof against quantum computing threats.
- **ZenBin relevance:** AstraCipher and ZenBin use similar primitives (DIDs/Ed25519 keypairs, cryptographic signing) but solve different problems. AstraCipher solves "who is this agent?" (Layer 2 of the trust stack). ZenBin solves "what did this agent produce?" (output attestation). They're complementary: AstraCipher identities could be the DID layer that ZenBin content signatures reference.
- **URL:** https://astracipher.com, https://github.com/san-techie21/astracipher

**Declaw.ai — Firecracker MicroVM Sandboxing for AI Agents (May 28, HN story 48304227)**
- Tested Dirty Frag kernel exploit (CVE-2026-43284) against both containers and Firecracker microVMs
- Container sandbox: compromised in <2 seconds (root access, read /etc/shadow, host kernel visible)
- Firecracker microVM: exploit worked inside guest but couldn't reach host (separate kernel, bounded EPT memory mapping)
- Key insight: "What matters isn't what permissions the software grants — it's whether the kernel is shared."
- **Signal:** Agent sandboxing is a real security concern. Declaw.ai is building Firecracker-based sandboxing specifically for AI agent workloads. The Dirty Frag exploit validates that microVM isolation is fundamentally more secure than container isolation for untrusted agent code.
- **URL:** https://declaw.ai/blog/dirty-frag-microvm-isolation

**Agent Identity Verification: How AI Agents Authenticate Purchases in 2026 (Eco.com)**
- Four implementation models for agent identity in commerce:
  1. **Tokenized agent identities** (Mastercard Agent Pay)
  2. **Attestation headers** (Visa Trusted Agent Protocol)
  3. **Verifiable Credentials with signed mandates** (Google AP2)
  4. **Decentralized identifiers / DIDs** (crypto-native agents settling onchain)
- Each maps to a different trust anchor: card network, acquirer, issuer-signed VC, or self-sovereign identity
- **Signal:** Financial infrastructure players (Mastercard, Visa, Google) are building agent identity protocols for commerce. These are the input-side identity standards. The output side (proving what an agent published) is still unaddressed by any of them.
- **URL:** https://eco.com/support/en/articles/15192005-agent-identity-verification-how-ai-agents-authenticate-purchases-in-2026

**KYA (Know Your Agent) — Emerging Agent Identity Standard for Crypto/Web3**
- Proposed standard analogous to KYC but for AI agents
- ERC-8004 mentioned as the identity/legal framework for autonomous agents
- Trust scores, verification protocols, machine identity in Web3
- **Signal:** The KYA concept extends KYC thinking to agents. In financial contexts, agents need identity verification before they can transact. This is another input-side identity model — proving WHO the agent is before allowing actions. Output attestation (proving WHAT the agent produced) remains the gap.
- **URL:** https://calmops.com/web3/kyc-know-your-agent-ai-identity-complete-guide/, https://www.chainup.com/blog/know-your-agent-kya-2026-trend-ai-commerce

**SmolVM — Windows Sandbox for Legacy Software Automation (Show HN, May 26, story 48282202)**
- Open-source Windows Sandbox for automating legacy software with computer-use agents
- Agent harness + sandbox for any legacy Windows software
- Benchmark report coming soon
- **Signal:** Agent sandboxes proliferating. If legacy Windows automation gets its own sandbox product, agent infrastructure is maturing across every layer.
- **URL:** https://github.com/CelestoAI/SmolVM

### Updated Landscape Files
- `identity.md`: Added rootcx delegation model, Agent Trust Stack (10-layer framework), AstraCipher (W3C DIDs + post-quantum for agents), KYA/Eco.com four models, KYA/ERC-8004
- `infrastructure.md`: Added AG2B (browser-side agent runtime), declaw.ai (Firecracker sandboxing), SmolVM (Windows sandbox)
- `standards.md`: Added Agent Trust Stack layers, AstraCipher DID scheme
- `trends.md`: Updated identity-as-layer-2 pattern, browser-side agents trend, KYA emergence

### Key Takeaway

The Agent Trust Stack framework (citizenofthecloud.com) provides the conceptual vocabulary the industry was missing. Identity is Layer 2 — foundational, not optional. Without it, "every downstream guarantee is meaningless." This directly validates ZenBin's approach of making cryptographic identity the core primitive.

Three patterns crystallized:

1. **Delegation > Impersonation.** Rootcx's intersection model (agent permissions ∩ human permissions) is becoming consensus. Agent has its own identity, acts on behalf of a human. ZenBin's signing model is the output-side version of this.

2. **Identity is a product category.** AstraCipher (W3C DIDs for agents), KYA (agent KYC for crypto), Visa Trusted Agent Protocol, Mastercard Agent Pay — multiple independent efforts to give agents verifiable identity. All are input-side. None address output attestation.

3. **Trust stacks need Layer 2 + Layer 4.** Identity (who) + Policy Commitments (what they promise). ZenBin sits at this intersection — every published page is a signed, versioned policy commitment backed by a cryptographic identity.

---

## 2026-05-29 00:14 UTC

### New Findings

**ClickHouse ClickStack MCP Server & AI Notebooks (May 28, HN) — clickhouse.com**
- HN story_id: 48316857, 1 point
- ClickHouse announced three observability updates at Open House 2026: ClickStack Cloud (private preview), AI Notebooks (beta), and a ClickStack MCP server
- MCP server exposes observability data (logs, metrics, traces) to AI agents via MCP protocol
- AI Notebooks: Jupyter-like environment with AI-assisted querying of observability data
- ClickStack Cloud: fully managed, serverless observability on ClickHouse
- **Signal:** Another major infrastructure player adding MCP as a first-class interface. ClickHouse is treating MCP not as a demo feature but as a core integration — agents should be able to query observability data directly. This continues the pattern of MCP becoming the standard agent-tool interface. For ZenBin: MCP is the input layer; publishing with provenance is the output layer.
- **URL:** https://clickhouse.com/blog/observability-mcp-server-ai-notebooks

**Grove — Open-Source MCP Server for Obsidian Vaults (May 28, Show HN)**
- HN story_id: 48315461, 2 points
- Open-source MCP server that makes Obsidian vaults searchable/writable from any AI client
- Six tools: query (hybrid BM25+vector search), get (read with per-segment provenance/blame), multi_get, write_note, list_notes, vault_status
- Every write is a git commit. Provenance trailers on commits surface via blame — distinguishing "user's standing thinking" from "AI's moment-in-time synthesis"
- Uses QMD for BM25+vector indexing, Voyage AI for embeddings
- Was a hosted product (2026-04 to 2026-05), then pivoted to open-source single-user tool. Multi-tenant SaaS layer stripped.
- **Signal:** The provenance/blame feature is notable — Grove is doing for personal knowledge management what ZenBin does for public publishing: distinguishing human-originated content from AI-originated content. The git-backed provenance (every write = commit with attribution trailers) is the personal-knowledge version of ZenBin's Ed25519 signing. The pivot from SaaS to open-source single-user also validates that individual-agent provenance is the right starting point.
- **URL:** https://github.com/jmilinovich/grove

**AI Agent Frameworks Comparison: DSPy, Claude Agent SDK, OpenAI Agents SDK, CrewAI, AutoGen, LangGraph, Google ADK (May 28, HN)**
- HN story_id: 48312337, 2 points, 1 comment
- Comprehensive comparative analysis from deepresearch.ninja
- Decision matrix by priority: CrewAI (fastest prototype), LangGraph (production durability), Claude Agent SDK (deepest single-provider ops), OpenAI Agents SDK (cleanest multi-agent handoff), Microsoft Agent Framework (enterprise governance), DSPy (prompt optimization), Google ADK (cross-vendor interoperability via A2A)
- Key market data: $7.84B (2025) → $52.62B (2030) projected. Enterprise agentic AI average ROI: 171% (US: 192%)
- LangGraph leads production deployments (~400 firms, 34.5M monthly downloads). Claude Agent SDK most operationally capable single-provider. OpenAI Agents SDK cleanest delegation model.
- **Signal:** Framework proliferation continues but is consolidating around clear winners. Notably, none of these frameworks address output provenance or publishing. They all focus on how agents *run*, not what they *produce*. This confirms the gap: orchestration is solved; output attestation is not.
- **URL:** https://deepresearch.ninja/2026/05/AI-Agent-Frameworks-A-Comparative-Analysis-of-DSPy-Claude-Agent-SDK-OpenAI-Agents-SDK-CrewAI-AutoGen-LangGraph-and-Google-ADK/

**Colour Memory — MCP Server with 40 Historical Colour Archives (May 28, HN)**
- HN story_id: 48308579, 2 points, 2 comments
- MCP server exposing 40 historical colour archives (paint manufacturers, dye houses, art restorers)
- **Signal:** Niche MCP servers are proliferating. If 40 colour archives get their own MCP server, MCP is becoming the universal tool interface — any data source worth querying gets an MCP server. This is the "REST API moment" for agents.
- **URL:** https://colour-memory-api-production.up.railway.app/mcp

**nxs-universal-chart — Kubernetes Helm Chart with MCP Server for values.yaml Generation (May 28, Show HN)**
- HN story_id: 48306610, 3 points
- Open-source Helm chart for deploying apps to K8s/OpenShift
- Added MCP server for values.yaml generation and Helm chart validation
- 11 OCI-hosted subcharts, GitHub Actions CI/CD out of the box
- **Signal:** MCP as dev tool, not just data access. Using MCP to generate and validate config files is a new pattern — the agent-as-config-assistant. This is the infrastructure side of what ZenBin does on the content side: using AI to validate structured output.
- **URL:** https://github.com/nixys/nxs-universal-chart

**Nouswise — MCP Servers as Cited Research Layer (May 28, HN)**
- HN story_id: 48309137, 3 points
- Knowledge management platform using MCP servers for cited, grounded research
- 8 best practices for KM in 2026: connect KM to business outcomes, assign clear ownership, create trusted knowledge hub, design for real search behavior, build for AI-grounded answers, curate actively, integrate with workflows, measure and iterate
- **Signal:** The "trusted knowledge hub" concept aligns with ZenBin's vision. Nouswise grounds AI in curated sources; ZenBin attests to what the AI (or human) actually published. Both are about verifiable, grounded output rather than hallucinated content.
- **URL:** https://nouswise.com/blog/8-knowledge-management-best-practices-for-2026

### Key Takeaways (May 29 scan)

1. **MCP is the new REST.** Colour archives, Kubernetes config, observability data, personal notes — everything gets an MCP server. The "any data source worth querying gets an MCP server" pattern is accelerating.

2. **Provenance is spreading beyond compute.** Grove's per-segment blame (distinguishing human vs AI content in Obsidian) is the personal-knowledge version of what ZenBin does for public publishing. The concept is the same; the domain is different.

3. **Framework landscape is consolidating.** The deepresearch.ninja comparison shows clear winners per use case. None address output provenance — the gap remains wide open.

4. **No new direct competitors to ZenBin's publishing+provenance model.** The closest new entry is Grove's Obsidian provenance, but it's personal-knowledge (private), not publishing (public). Darwin and Circe cover compute attestation. ZenBin's content publishing attestation niche remains uncontested.

---

## 2026-05-28 18:14 UTC

### New Findings

**AI Agent Governance: Identity, Delegation & Permissions (May 28, HN) — rootcx.com**
- HN story_id: 48308648, 2 points
- RootCX blog post defining three models of agent identity: impersonation (agent acts as user = trap), service account (static credential = trap), delegation (agent has own identity + acts on behalf of user = correct)
- Key insight: effective authority = intersection of agent role ceiling AND delegator floor. Admin triggers narrow agent → narrow results. Intern triggers admin agent → intern results.
- "No delegator = deny" rule for autonomous triggers. Offboarded delegator kills the trigger. No exceptions.
- 8-point governance checklist: own identity, capability ceiling, intersection authority, deny-without-delegator, agent-is-auth-unaware, standing mandates for cron, short-lived audience-bound tokens, dual-identity audit
- RFC 8693 token exchange: identity-only tokens, 120-second lifetime, audience-bound
- **Signal:** This is the clearest articulation yet of the agent delegation model. RootCX is building a governance platform on these principles. The "agent knows nothing" pattern (all auth outside the agent process) directly parallels ZenBin's approach to output signing — the agent doesn't sign its own output; the platform validates and signs. RootCX handles input governance (what can the agent do); ZenBin handles output governance (what did the agent produce). They're complementary layers.
- **URL:** https://rootcx.com/blog/ai-agent-governance-implementation

**The Agent Trust Stack: A Layered Framework (May 28, HN) — citizenofthecloud.com**
- HN story_id: 48311546, 2 points
- 11-layer trust taxonomy for agent infrastructure:
  - Layer 0: Compute & Runtime (attestation, TEEs)
  - Layer 1: Model (swappable reasoning engine)
  - Layer 2: Identity (keypair, directory, signed headers, operator binding)
  - Layer 3: Reputation & History (behavioral tracking, trust scores)
  - Layer 4: Policy & Commitment (signed, versioned declarations of scope)
  - Layer 5: Capability Restriction (scoped tokens, network allowlists)
  - Layer 6: Action Verification (type checking, formal verification per action)
  - Layer 7: Audit & Provenance (append-only logs, transparency logs)
  - Layer 8: Orchestration (multi-agent workflows)
  - Layer 9: Integration (ERP connectors, API clients)
  - Layer 10: Interface (human-facing surfaces)
- Key insight: "Agent trust is often discussed as though it were a single property. It is not."
- Layers 0-7 = trust establishment; 8-10 = operational layers. Vendors at one layer often claim guarantees that only make sense at another.
- **Signal:** This is an excellent framework for positioning ZenBin. ZenBin sits at the intersection of Layer 2 (Identity — agent keypairs), Layer 4 (Policy — signed content commitments), and Layer 7 (Audit & Provenance — cryptographic proof of what was produced). No other player addresses the output provenance gap. The framework explicitly calls out "what did the agent actually do, and can we prove the record is complete and untampered?" — that's ZenBin's core value proposition.
- **URL:** https://www.citizenofthecloud.com/blog/agent-trust-stack-layered-framework

**Declaw.ai — Firecracker microVM Sandboxing for AI Agents (May 28, HN)**
- HN story_id: 48304227, 3 points
- Tested against Dirty Frag kernel exploit (CVE-2026-43284, CVE-2026-43500)
- Container sandbox: root in <2 seconds. Firecracker microVM: exploit contained inside guest, host unreachable
- Core argument: kernel sharing = shared vulnerability surface. microVMs isolate the kernel
- **Signal:** Infrastructure-level security for agents is maturing. Declaw.ai (different from HyperClaw) offers Firecracker-based sandboxing. The isolation argument (container vs microVM) is relevant to any agent platform running untrusted code.
- **URL:** https://declaw.ai/blog/dirty-frag-microvm-isolation

**AG2B — Run Agent Loop in Browser, Expose Tools via WebMCP (May 28, HN)**
- HN story_id: 48308148, 2 points
- Agent loop runs in the browser, not on the server
- Tools = existing client functions (store actions, click handlers)
- "Scopes" re-inject live context on every iteration
- WebMCP plugin: expose agent tools through browser API
- TypeScript, provider-agnostic, React hooks + drop-in chat
- **Signal:** MCP in the browser is a new pattern. If agents run in-browser with WebMCP, ZenBin's signing protocol could run client-side too. The "thin proxy" pattern (server just holds API keys, agent logic is client-side) could simplify publishing flows — sign locally, publish via API.
- **URL:** https://ag2b.ai, https://github.com/ag2b/ag2b

**VAEN — Portable AI Coding-Agent Harnesses (May 27, HN)**
- HN story_id: 48300485, 8 points, 3 comments
- Package and share agent harnesses (skills, MCP servers, config) as .agent files
- CLI to create from YAML, share, extract
- **Signal:** Agent portability is becoming a thing. VAEN packages the "harness" (everything an agent needs) as a shareable unit. This parallels how ZenBin packages the "output" (everything a publication needs) as a signed, verifiable page. Both address the portability problem from different angles.
- **URL:** https://github.com/sjhalani7/vaen

**MCP AuthFlow — OAuth 2.0 Framework for MCP Servers (May 27, HN)**
- HN story_id: 48296739, 3 points
- OAuth 2.0 framework specifically for MCP server authentication
- **Signal:** MCP auth is becoming its own product category. Every MCP server needs auth, but implementing OAuth correctly is hard. This is the infrastructure side of the identity problem.
- **URL:** https://github.com/brooksmcmillin/mcp-authflow

**MCP 2026 Roadmap: Production Connectivity Layer (May 28, tedt.org)**
- Not on HN (blog post), but comprehensive synthesis of Anthropic's public roadmap statements
- Key upcoming items:
  1. Stateless transport for horizontal scaling (June 2026 spec cycle)
  2. Server discovery via `.well-known` MCP Server Cards
  3. Tasks primitive: call-now/fetch-later for async agent work
  4. Cross-app access & enterprise-managed auth (SSO, Okta, Google Workspace)
  5. Triggers (webhooks for MCP — event-driven)
  6. Native streaming + reference-based results
  7. Skills over MCP: domain instructions bundled with tools
  8. MCP Apps & Extensions: interactive UI patterns from servers
  9. SDK v2 for Python & TypeScript
- **Signal:** The roadmap is entirely input-focused (how agents connect to tools, how servers expose capabilities). Zero mention of what happens after — no output attestation, no publishing, no content provenance. This confirms the gap: MCP owns the input pipeline, ZenBin owns the output pipeline.
- **URL:** https://tedt.org/MCPs-2026-Roadmap/

**AI Agent Identity and MCP Auth (May 28, guptadeepak.com)**
- CIAM-focused guide to agent identity via MCP
- Key data point: 10-30% of authentication volume now coming from agents (Descope/Auth0 2026 telemetry)
- MCP auth profile uses OAuth 2.1 + Dynamic Client Registration
- Best practice: agent tokens carry `sub=agent, act=human` claims (separate from human tokens)
- Web Bot Auth (IETF draft) for cryptographic bot identity at network layer
- Vendor snapshot: Descope (MCP-native), Auth0 (partial via Actions), Stytch (partial), Ory (partial), Curity (standards-purist)
- **Signal:** The CIAM world has noticed agents. The `sub=agent, act=human` pattern is becoming standard. This is identity-for-access; ZenBin adds identity-for-output (who produced this content). They're complementary.
- **URL:** https://guptadeepak.com/ciam-compass/guides/ai-agent-identity-mcp/

**AI Agent Frameworks Comparison (May 28, HN)**
- HN story_id: 48312337, 2 points
- Comparative analysis of DSPy, Claude Agent SDK, OpenAI Agents SDK, CrewAI, AutoGen, LangGraph, Google ADK
- **Signal:** Framework proliferation continues. Each framework has its own agent model, but none address output provenance. The comparison space is maturing (people want to know which to choose) but output/publishing remains unaddressed.
- **URL:** https://deepresearch.ninja/2026/05/AI-Agent-Frameworks-A-Comparative-Analysis-of-DSPy-Claude-Agent-SDK-OpenAI-Agents-SDK-CrewAI-AutoGen-LangGraph-and-Google-ADK/

**CircleCI Chunk Sidecars — Validating Agent-Generated Code Before CI (May 26, HN)**
- HN story_id: 48281284, 1 point
- Lightweight "microbuilds" in Firecracker microVMs synced from agent sessions
- Validation hooks on agent stop/evaluation events
- 27s average compute vs 5min for full CI, 3-5x lower token usage in retry loops
- **Signal:** Agent output validation is becoming its own category. CircleCI is validating code before it reaches CI — a narrow form of output provenance for code. ZenBin does the same for web content: validate and sign before it reaches the reader.
- **URL:** https://circleci.com/blog/chunk-sidecars/

**CelestoAI SmolVM — Windows Sandbox for Agent Automation (May 26, HN)**
- HN story_id: 48282202, 1 point
- Open-source Windows sandbox for running agents on legacy software
- **Signal:** Agent sandboxing is expanding to Windows. More platforms = more agent output that needs provenance.
- **URL:** https://celesto.ai/blog/posts/smolvm/windows-sandboxes/

**GitHub Commit Verification Logic Flaw (May 26, HN)**
- HN story_id: 48274410
- GitHub's "Verified" badge verifies the committer's key, NOT the author. Author and committer can be different people.
- The defense (vigilant mode) is opt-in, off by default, gated on the impersonated user's settings
- AI agents can exploit this: commit as anyone, sign with your own key, show as "Verified"
- **Signal:** This is a real-world example of the provenance problem ZenBin solves. GitHub's verification system proves who signed the commit, not who wrote the code. When agents produce output, you need to know who actually produced it — not just who signed off on it. ZenBin's signing model (key per agent identity, verifiable on-page) addresses this exact class of problem.
- **URL:** (Ask HN discussion)

**CoreMCP — MCP Server for On-Prem Databases (May 27, HN)**
- HN story_id: 48295485, 1 point
- MCP server for connecting to on-prem databases
- **Signal:** MCP expansion into enterprise data access. More data sources = more agent actions = more need for output provenance.
- **URL:** https://github.com/corebasehq/coremcp

**Colour Memory — MCP Server with 40 Historical Colour Archives (May 28, HN)**
- HN story_id: 48308579, 2 points
- Fun niche: MCP server serving historical colour palettes
- **Signal:** MCP servers are becoming the API layer for everything. The diversity of MCP servers means agents have more capabilities — and more output that needs verification.

### Updated Trend Signals

- **Agent identity delegation model is crystallizing:** RootCX's 8-point governance framework and the Trust Stack's 11-layer taxonomy both converge on delegation (agent has own identity, acts on behalf of human) as the correct model. This is exactly the model ZenBin uses for output: the agent signs with its own key, not the user's.
- **MCP auth is becoming a product category:** MCP AuthFlow, AgentAuth.co, Descope's MCP-native auth. The access side is being solved. The output/publishing side is wide open.
- **Agent output validation is a category:** CircleCI Chunk (code), Taste Skill (UI), and implicitly ZenBin (web content). Different domains, same problem: how do you verify what an agent produced?
- **GitHub's verification flaw = provenance problem:** The committer vs author gap is the exact class of problem ZenBin solves for web content.

## 2026-05-28 12:14 UTC

### New Findings

**Lelu — Open-source Authorization Engine for AI Agents (May 27, HN)**
- HN story_id: 48299318, 3 points
- Confidence-aware gating: every agent action carries a confidence score; low confidence routes to human review
- Human-in-the-loop review queue with full audit trail
- Rego-based policy-driven authorization (allow/deny/require-review per actor, action, resource)
- Integrates with Vercel AI SDK, LangChain, OpenAI, Anthropic, Claude, Mistral, LlamaIndex, CrewAI, AutoGPT
- **Signal:** Agent authorization is now a standalone product category. Lelu focuses on runtime action gating — WHAT an agent is allowed to do. This is orthogonal to ZenBin's output signing (WHO produced this content). The confidence-aware gating pattern is interesting — agents self-assess confidence and low-confidence actions pause for human approval. ZenBin could potentially integrate confidence scoring into page metadata.
- **URL:** https://lelu-ai.com

**Taste Skill — Anti-Slop Front End Framework for AI Agents (May 28, HN)**
- HN story_id: 48306196, 2 points
- Portable agent skills that upgrade AI-built interfaces: layout, typography, motion, spacing
- Uses Vercel's `npx skills add` CLI (AgentSkills spec, same as OpenClaw's skill system)
- v2 rewrite with design-system inference, variance/motion/density dials, em-dash ban, GSAP animation skeletons
- Multiple skill variants: design-taste-frontend, image-to-code, redesign-existing-projects, minimalist-ui, brutalist-ui, soft-skill (premium visual), output-skill (full output enforcement)
- **Signal:** The "anti-slop" movement for AI-generated UI is growing. Taste Skill addresses the quality of AI-generated output — specifically front-end code. This is the output quality problem from the generation side. ZenBin addresses it from the provenance side — even if output is high quality, you still need to know WHO produced it. The output-skill variant ("full output enforcement") is interesting — it's about forcing agents to complete their output rather than shipping half-finished work, which parallels ZenBin's focus on complete, signed, verifiable publications.
- **URL:** https://github.com/Leonxlnx/taste-skill

**Workplane — Collaborative Filesystem for Humans and AI (May 27, HN)**
- HN story_id: 48296569, 5 points, 2 comments
- Browser-based workspace for both humans and AI agents
- Renders HTML/Markdown files in browser with comments, versioning, sharing
- MCP-compatible: Claude Desktop, Claude Code, OpenClaw can access shared folders, read/edit files, generate artifacts
- **Signal:** Another player in the agent+human collaborative output space. Workplane focuses on the workspace/sharing layer — where content lives. ZenBin focuses on the publishing/provenance layer — how content is verified and attributed. They're complementary: Workplane is where you draft; ZenBin is where you publish with cryptographic proof.
- **URL:** https://workplane.co

**nxs-universal-chart — Helm Chart with MCP Server for Values Generation (May 28, HN)**
- HN story_id: 48306610, 2 points
- Helm chart for deploying apps to K8s/OpenShift; added MCP server for values.yaml generation and Helm chart validation
- **Signal:** MCP servers are proliferating beyond AI-native tools into DevOps/infrastructure. This validates the MCP protocol's reach but isn't directly competitive with ZenBin.
- **URL:** https://github.com/nixys/nxs-universal-chart

**VAEN — Portable AI Coding-Agent Harnesses (May 27, HN)**
- HN story_id: 48300485, 8 points, 3 comments
- CLI to package agent setups (skills, MCP servers, configs) as portable .agent files
- Share and extract agent configurations with one command
- **Signal:** Already tracked. Agent portability/packaging is a growing category. VAEN packages the agent's tooling configuration; ZenBin signs the agent's output. Different layers.
- **URL:** https://github.com/sjhalani7/vaen

### Updated Analysis

**Agent authorization is fragmenting into distinct layers:**
1. **Runtime action authorization** (Lelu): Can this agent perform this action? Rego policies + confidence scoring.
2. **Caller authentication** (MCP Authflow): Can this client invoke this MCP server? OAuth 2.0.
3. **Compute attestation** (Darwin): Did this computation actually run? Ed25519-signed receipts.
4. **Content attestation** (ZenBin): Did this agent publish this content? Ed25519-signed page signatures.

Each layer addresses a different trust question. The market is recognizing that "agent auth" isn't one thing — it's at least four distinct concerns.

**The "anti-slop" movement signals output quality awareness.** Taste Skill, Humanizer skills, and similar tools all address the same underlying problem from different angles: AI-generated output needs quality control. Taste Skill focuses on UI code quality; ZenBin focuses on output provenance. Both are needed — quality without provenance is unverified, provenance without quality is unhelpful.

**Collaborative agent+human workspaces are emerging.** Workplane joins a growing list (including OpenClaw itself) of platforms where humans and agents share a workspace. The key insight: workspace collaboration needs a provenance layer. When both humans and agents can edit the same files, you need to know WHO made each change — that's ZenBin's territory.

## 2026-05-28 06:14 UTC

### New Findings

**declaw.ai — Dirty Frag Kernel Zero-Day vs. Container/MicroVM Sandboxes (May 28, HN)**
- Tested CVE-2026-43284 (Dirty Frag) kernel zero-day against Docker containers vs Firecracker microVMs
- Container sandbox: root in <2 seconds (seccomp didn't help)
- Firecracker microVM: exploit worked inside guest but couldn't reach host (separate kernel, own kthreadd/kswapd, EPT-bounded memory)
- Key argument: what matters isn't permissions granted but whether the kernel is shared
- declaw.ai positions as sandboxing infrastructure for AI agents on Firecracker microVMs
- **Signal:** Agent sandboxing is now a real commercial category. Container-based isolation is structurally insufficient for multi-tenant agent workloads. ZenBin's Ed25519 signing proves output origin regardless of execution environment.
- **URL:** https://declaw.ai/blog/dirty-frag-microvm-isolation

**Darwin Agentic Cloud — Ed25519-Signed Attestation for Agent Compute (May 27, HN)**
- Satirical "Bill Gates memo" format but the product is real: compute routing + attestation layer for AI agents
- Routes agent workloads to AWS Lambda, Modal, Akash, or local Docker; executes in sandboxed environments with cost caps
- Produces Ed25519-signed attestation binding workload, output, sandbox, cost, and signer to tamper-evident receipt
- Receipts are independently verifiable forever, no dependency on Darwin to stay online
- CLI: `darwin run`, also integrated with Claude Desktop
- **Signal:** Direct competitor space — Ed25519-signed attestations for agent outputs. Darwin signs compute receipts (workload provenance); ZenBin signs content receipts (publication provenance). Darwin attests to the compute that happened; ZenBin attests to the content that was published. Overlap in signing tech, divergence in scope: Darwin is about trust in computation, ZenBin is about trust in content identity. Darwin also mentions "distributed attestation as the protocol for agentic programming" as a strategic goal.
- **URL:** https://hn.algolia.com/story/48289469

**Lyfe.ninja — Revocable Digital Signatures for AI Content Verification (Apr 21, HN)**
- Ask HN: "Would you use revocable digital signatures to verify AI/Other content?"
- Natively revocable signatures: hard revoke (delete signing model) or soft revoke (revoke lease)
- Use case: "Know your agent" — verify AI-generated content came from the intended agent and hasn't been altered
- Client-side verification, tampering causes verification failure
- Short-lived leases or full invalidation
- Developer-friendly: create account → lease signing model → OAuth creds → sign/verify via SDK/API
- Acknowledges C2PA and CRLs as related but limited approaches
- **Signal:** Another player in content-level verification for AI outputs. Key difference from ZenBin: revocability (signatures expire) vs permanence (ZenBin signatures persist). Revocability addresses the "would you stand by your agent's output forever?" concern but at the cost of historical integrity. ZenBin's approach (permanent, verifiable signatures) is closer to Git commit signing — the content existed as-is at that point in time. Also: lyfe.ninja uses proprietary signing models vs ZenBin's standard Ed25519.
- **URL:** https://news.ycombinator.com/item?id=47848539

**GitHub Commit Verification Logic Flaw (May 26, HN)**
- Author/committer identity mismatch: GitHub's "Verified" badge verifies the committer's key, not the author's identity
- Any user can create commits with arbitrary author fields; the green checkmark appears next to the author's name
- Defense ("Partially verified" badge) is opt-in, gated on the impersonated user's account settings, off by default
- Linus Torvalds hasn't enabled vigilant mode; neither have most GitHub users
- Made more urgent by AI agents ("Shai Hulud") generating commits
- **Signal:** This is exactly the identity gap ZenBin addresses. GitHub's verification proves WHO pushed (committer), not WHO wrote (author). Agent-generated content has the same problem — platform verification doesn't prove content origin. ZenBin's Ed25519 signing binds content to its actual creator, not just the transport layer.
- **URL:** https://news.ycombinator.com/item?id=48274410

**Tigera — Two Posts on AI Agent Accountability (May 26-27, HN)**
- "The Five Pillars of AI Agent Accountability" — diagnostic framework for engineering leaders
- "Agent Accountability Gap: Why Network Policies, API Gateways, & RBAC Aren't Enough"
- Network security vendor (Calico/Tigera) entering the agent accountability conversation
- **Signal:** Established infrastructure vendors are recognizing agent accountability as a gap. Their focus is on network-layer controls; they don't address content-level attestation. This validates the market but doesn't compete with ZenBin's output signing.
- **URL:** https://www.tigera.io/blog/the-five-pillars-of-ai-agent-accountability-a-diagnostic-framework-for-engineering-leaders/

### Updated Analysis

**Ed25519 signing is converging as the standard for agent attestation.** Both Darwin Agentic Cloud and ZenBin use Ed25519. Lyfe.ninja uses a proprietary model. The space is splitting between:
1. **Compute attestation** (Darwin): proves that a specific computation happened in a specific environment
2. **Content attestation** (ZenBin): proves that specific content was published by a specific agent/key
3. **Revocable content signing** (Lyfe.ninja): proves content origin with expiration

These are complementary layers, not competing products. Darwin says "this computation ran here." ZenBin says "this content was published by this agent." Lyfe.ninja says "this content was signed by this model (but I can revoke that)."

**GitHub's verification flaw is a real-world precedent for the problem ZenBin solves.** When even GitHub can't reliably tie content to its creator, the need for a dedicated, cryptographically sound content attestation layer is clear.

**Agent sandboxing (declaw.ai) validates the multi-tenant execution concern.** If agents are running in shared environments, the integrity of their output is only as strong as the isolation guarantees. ZenBin's signing doesn't replace sandboxing — it adds an orthogonal proof layer that survives even if the sandbox is compromised.

## 2026-05-28 00:14 UTC

### New Findings

**IETF draft-klrc-aiagent-auth-00 — Formal Agent Auth/Authz Model (March 2026)**
- Internet-Draft proposing comprehensive auth/authz model: agents as workloads, WIMSE + OAuth 2.0 foundation
- Covers agent identifiers, credentials, attestation, provisioning, transport + application layer auth, delegation (user→agent, agent→agent, system→agent)
- Three delegation patterns formalized
- Expires September 2026
- **Signal:** IETF standardizing agent auth as workload identity extension. Covers WHO agents are and WHAT they're authorized to do — not WHAT they produce/publish.
- **URL:** https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/, https://www.ietf.org/archive/id/draft-klrc-aiagent-auth-00.html

**MCP Authflow — OAuth 2.0 Framework for MCP Servers (May 27, Show HN)**
- Open-source OAuth 2.0 authorization server framework specifically for MCP servers
- PostgreSQL/in-memory token storage, RFC 6749/7523/7636/8628 compliance, PKCE, device auth grant, rate limiting, JTI replay protection
- **Signal:** MCP authentication is getting formal infrastructure. This is caller identity (who can invoke this server), not output identity (who produced this content). ZenBin complements — MCP auth controls access, ZenBin signing proves authorship.
- **URL:** https://github.com/brooksmcmillin/mcp-authflow

**VAEN — Portable AI Coding-Agent Harness Packaging (May 27, Show HN)**
- Open-source CLI for packaging and sharing agent harnesses (skills, MCP servers, configs) as `.agent` files
- Currently shared as .MD files; VAEN proposes a better way
- **Signal:** Agent configuration portability is becoming a real problem. If agents need portable configs, they also need portable content identity.
- **URL:** https://github.com/sjhalani7/vaen

**CircleCI Chunk Sidecars — Agent Code Validation Before CI (May 26, Show HN)**
- Lightweight Firecracker microVM sidecars for validating agent-generated code in the inner dev loop
- ~27s microbuild vs ~5min full CI; 3-5x lower token usage in retry loops
- Validation hooks on agent stop/evaluation events; auto-detects stack and test commands
- Works with Claude Code, Codex, Cursor
- **Signal:** Solves the timing gap — agents generate code and move on before CI catches failures. Validates code execution, not code authorship. Complementary to ZenBin: Chunk proves code works, ZenBin proves who published it.
- **URL:** https://circleci.com/blog/chunk-sidecars/, https://github.com/CircleCI-Public/chunk-cli

**AgentSafeLabs — Open-Source Security Evaluation for AI Agents (May 27)**
- Security evaluation framework (safelabs-eval) for assessing agent trustworthiness before deployment
- **Signal:** Like SOC 2 for agents — pre-flight security assessment. Complementary to ZenBin's post-flight attestation.
- **URL:** https://github.com/AgentSafeLabs/safelabs-eval

**Systima — Project Delivery Framework for Claude Code/OpenCode (May 25, Show HN)**
- 10 stage-aligned agents, 62 workflows for full project delivery lifecycle
- Audit-ready markdown linked to charter revision, source docs, model, prompt hash
- Adversarial red-team gate before anything leaves the machine
- **Signal:** Agent frameworks going vertical. The red-team gate is procedural review, not cryptographic proof. ZenBin provides what procedural review can't: verifiable, independent proof of content origin.
- **URL:** https://github.com/systima-ai/project-delivery-framework

**CoreMCP — MCP Server for On-Prem Databases (May 27, Show HN)**
- MCP server connecting AI agents to on-premise databases
- **Signal:** MCP extending into enterprise territory. On-prem databases are the last frontier.
- **URL:** https://github.com/corebasehq/coremcp

**RSAC 2026: IBM/Auth0/Yubico Partnership on Agent Identity (March 2026)**
- Partnership to solve human verification for AI agent actions
- Nametag CEO: "You need a human behind that agent who is accountable, and an audit trail that lets you go back and verify that human."
- **Signal:** Three major identity/security vendors converging on human accountability for agent actions. Audit trail framing = ZenBin territory.

**NIST Public Comment Period on AI Agent Identity (Feb-April 2026)**
- Concept paper on identification, authorization, auditing, non-repudiation for AI agents
- Focus on prompt injection controls and agent identity frameworks
- **Signal:** Government standardization of agent identity. "Non-repudiation" is the legal term for what ZenBin provides.

**Analytics Insight: Top Identity/Auth Platforms for AI Agents 2026 (May 2026)**
- Market overview: Microsoft Entra Agent ID (agents as separate identity category), Merge (integration-focused agent visibility), Nango (OAuth for agent APIs), Auth0/Okta (expanding for agent auth), HashiCorp Vault (agent credential management)
- Competitive battleground shifted from authentication to **governance** — who granted access, what agents can do, how actions are logged/audited
- Gartner: 40% of large enterprises now run autonomous agents in production
- **Signal:** Governance is the market differentiator. But governance = who did what, not who published what. Output attestation is the missing governance piece.

**CurrentAffair.today: AI Agent Identity Crisis (May 27, 2026)**
- Three critical OAuth failures for agents: MFA barrier, coarse-grained scopes, broken delegation chains
- 78% of orgs have no policy for creating/revoking AI identities (CSA)
- Emerging standards: WIMSE, AIMS, SPIFFE/SPIRE
- **Signal:** Mainstream recognition that agent auth is broken. Content-level delegation provenance is the missing piece.
- **URL:** https://www.currentaffair.today/blog/technology-13/ai-agent-identity-crisis-653

**Identigate: Agent Identity & Human Verification Gap (March 2026)**
- 40% of enterprise apps will have AI agents by end-2026, only 23% of orgs have agent identity strategy
- Machine identities outnumber human users 17:1 in large organizations
- NHI access management market: $11.3B (2025) → $38.8B (2036)
- "Authenticated but not verified" — agents have credentials but no verified link to accountable human
- **Signal:** Explicit market gap: authentication without verification. ZenBin = verification layer for published content.
- **URL:** https://identigate.com/blog/posts/2026-03-22-ai-agent-identity-human-verification/

**Securing AI Agent Infrastructure — Teri Radichel (May 27)**
- Substack series on securing AWS organization for AI agent deployment
- Focus on batch job security: proper networking, encryption, IAM controls, layered defense
- References OpenClaw as example of poorly-secured agent deployment
- **Signal:** Infrastructure security for agent deployment is becoming a content category. This is about WHERE agents run safely, not about WHAT they publish.
- **URL:** https://teriradichel.substack.com/p/securing-your-ai-agent-infrastructure

### Key Pattern This Scan

**The agent identity space is converging on governance as the competitive differentiator.** Authentication is table stakes. The question has moved from "is this agent who it claims to be?" to "who authorized what this agent can do, and can we audit it?"

The new IETF draft (draft-klrc-aiagent-auth-00) formalizes what others have been building: agents are workloads, use WIMSE + OAuth, get their own credentials. But it's still WHO/WHAT — not OUTPUT.

Three signals this scan:
1. **IBM/Auth0/Yubico partnership** — three major identity vendors converging on "human verification for agent actions" — audit trails as the solution
2. **78% of orgs have no AI identity policy** (CSA) — the gap is between adoption and governance
3. **MCP Authflow** — OAuth for MCP servers is now a product — caller identity for agent tools is being standardized

None of these address: "This content was produced by this agent on behalf of this human." The output attestation gap remains ZenBin's territory.

No Reddit findings this scan (Reddit JSON API returns 403).

## 2026-05-27 12:14 UTC

### New Findings

**ArkForge Trust Layer — 3-Witness Cryptographic Proof for Agent Transactions (March 2026, surfaced May 27)**
- Certifying proxy for agent API transactions: Ed25519 signature + RFC 3161 Timestamp Authority + Sigstore Rekor transparency log
- Three independent witnesses means no single point of failure — forging a proof requires compromising all three simultaneously
- Canonical JSON chain_hash = SHA256(request + response + payment_id + timestamp + buyer_fingerprint + seller_domain)
- EU AI Act Article 14 compliance framing — regulators want more than "here's our database"
- Free tier: 500 proofs/month
- **Signal:** The triple-witness model is the strongest attestation pattern yet seen. ArkForge attests to transaction provenance; Darwin attests to compute provenance; ZenBin attests to publishing provenance. Three complementary attestation layers. The market is building attestation infrastructure for every layer of the agent stack EXCEPT output/publishing.
- **URL:** https://arkforge.tech/trust/, https://dev.to/arkforge-ceo/how-we-built-cryptographic-proof-for-ai-agent-transactions-2p8g

**HDP (Human Delegation Provenance) — IETF Internet-Draft (April 2026)**
- Lightweight token-based protocol for cryptographically capturing human authorization in multi-agent delegation chains
- Ed25519-signed append-only chain: each agent delegation is a signed hop, fully offline verification (only issuer's public key + session ID)
- Explicitly argues that OAuth 2.0 Token Exchange, JWT, UCAN, and Intent Provenance Protocol all fail multi-hop, append-only, human-provenance requirements
- TypeScript SDK (@helixar_ai/hdp on npm), Python integrations, open-source at github.com/Helixar-AI/HDP
- **Signal:** Fifth delegation-focused protocol (AAuth, Ratify, AIP, HDP, EqhoIDs). All converge on Ed25519. All prove WHO authorized WHAT. None address WHAT the agent PUBLISHED. Delegation provenance without output provenance is incomplete.
- **URL:** https://arxiv.org/abs/2604.04522

**EqhoIDs — Agent-to-Agent Trust Protocol (2026)**
- Open protocol for agent-to-agent identity verification, delegation, and accountability
- Ed25519 passports, delegation chains, signed receipts
- Key insight: A2A and MCP solve interoperability but NOT trust between agents from different creators
- **Signal:** Another independent convergence on Ed25519. Identity fragmentation continues but all roads lead to the same crypto primitive. Still input-side (who are you, what can you do), not output-side (what did you create).

**BeeZee — Multi-Harness Agent Orchestration (May 27, Show HN)**
- Open-source orchestration for multi-node, multi-harness (Claude Code + Codex), multi-human systems
- Discovers harness instances, spawns/resumes sessions, tracks token usage, manages MCP servers across nodes
- Self-hosted server + cloud relay, or managed relay at app.beezyai.net
- **Signal:** Agent operations is a new product category. Managing multiple agent runtimes across machines is a real pain. MCP server management as a first-class feature. All about execution, not output.
- **URL:** https://github.com/BeeZeeAgent/beezee

**GitHub Commit Verification Identity Flaw (May 26, Ask HN)**
- Detailed analysis showing GitHub's "Verified" badge verifies the committer's key, not the author's identity
- Author field is freely settable — spoofed commit can show `author=torvalds, committer=anyone, verification.verified=true`
- Defense is opt-in (vigilant mode) and gated on the impersonated user's settings, not the attacker's
- AI agents authoring commits makes the author/committer identity gap a live attack surface
- **Signal:** Git commit identity is broken. The verified badge doesn't verify what people think. This is exactly the problem domain where ZenBin's cryptographic signing operates — proving WHAT was produced by WHOM with a verifiable signature on the content.
- **URL:** HN story 48274410

### Key Pattern This Scan

**Attestation infrastructure is being built for every layer of the agent stack except publishing.** This scan found four new entrants building cryptographic attestation/proof systems:

| Project | What It Attests | Method |
|---------|----------------|--------|
| Darwin Agentic Cloud | Computation ran as claimed | Ed25519 + public keylist |
| ArkForge Trust Layer | API transaction happened as claimed | Ed25519 + RFC 3161 TSA + Sigstore Rekor |
| HDP | Human authorized the delegation chain | Ed25519 append-only tokens |
| EqhoIDs | Agent identity + delegation between creators | Ed25519 passports + chains |

All four converge on Ed25519. All four prove something about agent INPUT (execution, transactions, authorization). None prove anything about agent OUTPUT (publishing, content creation). The attestation layer for publishing provenance is empty — that's ZenBin.

The GitHub commit verification flaw reinforces this from a different angle: even the existing "verified" system for code (the content type agents produce most) is broken. The verified badge doesn't verify what people think it verifies. ZenBin's Ed25519 content signing provides what GitHub's committer-only verification does not: proof of content origin.

No new Reddit findings this scan (Reddit JSON API blocked 403).

## 2026-05-27 06:14 UTC

### New Findings

**Darwin Agentic Cloud — Ed25519-Signed Attestations for Agent Compute (May 27, HN story 48289469)**
- Satirical "Bill Gates memo" format but describes a real product: Darwin Agentic Cloud
- Core offering: agent says "run this code," Darwin routes workload to Lambda/Modal/Akash/Docker, executes in sandbox, produces Ed25519-signed attestation binding workload + output + sandbox + cost + signer to tamper-evident receipt
- Receipts are independently verifiable forever, by anyone, with no dependency on Darwin to stay online
- Runs on Firecracker microVMs via E2B
- Positions itself as the "trust layer" between agents and compute — "verifiable trust will be crucial"
- Explicitly calls out: current verification models (API keys, signed JWTs, trust-on-first-use) are insufficient for agents
- Claims it's easier to find untrustworthy compute than verified compute on AWS Marketplace
- References MCP and A2A as the protocols that define agent tool-calling and inter-agent communication
- Available via `darwin run` CLI or Claude Desktop MCP integration
- **Signal:** Ed25519-signed attestations for agent execution validated as a product category. Darwin does for compute what ZenBin does for content — cryptographic proof of origin. The key difference: Darwin attests to *what code ran and what it produced* (execution provenance), ZenBin attests to *who published what content* (publishing provenance). They're complementary layers: Darwin = "this output came from this computation," ZenBin = "this content was published by this identity." Both solve the same root problem (platform trust is insufficient) from different angles. Darwin proves *how* something was made; ZenBin proves *who* made it. The convergence on Ed25519 signing independently validates ZenBin's crypto choice.
- **URL:** Referenced in HN story 48289469

**SmolVM / CelestoAI — Windows Sandbox for Legacy Agent Automation (May 26, Show HN)**
- Open-source Windows sandbox for automating legacy software with computer-use agents
- Handles weird pop-ups, lack of DOM, random clicks — the messy desktop automation problem
- Python SDK + CLI
- **Signal:** Agent sandboxes expanding beyond Linux/web to Windows desktop. Still all about safe execution environments (input side), not output.
- **URL:** https://github.com/CelestoAI/SmolVM

### Key Pattern This Scan

**Darwin Agentic Cloud is the strongest validation of ZenBin's approach yet seen.** It independently converges on the same three design decisions: (1) Ed25519 signing as the trust primitive, (2) independently verifiable receipts (no platform dependency), and (3) the assertion that API keys/JWTs/trust-on-first-use are insufficient for agent trust. Darwin does this for *compute attestations* (proving what code ran); ZenBin does it for *content attestations* (proving who published what). Same trust model, different layer of the stack. This makes ZenBin and Darwin complementary — an agent using both could prove "I ran this computation (Darwin) and published these results (ZenBin)." The market is converging on cryptographic attestation as the answer to agent trust.

No new Reddit findings this scan (Reddit JSON API blocked 403, web search returned only older posts).

## 2026-05-27 00:14 UTC

### New Findings

**MCP 2026 Official Roadmap Published (May 2026)**
- Four priority areas: Transport Evolution, Agent Communication, Governance Maturation, Enterprise Readiness
- Transport: Stateless sessions for horizontal scaling, `.well-known` metadata for server discovery
- Agent Communication: Tasks primitive (SEP-1686) iterating toward production (retry semantics, expiry policies)
- Governance: Delegated SEP review, contributor ladder, removing core maintainer bottleneck
- Enterprise: Audit trails, SSO auth, gateway behavior, config portability — mostly as extensions, not core
- Active SEPs: SEP-1932 (DPoP), SEP-1933 (Workload Identity Federation)
- Notably absent: Any mention of agent output/publishing, content attribution, or what happens after agents produce durable content
- **Signal:** MCP has formally prioritized its roadmap. Zero mention of output/publishing confirms the gap. MCP won the input layer and is now hardening it. The output layer is still empty.
- **URL:** https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/

**MCP Ecosystem by the Numbers (May 2026, Requesty)**
- 10,000+ public MCP servers, 97M monthly SDK downloads
- 72% of agent context window consumed by MCP tool schemas when connecting to multiple servers
- MCP Apps: tools returning interactive UI components (dashboards, forms, visualizations) — shipping in Claude, ChatGPT, VS Code, Goose
- MCP v2 Beta (March 2026): breaking changes, stricter auth, structured Task API for A2A delegation in Google ADK
- Microsoft Agent Governance Toolkit (AGT): open-source runtime governance for MCP tool execution
- **Signal:** Context window pollution (72% on schemas) is a production problem. MCP Apps make output richer *within conversations* but still ephemeral — not published. ZenBin makes agent output persistent and verifiable.
- **URL:** https://www.requesty.ai/blog/mcp-ecosystem-2026-building-agent-tool-infrastructure-that-scales

**Cordium — FOSS Sandbox with Identity-based Secretless Access (May 25, Show HN)**
- Apache 2.0 sandbox platform on Kubernetes via Octelium
- Identity-based, secretless access: workspaces access databases, APIs, SSH, K8s without injected credentials
- Every sandbox gets a dedicated Octelium identity, governed by ABAC + policy-as-code (CEL/OPA)
- Purpose-built for AI agents: dedicated identity per run, ephemeral storage, auto-stop on task completion
- OIDC/SAML/GitHub OAuth/FIDO2/WebAuthn/TOTP support
- OpenTelemetry-native auditing
- **Signal:** Identity-first agent infrastructure validated. Cordium proves agents need their own identity for execution. But it's about accessing resources (input side), not publishing outputs. ZenBin's Ed25519 signing for publishing is complementary — identity for execution + identity for output.
- **URL:** https://github.com/octelium/cordium

**Aigis — 43% of MCP Servers Have Injection Payloads (May 26, Show HN)**
- Security tool scanning MCP servers for prompt injection payloads
- Claims 43% of surveyed MCP servers contain injection payloads
- **Signal:** MCP security concerns accelerating. Input-side security (what goes into agents) has multiple products. Output-side security (what agents produce) has none.
- **URL:** HN story 48274026

**GitHub Commit Verification Logic Flaw (May 26, Ask HN)**
- Detailed analysis: GitHub's "Verified" badge verifies committer's key, not author's — spoofable
- Author/committer mismatch exploitable: "Partially verified" defense is opt-in and gated on victim's settings
- Directly relevant to AI agents: agents committing code with forged author identity is a known attack vector
- **Signal:** Even mature identity systems get attribution wrong. Git identity is asserted, not proven. ZenBin's Ed25519 signing proves who published what. The GitHub flaw shows why cryptographic proof of content origin matters — platform trust is insufficient.
- **URL:** https://news.ycombinator.com/item?id=48274410

**Five Pillars of AI Agent Accountability (May 26, Tigera)**
- Diagnostic framework for engineering leaders
- **Signal:** Accountability rising as a concern — but for what agents DO (execution), not what they PUBLISH (output). No output attribution in the framework.
- **URL:** https://www.tigera.io/blog/the-five-pillars-of-ai-agent-accountability-a-diagnostic-framework-for-engineering-leaders/

**Systima — Project Delivery Framework for Agents (May 25, Show HN)**
- 10 agents, 62 workflows for full project/delivery lifecycle
- Audit-ready markdown outputs linked to charter revision, source docs, model, prompt hash
- Adversarial red-team gate for anything leaving your machine
- **Signal:** Output provenance is emerging as a requirement. Systima tracks what produced what (model hash, prompt hash) and gates outbound content with adversarial review. This is internal output validation — ZenBin does it for public publishing.
- **URL:** https://github.com/systima-ai/project-delivery-framework

**CloudPostOffice — Realtime Messaging for Agents (May 25, Show HN)**
- Minimal messaging: `postbox('id', 'secret').send()` / `.listen()`
- **Signal:** Agent-to-agent communication infrastructure. Transport layer, not publishing.
- **URL:** https://cloudpostoffice.com/

**SoMatic — Vision-based OS Automation for AI Agents (May 21, Show HN)**
- YOLO-based UI element detection for any interface (not just browser DOM)
- ~20% higher accuracy on GPT-5.5, runs locally with ONNX, includes MCP server
- **Signal:** More capable agents = more output. More output without publishing infrastructure = more ephemeral, unattributed content.
- **URL:** https://github.com/Smyan1909/SoMatic

**Nilbox — Desktop GUI Sandbox for AI Agents (May 26, Show HN)**
- Desktop sandbox for agents and MCP servers
- **Signal:** Sandboxing expanding to every surface. All input-side isolation.
- **URL:** https://github.com/rednakta/nilbox

**PII Firewall — PII Framework for Agents (May 21, HN)**
- Structured PII governance for agent data flows
- **Signal:** Privacy/compliance for input data. No equivalent for output.
- **URL:** https://pii-firewall.com/

**CredWork — Project Tracking for AI Agents (May 26, Show HN)**
- Project tracking + showcasing with MCP server integration
- Agents create and update tasks as they work, builds activity heatmap
- **Signal:** Agents tracking their own work via MCP is a pattern. But tracking work ≠ publishing output.
- **URL:** https://www.credwork.co/

**Co-Invest — MCP Server for Trading (May 26, HN)**
- MCP server letting Claude and ChatGPT execute real trades
- **Signal:** MCP enabling agents to take real-world financial actions. The output/publishing gap extends to financial transactions — agents can trade but can't cryptographically prove their trade decisions.

**MCP Lisp REPL Sandbox (May 26, HN)**
- MCP server giving agents a sandboxed Lisp REPL
- **Signal:** MCP as a universal tool interface continues to expand. Every capability gets an MCP wrapper.

**Speakeasy — "Every MCP Server Needs an Install Page" (May 26, HN)**
- Blog arguing MCP servers need dedicated install pages for discovery
- **Signal:** MCP ecosystem maturing — distribution/discovery is a recognized problem. Same challenge ZenBin will face for content discoverability.
- **URL:** https://www.speakeasy.com/blog/every-mcp-server-needs-an-install-page

**Chunk Sidecars (CircleCI) — Validating Agent Code Before CI (May 26, Show HN)**
- Firecracker microVMs that validate agent-generated code in the inner dev loop
- Auto-detects stack, syncs from agent session, runs microbuilds before commit/push
- ~27s average microbuild, 3-5x lower token usage in retry loops
- **Signal:** Major CI company building dedicated agent validation. The pattern: validate agent output before it leaves the session. This is "input validation for agent output" — but only for code. ZenBin does it for content.
- **URL:** https://circleci.com/blog/chunk-sidecars/

**StackWell — "AI Agent Output Validation: How to Stop Bad Actions Before They Ship" (May 2026)**
- Comprehensive practical framework for validating agent output before execution
- Four validation layers: schema validation, business-rule validation, policy/risk validation, state verification
- Key insight: "Do not trust the model's output just because it is well-written. A polished bad answer is still a bad answer."
- Pattern: agent proposes action → system validates → system assigns risk level → route to approval or execute → log result
- Explicitly calls out: validation is a HARD control (enforced by system), prompts are SOFT controls (model can ignore)
- Covers: schema checks, state preconditions, numeric limits, duplicate prevention, risk-tiered approval gates, idempotency keys
- **Signal:** Output validation is being named as a distinct practice area, separate from input safety or model alignment. This is the enterprise version of what ZenBin does for web content — StackWell validates agent actions before they execute, ZenBin validates agent content before it publishes. The concept of "the model proposes, the system validates" is exactly right. But StackWell only addresses actions (API calls, emails, tickets), not content publishing. The publishing layer is still unaddressed.
- **URL:** https://iamstackwell.com/posts/ai-agent-output-validation/

**CallSphere — "Agent Identity and Authentication: A 2026 Field Report" (May 2026)**
- Production field report on agent identity patterns in the US market
- Pattern: short-lived signed tokens binding agent action to user session, OAuth on-behalf-of flows, per-tenant service principals
- Key anti-patterns: long-lived API keys in agent prompts, shared agent identities across tenants, "the LLM picks the user"
- Reference architecture: untrusted input → input sanitization → sandboxed agent → policy engine → tool execution (least privilege) → audit log, with PII redaction on outputs
- A2A (agent-to-agent): pass the chain of identity through, not "trust the parent"
- **Signal:** Production patterns converging on short-lived tokens + per-session binding + audit trails. The reference architecture is entirely input-side (sanitization, policy engine, tool allowlists). Output validation appears only as PII redaction — confirming the gap. No mention of content provenance, publishing identity, or output attestation.
- **URL:** https://callsphere.ai/blog/agentic-ai-agent-identity-auth-in-united-states-2026

**Akeyless — "2026 State of AI Agent Identity Security" (May 2026)**
- Global survey of 400 security and IT leaders on agent identity trends
- Covers: secrets management, certificate lifecycle automation (PKI), privileged access (PAM), identity governance
- **Signal:** Industry report confirming agent identity security is a recognized market segment. Entirely about access/secrets/privileges (input side). No mention of output identity or content provenance.
- **URL:** https://www.akeyless.io/ebooks/state-of-ai-agent-identity-security-report/

### Key Pattern This Scan

**Output validation is being named as a practice area.** StackWell's article is the most comprehensive practical framework we've seen for agent output validation — but it's limited to action validation (API calls, emails, tickets), not content publishing. The concept of "the model proposes, the system validates" is exactly right and directly parallels ZenBin's model: "the agent publishes, ZenBin verifies."

**The MCP 2026 roadmap is the biggest signal this cycle.** Four priority areas confirmed, zero mention of output/publishing. MCP has won the input layer (97M monthly SDK downloads, 10K+ servers). It's now hardening for production with stateless transport, governance, and enterprise readiness.

The 72% context window problem shows MCP's success creating its own scaling issues. MCP Apps (tools returning interactive UI) make agent output richer within conversations — but still ephemeral.

On identity: Cordium (identity-based sandbox access) and the GitHub commit verification flaw are the two strongest signals this cycle. Cordium proves agents need their own identity for execution. GitHub's flaw proves that even mature systems get attribution wrong. **ZenBin's cryptographic signing model is exactly what the GitHub flaw needs — content carries its own proof of origin, independent of platform trust.**

On security: Aigis (43% of MCP servers have injection payloads) and FlowLink (MCP proxy firewall) from the previous cycle continue the input-side security trend. Zero products address output-side security.

On publishing: Systima's "adversarial red-team gate for outbound content" is the closest to output validation — but for internal docs, not web publishing. CircleCI's Chunk sidecars validate agent-generated code before CI — the pattern of "validate before publish" is exactly right, but code-only.

**The gap remains and is widening:** The entire industry is building on the input side (MCP, tools, context, identity, security, validation). The output side — publishing agent content with cryptographic attribution — is still ZenBin's alone.

## 2026-05-26 18:14 UTC

### New Findings

**FlowLink — MCP Proxy Blocking Destructive Agent Commands (May 26, HN)**
- Rust-based MCP proxy that sits between AI agents and tools to intercept destructive commands
- Shield Engine intercepts rm -rf, DROP TABLE, git push --force, chmod 777 and 100+ destructive patterns
- Policy Engine: per-agent, per-tool rules ("Claude can read but not delete")
- Zero-Trust Secrets: scoped, time-limited tokens instead of raw credentials
- Telegram approval queue for human-in-the-loop on high-risk operations
- Full audit trail of every agent action
- Works with Claude Code, Cursor, Copilot, any MCP-compatible agent
- References recent "AI agent deleted production database" post (860 pts on HN) as motivation
- **Signal:** MCP security tooling is now a product category. FlowLink is an MCP proxy/firewall. The input layer is getting defense-in-depth. No one is protecting the output side — what agents publish is still unguarded.
- **URL:** https://flowlink.flow-masters.ru

**Chunk Sidecars (CircleCI) — Validating Agent-Generated Code Before CI (May 26, Show HN)**
- CircleCI's open-source project: lightweight microVMs that validate agent-generated code in the inner dev loop
- Firecracker microVMs on E2B infrastructure, 4 CPU / 8GB RAM
- Auto-detects stack and test commands, syncs changes from agent session, runs microbuilds before commit/push
- Validation hooks trigger during agent stop/evaluation events
- Measured: ~27s average microbuild, 3-5x lower token usage in retry loops, ~5min billable compute vs full CI
- Works with Claude Code, Codex, Cursor, or custom agents
- **Signal:** Major CI company building dedicated agent validation infrastructure. The pattern: agents generate code → validate before it leaves the agent session. This is "input validation for agent output" — but only for code, not for other content types. The concept of validating agent output before publishing is exactly what ZenBin does for web content.
- **URL:** https://circleci.com/blog/chunk-sidecars/, https://github.com/CircleCI-Public/chunk-cli

**SmolVM (CelestoAI) — Windows Sandbox for Agent Automation (May 26, Show HN)**
- Open-source Windows sandbox for automating legacy software with computer-use agents
- Addresses: weird pop-ups, lack of DOM, random clicks, cost at scale
- Agent harness + sandbox for any legacy software
- **Signal:** Sandboxing continues to proliferate — every environment agents operate in needs isolation. The pattern is consistent: execution safety (input side) gets tooling. Publishing safety (output side) gets nothing.
- **URL:** https://github.com/CelestoAI/SmolVM

**Speakeasy — "Every MCP Server Needs an Install Page" (May 26, HN)**
- Blog post arguing MCP servers need dedicated install pages for discovery and onboarding
- **Signal:** MCP ecosystem maturing to the point where distribution/discovery is a recognized problem. This parallels the early days of npm/Homebrew — when you have enough packages, discoverability matters. ZenBin's role as a publishing platform for agent output could face the same discoverability challenge — but also the same opportunity.
- **URL:** https://www.speakeasy.com/blog/every-mcp-server-needs-an-install-page

**Open Prompt Hub — GitHub for Prompts (March 2026, HN)**
- Prompt publishing platform: versioned prompts, fork/customize, security scanning, model-specific build status
- Git-like CLI for publishing prompts and piping them to agents
- Frontmatter-based metadata (version, description, test cases)
- **Signal:** A direct precedent for "publishing infrastructure for agent-adjacent content." They're doing for prompts what ZenBin does for agent output — version, attribute, share. The difference: prompts are input (instructions to agents), ZenBin handles output (what agents create). Complementary, not competitive. Validates that publishing infrastructure is a recognizable category.
- **URL:** https://openprompthub.io

### Key Pattern This Scan

MCP security is now a funded product category with multiple entrants: FlowLink (proxy/firewall), Aigis (firewall), MCPSafe (scanner). All input-side.

CircleCI's Chunk sidecars validate agent output (code) before it reaches CI — the first major infrastructure player to build "output validation" for agents. But it's code-only, not content/publishing.

Sandboxing continues to proliferate: SmolVM (Windows), Nilbox (desktop), Cordium (K8s). All about safe execution environments.

MCP discovery/distribution (Speakeasy) is now a recognized problem — ecosystem maturity signal.

Open Prompt Hub validates that "publishing infrastructure" is a category people will build for. But they're doing prompts (input), not agent output (what agents create).

The gap remains: **no one is building publishing infrastructure for agent output.** The entire industry is building on the input side (MCP, tools, context, identity, security, validation). ZenBin owns the output side.

## 2026-05-26 12:14 UTC

### New Findings

**AgentPKI — Passport-based Identity for AI Agents on the Public Internet (May 26)**
- Open protocol (Apache 2.0) for edge-verified agent identity using short-lived PASETO v4 passports signed with Ed25519
- Three-tier trust: T1 DNS-verified (free), T2 KYB-verified (commerce), T3 hardware-attested (finance/healthcare)
- Sub-50ms p99 verification at the edge, no shared secrets, no blockchain, no vendor API callout
- Interop with MCP, A2A, Kite, SPIFFE, OWASP ANS
- Live reference issuer & verifier at agentpki.dev
- **Signal:** Yet another identity protocol for agents — this space is rapidly commoditizing. AgentPKI focuses on "this agent is who it says it is" for bot-defense purposes. Zero mention of output attestation or publishing. The gap persists: **identity protocols prove WHO the agent is, not WHAT it produced.**
- **URL:** https://agentpki.dev/

**Aigis — MCP Server Firewall (May 26, Show HN)**
- Claims 43% of MCP servers have injection payloads; built a firewall to protect against them
- **Signal:** MCP security is now a product category. First MCPSafe (scanner), now Aigis (firewall). The MCP layer is becoming attack surface. This validates that MCP is winning as the input standard but also accumulating security debt.

**Nilbox — Desktop GUI Sandbox for AI Agents and MCP Servers (May 26, Show HN)**
- Desktop sandbox environment for running AI agents and MCP servers with a GUI
- **Signal:** Sandboxing for agents is proliferating — CloudPostOffice (messaging), Cordium (K8s sandbox), Nilbox (desktop). All are about safe execution environments. None address what happens to the output.
- **URL:** https://github.com/rednakta/nilbox

**Cordium — FOSS Sandbox with Secretless Infrastructure Access (May 25, Show HN)**
- Open source (Apache 2.0) sandbox platform on Kubernetes + Octelium
- Key differentiator: identity-based, secretless access to infrastructure — no credential injection into sandboxes
- Every sandbox gets a dedicated Octelium identity; access governed by ABAC + policy-as-code (CEL/OPA)
- Purpose-built for AI agents: dedicated identity per run, ephemeral storage, auto-stop on task completion
- Supports OIDC/SAML IdPs, GitHub OAuth2, FIDO2/WebAuthn/TOTP
- **Signal:** Identity-based sandboxing is a real category now. Cordium proves "agents need their own identity" at the infrastructure level. But it's about access to resources, not publishing outputs. The gap: agents can securely access a database, but can't securely publish what they learned from it.
- **URL:** https://github.com/octelium/cordium

**CloudPostOffice — Realtime Messaging for Agents (May 25, Show HN)**
- Zero-infrastructure messaging between apps, scripts, and AI agents
- Simple API: `postbox.send()` / `postbox.listen()` — 4 lines of code
- **Signal:** Agent-to-agent communication is getting its own infrastructure primitives. Like MCP but for async messaging, not tool-calling. Still input-side infrastructure.
- **URL:** https://cloudpostoffice.com/

**Nightshift — Long-Horizon Agent Orchestration (May 26, Show HN)**
- Open source Rust tool for multi-issue agent workflows
- Solves Codex /goal's "compaction amnesia" by isolating each task into a fresh agent session
- Dependency graph via GitHub issues, git hygiene between tasks
- Supports Claude Code, Codex, Cursor, Antigravity, Pi Coding
- **Signal:** Agent orchestration for long-running tasks is a recognized pain point. Nightshift's approach (stateless per-task sessions, state via filesystem + git) is elegant. The outputs (PRs) go to GitHub. No generic publishing layer.
- **URL:** https://github.com/Shaurya-Sethi/nightshift

**PII Firewall — Privacy-First LLM Framework for Agents (May 21, HN)**
- Domain-specific PII profiles (healthcare, finance, legal) for LLM inputs/outputs
- Pseudonymize, redact, generalize, or hash sensitive data before it reaches the LLM
- Framework-agnostic wrapper for any HTTP LLM endpoint
- **Signal:** Output privacy is becoming a thing. But PII Firewall redacts content to protect privacy — it doesn't help agents publish content with cryptographic attribution. Complementary to ZenBin: they strip identity, we add it.
- **URL:** https://pii-firewall.com/

**GitHub Commit Verification Logic Flaw (May 26, Ask HN)**
- Detailed exposition of GitHub's "Verified" badge flaw: badge appears next to author but verifies committer's key
- Author ≠ committer exploit lets anyone appear as any GitHub user with a verified badge
- Defense ("vigilant mode") is opt-in, off by default, gated on the impersonated user's settings
- Mentioned in context of AI agents (Shai Hulud) making this worse
- **Signal:** Even GitHub's identity verification is broken. This validates the need for cryptographic output attestation that can't be spoofed. ZenBin's Ed25519 signing of content is exactly the model that would prevent this class of attack — the content carries its own proof of origin, independent of platform trust.

**VAOS — AI Agent Identity MCP Server (recent)**
- MCP server that gives agents cryptographic identity with 60-second credentials
- "Your AI Agent Doesn't Have an Identity. Here's Why That's a Problem."
- No SDK, one JSON block
- **Signal:** Agent identity as an MCP service — the commoditization continues. But again, this is about who the agent IS, not what it PRODUCES.
- **URL:** https://vaos.sh/blog/ai-agent-identity-mcp-server

**SC World — "MCP Isn't a Protocol Problem. It's an Identity Crisis" (recent)**
- Argues that MCP's fundamental issue is that human user identity disappears when an agent connects to an MCP server
- MCP server sees an authenticated agent with a static API key, not the human behind it
- **Signal:** The identity delegation problem (who authorized this agent to act for me) is now mainstream discussion. Output attestation (this specific agent produced this specific content) is the natural next question.
- **URL:** https://www.scworld.com/perspective/mcp-isnt-a-protocol-problem-its-an-identity-crisis-nobody-is-treating

**Dock Labs — AI Agent MCP Server for Digital Identity (March 2026)**
- MCP server exposing digital identity infrastructure to agents
- Structured intermediary between autonomous systems and identity infrastructure
- Expose only specific identity functions, keep other operations off-limits
- **Signal:** Identity infrastructure is wrapping itself in MCP. Agents can now verify and manage identities via MCP. Still about identity verification, not content attestation.
- **URL:** https://www.biometricupdate.com/202603/dock-labs-launches-ai-agent-mcp-server-for-digital-identity

**AgentLux — "AI Agent Identity: Why Cryptographic Credentials Matter in 2026" (May 2026)**
- References Five Eyes (CISA, NSA, +4 agencies) 30-page guidance from May 1, 2026
- Directive: construct identity boundaries for autonomous agents
- **Signal:** Government-level push for agent identity. The regulatory tailwind is real. But regulations focus on access control and audit trails, not on content provenance.
- **URL:** https://agentlux.ai/blog/ai-agent-identity-why-cryptographic-credentials-matter-in-2026

**Systima — Project Delivery Framework for AI Agents (May 25, Show HN)**
- 10 stage-aligned agents, 62 workflows for project/delivery management
- Audit-ready markdown outputs, each linked to charter revision, source docs, model, prompt hash
- Adversarial red-team gate before anything leaves your machine
- Local-first, engagement data never leaves disk
- **Signal:** Interesting: they track provenance of AI-generated outputs (model, prompt hash, source docs). This is a primitive form of output attestation within a closed system. But it's not a protocol or platform — just their internal pattern.
- **URL:** https://github.com/systima-ai/project-delivery-framework

### Key Pattern This Scan

The identity space is now **saturated** — AgentPKI, VAOS, Ratify, AAuth, Facet/KYAPay, IETF draft, OpenID whitepaper, Dock Labs, Five Eyes guidance. All prove WHO the agent is. None prove WHAT the agent produced.

New infrastructure primitives emerging for agents: CloudPostOffice (messaging), Cordium (sandboxing), Nightshift (orchestration), Nilbox (desktop sandbox). All about safe execution. None about publishing output.

MCP security is now a product category: Aigis (firewall), MCPSafe (scanner). The input layer has security tooling. The output layer has nothing.

The gap ZenBin fills — cryptographic output attestation + publishing — remains completely unaddressed by any player in this landscape.

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

## 2026-05-26 00:14 UTC

### New Findings

**IETF Draft: Agent Identity Protocol (AIP) — draft-singla-agent-identity-protocol-01**
- **What:** Full IETF Internet-Draft defining decentralized identity, delegation, and authorization for autonomous AI agents
- **Key features:**
  - W3C Decentralized Identifiers (DIDs) with `did:aip` method
  - Capability-based authorization with cryptographic delegation chains
  - Credential tokens with TTL, refresh, and MCP integration (Section 8.4: Token Exchange for MCP)
  - Three architecture tiers: Core Identity, Credential/Delegation, Enterprise
  - Revocation management with Certificate Revocation Lists (CRL) and push notifications
  - Engagement objects for scoped, time-limited authorizations
  - DPoP and approval envelope support
- **Expires:** October 20, 2026
- **Signal:** The most comprehensive agent identity spec yet. Formal IETF track. Combines DIDs + capability-based auth + delegation chains + MCP token exchange — it's trying to be the full identity stack for agents. Notably includes a MCP integration section, acknowledging MCP as the standard transport. But still focused entirely on WHO agents are and WHAT they're authorized to do — not on proving WHAT they produced. ZenBin's output attestation fills the attestation gap that AIP leaves open.
- **URL:** https://www.ietf.org/archive/id/draft-singla-agent-identity-protocol-01.html

**MCP 2026 Official Roadmap**
- **What:** The MCP project published its 2026 roadmap, shifting from release-milestone planning to priority-area working groups
- **Four priority areas:**
  1. **Transport Evolution & Scalability** — Stateless sessions, horizontal scaling, `.well-known` metadata for server discovery without live connection
  2. **Agent Communication** — Tasks primitive (SEP-1686) iterating toward production: retry semantics, result expiry policies
  3. **Governance Maturation** — Contributor ladder, delegated SEP review for working groups, removing core maintainer bottleneck
  4. **Enterprise Readiness** — Audit trails, SSO-integrated auth, gateway behavior, configuration portability (mostly as extensions, not core)
- **On the Horizon:** Triggers/event-driven updates, streamed/reference-based results, deeper security/auth work, extensions ecosystem
- **Active SEPs:** SEP-1932 (DPoP), SEP-1933 (Workload Identity Federation)
- **Signal:** MCP is maturing from experiment to production standard. The roadmap confirms: (1) MCP is the de facto input/tool-calling layer, (2) enterprise auth is coming but as extensions, (3) agent-to-agent communication is being worked on, (4) there's still zero mention of output/publishing. The MCP roadmap is all about getting data and tools TO agents, not what agents produce FROM sessions. 97M+ monthly SDK downloads confirm MCP has won the input layer.
- **URL:** https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/

**Microsoft Agent Governance Toolkit (AGT)**
- **What:** Open-source (MIT) runtime security toolkit for AI agents addressing all 10 OWASP Agentic AI risks
- **Seven packages:** Agent OS (stateless policy engine), identity (DID-based with behavioral trust scoring), MCP security gateway, execution rings with resource limits, Cross-Model Verification Kernel (CMVK), circuit breakers/SLO enforcement, approval workflows with quorum logic
- **Framework integrations:** LangChain, CrewAI, Google ADK, Microsoft Agent Framework, Dify (marketplace), LlamaIndex, Haystack, PydanticAI, OpenAI Agents SDK
- **Cross-language:** Python, TypeScript (npm: @microsoft/agentmesh-sdk), .NET (NuGet: Microsoft.AgentGovernance), Rust, Go
- **9,500+ tests, SLSA-compatible builds, OpenSSF Scorecard, ClusterFuzzLite fuzzing**
- **Key insight:** "What if we took OS kernel patterns (privilege rings, process isolation) and applied them to AI agents?" — OS-inspired defense in depth
- **Signal:** Microsoft is investing heavily in agent governance. The DID-based identity + behavioral trust scoring + MCP gateway pattern validates the market. Notably, AGT includes an "identity abuse" countermeasure using DID-based identity — but this is WHO the agent is, not WHAT it produced. No output attestation. Also validates that MCP security is a real concern (MCPSafe exists too).
- **URL:** https://github.com/microsoft/agent-governance-toolkit

**Cisco Zero-Trust Identity Framework for Agentic AI**
- **What:** Zero-trust framework paper advocating for "purpose-built" agent identity rather than adapting existing protocols
- **Core principle:** No agent (internal or external) is inherently trusted. Every interaction requires verification.
- **Signal:** Another enterprise security vendor formally recognizing that agent identity needs purpose-built solutions, not retrofitted human auth. The zero-trust model aligns with ZenBin's cryptographic signing — every output must be independently verifiable.
- **URL:** https://community.cisco.com/t5/security-blogs/a-new-identity-framework-for-ai-agents/ba-p/5294337

**OWASP Top 10 for Agentic Applications (2026)**
- **What:** First formal taxonomy of risks for autonomous AI agents, published December 2025
- **The 10 risks:** Goal hijacking, tool misuse, identity abuse, supply chain risks, code execution, memory poisoning, insecure communications, cascading failures, human-agent trust exploitation, rogue agents
- **Cited by:** Microsoft AGT, EU AI Act enforcement (August 2026), Colorado AI Act (June 2026)
- **Signal:** Formal risk taxonomy legitimizes the entire agent governance space. "Identity abuse" as a top-10 risk validates that identity is a security problem. ZenBin's output attestation addresses a related but distinct problem: not identity abuse (impersonation) but output attribution (proving what was produced and by whom).

**AgentDID — Academic Paper (arXiv:2511.02841)**
- **What:** Conceptual framework and prototype for agents with self-sovereign digital identities
- **Approach:** W3C DID + W3C Verifiable Credentials, ledger-anchored, cross-domain trust
- **Key finding:** Technically feasible, but "limitations once an agent's LLM is in sole charge to control the respective security procedures"
- **Accepted:** ICAART 2026 conference
- **Signal:** Academic validation of DID-based agent identity. The limitation finding (LLMs can't reliably manage their own security) reinforces the need for simple, deterministic verification — which is exactly what Ed25519 signature verification provides.
- **URL:** https://arxiv.org/abs/2511.02841

**OpenID Foundation — AI Agent Identity Management Whitepaper**
- **What:** Community Group whitepaper on identity challenges for agentic AI
- **Key finding:** MCP highlights the demand for clarified best practices in authentication and authorization. Current agent-centric protocols show the gap. "Autonomous agents raise complex long-term questions regarding scalable access control, agent identity, and inter-agent trust."
- **Signal:** The OpenID Foundation itself acknowledges that current auth works for simple agents but breaks down at scale. Recommends separation of concerns for auth — specialized servers, not custom per-app. This supports ZenBin's model: specialized output attestation, not bolted onto auth.
- **URL:** https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf

**Cordium — FOSS Sandbox with Identity-Based Secretless Access (Show HN, May 25)**
- **What:** Apache 2.0 sandbox platform with automatic identity-based, secretless access to infrastructure
- **Key innovation:** Zero injected credentials. Access based on identity and policy-as-code (ZTNA model). No API keys, SSH keys, or database passwords in sandboxes.
- **Use cases:** Dev environments, AI agent tasks, CI/CD
- **Signal:** The "no secrets in sandboxes" model is exactly what agent identity frameworks need for runtime. If agents don't need credentials (because identity = access), then output attestation becomes even more important — because identity is the only thing you verify.
- **URL:** https://github.com/octelium/cordium

**Daemons (Charlie Labs) — Pivoted from Agents to Agent Cleanup (Show HN, 70 pts)**
- **What:** After 2 years building a coding agent (Charlie), they pivoted to "Daemons" — background processes that clean up after agents
- **Problem statement:** "The more you use agents, the more work they create." Dozens of PRs, drifting docs, stale dependencies. Developers are so focused on pushing code that operational maintenance falls through the cracks.
- **Model:** Add a `.md` file to your repo, Daemons run as background processes handling the maintenance drag
- **Signal:** Validates a key insight: agents produce a lot of output that needs management. Charlie Labs saw this from the agent-builder side — the output problem is real, it's painful, and it's unaddressed. Daemons focuses on code maintenance, but the pattern generalizes: agent output needs curation, attribution, and lifecycle management. ZenBin addresses the publishing/sharing side of that problem.
- **URL:** https://charlielabs.ai/

**CloudPostOffice — Messaging for Apps and Agents (Show HN, May 25)**
- **What:** Simple realtime messaging for apps, scripts, and AI agents. No MQTT setup, no infrastructure to manage.
- **API:** `p1 = cpo.postbox('postbox-1', 'your-secret'); p1.send(to='postbox-2', msg='hello')`
- **Signal:** Lightweight inter-agent communication infrastructure. The messaging/transport layer for agents is another hot category (see also: Ably Durable Sessions). Still input/communication — not output.
- **URL:** https://cloudpostoffice.com/

**Fungible — Personal Finance TUI with MCP Server (Show HN, May 25)**
- **What:** Terminal-based personal finance app with integrated MCP server
- **MCP use:** Claude/ChatGPT can talk to your finances, create rules/tags via MCP
- **Signal:** MCP as a standard feature continues. "Our app has an MCP server" is now expected for developer tools. The MCP-as-input pattern is fully commoditized.

**DDS Vibe Academy — Built by AI Agents (Show HN, May 19)**
- **What:** 31-class AI coding curriculum, built entirely by AI agents (Claude Opus 4.7 authored, Google Antigravity deployed via Shopify MCP)
- **Quote:** "I did not write a single line of code or upload a single file manually. I designed the constraints. The agents did the implementation."
- **Signal:** Agents are now producing entire products end-to-end. This is exactly the use case where output attestation matters — who built this, can I verify it, is it attributed? The output provenance problem scales with agent capability.

### Updated Landscape Files
- `standards.md`: Added AIP IETF draft, MCP 2026 Roadmap, OWASP Agentic AI Top 10, OpenID Foundation whitepaper, Microsoft AGT
- `identity.md`: Added AIP (most comprehensive agent identity spec yet), AgentDID paper, Cisco zero-trust framework, updated MCP token exchange note
- `infrastructure.md`: Added Microsoft AGT, Cordium (identity-based sandboxes), CloudPostOffice (agent messaging), Daemons (agent output cleanup)
- `trends.md`: Updated Trend 2 (MCP roadmap confirms dominance), Trend 5 (5+ identity protocols now), added Trend 12 (Agent Output Management is becoming visible — Daemons validates the pain point)

### Key Takeaway

This scan reveals significant maturation on two layers: **identity** and **governance**.

The IETF AIP draft is the most comprehensive agent identity specification to date — it covers DIDs, capability-based auth, delegation chains, revocation, MCP token exchange, and enterprise tier checks. Microsoft's Agent Governance Toolkit addresses all 10 OWASP risks with production-quality code. The OWASP Top 10 for Agentic AI is now the formal risk taxonomy that enterprise security teams will reference.

But across all of these — AIP, AAuth, Ratify, Microsoft AGT, Facet/KYAPay, Cisco zero-trust — the focus remains: **WHO is this agent, and WHAT is it authorized to do?** Nobody is addressing: **WHAT did this agent produce, and can I verify it?**

The MCP 2026 roadmap confirms the input layer is fully commoditized (97M+ monthly SDK downloads). The identity layer is getting crowded with 5+ competing specs. The governance layer has its first enterprise toolkit (Microsoft AGT). And the **output layer remains completely empty.**

Daemons (70 pts on HN) validates that agent output management is a real, painful problem — they pivoted their entire company from building agents to cleaning up after them. But Daemons only addresses code maintenance (drift, stale deps). The broader output problem — publishing, attribution, sharing, verification — is still unclaimed.

ZenBin's position: **cryptographic output attestation** — proving what an agent produced, when, and with what key — remains the unaddressed gap in every layer of the stack.

---

## 2026-05-26 06:14 UTC

### New Findings

**Aigis — MCP Firewall (43% of MCP servers have injection payloads) (Show HN, May 26)**
- **What:** Firewall for MCP servers. Scans for prompt injection payloads before agent connection. Found 43% of sampled MCP servers contain injection payloads.
- **Signal:** MCP's rapid adoption has created a security surface area. The ecosystem is now playing security catch-up — firewalls, sandboxes, PII governance. This is input-side security (protect agents from malicious MCPs). Output-side security (verify what agents produce) remains unaddressed.

**Nilbox — Desktop GUI Sandbox for AI Agents and MCP Servers (Show HN, May 26)**
- **What:** Desktop app providing visual sandboxed environment for running agents and MCP servers
- **URL:** github.com/rednakta/nilbox
- **Signal:** Sandbox tooling for agents continues to mature. Another input-side control (isolate what agents can access). Output verification not addressed.

**PII Firewall — Full PII Framework for Agents (Show HN, May 21)**
- **What:** Structured framework for handling PII across agent pipelines
- **URL:** pii-firewall.com
- **Signal:** PII governance for agents is emerging as its own category. Complementary to ZenBin — PII governance prevents leaking private data; ZenBin provides attribution of what was published.

**GitHub Commit Verification Logic Flaw (Ask HN, May 26)**
- **What:** Detailed post showing GitHub's "Verified" badge only verifies the committer's key, not the author's identity. Author field is freely settable. With AI agents authoring commits, author≠committer identity gap is a live attack surface.
- **Key detail:** "Partially verified" badge exists but is opt-in ("vigilant mode") and gated on the impersonated user's settings, not the attacker's.
- **Signal:** Git commit identity is broken for the agent era. The verified badge doesn't verify what people think it verifies. This is exactly ZenBin's domain — proving WHAT was produced by WHOM, with a verifiable signature on the content itself.

**Ota — Repo Readiness Infrastructure for Agents (Show HN, May 25)**
- **What:** Makes repos runnable and trustworthy for humans, CI, and AI agents. `ota doctor` / `ota up` / `ota run` pattern. Explicit operational contracts.
- **Key quote:** "Repo readiness is its own layer: something between the repo, the developer, CI, and now agents."
- **Signal:** Another infrastructure layer emerging specifically for agents. Agents need explicit contracts, not implicit READMEs. Input-side (repo preparation). No equivalent for output.

**Dinobase — Database for AI Agents (Show HN, Apr 7)**
- **What:** Business database for agents. 101 connectors → DuckDB with annotated schemas. Claude agent annotates after each sync (table descriptions, column docs, PII flags, relationship maps). SQL beats per-source MCP: 2-3x accuracy, 16-22x less tokens, 2-3x faster.
- **Founder:** Former PostHog AI builder
- **Signal:** OpenClaw is listed as a supported platform. The "SQL beats MCP" insight is notable — structured data access with schema annotations outperforms chaining tool calls.

**Systima — Project Delivery Framework for Agents (Show HN, May 25)**
- **What:** Claude Code/OpenCode skill library — 10 stage-aligned agents, 62 workflows covering full project lifecycle. Audit-ready markdown outputs linked to charter, source docs, model, and prompt hash.
- **Signal:** Agent skill libraries are a category. The "prompt hash" and "linked back to its charter revision" approach is output provenance-adjacent — they're tracking what produced what, but only internally. No public verification.

### Updated Landscape Files
- `infrastructure.md`: Added Aigis, Nilbox, PII Firewall, Ota, Dinobase, Systima
- `identity.md`: Added GitHub commit verification flaw (author≠committer identity gap)
- `trends.md`: Added Trend 16 (MCP security becoming first-class concern), added new signals to table

### Key Takeaway

MCP security is becoming a first-class concern. Aigis finding that 43% of MCP servers contain injection payloads is a wake-up call — the ecosystem's rapid adoption has outpaced security. We're seeing the emergence of MCP firewalls (Aigis), agent sandboxes (Nilbox), PII governance (PII Firewall), and identity-based access (Cordium).

The GitHub commit verification flaw reinforces that existing identity systems weren't designed for agents. The "Verified" badge verifies the committer, not the author — and with AI agents now authoring commits, this gap is exploitable.

The security stack is thickening on the input side (MCP firewalls, sandboxes, PII filters, secretless access). But the **output side remains completely empty** — after you sandbox the agent, filter the MCP servers, and verify the PII governance, you still need to prove what the agent produced. ZenBin's cryptographic output attestation fills that gap.

## 2026-05-27 18:14 UTC

### New Findings

**mcp-authflow — OAuth 2.0 Framework for MCP Servers (May 27, Show HN, story 48296739)**
- Open-source OAuth 2.0 authentication framework specifically designed for MCP servers
- GitHub: github.com/brooksmcmillin/mcp-authflow
- **Signal:** MCP authentication is becoming a solved-problem category. When frameworks emerge to handle auth for a protocol, it means the protocol has reached adoption critical mass. OAuth for MCP is the right layer but it solves input-side auth (who can call this server), not output-side provenance (who produced this content). Still, the existence of dedicated MCP auth frameworks validates that the ecosystem is maturing beyond "just give the agent an API key."
- **ZenBin gap:** OAuth authenticates the caller. ZenBin attests to the output. They're complementary — OAuth says "this agent is allowed to call this MCP server," ZenBin says "this agent published this content."

**AgentSafeLabs — Open-source Security Framework for AI Agents (May 27, Show HN, story 48297782)**
- Security evaluation framework for AI agents
- GitHub: github.com/AgentSafeLabs/safelabs-eval
- **Signal:** Agent security evaluation is becoming a standalone product. The naming ("SafeLabs") suggests a testing/certification model — like SOC 2 but for agents. This is the input-side security story (is this agent safe to run?), not the output-side (is this agent's output trustworthy?).
- **ZenBin gap:** Security frameworks evaluate agents before they run. ZenBin verifies what they produce after they run. Pre-flight checks + post-flight attestation = complete trust chain.

**CoreMCP — MCP Server for On-Prem Databases (May 27, Show HN, story 48295485)**
- MCP server that connects agents to on-premises databases
- GitHub: github.com/corebasehq/coremcp
- **Signal:** The MCP-to-database layer is being built out. On-prem specifically addresses the enterprise concern about data leaving the perimeter. The pattern: MCP is becoming the standard way agents access data, and enterprise needs (on-prem, auth, governance) are being layered on top.

**lodd.dev — Headless Web Analytics for Agents via 42 MCP Tools (May 22, Show HN, story 48233125)**
- Replaced traditional analytics dashboard with 42 MCP tools + full API designed for agent consumption
- Two auth models: hosted OAuth (desktop/mobile apps) + stdio API key (terminal/CI)
- Human-in-the-loop OTP email authentication
- Optimized for agent usage: efficient responses (~60 tokens per snapshot), llms.txt for agent guidance
- Key insight: "Having the agent call it unprompted" is still hard — requires Claude.md configuration
- **Signal:** The transition from "dashboards for humans" to "tools for agents" is real. When someone rebuilds an entire product to be agent-first rather than human-first, that's a signal the market is shifting. The dual auth model (OAuth for apps, API key for terminals) is becoming standard for MCP services. The challenge of getting agents to use tools unprompted (vs. explicit instruction) is a UX problem the industry hasn't solved yet.
- **URL:** lodd.dev

**Canine — DevOps MCP Server with OAuth Authentication (HN, story 47614678)**
- Kubernetes deployment platform (like Coolify for K8s) that added MCP capabilities
- Implementation pattern: API endpoints wrapped with MCP OAuth — GET endpoints → MCP resources, POST/PUT/DELETE → MCP tools
- Key insight: MCP docs recommend Prompt objects for guiding LLMs, but most real implementations use skills instead
- Breakout pattern: MCP tool provides temporary kubeconfig → Claude gets full Kubernetes API access
- Best practice: MCP opt-in, staging-only access, disabled on production
- **Signal:** The pattern of wrapping existing APIs as MCP servers (resources = reads, tools = writes) is becoming the standard implementation approach. The auth model (MCP OAuth wrapping existing API auth) shows how the industry is layering MCP on top of existing infrastructure. The "MCP is opt-in, staging-only" best practice shows enterprises are cautious about agent autonomy in production environments.

**CircleCI Chunk Sidecars — Validating Agent-Generated Code Before CI (May 26, Show HN, story 48281284)**
- Lightweight microVM sidecars that validate agent-generated code in the inner dev loop
- Firecracker microVMs (4 CPU, 8GB RAM) on E2B infrastructure
- Validation hooks trigger during agent stop/evaluation events
- Warm snapshots keep startup ~27s vs 15min cold start
- Results: 3-5x lower token usage in retry loops, ~5min billable compute vs full CI pipeline
- Works with Claude Code, Codex, Cursor, or custom agents
- **Signal:** First major CI/CD player to build output validation for agents. The insight: "by the time CI catches a failure, the agent has already moved on and most of the useful context is gone." This is the dev-loop version of the provenance problem — you need to validate what the agent produced while you still have context about how it was produced. Chunk validates code before it reaches CI; ZenBin validates content before it reaches the web. Same pattern, different domain.
- **URL:** circleci.com/blog/chunk-sidecars/

**Tigera: Five Pillars of AI Agent Accountability (May 26, HN story 48286385)**
- Diagnostic framework for engineering leaders on AI agent accountability
- Five pillars framework (identity, traceability, governance, security, compliance)
- **Signal:** "Accountability" is the enterprise framing for what the indies call "provenance" or "attestation." Same problem, different vocabulary. The five-pillar structure gives enterprise buyers a checklist — and "identity" and "traceability" are two of the five pillars. ZenBin addresses both: cryptographic identity (who published) and content traceability (what was published, when, with what signature).
- **URL:** tigera.io/blog/the-five-pillars-of-ai-agent-accountability

### Updated Landscape Files
- `infrastructure.md`: Added mcp-authflow, CoreMCP, lodd.dev, Canine, CircleCI Chunk sidecars
- `identity.md`: Added mcp-authflow (OAuth for MCP), AgentSafeLabs (agent security eval), Tigera Five Pillars

### Key Takeaway

Three patterns crystallized in this scan:

1. **MCP auth is now a product category.** mcp-authflow, lodd.dev's dual auth, Canine's OAuth wrapping — multiple independent solutions for MCP authentication. The protocol has reached the maturity where auth frameworks are needed.

2. **Output validation is emerging in dev tools.** CircleCI's Chunk sidecars validate agent code before CI. This is the first major infrastructure player to build "validate before publish" for agents — but code-only. The pattern exists but hasn't expanded to content/publishing yet.

3. **Agent security is bifurcating into pre-flight and post-flight.** AgentSafeLabs evaluates agents before they run (is this agent safe?). ZenBin attests to what they produce after (did this agent produce this?). Pre-flight security + post-flight attestation = complete trust chain. The industry has pre-flight covered; post-flight is the gap.