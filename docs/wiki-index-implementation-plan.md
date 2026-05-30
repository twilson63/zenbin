# Wiki Index + Sign-to-Read — Implementation Plan

Detailed plan with steps and success criteria for each phase.

## Phase 0: Convention + Agent Skill

**Goal:** Publish the convention doc and agent skill so any agent can discover and use the wiki index. No code changes to ZenBin.

### Step 0.1: Publish Convention Page

- Create the convention doc as HTML (already at `/_wiki-convention`)
- Ensure it covers: entry structure, attributes, categories, workflows (publish/recall/maintain), private memory, tag conventions, reserved slugs

**Success Criteria:**
- [ ] `GET https://zed.zenbin.org/_wiki-convention` returns 200 with rendered HTML
- [ ] Page includes all sections: entry structure, attributes, categories, workflows, private memory, tags, reserved slugs
- [ ] Page has both `html` and `markdown` fields (markdown accessible at `/md`)

### Step 0.2: Create zenbin-wiki Agent Skill

- Create SKILL.md at `~/.openclaw/skills/zenbin-wiki/SKILL.md`
- Include: Quick Start, Entry Structure, Attributes, Publishing the Index, Searching, Workflows (on publish, on recall, on private publish, on maintenance), Tag Conventions, Categories, Reserved Slugs, Private Memory (sign-to-read, reading private pages, index entries for private, agent-to-agent)
- Make the second-brain rule explicit: agent memory, journals, internal decisions, working context, and private notes should be published with `recipientKeyId` + `auth.signToRead: true` (CLI: `--recipient me --sign-to-read`), not as public pages. Clarify that `recipientKeyId` alone is routing metadata, not privacy.

**Success Criteria:**
- [ ] SKILL.md exists at `~/.openclaw/skills/zenbin-wiki/SKILL.md`
- [ ] Frontmatter includes `name: zenbin-wiki` and `description` with trigger keywords
- [ ] All sections present: Quick Start, Entry Structure, Private Memory, Workflows, Tags, Categories
- [ ] Private memory section covers: sign-to-read publish, signed GET reading, index entries with `data-visibility="private"`, agent-to-agent
- [ ] Skill explicitly says second-brain / memory pages default to private sign-to-read and that public `_wiki` entries must be metadata-only

### Step 0.3: Verify Convention + Skill Are Consistent

- Cross-check that the convention page and SKILL.md describe the same entry structure, attribute names, category values, and workflows

**Success Criteria:**
- [ ] Entry attribute names match between convention page and SKILL.md
- [ ] Category values match between convention page and SKILL.md
- [ ] Workflow steps match between convention page and SKILL.md
- [ ] Private memory description matches between convention page and SKILL.md
- [ ] Both docs warn that `recipientKeyId` alone does not make a page private

---

## Phase 1: Index Builder Script

**Goal:** Create a client-side script that reads all pages in a subdomain and generates/publishes the wiki index HTML. No server changes.

### Step 1.1: Create `scripts/update-wiki-index.js`

- Add to zenbin-publisher skill directory
- Script flow:
  1. `GET /v1/subdomains/{name}/pages` — list all pages
  2. For each page, fetch content from `/{subdomain}.zenbin.org/{id}/raw` or `/{id}/md`
  3. Extract: title, first 200 chars as description, detect tags from headings/code-terms, check if `recipientKeyId` exists → `data-visibility="private"`
  4. Build structured HTML with `<section data-wiki-entry>` blocks
  5. `POST /v1/pages/_wiki` — sign and publish the index

**Success Criteria:**
- [ ] Script runs: `node scripts/update-wiki-index.js --subdomain zed`
- [ ] Output lists all pages found with their extracted metadata
- [ ] Generated HTML contains `<section data-wiki-entry>` blocks for each page
- [ ] Each block has `data-id`, `data-tags`, `data-updated` attributes
- [ ] Pages with `recipientKeyId` get `data-visibility="private"`
- [ ] Script publishes to `_wiki` slug with Ed25519 signature
- [ ] `GET https://zed.zenbin.org/_wiki` returns 200 with rendered index HTML

