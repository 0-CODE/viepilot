<purpose>
Manage Design.MD design system files for a project. Supports creating design.md (Q&A or
community import), syncing tokens to stylesheets (Tailwind/CSS/SCSS), auditing compliance,
and importing brand templates from the awesome-design-md catalog.
</purpose>

<process>

<step name="command_router">
Parse the first recognized flag from args: --init | --sync | --audit | --import [brand].
If no flag: print help and exit.
</step>

<step name="init_qa">
Q&A from scratch: gather brand name, personality, primary color, font family, heading scale,
spacing base, corner radius → auto-derive semantic colors → write design.md at project root.
</step>

<step name="init_import">
awesome-design-md import: AUQ catalog picker by category → fetch template from GitHub raw →
preview token table → AUQ apply mode (Apply as-is / Customize / Reference only).
</step>

<step name="sync_tokens">
Parse design.md YAML front matter → TOKEN_MAP. Detect stack (Tailwind / CSS vars / SCSS).
Generate/update target with tokens. Conflict resolution per token via AUQ. Report synced count.
</step>

<step name="audit_compliance">
Discover .html/.css/.scss files (exclude node_modules). Extract color/font refs. Compare vs
TOKEN_MAP. Categorize: ❌ Critical / ⚠️ Minor / ✅ Compliant. Generate report table. Suggest --sync.
</step>

<step name="import_brand">
Resolve brand from arg or AUQ catalog. Fetch template. Preview tokens. AUQ apply mode.
Same apply logic as init_import. Falls back to Q&A if fetch fails.
</step>

</process>

<success_criteria>
- [ ] `design.md` created/updated at project root with valid Design.MD v1 YAML front matter
- [ ] `--init` Q&A covers brand / color / typography / spacing / rounded
- [ ] `--init --import` fetches community template and applies per user choice
- [ ] `--sync` detects Tailwind / CSS vars / SCSS and updates correct target file
- [ ] `--sync` conflict resolution uses AUQ per conflicting token
- [ ] `--audit` generates severity-categorized compliance report (❌/⚠️/✅)
- [ ] `--import` fetches community template from awesome-design-md catalog
- [ ] AUQ used for catalog picker, apply mode, multi-target selection, conflict resolution
- [ ] Offline fallback: --import network failure routes to --init Q&A
</success_criteria>

---

## Command Router

Parse the first recognized flag from args:

| Flag | Mode |
|------|------|
| `--init` | Initialize/create design.md |
| `--sync` | Sync tokens → project stylesheets |
| `--audit` | Compliance report scan |
| `--import [brand]` | Import community template |

If no flag or unrecognized: print help listing the 4 commands and exit.

---

## --init Flow

### Mode Detection

Check if `--import` is also present (or user says "import"/"from community"):
- If yes → **Mode B: awesome-design-md import**
- If no → **Mode A: Q&A from scratch**

---

### Mode A: Q&A from Scratch

**Step 1 — Brand Identity**

```
AUQ prompt: "What's your brand name?"
  → free text (required)
```

```
AUQ prompt: "Choose your brand personality (3 words describe the vibe):"
  options:
    - "Minimal / Clean / Modern"
    - "Bold / Energetic / Vibrant"
    - "Playful / Friendly / Warm"
    - "Enterprise / Professional / Reliable"
    - "Technical / Developer / Precise"
    - "Custom — I'll describe it"
```

```
AUQ prompt: "Primary brand color:"
  options:
    - "Indigo — #6366f1 (modern SaaS)"
    - "Blue — #3b82f6 (trust / enterprise)"
    - "Emerald — #10b981 (growth / fintech)"
    - "Violet — #8b5cf6 (creative / AI)"
    - "Enter hex manually"
```

If "Enter hex manually" → prompt: "Enter hex color (e.g. #ff5500):"

**Step 2 — Typography**

```
AUQ prompt: "Font family:"
  options:
    - "Inter — versatile, modern UI standard"
    - "Geist — clean, developer-focused (Vercel)"
    - "Plus Jakarta Sans — friendly, contemporary"
    - "DM Sans — geometric, approachable"
    - "Custom — specify font name"
```

```
AUQ prompt: "Heading scale / line-height feel:"
  options:
    - "Tight compact — 1.1–1.2 (bold, impactful)"
    - "Balanced standard — 1.3–1.4 (Recommended)"
    - "Spacious editorial — 1.5–1.6 (readable, airy)"
```

**Step 3 — Spacing & Shape**

```
AUQ prompt: "Spacing base unit:"
  options:
    - "4px atomic — fine-grained control"
    - "8px standard — Recommended (most UI frameworks)"
    - "Custom — specify px value"
```

