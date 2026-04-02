# ViePilot — Project Meta

## Project Info

| Field | Value |
|-------|-------|
| Name | ViePilot |
| Short description | Autonomous vibe coding framework cho solo developers |
| Full description | ViePilot là framework giúp solo developer thực hiện các dự án lớn thông qua structured brainstorm → crystallize → autonomous execution loop. Doc-first, git-tracked, human-in-the-loop. |
| Version | 2.0.0-alpha |
| Status | In Development |
| Inception | 2026 |
| License | MIT |

## Organization Info

| Field | Value |
|-------|-------|
| Organization | CÔNG TY TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM |
| Repository | https://github.com/0-CODE/viepilot |
| Issue Tracker | https://github.com/0-CODE/viepilot/issues |

*No ViePilot global profile bound — organization context from metadata above.*

## Lead Developer

| Field | Value |
|-------|-------|
| Name | Trần Thành Nhân |
| Username | Nhan.TT |
| Email | nhan.tt@mig.com.vn |
| GitHub | 0-CODE |

## Package Structure

ViePilot là shell/Markdown framework, không dùng Java package structure.

```
viepilot/
├── skills/           # Skill definitions (vp-* namespaced)
│   └── vp-{name}/
│       └── SKILL.md
├── workflows/        # Process workflow definitions
│   └── {name}.md
├── templates/        # Artifact templates
│   ├── project/      # .viepilot/ project templates
│   └── phase/        # Phase + task templates
├── lib/              # Shell library functions
├── bin/              # CLI tools (vp-tools)
├── docs/             # User + developer documentation
│   ├── user/
│   ├── dev/
│   └── brainstorm/
└── .viepilot/        # Framework's own project state (this directory)
```

## File Headers

For shell scripts (`lib/`, `bin/`):
```bash
#!/usr/bin/env bash
# =============================================================================
# ViePilot — {component name}
# Copyright (c) 2026 CÔNG TY TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM
# Lead Developer: Trần Thành Nhân <nhan.tt@mig.com.vn>
# License: MIT — https://github.com/0-CODE/viepilot/blob/main/LICENSE
# =============================================================================
```

For Markdown files (optional header comment):
```markdown
<!-- ViePilot v2 | {file purpose} | MIT License -->
```

## Version History Reference

See `logs/version-history.md` for full version history.

| Version | Branch | Notes |
|---------|--------|-------|
| 1.9.10 | main | Latest stable (v1) |
| 2.0.0-alpha | v2 | In development |
