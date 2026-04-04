const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function readJson(relPath) {
  return JSON.parse(read(relPath));
}

describe('Phase 21 runtime artifact contracts', () => {
  test('runtime artifact schemas parse and declare canonical paths', () => {
    const runtimeState = readJson('.viepilot/schemas/runtime-state.schema.json');
    const executionGraph = readJson('.viepilot/schemas/execution-graph.schema.json');
    const activePacket = readJson('.viepilot/schemas/active-packet.schema.json');

    expect(runtimeState.properties.artifact.properties.path.const).toBe('.viepilot/runtime-state.json');
    expect(executionGraph.properties.artifact.properties.path.const).toBe('.viepilot/execution-graph.json');
    expect(activePacket.properties.artifact.properties.path.const).toBe('.viepilot/active-packet.json');
  });

  test('runtime artifact contract reference documents non-overlap rules', () => {
    const md = read('.viepilot/schemas/runtime-artifact-contracts.md');
    expect(md).toMatch(/Non-overlap guard/);
    expect(md).toMatch(/runtime-state\.json/);
    expect(md).toMatch(/execution-graph\.json/);
    expect(md).toMatch(/active-packet\.json/);
    expect(md).toMatch(/Projection files/);
  });

  test('project context, architecture, and spec agree on artifact roles', () => {
    expect(read('.viepilot/PROJECT-CONTEXT.md')).toMatch(/mutable executor state/);
    expect(read('.viepilot/ARCHITECTURE.md')).toMatch(/runtime artifact split is explicit/);
    expect(read('.viepilot/SPEC.md')).toMatch(/Runtime Artifact Contracts/);
    expect(read('.viepilot/SPEC.md')).toMatch(/runtime-state\.schema\.json/);
    expect(read('.viepilot/SPEC.md')).toMatch(/execution-graph\.schema\.json/);
    expect(read('.viepilot/SPEC.md')).toMatch(/active-packet\.schema\.json/);
  });
});
