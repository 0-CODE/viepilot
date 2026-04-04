# Planning Source Inventory

## Artifact

- **Canonical artifact**: `.viepilot/planning-source.json`
- **Schema**: `.viepilot/schemas/planning-source.schema.json`
- **Lifecycle owner**: compiler/planning boundary (`/vp-crystallize` Stage B in the current v3 plan)
- **Consumers**: compiler stage, Phase 21 planning tasks, later projection/runtime contract tasks

## Ownership rules

- Planning source is the canonical upstream planning document until compile emits runtime artifacts.
- Runtime artifacts own execution truth after compile. Planning source does not become a live runtime dependency for `/vp-auto`.
- Projection files such as `TRACKER.md`, `ROADMAP.md`, and `HANDOFF.json` remain derived views or compatibility exports.

## Field inventory

| Section | Purpose | Canonical owner | Downstream consumers | Notes |
|---------|---------|-----------------|----------------------|-------|
| `artifact.kind` / `artifact.version` / `artifact.path` / `artifact.generated_at` | Identify schema version and canonical file path | Planning source artifact | Compiler, migration tooling, validation | `artifact.path` is fixed at `.viepilot/planning-source.json` to prevent alias drift |
| `milestone.*` | Define milestone identity, baseline release, target version, and planning status | Planning source artifact | Compiler, roadmap projection, tracker projection | Replaces prose-only milestone headers as canonical planning input |
| `source_session.*` | Preserve lineage back to brainstorm and other decision sources | Planning source artifact | Audit trail, compile review, migration tooling | Runtime should not reread these sources after compile |
| `planning_inputs.thesis` | Store normalized v3 thesis / current milestone thesis | Planning source artifact | Compiler, projection rendering, review gates | Human-readable but structured as a single canonical field |
| `planning_inputs.constraints[]` | Capture must-have / anti-goal constraints needed during compile | Planning source artifact | Compiler, packet shaping, migration planning | Avoid duplicate copies across roadmap/task docs once compiler exists |
| `planning_inputs.open_questions[]` | Record unresolved items that affect future planning | Planning source artifact | Review gates, horizon projection, later planning tasks | Open questions are planning-only, not runtime state |
| `phase_inventory[]` | Canonical phase list, goals, dependencies, and task planning contracts | Planning source artifact | Compiler, execution-graph generation, roadmap/task projections | Replaces prose-only roadmap parsing as the compile input |
| `phase_inventory[].tasks[].acceptance_criteria[]` | Normalize what success means for each task | Planning source artifact | Compiler, active-packet generation, projection rendering | Runtime contract details stay deferred to Task 21.2 |
| `phase_inventory[].tasks[].write_scope[]` | Declare allowed deliverable paths for task execution | Planning source artifact | Compiler, active-packet generation, execution guardrails | This feeds runtime packet shaping later |
| `phase_inventory[].tasks[].verification[]` | Declare required verification commands or checks | Planning source artifact | Compiler, active-packet generation, projection rendering | Keeps verification policy attached to task planning truth |
| `compiler_directives.runtime_artifacts[]` | Enumerate artifact outputs the compiler must emit | Planning source artifact | Compiler, Task 21.2 contract work | Artifact field schemas remain out of scope for 21.1 |
| `compiler_directives.compile_policy` | Express current compile mode and boundary | Planning source artifact | Compiler, architecture docs | Current value reflects Stage B compile/project ownership |
| `compiler_directives.ownership_rules[]` | Capture non-negotiable ownership constraints | Planning source artifact | Compiler, migration planning, docs sync | Includes singular source-of-truth rules |
| `projection_requirements.*` | Define which human-facing views must be rendered from canonical state | Planning source artifact | Projection renderer, compatibility exports | Projection targets are derived outputs only |

## Deferred to later tasks

- `runtime-state.json`, `execution-graph.json`, and `active-packet.json` field-level contracts: Task 21.2
- v2 artifact demotion / compatibility mapping: Task 21.3
- actual compiler implementation and projection rendering: Phase 22
