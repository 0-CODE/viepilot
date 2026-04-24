# Phase 108 Spec — ENH-073: vp-persona Workflow Customization by Domain, Role & Interests

## Goal
Add a fully automated cross-project persona system to ViePilot. Persona is inferred from project
files + git history on first invocation — no wizard, no manual setup. Supports auto-switch between
projects, auto-merge of multi-domain projects, 5 built-in domain packs, and always-on adaptive
calibration via Reflexion pattern + JSON Patch overlays.

**Core principle:** Persona exists because AI reads context — not because user declares it.

## Version Target
2.41.0 → 2.42.0 (MINOR — new skill + library)

## Architecture Overview
```
lib/viepilot-persona.cjs       ← inferPersona, resolvePersona, mergePersonas, generatePersonaContext
lib/viepilot-calibrate.cjs     ← runCalibration, writeOverlay, applyPatch, readTraces
lib/domain-packs/              ← 5 JSON domain pack files
skills/vp-persona/SKILL.md     ← new vp-persona skill
bin/vp-tools.cjs               ← persona subcommand (get/infer/list/set)
bin/viepilot.cjs               ← install-domain subcommand
workflows/brainstorm.md        ← persona read + domain pack topic injection
workflows/autonomous.md        ← persona-context.md injection
workflows/crystallize.md       ← output_style adaptation
workflows/evolve.md            ← phase_template suggestion
skills/vp-*/SKILL.md           ← persona-context injection note (all 18 skills)
```

## Runtime Paths (always ~/.viepilot/)
```
~/.viepilot/persona.json              ← active persona pointer
~/.viepilot/personas/                 ← named persona files
~/.viepilot/context-map.json          ← dir → persona bindings (auto-populated)
~/.viepilot/traces/{session-id}.json  ← session traces (async, always-on)
~/.viepilot/overlays/{persona}/       ← JSON Patch overlay files
~/.viepilot/persona-reflections.json  ← Reflexion memory + guardrail_journal
~/.viepilot/pending-review.md         ← 🟡 auto-applied changes log
```

## Dependencies
- `lib/viepilot-info.cjs` → `resolveViepilotPackageRoot()` (existing)
- `lib/viepilot-config.cjs` (existing)
- Node.js built-ins: `fs`, `os`, `path`, `child_process` (execSync for git shortlog)
- No new npm deps

## Tasks
| # | Task | Complexity |
|---|------|------------|
| 108.1 | inferPersona + resolvePersona + generatePersonaContext | M |
| 108.2 | context-map auto-populate + auto-switch + auto-merge + vp-tools persona subcommand | M |
| 108.3 | Domain Packs: 5 JSON files + brainstorm.md + install-domain | M |
| 108.4 | skills/vp-persona/SKILL.md + workflow injections (all 4 workflows + 18 skills) | M |
| 108.5 | lib/viepilot-calibrate.cjs + traces + Reflexion + overlays + pending-review + tests + CHANGELOG | L |
