# ViePilot — Roadmap

## Milestone: v2 MVP

### Overview
- **Version**: 2.0.0
- **Goal**: Upgrade ViePilot execution layer với typed state machine, layered recovery, continuous state, và improved workflow integration
- **Phases**: 4
- **Status**: In Progress

---

### Phase 1: Foundation — Templates & State Machine ✅
**Goal**: Refactor tất cả core templates để support v2 metadata fields và kiến trúc mới
**Estimated Tasks**: 6 / 6 complete
**Dependencies**: None

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 1.1 | Refactor TRACKER.md template → index ≤30 dòng + logs/ structure | Template ≤30 lines; logs/ dir referenced; no inline Decision Log | S |
| 1.2 | Tạo logs/ templates: decisions.md, blockers.md, version-history.md | 3 template files exist; crystallize generates them | S |
| 1.3 | Refactor PHASE-STATE.md → execution_state YAML block + sub-task tracking | execution_state block với typed transitions; sub-task table present | M |
| 1.4 | Refactor TASK.md → type, write_scope, recovery_budget, can_parallel_with, recovery_overrides | All 5 new fields present; recovery_overrides includes L3.block + reason | M |
| 1.5 | Refactor AI-GUIDE.md → static/dynamic boundary comment | Static vs dynamic sections labeled; parallel batch instruction present | S |
| 1.6 | Refactor HANDOFF.json schema v2 | Schema includes position.sub_task, recovery.*, context.active_stacks, control_point.*, meta | M |

**Verification**:
- [ ] crystallize tạo được project với tất cả v2 templates
- [ ] v1 project cũ vẫn compatible (kiểm tra optional field handling)
- [ ] TRACKER.md ≤30 dòng sau khi populate

---

### Phase 2: Execution Engine — vp-auto Rewrite ✅

**Goal**: Refactor autonomous.md thành typed state machine với 3-layer recovery, continuous HANDOFF, parallel loading, và scope enforcement
**Estimated Tasks**: 9
**Dependencies**: Phase 1

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 2.1 | 3-layer silent recovery + Gap G compliance pre-flight | L1/L2/L3 layers implement; compliance paths auto-warn; budget enforced | L |
| 2.2 | Typed state transitions thay thế prose workflow | States: executing/recovering_l1/l2/l3/control_point/pass/skip; no prose transitions | M |
| 2.3 | Continuous HANDOFF.json write + Gap D HANDOFF.log events | HANDOFF.json written after each sub-task; log events emitted non-blocking | M |
| 2.4 | Parallel context loading | All context reads in 1 batch instruction; static/dynamic split documented | S |
| 2.5 | Sub-task tracking table update trong PHASE-STATE.md | PHASE-STATE.md updated after each sub-task PASS/FAIL | S |
| 2.6 | 3-tier validation pipeline | Strict order: contract → write_scope lock → git gate; each tier documented | M |
| 2.7 | Control point state protocol | HANDOFF.json.control_point.active set correctly; vp-status can detect | S |
| 2.8 | Scope drift detection | Post-task: check AI writes vs write_scope; log violation; surface to control point | M |
| 2.9 | Recovery budget enforcement | Parse recovery_budget + recovery_overrides; cap L1/L2/L3 attempts correctly | M |

**Verification**:
- [ ] Run vp-auto trên test project: silent recovery fires on lint error (không surface to user)
- [ ] HANDOFF.json present sau mỗi sub-task complete
- [ ] HANDOFF.log có events sau task complete
- [ ] Compliance path task: L3 blocked (no scope reduction attempted)
- [ ] Context load: all files read in 1 turn (check tool call count)

---

