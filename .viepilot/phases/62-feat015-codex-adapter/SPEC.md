# Phase 62 — SPEC: Codex CLI adapter (FEAT-015)

## Goal
Add `codex` as a first-class ViePilot adapter for the OpenAI Codex CLI (`~/.codex/`). SKILL.md format is natively compatible — the only notable difference is that Codex users invoke skills with `$vp-*` syntax (not `/vp-*`). Document this clearly.

Also fix a stale reference in `docs/user/features/adapters.md` that still mentions the deleted `dev-install.sh`.

## Version target
**2.4.0** (MINOR — new adapter)

## Dependencies
- Phase 61 ✅ (ENH-037 — postInstallHint on adapters)
- Phase 60 ✅ (ENH-036 — shell installer cleanup)

---

## Tasks

### Task 62.1 — `lib/adapters/codex.cjs` (new adapter)
**Objective:** New adapter file following the ENH-035 clean shape. Note: `postInstallHint` uses `$vp-status` (Codex invocation syntax).

**Paths:**
- `lib/adapters/codex.cjs`

**File-Level Plan:**
```js
'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'codex',
  name: 'Codex',
  skillsDir:   (home) => path.join(home, '.codex', 'skills'),
  viepilotDir: (home) => path.join(home, '.codex', 'viepilot'),
  executionContextBase: '.codex/viepilot',
  // NOTE: Codex uses $skill-name syntax (not /skill-name like other adapters)
  postInstallHint: 'Open project and type $vp-status to get started',
  hooks: {
    configFile: null,       // Codex uses AGENTS.md convention, not programmatic hooks
    schema: 'codex',
    supportedEvents: []
  },
  installSubdirs: [
    'workflows',
    path.join('templates', 'project'),
    path.join('templates', 'phase'),
    path.join('templates', 'architect'),
    'bin',
    'lib',
    'ui-components'
  ],
  isAvailable: (home) => {
    const h = home || os.homedir();
    return fs.existsSync(path.join(h, '.codex'));
  }
};
```

**Verification:** `node -e "const a=require('./lib/adapters/codex.cjs'); console.log(a.id, a.postInstallHint)"` prints `codex Open project and type $vp-status to get started`.

---

### Task 62.2 — Register adapter + CLI update
**Objective:** Register `codex` in the adapter map and add it to the interactive installer target list.

**Paths:**
- `lib/adapters/index.cjs`
- `bin/viepilot.cjs`

**File-Level Plan:**
- `lib/adapters/index.cjs`: add `'codex': require('./codex.cjs')` to `adapters` map
- `bin/viepilot.cjs` TARGETS array: add `{ id: 'codex', label: adapterMap['codex'].name }` after antigravity entry
- `bin/viepilot.cjs` help text: add `codex` to the `--target` option description

**Verification:**
- `node bin/viepilot.cjs --list-targets` shows `codex`
- `node bin/viepilot.cjs install --target codex --yes --dry-run` outputs "Codex:" in Next actions

---

### Task 62.3 — Tests
**Objective:** Contract tests for the codex adapter; update existing tests for new adapter count.

**Paths:**
- `tests/unit/vp-adapter-codex.test.js` (new)
- `tests/unit/viepilot-adapters.test.js` (edit)
- `tests/unit/guided-installer.test.js` (edit)

**File-Level Plan:**

`tests/unit/vp-adapter-codex.test.js` — 10 tests across 3 groups:
- Group 1 — Shape (6 tests): required fields, skillsDir contains `.codex`, viepilotDir contains `.codex/viepilot`, executionContextBase, no pathRewrite, postInstallHint contains `$vp-status`
- Group 2 — Registry (2 tests): `getAdapter('codex')` resolves; `listAdapters()` returns 4
- Group 3 — Install plan (2 tests): `installTargets:['codex']` → paths contain `.codex`; `rewrite_paths_in_dir` step has `from: '{envToolDir}'`, `to: '.codex/viepilot'`

`tests/unit/viepilot-adapters.test.js`:
- Update `listAdapters()` count assertion: `expect(list.length).toBe(4)` (was 3)
- Update comment: "4 unique adapters: claude-code, cursor, antigravity, codex"

`tests/unit/guided-installer.test.js`:
- Update `normalizeTargets('all')` expected array: add `'codex'` → `['claude-code', 'cursor-agent', 'cursor-ide', 'antigravity', 'codex']`

**Verification:** `npm test` passes; test count 596 → ~606.

---

### Task 62.4 — `docs/user/features/adapters.md` update
**Objective:** Add Codex to platform table, document `$skill-name` invocation syntax, remove stale `dev-install.sh` reference, update path resolution table.

**Paths:**
- `docs/user/features/adapters.md`

**File-Level Plan:**
1. Add row to platform table:
   ```
   | `codex` | OpenAI Codex CLI | `~/.codex/skills/` | `~/.codex/viepilot/` | — |
   ```
2. Add install example: `viepilot install --target codex`
3. Add note under the install examples: Codex users invoke skills with `$vp-status` (not `/vp-status`) — Codex reserves `/command` for built-in controls
4. Add `codex` → `.codex/viepilot` to the path resolution table
5. Remove the "Using the dev installer" section (references deleted `dev-install.sh`)

**Verification:** `grep -n "dev-install" docs/user/features/adapters.md` returns 0 matches.

---

## Phase Verification
```bash
node bin/viepilot.cjs install --target codex --yes --dry-run
# output: "- Codex: Open project and type $vp-status to get started"

node bin/viepilot.cjs --list-targets
# output includes: codex

npm test
# 33 suites, ~606 tests, all pass
```
