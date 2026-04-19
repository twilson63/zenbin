# ZenBin Admin System PRD

## Overview

Build a complete administration system for ZenBin that manages API keys, user accounts, billing, and usage tracking. The system must support migration from the current free-tier model to a sustainable API-key-based model.

## Goals

1. Enable agents to self-register and obtain API keys
2. Provide sustainable free tier with fair usage limits
3. Create monetization path via paid plans
4. Maintain zero-friction onboarding for new agents
5. Establish email verification for accountability

## Architecture Decision: SQLite for Admin

**Rationale:** SQLite is the right choice for admin data because:
- **Sharding-proof**: When LMDB shards across nodes, admin stays local
- **SQL queries**: Natural fit for billing aggregations and usage reports
- **Single file**: `./data/admin.sqlite` - portable, easy backup
- **WAL mode**: Good concurrent read/write performance
- **No external deps**: Runs in-process like LMDB

---

## Phased Implementation Plan

### Phase 0: Foundation
**Goal:** Set up SQLite infrastructure and basic schema

#### Step 0.1: Install Dependencies
- Add `better-sqlite3` to package.json
- Add `@types/better-sqlite3` for TypeScript

**Validation:**
```bash
npm test  # All existing tests pass
npm run build  # TypeScript compiles
```

#### Step 0.2: Create Admin Storage Module
- Create `src/storage/admin.ts`
- Initialize SQLite database with WAL mode
- Create migrations system

**Schema:**
```sql
-- Users table (email-based accounts)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,              -- uuid v4
  email TEXT UNIQUE NOT NULL,
  email_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  verification_expires INTEGER,
  created_at INTEGER NOT NULL,
  last_login INTEGER
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,             -- zb_agent_xxx or zb_live_xxx
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,              -- 'agent' | 'user' | 'test'
  plan TEXT NOT NULL DEFAULT 'free',
  name TEXT,                       -- User-defined key name
  monthly_limit INTEGER DEFAULT 100,
  created_at INTEGER NOT NULL,
  last_used INTEGER,
  revoked_at INTEGER
);

-- Usage tracking (monthly aggregates)
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_id TEXT NOT NULL REFERENCES api_keys(id),
  period TEXT NOT NULL,             -- 'YYYY-MM'
  requests INTEGER DEFAULT 1,
  bytes_sent INTEGER DEFAULT 0,
  endpoint TEXT,                    -- 'pages.create', 'pages.view', etc.
  timestamp INTEGER NOT NULL
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  type TEXT NOT NULL,               -- 'verification' | 'password_reset'
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);

-- Subdomain ownership
CREATE TABLE IF NOT EXISTS subdomains (
  name TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  key_id TEXT REFERENCES api_keys(id),
  page_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_key_period ON usage_logs(key_id, period);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
```

**Tests (TDD):**
```typescript
// src/test/admin.test.ts
describe('Admin Storage', () => {
  it('should initialize database with correct schema');
  it('should create users with email');
  it('should generate unique API keys');
  it('should track usage per key');
  it('should enforce monthly limits');
});
```

**Success Criteria:**
- [ ] SQLite database created at `./data/admin.sqlite`
- [ ] All tables created via migration
- [ ] WAL mode enabled
- [ ] All 5+ tests passing

---

### Phase 1: Email Registration Flow
**Goal:** Enable users to register with email and receive API key

#### Step 1.1: User Registration Endpoint
```typescript
POST /v1/register
{
  "email": "agent@example.com"
}

Response:
{
  "message": "Verification email sent",
  "email": "agent@example.com"
}
```

**Implementation:**
- Create `src/routes/auth.ts`
- Generate verification token (UUID v4, 24hr expiry)
- Store in `email_tokens` table
- Send verification email (via SendGrid/Postmark/Resend)

**Tests:**
```typescript
describe('Registration', () => {
  it('should accept valid email');
  it('should reject invalid email format');
  it('should create pending user');
  it('should generate verification token');
  it('should prevent duplicate emails');
});
```

#### Step 1.2: Email Verification Endpoint
```typescript
GET /v1/verify/:token

Response (HTML for browser):
"Your API key is ready! Key: zb_live_xxx..."

Response (JSON):
{
  "verified": true,
  "api_key": "zb_live_xxx",
  "plan": "free",
  "limit": 100
}
```

**Implementation:**
- Validate token exists and not expired
- Mark user as verified
- Generate API key with free tier limits
- Store key in `api_keys` table
- Return key to user

**Tests:**
```typescript
describe('Email Verification', () => {
  it('should verify valid token');
  it('should reject expired token');
  it('should reject used token');
  it('should generate API key on verification');
  it('should return key in response');
});
```

**Success Criteria:**
- [ ] User can register with email
- [ ] Verification email sent (or logged for MVP)
- [ ] Token verification works
- [ ] API key generated and returned
- [ ] All tests passing

---

### Phase 2: API Key Middleware Integration
**Goal:** Update auth middleware to use SQLite-based keys

