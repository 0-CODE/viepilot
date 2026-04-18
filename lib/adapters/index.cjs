'use strict';
const adapters = {
  'claude-code':  require('./claude-code.cjs'),
  'cursor':       require('./cursor.cjs'),
  'cursor-agent': require('./cursor.cjs'),      // alias
  'cursor-ide':   require('./cursor.cjs'),      // alias
  'antigravity':  require('./antigravity.cjs'),
  'codex':        require('./codex.cjs'),
  'copilot':      require('./copilot.cjs'),
};

/**
 * Get adapter by id. Throws if unknown.
 * @param {string} id
 */
function getAdapter(id) {
  const a = adapters[id];
  if (!a) throw new Error(`Unknown adapter: "${id}". Known: ${Object.keys(adapters).join(', ')}`);
  return a;
}

/**
 * List unique adapters (deduplicated — aliases share the same object).
 */
function listAdapters() {
  return [...new Set(Object.values(adapters))];
}

module.exports = { getAdapter, listAdapters, adapters };
