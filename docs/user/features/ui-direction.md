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

## Flow khuyến nghị
1. `/vp-brainstorm --ui`
2. Chọn legacy hoặc multi-page theo số màn hình.
3. Mỗi thay đổi page → cập nhật HTML + **hub + `## Pages inventory`** trong cùng một lượt.
4. `/vp-crystallize` đọc `notes.md` trước, sau đó `index.html`, `style.css`, và **từng** `pages/*.html` (nếu có) để lên kiến trúc UI đủ page.

## Kiểm tra nhanh (optional)

```bash
node scripts/verify-ui-direction-pages.cjs
```

Script báo lỗi nếu có session có `pages/*.html` nhưng thiếu `## Pages inventory` hoặc thiếu tên file page trong `notes.md`.
