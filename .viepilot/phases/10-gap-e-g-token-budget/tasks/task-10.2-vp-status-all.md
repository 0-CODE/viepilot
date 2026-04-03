# Task 10.2: vp-status skill — `--all` flag aggregate from registry

## Meta
- **Phase**: 10-gap-e-g-token-budget
- **Status**: done
- **Complexity**: M
- **Dependencies**: Task 10.1 (registry template + crystallize auto-register)
- **Git Tag**: `viepilot-vp-p10-t10.2`

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "skills/vp-status/SKILL.md"
recovery_budget: "M"
```

## Objective

Khi `{{VP_ARGS}}` chứa `--all` (hoặc user nói rõ cross-project status): đọc `~/.viepilot/project-registry.json`, với mỗi project **active** hoặc **paused**, đọc `HANDOFF.json` (trước) và `TRACKER.md` tại `path` đã đăng ký, rồi render **một bảng tổng hợp** với icon trạng thái theo quy ước dưới đây.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains what and why
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "skills/vp-status/SKILL.md"
```

## File-Level Plan

- `skills/vp-status/SKILL.md`:
  - **Invocation**: mở rộng phần adapter — nếu `{{VP_ARGS}}` có `--all` thì **không** chạy dashboard single-project; chạy process **Cross-project aggregate** bên dưới.
  - **Bước 1**: Đọc `~/.viepilot/project-registry.json`. Nếu file thiếu hoặc JSON invalid → banner hướng dẫn (chạy `/vp-crystallize` hoặc tạo file từ template) và dừng.
  - **Bước 2**: Lọc `projects[]`: bỏ qua `status: archived`. Với mỗi entry còn lại, resolve `path` tuyệt đối; nếu thư mục không tồn tại → một dòng với icon **○** và ghi chú `path missing`.
  - **Bước 3** (batch theo từng project): Đọc `{path}/{handoff_path}` rồi `{path}/{tracker_path}` (default từ schema template). Parse tối thiểu: `control_point.active`, `position.phase`, `position.task`, `position.status`; từ TRACKER: dòng **Current State** → Phase + Task (regex hoặc bullet lines).
  - **Bước 4**: Gán **một** icon mỗi hàng (ưu tiên cao → thấp):
    1. **⚠** — `control_point.active === true`
    2. **○** — không đọc được file state, hoặc registry `paused`, hoặc path invalid
    3. **●** — phase đang in progress (TRACKER có `(in progress)` / `in progress` / `🔄` trên phase hiện tại, hoặc HANDOFF `position.status` ∈ `executing`, `recovering_*`, `control_point` false nhưng task chưa pass — fallback: có **Task** khác `not_started` và có dấu hiệu đang làm)
    4. **✓** — không control point, không paused, đọc state OK, không match **●** (ví dụ phase complete / idle giữa các phase)
  - **Output**: ASCII table cố định cột: `Icon | Project | Path | Phase / Task | Notes` + footer gợi ý `/vp-status` từng repo.
  - Bump `version` frontmatter skill (minor): 2.0.0 → 2.1.0.
  - Cập nhật `<objective>` / `success_criteria` để gồm nhánh `--all`.

## Acceptance Criteria

- [x] `--all` được document trong skill và tách process rõ khỏi single-project dashboard
- [x] Đọc registry từ `~/.viepilot/project-registry.json`; xử lý missing/invalid JSON
- [x] Mỗi project: đọc HANDOFF trước TRACKER; icon **⚠** khi control point active
- [x] Bảng có ít nhất các cột: icon, name, path, tóm tắt phase/task
- [x] `archived` không hiển thị — **skip archived**

## Verification
```yaml
automated:
  - command: "grep -n '\\\\-\\-all' skills/vp-status/SKILL.md"
    expected: "at least one match"
  - command: "grep -n 'project-registry' skills/vp-status/SKILL.md"
    expected: "match"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md (Next Action + task pointer)
- [x] Update HANDOFF.json
- [x] ROADMAP Progress Summary nếu task hoàn thành

## Post-Completion

### Implementation Summary
- Extended `skills/vp-status/SKILL.md` với mode `--all`: registry → HANDOFF trước TRACKER → bảng icon ● ⚠ ✓ ○; skip `archived`; paused → ○ trừ khi ⚠
- Skill version 2.0.0 → 2.1.0

### Files Changed
| File | Action |
|------|--------|
| `skills/vp-status/SKILL.md` | modified |

## Implementation Notes

- Không tạo `workflows/status.md` (không có trong repo; SPEC optional).
- Chỉ sửa shipping skill trong repo; không ghi `~/.claude` / `~/.cursor` install paths.
