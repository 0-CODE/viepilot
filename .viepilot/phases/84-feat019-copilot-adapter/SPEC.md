# Phase 84 Spec — GitHub Copilot Adapter (FEAT-019)

## Goal
Add `copilot` as a first-class ViePilot adapter, enabling vp-* skills to install and
run inside GitHub Copilot environments (VS Code Copilot Chat, GitHub Copilot CLI).
Follows the same pattern as the Codex adapter (FEAT-015, Phase 62).

## Context
- FEAT-019 filed 2026-04-18
- Research confirms HIGH feasibility: GitHub Copilot SDK (Public Preview) supports
  custom agents via `.agent.md` files; third-party agents now GA in April 2026
- Config home: `~/.config/gh-copilot/` (standard `gh` CLI config location)
- Invocation: `/vp-status` in Copilot Chat (same as Claude Code, Cursor)
- Depends on Phase 83 (doc-sync-agent) for bulk SKILL.md update task

## Version Target
2.20.0 → **2.21.0** (MINOR — new adapter)

## Affected Files

### New files
- `lib/adapters/copilot.cjs`
- `tests/unit/vp-feat019-copilot-adapter.test.js`

### Modified files
- `lib/adapters/index.cjs` — register copilot adapter
- `lib/viepilot-install.cjs` — add `copilot` to install targets
- `skills/vp-*/SKILL.md` — 17 files: add Copilot row to adapter compatibility table
- `docs/user/features/adapters.md` — document Copilot surface variants
- `CHANGELOG.md` — [2.21.0] entry
- `package.json` — bump to 2.21.0
- `README.md` — badge + adapter count update

## Adapter Design

```js
// lib/adapters/copilot.cjs
module.exports = {
  id: 'copilot',
  name: 'GitHub Copilot',
  skillsDir:   (home) => path.join(home, '.config', 'gh-copilot', 'skills'),
  viepilotDir: (home) => path.join(home, '.config', 'gh-copilot', 'viepilot'),
  executionContextBase: '.config/gh-copilot/viepilot',
  postInstallHint: 'Open Copilot Chat in VS Code and type /vp-status to get started',
  hooks: {
    configFile: null,  // Copilot uses .agent.md convention, not programmatic hooks
    schema: 'copilot',
    supportedEvents: []
  },
  installSubdirs: ['workflows', 'templates/project', 'templates/phase', 'templates/architect', 'bin', 'lib', 'ui-components'],
  isAvailable: (home) => {
    const h = home || os.homedir();
    return fs.existsSync(path.join(h, '.config', 'gh-copilot'))
      || fs.existsSync('/usr/local/bin/gh') || fs.existsSync('/opt/homebrew/bin/gh');
  }
};
```

## SKILL.md Adapter Table Row
```
| GitHub Copilot | ✅ `/skill-name` in Chat | Via `.agent.md` custom agent |
```

## Tasks
| ID | Title | Complexity |
|----|-------|------------|
| 84.1 | `lib/adapters/copilot.cjs` + register in `lib/adapters/index.cjs` | S |
| 84.2 | `lib/viepilot-install.cjs` — add `copilot` install target | S |
| 84.3 | Update all 17 SKILL.md — add Copilot adapter row (invoke doc-sync-agent) | M |
| 84.4 | `docs/user/features/adapters.md` — document Copilot surface variants + CLI config dir | S |
| 84.5 | Contract tests + CHANGELOG + version 2.21.0 | S |

## Acceptance Criteria
- [ ] `lib/adapters/copilot.cjs` exists with correct `id`, `skillsDir`, `viepilotDir`, `isAvailable`
- [ ] `lib/adapters/index.cjs` includes `'copilot': require('./copilot.cjs')`
- [ ] `lib/viepilot-install.cjs` handles `--adapter copilot` target
- [ ] All 17 `skills/vp-*/SKILL.md` have Copilot row in adapter table
- [ ] `docs/user/features/adapters.md` covers VS Code Chat + CLI surfaces
- [ ] Contract tests: ≥8 tests (adapter fields, isAvailable logic, registry, installer, SKILL.md rows)
- [ ] `CHANGELOG.md` has `[2.21.0]` entry
- [ ] `package.json` = "2.21.0"

## Open Questions / Future Work (Phase 2)
- MCP registration: ViePilot tools-as-MCP for Copilot — stretch goal
- Cloud agent custom agents (preview) — separate surface when GA
- JetBrains Copilot parity — pending IDE support
