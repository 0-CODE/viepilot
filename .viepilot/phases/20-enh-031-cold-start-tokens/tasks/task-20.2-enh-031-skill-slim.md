# Task 20.2: ENH-031 — Slim vp-auto SKILL

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: done
- **Complexity**: S
- **Git Tag**: `viepilot-vp-p20-t20.2`

## Task Metadata
```yaml
type: build
complexity: S
write_scope:
  - skills/vp-auto/SKILL.md
recovery_budget: S
```

## Objective
Reduce duplicate process text in `vp-auto` SKILL; keep routing + pointers to `workflows/autonomous.md` as single source of truth (ENH-031 direction **C**).

## Paths
| Path | Action |
|------|--------|
| `skills/vp-auto/SKILL.md` | Replace long `<process>` / success blocks with short summary + explicit “load autonomous.md” |

## File-Level Plan
- Preserve YAML frontmatter, `cursor_skill_adapter`, `scope_policy`, `implementation_routing_guard` (BUG-004 / ENH-021).
- Keep required XML blocks for provider/tests: `<objective>`, `<execution_context>`, `<success_criteria>` with `- [ ]` checkboxes (`tests/unit/ai-provider-compat.test.js`).
- Remove inlined multi-step process mirror; delegate via `<execution_context>` to `autonomous.md`.

## Best Practices to Apply
- [x] English for new skill body sections where mixed with existing Vietnamese policy text.
- [x] No behavior change for install path — skill still points `@$HOME/.cursor/viepilot/workflows/autonomous.md` for bundle context.

## Verification
```bash
wc -l skills/vp-auto/SKILL.md
grep -n 'workflows/autonomous.md' skills/vp-auto/SKILL.md | head -5
! grep -n '### 3. Execute Phase Loop' skills/vp-auto/SKILL.md
npx jest tests/unit/ai-provider-compat.test.js tests/unit/enh-backlog-workflow-contracts.test.js
npm run cold-start:manifest
```
**Expected:** `SKILL.md` well under 120 lines; autonomous references present; third grep exits 1; tests PASS; manifest updates SKILL byte count.

## Pre-execution documentation gate
- [x] Written plan in this file
- [x] `PHASE-STATE.md` task 20.2 `in_progress` before first implementation commit

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-031.md
  - skills/vp-auto/SKILL.md
  - workflows/autonomous.md
```

## Acceptance Criteria
- [x] SKILL is routing-focused; no long duplicate of autonomous steps
- [x] Install/template copy of skill stays consistent if mirrored from repo

## Implementation Notes
- Replaced inline `<process>` with `<execution_context>` + short `<objective>`; retained `<success_criteria>` checklists for Cursor conformance tests.
- Objective mentions `.viepilot/ROADMAP.md`, `docs/skills-reference.md`, `README.md` for milestone sync (ENH backlog contract).

## Files Changed
```text
M	.viepilot/cold-start-manifest.json
M	skills/vp-auto/SKILL.md
```

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol
