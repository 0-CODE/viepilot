# Supported Adapters

ViePilot supports multiple AI coding platforms via its adapter system (FEAT-013). Each adapter defines where skills and workflows are installed on your machine.

## Supported Platforms

| Adapter ID | Platform | Skills dir | ViePilot dir | Hooks | Skill syntax |
|------------|----------|------------|--------------|-------|--------------|
| `claude-code` | Claude Code *(default)* | `~/.claude/skills/` | `~/.claude/viepilot/` | ✅ Stop, PreToolUse, … | `/vp-status` |
| `cursor-agent` / `cursor-ide` | Cursor | `~/.cursor/skills/` | `~/.cursor/viepilot/` | — | `/vp-status` |
| `antigravity` | Google Antigravity | `~/.gemini/antigravity/skills/` | `~/.gemini/antigravity/viepilot/` | — | `/vp-status` |
| `codex` | OpenAI Codex CLI | `~/.codex/skills/` | `~/.codex/viepilot/` | — | `$vp-status` |
| `copilot` | GitHub Copilot | `~/.config/gh-copilot/skills/` | `~/.config/gh-copilot/viepilot/` | — | `/vp-status` |

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

# GitHub Copilot
viepilot install --target copilot

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
- `antigravity` → `.gemini/antigravity/viepilot`
- `codex` → `.codex/viepilot`
- `copilot` → `.config/gh-copilot/viepilot`

## GitHub Copilot

GitHub Copilot adapter (FEAT-019) enables vp-* skills to run inside VS Code Copilot Chat and the GitHub Copilot CLI.

### Surface support

| Surface | Status | Notes |
|---------|--------|-------|
| VS Code Copilot Chat | ✅ Supported | Invoke with `/vp-status`, `/vp-auto`, etc. |
| GitHub Copilot CLI | ✅ Supported | Invoke with `/vp-status` in CLI chat |
| Copilot Cloud Agents | ⚠️ Preview | GitHub Copilot Extensions (Public Preview); subject to change |
| JetBrains Copilot | ⚠️ Pending | Copilot Chat for JetBrains — skills not yet validated |

### Prerequisites

- **gh CLI** installed (`brew install gh` or [cli.github.com](https://cli.github.com))
- **GitHub Copilot subscription** (Individual, Business, or Enterprise)
- **GitHub Copilot extension** for VS Code (marketplace ID: `GitHub.copilot-chat`)

### Installation

```bash
npx viepilot install --target copilot
```

Files are installed to:
- Skills: `~/.config/gh-copilot/skills/`
- Workflows + lib: `~/.config/gh-copilot/viepilot/`

After install, open VS Code, open Copilot Chat (`Ctrl+Shift+I` / `Cmd+Shift+I`), and type `/vp-status`.

### Availability detection

The installer detects Copilot by checking (in order):

1. `~/.config/gh-copilot/` directory exists (primary)
2. `gh` binary found at `/usr/local/bin/gh`, `/opt/homebrew/bin/gh`, or `~/.local/bin/gh` (secondary)

### Known limitations

| Feature | Status |
|---------|--------|
| `AskUserQuestion` interactive prompts | ❌ Not available — skills use text-based menus |
| Hooks (PreToolUse, Stop, etc.) | ❌ Copilot uses `.agent.md` convention, not programmatic hooks |
| MCP server integration | 🔜 Planned for Phase 2 |

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
