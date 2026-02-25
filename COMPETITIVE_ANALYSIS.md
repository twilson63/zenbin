# ZenBin Competitive Analysis

**Date:** Feb 25, 2026

---

## Direct Competitors

### 1. CodePen
- **What it is:** Browser-based code editor for HTML/CSS/JS with sharing
- **Strengths:** Social features, large community, beautiful UI, embeds
- **Weaknesses:** Not API-first, requires account for advanced features, iframe sandboxing
- **Pricing:** Free tier, Pro at $8/mo
- **ZenBin advantage:** API-first, simpler, programmatic access

### 2. JSFiddle
- **What it is:** Online code playground for HTML/CSS/JS
- **Strengths:** Quick prototyping, no account needed
- **Weaknesses:** URLs are ugly, limited API, pages can be deleted
- **Pricing:** Free
- **ZenBin advantage:** Clean URLs (`/p/{id}`), API-first, markdown support

### 3. GitHub Pages
- **What it is:** Static site hosting from Git repos
- **Strengths:** Free, custom domains, Jekyll support, reliable
- **Weaknesses:** Requires Git workflow, slower iteration, no instant API
- **Pricing:** Free (public repos)
- **ZenBin advantage:** Instant API access, no Git required

### 4. Netlify / Vercel
- **What it is:** Modern static site hosting with CI/CD
- **Strengths:** Powerful, custom domains, serverless functions, edge
- **Weaknesses:** Overkill for quick demos, requires project setup
- **Pricing:** Free tier, Pro at $19-25/mo
- **ZenBin advantage:** Simplicity — just POST HTML, get a URL

### 5. Pastebin / GitHub Gist
- **What it is:** Text/code snippet sharing
- **Strengths:** Instant, simple, widely used
- **Weaknesses:** Not rendered HTML, no preview, ugly presentation
- **Pricing:** Free, Pro at $5-20/mo
- **ZenBin advantage:** Renders HTML, proper preview, designed for pages

---

## Indirect Competitors

### 1. Notion / Coda / Slite
- **What they do:** Document hosting with publishing
- **Gap:** Not API-first, not designed for HTML

### 2. Squarespace / Wix / Webflow
- **What they do:** Website builders
- **Gap:** Heavy GUI, not for developers, overkill for simple pages

### 3. Surge.sh / Neocities
- **What they do:** Static site hosting
- **Gap:** Requires CLI, more setup than necessary

### 4. Cloudflare Pages
- **What they do:** Static site hosting with edge
- **Gap:** Git-based, not instant API

---

## Positioning Opportunities

### The Gap ZenBin Fills

**"Programmable page hosting for developers"**

| Competitor | Gap |
|------------|-----|
| CodePen | Not API-first, requires browser |
| GitHub Pages | Requires Git, slow iteration |
| Pastebin | Doesn't render HTML |
| Netlify/Vercel | Overkill for single pages |

**ZenBin's sweet spot:**
- Instant via API
- No account required
- Clean URLs
- Renders HTML properly
- Developer-focused

### Key Differentiators

1. **API-first** — Create pages programmatically, not through GUI
2. **No friction** — No account, no Git, no CLI
3. **Flexible** — HTML + markdown support
4. **Sandboxed** — Secure by default
5. **Zero cost** — 100% free, no premium upsell (OnHyper is the upsell)

---

## Pricing Benchmarks

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| CodePen | Limited pens | $8/mo |
| JSFiddle | Unlimited | $12/mo (teams) |
| Pastebin | Limited | $5/mo |
| GitHub Pages | Free | — |
| Netlify | 100GB bandwidth | $19/mo |
| Vercel | 100GB bandwidth | $20/mo |

**ZenBin Strategy:** Stay completely free. No paid tier. Monetization through OnHyper.

---

## Feature Gaps

### Features ZenBin Lacks (that competitors have)

1. **Social/community features** — Comments, likes, profiles
2. **Embeds** — Iframe embeds for external sites
3. **Collaboration** — Real-time editing
4. **Version history** — Track changes over time
5. **Custom domains** — Own domain for pages
6. **SSL for custom domains** — Certificates

### Features ZenBin Has (that competitors lack)

1. **API-first design** — Programmatic access from day one
2. **Markdown support** — Store source alongside HTML
3. **Proxy endpoint** — Bypass CORS for API calls
4. **Password protection** — HTTP Basic Auth for pages
5. **Secret URL tokens** — Shareable links without passwords
6. **Agent instructions** — Built for AI agent usage (`/api/agent`)

---

## Recommended Positioning

**"The programmatic page host"**

Target developers who:
- Need to generate pages via code
- Want instant URLs without setup
- Build tools that output HTML
- Create demos/prototypes programmatically
- Work with AI agents that generate HTML

Avoid competing on:
- Social features (CodePen wins)
- Enterprise hosting (Netlify/Vercel win)
- Visual editing (Wix/Squarespace win)

Lean into:
- **Speed** — POST HTML, get URL in milliseconds
- **Simplicity** — One endpoint, no configuration
- **Programmability** — Built for code, not GUIs
- **AI-friendly** — Agent-ready from day one

---

## OnHyper Connection

### Why ZenBin Drives OnHyper Signups

1. **Demonstrates the tech** — ZenBin could be built ON OnHyper
2. **Quick win** — Users see value in seconds
3. **Natural progression** — "Want more control? Build on OnHyper"
4. **Trust building** — Free tool = goodwill = consideration

### Conversion Messaging

- "Like this? OnHyper lets you build full apps with your own API keys."
- "ZenBin is a single-purpose tool. OnHyper is a platform."
- "Build this and more on OnHyper.io"