#### Step 2.1: Update verifyApiKey Middleware
```typescript
// src/middleware/verifyApiKey.ts - Updated
export async function verifyApiKey(c: Context, next: Next) {
  const token = c.req.header('X-API-Key') ||
                c.req.header('Authorization')?.replace('Bearer ', '');

  // 1. Check ZenBin-issued keys (zb_live_, zb_agent_, zb_test_)
  if (token?.startsWith('zb_')) {
    const key = await getApiKey(token);  // SQLite lookup
    if (!key) return c.json({ error: 'Invalid API key' }, 401);
    if (key.revoked_at) return c.json({ error: 'API key revoked' }, 401);

    // Check usage limit
    const usage = await getMonthlyUsage(key.id);
    if (usage >= key.monthly_limit) {
      return c.json({
        error: 'Monthly limit exceeded',
        limit: key.monthly_limit,
        usage: usage
      }, 429);
    }

    c.set('user', key);
    return next();
  }

  // 2. Check JWT (from legacy portal)
  if (token?.includes('.')) {
    // Keep existing JWT verification for backward compatibility
    const decoded = jwt.verify(token, ZENBIN_JWT_SECRET);
    c.set('user', decoded);
    return next();
  }

  // 3. No key - apply strict free tier (migrate to registration prompt)
  return c.json({
    error: 'API key required',
    message: 'Register at /v1/register to get your free API key',
    docs: 'https://zenbin.org/docs/api-keys'
  }, 401);
}
```

**Tests:**
```typescript
describe('API Key Middleware', () => {
  it('should accept valid zb_live_ key');
  it('should reject invalid zb_ key');
  it('should reject revoked key');
  it('should enforce monthly limits');
  it('should track usage per request');
  it('should handle JWT for legacy users');
  it('should require API key (no anonymous)');
});
```

#### Step 2.2: Key Info Endpoint
```typescript
GET /v1/keys/me
Authorization: Bearer zb_live_xxx

Response:
{
  "key_id": "zb_live_abc123",
  "plan": "free",
  "limit": 100,
  "usage": 42,
  "usage_period": "2026-04",
  "reset_at": "2026-05-01T00:00:00Z"
}
```

**Tests:**
```typescript
describe('Key Info', () => {
  it('should return key details');
  it('should show current usage');
  it('should show reset date');
});
```

**Success Criteria:**
- [ ] All `zb_*` keys validated against SQLite
- [ ] Usage tracked per request
- [ ] Monthly limits enforced
- [ ] Legacy JWT still works
- [ ] Anonymous access deprecated (returns 401)
- [ ] All tests passing

---

### Phase 3: Migration Path for Existing Users
**Goal:** Smooth transition for agents currently using free tier

#### Step 3.1: Migration Endpoint
```typescript
POST /v1/migrate
{
  "email": "existing-user@example.com"
}

Response:
{
  "message": "Verification email sent to existing-user@example.com",
  "note": "Your existing pages will be linked to your new account"
}
```

**Implementation:**
- Detect existing usage via IP/User-Agent fingerprint
- Send verification email
- On verification, attempt to link anonymous pages to new account
- Use PostHog distinct_id matching if available

**Tests:**
```typescript
describe('Migration', () => {
  it('should accept email from existing users');
  it('should link anonymous pages on verification');
  it('should preserve existing subdomains');
  it('should generate key with bonus quota for early adopters');
});
```

#### Step 3.2: Grace Period
- Keep anonymous access working for 30 days
- Show warning header: `X-ZenBin-Warning: API key required after 2026-05-19`
- Log anonymous requests for migration outreach

**Success Criteria:**
- [ ] Migration endpoint works
- [ ] Existing users can register and keep their content
- [ ] Grace period warning in place
- [ ] All tests passing

---

### Phase 4: Agent Self-Service Keys
**Goal:** Allow agents to self-generate keys without email (lower tier)

#### Step 4.1: Agent Key Generation
```typescript
POST /v1/keys/generate
{
  "name": "my-coding-agent",
  "distinct_id": "optional-posthog-id"
}

Response:
{
  "api_key": "zb_agent_xxx",
  "plan": "agent",
  "limit": 500,
  "name": "my-coding-agent"
}
```

**Implementation:**
- Generate key without email verification
- Lower tier: 500 requests/month (vs 100 for free)
- Track via PostHog distinct_id for analytics
- Rate limit generation per IP (1 key per day)

**Tests:**
```typescript
describe('Agent Key Generation', () => {
  it('should generate agent key without email');
  it('should enforce rate limit per IP');
  it('should accept optional distinct_id');
  it('should return 500 monthly limit');
  it('should track key creation in PostHog');
});
```

**Success Criteria:**
- [ ] Agents can self-generate keys
- [ ] Rate limiting prevents abuse
- [ ] PostHog tracking integrated
- [ ] All tests passing

---

### Phase 5: Usage Analytics & Dashboard
**Goal:** Provide visibility into usage for users and admins

