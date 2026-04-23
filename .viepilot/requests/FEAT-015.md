# FEAT: OpenAI Codex CLI adapter

## Meta
- **ID**: FEAT-015
- **Type**: Feature
- **Status**: done
- **Priority**: high
- **Created**: 2026-04-10
- **Reporter**: User
- **Assignee**: AI

## Summary
Add `codex` as a first-class ViePilot adapter so vp-* skills install and run inside the OpenAI Codex CLI agent (`~/.codex/`). Codex CLI is a terminal-based AI coding agent (similar to Claude Code) released by OpenAI.

## Details

### What is Codex CLI
- Terminal-based AI coding agent by OpenAI (released ~April 2025)
- Config home: `~/.codex/` (env override: `CODEX_HOME`)
- Skill files: SKILL.md format (same as ViePilot) stored in `~/.codex/skills/`
- `AGENTS.md` auto-loaded at session start (project-level instructions)
- GitHub: `github.com/openai/codex`

### ⚠️ Key difference: skill invocation syntax
Codex uses **`$skill-name`** — NOT `/skill-name`:

| Adapter | Invoke skill |
|---------|-------------|
| Claude Code | `/vp-status` |
| Cursor | `/vp-status` |
| Antigravity | `/vp-status` |
| **Codex** | **`$vp-status`** |

Codex's `/command` syntax is reserved for built-in system controls (`/plan`, `/clear`, `/diff`, etc.). User-defined skills use `$`.

**Impact:**
1. `postInstallHint` must say `$vp-status` not `/vp-status`
2. `docs/user/features/adapters.md` must document the `$` prefix for Codex
3. SKILL.md file format itself is compatible — Codex natively reads SKILL.md; no changes needed to skill content
4. No new adapter field needed — `invokePrefix` is not required since it's purely a UX/doc concern, not a code path in the installer

### Adapter configuration
Following the ENH-035 clean adapter pattern (no `pathRewrite` needed — just `executionContextBase`):

```js
// lib/adapters/codex.cjs
module.exports = {
  id: 'codex',
  name: 'Codex',
  skillsDir:   (home) => path.join(home, '.codex', 'skills'),
  viepilotDir: (home) => path.join(home, '.codex', 'viepilot'),
  executionContextBase: '.codex/viepilot',
  postInstallHint: 'Open project and type $vp-status to start',
  hooks: {
    configFile: null,       // Codex uses AGENTS.md, not programmatic hooks
    schema: 'codex',
    supportedEvents: []
  },
  installSubdirs: ['workflows', 'templates/project', 'templates/phase', 'templates/architect', 'bin', 'lib', 'ui-components'],
  isAvailable: (home) => fs.existsSync(path.join(home || os.homedir(), '.codex'))
};
```

### Files to change (following FEAT-014 Antigravity pattern)
1. `lib/adapters/codex.cjs` — new adapter; `postInstallHint` uses `$vp-status` syntax
2. `lib/adapters/index.cjs` — register `'codex'` in adapters map; `listAdapters()` returns 4
3. `bin/viepilot.cjs` — add `{ id: 'codex', label: 'Codex' }` to TARGETS array; update help text
4. `tests/unit/vp-adapter-codex.test.js` — 10 contract tests (shape, registry, install plan, postInstallHint contains `$vp-status`)
5. `tests/unit/viepilot-adapters.test.js` — update `listAdapters()` count: 3 → 4
6. `tests/unit/guided-installer.test.js` — update `normalizeTargets('all')` to include `'codex'`
7. `docs/user/features/adapters.md` — add Codex row; note `$skill-name` invocation syntax

## Acceptance Criteria
- [ ] `getAdapter('codex')` resolves without error
- [ ] `listAdapters()` returns 4 unique adapters
- [ ] `viepilot install --target codex --yes --dry-run` runs; output contains "Codex:"
- [ ] `viepilot --list-targets` shows `codex`
- [ ] `normalizeTargets('all')` includes `'codex'`
- [ ] `npm test` passes; 10 new contract tests green
- [ ] `docs/user/features/adapters.md` updated

## Related
- Phase: TBD (~62)
- Files: `lib/adapters/codex.cjs` (new), `lib/adapters/index.cjs`, `bin/viepilot.cjs`, tests, docs
- Dependencies: Phase 61 ✅ (ENH-037 — postInstallHint on adapters), Phase 59 ✅ (FEAT-014 antigravity pattern)

## Discussion
Codex CLI uses `~/.codex/` and natively supports SKILL.md format — so skill content is 100% compatible. The only difference is **invocation syntax**: users type `$vp-status` not `/vp-status`. This is a UX/doc concern only — no changes to skill file content or installer logic are needed beyond updating `postInstallHint` and the adapters doc. Implementation follows the same pattern as `lib/adapters/antigravity.cjs` with `codex` substituted.

## Resolution
Shipped in **Phase 62 → v2.4.0** (2026-04-10). Codex adapter at `lib/adapters/codex.cjs`; registered in `lib/adapters/index.cjs`; TARGETS updated in `bin/viepilot.cjs`; 11 contract tests green; `docs/user/features/adapters.md` updated.
