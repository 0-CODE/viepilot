'use strict';

const path = require('path');
const fs   = require('fs');
const os   = require('os');

const { isStubChannel, hasRealChannels, appendChannel } = require('../../lib/intake/channels.cjs');
const { slugify, extractSpreadsheetId } = require('../../lib/intake/setup-wizard.cjs');

// ---------------------------------------------------------------------------
// isStubChannel
// ---------------------------------------------------------------------------

describe('Phase 125 — ENH-084: isStubChannel', () => {
  test('id ending with -example is a stub', () => {
    expect(isStubChannel({ id: 'csv-example', type: 'csv', name: 'Local CSV Export' })).toBe(true);
  });

  test('channel with REPLACE_WITH_ value is a stub', () => {
    expect(isStubChannel({
      id: 'gsheet-example',
      type: 'google_sheets',
      name: 'Google Sheet Tickets',
      spreadsheet_id: 'REPLACE_WITH_SPREADSHEET_ID',
    })).toBe(true);
  });

  test('null / undefined is a stub', () => {
    expect(isStubChannel(null)).toBe(true);
    expect(isStubChannel(undefined)).toBe(true);
    expect(isStubChannel({})).toBe(true);
  });

  test('real channel with production id and no REPLACE_WITH_ is not a stub', () => {
    expect(isStubChannel({
      id: 'production-uat',
      type: 'csv',
      name: 'UAT Sheet',
      path: './reports/uat.csv',
      column_map: { title: 'summary', description: 'details' },
    })).toBe(false);
  });

  test('id that contains "example" in middle is not a stub', () => {
    expect(isStubChannel({ id: 'my-example-tickets', type: 'csv', name: 'Real' })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasRealChannels
// ---------------------------------------------------------------------------

describe('Phase 125 — ENH-084: hasRealChannels', () => {
  const stub = { id: 'csv-example', type: 'csv', name: 'x' };
  const real  = { id: 'prod', type: 'csv', name: 'y', path: './t.csv', column_map: { title: 'A', description: 'B' } };

  test('empty array → false', () => {
    expect(hasRealChannels([])).toBe(false);
  });

  test('only stubs → false', () => {
    expect(hasRealChannels([stub])).toBe(false);
  });

  test('mix of stub + real → true', () => {
    expect(hasRealChannels([stub, real])).toBe(true);
  });

  test('only real → true', () => {
    expect(hasRealChannels([real])).toBe(true);
  });

  test('non-array → false', () => {
    expect(hasRealChannels(null)).toBe(false);
    expect(hasRealChannels(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// appendChannel
// ---------------------------------------------------------------------------

describe('Phase 125 — ENH-084: appendChannel', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-wizard-test-'));
    // create .viepilot/intake/channels.json with scaffold stubs
    const intakeDir = path.join(tmpDir, '.viepilot', 'intake');
    fs.mkdirSync(intakeDir, { recursive: true });
    const scaffold = {
      channels: [
        { id: 'csv-example', type: 'csv', name: 'Example', path: './x.csv' },
        { id: 'gsheet-example', type: 'google_sheets', spreadsheet_id: 'REPLACE_WITH_SPREADSHEET_ID' },
      ],
    };
    fs.writeFileSync(path.join(intakeDir, 'channels.json'), JSON.stringify(scaffold, null, 2));
    // create .gitignore so initIntakeDir doesn't fail
    fs.writeFileSync(path.join(tmpDir, '.gitignore'), '');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('appends new channel and strips stubs', () => {
    const newCh = { id: 'prod', type: 'csv', name: 'Prod', path: './prod.csv', column_map: { title: 'A', description: 'B' } };
    appendChannel(tmpDir, newCh);

    const raw = JSON.parse(fs.readFileSync(path.join(tmpDir, '.viepilot', 'intake', 'channels.json'), 'utf8'));
    expect(raw.channels).toHaveLength(1);
    expect(raw.channels[0].id).toBe('prod');
  });

  test('preserves existing non-stub channels when appending', () => {
    const intakeDir = path.join(tmpDir, '.viepilot', 'intake');
    const existing = {
      channels: [
        { id: 'csv-example', type: 'csv' },
        { id: 'real-channel', type: 'csv', name: 'Real', path: './r.csv', column_map: { title: 'A', description: 'B' } },
      ],
    };
    fs.writeFileSync(path.join(intakeDir, 'channels.json'), JSON.stringify(existing, null, 2));

    const newCh = { id: 'another', type: 'csv', name: 'Another', path: './a.csv', column_map: { title: 'A', description: 'B' } };
    appendChannel(tmpDir, newCh);

    const raw = JSON.parse(fs.readFileSync(path.join(intakeDir, 'channels.json'), 'utf8'));
    expect(raw.channels).toHaveLength(2);
    const ids = raw.channels.map(c => c.id);
    expect(ids).toContain('real-channel');
    expect(ids).toContain('another');
  });
});

// ---------------------------------------------------------------------------
// setup-wizard helpers
// ---------------------------------------------------------------------------

describe('Phase 125 — ENH-084: slugify', () => {
  test('converts display name to kebab-case id', () => {
    expect(slugify('UAT Tickets Q2')).toBe('uat-tickets-q2');
  });

  test('strips special characters', () => {
    expect(slugify('My Channel! #1')).toBe('my-channel-1');
  });

  test('collapses multiple spaces/hyphens', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });
});

describe('Phase 125 — ENH-084: extractSpreadsheetId', () => {
  test('extracts ID from full Google Sheets URL', () => {
    expect(extractSpreadsheetId('https://docs.google.com/spreadsheets/d/ABC123xyz/edit#gid=0')).toBe('ABC123xyz');
  });

  test('passthrough when input is already just an ID', () => {
    expect(extractSpreadsheetId('ABC123xyz')).toBe('ABC123xyz');
  });

  test('trims whitespace from passthrough IDs', () => {
    expect(extractSpreadsheetId('  SHEET_ID  ')).toBe('SHEET_ID');
  });
});
