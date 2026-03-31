# FEAT: Publish ViePilot package lên npmjs

## Meta
- **ID**: FEAT-004
- **Type**: Feature
- **Status**: in_progress
- **Priority**: high
- **Created**: 2026-03-31
- **Reporter**: User
- **Assignee**: AI

## Summary
Cho phép phát hành chính thức ViePilot lên npmjs để người dùng có thể cài và chạy trực tiếp bằng `npx viepilot install`.

## Details

### Problem
- Hiện tại onboarding chủ yếu theo clone repo.
- Chưa có pipeline publish npm chính thức.
- Chưa có checklist release + verify package sau publish.

### Desired behavior
1. Package `viepilot` được publish thành công lên npmjs.
2. User có thể chạy `npx viepilot install` từ npm registry.
3. Có release checklist rõ ràng: versioning, changelog, dry-run, publish, verify.
4. Có cơ chế phân quyền/token an toàn cho publish (NPM token/CI secret).

### Scope đề xuất
- Chuẩn hoá metadata npm (`name`, `bin`, `files`, `license`, `repository`).
- Bổ sung publish scripts (`prepublishOnly`, `npm pack` verify).
- Thiết lập quy trình publish an toàn (manual hoặc GitHub Actions release workflow).
- Cập nhật docs release cho maintainers.

## Acceptance Criteria
- [ ] `npm publish` hoặc CI release publish thành công package lên npmjs.
- [ ] `npx viepilot install --help` hoạt động từ package đã publish.
- [ ] Có hướng dẫn release/publish trong docs dev.
- [ ] Có verify steps sau publish (version, dist-tag, smoke test).
- [ ] Quy trình dùng token/secret không lộ credentials.

## Related
- Phase: **M1.15 / Phase 18** — `.viepilot/phases/18-npm-publish-distribution/`
- Files (expected):
  - `package.json`
  - `.github/workflows/*` (nếu dùng CI publish)
  - `docs/dev/deployment.md` hoặc docs release tương đương
- Dependencies:
  - FEAT-003 (guided installer) ✅ done

## Discussion
Feature này thiên về release engineering và distribution. Nên tách thành phase riêng để vừa hoàn thiện publish pipeline vừa giảm rủi ro phát hành nhầm.

## Resolution
- 2026-03-31: Triaged and planned into **M1.15 / Phase 18**.
- 2026-03-31: Implemented metadata/publish workflow/docs; pending real npm publish auth to finish registry smoke verification.
