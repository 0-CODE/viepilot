# Phase 102 Spec — BUG-020: vp-auto Scaffold-First Gate

## Goal
Prevent `vp-auto` from handcrafting framework-generated files. When a task is detected as a "project setup / init" task for a known framework stack, the agent MUST run the canonical scaffold command first before creating any files that the scaffold would generate.

## Root Cause
`workflows/autonomous.md` Stack Preflight reads SUMMARY.md for best practices, but:
1. No "scaffold-first" enforcement gate exists
2. SUMMARY.md files have no `init_command` / `scaffold_command` field
3. No heuristic block list of files that must not be handcrafted (composer.json, artisan, manage.py, etc.)

## Solution Design
Two-layer approach:

**Layer 1 — Workflow gate (autonomous.md)**
Add `#### Scaffold-First Gate (BUG-020)` section after Stack Preflight:
- Triggers when: task is a project setup/init task (keyword detection) AND stack is a known framework
- Checks: `## Scaffold` → `init_command:` in SUMMARY.md (optional override)
- Fallback: built-in heuristic table (laravel→`composer create-project`, nextjs→`npx create-next-app`, etc.)
- Enforcement: NEVER create files from block list (composer.json, artisan, manage.py, Gemfile, etc.) without scaffold having run first
- Project-already-scaffolded detection: check for framework marker file presence

**Layer 2 — Stack metadata convention**
Add `## Scaffold` section to installed `~/.viepilot/stacks/{stack}/SUMMARY.md` files for major frameworks + document convention in `docs/user/features/scaffold-first.md`

## Scope
- `workflows/autonomous.md` — scaffold-first gate section
- `docs/user/features/scaffold-first.md` — convention documentation (new file, in repo)
- `~/.viepilot/stacks/{laravel,laravel-php84,nextjs,nextjs-tailwind-shadcn-threejs,nestjs,spring-boot,spring-boot-3.4}/SUMMARY.md` — append `## Scaffold` section (runtime update, absolute paths — not in task ## Paths block)
- Tests + CHANGELOG [2.37.0] + version bump

## Version
Minor bump: 2.36.1 → 2.37.0 (new enforcement behavior)

## Tasks
- 102.1: Scaffold-first gate in workflows/autonomous.md
- 102.2: Convention doc (docs/user/features/scaffold-first.md) + key stack SUMMARY.md updates
- 102.3: Tests + CHANGELOG [2.37.0] + version bump
