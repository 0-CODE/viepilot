# ViePilot - Roadmap

## Milestone: v3 Compiler Runtime Refactor

### Overview

- **Version target**: `3.0.0-alpha`
- **Goal**: Convert ViePilot from prose-driven runtime behavior into a compiler-driven, state-machine-first execution architecture while preserving the command journey
- **Phases**: 4
- **Status**: Not Started

### Phase 21: Planning Source and Compiler Boundary

**Goal**: Define the v3 planning source, canonical runtime artifacts, and ownership boundaries before changing runtime behavior.
**Estimated Tasks**: 3
**Dependencies**: None

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 21.1 | Define planning source schema inventory and field ownership | Structured source covers roadmap, task, and runtime input needs without prose-only gaps | L |
| 21.2 | Define contracts for `runtime-state.json`, `execution-graph.json`, and `active-packet.json` | Artifact purposes, fields, and lifecycle are documented and non-overlapping | L |
| 21.3 | Map v2 artifact ownership to v3 compiler outputs and compatibility projections | Existing `.viepilot` files are classified as canonical, projection, or migration-only | M |

**Verification**:
- [ ] Artifact inventory reviewed against brainstorm thesis
- [ ] Canonical vs projection ownership is explicit for every current `.viepilot` file
- [ ] No unresolved overlap remains between runtime-state and projection files

### Phase 22: Compiler Pipeline and Projection Rendering

**Goal**: Build the two-stage crystallize pipeline that extracts, normalizes, compiles, and projects v3 artifacts.
**Estimated Tasks**: 3
**Dependencies**: Phase 21

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 22.1 | Implement Stage A extraction and normalization contract | Reviewable extraction bundle is stable and reusable by compile stage | L |
| 22.2 | Implement Stage B compile flow for runtime artifacts | Compiler emits runtime-state, execution-graph, and active-packet artifacts deterministically | XL |
| 22.3 | Render compatibility projections for tracker, roadmap, and handoff views | Human-facing files can be regenerated from canonical structured data | L |

**Verification**:
- [ ] Extraction stage can stop before generation without losing decisions
- [ ] Compile stage produces all required runtime artifacts from one planning source
- [ ] Projection refresh is deterministic from compiled state

### Phase 23: Runtime Executor and Host Adapter Refactor

**Goal**: Narrow `/vp-auto` into a runtime executor that reads structured state only and isolates host-specific behavior behind adapters.
**Estimated Tasks**: 3
**Dependencies**: Phase 22

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 23.1 | Refactor `vp-auto` read policy to runtime artifacts only | Normal execution no longer requires planning prose fallback | XL |
| 23.2 | Encode recovery and control-point state in canonical runtime state | Runtime transitions are explicit and projection-safe | L |
| 23.3 | Define Claude Code and Cursor adapter boundaries | Semantic workflow stays shared while host capability differences are isolated | M |

**Verification**:
- [ ] `/vp-auto` startup path lists only runtime artifacts plus targeted task context
- [ ] Control-point and recovery state can be projected without adding duplicate truth
- [ ] Host-specific instructions are not embedded into semantic workflow logic

### Phase 24: Migration and Adaptive Front Door

**Goal**: Complete the transition plan with one-shot migration from v2 and a smarter request/front-door layer.
**Estimated Tasks**: 3
**Dependencies**: Phase 23

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 24.1 | Design and implement one-shot migration from v2 artifacts | Existing projects can move to v3 without long-lived dual runtime support | XL |
| 24.2 | Rework `vp-request` into an adaptive intent router | Fuzzy input maps to the right planning or execution path with explicit confidence handling | L |
| 24.3 | Rework `vp-evolve` into a planning workspace with delta preview | Planning changes can be previewed for impact before compile or execution | L |

**Verification**:
- [ ] Migration path is one-shot and auditable
- [ ] Adaptive routing can distinguish planning, execution, and migration intents
- [ ] `vp-evolve` can preview planning deltas without changing runtime truth silently

## Progress Summary

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 21. Planning Source and Compiler Boundary | not_started | 3 | 0 | 0% |
| 22. Compiler Pipeline and Projection Rendering | not_started | 3 | 0 | 0% |
| 23. Runtime Executor and Host Adapter Refactor | not_started | 3 | 0 | 0% |
| 24. Migration and Adaptive Front Door | not_started | 3 | 0 | 0% |

## Post-MVP / Product horizon

> Mandatory horizon block derived from the approved brainstorm.

### Horizon mode

Multi-release roadmap. Deferred epics are explicit and tied to the v3 MVP boundary.

### Post-MVP themes (epic-level)

- One-shot v2 to v3 migration after Phase 24 proves canonical artifact ownership.
- Dedicated compiler module if the embedded Stage B compile path becomes too coupled to crystallize.
- Adaptive `vp-request` routing refinement after the first stable v3 runtime slice.
- Planning workspace evolution for `vp-evolve` with richer delta and impact visualization.

### Future / exploratory

- Final schema depth for `execution-graph.json`
- Final ownership cadence for `active-packet.json`
- Projection rendering strategy: eager versus lazy

### Deferred capabilities (from MVP)

- Full production-grade migration tooling depends on Phases 21-24.
- Advanced adapter ergonomics depend on a stable runtime-state contract.
- Projection optimization work depends on the initial compiler output shape.

### Non-goals for MVP (reference)

- No long-lived dual runtime
- No server-first orchestration layer
- No prose fallback as routine runtime behavior

## Notes

- Created: 2026-04-04
- Last Updated: 2026-04-04
- Horizon and `PROJECT-CONTEXT.md` must stay synchronized.
