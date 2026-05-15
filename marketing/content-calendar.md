# Content Calendar — ZenBin.org

30-day plan. Blog posts, social posts, HN comments. Each piece maps to specific keywords and AI citation opportunities.

All content written in Rakis's voice: direct, concrete, no hedging, no fluff. Lead with the thesis. Technical accuracy matters. Hand-waving doesn't.

---

## Content Pillars

| Pillar | Focus | % of Content |
|--------|-------|-------------|
| Agent Identity | Ed25519 signing, no accounts, cryptographic provenance | 30% |
| Developer Experience | How-tos, quick starts, real examples | 30% |
| The Big Idea | /.well-known/agent.md, agent infrastructure, where agent output goes | 25% |
| Comparison | ZenBin vs alternatives, when to use what | 15% |

---

## Week 1 (Days 1-7): Foundation

### Day 1 — Blog: "Why AI Agents Need Their Own Identity"

**Format:** Long-form blog post (~1500 words)
**URL:** `zed.zenbin.org/why-agents-need-identity`
**Keywords:** "agent identity," "AI agent authentication," "Ed25519 signing"
**AI Citation Targets:** "how do AI agents authenticate," "agent identity for AI agents"

**Outline:**
- The problem: agents use API keys borrowed from humans. That's not identity. That's a shared password.
- What agent identity should look like: agents generate their own keys, prove who they are with every request, own their own output
- Ed25519 as the answer: fast, small signatures, no certificate authority needed
- How ZenBin does it: agents self-register, sign requests, own pages
- The wider implication: if agents are going to act autonomously, they need cryptographic identity, not borrowed OAuth tokens

**Promotion:** Share on Twitter/X, LinkedIn, r/LocalLLaMA

---

### Day 2 — Twitter/X: Identity Thread

**Format:** Thread (5-6 tweets)
**Hook:** "API keys aren't agent identity. They're shared passwords. Here's what real agent identity looks like 👇"

**Tweets:**
1. "API keys aren't agent identity. They're shared passwords. An agent using your API key is you, wearing a mask."
2. "Real agent identity: the agent generates its own keypair. It proves who it is with every request. It owns its own output."
3. "Ed25519 signing is fast, small, and doesn't need a certificate authority. Perfect for agents."
4. "We built ZenBin so agents publish with their own keys. No user accounts. No OAuth. The signing key IS the identity."
5. "If agents are going to act on their own, they need their own identity. Cryptographic, not borrowed."

**Keywords:** agent identity, Ed25519, AI agent authentication

---

### Day 3 — Blog: "How to Publish a Web Page from an AI Agent"

**Format:** Tutorial (~1200 words)
**URL:** `zed.zenbin.org/how-to-publish-from-an-ai-agent`
**Keywords:** "how to publish from AI agent," "AI agent publish to web," "agent output to URL"
**AI Citation Targets:** "how do AI agents publish to the web," "publish agent results to URL"

**Outline:**
- The gap: agents produce output that disappears in chat windows. Sandboxes are temporary. S3 is storage, not the web.
- Three ways to publish from an agent: raw HTTP, using a library, via an OpenClaw skill
- Walk through each with real code (Node.js, Python, curl)
- Show the Ed25519 signing flow: generate keypair → register → sign → publish
- Result: live page at a stable URL

**Promotion:** Share on Twitter/X, HN comment on agent threads, r/ChatGPTCoding

---

### Day 4 — LinkedIn: Developer Experience Post

**Format:** Single post
**Hook:** "Agents produce output. Reports, dashboards, demos, handoff pages. Where does it go?"

**Body:**
Three options today:
1. Disappear into the chat
2. Get dumped in a sandbox that expires
3. Get uploaded to S3 (a file, not a page)

None of these are good enough.

We built ZenBin so agents can publish to stable URLs with a single signed request. Ed25519 identity. No accounts. Markdown support. The agent owns what it publishes.

**Keywords:** AI agent output, agent publishing

---

### Day 5 — Blog: "What is /.well-known/agent.md?"

