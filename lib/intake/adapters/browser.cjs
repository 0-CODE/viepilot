'use strict';

const URL_PATTERNS = {
  'google-sheets':   /docs\.google\.com\/spreadsheets/,
  'github-issues':   /github\.com\/[^/]+\/[^/]+\/issues/,
  'jira':            /atlassian\.net\/browse\/[A-Z]+-\d+|atlassian\.net\/jira\/software\/projects/,
  'trello':          /trello\.com\/[bc]\//,
  'notion':          /notion\.so\/[a-f0-9]{8,}/,
  'sharepoint-xlsx': /sharepoint\.com\/:[a-z]:\/r\//,
};

/**
 * Detect source type from URL string.
 * @param {string} url
 * @returns {'google-sheets'|'github-issues'|'jira'|'trello'|'notion'|'sharepoint-xlsx'|'generic-table'}
 */
function detectUrlType(url) {
  if (!url || typeof url !== 'string') return 'generic-table';
  for (const [type, pattern] of Object.entries(URL_PATTERNS)) {
    if (pattern.test(url)) return type;
  }
  return 'generic-table';
}

/**
 * Read ticket rows from a public URL via browser-intake-agent (CC adapter only).
 * Non-CC adapters receive a clear unsupported error.
 * @param {object} channel - channel config with `url` field
 * @param {string} projectRoot - absolute path to project root
 * @returns {Promise<Array<{title,description,labels,priority,status}>>}
 */
async function readBrowserUrl(channel, projectRoot) {
  if (!channel || !channel.url) {
    throw new Error('browser channel requires a "url" field in channel config');
  }

  const sourceType = detectUrlType(channel.url);

  // CC adapter: Agent dispatch is handled by vp-intake SKILL.md (orchestrator layer).
  // This module is used by non-CC adapters or direct Node callers — emit clear error.
  throw new Error(
    `Browser channel (${sourceType}) requires Claude Code with the agent-browser skill.\n` +
    `Install: npx skills add vercel-labs/agent-browser\n` +
    `Then run vp-intake from Claude Code.`
  );
}

/**
 * Check whether a URL appears to be a publicly accessible intake source.
 * Does not make network requests — pattern-match only.
 * @param {string} url
 * @returns {boolean}
 */
function isKnownPublicSource(url) {
  return detectUrlType(url) !== 'generic-table';
}

module.exports = { readBrowserUrl, detectUrlType, isKnownPublicSource, URL_PATTERNS };
