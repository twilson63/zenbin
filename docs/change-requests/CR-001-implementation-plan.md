# CR-001 Implementation Plan: Page Collaborators

**Branch:** `feat/page-collaborators`
**Issue:** #27
**Depends on:** Nothing (standalone)

## Overview

Add a `collaborators` field to pages so owners can authorize other keys to publish updates. This touches types, storage, rules, routes, tests, and CAP metadata.

---

## Phase 1: Data Model & Storage

### 1.1 — Update `Page` type (`src/types.ts`)

```typescript
interface Page {
  // ... existing fields ...
  collaborators?: string[];   // NEW: keyIds authorized to update (owner-managed)
}
```

### 1.2 — Update `savePage` in storage (`src/storage/db.ts`)

Pass `collaborators` through in `savePage()`. Preserve existing collaborators on update if not explicitly set:

```typescript
const page: Page = {
  // ... existing fields ...
  collaborators: data.collaborators ?? existing?.collaborators,
};
```

The `savePage` data param gets a new optional field:

```typescript
data: {
  // ... existing fields ...
  collaborators?: string[];
}
```

No new LMDB database needed — collaborators live on the page record.

---

## Phase 2: Business Rules

### 2.1 — Update `canModifyPage` in `src/rules.ts`

Current signature:
```typescript
canModifyPage(pageOwnerKeyId, keyId, hasOverrideScope)
```

New signature:
```typescript
canModifyPage(pageOwnerKeyId, keyId, hasOverrideScope, collaborators?)
```

Logic:
```typescript
if (hasOverrideScope) return { allowed: true };
if (!pageOwnerKeyId) return { allowed: false, reason: '...' };
if (pageOwnerKeyId === keyId) return { allowed: true };
if (collaborators?.includes(keyId)) return { allowed: true };
return { allowed: false, reason: 'This signing key does not own the page' };
```

### 2.2 — Add `canManageCollaborators` to `src/rules.ts`

Only the owner can add/remove collaborators:

```typescript
export function canManageCollaborators(
  pageOwnerKeyId: string | undefined,
  keyId: string,
  hasOverrideScope: boolean,
): boolean {
  if (hasOverrideScope) return true;
  return pageOwnerKeyId === keyId;
}
```

### 2.3 — Add collaborator limit check to `src/rules.ts`

```typescript
const PLAN_COLLABORATOR_LIMITS: Record<Plan, number> = {
  free: 10,
  pro: 25,
  enterprise: Infinity,
};

export function checkCollaboratorLimit(plan: Plan, currentCount: number): LimitCheckResult {
  const limit = PLAN_COLLABORATOR_LIMITS[plan];
  if (currentCount >= limit) {
    return { allowed: false, reason: `${plan} plan limit of ${limit} collaborators reached` };
  }
  return { allowed: true };
}
```

### 2.4 — Update `PLAN_LIMITS` type and record

Add `collaboratorsPerPage` to `PlanLimits` interface and `PLAN_LIMITS` record.

---

## Phase 3: Routes

### 3.1 — Update publish auth check in `src/routes/pages.ts`

In `POST /v1/pages/:id`, replace inline owner check with `canModifyPage` (which now accepts collaborators):

```typescript
const canModify = canModifyPage(existingPage.ownerKeyId, keyId, canOverride, existingPage.collaborators);
if (!canModify.allowed) {
  return c.json({ error: canModify.reason }, 403);
}
```

Same for `DELETE /v1/pages/:id`.

**Important:** Collaborators can update content but **cannot** change `auth` settings. Add a guard:

```typescript
if (body.auth && existingPage.ownerKeyId !== keyId && !canOverride) {
  return c.json({ error: 'Only the page owner can change authentication settings' }, 403);
}
```

### 3.2 — Add collaborator endpoints

**`POST /v1/pages/:id/collaborators`** — Add a collaborator

