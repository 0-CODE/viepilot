# Task 7.2: AI-GUIDE.md template — Install path READ-ONLY note

## Meta
- **Phase**: 07-working-dir-guard
- **Status**: not_started
- **Complexity**: S
- **Dependencies**: Task 7.1
- **Git Tag**: `viepilot-vp-p7-t7.2`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "fix"
complexity: "S"
write_scope:
  - "templates/project/AI-GUIDE.md"
recovery_budget: "S"       # L1x1, L2x1
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

Add an explicit install path READ-ONLY warning to `templates/project/AI-GUIDE.md` in the Static Context section. This ensures every ViePilot project (not just framework dev sessions) has the guardrail baked into its AI-GUIDE.

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Task contract fields below are filled with real paths and intent
- [ ] `## Paths` lists every file to modify
- [ ] `## File-Level Plan` explains what and why
- [ ] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "templates/project/AI-GUIDE.md"
```

## File-Level Plan
- `templates/project/AI-GUIDE.md`: Add install path warning block in the Static Context / Dynamic Context separation area. Warning must state:
  - `~/.claude/viepilot/` and `~/.cursor/viepilot/` = READ-ONLY runtime paths
  - All file edits must target files under this project's working directory only
  - Writing to install paths bypasses version control and ships untested code

## Context Required
```yaml
files_to_read:
  - "templates/project/AI-GUIDE.md"    # full file to find correct insertion point
  - ".viepilot/requests/BUG-007.md"    # fix spec
```

## Acceptance Criteria
- [ ] `grep -n 'READ-ONLY\|read-only' templates/project/AI-GUIDE.md` → match in install path note
- [ ] Warning mentions `~/.claude/viepilot/` and `~/.cursor/viepilot/` explicitly
- [ ] Warning explains consequence: bypasses version control

## Best Practices to Apply
- [ ] Note is clear and prominent — not buried in prose
- [ ] Applies to all projects (not framed as "only for ViePilot development")

## Do / Don't
### Do
- Place in Static Context section where AI reads it early

### Don't
- Don't duplicate the guard from autonomous.md verbatim — this is a shorter reminder

## Implementation Notes
```
(AI fills during implementation)
```

## Verification
```yaml
automated:
  - command: "grep -n 'READ-ONLY\\|read-only' templates/project/AI-GUIDE.md"
    expected: "match present in install path section"

manual:
  - description: "Read AI-GUIDE.md template — confirm install path note is present and clear"
    required: true
```

## State Update Checklist
- [ ] Update `.viepilot/phases/07-working-dir-guard/PHASE-STATE.md` after PASS
- [ ] Update `.viepilot/TRACKER.md`
- [ ] Update `.viepilot/HANDOFF.json`
- [ ] Update `.viepilot/ROADMAP.md` if progress changed

## Files Changed
```
(Auto-populated after completion)
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p7-t7.2".."${TAG_PREFIX}-p7-t7.2-done")
```

## Post-Completion

> **AI fills this section after task PASS**

### Implementation Summary
- (Replace with 2-5 bullets)

### Files Changed
| File | Action |
|------|--------|
| `templates/project/AI-GUIDE.md` | modified |

### Checklist Verification
- [ ] `## Meta → Status` set to `done`
- [ ] All `## Acceptance Criteria` boxes ticked `[x]`
- [ ] PHASE-STATE.md task row updated
- [ ] HANDOFF.json `position.task` → 7.3
- [ ] TRACKER.md current task line updated
