# Task 106.4 — crystallize.md: Export 8 Embedded Notes.md YAML Sections

## Objective
Extend `workflows/crystallize.md` Step 1D to export the 8 new embedded-domain YAML sections from notes.md to ARCHITECTURE.md when an embedded project is detected.

## Status: pending

## Paths
workflows/crystallize.md

## File-Level Plan

### `workflows/crystallize.md` — Step 1D extension (after existing items 1–11)

Add item 12 in Step 1D: **Embedded Domain Export (ENH-071)**

```
### Step 1D item 12 — Embedded Domain Export (ENH-071)

If notes.md contains any of: `## hw_topology`, `## pin_map`, `## memory_layout`,
`## protocols`, `## rtos_config`, `## embedded_toolchain`, `## power_budget`, `## safety_config`:

  1. Set `embedded_export: true`
  2. Add to ARCHITECTURE.md (in order):

     **`## Hardware Architecture`** ← from `## hw_topology`
       - MCU/SoC spec table (family, core, flash, RAM)
       - External ICs + bus topology (Mermaid `graph TD` block diagram)
       - Power rails table

     **`## Hardware Interface`** ← from `## pin_map`
       - Pin assignment table (Pin# / GPIO / Function / Peripheral / Direction / Pull / Voltage)
       - Conflicts noted

     **`## Memory Map`** ← from `## memory_layout`
       - Flash regions table (start addr / size / usage)
       - RAM regions table
       - Linker constraints note

     **`## Communication Protocols`** ← from `## protocols`
       - Bus protocol matrix table
       - Wireless/external connectivity table
       - Note: distinct from `## APIs` (HTTP REST) — coexists if both present

     **`## RTOS & Task Model`** ← from `## rtos_config`
       - Execution model (bare-metal / RTOS name)
       - Task table (name / priority / period / stack)
       - ISR table
       - Shared resource protection strategy

     **`## Toolchain & Build System`** ← from `## embedded_toolchain`
       - MCU family + toolchain + build system + debug interface
       - SDK/HAL choice

     **`## Power Budget`** ← from `## power_budget`
       - Power modes table
       - Battery life estimate
       - Sleep strategy summary

     **`## Safety & Reliability`** ← from `## safety_config`
       - Safety standard (if any)
       - Watchdog configuration
       - Fault handler strategy
       - Safe state definition

  3. If `embedded_export: true`, also add to PROJECT-CONTEXT.md:
     `## Embedded Domain: true`
     `## Target MCU: {mcu.family}`
     (used by vp-auto scaffold-first gate to select correct toolchain stack)

  4. ARCHITECTURE.md hardware sections are READ-ONLY for vp-auto (same guard as ui-direction)
     — implementation must reference them, never overwrite them.
```

### Step 7 extension — skip UI Coverage Gate for embedded projects
In Step 7 (component map completeness check), add condition:
```
If PROJECT-CONTEXT.md contains `## Embedded Domain: true`:
  Skip UI Coverage Gate (no web UI components expected)
  Apply Hardware Coverage Check instead:
    - hw-topology peripherals all have a corresponding driver task in the phase plan
    - If peripheral in hw-topology has no driver task: warn (non-blocking)
```

## Acceptance Criteria
- [ ] `## Hardware Architecture` in ARCHITECTURE.md when `hw_topology` present
- [ ] `## Hardware Interface` in ARCHITECTURE.md when `pin_map` present
- [ ] `## Memory Map` in ARCHITECTURE.md when `memory_layout` present
- [ ] `## Communication Protocols` in ARCHITECTURE.md when `protocols` present (distinct from `## APIs`)
- [ ] `## RTOS & Task Model` in ARCHITECTURE.md when `rtos_config` present
- [ ] `## Toolchain & Build System` in ARCHITECTURE.md when `embedded_toolchain` present
- [ ] `## Power Budget` in ARCHITECTURE.md when `power_budget` present
- [ ] `## Safety & Reliability` in ARCHITECTURE.md when `safety_config` present
- [ ] `## Embedded Domain: true` + MCU family written to PROJECT-CONTEXT.md
- [ ] Hardware sections marked READ-ONLY for vp-auto
- [ ] UI Coverage Gate skipped; Hardware Coverage Check (driver task warning) added