- Requires signed request from page owner
- Validates target `keyId` exists and is active
- Checks collaborator limit (owner's plan)
- Deduplicates (no-op if already a collaborator)
- Audit log: `collaborator_add`

Request body:
```json
{ "keyId": "agent-key-id-to-add" }
```

Response:
```json
{
  "id": "my-page",
  "collaborators": ["key-id-1", "key-id-2"]
}
```

**`DELETE /v1/pages/:id/collaborators/:keyId`** — Remove a collaborator

- Requires signed request from page owner
- Returns 404 if keyId not in collaborators
- Audit log: `collaborator_remove`
- Response: `204`

**`GET /v1/pages/:id/collaborators`** — List collaborators (optional, nice to have)

- Requires signed request from owner or collaborator
- Returns the collaborators array
- Useful for agents to discover who else has access

---

## Phase 4: Service Layer

### 4.1 — Update `IPageService` interface (`src/services/interfaces.ts`)

Add:
```typescript
addCollaborator(pageId: string, collaboratorKeyId: string, ownerKeyId: string, subdomain?: string): Promise<{ collaborators: string[] }>;
removeCollaborator(pageId: string, collaboratorKeyId: string, ownerKeyId: string, subdomain?: string): Promise<boolean>;
listCollaborators(pageId: string, subdomain?: string): string[];
```

### 4.2 — Implement in `PageService` (`src/services/pageService.ts`)

```typescript
addCollaborator(pageId, collaboratorKeyId, ownerKeyId, subdomain) {
  const page = this.get(pageId, subdomain);
  if (!page) throw new Error('Page not found');
  if (page.ownerKeyId !== ownerKeyId) throw new Error('Not the page owner');
  
  const collaborators = page.collaborators || [];
  if (collaborators.includes(collaboratorKeyId)) return { collaborators };
  
  // Check limit
  const agentKey = getAgentKey(ownerKeyId);
  const plan = getPlanFromKey(agentKey);
  const limit = checkCollaboratorLimit(plan, collaborators.length);
  if (!limit.allowed) throw new Error(limit.reason);
  
  // Validate target key exists
  const targetKey = getAgentKey(collaboratorKeyId);
  if (!targetKey || targetKey.status !== 'active') throw new Error('Target key not found or inactive');
  
  const updated = [...collaborators, collaboratorKeyId];
  // save page with updated collaborators
  return { collaborators: updated };
}
```

---

## Phase 5: CAP Protocol Metadata

### 5.1 — Render route (`src/routes/render.ts`)

When `Accept: application/json`, include collaborators in JSON metadata:

```json
{
  "id": "my-page",
  "capVersion": "0.1",
  "ownerKeyId": "owner-key-id",
  "collaborators": ["key-id-1", "key-id-2"],
  ...
}
```

### 5.2 — HTML meta tags

Inject `<meta name="cap:collaborators" content="key-id-1,key-id-2">` into rendered HTML (if collaborators exist).

### 5.3 — HTTP headers on read

Add `CAP-Collaborators` and `X-Zenbin-Collaborators` headers on page reads (mirroring the dual-header pattern).

---

## Phase 6: Tests

### 6.1 — Unit tests (`src/test/rules.test.ts`)

- `canModifyPage` with collaborators (owner, collaborator, stranger, admin)
- `canManageCollaborators` (owner only, not collaborator)
- `checkCollaboratorLimit` for each plan tier

### 6.2 — Integration tests (new: `src/test/collaborators.test.ts`)

- Owner can add collaborator
- Owner can remove collaborator
- Collaborator can update page content
- Collaborator cannot add other collaborators
- Collaborator cannot change auth settings
- Stranger gets 403
- Non-existent target keyId returns error
- Inactive target keyId returns error
- Collaborator limit enforced per plan
- Duplicate add is idempotent
- Remove non-existent collaborator returns 404
- Audit logs created for add/remove

### 6.3 — Existing test updates

- Update any tests that check `canModifyPage` to pass the new `collaborators` param
- Update page fixture factories to include optional `collaborators` field

---

## Phase 7: Docs & Agent Instructions

### 7.1 — Update `src/docs/agentInstructions.ts`

Add collaborator endpoints to the agent-facing API docs.

### 7.2 — Update `.well-known/skill.md`

Document the new endpoints and collaborator semantics.

### 7.3 — Update README

Add collaborators section explaining the feature.

---

## File Change Summary

| File | Change |
|------|--------|
| `src/types.ts` | Add `collaborators?: string[]` to `Page` |
| `src/types.ts` | Add `collaboratorsPerPage` to `PlanLimits` |
| `src/rules.ts` | Update `canModifyPage`, add `canManageCollaborators`, add `checkCollaboratorLimit` |
| `src/rules.ts` | Update `PLAN_LIMITS` with `collaboratorsPerPage` |
| `src/storage/db.ts` | Pass `collaborators` through in `savePage` |
| `src/services/interfaces.ts` | Add `addCollaborator`, `removeCollaborator`, `listCollaborators` to `IPageService` |
| `src/services/pageService.ts` | Implement collaborator methods |
| `src/routes/pages.ts` | Update auth checks, add collaborator endpoints |
| `src/routes/render.ts` | Add CAP collaborators metadata |
| `src/docs/agentInstructions.ts` | Document new endpoints |
| `src/test/rules.test.ts` | New unit tests |
| `src/test/collaborators.test.ts` | New integration test file |
| Existing test files | Update `canModifyPage` calls, add `collaborators` to fixtures |

---

## Implementation Order

Each step should be a separate commit with its success criteria met before moving on.

### Step 1: `src/types.ts` — Add the field

Add `collaborators?: string[]` to `Page` interface and `collaboratorsPerPage: number` to `PlanLimits`.

**Success criteria:**
- TypeScript compiles with no errors (`npx tsc --noEmit`)
- Existing test suite still passes (`npx vitest run`)
- `Page` type includes `collaborators?: string[]`
- `PlanLimits` type includes `collaboratorsPerPage: number`

### Step 2: `src/rules.ts` — Business logic

Update `canModifyPage` signature to accept optional `collaborators` param. Add `canManageCollaborators`, `checkCollaboratorLimit`. Update `PLAN_LIMITS` with `collaboratorsPerPage` values (free: 10, pro: 25, enterprise: Infinity).

**Success criteria:**
- TypeScript compiles with no errors
- `canModifyPage(ownerKey, ownerKey, false)` → `{ allowed: true }` (owner still works)
- `canModifyPage(ownerKey, strangerKey, false)` → `{ allowed: false }` (stranger blocked)
- `canModifyPage(ownerKey, collabKey, false, [collabKey])` → `{ allowed: true }` (collaborator allowed)
- `canManageCollaborators(ownerKey, ownerKey, false)` → `true`
- `canManageCollaborators(ownerKey, collabKey, false)` → `false`
- `checkCollaboratorLimit('free', 9)` → `{ allowed: true }`
- `checkCollaboratorLimit('free', 10)` → `{ allowed: false }`
- `checkCollaboratorLimit('enterprise', 1000)` → `{ allowed: true }`
- Existing callers of `canModifyPage` still work (new param is optional)

### Step 3: `src/test/rules.test.ts` — Unit tests for new rules

Cover all the success criteria from Step 2 as automated tests.

**Success criteria:**
- All new tests pass
- All existing tests still pass
- Test coverage for `canModifyPage` with collaborators, `canManageCollaborators`, `checkCollaboratorLimit`
- No regressions in existing `canModifyPage` tests

### Step 4: `src/storage/db.ts` — Storage support

Add `collaborators` to the `savePage` data param and include it in the constructed `Page` object. Preserve existing collaborators on update if not explicitly provided.

**Success criteria:**
- TypeScript compiles with no errors
- `savePage` persists `collaborators` field to LMDB
- `getPage` returns pages with `collaborators` populated
- Existing pages (no `collaborators` field) return `undefined` for `collaborators` — no migration needed
- Updating a page without passing `collaborators` preserves the existing list
- All existing storage tests pass

### Step 5: `src/services/interfaces.ts` + `src/services/pageService.ts` — Service layer

Add `addCollaborator`, `removeCollaborator`, `listCollaborators` to `IPageService` interface. Implement in `PageService`.

**Success criteria:**
- TypeScript compiles with no errors
- `addCollaborator` adds a keyId to the list, returns updated collaborators
- `addCollaborator` rejects if caller is not the owner
- `addCollaborator` rejects if target keyId doesn't exist or is inactive
- `addCollaborator` rejects if collaborator limit reached
- `addCollaborator` is idempotent (duplicate add returns same list, no error)
- `removeCollaborator` removes a keyId, returns true; returns false if keyId wasn't in list
- `removeCollaborator` rejects if caller is not the owner
- `listCollaborators` returns the array (empty array if none)
- All existing service tests pass

### Step 6: `src/routes/pages.ts` — Auth check updates + new endpoints

Replace inline owner checks with `canModifyPage` (now collaborator-aware). Add guard: only owner can change auth settings. Add `POST /v1/pages/:id/collaborators` and `DELETE /v1/pages/:id/collaborators/:keyId`.

**Success criteria:**
- TypeScript compiles with no errors
- Owner can publish updates (unchanged behavior)
- Collaborator can publish content updates to existing page
- Collaborator cannot change `auth` settings (gets 403)
- Collaborator cannot add/remove other collaborators (gets 403)
- Stranger gets 403 on update (unchanged)
- `POST /v1/pages/:id/collaborators` returns 200 with updated list when owner adds
- `POST /v1/pages/:id/collaborators` returns 403 when non-owner tries
- `POST /v1/pages/:id/collaborators` returns 400 when target keyId is not registered
- `POST /v1/pages/:id/collaborators` returns 403 when collaborator limit reached
- `DELETE /v1/pages/:id/collaborators/:keyId` returns 204 when owner removes
- `DELETE /v1/pages/:id/collaborators/:keyId` returns 404 when keyId not in list
- `DELETE /v1/pages/:id/collaborators/:keyId` returns 403 when non-owner tries
- Audit logs written for `collaborator_add` and `collaborator_remove` actions
- Collaborator can delete page
- All existing page route tests pass

### Step 7: `src/test/collaborators.test.ts` — Integration tests

End-to-end tests for collaborator workflow: sign requests, hit routes, verify responses and storage state.

**Success criteria:**
- All tests from Step 6 success criteria covered as automated integration tests
- Test signs requests with different keys (owner, collaborator, stranger)
- Test verifies `collaborators` field persisted correctly in LMDB after add/remove
- Test verifies collaborator can update page content but not auth
- Test verifies audit log entries created with correct `action`, `keyId`, `status`
- Full test suite passes (`npx vitest run`)

### Step 8: `src/routes/render.ts` — CAP metadata

Add collaborators to JSON metadata responses, HTML meta tags, and HTTP headers when `Accept: application/json` or when rendering HTML.

**Success criteria:**
- `Accept: application/json` response includes `collaborators` array
- HTML pages with collaborators include `<meta name="cap:collaborators" content="key1,key2">`
- Pages without collaborators omit the meta tag (no empty tag)
- `CAP-Collaborators` and `X-Zenbin-Collaborators` headers set on read responses
- Headers empty/omitted when no collaborators
- Existing render tests still pass

### Step 9: `src/docs/agentInstructions.ts` — Docs

Document new endpoints in agent-facing instructions.

**Success criteria:**
- Agent instructions include `POST /v1/pages/:id/collaborators`
- Agent instructions include `DELETE /v1/pages/:id/collaborators/:keyId`
- Document collaborator permissions (can update, cannot manage collaborators or auth)
- Document collaborator limits per plan
- `GET /.well-known/agent.md` returns updated instructions
- TypeScript compiles, all tests pass

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Existing pages have no `collaborators` field | Default to `undefined`/empty — no migration needed |
| Collaborator count checked against wrong plan | Always check owner's plan, not collaborator's |
| Race condition on collaborator add | LMDB putSync is atomic; read-modify-write is safe in single-process |
| Revoked key still in collaborator list | Accept the stale entry; the auth middleware already blocks revoked keys from signing requests. Add a cleanup endpoint later if needed. |
| Breaking `canModifyPage` signature | New param is optional with `?` — backward compatible |

---

## Open Decisions (to resolve before coding)

1. **Collaborator limits:** 10/25/∞ per plan tier? (CR-001 suggests this)
2. **GET collaborators endpoint:** Include in v1 or defer?
3. **Collaborator on subdomain pages:** Can a collaborator create *new* pages in the owner's subdomain? (CR-001 says no — collaborator can only update existing pages in subdomain)
4. **Self-removal:** Should a collaborator be able to remove themselves, or only the owner? (Suggest: only owner — keeps control centralized)