# Task 6.5: Git Tag Prefix — Fix Project Slug Missing (BUG-006)

## Meta
- **Phase**: 06-hotfix-state-updates
- **Status**: not_started
- **Complexity**: M
- **Dependencies**: Tasks 6.1, 6.2, 6.3 (touches same files — run after them)
- **Git Tag**: viepilot-vp-p6-t6.5

## Task Metadata

```yaml
type: "fix"
complexity: "M"
write_scope:
  - "workflows/crystallize.md"
  - "workflows/evolve.md"
  - "workflows/autonomous.md"
  - "templates/phase/TASK.md"
recovery_budget: "M"
can_parallel_with: []
recovery_overrides:
  L1:
    block: false
  L2:
    block: false
  L3:
    block: false
    reason: ""
```

## Objective

Fix BUG-006: git tags được tạo thiếu project prefix (`vp-p{N}-t{N}` thay vì `{slug}-vp-p{N}-t{N}`). Khi chạy nhiều dự án song song, tags không có prefix gây collision. `vp-tools tag-prefix --raw` đã tồn tại và trả về đúng giá trị — vấn đề là workflow không nhất quán dùng nó.

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Paths filled với real paths
- [ ] File-Level Plan explains what/why per file
- [ ] PHASE-STATE.md marks 6.5 `in_progress` before first commit

## Paths

```yaml
files_to_modify:
  - "workflows/crystallize.md"    # thêm TAG_PREFIX resolution khi gen task files
  - "workflows/evolve.md"         # thêm TAG_PREFIX resolution khi gen task files
  - "workflows/autonomous.md"     # replace prose {projectPrefix} bằng bash TAG_PREFIX
  - "templates/phase/TASK.md"     # clarify Git Tag field là runtime-resolved
```

## File-Level Plan

### `workflows/crystallize.md`
Tìm section tạo task files (Step tạo TASK.md per task). Trước khi populate Git Tag field, thêm:
```
Before writing Git Tag in each task file:
  Resolve: TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
  If vp-tools unavailable: derive from git → basename(git rev-parse --show-toplevel) → slugify → append "-vp"
  Git Tag field value: {TAG_PREFIX}-p{phase}-t{task}    e.g. "smart-track-platform-vp-p13-t13.1"
```

### `workflows/evolve.md`
Tương tự crystallize.md — trong Generate Phase → Create Phase Directory → task file generation, thêm cùng TAG_PREFIX resolution block.

### `workflows/autonomous.md`
Tìm và sửa TẤT CẢ chỗ dùng `{projectPrefix}` trong prose narrative:

**Pattern cần sửa:**
```
Create git tag: `{projectPrefix}-vp-p{phase}-t{task}`
Create git tag: `{projectPrefix}-vp-p{phase}-t{task}-done`
Create git tag: `{projectPrefix}-vp-p{phase}-complete`
Do not create `{projectPrefix}-vp-p{phase}-t{task}`
```

**Thay bằng bash-first pattern:**
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git tag "${TAG_PREFIX}-p{phase}-t{task}"
```

Với prose "Do not create" (doc-first gate), thay bằng:
```
Do not create the task start git tag (resolved at runtime via `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)` → `${TAG_PREFIX}-p{phase}-t{task}`)
```

Verify: bash commands trong rollback và SUMMARY.md section đã đúng (`TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`) — chỉ sửa prose narrative.

### `templates/phase/TASK.md`
Sửa dòng:
```
- **Git Tag**: {projectPrefix}-vp-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}
```
Thành:
```
- **Git Tag**: `{TAG_PREFIX}-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_
```

## Context Required

```yaml
files_to_read:
  - "workflows/crystallize.md"         # tìm task file generation section
  - "workflows/evolve.md"              # tìm task file generation section
  - "workflows/autonomous.md"          # tìm tất cả {projectPrefix} occurrences
  - "templates/phase/TASK.md"          # tìm Git Tag field
  - ".viepilot/requests/BUG-006.md"   # fix scope details
```

## Acceptance Criteria

- [ ] `crystallize.md` có TAG_PREFIX resolution instruction trước khi gen Git Tag field
- [ ] `evolve.md` có TAG_PREFIX resolution instruction trước khi gen Git Tag field
- [ ] `autonomous.md`: `grep -n '{projectPrefix}' workflows/autonomous.md` → 0 kết quả trong prose tag creation instructions (chỉ còn trong bash commands nếu có)
- [ ] `autonomous.md`: tất cả git tag creation dùng `"${TAG_PREFIX}-p{N}-t{N}"` format
- [ ] `templates/phase/TASK.md` Git Tag field có runtime resolution note
- [ ] `BUG-006.md` Status → `done`, Resolution filled

## Best Practices to Apply

- [ ] Grep `{projectPrefix}` trong cả 4 files trước khi edit — không patch blindly
- [ ] Bash commands đã có `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)` → giữ nguyên, chỉ sửa prose
- [ ] Sau khi sửa autonomous.md: grep lại để verify 0 prose `{projectPrefix}` còn sót

## Implementation Notes

```
(AI populates during implement)
```

## Verification

```yaml
automated:
  - command: "grep -n '{projectPrefix}' workflows/autonomous.md | grep -v 'bash\\|TAG_PREFIX\\|#'"
    expected: "0 matches (no unresolved prose prefix)"
  - command: "grep -n 'TAG_PREFIX' workflows/crystallize.md"
    expected: "at least 1 match (resolution instruction added)"
  - command: "grep -n 'TAG_PREFIX' workflows/evolve.md"
    expected: "at least 1 match (resolution instruction added)"
  - command: "grep -n 'runtime' templates/phase/TASK.md"
    expected: "at least 1 match (runtime resolution note)"
  - command: "grep -n 'done' .viepilot/requests/BUG-006.md | head -1"
    expected: "Status: done"
```

## State Update Checklist

- [ ] PHASE-STATE.md task 6.5 → `done`
- [ ] TRACKER.md updated
- [ ] HANDOFF.json updated

## Files Changed

```
(Auto-populated after completion)
```

## Rollback

```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p6-t6.5"..HEAD)
```
