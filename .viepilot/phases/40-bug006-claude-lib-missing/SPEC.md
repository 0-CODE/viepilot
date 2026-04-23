# Phase 40 — SPEC: claude-code install missing lib files (BUG-006)

## Goal
Fix `buildInstallPlan()` để copy đầy đủ tất cả lib files vào `~/.claude/viepilot/lib/` khi target là `claude-code`.

## Root Cause
BUG-005 (Phase 38) chỉ thêm copy step cho `lib/cli-shared.cjs`. Bỏ qua:
- `lib/viepilot-info.cjs` → crash khi chạy `vp-tools info`
- `lib/viepilot-update.cjs` → crash khi chạy `vp-tools update`
- `lib/viepilot-install.cjs` → crash khi chạy install subcommands

## Scope
- `lib/viepilot-install.cjs`: thêm 3 copy_file steps sau block cli-shared.cjs (line ~190-194)
- `tests/unit/viepilot-install.test.js`: thêm tests verify 3 files mới có trong plan

## Tasks

| Task | File | Change |
|------|------|--------|
| 40.1 | `lib/viepilot-install.cjs` | Thêm copy steps cho viepilot-info.cjs, viepilot-update.cjs, viepilot-install.cjs |
| 40.2 | `tests/unit/viepilot-install.test.js` | Tests verify 3 copy steps mới trong plan |

## Version
1.9.9 → **1.9.10** (PATCH)

## Dependencies
- BUG-005 (Phase 38) — đã ship, claudeViepilotDir + cli-shared copy đang hoạt động
- Debug session `.viepilot/debug/session-20260402-claude-lib-missing.json`
