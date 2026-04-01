---
name: vp-rollback
description: "Rollback to any checkpoint safely with state preservation"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-rollback`, `/vp-rollback`, "rollback", "quay lại"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Show available checkpoints and confirm before rollback.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference  skills in ViePilot workflows.
- External skills () are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in  skill.
</scope_policy>


<objective>
Rollback đến bất kỳ checkpoint nào một cách an toàn, với backup và state preservation.

**Checkpoints:** Git tags với prefix `vp-`
- `vp-p{N}-t{M}` - Start of task M in phase N
- `vp-p{N}-t{M}-done` - Task M complete
- `vp-p{N}-complete` - Phase N complete

**Safety:**
- Backup current state before rollback
- Validate target checkpoint exists
- Update HANDOFF.json after rollback
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/rollback.md
</execution_context>

<context>
Optional flags:
- `--list` : List available checkpoints
- `--to <tag>` : Rollback to specific tag
- `--latest` : Rollback to latest checkpoint
- `--force` : Skip confirmation
- `--dry-run` : Show what would happen
</context>

<process>

### 1. List Checkpoints
```bash
git tag -l "vp-*" --sort=-creatordate
```

Display with dates and descriptions:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AVAILABLE CHECKPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 TAG                    DATE         COMMIT
 vp-p1-complete         2026-03-30   Phase 1 done
 vp-p1-t1-done          2026-03-30   Task 1.1 done
 vp-p1-t1               2026-03-30   Start task 1.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Validate Target
- Check tag exists
- Show files that will change
- Show commits that will be undone

### 3. Backup Current State
```bash
# Backup HANDOFF.json
cp .viepilot/HANDOFF.json .viepilot/HANDOFF.backup.json

# Create safety tag
git tag vp-backup-{timestamp}
```

### 4. Execute Rollback
```bash
# Reset to checkpoint
git reset --hard {tag}

# Or soft reset (keep changes staged)
git reset --soft {tag}
```

### 5. Update State
Update HANDOFF.json to reflect rollback position.
Update TRACKER.md if needed.

### 6. Confirm Success
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ROLLBACK COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 From: {previous_commit}
 To:   {tag} ({commit})
 
 Backup tag: vp-backup-{timestamp}
 
 To undo this rollback:
   git reset --hard vp-backup-{timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</process>

<success_criteria>
- [ ] Checkpoints listed with dates
- [ ] Target validated before rollback
- [ ] Backup created before changes
- [ ] State files updated after rollback
- [ ] Undo instructions provided
</success_criteria>
