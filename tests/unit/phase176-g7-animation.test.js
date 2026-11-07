'use strict';

const PptxGenJS = require('pptxgenjs');
const JSZip = require('jszip');
const anim = require('../../lib/pptx-animate.cjs');

async function deckWithSlideNumber() {
  const pres = new PptxGenJS();
  pres.defineSlideMaster({ title: 'CONTENT', slideNumber: { x: 9, y: 5.2, w: 0.6, h: 0.3 }, objects: [] });
  const s = pres.addSlide({ masterName: 'CONTENT' });
  s.addText('Heading', { x: 0.5, y: 0.3, w: 9, h: 0.8 });
  s.addText('Point one', { x: 0.5, y: 1.5, w: 9, h: 0.6 });
  s.addText('Point two', { x: 0.5, y: 2.3, w: 9, h: 0.6 });
  s.slideNumber = { x: 9, y: 5.2, w: 0.6, h: 0.3 };
  return pres.write({ outputType: 'nodebuffer' });
}

describe('BUG-035 G7 — builds and packaging', () => {
  test("'auto' builds skip the slide-number placeholder", async () => {
    const buf = await anim.applyAnimations(await deckWithSlideNumber(), { slides: [{ index: 1, builds: 'auto' }] });
    const xml = await (await JSZip.loadAsync(buf)).file('ppt/slides/slide1.xml').async('string');
    expect(xml).toMatch(/type="sldNum"/);
    expect((xml.match(/nodeType="clickEffect"/g) || []).length).toBe(2);
  });

  test('validator compares builds with [click] cues from the manifest', async () => {
    const buf = await anim.applyAnimations(await deckWithSlideNumber(), { slides: [{ index: 1, builds: 'auto' }] });
    const good = await anim.validatePptxAnimations(buf, { manifest: { slides: [{ index: 1, speakerNotes: 'a [click] b [click] c' }] } });
    expect(good.ok).toBe(true);
    const bad = await anim.validatePptxAnimations(buf, { manifest: { slides: [{ index: 1, speakerNotes: 'a [click] b' }] } });
    expect(bad.ok).toBe(false);
    expect(bad.slides[0]).toMatchObject({ buildCount: 2, clickCues: 1, mismatch: true });
  });

  test('animated output and stripZipDirs leave no directory entries', async () => {
    const raw = await deckWithSlideNumber();
    const rawDirs = Object.values((await JSZip.loadAsync(raw)).files).filter((f) => f.dir).length;
    const { buffer, removed } = await anim.stripZipDirs(raw);
    expect(removed).toBe(rawDirs);
    const zip = await JSZip.loadAsync(buffer);
    expect(Object.values(zip.files).filter((f) => f.dir)).toHaveLength(0);
    expect(Object.keys(zip.files)[0]).toBe('[Content_Types].xml');
    const animated = await anim.applyAnimations(raw, { slides: [{ index: 1, builds: 'auto' }] });
    expect((await anim.validatePptxAnimations(animated)).dirEntries).toBe(0);
  });
});
