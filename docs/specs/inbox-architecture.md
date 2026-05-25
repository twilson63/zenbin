# ZenBin Inbox — Architecture & Context Boundary Analysis

## Current Architecture

```
src/
├── types.ts              — Centralized type definitions
├── rules.ts              — Pure business functions (no DB, no HTTP, no side effects)
├── config.ts             — Env-based config (lazy getters)
├── errors.ts             — Error codes + error response helpers
├── index.ts              — App setup, route registration, server start
│
├── storage/
│   ├── db.ts             — LMDB storage layer (723 lines)
│   └── video.ts          — Filesystem video storage
│
├── services/
│   ├── interfaces.ts     — Service contracts
│   ├── container.ts      — DI container (createServices)
│   ├── pageService.ts    — Page CRUD + limit checks + usage tracking
│   ├── subdomainService.ts
│   ├── keyService.ts
│   ├── nonceService.ts
│   ├── auditService.ts
│   ├── billingService.ts
│   └── videoService.ts
│
├── routes/
│   ├── pages.ts          — Page CRUD endpoints (signed agent middleware)
│   ├── subdomains.ts
│   ├── keys.ts
│   ├── adminKeys.ts
│   ├── billing.ts
│   ├── verify.ts
│   ├── render.ts
│   ├── subdomainRender.ts
│   ├── wellKnown.ts
│   ├── stats.ts
│   ├── agent.ts
│   ├── landing.ts
│   └── proxy.ts
│
├── middleware/
│   ├── signedAgent.ts    — CAP/X-Zenbin signature verification
│   ├── verifyApiKey.ts
│   ├── authRateLimit.ts
│   ├── rateLimit.ts
│   └── proxyRateLimit.ts
│
├── utils/
│   ├── httpSignature.ts  — Canonical request building, Ed25519 verification
│   ├── etag.ts
│   ├── auth.ts
│   └── validation.ts
│
├── analytics/
│   └── posthog.ts
│
├── docs/
│   │   ├── agentInstructions.ts
│   │   ├── registerInstructions.ts
│   │   └── agentSetupInstructions.ts
│
├── sharding/
│   ├── router.ts
│   ├── shard.ts
│   ├── metadata.ts
│   └── index.ts
│
└── test/
    ├── setup.ts
    ├── helpers/signing.ts
    └── *.test.ts
```

## Boundary Rules (Existing)

