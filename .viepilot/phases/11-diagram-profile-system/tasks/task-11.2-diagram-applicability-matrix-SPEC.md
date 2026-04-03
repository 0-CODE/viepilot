# Task 11.2: crystallize.md — Diagram applicability matrix in SPEC.md

## Meta
- **Phase**: 11-diagram-profile-system
- **Status**: done
- **Complexity**: M
- **Dependencies**: Task 11.1 (Step 1D `diagram_profile` + Step 4 matrix rules)
- **Git Tag**: `viepilot-vp-p11-t11.2` → **done**: `viepilot-vp-p11-t11.2-done`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

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

After the Step 4 diagram applicability matrix is finalized (status + rule per `diagram_type`), **persist** the same inventory to **`.viepilot/SPEC.md`** so vp-auto / humans have a stable artifact (not only inline ARCHITECTURE.md generation). Table columns are normative: **`diagram_type`**, **`applies_when`**, **`folder_path`**, **`status`**.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan with insertion point in Step 4
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan

- **`workflows/crystallize.md`** (Step 4, after the existing “Diagram profile → matrix” table and generation rules, **before** “Architecture diagram source files on disk (ENH-022)”): add subsection **“Persist diagram applicability matrix to SPEC.md”** that:
  - Requires creating/updating `.viepilot/SPEC.md` section `## Diagram Applicability Matrix` (create file with minimal title if missing).
  - Defines markdown table `| diagram_type | applies_when | folder_path | status |` with one row per matrix key (`system-overview`, `data-flow`, `event-flows`, `module-dependencies`, `deployment`, `user-use-case`).
  - **`applies_when`**: one-line summary aligned with the matrix **Rule** column + Step 1D `diagram_profile` / flags where relevant.
  - **`folder_path`**: canonical **relative** path for diagram artifacts under the Phase 11 profile layout (`architecture/cross/`, `architecture/backend/`, `architecture/frontend/`, `architecture/sequences/`) — use `—` when `status` is `N/A`; when ENH-022 flat sidecar `.viepilot/architecture/<name>.mermaid` is the current write target, state both (profile folder + sidecar path) in the cell or footnote so 11.3 can reconcile.
  - **`status`**: `required` | `optional` | `N/A` (same semantics as Step 4 matrix).
  - Idempotency: if the section exists, replace from `## Diagram Applicability Matrix` through the end of that section (or use explicit HTML comment anchors) so re-runs do not duplicate tables.
  - Cross-ref: point readers to `.viepilot/ARCHITECTURE.md` diagram sections + ENH-022 sidecars for rendered source.

## Context Required
```yaml
files_to_read:
  - "workflows/crystallize.md"
  - ".viepilot/phases/11-diagram-profile-system/SPEC.md"
```

## Acceptance Criteria
- [x] `grep -n 'Diagram Applicability Matrix' workflows/crystallize.md` → match in Step 4 persistence instructions
- [x] Normative SPEC table columns documented: `diagram_type`, `applies_when`, `folder_path`, `status`
- [x] All six diagram types from the Step 4 matrix appear in the SPEC persistence spec
- [x] Persistence location `.viepilot/SPEC.md` stated (consistent with Step 6A entity manifest path)

## Best Practices to Apply
- [x] Match existing Step 4 / ENH-022 tone (English normative, tables)
- [x] Keep token-efficient; avoid duplicating full matrix — reference Step 4 for full rules
- [x] Backward compatible: projects without existing SPEC.md create minimal file

## Do / Don't
### Do
- Align `folder_path` vocabulary with Phase 11 phase SPEC (`architecture/cross/` …)
- Mention ENH-022 `.mermaid` filenames where they are the current sidecar contract

### Don't
- Don’t implement 11.3 folder creation or autonomous stale-diagram logic here

## Verification
```yaml
automated:
  - command: "grep -n 'Diagram Applicability Matrix' workflows/crystallize.md"
    expected: "match"
  - command: "grep -n 'folder_path' workflows/crystallize.md"
    expected: "match in SPEC persistence subsection"
  - command: "grep -n 'applies_when' workflows/crystallize.md"
    expected: "match"
```

## State Update Checklist
- [x] Update `PHASE-STATE.md` after PASS
- [x] Update `TRACKER.md`
- [x] Update `HANDOFF.json`
- [x] Update `CHANGELOG.md` [Unreleased] if user-visible workflow change
- [x] Update `ROADMAP.md` Progress Summary if phase % changes

## Implementation Notes
- Added Step 4 subsection **Persist diagram applicability matrix to SPEC.md** before ENH-022 sidecar block: anchors, table schema, normative `folder_path` map (profile layout + ENH-022 paths), optional ARCHITECTURE cross-ref

## Files Changed
```
M	CHANGELOG.md
M	workflows/crystallize.md
M	.viepilot/ROADMAP.md
M	.viepilot/TRACKER.md
M	.viepilot/phases/11-diagram-profile-system/PHASE-STATE.md
A	.viepilot/phases/11-diagram-profile-system/tasks/task-11.2-diagram-applicability-matrix-SPEC.md
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p11-t11.2".."${TAG_PREFIX}-p11-t11.2-done")
```
