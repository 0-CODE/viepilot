# ViePilot Troubleshooting Guide

Common issues and solutions when using ViePilot.

---

## Installation Issues

### `./install.sh: Permission denied`

**Cause**: Script not executable.

```bash
chmod +x install.sh
./install.sh
```

---

### `vp-tools: command not found`

**Cause**: ViePilot bin not in PATH.

```bash
# Check if symlink exists
ls -la ~/.local/bin/vp-tools

# If missing, re-run dev install
cd /path/to/viepilot
./dev-install.sh
```

---

### Skills not showing in Cursor

**Cause**: Skills not copied to the right directory.

```bash
ls ~/.cursor/skills/vp-*/SKILL.md
```

If empty:
```bash
cd /path/to/viepilot
cp -r skills/vp-* ~/.cursor/skills/
```

Then restart Cursor.

---

## Project Initialization Issues

### `/vp-brainstorm` doesn't produce a template

**Cause**: AI model not following the skill structure.

**Fix**: Ensure Cursor is using Claude (not GPT). Check Cursor settings → Model.

---

### `vp-tools init` fails: "No ViePilot project found"

**Cause**: Running command outside a project with `.viepilot/` directory.

```bash
# Verify .viepilot/ exists
ls .viepilot/

# If missing, run crystallize first
# In Cursor: /vp-crystallize
```

---

### `HANDOFF.json` is corrupted

**Cause**: Interrupted write during state save.

```bash
# Check the file
cat .viepilot/HANDOFF.json

# If invalid JSON, delete and let ViePilot recreate
rm .viepilot/HANDOFF.json
# In Cursor: /vp-auto  (will start from TRACKER.md state)
```

---

## Autonomous Execution Issues

### `/vp-auto` starts but stops immediately

**Cause**: TRACKER.md says all phases complete.

```bash
cat .viepilot/TRACKER.md
# Check "Current Phase" section

# If ROADMAP.md has new phases not in TRACKER.md:
# In Cursor: /vp-status
# Then: /vp-auto --from N  (where N is the new phase)
```

---

### Phase stuck at 0% for a long time

**Cause**: AI model is not executing the task — just planning.

**Fix**: Be more direct in the chat:

> "Execute the task now. Create the files. Don't just describe what to do."

Or use:
```
/vp-task start 1
```

---

### Task marked done but code wasn't written

**Cause**: AI confirmed acceptance criteria without verifying actual implementation.

```bash
# Check if files exist
ls -la src/

# Roll back to before the task
/vp-rollback
# Select the task's start checkpoint

# Restart with explicit instruction
/vp-task retry 1
```

---

### Git tag creation fails: "tag already exists"

**Cause**: Previous run created the tag.

```bash
# Delete the conflicting tag
git tag -d vp-p2-t3

# Resume
/vp-auto --from 2
```

---

## CLI Issues

### `vp-tools progress` shows 0% even after tasks done

**Cause**: PHASE-STATE.md uses different status format than expected.

ViePilot's `progress` command looks for `✅ Done` pattern in PHASE-STATE.md.

```bash
# Check what's in the file
grep -i "done\|complete" .viepilot/phases/*/PHASE-STATE.md

# If status uses different emoji/text, manually update:
# Change "✔ Complete" to "✅ Done"
```

---

### `vp-tools version bump` shows wrong version

**Cause**: TRACKER.md version block uses non-standard format.

Expected format in TRACKER.md:
```markdown
### Current Version
\`\`\`
0.1.0
\`\`\`
```

If your TRACKER.md uses a different format, `version bump` may not parse correctly.
Edit TRACKER.md to match this exact format.

---

## State Recovery

### How to fully reset ViePilot state

```bash
# Option 1: Reset to a checkpoint
/vp-rollback
# Select earliest checkpoint

# Option 2: Manual reset (nuclear option)
vp-tools reset all --force
# WARNING: Resets all task statuses to not_started
# Does NOT undo git commits

# Option 3: Start fresh
rm -rf .viepilot/
# In Cursor: /vp-crystallize  (re-generates .viepilot/)
```

---

### Resume after a crash

```bash
# Check last known state
cat .viepilot/HANDOFF.json

# Check git log for last checkpoint tag
git log --oneline --tags

# Resume from last complete phase
/vp-resume
# Or specify:
/vp-auto --from 2
```

---

## Performance Issues

### `/vp-auto` is very slow

**Common causes**:
1. Large codebase being read every task → Use minimal context loading
2. AI generating overly verbose responses → Not controllable, but `/vp-auto --fast` skips optional steps
3. Many small tasks → Consider merging small tasks in ROADMAP.md

---

### Tests taking too long in CI

**Cause**: Integration tests spawn subprocesses per test.

```bash
# Check test timing
npx jest --verbose

# Run only unit tests in CI for fast feedback
npx jest tests/unit/ --no-coverage
```

---

## Getting Help

1. **Check the status**: `/vp-status` — shows blockers, current state
2. **Debug mode**: `/vp-debug investigate: <your issue>`
3. **GitHub Issues**: https://github.com/0-CODE/viepilot/issues
4. **Review HANDOFF.json**: Contains full context of last session
