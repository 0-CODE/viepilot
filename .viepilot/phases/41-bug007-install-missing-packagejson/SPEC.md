# Phase 41 — BUG-007: install script missing package.json for claude-code target

## Goal
Fix `buildInstallPlan()` trong `lib/viepilot-install.cjs` để copy `package.json` vào
`~/.claude/viepilot/package.json` khi install target là `claude-code`.

## Background
`vp-tools info` gọi `resolveViepilotPackageRoot(path.join(__dirname, '..'))`.
Hàm này walk upward từ `~/.claude/viepilot/` tìm `package.json` có `name === "viepilot"`.
Install script (BUG-005/BUG-006) đã copy `bin/`, `lib/`, `workflows/`, `templates/` nhưng
**bỏ qua `package.json`** → root lookup thất bại → crash khi CWD ≠ viepilot source repo.

Workaround đã áp dụng thủ công: `cp package.json ~/.claude/viepilot/package.json`.

## Tasks

### Task 41.1 — `buildInstallPlan`: thêm copy_file step cho package.json
**File**: `lib/viepilot-install.cjs`

**Change**: Trong claude-code block (sau vòng lặp copy các lib files), thêm:
```js
steps.push({
  kind: 'copy_file',
  from: path.join(root, 'package.json'),
  to: path.join(claudeViepilotDir, 'package.json'),
});
```

**Acceptance**:
- Plan có step `{ kind: 'copy_file', from: '…/package.json', to: '…/.claude/viepilot/package.json' }`
- Cursor targets KHÔNG có step tương tự (chỉ claude-code target)

### Task 41.2 — Jest tests
**File**: `tests/viepilot-install.test.cjs` (existing file, thêm test cases)

**Tests cần thêm**:
1. `claude-code plan includes package.json copy_file step` — verify `kind: 'copy_file'`, `from` ends with `package.json`, `to` includes `.claude/viepilot/package.json`
2. `cursor plan does NOT include package.json copy to .claude` — negative check

**Acceptance**: `npm test` pass, count ≥ 319 (actual baseline was 317, not 318)

## Verification Commands
```bash
# Manual check — should print "copy_file"
node -e "
const {buildInstallPlan} = require('./lib/viepilot-install.cjs');
const p = buildInstallPlan('.', process.env, { installTargets: ['claude-code'], overrideHomedir: '/tmp/h' });
const step = p.steps.find(s => s.from && s.from.endsWith('package.json') && s.to && s.to.includes('.claude'));
console.log(step ? step.kind : 'NOT FOUND');
"

# Tests
npm test
```

## Files Changed
- `lib/viepilot-install.cjs` — +1 `copy_file` step in claude-code block
- `tests/viepilot-install.test.cjs` — +2 test cases

## Version
PATCH bump: **1.9.10 → 1.9.11**
