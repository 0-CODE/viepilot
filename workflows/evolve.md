<purpose>
Nâng cấp hoặc mở rộng dự án: thêm features, bắt đầu milestone mới, hoặc refactor.
</purpose>

<process>

<step name="detect_state">
## 1. Detect Current State

```bash
cat .viepilot/TRACKER.md
cat .viepilot/ROADMAP.md
```

Determine:
- Current milestone progress
- Is milestone complete?
- Current version
</step>

<step name="ask_intent">
## 2. Ask User Intent

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► EVOLVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Current: {milestone_name}
 Progress: {percent}%
 Version: {version}

How would you like to evolve the project?

1. Add Feature - Add new feature to current milestone
2. New Milestone - Start a new milestone (archive current)
3. Refactor - Improve existing code without new features
```
</step>

<step name="add_feature">
## 3A. Add Feature Mode

### Gather Feature Info
```
Describe the new feature:

1. Feature name?
2. What does it do? (1-2 sentences)
3. Which services/modules affected?
4. Dependencies on existing code?
5. Estimated complexity? (S/M/L/XL)
```

### Check Architecture Compatibility
```bash
cat .viepilot/ARCHITECTURE.md
```

Questions:
- Does it fit existing architecture?
- Need new services?
- Database changes needed?
- Breaking changes?

If incompatible → suggest refactor first or discuss alternative.

### Generate Phase
Create new phase in ROADMAP.md:
```markdown
### Phase {N+1}: {Feature Name}
**Goal**: {description}
**Estimated Tasks**: {count}
**Dependencies**: Phase {N}

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| {N+1}.1 | ... | ... |
| {N+1}.2 | ... | ... |

**Verification**:
- [ ] {criteria}
```

### Create Phase Directory
```bash
mkdir -p .viepilot/phases/{NN}-{feature-slug}/tasks/
```

Create:
- SPEC.md
- PHASE-STATE.md
- Task files

### Update State
- Update ROADMAP.md
- Update TRACKER.md
- Suggest version bump (MINOR)
</step>

<step name="new_milestone">
## 3B. New Milestone Mode

### Archive Current Milestone
```bash
mkdir -p .viepilot/milestones/v{current}/
mv .viepilot/ROADMAP.md .viepilot/milestones/v{current}/
```

Create MILESTONE-SUMMARY.md:
```markdown
# Milestone {version} - {name} Summary

## Completed: {date}

## Phases
{list phases with status}

## Key Achievements
- {achievement}

## Decisions Made
{from TRACKER.md}

## Metrics
- Total tasks: {count}
- Completed: {count}
- Skipped: {count}

## Lessons Learned
- {lesson}
```

Create git tag:
```bash
git tag -a v{version} -m "Release v{version} - {milestone_name}"
```

### Start New Milestone
```
New milestone details:

1. Milestone name?
2. Milestone goal? (1-2 sentences)
3. Target features?
```

Options:
- Route to `/vp-brainstorm --new` for full brainstorm
- Quick setup with minimal questions

### Generate New ROADMAP.md
Either from brainstorm or quick setup.

### Update Version
- Bump MAJOR (breaking) or MINOR (features)
- Update all version references
</step>

<step name="refactor">
## 3C. Refactor Mode

### Analyze Code
```
What would you like to refactor?

1. Auto-detect - Analyze code for improvement areas
2. Specific area - Tell me what to refactor
```

**Auto-detect checks:**
- Code duplication
- Long methods/classes
- Architecture violations
- Performance issues
- Technical debt markers (TODO, FIXME, HACK)

### Create Refactor Tasks
For each improvement:
```markdown
| Task | Description | Impact |
|------|-------------|--------|
| R.1 | Extract {X} to separate class | Maintainability |
| R.2 | Optimize {Y} query | Performance |
```

### Ensure Backward Compatibility
- List any breaking changes
- Document migration steps if needed
- Update ARCHITECTURE.md if structure changes

### Generate Refactor Phase
Add to ROADMAP.md as phase {N+0.5} or insert between phases.
</step>

<step name="update_version">
## 4. Update Version

Based on changes:

| Mode | Version Bump |
|------|--------------|
| Add Feature | MINOR (x.Y.z) |
| New Milestone | MAJOR or MINOR |
| Refactor | PATCH (x.y.Z) |

Update in:
- TRACKER.md
- pom.xml / package.json / version file
- CHANGELOG.md [Unreleased] section
</step>

<step name="confirm">
## 5. Confirm & Suggest Next

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► EVOLVE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Mode: {Add Feature | New Milestone | Refactor}

 Changes:
 - {change 1}
 - {change 2}

 Version: {old} → {new}

 New Phases:
 - Phase {N}: {name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Next: /vp-auto --from {new_phase}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

</process>

<success_criteria>
- [ ] User intent identified
- [ ] Architecture compatibility checked
- [ ] New phases added to ROADMAP.md
- [ ] Phase directories created
- [ ] TRACKER.md updated
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Ready for execution
</success_criteria>
