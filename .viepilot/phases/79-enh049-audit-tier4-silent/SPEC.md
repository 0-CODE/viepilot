# Phase 79: vp-audit Tier 4 Silent Mode (ENH-049)

## Goal
Make Tier 4 (Framework Integrity) checks in `vp-audit` completely silent when no issues are found or when the check is skipped (non-framework repo). Only surface Tier 4 output when issues (⚠️) are detected.

## Version Target
`2.15.0` → `2.16.0` (MINOR — behavior change in user-facing output)

## Dependencies
- Phase 78 ✅ (ENH-048)

## Affected Files
- `workflows/audit.md` — 3 targeted edits (skip echo, 4f conditional block, Step 5 banner)
- `skills/vp-audit/SKILL.md` — note silent-by-default behavior
- `tests/unit/vp-enh049-audit-tier4-silent.test.js` — ≥5 contract tests
- `CHANGELOG.md` — [2.16.0] section
- `package.json` — version 2.16.0

## Tasks

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 79.1 | `workflows/audit.md` — Tier 4 silent patches | 3 targeted edits applied; no "Tier 4" in clean-run output | S |
| 79.2 | `skills/vp-audit/SKILL.md` + contract tests | Behavior note updated; ≥5 tests pass | S |
| 79.3 | CHANGELOG + version 2.16.0 | [2.16.0] entry; package.json = "2.16.0" | S |

## Verification
- [ ] `workflows/audit.md`: no `echo "→ Tier 4 skipped"` output block
- [ ] `workflows/audit.md`: Step 4f block wrapped in `TIER4_ISSUES > 0` guard
- [ ] `workflows/audit.md`: All Clear banner has no Tier 4 line
- [ ] `workflows/audit.md`: Issues banner shows Tier 4 only when `TIER4_ISSUES > 0`
- [ ] `skills/vp-audit/SKILL.md`: references silent behavior
- [ ] Contract tests: clean-run → no "Tier 4" in banner string; issue-run → "Tier 4" present
- [ ] All tests pass (`npm test`)
- [ ] package.json = "2.16.0"
