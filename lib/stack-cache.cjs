/**
 * Stack cache management: persisting research findings for reuse across projects
 * Validates stack IDs and section content, writes to ~/.viepilot/stacks/{stack}/*.md
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const REQUIRED_SECTIONS = ['SUMMARY', 'BEST-PRACTICES', 'ANTI-PATTERNS', 'SOURCES'];
const STACK_ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

/**
 * Parse fenced/heading sections from agent response text.
 * Looks for sections marked with either:
 *  ## SECTION_NAME
 *  or
 *  ```
 *  section_name
 *  ...
 *  ```
 *
 * @param {string} text - Agent's text response
 * @returns {Object} - { SUMMARY: "...", BEST-PRACTICES: "...", ... }
 */
function parseSections(text) {
  const sections = {};

  if (!text || typeof text !== 'string') {
    return sections;
  }

  // Try to parse fenced code blocks first
  const fencedPattern = /```\s*([A-Z_-]+)\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = fencedPattern.exec(text)) !== null) {
    const sectionName = match[1].toUpperCase();
    const content = match[2].trim();
    sections[sectionName] = content;
  }

  // Try to parse markdown headings (## SECTION_NAME ... until next ## or end)
  if (Object.keys(sections).length === 0) {
    const headingPattern = /^##\s+([A-Z][A-Z_-]*)\s*\n([\s\S]*?)(?=^##\s+|$)/gm;
    while ((match = headingPattern.exec(text)) !== null) {
      const sectionName = match[1].toUpperCase();
      const content = match[2].trim();
      sections[sectionName] = content;
    }
  }

  return sections;
}

/**
 * Validate stack ID format
 * @param {string} stackId - Stack identifier
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateStackId(stackId) {
  if (!stackId || typeof stackId !== 'string') {
    return { valid: false, error: 'Stack ID must be a non-empty string' };
  }

  if (!STACK_ID_PATTERN.test(stackId)) {
    return {
      valid: false,
      error: `Invalid stack ID: "${stackId}". Must match /^[a-z0-9][a-z0-9._-]*$/`,
    };
  }

  return { valid: true };
}

/**
 * Validate sections object contains all required sections
 * @param {Object} sections - Sections object
 * @returns {Object} - { valid: boolean, missing?: string[] }
 */
function validateSections(sections) {
  if (!sections || typeof sections !== 'object') {
    return {
      valid: false,
      missing: REQUIRED_SECTIONS,
    };
  }

  const missing = REQUIRED_SECTIONS.filter(
    (name) => !sections[name] || typeof sections[name] !== 'string' || sections[name].trim() === ''
  );

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

/**
 * Write stack cache files
 *
 * @param {Object} options
 * @param {string} options.stack - Stack ID (e.g., 'mybatis', 'spring-boot-3.x')
 * @param {Object} options.sections - Section contents { SUMMARY: "...", ... }
 * @param {string} [options.home] - Home directory (defaults to os.homedir())
 * @returns {Array<string>} - Array of written file paths
 * @throws {Error} - On validation failure or write error
 */
function writeStackCache({ stack, sections, home }) {
  home = home || os.homedir();

  // Validate stack ID
  const stackValidation = validateStackId(stack);
  if (!stackValidation.valid) {
    throw new Error(stackValidation.error);
  }

  // Validate sections
  const sectionsValidation = validateSections(sections);
  if (!sectionsValidation.valid) {
    const missing = sectionsValidation.missing.join(', ');
    throw new Error(`Missing required sections: ${missing}`);
  }

  // Create stack directory
  const stackDir = path.join(home, '.viepilot', 'stacks', stack);
  try {
    fs.mkdirSync(stackDir, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create stack directory: ${err.message}`);
  }

  // Get current date in ISO format
  const now = new Date().toISOString().split('T')[0];

  const writtenPaths = [];

  // Write each section
  for (const sectionName of REQUIRED_SECTIONS) {
    const content = sections[sectionName];
    const fileName = `${sectionName}.md`;
    const filePath = path.join(stackDir, fileName);

    // Add header with stack ID and date
    const header = `<!-- stack: ${stack}, cached: ${now} -->\n\n`;
    const fileContent = header + content;

    try {
      fs.writeFileSync(filePath, fileContent, 'utf8');
      writtenPaths.push(filePath);
    } catch (err) {
      throw new Error(`Failed to write ${fileName}: ${err.message}`);
    }
  }

  return writtenPaths;
}

module.exports = {
  writeStackCache,
  parseSections,
  validateStackId,
  validateSections,
  REQUIRED_SECTIONS,
};
