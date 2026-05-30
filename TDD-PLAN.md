# ZenBin TDD Implementation Plan
## Re-Architecture + Stripe Billing

**Branch:** `feature/rearch-stripe` (from `main`)
**Approach:** TDD — write failing tests first, implement to pass, refactor
**All 149 existing tests must continue passing at every step**

---

## Phase 0: Foundation
> Prepare the branch, extract types, ensure clean baseline

### Step 0.1: Create feature branch from main
- [ ] `git checkout main && git pull && git checkout -b feature/rearch-stripe`
- [ ] Verify all 149 tests pass
- **Success criteria:** `npx vitest run` → 149/149 pass, branch exists

### Step 0.2: Extract shared types to `src/types.ts`
- [ ] Create `src/types.ts` with all interfaces currently in `src/storage/db.ts`:
  - `Page`, `PageAuth`, `Subdomain`, `AgentKey`, `NonceRecord`, `AuditLogRecord`
  - `SaveResult`, `SubdomainResult`
  - New: `Plan` type (`'free' | 'pro' | 'enterprise'`)
  - New: `BillingInfo` interface (`stripeCustomerId`, `subscriptionId`, `plan`, `monthlyPageCount`, `monthlySubdomainCount`)
- [ ] Create `src/types/billing.ts` with plan-related types
- [ ] Update `src/storage/db.ts` to import types from `src/types.ts`
- [ ] Write tests:
  - `src/test/types.test.ts` — verify type imports resolve, Plan type accepts valid values
- **Success criteria:** All types importable from `src/types.ts`, all 149 tests still pass

### Step 0.3: Extract validation functions to `src/rules.ts`
- [ ] Create `src/rules.ts` — pure business rule functions (no DB, no HTTP, no side effects)
- [ ] Move these from `src/utils/validation.ts`:
  - `validateId`, `validatePageBody`, `validateAuthInput`, `decodeHtml`, `decodeMarkdown`
- [ ] Move these from route handlers to pure functions:
  - `canManageSubdomain(ownerKeyId, keyId, hasOverrideScope)` → boolean
  - `canModifyPage(pageOwnerKeyId, keyId, hasOverrideScope)` → boolean
  - `isWithinFreeTier(monthlyPageCount, limit)` → boolean
  - `checkPlanLimits(plan, monthlyPageCount, monthlySubdomainCount, limits)` → `{ allowed: boolean, reason?: string }`
- [ ] Write tests:
  - `src/test/rules.test.ts` — test every pure function with edge cases
- **Success criteria:** All validation/pure functions have tests, `src/utils/validation.ts` re-exports for backward compat, all 149 tests pass

### Step 0.4: Create service interfaces in `src/services/`
- [ ] Create `src/services/interfaces.ts` — abstract service contracts:
  ```
  IPageService     — save, get, delete, count, listBySubdomain
  ISubdomainService — save, get, delete, count, incrementPage, decrementPage
  IKeyService      — save, get, list, count, updateStatus, touch
  INonceService    — register, check
  IAuditService    — save, list
  IVideoService    — save, delete, exists, getPath, getMimeType
  IBillingService  — createCheckout, createPortal, getUsage, recordMeterEvent, handleWebhook
  ```
- [ ] Write tests:
  - `src/test/services-interfaces.test.ts` — verify interface contracts (shape checks)
- **Success criteria:** All interfaces defined, TypeScript compiles, all 149 tests pass

---

## Phase 1: Stripe Billing — Data Model
> Add billing fields and plan enforcement without Stripe API yet

### Step 1.1: Extend AgentKey with billing fields
- [ ] Add to `AgentKey` interface in `src/types.ts`:
  ```ts
  plan: Plan;
  stripeCustomerId?: string;
  subscriptionId?: string;
  monthlyPageCount: number;
  monthlySubdomainCount: number;
  billingCycleStart?: string;
  ```
