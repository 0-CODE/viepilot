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
<version_check>
## Version Update Check (ENH-072)

After displaying the greeting banner, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" check-update --silent
```

**If exit code = 1** (update available — new version printed to stdout):
Display notice banner before any other output:
```
┌──────────────────────────────────────────────────────────────────┐
│ ✨ ViePilot {latest_version} available  (installed: {current})   │
│    npm i -g viepilot && vp-tools install --target {adapter_id}   │
└──────────────────────────────────────────────────────────────────┘
```
Replace `{latest_version}` with stdout from the command, `{current}` with the installed
version, `{adapter_id}` with the active adapter (claude-code / cursor / antigravity / codex / copilot).

**If exit code = 0 or command unavailable**: silent, continue.

**Suppression rules:**
- `--no-update-check` flag on skill invocation → skip this step entirely
- `config.json` → `update.check: false` → skip this step entirely
- Show at most once per session (`update_check_done` session guard)
</version_check>
<persona_context>
## Persona Context Injection (ENH-073)
At skill start, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
Inject the output as `## User Persona` context before any task execution.
Silent if command unavailable or errors.
</persona_context>


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
