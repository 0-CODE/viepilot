# Phase 106 Summary — ENH-071: vp-brainstorm Embedded Domain Mode

## Result
✅ Complete — v2.40.0

## What Was Done

Added **Embedded Domain Mode** to `vp-brainstorm` — activates when ≥2 embedded trigger keywords detected or via `--domain embedded` flag. Addresses all 10 gaps identified for embedded/firmware projects.

**`workflows/brainstorm.md`** — 3 additions:

1. **`<step name="detect_embedded_domain">`** (Step 0B, inserted after Step 0):
   - Keyword detection: MCU families (STM32/ESP32/nRF52/AVR/RISC-V/RP2040) + firmware concepts (GPIO/RTOS/bare-metal/HAL/bootloader/interrupt)
   - Activation rule: ≥2 matches → `embedded_domain: true`; `--domain embedded` flag → unconditional
   - One-time `🔌 Embedded Domain Mode activated` banner
   - 5 topic probe blocks: MCU/Toolchain (Gap 2), RTOS/Scheduling (Gap 3), Power Budget (Gap 7), Safety/Compliance (Gap 10), Firmware Phase Template (Gap 9)

2. **Embedded Domain UI Suppression** (inside Background UI Extraction section, ENH-026 extension):
   - Hardware display keywords (LCD/OLED/TFT/touch) with hardware context → `hw_topology_buffer`, NOT `ui_idea_buffer`
   - Hardware counter-keywords: ILI9341, SSD1306, ST7789, LVGL, u8g2, etc.
   - `🎨 UI Direction Mode?` banner suppressed when all signals have hardware context (Gap 6)
   - ENH-060 early-session banner only fires when `embedded_domain` NOT active

3. **6 new Architect workspace pages** (Embedded Domain Architect Pages section):
   - `hw-topology.html` — MCU block diagram (Mermaid graph TD) + component/bus/power-rail tables (Gap 1)
   - `pin-map.html` — Pin assignment table + conflict detection (Gap 4)
   - `memory-layout.html` — Flash/RAM regions + linker constraints (Gap 5)
   - `protocol-matrix.html` — Bus + wireless protocol matrix, distinct from apis.html (Gap 8)
   - `rtos-scheduler.html` — Task priority table + ISR table (Gap 3 visual)
   - `power-budget.html` — Power modes + battery life estimate (Gap 7 visual)
   - `index.html` hub Embedded nav section links all 6 pages

**`workflows/crystallize.md`** — 2 additions:
- Step 1D item 13: exports 8 YAML sections (`hw_topology`, `pin_map`, `memory_layout`, `protocols`, `rtos_config`, `embedded_toolchain`, `power_budget`, `safety_config`) to ARCHITECTURE.md hardware sections; writes `## Embedded Domain: true` + MCU family to PROJECT-CONTEXT.md; hardware sections READ-ONLY for vp-auto
- Step 7 embedded path: skips UI Coverage Gate; applies non-blocking Hardware Coverage Check (driver-task completeness warning); auto-adds Board Bring-Up Phase 1 task

**`skills/vp-brainstorm/SKILL.md`**:
- `--domain embedded` flag added to context flags list
- `### Embedded Domain Mode (ENH-071)` section: activation rule, 5 topic probes, 6-page table, UI suppression behavior, notes.md YAML sections, crystallize exports summary

## Test Results
1558 tests, 74 suites — all pass (36 new tests in phase106-enh071-embedded-domain.test.js)
