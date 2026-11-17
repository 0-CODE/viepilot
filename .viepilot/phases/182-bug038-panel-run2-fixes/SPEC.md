# Phase 182 Spec — BUG-038: panel run 2 fixes

## Goal
Fix the 7 defects from the v3 live panel: presenter answer flags and ids, word-count discipline, presenter repetition,
proof that a panelist read its round prompt, provenance/run hygiene, and the wrong card margin order in the workflow.

## Requests
`.viepilot/requests/BUG-038.md`

## Design decisions
- Backward compatible: old transcripts (no ids / partial / tokens) still validate; checks only apply when the new
  fields were issued.
- One word-count rule shared by prompts and `validateMessage` (`countWords`); one rewrite round before flagging.
- Read token is a per-round, per-persona nonce echoed in every message.
- Sealed deliverables stay immutable: provenance refresh reports changes there, only `simulation/` is re-hashed.

## Constraints
- English only in workflows/, skills/, templates/ (enh031 test).
- Tests resilient; temp dirs; never touch docs/proposals/ trial output or ~/.claude.
- ENH-125 tool policy; executors may not be able to commit (orchestrator commits after verifying).

## Target Version
3.25.1 (PATCH — bug fixes)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 182.1 | Presenter answers: noAnswer+cites contradiction, partial state, answer ids | M |
| 182.2 | Word-count rule + one rewrite round; presenter anti-repetition; round-prompt read token | M |
| 182.3 | Provenance refresh prunes and re-hashes; writeRun duplicate guard | S |
| 182.4 | Card margin order in the workflow; release 3.25.1 | S |
