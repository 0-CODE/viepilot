const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  validateSession,
  listPageHtmlFiles,
  INVENTORY_HEADING,
} = require('../../scripts/verify-ui-direction-pages.cjs');

describe('verify-ui-direction-pages', () => {
  let tmp;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ui-dir-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('passes when no pages directory', () => {
    const session = path.join(tmp, 'sess1');
    fs.mkdirSync(session, { recursive: true });
    fs.writeFileSync(path.join(session, 'notes.md'), '# x\n');
    expect(validateSession(session).ok).toBe(true);
  });

  test('fails when pages exist but notes lack inventory heading', () => {
    const session = path.join(tmp, 'sess2');
    fs.mkdirSync(path.join(session, 'pages'), { recursive: true });
    fs.writeFileSync(path.join(session, 'pages', 'a.html'), '<html></html>');
    fs.writeFileSync(path.join(session, 'notes.md'), '# no inventory\n');
    const r = validateSession(session);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes(INVENTORY_HEADING))).toBe(true);
  });

  test('fails when inventory exists but file not mentioned', () => {
    const session = path.join(tmp, 'sess3');
    fs.mkdirSync(path.join(session, 'pages'), { recursive: true });
    fs.writeFileSync(path.join(session, 'pages', 'landing.html'), '<html></html>');
    fs.writeFileSync(
      path.join(session, 'notes.md'),
      `${INVENTORY_HEADING}\n\n| x |\n|---|\n`,
      'utf8',
    );
    const r = validateSession(session);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('pages/landing.html'))).toBe(true);
  });

  test('passes when each page path appears in notes', () => {
    const session = path.join(tmp, 'sess4');
    fs.mkdirSync(path.join(session, 'pages'), { recursive: true });
    fs.writeFileSync(path.join(session, 'pages', 'landing.html'), '<html></html>');
    fs.writeFileSync(
      path.join(session, 'notes.md'),
      `${INVENTORY_HEADING}\n\npages/landing.html listed here for validator.`,
      'utf8',
    );
    expect(validateSession(session).ok).toBe(true);
  });

  test('listPageHtmlFiles returns posix-style paths', () => {
    const session = path.join(tmp, 'sess5');
    fs.mkdirSync(path.join(session, 'pages'), { recursive: true });
    fs.writeFileSync(path.join(session, 'pages', 'x.html'), '');
    const files = listPageHtmlFiles(session);
    expect(files).toEqual(['pages/x.html']);
  });
});
