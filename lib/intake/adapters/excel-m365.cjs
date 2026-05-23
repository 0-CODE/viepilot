'use strict';

const fs    = require('fs');
const os    = require('os');
const path  = require('path');
const https = require('https');

const CREDENTIALS_REL = path.join('.viepilot', '.credentials', 'm365-credentials.json');

const SETUP_GUIDE = `
Microsoft 365 / Excel setup:
  1. Go to portal.azure.com → Azure Active Directory → App Registrations → New
  2. Add API permission: Microsoft Graph → Files.Read.All (Application) → Grant admin consent
  3. Certificates & Secrets → New client secret → copy value immediately
  4. Save credentials to: .viepilot/.credentials/m365-credentials.json
     { "tenant_id": "...", "client_id": "...", "client_secret": "..." }
  5. In channels.json, set "workbook_id" to the file's drive item ID
     (visible in the file's URL on SharePoint/OneDrive)
  6. Re-run vp-intake

For SharePoint sharing links ("Anyone with the link"), use "sharing_url" in channels.json
instead of "workbook_id" — no credentials required.
`;

class AuthRequiredError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AuthRequiredError';
  }
}

let _tokenCache = null;

function colLetterToIndex(letter) {
  let index = 0;
  for (const ch of letter.toUpperCase()) {
    index = index * 26 + ch.charCodeAt(0) - 64;
  }
  return index - 1;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function httpsPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(payload), ...headers },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: { Accept: 'application/json', ...headers },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Follow redirects and return {status, headers, body, cookies}.
 * Cookies (Set-Cookie) are accumulated across all redirects and forwarded
 * on each hop — required for SharePoint FedAuth session cookies.
 */
function httpsGetRaw(url, headers = {}, maxRedirects = 8) {
  return new Promise((resolve, reject) => {
    function doGet(currentUrl, remaining, accCookies) {
      const urlObj = new URL(currentUrl);
      const reqHeaders = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        ...headers,
      };
      if (accCookies) reqHeaders['Cookie'] = accCookies;

      const req = https.request({
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: reqHeaders,
      }, (res) => {
        // Accumulate Set-Cookie headers across redirects
        const setCookies = (res.headers['set-cookie'] || []).map((c) => c.split(';')[0]);
        const newCookies = setCookies.length
          ? [accCookies, ...setCookies].filter(Boolean).join('; ')
          : accCookies;

        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && remaining > 0) {
          let nextUrl = res.headers.location;
          if (!nextUrl.startsWith('http')) {
            nextUrl = `${urlObj.protocol}//${urlObj.host}${nextUrl}`;
          }
          // Drain response body before following redirect
          res.resume();
          return doGet(nextUrl, remaining - 1, newCookies);
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
          cookies: newCookies,
        }));
      });
      req.on('error', reject);
      req.end();
    }
    doGet(url, maxRedirects, '');
  });
}

function encodeFormData(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

// ─── Graph API (client credentials) ──────────────────────────────────────────

async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  if (_tokenCache && _tokenCache.expires_at > now + 60) {
    return _tokenCache.access_token;
  }

  const url = `https://login.microsoftonline.com/${creds.tenant_id}/oauth2/v2.0/token`;
  const res = await httpsPost(url, encodeFormData({
    grant_type: 'client_credentials',
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    scope: 'https://graph.microsoft.com/.default',
  }));

  if (!res.access_token) {
    throw new Error(`M365 auth failed: ${JSON.stringify(res)}`);
  }

  _tokenCache = { access_token: res.access_token, expires_at: now + (res.expires_in || 3600) };
  return res.access_token;
}

