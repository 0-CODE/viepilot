# Phase 82 Spec — Skill Invocation Greeting Banner (ENH-056)

## Goal
Every `vp-*` skill prints a banner immediately on invocation so users can confirm
which version is running — critical now that Claude Code no longer shows a skill-load indicator.

## Context
- ENH-056 filed 2026-04-18
- Claude Code UI change: skill loading is no longer shown to user
- 17 skills, 0 currently have greeting output

## Version Target
2.18.0 → **2.19.0** (MINOR — new observable behavior added to all skills)

## Affected Files
- `skills/vp-*/SKILL.md` — 17 files (add `<greeting>` block)
- `tests/unit/vp-skill-greeting.test.js` — new contract tests
- `CHANGELOG.md` — [2.19.0] entry
- `package.json` — bump to 2.19.0
- `README.md` — badge update

## Banner Format
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► {SKILL_NAME}  v{SKILL_VER} (fw {FW_VER})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
Example:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-AUTO  v0.2.2 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Tasks
| ID | Title | Complexity |
|----|-------|------------|
| 82.1 | Add `<greeting>` block to all 17 `skills/vp-*/SKILL.md` | M |
| 82.2 | Contract tests + CHANGELOG + version 2.19.0 | S |

## Dependencies
- Phase 81 ✅
