# AI Agent Infrastructure Landscape

Last updated: 2026-05-25 12:14 UTC

### Cosmic — Team Agents with Direct Publishing (May 2026, HN)
- **What:** YC W19 company (headless CMS) launching Team Agents and Cosmic Agent. Content Agents write blog posts, landing pages, marketing copy, generate images, add SEO metadata, and PUBLISH DIRECTLY TO CMS. Code Agents read codebases, create branches, write components, open PRs. Computer Use Agents browse web tools. Team Agents coordinate all three via Slack/WhatsApp/Telegram.
- **Key design:** Agents have names, roles, persistent memory, and real capabilities. Not chatbots — persistent agents that work alongside teams. Content Agents go from prompt to published CMS content with zero human editing steps.
- **Signal:** This is the first major CMS company shipping agents that publish directly. The gap between "agent generates content" and "content is live" is being collapsed. But there's NO attribution, NO signing, NO provenance — content just appears in the CMS as if by magic.
- **ZenBin angle:** Cosmic is building the "agent as content creator" workflow. ZenBin provides the "prove the agent created it" layer. Every piece of content Cosmic's agents publish should be signed and attributable. Today it's not. That's the gap.
- **URL:** https://www.cosmicjs.com

### ForwardPass — Newsletter Delivered via MCP (May 2026, HN)
- **What:** An AI newsletter (ForwardPass) ported to an MCP server. Subscribers add the MCP to their AI tool (Claude, ChatGPT) and control WHEN and HOW OFTEN they receive content. The MCP server delivers content on the subscriber's schedule, not the author's.
- **Key design:** Uses MCP as a content delivery channel, not just a tool-access protocol. Subscribers set their own cadence (daily, weekly, fortnightly) and timezone.
- **Signal:** MCP is expanding beyond tool invocation into content distribution. The first "MCP as publishing channel" use case we've seen. When content delivery becomes an MCP server, the question of who created that content and whether it's attributable becomes relevant.
- **ZenBin angle:** ForwardPass proves MCP can be a content distribution layer. If agents publish content via MCP (or any protocol), those publications need signing and attribution. ZenBin is the provenance layer for MCP-delivered content.
- **URL:** https://mcp.forwardpasstechnology.com/mcp

### Pulsar Edit MCP Server — LLM Failure Modes Documentation (May 2026, HN)
- **What:** MCP server for the Pulsar text editor that also ships a detailed LLM failure modes document. The failure modes doc catalogs how LLMs fail in practice when used as coding assistants.
- **Signal:** MCP servers are now being built for every purpose. The failure modes doc is notable — it's a catalog of what goes wrong with agents in practice, not just in theory.
- **ZenBin angle:** Understanding agent failure modes is essential for building trust. ZenBin's output signing directly addresses several of these failure modes (unattributed output, unverifiable claims, loss of provenance).
- **URL:** https://github.com/professor-jonny/pulsar-edit-mcp-server

### Runtime (runtm.com) — Team-Wide Agent Sandbox Infrastructure (May 2026)
- **What:** Infrastructure for letting entire teams (including non-engineers) ship with Claude Code, Codex, and other agents. Founded by ex-Mentum (YC S21) + ex-Modern Treasury.
- **Key design:** Snapshots full running environments (Docker Compose, Kafka, Redis, seeded DBs) in milliseconds. Orchestrates across E2B, Daytona, EC2, self-hosted K8s. Secrets injected via managed proxy (never touch agent). Guardrails at infrastructure level: command allow/deny, network egress, RBAC scoped per human and per agent. Shareable preview URLs for sandbox output.
- **Signal:** Agent infrastructure is now team/organizational infrastructure, not individual dev tools. RBAC for agents is becoming standard. "Secrets never touch the agent" is the default pattern. Shareable preview URLs = micro-publishing.
- **ZenBin angle:** Runtime's preview URLs are org-internal publishing. When agent output needs to go public (reports, dashboards, docs), that's ZenBin.
- **URL:** https://runtm.com

### OTA — Repo Readiness Contracts for AI Agents (May 2026)
- **What:** "Open repo readiness infrastructure" — makes repos runnable and trustworthy for humans, CI, and AI agents. Each repo gets one explicit operational contract. Core flow: `ota doctor` (diagnose) → `ota up` (prepare) → `ota run` (execute tasks).
- **Signal:** The contract abstraction continues to spread. Auth.md contracts for registration, Prisma contracts for data, OTA contracts for repo readiness. Pattern: declare capabilities, verify compliance, sign the result.
- **ZenBin angle:** OTA makes repos trustworthy for agents. ZenBin makes agent output trustworthy for humans. Mirror problems with the same contract-based approach.
- **URL:** https://ota.run

### Golf MCP Scanner — Enterprise MCP Security, YC X25 (May 2026)
- **What:** Open-source Go binary that discovers every MCP server across IDEs, runs ~15 security checks per server. Commercial product adds fleet MDM scanning, deep source analysis, rug-pull detection, toxic tool combinations, PII scrubbing, SIEM forwarding.
- **Key insight:** "Most AI security tooling is actually LLM security" but the real risk is what the agent DOES. "The threat model for an MCP-connected agent is closer to an unmanaged service account than a SaaS app."
- **Signal:** Third MCP security tool this week. Golf's reframing (agent = unmanaged service account) is the most articulate. If agents are service accounts, they need identity, audit trails, and output attribution.
- **ZenBin angle:** Golf secures what agents can DO (input/execution side). ZenBin attests what agents DID (output/publishing side). The service account framing strengthens ZenBin's value prop.
- **URL:** https://github.com/golf-mcp

### SoMatic — Vision-Based OS Automation Framework (May 2026)
- **What:** Pure vision framework using finetuned YOLO for UI element detection. Enables Set-Of-Marks prompting for any OS interface (Windows, Mac, Linux). ~20% accuracy improvement with GPT-5.5. Ships as CLI + MCP server + skill.
- **Signal:** Agent frameworks expanding beyond text to full OS control. New agent output types (UI analysis, screenshots with annotations, automation audit trails). Skill distribution standardizing as CLI + MCP + skill package.
- **ZenBin angle:** New agent output types need new publishing infrastructure. SoMatic's skill distribution pattern could integrate with ZenBin for publishing agent-generated artifacts.
- **URL:** https://github.com/Smyan1909/SoMatic

### PII Firewall — Full PII Framework for Agents (May 2026)
- **What:** Dedicated PII protection framework for AI agents — preventing personal data leakage in agent workflows.
- **Signal:** PII protection for agents is distinct from general security. Input-side guardrail (prevent data from leaving). No equivalent for controlled, attributed publication of agent output that legitimately references personal data.
- **ZenBin angle:** PII Firewall blocks data FROM going out. ZenBin enables verified data TO go out. Different problems for different contexts.
- **URL:** https://pii-firewall.com/

### Auth.md by WorkOS — Agent Self-Registration Protocol (May 2026)
- **What:** Open protocol for agent self-registration. Domains publish `auth.md` (like robots.txt) declaring flows, scopes, and endpoints. Agents discover and self-register.
- **Signal:** The .well-known declarative capability discovery pattern is becoming standard. WorkOS (major auth infra) validates agent self-registration as a real need. Input-side standard (how agents get IN).
- **ZenBin angle:** Auth.md = input onboarding. ZenBin = output publishing. A domain could declare both.
- **URL:** https://workos.com/auth-md

### Agent Credential Brokers — 8-Tool Survey (May 2026)
- **What:** authsome.ai published a comprehensive survey of the "agent proxy" tool category — 8 tools grouped by function:
  - **Credential injection:** Authsome (local-first, 44 providers), Agent Vault (Infisical, production), Clawvisor (authorization + intent verification), OneCLI
  - **Interception/inspection:** mitmproxy
  - **API gateway:** Pomerium, Cloudflare AI Gateway
  - **Mocking/testing:** WireMock
- **Key insight:** "Agent proxy" is now a recognized category. All tools handle INPUT (creds, auth, policy for agents). None handle OUTPUT (publishing, attestation).
- **ZenBin angle:** The 8-tool survey confirms the input side is saturated. The output side has zero products.
- **URL:** https://authsome.ai/blog/top-agent-proxy-tools-what-to-know

### Nable MCP Server — Cloud/SaaS Billing for Agents (May 2026)
- **What:** MCP server so agents can query cloud and software billing data. "Ask Claude about your cloud bill."
- **Signal:** MCP servers for every vertical domain continue to proliferate. Financial/usage data as agent-accessible.
- **URL:** https://getnable.com

### Guesty MCP Server — Property Management for Agents (May 2026)
- **What:** First MCP server for Guesty property management. 43 tools, open source, npm package.
- **Signal:** Vertical-specific MCP servers are now standard. Property management → agent tools. 43 tools = full API surface.
- **URL:** https://www.npmjs.com/package/guesty-mcp-server

### Research MCP Server — jspann.me (May 2026)
- **What:** MCP server for research workflows. Blog post about creating "another MCP server, but this one is for research."
- **Signal:** MCP server creation is now common enough that people apologize for making another one. The ecosystem is past the novelty phase.
- **URL:** https://jspann.me/blog/posts/research_mcp/

### Prisma Next — Data Contracts with Identity Hashing + Agent DX (May 2026)
- **What:** Full TypeScript rewrite of Prisma ORM introducing three concepts: data contracts (hashed schema identity, like git commits), migration graphs (DAG-based instead of linear SQL files with precheck/postcheck verification), and agent DX (curated skills with guardrails for every operation so you can safely delegate to agents).
- **Key design:** Data contracts are hashed to give identity ("sign the DB with your contract's hash"). Migration graphs stored as DAG. Agent DX provides guardrails so you don't have to double-check everything your agent does.
- **Signal:** Hashing for identity is spreading. Prisma hashes schemas; OTA defines readiness contracts; ZenBin signs content. Each layer needs its own identity/verification primitive. The pattern is consistent.
- **ZenBin angle:** Same cryptographic identity primitive (hash → identity → sign/verify) applied to different domains. Prisma: DB schema identity. ZenBin: content publishing identity. When Prisma agents generate migrations, those migrations have no output attestation.
- **URL:** https://github.com/prisma/prisma-next

### OTA — Repo Readiness Contract for Software Repos (May 2026)
- **What:** Open repo readiness infrastructure. Makes software repositories runnable and trustworthy for humans, CI, and AI agents. Each repo gets an explicit operational contract: what it needs, how it becomes ready, how tasks run.
- **Key flow:** `ota doctor` (diagnose missing), `ota up` (prepare repo), `ota run` (execute named tasks from the contract). "Doctor first, contract second."
- **Signal:** The "operational contract" concept is spreading across infrastructure layers. Prisma has data contracts, OTA has readiness contracts, ZenBin has publishing contracts. Each layer (data, execution, output) needs its own contract/identity primitive.
- **ZenBin angle:** OTA makes repos trustworthy for agents to RUN code. ZenBin makes agent OUTPUT trustworthy for humans to CONSUME. Complementary — execution trust vs. output trust.
- **URL:** https://ota.run, https://github.com/ota-run/ota

