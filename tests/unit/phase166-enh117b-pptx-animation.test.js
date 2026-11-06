'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const JSZip = require('jszip');
const PptxGenJS = require('pptxgenjs');
const { applyAnimations, validatePptxAnimations } = require('../../lib/pptx-animate.cjs');
const { countClickCues } = require('../../lib/proposal-script.cjs');

const ROOT = path.resolve(__dirname, '../..');
let tmp;
beforeAll(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vp166-')); });
afterAll(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

async function buildDeck(name) {
  const p = new PptxGenJS();
  const cover = p.addSlide();
  cover.addText('Cover Title', { x: 1, y: 1, w: 8, h: 1 });
  cover.addText('Subtitle', { x: 1, y: 2.5, w: 8, h: 0.6 });
  const content = p.addSlide();
  content.addText('Heading', { x: 0.5, y: 0.3, w: 9, h: 0.8 });
  content.addText('Bullet one', { x: 0.5, y: 1.5, w: 9, h: 0.6 });
  content.addText('Bullet two', { x: 0.5, y: 2.5, w: 9, h: 0.6 });
  content.addText('Bullet three', { x: 0.5, y: 3.5, w: 9, h: 0.6 });
  const closing = p.addSlide();
  closing.addText('Thank you', { x: 1, y: 1, w: 8, h: 1 });
  closing.addText('Contact us', { x: 1, y: 2.5, w: 8, h: 0.6 });
  const file = path.join(tmp, name);
  await p.writeFile({ fileName: file });
  return file;
}
async function slideXml(file, n) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  return zip.file(`ppt/slides/slide${n}.xml`).async('string');
}
const count = (s, re) => (s.match(re) || []).length;

describe('ENH-117b pptx animation', () => {
  test('1. exactly one transition per slide, placed after cSld/clrMapOvr and before timing', async () => {
    const f = await buildDeck('t1.pptx');
    await applyAnimations(f, { transition: 'fade', slides: [{ index: 2, builds: 'auto' }] });
    for (const n of [1, 2, 3]) {
      const x = await slideXml(f, n);
      expect(count(x, /<p:transition\b/g)).toBe(1);
      const t = x.indexOf('<p:transition');
      expect(t).toBeGreaterThan(x.indexOf('</p:cSld>'));
      const cm = x.indexOf('</p:clrMapOvr>');
      if (cm !== -1) expect(t).toBeGreaterThan(cm);
      const tm = x.indexOf('<p:timing');
      if (tm !== -1) expect(t).toBeLessThan(tm);
    }
  });

  test('2. auto builds skip the heading', async () => {
    const f = await buildDeck('t2.pptx');
    await applyAnimations(f, { slides: [{ index: 2, builds: 'auto' }] });
    const x = await slideXml(f, 2);
    const timing = /<p:timing[\s\S]*<\/p:timing>/.exec(x)[0];
    expect(count(timing, /nodeType="clickEffect"/g)).toBe(3);
    const sps = x.match(/<p:sp>[\s\S]*?<\/p:sp>/g);
    const head = sps.find((s) => s.includes('>Heading<'));
    const hid = /<p:cNvPr\b[^>]*\bid="(\d+)"/.exec(head)[1];
    expect(timing).not.toContain(`spid="${hid}"`);
    const res = await validatePptxAnimations(f);
    expect(res.slides.find((s) => s.index === 2).buildCount).toBe(3);
  });

  test('3. headingIndex -1 builds every text shape', async () => {
    const f = await buildDeck('t3.pptx');
    await applyAnimations(f, { slides: [{ index: 2, builds: 'auto', headingIndex: -1 }] });
    const res = await validatePptxAnimations(f);
    expect(res.slides.find((s) => s.index === 2).buildCount).toBe(4);
  });

  test('4. explicit builds array respected', async () => {
    const f = await buildDeck('t4.pptx');
    await applyAnimations(f, { slides: [{ index: 2, builds: [1, 3] }, { index: 1, builds: [0] }] });
    const res = await validatePptxAnimations(f);
    expect(res.slides.find((s) => s.index === 2).buildCount).toBe(2);
    expect(res.slides.find((s) => s.index === 1).buildCount).toBe(1);
    expect(res.slides.find((s) => s.index === 3).buildCount).toBe(0);
  });

  test('5. idempotent', async () => {
    const f = await buildDeck('t5.pptx');
    const plan = { transition: 'push', slides: [{ index: 2, builds: 'auto' }] };
    await applyAnimations(f, plan);
    const first = [1, 2, 3].map((n) => slideXml(f, n));
    const a = await Promise.all(first);
    await applyAnimations(f, plan);
    for (const n of [1, 2, 3]) {
      const x = await slideXml(f, n);
      expect(x).toBe(a[n - 1]);
      expect(count(x, /<p:transition\b/g)).toBe(1);
      expect(count(x, /<p:timing\b/g)).toBeLessThanOrEqual(1);
    }
    expect(count(a[1], /<p:timing\b/g)).toBe(1);
  });

  test('6. validate reports missing transition on un-animated deck', async () => {
    const f = await buildDeck('t6.pptx');
    const res = await validatePptxAnimations(f);
    expect(res.ok).toBe(false);
    expect(res.slides.length).toBe(3);
    expect(res.slides.every((s) => s.hasTransition === false)).toBe(true);
  });

  test('7. unknown preset "spin" is never written', async () => {
    const f = await buildDeck('t7.pptx');
    let threw = false;
    try { await applyAnimations(f, { transition: 'spin', build: 'spin', slides: [{ index: 2, builds: 'auto' }] }); }
    catch (e) { threw = true; }
    if (!threw) {
      for (const n of [1, 2, 3]) expect(await slideXml(f, n)).not.toMatch(/spin/i);
    }
  });

  test('8. re-zipped file loads, keeps content types, slide root well-formed', async () => {
    const f = await buildDeck('t8.pptx');
    await applyAnimations(f, { slides: [{ index: 2, builds: 'auto' }] });
    const zip = await JSZip.loadAsync(fs.readFileSync(f));
    expect(zip.file('[Content_Types].xml')).toBeTruthy();
    for (const n of [1, 2, 3]) {
      const x = await slideXml(f, n);
      expect(count(x, /<p:sld\b/g)).toBe(1);
      expect(count(x, /<\/p:sld>/g)).toBe(1);
      expect(count(x, /<p:timing\b/g)).toBe(count(x, /<\/p:timing>/g));
      expect(count(x, /<p:cSld\b/g)).toBe(count(x, /<\/p:cSld>/g));
    }
  });

  test('9. countClickCues is case-insensitive', () => {
    expect(countClickCues('a [click] b [CLICK] c [Click]')).toBe(3);
    expect(countClickCues('no cues')).toBe(0);
  });

  test('10. workflow docs carry the mandatory animation contract', () => {
    const doc = fs.readFileSync(path.join(ROOT, 'workflows/proposal.md'), 'utf8');
    expect(doc).toContain('Animation (MANDATORY)');
    expect(doc).toContain('await validatePptxAnimations');
    expect(doc).toMatch(/Fail-loud/);
    expect(doc).toMatch(/never silently skip/i);
    expect(doc).toMatch(/`\[click\]`[^\n]*MUST equal[^\n]*build ?Count/);
  });

  const hasSoffice = spawnSync('which', ['soffice']).status === 0;
  (hasSoffice ? test : test.skip)('11. LibreOffice converts animated deck to PDF (skipped: soffice not on PATH)', async () => {
    const f = await buildDeck('t11.pptx');
    await applyAnimations(f, { slides: [{ index: 2, builds: 'auto' }] });
    const r = spawnSync('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', tmp, f]);
    expect(r.status).toBe(0);
  });
});
