'use strict';

const fs   = require('fs');
const path = require('path');

function parseCsvLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function applyColumnMap(headers, row, columnMap) {
  const headerIndex = {};
  headers.forEach((h, i) => { headerIndex[h.trim()] = i; });

  const get = (fieldName) => {
    const mapped = columnMap[fieldName];
    if (!mapped) return '';
    const idx = headerIndex[mapped];
    return idx !== undefined ? (row[idx] || '') : '';
  };

  return {
    id:          get('id'),
    title:       get('title'),
    description: get('description'),
    reporter:    get('reporter'),
    date:        get('date'),
    status:      get('status'),
  };
}

async function readCsv(channel, projectRoot) {
  const filePath = path.resolve(projectRoot || process.cwd(), channel.path);
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const delimiter = ext === '.tsv' ? '\t' : ',';

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== '');

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0], delimiter);
  const tickets = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i], delimiter);
    const ticket = applyColumnMap(headers, row, channel.column_map);
    if (!ticket.title && !ticket.description) continue;
    ticket._source_row = i;
    ticket._channel_id = channel.id;
    tickets.push(ticket);
  }

  return tickets;
}

module.exports = { readCsv };
