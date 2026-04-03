# Task 9.4: crystallize.md — Auto-populate TASK.md context_required from ui_task_context_hint

## Meta
- **Phase**: 09-brainstorm-artifact-manifest
- **Status**: done
- **Complexity**: M
- **Dependencies**: Tasks 9.1, 9.2, 9.3
- **Git Tag**: `viepilot-vp-p9-t9.4`

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "workflows/crystallize.md"
recovery_budget: "M"
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

Add auto-population of `context_required` in TASK.md files during crystallize Step 10 (generate_phase_dirs). When a task description references UI pages/screens, auto-add relevant ui-direction file paths from `manifest.ui_task_context_hint[]` to that task's `context_required` section.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains insertion point
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan
- `workflows/crystallize.md`: In Step 10 (generate_phase_dirs), after Gap G compliance detection block and before the notes, add a new sub-section "Context Required Auto-population". Logic:
  - If `manifest.ui_task_context_hint` is non-empty (loaded in Step 0A)
  - For each task being generated: scan description for UI keywords (page, screen, component, layout, dashboard, form, view)
  - If match found: add ui_task_context_hint paths to that task's `context_required.files_to_read` section
  - Also add any artifact paths from manifest that are relevant to the task type

## Acceptance Criteria
- [x] `grep -n 'context_required.*auto' workflows/crystallize.md` → match in Step 10
- [x] Logic scans task descriptions for UI keywords
- [x] Adds ui_task_context_hint paths to matching tasks
- [x] Non-UI tasks are not affected

## Verification
```yaml
automated:
  - command: "grep -n 'ui_task_context_hint' workflows/crystallize.md"
    expected: "match in Step 10 generate_phase_dirs"
  - command: "grep -n 'context_required' workflows/crystallize.md"
    expected: "match in auto-population block"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md
- [x] Update HANDOFF.json
- [x] Update ROADMAP.md if progress changed

## Files Changed
```
M	workflows/crystallize.md
```

## Post-Completion

### Implementation Summary
- Added "Context Required Auto-population" block to crystallize Step 10
- Scans task descriptions for 15 UI keywords to identify UI page tasks
- Adds manifest.ui_task_context_hint paths to matching tasks' context_required
- Also adds architecture_inputs and domain_entities paths for relevant tasks
- Skip condition: silently skips when manifest is absent or hint array empty

### Files Changed
| File | Action |
|------|--------|
| `workflows/crystallize.md` | modified |
