const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('FEAT-009 global profiles contracts', () => {
  test('docs/dev/global-profiles.md defines paths and META binding', () => {
    const md = read('docs/dev/global-profiles.md');
    expect(md).toMatch(/~\/.viepilot\/profiles/);
    expect(md).toMatch(/profile-map\.md/);
    expect(md).toMatch(/\.viepilot\/META\.md/);
    expect(md).toMatch(/viepilot_profile_id/);
  });

  test('brainstorm workflow defines project meta intake', () => {
    const md = read('workflows/brainstorm.md');
    expect(md).toMatch(/Project meta intake \(FEAT-009\)/);
    expect(md).toMatch(/profile-map/);
    expect(md).toMatch(/META\.md/);
  });

  test('crystallize workflow loads META and profile_resolved', () => {
    const md = read('workflows/crystallize.md');
    expect(md).toMatch(/ViePilot active profile \(FEAT-009\)/);
    expect(md).toMatch(/viepilot_profile_id/);
    expect(md).toMatch(/profile_resolved/);
  });

  test('documentation workflow defines profile resolution 0A', () => {
    const md = read('workflows/documentation.md');
    expect(md).toMatch(/0A\. ViePilot active profile \(FEAT-009\)/);
  });

  test('installer includes profiles dir and write_file_if_missing for profile-map', () => {
    const src = read('lib/viepilot-install.cjs');
    expect(src).toMatch(/viepilotProfilesDir/);
    expect(src).toMatch(/write_file_if_missing/);
    expect(src).toMatch(/profile-map\.md/);
  });

  test('VIEPILOT-META template defines viepilot_profile_id', () => {
    const md = read('templates/project/VIEPILOT-META.md');
    expect(md).toMatch(/viepilot_profile_id/);
  });

  test('vp-brainstorm, vp-crystallize, vp-docs skills reference FEAT-009', () => {
    expect(read('skills/vp-brainstorm/SKILL.md')).toMatch(/FEAT-009/);
    expect(read('skills/vp-crystallize/SKILL.md')).toMatch(/FEAT-009/);
    expect(read('skills/vp-docs/SKILL.md')).toMatch(/FEAT-009/);
  });
});