- [ ] Update `saveAgentKey` to accept and persist new fields
- [ ] Default `plan` to `'free'` for existing keys
- [ ] Write tests:
  - `src/test/billing-data.test.ts`:
    - saveAgentKey with plan='pro' persists correctly
    - Existing keys without plan field default to 'free'
    - Can update plan from free to pro
    - Monthly counters persist and increment
    - Billing cycle start timestamp stores correctly
- **Success criteria:** AgentKey schema supports billing, backward compat (old keys default to free), all 149 tests pass

### Step 1.2: Implement plan-based limit checking in `src/rules.ts`
- [ ] Add `PLAN_LIMITS` constant:
  ```ts
  export const PLAN_LIMITS = {
    free:       { pagesPerMonth: 100, subdomains: 1, maxPageSize: 2097152, videoStorage: 0 },
    pro:        { pagesPerMonth: Infinity, subdomains: 5, maxPageSize: 2097152, videoStorage: 52428800 },
    enterprise: { pagesPerMonth: Infinity, subdomains: Infinity, maxPageSize: 2097152, videoStorage: Infinity },
  };
  ```
- [ ] Add pure functions:
  - `checkPageLimit(plan, monthlyPageCount)` → `{ allowed, reason? }`
  - `checkSubdomainLimit(plan, currentCount)` → `{ allowed, reason? }`
  - `checkPageSizeLimit(plan, contentSize)` → `{ allowed, reason? }`
  - `getPlanFromKey(agentKey)` → `Plan`
- [ ] Write tests:
  - `src/test/rules.test.ts` (extend):
    - Free tier: allows < 100 pages, blocks at 100
    - Pro tier: allows unlimited pages
    - Enterprise: allows unlimited everything
    - Subdomain limits: 1 free, 5 pro, ∞ enterprise
    - Page size limits enforced per plan
- **Success criteria:** All limit-checking rules have comprehensive tests, all 149 tests pass

### Step 1.3: Enforce plan limits in route handlers
- [ ] In `pages.ts` POST handler: check `checkPageLimit` before saving
  - Return 402 with `{ error, plan, upgradeUrl }` when over limit
- [ ] In `subdomains.ts` POST handler: check `checkSubdomainLimit` before claiming
  - Return 402 with upgrade info when over limit
- [ ] Add `upgradeUrl` to config: `config.stripe.checkoutBaseUrl`
- [ ] Write tests:
  - `src/test/billing-enforcement.test.ts`:
    - Free key at 100 pages → next publish returns 402
    - Free key at 99 pages → publish succeeds (201)
    - Pro key → publish succeeds regardless of count
    - Free key with 1 subdomain → claim returns 402
    - Pro key with 5 subdomains → claim returns 402
    - Enterprise key → all operations succeed
    - 402 response includes `upgradeUrl` field
- **Success criteria:** Plan limits enforced at route level, 402 returned with upgrade URL, all 149+ tests pass

### Step 1.4: Usage tracking — increment monthly counters
- [ ] On successful page create → increment `key.monthlyPageCount`
- [ ] On successful subdomain claim → increment `key.monthlySubdomainCount`
- [ ] Add `incrementKeyUsage(keyId, field)` to storage
- [ ] Add billing cycle reset logic (compare `billingCycleStart` to now)
- [ ] Write tests:
  - `src/test/billing-usage.test.ts`:
    - Page create increments monthlyPageCount
    - Subdomain claim increments monthlySubdomainCount
    - Counter resets when billing cycle passes
    - Counter does not reset within same cycle
- **Success criteria:** Usage counters track correctly, cycle reset works, all tests pass

---

## Phase 2: Stripe Integration
> Connect real Stripe API for checkout, webhooks, and metering

### Step 2.1: Add Stripe SDK and configuration
- [ ] `npm install stripe`
- [ ] Add to `src/config.ts`:
  ```ts
  get stripe() {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      proPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
      enterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
      checkoutSuccessUrl: process.env.STRIPE_CHECKOUT_SUCCESS_URL || '',
      portalReturnUrl: process.env.STRIPE_PORTAL_RETURN_URL || '',
    };
  },
  ```
