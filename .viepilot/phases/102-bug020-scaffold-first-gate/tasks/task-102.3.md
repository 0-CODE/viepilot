# Task 102.3 — Tests + CHANGELOG [2.37.0] + Version Bump

## Objective
Write tests verifying the scaffold-first gate is present in autonomous.md with correct content. Update CHANGELOG and bump to 2.37.0.

## Paths
- `tests/unit/phase102-bug020-scaffold-first.test.js`
- `CHANGELOG.md`
- `package.json`

## File-Level Plan

### tests/unit/phase102-bug020-scaffold-first.test.js
Read `workflows/autonomous.md` and assert:

1. Contains `Scaffold-First Gate (BUG-020)` section header
2. Contains `init_command:` field reference
3. Contains `marker_file:` field reference (or `marker file`)
4. Contains laravel scaffold command (`composer create-project`)
5. Contains nextjs scaffold command (`create-next-app`)
6. Contains nestjs scaffold command (`@nestjs/cli`)
7. Contains rails scaffold command (`rails new`)
8. Contains django scaffold command (`django-admin startproject`)
9. Contains spring-boot entry
10. Contains never-handcraft block list (`artisan`)
11. Contains `manage.py` in block list
12. Contains `next.config` in block list
13. Contains `nest-cli.json` in block list
14. Contains `⛔` stop signal for block list violation

Read `docs/user/features/scaffold-first.md` and assert:
15. File exists
16. Contains `## Scaffold` section header  
17. Contains `init_command:` field example
18. Contains `marker_file:` field example

### CHANGELOG.md
Add `[2.37.0]` section:
```markdown
## [2.37.0] - 2026-04-22

### Fixed
- **BUG-020** — `vp-auto` scaffold-first gate: when a project setup task is detected for a framework stack (Laravel, Next.js, NestJS, Rails, Django, Spring Boot, etc.), vp-auto now MUST run the canonical scaffold command (e.g. `composer create-project laravel/laravel`) before creating any files. A never-handcraft block list prevents manual creation of framework-native files (artisan, manage.py, next.config.*, nest-cli.json, pom.xml, etc.) without prior scaffold. Stack `SUMMARY.md` files support an optional `## Scaffold` section with `init_command:` and `marker_file:` fields for override. Built-in heuristic table covers 10 major framework stacks.

### Added
- `docs/user/features/scaffold-first.md` — scaffold-first convention documentation and stack configuration guide
- `## Scaffold` sections added to 7 installed framework stack SUMMARY.md files (laravel, laravel-php84, nextjs, nextjs-tailwind-shadcn-threejs, nestjs, spring-boot, spring-boot-3.4)
```

### package.json
`"version": "2.36.1"` → `"version": "2.37.0"`

## Acceptance Criteria
- [ ] `npm test` all pass (18 new tests in phase102 file)
- [ ] `package.json` version = "2.37.0"
- [ ] CHANGELOG has [2.37.0] BUG-020 entry
