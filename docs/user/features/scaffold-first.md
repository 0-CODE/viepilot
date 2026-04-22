# Scaffold-First Gate (BUG-020)

`vp-auto` enforces a **scaffold-first** rule for framework-based projects: when a task initializes a new project, the canonical scaffold command MUST run before any framework-generated files are created manually.

## How It Works

1. **Detection** — vp-auto detects "project setup" tasks by keywords in the task title/objective: "set up", "initialize", "create project", "scaffold", "bootstrap", "new project"
2. **Marker check** — checks for a framework marker file (e.g. `artisan` for Laravel, `manage.py` for Django) to determine if the project is already scaffolded
3. **Scaffold command** — if not yet scaffolded, runs the scaffold command from either:
   - `~/.viepilot/stacks/{stack}/SUMMARY.md` → `## Scaffold` → `init_command:` field (takes priority)
   - The built-in heuristic table in `workflows/autonomous.md`
4. **Block list** — refuses to create framework-native files (artisan, next.config.*, manage.py, nest-cli.json, pom.xml, etc.) without prior scaffold

## Adding a Scaffold Command to a Stack

In `~/.viepilot/stacks/{your-stack}/SUMMARY.md`, append:

```markdown
## Scaffold

init_command: composer create-project laravel/laravel {name}
marker_file: artisan
```

Replace `{name}` with the project directory name placeholder — vp-auto substitutes the actual project name at runtime.

## Built-in Supported Stacks

| Stack | Scaffold command | Marker file |
|-------|-----------------|-------------|
| laravel | `composer create-project laravel/laravel {name}` | `artisan` |
| laravel-php84 | `composer create-project laravel/laravel:^11 {name}` | `artisan` |
| nextjs | `npx create-next-app@latest {name}` | `next.config.js` |
| nextjs-tailwind-shadcn-threejs | `npx create-next-app@latest {name} --typescript --tailwind --eslint --app` | `next.config.js` |
| nestjs | `npx @nestjs/cli new {name}` | `nest-cli.json` |
| rails | `rails new {name}` | `config/application.rb` |
| django | `django-admin startproject {name} .` | `manage.py` |
| spring-boot* | `spring init --dependencies=web,data-jpa,validation {name}` | `pom.xml` |
| nuxt / vuejs* | `npx nuxi@latest init {name}` | `nuxt.config.ts` |
| react | `npx create-react-app {name}` | `src/index.js` |
| electron | `npx create-electron-app {name}` | `electron-builder.yml` |

## Never-Handcraft Block List

The following files must never be created manually in a project setup task without first running the scaffold command:

- `artisan`, `composer.json` (Laravel)
- `next.config.js`, `next.config.ts`, `pages/_app.*`, `app/layout.*` (Next.js)
- `nest-cli.json`, `src/main.ts` + `tsconfig.json` combo (NestJS)
- `manage.py`, `wsgi.py`, `asgi.py` (Django)
- `config/application.rb`, `config/routes.rb`, `Gemfile` (Rails)
- `pom.xml` or `build.gradle` with Spring Boot starters

## Bypassing the Gate

To override the gate (e.g. the project is already partially set up), add to the task file under `## Implementation Notes`:

```
scaffold_gate_waiver: project already scaffolded — artisan exists at {path}
```

Or at execution time, select "confirm project already scaffolded" at the control-point prompt.
