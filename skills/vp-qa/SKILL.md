---
name: vp-qa
description: "LLM-driven QA agent team generator — research codebase, generate context-aware QA scanning agents"
version: 1.0.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-QA  v1.0.0 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
- Skill được gọi khi user mention `vp-qa`, `/vp-qa`, "qa", "scan", "kiểm tra chất lượng"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

## C. Tool Usage
Use Claude Code tools: `Bash` (shell), `Read` (file), `Edit` + `Write` (file write/patch),
`Grep` (search), `Glob` (file patterns), `LS`, `WebSearch`, `WebFetch`,
`Agent` (spawn subagent — multi-level nesting supported)
Interactive: `AskUserQuestion` (deferred — preload via ToolSearch before first call)

**Phase 1 research tools:**
- `Read` — parse .viepilot/PROJECT-META.md, STACKS.md, package.json, requirements.txt, etc.
- `Bash` — find backend directories, count files
- `Grep` — search for patterns in source code

**Phase 3 generation tools:**
- `Write` — create agent files directly (qa-orchestrator.md, qa-{domain}-scanner.md)
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
Skill path: `.agents/skills/<skill>/SKILL.md` (project) or `~/.agents/skills/` (global)
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
## Primary implementation lane (ENH-021)

- **`/vp-qa`** generates context-aware QA scanning agents for the current project.
- Output location determined by adapter via `lib/qa-router.cjs`.
- Generated agents invoke `qa-orchestrator` (claude-code) or execute sequential scans (others).
</implementation_routing_guard>

<objective>
Generate a team of QA scanning agents tailored to the project's stack, structure, and detected patterns.

**LLM-generates-directly approach:**
- Phase 1: LLM researches target codebase structure, stack, patterns, existing issues
- Phase 2: LLM determines output location via adapter routing (lib/qa-router.cjs)
- Phase 3: LLM writes agent files directly using Write tool (no template system)
- Phase 4: Show generated files and offer to run qa-orchestrator immediately (claude-code only)

**No templates:** Each agent's content is fully determined by research output. LLM tailors
scanning instructions to detected backend dirs, framework patterns, and known issues from `.viepilot/requests/`.

**After generation:** Generated agents (`qa-orchestrator` on claude-code or combined scanner on others)
will create `.viepilot/requests/BUG-{N}.md` for any QA issues found, and prompt user to accept/decline.
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/qa.md
</execution_context>

<context>
Optional flags:
- `/vp-qa` — auto-detect adapter + stack, generate QA team
- `/vp-qa --run` — generate + immediately invoke qa-orchestrator
- `/vp-qa --focus sec` — bias research toward security domains
- `/vp-qa --focus perf` — bias research toward performance domains
- `/vp-qa --target <id>` — override adapter detection (claude-code / cursor-agent / antigravity / codex / copilot)
</context>

<process>
### Phase 1: Research (REQUIRED — do not skip)

Before writing any agent file, understand the project:

1. Read `.viepilot/PROJECT-META.md`, `STACKS.md`, `PROJECT-CONTEXT.md` (silent if missing)
2. Detect stack from: `package.json` / `pom.xml` / `go.mod` / `requirements.txt` / `Gemfile`
3. List backend directory structure: find `src/` `app/` `lib/` `services/` `api/` `routes/` (whichever exist)
4. Read 5-10 representative source files from backend dirs (understand patterns)
5. Count file sizes, service count, DB layer presence
6. Read `.viepilot/requests/` to list known existing issues (avoid duplicate reporting)
7. Read `agents/qa-templates/rules/{stack}.md` from project lib (if exists) for stack-specific patterns

**Build research summary:**
```
- projectName: string
- stack: (node / python / java / go / ruby / etc.)
- stackVersion: string (from version file)
- backendDirs: string[] (actual dirs found in project)
- detectedPatterns: string[] (anti-patterns spotted in sampling)
- recommendedDomains: string[] (scan areas relevant to this project)
- recommendedAgentCount: number (2 for small, 4-5 for large/complex)
- knownIssues: string[] (from .viepilot/requests/, avoid duplicates)
```

### Phase 2: Determine Output Location

Use `lib/qa-router.cjs` to resolve adapter-specific output paths:
```
- claude-code  → .claude/agents/
- cursor-agent → .cursor/rules/
- codex        → AGENTS.md (single file, append mode)
- antigravity  → .agents/skills/
- copilot      → .github/agents/
```

Call or reference lib/qa-router.cjs to map the current adapter to output directory.

### Phase 3: Generate Agent Files (LLM writes directly)

