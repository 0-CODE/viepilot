# FEAT-018: vp-crystallize Brownfield Mode — bootstrap project context from existing codebase

## Meta
- **ID**: FEAT-018
- **Type**: Feature Request
- **Status**: new
- **Priority**: high
- **Created**: 2026-04-13
- **Reporter**: User
- **Assignee**: AI

## Summary

When ViePilot is first used on a **pre-existing project** (brownfield), there is no `docs/brainstorm/session-*.md` to feed into `vp-crystallize`. The current crystallize workflow assumes a greenfield flow (`vp-brainstorm` → `vp-crystallize`). This feature adds a **Brownfield Mode** that infers project context directly from the existing codebase, docs, and git history, then generates the full `.viepilot/` artifact set ready for `vp-auto` / `vp-evolve`.

## Problem

- `vp-crystallize` Step 1 calls `ls docs/brainstorm/session-*.md` — this file does not exist on a brownfield project.
- No fallback path exists to scan source code, README, package.json, git history, etc. and produce equivalent context.
- A user adopting ViePilot on an existing project has no supported entry point to bootstrap `.viepilot/` artifacts.
- Without `.viepilot/` the entire `vp-auto` / `vp-evolve` / `vp-audit` toolchain is blocked.

## Desired Behavior

`/vp-crystallize --brownfield` (or auto-detected when no brainstorm session exists):

1. **Codebase scan** — run the full scanner spec (see below) across all 12 signal categories.
2. **Scan report** — produce a structured `Scan Report` (see schema below) from all signals detected.
3. **Gap detection** — classify every field in the Scan Report as DETECTED / ASSUMED / MISSING per gap rules.
4. **Interactive gap-filling** — present the Scan Report summary; ask user to confirm, correct, or fill every MISSING field before generating artifacts.
5. **Synthetic brainstorm stub** — write `docs/brainstorm/session-brownfield-import.md` encoding the confirmed Scan Report so audit tools don't break.
6. **Generate full `.viepilot/` artifacts** — same output as greenfield crystallize: `PROJECT-CONTEXT.md`, `ARCHITECTURE.md`, `SYSTEM-RULES.md`, `ROADMAP.md`, `TRACKER.md`, `AI-GUIDE.md`, `PROJECT-META.md`.
7. **Continuity note** — annotate `TRACKER.md` with brownfield import date, last known version, and a note that history pre-dates ViePilot adoption.

---

## Codebase Scanner Specification

### Signal Category 1 — Build Manifest & Package Identity

Scanner MUST probe the following files in order of priority (first match per language wins):

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
- `raw_dependencies[]` — full dep list (used by Signal Category 2)
- `raw_dev_dependencies[]` — dev/test deps

**Monorepo detection** (check before single-manifest scan):
- npm workspaces: `package.json` → `"workspaces"` field + `packages/*/package.json`
- Nx / Turborepo: `nx.json`, `turbo.json` + `apps/*/` and `libs/*/`
- Maven multi-module: `pom.xml` with `<modules>`
- Gradle multi-project: `settings.gradle` with `include`
- Cargo workspace: `Cargo.toml` with `[workspace]`
- Go workspace: `go.work`

If monorepo detected → scan each module separately; aggregate into `modules[]` in Scan Report.

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

**ORM / Database client:**
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
| `passport` | OAuth/multi-strategy |
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
| `testify` (Go) | Testify |

---

### Signal Category 3 — Architecture Layer Inference (Directory Structure)

Glob the following path patterns; presence of any pattern implies the corresponding layer:

| Pattern(s) | Inferred layer |
|------------|----------------|
| `src/main/java/**`, `src/main/kotlin/**` | Java/Kotlin standard Maven layout |
| `src/controllers/`, `app/controllers/`, `**/controller/**` | MVC — Controller layer |
| `src/api/`, `api/`, `routes/`, `src/routes/` | API / Router layer |
| `src/services/`, `services/`, `**/service/**` | Service / Business logic layer |
| `src/repositories/`, `repositories/`, `**/repository/**`, `**/dao/**` | Repository / DAO layer |
| `src/models/`, `models/`, `**/model/**`, `**/entity/**` | Domain models / Entities |
| `src/middleware/`, `middleware/` | Middleware layer |
| `src/utils/`, `utils/`, `helpers/`, `common/` | Utilities / Shared |
| `frontend/`, `client/`, `web/`, `src/client/` | Frontend module |
| `backend/`, `server/`, `src/server/` | Backend module (in fullstack) |
| `packages/`, `apps/`, `libs/` | Monorepo layout |
| `infrastructure/`, `infra/`, `terraform/`, `helm/`, `k8s/`, `kubernetes/` | Infrastructure / IaC |
| `scripts/`, `bin/`, `tools/` | Developer tooling |
| `public/`, `static/`, `assets/` | Static assets |
| `docs/`, `documentation/` | Documentation |
| `config/`, `configs/`, `settings/` | Configuration |
| `tests/`, `test/`, `__tests__/`, `spec/`, `e2e/` | Test suite root |

