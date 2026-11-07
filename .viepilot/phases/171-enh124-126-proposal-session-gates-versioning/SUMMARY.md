# Phase 171 Summary — ENH-124 + ENH-126 (v3.19.0)

## Delivered
- `lib/proposal-store.cjs`: folder per proposal, immutable `versions/v{n}-{date}/`, `versionPaths`, `provenance.json` (ViePilot version, gates, sha256 of every file), `detectHandEdits`, `detectExisting` (versioned + legacy flat files; word-based, diacritic-insensitive topic matching).
- `lib/proposal-session.cjs`: `session.json` (steps, decisions with source, gates, pending gate, schemaVersion + migration, atomic writes, `activeSessions`).
- `vp-tools proposal status|resume|migrate|diff|prune` — works in any project; migrate is side-effect-free in dry-run, non-destructive, never repeated.
- `lib/proposal-gates.cjs`: 23-step registry with since/changedIn, `upgradePlan`, `lintWorkflowGates`.
- `lib/hooks/proposal-context-hook.cjs` + `vp-tools hooks install --proposal-context` (UserPromptSubmit, SessionStart startup|resume|compact).
- workflows/proposal.md 0.3.0: gate on every step (lint 0), Step 1b detect existing (Upgrade/Revise/New/Keep, hand edits, legacy), Step 11 Iterate, `--resume`, versioned outputs; SKILL 0.5.0 with the re-entry rule.

## Orchestrator review catches
- 171.1: provenance always recorded `viepilotVersion: "unknown"` (read the user project's parent package.json); topic matching only matched whole slug substrings and stripped Vietnamese letters.
- 171.2: proposal commands required `.viepilot/`; `migrate --dry-run` created a version folder, so the real run produced `v2` and pruning then deleted a version; migrated files kept legacy names and were not hashed; session schema migration was never written back (in-place mutation compared to itself); `scriptDocx` path was `-script-docx.md`.
- 171.3–171.5 implemented inline by the orchestrator (executors repeatedly hit the turn limit on the 1300-line workflow).

## Verification
- Full suite 3009 passed + 1 skipped; `lintWorkflowGates(workflows/proposal.md)` → []; `todo check --phase 171 --phase-complete` → OK.

## Known gaps
- Importing edited .pptx/.docx text back into the manifest is specified but needs the document skills (Phase 172).
- No end-to-end run of /vp-proposal against a real project yet; behaviour is verified at library/CLI/workflow-lint level.
