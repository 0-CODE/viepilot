#!/usr/bin/env node

const { execSync } = require('child_process');

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

try {
  section('Version');
  console.log(`package.json: ${run("node -p \"require('./package.json').version\"")}`);

  section('Git Status');
  console.log(run('git status --short || true') || 'clean');

  section('Changelog');
  const changelogHead = run("node -e \"const fs=require('fs');const t=fs.readFileSync('CHANGELOG.md','utf8');console.log(t.split('\\n').slice(0,20).join('\\n'))\"");
  console.log(changelogHead);

  section('Prepublish Verification');
  console.log('Run: npm run verify:release');

  section('Publish');
  console.log('Run: npm publish --access public');
  console.log('Or publish via GitHub Actions workflow: Release to npm');

  section('Post-publish Smoke');
  console.log('Run: npm run smoke:published');
  console.log('Or: npx viepilot --help && npx viepilot install --help');
} catch (error) {
  console.error(`Checklist failed: ${error.message}`);
  process.exit(1);
}
