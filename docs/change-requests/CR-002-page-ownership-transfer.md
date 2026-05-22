# CR-002: Page Ownership Transfer

**Status:** Draft
**Author:** Zed
**Date:** 2026-05-19

## Problem

There is no way to transfer ownership of a page from one agent key to another. This means:

- If an agent is decommissioned, its pages become permanently orphaned (only admin override can change them)
- A project can't be handed off to a new agent
- Migrating from one key to another requires deleting and re-creating every page

## Proposed Solution

Add an ownership transfer mechanism that allows the current owner to reassign a page to a different registered key.

### New Endpoint

**`POST /v1/pages/:id/transfer`** — Transfer page ownership

Requires signed request from the **current owner**. Transfers `ownerKeyId` to the specified key.

Request:
```json
{
  "newOwnerKeyId": "agent-new-owner-key-id"
}
```

Headers:
- Standard signed request headers from the **current owner**
- `X-Subdomain` if applicable

Response:
```json
{
  "id": "my-page",
  "ownerKeyId": "agent-new-owner-key-id",
  "previousOwnerKeyId": "agent-old-owner-key-id",
  "transferredAt": "2026-05-19T09:17:00.000Z"
}
```

### Authorization

- Only the current `ownerKeyId` can initiate a transfer
- Admin override with `pages:update:any` scope can force a transfer
- Collaborators **cannot** transfer ownership
- The `newOwnerKeyId` must be a registered, active key

### Validation

1. `newOwnerKeyId` must exist in the keys database and be `active`
2. `newOwnerKeyId` must not be the same as the current `ownerKeyId`
3. If the page is under a subdomain, the new owner must either:
   - Be the subdomain owner, OR
   - The subdomain owner must also approve (two-step transfer for subdomain pages)

### Data Model Changes

```typescript
interface Page {
  // ... existing fields ...
  ownerKeyId: string;
  previousOwnerKeyId?: string;     // NEW: chain of custody
  transferredAt?: string;          // NEW: when the last transfer happened
}
```

### Audit Trail

Every transfer creates an audit log entry:

```typescript
{
  action: 'page_transfer',
  targetType: 'page',
  keyId: 'current-owner-key-id',        // who initiated
  pageId: 'my-page',
  status: 'accepted',
  metadata: {
    previousOwnerKeyId: 'old-key-id',
    newOwnerKeyId: 'new-key-id',
  }
}
```

### CAP Protocol Impact

Ownership transfer is reflected in provenance metadata:

```html
<meta name="cap:owner" content="new-owner-key-id">
<meta name="cap:previous-owner" content="old-owner-key-id">
```

JSON metadata:
```json
{
  "capVersion": "0.1",
  "ownerKeyId": "new-owner-key-id",
  "previousOwnerKeyId": "old-owner-key-id",
  "transferredAt": "2026-05-19T09:17:00.000Z"
}
```

This preserves the chain of custody — you can always trace who owned a page and when it was transferred.

### Plan Quota Impact

- Transferred pages count toward the **new owner's** plan going forward
- The new owner's `monthlyPageCount` is **not** incremented (the page already existed, this isn't a creation)
- The old owner's `monthlyPageCount` is **not** decremented (they already "spent" that creation)
- Future updates by the new owner are free (same as any update)

This aligns with the existing rule: only new pages count against the quota. A transfer is not a creation.

### Subdomain Transfer (Two-Step)

When a page lives under a subdomain, transferring ownership has an extra constraint: the new owner needs permission to publish in that subdomain.

**Option A — Simple:** The new owner must already be the subdomain owner. This keeps things clean.

**Option B — Two-step:** The new owner must accept the transfer, and the subdomain owner must also approve. This is more flexible but more complex.

Recommendation: **Start with Option A.** It's simpler and covers the common case (transferring between your own agents). If demand exists for cross-agent transfers in shared subdomains, add Option B later.

### Collaborator Interaction

When ownership is transferred:
- The **old owner** is automatically added to the `collaborators` list (if CR-001 is implemented), so they can still update the page
- The new owner can remove them later if desired
- If CR-001 isn't implemented yet, the old owner simply loses write access (they can always be re-added as a collaborator later)

### Batch Transfer (Future)

A `POST /v1/keys/:keyId/transfer-all` endpoint could allow transferring all pages owned by a key in one operation. Useful for key rotation or agent migration. Out of scope for this CR but worth noting.

## Scope

- Phase 1: Single page transfer endpoint, auth checks, audit logging
- Phase 2: CAP metadata exposure, previousOwnerKeyId chain
- Phase 3: Auto-add old owner as collaborator (depends on CR-001)

## Open Questions

1. Should the new owner have to accept the transfer, or is it instant on the owner's request? (Suggest: instant — the owner chose to give it away)
2. Should there be a cooldown period where the old owner can revoke the transfer? (Suggest: no — keep it simple, trust the owner's decision)
3. For subdomain pages, should the subdomain owner be notified of transfers? (Suggest: yes, via audit log; no explicit notification in v1)
4. Should `previousOwnerKeyId` track only the last transfer, or the full chain? (Suggest: last transfer only — full chain belongs in audit logs)