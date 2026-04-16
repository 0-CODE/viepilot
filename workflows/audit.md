<purpose>
Audit ViePilot project state and documentation to detect drift.
Works on any project using ViePilot.
Auto-detects if running inside the viepilot framework repo to enable framework-specific checks.
</purpose>

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.


<process>

<step name="detect_project_type">
## 0. Detect Project Type

```bash
# Detect if this is the viepilot framework repo itself
IS_VIEPILOT_FRAMEWORK=false
if [ -d "skills" ] && ls skills/vp-*/SKILL.md 2>/dev/null | head -1 > /dev/null; then
  IS_VIEPILOT_FRAMEWORK=true
  echo "→ Detected: ViePilot framework repository"
  echo "  Will run Tier 1–4 (includes Tier 4 framework integrity when enabled)"
else
  echo "→ Detected: User project using ViePilot"
  echo "  Will run Tier 1–3; Tier 4 framework tier is skipped unless --framework"
fi

# Override with flags if provided
# --framework : force framework checks even if not detected
# --project   : force project-only checks (skip framework tier)
```

Display audit plan:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Tier 1: ViePilot State Consistency           [ALWAYS]
 Tier 2: Project Documentation Drift         [ALWAYS]
 Tier 3: Stack Best Practices + Code Quality [ALWAYS]
 Tier 4: Framework Integrity                 [{FRAMEWORK_STATUS}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

<step name="tier1_state">
## 1. Tier 1: ViePilot State Consistency (always runs)

Check that ViePilot's own tracking files are internally consistent.
This is meaningful for **any project** using ViePilot.

### 1a. TRACKER.md vs PHASE-STATE.md
```bash
# Read current phase from TRACKER.md
TRACKER_PHASE=$(grep "Current Phase" .viepilot/TRACKER.md 2>/dev/null | sed 's/.*: //' | tr -d '*')
TRACKER_TASK=$(grep "Current Task" .viepilot/TRACKER.md 2>/dev/null | sed 's/.*: //' | tr -d '*')

# Check each phase directory for status
for phase_dir in .viepilot/phases/*/; do
  if [ -f "$phase_dir/PHASE-STATE.md" ]; then
    PHASE_STATUS=$(grep "^\- \*\*Status\*\*:" "$phase_dir/PHASE-STATE.md" 2>/dev/null | sed 's/.*: //')
    PHASE_NUM=$(basename "$phase_dir" | grep -o '^[0-9]*')
    # Compare with TRACKER.md current state
  fi
done
```

### 1b. ROADMAP.md phase status vs PHASE-STATE.md
```bash
# For each completed PHASE-STATE.md, verify ROADMAP.md shows ✅
for phase_dir in .viepilot/phases/*/; do
  if [ -f "$phase_dir/PHASE-STATE.md" ]; then
    PHASE_STATUS=$(grep "^\- \*\*Status\*\*:" "$phase_dir/PHASE-STATE.md" 2>/dev/null | sed 's/.*: //')
    if echo "$PHASE_STATUS" | grep -qi "complete"; then
      PHASE_NUM=$(basename "$phase_dir" | grep -o '^[0-9]*' | sed 's/^0*//')
      # Check ROADMAP.md has ✅ for this phase
      ROADMAP_STATUS=$(grep -i "Phase $PHASE_NUM" .viepilot/ROADMAP.md 2>/dev/null | head -1)
      if ! echo "$ROADMAP_STATUS" | grep -q "✅"; then
        echo "⚠️  Phase $PHASE_NUM: PHASE-STATE says complete but ROADMAP.md not marked ✅"
      fi
    fi
  fi
done
```

### 1c. HANDOFF.json vs TRACKER.md
```bash
if [ -f ".viepilot/HANDOFF.json" ]; then
  HANDOFF_PHASE=$(node -e "try{const h=require('./.viepilot/HANDOFF.json');console.log(h.current_phase||'')}catch(e){}" 2>/dev/null)
  HANDOFF_TASK=$(node -e "try{const h=require('./.viepilot/HANDOFF.json');console.log(h.current_task||'')}catch(e){}" 2>/dev/null)
  # Compare with TRACKER.md values
fi
```

### 1d. Git tags vs completed phases
```bash
# List completed phases (PHASE-STATE.md with status: complete)
# List git tags matching legacy + project-scoped complete format
COMPLETE_TAGS=$(git tag 2>/dev/null | grep -E \
  '(^vp-p[0-9]+-complete$)|(^[a-z0-9-]+-vp-p[0-9]+-complete$)|(^[a-z0-9._-]+-[a-z0-9._-]+-[0-9]+\.[0-9]+\.[0-9]+-vp-p[0-9]+-complete$)' \
  | sort)
# Third alternative matches enriched format: prefix-branch-version-vp-pN-complete (ENH-050)
# Report any phase marked complete in PHASE-STATE.md without a git tag
```

### 1e. Detect delayed/batch-only state updates (anti-pattern)
```bash
# Heuristic signals for poor traceability:
# - PHASE-STATE has all tasks done but missing in_progress transitions
# - HANDOFF/TRACKER timestamps only move at phase end
# - no per-task done tags for multi-task phases
#
# Report as:
# ⚠️  Phase N may use batch-only state updates (missing incremental trace)
```

### 1f. Execute-first / docs-later ordering risk (heuristic; BUG-001)

> **Heuristic only** — can produce false positives. Confirm manually before accusing a run of violating doc-first policy.

Signals that implementation may have started **before** task documentation / state gates:

1. **Git vs task file** — Commit introduces substantive changes under paths implied by a task, but the task `.md` still has only template placeholders in **Paths** / **File-Level Plan** at that commit (use `git log --follow` + blame on task file).
2. **Git vs PHASE-STATE** — First implementation commit for a task predates the first edit that marks the task `in_progress` in `PHASE-STATE.md` for that task row.
3. **Empty plan** — Task file lacks **Pre-execution documentation gate** checklist (template after Phase 15) yet commits exist on tracked deliverable files assigned to that task ID in tracker/notes.

Report example:
```
⚠️  Task X.Y: possible execute-first pattern — verify doc-first gate in workflows/autonomous.md was satisfied
```

### 1g. Report Tier 1 results
```
 TIER 1: ViePilot State Consistency
 ─────────────────────────────────────────────────
 TRACKER.md ↔ PHASE-STATE.md    {✅ Consistent | ⚠️ Mismatch}
 ROADMAP.md ↔ PHASE-STATE.md    {✅ Consistent | ⚠️ N phase(s) out of sync}
 HANDOFF.json ↔ TRACKER.md      {✅ Consistent | ⚠️ Mismatch | ℹ️ No HANDOFF.json}
 Git tags ↔ completed phases     {✅ All tagged | ⚠️ N phase(s) missing tags}
 Incremental state traceability   {✅ Per-task updates found | ⚠️ Batch-only update pattern suspected}
 Execute-first / docs-later risk   {✅ None suspected | ⚠️ N heuristic flag(s) — manual confirm}
```
</step>

<step name="tier2_docs">
## 2. Tier 2: Project Documentation Drift (always runs)

Check that project documentation reflects the current state of the codebase.
Works for **any project type** (Java, Node, Python, etc.).

### 2a. Detect project version
```bash
# Generic version detection
if [ -f "package.json" ]; then
  PROJECT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
  VERSION_SOURCE="package.json"
elif [ -f "pom.xml" ]; then
  PROJECT_VERSION=$(grep -m1 "<version>" pom.xml 2>/dev/null | sed 's/.*<version>//;s/<.*//' | tr -d ' ')
  VERSION_SOURCE="pom.xml"
elif [ -f "pyproject.toml" ]; then
  PROJECT_VERSION=$(grep '^version' pyproject.toml 2>/dev/null | head -1 | cut -d'"' -f2)
  VERSION_SOURCE="pyproject.toml"
else
  PROJECT_VERSION=""
  VERSION_SOURCE="not found"
fi
```

### 2b. README.md version drift
```bash
if [ -n "$PROJECT_VERSION" ] && [ -f "README.md" ]; then
  # Check if README.md mentions the current version
  if ! grep -q "$PROJECT_VERSION" README.md 2>/dev/null; then
    echo "⚠️  README.md does not mention current version $PROJECT_VERSION (from $VERSION_SOURCE)"
  fi
fi
```

### 2c. CHANGELOG.md vs recent commits
```bash
if [ -f "CHANGELOG.md" ]; then
  # Get last version tag
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  if [ -n "$LAST_TAG" ]; then
    COMMITS_SINCE=$(git log --oneline "$LAST_TAG"..HEAD 2>/dev/null | wc -l | tr -d ' ')
    CHANGELOG_UNRELEASED=$(grep -c "^\-" <(sed -n '/## \[Unreleased\]/,/## \[/p' CHANGELOG.md 2>/dev/null) 2>/dev/null || echo "0")
    if [ "$COMMITS_SINCE" -gt 0 ] && [ "$CHANGELOG_UNRELEASED" -eq 0 ]; then
      echo "⚠️  $COMMITS_SINCE commits since $LAST_TAG but CHANGELOG.md [Unreleased] is empty"
    fi
  fi
fi
```

### 2d. Placeholder URLs in docs/
```bash
if [ -d "docs" ]; then
  PLACEHOLDER_FILES=$(grep -rl "your-org\|YOUR_USERNAME\|YOUR_ORG\|your-username\|example\.com" docs/ --include="*.md" 2>/dev/null)
  if [ -n "$PLACEHOLDER_FILES" ]; then
    echo "⚠️  Placeholder URLs found in:"
    echo "$PLACEHOLDER_FILES"
  fi
fi
```

### 2e. New features without docs (phases added recently)
```bash
# Check if recent phases added features without corresponding docs updates
RECENT_PHASES=$(ls -t .viepilot/phases/*/PHASE-STATE.md 2>/dev/null | head -3)
for phase_state in $RECENT_PHASES; do
  PHASE_STATUS=$(grep "^\- \*\*Status\*\*:" "$phase_state" 2>/dev/null | sed 's/.*: //')
  if echo "$PHASE_STATUS" | grep -qi "complete"; then
    PHASE_DIR=$(dirname "$phase_state")
    # Check if docs/ was updated in commits for this phase
    PHASE_NUM=$(basename "$PHASE_DIR" | grep -o '^[0-9]*' | sed 's/^0*//')
    TAG_PREFIX=$(vp-tools tag-prefix --raw 2>/dev/null || echo "vp")
    PHASE_TAG="${TAG_PREFIX}-p${PHASE_NUM}-complete"
    PREV_TAG=$(git tag --sort=-version:refname 2>/dev/null | grep -E "(vp-p.*-complete|[a-z0-9._-]+-vp-p.*-complete)" | grep -A1 "^$PHASE_TAG$" | tail -1)
    # [a-z0-9._-]+ covers both legacy (viepilot-vp-p60) and enriched (viepilot-main-2.17.0-vp-p80) formats
    if [ -n "$PREV_TAG" ]; then
      DOCS_CHANGED=$(git diff "$PREV_TAG"..HEAD --name-only 2>/dev/null | grep "^docs/" | wc -l | tr -d ' ')
      if [ "$DOCS_CHANGED" -eq 0 ]; then
        echo "ℹ️  Phase $PHASE_NUM complete but no docs/ changes detected"
      fi
    fi
  fi
done
```

### 2f. Report Tier 2 results
```
 TIER 2: Project Documentation Drift
 ─────────────────────────────────────────────────
 README.md version           {✅ v{version} mentioned | ⚠️ v{version} not found}
 CHANGELOG.md freshness      {✅ Up to date | ⚠️ N commits not documented}
 Placeholder URLs in docs/   {✅ None | ⚠️ Found in N files}
 New features without docs   {✅ All documented | ℹ️ Phase N may need docs}
```
</step>

<step name="tier3_stack_practices">
## 3. Tier 3: Stack Best Practices + Code Quality (always runs)

Evaluate project code and architecture decisions against stack-specific guidance.
This tier runs for any project, but only checks detected stacks.

### 3a. Detect relevant stacks
```bash
# Source 1: .viepilot/STACKS.md (if present)
# Source 2: project manifests (package.json, pom.xml, pyproject.toml, requirements.txt)
# Source 3: common file patterns (e.g., mybatis xml, spring boot, next.config, fastapi imports)
#
# Build normalized stack list, e.g.:
# java, spring-boot, mybatis, nodejs, express, react, python, fastapi
```

### 3b. Load stack cache summary first (token-efficient)
```bash
for stack in $DETECTED_STACKS; do
  SUMMARY="$HOME/.viepilot/stacks/$stack/SUMMARY.md"
  if [ -f "$SUMMARY" ]; then
    echo "✅ Cache found for $stack (summary)"
  else
    echo "⚠️ No stack summary cache for $stack"
  fi
done
```

### 3c. Research fallback when cache missing or weak
Fallback trigger conditions:
- `SUMMARY.md` missing for detected stack
- cache appears stale (missing update metadata)
- summary too shallow for audit scope (no Do/Don't or checklist)

Fallback action:
- Use `WebSearch` to locate official docs first.
- Use `WebFetch` to extract key guidance from official docs/reference pages.
- Synthesize concise findings into:
  - Do / Don't
  - Common pitfalls
  - Recommended structure
  - Implementation checklist
  - Code quality heuristics

Source priority:
1. Official documentation/specification
2. Official maintainer org/reference repositories
3. Reputable community references (only as supplemental)

### 3d. Audit compliance by stack
For each detected stack:
- Compare code patterns with Do/Don't guidance.
- Flag anti-patterns and structural violations.
- Record findings with severity (`critical`, `high`, `medium`, `low`).
- Tie each finding to path/module when possible.

### 3e. Emit vp-auto-compatible guardrails
Generate a reusable "guardrails contract" block:
```yaml
stack: {stack}
summary_used: {cache|research}
must_follow:
  - ...
avoid:
  - ...
preflight_checklist:
  - ...
needs_detail_lookup: {true|false}
```

This contract is intended for `/vp-auto` preflight so implementation uses the same stack policy as audit.

### 3f. Cache update guidance
When fallback research is used, suggest/update:
- `~/.viepilot/stacks/{stack}/SUMMARY.md`
- `~/.viepilot/stacks/{stack}/BEST-PRACTICES.md`
- `~/.viepilot/stacks/{stack}/ANTI-PATTERNS.md`
- `~/.viepilot/stacks/{stack}/SOURCES.md`

Include source links and last-updated timestamp.

### 3g. Report Tier 3 results
```
 TIER 3: Stack Best Practices + Code Quality
 ─────────────────────────────────────────────────
 Stack detection                 {✅ N detected | ⚠️ none detected}
 Cache coverage                  {✅ all cached | ⚠️ N stacks missing cache}
 Research fallback               {✅ not needed | ℹ️ applied to N stacks}
 Compliance findings             {✅ no issues | ⚠️ N findings by severity}
 vp-auto guardrails contract     {✅ generated | ⚠️ partial}
```
</step>

<step name="tier3_framework">
## 4. Tier 4: Framework Integrity (viepilot framework only)

> **Guard**: Only runs when `IS_VIEPILOT_FRAMEWORK=true` (or `--framework` flag).
> Skip entirely for user projects.

```bash
if [ "$IS_VIEPILOT_FRAMEWORK" != "true" ]; then
  # Tier 4 skipped silently — not a viepilot framework repo
fi
```

### 4a. Collect actual framework state
```bash
SKILL_COUNT=$(ls -d skills/vp-*/ 2>/dev/null | wc -l | tr -d ' ')
SKILL_LIST=$(ls -d skills/vp-*/ 2>/dev/null | xargs -I{} basename {} | sort)
WORKFLOW_COUNT=$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')
WORKFLOW_LIST=$(ls workflows/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)
CLI_OUTPUT=$(node bin/vp-tools.cjs help 2>/dev/null)
CLI_COUNT=$(echo "$CLI_OUTPUT" | grep -E "^\s+[a-z]" | wc -l | tr -d ' ')
```

### 4b. Parse ARCHITECTURE.md
Read `.viepilot/ARCHITECTURE.md` and extract documented counts:
```
/SKILLS LAYER \((\d+)\)/
/WORKFLOWS LAYER \((\d+)\)/
/vp-tools\.cjs \((\d+) commands\)/
```

### 4c. Compare and identify gaps
```javascript
const gaps = [];
if (actual.skills !== documented.skills) {
  gaps.push({ type: 'skills', actual: actual.skills, documented: documented.skills,
    missing: actual.skillList.filter(s => !documented.skillList.includes(s)),
    extra: documented.skillList.filter(s => !actual.skillList.includes(s)) });
}
// Similar for workflows and CLI
```

### 4d. Check README.md viepilot-specific badges
```bash
ACTUAL_SKILLS=$(ls skills/*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
ACTUAL_WORKFLOWS=$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')
README_VERSION=$(grep -o 'version-[0-9]\+\.[0-9]\+\.[0-9]\+' README.md 2>/dev/null | head -1 | sed 's/version-//')
README_SKILLS=$(grep -o 'skills-[0-9]\+' README.md 2>/dev/null | head -1 | sed 's/skills-//')
README_WORKFLOWS=$(grep -o 'workflows-[0-9]\+' README.md 2>/dev/null | head -1 | sed 's/workflows-//')
```

### 4e. Check docs/skills-reference.md vs skills/
```bash
ACTUAL_SKILLS_LIST=$(ls skills/*/SKILL.md 2>/dev/null | sed 's|skills/||; s|/SKILL\.md||' | sort)
DOCUMENTED_SKILLS=$(grep "^## /vp-" docs/skills-reference.md 2>/dev/null | sed 's|## /||' | sort)
MISSING_IN_SKILLSREF=$(comm -23 <(echo "$ACTUAL_SKILLS_LIST") <(echo "$DOCUMENTED_SKILLS"))
```

### 4f. Report Tier 4 results

> **Silent by default (ENH-049):** Only output Tier 4 results when `TIER4_ISSUES > 0`.
> If all checks pass or Tier 4 was skipped, produce no output — the user does not
> need to see "✅ In sync" or "ℹ️ Skipped" every run.

```bash
if [ "$TIER4_ISSUES" -gt 0 ]; then
  echo " TIER 4: Framework Integrity"
  echo " ─────────────────────────────────────────────────"
  # Print each failing check:
  # Skills count (ARCHITECTURE.md)  ⚠️ N actual vs M documented
  # Workflows count                  ⚠️ N actual vs M documented
  # CLI commands count               ⚠️ N actual vs M documented
  # README.md badges                 ⚠️ version/skills/workflows drift
  # docs/skills-reference.md         ⚠️ N skills missing
fi
```
</step>

<step name="report">
## 5. Generate Full Report

### All Clear
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUDIT PASSED ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Tier 1: ViePilot State     ✅ All consistent
 Tier 2: Project Docs       ✅ No drift detected
 Tier 3: Stack Practices    {✅ In sync | ⚠️ N issues}

 Everything looks good!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Issues Found
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Tier 1: ViePilot State     {✅ | ⚠️ N issues}
 Tier 2: Project Docs       {✅ | ⚠️ N issues}
 Tier 3: Stack Practices    {✅ | ⚠️ N issues}
{if TIER4_ISSUES > 0}
 Tier 4: Framework          ⚠️ {TIER4_ISSUES} issues
{/if}

 ISSUES DETAIL:
 {list each issue with context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. Auto-fix all issues
 2. Report only → save to .viepilot/audit-report.md
 3. Fix specific items
 4. Skip
```
</step>

<step name="fix">
## 6. Auto-Fix (if requested)

### Tier 1 fixes
- Update ROADMAP.md phase statuses from PHASE-STATE.md files
- Sync TRACKER.md current state with PHASE-STATE.md
- Create missing git tags for completed phases
- Add missing per-task trace entries/checkpoints when feasible

### Tier 2 fixes
- Replace placeholder URLs in docs/ with actual git remote URL
- Add version mention to README.md if missing
- Add CHANGELOG.md [Unreleased] section if commits exist

### Tier 3 fixes (stack guidance)
- Write/update stack cache guidance files when fallback research was used
- Add/update "guardrails contract" section in generated audit report
- Mark source confidence (official/reference/community)

### Tier 4 fixes (framework only)
- Update ARCHITECTURE.md counts (skills, workflows, CLI)
- Add missing skills to ARCHITECTURE.md diagrams
- Append missing skill sections to docs/skills-reference.md
- Update README.md viepilot-specific badges

### Commit
```bash
git add .viepilot/ARCHITECTURE.md .viepilot/ROADMAP.md .viepilot/TRACKER.md docs/ README.md CHANGELOG.md
git commit -m "docs: sync project documentation (audit auto-fix)

Auto-fixed by /vp-audit"
git push
```
</step>

<step name="save_report">
## 7. Save Report (if --report)

Create `.viepilot/audit-report.md`:
```markdown
# Audit Report - {timestamp}

## Summary
- **Status**: {PASS|ISSUES_FOUND}
- **Project Type**: {viepilot-framework|user-project}
- **Issues**: {count}
- **Generated**: {timestamp}

## Tier 1: ViePilot State
{results}

## Tier 2: Project Documentation
{results}

## Tier 3: Stack Best Practices + Code Quality
{results}

## Tier 4: Framework Integrity
{results or "Skipped — not a viepilot framework repo"}

## Recommendations
{what to fix}
```
</step>

</process>

<integration>
## Auto-Hook Integration

Add to `workflows/autonomous.md` after phase complete:

```xml
<step name="post_phase_audit">
## Post-Phase Documentation Audit

After marking phase complete:

1. Run silent audit (Tier 1 + Tier 2 only)
   ```bash
   # Conceptually:
   /vp-audit --silent
   ```

2. If issues found:
   ```
   ⚠️ Documentation may be out of sync.
   
   Run /vp-audit to check and fix.
   
   Continue anyway? (y/n)
   ```

3. Recommend running before version bump
</step>
```
</integration>

<success_criteria>
- [ ] Tier 1 state consistency checks work for any project using ViePilot
- [ ] Tier 1 can flag delayed/batch-only state-update anti-patterns
- [ ] Tier 1 includes heuristic guidance for execute-first / docs-later ordering risk (BUG-001)
- [ ] Tier 2 documentation drift checks work for Java/Node/Python/any project
- [ ] Tier 3 stack best-practice checks run for detected stacks
- [ ] Tier 3 supports web research fallback when stack cache is missing/weak
- [ ] Tier 3 output includes severity + file/module mapping
- [ ] Tier 3 output emits vp-auto-compatible guardrails contract
- [ ] Tier 4 framework checks only run when viepilot framework repo detected
- [ ] `--framework` flag forces Tier 4 checks
- [ ] `--project` flag skips Tier 4 checks
- [ ] Report clearly shows which tier found issues
- [ ] Auto-fix applies correct fixes per tier
</success_criteria>
