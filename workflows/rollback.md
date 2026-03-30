<purpose>
Safe rollback to any ViePilot checkpoint với backup và state preservation.
</purpose>

<process>

<step name="list_checkpoints">
## 1. List Available Checkpoints

```bash
git tag -l "vp-*" --sort=-creatordate | head -20
```

For each tag, get info:
```bash
git log -1 --format="%h %ci %s" {tag}
```

Display formatted list:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT CHECKPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 #  TAG                 DATE        DESCRIPTION
 1  vp-p2-t1            2026-03-30  Start Phase 2 Task 1
 2  vp-p1-complete      2026-03-30  Phase 1 complete
 3  vp-p1-t1-done       2026-03-30  Task 1.1-1.4 complete
 4  vp-p1-t1            2026-03-30  Start Phase 1 Task 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If `--list` flag, stop here.
</step>

<step name="select_target">
## 2. Select Rollback Target

**If --to specified:**
Validate tag exists.

**If --latest:**
Select most recent vp-* tag.

**Otherwise:**
Ask user to select from list or enter tag name.
</step>

<step name="preview_changes">
## 3. Preview Changes

Show what will happen:
```bash
# Commits to undo
git log --oneline {tag}..HEAD

# Files that will change
git diff --stat {tag}
```

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ROLLBACK PREVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Target: {tag}
 Current: {HEAD}
 
 Commits to undo: {count}
 {commit list}
 
 Files affected: {count}
 {file list}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If `--dry-run`, stop here.
</step>

<step name="confirm_rollback">
## 4. Confirm Rollback

If not `--force`:
```
⚠ WARNING: This will undo {count} commits.

Are you sure you want to rollback to {tag}? [y/N]
```

Wait for confirmation.
</step>

<step name="create_backup">
## 5. Create Backup

```bash
# Create backup tag
BACKUP_TAG="vp-backup-$(date +%Y%m%d-%H%M%S)"
git tag $BACKUP_TAG

# Backup state files
cp .viepilot/HANDOFF.json .viepilot/HANDOFF.backup.json 2>/dev/null
cp .viepilot/TRACKER.md .viepilot/TRACKER.backup.md 2>/dev/null
```

Log backup tag for undo.
</step>

<step name="execute_rollback">
## 6. Execute Rollback

```bash
# Hard reset to target
git reset --hard {tag}
```

Verify success:
```bash
git log -1 --oneline
```
</step>

<step name="update_state">
## 7. Update State Files

Parse tag to determine phase/task:
- `vp-p{N}-t{M}` → Phase N, Task M, status: in_progress
- `vp-p{N}-t{M}-done` → Phase N, Task M+1, status: not_started
- `vp-p{N}-complete` → Phase N+1, Task 1, status: not_started

Update HANDOFF.json accordingly.
Update TRACKER.md progress.
</step>

<step name="confirm_success">
## 8. Confirm Success

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ROLLBACK COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Rolled back to: {tag}
 Commits undone: {count}
 
 Backup created: {backup_tag}
 
 Current state:
   Phase: {phase}
   Task: {task}
   Status: {status}

 To undo this rollback:
   /vp-rollback --to {backup_tag}
   
   Or manually:
   git reset --hard {backup_tag}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

</process>

<error_handling>
**If tag doesn't exist:**
```
✖ Error: Checkpoint "{tag}" not found
  Hint: Run /vp-rollback --list to see available checkpoints
```

**If uncommitted changes:**
```
⚠ Warning: You have uncommitted changes
  
Options:
1. Stash changes: git stash
2. Commit changes: git commit
3. Discard changes: git checkout -- .
4. Cancel rollback
```

**If rollback fails:**
```
✖ Rollback failed: {error}
  
Recovery:
  git reset --hard {backup_tag}
```
</error_handling>

<success_criteria>
- [ ] Checkpoints listed correctly
- [ ] Preview shown before execution
- [ ] Backup created successfully
- [ ] Rollback executed cleanly
- [ ] State files updated
- [ ] Undo instructions provided
</success_criteria>
