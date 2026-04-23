# FEAT: `vp-info` + `vp-update` — thông tin phiên bản & cập nhật ViePilot

## Meta
- **ID**: FEAT-008
- **Type**: Feature
- **Status**: done
- **Priority**: high
- **Created**: 2026-04-01
- **Reporter**: User
- **Assignee**: AI

## Summary
Bổ sung **skill / lệnh** để người dùng và AI nắm rõ trạng thái cài đặt ViePilot và **nâng cấp có kiểm soát** lên bản mới nhất từ registry.

## Details

### Part A — `vp-info` (hiển thị thông tin)
Mục tiêu: một nơi tra cứu, định dạng ổn định (CLI và/hoặc skill Cursor).

**Nên hiển thị (tối thiểu):**
1. **ViePilot runtime** — phiên bản package đang chạy (global `npx` / local `node_modules` / repo dev), commit hash nếu clone git (optional).
2. **Phiên bản mới nhất trên npm** — `npm view viepilot version` (hoặc tương đương không tương tác); ghi rõ khi không có mạng / lỗi registry.
3. **Skills** — mỗi skill trong bundle cài đặt: tên + **version** (từ metadata trong `SKILL.md` hoặc quy ước semver trong skill; nếu chưa có field version thì phase implement phải chuẩn hóa hoặc đọc heuristic).
4. **Workflows** — version hoặc “last updated” nếu có metadata; nếu không có version riêng, in **danh sách workflow + đường dẫn** và ghi chú “no semver in file” để tránh bịa số.

**Gợi ý implementation (không ràng buộc):**
- Mở rộng `bin/vp-tools.cjs` với subcommand `info` (machine-readable `--json` optional) **và/hoặc** skill `skills/vp-info/SKILL.md` hướng dẫn AI chạy command đó.
- Document trong `docs/skills-reference.md` và quick-start.

### Part B — `vp-update` (cập nhật lên bản mới)
Mục tiêu: **một entrypoint rõ ràng** gọi flow cập nhật ViePilot (tương đương “pull latest skills/workflows/templates” theo cách project distribute — npm package và/hoặc git).

**Yêu cầu hành vi:**
- Kiểm tra bản hiện tại vs latest; nếu đã mới nhất → thoát 0 + message.
- Cập nhật an toàn: dry-run / confirm (hoặc `--yes` cho CI); không ghi đè file user project ngoài phạm vi ViePilot đã định nghĩa (installer contract).
- Skill `skills/vp-update/SKILL.md` (hoặc tên đồng bộ) mô tả khi nào gọi, flags, và rollback guidance (re-install / git).

**Phụ thuộc:** FEAT-003/004/005 (NPX install path) — update phải khớp cách user đã cài (global npm, copy-first, v.v.).

## Acceptance Criteria
- [x] Có cách gọi **vp-info** (CLI và/hoặc skill) in được: current ViePilot version, latest npm version (khi có), danh sách skills + version (hoặc documented fallback), workflows listing/version policy.
- [x] Có **vp-update** (CLI và/hoặc skill) thực hiện upgrade path chính thức với confirm/`--yes` và không phá vỡ installer semantics đã ship.
- [x] Tests tối thiểu cho parser/version compare (mock npm optional).
- [x] `CHANGELOG.md` + `docs/skills-reference.md` (và README commands nếu có bảng).

## Related
- **Phase**: M1.23 / Phase 27 — `.viepilot/phases/27-vp-info-vp-update/` (tasks 27.1–27.5).
- **Files (dự kiến)**: `bin/vp-tools.cjs` hoặc `bin/viepilot.cjs`, `skills/vp-info/SKILL.md`, `skills/vp-update/SKILL.md`, `package.json` bin nếu cần, `docs/*`, tests dưới `tests/`.
- **Dependencies**: npm registry availability; optional alignment với workflow `gsd-update` pattern (không copy code nếu license khác — chỉ học UX).

## Discussion
- User mô tả: “tính năng thứ 2” = bộ đôi info + update; ưu tiên DX và minh bạch version cho AI agents.

## Resolution
- **2026-04-01 — Shipped `viepilot@1.6.0` (M1.23 / Phase 27).** CLI: `vp-tools info` / `info --json`, `vp-tools update` (`--dry-run`, `--yes`, `--global`); `lib/viepilot-info.cjs`, `lib/viepilot-update.cjs`; skills `vp-info`, `vp-update`; docs (`skills-reference`, `cli-reference`, `quick-start`, README); Jest `viepilot-info.test.js`, `viepilot-update.test.js`. Tags: `v1.6.0`, `viepilot-vp-p27-complete`.
