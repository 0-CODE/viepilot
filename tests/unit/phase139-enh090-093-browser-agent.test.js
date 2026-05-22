'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '../..');
const AGENTS_CC = path.join(ROOT, 'agents', 'claude-code');

// ---------------------------------------------------------------------------
// ENH-090: browser-intake-agent
// ---------------------------------------------------------------------------

describe('Phase 139 — ENH-090: browser-intake-agent', () => {
  const agentPath = path.join(AGENTS_CC, 'browser-intake-agent.md');

  test('browser-intake-agent.md exists in agents/claude-code/', () => {
    expect(fs.existsSync(agentPath)).toBe(true);
  });

  test('browser-intake-agent.md has valid YAML frontmatter (name, model, tools, disallowedTools)', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toMatch(/^---/);
    expect(content).toMatch(/\nname:/);
    expect(content).toMatch(/\nmodel:/);
    expect(content).toMatch(/\ntools:/);
    expect(content).toMatch(/\ndisallowedTools:/);
  });

  test('browser-intake-agent has correct name and sonnet model', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toMatch(/name:\s*browser-intake-agent/);
    expect(content).toMatch(/model:\s*claude-sonnet/);
  });

  test('browser-intake-agent disallows Edit, Write, WebSearch, WebFetch', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    const disallowedSection = content.split('disallowedTools:')[1] || '';
    const frontmatterEnd = disallowedSection.indexOf('---');
    const disallowedBlock = frontmatterEnd > 0
      ? disallowedSection.slice(0, frontmatterEnd)
      : disallowedSection.slice(0, 300);
    expect(disallowedBlock).toMatch(/Edit/);
    expect(disallowedBlock).toMatch(/Write/);
    expect(disallowedBlock).toMatch(/WebSearch/);
    expect(disallowedBlock).toMatch(/WebFetch/);
  });
});

// ---------------------------------------------------------------------------
// ENH-091: browser-audit-agent
// ---------------------------------------------------------------------------

describe('Phase 139 — ENH-091: browser-audit-agent', () => {
  const agentPath = path.join(AGENTS_CC, 'browser-audit-agent.md');

  test('browser-audit-agent.md exists in agents/claude-code/', () => {
    expect(fs.existsSync(agentPath)).toBe(true);
  });

  test('browser-audit-agent.md has valid YAML frontmatter', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toMatch(/^---/);
    expect(content).toMatch(/\nname:/);
    expect(content).toMatch(/\nmodel:/);
  });

  test('browser-audit-agent has correct name', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toMatch(/name:\s*browser-audit-agent/);
  });

  test('browser-audit-agent documents audit_routes, visual_check, accessibility_check ops', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toMatch(/audit_routes/);
    expect(content).toMatch(/visual_check/);
    expect(content).toMatch(/accessibility_check/);
  });
});

// ---------------------------------------------------------------------------
// ENH-090: lib/intake/adapters/browser.cjs
// ---------------------------------------------------------------------------

describe('Phase 139 — ENH-090: lib/intake/adapters/browser.cjs', () => {
  const mod = require('../../lib/intake/adapters/browser.cjs');

  test('exports readBrowserUrl and detectUrlType', () => {
    expect(typeof mod.readBrowserUrl).toBe('function');
    expect(typeof mod.detectUrlType).toBe('function');
  });

  test('exports URL_PATTERNS with all 5 source types', () => {
    expect(mod.URL_PATTERNS).toBeDefined();
    expect(mod.URL_PATTERNS['google-sheets']).toBeDefined();
    expect(mod.URL_PATTERNS['github-issues']).toBeDefined();
    expect(mod.URL_PATTERNS['jira']).toBeDefined();
    expect(mod.URL_PATTERNS['trello']).toBeDefined();
    expect(mod.URL_PATTERNS['notion']).toBeDefined();
  });

  test('detectUrlType identifies google-sheets URL', () => {
    expect(mod.detectUrlType('https://docs.google.com/spreadsheets/d/xxx/edit?usp=sharing')).toBe('google-sheets');
  });

  test('detectUrlType identifies github-issues URL', () => {
    expect(mod.detectUrlType('https://github.com/org/repo/issues')).toBe('github-issues');
  });

  test('detectUrlType returns generic-table for unknown URL', () => {
    expect(mod.detectUrlType('https://example.com/something')).toBe('generic-table');
  });

  test('detectUrlType returns generic-table for null input', () => {
    expect(mod.detectUrlType(null)).toBe('generic-table');
  });
});

// ---------------------------------------------------------------------------
// ENH-091: lib/audit/browser-runner.cjs
// ---------------------------------------------------------------------------

describe('Phase 139 — ENH-091: lib/audit/browser-runner.cjs', () => {
  const mod = require('../../lib/audit/browser-runner.cjs');

  test('exports runBrowserAudit, resolveBaseUrl, writeAuditReport', () => {
    expect(typeof mod.runBrowserAudit).toBe('function');
    expect(typeof mod.resolveBaseUrl).toBe('function');
    expect(typeof mod.writeAuditReport).toBe('function');
  });

  test('DEFAULT_BASE_URL is http://localhost:3000', () => {
    expect(mod.DEFAULT_BASE_URL).toBe('http://localhost:3000');
  });

  test('resolveBaseUrl returns options.baseUrl when provided', () => {
    expect(mod.resolveBaseUrl({ baseUrl: 'http://localhost:4000' }, '/tmp')).toBe('http://localhost:4000');
  });

  test('resolveBaseUrl falls back to DEFAULT_BASE_URL when no config', () => {
    expect(mod.resolveBaseUrl({}, '/tmp')).toBe('http://localhost:3000');
  });
});

