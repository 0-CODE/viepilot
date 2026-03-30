# ViePilot - Project Context

<domain_knowledge>

## What is ViePilot?

ViePilot là một **skill framework** cho phép AI assistant (Claude, GPT, etc.) phát triển dự án một cách:
- **Tự động (Autonomous)**: AI tự chạy qua các phases/tasks
- **Có kiểm soát (Controlled)**: Dừng tại control points cho user decisions
- **Có thể khôi phục (Recoverable)**: State được lưu để resume bất kỳ lúc nào

## Core Concepts

### Skill
Một "kỹ năng" mà AI có thể thực thi khi được gọi bằng slash command.
- Format: `/vp-{name}` hoặc mention `vp-{name}`
- Định nghĩa trong: `skills/vp-{name}/SKILL.md`
- Cấu trúc: YAML metadata + XML-like sections

### Workflow
Một quy trình step-by-step mà skill sẽ thực thi.
- Định nghĩa trong: `workflows/{name}.md`
- Mỗi skill reference một workflow
- Có thể có nhiều skills dùng chung workflow

### Template
Các file mẫu để generate artifacts.
- Project templates: Cấu trúc dự án (11 files)
- Phase templates: Quản lý phase/task (5 files)
- Placeholders: `{{VARIABLE_NAME}}`

### Phase
Một giai đoạn phát triển với nhiều tasks.
- Mỗi phase có: SPEC, PHASE-STATE, tasks/, VERIFICATION, SUMMARY
- Phases được định nghĩa trong ROADMAP.md

### Task
Một đơn vị công việc cụ thể trong phase.
- Có objective, acceptance criteria, verification
- Tracked bằng git tags

### Milestone
Một version/release cycle chứa nhiều phases.
- Archive khi complete
- New milestone = new development cycle

## Workflow Modes

### New Project Mode
```
brainstorm → crystallize → auto → docs
```

### Ongoing Project Mode
```
request (bug/feature/enhancement) → integrate into phases
evolve (new milestone/major upgrade)
```

### Session Control
```
pause → HANDOFF.json + .continue-here.md → resume
```

## Key Principles

### 1. AI-First Design
- Files designed for AI consumption
- Clear context loading strategy
- Minimal noise, maximum signal

### 2. Human-Readable State
- TRACKER.md cho humans
- HANDOFF.json cho machines
- Git tags cho version control

### 3. Recovery by Design
- Checkpoints tại mỗi task boundary
- State luôn có thể rollback
- Resume từ bất kỳ điểm nào

### 4. Standards Compliance
- Semantic Versioning cho versions
- Conventional Commits cho git
- Keep a Changelog cho changelog

</domain_knowledge>

<key_terms>

| Term | Meaning |
|------|---------|
| VP | ViePilot (prefix) |
| Skill | Slash command AI có thể thực thi |
| Workflow | Quy trình step-by-step |
| Template | File mẫu với placeholders |
| Phase | Giai đoạn phát triển |
| Task | Đơn vị công việc |
| Milestone | Release cycle |
| Checkpoint | Git tag tại task boundary |
| Control Point | Điểm dừng chờ user decision |
| HANDOFF | File lưu machine state |

</key_terms>

<business_rules>

1. **Skill Naming**: Tất cả skills phải prefix `vp-`
2. **Workflow Reference**: Mỗi skill PHẢI reference một workflow
3. **State Sync**: HANDOFF.json và TRACKER.md phải đồng bộ
4. **Checkpoint Required**: Tạo git tag trước và sau mỗi task
5. **Atomic Commits**: Một commit = một logical change
6. **Standards First**: Luôn tuân theo SemVer, Conventional Commits, Keep a Changelog

</business_rules>

<constraints>

1. **No External Dependencies**: Framework chỉ dùng Markdown + JSON + Git
2. **AI Agnostic**: Hoạt động với bất kỳ AI assistant nào
3. **Single Workspace**: Mỗi project chỉ một `.viepilot/` directory
4. **Git Required**: Cần Git để track state và checkpoints
5. **Node.js for CLI**: CLI cần Node.js runtime

</constraints>

<naming_conventions>

| Type | Convention | Example |
|------|------------|---------|
| Skill | `vp-{verb}` | `vp-brainstorm`, `vp-auto` |
| Skill Directory | `vp-{verb}/` | `skills/vp-brainstorm/` |
| Workflow | `{verb}.md` or `{verb}-{noun}.md` | `brainstorm.md`, `pause-work.md` |
| Template | `{NOUN}.md` (uppercase) | `AI-GUIDE.md`, `ROADMAP.md` |
| Phase Directory | `{NN}-{slug}/` | `01-setup/`, `02-core-features/` |
| Git Tag | `vp-p{N}-t{M}[-state]` | `vp-p1-t2-done` |

</naming_conventions>
