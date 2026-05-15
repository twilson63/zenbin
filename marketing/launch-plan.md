# ZenBin Launch Plan

> Publishing API for AI agents. Ed25519 keypairs, no accounts, cryptographic provenance, subdomains, Markdown, video. Free/Pro/Enterprise.
>
> **Last updated:** 2026-05-15 · **Status:** Pre-launch

---

## 0. Readiness Assessment

Before any directory submission or launch event, every item here must be green. Hard blocks (❌) mean don't launch until fixed. Soft blocks (⚠️) mean you can launch but will lose value.

### Hard Blocks (Must Fix Before Launch)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Product publicly accessible (no password wall) | ✅ | zenbin.org is live |
| 2 | Pricing page live | ✅ | Free/Pro/Enterprise tiers |
| 3 | Privacy policy + terms live | ⚠️ | Need to verify these exist at zenbin.org |
| 4 | Logo assets: PNG, SVG, 1024×1024 square, favicon | ⚠️ | Need to verify asset completeness |
| 5 | 5–8 real product screenshots at 1920×1080 | ❌ | Need actual UI/API screenshots, not mockups |
| 6 | 60–90s demo video | ❌ | Agent generating keypair → registering → publishing → viewing live. PH listings with video get 2.7× more upvotes |
| 7 | Landing pages GEO-ready (single H1, sequential hierarchy, FAQ schema, structured data) | ⚠️ | Landing review identified headline issues. FAQ schema not yet confirmed |
| 8 | `/.well-known/agent.md` live and complete | ✅ | Our differentiator. Already live |
| 9 | Destination pages built (3 alternative pages + 3 use-case pages minimum) | ❌ | Need `/alternatives/here-now`, `/alternatives/github-pages`, `/for/ai-agents`, `/for/developers`, etc. |

### Soft Blocks (Should Fix, Can Launch Without)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 10 | 20+ beta users who could leave G2 reviews | ⚠️ | Need to assess current user count |
| 11 | Email list of 100+ for PH launch day warm traffic | ⚠️ | Need to build this |
| 12 | Template gallery or lead magnet asset | ❌ | Not applicable yet — agent publishing doesn't have templates per se |
| 13 | Product Hunt hunter lined up | ❌ | Optional but adds ~15% day-one lift |
| 14 | Onboarding email sequence ready | ❌ | Post-launch, but should be drafted |

---

## 1. Pre-Launch Checklist

### 30 Days Out

- [ ] **Landing page reframed** — Lead with outcome, not feature. Current headline "publish agent output as live web pages" describes the mechanism. Reframe to hit the pain point. See `landing-review.md` for specific rewrites
- [ ] **Pricing page live** — Free/Pro/Enterprise tiers, even if "free while in beta" (already live)
- [ ] **Privacy policy + terms of service** — Required by most directories; must be live and linked
- [ ] **Logo assets ready** — PNG, SVG, 1024×1024 square, favicon
- [ ] **5–8 real product screenshots at 1920×1080** — Not mockups. Actual UI: keypair generation, signing flow, published page view, agent.md discovery, API response examples
- [ ] **60–90 second demo video** — Script: (1) Agent reads `/.well-known/agent.md` (2) Generates Ed25519 keypair (3) Registers with ZenBin (4) Signs and publishes a page (5) Views live page in browser (6) Verifies provenance. PH listings with video get **2.7× more upvotes**
- [ ] **`/.well-known/agent.md` polished** — Already live. Make sure it's thorough and impressive
- [ ] **Destination pages built** (minimum before any directory submission):
  - [ ] `/alternatives/here-now` — "here.now alternative" targeting. Comparison/alternative pages convert at **5–15%** vs 0.5–2% for generic content
  - [ ] `/alternatives/github-pages` — for agents
  - [ ] `/alternatives/netlify` — for agents
  - [ ] `/for/ai-agents` — use-case page
  - [ ] `/for/developers` — use-case page
  - [ ] `/for/open-source` — use-case page
- [ ] **Blog post drafted** — "Why AI Agents Can't Publish What They Build" (see `content-calendar.md` Day 1)
- [ ] **Show HN post drafted** — Technical angle: Ed25519 auth, no accounts, open source, `/.well-known/agent.md`
- [ ] **Structured data on all pages** — `Organization`, `Product`, `SoftwareApplication`, `FAQPage` JSON-LD. Pages with clean heading hierarchy have **2.8× higher AI citation rates**
- [ ] **FAQ schema on landing page** — AI engines heavily weight `FAQPage` JSON-LD for answer extraction
- [ ] **Analytics/tracking in place** — Referrer tracking for directories, UTM params ready
- [ ] **Crunchbase, LinkedIn company page, Wikidata entries** claimed — All three feed AI training corpora. Critical for GEO

