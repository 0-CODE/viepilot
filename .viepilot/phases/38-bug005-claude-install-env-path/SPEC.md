# Phase 38: Fix BUG-005 — Claude Code install path drift

## Goal
Khi install cho `claude-code` target, mirror `workflows/`, `bin/`, `templates/`, `lib/` vào `~/.claude/viepilot/` và rewrite `execution_context` paths trong mirrored skill files (`~/.cursor/viepilot` → `~/.claude/viepilot`). Cursor targets không bị ảnh hưởng.

## Request
BUG-005

## Affected Files
- `lib/viepilot-install.cjs` — `buildInstallPlan()`, `applyInstallPlan()`, `formatPlanLines()`, `describePlan()`
- `tests/unit/` — install plan tests for claude-code target

## Tasks

| Task | Description | Complexity |
|------|-------------|------------|
| 38.1 | `buildInstallPlan`: add `claudeViepilotDir` + mkdir/copy steps khi claude-code target | M |
| 38.2 | New step kind `rewrite_paths_in_dir` + handler trong `applyInstallPlan` + update dry-run output | M |
| 38.3 | Jest tests: verify claude-code plan có đủ mkdir/copy/rewrite steps + paths object đúng | M |

## Dependencies
- Phase 37 ✅

## Verification
```bash
# Dry run claude-code install
node bin/vp-tools.cjs install --target claude-code --dry-run

# Verify ~/.claude/viepilot/ would be created
# Verify rewrite step present for skill path replacement

npm test
```

## Version Bump
PATCH (1.9.7 → 1.9.8) — bug fix, no new feature
