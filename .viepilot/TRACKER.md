# ViePilot - Tracker

## Current State
- **Milestone**: M1.15 - npm publish distribution 🔄 IN PROGRESS
- **Current Phase**: 18 - npm publish distribution
- **Current Task**: 18.4 (blocked) — post-publish smoke verification from npm registry
- **Last Activity**: 2026-03-31 - `/vp-auto --phase 18`: npm publish attempted; blocked by npm E403 (2FA/token policy)

## Progress Overview
```
M1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: CLI Enhancement        [██████████] 100% ✅
Phase 2: Advanced Features      [██████████] 100% ✅
Phase 3: Integration & Testing  [██████████] 100% ✅
Phase 4: Documentation          [██████████] 100% ✅

M1.5 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 5: vp-docs Enhancements   [██████████] 100% ✅
Phase 6: ROOT Document Sync     [██████████] 100% ✅
Phase 7: vp-audit Drift         [██████████] 100% ✅
─────────────────────────────────────────────────
M1.5 Overall:                   [██████████] 100% ✅

M1.6 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 8: Generalize Workflows   [██████████] 100% ✅
Phase 9: Generalize vp-audit    [██████████] 100% ✅
─────────────────────────────────────────────────
M1.6 Overall:                   [██████████] 100% ✅

M1.7 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 10: Brainstorm Intelligence [██████████] 100% ✅
─────────────────────────────────────────────────
M1.7 Overall:                   [██████████] 100% ✅

M1.8 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 11: Stack Intelligence Cache [██████████] 100% ✅
─────────────────────────────────────────────────
M1.8 Overall:                   [██████████] 100% 🎉

M1.9 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 12: Audit Stack Compliance [██████████] 100% ✅
─────────────────────────────────────────────────
M1.9 Overall:                   [██████████] 100% 🎉

M1.10 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 13: Task Granularity + State Sync [██████████] 100% ✅
─────────────────────────────────────────────────
M1.10 Overall:                  [██████████] 100% 🎉

M1.11 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 14: ROOT docs + drift     [██████████] 100% ✅
─────────────────────────────────────────────────
M1.11 Overall:                  [██████████] 100% 🎉

M1.12 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 15: Doc-first vp-auto    [██████████] 100% ✅
─────────────────────────────────────────────────
M1.12 Overall:                  [██████████] 100% 🎉

M1.13 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 16: UI direction + stock [██████████] 100% ✅
─────────────────────────────────────────────────
M1.13 Overall:                  [██████████] 100% 🎉

M1.14 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 17: npx guided installer [██████████] 100% ✅
─────────────────────────────────────────────────
M1.14 Overall:                  [██████████] 100% 🎉

M1.15 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 18: npm publish dist     [████████░░]  80% 🔄 (blocked)
─────────────────────────────────────────────────
M1.15 Overall:                  [████████░░]  80%
```

## Version Info

### Current Version
```
0.10.0
```

### Released
- **0.8.2** — M1.12 Doc-first execution gates (BUG-001): autonomous workflow gate, vp-auto skill, TASK template checklist, audit heuristic
- **0.10.0** — M1.14 Guided NPX Installer (FEAT-003): `npx viepilot install`, profile selector (Claude/Cursor), non-interactive flags, installer automation support, onboarding docs
- **0.9.0** — M1.13 UI direction + component curation (FEAT-002): brainstorm UI artifacts, crystallize mapping, new vp-ui-components workflow/skill, stock component bootstrap
- **0.8.1** — M1.11 ROOT documentation alignment (ENH-011): README/CHANGELOG/audit tier copy + doc examples vs framework SemVer
- **0.8.0** — M1.10 Execution Trace Reliability: detailed task decomposition contract + per-task state sync + audit anti-pattern detection
- **0.7.0** — M1.9 Stack-Aware Audit: stack best-practice/code-quality checks + research fallback + vp-auto guardrails alignment
- **0.6.0** — M1.8 Stack Intelligence: official stack research gate + global cache + vp-auto preflight lookup
- **0.5.0** — M1.7 Brainstorm Intelligence: landing-page layout discovery + in-session research
- **0.4.0** — M1.6 Generalize: vp-audit 3-tier + workflow framework guards (ENH-006, ENH-007)
- **0.3.0** — M1.5 ENH Backlog: vp-docs/vp-auto/vp-audit drift prevention (ENH-001~005)
- **0.2.0** — M1 Foundation Enhancement complete

### Version History
| Version | Date | Milestone | Notes |
|---------|------|-----------|-------|
| 0.1.0 | 2026-03-30 | Initial | Core framework complete (95%) |

