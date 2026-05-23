'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');

const {
  saveManifest, loadManifest, isManifestFresh, getColumnMap,
  getWriteBackConfig, manifestPath, slugify, DEFAULT_TTL_DAYS,
} = require('../../lib/intake/manifest.cjs');

const { writebackIntakeResponse } = require('../../lib/intake/writeback.cjs');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'vp-manifest-test-')); }

const SAMPLE_MANIFEST = {
  source_url:   'https://contoso.sharepoint.com/:x:/g/...',
  analyzed_at:  new Date().toISOString(),
  analyzer:     'excel-intake-agent@v1',
  sheets: [
    {
      name: 'BUG',
      purpose: 'bug-list',
      header_row: 0,
      data_start_row: 1,
      columns: {
        'A': { field: 'id',          header: 'STT' },
        'B': { field: 'title',       header: 'Màn hình' },
        'C': { field: 'description', header: 'Mô tả lỗi' },
        'F': { field: 'status',      header: '' },
      },
      write_back: {
        response_col:    'G',
        status_col:      'F',
        response_format: 'status|phase_link',
        example:         'Fixed ✓ | vp-p140-t4 | v3.7.0 | 2026-05-24',
      },
    },
    {
      name: 'Report',
      purpose: 'summary',
      note: 'Summary report — not for intake',
      columns: {},
    },
  ],
};

// ---------------------------------------------------------------------------
// Group 1: save / load
// ---------------------------------------------------------------------------

