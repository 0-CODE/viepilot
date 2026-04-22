<purpose>
Convert brainstorm sessions into structured artifacts for autonomous AI execution.
</purpose>

## Adapter Compatibility

| Feature | Claude Code (terminal) | Cursor (Agent/Skills) | Codex CLI | Antigravity (native) |
|---------|----------------------|-----------------------|-----------|----------------------|
| Interactive prompts | ✅ `AskUserQuestion` tool — **REQUIRED** | ❌ text fallback | ❌ text fallback | ❌ text fallback |

**Claude Code (terminal):** Always call `AskUserQuestion` first. Only fall back to the plain-text menu below if the tool returns an error or is unavailable.
**Cursor / Codex CLI / Antigravity / other adapters:** `AskUserQuestion` not available — use text menus below.

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.


<process>

<step name="load_language_config">
## Step 0-A: Load Language Configuration (ENH-032)

Read `~/.viepilot/config.json` → set session variables:
- `DOCUMENT_LANG` — language for generated project files (default: `en`)
- `COMMUNICATION_LANG` — language for AI↔user messages (default: `en`)

Use `DOCUMENT_LANG` for all file content written in Steps 1–9.
Use `COMMUNICATION_LANG` for all prompts and confirmation messages in this session.

If `~/.viepilot/config.json` is absent, use defaults (en/en) — do not fail.
</step>

<step name="collect_metadata">
## Step 0: Collect Project Metadata

### ViePilot active profile (FEAT-009)

Normative: **`docs/dev/global-profiles.md`**. Binding: **`.viepilot/META.md`** (`viepilot_profile_id`, optional `viepilot_profile_path`).

**Before** the Basic Info question block:

1. If `.viepilot/META.md` exists, parse YAML frontmatter to extract `viepilot_profile_id` and optionally `viepilot_profile_path`.
2. **Resolve** the profile markdown file:
   - If `viepilot_profile_path` is set and the file exists (expand `~` / `$HOME`) → use that path.
   - Else if a valid `viepilot_profile_id` is present → `$HOME/.viepilot/profiles/<viepilot_profile_id>.md`.
3. **When the profile file is readable:**
   - Read frontmatter (`display_name`, `org_tag`, `website`, `tags`, …) and body (`## Organization`, `## Branding & voice`, `## Audience`, `## Legal & attribution`, `## Contact (public)`).
   - **Pre-fill** Step 0 questions (org, website, short description if matched) as a **proposal**; user must **confirm** or **edit**.
   - Record working note **`profile_resolved`**: `{ profile_id, absolute_path }` for use in later steps.
4. **When META is absent, id is missing, or file does not exist:**
   - Record **`profile_resolved: none`** and continue Step 0 as normal — do **not** fail crystallize.

Ask the user for project information:

### Basic Info
```
1. Project name?
   Default: (extract from brainstorm)
   
2. Short description (1-2 sentences)?
```

### Organization Info
```
3. Company/organization name?

4. Company website? (optional)
```

### Package Info
```
5. Package Base ID (Java package)?
   Example: com.acme.smarttrack
   Validation: ^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$
   
6. Maven Artifact ID?
   Default: {project-name-kebab-case}
   
7. Maven Group ID?
   Default: {package_base_id}
```

### Developer Info
```
8. Lead developer name?

9. Lead developer email?

10. Git remote host / username? (optional — e.g. github.com/johndoe, gitlab.com/org, bitbucket.org/team)
```

### Repository Info
```
11. Repository URL? (optional)

12. Issue Tracker URL?
    Default: {repository_url}/issues
```

### License & Year

