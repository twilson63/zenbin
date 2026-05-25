# CAP Protocol Extension: Recipient — Implementation Plan

Each phase has clear test criteria. Move to the next phase only when all tests pass. If tests fail, fix and re-run until they pass before proceeding.

## Phase 1: Data Model + Storage

### Changes
1. Add `recipientKeyId?: string` to `Page` interface in `src/types.ts`
2. Add `recipientKeyId` to `CreatePageBody` interface in `src/routes/pages.ts`
3. Add recipient index storage to `src/storage/db.ts`:
   - `pageRecipientDb` — LMDB database for `page:recipient:{keyId}` sorted index
   - `addPageToRecipientIndex(page)` — add entry when page has `recipientKeyId`
   - `removePageFromRecipientIndex(page)` — remove entry when `recipientKeyId` changes or page deleted
   - `listPagesByRecipient(keyId, cursor?, limit?)` — query pages by recipient, newest first
4. Add `since` filter support to the existing `listPagesByOwner` and new `listPagesByRecipient` functions

### Test Criteria
```typescript
describe('Phase 1: Data Model + Storage', () => {
  test('Page type accepts optional recipientKeyId', () => {
    const page: Page = { id: 'test', recipientKeyId: 'agent-bob-456', ... };
    expect(page.recipientKeyId).toBe('agent-bob-456');
  });

  test('Page type works without recipientKeyId', () => {
    const page: Page = { id: 'test', ... };
    expect(page.recipientKeyId).toBeUndefined();
  });

  test('addPageToRecipientIndex creates index entry', () => {
    // Create page with recipientKeyId
    // Verify it appears in listPagesByRecipient
  });

  test('removePageFromRecipientIndex removes entry', () => {
    // Create page with recipientKeyId
    // Remove from index
    // Verify listPagesByRecipient returns empty
  });

  test('listPagesByRecipient returns pages newest first', () => {
    // Create 3 pages with same recipientKeyId at different times
    // Verify they come back newest first
  });

  test('listPagesByRecipient with since filter', () => {
    // Create pages at different timestamps
    // Query with since=timestamp
    // Verify only pages created >= since are returned
  });

  test('listPagesByRecipient pagination with cursor', () => {
    // Create more pages than limit
    // Verify cursor-based pagination works
  });

  test('removePageFromRecipientIndex is no-op when page has no recipient', () => {
    // Create page without recipientKeyId
    // Call removePageFromRecipientIndex — should not error
  });

  test('listPagesByOwner with since filter', () => {
    // Create pages as owner at different times
    // Verify since filter works on owner queries too
  });
});
```

**Gate:** All 9 tests pass → proceed to Phase 2.

---

## Phase 2: Publish + Query

### Changes
1. Modify `POST /v1/pages/:id` route handler to:
   - Accept `recipientKeyId` from body field or `CAP-Recipient-Key-Id` / `X-Zenbin-Recipient-Key-Id` header
   - Header takes priority over body field
   - Store `recipientKeyId` on the page
   - On update: if `recipientKeyId` changes, remove old index entry and create new one
   - On update: if `recipientKeyId` removed (null/empty), remove old index entry
   - Include `recipientKeyId` in response when present
2. Modify `GET /v1/pages` route handler to:
   - Accept `recipient=me` query parameter
   - Accept `since=<ISO-8601>` query parameter
   - When `recipient=me`: query `listPagesByRecipient` instead of `listPagesByOwner`
   - When `since` is provided: filter results to `created_at >= since`
   - Include `recipientKeyId` in page summary items
3. Add `since` filter to existing owner page list (non-recipient queries)