- [ ] Create `src/services/stripe.ts` — Stripe client wrapper
- [ ] Write tests:
  - `src/test/stripe-config.test.ts`:
    - Config reads from env vars
    - Stripe client initializes with secret key
    - Missing secret key → graceful fallback (billing endpoints return 503)
- **Success criteria:** Stripe SDK installed, config reads env vars, all tests pass

### Step 2.2: Implement billing service
- [ ] Create `src/services/billingService.ts` implementing `IBillingService`:
  - `createCheckoutSession(keyId, plan)` → `{ url, sessionId }`
  - `createPortalSession(stripeCustomerId)` → `{ url }`
  - `getUsage(keyId)` → `{ plan, pagesUsed, subdomainsUsed, limits }`
  - `handleWebhook(event)` → processes checkout.completed, subscription.deleted, invoice.payment_failed
  - `recordMeterEvent(keyId, eventName, value)` → void
- [ ] Write tests:
  - `src/test/billing-service.test.ts`:
    - createCheckout returns session URL
    - createPortal returns portal URL
    - getUsage returns current counters and limits
    - Webhook: checkout.completed upgrades key to pro/enterprise
    - Webhook: subscription.deleted downgrades key to free
    - Webhook: invoice.payment_failed marks key for grace period
    - recordMeterEvent calls Stripe API
- **Success criteria:** Billing service fully tested with mocked Stripe, all tests pass

### Step 2.3: Add billing routes
- [ ] Create `src/routes/billing.ts`:
  ```
  POST /v1/billing/checkout    — create checkout session
  POST /v1/billing/portal     — create customer portal session
  GET  /v1/billing/usage      — get current usage (requires signed agent)
  POST /v1/billing/webhook    — Stripe webhook (raw body, signature verify)
  ```
- [ ] Mount in `src/index.ts`
- [ ] Write tests:
  - `src/test/billing-routes.test.ts`:
    - POST /checkout with valid keyId → 200 + URL
    - POST /checkout with invalid keyId → 404
    - GET /usage with free key → shows free limits
    - GET /usage with pro key → shows pro limits
    - POST /webhook with valid signature → 200
    - POST /webhook with invalid signature → 400
    - POST /webhook checkout.completed → upgrades key
    - POST /webhook subscription.deleted → downgrades key
- **Success criteria:** All billing routes tested, Stripe webhook verified, all tests pass

### Step 2.4: Create Stripe products and prices (manual)
- [ ] In Stripe dashboard (test mode):
  - Create Product: "ZenBin Pro" — $4.99/mo recurring
  - Create Product: "ZenBin Enterprise" — $14.99/mo recurring
  - Create Meter: `zenbin_pages_published` (per-unit)
  - Create Meter: `zenbin_subdomains_created` (per-unit)
  - Set price IDs in env vars
- [ ] Test full checkout flow in sandbox
- **Success criteria:** Stripe products exist in test mode, checkout flow works end-to-end

---

## Phase 3: Service Layer Re-Architecture
> Extract DB calls into service implementations, routes call services only

### Step 3.1: Implement `PageService`
- [ ] Create `src/services/pageService.ts` implementing `IPageService`
- [ ] Move all `savePage`, `getPage`, `deletePage`, `getPageCount`, `listPagesBySubdomain` logic
- [ ] Add usage tracking (call `incrementKeyUsage`)
- [ ] Add plan limit checks (call `checkPageLimit`)
- [ ] Refactor `pages.ts` to call `pageService` instead of `db.*` directly
- [ ] Write tests:
  - `src/test/page-service.test.ts`:
    - savePage creates new page, returns created=true
    - savePage updates existing page, returns created=false
    - savePage enforces plan limits
    - savePage increments usage counters
    - deletePage removes page and video
    - getPage returns page or undefined
    - listPagesBySubdomain filters correctly
