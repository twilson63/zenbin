# ZenBin Architecture: Current vs Proposed

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              src/index.ts                                   │
│                         (Hono app + route wiring)                           │
└──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┘
           │          │          │          │          │          │
           ▼          ▼          ▼          ▼          ▼          ▼
┌──────────────┐ ┌──────────┐ ┌────────┐ ┌───────┐ ┌────────┐ ┌────────────┐
│  routes/     │ │ routes/  │ │routes/ │ │routes/│ │routes/ │ │  routes/   │
│  pages.ts    │ │ keys.ts  │ │adminK. │ │subdm. │ │ proxy  │ │  render.ts │
│              │ │          │ │  .ts   │ │  .ts  │ │  .ts   │ │            │
│ POST /:id ──┼─┼─ register│ │ CRUD   │ │ claim │ │ POST / │ │ GET /:id   │
│ DEL /:id ───┼─┼──────────┤ │  keys  │ │  sub  │ │  proxy │ │ /:id/image │
│              │ │          │ │        │ │       │ │        │ │ /:id/video │
│  ⚠ 200+ loc │ │  60 loc  │ │ 80 loc │ │90 loc │ │200+loc │ │ /:id/md    │
│  mixed:      │ │  mixed:  │ │mixed:  │ │mixed: │ │mixed:  │ │ /:id/raw   │
│  validate    │ │ validate │ │valid.  │ │valid. │ │valid.  │ │            │
│  auth        │ │ db write │ │db read │ │db r/w │ │ssrf    │ │ 180+ loc   │
│  authz       │ │ audit    │ │db writ │ │audit  │ │fetch   │ │ mixed:     │
│  decode      │ │          │ │audit   │ │       │ │rate lim│ │  auth      │
│  db read     │ │          │ │        │ │       │ │audit   │ │  etag      │
│  db write    │ │          │ │        │ │       │ │        │ │  binary    │
│  video save  │ │          │ │        │ │       │ │        │ │  security  │
│  video del   │ │          │ │        │ │       │ │        │ │  tracking  │
│  etag gen    │ │          │ │        │ │       │ │        │ │            │
│  url build   │ │          │ │        │ │       │ │        │ │            │
│  analytics   │ │          │ │        │ │       │ │        │ │            │
│  audit       │ │          │ │        │ │       │ │        │ │            │
└──────┬───────┘ └────┬─────┘ └───┬────┘ └──┬────┘ └───┬────┘ └─────┬──────┘
       │              │           │         │           │            │
       ▼              ▼           ▼         ▼           ▼            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         middleware/                                          │
