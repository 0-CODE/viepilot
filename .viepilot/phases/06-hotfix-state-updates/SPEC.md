# Phase 06: Hotfix — State Update Enforcement (BUG-005)

## Goal

Fix BUG-005 + BUG-006: `vp-auto` thực thi tasks nhưng không cập nhật đầy đủ các state files sau mỗi task PASS. Sau fix, mọi task PASS phải để lại dấu vết rõ ràng trong: task file Meta, checklist boxes, Files Changed tables, PHASE-STATE.md execution_state, và HANDOFF.json.

## Root Cause (từ BUG-005)

`autonomous.md` mô tả state updates bằng prose — AI ưu tiên implementation code và bỏ qua "housekeeping" edits. Không có enforcement mechanism. Thêm vào đó, một số instructions trong autonomous.md reference HANDOFF.json schema fields không tồn tại trong v2 template thực tế.

## Scope

| File | Change |
|------|--------|
| `workflows/autonomous.md` | Thêm explicit State Update Checklist block (G1–G4, G6) + fix HANDOFF.json schema refs (G5) + replace prose `{projectPrefix}` bằng bash TAG_PREFIX |
| `workflows/crystallize.md` | Thêm TAG_PREFIX resolution khi gen task files (BUG-006) |
| `workflows/evolve.md` | Thêm TAG_PREFIX resolution khi gen task files (BUG-006) |
| `templates/phase/TASK.md` | Thêm `## Post-Completion` section + clarify Git Tag runtime resolution |
| `package.json` + `CHANGELOG.md` | Version bump 2.0.1 → 2.0.2 |

## Out of Scope

- Backfilling state updates cho user projects đang chạy (smart-track-platform) — separate manual action
- vp-tools state-sync command — deferred to Post-MVP (complexity/effort ratio không justify hotfix timeline)
- Changes to HANDOFF.json template schema — template đã đúng; fix chỉ ở workflow instructions

## Tasks

| # | Task | Complexity | Files |
|---|------|------------|-------|
| 6.1 | autonomous.md — State Update Checklist block | M | `workflows/autonomous.md` |
| 6.2 | autonomous.md — HANDOFF.json schema refs fix | S | `workflows/autonomous.md` |
| 6.3 | TASK.md template — Post-Completion section | S | `templates/phase/TASK.md` |
| 6.5 | Git tag prefix fix (BUG-006) | M | `workflows/crystallize.md`, `workflows/evolve.md`, `workflows/autonomous.md`, `templates/phase/TASK.md` |
| 6.4 | Version bump 2.0.1 → 2.0.2 + CHANGELOG | S | `package.json`, `CHANGELOG.md`, `TRACKER.md` |

**Execution order**: 6.1 → 6.2 → 6.3 → 6.5 → 6.4

## Acceptance Criteria (phase-level)

- [ ] `autonomous.md` có explicit State Update Checklist block sau "Handle Result → PASS"
- [ ] Block liệt kê từng edit cụ thể: task file Meta.Status, checkbox ticks, Files Changed, PHASE-STATE.md execution_state
- [ ] `autonomous.md` HANDOFF.json update instructions reference đúng v2 nested fields (`position.task`, `position.status`, `meta.last_written`, v.v.)
- [ ] `templates/phase/TASK.md` có `## Post-Completion` section với AI-fill placeholders
- [ ] version 2.0.2 reflected trong package.json + CHANGELOG + TRACKER

## Dependencies

- Phase 05 complete ✓
- BUG-005 triaged ✓ (`.viepilot/requests/BUG-005.md`)
- BUG-006 triaged ✓ (`.viepilot/requests/BUG-006.md`)
