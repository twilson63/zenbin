# ZenBin Landing Page Design

**Date:** Feb 25, 2026

---

## Page Structure

### Hero Section

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] ZenBin                           [GitHub] [Docs]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│        Post HTML, Get URL — Instantly                       │
│                                                             │
│   API-first HTML sandbox. No account, no setup, no wait.   │
│                                                             │
│   [ Try it now ]  [ View docs ]                             │
│                                                             │
│   ┌───────────────────────────────────────────────────┐    │
│   │  curl -X POST https://zenbin.io/v1/pages/demo \  │    │
│   │    -H "Content-Type: application/json" \          │    │
│   │    -d '{"html":"<h1>Hello World</h1>"}'           │    │
│   │                                                    │    │
│   │  → https://zenbin.io/p/demo                       │    │
│   └───────────────────────────────────────────────────┘    │
│                                                             │
│              Powered by OnHyper →                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Copy:**
- **H1:** "Post HTML, Get URL — Instantly"
- **Subtitle:** "API-first HTML sandbox. No account, no setup, no wait."
- **CTA Primary:** "Try it now"
- **CTA Secondary:** "View docs"

---

### Quick Demo Section

```
┌─────────────────────────────────────────────────────────────┐
│                   See it in action                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [HTML Input - editable]        [Live Preview]             │
│  ┌────────────────────────┐     ┌────────────────────────┐ │
│  │ <h1>Hello</h1>         │     │      Hello             │ │
│  │ <p>Quick demo</p>      │     │    Quick demo          │ │
│  └────────────────────────┘     └────────────────────────┘ │
│                                                             │
│              [ Publish → ] Get your URL                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Interaction:**
- User types HTML in left panel
- Right panel shows live preview
- "Publish" button creates page, shows URL
- Immediate gratification

---

### Features Section

```
┌─────────────────────────────────────────────────────────────┐
│                    Why ZenBin?                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ ⚡ Fast │  │ 🔓 Open │  │ 📝 MD   │  │ 🔒 Safe │       │
│  │         │  │         │  │         │  │         │       │
│  │<100ms   │  │No auth  │  │Markdown │  │Sandboxed│       │
│  │response │  │required │  │support  │  │by default│      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 🔌 API  │  │ 🌐 CORS │  │ 🔐 Auth │  │ 🤖 AI   │       │
│  │         │  │         │  │         │  │         │       │
│  │RESTful  │  │Proxy    │  │Optional │  │Agent    │       │
│  │endpoints│  │bypass   │  │passwords│  │ready    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Feature Labels:**
1. ⚡ **Fast** — Sub-100ms page creation
2. 🔓 **Open** — No account required
3. 📝 **Markdown** — Store MD alongside HTML
4. 🔒 **Safe** — Sandboxed by default
5. 🔌 **API** — RESTful endpoints
6. 🌐 **CORS** — Proxy for external requests
7. 🔐 **Auth** — Optional passwords/tokens
8. 🤖 **AI** — Agent-ready (`/api/agent`)

---

### Use Cases Section

```
┌─────────────────────────────────────────────────────────────┐
│                  Built for developers                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🤖 AI Agents                                        │   │
│  │                                                      │   │
│  │  Agents generate HTML? Publish their output          │   │
│  │  instantly. Let users see what your AI created.      │   │
│  │                                                      │   │
│  │  POST /v1/pages/{id} with agent-generated HTML       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📋 Prototypes                                       │   │
│  │                                                      │   │
│  │  Testing an idea? Skip the deploy pipeline.          │   │
│  │  One curl, instant URL, share with anyone.           │   │
│  │                                                      │   │
│  │  Perfect for wireframes, demos, proofs of concept    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📚 Documentation                                    │   │
│  │                                                      │   │
│  │  Render docs with code examples. Store markdown      │   │
│  │  source, serve HTML. Add API demos inline.           │   │
│  │                                                      │   │
│  │  GET /p/{id}/md — retrieve markdown source           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🛠️ Tool Output                                      │   │
│  │                                                      │   │
│  │  Building a tool that creates HTML? Give users       │   │
│  │  instant hosted output. No infrastructure needed.    │   │
│  │                                                      │   │
│  │  Great for report generators, formatters, linters    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📧 Email Templates                                  │   │
│  │                                                      │   │
│  │  Preview email HTML in browser before sending.       │   │
│  │  Share links with stakeholders for review.           │   │
│  │                                                      │   │
│  │  Render, review, iterate, send                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### API Overview Section

```
┌─────────────────────────────────────────────────────────────┐
│               Simple, RESTful API                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Create a page                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ POST /v1/pages/{id}                                 │   │
│  │ Content-Type: application/json                      │   │
│  │                                                      │   │
│  │ {                                                    │   │
│  │   "html": "<h1>Hello World</h1>",                   │   │
│  │   "markdown": "# Hello World",                      │   │
│  │   "title": "My Page",                               │   │
│  │   "auth": { "password": "secret123" }               │   │
│  │ }                                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Response                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ {                                                    │   │
│  │   "id": "my-page",                                  │   │
│  │   "url": "https://zenbin.io/p/my-page",             │   │
│  │   "raw_url": "https://zenbin.io/p/my-page/raw",     │   │
│  │   "markdown_url": "https://zenbin.io/p/my-page/md"  │   │
│  │ }                                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  That's it. No auth headers. No tokens. Just POST.          │
│                                                             │
│  [ View full API docs → ]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### OnHyper Connection Section