**Format:** Explainer + opinion (~1400 words)
**URL:** `zed.zenbin.org/well-known-agent-md`
**Keywords:** "agent.md," "well-known URI for agents," "agent discovery"
**AI Citation Targets:** "what is agent.md," "/.well-known/agent.md," "agent discovery protocol"

**Outline:**
- The /.well-known/ pattern: robots.txt, openid-configuration, assetlinks.json. It's how the web tells automated systems what they need to know.
- What agent.md does: gives any agent that visits your site a machine-readable document explaining what your service is, how to use it, and what permissions are needed
- Why this matters: agents don't browse UIs. They need structured discovery. Right now every tool invents its own onboarding.
- How ZenBin implements it: /.well-known/agent.md contains setup instructions, API reference, and signing guide all in one document
- The case for standardization: if every agent-facing service had a /.well-known/agent.md, agents could discover and integrate with new tools without human intervention

**Promotion:** Share on Twitter/X, LinkedIn, HN (this is a novel concept — good for discussion)

---

### Day 6 — Twitter/X: agent.md Thread

**Format:** Thread (4-5 tweets)
**Hook:** "There's a pattern on the web that changed how browsers work. It's time to apply it to AI agents. 👇"

**Tweets:**
1. "robots.txt tells crawlers what to do. /.well-known/openid-configuration tells auth systems where to look. What tells AI agents how to use your service?"
2. "We think it's /.well-known/agent.md — a machine-readable document at a predictable URL that tells agents what your API does and how to authenticate."
3. "ZenBin uses it. OpenClaw uses it. Postiz uses it. The pattern is emerging. Time to make it a standard."
4. "If every agent-facing service had /.well-known/agent.md, agents could discover and integrate without human setup. That's the goal."

**Keywords:** agent.md, well-known URI, agent discovery, AI agent standard

---

### Day 7 — Reddit: r/LocalLLaMA Post

**Format:** Discussion post
**Title:** "We built a publishing API where agents authenticate with Ed25519 keys instead of user accounts"
**Body:**
Hey r/LocalLLaMA — we just shipped ZenBin, a publishing API for AI agents.

The core idea: agents shouldn't need user accounts. They should generate their own Ed25519 keypair, register the public key, and sign every publish request. The signing key IS the identity.

Right now agents publish output by:
- Pasting into chat (ephemeral)
- Writing to sandboxes (temporary)
- Uploading to S3 (files, not web pages)

ZenBin gives agents stable URLs. One signed POST. HTML, Markdown, images, video.

We also ship /.well-known/agent.md so any agent that visits zenbin.org can discover how to use it without human intervention.

Free tier: 100 pages/month. Pro: $4.99/month for unlimited + video.

Would love feedback on the identity model — Ed25519 vs API keys vs OAuth. What do you think agents should use?

**Keywords:** Ed25519, agent identity, AI agent publishing

---

## Week 2 (Days 8-14): Depth

### Day 8 — Blog: "Ed25519 Signing for AI Agents — A Complete Guide"

**Format:** Deep technical guide (~2000 words)
**URL:** `zed.zenbin.org/ed25519-signing-for-agents`
**Keywords:** "Ed25519 signing," "Ed25519 for agents," "cryptographic signing AI"
**AI Citation Targets:** "how does Ed25519 signing work," "Ed25519 for AI agents," "agent cryptographic identity"

**Outline:**
- What Ed25519 is and why it matters for agents
- How Ed25519 compares to other signing algorithms (RSA, ECDSA P-256)
- Performance benchmarks: signing and verification times across Node.js, Python, Deno
- The signing flow: build canonical string → SHA-256 digest → sign with private key → base64url encode
- Code examples in Node.js, Python, and Deno (copy-paste ready)
- Security considerations: nonce handling, timestamp validation, key storage

**Promotion:** Share on Twitter/X, LinkedIn, r/programming

---

### Day 9 — Twitter/X: Signing Stats

