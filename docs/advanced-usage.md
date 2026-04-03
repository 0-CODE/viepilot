# ViePilot Advanced Usage Guide

Power user features and patterns for experienced ViePilot users.

---

## 1. Autonomous Mode Flags

### `--from N` — Start from a specific phase

Skip completed phases and jump directly to phase N:

```
/vp-auto --from 3
```

Useful when you've manually completed earlier phases or fixed a blocker.

---

### `--phase N` — Run only one phase

Useful for re-running a specific phase after changes:

```
/vp-auto --phase 2
```

Warning: Dependencies must be satisfied (phases before N must be complete).

---

### `--fast` — Skip optional verifications

Skips manual review prompts and optional checks. Use for rapid iteration:

```
/vp-auto --fast
```

Not recommended for final releases — quality gates are important.

---

### `--dry-run` — Preview without executing

See exactly what would happen without writing any files:

```
/vp-auto --dry-run
```

Output shows: phases to run, tasks in each, verification steps.

---

## 2. Task Configuration (v2)

### `write_scope` — Constrain which files a task may touch

Khai báo trong `tasks/*.md → ## Task Metadata`:

```yaml
write_scope:
  - "src/auth/"
  - "tests/auth/"
```

Sau mỗi task execution, ViePilot chạy:
```bash
git diff --name-only HEAD
```
và so sánh với `write_scope`. Nếu có file ngoài scope → **control point ngay** + `scope_drift` event trong HANDOFF.log.

**Patterns:**
```yaml
# Module cụ thể
write_scope:
  - "src/feature-a/"
  - "tests/feature-a/"

# Config + source cùng lúc
write_scope:
  - "src/api/"
  - "config/api.yaml"
  - "tests/api/"

# Single file
write_scope:
  - "CHANGELOG.md"
```

---

### `recovery_overrides` — Customization per task

Override recovery behavior khi default budget không phù hợp:

```yaml
recovery_overrides:
  L1:
    block: false          # Cho phép lint auto-fix
  L2:
    block: false          # Cho phép targeted test fix
  L3:
    block: true           # Chặn scope reduction
    reason: "auth domain — partial implementation tạo security holes"
```

**Khi nào dùng:**

| Scenario | Override |
|----------|----------|
| Task auth/payment/crypto | `L3.block: true` (auto-set bởi Gap G cho write_scope chứa `/auth/`, `/payment/`, `/crypto/`) |
| Task docs-only (không có test) | `L2.block: true` — không cần test fix loop |
| Task generate code (lint expected messy) | Tăng L1 budget bằng cách đặt complexity lên L/XL |
| Task critical path, không được partial | `L3.block: true, reason: "..."` |

**Gap G auto-detection:** khi `crystallize` hoặc `vp-evolve` tạo task với `write_scope` chứa đường dẫn compliance (`/auth/`, `/payment/`, `/crypto/`, `/data/`, `/privacy/`) — `L3.block: true` tự động được set. Bạn không cần khai báo tay.

---

### Recovery budget tuning

Budget mặc định theo complexity; thay đổi khi complexity thực tế không khớp:

| Complexity | L1 (lint) | L2 (test fix) | L3 (scope) |
|-----------|-----------|---------------|------------|
| S         | 1         | 1             | 0          |
| M         | 1         | 2             | 0          |
| L         | 2         | 2             | 1          |
| XL        | 2         | 3             | 1          |

**Tip:** Task nhỏ nhưng codebase phức tạp → đặt `complexity: M` thay vì `S` để có thêm L2 attempt.

---

### HANDOFF.log — Audit trail

Mỗi event quan trọng được ghi vào `.viepilot/HANDOFF.log` (append-only JSONL):

```jsonl
{"ts":"...","event":"task_start","task":"2.3","phase":"02","complexity":"M"}
{"ts":"...","event":"l1_recovery","task":"2.3","attempt":1,"trigger":"lint_error"}
{"ts":"...","event":"scope_drift","task":"2.3","violations":["src/other/"]}
{"ts":"...","event":"task_pass","task":"2.3","phase":"02"}
```

**Rotation:** Cuối mỗi phase, HANDOFF.log tự xoay → `logs/handoff-phase-N.log`. File gốc được reset. HANDOFF.log gitignored (không commit).

