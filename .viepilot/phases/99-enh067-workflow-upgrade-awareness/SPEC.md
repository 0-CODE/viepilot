# Phase 99 Spec — ENH-067: Workflow Upgrade Awareness

## Goal
When ViePilot is updated, existing brainstorm sessions and crystallize artifacts silently miss
coverage introduced by new workflow versions. This phase adds two complementary mechanisms:

**Part A — `vp-brainstorm` gap detection:** on `--continue`, auto-reads previous session,
compares covered topics against current Topics Template, shows upgrade banner, runs missing
topic Q&A inline, appends `## Upgrade supplement` to session.

**Part B — `vp-crystallize --upgrade`:** detects delta between `crystallize_version` and
current workflow; lists missing artifact sections; offers Patch (non-destructive append) or
Full re-generate (backup + overwrite).

**Part C — version stamps:** `workflow_version` in session headers; `crystallize_version`
in PROJECT-CONTEXT.md headers; used by both detection paths.

## Request
- ENH-067: Workflow Upgrade Awareness — Brainstorm Gap Detection + Crystallize Re-scan

## Target Version
2.35.0

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 99.1 | Part C — version stamps: session header `workflow_version` field + PROJECT-CONTEXT.md `crystallize_version` comment + SKILL.md docs | S |
| 99.2 | Part A — `vp-brainstorm` gap detection: upgrade banner, topic gap comparison, `## Upgrade supplement` append | M |
| 99.3 | Part B — `vp-crystallize --upgrade` re-scan: version delta detection, gap list, Patch/Re-generate menu, backup logic | M |
| 99.4 | Tests (≥10) + CHANGELOG [2.35.0] + version bump | S |

## Dependencies
- ENH-063 ✅ (Admin & Governance — gap detection needs to surface this)
- ENH-065 ✅ (Content Management — gap detection needs to surface this)
- ENH-066 ✅ (User Data Management — gap detection needs to surface this)
- Phase 98 ✅

## Verification
- `grep -c "workflow_version" workflows/brainstorm.md` ≥1
- `grep -c "Upgrade supplement" workflows/brainstorm.md` ≥1
- `grep -c "crystallize_version" workflows/crystallize.md` ≥1
- `grep -c "\-\-upgrade" workflows/crystallize.md` ≥1
- `npm test` all pass
