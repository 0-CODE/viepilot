---
name: vp-qa
description: "LLM-driven QA agent team generator — research codebase, generate context-aware QA scanning agents"
version: 1.1.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-QA  v1.1.0 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>

<version_check>
## Version Update Check (ENH-072)

After displaying the greeting banner, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" check-update --silent
```

**If exit code = 1** (update available — new version printed to stdout):
Display notice banner before any other output:
```
┌──────────────────────────────────────────────────────────────────┐
│ ✨ ViePilot {latest_version} available  (installed: {current})   │
│    npm i -g viepilot && vp-tools install --target {adapter_id}   │
└──────────────────────────────────────────────────────────────────┘
```
Replace `{latest_version}` with stdout from the command, `{current}` with the installed
version, `{adapter_id}` with the active adapter (claude-code / cursor / antigravity / codex / copilot).

**If exit code = 0 or command unavailable**: silent, continue.

**Suppression rules:**
- `--no-update-check` flag on skill invocation → skip this step entirely
- `config.json` → `update.check: false` → skip this step entirely
- Show at most once per session (`update_check_done` session guard)
</version_check>

<persona_context>
## Persona Context Injection (ENH-073)

At skill start, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
Inject the output as `## User Persona` context before any task execution.
Silent if command unavailable or errors.
</persona_context>

<adapter id="claude-code">
## A. Skill Invocation
- Skill được gọi khi user mention `vp-qa`, `/vp-qa`, "qa", "scan", "kiểm tra chất lượng"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

## C. Tool Usage
Use Claude Code tools: `Bash` (shell), `Read` (file), `Edit` + `Write` (file write/patch),
`Grep` (search), `Glob` (file patterns), `LS`, `WebSearch`, `WebFetch`,
`Agent` (spawn subagent — multi-level nesting supported)
Interactive: `AskUserQuestion` (deferred — preload via ToolSearch before first call)

**Phase 1 research tools:**
- `Read` — parse .viepilot/PROJECT-META.md, STACKS.md, package.json, requirements.txt, etc.
- `Bash` — find backend directories, count files
- `Grep` — search for patterns in source code

**Phase 3 generation tools:**
- `Write` — create agent files directly (qa-orchestrator.md, qa-{domain}-scanner.md)
</adapter>

<adapter id="cursor-agent">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.

## C. Tool Usage
Use Cursor tools: `run_terminal_cmd` (shell), `read_file` (read), `edit_file` (write/edit),
`grep_search` (search), `web_search`, `codebase_search`, `list_dir`, `file_search`
Interactive: text list fallback (AskQuestion available in Plan Mode only; Agent Mode = text)
Subagent: `/multitask` (user command, single-level only — not a callable tool)
MCP limit: 40 tools
</adapter>

<adapter id="antigravity">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.
Skill discovery: LLM-driven (automatic, no slash command needed).

## C. Tool Usage
Use Antigravity tools: `shell` (cmd), `file_read`, `file_write`, MCP plugins
Interactive: text fallback (TUI-based; no formal AskUserQuestion)
Skill path: `.agents/skills/<skill>/SKILL.md` (project) or `~/.agents/skills/` (global)
</adapter>

<adapter id="codex">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.

## C. Tool Usage
Use Codex tools: `container.exec` (sandboxed shell), `apply_patch` (file write), `web_search`
Interactive: text fallback (TUI Tab/Enter injection)
Config: `~/.codex/config.toml`
</adapter>

<adapter id="copilot">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.
Discovery: User-driven (`@agent-name` in GitHub Copilot Chat).

