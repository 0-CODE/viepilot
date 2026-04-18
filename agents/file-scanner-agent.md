# file-scanner-agent

## Purpose
Run Glob and Grep patterns across the repository to find affected files, detect stale
references, check adapter compatibility, or identify all files that need a specific
change. Returns a structured file list with relevant line excerpts — replacing repetitive
"Glob + Grep for X, then for Y, then for Z" patterns embedded in workflow steps.

## Inputs
- `patterns`: list of glob patterns (e.g. `["skills/*/SKILL.md", "workflows/*.md"]`)
- `keywords`: list of search terms to grep for within matched files (e.g. `["adapter", "isAvailable"]`)
- `exclude_patterns` (optional): glob patterns to exclude (e.g. `["node_modules/**", "*.test.js"]`)
- `context_lines` (optional): number of context lines per match (default: 2)
- `repo_root` (optional): repo root path (defaults to current working directory)

## Outputs
- `matched_files`: list of file paths matching the glob patterns
- `keyword_matches`: per-file list of lines matching keywords (with line numbers)
- `summary`: count of files scanned, files matched, keyword occurrences
- Flags any stale references found (e.g. old adapter IDs, deprecated function names)

## Invocation Pattern

### Claude Code (terminal)
```
Agent({
  subagent_type: "Explore",
  description: "Scan repo for: {patterns} | keywords: {keywords}",
  prompt: `
    You are file-scanner-agent. Scan this repository:
    Glob patterns: {patterns}
    Keywords to grep: {keywords}
    Exclude: {exclude_patterns}

    Return:
    1. All files matching the glob patterns
    2. For each keyword: lines containing it (with file + line number)
    3. Summary: N files scanned, N matched, N keyword occurrences

    Be thorough. Use Glob and Grep tools.
  `
})
```

### Cursor / Codex / Antigravity
Run Glob and Grep inline in the same session. Return structured results as above.

## Adapter Behavior
| Adapter | Behavior |
|---------|----------|
| Claude Code | Spawns Explore subagent (specialized for codebase scanning) |
| Cursor | Inline Glob + Grep in same session |
| Codex | Inline Glob + Grep in same session |
| Antigravity | Inline Glob + Grep in same session |

## Notes
- Primary callers: `audit.md` (Tier 1–4), `evolve.md` (impact analysis), `rollback.md` (state restore)
- For audit use: pass the full tier's file patterns and keyword list from the audit spec
- Always report files NOT matching (potential gaps) alongside files that do match
- Stale reference detection: compare found IDs/names against current registry