### Test Criteria
```typescript
describe('Phase 2: Publish + Query', () => {
  // Publish with recipient
  test('POST /v1/pages/:id with recipientKeyId in body stores recipient', () => {
    // Publish page with recipientKeyId in JSON body
    // Verify response includes recipientKeyId
    // Verify GET page returns recipientKeyId
  });

  test('POST /v1/pages/:id with CAP-Recipient-Key-Id header stores recipient', () => {
    // Publish page with header
    // Verify recipientKeyId stored correctly
  });

  test('CAP-Recipient-Key-Id header takes priority over body field', () => {
    // Publish with both header and body field set to different values
    // Verify header value wins
  });

  test('X-Zenbin-Recipient-Key-Id header also works (legacy)', () => {
    // Publish with X-Zenbin header
    // Verify recipientKeyId stored correctly
  });

  test('Publish without recipientKeyId creates undirected page', () => {
    // Publish page without recipientKeyId
    // Verify recipientKeyId is undefined/null
  });

  // Update recipient
  test('Update page to add recipientKeyId creates index entry', () => {
    // Publish page without recipient
    // Update with recipientKeyId
    // Verify it appears in recipient query
  });

  test('Update page to change recipientKeyId updates index', () => {
    // Publish page with recipientKeyId=bob
    // Update with recipientKeyId=carol
    // Verify bob's recipient query no longer includes it
    // Verify carol's recipient query includes it
  });

  test('Update page to remove recipientKeyId deletes index entry', () => {
    // Publish page with recipientKeyId=bob
    // Update with recipientKeyId=null
    // Verify bob's recipient query no longer includes it
  });

  // Query with recipient=me
  test('GET /v1/pages?recipient=me returns only pages directed at auth key', () => {
    // Publish 3 pages: 2 directed at auth key, 1 directed at different key
    // Verify only 2 returned
  });

  test('GET /v1/pages?recipient=me returns pages across subdomains', () => {
    // Publish pages on different subdomains with same recipientKeyId
    // Verify all appear in recipient query regardless of subdomain
  });

  test('GET /v1/pages without recipient returns only owned pages (unchanged)', () => {
    // Publish pages owned by auth key
    // Publish pages directed at auth key but owned by another key
    // Verify only owned pages returned
  });

  // Query with since
  test('GET /v1/pages?recipient=me&since=<timestamp> filters by created_at', () => {
    // Publish pages at different times
    // Query with since=middle timestamp
    // Verify only pages created >= since are returned (inclusive)
  });

  test('GET /v1/pages?since=<timestamp> filters owned pages by created_at', () => {
    // Publish owned pages at different times
    // Query with since
    // Verify time filtering works on owner queries too
  });

  // Pagination
  test('GET /v1/pages?recipient=me pagination with cursor', () => {
    // Publish more than limit pages
    // Verify cursor-based pagination works
  });

  test('GET /v1/pages?recipient=me&since=<ts>&cursor=<c> combines filters', () => {
    // Publish many pages, query with both since and cursor
    // Verify both filters apply correctly
  });

  // Edge cases
  test('Publish page with empty string recipientKeyId is treated as no recipient', () => {
    // Publish with recipientKeyId=""
    // Verify stored as undefined/null (no index entry)
  });

  test('Publish page with non-existent keyId as recipient succeeds', () => {
    // Publish with recipientKeyId="agent-nonexistent"
    // Verify stored successfully (no validation against key store)
  });

  test('Delete page removes recipient index entry', () => {
    // Publish page with recipientKeyId
    // Delete page
    // Verify no longer in recipient query
  });
});
```

**Gate:** All 18 tests pass → proceed to Phase 3.

---

## Phase 3: Provenance

### Changes
1. Add `CAP-Recipient-Key-Id` and `X-Zenbin-Recipient-Key-Id` response headers when page has a `recipientKeyId`
2. Add `<meta name="cap:recipient-key-id" content="...">` to rendered HTML
3. Add `recipientKeyId` to JSON metadata response (`Accept: application/json`)
4. Add `recipientKeyId` to page list summary items (both owner and recipient queries)
5. Add `recipientKeyId` to publish response when present

### Test Criteria
```typescript
describe('Phase 3: Provenance', () => {
  test('Page with recipient includes CAP-Recipient-Key-Id response header', () => {
    // GET /p/:id for page with recipientKeyId
    // Verify CAP-Recipient-Key-Id header present
  });

  test('Page with recipient includes X-Zenbin-Recipient-Key-Id response header', () => {
    // GET /p/:id for page with recipientKeyId
    // Verify X-Zenbin-Recipient-Key-Id header present
  });

  test('Page without recipient omits recipient headers', () => {
    // GET /p/:id for page without recipientKeyId
    // Verify no recipient headers present
  });

  test('Rendered HTML includes cap:recipient-key-id meta tag', () => {
    // GET /p/:id for page with recipientKeyId
    // Verify HTML contains <meta name="cap:recipient-key-id" content="agent-bob-456">
  });

  test('JSON metadata includes recipientKeyId', () => {
    // GET /p/:id with Accept: application/json
    // Verify JSON response includes recipientKeyId field
  });

  test('Page list summary includes recipientKeyId', () => {
    // GET /v1/pages?recipient=me
    // Verify each item includes recipientKeyId
  });

  test('Owner page list summary includes recipientKeyId', () => {
    // GET /v1/pages (owner query)
    // Verify owned pages with recipientKeyId include the field
  });

  test('Publish response includes recipientKeyId', () => {
    // POST /v1/pages/:id with recipientKeyId
    // Verify response body includes recipientKeyId
  });

  test('CAP headers take priority over X-Zenbin headers in response', () => {
    // Verify both header families present and consistent
  });
});
```

**Gate:** All 9 tests pass → proceed to Phase 4.

---

## Phase 4: Documentation

### Changes
1. Update `src/docs/agentInstructions.ts` — add recipient usage section
2. Update `src/routes/wellKnown.ts` — ensure skill.md and agent.md reflect new capabilities
3. Update the CAP Protocol spec document (separate markdown file or public page)
4. Update startup banner in `src/index.ts` — no new endpoints to list, but document the `?recipient=me` query param

