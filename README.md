# ViePilot

**Autonomous Vibe Coding Framework / Bộ khung phát triển tự động có kiểm soát**

[![Version](https://img.shields.io/badge/version-1.5.1-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-14-purple.svg)](#skills-reference)
[![Workflows](https://img.shields.io/badge/workflows-12-orange.svg)](#workflows)
[![Templates](https://img.shields.io/badge/templates-16-cyan.svg)](#templates)
[![Tests](https://img.shields.io/badge/tests-249%20passing-brightgreen.svg)](tests/)
[![GitHub](https://img.shields.io/github/stars/0-CODE/viepilot?style=social)](https://github.com/0-CODE/viepilot)

**Versioning:** Shield **1.5.1** is the **ViePilot framework SemVer** tracked in `.viepilot/TRACKER.md` and `CHANGELOG.md`. The npm `package.json` field `version` (**1.5.1**) is the Node package identifier for this repo and may differ; use the framework version for milestone releases and docs.

ViePilot là bộ skill framework cho phép AI assistant (Claude, GPT, etc.) phát triển dự án một cách **tự động**, **có kiểm soát**, và **có thể khôi phục**. Thiết kế theo các tiêu chuẩn chuyên nghiệp: Semantic Versioning, Conventional Commits, Keep a Changelog.

ViePilot is a skill framework that enables AI assistants to develop projects **autonomously**, with **control points**, and **recovery capability**. Built with professional standards: Semantic Versioning, Conventional Commits, Keep a Changelog.

### Support ViePilot

Nếu ViePilot giúp ích cho bạn, bạn có thể ủng hộ một ly cafe:
- PayPal: [https://paypal.me/SATCODING](https://paypal.me/SATCODING)
- MOMO: [https://me.momo.vn/aMINujUPTbIRtbTli6Fd](https://me.momo.vn/aMINujUPTbIRtbTli6Fd)

---

## Quy mô dự án / Project Scale

| Chỉ số / Metric | Giá trị / Value |
|-----------------|-----------------|
| Total LOC | **~24,528+** (`.md`, `.js`, `.cjs`, `.yml`, `.json`, `.sh`; không gồm `node_modules`) |
| Skills | **14** |
| Workflows | **12** |
| Templates | **16** (Project: 11, Phase: 5) |
| CLI Commands | **16** (`vp-tools` 15 subcommands + `viepilot` installer) |
| Tests | **249** (8 suites: unit + integration + AI compat + README metrics + UI direction verify + ENH workflow contracts + viepilot-info) |
| ViePilot phases (repo) | **15** hoàn thành (xem `.viepilot/TRACKER.md`) |
| Standards | 5 (SemVer, Commits, Changelog, Comments, Contributors) |

> Metric `Total LOC` có thể được refresh tự động bằng `npm run readme:sync` (dùng `cloc`; nếu thiếu `cloc` script sẽ fallback an toàn).

### Phân bổ / Breakdown

| Thành phần / Component | Số lượng / Count | Mô tả / Description |
|------------------------|------------------|---------------------|
| Skill Definitions | **14** | SKILL.md files với trigger, process, success criteria |
| Workflow Files | **12** | Step-by-step execution guides |
| Project Templates | 11 | AI-GUIDE, ARCHITECTURE, README, SYSTEM-RULES, etc. |
| Phase Templates | 5 | SPEC, PHASE-STATE, TASK, VERIFICATION, SUMMARY |
| CLI Tools | 2 | vp-tools.cjs (**15** subcommands) + viepilot.cjs (guided installer) |
| Test Files | 5 | Jest unit + integration + AI compatibility + README metrics + ENH backlog contract tests |

---

## Độ hoàn thiện / Completion Status

```
Tổng thể / Overall:  ████████████████████  ~98% ✅ M1.21 complete; M1.22 ENH backlog verified (v1.5.1)
```

| Lĩnh vực / Area | Trạng thái | Chi tiết |
|-----------------|------------|----------|
| Core Skills (14) | ✅ Hoàn thiện | brainstorm, crystallize, auto, pause, resume, status, request, evolve, docs, task, debug, rollback, audit, ui-components |
| Workflows (12) | ✅ Hoàn thiện | Full step-by-step guides với success criteria |
| Project Templates (11) | ✅ Hoàn thiện | Placeholders cho customization |
| Phase Templates (5) | ✅ Hoàn thiện | Task tracking, verification, summary |
| CLI Tools (16) | ✅ Hoàn thiện | vp-tools 15 subcommands + viepilot installer; bundle `info` |
| Tests (249) | ✅ Hoàn thiện | Unit, integration, AI provider compatibility, workflow contracts, viepilot-info |
| CI/CD | ✅ Hoàn thiện | GitHub Actions, Node 18/20/22 matrix, coverage >80% |
| Documentation | ✅ Hoàn thiện | dev/, user/, api/, videos/, examples/, troubleshooting |
| Standards | ✅ Hoàn thiện | SemVer, Conventional Commits, Keep a Changelog |
| Installation | ✅ Hoàn thiện | install.sh + dev-install.sh |

---

## Workflow Tổng quan / Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DỰ ÁN MỚI / NEW PROJECT                             │
│                                                                             │
│   /vp-brainstorm ──► /vp-crystallize ──► /vp-auto ──► /vp-docs             │
│        │                    │                │             │                │
│    Ý tưởng            Artifacts         Working        Docs                 │
│    Ideas              & Roadmap          Code                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  DỰ ÁN ĐANG PHÁT TRIỂN / ONGOING PROJECT                    │
│                                                                             │
│   /vp-request  ─────────────────────────────────────────────────┐          │
│        │                                                         │          │
│        ├── 🐛 Bug Report ──────────► Fix ngay hoặc backlog      │          │
│        ├── ✨ Feature Request ─────► Brainstorm → Phase         │          │
│        ├── 🔧 Enhancement ─────────► Add to milestone           │          │
│        ├── 🧹 Tech Debt ───────────► Refactor phase             │          │
│        └── 💡 Brainstorm tiếp ─────► Explore → Decision         │          │
│                                                                  │          │
│   /vp-evolve ─── Milestone mới / Major upgrade ─────────────────┘          │
│                                                                             │
│   /vp-pause ◄──────────────────► /vp-resume  (bất kỳ lúc nào)              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Skills Reference

| Skill | Mô tả / Description | Trigger | Phase |
|-------|---------------------|---------|-------|
| `/vp-brainstorm` | Thu thập ý tưởng, quyết định / Collect ideas, decisions | "brainstorm", "ý tưởng" | Setup |
| `/vp-crystallize` | Tạo artifacts từ brainstorm / Generate artifacts | "crystallize", "setup" | Setup |
| `/vp-auto` | Autonomous phase/task loop; có `--fast`, `--from`, `--phase`, `--dry-run` / Autonomous execution (see Usage) | "auto", "vibe", "chạy" | Execute |
| `/vp-pause` | Lưu state để resume sau / Save state for later | "pause", "dừng" | Control |
| `/vp-resume` | Khôi phục context và tiếp tục / Restore and continue | "resume", "tiếp tục" | Control |
| `/vp-status` | Dashboard tiến độ / Progress dashboard | "status", "tiến độ" | Monitor |
| `/vp-request` | Bug/Feature/Enhancement/Debt / Ongoing requests | "bug", "feature", "yêu cầu" | Develop |
| `/vp-ui-components` | Curation + reuse UI component library | "ui components", "21st.dev" | Develop |
| `/vp-evolve` | Milestone mới, nâng cấp lớn / New milestone, major upgrade | "evolve", "milestone" | Develop |
| `/vp-docs` | Generate documentation / Tạo tài liệu | "docs", "tài liệu" | Finalize |
| `/vp-task` | Quản lý task thủ công / Manual task control | "task" | Manual |
| `/vp-debug` | Debug có hệ thống với state tracking / Systematic debugging | "debug", "gỡ lỗi" | Debug |
| `/vp-rollback` | Khôi phục về checkpoint / Rollback to checkpoint | "rollback", "revert" | Recovery |
| `/vp-audit` | Kiểm tra sync docs vs implementation | "audit", "kiểm tra" | Quality |

---

## Workflows

| Workflow | Mô tả / Description | Steps |
|----------|---------------------|-------|
| `brainstorm.md` | Interactive Q&A thu thập ý tưởng | 6 steps |
| `crystallize.md` | Metadata collection → Artifact generation | 12 steps |
| `autonomous.md` | Phase → Task → Verify → Iterate loop | 7 steps |
| `pause-work.md` | Gather state → HANDOFF.json → .continue-here.md | 6 steps |
| `resume-work.md` | Load state → Rebuild context → Route action | 8 steps |
| `request.md` | Detect type → Gather details → Triage → Track | 7 steps |
| `evolve.md` | Add feature / New milestone / Refactor modes | 5 steps |
| `documentation.md` | API / Dev / User docs generation | 5 steps |
| `debug.md` | New/continue/close debug session với state tracking | 7 steps |
| `rollback.md` | List checkpoints → Select → Revert safely | 5 steps |
| `audit.md` | Collect actual state → Parse docs → Report gaps | 6 steps |
| `ui-components.md` | Curate/classify/store reusable UI components | 6 steps |

---

## Templates

### Project Templates (11)

| Template | Mô tả / Description |
|----------|---------------------|
| `AI-GUIDE.md` | Navigation cho AI - quick lookup, context loading strategy |
| `PROJECT-META.md` | Metadata: org, package, developer, headers |
| `ARCHITECTURE.md` | System design, services, data flow, tech decisions |
| `PROJECT-CONTEXT.md` | Domain knowledge, business rules, constraints |
| `SYSTEM-RULES.md` | Coding rules, comment standards, versioning, git conventions |
| `ROADMAP.md` | Phases, tasks, dependencies, verification |
| `TRACKER.md` | Live state, progress, decision log, version info |
| `CHANGELOG.md` | Keep a Changelog format |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CONTRIBUTORS.md` | Attribution list |
| `README.md` | Professional README template |

### Phase Templates (5)

| Template | Mô tả / Description |
|----------|---------------------|
| `SPEC.md` | Phase specification: goal, scope, requirements |
| `PHASE-STATE.md` | Task status table, blockers, decisions, metrics |
| `TASK.md` | Task details: objective, context, acceptance criteria, verification |
| `VERIFICATION.md` | Automated + manual checks, quality gate results |
| `SUMMARY.md` | Completion summary: tasks, decisions, files changed |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Skills** | Markdown-based SKILL.md with YAML frontmatter |
| **Workflows** | Step-by-step XML-like process definitions |
| **CLI** | Node.js (vp-tools.cjs, viepilot.cjs) |
| **State** | JSON (HANDOFF.json) + Markdown (TRACKER.md) |
| **Version Control** | Git tags for checkpoints (`{project}-vp-p{N}-t{M}`, legacy `vp-p{N}-t{M}` supported) |

---

## Bắt đầu nhanh / Quick Start

### Cách 1: Một lệnh / One command

```bash
git clone https://github.com/0-CODE/viepilot.git
cd viepilot
npx viepilot install
```

Chọn target profile trong wizard (phím mũi tên + space + enter):
- Claude Code
- Cursor Agent
- Cursor IDE

Non-interactive:
```bash
npx viepilot install --target cursor-agent --yes
```

Gỡ cài đặt:
```bash
npx viepilot uninstall --target cursor-agent --yes
```

### Cách 2: Thủ công / Manual

```bash
# Clone
git clone https://github.com/0-CODE/viepilot.git
cd viepilot

# Guided fallback from local source
node bin/viepilot.cjs install --target all --yes

# Copy skills to Cursor
cp -r skills/* ~/.cursor/skills/

# Copy workflows and templates
mkdir -p ~/.cursor/viepilot
cp -r workflows ~/.cursor/viepilot/
cp -r templates ~/.cursor/viepilot/
cp -r bin ~/.cursor/viepilot/

# Make CLI executable
chmod +x ~/.cursor/viepilot/bin/vp-tools.cjs
```

### Makefile Commands

```bash
make install     # Cài đặt ViePilot
make update      # Cập nhật từ repo
make uninstall   # Gỡ cài đặt
make help        # Xem tất cả lệnh
```

---

## Sử dụng / Usage

### 1. Dự án mới / New Project

```bash
# Bước 1: Brainstorm
/vp-brainstorm

# Bước 2: Tạo artifacts
/vp-crystallize

# Bước 3: Chạy autonomous
/vp-auto

# Bước 4: Generate docs
/vp-docs
```

#### `/vp-auto` — flags và hành vi / Flags and behavior

| Gọi lệnh / Invocation | Ý nghĩa / Meaning |
|------------------------|-------------------|
| `/vp-auto` | Không truyền flag chỉ nghĩa là **không** bật `--fast`, `--from`, `--phase`, `--dry-run`. Workflow vẫn chọn phase chưa xong và lặp task. **Không** có trong spec quy tắc “không arg ⇒ bắt buộc dừng sau mỗi task”. |
| `/vp-auto --fast` | Bỏ qua các bước verify *tùy chọn* — thường ít điểm dừng hơn; gate bắt buộc (tests, lint, tiêu chí task) vẫn áp dụng. |
| `/vp-auto --from N` | Bắt đầu từ phase **N**. |
| `/vp-auto --phase N` | Chỉ chạy phase **N**. |
| `/vp-auto --dry-run` | Chỉ lập kế hoạch, không thực thi. |

**Thực tế trong Cursor / chat:** Một lượt AI thường kết thúc sau một task (hoặc tại control point: conflict, fail gate, bước *manual* trong file task). Để chạy tiếp, gọi lại `/vp-auto`, `/vp-resume`, hoặc nhắc rõ *“tiếp task kế trong phase …”*. Tài liệu chi tiết: [Autonomous mode](docs/user/features/autonomous-mode.md).

### 2. Dự án đang phát triển / Ongoing Project

```bash
# Report bug
/vp-request --bug

# Yêu cầu feature
/vp-request --feature

# Brainstorm thêm
/vp-request --brainstorm

# Xem requests
/vp-request --list
```

### 3. Pause/Resume

```bash
# Lưu state
/vp-pause

# Tiếp tục
/vp-resume
```

### 4. Nâng cấp lớn / Major Upgrade

```bash
/vp-evolve
# Options:
# 1. Add Feature
# 2. New Milestone
# 3. Refactor
```

---

## Publish npm (Maintainers)

```bash
npm run verify:release
npm publish --access public
npm run smoke:published
```

CI workflow publish: `.github/workflows/release-npm.yml` (requires `NPM_TOKEN` secret).  
Full guide: `docs/dev/deployment.md`.

---

## Cấu trúc dự án / Project Structure

```
viepilot/
├── skills/                        # 13 Skill definitions
│   ├── vp-brainstorm/             # Thu thập ý tưởng
│   │   └── SKILL.md
│   ├── vp-crystallize/            # Tạo artifacts
│   ├── vp-auto/                   # Autonomous execution
│   ├── vp-pause/                  # Save state
│   ├── vp-resume/                 # Restore state
│   ├── vp-status/                 # Progress dashboard
│   ├── vp-request/                # Bug/Feature/Enhancement
│   ├── vp-evolve/                 # Milestone/Upgrade
│   ├── vp-docs/                   # Documentation
│   ├── vp-task/                   # Manual task control
│   ├── vp-debug/                  # Systematic debugging
│   ├── vp-rollback/               # Checkpoint recovery
│   └── vp-audit/                  # Documentation sync
│
├── workflows/                     # 11 Workflow definitions
│   ├── brainstorm.md              # Brainstorm session flow
│   ├── crystallize.md             # Artifact generation flow
│   ├── autonomous.md              # Execution loop
│   ├── pause-work.md              # State preservation
│   ├── resume-work.md             # Context restoration
│   ├── request.md                 # Request management
│   ├── evolve.md                  # Evolution flow
│   ├── documentation.md           # Docs generation
│   ├── debug.md                   # Debug session workflow
│   ├── rollback.md                # Rollback workflow
│   └── audit.md                   # Audit workflow
│
├── templates/                     # 16 Templates
│   ├── project/                   # 11 Project-level templates
│   │   ├── AI-GUIDE.md
│   │   ├── PROJECT-META.md
│   │   ├── ARCHITECTURE.md
│   │   ├── PROJECT-CONTEXT.md
│   │   ├── SYSTEM-RULES.md
│   │   ├── ROADMAP.md
│   │   ├── TRACKER.md
│   │   ├── CHANGELOG.md
│   │   ├── CONTRIBUTING.md
│   │   ├── CONTRIBUTORS.md
│   │   └── README.md
│   │
│   └── phase/                     # 5 Phase-level templates
│       ├── SPEC.md
│       ├── PHASE-STATE.md
│       ├── TASK.md
│       ├── VERIFICATION.md
│       └── SUMMARY.md
│
├── lib/                           # Shared CLI logic (coverage target for Jest)
│   └── cli-shared.cjs             # Validators, project root, Levenshtein helpers
│
├── bin/                           # CLI tools
│   └── vp-tools.cjs               # 15 subcommands (+ help); uses ../lib/cli-shared.cjs, ../lib/viepilot-info.cjs
│
├── tests/                         # Test suite (249 tests)
│   ├── unit/                      # Unit tests
│   │   ├── validators.test.js     # CLI subprocess + in-process coverage tests
│   │   └── ai-provider-compat.test.js  # 142 AI compat tests
│   └── integration/               # Integration tests
│       └── workflow.test.js       # 22 E2E tests
│
├── .github/workflows/             # CI/CD
│   └── ci.yml                     # Node 18/20/22 matrix
│
├── docs/                          # Documentation
│   ├── README.md                  # Documentation index
│   ├── getting-started.md         # Hướng dẫn bắt đầu
│   ├── skills-reference.md        # Chi tiết skills
│   ├── advanced-usage.md          # Power user guide
│   ├── troubleshooting.md         # Common issues
│   ├── api/                       # API folder (N/A HTTP — see README there)
│   ├── videos/                    # Video tutorial scripts
│   ├── dev/                       # Developer guide
│   └── user/                      # User guide
│
├── examples/                      # Example projects
│   ├── web-app/                   # Next.js example
│   ├── api-service/               # Express + JWT example
│   └── cli-tool/                  # Node.js CLI example
│
├── install.sh                     # Installation script
├── Makefile                       # Developer commands
├── CHANGELOG.md                   # Version history
├── CONTRIBUTING.md                # Contribution guide
├── SECURITY.md                    # Security policy
├── LICENSE                        # MIT License
└── README.md                      # This file
```

---

## Standards / Tiêu chuẩn

| Standard | Specification | Usage |
|----------|---------------|-------|
| **Semantic Versioning** | [semver.org](https://semver.org/) | Version management |
| **Conventional Commits** | [conventionalcommits.org](https://www.conventionalcommits.org/) | Git commit messages |
| **Keep a Changelog** | [keepachangelog.com](https://keepachangelog.com/) | Changelog format |
| **Comment Standards** | Good/Bad examples | Code documentation |
| **Contributor Recognition** | Emoji-based types | Attribution |

---

## Output Structure / Cấu trúc đầu ra

Khi dùng ViePilot cho một dự án, cấu trúc được tạo ra:

```
your-project/
├── .viepilot/                     # ViePilot artifacts
│   ├── AI-GUIDE.md                # AI navigation
│   ├── PROJECT-META.md            # Project metadata
│   ├── ARCHITECTURE.md            # System design
│   ├── PROJECT-CONTEXT.md         # Domain knowledge
│   ├── SYSTEM-RULES.md            # Coding standards
│   ├── ROADMAP.md                 # Development plan
│   ├── TRACKER.md                 # Progress tracking
│   ├── HANDOFF.json               # Machine state
│   ├── schemas/                   # Database, API schemas
│   ├── phases/                    # Phase directories
│   │   ├── 01-setup/
│   │   │   ├── SPEC.md
│   │   │   ├── PHASE-STATE.md
│   │   │   ├── tasks/
│   │   │   ├── VERIFICATION.md
│   │   │   └── SUMMARY.md
│   │   └── ...
│   ├── requests/                  # Bug/Feature requests
│   └── milestones/                # Archived milestones
│
├── docs/
│   ├── brainstorm/                # Brainstorm sessions
│   ├── api/                       # API documentation
│   ├── dev/                       # Developer guides
│   └── user/                      # User guides
│
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CONTRIBUTORS.md
├── LICENSE
└── README.md
```

---

## Tài liệu / Documentation

| Tài liệu / Document | Nội dung / Content |
|---------------------|-------------------|
| [Documentation Index](docs/README.md) | Tổng hợp tất cả tài liệu / Full docs index |
| [API / interfaces](docs/api/README.md) | Không có REST — CLI & file contracts / No HTTP API |
| [Getting Started](docs/getting-started.md) | Hướng dẫn bắt đầu / Quick start guide |
| [Quick Start (User)](docs/user/quick-start.md) | 5-minute guide |
| [Skills Reference](docs/skills-reference.md) | Chi tiết từng skill / Detailed skill docs |
| [CLI Reference](docs/dev/cli-reference.md) | vp-tools 15 subcommands |
| [Advanced Usage](docs/advanced-usage.md) | Power user features |
| [Troubleshooting](docs/troubleshooting.md) | Common issues & fixes |
| [Architecture](docs/dev/architecture.md) | System design |
| [Contributing Guide](docs/dev/contributing.md) | How to add skills/commands |
| [Testing Guide](docs/dev/testing.md) | Test structure & patterns |
| [Examples](examples/README.md) | 3 example projects |
| [CHANGELOG](CHANGELOG.md) | Lịch sử thay đổi / Version history |
| [CONTRIBUTING](CONTRIBUTING.md) | Hướng dẫn đóng góp / How to contribute |
| [SECURITY](SECURITY.md) | Chính sách bảo mật / Security policy |

---

## Đóng góp / Contributing

Chúng tôi hoan nghênh mọi đóng góp! / We welcome contributions!

```bash
# Fork và clone
git clone https://github.com/0-CODE/viepilot.git
cd viepilot

# Tạo branch
git checkout -b feat/your-feature

# Commit theo Conventional Commits
git commit -m "feat(skill): add new capability"

# Push và tạo PR
git push origin feat/your-feature
```

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết chi tiết.

---

## Bảo mật / Security

Để báo cáo lỗ hổng bảo mật, vui lòng xem [SECURITY.md](SECURITY.md).

To report security vulnerabilities, please see [SECURITY.md](SECURITY.md).

---

## Tác giả / Author

| | |
|---|---|
| **Lead Developer** | Trần Thành Nhân |
| **Organization** | Công Ty TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM |
| **Repository** | [github.com/0-CODE/viepilot](https://github.com/0-CODE/viepilot) |

Xem danh sách đóng góp tại / See all contributors at: [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## Giấy phép / License

MIT License - Xem [LICENSE](LICENSE) để biết chi tiết.

Copyright © 2026 Công Ty TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM

---

<p align="center">
  <strong>ViePilot</strong> - <em>Vibe coding với sự kiểm soát / Vibe coding with control</em>
  <br><br>
  Developed by <strong>Trần Thành Nhân</strong>
  <br>
  <strong>Công Ty TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM</strong>
  <br><br>
  Copyright © 2026
</p>
