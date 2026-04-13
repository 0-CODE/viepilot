'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('FEAT-018 vp-crystallize Brownfield Mode', () => {

  describe('workflows/crystallize.md — brownfield detection', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('brownfield_detection step exists before analyze_brainstorm step', () => {
      const brownfieldIdx = content.indexOf('step name="brownfield_detection"');
      const brainstormIdx = content.indexOf('step name="analyze_brainstorm"');
      expect(brownfieldIdx).toBeGreaterThan(0);
      expect(brainstormIdx).toBeGreaterThan(0);
      expect(brownfieldIdx).toBeLessThan(brainstormIdx);
    });

    test('--brownfield flag documented', () => {
      expect(content).toMatch(/--brownfield/);
    });

    test('auto-detection condition documented (no brainstorm session + no .viepilot/)', () => {
      expect(content).toMatch(/docs\/brainstorm.*absent|absent.*docs\/brainstorm|no.*session-\*\.md|empty.*no.*session/i);
    });

    test('overwrite guard documented (.viepilot/ already exists warning)', () => {
      expect(content).toMatch(/already exists.*overwrite|overwrite.*already exists/i);
    });
  });

  describe('workflows/crystallize.md — Signal Categories 1–6', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('Signal Cat 1: Node.js manifest (package.json) listed', () => {
      expect(content).toMatch(/Signal Category 1/);
      expect(content).toMatch(/package\.json/);
    });

    test('Signal Cat 1: Java/Maven (pom.xml) listed', () => {
      expect(content).toMatch(/pom\.xml/);
    });

    test('Signal Cat 1: Go (go.mod) listed', () => {
      expect(content).toMatch(/go\.mod/);
    });

    test('Signal Cat 1: Rust (Cargo.toml) listed', () => {
      expect(content).toMatch(/Cargo\.toml/);
    });

    test('Signal Cat 2: Spring Boot backend framework pattern listed', () => {
      expect(content).toMatch(/Signal Category 2/);
      expect(content).toMatch(/spring-boot-starter/);
    });

    test('Signal Cat 2: React frontend framework pattern listed', () => {
      expect(content).toMatch(/react.*react-dom|react-dom.*react/i);
    });

    test('Signal Cat 2: ORM patterns (TypeORM, Prisma, SQLAlchemy) listed', () => {
      expect(content).toMatch(/typeorm/i);
      expect(content).toMatch(/prisma/i);
      expect(content).toMatch(/sqlalchemy/i);
    });

    test('Signal Cat 3: 18-direction architecture layer patterns documented', () => {
      expect(content).toMatch(/Signal Category 3/);
      expect(content).toMatch(/controllers?.*MVC|MVC.*controllers?/i);
      expect(content).toMatch(/repositories?.*DAO|DAO.*repositories?/i);
    });

    test('Signal Cat 4: Flyway + Liquibase + Prisma migration detection listed', () => {
      expect(content).toMatch(/Signal Category 4/);
      expect(content).toMatch(/Flyway/);
      expect(content).toMatch(/Liquibase/);
      expect(content).toMatch(/prisma\/schema\.prisma/i);
    });

    test('Signal Cat 4: docker-compose cross-reference for DB services documented', () => {
      expect(content).toMatch(/docker-compose.*service|service.*docker-compose/i);
    });

    test('Signal Cat 5: api_style inference rules present (REST/gRPC/GraphQL)', () => {
      expect(content).toMatch(/Signal Category 5/);
      expect(content).toMatch(/api_style/);
      expect(content).toMatch(/gRPC|\.proto/);
      expect(content).toMatch(/GraphQL|\.graphql/);
    });

    test('Signal Cat 6: Dockerfile + k8s + Terraform + Vercel listed', () => {
      expect(content).toMatch(/Signal Category 6/);
      expect(content).toMatch(/Dockerfile/);
      expect(content).toMatch(/kubernetes|k8s/i);
      expect(content).toMatch(/terraform/i);
      expect(content).toMatch(/vercel/i);
    });
  });

  describe('workflows/crystallize.md — Signal Categories 7–12', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('Signal Cat 7: .env.example documented + explicit "never read .env" safety rule', () => {
      expect(content).toMatch(/Signal Category 7/);
      expect(content).toMatch(/\.env\.example/);
      expect(content).toMatch(/never read.*\.env|SAFETY.*Never read.*\.env/i);
    });

    test('Signal Cat 8: Jest + pytest + Playwright test framework configs listed', () => {
      expect(content).toMatch(/Signal Category 8/);
      expect(content).toMatch(/jest\.config/);
      expect(content).toMatch(/pytest\.ini/);
      expect(content).toMatch(/playwright\.config/);
    });

    test('Signal Cat 8: coverage report dir detection (coverage/, htmlcov/)', () => {
      expect(content).toMatch(/coverage\/|htmlcov\//);
      expect(content).toMatch(/has_coverage_reports/);
    });

    test('Signal Cat 9: ESLint + SonarQube + pre-commit tools listed', () => {
      expect(content).toMatch(/Signal Category 9/);
      expect(content).toMatch(/\.eslintrc/);
      expect(content).toMatch(/sonar-project\.properties/);
      expect(content).toMatch(/pre-commit-config\.yaml/);
    });

    test('Signal Cat 10: README.md MUST-READ + CHANGELOG.md SHOULD-READ documented', () => {
      expect(content).toMatch(/Signal Category 10/);
      expect(content).toMatch(/README\.md.*MUST-READ|MUST-READ.*README\.md/);
      expect(content).toMatch(/CHANGELOG\.md/);
    });

    test('Signal Cat 10: README.md absent → project_name MISSING rule', () => {
      expect(content).toMatch(/README.*absent.*project_name.*MISSING|MISSING.*README.*absent/i);
    });

    test('Signal Cat 11: git commands listed (git log, git tag, git shortlog)', () => {
      expect(content).toMatch(/Signal Category 11/);
      expect(content).toMatch(/git log/);
      expect(content).toMatch(/git tag/);
      expect(content).toMatch(/git shortlog/);
    });

    test('Signal Cat 11: "not a git repo" fallback documented', () => {
      expect(content).toMatch(/not a git repo|If not a git repo/i);
    });

    test('Signal Cat 12: file extension survey + language_distribution documented', () => {
      expect(content).toMatch(/Signal Category 12/);
      expect(content).toMatch(/language_distribution/);
      expect(content).toMatch(/secondary_languages/);
    });
  });

  describe('workflows/crystallize.md — Scan Report + Gap Detection', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('Scan Report YAML schema present with project_name + open_questions[]', () => {
      expect(content).toMatch(/Scan Report Schema/);
      expect(content).toMatch(/project_name: string/);
      expect(content).toMatch(/open_questions: \[\]/);
    });

    test('language_distribution field present in schema', () => {
      expect(content).toMatch(/language_distribution:/);
    });

    test('Gap Detection Rules section present with DETECTED / ASSUMED / MISSING tiers', () => {
      expect(content).toMatch(/Gap Detection Rules/);
      expect(content).toMatch(/DETECTED/);
      expect(content).toMatch(/ASSUMED/);
      expect(content).toMatch(/MISSING/);
    });

    test('MUST-DETECT fields explicitly listed (project_name, primary_language, framework, version)', () => {
      expect(content).toMatch(/MUST-DETECT/);
      expect(content).toMatch(/project_name/);
      expect(content).toMatch(/primary_language/);
      expect(content).toMatch(/current_version/);
    });

    test('Interactive gap-filling: MUST-DETECT MISSING = pause-and-ask rule', () => {
      expect(content).toMatch(/MUST-DETECT.*MISSING.*pause|pause.*MUST-DETECT.*MISSING|must ask user.*before generating/i);
    });
  });

  describe('workflows/crystallize.md — brainstorm stub + safety rules', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('session-brownfield-import.md stub path documented', () => {
      expect(content).toMatch(/session-brownfield-import\.md/);
    });

    test('safety rules: node_modules/ skip listed', () => {
      expect(content).toMatch(/node_modules\//);
    });

    test('safety rules: .git/ skip listed', () => {
      expect(content).toMatch(/\.git\//);
    });

    test('safety rules: target/ + build/ + dist/ skip listed', () => {
      expect(content).toMatch(/target\//);
      expect(content).toMatch(/build\//);
      expect(content).toMatch(/dist\//);
    });

    test('TRACKER brownfield annotation section documented', () => {
      expect(content).toMatch(/TRACKER.*Continuity|Brownfield Import.*TRACKER|## Brownfield Import/i);
    });
  });

  describe('skills/vp-crystallize/SKILL.md — brownfield flag', () => {
    let content;
    beforeAll(() => { content = read('skills/vp-crystallize/SKILL.md'); });

    test('--brownfield flag documented in SKILL.md', () => {
      expect(content).toMatch(/--brownfield/);
    });

    test('12 scanner categories mentioned in SKILL.md', () => {
      // At minimum the word "12" near "scanner" or "signal" or "categor"
      expect(content).toMatch(/12.*scanner|12.*signal|12.*categor|12-category/i);
    });

    test('session-brownfield-import.md stub referenced in SKILL.md', () => {
      expect(content).toMatch(/session-brownfield-import\.md/);
    });
  });

  describe('skills/vp-audit/SKILL.md — brownfield compatibility', () => {
    let content;
    beforeAll(() => { content = read('skills/vp-audit/SKILL.md'); });

    test('vp-audit accepts session-brownfield-import.md as valid source', () => {
      expect(content).toMatch(/session-brownfield-import\.md/);
      expect(content).toMatch(/valid brownfield import|Valid brownfield/i);
    });

    test('vp-audit: stub without Scan Report YAML = LOW severity (not hard fail)', () => {
      expect(content).toMatch(/LOW.*severity.*Scan Report|Scan Report.*LOW.*severity/i);
    });

    test('vp-audit: TRACKER Brownfield Import section satisfies brainstorm check', () => {
      expect(content).toMatch(/## Brownfield Import.*TRACKER|TRACKER.*## Brownfield Import/i);
    });
  });

});
