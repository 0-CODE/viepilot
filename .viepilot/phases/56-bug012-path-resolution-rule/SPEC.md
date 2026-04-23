# Phase 56 SPEC — PATH RESOLUTION RULE: codebase vs install (BUG-012)

## Goal
Prevent vp-auto from editing production install files (`~/.claude/`, `~/.cursor/`) instead of codebase source files (`{cwd}/`). Add explicit PATH RESOLUTION RULE to `autonomous.md` and strengthen `evolve.md` task template guidance.

## Problem Summary
BUG-009 (done) guards **format** of paths (absolute vs repo-relative in `## Paths` block).
BUG-012 (this phase) guards **destination** — ensures LLM resolves repo-relative paths from `{cwd}` (the repo root), not from install directories.

Incident: Phase 55, Task 55.1 — `workflows/brainstorm.md` resolved to `~/.claude/viepilot/workflows/brainstorm.md` (production) instead of `{cwd}/workflows/brainstorm.md` (codebase).

## Target Version
`2.1.1` (PATCH — critical bug fix, ships before Phase 55/BUG-011)

## Ordering
- Phase 56 (BUG-012) → ships **2.1.1**
- Phase 55 (BUG-011) → executes safely after BUG-012 is fixed → ships **2.1.2**

## Tasks

| Task | Title | Complexity |
|------|-------|------------|
| 56.1 | Add PATH RESOLUTION RULE block to `autonomous.md` (after BUG-009 preflight) | S |
| 56.2 | Strengthen TASK PATH RULE in `evolve.md` with cwd-resolution note | S |
| 56.3 | Contract tests — BUG-012 rule assertions | S |

## Acceptance Criteria
- [ ] `autonomous.md` has `⛔ PATH RESOLUTION RULE (BUG-012)` block explicitly stating:
  - All file reads/edits resolve from `{cwd}` (repo root, where `package.json` lives)
  - NEVER read/edit `~/.claude/`, `~/.cursor/`, or any install path
  - When a repo-relative path and an install path both exist, ALWAYS use `{cwd}`
- [ ] `evolve.md` TASK PATH RULE section has cwd-resolution clarification sentence
- [ ] 2+ contract tests verify the rule text exists in both files
- [ ] `npm test` green (no regression)

## Related
- BUG-012 request: `.viepilot/requests/BUG-012.md`
- BUG-009 (path format guard — 1.15.0): this extends BUG-009 with destination guard
- Incident: Phase 55 Task 55.1 — production brainstorm.md edited by mistake (reverted)
