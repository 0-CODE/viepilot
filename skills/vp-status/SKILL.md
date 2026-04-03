---
name: vp-status
description: "Hiển thị progress dashboard, control point detection, và recovery stats"
version: 2.1.0
---

<host_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-status`, `/vp-status`, "status", "tiến độ", "đang ở đâu"
- Treat all user text after the skill mention as `{{VP_ARGS}}`
- Nếu `{{VP_ARGS}}` chứa token `--all` → **chỉ** chạy [Cross-project aggregate (`--all`)](#cross-project-aggregate-all); bỏ qua dashboard single-project bên dưới (trừ khi user yêu cầu cả hai — ưu tiên `--all` trước, rồi có thể hỏi có cần dashboard cwd không)

## B. Tool Usage
Use the host's native tools for terminal/shell, file reads, glob/`rg`, patch/edit, web fetch/search, and delegation when available.
</host_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **Read-only / dashboard** — không implement shipping; **`/vp-evolve`** → **`/vp-auto`**. Xem `workflows/request.md`.
</implementation_routing_guard>


<objective>
Hiển thị visual progress dashboard với actionable insights.
Detects control point state và recovery activity từ HANDOFF.json.

**Reads (batch in 1 turn):**
- `.viepilot/HANDOFF.json` — control_point + recovery stats (always first)
- `.viepilot/TRACKER.md`
- `.viepilot/ROADMAP.md`

**Conditional:**
- `.viepilot/phases/{current_phase}/PHASE-STATE.md` (when phase in progress)

**`--all` mode reads (cross-project):**
- `~/.viepilot/project-registry.json` — danh sách project
- Per project: `{path}/{handoff_path}` **trước**, rồi `{path}/{tracker_path}` (default `.viepilot/HANDOFF.json`, `.viepilot/TRACKER.md` nếu entry thiếu field)

**Output:** Control point banner (if active) + dashboard display + next action suggestions **hoặc** bảng tổng hợp `--all`.
</objective>

<process>

### Cross-project aggregate (`--all`)

**Khi:** `{{VP_ARGS}}` có flag `--all` (từ khóa tách biệt, ví dụ `/vp-status --all`).

#### A. Registry
1. Đọc `~/.viepilot/project-registry.json` (expand `~` = user home).
2. Nếu file không tồn tại hoặc JSON không parse được → hiển thị khung hướng dẫn: tạo file từ template `templates/project/project-registry.json` hoặc chạy `/vp-crystallize` để auto-register; **STOP** (không giả định cwd hiện tại).
3. Lấy mảng `projects` (mặc định `[]` nếu thiếu).

#### B. Lọc entry
- Bỏ qua mọi project có `status: "archived"`.
- `status: "paused"` vẫn liệt kê; icon **○** trừ khi có control point (**⚠**).

#### C. Đọc state từng project (batch Read song song trong một turn khi có thể)
Với mỗi entry còn lại, dùng:
- `handoff_path` → mặc định `.viepilot/HANDOFF.json`
- `tracker_path` → mặc định `.viepilot/TRACKER.md`
- `path` → thư mục gốc project (absolute)

Nếu `path` không tồn tại hoặc không phải thư mục → một dòng bảng với icon **○**, cột Notes: `path missing`.

Ngược lại:
1. Đọc HANDOFF **trước** TRACKER (cùng rule single-project).
2. Parse tối thiểu HANDOFF: `control_point.active`, `position.phase`, `position.task`, `position.status`, `recovery.l1_attempts` / `l2_attempts` / `l3_attempts`.
3. Parse TRACKER: section `## Current State` — các dòng `**Phase**`, `**Task**`, `**Milestone**` (regex/bullet như single-project).

#### D. Icon mỗi hàng (ưu tiên cao → thấp; chỉ một icon)
| Icon | Điều kiện |
|------|-----------|
| **⚠** | `control_point.active === true` |
| **○** | Registry `paused`, hoặc không đọc được HANDOFF/TRACKER, hoặc JSON project invalid, hoặc `path missing` |
| **●** | Đang có công việc phase/task: `position.status` ∈ `in_progress`, `executing`, `recovering_l1`, `recovering_l2`, `recovering_l3` **hoặc** bảng **Progress** trong TRACKER có dòng phase hiện tại chứa `in progress` / `🔄` (khớp slug/num từ `**Phase**` trong Current State nếu parse được). Recovery > 0: ghi thêm Notes `L1×n` / `L2×n` / `L3×n` nếu cần |
| **✓** | Mặc định: không ⚠/○/● — ví dụ idle sạch, giữa các phase, hoặc milestone ổn định |

