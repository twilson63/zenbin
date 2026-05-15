# ZenBin Pricing Analysis

*Generated: 2025-05-15 — framework from pricing-strategy skill*

---

## 1. Analysis of Current Pricing

### Current Tiers

| | Free | Pro ($4.99/mo) | Enterprise ($14.99/mo) |
|---|---|---|---|
| Pages/mo | 100 | Unlimited | Unlimited |
| Subdomains | 1 | 5 | Unlimited |
| Video | ❌ | ✅ | ✅ |
| Signed publishing | ✅ | ✅ | ✅ |

### Strengths

1. **Low barrier entry.** Free tier with 100 pages is generous enough to build a habit without being so generous that nobody upgrades.
2. **Simple tier structure.** Three tiers, easy to understand. Good-better-best is the right framework.
3. **Pro at $4.99 is impulse-buy territory.** Below the $5 psychological threshold. Feels like "why not?" rather than "let me think about it."
4. **Signed publishing on Free.** Cryptographic authenticity (Ed25519) on every tier is a genuine differentiator — most competitors don't offer this at all, let alone for free.

### Weaknesses

1. **Free → Pro gap is narrow.** The only real upgrades are unlimited pages, 4 more subdomains, and video. If someone only needs 1 subdomain and no video, there's almost no reason to upgrade. The value metric (pages) becomes infinite at Pro, removing the natural expansion path.
2. **Enterprise feels arbitrary.** "Unlimited everything" at $14.99/mo is only 3× Pro, but Pro is *also* unlimited pages. The only differentiator is unlimited subdomains. That's thin. Enterprise needs a stronger value story.
3. **No usage-based expansion lever.** Once someone hits Pro, they never pay more. No per-page overage, no per-GB storage, no per-API-call metering. Revenue per customer is capped.
4. **Missing the upcoming features in tier logic.** TTL, Arweave permanence, and content provenance are strong value features but aren't in the current tier structure yet.
5. **No annual billing option.** Monthly-only misses the cash-flow and retention benefits of annual plans (typical 17-20% discount).
6. **No clear persona targeting.** Who is Pro for? An indie dev? A small team? The pricing doesn't signal.

---

## 2. TTL & Arweave Permanence Tier Mapping

### Framework: Duration as a Value Metric

The key insight: **content lifespan is a natural value metric.** As content durability goes up, value goes up — and so should price.

| Tier | Content Lifespan | Analogy |
|---|---|---|
| **Free** | TTL: 24h–7d (temporary, ephemeral) | "Share a draft, get feedback, move on" |
| **Pro** | TTL: configurable up to 1 year; standard durability | "Publish a blog, ship a portfolio, it stays" |
| **Enterprise** | Arweave permanence (pay-once, store-forever) + content provenance verification | "This is an immutable record. Cryptographic proof it existed." |

### Detailed Feature Mapping

#### TTL (Temporary Pages)

| | Free | Pro | Enterprise |
|---|---|---|---|
| Default TTL | 24 hours | 30 days | None (permanent by default) |
| Max TTL | 7 days | 365 days | ∞ (Arweave) |
| Self-destruct UI | ✅ | ✅ | ✅ |
| TTL as sharing feature | ✅ "Send a temp link" | ✅ "Set expiry on any page" | N/A (permanent) |

**Why:** TTL on Free makes the free tier *more useful* (temporary sharing is a real use case: code reviews, drafts, one-time shares) while making the 7-day ceiling the natural upgrade trigger. "Need this page to last more than a week? That's Pro."

#### Arweave Permanence

| | Free | Pro | Enterprise |
|---|---|---|---|
| Arweave storage | ❌ | ❌ | ✅ (pay-per-page, bundled in sub) |
| Content provenance | ❌ | ❌ | ✅ (verify on Arweave) |
| Permanence badge | ❌ | ❌ | ✅ "Permanently stored on Arweave" |
| Immutable version history | ❌ | Last 10 versions | Full history on Arweave |

**Why:** Arweave permanence is the Enterprise anchor. It's a genuine infra cost (Arweave storage isn't free) and a genuine value story (cryptographic proof of content, censorship resistance, immutability). This makes Enterprise worth $14.99+ because it's not just "more subdomains" — it's a fundamentally different guarantee about your content.

#### Suggested Pricing After New Features

