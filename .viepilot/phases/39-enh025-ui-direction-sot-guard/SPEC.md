# Phase 39 — SPEC: ui-direction source of truth guard (ENH-025)

## Goal
Thêm explicit READ-ONLY prohibition vào 3 workflows để ngăn LLM write/modify `.viepilot/ui-direction/` artifacts ngoài phiên `vp-brainstorm`.

**Design principle được enforce:**
> `ui-direction` = frozen design contract sau brainstorm session.
> Muốn thay đổi → mở phiên `/vp-brainstorm` mới (session-id mới).
> Mọi workflow ngoài `brainstorm.md` chỉ được READ.

## Scope
Chỉ edit workflow `.md` files trong `~/.cursor/viepilot/workflows/`. Không có code changes trong `lib/`, `bin/`, `tests/`.

## Tasks

| Task | File | Change |
|------|------|--------|
| 39.1 | `~/.cursor/viepilot/workflows/autonomous.md` | READ-ONLY guard vào ENH-024 block |
| 39.2 | `~/.cursor/viepilot/workflows/crystallize.md` | Source of truth policy note vào `consume_ui_direction` |
| 39.3 | `~/.cursor/viepilot/workflows/request.md` | Guard trong `brainstorm_continuation` redirect sang `/vp-brainstorm` |

## Version
1.9.8 → **1.9.9** (PATCH — workflow guard additions, no API/behavior changes)

## Dependencies
- ENH-024 (Phase 37) — đã ship, ENH-024 block đang tồn tại trong autonomous.md
- Debug session `.viepilot/debug/session-20260402-ui-direction-sot.json`
