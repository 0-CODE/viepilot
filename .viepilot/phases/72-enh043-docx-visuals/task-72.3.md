# Task 72.3 — workflows/proposal.md: Update Step 7 for docx visual embedding

## Objective
Update `<step name="generate_docx">` (Step 7) in `workflows/proposal.md` to document the visual embedding pattern:
- Mermaid diagrams → rendered PNG via `renderMermaidToPng()` when mmdc available
- UI artifact → screenshot before Executive Summary
- Architect diagram → screenshot after Technical Approach

## Paths
- workflows/proposal.md

## File-Level Plan

### Update the "Diagram Reference" row in Step 7 section table:

Current:
```
| **Diagram Reference** | `docxContent.diagrams[]` | **One table per diagram: Title \| Type \| Description (mermaidSource as preformatted text)** |
```

New:
```
| **Diagram Reference** | `docxContent.diagrams[]` | **Per diagram: render `mermaidSource` → PNG via `renderMermaidToPng()` → `ImageRun`; fallback: preformatted Mermaid source text** |
```

### Add new section describing visual embedding steps in Step 7 (after item 8 Glossary, before item 9 Write to file):

```markdown
9. **Visual embedding** (when `mmdc` / `puppeteer` available):

   **Mermaid diagram images** — for each `docxContent.diagrams[]` entry:
   ```js
   const tmpPng = path.join(os.tmpdir(), `vp-mmdc-${Date.now()}.png`);
   const rendered = renderMermaidToPng(diagram.mermaidSource, tmpPng);
   // If rendered: insert ImageRun before monospace text paragraph
   // If null: keep preformatted text fallback (no change)
   cleanupScreenshot(rendered);
   ```

   **UI prototype screenshot** — if `artifacts.uiPages[0]` available:
   ```js
   const tmpPng = await screenshotArtifact(artifacts.uiPages[0]);
   // Insert as ImageRun at top of Executive Summary section
   cleanupScreenshot(tmpPng);
   ```

   **Architecture diagram screenshot** — if `architecture.html` in `artifacts.architectPages`:
   ```js
   const tmpPng = await screenshotArtifact(archHtml);
   // Insert as ImageRun at end of Technical Approach section
   cleanupScreenshot(tmpPng);
   ```

   Fallback: all three paths return null silently when tools absent. No crash.
```

### Update Step 7 "Write to" line numbering (becomes item 10).

## Acceptance Criteria
- [ ] Step 7 documents `renderMermaidToPng()` usage for Mermaid diagrams
- [ ] Step 7 documents `screenshotArtifact()` for ui-direction + architect screenshot injection
- [ ] Step 7 documents fallback (null → keep text)
- [ ] `cleanupScreenshot()` mentioned in all three patterns
- [ ] No breaking change to existing Step 7 table structure
