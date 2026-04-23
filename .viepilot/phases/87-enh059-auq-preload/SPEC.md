# Phase 87 SPEC — ENH-059: AskUserQuestion ToolSearch Preload

## Goal
`AskUserQuestion` is a **deferred tool** in Claude Code — its JSON schema is not loaded at conversation start. The model must call `ToolSearch { query: "select:AskUserQuestion" }` first before it can invoke AUQ. Because none of the vp-* SKILL.md files or workflow files include this preload step, AUQ silently falls back to plain numbered-list text even on Claude Code adapter (where it is REQUIRED).

Fix: add an **AUQ preload instruction** to the init section of every skill and workflow that uses AUQ, so the model always runs `ToolSearch` before the first interactive prompt.

## Scope

### SKILL.md files (5)
- `skills/vp-request/SKILL.md` — AUQ at Step 1 (type detect)
- `skills/vp-evolve/SKILL.md` — AUQ at Step 2 (mode select)
- `skills/vp-auto/SKILL.md` — AUQ at control points
- `skills/vp-brainstorm/SKILL.md` — AUQ at decisions
- `skills/vp-crystallize/SKILL.md` — AUQ at decisions

### Workflow files (3)
- `workflows/request.md` — Step 1 / Step 2B
- `workflows/evolve.md` — Step 2 / Step 5
- `workflows/autonomous.md` — control points

## Preload Block (standard wording)
Insert as the **first bullet** under the AUQ adapter table in SKILL.md files, and as a **preload step** at the top of each workflow's `<process>` section:

```
**AUQ preload — Claude Code adapter (run before first interactive prompt):**
Call `ToolSearch` with `query: "select:AskUserQuestion"` to load the tool schema.
Skip only if ToolSearch itself returns an error; then use text fallback.
```

## Version Target
2.22.1 → **2.23.0** (MINOR — new behavior added to all AUQ-using skills)

## Tasks

| ID | Title | Complexity |
|----|-------|------------|
| 87.1 | Add AUQ preload block to 5 SKILL.md files | S |
| 87.2 | Add AUQ preload step to 3 workflow files | S |
| 87.3 | Contract tests + CHANGELOG + version 2.23.0 | S |

## Acceptance Criteria
- [ ] All 5 SKILL.md files have AUQ preload instruction before first interactive prompt
- [ ] All 3 workflow files have AUQ preload step at start of process/init
- [ ] Contract tests verify preload text in each affected file
- [ ] `npm test` all pass
- [ ] package.json = "2.23.0"