```
AUQ prompt: "Corner radius style:"
  options:
    - "Sharp — 0px (geometric, no rounding)"
    - "Subtle — 4px (slight polish)"
    - "Rounded — 8px — Recommended"
    - "Smooth — 12px (friendly, modern)"
    - "Pill — 16px+ (soft, playful)"
```

**Step 4 — Auto-Generate Semantic Colors**

From primary hex, derive:
- `surface`: lighten primary by 95% (near-white tint)
- `surface_secondary`: lighten primary by 90%
- `error`: #ef4444 (standard red — override if brand conflicts)
- `success`: #22c55e (standard green)
- `warning`: #f59e0b (standard amber)
- `text_primary`: #0f172a (dark neutral)
- `text_secondary`: #64748b (muted neutral)

Show preview table:
```
┌──────────────────────────────────────────────────────────┐
│  Color Preview                                           │
├──────────────────┬───────────┬──────────────────────────┤
│  Token           │  Hex      │  Role                    │
├──────────────────┼───────────┼──────────────────────────┤
│  primary         │  {hex}    │  Brand / interactive     │
│  surface         │  {hex}    │  Page background         │
│  surface_second  │  {hex}    │  Card / panel bg         │
│  error           │  #ef4444  │  Errors / destructive    │
│  success         │  #22c55e  │  Confirmations           │
│  warning         │  #f59e0b  │  Cautions                │
│  text_primary    │  #0f172a  │  Body text               │
│  text_secondary  │  #64748b  │  Muted / labels          │
└──────────────────┴───────────┴──────────────────────────┘
```

**Step 5 — Write design.md at Project Root**

Write `design.md` with the following structure:

```markdown
---
colors:
  primary: "{hex}"
  surface: "{hex}"
  surface_secondary: "{hex}"
  error: "#ef4444"
  success: "#22c55e"
  warning: "#f59e0b"
  text_primary: "#0f172a"
  text_secondary: "#64748b"
typography:
  font_sans: "{font_name}"
  font_mono: "JetBrains Mono"
  scale_ratio: 1.25
  heading_line_height: {value}
  body_line_height: 1.5
spacing:
  base: {n}
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
rounded:
  sm: "4px"
  md: "{radius}px"
  lg: "{radius * 2}px"
  full: "9999px"
---

# Design System — {brand_name}

## Brand Identity
**Personality:** {personality}
**Primary color:** {hex} — {color_name}

## Typography
- **Sans:** {font_name} — imported from Google Fonts / npm
- **Mono:** JetBrains Mono — code blocks, terminals
- **Scale ratio:** 1.25 (major third)

## Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| primary | {hex} | CTAs, links, interactive |
| surface | {hex} | Page background |
| surface_secondary | {hex} | Cards, panels |
| error | #ef4444 | Errors, destructive actions |
| success | #22c55e | Confirmations, success states |
| warning | #f59e0b | Cautions, pending |
| text_primary | #0f172a | Body text, headings |
| text_secondary | #64748b | Labels, placeholders, muted |

## Spacing
Base unit: {n}px. Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128

## Border Radius
sm={rounded.sm} · md={rounded.md} · lg={rounded.lg} · full={rounded.full}

## Components
> Extend this section per component as your design system grows.

## Accessibility
- Contrast ratio target: WCAG AA (4.5:1 for text)
- Focus ring: 2px solid primary + 2px offset
- Minimum tap target: 44×44px

## Motion
- Duration short: 150ms
- Duration medium: 250ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

## Dark Mode
> Document dark-mode token overrides here when applicable.
```

Print confirmation: `✅ design.md created at {path}`

---

### Mode B: awesome-design-md Import

**Step 1 — Catalog Picker**

```
AUQ prompt: "Choose a brand from the awesome-design-md community library:"
  options (by category):
    ── Productivity ──
    - "Notion — clean minimal, off-white surface"
    - "Linear — dark-first, indigo accent"
    - "Asana — coral/pink, energetic"
    - "Todoist — red, structured"
    ── Developer ──
    - "GitHub — neutral, professional"
    - "Vercel — black/white, high contrast"
    - "Figma — purple, creative"
    - "Supabase — emerald green, developer"
    ── Commerce ──
    - "Stripe — indigo blue, financial trust"
    - "Shopify — green, commerce"
    - "Paddle — dark blue, SaaS billing"
    ── Enterprise ──
    - "IBM Carbon — blue, enterprise"
    - "Atlassian — blue, collaborative"
    - "Salesforce — cloud blue, CRM"
    ── Creative ──
    - "Dribbble — pink, portfolio"
    - "Behance — blue, Adobe"
    - "Adobe — red, creative suite"
```

**Step 2 — Fetch Template**

