# Task 9.2: brainstorm.md — Auto-generate manifest on /save + /end + ENH-030

## Meta
- **Phase**: 09-brainstorm-artifact-manifest
- **Status**: done
- **Complexity**: M
- **Dependencies**: Task 9.1
- **Git Tag**: `viepilot-vp-p9-t9.2`

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "workflows/brainstorm.md"
  - "templates/project/brainstorm-manifest.json"
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

1. Add manifest auto-generation block to `workflows/brainstorm.md` save_session step: on `/save` and `/end`, write/update `.viepilot/brainstorm-manifest.json` from session content
2. Update `templates/project/brainstorm-manifest.json` with ENH-030 artifact types: `domain_entities` (required:true), `tech_stack` (required:true), `compliance_domains` (required:false)

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
  - "templates/project/brainstorm-manifest.json"
```

## File-Level Plan
- `workflows/brainstorm.md`: Add "Manifest Generation" sub-step inside save_session (Step 6), after the session file is written but before the git commit. Instructions:
  - Read or create `.viepilot/brainstorm-manifest.json` (copy from template if first session)
  - Update `sessions[]`: add/update entry for current session
  - Scan session content for artifacts: ui_direction files, product_horizon section, research notes, architecture inputs, domain entities, tech stack mentions
  - For each found artifact: set path, summary, consumed=false
  - Populate `ui_task_context_hint[]` from UI direction file paths
  - Write manifest to `.viepilot/brainstorm-manifest.json`
  - Add to git commit
- `templates/project/brainstorm-manifest.json`: Add 3 new artifact types from ENH-030:
  - `domain_entities`: {required: true} — entities identified in brainstorm (feeds crystallize Step 6A)
  - `tech_stack`: {required: true} — stack decisions from brainstorm (feeds STACKS.md)
  - `compliance_domains`: {required: false} — compliance-sensitive areas mentioned

## Acceptance Criteria
- [x] brainstorm.md save_session step includes manifest generation block
- [x] Manifest generation scans session for all artifact types
- [x] New artifacts default to `consumed: false`
- [x] Template JSON includes `domain_entities`, `tech_stack`, `compliance_domains` artifact types
- [x] `ui_task_context_hint[]` populated from UI direction paths

## Verification
```yaml
automated:
  - command: "grep -n 'brainstorm-manifest' workflows/brainstorm.md"
    expected: "match found in save_session step"
  - command: "node -e \"const m=JSON.parse(require('fs').readFileSync('templates/project/brainstorm-manifest.json','utf8')); console.log(Object.keys(m.artifacts).join(','))\""
    expected: "includes domain_entities,tech_stack,compliance_domains"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md
- [x] Update HANDOFF.json
- [x] Update ROADMAP.md if progress changed

## Files Changed
```
M	workflows/brainstorm.md
M	templates/project/brainstorm-manifest.json
```

## Post-Completion

### Implementation Summary
- Added Step 6A "Generate Brainstorm Manifest" to brainstorm.md save_session step
- Manifest auto-generated on /save and /end — scans session for 7 artifact types
- Added ENH-030 artifact types to schema template: domain_entities, tech_stack, compliance_domains
- ui_task_context_hint[] auto-populated from UI direction file paths
- Git commit updated to include .viepilot/brainstorm-manifest.json

### Files Changed
| File | Action |
|------|--------|
| `workflows/brainstorm.md` | modified |
| `templates/project/brainstorm-manifest.json` | modified |
