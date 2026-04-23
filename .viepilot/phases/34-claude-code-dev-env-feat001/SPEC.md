# Phase 34 — SPEC

**Milestone:** M1.29  
**Phase slug:** `34-claude-code-dev-env-feat001`  
**Request:** [FEAT-001](../../requests/FEAT-001.md)

## Goal
Ship **user-facing documentation** (and lightweight Jest contracts) so Claude Code users can install ViePilot, place bundled `skills/` and `workflows/` where Claude Code loads them, run **`vp-tools info`**, and bootstrap **`.viepilot/`** in a target project.

## Scope
- New doc: `docs/user/claude-code-setup.md` (canonical guide).
- Cross-links from existing doc entrypoints.
- Contract test file under `tests/unit/` (mirror FEAT-009/010 patterns).

## Out of scope (this phase)
- Changing npm package behavior or installer code unless a task explicitly requires it (defer to follow-up ENH).
- Official Anthropic templates inside this repo (only link to upstream docs).

## Architecture fit
`ARCHITECTURE.md` already lists **Cursor / Claude** in the UI layer; this phase is **docs + tests only** — no new runtime services.

## Success
- All tasks **34.1–34.3** marked done in `PHASE-STATE.md` after `/vp-auto`.
- FEAT-001 **Status** → `done` (or `in_progress` during execution).

## Dependencies
- npm **1.9.2** baseline; target release note **1.9.3** in ROADMAP M1.29 Overview.
