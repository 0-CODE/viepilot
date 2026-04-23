# Phase 43 — FEAT-011: Architect Design Mode

## Goal
Thêm chế độ mới **Architect Design Mode** (`/vp-brainstorm --architect`) cho phép user và ViePilot cùng brainstorm kiến trúc hệ thống với live HTML generation (architecture, data-flow, decisions, tech-stack, tech-notes, feature-map). Kết hợp với crystallize qua Step 1C mới.

## Background
FEAT-011 giải quyết gap: brainstorm architecture hiện tại chỉ là text/markdown Q&A. Không có visualization trực quan để user review trước khi chốt → khó detect errors sớm, khó trình bày cho stakeholders.

## Tasks

### Task 43.1 — brainstorm.md: Architect Design Mode section
**File**: `workflows/brainstorm.md`

**Changes**: Thêm section `### Architect Design Mode` sau `### Landing Page Deep-Dive`:

#### Activation
```
Kích hoạt khi:
- User dùng flag --architect, HOẶC
- User chọn topic "Architecture" trong brainstorm menu VÀ (service count ≥3 OR tech stack được đề xuất)
- Auto-activate prompt: "Bạn muốn kích hoạt Architect Design Mode để tôi generate HTML presentation không?"
```

#### Workspace layout
```
.viepilot/architect/{session-id}/
  index.html         # Hub: tabs/navigation tới tất cả sections
  architecture.html  # System diagram + component descriptions
  data-flow.html     # Request/event flow diagrams
  decisions.html     # ADR log (context → options → chosen → rationale)
  tech-stack.html    # Layer-by-layer: frontend, backend, infra, data, DevOps
  tech-notes.html    # Assumptions, risks, open questions
  feature-map.html   # Features mapped to layers/phases/tiers
  style.css          # Shared: dark mode, Mermaid theme, diff indicators
  notes.md           # Machine-readable: YAML frontmatter decisions[], open_questions[], tech_stack{}
```

#### Dialogue cadence
1. Per major decision → update relevant HTML section + update `notes.md`
2. When user changes a decision → incremental update (only affected section)
3. Diff indicator: add `data-updated="true"` attribute + CSS highlight for sections changed in current session
4. `/review-arch` command → ViePilot summarizes all decisions made so far, asks for confirm before continue

#### Mermaid.js diagrams
- Architecture: `graph TD` or `C4Context`
- Data flow: `sequenceDiagram` or `flowchart LR`
- Feature map: `mindmap` or `quadrantChart`
- All diagrams rendered via `<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js">`

**Acceptance**:
- [ ] Section fully specced with activation rules, workspace layout, dialogue cadence, diagram types
- [ ] `/review-arch` command documented

### Task 43.2 — HTML templates: 7 pages + style.css
**Files**: Create in `templates/architect/` (reusable templates):
- `index.html` — hub with sidebar nav, tabs linking to all sections
- `architecture.html` — component box + Mermaid diagram placeholder
- `data-flow.html` — sequence/flow diagram placeholder
- `decisions.html` — ADR table (Date | Decision | Options considered | Chosen | Rationale | Status)
- `tech-stack.html` — layer table (Layer | Technology | Why | Alternatives)
- `tech-notes.html` — 3 columns: Assumptions | Risks | Open Questions
- `feature-map.html` — feature list with tags (layer, phase, MVP/Post-MVP, status)
- `style.css` — shared: CSS variables for dark/light, `.updated` highlight, Mermaid container, responsive nav

**HTML requirements**:
- Self-contained (no build step, open in browser)
- Dark/light toggle via `<button>` + CSS class on `<html>`
- `.updated` class: yellow left border, "updated" badge
- Sidebar nav: highlights current page
- All pages link back to hub `index.html`
- No external CSS framework (vanilla only)

**Acceptance**:
- [ ] 7 HTML + 1 CSS files exist in `templates/architect/`
- [ ] Dark mode toggle functional
- [ ] `.updated` diff indicator visible
- [ ] No broken links between pages

### Task 43.3 — brainstorm.md: incremental update rules + notes.md schema
**File**: `workflows/brainstorm.md`

**Changes** (within Architect Design Mode section):
- **Incremental update rule**: only modify the specific HTML section related to the changed decision; preserve all other sections
- **notes.md YAML schema**:
  ```yaml
  ---
  session_id: {id}
  project: {name}
  created: {date}
  updated: {date}
  ---
  ## decisions
  - id: D001
    topic: Database choice
    options: [PostgreSQL, MongoDB, DynamoDB]
    chosen: PostgreSQL
    rationale: ACID compliance needed for financial data
    status: decided # decided | open | deferred
  
  ## open_questions
  - id: Q001
    question: Caching layer Redis hay Memcached?
    context: High read traffic expected
    due: before crystallize
  
  ## tech_stack
  frontend: React + TypeScript
  backend: Node.js + Express
  database: PostgreSQL
  infra: AWS ECS + RDS
  devops: GitHub Actions + Terraform
  ```
- **`/review-arch` command**: output summary table of all `decisions` + list all `open_questions` with status

**Acceptance**:
- [ ] Incremental update rule clearly stated
- [ ] YAML schema documented inline
- [ ] `/review-arch` behavior documented

### Task 43.4 — brainstorm.md: auto-activate heuristic
**File**: `workflows/brainstorm.md`

