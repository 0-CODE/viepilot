<purpose>
Interactive brainstorm session để thu thập ý tưởng, requirements, và quyết định cho dự án.
Cho phép research ngay trong cùng phiên brainstorm khi cần.
</purpose>

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.


<process>

<step name="detect_sessions">
## 1. Detect Previous Sessions

```bash
ls -la docs/brainstorm/session-*.md 2>/dev/null | tail -5
```

Parse results to get list of existing sessions.
</step>

<step name="ask_intent">
## 2. Ask User Intent

**If previous sessions exist:**
```
Tôi tìm thấy các phiên brainstorm trước đó:
{list sessions with dates}

Bạn muốn:
1. Tiếp tục phiên gần nhất
2. Xem lại một phiên cụ thể  
3. Tạo mới phiên brainstorm
```

**If no sessions:**
Tự động tạo phiên mới.
</step>

<step name="load_context">
## 3. Load Context (nếu tiếp tục)

Nếu user chọn tiếp tục:
1. Đọc file phiên trước đó
2. Tóm tắt nội dung đã thảo luận
3. Xác định các open questions / action items còn lại
4. Tiếp tục từ điểm dừng
5. Nếu session đã có section **`## Phases`**: tóm tắt nhanh các phase hiện có; mọi cập nhật sau đó phải **merge** vào section đó (không xóa im lặng) trừ khi user chủ động yêu cầu thu hẹp/mở rộng scope.
</step>

<step name="brainstorm_mode">
## 4. Brainstorm Mode

### Topics Template
Gợi ý các topics để brainstorm:

1. **Domain Analysis**
   - Mục tiêu dự án
   - User personas
   - Core use cases

2. **Architecture**
   - System components
   - Data flow
   - Technology stack
   - Diagram applicability signals (for crystallize):
     - Service/module count and boundaries
     - Event-driven usage (queues, webhooks, async jobs)
     - Deployment topology (single node vs multi-env / distributed)
     - User journey complexity (single actor/simple flow vs multi-actor)
     - External integration surface (few vs many protocols/services)

3. **Data Model**
   - Core entities
   - Relationships
   - Storage strategy

4. **API Design**
   - Endpoint structure
   - Authentication
   - Real-time requirements

5. **Infrastructure**
   - Deployment strategy
   - Monitoring
   - Scaling

6. **Phase assignment (ENH-030):** trong quá trình brainstorm, mỗi feature/capability được gán vào một **phase** cụ thể — Phase 1, Phase 2, Phase 3... Không dùng tier MVP/Post-MVP/Future. Nếu user chưa nêu phase, hỏi: “Feature này bạn muốn đưa vào Phase mấy?”

### Interactive Q&A
Cho mỗi topic:
1. Đặt câu hỏi cụ thể
2. Đợi user trả lời
3. Tổng hợp và đặt follow-up questions
4. Đề xuất alternatives nếu cần
5. Ghi nhận decisions

### Landing Page Deep-Dive (kích hoạt theo ngữ cảnh)
Nếu user brainstorm về landing page / homepage / marketing page:

1. Hỏi thêm để chốt bố cục:
   - Goal chính của landing page? (signup, booking demo, download, contact)
   - Audience chính?
   - Tone visual? (minimal, modern, bold, enterprise, playful)
   - CTA chính và CTA phụ?
2. Đưa menu bố cục để user chọn:
   - Layout A: Hero centric + trust logos + features + CTA
   - Layout B: Problem/Solution + social proof + pricing + FAQ
   - Layout C: Product storytelling + screenshots + testimonials + final CTA
   - Layout D: SaaS conversion + integrations + comparison + onboarding steps
3. Tham khảo `https://21st.dev` để đề xuất section/components phù hợp với layout đã chọn.
4. Ghi rõ trong session:
   - Layout user chọn
   - Component candidates từ 21st.dev
   - Lý do chọn theo objective + audience

### In-session Research Mode
User có thể yêu cầu research ngay trong brainstorm (không cần đổi skill):
- Trigger phrases: "research cái này", "bạn research giúp", "cần research", "hãy tìm best practice"
- Khi trigger:
  1. Xác định scope research (1-3 câu)
  2. Thu thập nhanh từ nguồn phù hợp (docs chính thức, reference sites, patterns)
  3. Trả về tóm tắt ngắn: findings, trade-offs, recommendation
  4. Quay lại topic brainstorm hiện tại với quyết định đề xuất

