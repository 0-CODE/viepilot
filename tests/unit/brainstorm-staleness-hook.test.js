/**
 * @jest-environment node
 *
 * Contract tests for FEAT-012: brainstorm staleness hook
 * Tests: session discovery, staleness detection, HTML patching, hooks install command
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { findActiveSession, detectStaleItems, markStaleInFile } = require('../../lib/hooks/brainstorm-staleness.cjs');

const REPO_ROOT = path.join(__dirname, '..', '..');
const VP_TOOLS = path.join(REPO_ROOT, 'bin', 'vp-tools.cjs');

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function makeFakeArch(dir, pages) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [page, content] of Object.entries(pages)) {
    fs.writeFileSync(path.join(dir, page), content, 'utf8');
  }
}

const SAMPLE_HTML = `<!DOCTYPE html>
<html><body>
<tr data-arch-id="E1" data-arch-title="Entity A"><td>Content A</td></tr>
<div class="card" data-arch-id="DIAG1" data-arch-title="Test Diag"></div>
<tr data-arch-id="E2"><td>Content B</td></tr>
</body></html>`;

// ──────────────────────────────────────────────────────────────────────────────
// Group 1: Hook script — session discovery
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-012: findActiveSession', () => {
  test('hook file exists at lib/hooks/brainstorm-staleness.cjs', () => {
    expect(fs.existsSync(path.join(REPO_ROOT, 'lib', 'hooks', 'brainstorm-staleness.cjs'))).toBe(true);
  });

  test('hook file has shebang line', () => {
    const content = fs.readFileSync(path.join(REPO_ROOT, 'lib', 'hooks', 'brainstorm-staleness.cjs'), 'utf8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  test('findActiveSession returns null when no session files exist', () => {
    const fakeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-sess-empty-'));
    expect(findActiveSession(fakeDir)).toBeNull();
  });

  test('findActiveSession returns most recently modified notes file', () => {
    const fakeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-sess-latest-'));
    const uiDir = path.join(fakeDir, '.viepilot', 'ui-direction');
    const sess1 = path.join(uiDir, 'session-a', 'notes.md');
    const sess2 = path.join(uiDir, 'session-b', 'notes.md');
    fs.mkdirSync(path.dirname(sess1), { recursive: true });
    fs.mkdirSync(path.dirname(sess2), { recursive: true });
    fs.writeFileSync(sess1, 'older session', 'utf8');
    // ensure sess2 is newer by waiting briefly (or setting mtime)
    fs.writeFileSync(sess2, 'newer session', 'utf8');
    // Touch sess2 to ensure it's newer
    const now = new Date();
    fs.utimesSync(sess1, now, new Date(now - 5000));
    fs.utimesSync(sess2, now, now);

    const result = findActiveSession(fakeDir);
    expect(result).not.toBeNull();
    expect(result.sessionContent).toBe('newer session');
    expect(result.notesPath).toBe(sess2);
  });

  test('findActiveSession finds docs/brainstorm/session-*.md as fallback', () => {
    const fakeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-sess-bs-'));
    const bsDir = path.join(fakeDir, 'docs', 'brainstorm');
    fs.mkdirSync(bsDir, { recursive: true });
    const sessionFile = path.join(bsDir, 'session-2026-01.md');
    fs.writeFileSync(sessionFile, 'brainstorm session content', 'utf8');

    const result = findActiveSession(fakeDir);
    expect(result).not.toBeNull();
    expect(result.sessionContent).toBe('brainstorm session content');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 2: Staleness detection
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-012: detectStaleItems', () => {
  let archDir;
  beforeEach(() => {
    archDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-arch-'));
    // Create minimal placeholder HTML files
    for (const page of ['architecture.html', 'erd.html', 'data-flow.html', 'deployment.html', 'apis.html', 'user-use-cases.html', 'sequence-diagram.html']) {
      fs.writeFileSync(path.join(archDir, page), '<html></html>', 'utf8');
    }
  });

  test('detectStaleItems returns architecture.html for c4 context diagram mention', () => {
    const result = detectStaleItems('we discussed the c4 context diagram', archDir);
    expect(result.some((r) => r.page === 'architecture.html')).toBe(true);
  });

  test('detectStaleItems returns erd.html for entity relationship table mention', () => {
    const result = detectStaleItems('the entity relationship table needs updating', archDir);
    expect(result.some((r) => r.page === 'erd.html')).toBe(true);
  });

  test('detectStaleItems returns empty array for non-matching content', () => {
    const result = detectStaleItems('nothing relevant here at all', archDir);
    expect(result).toHaveLength(0);
  });

  test('detectStaleItems handles multiple keyword matches → multiple pages', () => {
    const result = detectStaleItems('the c4 architecture and the database schema', archDir);
    const pages = result.map((r) => r.page);
    expect(pages).toContain('architecture.html');
    expect(pages).toContain('erd.html');
  });

  test('detectStaleItems keyword matching is case-insensitive', () => {
    const result = detectStaleItems('The C4 CONTEXT DIAGRAM shows components', archDir);
    expect(result.some((r) => r.page === 'architecture.html')).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 3: HTML patching
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-012: markStaleInFile', () => {
  let tmpFile;
  beforeEach(() => {
    tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vp-patch-')), 'test.html');
    fs.writeFileSync(tmpFile, SAMPLE_HTML, 'utf8');
  });

  test('markStaleInFile adds data-arch-stale="true" to elements with data-arch-id', () => {
    markStaleInFile(tmpFile, 'test reason');
    const result = fs.readFileSync(tmpFile, 'utf8');
    expect(result).toContain('data-arch-stale="true"');
  });

  test('markStaleInFile is idempotent (second call does not duplicate attrs)', () => {
    markStaleInFile(tmpFile, 'first run');
    markStaleInFile(tmpFile, 'second run');
    const result = fs.readFileSync(tmpFile, 'utf8');
    const occurrences = (result.match(/data-arch-stale="true"/g) || []).length;
    // Should have one per data-arch-id element (3 in SAMPLE_HTML)
    expect(occurrences).toBe(3);
  });

  test('markStaleInFile adds data-arch-stale-note with reason', () => {
    markStaleInFile(tmpFile, 'gap detected in brainstorm');
    const result = fs.readFileSync(tmpFile, 'utf8');
    expect(result).toContain('data-arch-stale-note=');
    expect(result).toContain('gap detected in brainstorm');
  });

  test('markStaleInFile returns true when changes made', () => {
    const changed = markStaleInFile(tmpFile, 'reason');
    expect(changed).toBe(true);
  });

  test('markStaleInFile returns false when already fully stale (idempotent)', () => {
    markStaleInFile(tmpFile, 'first');
    const changed = markStaleInFile(tmpFile, 'second');
    expect(changed).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 4: hooks install subcommand
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-012: vp-tools hooks install', () => {
  const itNotWin = process.platform === 'win32' ? test.skip : test;

  function runHooks(args, env = {}) {
    return spawnSync('node', [VP_TOOLS, 'hooks', ...args], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
  }

  itNotWin('hooks install exits 0', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hi-'));
    const result = runHooks(['install'], { HOME: fakeHome });
    expect(result.status).toBe(0);
  });

  itNotWin('after install, settings.json contains Stop hook entry', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hi2-'));
    runHooks(['install'], { HOME: fakeHome });
    const settings = JSON.parse(fs.readFileSync(path.join(fakeHome, '.claude', 'settings.json'), 'utf8'));
    expect(settings.hooks).toBeDefined();
    expect(Array.isArray(settings.hooks.Stop)).toBe(true);
    expect(settings.hooks.Stop.some((e) => Array.isArray(e.hooks) && e.hooks.some((h) => h.type === 'command'))).toBe(true);
  });

  itNotWin('re-running hooks install is idempotent (no duplicate entries)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hi3-'));
    runHooks(['install'], { HOME: fakeHome });
    runHooks(['install'], { HOME: fakeHome });
    const settings = JSON.parse(fs.readFileSync(path.join(fakeHome, '.claude', 'settings.json'), 'utf8'));
    // Should have exactly one Stop entry
    expect(settings.hooks.Stop).toHaveLength(1);
  });

  itNotWin('hooks install --adapter cursor-agent exits 0 with "not supported" message', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hi4-'));
    const result = runHooks(['install', '--adapter', 'cursor-agent'], { HOME: fakeHome });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('does not support');
  });

  itNotWin('hooks install --adapter unknown exits 1 with error', () => {
    const result = runHooks(['install', '--adapter', 'unknown-platform']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Unknown adapter');
  });
});
