'use strict';

const os   = require('os');
const path = require('path');
const fs   = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function tmpDir() {
  return path.join(os.tmpdir(), `vp-enh039-${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// viepilot-config — proposal lang helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('viepilot-config — proposal lang helpers', () => {
  const { getProposalLang, recordProposalLang, readConfig } = require('../../lib/viepilot-config.cjs');

  test('getProposalLang returns "en" when config absent', () => {
    const tmp = tmpDir();
    expect(getProposalLang(tmp)).toBe('en');
  });

  test('recordProposalLang adds language to recentLangs', () => {
    const tmp = tmpDir();
    recordProposalLang('vi', tmp);
    const cfg = readConfig(tmp);
    expect(cfg.proposal.recentLangs).toContain('vi');
  });

  test('recordProposalLang deduplicates entries', () => {
    const tmp = tmpDir();
    recordProposalLang('vi', tmp);
    recordProposalLang('en', tmp);
    recordProposalLang('vi', tmp); // dedup — vi already present
    const cfg = readConfig(tmp);
    expect(cfg.proposal.recentLangs).toEqual(['vi', 'en']); // not ['vi', 'en', 'vi']
    expect(cfg.proposal.recentLangs.length).toBe(2);
  });

  test('recordProposalLang caps list at 5 entries', () => {
    const tmp = tmpDir();
    ['fr', 'de', 'ja', 'ko', 'zh', 'vi'].forEach(l => recordProposalLang(l, tmp));
    const cfg = readConfig(tmp);
    expect(cfg.proposal.recentLangs.length).toBe(5);
  });

  test('getProposalLang returns most recently used after record', () => {
    const tmp = tmpDir();
    recordProposalLang('vi', tmp);
    recordProposalLang('en', tmp);
    recordProposalLang('vi', tmp); // move vi back to front
    expect(getProposalLang(tmp)).toBe('vi');
  });

  test('recordProposalLang syncs defaultLang to recentLangs[0]', () => {
    const tmp = tmpDir();
    recordProposalLang('vi', tmp);
    recordProposalLang('en', tmp);
    const cfg = readConfig(tmp);
    expect(cfg.proposal.defaultLang).toBe('en'); // most recent is en
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// proposal-generator — buildLangInstruction
// ─────────────────────────────────────────────────────────────────────────────

describe('proposal-generator — buildLangInstruction', () => {
  const { buildLangInstruction } = require('../../lib/proposal-generator.cjs');

  test('returns empty string for "en"', () => {
    expect(buildLangInstruction('en')).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(buildLangInstruction(undefined)).toBe('');
  });

  test('returns empty string for null', () => {
    expect(buildLangInstruction(null)).toBe('');
  });

  test('returns non-empty instruction for "vi"', () => {
    expect(buildLangInstruction('vi').length).toBeGreaterThan(0);
  });

  test('instruction for "vi" contains "Vietnamese"', () => {
    expect(buildLangInstruction('vi')).toContain('Vietnamese');
  });

  test('contentOnly=true — instruction mentions content and keeps English for labels', () => {
    const instr = buildLangInstruction('vi', true);
    expect(instr).toContain('content');
    expect(instr).toContain('English');
  });

  test('contentOnly=false (default) — instruction says ALL content', () => {
    const instr = buildLangInstruction('vi', false);
    expect(instr).toContain('ALL content');
  });

  test('unknown lang code — uses lang.toUpperCase() as name gracefully', () => {
    const instr = buildLangInstruction('xx');
    expect(instr).toContain('XX');
    expect(instr.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// skills/vp-proposal/SKILL.md — lang flags documented
// ─────────────────────────────────────────────────────────────────────────────

describe('skills/vp-proposal/SKILL.md — lang flags', () => {
  const skillPath = path.join(__dirname, '../../skills/vp-proposal/SKILL.md');
  const workflowPath = path.join(__dirname, '../../workflows/proposal.md');
  let skillContent, workflowContent;

  beforeAll(() => {
    skillContent   = fs.readFileSync(skillPath, 'utf8');
    workflowContent = fs.readFileSync(workflowPath, 'utf8');
  });

  test('SKILL.md documents --lang flag', () => {
    expect(skillContent).toMatch(/--lang\s+<code>/);
  });

  test('SKILL.md documents --lang-content-only flag', () => {
    expect(skillContent).toContain('--lang-content-only');
  });

  test('workflow.md contains Language Selection step', () => {
    expect(workflowContent).toContain('Language Selection');
  });

  test('workflow.md references recentLangs or getProposalLang', () => {
    expect(workflowContent.match(/recentLangs|getProposalLang/)).not.toBeNull();
  });
});
