---
name: vp-intake
description: "Import and triage tickets from Excel/M365 Online, Google Sheets, or CSV/TSV files — classify as BUG/ENH, accept/decline via AskUserQuestion, write back to source, generate TRIAGE report"
version: 1.0.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-INTAKE  v1.0.0 (fw 2.48.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>
<version_check>
## Version Update Check (ENH-072)

After displaying the greeting banner, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" check-update --silent
```

**If exit code = 1** (update available — new version printed to stdout):
Display the update notice banner before continuing. Silent otherwise.
</version_check>
<persona_context>
## Persona Context Injection (ENH-073)
At skill start, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
Inject the output as `## User Persona` context before any task execution.
Silent if command unavailable or errors.
</persona_context>

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-intake`, `/vp-intake`, "import tickets", "nhập ticket", "đọc ticket từ", "triage ticket"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>
<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- This skill **reads, classifies, and triages** external tickets — does not implement code.
- Accepted tickets create `.viepilot/requests/` files for planning via **`/vp-evolve`** → **`/vp-auto`**.
- **Exception:** User **explicit** bypass — state clearly in chat.
</implementation_routing_guard>

<objective>
Import tickets from external sources (Excel/Microsoft 365 Online, Google Sheets, CSV/TSV files),
classify them automatically as BUG/ENH/UNCLEAR, let the user triage each ticket via
AskUserQuestion (multi-select), write decisions back to the source, and generate a TRIAGE
session report.

**Creates/Updates:**
- `.viepilot/requests/BUG-N.md` or `ENH-N.md` for accepted tickets
- Source file: `VP_Status`, `VP_Comment`, `VP_RequestID` columns updated
- `.viepilot/intake/TRIAGE-{timestamp}.md` — session report
</objective>

<context>
Optional flags:
- `--channel <id>` : Skip channel selection, use this channel ID directly
- `--dry-run` : Classify and show tickets without creating requests or writing back

**Supported channel types:**
| Type | Auth | Config field |
|------|------|-------------|
| `csv` | None | `path` (local file) |
| `google_sheets` | Service Account JSON | `spreadsheet_id` + `sheet_name` |
| `excel_m365` | Azure App Registration | `workbook_id` + `sheet_name` |

**Config file:** `.viepilot/intake/channels.json`
**Credentials dir:** `.viepilot/.credentials/` (gitignored)
</context>

<process>

### Step 1: Init intake directory

```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" intake-init
```

This creates `.viepilot/intake/channels.json` (scaffold) and `.viepilot/.credentials/` if missing.

### Step 2: Load channels

Read `.viepilot/intake/channels.json`. If no channels configured (only example stubs remain),
tell the user:

```
No channels configured yet.
Edit .viepilot/intake/channels.json to add your ticket sources.
Run vp-tools intake-init to see the config scaffold.
```

### Step 3: Select channel (AUQ single-select)

```
question: "Which ticket channel do you want to import from?"
header: "Channel"
options: one per channel — label: "{channel.name} ({channel.type})", description: "{channel.id}"
```

### Step 4: Read and classify tickets

Dispatch to the correct adapter based on `channel.type`:
- `csv` → `lib/intake/adapters/csv.cjs` → `readCsv(channel, projectRoot)`
- `google_sheets` → `lib/intake/adapters/google-sheets.cjs` → `readGoogleSheet(channel, projectRoot)`
- `excel_m365` → `lib/intake/adapters/excel-m365.cjs` → `readExcelM365(channel, projectRoot)`

For each ticket, call `classifyTicket(ticket)` from `lib/intake/classifier.cjs`.
Attach `ticket._classified = 'BUG' | 'ENH' | 'UNCLEAR'`.

Display classification summary:
```
Read {N} tickets from {channel.name}
  BUG: {N}   ENH: {N}   UNCLEAR: {N}
```

If 0 tickets found, exit with message "No tickets found in this channel."

### Step 5: Triage (AUQ multi-select)

Call `runTriage(tickets, channel, projectRoot, askFn)` from `lib/intake/triage-ux.cjs`.

`askFn` is a wrapper around `AskUserQuestion`:
```js
async function askFn(question, options, multiSelect) {
  // calls AskUserQuestion tool → returns selected label(s)
}
```

For each ticket: AUQ multi-select to accept/decline, then AUQ single-select for decline reason.
UNCLEAR tickets get a 3-choice prompt: "Accept as BUG / Accept as ENH / Decline".

### Step 6: Write-back + Report

```js
await writeback(channel, triageResult, projectRoot);         // lib/intake/writeback.cjs
const reportPath = generateTriageReport(channel, triageResult, projectRoot);  // lib/intake/report.cjs
```

Write-back failure → warn (non-fatal), report is still generated.

### Step 7: Completion banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► INTAKE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Channel: {channel.name}
 Accepted: {N} → {request IDs}
 Declined: {N}
 Report: .viepilot/intake/TRIAGE-{timestamp}.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 8: Next action (AUQ single-select)

```
question: "Triage complete. What would you like to do next?"
options:
  - "Execute accepted requests → /vp-auto" (Recommended)
  - "Plan phase/tasks → /vp-evolve"
  - "Import from another channel → /vp-intake"
  - "Done for now"
```

</process>

<success_criteria>
- [ ] Channels loaded from `.viepilot/intake/channels.json`
- [ ] Correct adapter dispatched based on channel type
- [ ] Tickets classified as BUG / ENH / UNCLEAR
- [ ] AUQ multi-select triage completed with accept/decline per ticket
- [ ] Decline reasons collected and attached
- [ ] Accepted tickets auto-create `.viepilot/requests/` files
- [ ] Write-back updates source (non-fatal on failure)
- [ ] TRIAGE session report generated at `.viepilot/intake/TRIAGE-{timestamp}.md`
</success_criteria>

## Adapter Compatibility

### AskUserQuestion Tool (ENH-059)

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` — REQUIRED | Preload via ToolSearch before first call |
| Cursor (Agent/Skills) | ❌ Text fallback | Plain numbered list |
| Codex CLI | ❌ Text fallback | N/A |
| Antigravity | ❌ Text fallback | N/A |
| GitHub Copilot | ✅ Text fallback | Via `.agent.md` |

**Prompts in this skill:**
- Channel selection (Step 3)
- Ticket accept/decline multi-select (Step 5)
- Decline reason (Step 5)
- UNCLEAR handling (Step 5)
- Next action (Step 8)

## Capabilities
- Read tickets from Excel/Microsoft 365 Online via Microsoft Graph API
- Read tickets from Google Sheets via Sheets API v4
- Read tickets from local CSV/TSV files
- Auto-classify tickets as BUG/ENH/UNCLEAR with Vietnamese keyword support
- Interactive triage with AskUserQuestion (multi-select, paginated)
- Write-back VP_Status/VP_Comment/VP_RequestID to source
- Generate TRIAGE session report in .viepilot/intake/

## Tags
intake, tickets, triage, excel, google-sheets, csv, bug-import, enh-import, external-sources

## Best Practices
- Always run `intake-init` before first use to scaffold the config
- Store credentials in `.viepilot/.credentials/` — never commit them
- Review the TRIAGE report after each session for audit trail
- Use `--dry-run` to preview classification before creating requests
