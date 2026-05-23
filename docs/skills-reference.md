# Skills Reference

Complete reference for all ViePilot skills.

## ViePilot Scope Policy

- **Default behavior**: ViePilot workflows and responses only use skills under `vp-*`.
- **Out-of-scope by default**: skills outside the ViePilot namespace are ignored, even if present in the runtime environment.
- **Explicit opt-in**: external skills are considered only when the user explicitly asks to expand beyond ViePilot scope.
- **Routing fallback**: if an external skill is mentioned accidentally, prefer the closest built-in `vp-*` command instead.
- **Opt-in example**: "Trong bước này, cho phép dùng thêm external skills ngoài ViePilot để tham khảo."

### Implementation routing (ENH-021)

- **`/vp-request`** và **`/vp-evolve`** **không** implement mã shipping mặc định — chỉ backlog / plan (ROADMAP, phase, tasks). **`/vp-auto`** là lane implement sau khi có task plan (doc-first **BUG-001**). Mọi `skills/vp-*/SKILL.md` có block `<implementation_routing_guard>`; normative: `workflows/request.md`, `workflows/evolve.md`, `workflows/debug.md`, `workflows/autonomous.md`.

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
| `/end` | Kết thúc và lưu (sau **Project meta intake** nếu thiếu `.viepilot/META.md` / `viepilot_profile_id` — FEAT-009) |
| `/questions` | Xem open questions |
| `/research {topic}` | Research nhanh trong phiên, quay lại topic hiện tại |
| `/research-ui` | **UI Direction (FEAT-010, ENH-019, ENH-020)**: scenarios + stress pass + **archetype recipes** → designer + research → HTML/CSS + **`## UX walkthrough log`** |
| `/research ui` | Alias của `/research-ui` |

### Output
- `docs/brainstorm/session-{YYYY-MM-DD}.md`
- **Project meta intake (FEAT-009):** khi scope đã chốt và chưa bind profile — Q&A tuần tự; ghi `~/.viepilot/profiles/<slug>.md`, cập nhật `~/.viepilot/profile-map.md`, tạo `.viepilot/META.md` — normative: `docs/dev/global-profiles.md`.
- **Product horizon:** session file giữ **`## Product horizon`** (MVP / Post-MVP / Future tags, deferred capabilities, hoặc single-release statement) để `/vp-crystallize` không bỏ sót post-MVP — xem `workflows/brainstorm.md`.
- UI Direction (optional): `.viepilot/ui-direction/{session-id}/` — legacy (`index.html`) hoặc multi-page (`pages/*.html` + hub + `## Pages inventory` trong `notes.md`). Chi tiết: [UI Direction](user/features/ui-direction.md).

### Adapter-Aware Interactive Prompts (ENH-048)
- **Claude Code (terminal)**: dùng `AskUserQuestion` tool — click-to-select UI cho session intent + landing page layout
- **Cursor / Codex / Antigravity / other**: tự động fallback về text list — không cần cấu hình

---

## /vp-crystallize

**Purpose**: Chuyển đổi brainstorm thành executable artifacts

### UI direction intake
- Nếu có `.viepilot/ui-direction/{session-id}/` với `pages/*.html`: đọc `notes.md` (**Pages inventory**), từng file page, và hub `index.html` để architecture UI không bỏ sót màn hình.

### Product horizon (brainstorm → ROADMAP / context)
- Step 1: trích **`## Product horizon`** từ mọi session; **horizon inventory** + cổng single-release / thiếu section — `workflows/crystallize.md`.
- `ROADMAP.md`: luôn có block **Post-MVP / Product horizon** (hoặc ghi rõ single-release); `PROJECT-CONTEXT.md`: khối **`<product_vision>`** từ `templates/project/PROJECT-CONTEXT.md`.
- Hướng dẫn user tổng quan: [product-horizon.md](user/features/product-horizon.md). Thứ tự load cho AI: `templates/project/AI-GUIDE.md` (bản crystallize copy vào `.viepilot/AI-GUIDE.md`).

