# CLI Reference — vp-tools

`vp-tools` là CLI utility của ViePilot để quản lý state, progress, và workflow operations.

## Installation

```bash
# Sau khi install ViePilot
vp-tools help
```

---

## Commands

### `init`

Kiểm tra project root và load initialization state.

```bash
vp-tools init
```

**Output (JSON)**:
```json
{
  "project_root": "/path/to/project",
  "viepilot_dir": "/path/to/project/.viepilot",
  "tracker_exists": true,
  "roadmap_exists": true,
  "handoff_exists": true,
  "handoff": { ... }
}
```

**Errors**:
- `No ViePilot project found` — Run từ directory chứa `.viepilot/`

---

### `current-timestamp`

Lấy timestamp hiện tại theo format chỉ định.

```bash
vp-tools current-timestamp [format] [--raw]
```

**Parameters**:

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `format` | `iso`, `date`, `full` | `iso` | Timestamp format |
| `--raw` | flag | off | Output raw string (no JSON wrapper) |

**Examples**:
```bash
vp-tools current-timestamp
# {"timestamp":"2026-03-30T14:00:00.000Z"}

vp-tools current-timestamp date
# {"timestamp":"2026-03-30"}

vp-tools current-timestamp full --raw
# 2026-03-30 14:00:00
```

---

### `phase-info <N>`

Lấy thông tin về phase N.

```bash
vp-tools phase-info <phase_number>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phase_number` | positive integer | yes | Phase number (1-based) |

**Output (JSON)**:
```json
{
  "phase_number": 1,
  "phase_dir": "/path/.viepilot/phases/01-name",
  "phase_slug": "01-name",
  "has_spec": true,
  "has_state": true,
  "tasks": [
    { "file": "task-1.md", "path": "..." }
  ],
  "task_count": 3
}
```

**Errors**:
- `Phase N not found` — Phase directory không tồn tại

---

### `task-status <phase> <task> <status>`

Cập nhật status của một task.

```bash
vp-tools task-status <phase> <task> <status>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phase` | positive integer | yes | Phase number |
| `task` | positive integer | yes | Task number |
| `status` | enum | yes | New status |

**Valid statuses**: `not_started`, `in_progress`, `done`, `skipped`, `blocked`

**Output (JSON)**:
```json
{
  "updated": true,
  "phase": 1,
  "task": 2,
  "status": "done",
  "timestamp": "2026-03-30T14:00:00.000Z"
}
```

---

### `commit <message> [--files ...]`

Generate git commit command với standard format.

```bash
vp-tools commit "<message>" [--files <file1> <file2> ...]
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | yes | Commit message (Conventional Commits) |
| `--files` | list | no | Files to include |

**Output (JSON)**:
```json
{
  "command": "git",
  "args": ["commit", "-m", "feat(cli): add validation"],
  "files": ["src/index.js"]
}
```

---

### `progress`

Tính toán và hiển thị overall project progress.

```bash
vp-tools progress
```

**Output**: Visual progress bars + JSON:
```json
{
  "phases": [
    { "name": "01-setup", "tasks": 4, "completed": 4, "progress": 100 }
  ],
  "total_tasks": 17,
  "total_completed": 17,
  "overall": 100
}
```

---

### `version [get|bump] [major|minor|patch]`

Quản lý version của project.

```bash
vp-tools version get
vp-tools version bump [major|minor|patch]
```

**Examples**:
```bash
vp-tools version get
# {"version":"0.8.2"}

vp-tools version bump patch
# {"old_version":"0.8.2","new_version":"0.8.3","bump_type":"patch"}
```

**Bump rules** (SemVer):
- `major` — Breaking changes: `1.0.0 → 2.0.0`
- `minor` — New features: `0.1.0 → 0.2.0`
- `patch` — Bug fixes: `0.1.0 → 0.1.1`

---

### `reset <target> [-f]`

Reset task/phase/all state (destructive — requires confirmation).

```bash
vp-tools reset <target> [--force | -f]
```

**Targets**: `task`, `phase`, `all`

**Warning**: Resets status fields in state files. Does NOT undo git commits.

---

### `clean [-f] [--dry-run]`

Xóa generated files (HANDOFF.json).

```bash
vp-tools clean [--force | -f] [--dry-run]
```

**Flags**:
- `--dry-run` — Preview without deleting
- `--force` / `-f` — Skip confirmation prompt

---

### `checkpoints`

Liệt kê tất cả ViePilot git checkpoint tags.

```bash
vp-tools checkpoints
```

**Output**:
```
ViePilot Checkpoints

  TAG                         COMMIT    DATE
  ─────────────────────────────────────────────────────
  ✅ vp-p3-complete           a1b2c3d   2026-03-30 14:00
  ✔️  vp-p3-t4-done            b2c3d4e   2026-03-30 13:45
  📌 vp-p3-t3                  c3d4e5f   2026-03-30 12:00

  Total: 14 checkpoints
```

---

### `conflicts`

Kiểm tra potential conflicts trong working directory.

```bash
vp-tools conflicts
```

Hiển thị: modified, untracked, deleted, staged files. Resolve trước khi chạy `/vp-auto`.

---

### `save-state`

Lưu current state vào HANDOFF.json cho precise resume.

```bash
vp-tools save-state
```

Updates `HANDOFF.json` với: git HEAD, branch, Node.js version, timestamp.

---

### `help [command]`

Hiển thị help.

```bash
vp-tools help
vp-tools help version
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (validation failure, missing project, etc.) |

---

## JSON Output Convention

Tất cả commands output:
1. Human-readable status line (colored nếu TTY)
2. JSON object trên các dòng tiếp theo

Để parse JSON trong scripts:

```bash
# Extract JSON từ output
OUTPUT=$(vp-tools version get)
VERSION=$(echo "$OUTPUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])")
```

---

## Environment Variables

| Variable | Effect |
|----------|--------|
| `NO_COLOR=1` | Disable ANSI color codes |
| `FORCE_COLOR=0` | Same as NO_COLOR |