**Output:** `architecture_layers[]` listing each detected layer with evidence path.

---

### Signal Category 4 — Database Schema Signals

Probe the following for schema/migration evidence:

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
| `docker-compose.yml` → service names | Implied database types (postgres, mysql, mongo, redis...) |

**Fields to extract:** `database_signals[]` — each with `{type, evidence_path, migration_tool}`.

---

### Signal Category 5 — API Contract Files

Probe in this order:

| File pattern | Contract type |
|-------------|---------------|
| `openapi.yaml`, `openapi.json`, `swagger.yaml`, `swagger.json` | OpenAPI/Swagger |
| `api-docs.yaml`, `api.yaml`, `api-spec.yaml`, `api/*.yaml` | OpenAPI (alternate) |
| `*.proto`, `proto/**/*.proto` | gRPC / Protocol Buffers |
| `schema.graphql`, `**/*.graphql`, `src/schema/**/*.graphql` | GraphQL |
| `src/main/resources/static/v3/api-docs*` | Spring Swagger (generated) |
| `postman_collection.json`, `*.postman_collection.json` | Postman |
| `insomnia.yaml`, `.insomnia/` | Insomnia |

**Output:** `api_contracts[]` — each with `{style, file_path, endpoint_count_estimate}`.

---

### Signal Category 6 — Infrastructure & Deployment Configuration

| File pattern | Deployment signal |
|-------------|------------------|
| `Dockerfile` | Containerized — read `FROM` for base image |
| `docker-compose.yml`, `docker-compose*.yml` | Service topology — list all services |
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
| `railway.json`, `railway.toml` | Railway |
| `vercel.json`, `.vercel/` | Vercel |
| `netlify.toml` | Netlify |
| `render.yaml` | Render |

**Output:** `deployment_signals[]` — each with `{platform, file_path, notes}`.

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

**Extract from `.env.example`:** list of required env var names (values redacted) → populate `config_keys[]` in Scan Report.

**Rule:** never read `.env` (live secrets). Only read `.env.example` / `.env.sample` / `.env.template`.

---

### Signal Category 8 — Test Coverage Signals

| File pattern | Test framework config |
|-------------|----------------------|
| `jest.config.js`, `jest.config.ts`, `jest.config.mjs` | Jest |
| `vitest.config.ts`, `vitest.config.js` | Vitest |
| `.mocharc.js`, `.mocharc.yaml` | Mocha |
| `pytest.ini`, `setup.cfg [tool:pytest]`, `pyproject.toml [tool.pytest.ini_options]` | pytest |
| `karma.conf.js` | Karma |
| `cypress.config.js`, `cypress.config.ts`, `cypress.json` | Cypress |
| `playwright.config.ts`, `playwright.config.js` | Playwright |
| `phpunit.xml`, `phpunit.xml.dist` | PHPUnit |

**Coverage indicators:** presence of `coverage/`, `htmlcov/`, `.nyc_output/`, `target/site/jacoco/` → set `has_coverage_reports = true`.

**Output:** `test_frameworks[]`, `test_root_dirs[]`, `has_coverage_reports`.

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

**Output:** `quality_tools[]`.

---

### Signal Category 10 — Documentation Files

Probe in this order; read each file found (summary-only, not full content):

| File | Priority |
|------|----------|
| `README.md` | MUST-READ — extract: project name, description, quickstart |
| `CHANGELOG.md`, `HISTORY.md`, `RELEASES.md` | SHOULD-READ — extract: version history, latest changes |
| `CONTRIBUTING.md` | SHOULD-READ — extract: contribution rules |
| `ARCHITECTURE.md`, `docs/architecture*.md` | SHOULD-READ — extract: any existing arch notes |
| `docs/adr/`, `ADR/`, `decisions/` | SHOULD-READ — Architecture Decision Records |
| `docs/**/*.md` (top 10 by mtime) | NICE-TO-READ — project-specific docs |
| `LICENSE` | MUST-READ — extract license type |
| `SECURITY.md` | NICE-TO-READ |

**Output:** `docs_extracted[]` — each with `{file, summary, key_facts[]}`.

---

### Signal Category 11 — Git History & Version Signals

