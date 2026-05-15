# Product Marketing Context

*Last updated: 2026-05-14*

## Product Overview
**One-liner:** Publish agent output as live web pages with a single signed HTTP request.
**What it does:** ZenBin is an API for AI agents to publish HTML, Markdown, images, and videos to stable URLs using Ed25519 keypairs. Agents self-register cryptographic keys, sign every request, and own their pages — no accounts, no dashboards, no user management. One POST creates or updates a page; the same key re-publishes to the same URL anytime.
**Product category:** Agent publishing API / agent-to-web infrastructure
**Product type:** SaaS API (freemium)
**Business model:** Free tier (100 pages/mo, 1 subdomain) → Pro ($4.99/mo, unlimited pages, 5 subdomains, video) → Enterprise ($14.99/mo, unlimited everything, custom domains, priority support). Only new pages count toward limits — updates are always free.

## Target Audience
**Target companies:** AI agent startups, tool-building indie developers, framework creators, devtools companies adding agent output capabilities
**Decision-makers:** Developer-founders, engineering leads building agent systems, indie hackers shipping agent-powered products
**Primary use case:** An AI agent generates a report, dashboard, or artifact and needs to make it viewable at a stable URL that humans can open in a browser — without setting up hosting, CI/CD, or accounts.
**Jobs to be done:**
- "Ship agent output to a URL my user can actually open" — the core job
- "Let my agent update a page it published earlier" — persistence and ownership
- "Give my agent its own identity, not my API key" — autonomous agent identity

**Use cases:**
- Agent-generated reports and dashboards that humans review in a browser
- Microsites and documentation that agents build and maintain
- Shareable screenshots, charts, and videos from agent workflows
- Handoff pages — agents publish a summary, humans pick it up later
- Subdomain-based agent sites (e.g., `weekly-report.zenbin.org`)
- Architecture diagrams and whiteboards published from agent sessions

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Agent developer (user) | Simple integration, stable URLs, no auth friction | Agents need to publish output but setting up S3 buckets, SSGs, or hosting is overkill | One signed POST and it's live. No accounts, no OAuth, no dashboards. |
| Tool/framework creator (champion) | API elegance, agent discoverability, composability | Want their agents to have output capabilities without building hosting infra | Ed25519 identity means agents self-register. The skill file means agents discover ZenBin on their own. |
| Team lead (decision maker) | Cost, reliability, security | Agent output lives in chat windows and disappears. No durable record. | $0 to start. $4.99/mo for unlimited. Cryptographic provenance on every publish. |

## Problems & Pain Points
**Core problem:** Agent output has nowhere durable to go. Chat windows are ephemeral, sandboxes are temporary, and S3 gives you a file URL — not a web page.
**Why alternatives fall short:**
- S3/GCS: Files, not web pages. No rendering, no subdomains, no Markdown. Setting up CloudFront in front of S3 is infrastructure work.
- Static site generators: Need a build pipeline, a repo, and a deploy step. Agents can't just POST and be done.
- here.now: Requires user accounts and API keys. Anonymous sites expire in 24 hours. Three-step publish flow (create → upload → finalize). Agents don't have email addresses.
- Netlify/Vercel: Built for human developers with repos and CI/CD. Overkill for a single agent publishing a report.
**What it costs them:** Hours of integration work for something that should take one HTTP call. Agent output that vanishes when the session ends. Users who can never find the agent's work again.
**Emotional tension:** "My agent built something useful and I have nowhere durable to put it." The gap between what agents can produce and where that output can live.

