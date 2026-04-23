# Task 106.2 — brainstorm.md: UI Direction False-Positive Suppression (Gap 6)

## Objective
Prevent the UI Direction background extractor (ENH-026) and proactive suggestion banner (ENH-060) from firing on embedded hardware display keywords (`LCD`, `OLED`, `display`, `screen`, `touch`) when `embedded_domain: true`. Route these signals to `hw-topology` peripherals instead.

## Status: pending

## Paths
workflows/brainstorm.md

## File-Level Plan

### `workflows/brainstorm.md` — Background UI Extraction gate (ENH-026 extension)

In the **Background UI Extraction** section (`## Background UI Extraction (ENH-026)`), add a domain-aware filter before the keyword accumulation buffer:

```
### Embedded Domain UI Suppression (ENH-071 Gap 6)

If `embedded_domain: true`:

  For each UI signal keyword detected (display / screen / LCD / OLED / touch / UI / interface):
    Check context for embedded hardware indicator:
      Hardware counter-keywords: GPIO / SPI / I2C / driver / framebuffer / ILI9341 / SSD1306 /
                                 ST7789 / HX8357 / RA8875 / E-Ink / EPD / TFT / 7-segment
    
    If hardware context confirmed:
      → Do NOT add to UI Direction buffer
      → Add as peripheral to hw-topology accumulation buffer instead:
        { type: "display", interface: "SPI/I2C/parallel", part: "{detected_part}" }
      → Log: "Display keyword suppressed from UI Direction — added to hw-topology peripherals"
    
    Else (no hardware context, ambiguous):
      → Add to UI Direction buffer normally (user may be describing a dashboard/web UI)
      → Add note: "Verify if this is hardware display or web UI"

**Proactive UI Direction suggestion banner (ENH-060)**:
  If `embedded_domain: true` AND ≥5 UI signals all have hardware context:
    → Suppress the "🎨 UI Direction mode?" banner entirely
    → Instead: add reminder "Hardware displays detected — will appear in hw-topology page"
  If signals are ambiguous (mixed hardware + web context):
    → Show banner but include note: "Detected embedded context — confirm if web UI intended"
```

## Acceptance Criteria
- [ ] LCD/OLED/display keywords with hardware context do NOT trigger UI Direction buffer
- [ ] Hardware display keywords DO appear in hw-topology peripherals accumulation
- [ ] UI Direction banner suppressed when all display signals are hardware-context
- [ ] Ambiguous signals (no hardware context) still flow to UI Direction normally
- [ ] Suppression only active when `embedded_domain: true`
