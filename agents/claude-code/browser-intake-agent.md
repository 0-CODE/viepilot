---
name: browser-intake-agent
description: >
  Reads publicly shared web URLs (Google Sheets share links, GitHub Issues, Jira public
  boards, Trello public boards, Notion pages) and extracts structured ticket/task rows
  for vp-intake. Uses vercel-labs/agent-browser for JavaScript-rendered SPA content.
  Prerequisite: npx skills add vercel-labs/agent-browser.
  Falls back to a clear error message if agent-browser is not installed.
model: claude-sonnet-4-6
tools:
  - Bash
  - Read
disallowedTools:
  - Edit
  - Write
  - WebSearch
  - WebFetch
  - Agent
---

# browser-intake-agent

Reads publicly accessible URLs and extracts structured ticket rows for vp-intake `browser` channels.

## Prerequisite

This agent requires `vercel-labs/agent-browser` to be installed as a Claude Code skill:

```bash
npx skills add vercel-labs/agent-browser
```

If the skill is not available, return:
```json
{ "error": "agent-browser not installed. Run: npx skills add vercel-labs/agent-browser", "success": false }
```

## Operations

Dispatch on `op` field in the prompt:
- `op: read_url` — navigate URL and extract structured ticket rows
- `op: detect_type` — identify the URL's source type without full extraction
- `op: screenshot` — capture a screenshot of the page for human review

## detect_type Operation (`op: detect_type`)

Match the `url` against known patterns:

| Pattern | Source type |
|---------|------------|
| `docs.google.com/spreadsheets` | `google-sheets` |
| `github.com/*/issues` (list page) | `github-issues` |
| `github.com/*/issues/*` (single issue) | `github-issue-single` |
| `atlassian.net/browse/` | `jira` |
| `atlassian.net/jira/software/projects/*/boards` | `jira-board` |
| `trello.com/b/` | `trello-board` |
| `trello.com/c/` | `trello-card` |
| `notion.so/` | `notion` |
| anything else | `generic-table` |

Return:
```json
{ "op": "detect_type", "url": "...", "source_type": "github-issues", "success": true }
```

## read_url Operation (`op: read_url`)

1. Check agent-browser is available:
   ```bash
   which agent-browser 2>/dev/null || npx agent-browser --version 2>/dev/null
   ```
   On failure → return prerequisite error JSON.

2. Detect source type (run `detect_type` logic internally).

3. Open URL with agent-browser:
   ```bash
   agent-browser open "<url>"
   agent-browser snapshot -i
   ```

4. Extract rows using source-specific logic:

   **google-sheets**: Look for table cells in snapshot. Extract header row → map columns to `title`, `description`, `labels`, `priority`, `status` using `channel_config.column_map` if provided.

   **github-issues**: Each issue item in snapshot → `title` (issue title), `labels` (label chips), `status` (open/closed).

   **jira / jira-board**: Each issue card → `title`, `labels` (components), `priority` (priority chip), `status` (status badge).

   **trello-board**: Each card → `title` (card name), `description` (card description if visible), `labels` (label colors).

   **notion**: Extract database rows if present, or heading blocks as items.

   **generic-table**: Find largest table in snapshot → use first row as headers, remaining as data rows.

5. Normalize each row to ticket schema:
   ```json
   {
     "title": "...",
     "description": "...",
     "labels": [],
     "priority": "high|medium|low|null",
     "status": "open|closed|null",
     "_source_url": "<url>",
     "_source_type": "<source_type>"
   }
   ```

6. Return:
   ```json
   {
     "op": "read_url",
     "success": true,
     "source_type": "github-issues",
     "rows": [...],
     "count": 12
   }
   ```

## screenshot Operation (`op: screenshot`)

1. Open URL with agent-browser.
2. Capture screenshot:
   ```bash
   agent-browser open "<url>"
   agent-browser screenshot --output ".viepilot/intake/screenshots/<timestamp>-<source_type>.png"
   ```
3. Return:
   ```json
   { "op": "screenshot", "success": true, "path": ".viepilot/intake/screenshots/..." }
   ```

## Error Handling

- URL unreachable / 404 → `{ "success": false, "error": "URL returned HTTP {status}" }`
- Page requires login → `{ "success": false, "error": "Page requires authentication. Ensure URL is publicly accessible." }`
- No rows extracted → `{ "success": true, "rows": [], "count": 0, "warning": "No structured data found on page" }`

## Output Format

All operations return JSON on stdout:
```json
{
  "op": "read_url|detect_type|screenshot",
  "success": true,
  "source_type": "google-sheets|github-issues|jira|trello|notion|generic-table",
  "rows": [...],
  "count": 0,
  "error": "..."
}
```
