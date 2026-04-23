# Phase 73 — ENH-044: vp-proposal Mandatory Visual Enforcement

## Goal
Khi `detectVisualArtifacts()` trả về kết quả không rỗng, visual embedding PHẢI xảy ra — không được silent skip. Nếu tool thiếu (puppeteer/mmdc) thì emit WARNING + install hint, dùng placeholder/text fallback. Không crash, nhưng không im lặng.

## Version Target
2.10.0 → **2.10.1** (PATCH — behavior enforcement fix, no new public API changes)

## Dependencies
- Phase 72 ✅ (ENH-043 — imageRunFromPng, renderMermaidToPng)
- Phase 71 ✅ (ENH-042 — detectVisualArtifacts, screenshotArtifact, addPlaceholderVisual)

## Decisions
- `warnMissingTool(tool, installCmd)` utility: logs to stderr với ⚠ prefix
- Step 4c: `visualSlides[]` must be non-empty when artifacts exist (use placeholder if puppeteer absent)
- Step 7: Mermaid + ui/arch sections added regardless of mmdc/puppeteer; warn if absent
- PATCH bump: behavior change không thêm new capability hay public API mới

## Tasks Overview
| ID | File | Description |
|----|------|-------------|
| 73.1 | lib/screenshot-artifact.cjs | `warnMissingTool(tool, installCmd)` exported helper |
| 73.2 | workflows/proposal.md | Step 4c + Step 7: mandatory enforcement + WARNING language |
| 73.3 | Tests + CHANGELOG 2.10.1 | vp-enh044-visual-enforce.test.js + contracts +2 |
