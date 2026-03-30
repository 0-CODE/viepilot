<purpose>
Audit documentation vs implementation để phát hiện và fix gaps.
Có thể chạy manual hoặc auto-hook sau phase complete.
</purpose>

<process>

<step name="collect_actual">
## 1. Collect Actual Implementation State

### Skills
```bash
# Count
SKILL_COUNT=$(ls -d skills/vp-*/ 2>/dev/null | wc -l | tr -d ' ')

# List
SKILL_LIST=$(ls -d skills/vp-*/ 2>/dev/null | xargs -I{} basename {} | sort)
```

### Workflows
```bash
# Count
WORKFLOW_COUNT=$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')

# List
WORKFLOW_LIST=$(ls workflows/*.md 2>/dev/null | xargs -I{} basename {} .md | sort)
```

### CLI Commands
```bash
# Count and list from help output
CLI_OUTPUT=$(node bin/vp-tools.cjs help 2>/dev/null)
CLI_COUNT=$(echo "$CLI_OUTPUT" | grep -E "^\s+[a-z]" | wc -l | tr -d ' ')
```

Store results for comparison.
</step>

<step name="parse_architecture">
## 2. Parse ARCHITECTURE.md

Read `.viepilot/ARCHITECTURE.md`

Extract using patterns:
```
# Skills count
/SKILLS LAYER \((\d+)\)/

# Workflows count
/WORKFLOWS LAYER \((\d+)\)/

# CLI count
/vp-tools\.cjs \((\d+) commands\)/
```

Extract listed items from diagrams and tables.
</step>

<step name="compare">
## 3. Compare and Identify Gaps

```javascript
const gaps = [];

if (actual.skills !== documented.skills) {
  gaps.push({
    type: 'skills',
    actual: actual.skills,
    documented: documented.skills,
    missing: actual.skillList.filter(s => !documented.skillList.includes(s)),
    extra: documented.skillList.filter(s => !actual.skillList.includes(s))
  });
}

// Similar for workflows and CLI
```

Categorize gaps:
- **Count mismatch**: Numbers don't match
- **Missing items**: In code but not docs
- **Extra items**: In docs but not code (removed?)
</step>

<step name="report">
## 4. Generate Report

### No Gaps
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUDIT PASSED ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Component        Actual  Documented  Status
 ─────────────────────────────────────────────────────────
 Skills           12      12          ✅ In sync
 Workflows        10      10          ✅ In sync
 CLI Commands     13      13          ✅ In sync

 All documentation is up to date!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Gaps Found
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Component        Actual  Documented  Status
 ─────────────────────────────────────────────────────────
 Skills           14      12          ⚠️ +2 missing in docs
 Workflows        10      10          ✅ In sync
 CLI Commands     15      13          ⚠️ +2 missing in docs

 GAPS DETAIL:
 
 Skills missing in documentation:
   + vp-newskill1
   + vp-newskill2

 CLI commands missing in documentation:
   + newcommand1
   + newcommand2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 1. Auto-fix → Update ARCHITECTURE.md
 2. Report   → Save to .viepilot/audit-report.md
 3. Diff     → Show what would change
 4. Skip     → Do nothing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

<step name="fix">
## 5. Auto-Fix (if requested)

### Update Counts
```markdown
# Before
SKILLS LAYER (12)

# After
SKILLS LAYER (14)
```

### Update Diagrams
Add missing skills to the skills diagram grid.
Add missing workflows to workflow list.
Update CLI command list.

### Commit
```bash
git add .viepilot/ARCHITECTURE.md
git commit -m "docs(arch): sync with implementation (audit fix)

- Skills: 12 → 14
- CLI: 13 → 15
- Added: vp-newskill1, vp-newskill2, newcommand1, newcommand2

Auto-fixed by /vp-audit"
```
</step>

<step name="save_report">
## 6. Save Report (if --report)

Create `.viepilot/audit-report.md`:
```markdown
# Audit Report - {timestamp}

## Summary
- **Status**: {PASS|GAPS_FOUND}
- **Gaps**: {count}
- **Generated**: {timestamp}

## Details
{full comparison table}

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

1. Run silent audit
   ```bash
   # Conceptually:
   /vp-audit --silent
   ```

2. If gaps found:
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
- [ ] Actual state collected correctly
- [ ] ARCHITECTURE.md parsed correctly
- [ ] Gaps identified accurately
- [ ] Report clear and actionable
- [ ] Auto-fix works correctly
- [ ] Integration hook documented
</success_criteria>
