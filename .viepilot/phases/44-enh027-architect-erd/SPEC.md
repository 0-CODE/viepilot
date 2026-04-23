# Phase 44 — ENH-027 + ENH-028: Architect Mode ERD + User Use Cases

## Goal
Bổ sung 2 trang mới vào Architect Design Mode workspace:
- **ENH-027**: `erd.html` — Database ERD (Entities, Attributes, Relationships) với Mermaid `erDiagram`
- **ENH-028**: `user-use-cases.html` — User Stories / Use Cases với Mermaid `flowchart TD`

Cập nhật toàn bộ hub navigation, workflow triggers, crystallize integrations, và notes.md schema cho cả hai.

## Background
FEAT-011 (Phase 43) tạo Architect Mode với 7 pages. Cả ERD và User Use Cases đều thiếu — hai artifacts quan trọng nhất của giai đoạn brainstorm kiến trúc.

## Tasks

### Task 44.1 — templates/architect/erd.html (new)
**File**: `templates/architect/erd.html` (new)

**Content**:
- Sidebar nav như các trang khác, `erd.html` là `active`
- Mermaid `erDiagram` placeholder với 2 sample entities + 1 relationship
- Table: **Entity List** (Entity | Attributes | Primary Key | Foreign Keys | Notes)
- Table: **Relationship Summary** (Entity A | Relationship Type | Entity B | Label | Notes)
- Dark/light toggle (inherit từ style.css)
- Link back to hub `index.html`

**Sidebar nav phải gồm đủ 8 items** (index + 7 pages cũ + erd):
- 🏠 Hub
- 🏗️ Architecture
- 🔄 Data Flow
- 📋 Decisions (ADR)
- 🛠️ Tech Stack
- 📝 Tech Notes
- 🗺️ Feature Map
- 🗄️ ERD (active)

**Acceptance**:
- [ ] File tồn tại với Mermaid `erDiagram` placeholder
- [ ] Entity table + Relationship table có đủ columns
- [ ] Sidebar nav có 8 items, `erd.html` là active
- [ ] Dark/light toggle functional

### Task 44.2 — Update sidebar nav trong 7 trang cũ
**Files**: Tất cả 7 file trong `templates/architect/` ngoài `erd.html`:
- `index.html`, `architecture.html`, `data-flow.html`, `decisions.html`, `tech-stack.html`, `tech-notes.html`, `feature-map.html`

**Change**: Thêm `<li><a href="erd.html">🗄️ ERD</a></li>` vào `<ul>` trong `.nav-sidebar` của từng file.

**Acceptance**:
- [ ] Tất cả 7 trang đều có link tới `erd.html` trong sidebar
- [ ] Không có broken links

### Task 44.3 — templates/architect/index.html: thêm ERD card
**File**: `templates/architect/index.html`

**Change**: Thêm card cho `erd.html` vào `.cols-2` grid:
```html
<a href="erd.html" class="card" style="text-decoration:none;display:block;">
  <h2>🗄️ ERD</h2>
  <p ...>Database entities, attributes, relationships (erDiagram)</p>
</a>
```

**Acceptance**:
- [ ] Card có trong hub grid
- [ ] Link trỏ đúng `erd.html`

### Task 44.4 — workflows/brainstorm.md: cập nhật Architect Design Mode section
**File**: `workflows/brainstorm.md`

**Changes**:
1. Workspace layout list → thêm `erd.html # ERD: entities, attributes, relationships (Mermaid erDiagram)`
2. Thêm **ERD trigger keywords** trong Architect Mode section:
   - Keywords: `database`, `entity`, `table`, `schema`, `relation`, `relationship`, `foreign key`, `primary key`, `ERD`, `data model`, `normalization`
   - Rule: khi user nhắc ≥1 keyword → update `erd.html` + update `notes.md ## erd` section
3. Thêm `erDiagram` vào danh sách diagram types (cạnh graph TD, sequenceDiagram, mindmap)
4. Thêm `## erd` YAML schema vào `notes.md` schema block

**Acceptance**:
- [ ] `erd.html` có trong workspace layout
- [ ] ERD trigger keywords documented
- [ ] `erDiagram` trong diagram types list
- [ ] `## erd` YAML section có trong notes.md schema

### Task 44.5 — workflows/crystallize.md: Step 1D cập nhật ERD extraction
**File**: `workflows/crystallize.md`

**Change** trong `<step name="consume_architect_artifacts">`:
- Thêm sau phần `decisions[]` import:
  ```
  3. **`erd.html` / `notes.md ## erd`** (nếu tồn tại) → append to `.viepilot/ARCHITECTURE.md` under:
     ## Database Schema (from Architect ERD)
     | Entity | Attributes | PK | FK | Notes |
     ...
     Relationships:
     | Entity A | Type | Entity B | Label |
  ```
- Renumber existing step 3 (feature-map) → 4, step 4 (record notes) → 5

**Acceptance**:
- [ ] ERD extraction documented trong Step 1D
- [ ] Output section `## Database Schema (from Architect ERD)` named correctly
- [ ] Existing steps still intact (renumbered cleanly)

