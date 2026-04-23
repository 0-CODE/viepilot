# Phase 75: vp-crystallize Brownfield Mode

## Overview
- **Request**: FEAT-018
- **Goal**: Add brownfield mode to `vp-crystallize` so ViePilot can bootstrap project context from an existing codebase (no brainstorm session required).
- **Version target**: 2.12.0
- **Dependencies**: Phase 73 ✅ (ENH-044), Phase 74 (ENH-045, may run in parallel)

## Problem
`vp-crystallize` Step 1 hard-requires `docs/brainstorm/session-*.md`. Brownfield projects have no such file — the entire vp-auto / vp-evolve / vp-audit toolchain is blocked for teams adopting ViePilot on an existing project.

## Solution
Add a **Brownfield Mode** branch that:
1. Auto-detects brownfield condition (no brainstorm session + no .viepilot/) or accepts `--brownfield` flag.
2. Runs a 12-category codebase scanner (build manifests, frameworks, architecture dirs, DB signals, API contracts, infra, env config, test coverage, code quality, docs, git history, file survey).
3. Produces a structured Scan Report with DETECTED / ASSUMED / MISSING gap classification.
4. Interactively fills MUST-DETECT gaps with user before generating any artifacts.
5. Writes a synthetic brainstorm stub so audit tools remain consistent.
6. Generates full `.viepilot/` artifact set (same as greenfield) with brownfield-appropriate content.

## Files Affected

### Modified
- `workflows/crystallize.md` — add Step 0-B (brownfield scanner) before Step 1 `analyze_brainstorm`
- `skills/vp-crystallize/SKILL.md` — add `--brownfield` flag documentation
- `skills/vp-audit/SKILL.md` — accept `session-brownfield-import.md` as valid brainstorm source

### Created
- `tests/unit/vp-feat018-brownfield.test.js` — contract tests

### Updated
- `CHANGELOG.md` — 2.12.0 entry
- `package.json` — version 2.12.0

## Task Breakdown
| Task | Description | Complexity |
|------|-------------|------------|
| 75.1 | crystallize.md — brownfield detection + Step 0-B scanner Signal Cat 1–6 + Scan Report schema | M |
| 75.2 | crystallize.md — Signal Cat 7–12 + Gap Detection Rules + gap-filling + brainstorm stub + safety rules | M |
| 75.3 | SKILL.md updates (crystallize + audit) | S |
| 75.4 | Tests (≥15) + CHANGELOG 2.12.0 | S |

## Acceptance Criteria (from FEAT-018)
- [ ] `--brownfield` flag recognized; auto-detection works when no brainstorm session found
- [ ] All 12 signal categories implemented per FEAT-018 spec
- [ ] Scan Report schema present in workflow
- [ ] Gap Detection Rules: MUST-DETECT / SHOULD-DETECT / NICE-TO-DETECT tiers defined
- [ ] Interactive gap-filling pauses for MISSING MUST-DETECT fields
- [ ] `docs/brainstorm/session-brownfield-import.md` stub created
- [ ] Safety rules enforced: `.env` never read, skip `node_modules/` / `.git/` / `target/` / `build/` / `dist/`
- [ ] `vp-audit` accepts brownfield stub without errors
- [ ] ≥15 contract tests pass
- [ ] `npm test` green
