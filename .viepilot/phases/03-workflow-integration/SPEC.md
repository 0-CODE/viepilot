# Phase 3: Workflow Integration — Skills & Commands

## Overview
- **Goal**: Update vp-resume, vp-status, vp-request, crystallize, vp-evolve để support v2 artifacts; add paths: frontmatter
- **Dependencies**: Phase 1 (v2 templates), Phase 2 (HANDOFF v2 schema + log)
- **Estimated Tasks**: 8

## Objective

Phase 2 đã build execution engine. Phase này tích hợp các workflow/skill khác để hỗ trợ đầy đủ v2 format:
- vp-resume: đọc HANDOFF.json v2 + active_stacks + tiered restore
- vp-status: detect control_point.active + hiển thị recovery stats
- vp-request: NLP intake thay menu-first; horizon-aware routing
- crystallize: auto-populate v2 fields + compliance detection
- vp-evolve: generate v2 TASK.md template
- paths: frontmatter cho conditional skill activation

## Scope

### In Scope
- `workflows/resume.md` (tiered restore logic)
- `skills/vp-resume/SKILL.md` (paths: frontmatter)
- `workflows/autonomous.md` (HANDOFF.log rotation hook — complement to Phase 2)
- `skills/vp-auto/SKILL.md` (paths: frontmatter)
- `skills/vp-request/SKILL.md` (paths: frontmatter)
- `workflows/request.md` (NLP intake rewrite)
- `workflows/crystallize.md` (Step 9 auto-populate + Gap G)
- `workflows/evolve.md` (v2 template generation)
- `skills/vp-evolve/SKILL.md` (paths: frontmatter)
- `skills/vp-status/SKILL.md` (paths: frontmatter)

### Out of Scope
- Phase 4 integration tests
- Documentation updates (Phase 4)

## Requirements

### Functional — vp-resume (Task 3.2)
- **Tier detection**: Calculate gap từ `HANDOFF.json.meta.last_written` đến now
- **Quick (<30min)**: Read HANDOFF.json position + PHASE-STATE.md current task → resume
- **Standard (30min–4h)**: Read HANDOFF.json (full) + PHASE-STATE.md + current TASK.md → context summary
- **Full (>4h)**: Above + `context.active_stacks` context load + tail 20 events từ HANDOFF.log

### Functional — vp-status (Task 3.3)
- Check `HANDOFF.json.control_point.active` → display [CONTROL POINT ACTIVE] banner
- Show L1/L2/L3 attempt counts from `HANDOFF.json.recovery.*`

### Functional — vp-request (Task 3.6 — NLP intake)
- Description-first flow (không menu đầu tiên)
- Confidence bands: ≥85% auto-classify; 60-84% = 1 targeted question; <60% = top-3 options
- Context boost: `HANDOFF.json.control_point.active == true` → +20% BUG probability
- UI direction detection: keywords (UI/UX/giao diện/landing page/prototype) → suggest `/vp-brainstorm --ui`
- Horizon-aware routing: check `ROADMAP.md` Post-MVP section trước khi route XL requests

### Functional — crystallize (Task 3.4a — Gap A + Gap G)
- Step 9 auto-populate: infer `type` từ task description; infer `write_scope` từ phase context; set `recovery_budget` từ complexity
- Gap G: scan `write_scope` paths for compliance domains → auto-set `recovery_overrides.L3.block = true` + reason
- Compliance domains MVP: auth, payment, data (migrations), crypto

### Functional — vp-evolve (Task 3.5)
- When adding feature/phase: use updated TASK.md template (v2 fields included)
- Pre-populate `type: build` as default for new feature tasks

### Functional — paths: frontmatter (Task 3.7)
- vp-auto: `paths: [".viepilot/TRACKER.md"]`
- vp-resume: `paths: [".viepilot/HANDOFF.json"]`
- vp-request: `paths: [".viepilot/"]` (any .viepilot project)
- vp-status: `paths: [".viepilot/TRACKER.md"]`
- vp-evolve: `paths: [".viepilot/ROADMAP.md"]`

### Functional — HANDOFF.log rotation (Task 3.1)
- `.gitignore` entries: `.viepilot/HANDOFF.log`, `.viepilot/logs/handoff-*.log`
- Rotation: khi phase complete → `mv HANDOFF.log logs/handoff-phase-{N}.log` → create fresh HANDOFF.log
- Rotation hook trong autonomous.md phase-complete step

## Acceptance Criteria
- [ ] All 8 tasks PASS
- [ ] vp-resume: gap <30min test → only reads HANDOFF.json + PHASE-STATE.md
- [ ] vp-resume: gap >4h test → reads HANDOFF.log tail + active_stacks
- [ ] vp-request: error description → BUG auto (≥85% confidence)
- [ ] vp-request: "UI design landing page" → suggest /vp-brainstorm --ui route
- [ ] crystallize: new project task with write_scope "/auth/" → L3.block = true in TASK.md
- [ ] crystallize: write_scope auto-populated (not empty placeholder)
- [ ] HANDOFF.log gitignored (git status clean after task)
- [ ] paths: frontmatter present in 5 skill SKILL.md files

## Technical Notes

### NLP Confidence Signal Weights
```yaml
HIGH_SIGNAL (+30%): error/exception/crash → BUG; "thêm tính năng" → FEATURE
MEDIUM_SIGNAL (+15%): "cải thiện"/"improve" → ENHANCE or DEBT
CONTEXT_SIGNAL (+20%): control_point.active == true → BUG
```

## References
- Architecture: `.viepilot/ARCHITECTURE.md` (Module Dependencies)
- Brainstorm: `docs/brainstorm/session-2026-04-02.md` → Topics 12, 15, 16, 18
