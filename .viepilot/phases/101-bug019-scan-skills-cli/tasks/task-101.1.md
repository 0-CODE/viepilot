# Task 101.1 — Add `scan-skills` subcommand to bin/vp-tools.cjs

## Objective
Add the missing `scan-skills` CLI subcommand to `bin/vp-tools.cjs` so that `vp-tools scan-skills` works and no longer throws "Unknown command: scan-skills".

The underlying implementation already exists in `lib/skill-registry.cjs` → `scanSkills()`. This task wires it into the CLI dispatcher, adds help text, and updates the usage summary line.

## Paths
- `bin/vp-tools.cjs`

## File-Level Plan

### bin/vp-tools.cjs

**1. Add `scan-skills` command handler** — insert after the `get-registry` handler (around line 1158):

```javascript
/**
 * Scan installed skills and rebuild ~/.viepilot/skill-registry.json (BUG-019)
 */
'scan-skills': (_args) => {
  const { scanSkills } = require('../lib/skill-registry.cjs');
  const result = scanSkills();
  const count = (result && result.skills) ? result.skills.length : 0;
  process.stdout.write(`✔ Scanned ${count} skill${count !== 1 ? 's' : ''} → ~/.viepilot/skill-registry.json\n`);
  process.exit(0);
},
```

**2. Add help entry** — in `commandHelp` object after `'get-registry'` entry (around line 1255):

```javascript
'scan-skills': {
  usage: 'vp-tools scan-skills',
  description: 'Scan installed skills and rebuild ~/.viepilot/skill-registry.json',
  options: [],
  examples: ['vp-tools scan-skills'],
},
```

**3. Update usage summary line** — in the help banner (around line 1314), add after `get-registry` line:

```
  ${colors.bold}scan-skills${colors.reset}               Scan installed skills → ~/.viepilot/skill-registry.json
```

**4. Update hint message** — the "Unknown command" hint lists all commands; add `scan-skills` to the array (search for `Hint: Available commands:`).

## Acceptance Criteria
- [ ] `node bin/vp-tools.cjs scan-skills` exits 0 and prints "✔ Scanned N skill(s)"
- [ ] `node bin/vp-tools.cjs help scan-skills` shows usage
- [ ] `node bin/vp-tools.cjs help` usage summary lists `scan-skills`
- [ ] The "Unknown command" hint includes `scan-skills`
- [ ] No changes to `lib/skill-registry.cjs`

## Implementation Notes
- `scanSkills()` already writes `~/.viepilot/skill-registry.json` as a side effect. The CLI just needs to call it and report the count.
- No arguments needed for the basic form (future: `--adapter` flag could be added later, not in scope).
