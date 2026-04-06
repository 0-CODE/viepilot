---
name: vp-audit
description: "Audit state, docs drift, and stack best-practice compliance — works on any project"
version: 0.3.2
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-audit`, `/vp-audit`, "audit", "kiểm tra", "check docs"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Display audit results clearly with actionable suggestions grouped by tier.

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

- **Report / gap** — do **not** fix shipping by default; route **`/vp-request`** → **`/vp-evolve`** → **`/vp-auto`** or user explicit. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Audit ViePilot project state and documentation to detect drift.
Works on **any project** using ViePilot (Java, Node, Python, etc.).
Auto-detects if running inside the viepilot framework repo to enable framework-specific checks.

**Tier 1 — ViePilot State Consistency (all projects):**
- `.viepilot/TRACKER.md` current state vs `.viepilot/phases/*/PHASE-STATE.md`
- `.viepilot/ROADMAP.md` phase status vs PHASE-STATE.md
- `.viepilot/HANDOFF.json` vs TRACKER.md (resume-state consistency)
- Git tags `vp-p{N}-complete` vs completed phases in PHASE-STATE.md

**Tier 2 — Project Documentation Drift (all projects):**
- `README.md` version vs `package.json` / `pom.xml` / `pyproject.toml`
- `CHANGELOG.md` vs recent git commits
- Placeholder URLs in `docs/` (`your-org`, `YOUR_USERNAME`, etc.)
- New features (from recent phases) without documentation
- `ARCHITECTURE.md` diagram applicability matrix consistency:
  - `required` diagrams must have Mermaid content
  - `optional` diagrams may be omitted/merged with explicit note
  - `N/A` diagrams must have rationale line
- **ENH-022 (recommended check):** when a diagram type is `required` (or `optional` with a real Mermaid block) and crystallize policy applies, verify **`.viepilot/architecture/<type>.mermaid`** exists and that **Diagram source** lines in `ARCHITECTURE.md` match; for `N/A`, sidecar file should be absent (no empty stubs)

**Tier 3 — Stack Best Practices + Code Quality (all projects, for each detected stack):**
- Detect relevant stacks from context/project manifests
- Match code patterns against stack-specific Do/Don't + anti-patterns
- Severity findings: `critical` / `high` / `medium` / `low` with file/module mapping
- Fallback research using `WebSearch` + `WebFetch` when stack cache is missing/weak
- Generate guardrails/checklist output for `vp-auto` reuse during preflight

**Tier 4 — Framework Integrity (only when viepilot framework repo is detected):**
- Auto-detect: `skills/vp-*/SKILL.md` present → this is the viepilot framework repo
- `ARCHITECTURE.md` counts vs actual `skills/`, `workflows/`, CLI
- `README.md` viepilot-specific badges (version, skills-N, workflows-N)
- `docs/skills-reference.md` sections vs `skills/` directory

**Output:**
- Report by 4 tiers, each tier with its own status
- Auto-fix option per tier
- Suggestions for complex gaps
- `vp-auto`-compatible guardrails contract per stack
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
- `--tier3`     : Run Tier 3 (stack best-practice) only
- `--tier4`     : Run Tier 4 (framework integrity) only
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
# ARCHITECTURE.md diagram matrix consistency (required|optional|N/A)
```

**Step 3 — Tier 3**: Stack Best Practices + Code Quality
```bash
# detect stack(s), load cache summary first
# if missing/weak cache -> run WebSearch/WebFetch fallback
# emit severity findings + guardrails contract for vp-auto
```

**Step 4 — Tier 4**: Framework Integrity (conditional)

**Step 5**: Generate full report

**Step 6**: Auto-fix (if requested)
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
- [ ] Tier 3 stack checks run for detected stacks with severity output
- [ ] Tier 3 supports research fallback when stack cache is missing/weak
- [ ] Tier 4 only runs when `skills/vp-*/SKILL.md` detected OR `--framework` flag used
- [ ] Results clearly labeled by tier
- [ ] `--framework` flag forces Tier 4 checks
- [ ] `--project` flag skips Tier 4 checks
- [ ] Auto-fix applies correct fixes per tier
- [ ] No mention of `skills/`, `workflows/`, `vp-tools.cjs` in Tier 1 or Tier 2 output for user projects
</success_criteria>
