# Phase 72 — ENH-043: vp-proposal .docx Visual Embedding

## Goal
Nhúng hai loại visual vào file `.docx`:
1. **Mermaid charts** từ `docxContent.diagrams[]` → render via `mmdc` CLI → PNG → `ImageRun`
2. **HTML artifact screenshots** từ `detectVisualArtifacts()` → `screenshotArtifact()` → PNG → `ImageRun`

Fallback hoàn toàn graceful: nếu `mmdc` / `puppeteer` không có → giữ nguyên preformatted text / bỏ qua ảnh, không crash.

## Version Target
2.9.0 → **2.10.0** (MINOR — new visual capability for docx)

## Dependencies
- Phase 71 ✅ (ENH-042 — screenshotArtifact, detectVisualArtifacts, addPlaceholderVisual)
- Phase 70 ✅ (ENH-041 — docxContent schema with diagrams[].mermaidSource)

## Decisions
- Mermaid render: `mmdc` CLI via `child_process.spawnSync` — optional, try `mmdc --version` before use
- HTML screenshots: reuse `screenshotArtifact()` from `lib/screenshot-artifact.cjs`
- docx image: `new ImageRun({ data: fs.readFileSync(pngPath), transformation: { width, height }, type: 'png' })` wrapped in a `Paragraph`
- Diagram Reference section: replace monospace text paragraph with rendered PNG (or keep text if mmdc absent)
- UI artifact injection: before Executive Summary section → ui-direction index.html screenshot
- Architect diagram injection: after Technical Approach → architecture.html screenshot (if available)

## Tasks Overview
| ID | File | Description |
|----|------|-------------|
| 72.1 | lib/screenshot-artifact.cjs | `isMmdcAvailable()` + `renderMermaidToPng(source, outPath)` |
| 72.2 | scripts/gen-proposal-docx.cjs | `imageRunFromPng(pngPath, w, h)` + integrate Mermaid PNG + ui/architect screenshots |
| 72.3 | workflows/proposal.md | Update Step 7 — docx diagram sections use rendered PNG; ui artifact injection |
| 72.4 | Tests + CHANGELOG 2.10.0 | vp-enh043-docx-visuals.test.js + contracts +2 |
