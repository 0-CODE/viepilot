# ViePilot Tool-Use Policy

## Overview

Every ViePilot skill and agent **must** use the host's dedicated file tools instead of shell commands for file operations. This ensures clarity, auditability, proper permission handling, and consistent diff/review experiences across all adapters.

## Required Tool Set

All skills and agents working with ViePilot must use:

- **Read** — read files (no `cat`, `head`, `tail`, `sed -n`)
- **Grep/Glob** — search files (no ad-hoc `grep`, `find`, `rg`)
- **Edit** — modify existing files (no `sed -i`, `perl -pi`, Python/Node scripts)
- **Write** — create new files or fully replace existing ones
- **Task** — delegate sub-tasks to subagents (when available)
- **TodoWrite** or **TaskCreate/TaskUpdate/TaskList** — maintain working task lists for multi-step runs

## Per-Adapter Tool Mapping

| Need | Claude Code | Cursor | Codex | Copilot | Antigravity |
|---|---|---|---|---|---|
| **Read** a file | Read | read_file | shell read (no tool) | read/readfile | file_read |
| **Search** files | Grep / Glob | grep_search / file_search | shell `rg` (no tool) | code_search | shell (no tool) |
| **Edit** a file | Edit | edit_file | apply_patch | edit/editFiles | file_write |
| **Create** a file | Write | edit_file | apply_patch | editFiles | file_write |
| **Run programs** (tests, git, vp-tools) | Bash | run_terminal_cmd | container.exec | runCommands | shell |
| **Task list** (multi-step tracking) | TodoWrite or TaskCreate/TaskUpdate/TaskList | todo_write (unverified) | update_plan | todos (unverified) | write_todos |
| **Delegate** sub-task to subagent | Task (Agent tool, multi-level) | none callable (`/multitask` is user command) | subagent (single-level) | none callable (built-in only) | none (inline only) |

### Notes on Adapter Subagents

- **Claude Code**: supports multi-level nested Agent delegation via the Task tool
- **Cursor**: `/multitask` is a user command, not a callable subagent tool; work inline
- **Codex**: supports single-level subagent delegation
- **Copilot**: explore/task are built-in agents only, not callable; work inline
- **Antigravity**: no subagent support; work inline

## Forbidden Patterns

**Do NOT** use these commands to edit, read, or search files:

### File Edits
- `sed -i` (in-place edit)
- `perl -pi` or `perl -i` (in-place edit)
- `awk … > file`, `cut … > file`, `tr … > file` (write via filters)
- `> file` or `>> file` (redirect to file)
- `tee file` (write via pipe)
- `cat <<EOF > file` (heredoc to file)
- `python` / `python3` scripts with `open(..., 'w')` or `open(..., 'a')`
- `node -e` with `writeFileSync` or `appendFileSync`

### File Reads
- `cat file` (read entire file)
- `head file` / `tail file` (read beginning/end)
- `sed -n 'x,yp' file` (read lines via sed)
- `less file` / `more file` (pager)

### File Searches
- `grep file` (search in file)
- `rg file` (ripgrep)
- `find path` (find files)

## Allowed Exceptions

The following exceptions are explicit and documented:

1. **ViePilot CLI generators**: `vp-tools …` and lib/ generators (pptx, docx)
2. **Bulk edits across ≥5 identical files**: use `doc-sync-agent` (which itself uses Edit)
3. **Adapters without dedicated tools**: Codex read/search; Cursor/Antigravity search and read may use shell as fallback
4. **Program execution**: Bash/shell for git, npm, node, vp-tools commands, tests

## Allowed Commands

**Do** use Bash/shell for these operations:

- `git …` (any git command)
- `npm test`, `npm run …` (npm scripts)
- `npx jest …` (test runners)
- `node bin/vp-tools.cjs …` (ViePilot CLI)
- `node scripts/*.cjs` or `node scripts/*.js` (Node scripts)
- `ls` (list directory)
- `mkdir -p` (create directories)
- `python scripts/office/validate.py …` (ViePilot scripts)
- `npm test 2>&1 | grep Tests:` (grep on a pipe from a program is OK)
- `node -e "require(…)"` without file writes
- Redirects to `/dev/null` or `2>&1` (for suppressing output)

## Host/System Instruction Takes Precedence

If a host system instruction (e.g., bypass-permissions mode) explicitly requires or directs use of shell commands for file operations, the host instruction takes precedence. In such cases:

- **Report the conflict** to the user or executor
- **Document why** the tool policy could not be followed
- **State the specific instruction** that overrode it

This ensures transparency and allows orchestrators to track and resolve policy violations.

## Version

Policy Version: 1.0.0 (Phase 170, ENH-125)

---

*Last updated: 2026-11-07*
