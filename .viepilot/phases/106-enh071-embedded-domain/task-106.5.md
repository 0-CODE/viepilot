# Task 106.5 — SKILL.md Docs + Tests (≥12) + CHANGELOG + Version Bump

## Objective
Document the Embedded Domain Mode in `skills/vp-brainstorm/SKILL.md`, write ≥12 unit tests covering detection, page triggers, suppression, and crystallize exports, then ship CHANGELOG [2.40.0] and bump version.

## Status: done

## Paths
skills/vp-brainstorm/SKILL.md
tests/unit/phase106-enh071-embedded-domain.test.js
CHANGELOG.md
package.json

## File-Level Plan

### `skills/vp-brainstorm/SKILL.md`
Add to `<context>` flags section:
```
- `--domain embedded` : Force-activate Embedded Domain Mode
```

Add new section `### Embedded Domain Mode (ENH-071)` after the existing Architect Design Mode section:

```markdown
### Embedded Domain Mode (ENH-071)

Automatically activated when ≥2 embedded keywords appear in the session (MCU families:
STM32 / ESP32 / nRF52 / AVR / RISC-V; concepts: firmware / bare-metal / GPIO / RTOS /
interrupt / HAL / bootloader). Forced with `--domain embedded`.

**One-time activation banner** shown at detection.

**Embedded-specific topic probes added:**
- MCU/Toolchain: MCU family, toolchain (GCC-ARM/Keil/IAR), build system (CMake/PlatformIO/West),
  debug interface (SWD/JTAG), flasher, SDK/HAL
- RTOS/Scheduling: bare-metal vs RTOS choice, task list, ISR table, resource protection
- Power Budget: supply type, sleep modes, battery life target (triggered by power keywords)
- Safety/Compliance: IEC 61508/ISO 26262/DO-178C, watchdog, fault handlers (triggered by safety keywords)
- Firmware Phase Template: Board Bring-Up → Drivers → RTOS → Middleware → Application → OTA

**6 new Architect workspace pages (in `.viepilot/ui-direction/{session}/pages/`):**
| Page | Trigger | Content |
|------|---------|---------|
| `hw-topology.html` | Always in embedded domain | MCU block diagram + peripheral/bus/component tables |
| `pin-map.html` | GPIO/pin keywords | Pin assignment table |
| `memory-layout.html` | Flash/RAM/bootloader keywords | Flash/RAM regions + linker constraints |
| `protocol-matrix.html` | Bus/wireless protocol keywords | Bus protocol + wireless connectivity tables |
| `rtos-scheduler.html` | RTOS/task/scheduler keywords | Task table + ISR table |
| `power-budget.html` | Battery/sleep/power keywords | Power modes + battery life estimate |

**UI Direction false-positive suppression:**
Hardware display keywords (LCD / OLED / TFT / SSD1306 / ILI9341) in hardware context
are routed to `hw-topology` peripherals, NOT the UI Direction buffer. Banner suppressed.

**notes.md YAML sections written:** `## hw_topology`, `## pin_map`, `## memory_layout`,
`## protocols`, `## rtos_config`, `## embedded_toolchain`, `## power_budget`, `## safety_config`

**crystallize exports:** All 8 sections → ARCHITECTURE.md hardware sections.
`## Embedded Domain: true` written to PROJECT-CONTEXT.md.
UI Coverage Gate skipped; Hardware Coverage Check (driver-task completeness) applied instead.
```

### `tests/unit/phase106-enh071-embedded-domain.test.js`

Test groups and cases (≥12):

**Group 1: Domain Detection**
- Keyword count < 2 → `embedded_domain` NOT set
- Keyword count ≥ 2 (STM32 + GPIO) → `embedded_domain: true`
- Single MCU keyword alone → NOT activated
- `--domain embedded` flag → activated regardless of keyword count
- Activation banner text present in brainstorm.md

**Group 2: Topic Probes**
- MCU/toolchain probes section present in brainstorm.md
- RTOS/scheduling topic section present in brainstorm.md
- Power budget topic triggered by battery/sleep keywords
- Safety topic triggered by IEC/ASIL keywords
- Firmware phase template section present

**Group 3: UI Direction Suppression**
- Suppression gate present in brainstorm.md (embedded_domain check before UI buffer)
- Hardware counter-keyword list includes SSD1306, ILI9341, TFT

**Group 4: Architect Pages**
- `hw-topology.html` trigger defined in brainstorm.md
- `pin-map.html` trigger defined
- `memory-layout.html` trigger defined
- `protocol-matrix.html` trigger defined (distinct from apis.html)
- `rtos-scheduler.html` trigger defined
- `power-budget.html` trigger defined

**Group 5: crystallize exports**
- Step 1D item 12 present in crystallize.md
- `## Hardware Architecture` export instruction present
- `## Embedded Domain: true` PROJECT-CONTEXT.md write instruction present
- UI Coverage Gate skip condition for embedded domain present
- Hardware Coverage Check (driver task warning) instruction present

**Group 6: SKILL.md documentation**
- `--domain embedded` flag documented in SKILL.md
- `### Embedded Domain Mode (ENH-071)` section present
- All 6 new pages listed in SKILL.md table

### `CHANGELOG.md`
Add `## [2.40.0] - 2026-04-23` section:
- ENH-071 Embedded Domain Mode for vp-brainstorm (domain detection, 6 Architect pages, topic probes, UI suppression, firmware phase template, crystallize exports)

### `package.json`
- `"version": "2.39.1"` → `"version": "2.40.0"`

## Acceptance Criteria
- [ ] `skills/vp-brainstorm/SKILL.md` documents Embedded Domain Mode with all 6 pages
- [ ] `--domain embedded` flag documented
- [ ] Unit tests ≥12, all pass
- [ ] `npm test` 0 failures
- [ ] `package.json` version = `2.40.0`
- [ ] `CHANGELOG.md` has `[2.40.0]` entry