> **Adapter-aware prompt (question 13):**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable. AUQ spec:
>   - question: "Which license for this project?"
>   - header: "License"
>   - options: [{ label: "MIT", description: "Permissive — most common open-source choice" }, { label: "Apache-2.0", description: "Permissive with patent grant — preferred for enterprise OSS" }, { label: "GPL-3.0", description: "Copyleft — derivative works must stay open-source" }, { label: "Proprietary", description: "All rights reserved — no public redistribution" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text list below

```
13. License?
    Options: MIT, Apache-2.0, GPL-3.0, BSD-3-Clause, Proprietary
    Default: MIT
    
14. Project start year?
    Default: {current_year}
```

Store all metadata for template generation.
</step>

<step name="brownfield_detection">
## Step 0-B: Brownfield Mode Detection (FEAT-018)

**Trigger brownfield mode when ANY of the following is true:**
- `--brownfield` flag passed explicitly, OR
- `docs/brainstorm/` directory does not exist or is empty (no `session-*.md` files) **AND** `.viepilot/` directory does not yet exist

**If NEITHER condition is met** (greenfield path): skip this entire step; proceed to Step 1.

**If brownfield triggered AND `.viepilot/` already exists:**
- Warn: "`.viepilot/` already exists. Re-running brownfield mode will overwrite artifacts."

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable. AUQ spec:
>   - question: "`.viepilot/` already exists. Re-running brownfield mode will overwrite artifacts. Continue?"
>   - header: "Overwrite?"
>   - options: [{ label: "Yes, continue", description: "Overwrite existing .viepilot/ artifacts with new scan results" }, { label: "No, abort", description: "Stop here — keep existing artifacts unchanged" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text prompt below
>
> Ask: "Continue? (y/n)" — abort if n.

**When brownfield mode is active:**
1. Run the full 12-category codebase scanner (Signal Categories 1–12 below).
2. Produce a structured **Scan Report** (see schema at end of this step).
3. Classify every field as DETECTED / ASSUMED / MISSING per Gap Detection Rules.
4. Present Scan Report summary to user; interactively fill every MISSING MUST-DETECT field.
5. User confirms ASSUMED fields (may accept all or override individually).
6. After confirmation: proceed to Step 0-C (brainstorm stub generation).
7. Then skip Step 1 (`analyze_brainstorm`); continue from Step 0 (metadata collection) → Step 2 onward using the confirmed Scan Report as input.

---

### Signal Category 1 — Build Manifest & Package Identity

Probe the following files in order of priority (first match per language wins):

| Language / Platform | Files to probe |
|---------------------|----------------|
| Node.js | `package.json` |
| Java / Maven | `pom.xml` |
| Java / Gradle | `build.gradle`, `build.gradle.kts`, `settings.gradle` |
| Python | `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements.txt`, `Pipfile` |
| Rust | `Cargo.toml` |
| Go | `go.mod` |
| PHP | `composer.json` |
| Ruby | `Gemfile`, `*.gemspec` |
| .NET | `*.csproj`, `*.sln`, `global.json` |
| Elixir / Erlang | `mix.exs` |
| Swift | `Package.swift` |

**Fields to extract per manifest:**
- `project_name` — package name / artifactId / module name
- `current_version` — version field
- `primary_language` — derived from manifest type
- `runtime_version` — engines/node, java.version, python_requires, go version
- `entry_points` — main, bin, spring-boot:run target, etc.
- `raw_dependencies[]` — full dependency list (used by Signal Category 2)
- `raw_dev_dependencies[]` — dev/test deps

**Monorepo detection** (check before single-manifest scan):
- npm workspaces: `package.json` → `"workspaces"` field + `packages/*/package.json`
- Nx / Turborepo: `nx.json`, `turbo.json` + `apps/*/` and `libs/*/`
- Maven multi-module: `pom.xml` with `<modules>`
- Gradle multi-project: `settings.gradle` with `include`
- Cargo workspace: `Cargo.toml` with `[workspace]`
- Go workspace: `go.work`

If monorepo detected → scan each module separately; aggregate into `modules[]` in Scan Report.

**Git Submodule Detection** (run after monorepo check):
- Check for `.gitmodules` file at repo root
- If present: parse all `[submodule "name"]` blocks → extract `name`, `path`, `url`
- For each submodule path:
  - If path exists on disk (initialized):
    - Run Signal Cat 1 (manifest scan) on `{path}/`
    - Run Signal Cat 2 (framework) on `{path}/`
    - Run Signal Cat 4 (DB signals) on `{path}/`
    - Record `initialized: true`
  - If path absent (not initialized):
    - Record `initialized: false`, `primary_language: MISSING`
    - Add open question: "Submodule '{name}' not initialized — run `git submodule update --init {path}` to scan it"
- Add each submodule to `modules[]` with `type: submodule`

> **SAFETY RULE**: Never run `git submodule update`, `git submodule init`, or any git network command during scan. Read the local filesystem only.

**Polyrepo / Multi-Repo Detection** (run after submodule check):

Scan the following signals to determine if this repo is part of a larger multi-repo system:

| Signal Source | Pattern | Interpretation |
|--------------|---------|----------------|
| `docker-compose.yml` / `docker-compose*.yml` | `build: ../path` or `context: ../path` (value starts with `../`) | Sibling repo used as build context |
| `docker-compose.yml` | Multiple services with external `image:` and no local `build:` | External microservices — possible sibling repos |
| `package.json` | `"dependencies"` or `"devDependencies"` value matching `"file:../..."` | Local `file:` sibling repo dependency |
| `.github/workflows/*.yml` / `.gitlab-ci.yml` / `ci/*.yml` | `git clone` steps, or `uses: org/other-repo/.github/workflows/` referencing a different repo | CI clones or calls a sibling repo |
| `README.md` / `CONTRIBUTING.md` | Lines containing a repo URL whose path differs from the current repo's remote | Related repo link in docs |
| `Makefile` / `justfile` | Targets containing `cd ../` followed by build/test commands | Cross-repo build orchestration |

For each match: record `{ source, hint, inferred_repo }` in `polyrepo_hints[]`.
Deduplicate by `inferred_repo` name.
If `polyrepo_hints` is empty → skip this section entirely (no empty array in clean single-repo Scan Reports).

**Interactive prompt** (fire when `polyrepo_hints` non-empty):

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable. AUQ spec:
>   - question: "Polyrepo signals detected — this repo may be part of a multi-repo system. Would you like to provide related repo URLs?"
>   - header: "Polyrepo?"
>   - options: [{ label: "Yes, I'll list them", description: "Provide sibling repo URLs — improves system-level context accuracy" }, { label: "Skip for now", description: "Continue without related repos — affected fields will be marked ASSUMED" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text prompt below

```
⚠️ Polyrepo signals detected:
  {list polyrepo_hints}

This repo appears to be part of a multi-repo system.
Would you like to list related repos? (optional — press Enter to skip)
Format: one URL per line, e.g. https://github.com/org/api-service [backend]
```
- User-supplied repos → stored in `related_repos[]` as `{ url, role }`
- If user skips → `related_repos: []`; system-level context fields set to **ASSUMED** tier

**Gap-fill rule for polyrepo:**
- `polyrepo_hints` non-empty AND `related_repos` empty → system-level fields (e.g. `deployment_topology`) = ASSUMED (not MISSING; single-repo scan is still valid)
- `related_repos` populated → system-level fields = DETECTED for user-supplied context

If no manifest found → `primary_language` = MISSING; user must provide.

---

### Signal Category 2 — Framework & Library Detection

Infer from `raw_dependencies[]` + `raw_dev_dependencies[]`:

**Backend frameworks:**
| Signal pattern | Framework |
|---------------|-----------|
| `spring-boot-starter-*` | Spring Boot |
| `express`, `fastify`, `koa`, `hapi` | Node.js HTTP |
| `nestjs/core` | NestJS |
| `fastapi`, `flask`, `django` | Python HTTP |
| `gin-gonic/gin`, `gofiber/fiber`, `labstack/echo` | Go HTTP |
| `rails`, `sinatra` | Ruby |
| `laravel/framework`, `slim/slim` | PHP |
| `actix-web`, `axum`, `rocket` | Rust HTTP |
| `phoenix` (mix.exs) | Elixir |
| `Microsoft.AspNetCore.*` | .NET ASP.NET Core |

**Frontend frameworks:**
| Signal pattern | Framework |
|---------------|-----------|
| `react`, `react-dom` | React |
| `vue` | Vue.js |
| `@angular/core` | Angular |
| `svelte` | Svelte |
| `next` | Next.js |
| `nuxt` | Nuxt.js |
| `remix` | Remix |
| `astro` | Astro |
| `solid-js` | SolidJS |

**ORM / Database clients:**
| Signal pattern | ORM / DB |
|---------------|----------|
| `mybatis-spring-boot-starter`, `mybatis` | MyBatis |
| `spring-boot-starter-data-jpa`, `hibernate-*` | Hibernate / JPA |
| `typeorm` | TypeORM |
| `prisma` | Prisma |
| `sequelize` | Sequelize |
| `sqlalchemy`, `alembic` | SQLAlchemy |
| `gorm.io/gorm` | GORM |
| `mongoose` | Mongoose (MongoDB) |
| `pg`, `mysql2`, `mariadb`, `better-sqlite3` | Raw SQL clients |
| `redis`, `ioredis` | Redis client |

**Message broker clients:**
| Signal pattern | Broker |
|---------------|--------|
| `spring-kafka`, `kafka-clients` | Apache Kafka |
| `amqplib`, `spring-rabbit` | RabbitMQ |
| `@aws-sdk/client-sqs` | AWS SQS |
| `nats` | NATS |
| `bullmq`, `bull` | Redis-based queue |

**Auth libraries:**
| Signal pattern | Auth mechanism |
|---------------|----------------|
| `spring-security`, `spring-boot-starter-security` | Spring Security |
| `jsonwebtoken`, `jose`, `passport-jwt` | JWT |
| `passport` | OAuth / multi-strategy |
| `keycloak-*`, `keycloak-connect` | Keycloak |
| `next-auth`, `@auth/core` | NextAuth |
| `authlib`, `python-jose`, `djangorestframework-simplejwt` | Python auth |

**Test frameworks:**
| Signal pattern | Framework |
|---------------|-----------|
| `jest`, `@jest/core` | Jest |
| `vitest` | Vitest |
| `mocha` | Mocha |
| `jasmine` | Jasmine |
| `junit`, `spring-boot-starter-test` | JUnit |
| `pytest` | pytest |
| `rspec-rails`, `rspec` | RSpec |
| `cypress` | Cypress E2E |
| `playwright` | Playwright E2E |
| `@testing-library/*` | Testing Library |
| `testify` | Testify (Go) |

Rule: If zero backend AND zero frontend frameworks detected → add entry to `open_questions[]` and ask user.

---

### Signal Category 3 — Architecture Layer Inference (Directory Structure)

Glob the following path patterns; presence implies the corresponding layer:

| Pattern(s) | Inferred layer |
|------------|----------------|
| `src/main/java/**`, `src/main/kotlin/**` | Java/Kotlin Maven standard layout |
| `src/controllers/`, `app/controllers/`, `**/controller/**` | MVC — Controller layer |
| `src/api/`, `api/`, `routes/`, `src/routes/` | API / Router layer |
| `src/services/`, `services/`, `**/service/**` | Service / Business logic layer |
| `src/repositories/`, `repositories/`, `**/repository/**`, `**/dao/**` | Repository / DAO layer |
| `src/models/`, `models/`, `**/model/**`, `**/entity/**` | Domain models / Entities |
| `src/middleware/`, `middleware/` | Middleware layer |
| `src/utils/`, `utils/`, `helpers/`, `common/` | Utilities / Shared |
| `frontend/`, `client/`, `web/`, `src/client/` | Frontend module |
| `backend/`, `server/`, `src/server/` | Backend module |
| `packages/`, `apps/`, `libs/` | Monorepo layout |
| `infrastructure/`, `infra/`, `terraform/`, `helm/`, `k8s/`, `kubernetes/` | Infrastructure / IaC |
| `scripts/`, `bin/`, `tools/` | Developer tooling |
| `public/`, `static/`, `assets/` | Static assets |
| `docs/`, `documentation/` | Documentation |
| `config/`, `configs/`, `settings/` | Configuration |
| `tests/`, `test/`, `__tests__/`, `spec/`, `e2e/` | Test suite root |
| `migrations/`, `db/migrate/`, `alembic/` | Database migrations |

Output: `architecture_layers[]` — each with `{ layer, evidence_path }`.

---

### Signal Category 4 — Database Schema Signals

Probe for migration/schema evidence:

| Pattern | Evidence type |
|---------|---------------|
| `db/migrate/*.rb` | Rails ActiveRecord migrations |
| `migrations/*.sql`, `migrations/*.js`, `migrations/*.ts` | Generic migrations |
| `src/main/resources/db/migration/V*.sql` | Flyway |
| `db/changelog*.xml`, `db/changelog*.yaml` | Liquibase |
| `alembic/versions/*.py` | SQLAlchemy Alembic |
| `src/migrations/**` | TypeORM / Sequelize migrations |
| `prisma/schema.prisma` | Prisma schema |
| `**/schema.sql`, `**/init.sql`, `**/seed.sql` | Raw SQL schema / seed |
| `docker-compose.yml` → service names | Implied DB types (postgres, mysql, mongo, redis…) |

Output: `database_signals[]` — each with `{ type, evidence_path, migration_tool }`.

Rule: If none found but ORM dep exists → `database_signals` = ASSUMED with rationale note.

---

### Signal Category 5 — API Contract Files

| File pattern | Contract type |
|-------------|---------------|
| `openapi.yaml`, `openapi.json`, `swagger.yaml`, `swagger.json` | OpenAPI / Swagger |
| `api-docs.yaml`, `api.yaml`, `api-spec.yaml`, `api/*.yaml` | OpenAPI (alternate) |
| `*.proto`, `proto/**/*.proto` | gRPC / Protocol Buffers |
| `schema.graphql`, `**/*.graphql` | GraphQL |
| `src/main/resources/static/v3/api-docs*` | Spring Swagger (generated) |
| `postman_collection.json`, `*.postman_collection.json` | Postman |
| `insomnia.yaml`, `.insomnia/` | Insomnia |

`api_style` inference:
- REST → if OpenAPI/Swagger file found
- gRPC → if `*.proto` found (set `mixed` if REST also found)
- GraphQL → if `schema.graphql` / `*.graphql` found
- ASSUMED REST → if REST framework detected but no contract file found
- MISSING → if api_style still unknown after all signals; user prompted

---

### Signal Category 6 — Infrastructure & Deployment Configuration

| File pattern | Deployment signal |
|-------------|------------------|
| `Dockerfile` | Containerized — read `FROM` for base image |
| `docker-compose.yml`, `docker-compose*.yml` | Service topology (list all services) |
| `.github/workflows/*.yml` | GitHub Actions CI/CD |
| `.gitlab-ci.yml` | GitLab CI |
| `Jenkinsfile` | Jenkins pipeline |
| `.circleci/config.yml` | CircleCI |
| `bitbucket-pipelines.yml` | Bitbucket Pipelines |
| `k8s/**/*.yaml`, `kubernetes/**/*.yaml` | Kubernetes manifests |
| `helm/**`, `Chart.yaml` | Helm charts |
| `terraform/**/*.tf` | Terraform IaC |
| `pulumi/**`, `Pulumi.yaml` | Pulumi IaC |
| `ansible/**`, `playbook.yml` | Ansible |
| `nginx.conf`, `nginx/**` | Nginx reverse proxy |
| `serverless.yml`, `serverless.ts` | Serverless Framework |
| `fly.toml` | Fly.io |
| `vercel.json`, `.vercel/` | Vercel |
| `netlify.toml` | Netlify |
| `render.yaml` | Render |

Output: `deployment_signals[]` — each with `{ platform, file_path, notes }`.

Rule: If no deployment signal found → `deployment_signals` = MISSING; user prompted.

---

### Signal Category 7 — Environment & Configuration Shape

| File pattern | Purpose |
|-------------|---------|
| `.env.example`, `.env.sample`, `.env.template` | Required env key shape |
| `application.properties`, `application.yml`, `application-*.yml` | Spring Boot config |
| `config/database.yml` | Rails DB config |
| `config/settings.py`, `config/*.py` | Django / Python config |
| `appsettings.json`, `appsettings.*.json` | .NET config |
| `config/config.exs`, `config/runtime.exs` | Elixir config |
| `config.yaml`, `config.yml` (project root or config/) | Generic config |

**Rule:** Read `.env.example` / `.env.sample` / `.env.template` to extract key names into `config_keys[]`.
**SAFETY: Never read `.env` (live secrets file) — scanner explicitly skips it.**

---

### Signal Category 8 — Test Coverage Signals

| File pattern | Test framework |
|-------------|----------------|
| `jest.config.js`, `jest.config.ts`, `jest.config.mjs` | Jest |
| `vitest.config.ts`, `vitest.config.js` | Vitest |
| `.mocharc.js`, `.mocharc.yaml` | Mocha |
| `pytest.ini`, `setup.cfg [tool:pytest]`, `pyproject.toml [tool.pytest.ini_options]` | pytest |
| `karma.conf.js` | Karma |
| `cypress.config.js`, `cypress.config.ts`, `cypress.json` | Cypress |
| `playwright.config.ts`, `playwright.config.js` | Playwright |
| `phpunit.xml`, `phpunit.xml.dist` | PHPUnit |

**Coverage indicators:** presence of `coverage/`, `htmlcov/`, `.nyc_output/`, `target/site/jacoco/` → `has_coverage_reports = true`.

Output: `test_frameworks[]`, `test_root_dirs[]`, `has_coverage_reports`.

Rule: If no test signals found → `test_frameworks` = MISSING; note added to generated `SYSTEM-RULES.md` quality gates section.

---

### Signal Category 9 — Code Quality & Tooling

| File pattern | Tool |
|-------------|------|
| `.eslintrc*`, `eslint.config.*` | ESLint |
| `.prettierrc*`, `prettier.config.*` | Prettier |
| `sonar-project.properties`, `sonar-project.yml` | SonarQube |
| `.pre-commit-config.yaml` | pre-commit hooks |
| `checkstyle.xml` | Checkstyle (Java) |
| `.pylintrc`, `pylint.cfg` | Pylint |
| `.flake8`, `setup.cfg [flake8]` | Flake8 |
| `mypy.ini`, `pyproject.toml [tool.mypy]` | mypy |
| `rustfmt.toml`, `.rustfmt.toml` | rustfmt |
| `.golangci.yml` | golangci-lint |
| `.editorconfig` | EditorConfig |
| `commitlint.config.js`, `.commitlintrc*` | Conventional Commits enforcement |
| `.husky/` | Husky git hooks |
| `lint-staged.config.*`, `package.json "lint-staged"` | lint-staged |

Output: `quality_tools[]` — used to populate `SYSTEM-RULES.md` quality gates section.

---

### Signal Category 10 — Documentation Files

| File | Priority |
|------|----------|
| `README.md` | MUST-READ — extract: project name, description, quickstart |
| `CHANGELOG.md`, `HISTORY.md`, `RELEASES.md` | SHOULD-READ — extract: version history, latest changes |
| `CONTRIBUTING.md` | SHOULD-READ — extract: contribution rules |
| `ARCHITECTURE.md`, `docs/architecture*.md` | SHOULD-READ — extract: any existing arch notes |
| `docs/adr/`, `ADR/`, `decisions/` | SHOULD-READ — Architecture Decision Records |
| `docs/**/*.md` (top 10 by mtime) | NICE-TO-READ — project-specific docs |
| `LICENSE` | MUST-READ — extract license type |

Output: `docs_extracted[]` — each with `{ file, summary, key_facts[] }`.

Rule: If `README.md` absent → `project_name` elevated to MISSING (must ask user).

---

### Signal Category 11 — Git History & Version Signals

Run the following git commands (read-only):

| Command | Purpose |
|---------|---------|
| `git log --oneline -100` | Commit message patterns (Conventional Commits? Jira refs? free-form?) |
| `git tag --sort=-version:refname \| head -20` | Version history + tag naming convention |
| `git log --format="%H %s" --diff-filter=A -- "*.md" \| head -20` | When key docs were added |
| `git branch -a \| head -20` | Branch naming convention |
| `git log --stat -3` | Most recently changed files |
| `git shortlog -sn --no-merges \| head -10` | Top contributors |
| `git remote get-url origin` | Repository URL |

Extract: `commit_convention` (Conventional Commits / Jira-ref / free-form / mixed), `version_pattern` (semver / calver / custom), `latest_tag`, `active_branches[]`, `top_contributors[]`, `repo_url`.

Rule: If not a git repo → all git fields = MISSING; user warned.

---

### Signal Category 12 — File Extension Language Survey

Glob source file extensions to detect secondary languages:

```
Glob: src/**/*.{ts,tsx,js,jsx,py,java,kt,go,rs,rb,php,cs,swift,ex,exs,scala,clj,elm,dart}
(also check project root if no src/ directory)
```

Count files per extension → `language_distribution{}` (e.g. `{ ts: 142, java: 38, sql: 12 }`).

Rule: `secondary_languages[]` = languages with ≥5 files that are not `primary_language`.

---

### Scan Report Schema (finalized)

After running all 12 signal categories, produce this structured Scan Report:

```yaml
# ViePilot Brownfield Scan Report
project_name: string           # from manifest or README
current_version: string        # from manifest or latest git tag
primary_language: string       # from manifest
secondary_languages: []        # from file extension survey
runtime_version: string        # node/java/python/go version
frameworks:
  backend: []
  frontend: []
  orm: []
  auth: []
  message_broker: []
build_tool: string
package_manager: string
monorepo: bool
gap_tier: DETECTED | ASSUMED | MISSING   # root rollup = worst tier across all modules
modules:                       # if monorepo or submodules detected
  - name: string               # workspace package name or submodule name
    type: workspace | submodule | root   # workspace = monorepo member; submodule = git submodule
    path: string               # repo-relative path
    submodule_url: string | null         # remote URL from .gitmodules (null if not submodule)
    initialized: bool          # true if path exists on disk (submodules only)
    primary_language: string
    framework: string | null
    module_purpose: string     # inferred from dir name + manifest description
    entry_point: string | null # main entry file path
    gap_tier: DETECTED | ASSUMED | MISSING
    must_detect_status:        # evidence record per MUST-DETECT field
      primary_language: { value: string, source: string, tier: string }
      framework:        { value: string, source: string, tier: string }
      module_purpose:   { value: string, source: string, tier: string }
      entry_point:      { value: string, source: string, tier: string }
    open_questions: []         # per-module open questions
polyrepo_hints:                # present only when polyrepo signals detected
  - source: string             # e.g. docker-compose.yml
    hint: string               # raw signal text
    inferred_repo: string      # guessed sibling repo name
related_repos:                 # present only when user supplied input after prompt
  - url: string
    role: string               # backend | frontend | shared-library | infra | etc.
architecture_layers: []        # { layer, evidence_path }
module_dependencies: []        # { from, to, type, evidence_path } — Gap D (Phase 78)
dependency_cycles: []          # cycle paths detected — Gap D (Phase 78)
database_signals: []           # { type, evidence_path, migration_tool }
api_contracts: []              # { style, file_path }
api_style: string              # REST | GraphQL | gRPC | mixed | unknown
deployment_signals: []         # { platform, file_path }
test_frameworks: []
test_root_dirs: []
has_coverage_reports: bool
quality_tools: []
config_keys: []                # from .env.example (key names only — no values)
commit_convention: string      # conventional | jira | free-form | mixed
version_pattern: string        # semver | calver | custom
latest_tag: string
repo_url: string
top_contributors: []
docs_extracted: []             # { file, summary, key_facts[] }
language_distribution: {}      # { ts: 142, java: 38, ... }
open_questions: []             # root-level open questions (includes rollup from modules)
```

---

### Gap Detection Rules

Every field in Scan Report is classified as:

| Status | Meaning | Required action |
|--------|---------|-----------------|
| **DETECTED** | Inferred from codebase with high confidence | Show for confirmation — no user action required |
| **ASSUMED** | Inferred with low confidence or indirect signal | Show to user with rationale; user may correct |
| **MISSING** | Not found anywhere in codebase | **Must ask user** before generating artifacts |

**MUST-DETECT fields** (MISSING = hard blocker — cannot generate artifacts until user fills):
- `project_name`
- `primary_language`
- At least one entry in `frameworks.backend` OR `frameworks.frontend`
- `current_version`

**SHOULD-DETECT fields** (MISSING = warning — document assumption, continue with user acknowledgment):
- `api_style`
- At least one entry in `database_signals` (if ORM dep found)
- `test_frameworks`
- `commit_convention`
- `deployment_signals`

**NICE-TO-DETECT fields** (MISSING = note only — generate with placeholder):
- `auth` frameworks, `message_broker`, `config_keys`, `top_contributors`, `has_coverage_reports`

**Assumption documentation rule:** For every ASSUMED or MISSING field that proceeds without user fill, append to `open_questions[]` and insert a `> ⚠️ Assumed: {rationale}` callout in the relevant `.viepilot/` artifact section.

---

### Per-Module Gap Detection

Applies to every entry in `modules[]` (monorepo workspace members, git submodules, and root if single-repo). Each module is assessed independently.

**Per-module MUST-DETECT fields:**

| Field | Source signals | Tier if absent |
|-------|---------------|----------------|
| `primary_language` | Manifest extension, file survey (Signal Cat 12), `tsconfig.json`, `pyproject.toml` | MISSING — must ask user |
| `framework` | Signal Cat 2 dep patterns scanned on module path | ASSUMED if no dep match; MISSING if no manifest found |
| `module_purpose` | Manifest `description` field, directory name convention, README first line | ASSUMED (infer from dir name); MISSING if none of the above |
| `entry_point` | `main` in `package.json`; `src/index.*`; `cmd/main.go`; `*Application.java` | ASSUMED if standard path exists; MISSING otherwise |

**Gap tier assignment per module:**
```
DETECTED  — all MUST-DETECT fields sourced directly from file evidence (no inference)
ASSUMED   — ≥1 MUST-DETECT field inferred by convention (no direct file evidence, but plausible)
MISSING   — ≥1 MUST-DETECT field has no evidence and cannot be inferred
```

**`must_detect_status` evidence conventions:**
- `source: "tsconfig.json"` — read from a specific file
- `source: "inferred"` — derived by directory name / naming convention (tier = ASSUMED)
- `source: "absent"` — no evidence found (tier = MISSING)
- `source: "user"` — provided by user during gap-filling (tier = DETECTED)

**Root gap tier rollup:**
```
root gap_tier = worst tier across all modules
Priority order: MISSING > ASSUMED > DETECTED
```
If any module is MISSING → root `gap_tier` = MISSING → artifact generation blocked until resolved.
If all modules are DETECTED or ASSUMED → root `gap_tier` matches the worst module tier.

**Scan summary printout** (show after all modules scanned):
```
Module scan summary:
┌─────────────────┬──────────────────┬────────────┬──────────────┬───────────┐
│ Module          │ Path             │ Language   │ Framework    │ Gap Tier  │
├─────────────────┼──────────────────┼────────────┼──────────────┼───────────┤
│ api-service     │ apps/api         │ TypeScript │ NestJS       │ DETECTED  │
│ web-client      │ apps/web         │ TypeScript │ React        │ DETECTED  │
│ shared-lib      │ libs/shared      │ TypeScript │ —            │ ASSUMED   │
│ legacy-worker   │ services/worker  │ MISSING    │ MISSING      │ MISSING   │
└─────────────────┴──────────────────┴────────────┴──────────────┴───────────┘
Root gap tier: MISSING (worst across modules)
```

---

### Interactive Gap-Filling (Step 0-B-ii)

After scanner completes:

1. Display Scan Report summary table to user (field | value | status).
2. **Per-module MISSING fields** — for each module with `gap_tier: MISSING`, pause and ask per field:
   ```
   ⛔ Module '{name}' (path: {path}) has MISSING required fields:
     - {field}: no evidence found
   Please provide {field}:
   ```
   Record answer as `{ value: user_input, source: "user", tier: DETECTED }`.
   Do NOT proceed to artifact generation until all MISSING module fields are filled.
3. For each root-level MUST-DETECT field that is MISSING → **pause and ask user to provide value**.
4. Present ASSUMED fields (root + per-module) in a confirmation table → user may accept all with "y" or override individually.
5. Capture all user responses; update Scan Report fields accordingly.
6. All remaining unresolved items → `open_questions[]` (roll up per-module `open_questions[]` into root).

---

### Brownfield Brainstorm Stub Generation (Step 0-C)

After gap-filling is complete, write:

**Path:** `docs/brainstorm/session-brownfield-import.md`

**Content:**
```markdown
# Brownfield Import — {project_name}

## Meta
- **Import date**: {scan_date}
- **Import source**: `vp-crystallize --brownfield`
- **Scanner version**: FEAT-018

## Scan Report

\`\`\`yaml
{full confirmed Scan Report YAML}
\`\`\`
```

**Purpose:** This stub allows `vp-audit` and other ViePilot tools to not error on missing brainstorm session files. The presence of `session-brownfield-import.md` is treated as a valid brownfield import.

---

### Safety Rules

The brownfield scanner MUST:

```
NEVER read:
  .env                    (live secrets)
  *.key, *.pem, *.p12, *.jks, id_rsa, id_ed25519

ALWAYS skip these directories:
  node_modules/
  .git/
  target/
  build/
  dist/
  __pycache__/
  .venv/
  vendor/

NEVER write any files until the user has confirmed the Scan Report.

NEVER overwrite existing .viepilot/ without explicit user confirmation (y/n prompt).
```

---

### TRACKER.md Continuity Annotation

When generating TRACKER.md in Step 9 (brownfield mode only), append:

```markdown
## Brownfield Import
- **Import date**: {scan_date}
- **Imported version**: {current_version}
- **Note**: Project history pre-dates ViePilot adoption.
- **Scan Report**: `docs/brainstorm/session-brownfield-import.md`
```

</step>

<step name="brownfield_execution_path">
## Brownfield Execution Path

When `IS_BROWNFIELD=true`, the following table governs which steps execute:

| Step | Name | Brownfield behavior | Rationale |
|------|------|---------------------|-----------|
| 0 | Collect metadata | **RUN** | Always needed |
| 0-B | Brownfield scanner | **RUN** | Core brownfield step |
| 0-C | Generate brainstorm stub | **RUN** | Creates `session-brownfield-import.md` |
| 1 | Analyze brainstorm | **RUN (stub only)** | Reads brownfield stub; skips greenfield-only checks |
| 1A | UI direction gate | **CONDITIONAL** — run if `.viepilot/ui-direction/` already exists in the project |
| 1B | Stack research cache | **CONDITIONAL** — skip if brownfield scanner already populated stack cache |
| 1C | Architect artifact consumption | **SKIP** — no architect HTML workspace in a brownfield import |
| 1D | Architect auto-activate suggestion | **SKIP** — no scope brainstorm; architect mode not applicable |
| 2+ | All subsequent steps | **RUN** — same as greenfield from Step 2 onward |

> **Implementation note for AI agents:** When `IS_BROWNFIELD=true`, check each CONDITIONAL
> step against the stated condition before executing. Do **not** skip Step 1 entirely —
> read the brownfield stub to extract stack + gap data for Step 2 (AI-GUIDE.md generation).
> For Step 1B: check `~/.viepilot/stacks/` for entries created during the Step 0-B scan;
> if present and non-empty, skip the full research pass in 1B.

</step>

<step name="analyze_brainstorm">
## Step 1: Analyze Brainstorm

```bash
ls docs/brainstorm/session-*.md
```

For each session file:
1. Extract decisions (look for "Decision:" patterns)
2. Extract architecture info
3. Extract database schemas
4. Extract features/requirements
5. Extract tech stack choices
6. **Phase assignment** — parse `## Phases` from brainstorm session(s):
   - Collect features/capabilities listed under each `### Phase N` heading.
   - If a feature has no phase assigned → ask user which phase before continuing.
   - Record `phases_inventory: { phase_1: [...], phase_2: [...], ... }` in working notes.

**Phase assignment gate (before leaving Step 1):**
- [ ] Every brainstorm session checked for `## Phases` section OR features explicitly assigned during conversation.
- [ ] All features have a phase number assigned — no unassigned features.
- [ ] `phases_inventory` recorded in working notes with at least Phase 1 non-empty.

Validate completeness:
- [ ] Tech stack defined
- [ ] Core features identified
- [ ] Database schema exists
- [ ] API requirements clear
- [ ] Phase assignment gate satisfied (phases_inventory recorded)

If gaps found → ask user to clarify or return to brainstorm.
</step>

<step name="consume_ui_direction">
## Step 1A: Consume UI Direction Artifacts (for UI/UX projects)

> ⛔ **PATH GUARD (BUG-011):** The ONLY valid ui-direction path is `.viepilot/ui-direction/`.
> If a `{root}/ui-direction/` directory exists at the project root — **IGNORE it completely**.
> It is user-managed reference material, NOT ViePilot artifacts.
> Never read, glob, or reference any file under `{root}/ui-direction/` in this workflow.

### UI Scope Detection (ENH-026 hard gate)

Before checking for artifacts, scan brainstorm session files (`docs/brainstorm/session-*.md`) for UI signal keywords:

> `màu`, `màu sắc`, `color`, `layout`, `màn hình`, `screen`, `page`, `trang`, `button`, `nút`, `form`, `biểu mẫu`, `mobile`, `responsive`, `giao diện`, `UI`, `UX`, `design`, `dashboard`, `sidebar`, `header`, `footer`, `modal`, `popup`, `icon`, `theme`, `typography`, `font`, `spacing`, `grid`, `card`, `component`, `hero`, `banner`

If **≥3 unique signal occurrences** found → set `ui_scope_detected = true`.

**Hard gate** (only when `ui_scope_detected = true`):

Check if `.viepilot/ui-direction/` exists and contains any session artifacts.

If `ui_scope_detected = true` **AND** artifacts are missing → **STOP** and present:

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable. AUQ spec:
>   - question: "UI Direction artifacts missing. The brainstorm indicates UI scope but `.viepilot/ui-direction/` has no artifacts. How to proceed?"
>   - header: "UI Direction"
>   - options: [{ label: "Return to /vp-brainstorm --ui (Recommended)", description: "Create UI direction artifacts first for best results" }, { label: "Continue with assumptions", description: "Record assumptions in ARCHITECTURE.md and proceed without visual direction" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text menu below

```
⚠️ UI Direction artifacts missing

The brainstorm session indicates this project has UI scope but `.viepilot/ui-direction/` has no artifacts yet.

1. Return to /vp-brainstorm --ui to create direction first (recommended)
2. Continue with assumptions — record in ARCHITECTURE.md and proceed
```

**Option 2 path**: append to `.viepilot/ARCHITECTURE.md`:

```markdown
## UI Direction Assumptions
> Auto-generated by crystallize (ENH-026 gate bypassed by user)
- UI scope detected in brainstorm but no ui-direction artifacts present
- Proceeding without visual direction; architecture decisions may need UI review later
```

If `ui_scope_detected = false` → skip gate; proceed normally.

**MANDATORY READ GATE (ENH-064) — if `.viepilot/ui-direction/` exists:**

Read ALL artifacts completely (no partial reads):
1. `notes.md` — ALL sections: ui_idea_buffer[], background extracted ideas, Pages inventory, arch_to_ui_sync[], skills_used[], coverage[], admin (if present)
2. If `pages/` directory exists: read EVERY `pages/*.html` file — do NOT skip any page
   For each page: extract layout intent, component list, interactions, designer annotations
3. Read `index.html` (hub) — verify nav links match pages/ file set
4. Verify `## Pages inventory` in notes.md matches actual `pages/*.html` set on disk
   If mismatch detected → STOP:
   ```
   ⛔ UI Direction pages/ directory and notes.md Pages inventory are out of sync.
   Files on disk: {list}
   Inventory in notes.md: {list}
   Please sync brainstorm artifacts before continuing.
   1. Return to /vp-brainstorm --ui to update inventory
   2. Continue with disk files as source of truth (override notes.md)
   ```
5. Record: `ui_direction_read_complete: true` in crystallize working notes

Do NOT proceed to UI extraction until `ui_direction_read_complete: true`.

### Consume artifacts (when available)

Check for direction artifacts:

```bash
ls -la .viepilot/ui-direction/ 2>/dev/null
```

When available, for the selected/latest session:
- Read `.viepilot/ui-direction/{session-id}/notes.md` first (source of design decisions)
- If `pages/` exists and contains `*.html`:
  - Require section **`## Pages inventory`** in `notes.md`; treat it as the **site map** (page count, purpose, navigation).
  - List all `pages/*.html` and confirm each file is represented in the inventory table (if mismatch → stop and ask user to fix brainstorm artifacts or document assumptions).
  - Read **each** `pages/{slug}.html` for section structure, components, and interaction hints.
  - Read hub `index.html` for cross-page navigation intent.
- Else (legacy single-file layout):
  - Read `index.html` + `style.css` only (no `pages/`).
- Always read `style.css` for shared styling constraints.
- Extract from HTML: layout hierarchy, component candidates, interaction expectations.
- In architecture / UI plan output, **enumerate every page** from inventory (or state explicitly single-page legacy).

If `notes.md` exists but has no `## Pages inventory` section and brainstorm shows multi-page scope → warn user and request fix or assumptions before proceeding.
</step>

<step name="research_stack_official">
## Step 1B: Research Official Stack Guidance (mandatory)

For each selected stack extracted in Step 1:
1. Use `WebSearch` to find official documentation and authoritative references.
2. Use `WebFetch` to read and verify each selected source before summarizing.
3. Prefer source priority in this order:
   - Official framework docs/specification
   - Official project GitHub org docs
   - Maintainer-authored references
   - Community articles (only as supplemental context)
4. Reject weak sources (outdated, anonymous, unclear version, no technical detail).
5. Build a concise implementation guide that can be reused by `vp-auto`.
6. Capture "Do / Don't" rules and common anti-patterns.

Required output per stack:
- Quick summary (token-light)
- Best practices
- Anti-patterns
- Source links + checked date
- Version compatibility note (e.g. MyBatis 3.x, Spring Boot 3.x integration notes)

Recommended structure:
```yaml
stack: mybatis
official_sources:
  - https://mybatis.org/mybatis-3/
guideline:
  do:
    - Prefer XML mapper for complex SQL and reusable fragments
  dont:
    - Avoid large inline SQL annotations for complex queries
```

If official sources cannot be verified, pause crystallize and ask user to confirm temporary assumptions.
</step>

<step name="write_stack_cache">
## Step 1C: Write Global Stack Cache

Persist stack guidance globally for cross-project reuse:

```bash
mkdir -p "$HOME/.viepilot/stacks/{stack}"
```

Files per stack:
- `~/.viepilot/stacks/{stack}/SUMMARY.md` (short checklist for fast lookup)
- `~/.viepilot/stacks/{stack}/BEST-PRACTICES.md`
- `~/.viepilot/stacks/{stack}/ANTI-PATTERNS.md`
- `~/.viepilot/stacks/{stack}/SOURCES.md` (official docs + last validated date)

Also create project-local index for traceability:
- `.viepilot/STACKS.md` listing stacks used and cache paths.
</step>

<step name="consume_architect_artifacts">
## Step 1D: Consume Architect Artifacts (FEAT-011)

If `.viepilot/architect/` exists with at least one session directory:

**MANDATORY READ GATE (ENH-064) — if `.viepilot/architect/` exists:**

Before extracting any data, execute a full sequential read of ALL present files:

```bash
ls -la .viepilot/architect/{session-id}/
```

For each file present, READ COMPLETELY (no skimming):
1. `notes.md` — ALL sections: decisions[], tech_stack{}, open_questions[], erd, use_cases, apis, deployment, feature_map, arch_to_ui_sync[], coverage[], admin (ENH-063), skills_used[]
2. `architecture.html` — components, C4 intent, external integrations
3. `data-flow.html` — service flows, async indicators, event queues
4. `decisions.html` — all ADR entries (supplement notes.md decisions[])
5. `tech-stack.html` — layer-by-layer stack (authoritative if conflicts with notes.md)
6. `tech-notes.html` — assumptions, risks, open questions (supplement notes.md open_questions[])
7. `feature-map.html` — features with phase/priority/status tags
8. `erd.html` — entities, relationships (if present)
9. `user-use-cases.html` — actors, use cases (if present)
10. `deployment.html` — infra, environments (if present)
11. `apis.html` — endpoints, service contracts (if present)
12. `admin.html` — admin capabilities (if present — ENH-063)
13. `content.html` — content types, lifecycle, media/SEO schema (if present — ENH-065)
14. `user-data.html` — user-owned data controls (if present — ENH-066)
    *(Skip: `sequence-diagram.html` — intentionally excluded per existing rule)*

**Failure rule**: if `notes.md` is missing or unreadable → STOP and surface:
```
⛔ Architect workspace found but notes.md is missing or unreadable.
Path: .viepilot/architect/{session-id}/notes.md
Please fix architect artifacts before running /vp-crystallize.
1. Return to /vp-brainstorm --architect to regenerate notes.md
2. Continue without architect data (not recommended)
```

**Completion record**: after all files read → set `architect_read_complete: true` in crystallize working notes.
Do NOT proceed to data extraction until `architect_read_complete: true`.

1. **Select most recent session** (by directory mtime or newest session-id).
2. **Read `notes.md`** → parse YAML frontmatter sections:
   - **`decisions[]`** → append to `.viepilot/ARCHITECTURE.md` under:
     ```markdown
     ## Architecture Decisions (from Architect Mode)
     | ID | Topic | Chosen | Rationale | Status |
     ```
   - **`tech_stack{}`** → use as **authoritative tech stack** (overrides brainstorm text if conflict; when conflict detected: surface to user with both values and ask which to use before proceeding).
   - **`open_questions[]`** with `status: open` → surface as list:
     ```
     ⚠️ These questions were open at end of Architect Design Mode — please resolve before proceeding:
     - Q001: {question}
     - Q002: {question}
     ```
3. **`erd.html` / `notes.md ## erd`** (if exists — ENH-027) → append to `.viepilot/ARCHITECTURE.md`:
   ```markdown
   ## Database Schema (from Architect ERD)
   | Entity | Attributes | PK | FK | Notes |
   ...
   ### Relationships
   | Entity A | Type | Entity B | Label |
   ```
4. **`user-use-cases.html` / `notes.md ## use_cases`** (if exists — ENH-028) → append to `.viepilot/PROJECT-CONTEXT.md`:
   ```markdown
   ## User Stories & Use Cases (from Architect Mode)
   ### Actors
   | Actor | Role | Goals |
   ### User Stories
   | ID | As a... | I want to... | So that... | Priority |
   ```
5. **`deployment.html` / `notes.md ## deployment`** (if exists — ENH-029) → append to `.viepilot/ARCHITECTURE.md`:
   ```markdown
   ## Deployment & Infrastructure (from Architect Mode)
   | Env | URL | Purpose | Services | Config notes |
   ...
   ### Infrastructure Components
   | Component | Type | Provider | Sizing | Notes |
   ```
6. **`apis.html` / `notes.md ## apis`** (if exists — ENH-029) → append to `.viepilot/ARCHITECTURE.md`:
   ```markdown
   ## API Design (from Architect Mode)
   ### API Style: {REST / GraphQL / gRPC / WebSocket}
   | Service | Method | Path | Auth? | Notes |
   ...
   ### API Design Decisions
   | Decision | Choice | Rationale |
   ```
   Note: `sequence-diagram.html` is intentionally excluded from crystallize extraction — per-scenario diagrams are not architecture artifacts (they live in Architect Mode workspace only).
7. **`admin.html` / `notes.md ## admin`** (if exists — ENH-063) → append to `.viepilot/PROJECT-CONTEXT.md`:
   ```markdown
   ## Admin & Governance (from Architect Mode)
   | Capability | Required | Phase | Notes |
   |-----------|----------|-------|-------|
   | User management UI | yes | 2 | invite, deactivate, role assign |
   | Audit log | yes | 3 | all write operations, 90-day retention |
   | Monitoring dashboard | optional | 3 | error rate, latency, active users |
   | Billing management | no | — | not in scope |

   ### Admin Personas
   | Persona | Key Capabilities |
   |---------|-----------------|
   | super_admin | user_management, billing, system_config, audit_log_view |
   | org_admin | invite_users, role_assign, reporting |
   ```
8. **`content.html` / `notes.md ## content`** (if exists — ENH-065) → append to `.viepilot/PROJECT-CONTEXT.md`:
   ```markdown
   ## Content Management (from Architect Mode)
   | Content Type | Created By | Lifecycle | Key Fields | Phase |
   |-------------|-----------|-----------|-----------|-------|
   | article | admin, author | draft → review → published → archived | title, body, slug, tags, seo_meta | 2 |
   | product | admin | draft → published → discontinued | name, description, price, images, category | 1 |

   ### Media & Storage
   | Storage | CDN | Types | Max Size |
   |---------|-----|-------|----------|
   | S3 | CloudFront | image, pdf | 10 MB |

   ### Localization
   | Locales | Fallback |
   |---------|---------|
   | en | en |
   ```
9. **`user-data.html` / `notes.md ## user_data`** (if exists — ENH-066) → append to `.viepilot/PROJECT-CONTEXT.md`:
   ```markdown
   ## User Data Management (from Architect Mode)
   | Capability | Supported | Notes |
   |-----------|----------|-------|
   | Profile edit (name/email/avatar) | yes | — |
   | Notification preferences | yes | email, push, in_app |
   | Data export (GDPR) | yes | CSV/JSON download |
   | Account deletion (right-to-erasure) | yes | 730-day retention |
   | Activity history | yes | login history, action log |
   | Connected accounts (OAuth) | yes | Google, GitHub |
   | Session/device management | yes | sign out all devices |
   | Two-factor authentication | yes | TOTP + backup codes |
   ```
10. **`feature-map.html`** → cross-reference Phase badges with `phases_inventory`; if discrepancies found (feature in HTML not in inventory, or vice versa) → list them for user to confirm.
11. **Record in working notes**:
   - `architect_session_id`: {id}
   - `decisions_imported`: {count}
   - `open_questions_count`: {count of open questions}
   - `erd_entities_count`: {count if erd present, else "n/a"}
   - `use_cases_count`: {count if use_cases present, else "n/a"}
   - `deployment_imported`: {true/false}
   - `apis_imported`: {true/false}
   - `admin_imported`: {true/false}
   - `admin_capabilities_count`: {count if admin present, else "n/a"}
   - `content_imported`: {true/false}
   - `content_types_count`: {count if content present, else "n/a"}
   - `user_data_imported`: {true/false}
   - `user_data_capabilities_count`: {count if user_data present, else "n/a"}

If `.viepilot/architect/` does **not** exist but brainstorm shows complex architecture (≥5 services/components detected):
- Suggest (soft prompt — not a hard block):

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable. AUQ spec:
>   - question: "Complex architecture detected (≥5 services/components). Would you like to create architecture visualizations first with /vp-brainstorm --architect?"
>   - header: "Architect?"
>   - options: [{ label: "Yes, go to architect mode", description: "Create visual architecture diagrams before crystallizing (recommended for complex systems)" }, { label: "No, continue now", description: "Continue crystallize with text-only brainstorm — no visual diagrams" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text menu below

  ```
  💡 Would you like to return to /vp-brainstorm --architect to create visualizations first?
  1. Yes — return to architect mode
  2. No — continue crystallize with text-only brainstorm
  ```
- User confirmation required before proceeding.
</step>

<step name="skill_decision_gate">
## Step 1E — Skill Decision Gate (FEAT-020)

**Trigger**: `## skills_used` section exists in the brainstorm session's `notes.md` (`.viepilot/ui-direction/{session-id}/notes.md` or `.viepilot/architect/{session-id}/notes.md`).

**Skip condition**: If no `## skills_used` found anywhere → silently skip this step (no error, no prompt).

**Step — Load skills_used:**
Read `## skills_used` from the most recent session's `notes.md`. Extract each skill entry: `id`, `capabilities`, `best_practices_applied`.

**Step — AUQ confirm (Claude Code adapter — REQUIRED):**

> **Claude Code (terminal):** Call `AskUserQuestion` tool.
> - question: "The following skills were used in this brainstorm. Mark each as required, optional, or exclude:"
> - For each skill: show `id` + capabilities + `best_practices_applied[]`
> - Options per skill: `required` | `optional` | `exclude`

> **Text fallback (other adapters):** Present numbered list with required / optional / exclude options per skill.

**Step — Write `## Skills` to `PROJECT-CONTEXT.md`:**

Append to `.viepilot/PROJECT-CONTEXT.md`:

```markdown
## Skills

| Skill | Source | Required | Phases | Rationale |
|-------|--------|----------|--------|-----------|
| frontend-design | npm:@vp-skills/frontend-design | required | 1, 2 | UI-Direction HTML generation — design token best practices |
```

- `required` — skill best_practices injected by vp-auto for matching phases — **no re-asking**
- `optional` — skill context available but not auto-injected
- `exclude` — entry omitted from PROJECT-CONTEXT.md

**Lock semantics**: once written, `## Skills` is the authoritative skill decision for the project. `vp-auto` reads it and **never re-prompts**.
</step>

<step name="cross_reference_gate">
## Step 1F: Cross-Reference Gate (ENH-064)

Run when BOTH `architect_read_complete: true` AND `ui_direction_read_complete: true` are set in working notes:

1. Read `## Coverage` from architect notes.md (or ui-direction notes.md if present).
2. For each Phase 1 feature in coverage matrix:
   - Confirm architect page was read (in `architect_read_complete` set)
   - Confirm UI screen page was read (in `ui_direction_read_complete` set)
3. Features with "none yet" in BOTH architect AND UI columns → surface warning (non-blocking):
   ```
   ⚠️ Coverage gap: Feature "{name}" has no coverage in Architect OR UI Direction.
   Consider adding before proceeding — or dismiss to continue.
   ```
4. Record: `cross_reference_complete: true`.

**Skip condition**: if only one workspace is present (not both) → silently skip Step 1F (single-workspace is valid).
</step>

<step name="generate_ai_guide">
## Step 2: Generate AI-GUIDE.md

Create `.viepilot/AI-GUIDE.md` using template:
`@$HOME/.cursor/viepilot/templates/project/AI-GUIDE.md`

Customize with:
- Project-specific file references
- **ViePilot profile (FEAT-009):** If Step 0 set `profile_resolved` to a valid path, add a **Quick context** entry recording `profile_id`, the profile file path, and a reminder to read that file for **tone/branding** when writing user-facing text. If `profile_resolved: none`, write a single line: no global profile bound.
- Context loading strategy based on project size — **preserve template ordering** where `PROJECT-CONTEXT.md` **`<product_vision>`** and **`ROADMAP.md` phases** are read **before** deep implementation / architecture lock; state this explicitly in the generated `AI-GUIDE.md` if you trim sections
- Quick lookup for project-specific terms
- Fast stack lookup section:
  - Read `.viepilot/STACKS.md`
  - For each task stack, read cache `SUMMARY.md` first
  - Expand to `BEST-PRACTICES.md` only if task complexity requires
</step>

<step name="generate_project_meta">
## Step 3: Generate PROJECT-META.md

Create `.viepilot/PROJECT-META.md` using template:
`@$HOME/.cursor/viepilot/templates/project/PROJECT-META.md`

Fill with collected metadata:
- Project info
- Organization info
- Package structure (generate from base ID)
- Developer info
- File headers (generate from metadata)
- **FEAT-009:** If the profile was resolved in Step 0 and the user confirmed the pre-fill, **prioritize** aligning the Organization / attribution table in the template with the profile content (public data only; no secrets).
</step>

<step name="generate_architecture">
## Step 4: Generate ARCHITECTURE.md

Create `.viepilot/ARCHITECTURE.md` using template:
`@$HOME/.cursor/viepilot/templates/project/ARCHITECTURE.md`

Extract from brainstorm:
- System overview diagram
- Services definitions
- Data flow
- Technology decisions with rationale
- Integration points

### ViePilot organization context (FEAT-009)

- If Step 0 recorded **`profile_resolved`** with a valid path: immediately after the first **overview** section of `.viepilot/ARCHITECTURE.md`, add the following section:

```markdown
## ViePilot organization context

> **Active profile**: `{profile_id}` — `{absolute path to profile file}` — binding `.viepilot/META.md`.

```

Then add **2–8 bullets** summarizing (no secrets) from the **Organization**, **Branding & voice**, and **Audience** sections of the profile file.

- If **`profile_resolved: none`**: add one line below the overview: *No ViePilot global profile bound — organization context comes from Step 0 only.*

Before writing diagrams, create a **diagram applicability matrix** from brainstorm signals (complexity, service boundaries, event usage, deployment shape, user-flow complexity, integration surface):

| Diagram type | Status | Rule |
|--------------|--------|------|
| `system-overview` | required/optional/N/A | Required if >1 major component or integration boundary |
| `data-flow` | required/optional/N/A | Required when request/response or data pipeline is central |
| `event-flows` | required/optional/N/A | Required when async events/webhooks/queues exist |
| `module-dependencies` | required/optional/N/A | Required when multi-module/layer boundaries matter |
| `deployment` | required/optional/N/A | Required for multi-env/distributed deployment concerns |
| `user-use-case` | required/optional/N/A | Required when user journey/actor interactions drive design |

Generation rules:
- `required`: include explicit ` ```mermaid ` block in `.viepilot/ARCHITECTURE.md`
- `optional`: may be simplified or merged with a nearby section, but keep section heading discoverable
- `N/A`: keep heading and add one-line rationale (`Not applicable: ...`) so `vp-audit` and `vp-auto` can interpret intent
- Never default to “all six detailed diagrams”; diagram depth must scale with project complexity from brainstorm.

### Architecture diagram source files on disk (ENH-022)

When a diagram type is **`required`** or **`optional`** and you emit a **non-empty Mermaid diagram** for it, also persist the **same** diagram body (Mermaid source only — **no** markdown fences) under **`.viepilot/architecture/`** using the canonical filenames below. When status is **`N/A`** or the section has **no** real diagram (placeholder-only / rationale-only), **do not** create the matching `.mermaid` file (and remove a stale file if regenerating a project).

| Diagram type (matrix key) | File (under `.viepilot/architecture/`) |
|---------------------------|----------------------------------------|
| `system-overview` | `system-overview.mermaid` |
| `data-flow` | `data-flow.mermaid` |
| `event-flows` | `event-flows.mermaid` |
| `module-dependencies` | `module-dependencies.mermaid` |
| `deployment` | `deployment.mermaid` |
| `user-use-case` | `user-use-case.mermaid` |

**Single source of truth (mirror policy):** the line-for-line Mermaid **inside** the ` ```mermaid ` fence in `.viepilot/ARCHITECTURE.md` must match the contents of the paired `.viepilot/architecture/<name>.mermaid` file. If you update one, update the other in the same crystallize pass.

**System overview exception:** if the overview uses a non-Mermaid diagram (e.g. ASCII in a plain ` ``` ` block) and matrix marks `system-overview` as `required`, prefer converting to Mermaid for consistency; if you keep ASCII only, **omit** `system-overview.mermaid` and state that choice in the matrix reason column.

**Discoverability:** in `.viepilot/ARCHITECTURE.md`, under each diagram section that has a sidecar file, add a line with bold label **Diagram source** and an inline-code path `.viepilot/architecture/<filename>.mermaid`.

Create `.viepilot/architecture/` only when at least one `.mermaid` file will be written (empty directory otherwise is unnecessary).
</step>

<step name="generate_context">
## Step 5: Generate PROJECT-CONTEXT.md

Create `.viepilot/PROJECT-CONTEXT.md` using template:
`@$HOME/.cursor/viepilot/templates/project/PROJECT-CONTEXT.md`

**Version stamp (ENH-067):** Write the following as the **very first line** of the generated file (before the `#` title):
```
<!-- crystallize_version: {viepilot_semver} -->
```
where `{viepilot_semver}` is resolved from `node bin/vp-tools.cjs info` → `version` field.
This stamp is used by `--upgrade` re-scan mode (Step 0-B) to detect delta on future crystallize runs.

Extract:
- Domain knowledge
- Key concepts
- Business rules
- Naming conventions
- Constraints

**FEAT-009 — ViePilot active profile block:** If the profile was resolved in Step 0, insert **before** `<domain_knowledge>` (or immediately after the file title) the following section:

```markdown
## ViePilot active profile (FEAT-009)

| Field | Value |
|-------|-------|
| profile_id | … |
| profile file | … |
| org_tag | … |

**Summary (non-secret):** …

```

If no profile: a single line *Profile binding not configured (`META.md` or global profile file missing).*
</step>

<step name="generate_rules">
## Step 6: Generate SYSTEM-RULES.md

Create `.viepilot/SYSTEM-RULES.md` using template:
`@$HOME/.cursor/viepilot/templates/project/SYSTEM-RULES.md`

Include:
- Architecture rules
- Coding rules (language-specific)
- Comment standards (good/bad examples)
- Versioning (SemVer)
- Git conventions (Conventional Commits)
- Changelog standards (Keep a Changelog)
- Contributor standards
- Quality gates
- Forbidden patterns
- Stack-specific enforcement:
  - Must follow cached stack `Do/Don't` guidance
  - Require official-source alignment for framework-specific implementation
</step>

<step name="generate_roadmap">
## Step 7: Generate ROADMAP.md

Create `.viepilot/ROADMAP.md` using template:
`@$HOME/.cursor/viepilot/templates/project/ROADMAP.md`

From brainstorm `phases_inventory`:
1. Generate phases in order: Phase 1, Phase 2, Phase 3... from `phases_inventory`.
2. For each phase:
   - Define goal
   - Break into tasks
   - Set acceptance criteria
   - Add verification checkpoints
   - Estimate complexity (S/M/L/XL)
3. Define dependencies between phases.
4. Each phase: tasks, acceptance criteria, verification commands.
5. No Post-MVP / horizon block needed — all work is already in phases.
</step>

<step name="generate_schemas">
## Step 8: Generate schemas/

Create `.viepilot/schemas/`:

**database-schema.sql**
- Extract from brainstorm
- Add proper comments
- Include indexes, constraints

**kafka-topics.yaml**
- List all topics
- Define message schemas
- Include examples

**api-contracts.yaml** (OpenAPI stub)
- Endpoint definitions
- Request/Response schemas
- Auth requirements
</step>

<step name="generate_tracker">
## Step 9: Initialize TRACKER.md

Create `.viepilot/TRACKER.md` using template:
`@$HOME/.cursor/viepilot/templates/project/TRACKER.md`

Initialize:
- Current state (all phases not_started)
- Progress overview (0%)
- Decision log (import from brainstorm)
- Version info (0.1.0-alpha)
- Next action

Create `.viepilot/HANDOFF.json` with initial fields including:
```json
{
  "crystallize_version": "{viepilot_semver}",
  "crystallized_at": "{ISO-8601 timestamp}"
}
```
`crystallize_version` mirrors the stamp written to `PROJECT-CONTEXT.md` (ENH-067). Used by `--upgrade` re-scan as a fallback when `PROJECT-CONTEXT.md` header comment is absent.
</step>

<step name="generate_phase_dirs">
## Step 10: Create Phase Directories

For each phase in ROADMAP.md:
```bash
mkdir -p .viepilot/phases/{NN}-{phase-slug}/tasks/
```

Create:
- `SPEC.md` - Phase specification
- `PHASE-STATE.md` - Initial state (not_started)
- `tasks/` directory with task files
</step>

<step name="generate_project_files">
## Step 11: Generate Project Files

**CHANGELOG.md**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

## [0.1.0] - {date}

### Added
- Project initialization via ViePilot
- Architecture documentation
- Development roadmap

[Unreleased]: {repo}/compare/v0.1.0...HEAD
[0.1.0]: {repo}/releases/tag/v0.1.0
```

**CONTRIBUTING.md** - From template with org info
**CONTRIBUTORS.md** - With lead developer
**LICENSE** - Based on chosen license
**README.md** - Project overview with links to docs
</step>

<step name="commit_confirm">
## Step 12: Commit & Confirm

```bash
git add .viepilot/ CHANGELOG.md CONTRIBUTING.md CONTRIBUTORS.md LICENSE README.md
git commit -m "feat: initialize project with ViePilot

- Add project documentation (.viepilot/)
- Add architecture and coding standards
- Add development roadmap
- Add changelog and contributing guidelines"
git push
```

Display summary:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► CRYSTALLIZE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Package: {package_base_id}
 License: {license}

 Created:
 ├── .viepilot/
 │   ├── AI-GUIDE.md
 │   ├── PROJECT-META.md
 │   ├── ARCHITECTURE.md
 │   ├── architecture/   (*.mermaid sidecars when diagrams generated — ENH-022)
 │   ├── PROJECT-CONTEXT.md
 │   ├── SYSTEM-RULES.md
 │   ├── ROADMAP.md ({phase_count} phases)
 │   ├── TRACKER.md
 │   └── schemas/
 │
 ├── CHANGELOG.md
 ├── CONTRIBUTING.md
 ├── CONTRIBUTORS.md
 ├── LICENSE
 └── README.md

 Phases: {phase_count}
 Tasks: {total_task_count}
 
 Next step: /vp-auto
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Note: global stack cache at `~/.viepilot/stacks/` is machine-level knowledge and is not committed to project git.
</step>

</process>

<success_criteria>
- [ ] All metadata collected
- [ ] Official research completed for each selected stack
- [ ] Global stack cache written under ~/.viepilot/stacks/{stack}/
- [ ] Step 1: phase assignment gate satisfied (phases_inventory recorded, all features assigned)
- [ ] All artifacts created in .viepilot/
- [ ] PROJECT-META.md complete
- [ ] SYSTEM-RULES.md has all standards
- [ ] ROADMAP.md has phases with tasks in order from phases_inventory
- [ ] Phase directories created
- [ ] Project files created
- [ ] Git committed
</success_criteria>
