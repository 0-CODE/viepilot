# UI Direction Mode

`/vp-brainstorm --ui` bật flow thiết kế trực quan ngay trong phiên brainstorm.

## Mục tiêu
- Chốt hướng UI/UX sớm bằng prototype định hướng
- Ghi quyết định thiết kế cùng ngữ cảnh nghiệp vụ
- Tạo đầu vào rõ ràng cho `/vp-crystallize`

## Artifacts
Mỗi session UI tạo/cập nhật:

```text
.viepilot/ui-direction/{session-id}/
  index.html
  style.css
  notes.md
```

`notes.md` là nguồn sự thật cho:
- rationale
- assumptions
- references (bao gồm 21st.dev links/prompts)

## Flow khuyến nghị
1. `/vp-brainstorm --ui`
2. Cập nhật yêu cầu/điều chỉnh layout trong chat
3. Assistant cập nhật artifacts theo từng quyết định
4. `/vp-crystallize` đọc artifacts để map sang tech stack thật
