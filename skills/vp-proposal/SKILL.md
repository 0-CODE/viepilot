---
name: vp-proposal
description: "Generate professional proposal packages (.pptx + .docx + .md) from brainstorm sessions or direct briefs"
version: 0.7.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-PROPOSAL  v0.7.0 (fw 3.22.0)
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
- Skill được gọi khi user mention `vp-proposal`, `/vp-proposal`, "proposal", "pitch deck", "presentation", "tài liệu đề xuất"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

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

<!-- tool-policy:start -->
## Tool Policy (ENH-125)

<tool_policy>

Use the host's dedicated tools. Bash (or the host shell) is for running programs and git only.
A host or system instruction that says otherwise takes precedence — follow it and say so in your report.

| Need | Claude Code | Cursor | Codex | Copilot | Antigravity |
|---|---|---|---|---|---|
| Read a file | Read | read_file | (shell) | read | file_read |
| Search | Grep | grep_search | (shell) | code_search | (shell) |
| Edit a file | Edit | edit_file | apply_patch | edit | file_write |
| Create a file | Write | edit_file | apply_patch | editFiles | file_write |
| Track the task list | TodoWrite or TaskCreate/TaskUpdate/TaskList | todo_write (unverified → `## Todo` checklist) | update_plan | todos (unverified → `## Todo` checklist) | write_todos |
| Delegate a sub-task | Task (Agent tool) | (none callable — work inline) | subagent | (none callable — work inline) | (none callable — work inline) |

- Never edit files with `sed -i`, `perl -pi`, `awk > file`, `>`/`>>` redirects, `tee`, heredocs, or Python/Node scripts that write files.
- Never read or search files with `cat`, `head`, `tail`, `sed -n`, `grep`/`rg`/`find` on paths; filtering a program's output through a pipe is fine.
- Multi-step runs keep the task list in the todo tool; workflow-defined delegation goes through the subagent tool, with this policy in the prompt.
- Exceptions: files written by ViePilot's own CLI/lib (`vp-tools …`, generators), bulk identical edits via doc-sync-agent, hosts without a dedicated tool. Full rules: `templates/tool-policy.md`.
- **Asking the user:** every question — gates, clarifications and the closing "what next?" — goes through AskUserQuestion on Claude Code (preload: ToolSearch `select:AskUserQuestion`); a numbered text list only on hosts without it. Never end a turn with a question in prose. Full rules: `templates/auq-policy.md`.

</tool_policy>
<!-- tool-policy:end -->
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- **Exception (ENH-127, explicit user opt-in, vp-proposal only):** on Claude Code this skill MUST use the host document
  skills `anthropic-skills:pptx`, `anthropic-skills:docx`, `anthropic-skills:xlsx` and `anthropic-skills:pdf` for
  creating, validating, rendering (visual QA), reading and editing proposal files. ViePilot stays the source of truth
  for the manifest, script, animation rules and gates. A missing skill or dependency → AskUserQuestion (enable / install,
  or continue with the built-in generators with consent); a check that cannot run is reported as "skipped — <reason>".
</scope_policy>
<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **`/vp-proposal`** generates **output artifacts** (`docs/proposals/*.pptx`, `*.docx`, `*.md`) — it does **not** implement shipping code for `lib/`, `tests/`, `bin/`, or framework `workflows/`/`skills/`.
- This skill is the **delivery lane** after `/vp-brainstorm` captures the ideas. Use `/vp-request` → `/vp-evolve` → `/vp-auto` for ViePilot framework feature work.
- **Exception:** User **explicit** bypass — state clearly in chat.
</implementation_routing_guard>

<objective>
Generate a professional proposal package from a brainstorm session or direct brief.

**Output files** (written to `docs/proposals/`):
- `{slug}-{date}.md` — structured proposal Markdown (source of truth)
- `{slug}-{date}.pptx` — presentation file (ViePilot branded, dark navy/charcoal)
- `{slug}-{date}.docx` — detailed project document
- `{slug}-{date}-slides.txt` — Google Slides URL (only with `--slides` flag)
- `{slug}-{date}-script.md` — full spoken script (chosen duration, with expected Q&A)
- `{slug}-{date}-script-5min.md` / `{slug}-{date}-script-30min.md` — alternate-length scripts
- `{slug}-{date}-script.docx` — script as a Word document
- `{slug}-{date}-review.md` — persona review report (scoreboard, rounds, decisions)

