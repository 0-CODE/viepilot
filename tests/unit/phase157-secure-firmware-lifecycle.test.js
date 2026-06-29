const fs = require('fs');

describe('Phase 157 — ENH-109: Secure Firmware Lifecycle', () => {
  const brainstorm = fs.readFileSync('workflows/brainstorm.md', 'utf8');
  const crystallize = fs.readFileSync('workflows/crystallize.md', 'utf8');
  const bsSkill = fs.readFileSync('skills/vp-brainstorm/SKILL.md', 'utf8');
  const crSkill = fs.readFileSync('skills/vp-crystallize/SKILL.md', 'utf8');

  // --- 157.1: Topic probe + safety certs/SBOM ---
  it('157.1 brainstorm.md has a Secure Firmware Lifecycle probe + ## secure_lifecycle', () => {
    expect(brainstorm).toMatch(/Secure Firmware Lifecycle Topic \(ENH-109\)/);
    expect(brainstorm).toMatch(/## secure_lifecycle/);
  });

  it('157.1 secure_lifecycle probe covers bootloader, OTA, signing, key storage, provisioning', () => {
    expect(brainstorm).toMatch(/MCUboot/);
    expect(brainstorm).toMatch(/ECDSA/);
    expect(brainstorm).toMatch(/anti.rollback/i);
    expect(brainstorm).toMatch(/eFuse|TrustZone|ATECC608/);
    expect(brainstorm).toMatch(/provisioning/i);
  });

  it('157.1 safety probe extended with market certifications (FCC/CE/UL/RoHS) + SBOM', () => {
    expect(brainstorm).toMatch(/FCC.*CE.*UL.*RoHS/s);
    expect(brainstorm).toMatch(/SBOM/);
    expect(brainstorm).toMatch(/SPDX|CycloneDX/);
  });

  it('157.1 vp-brainstorm SKILL.md documents ENH-109', () => {
    expect(bsSkill).toMatch(/ENH-109/);
  });

  // --- 157.2: Architect page ---
  it('157.2 brainstorm.md adds the secure-lifecycle.html architect page', () => {
    expect(brainstorm).toMatch(/secure-lifecycle\.html.*Secure Firmware Lifecycle \(ENH-109\)/s);
  });

  it('157.2 Embedded nav links secure-lifecycle.html and count bumped to 7 pages', () => {
    expect(brainstorm).toMatch(/<a href="secure-lifecycle\.html">/);
    expect(brainstorm).toMatch(/All 7 pages below/);
  });

  it('157.2 Page Boundary delineates secure-lifecycle vs memory-layout', () => {
    expect(brainstorm).toMatch(/secure-lifecycle\.html.*Bootloader\/OTA flow/);
  });

  it('157.2 vp-brainstorm SKILL.md lists secure-lifecycle.html and 7 pages', () => {
    expect(bsSkill).toMatch(/secure-lifecycle\.html/);
    expect(bsSkill).toMatch(/7 new Architect workspace pages/);
  });

  // --- 157.3: crystallize export ---
  it('157.3 crystallize exports ## Bootloader & OTA + ## Security Architecture', () => {
    expect(crystallize).toMatch(/## Bootloader & OTA/);
    expect(crystallize).toMatch(/## Security Architecture/);
  });

  it('157.3 secure_lifecycle added to Step 1D item 13 trigger list', () => {
    expect(crystallize).toMatch(/## secure_lifecycle/);
  });

  it('157.3 new security sections are READ-ONLY for vp-auto', () => {
    expect(crystallize).toMatch(/## Bootloader & OTA.*## Security Architecture.*ENH-109/s);
  });

  it('157.3 vp-crystallize SKILL.md documents ENH-109 export', () => {
    expect(crSkill).toMatch(/ENH-109/);
    expect(crSkill).toMatch(/Bootloader & OTA/);
  });
});
