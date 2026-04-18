---
name: vp-ui-components
description: "Manage workflow for collecting and reusing UI components"
version: 0.1.1
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-UI-COMPONENTS  v0.1.1 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-ui-components`, `/vp-ui-components`, "ui components", "component library", "21st.dev component"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **Curation** `ui-components/` + metadata — does not implement full app feature / default framework shipping; large changes go through **`/vp-evolve`** → **`/vp-auto`**. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Collect, classify, and store UI components for reuse:
- Global library: `~/.viepilot/ui-components/`
- Project library: `.viepilot/ui-components/`

Sources can come from prompt/link/snippet (especially 21st.dev), then normalized into artifacts with metadata.

**Creates/Updates:**
- `~/.viepilot/ui-components/{category}/{component-id}/...`
- `.viepilot/ui-components/{category}/{component-id}/...`
- `INDEX.md` for global + local store

**After:** Component is reusable for `/vp-brainstorm --ui` and `/vp-crystallize`.
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/ui-components.md
</execution_context>

<context>
Optional flags:
- `--add` : Add/capture new component
- `--list` : List components by category
- `--sync` : Sync global ↔ local index
- `--from-21st` : Prioritize ingest flow from 21st.dev references
- `--approve` : Mark component status as approved
</context>

<process>
Execute workflow from `@$HOME/{envToolDir}/workflows/ui-components.md`

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
