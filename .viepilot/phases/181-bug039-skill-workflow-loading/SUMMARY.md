# Phase 181 Summary — BUG-039 (v3.25.0)

## Outcome
Skills load their workflow deterministically. The installer copies each skill's workflow into `<skill>/references/` and replaces the unexpanded `@$HOME` include with a Step 0 Read of the resolved path. Hard gates are now written into SKILL.md itself, and the installed banners show the real version.

## Tasks
| Task | Result | Commit |
|------|--------|--------|
| 181.1 | install-time render (fix A) | fe7c655 |
| 181.2 | inline hard gates + banner version (fix C) | 283a42a, e0ad4a9 |
| 181.3 | PHASE-STATE template `## Tasks` + legacy parser (R1) | e2db4cf |
| 181.4 | crystallize subagents return text; `vp-tools stack-cache write` (R2) | ed622e9 |
| 181.5 | executor 60 turns, report-before-budget, missing report = PARTIAL, split rule; release (R3) | adec459 |

## Verification
- Full suite: 3346 passed, 2 skipped (exit 0); `policy sync --check` OK; `verify:release` OK
- Reinstalled into ~/.claude: 14 workflow refs in 22 skills; 0 skills with `@$HOME`; vp-auto banner `fw 3.25.0`; executor maxTurns 60

## Notes
- 181.1 was implemented inline by the orchestrator, against ENH-096; 181.2–181.5 went to vp-task-executor.
- R3 reproduced live: the 181.4 and 181.5 executors hit the old 30-turn cap (the installed agent was still 3.24.0). Both were resumed, and the new rule (missing report = PARTIAL → resume) was applied by hand.
- The session's safety check refused `git commit` for the 181.4 executor. With the user's approval, the orchestrator checked the staged work and committed it.
- Commit 283a42a has its trailers on the subject line (not amended).