Nếu assistant nhận thấy topic có độ mơ hồ cao hoặc rủi ro quyết định sai, assistant nên chủ động đề xuất:
`Mục này nên research nhanh trước khi chốt, bạn muốn mình research luôn trong phiên này không?`

### UI Direction Mode (design-in-the-loop; FEAT-002 + FEAT-007)
Nếu user đang brainstorm cho dự án có UI/UX hoặc yêu cầu thiết kế trực quan:

**Layout — chọn một:**

- **Legacy (một màn):** `.viepilot/ui-direction/{session-id}/index.html` + `style.css` + `notes.md`.
- **Multi-page (nhiều màn):** cùng thư mục session, thêm `pages/{slug}.html` cho từng page; `index.html` là **hub** (liên kết tới mọi page). `style.css` shared.

**Quy tắc chung**

1. Tạo workspace direction cho phiên hiện tại (tối thiểu `style.css` + `notes.md`; HTML theo layout đã chọn).
2. Mỗi lần user đổi requirement/layout/component:
   - Cập nhật trực tiếp HTML/CSS direction
   - Ghi decision + rationale vào `notes.md` (single source of truth cho design intent)

**Hook bắt buộc (multi-page only)**

Khi thư mục `pages/` tồn tại hoặc bất kỳ `pages/*.html` nào được thêm / đổi tên / xóa:

- Cập nhật **hub** `index.html` (nav / danh sách link tới mọi page còn lại).
- Cập nhật ngay section **`## Pages inventory`** trong `notes.md` (bảng: Slug | File | Title | Purpose | Key sections | Nav to) — phải khớp 100% tập file `pages/*.html` hiện có.
- Không kết thúc topic / không coi session UI đã “sync” nếu inventory lệch với file trên disk.

3. Nếu user gửi references/components (bao gồm 21st.dev prompt/link), ghi rõ:
   - nguồn tham chiếu
   - phần UI áp dụng (page slug nếu multi-page)
   - điều chỉnh theo mục tiêu sản phẩm
4. Giữ prototype ở mức mô tả định hướng (directional), không ép build production-ready code ở bước brainstorm.

### Architect Design Mode (FEAT-011)

Brainstorm kiến trúc hệ thống với live HTML generation — workspace trực quan cho user review, chỉnh sửa, và trình bày trước khi chạy `/vp-crystallize`.

#### Activation

Kích hoạt khi **một trong** các điều kiện sau:

1. **Flag explicit**: user dùng `/vp-brainstorm --architect`
2. **Auto-activate heuristic** (xem dưới)
3. **Topic Architecture + complexity threshold**: user chọn topic "Architecture" trong brainstorm menu VÀ (service count ≥3 HOẶC ≥1 tech stack được đề xuất)

**Auto-activate heuristic**: trong quá trình brainstorm, theo dõi:
- **Component/service mentions**: các tên có pattern `{capitalized} Service|API|Module|Layer|Server|Database` (vd. "UserService", "Payment API", "Data Layer")
- **Stack mentions**: bất kỳ keyword từ danh sách stack biết (React, Node.js, PostgreSQL, Redis, Kafka, AWS, Docker, v.v.)

Khi **≥3 components** HOẶC **≥1 stack suggestion** được nhắc đến → prompt:

```
🏗️ Tôi nhận thấy bạn đang thiết kế kiến trúc với nhiều components.
Kích hoạt Architect Design Mode để tôi tạo HTML visualization không?
1. Có — tạo workspace và generate initial HTML
2. Không — tiếp tục text-only
```

- **Option 1 (Yes)**: tạo workspace (thư mục + files), generate initial HTML từ nội dung đã thảo luận, tiếp tục trong Architect Mode.
- **Option 2 (No)**: tiếp tục brainstorm text-only; heuristic không prompt lại trong phiên này.

#### Workspace layout