async function readViaGraphApi(channel, projectRoot) {
  const root = projectRoot || process.cwd();
  const credPath = path.join(root, CREDENTIALS_REL);

  if (!fs.existsSync(credPath)) {
    throw new AuthRequiredError(SETUP_GUIDE);
  }

  let creds;
  try {
    creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to parse m365-credentials.json: ${e.message}`);
  }

  if (!creds.tenant_id || !creds.client_id || !creds.client_secret) {
    throw new AuthRequiredError(`m365-credentials.json is incomplete.${SETUP_GUIDE}`);
  }

  const token = await getAccessToken(creds);
  const sheetName = encodeURIComponent(channel.sheet_name || 'Sheet1');
  const url = `https://graph.microsoft.com/v1.0/me/drive/items/${channel.workbook_id}/workbook/worksheets/${sheetName}/usedRange`;
  const response = await httpsGet(url, { Authorization: `Bearer ${token}` });

  if (!response.values || response.values.length === 0) return [];
  return parseRowsWithColumnMap(response.values, channel.column_map, channel.id);
}

// ─── SharePoint sharing link (anonymous WOPI) ─────────────────────────────────

/** Detect sharing link type: /:x:/g/ or /:x:/r/ paths */
function isSharingLink(url) {
  return /\/:x:\/[gr]\//.test(url);
}

/**
 * Resolve a SharePoint anonymous sharing link to {downloadUrl, cookies}.
 * Technique: load WOPI viewer page → scrape FileGetUrl (temp auth token embedded in HTML).
 * Returns the cookies collected during the redirect chain — they must be forwarded
 * when downloading (SharePoint FedAuth cookie is required for download.aspx).
 */
async function resolveSharePointDownloadUrl(sharingUrl) {
  const { status, body, cookies } = await httpsGetRaw(sharingUrl);
  if (status !== 200) {
    throw new Error(`SharePoint sharing link returned HTTP ${status}. The link may be expired or restricted.`);
  }

  const html = body.toString('utf8');

  // Scrape FileGetUrl — SharePoint embeds a temp-auth download URL in the viewer HTML
  const match = html.match(/"FileGetUrl"\s*:\s*"([^"]+)"/);
  if (!match) {
    throw new Error('Could not extract download URL from SharePoint viewer page. The file may require sign-in.');
  }

  // Unescape JSON unicode escapes (& → &)
  const downloadUrl = match[1].replace(/\\u([\da-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return { downloadUrl, cookies };
}

/**
 * Download xlsx bytes.
 * cookies: FedAuth cookies from WOPI page — required for download.aspx redirect chain.
 */
async function downloadXlsx(downloadUrl, cookies) {
  const extraHeaders = { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*' };
  const { status, body } = await httpsGetRaw(downloadUrl, extraHeaders, 8);
  if (status !== 200) {
    // Retry with cookies if initial attempt fails (some SharePoint tenants need FedAuth)
    if (cookies) {
      const retry = await httpsGetRaw(downloadUrl, { ...extraHeaders, Cookie: cookies }, 8);
      if (retry.status === 200 && retry.body.length > 100) return retry.body;
    }
    throw new Error(`Failed to download xlsx: HTTP ${status}`);
  }
  // If we got HTML instead of binary (redirect page), retry with cookies
  const magic = body.slice(0, 4).toString('hex');
  if (magic !== '504b0304' && cookies) {
    const retry = await httpsGetRaw(downloadUrl, { ...extraHeaders, Cookie: cookies }, 8);
    if (retry.status === 200 && retry.body.slice(0, 4).toString('hex') === '504b0304') {
      return retry.body;
    }
  }
  return body;
}

// ─── xlsx parser (SheetJS) ────────────────────────────────────────────────────

/**
 * Parse xlsx Buffer → array of row arrays (like response.values from Graph API).
 * Uses the `xlsx` npm package (SheetJS).
 */
function parseXlsxBuffer(buffer, sheetName) {
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch {
    throw new Error(
      'The "xlsx" package is required to parse xlsx files from sharing links.\n' +
      'Install it: npm install xlsx'
    );
  }

  const workbook = XLSX.read(buffer, { type: 'buffer' });

  let sheet;
  if (sheetName && workbook.SheetNames.includes(sheetName)) {
    sheet = workbook.Sheets[sheetName];
  } else {
    // Default to first sheet; warn if requested sheet not found
    if (sheetName) {
      process.stderr.write(`[vp-intake] Sheet "${sheetName}" not found. Using "${workbook.SheetNames[0]}" instead.\n`);
    }
    sheet = workbook.Sheets[workbook.SheetNames[0]];
  }

  if (!sheet) return [];

  // Convert to array of arrays (raw values)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  return rows;
}

async function readViaSharingLink(channel) {
  const sharingUrl = channel.sharing_url;
  const { downloadUrl, cookies } = await resolveSharePointDownloadUrl(sharingUrl);
  const xlsxBuffer = await downloadXlsx(downloadUrl, cookies);
  const rows = parseXlsxBuffer(xlsxBuffer, channel.sheet_name || null);

  if (!rows || rows.length === 0) return [];
  return parseRowsWithColumnMap(rows, channel.column_map, channel.id);
}

// ─── Vietnamese/English header → field name auto-detection ────────────────────

const HEADER_ALIASES = {
  id:          ['stt', 'id', 'no', '#', 'mã', 'ma'],
  title:       ['title', 'tiêu đề', 'tieu de', 'tên', 'ten', 'màn hình', 'man hinh', 'tên module', 'tên testcase', 'summary'],
  description: ['mô tả lỗi', 'mo ta loi', 'description', 'mô tả', 'mo ta', 'chi tiết', 'chi tiet', 'detail', 'nội dung', 'noi dung'],
  status:      ['status', 'trạng thái', 'trang thai', 'kết quả', 'ket qua', 'result', 'p/f/n'],
  reporter:    ['reporter', 'người báo', 'nguoi bao', 'tester', 'người tạo', 'nguoi tao'],
  priority:    ['priority', 'mức độ', 'muc do', 'độ ưu tiên', 'severity'],
};

function autoDetectColumnMap(headerRow) {
  const map = {};
  headerRow.forEach((cell, idx) => {
    const normalized = String(cell).toLowerCase().trim();
    if (!normalized) return;
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (!map[field] && aliases.some(a => normalized.includes(a))) {
        // Convert 0-based index to Excel letter (A=0, B=1, ...)
        let col = '';
        let n = idx;
        do { col = String.fromCharCode(65 + (n % 26)) + col; n = Math.floor(n / 26) - 1; } while (n >= 0);
        map[field] = col;
      }
    }
  });
  return map;
}

// ─── Common row → ticket mapper ───────────────────────────────────────────────

function parseRowsWithColumnMap(values, colMap, channelId) {
  // Find first non-empty row to use as auto-detect source if needed
  const firstNonEmpty = values.find(r => r.some(c => c !== ''));

  // Auto-detect or fall back to raw if still missing
  const resolvedMap = (colMap && Object.keys(colMap).length > 0)
    ? colMap
    : (firstNonEmpty ? autoDetectColumnMap(firstNonEmpty) : {});

  if (!colMap || Object.keys(colMap).length === 0) {
    process.stderr.write(
      `[vp-intake] No column_map configured. Auto-detected: ${JSON.stringify(resolvedMap)}. ` +
      `Header row: ${JSON.stringify(firstNonEmpty || [])}\n`
    );
  }

  const tickets = [];
  // Skip header row(s): if auto-detected, skip until first row that has a non-header value
  const startRow = (colMap && Object.keys(colMap).length > 0) ? 1 : values.findIndex(r => r.some(c => c !== '')) + 1;

  for (let i = startRow; i < values.length; i++) {
    const row = values[i];
    const get = (field) => {
      const col = resolvedMap[field];
      if (!col) return '';
      const idx = colLetterToIndex(col);
      return row[idx] !== undefined ? String(row[idx]) : '';
    };

    const ticket = {
      id:          get('id'),
      title:       get('title'),
      description: get('description'),
      reporter:    get('reporter'),
      date:        get('date'),
      status:      get('status'),
      _source_row: i,
      _channel_id: channelId,
    };

    if (!ticket.title && !ticket.description) continue;
    tickets.push(ticket);
  }

  return tickets;
}

// ─── Public entry point ───────────────────────────────────────────────────────

async function readExcelM365(channel, projectRoot) {
  // Sharing link mode: no credentials required
  if (channel.sharing_url) {
    if (isSharingLink(channel.sharing_url)) {
      return readViaSharingLink(channel);
    }
    throw new Error(
      `sharing_url "${channel.sharing_url}" is not a SharePoint sharing link.\n` +
      'Sharing links look like: https://xxx.sharepoint.com/:x:/g/personal/xxx/EdXXX...\n' +
      'For direct document links (Doc.aspx?sourcedoc=...), use workbook_id + credentials instead.'
    );
  }

  // Graph API mode: requires workbook_id + credentials
  if (!channel.workbook_id) {
    throw new AuthRequiredError(
      'excel_m365 channel requires either "sharing_url" (for SharePoint sharing links) or ' +
      '"workbook_id" (for Graph API).' + SETUP_GUIDE
    );
  }

  return readViaGraphApi(channel, projectRoot);
}

function clearTokenCache() { _tokenCache = null; }

module.exports = {
  readExcelM365,
  AuthRequiredError,
  clearTokenCache,
  // exported for testing
  isSharingLink,
  resolveSharePointDownloadUrl,
  parseXlsxBuffer,
  autoDetectColumnMap,
  HEADER_ALIASES,
};
