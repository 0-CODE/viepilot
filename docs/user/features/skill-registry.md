# Skill Registry

ViePilot can discover and index skills installed across all adapter directories. The registry powers workflow skill integration — brainstorm silently applies relevant skill best practices during UI-Direction sessions, crystallize locks skill decisions, and vp-auto executes with no re-prompting.

## Commands

| Command | Description |
|---------|-------------|
| `vp-tools scan-skills` | Scan all adapter dirs and write `~/.viepilot/skill-registry.json` |
| `vp-tools list-skills` | Display indexed skills from the registry |
| `vp-tools install-skill <source>` | Install a third-party skill *(Phase 91 — coming soon)* |

## Extended SKILL.md Format

Third-party skills (and built-in vp-* skills) can add optional metadata sections to their `SKILL.md`:

```markdown
## Capabilities
- ui-generation
- component-design
- responsive-layout

## Tags
ui, design, frontend, css, html

## Best Practices
- Mobile-first: design breakpoints from 320px up
- Use design tokens for consistency across components
- BEM naming convention for CSS class names
```

### Section rules

| Section | Format | Description |
|---------|--------|-------------|
| `## Capabilities` | One capability per line (`- item`) | Machine-readable ability tags used for skill matching |
| `## Tags` | Comma-separated or one per line | Human-readable keywords for discovery |
| `## Best Practices` | One practice per line (`- item`) | Applied silently when skill is matched in brainstorm/vp-auto |

All sections are **optional** — skills without them are still indexed and available.

### Backward compatibility

Existing `SKILL.md` files that do not contain these sections continue to work without modification. The scanner indexes them with empty `capabilities`, `tags`, and `best_practices` arrays and marks them as `(legacy — no capabilities)` in `list-skills` output.

## Scanner

`vp-tools scan-skills` traverses the following adapter directories:

| Adapter | Skill directory |
|---------|----------------|
| Claude Code | `~/.claude/skills/` |
| Cursor | `~/.cursor/skills/` |
| Codex | `~/.codex/skills/` |
| Antigravity | `~/.antigravity/skills/` |
| GitHub Copilot | `~/.config/gh-copilot/skills/` |

Adapter directories that do not exist are silently skipped. The same skill found in multiple adapter directories is merged into a single registry entry with all adapters listed.

## Registry Format

The registry is written to `~/.viepilot/skill-registry.json`:

```json
{
  "version": "1.0",
  "last_scan": "2026-04-20T10:30:00.000Z",
  "scan_paths": [
    "/Users/you/.claude/skills",
    "/Users/you/.cursor/skills"
  ],
  "skills": [
    {
      "id": "frontend-design",
      "name": "frontend-design",
      "source": null,
      "version": null,
      "description": "Opinionated frontend design guidance for UI-Direction sessions.",
      "capabilities": ["ui-generation", "component-design", "responsive-layout"],
      "tags": ["ui", "design", "frontend", "css"],
      "best_practices": [
        "Mobile-first: design breakpoints from 320px up",
        "Use design tokens for consistency"
      ],
      "adapters": ["claude-code", "cursor"],
      "installed_paths": {
        "claude-code": "/Users/you/.claude/skills/frontend-design",
        "cursor": "/Users/you/.cursor/skills/frontend-design"
      }
    }
  ]
}
```

### Schema reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Directory name (unique per skill) |
| `name` | string | Display name (defaults to `id`) |
| `source` | string \| null | Installation source: `npm:pkg`, `github:org/repo`, `./path`, or `null` for manually placed skills |
| `version` | string \| null | Version from `skill-meta.json` (future); `null` for legacy skills |
| `description` | string | First non-heading paragraph from `SKILL.md` |
| `capabilities` | string[] | From `## Capabilities` section |
| `tags` | string[] | From `## Tags` section |
| `best_practices` | string[] | From `## Best Practices` section |
| `adapters` | string[] | Adapter IDs where this skill is installed |
| `installed_paths` | object | `{ adapterId: absolutePath }` |

## Workflow Integration

The registry is used automatically by ViePilot workflows:

### Brainstorm (UI-Direction)
When UI signals are detected during a brainstorm session, relevant skills (matched by `capabilities`) are silently applied — their `best_practices` are included in HTML generation without prompting. Matched skills are recorded in `notes.md` under `## skills_used`.

### Crystallize (skill decision lock)
After the brainstorm scope is locked, crystallize presents the skills used and asks the user to confirm which are required vs optional per phase. The decision is written to `PROJECT-CONTEXT.md` under `## Skills`.

### vp-auto (silent execution)
vp-auto reads `## Skills` from `PROJECT-CONTEXT.md` and injects skill best practices per task — no re-asking. Decisions made at crystallize time are final.

## Refreshing the Registry

Run `vp-tools scan-skills` any time you install a new skill manually or after `vp-tools install-skill` (which runs it automatically). The registry is not auto-refreshed on session start.
