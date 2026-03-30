---
name: vp-audit
description: "Audit ViePilot project state and documentation drift — works on any project"
version: 0.2.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-audit`, `/vp-audit`, "audit", "kiểm tra", "check docs"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Display audit results clearly with actionable suggestions grouped by tier.

## C. Tool Usage
Use Cursor tools: `Shell`, `Read`, `Write`, `Glob`, `Grep`
</cursor_skill_adapter>

<objective>
Audit ViePilot project state và documentation để phát hiện drift.
Hoạt động trên **bất kỳ project nào** đang dùng ViePilot (Java, Node, Python, v.v.).
Auto-detect nếu đang chạy trong viepilot framework repo để thêm framework-specific checks.

**Tier 1 — ViePilot State Consistency (mọi project):**
- `.viepilot/TRACKER.md` current state vs `.viepilot/phases/*/PHASE-STATE.md`
- `.viepilot/ROADMAP.md` phase status vs PHASE-STATE.md
- `.viepilot/HANDOFF.json` vs TRACKER.md (resume-state consistency)
- Git tags `vp-p{N}-complete` vs completed phases in PHASE-STATE.md

**Tier 2 — Project Documentation Drift (mọi project):**
- `README.md` version vs `package.json` / `pom.xml` / `pyproject.toml`
- `CHANGELOG.md` vs recent git commits
- Placeholder URLs trong `docs/` (`your-org`, `YOUR_USERNAME`, v.v.)
- Features mới (từ phases gần đây) chưa có documentation

**Tier 3 — Framework Integrity (chỉ khi detect viepilot framework repo):**
- Auto-detect: `skills/vp-*/SKILL.md` tồn tại → là viepilot framework repo
- `ARCHITECTURE.md` counts vs `skills/`, `workflows/`, CLI thực tế
- `README.md` viepilot-specific badges (version, skills-N, workflows-N)
- `docs/skills-reference.md` sections vs `skills/` directory

**Output:**
- Báo cáo theo 3 tiers, mỗi tier có status riêng
- Auto-fix option theo tier
- Suggestions cho complex gaps
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/audit.md
</execution_context>

<context>
Optional flags:
- `--framework` : Force Tier 3 framework checks (even if not auto-detected)
- `--project`   : Force project-only mode — skip Tier 3 framework checks
- `--fix`       : Auto-fix all detected issues
- `--report`    : Generate report file at `.viepilot/audit-report.md`
- `--silent`    : Only output if issues found
- `--tier1`     : Run Tier 1 (state consistency) only
- `--tier2`     : Run Tier 2 (docs drift) only
- `--tier3`     : Run Tier 3 (framework integrity) only
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/audit.md`

### Quick Summary

**Step 0**: Detect project type (viepilot framework vs user project)

**Step 1 — Tier 1**: ViePilot State Consistency
```bash
# TRACKER.md vs PHASE-STATE.md
# ROADMAP.md vs PHASE-STATE.md
# HANDOFF.json vs TRACKER.md
# Git tags vs completed phases
```

**Step 2 — Tier 2**: Project Documentation Drift
```bash
# Detect version: package.json / pom.xml / pyproject.toml
# README.md version mention
# CHANGELOG.md vs recent commits
# Placeholder URLs in docs/
```

**Step 3 — Tier 3**: Framework Integrity (conditional)
```bash
if [ "$IS_VIEPILOT_FRAMEWORK" = "true" ]; then
  # ARCHITECTURE.md counts vs actual
  # README.md viepilot badges
  # docs/skills-reference.md completeness
fi
```

**Step 4**: Generate full report

**Step 5**: Auto-fix (if requested)
</process>

<auto_hook>
## Integration with /vp-auto

After each phase complete, /vp-auto should:
1. Run quick audit (--silent mode, Tier 1 + Tier 2 only)
2. If issues found → warn user
3. Offer to fix before continuing

```
Phase 2 complete!

⚠️ Audit found 2 issues:
   Tier 1: ROADMAP.md phase 2 not marked ✅
   Tier 2: README.md version not updated

Fix now? (y/n)
```
</auto_hook>

<success_criteria>
- [ ] Runs on any project using ViePilot (Java, Node, Python, etc.) without errors
- [ ] Tier 1 state consistency checks work for all projects
- [ ] Tier 2 docs drift checks work for all project types (detects version from package.json/pom.xml/pyproject.toml)
- [ ] Tier 3 only runs when `skills/vp-*/SKILL.md` detected OR `--framework` flag used
- [ ] Results clearly labeled by tier
- [ ] `--framework` flag forces Tier 3 checks
- [ ] `--project` flag skips Tier 3 checks
- [ ] Auto-fix applies correct fixes per tier
- [ ] No mention of `skills/`, `workflows/`, `vp-tools.cjs` in Tier 1 or Tier 2 output for user projects
</success_criteria>
