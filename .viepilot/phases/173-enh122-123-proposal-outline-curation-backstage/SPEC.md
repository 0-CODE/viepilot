# Phase 173 Spec — ENH-122 + ENH-123: Outline-first gate, content curation, Backstage Editor

## Goal
After the type is confirmed the AI builds and gets approval for an outline, inventories sources, decides what fits (FIT / TRANSFORM / DROP / SENSITIVE / BACKSTAGE), blocks process logs and dev notes from slides, and an always-on Backstage Editor moves non-material disadvantages to presenter-only notes while material risks are reframed, never hidden.

## Requests
`.viepilot/requests/ENH-122.md`, `.viepilot/requests/ENH-123.md`

## Design decisions
- Outline approval is mandatory (auto with `--yes`, recorded).
- Process-log sources are never copied, only transformed.
- Material risks for decision audiences: only fix or reframe.
- Backstage Editor is persona #31, observer (not counted in 6–8).

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).

## Target Version
3.21.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 173.1 | Outline builder + gate | M |
| 173.2 | Source inventory + Content Map | L |
| 173.3 | detectProcessLeak + detectDevNotes | M |
| 173.4 | Persona #31 Backstage Editor + council blocker + backstage.md | M |
| 173.5 | Workflow: outline, inventory, content map, leak/dev-note gates, backstage plan | L |
| 173.6 | Tests + CHANGELOG 3.21.0 + resolve ENH-122/123 | M |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 173 --phase-complete` → exit 0
- [ ] version = 3.21.0
