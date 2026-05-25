# DEBT-003: check-update consumes 1 000–2 000 init tokens per skill invocation

## Meta
- **ID**: DEBT-003
- **Type**: Technical Debt
- **Status**: triaged
- **Priority**: high
- **Created**: 2026-05-25
- **Reporter**: User
- **Assignee**: AI

## Summary
Every skill invocation runs `vp-tools check-update --silent` which makes an npm registry network
call. The shell execution + stdout + possible update banner rendering costs ~1 000–2 000 tokens
at init. The in-memory `update_check_done` session guard is lost on each new skill invocation, so
the check re-runs every time any skill starts — including within the same conversation session.

## Details

### What happens today
1. Each skill start runs `node "$HOME/.claude/viepilot/bin/vp-tools.cjs" check-update --silent`
2. `check-update` hits `https://registry.npmjs.org/viepilot/latest` (network call)
3. Network response + stdout enters conversation context as tokens (~200 tokens minimum)
4. If update available: banner displayed (~300–400 more tokens)
5. `update_check_done` is an in-memory LLM convention — not a real guard — so it resets every skill
6. In a session using vp-auto + vp-evolve + vp-request: 3 × 1 000 = 3 000 wasted init tokens

### Impact
- 1 000–2 000 tokens wasted per skill invocation just on update checking
- Adds ~500ms+ network latency at every skill start
- No actual deduplication across skill boundaries (guard is fictional)

## Proposed Solution

### Fix 1 — File-based OS-session guard (primary fix)
Write `/tmp/vp-update-check-{YYYY-MM-DD}.done` after the first check completes in an OS session.
On subsequent invocations (any skill), check if file exists → if yes, skip network call entirely
(exit 0 if no update, or exit 1 with cached version if update was found).

Files: `bin/vp-tools.cjs` → `check-update` subcommand logic.

```js
// In check-update handler:
const guardFile = path.join(os.tmpdir(), `vp-update-check-${today()}.done`);
if (fs.existsSync(guardFile)) {
  const cached = JSON.parse(fs.readFileSync(guardFile, 'utf8'));
  if (cached.updateAvailable) { console.log(cached.latest); process.exit(1); }
  process.exit(0);
}
// ... do real check, write guardFile with result
```

Cost: 0 tokens on re-check (guard file check is silent, no stdout if no update).

### Fix 2 — Version cache with 6h TTL
Independently of the OS guard: write `~/.viepilot/update-cache.json` with
`{ latest, checkedAt, updateAvailable }` after each real npm check.
TTL = 6h. On next call (different day/OS restart), reads cache instead of npm if < 6h old.

Prevents multiple npm hits per calendar day (e.g. long sessions).

### Fix 3 — Fast-path exit before any output
If guard file or fresh cache says "no update": `check-update --silent` must exit 0 with
**no stdout** (currently may still print something). Skill version_check blocks only show
banners on exit code 1 + stdout — so the fix is: exit 0 + empty stdout = zero tokens.

Files: `bin/vp-tools.cjs` → `check-update` handler.

## Acceptance Criteria
- [ ] Second invocation of `check-update --silent` in same OS session produces no stdout and exits 0 within 10ms (reads guard file, no network)
- [ ] Guard file `/tmp/vp-update-check-{today}.done` is created after first real check
- [ ] `~/.viepilot/update-cache.json` is written after real npm check with `{ latest, checkedAt, updateAvailable }`
- [ ] Fresh cache (< 6h) is used instead of npm call on subsequent OS sessions
- [ ] Token cost for second+ skill invocation in same day = 0 (no stdout, no banner)
- [ ] Existing behavior preserved: exit 1 + stdout(latest) when update IS available (first check)
- [ ] Contract tests: guard file created, cache written, fast-path skip verified

## Related
- Phase: 150
- Files:
  - `bin/vp-tools.cjs` (check-update subcommand — guard file + cache write/read)
  - `tests/unit/phase{N}-debt003-update-check-cache.test.js`
- Dependencies: none (self-contained in check-update handler)

## Discussion
Fix 1 alone solves 95% of the problem: after the first skill in a session, all subsequent
skill inits cost 0 tokens for version checking. Fix 2 is a bonus for long-running development
days where the OS session is kept across calendar boundaries. Fix 3 is a cleanup ensuring
the fast-path truly produces 0 stdout tokens. Total implementation effort: S/M.

## Resolution
(filled when resolved)
