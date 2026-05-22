'use strict';

const fs   = require('fs');
const path = require('path');

const DECLINE_REASONS = [
  'Duplicate — already tracked',
  'Out of scope for this project',
  "Won't fix — low value",
  'Deferred to future milestone',
];

function nextRequestNumber(type, projectRoot) {
  const prefix = type === 'BUG' ? 'BUG-' : 'ENH-';
  const reqDir = path.join(projectRoot, '.viepilot', 'requests');
  if (!fs.existsSync(reqDir)) return 1;

  const existing = fs.readdirSync(reqDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.md'))
    .map((f) => parseInt(f.replace(prefix, '').replace('.md', ''), 10))
    .filter((n) => !isNaN(n));

  return existing.length ? Math.max(...existing) + 1 : 1;
}

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
- **Reporter**: ${ticket.reporter || 'External source'}
- **Source**: ${channel.name} — ticket #${ticket.id}
- **Assignee**: AI

## Summary
${ticket.description || ticket.title}

## Acceptance Criteria
- [ ] (derived from description — fill in before planning)
`;

  const filePath = path.join(projectRoot, '.viepilot', 'requests', `${id}.md`);
  fs.writeFileSync(filePath, content, 'utf8');
  return { id, filePath };
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function getValidationBadge(ticket) {
  if (!ticket._validation) return '';
  const { status, file, similar_request } = ticket._validation;
  if (status === 'found')   return ` ✅ ${truncate(file || 'codebase match', 35)}`;
  if (status === 'similar') return ` ⚠️ similar: ${similar_request || 'existing request'}`;
  return ' ❓ no codebase match';
}

async function runTriage(tickets, channel, projectRoot, askUserQuestionFn) {
  const accepted = [];
  const declined = [];
  const unclear  = [];

  const bugTickets     = tickets.filter((t) => t._classified === 'BUG');
  const enhTickets     = tickets.filter((t) => t._classified === 'ENH');
  const unclearTickets = tickets.filter((t) => t._classified === 'UNCLEAR');

  console.log(`\n  BUG: ${bugTickets.length}  ENH: ${enhTickets.length}  UNCLEAR: ${unclearTickets.length}\n`);

  const PAGE_SIZE = 4;

  async function triagePage(pageTickets, labelPrefix) {
    for (let offset = 0; offset < pageTickets.length; offset += PAGE_SIZE) {
      const page = pageTickets.slice(offset, offset + PAGE_SIZE);
      const pageNum = Math.floor(offset / PAGE_SIZE) + 1;
      const totalPages = Math.ceil(pageTickets.length / PAGE_SIZE);

      const question = totalPages > 1
        ? `${labelPrefix} — Page ${pageNum}/${totalPages}: select tickets to ACCEPT`
        : `${labelPrefix}: select tickets to ACCEPT`;

      const options = page.map((t) => ({
        label: `[${t._classified}] #${t.id || t._source_row} — ${truncate(t.title, 45)}${getValidationBadge(t)}`,
        description: truncate(t.description, 100),
      }));

      const answer = await askUserQuestionFn(question, options, true);
      const selectedLabels = Array.isArray(answer) ? answer : (answer ? [answer] : []);

      for (const t of page) {
        const label = `[${t._classified}] #${t.id || t._source_row} — ${truncate(t.title, 45)}${getValidationBadge(t)}`;
        if (selectedLabels.includes(label)) {
          accepted.push(t);
        } else {
          declined.push(t);
        }
      }
    }
  }

  if (bugTickets.length > 0)  await triagePage(bugTickets,  'BUG tickets');
  if (enhTickets.length > 0)  await triagePage(enhTickets,  'ENH tickets');

  for (const t of unclearTickets) {
    const answer = await askUserQuestionFn(
      `UNCLEAR ticket #${t.id || t._source_row} — "${truncate(t.title, 60)}": how to handle?`,
      [
        { label: 'Accept as BUG', description: 'Create a BUG request' },
        { label: 'Accept as ENH', description: 'Create an ENH request' },
        { label: 'Decline', description: 'Skip this ticket' },
      ],
      false,
    );
    if (answer === 'Accept as BUG') {
      t._classified = 'BUG';
      accepted.push(t);
    } else if (answer === 'Accept as ENH') {
      t._classified = 'ENH';
      accepted.push(t);
    } else {
      declined.push(t);
    }
  }

  const acceptedWithIds = [];
  for (const t of accepted) {
    const { id } = createRequestFile(t, t._classified, channel, projectRoot);
    acceptedWithIds.push({ ticket: t, request_id: id });
    console.log(`  ✓ Created ${id} — ${t.title}`);
  }

  const declinedWithReasons = [];
  for (const t of declined) {
    const reason = await askUserQuestionFn(
      `Reason for declining #${t.id || t._source_row} — "${truncate(t.title, 50)}"?`,
      DECLINE_REASONS.map((r) => ({ label: r, description: '' })),
      false,
    );
    declinedWithReasons.push({ ticket: t, reason: reason || 'No reason provided' });
  }

  return {
    accepted: acceptedWithIds,
    declined: declinedWithReasons,
    unclear,
  };
}

module.exports = { runTriage, nextRequestNumber };