| | Free | Pro | Enterprise |
|---|---|---|---|
| **Price** | $0 | $4.99/mo | $14.99/mo |
| Pages/mo | 100 | Unlimited | Unlimited |
| Subdomains | 1 | 5 | Unlimited |
| Video | ❌ | ✅ | ✅ |
| Max TTL | 7 days | 365 days | ∞ (Arweave) |
| Arweave permanence | ❌ | ❌ | ✅ |
| Content provenance | ❌ | ❌ | ✅ |
| Version history | Last 3 | Last 10 | Full + Arweave |
| Custom domains | ❌ | ✅ (1) | ✅ (unlimited) |
| Priority rendering | ❌ | ✅ | ✅ |

**Price adjustment rationale:**
- Pro goes from $4.99 → $4.99: Still impulse-buy, but reflects the added value (custom domains, longer TTL, video). Anchoring against Enterprise makes Pro look like a steal.
- Enterprise goes from $14.99 → $14.99: Arweave permanence is real infrastructure cost. $14.99 is still well under enterprise SaaS expectations and clearly differentiated from Pro.
- The 3× ratio (Pro to Enterprise) is maintained, preserving the decoy effect.

---

## 3. Competitive Pricing Comparison

### Direct Competitors

| Feature | **ZenBin** | **here.now** | **Cloudflare Pages** | **Vercel** | **Netlify** |
|---|---|---|---|---|---|
| Free tier | 100 pages/mo, 1 subdomain | Anonymous (24h expiry), API key (permanent) | Unlimited sites, 500 builds/mo | Unlimited sites, 100GB bandwidth | Unlimited sites, 100GB bandwidth |
| Auth model | Signed keys (Ed25519) | API key (Bearer token) | GitHub/Email | GitHub/Email | GitHub/Email |
| Per-page auth | ✅ Cryptographic signing | ❌ | ❌ | ❌ | ❌ |
| Video support | Pro+ | ✅ | ❌ | ❌ | ❌ |
| Custom domains | Pro+ | ✅ (paid?) | ✅ (free) | ✅ (paid) | ✅ (paid) |
| Ephemeral/TTL | Free: 24h–7d | Default: 24h (anonymous) | ❌ | ❌ | ❌ |
| Arweave permanence | Enterprise | ❌ | ❌ | ❌ | ❌ |
| Content provenance | Enterprise | ❌ | ❌ | ❌ | ❌ |
| Agent-native | ✅ (signed publishing API) | ✅ (agent skill, API) | ❌ | ❌ | ❌ |
| Pricing | Free / $4.99 / $14.99 | Free (with API key) | Free / $20/mo (Pro) | Free / $20/mo (Pro) | Free / $19/mo (Pro) |

### Competitive Positioning

**vs. here.now:**
- here.now is the closest competitor. Both target agent-native publishing.
- here.now's model: anonymous = 24h expiry, authenticated = permanent. No paid tiers visible yet.
- **ZenBin advantage:** Signed publishing (cryptographic authenticity), video, TTL flexibility, Arweave permanence, subdomains.
- **here.now advantage:** Zero-friction start (no key needed for anonymous), Cloudflare edge (likely faster globally), slightly simpler API.
- **Key differentiator:** here.now treats permanence as binary (temporary or permanent). ZenBin offers *graduated durability* — temporary, durable, permanent. This is a richer model that maps to real use cases.

**vs. Cloudflare Pages / Vercel / Netlify:**
- These are developer tools, not agent-native. They require git repos, build steps, and CLI knowledge.
- ZenBin wins on simplicity for agents: sign + publish, no build pipeline.
- But they have deeper ecosystems (CMS integrations, serverless functions, edge workers).
- **ZenBin shouldn't try to compete on CI/CD features.** The lane is agent-native content publishing with cryptographic authenticity.

### Pricing Insight

ZenBin's free tier (100 pages) is *more generous* than here.now's free tier (which requires an API key for permanency, otherwise 24h expiry). But here.now doesn't have a paid tier, which means:

- here.now is likely operating at a loss or running on VC funding.
- ZenBin's paid tiers signal sustainability and long-term commitment.
- The messaging opportunity: "Free to start, sustainable forever."

---

## 4. Pricing Page Copy & Structure

### Page Architecture

