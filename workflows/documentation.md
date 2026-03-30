<purpose>
Generate comprehensive documentation từ code và artifacts.
</purpose>

<process>

<step name="ask_scope">
## 1. Ask Documentation Scope

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► DOCS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Which documentation would you like to generate?

1. All - Generate complete documentation
2. API - REST, GraphQL, Kafka, WebSocket docs
3. Developer Guide - Setup, architecture, contributing
4. User Guide - Quick start, feature guides
5. Changelog - Update from git history
```
</step>

<step name="api_docs">
## 2A. API Documentation

### Sources
```bash
# Find API-related files
find src -name "*Controller*.java" -o -name "*Resolver*.java"
find src -name "*Consumer*.java" -o -name "*Producer*.java"
cat .viepilot/schemas/api-contracts.yaml
cat .viepilot/schemas/kafka-topics.yaml
```

### Generate docs/api/rest-api.md
```markdown
# REST API Reference

## Authentication
{from SYSTEM-RULES or code}

## Endpoints

### {Resource}

#### GET /api/v1/{resource}
**Description**: {description}

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ... | ... | ... | ... |

**Response**:
```json
{
  "data": [...],
  "meta": {...}
}
```

**Errors**:
| Code | Description |
|------|-------------|
| 400 | ... |
| 404 | ... |
```

### Generate docs/api/graphql-schema.md
```markdown
# GraphQL Schema

## Types

### {TypeName}
```graphql
type TypeName {
  field: Type
}
```

## Queries
{list queries with descriptions}

## Mutations
{list mutations with descriptions}

## Subscriptions
{list subscriptions with descriptions}
```

### Generate docs/api/kafka-events.md
```markdown
# Kafka Events

## Topics

### {topic.name}
**Description**: {description}
**Key**: {key format}
**Partitions**: {count}

**Message Schema**:
```json
{
  "field": "type"
}
```

**Producers**: {services that produce}
**Consumers**: {services that consume}
```

### Generate docs/api/websocket-api.md
```markdown
# WebSocket API

## Connection
**URL**: `wss://{host}/ws`
**Authentication**: {method}

## Events

### Server → Client
| Event | Description | Payload |
|-------|-------------|---------|
| ... | ... | ... |

### Client → Server
| Event | Description | Payload |
|-------|-------------|---------|
| ... | ... | ... |
```
</step>

<step name="dev_docs">
## 2B. Developer Guide

### Generate docs/dev/getting-started.md
```markdown
# Getting Started

## Prerequisites
- {requirement 1}
- {requirement 2}

## Installation

### Clone Repository
```bash
git clone {repo_url}
cd {project_name}
```

### Setup Environment
{from docker-compose or setup scripts}

### Build
```bash
{build command}
```

### Run
```bash
{run command}
```

## Verify Installation
{verification steps}

## Common Issues
{from known issues or FAQ}
```

### Generate docs/dev/architecture.md
Copy and enhance from `.viepilot/ARCHITECTURE.md`:
- Add diagrams
- Add more context
- Add examples

### Generate docs/dev/contributing.md
```markdown
# Contributing Guide

## Development Workflow
1. Fork repository
2. Create branch
3. Make changes
4. Write tests
5. Submit PR

## Code Standards
{from SYSTEM-RULES.md}

## Commit Messages
{Conventional Commits format}

## Pull Request Process
{process description}

## Testing
{testing requirements}
```

### Generate docs/dev/testing.md
```markdown
# Testing Guide

## Test Structure
```
src/test/
├── unit/
├── integration/
└── e2e/
```

## Running Tests
```bash
{test commands}
```

## Writing Tests
{guidelines}

## Coverage
{requirements}
```

### Generate docs/dev/deployment.md
```markdown
# Deployment Guide

## Environments
| Env | URL | Purpose |
|-----|-----|---------|
| dev | ... | ... |
| staging | ... | ... |
| prod | ... | ... |

## Deployment Process
{steps}

## Configuration
{config management}

## Monitoring
{monitoring setup}
```
</step>

<step name="user_docs">
## 2C. User Guide

### Generate docs/user/quick-start.md
```markdown
# Quick Start Guide

## What is {Project Name}?
{brief description}

## Getting Started

### Step 1: {First Step}
{instructions}

### Step 2: {Second Step}
{instructions}

## Basic Usage
{common tasks}

## Next Steps
- [Feature Guide](features/)
- [FAQ](faq.md)
```

### Generate docs/user/features/
For each major feature:
```markdown
# {Feature Name}

## Overview
{description}

## How to Use

### {Task 1}
{step-by-step instructions}

### {Task 2}
{step-by-step instructions}

## Tips
{helpful tips}

## Troubleshooting
{common issues}
```

### Generate docs/user/faq.md
```markdown
# Frequently Asked Questions

## General

### Q: {Question}?
A: {Answer}

## Technical

### Q: {Question}?
A: {Answer}
```
</step>

<step name="changelog">
## 2D. Changelog Update

### Gather Changes
```bash
# Get commits since last version
git log --oneline v{last_version}..HEAD
```

### Parse Commits
Group by type:
- `feat:` → Added
- `fix:` → Fixed
- `BREAKING CHANGE:` → Changed
- `deprecate:` → Deprecated
- `remove:` → Removed
- `security:` → Security

### Update CHANGELOG.md
```markdown
## [Unreleased]

### Added
- {feat commit description} ([{short_hash}]({commit_url}))

### Changed
- {change description}

### Fixed
- {fix commit description} ([{short_hash}]({commit_url}))
```
</step>

<step name="create_index">
## 3. Create Index

Update docs/README.md:
```markdown
# {Project Name} Documentation

## Quick Links
- [Quick Start](user/quick-start.md)
- [API Reference](api/rest-api.md)
- [Developer Guide](dev/getting-started.md)

## Documentation Index

### API Documentation
- [REST API](api/rest-api.md)
- [GraphQL Schema](api/graphql-schema.md)
- [Kafka Events](api/kafka-events.md)
- [WebSocket API](api/websocket-api.md)

### Developer Guide
- [Getting Started](dev/getting-started.md)
- [Architecture](dev/architecture.md)
- [Contributing](dev/contributing.md)
- [Testing](dev/testing.md)
- [Deployment](dev/deployment.md)

### User Guide
- [Quick Start](user/quick-start.md)
- [Features](user/features/)
- [FAQ](user/faq.md)

---
Last updated: {date}
```
</step>

<step name="commit">
## 4. Commit

```bash
git add docs/ CHANGELOG.md
git commit -m "docs: update documentation

- API documentation
- Developer guide
- User guide
- Changelog update"
```
</step>

<step name="confirm">
## 5. Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► DOCS COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Documentation generated:

 docs/
 ├── api/ ({count} files)
 │   ├── rest-api.md
 │   ├── graphql-schema.md
 │   ├── kafka-events.md
 │   └── websocket-api.md
 │
 ├── dev/ ({count} files)
 │   ├── getting-started.md
 │   ├── architecture.md
 │   ├── contributing.md
 │   ├── testing.md
 │   └── deployment.md
 │
 ├── user/ ({count} files)
 │   ├── quick-start.md
 │   ├── features/
 │   └── faq.md
 │
 └── README.md (index)

 CHANGELOG.md updated

 View documentation: docs/README.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

</process>

<success_criteria>
- [ ] Requested documentation generated
- [ ] Code examples included
- [ ] Cross-references added
- [ ] Index updated
- [ ] Changelog reflects changes
- [ ] Git committed
</success_criteria>
