# FEAT-013: Dynamic agent adapter system — multi-platform support (Claude Code, Cursor, Antigravity, Codex, …)

## Meta
- **ID**: FEAT-013
- **Type**: Feature (Platform Architecture)
- **Status**: new
- **Priority**: critical
- **Created**: 2026-04-08
- **Updated**: 2026-04-08 (revised: pivot → adapter system)
- **Reporter**: User
- **Assignee**: AI

## Summary
ViePilot currently hardcodes Cursor as the only platform target (install paths, skill
discovery, execution_context, hooks). This limits adoption and makes adding new platforms
(Claude Code, Antigravity, Codex, future agents) require invasive code changes.

Replace the hardcoded platform logic with a **dynamic adapter system**:
- Each AI agent platform is an **adapter** — a small module defining install paths,
  skill discovery, hooks config, and execution context for that platform.
- Core install/workflow logic is adapter-agnostic.
- New platforms are added by creating one new adapter file — no core changes needed.
- Claude Code becomes the first-class adapter (primary); Cursor is second; future agents
  (Antigravity, Codex, etc.) follow without framework modifications.

## Details
### Current state (hardcoded Cursor)
- `dev-install.sh`: `CURSOR_SKILLS_DIR="$HOME/.cursor/skills"` hardcoded
- `lib/viepilot-install.cjs`: Cursor paths in constants; Claude Code added as special-case
  branch (`installTargets.includes('claude-code')`)
- All `skills/vp-*/SKILL.md` execution_context: `@$HOME/.cursor/viepilot/workflows/…`
- No hooks system — Cursor uses passive `.cursorrules` / MDC files

### Desired state (adapter-based)

#### Adapter interface (`lib/adapters/{platform-id}.cjs`)
Each adapter exports a spec object:

```js
module.exports = {
  id: 'claude-code',                    // slug used in CLI flags + config
  name: 'Claude Code',                  // display name
  skillsDir: '~/.claude/skills',        // where vp-* skills are installed
  viepilotDir: '~/.claude/viepilot',    // where workflows/templates/lib go
  executionContextBase: '$HOME/.claude/viepilot/workflows',
  skillEntryFile: 'SKILL.md',           // skill file name (platform may differ)
  hooks: {
    configFile: '~/.claude/settings.json',
    schema: 'claude-code',              // hook schema type
    supportedEvents: [
      'Stop', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse',
      'SessionStart', 'FileChanged', ...
    ]
  },
  installFiles: ['skills', 'workflows', 'templates', 'bin', 'lib', 'ui-components'],
  isAvailable: () => { /* check if platform binary / dir exists */ },
  notes: 'Requires Claude Code CLI or IDE extension'
}
```

#### Adapter registry (`lib/adapters/index.cjs`)
```js
module.exports = {
  'claude-code': require('./claude-code.cjs'),
  'cursor':      require('./cursor.cjs'),
  // Future: 'antigravity', 'codex', 'gemini-code', ...
}
```

#### Install flow (adapter-aware)
1. `npx viepilot install` → detect available platforms (scan for CLI binaries / dirs)
2. Present menu: `Which agent platform? [Claude Code] [Cursor] [Both] [Other]`
3. Load the selected adapter(s) → use adapter's `skillsDir`, `viepilotDir`, `hooks.configFile`
4. All install logic reads from adapter — no hardcoded paths in core

#### `dev-install.sh` (adapter-aware)
```bash
ADAPTER="${VIEPILOT_ADAPTER:-claude-code}"   # default: claude-code
# Load paths from: lib/adapters/${ADAPTER}.json (exported JSON snapshot)
```

#### Skill execution_context (adapter-templated)
- Replace hardcoded `@$HOME/.cursor/viepilot/workflows/` with adapter-resolved path
- Skills get built with the correct path at install time
- Or: use a platform-agnostic alias `@$VIEPILOT_DIR/workflows/` that resolves via env var

#### Hook registration (adapter-driven)
- `vp-tools hooks install` reads adapter's `hooks.configFile` + `hooks.supportedEvents`
- Writes correct hook config for the selected platform
- Claude Code → `~/.claude/settings.json`
- Cursor → `.cursorrules` or Cursor-native hook mechanism
- Antigravity/Codex → their respective config

### New platforms (future)
Adding Antigravity, Codex, or any future agent:
1. Create `lib/adapters/antigravity.cjs` with platform-specific paths/hooks
2. Register in `lib/adapters/index.cjs`
3. Done — no changes to install scripts, workflows, or skill files

### Claude Code as first-class adapter
Within the adapter system, Claude Code gets:
- First position in install menu (default selection)
- Full hooks support (30 events × 4 handler types)
- `~/.claude/` as default viepilot dir
- Support for FEAT-012 (staleness hook via `Stop` event)

## Acceptance Criteria
- [ ] `lib/adapters/` directory with `index.cjs`, `claude-code.cjs`, `cursor.cjs`
- [ ] Adapter interface defined: id, name, skillsDir, viepilotDir, executionContextBase,
      hooks, installFiles, isAvailable()
- [ ] `lib/viepilot-install.cjs` reads paths from adapter — no hardcoded platform strings
- [ ] `dev-install.sh` uses `VIEPILOT_ADAPTER` env var; defaults to `claude-code`
- [ ] `npx viepilot install` menu shows available platforms (based on `isAvailable()`)
- [ ] Adding a new adapter requires ONLY creating `lib/adapters/{id}.cjs` + registry entry
- [ ] Cursor adapter: no regression — existing `~/.cursor/` install path still works
- [ ] Contract tests: `viepilot-adapters.test.js` — adapter interface shape validation
- [ ] `vp-tools hooks install --adapter {id}` writes hooks config for selected platform

## Related
- Phase: TBD (→ Phase 53; large scope — may split into 53a/53b)
- Files:
  - `lib/adapters/` (new directory)
  - `lib/adapters/index.cjs` (registry)
  - `lib/adapters/claude-code.cjs` (new)
  - `lib/adapters/cursor.cjs` (extracted from existing install logic)
  - `lib/viepilot-install.cjs` (refactor to be adapter-aware)
  - `dev-install.sh` (VIEPILOT_ADAPTER env var)
  - `bin/viepilot.cjs` (install menu uses adapter registry)
  - `bin/vp-tools.cjs` (add `hooks install` subcommand)
  - `tests/unit/viepilot-adapters.test.js` (new)
- Dependencies:
  - All prior phases stable ✅
  - FEAT-012 (staleness hook) — blocked on FEAT-013 adapters (needs Claude Code adapter first)

## Discussion
The adapter pattern is the right long-term architecture. Hard pivoting to Claude Code
without an adapter layer would just trade one hardcoded platform for another. With adapters:

- Antigravity, Codex, and future agents each get one file, not a fork
- The install system auto-detects which platforms are available on the user's machine
- Hook configs are per-adapter — Claude Code gets Settings JSON, Cursor gets rules files,
  future agents get whatever they need
- FEAT-012 (brainstorm staleness hook) becomes adapter-aware: on Claude Code it uses
  `Stop` event; on Cursor it falls back to a manual trigger; on other platforms
  the adapter declares its hook capability

Rough adapter precedence (isAvailable() order for auto-detection):
1. Claude Code (primary, Anthropic-native)
2. Cursor (existing user base)
3. Antigravity (future)
4. Codex (future)
5. Manual / other (fallback)
