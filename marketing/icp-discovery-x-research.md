# ZenBin ICP Discovery — X/Twitter Research (May 2026)

## Summary

ZenBin's ICP is **agent developers who need to publish agent output to the web**. Based on X research, here's who they are, where they hang out, and what they're talking about.

---

## The Big Signal: HTML as Agent Output

The strongest signal right now is **"HTML as the universal agent output format"** — a narrative led by Karpathy that's gone viral (5M+ views). This is our market positioning validated externally.

**Key tweets:**
- Karpathy: "HTML as the universal agent output format is secretly the best UX insight of 2026"
- 137❤: "HTML beating Markdown as the agent output format — it's the cleanest framing of the format problem I've read this year"
- "Markdown won as the default agent output format because it was easy to parse. It's losing because nobody on your team reads anything past 100 lines."

**ZenBin's angle:** They're right about format. We're about **provenance** — signing what agents create so you know who made it.

---

## ICP Segments (Priority Order)

### 1. Agent Framework Builders ⚡ (PRIMARY)
**Who:** Developers building agent tools, frameworks, platforms
**What they say:** "building AI agent framework", "agent tool", "agent platform"
**Where:** @AnthropicAI ecosystem, MCP server builders, agent infra people
**Pain:** Agents produce output (reports, dashboards, docs) but have no standard way to publish it
**Examples:**
- htmlship (@trq212) — direct competitor, "one command to publish HTML"
- pageshelf (upamune) — "Secure local/Tailscale HTML artifact shelf for agent-generated documents"
- toss — "self-deploy on Cloudflare or Vercel, expiring/permanent share links for HTML artifacts"
- Agent skill builders (html-artifact skill, etc.)

**Message:** "Agents sign what they create. Verify with CAP Protocol."

### 2. Claude Code / Cursor Users 🔧 (HIGH)
**Who:** Developers using Claude Code, Cursor, Windsurf to build and ship
**What they say:** "Claude Code to build and publish", "agent-generated code"
**Pain:** They produce HTML artifacts/reports/dashboards but sharing is clunky
**Volume:** 34❤ on Ahrefs blog about "Claude Code + MCP workflow for publish-ready articles"
**Examples:**
- "I used Claude Code to build and publish an iOS app"
- "Claude Code reads HubSpot data, publishes as B2B catalog"
- "@Ahrefs Director of Content built a fully automated Claude Code workflow that creates publish-ready blog articles in 8 mins"

**Message:** "Your agent builds it. ZenBin publishes it. Signed and verifiable."

### 3. MCP Server Builders 🔌 (HIGH)
**Who:** Developers building MCP servers for agents
**What they say:** "built an MCP server", "open source MCP server"
**Volume:** Tons of MCP server launches (Box/Twilio official, dozens of community ones)
**Pain:** Their servers produce output — where does it go? How do users share/verify it?
**Examples:**
- Box MCP server for legal (78❤)
- Twilio MCP server (18❤)
- Peekaboo MCP (screen control, 3500 GitHub stars)
- ADB MCP, various data MCPs

**Message:** "Add ZenBin as a tool in your MCP server. Let agents publish their output."

### 4. OpenClaw & Hermes Users 🔌 (PRIMARY — IMMEDIATE)
**Who:** People running OpenClaw or Hermes agents that produce output
**Volume:** Massive — 370K GitHub stars for OpenClaw, 224B daily tokens for Hermes
**Pain:** Agents produce HTML artifacts, reports, dashboards — but sharing them is awkward
**Key evidence:**
- Karpathy's "Would be cool if there was an easy way to share HTML pages" tweet got **9,601 likes, 371 retweets**
- Someone built a `share-html` OpenClaw skill: "publish html files into a folder that an nginx container serves up on my local network"
- "Artifact Preview Skill for your Hermes or OpenClaw" — a separate skill just to VIEW output
- htmlship actively replying to Karpathy thread: "one command: CLI, Python, npm, API, MCP"
- "It's surprisingly awkward to share HTML files" (6❤)
- "markdown feels increasingly wrong for agent-native workflows" (3❤)

