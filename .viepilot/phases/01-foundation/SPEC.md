# Phase 1: Foundation — Templates & State Machine

## Overview
- **Goal**: Refactor tất cả core templates để support v2 metadata fields và kiến trúc mới
- **Dependencies**: None (first phase)
- **Estimated Tasks**: 6

## Objective

Xây dựng nền tảng cho ViePilot v2 bằng cách cập nhật tất cả template files trong `templates/project/` và `templates/phase/`. Sau phase này, tất cả v2 artifacts có thể được generated bởi crystallize.

Phase này là **doc/template only** — không có workflow logic hay execution changes. Tất cả thay đổi là trong `templates/` directory.

## Scope

### In Scope
- `templates/project/TRACKER.md` → index ≤30 dòng + logs/ pointer
- `templates/project/` logs/ directory (3 new templates)
- `templates/phase/PHASE-STATE.md` → execution_state YAML block + sub-task tracking
- `templates/phase/TASK.md` → type, write_scope, recovery_budget, can_parallel_with, recovery_overrides
- `templates/project/AI-GUIDE.md` → static/dynamic boundary + parallel batch instruction
- `templates/project/HANDOFF.json` → v2 schema với tất cả new fields

### Out of Scope
- `workflows/autonomous.md` (Phase 2)
- Skill files (Phase 3)
- crystallize/evolve workflow updates (Phase 3)

## Requirements

### Functional
- TRACKER.md template phải ≤30 dòng khi rendered (không đếm blank lines)
- TASK.md template phải có section `## Task Metadata` với tất cả 5 new fields
- PHASE-STATE.md template phải có `execution_state:` YAML block trước `## Task Status` table
- HANDOFF.json template phải có tất cả top-level keys: version, position, recovery, context, control_point, meta
- recovery_overrides block trong TASK.md phải có L3.block (boolean) + L3.reason (string)

### Non-Functional
- All new template fields optional — backward compat với v1 (vp-auto gracefully skip nếu missing)
- Template placeholder format unchanged: `{{UPPER_SNAKE_CASE}}`
- Existing v1 template sections phải giữ nguyên (chỉ thêm, không xóa)

## Acceptance Criteria
- [ ] All 6 tasks PASS
- [ ] crystallize với v2 templates tạo được project mới (test manually)
- [ ] TRACKER.md rendered ≤30 dòng
- [ ] TASK.md có đủ 5 new fields với correct placeholder values
- [ ] PHASE-STATE.md có execution_state block với typed transitions example
- [ ] HANDOFF.json schema có đủ all keys
- [ ] AI-GUIDE.md có static/dynamic boundary labels + parallel batch instruction

## Technical Notes

### Recovery Budget Table (TASK.md template reference)
| Complexity | L1 | L2 | L3 |
|---|---|---|---|
| S | 1 | 1 | 0 |
| M | 1 | 2 | 0 |
| L | 2 | 2 | 1 |
| XL | 2 | 3 | 1 |

### Compliance Domains (for TASK.md + crystallize context)
Auto-block L3 khi write_scope contains: `/auth/`, `/authorization/`, `/payment/`, `/billing/`, `/migrations/`, `/crypto/`, `/encrypt/`

## References
- Architecture: `.viepilot/ARCHITECTURE.md`
- Context: `.viepilot/PROJECT-CONTEXT.md`
- Rules: `.viepilot/SYSTEM-RULES.md`
- Brainstorm: `docs/brainstorm/session-2026-04-02.md` → Topics 7, 10, 11
