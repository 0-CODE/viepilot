# Task 12.1: Integration test — BUG-007 working directory guard

## Meta
- **Phase**: 12-verification-release
- **Status**: done
- **Complexity**: S
- **Dependencies**: Phase 7 (Working Directory Guard in `workflows/autonomous.md`)

## Objective

Add automated coverage so BUG-007 behavior cannot regress: write targets must stay under project cwd; ViePilot install paths under `~/.claude/viepilot` and `~/.cursor/viepilot` are never valid edit targets (control point / hard stop semantics).

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract filled; Paths + File-Level Plan below are concrete
- [x] PHASE-STATE.md marks 12.1 `in_progress` before first implementation commit

## Paths

```yaml
files_to_create:
  - "lib/project-write-guard.cjs"
  - "tests/integration/bug007-working-directory-guard.test.js"
files_to_modify:
  - "CHANGELOG.md"
```

## File-Level Plan

- **`lib/project-write-guard.cjs`**: Small pure helper `validateWriteTarget(projectRoot, candidatePath, { homedir })` implementing the same rules as the autonomous Working Directory Guard: paths inside resolved project root → OK; paths under install roots → `install_path`; other paths outside project → `outside_project`. Uses `path.resolve` + `path.relative` (no file must exist).
- **`tests/integration/bug007-working-directory-guard.test.js`**: Jest cases — relative path under temp project → pass; absolute path under fake homedir’s `.cursor/viepilot` → `install_path`; path under `.claude/viepilot` → `install_path`; `/tmp/...` outside project → `outside_project`; contract greps on `workflows/autonomous.md` and `templates/project/AI-GUIDE.md` for BUG-007 guard strings.
- **`CHANGELOG.md`**: Note under `[Unreleased]` → Added integration coverage for BUG-007 write-target validation.

## Context Required

```yaml
read:
  - ".viepilot/requests/BUG-007.md"
  - "workflows/autonomous.md"
  - "tests/integration/workflow.test.js"
```

## Verification

```bash
npm test -- tests/integration/bug007-working-directory-guard.test.js
npm test
```

Expected: all tests PASS.

## Implementation Notes

- Homedir injectable via options for hermetic tests (no dependency on developer machine having install dirs).
