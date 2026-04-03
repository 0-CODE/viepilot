/**
 * ENH-022: executable subset of crystallize Step 11A dependency validation.
 * Parses Step 6A Domain Entity Manifest tables and scans task text for dependency patterns.
 */

/**
 * @param {string} md
 * @param {string} heading without leading ##
 */
function extractMarkdownSection(md, heading) {
  const re = new RegExp(`^## ${heading}\\s*$`, 'mi');
  const m = md.match(re);
  if (!m) return null;
  const start = m.index + m[0].length;
  const rest = md.slice(start);
  const next = rest.search(/^## /m);
  return next === -1 ? rest : rest.slice(0, next);
}

/**
 * @param {string} md full SPEC or combined doc containing ## Domain Entity Manifest
 * @returns {Array<{ entity: string, type: string, needs_crud_api: string, servicePhase: string, status: string }>}
 */
function parseDomainEntityManifest(md) {
  const section = extractMarkdownSection(md, 'Domain Entity Manifest');
  if (!section) return [];

  const rows = [];
  const lines = section.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (/^\|[\s:|-]+\|\s*$/.test(trimmed)) continue;

    const cells = trimmed
      .split('|')
      .map((c) => c.trim())
      .slice(1, -1);
    if (cells.length < 5) continue;

    const [entity, type, needs, servicePhase, status] = cells;
    if (!entity || /^entity$/i.test(entity)) continue;

    rows.push({
      entity,
      type,
      needs_crud_api: needs.toLowerCase(),
      servicePhase,
      status,
    });
  }
  return rows;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Step 11A.1 patterns — {entity} replaced with manifest name (case-insensitive).
 * @param {string} entity
 * @returns {RegExp[]}
 */
function dependencyPatternsForEntity(entity) {
  const e = escapeRegExp(entity);
  const flags = 'i';
  return [
    new RegExp(`resolve\\s+${e}`, flags),
    new RegExp(`create\\s+${e}`, flags),
    new RegExp(`update\\s+${e}`, flags),
    new RegExp(`delete\\s+${e}`, flags),
    new RegExp(`manage\\s+${e}`, flags),
    new RegExp(`lookup\\s+${e}`, flags),
    new RegExp(`enrich\\s+${e}`, flags),
    new RegExp(`fetch\\s+${e}`, flags),
    new RegExp(`${e}Service`, flags),
    new RegExp(`${e}Repository`, flags),
  ];
}

function taskReferencesEntity(entity, scanText) {
  if (!scanText || !entity) return false;
  return dependencyPatternsForEntity(entity).some((r) => r.test(scanText));
}

function isMissingServicePhase(row) {
  return /MISSING/i.test(row.servicePhase) || /MISSING/i.test(row.status);
}

/**
 * @param {ReturnType<typeof parseDomainEntityManifest>} manifestRows
 * @param {string} scanText combined task + spec text
 * @returns {Array<{ entity: string, gapType: string, matchedPatterns: string[] }>}
 */
function findEntityDependencyGaps(manifestRows, scanText) {
  const gaps = [];
  for (const row of manifestRows) {
    if (row.needs_crud_api !== 'yes') continue;
    if (!isMissingServicePhase(row)) continue;
    if (!taskReferencesEntity(row.entity, scanText)) continue;

    const matched = dependencyPatternsForEntity(row.entity)
      .filter((r) => r.test(scanText))
      .map((r) => r.source);
    gaps.push({
      entity: row.entity,
      gapType: 'MISSING service phase',
      matchedPatterns: matched,
    });
  }
  return gaps;
}

/**
 * @param {{ specMd: string, roadmapMd: string }} parts
 */
function runEnh022DependencyCheck(parts) {
  const manifest = parseDomainEntityManifest(parts.specMd);
  const scanText = `${parts.roadmapMd}\n${parts.specMd}`;
  return findEntityDependencyGaps(manifest, scanText);
}

module.exports = {
  parseDomainEntityManifest,
  findEntityDependencyGaps,
  runEnh022DependencyCheck,
  taskReferencesEntity,
  extractMarkdownSection,
};