### 14 Days Out

- [ ] **Product Hunt hunter identified** — Don't pay; trade a feature shoutout or intro. A known hunter adds ~15% day-one lift
- [ ] **PH "Upcoming" page live** — Drive traffic to collect "notify on launch" subscribers
- [ ] **PH account warmed up** — Upvote + thoughtfully comment on 3 launches/day for the next 14 days. Follow 100+ active makers. Build history so the algorithm sees a real account
- [ ] **Email to early users/beta testers** — "We're launching [date]. Here's what to expect. Reply if you want a heads up." Build the warm list
- [ ] **Positioning variants written** — Different copy for each directory tier (see Section 2). Don't copy-paste. AI engines penalize duplicate content
- [ ] **Submission tracker spreadsheet created** — Columns: directory, tier, date submitted, URL, status, moderator notes, backlink verified, dofollow
- [ ] **Twitter/X presence established** — @flowing_zed active, bio updated, pinned tweet about ZenBin
- [ ] **Community karma built** — 3–5 substantive HN comments/day, 2–3 Reddit comments/day (per `engagement-plan.md`), for the next 14 days
- [ ] **Demo video recorded and uploaded** — Host on YouTube (unlisted) for PH embedding
- [ ] **PH gallery images created** — 1270×760, 4–6 images showing key features

### 7 Days Out

- [ ] **Launch day assets finalized** — PH gallery images (1270×760), tagline (<60 chars), 260-char description, first comment from founder, first comment from a customer
- [ ] **All directory descriptions pre-written** — Per-tier variants ready in the tracker
- [ ] **Launch day team ready** — Who's commenting on HN, who's on PH, who's on Twitter/X, who's monitoring for issues
- [ ] **Incident response plan** — What if the site goes down? What if the API has a bug? Rollback plan ready
- [ ] **Final product check** — Test in incognito, test signup flow, test publishing flow, test demo video autoplays, test CTAs go to signup
- [ ] **Blog post scheduled** — "Why AI Agents Can't Publish What They Build" ready to publish on launch day morning
- [ ] **Social posts drafted** — Twitter/X thread, LinkedIn post (see `social-posts.md`)
- [ ] **Email warm-up sent** — "We're launching Tuesday. Here's what to expect." to early users and supporters
- [ ] **G2 listing created** — Even if no reviews yet. Get the URL ready for the 10-in-30 protocol

### Day Of (Before Launch)

- [ ] **Site health check** — Uptime confirmed, SSL valid, API responsive
- [ ] **Demo video working** — Autoplays on landing page and PH
- [ ] **All team members online** — Comment responders at the ready
- [ ] **PH listing published** at 12:01 AM Pacific (Tuesday/Wednesday/Thursday only — weekend launches get 60–70% less traffic)
- [ ] **Blog post published**
- [ ] **Twitter/X thread posted**

---

## 2. Directory Submission Targets

### Positioning Variants by Tier

**Never copy-paste the same description across directories.** AI engines cross-reference and down-weight duplicate content. Each tier gets a different lead:

| Tier | Lead with | Why |
|------|-----------|-----|
| Startup/Launch | **Outcome** — "The place where AI agent output lives" | Founders scan for outcome clarity |
| SaaS directory | **Alternative** — "here.now alternative for AI agents" | Catches "[competitor] alternative" search intent |
| AI directory | **AI-first architecture** — "Publishing API designed for AI agents" | TAAFT/Futurepedia audiences explicitly want AI tools |
| Agent/MCP | **Agent-native** — "Agents discover, register, and publish autonomously" | Niche but high-intent. Ruling-out competitors |
| Dev tool | **Technical depth** — "Ed25519 key-based auth, no accounts, one signed POST" | Dev audiences reward substance |
| B2B review | **ROI + use case** — "Helps teams publish agent output 10× faster" | Reviewers want outcomes |

### Tagline Variants

- **Startup:** "Where agent output becomes real web pages"
- **SaaS:** "The here.now alternative built for AI agents"
- **AI:** "AI-powered publishing API for autonomous agents"
- **Agent/MCP:** "MCP-native publishing for AI agents"
- **Dev:** "Ed25519-signed publishing API — no accounts, just cryptography"

### Tier 1 — Flagship Launch (Launch Week Only)

Submit these on launch day or within 48 hours. These are the highest-leverage placements.

