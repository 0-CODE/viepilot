# ViePilot — Roadmap

## Milestone: v2.1 Post-MVP Core

### Overview
- **Version target**: 2.1.0
- **Goal**: Fix critical framework gaps (BUG-007, ENH-022) + Tier 1 Post-MVP epics (Artifact Manifest, Gap E, Gap G Extended, Token Budget Awareness) + Diagram Profile System
- **Phases**: 6
- **Status**: In Progress

---

### Phase 7: Hotfix — Working Directory Guard (BUG-007) ✅ Complete (v2.0.3)

**Goal**: Prevent vp-auto from editing install paths (`~/.claude/viepilot/`, `~/.cursor/viepilot/`) instead of codebase source
**Estimated Tasks**: 3
**Dependencies**: None (critical safety fix)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 7.1 | autonomous.md — Working Directory Guard block | Guard block present in Initialize section; detects path outside `{project_cwd}` → control point; install path edit = hard stop | M |
| 7.2 | AI-GUIDE.md template — Install path READ-ONLY note | Static Context section has explicit warning: "~/.*/viepilot/ = READ-ONLY, never write" | S |
| 7.3 | Version bump 2.0.2 → 2.0.3 + CHANGELOG | package.json=2.0.3; CHANGELOG [2.0.3] entry; BUG-007 resolved; git tag viepilot-vp-p7-complete | S |

**Verification**:
- [ ] `grep -n 'Working Directory Guard' workflows/autonomous.md` → match found
- [ ] `grep -n 'READ-ONLY' templates/project/AI-GUIDE.md` → match in install path warning
- [ ] `node -p "require('./package.json').version"` → `2.0.3`

---

### Phase 8: ENH-022 — Crystallize Domain Entity Extraction ✅ Complete (v2.1.0)

**Goal**: Add explicit domain entity extraction step + dependency validation to crystallize.md — prevent skipping CRUD management service phases
**Estimated Tasks**: 4
**Dependencies**: Phase 7

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 8.1 | crystallize.md — Domain Entity Extraction step (Fix A) | Explicit step: scan brainstorm → list entities with needs_crud_api flag → check service phase exists | M |
| 8.2 | crystallize.md — Dependency Validation step (Fix C) | Cross-check step: task descriptions scan for "resolve/create/manage {entity}" → warn if no service phase | M |
| 8.3 | crystallize.md — Entity manifest output format | Entity manifest table in SPEC.md output: entity, type, service_phase or MISSING | S |
| 8.4 | Version bump 2.0.3 → 2.1.0 + CHANGELOG | package.json=2.1.0; CHANGELOG [2.1.0] entry; ENH-022 resolved; first v2.1 feature | S |

**Verification**:
- [ ] `grep -n 'Domain Entity Extraction' workflows/crystallize.md` → match found
- [ ] `grep -n 'Dependency Validation' workflows/crystallize.md` → match found
- [ ] `node -p "require('./package.json').version"` → `2.1.0`

---

### Phase 9: Brainstorm Artifact Manifest
**Goal**: Implement manifest schema + brainstorm auto-generation + crystallize mandatory consume — fix 4 brainstorm→crystallize→vp-auto drop points. Includes ENH-030: domain_entities + tech_stack artifact types.
**Estimated Tasks**: 7
**Dependencies**: Phase 8

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 9.1 | Define `brainstorm-manifest.json` schema v1 | Schema file at `templates/project/brainstorm-manifest.json`; all fields: sessions, artifacts (ui_direction, product_horizon, research_notes, architecture_inputs), ui_task_context_hint ✅ done | M |
| 9.2 | brainstorm.md — Auto-generate manifest on `/save` + `/end` + ENH-030 schema update | Manifest written to `.viepilot/brainstorm-manifest.json`; artifact entries auto-populated from session; `consumed: false` on new artifacts; **schema template updated** to include `domain_entities` (required:true) + `tech_stack` (required:true) + `compliance_domains` (required:false) | M |
| 9.3 | crystallize.md — Step 0A: mandatory manifest consume | Step 0A reads manifest before all other steps; fallback if manifest missing; marks `consumed: true` + `consumed_at` after reading | M |
| 9.4 | crystallize.md — Auto-populate TASK.md `context_required` from `ui_task_context_hint` | Tasks for UI pages have correct ui-direction paths in `context_required`; no more placeholder-only rows | M |
| 9.5 | brainstorm.md — Decision anchor syntax (`vp:decision`) | `/save` scans Decisions blocks → injects HTML comment anchors; backfill for existing bullets | M |
| 9.6 | crystallize.md — Consumed anchor tracking (`vp:consumed`) | ARCHITECTURE.md consumed sections tagged; drift check stub (full drift = Post-v2.1) | S |
| 9.7 | Version bump 2.1.0 → 2.1.1 + CHANGELOG | package.json=2.1.1; CHANGELOG [2.1.1] entry; Phase 9 complete | S |