### ViePilot global profile (FEAT-009)
- Step 0: đọc `.viepilot/META.md` → `~/.viepilot/profiles/<slug>.md` (contract: `docs/dev/global-profiles.md`); pre-fill metadata; merge vào **ARCHITECTURE** (`## ViePilot organization context`) và **PROJECT-CONTEXT** (`## ViePilot active profile`).

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
├── architecture/   (*.mermaid diagram sidecars — ENH-022, mirror fenced blocks)
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

### Adapter-Aware Interactive Prompts (ENH-048)
- **Claude Code (terminal)**: dùng `AskUserQuestion` tool cho license selection, brownfield overwrite confirm, polyrepo prompt, UI direction gate, architect suggestion
- **Cursor / Codex / Antigravity / other**: tự động fallback về text list — không cần cấu hình

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

**Purpose**: Nâng cấp hoặc mở rộng dự án (**planning** — ROADMAP, phase, tasks; implement sau bằng **`/vp-auto`**; xem **Implementation routing (ENH-021)** ở đầu file).

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

### ViePilot global profile (FEAT-009)
- Sau resolve git/repo context: nếu có binding `.viepilot/META.md`, dùng profile global cho attribution/tone trong prose (không fail khi thiếu) — `workflows/documentation.md` §0A.

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

**Purpose**: Tạo và quản lý requests (Bug, Feature, Enhancement, Tech Debt, Brainstorm tiếp). **Không** thay **`/vp-evolve`** (plan) hay **`/vp-auto`** (implement); chuỗi khuyến nghị: request → evolve → auto (**ENH-021**).

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

### Adapter-Aware Interactive Prompts (ENH-048)
- **Claude Code (terminal)**: dùng `AskUserQuestion` tool cho request type detection, bug severity, feature priority
- **Cursor / Codex / Antigravity / other**: tự động fallback về text list — không cần cấu hình

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
7. **ENH-022 (architecture sidecars)** — khi matrix có Mermaid thực tế, gợi ý kiểm `.viepilot/architecture/<type>.mermaid` khớp `ARCHITECTURE.md`

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

---

## /vp-proposal

**Purpose**: Generate professional proposal packages (.pptx + .docx + .md) from brainstorm sessions or direct briefs.

**Triggers**: "proposal", "pitch deck", "presentation", "tài liệu đề xuất"

### Proposal Types
| Type | Slides | Use case |
|------|--------|----------|
| `project-proposal` | 10 | Client delivery — scope, timeline, budget |
| `tech-architecture` | 12 | Technical partners — system design |
| `product-pitch` | 12 | Investors / partners — pitch |
| `general` | 8 | Any audience — flexible |

### Flags
| Flag | Description |
|------|-------------|
| `--type <id>` | Proposal type ID. If omitted: guided menu. |
| `--from <file>` | Explicit brainstorm session file to use |
| `--slides` | Upload to Google Slides after generation (requires service account) |
| `--dry-run` | Print slide manifest; no files written |

### Output
```
docs/proposals/
├── {slug}-{date}.md      Markdown source
├── {slug}-{date}.pptx    Presentation
├── {slug}-{date}.docx    Detailed document
└── {slug}-{date}-slides.txt  Google Slides URL (--slides only)
```

### Template Override
Place custom `.pptx`/`.docx` files in `.viepilot/proposal-templates/` to override stock ViePilot templates for a specific project.

### Examples
```
/vp-proposal                              Auto-detect session + guided type selection
/vp-proposal --type product-pitch         12-slide investor pitch
/vp-proposal --type project-proposal --slides  + upload to Google Slides
/vp-proposal --dry-run                    Preview manifest only
```

Full guide: `docs/user/features/proposal.md`

---

## /vp-skills

**Purpose**: Agent-native global skill registry management — scan, list, install, uninstall, update, and inspect third-party skills from any project directory (ENH-062).

### Commands
| Command | Description |
|---------|-------------|
| `/vp-skills scan` | Refresh `~/.viepilot/skill-registry.json` by scanning all adapter dirs |
| `/vp-skills list` | Display indexed skills table |
| `/vp-skills install <src>` | Install from npm / `github:<user>/<repo>` / local path |
| `/vp-skills uninstall <id>` | Remove skill from all adapter directories |
| `/vp-skills update <id>` | Re-install from original source (`skill-meta.json`) |
| `/vp-skills info <id>` | Show capabilities, best_practices, and adapter paths |

