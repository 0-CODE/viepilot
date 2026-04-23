# FEAT: Antigravity adapter — vp-* skills work in Google Antigravity IDE

## Meta
- **ID**: FEAT-014
- **Type**: Feature
- **Status**: new
- **Priority**: high
- **Created**: 2026-04-10
- **Reporter**: User
- **Assignee**: AI

## Summary
Add `antigravity` as a first-class adapter in ViePilot's dynamic adapter system (FEAT-013). After install, all `vp-*` skills run in Google Antigravity the same way they run in Claude Code and Cursor.

## Background: How Antigravity Works

| Concept | Antigravity path | Equivalent |
|---------|-----------------|------------|
| Project-level config | `.agent/` folder | `.cursor/` / `.claude/` |
| Slash-command workflows | `.agent/workflows/` | `.cursor/rules/` |
| Global user skills | `~/.antigravity/skills/` *(by convention)* | `~/.cursor/skills/` / `~/.claude/skills/` |
| Rules | `.agent/rules/` | Cursor MDC rules |
| Hooks / stop events | Not documented (no equivalent to Claude Code Stop hooks) | — |

Skills use **SKILL.md** frontmatter format — identical to ViePilot's current format. No schema conversion needed.

Sources:
- https://codelabs.developers.google.com/getting-started-google-antigravity
- https://github.com/sickn33/antigravity-awesome-skills
- https://dev.to/malloc72p/antigravity-getting-the-most-out-of-agentic-coding-with-rules-skills-and-workflows-54pb

## Scope

### Part A — `lib/adapters/antigravity.cjs`
New adapter file following the same shape as `cursor.cjs`:
```js
{
  id: 'antigravity',
  name: 'Antigravity',
  skillsDir:   (home) => path.join(home, '.antigravity', 'skills'),
  viepilotDir: (home) => path.join(home, '.antigravity', 'viepilot'),
  executionContextBase: '.antigravity/viepilot',
  pathRewrite: { from: '.cursor/viepilot', to: '.antigravity/viepilot' },
  hooks: {
    configFile: null,        // no hooks system in Antigravity
    schema: 'antigravity',
    supportedEvents: []
  },
  installSubdirs: [ 'workflows', 'templates/project', 'templates/phase',
                    'templates/architect', 'bin', 'lib', 'ui-components' ],
  isAvailable: (home) => fs.existsSync(path.join(h, '.antigravity'))
}
```

### Part B — Register in `lib/adapters/index.cjs`
Add `'antigravity': require('./antigravity.cjs')` to the adapters map.

### Part C — `dev-install.sh` target
Add `antigravity` as a valid `--target` option alongside `cursor` and `claude-code`.

### Part D — `bin/vp-tools.cjs` install command
Ensure `vp-tools install --adapter antigravity` works end-to-end.

### Part E — Contract tests
Add test file `tests/unit/vp-adapter-antigravity.test.js` verifying:
- Adapter loads via `getAdapter('antigravity')`
- `skillsDir`, `viepilotDir`, `executionContextBase` return correct paths
- `pathRewrite` rewrites `.cursor/viepilot` → `.antigravity/viepilot`
- `hooks.configFile` is null (no hooks)
- Adapter is listed in `listAdapters()`

### Part F — Docs
Update `docs/user/features/adapters.md` (or equivalent) to list Antigravity as supported platform.

## Acceptance Criteria
- [ ] `lib/adapters/antigravity.cjs` created with correct shape
- [ ] `getAdapter('antigravity')` resolves without error
- [ ] `dev-install.sh --target antigravity` installs skills to `~/.antigravity/viepilot/`
- [ ] `vp-tools install --adapter antigravity` works
- [ ] All `execution_context` paths in skill `.md` files point to `.antigravity/viepilot/` after install
- [ ] Contract tests pass
- [ ] `npm test` green (no regression)

## Related
- FEAT-013 (adapter system foundation — 2.0.0): this extends it with a third platform
- Antigravity Awesome Skills: https://github.com/sickn33/antigravity-awesome-skills
