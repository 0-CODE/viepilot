'use strict';

const path = require('path');
const fs   = require('fs');
const os   = require('os');

const { classifyTicket } = require('../../lib/intake/classifier.cjs');
const { readCsv }        = require('../../lib/intake/adapters/csv.cjs');
const { readGoogleSheet, AuthRequiredError: GsAuthError }  = require('../../lib/intake/adapters/google-sheets.cjs');
const { readExcelM365, AuthRequiredError: M365AuthError }  = require('../../lib/intake/adapters/excel-m365.cjs');
const { validateChannel, loadChannels, getChannelById }    = require('../../lib/intake/channels.cjs');
const { nextRequestNumber } = require('../../lib/intake/triage-ux.cjs');
const { generateTriageReport } = require('../../lib/intake/report.cjs');

const FIXTURES = path.join(__dirname, '..', 'fixtures');

// ---------------------------------------------------------------------------
// classifier.cjs
// ---------------------------------------------------------------------------

describe('Phase 123 — ENH-082: Ticket Intake — classifier', () => {
  test('classifyTicket returns BUG for "login crash"', () => {
    expect(classifyTicket({ title: 'login crash', description: '' })).toBe('BUG');
  });

  test('classifyTicket returns ENH for "add export feature"', () => {
    expect(classifyTicket({ title: 'add export feature', description: '' })).toBe('ENH');
  });

  test('classifyTicket returns UNCLEAR for neutral text', () => {
    expect(classifyTicket({ title: 'quarterly review', description: '' })).toBe('UNCLEAR');
  });

  test('classifyTicket returns BUG for Vietnamese "lỗi đăng nhập"', () => {
    expect(classifyTicket({ title: 'lỗi đăng nhập', description: '' })).toBe('BUG');
  });

  test('classifyTicket returns ENH for Vietnamese "thêm tính năng xuất báo cáo"', () => {
    expect(classifyTicket({ title: 'thêm tính năng xuất báo cáo', description: '' })).toBe('ENH');
  });

  test('BUG takes precedence when both signals present', () => {
    expect(classifyTicket({ title: 'fix the new feature crash', description: '' })).toBe('BUG');
  });

  test('classifyTicket is case-insensitive', () => {
    expect(classifyTicket({ title: 'LOGIN CRASH', description: '' })).toBe('BUG');
    expect(classifyTicket({ title: 'ADD FEATURE', description: '' })).toBe('ENH');
  });

  test('classifyTicket checks description as well as title', () => {
    expect(classifyTicket({ title: 'unknown issue', description: 'app crashes on startup' })).toBe('BUG');
  });
});

// ---------------------------------------------------------------------------
// csv adapter
// ---------------------------------------------------------------------------

describe('Phase 123 — ENH-082: Ticket Intake — CSV adapter', () => {
  const csvChannel = {
    id: 'test-csv',
    type: 'csv',
    name: 'Test CSV',
    path: path.join(FIXTURES, 'sample-tickets.csv'),
    column_map: { id: 'ticket_id', title: 'summary', description: 'details', reporter: 'author', date: 'created_at', status: 'status' },
  };

  test('readCsv parses fixture with correct column map', async () => {
    const tickets = await readCsv(csvChannel);
    expect(tickets.length).toBeGreaterThanOrEqual(4);
    expect(tickets[0].id).toBe('T-001');
    expect(tickets[0].title).toBe('Login crash on mobile');
  });

  test('readCsv skips blank rows (both title and description empty)', async () => {
    const tickets = await readCsv(csvChannel);
    const ids = tickets.map((t) => t.id);
    expect(ids).not.toContain('T-003');
  });

  test('readCsv parses TSV (tab delimiter) file', async () => {
    const tsvChannel = {
      ...csvChannel,
      id: 'test-tsv',
      path: path.join(FIXTURES, 'sample-tickets.tsv'),
    };
    const tickets = await readCsv(tsvChannel);
    expect(tickets.length).toBe(2);
    expect(tickets[0].id).toBe('T-101');
  });

  test('readCsv attaches _source_row and _channel_id to each ticket', async () => {
    const tickets = await readCsv(csvChannel);
    expect(tickets[0]._source_row).toBe(1);
    expect(tickets[0]._channel_id).toBe('test-csv');
  });
});

