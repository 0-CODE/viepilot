---
name: vp-info
description: "Display ViePilot version, npm latest, skills/workflows list via vp-tools"
version: 0.1.1
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-info`, `/vp-info`, "viepilot version", "phiên bản viepilot", "skills list bundle"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. Tool Usage
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

- **Inventory / version info** — does not implement shipping; implement via **`/vp-auto`**. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Run **`vp-tools info`** to retrieve the ViePilot bundle metadata (no `.viepilot/` needed in the target project).

**Useful output for agents:**
- `installedVersion`, `packageName`, `packageRoot`
- `latestNpm` (ok + version or network/registry error)
- `gitHead` (if clone has git)
- `skills[]`: `id`, `version`, `relativePath`
- `workflows[]`: `id`, `relativePath`, `note`

Use **`vp-tools info --json`** when parsing or comparing versions in scripts.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/bin/vp-tools.cjs
</execution_context>

<process>

### Step 1: Resolve CLI
Priority order:
1. `vp-tools info` — when ViePilot is already on `PATH` (npm global or shim).
2. `node <viepilot-package>/bin/vp-tools.cjs info` — from repo clone or `node_modules/viepilot`.

### Step 2: Run command
```bash
vp-tools info
# or
vp-tools info --json
```

### Step 3: Interpret JSON (when using `--json`)
- **`packageRoot`**: root of the `viepilot` package the CLI resolved.
- **`installedVersion`**: semver in `package.json` of that bundle.
- **`latestNpm`**: `{ ok, version }` or `{ ok: false, error }`.
- **`skills`**: skill inventory in `skills/*/SKILL.md` (version from frontmatter).
- **`workflows`**: files in `workflows/*.md`.

### Step 4: Common errors
If package root is not found: install globally (`npm i -g viepilot`), or run from a project that has `viepilot` as a dependency, or point directly to `bin/vp-tools.cjs` in a clone.
</process>

<success_criteria>
- [ ] Correct subcommand `info` called (or `--json` when parsing is needed)
- [ ] `installedVersion` and (if available) `latestNpm.version` clearly stated
- [ ] When user asks “what skills are in the bundle”, summarize from `skills[]` or CLI table output
</success_criteria>
