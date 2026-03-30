# FEAT: vp-audit skill + auto-hook for documentation sync

## Meta
- **ID**: FEAT-001
- **Type**: Feature
- **Status**: done
- **Priority**: high
- **Created**: 2026-03-30
- **Reporter**: User
- **Assignee**: AI

## Summary
Add `/vp-audit` skill to detect gaps between documentation and implementation, plus auto-hook in `/vp-auto` to run after each phase complete.

## Details

### Problem
Documentation drift - ARCHITECTURE.md, README.md không sync với code thực tế sau khi implement features. Phát hiện manual dễ bị miss.

### Solution
1. **Skill `/vp-audit`** - Manual audit anytime
2. **Auto-hook** - Run audit after phase complete in `/vp-auto`

### Audit Checks
| Check | Source | Target |
|-------|--------|--------|
| Skills count | `ls skills/` | ARCHITECTURE.md |
| Workflows count | `ls workflows/` | ARCHITECTURE.md |
| CLI commands | `vp-tools help` | ARCHITECTURE.md |
| Skill list | Directory names | ARCHITECTURE.md diagram |
| Workflow list | File names | ARCHITECTURE.md |

### Modes
- `--docs` : Check documentation only
- `--arch` : Check architecture only
- `--fix` : Auto-fix detected gaps
- `--report` : Generate report without fixing

## Acceptance Criteria
- [ ] vp-audit skill created
- [ ] audit workflow created
- [ ] Detects skill count mismatch
- [ ] Detects workflow count mismatch
- [ ] Detects CLI command mismatch
- [ ] Can auto-fix or report
- [ ] Hook suggestion in vp-auto workflow

## Related
- Phase: 2 (Advanced Features)
- Files: skills/vp-audit/, workflows/audit.md
- Dependencies: None

## Resolution
Implemented in commit a99b684:
- Created skills/vp-audit/SKILL.md
- Created workflows/audit.md
- Updated ARCHITECTURE.md (13 skills, 11 workflows)
- Auto-hook integration documented in skill file