**Human voice (ENH-117a):**
- **Voice Profile** — asked every run (4 levels: Humble, Balanced, Proud, Founder story; `--voice` skips the prompt). Every claim of pride needs evidence.
- **Story Brief** — skippable questions collecting real material (origin, customer story, number, repeat line) so the deck does not sound templated.
- **Spoken notes** — every slide carries full spoken words (short sentences, digits for numbers), validated for cliches, spelled-out numbers and essay-length lines.
- **Script** — per-slide timing planned for 5 / 15 / 30 minutes (`--duration`).

**Persona Review Council (ENH-117c):**
- 20 reviewer personas score the package against a rubric; each reviews independently (parallel subagents in Claude Code, sequential in-thread on text-only adapters).
- Persona 20 (Humanity editor) is locked and always runs. If the gate fails, only the Improve slides are rewritten (max 2 rounds), then a review report is written.
- `--review off|quick|full` selects the council size.

**Sessions, gates and versions (ENH-124 / ENH-126):**
- Every gate — every input and every output — asks the user with AskUserQuestion (Claude Code; numbered text elsewhere). `--yes` auto-accepts recommended options and records them as auto-accepted; material-risk items are never auto-accepted.
- State is kept in `docs/proposals/{slug}/session.json`; outputs go to immutable `docs/proposals/{slug}/versions/v{n}-{date}/` folders with `provenance.json` (ViePilot version, gates passed, file hashes). Nothing is ever overwritten.
- An earlier proposal is detected at the start: Upgrade (run only the gates added since it was made), Revise, New proposal, or Keep. Hand-edited files are detected by hash and never lost. Legacy flat files: `vp-tools proposal migrate`.
- **Re-entry rule:** while a proposal session is active, every user message about that proposal MUST re-enter this skill (`/vp-proposal --resume <slug>`; Claude Code: invoke the skill again with the Skill tool) and go through Step 11: Iterate — never edit the deck ad hoc. `vp-tools proposal status` shows active sessions; optional hooks `vp-tools hooks install --proposal-context` remind the agent on every prompt and after compaction.