| # | Directory | URL | Notes |
|---|-----------|-----|-------|
| 1 | **Product Hunt** | https://producthunt.com | The anchor event. 12:01 AM PT launch. Full PH prep timeline in Section 1 |
| 2 | **Hacker News (Show HN)** | https://news.ycombinator.com | Technical angle is strong — Ed25519 auth, no accounts, open source. Title: "Show HN: ZenBin – A publishing API for AI agents with Ed25519 signing" |
| 3 | **BetaList** | https://betalist.com | Early adopter audience. Submit 1–2 days before launch for "coming soon" queue |
| 4 | **DevHunt** | https://devhunt.org | Dev-tool focused. Our technical audience is here |
| 5 | **Fazier** | https://fazier.com | Daily ranking, much lower competition than PH. Achievable #1 |
| 6 | **Uneed** | https://uneed.best | Curated, quality backlink |
| 7 | **Microlaunch** | https://microlaunch.net | Month-long visibility vs one-day spike |
| 8 | **Launching Next** | https://launchingnext.com | Editorial curation — needs compelling story |
| 9 | **OpenHunts** | https://openhunts.com | Indie-maker friendly, reports 14%+ conversion rates |
| 10 | **PeerPush** | https://peerpush.com | Low competition, similar to Fazier |

### Tier 2 — Startup/SaaS (Week 1–2)

Submit in batches during week 1–2. Each requires the SaaS/alternative positioning variant.

| # | Directory | URL | Positioning Angle |
|---|-----------|-----|-------------------|
| 11 | **AlternativeTo** | https://alternativeto.net | "here.now alternative for AI agents" — massive SEO value despite nofollow |
| 12 | **SaaSHub** | https://saashub.com | API-first publishing platform for AI agents. Ranks well for "[tool] alternatives" |
| 13 | **G2** | https://g2.com | "API management for AI agents" category. Free listing. Run 10-in-30 review protocol (see below) |
| 14 | **Capterra** | https://capterra.com | "Developer tools / API management" category. Auto-syncs from Gartner Digital Markets |
| 15 | **GetApp** | https://getapp.com | Syncs from Capterra. One submission covers both |
| 16 | **F6S** | https://f6s.com | Startup community. Good for early-stage visibility |
| 17 | **SourceForge** | https://sourceforge.net | Open-source project listing. We're on GitHub — claim it |
| 18 | **Slashdot** | https://slashdot.org | Tech audience. High DR backlink |
| 19 | **Startup Stash** | https://startupstash.com | Curated, organized by startup need |
| 20 | **Stackshare** | https://stackshare.io | Dev-centric. Show tech stack |
| 21 | **TrustRadius** | https://trustradius.com | Smaller but respected B2B review platform |

### Tier 3 — AI Directories (Week 1–3)

AI-first positioning. Lead with agent architecture and Ed25519 identity.

#### Tier 3A — Flagship AI Directories

| # | Directory | URL | DR | Positioning Angle |
|---|-----------|-----|----|-------------------|
| 22 | **There's An AI For That (TAAFT)** | https://theresanaiforthat.com | 76 | "AI agent publishing API — agents publish their own output" |
| 23 | **Futurepedia** | https://futurepedia.io | 70 | "AI tool for agent publishing — Ed25519 identity, no accounts" |
| 24 | **Toolify** | https://toolify.ai | 71 | AI developer tools category |
| 25 | **Future Tools** | https://futuretools.io | 69 | "AI agent infrastructure — where agent output lives" |
| 26 | **AI Tools Neilpatel** | https://neilpatel.com/aitools | 91 | Highest DR free AI directory |
| 27 | **Good AI Tools** | https://goodaitools.io | 66 | Curated, quality over quantity |

#### Tier 3B — Mid-Tier AI Directories

| # | Directory | URL | Est. DR | Positioning Angle |
|---|-----------|-----|---------|-------------------|
| 28 | **aitools.inc** | https://aitools.inc | ~66 | "10x your agent output" angle |
| 29 | **AIStage** | https://aistage.org | ~66 | Developer tools / AI infrastructure |
| 30 | **AItrendytools** | https://aitrendytools.com | ~69 | Comprehensive listing |
| 31 | **Grabon AI Directory** | https://grabon.ai | ~70 | High DR, broad audience |
| 32 | **TopAI.tools** | https://topai.tools | ~60 | Task-based search, like TAAFT |
| 33 | **Supertools** | https://supertools.theresanaiforthat.com | ~61 | TAAFT's tools subset |
| 34 | **AI Tools Directory** | https://aitoolsdirectory.com | ~55 | Curated; featured placement available |
| 35 | **LogicBalls** | https://logicballs.com | ~40 | 3,500+ verified tools |
| 36 | **SaasAITools** | https://saasaitools.com | ~30 | SaaS + AI crossover |
| 37 | **PoweredByAI** | https://poweredbyai.org | ~35 | Growing directory with newsletter reach |
| 38 | **TheAISurf** | https://theaisurf.com | ~30 | Newer, actively promoting submissions |
| 39 | **Dofollow.Tools** | https://dofollow.tools | ~30 | Explicitly free dofollow backlinks |
| 40 | **NewTools.site** | https://newtools.site | 51 | Dofollow backlink for every approved submission |

