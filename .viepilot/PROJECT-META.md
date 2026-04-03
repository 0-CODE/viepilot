# ViePilot - Project Metadata

## Project Info

| Field | Value |
|-------|-------|
| Name | ViePilot |
| Description | State-machine-first, compiler-driven AI workflow framework preserving the `vp-request -> vp-brainstorm -> vp-crystallize -> vp-auto` journey |
| Inception Year | 2026 |
| License | MIT |
| Baseline Release | 2.2.3 |
| Planning Target | 3.0.0-alpha |

## Organization

| Field | Value |
|-------|-------|
| Name | CÔNG TY TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM |
| Website | https://viepilot.creps.vn |

*No ViePilot global profile bound — organization context comes from Step 0 metadata only.*

## Package Structure

| Field | Value |
|-------|-------|
| Base Package | `io.github.zero-code.viepilot` |
| Group ID | `io.github.zero-code.viepilot` |
| Artifact ID | `viepilot` |

### Module Packages

This repository ships as a Node/CommonJS CLI and markdown-first framework, so the package IDs are attribution coordinates rather than a Java source tree contract.

```text
viepilot/
├── bin/                 # CLI entrypoints
├── lib/                 # shared Node utilities
├── skills/              # vp-* skills
├── workflows/           # execution guides
├── templates/           # project and phase scaffolds
├── docs/                # user and developer documentation
├── tests/               # contract + integration tests
└── .viepilot/           # local project state for this framework repo
```

## Developers

### Lead Developer

| Field | Value |
|-------|-------|
| Name | Trần Thành Nhân |
| Email | nhan.tt@mig.com.vn |
| GitHub | [@0-CODE](https://github.com/0-CODE) |
| Role | Project Lead, Core Developer |

### Contributors

See [CONTRIBUTORS.md](/Users/sonicq12/DEV_PROJECTS/viepilot/CONTRIBUTORS.md).

## Repository

| Field | Value |
|-------|-------|
| URL | https://github.com/0-CODE/viepilot |
| Issues | https://github.com/0-CODE/viepilot/issues |
| CI/CD | GitHub Actions |

## File Headers

### Shell Script Header

```bash
#!/usr/bin/env bash
# ViePilot
# Copyright (c) 2026 CÔNG TY TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM
# Licensed under the MIT License
```

### JavaScript / CommonJS Header

```js
/**
 * ViePilot
 * Copyright (c) 2026 CÔNG TY TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM
 * License: MIT
 */
```

### Markdown Header

```markdown
<!-- ViePilot | {file purpose} | MIT -->
```

## Author Tag

```js
/**
 * @author Trần Thành Nhân
 */
```
