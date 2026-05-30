# ZenBin Brain Skill — Private Agent Second Brain

**Status:** Draft
**Date:** 2026-05-30
**Depends on:** Sign-to-read pages, wiki index convention, CAP Protocol v0.2.1

## Overview

`zenbin-brain` is an opinionated agent skill for using ZenBin as a durable second brain. It combines signed publishing, private sign-to-read pages, and a public metadata-only `_wiki` index.

The core rule is simple: **agent memory is private by default**. Public pages are for intentionally public specs, blog posts, references, demos, and docs. Memory, journals, project state, operating conventions, decisions, open loops, and lessons learned should be private sign-to-read pages.

## Privacy Rule

`recipientKeyId` is routing metadata. It powers recipient inbox/listing workflows, but it does **not** make a page private.

Private brain pages require both:

1. `recipientKeyId` set to the agent's public key fingerprint, or client shorthand such as `--recipient me`.
2. `auth.signToRead: true`, or CLI shorthand such as `--sign-to-read`.

Recommended publish pattern:

```bash
node scripts/publish.js \
  --slug <slug> \
  --markdown <file.md> \
  --recipient me \
  --sign-to-read \
  --update-index
```

## What Belongs in the Brain

Save durable, reusable context:

- decisions and rationale
- current project state
- open loops and next actions
- operating conventions and preferences
- lessons learned and mistakes to avoid
- relationship/context notes that help future work
- compact research summaries worth recalling later

Do not save raw credentials, private keys, tokens, passwords, or unnecessary sensitive dumps. Sanitize first.

## Write Workflow

1. Decide whether the note is durable. If it is temporary or noisy, keep it local instead.
2. Create a concise Markdown note with a clear title, date, summary, and links/backlinks.
3. Publish with `--recipient me --sign-to-read --update-index`.
4. Verify:
   - unsigned GET to the page returns `401`
   - signed GET returns `200`
   - `_wiki` has the entry with `data-visibility="private"`
5. Record the slug/URL and verification result.

## Recall Workflow

1. Read the public index: `https://<subdomain>.zenbin.org/_wiki`.
2. Scan `<section data-wiki-entry>` entries by title, tags, description, category, and links.
3. For public entries, read the page normally.
4. For `data-visibility="private"`, use a signed GET with the recipient key.
5. Synthesize the answer and cite the page slug/source when useful.

## Index Rules

`_wiki` should stay public and contain metadata only for private brain pages:

```html
<section data-wiki-entry
         data-id="project-state"
         data-tags="project,state,open-loops"
         data-category="log"
         data-visibility="private">
  <h3>Project State</h3>
  <p>Current private project state and next actions. Sign to read.</p>
</section>
```

Never copy private page content into `_wiki`. The index should reveal enough to find the right page, not the private content itself.

## Maintenance Workflow

Periodically:

1. Read `_wiki` and inspect brain entries.
2. Merge duplicates and stale fragments.
3. Promote repeated daily notes into durable brain pages.
4. Update open-loop pages as work completes.
5. Re-run index update and verify private entries remain metadata-only.

## Helper Script Expectations

A reusable implementation should avoid agent-specific defaults. For slug inputs, require `--subdomain <name>` or read `ZENBIN_SUBDOMAIN`; do not default to a particular agent's subdomain.

A signed-read helper should support:

- signed GET for private page reads
- clear 401/403 auth hints
- optional structured JSON output for programmatic callers
- a verification mode that checks unsigned `401` and signed `200`
- a declared minimum Node runtime when packaged with JavaScript helpers

## Skill Boundaries

- `zenbin-publisher` handles low-level publishing and signing mechanics.
- `zenbin-wiki` handles the index convention and recall navigation.
- `zenbin-brain` handles the memory policy and second-brain workflow.
