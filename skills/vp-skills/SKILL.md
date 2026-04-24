# Skill: vp-skills

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-SKILLS  v0.1.0 (fw 2.31.0)
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


<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-skills`, `/vp-skills`, "scan skills", "list skills", "install skill", "global registry"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options at control points.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>

<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.

**Exception — this skill:** `/vp-skills` manages the global registry and explicitly supports third-party skill installation by design. A user explicitly opts in to third-party skills when running `install`, `uninstall`, or `update` commands.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **Read-only / management** — does not implement shipping code. All operations delegate to shell commands via the installed vp-tools binary.
- **Exception:** Install/uninstall/update mutate `~/.viepilot/skill-registry.json` and adapter skill directories — scoped to user-level global state, not project shipping code.
</implementation_routing_guard>

<objective>
Manage the global ViePilot skill registry from any project directory.

**Commands:**
```
/vp-skills scan          — Refresh ~/.viepilot/skill-registry.json by scanning all adapter dirs
/vp-skills list          — Display indexed skills table
/vp-skills install <src> — Install skill from npm / github:<user>/<repo> / local path
/vp-skills uninstall <id>— Remove skill from all adapter dirs
/vp-skills update <id>   — Re-install skill from its original source
/vp-skills info <id>     — Show skill capabilities, best_practices, and adapter paths
```

**Registry file:** `~/.viepilot/skill-registry.json` — shared across all projects.

**Cross-project:** This skill uses the installed vp-tools binary, independent of current working directory.
</objective>

<process>

### Step 0: Resolve Installed Binary Path

All commands use the installed vp-tools binary (not a project-local bin/):

```bash
VP_TOOLS=~/.claude/viepilot/bin/vp-tools.cjs
# Fallback for Cursor adapter:
[ -f "$VP_TOOLS" ] || VP_TOOLS=~/.cursor/viepilot/bin/vp-tools.cjs
```

If neither path exists, print:
```
⛔ vp-tools not installed. Run: vp-tools install
   Expected path: ~/.claude/viepilot/bin/vp-tools.cjs
```

---

### Command: scan

Refresh the global registry by scanning all adapter skill directories.

```bash
node ~/.claude/viepilot/bin/vp-tools.cjs scan-skills \
  || node ~/.cursor/viepilot/bin/vp-tools.cjs scan-skills
```

Display result:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VP-SKILLS ► SCAN COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Registry: ~/.viepilot/skill-registry.json
 Skills found: {N}
 Run /vp-skills list to view
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Command: list

Display all indexed skills in a readable table.

```bash
node ~/.claude/viepilot/bin/vp-tools.cjs list-skills \
  || node ~/.cursor/viepilot/bin/vp-tools.cjs list-skills
```

Format output as table:
```
ID                  Version   Source              Adapters
──────────────────  ────────  ──────────────────  ────────────────────
frontend-design     1.2.0     github:user/repo    claude, cursor
vp-ui-components    0.3.1     npm                 claude
my-local-skill      0.1.0     local               claude, cursor
```

If registry absent or empty:
```
No skills indexed. Run /vp-skills scan to populate registry.
```

---

### Command: install \<source\>

Install a skill from any source channel.

```bash
node ~/.claude/viepilot/bin/vp-tools.cjs install-skill <source> \
  || node ~/.cursor/viepilot/bin/vp-tools.cjs install-skill <source>
```

Source formats:
- `npm-package-name` — install from npm
- `github:<user>/<repo>` — install from GitHub tarball
- `./path/to/skill` or `/absolute/path` — install from local directory

Display on success:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VP-SKILLS ► INSTALLED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ID: {skill-id}
 Source: {source}
 Installed to: {paths}
 Registry updated automatically.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Command: uninstall \<id\>

Remove a skill from all adapter directories.

```bash
node ~/.claude/viepilot/bin/vp-tools.cjs uninstall-skill <id> \
  || node ~/.cursor/viepilot/bin/vp-tools.cjs uninstall-skill <id>
```

Display on success:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VP-SKILLS ► UNINSTALLED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ID: {id}
 Removed from: {paths}
 Registry updated automatically.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Command: update \<id\>

Re-install a skill from its original source (reads source from `skill-meta.json`).

```bash
node ~/.claude/viepilot/bin/vp-tools.cjs update-skill <id> \
  || node ~/.cursor/viepilot/bin/vp-tools.cjs update-skill <id>
```

Display on success:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VP-SKILLS ► UPDATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ID: {id}
 Source: {original-source}
 Updated version: {version}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Command: info \<id\>

Show detailed information about a skill from the registry.

```bash
node ~/.claude/viepilot/bin/vp-tools.cjs get-registry --id <id> \
  || node ~/.cursor/viepilot/bin/vp-tools.cjs get-registry --id <id>
```

Parse JSON output and display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VP-SKILLS ► INFO: {id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ID:          {id}
 Version:     {version}
 Source:      {source}
 Adapters:    {adapters}

 Capabilities:
   - {capability-1}
   - {capability-2}

 Best Practices:
   - {practice-1}
   - {practice-2}

 Tags: {tags}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If skill not found: `Skill '{id}' not found in registry. Run /vp-skills scan to refresh.`

</process>

<success_criteria>
- [ ] Binary path resolved (claude → cursor fallback)
- [ ] scan: registry refreshed via shell command
- [ ] list: all indexed skills displayed
- [ ] install: skill installed from npm/github/local
- [ ] uninstall: skill removed from all adapter dirs
- [ ] update: skill re-installed from original source
- [ ] info: capabilities and best_practices displayed
- [ ] All commands use installed path (~/.claude/viepilot/...) — cross-project safe
</success_criteria>

## Adapter Compatibility

### AskUserQuestion Tool
This skill uses adapter-aware interactive prompts where needed.

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` tool | For confirmation on destructive actions (uninstall) |
| Cursor (Agent/Skills) | ❌ Text fallback | Plain-text confirmation |
| Codex CLI | ❌ Text fallback | Native tool N/A |
| Antigravity | ❌ Text fallback | Artifact model |

**Claude Code (terminal) — REQUIRED:** Before executing `uninstall`, call `AskUserQuestion`:
```
question: "Uninstall '{id}'? This removes it from all adapter directories."
options:
  - label: "Yes, uninstall"
    description: "Remove skill from ~/.claude/skills/{id}/ and ~/.cursor/skills/{id}/"
  - label: "Cancel"
    description: "Keep the skill installed"
```

**Text fallback:**
```
Confirm uninstall '{id}'?
  1. Yes — remove from all adapters
  2. Cancel
```
