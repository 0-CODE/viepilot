<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-PERSONA  v1.0.0 (fw 2.42.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>
<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-persona`, `/vp-persona`, "persona", "profile", "customize workflow"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

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

- This skill is **persona management only**: read/write `~/.viepilot/persona.json`, `personas/`, `context-map.json` — does **not** implement shipping code (`lib/`, `tests/`, `bin/`, `workflows/`, `skills/`).
- For implementing features: use **`/vp-auto`**. For planning: use **`/vp-evolve`**.
- **Exception:** User **explicit** bypass — state clearly in chat.
</implementation_routing_guard>

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
Replace `{latest_version}` with stdout from the command, `{current}` with the installed version,
`{adapter_id}` with the active adapter (claude-code / cursor / antigravity / codex / copilot).

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

<pending_review_check>
## Pending Review Notice (ENH-073)

At skill start, check if `~/.viepilot/pending-review.md` is non-empty:
```bash
test -s "$HOME/.viepilot/pending-review.md" && cat "$HOME/.viepilot/pending-review.md" | wc -l
```
If the file has entries, show a **one-line notice** (not a blocking prompt):
```
ℹ  {N} persona updates auto-applied — review ~/.viepilot/pending-review.md to revert any
```
Show this notice **only on /vp-persona invocation**, not on other skills.
</pending_review_check>

<objective>
Manage cross-project user personas for ViePilot.

Persona is **inferred automatically** from project files + git history — no setup wizard required.
This skill is for **inspection and optional correction** of the auto-detected persona.

**Commands:**
- `/vp-persona` — Show active persona (inferred fields, confidence, domain, stacks)
- `/vp-persona --refine` — Field-by-field correction via AUQ (opt-in, not onboarding)
- `/vp-persona --list` — List all saved personas
- `/vp-persona --bind . <name>` — Override auto-detection for current dir (correction)
- `/vp-persona --merge <a> <b>` — Manually create hybrid persona from two named personas
- `/vp-persona --export` — Print active persona JSON for backup/sharing
- `/vp-persona --import <file>` — Import persona from JSON file
- `/vp-persona --reset` — Clear all personas and context-map

**Auto-detection (no command needed):**
On any `vp-*` skill invocation, persona is auto-detected from:
- Project file signals (package.json, CMakeLists.txt, requirements.txt, etc.)
- Git history (team size from shortlog, role from file extensions)
- Context map (previously detected bindings)
</objective>

<process>

### Step 1: Check for pending-review entries
Run the pending-review check per `<pending_review_check>` above.

### Step 2: Load and display active persona

Run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona get
```

Display active persona in a clean format:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Active Persona: {name}  [{source}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Domain:        {domain}
 Role:          {role}
 Stacks:        {stacks}
 Team size:     {team_size}
 Output style:  {output_style}
 Phase template:{phase_template}
 Confidence:    {confidence} {confidence_note}
 Inferred at:   {inferred_at}

 Topic priority: {topic_priority}
 Topic skip:     {topic_skip || "(none)"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
Where `{confidence_note}` = "(low — run --refine to correct)" if confidence < 0.6, else "".

### Step 3: Handle --refine

Use AUQ for field-by-field correction (only fields the user wants to change):

**AUQ sequence (each question is optional — user can skip):**
1. Domain: current value shown, ask if correct
2. Stacks: current value shown, ask to add/remove
3. Output style: lean / balanced / enterprise
4. Phase template: from domain pack list or custom

After correction: write updated persona to `~/.viepilot/personas/{name}.json`, update active.

### Step 4: Handle --list

```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona list
```
Display as table.

### Step 5: Handle --bind . <name>

```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona set <name>
```
Update context-map for current directory.

### Step 6: Handle --merge <a> <b>

Load both named personas, call `mergePersonas()`, save as `merge-{a}-{b}`, set active.

### Step 7: Handle --export / --import / --reset

- `--export`: print `~/.viepilot/personas/{active}.json` content
- `--import <file>`: read JSON file, write to personas dir, set active
- `--reset`: delete `~/.viepilot/personas/`, `context-map.json`, `persona.json`

</process>

<success_criteria>
- [ ] Active persona shown with all inferred fields
- [ ] Confidence < 0.6 flagged with note
- [ ] --refine corrects fields without full re-setup
- [ ] --list shows all personas with active marker
- [ ] --bind overrides auto-detection for current dir
- [ ] --merge creates hybrid persona
- [ ] pending-review notice shown when entries exist
</success_criteria>

## Adapter Compatibility

### AskUserQuestion Tool (ENH-073)

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` — REQUIRED for --refine | Preload via ToolSearch first |
| Cursor / Codex / Copilot / Antigravity | ❌ Text fallback | Plain numbered list |

**Claude Code (terminal) — AUQ preload required (ENH-059):**
Before the first interactive prompt, call `ToolSearch` with `query: "select:AskUserQuestion"`.

**Prompts using AskUserQuestion in this skill:**
- --refine field correction (domain, stacks, output_style, phase_template)