// ---------------------------------------------------------------------------
// channels.cjs
// ---------------------------------------------------------------------------

describe('Phase 123 — ENH-082: Ticket Intake — channels config', () => {
  test('validateChannel throws when "type" field missing', () => {
    expect(() => validateChannel({ id: 'x', name: 'test', column_map: { title: 'A', description: 'B' } }))
      .toThrow(/missing required field.*type/i);
  });

  test('validateChannel throws when column_map.title missing', () => {
    expect(() => validateChannel({ id: 'x', type: 'csv', name: 'test', path: 'f.csv', column_map: { description: 'B' } }))
      .toThrow(/column_map missing required field.*title/i);
  });

  test('validateChannel throws for invalid type', () => {
    expect(() => validateChannel({ id: 'x', type: 'jira', name: 'test', column_map: { title: 'A', description: 'B' } }))
      .toThrow(/invalid channel type/i);
  });

  test('getChannelById returns null when not found', () => {
    expect(getChannelById('nonexistent', [])).toBeNull();
  });

  test('getChannelById returns correct channel', () => {
    const ch = { id: 'my-ch', type: 'csv', name: 'Test' };
    expect(getChannelById('my-ch', [ch])).toBe(ch);
  });
});

// ---------------------------------------------------------------------------
// Auth error guards
// ---------------------------------------------------------------------------

describe('Phase 123 — ENH-082: Ticket Intake — auth guards', () => {
  const tempDir = os.tmpdir();

  test('readGoogleSheet throws AuthRequiredError when credentials missing', async () => {
    const channel = { id: 't', spreadsheet_id: 'X', sheet_name: 'S1', column_map: { title: 'A', description: 'B' } };
    await expect(readGoogleSheet(channel, tempDir)).rejects.toMatchObject({ name: 'AuthRequiredError' });
  });

  test('readExcelM365 throws AuthRequiredError when credentials missing', async () => {
    const channel = { id: 't', workbook_id: 'X', sheet_name: 'S', column_map: { title: 'A', description: 'B' } };
    await expect(readExcelM365(channel, tempDir)).rejects.toMatchObject({ name: 'AuthRequiredError' });
  });
});

// ---------------------------------------------------------------------------
// triage-ux.cjs
// ---------------------------------------------------------------------------

describe('Phase 123 — ENH-082: Ticket Intake — triage helpers', () => {
  test('nextRequestNumber returns 1 when no existing requests of that type', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-intake-test-'));
    fs.mkdirSync(path.join(tempDir, '.viepilot', 'requests'), { recursive: true });
    expect(nextRequestNumber('BUG', tempDir)).toBe(1);
    expect(nextRequestNumber('ENH', tempDir)).toBe(1);
    fs.rmSync(tempDir, { recursive: true });
  });
});

// ---------------------------------------------------------------------------
// report.cjs
// ---------------------------------------------------------------------------

describe('Phase 123 — ENH-082: Ticket Intake — TRIAGE report', () => {
  test('generateTriageReport produces markdown with correct section headers', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-intake-report-'));
    const reportPath = generateTriageReport(
      { name: 'Test Channel', type: 'csv' },
      { accepted: [], declined: [], unclear: [] },
      tempDir,
    );
    const content = fs.readFileSync(reportPath, 'utf8');
    expect(content).toContain('## Summary');
    expect(content).toContain('## Accepted Tickets');
    expect(content).toContain('## Declined Tickets');
    expect(content).toContain('## Unclear Tickets');
    expect(content).toContain('# Triage Report — Test Channel');
    fs.rmSync(tempDir, { recursive: true });
  });

  test('generateTriageReport filename includes TRIAGE- prefix', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-intake-report2-'));
    const reportPath = generateTriageReport(
      { name: 'X', type: 'csv' },
      { accepted: [], declined: [], unclear: [] },
      tempDir,
    );
    expect(path.basename(reportPath)).toMatch(/^TRIAGE-/);
    fs.rmSync(tempDir, { recursive: true });
  });
});
