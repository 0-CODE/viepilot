'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../..');

describe('BUG-035 G9 — small fixes', () => {
  test('persona-review prompt has each placeholder exactly once (no duplicated card)', () => {
    const t = fs.readFileSync(path.join(ROOT, 'templates/proposal/persona-review-prompt.md'), 'utf8');
    for (const k of ['persona_card', 'rubric', 'voice_level', 'manifest_json', 'script_md', 'lang']) {
      expect(t.split(`{${k}}`).length - 1).toBe(1);
    }
  });

  test('every report section carries the AI-simulation label', () => {
    const src = fs.readFileSync(path.join(ROOT, 'lib/proposal-sim-report.cjs'), 'utf8');
    expect(src).toMatch(/const sec = [^\n]*sim-label[^\n]*L\.banner/);
  });

  test('docs explain npm vs branch install and the AUQ check', () => {
    const d = fs.readFileSync(path.join(ROOT, 'docs/user/features/proposal.md'), 'utf8');
    expect(d).toMatch(/npx viepilot install[\s\S]*node bin\/viepilot\.cjs install/);
    expect(d).toMatch(/--auq-check/);
  });
});
