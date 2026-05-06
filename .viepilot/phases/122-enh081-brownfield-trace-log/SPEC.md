# Phase 122 — ENH-081: Brownfield Scan Trace Log

## Goal

Add `BROWNFIELD-TRACE.md` — a real-time trace log written as the brownfield scanner runs —
to `workflows/crystallize.md`. Gives complete coverage visibility: which files were visited
per signal category, which were found/empty, and whether all 13 categories completed. Enables
resume detection for interrupted scans and provides a vp-audit-readable coverage artifact.

## Problem (confirmed by research)

Step 0-B currently writes ZERO disk artifacts during scanning. The Scan Report exists only
in memory until Step 0-C. No record of visited files, no checkpoint/resume, no coverage audit.
"Chaos scanning with no controlled coverage" — user's description, and accurate.

## Version Target

`2.47.0` — MINOR bump (significant new observability capability)

## Tasks

| Task | Description | Complexity |
|------|-------------|------------|
| 122.1 | Trace initialization + resume detection (Step 0-B start) | M |
| 122.2 | Per-category trace update protocol (during Signal Cat 1–13) | M |
| 122.3 | Coverage gate + Gap Filling Log + Step Completion tracking | M |
| 122.4 | Tests (≥10) + CHANGELOG [2.47.0] + version bump | S |

## Acceptance Criteria

- [ ] `BROWNFIELD-TRACE.md` creation spec at Step 0-B start with all 13 categories as "planned"
- [ ] Resume detection: if prior trace shows `scan_complete` → offer skip re-scan
- [ ] Interrupted scan detection: if trace shows `scanning` in-progress → offer resume from that category
- [ ] Per-category update: status row + Files Read Log section appended as each category runs
- [ ] Coverage gate: warn if any category still "planned" before presenting Scan Report
- [ ] Gap Filling Log: user answers appended during interactive gap-filling
- [ ] Step Completion: 0-B / 0-C / 0-D rows updated as each step completes
- [ ] ≥10 tests pass; `npm test` all pass
- [ ] `package.json` version = `2.47.0`

## Files Modified

- `workflows/crystallize.md` — trace init + per-category update + coverage gate
- `tests/unit/phase122-enh081-brownfield-trace-log.test.js` — ≥10 tests
- `CHANGELOG.md` — [2.47.0] entry
- `package.json` — version bump

## Dependencies

- FEAT-018 (Brownfield Mode) ✅
- ENH-079 (Signal Cat 13) ✅
- ENH-081 request ✅
