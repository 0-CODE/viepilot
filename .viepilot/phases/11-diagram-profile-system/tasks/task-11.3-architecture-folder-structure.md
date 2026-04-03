# Task 11.3: crystallize.md — Architecture folder structure per profile

## Meta
- **Phase**: 11-diagram-profile-system
- **Status**: done
- **Complexity**: S
- **Dependencies**: Task 11.2 (SPEC matrix + folder_path map)
- **Git Tag**: `viepilot-vp-p11-t11.3` → **done**: `viepilot-vp-p11-t11.3-done`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "build"
complexity: "S"
write_scope:
  - "workflows/crystallize.md"
recovery_budget: "S"
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

Extend **Step 4** of `crystallize.md` so that after the diagram matrix + SPEC persistence + ENH-022 sidecars, the executor **creates repo-root `architecture/<layer>/` directories** (with **stub `README.md` files**) matching the Phase 11 profile layout. Directories must be derived from **non-`N/A` diagram rows** and **Step 1D flags** (`kafka_or_messaging`, `auth_module`, `state_heavy_entities`), idempotently.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan with insertion point after ENH-022 subsection
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan

- **`workflows/crystallize.md`**: After **### Architecture diagram source files on disk (ENH-022)** and **before** **### Consumed Anchor Tracking**, insert **### Architecture profile folders on disk (Phase 11 — task 11.3)** with normative rules:
  - Skip entirely if all six matrix rows are `N/A`.
  - Build a **deduplicated set** of directories from required/optional rows using the same normative map as SPEC `folder_path` (including `event-flows` → `architecture/backend/` when `kafka_or_messaging` is true).
  - Add `architecture/state-machines/` when `state_heavy_entities` is true; add `architecture/sequences/` when `auth_module` is true or `user-use-case` maps to sequences per existing Step 4 wording.
  - Each targeted dir: ensure `README.md` stub exists; **do not overwrite** existing `README.md`.
  - Optional root `architecture/README.md` index when missing.
  - Reference ENH-022 sidecars as canonical mirror; profile folders are structural/layout.

## Context Required
```yaml
files_to_read:
  - "workflows/crystallize.md"
  - ".viepilot/phases/11-diagram-profile-system/SPEC.md"
```

## Acceptance Criteria
- [x] New subsection title matches grep target for phase verification planning (`Architecture profile folders` + Phase 11)
- [x] Rules reference `architecture/cross/`, `architecture/backend/`, `architecture/frontend/`, `architecture/sequences/`, `architecture/state-machines/`
- [x] Idempotent stub policy documented (no overwrite of existing README)
- [x] Skip rule when all diagrams `N/A`

## Best Practices to Apply
- [x] English normative prose consistent with Step 4 / ENH-022
- [x] Token-efficient; no duplicate of full matrix table
- [x] Align with ROADMAP Phase 11 verification (microservice + Kafka → at least `cross/` + `backend/`)

## Do / Don't
### Do
- Keep ENH-022 `.viepilot/architecture/*.mermaid` as the documented mirror target

### Don't
- Don’t implement autonomous stale-diagram logic (task 11.4)

## Verification
```yaml
automated:
  - command: "grep -n 'Architecture profile folders' workflows/crystallize.md"
    expected: "match"
  - command: "grep -n 'architecture/state-machines' workflows/crystallize.md"
    expected: "match"
```

## State Update Checklist
- [x] Update `PHASE-STATE.md` after PASS
- [x] Update `TRACKER.md`
- [x] Update `HANDOFF.json`
- [x] Update `CHANGELOG.md` [Unreleased] if user-visible workflow change

## Implementation Notes

- Added **### Architecture profile folders on disk (Phase 11 — task 11.3)** after ENH-022 in `workflows/crystallize.md`: skip if all matrix rows `N/A`; union dirs from required/optional rows + `kafka_or_messaging` / `auth_module` / `state_heavy_entities`; stub `README.md` with `vp:architecture-profile-stub`; optional root `architecture/README.md`.
- Synced `CHANGELOG.md` [Unreleased], tags `viepilot-vp-p11-t11.3` / `viepilot-vp-p11-t11.3-done`, tracker/roadmap/phase state.

## Files Changed

```
M	.viepilot/ROADMAP.md
M	.viepilot/TRACKER.md
M	.viepilot/phases/11-diagram-profile-system/PHASE-STATE.md
M	CHANGELOG.md
M	workflows/crystallize.md
```
