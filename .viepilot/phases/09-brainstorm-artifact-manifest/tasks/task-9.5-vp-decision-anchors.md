# Task 9.5: brainstorm.md — vp:decision anchor syntax

## Meta
- **Phase**: 09-brainstorm-artifact-manifest
- **Status**: done
- **Complexity**: M
- **Dependencies**: Task 9.2
- **Git Tag**: `viepilot-vp-p9-t9.5`

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "workflows/brainstorm.md"
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

Add `vp:decision` HTML comment anchor injection to brainstorm.md save_session step. On `/save`, scan all `**Decisions**:` blocks in the session → inject `<!-- vp:decision id="{topic}-{N}" -->` HTML comment anchors before each decision bullet. Also add backfill instruction for existing sessions. These anchors enable crystallize to track which decisions were consumed.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains what and why
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/brainstorm.md"
```

## File-Level Plan
- `workflows/brainstorm.md`: Add "Decision Anchor Injection" sub-step (Step 6B) in save_session, after manifest generation (6A) and before git commit. Content:
  - Scan session file for `**Decisions**:` blocks
  - For each decision bullet `- [x] {text}`: inject `<!-- vp:decision id="topic-{N}-d{M}" -->` before the bullet
  - Generate unique ID from topic slug + decision index
  - Add decision entry to `manifest.decisions[]` array
  - Backfill instruction: for existing sessions without anchors, run anchor injection on next `/save`

## Acceptance Criteria
- [x] `grep -n 'vp:decision' workflows/brainstorm.md` → match found
- [x] Anchor format documented: `<!-- vp:decision id="{id}" -->`
- [x] Decisions added to manifest.decisions[] array
- [x] Backfill instruction for existing sessions

## Verification
```yaml
automated:
  - command: "grep -n 'vp:decision' workflows/brainstorm.md"
    expected: "match in save_session step"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md
- [x] Update HANDOFF.json
- [x] Update ROADMAP.md if progress changed

## Files Changed
```
M	workflows/brainstorm.md
```

## Post-Completion

### Implementation Summary
- Added Step 6B "Decision Anchor Injection" to brainstorm.md save_session
- Scans `**Decisions**:` blocks → injects `<!-- vp:decision id="{slug}" -->` anchors
- Adds decision entries to manifest.decisions[] with id, text, anchor, session_id, topic
- Backfill: existing sessions get anchors on next /save

### Files Changed
| File | Action |
|------|--------|
| `workflows/brainstorm.md` | modified |
