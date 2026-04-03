---
name: vp-resume
description: "Resume work từ previous session với tiered context restore (quick/standard/full)"
version: 2.0.0
---

<host_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-resume`, `/vp-resume`, "resume", "tiếp tục", "where was i"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với options.

## C. Tool Usage
Use the host's native tools for terminal/shell, file reads, glob/`rg`, patch/edit, web fetch/search, and delegation when available.
</host_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **Khôi phục context** — không implement shipping mặc định; tiếp tục **`/vp-auto`** khi có task plan. Xem `workflows/request.md`.
</implementation_routing_guard>


<objective>
Resume work từ previous session với tiered context restore.
Tier determined by time gap since last HANDOFF.json write:
- Quick (<30min): 2 files, immediate resume
- Standard (30min–4h): 3 files, summary display
- Full (>4h): HANDOFF.log tail + active_stacks + user confirmation

**After:** Context restored, ready to continue or route to /vp-auto.
</objective>

<execution_context>
@workflows/resume.md
</execution_context>

<process>
Execute workflow from `@workflows/resume.md`
</process>

<success_criteria>
- [ ] Tier auto-detected from meta.last_written gap
- [ ] Quick restore: 2 files only (no over-loading)
- [ ] Full restore: HANDOFF.log tail + active_stacks + user confirmation
- [ ] Control point banner shown first if active
- [ ] Gracefully handles missing HANDOFF.log
- [ ] Routes to /vp-auto on user request
</success_criteria>