Xem events tích lũy:
```bash
cat .viepilot/HANDOFF.log
# hoặc xem phase archive:
cat .viepilot/logs/handoff-phase-2.log
```

---

## 3. Mid-Project Changes

### Adding a feature (`/vp-request --feature`)

Add a new feature requirement without disrupting the current phase:

```
/vp-request --feature Add export to PDF functionality
```

ViePilot will:
1. Create a new phase (e.g., Phase 3.5) inserted between current phases
2. Add it to ROADMAP.md
3. On next `/vp-auto`, include it in the execution queue

---

### Reporting a bug (`/vp-request --bug`)

```
/vp-request --bug Login form submits but user is not authenticated
```

ViePilot creates a bug phase with investigation and fix tasks.

---

### Evolving to a new milestone (`/vp-evolve`)

When M1 is complete and you want to start M2:

```
/vp-evolve Add real-time collaboration features
```

ViePilot:
1. Archives the current milestone
2. Runs `/vp-brainstorm` for the new feature set
3. Creates M2 phases in ROADMAP.md
4. Updates TRACKER.md

---

## 4. Checkpoint Management

### Listing all checkpoints

```bash
vp-tools checkpoints
```

Output:
```
ViePilot Checkpoints

  TAG                         COMMIT    DATE
  ─────────────────────────────────────────────────────
  ✅ vp-p3-complete           a1b2c3d   2026-03-30 14:00
  ✔️  vp-p3-t4-done            b2c3d4e   2026-03-30 13:45
  ✔️  vp-p3-t3-done            c3d4e5f   2026-03-30 13:20
  📌 vp-p3-t3                  d4e5f6g   2026-03-30 12:00
  ...

  Total: 14 checkpoints
```

---

### Rolling back to a checkpoint

```
/vp-rollback
```

Interactive selection:
```
Select checkpoint to restore:
1. vp-p3-t4-done  (Phase 3 Task 4 complete)
2. vp-p3-t3-done  (Phase 3 Task 3 complete)
3. vp-p3-complete (Phase 3 complete)
```

Rollback uses `git revert` — safe, non-destructive, preserves history.

---

### Saving state manually

Before a risky operation:

```bash
vp-tools save-state
```

This updates `HANDOFF.json` with:
- Current git HEAD
- Branch name
- Node.js version
- Precise timestamp

---

## 5. Debugging Workflows

### Starting a debug session

```
/vp-debug investigate: API returns 500 after adding auth middleware
```

ViePilot creates a structured debug session:

```
.viepilot/debug/
└── DEBUG-001.md
    ├── Problem Statement
    ├── Hypotheses (tracked)
    ├── Attempts (with results)
    └── Resolution (when found)
```

---

### Continuing a debug session

```
/vp-debug continue
```

Loads the last open debug session and continues from where you left off — even across context resets.

---

### Closing a debug session

```
/vp-debug close: Fixed by removing duplicate middleware in app.js
```

Marks the session resolved and logs the fix in CHANGELOG.md.

---

## 6. State Management CLI

### Progress overview

```bash
vp-tools progress
```

Returns JSON with phase completion percentages — useful for scripts.

---

### Version management

```bash
# Get current version
vp-tools version get

# Bump for new features (Phase complete)
vp-tools version bump minor

# Bump for bug fixes only
vp-tools version bump patch

# Major breaking change
vp-tools version bump major
```

---

### Checking for conflicts

Before running `/vp-auto` on a dirty working directory:

```bash
vp-tools conflicts
```

Shows: modified, untracked, deleted, staged files. Resolve before continuing.

---

### Cleaning generated state

Safe reset of HANDOFF.json (not code files):

```bash
# Preview what would be removed
vp-tools clean --dry-run

# With confirmation prompt
vp-tools clean

# Force (no confirmation)
vp-tools clean --force
```

---

## 7. Custom Skill Creation

Create your own ViePilot skill:

```
skills/vp-mycustom/SKILL.md
```

Required structure:

```markdown
---
name: vp-mycustom
description: "What my skill does"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Triggered by: /vp-mycustom

## B. Tool Usage
Use Cursor tools: Shell, Read, Write
</cursor_skill_adapter>

<objective>
What this skill accomplishes.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/mycustom.md
</execution_context>

<success_criteria>
- [ ] Task completed correctly
</success_criteria>
```

