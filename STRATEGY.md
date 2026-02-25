# ZenBin Productization Strategy

**Date:** Feb 25, 2026

---

## Market Positioning

### Target Audience

**Primary:**
- **AI/ML developers** — Need to publish agent-generated HTML
- **Frontend developers** — Quick prototypes and demos
- **Tool builders** — Creating HTML-generating tools
- **Content creators** — Markdown-to-HTML workflows

**Secondary:**
- **Technical writers** — Documentation + code examples
- **Educators** — Code snippets with rendered output
- **Open source projects** — Demo pages for libraries

### Positioning Statement

**"ZenBin is an API-first HTML sandbox. Post HTML via API, get an instant URL. No account, no setup, no friction."**

### Competitive Position

| Aspect | Our Position |
|--------|--------------|
| Speed | SUB-100ms page creation |
| Friction | Zero — no account needed |
| Access | API-first, not GUI-first |
| Cost | Free forever |

---

## Feature Prioritization

### Highlight (Already Exist)

✅ **API-first** — Core differentiator, lead with this
✅ **No account** — Frictionless adoption
✅ **Markdown support** — Unique feature, dual content
✅ **Proxy endpoint** — Useful for demos, bypass CORS
✅ **Password/token auth** — Privacy while staying simple

### Improve (Near-term)

🔧 **Landing page** — Currently minimal, needs clear value prop
🔧 **Documentation** — Make API obvious, add examples
🔧 **Error messages** — Helpful, actionable errors
🔧 **Rate limits** — Generous but documented

### Add (High Impact for OnHyper)

🆕 **Branded footer** — Subtle "Powered by OnHyper" (opt-out)
🆕 **Page analytics** — View count, timestamps (visibility)
🆕 **Web editor** — For non-API users (wider audience)
🆕 **Templates** — Pre-built examples (inspiration)
🆕 **Custom subdomain** — `your-bin.zenbin.io` (premium feel)

### Defer (Low Priority)

⏳ Social features — Not core value
⏳ Real-time collab — Complexity high
⏳ Version history — Database growth concern

---

## Conversion Strategy

### User Journey

```
Discovery → Try (instantly) → Success → Repeat → 
Notice OnHyper → Curiosity → OnHyper signup
```

### Conversion Points

| Touchpoint | Message | Action |
|------------|---------|--------|
| Landing page | "Built with OnHyper technology" | Link to OnHyper |
| API response | `X-Powered-By: OnHyper` header | Subtle awareness |
| Page footer | "Hosted on ZenBin — Build more at OnHyper.io" | Direct CTA |
| Rate limit | "Unlock more with OnHyper account" | Incentive |
| Docs | "Want custom domains? Try OnHyper" | Feature hook |
| Email (*) | "Thanks for using ZenBin — discover OnHyper" | Nurture |

(*Email only if user provides it voluntarily)

### Attribution

- **UTM parameters:** `?utm_source=zenbin&utm_medium=product&utm_campaign=free_tier`
- **Referral tracking:** Unique ID per ZenBin page
- **Conversion event:** Page creator signs up for OnHyper

---

## Launch Strategy

### Phase 1: Soft Launch (Week 1)

**Goal:** Get initial users, test system

1. **Personal network**
   - Tweet from @hyperio_mc
   - Share in relevant Discord/Slack communities
   - Direct outreach to developer friends

2. **Content**
   - Blog post: "Introducing ZenBin — Instant HTML hosting via API"
   - Demo video: 60 seconds, show simplicity
   - Example use cases: 3-5 compelling scenarios

### Phase 2: Community Launch (Week 2)

**Goal:** Reach broader developer audience

1. **Hacker News**
   - Title: "Show HN: ZenBin — API-first HTML sandbox, post HTML get URL"
   - Timing: Tuesday-Thursday, 9am PST
   - Engage in comments actively

2. **Reddit**
   - r/webdev: "Built a simple API for hosting HTML pages"
   - r/javascript: "API-first HTML hosting for prototypes"
   - r/SideProject: "Made this for my own use, thought others might find it useful"

3. **Dev.to / Hashnode**
   - Tutorial: "How to use ZenBin for rapid prototyping"
   - Cross-post to Medium

### Phase 3: Growth (Month 2+)

**Goal:** Sustained traffic and conversions

1. **SEO content**
   - Target keywords: "html hosting api", "html sandbox", "host html programmatically"
   - Comparison pages: "ZenBin vs CodePen", "ZenBin vs GitHub Pages"

2. **Product Hunt**
   - Coordinate launch with features (web editor?)
   - Prepare assets: demo GIF, screenshots, tagline

3. **Integrations**
   - VS Code extension: Publish selection to ZenBin
   - CLI tool: `zenbin publish index.html`
   - NPM package: Programmatic API wrapper

4. **Templates**
   - Landing page templates
   - Email templates
   - Documentation templates

---

## SEO Strategy

### Primary Keywords

| Keyword | Intent | Volume Estimate |
|---------|--------|-----------------|
| html hosting api | Developers looking for this exact thing | Medium |
| html sandbox | Developers exploring options | Medium |
| host html programmatically | Specific problem-solving | Low |
| instant html url | Utility search | Low |
| code snippet hosting | Broader category | High |

### Secondary Keywords

- "api first hosting"
- "html preview api"
- "markdown to html api"
- "cors bypass proxy"
- "temporary html hosting"

### Landing Page Structure

```
1. Hero
   - H1: "Post HTML, Get URL — Instantly"
   - Subtitle: "API-first HTML sandbox. No account, no setup."
   - CTA: "Try it now" (interactive demo)

2. Quick Start
   - 3-line code example
   - Instant result preview

3. Features
   - API-first
   - No account
   - Markdown support
   - Password protection
   - CORS proxy

4. Use Cases
   - Agent-generated content
   - Quick prototypes
   - Demo pages
   - Documentation

5. Examples
   - Interactive examples
   - Live preview

6. OnHyper Pitch
   - "Built with OnHyper technology"
   - "Build full apps on OnHyper.io"

7. Documentation
   - API reference
   - Code examples
   - SDKs

8. Footer
   - Links, social, OnHyper
```

### Technical SEO

- **Meta tags:** Title, description, OG tags
- **Structured data:** SoftwareApplication schema
- **Sitemap:** `/sitemap.xml` with all pages
- **Robots.txt:** Allow all crawling
- **Performance:** <1s LCP (it's a simple page)
- **Mobile:** Responsive (developer mobile usage exists)

---

## Success Metrics

### Week 1 Targets

- **Pages created:** 100+
- **Unique creators:** 50+
- **OnHyper visits:** 25+

### Month 1 Targets

- **Pages created:** 1,000+
- **Unique creators:** 300+
- **OnHyper visits:** 100+
- **OnHyper signups (attributed):** 5+

### Month 3 Targets

- **Pages created:** 5,000+
- **Unique creators:** 1,000+
- **OnHyper visits:** 500+
- **OnHyper signups (attributed):** 25+

---

## Implementation Priority

### Week 1: Foundation

1. Landing page with clear value prop
2. OnHyper branding integration
3. Documentation page
4. Analytics (PostHog)
5. Deploy with custom domain

### Week 2: Launch

1. Blog post
2. Social content
3. HN/Reddit posts
4. Community outreach

### Week 3-4: Iterate

1. Web editor (optional)
2. Templates
3. Example gallery
4. Conversion optimization

---

*Next step: Approve strategy, begin implementation*