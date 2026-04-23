# Phase 19 Specification — Installer UX + uninstall + symlink reliability (FEAT-005)

## Metadata
- **Phase**: 19
- **Milestone**: M1.15
- **Request**: FEAT-005
- **Priority**: high
- **Status**: planned

## Objective
Upgrade installer UX to modern keyboard-driven selection, fix symlink-based skill discovery issues, and add `npx viepilot uninstall` for full install lifecycle management.

## Scope
1. Replace numeric prompt UX with arrow-key + space selector (multi-select and radio modes).
2. Remove/fix symlink behavior that causes skills not being detected in target environments.
3. Add `uninstall` command to `viepilot` CLI with interactive + non-interactive mode.
4. Add installer/uninstaller verification checks and tests.
5. Update user docs and troubleshooting for new flow.

## Out of Scope
- Full TUI framework adoption with custom rendering themes.
- OS-specific package manager integration.

## Success Criteria
- [ ] Installer supports keyboard navigation and space-to-select flow.
- [ ] Symlink-related missing-skill regression is fixed.
- [ ] `npx viepilot uninstall` works with confirmation and `--yes`.
- [ ] Unit tests cover selector and uninstall flows.
- [ ] Docs reflect new install/uninstall UX.