### Step 1.2: Tag Extraction Logic

- Extract tags from: page title keywords, heading text, frontmatter-style tags if present, common technical terms (code patterns)
- Use a simple heuristic: split title/first-heading into words, filter stop words, lowercase, deduplicate
- Allow manual tag override via CLI arg: `--tags "tag1,tag2"`

**Success Criteria:**
- [ ] Tags extracted from page titles are lowercase and specific (not stop words)
- [ ] Tags from headings are included
- [ ] Manual `--tags` flag overrides auto-extracted tags for a page
- [ ] Tag count per entry is 3-7 (not too few, not too many)

### Step 1.3: Cross-Reference Detection

- Scan page content for `[[wiki-link]]` patterns and `/slug` internal links
- Add detected links to the `<dl>` Links section of each entry
- Bidirectional: if page A links to page B, page B's entry should mention page A

**Success Criteria:**
- [ ] `[[wiki-link]]` patterns in markdown are detected and added to entry links
- [ ] Internal `/slug` references in content are detected
- [ ] Cross-references appear in the `<dl><dt>Links</dt>` section
- [ ] No external URLs appear in the links section (only internal `/slug` references)

### Step 1.4: Idempotent Re-Runs

- Running the script twice produces the same index (minus timestamp differences)
- Existing manually-edited entries are preserved if they contain a `data-manual` attribute

**Success Criteria:**
- [ ] Second run produces same entry count and same data-id values
- [ ] Entries with `data-manual` attribute are not overwritten
- [ ] Script exits 0 on success, non-zero on failure

---

## Phase 2: Sign-to-Read Access Control

**Goal:** When `auth.signToRead` is true and `recipientKeyId` is set, require a valid Ed25519 signature from the matching key to view the page. Backward compatible (opt-in).

### Step 2.1: Add `signToRead` to Type and Storage

- Add `signToRead?: boolean` to `PageAuth` interface in `src/types.ts`
- Ensure LMDB stores the field when present on publish
- No migration needed — LMDB is schemaless

**Success Criteria:**
- [ ] `PageAuth` interface includes `signToRead?: boolean`
- [ ] Publishing with `auth: { signToRead: true }` stores the field in LMDB
- [ ] Publishing without `signToRead` leaves it undefined (backward compatible)
- [ ] Existing tests still pass (`npx vitest run` → 349 tests)

### Step 2.2: Accept `signToRead` in Publish Endpoint

- In `src/routes/pages.ts`, parse `body.auth.signToRead` and include in the auth object saved to storage
- Validate: if `signToRead` is true, `recipientKeyId` must also be set (return 400 if missing)
- Validate: `signToRead` can only be true (not false/null — omit the field instead)

**Success Criteria:**
- [ ] `POST /v1/pages/test-page` with `auth: { signToRead: true }` and `recipientKeyId` → 200/201
- [ ] `POST /v1/pages/test-page` with `auth: { signToRead: true }` but no `recipientKeyId` → 400 with clear error
- [ ] `POST /v1/pages/test-page` with `auth: { signToRead: false }` → treated as unset (no signToRead stored)
- [ ] Existing publish tests still pass

### Step 2.3: Implement Sign-to-Read Verification in `verifyPageAuth`

- In `src/routes/subdomainRender.ts`, add sign-to-read check in `verifyPageAuth()`:
  - If `page.auth?.signToRead` is true:
    - Extract signing headers (CAP-* or X-Zenbin-*) from the GET request
    - If no signing headers present → return 401 with `{ error: "Signature required", hint: "sign-to-read" }`
    - Verify signature using existing `verifySignedRequest` logic (key lookup, timestamp check, nonce check, signature verification)
    - Compute fingerprint of signing key using `computeFingerprint(key.publicJwk)`
    - If fingerprint matches `page.recipientKeyId` → access granted (return null)
    - If fingerprint doesn't match → return 401 with `{ error: "Not authorized" }`
  - If `page.auth?.signToRead` is not true, fall through to existing auth logic (password, URL token)

