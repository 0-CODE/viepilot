# Phase 14 Summary — ENH-011

## Outcome

- **Release**: `0.8.1` (patch after M1.10 / `0.8.0`)
- **Scope**: ROOT documentation alignment and drift reduction per `.viepilot/requests/ENH-011.md`

## Delivered

- `README.md` — framework badge **0.8.1**; versioning note (TRACKER/CHANGELOG vs npm)
- `workflows/audit.md` — audit plan copy matches **4 tiers**
- `CHANGELOG.md` — versioned sections through **0.8.1**; clean `[Unreleased]`
- `docs/dev/cli-reference.md` — `version` examples use current framework line
- `.viepilot/*` — TRACKER, HANDOFF, ROADMAP (M1.11), request ENH-011 closed; audit report refreshed

## Verification

- Grep: no stray **framework** `0.3.0` in README/user docs (Jest `30.3.0` / historical CHANGELOG kept)
