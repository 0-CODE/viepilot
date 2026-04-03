# Version History

> On-demand reference. Load chỉ khi cần context về version decisions.

| Version | Date | Branch | Type | Notes |
|---------|------|--------|------|-------|
| 1.9.10 | 2026-03-xx | main | PATCH | BUG-006: all targets copy full lib files |
| 1.9.9 | 2026-03-xx | main | PATCH | ENH-025: ui-direction READ-ONLY guard |
| 1.9.8 | 2026-03-xx | main | PATCH | BUG-005: mirror ~/.claude/viepilot/ + rewrite skill paths |
| 1.9.7 | 2026-03-xx | main | MINOR | ENH-024: ui-direction context forward |
| 2.0.0-alpha | 2026-04-02 | v2 | MAJOR | v2 MVP development start |

## Versioning Policy

- v1.x.x = stable (main branch) — bug fixes và enhancements only
- v2.0.0 = breaking milestone (v2 branch) — new execution engine + templates
- v2.x.x after release = MINOR features + PATCH fixes (backward compat guaranteed within v2)
