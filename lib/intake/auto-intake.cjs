'use strict';

const fs   = require('fs');
const path = require('path');

const { classifyTicket }  = require('./classifier.cjs');
const { createRequestFile: _createRequestFile, nextRequestNumber } = require('./triage-ux.cjs');

// Internal helper — wraps triage-ux createRequestFile which isn't exported,
// so we re-implement the minimal version needed for headless auto-accept.
function createRequestFile(ticket, type, channel, projectRoot) {
  const n = nextRequestNumber(type, projectRoot);
  const id = `${type}-${String(n).padStart(3, '0')}`;
  const now = new Date().toISOString().split('T')[0];
  const typeLabel = type === 'BUG' ? 'Bug' : 'Enhancement';

  const content = `# ${typeLabel}: ${ticket.title}

## Meta
- **ID**: ${id}
- **Type**: ${typeLabel}
- **Status**: new
- **Priority**: medium
- **Created**: ${now}
- **Reporter**: ${ticket.reporter || 'Auto-intake'}
- **Source**: ${channel.name} — ticket #${ticket.id}
- **Assignee**: AI

## Summary
${ticket.description || ticket.title}

## Acceptance Criteria
- [ ] (derived from description — fill in before planning)
`;

  const reqDir = path.join(projectRoot, '.viepilot', 'requests');
  if (!fs.existsSync(reqDir)) fs.mkdirSync(reqDir, { recursive: true });
  const filePath = path.join(reqDir, `${id}.md`);
  fs.writeFileSync(filePath, content, 'utf8');
  return { id, filePath };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.7;

// ─── Pending-review accumulation ─────────────────────────────────────────────

async function appendPendingReview(tickets, channel, pendingPath) {
  const filePath = pendingPath || path.join('.viepilot', 'intake', 'pending-review.json');
  const existing = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : { items: [] };

  existing.items.push(
    ...tickets.map((t) => ({
      ...t,
      channel: channel.name,
      queued_at: new Date().toISOString(),
    })),
  );

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
}

// ─── Triage report ────────────────────────────────────────────────────────────

async function writeTriageReport({ accepted, queued, channel, projectRoot }) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(projectRoot, '.viepilot', 'intake');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `TRIAGE-auto-${timestamp}.md`);

  const lines = [
    `# Auto-Intake Triage Report`,
    ``,
    `**Channel**: ${channel.name}`,
    `**Date**: ${new Date().toISOString().split('T')[0]}`,
    `**Mode**: auto (scheduled)`,
    ``,
    `## Auto-accepted (confidence ≥ ${CONFIDENCE_THRESHOLD})`,
    ``,
    ...accepted.map((t) => `- **${t.request_id}**: ${t.ticket.title} (confidence: ${(t.ticket._confidence || 0).toFixed(2)})`),
    ``,
    `## Queued for review (confidence < ${CONFIDENCE_THRESHOLD})`,
    ``,
    ...queued.map((t) => `- #${t.id || t._source_row}: ${t.title} (confidence: ${(t._confidence || 0).toFixed(2)})`),
  ];

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  return reportPath;
}

// ─── Schedule management ──────────────────────────────────────────────────────

function readSchedule(projectRoot) {
  const filePath = path.join(projectRoot || '.', '.viepilot', 'intake', 'schedule.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function createSchedule(cronExpression, channelId, projectRoot) {
  const root = projectRoot || '.';
  // CronCreate is a deferred tool — the invoking agent must call
  // ToolSearch("select:CronCreate") before using it.
  // Non-CC fallback: print guidance.
  const isClaudeCode = process.env.CLAUDE_CODE === '1' || process.env.VP_ADAPTER === 'claude-code';

  if (!isClaudeCode) {
    console.log('Scheduling requires Claude Code. Use cron + CLI instead.');
    console.log(`Suggested: cron "${cronExpression} claude /vp-intake --channel ${channelId} --auto"`);
    return { success: false, error: 'Not running in Claude Code context' };
  }

  // In CC context, the caller (SKILL.md) must invoke CronCreate via ToolSearch.
  // This function writes schedule.json after receiving the schedule_id from CronCreate.
  const scheduleData = {
    cron: cronExpression,
    schedule_id: null,   // filled by caller after CronCreate response
    channel_id: channelId,
    created: new Date().toISOString(),
  };

  const scheduleDir = path.join(root, '.viepilot', 'intake');
  if (!fs.existsSync(scheduleDir)) fs.mkdirSync(scheduleDir, { recursive: true });
  fs.writeFileSync(path.join(scheduleDir, 'schedule.json'), JSON.stringify(scheduleData, null, 2));
  return { success: true, scheduleData };
}

async function deleteSchedule(projectRoot) {
  const root = projectRoot || '.';
  const filePath = path.join(root, '.viepilot', 'intake', 'schedule.json');
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'No schedule found — nothing to delete' };
  }
  const { schedule_id } = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Caller must invoke CronDelete({ schedule_id }) via ToolSearch("select:CronDelete")
  fs.unlinkSync(filePath);
  return { success: true, schedule_id };
}

// ─── Main auto-intake runner ──────────────────────────────────────────────────

async function runAutoIntake(tickets, channel, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();

  // 1. Classify with confidence
  const classified = tickets.map((t) => {
    const { classified: cls, confidence } = classifyTicket(t);
    return { ...t, _classified: cls, _confidence: confidence };
  });

  // 2. Partition: accepted (≥ threshold) vs. queued (< threshold)
  const accepted = classified.filter((t) => t._confidence >= CONFIDENCE_THRESHOLD && t._classified !== 'UNCLEAR');
  const queued   = classified.filter((t) => t._confidence <  CONFIDENCE_THRESHOLD || t._classified === 'UNCLEAR');

  // 3. Auto-create request files for accepted tickets
  const acceptedWithIds = [];
  for (const t of accepted) {
    const { id } = createRequestFile(t, t._classified, channel, projectRoot);
    acceptedWithIds.push({ ticket: t, request_id: id });
  }

  // 4. Append queued tickets to pending-review.json
  if (queued.length > 0) {
    await appendPendingReview(queued, channel);
  }

  // 5. Write triage report
  const reportPath = await writeTriageReport({ accepted: acceptedWithIds, queued, channel, projectRoot });

  // 6. Print auto-run summary
  console.log(`[AUTO INTAKE] Channel: ${channel.name} | ${tickets.length} tickets classified`);
  if (acceptedWithIds.length > 0) {
    console.log(`Auto-accepted (${acceptedWithIds.length}): ${acceptedWithIds.map((a) => a.request_id).join(', ')} (confidence ≥ ${CONFIDENCE_THRESHOLD})`);
  }
  if (queued.length > 0) {
    console.log(`Queued for review (${queued.length}): ${queued.map((t) => `${t.id || t._source_row} (confidence ${(t._confidence || 0).toFixed(2)})`).join(', ')}`);
  }
  console.log(`Report: ${reportPath}`);

  return { accepted: acceptedWithIds, queued, reportPath };
}

module.exports = {
  runAutoIntake,
  appendPendingReview,
  createSchedule,
  deleteSchedule,
  readSchedule,
  CONFIDENCE_THRESHOLD,
};
