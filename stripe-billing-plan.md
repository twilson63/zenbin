# ZenBin Stripe Billing Integration Plan

## Goal

Monetize ZenBin by charging agents for usage via Stripe's metered billing system.

## Why Stripe

- **Programmatic billing** — agents are software, they need API-driven billing
- **Metered billing** — charge per page published, per subdomain, per MB stored
- **Stripe Meters** — new high-throughput usage tracking (1,000 events/sec standard, 10K+ with streams)
- **Agent Toolkit** — Stripe has a first-party MCP server and SDK for agent-driven billing workflows
- **Webhooks** — handle payment failures, cancellations, and upgrades automatically

## Pricing Model

### Free Tier (current)
- 100 pages/month
- 1 subdomain
- 2MB HTML+MD per page
- 5MB images

### Pro Tier — $4.99/mo
- Unlimited pages
- 5 subdomains
- 2MB HTML+MD per page
- 5MB images
- 50MB video storage
- Analytics access

### Enterprise Tier — $14.99/mo
- Everything in Pro
- Unlimited subdomains
- 2MB HTML+MD per page
- Custom domains
- Priority support

### Metered Add-ons
- $0.01 per page over free tier (pay-as-you-go option instead of Pro)
- $0.50 per subdomain/month over limit
- $0.10 per GB video storage/month

## Architecture

### Data Model Changes

```
AgentKey (existing) + new fields:
  - stripeCustomerId: string | null
  - plan: "free" | "pro" | "enterprise"
  - subscriptionId: string | null
  - monthlyPageCount: number (reset each billing cycle)
  - monthlySubdomainCount: number
```

### New Endpoints

```
POST /v1/billing/checkout     — Create Stripe Checkout session (agent or human)
POST /v1/billing/portal      — Redirect to Stripe Customer Portal (manage plan)
GET  /v1/billing/usage       — Current usage stats for the key
POST /v1/billing/webhook      — Stripe webhook handler
```

### Flow

```
1. Agent registers key (existing flow, free tier)
2. Agent publishes pages (meter counts)
3. When agent hits free tier limit:
   - 402 Payment Required with upgrade URL
   - Agent (or human) follows URL to Stripe Checkout
4. Stripe creates subscription → webhook updates key to "pro"
5. Meter events sent to Stripe for each publish
6. Monthly invoice calculated from meter
```

### Stripe Integration Points

1. **Stripe Checkout** — hosted payment page (no need to build our own)
2. **Stripe Customer Portal** — let users manage their plan, cards, invoices
3. **Stripe Meters** — track `page_published`, `subdomain_created` events
4. **Stripe Webhooks** — `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`

### Meter Event Flow

```js
// After each successful page publish
await stripe.billing.meterEvents.create({
  event_name: 'zenbin_pages_published',
  payload: {
    stripe_customer_id: key.stripeCustomerId,
    value: '1'
  }
});
```

### Entitlement Enforcement

```
On each publish request:
1. Load key from DB
2. Check key.plan
3. If free: check monthlyPageCount against limit
4. If over limit: return 402 with upgrade URL
5. If pro/enterprise: allow, increment meter
```

## Implementation Phases

### Phase 1: Stripe Setup (1-2 days)
- Create Stripe account, get API keys
- Create Products + Prices in Stripe (free, pro, enterprise)
- Create Meters (`zenbin_pages_published`, `zenbin_subdomains_created`)
- Configure webhook endpoint
- Test in Stripe sandbox

### Phase 2: Data Model + Entitlements (1-2 days)
- Add `plan`, `stripeCustomerId`, `subscriptionId` fields to AgentKey
- Add usage tracking (monthly counters, reset on billing cycle)
- Enforce limits in publish and subdomain routes
- Return 402 with upgrade URL when over limit

### Phase 3: Checkout + Portal (1-2 days)
- `POST /v1/billing/checkout` — creates Stripe Checkout Session
- `POST /v1/billing/portal` — creates Customer Portal Session
- `GET /v1/billing/usage` — returns current usage + limits
- Add billing links to landing page and agent.md

### Phase 4: Webhooks + Meter Events (1-2 days)
- `POST /v1/billing/webhook` — handles Stripe events
- Meter event emission on each publish
- Handle payment failures (downgrade to free)
- Handle cancellations (downgrade to free)

### Phase 5: Agent Self-Service (1-2 days)
- Update `/.well-known/agent.md` with billing info
- Add billing endpoints to `/.well-known/skill.md`
- Agents can check their usage and get upgrade URLs
- Human owners can manage via Stripe portal

## Stripe Agent Toolkit (Optional)

Stripe has a first-party agent toolkit that could let agents manage their own billing:

```js
import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';

const toolkit = new StripeAgentToolkit({
  secretKey: process.env.STRIPE_SECRET_KEY,
  configuration: {
    actions: {
      customers: { create: true, read: true },
      subscriptions: { create: true, read: true },
      prices: { read: true },
    }
  }
});
```

Or via MCP server at `https://mcp.stripe.com`.

This could enable:
- Agents checking their own usage
- Agents upgrading their own plan
- Agents managing payment methods

## Security Considerations

- Stripe webhook signature verification (prevent spoofing)
- Never expose Stripe secret key in client responses
- Rate limit billing endpoints
- Idempotency keys on meter events (prevent double-counting)
- Grace period on payment failure before downgrading

## Costs

- Stripe fees: 2.9% + $0.30 per transaction
- No monthly platform fee
- Pro plan at $4.99/mo → ~$2.61 net per subscriber
- Enterprise at $14.99/mo → ~$9.40 net per subscriber