**Changes** (within Architect Design Mode section — activation subsection):
- Heuristic spec:
  - Track named components/services mentioned (regex: capitalized multi-word names, "Service", "API", "Module", "Layer")
  - Track tech stack mentions (known stack keywords)
  - When count ≥3 components OR ≥1 stack suggestion → prompt auto-activate
  - Prompt: "Tôi nhận thấy bạn đang thiết kế kiến trúc với nhiều components. Kích hoạt **Architect Design Mode** để tôi tạo HTML visualization không?"
  - User: Yes → create workspace, generate initial HTML; No → continue text-only

**Acceptance**:
- [ ] Heuristic spec with ≥2 trigger conditions
- [ ] Prompt text included
- [ ] Yes/No paths documented

### Task 43.5 — crystallize.md: Step 1C — Consume Architect Artifacts
**File**: `workflows/crystallize.md`

**Changes**: Add new step after Step 1B, before Step 2:
```xml
<step name="consume_architect_artifacts">
## Step 1C: Consume Architect Artifacts (FEAT-011)

If `.viepilot/architect/` exists with at least one session dir:

1. Select most recent session (by dir mtime or newest session-id)
2. Read `notes.md` → parse YAML frontmatter:
   - `decisions[]` → append to `.viepilot/ARCHITECTURE.md` under `## Architecture Decisions (from Architect Mode)`
   - `tech_stack{}` → use as authoritative tech stack (overrides brainstorm text if conflict; flag conflict for user)
   - `open_questions[]` status=open → surface as list: "These questions were open at end of Architect Design Mode — please resolve before proceeding"
3. `feature-map.html` → cross-reference with brainstorm Product Horizon (MVP tiers); flag discrepancies
4. Record in working notes: `architect_session_id`, `decisions_imported`, `open_questions_count`

If `.viepilot/architect/` does not exist but brainstorm has complex architecture (≥5 services detected):
- Suggest: "Bạn muốn quay lại /vp-brainstorm --architect để tạo visualization trước không?"
- Not a hard block (unlike ENH-026 UI gate) — proceed with user confirmation
</step>
```

**Acceptance**:
- [ ] Step 1C exists between Step 1B and Step 2
- [ ] YAML parse path → ARCHITECTURE.md import documented
- [ ] Open questions surface behavior documented
- [ ] Soft suggestion (not hard block) when architect dir missing

### Task 43.6 — skills: vp-brainstorm + vp-crystallize SKILL.md update
**Files**:
- `skills/vp-brainstorm/SKILL.md`
- `skills/vp-crystallize/SKILL.md`

**Changes**:
- `vp-brainstorm`: bump → `0.9.0`, add "Architect Design Mode — collaborative architecture brainstorm with live HTML generation (FEAT-011)" to capabilities
- `vp-crystallize`: bump → `0.6.0`, add "Architect artifacts consumption — Step 1C imports decisions/tech-stack from Architect Design Mode (FEAT-011)" to capabilities

**Acceptance**:
- [ ] Both files have updated versions
- [ ] FEAT-011 mentioned in both

### Task 43.7 — docs/user/features/architect-design-mode.md (new)
**File**: `docs/user/features/architect-design-mode.md` (new file)

**Sections**:
1. Overview — what is Architect Design Mode
2. Activation — `--architect` flag + auto-activate
3. HTML Artifacts — workspace layout with screenshot descriptions
4. Dialogue Cadence — how decisions flow to HTML
5. `/review-arch` command — usage
6. Crystallize Integration — Step 1C behavior
7. notes.md Schema — for power users / scripting
8. Tips & Best Practices

**Acceptance**:
- [ ] File created with all 8 sections
- [ ] Workspace layout table present
- [ ] notes.md schema example present

### Task 43.8 — Jest contract tests: FEAT-011
**File**: `tests/vp-feat011-architect-design-mode-contracts.test.cjs` (new)

**Tests**:
1. `brainstorm.md: Architect Design Mode section exists`
2. `brainstorm.md: workspace layout documents all 8 files (7 html + style.css + notes.md)`
3. `brainstorm.md: /review-arch command documented`
4. `brainstorm.md: auto-activate heuristic with ≥2 trigger conditions`
5. `crystallize.md: Step 1C exists between Step 1B and subsequent steps`
6. `crystallize.md: Step 1C imports decisions to ARCHITECTURE.md`
7. `crystallize.md: Step 1C surfaces open_questions`
8. `templates/architect/: all 7 html files + style.css exist`

**Acceptance**:
- [ ] 8 tests pass
- [ ] `npm test` total ≥ baseline + 8

## Files Changed Summary
- `workflows/brainstorm.md` — Architect Design Mode section (43.1, 43.3, 43.4)
- `workflows/crystallize.md` — Step 1C (43.5)
- `templates/architect/` — 7 HTML + style.css (43.2) [new dir]
- `skills/vp-brainstorm/SKILL.md` — version + note (43.6)
- `skills/vp-crystallize/SKILL.md` — version + note (43.6)
- `docs/user/features/architect-design-mode.md` — new (43.7)
- `tests/vp-feat011-architect-design-mode-contracts.test.cjs` — new (43.8)

## Version
MINOR bump: **1.10.0 → 1.11.0**

## Verification Commands
```bash
npm test
grep -n "Architect Design Mode" workflows/brainstorm.md
grep -n "Step 1C\|consume_architect" workflows/crystallize.md
ls templates/architect/
```
