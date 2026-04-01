<purpose>
Interactive brainstorm session để thu thập ý tưởng, requirements, và quyết định cho dự án.
Cho phép research ngay trong cùng phiên brainstorm khi cần.
</purpose>

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

Tham chiếu user: `docs/user/features/ui-direction.md`.

### Kết thúc mỗi topic
- Tóm tắt decisions
- List action items
- Note open questions
- Nếu topic thêm/sửa capability: cập nhật **`## Product horizon`** trong bản nháp session (hoặc nhắc user lưu `/save`) với tag tier phù hợp
</step>

<step name="save_session">
## 5. Save Session

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
## 6. Suggest Next Action

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
- `/end` - Kết thúc và lưu phiên
- `/questions` - Xem danh sách open questions
- `/research {topic}` - Research nhanh ngay trong phiên và quay lại topic hiện tại
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
- [ ] Git committed
</success_criteria>
