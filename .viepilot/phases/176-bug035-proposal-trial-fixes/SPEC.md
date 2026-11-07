# Phase 176 Spec — BUG-035: vp-proposal trial fixes + AskUserQuestion for every question

## Goal
Fix the defects found in the first real /vp-proposal run (audience selection, session/store consistency, hints, source classifier, timing, curation/backstage, animation/packaging, misc) and make every question to the user go through AskUserQuestion on Claude Code — including the end-of-run next step. Ship the already-committed G0 parser fix (d6132ad) in the same release.

## Requests
`.viepilot/requests/BUG-035.md`

## Design decisions
- Patch release 3.22.2 — no new user-facing features beyond the AUQ rule block and an opt-in Stop hook.
- Gate records become `gates[step] = { input, output }`; session schemaVersion bump with migration of the old flat shape.
- Versions stay immutable once sealed at Confirm Output; before sealing, drafts in the version folder may be rewritten by the run (`sealed: false` in provenance/session).
- AUQ rule lives next to the tool policy (`templates/auq-policy.md`, synced into every SKILL.md between markers, `--check` in the lint) so it cannot drift per skill.
- The Stop hook is opt-in (`vp-tools hooks install --auq-check`), warn-only, consent-gated, tested with a temp HOME.

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).
- Every new behaviour gets a regression test named after the BUG-035 group (e.g. `phase176-g1-...`).
- Keep existing session/store files readable: any schema change ships with a migration and a test on an old fixture.

## Target Version
3.22.2 (PATCH)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 176.1 | G1 audience selection: hall, council, role map, manifest profile | M |
| 176.2 | G2 session/store consistency | L |
| 176.3 | G3 + G4 purpose hints and source classifier | M |
| 176.4 | G5 script timing with fixed segments; header and Q&A fallback | M |
| 176.5 | G6 curation, backstage, cross-file consistency, placeholder gate | M |
| 176.6 | G7 animation and packaging | M |
| 176.7 | G8 AskUserQuestion for every question (all vp-* skills + Stop hook) | M |
| 176.8 | G9 misc + tests + CHANGELOG 3.22.2 + resolve BUG-035 | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 176 --phase-complete` → exit 0
- [ ] version = 3.22.2