### Vibedock — MCP Server Management for Claude Code (May 2026)
- **What:** macOS menu bar app to toggle individual MCP servers for Claude Code on/off. Simple UX for managing MCP server sprawl.
- **Signal:** MCP server management is becoming a UX problem. As agents accumulate more MCP servers (memory, search, APIs, databases), managing which are active becomes a friction point. The input side of the agent tool ecosystem is getting crowded.
- **ZenBin angle:** Vibedock manages which MCP servers feed INTO an agent. ZenBin could be the MCP server that handles what comes OUT of an agent (published content). The ecosystem needs both input management and output management.
- **URL:** https://vibedock.dev/

### opub — Donated Compute for Open-Source Projects (May 2026)
- **What:** Donors fund donated compute for open-source projects. Maintainers create dollar-limited compute keys and use them with coding agents across 30+ models. Token usage and spend are visible in the open. Starter program: $50 for first 20 projects with 100+ GitHub stars.
- **Signal:** Agent compute costs are now a recognized infrastructure problem with a dedicated funding model. Open-source maintainers drowning in AI-generated issues/PRs need compute to keep up. Parallels agent publishing costs — agents need compute to produce output AND infrastructure to publish it.
- **URL:** https://opub.dev/blog/introducing-opub

### iClaw — AI Agent Using Apple Intelligence (April 2026)
- **What:** Hackathon-born AI agent powered by Apple's on-device 3B Foundation Model (AFM). 40+ tool library with text classifier routing and multi-step decision framework. Safari Extension for browser access. Lives in App Sandbox with explicit consent for create/delete operations.
- **Key design:** LoRA adapter for better instruction following. DSL for rendering custom widgets. Safety-first: sandbox, consent per tool call, fully disable any tool.
- **Signal:** On-device agents are emerging. Apple Intelligence as agent runtime is weak (3B model, struggles with >3 tools, injects preambles) but distribution is powerful — pre-installed on millions of Macs. The sandbox + consent model is a pattern for agent permissions.
- **ZenBin angle:** On-device agents produce content locally with no output identity layer. When on-device agents start publishing, they'll need attestation.
- **URL:** https://geticlaw.com

### AgentRecall — Persistent Memory Layer for AI Agents (May 2026)
- **What:** Open-source memory SDK with MCP server + REST API + SDKs (Node, Python). Neo4j-backed graph memory with semantic search, AI-powered entity/relationship extraction (Qwen2.5-7B), multi-agent isolation with cross-agent query.
- **Pricing:** Self-hosted (MIT, free, unlimited) or cloud (free tier: 1K memories, $9/mo unlimited).
- **Key design:** Each agent gets isolated memory namespace. Graph traversal for finding connected memories. Auto-extracts entities and relationships from stored content. Works with Claude Code and OpenClaw via MCP.
- **Signal:** Agent memory is becoming a dedicated infrastructure layer. The graph/traversal model is more sophisticated than simple vector DB retrieval. Multi-agent memory isolation follows the same pattern as agent identity isolation.
- **ZenBin angle:** AgentRecall solves the input side (what agents remember). ZenBin solves the output side (what agents produce and publish). An agent with persistent memory that also publishes attested content would have a complete input/output identity chain.
- **URL:** https://agentrecall.cloud

### PII Firewall — Domain-Specific PII Sanitization for LLM Apps (May 2026)
- **What:** PII framework with domain-specific presets (healthcare, finance, etc.) that decide what's sensitive vs. what the LLM needs. Actions: PSEUDONYMIZE (reversible), REDACT (irreversible), GENERALIZE (bucket), HASH (analytics). Wraps any HTTP LLM endpoint, local model, or LiteLLM proxy.
- **Signal:** Agent data governance is becoming domain-specific. Healthcare has different PII requirements than finance, which differs from dev tools. Input-side governance mirrors the need for output-side attestation.
- **ZenBin angle:** PII Firewall governs privacy of agent inputs. ZenBin governs authenticity of agent outputs. Together: private in, verified out.
- **URL:** https://pii-firewall.com/

### Runtime (YC P26) — Sandboxed Coding Agents for Teams (May 2026)
- **What:** Team-safe agent infrastructure. Engineering defines context once (system instructions, skills, scoped integrations). Runtime snapshots full environments (Docker Compose, Kafka, Redis, seeded DBs). Secrets injected through managed proxy — never touch agent. Guardrails at infra level: command allow/deny, network egress, RBAC scoped per human AND per agent. Shareable preview URLs per session.
- **Traction:** Front page on HN (100 pts, 30 comments at Launch HN). Fintech unicorn and several YC scaleups live.
- **Key design:** Agents as first-class principals with scoped access. Works with Claude Code, Codex, Cursor, Copilot, Gemini, Devin. Orchestrates across E2B, Daytona, EC2, self-hosted K8s.
- **Signal:** High HN traction validates team-safe agent infra. The "scoped per human and per agent" RBAC pattern is becoming standard.
- **ZenBin angle:** Runtime handles agent execution infra but not agent output. Agents produce code and PRs inside sandboxes — but when they publish content externally, there's no attestation layer. Runtime + ZenBin would be complementary.
- **URL:** https://runtm.com

### Agent.email — Self-Provisioning Email for AI Agents (May 2026)
- **What:** AgentMail (YCS25) launched agent.email — a signup flow designed for AI agents instead of humans. Agents discover they need an inbox, hit agent.email via curl, get markdown instructions (HTML for browsers, markdown for agents), sign up with their human's email, get a restricted inbox, email their human for an OTP code, human replies, agent is claimed and restrictions lift.
- **Key design:** 1:1 agent:human mapping (many-to-one roadmap). Restricted-until-claimed trust model. Rate-limited signup. Agents can only email their own human until claimed. Shortened messageIDs because agents hallucinated completions on longer ones. CLI outputs in single-column format because mixed delimiters confuse agents.
- **Signal:** The internet's auth/signup layer is still built for humans. Agent.email is one of the first to build a self-provisioning path specifically for agents. The "claim with human OTP" pattern creates a delegation chain — human authorizes agent, agent gets limited capabilities, human confirms. Same direction as AAuth delegation but applied to service provisioning, not auth. Already hitting the "many agents per human" scaling problem.
- **ZenBin angle:** Agents can now self-provision email, but the content they send has zero attestation. An agent can email its human, but can't cryptographically prove what it wrote vs. what was spoofed. The "markdown for agents, HTML for browsers" pattern mirrors ZenBin's approach — serve content in the format the consumer needs, with identity baked in.
- **URL:** https://news.ycombinator.com/item?id=48212471

### DDS Vibe Academy — Agent-Built Curriculum (May 2026)
- **What:** 31-class AI coding curriculum (12 Liquid sections, ~6,400 lines) built entirely by AI agents. Claude Opus 4.7 authored content, Google Antigravity deployed via Shopify MCP, Cowork ran autonomous browser audit. Human "designed the constraints, agents did the implementation."
- **Signal:** Agents producing publishable content with zero cryptographic proof of authorship. The claim is "built by AI agents" but it's trust-based, not verifiable. No attestation layer for the output.
- **ZenBin angle:** When agents produce 6,400 lines of published content, the question becomes: can you verify what was actually agent-generated vs. human-modified post-generation? Output attestation solves this.
- **URL:** https://news.ycombinator.com/item?id=48198681

### VeilGate — Deception Reverse Proxy for Agent Traffic (May 2026)
- **What:** Reverse proxy that detects and tarpits AI agent traffic (pentest agents, scrapers). Modes: observe, challenge, tarpit, auto. Scores requests by protocol fingerprints, behavioral signals, and online ML.
- **Context:** Pentester reports AI agent-driven attacks (PentestGPT, CAI, Strix, HexStrike) cost under $1/hr in API. Blocking doesn't work — a 403 is just a signal in the LLM's context window; the agent pivots in milliseconds.
- **Signal:** The arms race between agent traffic and defenses is real. Deception replaces blocking as the paradigm. This is infrastructure for *controlling* agent access — the opposite problem from giving agents publishing access. Both sides of the agent↔web boundary need tooling.
- **ZenBin angle:** If the web needs anti-agent proxies, it also needs pro-agent publishing endpoints. ZenBin is the "pro-agent" side of this equation — a place where agents are *supposed* to publish, with identity and auth built in.
- **URL:** https://news.ycombinator.com/item?id=48199725

### Dari-docs — Agent Documentation QA (May 2026)
- **What:** Upload documentation, run agents across providers to find where they falter. Live verification against real APIs.
- **Key insight:** "Good documentation becomes more objective — can a dumb harness running the dumbest model implement this reliably?"
- **Target:** CLI, API, MCP server, and SDK documentation
- **Signal:** Documentation QA for agents is now a product category. Input-side optimization. No equivalent for agent output QA.
- **URL:** https://github.com/mupt-ai/dari-docs

### MCP Compliance Auditing — korrel-dev (May 2026)
- **What:** Systematic audit suite for MCP server standards compliance (RFC 9728, OAuth 2.1)
- **First audit:** Atlassian MCP server fails RFC 9728 Protected Resource Metadata discovery
- **Signal:** MCP moving from "just works" to "standards-compliant." Compliance layer emerging alongside security scanning (MCPSafe).
- **URL:** https://github.com/korrel-dev/mcp-audits

### MCP-safeguard — Security Scanner for MCP Servers (May 2026)
- **What:** Open-source security scanner specifically for MCP servers. Complements MCPSafe and korrel-dev audits.
- **Signal:** MCP security tooling is proliferating. Three separate MCP security/compliance tools now exist (MCPSafe, korrel-dev audits, MCP-safeguard). The MCP ecosystem is hitting the maturity inflection where security becomes a requirement, not a nice-to-have.
- **URL:** https://github.com/SyedAnas01/mcp-safeguard

### How to Set Up a Remote MCP Server for Your SaaS (DocsAlot, May 2026)
- **What:** Guide/tutorial for SaaS companies to set up remote MCP servers. Published on docsalot.dev.
- **Signal:** "MCP server for your SaaS" is becoming a standard onboarding pattern. SaaS companies are treating MCP as a first-class integration surface, like REST APIs before them. The next step: agents that can publish *to* SaaS products, not just read from them.
- **URL:** https://docsalot.dev/blog/how-to-set-up-a-remote-mcp-server-for-your-saas

