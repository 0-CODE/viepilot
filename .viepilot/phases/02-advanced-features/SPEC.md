# Phase 2: Advanced Features

## Overview
- **Phase**: 2
- **Name**: Advanced Features
- **Goal**: Thêm các tính năng nâng cao cho power users
- **Dependencies**: Phase 1
- **Status**: Not Started

## Scope

### In Scope
- vp-debug skill for systematic debugging
- vp-rollback skill for checkpoint recovery
- Parallel task execution
- Conflict detection and warnings
- Progress persistence for interruption recovery

### Out of Scope
- Multi-model AI support (M3)
- Team collaboration (M2)
- External service integrations

## Requirements

### Functional
1. **FR-2.1**: Debug skill tracks state across sessions
2. **FR-2.2**: Rollback recovers to any checkpoint cleanly
3. **FR-2.3**: Independent tasks can run in parallel
4. **FR-2.4**: Detect file conflicts before they occur
5. **FR-2.5**: Resume exactly from interruption point

### Non-Functional
1. **NFR-2.1**: Rollback completes < 5 seconds
2. **NFR-2.2**: Parallel execution improves performance > 30%
3. **NFR-2.3**: State files < 100KB

## Tasks

| ID | Task | Description | Complexity |
|----|------|-------------|------------|
| 2.1 | vp-debug Skill | Systematic debugging with state tracking | L |
| 2.2 | vp-rollback Skill | Rollback to any checkpoint safely | M |
| 2.3 | Parallel Execution | Execute independent tasks in parallel | L |
| 2.4 | Conflict Detection | Detect and warn about potential conflicts | M |
| 2.5 | Progress Persistence | Resume exactly from interruption point | M |

## Acceptance Criteria

- [ ] vp-debug creates debug sessions and tracks state
- [ ] vp-rollback recovers to checkpoints without data loss
- [ ] Parallel execution works for independent tasks
- [ ] Conflicts detected before execution
- [ ] Interruption recovery is seamless

## Technical Notes

### vp-debug
- Create `skills/vp-debug/SKILL.md`
- Create `workflows/debug.md`
- Store debug state in `.viepilot/debug/`

### vp-rollback
- Use git tags for checkpoints
- Validate state before rollback
- Backup current state before rollback

### Parallel Execution
- Detect task dependencies from ROADMAP
- Use Promise.all for parallel tasks
- Merge results correctly
