# Phase 106 Spec — ENH-071: vp-brainstorm Embedded Domain Mode

## Goal
Add an **Embedded Domain Mode** to `vp-brainstorm` that activates when an embedded/firmware project is detected (keyword threshold ≥2 or `--domain embedded` flag). The mode adds 6 new Architect workspace pages, embedded-specific topic probes, UI Direction false-positive suppression, firmware phase ordering template, and crystallize exports for 8 new notes.md YAML sections.

## Version
2.39.1 → **2.40.0** (MINOR)

## Request
ENH-071

## Tasks

| Task | Description | Complexity |
|------|-------------|------------|
| 106.1 | `workflows/brainstorm.md` — domain detection + embedded topic probes (MCU/toolchain, RTOS, power, safety) + firmware phase template (Gaps 2, 3, 7, 9, 10) | M |
| 106.2 | `workflows/brainstorm.md` — UI Direction false-positive suppression in embedded domain (Gap 6) | S |
| 106.3 | `workflows/brainstorm.md` — Architect workspace: 6 new embedded pages (hw-topology, pin-map, memory-layout, protocol-matrix, rtos-scheduler, power-budget) (Gaps 1, 4, 5, 8) | M |
| 106.4 | `workflows/crystallize.md` — export 8 embedded notes.md YAML sections to ARCHITECTURE.md | M |
| 106.5 | `skills/vp-brainstorm/SKILL.md` docs + tests (≥12) + CHANGELOG [2.40.0] + version bump | S |

## Dependencies
- FEAT-011 ✅ (Architect Design Mode — 12-page workspace base)
- ENH-029 ✅ (C4/Sequence/Deployment/APIs pages)
- ENH-060 ✅ (UI Direction proactive suggestion — Gap 6 extends this)
- ENH-026 ✅ (background extraction — Gap 6 extends this)

## Acceptance Criteria
- [ ] Embedded domain auto-detected (≥2 embedded keywords)
- [ ] `--domain embedded` flag forces activation
- [ ] 6 new Architect pages added (hw-topology, pin-map, memory-layout, protocol-matrix, rtos-scheduler, power-budget)
- [ ] MCU/toolchain + RTOS + power + safety topic probes added
- [ ] UI Direction false-positive suppression active in embedded domain
- [ ] Firmware phase ordering template offered
- [ ] 8 notes.md YAML sections exported to ARCHITECTURE.md via crystallize
- [ ] `skills/vp-brainstorm/SKILL.md` documents Embedded Domain Mode
- [ ] Unit tests ≥12 pass
- [ ] `package.json` version = `2.40.0`