```
.viepilot/architect/{session-id}/
  index.html              # Hub: sidebar nav + tabs → tới tất cả sections
  architecture.html       # System diagram (graph TD / C4Context) + component descriptions
  data-flow.html          # High-level service/event flows (sequenceDiagram / flowchart LR)
  decisions.html          # ADR log: Date | Decision | Options | Chosen | Rationale | Status
  tech-stack.html         # Layer-by-layer: frontend, backend, infra, data, DevOps
  tech-notes.html         # 3 columns: Assumptions | Risks | Open Questions
  feature-map.html        # Features với tags: layer, phase, priority, status
  erd.html                # Database ERD: entities, attributes, relationships (erDiagram) — ENH-027
  user-use-cases.html     # User Stories / Use Cases / Actors (flowchart TD) — ENH-028
  sequence-diagram.html   # Per-scenario sequences (sequenceDiagram) — ENH-029
  deployment.html         # Infra, environments, CI/CD pipeline — ENH-029
  apis.html               # Service API listing & design decisions — ENH-029
  style.css               # Shared: dark/light CSS vars, .updated highlight, Mermaid container, responsive nav
  notes.md                # Machine-readable YAML (xem schema bên dưới)
```

**Mermaid.js** — tất cả diagrams dùng: `<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js">`
- `architecture.html` → `graph TD` hoặc `C4Context`
- `data-flow.html` → `sequenceDiagram` hoặc `flowchart LR`
- `feature-map.html` → `mindmap` hoặc `quadrantChart`
- `erd.html` → `erDiagram` (entities, attributes, relationships)
- `user-use-cases.html` → `flowchart TD` (actors → use case bubbles)
- `sequence-diagram.html` → `sequenceDiagram` (per-scenario step-by-step)
- `deployment.html` → `graph TD` (infra) + `flowchart LR` (CI/CD pipeline)
- `apis.html` → no diagram; endpoint tables with HTTP method badges

#### Page Boundary Rules (ENH-029)

| Page | Use when... |
|------|------------|
| `data-flow.html` | High-level service/event flows — which services talk to which |
| `sequence-diagram.html` | Per-scenario step-by-step interactions with exact message order |
| `architecture.html` | Component structure + C4 system context + external integrations |
| `deployment.html` | Infrastructure, environments, ops concerns, CI/CD pipeline |
| `apis.html` | API endpoint design, HTTP methods, request/response contracts |

#### Sequence trigger keywords (ENH-029)
Khi user nhắc đến: `scenario`, `step by step`, `login flow`, `checkout flow`, `detailed interaction`, `sequence`, `interaction diagram` → update `sequence-diagram.html` + update `notes.md ## sequences` section.

#### Deployment trigger keywords (ENH-029)
Khi user nhắc đến: `deploy`, `deployment`, `infrastructure`, `infra`, `environment`, `staging`, `production`, `prod`, `AWS`, `GCP`, `Azure`, `Docker`, `Kubernetes`, `k8s`, `CI/CD`, `pipeline`, `server`, `hosting`, `cloud` → update `deployment.html` + update `notes.md ## deployment` section.

#### APIs trigger keywords (ENH-029)
Khi user nhắc đến: `endpoint`, `API`, `REST`, `GraphQL`, `gRPC`, `route`, `HTTP`, `POST`, `GET`, `PUT`, `DELETE`, `PATCH`, `request`, `response`, `payload`, `auth header` → update `apis.html` + update `notes.md ## apis` section.

#### ERD trigger keywords (ENH-027)
Khi user nhắc đến bất kỳ keyword: `database`, `entity`, `table`, `schema`, `relation`, `relationship`, `foreign key`, `primary key`, `ERD`, `data model`, `normalization` → update `erd.html` + update `notes.md ## erd` section.

#### Use Case trigger keywords (ENH-028)
Khi user nhắc đến: `user story`, `use case`, `actor`, `persona`, `as a user`, `user flow`, `workflow`, `journey`, `role`, `permission` → update `user-use-cases.html` + update `notes.md ## use_cases` section.

#### Dialogue cadence

1. Sau mỗi **major decision** (tech stack, service boundary, data model) → update HTML section liên quan + update `notes.md`.
2. Khi user **thay đổi quyết định** → **incremental update**: chỉ sửa section liên quan; giữ nguyên tất cả sections khác. Thêm `data-updated="true"` attribute + class `.updated` CSS highlight (yellow left border + "updated" badge) vào element vừa đổi.
3. **`/review-arch`** command → ViePilot output bảng tóm tắt tất cả `decisions` (từ `notes.md`) + danh sách `open_questions` với status; hỏi user confirm trước khi tiếp tục.

#### Incremental update rule

