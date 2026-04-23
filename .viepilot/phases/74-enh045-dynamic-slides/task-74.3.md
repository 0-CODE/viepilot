# Task 74.3 — scripts/gen-proposal-pptx.cjs: Palette-driven + rich layouts

## Objective
Update `scripts/gen-proposal-pptx.cjs` to:
1. Accept a `designConfig.colorPalette` so all layouts are palette-driven (no hardcoded single color)
2. Generate 3 palette variants for `project-proposal` template (modern-tech, enterprise, creative)
3. Add 3 new rich layout functions: `addTimelineGanttSlide`, `addTeamCardSlide`, `addInvestmentVisualSlide`
4. Use the new rich layouts in the `project-proposal` template (replacing plain data slides)
5. Update `workflows/proposal.md` Step 6 to document palette selection and template variant naming

## Paths
- scripts/gen-proposal-pptx.cjs
- workflows/proposal.md

## File-Level Plan

### A. Make palette-driven: refactor `C` to accept palette param

Replace the hardcoded `const C = {...}` with a function:

```js
/** Build colour reference from a designConfig palette (hex strings without #). */
function buildColors(palette) {
  return {
    navy:     palette.primary,
    charcoal: palette.surface,
    accent:   palette.accent,
    highlight:palette.highlight,
    light:    palette.text,
    muted:    palette.muted,
    mutedDim: dimHex(palette.muted),  // darken ~15%
    white:    'FFFFFF',
    dark:     '0d1020',
  };
}

/** Simple hex darkener: reduce each RGB channel by ~15% */
function dimHex(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 38);
  const g = Math.max(0, ((n >> 8)  & 0xff) - 38);
  const b = Math.max(0, (n & 0xff) - 38);
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
```

- Default `C` (used by existing functions when no palette given): the current navy/charcoal values
- Update `makePres()`, `addCoverSlide()`, `addSectionSlide()`, etc. to accept optional `colors` param (defaults to built-in `C`)

### B. Add Layout 6: Timeline Gantt-style

```js
/**
 * Layout 6: Timeline — visual Gantt-bar rows
 * phases: [{ label, duration, note }]
 */
function addTimelineGanttSlide(pres, { heading, phases }, colors = C) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Heading bar
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: colors.charcoal } });
  slide.addText(heading, { x: 0.38, y: 0.12, w: 12.7, h: 0.76,
    fontSize: 22, bold: true, color: colors.light, fontFace: 'Calibri', valign: 'middle' });

  // Gantt bars: evenly spaced rows
  const BAR_START_X = 3.6;
  const BAR_TOTAL_W = 9.0;
  const ROW_H = 0.75;
  const count = Math.min(phases.length, 6);
  phases.slice(0, count).forEach((phase, i) => {
    const y = 1.3 + i * (ROW_H + 0.2);
    // Phase label (left)
    slide.addText(phase.label || `Phase ${i + 1}`, {
      x: 0.3, y, w: 3.2, h: ROW_H,
      fontSize: 13, bold: true, color: colors.light, fontFace: 'Calibri', valign: 'middle',
    });
    // Bar background (full width, muted)
    slide.addShape(pres.ShapeType.rect, {
      x: BAR_START_X, y: y + 0.12, w: BAR_TOTAL_W, h: ROW_H - 0.24,
      fill: { color: colors.charcoal }, line: { color: colors.muted, width: 0.5 },
    });
    // Filled bar portion (evenly distributed)
    const fillW = BAR_TOTAL_W / count;
    slide.addShape(pres.ShapeType.rect, {
      x: BAR_START_X + i * fillW, y: y + 0.12, w: fillW * 0.85, h: ROW_H - 0.24,
      fill: { color: colors.accent }, line: { width: 0 },
    });
    // Duration note
    slide.addText(phase.duration || phase.note || '', {
      x: BAR_START_X + 0.1, y, w: BAR_TOTAL_W, h: ROW_H,
      fontSize: 11, color: colors.light, fontFace: 'Calibri', valign: 'middle',
    });
  });
  return slide;
}
```

