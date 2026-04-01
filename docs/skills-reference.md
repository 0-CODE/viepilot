# Skills Reference

Complete reference for all ViePilot skills.

## ViePilot Scope Policy

- **Default behavior**: ViePilot workflows and responses only use skills under `vp-*`.
- **Out-of-scope by default**: skills outside the ViePilot namespace are ignored, even if present in the runtime environment.
- **Explicit opt-in**: external skills are considered only when the user explicitly asks to expand beyond ViePilot scope.
- **Routing fallback**: if an external skill is mentioned accidentally, prefer the closest built-in `vp-*` command instead.

---

## /vp-brainstorm

**Purpose**: Thu thập ý tưởng, requirements, quyết định cho dự án

### Flags
| Flag | Description |
|------|-------------|
| `--new` | Force tạo session mới |
| `--continue` | Tiếp tục session gần nhất |
| `--list` | Liệt kê các sessions |

### In-Session Commands
| Command | Description |
|---------|-------------|
| `/topic {name}` | Chuyển sang topic mới |
| `/summary` | Xem tóm tắt hiện tại |
| `/save` | Lưu tiến độ |
| `/end` | Kết thúc và lưu |
| `/questions` | Xem open questions |

### Output
- `docs/brainstorm/session-{YYYY-MM-DD}.md`
- **Product horizon:** session file giữ **`## Product horizon`** (MVP / Post-MVP / Future tags, deferred capabilities, hoặc single-release statement) để `/vp-crystallize` không bỏ sót post-MVP — xem `workflows/brainstorm.md`.
- UI Direction (optional): `.viepilot/ui-direction/{session-id}/` — legacy (`index.html`) hoặc multi-page (`pages/*.html` + hub + `## Pages inventory` trong `notes.md`). Chi tiết: [UI Direction](user/features/ui-direction.md).

---

## /vp-crystallize

**Purpose**: Chuyển đổi brainstorm thành executable artifacts

### UI direction intake
- Nếu có `.viepilot/ui-direction/{session-id}/` với `pages/*.html`: đọc `notes.md` (**Pages inventory**), từng file page, và hub `index.html` để architecture UI không bỏ sót màn hình.

### Product horizon (brainstorm → ROADMAP / context)
- Step 1: trích **`## Product horizon`** từ mọi session; **horizon inventory** + cổng single-release / thiếu section — `workflows/crystallize.md`.
- `ROADMAP.md`: luôn có block **Post-MVP / Product horizon** (hoặc ghi rõ single-release); `PROJECT-CONTEXT.md`: khối **`<product_vision>`** từ `templates/project/PROJECT-CONTEXT.md`.
- Hướng dẫn user tổng quan: [product-horizon.md](user/features/product-horizon.md). Thứ tự load cho AI: `templates/project/AI-GUIDE.md` (bản crystallize copy vào `.viepilot/AI-GUIDE.md`).

### Metadata Collection
- Project name, description
- Organization name, website
- Package Base ID
- Maven Group ID, Artifact ID
- Lead developer info
- Repository URL
- License
- Inception year

### Output
```
.viepilot/
├── AI-GUIDE.md
├── PROJECT-META.md
├── ARCHITECTURE.md
├── PROJECT-CONTEXT.md
├── SYSTEM-RULES.md
├── ROADMAP.md
├── TRACKER.md
├── HANDOFF.json
├── schemas/
│   ├── database-schema.sql
│   ├── kafka-topics.yaml
│   └── api-contracts.yaml
└── phases/
    └── {NN}-{phase-slug}/
        ├── SPEC.md
        ├── PHASE-STATE.md
        └── tasks/

CHANGELOG.md
CONTRIBUTING.md
CONTRIBUTORS.md
LICENSE
README.md
```

---

## /vp-auto

**Purpose**: Autonomous execution của phases và tasks

### Flags
| Flag | Description |
|------|-------------|
| `--from N` | Start từ phase N |
| `--phase N` | Chỉ chạy phase N |
| `--fast` | Skip optional verifications (fewer pauses; required checks in task docs remain) |
| `--dry-run` | Plan only, no execution |

### Không có flag thêm / No extra args
Gọi `/vp-auto` đúng nghĩa là không bật các cờ trên — **không** phải rule “mỗi task phải stop” trong workflow. Trong thực tế chat, một turn thường hoàn thành ~một task hoặc dừng tại control point; chạy tiếp bằng lượt sau hoặc nhắc phase/task kế. Xem [Autonomous mode](../user/features/autonomous-mode.md).

### Execution Flow
```
For each phase:
  For each task:
    1. Load context
    2. Create git tag
    3. Execute implementation
    4. Verify results
    5. Enforce git persistence gate (`vp-tools git-persistence --strict`)
    6. Handle outcome (pass/fail)
    7. Update state
  Mark phase complete
```

### Control Points
AI pauses for user input when:
- Conflicts detected
- Quality gate failure
- User decision needed
- Blocker encountered

