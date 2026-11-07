'use strict';

/**
 * vp-proposal gate registry (ENH-124 / ENH-126).
 *
 * Every workflow step is listed with the gates it owns (input = before it consumes a decision or
 * data, output = after it produces something the user judges) and the ViePilot version in which it
 * appeared or changed. `upgradePlan` uses `since` / `changedIn` to tell what an older proposal is
 * missing; `lintWorkflowGates` checks that workflows/proposal.md asks the user at every gate.
 *
 * Zero dependencies.
 */

const BASE_VERSION = '3.12.0'; // proposal pipeline before the ENH-117 line; legacy proposals map here

const step = (name, kinds, since, extra = {}) => Object.freeze({
  step: name, kinds: Object.freeze(kinds), since, changedIn: Object.freeze(extra.changedIn || []),
  askUser: true, coveredBy: extra.coveredBy || null, newInput: !!extra.newInput,
});

// Order = workflow order. `coveredBy` = compute-only step whose result is judged at another step's gate.
const GATES = Object.freeze([
  step('detect_existing', ['input'], '3.19.0'),
  step('initialize', ['input'], BASE_VERSION, { changedIn: ['3.19.0'] }),
  step('context_detection', ['input'], BASE_VERSION),
  step('purpose_consult', ['input', 'output'], '3.17.0', { newInput: true }),
  step('audience_intake', ['input'], '3.17.0', { newInput: true }),
  step('type_selection', ['input'], BASE_VERSION, { changedIn: ['3.17.0'] }),
  step('language_selection', ['input'], BASE_VERSION),
  step('voice_profile', ['input'], '3.13.0', { newInput: true }),
  step('story_brief', ['input'], '3.13.0', { newInput: true }),
  step('quality_brief', ['input'], BASE_VERSION),
  step('manifest_generation', ['output'], BASE_VERSION, { changedIn: ['3.13.0', '3.17.0'] }),
  step('generate_docx_content', ['output'], BASE_VERSION),
  step('spoken_script', ['output'], '3.13.0'),
  step('detect_visual_artifacts', ['input'], BASE_VERSION),
  step('template_resolution', [], BASE_VERSION, { coveredBy: 'generate_pptx' }),
  step('generate_pptx', ['output'], BASE_VERSION),
  step('animation_hook', ['output'], '3.15.0'),
  step('generate_docx', ['output'], BASE_VERSION),
  step('generate_md', ['output'], BASE_VERSION),
  step('persona_review_council', ['input', 'output'], '3.16.0', { changedIn: ['3.17.0'] }),
  step('google_slides_upload', ['input', 'output'], BASE_VERSION),
  step('confirm_output', ['output'], BASE_VERSION),
  step('iterate', ['input', 'output'], '3.19.0'),
]);

function parse(v) {
  const m = String(v || '').match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? m.slice(1).map(Number) : null;
}

function cmp(a, b) {
  const x = parse(a); const y = parse(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

/**
 * What an older proposal needs to reach the installed pipeline.
 * @param {{viepilotVersion?: string, gatesPassed?: string[]}} provenance
 * @param {string} installedVersion
 * @returns {{from: string, legacy: boolean, missing: string[], changed: string[], reuse: string[], newInputs: string[]}}
 */
function upgradePlan(provenance, installedVersion) {
  const raw = provenance && provenance.viepilotVersion;
  const legacy = !parse(raw);
  const from = legacy ? BASE_VERSION : raw;
  const missing = []; const changed = []; const reuse = [];
  for (const g of GATES) {
    if (cmp(g.since, installedVersion) > 0) continue; // not shipped in the installed version
    if (cmp(g.since, from) > 0) missing.push(g.step);
    else if (g.changedIn.some((v) => cmp(v, from) > 0 && cmp(v, installedVersion) <= 0)) changed.push(g.step);
    else reuse.push(g.step);
  }
  const newInputs = GATES.filter((g) => missing.includes(g.step) && g.newInput).map((g) => g.step);
  return { from, legacy, missing, changed, reuse, newInputs };
}

/**
 * Steps in workflows/proposal.md that neither ask the user (AskUserQuestion) nor name the gate
 * that covers them (`covered by gate: <step>`, which must exist).
 * @param {string} workflowText
 * @returns {{step: string, reason: string}[]}
 */
function lintWorkflowGates(workflowText) {
  const text = String(workflowText || '');
  const opens = [...text.matchAll(/<step name="([a-z_]+)">/g)];
  const names = new Set(opens.map((m) => m[1]));
  const problems = [];
  opens.forEach((m, i) => {
    const seg = text.slice(m.index, i + 1 < opens.length ? opens[i + 1].index : text.length);
    if (/AskUserQuestion/.test(seg)) return;
    const cov = seg.match(/covered by gate:\s*`?([a-z_]+)`?/i);
    if (cov && names.has(cov[1]) && cov[1] !== m[1]) return;
    problems.push({ step: m[1], reason: cov ? `covered-by target "${cov[1]}" is not a step` : 'no AskUserQuestion gate and no "covered by gate" reference' });
  });
  for (const g of GATES) {
    if (!names.has(g.step) && cmp(g.since, '3.19.0') < 0) problems.push({ step: g.step, reason: 'registered gate missing from workflow' });
  }
  return problems;
}

module.exports = { BASE_VERSION, GATES, upgradePlan, lintWorkflowGates, compareVersions: cmp };
