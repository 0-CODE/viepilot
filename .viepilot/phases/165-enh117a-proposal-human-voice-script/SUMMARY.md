# Phase 165 Summary — ENH-117a Human Voice + Spoken Script

**Status**: Complete (2026-11-07)
**Version**: v3.13.0
**Test Results**: 2353 → 2364 (11 new assertions)

## Goal
Enable vp-proposal to generate human-voiced narratives and production-ready scripts — voice selection per run, speech notes validation, multi-duration script variants (5/15/30 min), cue-based speaker notes.

## What Shipped

### Features
- **Prompt Contract** (`prompt-contract.md`) with `VOICE_LEVELS`, `AI_CLICHE_BLACKLIST`, `detectCliches` (wildcard, NFC, case-insensitive)
- **Workflow 0.2.0**: Voice Profile (3 clichés), Story Brief (3 descriptors), prompt contract post-check, arc beats
- **lib/proposal-script.cjs**: bilingual `validateSpeakerNotes`, `planDuration` fills 5/15/30 to target, `buildScriptMarkdown`, Q&A builder
- **SKILL 0.2.0**: `--voice` (1–4), `--duration` (5/15/30 min), phase165 contracts (12 test cases)

### Quality Gates (Orchestrator)
- Cliché wildcard, NFC normalization, case-insensitive detection
- Bilingual spelled-number validation
- Duration fill algorithm
- Cue name standardization

### Deviations
- Letter sub-steps retained for legacy test anchors (will drop in Phase 166)
- No Vietnamese in workflow/SKILL files (ENH-031 test forbids it; docs stay bilingual)

## Version & Tests
- **Target**: v3.13.0 (MINOR)
- **Tests**: 2364/2364 green (2353 baseline + 11 new phase165 assertions)

## Commits
- `cc76435`: SKILL flags + tests + contract (165.1–165.3)
- `06122e5`: version-literal tests made resilient (>=)
- `5e876c6`: chore(release) 3.13.0
