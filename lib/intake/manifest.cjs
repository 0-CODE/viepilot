'use strict';

const fs   = require('fs');
const path = require('path');

const DEFAULT_TTL_DAYS = 7;
const MANIFEST_DIR_REL = path.join('.viepilot', 'intake');

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function manifestPath(channelId, projectRoot) {
  const root = projectRoot || process.cwd();
  return path.join(root, MANIFEST_DIR_REL, `${slugify(channelId)}-manifest.json`);
}

function saveManifest(channelId, manifest, projectRoot) {
  const root = projectRoot || process.cwd();
  const dir  = path.join(root, MANIFEST_DIR_REL);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const data = {
    ...manifest,
    channel_id: slugify(channelId),
    saved_at:   new Date().toISOString(),
  };
  fs.writeFileSync(manifestPath(channelId, root), JSON.stringify(data, null, 2), 'utf8');
}

function loadManifest(channelId, projectRoot) {
  const p = manifestPath(channelId, projectRoot);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function isManifestFresh(manifest, ttlDays) {
  if (!manifest) return false;
  const days   = typeof ttlDays === 'number' ? ttlDays : DEFAULT_TTL_DAYS;
  const ts     = manifest.analyzed_at || manifest.saved_at;
  if (!ts) return false;
  const ageMs  = Date.now() - new Date(ts).getTime();
  return ageMs < days * 86400000;
}

function getColumnMap(manifest, sheetName) {
  if (!manifest || !Array.isArray(manifest.sheets)) return null;
  const sheet = sheetName
    ? manifest.sheets.find((s) => s.name === sheetName)
    : manifest.sheets[0];
  if (!sheet || !sheet.columns) return null;
  const map = {};
  for (const [col, def] of Object.entries(sheet.columns)) {
    if (def && def.field) map[def.field] = col;
  }
  return Object.keys(map).length ? map : {};
}

function getWriteBackConfig(manifest, sheetName) {
  if (!manifest || !Array.isArray(manifest.sheets)) return null;
  const sheet = sheetName
    ? manifest.sheets.find((s) => s.name === sheetName)
    : manifest.sheets[0];
  if (!sheet || !sheet.write_back) return null;
  return sheet.write_back;
}

module.exports = {
  saveManifest,
  loadManifest,
  isManifestFresh,
  getColumnMap,
  getWriteBackConfig,
  manifestPath,
  slugify,
  DEFAULT_TTL_DAYS,
};