Then create `workflows/mycustom.md` with the implementation steps.

---

## 8. CI/CD Integration

### Running ViePilot state checks in CI

```yaml
# .github/workflows/viepilot-check.yml
- name: Check project state
  run: |
    node bin/vp-tools.cjs init
    node bin/vp-tools.cjs conflicts
```

---

### Version gate on PRs

Block merges if version wasn't bumped:

```yaml
- name: Version check
  run: |
    VERSION=$(node bin/vp-tools.cjs version get --raw 2>/dev/null || echo "0.0.0")
    # Set EXPECTED to `.viepilot/TRACKER.md` "Current Version" when pinning a release
    EXPECTED="0.8.2"
    if [ "$VERSION" != "$EXPECTED" ]; then
      echo "Version mismatch: got $VERSION, expected $EXPECTED"
      exit 1
    fi
```

---

## 9. Project cwd vs install path (BUG-007)

Khi phát triển **chính repo ViePilot** hoặc bất kỳ dự án nào có CLI đọc workflow từ `~/.cursor/viepilot/` hoặc `~/.claude/viepilot/`, agent **không** được coi đường đó là nơi ghi mã.

| Vùng | Vai trò |
|------|---------|
| `{project_cwd}` (có `.viepilot/TRACKER.md`) | **Ghi** code, workflow nguồn, docs — đây là git repo bạn đang mở |
| `~/.cursor/viepilot/`, `~/.claude/viepilot/` | **Chỉ đọc** — runtime bundle skills/workflows |

Vi phạm → control point trong `/vp-auto`. Helper có thể tái sử dụng: `lib/project-write-guard.cjs` (`validateWriteTarget`).

`templates/project/AI-GUIDE.md` nhắc install path **READ-ONLY** trong static context để giảm nhầm lẫn.

---

## 10. Brainstorm artifact manifest (Phase 9)

- **File:** `.viepilot/brainstorm-manifest.json` (theo schema mẫu `templates/project/brainstorm-manifest.json`).
- **Khi nào cập nhật:** lưu session brainstorm (`/save`, `/end`, …) theo `workflows/brainstorm.md`.
- **Crystallize Step 0A:** đọc manifest trước các bước khác; sau khi load hợp lệ → đánh dấu `consumed` + timestamp.
- **ENH-030:** các artifact type `domain_entities`, `tech_stack` (và tùy chọn `compliance_domains`) được khai báo **required** trong schema template — giúp crystallize không bỏ sót entity/stack khi sinh roadmap.

Xem thêm: [Product horizon](user/features/product-horizon.md), [Quick Start — Step 3](user/quick-start.md).

---

## 11. Diagram profiles & architecture folders (Phase 11)

**Crystallize** chọn **diagram profile** từ tín hiệu stack (microservices, messaging, SQL, SPA, auth, state-heavy entities, …), ghi **Diagram Applicability Matrix** vào `.viepilot/SPEC.md`, và tạo cây `architecture/{cross,backend,frontend,sequences,state-machines}/` với stub README khi diagram áp dụng được.

**`/vp-auto`:** ở ranh giới **phase complete**, nếu diff phase chạm `architecture/`, `.viepilot/architecture/`, hoặc `.viepilot/ARCHITECTURE.md`, chạy **một lần** bước đối chiếu diagram/stale reconciliation (không lặp theo từng task).

Normative: `workflows/crystallize.md` (Step 1D, Step 4), `workflows/autonomous.md` (phase complete).

---

## 12. Multi-Project Usage

Use ViePilot across multiple projects simultaneously:

```bash
# Project A
cd ~/project-a
/vp-status   # shows project A state

# Project B (completely independent state)
cd ~/project-b
/vp-status   # shows project B state
```

Each project has its own `.viepilot/` directory — fully isolated.

---

## Context Loading Strategy

For long sessions or large codebases, follow AI-GUIDE.md's minimal context strategy:

```
Minimal (quick tasks):
  AI-GUIDE.md + TRACKER.md + specific file

Standard (coding tasks):
  Above + ROADMAP.md + SYSTEM-RULES.md

Full (architecture decisions):
  Above + ARCHITECTURE.md + PROJECT-CONTEXT.md
```

Never load the entire codebase — be selective.
