# Phase 60 — SPEC: Remove shell installers (ENH-036)

## Goal
Delete `install.sh` and `dev-install.sh`. Both are fully redundant since the Node-based installer (`bin/viepilot.cjs install --target <adapter>`) covers all functionality. Clean up all references in `package.json`, `README.md`, and affected tests.

## Version target
**2.3.1** (PATCH — removal/cleanup only, no behavior change)

## Dependencies
- Phase 59 ✅ (FEAT-014 — Antigravity, last thing that touched `dev-install.sh`)

## Tasks

### Task 60.1 — Delete scripts + package.json cleanup
**Objective:** Remove both shell script files and strip them from the npm publish manifest.

**Paths:**
- `install.sh` (delete)
- `dev-install.sh` (delete)
- `package.json` (edit — remove both from `files` array)

**File-Level Plan:**
- Delete `install.sh` (125 lines — thin bash wrapper, calls Node CLI, hardcoded `.cursor/` paths)
- Delete `dev-install.sh` (176 lines — bash adapter routing, duplicated by `lib/adapters/`)
- Edit `package.json` `files` array: remove `"install.sh"` and `"dev-install.sh"` entries

**Verification:** `npm pack --dry-run` must NOT list either file.

---

### Task 60.2 — README.md cleanup
**Objective:** Remove all references to the deleted shell scripts from README.md.

**Paths:**
- `README.md`

**File-Level Plan:**
- Line ~72: Installation features table — remove row or update cell that references `install.sh + dev-install.sh`
- Line ~422: Project Structure section — remove `install.sh` and `dev-install.sh` entries
- Keep `bin/viepilot.cjs` references — that is the canonical installer

**Verification:** `grep -n "install.sh\|dev-install.sh" README.md` returns 0 matches.

---

### Task 60.3 — Remove dev-install.sh test coverage
**Objective:** Remove test assertions that only verified shell script content (not behavior). The Node-based adapter system is already well-tested in Groups 1–3.

**Paths:**
- `tests/unit/viepilot-adapters.test.js` (edit — remove Group 4)
- `tests/unit/vp-adapter-antigravity.test.js` (edit — remove dev-install.sh tests)

**File-Level Plan:**
- `viepilot-adapters.test.js`: Delete entire Group 4 block (`describe('FEAT-013: dev-install.sh adapter variable', ...)`) — 2 tests
- `vp-adapter-antigravity.test.js`: Delete the describe block testing `dev-install.sh` content — 2 tests (the ones asserting `VIEPILOT_ADAPTER` and antigravity case in the shell file)

**Verification:** `npm test` passes; test count decreases by exactly 4.

---

## Phase Verification
```bash
npm test               # must pass
npm pack --dry-run     # install.sh and dev-install.sh must NOT appear
grep -rn "install.sh\|dev-install.sh" README.md  # 0 matches
ls install.sh dev-install.sh  # must error (files gone)
```