#### Step 5.1: Usage Dashboard Endpoint
```typescript
GET /v1/usage
Authorization: Bearer zb_live_xxx

Response:
{
  "period": "2026-04",
  "requests": 42,
  "limit": 100,
  "breakdown": {
    "pages.create": 10,
    "pages.view": 25,
    "subdomains.create": 2,
    "other": 5
  },
  "daily": [
    { "date": "2026-04-19", "requests": 12 },
    { "date": "2026-04-18", "requests": 8 }
  ]
}
```

**Tests:**
```typescript
describe('Usage Analytics', () => {
  it('should return usage summary');
  it('should break down by endpoint');
  it('should show daily trend');
});
```

#### Step 5.2: Admin Stats Endpoint
```typescript
GET /v1/admin/stats
Authorization: Bearer zb_admin_xxx

Response:
{
  "total_users": 1234,
  "total_keys": 1500,
  "active_keys_30d": 234,
  "total_requests_30d": 50000,
  "requests_by_plan": {
    "free": 10000,
    "agent": 25000,
    "pro": 15000
  }
}
```

**Success Criteria:**
- [ ] Users can view their usage
- [ ] Admin can view system stats
- [ ] All tests passing

---

### Phase 6: Billing Integration (Future)
**Goal:** Monetization via Stripe

#### Step 6.1: Stripe Integration
- Add Stripe SDK
- Create checkout session endpoint
- Handle webhook for payment confirmation
- Upgrade plan on successful payment

#### Step 6.2: Plan Tiers

| Plan | Price | Requests/mo | Features |
|------|-------|-------------|----------|
| Free | $0 | 100 | Basic |
| Agent | $0 | 500 | Self-registered |
| Pro | $9/mo | 10,000 | Priority, subdomains |
| Enterprise | $99/mo | Unlimited | Custom domains, SLA |

**Success Criteria:**
- [ ] Stripe checkout works
- [ ] Plan upgrades automatic
- [ ] Webhook handling robust
- [ ] All tests passing

---

## File Structure

```
src/
├── storage/
│   ├── db.ts              # LMDB (content, sharded)
│   └── admin.ts           # SQLite (keys, users, billing)
├── routes/
│   ├── auth.ts            # Registration, verification
│   ├── keys.ts            # API key management
│   ├── usage.ts           # Usage analytics
│   └── admin.ts           # Admin stats
├── middleware/
│   └── verifyApiKey.ts    # Updated auth middleware
├── email/
│   └── sender.ts          # Email service abstraction
└── test/
    ├── admin.test.ts      # SQLite storage tests
    ├── auth.test.ts       # Registration flow tests
    └── keys.test.ts       # Key management tests
```

---

## Delegation Plan

### Tasks for Hive/Cody

| Phase | Task | Skills Needed |
|-------|------|---------------|
| 0.1 | Install better-sqlite3 | npm, package.json |
| 0.2 | Create admin.ts with schema | TypeScript, SQLite |
| 1.1 | Create auth.ts registration | Hono, validation |
| 1.2 | Create verification flow | Email (mock for MVP) |
| 2.1 | Update verifyApiKey middleware | Hono middleware |
| 2.2 | Create keys.ts endpoints | REST API |
| 3.1 | Create migration endpoint | Data migration |
| 3.2 | Add grace period warnings | HTTP headers |
| 4.1 | Create agent key generation | Rate limiting |
| 5.1 | Create usage dashboard | Analytics queries |

### Orchestration Strategy

1. **Phase 0**: Delegate to Cody (storage layer, no API changes)
2. **Phase 1**: Delegate registration flow (new endpoints)
3. **Phase 2**: Kong implements (modifies core middleware)
4. **Phase 3**: Delegate migration logic
5. **Phase 4-6**: Delegate incrementally

---

## Testing Strategy (TDD)

### Unit Tests
- Each endpoint has dedicated test file
- SQLite uses `:memory:` for test isolation
- Mock email service for registration tests

### Integration Tests
- Full flow: register → verify → create page
- Rate limit testing with burst requests
- Migration flow with existing data

### Success Gates
- `npm test` must pass before any merge
- Coverage target: 80% for new code
- Manual testing in staging before production

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Email deliverability | Start with mock (log token), add real provider later |
| Rate limit bypass | IP-based + key-based limits |
| SQLite corruption | WAL mode + daily backups |
| Migration data loss | Keep anonymous pages for 30 days |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 0 | 2 days | None |
| 1 | 3 days | Phase 0 |
| 2 | 2 days | Phase 1 |
| 3 | 2 days | Phase 2 |
| 4 | 2 days | Phase 3 |
| 5 | 2 days | Phase 4 |
| 6 | 5 days | Phase 5 |

**Total: ~18 days** (can parallelize some phases)

---

## Success Metrics

| Metric | Current | Target (3 months) |
|--------|---------|-------------------|
| Registered users | 0 | 500 |
| API keys issued | 0 | 750 |
| Paid conversions | 0 | 10 |
| Monthly requests | ~2,000 | 50,000 |
| Revenue | $0 | $500/mo |