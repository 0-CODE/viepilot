# Phase 34 — SUMMARY (FEAT-001)

**Completed:** 2026-04-02  
**Ship version:** **1.9.3**

## Delivered
- `docs/user/claude-code-setup.md` — install `npx viepilot install --target claude-code`, map `vp-*` → `~/.claude/skills`, workflows under `~/.cursor/viepilot/`, verify `vp-tools info`, ENH-021 chain.
- Cross-links: `docs/getting-started.md`, `docs/user/quick-start.md`, `docs/user/faq.md`, `docs/README.md`.
- `tests/unit/vp-feat001-claude-code-docs-contracts.test.js` — doc + entrypoint string contracts.

## Verification
- `npm test` — 299 passed, 15 suites.

## Follow-ups (optional)
- Installer could emit Claude-native paths in a future ENH (currently same bundle as Cursor per `viepilot-install.cjs`).
