# Task 74.1 — workflows/proposal.md: Dynamic slide count + designConfig

## Objective
Update `workflows/proposal.md` Step 4 to:
1. Remove the hard slide count cap (`slides.length MUST equal PROPOSAL_TYPES[typeId].slides`)
2. Add `designConfig` field to the manifest schema
3. Document content-aware slide splitting rules
4. Update AI prompt contract with design selection guidance

## Paths
- workflows/proposal.md

## File-Level Plan

### A. Update Step 3 — proposal type menu

Change slide count labels from hard numbers to "base X slides (scales with content)":
```
1. Project Proposal     (base 10 slides — scales with content)
2. Technical Architecture  (base 12 slides — scales with content)
3. Product Pitch Deck   (base 12 slides — scales with content)
4. General Proposal     ( base 8 slides — scales with content)
```

### B. Update Step 4 manifest schema — add designConfig

Add `designConfig` to manifest JSON schema:
```json
{
  "title": "...",
  "designConfig": {
    "layoutStyle": "modern-tech",
    "colorPalette": {
      "primary": "#1a1f36",
      "accent": "#4f6ef7",
      "highlight": "#e94560",
      "surface": "#2d3142",
      "text": "#e8ecf4",
      "muted": "#8892b0"
    },
    "fontPair": {
      "heading": "Calibri",
      "body": "Calibri"
    }
  },
  "slides": [...]
}
```

**3 layout styles** (AI selects based on audience + sector):
| layoutStyle | When to use | Primary | Accent | Highlight |
|-------------|-------------|---------|--------|-----------|
| `modern-tech` | Tech/SaaS/startup, technical audience | `#1a1f36` | `#4f6ef7` | `#00d4ff` |
| `enterprise` | Finance/legal/consulting, C-suite, procurement | `#0f2044` | `#c9a84c` | `#e8c96d` |
| `creative` | Design/marketing/product, creative industries | `#1a0a2e` | `#e94560` | `#f4a261` |

### C. Remove slide count hardcap

Remove or replace this line:
```
**Slide count rules:** `slides.length` MUST equal `PROPOSAL_TYPES[typeId].slides`
```

Replace with:
```
**Slide count rules (dynamic — ENH-045):**
- Base count per type (project-proposal=10, tech-architecture=12, product-pitch=12, general=8) is the MINIMUM — AI may add slides as needed
- Content-aware splitting triggers:
  - `technicalNarrative` / technical sections with >4 bullet groups → split across 2 slides
  - Team section with >4 members → split into 2 team slides
  - Timeline with >4 phases → split across 2 timeline slides
  - Features with >6 items → split into 2 feature slides
- Maximum recommended: base+6 slides (avoid deck fatigue for client pitches)
- Each split slide gets its own `index`, `layout`, `heading`, `bullets`, `speakerNotes`
```

### D. Update AI prompt contract

Add to `CONTENT RULES` block:
```
DESIGN SELECTION:
- Inspect audience/sector hints (decisionMaker, industry keywords from session)
- Select layoutStyle: 'modern-tech' for tech/SaaS/dev, 'enterprise' for finance/legal/C-suite, 'creative' for design/marketing/product
- Include designConfig in manifest output with appropriate colorPalette for the selected style
- If no clear signal: default to 'modern-tech'

DYNAMIC SLIDES:
- Do NOT limit slide count to the base number — add extra slides when content warrants it
- Apply content-aware splitting for large sections (see split triggers)
- Every slide must carry meaningful distinct content — do not pad with filler slides
```

### E. Update slide structure section headers

For each type, change heading from `### project-proposal (10 slides)` to `### project-proposal (base 10 slides — dynamic)`.

## Verification
```bash
grep -n "designConfig\|layoutStyle\|colorPalette\|dynamic\|split" workflows/proposal.md | head -20
grep -n "slides.length MUST equal" workflows/proposal.md  # Should return empty
```

## Acceptance Criteria
- [ ] `designConfig` with `layoutStyle`, `colorPalette`, `fontPair` added to manifest schema
- [ ] 3 layout styles documented with color values
- [ ] AI prompt contract includes DESIGN SELECTION and DYNAMIC SLIDES rules
- [ ] Hardcap `slides.length MUST equal` removed/replaced
- [ ] Content-aware split triggers documented (tech >4, team >4, phases >4, features >6)
- [ ] Step 3 type menu updated to "base X slides — scales with content"
