# Phase 139 State — Browser Agent Suite (ENH-090+091+092+093)

## Status: ✅ done

## Tasks
| ID | Title | Status |
|----|-------|--------|
| 139.1 | browser-intake-agent.md + lib/intake/adapters/browser.cjs + vp-intake browser channel | ✅ done |
| 139.2 | browser-audit-agent.md + lib/audit/browser-runner.cjs + vp-audit --visual flag | ✅ done |
| 139.3 | research-agent upgrade + workflows/brainstorm.md + vp-brainstorm SKILL.md | ✅ done |
| 139.4 | lib/request/url-enricher.cjs + workflows/request.md URL detection + vp-request SKILL.md | ✅ done |
| 139.5 | Contract tests + CHANGELOG [3.6.0] + version bump | ✅ done |

## Version Target
3.5.0 → **3.6.0**

## Resolves
- ENH-090: browser-intake-agent for public link intake (Google Sheets/Jira/Notion/GitHub/Trello)
- ENH-091: browser-audit-agent for visual + functional dev server audit
- ENH-092: research-agent upgrade with JS-rendered page deep research
- ENH-093: vp-request URL auto-enrichment from external issue trackers

## Dependencies
- Phase 138 ✅ (ENH-088 intake schedule complete)
- External: `vercel-labs/agent-browser` — user must run `npx skills add vercel-labs/agent-browser`

## Prerequisite Note
All tasks in this phase depend on `vercel-labs/agent-browser` being available as a Claude Code skill.
Each agent/adapter MUST emit a clear error if the skill is not installed, rather than failing silently.

## Started: 2026-05-23
## Completed: 2026-05-23
