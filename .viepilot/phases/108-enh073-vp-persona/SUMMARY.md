# Phase 108 Summary — ENH-073: vp-persona Workflow Customization

## Result: ✅ PASS → v2.42.0

## Deliverables

### 108.1 — `lib/viepilot-persona.cjs`
- `inferPersona(dir)`: detects domain from 6 domain signal rules (package.json/CMakeLists.txt/requirements.txt/pubspec.yaml/Dockerfile+terraform/pyproject.toml+langchain), stacks from deps, `team_size` from `git shortlog`, `role` from file extensions; returns JSON with `confidence`; auto-merges when 2+ domain signals ≥ 0.35
- `resolvePersona(dir)`: 3-layer resolution (project-override > context-map > global active), falls back to infer
- `mergePersonas(a, b)`: union stacks, topic_priority; hybrid name/domain/phase-template
- `generatePersonaContext(persona)`: markdown `## User Persona` string
- `autoSwitch(dir)`: resolves or infers, sets active, updates context-map, silent
- All operations silent on error; zero npm deps

### 108.2 — `bin/vp-tools.cjs` persona subcommand
- `persona get/infer/list/set/auto-switch/context` subcommand
- `updateContextMap()` auto-populates `~/.viepilot/context-map.json` on detect
- `persona auto-switch` always exits 0, non-blocking

### 108.3 — Domain Packs + brainstorm.md injection
- 5 JSON domain packs: `lib/domain-packs/{web-saas,data-science,mobile,devops,ai-product}.json`
- Each pack: `topic_priority`, `extra_topics` (with Q&A questions), `phase_template.phases`, `architect_pages`, `stacks_hint`
- `workflows/brainstorm.md`: Step 0B Persona Domain Pack Integration (auto-switch + inject extra_topics + reorder by topic_priority + hide topic_skip + suggest phase template)
- `bin/viepilot.cjs`: `install-domain <pack-name>` → npm install + copy `domain-pack.json`

### 108.4 — Skill + Workflow injections
- `skills/vp-persona/SKILL.md`: new skill with full metadata blocks, pending-review check, show/refine/list/bind/merge/export/import/reset
- `<persona_context>` block injected in all 19 vp-* SKILL.md files (18 existing + vp-persona)
- `workflows/autonomous.md`: Persona Context step after language config
- `workflows/crystallize.md`: Step 0C output_style adaptation (lean/balanced/enterprise)
- `workflows/evolve.md`: Phase Template Suggestion reads domain pack

### 108.5 — `lib/viepilot-calibrate.cjs` + Tests + CHANGELOG + Version
- `writeSessionTrace(data)`: fire-and-forget async write to `~/.viepilot/traces/{session-id}.json`
- `detectPatterns(traces)`: topic skip_rate ≥ 0.70 → green; stack ≥ 0.80 freq → green; avg duration > 60min → yellow; `guardrail_journal` blocks re-proposals
- `runCalibration()`: reads traces → detects patterns → 🟢 auto-apply silently + 🟡 auto-apply + pending-review.md + 🔴 return blocked
- `applyOverlay()`: JSON Patch RFC 6902 overlays in `~/.viepilot/overlays/{persona}/`
- 35 unit tests in `tests/unit/phase108-enh073-vp-persona.test.js` (all pass)
- Full suite: **1618 tests pass** (0 failures)
- CHANGELOG [2.42.0] entry
- `package.json`: 2.41.0 → 2.42.0

## Verification
```
node -e "const p=require('./lib/viepilot-persona.cjs'); p.inferPersona(process.cwd()).then(r=>console.log(r.domain, r.confidence))"
# → web-saas 0.4

node bin/vp-tools.cjs persona infer .
# → JSON with domain, confidence, source: "auto"

node bin/vp-tools.cjs persona auto-switch; echo $?
# → 0

ls lib/domain-packs/ | wc -l
# → 5

grep -l "persona_context" skills/vp-*/SKILL.md | wc -l
# → 19

node -e "const c=require('./lib/viepilot-calibrate.cjs'); console.log(typeof c.runCalibration)"
# → function

npm test 2>&1 | tail -3
# → 1618 tests pass
```