## C. Tool Usage
Use Copilot tools: `runCommands` (shell), `read`/`readfile` (read), `edit`/`editFiles` (write),
`code_search`, `find_references`
Interactive: `askQuestions` (main agent only — NOT available in subagents; VS Code issue #293745)
Skill path: `.github/agents/<name>.agent.md`
</adapter>

<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Primary implementation lane (ENH-021)

- **`/vp-qa`** generates context-aware QA scanning agents for the current project.
- Output location determined by adapter via `lib/qa-router.cjs`.
- Generated agents invoke `qa-orchestrator` (claude-code) or execute sequential scans (others).
</implementation_routing_guard>

<objective>
Generate a team of QA scanning agents tailored to the project's stack, structure, and detected patterns.

**LLM-generates-directly approach:**
- Phase 1: LLM researches target codebase structure, stack, patterns, existing issues
- Phase 2: LLM determines output location via adapter routing (lib/qa-router.cjs)
- Phase 3: LLM writes agent files directly using Write tool (no template system)
- Phase 4: Show generated files and offer to run qa-orchestrator immediately (claude-code only)

**No templates:** Each agent's content is fully determined by research output. LLM tailors
scanning instructions to detected backend dirs, framework patterns, and known issues from `.viepilot/requests/`.

**After generation:** Generated agents (`qa-orchestrator` on claude-code or combined scanner on others)
will create `.viepilot/requests/BUG-{N}.md` for any QA issues found, and prompt user to accept/decline.
</objective>

<context>
Optional flags:
- `/vp-qa` — auto-detect adapter + stack, generate QA team
- `/vp-qa --run` — generate + immediately invoke qa-orchestrator
- `/vp-qa --focus sec` — bias research toward security domains
- `/vp-qa --focus perf` — bias research toward performance domains
- `/vp-qa --focus coverage` — bias research toward product feature-completeness / spec-gap audit (ENH-113)
- `/vp-qa --live` (a.k.a. `--e2e`) — **live role-based visual QA (ENH-114)**: seed users per role, drive the running app via agent-browser, screenshot each screen, run the Design-QA reviewer. Distinct mode (needs a running app + seeding). **Prereq**: `vercel-labs/agent-browser` + a runnable app (base URL / run command). If prereqs are missing it **degrades to `--focus coverage`** static analysis (reports the blocker; never silent-fails).
- `/vp-qa --target <id>` — override adapter detection (claude-code / cursor-agent / antigravity / codex / copilot)
</context>

<process>
### Phase 1: Research (REQUIRED — do not skip)

Before writing any agent file, understand the project:

1. Read `.viepilot/PROJECT-META.md`, `STACKS.md`, `PROJECT-CONTEXT.md` (silent if missing)
2. Detect stack from: `package.json` / `pom.xml` / `go.mod` / `requirements.txt` / `Gemfile`
3. List backend directory structure: find `src/` `app/` `lib/` `services/` `api/` `routes/` (whichever exist)
4. Read 5-10 representative source files from backend dirs (understand patterns)
5. Count file sizes, service count, DB layer presence
6. Read `.viepilot/requests/` to list known existing issues (avoid duplicate reporting)
7. Read `agents/qa-templates/rules/{stack}.md` from project lib (if exists) for stack-specific patterns
8. **Spec-source discovery for feature coverage (ENH-113)**: gather the project's *declared* feature
   set from `.viepilot/PROJECT-CONTEXT.md` (domains, `## Skills`, scope), `.viepilot/ROADMAP.md`
   (planned features + status), `.viepilot/ARCHITECTURE.md` (components + admin/content/user-data
   sections), `docs/brainstorm/session-*.md`, and architect `feature-map.html` / `notes.md ## features`
   (whichever exist). List sources found vs absent — drives the `qa-feature-coverage-scanner` and its
   greenfield fallback. Keep token-light: record paths, don't inline contents.
9. **Role × Feature × Screen matrix (ENH-114, `--live` only)**: build rows `(role, feature, screen,
   expected)` for every user role — from the spec sources above + `notes.md ## use_cases` (ENH-028
   actors) + `## admin` (ENH-063 roles). This matrix is the authoritative live-test plan. Also detect
   `baseUrl` / `runCommand` (from `package.json` `dev`/`start` scripts + common ports; AUQ-ask once if
   undetectable) so the live-driver can reach the app.

**Build research summary:**
```
- projectName: string
- stack: (node / python / java / go / ruby / etc.)
- stackVersion: string (from version file)
- backendDirs: string[] (actual dirs found in project)
- detectedPatterns: string[] (anti-patterns spotted in sampling)
- recommendedDomains: string[] (scan areas relevant to this project)
- recommendedAgentCount: number (2 for small, 4-5 for large/complex)
- knownIssues: string[] (from .viepilot/requests/, avoid duplicates)
- specSources: string[] (declared-feature sources found — PROJECT-CONTEXT/ROADMAP/ARCHITECTURE/brainstorm/feature-map; empty ⇒ greenfield/thin-spec → coverage scanner runs fallback mode)
- roleMatrix: array (ENH-114 --live) — rows { role, feature, screen, expected }
- baseUrl / runCommand: string (ENH-114 --live) — how to reach the running app (detected or AUQ-asked)
```

### Phase 2: Determine Output Location

Use `lib/qa-router.cjs` to resolve adapter-specific output paths:
```
- claude-code  → .claude/agents/
- cursor-agent → .cursor/rules/
- codex        → AGENTS.md (single file, append mode)
- antigravity  → .agents/skills/
- copilot      → .github/agents/
```

Call or reference lib/qa-router.cjs to map the current adapter to output directory.

### Phase 3: Generate Agent Files (LLM writes directly)

Based on research summary, generate agent content and write using Write tool.

**For claude-code (multi-agent):**
- Write `qa-orchestrator.md` — orchestrator that fan-outs to specialist subagents
  - Name: "vp-qa orchestrator"
  - Description: "Coordinate QA scanning across multiple domains for {projectName}"
  - Model: claude-opus (or latest)
  - maxTurns: 30
  - Knows about backend dirs found, stack version, patterns to look for
  - References each specialist subagent by name (incl. `qa-feature-coverage-scanner`)
  - Receives domain reports, groups defect findings by severity
  - **Feature Gaps group (ENH-113)**: keeps `qa-feature-coverage-scanner` output in a SEPARATE
    "Feature Gaps" group, distinct from severity-grouped bugs (one orchestrator, one AUQ session)
  - Creates `.viepilot/requests/BUG-{N}.md` for accepted defects; `FEAT-{N}.md` / `ENH-{N}.md` for
    accepted feature gaps (ENH-113 — see behavior section for scoring + classification)
  - Uses AskUserQuestion for critical/high severity group acceptance (defects) AND per importance
    group for feature gaps (AUQ **headers ≤12 chars** — BUG-033/ENH-105)
  - Writes `.viepilot/qa/feature-coverage-report.md` when the coverage scanner ran
  - Final AskUserQuestion: "N issues + M feature gaps logged. Run /vp-evolve to plan?"

- Write `qa-{domain}-scanner.md` for each recommended domain (e.g., qa-security-scanner, qa-performance-scanner)
  - Name: "vp-qa {domain} scanner"
  - Description: "Scan {projectName} for {domain} concerns"
  - Model: claude-haiku-4 (efficient)
  - maxTurns: 15
  - Content references ACTUAL backend dirs found, ACTUAL patterns to look for
  - Produces structured report of issues found in that domain
  - Returns report to orchestrator

- Write `qa-feature-coverage-scanner.md` — **product completeness / spec-gap auditor (ENH-113)**
  - Name: "vp-qa feature coverage scanner"
  - Description: "Audit {projectName} product completeness vs spec (feature gaps, not defects)"
  - Model: claude-opus (judgment-heavy gap analysis — unlike the haiku domain scanners)
  - maxTurns: 20
  - **Bidirectional gap analysis:**
    1. **spec→code coverage matrix** — for each *declared* feature (from `specSources`), classify
       `implemented | partial | missing` with file evidence (or absence) from `backendDirs`.
    2. **out-of-spec checklist** — important features standard for the project's domains that are
       absent from BOTH spec and code. Governance baseline reuses the framework surfaces:
       **admin (ENH-063)**: authn/authz, RBAC/role hierarchy, audit log, billing/subscription,
       rate-limit/quota, monitoring/health, alerts; **content (ENH-065)**: content types, lifecycle
       states, creator permissions, taxonomy, media, SEO; **user-data (ENH-066)**: profile fields,
       privacy rights (export/erasure), session/device mgmt, 2FA, consent log — plus per-domain norms.
  - **Greenfield / thin-spec fallback**: if `specSources` is empty/thin, skip the spec→code direction
    and run ONLY the out-of-spec checklist; the report MUST state it ran in **fallback mode**; never
    return a silent-empty result; do NOT hallucinate an inferred spec.
  - **Dedupe**: skip any gap already present in `.viepilot/requests/` or `.viepilot/ROADMAP.md`.
  - Produces a structured **gap list** — each item `{ title, kind: feature|enhancement, domain,
    source: spec-gap|out-of-spec, importance, rationale, evidence }` — returned to the orchestrator
    (importance scoring + request creation handled by the orchestrator, see its behavior section).

- Each file has correct YAML frontmatter (name, description, model, maxTurns, tools)
- Content NOT generic — references specific dirs, patterns, concerns found during Phase 1

**For other adapters (single-file mode):**
- Write one combined file with all domain instructions
- Sequential scanning procedure using that adapter's shell tools
- **Include the feature-coverage audit (ENH-113)** as a section in the combined file — same
  bidirectional analysis + governance baseline + greenfield fallback as the claude-code scanner,
  run sequentially.
- Same vp-request output format (BUG-{N}.md for defects; FEAT-{N}/ENH-{N} for feature gaps — ENH-113)
- Single AskUserQuestion for all issues + feature gaps found at end

### Phase 3.5: Live Role-Based Visual QA generation (ENH-114 — `--live` mode only)

Active **only** when `/vp-qa --live` (or `--e2e`) is used. Generates a runtime QA team that exercises
the *running* app per role and judges the real UI. Composes with ENH-113 (adds a role axis).

**1. Prerequisite gate + graceful degradation**
- Require `vercel-labs/agent-browser` installed AND a runnable app (`baseUrl` / `runCommand` from
  research). If either is missing → **do not fail silently**: report the specific blocker and
  **degrade to `--focus coverage`** (ENH-113 static coverage), stating clearly it ran static-only.

**2. role-seeder step** — seed one user per role so the driver can log in as each:
- **Auto-detect, seed-script-first**: (1) existing seed/fixture script (`npm run seed`,
  `prisma db seed`, Rails `db:seed`, factory libs) → (2) public signup / admin API → (3) direct DB
  insert (last resort).
- **Idempotent** (upsert), **namespaced** (`qa+{role}@example.test`), **reversible** (record seeded
  IDs → cleanup step), **non-prod guarded** (refuse if baseUrl/env looks like production).
- Records the seeded identity per role for the live-driver.

**3. live-driver** — **reuse** `agents/claude-code/browser-audit-agent.md` + `lib/audit/browser-runner.cjs`
(navigate / login / screenshot ops — do NOT rebuild browser infra). For each seeded role:
- Log in as that role → walk that role's `roleMatrix` rows → capture a screenshot per screen/state to
  `.viepilot/qa/screenshots/{role}/{screen}.png`.
- Record functional pass/fail per row (route reachable, form submits, nav works).
- Honor a **screenshot budget cap** (default cap for large matrices; **log what was skipped** — no
  silent truncation).

**4. `qa-design-reviewer` agent** — the Design-QA reviewer (multimodal):
- Name: "vp-qa design reviewer"; Model: claude-opus (reads the captured screenshots).
- **Per-screen**: (a) is this role's intended feature visible/usable (vs the matrix)? (b) score
  against the **vp-design ENH-102 aesthetic framework — 4 dimensions** (hierarchy, consistency,
  spacing/rhythm, brand/typography); (c) obvious UX defects (overflow, contrast, misalignment,
  empty/broken states).
- **Cross-screen / cross-role**: design-system consistency across screens and between roles (spacing,
  typography, component reuse, nav patterns) — catches drift a per-screen pass misses.
- Emits **UI-adjustment proposals**, each carrying the **screenshot path as evidence** + a concrete
  recommendation. Returns to the orchestrator (scoring + request creation — see behavior section).

**Combined single-file mode (non-claude-code adapters):** append the `--live` procedure (seed →
drive → screenshot → design-review) to the combined file — same steps, run sequentially — consistent
with the existing combined-mode pattern.

### Phase 4: AskUserQuestion (claude-code only)

After writing files, show what was generated:
```
Generated {N} agent files in {output_dir}:
  - qa-orchestrator.md (coordinates scanning across domains)
  - qa-security-scanner.md (scans for security concerns)
  - qa-performance-scanner.md (scans for performance concerns)
  ... (other domain files)
```

**AskUserQuestion:**
```
question: "What would you like to do next?"
options:
  - label: "Run QA scan now"
    description: "Invoke qa-orchestrator immediately to start scanning"
  - label: "Done for now"
    description: "Exit — agents are ready in {output_dir}"
```

**On selection:**
- "Run QA scan now": invoke qa-orchestrator immediately (or equivalent for non-claude-code adapters)
- "Done for now": print "QA agents ready in {output_dir}. Run qa-orchestrator to start scanning." and exit

**Text fallback (Cursor/Codex/Copilot/Antigravity):**
```
QA agents generated in {output_dir}

Next actions:
  1. Review generated agent files
  2. Run qa-orchestrator to start the QA scan
  3. Adjust scanning domains as needed
```

### Generated qa-orchestrator Behavior (in target project, when run)

When user runs the generated `qa-orchestrator`:
1. Fan out to specialist subagents (claude-code) or scan sequentially (others) — incl. `qa-feature-coverage-scanner`
2. Collect issue reports from each domain scanner + the feature-coverage gap list
3. Group **defect** issues by severity (critical/high/medium/low)
4. For critical/high: AskUserQuestion per group (accept → create vp-request BUG-{N}, decline → skip)
5. For medium/low: one batch confirm
6. Create `.viepilot/requests/BUG-{N}.md` for each accepted issue

**Feature Gaps handling (ENH-113) — separate group, same orchestrator/AUQ session:**
7. Score each feature gap by **importance = impact (core/domain/governance/nice-to-have) × spec-status
   (declared-missing > out-of-spec-standard > optional)** → critical/high/medium/low. Suggested matrix:
   - declared-missing + core → **critical**
   - declared-missing + domain/governance → **high**
   - out-of-spec-standard + governance → **high**
   - out-of-spec-standard + domain → **medium**
   - optional / nice-to-have → **low**
8. AskUserQuestion per importance group (accept/decline; **headers ≤12 chars** — BUG-033/ENH-105).
   Text fallback (numbered list) on non-claude-code adapters.
9. On accept, classify by kind: wholly new capability → `.viepilot/requests/FEAT-{N}.md`; missing part
   of an existing feature → `.viepilot/requests/ENH-{N}.md` (standard vp-request schema — NOT BUG-{N}).
   Dedupe against existing `.viepilot/requests/` + ROADMAP before creating.
10. Write `.viepilot/qa/feature-coverage-report.md` — spec→code coverage matrix + gap list + (if it
    ran without specs) an explicit **fallback-mode** note + an optional one-line coverage score.
11. Final AskUserQuestion: "N issues + M feature gaps logged. Run /vp-evolve to plan?" → routes to
    `/vp-evolve` → `/vp-auto` (same lane, ENH-021).

**Live QA handling (ENH-114) — `--live` mode, aggregated in the same orchestrator/AUQ session:**
12. Collect the live-driver functional results + `qa-design-reviewer` verdicts (per-screen + cross-screen).
13. **Functional failures** (route unreachable, form/nav broken) → group by severity → AUQ →
    `.viepilot/requests/BUG-{N}.md` (same defect flow as steps 3–6).
14. **UI-adjustment proposals** → AUQ accept/decline per importance group (**headers ≤12 chars**);
    on accept classify: a **missing role-screen** (feature absent for a role) → `FEAT-{N}.md`; a fix to
    an existing screen → `ENH-{N}.md`. Dedupe against `.viepilot/requests/` + ROADMAP.
15. Write **`.viepilot/qa/live-qa-report.md`** — per-role coverage matrix + screenshot links +
    Design-QA verdicts (per-screen + cross-screen) + a fallback-mode note if it degraded to static.
16. Final AskUserQuestion: "N issues + M UI proposals logged. Run /vp-evolve to plan?" → `/vp-evolve` → `/vp-auto`.

**Boundary — `vp-qa --live` vs `vp-audit --visual` (ENH-114):** `vp-audit --visual` audits a running
app for **regression vs a saved baseline** (visual diff, a11y). `vp-qa --live` judges **correctness** —
is each role's intended feature present/usable and is the UI good per the vp-design ENH-102 aesthetic
framework — with **no baseline**. Both reuse `browser-audit-agent` / `browser-runner.cjs`; they do not duplicate it.
</process>

## Adapter Compatibility

### AskUserQuestion Tool (ENH-059)
After generation, use `AskUserQuestion` on Claude Code (terminal) for Phase 4 prompt.

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` — **REQUIRED** at end of Phase 3 | Preload schema via ToolSearch first |
| Cursor / Codex / Copilot / Antigravity | ❌ Text fallback | Plain numbered list for next actions |

**Claude Code (terminal) — AUQ preload required (ENH-059):**
Before the first interactive prompt (Phase 4), call `ToolSearch` with `query: "select:AskUserQuestion"` to load the deferred tool schema. Only after `ToolSearch` succeeds can `AskUserQuestion` be invoked. If `ToolSearch` returns an error, fall back to plain-text numbered list for that session.

<success_criteria>
- [ ] Phase 1 research completed (read project structure, stack, patterns)
- [ ] Phase 2 output location determined via lib/qa-router.cjs
- [ ] Phase 3 agent files written using Write tool (content tailored to research output)
- [ ] Phase 4 AskUserQuestion shown (claude-code) or text fallback (others)
- [ ] Generated agents ready to execute qa-orchestrator
- [ ] Generated qa-orchestrator creates .viepilot/requests/BUG-{N}.md for found issues
- [ ] Generated team includes `qa-feature-coverage-scanner`; orchestrator creates FEAT-{N}/ENH-{N} for accepted feature gaps and writes `.viepilot/qa/feature-coverage-report.md` (ENH-113)
- [ ] `--live` mode (ENH-114): seeds roles + drives app (reusing browser-audit-agent) + `qa-design-reviewer`; orchestrator emits BUG (functional) / ENH-FEAT (UI) and writes `.viepilot/qa/live-qa-report.md`; degrades to static coverage if prereqs missing
</success_criteria>