```
┌─────────────────────────────────────────────────────┐
│  "Publish content that outlives the internet."     │
│  [Free → Pro → Enterprise] toggle                   │
│  Monthly / Annual (save 20%)                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Free    │  │  Pro ★       │  │  Enterprise  │  │
│  │           │  │  Most Popular │  │              │  │
│  │  $0       │  │  $4.99/mo    │  │  $14.99/mo   │  │
│  │           │  │              │  │              │  │
│  │ • 100     │  │  • Unlimited │  │  • Unlimited │  │
│  │   pages   │  │    pages     │  │    pages     │  │
│  │ • 1       │  │  • 5         │  │  • Unlimited │  │
│  │   subdomain│  │    subdomains│  │    subdomains│  │
│  │ • 7-day   │  │  • Video     │  │  • Video     │  │
│  │   max TTL │  │  • Custom    │  │  • Arweave   │  │
│  │ • Signed  │  │    domain    │  │    permanence│  │
│  │   publish │  │  • 365-day   │  │  • Content   │  │
│  │           │  │    max TTL   │  │    provenance│  │
│  │           │  │  • Priority  │  │  • Custom    │  │
│  │           │  │    rendering │  │    domains   │  │
│  │  [Start]  │  │  [Upgrade]   │  │  [Contact]   │  │
│  └──────────┘  └──────────────┘  └──────────────┘  │
│                                                     │
│  ─── Feature Comparison Table ───                   │
│  ─── FAQ ───                                       │
│  ─── "Why ZenBin?" ───                             │
└─────────────────────────────────────────────────────┘
```

### Key Copy Lines

**Hero:** "Publish content that outlives the internet."

**Subhead:** "From temporary shares to Arweave-permanent records. Cryptographic proof, zero infrastructure."

**Free tier card:**
- Headline: "Start free"
- Subtext: "100 pages/month. Cryptographic signing included. No credit card."

**Pro tier card (recommended):**
- Headline: "Ship without limits"
- Subtext: "Unlimited pages. Video uploads. Custom domains. Your content, your subdomain, your rules."

**Enterprise tier card:**
- Headline: "Make it permanent"
- Subtext: "Arweave storage. Content provenance verification. Censorship-resistant, cryptographically guaranteed."

### Annual Pricing

| | Monthly | Annual (20% off) |
|---|---|---|
| Pro | $4.99/mo | $3.99/mo ($47.88/yr) |
| Enterprise | $14.99/mo | $11.99/mo ($143.88/yr) |

### FAQ on Pricing Page

**Q: Is the free tier really free?**
A: Yes. 100 pages/month, signed publishing, 1 subdomain. No credit card, no time limit.

**Q: What happens if I hit 100 pages on Free?**
A: Your existing pages stay live. You just can't publish new ones until the monthly window resets.

**Q: What's Arweave permanence?**
A: Your page is stored on the Arweave blockchain — pay once, stored forever. No hosting bills, no link rot, no "this page has been removed." Cryptographic proof that your content existed, exactly as published.

**Q: Can I try Pro before committing?**
A: 14-day free trial on Pro. Full access, cancel anytime.

**Q: Do I own my content?**
A: Always. You hold the Ed25519 signing key. We can't modify your content without your signature.

---

## 5. Objection Handling

### "Why pay when I can self-host?"

**The self-host argument:** Static HTML is trivially self-hostable. Why pay ZenBin?

**Reframe:** "Self-hosting is free like a puppy is free."

| Concern | Response |
|---|---|
| Hosting cost | A VPS costs $5-20/mo. Pro is $4.99. You're already paying more. |
| SSL certificates | Let's Encrypt is free, but you manage renewals. ZenBin handles it. |
| CDN/edge | CloudFlare free tier works, but setup + config = your time. ZenBin = zero config. |
| Uptime monitoring | You're on call. Always. ZenBin handles it. |
| Subdomain management | Wildcard SSL + DNS config. 30 min minimum, and you'll debug it twice. |
| Agent-native API | Build it yourself. Signing, rate limiting, TTL — that's weeks of work. |
| Arweave permanence | Set up your own Arweave integration. Or: one click on ZenBin. |

**One-liner:** "Self-hosting costs your time. ZenBin costs $4.99/month. What's your hourly rate?"

**Deeper framing:** "ZenBin isn't selling hosting. It's selling *not having to think about hosting.* Signed publishing, TTL, Arweave permanence — these are features that don't exist in a self-hosted static server. You'd be building them from scratch."

---

### "Why pay when here.now is free?"

**The here.now argument:** here.now offers free permanent publishing with an API key. Why pay ZenBin?

**Reframe:** here.now is great for quick deploys. But "free" has limits.

| Concern | Response |
|---|---|
| here.now has no paid tier | That means no SLA, no support guarantees, no sustainability signal. What happens to your pages if they pivot or shut down? |
| Permanence is fragile | here.now permanent = "on their servers." ZenBin Enterprise = "on Arweave, forever, cryptographically verified." Different guarantee. |
| No video | here.now doesn't support video uploads. ZenBin Pro does. |
| No subdomains | here.now gives you `slug.here.now`. ZenBin gives you `you.zenbin.org` + custom domains on Pro. |
| No signing | here.now auth is an API key (anyone with the key can publish). ZenBin uses Ed25519 signing — content is *cryptographically verified* as yours. |
| TTL is binary | here.now: anonymous = 24h, authenticated = forever. No middle ground. ZenBin: configurable TTL from 24h to 365d, then Arweave for true permanence. |
| Agent trust model | API keys can be leaked. Ed25519 keys can't be used to impersonate you — they verify *who* published, not just *that* someone published. |

