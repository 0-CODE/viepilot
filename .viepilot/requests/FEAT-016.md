# Feature: vp-proposal — Idea → Proposal Documents + Presentation files

## Meta
- **ID**: FEAT-016
- **Type**: Feature
- **Status**: planned
- **Priority**: high
- **Created**: 2026-04-11
- **Reporter**: User
- **Assignee**: AI

## Summary
New skill `/vp-proposal` converts brainstorm session notes (or a direct brief) into a professional proposal package: `.pptx` presentation, `.docx` detail document, and `.md` summary. Supports 4 proposal types with ViePilot-branded stock templates (dark navy/charcoal). Optional `--slides` flag uploads to Google Slides.

## Details

### Proposal types + slide counts
| Type | Slides |
|------|--------|
| `project-proposal` | 10 |
| `tech-architecture` | 12 |
| `product-pitch` | 12 |
| `general` | 8 |

### Tech stack
- `.pptx`: `pptxgenjs` ^3.x (MIT, 1.8M downloads/wk)
- `.docx`: `docx` ^9.x (MIT, 3.5M downloads/wk)
- Google Slides: `@googleapis/slides` (optionalDependencies)

### Template resolution (2-tier)
1. `.viepilot/proposal-templates/{type}.pptx` — project-level override
2. `templates/proposal/pptx/{type}.pptx` — ViePilot stock fallback

### Context detection
- Auto-load latest `docs/brainstorm/session-*.md` when present
- Standalone mode: user provides brief directly
- Override: `--from session-YYYY-MM-DD.md`

## Acceptance Criteria
- [ ] `/vp-proposal` generates .pptx + .docx + .md in `docs/proposals/`
- [ ] 4 proposal types work; slide counts match spec
- [ ] Template override (`.viepilot/proposal-templates/`) takes precedence over stock
- [ ] Auto-detects brainstorm session context
- [ ] `--slides` flag uploads to Google Slides (service account auth)
- [ ] Stock templates use dark navy/charcoal ViePilot branding
- [ ] `@googleapis/slides` is optionalDependency — install does not fail without it
- [ ] Jest contracts pass

## Related
- Brainstorm: `docs/brainstorm/session-2026-04-11.md`
- Phases: 63–67
- Target version: 2.5.0
