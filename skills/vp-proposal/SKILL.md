---
name: vp-proposal
description: "Generate professional proposal packages (.pptx + .docx + .md) from brainstorm sessions or direct briefs"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-proposal`, `/vp-proposal`, "proposal", "pitch deck", "presentation", "tài liệu đề xuất"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
</scope_policy>
<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **`/vp-proposal`** generates **output artifacts** (`docs/proposals/*.pptx`, `*.docx`, `*.md`) — it does **not** implement shipping code for `lib/`, `tests/`, `bin/`, or framework `workflows/`/`skills/`.
- This skill is the **delivery lane** after `/vp-brainstorm` captures the ideas. Use `/vp-request` → `/vp-evolve` → `/vp-auto` for ViePilot framework feature work.
- **Exception:** User **explicit** bypass — state clearly in chat.
</implementation_routing_guard>

<objective>
Generate a professional proposal package from a brainstorm session or direct brief.

**Output files** (written to `docs/proposals/`):
- `{slug}-{date}.md` — structured proposal Markdown (source of truth)
- `{slug}-{date}.pptx` — presentation file (ViePilot branded, dark navy/charcoal)
- `{slug}-{date}.docx` — detailed project document
- `{slug}-{date}-slides.txt` — Google Slides URL (only with `--slides` flag)

**Proposal types:**
| Type | Slides | Use case |
|------|--------|----------|
| `project-proposal` | 10 | Scope, timeline, budget for clients |
| `tech-architecture` | 12 | Technical design for partners |
| `product-pitch` | 12 | Investor / partner pitch deck |
| `general` | 8 | Generic, fallback |

**Template resolution (2-tier):**
1. `.viepilot/proposal-templates/{type}.pptx` — project-level override
2. `{viepilot-install}/templates/proposal/pptx/{type}.pptx` — ViePilot stock

**Context detection:**
- Auto-loads latest `docs/brainstorm/session-*.md` when present
- Standalone mode if no session found (user provides brief)
- `--from session-YYYY-MM-DD.md` for explicit session selection
</objective>

<execution_context>
workflows/proposal.md
</execution_context>

<context>
Optional flags:
- `--type <id>` : Proposal type — `project-proposal` | `tech-architecture` | `product-pitch` | `general`
                  If omitted: guided selection menu is shown
- `--from <file>` : Explicit brainstorm session file to use as context
                    Default: auto-detect latest `docs/brainstorm/session-*.md`
- `--slides` : After .pptx is generated, upload to Google Slides via service account auth
               Requires: `@googleapis/slides` installed + `GOOGLE_APPLICATION_CREDENTIALS` env var
- `--dry-run` : Show slide manifest (JSON) without writing any files
</context>

<process>
Execute workflow from `workflows/proposal.md`

### Step 1: Context Detection
- Scan `docs/brainstorm/` for `session-*.md` → sort descending → load latest
- If `--from` specified: load that file directly
- If no session found: prompt user for brief:
  - Project name
  - One-line description
  - Target audience (client / partner / investor)
  - 3–5 key points to cover

### Step 2: Proposal Type Selection
- If `--type` provided: validate; show type + slide count to confirm
- Else: present menu:
  ```
  1. Project Proposal     (10 slides) — scope, timeline, budget
  2. Tech Architecture    (12 slides) — system design for partners
  3. Product Pitch Deck   (12 slides) — investor / partner pitch
  4. General Proposal     ( 8 slides) — generic fallback
  ```

### Step 3: AI Slide Manifest Generation
- Structure context into JSON manifest:
  ```json
  {
    "title": "...",
    "subtitle": "...",
    "slides": [
      { "index": 1, "layout": "cover", "heading": "...", "body": "...", "speakerNotes": "..." },
      { "index": 2, "layout": "section", "heading": "...", "bullets": ["..."], "speakerNotes": "..." }
    ]
  }
  ```
- Slide count MUST match `PROPOSAL_TYPES[typeId].slides`
- If `--dry-run`: print manifest and stop

### Step 4: Template Resolution
- Call `resolveTemplate(typeId, 'pptx', projectRoot)` → pptx template path
- Call `resolveTemplate('project-detail', 'docx', projectRoot)` → docx template path
- Warn (not error) if stock fallback is used

### Step 5: Generate .pptx
- Load template via pptxgenjs
- Apply slide manifest: inject titles, bullets, speaker notes per slide
- Ensure `docs/proposals/` directory exists
- Write `{slug}-{date}.pptx`

### Step 6: Generate .docx
- Build detailed document from same manifest + extended content
- Sections: Executive Summary, Problem & Solution, Features & Specifications,
            Technical Architecture (if relevant), Timeline, Team, Appendix
- Write `{slug}-{date}.docx`

### Step 7: Generate .md summary
- Write Markdown mirror of the manifest
- Save `{slug}-{date}.md`

### Step 8: Optional Google Slides upload (`--slides`)
- Call `lib/google-slides-exporter.cjs` → `uploadToSlides(pptxPath, title)`
- Write URL to `{slug}-{date}-slides.txt`
- On failure: surface error but do NOT fail the whole command (files already written)

### Step 9: Confirm output
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► PROPOSAL GENERATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Type:    {type label}  ({N} slides)
 Context: {session file or "direct brief"}

 Files:
   docs/proposals/{slug}-{date}.md
   docs/proposals/{slug}-{date}.pptx
   docs/proposals/{slug}-{date}.docx
   [docs/proposals/{slug}-{date}-slides.txt]  ← if --slides

 Next:
   Open .pptx in PowerPoint / Keynote / LibreOffice
   Share .docx as supporting document
   Run /vp-proposal --slides to upload to Google Slides
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</process>

<success_criteria>
- [ ] Context detected (brainstorm session or user brief)
- [ ] Proposal type selected and validated
- [ ] Slide manifest generated with correct slide count
- [ ] .pptx written to docs/proposals/
- [ ] .docx written to docs/proposals/
- [ ] .md summary written to docs/proposals/
- [ ] Template resolution: project override takes precedence over stock
- [ ] --slides: Google Slides URL written to -slides.txt (or clear error shown)
- [ ] --dry-run: manifest printed, no files written
</success_criteria>