describe('Phase 140 — ENH-095: manifest.cjs — save/load', () => {
  test('saveManifest writes JSON file to .viepilot/intake/{slug}-manifest.json', () => {
    const tmp = tmpDir();
    saveManifest('My Channel', SAMPLE_MANIFEST, tmp);
    const p = manifestPath('My Channel', tmp);
    expect(fs.existsSync(p)).toBe(true);
    expect(p).toContain('my-channel-manifest.json');
  });

  test('loadManifest returns saved object with channel_id and saved_at', () => {
    const tmp = tmpDir();
    saveManifest('trip-tracking', SAMPLE_MANIFEST, tmp);
    const loaded = loadManifest('trip-tracking', tmp);
    expect(loaded).not.toBeNull();
    expect(loaded.channel_id).toBe('trip-tracking');
    expect(loaded.saved_at).toBeDefined();
    expect(loaded.sheets).toHaveLength(2);
  });

  test('loadManifest returns null for missing file', () => {
    const tmp = tmpDir();
    expect(loadManifest('nonexistent', tmp)).toBeNull();
  });

  test('saveManifest creates .viepilot/intake/ dir if it does not exist', () => {
    const tmp = tmpDir();
    const dir = path.join(tmp, '.viepilot', 'intake');
    expect(fs.existsSync(dir)).toBe(false);
    saveManifest('test-ch', SAMPLE_MANIFEST, tmp);
    expect(fs.existsSync(dir)).toBe(true);
  });

  test('slugify lowercases and replaces spaces with dashes', () => {
    expect(slugify('My Channel Name')).toBe('my-channel-name');
    expect(slugify('trip-tracking')).toBe('trip-tracking');
    expect(slugify('  hello  ')).toBe('hello');
  });

  test('DEFAULT_TTL_DAYS is 7', () => {
    expect(DEFAULT_TTL_DAYS).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// Group 2: isManifestFresh
// ---------------------------------------------------------------------------

describe('Phase 140 — ENH-095: manifest.cjs — isManifestFresh', () => {
  test('returns true for manifest saved just now', () => {
    const tmp = tmpDir();
    saveManifest('fresh', SAMPLE_MANIFEST, tmp);
    const loaded = loadManifest('fresh', tmp);
    expect(isManifestFresh(loaded, 7)).toBe(true);
  });

  test('returns false for manifest with analyzed_at 8 days ago', () => {
    const old = { ...SAMPLE_MANIFEST, analyzed_at: new Date(Date.now() - 8 * 86400000).toISOString() };
    expect(isManifestFresh(old, 7)).toBe(false);
  });

  test('falls back to saved_at when analyzed_at is missing', () => {
    const m = { saved_at: new Date().toISOString() };
    expect(isManifestFresh(m, 7)).toBe(true);
  });

  test('returns false for null manifest', () => {
    expect(isManifestFresh(null, 7)).toBe(false);
  });

  test('returns false when both analyzed_at and saved_at are missing', () => {
    expect(isManifestFresh({}, 7)).toBe(false);
  });

  test('uses custom TTL — 1 day old manifest is stale with ttl=0.5', () => {
    const m = { analyzed_at: new Date(Date.now() - 86400000).toISOString() };
    expect(isManifestFresh(m, 0.5)).toBe(false);
    expect(isManifestFresh(m, 2)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Group 3: getColumnMap
// ---------------------------------------------------------------------------

describe('Phase 140 — ENH-095: manifest.cjs — getColumnMap', () => {
  test('getColumnMap returns field→col map for named sheet', () => {
    const map = getColumnMap(SAMPLE_MANIFEST, 'BUG');
    expect(map).toEqual({ id: 'A', title: 'B', description: 'C', status: 'F' });
  });

  test('getColumnMap returns first sheet map when sheetName is null', () => {
    const map = getColumnMap(SAMPLE_MANIFEST, null);
    expect(map).toHaveProperty('id', 'A');
  });

  test('getColumnMap returns null for non-existent sheet', () => {
    expect(getColumnMap(SAMPLE_MANIFEST, 'DoesNotExist')).toBeNull();
  });

  test('getColumnMap returns empty object for sheet with empty columns', () => {
    expect(getColumnMap(SAMPLE_MANIFEST, 'Report')).toEqual({});
  });

  test('getColumnMap returns null for null manifest', () => {
    expect(getColumnMap(null, 'BUG')).toBeNull();
  });

  test('getColumnMap returns null for manifest with no sheets array', () => {
    expect(getColumnMap({ source_url: 'x' }, 'BUG')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Group 4: getWriteBackConfig
// ---------------------------------------------------------------------------

describe('Phase 140 — ENH-095: manifest.cjs — getWriteBackConfig', () => {
  test('returns write_back config for named sheet', () => {
    const cfg = getWriteBackConfig(SAMPLE_MANIFEST, 'BUG');
    expect(cfg).toMatchObject({ response_col: 'G', status_col: 'F' });
  });

  test('returns null for sheet without write_back (Report sheet)', () => {
    expect(getWriteBackConfig(SAMPLE_MANIFEST, 'Report')).toBeNull();
  });

  test('returns null for null manifest', () => {
    expect(getWriteBackConfig(null, 'BUG')).toBeNull();
  });

  test('returns null for non-existent sheet', () => {
    expect(getWriteBackConfig(SAMPLE_MANIFEST, 'Missing')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Group 5: writebackIntakeResponse — non-writable paths
// ---------------------------------------------------------------------------

describe('Phase 140 — ENH-095: writebackIntakeResponse — non-writable paths', () => {
  const response = { status: 'Fixed ✓', phaseTask: 'vp-p140-t4', version: 'v3.7.0', date: '2026-05-24' };

  test('sharing_url channel returns success:false with read-only error', async () => {
    const channel = { type: 'excel_m365', sharing_url: 'https://...', name: 'Test' };
    const result = await writebackIntakeResponse(channel, 1, response, os.tmpdir(), 'BUG', 'G');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/read-only/);
  });

  test('csv channel returns success:false without throwing', async () => {
    const channel = { type: 'csv', path: 'tickets.csv', name: 'CSV' };
    const result = await writebackIntakeResponse(channel, 1, response, os.tmpdir(), null, 'G');
    expect(result.success).toBe(false);
  });

  test('browser channel returns success:false without throwing', async () => {
    const channel = { type: 'browser', url: 'https://example.com', name: 'Web' };
    const result = await writebackIntakeResponse(channel, 0, response, os.tmpdir(), null, 'G');
    expect(result.success).toBe(false);
  });

  test('workbook_id channel with no credentials returns success:false with credentials error', async () => {
    const tmp = tmpDir();
    const channel = { type: 'excel_m365', workbook_id: 'fake-id', name: 'WB' };
    const result = await writebackIntakeResponse(channel, 1, response, tmp, 'BUG', 'G');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/credentials/i);
  });

  test('null channel returns success:false without throwing', async () => {
    const result = await writebackIntakeResponse(null, 1, response, os.tmpdir(), null, null);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Group 6: Agent doc contracts
// ---------------------------------------------------------------------------

describe('Phase 140 — ENH-095: Agent + workflow doc contracts', () => {
  const ROOT = path.join(__dirname, '../..');

  test('excel-intake-agent.md contains analyze_structure op section', () => {
    const content = fs.readFileSync(path.join(ROOT, 'agents/claude-code/excel-intake-agent.md'), 'utf8');
    expect(content).toMatch(/analyze_structure/);
    expect(content).toMatch(/Op: analyze_structure/);
  });

  test('sheets-intake-agent.md contains analyze_structure op section', () => {
    const content = fs.readFileSync(path.join(ROOT, 'agents/claude-code/sheets-intake-agent.md'), 'utf8');
    expect(content).toMatch(/analyze_structure/);
  });

  test('vp-intake SKILL.md contains Manifest Lifecycle section', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills/vp-intake/SKILL.md'), 'utf8');
    expect(content).toMatch(/Manifest Lifecycle/);
  });

  test('vp-intake SKILL.md has --analyze flag documented', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills/vp-intake/SKILL.md'), 'utf8');
    expect(content).toMatch(/--analyze/);
  });

  test('vp-intake SKILL.md has Step 5.5 Intake Source block', () => {
    const content = fs.readFileSync(path.join(ROOT, 'skills/vp-intake/SKILL.md'), 'utf8');
    expect(content).toMatch(/Intake Source/);
    expect(content).toMatch(/source_row/);
    expect(content).toMatch(/manifest_path/);
  });

  test('workflows/autonomous.md contains Post-PASS Intake Write-back section', () => {
    const content = fs.readFileSync(path.join(ROOT, 'workflows/autonomous.md'), 'utf8');
    expect(content).toMatch(/Post-PASS.*Intake Write-back|Intake Write-back.*ENH-095/);
    expect(content).toMatch(/writebackIntakeResponse/);
  });

  test('lib/intake/writeback.cjs exports writebackIntakeResponse', () => {
    const mod = require('../../lib/intake/writeback.cjs');
    expect(typeof mod.writebackIntakeResponse).toBe('function');
  });

  test('lib/intake/manifest.cjs exports all required functions', () => {
    const mod = require('../../lib/intake/manifest.cjs');
    expect(typeof mod.saveManifest).toBe('function');
    expect(typeof mod.loadManifest).toBe('function');
    expect(typeof mod.isManifestFresh).toBe('function');
    expect(typeof mod.getColumnMap).toBe('function');
    expect(typeof mod.getWriteBackConfig).toBe('function');
    expect(typeof mod.manifestPath).toBe('function');
  });
});
