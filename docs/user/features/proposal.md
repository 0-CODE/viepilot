# vp-proposal — Proposal Package Generator

Generate professional proposal packages directly from your ViePilot brainstorm sessions.

---

## Overview

`/vp-proposal` converts a brainstorm session (or a direct brief) into three synchronized files:

| File | Format | Purpose |
|------|--------|---------|
| `{slug}-{date}.md` | Markdown | Source of truth, version-controlled |
| `{slug}-{date}.pptx` | PowerPoint | Presentation (direct delivery) |
| `{slug}-{date}.docx` | Word | Detailed supporting document |
| `{slug}-{date}-slides.txt` | Text | Google Slides URL (with `--slides` flag) |

All files are written to `docs/proposals/` in your project.

---

## Quick Start

```bash
# Auto-detects latest brainstorm session
/vp-proposal

# Specify type directly
/vp-proposal --type product-pitch

# With Google Slides upload
/vp-proposal --type project-proposal --slides

# Preview slide manifest without writing files
/vp-proposal --dry-run
```

---

## Proposal Types

| Type ID | Name | Slides | Best for |
|---------|------|--------|----------|
| `project-proposal` | Project Proposal | 10 | Client delivery — scope, timeline, budget |
| `tech-architecture` | Technical Architecture | 12 | Technical partners — system design |
| `product-pitch` | Product Pitch Deck | 12 | Investors / partners — pitch |
| `general` | General Proposal | 8 | Any audience — flexible structure |

---

## Flags

| Flag | Description |
|------|-------------|
| `--type <id>` | Proposal type (see table above). If omitted: guided menu. |
| `--from <file>` | Explicit brainstorm session: `--from docs/brainstorm/session-2026-04-11.md` |
| `--slides` | Upload generated .pptx to Google Slides after generation |
| `--dry-run` | Show slide manifest (JSON) without writing any files |

---

## Context Detection

`/vp-proposal` automatically loads the most recent brainstorm session:

1. Scans `docs/brainstorm/session-*.md`
2. Sorts descending by filename (ISO date format)
3. Loads the latest session as proposal content

**Override:** use `--from <session-file>` to specify a different session.

**Standalone mode:** if no session exists, you'll be prompted for a brief:
- Project name
- One-line description
- Target audience
- 3–5 key points

---

## Template Override

ViePilot ships stock templates (dark navy/charcoal, ViePilot branded).
To use your own branded templates for a specific project:

```
your-project/
└── .viepilot/
    └── proposal-templates/
        ├── project-proposal.pptx    ← overrides stock
        ├── tech-architecture.pptx
        ├── product-pitch.pptx
        ├── general.pptx
        └── project-detail.docx
```

**Resolution order:**
1. `.viepilot/proposal-templates/{type}.pptx` (project-level override)
2. `{viepilot-install}/templates/proposal/pptx/{type}.pptx` (ViePilot stock)

The override only applies to the project where the file is placed.

---

## Output Structure

```
docs/proposals/
├── my-project-2026-04-11.md      # Markdown source of truth
├── my-project-2026-04-11.pptx    # Presentation
├── my-project-2026-04-11.docx    # Detailed document
└── my-project-2026-04-11-slides.txt  # Google Slides URL (if --slides)
```

The `.md` file is the diff-friendly source. The `.pptx` and `.docx` are generated from it and can be regenerated at any time.

---

## Google Slides Export

Use the `--slides` flag to automatically upload the generated `.pptx` to Google Slides.

### Setup (one-time)

**Step 1: Create a Google Cloud project**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one)

**Step 2: Enable APIs**
1. Navigate to **APIs & Services → Library**
2. Enable **Google Drive API**
3. Enable **Google Slides API**

**Step 3: Create a Service Account**
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Fill in name (e.g., `viepilot-proposal`)
4. Click **Done**
5. Click the new service account → **Keys** tab → **Add Key → Create new key (JSON)**
6. Save the downloaded JSON file securely (e.g., `~/.config/viepilot-gcp-key.json`)

**Step 4: Set environment variable**
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account-key.json

# Add to ~/.zshrc or ~/.bashrc to persist:
echo 'export GOOGLE_APPLICATION_CREDENTIALS=~/.config/viepilot-gcp-key.json' >> ~/.zshrc
```

**Step 5: Install the optional dependency**
```bash
npm install @googleapis/slides
```

### Usage
```bash
/vp-proposal --type product-pitch --slides
# Output: docs/proposals/my-project-2026-04-11-slides.txt
# Content: https://docs.google.com/presentation/d/{id}/edit
```

### Notes
- The uploaded presentation retains the `.pptx` layout (converted by Google Drive)
- Upload failures are non-fatal — the `.pptx`, `.docx`, and `.md` files are always written first
- The service account needs no special permissions beyond the API scopes

---

## Examples

### Client proposal from brainstorm session
```
/vp-proposal --type project-proposal
→ Auto-loads docs/brainstorm/session-2026-04-11.md
→ Generates 10-slide project proposal
```

### Investor pitch standalone
```
/vp-proposal --type product-pitch
→ No session found — prompts for brief
→ Generates 12-slide pitch deck
```

### Architecture review with Google Slides
```
/vp-proposal --type tech-architecture --slides
→ Generates 12-slide architecture proposal + uploads to Google Slides
→ Writes URL to docs/proposals/*-slides.txt
```

### Preview without writing files
```
/vp-proposal --dry-run
→ Prints JSON slide manifest to console
→ No files written
```