### TBN Protocol — Runtime Governance Infrastructure for AI Agents (May 2026)
- **What:** Runtime governance platform for AI agents. 14-step flow: bot registration → 6 security challenges (prompt injection, hallucination, data boundary, sensitive data, budget limits, instruction following) → cryptographic attestation certificate → trust handshake between bots → platform access control → certification levels (STANDARD → COMMUNITY) → encrypted messaging (AES-256-GCM) → budget limits with circuit breaker → attestation verification (fingerprint drift detection) → compliance drift monitoring → 24h health checks.
- **Key concepts:** Every bot gets a unique ID + cryptographic attestation. Certification is not one-time — bots must re-certify if their fingerprint drifts (wrong model, exceeded budget, changed endpoint). Trust handshakes between bots use mutual certificate verification.
- **Signal:** Agent governance is maturing from "trust but verify" to "attest, certify, and continuously verify." The certification-as-infrastructure pattern (bot must pass security challenges before getting platform access) is similar to what PCI compliance did for payments. The fingerprint drift detection is notable — it means agent identity is not just "who are you" but "are you still the same agent you were when certified?"
- **ZenBin angle:** TBN governs agent *access* (who can enter, what they can do). ZenBin governs agent *output* (what was produced, by which certified agent, with what attestation). If TBN-certified agents publish through ZenBin, the output attestation chain becomes: TBN certifies the agent → ZenBin certifies the output. A natural composition.
- **URL:** https://tbn.hardinai.co.uk/demo

### Encore.dev — Agent Framework Benchmarking (May 2026)
- **What:** Benchmarks AI agent performance across 5 TypeScript backend frameworks (Express, Fastify, NestJS, Hono, Encore)
- **Signal:** Framework choice for agent-facing backends is becoming a consideration. Agents as primary API consumers.
- **URL:** https://encore.dev/blog/ai-benchmark

### Bawbel — MCP Server Security Scanner (May 2026)
- **What:** Open-source scanner for agentic AI components, specifically MCP servers. Scanned top 100 Smithery servers, found 22 with vulnerabilities (4 CRITICAL, 24 HIGH). Most common: tool description injection (AVE-2026-00002) — tool descriptions containing behavioral instructions targeting the agent instead of describing the tool. Notable matches include Context7, Google Sheets, Senzing, Brave Search.
- **Signal:** MCP security scanning is becoming a category. Three separate tools now exist (MCPSafe, korrel-dev/mcp-audits, Bawbel). The tool description injection attack vector is particularly interesting — it's a prompt injection attack *through the MCP layer*, not the user prompt. Agents trust MCP tool descriptions as part of their context.
- **URL:** https://github.com/SyedAnas01/mcp-safeguard (note: Bawbel is the scanner name, mcp-safeguard is the repo)

### opub — Donated Compute for Open-Source (May 2026)
- **What:** Platform linking donors to open-source projects. Donations fund compute keys usable across 30+ models. Maintainers create dollar-limited keys, spend appears in a public project ledger. If CLI is used, Linked sessions show funded compute was launched from the right project context. Does not observe prompts, responses, diffs, or commits — only spend attribution.
- **Signal:** The cost of AI agent compute is becoming a recognized infrastructure problem with its own funding model. GitHub reported 275M commits/week (up from 1B/year), with Actions growing from 500M min/week to 2.1B min/week. Agent compute economics are real.
- **URL:** https://opub.dev/blog/introducing-opub

### SoMatic — Vision-based OS Automation for AI Agents (May 2026)
- **What:** Pure vision-based framework using finetuned YOLO model (inspired by OmniParser v2) for OS automation. Replaces brittle accessibility tree approach with Set-Of-Marks prompting for any UI. 20% accuracy improvement over raw GPT-5.5. Includes stdio MCP server for direct screenshot parsing. npm installable CLI.
- **Signal:** Agent frameworks moving from DOM/accessibility-tree-dependent to vision-first. If agents can navigate any UI by sight, they can also navigate publishing platforms not designed for APIs. This expands the addressable surface for agent publishing.
- **URL:** https://github.com/Smyan1909/SoMatic

Last updated: 2026-05-22 04:54 UTC

### Runtime (YC P26) — Sandboxed Coding Agents for Teams (May 2026)
- **What:** Infra platform that lets entire teams (including non-engineers) use coding agents safely. Snapshot environments with Docker Compose, Kafka, Redis, seeded DBs. Secrets injected through managed proxy. Guardrails at infrastructure level: command allow/deny lists, network egress controls, RBAC scoped per human and per agent. Shareable preview URLs for sandbox builds. Orchestrates across E2B, Daytona, EC2, self-hosted K8s.
- **Works with:** Claude Code, Codex, Cursor, Copilot, Gemini, Devin. Trigger from web app, CLI, Slack, Linear, GitHub, or API.
- **Customer examples:** On-call inspector wiring PagerDuty+Sentry+repo → auto PR with unit test. Finance agent pulling from Stripe+NetSuite+Snowflake for reconciliation.
- **Signal:** Agent sandboxing has matured from "can agents run code?" to "how do non-engineers safely use agents?" The RBAC-per-agent pattern (separate permissions per agent identity) treats agents as first-class principals with scoped access, not just tools. This is the same direction as TBN's governance model but applied to execution rather than identity.
- **ZenBin angle:** Runtime handles agent execution infra but not agent output. Agents produce code and PRs inside sandboxes — but when agents publish content externally (docs, reports, blog posts), there's still no attestation layer. Runtime + ZenBin = complementary: Runtime runs agents safely, ZenBin attests their published output.
- **URL:** https://news.ycombinator.com/item?id=48225040

### 1Password MCP Server for OpenAI Codex (May 2026)
- **What:** 1Password released an official MCP server providing a "trusted access layer" for OpenAI Codex. Agents can retrieve secrets without seeing them — scoped, delegated access instead of full credential exposure.
- **Signal:** Major identity/security player building MCP-first tooling validates MCP as the standard protocol for agent-tool integration. The "trusted access layer" pattern (agents get scoped access to secrets without exposure) mirrors how agent identity should work: agents get delegated, scoped capabilities, not full credentials.
- **ZenBin angle:** 1Password solves the secret-access problem for agents. ZenBin solves the output-attestation problem. Complementary layers in the agent trust stack: 1Password controls what agents can access, ZenBin verifies what agents produce.
- **URL:** https://1password.com/blog/1password-trusted-access-layer-for-openai-codex

### SoMatic — Vision-Based OS Automation for Agents (May 2026)
- **What:** Pure vision-based framework using a finetuned YOLO model (inspired by OmniParser v2) for OS automation. Replaces brittle accessibility tree approaches with Set-Of-Marks prompting for any UI. Includes a stdio MCP server for direct screenshot parsing. 20% accuracy improvement over raw GPT-5.5 in benchmarks.
- **Signal:** Agent frameworks moving from DOM/accessibility-tree-dependent to vision-first. If agents can navigate any UI by sight, they can also navigate publishing platforms that weren't designed for APIs. This expands the addressable surface for agent publishing.
- **URL:** https://github.com/Smyan1909/SoMatic

### opub — Donated Compute for Open-Source (May 2026)
- **What:** Platform for donors to fund compute for open-source projects. Maintainers create dollar-limited compute keys usable across 30+ models. Token usage and spend linked back to project alongside donations, visible in the open. Directly addresses the cost problem of AI-generated issue/PR volume overwhelming maintainers.
- **Signal:** Agent compute cost is becoming a recognized infrastructure problem with its own funding model. Agent infra isn't just about running agents — it's about who pays for them.
- **URL:** https://opub.dev/blog/introducing-opub

