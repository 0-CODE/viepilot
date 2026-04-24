# Task 108.5 — `lib/viepilot-calibrate.cjs` + traces + Reflexion + overlays + pending-review + tests + CHANGELOG

## Objective
Implement always-on adaptive calibration. Session traces are written async after each session.
After every session, `runCalibration()` reads traces → detects patterns via Reflexion memory →
auto-applies 🟢 changes silently → auto-applies 🟡 changes + logs to pending-review.md →
blocks for 🔴 changes (max 1 prompt per session). Write tests (≥18 total for phase),
CHANGELOG [2.42.0], version bump.

## Paths
```
lib/viepilot-calibrate.cjs            ← new
tests/unit/phase108-enh073-vp-persona.test.js  ← new
CHANGELOG.md                          ← prepend [2.42.0] section
package.json                          ← version 2.41.0 → 2.42.0
```

## File-Level Plan

### `lib/viepilot-calibrate.cjs`

**Exports:**
```js
module.exports = {
  writeSessionTrace,    // (traceData) → void (async, fire-and-forget)
  runCalibration,       // (opts) → { applied, pending, blocked } (async)
  readTraces,           // (n) → last N trace objects
  detectPatterns,       // (traces) → proposals[]
  applyOverlay,         // (personaName, patch) → void
  readOverlays,         // (personaName) → patches[]
  appendPendingReview,  // (entry) → void
};
```

**`writeSessionTrace(traceData)`:**
- Async write to `~/.viepilot/traces/{session-id}.json`
- `session-id`: `{skill}-{YYYY-MM-DD}-{random4}` (e.g. `vp-brainstorm-2026-04-24-a3f2`)
- traceData shape: `{ skill, persona, topics_offered, topics_discussed, topics_skipped, stacks_mentioned, duration_min }`
- Fire-and-forget — no await in caller, no error propagation

**`readTraces(n = 20)`:**
- Read all `~/.viepilot/traces/*.json`, sort by `inferred_at` desc, return last N
- Filter by active persona name if `opts.persona` provided
- Silent on error → return []

**`detectPatterns(traces)`:**
Returns array of proposals `{ id, type, risk, description, patch }`:
- `type: 'topic_skip'`: topic skip_rate ≥ 0.70 across ≥3 sessions → `{ risk: 'green', patch: { op: 'add_topic_skip', topic_id } }`
- `type: 'stack_add'`: stack mentioned in ≥ 0.80 of sessions → `{ risk: 'green', patch: { op: 'add_stack', stack } }`
- `type: 'phase_default'`: phase added manually in ≥ 0.70 of sessions → `{ risk: 'yellow', patch: { op: 'set_phase_default', phase } }`
- `type: 'output_style'`: avg session duration > 60min → suggest `balanced` → `{ risk: 'yellow', patch: { op: 'set_output_style', value: 'balanced' } }`
- `type: 'overlay_logic'`: branching pattern detected → `{ risk: 'red', patch: { op: 'restructure_step', ... } }`
- Check `guardrail_journal` in `persona-reflections.json` — skip any proposal with matching `id`

**`runCalibration(opts = {})`:**
1. `readTraces(20)`
2. `detectPatterns(traces)` → proposals
3. Separate by risk: green[], yellow[], red[]
4. Apply green: update persona JSON + write overlay + silent log entry in `persona-reflections.json`
5. Apply yellow: update persona JSON + write overlay + `appendPendingReview(entry)` — non-blocking
6. For red: return in `blocked[]` — caller (skill) decides whether to prompt (max 1 per session)
7. Record all applied proposals in `persona-reflections.json` (prevents re-detection)
8. Return `{ applied: [...green, ...yellow], pending: [], blocked: red }`

**`applyOverlay(personaName, patch)`:**
- Write/append to `~/.viepilot/overlays/{personaName}/brainstorm.patch.json`
- JSON Patch RFC 6902 format: `{ op, step_id, reason, value? }`
- Reads existing array, pushes new patch, writes back

**`appendPendingReview(entry)`:**
- Append to `~/.viepilot/pending-review.md`:
  ```
  - [{date}] 🟡 {description} (persona: {personaName}) — run /vp-persona to review
  ```
- Create file if not exists

### `tests/unit/phase108-enh073-vp-persona.test.js`

≥18 tests across these groups:

**Group 1 — inferPersona (6 tests)**
- web-saas detection: dir with `package.json`+`prisma/` → domain `web-saas`, confidence ≥ 0.4
- embedded detection: dir with `CMakeLists.txt`+`sdkconfig` → domain `embedded`
- data-science detection: dir with `requirements.txt`+`notebooks/` → domain `data-science`
- multi-domain: dir with both `package.json`+`CMakeLists.txt` → merged persona, domain array
- unknown dir: no signals → `generic`, confidence 0, no error
- error resilience: non-existent dir → no throw, returns generic persona

**Group 2 — resolvePersona + mergePersonas (4 tests)**
- resolvePersona: project-override.json present → returns override without auto-detect
- resolvePersona: context-map entry exists → returns mapped persona
- resolvePersona: fallback → runs inferPersona, writes to personas dir
- mergePersonas: stacks unioned, topic_priority unioned, name is `merge-a-b`

**Group 3 — generatePersonaContext (2 tests)**
- Returns markdown string with all expected fields
- Handles missing optional fields gracefully

**Group 4 — detectPatterns + calibration (4 tests)**
- topic_skip_rate ≥ 0.70 → green proposal generated
- stack_mentioned ≥ 0.80 → green proposal generated
- guardrail_journal entry blocks re-proposal of same pattern
- runCalibration: green proposals auto-applied, yellow → pending-review appended

**Group 5 — vp-tools persona subcommand (3 tests)**
- `persona infer .` dispatches and returns JSON
- `persona list` shows at least header/empty output
- `persona auto-switch` exits 0, never throws

### `CHANGELOG.md` — prepend [2.42.0] entry

```markdown
## [2.42.0] - 2026-04-24

### Added
- **ENH-073**: vp-persona — fully automated cross-project persona system
  - `lib/viepilot-persona.cjs`: `inferPersona()` auto-detects domain from project files + git (no wizard)
  - `lib/viepilot-calibrate.cjs`: always-on adaptive calibration via Reflexion pattern + JSON Patch overlays
  - 5 built-in domain packs: web-saas, data-science, mobile, devops, ai-product
  - Auto-switch on project directory change; auto-merge for multi-domain projects
  - `team_size` inferred from git shortlog; `output_style` self-learned from calibration traces
  - `vp-tools persona` subcommand: get/infer/list/set/auto-switch/context
  - `<persona_context>` block in all 18 vp-* SKILL.md files
  - Workflow adaptations: brainstorm topic reordering, crystallize output_style, evolve phase templates
  - Phase 5 calibration: 🟢 auto-apply, 🟡 auto-apply + pending-review.md, 🔴 single confirm
  - `skills/vp-persona/SKILL.md`: new skill for persona inspection + correction
```

### `package.json` — version bump
`2.41.0` → `2.42.0`

## Verification
```bash
node -e "const c = require('./lib/viepilot-calibrate.cjs'); console.log(Object.keys(c))"
# → writeSessionTrace, runCalibration, readTraces, detectPatterns, applyOverlay, readOverlays, appendPendingReview

npm test 2>&1 | tail -5
# → all tests pass, 0 failures

grep "\[2.42.0\]" CHANGELOG.md
# → ## [2.42.0] - 2026-04-24

node -e "console.log(require('./package.json').version)"
# → 2.42.0
```
