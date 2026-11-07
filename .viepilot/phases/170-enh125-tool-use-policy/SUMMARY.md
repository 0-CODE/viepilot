# Phase 170 Summary — ENH-125 (v3.18.0)

## Delivered
- `templates/tool-policy.md` + `lib/tool-policy.cjs`: one policy source, adapter mapping (Claude Code, Cursor, Codex, Copilot, Antigravity), `renderPolicyBlock`, `renderCombinedPolicyBlock`, `classifyBashCommand`.
- `vp-tools policy render|sync [--check]` (`lib/policy-sync.cjs`): compact 25-line `<tool_policy>` block in 22 SKILL.md files, policy in 20 agent files (read-only agents: commands-only note), reference line in 14 workflows; idempotent, exact-match drift check.
- `{DISPATCH_RULES}` appended to every subagent prompt template in `workflows/autonomous.md`; `workflows/proposal.md` now keeps the run's task list in the todo tool.
- PreToolUse hook `lib/hooks/tool-policy-hook.cjs` (warn | block | off) + `lib/hooks-installer.cjs`; `vp-tools hooks install --policy … [--dry-run] [--yes]`, consent-gated.
- Lint tests: policy presence, no shell file-edit instructions, todo/delegation instructions in multi-step workflows.

## Orchestrator review catches
- 170.1: classifier missed unquoted `sed -n 1,20p file` and `grep -rn foo lib` → rewritten on leading commands (pipe filters allowed).
- 170.2: sync `--check` was never satisfied (heading mismatch) and each SKILL.md got ~171 lines (5 adapter blocks) → exact-match check + one combined 25-line table; labels clarified (TodoWrite or TaskCreate…, Task (Agent tool), "none callable — work inline").
- 170.3: PreToolUse `matcher` was written as an object — Claude Code expects the string `"Bash"`; the hook would never have fired.
- Phase 150 timing test de-flaked (failed only under full-suite load; startup unchanged at ~0.1–0.3 s).

## Verification
- Full suite 2931 passed + 1 skipped; `vp-tools policy sync --check` → OK; `todo check --phase 170 --phase-complete` → OK.

## Known gaps
- The hook is opt-in; nothing is installed into the user's settings automatically.
- vp-quality-gate does not scan executor transcripts for violations; DISPATCH_RULES asks executors to report deviations.
- Executors in this phase still ran under the session's Bash-preferring host instruction; the policy states that host instructions win and must be reported.