### Git Tags
- `{project}-vp-p{phase}-t{task}` - Task started
- `{project}-vp-p{phase}-t{task}-done` - Task completed
- `{project}-vp-p{phase}-complete` - Phase completed
- Legacy `vp-p...` tags are still accepted for compatibility

---

## /vp-pause

**Purpose**: Save state để resume sau

### Output
- `.viepilot/HANDOFF.json` - Machine-readable state
- `.viepilot/phases/{phase}/.continue-here.md` - Human-readable context
- Git WIP commit

### State Captured
- Current position (phase, task)
- Work completed
- Work remaining
- Decisions made
- Blockers
- Human actions pending
- Uncommitted files
- Context notes

---

## /vp-resume

**Purpose**: Restore context và continue

### Recovery Sources
1. `HANDOFF.json` (preferred)
2. `TRACKER.md` (fallback)
3. `.continue-here.md` (human context)

### Options Offered
1. Continue from current task
2. Restart current task
3. Skip to next task
4. View task details
5. Run `/vp-status`
6. Start `/vp-auto`

---

## /vp-status

**Purpose**: Display progress dashboard

### Display Includes
- Phase progress bars
- Current state
- Quality metrics
- Decisions & blockers
- Next actions

---

## /vp-evolve

**Purpose**: Nâng cấp hoặc mở rộng dự án

### Modes
| Mode | Description |
|------|-------------|
| Add Feature | Thêm feature vào milestone hiện tại |
| New Milestone | Archive current, start new |
| Refactor | Improve code without features |

### Version Bump
| Mode | Bump |
|------|------|
| Add Feature | MINOR |
| New Milestone | MAJOR/MINOR |
| Refactor | PATCH |

---

## /vp-info

**Purpose**: Xem metadata bundle ViePilot — version đã cài, npm latest, danh sách skills/workflows (FEAT-008).

### CLI
| Invocation | Description |
|------------|-------------|
| `vp-tools info` | Bảng human-readable |
| `vp-tools info --json` | JSON parse được: `packageRoot`, `packageName`, `installedVersion`, `latestNpm`, `gitHead`, `skills[]`, `workflows[]` |
| `node node_modules/viepilot/bin/vp-tools.cjs info` | Từ project có dependency `viepilot` |

### JSON fields (tóm tắt)
- **`skills[]`**: `id`, `version`, `relativePath`
- **`workflows[]`**: `id`, `relativePath`, `semverInFile`, `note`

---

## /vp-docs

**Purpose**: Generate documentation

### Flags
| Flag | Description |
|------|-------------|
| `--all` | Generate all documentation |
| `--api` | API documentation only |
| `--dev` | Developer guide only |
| `--user` | User guide only |
| `--changelog` | Update changelog only |

### Output
```
docs/
├── api/
│   ├── rest-api.md
│   ├── graphql-schema.md
│   ├── kafka-events.md
│   └── websocket-api.md
├── dev/
│   ├── getting-started.md
│   ├── architecture.md
│   ├── contributing.md
│   ├── testing.md
│   └── deployment.md
├── user/
│   ├── quick-start.md
│   └── features/
└── README.md

CHANGELOG.md (updated)
```

---

## /vp-request

**Purpose**: Tạo và quản lý requests (Bug, Feature, Enhancement, Tech Debt, Brainstorm tiếp)

### Flags
| Flag | Description |
|------|-------------|
| `--bug` | Bug report mode |
| `--feature` | Feature request mode |
| `--enhance` | Enhancement mode |
| `--debt` | Technical debt mode |
| `--brainstorm` | Brainstorm continuation |
| `--list` | List pending requests |
| `--quick` | Quick mode (minimal questions) |

### Request Types

| Type | Emoji | Use Case |
|------|-------|----------|
| Bug | 🐛 | Something is broken |
| Feature | ✨ | New functionality |
| Enhancement | 🔧 | Improve existing feature |
| Tech Debt | 🧹 | Code cleanup/refactor |
| Brainstorm | 💡 | Explore new ideas |

### Output
- `.viepilot/requests/{TYPE}-{NUMBER}.md`
- Updated `TRACKER.md` backlog

### Workflow
1. Select request type
2. Gather details (questions vary by type)
3. Create request file
4. Add to backlog
5. Offer routing options (fix now, add to phase, etc.)

---

## /vp-debug

**Purpose**: Systematic debugging với persistent state tracking qua nhiều sessions

### Flags
| Flag | Description |
|------|-------------|
| `--new` | Force tạo debug session mới |
| `--continue` | Tiếp tục session hiện tại |
| `--list` | Liệt kê tất cả sessions |
| `--close [resolved\|unresolved\|wontfix]` | Đóng session với resolution |
| `--id <session_id>` | Làm việc với session cụ thể |

