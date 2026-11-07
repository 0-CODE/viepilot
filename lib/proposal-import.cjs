'use strict';

/**
 * Import hand edits from a .pptx back into the slide manifest (ENH-126 + ENH-127).
 *
 * Input is the markdown printed by the pptx document skill's `scripts/slide_text.py` (one block per
 * slide under `<!-- Slide number: N -->`, speaker notes under `### Notes:`, tables as markdown).
 * `diffAgainstManifest` lists what the user changed; `applyImport` writes only the slides the user
 * accepted into a new manifest object (the original is not mutated).
 *
 * Zero dependencies.
 */

const BULLET = /^\s*(?:[•\-*▪◦‣]|\d+[.)])\s+/;

/**
 * @param {string} text slide_text.py output
 * @returns {{index: number, heading: string, bullets: string[], tables: string[], speakerNotes: string}[]}
 */
function parseSlideText(text) {
  const slides = [];
  const parts = String(text || '').split(/<!--\s*Slide number:\s*(\d+)\s*-->/);
  for (let i = 1; i < parts.length; i += 2) {
    const index = Number(parts[i]);
    const block = parts[i + 1] || '';
    const [bodyRaw, notesRaw = ''] = block.split(/^###\s*Notes:\s*$/m);
    const lines = bodyRaw.split('\n').map((l) => l.trimEnd());
    const tables = [];
    const content = [];
    let table = [];
    for (const line of lines) {
      if (/^\s*\|.*\|\s*$/.test(line)) { table.push(line.trim()); continue; }
      if (table.length) { tables.push(table.join('\n')); table = []; }
      if (line.trim()) content.push(line.trim());
    }
    if (table.length) tables.push(table.join('\n'));
    const [heading = '', ...rest] = content;
    slides.push({
      index,
      heading: heading.replace(BULLET, ''),
      bullets: rest.map((l) => l.replace(BULLET, '')),
      tables,
      speakerNotes: notesRaw.trim(),
    });
  }
  return slides.sort((a, b) => a.index - b.index);
}

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const bulletsOf = (slide) => (Array.isArray(slide.bullets) ? slide.bullets : slide.body ? String(slide.body).split('\n') : []).map(norm).filter(Boolean);

/**
 * @param {{slides: object[]}} manifest
 * @param {ReturnType<typeof parseSlideText>} edited
 * @returns {{changed: {index:number, fields:string[], before:object, after:object}[], added: number[], removed: number[], unchanged: number[]}}
 */
function diffAgainstManifest(manifest, edited) {
  const byIndex = new Map((manifest.slides || []).map((s, i) => [s.index || i + 1, s]));
  const editedBy = new Map(edited.map((s) => [s.index, s]));
  const changed = []; const unchanged = [];
  for (const [index, orig] of byIndex) {
    const e = editedBy.get(index);
    if (!e) continue;
    const fields = [];
    if (norm(orig.heading) !== norm(e.heading)) fields.push('heading');
    if (JSON.stringify(bulletsOf(orig)) !== JSON.stringify(e.bullets.map(norm))) fields.push('bullets');
    if (norm(orig.speakerNotes) !== norm(e.speakerNotes)) fields.push('speakerNotes');
    if (fields.length) {
      changed.push({
        index,
        fields,
        before: Object.fromEntries(fields.map((f) => [f, f === 'bullets' ? bulletsOf(orig) : orig[f] || ''])),
        after: Object.fromEntries(fields.map((f) => [f, e[f]])),
      });
    } else unchanged.push(index);
  }
  const added = edited.map((s) => s.index).filter((i) => !byIndex.has(i));
  const removed = [...byIndex.keys()].filter((i) => !editedBy.has(i));
  return { changed, added, removed, unchanged };
}

/** Human-readable diff for the AskUserQuestion import gate. */
function formatImportDiff(diff) {
  const out = [];
  for (const c of diff.changed) {
    out.push(`Slide ${c.index} — ${c.fields.join(', ')}`);
    for (const f of c.fields) {
      const show = (v) => (Array.isArray(v) ? v.join(' | ') : v);
      out.push(`  - before: ${show(c.before[f])}`);
      out.push(`  + after:  ${show(c.after[f])}`);
    }
  }
  if (diff.added.length) out.push(`Slides added in the file: ${diff.added.join(', ')}`);
  if (diff.removed.length) out.push(`Slides removed in the file: ${diff.removed.join(', ')}`);
  if (!out.length) out.push('No text or speaker-note changes found.');
  return out.join('\n');
}

/**
 * @param {{slides: object[]}} manifest
 * @param {ReturnType<typeof diffAgainstManifest>} diff
 * @param {number[]|'all'} accepted slide indexes the user accepted
 * @returns {{slides: object[]}} a new manifest; untouched slides are shared copies
 */
function applyImport(manifest, diff, accepted = 'all') {
  const take = accepted === 'all' ? new Set(diff.changed.map((c) => c.index)) : new Set(accepted);
  const changes = new Map(diff.changed.filter((c) => take.has(c.index)).map((c) => [c.index, c]));
  return {
    ...manifest,
    slides: (manifest.slides || []).map((s, i) => {
      const c = changes.get(s.index || i + 1);
      if (!c) return { ...s };
      const next = { ...s, ...c.after, importedFromEdit: true };
      if ('bullets' in c.after && 'body' in s && !Array.isArray(s.bullets)) next.body = c.after.bullets.join('\n');
      return next;
    }),
  };
}

module.exports = { parseSlideText, diffAgainstManifest, formatImportDiff, applyImport };