### C. Add Layout 7: Team Cards

```js
/**
 * Layout 7: Team — card-based layout
 * members: [{ name, role, note }] — max 4 per slide
 */
function addTeamCardSlide(pres, { heading, members }, colors = C) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Heading bar
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: colors.charcoal } });
  slide.addText(heading, { x: 0.38, y: 0.12, w: 12.7, h: 0.76,
    fontSize: 22, bold: true, color: colors.light, fontFace: 'Calibri', valign: 'middle' });

  const count = Math.min(members.length, 4);
  const CARD_W = (13.33 - 0.5) / count - 0.15;
  members.slice(0, count).forEach((m, i) => {
    const x = 0.25 + i * (CARD_W + 0.15);
    // Card background
    slide.addShape(pres.ShapeType.rect, {
      x, y: 1.3, w: CARD_W, h: 5.5,
      fill: { color: colors.charcoal }, line: { color: colors.accent, width: 1.5 },
    });
    // Accent top bar on card
    slide.addShape(pres.ShapeType.rect, {
      x, y: 1.3, w: CARD_W, h: 0.12, fill: { color: colors.accent },
    });
    // Avatar placeholder circle
    const cx = x + CARD_W / 2;
    slide.addShape(pres.ShapeType.ellipse, {
      x: cx - 0.55, y: 1.55, w: 1.1, h: 1.1,
      fill: { color: colors.accent + '55' }, line: { color: colors.accent, width: 1.5 },
    });
    slide.addText((m.name || 'Member')[0].toUpperCase(), {
      x: cx - 0.55, y: 1.6, w: 1.1, h: 1.0,
      fontSize: 26, bold: true, color: colors.accent, align: 'center', fontFace: 'Calibri',
    });
    // Name
    slide.addText(m.name || '{{Name}}', {
      x, y: 2.8, w: CARD_W, h: 0.55,
      fontSize: 15, bold: true, color: colors.light, align: 'center', fontFace: 'Calibri',
    });
    // Role
    slide.addText(m.role || '{{Role}}', {
      x, y: 3.4, w: CARD_W, h: 0.45,
      fontSize: 12, color: colors.accent, align: 'center', fontFace: 'Calibri',
    });
    // Note
    slide.addText(m.note || '', {
      x: x + 0.1, y: 4.0, w: CARD_W - 0.2, h: 2.5,
      fontSize: 11, color: colors.muted, align: 'center', fontFace: 'Calibri', wrap: true,
    });
  });
  return slide;
}
```

### D. Add Layout 8: Investment Visual

```js
/**
 * Layout 8: Investment — visual bar breakdown
 * items: [{ label, value, note, pct }] — pct = relative bar width 0–100
 */
function addInvestmentVisualSlide(pres, { heading, totalLabel, totalValue, items }, colors = C) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Heading bar
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: colors.charcoal } });
  slide.addText(heading, { x: 0.38, y: 0.12, w: 12.7, h: 0.76,
    fontSize: 22, bold: true, color: colors.light, fontFace: 'Calibri', valign: 'middle' });

  const BAR_X = 4.0;
  const BAR_MAXW = 8.5;
  const ROW_H = 0.65;
  const count = Math.min(items.length, 6);
  items.slice(0, count).forEach((item, i) => {
    const y = 1.3 + i * (ROW_H + 0.25);
    slide.addText(item.label || '', {
      x: 0.3, y, w: 3.5, h: ROW_H,
      fontSize: 13, color: colors.light, fontFace: 'Calibri', valign: 'middle',
    });
    // Background bar
    slide.addShape(pres.ShapeType.rect, {
      x: BAR_X, y: y + 0.1, w: BAR_MAXW, h: ROW_H - 0.2,
      fill: { color: colors.charcoal }, line: { color: colors.muted, width: 0.5 },
    });
    // Filled bar
    const pct = Math.max(0, Math.min(100, item.pct || 50));
    slide.addShape(pres.ShapeType.rect, {
      x: BAR_X, y: y + 0.1, w: BAR_MAXW * pct / 100, h: ROW_H - 0.2,
      fill: { color: colors.accent }, line: { width: 0 },
    });
    // Value label on bar
    slide.addText(item.value || '', {
      x: BAR_X + 0.15, y, w: BAR_MAXW - 0.2, h: ROW_H,
      fontSize: 12, bold: true, color: colors.light, fontFace: 'Calibri', valign: 'middle',
    });
    // Note
    if (item.note) {
      slide.addText(item.note, {
        x: BAR_X + BAR_MAXW * pct / 100 + 0.1, y, w: 2.0, h: ROW_H,
        fontSize: 10, color: colors.muted, fontFace: 'Calibri', valign: 'middle',
      });
    }
  });
  // Total callout bottom
  if (totalLabel && totalValue) {
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 6.6, w: '100%', h: 0.65,
      fill: { color: colors.accent + '33' }, line: { color: colors.accent, width: 1 },
    });
    slide.addText(`${totalLabel}: ${totalValue}`, {
      x: 0.5, y: 6.65, w: 12.4, h: 0.55,
      fontSize: 16, bold: true, color: colors.highlight || colors.accent, fontFace: 'Calibri', valign: 'middle',
    });
  }
  return slide;
}
```