### In-Session Commands
| Command | Description |
|---------|-------------|
| `/hypothesis <desc>` | Thêm hypothesis mới |
| `/test <id>` | Test hypothesis cụ thể |
| `/finding <desc>` | Ghi nhận finding |
| `/confirm <id>` | Mark hypothesis là confirmed |
| `/reject <id>` | Mark hypothesis là rejected |
| `/resolve` | Bắt đầu quá trình resolution |
| `/close` | Đóng session |
| `/status` | Xem trạng thái session hiện tại |

### Session States
- `active` — Đang investigate
- `resolved` — Đã fix xong
- `unresolved` — Tạm dừng chưa fix
- `wontfix` — Quyết định không fix

### Output
- `.viepilot/debug/session-{YYYYMMDD-HHMMSS}.json`
- `.viepilot/debug/CURRENT.json` (con trỏ session active)

---

## /vp-ui-components

**Purpose**: Quản lý thư viện UI components tái sử dụng (global + project-local)

### Flags
| Flag | Description |
|------|-------------|
| `--add` | Add/capture component mới |
| `--list` | Liệt kê components theo category |
| `--sync` | Đồng bộ global ↔ local index |
| `--from-21st` | Ưu tiên ingest từ 21st.dev references |
| `--approve` | Mark component status thành approved |

### Output
- `~/.viepilot/ui-components/{category}/{component-id}/...`
- `.viepilot/ui-components/{category}/{component-id}/...`
- `INDEX.md` cho global + local stores

---

## /vp-rollback

**Purpose**: Rollback về bất kỳ checkpoint nào một cách an toàn với state preservation

### Flags
| Flag | Description |
|------|-------------|
| `--list` | Liệt kê tất cả checkpoints |
| `--to <tag>` | Rollback về tag cụ thể |
| `--phase <N>` | Rollback về đầu phase N |
| `--task <N.M>` | Rollback về trước task M của phase N |
| `--dry-run` | Xem trước changes, không thực hiện |
| `--force` | Bỏ qua confirmation |

### Checkpoint Types
| Tag Pattern | Created By | Meaning |
|-------------|------------|---------|
| `{project}-vp-p{N}-t{M}` | vp-auto | Task started |
| `{project}-vp-p{N}-t{M}-done` | vp-auto | Task completed |
| `{project}-vp-p{N}-complete` | vp-auto | Phase completed |
| `v{semver}` | vp-auto | Version release |

### Safety Guarantees
- Lưu current state trước khi rollback
- Tạo `vp-rollback-{timestamp}` branch backup
- Cho phép xem diff trước khi confirm
- Có thể undo rollback bằng cách checkout backup branch

### Output
- Git reset về target checkpoint
- `vp-rollback-{timestamp}` backup branch
- Updated `.viepilot/HANDOFF.json` và `TRACKER.md`

---

## /vp-audit

**Purpose**: Kiểm tra documentation vs implementation — phát hiện và fix gaps

### Flags
| Flag | Description |
|------|-------------|
| `--fix` | Auto-fix gaps tìm thấy |
| `--report` | Chỉ report, không fix |
| `--scope skills` | Chỉ audit skills |
| `--scope workflows` | Chỉ audit workflows |
| `--scope docs` | Chỉ audit docs/ directory |
| `--scope root` | Chỉ audit ROOT documents (README, ROADMAP) |

### Checks Performed
1. **Skills completeness** — mỗi skill có đủ required sections không
2. **Workflow completeness** — mỗi workflow có `<purpose>`, `<process>`, `<step>`, `<success_criteria>` không
3. **Cross-references** — skill `<execution_context>` trỏ đến workflow tồn tại không
4. **CLI coverage** — mỗi command có documentation không
5. **docs/ sync** — docs/ có match với thực tế (skills count, workflows count) không
6. **ROOT drift** — README.md badges, ROADMAP.md status có up-to-date không

### Output
- Audit report với danh sách gaps
- Optional auto-fix với commit

---

## /vp-task

**Purpose**: Manual task management

### Commands
| Command | Description |
|---------|-------------|
| `list` | List tasks in current phase |
| `show N` | Show task N details |
| `start N` | Manually start task N |
| `done N` | Mark task N as done |
| `skip N --reason "..."` | Skip task N |
| `retry N` | Retry failed task N |
| `rollback N` | Rollback task N changes |

---

## /vp-update

**Purpose**: Nâng cấp package `viepilot` qua npm — có dry-run và xác nhận non-interactive (FEAT-008).

### Flags
| Flag | Description |
|------|-------------|
| `--dry-run` | In planned npm command, không chạy |
| `--yes` | Bỏ qua prompt; **bắt buộc** trong non-interactive khi apply |
| `--global` | Ép `npm install -g viepilot@latest` |

### Lưu ý
- Trong repo **application** có `node_modules/viepilot`, update mặc định có thể target **local** — dùng **`--global`** nếu chỉ muốn global.
- Luồng an toàn: `vp-tools update --dry-run` → sau đó `vp-tools update --yes` (hoặc `--global --yes`).
