'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const imp = require('../../lib/proposal-import.cjs');
const { detectDocumentSkills } = require('../../lib/proposal-env.cjs');

const SAMPLE = `<!-- Slide number: 1 -->
Why we are here
• First point
• Second point, now sharper

### Notes:
Chào mọi người, hôm nay mình kể về 96% khách hàng.

<!-- Slide number: 2 -->
Numbers

| A | B |
| --- | --- |
| 1 | 2 |

### Notes:
Second slide notes
`;

const MANIFEST = {
  slides: [
    { index: 1, heading: 'Why we are here', bullets: ['First point', 'Second point'], speakerNotes: 'Chào mọi người, hôm nay mình kể về 96% khách hàng.' },
    { index: 2, heading: 'Numbers', bullets: [], speakerNotes: 'Old notes' },
    { index: 3, heading: 'Next steps', bullets: ['Sign'], speakerNotes: 'Close' },
  ],
};

describe('Phase 172.4 — parse slide_text.py output', () => {
  test('splits slides, heading, bullets, tables and notes', () => {
    const slides = imp.parseSlideText(SAMPLE);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toMatchObject({ index: 1, heading: 'Why we are here', bullets: ['First point', 'Second point, now sharper'] });
    expect(slides[0].speakerNotes).toMatch(/96%/);
    expect(slides[1].tables[0]).toMatch(/^\| A \| B \|/);
    expect(slides[1].bullets).toEqual([]);
  });
});

describe('Phase 172.4 — diff and apply', () => {
  const diff = imp.diffAgainstManifest(MANIFEST, imp.parseSlideText(SAMPLE));

  test('lists changed fields per slide and slides removed in the file', () => {
    expect(diff.changed.map((c) => [c.index, c.fields])).toEqual([[1, ['bullets']], [2, ['speakerNotes']]]);
    expect(diff.removed).toEqual([3]);
    expect(diff.added).toEqual([]);
    expect(imp.formatImportDiff(diff)).toMatch(/Slide 1 — bullets[\s\S]*\+ after: {2}First point \| Second point, now sharper/);
  });

  test('applies only the accepted slides and never mutates the original', () => {
    const before = JSON.stringify(MANIFEST);
    const next = imp.applyImport(MANIFEST, diff, [2]);
    expect(next.slides[1].speakerNotes).toBe('Second slide notes');
    expect(next.slides[1].importedFromEdit).toBe(true);
    expect(next.slides[0].bullets).toEqual(['First point', 'Second point']);
    expect(JSON.stringify(MANIFEST)).toBe(before);
    expect(imp.applyImport(MANIFEST, diff, 'all').slides[0].bullets).toEqual(['First point', 'Second point, now sharper']);
  });

  test('no changes → a clear message', () => {
    const same = imp.diffAgainstManifest({ slides: [MANIFEST.slides[0]] }, [{ index: 1, heading: 'Why we are here', bullets: ['First point', 'Second point'], tables: [], speakerNotes: MANIFEST.slides[0].speakerNotes }]);
    expect(imp.formatImportDiff(same)).toBe('No text or speaker-note changes found.');
  });
});

describe('Phase 172.4 — round trip with the real pptx skill script (when available)', () => {
  const pptxSkill = detectDocumentSkills().pptx;
  const python = spawnSync('python3', ['-c', 'import pptx'], { encoding: 'utf8' }).status === 0;
  const run = pptxSkill.available && pptxSkill.dir && python ? test : test.skip;
  run('pptxgenjs deck → slide_text.py → parseSlideText', async () => {
    const PptxGen = require('pptxgenjs');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-import-'));
    try {
      const p = new PptxGen();
      const s = p.addSlide();
      s.addText('Edited title', { x: 0.5, y: 0.3, w: 9, h: 1 });
      s.addText('• One\n• Two', { x: 0.5, y: 1.5, w: 9, h: 3 });
      s.addNotes('Edited notes 42%');
      const deck = path.join(dir, 'd.pptx');
      await p.writeFile({ fileName: deck });
      const r = spawnSync('python3', ['-I', path.join(pptxSkill.dir, 'scripts', 'slide_text.py'), deck], { encoding: 'utf8' });
      expect(r.status).toBe(0);
      const [slide] = imp.parseSlideText(r.stdout);
      expect(slide).toMatchObject({ index: 1, heading: 'Edited title', bullets: ['One', 'Two'], speakerNotes: 'Edited notes 42%' });
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
});