Khi một quyết định thay đổi:
- Xác định **file HTML liên quan** (ví dụ: tech stack thay đổi → chỉ sửa `tech-stack.html` + `architecture.html`).
- **Không** tái tạo toàn bộ workspace.
- Thêm `data-updated="true"` vào `<section>` hoặc `<tr>` đã thay đổi.
- Update `notes.md` YAML (`updated` date + entry tương ứng).
- Giữ nguyên `decisions.html` history — chỉ thêm dòng mới hoặc update `status` field (không xóa lịch sử).

#### notes.md YAML schema

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

## erd
entities:
  - name: User
    attributes: [id, email, name, created_at]
    primary_key: id
  - name: Order
    attributes: [id, user_id, total, status]
    primary_key: id
    foreign_keys:
      - user_id → User.id
relationships:
  - from: User
    to: Order
    type: one-to-many
    label: places

## use_cases
actors:
  - name: Guest
    role: Unauthenticated visitor
  - name: User
    role: Registered member
user_stories:
  - id: US001
    as_a: User
    i_want: to register an account
    so_that: I can access premium features
    priority: must-have
    status: open

## apis
style: REST  # REST | GraphQL | gRPC | WebSocket
services:
  - name: "{Service 1}"
    endpoints:
      - method: GET
        path: /api/resource
        auth: true
        notes: "{notes}"
      - method: POST
        path: /api/resource
        auth: true
        notes: "{notes}"
design_decisions:
  - decision: Authentication
    choice: "{JWT / Session / OAuth2 / API Key}"
    rationale: "{rationale}"
```

### Background UI Extraction (silent mode) — ENH-026

Chạy **ngầm** trong mọi phiên brainstorm (không cần `--ui` flag). Không ngắt hội thoại chính.

#### Signal keywords
Khi assistant nhận thấy bất kỳ keyword nào (case-insensitive, tiếng Việt hoặc tiếng Anh) trong tin nhắn user hoặc phần tóm tắt session:

> `màu`, `màu sắc`, `color`, `layout`, `màn hình`, `screen`, `page`, `trang`, `button`, `nút`, `form`, `biểu mẫu`, `mobile`, `responsive`, `giao diện`, `UI`, `UX`, `design`, `dashboard`, `sidebar`, `header`, `footer`, `modal`, `popup`, `icon`, `theme`, `typography`, `font`, `spacing`, `grid`, `card`, `component`, `hero`, `banner`

#### Threshold & accumulation rule
- **Đếm số lần xuất hiện unique keyword** trong session đang diễn ra.
- Khi đạt **≥3 unique signal occurrences**: bắt đầu **silent accumulation** — ghi nhận ý tưởng UI vào buffer `ui_idea_buffer[]` trong context session.
- **Non-blocking**: không interrupt hội thoại chính, không yêu cầu user xác nhận ngay.
- Mỗi entry trong buffer ghi: keyword trigger, ngữ cảnh câu nói (tóm tắt ngắn ≤20 từ).

#### Surface triggers (khi nào hỏi user)
Hiển thị confirmation dialogue khi xảy ra một trong các điều kiện sau:
- (a) **Topic kết thúc** — user gõ `/topic` để chuyển sang topic mới hoặc nói "tiếp theo"
- (b) **User gõ `/save` hoặc `/review`**
- (c) **≥5 signals accumulated** trong buffer

#### Confirmation dialogue template
```
💡 Tôi phát hiện một số ý tưởng UI trong phiên này:
- {idea 1 extracted from buffer}
- {idea 2 extracted from buffer}
...

Bạn muốn:
1. Lưu vào ui-direction/notes.md (background extraction)
2. Lưu + kích hoạt UI Direction Mode để generate HTML direction
3. Bỏ qua, tiếp tục brainstorm
```

**Option 1**: Ghi `## Background extracted ideas` vào `.viepilot/ui-direction/{session-id}/notes.md` (tạo file/thư mục nếu chưa có). Xóa buffer. Tiếp tục.

**Option 2**: Ghi vào notes.md (như Option 1) **+ trigger đầy đủ workflow `### UI Direction Mode`** (tạo `index.html`, `style.css`). Xóa buffer. Tiếp tục trong UI Direction Mode.

**Option 3**: Giữ nguyên buffer (không xóa, không ghi). Tiếp tục brainstorm. Re-surface tại trigger tiếp theo.

#### Auto-write path (Option 1 + 2)
```bash
mkdir -p .viepilot/ui-direction/{session-id}
# Append to notes.md (create if missing):
# ## Background extracted ideas
# - {idea from buffer, with source context}
```