│  ┌──────────────┐ ┌────────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐ │
│  │signedAgent   │ │ adminAuth  │ │authRateL.│ │rateLim.│ │proxyRateLim. │ │
│  │              │ │            │ │          │ │        │ │              │ │
│  │ ⚠ 90+ loc   │ │ 10 loc    │ │ 60 loc   │ │50 loc  │ │  50 loc      │ │
│  │ verify sig   │ │ token cmp │ │ in-mem   │ │in-mem  │ │  in-mem      │ │
│  │ check status │ │            │ │ map      │ │map     │ │  map         │ │
│  │ check time   │ │            │ │          │ │        │ │              │ │
│  │ verify digest│ │            │ │          │ │        │ │              │ │
│  │ nonce        │ │            │ │          │ │        │ │              │ │
│  │ audit log    │ │            │ │          │ │        │ │              │ │
│  │ set ctx vars │ │            │ │          │ │        │ │              │ │
│  └──────┬───────┘ └────────────┘ └──────────┘ └────────┘ └──────────────┘ │
└──────────┬──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         storage/                                             │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────────┐  │
│  │  db.ts                   │  │  video.ts                               │  │
│  │                          │  │                                         │  │
│  │  ⚠ 300+ loc              │  │  saveVideo / deleteVideo                │  │
│  │  Page, Subdomain,        │  │  getVideoPath / videoExists             │  │
│  │  AgentKey, NonceRecord,  │  │  getVideoMimeType                      │  │
│  │  AuditLogRecord types    │  │                                         │  │
│  │                          │  │  Direct filesystem I/O                  │  │
│  │  Direct LMDB calls:      │  │                                         │  │
│  │  savePage, getPage,      │  └─────────────────────────────────────────┘  │
│  │  deletePage, getPageCt,  │                                               │
│  │  saveSubdomain, getSub., │                                               │
│  │  deleteSubdomain,        │                                               │
│  │  saveAgentKey, getAgentK,│                                               │
│  │  listAgentKeys,          │                                               │
│  │  updateKeyStatus,        │                                               │
│  │  touchAgentKey,          │                                               │
│  │  registerUsedNonce,      │                                               │
│  │  saveAuditLog,           │                                               │
│  │  listAuditLogsForKey     │                                               │
│  │                          │                                               │
│  │  ⚠ Module-level single- │                                               │
│  │    ton DB instances      │                                               │
│  │  ⚠ Mixed sync/async API │                                               │
│  └──────────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  utils/                   │  analytics/      │  sharding/                   │
│  ┌───────────┐ ┌───────┐  │  ┌───────────┐  │  ┌────────┐ ┌───────────┐   │
│  │validation │ │ auth  │  │  │ posthog.ts│  │  │router  │ │ metadata  │   │
│  │           │ │       │  │  │           │  │  │        │ │           │   │
│  │validateId │ │hashPw │  │  │ 12 track* │  │  │ShardR. │ │ PageMeta  │   │
│  │validatePg │ │verify │  │  │ functions │  │  │contentH│ │ SubdmMeta │   │
│  │validateAu │ │genUrl │  │  │ all take  │  │  │routeBy │ │ initMeta  │   │
│  │validatePr │ │parseB │  │  │ params &  │  │  │Content │ │ getPageM  │   │
│  │decodeHtml │ │       │  │  │ call post-│  │  │        │ │ setPageM  │   │
│  │decodeMd   │ │       │  │  │ hog.client│  │  │        │ │           │   │
│  └───────────┘ └───────┘  │  └───────────┘  │  └────────┘ └───────────┘   │
│  ┌───────┐ ┌────┐ ┌─────┐│                  │  ┌───────────────────────┐   │
│  │ etag  │ │ssrf│ │postH││                  │  │ shard.ts              │   │
│  │       │ │    │ │inject│                  │  │ Shard class           │   │
│  │genEtag│ │res │ │injct││                  │  │ ShardManager          │   │
│  │etagMch│ │vali│ │shld ││                  │  │ (LMDB per shard)      │   │
│  └───────┘ └────┘ └─────┘│                  │  └───────────────────────┘   │
└───────────────────────────┴──────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        config.ts                                            │
│  All runtime config from env vars. Some values used directly by            │
│  routes, middleware, utils, storage — no indirection.                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Current Architecture Problems