// ---------------------------------------------------------------------------
// ENH-093: lib/request/url-enricher.cjs
// ---------------------------------------------------------------------------

describe('Phase 139 — ENH-093: lib/request/url-enricher.cjs', () => {
  const mod = require('../../lib/request/url-enricher.cjs');

  test('exports detectIssueUrl, enrichFromUrl, formatPreFillDisplay, URL_ROUTES', () => {
    expect(typeof mod.detectIssueUrl).toBe('function');
    expect(typeof mod.enrichFromUrl).toBe('function');
    expect(typeof mod.formatPreFillDisplay).toBe('function');
    expect(mod.URL_ROUTES).toBeDefined();
  });

  test('detectIssueUrl matches GitHub issue URL', () => {
    const r = mod.detectIssueUrl('https://github.com/org/repo/issues/42');
    expect(r.matched).toBe(true);
    expect(r.source).toBe('github');
    expect(r.url).toContain('github.com');
  });

  test('detectIssueUrl matches Jira URL', () => {
    const r = mod.detectIssueUrl('https://company.atlassian.net/browse/PROJ-123');
    expect(r.matched).toBe(true);
    expect(r.source).toBe('jira');
  });

  test('detectIssueUrl matches Trello card URL', () => {
    const r = mod.detectIssueUrl('https://trello.com/c/abcdef12/card-title');
    expect(r.matched).toBe(true);
    expect(r.source).toBe('trello');
  });

  test('detectIssueUrl returns matched:false for non-issue URL', () => {
    const r = mod.detectIssueUrl('https://example.com/not-an-issue');
    expect(r.matched).toBe(false);
  });

  test('detectIssueUrl returns matched:false for empty input', () => {
    expect(mod.detectIssueUrl('').matched).toBe(false);
    expect(mod.detectIssueUrl(null).matched).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Skill + workflow documentation checks
// ---------------------------------------------------------------------------

describe('Phase 139 — Skill/workflow documentation', () => {
  test('skills/vp-intake/SKILL.md mentions browser channel type', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills', 'vp-intake', 'SKILL.md'), 'utf8');
    expect(content).toMatch(/browser/);
    expect(content).toMatch(/agent-browser/);
  });

  test('skills/vp-audit/SKILL.md mentions --visual flag', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills', 'vp-audit', 'SKILL.md'), 'utf8');
    expect(content).toMatch(/--visual/);
    expect(content).toMatch(/browser-audit-agent/);
  });

  test('agents/claude-code/research-agent.md mentions browse_url op', () => {
    const content = fs.readFileSync(path.join(AGENTS_CC, 'research-agent.md'), 'utf8');
    expect(content).toMatch(/browse_url/);
    expect(content).toMatch(/compare_products/);
    expect(content).toMatch(/extract_pricing/);
  });

  test('workflows/request.md mentions URL detection pre-step (ENH-093)', () => {
    const content = fs.readFileSync(path.join(ROOT, 'workflows', 'request.md'), 'utf8');
    expect(content).toMatch(/url_enrichment|URL Enrichment/);
    expect(content).toMatch(/browser-intake-agent/);
  });

  test('workflows/brainstorm.md mentions reference_url_research step', () => {
    const content = fs.readFileSync(path.join(ROOT, 'workflows', 'brainstorm.md'), 'utf8');
    expect(content).toMatch(/reference_url_research|Reference URL Research/);
    expect(content).toMatch(/research-agent/);
  });
});

// ---------------------------------------------------------------------------
// ENH-094: SharePoint xlsx routing fix in browser.cjs URL_PATTERNS
// ---------------------------------------------------------------------------

describe('Phase 139 — ENH-094: SharePoint xlsx URL routing', () => {
  const browserAdapter = require('../../lib/intake/adapters/browser.cjs');

  test('URL_PATTERNS includes sharepoint-xlsx entry', () => {
    expect(browserAdapter.URL_PATTERNS).toHaveProperty('sharepoint-xlsx');
  });

  test('detectUrlType returns sharepoint-xlsx for /:x:/r/ pattern', () => {
    const url = 'https://contoso-my.sharepoint.com/:x:/r/personal/user/Documents/file.xlsx?web=1&e=abc';
    expect(browserAdapter.detectUrlType(url)).toBe('sharepoint-xlsx');
  });

  test('detectUrlType returns sharepoint-xlsx for /:w:/r/ pattern (Word)', () => {
    const url = 'https://contoso-my.sharepoint.com/:w:/r/personal/user/Documents/doc.docx';
    expect(browserAdapter.detectUrlType(url)).toBe('sharepoint-xlsx');
  });

  test('isKnownPublicSource returns true for sharepoint-xlsx URL', () => {
    const url = 'https://contoso.sharepoint.com/:x:/r/sites/team/Shared/file.xlsx';
    expect(browserAdapter.isKnownPublicSource(url)).toBe(true);
  });

  test('detectUrlType still returns generic-table for non-SharePoint URL', () => {
    expect(browserAdapter.detectUrlType('https://example.com/data.xlsx')).toBe('generic-table');
  });

  test('vp-intake SKILL.md routes sharepoint-xlsx to excel-intake-agent', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills', 'vp-intake', 'SKILL.md'), 'utf8');
    expect(content).toMatch(/sharepoint-xlsx/);
    expect(content).toMatch(/excel-intake-agent.*sharepoint|sharepoint.*excel-intake-agent/s);
  });
});
