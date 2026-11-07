'use strict';

const fs = require('fs');
const path = require('path');
const gates = require('../../lib/proposal-gates.cjs');

const ROOT = path.join(__dirname, '..', '..');
const WF = fs.readFileSync(path.join(ROOT, 'workflows', 'proposal.md'), 'utf8');
const SKILL = fs.readFileSync(path.join(ROOT, 'skills', 'vp-proposal', 'SKILL.md'), 'utf8');
const CONTRACT = fs.readFileSync(path.join(ROOT, 'templates', 'proposal', 'prompt-contract.md'), 'utf8');
const pos = (name) => WF.indexOf(`<step name="${name}">`);
const step = (name) => WF.slice(pos(name), WF.indexOf('</step>', pos(name)));

describe('Phase 173.5 — outline, inventory and content map come before any slide content', () => {
  test('order: quality_brief < outline_gate < source_inventory < content_map < manifest_generation', () => {
    const order = ['quality_brief', 'outline_gate', 'source_inventory', 'content_map', 'manifest_generation'].map(pos);
    expect(order.every((p) => p > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test('outline gate approves key message and outline; generation is blocked until approval', () => {
    const seg = step('outline_gate');
    for (const w of ['buildOutline', 'validateOutline', 'formatOutline', 'key message', 'outline.json', 'blocked until the outline is approved']) expect(seg).toContain(w);
  });

  test('inventory never reads sensitive files; content map enforces the decisions', () => {
    expect(step('source_inventory')).toMatch(/by path only[\s\S]*readableSources/);
    const cm = step('content_map');
    for (const w of ['FIT', 'TRANSFORM', 'DROP', 'SENSITIVE', 'BACKSTAGE', 'never invent', 'summarizeContentMap']) expect(cm).toContain(w);
  });

  test('manifest generation is restricted to the Content Map', () => {
    expect(step('manifest_generation')).toMatch(/validateManifestAgainstMap/);
  });
});

describe('Phase 173.5 — curation check runs before rendering', () => {
  test('after the script, before template resolution and pptx generation', () => {
    expect(pos('spoken_script')).toBeLessThan(pos('curation_check'));
    expect(pos('curation_check')).toBeLessThan(pos('template_resolution'));
    expect(pos('curation_check')).toBeLessThan(pos('generate_pptx'));
  });

  test('uses both detectors, the material rule, backstage.md and the leak check', () => {
    const seg = step('curation_check');
    for (const w of ['detectProcessLeak', 'detectDevNotes', 'enforceMaterialRule', 'buildBackstage', 'findBackstageLeaks', 'fail-loud', 'Backstage Editor (#31)']) expect(seg).toContain(w);
  });

  test('council uses selectCouncil so #31 observes every review', () => {
    expect(step('persona_review_council')).toMatch(/selectCouncil\(/);
  });

  test('gates registered, inventory table in sync, workflow fully gated', () => {
    for (const s of ['outline_gate', 'source_inventory', 'content_map', 'curation_check']) {
      expect(gates.GATES.map((g) => g.step)).toContain(s);
    }
    const rows = [...WF.slice(WF.indexOf('### Gate inventory')).matchAll(/^\| ([a-z_]+) \|/gm)].map((m) => m[1]);
    expect(rows.sort()).toEqual(gates.GATES.map((g) => g.step).sort());
    expect(gates.lintWorkflowGates(WF)).toEqual([]);
  });

  test('an older proposal is upgraded through the new curation gates', () => {
    const plan = gates.upgradePlan({ viepilotVersion: '3.19.0' }, '3.21.0');
    expect(plan.missing).toEqual(expect.arrayContaining(['outline_gate', 'source_inventory', 'content_map', 'curation_check']));
    expect(plan.changed).toEqual(expect.arrayContaining(['manifest_generation', 'persona_review_council']));
  });
});

describe('Phase 173.5 — prompt contract and SKILL', () => {
  test('prompt contract says a proposal is not a process narrative', () => {
    expect(CONTRACT).toMatch(/## Proposal, not process/);
    expect(CONTRACT).toMatch(/Content Map/);
  });

  test('SKILL documents outline-first, content map, backstage and the source flags', () => {
    for (const w of ['outline first', 'Content Map', 'backstage.md', 'Backstage Editor (#31', '--source <glob>', '--exclude <glob>']) expect(SKILL).toContain(w);
  });
});
