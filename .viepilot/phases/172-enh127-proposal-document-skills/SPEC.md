# Phase 172 Spec — ENH-127: vp-proposal uses Claude Code document skills (pptx, docx, xlsx, pdf)

## Goal
On Claude Code, vp-proposal creates, validates, renders, reads and edits its files through the host document skills, adds a mandatory deck QA gate, builds budget workbooks with live formulas, and labels every check that could not run.

## Requests
`.viepilot/requests/ENH-127.md`

## Design decisions
- Scoped exception to the BUG-004 namespace guard for vp-proposal only (explicit user opt-in).
- ViePilot stays the source of truth (manifest, script, animation, validators, gates); the document skills are the execution and QA layer — both must pass.
- Missing skill or dependency → AskUserQuestion (enable/install or fallback with consent); never a silent pass.

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).

## Target Version
3.20.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 172.1 | Environment detection: document skills + dependencies | M |
| 172.2 | Workflow: pptx/docx skills in generation + Deck QA gate | L |
| 172.3 | Budget workbooks (xlsx) + pdf use | M |
| 172.4 | Import hand edits via the document skills | M |
| 172.5 | Tests + CHANGELOG 3.20.0 + resolve ENH-127 | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 172 --phase-complete` → exit 0
- [ ] version = 3.20.0
