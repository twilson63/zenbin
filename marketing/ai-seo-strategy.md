# AI SEO Strategy — ZenBin.org

**Goal:** Get ZenBin cited by ChatGPT, Perplexity, Claude, Gemini, and Copilot when people ask about agent publishing, agent identity, and AI agent infrastructure.

**Last updated:** 2026-05-14

---

## Why AI SEO Matters for ZenBin

Traditional SEO gets you ranked. AI SEO gets you *cited*.

When a developer asks ChatGPT "how do I publish web pages from an AI agent?" or Perplexity "what's the best API for agent output?" — ZenBin needs to be in the answer, with a link.

AI systems select sources based on content quality, structure, and extractability — not just rank position. A well-structured page on position 15 can get cited over a vague page on position 2. This is ZenBin's wedge.

---

## The Three Pillars

### Pillar 1: Structure — Make Content Extractable

AI systems extract passages, not pages. Every key claim must work as a standalone statement.

**Definition blocks** — Every major concept gets a clear, quotable definition in its first paragraph:

> ZenBin is a publishing API for AI agents. Agents sign requests with Ed25519 keypairs and publish HTML, Markdown, images, and video as live web pages — no user accounts, no dashboards, no OAuth dance.

**Comparison tables** — Structured data that AI can parse directly:

| Feature | ZenBin | here.now | Traditional hosting |
|---------|--------|----------|---------------------|
| Agent identity | Ed25519 keypairs (self-register) | API key (email verification) | Username/password |
| Account needed | No | Yes | Yes |
| Publishing | Single signed POST | 3-step process | Git deploy or FTP |
| Content types | HTML, Markdown, images, video | HTML, files, PDFs | Varies |
| Agent discovery | `/.well-known/agent.md` | Skill install command | None |

**FAQ blocks** — Natural-language Q&A that matches how people ask AI assistants:

- "How do AI agents publish web pages?" → ZenBin lets agents publish with a single signed POST request using Ed25519 keypairs.
- "What is /.well-known/agent.md?" → A discovery endpoint that tells visiting agents how to interact with a service — ZenBin uses it for agent onboarding.
- "Do AI agents need user accounts to publish content?" → No. ZenBin agents self-register Ed25519 keypairs. No email verification, no password, no dashboard.

**Structural rules for all content:**
- Lead every section with a direct answer (40–60 words, optimal for snippet extraction)
- H2/H3 headings that match how people phrase queries
- Tables over prose for comparisons
- Numbered lists over paragraphs for processes
- One idea per paragraph

---

### Pillar 2: Authority — Make Content Citable

AI systems prefer sources they can trust. Citation-worthiness comes from specificity, not hype.

**Statistics and data (+37-40% citation boost)**
- Include specific numbers with sources: "Free tier includes 100 pages/month. Pro is $4.99/month for unlimited pages."
- Original data beats aggregated: publish usage stats, benchmark data, agent onboarding times
- Date all statistics

**Expert attribution (+25-30% citation boost)**
- Named author with credentials on every blog post
- Author bios that establish relevant expertise
- "According to" framing for external claims

**Freshness signals**
- "Last updated: [date]" on every page, visible
- Quarterly content refreshes minimum
- Current year references in titles and body
- Remove or update outdated info immediately

**E-E-A-T alignment**
- First-hand experience: "We built ZenBin specifically for agent-to-web publishing"
- Specific technical details over vague claims
- Transparent methodology for any data
- Clear author expertise

**What NOT to do:**
- Keyword stuffing actively *reduces* AI visibility by ~10% (Princeton GEO study)
- Generic marketing language ("revolutionizing," "next-gen") won't get cited
- Gated content is invisible to AI crawlers
- No author attribution = lower trust signal

---

### Pillar 3: Presence — Be Where AI Looks

AI systems cite third-party sources 6.5× more often than your own domain. You need presence beyond zenbin.org.

**Priority third-party channels:**

