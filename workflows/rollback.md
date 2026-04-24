<purpose>
Safe rollback to any ViePilot checkpoint with backup and state preservation.
</purpose>

<process>

<step name="list_checkpoints">
## 1. List Available Checkpoints

Determine page size and offset:
```
PAGE_SIZE = value of --limit flag (default: 10)
OFFSET = 0  (increments by PAGE_SIZE when user selects "Show more")
```

Fetch current page of matching tags:
```bash
git tag --sort=-creatordate \
  | rg "(^vp-p|^-*vp-backup|^[a-z0-9._-]+-vp-p|^[a-z0-9._-]+-vp-backup)" \
  | tail -n +$((OFFSET+1)) | head -$PAGE_SIZE
# [a-z0-9._-]+ matches both legacy and enriched (prefix-branch-version-vp-p*) formats (ENH-050)
```

For each tag, get info:
```bash
git log -1 --format="%h %ci %s" {tag}
```

Build label for each entry: `{tag}  {YYYY-MM-DD}  {commit subject}`

Check if more tags exist beyond current page:
```bash
TOTAL=$(git tag --sort=-creatordate \
  | rg "(^vp-p|^-*vp-backup|^[a-z0-9._-]+-vp-p|^[a-z0-9._-]+-vp-backup)" | wc -l)
HAS_MORE = (OFFSET + PAGE_SIZE) < TOTAL
```

**If `--list` flag** → display plain-text table and stop:
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
Stop here when `--list` flag active. Respects `--limit N` for table row count.

**Otherwise (interactive selection) — AUQ checkpoint picker (ENH-075):**

AUQ preload (ENH-059): call `ToolSearch` with `query: "select:AskUserQuestion"` before the
first interactive prompt. If ToolSearch fails, fall back to plain numbered list.

Call `AskUserQuestion`:
```
question: "Select a checkpoint to roll back to:"
options:
  - label: "{tag1}  {date1}  {desc1}"
  - label: "{tag2}  {date2}  {desc2}"
  - ...  (PAGE_SIZE entries)
  - label: "Show {PAGE_SIZE} more checkpoints →"   ← only if HAS_MORE is true
  - label: "Enter tag name manually"
```

**If user selects "Show {PAGE_SIZE} more →":**
`OFFSET += PAGE_SIZE` → re-fetch next page → re-call AUQ with new options.
Remove "Show more" when `(OFFSET + PAGE_SIZE) >= TOTAL`.
Loop until user selects a checkpoint or "Enter manually".

**If user selects "Enter tag name manually":**
Accept tag name from the AUQ "Other" built-in text input, or plain-text prompt on
non-AUQ adapters. Pass the entered string to Step 2 for validation.

**Text fallback (non-AUQ adapters — Cursor/Codex/Copilot/Antigravity):**
Display plain numbered list of the first PAGE_SIZE entries. User types a number or tag
name. No interactive pagination — user can re-run with `--limit N` to see more.

Pass selected tag name forward to Step 2.
</step>

<step name="select_target">
## 2. Select Rollback Target

**If `--to` specified:**
Use the provided tag directly. Validate it exists:
```bash
git tag -l "{tag}" | grep -q . || { echo "✖ Error: Checkpoint not found"; exit 1; }
```

**If `--latest`:**
Select the most recent matching tag (first result from the tag list query, OFFSET=0).

**Otherwise — bind AUQ result from Step 1:**

Extract the target tag from the user's selection:
- If user selected a checkpoint label: take the first whitespace-delimited token.
  e.g. `"viepilot-vp-main-2.42.0-vp-p108-t5-done  2026-04-24  Phase 108..."` → `viepilot-vp-main-2.42.0-vp-p108-t5-done`
- If user selected "Enter tag name manually": use the text they typed (AUQ "Other" input,
  or the plain-text string entered on non-AUQ adapters).

Validate the extracted tag exists before proceeding:
```bash
git tag -l "{extracted_tag}" | grep -q . || {
  echo "✖ Error: Checkpoint \"{extracted_tag}\" not found"
  echo "  Hint: Run /vp-rollback --list to see available checkpoints (add --limit 50 for more) (add --limit 50 for more)"
  exit 1
}
```

**Text fallback (non-AUQ adapters):**
User typed a number from the list or a raw tag name. Parse the number to look up
the corresponding tag in the fetched page, or use the typed string directly.
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
TAG_PREFIX="$(vp-tools tag-prefix --raw)"
BACKUP_TAG="${TAG_PREFIX}-backup-$(date +%Y%m%d-%H%M%S)"
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

Parse tag to determine phase/task — 3 supported formats (ENH-050):

- **Format A** (legacy): `vp-p{N}-t{M}[-done]` or `vp-p{N}-complete`
- **Format B** (project-scoped): `{project}-vp-p{N}-t{M}[-done]` or `{project}-vp-p{N}-complete`
- **Format C** (enriched): `{project}-{branch}-{version}-vp-p{N}-t{M}[-done|-complete]`

For all formats, extract N and M by matching the terminal segments:

```bash
TAG="{selected_tag}"

# Extract phase number — works for all 3 formats
PHASE_NUM=$(echo "$TAG" | grep -oE 'vp-p[0-9]+' | grep -oE '[0-9]+$')

# Extract task number if present
TASK_NUM=$(echo "$TAG" | grep -oE '\-t[0-9]+' | tail -1 | grep -oE '[0-9]+$')

# Determine restore intent
if echo "$TAG" | grep -q '\-complete$'; then
  # Phase complete tag → restore to start of next phase
  RESTORE_PHASE=$((PHASE_NUM + 1))
  RESTORE_TASK=1
  RESTORE_STATUS="not_started"
elif echo "$TAG" | grep -q '\-done$'; then
  # Task done tag → restore to start of next task
  RESTORE_PHASE=$PHASE_NUM
  RESTORE_TASK=$((TASK_NUM + 1))
  RESTORE_STATUS="not_started"
else
  # Task start tag → restore to in-progress state
  RESTORE_PHASE=$PHASE_NUM
  RESTORE_TASK=${TASK_NUM:-1}
  RESTORE_STATUS="in_progress"
fi
```

Update HANDOFF.json with `RESTORE_PHASE`, `RESTORE_TASK`, `RESTORE_STATUS`.
Update TRACKER.md progress accordingly.
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
  Hint: Run /vp-rollback --list to see available checkpoints (add --limit 50 for more)
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