### Next Version
```
Pending changes in [Unreleased]:
- 1 planned feature (FEAT-004 / Phase 18)
- 0 fixes
- 0 breaking changes

Suggested next version: 0.11.0 (minor after feature completion)
```

## Decision Log

| Date | Decision | Rationale | Phase |
|------|----------|-----------|-------|
| 2026-03-30 | Self-apply ViePilot | Dogfooding - use framework to develop itself | Setup |
| 2026-03-30 | 4 phases for M1 | Balanced scope for foundation enhancement | Setup |
| 2026-03-30 | CLI first | Better DX foundation before advanced features | Setup |
| 2026-03-31 | M1.12 Phase 15 for BUG-001 | Harden doc-first ordering in autonomous flow to reduce execute-then-doc drift | Planning |
| 2026-03-31 | Ship 0.8.2 after Phase 15 | Doc-first gate + audit heuristic merged; BUG-001 closed at workflow level | M1.12 |
| 2026-03-31 | Open M1.13 Phase 16 for FEAT-002 | Add UI-first brainstorm with live HTML direction and reusable component curation workflow | Planning |
| 2026-03-31 | Open M1.14 Phase 17 for FEAT-003 | Provide one-command NPX installer with guided target selection | Planning |
| 2026-03-31 | Deep-dive FEAT-003 via vp-request brainstorm | Refined installer CLI contract, target profiles, risks, and expanded acceptance criteria | M1.14 |
| 2026-03-31 | Ship 0.10.0 after Phase 17 | Guided installer + NPX entrypoint + docs delivered | M1.14 |
| 2026-03-31 | Open M1.15 Phase 18 for FEAT-004 | Publish ViePilot to npmjs with secure release and verification flow | Planning |

## Backlog

### Pending Requests
| ID | Type | Title | Priority | Status |
|----|------|-------|----------|--------|
| FEAT-002 | ✨ | UI-first brainstorm HTML direction + UI component curation library | high | ✅ done |
| FEAT-003 | ✨ | Guided `npx viepilot install` with Claude/Cursor target profiles | high | ✅ done |
| FEAT-004 | ✨ | Publish ViePilot package lên npmjs (`npx viepilot install`) | high | in_progress (blocked: npm E403 2FA/token policy) |
| BUG-001 | 🐛 | vp-auto executes before full docs/state gate, causing drift risk | high | ✅ done |
| ENH-001 | 🔧 | vp-auto: Sync ROOT documents on milestone complete | high | new |
| ENH-002 | 🔧 | vp-docs: Sync ROOT documents after doc generation | medium | new |
| ENH-003 | 🔧 | vp-audit: Add drift detection (ROOT + docs/) | medium | updated |
| ENH-004 | 🔧 | vp-docs: Inject git remote URL when generating | medium | new |
| ENH-005 | 🔧 | vp-docs: Keep skills-reference.md in sync with skills/ | high | new |
| ENH-006 | 🔧 | vp-audit: Generalize from viepilot-specific to project-agnostic | **critical** | ✅ done |
| ENH-007 | 🔧 | autonomous+docs workflows: Remove viepilot framework assumptions | high | ✅ done |
| ENH-008 | 🔧 | vp-crystallize: Research official stack best practices + global cache for vp-auto | **critical** | ✅ done |
| ENH-009 | 🔧 | vp-audit: Stack best-practice compliance + research fallback + vp-auto alignment | high | ✅ done |
| ENH-010 | 🔧 | vp-auto/impl skills: detailed task decomposition + per-task realtime state sync | **critical** | ✅ done |
| ENH-011 | 🔧 | ROOT docs sync + full-project drift cross-check | high | ✅ done |

## Blockers
- FEAT-004 / Phase 18: npm publish returns `E403` — requires 2FA publish flow or granular access token with bypass 2FA enabled.

## Recent Commits
```
(Run: git log --oneline -5)
```

## Next Action
**Milestone M1.15 — unblock Phase 18 (FEAT-004)**

- Cấp quyền publish npm (token/owner) và chạy publish.
- Sau đó chạy lại `/vp-auto --phase 18` để hoàn tất task 18.4 + close phase.

## Quick Actions

| Action | Command |
|--------|---------|
| Check status | `/vp-status` |
| Start autonomous | `/vp-auto` |
| Pause work | `/vp-pause` |
| Resume work | `/vp-resume` |
| Add feature | `/vp-request --feature` |
| Report bug | `/vp-request --bug` |