**Success Criteria:**
- [ ] Page with `auth.signToRead: true`: unsigned GET → 401
- [ ] Page with `auth.signToRead: true`: signed GET with matching key → 200 with page content
- [ ] Page with `auth.signToRead: true`: signed GET with wrong key → 401
- [ ] Page without `signToRead`: unsigned GET → 200 (no change in behavior)
- [ ] Page with `signToRead` + password auth allows either signature match OR correct password → 200
- [ ] Rate limiting applies to failed sign-to-read attempts (same as password auth)

### Step 2.4: Write Tests for Sign-to-Read

- New test file: `src/test/sign-to-read.test.ts`
- Test cases:
  1. Publish page with `signToRead: true` and `recipientKeyId`
  2. Read without signature → 401
  3. Read with correct signature → 200
  4. Read with wrong key signature → 401
  5. Read with expired timestamp → 401
  6. Read with reused nonce → 401
  7. Publish with `signToRead: true` but no `recipientKeyId` → 400
  8. Public page still readable without signature
  9. Password-protected page without signToRead still works
  10. Page with both signToRead and password auth: either auth method works

**Success Criteria:**
- [ ] All 10 test cases pass
- [ ] Total test count increases from 349
- [ ] `npx vitest run` passes with no failures

### Step 2.5: Update Publish Script to Support `--sign-to-read`

- In `scripts/publish.js`, add `--sign-to-read` CLI flag
- When present: sets `auth: { signToRead: true }` in the publish body
- Requires `--recipient` to also be set (error if missing)
- Add to SKILL.md documentation

**Success Criteria:**
- [ ] `node scripts/publish.js --slug test-private --markdown "secret" --sign-to-read --recipient me` → publishes with signToRead
- [ ] `node scripts/publish.js --slug test-private --markdown "secret" --sign-to-read` without `--recipient` → error message
- [ ] SKILL.md documents the `--sign-to-read` flag

---

## Phase 3: Auto-Index on Publish

**Goal:** After publishing a page, the agent automatically updates the `_wiki` index. Convention + skill, not infrastructure.

### Step 3.1: Update zenbin-wiki SKILL.md with Auto-Index Instruction

- Add explicit instruction: "After every publish (POST /v1/pages/{slug}), also update the _wiki index page"
- Include the full workflow as a numbered list
- Make it a "MUST" not a "SHOULD" in the skill

**Success Criteria:**
- [ ] SKILL.md contains "After every publish, update _wiki" instruction
- [ ] Instruction includes all steps: read current index → add/update entry → re-publish
- [ ] Instruction covers both public and private page publishes
- [ ] Agent reading the skill can follow the steps without ambiguity

### Step 3.2: Update zenbin-publisher SKILL.md with Index Update Step

- In the publish workflow section, add: "After successful publish, run the wiki index update"
- Reference `scripts/update-wiki-index.js`
- Or add an `--update-index` flag to publish.js that triggers the index update after publish

**Success Criteria:**
- [ ] zenbin-publisher SKILL.md mentions wiki index update after publish
- [ ] Either `--update-index` flag exists on publish.js, or SKILL.md instructs running update-wiki-index.js separately
- [ ] End-to-end test: publish a page → run index update → verify `_wiki` includes the new page

### Step 3.3: Publish `.well-known/skill.md` on zenbin.org

- Update the ZenBin `.well-known/skill.md` to document the wiki index convention
- Include: slug convention, entry structure, auto-index workflow, sign-to-read for private pages
- This makes the convention discoverable by any agent that reads `.well-known/skill.md`

**Success Criteria:**
- [ ] `GET https://zenbin.org/.well-known/skill.md` returns 200
- [ ] Content includes wiki index convention section
- [ ] Content includes sign-to-read section
- [ ] Content is valid Markdown that any agent can parse