### UI Direction — UX walkthrough & upgrade (FEAT-010)

Khi đang trong **`/vp-brainstorm --ui`** hoặc đã có `.viepilot/ui-direction/{session-id}/` cho phiên hiện tại, user có thể gọi:

- **`/research-ui`** — chạy đủ pipeline dưới đây
- **`/research ui`** — **alias** của `/research-ui` (khoảng trắng sau `research`; không trùng `/research {chủ đề tự do}`)

User có thể kèm ngữ cảnh một dòng (vd. tên sản phẩm **Trips**, persona, flow ưu tiên) — nhập vào cùng tin nhắn lệnh.

Áp dụng **các phase tuần tự** (assistant không bỏ qua phase trừ khi user explicit “chỉ phase 1”):

#### Phase 1 — Mô phỏng người dùng cuối

1. Đóng vai **người dùng cuối** đang dùng prototype (lấy tên app / màn chính từ `notes.md`, HTML, hoặc prompt user).
2. Liệt kê **3–8 scenario** cụ thể (vd. lần đầu mở app, hoàn tất task chính, lỗi edge case) — ưu tiên đúng page nếu multi-page (`pages/*.html`).
3. Với từng scenario: mô tả **hành vi** (đọc/click tưởng tượng trên UI hiện tại) → ghi **pain**: mơ hồ, thiếu phản hồi, quá nhiều bước, không khớp mental model, khả năng mobile/a11y, v.v.
4. Tổng hợp **Voice of pseudo-user** (bullet + mức độ **low / medium / high**).
5. **Stress nội dung & tràn layout (content stress pass)** — *bắt buộc trong mỗi lần `/research-ui`*: sau happy/edge hành vi, mô phỏng **dữ liệu ở biên** trên từng màn/page quan trọng (hoặc toàn hub nếu single-screen). Tối thiểu xét **3–6 loại** sau (chọn đúng ngữ cảnh sản phẩm; bỏ qua mục không áp dụng nhưng **ghi rõ “N/A + lý do”**):
   - **Copy dài**: tiêu đề, subtitle, CTA, placeholder ô nhập, tooltip, breadcrumb, tên địa điểm/người dài (Unicode), email/URL dài.
   - **Khối lượng**: danh sách/grid **nhiều phần tử**, bảng nhiều cột/hàng, thẻ/tag/badge chồng, notification stack, lịch nhiều sự kiện.
   - **Số & định dạng**: số tiền rất lớn/nhỏ, đơn vị dài, múi giờ/ngôn ngữ (nếu product có).
   - **Trạng thái lỗi / validation**: message lỗi dài, nhiều lỗi cùng lúc, inline + banner.
   - **Empty vs cực đầy**: không dữ liệu vs max items; skeleton vs flash of long content.
   - **Viewport**: cùng stress trên **hẹp** (mobile) và **rộng** (desktop) nếu prototype nhắm đa kích thước.

   **Stress recipes theo archetype (ENH-020)** — sau khi áp checklist trên, **chốt 1–2 archetype** khớp sản phẩm (từ `notes.md` / HTML / user) và áp **ít nhất hai recipe** trong mỗi hàng đã chọn (có thể diễn đạt lại bằng ngôn ngữ session; **ghi rõ archetype** trong Stress findings):

   | Archetype | Ưu tiên stress (recipe gợi ý) | Ghi chú |
   |-----------|------------------------------|---------|
   | **Landing / marketing** | Hero **headline** cực ngắn vs cực dài; **pricing** 3–5 tier + feature list dài mỗi tier; **FAQ** 10–20 mục (accordion/stack); **logo / social proof** hàng 8–15 logo + tên dài | Sticky CTA vs nội dung dài; section order khi overflow |
   | **App shell / SaaS admin** | **Bảng** nhiều cột + nhiều hàng; **filter bar** chip + dropdown tràn; **sidebar** nhiều cấp; **notification** stack / toast chồng | Trạng thái dense vs comfortable; frozen column |
   | **Form-heavy / wizard** | **Label + hint** dài; **multi-step** 5–7 bước + breadcrumb dài; **lỗi** inline từng field + banner tổng; khối **optional fields** mở rộng | Tab order, submit disabled ambiguity |
   | **Content / reader** | **Bài** cực dài; **code block** rộng; **TOC** 20–40 heading; **related** 8–15 thẻ | Max line length, sidenote, mobile đọc |
   | **Commerce / booking / marketplace** | **Kết quả tìm** grid dày; **giá** + đơn vị + discount dài; **ngày giờ** + múi giờ + DST; **đặt chỗ** (ghế, phòng) + availability text dài | Giỏ / summary trên mobile |

   Hybrid (vd. marketing + app): **gộp recipe** từ các hàng liên quan; tránh lặp cùng một stress vô nghĩa trên hai màn giống nhau.

   Với prototype chỉ có nội dung mẫu ngắn: **không bắt buộc** sửa file ngay ở Phase 1 — hãy **mô tả giả định** (“nếu title 120 ký tự thì…”) và UI sẽ **tràn, ellipsis, scroll, overlap, wrap xấu** thế nào.
