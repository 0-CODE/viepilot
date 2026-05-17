'use strict';

const fs   = require('fs');
const path = require('path');

const CHANNELS_REL = path.join('.viepilot', 'intake', 'channels.json');

const REQUIRED_CHANNEL_FIELDS = ['id', 'type', 'name'];
const REQUIRED_COLUMN_MAP_FIELDS = ['title', 'description'];
const VALID_TYPES = ['csv', 'google_sheets', 'excel_m365'];

const CHANNELS_SCAFFOLD = {
  channels: [
    {
      id: 'csv-example',
      type: 'csv',
      name: 'Local CSV Export',
      path: './reports/tickets.csv',
      column_map: {
        id: 'ticket_id',
        title: 'summary',
        description: 'details',
        reporter: 'author',
        date: 'created_at',
        status: 'status',
      },
    },
    {
      id: 'gsheet-example',
      type: 'google_sheets',
      name: 'Google Sheet Tickets',
      spreadsheet_id: 'REPLACE_WITH_SPREADSHEET_ID',
      sheet_name: 'Sheet1',
      column_map: {
        id: 'A',
        title: 'B',
        description: 'C',
        reporter: 'D',
        date: 'E',
        status: 'F',
      },
    },
    {
      id: 'm365-example',
      type: 'excel_m365',
      name: 'M365 Excel Tickets',
      workbook_id: 'REPLACE_WITH_WORKBOOK_ID',
      sheet_name: 'Tickets',
      column_map: {
        id: 'A',
        title: 'B',
        description: 'C',
        reporter: 'D',
        date: 'E',
        status: 'F',
      },
    },
  ],
};

function loadChannels(projectRoot) {
  const channelsPath = path.join(projectRoot, CHANNELS_REL);
  if (!fs.existsSync(channelsPath)) {
    return { channels: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to parse channels.json: ${e.message}`);
  }
}

function validateChannel(channel) {
  for (const field of REQUIRED_CHANNEL_FIELDS) {
    if (!channel[field]) {
      throw new Error(`Channel missing required field: "${field}"`);
    }
  }
  if (!VALID_TYPES.includes(channel.type)) {
    throw new Error(`Invalid channel type "${channel.type}". Must be one of: ${VALID_TYPES.join(', ')}`);
  }
  if (!channel.column_map) {
    throw new Error(`Channel "${channel.id}" missing "column_map"`);
  }
  for (const field of REQUIRED_COLUMN_MAP_FIELDS) {
    if (!channel.column_map[field]) {
      throw new Error(`Channel "${channel.id}" column_map missing required field: "${field}"`);
    }
  }
  if (channel.type === 'csv' && !channel.path) {
    throw new Error(`CSV channel "${channel.id}" must have a "path" field`);
  }
  if (channel.type === 'google_sheets' && !channel.spreadsheet_id) {
    throw new Error(`Google Sheets channel "${channel.id}" must have a "spreadsheet_id" field`);
  }
  if (channel.type === 'excel_m365' && !channel.workbook_id) {
    throw new Error(`Excel/M365 channel "${channel.id}" must have a "workbook_id" field`);
  }
  return true;
}

function getChannelById(id, channels) {
  return (channels || []).find((c) => c.id === id) || null;
}

function initIntakeDir(projectRoot) {
  const intakeDir = path.join(projectRoot, '.viepilot', 'intake');
  const channelsPath = path.join(intakeDir, 'channels.json');
  const credentialsDir = path.join(projectRoot, '.viepilot', '.credentials');
  const gitkeepPath = path.join(credentialsDir, '.gitkeep');
  const gitignorePath = path.join(projectRoot, '.gitignore');

  if (!fs.existsSync(intakeDir)) {
    fs.mkdirSync(intakeDir, { recursive: true });
  }

  if (!fs.existsSync(channelsPath)) {
    fs.writeFileSync(channelsPath, JSON.stringify(CHANNELS_SCAFFOLD, null, 2) + '\n', 'utf8');
  }

  if (!fs.existsSync(credentialsDir)) {
    fs.mkdirSync(credentialsDir, { recursive: true });
  }
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '', 'utf8');
  }

  if (fs.existsSync(gitignorePath)) {
    const existing = fs.readFileSync(gitignorePath, 'utf8');
    const entry = '.viepilot/.credentials/';
    if (!existing.includes(entry)) {
      fs.appendFileSync(gitignorePath, `\n# ViePilot OAuth credentials (ENH-082)\n${entry}\n`, 'utf8');
    }
  }

  return { intakeDir, channelsPath, credentialsDir };
}

module.exports = { loadChannels, validateChannel, getChannelById, initIntakeDir, CHANNELS_SCAFFOLD };