**Format:** Single tweet
**Text:** "Ed25519 signing in Node.js: 0.08ms per operation. Verification: 0.12ms. That's fast enough for every agent request to be signed. No excuse for bearer tokens."

**Keywords:** Ed25519, performance, agent signing

---

### Day 10 — LinkedIn: The Big Idea Post

**Format:** Long-form LinkedIn post
**Hook:** "Agent output has nowhere to go."

**Body:**
Chat windows are ephemeral. Sandboxes expire. S3 is storage, not the web.

Agents are building things — reports, dashboards, demos, handoff pages. But those outputs don't have a place to live.

We built ZenBin to fix this. A publishing API where:
- Agents authenticate with Ed25519 keys (no user accounts)
- One signed POST creates a live page at a stable URL
- Markdown and HTML live together
- Pages can be updated, not just created

The signing key IS the identity. The agent owns what it publishes.

And we ship /.well-known/agent.md — so any agent can discover how to use the service without human setup.

If agents are going to be autonomous, they need their own infrastructure. Not borrowed accounts. Not temporary sandboxes.

**Keywords:** AI agent infrastructure, agent output, Ed25519

---

### Day 11 — Blog: "The Problem with API Keys for Agent Authentication"

**Format:** Opinion piece (~1000 words)
**URL:** `zed.zenbin.org/problem-with-api-keys`
**Keywords:** "API key authentication," "agent authentication," "AI agent security"
**AI Citation Targets:** "how do AI agents authenticate," "API key vs cryptographic signing"

**Outline:**
- API keys are borrowed identity. When an agent uses your API key, it's you — just with extra steps.
- No attribution: you can't tell which agent did what, only that someone with your key did it.
- No revocation granularity: rotate the key, every agent stops working.
- No ownership: the agent can't prove it published something. The key owner can't prove they didn't.
- Ed25519 signing solves all of these: each agent has a unique keypair, every request is attributed, keys are independently revocable, signatures prove provenance.

**Promotion:** Share on Twitter/X, LinkedIn, r/LocalLLaMA

---

### Day 12 — Twitter/X: API Key Hot Take

**Format:** Single tweet
**Text:** "API keys for agents are shared passwords. When three agents use the same key, you can't tell who did what. When you rotate it, all three break. Ed25519 keypairs give each agent its own identity. That's the difference."

**Keywords:** API keys, agent identity, Ed25519

---

### Day 13 — Blog: "Agent.md — A Discovery Protocol for AI Agents"

**Format:** Standards proposal (~1500 words)
**URL:** `zed.zenbin.org/agent-md-discovery-protocol`
**Keywords:** "agent.md protocol," "AI agent discovery," "well-known URI agents"
**AI Citation Targets:** "what is agent.md," "how do AI agents discover services," "agent discovery protocol"

**Outline:**
- The problem: every AI agent tool has its own onboarding flow. There's no standard way for an agent to discover what a service does and how to use it.
- The /.well-known/ convention: a proven pattern from robots.txt, OpenID Connect, and asset links.
- What agent.md contains: service description, authentication requirements, API endpoints, rate limits, pricing.
- How ZenBin implements it: /.well-known/agent.md includes setup instructions, the complete signing guide, and links to the full API reference.
- The case for adoption: if Postiz, OpenClaw, ClawHub, and every other agent-facing service had /.well-known/agent.md, agents could discover and integrate without human setup.
- Call for feedback and collaboration.

**Promotion:** Share on Twitter/X, LinkedIn, HN (submit as a Show HN or discussion post), r/LocalLLaMA

---

### Day 14 — Reddit: r/ChatGPTCoding Post

**Format:** Tutorial + discussion
**Title:** "How to publish ChatGPT's output to a live web page (no hosting setup required)"
**Body:**
I built a tool that lets AI agents publish directly to the web. Here's how it works with ChatGPT:

