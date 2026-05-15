# ZenBin Landing Page — Copywriting & CRO Review

**Date:** 2026-05-14  
**Frameworks applied:** Marketing Copywriting Skill v1.1.0, Page CRO Skill v1.1.0  
**Voice reference:** tone.md (Rakis's writing style)

---

## Executive Summary

ZenBin's landing page has strong foundations — clean design, a clear terminal aesthetic, and a genuine product. But the copy leans too hard on feature-description language and doesn't convert the way it could. The biggest problems:

1. **Headline describes what ZenBin does, not what it's for.** "Publish agent output as live web pages" is accurate but doesn't hit the pain.
2. **Zero social proof.** No logos, no testimonials, no usage stats (the counter loads empty and hides on failure).
3. **CTAs speak to the wrong audience at the wrong time.** "agent setup" and "see the publish api" are developer on-ramps, not conversion actions.
4. **The page explains how before explaining why.** The terminal block, features, and use cases all describe mechanics — but a visitor who doesn't yet feel the problem won't care about the mechanism.

The fix isn't a redesign. It's a reframe: lead with the outcome, add trust signals, and point CTAs at the next step that matters to each visitor.

---

## 1. Hero Section Critique

### Headline

**Current:** `publish agent output as live web pages.`

**Issues:**
- **Feature, not benefit.** This says *what* ZenBin does. It doesn't say *why anyone should care*. Compare: "Slack lets you share files instantly" vs. "Need to share a screenshot?" — the copywriting skill is clear: benefit over feature.
- **No pain point.** The CRO framework ranks value proposition clarity as the highest-impact dimension. A visitor in 5 seconds should understand both what this is *and* why they need it. "Publish agent output as live web pages" only answers the first.
- **Passive framing.** "Publish agent output" is descriptive, not active. It doesn't create urgency or identification.

**Rakis voice check:** "Agents don't need another dashboard. They need a place to publish." The current headline has the right *domain* but the wrong *punchline*. It's describing the mechanism, not reframing the problem.

**Rewritten options:**

| Option | Copy | Rationale |
|--------|------|-----------|
| A | **Your agents build things nobody can see.** | Punchline-first. Reframes the problem. Creates identification. |
| B | **Agents write code. Generate reports. Build dashboards. Then what?** | Series that builds. Creates urgency through the gap. |
| C | **Stop pasting agent output into emails.** | Concrete pain. The "then what" that Rakis's style lives in. |

Subhead for Option A:
> ZenBin gives agents their own web presence — publish HTML, Markdown, images, and video to stable URLs with one signed request. No server. No deploy step. Just publish.

Subhead for Option C:
> Publish agent output to stable URLs with a single signed request. Reports, dashboards, docs, demos — live on the web in seconds.

### Badge

**Current:** `$ signed publishing for ai agents`

This is fine as a positioning tag — it tells the technical audience exactly what this is. But it's *above* the headline, which means it's the first thing a cold visitor reads. For cold traffic, lead with the outcome, not the mechanism.

**Recommendation:** Keep the badge but test alternatives:
- `$ agents that ship to the web` — outcome-focused
- `$ the web layer for ai agents` — category-creation signal

### Subtitle

**Current:** `zenbin lets agents publish html, markdown, images, and videos to stable urls with signed http requests. use it for reports, dashboards, docs, demos, microsites, and handoff pages.`

**Issues:**
- **Restates the headline in longer form.** The subtitle should add specificity or emotional weight, not just repeat the mechanism with more words.
- **"lets agents publish"** — passive, vendor-speak. The copywriting skill says: "Use active over passive."
- **The use-case list is good** — it grounds the abstract in the concrete. But it's buried in a sentence that starts with mechanism.

**Rewritten:**
> Reports, dashboards, docs, demos, microsites — whatever your agent builds, ZenBin makes it a live URL. One signed request. No server, no deploy pipeline, no guessing.

This leads with the use cases (what they *make*), then follows with the mechanism (how *easy* it is).

### CTA Buttons

**Current:** `$ agent setup` (primary) / `// see the publish api` (secondary)

**Issues:**
- **"agent setup" is an on-ramp, not an outcome.** The copywriting skill's CTA guidelines are explicit: "Communicate what they get." "Start Free Trial" > "Sign Up". "Agent setup" is "Sign Up" energy — it describes the process, not the value.
- **"see the publish api" is even more process-oriented.** This is docs navigation, not a conversion action.
- **The `$` and `//` decorators are on-brand** and should stay — but the *words* need to carry their weight.

**Rewritten:**
- Primary: `$ start publishing →` or `$ get your agent online →`
- Secondary: `// read the docs` or `// see how it works`

These say *what you get*, not *what step you take*.

---

## 2. Above-the-Fold Analysis

The above-the-fold stack (on a 1080p desktop) is:

1. Nav bar (fixed)
2. Badge: `$ signed publishing for ai agents`
3. Stats counter (pages published / agents registered)
4. Headline: `publish agent output as live web pages.`
5. Subtitle (long paragraph)
6. Two CTA buttons
7. Agent Prompt Box (copy-paste prompt)
8. Terminal block (3-step workflow)

**Problems:**

- **Too much content above the fold.** The hero contains 8 distinct elements. The CRO framework asks: "Can someone scanning get the main message?" With this much density, scanning is hard. The eye doesn't know where to land.
- **The stats counter is empty on load.** It shows `---` then fetches `/v1/stats`. If the fetch fails, it hides entirely. This is worse than no counter — it's a trust negative. Show real numbers or remove it until you have them.
- **The terminal block belongs in "How It Works", not above the fold.** It explains the *mechanism* before the visitor has bought into the *value*. Move it down and let the hero breathe.
- **The agent prompt box is clever** (copy-paste ready for AI tools) but it's competing with the primary CTA. Two action blocks above the fold = zero clear action.

**Recommendation:**
- Strip the hero to: badge → headline → subtitle → CTA buttons.
- Move the terminal block to the "How It Works" section.
- Move the agent prompt box to immediately after "How It Works" (where the visitor has context to understand it).
- Fix or remove the stats counter. If you have <1000 pages, don't show a counter. Use a different trust signal (see Section 4).

---

## 3. Value Proposition Clarity

**The CRO framework's #1 dimension:** Can a visitor understand what this is and why they should care within 5 seconds?

**Current state:** A technical visitor who already knows they need this — yes, they'll get it fast. The terminal aesthetic, the `$` prompts, the code-first language all signal "built for developers." That's fine.

**The problem is the cold visitor.** Someone who heard "AI agents" and landed here. The page doesn't answer:

1. **What problem does this solve?** (Agents generate output that dies in chat logs and terminals.)
2. **Who is it for?** (The page says "agents" but the buyer is the *developer* who runs agents.)
3. **Why is this different from just deploying a static site?** (Signed keys, no server, one-request publish — these are advantages, but they're never stated as advantages over alternatives.)

**The "How It Works" section exemplifies this.** Its title: `fast enough for agents. simple enough to keep working.` That's good copy — it's an outcome statement. But the step cards underneath describe *mechanics* (read skill file, bundle output, update later), not *benefits*.

**Rewritten "How It Works":**

Title: `three steps. no server. no deploy pipeline. just publish.`

| Step | Current | Rewritten |
|------|---------|-----------|
| 1 | `$ read` — read the skill file | `$ read` — your agent reads the publish contract. no guessing. |
| 2 | `$ package` — bundle the output | `$ publish` — one signed request. your page is live. |
| 3 | `$ reuse` — update pages later | `$ update` — same key, same url. republish anytime. |

Each step now ends with a *benefit*, not a *description*.

**The features section** has the same issue. Each feature card names a feature (`$ signed_writes`, `$ subdomains`) and then describes *what it does*. The copywriting skill says: "Features: What it does. Benefits: What that means for the customer." None of these explain the *benefit*.

Example: `$ signed_writes` — "publish with ed25519 signed requests. the key that creates a page owns future updates."

That's the *mechanism*. The *benefit* is: no auth service, no API keys to rotate, no access control layer. Your agent owns what it creates. Period.

**Rewritten feature cards:**

| Feature | Current title | Rewritten title | Rewritten description |
|---------|---------------|-----------------|----------------------|
| Signed writes | `$ signed_writes` | `$ your key, your pages` | Ed25519 signed requests. The key that creates a page owns it. No auth service, no token rotation. |
| Subdomains | `$ subdomains` | `$ claim your namespace` | Claim a subdomain once. Your agent keeps publishing under it. Reports, docs, microsites — all yours. |
| Mixed content | `$ mixed_content` | `$ html, markdown, and media — one publish` | Store HTML, Markdown, and a binary asset in a single request. Rendered view, source doc, and media URL, all from one page. |
| Independent encoding | `$ independent_encoding` | `$ no escaping nightmares` | Base64-encode HTML, Markdown, or both. Send clean JSON without fighting template strings or nested quotes. |
| Media support | `$ media_support` | `$ images and videos, not just text` | Publish image and video assets. Binary-only pages resolve directly. Mixed pages expose `/image` and `/video` endpoints. |
| Predictable reads | `$ predictable_reads` | `$ humans and agents get the same url` | Five clear read endpoints: `/p`, `/raw`, `/md`, `/image`, `/video`. No guessing what's stored or how to fetch it. |

---

## 4. Social Proof Gaps

**This is the single biggest conversion gap on the page.**

The CRO framework lists trust signals as a critical dimension: customer logos, testimonials, case study snippets, review scores, security badges. The current page has **none of these**.

The only trust signal is the stats counter, which:
- Loads empty (shows `---`)
- May hide on fetch failure
- Doesn't say who these agents belong to or what they built

**Recommendations — ranked by impact:**

### 4.1 Add testimonials (highest impact)
Even 2-3 short quotes from developers who use ZenBin. Format:

```
"ZenBin is the missing piece — my agent generates weekly reports and 
they're just... live. No CI, no S3, no static site generator."
— Developer name, project/context
```

Place these: one in the hero (after subtitle, before CTAs), and a dedicated section between Features and Pricing.

### 4.2 Add example URLs (quick win)
The use-case section shows code snippets but not *live links*. Add real published URLs for each use case:

```
> reports
→ https://weekly-report.zenbin.org
```

Seeing a live, clickable URL that resolves to a real page is more convincing than any description.

### 4.3 Fix the stats counter
Either:
- Hard-code impressive numbers ("1,000+ pages published"), or
- Remove it until you have real numbers worth showing
- If keeping dynamic, show a graceful fallback ("publishing now...") instead of `---`

### 4.4 Add a "Used by" section
Even 3-4 logos or names of agents/tools/projects that publish through ZenBin. If real users don't exist yet, use your own usage: "Zed publishes blog posts through ZenBin. The whiteboard skill publishes through ZenBin."

### 4.5 Add a trust line near the CTA
Something like: `open source · mit license · no credit card required` — these reduce friction for the signup moment.

---

## 5. CTA Placement and Copy

### Current CTAs on the page:

| Location | Copy | Style |
|----------|------|-------|
| Nav | `agent setup` | Green button |
| Hero primary | `$ agent setup` | Green button |
| Hero secondary | `// see the publish api` | Bordered link |
| Pricing free | `free with agent registration →` | Text link |
| Pricing pro | `upgrade to pro →` | Green button |
| Pricing enterprise | `upgrade to enterprise →` | Bordered link |
| Footer | `$ agent setup` (repeated) / `// see the api` | Buttons |

### Problems:

1. **Every CTA points to the same place** — `/.well-known/agent.md`. This is a technical document, not a conversion moment. It's asking the visitor to read instructions before they've decided they want the product.
2. **No "try it" or "see it live" CTA.** The strongest conversion action for a developer tool is *seeing it work*. There should be a demo/example CTA.
3. **The secondary CTA ("see the publish api") scrolls to the API section.** This is fine but it's the *only* secondary path, and it's "read more docs" rather than "see it in action."
4. **Pricing CTAs all go to the same agent.md page.** The free tier CTA should go to a registration flow. The paid tiers should go to a billing setup. Sending everyone to a technical spec is a friction point.
5. **Footer CTA repeats hero CTA verbatim.** The footer CTA section should make a closing argument — a different angle on the value proposition — not repeat the same words.

### Recommended CTA strategy:

| Location | Primary CTA | Secondary CTA |
|----------|-------------|---------------|
| Nav | `get started` → agent.md | (none) |
| Hero | `$ start publishing →` | `// see examples` → use-cases |
| Use cases (after each card) | `try it →` | |
| Pricing free | `register your agent →` | |
| Pricing pro | `upgrade to pro →` | |
| Pricing enterprise | `upgrade to enterprise →` | |
| Footer headline | Different closing argument (see Section 6) | |
| Footer primary | `$ start publishing →` | `// read the docs` |

**CTA hierarchy principle (from CRO skill):** One clear primary action. Secondary CTAs for people who aren't ready yet. Currently there's no secondary path for "I'm interested but not ready to register" — add one.

---

## 6. Rewritten Copy Suggestions

All rewritten copy follows Rakis's voice: direct, punchline-first, concrete-over-abstract, no hedging, no buzzwords.

### Hero Section

**Badge:**
```
$ the web layer for ai agents
```

**Headline:**
```
your agents build things
nobody can see.
```

**Subtitle:**
```
Reports, dashboards, docs, demos — whatever your agent generates, 
ZenBin makes it a live URL. One signed request. No server, no deploy 
pipeline, no guessing.
```

**Primary CTA:**
```
$ start publishing →
```

**Secondary CTA:**
```
// see examples
```

### How It Works

**Section title:**
```
three steps. no server. no deploy pipeline. just publish.
```

**Step 1:**
```
$ read
your agent reads the publish contract
no guessing — the skill file has everything.
```

**Step 2:**
```
$ publish
one signed request, one live page
html, markdown, images, video — send it all at once.
```

**Step 3:**
```
$ update
same key, same url, new content
republish anytime. the page stays live.
```

### Features

**Section title:**
```
built for how agents actually work.
```

**Section subtitle:**
```
no auth service. no deploy step. no guessing what endpoint to hit.
```

(Feature card rewrites in Section 3 above.)

### Use Cases

**Section title:**
```
what agents publish with ZenBin
```

**Section subtitle:**
```
if your agent builds it, ZenBin makes it a URL someone can open.
```

Each use-case card should include a live example URL, not just a code snippet. Show, don't tell.

### Pricing

**Section title:**
```
start free. publish forever.
```

(More aggressive than "upgrade when you need more" — it's a stronger commitment statement.)

**Free tier description:**
```
100 pages. 1 subdomain. everything you need to start publishing tonight.
```

**Pro description:**
```
unlimited pages. 5 subdomains. image and video support.
for agents that ship continuously.
```

**Enterprise description:**
```
unlimited everything. custom domains. priority support.
for teams running agents at scale.
```

### API Section

**Section title:**
```
one endpoint. one request. live page.
```

**API note:**
```
POST to /v1/pages/{slug}. sign with Ed25519. that's it.
no SDK, no client library, no ceremony.
```

### Footer CTA

**Current:**
```
start publishing agent output to the web.
```

**Rewritten headline:**
```
your agents are building things right now.
let people see them.
```

**Rewritten subtitle:**
```
Free for 100 pages. No credit card. No server to manage. 
Just sign and publish.
```

---

## 7. Mobile Considerations

### Current mobile issues:

1. **Hero is very tall on mobile.** With all the elements (badge, counter, headline, subtitle, buttons, agent prompt box, terminal block), the above-the-fold experience on a 375px-wide phone is essentially the entire page. The visitor has to scroll past 8 elements before reaching any content.

2. **Nav CTA survives but nav links hide.** Good — `agent setup` remains visible. But the hidden links (features, pricing, use cases, api) remove the nav-scanning path that mobile users rely on. Consider a hamburger menu or a sticky bottom CTA.

3. **Button width goes to 100% on mobile (max-width: 280px).** This is fine but both buttons stack vertically, creating a tall CTA block. The primary CTA should be more visually prominent.

4. **The 3-column feature grid becomes single column.** This is correct behavior. But the 6 features in a single column make for a very long scroll. Consider showing only 3-4 features on mobile, or using an accordion.

5. **The 3-column pricing grid becomes single column.** The "featured" (pro) plan should still be visually highlighted — consider giving it a different background color or border that pops in single-column layout.

6. **The terminal block and code blocks are small.** On mobile, 13px monospace code is hard to read. The terminal block is the most visually distinctive element on the page — make sure it's readable on small screens.

7. **Stats counter on mobile.** If it fails to load (and hides), the hero loses its only trust signal on mobile. Have a fallback.

8. **The agent prompt box is particularly valuable on mobile** — if someone is viewing from an AI tool on mobile, the copy-paste prompt is the fastest path to value. Make sure it's not buried.

### Mobile-specific recommendations:

1. **Add a sticky bottom CTA bar on mobile.** A fixed bottom bar with `$ start publishing →` keeps the primary action always visible.
2. **Collapse the hero on mobile.** Remove the terminal block and agent prompt box from above the fold on small screens. Show them after the "How It Works" section.
3. **Consider a mobile hamburger menu** for the nav links that currently hide.
4. **Increase code font size on mobile** to at least 14px for readability.
5. **Test the stats counter fallback** — show "publishing now..." or a static claim ("join X+ agents") instead of hiding entirely.

---

## Quick Wins (Implement Now)

| # | Change | Impact | Effort |
|---|--------|--------|--------|
| 1 | Rewrite hero headline to outcome-first | High | Low |
| 2 | Rewrite hero subtitle to lead with use cases, follow with mechanism | High | Low |
| 3 | Fix or remove the stats counter (hard-code or graceful fallback) | Medium | Low |
| 4 | Move terminal block out of hero into How It Works section | Medium | Low |
| 5 | Add `open source · mit license · no credit card` near primary CTA | Medium | Low |
| 6 | Rewrite CTAs to outcome language (`start publishing` not `agent setup`) | High | Low |
| 7 | Add live example URLs to use-case cards | Medium | Low |

## High-Impact Changes (Prioritize Next Sprint)

| # | Change | Impact | Effort |
|---|--------|--------|--------|
| 8 | Add 2-3 testimonials (hero + dedicated section) | Very High | Medium |
| 9 | Rewrite feature cards with benefit-first copy | High | Low |
| 10 | Add sticky mobile CTA bar | High | Medium |
| 11 | Differentiate pricing CTA destinations (registration vs billing) | Medium | Medium |
| 12 | Add "Used by" section with logos/names | High | Medium |

## Test Ideas (A/B Test, Don't Assume)

| Test | Hypothesis |
|------|-----------|
| Current headline vs. outcome-first headline | Outcome messaging will increase CTA clicks by 20%+ |
| "agent setup" vs. "start publishing" on primary CTA | Action-oriented CTA will outperform process-oriented CTA |
| Stats counter shown vs. hidden (early stage) | For low numbers, hiding the counter may convert better than showing |
| Terminal block in hero vs. in How It Works | Removing it from hero reduces cognitive load and increases CTA clicks |
| Use cases with live URLs vs. code-only | Clickable examples will increase engagement and time on page |

---

*Review based on Copywriting Skill v1.1.0 and Page CRO Skill v1.1.0 frameworks. All copy suggestions follow ZenBin's brand voice as defined in tone.md: direct, punchline-first, concrete-over-abstract, no hedging, no buzzwords.*