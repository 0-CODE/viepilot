# changelog-agent

## Purpose
Atomically append a new `[X.Y.Z]` entry to `CHANGELOG.md` and bump the version field
in `package.json` (and optionally `templates/project/VIEPILOT-META.md`). This is the
single authoritative path for all version bumps in ViePilot — resolving ENH-053's
conflict between `autonomous.md` and `evolve.md` both doing inline version bumps.

## Inputs
- `version`: new version string (e.g. `"2.20.0"`)
- `date`: release date (ISO format, e.g. `"2026-04-18"`)
- `entries`: list of changelog bullet objects:
  ```json
  [
    { "type": "Added", "items": ["**ENH-057**: Agents System — 6 dedicated sub-agents"] },
    { "type": "Fixed", "items": ["ENH-053: version bump conflict resolved"] }
  ]
  ```
- `files_to_bump` (optional): extra files where version string needs updating
  (default: `["package.json"]`)
- `bump_meta` (optional, default `true`): also update `templates/project/VIEPILOT-META.md`

## Outputs
- Confirmation: version bumped in N files
- CHANGELOG entry as written (for caller to display in summary)
- Error if CHANGELOG.md not found or version already exists

## Invocation Pattern

### Claude Code (terminal)
```
Agent({
  subagent_type: "general-purpose",
  description: "Changelog + version bump → {version}",
  prompt: `
    You are changelog-agent. Make these atomic changes:
    1. In CHANGELOG.md: prepend a new ## [{version}] - {date} section with entries:
       {entries}
    2. In package.json: set "version": "{version}"
    3. If bump_meta=true: in templates/project/VIEPILOT-META.md, update version field

    Read each file before editing. Confirm what changed.
    Do NOT edit any other files.
  `
})
```

### Cursor / Codex / Antigravity
Execute inline: read CHANGELOG.md, prepend entry; update package.json version. Confirm changes.

## Adapter Behavior
| Adapter | Behavior |
|---------|----------|
| Claude Code | Spawns general-purpose subagent with write access |
| Cursor | Inline edits in same session |
| Codex | Inline edits in same session |
| Antigravity | Inline edits in same session |

## Notes
- **Single authority**: only changelog-agent should bump versions. Both `autonomous.md`
  and `evolve.md` must invoke this agent — never do inline version bumps (ENH-053 fix)
- Always prepend (newest first) — never append to CHANGELOG.md
- Validate that the version doesn't already exist in CHANGELOG before writing
- CHANGELOG format follows Keep a Changelog: Added / Changed / Fixed / Removed sections