Run the following git commands (read-only):

| Command | Purpose |
|---------|---------|
| `git log --oneline -100` | Commit message patterns (Conventional Commits? Jira refs? free-form?) |
| `git tag --sort=-version:refname \| head -20` | Version history, tag naming convention |
| `git log --format="%H %s" --diff-filter=A -- "*.md" \| head -20` | When key docs were added |
| `git branch -a \| head -20` | Branch naming convention (feature/, hotfix/, release/) |
| `git log --stat -3` | Most recently changed files (activity hotspot) |
| `git shortlog -sn --no-merges \| head -10` | Top contributors |
| `git remote get-url origin` (or `git remote -v`) | Repository URL |

**Extract:**
- `commit_convention` — Conventional Commits / Jira-ref / free-form / mixed
- `version_pattern` — semver / calver / custom
- `latest_tag` — most recent tag
- `active_branches[]` — branch names (exclude HEAD/origin/main)
- `top_contributors[]` — names (not emails)
- `repo_url` — from remote origin

---

### Signal Category 12 — File Extension Language Survey

Glob source file extensions to detect secondary languages:

```
Glob: src/**/*.{ts,tsx,js,jsx,py,java,kt,go,rs,rb,php,cs,swift,ex,exs,scala,clj,hs,ml,elm,dart,lua,r,m}
```

Count files per extension → `language_distribution{}` (e.g. `{ts: 142, java: 38, sql: 12}`).

**Purpose:** detect polyglot codebases, identify primary vs secondary languages when manifest is ambiguous.

---

## Scan Report Schema

After running all 12 signal categories, produce a structured `Scan Report`:

```yaml
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
modules: []                    # if monorepo
architecture_layers: []        # from Signal Cat 3
database_signals: []           # {type, evidence_path, migration_tool}
api_contracts: []              # {style, file_path}
api_style: string              # REST | GraphQL | gRPC | mixed | unknown
deployment_signals: []         # {platform, file_path}
test_frameworks: []
test_root_dirs: []
has_coverage_reports: bool
quality_tools: []
config_keys: []                # from .env.example
commit_convention: string      # conventional | jira | free-form | mixed
version_pattern: string        # semver | calver | custom
latest_tag: string
repo_url: string
top_contributors: []
docs_extracted: []
language_distribution: {}
open_questions: []             # fields that could not be inferred
```

---

## Gap Detection Rules

Every field in Scan Report is classified as one of:

| Status | Meaning | Required action |
|--------|---------|-----------------|
| **DETECTED** | Inferred from codebase with high confidence | No user action needed (show for confirmation) |
| **ASSUMED** | Inferred with low confidence or from indirect signal | Show to user with rationale; user may correct |
| **MISSING** | Not found anywhere in codebase | **Must ask user** before generating artifacts |

### MUST-DETECT fields (MISSING = hard blocker — cannot generate artifacts without user fill):
- `project_name`
- `primary_language`
- At least one entry in `frameworks.backend` OR `frameworks.frontend`
- `current_version`

### SHOULD-DETECT fields (MISSING = warning — document assumption, continue with user acknowledgment):
- `api_style`
- At least one entry in `database_signals` (if ORM dep found)
- `test_frameworks`
- `commit_convention`
- `deployment_signals`

### NICE-TO-DETECT fields (MISSING = note only — generate with placeholder):
- `auth` frameworks
- `message_broker`
- `config_keys`
- `top_contributors`
- `has_coverage_reports`

### Assumption documentation rule:
For every ASSUMED or MISSING field that proceeds without user fill, append to `open_questions[]` in Scan Report and insert a `> ⚠️ Assumed: {rationale}` callout in the relevant `.viepilot/` artifact section.

---

## Acceptance Criteria

### AC-1: Trigger & Mode Detection
- [ ] `vp-crystallize --brownfield` flag is recognized and routes to brownfield workflow.
- [ ] Auto-detection triggers brownfield prompt when `docs/brainstorm/` is absent or empty AND `.viepilot/` does not yet exist.
- [ ] Auto-detection does NOT trigger if `.viepilot/` already exists (avoids overwrite on re-run).

### AC-2: Build Manifest Scan (Signal Cat 1)
- [ ] `package.json` → extracts `project_name`, `current_version`, `primary_language=Node.js`, `raw_dependencies[]`.
- [ ] `pom.xml` → extracts `artifactId`, `version`, `primary_language=Java`.
- [ ] `pyproject.toml` / `setup.py` → extracts `project_name`, `version`, `primary_language=Python`.
- [ ] `go.mod` → extracts module name, Go version.
- [ ] `Cargo.toml` → extracts `package.name`, `version`, `primary_language=Rust`.
- [ ] Monorepo structure detected when `packages/*/package.json` or `pom.xml <modules>` exists; each sub-module scanned separately.
- [ ] If no manifest found → `primary_language` set to MISSING; user prompted.

