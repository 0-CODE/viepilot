'use strict';

const fs    = require('fs');
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

function encodeFormData(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

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

async function readExcelM365(channel, projectRoot) {
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

  const colMap = channel.column_map;
  const tickets = [];

  for (let i = 1; i < response.values.length; i++) {
    const row = response.values[i];
    const get = (field) => {
      const col = colMap[field];
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
      _channel_id: channel.id,
    };

    if (!ticket.title && !ticket.description) continue;
    tickets.push(ticket);
  }

  return tickets;
}

function clearTokenCache() { _tokenCache = null; }

module.exports = { readExcelM365, AuthRequiredError, clearTokenCache };
