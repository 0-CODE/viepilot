<purpose>
Tạo và quản lý requests cho dự án: bugs, features, enhancements, tech debt, và brainstorm continuation.
</purpose>

<process>

<step name="init">
## 1. Initialize

Check project exists:
```bash
if [ ! -f ".viepilot/TRACKER.md" ]; then
  echo "No ViePilot project found. Run /vp-crystallize first."
  exit 1
fi

# Create requests directory if not exists
mkdir -p .viepilot/requests
```

Get next request number:
```bash
# Count existing requests
BUG_COUNT=$(ls .viepilot/requests/BUG-*.md 2>/dev/null | wc -l)
FEAT_COUNT=$(ls .viepilot/requests/FEAT-*.md 2>/dev/null | wc -l)
ENH_COUNT=$(ls .viepilot/requests/ENH-*.md 2>/dev/null | wc -l)
DEBT_COUNT=$(ls .viepilot/requests/DEBT-*.md 2>/dev/null | wc -l)
```
</step>

<step name="detect_type">
## 2. Detect Request Type

Parse `{{VP_ARGS}}` for type flag:
- `--bug` → Bug Report
- `--feature` → Feature Request
- `--enhance` → Enhancement
- `--debt` → Technical Debt
- `--brainstorm` → Brainstorm Continuation
- `--list` → List Requests

If no flag, ask user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What type of request?

1. 🐛 Bug Report - Something is broken
2. ✨ Feature Request - New functionality
3. 🔧 Enhancement - Improve existing feature
4. 🧹 Technical Debt - Code cleanup/refactor
5. 💡 Brainstorm - Explore new ideas
6. 📋 List Requests - View pending requests
```
</step>

<step name="list_requests">
## 3. List Requests (if --list)

```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PENDING REQUESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "| ID | Type | Title | Priority | Status |"
echo "|----|------|-------|----------|--------|"

