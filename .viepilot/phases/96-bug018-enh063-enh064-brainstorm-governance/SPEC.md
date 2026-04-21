# Phase 96 Spec — BUG-018 + ENH-063 + ENH-064: Brainstorm Governance & Workspace Improvements

## Goal
- **BUG-018**: Fix brainstorm thiếu unified workspace mode-selection prompt — Architect auto-activates mà không offer UI Direction. Add AUQ step sau scope lock cho phép user chọn Architect / UI Direction / Both / Neither.
- **ENH-063**: Add Admin & Governance topic (Topic 6) vào brainstorm template + proactive keyword heuristic + admin coverage gate + `admin.html` architect page + crystallize export `## Admin & Governance` vào PROJECT-CONTEXT.md.
- **ENH-064**: Unified cross-links giữa Architect và UI Direction workspaces + crystallize mandatory read gates (no silent skip khi workspace tồn tại).

## Version Target
2.32.0

## Tasks
- 96.1 `workflows/brainstorm.md` + `skills/vp-brainstorm/SKILL.md` — BUG-018: unified workspace mode-selection AUQ after scope lock
- 96.2 `workflows/brainstorm.md` + `skills/vp-brainstorm/SKILL.md` — ENH-063 brainstorm side: Topic 6 Admin & Governance + heuristic + coverage gate + admin.html
- 96.3 `workflows/crystallize.md` + `templates/project/PROJECT-CONTEXT.md` + `skills/vp-crystallize/SKILL.md` — ENH-063 crystallize side: admin YAML export + template section
- 96.4 `workflows/brainstorm.md` + `workflows/crystallize.md` + `skills/vp-crystallize/SKILL.md` — ENH-064: cross-workspace HUB links + mandatory read gates
- 96.5 `tests/unit/phase96-brainstorm-governance.test.js` + `CHANGELOG.md` + `package.json` — tests + CHANGELOG [2.32.0] + version bump

## Dependencies
- ENH-061 ✅ (Recommended Breakdown Ordering, arch_to_ui_sync)
- ENH-060 ✅ (Background UI Extraction early-session detection)
- FEAT-011 ✅ (Architect workspace, 12 pages)
- ENH-029 ✅ (12-page architect workspace)
- ENH-048 ✅ (AUQ adapter-aware)
- ENH-059 ✅ (AUQ preload via ToolSearch)
- BUG-018, ENH-063, ENH-064

## Acceptance Criteria
- [ ] Brainstorm: after scope lock → AUQ offers Architect / UI Direction / Both / Neither
- [ ] Brainstorm: Topic 6 "Admin & Governance" in Topics Template
- [ ] Brainstorm: proactive 🔐 heuristic fires on admin/governance keywords
- [ ] Brainstorm: admin coverage gate (warn) before /save when SaaS signals detected
- [ ] Architect workspace: `admin.html` page triggered by admin keywords
- [ ] `notes.md ## admin` YAML schema defined
- [ ] Crystallize: `## admin` YAML → `## Admin & Governance` table in PROJECT-CONTEXT.md
- [ ] `templates/project/PROJECT-CONTEXT.md`: `## Admin & Governance` section added
- [ ] Crystallize Step 1D: mandatory read gate when architect workspace EXISTS
- [ ] Crystallize Step 1A: strengthened — reads ALL ui-direction pages
- [ ] Cross-links in architect `index.html` ↔ ui-direction `index.html` when both present
- [ ] All tests pass (≥15 new contracts)
- [ ] version = "2.32.0"