### Task 44.6 — skills/vp-brainstorm/SKILL.md: version bump + ERD note
**File**: `skills/vp-brainstorm/SKILL.md`

**Changes**:
- Bump version → `1.0.0` (milestone: Architect Mode now complete với ERD)
- Append to Architect Design Mode capability line: "+ ERD page (erDiagram, entity/relationship tables, ENH-027)"

**Acceptance**:
- [ ] version: 1.0.0
- [ ] ENH-027 mentioned

### Task 44.7 — Jest contract tests: ENH-027
**File**: `tests/unit/vp-enh027-architect-erd-contracts.test.js` (new)

**Tests**:
1. `templates/architect/erd.html exists`
2. `erd.html: contains erDiagram mermaid block`
3. `erd.html: contains entity table and relationship table`
4. `erd.html: sidebar nav has 8 items including erd link`
5. `all 7 existing architect pages: sidebar nav includes erd.html link`
6. `index.html: hub card links to erd.html`
7. `brainstorm.md: erd.html in workspace layout`
8. `brainstorm.md: erDiagram in diagram types`
9. `crystallize.md: Step 1D mentions Database Schema from Architect ERD`

**Acceptance**:
- [ ] 9 tests pass
- [ ] `npm test` total ≥ baseline + 9

### Task 44.8 — templates/architect/user-use-cases.html (new)
**File**: `templates/architect/user-use-cases.html` (new)

**Content**:
- Sidebar nav: 9 items (all existing + ERD + **User Use Cases** active)
- Mermaid `flowchart TD` placeholder: 2 actors → 3 use cases
- Table: **User Stories** (ID | As a... | I want to... | So that... | Priority | Status)
- Table: **Use Cases** (Use Case | Actor | Preconditions | Main Flow | Alt Flow | Notes)
- Section: **Actors** (Actor | Role | Goals)
- Dark/light toggle

**Acceptance**:
- [ ] File exists with Mermaid flowchart + 3 tables
- [ ] Sidebar nav has 9 items, user-use-cases.html active

### Task 44.9 — Jest contract tests: ENH-028
**File**: `tests/unit/vp-enh028-architect-use-cases-contracts.test.js` (new)

**Tests**:
1. `templates/architect/user-use-cases.html exists`
2. `user-use-cases.html: contains mermaid flowchart`
3. `user-use-cases.html: contains User Stories table`
4. `user-use-cases.html: sidebar nav includes all pages`
5. `all architect pages have user-use-cases.html in sidebar nav`
6. `index.html: hub card links to user-use-cases.html`
7. `brainstorm.md: user-use-cases.html in workspace layout`
8. `brainstorm.md: use case trigger keywords documented`
9. `crystallize.md: Step 1D mentions User Stories Use Cases`

**Acceptance**:
- [ ] 9 tests pass (ENH-028 suite)
- [ ] Combined `npm test` total ≥ baseline + 18

## Files Changed Summary
### ENH-027
- `templates/architect/erd.html` — new (44.1)
- `templates/architect/index.html` — add ERD card + nav link (44.2, 44.3)
- `templates/architect/architecture.html` — add nav link (44.2)
- `templates/architect/data-flow.html` — add nav link (44.2)
- `templates/architect/decisions.html` — add nav link (44.2)
- `templates/architect/tech-stack.html` — add nav link (44.2)
- `templates/architect/tech-notes.html` — add nav link (44.2)
- `templates/architect/feature-map.html` — add nav link (44.2)
- `workflows/brainstorm.md` — ERD section (44.4)
- `workflows/crystallize.md` — Step 1D ERD extraction (44.5)
- `skills/vp-brainstorm/SKILL.md` — v1.0.0 + ENH-027 (44.6)
- `tests/unit/vp-enh027-architect-erd-contracts.test.js` — new (44.7)

### ENH-028
- `templates/architect/user-use-cases.html` — new (44.8)
- `templates/architect/erd.html` — add use-cases nav link (44.8)
- `templates/architect/index.html` — add use-cases hub card (44.8)
- All 8 existing pages — add use-cases nav link (44.8)
- `workflows/brainstorm.md` — use-cases section (44.8 via 44.4 update)
- `workflows/crystallize.md` — Step 1D use-cases extraction (44.8 via 44.5 update)
- `tests/unit/vp-enh028-architect-use-cases-contracts.test.js` — new (44.9)

## Version
MINOR bump: **1.11.0 → 1.12.0**

## Verification Commands
```bash
npm test
ls templates/architect/
grep -n "erd.html\|erDiagram\|user-use-cases" workflows/brainstorm.md
grep -n "Database Schema\|User Stories" workflows/crystallize.md
```
