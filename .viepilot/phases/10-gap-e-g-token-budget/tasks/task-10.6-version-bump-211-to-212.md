# Task 10.6: Version bump 2.1.1 → 2.1.2 + CHANGELOG (Phase 10 complete)

## Meta
- **Phase**: 10-gap-e-g-token-budget
- **Status**: done
- **Complexity**: S
- **Dependencies**: Task 10.5
- **Git Tag**: `viepilot-vp-p10-t10.6-done` / `viepilot-vp-p10-complete`

## Task Metadata

```yaml
type: "build"
complexity: "S"
write_scope:
  - "package.json"
  - "package-lock.json"
  - "CHANGELOG.md"
  - "README.md"
recovery_budget: "S"
```

## Objective

Đóng Phase 10: `package.json` → **2.1.2**; `CHANGELOG.md` thêm **[2.1.2]** gom nội dung Phase 10 từ `[Unreleased]`; đồng bộ `package-lock.json` (root); cập nhật badge phiên bản trong `README.md` nếu lệch.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan
- [x] PHASE-STATE.md task 10.6 `in_progress` before first shipping commit

## Paths

- `package.json` — `"version": "2.1.2"`
- `package-lock.json` — root `packages[""].version` (qua `npm version 2.1.2 --no-git-tag-version`)
- `CHANGELOG.md` — section `[2.1.2]`; `[Unreleased]` chỉ còn Planned / hạng mục chưa ship
- `README.md` — shield `version-2.1.2`

## File-Level Plan

- Chạy `npm version 2.1.2 --no-git-tag-version` để khóa lockfile root version.
- CHANGELOG: di chuyển mục Added/Changed hiện trong Unreleased (Phase 10 + policy `.viepilot` gitignore) vào `[2.1.2] - 2026-04-03`; xóa dòng Planned “task 10.6”.
- Git tags: `viepilot-vp-p10-t10.6` (commit cha trước bump), `viepilot-vp-p10-t10.6-done`, `viepilot-vp-p10-complete`.

## Acceptance Criteria

- [x] `node -p "require('./package.json').version"` → `2.1.2`
- [x] `CHANGELOG.md` có `## [2.1.2]` với Phase 10 summarized
- [x] Git pushed + `node bin/vp-tools.cjs git-persistence --strict` PASS

## Verification

```bash
node -p "require('./package.json').version"
grep -n '## \[2.1.2\]' CHANGELOG.md
```

_(Đã chạy: version 2.1.2; section `[2.1.2]` tại dòng ~15.)_

## State Update Checklist

- [x] PHASE-STATE.md — phase complete, task 10.6 done
- [x] TRACKER.md — Phase 11 next
- [x] ROADMAP.md — Phase 10 ✅, Progress Summary
- [x] HANDOFF.json — phase 11 / task 11.1
- [x] SUMMARY.md trong thư mục phase (local)
