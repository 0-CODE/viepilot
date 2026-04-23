# Task 101.2 — Fix SKILL.md references + tests + CHANGELOG + version 2.36.1

## Objective
After `scan-skills` is wired in (Task 101.1), verify SKILL.md references are accurate, write a test file, update CHANGELOG, and bump to 2.36.1.

## Paths
- `skills/vp-brainstorm/SKILL.md`
- `skills/vp-crystallize/SKILL.md`
- `tests/unit/phase101-bug019-scan-skills.test.js`
- `CHANGELOG.md`
- `package.json`

## File-Level Plan

### skills/vp-brainstorm/SKILL.md
Verify line ~168: `vp-tools scan-skills` reference is already correct — no change needed if accurate.

### skills/vp-crystallize/SKILL.md
Verify line ~349: `Registry: \`vp-tools scan-skills\`` is already correct — no change needed if accurate.

### tests/unit/phase101-bug019-scan-skills.test.js
Create test file with ≥8 tests covering:
1. `vp-tools scan-skills` exits with code 0
2. stdout contains "✔ Scanned"
3. stdout contains "skill-registry.json"
4. `vp-tools help scan-skills` exits 0
5. help output contains "scan-skills"
6. help output contains "skill-registry.json"
7. Usage summary (`vp-tools help`) contains "scan-skills"
8. vp-brainstorm SKILL.md still references `vp-tools scan-skills`
9. vp-crystallize SKILL.md still references `vp-tools scan-skills`

### CHANGELOG.md
Add `[2.36.1]` section before `[2.36.0]`:
```markdown
## [2.36.1] - 2026-04-22
### Fixed
- **BUG-019** — `vp-tools scan-skills` CLI subcommand now implemented; previously threw "Unknown command: scan-skills" even though `lib/skill-registry.cjs` already had `scanSkills()`. Wired CLI handler, help entry, and usage summary line.
```

### package.json
`"version": "2.36.0"` → `"version": "2.36.1"`

## Acceptance Criteria
- [ ] `npm test` all pass
- [ ] `package.json` version = "2.36.1"
- [ ] CHANGELOG has [2.36.1] BUG-019 entry
- [ ] test file has ≥8 tests, all green