### Phase 3: Workflow Integration — Skills & Commands ✅
**Goal**: Update vp-resume, vp-status, vp-request, crystallize, và vp-evolve để support v2 artifacts
**Estimated Tasks**: 8
**Dependencies**: Phase 1, Phase 2

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 3.1 | HANDOFF.log implementation + gitignore + phase-boundary rotation | .gitignore entries; rotation hook in autonomous.md; archive to logs/ | S |
| 3.2 | vp-resume tiered context restore | 3 tiers: <30min/30min-4h/>4h; active_stacks loaded on full tier | M |
| 3.3 | vp-status: control point detection + recovery stats | Detects control_point.active; shows L1/L2/L3 attempt counts | S |
| 3.4a | crystallize: v2 artifacts + Gap A auto-populate + Gap G compliance | New templates used; write_scope/type/recovery_budget auto-populated; compliance auto-blocked | M |
| 3.4b | crystallize backward compat verification | v1 project structure not broken; old crystallize output still valid | S |
| 3.5 | vp-evolve: generate v2 TASK.md template | New feature/phase tasks use v2 TASK.md with all new fields | S |
| 3.6 | vp-request NLP intake rewrite + Gap C + horizon-aware routing | Description-first; 2-band confidence; UI direction detection; ROADMAP horizon check | L |
| 3.7 | paths: frontmatter cho vp-* skills | vp-auto/vp-resume/vp-request/vp-evolve có paths: field | S |

**Verification**:
- [ ] vp-resume: gap <30min → quick restore (HANDOFF.json only)
- [ ] vp-resume: gap >4h → full restore với active_stacks
- [ ] vp-request: "có lỗi khi chạy task 2" → BUG auto-detect ≥85% confidence
- [ ] crystallize: TASK.md có write_scope populated sau crystallize (không manual)
- [ ] crystallize: task với write_scope "/auth/" → recovery_overrides.L3.block = true auto-set

---

### Phase 4: Verification & Documentation ✅
**Goal**: Integration testing, user docs update, stale ref cleanup, version bump
**Estimated Tasks**: 11
**Dependencies**: Phase 1, 2, 3

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 4.1a | Integration test: small S/M project | End-to-end: brainstorm → crystallize → auto → PASS; silent recovery fires once | M |
| 4.1b | Integration test: large L/XL project | Multi-phase; HANDOFF continuity across context resets; scope lock enforced | M |
| 4.1c | Integration test: context reset simulation | Kill session mid-task → vp-resume → continue from exact position | S |
| 4.1d | Integration test: compliance domain | Auth task → L3 auto-blocked; verify via HANDOFF.log | S |
| 4.2 | Update autonomous-mode.md | Recovery layers, control point protocol, scope contract documented | S |
| 4.3 | Update quick-start.md | TASK.md new fields, TRACKER.md new structure, HANDOFF.log rotation | S |
| 4.4 | Update advanced-usage.md | recovery_overrides customization patterns; write_scope examples | S |
| 4.5 | CHANGELOG.md v2 entry | [Unreleased] → [2.0.0] với full feature list | S |
| 4.6a | Stale reference audit: SKILL.md files | All skill files reference correct workflow paths | S |
| 4.6b | Stale reference audit: workflow cross-references | All workflow files reference correct template/artifact paths | S |
| 4.7 | Version bump 1.x → 2.0.0 | TRACKER, README, CHANGELOG all reflect 2.0.0 | S |

**Verification**:
- [ ] All 4 integration tests PASS
- [ ] Docs review: quick-start runnable by Day 1 user
- [ ] No stale file references found (all paths resolve)
- [ ] CHANGELOG.md has complete v2.0.0 entry
- [ ] git tag v2.0.0 created

---

### Phase 5: Hotfix — Install Path Convention + Logic Gaps
**Goal**: Fix critical install path bugs (BUG-A, BUG-B) found by post-v2.0.0 audit + minor logic gaps
**Estimated Tasks**: 5
**Dependencies**: Phase 1, 2, 3, 4

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 5.1 | Revert SKILL.md source path convention | All 14 SKILL.md have `.cursor/viepilot/` (not `.claude/`); Cursor installs work | S |
| 5.2 | Revert crystallize.md workflow path | crystallize.md has `.cursor/viepilot/templates/`; 0 `.claude/` refs | S |
| 5.3 | Fix install script — workflow rewrite step | `buildInstallPlan` emits 3 rewrite_paths steps for claude-code target | M |
| 5.4 | Fix HANDOFF.log event naming gaps | `control_point_enter/exit` events present; task_skip + recovery events in JSON format | S |
| 5.5 | Version bump 2.0.0 → 2.0.1 + CHANGELOG | package.json = 2.0.1; CHANGELOG [2.0.1] entry; git tag v2.0.1 | S |

