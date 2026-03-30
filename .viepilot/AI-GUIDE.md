# ViePilot - AI Navigation Guide

> **Đọc file này TRƯỚC KHI làm bất kỳ task nào**
> File này giúp bạn tìm đúng context mà không cần load tất cả

## Quick Lookup

| Tôi cần... | Đọc file | Section |
|------------|----------|---------|
| Hiểu project làm gì | `PROJECT-CONTEXT.md` | `<domain_knowledge>` |
| Biết tech stack | `ARCHITECTURE.md` | `## Technology Stack` |
| Xem skill nào làm gì | `ARCHITECTURE.md` | `## Skills Layer` |
| Biết đang ở phase nào | `TRACKER.md` | `## Current State` |
| Xem task tiếp theo | `ROADMAP.md` | Tìm phase đang `In Progress` |
| Coding conventions | `SYSTEM-RULES.md` | `<coding_rules>` |
| Những gì KHÔNG được làm | `SYSTEM-RULES.md` | `<do_not>` |
| Decisions đã quyết định | `TRACKER.md` | `## Decision Log` |
| Resume công việc dở | `HANDOFF.json` | - |
| File headers | `PROJECT-META.md` | `## File Headers` |

## Project-Specific Files

| Category | Location | Purpose |
|----------|----------|---------|
| Skills | `skills/vp-*/SKILL.md` | Skill definitions |
| Workflows | `workflows/*.md` | Workflow processes |
| Templates - Project | `templates/project/*.md` | Project-level templates |
| Templates - Phase | `templates/phase/*.md` | Phase-level templates |
| CLI | `bin/vp-tools.cjs` | CLI commands |
| Docs | `docs/*.md` | User documentation |

## Context Loading Strategy

### Minimal Context (cho quick tasks)
```
Chỉ đọc:
1. AI-GUIDE.md (file này)
2. TRACKER.md → Current State
3. File cụ thể liên quan đến task
```

### Standard Context (cho coding tasks)
```
Đọc theo thứ tự:
1. AI-GUIDE.md (file này)
2. TRACKER.md → biết đang ở đâu
3. ROADMAP.md → task hiện tại
4. SYSTEM-RULES.md → coding rules
5. Skill/Workflow file nếu cần
```

### Full Context (cho architecture decisions)
```
Đọc thêm:
1. Standard Context +
2. ARCHITECTURE.md
3. PROJECT-CONTEXT.md
4. README.md cho overview
```

## File Relationships

```
AI-GUIDE.md (đọc đầu tiên)
     │
     ├── TRACKER.md (state hiện tại)
     │      └── points to → current phase in ROADMAP.md
     │
     ├── ROADMAP.md (what to do)
     │      └── tasks reference → skills/, workflows/
     │
     ├── SYSTEM-RULES.md (how to code)
     │      └── rules reference → ARCHITECTURE.md
     │
     ├── ARCHITECTURE.md (system design)
     │      └── layers → skills, workflows, templates
     │
     └── PROJECT-CONTEXT.md (domain knowledge)
```

## When Creating New Files

### For Skills (`skills/vp-*/SKILL.md`)
```yaml
---
name: vp-{skill-name}
description: "Short description"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
...
</cursor_skill_adapter>

<objective>
...
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/{workflow}.md
</execution_context>

<process>
...
</process>

<success_criteria>
...
</success_criteria>
```

### For Workflows (`workflows/*.md`)
```xml
<purpose>
...
</purpose>

<process>
<step name="...">
...
</step>
</process>

<success_criteria>
...
</success_criteria>
```

## Comment Rules Quick Reference

| ✅ DO | ❌ DON'T |
|-------|----------|
| Explain WHY | State the obvious |
| Document business rules | Comment out dead code |
| Warn about side effects | Write misleading comments |
| Explain complex logic | Add noise comments |
| Add TODO with ticket | Write journal comments |

Full guidelines: `SYSTEM-RULES.md#comment_standards`

## Commands Reference

| Command | Dùng khi |
|---------|----------|
| `/vp-brainstorm` | Thu thập ý tưởng |
| `/vp-crystallize` | Tạo artifacts từ brainstorm |
| `/vp-auto` | Chạy autonomous |
| `/vp-pause` | Dừng, lưu state |
| `/vp-resume` | Tiếp tục từ pause |
| `/vp-status` | Xem progress nhanh |
| `/vp-evolve` | Thêm features/milestone mới |
| `/vp-docs` | Generate documentation |
| `/vp-request` | Bug/Feature/Enhancement |
| `/vp-task` | Quản lý task thủ công |
