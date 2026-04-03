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
5. Nếu session đã có section **`## Product horizon`**: tóm tắt nhanh MVP / Post-MVP / Future hiện có; mọi cập nhật sau đó phải **merge** vào section đó (không xóa im lặng, không làm mất tier tags) trừ khi user chủ động yêu cầu thu hẹp/mở rộng scope.
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

6. **Product horizon (MVP vs Post-MVP vs Future)** — **bắt buộc duy trì trong session file** khi user thảo luận bất kỳ tính năng / milestone nào:
   - **Mục tiêu**: tách rõ phạm vi ship đầu tiên với tầm nhìn sau MVP để `/vp-crystallize` không “mất” ý tưởng dài hạn.
   - **Quy ước tag** (đặt ở cuối dòng bullet): `(MVP)` | `(Post-MVP)` | `(Future)`.
   - **Non-goals for MVP**: những gì cố tình *không* làm ở bản đầu (tránh hiểu nhầm là quên).
   - **Deferred capabilities**: tính năng đã thống nhất nhưng **lùi sau MVP** — ghi rõ để crystallize map vào roadmap horizon.
   - Nếu sản phẩm **single-release** (không có post-MVP): ghi một dòng explicit trong session, ví dụ: `**Scope**: single-release only — no deferred epics.`

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
- Nếu topic thêm/sửa capability: cập nhật **`## Product horizon`** trong bản nháp session (hoặc nhắc user lưu `/save`) với tag tier phù hợp
</step>

<step name="project_meta_intake">
## 5. Project meta intake (FEAT-009)

Normative contract: **`docs/dev/global-profiles.md`** (`~/.viepilot/profiles/`, `~/.viepilot/profile-map.md`, `.viepilot/META.md`).

### 5.1 When this step runs

Chạy **trước** khi ghi session ở trạng thái **`Completed`** hoặc khi user gõ **`/end`**, **nếu**:

1. **Scope locked**: `## Product horizon` trong bản nháp session đã có nội dung thật (không chỉ placeholder) **hoặc** user vừa xác nhận bằng lời đã chốt scope MVP / horizon.
2. **Binding thiếu**: không tồn tại `.viepilot/META.md` **hoặc** frontmatter thiếu `viepilot_profile_id` hợp lệ (slug `kebab-case` theo contract).

**Bỏ qua mặc định** (skip intake) khi `.viepilot/META.md` đã có `viepilot_profile_id` hợp lệ — chỉ hỏi nhanh: *“Giữ profile `{id}`? Đổi profile?”*; nếu giữ → sang bước Save.

### 5.2 Chuẩn bị registry

1. `mkdir -p "$HOME/.viepilot/profiles"` nếu cần.
2. Đọc `~/.viepilot/profile-map.md` nếu có để liệt kê profile hiện có (profile_id, display_name, org_tag).

### 5.3 Disambiguation (nhiều profile / nhiều org)

- Nếu brainstorm cho thấy **nhiều org/client** hoặc **≥2 dòng trong profile-map** khớp gợi ý (cùng `org_tag` hoặc tag): **bắt buộc** user chọn **một** `profile_id` **hoặc** chọn **Tạo profile mới** (slug mới, chưa tồn tại).

### 5.4 Q&A tuần tự (một câu mỗi lượt)

Với mỗi câu hỏi:

1. Nếu đang có TTY tương tác, ưu tiên gọi `node bin/vp-tools.cjs ask --single --question "..." "A|Accept proposal" "B|Edit proposal"` cho câu hỏi 1-chọn; với câu hỏi nhiều lựa chọn dùng `--multi`. Nếu command unavailable hoặc không có TTY, fallback về numbered/text Q&A như cũ.
2. Đưa **Proposal** ngắn (1–2 câu) suy ra từ session + Product horizon.
3. User trả lời **Accept proposal** / **Edit** (ghi nhận bản user).
4. Sang câu tiếp.

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

## Product horizon

> Single source for **MVP / Post-MVP / Future** scope. Bắt buộc giữ section này khi tiếp tục session; crystallize đọc để không bỏ sót post-MVP.

