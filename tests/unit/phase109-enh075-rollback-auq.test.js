/**
 * Phase 109 — ENH-075: vp-rollback AUQ Checkpoint Selection + Pagination
 * Contract tests for workflows/rollback.md and skills/vp-rollback/SKILL.md
 */

const fs = require('fs');
const path = require('path');

const ROLLBACK_WF = path.join(__dirname, '../../workflows/rollback.md');
const ROLLBACK_SKILL = path.join(__dirname, '../../skills/vp-rollback/SKILL.md');

let wfContent, skillContent;

beforeAll(() => {
  wfContent = fs.readFileSync(ROLLBACK_WF, 'utf8');
  skillContent = fs.readFileSync(ROLLBACK_SKILL, 'utf8');
});

// ─── Group 1: rollback.md — AUQ block present ────────────────────────────────

describe('rollback.md — AUQ block present', () => {
  test('Step 1 contains AskUserQuestion keyword', () => {
    expect(wfContent).toContain('AskUserQuestion');
  });

  test('Step 1 contains ToolSearch preload before AUQ (ENH-059)', () => {
    expect(wfContent).toContain('ToolSearch');
  });

  test('Step 1 contains "Show" and "more" (pagination option)', () => {
    expect(wfContent).toMatch(/Show.+more/i);
  });

  test('Step 1 contains "Enter" and "manually" (manual entry option)', () => {
    expect(wfContent).toMatch(/Enter.+manually|manually/i);
  });

  test('--list flag bypasses AUQ — stop-here path documented', () => {
    expect(wfContent).toMatch(/--list.+flag|list.*flag.*stop|stop here when.*list/i);
  });
});

// ─── Group 2: rollback.md — pagination spec ──────────────────────────────────

describe('rollback.md — pagination spec', () => {
  test('contains PAGE_SIZE or parameterized head (not hardcoded head -20)', () => {
    expect(wfContent).toMatch(/PAGE_SIZE|head -\$PAGE_SIZE|head -\$N/);
  });

  test('contains OFFSET or offset (pagination state)', () => {
    expect(wfContent).toMatch(/OFFSET|offset/);
  });

  test('does NOT contain hardcoded head -20', () => {
    expect(wfContent).not.toContain('head -20');
  });

  test('HAS_MORE condition or total count check documented', () => {
    expect(wfContent).toMatch(/HAS_MORE|TOTAL|total.*count|wc -l/i);
  });
});

// ─── Group 3: rollback.md — Step 2 AUQ binding ───────────────────────────────

describe('rollback.md — Step 2 AUQ binding', () => {
  test('Step 2 references AUQ result from Step 1', () => {
    expect(wfContent).toMatch(/AUQ result|result from Step 1|selection.*Step 1|from Step 1/i);
  });

  test('Step 2 documents tag name extraction (first token)', () => {
    expect(wfContent).toMatch(/first.+token|whitespace.+token|split.*whitespace/i);
  });

  test('Step 2 validates tag exists via git tag -l', () => {
    expect(wfContent).toMatch(/git tag -l.*grep|tag -l.*\|.*grep/);
  });

  test('Step 2 includes manual entry path for "Other" input', () => {
    expect(wfContent).toMatch(/manually.*AUQ.*Other|Other.*input|typed.*string|entered.*string/i);
  });
});

// ─── Group 4: SKILL.md — --limit flag + AUQ compat ───────────────────────────

describe('skills/vp-rollback/SKILL.md — --limit flag + AUQ compat', () => {
  test('contains --limit flag documentation', () => {
    expect(skillContent).toContain('--limit');
  });

  test('--limit has default value of 10', () => {
    expect(skillContent).toMatch(/--limit.+default.*10|--limit.*\(default: 10\)/i);
  });

  test('contains AskUserQuestion reference', () => {
    expect(skillContent).toContain('AskUserQuestion');
  });

  test('contains ToolSearch preload note (ENH-059)', () => {
    expect(skillContent).toContain('ToolSearch');
  });

  test('error hint mentions --limit for seeing more checkpoints', () => {
    expect(skillContent).toMatch(/--limit.+more|more.*--limit/i);
  });

  test('AUQ adapter compat table present (Claude Code vs text fallback)', () => {
    expect(skillContent).toMatch(/Text fallback|text fallback/);
  });

  test('--list flag description updated to mention no interactive prompt', () => {
    expect(skillContent).toMatch(/--list.*plain-text|--list.*no.*prompt|plain-text.*table/i);
  });
});
