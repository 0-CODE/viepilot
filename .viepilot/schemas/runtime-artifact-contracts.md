# Runtime Artifact Contracts

## Artifact Set

| Artifact | Canonical path | Lifecycle owner | Primary role |
|----------|----------------|-----------------|--------------|
| `runtime-state.json` | `.viepilot/runtime-state.json` | runtime executor after compile initializes it | Mutable execution truth for the current run |
| `execution-graph.json` | `.viepilot/execution-graph.json` | compiler/planning boundary | Immutable task-level topology and dependency order |
| `active-packet.json` | `.viepilot/active-packet.json` | compiler or packet-shaping layer derived from planning + graph + runtime position | Narrow current-task execution bundle |

## Ownership rules

- Runtime artifacts exist so `/vp-auto` can execute without rereading planning prose.
- `runtime-state.json` is the only runtime artifact that owns mutable status, recovery counters, control-point state, and projection freshness.
- `execution-graph.json` owns dependency topology and packet issuance strategy only. It does not own mutable execution status.
- `active-packet.json` owns the active task payload only. It can reference runtime and graph artifacts, but it must not duplicate global executor state or whole-project topology.
- Projection files (`TRACKER.md`, `ROADMAP.md`, `HANDOFF.json`) remain derived compatibility views, not canonical runtime truth.

## Non-overlap guard

| Concern | Canonical artifact | Must not live in |
|---------|--------------------|------------------|
| Current executor mode, current phase/task, recovery attempts, control-point state | `runtime-state.json` | `execution-graph.json`, `active-packet.json`, projections |
| Phase/task dependency graph and allowed ordering | `execution-graph.json` | `runtime-state.json`, projections |
| Current task objective, scoped file reads/writes, verification commands, best-practice checklist | `active-packet.json` | `runtime-state.json`, `execution-graph.json`, projections |
| Human-readable progress and compatibility exports | projections | runtime artifacts as canonical ownership |

## Lifecycle

1. `/vp-crystallize` Stage B compiles `planning-source.json` into the runtime artifact set.
2. `execution-graph.json` remains stable for a given compile output unless planning source changes.
3. `runtime-state.json` advances as `/vp-auto` executes, recovers, pauses, or hits control points.
4. `active-packet.json` is emitted per task for the currently actionable packet and can be replaced when the executor advances or retries.
5. Projection refresh renders markdown and compatibility files from canonical state instead of mutating runtime ownership.

## Initial v3 decisions

- Graph granularity: `task` level for the first contract.
- Packet strategy: `per-task` for the first contract.
- `compat-map.json` remains a compiler output, but its ownership mapping is deferred to Task 21.3.
