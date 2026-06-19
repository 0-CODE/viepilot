const fs = require('fs');

describe('Phase 156 — ENH-106/107/108: Embedded Autonomy Foundation', () => {
  const brainstorm = fs.readFileSync('workflows/brainstorm.md', 'utf8');
  const crystallize = fs.readFileSync('workflows/crystallize.md', 'utf8');
  const bsSkill = fs.readFileSync('skills/vp-brainstorm/SKILL.md', 'utf8');
  const crSkill = fs.readFileSync('skills/vp-crystallize/SKILL.md', 'utf8');
  const qualityGate = fs.readFileSync('agents/claude-code/vp-quality-gate.md', 'utf8');

  // --- ENH-106: Hardware Intake Gate ---
  it('156.1 brainstorm.md has a Hardware Intake Gate (ENH-106)', () => {
    expect(brainstorm).toMatch(/Hardware Intake Gate \(ENH-106\)/);
    expect(brainstorm).toMatch(/## hw_intake/);
  });

  it('156.1 gate is dependency-aware (deferred passes planning, vp-auto blocks dependent tasks)', () => {
    expect(brainstorm).toMatch(/gate_status:\s*deferred/);
    expect(brainstorm).toMatch(/dependency-aware/i);
    // gate must require MCU + toolchain + a hardware ground-truth source
    expect(brainstorm).toMatch(/datasheet|schematic|pin declaration/i);
  });

  it('156.1 vp-brainstorm SKILL.md documents ENH-106', () => {
    expect(bsSkill).toMatch(/ENH-106/);
  });

  // --- ENH-107: Datasheet/Schematic Ingestion ---
  it('156.2 pin map carries a source field (datasheet | schematic | assumed)', () => {
    expect(brainstorm).toMatch(/source:\s*datasheet/i);
    expect(brainstorm).toMatch(/assumed/);
  });

  it('156.2 ingestion v1 is manual + cite; auto-extract is fast-follow (no auto-trust)', () => {
    expect(brainstorm).toMatch(/human confirmation/i);
    expect(brainstorm).toMatch(/auto-trust/i);
  });

  it('156.2 crystallize exports ## Datasheet References + Source column in Hardware Interface', () => {
    expect(crystallize).toMatch(/## Datasheet References/);
    expect(crystallize).toMatch(/\*\*Source\*\*/);
  });

  it('156.2 both SKILL.md files mention ENH-107', () => {
    expect(bsSkill).toMatch(/ENH-107/);
    expect(crSkill).toMatch(/ENH-107/);
  });

  // --- ENH-108: Embedded Verification Contract ---
  it('156.3 crystallize emits a 2-tier embedded verification contract', () => {
    expect(crystallize).toMatch(/Verification \(Embedded — ENH-108\)/);
    expect(crystallize).toMatch(/host-verifiable/i);
    expect(crystallize).toMatch(/hardware-in-loop/i);
  });

  it('156.3 host tier includes register-vs-datasheet + map-size checks', () => {
    expect(crystallize).toMatch(/register-write audit|register write cites/i);
    expect(crystallize).toMatch(/Map-file size|memory_layout/i);
  });

  it('156.3 vp-quality-gate agent handles the ENH-108 marker with HIL human-checkpoint', () => {
    expect(qualityGate).toMatch(/ENH-108/);
    expect(qualityGate).toMatch(/HUMAN-CHECKPOINT/);
  });
});
