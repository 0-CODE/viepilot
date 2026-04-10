/**
 * ViePilot language configuration — schema, read/write, defaults (ENH-032 / Phase 49).
 *
 * Config file: ~/.viepilot/config.json
 * Schema:
 *   language.communication  — language for AI↔user banners/prompts  (default: "en")
 *   language.document       — language for generated project files   (default: "en")
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

/** @type {{ language: { communication: string, document: string }, proposal: { recentLangs: string[], defaultLang: string } }} */
const DEFAULTS = {
  language: {
    communication: 'en',
    document: 'en',
  },
  proposal: {
    recentLangs: [],   // MRU list, most recent first, max 5
    defaultLang: 'en', // kept in sync with recentLangs[0]
  },
};

/**
 * @param {string | undefined} overrideHomedir
 * @returns {string}
 */
function getConfigPath(overrideHomedir) {
  const home = overrideHomedir != null ? path.resolve(overrideHomedir) : os.homedir();
  return path.join(home, '.viepilot', 'config.json');
}

/**
 * Deep-merge src into dst (one level under each top-level key).
 * @param {object} dst
 * @param {object} src
 * @returns {object}
 */
function deepMerge(dst, src) {
  const result = Object.assign({}, dst);
  for (const key of Object.keys(src)) {
    if (
      src[key] !== null &&
      typeof src[key] === 'object' &&
      !Array.isArray(src[key]) &&
      dst[key] !== null &&
      typeof dst[key] === 'object'
    ) {
      result[key] = Object.assign({}, dst[key], src[key]);
    } else {
      result[key] = src[key];
    }
  }
  return result;
}

/**
 * Read config, deep-merged with DEFAULTS. Returns DEFAULTS when file is absent.
 * @param {string | undefined} overrideHomedir
 * @returns {{ language: { communication: string, document: string } }}
 */
function readConfig(overrideHomedir) {
  const configPath = getConfigPath(overrideHomedir);
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return deepMerge(DEFAULTS, parsed);
  } catch (_e) {
    return deepMerge({}, DEFAULTS);
  }
}

/**
 * Deep-patch existing config with `patch` and write back to disk.
 * Creates ~/.viepilot/ directory if missing.
 * @param {Partial<{ language: Partial<{ communication: string, document: string }> }>} patch
 * @param {string | undefined} overrideHomedir
 */
function writeConfig(patch, overrideHomedir) {
  const configPath = getConfigPath(overrideHomedir);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const current = readConfig(overrideHomedir);
  const updated = deepMerge(current, patch);
  fs.writeFileSync(configPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
}

/**
 * Reset config to DEFAULTS.
 * @param {string | undefined} overrideHomedir
 */
function resetConfig(overrideHomedir) {
  const configPath = getConfigPath(overrideHomedir);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(DEFAULTS, null, 2) + '\n', 'utf8');
}

/**
 * Get the suggested default language for proposals.
 * Returns recentLangs[0] if present, else 'en'.
 * @param {string | undefined} overrideHomedir
 * @returns {string}
 */
function getProposalLang(overrideHomedir) {
  const cfg = readConfig(overrideHomedir);
  const recent = cfg.proposal && cfg.proposal.recentLangs;
  return (Array.isArray(recent) && recent.length > 0) ? recent[0] : 'en';
}

/**
 * Record a used language: prepend to recentLangs, dedup, cap at 5, sync defaultLang.
 * @param {string} lang - ISO 639-1 code
 * @param {string | undefined} overrideHomedir
 */
function recordProposalLang(lang, overrideHomedir) {
  const cfg = readConfig(overrideHomedir);
  const existing = (cfg.proposal && Array.isArray(cfg.proposal.recentLangs))
    ? cfg.proposal.recentLangs : [];
  const updated = [lang, ...existing.filter(l => l !== lang)].slice(0, 5);
  writeConfig({ proposal: { recentLangs: updated, defaultLang: updated[0] } }, overrideHomedir);
}

module.exports = {
  DEFAULTS,
  getConfigPath,
  readConfig,
  writeConfig,
  resetConfig,
  getProposalLang,
  recordProposalLang,
};
