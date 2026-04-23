# FEAT: ViePilot dev environment for Claude Code

## Meta
- **ID**: FEAT-001
- **Type**: Feature
- **Status**: done
- **Priority**: should-have
- **Created**: 2026-04-02
- **Reporter**: User
- **Assignee**: AI

## Summary
Cung cấp cách cài và vận hành môi trường phát triển ViePilot (skills `vp-*`, `vp-tools`, workflows, `.viepilot/` state) khi làm việc trong **Claude Code**, tương đương trải nghiệm đã có trên Cursor.

## Details

### Problem
- Hiện tài liệu và đường dẫn skill (`~/.cursor/skills`, `execution_context` trong skill) được tối ưu cho Cursor.
- Người dùng muốn dùng cùng bộ khung ViePilot trên **Claude Code** mà không mất bước hoặc cấu hình sai.

### Proposed scope
1. **Inventory**: Xác định vị trí skill/rules Claude Code mong đợi (vd. thư mục project vs global).
2. **Install path**: Hướng dẫn hoặc script: `npm i -g viepilot` / clone repo, symlink hoặc copy `skills/` và `workflows/` sang vị trí Claude đọc được.
3. **CLI**: Đảm bảo `vp-tools` / `viepilot` có trên `PATH` hoặc document `node <packageRoot>/bin/vp-tools.cjs`.
4. **Project bootstrap**: Tài liệu khởi tạo `.viepilot/` (TRACKER, requests) trong project dùng Claude Code.
5. **Parity**: So sánh ngắn Cursor vs Claude Code (giới hạn tool, slash commands nếu có).

### Who benefits
- Maintainer và contributor dùng Claude Code.
- Team đa IDE (Cursor + Claude Code).

## Acceptance Criteria
- [ ] Tài liệu “Claude Code setup” trong `docs/` (hoặc mục trong getting-started) với bước tái lập được từ máy sạch.
- [ ] Liệt kê rõ file/thư mục cần có (skills, workflows, optional templates).
- [ ] Ít nhất một đường dẫn verify: chạy `vp-tools info` (global hoặc qua `node`) thành công.
- [ ] Ghi chú giới hạn / khác biệt so với Cursor nếu có.

## Related
- Phase: **34** — `.viepilot/phases/34-claude-code-dev-env-feat001/` (M1.29)
- Files: `docs/getting-started.md`, `docs/user/quick-start.md`, `skills/*/SKILL.md` (paths), `bin/vp-tools.cjs`
- Dependencies: None

## Discussion
- Nguồn skill cho Claude Code có thể là project-local (ưu tiên portable) hoặc global — cần chốt trong phase planning.
- Repo này `.gitignore` có `.viepilot/`; request file chỉ tồn tại local trừ khi điều chỉnh ignore cho tracking backlog trong repo framework.

## Resolution
- Shipped **v1.9.3**: `docs/user/claude-code-setup.md`, cross-links, `tests/unit/vp-feat001-claude-code-docs-contracts.test.js`.
- Acceptance: doc + `npm test` + discoverability từ getting-started / quick-start / faq / docs README.