**One-liner:** "here.now gives you a URL. ZenBin gives you a guarantee."

---

## 6. Upgrade Path Messaging

### Free → Pro: "You've built something. Now ship it without limits."

**Triggers:**
- Hitting 100 page limit (show: "You've published 87/100 pages this month. Upgrade for unlimited.")
- Wanting video (show video upload with lock icon, CTA: "Video is a Pro feature")
- Wanting a custom domain (show in settings: "Connect your domain — Pro feature")
- Needing TTL > 7 days (show: "Set any expiry up to 365 days — Pro feature")

**In-app messages:**
- At 80 pages: "You're almost at your monthly limit. Pro = unlimited pages for $4.99/mo."
- When trying to upload video: "Video uploads unlock with Pro. Your pages, richer."
- On subdomain settings: "Want a custom domain? That's Pro. Your content, your brand."

**Upgrade CTA variations:**
- "Ship without limits" (action-oriented)
- "Your pages deserve video" (feature-oriented)
- "Pro is $4.99/mo. Less than a coffee." (price anchoring)

### Pro → Enterprise: "Make it permanent."

**Triggers:**
- Wanting content to survive link rot (show: "Arweave permanence — Enterprise feature")
- Needing provenance verification (show: "Prove your content existed, exactly as published — Enterprise")
- Needing more than 5 subdomains (show: "Unlimited subdomains with Enterprise")
- Compliance / audit requirements (show: "Content provenance verification — Enterprise")

**In-app messages:**
- After publishing important content: "Want this to outlive the internet? Arweave permanence stores it forever — Enterprise."
- On version history hitting 10: "You've hit the version history limit. Enterprise gives you full history, stored on Arweave."
- On subdomain settings (6th subdomain): "Unlimited subdomains unlock with Enterprise."

**Upgrade CTA variations:**
- "Make it permanent" (durability-oriented)
- "Arweave-backed. Cryptographically verified. Forever." (trust-oriented)
- "Enterprise is $14.99/mo. Your content, guaranteed permanent." (price-anchored)

### The Upgrade Journey Visual

```
Free                    Pro                    Enterprise
"Try it out"     →    "Ship it"         →    "Guarantee it"
100 pages              Unlimited              Unlimited + Arweave
7-day TTL              365-day TTL            Permanent
1 subdomain            5 subdomains + domain  Unlimited + custom
No video               Video                  Video + provenance
```

---

## 7. Strategic Recommendations Summary

1. **Raise Pro to $4.99, Enterprise to $14.99.** The value stack justifies it, and the competitive landscape supports it (Cloudflare/Vercel/Netlify are $19-20/mo for Pro).

2. **Make TTL the Free-tier hook and the upgrade lever.** Free gets 24h–7d TTL. This makes the free tier *more useful* (temporary sharing is a real use case) while creating a clear upgrade path.

3. **Make Arweave the Enterprise anchor.** This is the feature that no competitor has. It's not "more of the same" — it's a fundamentally different guarantee about content durability. Enterprise should feel like insurance, not just a bigger bucket.

4. **Add annual billing at 20% discount.** $3.99/mo Pro annual, $11.99/mo Enterprise annual. This locks in retention and improves cash flow.

5. **Add a 14-day Pro trial.** Let Free users experience unlimited pages, video, and custom domains. The usage data from 14 days will create switching costs (they'll have content they don't want to lose).

6. **Consider a per-Arweave-page add-on for Pro users.** Pro users who want permanence for *specific* pages shouldn't have to upgrade to Enterprise. $0.50/page for Arweave storage creates an upsell path within Pro.

7. **Lead with "cryptographic authenticity" in messaging.** This is ZenBin's most unique and defensible feature. No competitor offers signed publishing. Make it the first thing people see.

8. **Don't compete with Vercel/Netlify on CI/CD.** ZenBin's lane is agent-native content publishing. The pricing page should say "publish from code, CLI, or agent" — not "deploy from git."

9. **Show the provenance badge.** Enterprise pages should display a visible "Permanently stored on Arweave · Cryptographically verified" badge. This is both a feature and marketing — every permanent page advertises ZenBin.

10. **Track conversion metrics:** Free → Pro conversion rate, Pro → Enterprise conversion rate, time-to-upgrade, most common upgrade trigger. Optimize the upgrade flow based on data, not assumptions.