6. Tổng hợp thêm **Stress findings** (bullet: loại stress → quan sát → severity **low/medium/high**) và merge vào tổng kết Phase 1 cho Phase 2.

#### Phase 2 — UX designer + research

1. Đổi vai: **UX/UI designer** nhận feedback từ Phase 1 (**gồm cả Stress findings**).
2. Map pain → **nguyên nhân thiết kế** (heuristic ngắn, pattern thiếu/sai); **ưu tiên hóa** P0 / P1 / P2 — **ưu tiên P0** nếu stress nội dung gây **mất thông tin, click sai, hoặc không dùng được** (overflow che CTA, text cắt nghĩa, bảng tràn không đọc được).
3. **Web research**: khi cần benchmark hoặc pattern chuẩn ngành, chạy **1–3 truy vấn** (search) → tóm tắt nguồn, takeaway, trade-off.
4. **Đề xuất cải tiến** cụ thể (thành phần UI, copy, layout, luồng) gắn với file/page (`slug` nếu multi-page).

#### Phase 3 — Cập nhật artifact

1. Sửa **`index.html`**, **`pages/*.html`**, **`style.css`** theo P0 → P1 trong phạm vi phiên (prototype direction, không ép production).
2. Trong **`notes.md`**, thêm hoặc append section **`## UX walkthrough log`** (một entry mỗi lần chạy lệnh): ngày/scenario đã mô phỏng, pain chính, **Stress findings** (tóm tắt), link research (nếu có), **diff ý định** (bullet), file đã đổi. *Tùy chọn:* chỉnh HTML với **placeholder/copy dài** hoặc thêm **demo row** để minh họa stress đã bàn (ghi trong log).
3. **Multi-page**: sau chỉnh sửa page, giữ **`## Pages inventory`** và **hub** khớp 100% file trong `pages/*` (hook FEAT-007).

**Quan hệ với `/research {topic}`**: lệnh **tự do** chỉ cần research ngắn và quay lại topic; **`/research-ui`** bắt buộc **3 phase** + **ghi log** + **chỉnh HTML/CSS khi có đề xuất hợp lý**.

Tham chiếu user: `docs/user/features/ui-direction.md`.

### Kết thúc mỗi topic
- Tóm tắt decisions
- List action items
- Note open questions
- Nếu topic thêm/sửa capability: cập nhật **`## Phases`** trong bản nháp session (hoặc nhắc user lưu `/save`) với phase phù hợp
</step>

<step name="project_meta_intake">
## 5. Project meta intake (FEAT-009)

Normative contract: **`docs/dev/global-profiles.md`** (`~/.viepilot/profiles/`, `~/.viepilot/profile-map.md`, `.viepilot/META.md`).

### 5.1 When this step runs

Chạy **trước** khi ghi session ở trạng thái **`Completed`** hoặc khi user gõ **`/end`**, **nếu**:

1. **Scope locked**: `## Phases` trong bản nháp session đã có nội dung thật (tất cả features đã được gán phase) **hoặc** user vừa xác nhận bằng lời đã chốt scope.
2. **Binding thiếu**: không tồn tại `.viepilot/META.md` **hoặc** frontmatter thiếu `viepilot_profile_id` hợp lệ (slug `kebab-case` theo contract).

**Bỏ qua mặc định** (skip intake) khi `.viepilot/META.md` đã có `viepilot_profile_id` hợp lệ — chỉ hỏi nhanh: *“Giữ profile `{id}`? Đổi profile?”*; nếu giữ → sang bước Save.

