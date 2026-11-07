# doc-sync-agent

## Purpose
Apply the same change to multiple `.md` files in a single coordinated operation —
replacing N sequential Edit calls with one agent invocation. Primary use cases:
adding adapter rows to all 17 SKILL.md files, updating version banners across skills,
or inserting new sections into many workflow files. Triggered automatically when a task
has ≥5 files of the same type in its `## Paths` block.

## Inputs
- `file_pattern`: glob pattern for target files (e.g. `"skills/*/SKILL.md"`)
- `change_mode`: `insert-row` | `replace` | `append-section` | `insert-after`
- `anchor`: the text to find as insertion/replacement anchor
  - For `insert-row`: the row to insert after (e.g. `"| Codex CLI |"`)
  - For `replace`: the exact string to replace
  - For `append-section`: the section heading to append after
  - For `insert-after`: the text block after which to insert
- `content`: the new text/row/section to insert or use as replacement
- `exclude_pattern` (optional): files to skip (e.g. `"skills/vp-info/SKILL.md"`)
- `dry_run` (optional, default `false`): report planned changes without writing

## Outputs
- List of files successfully updated
- List of files skipped (if anchor not found — file may not have that section yet)
- Diff count: N insertions / N replacements across N files
- Dry run report (if `dry_run: true`)

## Invocation Pattern

### Claude Code (terminal)
```
Agent({
  subagent_type: "general-purpose",
  description: "Bulk update {file_pattern}: {change_mode}",
  prompt: `
    You are doc-sync-agent. Apply this change to all matching files:
    Pattern: {file_pattern}
    Mode: {change_mode}
    Anchor: {anchor}
    Content to insert/replace:
    {content}

    For each file: read it, locate the anchor, apply the change, write back.
    If anchor not found in a file: skip and report it.
    Report: N updated, N skipped, list of each.
  `
})
```

### Cursor / Codex / Antigravity
Apply changes file-by-file inline in the same session. Report updated vs skipped counts.

## Adapter Behavior
| Adapter | Behavior |
|---------|----------|
| Claude Code | Spawns general-purpose subagent with multi-file write access |
| Cursor | Sequential inline edits in same session |
| Codex | Sequential inline edits in same session |
| Antigravity | Sequential inline edits in same session |

## Notes
- Trigger threshold: ≥5 identical file types in a task's `## Paths` block
- Always check anchor exists before writing — never write to wrong location
- Report skipped files prominently — they may indicate the anchor text needs updating
- For SKILL.md table rows: the anchor is typically the last row before `|` end of table
- Dry run is recommended before bulk changes to verify anchor detection

<!-- tool-policy:start -->

## Tool Policy (ENH-125)

<tool_policy>

## Tool Policy for Claude Code

### Required Tools

| Operation | Tool |
|---|---|
| Read files | Read |
| Search files | Grep |
| Edit files | Edit |
| Create files | Write |
| Run programs (git, npm, vp-tools) | Bash |
| Track task list | TodoWrite or TaskCreate/TaskUpdate/TaskList |
| Delegate sub-tasks | Task (Agent tool) |

### Forbidden Patterns

**Do NOT** edit, read, or search files via:
- File edits: `sed -i`, `perl -pi`, `awk > file`, `> file`, `>> file`, `tee`, `cat <<EOF > file`, Python/Node `writeFileSync`
- File reads: `cat file`, `head file`, `tail file`, `sed -n`
- Searches: `grep file`, `find path`, `rg file`

### Allowed Patterns

**Do** use shell for:
- `git …`, `npm test`, `npx jest …`, `node bin/vp-tools.cjs …`, `ls`, `mkdir -p`
- Pipes: `… | grep`, `… 2>&1`, `… > /dev/null`

See `templates/tool-policy.md` for full rules and exceptions.

</tool_policy>

<!-- tool-policy:end -->