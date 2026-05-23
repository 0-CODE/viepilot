'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ---------------------------------------------------------------------------
// CSV write-back
// ---------------------------------------------------------------------------

function parseCsvLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function csvCell(value) {
  const s = String(value || '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildTicketDecisions(triageResult) {
  const decisions = {};
  for (const { ticket, request_id } of triageResult.accepted) {
    decisions[ticket._source_row] = { vp_status: 'accepted', vp_comment: '', vp_request_id: request_id };
  }
  for (const { ticket, reason } of triageResult.declined) {
    decisions[ticket._source_row] = { vp_status: 'declined', vp_comment: reason, vp_request_id: '' };
  }
  for (const { ticket } of (triageResult.unclear || [])) {
    decisions[ticket._source_row] = { vp_status: 'unclear', vp_comment: '', vp_request_id: '' };
  }
  return decisions;
}

async function writebackCsv(channel, triageResult, projectRoot) {
  const filePath = path.resolve(projectRoot || process.cwd(), channel.path);
  if (!fs.existsSync(filePath)) {
    return { success: false, error: `CSV file not found: ${filePath}` };
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const delimiter = ext === '.tsv' ? '\t' : ',';
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    if (lines.length === 0) return { success: true };

    let headers = parseCsvLine(lines[0], delimiter);
    const VP_COLS = ['VP_Status', 'VP_Comment', 'VP_RequestID'];
    const existingVpIdx = VP_COLS.map((col) => headers.indexOf(col));
    const hasVpCols = existingVpIdx.every((i) => i >= 0);

    if (!hasVpCols) {
      headers = [...headers, ...VP_COLS];
    }

    const decisions = buildTicketDecisions(triageResult);
    const outputLines = [headers.map(csvCell).join(delimiter)];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) { outputLines.push(''); continue; }
      const row = parseCsvLine(lines[i], delimiter);
      const d = decisions[i];
      if (d) {
        while (row.length < headers.length) row.push('');
        const statusIdx = headers.indexOf('VP_Status');
        const commentIdx = headers.indexOf('VP_Comment');
        const reqIdx = headers.indexOf('VP_RequestID');
        if (statusIdx >= 0)  row[statusIdx] = d.vp_status;
        if (commentIdx >= 0) row[commentIdx] = d.vp_comment;
        if (reqIdx >= 0)     row[reqIdx] = d.vp_request_id;
      }
      outputLines.push(row.map(csvCell).join(delimiter));
    }

    fs.writeFileSync(filePath, outputLines.join('\n'), 'utf8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// Google Sheets write-back (batchUpdate)
// ---------------------------------------------------------------------------

function httpsRequest(method, url, body, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function colLetterToIndex(letter) {
  let index = 0;
  for (const ch of letter.toUpperCase()) index = index * 26 + ch.charCodeAt(0) - 64;
  return index - 1;
}

function indexToColLetter(idx) {
  let letter = '';
  idx++;
  while (idx > 0) {
    const rem = (idx - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    idx = Math.floor((idx - 1) / 26);
  }
  return letter;
}

async function getGoogleAccessToken(projectRoot) {
  const credPath = path.join(projectRoot, '.viepilot', '.credentials', 'google-service-account.json');
  if (!fs.existsSync(credPath)) return null;
  const keyJson = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: keyJson.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now,
  })).toString('base64url');
  const crypto = require('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(keyJson.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;
  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await httpsRequest('POST', 'https://oauth2.googleapis.com/token', null, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
  });
  return res.access_token || null;
}

async function writebackGoogleSheets(channel, triageResult, projectRoot) {
  try {
    const root = projectRoot || process.cwd();
    const token = await getGoogleAccessToken(root);
    if (!token) return { success: false, error: 'No Google credentials for write-back' };

    const decisions = buildTicketDecisions(triageResult);
    const allTickets = [
      ...triageResult.accepted.map((a) => a.ticket),
      ...triageResult.declined.map((d) => d.ticket),
    ];
    if (allTickets.length === 0) return { success: true };

    const colMap = channel.column_map;
    const lastCol = colLetterToIndex(Object.values(colMap).sort().pop() || 'F');
    const vpStatusCol  = indexToColLetter(lastCol + 1);
    const vpCommentCol = indexToColLetter(lastCol + 2);
    const vpReqCol     = indexToColLetter(lastCol + 3);

    const valueRanges = [];
    for (const ticket of allTickets) {
      const d = decisions[ticket._source_row];
      if (!d) continue;
      const rowNum = ticket._source_row + 1;
      const sheetName = channel.sheet_name || 'Sheet1';
      valueRanges.push({ range: `${sheetName}!${vpStatusCol}${rowNum}`,  values: [[d.vp_status]] });
      valueRanges.push({ range: `${sheetName}!${vpCommentCol}${rowNum}`, values: [[d.vp_comment]] });
      valueRanges.push({ range: `${sheetName}!${vpReqCol}${rowNum}`,     values: [[d.vp_request_id]] });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${channel.spreadsheet_id}/values:batchUpdate`;
    await httpsRequest('POST', url, { valueInputOption: 'RAW', data: valueRanges }, { Authorization: `Bearer ${token}` });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// Excel M365 write-back (Graph API PATCH)
// ---------------------------------------------------------------------------

async function writebackExcelM365(channel, triageResult, projectRoot) {
  if (channel.sharing_url) {
    return {
      success: false,
      error: `Channel "${channel.id || channel.name}" uses a sharing_url — write-back is read-only for sharing links.\n` +
             `To enable write-back: configure workbook_id + .viepilot/.credentials/m365-credentials.json`,
    };
  }

  const root = projectRoot || process.cwd();
  const credPath = path.join(root, '.viepilot', '.credentials', 'm365-credentials.json');
  if (!fs.existsSync(credPath)) {
    return {
      success: false,
      error: `m365-credentials.json not found at ${credPath}.\n` +
             `Create it with: { "tenant_id": "...", "client_id": "...", "client_secret": "..." }`,
    };
  }

  let creds;
  try {
    creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  } catch (e) {
    return { success: false, error: `Failed to parse m365-credentials.json: ${e.message}` };
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${creds.tenant_id}/oauth2/v2.0/token`;
    const tokenBody = [
      `grant_type=client_credentials`,
      `client_id=${encodeURIComponent(creds.client_id)}`,
      `client_secret=${encodeURIComponent(creds.client_secret)}`,
      `scope=https%3A%2F%2Fgraph.microsoft.com%2F.default`,
    ].join('&');

    const tokenRes = await httpsRequest('POST', tokenUrl, tokenBody, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(tokenBody),
    });

    if (!tokenRes.access_token) {
      return { success: false, error: `M365 authentication failed: ${JSON.stringify(tokenRes)}` };
    }

    const token = tokenRes.access_token;
    const workbookId = channel.workbook_id;
    const sheetName = encodeURIComponent(channel.sheet_name || 'Sheet1');
    const colMap = channel.column_map || {};
    const lastColIdx = Object.values(colMap).length > 0
      ? Math.max(...Object.values(colMap).map(colLetterToIndex))
      : 5;
    const vpStatusCol  = indexToColLetter(lastColIdx + 1);
    const vpCommentCol = indexToColLetter(lastColIdx + 2);
    const vpReqCol     = indexToColLetter(lastColIdx + 3);

    const decisions = buildTicketDecisions(triageResult);
    const allTickets = [
      ...triageResult.accepted.map((a) => a.ticket),
      ...triageResult.declined.map((d) => d.ticket),
      ...(triageResult.unclear || []).map((u) => u.ticket),
    ];

    let updatedCount = 0;
    for (const ticket of allTickets) {
      const d = decisions[ticket._source_row];
      if (!d) continue;
      const rowNum = ticket._source_row + 1;
      const rangeAddress = `${vpStatusCol}${rowNum}:${vpReqCol}${rowNum}`;
      const url = `https://graph.microsoft.com/v1.0/me/drive/items/${workbookId}/workbook/worksheets/${sheetName}/range(address='${rangeAddress}')`;
      const res = await httpsRequest('PATCH', url, { values: [[d.vp_status, d.vp_comment, d.vp_request_id]] }, {
        Authorization: `Bearer ${token}`,
      });
      if (res.error) {
        return { success: false, error: `Graph API PATCH error: ${res.error.message || JSON.stringify(res.error)}` };
      }
      updatedCount++;
    }

    return { success: true, updated: updatedCount };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// Main writeback dispatcher
// ---------------------------------------------------------------------------

async function writeback(channel, triageResult, projectRoot) {
  const root = projectRoot || process.cwd();
  let result;

  if (channel.type === 'csv') {
    result = await writebackCsv(channel, triageResult, root);
  } else if (channel.type === 'google_sheets') {
    result = await writebackGoogleSheets(channel, triageResult, root);
  } else if (channel.type === 'excel_m365') {
    result = await writebackExcelM365(channel, triageResult, root);
  } else {
    result = { success: false, error: `Unknown channel type: ${channel.type}` };
  }

  if (!result.success) {
    console.warn(`  ⚠ Write-back warning: ${result.error} — triage report is the source of truth`);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Post-task intake write-back (ENH-095)
// ---------------------------------------------------------------------------

/**
 * Write task completion status back to the original source row.
 * Called by vp-auto post-PASS hook when a task has an ## Intake Source block.
 *
 * @param {object} channel   - Original intake channel config (type, sharing_url or workbook_id)
 * @param {number} sourceRow - 0-based row index (ticket._source_row)
 * @param {object} response  - { status, phaseTask, version, date }
 * @param {string} projectRoot
 * @param {string} [sheetName]    - Sheet name from manifest
 * @param {string} [responseCol]  - Column letter from manifest write_back.response_col
 * @returns {Promise<{success: boolean, cell?: string, text?: string, error?: string}>}
 */
async function writebackIntakeResponse(channel, sourceRow, response, projectRoot, sheetName, responseCol) {
  const text = [
    response.status   || 'Done',
    response.phaseTask || '',
    response.version  || '',
    response.date     || new Date().toISOString().slice(0, 10),
  ].filter(Boolean).join(' | ');

  if (!channel || !channel.type) {
    process.stderr.write(`[vp-intake] Write-back skipped: no channel info\n`);
    return { success: false, error: 'no channel info' };
  }

  if (channel.type === 'excel_m365' && channel.sharing_url) {
    process.stderr.write(`[vp-intake] Write-back skipped for sharing_url channel (read-only). Text: ${text}\n`);
    return { success: false, error: 'sharing_url is read-only — use workbook_id for write-back' };
  }

  if (channel.type === 'excel_m365' && channel.workbook_id) {
    const root     = projectRoot || process.cwd();
    const credPath = path.join(root, '.viepilot', '.credentials', 'm365-credentials.json');
    if (!fs.existsSync(credPath)) {
      process.stderr.write(`[vp-intake] Write-back skipped: m365-credentials.json not found\n`);
      return { success: false, error: 'm365-credentials.json not found' };
    }
    try {
      const creds     = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      const tokenUrl  = `https://login.microsoftonline.com/${creds.tenant_id}/oauth2/v2.0/token`;
      const tokenBody = [
        'grant_type=client_credentials',
        `client_id=${encodeURIComponent(creds.client_id)}`,
        `client_secret=${encodeURIComponent(creds.client_secret)}`,
        'scope=https%3A%2F%2Fgraph.microsoft.com%2F.default',
      ].join('&');
      const tokenRes = await httpsRequest('POST', tokenUrl, tokenBody, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(tokenBody),
      });
      if (!tokenRes.access_token) {
        return { success: false, error: `M365 auth failed: ${JSON.stringify(tokenRes)}` };
      }
      const col      = responseCol || 'G';
      const sheet    = encodeURIComponent(sheetName || channel.sheet_name || 'Sheet1');
      const cell     = `${col}${sourceRow + 2}`;
      const url      = `https://graph.microsoft.com/v1.0/me/drive/items/${channel.workbook_id}/workbook/worksheets/${sheet}/range(address='${cell}')`;
      const res      = await httpsRequest('PATCH', url, { values: [[text]] }, {
        Authorization: `Bearer ${tokenRes.access_token}`,
      });
      if (res.error) {
        return { success: false, error: `Graph API error: ${res.error.message || JSON.stringify(res.error)}` };
      }
      return { success: true, cell, text };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Google Sheets, CSV, browser, unknown: skip silently
  process.stderr.write(`[vp-intake] Write-back skipped for channel type "${channel.type}" (not writable or not yet implemented)\n`);
  return { success: false, error: `channel type "${channel.type}" does not support post-task write-back` };
}

module.exports = { writeback, writebackIntakeResponse };
