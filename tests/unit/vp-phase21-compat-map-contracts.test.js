const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const VIEPILOT_ROOT = path.join(ROOT, '.viepilot');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function readJson(relPath) {
  return JSON.parse(read(relPath));
}

function listFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return listFiles(absPath);
    }

    return [path.relative(ROOT, absPath).split(path.sep).join('/')];
  });
}

function matchesRule(relPath, rule) {
  const { match } = rule;

  if (match.type === 'path') {
    return match.values.includes(relPath);
  }

  if (match.type === 'prefix') {
    return relPath.startsWith(match.value);
  }

  if (match.type === 'regex') {
    return new RegExp(match.value).test(relPath);
  }

  throw new Error(`Unsupported match type: ${match.type}`);
}

describe('Phase 21 compatibility map contracts', () => {
  test('compat-map artifacts parse and declare canonical paths', () => {
    const schema = readJson('.viepilot/schemas/compat-map.schema.json');
    const compatMap = readJson('.viepilot/compat-map.json');

    expect(schema.properties.artifact.properties.path.const).toBe('.viepilot/compat-map.json');
    expect(compatMap.artifact.path).toBe('.viepilot/compat-map.json');
    expect(Array.isArray(compatMap.classifications)).toBe(true);
    expect(compatMap.classifications.length).toBeGreaterThan(0);
  });

  test('project context, architecture, and spec reference the compatibility map', () => {
    expect(read('.viepilot/PROJECT-CONTEXT.md')).toMatch(/compat-map\.json/);
    expect(read('.viepilot/ARCHITECTURE.md')).toMatch(/compat-map\.json/);
    expect(read('.viepilot/SPEC.md')).toMatch(/Compatibility Map Contract/);
    expect(read('.viepilot/SPEC.md')).toMatch(/compat-map\.schema\.json/);
  });

  test('every current .viepilot file matches exactly one compat-map rule', () => {
    const compatMap = readJson('.viepilot/compat-map.json');
    const files = listFiles(VIEPILOT_ROOT);

    const unmatched = [];
    const duplicateMatches = [];

    for (const relPath of files) {
      const matches = compatMap.classifications.filter((rule) => matchesRule(relPath, rule));

      if (matches.length === 0) {
        unmatched.push(relPath);
      } else if (matches.length > 1) {
        duplicateMatches.push({
          relPath,
          rules: matches.map((rule) => rule.id)
        });
      }
    }

    expect(unmatched).toEqual([]);
    expect(duplicateMatches).toEqual([]);
  });
});
