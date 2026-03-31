# UI Components Library

Workflow curation UI components để tái sử dụng xuyên dự án.

## Stores
- Global: `~/.viepilot/ui-components/`
- Local project: `.viepilot/ui-components/`

## Skill
Sử dụng `/vp-ui-components` để:
- ingest component references (21st.dev prompt/link/snippet)
- phân loại taxonomy
- lưu artifacts chuẩn hóa
- cập nhật index cho tìm kiếm lại

## Artifact contract

```text
{store}/{category}/{component-id}/
  README.md
  SOURCE.md
  component.html
  component.css
  metadata.json
```

## metadata.json tối thiểu
- `id`
- `category`
- `source`
- `tags`
- `stack_notes`
- `status` (`raw`, `adapted`, `approved`)

## Stock components
ViePilot cài sẵn stock set trong `ui-components/` để dùng làm nguyên liệu thô ban đầu.
