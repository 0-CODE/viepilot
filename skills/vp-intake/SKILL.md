---
name: vp-intake
description: "Import and triage tickets from Excel/M365 Online, Google Sheets, or CSV/TSV files — classify as BUG/ENH, accept/decline via AskUserQuestion, write back to source, generate TRIAGE report"
version: 1.1.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-INTAKE  v1.1.0 (fw 2.50.0)
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

<adapter id="claude-code">
## A. Skill Invocation
- Skill được gọi khi user mention `vp-intake`, `/vp-intake`, "import tickets", "nhập ticket", "đọc ticket từ", "triage ticket"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with options.

## C. Tool Usage
Use Claude Code tools: `Bash` (shell), `Read` (file), `Edit` + `Write` (file write/patch),
`Grep` (search), `Glob` (file patterns), `LS`, `WebSearch`, `WebFetch`,
`Agent` (spawn subagent — multi-level nesting supported)
Interactive: `AskUserQuestion` (deferred — preload via ToolSearch before first call)
</adapter>

<adapter id="cursor-agent">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.

## C. Tool Usage
Use Cursor tools: `run_terminal_cmd` (shell), `read_file` (read), `edit_file` (write/edit),
`grep_search` (search), `web_search`, `codebase_search`, `list_dir`, `file_search`
Interactive: text list fallback (AskQuestion available in Plan Mode only; Agent Mode = text)
Subagent: `/multitask` (user command, single-level only — not a callable tool)
MCP limit: 40 tools
</adapter>

<adapter id="antigravity">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.
Skill discovery: LLM-driven (automatic, no slash command needed).

## C. Tool Usage
Use Antigravity tools: `shell` (cmd), `file_read`, `file_write`, MCP plugins
Interactive: text fallback (TUI-based; no formal AskUserQuestion)
Skill path: `.agents/skills/<skill>/SKILL.md` (project) or `~/.gemini/antigravity/skills/` (global)
Note: Gemini CLI deprecated June 18, 2026 — use Antigravity CLI.
</adapter>

<adapter id="codex">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.

## C. Tool Usage
Use Codex tools: `container.exec` (sandboxed shell), `apply_patch` (file write), `web_search`
Interactive: text fallback (TUI Tab/Enter injection)
Config: `~/.codex/config.toml`
</adapter>

<adapter id="copilot">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.
Discovery: User-driven (`@agent-name` in GitHub Copilot Chat).

