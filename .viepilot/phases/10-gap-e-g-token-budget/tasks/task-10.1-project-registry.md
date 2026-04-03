# Task 10.1: project-registry.json schema + vp-crystallize auto-register

## Meta
- **Phase**: 10-gap-e-g-token-budget
- **Status**: done
- **Complexity**: S
- **Dependencies**: Phase 8 complete
- **Git Tag**: `viepilot-vp-p10-t10.1`

## Task Metadata

```yaml
type: "build"
complexity: "S"
write_scope:
  - "templates/project/project-registry.json"
  - "workflows/crystallize.md"
recovery_budget: "S"
```

## Objective

1. Create `templates/project/project-registry.json` — schema for the cross-project registry at `~/.viepilot/project-registry.json`
2. Add auto-register instruction to crystallize.md commit_confirm step: after crystallize completes, register the project in the global registry

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains what and why
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create:
  - "templates/project/project-registry.json"
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan
- `templates/project/project-registry.json`: Schema with `projects[]` array. Each entry: `name`, `path`, `version`, `registered_at`, `last_crystallize`, `tracker_path`, `handoff_path`
- `workflows/crystallize.md`: In Step 12 (commit_confirm), add sub-step 12.3: auto-register project in `~/.viepilot/project-registry.json`. Create file if not exists. Add/update entry for current project.

## Acceptance Criteria
- [x] Template file exists at `templates/project/project-registry.json`
- [x] Valid JSON schema with projects[] array
- [x] crystallize.md Step 12 has auto-register instruction
- [x] Manual add/remove documented in comments

## Verification
```yaml
automated:
  - command: "node -e \"JSON.parse(require('fs').readFileSync('templates/project/project-registry.json','utf8')); console.log('valid')\""
    expected: "valid"
  - command: "grep -n 'project-registry' workflows/crystallize.md"
    expected: "match in Step 12"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md
- [x] Update HANDOFF.json
- [x] Update ROADMAP.md if progress changed

## Files Changed
```
A	templates/project/project-registry.json
M	workflows/crystallize.md
```

## Post-Completion

### Implementation Summary
- Created project-registry.json template with projects[] array schema
- Each entry: name, path, version, registered_at, last_crystallize, tracker/handoff paths, status
- Added Step 12.3 to crystallize.md: auto-register in ~/.viepilot/project-registry.json
- Non-blocking: permission errors logged as warning, don't fail crystallize

### Files Changed
| File | Action |
|------|--------|
| `templates/project/project-registry.json` | created |
| `workflows/crystallize.md` | modified |