Fetch from awesome-design-md GitHub raw content:
```
https://raw.githubusercontent.com/philschmid/awesome-design-md/main/templates/{brand-slug}/design.md
```

If fetch fails: show error + offer to continue with Q&A mode (Mode A).

**Step 3 — Preview**

Show token table from fetched design.md YAML:
```
Brand: {brand_name}

Colors:
  primary:          {hex}
  surface:          {hex}
  ...

Typography:
  font_sans:        {font}
  heading_lh:       {value}

Spacing:
  base:             {n}px

Rounded:
  md:               {value}
```

**Step 4 — Apply Mode**

```
AUQ prompt: "How would you like to apply this template?"
  options:
    - "Apply as-is — write design.md to project root now"
    - "Customize before applying — walk through each token group"
    - "Use as reference only — save to .viepilot/ui-direction/reference-design.md"
```

**Apply as-is:** Write fetched design.md to project root. Done.

**Customize before applying:** For each token group (colors / typography / spacing / rounded):
  - Show current values
  - AUQ: "Keep as-is / Override this group"
  - If override: run the relevant Q&A sub-step from Mode A
  - Then write merged design.md

**Reference only:** Copy to `.viepilot/ui-direction/reference-design.md`. Print notice: "Saved as reference — not applied to project root."

---

## --sync Flow

**Step 1 — Read design.md**

Look for `design.md` in:
1. Current directory
2. Project root (walk up from CWD)

If not found: print error "No design.md found. Run /vp-design --init first." and exit.

Parse YAML front matter → build `TOKEN_MAP`:
```
TOKEN_MAP = {
  colors: { primary, surface, surface_secondary, error, success, warning, text_primary, text_secondary },
  typography: { font_sans, font_mono, scale_ratio, heading_line_height, body_line_height },
  spacing: { base, scale[] },
  rounded: { sm, md, lg, full }
}
```

**Step 2 — Detect Stack**

Check files in project root:
```
tailwind.config.js   → Tailwind mode
tailwind.config.ts   → Tailwind mode
style.css            → CSS custom properties mode (if no tailwind)
styles.css           → CSS custom properties mode (if no tailwind)
src/styles/*.css     → CSS custom properties mode (if no tailwind)
*.scss / src/**/*.scss → SCSS mode
```

If multiple targets detected:
```
AUQ prompt: "Multiple stylesheet targets found. Which should be updated?"
  options:
    - "tailwind.config.js"
    - "style.css"
    - "{first scss file found}"
    - "All targets"
```

**Step 3 — Generate / Update Target**

**Tailwind mode** — update `theme.extend` in `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '{colors.primary}',
      surface: '{colors.surface}',
      'surface-secondary': '{colors.surface_secondary}',
      error: '{colors.error}',
      success: '{colors.success}',
      warning: '{colors.warning}',
    },
    fontFamily: {
      sans: ['{typography.font_sans}', 'system-ui', 'sans-serif'],
      mono: ['{typography.font_mono}', 'monospace'],
    },
    spacing: {
      base: '{spacing.base}px',
    },
    borderRadius: {
      sm: '{rounded.sm}',
      DEFAULT: '{rounded.md}',
      lg: '{rounded.lg}',
      full: '{rounded.full}',
    },
  },
},
```

**CSS custom properties mode** — inject into `:root` block in target CSS file:
```css
:root {
  --color-primary: {colors.primary};
  --color-surface: {colors.surface};
  --color-surface-secondary: {colors.surface_secondary};
  --color-error: {colors.error};
  --color-success: {colors.success};
  --color-warning: {colors.warning};
  --color-text-primary: {colors.text_primary};
  --color-text-secondary: {colors.text_secondary};
  --font-sans: '{typography.font_sans}', system-ui, sans-serif;
  --font-mono: '{typography.font_mono}', monospace;
  --spacing-base: {spacing.base}px;
  --rounded-sm: {rounded.sm};
  --rounded-md: {rounded.md};
  --rounded-lg: {rounded.lg};
  --rounded-full: {rounded.full};
}
```

**SCSS mode** — write/update `_variables.scss` (or prepend to first .scss found):
```scss
$color-primary: {colors.primary};
$color-surface: {colors.surface};
$color-surface-secondary: {colors.surface_secondary};
$color-error: {colors.error};
$color-success: {colors.success};
$color-warning: {colors.warning};
$color-text-primary: {colors.text_primary};
$color-text-secondary: {colors.text_secondary};
$font-sans: '{typography.font_sans}', system-ui, sans-serif;
$font-mono: '{typography.font_mono}', monospace;
$spacing-base: {spacing.base}px;
$rounded-sm: {rounded.sm};
$rounded-md: {rounded.md};
$rounded-lg: {rounded.lg};
$rounded-full: {rounded.full};
```