for file in .viepilot/requests/*.md; do
  # Parse each file and display
done
```

After listing, offer options:
```
Options:
1. Work on a request
2. Create new request
3. Close a request
```
</step>

<step name="gather_bug">
## 4A. Gather Bug Details

```
🐛 Bug Report

1. Title/Summary?
   > 

2. What happened? (actual behavior)
   > 

3. What should happen? (expected behavior)
   > 

4. Steps to reproduce?
   > 

5. Which part of system affected?
   (service/module/file)
   > 

6. Severity?
   1. Critical - System down, data loss
   2. High - Major feature broken
   3. Medium - Feature impaired
   4. Low - Minor issue
   > 

7. Any error messages or logs?
   > 
```

Create `BUG-{N}.md`:
```markdown
# 🐛 BUG: {TITLE}

## Meta
- **ID**: BUG-{N}
- **Type**: Bug
- **Status**: new
- **Severity**: {SEVERITY}
- **Created**: {timestamp}
- **Affected**: {SERVICE/MODULE}

## Summary
{TITLE}

## Actual Behavior
{ACTUAL}

## Expected Behavior
{EXPECTED}

## Steps to Reproduce
1. {step1}
2. {step2}
3. {step3}

## Error Messages
```
{ERROR_LOGS}
```

## Environment
- Version: {from TRACKER.md}
- Phase: {current_phase}

## Acceptance Criteria
- [ ] Bug no longer occurs
- [ ] Root cause identified
- [ ] Test added to prevent regression

## Fix
{To be filled when resolved}
```
</step>

<step name="gather_feature">
## 4B. Gather Feature Details

```
✨ Feature Request

1. Title/Summary?
   > 

2. What problem does this solve?
   > 

3. Describe the feature:
   > 

4. Who benefits from this?
   > 

5. Priority?
   1. Must-have - Critical for release
   2. Should-have - Important but not blocking
   3. Nice-to-have - Can defer
   > 

6. Any specific requirements?
   > 

7. Want to brainstorm this in detail? (y/n)
   > 
```

If brainstorm = yes:
→ Route to mini brainstorm session
→ Append discussion to feature file

Create `FEAT-{N}.md`:
```markdown
# ✨ FEATURE: {TITLE}

## Meta
- **ID**: FEAT-{N}
- **Type**: Feature
- **Status**: new
- **Priority**: {PRIORITY}
- **Created**: {timestamp}

## Summary
{TITLE}

## Problem Statement
{PROBLEM}

## Proposed Solution
{DESCRIPTION}

## Target Users
{WHO_BENEFITS}

## Requirements
{SPECIFIC_REQUIREMENTS}

## Acceptance Criteria
- [ ] {criteria_1}
- [ ] {criteria_2}
- [ ] {criteria_3}

## Brainstorm Notes
{If brainstormed}

## Implementation Plan
{To be filled when triaged}
```
</step>

<step name="gather_enhancement">
## 4C. Gather Enhancement Details

```
🔧 Enhancement Request

1. Title/Summary?
   > 

2. Which existing feature to enhance?
   > 

3. Current behavior:
   > 

4. Desired improvement:
   > 

5. Why is this valuable?
   > 

6. Breaking changes? (y/n)
   > 
```

Create `ENH-{N}.md`:
```markdown
# 🔧 ENHANCEMENT: {TITLE}

## Meta
- **ID**: ENH-{N}
- **Type**: Enhancement
- **Status**: new
- **Created**: {timestamp}
- **Breaking**: {YES/NO}

## Summary
{TITLE}

## Current Feature
{EXISTING_FEATURE}

## Current Behavior
{CURRENT}

## Desired Improvement
{IMPROVEMENT}

## Value Proposition
{WHY_VALUABLE}

## Acceptance Criteria
- [ ] Enhancement implemented
- [ ] Existing functionality preserved
- [ ] Documentation updated

## Implementation Notes
{To be filled}
```
</step>

<step name="gather_debt">
## 4D. Gather Tech Debt Details

```
🧹 Technical Debt

1. Title/Summary?
   > 

2. What needs cleanup?
   > 

3. Current issues:
   1. Performance
   2. Maintainability
   3. Security
   4. Code quality
   5. Other
   > 

4. Proposed solution:
   > 

5. Effort estimate?
   1. S - Few hours
   2. M - 1-2 days
   3. L - 3-5 days
   4. XL - 1+ week
   > 

6. Risk if not addressed?
   > 
```

Create `DEBT-{N}.md`:
```markdown
# 🧹 TECH DEBT: {TITLE}

## Meta
- **ID**: DEBT-{N}
- **Type**: Technical Debt
- **Status**: new
- **Effort**: {S/M/L/XL}
- **Created**: {timestamp}

## Summary
{TITLE}

## Current State
{WHAT_NEEDS_CLEANUP}

## Issues
- Type: {ISSUE_TYPE}
- Impact: {IMPACT}

## Proposed Solution
{SOLUTION}

## Risk if Not Addressed
{RISK}

## Acceptance Criteria
- [ ] Code cleaned up
- [ ] Tests still passing
- [ ] No new technical debt introduced

## Implementation Notes
{To be filled}
```
</step>

<step name="brainstorm_continuation">
## 4E. Brainstorm Continuation

```
💡 Brainstorm Continuation

You have an existing project. Let's explore new ideas.

1. What do you want to explore?
   > 

2. Is this related to an existing feature or completely new?
   1. Extend existing feature
   2. Completely new area
   3. Not sure yet
   > 

3. Any initial ideas or constraints?
   > 
```

Load project context:
```bash
cat .viepilot/PROJECT-CONTEXT.md
cat .viepilot/ARCHITECTURE.md
cat .viepilot/TRACKER.md # for current state
```

Start focused brainstorm session:
- Load existing architecture
- Understand current state
- Explore new ideas within context
- Check compatibility with existing system
- Document decisions

Save to brainstorm session file with prefix `continuation-`:
`docs/brainstorm/continuation-{YYYY-MM-DD}-{topic}.md`

After brainstorm:
```
Brainstorm complete!

Summary:
- Topic: {topic}
- Key ideas: {count}
- Decisions: {count}

Options:
1. Create Feature request from this
2. Create Enhancement request
3. Add to backlog for later
4. Discard
```
</step>

<step name="triage">
## 5. Triage & Route

Based on type and priority:

### Critical Bug
```
⚠️ CRITICAL BUG DETECTED

This needs immediate attention.

Options:
1. Fix immediately (pause current work)
2. Add to top of current phase
3. Schedule for next slot

Current phase: {phase}
Current task: {task}
```

If option 1:
- Save current state (like /vp-pause)
- Create emergency fix phase
- Route to /vp-auto

### High Priority Feature
```
Feature logged: FEAT-{N}

Options:
1. Add to current milestone
2. Brainstorm more first
3. Schedule for next milestone
4. Start working now
```

### Regular Request
```
Request logged: {TYPE}-{N}

Added to backlog.

Options:
1. Continue with current work
2. Work on this instead
3. Create another request
```
</step>

<step name="update_tracker">
## 6. Update Tracking

Add to `.viepilot/TRACKER.md`:

```markdown
## Backlog

### Pending Requests
| ID | Type | Title | Priority | Status |
|----|------|-------|----------|--------|
| BUG-001 | 🐛 | {title} | {priority} | new |
| FEAT-002 | ✨ | {title} | {priority} | new |
```

Commit:
```bash
git add .viepilot/requests/
git add .viepilot/TRACKER.md
git commit -m "chore: add {TYPE}-{N} - {TITLE}"
git push
```
</step>

<step name="confirm">
## 7. Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► REQUEST CREATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ID: {TYPE}-{N}
 Type: {TYPE_EMOJI} {TYPE}
 Title: {TITLE}
 Priority: {PRIORITY}
 Status: new

 File: .viepilot/requests/{TYPE}-{N}.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 /vp-request --list    View all requests
 /vp-auto              Start working on requests
 /vp-request           Create another request
 /vp-status            See overall progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

</process>

<success_criteria>
- [ ] Request type correctly identified
- [ ] All relevant details gathered
- [ ] Request file created
- [ ] TRACKER.md updated with backlog item
- [ ] Git committed
- [ ] Appropriate routing suggested
</success_criteria>
