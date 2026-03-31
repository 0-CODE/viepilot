# FEAT: Installer UX upgrade + uninstall command + fix symlink install issue

## Meta
- **ID**: FEAT-005
- **Type**: Feature
- **Status**: done
- **Priority**: high
- **Created**: 2026-03-31
- **Reporter**: User
- **Assignee**: AI

## Summary
Cải thiện installer interactive theo hướng hiện đại (arrow-key + space multi-select/radio), sửa lỗi cài đặt bằng symlink khiến skills không được nhận, và bổ sung `npx viepilot uninstall` để gỡ cài đặt.

## Details

### Problem
- Installer interactive hiện tại dùng nhập số, UX cũ và khó thao tác cho nhiều lựa chọn.
- Cơ chế symlink hiện có thể dẫn đến trạng thái cài đặt không nhận skills đúng trong môi trường thực tế.
- Chưa có command uninstall chuẩn qua `npx viepilot` để rollback cài đặt nhanh.

### Desired behavior
1. Interactive selector hỗ trợ:
   - phím mũi tên để điều hướng
   - phím space để tick chọn (multi-select)
   - radio-style cho các lựa chọn single-select
2. Luồng install không phụ thuộc symlink theo cách gây fail skill discovery.
3. Có command:
   - `npx viepilot uninstall`
   - hỗ trợ xác nhận, `--yes`, và hiển thị summary những gì đã gỡ.
4. Có verify sau cài/gỡ để xác nhận skills/workflows đã được nhận đúng.

## Acceptance Criteria
- [ ] Installer interactive có UX arrow/space select (multi + radio mode).
- [ ] Lỗi symlink causing missing skills được fix và có regression check.
- [ ] `npx viepilot uninstall` hoạt động ổn định.
- [ ] Có docs hướng dẫn install/uninstall mới.
- [ ] Có test cho selector behavior và uninstall flow.

## Related
- Phase: `19-installer-ux-and-uninstall`
- Expected files:
  - `bin/viepilot.cjs`
  - `install.sh`, `dev-install.sh` (nếu cần)
  - `tests/unit/guided-installer.test.js` (mở rộng)
  - `docs/user/quick-start.md`, `docs/troubleshooting.md`
- Dependencies:
  - FEAT-003 (guided installer) ✅ done

## Discussion
Request này gộp cả UX enhancement và reliability fix cho installer/runtime setup, kèm lifecycle đầy đủ install/uninstall để giảm friction khi thử nghiệm nhiều môi trường.

## Resolution
Implemented in Phase 19 with complete scope:
- keyboard-based interactive selector (arrow/space/enter)
- symlink reliability fix by switching dev install to copy-first mode
- `npx viepilot uninstall` command with `--yes` and summary
- test + documentation updates
