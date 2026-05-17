'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const https = require('https');

const CREDENTIALS_REL = path.join('.viepilot', '.credentials', 'google-service-account.json');

const SETUP_GUIDE = `
Google Sheets setup:
  1. Go to console.cloud.google.com → Create project → Enable Sheets API
  2. IAM → Service Accounts → Create → Download JSON key
  3. Save key to: .viepilot/.credentials/google-service-account.json
  4. Share your Google Sheet with the service account email (viewer access)
  5. Re-run vp-intake
`;

class AuthRequiredError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AuthRequiredError';
  }
}

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
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
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
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
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

async function getAccessToken(keyJson, projectRoot) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: keyJson.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const crypto = require('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(keyJson.private_key, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;

  const tokenRes = await httpsPost(
    'https://oauth2.googleapis.com/token',
    encodeFormData({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  );
  if (!tokenRes.access_token) {
    throw new Error(`Google auth failed: ${JSON.stringify(tokenRes)}`);
  }
  return tokenRes.access_token;
}

async function readGoogleSheet(channel, projectRoot) {
  const root = projectRoot || process.cwd();
  const credPath = path.join(root, CREDENTIALS_REL);

  if (!fs.existsSync(credPath)) {
    throw new AuthRequiredError(SETUP_GUIDE);
  }

  let keyJson;
  try {
    keyJson = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to parse google-service-account.json: ${e.message}`);
  }

  const accessToken = await getAccessToken(keyJson, root);
  const sheetName = encodeURIComponent(channel.sheet_name || 'Sheet1');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${channel.spreadsheet_id}/values/${sheetName}!A:Z`;
  const response = await httpsGet(url, { Authorization: `Bearer ${accessToken}` });

  if (!response.values || response.values.length === 0) return [];

  const colMap = channel.column_map;
  const tickets = [];

  for (let i = 1; i < response.values.length; i++) {
    const row = response.values[i];
    const get = (field) => {
      const col = colMap[field];
      if (!col) return '';
      const idx = colLetterToIndex(col);
      return row[idx] || '';
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

module.exports = { readGoogleSheet, AuthRequiredError };
