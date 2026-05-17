'use strict';

const path = require('path');
const { appendChannel, initIntakeDir } = require('./channels.cjs');
const { isSharingLink } = require('./adapters/excel-m365.cjs');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractSpreadsheetId(urlOrId) {
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : urlOrId.trim();
}

function printCredentialsGuide(type) {
  if (type === 'google_sheets') {
    return [
      '',
      '  Google Sheets — Service Account setup:',
      '  1. Go to console.cloud.google.com → IAM & Admin → Service Accounts → Create',
      '  2. Create a key (JSON) → download it',
      '  3. Share your Google Sheet with the service account email',
      '  4. Save the JSON key to: .viepilot/.credentials/google-service-account.json',
      '',
    ].join('\n');
  }
  if (type === 'excel_m365') {
    return [
      '',
      '  Excel M365 — Azure App Registration:',
      '  1. Go to portal.azure.com → Azure Active Directory → App Registrations → New',
      '  2. Add API permission: Microsoft Graph → Files.Read.All (Application)',
      '  3. Grant admin consent → Certificates & Secrets → New client secret',
      '  4. Save to: .viepilot/.credentials/m365-credentials.json',
      '     { "tenant_id": "...", "client_id": "...", "client_secret": "..." }',
      '',
    ].join('\n');
  }
  return '';
}

// ─── Per-type config collectors ───────────────────────────────────────────────

async function collectCsvConfig(name, id, askFn) {
  const filePath = await askFn('Đường dẫn file CSV/TSV? (relative to project root, vd: ./reports/tickets.csv)', null, false);
  const titleCol = await askFn('Header tên cột TITLE là gì? (vd: summary)', null, false);
  const descCol  = await askFn('Header tên cột DESCRIPTION là gì? (vd: details)', null, false);
  const repCol   = await askFn('Header tên cột REPORTER? (để trống nếu không có)', null, false);
  const dateCol  = await askFn('Header tên cột DATE? (để trống nếu không có)', null, false);

  const column_map = { title: titleCol, description: descCol };
  if (repCol)  column_map.reporter = repCol;
  if (dateCol) column_map.date = dateCol;

  return { id, type: 'csv', name, path: filePath, column_map };
}

async function collectGSheetsConfig(name, id, askFn) {
  const rawId     = await askFn('Spreadsheet ID hoặc URL Google Sheets?', null, false);
  const spreadId  = extractSpreadsheetId(rawId);
  const sheetName = await askFn('Sheet name? (mặc định: Sheet1 — để trống dùng Sheet1)', null, false) || 'Sheet1';
  const titleCol  = await askFn('Cột TITLE ở cột letter nào? (vd: B)', null, false);
  const descCol   = await askFn('Cột DESCRIPTION? (vd: C)', null, false);
  const repCol    = await askFn('Cột REPORTER? (optional, để trống nếu không có)', null, false);
  const dateCol   = await askFn('Cột DATE? (optional)', null, false);

  const column_map = { title: titleCol.toUpperCase(), description: descCol.toUpperCase() };
  if (repCol)  column_map.reporter = repCol.toUpperCase();
  if (dateCol) column_map.date = dateCol.toUpperCase();

  return { id, type: 'google_sheets', name, spreadsheet_id: spreadId, sheet_name: sheetName, column_map };
}

async function collectM365Config(name, id, askFn) {
  const workbookId = await askFn('Workbook ID? (từ SharePoint URL, dạng item ID)', null, false);
  const sheetName  = await askFn('Sheet name? (mặc định: Sheet1)', null, false) || 'Sheet1';
  const titleCol   = await askFn('Cột TITLE? (letter, vd: B)', null, false);
  const descCol    = await askFn('Cột DESCRIPTION? (vd: C)', null, false);
  const repCol     = await askFn('Cột REPORTER? (optional)', null, false);
  const dateCol    = await askFn('Cột DATE? (optional)', null, false);

  const column_map = { title: titleCol.toUpperCase(), description: descCol.toUpperCase() };
  if (repCol)  column_map.reporter = repCol.toUpperCase();
  if (dateCol) column_map.date = dateCol.toUpperCase();

  return { id, type: 'excel_m365', name, workbook_id: workbookId, sheet_name: sheetName, column_map };
}

