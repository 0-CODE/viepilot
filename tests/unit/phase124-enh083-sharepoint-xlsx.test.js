'use strict';

const path = require('path');
const fs   = require('fs');
const os   = require('os');

const { classifyTicket } = require('../../lib/intake/classifier.cjs');
const {
  readExcelM365,
  AuthRequiredError,
  clearTokenCache,
  isSharingLink,
  parseXlsxBuffer,
  autoDetectColumnMap,
  HEADER_ALIASES,
} = require('../../lib/intake/adapters/excel-m365.cjs');

// ---------------------------------------------------------------------------
// classifier — new BUG keywords (ENH-083 Gap 3)
// ---------------------------------------------------------------------------

describe('Phase 124 — ENH-083: Classifier — performance/slow/timeout keywords', () => {
  test('"performance issue" classifies as BUG', () => {
    expect(classifyTicket({ title: 'performance issue in dashboard', description: '' }).classified).toBe('BUG');
  });

  test('"slow response" classifies as BUG', () => {
    expect(classifyTicket({ title: 'slow response on checkout page', description: '' }).classified).toBe('BUG');
  });

  test('"timeout error" classifies as BUG', () => {
    expect(classifyTicket({ title: 'timeout error when saving', description: '' }).classified).toBe('BUG');
  });

  test('"hang" classifies as BUG', () => {
    expect(classifyTicket({ title: 'app hang after upload', description: '' }).classified).toBe('BUG');
  });

  test('"freeze" classifies as BUG', () => {
    expect(classifyTicket({ title: 'UI freeze on mobile', description: '' }).classified).toBe('BUG');
  });

  test('Vietnamese "chậm" classifies as BUG', () => {
    expect(classifyTicket({ title: 'trang web chậm quá', description: '' }).classified).toBe('BUG');
  });

  test('Vietnamese "treo" classifies as BUG', () => {
    expect(classifyTicket({ title: 'ứng dụng bị treo', description: '' }).classified).toBe('BUG');
  });

  test('Vietnamese "tắc" classifies as BUG', () => {
    expect(classifyTicket({ title: 'hệ thống bị tắc', description: '' }).classified).toBe('BUG');
  });
});

// ---------------------------------------------------------------------------
// isSharingLink
// ---------------------------------------------------------------------------