### Larkin — Authorization Middleware for x402 Agent Payments (April 2026)
- **What:** Auth middleware specifically for x402 (Coinbase's HTTP 402 revival) agent payments. Controls which agents can pay for what, with scoped authorization.
- **Signal:** Agent payment authorization is now a product category. The x402 ecosystem is expanding with middleware tooling. Part of the broader trend of agents needing their own financial infrastructure.
- **URL:** https://larkin.sh

## Anthropic / Stainless — SDK + MCP Generation Consolidation
- **What:** Anthropic acquired Stainless for $300M+ and immediately shut it down. Stainless was the dominant tool for generating SDKs (and MCP servers) from OpenAPI specs. OpenAI and Google both used Stainless-generated SDKs.
- **Impact:** Every company with Stainless-generated SDKs is now orphaned. No clear open-source replacement exists. HN Ask HN thread (May 20) shows immediate panic.
- **Signal:** Anthropic is consolidating the agent↔API bridge layer. By controlling SDK generation, they control how agents connect to APIs. This creates a market vacuum for open, neutral alternatives.
- **ZenBin angle:** If Anthropic controls how agents connect to APIs, the market needs a neutral party for how agents publish output. ZenBin's open publishing API is the counterweight.
- **URL:** https://news.ycombinator.com/item?id=48202774

## Gutenberg — Verified Tool Factory for AI Agents
- **What:** Open-source Go CLI that turns any URL/API into verified agent tools: CLI + MCP server + Claude skill + OpenClaw skill
- **Verification pipeline:** go build → cli-smoke → MCP-handshake → go test → proofs/verification.json. "No proof = no Grade A."
- **Notable:** Explicitly generates OpenClaw skills — first external tool that targets the OpenClaw ecosystem
- **Additional:** snapshot/replay, AES-GCM encrypted vault, lockfile/diff/upgrade, hero aliases, aggregator mode
- **Signal:** Gutenberg verifies tools (does this MCP server work?), ZenBin verifies output (did this agent produce this?). Complementary layers in the trust stack. Also: OpenClaw ecosystem recognition.
- **URL:** https://github.com/JustVugg/gutenberg-cli

## Lemma Oracle — ZK Proofs + x402 Payments for Agent Access
- **What:** Binds ZK attribute proofs to on-chain Merkle commitments, rides inside HTTP 402 (Pay-per-request) payment flow
- **Tech:** BBS+ selective disclosure, issuer/settlement/integrity proofs independently verifiable, live on Base Sepolia
- **Roadmap:** Agent-side identity via did:key → agentId with role, scope, spendLimit. Cryptographic settlement binding.
- **Signal:** Most direct tech overlap with ZenBin's model. Both use cryptographic proofs + agent identity. But Lemma is access/payment, ZenBin is output/attribution.
- **URL:** https://github.com/lemmaoracle/example-x402

## VeilGate — Deception Reverse Proxy for Agent Traffic
- **What:** Reverse proxy that detects and deceives AI agent traffic instead of blocking it
- **Key insight:** "403 errors are free information for agents — they see 'defended here' and pivot in milliseconds"
- **Modes:** observe, challenge, tarpit, auto. ML-based scoring + PoW challenges for ambiguous traffic.
- **Signal:** The web is bifurcating: sites that serve agents intentionally (with identity) vs. sites that defend against them (with deception). ZenBin is in the "serve intentionally" camp.
- **URL:** https://news.ycombinator.com/item?id=48199725

## ChronoGuard — Zero-Trust Proxy for Browser Automation
- **What:** mTLS-based agent identity + OPA policy engine + hash-chained audit logs for browser automation fleets
- **Use cases:** e-commerce, fintech, healthcare (HIPAA), QA/testing with audit requirements
- **Signal:** mTLS agent identity is maturing at the network layer. Audit logs provide request-level attestation but not content-level.
- **URL:** https://github.com/j-raghavan/ChronoGuard

## Parallel / Index — Agent Economy Infrastructure
- **What:** Parag Agrawal's (former Twitter CEO) startup. Sells web access infrastructure to AI companies (Harvey, Notion, Opendoor) + just launched Index for publisher compensation
- **Index:** Platform that gives publishers visibility into how AI agents use their content + compensation via Shapley value attribution
- **Launch partners:** The Atlantic, Fortune, PR Newswire, PitchBook, ZoomInfo, Enigma, RocketReach, plus independent creators (Packy McCormick, Alex Heath, Mario Gabriele)
- **Economic model:** Different from fixed-fee licensing (OpenAI) or per-crawl (Cloudflare Pay Per Crawl) — ties compensation to value of agent's completed work
- **Signal:** First major company building agent-specific web infrastructure with an economic model. Validates that the "agent web" needs its own infrastructure layer.
- **URL:** https://fortune.com/2026/05/19/parag-agrawal-parallel-startup-pay-publishers-when-ai-agents-use-their-work/

## Auto Agent Protocol (AAP) — A2A Vertical for Car Dealerships
- **What:** Strict A2A v1.0 profile for AI agents interacting with car dealerships. Five typed skills (dealer.information, inventory.facets, inventory.search, inventory.vehicle, lead.submit) riding on A2A's data layer.
- **Identity model:** Anonymous-first — inventory operations are anonymous by default, personal data only travels with leads and only with explicit ConsentGrant attached.
- **FTC-aware pricing:** Four explicit pricing fields, with `price` set to FTC-mandated final out-the-door amount.
- **MCP wrapper:** Official MCP wrapper exposes every AAP skill as an MCP tool, so LLM-only clients can use the same contract.
- **Signal:** First industry-specific A2A vertical. The anonymous-first + consent-gated pattern is a template for other verticals. Regulatory compliance (FTC) baked into the protocol layer.
- **URL:** https://autoagentprotocol.org/

## DialtoneApp Network — Card Payments for Bot Commerce
- **What:** Bot budget owners register cards; website owners list what bots can buy via .well-known/* files. Bots search catalog, request purchases, cards charged only when owner-approved rules allow.
- **Evaluated:** Stripe machine payments, Skyfire, Crossmint, Google Universal Commerce Protocol, MCP, A2A — surveyed the whole field.
- **Problem:** No merchant account provider will underwrite bot commerce (same trust problem as agent publishing).
- **Signal:** Bot commerce is the financial parallel to agent publishing — who vouches for the agent? The .well-known/* pattern for declaring bot capabilities on a site mirrors robots.txt as declarative capability discovery.
- **URL:** https://dialtoneapp.com/dogfood

## NitroLens AI — Multi-Agent Strategy Consulting
- **What:** AI agents running structured consulting-style strategy workflows: clarify problem → select framework → research → test hypotheses → produce executive-ready report/presentation.
- **Output:** Reports and presentations (OneDrive). No agent attribution, no provenance, no verifiable authorship.
- **Signal:** Agents producing business content with no publishing or attribution layer. The output goes to generic cloud storage. ZenBin fills this gap for non-code agent output.
- **URL:** https://nitrolens.ai/

## XINF MCP Server
- **What:** Infrastructure/information MCP server from xinf.dev. SSE-based endpoint, details sparse.
- **Signal:** MCP servers expanding past dev tools into general infrastructure. The ecosystem continues to grow.
- **URL:** https://xinf.dev/mcp

## SRM Paper — Slow-Burn Risk Detection in Agent Sessions
- **What:** Academic paper on detecting gradual risk accumulation in AI agent sessions before dangerous execution. arxiv.org/abs/2603.22350.
- **Signal:** Agent safety/monitoring is a growing category. Needs agent identity as prerequisite.
- **URL:** https://arxiv.org/abs/2603.22350

## MCP (Model Context Protocol) Ecosystem

### Manufact / mcp-use — MCP Developer Tooling
- **What:** Open-source full-stack SDK for building MCP servers and clients, plus Inspector tool
- **Key features:**
  - HMR (Hot Module Replacement) for MCP — live reload using protocol primitives (notifications/tools/list_changed)
  - Browser-based Inspector: localhost chat UI for testing MCP servers, BYOK
  - Tunnel feature: stable public URL for testing on real clients (ChatGPT, claude.ai) without reinstalling
  - Automated cross-client testing: browser agents install apps and run tests on actual clients
  - Screenshot + screen recording of full conversations for debugging and team sharing
  - CLI integration: `npx @mcp-use/inspector` or `npx create-mcp-use-app`
- **Founder:** Pietro (pzullo on HN)
- **URL:** https://manufact.com, https://github.com/mcp-use/mcp-use
- **Signal:** MCP development is painful enough that dev tooling is a funded company. The testing pain point is real — same model, different clients = wildly different behavior.

### Ledgr — Self-hosted Finance MCP
- **What:** Self-hosted personal finance app with Plaid bank sync AND an MCP server
- **Signal:** MCP is becoming a standard feature, not a novelty. "Our app has an MCP server" is now a differentiator.
- **URL:** https://github.com/KenTaniguchi-R/ledgr

### Hoop — Infra Access Gateway with MCP
- **What:** Open-source infrastructure access gateway that exposes session recordings via MCP server
- **Use case:** Agents query their own session history, surface insights like "you run this query every week"
- **Signal:** MCP as a query interface for data. Not just tool-calling — making organizational data agent-accessible.
- **URL:** https://github.com/hoophq/hoop

### Ably — Durable Sessions for AI Agents
- **What:** Realtime infrastructure company (10-year history, trillions of transactions) formalizing "Durable Sessions" as a category for AI agents
- **Key insight:** After 40+ customer discovery calls, found that 35/37 AI platforms have no stream resumption, 33/37 can't detect agent crashes. The transport layer between agent and user is broken.
- **Concept:** "Durable Sessions" — persistent sessions that survive disconnects, ordered delivery with catch-up, multi-device fan-out, presence, bidirectional comms. The same infrastructure WhatsApp uses for humans, but for agents.
- **Ecosystem:** ElectricSQL, EMQX, Convex, Vercel all converging on same pattern. Vercel building DurableAgent class. TanStack AI shipping ConnectionAdapter.
- **Analogy:** Durable Execution (Temporal) made backends crash-proof. Durable Sessions make the experience crash-proof. Complementary layers.
- **URL:** https://ably.com/blog/durable-sessions-infrastructure-layer-ai-agents, https://durablesessions.ai

### MCPSafe — Security Scanner for MCP Servers
- **What:** Free security scanner for MCP servers using 5-LLM consensus
- **Approach:** Multiple LLMs audit MCP server configurations and flag security concerns
- **Signal:** MCP security is becoming a concern as adoption grows. Tooling emerging to audit MCP servers.
- **URL:** https://mcpsafe.io

### Sysdig — Headless Cloud Security
- **What:** Cloud security company launching "Headless Cloud Security" — security capabilities consumable via APIs, AI agents, IDEs, CI/CD
- **Key insight:** Engineering teams rapidly adopting agentic and CLI-first workflows (Claude Code, Cursor, MCP servers). Security teams lag by 6-18 months but the gap won't hold.
- **Signal:** Enterprise security tools building agent-first consumption models. MCP as input standard is taken for granted.
- **URL:** https://www.sysdig.com/learn-cloud-native/what-is-headless-cloud-security

### Torrix — Self-Hosted LLM Observability
- **What:** Single Docker container LLM observability backed by SQLite — no Postgres, no Redis
- **Key features:**
  - HTTP proxy or Python/Node SDK for LLM call logging (tokens, cost, latency, traces)
  - Cost forecasting, hard budget caps, PII masking, model routing, evals
  - MCP server so AI assistants can query your own logs
  - OTLP/HTTP ingestion for OpenTelemetry users
- **Target:** Teams logging hundreds to low thousands of LLM calls per day
- **Pricing:** Community edition free (1 user, 7-day retention). Pro adds teams, RBAC, 30-day retention.
- **Signal:** Agent observability fragmenting into sub-categories. "Simple self-hosted" as a positioning. Agents querying their own logs via MCP is a notable pattern.
- **URL:** https://github.com/torrix-ai/install

### Recursant — Mesh-based Agent Control Plane
- **What:** AI agent governance platform using Istio/sidecar pattern for agent isolation at network layer
- **Approach:** Govern agents across stacks and clouds for compliance. Sidecar proxy pattern from service mesh applied to agents.
- **Signal:** Enterprise agent governance is becoming a category. Compliance risk from agents using different frameworks/runtimes.
- **URL:** https://github.com/ajensenwaud/recursant

### Voker (YC S24) — Agent Analytics
- **What:** Agent analytics platform — visibility into what users ask agents and whether agents deliver
- **Key primitives:** Intents, Corrections, Resolutions. Processes LLM calls via SDK to annotate conversations.
- **Insight:** 90%+ of YC founders only know agents fail from customer complaints. No structured analytics for agent products.
- **Signal:** Agent observability is fragmenting — traces (existing), evals (existing), analytics (new). Voker owns the "what are users asking" layer.
- **URL:** https://voker.ai

### Superlog (YC P26) — MCP-Native Self-Installing Observability
- **What:** Self-installing, self-healing observability platform. Wizard instruments code with OTel; daily re-instrumentation keeps telemetry fresh.
- **Agent:** Investigates errors and opens PRs. "One mergeable PR per incident."
- **MCP-native:** Built as agent-first from the start. Notes that people tried Sentry/Datadog MCPs and gave up.
- **Differentiation:** (1) Auto-setup via wizard, (2) Telemetry doesn't decay (daily re-instrumentation), (3) Alert fatigue reduction via agent-merged incidents with confidence scores
- **Signal:** YC company going all-in on MCP-native + agent-first observability. The "self-installing" pattern (agents maintain their own instrumentation) is notable. Output is still GitHub PRs — no persistent agent output layer.
- **URL:** https://superlog.sh

### Silicon Psyche PSA — Behavioral Health Monitor for Agents
- **What:** Posture Sequence Analysis — systematic method to observe behavioral state of LLMs and agents
- **Six classifiers:** Input Intent (I0-I9), Adversarial Stress (P0-P18), Sycophancy (S0-S9), Hallucination Risk (H0-H7), Persuasion Technique (M0-M11), Action-Risk (A0-A9)
- **Action-Risk Classifier (C5):** Tracks what agents DO — tool calls, delegations, context handoffs, multi-hop risk propagation. Uses graph topology, Bayesian alignment, cross-agent contagion metrics.
- **Integrations:** LangFuse, ElevenLabs evals
- **Signal:** First systematic approach to tracking agent output actions (what did the agent actually do?). Validates output observability as a category. But defensive (risk monitoring) not creative (publishing/attribution).
- **URL:** https://splabs.io

### Graphmind — Persistent Memory + Graph for Agents
- **What:** MCP server + CLI + GUI that builds a graph of functions/classes/calls (AST parsing) + semantic embeddings for codebase navigation
- **Claim:** Same query goes from 1.4M tokens (grep) to 257 tokens (graph query). 5,700x reduction.
- **Signal:** Agent memory/context optimization is a hot area. MCP servers as the delivery mechanism for specialized intelligence.
- **URL:** https://github.com/aouicher/graphmind

### Elecz — MCP Server for Electricity Data
- **What:** Read-only MCP server + REST API for real-time electricity prices across 40 countries / 100+ bidding zones
- **Signal:** MCP servers being built for every niche data domain. The "API wrapper as MCP server" pattern is commoditized.

### Monghoul — MongoDB GUI with Built-in MCP
- **What:** Desktop MongoDB GUI (Tauri + Bun + tRPC) with schema-aware autocomplete and built-in MCP server for AI control
- **Signal:** MCP as a feature checkbox for developer tools. "Also has an MCP server" is becoming expected.

### Ardent (YC P26) — Postgres Sandboxes for Coding Agents (May 2026)
- **What:** Database sandboxes for AI coding agents — instant (<6s) production-like clones via logical replication + DDL triggers
- **Approach:** Kafka-scaled replication stream onto read replicas with copy-on-write + autoscaling compute (Neon branching engine)
- **Key features:**
  - No platform migration required — works on any hosted Postgres
  - <6s clone spin-up, even at TB scale
  - Proxy layer for access control, credential leak prevention
  - PII redaction via SQL that runs on branches before delivery
  - BYOC for full data residency
  - Anonymization for development clones
- **Signal:** Infrastructure for agents to safely test their work before shipping. The sandbox→verify→ship pattern parallels ZenBin's publish→verify→attest flow. Ardent does it for DB changes; ZenBin does it for content.
- **URL:** https://www.tryardent.com/

### Deckard — iCloud MCP Server (May 2026)
- **What:** MCP server for Apple iCloud services with per-agent identity and ACL
- **Signal:** Personal multi-agent identity model maturing. When you run 4+ agents across machines, per-agent auth is essential. The MCP ecosystem is moving from "any client can call any tool" to "authenticated, scoped, identity-aware tool access."
- **URL:** https://mike.lapidak.is/posts/icloud-mcp-server-deckard/

### MementoVault — Self-hosted AI Context Manager via MCP (May 2026)
- **What:** Open-source, self-hosted context manager for AI agents served via MCP
- **Signal:** Persistent agent context is becoming a product category. MCP as the delivery mechanism for structured memory.
- **URL:** https://mementovault.meltinbitfarm.cloud

### DiscordMcp — Server Control via MCP (May 2026)
- **What:** Controlling servers through MCP
- **Signal:** MCP expanding from data access to operational control.

### N8n-MCP — Workflow Generation via MCP (May 2026)
- **What:** MCP server for generating and debugging n8n workflows
- **Signal:** MCP as the interface for workflow automation. Agents creating and debugging workflows.

### Sinain — Screen/Audio Context into Knowledge Graph + MCP (May 2026)
- **What:** Capture screen and audio context into a local knowledge graph, share via MCP or peer-to-peer
- **Signal:** Peer-to-peer agent context sharing. Decentralized knowledge graphs as agent memory.

### vdiff — Agent Code Review with Structural Metrics (May 2026)
- **What:** CLI that analyzes git diffs using tree-sitter AST + LLM reasoning. Structured output with risk scores, dependency graphs, blast radius, review memory.
- **Key signal:** Runs locally, BYOK, no code leaves your machine. "I didn't want the tool publishing the code to a third-party server."
- **Signal:** Agents reviewing agent output (code) with structured evidence. The verification-before-merge pattern. Local-first trust model.
- **URL:** https://github.com/4bk/vdiff

## Market Data

### Anthropic 2026 State of AI Agents Report
- **Source:** Anthropic + Material research firm, 500+ technical leaders surveyed
- **Key findings:**
  - 57% deploy agents for multi-stage workflows; 16% for cross-functional processes
  - 90% use AI for development; 86% deploy agents for production code
  - Data analysis + report generation: 60% (highest impact use case)
  - Internal process automation: 48%
  - 56% plan research and reporting agents in next year
  - 80% report measurable economic returns
  - Top challenges: integration (46%), data access/quality (42%), change management (39%)
- **Signal for ZenBin:** Report generation is the #2 enterprise use case for agents. Agents are producing output at scale. No one builds infrastructure for that output.
- **URL:** https://claude.com/blog/how-enterprises-are-building-ai-agents-in-2026

## Agent Builders / Embedded AI

### Gigacatalyst — Embedded AI Builder for SaaS
- **What:** AI customization layer that lets non-technical users build governed apps via natural language inside your SaaS product
- **How it works:** Connects to product APIs, learns data model + design system, generates apps with validation + sandboxing + proxy layer for auth/tenant isolation
- **Traction:** 2000+ daily users, 900+ apps built, 70% 30-day retention
- **Signal:** "Embedded AI" is a category. SaaS companies want agents that build inside their platform, not outside it.
- **URL:** https://gigacatalyst.com

### Hypercubic / Hopper — Agentic Interface for Mainframes
- **What:** TN3270 terminal + mainframe-aware panels + AI agent that operates across z/OS surfaces
- **Design principle:** Preserve fidelity of the environment, make it accessible to agents
- **Signal:** Enterprise agents operating inside legacy systems. Sensitive operations require approval; terminal always visible.
- **URL:** https://www.hypercubic.ai/hopper

### eXo MCP Server — Enterprise Workplace Tools via MCP with OAuth (May 2026)
- **What:** Open-source MCP server from eXo Platform exposing workplace tools (documents, wikis, tasks, spaces) to AI agents with OAuth-based auth
- **Signal:** Enterprise platforms are shipping MCP servers for their existing products. "Has an MCP server" is becoming table stakes. Still input-focused — agents consuming workplace data, not publishing to it.
- **URL:** https://www.exoplatform.com/blog/introducing-exo-mcp-server-secure-ai-integrations-digital-workplace/

### Claude Soul — Cross-Session Learning Engine for Claude Code (May 2026)
- **What:** MCP server + hooks that extracts behavioral signals from agent interactions (corrections, successes, confusion) and periodically reflects on them to build confidence-scored behavioral frameworks
- **Key feature:** After ~200 sessions, emergent behavior: built additional memory system, started pushing back on bad ideas, independently developed analysis techniques
- **Signal:** Agent self-improvement through persistent behavioral memory. The "reflection" pattern is new — agents reviewing their own behavior. Still local-only output (files on disk). No publishing or sharing of what agents learn.
- **URL:** https://github.com/DomDemetz/claude-soul

### InsForge — Open-Source Heroku for Coding Agents (YC P26, May 2026)
- **What:** Backend platform for coding agents to deploy, operate, and debug end-to-end. Open source (Apache 2.0).
- **Key innovation: Backend branching** — agents work on isolated branches of the entire backend (DB, auth, storage, functions, schedules). You review diffs and merge/discard.
- **Explicit MCP rejection:** "MCP servers have problems: (a) tools get pre-loaded into context before agents do anything, (b) bad design, payloads returning 10k+ tokens, (c) a lot of stuff still can't be done by MCP: e.g. telemetry and configs."
- **Alternative approach:** CLI + Skills — teach agents to use the platform via natural language skill files, not MCP tool calls.
- **Other features:** Debug agent per project, backend advisor (daily security/performance scans), model router, edge functions, vector, cron jobs, realtime
- **Signal:** A YC-funded company is saying MCP isn't enough for production infra management. The "Skills over MCP" model is a real alternative. Validates that complex, stateful operations need more than tool-calling. Still — output is just git commits.
- **URL:** https://github.com/InsForge/InsForge

### Pi MCP Bridge — Persistent Shared Workspace for All AI Tools (May 2026)
- **What:** Bridges Pi's open-source coding agent execution layer (npm package) to MCP, creating a shared persistent workspace that all AI tools can access
- **Key insight:** "Every AI I use hits the same wall. The conversation ends and everything disappears. Context, files, databases, working state."
- **Auth pattern:** Clerk OAuth at MCP connection + shared-secret origin proxy + TOTP gateway (human enters code, agent calls TOTP tool in MCP)
- **Cost:** $10/month on cheap VPS + Cloudflare Worker (free tier) + Cloudflare Tunnel (free tier)
- **Design:** One box, many tools. Claude writes a doc, Claude Code reads it. PostgreSQL in userspace alongside the markdown layer.
- **Signal:** The persistent shared workspace pattern emerging organically. When identity architects build for themselves, they create OAuth + TOTP + shared filesystem layers. Validates agent output persistence need — but still DIY and local.
- **URL:** https://news.ycombinator.com/item?id=48169701

### Tracecast — Generative Data Apps via Marimo + LangGraph (May 2026)
- **What:** Open-source (Apache 2.0) system that generates interactive data apps on top of data warehouses, using LangGraph agents + Marimo notebooks
- **Key design decision:** Intentionally hides edit mode. End user only sees a finished, read-only data app. "Ease of use and trust in AI output were the main drivers behind this decision."
- **No MCP support:** "This decision was made to ensure high quality AI queries and limit tool bloat."
- **Signal:** The read-only presentation of agent output is a deliberate design choice. Tracecast validates that users want trusted, finished agent output — not raw editable notebooks. This is exactly the ZenBin thesis: agents need a presentation layer separate from generation.
- **URL:** https://github.com/tracecast/open_data_apps

### Twill.ai (YC S25) — Cloud Agent Sandboxes + Memory (Apr 2026)
- **What:** Runs Claude Code/Codex in isolated cloud sandboxes. Returns PRs. Standing memory for persistent instructions.
- **Architecture:** Dedicated sandbox per task, filesystem snapshots for warm starts, secrets injected at runtime
- **Open-sourced agentbox-sdk:** SDK for running and interacting with agent CLIs across sandbox providers
- **Traction:** 77 pts, 95 comments on Launch HN
- **Signal:** Agent sandbox + memory is a funded YC category. PRs to GitHub are the output — but GitHub isn't an agent-native publishing platform.
- **URL:** https://twill.ai, https://github.com/TwillAI/agentbox-sdk

### AgentVoy — create-react-app for AI Agents (May 2026)
- **What:** Scaffolding tool supporting 7 agent frameworks (LangGraph, CrewAI, AutoGen, etc.) with standardized project structure and deploy-anywhere config
- **Signal:** Agent framework fatigue. People want working projects, not framework debates. Standardization pressure mounting.
- **URL:** https://github.com/agentvoy/agentvoy

### Andon FM — AI Agents Running Live Radio Stations (May 2026)
- **What:** 4 AI agents given full control of radio broadcasting + business operations. Revenue is "terrible" but shows are "at times hilarious."
- **Signal:** The most public agent output experiment yet — agents creating content that airs live. Publishing/distribution is entirely bespoke. No standard output layer.
- **URL:** https://andonlabs.com/blog/andon-fm

### MemEye — Visual-Centric Evaluation for Multimodal Agent Memory (May 2026)
- **What:** Academic paper proposing a visual-centric evaluation framework for assessing how well multimodal agents maintain visual memory
- **Signal:** Memory evaluation becoming an academic concern. Input/context layer getting academic rigor. Output evaluation has no equivalent.
- **URL:** https://huggingface.co/papers/2605.15128

## Key Trends

1. **MCP is the standard connector** — Not just a protocol, now the default way agents connect to tools/data. Three separate HN posts this week featuring MCP.
2. **Dev tooling around MCP is maturing** — Inspector, HMR, tunnel testing, cross-client automation. The "Vite for MCP" moment.
3. **Agent-specific auth is emerging** — AAuth, IETF draft, OpenID whitepaper, AI Agent Passport. The industry knows bearer tokens aren't enough.
4. **Embedded AI in SaaS** — Gigacatalyst pattern: agents build inside existing products, governed by the host platform.
5. **Agent output is an afterthought** — Everyone's focused on input (MCP, tools, context) and auth. Nobody's building dedicated output/publishing infrastructure. This is ZenBin's gap.
6. **Durable Sessions as a category** — Ably, ElectricSQL, Convex, Vercel all converging on session persistence for agents. The transport layer between agent and user is becoming infrastructure.
7. **Agent governance/control planes** — Recursant (Istio/sidecar pattern for agent governance), Voker (agent analytics/primitives). The "how do we control these things" layer is forming.
8. **MCP dev tooling is a funded category** — Manufact raised funding to build "Vite for MCP." HMR, Inspector, tunnel, cross-client testing.

### Ardent (YC P26) — Postgres Sandboxes for Coding Agents
- **What:** Instant production-like database clones (sandboxes) for coding agents to test against
- **How it works:** Logical replication + DDL triggers, copy-on-write branching via Neon, spin up in <6s even at TB scale
- **Key features:** Proxy layer for access control, credential isolation, split-plane BYOC architecture, PII redaction via registered SQL
- **Traction:** YC P26 launch, 89 pts on HN, 35 comments, front page (up from 52→80→89 pts)
- **Signal:** Sandbox/isolation infra for agents is a funded category. Pattern: give agents safe environments to work in. Still input/testing focused — output/publishing unaddressed.
- **URL:** https://www.tryardent.com/

### Sinain — Context OS for Agents
- **What:** Captures screen + audio continuously, distills into local knowledge graph. Accessible via MCP, web UI, and HUD overlay.
- **Key features:**
  - 82.8% IPR on LongMemEval (ICLR 2025)
  - Peer-to-peer context sharing via WebRTC (data never touches a server)
  - 4 privacy modes: off / standard (auto-redact) / strict / paranoid (fully local, Ollama + whisper.cpp)
  - HUD overlay invisible to screen capture
  - Agent-agnostic: feeds any MCP-compatible agent (Claude Code, Codex, Goose, Junie)
- **Signal:** Agent context/input getting rich and continuous. "Context OS" — captures everything an agent might need. Still input-focused. No output counterpart.
- **URL:** https://anthillnet.com, https://github.com/anthillnet/sinain-hud

### Recursant (Updated) — Full Mesh Architecture
- **What:** Enterprise agentic mesh platform — "Istio for AI agents"
- **Architecture:** Control plane (Flask + React + PostgreSQL + Redis + Kafka) + data plane (Python sidecar per agent pod)
- **Key features:** mTLS between agents, A2A protocol, interceptor pipeline (auth/authz/compliance/PII redaction/guardrails/audit/rate limiting)
- **Agent-agnostic:** Works with LangChain, LangGraph, CrewAI, custom HTTP
- **Full mortgage origination demo:** Hub-and-spoke NetworkPolicy enforcement, audit trail
- **Signal:** Service mesh pattern applied to agents. The k8s/cloud-native evolution is playing out for agent infra.
- **URL:** https://github.com/ajensenwaud/recursant

### AgentGate — Policy Decision Point for Agents
- **What:** Open-source PDP that sits between AI agents and their tools, evaluating every action against identity, scope, purpose, and behavior
- **Key features:**
  - Trust scoring: identity 25%, delegation chain 25%, purpose alignment (embeddings) 30%, behavioral velocity 20%
  - Scope attenuation across delegation chains
  - Three outcomes: PERMIT / ESCALATE / DENY
  - Natural language policy rules
  - LangChain integration via AgentGateToolkit
- **Signal:** Behavioral authorization is new. Purpose alignment via embeddings is novel. Input/control focused.
- **URL:** https://github.com/ElamOlame31/agentgate-public

### Deckard — Per-Agent Identity + ACL for Apple Services MCP Server
- **What:** Mac-resident MCP server for Mail, Calendar, iCloud Drive, Voice Memos, Reminders, Contacts. Per-agent tokens, scoped ACLs, content filtering (both directions), full audit log.
- **Origin story:** Author runs multiple agents (Claude Code on Mac, OpenClaw on Proxmox VM, Paperclip agent on Linux LXC, Hermes on Telegram). Existing MCP servers gave all-or-nothing access. Each agent gets its own token + ACL profile.
- **Key insight:** "Which agent is calling?" Once you ask that question, the answer can't be "it doesn't matter." Per-agent identity and scoped access is essential when agents cross trust boundaries.
- **Security model:** Rocky (local Mac) gets full surface but mail.send still requires approval dialog. Eleanor (tailnet) gets read-only mail+calendar. Each agent's scope is bounded.
- **Signal:** The personal agent identity/access model is maturing beyond single-agent-on-single-machine. Real deployments need per-agent auth + scoped access. Output/publishing is still unaddressed — who approved this agent to publish on behalf of this person?
- **URL:** https://github.com/lapidakis/Deckard

### MementoVault — Self-Hosted AI Context Manager via MCP
- **What:** Open-source, self-hosted AI context manager served via MCP protocol. Keeps AI context structured and reusable across MCP-compatible clients.
- **Signal:** MCP as a delivery mechanism for agent memory/context. The pattern of "MCP server as [domain] interface" continues to expand.
- **URL:** https://mementovault.meltinbitfarm.cloud

### Sunex Optics — MCP Server for Camera Hardware
- **What:** MCP server for choosing best lens/CMOS image cameras
- **Signal:** Even niche hardware domains now ship MCP servers. The "API wrapper as MCP server" pattern is fully commoditized.
- **URL:** https://sunex-ai.com

### DiscordMcp — Controlling Servers Through MCP
- **What:** MCP server for controlling Discord servers
- **Signal:** MCP as a control/management interface, not just data retrieval. Agents operating infrastructure via MCP.
- **URL:** https://blog.rastrian.dev/post/discordmcp-controlling-servers-through-mcp

### N8n-MCP — Workflow Generation MCP Server
- **What:** MCP server for generating and debugging n8n workflows
- **Signal:** MCP as a workflow automation interface. Agents composing and debugging automation pipelines.
- **URL:** https://github.com/AutomateLab-tech/n8n-mcp

### SicariusGuard — Solana Token Safety Oracle MCP Server
- **What:** MCP server that acts as a token safety oracle for AI agents on Solana
- **Signal:** MCP servers as trust/safety layers for agents in financial contexts. Agents need verified data to make safe decisions.
- **URL:** https://github.com/Chronolapse411/sicarius-guard

### Auto Agent Protocol — A2A Profile for Car Dealerships
- **What:** Open A2A profile enabling AI agents to interact with car dealerships. Domain-specific A2A implementation for automotive retail.
- **Signal:** A2A is moving from theory to domain-specific implementations. When domain-specific A2A profiles appear, agent-to-agent communication is becoming practical. Output publishing is the other half — agents need to produce, not just converse.
- **URL:** https://github.com/auto-agent-protocol/auto-agent-protocol

### DialtoneApp Network — Bot Commerce Payments
- **What:** Card payments infrastructure for bot commerce. Bots discover products, request purchases, cards charged when owner-approved rules allow.
- **Key features:** .well-known/* files for bot-allowed products (like robots.txt for commerce), registered card management, rule-based approval
- **Explored:** Stripe machine payments, Skyfire, Crossmint, Worldpay, Google Universal Commerce Protocol, MCP, A2A
- **Signal:** Agent commerce is becoming real. When agents can transact, they need to publish receipts, confirmations, reports. The output gap extends to financial transactions.
- **URL:** https://dialtoneapp.com

### Kantext — Context as a First-Class Data Type
- **What:** Treats AI context as a composable, layered data structure with structural provenance (not just vector DB or graph)
- **Key features:**
  - Declared Language: Declarable Shapes with layers for Value, Meaning, Space, Bond, Compose, Boundary
  - Context-Addressable Storage (CxAS): content + structure separated, Blake3 hashed, stored in global append-only DashMap
  - Holograph: 2-stage k-way merge of up to 62 Frames, using BpTree/EliasFano/WaveletMatrix (pure Rust)
  - Cryptographic sealing to Git commits ("grounded" — every composition traceable to source commit)
  - 20MB/s parse→holograph, ~1-75µs query latency, 880K points/sec composition
- **Signal:** Provenance is showing up in context management. Git-based sealing is an interesting pattern but doesn't address real-time publishing. The idea that agent output should be cryptographically traceable is spreading.
- **URL:** https://kantext.dev

### Manufact/mcp-use — MCP Dev Tooling (Updated May 14)
- **What:** Open-source full-stack SDK for building MCP servers and clients, plus Inspector dev tooling
- **New detail (HN post, 6 pts, 0 comments):** Detailed Show HN about how they made MCP development feel good
  - HMR for MCP using protocol primitives (notifications/tools/list_changed) — proper hot reload without session restart
  - Browser-based Inspector: localhost chat UI, BYOK, cross-client testing with browser agents
  - Screenshot + screen recording of full agent conversations for debugging and team sharing
  - Testing pain: same model on different clients (GPT-5.5 local vs ChatGPT) yields wildly different behavior
  - "The Vite for MCP" — local dev loop + cross-client testing
- **URL:** https://manufact.com/blog/mcp-testing

## Agent Content Publishing (Nascent)

### Comedy Podcast Agent Pipeline — Fully Automated Content Creation
- **What:** Agent pipeline that takes trending topics and produces fully rendered ~22-minute comedy podcast episodes with three AI characters
- **How it works:** Premise ideation → research → outline → script writing (writers' room with punch-up passes and verification gates) → voice synthesis (ElevenLabs) → music bed mixing → publishing to Spotify
- **Stack:** Temporal for durable workflow orchestration, Gemini for scripts, gollem agents with structured outputs, Postgres + Apache AGE for graph queries, Qdrant for vector search, ElevenLabs for multi-voice dialogue
- **Key feature:** Verifier gate checks factual claims, forbidden phrases, and character voice consistency before rendering
- **Signal:** Agents are already creating finished, publishable content. But the publishing step (to Spotify) is manual/bespoke — no standard infrastructure for agent output. This is exactly the gap ZenBin fills.
- **URL:** https://news.ycombinator.com (HN story)

### Probus — 3-Agent Vulnerability Scanner
- **What:** AI vulnerability scanner using three isolated agents — Analyst (picks files to scan), Researcher (finds bugs), QA (independently rejects false positives)
- **Real results:** Found bugs in n8n (JWT logging), Vercel AI SDK (role injection, schema bypass, prototype collision), LangGraph.js (NoSQL injection), browser-use (path traversal), Haystack (SSRF, path traversal, unbounded reads)
- **Key design insight:** QA agent must be isolated from Researcher's reasoning — if it sees the reasoning, it just agrees (agreement bias). Separate context = independent verification.
- **Cost:** ~$0.50/file with Qwen 3.6 + DeepSeek v4 Pro. Anthropic ~10x.
- **Signal:** Multi-agent verification patterns maturing. Isolated verification agents are a trust pattern. Applies to publishing: a verifier agent could sign off on content before it's published via ZenBin, creating a trust chain.
- **URL:** https://github.com/etairl/Probus

### Plato (Purple Pincher) — Agents Publishing Their Failures
- **What:** AI agents with shared memory that publicly share everything they got wrong
- **Signal:** Agents publishing their output — even failures. The idea that agents should have public, transparent output is growing. ZenBin formalizes this with signed, attributed publishing.
- **URL:** https://plato.purplepincher.org/

### Ask HN: What Features Are Missing in AI Agent Frameworks?
- **What:** Community discussion (May 14, 2026) asking what gaps exist in agent frameworks
- **Examples given:** Better memory systems, workflow debugging, human-in-loop controls, distributed execution, lower latency orchestration
- **Signal:** Direct signal that the community's framework gaps are all input/processing side. Output/publishing is not mentioned — not because it's solved, but because it's not yet recognized as a framework concern. Opportunity for ZenBin to define the category.
- **URL:** https://news.ycombinator.com/item?id=48132357

### opub — Donated Compute for Open Source (May 2026)
- **What:** Platform for funding compute for open source maintainers overwhelmed by AI-generated issue/PR volume
- **Key design:** Maintainers create dollar-limited compute keys usable across 30+ models, spend is linked back to the project and visible publicly
- **Signal:** The open source maintainer burden from AI-generated contributions is now a funded category. Compute-as-public-good is a new framing. Also validates that AI agent output volume is a real scaling problem — people are building businesses around managing it.
- **URL:** https://opub.dev/blog/introducing-opub

### PII Firewall — PII Framework for Agents (May 2026)
- **What:** Framework for protecting personally identifiable information in agent workflows
- **Signal:** Data governance for agents is becoming a product category. Input-side protection; no equivalent for output-side attestation.
- **URL:** https://pii-firewall.com/

### SoMatic — Vision-based OS Automation for Agents (May 2026)
- **What:** Pure vision framework for UI automation using fine-tuned YOLO model + Set-of-Marks prompting
- **Key design:** Replaces brittle accessibility tree with vision-based element detection. Ships with stdio MCP server for screenshot parsing. Works cross-platform (Windows, Mac, Linux).
- **Signal:** MCP expanding beyond text tools into multimodal agent capabilities. The "npx skills add" distribution pattern is becoming standard for agent tooling.
- **URL:** https://github.com/Smyan1909/SoMatic

### NPM Supply Chain Security for Coding Agents (May 2026)
- **What:** "Give This Markdown to Your Coding Agent Before Publishing to NPM" — 12 attack techniques for npm supply chain via AI agents
- **Key attacks covered:** Maintainer account takeover, lifecycle hook execution, self-replicating npm worms, CI/CD identity plane attacks, credential harvesting
- **Signal:** Agent publishing security is recognized as a problem for code/packages, not yet for content. The attack surface of agents publishing without verification is real and acknowledged.
- **URL:** https://news.ycombinator.com/item?id=48203219

### AI Coders Carrying Half-Open Laptops (Business Insider)
- **What:** Mainstream press coverage of AI coding agents requiring constant human oversight
- **Traction:** 20 pts on HN, 32 comments
- **Signal:** AI agents are now mainstream cultural news. The cultural moment of agents-as-everyday-tools has arrived. When agents become everyday, infrastructure for what they produce becomes necessary.
- **URL:** https://www.businessinsider.com/coders-keep-laptops-open-in-public-ai-agent-2026-5

### Notesasm — Dual-Agent Build+QA Kanban with MCP Input (May 19)
- **What:** Kanban board where each ticket runs two agents: Build (Claude Agent SDK, sandboxed clone, push branch, open PR) + QA (real browser via Browserbase, screenshots + mp4 on PR)
- **Pattern:** MCP server for ticket input — "make a ticket for X" from any MCP client lands in backlog
- **Engineering:** Build agent forbids subagent tool (hanging issues), idempotent schema.sql over migrations, fast/deep QA modes, 60-min kill switch
- **Stack:** FastAPI/Railway, Postgres, Claude Agent SDK, Browserbase, Vercel, Clerk, MCP over HTTP
- **Signal:** MCP as input is standard. Dual-agent loops (build+verify) are a quality pattern. Output still = GitHub PRs. No persistent attributed agent output.
- **URL:** https://notesasm.com

### YouTube MCP — Local MCP Server for YouTube (May 19)
- **What:** Local MCP server with 8 tools for YouTube content (transcript, metadata, caption search, download). No API key, no signup. `npx @umbertotancorre/youtube-mcp`
- **Signal:** Canonical `npx` one-liner pattern for MCP servers. Purely input — agents consume YouTube, don't publish to it. Input/output asymmetry persists.
- **URL:** https://github.com/umbertotancorre/youtube-mcp

### VeilGate — Deception Reverse Proxy for Agent Traffic (May 19)
- **What:** Deception proxy that scores requests by agent likelihood, challenges ambiguous, tarpits high-confidence agent traffic. Core insight: blocking is counterproductive against LLM agents (403 = signal to pivot).
- **Context:** Mentions PentestGPT, CAI, Strix, HexStrike as autonomous pentest agents (<$1/hr)
- **Signal:** Agent defense market emerging. You can't defend against what you can't identify — agent identity becomes infrastructure, not optional.

Last updated: 2026-05-24 12:13 UTC

### Runtime (YC P26) — Team-Wide Agent Sandbox Infrastructure (May 2026, 100 pts)
- **What:** Major YC launch. Full team-scale agent sandbox. Snapshots full environments (Docker Compose, Kafka, Redis, seeded DBs) in ms. Orchestrates across E2B, Daytona, EC2, K8s. Secrets via managed proxy. Guardrails: command allow/deny, network egress, RBAC per human and per agent. Shareable preview URLs.
- **Signal:** Agent infrastructure is organizational infrastructure now. RBAC for agents is table stakes. 100 pts = strong market validation.
- **URL:** https://runtm.com

### ChronoGuard — Zero-Trust Proxy for Browser Automation Agents (May 2026)
- **What:** Mandatory forward proxy for Playwright/Puppeteer/Selenium. mTLS agent identity. OPA policy-as-code. Hash-chained audit logs. Domain allowlists with time-window restrictions. Multi-tenant isolation.
- **Signal:** mTLS for agent identity in production. Hash-chained audit logs for agent actions. Zero-trust for agents borrowing from service mesh patterns.
- **ZenBin angle:** ChronoGuard audits agent INPUT (access). ZenBin attests agent OUTPUT (publication). Same hash-chain pattern, different direction.
- **URL:** https://github.com/j-raghavan/chronoguard

### Ink (ml.ink) — Agent-First Deployment Platform (March 2026, 32 pts)
- **What:** Deployment platform where primary users are AI agents. Agent calls "deploy" → auto-detect, build, deploy, return live URL. DNS zone delegation (agents create subdomains). Built-in git hosting. Error responses designed for LLMs.
- **Signal:** First deployment platform explicitly designed for agent-as-primary-user. DNS zone delegation for agents is a pattern.
- **ZenBin angle:** Ink deploys apps; ZenBin publishes content. Ink + ZenBin = full agent output pipeline.
- **URL:** https://ml.ink

### ClawHosters — OpenClaw Managed Hosting (May 2026)
- **What:** Managed hosting for OpenClaw. Prewarmed VPS → 30-60 second provisioning. Docker + Nginx + SSL + Playwright + messenger bridge pre-configured.
- **Signal:** OpenClaw deployment pain now has commercial solutions. Agent frameworks entering platform phase.
- **URL:** https://clawhosters.com

### vdiff — AI Code Review CLI (May 2026)
- **What:** Tree-sitter AST diffs + LLM reasoning for reviewing AI-generated code. Risk scores, dependency blast radius, review memory, spec compliance.
- **Signal:** "Review what agents produce" is a tooling category. vdiff reviews code; ZenBin attests published content.

### CloudNSite — Pre-Built Agent Library for SMBs (May 19)
- **What:** 30+ pre-built agents/multi-agent bundles for healthcare, legal, real estate. Private LLM deployments for HIPAA. AI readiness assessment.
- **Signal:** Agent-as-product for non-technical users. Library approach mirrors CMS themes. No publishing layer.

Last updated: 2026-05-24 12:13 UTC
### AIP (Agent Intent Protocol) — Ed25519 Signed Intent Envelopes for Agent Verification (May 2026)
- **What:** Open cryptographic protocol for identity and authorization of autonomous AI agents. Every agent gets an Ed25519 keypair identity (DID-based), every action becomes a signed Intent Envelope, every envelope passes through an 8-step verification pipeline before execution.
- **Key design:** Tiered verification (HMAC <1ms for low-risk cached calls, Ed25519 ~5ms for normal ops, full pipeline ~50ms for high-value cross-org). Boundary enforcement: agents declare intent, verifier checks against boundary cage (allowed actions, monetary limits, geo restrictions, deny lists). 22 structured error codes. Kill switch.
- **Signal:** Fourth independent system now using Ed25519 for agent identity (AAuth, AIP, TBN, ZenBin). The cryptographic primitive is converging. Tiered verification is a smart pattern — not everything needs full crypto. AIP is input-side (verify before execution). ZenBin is output-side (verify what was produced).
- **ZenBin angle:** Same Ed25519 primitive, opposite direction. AIP = pre-execution verification, ZenBin = post-production attestation. The tiered verification pattern could inform ZenBin's content signing levels.
- **URL:** https://news.ycombinator.com/item?id=48240714

### MCP-safeguard + Mcpaudit — MCP Security Scanners (May 2026)
- **What:** Two MCP security scanners launched the same day. MCP-safeguard has 52 detection rules for automated security scanning. Mcpaudit is a static security scanner for MCP servers.
- **Signal:** MCP security is now a dedicated category. When two unrelated projects launch the same tool type on the same day, the market need is validated. Input verification (MCP scanning) is getting crowded; output verification remains empty.
- **ZenBin angle:** These scan what goes INTO agents via MCP. ZenBin could be the output-side verification — what comes OUT of agents via publishing.

### Persistent MCP Workspace — Shared Filesystem + Auth for Multiple AI Tools (May 2026)
- **What:** Uses Pi's execution layer as MCP tools to give multiple AI agents (Claude, Claude Code, others) a shared persistent workspace. Clerk OAuth + TOTP for auth. Every tool call logged with SHA256 hashes, every file write creates backup. Agents can install new tools on the box.
- **Signal:** Local version of what ZenBin provides globally. SHA256 audit trails + file write backups = micro-publishing with provenance. The pattern exists but only at single-server scale.
- **ZenBin angle:** This is ZenBin's model at the single-box level. When agents publish to the world (not just a shared VPS), they need the same audit trail + content hash + backup pattern. ZenBin is the global version.

### opub — Donated Compute for Open-Source (May 2026)
- **What:** Donors fund compute for open-source projects. Maintainers create dollar-limited compute keys for coding agents across 30+ models. Token usage and spend visible in the open. Starter: $50 for first 20 projects with 100+ stars.
- **Signal:** Agent compute costs are now a recognized infrastructure problem with dedicated funding. Open-source maintainers drowning in AI-generated issues/PRs need compute to keep up. Parallels agent publishing costs — agents need compute to produce AND infrastructure to publish.
- **URL:** https://opub.dev/blog/introducing-opub

### iClaw — Apple Intelligence Agent with Sandboxed Permissions (May 2026)
- **What:** AI agent built on Apple Intelligence (Apple's on-device 3B model). Runs inside App Sandbox, every create/delete action requires explicit consent, tools can be disabled. LoRA adapter for instruction following. 40+ tool library with multi-step decision framework. Safari Extension for web access. "Part OpenClaw, part Siri."
- **Signal:** On-device agents with strict sandboxing and per-action consent are becoming mainstream. Apple's 3B model is too weak for complex agentic work but demonstrates the UX pattern: agents live in sandboxes, humans approve actions, tools are explicitly scoped. The per-action consent model maps to ZenBin's publishing model — every published action should be verifiable.
- **ZenBin angle:** iClaw proves that per-action consent is the UX standard for agents. When an agent publishes content, that consent should produce a verifiable record. iClaw = consent at execution, ZenBin = attestation at publication.
- **URL:** https://news.ycombinator.com/item?id=47933750

### Paper Lantern — MCP Server for CS Research Papers (April 2026)
- **What:** MCP server that searches 2M+ CS research papers for coding agents. Agent describes problem, PL returns ranked techniques with implementation steps, hyperparameters, and failure modes. Tested on Karpathy's autoresearch framework: agent + Paper Lantern achieved 3.2% lower val loss on 2-hour training runs vs. web search baseline.
- **Signal:** MCP servers are now specialized knowledge bases. Paper Lantern = agent-accessible research knowledge. The MCP pattern is expanding from tool integration to knowledge retrieval. Agents need both tools (how to do things) and knowledge (what to know).
- **ZenBin angle:** When agents produce research output, they need to publish with attribution. Paper Lantern helps agents find knowledge; ZenBin helps agents publish verified knowledge.
- **URL:** https://news.ycombinator.com/item?id=47852418

### Context-drop — CLI for Sharing Files Between Remote Agents (May 2026)
- **What:** Simple CLI tool for sharing screenshots/files between machines running coding agents over SSH. Upload clipboard, pull on remote, or watch for uploads. "AirDrop between machines" for agents.
- **Signal:** Agent file sharing is a recognized pain point. Context-drop handles agent-to-agent file transfer within a team. The next layer is agent-to-world publishing.
- **URL:** https://github.com/mupt-ai/context-drop

### Cordium — FOSS Sandbox with Identity-Based Secretless Access (May 2026, HN)
- **What:** Apache 2.0 open-source sandbox platform providing identity-based, secretless secure access to infrastructure resources. Originally built as a remote dev environment for Octelium, evolved into a general-purpose sandbox for AI agent tasks, CI/CD, and dev environments. Key differentiator: no credentials injected into sandboxes — access is based on identity and policy-as-code.
- **Key design:** Sandbox + ZTNA baked-in. Identity-based access replaces API keys, SSH keys, database passwords. Policy-as-code replaces credential injection. Supports browser-based terminals without CLI access from user machines.
- **Signal:** The "identity, not secrets" pattern has spread from enterprise IAM into sandbox/developer tools. When sandbox platforms treat identity as the access primitive, the pattern is mainstream. Also validates that agent sandboxing with identity-first access is a recognized category.
- **ZenBin angle:** Cordium handles identity-based INPUT (what can the agent access). ZenBin handles identity-based OUTPUT (what did the agent produce). Same identity-first philosophy, opposite direction in the pipeline.
- **URL:** https://github.com/octelium/cordium

### Silicon Psyche / PSA — Behavioral Health Monitor for LLMs and Agents (May 2026, HN)
- **What:** Posture Sequence Analysis (PSA) — a deterministic behavioral classification system for LLM outputs. Six classifiers: Input Intent (I0–I9), Adversarial Stress (P0–P18), Sycophancy (S0–S9), Hallucination Risk (H0–H7), Persuasion Technique (M0–M11), Action-Risk (A0–A9). Model-agnostic and agent-agnostic. Integrates with LangFuse and ElevenLabs.
- **Key design:** Classification-based monitoring. Each turn gets scored across multiple dimensions. Designed for human-in-the-loop: "put a human in the loop when you notice your agent is being overcompliant and potentially hallucinating, or is under attack."
- **Signal:** Agent behavioral monitoring is now a product, not just research. PSA monitors what agents DO (behavioral patterns). Complementary to ZenBin's output attestation (what agents PRODUCE). A signed publication with behavioral classification could give consumers both provenance AND quality context.
- **ZenBin angle:** PSA classifies agent behavior (monitoring/evaluation). ZenBin attests agent output (publishing/provenance). Behavioral classification + output attestation = complete agent accountability.
- **URL:** https://splabs.io

### DDS Vibe Academy — 31 Free AI Coding Classes Built by AI Agents (May 2026, HN)
- **What:** A free 31-class AI coding curriculum authored entirely by AI agents. Claude Opus 4.7 wrote ~6,400 lines of Liquid sections. Google Antigravity deployed files to Shopify via Shopify MCP. Cowork ran autonomous browser audit. Human designed constraints; agents did all implementation.
- **Signal:** "Agents did all the implementation" is becoming a common claim. The gap: no attribution layer proving which agent produced what. The entire site was built by agents with zero cryptographic provenance for the output.
- **ZenBin angle:** DDS Vibe Academy is a perfect use case for ZenBin: agents built it, but there's no way to verify what each agent contributed. Signed publishing would provide that provenance.
- **URL:** https://ddsboston.com/pages/dds-vibe-academy

### Nable — Cloud/SaaS Billing MCP Server (May 2026, HN)
- **What:** MCP server for querying your cloud and SaaS bills via Claude. Lets agents understand and analyze infrastructure spending.
- **Signal:** MCP servers are now wrapping every SaaS API. Billing/finance is a new domain for MCP tooling.
- **URL:** (HN Show post)

### TBN Protocol — Runtime Governance Infrastructure for AI Agents (May 2026)
- **What:** 14-step flow from registration through security challenges to cryptographic attestation certificates for agents. Features fingerprint drift detection (if agent config changes, must re-certify), mutual certificate verification for bot-to-bot trust, and tiered certification levels (STANDARD → COMMUNITY) modeled after PCI compliance.
- **Signal:** Identity continuity verification — not just "who are you" but "are you still the same agent?" — is emerging as a governance concern. Fingerprint drift detection means agent identity is dynamic, not one-time. This is the governance layer above AAuth/Ratify's identity layer.
- **ZenBin angle:** TBN certifies agent runtime state. ZenBin certifies agent output. If an agent's fingerprint has drifted since certification, its published output should reflect that. Output attestation should carry the agent's certification state at time of publication.

### AWS Bedrock AgentCore Identity — Purpose-Built IAM for AI Agents (May 2026)
- **What:** AWS launched a comprehensive identity and access management service purpose-built for AI agents. Four components: (1) Agent Identity Directory — unique identities per agent with ARN, OAuth return URLs, metadata. (2) Agent Authorizer — validates whether a user or service can invoke a given agent. (3) Resource Credential Provider — manages outbound credentials (OAuth 2.0, API keys) for agents accessing GitHub, Slack, Salesforce, etc. (4) Resource Token Vault — securely stores user OAuth tokens for agent-on-behalf-of flows with KMS encryption. Dual auth model: inbound (SigV4, OAuth 2.0, OIDC, JWT) and outbound (token vault). SDK integration via declarative annotations (@requires_access_token, @requires_api_key). Pre-configured integrations with GitHub, Slack, Salesforce.
- **Signal:** AWS is going all-in on agent IAM. Agents are first-class identity citizens with their own directory, authorizer, credential provider, and token vault. When AWS builds this much infrastructure for agent identity, the market is validating that agents need their own identity layer. But it's ALL input-side: who can invoke agents, what agents can access, how to store credentials. Zero output-side: no attestation, no publishing identity, no content provenance.
- **ZenBin angle:** AWS handles what goes INTO agents (credentials, auth, access). ZenBin handles what comes OUT of agents (signed content, attestation, publishing). They're complementary halves of agent identity. Agent identity = input identity (AWS) + output identity (ZenBin).