---

## Phase 4: Server-Side Query Filtering (Optional)

**Goal:** When a request includes `?q=query`, filter the wiki index HTML server-side and return only matching entries. For wikis over 500 entries.

### Step 4.1: Add Query Parameter Handler for `_wiki` Pages

- In `src/routes/subdomainRender.ts`, detect `?q=` query parameter on requests for `_wiki` pages
- Parse `<section data-wiki-entry>` blocks from the HTML
- Filter blocks where: `data-tags` contains query terms, or title/description text contains query terms
- Re-serialize matching blocks as HTML response
- Return 404 if no entries match (or empty page with "No matching entries")

**Success Criteria:**
- [ ] `GET /{subdomain}/_wiki?q=provenance` returns only entries matching "provenance" in tags or text
- [ ] `GET /{subdomain}/_wiki` (no query) returns full index (unchanged behavior)
- [ ] `GET /{subdomain}/_wiki?q=nonexistent` returns empty response with "No matching entries"
- [ ] Query is case-insensitive
- [ ] Multiple query terms are AND-combined: `?q=provenance+protocol` matches entries with both terms

### Step 4.2: Write Tests for Query Filtering

- Test cases:
  1. Full index with no query → all entries
  2. Single term query → filtered entries
  3. Multi-term AND query → entries matching all terms
  4. Case-insensitive query
  5. Query on non-`_wiki` page → ignored (normal page served)
  6. Empty result set
  7. Special characters in query (URL-encoded)

**Success Criteria:**
- [ ] All 7 test cases pass
- [ ] `npx vitest run` passes with no failures

### Step 4.3: Category Filter Parameter

- Add `?category=protocol` filter
- Filters by exact match on `data-category` attribute
- Can combine with `?q=`: `?q=provenance&category=protocol`

**Success Criteria:**
- [ ] `GET /{subdomain}/_wiki?category=protocol` returns only protocol entries
- [ ] `GET /{subdomain}/_wiki?q=cap&category=protocol` returns protocol entries matching "cap"
- [ ] `GET /{subdomain}/_wiki?category=nonexistent` returns empty
- [ ] Category filter is case-insensitive

---

## Phase 5: Semantic Enrichment (Future)

**Goal:** Pre-computed semantic clusters baked into the index HTML. pgLite as local search tool for the index builder. No server changes.

### Step 5.1: Research Embedding Options for Index Builder

- Evaluate: OpenAI embeddings, local embeddings (onnxruntime), TF-IDF as lightweight alternative
- Determine: cost, latency, accuracy trade-offs for personal wiki scale (100-500 entries)
- pgLite for local embedding storage during index generation (not server-side)

**Success Criteria:**
- [ ] Document comparing 3+ embedding approaches with cost/latency/accuracy
- [ ] Recommendation for default approach in the index builder

### Step 5.2: Add Cluster Generation to Index Builder

- After extracting entries, compute embeddings for each description
- Cluster entries by cosine similarity (k-means or simple threshold-based grouping)
- Add cluster sections to the index HTML: `<section data-wiki-cluster data-topic="provenance">`
- Each cluster contains references to its member entries

**Success Criteria:**
- [ ] `--embeddings` flag on `update-wiki-index.js` enables cluster generation
- [ ] Generated HTML includes `<section data-wiki-cluster>` blocks
- [ ] Each cluster has a `data-topic` attribute derived from common tags
- [ ] Cluster groups are coherent (entries in same cluster share meaningful topics)

### Step 5.3: pgLite Integration for Local Search

- Bundle pgLite as a local tool for the index builder
- Store embeddings + entry metadata in pgLite during generation
- Support `--search "query"` mode: embed query, find top-k entries, output results

**Success Criteria:**
- [ ] `node scripts/update-wiki-index.js --search "provenance protocol"` returns ranked results
- [ ] Results include entry title, description, relevance score
- [ ] pgLite database is ephemeral (created per run) or cached (reuse across runs)
- [ ] No server-side changes required