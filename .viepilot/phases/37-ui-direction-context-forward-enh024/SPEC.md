# Phase 37: ui-direction context forward (ENH-024)

## Goal
Fix chuỗi truyền tải ui-direction từ brainstorm → crystallize → vp-auto. Hiện tại chuỗi bị đứt ở crystallize Step 10: task files không có `context_required` trỏ vào ui-direction, dẫn đến vp-auto implement không nhìn thấy design artifacts.

## Request
ENH-024

## Affected Files
- `~/.cursor/viepilot/workflows/crystallize.md` — Step 1A (trigger) + Step 10 (task generation)
- `~/.cursor/viepilot/workflows/autonomous.md` — Step 3a (Load Task Context)
- `~/.cursor/viepilot/templates/project/AI-GUIDE.md` — Quick Lookup table

## Tasks

| Task | Description | Complexity |
|------|-------------|------------|
| 37.1 | `crystallize.md` Step 1A — đổi trigger từ "if indicates" → mandatory khi `ui-direction/` exists | S |
| 37.2 | `crystallize.md` Step 10 — inject `context_required` ui-direction vào task files cho UI tasks | M |
| 37.3 | `autonomous.md` Step 3a — thêm safety check: warn + auto-load nếu UI task thiếu ui-direction context | S |
| 37.4 | `templates/project/AI-GUIDE.md` — thêm row ui-direction vào Quick Lookup table | S |

## Dependencies
- ENH-023 (Phase 36) ✅ complete

## Verification
- [ ] `crystallize.md` Step 1A có hardcoded check `ls .viepilot/ui-direction/`
- [ ] `crystallize.md` Step 10 có instruction inject `context_required` cho UI tasks
- [ ] `autonomous.md` Step 3a có UI safety check block
- [ ] `templates/project/AI-GUIDE.md` có row ui-direction

## Version Bump
PATCH (1.9.6 → 1.9.7) — workflow/template text fix
