<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-DESIGN  v2.0.0 (fw 3.13.0)
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
- Skill is triggered when user mentions `vp-design`, `/vp-design`, "design system", "design.md", "sync tokens", "audit design"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options at control points.

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

- This skill manages **design system files** (`design.md`, stylesheet token sync, compliance audit).
- Does **not** implement application features or replace **`/vp-auto`** for shipping code.
- After creating/updating `design.md`, run **`/vp-design --sync`** to apply tokens, then continue with **`/vp-auto`** for feature work.
</implementation_routing_guard>

<objective>
Manage Design.MD design system files for the project (ENH-076).

Implements the [Design.MD v1 spec](https://github.com/google-labs-code/design.md) —
a Google Labs open standard (Apache 2.0) for describing visual design systems to AI coding agents.

**Commands:**
- `--init` : Create `design.md` via Q&A (aesthetic direction → brand → color → typography → spacing) or import from awesome-design-md community library (55+ brand examples). Embeds Aesthetic Commitment Framework — avoids "AI slop" defaults (Inter/purple gradients)
- `--sync` : Sync design.md tokens → Tailwind config / CSS custom properties / SCSS variables
- `--audit` : Scan project HTML/CSS files for compliance; report deviations (❌ / ⚠️ / ✅)
- `--import [brand]` : Fetch community template from awesome-design-md (Linear, Notion, Stripe, Vercel, Figma...)

**Creates/Updates:**
- `design.md` (project root)
- `tailwind.config.js` / `style.css` / `_variables.scss` (via `--sync`)

**Reads:**
- `design.md` (project root or session directory)
- HTML/CSS/SCSS files (via `--audit`)

**After:** `design.md` is ready for `/vp-crystallize` (Step 1D.14 export) and
`/vp-auto` (Preflight 5.5 token injection into UI tasks)

**Aesthetic Commitment Framework (ENH-102):**
Embedded from Anthropic's frontend-design skill guidelines (Apache 2.0). Adapter-independent —
no external skill installation required. Forces deliberate aesthetic choice across 4 dimensions:
Typography (distinctive fonts, avoid Inter/Arial) · Color (cohesive theme, avoid purple gradients) ·
Motion (intentional animations) · Composition (asymmetry, hierarchy). Activated in `--init` flow
via Step 0 aesthetic direction AUQ. `aesthetic_direction` field stored in design.md front matter
and forwarded to brainstorm --ui HTML generation context.
</objective>

<execution_context>
@$HOME/.claude/viepilot/workflows/design.md
</execution_context>

<context>
**Commands:**
- `--init` : Create new design.md (Q&A or awesome-design-md import)
- `--sync` : Sync tokens to project stylesheets (auto-detects Tailwind / CSS vars / SCSS)
- `--audit` : Compliance report — scan all HTML/CSS vs design.md spec
- `--import [brand]` : Import community template (omit brand for interactive catalog picker)

**Examples:**
```bash
/vp-design --init                    # Q&A flow to create design.md
/vp-design --init --import           # Import from awesome-design-md catalog
/vp-design --sync                    # Sync tokens → detected stylesheet target
/vp-design --audit                   # Full compliance report
/vp-design --import linear           # Import Linear design system directly
/vp-design --import notion           # Import Notion design system
```
</context>

<process>
Execute workflow from `@$HOME/.claude/viepilot/workflows/design.md`

### --init flow (Q&A from scratch)

0. **Aesthetic Direction:** (NEW — ENH-102)
   - Commit to aesthetic direction before brand Q&A
   - Options: Minimal/Editorial · Bold/Expressive · Dark/Premium · Custom
   - Stored as `aesthetic_direction` in design.md YAML front matter

1. **Brand identity:**
   - Brand name?
   - Core personality (3 words — AI suggests: minimal/bold/playful/enterprise/warm/technical)
   - Primary color (hex or describe, AI suggests 4 palette options)

2. **Typography:**
   - Font family (AI suggests: Inter / Geist / Plus Jakarta Sans / Custom)
   - Heading scale (tight compact / balanced standard / spacious editorial)

3. **Spacing & Shape:**
   - Spacing base (4px atomic / 8px standard — Recommended / custom)
   - Corner radius (sharp 0px / subtle 4px / rounded 8px / pill 16px+)

4. **Auto-generate semantic colors** from primary (surface, error, success, warning)
5. **Write** `design.md` at project root

### --init flow (awesome-design-md import mode)

When user says "import" or triggers `--import`:
1. AUQ catalog picker by category (Productivity / Developer / Commerce / Enterprise / Creative)
2. Preview selected brand tokens (text table)
3. AUQ: Apply as-is / Customize tokens / Use as reference only

### --sync flow

1. Parse `design.md` YAML front matter → TOKEN_MAP
2. Detect stack:
   - `tailwind.config.js` exists → Tailwind mode
   - `style.css` only → CSS custom properties mode
   - `*.scss` files → SCSS mode
   - Multiple targets found → AUQ: which target?
3. Generate/update target with tokens:
   - **Tailwind:** `theme.extend.colors`, `theme.fontFamily`, `theme.spacing`, `theme.borderRadius`
   - **CSS vars:** `:root { --color-primary: {hex}; --font-sans: {font}; --spacing-base: {n}px; }`
   - **SCSS:** `$color-primary: {hex}; $font-sans: '{font}'; $spacing-base: {n}px;`
4. Conflict resolution: AUQ per conflicting token (Override / Merge / Skip)
5. Report: "Synced N tokens to {target file}"

### --audit flow

1. Discover all `.html` + `.css` + `.scss` files (exclude `node_modules`, `.git`)
2. For each file: extract color/font references → compare vs TOKEN_MAP
3. Categorize deviations:
   - **❌ Critical:** wrong font-family, wrong primary/surface color hex
   - **⚠️ Minor:** hardcoded value instead of CSS var (e.g. `#6366f1` instead of `var(--color-primary)`)
   - **✅ Compliant:** uses correct var or correct hex
4. Generate report table:
   ```
   | File | Colors | Typography | Spacing | Status |
   | index.html | ✅ | ⚠️ 1 | ✅ | Partial |
   ```
5. Summary + suggestion: "Run /vp-design --sync to auto-fix"

### --import [brand] flow

1. Resolve brand:
   - If arg provided → search awesome-design-md catalog for match
   - If no arg → AUQ catalog picker
2. Fetch template (runtime from awesome-design-md GitHub raw content)
3. Preview: show token table (colors/typography/spacing)
4. AUQ: Apply as-is / Customize before applying / Use as reference only
</process>

<success_criteria>
- [ ] `design.md` created/updated at project root
- [ ] `--init` produces valid Design.MD v1 spec YAML front matter
- [ ] `--sync` updates correct target file based on stack detection
- [ ] `--audit` produces severity-categorized compliance report
- [ ] `--import` fetches community template and applies per user choice
- [ ] AUQ used for catalog picker, conflict resolution, apply mode
- [ ] `--init` Step 0 asks aesthetic direction before brand Q&A
- [ ] Font options exclude Inter/Arial/Roboto; include Syne, Bricolage Grotesque, DM Serif
- [ ] `design.md` YAML includes `aesthetic_direction` field
</success_criteria>

## Adapter Compatibility

### AskUserQuestion Tool (ENH-059)

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` — **REQUIRED** | Preload via ToolSearch before first prompt |
| Cursor / Codex / Antigravity / Copilot | ❌ Text fallback | Plain numbered list |

**Claude Code (terminal) — AUQ preload required (ENH-059):**
Call `ToolSearch` with `query: "select:AskUserQuestion"` before first interactive prompt.

**Prompts using AskUserQuestion in this skill:**
- `--init`: primary color palette selection, font family selection
- `--init --import`: awesome-design-md catalog picker, apply mode (as-is/customize/reference)
- `--sync`: conflict resolution per token (Override/Merge/Skip), multi-target selection
- `--audit`: (report only — no AUQ)
- `--import`: catalog picker, apply mode
- Workflow continuation after command completes
</content>
</invoke>