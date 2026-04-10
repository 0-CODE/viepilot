# Supported Adapters

ViePilot supports multiple AI coding platforms via its adapter system (FEAT-013). Each adapter defines where skills and workflows are installed on your machine.

## Supported Platforms

| Adapter ID | Platform | Skills dir | ViePilot dir | Hooks |
|------------|----------|------------|--------------|-------|
| `claude-code` | Claude Code *(default)* | `~/.claude/skills/` | `~/.claude/viepilot/` | ✅ Stop, PreToolUse, … |
| `cursor-agent` / `cursor-ide` | Cursor | `~/.cursor/skills/` | `~/.cursor/viepilot/` | — |
| `antigravity` | Google Antigravity | `~/.antigravity/skills/` | `~/.antigravity/viepilot/` | — |

## Install for a specific platform

```bash
# Claude Code (default)
viepilot install

# Cursor Agent
viepilot install --target cursor-agent

# Google Antigravity
viepilot install --target antigravity

# Multiple targets at once
viepilot install --target claude-code,antigravity
```

Using the dev installer (framework repo only):

```bash
VIEPILOT_ADAPTER=antigravity ./dev-install.sh
VIEPILOT_ADAPTER=cursor-agent ./dev-install.sh
```

## How path resolution works (ENH-035)

Skill source files use the neutral placeholder `{envToolDir}` in `execution_context` blocks:

```
@$HOME/{envToolDir}/workflows/autonomous.md
```

At install time, `{envToolDir}` is replaced with each adapter's `executionContextBase`:
- `claude-code` → `.claude/viepilot`
- `cursor` → `.cursor/viepilot`
- `antigravity` → `.antigravity/viepilot`

## Adding a new adapter

Create `lib/adapters/{name}.cjs`:

```js
module.exports = {
  id: 'myplatform',
  name: 'My Platform',
  skillsDir:   (home) => path.join(home, '.myplatform', 'skills'),
  viepilotDir: (home) => path.join(home, '.myplatform', 'viepilot'),
  executionContextBase: '.myplatform/viepilot',  // {envToolDir} resolves to this
  hooks: { configFile: null, schema: 'myplatform', supportedEvents: [] },
  installSubdirs: ['workflows', 'templates/project', 'templates/phase',
                   'templates/architect', 'bin', 'lib', 'ui-components'],
  isAvailable: (home) => fs.existsSync(path.join(home, '.myplatform'))
};
```

Register in `lib/adapters/index.cjs`:

```js
'myplatform': require('./myplatform.cjs'),
```

No `pathRewrite` field needed — `{envToolDir}` substitution is handled automatically.
