# Architect Design Mode (FEAT-011)

`/vp-brainstorm --architect` bật chế độ brainstorm kiến trúc với live HTML generation — workspace trực quan để review, chỉnh sửa, và trình bày trước khi chạy `/vp-crystallize`.

## Overview

Architect Design Mode giải quyết gap: brainstorm architecture thông thường chỉ là text/markdown. Không có visualization trực quan → khó detect lỗi sớm, khó align với stakeholders.

**Architect Mode tạo ra:**
- HTML workspace với 7 sections (architecture, data-flow, decisions, tech-stack, tech-notes, feature-map)
- Machine-readable `notes.md` với YAML schema (decisions, open_questions, tech_stack)
- Mermaid.js diagrams tự động render trong browser
- Incremental updates khi decisions thay đổi — không tái tạo toàn bộ workspace

## Activation

### Explicit flag
```
/vp-brainstorm --architect
```
Kích hoạt ngay khi bắt đầu phiên. ViePilot sẽ tạo workspace và bắt đầu generate HTML sau mỗi major decision.

### Auto-activate heuristic
Khi đang brainstorm thông thường, ViePilot theo dõi:
- **Component/service mentions**: tên theo pattern `{capitalized} Service|API|Module|Layer|Server|Database`
- **Stack mentions**: bất kỳ technology keyword nào (React, Node.js, PostgreSQL, Kafka, AWS, Docker, v.v.)

Khi **≥3 components** hoặc **≥1 stack suggestion** → prompt:
```
🏗️ Tôi nhận thấy bạn đang thiết kế kiến trúc với nhiều components.
Kích hoạt Architect Design Mode để tôi tạo HTML visualization không?
1. Có — tạo workspace và generate initial HTML
2. Không — tiếp tục text-only
```

## HTML Artifacts

### Workspace layout

```
.viepilot/architect/{session-id}/
  index.html         # Hub: sidebar nav → tất cả sections
  architecture.html  # System diagram (Mermaid) + component table
  data-flow.html     # Sequence/flow diagrams
  decisions.html     # ADR log: Date | Decision | Options | Chosen | Rationale | Status
  tech-stack.html    # Layer-by-layer: frontend, backend, infra, data, DevOps
  tech-notes.html    # 3 columns: Assumptions | Risks | Open Questions
  feature-map.html   # Features: layer, phase, MVP/Post-MVP/Future tags
  style.css          # Shared: dark/light mode, .updated highlight, Mermaid container
  notes.md           # Machine-readable YAML (xem Schema bên dưới)
```

### File descriptions

| File | Nội dung | Diagram type |
|------|----------|-------------|
| `index.html` | Hub: card links tới 6 sections | — |
| `architecture.html` | System components, service boundaries | `graph TD` hoặc `C4Context` |
| `data-flow.html` | Request/event flows | `sequenceDiagram` hoặc `flowchart LR` |
| `decisions.html` | ADR log với status badges | — |
| `tech-stack.html` | Layer table + alternatives | — |
| `tech-notes.html` | 3 cột: Assumptions, Risks, Open Questions | — |
| `feature-map.html` | Feature list + mindmap | `mindmap` hoặc `quadrantChart` |

### Opening the workspace
Mở `index.html` trong browser để xem toàn bộ workspace. Các trang tự liên kết nhau qua sidebar nav.

### Dark/light mode
Mỗi trang có nút toggle dark/light. Mermaid diagrams tự điều chỉnh theme.

## Dialogue Cadence

Sau **mỗi major decision** trong Architect Mode:
1. ViePilot cập nhật HTML section liên quan (chỉ section đó — không tái tạo toàn bộ)
2. Thêm `class="updated"` + `data-updated="true"` → CSS highlight (yellow left border + "updated" badge)
3. Update `notes.md` YAML (`updated` date + entry tương ứng)

**Ví dụ luồng:**
```
User: "Chọn PostgreSQL cho database vì cần ACID compliance"
→ AI update decisions.html (thêm row D001)
→ AI update tech-stack.html (Database layer)
→ AI update notes.md (decisions[] + tech_stack.database)
→ Highlight các section đã thay đổi với .updated class
```

## `/review-arch` command

Gõ `/review-arch` trong phiên Architect Mode để xem tóm tắt:

```
📊 Architecture Review

Decisions so far:
| ID   | Topic           | Chosen      | Status   |
|------|-----------------|-------------|----------|
| D001 | Database        | PostgreSQL  | decided  |
| D002 | Caching layer   | Redis       | decided  |
| D003 | Queue system    | —           | open     |

Open Questions:
- Q001: Caching layer Redis hay Memcached? (due: before crystallize)
- Q002: Deploy ECS hay Kubernetes? (due: open)

Tiếp tục brainstorm không?
```

## Crystallize Integration

### Step 1D — Consume Architect Artifacts

Khi chạy `/vp-crystallize`, Step 1D tự động đọc `.viepilot/architect/`:

1. **decisions[]** → import vào `.viepilot/ARCHITECTURE.md` section `## Architecture Decisions (from Architect Mode)`
2. **tech_stack{}** → dùng làm authoritative stack (override brainstorm text nếu conflict; khi có conflict → hỏi user)
3. **open_questions[] status=open** → surface trước khi tiếp tục
4. **feature-map.html** → cross-check với `## Product Horizon` trong brainstorm session

**Soft suggestion** (không block) khi architect dir chưa có nhưng brainstorm có ≥5 services:
```
💡 Bạn muốn quay lại /vp-brainstorm --architect để tạo visualization trước không?
1. Có — quay lại architect mode
2. Không — tiếp tục crystallize với text-only brainstorm
```

## notes.md Schema

File `notes.md` trong architect workspace là machine-readable YAML + Markdown:

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
  status: decided  # decided | open | deferred

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

`crystallize` đọc file này trực tiếp — giữ schema nhất quán để import hoạt động đúng.

## Tips & Best Practices

1. **Bắt đầu với Architecture** — chốt component boundaries trước khi đi vào data-flow và decisions
2. **Dùng `/review-arch` thường xuyên** — đặc biệt khi có nhiều open_questions; resolve trước khi crystallize
3. **Decisions.html là lịch sử** — không xóa rows cũ; chỉ update `status` khi quyết định thay đổi
4. **tech_stack{} là authoritative** — crystallize sẽ dùng đây làm stack chính; đảm bảo đúng trước khi `/vp-crystallize`
5. **Mở index.html trong browser** — workspace được thiết kế để share với stakeholders trực tiếp từ file

---
_Cập nhật: 1.11.0 (FEAT-011 — Architect Design Mode)_
