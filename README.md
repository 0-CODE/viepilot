# ViePilot

**Autonomous Vibe Coding Framework / Bộ khung phát triển tự động có kiểm soát**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-10-purple.svg)](#skills-reference)
[![Workflows](https://img.shields.io/badge/workflows-8-orange.svg)](#workflows)
[![Templates](https://img.shields.io/badge/templates-16-cyan.svg)](#templates)
[![GitHub](https://img.shields.io/github/stars/0-CODE/viepilot?style=social)](https://github.com/0-CODE/viepilot)

ViePilot là bộ skill framework cho phép AI assistant (Claude, GPT, etc.) phát triển dự án một cách **tự động**, **có kiểm soát**, và **có thể khôi phục**. Thiết kế theo các tiêu chuẩn chuyên nghiệp: Semantic Versioning, Conventional Commits, Keep a Changelog.

ViePilot is a skill framework that enables AI assistants to develop projects **autonomously**, with **control points**, and **recovery capability**. Built with professional standards: Semantic Versioning, Conventional Commits, Keep a Changelog.

---

## Quy mô dự án / Project Scale

| Chỉ số / Metric | Giá trị / Value |
|-----------------|-----------------|
| Total LOC | **5,800+** |
| Skills | 10 |
| Workflows | 8 |
| Templates | 16 (Project: 11, Phase: 5) |
| CLI Commands | 12 |
| Standards | 5 (SemVer, Commits, Changelog, Comments, Contributors) |

### Phân bổ / Breakdown

| Thành phần / Component | Số lượng / Count | Mô tả / Description |
|------------------------|------------------|---------------------|
| Skill Definitions | 10 | SKILL.md files với trigger, process, success criteria |
| Workflow Files | 8 | Step-by-step execution guides |
| Project Templates | 11 | AI-GUIDE, ARCHITECTURE, README, SYSTEM-RULES, etc. |
| Phase Templates | 5 | SPEC, PHASE-STATE, TASK, VERIFICATION, SUMMARY |
| CLI Tools | 1 | vp-tools.cjs (12 commands) |

---

## Độ hoàn thiện / Completion Status

```
Tổng thể / Overall:  ████████████████████░  95%
```

| Lĩnh vực / Area | Trạng thái | Chi tiết |
|-----------------|------------|----------|
| Core Skills (10) | ✅ Hoàn thiện | brainstorm, crystallize, auto, pause, resume, status, request, evolve, docs, task |
| Workflows (8) | ✅ Hoàn thiện | Full step-by-step guides với success criteria |
| Project Templates (10) | ✅ Hoàn thiện | Placeholders cho customization |
| Phase Templates (5) | ✅ Hoàn thiện | Task tracking, verification, summary |
| CLI Tools | ✅ Hoàn thiện | State management, progress, versioning |
| Documentation | ✅ Hoàn thiện | Getting started, skills reference |
| Standards | ✅ Hoàn thiện | SemVer, Conventional Commits, Keep a Changelog |
| Installation | ✅ Hoàn thiện | install.sh với PATH setup |

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
| `/vp-auto` | Chạy autonomous với control points / Autonomous execution | "auto", "vibe", "chạy" | Execute |
| `/vp-pause` | Lưu state để resume sau / Save state for later | "pause", "dừng" | Control |
| `/vp-resume` | Khôi phục context và tiếp tục / Restore and continue | "resume", "tiếp tục" | Control |
| `/vp-status` | Dashboard tiến độ / Progress dashboard | "status", "tiến độ" | Monitor |
| `/vp-request` | Bug/Feature/Enhancement/Debt / Ongoing requests | "bug", "feature", "yêu cầu" | Develop |
| `/vp-evolve` | Milestone mới, nâng cấp lớn / New milestone, major upgrade | "evolve", "milestone" | Develop |
| `/vp-docs` | Generate documentation / Tạo tài liệu | "docs", "tài liệu" | Finalize |
| `/vp-task` | Quản lý task thủ công / Manual task control | "task" | Manual |

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
| **CLI** | Node.js (vp-tools.cjs) |
| **State** | JSON (HANDOFF.json) + Markdown (TRACKER.md) |
| **Version Control** | Git tags for checkpoints (vp-p{N}-t{M}) |

---

## Bắt đầu nhanh / Quick Start

### Cách 1: Một lệnh / One command

```bash
git clone https://github.com/0-CODE/viepilot.git
cd viepilot
./install.sh
```

### Cách 2: Thủ công / Manual

```bash
# Clone
git clone https://github.com/0-CODE/viepilot.git
cd viepilot

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

## Cấu trúc dự án / Project Structure

```
viepilot/
├── skills/                        # 10 Skill definitions
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
│   └── vp-task/                   # Manual task control
│
├── workflows/                     # 8 Workflow definitions
│   ├── brainstorm.md              # Brainstorm session flow
│   ├── crystallize.md             # Artifact generation flow
│   ├── autonomous.md              # Execution loop
│   ├── pause-work.md              # State preservation
│   ├── resume-work.md             # Context restoration
│   ├── request.md                 # Request management
│   ├── evolve.md                  # Evolution flow
│   └── documentation.md           # Docs generation
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
├── bin/                           # CLI tools
│   └── vp-tools.cjs               # 12 commands
│
├── docs/                          # Documentation
│   ├── getting-started.md         # Hướng dẫn bắt đầu
│   └── skills-reference.md        # Chi tiết skills
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
| [Getting Started](docs/getting-started.md) | Hướng dẫn bắt đầu / Quick start guide |
| [Skills Reference](docs/skills-reference.md) | Chi tiết từng skill / Detailed skill docs |
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
