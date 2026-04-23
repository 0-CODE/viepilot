# Phase 98 Spec — ENH-066: Brainstorm Topic 8 User Data Management Coverage

## Goal
Add "User Data Management" as Topic 8 to the brainstorm Topics Template — covering end-user controls over their own data: profile, preferences, privacy rights (GDPR), activity history, connected accounts, sessions, 2FA, consent. Same pattern as ENH-063 (Admin) and ENH-065 (Content). Renumber Phase assignment to Topic 9.

## Request
- ENH-066: Brainstorm Topic 8 User Data Management Coverage

## Target Version
2.34.0

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 98.1 | brainstorm side — Topic 8 + heuristic + user-data.html + YAML schema | M |
| 98.2 | crystallize side — user_data export + template + SKILL.md docs | S |
| 98.3 | Tests (≥10) + CHANGELOG [2.34.0] + version bump | S |

## Dependencies
- ENH-063 ✅ (Admin & Governance pattern)
- ENH-065 ✅ (Content Management pattern)
- Phase 97 ✅

## Verification
- `grep -c "User Data Management" workflows/brainstorm.md` ≥2
- `grep -c "user-data.html" workflows/brainstorm.md` ≥1
- `grep -c "User Data Management" workflows/crystallize.md` ≥1
- `grep -c "## User Data Management" templates/project/PROJECT-CONTEXT.md` ≥1
- `npm test` all pass