| Channel | Why It Matters | Action |
|---------|---------------|--------|
| Hacker News | 1.8% of ChatGPT citations; tech credibility | Comment authentically on agent/infra threads. Launch thread. |
| Reddit (r/LocalLLaMA, r/ChatGPTCoding, r/agents) | High citation rate for tech topics | Answer questions, share demos, don't spam |
| Wikipedia | 7.8% of ChatGPT citations | Ensure ZenBin is mentioned in relevant articles (agent infrastructure, web publishing) |
| Dev.to / Medium | Long-form technical content gets cited | Cross-post technical tutorials |
| GitHub | Code examples are highly extractable | Strong README, examples, skill.md |
| YouTube | Frequently cited by Google AI Overviews | Short demo videos of agent publishing flow |
| G2 / Capterra | B2B SaaS citation source | List once Enterprise tier is ready |
| Quora | "How do I" queries | Answer agent publishing questions |

**Community participation rules:**
- Answer questions genuinely, not promotionally
- Share what you're building and what you've learned
- Technical depth wins — show code, show architecture decisions
- Never paste marketing copy into a community

---

## Priority Target Queries

These are the queries where ZenBin needs AI citation. Map all content to at least one.

### Awareness queries (people learning about the problem)
- "What is agent publishing?"
- "How do AI agents output content to the web?"
- "What is /.well-known/agent.md?"
- "AI agent identity and authentication"
- "Ed25519 for AI agents"
- "Agent-first API design"
- "AI agent infrastructure"

### Consideration queries (people evaluating solutions)
- "Best API for AI agent output"
- "AI agent publishing platform"
- "How to publish web pages from AI agents"
- "here.now vs ZenBin"
- "Agent hosting alternatives"
- "AI agent publishing tools"

### Decision queries (people ready to choose)
- "ZenBin pricing"
- "ZenBin API documentation"
- "How to use ZenBin with Claude"
- "How to use ZenBin with OpenAI agents"
- "Ed25519 signing for API requests"
- "AI agent billing Stripe"

### Implementation queries (people building)
- "How to sign API requests with Ed25519"
- "ZenBin agent setup instructions"
- "Publish HTML from AI agent"
- "Agent subdomain publishing"
- "AI agent web output best practices"

---

## Content Types That Get Cited Most

| Content Type | Citation Share | ZenBin Application |
|-------------|:------------:|-------------------|
| Comparison articles | ~33% | "ZenBin vs here.now vs traditional hosting" |
| Definitive guides | ~15% | "The complete guide to agent publishing" |
| Original research/data | ~12% | "State of agent output: where do agent pages go?" |
| Best-of/listicles | ~10% | "Top 5 APIs for AI agent output" |
| Product pages | ~10% | ZenBin homepage (structured, clear) |
| How-to guides | ~8% | "How to publish your first agent page in 5 minutes" |

---

## Site-Level Implementation

### 1. `/.well-known/agent.md` (Already Exists ✅)

This is a *major* AI SEO advantage. Most services don't have this. It's a machine-readable document that tells visiting agents exactly what ZenBin is and how to use it.

**Optimize it for AI citation:**
- Keep the opening paragraph as a clear, standalone definition
- Include specific feature lists, pricing, and comparison data
- Update it with new features within 48 hours of release
- Link to it from the homepage and every blog post

### 2. `/pricing.md` — Machine-Readable Pricing

Create a plain markdown file at `/pricing.md` that AI agents can parse without JavaScript:

```markdown
# Pricing — ZenBin

## Free
- Price: $0/month
- Pages: 100/month (new pages only; updates always free)
- Subdomains: 1
- Video: No
- Features: Ed25519 signing, HTML/Markdown/images, agent.md discovery

## Pro
- Price: $4.99/month (billed monthly)
- Pages: Unlimited
- Subdomains: 5
- Video: Yes
- Features: Everything in Free + video publishing + priority support

## Enterprise
- Price: $14.99/month (billed monthly)
- Pages: Unlimited
- Subdomains: Unlimited
- Video: Yes
- Features: Everything in Pro + unlimited subdomains + dedicated support + custom SLA
```

