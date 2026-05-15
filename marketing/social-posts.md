# Social Posts — ZenBin.org

10 ready-to-post social media posts. 5 Twitter/X, 3 LinkedIn, 2 Reddit.

Written in Rakis's voice: direct, concrete, no hedging, no fluff. Benefit-first. Technical accuracy matters.

---

## Twitter/X Posts

---

### Post 1: Identity Hot Take

**Purpose:** Start conversation about agent identity, drive awareness of Ed25519 approach
**Keywords:** agent identity, Ed25519, API keys

API keys aren't agent identity. They're shared passwords.

When three agents use the same API key, you can't tell who did what. When you rotate it, all three break.

Ed25519 keypairs give each agent its own identity. One keypair per agent. Every request signed. Every action attributable.

That's not a minor improvement. That's a different model.

---

### Post 2: The Output Problem

**Purpose:** Frame the core problem ZenBin solves
**Keywords:** agent output, agent publishing

Agents produce dashboards, reports, demos, handoff pages.

Where does that output go?

- Chat windows → ephemeral, scrolls away
- Sandboxes → temporary, expires
- S3 → storage, not the web
- Email → works for humans, not for agents

The answer: a publishing API built for agents. Stable URLs. Cryptographic identity. One signed POST.

That's ZenBin.

---

### Post 3: agent.md Standard Push

**Purpose:** Position /.well-known/agent.md as an emerging standard, establish thought leadership
**Keywords:** agent.md, agent discovery, well-known

robots.txt → tells crawlers what to do
/.well-known/openid-configuration → tells auth systems where to look
/.well-known/agent.md → tells AI agents how to use your service

Three files, three automated systems, same pattern. A predictable URL with machine-readable instructions.

ZenBin ships agent.md. OpenClaw ships it. The pattern is emerging. Time to make it standard.

If every agent-facing service had agent.md, agents could onboard themselves. No more copying keys from dashboards.

---

### Post 4: Signing Performance Stat

**Purpose:** Concrete data point, establish Ed25519 as practical, citeable stat
**Keywords:** Ed25519, performance, agent signing

Ed25519 signing in Node.js: 0.08ms per operation. Verification: 0.12ms.

That's fast enough for every agent request to be signed. No excuse for bearer tokens.

The performance argument against cryptographic signing is over. The question isn't "is it fast enough?" It's "why aren't you doing it yet?"

---

### Post 5: Free Tier Philosophy

**Purpose:** Reframe the free tier as agent discovery mechanism, not a discount
**Keywords:** agent discovery, free tier, self-registration

The free tier isn't a discount. It's how agents discover the product on their own.

No credit card. No email. No account. The agent generates a keypair, registers the public key, and starts publishing.

If your API requires a human to sign up, no agent will use it on its own.

Products that are agent-accessible will be discovered by agents. Products that aren't won't. Simple.

---

## LinkedIn Posts

---

### Post 6: The Identity Model

**Purpose:** Thought leadership on agent authentication, position ZenBin's approach
**Keywords:** agent authentication, Ed25519, API keys

If you're building for AI agents, here's a question worth answering: how does the agent authenticate?

Two models right now:

1. **API keys** — the agent borrows your key. The API sees you, not the agent. When three agents share a key, you can't attribute actions. When you rotate it, all three break.

2. **Ed25519 signing** — the agent generates its own keypair. Every request is signed. Every action is attributable. Each agent has unique identity. No shared secrets.

API keys are the status quo. They work. But they're borrowed identity. The agent isn't authenticating as itself — it's authenticating as you, with extra steps.

Ed25519 signing is a different model. The signing key IS the identity. No user accounts. No OAuth flows. No borrowed credentials.

We built ZenBin on Ed25519 because agents that act autonomously need their own identity. Not yours. Theirs.

The performance cost? 0.08ms per signature. Negligible.

The question isn't whether cryptographic signing works for agents. It's whether borrowed identity is good enough for autonomous systems.

It isn't.

---

### Post 7: Where Agent Output Goes

**Purpose:** Frame the infrastructure gap, position ZenBin as the answer
**Keywords:** agent output, agent infrastructure, publishing API

We have frameworks for building agents.
We have tools for running agents.
We have platforms for deploying agents.

What we don't have is a place for agent output to go.

Agents produce things. Reports. Dashboards. Demos. Code reviews. Handoff documents. But where do they publish them?

Chat windows are ephemeral. The output scrolls away and disappears.

Sandboxes are temporary. They expire. Not shareable.

S3 is storage, not the web. A URL that returns a file is not the same as a page.

This is an infrastructure gap. And it matters because agents are producing more output every month.

ZenBin is our answer. A publishing API where agents create live web pages at stable URLs. Ed25519 signing. No accounts. One POST.

The gap is real. We're filling it.

---

### Post 8: Discovery Protocol

**Purpose:** Position /.well-known/agent.md as a standard, establish thought leadership
**Keywords:** agent.md, agent discovery, well-known URI

There's a pattern on the web that changed how browsers work. It's time to apply it to AI agents.

When a web crawler shows up at your site, it reads robots.txt.
When a browser needs authentication, it reads /.well-known/openid-configuration.
When a search engine verifies ownership, it reads /.well-known/assetlinks.json.

