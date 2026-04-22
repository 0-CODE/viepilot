# Phase 104 SPEC — ENH-070: vp-audit Auto-Log Gaps → Direct vp-evolve Routing

## Goal
Eliminate the manual `/vp-request` step after an audit. When `vp-audit` detects gaps (Tier 1–4), it auto-logs each finding as a `.viepilot/requests/` file, updates TRACKER.md, then offers the user a direct `/vp-evolve` route to plan the fix — no intermediate step needed.

## Scope
- `workflows/audit.md` — Auto-Log Gate after each tier report + post-audit routing banner
- `skills/vp-audit/SKILL.md` — Document auto-log behavior + `--no-autolog` flag

## Version Target
2.38.0 → **2.39.0**

## Tasks

| Task | Description | Complexity |
|------|-------------|------------|
| 104.1 | audit.md: Auto-Log Gate (Tier 1–4) + duplicate detection + TRACKER update | M |
| 104.2 | audit.md: Post-audit routing banner + AUQ prompt + `--no-autolog` flag; SKILL.md docs | S |
| 104.3 | Tests (≥12) + CHANGELOG [2.39.0] + version bump | S |

## Dependencies
- ENH-069 ✅ (Phase 103)
- Phase 103 ✅

## Acceptance Criteria
- [ ] `workflows/audit.md` has Auto-Log Gate after each tier report (Tiers 1–4)
- [ ] Detected ⚠️/⛔ items generate `.viepilot/requests/{TYPE}-{N}.md` with `Source: auto-logged by vp-audit`
- [ ] Duplicate detection prevents re-logging the same issue (title/file match)
- [ ] TRACKER.md updated automatically after audit
- [ ] Post-audit banner shows request IDs + `/vp-evolve` as first next-action
- [ ] AUQ prompt offers `Plan fix phase → /vp-evolve` as Recommended
- [ ] `--no-autolog` flag disables auto-logging
- [ ] `skills/vp-audit/SKILL.md` documents auto-log + `--no-autolog`
- [ ] Tests (≥12) all pass
