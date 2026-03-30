---
name: vp-brainstorm
description: "Brainstorm session để thu thập ý tưởng, quyết định cho dự án"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-brainstorm`, `/vp-brainstorm`, hoặc yêu cầu "brainstorm"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options.

## C. Tool Usage
Use Cursor tools: `Shell`, `StrReplace`, `Read`, `Write`, `Glob`, `Grep`, `Task`
</cursor_skill_adapter>

<objective>
Thu thập ý tưởng, requirements, quyết định kiến trúc cho dự án thông qua interactive Q&A.

Hỗ trợ:
- Tạo session mới
- Tiếp tục session cũ
- Xem lại session trước đó

**Creates/Updates:**
- `docs/brainstorm/session-{YYYY-MM-DD}.md`

**After:** Ready for `/vp-crystallize`
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/brainstorm.md
</execution_context>

<context>
Optional flags:
- `--new` : Force tạo session mới
- `--continue` : Tiếp tục session gần nhất
- `--list` : Liệt kê các sessions
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/brainstorm.md`

Key steps:
1. Detect existing sessions
2. Ask user intent (new/continue/review)
3. Load context if continuing
4. Run interactive Q&A với topic-based structure
5. Save session with structured format
6. Suggest next action: `/vp-crystallize`
</process>

<success_criteria>
- [ ] Session file created/updated với đầy đủ sections
- [ ] Decisions documented với rationale
- [ ] Open questions listed
- [ ] Action items captured
- [ ] Next steps suggested
</success_criteria>
