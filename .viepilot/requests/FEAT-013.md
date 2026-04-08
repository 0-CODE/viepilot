# FEAT-013: ViePilot platform pivot — Claude Code as primary target

## Meta
- **ID**: FEAT-013
- **Type**: Feature (Platform Migration)
- **Status**: new
- **Priority**: critical
- **Created**: 2026-04-08
- **Reporter**: User
- **Assignee**: AI

## Summary
ViePilot was originally built with Cursor as the primary AI IDE target. All install paths,
workflow references, skill discovery mechanisms, and dev tooling point to `~/.cursor/`.
This request pivots ViePilot's primary platform to **Claude Code** — the Anthropic CLI
available as a standalone tool, IDE extensions (VS Code, JetBrains), and the Claude.ai
web interface. Cursor remains a supported secondary target.

## Details
### Current state (Cursor-centric)
- `dev-install.sh` hardcodes `~/.cursor/skills/` and `~/.cursor/viepilot/` as targets
- `lib/viepilot-install.cjs` treats Cursor as default, Claude Code as an optional add-on
  (`installTargets.includes('claude-code')`)
- All workflows load via `@$HOME/.cursor/viepilot/workflows/*.md`
- All skill `execution_context` references point to `@$HOME/.cursor/viepilot/workflows/`
- `SKILL.md` docs describe Cursor agent as primary context
- README, docs, install guides reference Cursor primarily
- Hook system: does not exist (Cursor uses its own rules file system, not hooks)

### Desired state (Claude Code-primary)
1. **Install paths**: `~/.claude/skills/` and `~/.claude/viepilot/` become the primary
   install target; `~/.cursor/` remains supported but is secondary
2. **dev-install.sh**: default profile = `claude-code`; Cursor is `--cursor` flag
3. **Skill execution_context**: `@$HOME/.claude/viepilot/workflows/` as primary reference
4. **Hook system**: `~/.claude/settings.json` as the configuration point for ViePilot hooks
5. **`vp-tools install`**: Claude Code installer as the default flow (not Cursor)
6. **README + docs**: Claude Code instructions first; Cursor as "also supported"
7. **CI/CD**: test against Claude Code install path in integration tests

### Research findings (Claude Code hooks system)
From research conducted 2026-04-08:
- **30 hook events** available: SessionStart, Stop, UserPromptSubmit, PreToolUse, PostToolUse,
  FileChanged, SubagentStart/Stop, TaskCreated/Completed, PreCompact/PostCompact, etc.
- **4 handler types**: command (shell), http, prompt (Haiku eval), agent (subagent with tools)
- **Config**: `.claude/settings.json` (project) or `~/.claude/settings.json` (global)
- **Input**: JSON on stdin per event with session_id, cwd, event data
- **Key events for ViePilot**:
  - `Stop` → post-exchange hooks (FEAT-012 staleness detection)
  - `SessionStart` → load project context into Claude memory
  - `UserPromptSubmit` → intercept and augment vp-* commands
  - `PreToolUse` → permission guards for sensitive file edits
  - `FileChanged` → react to architect/ui-direction HTML changes

### Migration scope

| Area | Current (Cursor) | Target (Claude Code) |
|------|-----------------|----------------------|
| Install dir | `~/.cursor/skills/` | `~/.claude/skills/` |
| Viepilot dir | `~/.cursor/viepilot/` | `~/.claude/viepilot/` |
| Default profile | `cursor-agent` | `claude-code` |
| dev-install.sh default | cursor | claude-code |
| Hooks config | N/A | `~/.claude/settings.json` |
| Docs priority | Cursor first | Claude Code first |
| execution_context | `@$HOME/.cursor/...` | `@$HOME/.claude/...` |

### Breaking changes
- `dev-install.sh` without flags will now install to `~/.claude/` (not `~/.cursor/`)
- Existing Cursor users: must pass `--cursor` flag or `VIEPILOT_INSTALL_PROFILE=cursor-agent`
- Skill `execution_context` paths in SKILL.md files need updating

## Acceptance Criteria
- [ ] `dev-install.sh` default target is `claude-code` (`~/.claude/`)
- [ ] `lib/viepilot-install.cjs` treats `claude-code` as default `installTargets[0]`
- [ ] All skill `execution_context` blocks reference `~/.claude/viepilot/workflows/`
- [ ] `~/.claude/settings.json` hook registration scaffolded (for FEAT-012)
- [ ] README: Claude Code install instructions are first; Cursor is "also supported"
- [ ] `docs/user/getting-started.md` updated to Claude Code flow
- [ ] Cursor install path still works (no regression) — integration test covers both
- [ ] Contract tests verify install paths for both profiles

## Related
- Phase: TBD (→ Phase 53 — research + migration; may span multiple tasks)
- Files:
  - `dev-install.sh`
  - `lib/viepilot-install.cjs`
  - `skills/vp-*/SKILL.md` (all execution_context blocks)
  - `README.md`
  - `docs/user/getting-started.md` (new or update)
  - `install.sh`, `bin/viepilot.cjs`
  - `~/.claude/settings.json` (hook config scaffold)
- Dependencies:
  - FEAT-012 (brainstorm staleness hook) — depends on Claude Code hooks being primary
  - All prior phases are prerequisites (framework must be stable before pivoting platform)

## Discussion
The pivot is strategic: Claude Code is the Anthropic-native CLI and is actively developed
with a rich hooks system (30 events, 4 handler types) that Cursor's rules-based system
cannot match. Claude Code is available standalone (CLI), in VS Code/JetBrains extensions,
and on claude.ai/code — broader reach than Cursor.

The hooks system enables ViePilot to implement reactive automation (FEAT-012) that was
previously not possible with Cursor's passive rules files. This opens a new category of
ViePilot capabilities: post-exchange processing, permission guards, session lifecycle hooks.

Migration can be done without breaking existing Cursor users by making Claude Code the
default and Cursor the explicit opt-in.
