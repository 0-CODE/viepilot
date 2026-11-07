'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const env = require('../../lib/proposal-env.cjs');

function fakeHome(skills) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-env-'));
  for (const s of skills) {
    const dir = path.join(home, '.claude', 'skills', 'synced', 'org_abc', s);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: ${s}\ndescription: test\n---\n# ${s}\n`);
  }
  return home;
}

const allDeps = () => true;
const noLibreOffice = (dep, name) => !['soffice', 'pdftoppm'].includes(name);

describe('Phase 172.1 — document skill detection', () => {
  test('finds skills synced under ~/.claude/skills/synced/<org>/<name>/SKILL.md', () => {
    const home = fakeHome(['pptx', 'docx']);
    try {
      const s = env.detectDocumentSkills({ home });
      expect(s.pptx).toMatchObject({ available: true, via: 'disk', name: 'anthropic-skills:pptx' });
      expect(s.docx.available).toBe(true);
      expect(s.xlsx).toMatchObject({ available: false, dir: null, via: null });
    } finally { fs.rmSync(home, { recursive: true, force: true }); }
  });

  test('a SKILL.md with a different name is not mistaken for the document skill', () => {
    const home = fakeHome([]);
    try {
      const dir = path.join(home, '.claude', 'skills', 'pptx');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SKILL.md'), '---\nname: my-pptx-helper\n---\n');
      expect(env.detectDocumentSkills({ home }).pptx.available).toBe(false);
    } finally { fs.rmSync(home, { recursive: true, force: true }); }
  });

  test('skills listed for the session count as available even without a local copy', () => {
    const home = fakeHome([]);
    try {
      const s = env.detectDocumentSkills({ home, sessionSkills: ['anthropic-skills:xlsx'] });
      expect(s.xlsx).toMatchObject({ available: true, via: 'session' });
    } finally { fs.rmSync(home, { recursive: true, force: true }); }
  });
});

describe('Phase 172.1 — dependencies and checks', () => {
  test('every dependency reports a platform hint', () => {
    for (const platform of ['darwin', 'linux', 'win32']) {
      const d = env.detectDependencies({ platform, probe: () => false });
      for (const v of Object.values(d)) {
        expect(v.available).toBe(false);
        expect(typeof v.hint).toBe('string');
        expect(v.hint.length).toBeGreaterThan(5);
      }
    }
  });

  test('missing LibreOffice/Poppler skips visual QA and recalculation with a reason — never a silent pass', () => {
    const home = fakeHome(['pptx', 'docx', 'xlsx', 'pdf']);
    try {
      const a = env.assessEnvironment({ home, probe: noLibreOffice, platform: 'darwin' });
      expect(a.checks.pptxContentQA.canRun).toBe(true);
      expect(a.checks.pptxVisualQA).toMatchObject({ canRun: false });
      expect(a.checks.pptxVisualQA.reason).toMatch(/^skipped — missing soffice, pdftoppm/);
      expect(a.checks.xlsxRecalc.reason).toMatch(/soffice/);
      expect(a.missing.dependencies).toEqual(['soffice', 'pdftoppm']);
    } finally { fs.rmSync(home, { recursive: true, force: true }); }
  });

  test('a missing skill skips its checks with the skill name in the reason', () => {
    const home = fakeHome(['docx']);
    try {
      const a = env.assessEnvironment({ home, probe: allDeps });
      expect(a.checks.pptxFileQA.reason).toBe('skipped — anthropic-skills:pptx unavailable');
      expect(a.checks.docxVerify.canRun).toBe(true);
      expect(a.missing.skills).toEqual(['pptx', 'xlsx', 'pdf']);
    } finally { fs.rmSync(home, { recursive: true, force: true }); }
  });

  test('a throwing probe is treated as unavailable', () => {
    const d = env.detectDependencies({ probe: () => { throw new Error('boom'); } });
    expect(Object.values(d).every((v) => v.available === false)).toBe(true);
  });
});