**Verification**:
- [ ] `cat .viepilot/brainstorm-manifest.json` → valid JSON, consumed=false on fresh session
- [ ] crystallize on project with manifest → ARCHITECTURE.md has consumed anchors
- [ ] TASK.md for UI page task → context_required has ui-direction path auto-populated
- [ ] `/save` in brainstorm session → manifest updated, `vp:decision` anchors present

---

### Phase 10: Gap E + Gap G Extended + Token Budget Awareness
**Goal**: Three Tier 1 Post-MVP epics bundled — cross-project status, compliance keyword scan, context limit preemption
**Estimated Tasks**: 6
**Dependencies**: Phase 8

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 10.1 | `~/.viepilot/project-registry.json` schema + vp-crystallize auto-register | Schema defined; crystallize registers project on first run; manual add/remove documented | S |
| 10.2 | vp-status skill — `--all` flag: aggregate from registry | `--all` reads registry → TRACKER.md + HANDOFF.json per project → table with status icons (● ⚠ ✓ ○) | M |
| 10.3 | autonomous.md — Token budget awareness: sub-task check | After each sub-task: heuristic context estimate; >70% → warn + offer pause; >90% → force pause + HANDOFF write | M |
| 10.4 | HANDOFF.log — `token_budget_warning` event | Event emitted with `used_pct` field; logged non-blocking | S |
| 10.5 | crystallize.md + autonomous.md — Gap G Extended keyword scan | Compliance keywords list (password, token, session, encrypt, stripe, payment, bcrypt, tls, migration, schema); match → suggest `L3.block=true` + warn; user confirms | S |
| 10.6 | Version bump 2.1.1 → 2.1.2 + CHANGELOG | package.json=2.1.2; CHANGELOG [2.1.2] entry; Phase 10 complete | S |

**Verification**:
- [ ] `cat ~/.viepilot/project-registry.json` → project entry after crystallize
- [ ] `/vp-status --all` → table with all registered projects
- [ ] `grep -n 'token_budget' workflows/autonomous.md` → match in sub-task section
- [ ] crystallize on task with "stripe payment" description → L3.block suggested (not auto-set)

---

### Phase 11: Diagram Profile System
**Goal**: Stack-aware architecture diagram generation — crystallize detects stacks → generates applicability matrix → folder structure; vp-auto updates stale diagrams at phase complete
**Estimated Tasks**: 5
**Dependencies**: Phase 8

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 11.1 | crystallize.md — Stack detection → diagram profile selection | Stack matrix table in crystallize.md; detects: microservices, Kafka, SQL, SPA, auth, state-heavy entities | M |
| 11.2 | crystallize.md — Generate diagram applicability matrix in SPEC.md | SPEC.md includes diagram inventory table: diagram_type, applies_when, folder_path, status | M |
| 11.3 | crystallize.md — Create architecture folder structure per profile | `architecture/cross/`, `architecture/backend/`, `architecture/frontend/`, `architecture/sequences/`, `architecture/state-machines/` created with stubs | S |
| 11.4 | autonomous.md — Stale diagram detection + update trigger | After phase complete: check phase touches architecture subfolder → flag stale diagrams → update at phase end (not per task) | M |
| 11.5 | Version bump 2.1.2 → 2.1.3 + CHANGELOG | package.json=2.1.3; CHANGELOG [2.1.3] entry; Phase 11 complete | S |

**Verification**:
- [ ] crystallize on microservice + Kafka project → `architecture/cross/`, `architecture/backend/` dirs created
- [ ] crystallize output includes diagram applicability matrix in SPEC.md
- [ ] `grep -n 'stale diagram' workflows/autonomous.md` → match in phase complete section
- [ ] vp-auto phase complete → relevant diagrams updated

---

### Phase 12: Verification + Docs + v2.1.0 Final Release
**Goal**: Integration tests, doc updates, README sync, final version tag
**Estimated Tasks**: 5
**Dependencies**: Phases 7-11

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 12.1 | Integration test: BUG-007 guard triggers correctly | Attempt install path edit → control point; codebase edit passes | S |
| 12.2 | Integration test: ENH-022 entity extraction on sample project | crystallize on sample with domain entities → entity manifest + dependency warning | S |
| 12.3 | Update docs: autonomous-mode.md, quick-start.md, advanced-usage.md | Working directory guard, artifact manifest, diagram profiles documented | M |
| 12.4 | README.md sync | Version badge 2.1.0; feature list updated; `npm run readme:sync` if exists | S |
| 12.5 | Final version bump → 2.1.0 + git tag | package.json=2.1.0 (or already set); CHANGELOG [2.1.0] final; git tag viepilot-vp-v2.1.0 | S |

