# Phase 81: Workflow Consistency Fixes (BUG-014 + ENH-051–055)

## Goal
Fix 6 workflow inconsistencies identified by the 2026-04-18 codebase audit:
1. `rollback.md` Step 7 missing enriched tag format parse (BUG-014)
2. `crystallize.md` brownfield execution path ambiguity (ENH-051)
3. `brainstorm.md` missing pre-save phase validation gate (ENH-052)
4. Version bump guidance scattered across 2 workflows (ENH-053)
5. `audit.md` post-phase auto-hook only conceptual (ENH-054)
6. `AskUserQuestion` treated as optional instead of required on Claude Code (ENH-055)

## Version Target
`2.17.0` → `2.18.0` (MINOR — workflow behavior changes affecting user-facing consistency)

## Dependencies
- Phase 80 ✅ (ENH-050 — enriched tag format introduced)
- Phase 79 ✅ (ENH-049 — Tier 4 silent mode, prereq for ENH-054)
- Phase 78 ✅ (ENH-048 — AUQ initial integration, prereq for ENH-055)
- Phase 75 ✅ (FEAT-018 — brownfield mode, prereq for ENH-051)

## Affected Files
- `workflows/rollback.md` — Step 7 tag parse logic (81.1)
- `workflows/crystallize.md` — brownfield execution path table (81.2)
- `workflows/brainstorm.md` — Step 6 pre-save validation block (81.3)
- `workflows/autonomous.md` — version bump ref + post-phase audit step (81.4, 81.5)
- `workflows/evolve.md` — version bump ref (81.4)
- `SYSTEM-RULES.md` — new canonical version bump table (81.4)
- `workflows/audit.md` — auto-hook section + post-phase step update (81.5)
- `workflows/evolve.md` — AUQ enforcement (81.6)
- `workflows/request.md` — AUQ enforcement (81.6)
- `workflows/brainstorm.md` — AUQ enforcement (81.6)
- `workflows/crystallize.md` — AUQ enforcement (81.6)
- `skills/vp-evolve/SKILL.md` — AUQ enforcement note (81.6)
- `skills/vp-request/SKILL.md` — AUQ enforcement note (81.6)
- `skills/vp-brainstorm/SKILL.md` — AUQ enforcement note (81.6)
- `skills/vp-crystallize/SKILL.md` — AUQ enforcement note (81.6)
- `tests/unit/vp-workflow-consistency.test.js` — ≥12 contract tests (81.7)
- `CHANGELOG.md` — [2.18.0] section (81.7)
- `package.json` — version 2.18.0 (81.7)

## Tasks

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 81.1 | `workflows/rollback.md` — enriched tag parse (BUG-014) | Step 7 handles 3 tag formats; HANDOFF.json restored correctly | S |
| 81.2 | `workflows/crystallize.md` — brownfield execution path table (ENH-051) | Explicit RUN/SKIP/CONDITIONAL table for Steps 1/1A–1D | S |
| 81.3 | `workflows/brainstorm.md` — pre-save phase validation gate (ENH-052) | Save blocked when phases empty; exploratory mode bypass documented | S |
| 81.4 | Version bump unification — `SYSTEM-RULES.md` + evolve.md + autonomous.md (ENH-053) | Single authoritative table; both workflows reference it | M |
| 81.5 | `workflows/audit.md` + `workflows/autonomous.md` — exact auto-hook integration (ENH-054) | Concrete `<step>` XML in autonomous.md; post-phase audit runs Tier 1+2 | M |
| 81.6 | AUQ enforcement in 4 workflows + 4 SKILL.md (ENH-055) | All AUQ blocks have "Claude Code — REQUIRED"; ≥4 contract tests | M |
| 81.7 | Contract tests + CHANGELOG + version 2.18.0 | ≥12 tests pass; [2.18.0] entry; package.json = "2.18.0" | S |

## Verification
- [ ] `rollback.md` Step 7 parses enriched format `{p}-{b}-{v}-vp-p{N}-t{M}` correctly
- [ ] `crystallize.md` brownfield table: 1A=CONDITIONAL, 1B=CONDITIONAL, 1C=SKIP, 1D=SKIP
- [ ] `brainstorm.md` Step 6 has pre-save validation block; save blocked when phases missing
- [ ] `SYSTEM-RULES.md` has canonical "Version Bump Rules" table
- [ ] `evolve.md` and `autonomous.md` both removed inline bump rules and reference SYSTEM-RULES.md
- [ ] `autonomous.md` has `<step name="post_phase_audit">` block after Phase Complete step
- [ ] All 4 workflows have "Claude Code — REQUIRED" marker in every AUQ block
- [ ] ≥12 contract tests pass (`npm test`)
- [ ] `package.json` version = "2.18.0"
