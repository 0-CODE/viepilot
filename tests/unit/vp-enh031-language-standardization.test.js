'use strict';

/**
 * ENH-031 Language Standardization contracts
 *
 * Verifies that workflow files and SKILL.md files contain no Vietnamese prose
 * outside of cursor_skill_adapter invocation trigger blocks and designated
 * scan-target data patterns (UI scope signal keywords in crystallize / brainstorm).
 *
 * Policy:
 *   - All narrative prose, headers, bullet descriptions, and inline comments
 *     must be in English.
 *   - Vietnamese is ONLY allowed inside <cursor_skill_adapter> blocks
 *     (invocation keyword trigger strings).
 *   - UI scope signal keywords (màu, màn hình, etc.) in crystallize.md and
 *     brainstorm.md are scan-target data — not prose — and are also exempt.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// Vietnamese diacritic character range (uppercase + lowercase)
const VIEPILOT_CHARS = /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ]/;

/**
 * Strip content inside cursor_skill_adapter blocks.
 * Returns content with those blocks replaced by empty placeholders.
 */
function stripCursorSkillAdapter(content) {
  return content.replace(/<cursor_skill_adapter>[\s\S]*?<\/cursor_skill_adapter>/g, '<cursor_skill_adapter>[STRIPPED]</cursor_skill_adapter>');
}

/**
 * Find lines containing Vietnamese diacritics (returns array of {lineNo, text}).
 */
function findVietnameseLines(content) {
  return content
    .split('\n')
    .map((text, i) => ({ lineNo: i + 1, text }))
    .filter(({ text }) => VIEPILOT_CHARS.test(text));
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: No Vietnamese prose in workflow files
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-031 — workflow files: no Vietnamese prose outside invocation triggers', () => {
  const workflowFiles = glob.sync('workflows/*.md', { cwd: ROOT });

  // Files with documented scan-target data exceptions (UI scope signal keywords)
  const UI_SIGNAL_EXCEPTION_FILES = new Set([
    'workflows/crystallize.md',
    'workflows/brainstorm.md',
  ]);

  test('workflow files exist', () => {
    expect(workflowFiles.length).toBeGreaterThan(0);
  });

  workflowFiles.forEach((relPath) => {
    test(`${relPath}: no Vietnamese prose`, () => {
      const raw = read(relPath);
      // Workflow files have no cursor_skill_adapter blocks, but strip them anyway
      const stripped = stripCursorSkillAdapter(raw);
      const hits = findVietnameseLines(stripped);

      if (hits.length === 0) return; // clean

      if (UI_SIGNAL_EXCEPTION_FILES.has(relPath)) {
        // Scan-target keyword blockquote lines are allowed (not prose).
        // Patterns: UI signal keywords ("> `màu`"), admin trigger keywords (ENH-063), content trigger keywords (ENH-065)
        const unexpected = hits.filter(({ text }) => {
          const t = text.trim();
          if (/^>\s+`màu`/.test(t)) return false;           // UI signal keywords line
          if (/^>\s+`admin`/.test(t)) return false;          // Admin trigger keywords line (ENH-063)
          if (/^>\s+`article`/.test(t)) return false;        // Content trigger keywords line (ENH-065)
          if (/^>\s+`profile`/.test(t)) return false;        // User data trigger keywords line (ENH-066)
          if (/^>\s+`CRUD`/.test(t)) return false;           // Entity management trigger keywords line (ENH-068)
          return true;
        });
        expect(unexpected).toEqual([]);
      } else {
        expect(hits).toEqual([]);
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: No Vietnamese prose in SKILL.md files (outside cursor_skill_adapter)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-031 — SKILL.md files: no Vietnamese prose outside cursor_skill_adapter', () => {
  const skillFiles = glob.sync('skills/vp-*/SKILL.md', { cwd: ROOT });

  test('SKILL.md files exist', () => {
    expect(skillFiles.length).toBeGreaterThan(0);
  });

  skillFiles.forEach((relPath) => {
    test(`${relPath}: no Vietnamese outside cursor_skill_adapter`, () => {
      const raw = read(relPath);
      const stripped = stripCursorSkillAdapter(raw);
      const hits = findVietnameseLines(stripped);
      expect(hits).toEqual([]);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: cursor_skill_adapter blocks are intact and non-empty
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-031 — SKILL.md files: cursor_skill_adapter block structure intact', () => {
  const skillFiles = glob.sync('skills/vp-*/SKILL.md', { cwd: ROOT });

  skillFiles.forEach((relPath) => {
    test(`${relPath}: has non-empty cursor_skill_adapter block`, () => {
      const content = read(relPath);
      expect(content).toMatch(/<cursor_skill_adapter>/);
      expect(content).toMatch(/<\/cursor_skill_adapter>/);
      // Block must contain at least one meaningful (non-tag) line
      const blockMatch = content.match(/<cursor_skill_adapter>([\s\S]*?)<\/cursor_skill_adapter>/);
      expect(blockMatch).not.toBeNull();
      const blockBody = blockMatch[1].trim();
      expect(blockBody.length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: AI-GUIDE.md template is English
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-031 — templates/project/AI-GUIDE.md: all English', () => {
  test('no Vietnamese diacritics anywhere in AI-GUIDE.md', () => {
    const content = read('templates/project/AI-GUIDE.md');
    const hits = findVietnameseLines(content);
    expect(hits).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: Frontmatter descriptions are English
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-031 — SKILL.md frontmatter descriptions: English only', () => {
  const skillFiles = glob.sync('skills/vp-*/SKILL.md', { cwd: ROOT });

  skillFiles.forEach((relPath) => {
    test(`${relPath}: frontmatter description is English`, () => {
      const content = read(relPath);
      const descMatch = content.match(/^description:\s*"(.+)"/m);
      if (!descMatch) return; // no description field — skip
      const descValue = descMatch[1];
      expect(VIEPILOT_CHARS.test(descValue)).toBe(false);
    });
  });
});