### Notes
- Uses installed vp-tools binary (`~/.claude/viepilot/bin/vp-tools.cjs`) — works from any project directory.
- Fallback: `~/.cursor/viepilot/bin/vp-tools.cjs` for Cursor adapter.
- Registry file: `~/.viepilot/skill-registry.json` — shared across all projects.
- Confirmation AUQ prompt before destructive `uninstall` (Claude Code terminal only).

---

## /vp-design

Visual/UI direction skill. Generates UI architecture: component map, color system, typography,
responsive breakpoints, and Pencil design file integration.

### Triggers
`vp-design`, `/vp-design`, "thiết kế UI", "UI direction", "design system"

### Flags
- `--new` : Start fresh UI direction session
- `--component <name>` : Design a specific component
- `--mobile` : Mobile-first emphasis
- `--architect` : Generate Architect HTML view alongside

### Flow
1. Collect product goals + target audience + brand constraints
2. Generate UI direction: color palette, typography, spacing scale, component inventory
3. Output Pencil design stubs (if Pencil MCP available) or Architect HTML fallback
4. Write `docs/ui-direction.md` and `PROJECT-CONTEXT.md ## UI Direction`

### Output
- `docs/ui-direction.md` (created/updated)
- `PROJECT-CONTEXT.md` UI Direction section (locked by `/vp-crystallize` Step 1E)
- Optional: Pencil `.pen` file stubs via `mcp__pencil__batch_design`

### Adapter-Aware Prompts
Uses `AskUserQuestion` on Claude Code terminal for design-direction questions.

---

## /vp-intake

Structured intake from Google Sheets, Excel (M365), CSV files, and browser URLs. Reads rows
from a configured source, creates ViePilot request files, and optionally writes results back.

### Triggers
`vp-intake`, `/vp-intake`, "đọc intake", "intake từ sheet", "load requests from sheet"

### Flags
- `--channel <id>` : Force a specific intake channel (sheets/excel/csv/browser)
- `--dry-run` : Parse and triage without writing request files
- `--no-writeback` : Skip writing results back to source
- `--setup` : Launch AUQ-driven channel configuration wizard (ENH-084)

### Flow
1. Load intake manifest (`~/.viepilot/intake-manifests/<project>.json`) or prompt setup
2. Read rows from configured channel (Google Sheets via API, Excel via M365 Graph, CSV, or browser-agent for public URLs)
3. Triage each row: detect type (bug/feature/enhancement/debt), extract title/description
4. Create `.viepilot/requests/{TYPE}-{N}.md` for each valid row
5. Write-back status column to source row (if writable channel)

### Output
- `.viepilot/requests/{TYPE}-{N}.md` per intake row
- Intake manifest updated with last-read cursor
- Source row status updated (write-back, if enabled)

### Adapters
Full support: Claude Code. Partial: Cursor (no AUQ). Text fallback: Codex/Copilot/Antigravity.

---

## /vp-persona

Manages the global developer persona profile stored in `~/.viepilot/config.json`. Persona
controls output style, stack preferences, and team-size assumptions injected into every skill.

### Triggers
`vp-persona`, `/vp-persona`, "cấu hình persona", "set persona", "developer profile"

### Flags
- `--set` : Interactively set persona fields
- `--show` : Print current active persona
- `--auto-switch` : Switch persona based on current project stack (used internally by skills)
- `--context` : Print persona as `## User Persona` block (used by skill banners)

### Persona Fields
| Field | Values | Default |
|-------|--------|---------|
| `role` | backend / frontend / fullstack / devops / data / mobile | backend |
| `domain` | web-saas / mobile / api / data / infra / other | web-saas |
| `stacks` | comma-separated list | — |
| `outputStyle` | lean / verbose | lean |
| `phaseTemplate` | lean-startup / enterprise / research | lean-startup |
| `teamSize` | solo / small / medium / large | solo |

### Flow
1. `vp-tools persona auto-switch` — detects stack from package.json / pyproject.toml / build.gradle
2. `vp-tools persona context` — outputs `## User Persona` markdown block
3. Skills inject this block silently before task execution

### Output
- `~/.viepilot/config.json` updated
- `## User Persona` injected into each skill session
