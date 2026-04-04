# ViePilot - Project Context

*Profile binding not configured (`META.md` or global profile file missing).*

<domain_knowledge>
## What This System Does

ViePilot is a local-first workflow framework for AI-assisted software delivery. The current shipping line is v2.2.3, but the active crystallize output now defines a v3 refactor in which planning artifacts are compiled into structured runtime truth instead of being reread as prose during `/vp-auto`.

## Key Concepts

| Term | Definition |
|------|------------|
| Compiler layer | Stage that turns brainstorm and planning outputs into runtime-ready artifacts |
| Runtime executor | Narrow execution loop that reads structured runtime artifacts only |
| Runtime truth | Canonical machine-readable state replacing prose inference during execution |
| Projection artifact | Human-facing markdown view rendered from canonical structured state |
| `planning-source.json` | Canonical upstream planning artifact compiled from brainstorm and planning inputs before runtime artifacts are emitted |
| `runtime-state.json` | Canonical mutable executor state: position, recovery, control-point, and projection-sync truth |
| `execution-graph.json` | Canonical compile-time task dependency graph and packet issuance strategy |
| `active-packet.json` | Canonical current-task packet delivered to the runtime executor with scoped reads, writes, and verification |

## Business Rules

1. Preserve the visible user journey: `/vp-request -> /vp-brainstorm -> /vp-crystallize -> /vp-auto`.
2. Runtime must not depend on rereading brainstorm prose after compile succeeds.
3. Planning and runtime concerns stay separated: brainstorm discovers, crystallize compiles, auto executes.
4. Local-first remains a hard constraint: no mandatory server or network control plane.
5. The v3 effort must reduce token waste, state drift, and host-specific fragility for Claude Code and Cursor.

## Data Relationships

```text
brainstorm sessions
  -> extraction / normalization
  -> planning-source.json
  -> compiler outputs
      -> runtime-state.json
      -> execution-graph.json
      -> active-packet.json
      -> human projections (TRACKER, ROADMAP, HANDOFF-compatible views)
```
</domain_knowledge>

<product_vision>
## Product vision & phased scope

> Aligns with `ROADMAP.md -> Post-MVP / Product horizon` and the approved 2026-04-04 brainstorm session.

### MVP boundary (ship first)

- Define a v3 refactor thesis that keeps the existing command journey intact.
- Move runtime execution to a state-machine-first, compiler-driven model.
- Compile enough structured runtime truth that `/vp-auto` no longer needs planning prose.
- Prioritize solving token waste, workflow duplication, state drift, and host-limit pain for Claude Code and Cursor.

### Post-MVP themes

- One-shot migration from v2 artifacts into v3 runtime/compiler artifacts.
- Dedicated compiler layer for extraction, normalization, and project compilation.
- Adaptive `vp-request` front door for fuzzy intent routing.
- Two-stage `vp-crystallize` pipeline with explicit extract/review then compile/project behavior.
- `vp-evolve` as a planning workspace with delta authoring and impact preview.

### Future / exploratory north star

- Final schema and granularity for `execution-graph.json`.
- Final ownership model for `active-packet.json` generation.
- Decide whether compile remains inside `vp-crystallize` Stage B or becomes its own module.
- Finalize eager vs lazy projection rendering.

### Anti-goals & explicit non-scope

- No long-lived dual runtime between v2 and v3.
- No server-first redesign.
- No superficial rewrite that preserves prose-heavy execution inference.
</product_vision>

<conventions>
## Naming Conventions

### Project Specific

- Structured runtime artifacts: `kebab-case.json`
- Canonical planning artifact: `planning-source.json`
- Human-facing projections: existing `.md` files remain stable names where possible
- Compiler phases: zero-padded directory prefixes (`21-`, `22-`, ...)
- Stack cache ids: lowercase kebab-case (`nodejs-commonjs`, `clack-prompts`)

## Code Patterns

### Preferred Patterns

- Explicit compile boundaries between discovery, normalization, and execution
- Machine-readable schemas before markdown explanations
- Deterministic phase/task ownership and write scope
- Small adapter surfaces for host-specific capabilities

### Anti-patterns to Avoid

- Runtime steps that "remember" architecture from earlier turns instead of loading structured state
- Duplicated truth across roadmap, tracker, handoff, and task files
- Eager migration of CommonJS CLI code without a separate compatibility decision
</conventions>

<constraints>
## Must Have

- Backward-compatible command journey for existing users
- Local-first execution and file-based state
- Official-doc alignment for any Node/Jest/npm/Clack behavior change
- One-shot migration planning before deleting v2-compatible projections

## Must NOT

- Introduce network service assumptions into the core runtime
- Make `/vp-auto` depend on prose fallback as a normal path
- Treat projections as canonical runtime state

## Performance Requirements

- Compiler output should reduce repeated context loading during execution
- Runtime read set should be bounded to active packet + runtime state + targeted task context
- Runtime artifacts must keep singular ownership boundaries so graph topology, mutable state, and task packet payload do not drift into each other
- Projection refresh should be deterministic and cheap enough to run after compile or phase transitions

## Security Requirements

- No secrets in profiles, artifacts, or generated schemas
- Host adapters must not widen write scope implicitly
- Migration flow must preserve auditability of old state
</constraints>

<external_dependencies>
## Third-party Services

| Service | Purpose | Documentation |
|---------|---------|---------------|
| GitHub | Source hosting, issues, releases | https://github.com/0-CODE/viepilot |
| Git | Persistence and recovery backbone | https://git-scm.com/doc |

## Libraries & Frameworks

| Library | Version | Purpose |
|---------|---------|---------|
| Node.js CommonJS | current repo runtime | CLI execution and local utilities |
| npm package.json | current repo packaging | scripts, publish config, metadata |
| Jest | `^30.3.0` | contract and integration tests |
| `@clack/prompts` | `^0.11.0` | interactive CLI prompts |
</external_dependencies>
