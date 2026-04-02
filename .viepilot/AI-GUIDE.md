# ViePilot v2 — AI Navigation Guide

> **Đọc file này TRƯỚC KHI làm bất kỳ task nào.**
> File này giúp tìm đúng context mà không cần load tất cả.

*Profile binding: not configured (framework dev session — no global profile).*

## Quick Lookup

| Tôi cần... | Đọc file | Section |
|------------|----------|---------|
| Hiểu ViePilot làm gì | `PROJECT-CONTEXT.md` | `<domain_knowledge>` |
| Tầm nhìn v2 MVP / Post-MVP / Future | `PROJECT-CONTEXT.md` | `<product_vision>` |
| Roadmap + horizon | `ROADMAP.md` | Post-MVP / Product horizon |
| Kiến trúc framework | `ARCHITECTURE.md` | `## Module Architecture` |
| Đang ở phase nào | `TRACKER.md` | `## Current State` |
| Task tiếp theo | `ROADMAP.md` | Phase đang In Progress |
| Coding conventions (Markdown/YAML) | `SYSTEM-RULES.md` | `<coding_rules>` |
| Những gì KHÔNG được làm | `SYSTEM-RULES.md` | `<do_not>` |
| Decisions đã quyết định | `logs/decisions.md` | on-demand |
| Resume công việc dở | `HANDOFF.json` | - |
| Blocker history | `logs/blockers.md` | on-demand |

## Context Loading Strategy

### Minimal Context (quick tasks — S complexity)
```
Batch read (parallel, 1 turn):
1. AI-GUIDE.md (file này)
2. TRACKER.md → Current State
3. phases/{N}-{slug}/tasks/{task}.md
```

### Standard Context (coding tasks — M complexity)
```
Batch read (parallel, 1 turn):
1. AI-GUIDE.md + TRACKER.md
2. HANDOFF.json (position + recovery state)
3. phases/{N}-{slug}/PHASE-STATE.md
4. phases/{N}-{slug}/tasks/{task}.md
5. SYSTEM-RULES.md#coding_rules
```

### Full Context (architecture decisions — L/XL)
```
Batch read (parallel, 1 turn):
1. AI-GUIDE.md + TRACKER.md + HANDOFF.json
2. PROJECT-CONTEXT.md → <product_vision> (đọc TRƯỚC khi lock thiết kế)
3. ROADMAP.md → Post-MVP / Future horizon
4. ARCHITECTURE.md
5. SYSTEM-RULES.md
6. phases/{N}-{slug}/PHASE-STATE.md + task file
```

> **QUAN TRỌNG:** Đọc tất cả files trong cùng 1 batch (multiple Read tool calls in 1 turn).
> Không đọc sequential — luôn đọc parallel để tiết kiệm turns.

### Static boundary (không cần đọc lại mỗi task)
- `SYSTEM-RULES.md` framework rules → cache sau lần đầu
- `ARCHITECTURE.md` module structure → cache sau lần đầu

### Dynamic boundary (đọc mỗi task)
- `TRACKER.md` + `HANDOFF.json` + `PHASE-STATE.md` + task file

### Conditional load (chỉ khi cần)
- `logs/decisions.md` → khi cần rationale cho decision
- `logs/blockers.md` → khi `HANDOFF.json.recovery.recent_blocker == true`
- `PROJECT-CONTEXT.md` → khi task liên quan đến scope/architecture

## File Relationships

```
AI-GUIDE.md (đọc đầu tiên)
     │
     ├── TRACKER.md (state index ≤30 dòng)
     │      └── logs/ (on-demand detail)
     │
     ├── HANDOFF.json (exact position + recovery state)
     │      └── HANDOFF.log (audit trail, không cần đọc thường)
     │
     ├── PROJECT-CONTEXT.md (domain + product_vision / phased scope)
     │      └── đọc sớm với ROADMAP.md horizon
     │
     ├── ROADMAP.md (what to do + Post-MVP / Future)
     │      └── phases/{N}/ → PHASE-STATE.md → tasks/
     │
     ├── SYSTEM-RULES.md (how to write framework code)
     │
     └── ARCHITECTURE.md (module dependencies + data flow)
            └── architecture/*.mermaid (diagram sources)
```

## ViePilot-Specific Rules (lưu ý cho AI)

| Rule | Why |
|------|-----|
| Không implement mã shipping trong `/vp-request`, `/vp-evolve`, `/vp-brainstorm` | Chỉ planning/doc; execution = `/vp-auto` |
| Mọi thay đổi workflow/skill/template = commit riêng | Git history as audit trail |
| Không breaking changes với v1 projects | Non-goal của v2 |
| Skill file format (SKILL.md) giữ nguyên | Non-goal của v2 |
| Test verify: manual skill invocation sau mỗi Phase | Framework không có automated test runner |

## Commands Reference

| Command | Dùng khi |
|---------|----------|
| `/vp-status` | Xem progress nhanh |
| `/vp-auto` | Chạy autonomous |
| `/vp-pause` | Dừng, lưu state |
| `/vp-resume` | Tiếp tục từ pause |
| `/vp-evolve` | Thêm features/milestone mới |
| `/vp-request` | Log bug/feature/enhancement |
