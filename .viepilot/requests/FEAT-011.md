# FEAT-011 — Architect Design Mode: collaborative architecture brainstorm với HTML generation

## Metadata
- **ID**: FEAT-011
- **Type**: Feature (brainstorm + crystallize)
- **Status**: new
- **Priority**: high
- **Owner**: product / framework
- **Created**: 2026-04-04
- **Reporter**: User

## Problem

Hiện tại `/vp-brainstorm` có chế độ **Architecture** (topic template) nhưng chỉ là Q&A dạng text. Khi user và ViePilot thảo luận kiến trúc hệ thống, output chỉ là markdown notes — không có presentation trực quan. User phải tự hình dung flow/architecture/decision tree trong đầu, khó review và khó chốt quyết định trước khi vào crystallize.

## Goal

### Chế độ mới: **Architect Design Mode** (`/vp-brainstorm --architect`)

Khi kích hoạt (hoặc tự động detect khi topic architecture được chọn với độ sâu đủ lớn):

#### Trong phiên trao đổi
1. **Collaborative dialogue**: ViePilot và user cùng xây dựng kiến trúc qua Q&A có cấu trúc
2. **Live HTML generation**: sau mỗi quyết định quan trọng, tự động sinh / cập nhật file HTML trình bày:
   - **System Architecture Diagram** (component graph, service boundaries)
   - **Data Flow** (request path, event flow, queue/async)
   - **Decision Log** (ADR-style: context → options → chosen → rationale)
   - **Tech Stack Summary** (layer-by-layer: frontend, backend, infra, data, DevOps)
   - **Tech Notes** (assumptions, constraints, risks, open questions)
   - **Feature Map** (tính năng nào ở layer nào, phase nào)
3. **Incremental update**: mỗi lần user thay đổi quyết định, HTML cập nhật incremental (không viết lại toàn bộ)
4. **Review checkpoint**: định kỳ (hoặc khi user gõ `/review-arch`), ViePilot tóm tắt "đây là những gì chúng ta đã quyết định" và user confirm trước khi tiếp tục

#### Output artifacts
```
.viepilot/architect/{session-id}/
  index.html         # Hub: navigation tới tất cả sections
  architecture.html  # System diagram + component descriptions
  data-flow.html     # Request/event flow diagrams
  decisions.html     # ADR log
  tech-stack.html    # Layer-by-layer stack
  tech-notes.html    # Assumptions, risks, open questions
  feature-map.html   # Features mapped to layers/phases
  style.css          # Shared styling (dark mode, diagram styles)
  notes.md           # Machine-readable: decisions, open questions, crystallize hints
```

#### HTML presentation requirements
- **Self-contained** (không cần server, mở trực tiếp trong browser)
- **Dark/light mode** toggle
- **Diagram rendering**: dùng Mermaid.js (CDN) cho architecture/flow diagrams
- **Decision table**: sortable, filterable theo status (open/decided/deferred)
- **Responsive**: readable trên cả desktop và mobile
- **Navigation**: sidebar/tabs giữa các sections
- **Diff indicator**: khi một section được cập nhật trong phiên hiện tại, đánh dấu "updated" để user biết cần review

### Kết hợp với crystallize

Khi `/vp-crystallize` chạy sau Architect Design Mode:
1. **Step 0**: detect `architect/` artifacts
2. **Step 1C (mới)**: `Consume Architect Artifacts` — đọc `notes.md` của architect session:
   - Import `decisions` vào `.viepilot/ARCHITECTURE.md`
   - Import `tech-stack` vào project metadata
   - Import `feature-map` vào roadmap horizon (thay thế / bổ sung brainstorm horizon)
   - Import open questions → tạo list clarification questions cho user trước khi proceed
3. Architect artifacts được reference trong phase context (không copy-paste, chỉ path reference)

### Auto-activate heuristic
Không cần flag `--architect` nếu:
- User chọn topic "Architecture" trong brainstorm menu **VÀ**
- Phiên đã có ≥ 3 component/service được đặt tên **HOẶC** tech stack đã được đề xuất

Trong trường hợp này, assistant hỏi: "Bạn muốn kích hoạt Architect Design Mode để tôi generate HTML presentation không?"

## Acceptance Criteria
- [ ] `workflows/brainstorm.md` định nghĩa **Architect Design Mode** section đầy đủ
- [ ] Workspace layout `architect/{session-id}/` documented với tất cả files
- [ ] HTML generation spec: Mermaid.js, dark mode, diff indicator, navigation
- [ ] Incremental update rule: chỉ update section liên quan khi quyết định thay đổi
- [ ] `workflows/crystallize.md` thêm **Step 1C**: Consume Architect Artifacts
- [ ] `skills/vp-brainstorm/SKILL.md` cập nhật: mention `--architect` flag + auto-activate
- [ ] `skills/vp-crystallize/SKILL.md` cập nhật: architect artifacts consumption
- [ ] `docs/user/features/architect-design-mode.md` — hướng dẫn sử dụng đầy đủ
- [ ] Jest contract tests: auto-activate heuristic, HTML structure, crystallize import
- [ ] ROADMAP.md cập nhật horizon với FEAT-011

## Related
- **ENH-026**: background UI extraction (complementary — UI mode parallel)
- **FEAT-010**: `/research-ui` UX walkthrough (similar pattern, different domain)
- **ENH-022**: architecture diagrams `.viepilot/architecture/*.mermaid` (predecessor)

## Notes
- HTML cần **không** import thư viện nặng ngoài Mermaid.js — ưu tiên vanilla HTML/CSS/JS
- `notes.md` trong architect workspace là **machine-readable** (YAML frontmatter hoặc structured markdown) để crystallize có thể parse tự động
- Cần define rõ "decision" vs "assumption" vs "open question" để Decision Log không bị messy
- Xem xét khả năng `/review-arch` là alias của `/vp-brainstorm --review` khi trong Architect Mode
