#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const README_PATH = path.join(process.cwd(), 'README.md');

function formatLoc(value) {
  return Number(value).toLocaleString('en-US');
}

function extractLocFromClocJson(stdout) {
  const parsed = JSON.parse(stdout);
  if (!parsed.SUM || typeof parsed.SUM.code !== 'number') {
    throw new Error('Invalid cloc JSON output (missing SUM.code)');
  }
  return parsed.SUM.code;
}

function buildTotalLocCell(loc) {
  return `**~${formatLoc(loc)}+** (\`.md\`, \`.js\`, \`.cjs\`, \`.yml\`, \`.json\`, \`.sh\`; không gồm \`node_modules\`)`;
}

function updateReadmeTotalLoc(readmeContent, loc) {
  const replacement = `| Total LOC | ${buildTotalLocCell(loc)} |`;
  return readmeContent.replace(/^\| Total LOC \|.*\|$/m, replacement);
}

function detectCloc() {
  const result = spawnSync('cloc', ['--version'], { encoding: 'utf8' });
  return result.status === 0;
}

function runCloc() {
  const args = [
    '--json',
    '--quiet',
    '--exclude-dir=node_modules,.git',
    '--include-ext=md,js,cjs,yml,yaml,json,sh',
    '.',
  ];
  return spawnSync('cloc', args, { encoding: 'utf8' });
}

function main() {
  if (!fs.existsSync(README_PATH)) {
    console.error('README.md not found');
    process.exit(1);
  }

  if (!detectCloc()) {
    console.log('[readme:sync] cloc not found; skipping README LOC sync.');
    console.log('[readme:sync] Install cloc: brew install cloc | apt install cloc | choco install cloc');
    process.exit(0);
  }

  const result = runCloc();
  if (result.status !== 0) {
    console.log('[readme:sync] cloc execution failed; skipping update.');
    if (result.stderr) console.log(result.stderr.trim());
    process.exit(0);
  }

  let loc;
  try {
    loc = extractLocFromClocJson(result.stdout);
  } catch (error) {
    console.log(`[readme:sync] Failed to parse cloc output: ${error.message}`);
    process.exit(0);
  }

  const readme = fs.readFileSync(README_PATH, 'utf8');
  const updated = updateReadmeTotalLoc(readme, loc);
  if (updated === readme) {
    console.log('[readme:sync] Total LOC row not found; no update applied.');
    process.exit(0);
  }

  fs.writeFileSync(README_PATH, updated, 'utf8');
  console.log(`[readme:sync] README Total LOC updated to ~${formatLoc(loc)}+`);
}

if (require.main === module) {
  main();
}

module.exports = {
  formatLoc,
  extractLocFromClocJson,
  buildTotalLocCell,
  updateReadmeTotalLoc,
};