### MVP (ship first)
- Capability / theme — `(MVP)`
- ...

### Post-MVP (after first release)
- Capability / theme — `(Post-MVP)`
- ...

### Future / exploratory
- Idea — `(Future)`
- ...

### Non-goals for MVP
- ...

### Deferred capabilities (from MVP)
- ...

**Scope note (optional):** Nếu không có post-MVP: `Single-release product — no separate horizon epics.`

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

### 6A. Generate Brainstorm Manifest (mandatory on /save and /end)

After writing/updating the session file, generate or update `.viepilot/brainstorm-manifest.json`:

1. **Initialize**: If `.viepilot/brainstorm-manifest.json` does not exist, copy from `templates/project/brainstorm-manifest.json` (via installed path).

2. **Update sessions[]**: Add or update entry for current session:
   ```json
   {"id": "session-{date}", "date": "{date}", "file_path": "docs/brainstorm/session-{date}.md", "topics_count": {N}, "status": "completed"}
   ```

3. **Scan session for artifacts** — for each artifact type, check if session content contains relevant material:

   | Artifact Type | Scan For | Path Value |
   |---------------|----------|------------|
   | `ui_direction` | `## UI Direction Artifacts` section or `.viepilot/ui-direction/` files | Path to ui-direction dir or notes.md |
   | `product_horizon` | `## Product horizon` section | Session file path + `#product-horizon` |
   | `research_notes` | `## Research Notes` blocks in any topic | Session file path + topic anchor |
   | `architecture_inputs` | `## Architecture diagram applicability inputs` | Session file path + section anchor |
   | `domain_entities` | Named nouns discussed as persisted objects (entities, models, tables) | Session file path; populate `entities[]` with `{name, type, needs_crud_api}` |
   | `tech_stack` | Technology/framework decisions (language, DB, framework, cloud) | Session file path; populate `stacks[]` with `{name, category, version}` |
   | `compliance_domains` | Mentions of auth, payment, encryption, PII, GDPR, HIPAA | Session file path; populate `domains[]` with `{name, severity}` |

4. **For each found artifact**: Set `path`, `summary` (1-line), `consumed: false`. Do NOT overwrite artifacts already marked `consumed: true` from a previous crystallize run.

5. **Populate `ui_task_context_hint[]`**: If `ui_direction` artifact found, list all file paths under `.viepilot/ui-direction/{session-id}/` (index.html, style.css, notes.md, pages/*.html).

6. **Write** `.viepilot/brainstorm-manifest.json`.

### 6B. Decision Anchor Injection (`vp:decision`)

After writing the session file and manifest, scan for decision bullets and inject HTML comment anchors for crystallize drift tracking.

**Scan**: Find all `**Decisions**:` blocks in the session file. For each decision bullet (`- [x] {text}`):

1. Generate a unique anchor ID: `{topic-slug}-d{N}` where `topic-slug` = slugified topic name, `N` = decision index within that topic
2. If the bullet does NOT already have a `<!-- vp:decision -->` anchor, inject one:
   ```markdown
   <!-- vp:decision id="tech-stack-d1" -->
   - [x] Use PostgreSQL for primary database
   ```
3. Add entry to `manifest.decisions[]`:
   ```json
   {"id": "tech-stack-d1", "text": "Use PostgreSQL for primary database", "anchor": "<!-- vp:decision id=\"tech-stack-d1\" -->", "session_id": "session-2026-04-03", "topic": "Tech Stack"}
   ```

**Backfill**: On `/save` of an existing session that has decision bullets without anchors, inject anchors for all existing decisions. This makes older sessions compatible with crystallize consumed tracking without requiring manual edits.

**Skip**: If no `**Decisions**:` blocks found in session, skip silently.

Commit:
```bash
mkdir -p docs/brainstorm
git add docs/brainstorm/ .viepilot/brainstorm-manifest.json
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
- Development roadmap (MVP phases + **Post-MVP / horizon** when documented above)
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
</commands>

<success_criteria>
- [ ] Session file created với đầy đủ sections
- [ ] `## Product horizon` present với MVP / Post-MVP / Future (hoặc explicit single-release statement)
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
