# Task 102.2 — Convention Doc + Key Stack SUMMARY.md Updates

## Objective
(a) Create `docs/user/features/scaffold-first.md` documenting the `## Scaffold` convention for stack SUMMARY.md files.
(b) Append `## Scaffold` sections with `init_command:` to the key installed framework stacks at `~/.viepilot/stacks/`.

## Paths
- `docs/user/features/scaffold-first.md`

Note: The `~/.viepilot/stacks/*/SUMMARY.md` edits use absolute paths and are executed directly during implementation — they are NOT listed in this ## Paths block (BUG-009 repo-relative rule applies only to shipped files). These edits update the user's local stack cache, not the viepilot repo.

## File-Level Plan

### docs/user/features/scaffold-first.md (new file)

```markdown
# Scaffold-First Gate (BUG-020)

vp-auto enforces a **scaffold-first** rule for framework-based projects: when a task initializes a new project, the canonical scaffold command MUST run before any framework-generated files are created manually.

## How It Works

1. **Detection** — vp-auto detects "project setup" tasks by keywords in the task title/objective
2. **Marker check** — checks for a framework marker file (e.g. `artisan` for Laravel, `manage.py` for Django) to determine if the project is already scaffolded
3. **Scaffold command** — if not yet scaffolded: runs the scaffold command from either:
   - Your stack's `~/.viepilot/stacks/{stack}/SUMMARY.md` → `## Scaffold` → `init_command:` field
   - The built-in heuristic table in `workflows/autonomous.md`
4. **Block list** — refuses to create framework-native files (artisan, next.config.*, manage.py, etc.) without prior scaffold

## Adding Scaffold Command to a Stack

In `~/.viepilot/stacks/{your-stack}/SUMMARY.md`, append:

```
## Scaffold

init_command: composer create-project laravel/laravel {name}
marker_file: artisan
```

## Supported Stacks (Built-in)

| Stack | Scaffold command | Marker |
|-------|-----------------|--------|
| laravel | `composer create-project laravel/laravel {name}` | `artisan` |
| laravel-php84 | `composer create-project laravel/laravel {name}` | `artisan` |
| nextjs | `npx create-next-app@latest {name}` | `next.config.*` |
| nestjs | `npx @nestjs/cli new {name}` | `nest-cli.json` |
| rails | `rails new {name}` | `config/application.rb` |
| django | `django-admin startproject {name} .` | `manage.py` |
| spring-boot* | `spring init --dependencies=web,data-jpa {name}` | `pom.xml` |
| nuxt / vuejs* | `npx nuxi@latest init {name}` | `nuxt.config.*` |
| react | `npx create-react-app {name}` | `src/index.*` |
| electron | `npx create-electron-app {name}` | `electron-builder.yml` |
```

### ~/.viepilot/stacks/* SUMMARY.md updates (runtime edits, 7 files)

Append the following `## Scaffold` block to each file:

**laravel:**
```
## Scaffold

init_command: composer create-project laravel/laravel {name}
marker_file: artisan
```

**laravel-php84:**
```
## Scaffold

init_command: composer create-project laravel/laravel:^11 {name}
marker_file: artisan
```

**nextjs:**
```
## Scaffold

init_command: npx create-next-app@latest {name}
marker_file: next.config.js
```

**nextjs-tailwind-shadcn-threejs:**
```
## Scaffold

init_command: npx create-next-app@latest {name} --typescript --tailwind --eslint --app
marker_file: next.config.js
```

**nestjs:**
```
## Scaffold

init_command: npx @nestjs/cli new {name}
marker_file: nest-cli.json
```

**spring-boot:**
```
## Scaffold

init_command: spring init --dependencies=web,data-jpa,validation {name}
marker_file: pom.xml
```

**spring-boot-3.4:**
```
## Scaffold

init_command: spring init --boot-version=3.4.0 --dependencies=web,data-jpa,validation {name}
marker_file: pom.xml
```

## Acceptance Criteria
- [ ] `docs/user/features/scaffold-first.md` created with convention + table
- [ ] All 7 stack SUMMARY.md files have `## Scaffold` section appended
- [ ] Each entry has `init_command:` and `marker_file:` fields
- [ ] No absolute paths in ## Paths block of this task file (BUG-009)