Ghi chú Notes ngắn: ví dụ `control point`, `paused`, `L2×2` nếu `l2_attempts > 0`, hoặc `—`.

#### E. Bảng output (markdown / monospace)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► STATUS — ALL PROJECTS (registry)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Icon | Project | Path | Phase / Task | Notes
──────┼─────────┼──────┼──────────────┼──────
  ●   | …       | …    | …            | …

 Chi tiết từng repo: `cd <path>` rồi `/vp-status`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### F. Footer thống kê
- Đếm số hàng theo từng icon; nếu có **⚠** → gợi ý mở project đó và chạy `/vp-auto`.

---

### Single-project dashboard (default)

### Step 1: Load State (batch — call all Read tools simultaneously)
```bash
cat .viepilot/HANDOFF.json    # FIRST — control point check
cat .viepilot/TRACKER.md
cat .viepilot/ROADMAP.md
```

### Step 1b: Control Point Detection

**Check HANDOFF.json.control_point.active BEFORE rendering dashboard.**

If `control_point.active == true`, display prominently:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚠ CONTROL POINT ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: {position.task}
 Reason: {control_point.reason}
 Since: {control_point.ts}

 Run /vp-auto to resolve
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If `control_point.active == false` (or absent): skip banner, continue to dashboard.

### Step 1c: Recovery Stats (from HANDOFF.json.recovery.*)

Only show when any attempt count > 0 (don't clutter clean runs):
```
Recovery Activity:
  L1 (lint/format):  {l1_attempts} attempts
  L2 (test fix):     {l2_attempts} attempts
  L3 (scope reduce): {l3_attempts} attempts
```
Display this section just below CURRENT STATE in dashboard.

### Step 2: Calculate Progress
For each phase:
- Count total tasks
- Count completed tasks
- Calculate percentage

Overall:
- Total phases
- Completed phases
- Overall percentage

### Step 3: Display Dashboard
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Version: {current_version}
 Milestone: {milestone_name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Phase 1: Project Setup       [██████████] 100% ✅
 Phase 2: Database Foundation [████████░░]  80% 🔄
 Phase 3: TAP Service Core    [░░░░░░░░░░]   0% ⏳
 Phase 4: Location Service    [░░░░░░░░░░]   0% ⏳
 Phase 5: API Gateway         [░░░░░░░░░░]   0% ⏳

 ─────────────────────────────────────────────────────────────────
 Overall Progress:            [████░░░░░░]  36%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Current Phase: 02 - Database Foundation
 Current Task:  4/5 - Create TimescaleDB hypertables
 Task Status:   In Progress

 Last Activity: 2 hours ago
 Last Commit:   feat(db): create vehicle/device tables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 QUALITY METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Tests:     45 pass, 2 fail ⚠️
 Coverage:  72%
 Lint:      0 errors, 3 warnings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DECISIONS & BLOCKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Decisions Made: 24 total, 21 locked, 3 pending
 Blockers: 0 active

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Recommended: Fix 2 failing tests, then continue task 4

 Quick Actions:
 1. Continue current task    → /vp-auto --from 2
 2. View failing tests       → (show test output)
 3. View current task        → (show task file)
 4. Pause work              → /vp-pause

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Offer Quick Actions
Based on state, offer relevant actions:

If tests failing:
- "Fix failing tests"
- "View test output"

If task in progress:
- "Continue task"
- "View task details"

If phase complete:
- "Start next phase"
- "Review phase summary"

If blockers:
- "View blockers"
- "Skip blocked task"
</process>

<success_criteria>
- [ ] `--all` → đọc registry trước; missing/invalid → hướng dẫn + STOP; không dùng cwd thay registry
- [ ] `--all` → mỗi project: HANDOFF trước TRACKER; `archived` bị loại; bảng có icon ● ⚠ ✓ ○ theo quy ước
- [ ] HANDOFF.json read first (before dashboard render) — single-project mode
- [ ] control_point.active == true → banner displayed prominently, before all other output
- [ ] control_point.active == false → no banner (no clutter)
- [ ] Recovery stats shown when any l1/l2/l3_attempts > 0
- [ ] Recovery stats NOT shown on clean runs (all counts = 0)
- [ ] All progress calculated correctly
- [ ] Visual dashboard displayed
- [ ] Current state clearly shown
- [ ] Actionable next steps suggested
</success_criteria>
