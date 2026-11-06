'use strict';
/**
 * pptx-animate — post-process a pptxgenjs .pptx to add slide transitions and
 * click-by-click entrance builds (ENH-117b). Restrained presets only.
 */
const fs = require('fs');
const JSZip = require('jszip');

const ANIMATION_PRESETS = Object.freeze({
  transitions: Object.freeze({
    fade: { xml: '<p:fade/>', spd: 'med', durationMs: 500 },
    push: { xml: '<p:push dir="u"/>', spd: 'med', durationMs: 500 },
    wipe: { xml: '<p:wipe dir="r"/>', spd: 'med', durationMs: 500 },
  }),
  builds: Object.freeze({
    appear: { presetID: 1, durationMs: 0 },
    fade: { presetID: 10, durationMs: 400 },
  }),
});

const SLIDE_RE = /^ppt\/slides\/slide(\d+)\.xml$/;

function esc(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function transitionXml(name) {
  const p = ANIMATION_PRESETS.transitions[name] || ANIMATION_PRESETS.transitions.fade;
  return `<p:transition spd="${esc(p.spd)}">${p.xml}</p:transition>`;
}

/** Content shapes (non-title, with text) in order of appearance: [{ id, y, }] ; hasTitlePh via property */
function findContentShapes(xml) {
  const out = [];
  const re = /<p:sp>[\s\S]*?<\/p:sp>|<p:sp\s[^>]*>[\s\S]*?<\/p:sp>/g;
  let m;
  while ((m = re.exec(xml))) {
    const sp = m[0];
    if (/<p:ph\b[^>]*type="(?:title|ctrTitle)"/.test(sp)) continue;
    if (!/<a:t[ >]|<a:t>/.test(sp)) continue;
    const idm = /<p:cNvPr\b[^>]*\bid="(\d+)"/.exec(sp);
    if (!idm) continue;
    const ym = /<a:off\b[^>]*\by="(-?\d+)"/.exec(sp);
    out.push({ id: idm[1], y: ym ? Number(ym[1]) : Infinity });
  }
  out.hasTitlePh = /<p:ph\b[^>]*type="(?:title|ctrTitle)"/.test(xml);
  return out;
}

function buildTimingXml(shapeIds, buildName) {
  const b = ANIMATION_PRESETS.builds[buildName] || ANIMATION_PRESETS.builds.fade;
  let n = 3;
  let clicks = '';
  for (const spid of shapeIds) {
    const a = n++, b1 = n++, c = n++, d = n++;
    let effect = '';
    if (b.presetID !== 1) {
      const e = n++;
      effect = `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${e}" dur="${b.durationMs}"/><p:tgtEl><p:spTgt spid="${esc(spid)}"/></p:tgtEl></p:cBhvr></p:animEffect>`;
    }
    clicks +=
      `<p:par><p:cTn id="${a}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${b1}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${c}" presetID="${b.presetID}" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
      `<p:set><p:cBhvr><p:cTn id="${d}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${esc(spid)}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>` +
      effect +
      `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  }
  const bld = shapeIds.map((s) => `<p:bldP spid="${esc(s)}" grpId="0" animBg="1"/>`).join('');
  return (
    '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>' +
    '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>' +
    clicks +
    '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>' +
    '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>' +
    `</p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>${bld}</p:bldLst></p:timing>`
  );
}

/** Index of the heading shape within content shapes, or -1 if none. */
function detectHeading(shapes, headingIndex) {
  if (Number.isInteger(headingIndex)) return headingIndex < shapes.length ? headingIndex : -1;
  if (shapes.hasTitlePh) return -1; // title placeholder is already excluded
  let best = -1;
  shapes.forEach((s, i) => {
    if (Number.isFinite(s.y) && (best === -1 || s.y < shapes[best].y)) best = i;
  });
  return best;
}

function processSlide(xml, transitionName, builds, buildName, headingIndex) {
  // strip existing (idempotent)
  xml = xml
    .replace(/<p:transition\b[^>]*\/>/g, '')
    .replace(/<p:transition\b[\s\S]*?<\/p:transition>/g, '')
    .replace(/<p:timing\b[\s\S]*?<\/p:timing>/g, '')
    .replace(/<p:timing\b[^>]*\/>/g, '');

  let insert = transitionXml(transitionName);
  if (builds && builds.length) {
    const shapes = findContentShapes(xml);
    let ids;
    if (builds === 'auto') {
      const h = detectHeading(shapes, headingIndex);
      ids = shapes.filter((_, i) => i !== h).map((s) => s.id);
    }
    else ids = builds.map((o) => (shapes[o] ? shapes[o].id : null)).filter(Boolean);
    if (ids.length) insert += buildTimingXml(ids, buildName);
  }

  let m = /<\/p:clrMapOvr>|<p:clrMapOvr\b[^>]*\/>/.exec(xml);
  if (!m) m = /<\/p:cSld>/.exec(xml);
  if (!m) return xml;
  const at = m.index + m[0].length;
  return xml.slice(0, at) + insert + xml.slice(at);
}

async function loadZip(input) {
  const buf = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
  return JSZip.loadAsync(buf);
}

async function applyAnimations(input, plan = {}) {
  const zip = await loadZip(input);
  const defTransition = plan.transition || 'fade';
  const buildName = plan.build || 'fade';
  const bySlide = new Map();
  for (const s of plan.slides || []) bySlide.set(Number(s.index), s);
  for (const name of Object.keys(zip.files)) {
    const m = SLIDE_RE.exec(name);
    if (!m) continue;
    const idx = Number(m[1]);
    const sp = bySlide.get(idx) || {};
    const xml = await zip.file(name).async('string');
    zip.file(name, processSlide(xml, sp.transition || defTransition, sp.builds, sp.build || buildName, sp.headingIndex));
  }
  const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  if (!Buffer.isBuffer(input)) fs.writeFileSync(input, out);
  return out;
}

async function validatePptxAnimations(input) {
  const zip = await loadZip(input);
  const slides = [];
  for (const name of Object.keys(zip.files)) {
    const m = SLIDE_RE.exec(name);
    if (!m) continue;
    const xml = await zip.file(name).async('string');
    const trCount = (xml.match(/<p:transition\b/g) || []).length;
    const buildCount = (xml.match(/nodeType="clickEffect"/g) || []).length;
    slides.push({ index: Number(m[1]), hasTransition: trCount === 1, buildCount });
  }
  slides.sort((a, b) => a.index - b.index);
  return { ok: slides.length > 0 && slides.every((s) => s.hasTransition), slides };
}

module.exports = { ANIMATION_PRESETS, applyAnimations, validatePptxAnimations };
