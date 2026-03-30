# ViePilot

**Autonomous Vibe Coding Framework** - Bộ công cụ AI-driven để phát triển dự án một cách tự động, có kiểm soát và có thể khôi phục.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Tổng quan

ViePilot là một bộ skill framework cho phép AI assistant (Claude, GPT, etc.) thực hiện:

- **Brainstorm** → Thu thập ý tưởng và quyết định
- **Crystallize** → Chuyển đổi thành artifacts có thể thực thi
- **Autonomous Execution** → Chạy tự động với control points
- **Recovery** → Pause/Resume bất kỳ lúc nào
- **Documentation** → Tự động generate docs

## 🔄 Workflow Hoàn Chỉnh

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DỰ ÁN MỚI                                        │
│                                                                     │
│  /vp-brainstorm → /vp-crystallize → /vp-auto → /vp-docs            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DỰ ÁN ĐANG PHÁT TRIỂN                           │
│                                                                     │
│  /vp-request  ──────────────────────────────────────────────┐      │
│       │                                                      │      │
│       ├── 🐛 Bug Report ────────► Fix ngay hoặc thêm backlog │      │
│       ├── ✨ Feature ───────────► Brainstorm → Add phase     │      │
│       ├── 🔧 Enhancement ───────► Thêm vào milestone         │      │
│       ├── 🧹 Tech Debt ─────────► Refactor phase             │      │
│       └── 💡 Brainstorm tiếp ───► Explore → Decision         │      │
│                                                              │      │
│  /vp-evolve ─── Milestone mới / Nâng cấp lớn ───────────────┘      │
│                                                                     │
│  /vp-pause ←→ /vp-resume  (bất kỳ lúc nào)                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Cài đặt

```bash
# Clone repository
git clone https://github.com/your-org/viepilot.git

# Run installation script
cd viepilot
./install.sh

# Or manual installation
cp -r skills/* ~/.cursor/skills/
cp -r workflows/* ~/.cursor/viepilot/workflows/
cp -r bin/* ~/.cursor/viepilot/bin/
```

## 📖 Sử dụng

### 1. Brainstorm dự án mới

```
/vp-brainstorm
```

Thu thập ý tưởng, quyết định kiến trúc, công nghệ.

### 2. Crystallize thành artifacts

```
/vp-crystallize
```

Chuyển đổi brainstorm thành:
- `AI-GUIDE.md` - Navigation cho AI
- `PROJECT-META.md` - Thông tin dự án
- `ARCHITECTURE.md` - Kiến trúc hệ thống
- `SYSTEM-RULES.md` - Quy tắc coding
- `ROADMAP.md` - Kế hoạch chi tiết
- `TRACKER.md` - Theo dõi tiến độ

### 3. Chạy Autonomous

```
/vp-auto
```

AI tự động thực thi các phases với:
- Quality gates
- Verification checkpoints
- Rollback capability

### 4. Pause/Resume

```
/vp-pause    # Lưu trạng thái
/vp-resume   # Tiếp tục từ điểm dừng
```

### 5. Xem tiến độ

```
/vp-status
```

### 6. Tạo Request (Bug, Feature, Enhancement)

Khi dự án đang chạy, sử dụng `/vp-request` để:

```
/vp-request              # Menu chọn loại request
/vp-request --bug        # Report bug
/vp-request --feature    # Yêu cầu feature mới
/vp-request --enhance    # Đề xuất cải tiến
/vp-request --debt       # Technical debt
/vp-request --brainstorm # Brainstorm thêm ý tưởng
/vp-request --list       # Xem danh sách requests
```

### 7. Nâng cấp lớn / Milestone mới

```
/vp-evolve   # Thêm features hoặc milestone mới
```

### 8. Generate Documentation

```
/vp-docs
```

## 📁 Cấu trúc dự án

```
viepilot/
├── skills/                 # Skill definitions
│   ├── vp-brainstorm/
│   ├── vp-crystallize/
│   ├── vp-auto/
│   ├── vp-pause/
│   ├── vp-resume/
│   ├── vp-status/
│   ├── vp-request/         # Bug/Feature/Enhancement
│   ├── vp-evolve/
│   ├── vp-docs/
│   └── vp-task/
│
├── workflows/              # Workflow definitions
│   ├── brainstorm.md
│   ├── crystallize.md
│   ├── autonomous.md
│   ├── pause-work.md
│   ├── resume-work.md
│   ├── request.md          # Bug/Feature/Enhancement
│   ├── evolve.md
│   └── documentation.md
│
├── templates/              # File templates
│   ├── project/
│   │   ├── AI-GUIDE.md
│   │   ├── PROJECT-META.md
│   │   ├── ARCHITECTURE.md
│   │   ├── PROJECT-CONTEXT.md
│   │   ├── SYSTEM-RULES.md
│   │   ├── ROADMAP.md
│   │   ├── TRACKER.md
│   │   ├── CHANGELOG.md
│   │   ├── CONTRIBUTING.md
│   │   └── CONTRIBUTORS.md
│   │
│   └── phase/
│       ├── SPEC.md
│       ├── PHASE-STATE.md
│       ├── TASK.md
│       ├── VERIFICATION.md
│       └── SUMMARY.md
│
├── bin/                    # CLI tools
│   └── vp-tools.cjs
│
├── docs/                   # Documentation
│   ├── getting-started.md
│   ├── skills-reference.md
│   ├── workflows-guide.md
│   └── templates-guide.md
│
├── examples/               # Example projects
│
├── install.sh              # Installation script
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## 🔧 Skills Reference

| Skill | Mô tả | Trigger |
|-------|-------|---------|
| `/vp-brainstorm` | Thu thập ý tưởng (dự án mới) | "brainstorm", "ý tưởng" |
| `/vp-crystallize` | Tạo artifacts từ brainstorm | "crystallize", "setup" |
| `/vp-auto` | Chạy autonomous | "auto", "vibe", "chạy" |
| `/vp-pause` | Lưu trạng thái | "pause", "dừng" |
| `/vp-resume` | Tiếp tục | "resume", "tiếp tục" |
| `/vp-status` | Xem tiến độ | "status", "tiến độ" |
| `/vp-request` | **Bug/Feature/Enhancement** | "bug", "lỗi", "feature", "yêu cầu" |
| `/vp-evolve` | Nâng cấp lớn / Milestone mới | "evolve", "milestone" |
| `/vp-docs` | Generate docs | "docs", "tài liệu" |
| `/vp-task` | Quản lý task | "task" |

## 📋 Standards

ViePilot tuân theo các tiêu chuẩn:

- **[Semantic Versioning](https://semver.org/)** - Version management
- **[Keep a Changelog](https://keepachangelog.com/)** - Changelog format
- **[Conventional Commits](https://conventionalcommits.org/)** - Commit messages

## 🤝 Đóng góp

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết cách đóng góp.

## 📄 License

MIT License - Xem [LICENSE](LICENSE) để biết thêm chi tiết.

---

**ViePilot** - *Vibe coding với sự kiểm soát* 🚀