## C. Tool Usage
Use Copilot tools: `runCommands` (shell), `read`/`readfile` (read), `edit`/`editFiles` (write),
`code_search`, `find_references`
Interactive: `askQuestions` (main agent only — NOT available in subagents; VS Code issue #293745)
Skill path: `.github/agents/<name>.agent.md`
</adapter>
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
- `--setup` : Force setup wizard — configure a new channel now (even if channels already exist)
- `--config` : Alias for `--setup`
- `--skip-validation` : Skip Step 4.5 codebase validation (faster, no file-scanner-agent spawn)

**Supported channel types:**
| Type | Auth | Config field |
|------|------|-------------|
| `csv` | None | `path` (local file) |
| `google_sheets` | Service Account JSON | `spreadsheet_id` + `sheet_name` |
| `excel_m365` (Graph API) | Azure App Registration | `workbook_id` + `sheet_name` |
| `excel_m365` (sharing link) | None — anonymous | `sharing_url` |

**Config file:** `.viepilot/intake/channels.json`
**Credentials dir:** `.viepilot/.credentials/` (gitignored)
</context>

<process>

### Step 0: Setup wizard detection (ENH-084)

**Check wizard trigger conditions:**

```js
const args = parseArgs(VP_ARGS);
const forceSetup = args.includes('--setup') || args.includes('--config');

// Init dir + load channels
initIntakeDir(projectRoot);          // lib/intake/channels.cjs
const { channels } = loadChannels(projectRoot);
const needsSetup = forceSetup || !hasRealChannels(channels);  // lib/intake/channels.cjs
```

**If `needsSetup` is true:**

Call `runSetupWizard(projectRoot, askFn)` from `lib/intake/setup-wizard.cjs`.

`askFn` wraps `AskUserQuestion` for structured option prompts, and falls back to free-text
input for open-ended fields (column names, file paths, URLs).

After wizard completes:
- Reload channels from channels.json
- If exactly 1 channel was just created → auto-select it and skip Step 3 (go to Step 4)
- Otherwise → continue to Step 3 (channel select AUQ with all available real channels)

**If `needsSetup` is false** and no `--setup` flag → skip Step 0 entirely, continue to Step 1.

---

### Step 1: Init intake directory

```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" intake-init
```

This creates `.viepilot/intake/channels.json` (scaffold) and `.viepilot/.credentials/` if missing.

### Step 2: Load channels

Read `.viepilot/intake/channels.json`. If no real channels exist after Step 0:

```
No channels configured yet.
Run /vp-intake --setup to configure a channel interactively.
```

### Step 3: Select channel (AUQ single-select)

```
question: "Which ticket channel do you want to import from?"
header: "Channel"
options: one per channel — label: "{channel.name} ({channel.type})", description: "{channel.id}"
```

### Step 3.5: Sharing URL guard (ENH-089)

Before reading, check for `sharing_url` on `excel_m365` channels:
```
if (channel.type === 'excel_m365' && channel.sharing_url) {
  // Print warning — write-back will be disabled for this session
  console.warn(
    `⚠️  Channel "${channel.name}" uses a sharing_url — write-back is read-only for sharing links.\n` +
    `   To enable write-back: configure workbook_id + .viepilot/.credentials/m365-credentials.json`
  );
}
```
Continue with intake — read-only is acceptable for triage.

### Step 4: Read and classify tickets

**Claude Code adapter** — dispatch via native agents for Excel/Sheets:
```js
if (channel.type === 'excel_m365') {
  // Claude Code: use native excel-intake-agent
  Agent({ subagent_type: "excel-intake-agent",
    description: "excel-intake-agent: read tickets from Excel M365",
    prompt: `op: read. channel_config: ${JSON.stringify(channel)}. projectRoot: ${projectRoot}`
  })
} else if (channel.type === 'google_sheets') {
  // Claude Code: use native sheets-intake-agent
  Agent({ subagent_type: "sheets-intake-agent",
    description: "sheets-intake-agent: read tickets from Google Sheets",
    prompt: `op: read. channel_config: ${JSON.stringify(channel)}. projectRoot: ${projectRoot}`
  })
}
```

**Non-CC adapters** — inline adapter dispatch (unchanged):
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

### Step 4.5: Parallel Codebase Validation (ENH-087)

> Skip entirely if `--skip-validation` flag is set.

Call `validateTickets(classifiedTickets, projectRoot)` from `lib/intake/validator.cjs`.
Fan-out: one validation per ticket (batched ≤10 concurrently via `Promise.all`).

**Claude Code adapter** — each ticket dispatches a `file-scanner-agent`:
```js
// Inside validateTicket (CC path override):
Agent({ subagent_type: "file-scanner-agent",
  description: `file-scanner-agent: validate "${ticket.title}"`,
  prompt: `keywords: ${JSON.stringify(keywords)}. projectRoot: ${projectRoot}. requests_dir: .viepilot/requests/`
})
```

**Non-CC adapters** — inline `grep` + request scan (no agent spawn).

Display progress during validation:
```
Validating {N} tickets against codebase... (parallel)
  ✅ "Login button broken"      — found: src/components/LoginButton.tsx
  ⚠️ "Add CSV export"           — similar: ENH-045
  ❓ "Fix the performance issue" — no codebase match
```

Validation results are attached as `ticket._validation` and shown as badges in Step 5 AUQ.
`--skip-validation` flag: skip Step 4.5 entirely, proceed directly to Step 5.

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

**Claude Code adapter** — dispatch via native agents for Excel/Sheets write-back:
```js
if (channel.type === 'excel_m365') {
  Agent({ subagent_type: "excel-intake-agent",
    description: "excel-intake-agent: write triage results back to Excel M365",
    prompt: `op: write. channel_config: ${JSON.stringify(channel)}. tickets: ${JSON.stringify(triageResult)}. projectRoot: ${projectRoot}`
  })
} else if (channel.type === 'google_sheets') {
  Agent({ subagent_type: "sheets-intake-agent",
    description: "sheets-intake-agent: write triage results back to Google Sheets",
    prompt: `op: write. channel_config: ${JSON.stringify(channel)}. tickets: ${JSON.stringify(triageResult)}. projectRoot: ${projectRoot}`
  })
} else {
  await writeback(channel, triageResult, projectRoot);       // lib/intake/writeback.cjs (csv + non-agent path)
}
```

**Non-CC adapters** — all types via `lib/intake/writeback.cjs`:
```js
await writeback(channel, triageResult, projectRoot);
```

```js
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
- [ ] Setup wizard triggers automatically when no real channels exist (or --setup flag)
- [ ] Wizard collects channel config via AUQ and writes to channels.json
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
- Setup wizard: channel type, display name, field config, preview+confirm (Step 0)
- Channel selection (Step 3)
- Ticket accept/decline multi-select (Step 5)
- Decline reason (Step 5)
- UNCLEAR handling (Step 5)
- Next action (Step 8)

## Capabilities
- **Setup wizard** (`--setup`): AUQ-driven channel configuration — writes directly to channels.json
- Read tickets from SharePoint sharing links (anonymous WOPI download, no credentials)
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
