# Quick Start Guide

Bắt đầu với ViePilot trong 5 phút.

## What is ViePilot?

ViePilot là framework giúp bạn phát triển phần mềm với AI một cách **có hệ thống và kiểm soát**. Thay vì chat với AI và copy-paste code, ViePilot tổ chức toàn bộ dự án thành phases, tasks, và checkpoints — với AI thực thi từng bước một.

```
Bạn: Mô tả ý tưởng
  ↓
ViePilot: Tạo roadmap, phases, tasks
  ↓
AI: Tự động code từng task
  ↓
Bạn: Review, approve, hoặc rollback
```

---

## Step 1: Install

```bash
git clone https://github.com/0-CODE/viepilot
cd viepilot
npx viepilot install
```

Chọn profile cài đặt trong wizard (arrow keys + space + enter):
- `claude-code`
- `cursor-agent`
- `cursor-ide`

Hướng dẫn đầy đủ cho **Claude Code** (symlink/copy skills sang `~/.claude/skills`, PATH, kiểm tra CLI): [ViePilot trên Claude Code](claude-code-setup.md).

Non-interactive:
```bash
npx viepilot install --target cursor-agent --yes
```

Uninstall:
```bash
npx viepilot uninstall --target cursor-agent --yes
```

Verify:
```bash
viepilot --list-targets
vp-tools help
# Hiển thị targets + ViePilot CLI Tools
```

Sau khi cài, ViePilot tạo (nếu chưa có) **`~/.viepilot/profiles/`** và file mẫu **`~/.viepilot/profile-map.md`** để đăng ký profile tái sử dụng (brainstorm meta intake — xem `docs/dev/global-profiles.md`).

Optional (maintainers):
```bash
npm run readme:sync
# refresh README Total LOC metrics via cloc
```

### Version check & update

Sau khi có `vp-tools` trên PATH (ví dụ `npm i -g viepilot` hoặc cài qua `npx viepilot install` copy bundle):

```bash
vp-tools info
vp-tools info --json
```

Cập nhật ViePilot qua npm — nên xem trước bằng dry-run; trong script/CI thêm `--yes` khi apply:

```bash
vp-tools update --dry-run
vp-tools update --yes
vp-tools update --global --yes
```

Trong project có dependency `viepilot`, có thể chạy: `node node_modules/viepilot/bin/vp-tools.cjs info`.

---

## Step 2: Create a New Project

```bash
mkdir my-project && cd my-project
git init
```

Mở thư mục trong **Cursor IDE**.

---

## Step 3: Brainstorm

Trong Cursor Chat:

```
/vp-brainstorm Build a REST API for managing tasks
```

ViePilot sẽ hỏi bạn về:
- Tech stack (Node.js? Python? Java?)
- Features cần thiết
- Constraints (deadline, team size, etc.)

Trả lời tự nhiên — không cần format đặc biệt.

Nếu dự án thiên về UI/UX:

```text
/vp-brainstorm --ui
```

Workflow sẽ duy trì direction artifacts tại `.viepilot/ui-direction/{session-id}/`.

---

## Step 4: Crystallize

```
/vp-crystallize
```

ViePilot tạo `.viepilot/` directory với:
- `ROADMAP.md` — Phases và tasks
- `TRACKER.md` — Progress index (≤30 dòng, pointer đến `logs/`)
- `logs/decisions.md`, `logs/blockers.md`, `logs/version-history.md` — On-demand logs
- `ARCHITECTURE.md` — System design
- `SYSTEM-RULES.md` — Coding standards
- `AI-GUIDE.md` — Context load strategy (static/dynamic boundary)
- `HANDOFF.json` — Machine-readable state (auto-managed, đừng sửa tay)
- `HANDOFF.log` — Append-only audit trail; tự xoay vòng cuối mỗi phase → `logs/handoff-phase-N.log` (gitignored)
- `phases/*/tasks/*.md` — Task files với v2 metadata (type, write_scope, recovery_budget)

**Post-MVP không chỉ nằm trong brainstorm:** sau crystallize, horizon phải vào `ROADMAP.md` + vision theo pha trong `PROJECT-CONTEXT.md`. Tóm tắt cho user: [Product horizon end-to-end](features/product-horizon.md).

---

## Step 5: Run Autonomous Mode

```
/vp-auto
```

ViePilot sẽ:
1. Đọc phase đầu tiên (hoặc phase tiếp theo) từ ROADMAP.md / TRACKER
2. Tạo git checkpoint tag
3. Implement từng task
4. Verify acceptance criteria
5. Commit và cập nhật state; lặp task kế hoặc phase kế

**Can thiệp của bạn:** Tại **control points** (lỗi, conflict, bước manual trong task, menu retry/skip). **Không arg** trên `/vp-auto` không có nghĩa bị “khóa” dừng sau mỗi task trong spec — nhưng trong chat một lượt AI thường xử lý một task; muốn chạy tiếp, gọi lại `/vp-auto` hoặc nhắc tiếp. Dùng `/vp-auto --fast` nếu muốn **bỏ qua verify tùy chọn** (ít dừng hơn). Chi tiết: [Autonomous mode](features/autonomous-mode.md).

---

## Step 6: Check Progress

```
/vp-status
```

Hiển thị:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Phase 1: Setup         [██████████] 100% ✅
 Phase 2: Core API      [████░░░░░░]  40% 🔄
 Phase 3: Tests         [░░░░░░░░░░]   0% ⏳

 Overall:               [████░░░░░░]  47%
```

---

## Common Commands

| Command | When to Use |
|---------|-------------|
| `/vp-brainstorm` | Bắt đầu project mới hoặc feature mới |
| `/vp-crystallize` | Sau brainstorm, tạo artifacts |
| `/vp-auto` | Chạy autonomous execution |
| `/vp-status` | Xem progress dashboard |
| `/vp-pause` | Dừng và lưu state |
| `/vp-resume` | Tiếp tục từ lần dừng |
| `/vp-request --feature` | Thêm feature mới |
| `/vp-rollback` | Quay lại checkpoint trước |
| `/vp-debug` | Debug issue có hệ thống |

---

## Skill Scope (BUG-004)

- Theo mặc định, ViePilot chỉ dùng hệ lệnh/skill `vp-*` trong toàn bộ workflow.
- Nếu bạn thấy đề cập skill ngoài framework, hãy coi đó là out-of-scope trừ khi bạn đã explicit opt-in.
- Ví dụ opt-in hợp lệ: "Cho phép dùng thêm external skills ngoài ViePilot trong bước research này."

---

## Next Steps

- [Skills Reference](../skills-reference.md) — Chi tiết tất cả commands
- [Advanced Usage](../advanced-usage.md) — Power user features
- [Troubleshooting](../troubleshooting.md) — Common issues
- [Examples](../../examples/) — 3 example projects
