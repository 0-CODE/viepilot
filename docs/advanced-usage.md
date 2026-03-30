# ViePilot Advanced Usage Guide

Power user features and patterns for experienced ViePilot users.

---

## 1. Autonomous Mode Flags

### `--from N` — Start from a specific phase

Skip completed phases and jump directly to phase N:

```
/vp-auto --from 3
```

Useful when you've manually completed earlier phases or fixed a blocker.

---

### `--phase N` — Run only one phase

Useful for re-running a specific phase after changes:

```
/vp-auto --phase 2
```

Warning: Dependencies must be satisfied (phases before N must be complete).

---

### `--fast` — Skip optional verifications

Skips manual review prompts and optional checks. Use for rapid iteration:

```
/vp-auto --fast
```

Not recommended for final releases — quality gates are important.

---

### `--dry-run` — Preview without executing

See exactly what would happen without writing any files:

```
/vp-auto --dry-run
```

Output shows: phases to run, tasks in each, verification steps.

---

## 2. Mid-Project Changes

### Adding a feature (`/vp-request --feature`)

Add a new feature requirement without disrupting the current phase:

```
/vp-request --feature Add export to PDF functionality
```

ViePilot will:
1. Create a new phase (e.g., Phase 3.5) inserted between current phases
2. Add it to ROADMAP.md
3. On next `/vp-auto`, include it in the execution queue

---

### Reporting a bug (`/vp-request --bug`)

```
/vp-request --bug Login form submits but user is not authenticated
```

ViePilot creates a bug phase with investigation and fix tasks.

---

### Evolving to a new milestone (`/vp-evolve`)

When M1 is complete and you want to start M2:

```
/vp-evolve Add real-time collaboration features
```

ViePilot:
1. Archives the current milestone
2. Runs `/vp-brainstorm` for the new feature set
3. Creates M2 phases in ROADMAP.md
4. Updates TRACKER.md

---

## 3. Checkpoint Management

### Listing all checkpoints

```bash
vp-tools checkpoints
```

Output:
```
ViePilot Checkpoints

  TAG                         COMMIT    DATE
  ─────────────────────────────────────────────────────
  ✅ vp-p3-complete           a1b2c3d   2026-03-30 14:00
  ✔️  vp-p3-t4-done            b2c3d4e   2026-03-30 13:45
  ✔️  vp-p3-t3-done            c3d4e5f   2026-03-30 13:20
  📌 vp-p3-t3                  d4e5f6g   2026-03-30 12:00
  ...

  Total: 14 checkpoints
```

---

### Rolling back to a checkpoint

```
/vp-rollback
```

Interactive selection:
```
Select checkpoint to restore:
1. vp-p3-t4-done  (Phase 3 Task 4 complete)
2. vp-p3-t3-done  (Phase 3 Task 3 complete)
3. vp-p3-complete (Phase 3 complete)
```

Rollback uses `git revert` — safe, non-destructive, preserves history.

---

### Saving state manually

Before a risky operation:

```bash
vp-tools save-state
```

This updates `HANDOFF.json` with:
- Current git HEAD
- Branch name
- Node.js version
- Precise timestamp

---

## 4. Debugging Workflows

### Starting a debug session

```
/vp-debug investigate: API returns 500 after adding auth middleware
```

ViePilot creates a structured debug session:

```
.viepilot/debug/
└── DEBUG-001.md
    ├── Problem Statement
    ├── Hypotheses (tracked)
    ├── Attempts (with results)
    └── Resolution (when found)
```

---

### Continuing a debug session

```
/vp-debug continue
```

Loads the last open debug session and continues from where you left off — even across context resets.

---

### Closing a debug session

```
/vp-debug close: Fixed by removing duplicate middleware in app.js
```

Marks the session resolved and logs the fix in CHANGELOG.md.

---

## 5. State Management CLI

### Progress overview

```bash
vp-tools progress
```

Returns JSON with phase completion percentages — useful for scripts.

---

### Version management

```bash
# Get current version
vp-tools version get

# Bump for new features (Phase complete)
vp-tools version bump minor

# Bump for bug fixes only
vp-tools version bump patch

# Major breaking change
vp-tools version bump major
```

---

### Checking for conflicts

Before running `/vp-auto` on a dirty working directory:

```bash
vp-tools conflicts
```

Shows: modified, untracked, deleted, staged files. Resolve before continuing.

---

### Cleaning generated state

Safe reset of HANDOFF.json (not code files):

```bash
# Preview what would be removed
vp-tools clean --dry-run

# With confirmation prompt
vp-tools clean

# Force (no confirmation)
vp-tools clean --force
```

---

## 6. Custom Skill Creation

Create your own ViePilot skill:

```
skills/vp-mycustom/SKILL.md
```

Required structure:

```markdown
---
name: vp-mycustom
description: "What my skill does"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Triggered by: /vp-mycustom

## B. Tool Usage
Use Cursor tools: Shell, Read, Write
</cursor_skill_adapter>

<objective>
What this skill accomplishes.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/mycustom.md
</execution_context>

<success_criteria>
- [ ] Task completed correctly
</success_criteria>
```

Then create `workflows/mycustom.md` with the implementation steps.

---

## 7. CI/CD Integration

### Running ViePilot state checks in CI

```yaml
# .github/workflows/viepilot-check.yml
- name: Check project state
  run: |
    node bin/vp-tools.cjs init
    node bin/vp-tools.cjs conflicts
```

---

### Version gate on PRs

Block merges if version wasn't bumped:

```yaml
- name: Version check
  run: |
    VERSION=$(node bin/vp-tools.cjs version get --raw 2>/dev/null || echo "0.0.0")
    # Set EXPECTED to `.viepilot/TRACKER.md` "Current Version" when pinning a release
    EXPECTED="0.8.1"
    if [ "$VERSION" != "$EXPECTED" ]; then
      echo "Version mismatch: got $VERSION, expected $EXPECTED"
      exit 1
    fi
```

---

## 8. Multi-Project Usage

Use ViePilot across multiple projects simultaneously:

```bash
# Project A
cd ~/project-a
/vp-status   # shows project A state

# Project B (completely independent state)
cd ~/project-b
/vp-status   # shows project B state
```

Each project has its own `.viepilot/` directory — fully isolated.

---

## Context Loading Strategy

For long sessions or large codebases, follow AI-GUIDE.md's minimal context strategy:

```
Minimal (quick tasks):
  AI-GUIDE.md + TRACKER.md + specific file

Standard (coding tasks):
  Above + ROADMAP.md + SYSTEM-RULES.md

Full (architecture decisions):
  Above + ARCHITECTURE.md + PROJECT-CONTEXT.md
```

Never load the entire codebase — be selective.
