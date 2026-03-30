# ViePilot Documentation

> Autonomous Vibe Coding Framework — phát triển phần mềm với AI có hệ thống và kiểm soát.

## Quick Links

| | |
|--|--|
| 🚀 [Quick Start](user/quick-start.md) | Bắt đầu trong 5 phút |
| 🔧 [CLI Reference](dev/cli-reference.md) | `vp-tools` commands |
| 🏗️ [Architecture](dev/architecture.md) | System design |
| 🔌 [API / interfaces](api/README.md) | No HTTP API — CLI & file contracts |
| ❓ [FAQ](user/faq.md) | Common questions |
| 🐛 [Troubleshooting](troubleshooting.md) | Common issues |

---

## Documentation Index

### User Guide

| Document | Description |
|----------|-------------|
| [Quick Start](user/quick-start.md) | Install, brainstorm, crystallize, auto — 5 min guide |
| [FAQ](user/faq.md) | Frequently asked questions |

#### Features

| Feature | Document |
|---------|----------|
| Autonomous Mode | [autonomous-mode.md](user/features/autonomous-mode.md) (flags, `--fast`, lượt chat) |
| Checkpoint Recovery | [checkpoint-recovery.md](user/features/checkpoint-recovery.md) |
| Debug Mode | [debug-mode.md](user/features/debug-mode.md) |

---

### API & machine interface

| Document | Description |
|----------|-------------|
| [API index](api/README.md) | ViePilot has no REST stack; links to CLI/file model |
| [REST / CLI model](api/rest-api.md) | Framework integration surface |
| [GraphQL](api/graphql-schema.md) | N/A for this repo |
| [Kafka](api/kafka-events.md) | N/A for this repo |
| [WebSocket](api/websocket-api.md) | N/A for this repo |

---

### Developer Guide

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Installation and first steps |
| [Getting Started (dev entry)](dev/getting-started.md) | Short link into dev guide |
| [CLI Reference](dev/cli-reference.md) | All 13 `vp-tools` commands with examples |
| [Architecture](dev/architecture.md) | System layers, data flow, design decisions |
| [Contributing](dev/contributing.md) | How to add skills, workflows, CLI commands |
| [Testing](dev/testing.md) | Test structure, running tests, writing new tests |
| [Deployment](dev/deployment.md) | Distribution, versioning, CI/CD |

---

### Skills Reference

| Document | Description |
|----------|-------------|
| [Skills Reference](skills-reference.md) | All 13 skills with flags and examples |
| [Advanced Usage](advanced-usage.md) | Power user features and patterns |

---

### Examples

| Example | Stack | Description |
|---------|-------|-------------|
| [web-app](../examples/web-app/) | Next.js, SQLite | Todo web application |
| [api-service](../examples/api-service/) | Express, PostgreSQL, JWT | REST API with auth |
| [cli-tool](../examples/cli-tool/) | Node.js (no deps) | CLI application |

---

### Video Tutorials

| Video | Duration | Description |
|-------|----------|-------------|
| [01 — Installation](videos/01-installation.md) | 5 min | Install ViePilot and first run |
| [02 — First Project](videos/02-first-project.md) | 8 min | Build a REST API end-to-end |
| [03 — Autonomous Mode](videos/03-autonomous-mode.md) | 7 min | Control points, rollback, debug |

---

### Reference

| Document | Description |
|----------|-------------|
| [Troubleshooting](troubleshooting.md) | 15+ common issues with solutions |
| [CHANGELOG](../CHANGELOG.md) | Version history |
| [CONTRIBUTING](../CONTRIBUTING.md) | Contribution guidelines |

---

## Skills Quick Reference

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/vp-brainstorm` | "brainstorm", "ý tưởng" | Gather requirements |
| `/vp-crystallize` | "crystallize", "tạo artifacts" | Generate project structure |
| `/vp-auto` | "auto", "vibe", "chạy tự động" | Autonomous execution |
| `/vp-pause` | "pause", "dừng" | Save state and pause |
| `/vp-resume` | "resume", "tiếp tục" | Restore and continue |
| `/vp-status` | "status", "tiến độ" | Progress dashboard |
| `/vp-request` | "request", "feature", "bug" | Add feature/bug |
| `/vp-evolve` | "evolve", "milestone mới" | New milestone |
| `/vp-docs` | "docs", "documentation" | Generate docs |
| `/vp-task` | "task", "manual" | Manual task control |
| `/vp-debug` | "debug", "investigate" | Debug issues |
| `/vp-rollback` | "rollback", "revert" | Checkpoint recovery |
| `/vp-audit` | "audit", "kiểm tra" | Documentation sync |

---

*Last updated: 2026-03-31 — ViePilot framework v0.8.1 (see `.viepilot/TRACKER.md`); `/vp-auto` flags & chat behavior clarified in user + troubleshooting docs.*