Based on research summary, generate agent content and write using Write tool.

**For claude-code (multi-agent):**
- Write `qa-orchestrator.md` — orchestrator that fan-outs to specialist subagents
  - Name: "vp-qa orchestrator"
  - Description: "Coordinate QA scanning across multiple domains for {projectName}"
  - Model: claude-opus (or latest)
  - maxTurns: 30
  - Knows about backend dirs found, stack version, patterns to look for
  - References each specialist subagent by name
  - Receives domain reports, groups by severity
  - Creates `.viepilot/requests/BUG-{N}.md` for accepted issues
  - Uses AskUserQuestion for critical/high severity group acceptance
  - Final AskUserQuestion: "N issues logged. Run /vp-evolve to plan fixes?"

- Write `qa-{domain}-scanner.md` for each recommended domain (e.g., qa-security-scanner, qa-performance-scanner)
  - Name: "vp-qa {domain} scanner"
  - Description: "Scan {projectName} for {domain} concerns"
  - Model: claude-haiku-4 (efficient)
  - maxTurns: 15
  - Content references ACTUAL backend dirs found, ACTUAL patterns to look for
  - Produces structured report of issues found in that domain
  - Returns report to orchestrator

- Each file has correct YAML frontmatter (name, description, model, maxTurns, tools)
- Content NOT generic — references specific dirs, patterns, concerns found during Phase 1

**For other adapters (single-file mode):**
- Write one combined file with all domain instructions
- Sequential scanning procedure using that adapter's shell tools
- Same vp-request output format (BUG-{N}.md files)
- Single AskUserQuestion for all issues found at end

### Phase 4: AskUserQuestion (claude-code only)

After writing files, show what was generated:
```
Generated {N} agent files in {output_dir}:
  - qa-orchestrator.md (coordinates scanning across domains)
  - qa-security-scanner.md (scans for security concerns)
  - qa-performance-scanner.md (scans for performance concerns)
  ... (other domain files)
```

**AskUserQuestion:**
```
question: "What would you like to do next?"
options:
  - label: "Run QA scan now"
    description: "Invoke qa-orchestrator immediately to start scanning"
  - label: "Done for now"
    description: "Exit — agents are ready in {output_dir}"
```

**On selection:**
- "Run QA scan now": invoke qa-orchestrator immediately (or equivalent for non-claude-code adapters)
- "Done for now": print "QA agents ready in {output_dir}. Run qa-orchestrator to start scanning." and exit

**Text fallback (Cursor/Codex/Copilot/Antigravity):**
```
QA agents generated in {output_dir}

Next actions:
  1. Review generated agent files
  2. Run qa-orchestrator to start the QA scan
  3. Adjust scanning domains as needed
```

### Generated qa-orchestrator Behavior (in target project, when run)

When user runs the generated `qa-orchestrator`:
1. Fan out to specialist subagents (claude-code) or scan sequentially (others)
2. Collect issue reports from each domain scanner
3. Group issues by severity (critical/high/medium/low)
4. For critical/high: AskUserQuestion per group (accept → create vp-request BUG-{N}, decline → skip)
5. For medium/low: one batch confirm
6. Create `.viepilot/requests/BUG-{N}.md` for each accepted issue
7. Final AskUserQuestion: "N issues logged. Run /vp-evolve to plan fixes?"
</process>

## Adapter Compatibility

### AskUserQuestion Tool (ENH-059)
After generation, use `AskUserQuestion` on Claude Code (terminal) for Phase 4 prompt.

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` — **REQUIRED** at end of Phase 3 | Preload schema via ToolSearch first |
| Cursor / Codex / Copilot / Antigravity | ❌ Text fallback | Plain numbered list for next actions |

**Claude Code (terminal) — AUQ preload required (ENH-059):**
Before the first interactive prompt (Phase 4), call `ToolSearch` with `query: "select:AskUserQuestion"` to load the deferred tool schema. Only after `ToolSearch` succeeds can `AskUserQuestion` be invoked. If `ToolSearch` returns an error, fall back to plain-text numbered list for that session.

<success_criteria>
- [ ] Phase 1 research completed (read project structure, stack, patterns)
- [ ] Phase 2 output location determined via lib/qa-router.cjs
- [ ] Phase 3 agent files written using Write tool (content tailored to research output)
- [ ] Phase 4 AskUserQuestion shown (claude-code) or text fallback (others)
- [ ] Generated agents ready to execute qa-orchestrator
- [ ] Generated qa-orchestrator creates .viepilot/requests/BUG-{N}.md for found issues
</success_criteria>
