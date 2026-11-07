# Phase 180 Spec — ENH-129: optional Plan Mode for /vp-evolve

## Goal
`/vp-evolve` can plan in Claude Code Plan Mode (read-only exploration, one native approval via ExitPlanMode) before any plan file is written; offered for L/XL or vague requests; approved plan written verbatim; current flow kept as fallback.

## Requests
`.viepilot/requests/ENH-129.md`

## Design decisions
- Optional (`--plan-mode`, or AUQ offer for L/XL / vague requests) — never the default.
- ExitPlanMode is the plan-approval gate; no AUQ "is the plan ok?" on top.
- Approved plan is written verbatim into SPEC/tasks (doc-first, survives compaction).
- vp-auto: optional per high-risk task only, never per task by default.

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).
- Planned in Claude Code Plan Mode; the approved plan is copied verbatim below the SPEC (ENH-129 rule).

## Target Version
3.24.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 180.1 | evolve workflow Plan Mode block + SKILL docs | M |
| 180.2 | vp-auto optional per-task note + tests | S |
| 180.3 | CHANGELOG 3.24.0 + resolve ENH-129 + reinstall | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 180 --phase-complete` → exit 0
- [ ] version = 3.24.0

## Approved plan (Plan Mode, verbatim)

> Approved by the user via ExitPlanMode on 2026-11-07.

# Phase 180 — ENH-129: optional Plan Mode for /vp-evolve (→ 3.24.0)

## Context
The user asked whether combining `/vp-evolve` with Claude Code Plan Mode (EnterPlanMode / ExitPlanMode) helps.
Agreed answer: yes for large or unclear requests, as an **option**. Today `workflows/evolve.md` gathers info with
AUQ (complexity, brainstorm routing), checks architecture, then **writes ROADMAP / phase dir / SPEC / tasks without any
plan-approval gate** — the only gate is the final "what next?" AUQ (`<step name="confirm">`). Plan Mode adds a
read-only exploration phase and one native approval of the whole phase plan *before* any plan file is written.
This phase itself is being planned in Plan Mode as a dogfood run.

## Approach
1. **`workflows/evolve.md`** — new block "Plan Mode (ENH-129, Claude Code, optional)" inside `add_feature`
   (and referenced from `refactor` / `new_milestone`), placed after "Gather Feature Info" + complexity AUQ and before
   "Generate new phase":
   - Trigger: `--plan-mode` flag, or an AUQ offer when complexity is **L/XL** or the request is vague
     (options: Use Plan Mode (Recommended for L/XL) / Plan directly).
   - Flow: `ToolSearch select:EnterPlanMode,ExitPlanMode` → `EnterPlanMode` → read-only exploration (Read/Grep/Glob,
     Explore agents) + architecture check → write the draft (phase goal, decisions, tasks with Paths / notes / AC /
     verification) to the plan file → `ExitPlanMode`.
   - On approval: write SPEC.md / tasks / PHASE-STATE / ROADMAP **verbatim from the approved plan** (doc-first,
     survives compaction); record "approved in Plan Mode" in SPEC. On rejection/edits: revise in Plan Mode.
   - ExitPlanMode **is** the plan-approval gate — do not add an AUQ "is the plan ok?" on top (Plan Mode rule).
   - Fallback: hosts without Plan Mode (Cursor Agent mode, Codex, Copilot, Antigravity) and subagents → current flow;
     optionally show the draft and ask with AUQ / numbered text before writing.
2. **`skills/vp-evolve/SKILL.md`** — document `--plan-mode`; adapter note (Claude Code only; Cursor has its own Plan
   Mode — text fallback otherwise); add "Plan Mode offer (L/XL)" to the AUQ prompt list.
3. **`workflows/autonomous.md`** (small) — note: optional `--plan-mode` for a single high-risk task, never the
   default per task (keeps vp-auto autonomous); reuse the existing EnterPlanMode/ExitPlanMode mention in
   `skills/vp-auto/SKILL.md`.
4. **Tests** `tests/unit/phase180-enh129-plan-mode.test.js`: evolve workflow has the block, the L/XL offer, the
   verbatim-write rule, the no-duplicate-gate rule and the fallback; SKILL lists `--plan-mode`; English only
   (existing enh031 lint).
5. **Release**: CHANGELOG 3.24.0, package version, ENH-129 → done, TRACKER/ROADMAP, phase close + tag; reinstall.

## Critical files
- `workflows/evolve.md` (steps `add_feature`, `refactor`, `new_milestone`, `confirm`)
- `skills/vp-evolve/SKILL.md`
- `workflows/autonomous.md` (one paragraph)
- `tests/unit/phase180-enh129-plan-mode.test.js` (new)
- `.viepilot/phases/180-enh129-evolve-plan-mode/` (SPEC, tasks 180.1–180.3, PHASE-STATE), ROADMAP, TRACKER

## Tasks
- 180.1 evolve workflow Plan Mode block + SKILL docs (M)
- 180.2 vp-auto optional per-task note + tests (S)
- 180.3 CHANGELOG 3.24.0 + resolve ENH-129 + reinstall (S)

## Verification
- `npx jest tests/unit/phase180 --no-coverage` and full `npm test` (currently 3278) green.
- `node bin/vp-tools.cjs policy sync --check` still OK (SKILL edits outside the policy markers).
- `node bin/vp-tools.cjs todo check --phase 180 --phase-complete` exit 0; git persistence clean except the untracked
  trial `docs/proposals/`.
