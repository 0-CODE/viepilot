# Phase 45 — ENH-029: Architect Mode — C4/Sequence/Deployment/APIs pages

## Goal
Mở rộng Architect Design Mode workspace thêm 3 trang mới và 1 enhancement cho trang hiện tại:
- **Enhance** `architecture.html` → thêm C4 Context diagram + External Systems table
- **New** `sequence-diagram.html` → per-scenario detailed sequences (phân biệt rõ với data-flow.html)
- **New** `deployment.html` → infrastructure, environments, deployment pipeline
- **New** `apis.html` → Service API listing & design (per-service endpoint tables)

## Background
ENH-029 (Phase 45) builds trên FEAT-011 (Phase 43) + ENH-027/028 (Phase 44).
Sau Phase 45, workspace đạt **12 pages** — comprehensive architecture workspace.

## Conflict resolution (documented)
- `architecture.html` (components) vs System diagram: **merge** C4Context vào architecture.html thay vì trang trùng lặp.
- `sequence-diagram.html` vs `data-flow.html`: phân ranh rõ — data-flow = high-level service flows; sequence = per-scenario step-by-step detail.

## Tasks

### Task 45.1 — Enhance templates/architect/architecture.html: C4 Context + External Systems
**File**: `templates/architect/architecture.html`

**Changes**:
- Thêm card section **C4 Context Diagram** (trên System Diagram hiện có):
  ```html
  <div class="card">
    <h2>C4 Context Diagram</h2>
    <div class="mermaid-wrap">
      <div class="mermaid">
  C4Context
    Person(user, "User", "End user of the system")
    System(system, "{Project}", "Core system")
    System_Ext(ext1, "{External System}", "Third-party service")
    Rel(user, system, "Uses")
    Rel(system, ext1, "Calls API")
      </div>
    </div>
  </div>
  ```
- Thêm table **External Systems** sau C4 diagram:
  (System | Type | Description | Integration method | Owned by | Notes)

**Acceptance**:
- [ ] C4Context section present with Mermaid block
- [ ] External Systems table with 6 columns
- [ ] Existing System Diagram + Components table preserved

### Task 45.2 — New templates/architect/sequence-diagram.html
**File**: `templates/architect/sequence-diagram.html` (new)

**Content**:
- Sidebar nav: includes all pages (including erd, user-use-cases from Phase 44)
- Header note: "Per-scenario detailed sequences. For high-level service/event flows → see data-flow.html"
- Section: **Scenario Index** table (ID | Scenario | Actors | Trigger | Related use case | Notes)
- Default 2 placeholder scenario sections:
  - `### Scenario: User Login Flow` + sequenceDiagram
  - `### Scenario: Create {Entity} Flow` + sequenceDiagram
- Each scenario: heading + Mermaid `sequenceDiagram` block + brief description
- Dark/light toggle + Mermaid script

**Acceptance**:
- [ ] File exists with Scenario Index table + 2 placeholder scenarios
- [ ] Differentiation note from data-flow.html present
- [ ] Mermaid sequenceDiagram renders

### Task 45.3 — New templates/architect/deployment.html
**File**: `templates/architect/deployment.html` (new)

**Content**:
- Mermaid `graph TD` placeholder: dev → staging → prod environments with infra components (LB, App, DB, Cache, CDN)
- Table: **Environments** (Env | URL/Domain | Purpose | Services deployed | Config notes)
- Table: **Infrastructure Components** (Component | Type | Provider | Sizing | Notes)
- Section: **Deployment Pipeline** — 4-stage `flowchart LR`: Code → Build → Test → Deploy
- Dark/light toggle + Mermaid script

**Acceptance**:
- [ ] File exists with infra diagram + 2 tables + pipeline section
- [ ] Mermaid renders correctly

### Task 45.4 — New templates/architect/apis.html
**File**: `templates/architect/apis.html` (new)

**Content**:
- Section per service: `<h2>{Service Name}</h2>` với API endpoint table
- Table: **Endpoints** (Method | Path | Auth? | Request Body (schema) | Response (schema) | Status codes | Notes)
  - Method column: color-coded badges: GET (green), POST (blue), PUT (yellow), DELETE (red), PATCH (orange)
- Table: **API Design Decisions** (Decision | Pattern chosen | Rationale)
- Section: **API Style** — badge row: REST / GraphQL / gRPC / WebSocket (highlight chosen)
- No mandatory Mermaid — optional `classDiagram` note for complex schemas
- Dark/light toggle

**Acceptance**:
- [ ] File exists with per-service structure + endpoint table + design decisions
- [ ] Method badge CSS classes in style.css (or inline)
- [ ] API Style section present

### Task 45.5 — Update sidebar nav in ALL existing pages
**Files**: All 9 existing pages (after Phase 44: index, architecture, data-flow, decisions, tech-stack, tech-notes, feature-map, erd, user-use-cases) + `sequence-diagram.html`, `deployment.html`, `apis.html` (add cross-links)

**Change**: Each page's sidebar `<ul>` must contain all 12 nav items:
- 🏠 Hub
- 🏗️ Architecture
- 🔄 Data Flow
- 📋 Decisions (ADR)
- 🛠️ Tech Stack
- 📝 Tech Notes
- 🗺️ Feature Map
- 🗄️ ERD
- 👤 Use Cases
- 🎬 Sequence
- 🚀 Deployment
- 🔌 APIs

**Acceptance**:
- [ ] All 12 pages have full 12-item sidebar nav
- [ ] Correct `class="active"` on current page link