### 5.2 Chuẩn bị registry

1. `mkdir -p "$HOME/.viepilot/profiles"` nếu cần.
2. Đọc `~/.viepilot/profile-map.md` nếu có để liệt kê profile hiện có (profile_id, display_name, org_tag).

### 5.3 Disambiguation (nhiều profile / nhiều org)

- Nếu brainstorm cho thấy **nhiều org/client** hoặc **≥2 dòng trong profile-map** khớp gợi ý (cùng `org_tag` hoặc tag): **bắt buộc** user chọn **một** `profile_id` **hoặc** chọn **Tạo profile mới** (slug mới, chưa tồn tại).

### 5.4 Q&A tuần tự (một câu mỗi lượt)

Với mỗi câu hỏi:

1. Đưa **Proposal** ngắn (1–2 câu) suy ra từ session + phase plan.
2. User trả lời **Accept proposal** / **Edit** (ghi nhận bản user).
3. Sang câu tiếp.

**Tối thiểu** phải làm rõ trước khi ghi file (khớp body sections trong global contract):

| Thứ tự | Câu hỏi (gợi ý) | Map tới |
|--------|------------------|---------|
| 1 | Tên hiển thị org/client hoặc “cá nhân”? | `display_name` |
| 2 | `org_tag` ngắn (vd. `acme`, `personal`)? | `org_tag` |
| 3 | Branding / giọng văn (audience, tone)? | body `## Branding & voice` |
| 4 | Legal / attribution công khai (nếu có)? | body `## Legal & attribution` |
| 5 | Website công khai (optional)? | frontmatter `website` |

Sau đó: chốt **`profile_id`** = slug filename (`kebab-case`).

### 5.5 Ghi artifact (machine + project)

1. **`~/.viepilot/profiles/<slug>.md`**: YAML frontmatter đủ key bắt buộc (`profile_id`, `display_name`, `org_tag`, `tags`, `last_updated`) + body sections đã thu thập. **Không** ghi secrets.
2. **`~/.viepilot/profile-map.md`**: thêm hoặc cập nhật dòng bảng (cột theo contract); cập nhật `last_used` = ngày hiện tại.
3. **`.viepilot/META.md`**: tạo/cập nhật từ `templates/project/VIEPILOT-META.md` với `viepilot_profile_id: <slug>`.

### 5.6 Ghi nhận trong session file

Trong bản nháp / file session, thêm section:

```markdown
## Project meta intake (FEAT-009)
- **status**: completed | skipped
- **profile_id**: {slug}
- **profile_path**: ~/.viepilot/profiles/{slug}.md
- **binding**: .viepilot/META.md
```

Nếu skipped (hiếm): phải có **`## Meta intake waiver`** trong cùng file session kèm **lý do** do user cung cấp.

### 5.7 Tiếp tục

Sau khi intake **completed** hoặc **hợp lệ skip** (META đã có profile) → chuyển sang **bước 6 — Save Session**.
</step>

<step name="save_session">
## 6. Save Session

Tạo/cập nhật file: `docs/brainstorm/session-{YYYY-MM-DD}.md`

