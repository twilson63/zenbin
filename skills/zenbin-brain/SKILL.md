---
name: zenbin-brain
description: Opinionated ZenBin second-brain workflow for agent memory. Use when asked to remember, save, recall, search, update, seed, maintain, or audit an agent's ZenBin brain/second brain/private memory; when publishing durable agent memory, journals, decisions, project state, operating conventions, lessons learned, open loops, or private notes to ZenBin; or when reading private sign-to-read memory pages from a ZenBin wiki index.
---

# ZenBin Brain

Use ZenBin as an agent second brain: durable signed memory pages, private by default, discoverable through a public metadata-only `_wiki` index.

## Prime Directive

Agent brain content is **private sign-to-read by default**.

Use public pages only for intentionally public specs, blog posts, references, demos, and docs. For memory, journals, project state, decisions, open loops, operating conventions, relationship/context notes, and lessons learned, publish private:

```bash
node <zenbin-publisher>/scripts/publish.js \
  --slug <slug> \
  --markdown <file.md> \
  --recipient me \
  --sign-to-read \
  --update-index
```

`recipientKeyId` / `--recipient` alone is **not privacy**. It only routes/list pages for a recipient. Private read access requires `auth.signToRead: true` / `--sign-to-read`.

## What Belongs in the Brain

Save durable, reusable context:

- decisions and rationale
- current project state
- open loops and next actions
- operating conventions and preferences
- lessons learned and mistakes to avoid
- relationship/context notes that help future work
- compact research summaries worth recalling later

Do **not** save raw credentials, private keys, tokens, passwords, or unnecessary sensitive dumps. Sanitize first.

## Write Workflow

1. Decide whether the note is durable. If it is temporary or noisy, keep it local instead.
2. Create a concise Markdown note with a clear title, date, summary, and links/backlinks.
3. Publish with `--recipient me --sign-to-read --update-index`.
4. Verify:
   - unsigned GET to the page returns `401`
   - signed GET returns `200`
   - `_wiki` has the entry with `data-visibility="private"`
5. Mention the slug/URL and verification result.

Suggested local draft location: a configurable brain draft folder such as `$ZENBIN_BRAIN_DIR/<slug>.md`. In OpenClaw workspaces, `~/workspace/zenbin-memory/<slug>.md` is a convenient convention.

## Recall Workflow

1. Read the public index: `https://<subdomain>.zenbin.org/_wiki`.
2. Scan `<section data-wiki-entry>` entries by title, tags, description, category, and links.
3. For public entries, read the page normally.
4. For `data-visibility="private"`, use a signed GET with the recipient key.
5. Synthesize the answer. Cite page slug/source when useful.

Helper for private reads:

```bash
node scripts/signed-get.js <slug> --subdomain <name> --format md
# or set ZENBIN_SUBDOMAIN=<name>
```

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

## Helper Script

`scripts/signed-get.js` supports:

- `--subdomain <name>` or `ZENBIN_SUBDOMAIN` for slug inputs
- `--format html|md`
- `--json` for structured output
- `--verify` to check unsigned `401` plus signed `200`

## Supporting Skills

- Use `zenbin-publisher` for publishing/API mechanics.
- Use `zenbin-wiki` for the wiki index convention.
- Use this skill for the opinionated memory policy and brain workflow.

For the repo-level design note, see `docs/specs/zenbin-brain-skill.md`.