### Tier 4 — Agent/MCP Registries (Week 1–3)

Niche but high-intent. Our strongest differentiation is here.

| # | Directory | URL | Positioning Angle |
|---|-----------|-----|-------------------|
| 41 | **Glama MCP Registry** | https://glama.ai/mcp/servers | MCP server directory. Optimize for A/B grade. Our skill is already published here |
| 42 | **Smithery** | https://smithery.ai | MCP server marketplace. Agent-focused |
| 43 | **MCP.run** | https://mcp.run | MCP server directory |
| 44 | **AI Agents List** | https://aiagentslist.com | Hosts the 593+ MCP server directory |
| 45 | **APITracker MCP directory** | https://apitracker.io | 110+ servers, 90 official integrations |
| 46 | **Linux Foundation MCP Registry** | https://github.com/modelcontextprotocol | PR-based submission, low volume but high signal. Anthropic donated MCP to LF Dec 2025 |
| 47 | **AI Agent Store** | https://aiagentstore.co | Compare agents, platforms, frameworks |
| 48 | **AgentHunter** | https://agenthunter.io | "Discover the best AI agents" |

### Tier 5 — No-Code/Low-Code (Week 2–3)

Limited fit for ZenBin, but worth 1–2 targeted submissions.

| # | Directory | URL | Positioning Angle |
|---|-----------|-----|-------------------|
| 49 | **NoCodeFinder** | https://nocodefinder.com | "No-code API for agent publishing — just curl" |
| 50 | **No Code MBA Tools Directory** | https://nocode.mba/tools | Categorized by project type |

### Tier 6 — "Best Of" Listicles (Rolling Outreach, Week 2+)

Cold outreach to blog authors writing "best AI agent tools" or "best developer APIs" lists.

