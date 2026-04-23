'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const BRAINSTORM_MD = path.join(REPO_ROOT, 'workflows', 'brainstorm.md');
const CRYSTALLIZE_MD = path.join(REPO_ROOT, 'workflows', 'crystallize.md');
const SKILL_MD = path.join(REPO_ROOT, 'skills', 'vp-brainstorm', 'SKILL.md');

let brainstorm, crystallize, skill;
beforeAll(() => {
  brainstorm = fs.readFileSync(BRAINSTORM_MD, 'utf8');
  crystallize = fs.readFileSync(CRYSTALLIZE_MD, 'utf8');
  skill = fs.readFileSync(SKILL_MD, 'utf8');
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: Domain Detection (ENH-071)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-071: Embedded Domain Detection', () => {
  test('embedded_domain detection step present in brainstorm.md', () => {
    expect(brainstorm).toContain('detect_embedded_domain');
  });

  test('activation rule: ≥2 keyword matches defined', () => {
    expect(brainstorm).toMatch(/≥2.*keyword/i);
  });

  test('--domain embedded flag documented in brainstorm.md', () => {
    expect(brainstorm).toContain('--domain embedded');
  });

  test('MCU family keyword list present (STM32, ESP32, nRF52)', () => {
    expect(brainstorm).toContain('STM32');
    expect(brainstorm).toContain('ESP32');
    expect(brainstorm).toContain('nRF52');
  });

  test('concept keyword list present (firmware, bare-metal, GPIO)', () => {
    expect(brainstorm).toContain('firmware');
    expect(brainstorm).toContain('bare-metal');
    expect(brainstorm).toContain('GPIO');
  });

  test('activation banner text present', () => {
    expect(brainstorm).toContain('Embedded Domain Mode activated');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: Topic Probes (ENH-071 Gaps 2, 3, 7, 9, 10)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-071: Embedded Topic Probes', () => {
  test('MCU/Toolchain sub-topic probes present (Gap 2)', () => {
    expect(brainstorm).toContain('MCU/Toolchain');
    expect(brainstorm).toContain('GCC-ARM');
    expect(brainstorm).toContain('PlatformIO');
  });

  test('RTOS/Scheduling topic present (Gap 3)', () => {
    expect(brainstorm).toContain('RTOS & Scheduling');
    expect(brainstorm).toContain('FreeRTOS');
    expect(brainstorm).toContain('rtos_config');
  });

  test('Power Budget topic present (Gap 7)', () => {
    expect(brainstorm).toContain('Power Budget');
    expect(brainstorm).toContain('power_budget');
    expect(brainstorm).toContain('mAh');
  });

  test('Safety/Compliance topic present (Gap 10)', () => {
    expect(brainstorm).toContain('Safety & Compliance');
    expect(brainstorm).toContain('IEC 61508');
    expect(brainstorm).toContain('safety_config');
  });

  test('Firmware Phase Template present (Gap 9)', () => {
    expect(brainstorm).toContain('Firmware Phase Template');
    expect(brainstorm).toContain('Board Bring-Up');
    expect(brainstorm).toContain('Driver Layer');
    expect(brainstorm).toContain('domain: embedded');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: UI Direction False-Positive Suppression (ENH-071 Gap 6)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-071: UI Direction Suppression in Embedded Domain', () => {
  test('suppression gate references embedded_domain check', () => {
    expect(brainstorm).toContain('Embedded Domain UI Suppression');
  });

  test('hardware counter-keyword list includes SSD1306 and ILI9341', () => {
    expect(brainstorm).toContain('SSD1306');
    expect(brainstorm).toContain('ILI9341');
  });

  test('hardware display keywords route to hw_topology_buffer', () => {
    expect(brainstorm).toContain('hw_topology_buffer');
  });

  test('ENH-060 early-session banner only fires when embedded_domain NOT active', () => {
    const earlySection = brainstorm.slice(brainstorm.indexOf('Early-session detection (ENH-060)'));
    expect(earlySection).toMatch(/embedded_domain.*NOT.*active|NOT.*active.*embedded_domain/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 4: 6 Embedded Architect Pages (ENH-071 Gaps 1, 4, 5, 8)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-071: Embedded Architect Workspace Pages', () => {
  test('hw-topology.html page defined in brainstorm.md (Gap 1)', () => {
    expect(brainstorm).toContain('hw-topology.html');
  });

  test('pin-map.html page defined in brainstorm.md (Gap 4)', () => {
    expect(brainstorm).toContain('pin-map.html');
  });

  test('memory-layout.html page defined in brainstorm.md (Gap 5)', () => {
    expect(brainstorm).toContain('memory-layout.html');
  });

  test('protocol-matrix.html page defined in brainstorm.md (Gap 8)', () => {
    expect(brainstorm).toContain('protocol-matrix.html');
  });

  test('rtos-scheduler.html page defined in brainstorm.md', () => {
    expect(brainstorm).toContain('rtos-scheduler.html');
  });

  test('power-budget.html page defined in brainstorm.md', () => {
    expect(brainstorm).toContain('power-budget.html');
  });

  test('all 6 embedded pages in index.html Embedded nav section', () => {
    const navSection = brainstorm.slice(brainstorm.indexOf('Embedded Workspace Layout'));
    expect(navSection).toContain('hw-topology.html');
    expect(navSection).toContain('pin-map.html');
    expect(navSection).toContain('memory-layout.html');
    expect(navSection).toContain('protocol-matrix.html');
    expect(navSection).toContain('rtos-scheduler.html');
    expect(navSection).toContain('power-budget.html');
  });

  test('protocol-matrix.html is distinct from apis.html (coexistence rule)', () => {
    expect(brainstorm).toContain('Coexistence rule');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 5: crystallize.md Embedded Domain Export (ENH-071)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-071: crystallize Embedded Domain Export', () => {
  test('Step 1D item 13 Embedded Domain Export present', () => {
    expect(crystallize).toContain('Embedded Domain Export (ENH-071)');
  });

  test('## Hardware Architecture export instruction present', () => {
    expect(crystallize).toContain('## Hardware Architecture');
    expect(crystallize).toContain('hw_topology');
  });

  test('## Hardware Interface export instruction present', () => {
    expect(crystallize).toContain('## Hardware Interface');
    expect(crystallize).toContain('pin_map');
  });

  test('## Memory Map export instruction present', () => {
    expect(crystallize).toContain('## Memory Map');
    expect(crystallize).toContain('memory_layout');
  });

  test('## Communication Protocols export (distinct from ## APIs)', () => {
    expect(crystallize).toContain('## Communication Protocols');
    expect(crystallize).toContain('protocols');
    expect(crystallize).toContain("See `## APIs`");
  });

  test('## Embedded Domain written to PROJECT-CONTEXT.md', () => {
    expect(crystallize).toContain('embedded: true');
    expect(crystallize).toContain('target_mcu');
  });

  test('Hardware sections READ-ONLY guard for vp-auto', () => {
    expect(crystallize).toContain('READ-ONLY for `vp-auto`');
  });

  test('UI Coverage Gate skipped when embedded domain active', () => {
    expect(crystallize).toContain('Skip');
    expect(crystallize).toContain('embedded: true');
    expect(crystallize).toContain('Hardware Coverage Check');
  });

  test('Hardware Coverage Check (non-blocking driver task warning) present', () => {
    expect(crystallize).toContain('Hardware Coverage');
    expect(crystallize).toContain('no driver task found');
    expect(crystallize).toContain('non-blocking');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 6: SKILL.md Documentation (ENH-071)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-071: SKILL.md Documentation', () => {
  test('Embedded Domain Mode documented in SKILL.md', () => {
    expect(skill).toContain('Embedded Domain Mode (ENH-071)');
  });

  test('--domain embedded flag documented in SKILL.md context flags', () => {
    expect(skill).toContain('--domain embedded');
  });

  test('all 6 new pages listed in SKILL.md table', () => {
    expect(skill).toContain('hw-topology.html');
    expect(skill).toContain('pin-map.html');
    expect(skill).toContain('memory-layout.html');
    expect(skill).toContain('protocol-matrix.html');
    expect(skill).toContain('rtos-scheduler.html');
    expect(skill).toContain('power-budget.html');
  });

  test('UI Direction suppression documented in SKILL.md', () => {
    expect(skill).toContain('false-positive suppression');
    expect(skill).toContain('hardware context');
  });
});
