# FEAT: GitHub Copilot adapter — vp-* skills in Copilot Chat / Copilot CLI

## Meta
- **ID**: FEAT-019
- **Type**: Feature
- **Status**: triaged (→ Phase 84)
- **Priority**: high
- **Created**: 2026-04-18
- **Reporter**: User
- **Assignee**: AI

## Summary
Add `copilot` as a first-class ViePilot adapter so vp-* skills install and run inside GitHub Copilot environments (VS Code Copilot Chat, GitHub Copilot CLI, Copilot agents). GitHub Copilot SDK (Public Preview 2025–2026) exposes a programmable agent runtime that supports custom agents via `.agent.md` files and MCP integration.

## Research Findings

### Feasibility: ✅ HIGH

**GitHub Copilot SDK** (github.com/github/copilot-sdk)
- Public Preview — Python, TypeScript, Go, .NET, Java
- Custom agents defined via `.agent.md` Markdown files (same concept as ViePilot's SKILL.md)
- JSON-RPC communication with Copilot CLI server
- MCP (Model Context Protocol) support across all Copilot surfaces (IDE, CLI, cloud)
- Authentication: GitHub OAuth, App tokens, BYOK

**Integration surfaces:**
| Surface | ViePilot feasibility |
|---------|---------------------|
| VS Code Copilot Chat | ✅ via Copilot Extensions + `.agent.md` skills |
| GitHub Copilot CLI | ✅ via custom agents (`~/.config/gh-copilot/` or SDK) |
| GitHub.com (cloud agent) | ⚠️ partial — cloud agent mode is GA April 2026, custom agents preview |
| JetBrains Copilot | ⚠️ pending IDE parity |

**Key parallel with existing adapters:**
- Codex uses `$skill-name` → Copilot uses `/skill-name` in Chat context
- `.agent.md` extension mirrors ViePilot's `SKILL.md` format
- MCP support means ViePilot tools can register as MCP servers

### Suitability: ✅ STRONG FIT
- FEAT-013 (dynamic adapter system) already provides the exact foundation
- FEAT-015 (Codex adapter) precedent: same pattern, different home dir + invocation
- Copilot SDK `executionContextBase` would be `~/.config/gh-copilot/viepilot` (or `~/.copilot/`)
- Third-party agents in Copilot are now GA (April 2026) — Claude, Codex already listed

## Details

### Adapter implementation plan

**1. `lib/adapters/copilot.cjs`**
```js
module.exports = {
  id: 'copilot',
  name: 'GitHub Copilot',
  skillsDir:   (home) => path.join(home, '.config', 'gh-copilot', 'skills'),
  viepilotDir: (home) => path.join(home, '.config', 'gh-copilot', 'viepilot'),
  executionContextBase: '.config/gh-copilot/viepilot',
  postInstallHint: 'Open Copilot Chat and type /vp-status to get started',
  hooks: {
    configFile: null,  // Copilot uses .agent.md convention
    schema: 'copilot',
    supportedEvents: []
  },
  isAvailable: (home) => fs.existsSync(path.join(home, '.config', 'gh-copilot'))
    || !!which.sync('gh', { nothrow: true })
}
```

**2. SKILL.md adapter table** — add Copilot row to all 17 SKILL.md files:
```
| GitHub Copilot | ✅ `/skill-name` in Chat | Via `.agent.md` custom agent |
```

**3. Install targets** — add `copilot` to installer (`viepilot-install.cjs`)

**4. docs/user/features/adapters.md** — document Copilot surface variants

**5. contract test** — `tests/adapters/copilot.test.cjs`

### Open questions / risks
- Copilot CLI config dir may vary by OS (needs `gh copilot config` probe)
- `.agent.md` file naming: confirm whether Copilot reads SKILL.md directly or needs rename/wrapper
- MCP registration path for ViePilot tools-as-MCP is a stretch goal (Phase 2)
- Cloud agent custom agents still in preview — may need separate surface in Phase 2

## Acceptance Criteria
- [ ] `lib/adapters/copilot.cjs` created with correct paths and `isAvailable` logic
- [ ] Copilot added to `lib/adapters/index.cjs`
- [ ] Installer (`viepilot-install.cjs`) supports `--adapter copilot` target
- [ ] All 17 SKILL.md files updated with Copilot adapter row
- [ ] `postInstallHint` shows correct `/vp-status` invocation
- [ ] Contract test passes: `tests/adapters/copilot.test.cjs`
- [ ] `docs/user/features/adapters.md` updated
- [ ] CHANGELOG + version bump (minor)

## Related
- Phase: **Phase 84** (→ 2.21.0)
- Files: `lib/adapters/copilot.cjs`, `lib/adapters/index.cjs`, `lib/viepilot-install.cjs`, `skills/*/SKILL.md` (×17), `docs/user/features/adapters.md`
- Dependencies: FEAT-013 ✅, FEAT-015 ✅ (Codex adapter pattern)
- Parallel: ENH-057 (Agents system)

## Sources (Research)
- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)
- [About third-party agents — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/about-third-party-agents)
- [Using extensions to integrate external tools with Copilot Chat](https://docs.github.com/en/copilot/using-github-copilot/using-extensions-to-integrate-external-tools-with-copilot-chat)
- [Build an agent into any app with the GitHub Copilot SDK](https://github.blog/news-insights/company-news/build-an-agent-into-any-app-with-the-github-copilot-sdk/)
- [GitHub Copilot & Claude Code Multi-Agent Collaboration (Feb 2026)](https://smartscope.blog/en/generative-ai/github-copilot/github-copilot-claude-code-multi-agent-2025/)

## Resolution
{Filled when resolved}
