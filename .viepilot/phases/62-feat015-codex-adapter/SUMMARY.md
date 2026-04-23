# Phase 62 — Summary: Codex CLI adapter (FEAT-015) → 2.4.0

## What shipped
- `lib/adapters/codex.cjs` — new adapter:
  - `skillsDir`: `~/.codex/skills/`
  - `viepilotDir`: `~/.codex/viepilot/`
  - `executionContextBase`: `.codex/viepilot`
  - `postInstallHint`: `'Open project and type $vp-status to get started'` (uses `$` prefix, not `/`)
  - `hooks.configFile: null` — Codex uses AGENTS.md convention, no programmatic hooks
- `lib/adapters/index.cjs`: `'codex'` registered; `listAdapters()` returns 4 unique adapters
- `bin/viepilot.cjs`: Codex added to TARGETS; help text updated for install + uninstall
- `docs/user/features/adapters.md`:
  - Added `codex` row to platform table with `$vp-status` syntax column
  - Added callout note explaining `$skill-name` vs `/command` in Codex
  - Added `codex` install example
  - Added `codex → .codex/viepilot` to path resolution table
  - Added `postInstallHint` note to "Adding a new adapter" guide
  - Removed stale `dev-install.sh` section (deleted Phase 60)

## Key note: Codex invocation syntax
Codex CLI reserves `/command` for built-in controls (`/plan`, `/clear`, `/diff`…).
User-defined skills use `$skill-name` → users type `$vp-status`, `$vp-brainstorm`, etc.
SKILL.md file format is 100% compatible — no skill content changes needed.

## Test count
596 → 607 (+11)
