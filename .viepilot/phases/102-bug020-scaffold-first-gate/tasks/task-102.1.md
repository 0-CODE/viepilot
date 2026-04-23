# Task 102.1 — Add Scaffold-First Gate to workflows/autonomous.md

## Objective
Add a `#### Scaffold-First Gate (BUG-020)` section to `workflows/autonomous.md` immediately after the Stack Preflight section. This gate prevents vp-auto from handcrafting files that a framework scaffold command would generate.

## Paths
- `workflows/autonomous.md`

## File-Level Plan

### workflows/autonomous.md

Insert a new sub-section `#### Scaffold-First Gate (BUG-020)` **after** the "Stack Preflight" section (after the `ANTI-PATTERNS.md` line, before "Task start checkpoint").

The gate content:

```markdown
#### Scaffold-First Gate (BUG-020)

When the stack preflight identifies a **framework stack** AND the current task is a
**project setup / init task** (keywords in title or objective: "set up", "initialize",
"create project", "scaffold", "bootstrap", "new project", "install Laravel/Next/Nest/Rails/Django"):

1. **Check for existing scaffold** — look for a framework marker file in the project root:
   | Framework | Marker file |
   |-----------|-------------|
   | Laravel   | `artisan` |
   | Next.js   | `next.config.*` |
   | NestJS    | `nest-cli.json` |
   | Rails     | `config/application.rb` |
   | Django    | `manage.py` |
   | Spring Boot | `pom.xml` or `build.gradle` |
   | Vue / Nuxt | `nuxt.config.*` |

2. **If marker NOT found** (fresh project):
   a. Read `## Scaffold` → `init_command:` from `~/.viepilot/stacks/{stack}/SUMMARY.md` (optional field)
   b. If not in SUMMARY.md, use the built-in heuristic table:
      | Stack | Scaffold command |
      |-------|-----------------|
      | laravel / laravel-php84 | `composer create-project laravel/laravel {name}` |
      | nextjs / nextjs-* | `npx create-next-app@latest {name}` |
      | nestjs | `npx @nestjs/cli new {name}` |
      | rails | `rails new {name}` |
      | django | `django-admin startproject {name} .` |
      | spring-boot* | Use Spring Initializr or `spring init --dependencies=web,data-jpa {name}` |
      | nuxt / vuejs* | `npx nuxi@latest init {name}` |
      | react | `npx create-react-app {name}` |
      | electron | `npx create-electron-app {name}` |
   c. **Run the scaffold command** — stop and fail the task if it exits non-zero
   d. After scaffold: continue with configuration/customization tasks normally

3. **If marker IS found** (project already scaffolded): skip scaffold, proceed normally

4. **Never-handcraft block list** — NEVER create these files from scratch in a setup task without prior scaffold:
   - `artisan`, `composer.json` (in Laravel context)
   - `next.config.js/ts`, `pages/_app.*`, `app/layout.*`
   - `nest-cli.json`, `tsconfig.json` + `src/main.ts` combo
   - `manage.py`, `wsgi.py`, `asgi.py`
   - `config/application.rb`, `config/routes.rb`, `Gemfile`
   - `pom.xml` or `build.gradle` with Spring Boot starters

   If the task file's `## Paths` block contains one of these paths and no scaffold has run:
   → **Stop** with error: "⛔ Scaffold-First Gate: run scaffold command before creating {file}. See BUG-020."
   → Offer user: (a) run scaffold then retry, (b) confirm project is already scaffolded, (c) skip gate with explicit reason
```

## Acceptance Criteria
- [ ] `workflows/autonomous.md` contains `#### Scaffold-First Gate (BUG-020)` section
- [ ] Section includes the built-in heuristic table with ≥6 framework entries
- [ ] Section includes the never-handcraft block list
- [ ] Section references `## Scaffold` → `init_command:` field in SUMMARY.md
- [ ] Section is positioned after Stack Preflight and before Task start checkpoint

## Implementation Notes
Find the exact insertion point by locating:
```
If stack cache is missing:
- warn and optionally run quick research
- then continue with explicit assumptions noted in task logs
```
Insert the scaffold-first gate section AFTER this block and BEFORE the line starting with `#### Task start checkpoint`.
