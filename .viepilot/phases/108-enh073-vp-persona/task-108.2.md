# Task 108.2 — Multi-context: context-map auto-populate + auto-switch + vp-tools persona subcommand

## Objective
Auto-populate `~/.viepilot/context-map.json` when `inferPersona` runs in a new directory.
Add auto-switch logic (called at start of every vp-* skill invocation via vp-tools).
Add `persona` subcommand to `bin/vp-tools.cjs` with get/infer/list/set operations.

## Paths
```
lib/viepilot-persona.cjs          ← extend: updateContextMap, autoSwitch
bin/vp-tools.cjs                  ← extend: 'persona' subcommand
```

## File-Level Plan

### `lib/viepilot-persona.cjs` — additions

**`updateContextMap(projectDir, personaName)`:**
1. Read `~/.viepilot/context-map.json` (or `{}`)
2. Set `map[absolutePath(projectDir)] = personaName`
3. Write back — silent on error

**`autoSwitch(projectDir)`:**
1. `resolvePersona(projectDir)` → get persona
2. If persona differs from current active: `setActivePersona(name)`; `updateContextMap(projectDir, name)`
3. If `persona.confidence < 0.6`: append note to `~/.viepilot/pending-review.md`
4. Returns resolved persona (never throws)

**`autoSwitch` is called automatically by vp-tools `persona auto-switch` at skill start.**

### `bin/vp-tools.cjs` — `persona` subcommand

Add `'persona': (args) => { ... }` handler. Sub-operations by first arg:

```
vp-tools persona get              → print active persona JSON
vp-tools persona infer [dir]      → run inferPersona(dir||cwd), print result, update context-map
vp-tools persona list             → list all ~/.viepilot/personas/*.json (name, domain, confidence, active marker)
vp-tools persona set <name>       → setActivePersona(name)
vp-tools persona auto-switch      → autoSwitch(cwd) — called by skill entry points
vp-tools persona context [dir]    → print generatePersonaContext for resolved persona
```

Add to `commandHelp`:
```
persona <op>           Manage personas (get|infer|list|set|auto-switch|context)
  get                  Show active persona JSON
  infer [dir]          Infer persona from project files + git
  list                 List all saved personas
  set <name>           Set active persona by name
  auto-switch          Auto-detect and switch persona for current directory
  context [dir]        Print persona-context.md content for current project
```

Add to usage display line: `${colors.bold}persona${colors.reset} <op>         Manage user personas (get|infer|list|set|auto-switch|context)`

## Best Practices
- `persona auto-switch` must be non-blocking and silent — never exit non-zero from auto-switch
- `context-map.json` keys are absolute, normalized paths (`path.resolve(dir)`)
- `persona list` output: one line per persona — `[active] name  domain  confidence`
- `persona infer` exit 0 always; print JSON to stdout

## Verification
```bash
node bin/vp-tools.cjs persona infer .
# → JSON with domain, confidence

node bin/vp-tools.cjs persona list
# → list of personas with active marker

node bin/vp-tools.cjs persona get
# → active persona JSON or "No active persona"

node bin/vp-tools.cjs persona auto-switch
# → silent exit 0
```
