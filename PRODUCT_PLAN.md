# ZenBin Product Plan

**Objective:** Productize ZenBin as a 100% free service that drives traffic and signups to OnHyper.io

---

## Executive Summary

ZenBin is a headless HTML sandbox — a simple API for publishing and serving HTML documents. We'll launch it as a **free hosted service** with OnHyper branding and CTAs throughout the user journey.

**Business Model:** Free tool → OnHyper branding → Drive signups → Paid OnHyper subscriptions

---

## Core Value Proposition

**For Users:**
- Instant HTML page hosting with a simple API
- No account required for basic usage
- Perfect for demos, prototypes, landing pages, documentation
- Markdown support for simple content

**For OnHyper:**
- Demonstration of what OnHyper technology can build
- Lead generation through natural product interest
- SEO presence in developer searches
- Trust building through free value

---

## Product Features

### Phase 1: MVP (Week 1-2)

- [ ] **Landing page** with clear value prop and OnHyper branding
- [ ] **Public API** for creating/viewing pages
- [ ] **Rate limiting** (generous free tier)
- [ ] **OnHyper CTA** in page footer (optional, subtle)
- [ ] **Deployment** to Railway with custom domain

### Phase 2: Enhanced UX (Week 3-4)

- [ ] **Web UI** for creating pages without API
- [ ] **Page analytics** (view count, timestamps)
- [ ] **Custom subdomains** (your-page.zenbin.io)
- [ ] **Password-protected pages** 
- [ ] **OnHyper signup prompts** after N pages created

### Phase 3: Growth Features (Month 2+)

- [ ] **Templates gallery** (pre-built page templates)
- [ ] **Code playground** (HTML/CSS/JS editor)
- [ ] **Collaboration links** (share with team)
- [ ] **Git integration** (sync with GitHub repos)
- [ ] **OnHyper Pro upsell** (custom domains, more storage)

---

## Technical Architecture

### Stack
- **Backend:** Hono + LMDB (existing ZenBin)
- **Frontend:** Simple landing page + optional web UI
- **Hosting:** Railway (single instance with persistent disk)
- **Domain:** zenbin.io or zenbin.org

### Database
- **LMDB** for page storage (already implemented)
- **Persistent disk** on Railway (1GB sufficient for MVP)

### Scaling Considerations
- Start single-instance
- If demand grows, migrate to OnHyper architecture (secrets + proxy)
- Consider SQLite for analytics if needed

---

## OnHyper Integration Strategy

### Branding Placements

1. **Landing Page Hero**
   - "Powered by OnHyper" badge
   - "Build full apps with OnHyper →" CTA

2. **Page Footer (Optional)**
   - Small "Hosted with ZenBin — Build more at OnHyper.io"
   - User can opt out via API parameter

3. **API Response Headers**
   - `X-Powered-By: OnHyper`
   - Subtle, non-intrusive

4. **Documentation**
   - "Want more? OnHyper lets you build full apps with API keys, auth, and more."
   - Link to OnHyper docs/pricing

### User Journey

```
Landing Page → Create Page → See Result → Notice OnHyper Branding → 
Create More Pages → Hit Rate Limit → "Unlock more with OnHyper" → Signup
```

### Conversion Points

1. **Soft conversion:** OnHyper branding builds awareness
2. **Rate limit conversion:** "Create unlimited pages with OnHyper account"
3. **Feature conversion:** "Want custom domains? Try OnHyper"
4. **Power user conversion:** "Build full apps, not just pages — OnHyper"

---

## Pricing

### Free Tier (This Product)
- Unlimited page creation (within rate limits)
- 100 requests/hour per IP
- Pages expire after 90 days of inactivity (optional)
- OnHyper branding on landing pages

### No Paid Tier
This product is **100% free**. Monetization happens through OnHyper upsells.

---

## Success Metrics

### Primary
- **OnHyper signups attributed to ZenBin** (UTM tracking)
- **Monthly active page creators**

### Secondary
- Total pages created
- API requests per day
- Landing page conversion rate
- Time on site

### Tracking
- PostHog analytics on landing page
- UTM parameters: `?utm_source=zenbin&utm_medium=product&utm_campaign=free_tier`
- Track conversion: Landing page → OnHyper signup

---

## Launch Checklist

### Pre-Launch
- [ ] Configure custom domain (zenbin.io preferred)
- [ ] Set up PostHog analytics
- [ ] Create landing page copy with OnHyper CTAs
- [ ] Set up UTM tracking
- [ ] Add rate limiting configuration
- [ ] Create OnHyper account for attribution
- [ ] Write documentation

### Launch Day
- [ ] Deploy to production
- [ ] Verify SSL/HTTPS
- [ ] Test API endpoints
- [ ] Post on X/Twitter
- [ ] Post on Hacker News (Show HN)
- [ ] Share on Reddit (r/webdev, r/javascript)
- [ ] Add to "awesome" lists

### Post-Launch
- [ ] Monitor analytics
- [ ] Respond to feedback
- [ ] Iterate on CTAs
- [ ] Track OnHyper signups

---

## Domain Strategy

**Ideal:** zenbin.io (short, memorable)

**Alternative:** zenbin.org (if .io unavailable)

**Cost estimation:**
- .io domain: ~$35/year
- .org domain: ~$10/year

---

## Development Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Foundation | Landing page, deploy MVP, custom domain |
| 2 | Polish | Documentation, rate limiting, analytics |
| 3 | Growth | Web UI, social launch |
| 4 | Optimize | Conversion optimization, feedback iteration |

---

## Next Steps

1. **Decide on domain** — zenbin.io vs zenbin.org
2. **Design landing page** — Figma or code directly
3. **Add OnHyper branding** — Logo placement, CTAs
4. **Set up PostHog** — Analytics integration
5. **Deploy** — Railway with custom domain
6. **Launch** — Social media, communities

---

## Questions to Resolve

- [ ] Domain choice: zenbin.io or zenbin.org?
- [ ] Should pages have footer branding by default?
- [ ] What's the rate limit sweet spot?
- [ ] Should we require email for page creation past N pages?
- [ ] How aggressive should OnHyper CTAs be?

---

*Created: Feb 25, 2026*
*Status: Draft — Awaiting Review*