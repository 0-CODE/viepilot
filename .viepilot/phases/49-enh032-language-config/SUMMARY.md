# Phase 49 Summary — Language Configuration System (ENH-032)

**Status**: ✅ Complete  
**Version**: 1.17.0  
**Date**: 2026-04-06

## What was built
A persistent language configuration system for ViePilot that lets users set preferred languages for AI communication and generated project files.

## Deliverables

### New files
- `lib/viepilot-config.cjs` — config module: `readConfig`, `writeConfig`, `resetConfig`, `getConfigPath`, `DEFAULTS`
- `tests/unit/vp-enh032-language-config.test.js` — 18 contract tests (4 groups)
- `.viepilot/phases/49-enh032-language-config/` — phase directory with tasks + state

### Modified files
- `lib/viepilot-install.cjs` — imports viepilot-config; adds `language_config_prompt` install step
- `bin/vp-tools.cjs` — imports viepilot-config; adds `config get/set/reset` command
- `workflows/crystallize.md` — new Step 0-A `load_language_config` (DOCUMENT_LANG + COMMUNICATION_LANG)
- `workflows/brainstorm.md` — new Step 0 `detect_session_language` (BRAINSTORM_LANG)
- `workflows/autonomous.md` — `load_language_config` step in Initialize (COMMUNICATION_LANG for banners)
- `skills/vp-crystallize/SKILL.md` — ENH-032 language config notes
- `skills/vp-brainstorm/SKILL.md` — ENH-032 language config notes
- `skills/vp-auto/SKILL.md` — ENH-032 language config notes
- `package.json` + `package-lock.json` — version 1.17.0
- `CHANGELOG.md` — [1.17.0] entry
- `.viepilot/TRACKER.md` — phase 49 complete
- `.viepilot/ROADMAP.md` — phase 49 status updated

## Config schema
```json
{
  "language": {
    "communication": "en",
    "document": "en"
  }
}
```

## CLI usage
```bash
vp-tools config get language.communication   # prints current value
vp-tools config set language.communication vi
vp-tools config reset                        # resets to defaults
```

## Tests
466 total tests passing (18 new in ENH-032 group).
