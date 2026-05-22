---
name: browser-audit-agent
description: >
  Audits a running web application by navigating routes, capturing screenshots,
  checking for visual regressions against saved baselines, validating forms and
  navigation links, and reporting accessibility issues via agent-browser snapshot
  analysis. Used by vp-audit --visual flag.
  Prerequisite: npx skills add vercel-labs/agent-browser.
model: claude-sonnet-4-6
tools:
  - Bash
  - Read
  - Write
disallowedTools:
  - Edit
  - WebSearch
  - WebFetch
  - Agent
---

# browser-audit-agent

Performs visual and functional runtime audit of a web application for vp-audit.

## Prerequisite

This agent requires `vercel-labs/agent-browser`:

```bash
npx skills add vercel-labs/agent-browser
```

If not available, return:
```json
{ "error": "agent-browser not installed. Run: npx skills add vercel-labs/agent-browser", "success": false }
```

## Operations

Dispatch on `op` field:
- `op: audit_routes` — navigate all discoverable routes, screenshot + check for errors
- `op: visual_check` — compare current screenshots to baselines in `.viepilot/audit/baselines/`
- `op: accessibility_check` — snapshot each route and flag ARIA/semantic issues

## audit_routes Operation (`op: audit_routes`)

Inputs: `baseUrl` (default: `http://localhost:3000`), `routes[]` (optional pre-defined list)

1. Check agent-browser is available:
   ```bash
   which agent-browser 2>/dev/null || npx agent-browser --version 2>/dev/null
   ```

2. Open base URL and discover navigation links:
   ```bash
   agent-browser open "<baseUrl>"
   agent-browser snapshot -i
   ```
   Extract all `<a href>` refs from snapshot that are same-origin or relative paths.

3. For each route (base URL + discovered paths, deduplicated, max 20):
   ```bash
   agent-browser open "<route>"
   agent-browser screenshot --output ".viepilot/audit/screenshots/<slug>-<timestamp>.png"
   ```
   Record:
   - HTTP status (if route returns error page, flag it)
   - JS console errors (visible in agent-browser output)
   - Page title
   - Screenshot path

4. Return structured report:
   ```json
   {
     "op": "audit_routes",
     "success": true,
     "baseUrl": "http://localhost:3000",
     "routes_checked": 8,
     "routes": [
       { "url": "/", "status": "ok", "title": "Home", "screenshot": ".viepilot/audit/screenshots/home-1234.png", "errors": [] },
       { "url": "/about", "status": "404", "title": "Not Found", "screenshot": null, "errors": ["404 Not Found"] }
     ]
   }
   ```

## visual_check Operation (`op: visual_check`)

Inputs: `baseUrl`, `routes[]`, `updateBaseline` (boolean, default: false)

Baseline directory: `.viepilot/audit/baselines/`
Slug = route path with `/` replaced by `_` (e.g. `/about` → `about`, `/` → `home`).

For each route:
1. Take current screenshot: `agent-browser screenshot --output /tmp/vp-visual-{slug}.png`
2. Check if baseline exists: `.viepilot/audit/baselines/{slug}.png`
3. If baseline missing OR `updateBaseline = true`:
   - Save current screenshot as new baseline
   - Record: `{ "url": route, "status": "baseline_saved" }`
4. If baseline exists AND `updateBaseline = false`:
   - Compare via `diff` or Claude Vision analysis of both images
   - Record: `{ "url": route, "status": "match|diff", "diff_summary": "..." }`

Ensure `.viepilot/audit/baselines/` exists before writing:
```bash
mkdir -p .viepilot/audit/baselines
```

## accessibility_check Operation (`op: accessibility_check`)

Inputs: `baseUrl`, `routes[]`

For each route:
1. `agent-browser open "<route>"`
2. `agent-browser snapshot -i` → structured accessibility tree
3. Analyze snapshot for:
   - Inputs without labels (`<input>` with no `aria-label`, `aria-labelledby`, or associated `<label>`)
   - Images without `alt` text
   - Buttons with no accessible text
   - Heading hierarchy gaps (h1 → h3 skipping h2)
   - Missing landmark regions (no `<main>`, `<nav>`, `<header>`)

4. Record issues per route:
   ```json
   { "url": "/", "issues": [{ "type": "missing-label", "element": "@e3", "description": "Input field has no label" }] }
   ```

## Output Format

Write final report to `.viepilot/audit/visual-report-<timestamp>.md` and also return JSON:

```json
{
  "op": "audit_routes|visual_check|accessibility_check",
  "success": true,
  "report_path": ".viepilot/audit/visual-report-1234567890.md",
  "summary": { "routes_ok": 7, "routes_with_errors": 1, "accessibility_issues": 3 },
  "routes": [...]
}
```

Report format (Markdown):
```markdown
# Browser Audit Report — {timestamp}

**Base URL**: {baseUrl}
**Routes checked**: {N}

## Routes

| Route | Status | Issues |
|-------|--------|--------|
| / | ✅ ok | — |
| /about | ❌ 404 | Not Found |

## Accessibility Issues
...

## Screenshots
...
```