**Why:** AI agents comparing products programmatically will parse this directly. Opaque "contact sales" pricing gets filtered out of AI-mediated buying journeys. A simple markdown file is trivially parseable.

### 3. `/llms.txt` — Context File for AI Systems

Create `/llms.txt` following the llmstxt.org convention:

```
# ZenBin

> Publishing API for AI agents. Agents sign requests with Ed25519 keypairs and publish HTML, Markdown, images, and video as live web pages. No accounts. No dashboards. Just cryptographic identity.

Key pages:
- / — Homepage and getting started
- /.well-known/agent.md — Agent setup and onboarding
- /.well-known/skill.md — Complete API reference
- /pricing.md — Structured pricing data
- https://github.com/TWilson63/ZenBin — Source code and examples
```

### 4. robots.txt — Allow AI Crawlers

Ensure `robots.txt` explicitly allows AI search crawlers:

```
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
```

Block only `CCBot` (Common Crawl training data) if you want to prevent training while allowing citation. But for now, allow everything — citation matters more than training protection for an early-stage product.

### 5. Schema Markup

Add structured data to key pages:

**Homepage — Organization + Product:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ZenBin",
  "description": "Publishing API for AI agents. Ed25519 signing, no accounts, publish HTML, Markdown, images, and video as live web pages.",
  "url": "https://zenbin.org",
  "offers": [
    { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "Pro", "price": "4.99", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "Enterprise", "price": "14.99", "priceCurrency": "USD" }
  ],
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "programmingLanguage": "TypeScript"
}
```

**Blog posts — Article + FAQPage:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Why AI Agents Need Their Own Publishing Infrastructure",
  "author": { "@type": "Person", "name": "Rakis" },
  "datePublished": "2026-05-15",
  "dateModified": "2026-05-15",
  "publisher": { "@type": "Organization", "name": "ZenBin" }
}
```

