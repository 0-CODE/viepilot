'use strict';

const path = require('path');
const fs = require('fs');

const DEFAULT_BASE_URL = 'http://localhost:3000';

/**
 * Resolve base URL for browser audit.
 * Priority: options.baseUrl → config.json audit.baseUrl → DEFAULT_BASE_URL
 * @param {object} options - { baseUrl?: string }
 * @param {string} projectRoot
 * @returns {string}
 */
function resolveBaseUrl(options, projectRoot) {
  if (options && options.baseUrl) return options.baseUrl;
  try {
    const configPath = path.join(projectRoot, '.viepilot', 'config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (cfg.audit && cfg.audit.baseUrl) return cfg.audit.baseUrl;
    }
  } catch { /* config missing or malformed — use default */ }
  return DEFAULT_BASE_URL;
}

/**
 * Write a Markdown audit report to .viepilot/audit/visual-report-{timestamp}.md
 * @param {object} report - structured audit report from browser-audit-agent
 * @param {string} projectRoot
 * @returns {string} absolute path to report file
 */
function writeAuditReport(report, projectRoot) {
  const auditDir = path.join(projectRoot, '.viepilot', 'audit');
  fs.mkdirSync(auditDir, { recursive: true });

  const timestamp = Date.now();
  const reportPath = path.join(auditDir, `visual-report-${timestamp}.md`);

  const routes = report.routes || [];
  const routeTable = routes.map(r => {
    const status = r.status === 'ok' ? '✅ ok' : `❌ ${r.status}`;
    const issues = (r.errors && r.errors.length > 0) ? r.errors.join(', ') : '—';
    return `| ${r.url} | ${status} | ${issues} |`;
  }).join('\n');

  const accessibilitySection = routes
    .filter(r => r.accessibility_issues && r.accessibility_issues.length > 0)
    .map(r => `### ${r.url}\n${r.accessibility_issues.map(i => `- **${i.type}**: ${i.description}`).join('\n')}`)
    .join('\n\n') || '_No accessibility issues found._';

  const screenshotSection = routes
    .filter(r => r.screenshot)
    .map(r => `- \`${r.url}\`: \`${r.screenshot}\``)
    .join('\n') || '_No screenshots captured._';

  const content = `# Browser Audit Report — ${new Date(timestamp).toISOString()}

**Base URL**: ${report.baseUrl || DEFAULT_BASE_URL}
**Routes checked**: ${routes.length}
**Op**: ${report.op || 'audit_routes'}

## Routes

| Route | Status | Issues |
|-------|--------|--------|
${routeTable}

## Accessibility Issues

${accessibilitySection}

## Screenshots

${screenshotSection}
`;

  fs.writeFileSync(reportPath, content, 'utf8');
  return reportPath;
}

/**
 * Run browser audit by dispatching browser-audit-agent (CC adapter only).
 * On non-CC: throws with install instructions.
 * @param {object} options - { baseUrl?, routes?, op?, updateBaseline? }
 * @param {string} projectRoot
 * @returns {Promise<object>} - report object
 */
async function runBrowserAudit(options, projectRoot) {
  const baseUrl = resolveBaseUrl(options, projectRoot);
  const op = (options && options.op) || 'audit_routes';

  // CC adapter: Agent dispatch is handled by vp-audit SKILL.md (orchestrator layer).
  // This module is for direct Node callers — emit clear error.
  throw new Error(
    `Browser audit requires Claude Code with the agent-browser skill.\n` +
    `Install: npx skills add vercel-labs/agent-browser\n` +
    `Then run: /vp-audit --visual --browser ${baseUrl}`
  );
}

module.exports = { runBrowserAudit, resolveBaseUrl, writeAuditReport, DEFAULT_BASE_URL };
