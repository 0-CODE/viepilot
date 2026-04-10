# Supported Adapters

ViePilot supports multiple AI coding platforms via its adapter system (FEAT-013). Each adapter defines where skills and workflows are installed on your machine.

## Supported Platforms

| Adapter ID | Platform | Skills dir | ViePilot dir | Hooks | Skill syntax |
|------------|----------|------------|--------------|-------|--------------|
| `claude-code` | Claude Code *(default)* | `~/.claude/skills/` | `~/.claude/viepilot/` | ✅ Stop, PreToolUse, … | `/vp-status` |
| `cursor-agent` / `cursor-ide` | Cursor | `~/.cursor/skills/` | `~/.cursor/viepilot/` | — | `/vp-status` |
| `antigravity` | Google Antigravity | `~/.antigravity/skills/` | `~/.antigravity/viepilot/` | — | `/vp-status` |
| `codex` | OpenAI Codex CLI | `~/.codex/skills/` | `~/.codex/viepilot/` | — | `$vp-status` |

> **Note — Codex invocation syntax:** OpenAI Codex CLI uses `$skill-name` to invoke skills (e.g. `$vp-status`, `$vp-brainstorm`). The `/command` prefix is reserved for Codex built-in controls (`/plan`, `/clear`, `/diff`, etc.). SKILL.md file format is fully compatible — no changes needed to skill content.

## Install for a specific platform

```bash
# Claude Code (default)
viepilot install

# Cursor Agent
viepilot install --target cursor-agent

# Google Antigravity
viepilot install --target antigravity

# OpenAI Codex CLI
viepilot install --target codex

# Multiple targets at once
viepilot install --target claude-code,antigravity
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
- `codex` → `.codex/viepilot`

## Adding a new adapter

Create `lib/adapters/{name}.cjs`:

```js
module.exports = {
  id: 'myplatform',
  name: 'My Platform',
  skillsDir:   (home) => path.join(home, '.myplatform', 'skills'),
  viepilotDir: (home) => path.join(home, '.myplatform', 'viepilot'),
  executionContextBase: '.myplatform/viepilot',  // {envToolDir} resolves to this
  postInstallHint: 'Open project and run /vp-status',  // or $vp-status if platform uses $ prefix
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