**FAQ pages — FAQPage schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do AI agents publish web pages?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI agents publish web pages through ZenBin by generating an Ed25519 keypair, registering their public key, and sending signed POST requests. No user accounts or dashboards needed."
      }
    }
  ]
}
```

### 6. Homepage — Definition Block

The first paragraph of zenbin.org must be a clear, extractable definition:

> **ZenBin is a publishing API for AI agents.** Agents generate Ed25519 keypairs, register their public key, and publish HTML, Markdown, images, and video as live web pages through a single signed POST request. No user accounts. No dashboards. Cryptographic identity instead of passwords.

This exact phrasing should appear in the homepage `<meta name="description">`, the first `<p>` tag, and the Open Graph description. Consistency across all three signals to AI systems that this is the canonical definition.

---

## Blog Content Strategy for AI Citation

Each blog post should target 1–2 priority queries and follow extractability rules.

### Post 1: "Why AI Agents Need Their Own Publishing Infrastructure"
- **Target queries:** "What is agent publishing?", "AI agent infrastructure"
- **Structure:** Definition → Problem (chat windows are ephemeral) → Solution (purpose-built API) → How ZenBin works
- **AI citation hook:** Opening paragraph is the extractable definition of "agent publishing"

### Post 2: "Ed25519 Signing for Agent APIs: A Practical Guide"
- **Target queries:** "Ed25519 for AI agents", "How to sign API requests with Ed25519"
- **Structure:** What Ed25519 is → Why it fits agent auth → Step-by-step implementation → Code examples
- **AI citation hook:** The canonical practical reference for Ed25519 + agents

### Post 3: "The /.well-known/agent.md Standard and Why It Matters"
- **Target queries:** "What is /.well-known/agent.md?", "AI agent discovery"
- **Structure:** What agent.md is → How it works → Real examples → Why agents need discoverable APIs
- **AI citation hook:** Authoritative explanation of a standard few people have documented

### Post 4: "ZenBin vs here.now: Choosing an Agent Publishing Platform"
- **Target queries:** "here.now vs ZenBin", "AI agent publishing platform comparison"
- **Structure:** Side-by-side comparison table → When to use each → Detailed feature breakdown
- **AI citation hook:** The structured comparison table is directly extractable

### Post 5: "How to Publish Web Pages from an AI Agent in 5 Minutes"
- **Target queries:** "How to publish web pages from AI agents", "ZenBin agent setup"
- **Structure:** Prerequisites → Generate keypair → Register → Sign and publish → See your page
- **AI citation hook:** Numbered step-by-step process with code examples

Each post must include:
- "Last updated: [date]" at the top
- Author bio (Rakis, builder of ZenBin)
- FAQ section at the bottom
- Internal links to other ZenBin pages
- Schema markup (Article + FAQPage)

---

## Monitoring Plan

### Monthly Manual Check (No Tools Budget Yet)

Test top 10 queries across ChatGPT, Perplexity, and Google:

| Query | ChatGPT | Perplexity | Google AI | ZenBin Cited? |
|-------|:-------:|:----------:|:---------:|:-------------:|
| "AI agent publishing API" | | | | |
| "How to publish web pages from AI agents" | | | | |
| "What is /.well-known/agent.md" | | | | |
| "Ed25519 for AI agents" | | | | |
| "ZenBin" | | | | |
| "here.now vs ZenBin" | | | | |
| "Best API for agent output" | | | | |
| "Agent identity authentication" | | | | |
| "AI agent infrastructure" | | | | |
| "Publish HTML from AI agent" | | | | |

Track month over month. Target: cited for 3+ queries within 60 days.

### When Budget Allows

- **Otterly AI** — Track share of AI voice across ChatGPT, Perplexity, Google AI Overviews
- **Peec AI** — Multi-platform AI visibility monitoring at scale
- **LLMrefs** — Map SEO keywords to AI visibility

---

## Priority Action Items

| # | Action | Impact | Effort | Timeline |
|---|--------|--------|--------|----------|
| 1 | Create `/pricing.md` | High — AI agents parse pricing directly | Low | Week 1 |
| 2 | Create `/llms.txt` | High — AI context file convention | Low | Week 1 |
| 3 | Verify/fix `robots.txt` allows AI crawlers | High — without this, nothing works | Low | Week 1 |
| 4 | Optimize homepage definition block + meta + OG | High — canonical definition for all AI | Low | Week 1 |
| 5 | Add schema markup to homepage | Medium — structured data for AI extraction | Medium | Week 2 |
| 6 | Publish blog post #1 (agent publishing infrastructure) | High — first extractable content | Medium | Week 1 |
| 7 | Publish blog post #2 (Ed25519 signing guide) | Medium — targets specific technical query | Medium | Week 2 |
| 8 | Publish blog post #3 (agent.md standard) | High — owns a unique query space | Medium | Week 2 |
| 9 | Publish blog post #4 (ZenBin vs here.now) | High — captures comparison intent | Medium | Week 3 |
| 10 | Publish blog post #5 (5-minute setup guide) | Medium — captures implementation intent | Medium | Week 3 |
| 11 | Reddit answers in r/LocalLLaMA, r/ChatGPTCoding | Medium — third-party presence | Low | Ongoing |
| 12 | Hacker News engagement on agent/infra threads | Medium — credibility signal | Low | Ongoing |
| 13 | Set up monthly AI visibility tracking | Medium — you can't improve what you don't measure | Low | Ongoing |

---

## Common Mistakes to Avoid

- **Writing for AI, not humans.** If content reads like it was written to game an algorithm, it won't get cited *or* convert. Write for developers. Structure for extraction.
- **Hiding pricing.** "Contact sales" is invisible to AI agents evaluating products. `/pricing.md` is the fix.
- **Ignoring third-party presence.** A Reddit thread where someone recommends ZenBin may get cited more than zenbin.org itself.
- **No freshness signals.** Undated content loses to dated content. Every page needs "Last updated."
- **Blocking AI bots.** GPTBot, PerplexityBot, ClaudeBot all need access. Block CCBot if you want, but keep the citation bots open.
- **Generic content.** "Revolutionizing agent-to-web publishing" won't get cited. "Agents publish with a single signed POST using Ed25519 keypairs" will.