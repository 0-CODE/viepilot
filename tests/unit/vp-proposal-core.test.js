'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const { PROPOSAL_TYPES, resolveTemplate, detectBrainstormSession, validateType } =
  require('../../lib/proposal-generator.cjs');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ─────────────────────────────────────────────────────────────────────────────
// resolveTemplate
// ─────────────────────────────────────────────────────────────────────────────
describe('proposal-generator — resolveTemplate', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-proposal-test-'));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns project override path when .viepilot/proposal-templates/{type}.pptx exists', () => {
    const overrideDir = path.join(tmpDir, '.viepilot', 'proposal-templates');
    fs.mkdirSync(overrideDir, { recursive: true });
    const overrideFile = path.join(overrideDir, 'general.pptx');
    fs.writeFileSync(overrideFile, 'fake-pptx');

    const result = resolveTemplate('general', 'pptx', tmpDir);
    expect(result).toBe(overrideFile);
  });

  test('falls back to stock path when project override is absent', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-empty-'));
    try {
      const result = resolveTemplate('general', 'pptx', emptyDir);
      expect(result).toMatch(/templates[/\\]proposal[/\\]pptx[/\\]general\.pptx$/);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  test('resolveTemplate works for .docx extension', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-empty2-'));
    try {
      const result = resolveTemplate('project-detail', 'docx', emptyDir);
      expect(result).toMatch(/templates[/\\]proposal[/\\]docx[/\\]project-detail\.docx$/);
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateType
// ─────────────────────────────────────────────────────────────────────────────
describe('proposal-generator — validateType', () => {
  test.each(Object.keys(PROPOSAL_TYPES))(
    'valid type "%s" passes without throwing',
    (typeId) => {
      expect(() => validateType(typeId)).not.toThrow();
    }
  );

  test('unknown type throws with helpful message listing valid IDs', () => {
    expect(() => validateType('nonexistent')).toThrow(/project-proposal/);
  });

  test('project-proposal has 10 slides', () => {
    expect(validateType('project-proposal').slides).toBe(10);
  });

  test('tech-architecture has 12 slides', () => {
    expect(validateType('tech-architecture').slides).toBe(12);
  });

  test('product-pitch has 12 slides', () => {
    expect(validateType('product-pitch').slides).toBe(12);
  });

  test('general has 8 slides', () => {
    expect(validateType('general').slides).toBe(8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// detectBrainstormSession
// ─────────────────────────────────────────────────────────────────────────────
describe('proposal-generator — detectBrainstormSession', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-bs-test-'));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns null when docs/brainstorm/ directory is absent', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-nodir-'));
    try {
      expect(detectBrainstormSession(emptyDir)).toBeNull();
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  test('returns null when docs/brainstorm/ has no session files', () => {
    const bsDir = path.join(tmpDir, 'docs', 'brainstorm');
    fs.mkdirSync(bsDir, { recursive: true });
    expect(detectBrainstormSession(tmpDir)).toBeNull();
  });

  test('returns most recent session when multiple files exist', () => {
    const bsDir = path.join(tmpDir, 'docs', 'brainstorm');
    fs.writeFileSync(path.join(bsDir, 'session-2026-01-01.md'), '# old');
    fs.writeFileSync(path.join(bsDir, 'session-2026-04-11.md'), '# latest');
    fs.writeFileSync(path.join(bsDir, 'session-2026-03-15.md'), '# middle');

    const result = detectBrainstormSession(tmpDir);
    expect(result).toMatch(/session-2026-04-11\.md$/);
  });
});
