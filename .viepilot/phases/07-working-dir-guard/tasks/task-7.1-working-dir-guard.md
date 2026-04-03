# Task 7.1: autonomous.md — Working Directory Guard block

## Meta
- **Phase**: 07-working-dir-guard
- **Status**: not_started
- **Complexity**: M
- **Dependencies**: None
- **Git Tag**: `viepilot-vp-p7-t7.1`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "fix"
complexity: "M"
write_scope:
  - "workflows/autonomous.md"
recovery_budget: "M"       # L1x1, L2x2
can_parallel_with: []
recovery_overrides:
  L1:
    block: false
  L2:
    block: false
  L3:
    block: false
    reason: ""
```

## Objective

Add explicit "Working Directory Guard" block to the Initialize section of `workflows/autonomous.md`. The guard must:
1. Assert that edit target = `{project_cwd}` (where TRACKER.md lives)
2. Declare install paths (`~/.claude/viepilot/`, `~/.cursor/viepilot/`) as READ-ONLY
3. Provide detection condition: if file path is outside `{project_cwd}` → hard stop → control point
4. Apply to ALL file edits, not just framework development sessions

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Task contract fields below are filled with real paths and intent
- [ ] `## Paths` lists every file to create or modify
- [ ] `## File-Level Plan` explains what and why per path
- [ ] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/autonomous.md"
```

## File-Level Plan
- `workflows/autonomous.md`: Add "Working Directory Guard" block in the Initialize section (Step 1), after the context load instructions but before any execution steps. Block must contain:
  - Source-of-truth assertion: `{project_cwd}` = directory where TRACKER.md is found
  - Read-only list: `~/.claude/viepilot/`, `~/.cursor/viepilot/`, any path outside `{project_cwd}`
  - Pre-edit check instruction: before EVERY file edit, confirm path is under `{project_cwd}`
  - Hard stop condition: path outside `{project_cwd}` → do NOT proceed → route to control point with message

## Context Required
```yaml
files_to_read:
  - "workflows/autonomous.md"          # full file to find correct insertion point
  - ".viepilot/requests/BUG-007.md"    # fix spec
```

## Acceptance Criteria
- [ ] `grep -n 'Working Directory Guard' workflows/autonomous.md` → match found in Initialize section
- [ ] Guard block explicitly lists install paths as read-only
- [ ] Guard block has detection condition (path outside project_cwd → control point)
- [ ] Block position: within Initialize / Step 1, before first task execution

## Best Practices to Apply
- [ ] Guard is explicit instruction block, not just a comment
- [ ] Detection condition uses concrete path comparison, not vague "be careful"
- [ ] Does not break existing Initialize section structure

## Do / Don't
### Do
- Place guard early in Initialize so it runs before any edit
- Use concrete examples: `~/.claude/viepilot/` = install, `{project_cwd}/workflows/` = source

### Don't
- Don't make guard so strict it blocks legitimate absolute path edits within project_cwd
- Don't add guard as a comment-only — must be actionable instruction

## Implementation Notes
```
(AI fills during implementation)
- Decisions made:
- Issues encountered:
- Deviations from plan:
```

## Verification
```yaml
automated:
  - command: "grep -n 'Working Directory Guard' workflows/autonomous.md"
    expected: "at least 1 match in Initialize section"
  - command: "grep -n 'READ-ONLY\\|read-only\\|install path' workflows/autonomous.md"
    expected: "match present"

manual:
  - description: "Read Initialize section of autonomous.md — confirm guard block is present and actionable"
    required: true
```

## State Update Checklist
- [ ] Update `.viepilot/phases/07-working-dir-guard/PHASE-STATE.md` after PASS
- [ ] Update `.viepilot/TRACKER.md` with current task/progress
- [ ] Update `.viepilot/HANDOFF.json` to exact resume point
- [ ] Update `.viepilot/ROADMAP.md` if phase progress changed

## Files Changed
```
(Auto-populated after completion)
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p7-t7.1".."${TAG_PREFIX}-p7-t7.1-done")
```

## Post-Completion

> **AI fills this section after task PASS**

### Implementation Summary
- (Replace with 2-5 bullets)

### Files Changed
| File | Action |
|------|--------|
| `workflows/autonomous.md` | modified |

### Checklist Verification
- [ ] `## Meta → Status` set to `done`
- [ ] All `## Pre-execution documentation gate` boxes ticked `[x]`
- [ ] All `## Acceptance Criteria` boxes ticked `[x]`
- [ ] PHASE-STATE.md task row: Status=`done`, Completed=today, Git Tag=actual tag
- [ ] PHASE-STATE.md `execution_state.status` updated
- [ ] PHASE-STATE.md Files Changed table: entry added
- [ ] HANDOFF.json `position.task` → 7.2
- [ ] HANDOFF.json `meta.last_written` → now
- [ ] TRACKER.md current task line updated