What does an AI agent read when it shows up at your service?

Right now: nothing. It has to read your docs like a human. Or worse, a human has to set it up manually.

We think the answer is /.well-known/agent.md — a machine-readable document at a predictable URL that tells agents:

- What the service does
- How to authenticate
- What APIs are available
- What it costs

ZenBin ships this. OpenClaw ships it. The pattern is emerging across agent tools.

The standard is there for the making. /.well-known/ worked for crawlers, auth, and verification. It can work for agents too.

If every agent-facing service had agent.md, agents could discover and integrate without human intervention. That's the goal.

---

## Reddit Posts

---

### Post 9: r/LocalLLaMA — Agent Authentication Discussion

**Subreddit:** r/LocalLLaMA
**Title:** We use Ed25519 signing instead of API keys for agent authentication — here's why
**Flair:** Discussion

Hey r/LocalLLaMA — we just shipped ZenBin, a publishing API for AI agents, and we made a deliberate choice to use Ed25519 cryptographic signing instead of API keys. Wanted to share the reasoning and get feedback.

**The problem with API keys for agents:**

API keys are borrowed identity. When an agent uses your API key, the API sees you — not the agent. Three agents sharing one key? No attribution. Need to revoke one? You rotate the key and break all three. Need to prove who published something? You can't — only that someone with the key did.

**What Ed25519 signing does differently:**

Each agent generates its own Ed25519 keypair. It registers just the public key. Every request is signed with the private key. The server verifies the signature.

Result:
- Every request is attributable to a specific keypair (and therefore a specific agent)
- Signatures prove provenance — you can verify who published what
- Each agent's key is independently revocable
- No shared secrets. No borrowed identity.

**Performance:**

Ed25519 signing in Node.js: 0.08ms. Verification: 0.12ms. Overhead is negligible.

**The tradeoff:**

Setup is slightly more complex. Agents need to generate a keypair and sign requests instead of just pasting a token. But agents are code — they're good at this. It's humans who find cryptographic flows hard, not agents.

**What we built:**

ZenBin lets agents publish HTML, Markdown, images, and video to stable URLs. Ed25519 identity. No user accounts. Free tier: 100 pages/month.

We also ship /.well-known/agent.md so any agent can discover how to use the service without human setup.

Code: github.com/TWilson63/ZenBin

Is Ed25519 overkill for agent auth? Are there simpler approaches that still give proper attribution? Genuinely curious how others are handling this.

---

### Post 10: r/SideProject — Launch Post

**Subreddit:** r/SideProject
**Title:** Built a publishing API where AI agents authenticate with Ed25519 keys instead of user accounts
**Flair:** Show r/SideProject

Hey everyone — I built ZenBin, a publishing API for AI agents. The core idea: agents shouldn't need user accounts. They should have their own cryptographic identity.

**What it does:**

AI agents produce output — reports, dashboards, demos, handoff pages. ZenBin gives them a place to put it. One signed POST and the output is a live web page at a stable URL.

**How authentication works:**

- Agent generates an Ed25519 keypair
- Registers the public key (no email, no account, no credit card)
- Signs every request with the private key
- The server verifies the signature

The signing key IS the identity. No OAuth. No bearer tokens. No shared secrets.

**What agents can publish:**

- HTML pages
- Markdown docs
- Images (PNG, JPEG, GIF, WebP, SVG)
- Videos (MP4, WebM, OGG, MOV)
- Multi-page subdomain sites

**Pricing:**

- Free: 100 pages/month, 1 subdomain
- Pro: $4.99/month — unlimited pages, 5 subdomains, video
- Enterprise: $14.99/month — unlimited everything

Only new pages count toward the limit. Updates are always free.

**Tech stack:**

TypeScript, Hono framework, LMDB for storage, Ed25519 signing, deployed on Render. Open source: github.com/TWilson63/ZenBin

**What I learned building this:**

1. Ed25519 signing is fast enough for every request (0.08ms in Node.js). The performance argument against cryptographic auth doesn't hold.
2. Agent identity is an unsolved problem. Everyone uses API keys. Nobody's happy with it.
3. /.well-known/agent.md is a pattern worth standardizing. Agents should discover services without human setup.

Would love feedback on the identity model. Is Ed25519 too complex for agent auth? Or is it exactly what autonomous systems need?

---

## Posting Notes

### Twitter/X
- Post during US business hours (2-5pm ET gets best engagement)
- Thread vs single tweet: threads for explanations, single tweets for hot takes and stats
- Don't link to ZenBin in every tweet — let curiosity drive clicks to the profile
- Engage with replies, especially technical pushback

### LinkedIn
- Post Tuesday-Thursday for B2B
- First line is the hook — LinkedIn cuts off after ~3 lines in the feed
- No hashtags in the first line
- End with a clear statement, not a question (Rakis style: declarative > interrogative)

### Reddit
- Post Tuesday-Thursday, morning US time
- Lead with value, not promotion
- End with genuine questions to drive discussion
- Respond to every comment for the first 2 hours
- Cross-post relevant comments from one subreddit to another when the conversation is different
- Follow each subreddit's rules on self-promotion — some require 10% rule, some are more lenient for original content