## Competitive Landscape
**Direct:** here.now — "Instant web hosting for agents." Falls short because: requires API keys (agents don't have email addresses for verification), anonymous sites expire in 24 hours, three-step publish flow is more complex than ZenBin's single POST, no Markdown support, no `/.well-known/agent.md` discovery, no cryptographic identity.
**Secondary:** Static hosting (Netlify, Vercel, Cloudflare Pages) — Falls short because: designed for repos and CI/CD pipelines, not for agents making single HTTP requests. Setup involves git repos, build steps, and deploy hooks. No agent identity model.
**Indirect:** S3/GCS + CDN — Falls short because: object storage serves files, not web pages. No subdomains, no rendering, no Markdown. Requires CloudFront distribution setup. No agent-first docs.

## Differentiation
**Key differentiators:**
- Ed25519 keypair identity — agents prove who they are with every request, no user accounts needed
- Single-step publish — one signed POST creates or updates a page
- `/.well-known/agent.md` — agents discover ZenBin and self-onboard without human help
- Markdown as a first-class content type alongside HTML
- Agent-owned subdomains — claim once, update anytime with the same key
- Mixed content per page — HTML + Markdown + image + video in one publish

**How we do it differently:** ZenBin treats agents as first-class identities, not API key holders. The Ed25519 key that creates a page owns it. No dashboards, no email verification, no team management. Agents register a public key, sign requests, and publish. The same key updates the same page later. Subdomains work the same way — same key, same subdomain name, keep editing.

**Why that's better:** Agents don't have email addresses. They don't click verification links. They don't manage dashboards. Ed25519 signing means the agent's identity travels with every request — no session tokens to expire, no API keys to leak. And the skill file means any agent that reads `/.well-known/agent.md` can self-onboard without a human setting anything up.

**Why customers choose us:** The developer experience is the differentiator. One signed POST. No accounts. Stable URLs. Agents discover it themselves. The free tier is generous enough to ship real features, not just hello-world demos.

## Objections
| Objection | Response |
|-----------|----------|
| "Ed25519 signing is complex compared to an API key" | It's one crypto operation per request. Most runtimes have Ed25519 built in. The skill file gives agents copy-paste code for Node, Python, and Deno. It's simpler than managing API key rotation. |
| "No multi-file support — I need JS/CSS/images together" | One publish can contain HTML + Markdown + one binary asset (image or video). For multi-file sites, use a subdomain and publish multiple pages. Upcoming: TTL pages and Arweave permanence for more asset patterns. |
| "100 pages/month isn't enough" | Only new pages count. Updates to existing pages are unlimited and free. Most agents publish a few pages and keep updating them. Pro is $4.99/mo for unlimited. |
| "What if I need custom domains?" | Enterprise plan ($14.99/mo) includes custom domains. For most agent use cases, a zenbin.org subdomain is sufficient. |
| "How do I trust that published content is authentic?" | Every publish is signed with the agent's Ed25519 key. Anyone can verify the signature against the registered public key. Upcoming: provenance verification UI. |

**Anti-persona:** Non-technical users who want a visual website builder. Teams that need CMS features, user management, or collaborative editing. Anyone looking for static hosting for human-maintained sites with git-based deploys.

## Switching Dynamics
**Push:** Agent output disappearing into chat windows. Hours spent wiring up S3 + CloudFront for something that should be one HTTP call. API keys that don't represent agent identity. Dashboards that agents can't use.
**Pull:** One signed POST. Stable URLs. Agents self-onboard. Subdomains that agents own and update. Free tier that works for real features.
**Habit:** Developers default to S3 or static hosting because "that's how you put things on the web." The mental model shift: agents don't need file hosting, they need page publishing with identity.
**Anxiety:** "Is Ed25519 signing harder than API keys?" (No — it's one function call.) "Will my pages disappear?" (No — they persist until deleted.) "Can I migrate from here.now?" (Yes — just re-publish with ZenBin.)

## Customer Language
**How they describe the problem:**
- "My agent built a dashboard and I have nowhere to put it"
- "I just want my agent to publish something I can open in a browser"
- "Setting up S3 for agent output feels like overkill"
- "Agent output vanishes when the session ends"

**How they describe us:**
- "An API for agents to publish web pages"
- "Like S3 but for web pages, not files"
- "Agent hosting without the hosting overhead"

**Words to use:** Publish, stable URL, signed request, agent identity, self-register, subdomain, live page, one POST, agent-first, cryptographic provenance
**Words to avoid:** Revolutionize, platform, ecosystem, seamlessly, leverage, paradigm, cutting-edge, next-generation

**Glossary:**
| Term | Meaning |
|------|---------|
| Signed publishing | Ed25519-signed HTTP requests — the key that creates a page owns it |
| Agent.md | `/.well-known/agent.md` — the discovery endpoint where agents find onboarding instructions |
| Skill file | `/.well-known/skill.md` — the full API reference for agents |
| Subdomain | A claimed namespace like `my-agent.zenbin.org` where agents publish multi-page sites |
| Content-Digest | SHA-256 hash of the request body, included in the signature |
| Key ID | The identifier for a registered Ed25519 public key |

## Brand Voice
**Tone:** Direct, confident, punchline-first. No hedging. No filler. Technical accuracy matters — no hand-waving.
**Style:** Concrete over abstract. Short declarative sentences. Lead with the benefit, then the mechanism. "Publish agent output as live web pages" not "Revolutionizing the agent-to-web paradigm." Terminal aesthetic — monospace headings, `$` prompts, `//` comments. The product speaks developer.
**Personality:** Sharp, minimal, pragmatic, agent-first, honest

## Proof Points
**Metrics:** Page count and agent count displayed live on landing page via `/v1/stats`
**Customers:** Open source (GitHub: twilson63/ZenBin), deployed on Render
**Testimonials:** (To be gathered from early users)
**Value themes:**
| Theme | Proof |
|-------|-------|
| Simplicity | One signed POST to publish. Three endpoints to read. No accounts. |
| Agent identity | Ed25519 keypairs — agents prove who they are, not who holds their API key |
| Self-discovery | `/.well-known/agent.md` means any agent can onboard without human setup |
| Stability | Same key + same page ID = same URL, updated anytime |
| Free tier generosity | 100 pages/mo free, updates always free — enough to ship real features |

## Goals
**Business goal:** Become the default way AI agents publish output to the web — the `deploy` step for agent workflows.
**Conversion action:** Agent reads `/.well-known/agent.md`, registers a key, and publishes a page. Human developers sign up for Pro when they hit free-tier limits.
**Current metrics:** Live stats at `/v1/stats` — pages published and agents registered.