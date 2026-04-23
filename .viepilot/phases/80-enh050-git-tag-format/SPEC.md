# Phase 80: Git Tag Format — Include Branch + Version (ENH-050)

## Goal
Enrich all git tags created by vp-auto to include active branch and package version so tags are fully self-describing:

**Old:** `viepilot-vp-p77-t4`
**New:** `viepilot-main-2.16.0-vp-p77-t4`

## Version Target
`2.16.0` → `2.17.0` (MINOR — new tag format, behavior change)

## Dependencies
- Phase 79 ✅ (ENH-049) — should be complete before this ships

## Affected Files
- `workflows/autonomous.md` — update 3 tag patterns + add BRANCH_SAFE + VERSION resolution block
- `workflows/audit.md` — update 2 regex patterns to match both old and new format
- `workflows/rollback.md` — update tag grep pattern
- `tests/unit/vp-enh050-git-tag-format.test.js` — ≥5 contract tests
- `CHANGELOG.md` — [2.17.0] section
- `package.json` — version 2.17.0

## New Tag Format
```
{projectPrefix}-{BRANCH_SAFE}-{VERSION}-vp-p{phase}-t{task}           # task start
{projectPrefix}-{BRANCH_SAFE}-{VERSION}-vp-p{phase}-t{task}-done      # task done
{projectPrefix}-{BRANCH_SAFE}-{VERSION}-vp-p{phase}-complete          # phase complete
```

### Runtime resolution (add to autonomous.md initialize step)
```bash
BRANCH_SAFE=$(git rev-parse --abbrev-ref HEAD 2>/dev/null | sed 's/[^a-zA-Z0-9._-]/-/g')
VERSION=$(node -e "try{console.log(require('./package.json').version)}catch(e){console.log('0.0.0')}" 2>/dev/null)
TAG_PREFIX="${PROJECT_PREFIX}-${BRANCH_SAFE}-${VERSION}"
# Usage:
# git tag "${TAG_PREFIX}-vp-p${PHASE}-t${TASK}"
# git tag "${TAG_PREFIX}-vp-p${PHASE}-t${TASK}-done"
# git tag "${TAG_PREFIX}-vp-p${PHASE}-complete"
```

## Tasks

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 80.1 | `workflows/autonomous.md` — tag format update | BRANCH_SAFE+VERSION resolution block added; 3 tag patterns updated | S |
| 80.2 | `workflows/audit.md` + `workflows/rollback.md` — regex update | Both old and new format matched; no false negatives | S |
| 80.3 | Contract tests + CHANGELOG + version 2.17.0 | ≥5 tests pass; [2.17.0] CHANGELOG; package.json = "2.17.0" | S |

## Verification
- [ ] `workflows/autonomous.md` has `BRANCH_SAFE` + `VERSION` resolution block
- [ ] All 3 tag pattern strings include `{BRANCH_SAFE}` and `{VERSION}`
- [ ] `workflows/audit.md` regex matches `viepilot-main-2.17.0-vp-p80-complete` AND `viepilot-vp-p60-complete` (legacy)
- [ ] `workflows/rollback.md` grep matches new format
- [ ] ≥5 contract tests pass
- [ ] package.json = "2.17.0"
