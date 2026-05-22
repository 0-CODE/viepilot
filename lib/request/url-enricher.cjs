'use strict';

const URL_ROUTES = {
  github:  /github\.com\/[^/]+\/[^/]+\/issues\/\d+/,
  linear:  /linear\.app\/[^/]+\/issue\/[A-Z]+-\d+/,
  jira:    /atlassian\.net\/browse\/[A-Z]+-\d+/,
  trello:  /trello\.com\/c\/[a-zA-Z0-9]+/,
  notion:  /notion\.so\/[a-f0-9-]{8,}/,
};

/**
 * Detect whether input string contains a known issue-tracker URL.
 * @param {string} input - raw user input (may contain URL anywhere)
 * @returns {{ matched: boolean, source?: string, url?: string }}
 */
function detectIssueUrl(input) {
  if (!input || typeof input !== 'string') return { matched: false };
  // Extract first https?:// URL from input
  const urlMatch = input.match(/https?:\/\/[^\s]+/);
  if (!urlMatch) return { matched: false };
  const url = urlMatch[0].replace(/[.,!?)]+$/, ''); // strip trailing punctuation
  for (const [source, pattern] of Object.entries(URL_ROUTES)) {
    if (pattern.test(url)) return { matched: true, source, url };
  }
  return { matched: false };
}

/**
 * Enrich a request with details extracted from an issue URL via browser-intake-agent.
 * Returns null (never throws) when extraction fails or agent is unavailable.
 * CC adapter only — dispatched by vp-request SKILL.md / workflows/request.md.
 * @param {string} url
 * @param {string} source - detected source type
 * @param {string} projectRoot
 * @returns {Promise<{title,type,description,priority,labels}|null>}
 */
async function enrichFromUrl(url, source, projectRoot) {
  try {
    // CC adapter: Agent dispatch is handled by request.md (orchestrator layer).
    // Direct callers (non-CC) receive null — enrichment silently skipped.
    return null;
  } catch {
    return null;
  }
}

/**
 * Format pre-fill display for user confirmation.
 * @param {object} enriched - { title, type, description, priority, labels }
 * @param {string} url
 * @returns {string} formatted display string
 */
function formatPreFillDisplay(enriched, url) {
  if (!enriched) return '';
  const lines = [
    `Context extracted from: ${url}`,
    ``,
    `  Title:       ${enriched.title || '(not detected)'}`,
    `  Type:        ${enriched.type || '(not detected)'}`,
    `  Description: ${String(enriched.description || '').slice(0, 120)}${(enriched.description || '').length > 120 ? '...' : ''}`,
    `  Priority:    ${enriched.priority || '(not detected)'}`,
  ];
  if (enriched.labels && enriched.labels.length > 0) {
    lines.push(`  Labels:      ${enriched.labels.join(', ')}`);
  }
  return lines.join('\n');
}

module.exports = { detectIssueUrl, enrichFromUrl, formatPreFillDisplay, URL_ROUTES };