### AC-3: Framework Detection (Signal Cat 2)
- [ ] Spring Boot detected when `spring-boot-starter-*` in pom.xml deps.
- [ ] Express / Fastify / NestJS detected from `package.json` dependencies.
- [ ] React / Vue / Angular / Next.js detected from `package.json` dependencies.
- [ ] ORM detected (Hibernate, TypeORM, Prisma, SQLAlchemy, GORM) from deps.
- [ ] Auth library detected (Spring Security, JWT, Passport, Keycloak, NextAuth) from deps.
- [ ] Test framework detected (Jest, pytest, JUnit, RSpec, Cypress, Playwright) from dev deps.
- [ ] If zero backend AND zero frontend frameworks detected → `open_questions[]` entry added + user prompted.

### AC-4: Architecture Layer Scan (Signal Cat 3)
- [ ] Each of the 18 directory patterns checked; detected layers listed in `architecture_layers[]` with evidence path.
- [ ] `ARCHITECTURE.md` produced with at least one layer section populated from scan (not blank template).
- [ ] Monorepo modules each get their own layers list.

### AC-5: Database Schema Signals (Signal Cat 4)
- [ ] Flyway migration path (`db/migration/V*.sql`) detected and reported.
- [ ] Liquibase changelog detected.
- [ ] Rails `db/migrate/` detected.
- [ ] Prisma `schema.prisma` detected.
- [ ] `docker-compose.yml` service names cross-referenced to known DB image names (postgres, mysql, mongo, redis, mariadb, cassandra, elasticsearch).
- [ ] Detected DB types listed in `database_signals[]`; if none found but ORM dep exists → `database_signals` set to ASSUMED with rationale.

### AC-6: API Contract Scan (Signal Cat 5)
- [ ] `openapi.yaml` / `swagger.yaml` detected → `api_style=REST`, file path recorded.
- [ ] `*.proto` files detected → `api_style=gRPC` (or `mixed` if REST also found).
- [ ] `schema.graphql` / `*.graphql` detected → `api_style=GraphQL`.
- [ ] If no contract file found but REST framework detected → `api_style=REST` set as ASSUMED.
- [ ] If api_style still unknown after all signals → `api_style=MISSING`; user prompted.

### AC-7: Infrastructure Scan (Signal Cat 6)
- [ ] `Dockerfile` detected → reads `FROM` image name; added to `deployment_signals[]`.
- [ ] `docker-compose.yml` detected → lists all service names; added to `deployment_signals[]`.
- [ ] `.github/workflows/*.yml` detected → CI/CD provider = GitHub Actions.
- [ ] Kubernetes manifests (`k8s/`, `kubernetes/`) detected.
- [ ] Terraform files detected.
- [ ] Cloud PaaS files detected (Vercel, Netlify, Render, Fly.io, Railway).
- [ ] If no deployment signal found → `deployment_signals` set to MISSING; user prompted.

### AC-8: Environment Config Scan (Signal Cat 7)
- [ ] `.env.example` / `.env.sample` read; key names extracted into `config_keys[]`.
- [ ] `.env` (live file) is never read — scanner explicitly skips it.
- [ ] Spring Boot `application.yml` parsed for top-level config key groups.
- [ ] If neither `.env.example` nor framework config found → `config_keys` set to MISSING; note added.

### AC-9: Test Coverage Scan (Signal Cat 8)
- [ ] Test framework config files detected per table.
- [ ] `test_root_dirs[]` populated from glob of `tests/`, `test/`, `__tests__/`, `spec/`.
- [ ] `has_coverage_reports` set to `true` if `coverage/`, `htmlcov/`, `.nyc_output/` exists.
- [ ] If no test signals found → `test_frameworks` set to MISSING; noted in `SYSTEM-RULES.md`.

### AC-10: Code Quality Scan (Signal Cat 9)
- [ ] ESLint, Prettier, SonarQube, Checkstyle, pylint, mypy, golangci-lint config files detected.
- [ ] Pre-commit hook config detected (`.pre-commit-config.yaml`, `.husky/`).
- [ ] Detected tools listed in `quality_tools[]`; used to populate `SYSTEM-RULES.md` quality gates section.

