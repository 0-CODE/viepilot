# UI Direction Mode

`/vp-brainstorm --ui` bật flow thiết kế trực quan ngay trong phiên brainstorm.

## Mục tiêu
- Chốt hướng UI/UX sớm bằng prototype định hướng
- Ghi quyết định thiết kế cùng ngữ cảnh nghiệp vụ
- Tạo đầu vào rõ ràng cho `/vp-crystallize`, kể cả khi sản phẩm có **nhiều page** (FEAT-007)

## Hai layout được hỗ trợ

### A) Legacy — một file chính (FEAT-002)
Dùng khi chỉ có một màn hình / một luồng prototype đơn.

```text
.viepilot/ui-direction/{session-id}/
  index.html    # toàn bộ direction
  style.css
  notes.md      # rationale, assumptions, references
```

### B) Multi-page — mỗi page một HTML (khuyến nghị khi ≥2 màn)
Dễ diff, dễ review, dễ map sang routing thật sau này.

```text
.viepilot/ui-direction/{session-id}/
  index.html           # hub: liên kết tới mọi page (nav / danh sách)
  style.css            # shared styles (tránh copy lớn giữa các file)
  pages/
    landing.html
    dashboard.html
    ...
  notes.md             # rationale + bảng inventory (bắt buộc khi có pages/)
```

- **`index.html`**: không bắt buộc trùng nội dung với một page cụ thể; nên là **mục lục + link** tới `pages/*.html` để mở nhanh từng màn.
- **`pages/{slug}.html`**: một file cho một page/screen; đặt `slug` ổn định (trùng tên route dự kiến nếu đã biết).

## `notes.md` — nguồn sự thật

Luôn ghi:
- rationale, assumptions, references (21st.dev, v.v.)

### Hook bắt buộc khi thư mục `pages/` tồn tại

Sau **mỗi** lần thêm / đổi tên / xóa file trong `pages/`, assistant **phải** cập nhật:

1. Liên kết trong `index.html` (hub).
2. Section **`## Pages inventory`** trong `notes.md` (bảng đầy đủ mọi page hiện có).

Mẫu bảng (copy-paste và điền):

```markdown
## Pages inventory

| Slug | File | Title | Purpose | Key sections | Nav to |
|------|------|-------|---------|--------------|--------|
| landing | pages/landing.html | Marketing home | Acquire signups | hero, features, CTA | signup, login |
| dashboard | pages/dashboard.html | App shell | Overview metrics | sidebar, charts, alerts | settings |
```

- **Slug**: định danh ngắn, ổn định.
- **File**: đường dẫn tương đối từ thư mục session.
- **Nav to**: slug hoặc tên page đích (comma-separated).

Nếu **không** có thư mục `pages/`, không cần section `## Pages inventory` (layout legacy).

## UX walkthrough — `/research-ui` (FEAT-010)

Sau khi có prototype trong `.viepilot/ui-direction/{session-id}/`, bạn có thể **đánh giá và nâng cấp** bằng lệnh trong phiên brainstorm UI:

| Lệnh | Ý nghĩa |
|------|---------|
| `/research-ui` | Pipeline đầy đủ (xem dưới) |
| `/research ui` | Cùng nội dung (alias; có khoảng trắng sau `research`) |

**Pipeline (3 phase)** — normative: `workflows/brainstorm.md` (mục *UI Direction — UX walkthrough & upgrade*):

1. **End-user simulation** — AI đóng vai người dùng cuối: đi qua 3–8 scenario trên UI hiện tại, ghi pain (mơ hồ, thiếu feedback, quá nhiều bước, …) và mức độ. **Sau đó** chạy **content stress pass** (ENH-019): copy dài, list/grid đầy, số & validation dài, empty vs max, viewport hẹp/rộng — phát hiện tràn layout / ellipsis / scroll / overlap; ghi **Stress findings** (có thể mô tả giả định nếu prototype chưa có data thật). **ENH-020:** chọn **archetype** (landing, SaaS admin, form/wizard, reader, commerce/booking) và áp **≥2 recipe** từ bảng trong `workflows/brainstorm.md` cho mỗi archetype đã chọn.
2. **Designer + research** — Đổi vai UX/UI designer: ưu tiên P0/P1/P2 (**P0** nếu stress nội dung làm hỏng luồng), **web search** khi cần benchmark/pattern, đề xuất cải tiến theo từng page/slug.
3. **Cập nhật artifact** — Sửa HTML/CSS, và trong **`notes.md`** thêm section **`## UX walkthrough log`** (entry: ngày, scenario, pain, **Stress findings**, link research, tóm tắt thay đổi; tùy chọn placeholder dài để minh họa). Multi-page: vẫn giữ **hub** + **`## Pages inventory`** khớp `pages/*`.

Gợi ý: kèm tên sản phẩm hoặc ngữ cảnh trong cùng tin nhắn (vd. “Trips — ưu tiên luồng đặt chuyến”).

