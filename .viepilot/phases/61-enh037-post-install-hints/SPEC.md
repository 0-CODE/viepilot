# Phase 61 — SPEC: Adapter-driven post-install hints (ENH-037)

## Goal
Replace the hardcoded "Next actions" block in `bin/viepilot.cjs` (lines 340-343) with a loop over the actually-installed targets. Each adapter object gains a `postInstallHint` string field; the CLI iterates and prints one line per unique installed adapter.

## Version target
**2.3.2** (PATCH — output wording only, no behaviour change)

## Dependencies
- Phase 60 ✅ (ENH-036 — shell installer cleanup)

---

## Tasks

### Task 61.1 — Add `postInstallHint` to each adapter
**Objective:** Each adapter carries its own post-install instruction string.

**Paths:**
- `lib/adapters/claude-code.cjs`
- `lib/adapters/cursor.cjs`
- `lib/adapters/antigravity.cjs`

**File-Level Plan:**
- `lib/adapters/claude-code.cjs`: add field after `executionContextBase`:
  ```js
  postInstallHint: 'Restart session so ~/.claude/skills/vp-* is picked up; then /vp-status',
  ```
- `lib/adapters/cursor.cjs`: add field:
  ```js
  postInstallHint: 'Open project and run /vp-status',
  ```
- `lib/adapters/antigravity.cjs`: add field:
  ```js
  postInstallHint: 'Open project and run /vp-status',
  ```

**Verification:** `node -e "const a=require('./lib/adapters/antigravity.cjs'); console.log(a.postInstallHint)"` prints hint.

---

### Task 61.2 — Update `bin/viepilot.cjs` post-install block
**Objective:** Replace 3 hardcoded lines with adapter-driven output; deduplicate cursor-agent/cursor-ide.

**Paths:**
- `bin/viepilot.cjs`

**File-Level Plan:**
Replace lines 340-343:
```js
console.log('\nNext actions:');
console.log('- Cursor: open project and run /vp-status');
console.log('- Claude Code: restart session if needed so ~/.claude/skills/vp-* is picked up; then /vp-status');
console.log('- If needed, run /vp-brainstorm then /vp-crystallize');
```
With:
```js
console.log('\nNext actions:');
const seenAdapters = new Set();
for (const target of selectedTargets) {
  const a = adapterMap[target] || getAdapter(target);
  if (a && !seenAdapters.has(a.id)) {
    seenAdapters.add(a.id);
    console.log(`- ${a.name}: ${a.postInstallHint || 'run /vp-status'}`);
  }
}
console.log('- If needed, run /vp-brainstorm then /vp-crystallize');
```

**Verification:** `node bin/viepilot.cjs install --target antigravity --yes --dry-run` output contains "Antigravity:".

---

### Task 61.3 — Tests
**Objective:** Contract tests asserting adapter shape includes `postInstallHint`, and CLI output contains adapter name after install.

**Paths:**
- `tests/unit/viepilot-adapters.test.js`
- `tests/unit/vp-adapter-antigravity.test.js`
- `tests/unit/guided-installer.test.js`

**File-Level Plan:**
- `viepilot-adapters.test.js` Group 1 (adapter shape): add `expect(typeof a.postInstallHint).toBe('string')` for both claude-code and cursor adapter shape tests
- `vp-adapter-antigravity.test.js` Group 1: add `expect(typeof a.postInstallHint).toBe('string')` to antigravity shape test
- `guided-installer.test.js`: add test — dry-run for `--target antigravity` output contains "Antigravity:"

**Verification:** `npm test` passes; test count increases by 3.

---

## Phase Verification
```bash
node bin/viepilot.cjs install --target antigravity --yes --dry-run
# output must contain: "- Antigravity: Open project and run /vp-status"

node bin/viepilot.cjs install --target all --yes --dry-run
# output must contain all 3 adapter names: Claude Code, Cursor, Antigravity

npm test
```
