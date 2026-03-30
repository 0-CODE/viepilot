# {{PROJECT_NAME}} - AI Navigation Guide

> **Đọc file này TRƯỚC KHI làm bất kỳ task nào**
> File này giúp bạn tìm đúng context mà không cần load tất cả

## Quick Lookup

| Tôi cần... | Đọc file | Section |
|------------|----------|---------|
| Hiểu project làm gì | `PROJECT-CONTEXT.md` | `<domain_knowledge>` |
| Biết tech stack | `ARCHITECTURE.md` | `## Technology Decisions` |
| Xem service nào làm gì | `ARCHITECTURE.md` | `## Services` |
| Biết đang ở phase nào | `TRACKER.md` | `## Current State` |
| Xem task tiếp theo | `ROADMAP.md` | Tìm phase đang `In Progress` |
| Coding conventions | `SYSTEM-RULES.md` | `<coding_rules>` |
| Những gì KHÔNG được làm | `SYSTEM-RULES.md` | `<do_not>` |
| Database schema | `schemas/database-schema.sql` | - |
| API contracts | `schemas/api-contracts.yaml` | - |
| Decisions đã quyết định | `TRACKER.md` | `## Decision Log` |
| Resume công việc dở | `HANDOFF.json` | - |
| Package structure | `PROJECT-META.md` | `## Package Structure` |
| File headers | `PROJECT-META.md` | `## File Headers` |

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
5. Schema file nếu cần
```

### Full Context (cho architecture decisions)
```
Đọc thêm:
1. Standard Context +
2. ARCHITECTURE.md
3. PROJECT-CONTEXT.md
4. Brainstorm session gốc (nếu cần rationale)
```

## File Relationships

```
AI-GUIDE.md (đọc đầu tiên)
     │
     ├── TRACKER.md (state hiện tại)
     │      └── points to → current phase in ROADMAP.md
     │
     ├── ROADMAP.md (what to do)
     │      └── tasks reference → schemas/
     │
     ├── SYSTEM-RULES.md (how to code)
     │      └── rules reference → ARCHITECTURE.md
     │
     ├── ARCHITECTURE.md (system design)
     │      └── decisions from → PROJECT-CONTEXT.md
     │
     └── PROJECT-CONTEXT.md (domain knowledge)
            └── extracted from → docs/brainstorm/
```

## When Creating New Files

1. Read `PROJECT-META.md#file-headers` for correct header
2. Use package from `PROJECT-META.md#package-structure`
3. Add @author tag from `PROJECT-META.md#lead-developer`
4. Follow `SYSTEM-RULES.md#coding_rules`
5. Follow `SYSTEM-RULES.md#comment_standards`

## Comment Rules Quick Reference

| ✅ DO | ❌ DON'T |
|-------|----------|
| Explain WHY | State the obvious |
| Document business rules | Comment out dead code |
| Warn about side effects | Write misleading comments |
| Explain complex logic | Add noise comments |
| Add TODO with ticket | Write journal comments |

Full guidelines: `SYSTEM-RULES.md#comment_standards`

## Khi Nào Cần Đọc Lại

| Trigger | Cần refresh |
|---------|-------------|
| Bắt đầu session mới | `TRACKER.md`, `HANDOFF.json` |
| Chuyển phase | `ROADMAP.md` section của phase mới |
| Gặp lỗi architecture | `ARCHITECTURE.md`, `SYSTEM-RULES.md` |
| Không rõ business rule | `PROJECT-CONTEXT.md` |
| Cần quyết định mới | `TRACKER.md` → Decision Log |

## Commands Reference

| Command | Dùng khi |
|---------|----------|
| `/vp-status` | Xem progress nhanh |
| `/vp-auto` | Chạy autonomous |
| `/vp-pause` | Dừng, lưu state |
| `/vp-resume` | Tiếp tục từ pause |
| `/vp-evolve` | Thêm features/milestone mới |
| `/vp-docs` | Generate documentation |
| `/vp-task` | Quản lý task thủ công |