| Problem | Where | Impact |
|---------|-------|--------|
| **Business rules in route handlers** | `pages.ts`, `subdomains.ts`, `render.ts` | Hard to test, hard to reuse |
| **Duplicated auth logic** | `pages.ts` (write auth), `render.ts` (read auth), `subdomainRender.ts` (read auth) | 3 separate `verifyPageAuth` implementations |
| **Duplicated content-type logic** | `render.ts`, `subdomainRender.ts` | Same `getDocumentContentType`, `getImageContentType`, `getVideoContentType` |
| **Duplicated security headers** | `render.ts`, `subdomainRender.ts` | Identical `SECURITY_HEADERS` object |
| **Duplicated subdomain page rendering** | `render.ts` vs `subdomainRender.ts` | ~80% code overlap in page rendering |
| **Storage coupled to LMDB** | `db.ts` | Can't swap storage backend or mock in tests |
| **Analytics scattered** | Every route handler calls `track*` directly | Business logic interleaved with tracking |
| **No domain types** | `db.ts` has data types but no behavior | Types are bags of fields, not domain objects |
| **Procedural modules** | `db.ts`, `authRateLimit.ts` | Module-level mutable state, hard to reset/test |
| **Mixed sync/async** | `db.ts` | `putSync` alongside `async function savePage` |

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              src/index.ts                                   │
│                    (Hono app + DI container wiring)                         │
└──────────┬──────────────────────────────┬──────────────────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────────┐  ┌───────────────────────────────────────────────┐
│   routes/ (thin HTTP)   │  │            middleware/ (thin HTTP)            │
│                         │  │                                               │
│  pages.ts ──────────────┼──┼──► signedAgent.ts                            │
│  subdomains.ts ─────────┼──┼──► adminAuth.ts                              │
│  keys.ts ───────────────┼──┼──► rateLimit.ts                              │
│  adminKeys.ts ──────────┼──┼──► telemetry.ts                              │
│  proxy.ts ──────────────┘  │                                               │
│  render.ts                 │  Each middleware: extract request data,       │
│  subdomainRender.ts        │  delegate to domain rules,                    │
│                            │  return Hono Response                         │
│  Each route: parse params, │                                              │
│  call domain function,     └──────────────────────┬────────────────────────┘
│  return Hono Response                             │
└─────────────────────┬────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       domain/ (pure business rules)                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  types.ts  — ADTs (Algebraic Data Types)                           │   │
│  │                                                                     │   │
│  │  // Branded types for domain primitives                            │   │
│  │  type PageId = string & { __brand: 'PageId' }                      │   │
│  │  type SubdomainName = string & { __brand: 'SubdomainName' }        │   │
│  │  type KeyId = string & { __brand: 'KeyId' }                        │   │
│  │  type Etag = string & { __brand: 'Etag' }                          │   │
│  │  type ContentHash = string & { __brand: 'ContentHash' }            │   │
│  │                                                                     │   │
│  │  // Sum types for domain decisions                                 │   │
│  │  type AuthResult =                                                 │   │
│  │    | { ok: true }                                                  │   │
│  │    | { ok: false; error: AuthError; statusCode: number }           │   │
│  │                                                                     │   │
│  │  type OwnershipResult =                                            │   │
│  │    | { ok: true }                                                  │   │
│  │    | { ok: false; error: OwnershipError; statusCode: number }      │   │
│  │                                                                     │   │
│  │  type PageSaveResult =                                             │   │
│  │    | { ok: true; page: Page; created: boolean; urlToken?: string } │   │
│  │    | { ok: false; error: ValidationError; statusCode: number }     │   │
│  │                                                                     │   │
│  │  type SubdomainClaimResult =                                       │   │
│  │    | { ok: true; subdomain: Subdomain; created: boolean }          │   │
│  │    | { ok: false; error: ClaimError; statusCode: number }          │   │
│  │                                                                     │   │
│  │  // Content type ADT                                               │   │
│  │  type PageContent =                                                │   │
│  │    | { kind: 'html'; html: string; contentType: string }           │   │
│  │    | { kind: 'markdown'; markdown: string }                        │   │
│  │    | { kind: 'image'; data: string; contentType: string }          │   │
│  │    | { kind: 'video'; path: string; contentType: string }          │   │
│  │    | { kind: 'mixed'; html: string; markdown?: string;             │   │
│  │        image?: ImageAsset; video?: VideoAsset }                    │   │
│  │                                                                     │   │
│  │  // Render decision ADT                                            │   │
│  │  type RenderDecision =                                             │   │
│  │    | { kind: 'html'; content: string; security: true }             │   │
│  │    | { kind: 'markdown'; content: string }                         │   │
│  │    | { kind: 'binary'; data: Buffer; contentType: string }         │   │
│  │    | { kind: 'video'; path: string; contentType: string }          │   │
│  │    | { kind: 'notModified' }                                       │   │
│  │    | { kind: 'notFound' }                                          │   │
│  │    | { kind: 'authRequired'; realm: string }                       │   │
│  │    | { kind: 'rateLimited'; retryAfter: number }                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ │
│  │ pageRules.ts     │ │ authRules.ts │ │keyRules.ts   │ │subdomainRules │ │
│  │                  │ │              │ │              │ │    .ts        │ │
│  │ canCreatePage()  │ │verifyPageAuth│ │canRegisterK()│ │canClaimSub()  │ │
│  │ canUpdatePage()  │ │verifyUrlToken│ │canBlockKey() │ │validateName() │ │
│  │ canDeletePage()  │ │verifyBasicAu │ │canRevokeKey()│ │canDeleteSub() │ │
│  │ validatePageBody │ │checkRateLimit│ │              │ │               │ │
│  │ decodeContent()  │ │              │ │              │ │               │ │
│  │ computeEtag()    │ │              │ │              │ │               │ │
│  │ buildPageUrls()  │ │              │ │              │ │               │ │
│  │                  │ │              │ │              │ │               │ │
│  │ All pure:        │ │ All pure:    │ │ All pure:    │ │ All pure:     │ │
│  │ input → Result   │ │ input →      │ │ input →      │ │ input →       │ │
│  │                  │ │ AuthResult   │ │ KeyResult    │ │ SubdmResult   │ │
│  └──────────────────┘ └──────────────┘ └──────────────┘ └───────────────┘ │
│                                                                             │
│  ┌──────────────────┐ ┌──────────────────────────────────────────────────┐ │
│  │ renderRules.ts   │ │ proxyRules.ts                                   │ │
│  │                  │ │                                                  │ │
│  │ decideRender()   │ │ validateProxyRequest()                          │ │
│  │ selectContent()  │ │ buildOutgoingHeaders()                          │ │
│  │ shouldInjectPH() │ │ validateRedirectTarget()                        │ │
│  │ computeSecurity  │ │ checkDomainAllowlist()                          │ │
│  │   Headers()      │ │                                                  │ │
│  │                  │ │ All pure — no fetch, no DNS                      │ │
│  │ Single source of │ │                                                  │ │
│  │ truth for render │ │                                                  │ │
│  │ decisions        │ │                                                  │ │
│  └──────────────────┘ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    services/ (side-effect interfaces)                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  interfaces.ts  — Service contracts (no implementations)            │   │
│  │                                                                     │   │
│  │  interface PageStorage {                                            │   │
│  │    get(id: PageId, subdomain?: SubdomainName): Promise<Page | null> │   │
│  │    save(id: PageId, data: PageData, etag: Etag): Promise<SaveRes>  │   │
│  │    delete(id: PageId, subdomain?: SubdomainName): Promise<boolean>  │   │
│  │    count(): number                                                  │   │
│  │    listBySubdomain(sub: SubdomainName): Page[]                      │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface SubdomainStorage {                                       │   │
│  │    get(name: SubdomainName): Promise<Subdomain | null>              │   │
│  │    save(name: SubdomainName, owner: KeyId): Promise<SubdmResult>    │   │
│  │    delete(name: SubdomainName): Promise<boolean>                    │   │
│  │    incrementPageCount(name: SubdomainName): void                    │   │
│  │    decrementPageCount(name: SubdomainName): void                    │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface KeyStorage {                                             │   │
│  │    get(keyId: KeyId): Promise<AgentKey | null>                      │   │
│  │    save(data: KeyData): Promise<AgentKey>                           │   │
│  │    list(): AgentKey[]                                               │   │
│  │    updateStatus(keyId: KeyId, status: KeyStatus): Promise<AgentKey> │   │
│  │    touch(keyId: KeyId): Promise<void>                               │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface NonceStorage {                                           │   │
│  │    register(keyId: KeyId, nonce: string, expiresAt: string):        │   │
│  │      Promise<boolean>                                               │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface AuditStorage {                                           │   │
│  │    log(record: AuditInput): Promise<AuditLogRecord>                 │   │
│  │    listByKey(keyId: KeyId): AuditLogRecord[]                        │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface VideoStorage {                                           │   │
│  │    save(pageId: string, data: Buffer, mime: string,                │   │
│  │      subdomain?: string): Promise<string>                           │   │
│  │    delete(path: string): Promise<void>                              │   │
│  │    exists(path: string): boolean                                    │   │
│  │    read(path: string): Promise<Buffer>                              │   │
│  │    stat(path: string): Promise<FileStat>                            │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface Analytics {                                              │   │
│  │    trackPageView(params: PageViewParams): void                      │   │
│  │    trackPageCreated(params: PageCreatedParams): void                │   │
│  │    trackPageUpdated(params: PageUpdatedParams): void                │   │
│  │    trackPageDeleted(params: PageDeletedParams): void                │   │
│  │    trackApiCall(params: ApiCallParams): void                        │   │
│  │    trackShardDistribution(distribution: Map<string, number>): void  │   │
│  │    capture(event: CaptureEvent): void                               │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface RateLimiter {                                            │   │
│  │    check(key: string): RateLimitResult                              │   │
│  │    recordFailure(key: string): void                                 │   │
│  │    reset(key: string): void                                         │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface SignatureVerifier {                                      │   │
│  │    verifyEd25519(params: VerifyParams): boolean                     │   │
│  │    verifyBodyDigest(body: string, digest: string): boolean          │   │
│  │    buildCanonicalRequest(params: CanonicalParams): string           │   │
│  │  }                                                                  │   │
│  │                                                                     │   │
│  │  interface DnsResolver {                                            │   │
│  │    resolve(hostname: string): Promise<string>                       │   │
│  │  }                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │  implementations/          │  │  implementations/                   │   │
│  │  lmdb/                     │  │  posthog/                           │   │
│  │                            │  │                                     │   │
│  │  LMDBPageStorage           │  │  PosthogAnalytics                   │   │
│  │  LMDBSubdomainStorage      │  │  implements Analytics               │   │
│  │  LMDBKeyStorage            │  │                                     │   │
│  │  LMDBNonceStorage          │  │  No-opAnalytics (for tests)         │   │
│  │  LMDBAuditStorage          │  │  implements Analytics               │   │
│  │  LMDBVideoStorage          │  └─────────────────────────────────────┘   │
│  │                            │                                             │
│  │  Each wraps LMDB calls,   │  ┌─────────────────────────────────────┐   │
│  │  no business logic inside │  │  in-memory/                         │   │
│  │                            │  │                                     │   │
│  └────────────────────────────┘  │  InMemoryRateLimiter               │   │
│                                  │  implements RateLimiter             │   │
│  ┌────────────────────────────┐  │                                     │   │
│  │  implementations/          │  │  InMemoryNonceStorage              │   │
│  │  node/                     │  │  implements NonceStorage           │   │
│  │                            │  └─────────────────────────────────────┘   │
│  │  NodeVideoStorage          │                                             │
│  │  implements VideoStorage   │  ┌─────────────────────────────────────┐   │
│  │  (filesystem I/O)          │  │  crypto/                            │   │
│  │                            │  │                                     │   │
│  │  NodeDnsResolver           │  │  Ed25519SignatureVerifier          │   │
│  │  implements DnsResolver    │  │  implements SignatureVerifier      │   │
│  │  (dns.promises)            │  └─────────────────────────────────────┘   │
│  └────────────────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       sharding/ (unchanged, behind interface)               │
│                                                                             │
│  ShardRouter → ShardManager → Shard (LMDB)                                 │
│  MetadataIndex (LMDB)                                                       │
│                                                                             │
│  Accessed via PageStorage interface, not directly                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Comparison

### Current: Create Page (POST /v1/pages/:id)

```
Request
  │
  ▼
signedAgent middleware
  ├─ getAgentKey() ────► db.ts (direct LMDB)
  ├─ verifyEd25519() ──► utils/httpSignature.ts
  ├─ registerUsedNonce() ► db.ts (direct LMDB)
  ├─ touchAgentKey() ───► db.ts (direct LMDB)
  ├─ saveAuditLog() ────► db.ts (direct LMDB)
  └─ set context vars
  │
  ▼
pages.ts route handler (200+ loc)
  ├─ validateId() ─────► utils/validation.ts
  ├─ validateSubdomain() ► subdomains.ts (circular import risk)
  ├─ getSubdomain() ────► db.ts
  ├─ getPage() ─────────► db.ts
  ├─ validatePageBody() ► utils/validation.ts
  ├─ validateAuthInput()► utils/validation.ts
  ├─ verifyPageWriteAuth() ──► inline in pages.ts (duplicated)
  │   ├─ checkAuthRateLimit() ► middleware/authRateLimit.ts (global state)
  │   ├─ parseBasicAuth() ────► utils/auth.ts
  │   └─ verifyPassword() ────► utils/auth.ts
  ├─ decodeHtml() ──────► utils/validation.ts
  ├─ decodeMarkdown() ──► utils/validation.ts
  ├─ saveVideo() ───────► storage/video.ts
  ├─ deleteVideo() ─────► storage/video.ts
  ├─ generateEtag() ────► utils/etag.ts
  ├─ hashPassword() ────► utils/auth.ts
  ├─ generateUrlToken() ► utils/auth.ts
  ├─ savePage() ────────► db.ts (direct LMDB)
  ├─ incrementSubdomainPageCount() ► db.ts
  ├─ build response URLs (inline logic)
  ├─ trackPageCreated() ► analytics/posthog.ts
  ├─ saveAuditLog() ────► db.ts
  ├─ trackApiCall() ────► analytics/posthog.ts
  └─ return JSON response
```

### Proposed: Create Page (POST /v1/pages/:id)

```
Request
  │
  ▼
signedAgent middleware (thin)
  ├─ extract signed headers
  ├─ delegate to domain: authenticateSignedRequest(headers, keyStorage, nonceStorage, sigVerifier)
  │   └─ Returns: AuthResult (ok + AgentKey | error)
  ├─ delegate to service: auditLog.log(...)
  └─ set context vars or return error response
  │
  ▼
pages.ts route handler (thin: ~30 loc)
  ├─ parse params + body
  ├─ delegate to domain: createPage(input, services)
  │   │
  │   ▼
  │   domain/pageRules.ts (pure)
  │   ├─ validateId(id) → ValidationError | null
  │   ├─ canCreatePage(key, subdomain?, existingPage?) → OwnershipResult
  │   ├─ validatePageBody(body) → ValidationError | null
  │   ├─ validateAuthInput(auth) → ValidationError | null
  │   ├─ canUpdatePage(existingPage, key) → OwnershipResult
  │   ├─ verifyPageWriteAuth(existingPage, authHeader) → AuthResult
  │   ├─ decodeContent(html, markdown, encodings) → DecodedContent
  │   ├─ computeEtag(content) → Etag
  │   ├─ prepareAuthData(auth, existing) → AuthData
  │   ├─ buildPageUrls(page, config) → PageUrls
  │   └─ Returns: PageSaveResult (ok + page + urls | error)
  │       │
  │       ▼ (only if ok)
  │       services (side effects)
  │       ├─ videoStorage.save(...) / delete(...)
  │       ├─ pageStorage.save(...)
  │       ├─ subdomainStorage.incrementPageCount(...)
  │       ├─ analytics.trackPageCreated(...)
  │       └─ auditLog.log(...)
  │
  └─ return JSON response from PageSaveResult
```

---

## Key Design Decisions

### 1. Result Types (Discriminated Unions) instead of Exceptions

```typescript
// Instead of throwing or returning early with c.json({error}, status):
type Result<T, E = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// Domain functions return Results, routes pattern-match:
const result = createPage(input, services);
if (!result.ok) {
  return c.json({ error: result.error.message }, result.error.statusCode);
}
return c.json(result.value, result.value.created ? 201 : 200);
```

### 2. Branded Types for Domain Primitives

```typescript
// Prevents mixing up stringly-typed IDs
type PageId = string & { __brand: 'PageId' }
type KeyId = string & { __brand: 'KeyId' }

// Smart constructors validate at the boundary
function makePageId(raw: string): Result<PageId> {
  const error = validateId(raw);
  if (error) return { ok: false, error };
  return { ok: true, value: raw as PageId };
}
```

### 3. Content ADT Eliminates Render Duplicaton

```typescript
// Instead of repeated if/else chains in render.ts + subdomainRender.ts:
type PageContent =
  | { kind: 'html'; html: string; markdown?: string; image?: ImageAsset; video?: VideoAsset }
  | { kind: 'markdown'; markdown: string }
  | { kind: 'image'; data: string; contentType: string }
  | { kind: 'video'; path: string; contentType: string }

// Single function decides render strategy:
function decideRender(page: Page, accept: string, ifNoneMatch?: string): RenderDecision {
  // One place, no duplication
}
```

### 4. Service Interfaces Enable Testing

```typescript
// In tests, swap real services for fakes:
const fakePageStorage: PageStorage = {
  get: async (id) => testPages.get(id) ?? null,
  save: async (id, data) => { testPages.set(id, { ...data, id }); return { page: testPages.get(id)!, created: true }; },
  delete: async (id) => testPages.delete(id),
  count: () => testPages.size,
  listBySubdomain: (sub) => [...testPages.values()].filter(p => p.subdomain === sub),
};

// Test business rules with zero infrastructure:
const result = canCreatePage(activeKey, existingSubdomain, null);
assert(result.ok === true);
```

---

## Migration Strategy

### Phase 1: Extract Domain Types (low risk)
- Create `src/domain/types.ts` with ADTs and Result types
- Re-export existing `db.ts` types from domain types temporarily
- No behavior changes

### Phase 2: Extract Pure Rules (low risk)
- Move validation functions from `utils/validation.ts` → `domain/pageRules.ts`
- Move auth verification logic from route handlers → `domain/authRules.ts`
- Move render decision logic from `render.ts` + `subdomainRender.ts` → `domain/renderRules.ts`
- Functions stay pure — take input, return Result
- Routes call domain functions, then services

### Phase 3: Define Service Interfaces (low risk)
- Create `src/services/interfaces.ts` with all service contracts
- Create thin wrappers around existing `db.ts` functions as `LMDB*Storage` implementations
- No behavior changes — just indirection

### Phase 4: Thin Route Handlers (medium risk)
- Rewrite route handlers to: parse → call domain → call services → respond
- Eliminate duplicated `verifyPageAuth`, `SECURITY_HEADERS`, content-type helpers
- All rendering goes through `decideRender()`

### Phase 5: Swap Service Implementations (future)
- `InMemoryRateLimiter` for tests
- `RedisRateLimiter` for production scaling
- `S3VideoStorage` for large video files
- Sharding accessed only through `PageStorage` interface

---

## File Mapping: Current → Proposed

| Current | Proposed | Notes |
|---------|----------|-------|
| `src/storage/db.ts` (types) | `src/domain/types.ts` | ADTs with brands |
| `src/storage/db.ts` (functions) | `src/services/implementations/lmdb/*.ts` | Behind interfaces |
| `src/utils/validation.ts` | `src/domain/pageRules.ts` + `src/domain/proxyRules.ts` | Pure functions |
| `src/utils/auth.ts` | `src/domain/authRules.ts` + `src/services/implementations/crypto/` | Rules vs bcrypt ops |
| `src/utils/etag.ts` | `src/domain/renderRules.ts` | Pure computation |
| `src/utils/ssrf.ts` | `src/services/implementations/node/dnsResolver.ts` | Side effect behind interface |
| `src/utils/httpSignature.ts` | `src/services/implementations/crypto/signatureVerifier.ts` | Side effect behind interface |
| `src/analytics/posthog.ts` | `src/services/implementations/posthog/analytics.ts` | Behind Analytics interface |
| `src/middleware/authRateLimit.ts` | `src/services/implementations/in-memory/rateLimiter.ts` | Behind RateLimiter interface |
| `src/routes/pages.ts` (200+ loc) | `src/routes/pages.ts` (~30 loc) + `src/domain/pageRules.ts` | Thin route + pure rules |
| `src/routes/render.ts` + `src/routes/subdomainRender.ts` | `src/routes/render.ts` (~40 loc) + `src/domain/renderRules.ts` | Single render decision |
| `src/middleware/signedAgent.ts` (90+ loc) | `src/middleware/signedAgent.ts` (~20 loc) + `src/domain/authRules.ts` | Thin middleware + rules |
