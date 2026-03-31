---
name: vp-ui-components
description: "Quản lý workflow sưu tầm và tái sử dụng UI components"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-ui-components`, `/vp-ui-components`, "ui components", "component library", "21st.dev component"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>

<objective>
Thu thập, phân loại, và lưu trữ UI components để tái sử dụng:
- Global library: `~/.viepilot/ui-components/`
- Project library: `.viepilot/ui-components/`

Nguồn có thể đến từ prompt/link/snippet (đặc biệt 21st.dev), sau đó chuẩn hóa thành artifacts có metadata.

**Creates/Updates:**
- `~/.viepilot/ui-components/{category}/{component-id}/...`
- `.viepilot/ui-components/{category}/{component-id}/...`
- `INDEX.md` cho global + local store

**After:** Component có thể dùng lại cho `/vp-brainstorm --ui` và `/vp-crystallize`.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/ui-components.md
</execution_context>

<context>
Optional flags:
- `--add` : Add/capture component mới
- `--list` : Liệt kê component theo category
- `--sync` : Đồng bộ global ↔ local index
- `--from-21st` : Ưu tiên flow ingest từ 21st.dev references
- `--approve` : Mark component status thành approved
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/ui-components.md`

Key steps:
1. Prepare global + local component stores
2. Collect source input (prompt/link/snippet + intent)
3. Classify component taxonomy
4. Write standardized artifacts (README, SOURCE, html/css, metadata)
5. Update indexes
6. Connect selected IDs to brainstorm/crystallize context
</process>

<success_criteria>
- [ ] Component stored with taxonomy + metadata
- [ ] Global and local indexes updated
- [ ] Source provenance documented
- [ ] Reuse-ready for next brainstorm and crystallize runs
</success_criteria>
