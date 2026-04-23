# FEAT: Auto-sync README metrics + donation section in workflows

## Meta
- **ID**: FEAT-006
- **Type**: Feature
- **Status**: done
- **Priority**: high
- **Created**: 2026-03-31
- **Reporter**: User
- **Assignee**: AI

## Summary
Tự động cập nhật README khi chạy workflow (đặc biệt `vp-auto`) bằng `cloc` để refresh Code LOC/Project Scale, đồng thời bổ sung mục donate nhỏ gọn với PayPal và MOMO.

## Details

### Problem
- README dễ bị stale khi codebase tăng/giảm LOC theo thời gian.
- Hiện chưa có cơ chế workflow-level để tự cập nhật metric định kỳ.
- Chưa có phần donate trong README cho người dùng muốn ủng hộ dự án.

### Desired behavior
1. Workflow (ưu tiên `vp-auto`, có thể mở rộng cho `vp-docs`) tự cập nhật metric README dựa trên `cloc`.
2. Nếu chưa có `cloc`, workflow có fallback rõ ràng (hướng dẫn cài hoặc skip có log).
3. README có section donate ngắn gọn:
   - PayPal: `https://paypal.me/SATCODING`
   - MOMO: `https://me.momo.vn/aMINujUPTbIRtbTli6Fd`
4. Có test/verify để tránh drift metric.

## Acceptance Criteria
- [ ] `vp-auto` (hoặc workflow được chọn) cập nhật được LOC trong README bằng `cloc`.
- [ ] Có fallback/guard khi thiếu `cloc`.
- [ ] README có section donate với 2 link PayPal/MOMO.
- [ ] Có verify steps hoặc test cho README metric sync.

## Related
- Phase: `20-readme-sync-and-donate`
- Expected files:
  - `workflows/autonomous.md`
  - `skills/vp-auto/SKILL.md` (nếu cần bổ sung guardrail)
  - `README.md`
  - `docs/*` liên quan docs sync
  - scripts hỗ trợ metric (nếu cần)

## Resolution
Implemented in Phase 20:
- README LOC sync script + npm command (`readme:sync`) with safe fallback when `cloc` is missing
- workflow/skill guidance updates for milestone auto-sync behavior
- installer `cloc` check with guidance/optional best-effort install
- donate section added to README with PayPal/MOMO links