### Test Criteria
```typescript
describe('Phase 4: Documentation', () => {
  test('GET /.well-known/skill.md mentions recipientKeyId', () => {
    // Fetch skill.md
    // Verify it documents CAP-Recipient-Key-Id header
    // Verify it documents ?recipient=me query param
    // Verify it documents ?since= query param
  });

  test('GET /.well-known/agent.md mentions recipient', () => {
    // Fetch agent.md
    // Verify it mentions directed content / recipient concept
  });

  test('Agent instructions include recipient example', () => {
    // Fetch /api/agent
    // Verify example publish with recipientKeyId
    // Verify example query with ?recipient=me&since=
  });
});
```

**Gate:** All 3 tests pass → proceed to Phase 5.

---

## Phase 5: Integration Tests

### Changes
No new code. End-to-end tests that exercise the full flow.

### Test Criteria
```typescript
describe('Phase 5: Integration Tests', () => {
  test('Full directed content flow: publish → query → read', () => {
    // 1. Agent Alice registers a key
    // 2. Agent Bob registers a key
    // 3. Alice publishes a page directed to Bob
    // 4. Bob queries ?recipient=me — sees the page
    // 5. Bob reads the page — sees recipientKeyId in headers and metadata
    // 6. Alice queries ?recipient=me — does NOT see the page (she owns it, not a recipient)
    // 7. Carol queries ?recipient=me — does NOT see the page
  });

  test('Directed content with since filter for incremental sync', () => {
    // 1. Alice publishes page to Bob at T1
    // 2. Alice publishes another page to Bob at T2
    // 3. Bob queries ?recipient=me&since=T1 — gets both pages
    // 4. Bob queries ?recipient=me&since=T2 — gets only second page
    // 5. Bob queries ?recipient=me&since=T3 — gets no pages
  });

  test('Undirected pages are invisible to recipient queries', () => {
    // 1. Alice publishes page without recipientKeyId
    // 2. Bob queries ?recipient=me — does NOT see it
    // 3. Alice queries /v1/pages (owner) — sees it
  });

  test('Changing recipient reassigns page between feeds', () => {
    // 1. Alice publishes page directed to Bob
    // 2. Bob queries ?recipient=me — sees it
    // 3. Alice updates page, changes recipient to Carol
    // 4. Bob queries ?recipient=me — no longer sees it
    // 5. Carol queries ?recipient=me — sees it
  });

  test('Removing recipient makes page invisible in all recipient feeds', () => {
    // 1. Alice publishes page directed to Bob
    // 2. Bob queries ?recipient=me — sees it
    // 3. Alice updates page, removes recipientKeyId
    // 4. Bob queries ?recipient=me — no longer sees it
    // 5. Page URL still works — content is still accessible
  });

  test('RecipientKeyId not validated against key store', () => {
    // 1. Alice publishes page directed to "agent-nonexistent-key"
    // 2. Publish succeeds (201)
    // 3. Page stored with recipientKeyId="agent-nonexistent-key"
    // 4. No key with that ID exists, but the data is valid
  });

  test('Backward compatibility: pages without recipient still work', () => {
    // 1. Publish page without recipientKeyId (old-style)
    // 2. GET /v1/pages — still lists owned pages
    // 3. GET /p/:id — still renders
    // 4. No recipient headers or meta tags present
    // 5. ?recipient=me does not return this page
  });

  test('Subdomain pages with recipient appear in recipient query', () => {
    // 1. Publish page on subdomain with recipientKeyId
    // 2. Query ?recipient=me — page appears with subdomain field
  });

  test('Verification works for directed pages', () => {
    // 1. Alice publishes page directed to Bob
    // 2. Bob fetches page metadata (Accept: application/json)
    // 3. Bob extracts signature, content digest, key ID
    // 4. Bob verifies signature via /v1/verify
    // 5. Verification succeeds — signature is valid
    // 6. recipientKeyId is in metadata but NOT part of signature verification
  });

  test('Since filter works on owner queries', () => {
    // 1. Publish owned pages at different times
    // 2. Query GET /v1/pages?since=<timestamp>
    // 3. Verify only pages created >= since are returned
  });

  test('Delete page cleans up recipient index', () => {
    // 1. Alice publishes page directed to Bob
    // 2. Bob queries ?recipient=me — sees it
    // 3. Alice deletes page
    // 4. Bob queries ?recipient=me — no longer sees it
  });
});
```

**Gate:** All 11 tests pass → feature complete.

---

## Summary

| Phase | Description | Tests | Gate |
|-------|-------------|-------|------|
| 1 | Data model + storage | 9 | All pass |
| 2 | Publish + query | 18 | All pass |
| 3 | Provenance | 9 | All pass |
| 4 | Documentation | 3 | All pass |
| 5 | Integration | 11 | All pass |
| **Total** | | **50** | |

Each phase builds on the previous. If tests fail, fix and re-run until they pass before moving on. No skipping phases.