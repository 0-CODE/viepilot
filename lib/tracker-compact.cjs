const fs = require('fs');
const path = require('path');

function rewriteCurrentState(content, newBlock) {
  const match = content.match(/^## Current State\n/m);
  if (!match) return content;
  const start = match.index + match[0].length;
  const after = content.slice(start).search(/^## /m);
  const before = content.slice(0, match.index);
  const nextSection = after === -1 ? '' : content.slice(start + after);
  return before + '## Current State\n' + newBlock + nextSection;
}

function parseStanzas(lines) {
  const stanzas = [];
  let current = [];
  for (const line of lines) {
    if (line.match(/\*\*Current Phase\*\*/)) {
      if (current.length > 0) stanzas.push(current);
      current = [line];
    } else if (current.length > 0) {
      current.push(line);
    }
  }
  if (current.length > 0) stanzas.push(current);
  return stanzas;
}

function compact(trackerPath, options = {}) {
  if (!fs.existsSync(trackerPath)) {
    throw new Error('TRACKER.md not found: ' + trackerPath);
  }

  const { keep = 5, dryRun = false } = options;
  const maxRows = Math.max(keep * 4, 20);
  const content = fs.readFileSync(trackerPath, 'utf8');
  const lines = content.split('\n');

  let linesRemoved = 0;
  let rowsArchived = 0;
  let archiveBlock = '';

  // Process Current State
  const csIdx = lines.findIndex(l => l === '## Current State');
  const nextIdx = lines.findIndex((l, i) => i > csIdx && l.match(/^## /));

  if (csIdx !== -1 && nextIdx !== -1) {
    const csLines = lines.slice(csIdx + 1, nextIdx);
    const stanzas = parseStanzas(csLines);
    if (stanzas.length > 1) {
      const archived = stanzas.slice(0, -1).map(s => s.join('\n')).join('\n');
      linesRemoved = archived.split('\n').length;
      archiveBlock += '## Archived Current State\n' + archived + '\n\n';
    }
  }

  // Process Decision Log
  const dlIdx = lines.findIndex(l => l === '## Decision Log');
  const dlEnd = nextIdx > dlIdx ? nextIdx : lines.length;

  if (dlIdx !== -1) {
    const tlines = lines.slice(dlIdx + 1, dlEnd);
    let hIdx = -1, sIdx = -1;
    for (let i = 0; i < tlines.length; i++) {
      if (tlines[i].match(/\|\s*Date\s*\|/)) hIdx = i;
      if (hIdx !== -1 && tlines[i].match(/^\|\s*[-:]+/)) {
        sIdx = i;
        break;
      }
    }
    if (hIdx !== -1 && sIdx !== -1) {
      const rows = tlines.slice(sIdx + 1).filter(l => l.trim().match(/^\|/));
      if (rows.length > maxRows) {
        rowsArchived = rows.length - maxRows;
        archiveBlock += '## Archived Decision Log Rows\n' + rows.slice(0, -maxRows).join('\n') + '\n';
      }
    }
  }

  if (!dryRun && archiveBlock) {
    const histPath = path.join(path.dirname(trackerPath), 'TRACKER-HISTORY.md');
    fs.appendFileSync(histPath, '\n---\n# TRACKER Archive — ' + new Date().toISOString().split('T')[0] + '\n\n' + archiveBlock);

    // Rewrite TRACKER.md
    let newContent = content;
    if (csIdx !== -1 && nextIdx !== -1) {
      const stanzas = parseStanzas(lines.slice(csIdx + 1, nextIdx));
      if (stanzas.length > 0) {
        newContent = rewriteCurrentState(newContent, stanzas[stanzas.length - 1].join('\n') + '\n');
      }
    }

    if (dlIdx !== -1) {
      const tlines = lines.slice(dlIdx + 1, dlEnd);
      let hIdx = -1, sIdx = -1;
      for (let i = 0; i < tlines.length; i++) {
        if (tlines[i].match(/\|\s*Date\s*\|/)) hIdx = i;
        if (hIdx !== -1 && tlines[i].match(/^\|\s*[-:]+/)) {
          sIdx = i;
          break;
        }
      }
      if (hIdx !== -1 && sIdx !== -1) {
        const rows = tlines.slice(sIdx + 1).filter(l => l.trim().match(/^\|/));
        const kept = rows.slice(-maxRows);
        const newTable = [tlines[hIdx], tlines[sIdx], ...kept].join('\n');
        const before = lines.slice(0, dlIdx + 1).join('\n');
        const after = lines.slice(dlEnd).join('\n');
        newContent = before + '\n' + newTable + '\n' + after;
      }
    }

    fs.writeFileSync(trackerPath, newContent, 'utf8');
  }

  return {
    linesRemoved,
    rowsArchived,
    historyFile: path.join(path.dirname(trackerPath), 'TRACKER-HISTORY.md'),
    trackerLines: lines.length - linesRemoved
  };
}

module.exports = { compact, rewriteCurrentState };
