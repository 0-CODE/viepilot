---
name: vp-request
description: "Create new request: feature, bug fix, enhancement, or brainstorm continuation"
version: 0.2.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-request`, `/vp-request`, "request", "yêu cầu", "bug", "lỗi", "feature mới", "nâng cấp"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

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

- This skill only **creates requests**, **backlog**, **triage** (`.viepilot/requests/*`, `TRACKER`, sometimes suggests ROADMAP) — does **not** implement default shipping code (`lib/`, `tests/`, `bin/`, `workflows/`, `skills/` of the repo, etc.).
- **After request:** **`/vp-evolve`** (ROADMAP + phase + tasks + plan) → **`/vp-auto`** (execute). See `workflows/request.md`.
- **Exception:** User **explicit** (*hotfix now*, *fix in this chat*, *bypass planning*) — must **state clearly** the bypass in chat.
- **Do not** suggest *”Start working now”* as direct implementation in this thread; use evolve → auto instead.
</implementation_routing_guard>


<objective>
Create and manage requests for the project under development:
- Bug report and fix
- Feature request
- Enhancement/Improvement
- Technical debt
- Brainstorm continuation for new ideas

**Creates/Updates:**
- `.viepilot/requests/{TYPE}-{NUMBER}.md`
- `.viepilot/TRACKER.md` (add to backlog)
- `.viepilot/ROADMAP.md` (if approved)

**Routes to:** `/vp-auto` or `/vp-evolve` depending on request type
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/request.md
</execution_context>

<context>
Optional flags:
- `--bug` : Bug report mode
- `--feature` : Feature request mode
- `--enhance` : Enhancement mode
- `--debt` : Technical debt mode
- `--brainstorm` : Brainstorm continuation mode
- `--list` : List pending requests
- `--quick` : Quick mode (minimal questions)
</context>

<process>
Execute workflow from `@$HOME/{envToolDir}/workflows/request.md`

### Step 1: Detect Request Type

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

### Step 2: Gather Request Details

#### For Bug Report (🐛)
```
Bug Details:

1. Title/Summary?
2. What happened? (actual behavior)
3. What should happen? (expected behavior)
4. Steps to reproduce?
5. Which part of system? (service/module)
6. Severity? (critical/high/medium/low)
7. Any error messages/logs?
```

#### For Feature Request (✨)
```
Feature Details:

1. Title/Summary?
2. What problem does it solve?
3. Describe the feature
4. Who benefits from this?
5. Priority? (must-have/should-have/nice-to-have)
6. Any specific requirements?

Do you want to brainstorm this feature in detail? (y/n)
→ If yes: route to mini brainstorm session
```

#### For Enhancement (🔧)
```
Enhancement Details:

1. Title/Summary?
2. Which existing feature to enhance?
3. Current behavior
4. Desired improvement
5. Why is this valuable?
6. Breaking changes? (yes/no)
```

#### For Technical Debt (🧹)
```
Tech Debt Details:

1. Title/Summary?
2. What needs cleanup?
3. Current issues (performance/maintainability/etc)
4. Proposed solution
5. Effort estimate? (S/M/L/XL)
6. Risk if not addressed?
```

#### For Brainstorm (💡)
```
Brainstorm Topic:

1. What do you want to explore?
2. Related to existing feature or completely new?
3. Any initial ideas?

→ Route to full brainstorm session with context
```

### Step 3: Create Request File

Create `.viepilot/requests/{TYPE}-{NUMBER}.md`:

```markdown
# {TYPE}: {TITLE}

## Meta
- **ID**: {TYPE}-{NUMBER}
- **Type**: Bug | Feature | Enhancement | Tech Debt
- **Status**: new | triaged | in_progress | done | wont_fix
- **Priority**: critical | high | medium | low
- **Created**: {timestamp}
- **Reporter**: User
- **Assignee**: AI

## Summary
{SUMMARY}

## Details
{DETAILS_BASED_ON_TYPE}

## Acceptance Criteria
- [ ] {criteria_1}
- [ ] {criteria_2}

## Related
- Phase: {if linked to phase}
- Files: {affected files}
- Dependencies: {related requests}

## Discussion
{Any additional context from brainstorm}

## Resolution
{Filled when resolved}
```

### Step 4: Triage & Route

Based on request type and priority:

**Critical Bug:**
```
⚠️ Critical bug detected!

Options:
1. Fix immediately (pause current work)
2. Add to top of current phase
3. Schedule for next available slot
```

**Feature/Enhancement:**
```
Request logged: {TYPE}-{NUMBER}

Options:
1. Add to current milestone backlog
2. Brainstorm in detail first
3. Schedule for next milestone
4. Plan then execute: `/vp-evolve` → `/vp-auto` (not direct implement here unless explicit override)
```

**Tech Debt:**
```
Tech debt logged: {TYPE}-{NUMBER}

Options:
1. Add to refactor backlog
2. Include in next phase
3. Create dedicated cleanup phase
```

### Step 5: Update Tracking

Update `.viepilot/TRACKER.md`:
```markdown
## Backlog

### Pending Requests
| ID | Type | Title | Priority | Status |
|----|------|-------|----------|--------|
| BUG-001 | 🐛 | Login timeout | high | new |
| FEAT-002 | ✨ | Export feature | medium | triaged |
```

### Step 6: Confirm & Next Steps

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► REQUEST CREATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ID: {TYPE}-{NUMBER}
 Type: {TYPE}
 Title: {TITLE}
 Priority: {PRIORITY}
 Status: {STATUS}

 File: .viepilot/requests/{TYPE}-{NUMBER}.md

 Next:
 - /vp-request --list    View all requests
 - /vp-evolve            Plan phase/tasks + ROADMAP (before code)
 - /vp-auto              Implement per task plan (after evolve)
 - /vp-request           Create another request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</process>

<success_criteria>
- [ ] Request type identified
- [ ] Details gathered appropriately
- [ ] Request file created
- [ ] TRACKER.md updated
- [ ] Appropriate routing suggested
</success_criteria>