```markdown
# Brainstorm Session - {YYYY-MM-DD}

## Session Info
- **Date**: {full date}
- **Participants**: User, Claude
- **Status**: In Progress | Completed

## Phases

### Phase 1
- {Feature / capability}

### Phase 2
- {Feature / capability}

### Phase 3 (và tiếp theo)
- {Feature / capability}

## Project meta intake (FEAT-009)

- **status**: not_started | completed | skipped
- **profile_id**:
- **profile_path**:
- **binding** (.viepilot/META.md):

_(Điền sau bước 5 — Project meta intake; xem `docs/dev/global-profiles.md`.)_

<!-- Nếu skipped: ## Meta intake waiver + lý do -->

## Architecture diagram applicability inputs

> Input contract for `/vp-crystallize` Step 4. Keep concise and explicit.

- **Project complexity**: simple | moderate | complex
- **Services/modules**: {single | multiple} + boundaries
- **Event-driven**: yes/no + channels (queue/webhook/cron)
- **Deployment shape**: local-only | single-env cloud | multi-env/distributed
- **User flow complexity**: simple | multi-step | multi-actor
- **Integration surface**: low | medium | high
- **Initial diagram hints** (optional): required / optional / N/A candidates

## Topics Discussed

### Topic 1: {Name}
**Context**: {brief context}

**Discussion**:
- Point 1
- Point 2

**Decisions**:
- [x] Decision 1
- [x] Decision 2

**Open Questions**:
- Question 1?

**Research Notes**:
- Query: {what was researched}
- Sources: {links / docs}
- Findings: {key points}
- Recommendation: {recommended direction}

**Landing Page Decisions** (if applicable):
- Chosen layout: {A|B|C|D|Custom}
- Section order: {hero -> proof -> features -> pricing -> faq -> cta}
- 21st.dev references:
  - {component/pattern 1}
  - {component/pattern 2}

**UI Direction Artifacts** (if applicable):
- Session id: {session-id}
- Layout: legacy (single `index.html`) | multi-page (`pages/*.html` + hub `index.html`)
- Files:
  - `.viepilot/ui-direction/{session-id}/index.html` (hub hoặc single-screen)
  - `.viepilot/ui-direction/{session-id}/style.css`
  - `.viepilot/ui-direction/{session-id}/notes.md` (must include `## Pages inventory` when `pages/` exists)
  - `.viepilot/ui-direction/{session-id}/pages/*.html` (when multi-page)
- Preview focus:
  - {layout/flow summary; list each page slug if multi-page}

**UX walkthrough log** (optional; FEAT-010 + ENH-019 + ENH-020 — khi đã chạy `/research-ui`):
- {YYYY-MM-DD}: scenarios exercised → top pains → **Stress findings** (tóm tắt) → research links → HTML/CSS edits summary

---

## Summary

### Key Decisions
1. Decision summary

### Action Items
- [ ] Action 1
- [ ] Action 2

### Next Steps
- What to do next

### Open Questions
- Unresolved questions
```

Commit:
```bash
mkdir -p docs/brainstorm
git add docs/brainstorm/
git commit -m "docs: brainstorm session {date}"
git push
```
</step>

<step name="suggest_next">
## 7. Suggest Next Action

```
✓ Brainstorm session saved

Summary:
- Topics covered: {count}
- Decisions made: {count}
- Open questions: {count}

Next step: /vp-crystallize
This will transform your brainstorm into:
- Project structure
- Architecture documents
- Development roadmap (phases + tasks from `## Phases` section)
```
</step>

</process>

<commands>
User có thể dùng các lệnh trong phiên brainstorm:

- `/topic {name}` - Chuyển sang topic mới
- `/summary` - Xem tóm tắt phiên hiện tại
- `/save` - Lưu tiến độ ngay
- `/end` - Kết thúc và lưu phiên (sau **bước 5 — Project meta intake** khi binding thiếu; xem workflow)
- `/questions` - Xem danh sách open questions
- `/research {topic}` - Research nhanh ngay trong phiên và quay lại topic hiện tại
- `/research-ui` — UX walkthrough: mô phỏng user → designer + research → cập nhật UI direction + log (`notes.md`) — chỉ khi có UI session (FEAT-010)
- `/research ui` — alias của `/research-ui`
- `/review-arch` — Architect Mode: output bảng tóm tắt decisions + open_questions từ `notes.md`, confirm trước khi tiếp tục (FEAT-011)
</commands>

<success_criteria>
- [ ] Session file created với đầy đủ sections
- [ ] `## Phases` present với ít nhất Phase 1 có nội dung thật
- [ ] Decisions có rationale
- [ ] Open questions tracked
- [ ] Action items captured
- [ ] Landing page topics trigger layout follow-up questions
- [ ] 21st.dev references được dùng khi thảo luận landing page
- [ ] Research có thể chạy ngay trong brainstorm session khi user yêu cầu
- [ ] **FEAT-010 + ENH-019 + ENH-020**: Trong UI Direction, `/research-ui` (hoặc `/research ui`) chạy đủ 3 phase, gồm **content stress pass** + **archetype stress recipes** + **`## UX walkthrough log`** (Stress findings) khi chỉnh prototype
- [ ] Git committed
- [ ] **FEAT-009**: Nếu binding thiếu và scope đã locked — đã chạy **Project meta intake** (bước 5) hoặc có **`## Meta intake waiver`** có lý do trước Completed
- [ ] **`## Project meta intake (FEAT-009)`** trong session: `status` + `profile_id` khi completed (hoặc waiver nếu skipped)
</success_criteria>
