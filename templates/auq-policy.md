# Asking the user — AskUserQuestion policy (BUG-035 G8)

Every ViePilot skill follows this rule. It sits next to the tool policy (`templates/tool-policy.md`) and is synced into
every `skills/*/SKILL.md` by `vp-tools policy sync` (checked by `vp-tools policy sync --check`).

## Rule

On Claude Code, **every question to the user goes through AskUserQuestion** — not only the named gates:

- workflow gates (every input and every output, ENH-124);
- clarifications that come up mid-task ("which file did you mean?");
- the closing question of a turn or a run ("Do you want me to log these as a request?", "What next?");
- control points (retry / skip / rollback / stop).

Never end a turn with a question written in prose. If you would type "?" at the end of your message, call
AskUserQuestion instead, with 2–4 concrete options and the recommended one first, marked "(Recommended)".

## Details

- Preload the tool once per session: `ToolSearch` with `select:AskUserQuestion`.
- Put the facts the user needs in the question text or the option descriptions — a summary above the call is fine,
  the question itself is not.
- `--yes` runs auto-accept the recommended option and record it as auto-accepted; they do not ask.
- Subagents never ask the user; they return their result and the orchestrator asks.
- Hosts without AskUserQuestion (Cursor Agent mode, Codex, Copilot, Antigravity): a numbered text list is the fallback.

## Optional check

`vp-tools hooks install --auq-check` (Claude Code, opt-in, consent-gated) adds a Stop hook that warns when the last
assistant message of a turn ends with a question and that turn made no AskUserQuestion call. It only warns; it never
blocks.
