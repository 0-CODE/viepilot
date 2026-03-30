---
name: vp-evolve
description: "Nâng cấp, thêm features, hoặc bắt đầu milestone mới"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-evolve`, `/vp-evolve`, "evolve", "thêm feature", "milestone mới", "upgrade"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với options.

## C. Tool Usage
Use Cursor tools: `Shell`, `StrReplace`, `Read`, `Write`, `Glob`, `Grep`, `Task`
</cursor_skill_adapter>

<objective>
Nâng cấp hoặc mở rộng dự án sau khi hoàn thành milestone hoặc cần thêm features.

**Modes:**
1. **Add Feature** - Thêm feature vào milestone hiện tại
2. **New Milestone** - Bắt đầu milestone mới
3. **Refactor** - Cải thiện code hiện có

**Updates:**
- `.viepilot/ROADMAP.md`
- `.viepilot/TRACKER.md`
- `.viepilot/ARCHITECTURE.md` (nếu có changes)
- `CHANGELOG.md`
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/evolve.md
</execution_context>

<context>
Optional flags:
- `--feature` : Add feature mode
- `--milestone` : New milestone mode
- `--refactor` : Refactor mode
</context>

<process>

### Step 1: Detect Current State
```bash
cat .viepilot/TRACKER.md
```
- Check milestone progress
- Check if current milestone complete

### Step 2: Ask User Intent
```
How would you like to evolve the project?

1. Add Feature - Add new feature to current milestone
2. New Milestone - Start a new milestone (archive current)
3. Refactor - Improve existing code without new features
```

### Step 3A: Add Feature Mode
```yaml
flow:
  1. Ask feature description
  2. Mini brainstorm:
     - What does it do?
     - Which services affected?
     - Dependencies on existing code?
  3. Check architecture compatibility
  4. Generate new phase in ROADMAP.md
  5. Create phase directory with SPEC.md
  6. Update TRACKER.md
  
output:
  - New phase added to ROADMAP.md
  - Phase directory created
  - Ready for /vp-auto
```

### Step 3B: New Milestone Mode
```yaml
flow:
  1. Archive current milestone:
     - Move ROADMAP.md → milestones/v{X}/
     - Create MILESTONE-SUMMARY.md
     - Tag git: v{X}.0.0
  2. Start brainstorm for new scope:
     - Route to /vp-brainstorm --new
  3. After brainstorm, route to /vp-crystallize
  4. Carry over:
     - PROJECT-META.md (unchanged)
     - SYSTEM-RULES.md (unchanged)
     - Learnings and patterns
     
output:
  - Previous milestone archived
  - New ROADMAP.md created
  - Version bumped (MAJOR or MINOR)
```

### Step 3C: Refactor Mode
```yaml
flow:
  1. Analyze code for improvement areas:
     - Code duplication
     - Performance issues
     - Architecture violations
     - Technical debt
  2. Create refactor tasks
  3. Ensure backward compatibility
  4. Generate refactor phase
  5. Update ARCHITECTURE.md if structure changes

output:
  - Refactor phase added
  - Backward compatibility documented
  - Ready for /vp-auto
```

### Step 4: Update Version
Based on changes:
- **Add Feature** → MINOR bump
- **New Milestone** → MAJOR or MINOR bump
- **Refactor** → PATCH bump (no behavior change)

Update in:
- TRACKER.md
- pom.xml / package.json
- CHANGELOG.md [Unreleased] section

### Step 5: Confirm & Suggest Next
```
✓ Evolution complete

Mode: {mode}
Changes:
- {list changes}

Version: {old} → {new}

Next action: /vp-auto --from {new_phase}
```
</process>

<success_criteria>
- [ ] User intent correctly identified
- [ ] Architecture compatibility checked
- [ ] ROADMAP.md updated with new phases
- [ ] TRACKER.md updated
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Ready for execution
</success_criteria>
