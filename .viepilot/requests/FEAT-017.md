# FEAT-017: Dev-install — install local repo source to Claude Code

## Meta
- **ID**: FEAT-017
- **Type**: Feature Request
- **Status**: new
- **Priority**: high
- **Created**: 2026-04-10
- **Reporter**: User
- **Assignee**: AI

## Summary
Add a first-class "dev install" workflow so the local ViePilot repo source (current branch, not npm-published version) can be installed directly into Claude Code (`~/.claude/skills/`, `~/.claude/viepilot/`). Enables using unreleased/local v2.6.0+ features immediately without waiting for an npm publish.

## Details

### Current behavior
- `npx viepilot install --target claude-code` installs from npm-published package
- No documented path to install from local source
- `node bin/viepilot.cjs install --target claude-code` may work but is undocumented

### Desired behavior
A single command (or documented workflow) to install from local source:
```bash
node bin/viepilot.cjs install --target claude-code --yes
# or
npm run dev:install          # convenience script
```

### Scope
- Verify `node bin/viepilot.cjs install --target claude-code --yes` works from repo root
- If it works: add `dev:install` npm script + document in `docs/user/dev-install.md`
- If `pkgRoot` resolution breaks when running from source: fix the resolution logic
- Optionally add `vp-tools dev-install` subcommand

### Affected files
- `bin/viepilot.cjs` — verify/fix pkgRoot resolution from source
- `lib/viepilot-install.cjs` — verify install plan works with local paths
- `package.json` — add `dev:install` convenience script
- `docs/user/dev-install.md` — short guide (NEW)

## Acceptance Criteria
- [ ] `node bin/viepilot.cjs install --target claude-code --yes` completes without error from repo root
- [ ] Skills from local source appear in `~/.claude/skills/vp-*`
- [ ] ViePilot bundle appears in `~/.claude/viepilot/`
- [ ] `npm run dev:install` convenience script added to package.json
- [ ] Brief guide at `docs/user/dev-install.md`

## Related
- Phase: TBD (next available)
- Files: `bin/viepilot.cjs`, `lib/viepilot-install.cjs`, `package.json`
- Dependencies: FEAT-013 ✅ (claude-code adapter), FEAT-015 ✅ (codex adapter)

## Discussion
User wants to immediately use the local v2.6.0 source with Claude Code rather than waiting for npm publish. The existing installer likely works, but needs verification and a clean entry point.

## Resolution
Dry-run verified 2026-04-10: `node bin/viepilot.cjs install --target claude-code --yes --dry-run` resolves pkgRoot correctly to repo root. All 17 skills + workflows detected. No code changes needed — scope reduced to npm script + docs only.
