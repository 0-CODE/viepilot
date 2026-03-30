# Phase 12 Summary - vp-audit Stack Compliance + Research Fallback

## Result
Phase 12 is complete (3/3 tasks).

## What changed
- Upgraded `workflows/audit.md` from 3-tier to 4-tier model:
  - Tier 1: ViePilot state consistency
  - Tier 2: Project docs drift
  - Tier 3: Stack best practices + code quality
  - Tier 4: Framework integrity (conditional)
- Added Tier 3 stack intelligence behaviors:
  - stack detection
  - summary-first cache loading
  - web research fallback (`WebSearch` + `WebFetch`) when cache is missing/weak
  - severity-tagged findings with file/module mapping
  - vp-auto-compatible guardrails contract
- Updated `skills/vp-audit/SKILL.md`:
  - objective/process/success criteria aligned to stack-aware audit
  - version bumped to `0.3.0`
- Updated `skills/vp-auto/SKILL.md`:
  - preflight now explicitly applies stack guardrails from `.viepilot/audit-report.md` when available

## Acceptance criteria status
- [x] Output includes Stack Best Practices section
- [x] Output includes Code Quality by Stack semantics and severity mapping
- [x] Missing/weak stack cache has documented research fallback
- [x] vp-auto guardrails contract is documented and aligned
- [x] Token-efficient summary-first policy preserved

## Notes
- This phase implements ENH-009 and keeps backward compatibility for existing audit flows.
