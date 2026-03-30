# REST API — ViePilot framework

## Summary

This repository **does not ship a REST HTTP API**. Integration is **file-based** and **CLI-assisted**:

- **Skills** (`skills/vp-*/SKILL.md`) define how an AI assistant runs workflows.
- **Workflows** (`workflows/*.md`) encode step-by-step processes.
- **CLI** (`bin/vp-tools.cjs`) manages version, state, checkpoints, and helpers.

## Primary interfaces

| Interface | Location | Description |
|-----------|----------|-------------|
| CLI | [CLI Reference](../dev/cli-reference.md) | 13 commands (`init`, `version`, `progress`, …) |
| State | `.viepilot/HANDOFF.json`, `.viepilot/TRACKER.md` | Resume and progress |
| Contracts | Templates under `templates/` | Generated project docs |

If you are documenting an **application built with ViePilot**, add OpenAPI or schema files under that app (e.g. `.viepilot/schemas/`) and extend this folder with real endpoints.
