# Skills Reference

Complete reference for all ViePilot skills.

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

---

## /vp-crystallize

**Purpose**: Chuyển đổi brainstorm thành executable artifacts

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
| `--fast` | Skip optional verifications |
| `--dry-run` | Plan only, no execution |

### Execution Flow
```
For each phase:
  For each task:
    1. Load context
    2. Create git tag
    3. Execute implementation
    4. Verify results
    5. Handle outcome (pass/fail)
    6. Update state
  Mark phase complete
```

### Control Points
AI pauses for user input when:
- Conflicts detected
- Quality gate failure
- User decision needed
- Blocker encountered

### Git Tags
- `vp-p{phase}-t{task}` - Task started
- `vp-p{phase}-t{task}-done` - Task completed
- `vp-p{phase}-complete` - Phase completed

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
