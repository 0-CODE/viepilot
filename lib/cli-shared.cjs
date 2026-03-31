/**
 * Shared CLI helpers: validation + project root resolution (unit-tested, coverage-targeted).
 * Keeps bin/vp-tools.cjs thinner so Jest can enforce meaningful coverage thresholds.
 */

const fs = require('fs');
const path = require('path');

const VIEPILOT_DIR = '.viepilot';

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, VIEPILOT_DIR))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

const validators = {
  isPositiveInteger(value, name = 'value') {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      return { valid: false, error: `${name} must be a positive integer`, hint: `Got: "${value}"` };
    }
    return { valid: true, value: num };
  },

  isValidStatus(value) {
    const validStatuses = ['not_started', 'in_progress', 'done', 'skipped', 'blocked'];
    if (!validStatuses.includes(value)) {
      return {
        valid: false,
        error: `Invalid status: "${value}"`,
        hint: `Valid statuses: ${validStatuses.join(', ')}`,
      };
    }
    return { valid: true, value };
  },

  isValidTimestampFormat(value) {
    const validFormats = ['iso', 'date', 'full'];
    if (!validFormats.includes(value)) {
      return {
        valid: false,
        error: `Invalid timestamp format: "${value}"`,
        hint: `Valid formats: ${validFormats.join(', ')}`,
      };
    }
    return { valid: true, value };
  },

  isValidBumpType(value) {
    const validTypes = ['major', 'minor', 'patch'];
    if (!validTypes.includes(value)) {
      return {
        valid: false,
        error: `Invalid bump type: "${value}"`,
        hint: `Valid types: ${validTypes.join(', ')}`,
      };
    }
    return { valid: true, value };
  },

  isNonEmptyString(value, name = 'value') {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return { valid: false, error: `${name} cannot be empty` };
    }
    return { valid: true, value: value.trim() };
  },

  requireProjectRoot() {
    const root = findProjectRoot();
    if (!root) {
      return {
        valid: false,
        error: 'No ViePilot project found',
        hint: 'Run this command from a directory containing .viepilot/',
      };
    }
    return { valid: true, value: root };
  },
};

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

module.exports = {
  VIEPILOT_DIR,
  findProjectRoot,
  validators,
  levenshteinDistance,
};
