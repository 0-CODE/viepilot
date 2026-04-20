/**
 * ViePilot Skill Registry — scanner + registry builder (FEAT-020 Phase 1).
 *
 * Registry file: ~/.viepilot/skill-registry.json
 * Schema:
 *   version        — "1.0"
 *   last_scan      — ISO datetime
 *   scan_paths     — adapter skillsDir paths scanned
 *   skills[]       — indexed skill entries (deduplicated by id)
 *
 * Extended SKILL.md format (optional sections):
 *   ## Capabilities   — one capability per line (- prefix)
 *   ## Tags           — comma-separated or one per line
 *   ## Best Practices — one practice per line (- prefix)
 *
 * Legacy SKILL.md (no extended sections) → fields default to []
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const REGISTRY_REL = path.join('.viepilot', 'skill-registry.json');
const REGISTRY_VERSION = '1.0';

// ---------------------------------------------------------------------------
// Section parsers
// ---------------------------------------------------------------------------

/**
 * Parse a SKILL.md string and extract extended metadata.
 * Falls back gracefully when sections are absent.
 * @param {string} content
 * @returns {{ description: string, capabilities: string[], tags: string[], best_practices: string[] }}
 */
function parseSkillMd(content) {
  const lines = content.split('\n');

  // Extract first non-empty non-heading paragraph as description
  let description = '';
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('#')) { description = t; break; }
  }

  return {
    description,
    capabilities:   extractListSection(content, 'Capabilities'),
    tags:           extractTagsSection(content, 'Tags'),
    best_practices: extractListSection(content, 'Best Practices'),
  };
}

/**
 * Extract a `- item` list under `## {sectionName}`.
 * @param {string} content
 * @param {string} sectionName
 * @returns {string[]}
 */
function extractListSection(content, sectionName) {
  const re = new RegExp(`^##\\s+${sectionName}\\s*$`, 'im');
  const match = re.exec(content);
  if (!match) return [];

  const afterHeader = content.slice(match.index + match[0].length);
  const items = [];
  for (const line of afterHeader.split('\n')) {
    const t = line.trim();
    if (t.startsWith('## ')) break;          // next section — stop
    const itemMatch = t.match(/^-\s+(.+)/);
    if (itemMatch) items.push(itemMatch[1].trim());
  }
  return items;
}

/**
 * Extract comma-separated or line-per-item tags under `## Tags`.
 * @param {string} content
 * @param {string} sectionName
 * @returns {string[]}
 */
function extractTagsSection(content, sectionName) {
  const re = new RegExp(`^##\\s+${sectionName}\\s*$`, 'im');
  const match = re.exec(content);
  if (!match) return [];

  const afterHeader = content.slice(match.index + match[0].length);
  const raw = [];
  for (const line of afterHeader.split('\n')) {
    const t = line.trim();
    if (t.startsWith('## ')) break;
    if (t.startsWith('- ')) { raw.push(t.slice(2).trim()); continue; }
    if (t) {
      // Comma-separated on one line
      raw.push(...t.split(',').map(s => s.trim()).filter(Boolean));
    }
  }
  return raw.filter(Boolean);
}

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

/**
 * Scan all adapter skillsDirs, parse SKILL.md files, build registry.
 * Writes ~/.viepilot/skill-registry.json and returns the registry object.
 *
 * @param {string} [home] Override home directory (defaults to os.homedir())
 * @returns {{ version: string, last_scan: string, scan_paths: string[], skills: object[] }}
 */
function scanSkills(home) {
  const homeDir = home || os.homedir();
  const { listAdapters } = require('./adapters/index.cjs');
  const adapters = listAdapters();

  /** @type {Map<string, object>} */
  const skillMap = new Map();
  const scanPaths = [];

  for (const adapter of adapters) {
    const skillsDir = adapter.skillsDir(homeDir);
    scanPaths.push(skillsDir);

    if (!fs.existsSync(skillsDir)) continue;

    let entries;
    try { entries = fs.readdirSync(skillsDir, { withFileTypes: true }); }
    catch (_) { continue; }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillDir  = path.join(skillsDir, entry.name);
      const skillMdPath = path.join(skillDir, 'SKILL.md');

      if (!fs.existsSync(skillMdPath)) continue;

      let mdContent = '';
      try { mdContent = fs.readFileSync(skillMdPath, 'utf8'); }
      catch (_) { /* skip unreadable */ }

      const parsed  = parseSkillMd(mdContent);
      const skillId = entry.name;

      if (skillMap.has(skillId)) {
        // Merge — same skill found in multiple adapter dirs
        const existing = skillMap.get(skillId);
        if (!existing.adapters.includes(adapter.id)) {
          existing.adapters.push(adapter.id);
        }
        existing.installed_paths[adapter.id] = skillDir;
      } else {
        skillMap.set(skillId, {
          id:              skillId,
          name:            skillId,      // display name = dir name by default
          source:          null,
          version:         null,
          description:     parsed.description,
          capabilities:    parsed.capabilities,
          tags:            parsed.tags,
          best_practices:  parsed.best_practices,
          adapters:        [adapter.id],
          installed_paths: { [adapter.id]: skillDir },
        });
      }
    }
  }

  const registry = {
    version:    REGISTRY_VERSION,
    last_scan:  new Date().toISOString(),
    scan_paths: scanPaths,
    skills:     [...skillMap.values()],
  };

  // Write registry to ~/.viepilot/skill-registry.json
  const registryDir = path.join(homeDir, '.viepilot');
  if (!fs.existsSync(registryDir)) fs.mkdirSync(registryDir, { recursive: true });
  fs.writeFileSync(
    path.join(registryDir, 'skill-registry.json'),
    JSON.stringify(registry, null, 2),
    'utf8'
  );

  return registry;
}

// ---------------------------------------------------------------------------
// Registry reader
// ---------------------------------------------------------------------------

/**
 * Load the current skill registry from disk.
 * Returns null if the registry has not been written yet.
 *
 * @param {string} [home] Override home directory (defaults to os.homedir())
 * @returns {object|null}
 */
function loadRegistry(home) {
  const homeDir = home || os.homedir();
  const registryPath = path.join(homeDir, '.viepilot', 'skill-registry.json');
  if (!fs.existsSync(registryPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch (_) {
    return null;
  }
}

module.exports = { scanSkills, loadRegistry, parseSkillMd };