### Task 45.6 — Update templates/architect/index.html: 4 new hub cards
**File**: `templates/architect/index.html`

**Changes**:
- Add 3 new cards (sequence, deployment, apis) to `.cols-2` grid
- Update architecture card subtitle to mention C4 Context

**Acceptance**:
- [ ] 3 new cards present
- [ ] Architecture card updated

### Task 45.7 — Add HTTP method badge CSS to style.css
**File**: `templates/architect/style.css`

**Changes**: Add method badge classes:
```css
.method-get    { background: #16a34a20; color: #4ade80; }
.method-post   { background: #3b82f620; color: #93c5fd; }
.method-put    { background: #d97706; color: #fef3c7; }   /* reuse badge vars */
.method-delete { background: #ef444420; color: #fca5a5; }
.method-patch  { background: #f97316; color: #fed7aa; }
```

**Acceptance**:
- [ ] 5 method badge classes added

### Task 45.8 — workflows/brainstorm.md: Architect Mode section updates
**File**: `workflows/brainstorm.md`

**Changes** (within Architect Design Mode section):
1. Workspace layout → add `sequence-diagram.html`, `deployment.html`, `apis.html`
2. **Boundary rule** (new subsection): clear differentiation table:
   - `data-flow.html` = WHEN high-level service/event flow
   - `sequence-diagram.html` = WHEN scenario/feature step-by-step
   - `architecture.html` = WHEN component structure + C4 context (system-level)
   - `deployment.html` = WHEN infra/env/ops
3. Trigger keywords per page:
   - Sequence: scenario, flow detail, login flow, order flow, step by step, interaction
   - Deployment: deploy, infrastructure, environment, staging, production, AWS/GCP/Azure, Docker, Kubernetes, CI/CD
   - APIs: endpoint, API, REST, GraphQL, route, HTTP, POST, GET, request, response
4. Diagram types: add `C4Context` alongside existing list
5. `notes.md` YAML schema: add `## apis` section (services with endpoints[])

**Acceptance**:
- [ ] 3 new pages in workspace layout
- [ ] Boundary rule table present
- [ ] Trigger keywords for each new page
- [ ] C4Context in diagram types
- [ ] `## apis` YAML schema section

### Task 45.9 — workflows/crystallize.md: Step 1D updates
**File**: `workflows/crystallize.md`

**Changes** in `consume_architect_artifacts` step:
- Add: if `deployment.html` or `notes.md ## deployment` exists → append `## Deployment & Infrastructure (from Architect Mode)` to `.viepilot/ARCHITECTURE.md`
- Add: if `apis.html` or `notes.md ## apis` exists → append `## API Design (from Architect Mode)` to `.viepilot/ARCHITECTURE.md`
- Note: sequence-diagram → no crystallize extraction (scenario docs don't map to architecture artifacts)
- Note: C4Context from architecture.html already imported via existing `decisions[]` path

**Acceptance**:
- [ ] Deployment extraction → ARCHITECTURE.md documented
- [ ] API extraction → ARCHITECTURE.md documented

### Task 45.10 — skills/vp-brainstorm/SKILL.md: mention ENH-029
**File**: `skills/vp-brainstorm/SKILL.md`

**Changes**:
- Append to Architect Design Mode capability: "+ C4Context/Sequence/Deployment/APIs pages (ENH-029)"
- No version bump (v1.0.0 from Phase 44 milestone is maintained until next milestone)

**Acceptance**:
- [ ] ENH-029 mentioned

### Task 45.11 — Jest contract tests: ENH-029
**File**: `tests/unit/vp-enh029-architect-pages-contracts.test.js` (new)

**Tests**:
1. `architecture.html: C4Context section exists`
2. `architecture.html: External Systems table present`
3. `sequence-diagram.html exists with sequenceDiagram block`
4. `sequence-diagram.html: differentiation note from data-flow present`
5. `deployment.html exists with environments table`
6. `apis.html exists with endpoint table structure`
7. `style.css: HTTP method badge classes present`
8. `brainstorm.md: boundary rule table documented`
9. `brainstorm.md: deployment and apis trigger keywords present`
10. `crystallize.md: deployment and APIs extraction to ARCHITECTURE.md documented`

**Acceptance**:
- [ ] 10 tests pass
- [ ] `npm test` total ≥ baseline + 10

## Files Changed Summary
- `templates/architect/architecture.html` — C4 + External Systems (45.1)
- `templates/architect/sequence-diagram.html` — new (45.2)
- `templates/architect/deployment.html` — new (45.3)
- `templates/architect/apis.html` — new (45.4)
- All 12 architect pages — full sidebar nav (45.5)
- `templates/architect/index.html` — 3 new cards (45.6)
- `templates/architect/style.css` — method badge CSS (45.7)
- `workflows/brainstorm.md` — boundary rule + triggers + schema (45.8)
- `workflows/crystallize.md` — Step 1D deployment/API extraction (45.9)
- `skills/vp-brainstorm/SKILL.md` — ENH-029 note (45.10)
- `tests/unit/vp-enh029-architect-pages-contracts.test.js` — new (45.11)

## Version
MINOR bump: **1.12.0 → 1.13.0**

## Verification Commands
```bash
npm test
ls templates/architect/
grep -n "C4Context\|sequence-diagram\|deployment\|apis" workflows/brainstorm.md
grep -n "Deployment.*Infrastructure\|API Design" workflows/crystallize.md
```
