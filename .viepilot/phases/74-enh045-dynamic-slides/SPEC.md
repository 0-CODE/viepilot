# Phase 74 — ENH-045: vp-proposal Dynamic Slide Count + AI-driven Visual Design

## Goal
Loại bỏ hard-coded slide count trong PPTX generation. Số slide được tính dựa trên nội dung thực tế (phases, team, risks, features). Mặc định PPTX phải có visual design phù hợp dự án — chuyên nghiệp, bắt mắt khi thuyết trình cho khách hàng.

## Version Target
2.10.1 → **2.11.0** (MINOR — new visible capability)

## Dependencies
- Phase 73 ✅ (ENH-044 — mandatory visual enforcement)
- Phase 71 ✅ (ENH-042 — detectVisualArtifacts, screenshotArtifact)

## Decisions
- Remove `slides.length MUST equal PROPOSAL_TYPES[typeId].slides` hardcap in Step 4
- `slideManifest` base structure per type still used as skeleton, but AI can add slides for extra content
- `designConfig` object added to manifest: `colorPalette`, `layoutStyle`, `fontPair`
- 3 layout styles: `modern-tech`, `enterprise`, `creative`
- `gen-proposal-pptx.cjs`: palette-driven colors, rich layouts for cover/timeline/team/investment/closing
- Content-aware splitting: long technicalNarrative → 2 slides; >4 team members → 2 team slides; >4 phases → 2 timeline slides
- `lib/proposal-generator.cjs`: add `getDesignConfig(projectContext)` helper
- MINOR bump: new public behavior (design + dynamic count)

## Tasks Overview
| ID | File | Description |
|----|------|-------------|
| 74.1 | workflows/proposal.md | Step 4: remove slide hardcap + add designConfig field + content-aware split rules |
| 74.2 | lib/proposal-generator.cjs | `getDesignConfig(projectContext)` helper — returns designConfig for 3 styles |
| 74.3 | scripts/gen-proposal-pptx.cjs | Palette-driven PPTX + rich layouts (cover, timeline, team, investment, closing) |
| 74.4 | Tests + CHANGELOG 2.11.0 | vp-enh045-dynamic-slides.test.js + version bump |