### AC-11: Documentation Scan (Signal Cat 10)
- [ ] `README.md` read; `project_name` and `description` extracted if not already from manifest.
- [ ] `CHANGELOG.md` read; `latest_tag` confirmed or corrected from git tag.
- [ ] `LICENSE` read; `license` field set.
- [ ] `docs/adr/` scanned; ADR count noted in `PROJECT-CONTEXT.md`.
- [ ] If `README.md` absent → `project_name` elevated to MISSING (must ask user).

### AC-12: Git History Scan (Signal Cat 11)
- [ ] `git log --oneline -100` run; commit convention classified.
- [ ] `git tag --sort=-version:refname` run; `latest_tag` and `version_pattern` set.
- [ ] `git remote get-url origin` run; `repo_url` set (empty string if no remote).
- [ ] `git shortlog -sn --no-merges | head -10` run; `top_contributors[]` populated.
- [ ] If not a git repo → all git fields set to MISSING; user warned.

### AC-13: Language Survey (Signal Cat 12)
- [ ] File extension glob run on `src/` (or project root if no `src/`).
- [ ] `language_distribution{}` populated with file counts per extension.
- [ ] `secondary_languages[]` derived from languages with ≥5 files that are not `primary_language`.

### AC-14: Scan Report & Gap Filling
- [ ] Full Scan Report produced in YAML format before any artifact generation.
- [ ] Every MUST-DETECT field that is MISSING causes scanner to pause and ask user.
- [ ] Every ASSUMED field shown to user in a confirmation table; user may accept or override.
- [ ] User confirmation captured before proceeding to artifact generation.
- [ ] `open_questions[]` in Scan Report non-empty only for fields not resolved by user input.

### AC-15: Synthetic Brainstorm Stub
- [ ] `docs/brainstorm/session-brownfield-import.md` created.
- [ ] Stub contains full Scan Report YAML in a fenced block.
- [ ] Stub contains brownfield metadata: scan date, scanner version, import source.
- [ ] `vp-audit` does not error on missing brainstorm session when stub exists.

### AC-16: Artifact Generation
- [ ] All standard `.viepilot/` artifacts generated: `AI-GUIDE.md`, `PROJECT-META.md`, `ARCHITECTURE.md`, `PROJECT-CONTEXT.md`, `SYSTEM-RULES.md`, `ROADMAP.md`, `TRACKER.md`.
- [ ] `ARCHITECTURE.md` architecture layers section populated from Signal Cat 3 (not blank).
- [ ] `ARCHITECTURE.md` database section populated from Signal Cat 4 (not blank if DB detected).
- [ ] `SYSTEM-RULES.md` quality gates section populated from Signal Cat 9.
- [ ] `TRACKER.md` contains brownfield import metadata block:
  ```markdown
  ## Brownfield Import
  - **Import date**: {date}
  - **Imported version**: {current_version}
  - **Note**: Project history pre-dates ViePilot adoption.
  ```
- [ ] `ROADMAP.md` initialized with at least one "Phase 1 — Backlog Triage" phase when no future phases are defined.

### AC-17: Safety Rules
- [ ] Scanner never reads `.env` (live secrets file).
- [ ] Scanner never reads `*.key`, `*.pem`, `*.p12`, `*.jks`, `id_rsa`, `id_ed25519`.
- [ ] Scanner skips `node_modules/`, `.git/`, `target/`, `build/`, `dist/`, `__pycache__/`, `.venv/`, `vendor/`.
- [ ] Scanner does not write any files until user has confirmed the Scan Report.
- [ ] Re-running `--brownfield` on an existing `.viepilot/` warns user and asks for explicit confirmation before overwriting.

---

## Related

- Workflow: `workflows/crystallize.md` — Step 1 `analyze_brainstorm` needs brownfield branch before `ls docs/brainstorm/session-*.md`
- Skill: `skills/crystallize/SKILL.md` — add `--brownfield` flag doc + scanner step overview
- Skill: `skills/vp-audit/SKILL.md` — update to accept brownfield stub as valid brainstorm source
- Dependencies: none (standalone feature)
- Enables: `vp-evolve`, `vp-auto`, `vp-audit` on brownfield projects

## Discussion

**Auto-detection heuristic:** if `docs/brainstorm/` is absent or empty AND `.viepilot/` does not exist → prompt:
```
No brainstorm session found. This looks like an existing project.
Would you like to use Brownfield Mode to bootstrap ViePilot context from the codebase? (y/n)
```

**Scope boundary:** this feature does NOT retroactively reconstruct full feature history — it creates a "current state" snapshot sufficient to plan next development phases with ViePilot.

**Priority rationale:** this is a critical adoption blocker for any team that wants to start using ViePilot on a project already in flight.