**Verification**:
- [ ] All integration tests PASS
- [ ] README version = 2.1.0
- [ ] `git tag` → viepilot-vp-v2.1.0 present

---

### Phase 13: Agent Orchestration — Tier A + Tier B (context isolation)
**Goal**: Giảm context rot trong vp-auto bằng **re-hydrate ranh giới task** (Tier A) và chuẩn **delegate envelope** file-based `.viepilot/delegates/` (Tier B), theo `docs/brainstorm/session-2026-04-03.md` Part 5 Topics 19–20. Tier C/D (host fork, async) tách sang Post-v2.1 / ENH-024–025.

**Estimated Tasks**: 4
**Dependencies**: Phase 8 complete; khuyến nghị hoàn Phase 10 trước khi ship để tránh xung đột merge trên `autonomous.md`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 13.1 | `autonomous.md` — task-boundary mandatory re-hydrate (Tier A) | Trước mỗi task (hoặc ngay sau PASS trước): bắt buộc batch-read `TASK.md` hiện tại + slice `PHASE-STATE` + `HANDOFF.json` + `context_required` từ task; không dựa vào bộ nhớ phiên sau chuỗi dài | M |
| 13.2 | Templates — delegate envelope schema + `pending`/`done` samples | `templates/project/delegates/README.md` + JSON schema hoặc mẫu tối thiểu (`charter`, `mode`, `write_scope`, output fields); crystallize/install copy vào project nếu policy có | M |
| 13.3 | `AI-GUIDE.md` template + `autonomous-mode.md` — delegate merge checklist | Hướng dẫn main chỉ merge từ `delegates/done/{id}.json`; read-only default; write subset + drift check | S |
| 13.4 | Unit tests — contract grep / JSON schema smoke | Test đảm bảo section Tier A tồn tại trong `autonomous.md` sau ship; optional validate mẫu delegate JSON | S |

**Verification**:
- [ ] `grep -n 're-hydrate\|rehydrate\|task-boundary'` workflows/autonomous.md → match (hoặc tên step tương đương đã thống nhất khi implement)
- [ ] `templates/project/delegates/` tồn tại với mẫu `pending` + `done`
- [ ] `templates/project/AI-GUIDE.md` có subsection delegate merge
- [ ] `npm test` PASS (suite mới nếu có)

**Related**: ENH-023 (hooks — bổ trợ), ENH-024 (async state — Tier D overlap), brainstorm Topic 20 Related ENH table

---

### Dependency graph (ENH-023–028 — tách phase)
```
Wave A (độc lập):  Phase 14 (ENH-027)  Phase 15 (ENH-023)
                         │                    (không chặn 028)
                         ▼
Wave B:            Phase 16 (ENH-028) — bắt buộc sau Phase 14
                         ▼
Wave C:            Phase 17 (ENH-026) — autonomous.md; khuyến nghị sau 16 (ít conflict với crystallize)
                         ▼
Wave D:            Phase 18 (ENH-024)
                         ▼
Wave E:            Phase 19 (ENH-025)
```
**Khuyến nghị thứ tự vp-auto**: 14 → 15 → 16 → 17 → 18 → 19 (15 có thể hoán với 14 nếu cần, nhưng 16 **phải** sau 14).

---

### Phase 14: ENH-027 — vp-tools `ask` (TUI)
**Goal**: `vp-tools ask` + `@clack/prompts`; tích hợp brainstorm demo.
**Estimated Tasks**: 1 | **Dependencies**: Phase 8+

| Task | Description | Complexity |
|------|-------------|------------|
| 14.1 | `bin/vp-tools.cjs ask` `--single` / `--multi`; TTY fallback; `workflows/brainstorm.md` + `skills/vp-brainstorm` hook tối thiểu | M |

**Related**: `.viepilot/requests/ENH-027.md`

---

### Phase 15: ENH-023 — handoff-sync + hooks
**Goal**: `vp-tools handoff-sync`; doc hooks; note `autonomous.md`.
**Estimated Tasks**: 1 | **Dependencies**: Phase 8+ _(độc lập với Phase 14)_

| Task | Description | Complexity |
|------|-------------|------------|
| 15.1 | `handoff-sync --check` / `--force`; template hooks; crystallize/README nếu cần | M |

**Related**: `.viepilot/requests/ENH-023.md`

---

