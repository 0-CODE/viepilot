# Phase 36: vp-auto Step 3 PASS — ROADMAP.md sync (ENH-023)

## Goal
Fix gap trong `workflows/autonomous.md`: Step 3 Handle Result PASS không có instruction cập nhật `ROADMAP.md`. Thêm entry rõ ràng để ROADMAP.md được sync tại task-level (không chỉ phase-complete).

## Request
ENH-023 — debug session `debug-20260402-001`

## Affected Files
- `~/.cursor/viepilot/workflows/autonomous.md` — Step 3 PASS handler block

## Out of Scope
- Thay đổi Step 5a (ROADMAP sync at phase complete) — giữ nguyên
- Thêm tests (scope nhỏ, text-only change)

## Tasks

| Task | Description | Complexity |
|------|-------------|------------|
| 36.1 | Thêm `ROADMAP.md` vào Step 3 PASS handler trong `autonomous.md` | S |

## Verification
- [ ] Step 3 PASS list trong `autonomous.md` có 5 entries (thêm ROADMAP.md)
- [ ] Step 4 `update_state` không bị duplicate/mâu thuẫn
- [ ] Step 5a vẫn còn (phase-complete sync không bị xóa)

## Version Bump
PATCH (1.9.5 → 1.9.6) — workflow text fix, không thay đổi API/behavior
