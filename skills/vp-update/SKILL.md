---
name: vp-update
description: "Upgrade viepilot package via npm (dry-run, --yes, --global) via vp-tools"
version: 0.1.1
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-UPDATE  v0.1.1 (fw 2.19.0)
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
Display notice banner before any other output:
```
┌──────────────────────────────────────────────────────────────────┐
│ ✨ ViePilot {latest_version} available  (installed: {current})   │
│    npm i -g viepilot && vp-tools install --target {adapter_id}   │
└──────────────────────────────────────────────────────────────────┘
```
Replace `{latest_version}` with stdout from the command, `{current}` with the installed
version, `{adapter_id}` with the active adapter (claude-code / cursor / antigravity / codex / copilot).

**If exit code = 0 or command unavailable**: silent, continue.

**Suppression rules:**
- `--no-update-check` flag on skill invocation → skip this step entirely
- `config.json` → `update.check: false` → skip this step entirely
- Show at most once per session (`update_check_done` session guard)
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
- Skill được gọi khi user mention `vp-update`, `/vp-update`, "upgrade viepilot", "cập nhật viepilot npm"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. Tool Usage
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

- **Upgrade ViePilot package** (npm) — does not implement product features in the working repo by default; feature code goes through **`/vp-auto`**. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Run **`vp-tools update`** to plan and (when confirmed) execute the `npm` upgrade of `viepilot`.

**Safety constraints:**
- **Non-interactive** (CI, agent without TTY): **`--dry-run`** or **`--yes`** is required; otherwise exits with an error.
- Always prefer **`--dry-run`** before applying, unless the user has explicitly requested to apply.

**Target distinction:** in a repo that is **not** ViePilot but has `node_modules/viepilot`, the command may update the **local dependency**. To upgrade only the **global** install, add **`--global`**.
</objective>

<execution_context>
@$HOME/{envToolDir}/bin/vp-tools.cjs
</execution_context>

<process>

### Step 1: Dry run (default when automated)
```bash
vp-tools update --dry-run
```
Read output: planned npm command, current version vs latest, ambiguous/global warnings.

### Step 2: Apply (after user confirms or explicitly requests it)
```bash
vp-tools update --yes
```
Or force global:
```bash
vp-tools update --global --dry-run
vp-tools update --global --yes
```

### Step 3: Interactive
If the terminal is interactive and **no** `--yes` flag is present, the CLI may prompt for confirmation before running npm.

### Step 4: Suggested rollback
Dry-run/update output typically suggests `npm install -g viepilot@<previous>` — keep the previous version from `vp-tools info` in case a rollback is needed.
</process>

<success_criteria>
- [ ] Do not run apply in non-interactive mode without `--yes`
- [ ] Clearly state target (local vs global) when user is in an external project
- [ ] Acknowledge when `already up to date` (successful no-op)
</success_criteria>