**Verification**:
- [ ] `grep -r '\.claude/viepilot/' skills/vp-*/SKILL.md` → 0 results
- [ ] Cursor install simulation: skills dir contains `.cursor/viepilot/` paths
- [ ] Claude Code install simulation: skills dir contains `.claude/viepilot/` paths AND workflows dir also rewritten
- [ ] `control_point_enter` and `control_point_exit` in autonomous.md
- [ ] git tag v2.0.1 created

---

## Progress Summary

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 1. Foundation — Templates & State Machine | ✅ Complete | 6 | 6 | 100% |
| 2. Execution Engine — vp-auto Rewrite | ✅ Complete | 9 | 9 | 100% |
| 3. Workflow Integration — Skills & Commands | ✅ Complete | 8 | 8 | 100% |
| 4. Verification & Documentation | ✅ Complete | 11 | 11 | 100% |
| 5. Hotfix — Install Path Convention + Logic Gaps | ✅ Complete | 5 | 5 | 100% |

**Overall**: 39 / 39 tasks (100%) 🎉

---

## Post-MVP / Product Horizon

### Horizon mode
Multi-release — Post-MVP and Future epics captured from brainstorm session-2026-04-02.

### Post-MVP themes (epic-level)

- **Fork state updates** — Background bookkeeping sau task PASS: fire-and-forget fork để update TRACKER/CHANGELOG/ROADMAP mà không block execution loop. Depends on: Phase 2 (HANDOFF continuity).
- **Parallel task execution** — Dựa trên `can_parallel_with` dependency graph trong TASK.md. Spawn concurrent workers cho independent tasks. Depends on: Phase 1 (TASK.md schema) + Phase 2 (typed state machine).
- **AutoDream consolidation** — Post-phase-complete trigger để consolidate project knowledge → STACKS.md. Depends on: layered context architecture (Phase 1 + Phase 2).
- **Gap G extended** — Description keyword scan cho compliance detection (beyond write_scope paths); vp-auto pre-flight warning UI; consensus/contract compliance domains. Depends on: Phase 2 Task 2.1.
- **Conditional skill activation** — `paths:` frontmatter execution support khi Claude Code tool thêm support. Task 3.7 thêm field; Post-MVP = runtime conditional loading.

### Future / exploratory

- **Multi-agent coordinator** — AI điều phối AI cho complex phases; plan approval gate giữa coordinator và worker agents.
- **ML-based auto-approval** — Low-risk task auto-approval (bypass control point) dựa trên historical pass rate.
- **Token budget awareness** — vp-auto detect approaching context limit → preemptive HANDOFF write + graceful pause.
- **Team memory sync** — Multi-developer projects: shared TRACKER + decision log sync.
- **Gap E: Cross-project status** — `/vp-status --all` aggregation cho multi-project consultants (Year 2 use case).
- **Gap F: Career documentation** — Export `logs/decisions.md` across projects → knowledge portfolio.

### Deferred Capabilities (from MVP)

- Parallel task execution — dependency graph infrastructure cần có trước (Post-MVP prerequisite)
- AutoDream — layered context architecture cần stable trước (Post-MVP prerequisite)
- Gap G description keyword scan — write_scope path scan đủ cho MVP; keyword NLP deferred

### Non-goals for MVP (reference)

- Breaking changes với ViePilot v1 projects
- Thay đổi SKILL.md frontmatter format
- Rewrite vp-tools CLI
- Server deployment / network service

---

## Notes
- Created: 2026-04-02
- Last Updated: 2026-04-02
- **Horizon:** Keep Post-MVP / Future in sync với `PROJECT-CONTEXT.md` *Product vision & phased scope*.
