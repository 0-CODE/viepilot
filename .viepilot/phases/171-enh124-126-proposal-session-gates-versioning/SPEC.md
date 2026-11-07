# Phase 171 Spec — ENH-124 + ENH-126: Proposal session continuity, AUQ at every gate, versioning and upgrade

## Goal
vp-proposal keeps durable state per proposal, re-enters the workflow on follow-up messages and after compaction, asks via AskUserQuestion at every input and output gate, never overwrites earlier output, and can upgrade an older proposal by running only the gates added since it was made.

## Requests
`.viepilot/requests/ENH-124.md`, `.viepilot/requests/ENH-126.md`

## Design decisions
- Layout `docs/proposals/{slug}/` with `proposal.json`, `session.json`, immutable `versions/v{n}-{date}/` (artifacts + manifest.json + provenance.json).
- Gate registry in code with the version each gate appeared/changed; upgrade = missing/changed gates only.
- Hooks (UserPromptSubmit + SessionStart/PostCompact) reuse the Phase 170 installer, consent-gated.
- Legacy flat files are migrated non-destructively by `vp-tools proposal migrate`.

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).

## Target Version
3.19.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 171.1 | Proposal store: layout, versions, provenance, hashes | L |
| 171.2 | Session state + vp-tools proposal commands | L |
| 171.3 | Gate registry + upgrade plan | M |
| 171.4 | Context hooks for active proposal sessions | M |
| 171.5 | Workflow: AUQ at every gate, detect/upgrade, iterate, resume | L |
| 171.6 | Tests + CHANGELOG 3.19.0 + resolve ENH-124/126 | M |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 171 --phase-complete` → exit 0
- [ ] version = 3.19.0