**Khác `/research {chủ đề}`**: lệnh tự do chỉ cần research ngắn và quay lại topic; **`/research-ui`** bắt buộc 3 phase + log + chỉnh prototype khi phù hợp.

## Background Extraction (ENH-026)

Kể từ **1.10.0**, bạn **không cần** gọi `--ui` để thu thập ý tưởng UI — `/vp-brainstorm` tự động nhận diện tín hiệu UI trong mọi phiên.

### Cách hoạt động

| Bước | Mô tả |
|------|-------|
| **1. Silent detection** | AI theo dõi các keyword UI (`màu`, `layout`, `page`, `button`, `giao diện`, v.v.) trong suốt hội thoại — không interrupt |
| **2. Accumulation** | Khi ≥3 keyword xuất hiện, ý tưởng UI được ghi vào buffer ngầm (`ui_idea_buffer`) |
| **3. Surface** | Khi topic kết thúc, bạn gõ `/save`/`/review`, hoặc ≥5 signals tích luỹ → AI đề xuất lưu |

### Ví dụ thực tế

Bạn đang brainstorm về tính năng đặt vé và nhắc đến:

> "tôi muốn **nút** màu **xanh**, **màn hình** danh sách vé cần rõ ràng, và **form** thanh toán đơn giản"

→ 3 keywords (`nút`, `màn hình`, `form`) → threshold đạt → buffer bắt đầu tích luỹ im lặng.

Khi topic kết thúc, AI hỏi:

```
💡 Tôi phát hiện một số ý tưởng UI trong phiên này:
- Nút màu xanh (CTA)
- Màn hình danh sách vé — yêu cầu layout rõ ràng
- Form thanh toán — thiết kế đơn giản

Bạn muốn:
1. Lưu vào ui-direction/notes.md (background extraction)
2. Lưu + kích hoạt UI Direction Mode để generate HTML direction
3. Bỏ qua, tiếp tục brainstorm
```

### Khác biệt với `--ui` mode

| | Background Extraction | UI Direction Mode (`--ui`) |
|---|---|---|
| **Kích hoạt** | Tự động (silent) | Chủ động (`--ui` hoặc chọn Option 2) |
| **Artifact tạo ra** | `notes.md` (`## Background extracted ideas`) | `index.html`, `style.css`, `notes.md` |
| **Gián đoạn brainstorm?** | Không (non-blocking) | Có thể (chuyển sang UI mode) |
| **Dùng khi** | UI là phụ, main focus là domain/arch | UI là trọng tâm phiên |

## Crystallize Integration

`/vp-crystallize` đọc `notes.md` trước, sau đó `index.html`, `style.css`, và **từng** `pages/*.html` (nếu có) để lên kiến trúc UI đủ page.

### Hard gate (ENH-026)

Kể từ **1.10.0**, Step 1A áp dụng **hard gate** khi phát hiện UI scope trong brainstorm nhưng thiếu artifacts:

```
⚠️ UI Direction artifacts missing

Phiên brainstorm cho thấy dự án có UI scope nhưng `.viepilot/ui-direction/` chưa có artifacts.

1. Quay lại /vp-brainstorm --ui để tạo direction trước (khuyến nghị)
2. Tiếp tục với assumptions — ghi vào ARCHITECTURE.md và proceed
```

**Option 1** (khuyến nghị): quay lại brainstorm và tạo direction trước — đảm bảo UI vision được capture đầy đủ.

**Option 2** (bypass): crystallize tiếp tục nhưng ghi block `## UI Direction Assumptions` vào `.viepilot/ARCHITECTURE.md`:

```markdown
## UI Direction Assumptions
> Auto-generated by crystallize (ENH-026 gate bypassed by user)
- UI scope detected in brainstorm but no ui-direction artifacts present
- Proceeding without visual direction; architecture decisions may need UI review later
```

Gate **chỉ kích hoạt** khi `ui_scope_detected = true` (≥3 UI signals trong brainstorm sessions). Dự án không có UI scope đi qua bình thường.

## Flow khuyến nghị
1. `/vp-brainstorm` (mọi phiên — background extraction hoạt động im lặng)
2. Hoặc `/vp-brainstorm --ui` nếu UI là trọng tâm.
3. (Optional) `/research-ui` để chạy walkthrough và nâng cấp prototype + `notes.md`.
4. Mỗi thay đổi page → cập nhật HTML + **hub + `## Pages inventory`** trong cùng một lượt.
5. `/vp-crystallize` — Step 1A hard gate kiểm tra artifacts trước khi tiến hành.

## Kiểm tra nhanh (optional)

```bash
node scripts/verify-ui-direction-pages.cjs
```

Script báo lỗi nếu có session có `pages/*.html` nhưng thiếu `## Pages inventory` hoặc thiếu tên file page trong `notes.md`.

---
_Cập nhật: 1.10.0 (ENH-026 — background extraction + crystallize hard gate)_
