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

## Progress Summary

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 7. Hotfix — Working Directory Guard (BUG-007) | ✅ Complete | 3 | 3 | 100% |
| 8. ENH-022 — Crystallize Domain Entity Extraction | ✅ Complete | 4 | 4 | 100% |
| 9. Brainstorm Artifact Manifest | ✅ Complete | 7 | 7 | 100% |
| 10. Gap E + Gap G Extended + Token Budget | 🔄 In Progress | 6 | 3 | 50% |
| 11. Diagram Profile System | 🔲 Not Started | 5 | 0 | 0% |
| 12. Verification + Docs + Release | 🔲 Not Started | 5 | 0 | 0% |

**Overall**: 19 / 30 tasks (63%)

---

## Post-v2.1 / Product Horizon

### Tier 2 (v2.2 candidates)
- **AutoDream → STACKS.md** — Phase complete hook → extract patterns → append STACKS.md. Depends on: Phase 9 (Artifact Manifest) proven stable.
- **Fork State Updates** — Background Agent pattern for state writes after task PASS. Risk: medium (state drift potential). Depends on: Phase 12 baseline stable.
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
