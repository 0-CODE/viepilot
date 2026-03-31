#!/usr/bin/env node

const { spawnSync, execSync } = require('child_process');

const pkg = process.env.NPM_PACKAGE || 'viepilot';
const version = process.env.NPM_VERSION || '';
const target = version ? `${pkg}@${version}` : pkg;

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

try {
  console.log(`Checking npm registry metadata for ${target}...`);
  execSync(`npm view ${target} version`, { stdio: 'inherit' });

  console.log(`Running smoke commands via npx for ${target}...`);
  run('npx', ['--yes', target, '--help']);
  run('npx', ['--yes', target, 'install', '--help']);

  console.log('Smoke check passed.');
} catch (error) {
  console.error(`Smoke check failed: ${error.message}`);
  process.exit(1);
}
