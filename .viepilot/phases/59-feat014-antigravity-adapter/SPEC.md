# Phase 59 SPEC — Antigravity Adapter (FEAT-014)

## Goal
Add `antigravity` as a first-class adapter in ViePilot's dynamic adapter system. After install, all `vp-*` skills are available in Google Antigravity IDE. Thanks to ENH-035 (Phase 58), no `pathRewrite` is needed — just `executionContextBase`.

## Platform Summary
- **Google Antigravity**: AI-powered IDE (desktop, Mac/Windows/Linux), powered by Gemini
- Skills use **SKILL.md** format (identical to ViePilot — no conversion needed)
- Global install path: `~/.antigravity/skills/` (convention matching Cursor pattern)
- No hooks system documented (same as Cursor — `configFile: null`)
- Project-level config: `.agent/` folder (not relevant for global install)

## Target Version
`2.3.0` (MINOR — new adapter)

## Dependencies
Phase 58 ✅ (ENH-035 — `{envToolDir}` template; `pathRewrite` removed from adapter shape)

## Tasks

| Task | Title | Complexity |
|------|-------|------------|
| 59.1 | `lib/adapters/antigravity.cjs` — new adapter file | S |
| 59.2 | `lib/adapters/index.cjs` — register `antigravity` + aliases | S |
| 59.3 | `dev-install.sh` — add `antigravity` case | S |
| 59.4 | `bin/viepilot.cjs` — add Antigravity to UI target list + usage help | S |
| 59.5 | `tests/unit/vp-adapter-antigravity.test.js` — contract tests | S |
| 59.6 | `docs/user/features/adapters.md` — new doc: supported platforms table | S |

## Acceptance Criteria
- [ ] `getAdapter('antigravity')` resolves without error
- [ ] `antigravity.skillsDir(home)` returns `~/.antigravity/skills`
- [ ] `antigravity.viepilotDir(home)` returns `~/.antigravity/viepilot`
- [ ] `antigravity.executionContextBase` is `.antigravity/viepilot`
- [ ] `antigravity.pathRewrite` field does NOT exist (ENH-035 clean shape)
- [ ] `dev-install.sh VIEPILOT_ADAPTER=antigravity` installs to `~/.antigravity/`
- [ ] `viepilot.cjs` interactive installer shows Antigravity as selectable target
- [ ] All contract tests pass
- [ ] `npm test` green (no regression)

## Related
- FEAT-014 request: `.viepilot/requests/FEAT-014.md`
- ENH-035 (Phase 58): clean adapter shape without `pathRewrite`
- FEAT-013 (Phase 53): adapter system foundation