describe('Phase 124 — ENH-083: isSharingLink detection', () => {
  test('/:x:/g/ URL is a sharing link', () => {
    expect(isSharingLink('https://xxx.sharepoint.com/:x:/g/personal/user/EdXXX')).toBe(true);
  });

  test('/:x:/r/ URL is a sharing link', () => {
    expect(isSharingLink('https://xxx.sharepoint.com/:x:/r/personal/user/EdXXX')).toBe(true);
  });

  test('Doc.aspx?sourcedoc= URL is NOT a sharing link', () => {
    expect(isSharingLink('https://xxx.sharepoint.com/_layouts/15/Doc.aspx?sourcedoc=%7BUUID%7D')).toBe(false);
  });

  test('empty string is not a sharing link', () => {
    expect(isSharingLink('')).toBe(false);
  });

  test('regular https URL is not a sharing link', () => {
    expect(isSharingLink('https://example.com/file.xlsx')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// readExcelM365 — routing logic
// ---------------------------------------------------------------------------

describe('Phase 124 — ENH-083: readExcelM365 routing', () => {
  const tmpDir = os.tmpdir();

  beforeEach(() => {
    clearTokenCache();
  });

  test('throws AuthRequiredError when no sharing_url and no workbook_id', async () => {
    const channel = { id: 'test', type: 'excel_m365', name: 'Test', column_map: { title: 'A' } };
    await expect(readExcelM365(channel, tmpDir)).rejects.toThrow(AuthRequiredError);
  });

  test('throws when sharing_url is not a valid sharing link format', async () => {
    const channel = {
      id: 'test',
      sharing_url: 'https://xxx.sharepoint.com/_layouts/15/Doc.aspx?sourcedoc=%7Bfoo%7D',
      column_map: { title: 'A' },
    };
    await expect(readExcelM365(channel, tmpDir)).rejects.toThrow(/not a SharePoint sharing link/);
  });

  test('throws AuthRequiredError when workbook_id set but credentials missing', async () => {
    const channel = {
      id: 'test',
      workbook_id: 'FAKE_ID',
      column_map: { title: 'A' },
    };
    await expect(readExcelM365(channel, tmpDir)).rejects.toThrow(AuthRequiredError);
  });
});

// ---------------------------------------------------------------------------
// parseXlsxBuffer
// ---------------------------------------------------------------------------

describe('Phase 124 — ENH-083: parseXlsxBuffer', () => {
  // Build a minimal xlsx in-memory using SheetJS
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch {
    XLSX = null;
  }

  const skip = XLSX ? test : test.skip;

  skip('parses xlsx buffer to row arrays', () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['ID', 'Title', 'Description'],
      ['1', 'Login crash', 'App crashes on login'],
      ['2', 'Add export feature', ''],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    const rows = parseXlsxBuffer(buf, 'Sheet1');
    expect(rows).toHaveLength(3); // header + 2 data rows
    expect(rows[0]).toEqual(['ID', 'Title', 'Description']);
    expect(rows[1][1]).toBe('Login crash');
  });

  skip('falls back to first sheet when requested sheet not found', () => {
    const ws = XLSX.utils.aoa_to_sheet([['A', 'B'], ['1', '2']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const buf = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    const rows = parseXlsxBuffer(buf, 'NonExistentSheet');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(['A', 'B']);
  });

  skip('returns empty array for empty sheet', () => {
    const wb = XLSX.utils.book_new();
    const ws = {};
    ws['!ref'] = 'A1:A1';
    XLSX.utils.book_append_sheet(wb, ws, 'Empty');
    const buf = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    const rows = parseXlsxBuffer(buf, 'Empty');
    expect(Array.isArray(rows)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BUG-030: autoDetectColumnMap — column_map undefined / auto-detect
// ---------------------------------------------------------------------------

describe('BUG-030: autoDetectColumnMap', () => {
  test('HEADER_ALIASES is exported and has required fields', () => {
    expect(HEADER_ALIASES).toHaveProperty('id');
    expect(HEADER_ALIASES).toHaveProperty('title');
    expect(HEADER_ALIASES).toHaveProperty('description');
    expect(HEADER_ALIASES).toHaveProperty('status');
  });

  test('autoDetectColumnMap maps STT → id (column A)', () => {
    const header = ['STT', 'Tên', 'Mô tả'];
    const map = autoDetectColumnMap(header);
    expect(map.id).toBe('A');
  });

  test('autoDetectColumnMap maps "Mô tả lỗi" → description (column B)', () => {
    const header = ['', 'Mô tả lỗi', ''];
    const map = autoDetectColumnMap(header);
    expect(map.description).toBe('B');
  });

  test('autoDetectColumnMap maps Vietnamese "Màn hình" → title', () => {
    const header = ['STT', 'Màn hình', 'Mô tả lỗi', 'Thao tác', 'Hình ảnh', ''];
    const map = autoDetectColumnMap(header);
    expect(map.title).toBe('B');
    expect(map.description).toBe('C');
  });

  test('autoDetectColumnMap maps English "title" header', () => {
    const header = ['ID', 'Title', 'Description', 'Status'];
    const map = autoDetectColumnMap(header);
    expect(map.title).toBe('B');
    expect(map.description).toBe('C');
    expect(map.status).toBe('D');
  });

  test('autoDetectColumnMap returns empty object for empty header', () => {
    const map = autoDetectColumnMap([]);
    expect(map).toEqual({});
  });

  test('autoDetectColumnMap handles columns beyond Z (AA, AB)', () => {
    const header = Array(27).fill('');
    header[26] = 'Title';
    const map = autoDetectColumnMap(header);
    expect(map.title).toBe('AA');
  });
});