- **Success criteria:** PageService wraps all page DB ops, routes use service, all tests pass

### Step 3.2: Implement `SubdomainService`
- [ ] Create `src/services/subdomainService.ts`
- [ ] Move subdomain DB calls + plan limit checks
- [ ] Refactor `subdomains.ts` to use service
- [ ] Write tests:
  - `src/test/subdomain-service.test.ts`:
    - Claim enforces plan subdomain limit
    - Delete cascades pages
    - Page count increment/decrement works
- **Success criteria:** SubdomainService complete, routes use it, all tests pass

### Step 3.3: Implement remaining services
- [ ] `KeyService` — `src/services/keyService.ts`
- [ ] `NonceService` — `src/services/nonceService.ts`
- [ ] `AuditService` — `src/services/auditService.ts`
- [ ] `VideoService` — `src/services/videoService.ts` (wrap existing `storage/video.ts`)
- [ ] Refactor all routes to use services instead of direct DB calls
- [ ] Write tests for each service
- **Success criteria:** No route file directly imports from `storage/db.ts`, all logic goes through services, all tests pass

### Step 3.4: Dependency injection
- [ ] Create `src/services/container.ts` — wires up all service implementations
- [ ] Accept services as constructor params or context, not module singletons
- [ ] Update `src/index.ts` to create container and inject into routes
- [ ] Write tests:
  - `src/test/container.test.ts`:
    - Container creates all services
    - Services can be swapped for mocks
    - Container accepts custom db path for testing
- **Success criteria:** DI container works, services are injectable, all tests pass

---

## Phase 4: Clean Up & Documentation
> Remove technical debt, update docs, verify everything

### Step 4.1: Remove dead code and backward-compat shims
- [ ] Remove `src/utils/validation.ts` re-exports (now in `src/rules.ts`)
- [ ] Remove direct DB imports from route files
- [ ] Remove module-level DB singletons from `storage/db.ts` (services own them)
- [ ] Verify all 149 original tests still pass
- **Success criteria:** No dead code, no shims, clean imports

### Step 4.2: Update `/.well-known/agent.md` with billing info
- [ ] Add billing section: how to check usage, upgrade, manage plan
- [ ] Add billing endpoints to `/.well-known/skill.md`
- [ ] Add pricing table to landing page
- **Success criteria:** Agent.md documents billing flow, skill.md lists billing endpoints

### Step 4.3: Update README and docs
- [ ] Update README with billing section, plan comparison, Stripe setup instructions
- [ ] Update ARCHITECTURE.md with new service layer diagram
- [ ] Remove stale `re-architecture.md` (superseded by this plan)
- **Success criteria:** Docs reflect current architecture

### Step 4.4: Final integration test
- [ ] Spin up sandbox, run ZenBin with Stripe test keys
- [ ] Test full flow: register key → publish to limit → get 402 → checkout → upgrade → publish more
- [ ] Test webhook: simulate subscription cancellation → key downgrades
- [ ] Run full test suite in sandbox
- **Success criteria:** End-to-end billing flow works in sandbox, all tests pass

---

## Summary

| Phase | Steps | New Test Files | Est. Days |
|-------|-------|---------------|-----------|
| 0: Foundation | 4 | types.test.ts, rules.test.ts, services-interfaces.test.ts | 2 |
| 1: Billing Data | 4 | billing-data.test.ts, billing-enforcement.test.ts, billing-usage.test.ts | 2 |
| 2: Stripe | 4 | stripe-config.test.ts, billing-service.test.ts, billing-routes.test.ts | 3 |
| 3: Re-Arch | 4 | page-service.test.ts, subdomain-service.test.ts, container.test.ts | 3 |
| 4: Clean Up | 4 | integration tests | 1 |
| **Total** | **20** | **~12 new test files** | **~11 days** |

## Test Count Target
- Current: 149 tests
- Target: 250+ tests (each step adds 5-10 new tests)
- Rule: No PR merges unless ALL tests pass (old + new)