**What they need:** A way for their agents to publish output to the web with zero setup
**Our angle:** ZenBin as an OpenClaw skill / Hermes plugin — agents sign and publish in one step
**Competition:** htmlship is already here, but has NO signing/provenance. We own that.

### 5. Enterprise Agent Deployers 🏢 (MEDIUM-TERM)
**Who:** Companies deploying agents at scale
**What they say:** "agent governance", "agent provenance", "verifiable"
**Volume:** Lower but high-value — enterprise is early
**Key tweet:** "We have premium privacy branding and trillion-dollar platforms, but still no universal content provenance system"
**Pain:** Need audit trails, compliance, attribution for agent-generated content
**Examples:**
- Google's Gemini Enterprise Agent Platform with Agent Registry
- "agent governance in Web3 is harder because there's no central permission layer"
- "ZK proofs for agent output turn every AI claim into something you can hold accountable"

**Message:** "CAP Protocol: cryptographic proof of who published what, when."

---

## Competitors & Adjacent Players

| Player | What | Differentiator from ZenBin |
|--------|------|---------------------------|
| **htmlship** | CLI/API to publish HTML | No signing, no provenance, no subdomains, no API-first |
| **pageshelf** | Local/Tailscale HTML shelf | Self-hosted, not public web, no verification |
| **toss** | Deploy HTML artifacts to CF/Vercel | More infra, more setup, no agent-native auth |
| **ShipPage** | Agent page builder | Zero-friction onboarding (worth studying) |
| **Anthropic computer-use** | Official MCP server | macOS only, about control not publishing |
| **C2PA/Content Authenticity** | Content provenance standard | Media-focused (images/video), not agent/HTML-native |

---

## Key Hashtags & Topics to Engage With

- `#AIAgents` `#AgentOutput` `#AgentInfra`
- `#MCP` `#MCPServer` `#ModelContextProtocol`
- `#ClaudeCode` `#CursorAI` `#WindsurfAI`
- `#ContentProvenance` `#AIAttribution`
- `#IndieHackers` `#BuildInPublic`
- HTML artifacts, agent publishing, agent output format

---

## Accounts to Follow & Engage With

**Direct competitors/adjacent:**
- @trq212 (htmlship) — biggest direct competitor, very active
- @upamune (pageshelf) — adjacent, local-first approach
- @karpathy — started the "HTML as agent output" narrative

**Agent infra:**
- @AnthropicAI — official, but their ecosystem is our ICP
- MCP server builders (hundreds, growing daily)
- @swarms_corp — agent framework
- @heyaura — agent framework for Web3

**Content provenance:**
- @ContentAuth — C2PA org
- People talking about "agent governance" and "AI transparency"

---

## Recommended ZenBin Positioning on X

1. **Don't compete on format (HTML vs Markdown) — compete on provenance**
   - htmlship owns "one command to publish HTML"
   - ZenBin owns "agents sign what they create"

2. **Engage in MCP conversations** — every MCP server that produces output is a potential integration point

3. **Target OpenClaw and Hermes users directly** — they're the low-hanging fruit
   - Build a ZenBin OpenClaw skill (our `.well-known/skill.md` is already structured for this)
   - Build a ZenBin Hermes plugin
   - Reply to OpenClaw/Hermes users building share-html skills
   - Position: "Your agent builds it. ZenBin publishes it. Signed and verifiable."

4. **Reply to agent output tweets with proof points:**
   - When someone shows an agent-generated dashboard → "Nice! Did you know you can sign it with Ed25519 so anyone can verify who made it? zenbin.org"
   - When someone shares an HTML artifact → "Love this. With ZenBin, your agent can cryptographically sign this so viewers always know it came from you."

5. **Content play:** Write about CAP Protocol, agent provenance, why signing matters

6. **Show, don't tell:** Publish agent outputs on ZenBin, share the verification flow

7. **Engage on the Karpathy thread (9.6K likes)** — the biggest conversation about our exact problem space
   - Reply to people struggling with sharing HTML
   - Differentiate from htmlship (they publish, we publish + verify)