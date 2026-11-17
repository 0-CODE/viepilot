# Phase 181 Spec — BUG-039: skills load their workflow deterministically (+ R1–R3)

## Goal
On Claude Code (and the other adapters) every `vp-*` skill gets its workflow contract deterministically: the installer
ships the workflow inside the skill (`references/`) and replaces the unexpanded `@$HOME/...` include with one explicit
Step 0 Read of a resolved path; the hard gates are also inline in SKILL.md. Fix the PHASE-STATE template / todo-mirror
mismatch, the crystallize subagent write, and the executor turn budget.

## Requests
`.viepilot/requests/BUG-039.md`

## Design decisions
- Fix A (install-time `references/<workflow>.md` + Step 0 Read) + fix C (short inline hard gates). Source SKILL.md keeps
  `@$HOME/{envToolDir}/workflows/X.md` as the marker; the installer renders it — one source for all adapters.
- Renderer is a pure, idempotent function; symlink installs point Step 0 at the installed workflows dir.
- Parser accepts both PHASE-STATE formats (no breaking change for existing projects); template moves to `## Tasks`.
- Subagents never write files; `vp-tools stack-cache write` persists research.
- Executor budget 60 turns + report-before-budget; missing report = PARTIAL.

## Constraints
- English only in workflows/, skills/, templates/ (enh031 test).
- Tests resilient: `>=` for counts, no pinned version literals; temp HOME for install tests.
- Never touch the real `~/.claude/settings.json`.
- ENH-125 tool policy; `policy sync --check` stays OK.

## Target Version
3.25.0 (MINOR — installer changes the installed skill layout)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 181.1 | Installer: ship each skill's workflow inside the skill + explicit Read step (fix A) | L |
| 181.2 | Hard gates inline in SKILL.md (fix C) + banner fw version | M |
| 181.3 | R1: PHASE-STATE template vs todo-mirror parser | S |
| 181.4 | R2: crystallize research subagents return text; orchestrator persists the stack cache | M |
| 181.5 | R3: executor turn budget, split rule, report-before-budget; release 3.25.0 | M |