async function collectSharePointConfig(name, id, askFn) {
  let sharingUrl = '';
  while (!isSharingLink(sharingUrl)) {
    sharingUrl = await askFn(
      'SharePoint sharing URL? (dạng https://xxx.sharepoint.com/:x:/g/... hoặc /:x:/r/...)',
      null,
      false
    );
    if (!isSharingLink(sharingUrl)) {
      process.stdout.write('  ⚠  URL không đúng định dạng sharing link. Vui lòng dán đúng URL chia sẻ.\n');
    }
  }

  const sheetName = await askFn('Sheet name? (để trống = dùng sheet đầu tiên)', null, false) || '';
  const titleCol  = await askFn('Cột TITLE? (letter, vd: B)', null, false);
  const descCol   = await askFn('Cột DESCRIPTION? (vd: C)', null, false);
  const repCol    = await askFn('Cột REPORTER? (optional)', null, false);
  const dateCol   = await askFn('Cột DATE? (optional)', null, false);

  const column_map = { title: titleCol.toUpperCase(), description: descCol.toUpperCase() };
  if (repCol)  column_map.reporter = repCol.toUpperCase();
  if (dateCol) column_map.date = dateCol.toUpperCase();

  const ch = { id, type: 'excel_m365', name, sharing_url: sharingUrl, column_map };
  if (sheetName) ch.sheet_name = sheetName;
  return ch;
}

// ─── Single channel wizard ────────────────────────────────────────────────────

const CHANNEL_TYPE_OPTIONS = [
  { label: 'CSV / TSV file (local)',                 description: 'Đọc từ file .csv hoặc .tsv trên máy' },
  { label: 'Google Sheets',                          description: 'Đọc từ Google Sheets qua Service Account' },
  { label: 'Excel M365 — Graph API (Azure App)',     description: 'Đọc từ OneDrive/SharePoint qua Microsoft Graph API' },
  { label: 'SharePoint Sharing Link (no credentials)', description: 'Dán link chia sẻ SharePoint — không cần cấu hình OAuth' },
];

async function wizardOneChannel(projectRoot, askFn) {
  // Step 1 — loại channel
  const typeChoice = await askFn(
    'Bạn muốn cấu hình loại nguồn ticket nào?',
    CHANNEL_TYPE_OPTIONS,
    false
  );

  // Step 2 — display name → id
  const name = await askFn('Tên hiển thị cho channel này? (vd: UAT Tickets Q2)', null, false);
  const id   = slugify(name) || `channel-${Date.now()}`;

  // Step 3 — collect per-type fields
  let channelObj;
  if (typeChoice === 'CSV / TSV file (local)') {
    channelObj = await collectCsvConfig(name, id, askFn);
  } else if (typeChoice === 'Google Sheets') {
    process.stdout.write(printCredentialsGuide('google_sheets'));
    channelObj = await collectGSheetsConfig(name, id, askFn);
  } else if (typeChoice === 'Excel M365 — Graph API (Azure App)') {
    process.stdout.write(printCredentialsGuide('excel_m365'));
    channelObj = await collectM365Config(name, id, askFn);
  } else {
    // SharePoint Sharing Link
    channelObj = await collectSharePointConfig(name, id, askFn);
  }

  // Step 4 — preview + confirm
  process.stdout.write('\n  Preview cấu hình:\n');
  process.stdout.write(JSON.stringify(channelObj, null, 2).split('\n').map(l => '  ' + l).join('\n'));
  process.stdout.write('\n');

  const confirm = await askFn('Lưu cấu hình này?', [
    { label: 'Lưu',         description: 'Ghi channel vào channels.json' },
    { label: 'Cấu hình lại', description: 'Nhập lại thông tin channel này' },
    { label: 'Huỷ',          description: 'Bỏ qua channel này' },
  ], false);

  if (confirm === 'Cấu hình lại') {
    return wizardOneChannel(projectRoot, askFn);
  }
  if (confirm === 'Huỷ') {
    return null;
  }

  // Step 5 — write
  appendChannel(projectRoot, channelObj);
  process.stdout.write(`\n  ✓ Channel "${name}" đã được lưu vào .viepilot/intake/channels.json\n\n`);
  return channelObj;
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Run the interactive setup wizard.
 * @param {string} projectRoot
 * @param {Function} askFn  async (question, options, multiSelect) → string
 * @returns {object|null}  last channel created, or null if none
 */
async function runSetupWizard(projectRoot, askFn) {
  initIntakeDir(projectRoot);
  process.stdout.write('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.stdout.write(' VP-INTAKE ► Setup Wizard\n');
  process.stdout.write('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

  let lastCreated = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ch = await wizardOneChannel(projectRoot, askFn);
    if (ch) lastCreated = ch;

    const more = await askFn('Cấu hình thêm channel khác?', [
      { label: 'Không — tiếp tục import', description: 'Chuyển sang chọn channel và import ticket' },
      { label: 'Có — thêm channel',       description: 'Cấu hình thêm một nguồn ticket nữa' },
    ], false);

    if (more !== 'Có — thêm channel') break;
  }

  return lastCreated;
}

module.exports = { runSetupWizard, slugify, extractSpreadsheetId };