1. **types.ts** is the single source of truth for data shapes. All services and routes import from here.
2. **rules.ts** is pure — no DB, no HTTP. Business logic lives here.
3. **storage/db.ts** is raw LMDB operations. Services wrap it. Routes never import db directly.
4. **services/** implement interfaces.ts contracts. Each service wraps storage + adds business logic.
5. **routes/** are thin HTTP handlers. They call services, never storage directly.
6. **middleware/signedAgent.ts** handles all signature verification. Routes check `c.get('signedAgent')`.
7. **DI container** (`createServices()`) wires everything. Injected into request context.

## Inbox Feature — Where Each Piece Lives

### New Files

| File | Purpose |
|------|---------|
| `src/routes/inbox.ts` | HTTP handlers for all 8 inbox endpoints |
| `src/services/inboxService.ts` | InboxService implementing IInboxService |

### Modified Files

| File | What Changes |
|------|-------------|
| `src/types.ts` | Add `InboxItem`, `InboxConfig` types |
| `src/services/interfaces.ts` | Add `IInboxService` interface |
| `src/services/container.ts` | Add `inbox` to Services + createServices |
| `src/rules.ts` | Add `PLAN_INBOX_LIMITS`, `checkInboxLimit`, `checkInboxSize` |
| `src/storage/db.ts` | Add `inboxConfigDb`, `inboxItemDb`, `inboxOwnerIndexDb` + CRUD functions |
| `src/index.ts` | Register `app.route('/v1/inbox', inbox)` |
| `src/config.ts` | Add inbox config (webhook timeout, retry counts, free tier TTL) |
| `src/docs/agentInstructions.ts` | Add inbox setup/delivery docs |

### Boundary Decisions

#### 1. Storage Layer: Add to db.ts or new file?

**Decision: Add to `db.ts`.** The existing pattern is one file for all LMDB stores. Adding 3 new databases (inboxConfigDb, inboxItemDb, inboxOwnerIndexDb) follows the same pattern. If db.ts gets too large (>1000 lines), we can split later. For now, consistency wins.

#### 2. Webhook Delivery: Service or Standalone?

**Decision: Service method.** `InboxService.deliver()` calls `InboxService.notifyWebhook()` after storing the item. Webhook logic is async, retryable, and scoped to inbox — it belongs in InboxService, not in a separate worker or middleware. The service already has the config (webhookUrl, webhookSecret).

However, the actual HTTP POST for the webhook should use a utility function in `src/utils/webhook.ts` so it's testable and reusable if we add webhooks to other features later.

#### 3. Auto-Expiry: Cron Job or Inline?

**Decision: Cron job.** The expiry sweep runs hourly. This is a background task, not request-scoped. Options:
- Node.js `setInterval` in `index.ts` (simple, matches current pattern)
- Separate cron process (overkill for v1)

Use `setInterval` in `index.ts` calling `InboxService.expireItems()`. Same pattern as how we'd add any background maintenance task. Clean and testable.

#### 4. Inbox Policy Check: Route or Service?

**Decision: Service.** The allowlist/blocklist check is business logic. The route calls `services.inbox.checkDeliveryAllowed(recipientKeyId, senderKeyId)` which returns `{ allowed: boolean, reason?: string }`. This keeps the route thin and the rule testable.

The underlying rule (blocklist beats allowlist) could live in `rules.ts` as a pure function: `checkInboxDeliveryPolicy(mode, allowlist, blocklist, senderKeyId)`.

#### 5. Inbox Limits: Part of PLAN_LIMITS or Separate?

**Decision: Separate constant.** Inbox limits are a different dimension from page/subdomain limits. Add `PLAN_INBOX_LIMITS` to `rules.ts` alongside the existing `PLAN_LIMITS`. They share the same pattern but are independent data.

```typescript
export const PLAN_INBOX_LIMITS: Record<Plan, {
  itemsPerMonth: number;
  maxInboxSize: number;
  maxItemSize: number;
  itemTtlDays: number | null;  // null = never expires
}> = {
  free:     { itemsPerMonth: 500, maxInboxSize: 100,  maxItemSize: 65_536, itemTtlDays: 30 },
  pro:      { itemsPerMonth: 2000, maxInboxSize: 500,  maxItemSize: 65_536, itemTtlDays: null },
  enterprise: { itemsPerMonth: Infinity, maxInboxSize: 2000, maxItemSize: 65_536, itemTtlDays: null },
};
```

#### 6. Billing Integration: New Usage Field?

**Decision: Add `monthlyInboxCount` to AgentKey.** Same pattern as `monthlyPageCount` and `monthlySubdomainCount`. The billing cycle reset clears it. The usage endpoint reports it.

This means modifying:
- `AgentKey` type in `types.ts` — add `monthlyInboxCount: number`
- `incrementAgentKeyUsage` in `db.ts` — add `'monthlyInboxCount'` to the union
- Billing cycle reset in `db.ts` — clear `monthlyInboxCount`

#### 7. Route Middleware: Which to Apply?

**Decision: `requireSignedAgent` for all write endpoints, `requireSignedAgentForGet` for GET endpoints.** Same pattern as pages. The inbox routes use the existing middleware — no new middleware needed.

The one subtlety: `POST /v1/inbox/:recipientKeyId` (deliver) is signed by the **sender**, not the recipient. The middleware extracts `senderKeyId` from the signature headers. The route then looks up the recipient by path param. This works because `requireSignedAgent` validates whoever signed the request — it doesn't care about the recipient.

## Data Flow Diagrams

### Deliver Message

```
Sender → POST /v1/inbox/:recipientKeyId (signed by sender)
  │
  ├── requireSignedAgent middleware (validates sender signature)
  │
  ├── Route handler:
  │   ├── Validate body (content, contentType, subject)
  │   ├── Check recipient key exists and is active
  │   ├── Check inbox config exists (404 if not)
  │   ├── services.inbox.checkDeliveryAllowed(recipientKeyId, senderKeyId)
  │   │   └── rules.checkInboxDeliveryPolicy(mode, allowlist, blocklist, senderKeyId)
  │   ├── services.inbox.checkInboxLimit(recipientKeyId)
  │   │   └── rules.checkInboxLimit(plan, currentCount)
  │   ├── services.inbox.deliver(item)
  │   │   ├── Store item in inboxItemDb
  │   │   ├── Add to inboxOwnerIndexDb
  │   │   ├── Track usage (incrementAgentKeyUsage)
  │   │   └── services.inbox.notifyWebhook(config, item)
  │   │       └── utils/webhook.ts (POST with HMAC, retries)
  │   └── Return 201 with item metadata + signature info
  │
  └── Audit: inbox_deliver
```

### Read Inbox

```
Owner → GET /v1/inbox/:itemId (signed by owner)
  │
  ├── requireSignedAgentForGet middleware (validates owner signature)
  │
  ├── Route handler:
  │   ├── services.inbox.getItem(itemId)
  │   ├── Verify ownerKeyId matches signed key
  │   ├── If status='unread', auto-mark as read
  │   └── Return full item content + sender signature metadata
  │
  └── Audit: inbox_read
```

### Expiry Sweep (Background)

```
setInterval (every 60 min)
  │
  └── services.inbox.expireItems()
      ├── Query inboxItemDb for items where expiresAt < now
      ├── Delete each expired item
      ├── Remove from inboxOwnerIndexDb
      └── Log count of expired items
```

## New Utility: webhook.ts

```typescript
// src/utils/webhook.ts

interface WebhookOptions {
  url: string;
  secret?: string;
  payload: object;
  timeoutMs?: number;
  maxRetries?: number;
}

interface WebhookResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  attempts: number;
}

export async function deliverWebhook(options: WebhookOptions): Promise<WebhookResult>;
export function computeWebhookSignature(secret: string, payload: string): string;
```

This is a general-purpose webhook utility. If we add webhooks to other features later, we reuse it.

## Summary

The inbox feature fits cleanly into the existing architecture:
- **Types** → types.ts
- **Business rules** → rules.ts (pure functions)
- **Storage** → db.ts (3 new LMDB databases)
- **Service** → inboxService.ts (implements IInboxService)
- **Routes** → inbox.ts (thin HTTP handlers)
- **Utility** → webhook.ts (reusable webhook delivery)
- **Config** → config.ts (webhook timeout, retry, TTL settings)
- **Background** → index.ts (expiry sweep setInterval)

No new directories. No new middleware. No new patterns. Just more of what's already working.