**Outline first, curated content (ENH-122 / ENH-123):**
- After the type is confirmed the run agrees on an outline first — one key message, and per slide its job (what the audience will think / feel / do), the evidence it needs and its time budget — and nothing is written until the user approves it.
- Repo sources are inventoried by path (sensitive files are never read) and every fact is decided in a Content Map: FIT, TRANSFORM (process wording rewritten as outcome), DROP, SENSITIVE or BACKSTAGE. Slides use only mapped content; gaps are asked, never invented.
- A proposal is not a changelog: versions, ticket ids, commit hashes, changelog verbs and "first we… then we…" are caught before rendering. Not-done work, "remaining" lists and hedges go to the Backstage Editor (#31, observer in every council), who moves them to presenter-only `backstage.md` or reframes them; material risks for a decision audience are reframed as risk → mitigation → ask, never hidden.

**Rehearsal Hall (ENH-121):**
- At the end of a run (or later with `--simulate <proposal dir>`), 12–16 personas (or `--hall all`) "listen" to the deck along the real timeline — slide by slide, line by line, click by click — as independent subagents.
- **Panel Q&A (ENH-128):** after listening, 4–6 personas question a presenter agent and argue with each other in up to 3 rounds of messages; unanswered questions become deck gaps.
- The report (`simulation/run-{n}/report.html`, offline, plus `summary.md` and `data.json`) shows persona evaluations, what to improve first, when each persona stopped listening and why, retention curves (all and decision-maker weighted), keyword and criteria effectiveness, attention heatmap, cognitive load and confusion, emotion arc vs the intended arc, persuasion funnel, questions and objections, pacing, 24-hour recall and run-over-run changes — with a 3D hall replay (2D fallback). Labelled as an AI simulation.

**Proposal types (6 types):**
| Type | Slides | Use case | Variants |
|------|--------|----------|----------|
| `project-proposal` | 10 | Scope, timeline, budget for clients | — |
| `tech-architecture` | 12 | Technical design for partners | — |
| `product-pitch` | 12 | Investor / partner pitch deck | — |
| `general` | 8 | Generic, fallback | — |
| `internal-presentation` | 8 | Team updates, training, demos | team-intro, leadership-report, feature-demo, training, all-hands |
| `research-proposal` | 10 | Grant proposals, research presentations | grant-proposal, kickoff, progress-report, defense, tech-transfer |

**Template resolution (2-tier):**
1. `.viepilot/proposal-templates/{type}.pptx` — project-level override
2. `{viepilot-install}/templates/proposal/pptx/{type}.pptx` — ViePilot stock

**Context detection:**
- Auto-loads latest `docs/brainstorm/session-*.md` when present
- Standalone mode if no session found (user provides brief)
- `--from session-YYYY-MM-DD.md` for explicit session selection
</objective>

<execution_context>
workflows/proposal.md
</execution_context>

<context>
Optional flags:
- `--purpose "<text>"` : Proposal purpose, context, audience, desired outcome (Step 2b+).
                        Non-interactive; skips Purpose Consult prompt. Text is auto-confirmed.
- `--audience "<text>"` : Audience intake details in free text (Step 2c).
                         Non-interactive; parsed via normalizeAudienceProfile.
                         Skipped if no gaps detected; or use to fast-path questions.
- `--type <id>` : Proposal type — `project-proposal` | `tech-architecture` | `product-pitch` | `general` | `internal-presentation` | `research-proposal`
                  If omitted: guided selection menu is shown with all 6 types.
                  If `internal-presentation` or `research-proposal`: optionally pair with `--variant`.
- `--variant <id>` : Proposal variant (for types with variants).
                    Internal variants: team-intro | leadership-report | feature-demo | training | all-hands
                    Research variants: grant-proposal | kickoff | progress-report | defense | tech-transfer
                    If omitted with a variant-type: variant selection prompt is shown.
- `--from <file>` : Explicit brainstorm session file to use as context
                    Default: auto-detect latest `docs/brainstorm/session-*.md`
- `--lang <code>` : Language for generated content — ISO 639-1 (e.g. vi, en, ja, fr, zh).
                    If omitted: prompted with MRU suggestions from config.
                    Saved to ~/.viepilot/config.json → proposal.recentLangs after generation.
- `--lang-content-only` : Translate content (bullets, notes, paragraphs) only.
                           Keep structural labels / section names in English.
- `--slides` : After .pptx is generated, upload to Google Slides via service account auth
               Requires: `@googleapis/slides` installed + `GOOGLE_APPLICATION_CREDENTIALS` env var
- `--voice <1-4>` : Voice Profile level — 1 Humble, 2 Balanced, 3 Proud, 4 Founder story.
                    If omitted: Voice Profile prompt (AskUserQuestion) is shown every run.
                    Pre-selected: suggestVoice(audienceProfile, recommendation) marked Recommended.
- `--duration <5|15|30>` : Target talk length in minutes for the primary script (`-script.md`).
                           The 5 and 30 minute variants are also written.
                           Default: suggestDuration(audienceProfile, recommendation).
- `--review <off|quick|full>` : Persona Review Council size (default `quick`). `off` skips the
                                 council but still runs persona 20 (Humanity editor) only.
- `--dry-run` : Show slide manifest (JSON) without writing any files
- `--source <glob>` : Add a source file or folder for the Content Map (repeatable).
- `--exclude <glob>` : Exclude a source from the inventory (repeatable).
- `--simulate <proposal dir>` : Re-run the Rehearsal Hall on an existing proposal (with `--duration`, `--hall all`, `--add` / `--remove`).
- `--panel <relay|teams|off>` : Panel Q&A after the hall (ENH-128) — 4–6 personas debate and cross-examine a presenter agent
                                (answers only from the material, with citations). `relay` (default) works on every host;
                                `teams` uses Claude Code agent teams (experimental, opt-in).
- `--resume [slug]` : Continue an active session at its current step with all confirmed decisions restored.
- `--yes` : Non-interactive — auto-accept the recommended option at each gate (recorded as auto-accepted).
</context>

<process>
Execute workflow from `workflows/proposal.md`

### Step 1: Context Detection
- Scan `docs/brainstorm/` for `session-*.md` → sort descending → load latest
- If `--from` specified: load that file directly
- If no session found: prompt user for brief:
  - Project name
  - One-line description
  - Target audience (client / partner / investor)
  - 3–5 key points to cover

### Step 2: Purpose Consult (Step 2b+)
- Ask user: "What is this proposal about? (purpose, context, who is in the room, outcome wanted)"
- Or `--purpose "<text>"` to supply non-interactively
- Extract audience hints via `extractAudienceHints(text, {lang})`
- Check for gaps via `findIntakeGaps(profile)`
- Render consult template showing "What I understood"; user confirms or corrects

Output: `purposeText`, `audienceHints` (roles, goals, formats, knowledge detected from text)

### Step 2c: Audience Intake
- Only shown if `findIntakeGaps` returns gaps
- Ask up to 4 questions (depending on gaps):
  1. Roles (multiSelect; mark primary in notes) — if 'roles' gap
  2. Decision Maker (text; what they care about) — if 'decisionMaker' gap
  3. Knowledge & Size (novice/mixed/expert, small/medium/large) — if 'knowledgeSize' gap
  4. Format & Goal (in-person/online/recorded/hybrid, approval/demo/train/fund/etc.) — if 'formatGoal' gap
- Or `--audience "<text>"` to skip questions; parse via `normalizeAudienceProfile`
- Output: `audienceProfile` (roles, decisionMaker, knowledge, size, format, goal)

### Prompts using AskUserQuestion
- Purpose Consult confirmation (Step 2b+)
- Audience Intake questions (Step 2c) — only shown if gaps detected
- Proposal type recommendation (Step 3a) — show recommendation + reason + alternatives
- Variant selection (Step 3c) — if type has variants and none provided
- Language selection
- Voice Profile (4 levels; skipped with `--voice`; pre-selected option from suggestVoice)
- Story Brief (all questions skippable)
- Quality Brief
- Persona Review Council: persona confirmation (accept / add / remove; optional)
- Persona Review Council: after round 2 still failing (Accept current version / Run one more round / I'll give feedback directly / Provide more real material)
- Persona Review Council: final humanity check on the lowest-H1 slide (Sounds like me / Needs more pride / Needs more humility / I'll edit directly)

### Step 3: Proposal Type Selection & Recommendation
- If `--type` provided: validate + optional `--variant`; skip recommendation
- Else:
  1. **Step 3a: Recommendation** — call `recommendProposalType(audienceProfile, {lang})`
     Show recommendation + reason + alternatives via AUQ; user confirms or chooses alternative
  2. **Step 3b: Full Menu** — if "show all types" selected
     Present all 6 types: Project Proposal, Tech Architecture, Product Pitch, General, Internal Presentation, Research Proposal
  3. **Step 3c: Variant Confirmation** — if type is `internal-presentation` or `research-proposal` and no `--variant`
     Show variant menu (team-intro, leadership-report, feature-demo, training, all-hands for internal;
     grant-proposal, kickoff, progress-report, defense, tech-transfer for research)

Output: `typeId`, `variant` (if applicable), `slideCount`

### Step 3d: Language Selection
- If `--lang` provided: skip prompt; use flag value directly
- Else: show menu with MRU suggestions and ISO 639-1 codes

### Step 3e: Voice Profile
- Asked every run; asked after audience and type are confirmed
- Pre-select `suggestVoice(audienceProfile, recommendation)` as Recommended
- User still chooses every run (ENH-117)

### Step 3f: Story Brief
- All questions skippable
- Collect real material: origin, customer story, number, repeat line

### Step 3g: Quality Brief
- Four non-skippable questions: CTA, budget, timeline, decision-maker

### Step 4: AI Slide Manifest Generation
- Structure context into JSON manifest:
  ```json
  {
    "title": "...",
    "subtitle": "...",
    "type": "...",
    "variant": "...",
    "audienceProfile": { "roles": [...], "decisionMaker": "...", "knowledge": "...", "size": "...", "format": "...", "goal": "..." },
    "slides": [
      { "index": 1, "layout": "cover", "heading": "...", "body": "...", "speakerNotes": "..." },
      { "index": 2, "layout": "section", "heading": "...", "bullets": ["..."], "speakerNotes": "..." }
    ]
  }
  ```
- Slide count MUST match `PROPOSAL_TYPES[typeId].slides` (dynamic — may exceed base skeleton)
- If `--dry-run`: print manifest and stop

### Step 4a: Template Resolution
- Call `resolveTemplate(typeId, 'pptx', projectRoot)` → pptx template path
- Call `resolveTemplate('project-detail', 'docx', projectRoot)` → docx template path
- Warn (not error) if stock fallback is used

### Step 4b: Generate .pptx
- Load template via pptxgenjs
- Apply slide manifest: inject titles, bullets, speaker notes per slide
- Ensure `docs/proposals/` directory exists
- Write `{slug}-{date}.pptx`

### Step 4c: Generate .docx
- Build detailed document from same manifest + extended content
- Sections: Executive Summary, Problem & Solution, Features & Specifications,
            Technical Architecture (if relevant), Timeline, Team, Appendix
- For research proposal variants: add References section (citations: true)
- Write `{slug}-{date}.docx`

### Step 5: Generate .md summary
- Write Markdown mirror of the manifest
- Save `{slug}-{date}.md`

### Step 6: Spoken Script & Speaker Notes
- Fill `speakerNotes` and `durationSec` for every slide
- Default duration: `suggestDuration(audienceProfile, recommendation)`
- Validate speaker notes (no cliches, no spelled-out numbers, short sentences)

### Step 7: Optional Google Slides upload (`--slides`)
- Call `lib/google-slides-exporter.cjs` → `uploadToSlides(pptxPath, title)`
- Write URL to `{slug}-{date}-slides.txt`
- On failure: surface error but do NOT fail the whole command (files already written)

### Step 8: Persona Review Council
- Select personas via `selectPersonas({type, variant, audience, decisionMaker, audienceProfile, mode})`
- 20 reviewers score package against rubric (research types have R1–R3 research rubric)
- Research proposal types note research blocker; getBlockers(type) returns blockers list
- Persona 20 (Humanity editor) always runs
- Max 2 rounds of rewrite + re-review if gate fails

### Step 9: Confirm output
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► PROPOSAL GENERATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Type:    {type label}  ({N} slides)
 Variant: {variant label, or "—"}
 Context: {session file or "direct brief"}

 Files:
   docs/proposals/{slug}-{date}.md
   docs/proposals/{slug}-{date}.pptx
   docs/proposals/{slug}-{date}.docx
   docs/proposals/{slug}-{date}-review.md
   [docs/proposals/{slug}-{date}-slides.txt]  ← if --slides

 Next:
   Open .pptx in PowerPoint / Keynote / LibreOffice
   Share .docx as supporting document
   Run /vp-proposal --slides to upload to Google Slides
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</process>

<success_criteria>
- [ ] Context detected (brainstorm session or user brief)
- [ ] Proposal type selected and validated
- [ ] Slide manifest generated with correct slide count
- [ ] .pptx written to docs/proposals/
- [ ] .docx written to docs/proposals/
- [ ] .md summary written to docs/proposals/
- [ ] Template resolution: project override takes precedence over stock
- [ ] --lang: content generated in specified language; MRU saved to config
- [ ] --lang-content-only: bullets/notes translated; structural labels stay English
- [ ] --slides: Google Slides URL written to -slides.txt (or clear error shown)
- [ ] --dry-run: manifest printed, no files written
</success_criteria>
