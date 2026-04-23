# Phase 71 — ENH-042: vp-proposal PPTX Visual Imagery

## Goal
Tự động nhúng ảnh chụp màn hình (screenshot) từ HTML artifact đã có trong session (ui-direction prototype, architect workspace) vào slides `.pptx`. Fallback sang placeholder shape nếu puppeteer không có.

## Version Target
2.8.0 → **2.9.0** (MINOR — new visual capability)

## Dependencies
- Phase 70 ✅ (ENH-041 — docxContent)
- Phase 69 ✅ (ENH-040 — 5 pptx layouts)

## Decisions
- Screenshot tool: **puppeteer** (optional peer dep) — `try { require('puppeteer') } catch { null }`
- Fallback: styled pptxgenjs placeholder shape (rect, accent color, label text)
- Artifact sources: `.viepilot/ui-direction/{session}/` + architect workspace pages
- `detectVisualArtifacts()` scans by latest session date, returns `{ uiPages, architectPages }`
- Manifest `visualSlides[]` field: AI maps slide topics → artifact HTML paths
- No hard dependency — vp-proposal works fully without puppeteer, just no screenshots

## Tasks Overview
| ID | File | Description |
|----|------|-------------|
| 71.1 | lib/proposal-generator.cjs | `detectVisualArtifacts(sessionPath)` helper |
| 71.2 | workflows/proposal.md | Step 4c detect_visual_artifacts + manifest visualSlides[] |
| 71.3 | scripts/gen-proposal-pptx.cjs | `screenshotArtifact()` + placeholder + integrate visualSlides |
| 71.4 | Tests + CHANGELOG 2.9.0 | vp-enh042-proposal-visuals.test.js + contracts |
