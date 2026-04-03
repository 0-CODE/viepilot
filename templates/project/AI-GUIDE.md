# {{PROJECT_NAME}} - AI Navigation Guide

> **Đọc file này TRƯỚC KHI làm bất kỳ task nào**
> File này giúp bạn tìm đúng context mà không cần load tất cả

## Quick Lookup

| Tôi cần... | Đọc file | Section |
|------------|----------|---------|
| Hiểu project làm gì | `PROJECT-CONTEXT.md` | `<domain_knowledge>` |
| Tầm nhìn & scope theo pha (MVP / Post-MVP / Future) | `PROJECT-CONTEXT.md` | `<product_vision>` |
| Roadmap sau MVP & horizon (không chỉ task hiện tại) | `ROADMAP.md` | Sections Post-MVP / Future / product horizon |
| Biết tech stack | `ARCHITECTURE.md` | `## Technology Decisions` |
| Xem service nào làm gì | `ARCHITECTURE.md` | `## Services` |
| Biết đang ở phase nào | `TRACKER.md` | `## Current State` |
| Xem task tiếp theo | `ROADMAP.md` | Tìm phase đang `In Progress` |
| Coding conventions | `SYSTEM-RULES.md` | `<coding_rules>` |
| Những gì KHÔNG được làm | `SYSTEM-RULES.md` | `<do_not>` |
| Database schema | `schemas/database-schema.sql` | - |
| API contracts | `schemas/api-contracts.yaml` | - |
| Decisions đã quyết định | `logs/decisions.md` | on-demand |
| Resume công việc dở | `HANDOFF.json` | - |
| Package structure | `PROJECT-META.md` | `## Package Structure` |
| File headers | `PROJECT-META.md` | `## File Headers` |

## Context Loading Strategy

> **QUAN TRỌNG:** Đọc tất cả files trong cùng 1 batch (multiple Read tool calls in 1 turn).
> Không đọc sequential — luôn đọc parallel để tiết kiệm turns.

### Static boundary (không cần đọc lại mỗi task)
- `SYSTEM-RULES.md` framework rules → cache sau lần đầu
- `ARCHITECTURE.md` module structure → cache sau lần đầu

> **Install path warning**: `~/.claude/viepilot/` and `~/.cursor/viepilot/` are **READ-ONLY** runtime paths.
> All file edits must target files under this project's working directory only.
> Writing to install paths bypasses version control and ships untested code to production.

### Dynamic boundary (đọc mỗi task)
- `TRACKER.md` + `HANDOFF.json` + `PHASE-STATE.md` + task file

### Conditional load (chỉ khi cần)
- `logs/decisions.md` → khi cần rationale cho decision
- `logs/blockers.md` → khi `HANDOFF.json.recovery.recent_blocker == true`
- `PROJECT-CONTEXT.md` → khi task liên quan đến scope/architecture

### Minimal Context (cho quick tasks)
```
Load in one batch simultaneously:
1. AI-GUIDE.md (file này)
2. TRACKER.md → Current State
3. File cụ thể liên quan đến task
```

### Standard Context (cho coding tasks)
```
Load in one batch simultaneously:
1. AI-GUIDE.md (file này)
2. TRACKER.md → biết đang ở đâu
3. PROJECT-CONTEXT.md → <product_vision> + phased scope (đọc TRƯỚC khi khóa thiết kế chi tiết)
4. ROADMAP.md → skim Post-MVP / Future / horizon, rồi task hiện tại
5. SYSTEM-RULES.md → coding rules
6. Schema file nếu cần
```

### Full Context (cho architecture decisions)
```
Load in one batch simultaneously:
1. AI-GUIDE.md + TRACKER.md
2. PROJECT-CONTEXT.md → domain + <product_vision> (đầy đủ)
3. ROADMAP.md → MVP phases + Post-MVP / horizon blocks
4. ARCHITECTURE.md
5. SYSTEM-RULES.md
6. Brainstorm session gốc (nếu cần rationale chi tiết, đặc biệt cho deferred capabilities)
```

### Product vision & roadmap horizon (trước khi “lock” architecture)

- **Không** để post-MVP chỉ tồn tại trong file brainstorm: sau `/vp-crystallize`, horizon phải nằm trong `ROADMAP.md` và vision theo pha trong `PROJECT-CONTEXT.md`.
- Trước task implementation sâu hoặc quyết định kiến trúc lớn: đọc `<product_vision>` và các section horizon trong `ROADMAP.md` **cùng lúc** với task hiện tại — tránh code MVP làm bế tắc bản sau hoặc bỏ sót ràng buộc đã thống nhất.

## File Relationships

```
AI-GUIDE.md (đọc đầu tiên)
     │
     ├── TRACKER.md (state hiện tại)
     │      └── points to → current phase in ROADMAP.md
     │
     ├── PROJECT-CONTEXT.md (domain + <product_vision> / phased scope)
     │      └── read early with → ROADMAP.md horizon blocks
     │
     ├── ROADMAP.md (what to do + Post-MVP / Future)
     │      └── tasks reference → schemas/
     │
     ├── SYSTEM-RULES.md (how to code)
     │      └── rules reference → ARCHITECTURE.md
     │
     ├── ARCHITECTURE.md (system design)
     │      └── decisions from → PROJECT-CONTEXT.md
     │
     └── docs/brainstorm/ (session rationale; horizon đã mirror vào ROADMAP + PROJECT-CONTEXT)
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
