# Task 71.2 — workflows/proposal.md: Step 4c detect_visual_artifacts

## Objective
Insert `<step name="detect_visual_artifacts">` (Step 4c) into `workflows/proposal.md` after the Step 4b `generate_docx_content` step. This step instructs the AI to:
1. Call `detectVisualArtifacts()` to find available HTML artifact files
2. Map slide topics to artifact pages
3. Produce `visualSlides[]` array in the manifest

Also update the manifest schema (in `generate_manifest` step) to document the `visualSlides[]` field.

## Paths
- workflows/proposal.md

## File-Level Plan

### Insert after `</step>` of `generate_docx_content` (Step 4b):

```xml
<step name="detect_visual_artifacts">
## Step 4c: Detect Visual Artifacts (optional screenshot pass)

This step runs **after Step 4b** and **before template resolution**.

1. Call `detectVisualArtifacts()` from `lib/proposal-generator.cjs`:
   ```js
   const { detectVisualArtifacts } = require('./lib/proposal-generator.cjs');
   const artifacts = detectVisualArtifacts(); // auto-detects latest session
   ```

2. If `artifacts.uiPages.length === 0 && artifacts.architectPages.length === 0`:
   - Skip this step. Set `visualSlides = []`.
   - Log: `[visuals] No HTML artifacts found — skipping screenshot pass`

3. If artifacts are found, produce `visualSlides[]` by mapping slide topics to artifacts:

   **Mapping rules (AI judgment):**
   | Slide topic keywords | Artifact to use | artifactType |
   |----------------------|-----------------|--------------|
   | UI, interface, mockup, design, screens | `artifacts.uiPages[0]` (index.html) | `ui-overview` |
   | Architecture, system design, components | `architectPages` → `architecture.html` | `architect-arch` |
   | Database, entities, ERD, data model | `architectPages` → `erd.html` | `architect-erd` |
   | Flow, sequence, interactions, API | `architectPages` → `sequence-diagram.html` | `architect-seq` |
   | Features, feature map | `architectPages` → `feature-map.html` | `architect-features` |
   | Users, roles, use cases | `architectPages` → `user-use-cases.html` | `architect-usecases` |

4. `visualSlides[]` schema:
   ```json
   [
     {
       "slideIndex": 3,
       "artifactType": "ui-overview",
       "htmlPath": "/absolute/path/to/index.html",
       "label": "UI Prototype Overview"
     },
     {
       "slideIndex": 7,
       "artifactType": "architect-arch",
       "htmlPath": "/absolute/path/to/architecture.html",
       "label": "System Architecture"
     }
   ]
   ```
   - `slideIndex`: 0-based index in the slides array
   - Maximum 1 visual per slide
   - Only assign visuals to slides where a visual adds value (skip title/CTA/agenda slides)

5. Store as `visualSlides` variable for use in Step 6 (generate_pptx).

Progress: `[visuals] Found {N} artifact(s) → {M} slides will have screenshots`

---
</step>
```

### Update manifest schema (in `generate_manifest` step):
Add `visualSlides` to the manifest JSON schema documentation block.

## Best Practices
- AI skips step gracefully if no artifacts — no error, just empty array
- Only assign visuals to content slides (not cover/section/closing)
- Max 3–4 visual slides per proposal to avoid visual overload

## Acceptance Criteria
- [ ] `<step name="detect_visual_artifacts">` block exists in `workflows/proposal.md`
- [ ] Step documents `visualSlides[]` schema with all required fields
- [ ] Artifact → slide mapping table present
- [ ] Fallback (empty artifacts) documented
- [ ] `visualSlides` referenced as input to Step 6 (generate_pptx)