### Phase 16: ENH-028 — crystallize Review Gate
**Goal**: Tách extraction / generation; `review_gate`; `--no-review`, `--extract-only`; dùng `vp-tools ask` khi có TTY.
**Estimated Tasks**: 1 | **Dependencies**: **Phase 14** (027)

| Task | Description | Complexity |
|------|-------------|------------|
| 16.1 | `crystallize.md` + skill crystallize — review gate step | L |

**Related**: `.viepilot/requests/ENH-028.md`

---

### Phase 17: ENH-026 — Plan mode + doc-first gate
**Goal**: Hướng dẫn Plan mode Claude Code cho BUG-001 / doc-first.
**Estimated Tasks**: 1 | **Dependencies**: **Phase 16** _(khuyến nghị — giảm merge song song với 028)_

| Task | Description | Complexity |
|------|-------------|------------|
| 17.1 | `autonomous.md` + `docs/user/features/autonomous-mode.md` | S |

**Related**: `.viepilot/requests/ENH-026.md`

---

### Phase 18: ENH-024 — Fork State Updates (`run_in_background`)
**Goal**: Pattern state write nền + fallback sync.
**Estimated Tasks**: 1 | **Dependencies**: **Phase 17**

| Task | Description | Complexity |
|------|-------------|------------|
| 18.1 | `autonomous.md` — Fork State Update block | M |

**Related**: `.viepilot/requests/ENH-024.md`

---

### Phase 19: ENH-025 — Worktree isolation L/XL
**Goal**: Offer worktree; field `worktree_isolation` trong TASK template.
**Estimated Tasks**: 1 | **Dependencies**: **Phase 18**

| Task | Description | Complexity |
|------|-------------|------------|
| 19.1 | `autonomous.md` + `templates/phase/TASK.md` | M |

**Related**: `.viepilot/requests/ENH-025.md`

---

## Progress Summary

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 7. Hotfix — Working Directory Guard (BUG-007) | ✅ Complete | 3 | 3 | 100% |
| 8. ENH-022 — Crystallize Domain Entity Extraction | ✅ Complete | 4 | 4 | 100% |
| 9. Brainstorm Artifact Manifest | ✅ Complete | 7 | 7 | 100% |
| 10. Gap E + Gap G Extended + Token Budget | 🔄 In Progress | 6 | 5 | 83% |
| 11. Diagram Profile System | 🔲 Not Started | 5 | 0 | 0% |
| 12. Verification + Docs + Release | 🔲 Not Started | 5 | 0 | 0% |
| 13. Agent Orchestration Tier A + B | 🔲 Not Started | 4 | 0 | 0% |
| 14. ENH-027 — vp-tools ask | 🔲 Not Started | 1 | 0 | 0% |
| 15. ENH-023 — handoff-sync + hooks | 🔲 Not Started | 1 | 0 | 0% |
| 16. ENH-028 — crystallize Review Gate | 🔲 Not Started | 1 | 0 | 0% |
| 17. ENH-026 — Plan mode doc-first | 🔲 Not Started | 1 | 0 | 0% |
| 18. ENH-024 — Fork state background | 🔲 Not Started | 1 | 0 | 0% |
| 19. ENH-025 — Worktree L/XL | 🔲 Not Started | 1 | 0 | 0% |

**Overall**: 21 / 40 tasks (52%)

---

## Post-v2.1 / Product Horizon

### Tier 2 (v2.2 candidates)
- **AutoDream → STACKS.md** — Phase complete hook → extract patterns → append STACKS.md. Depends on: Phase 9 (Artifact Manifest) proven stable.
- **Fork State Updates** — **Phase 18** (ENH-024); risk/medium như request gốc.
- **Brainstorm doc-drift detection** — Full drift report UI (per-item action). Depends on: Phase 9 (anchor syntax).
- **Multi-session manifest merge** — oldest→newest per artifact type strategy. Depends on: Phase 9.

### Tier 3 (Future / Defer)
- **Parallel task execution** — dependency graph + concurrent agents. Depends on: Fork State Updates proven.
- **Team memory sync** — shared TRACKER + decision log. Needs server infra decision.
- **ML-based auto-approval** — bypass control point for low-risk tasks. Needs historical data.
- **Multi-agent coordinator** — AI orchestrating AI for complex phases.
- **Gap F: Career documentation** — Export `logs/decisions.md` across projects.

### Non-goals for v2.1
- Breaking changes với v2.0.x projects
- Server deployment / network service (keep local-first)
- Rewrite vp-tools CLI
- Parallel task execution (Tier 3)

---

## Notes
- Created: 2026-04-03
- Last Updated: 2026-04-03
- Previous milestone archived at: `.viepilot/milestones/v2/`
- **Horizon**: Keep Tier 2/3 in sync với `PROJECT-CONTEXT.md` Product vision.
