---
name: vp-audit
description: "Audit documentation vs implementation - detect and fix gaps"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-audit`, `/vp-audit`, "audit", "kiểm tra", "check docs"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Display audit results clearly with actionable suggestions.

## C. Tool Usage
Use Cursor tools: `Shell`, `Read`, `Write`, `Glob`, `Grep`
</cursor_skill_adapter>

<objective>
Audit documentation để phát hiện gaps với implementation thực tế.

**Checks — ARCHITECTURE.md alignment:**
- Skills count và list vs ARCHITECTURE.md
- Workflows count và list vs ARCHITECTURE.md
- CLI commands vs ARCHITECTURE.md

**Checks — ROOT document drift:**
- `README.md` version badge vs actual version (from TRACKER.md)
- `README.md` skills/workflows badge counts vs actual filesystem counts
- `README.md` Skills Reference table vs `skills/` directory (missing skill rows)
- `README.md` Workflows table vs `workflows/` directory
- `.viepilot/ROADMAP.md` phase status vs each phase's `PHASE-STATE.md`
- `.viepilot/ROADMAP.md` Progress Summary table vs actual completion

**Checks — docs/ drift:**
- `docs/skills-reference.md` sections vs `skills/` directory (missing skill sections)
- Placeholder URLs in `docs/` (`your-org`, `YOUR_USERNAME`, `YOUR_ORG`) not replaced

**Output:**
- Gap report với severity, grouped by check category
- Auto-fix option: update README.md, ROADMAP.md, skills-reference.md, replace placeholder URLs
- Suggestions cho complex gaps
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/audit.md
</execution_context>

<context>
Optional flags:
- `--docs` : Check documentation files only (ARCHITECTURE.md alignment)
- `--arch` : Check architecture alignment only
- `--drift` : Check ROOT + docs/ drift only (README, ROADMAP, skills-reference)
- `--fix` : Auto-fix all detected gaps
- `--report` : Generate report file without fixing
- `--silent` : Only output if gaps found
- `--scope skills` : Audit skills only
- `--scope workflows` : Audit workflows only
- `--scope docs` : Audit docs/ directory only
- `--scope root` : Audit ROOT documents (README, ROADMAP) only
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/audit.md`

### Audit Steps

1. **Collect Actual State**
   ```bash
   # Skills
   ls -d skills/vp-*/ | wc -l
   ls -d skills/vp-*/ | xargs -I{} basename {}
   
   # Workflows
   ls workflows/*.md | wc -l
   ls workflows/*.md | xargs -I{} basename {} .md
   
   # CLI Commands
   node bin/vp-tools.cjs help | grep "^\s\s[a-z]"
   ```

2. **Parse ARCHITECTURE.md**
   - Extract skills count from "SKILLS LAYER (N)"
   - Extract workflows count from "WORKFLOWS LAYER (N)"
   - Extract CLI commands count
   - Extract listed items

3. **Compare & Report**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    VIEPILOT ► AUDIT REPORT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
    Skills:     12 actual, 12 documented  ✅
    Workflows:  10 actual, 10 documented  ✅
    CLI:        13 actual, 13 documented  ✅
   
    Gaps Found: 0
    Status: All documentation in sync!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

4. **If Gaps Found**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    VIEPILOT ► AUDIT REPORT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
    Skills:     14 actual, 12 documented  ⚠️ GAP
      Missing in docs: vp-new1, vp-new2
   
    Workflows:  10 actual, 10 documented  ✅
    CLI:        15 actual, 13 documented  ⚠️ GAP
      Missing in docs: newcmd1, newcmd2
   
    Gaps Found: 2
   
    Options:
    1. Auto-fix gaps (update ARCHITECTURE.md)
    2. Generate detailed report
    3. Show diff preview
    4. Skip for now
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

5. **Auto-fix (if --fix or user chooses)**
   - Update counts in ARCHITECTURE.md
   - Add missing items to diagrams
   - Commit with standard message
</process>

<auto_hook>
## Integration with /vp-auto

After each phase complete, /vp-auto should:
1. Run quick audit (--silent mode)
2. If gaps found → warn user
3. Offer to fix before continuing

```
Phase 2 complete!

⚠️ Documentation audit found 2 gaps:
   - Skills: 12 → 14
   - CLI: 13 → 15

Fix now? (y/n)
```
</auto_hook>

<success_criteria>
- [ ] Actual counts collected correctly from filesystem
- [ ] ARCHITECTURE.md parsed correctly
- [ ] ARCHITECTURE.md gaps detected and reported
- [ ] README.md badge drift detected (version, skills, workflows counts)
- [ ] README.md table drift detected (missing skill/workflow rows)
- [ ] ROADMAP.md phase status drift detected vs PHASE-STATE.md
- [ ] docs/skills-reference.md missing sections detected
- [ ] docs/ placeholder URL drift detected
- [ ] Auto-fix updates all drifted documents correctly
- [ ] Clear actionable output grouped by check category
</success_criteria>
