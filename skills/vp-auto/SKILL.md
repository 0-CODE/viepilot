---
name: vp-auto
description: "Autonomous execution loop với control points và recovery"
version: 0.2.2
---

<host_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-auto`, `/vp-auto`, "auto", "vibe", "chạy tự động"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options tại control points.

## C. Tool Usage
Use the host's native tools for terminal/shell, file reads, glob/`rg`, patch/edit, web fetch/search, and delegation when available.

## D. Subagent Spawning
Use host-native delegation only when the runtime explicitly supports it; otherwise follow ViePilot delegate-envelope flow.
</host_skill_adapter>

<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Primary implementation lane (ENH-021)

- **`/vp-auto`** + `workflows/autonomous.md` là **lane mặc định** để **implement** work đã có **phase/task plan** (doc-first **BUG-001**, git persistence **BUG-003**). **`/vp-request`** và **`/vp-evolve`** **không** thay thế lane này trừ user **explicit** override.
</implementation_routing_guard>

<objective>
Autonomous execution theo phase/task: analyze → execute → verify → iterate; control points khi conflict, quality gate, user decision, hoặc blocker. Cập nhật `.viepilot/TRACKER.md`, `PHASE-STATE.md`, `HANDOFF.json`, `.viepilot/ROADMAP.md` khi tiến độ đổi, `CHANGELOG.md` khi có feature/fix; **git persistence** trước PASS. Chi tiết normative (state machine, recovery L1–L3, Gap G, token budget, working-directory guard, `write_scope`, phase-complete stale diagram) chỉ trong `workflows/autonomous.md` — không nhân đôi ở skill. Milestone complete: đồng bộ `docs/skills-reference.md` (skills mới) và `README.md` (badges/metrics) khi có trong repo framework.
</objective>

<execution_context>
@workflows/autonomous.md
</execution_context>

<context>
Optional flags (full detail: `docs/user/features/autonomous-mode.md`):
- `--from N` — start từ phase N
- `--phase N` — chỉ chạy phase N
- `--fast` — skip optional verifications
- `--dry-run` — plan only
</context>

<success_criteria>
- [ ] Chạy đúng quy trình trong `workflows/autonomous.md` (Initialize → phase loop → verify → state updates).
- [ ] Không paste lại các bước dài đã có trong workflow; skill chỉ routing + pointer.
- [ ] Cold-start token: xem `docs/user/features/autonomous-mode.md` (ENH-031) và `.viepilot/cold-start-manifest.json` (regen: `npm run cold-start:manifest`).
</success_criteria>