```
┌─────────────────────────────────────────────────────────────┐
│          Want more than single pages?                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🚀 Build full apps on OnHyper                             │
│                                                             │
│   ZenBin is great for pages. OnHyper is for apps.          │
│                                                             │
│   • Store API keys securely                                 │
│   • Call any API from the browser                           │
│   • Publish at your-app.onhyper.io                          │
│   • Built-in analytics                                      │
│                                                             │
│   [ Explore OnHyper → ]                                     │
│                                                             │
│   ZenBin runs on OnHyper infrastructure.                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Footer

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ZenBin                    Resources      OnHyper          │
│                                                             │
│  About                     API Docs       Platform         │
│  GitHub                    Examples       Pricing          │
│  Status                    FAQ            Docs             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  © 2026 ZenBin. Powered by OnHyper. MIT License.           │
│                                                             │
│  [Twitter] [GitHub] [Discord]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## OnHyper Touchpoints

### Placement Strategy

| Location | Message | Tone | Aggression |
|----------|---------|------|------------|
| Hero | "Powered by OnHyper →" | Subtle | Low |
| Footer link | "OnHyper Platform" | Navigation | Minimal |
| API response header | `X-Powered-By: OnHyper` | Technical | Very Low |
| Use case section | "Built on OnHyper infrastructure" | Contextual | Low |
| Dedicated section | "Want more? Build on OnHyper" | Direct | Medium |
| Page foot (optional) | "Hosted on ZenBin — Build more at OnHyper.io" | Opt-in | Low |

### Messaging Principles

1. **Don't be pushy** — Users came for ZenBin, not an ad
2. **Show, don't tell** — "Powered by" is more credible than "Try this too"
3. **Context matters** — Mention OnHyper when it's relevant
4. **Opt-in is better** — Let users discover, don't force
5. **Footer is enough** — Small branding at bottom of pages

---

## Example Use Cases (Detailed)

### 1. AI Agent Output

```bash
# Agent creates a report, publishes as HTML
curl -X POST https://zenbin.io/v1/pages/report-2026-02 \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><body><h1>Report</h1><p>Generated by AI...</p></body></html>",
    "title": "AI Report Feb 2026"
  }'

# Returns: https://zenbin.io/p/report-2026-02
# Share with user: "Here's your report: https://zenbin.io/p/report-2026-02"
```

**Why this works:** AI agents need to show output. ZenBin gives them a link instantly.

### 2. Quick Prototype

```bash
# Designer wants to share a layout
curl -X POST https://zenbin.io/v1/pages/wireframe-v1 \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><head><style>.card{border:1px solid #ccc;padding:1rem;}</style></head><body><div class=\"card\">New design</div></body></html>"
  }'

# Share with team: https://zenbin.io/p/wireframe-v1
```

**Why this works:** No Git, no deploy, no waiting. Just curl and share.

### 3. Email Template Preview

```bash
# Marketing creates email HTML, previews in browser
curl -X POST https://zenbin.io/v1/pages/newsletter-03 \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<table width=\"600\"><tr><td>Newsletter content...</td></tr></table>",
    "auth": { "password": "team123" }
  }'

# Share with stakeholders: https://zenbin.io/p/newsletter-03
# Password protected for team only
```

**Why this works:** Email HTML is weird. Preview it in browser before send.

### 4. Documentation with Examples

```bash
# Dev docs with live examples
curl -X POST https://zenbin.io/v1/pages/api-docs \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<!DOCTYPE html><html><body><h1>API Docs</h1><pre>fetch(\"/api/data\")</pre><div id=\"result\"></div><script>...</script></body></html>",
    "markdown": "# API Docs\n\n```\nfetch(\"/api/data\")\n```\n\nLive example above."
  }'

# View: https://zenbin.io/p/api-docs
# Source: https://zenbin.io/p/api-docs/md
```

**Why this works:** Docs need both rendered output and source. Markdown endpoint provides both.

### 5. Tool Output

```javascript
// Your tool generates HTML reports
const response = await fetch('https://zenbin.io/v1/pages/' + reportId, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: generateReportHtml(data)
  })
});

const { url } = await response.json();
// Return URL to user: "Your report: https://zenbin.io/p/report-abc123"
```

**Why this works:** Tools need hosted output. ZenBin becomes the hosting layer.

---

## Responsive Considerations

### Mobile Layout

- Hero: Stack vertically, code block scrollable
- Features: 2-column grid
- Use cases: Single column
- OnHyper section: Full width
- Footer: Stack links

### Tablet Layout

- Hero: Side-by-side
- Features: 4-column grid
- Use cases: 2 columns

---

## Implementation Notes

### Tech Stack

- Plain HTML/CSS (no framework needed)
- TailwindCSS via CDN (rapid styling)
- No JavaScript required for MVP (interactive demo adds complexity)

### Performance

- Inline critical CSS
- Lazy load code examples
- Minimal JavaScript (if any)
- Target <50KB total page weight

### Accessibility

- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation
- Color contrast ratios

---

*Design complete. Ready for implementation.*