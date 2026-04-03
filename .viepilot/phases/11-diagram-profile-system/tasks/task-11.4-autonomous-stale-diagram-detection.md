# Task 11.4: autonomous.md — Stale diagram detection + update trigger

## Meta
- **Phase**: 11-diagram-profile-system
- **Status**: done
- **Complexity**: M
- **Dependencies**: Task 11.3 (architecture profile folders + crystallize alignment)
- **Git Tag**: `viepilot-vp-p11-t11.4` → **done**: `viepilot-vp-p11-t11.4-done`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "workflows/autonomous.md"
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

Extend **## 5. Phase Complete** in `workflows/autonomous.md` so that **at phase boundary only** (not after each task), the executor detects whether the phase changed architecture/diagram footprint, flags **stale diagram** work when applicable, and runs a normative **reconciliation pass** before finalizing `SUMMARY.md` — aligned with Phase 11 SPEC and ENH-018 matrix loading rules.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan with insertion point in Phase Complete section
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/autonomous.md"
```

## File-Level Plan

- **`workflows/autonomous.md`**: Inside `<step name="phase_complete">` / **## 5. Phase Complete**, after numbered step **2. Check phase quality gate** and **before** **3. Write SUMMARY.md**, insert a new numbered step **2a. Stale diagram detection + update trigger (Phase 11 — architecture profile)** that:
  - Uses the same `TAG_PREFIX` + `git diff "${TAG_PREFIX}-p{phase}-t1"..HEAD --name-only` pattern as the existing SUMMARY population command.
  - Defines **touch prefixes**: repo-root `architecture/`, `.viepilot/architecture/`, `.viepilot/ARCHITECTURE.md`.
  - If no path matches → skip remainder silently (no SUMMARY subsection required for this).
  - If touched → ENH-018: consult `.viepilot/ARCHITECTURE.md` diagram applicability matrix; reconcile canonical diagram sources (mermaid sidecars + profile folder README stubs per matrix) **once at phase complete**, not per task.
  - Requires **SUMMARY.md** subsection **Stale diagram reconciliation** when the stale pass runs (list reviewed/updated files or explicit "no edits").
  - Non-blocking **HANDOFF.log** JSON line with event name including `stale_diagram` for observability.
  - Include the literal phrase **stale diagram** in normative prose for ROADMAP verification grep.

## Context Required
```yaml
files_to_read:
  - "workflows/autonomous.md"
  - ".viepilot/phases/11-diagram-profile-system/SPEC.md"
  - ".viepilot/ARCHITECTURE.md"
```

## Acceptance Criteria
- [x] `grep -n 'stale diagram' workflows/autonomous.md` matches within **## 5. Phase Complete** (phase boundary wording)
- [x] Touch detection uses phase-scoped diff from `${TAG_PREFIX}-p{phase}-t1` to `HEAD`
- [x] Explicit rule: reconciliation runs **at phase complete only**, not after each task
- [x] SUMMARY.md requirement documented when architecture footprint touched

## Best Practices to Apply
- [x] English normative prose consistent with autonomous.md list numbering
- [x] Cross-reference ENH-018 matrix tiers (`required` / `optional` / `N/A`)
- [x] No new executable scripts — workflow instructions only

## Do / Don't
### Do
- Keep working directory guard and existing phase-complete ordering intact

### Don't
- Don't bump package version (task 11.5)

## Verification
```yaml
automated:
  - command: "grep -n 'stale diagram' /Users/sonicq12/DEV_PROJECTS/viepilot/workflows/autonomous.md"
    expected: "match"
  - command: "grep -n 'p{phase}-t1' /Users/sonicq12/DEV_PROJECTS/viepilot/workflows/autonomous.md | head -5"
    expected: "at least one match (existing + new step references same pattern)"
```

## State Update Checklist
- [x] Update `PHASE-STATE.md` after PASS
- [x] Update `TRACKER.md`
- [x] Update `HANDOFF.json`
- [x] Update `CHANGELOG.md` [Unreleased] if user-visible workflow change

## Implementation Notes

- Inserted **step 2a** under **## 5. Phase Complete** in `workflows/autonomous.md`: phase-scoped `git diff` touch prefixes, skip if no architecture footprint, ENH-018 reconciliation + **Stale diagram reconciliation** in `SUMMARY.md`, `stale_diagram_phase_complete` log event.
- Documented **stale diagram** wording for ROADMAP grep verification; reconciliation explicitly **not** per task.

## Files Changed

```
A	.viepilot/HANDOFF.json
M	.viepilot/TRACKER.md
M	.viepilot/phases/11-diagram-profile-system/PHASE-STATE.md
A	.viepilot/phases/11-diagram-profile-system/tasks/task-11.4-autonomous-stale-diagram-detection.md
M	CHANGELOG.md
M	workflows/autonomous.md
```