| Target | Approach |
|--------|----------|
| Bloggers writing "best AI agent tools" lists | Personal email: "Saw your list of [topic]. ZenBin does something none of these cover — it's where agent output goes. Worth including? Happy to give you a free account." |
| Dev bloggers on agent infrastructure | Share the `/.well-known/agent.md` approach as a technical angle |
| AI newsletter authors (Ben's Bites, The Rundown, TLDR AI) | Offer exclusive data: "We analyzed 10K agent publishes and found [insight]" |
| Comparison site authors | "here.now vs ZenBin" — offer comparison data |

**Outreach template:**
> Hey [name], saw your post on [best X tools]. We launched ZenBin recently — a publishing API for AI agents. It does something none of the tools on your list cover: agents sign their own output with Ed25519 keypairs, no user accounts needed. Worth including? Happy to give you a free Pro account + credits for readers. 60s demo: [link]. No worries if not a fit.

**Target:** 10 inclusions in 30 days. Each = dofollow backlink from DR 40–70 + referral traffic + AI citation fuel.

### Tier 7 — Integration Marketplaces (When Integrations Ship)

These are the highest-DR backlinks available — worth engineering effort just to land them.

| # | Directory | DR | When |
|---|-----------|-----|------|
| - | **Zapier App Directory** | 91 | When Zapier integration ships |
| - | **npm** | 92 | Publish Node.js SDK package |
| - | **PyPI** | 91 | Publish Python SDK package |
| - | **Slack App Directory** | 89 | When Slack notification integration ships |

### G2 / Capterra 10-in-30 Review Protocol

G2 and Capterra listings are **worthless without reviews**. 10 reviews is the magic threshold for Grid appearance.

1. **Day 1 post-launch:** Identify 20 users who have completed a meaningful action (published a page, registered a keypair)
2. **Send each a personal email** with a direct review URL (reduces friction by ~70%). No forms, no landing pages — direct link
3. **Offer a modest thank-you.** G2 and TrustRadius allow small incentives like a $25 Amazon gift card
4. **Follow up once** after 5 days. Don't follow up twice
5. **Target:** 50% conversion → 10 reviews from 20 asks

**Critical deadlines:**
- G2 Summer reports: cut off ~April 28
- G2 Fall reports: cut off ~July 28
- Missing a cutoff means waiting 3 months

**G2 free tier is sufficient for year one.** The free listing + "Users Love Us" badge (requires 20 reviews at 4.0+) is enough. Do not spend on paid G2 ($2,999+/year) until month 6+.

---

## 3. Community Engagement Plan

### Hacker News

**Strategy:** Technical depth wins on HN. Lead with the architecture, not the marketing.

**Pre-launch (14 days before):**
- Comment 3–5 times/day on threads about: AI agent infrastructure, API design, developer experience, self-hosting, cryptographic auth, agent identity
- Focus on threads with <50 comments for visibility
- Be genuinely useful. Share experience, not product
- Trigger topics: "How do I get agent output to a URL?", "Agent identity without OAuth", "Self-hosted publishing for agents"
- Build karma to 100+ before launch day

**Launch day:**
- Post Show HN between 8–10 AM ET (peak HN traffic)
- Title: "Show HN: ZenBin – A publishing API for AI agents with Ed25519 signing"
- First comment: The "why I built this" story — focus on the gap in agent infrastructure, not the features
- Reply to every comment within 30 minutes
- Technical questions get technical answers with code. "How does the signing work?" → detailed explanation with canonical string construction
- Resist the urge to over-promote. Let the product speak

**Post-launch:**
- Write a launch recap: "What we learned launching ZenBin on HN" — honest, with numbers
- Cross-post to r/SaaS (where promotion is allowed)
- Continue commenting on HN agent/infrastructure threads — long-term presence

### Reddit

**Strategy:** 90/10 rule — 90% genuinely helpful, 10% promotional. Only mention ZenBin when it naturally answers a question.

**Target subreddits (ranked by fit):**

| Subreddit | Members | Fit | Strategy |
|-----------|---------|-----|----------|
| **r/LocalLLaMA** | 500K+ | ★★★★★ | Agent workflows, self-hosted tools. Our most natural audience. Technical deep-dives welcome |
| **r/ChatGPTCoding** | 300K+ | ★★★★★ | Agent builders, coding assistants. "Where does your agent's output go?" |
| **r/SideProject** | 200K+ | ★★★★ | Friendly to promo. Launch announcements welcome |
| **r/SaaS** | 300K+ | ★★★★ | "Share Your SaaS" threads are explicit promo windows |
| **r/startups** | 1.7M | ★★★ | Feedback Friday thread only |
| **r/selfhosted** | 200K+ | ★★★ | Self-hosted alternative. Emphasize open source and MIT license |
| **r/IndieHackers** | 50K+ | ★★★ | Build-in-public stories. Revenue updates welcome |
| **r/artificial** | 3M+ | ★★ | Broad AI audience. Strict — technical content only |
| **r/webdev** | 1M+ | ★★ | API design angle. Strict — no self-promo outside specific threads |

**Content playbook:**
- **What wins:** Real numbers (MRR, signups, usage), screenshots, "what I tried / what happened / what I'd do differently" structure, mini case studies with clear lessons
- **What fails:** Hype, vague claims, "check out my new tool" posts, asking for upvotes
- **Trigger topics where ZenBin fits naturally:**
  - "How do I get my agent's output to a URL?"
  - "What's the simplest way to publish agent-generated content?"
  - "Looking for a simple API to host agent dashboards"
  - "How should agents authenticate? OAuth is overkill"
  - "Agent identity without user accounts"

**Post-launch (first 30 days):**
- r/SideProject: "Launched ZenBin — a publishing API for AI agents. Here's what happened"
- r/SaaS: "Share Your SaaS" thread — concise value prop
- r/LocalLLaMA: Technical deep-dive on Ed25519 auth and `/.well-known/agent.md` — genuine educational content
- r/IndieHackers: Weekly build-in-public updates with real numbers

### Twitter/X (@flowing_zed)

**Strategy:** Build-in-public. Technical depth. Engage with agent ecosystem. Don't just broadcast.

**Pre-launch (14 days before):**
- 5–10 replies/day to posts about agent infrastructure, dev tools, open source
- Key accounts: AI agent framework maintainers (LangChain, CrewAI, AutoGPT), dev tool builders (Vercel, Supabase, Railway), indie hackers in the agent space
- Key accounts from ICP research: @karpathy (HTML as agent output narrative), htmlship (@trq212), pageshelf builders, MCP server builders
- Share mini-insights: "Ed25519 vs JWTs for agent auth", "Why agents need their own identity layer", "The gap in agent infrastructure nobody talks about: output"

**Launch day:**
- Thread announcing launch (5–8 tweets): Problem → Solution → How it works → Pricing → Try it → Open source
- Pin the launch thread
- Reply to every quote-tweet and mention within 1 hour
- Share HN link, PH link, and blog post in separate tweets (not thread)

**Post-launch cadence (3–5 posts/week):**
1. **Build-in-public updates** (1/week): "Day N of launching ZenBin. [metric] users, [lesson learned]"
2. **Technical deep-dives** (1/week): Ed25519 signing, `/.well-known/agent.md`, agent identity standards, comparison threads ("JWTs vs Ed25519 for agent auth")
3. **Reply/engage** (2–3/week): Thoughtful replies to agent ecosystem conversations
4. **Share others' work** (1/week): Amplify complementary projects (Airbyte Agents, MCP servers, agent frameworks)
5. **Opinionated takes** (1/2 weeks): "Agents don't need OAuth. Here's why." "HTML is the universal agent output format. Here's what nobody's built yet."

**Content formats that perform for dev tools:**
- Architecture diagrams with explanations
- Short code demos (curl commands, response output)
- Comparison threads ("JWTs vs Ed25519 for agent auth")
- Threaded stories ("I spent X months building a publishing API for agents. Here's what I learned.")

### Indie Hackers

- Launch a build-in-public thread on launch day
- Post weekly updates: revenue, ships, lessons. Zero-revenue posts work if the lesson is honest
- Comment 10× more than you post to build karma before sharing your own links
- Cross-post launch recap and technical deep-dives

### Dev.to + Hashnode

- Every substantial technical post = dofollow backlink + dev audience reach
- Cross-post with canonical URL back to main blog
- Topics: Ed25519 signing tutorial, `/.well-known/agent.md` spec, agent identity standards

---

## 4. Launch Day Timeline

**Target day:** Tuesday or Wednesday (highest PH traffic). Avoid weekends (60–70% less traffic).

| Time (UTC) | Time (PT) | Action |
|-----------|-----------|--------|
| **07:01** | 12:01 AM | 🚀 **Product Hunt launch goes live** (12:01 AM PT start maximizes 24h window) |
| **07:15** | 12:15 AM | Post first maker comment on PH: the "why I built this" story — focus on the gap in agent infrastructure |
| **07:30** | 12:30 AM | Email blast to warm list: "We just launched on PH. Here's what to expect." Ask for **feedback**, not upvotes |
| **08:00** | 1:00 AM | Twitter/X launch thread goes live |
| **08:30** | 1:30 AM | Blog post published: "Why AI Agents Can't Publish What They Build" |
| **12:00** | 5:00 AM | **Show HN posted** (8–10 AM ET = peak HN traffic window) |
| **12:15** | 5:15 AM | First comment on Show HN: technical details, open source link, `/.well-known/agent.md` link |
| **12:30** | 5:30 AM | Reddit posts: r/SideProject, r/SaaS (Share Your SaaS thread) |
| **13:00** | 6:00 AM | LinkedIn post (if applicable) |
| **13:00–20:00** | 6 AM – 12 PM | **Active engagement window** — team monitors and responds to: |
| | | - Every PH comment (within 30 min) |
| | | - Every HN comment (within 30 min) |
| | | - Every Reddit comment |
| | | - Every Twitter/X reply |
| | | - DMs to power users |
| **14:00** | 7:00 AM | Share HN link on Twitter/X |
| **15:00** | 8:00 AM | Share blog post on Twitter/X |
| **16:00** | 9:00 AM | Cross-post blog to dev.to and Hashnode |
| **17:00** | 10:00 AM | Second HN comment wave — reply to deeper technical questions |
| **18:00** | 11:00 AM | Share usage stats if available: "X users have published Y pages in the first Z hours" |
| **19:00** | 12:00 PM | Personal DMs to 10–15 key supporters asking for genuine feedback |
| **20:00** | 1:00 PM | Submit to Tier 1 directories: BetaList, DevHunt, Fazier, Uneed, Microlaunch |
| **21:00–07:00** | 2 PM – 12 AM | Continue responding. Monitor for issues. Fix any site problems immediately. |
| **Day end** | | PH 24-hour window closes. Note final position. Thank everyone publicly. |

### Launch Day Rules

1. **Never ask for upvotes.** Ask for **feedback**. "Would love your honest take on the positioning" converts 3× better and doesn't trigger PH's anti-manipulation filters
2. **Reply to every comment within 30 minutes.** PH measures maker responsiveness. HN rewards technical depth
3. **Technical questions get technical answers.** Show code. Explain architecture. This is our strength
4. **Don't message strangers on PH.** The community flags this and moderators will hide your post
5. **If the site goes down, acknowledge it immediately.** Honesty beats silence
6. **Capture every mention.** Screenshots, bookmarks, quote-tweets. This is social proof for later

---

## 5. Post-Launch Momentum Plan (First 30 Days)

### Week 1: Ride the Wave

| Day | Action |
|-----|--------|
| Day 1 | Launch day (see timeline above) |
| Day 2 | Publish launch recap blog post: "What we learned launching ZenBin on HN" — honest, with numbers |
| Day 2 | Cross-post recap to Indie Hackers and r/SaaS |
| Day 2–3 | Follow up with every PH commenter and HN commenter who asked thoughtful questions |
| Day 3 | Submit to Tier 2 directories: AlternativeTo, SaaSHub, G2, Capterra, F6S, SourceForge |
| Day 3 | Begin Tier 3A directory submissions (TAAFT, Futurepedia, Toolify, Future Tools) |
| Day 4 | Publish technical deep-dive: "How Ed25519 Key-Based Auth Works for AI Agents" |
| Day 4 | Cross-post to dev.to and Hashnode |
| Day 5 | Submit to remaining Tier 3 directories (batch of 5–8) |
| Day 5 | Submit to Tier 4: MCP/agent registries (Glama, Smithery, MCP.run, AI Agents List) |
| Day 6 | First build-in-public update on Twitter/X: metrics, learnings, what's next |
| Day 7 | Review first-week metrics. Adjust positioning if something's not resonating |

### Week 2: Compound

| Day | Action |
|-----|--------|
| Day 8 | Publish comparison page: `/alternatives/here-now` |
| Day 9 | Publish use-case page: `/for/ai-agents` |
| Day 10 | Start "10-in-30" G2 review protocol: email 20 users with direct review link |
| Day 10 | Submit to Tier 5 directories (NoCodeFinder) |
| Day 11 | Publish blog post: "The Agent Output Problem" — broader than ZenBin, establishes thought leadership |
| Day 12 | Engage on HN/Reddit: 3–5 substantive comments/day on agent infrastructure threads |
| Day 13 | Publish comparison page: `/alternatives/github-pages` |
| Day 14 | Second build-in-public update: 2-week metrics, most surprising finding |

### Week 3–4: Deepen

| Day | Action |
|-----|--------|
| Day 15 | Publish use-case page: `/for/developers` |
| Day 15 | Begin Tier 6 outreach: cold-email 10 "best of" listicle authors |
| Day 16 | Publish blog post: "Agent Identity Standards Are Coming — Here's What It Means" (IETF draft, WIMSE, did:key) |
| Day 17 | Cross-post to dev.to, share on HN/Reddit as discussion |
| Day 18 | Publish comparison page: `/alternatives/netlify` |
| Day 19 | Third build-in-public update: 3-week metrics, user stories |
| Day 20 | Submit to remaining directories not yet covered |
| Day 21 | Publish tutorial: "Publish Your First AI Agent Page in 5 Minutes" with curl walkthrough |
| Day 22 | Share tutorial on r/LocalLLaMA, r/ChatGPTCoding |
| Day 23 | Engage with 5 new Twitter/X accounts in the agent ecosystem |
| Day 24 | Publish blog post: "Why Agents Don't Need OAuth" — opinionated take |
| Day 25 | Cross-post, share on HN |
| Day 26 | Publish use-case page: `/for/open-source` |
| Day 27 | Fourth build-in-public update: 4-week metrics, biggest lessons |
| Day 28 | Write "best AI agent tools" listicle on own blog (include competitors honestly) — serves as both content and AI citation fuel |
| Day 29 | Outreach to 5 AI newsletters for inclusion |
| Day 30 | **Month 1 review:** Compile all metrics, identify what worked, adjust plan for month 2 |

### Destination Pages Strategy

Directories are useless if backlinks land on a generic homepage. Build these **before** submitting directories — they're where the link equity converts.

**Priority destination pages (build first):**

1. **Alternative pages** (highest ROI, 5–15% conversion):
   - `/alternatives/here-now` — targeting "here.now alternative"
   - `/alternatives/github-pages` — targeting "github pages for agents"
   - `/alternatives/netlify` — targeting "netlify for agents"
   - `/alternatives/vercel` — targeting "vercel for agents"

2. **Use-case / ICP pages:**
   - `/for/ai-agents` — "publishing API for AI agents"
   - `/for/developers` — "developer API for publishing web pages"
   - `/for/open-source` — "open source publishing API"

3. **"Best of" listicle (self-authored):**
   - `/blog/best-ai-agent-publishing-tools-2026` — honest round-up including competitors

Each destination page needs:
- Single `<h1>` with the target keyword
- Sequential heading hierarchy (H2, H3 — no skipping levels)
- 150+ words of substantive content
- Comparison table (for alternative pages)
- FAQ section with `FAQPage` JSON-LD schema
- 3–5 use-case examples
- Clear CTA to ZenBin signup

### Content Cadence Summary (Ongoing)

| Frequency | Content |
|-----------|---------|
| 2/week | Blog posts (1 technical, 1 thought leadership) |
| 3–5/week | Twitter/X posts (build-in-public, technical, replies) |
| 3–5/day | HN comments (substantive, not promotional) |
| 2–3/day | Reddit comments |
| 1/week | Build-in-public metric update |
| Rolling | Directory submissions (2–3/day until target hit) |
| Monthly | AI citation check (ask ChatGPT, Claude, Perplexity about agent publishing tools) |

---

## 6. Success Metrics and KPIs

### Primary KPIs (Track Weekly)

| Metric | Day 0 Baseline | Day 30 Target | Day 90 Target |
|--------|---------------|---------------|---------------|
| **Domain Rating (DR)** | 0 | 20 | 30+ |
| **Referring domains** | 0 | 30 | 80+ |
| **Indexed pages** | — | 50 | 200+ |
| **Organic clicks/day** | 0 | 30 | 200+ |
| **Directory listings live** | 0 | 30 | 50+ |
| **G2 reviews** | 0 | 10 | 25 |
| **Capterra reviews** | 0 | 5 | 15 |
| **Signups (total)** | 0 | 500 | 2,000+ |
| **Pages published** | 0 | 1,000 | 10,000+ |
| **API calls/day** | 0 | 200 | 2,000+ |

### Launch Day Metrics

| Metric | Target |
|--------|--------|
| Product Hunt upvotes | 100+ |
| Product Hunt comments | 30+ |
| Product Hunt ranking | Top 5 for the day |
| HN points | 50+ |
| HN comments | 30+ |
| Twitter/X impressions (launch thread) | 10,000+ |
| Signups on launch day | 100+ |
| Pages published on launch day | 50+ |
| Site uptime | 99.9%+ |

### AI Citation Metrics (Monthly Manual Check)

Ask ChatGPT, Claude, and Perplexity: "What are the best AI agent publishing APIs?" and "What's an alternative to here.now?" Log where ZenBin appears.

| Metric | Day 30 Target | Day 90 Target |
|--------|---------------|---------------|
| AI citations (ChatGPT) | Mentioned | Top 3 |
| AI citations (Claude) | Mentioned | Top 3 |
| AI citations (Perplexity) | Mentioned | Top 3 |
| "here.now alternative" Google ranking | Page 1 | Top 5 |

### Community Engagement Metrics

| Metric | Day 30 Target | Day 90 Target |
|--------|---------------|---------------|
| HN karma from agent/infra comments | 100+ | 300+ |
| Reddit karma (r/LocalLLaMA, r/ChatGPTCoding) | 50+ | 200+ |
| Twitter/X followers (@flowing_zed) | 200+ | 500+ |
| Twitter/X engagement rate | 3%+ | 5%+ |
| Monthly HN comments | 50+ | 75+ |
| Monthly Reddit comments | 30+ | 50+ |
| Community DAU/MAU (if Discord/Slack launched) | — | 20%+ |

### Revenue Targets (Longer Term)

| Metric | Day 30 | Day 90 | Day 180 |
|--------|--------|--------|---------|
| Free tier users | 500 | 2,000 | 5,000 |
| Pro subscribers | 10 | 50 | 200 |
| Enterprise subscribers | 0 | 2 | 5 |
| MRR | $30 | $150 | $600 |

---

## Quick Reference: Key URLs and Assets

| Asset | URL/Location |
|-------|-------------|
| Product | https://zenbin.org |
| Agent docs | https://zenbin.org/.well-known/agent.md |
| GitHub | https://github.com/TWilson63/ZenBin |
| Show HN draft | `marketing/show-hn.md` (needs creation) |
| Engagement plan | `marketing/engagement-plan.md` (needs creation) |
| Agent landscape | `marketing/agent-landscape.md` (needs creation) |
| AI SEO strategy | `marketing/ai-seo-strategy.md` |
| Content calendar | `marketing/content-calendar.md` |
| Social posts | `marketing/social-posts.md` |
| Pricing analysis | `marketing/pricing-analysis.md` |
| Landing review | `marketing/landing-review.md` |
| ICP research | `marketing/icp-discovery-x-research.md` |
| Twitter/X | @flowing_zed |
| Blog | https://zed.zenbin.org |

---

*This plan synthesizes the launch-strategy, directory-submissions, and community-marketing skill frameworks with our existing marketing materials. It's a living document — update as we learn.*