**Step 4 — Conflict Resolution**

For each token that would overwrite an existing non-matching value:
```
AUQ prompt: "Conflict: {token} — current: {current_value} | design.md: {new_value}"
  options:
    - "Override — use design.md value"
    - "Keep — keep current value"
    - "Skip all conflicts"
    - "Override all conflicts"
```

`--force` flag: skip all prompts, override all.

**Step 5 — Report**

```
✅ Synced N tokens to {target_file}
   Colors:      N tokens
   Typography:  N tokens
   Spacing:     N tokens
   Rounded:     N tokens
   Conflicts:   N overridden / N kept / N skipped
```

---

## --audit Flow

**Step 1 — Discover Files**

Find all `.html`, `.css`, `.scss` in project (excluding `node_modules/`, `.git/`, `dist/`, `.next/`, `build/`).

**Step 2 — Read design.md → TOKEN_MAP**

Same as --sync Step 1. If no design.md found: print error and exit.

**Step 3 — Per-File Analysis**

For each file:
- Extract all hex color literals (`#[0-9a-fA-F]{3,8}`) 
- Extract all `font-family:` declarations
- Extract all `border-radius:` values
- Extract CSS var references (`var(--*)`)

Compare against TOKEN_MAP:

| Condition | Severity |
|-----------|----------|
| Uses wrong font-family (not matching `typography.font_sans`) | ❌ Critical |
| Uses hardcoded primary/surface hex (not as CSS var) | ⚠️ Minor |
| Uses unknown color hex not in TOKEN_MAP | ⚠️ Minor |
| Uses correct CSS var (e.g. `var(--color-primary)`) | ✅ Compliant |
| Uses correct design.md hex directly | ✅ Compliant |

**Step 4 — Generate Report Table**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VP-DESIGN ► AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 design.md: {path}
 Files scanned: {N}

┌────────────────────┬──────────┬─────────────┬─────────┬──────────┐
│ File               │ Colors   │ Typography  │ Spacing │ Status   │
├────────────────────┼──────────┼─────────────┼─────────┼──────────┤
│ index.html         │ ✅       │ ⚠️ 1        │ ✅      │ Partial  │
│ style.css          │ ⚠️ 2     │ ✅          │ ✅      │ Partial  │
│ components/btn.css │ ❌ 1     │ ✅          │ ⚠️ 1   │ Critical │
└────────────────────┴──────────┴─────────────┴─────────┴──────────┘

 Summary:
   ❌ Critical:  {N} issues in {N} files
   ⚠️ Minor:     {N} issues in {N} files
   ✅ Compliant: {N} files fully compliant

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 5 — Suggestion**

If any non-compliant files:
> Run `/vp-design --sync` to auto-inject design tokens into your stylesheets.

If all compliant:
> All files are compliant with design.md. No action needed.

---

## --import [brand] Flow

**Step 1 — Resolve Brand**

If `[brand]` arg provided:
- Normalize: lowercase, replace spaces with `-` (e.g. "IBM Carbon" → "ibm-carbon")
- Search awesome-design-md catalog for match (fuzzy: check if arg is substring of known slugs)
- If match found → proceed to Step 2
- If no match → show "Brand not found" + display catalog picker (same as no-arg case)

If no `[brand]` arg:
- Show AUQ catalog picker (same categories as --init Mode B Step 1)

**Step 2 — Fetch Template**

```
URL: https://raw.githubusercontent.com/philschmid/awesome-design-md/main/templates/{brand-slug}/design.md
```

On success: parse YAML front matter + full content.
On failure (404 / network error):
- Print: "Could not fetch {brand} template. Using Q&A fallback."
- Route to --init Mode A

**Step 3 — Preview Token Table**

Same as --init Mode B Step 3.

**Step 4 — Apply Mode**

Same as --init Mode B Step 4 (AUQ: Apply as-is / Customize / Reference only).

---

## Adapter Compatibility

| Adapter | AUQ | Fallback |
|---------|-----|---------|
| Claude Code (terminal) | ✅ AskUserQuestion (preload via ToolSearch) | — |
| Cursor / Codex / Copilot | ❌ | Plain numbered list |

**AUQ preload (ENH-059):** Call `ToolSearch` with `query: "select:AskUserQuestion"` before first prompt.

---

## Notes

- `design.md` is written/read relative to CWD or project root (walk-up detection).
- `--sync` is idempotent: running twice with same design.md produces same output.
- `--audit` is read-only: never modifies files.
- Tokens derived from `design.md` YAML front matter only (not Markdown body).
- awesome-design-md fetch is runtime; requires internet access. Offline: use `--init` Q&A.
