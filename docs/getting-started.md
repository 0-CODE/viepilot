# Getting Started with ViePilot

## Overview

ViePilot là một framework giúp bạn phát triển dự án với AI một cách có hệ thống và kiểm soát.

## Workflow Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│ /brainstorm │ ──► │ /crystallize │ ──► │ /vp-auto │
└─────────────┘     └──────────────┘     └──────────┘
      │                    │                   │
      ▼                    ▼                   ▼
  Ideas &              Artifacts            Working
  Decisions            & Roadmap             Code
```

## Step 1: Install ViePilot

```bash
# Clone repository
git clone https://github.com/your-org/viepilot.git

# Run installation
cd viepilot
./install.sh
```

## Step 2: Brainstorm Your Project

Start a new project by brainstorming:

```
/vp-brainstorm
```

The AI will guide you through:
- Project goals and requirements
- Architecture decisions
- Technology choices
- Feature breakdown

Sessions are saved to `docs/brainstorm/session-*.md`

## Step 3: Crystallize into Artifacts

Transform your brainstorm into actionable artifacts:

```
/vp-crystallize
```

You'll be asked for project metadata:
- Project name and description
- Organization info
- Package Base ID (e.g., `com.company.project`)
- Lead developer info
- License choice

This creates:
```
.viepilot/
├── AI-GUIDE.md         # Navigation for AI
├── PROJECT-META.md     # Project metadata
├── ARCHITECTURE.md     # System design
├── PROJECT-CONTEXT.md  # Domain knowledge
├── SYSTEM-RULES.md     # Coding standards
├── ROADMAP.md          # Development plan
├── TRACKER.md          # Progress tracking
└── phases/             # Phase directories
```

## Step 4: Autonomous Development

Start autonomous coding:

```
/vp-auto
```

The AI will:
1. Pick up the first/next task
2. Load relevant context
3. Implement according to specs
4. Verify against acceptance criteria
5. Commit with proper format
6. Move to next task

### Control Points

The AI pauses for your input when:
- Conflicts detected with existing code
- Quality gate failures
- User decision needed
- Blockers encountered

## Step 5: Pause and Resume

Need to stop? Save your state:

```
/vp-pause
```

Later, continue seamlessly:

```
/vp-resume
```

All context is preserved in `HANDOFF.json` and `.continue-here.md`.

## Step 6: Check Progress

View dashboard anytime:

```
/vp-status
```

## Step 7: Evolve Your Project

Add features or start new milestone:

```
/vp-evolve
```

Options:
1. Add Feature - New feature to current milestone
2. New Milestone - Archive current, start fresh
3. Refactor - Improve existing code

## Step 8: Generate Documentation

Create comprehensive docs:

```
/vp-docs
```

Generates API docs, developer guide, user guide.

## Quick Reference

| Command | Description |
|---------|-------------|
| `/vp-brainstorm` | Start brainstorm session |
| `/vp-crystallize` | Create project artifacts |
| `/vp-auto` | Run autonomous development |
| `/vp-pause` | Save state and pause |
| `/vp-resume` | Continue from pause |
| `/vp-status` | View progress dashboard |
| `/vp-evolve` | Add features/milestone |
| `/vp-docs` | Generate documentation |
| `/vp-task` | Manual task management |

## Next Steps

- Read [Skills Reference](skills-reference.md) for detailed command options
- Read [Workflows Guide](workflows-guide.md) for customization
- Read [Templates Guide](templates-guide.md) for template modification