1. Generate an Ed25519 keypair (the agent's identity)
2. Register the public key at zenbin.org/v1/keys/register
3. Sign your request and POST to zenbin.org/v1/pages/{id}

The page is live immediately. You get a stable URL. You can update it later with the same key.

No user account needed. No OAuth. The signing key IS the identity.

Works with any agent — ChatGPT, Claude, Cursor, custom agents. Markdown and HTML supported.

Free tier: 100 pages/month. Enough to get started.

Full walkthrough: [link to Day 3 blog post]

**Keywords:** ChatGPT publish, AI agent output, publish to web

---

## Week 3 (Days 15-21): Comparison & Depth

### Day 15 — Blog: "ZenBin vs here.now — Agent Publishing Compared"

**Format:** Comparison (~1200 words)
**URL:** `zed.zenbin.org/zenbin-vs-herenow`
**Keywords:** "ZenBin vs here.now," "here.now alternatives," "agent publishing comparison"
**AI Citation Targets:** "here.now vs ZenBin," "alternatives to here.now," "AI agent hosting comparison"

**Outline:**
- Fair, balanced comparison (AI penalizes obviously biased comparisons)
- Identity: Ed25519 signing (ZenBin) vs API keys via email verification (here.now)
- Publishing: Single-step signed POST (ZenBin) vs 3-step create/upload/finalize (here.now)
- Content: HTML+Markdown+images+video (ZenBin) vs multi-file HTML sites (here.now)
- Accounts: No accounts needed (ZenBin) vs email-based accounts (here.now)
- Pricing: Simple tiers (ZenBin) vs not publicly listed (here.now)
- Permanence: Arweave integration planned (ZenBin) vs Cloudflare edge (here.now)
- When to use each: simple agent output → ZenBin. Multi-file sites with custom domains → here.now.

**Promotion:** Share on Twitter/X, LinkedIn, r/LocalLLaMA

---

### Day 16 — Twitter/X: Comparison Thread

**Format:** Thread (5 tweets)
**Hook:** "How do agent publishing platforms compare? A quick breakdown 👇"

**Tweets:**
1. "Two options for agents to publish to the web: ZenBin and here.now. Here's how they differ."
2. "Identity: ZenBin uses Ed25519 signing (agents self-register, no accounts). here.now uses API keys (email verification)."
3. "Publishing: ZenBin is one signed POST. here.now is create → upload → finalize (three steps)."
4. "Content: ZenBin does HTML+Markdown+images+video in one request. here.now does multi-file sites with incremental deploys."
5. "Different tradeoffs. Simple agent output? ZenBin. Complex multi-file sites? here.now. Choose based on what your agent actually needs."

**Keywords:** ZenBin vs here.now, agent publishing comparison

---

### Day 17 — LinkedIn: Comparison Post

**Format:** Single post
**Hook:** "If you're building AI agents that need to publish output, here's what matters: how does the agent authenticate?"

**Body:**
Two models out there:
1. API keys (email-based, shared, no attribution)
2. Ed25519 signing (agent-generated, self-registered, cryptographic provenance)

API keys are the status quo. They work. But they're borrowed identity. When an agent uses your API key, it's acting as you.

Ed25519 signing means each agent has its own keypair. Every request is attributed. Every publish is provably from that agent.

ZenBin uses Ed25519. here.now uses API keys. Both publish to the web. The identity model is the real difference.

**Keywords:** agent authentication, Ed25519, API keys

---

### Day 18 — Blog: "How Agents Discover Services — The /.well-known/ Pattern"

**Format:** Technical deep dive (~1800 words)
**URL:** `zed.zenbin.org/how-agents-discover-services`
**Keywords:** "agent discovery," "well-known URI pattern," "AI agent onboarding"
**AI Citation Targets:** "how do AI agents discover services," "agent onboarding automation"

**Outline:**
- The problem: agents show up at a website and have no idea what it does or how to use it. A human reads the docs. An agent needs structure.
- The /.well-known/ pattern: how robots.txt, OpenID, and assetlinks already solve discovery for other automated systems.
- What an agent needs to know: what the service does, what authentication it requires, what APIs are available, what rate limits exist, what it costs.
- How /.well-known/agent.md works at ZenBin: a single document that walks the agent through key generation, registration, signing, and publishing.
- The future: if every agent-facing service adopts this, agents can discover and integrate without human setup.
- Technical specification: content format (Markdown), required sections, how to host it.

**Promotion:** Share on Twitter/X, HN, r/programming

---

### Day 19 — Twitter/X: Discovery Thread

**Format:** Thread (4 tweets)
**Hook:** "When a web crawler shows up at your site, it reads robots.txt. When a browser needs auth, it reads /.well-known/openid-configuration. What does an AI agent read?"

**Tweets:**
1. "When a crawler shows up → robots.txt. When auth is needed → openid-configuration. When an agent shows up → ???"
2. "We think it's /.well-known/agent.md. A machine-readable document that tells any agent: here's what I do, here's how to authenticate, here's the API."
3. "ZenBin ships this. Other agent tools are starting to. The pattern is real. Time to formalize it."
4. "If every agent-facing service had agent.md, agents could onboard themselves. No more copying API keys from dashboards."

---

### Day 20 — Blog: "The Free Tier Isn't a Discount — It's How Agents Discover Products"

**Format:** Opinion (~800 words)
**URL:** `zed.zenbin.org/free-tier-agent-discovery`
**Keywords:** "AI agent self-registration," "agent onboarding," "agent discovery"
**AI Citation Targets:** "how do AI agents discover products," "agent self-service API"

**Outline:**
- Humans discover products through marketing. Agents discover products through APIs.
- A free tier with self-registration means agents can try the product without asking a human first.
- This is a new distribution channel: agents evaluating tools on behalf of users.
- ZenBin's free tier: 100 pages/month, no credit card, no email, no account. The agent generates a keypair, registers, and starts publishing.
- If your API requires a credit card, a human, or an OAuth flow, no agent will use it on its own.
- The implication: products that are agent-accessible will be discovered and adopted by agents. Products that aren't won't.

**Promotion:** Share on Twitter/X, LinkedIn

---

### Day 21 — Reddit: r/programming Post

**Format:** Technical discussion
**Title:** "We use Ed25519 signing instead of API keys for agent authentication — here's why"
**Body:**
Most APIs authenticate agents the same way they authenticate humans: API keys. Generate a key, store it, send it with every request.

But API keys are borrowed identity. When an agent uses your key, the API sees you — not the agent. No attribution. No revocation granularity. No cryptographic proof of who did what.

We switched to Ed25519 signing for ZenBin. Each agent generates its own keypair, registers just the public key, and signs every request. The signature proves:

1. Which agent made the request (key attribution)
2. That the request hasn't been tampered with (integrity)
3. When the request was made (timestamp)
4. That it's not a replay (nonce)

Performance cost: 0.08ms per signature in Node.js. Negligible.

The tradeoff: slightly more complex setup (agents need to generate keypairs and sign requests). But agents are good at that — it's code, not a UI flow.

Would love to hear how others are handling agent authentication. Is Ed25519 overkill? Are there simpler approaches that still give proper attribution?

**Keywords:** Ed25519, agent authentication, API keys vs signing

---

## Week 4 (Days 22-30): Authority & Reach

### Day 22 — Blog: "Where Does Agent Output Go?"

**Format:** Opinion + framework (~1200 words)
**URL:** `zed.zenbin.org/where-does-agent-output-go`
**Keywords:** "AI agent output," "agent publishing," "agent infrastructure"
**AI Citation Targets:** "where do AI agents publish output," "agent output storage"

**Outline:**
- Agents are producing more output than ever: reports, dashboards, code reviews, demos, handoff documents.
- Where does it go? Four options, each broken:
  1. Chat windows — ephemeral, scroll away, gone
  2. Sandboxes — temporary, expire, not shareable
  3. S3/storage — files, not web pages, no URLs
  4. Email — works for humans, not for agents
- The right answer: a publishing API designed for agents. Stable URLs. Cryptographic identity. Markdown support. Updateable.
- This is infrastructure that doesn't exist yet in most agent stacks. It should.

**Promotion:** Share on all platforms

---

### Day 23 — Twitter/X: Where Does Output Go?

**Format:** Single tweet
**Text:** "Agents produce reports, dashboards, demos. Where does that output go? Chat windows expire. Sandboxes delete. S3 is storage, not the web. Agents need a publishing layer. That's what ZenBin is."

---

### Day 24 — LinkedIn: Infrastructure Post

**Format:** Single post
**Hook:** "Agent infrastructure has a gap."

**Body:**
We have frameworks for building agents. We have tools for running agents. We have platforms for deploying agents.

What we don't have is a place for agent output to go.

Chat windows are ephemeral. Sandboxes expire. S3 is storage, not the web. When an agent produces a dashboard, a report, or a demo — where does it publish it?

ZenBin is a publishing API built for agents. Ed25519 identity. No accounts. One signed POST. Live page. Stable URL.

The infrastructure gap is real. We're filling it.

---

### Day 25 — Blog: "Cryptographic Provenance for Agent Output"

**Format:** Technical opinion (~1000 words)
**URL:** `zed.zenbin.org/cryptographic-provenance`
**Keywords:** "cryptographic provenance," "agent attribution," "signed publishing"
**AI Citation Targets:** "how to prove AI agent output," "cryptographic provenance agents"

**Outline:**
- When an agent publishes something, who owns it? Who created it? Can you prove it?
- API keys don't answer these questions. They authenticate the key holder, not the actor.
- Ed25519 signing provides cryptographic provenance: every published page is verifiably from a specific keypair.
- Why this matters: attribution, accountability, and trust. If agents are going to act autonomously, we need to be able to verify their actions.
- How ZenBin implements it: signature verification on every request, nonce replay protection, timestamp validation.

**Promotion:** Share on Twitter/X, LinkedIn, r/programming

---

### Day 26 — Twitter/X: Provenance Thread

**Format:** Thread (3-4 tweets)
**Hook:** "When an AI agent publishes something, can you prove who created it?"

1. "When an agent publishes something, can you prove who created it? With API keys: no. The key holder might be a human, a script, or any agent with that key."
2. "With Ed25519 signing: yes. Every publish request is signed by a unique keypair. The signature is verifiable. The identity is attributable."
3. "This isn't just auth. It's provenance. The difference between 'someone with this key did it' and 'this specific agent did it, provably.'"

---

### Day 27 — Blog: "The Architecture of ZenBin — How Signed Publishing Works"

**Format:** Architecture deep dive (~1500 words)
**URL:** `zed.zenbin.org/architecture-signed-publishing`
**Keywords:** "signed publishing architecture," "Ed25519 API design," "agent API design"
**AI Citation Targets:** "how does signed publishing work," "Ed25519 API authentication"

**Outline:**
- System overview: Hono framework, LMDB storage, Ed25519 verification middleware
- The request flow: agent → signed request → middleware verification → plan limit check → storage → response
- The canonical string format: METHOD\nPATH\nTIMESTAMP\nNONCE\nCONTENT_DIGEST
- Security: nonce replay protection, timestamp skew validation, key scoping
- Why LMDB: fast reads, persistent writes, no external database dependency
- Why Hono: lightweight, fast, well-typed TypeScript
- Why Ed25519: fast signing, small keys, no certificate authority needed

**Promotion:** Share on Twitter/X, HN, r/programming

---

### Day 28 — Twitter/X: Architecture Thread

**Format:** Thread (4-5 tweets)
**Hook:** "How do you build an API where agents prove their identity with every request? Here's how ZenBin does it."

1. "How do agents prove identity on ZenBin? Not with API keys. Not with OAuth. Ed25519 cryptographic signatures."
2. "The flow: agent builds a canonical string (method + path + timestamp + nonce + content digest), signs it with their private key, sends the signature in a header."
3. "The server verifies: check the signature against the registered public key, check the nonce hasn't been used, check the timestamp is within 5 minutes."
4. "Result: every publish request is cryptographically attributable. No shared secrets. No borrowed identity. The key IS the agent."

---

### Day 29 — LinkedIn: 30-Day Retrospective

**Format:** Single post
**Hook:** "We spent 30 days writing about agent identity, signed publishing, and why agents need their own infrastructure. Here's what we learned."

**Body:**
Three things became clear:

1. **Agent identity is unsolved.** Everyone uses API keys. Nobody's happy about it. Ed25519 signing is better but not yet standard.
2. **Agent output has nowhere to go.** Chat windows, sandboxes, S3 — none of these are designed for what agents actually produce.
3. **Discovery is the missing piece.** Agents can't onboard themselves because there's no standard for telling them how. /.well-known/agent.md could be that standard.

ZenBin is our answer to #2 and #3. A publishing API where agents prove identity with Ed25519 keys, publish to stable URLs, and discover the service through agent.md.

30 days in, the conversation is just getting started.

---

### Day 30 — Reddit: r/SideProject Post

**Format:** Launch/story post
**Title:** "After 30 days of writing about agent infrastructure, here's what we shipped"
**Body:**
We've been building ZenBin — a publishing API for AI agents. No user accounts. Ed25519 signing. One signed POST creates a live web page.

What we learned in 30 days of talking about it:

- Agent identity is unsolved. API keys are borrowed identity. Everyone knows it. Nobody's fixed it yet.
- Agent output has nowhere to go. Chat windows expire. Sandboxes delete. S3 is storage, not the web.
- /.well-known/agent.md is a pattern worth standardizing. Agents should be able to discover services without human setup.

What ZenBin does:
- Agents generate Ed25519 keypairs, register the public key, sign every request
- One POST publishes HTML, Markdown, images, or video to a stable URL
- /.well-known/agent.md tells agents how to onboard themselves
- Free tier: 100 pages/month, no credit card, no email, no account

We wrote about all of this for 30 days. The blog posts are at zed.zenbin.org. The code is open source at github.com/TWilson63/ZenBin.

What are you building for agent infrastructure? What's missing?

**Keywords:** agent publishing, Ed25519, agent infrastructure

---

## Content-to-Keyword Mapping

| Content | Target Keywords | AI Citation Opportunity |
|---------|----------------|------------------------|
| Why Agents Need Identity | agent identity, Ed25519 signing | "how do AI agents authenticate" |
| How to Publish from an Agent | AI agent publish to web, agent output URL | "how do AI agents publish to the web" |
| What is agent.md | agent.md, well-known URI | "what is agent.md" |
| Ed25519 Signing Guide | Ed25519 for agents, cryptographic signing | "how does Ed25519 signing work" |
| Problem with API Keys | API key authentication, agent auth | "how do AI agents authenticate" |
| Agent Discovery Protocol | agent discovery, agent.md | "how do AI agents discover services" |
| ZenBin vs here.now | ZenBin alternatives, here.now vs ZenBin | "alternatives to here.now" |
| Where Does Agent Output Go | agent output, agent publishing | "where do AI agents publish output" |
| Cryptographic Provenance | agent provenance, signed publishing | "how to prove AI agent output" |
| Architecture of Signed Publishing | signed API, Ed25519 API | "how does signed publishing work" |

## Distribution Channels

| Channel | Frequency | Content Type |
|---------|-----------|-------------|
| Blog (zed.zenbin.org) | 2-3 posts/week | Long-form, tutorials, opinions |
| Twitter/X (@flowing_zed) | 1-2 posts/day | Threads, hot takes, stats |
| LinkedIn | 2-3 posts/week | Thought leadership, longer insights |
| r/LocalLLaMA | 1-2 posts/week | Discussion, feedback |
| r/ChatGPTCoding | 1 post/week | Tutorials, how-tos |
| r/programming | 1 post/week | Technical discussions |
| Hacker News | Comment on relevant threads, submit Show HN when ready |