### E. Generate 3 palette variants for project-proposal

In the main generation loop, run `generateTemplate` for all 3 design configs from `lib/proposal-generator.cjs`:

```js
const { DESIGN_CONFIGS } = require('../lib/proposal-generator.cjs');

// Generate 3 palette variants for project-proposal
for (const [styleKey, config] of Object.entries(DESIGN_CONFIGS)) {
  const colors = buildColors(config.colorPalette);
  await generateProjectProposalTemplate(colors, styleKey);
  // outputs: project-proposal-modern-tech.pptx, project-proposal-enterprise.pptx, project-proposal-creative.pptx
}
// Keep existing 4 stock templates for other types (no palette override)
```

File output naming: `{typeId}-{layoutStyle}.pptx` for palette variants:
- `project-proposal-modern-tech.pptx`
- `project-proposal-enterprise.pptx`
- `project-proposal-creative.pptx`

### F. Use rich layouts in project-proposal template

Replace in `TEMPLATES['project-proposal'].slides`:
- Timeline slide: `layout: 'data'` with phase metrics → `layout: 'timeline-gantt'` with phase rows
- Team slide: `layout: 'section'` with team bullets → `layout: 'team-card'` with member cards
- Investment slide: `layout: 'data'` with 3 metrics → `layout: 'investment-visual'` with bar breakdown

### G. Update workflows/proposal.md Step 6

Add palette template selection note:
```
**Template selection (ENH-045):**
- Read `manifest.designConfig.layoutStyle`
- If `project-proposal` and layoutStyle known: use `project-proposal-{layoutStyle}.pptx`
- Fallback: `project-proposal.pptx` (modern-tech default)
- Other types: use existing stock template (palette variants not yet generated for non-project-proposal)
```

## Verification
```bash
node scripts/gen-proposal-pptx.cjs
# Should output project-proposal-modern-tech.pptx, project-proposal-enterprise.pptx,
#   project-proposal-creative.pptx alongside existing templates

ls templates/proposal/pptx/*.pptx
# Should include the 3 new palette variants + existing 4 stock templates
```

## Acceptance Criteria
- [ ] `buildColors(palette)` function created — converts designConfig palette to C-compatible object
- [ ] `addTimelineGanttSlide(pres, { heading, phases }, colors)` exported via generation
- [ ] `addTeamCardSlide(pres, { heading, members }, colors)` exported via generation
- [ ] `addInvestmentVisualSlide(pres, { heading, totalLabel, totalValue, items }, colors)` exported via generation
- [ ] 3 palette variant PPTX files generated for `project-proposal`
- [ ] `project-proposal` template uses timeline-gantt, team-card, investment-visual layouts
- [ ] `workflows/proposal.md` Step 6 documents palette template selection
- [ ] `node scripts/gen-proposal-pptx.cjs` runs without error
- [ ] Existing 4 stock templates still generated (no regression)
