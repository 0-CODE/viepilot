# Phase 42 — ENH-026: vp-brainstorm UI mode background extraction + crystallize hard gate

## Goal
Nâng cấp `vp-brainstorm` để tự động nhận diện và trích xuất ý tưởng UI/UX trong mọi phiên brainstorm (background extraction), đồng thời tăng cường `vp-crystallize` thành hard gate khi dự án có UI scope nhưng thiếu `ui-direction` artifacts.

## Background
ENH-026 giải quyết 2 vấn đề liên quan:
1. **Brainstorm**: UI Direction Mode hiện chỉ kích hoạt khi user dùng flag `--ui`; ý tưởng UI ẩn trong hội thoại thường bị bỏ qua.
2. **Crystallize**: Step 1A kiểm tra artifacts nhưng chỉ warn nhẹ — không block khi thiếu, dẫn đến UI vision bị mất.

## Tasks

### Task 42.1 — brainstorm.md: UI signal keywords + background extraction spec
**File**: `workflows/brainstorm.md`

**Changes**:
- Thêm section `### Background UI Extraction (silent mode)` vào sau `### UI Direction Mode`:
  - Định nghĩa **UI signal keywords** (danh sách: màu sắc, layout, màn hình, page, button, form, mobile/web, responsive, v.v.)
  - Quy tắc **threshold**: ≥3 unique signal occurrences trong session → kích hoạt background accumulation
  - **Silent accumulation**: buffer `ui_idea_buffer[]` trong session context, không interrupt hội thoại
  - **Surface rule**: surface để user xác nhận khi (a) topic kết thúc, (b) user gõ `/save` hoặc `/review`, hoặc (c) ≥5 signals accumulated
  - **Auto-write path**: khi user confirm → tạo/update `.viepilot/ui-direction/{session-id}/notes.md` với section `## Background extracted ideas`

**Acceptance**:
- [ ] Section rõ ràng, có list keywords, threshold, accumulation rule, surface triggers, auto-write path
- [ ] Không interrupt brainstorm chính (phải ghi rõ "silent" và "non-blocking")

### Task 42.2 — brainstorm.md: periodic surface + confirmation dialogue
**File**: `workflows/brainstorm.md`

**Changes**:
- Thêm **confirmation dialogue template** khi surface:
  ```
  Trong phiên này tôi phát hiện một số ý tưởng UI:
  - {idea 1}
  - {idea 2}
  ...
  Bạn muốn lưu vào ui-direction artifacts không?
  1. Có, lưu vào notes.md
  2. Có, lưu + kích hoạt UI Direction Mode (generate HTML)
  3. Không, tiếp tục brainstorm
  ```
- Ghi rõ option 2 → trigger full `### UI Direction Mode` workflow

**Acceptance**:
- [ ] Dialogue template có trong workflow
- [ ] Option 2 link đến UI Direction Mode section
- [ ] Option 3 không mất data (buffer giữ nguyên)

### Task 42.3 — crystallize.md: Step 1A → hard gate
**File**: `workflows/crystallize.md`

**Changes** trong `<step name="consume_ui_direction">`:
- Thêm **UI scope detection** trước khi check artifacts:
  - Scan brainstorm sessions: detect ≥3 UI signals (same keyword list)
  - Nếu `ui_scope_detected = true` VÀ artifacts không tồn tại → **STOP**:
    ```
    ⚠️ UI Direction artifacts missing
    
    Phiên brainstorm cho thấy dự án có UI scope nhưng chưa có ui-direction artifacts.
    
    1. Quay lại /vp-brainstorm --ui để tạo direction trước
    2. Tiếp tục với assumptions (ghi limitations vào ARCHITECTURE.md)
    ```
  - Option 2 → ghi block `## UI Direction Assumptions` vào `.viepilot/ARCHITECTURE.md`
- Nếu `notes.md` tồn tại nhưng không có `## Pages inventory` và scope multi-page → cảnh báo tương tự

**Acceptance**:
- [ ] Hard gate với 2 options rõ ràng
- [ ] Option 2 ghi assumptions vào ARCHITECTURE.md (không silent skip)
- [ ] Multi-page check vẫn còn và được enforce

### Task 42.4 — skills: vp-brainstorm + vp-crystallize SKILL.md update
**Files**:
- `skills/vp-brainstorm/SKILL.md`
- `skills/vp-crystallize/SKILL.md`

**Changes**:
- `vp-brainstorm`: bump version → `0.8.0`, thêm dòng mô tả "Background UI extraction (ENH-026)" trong capabilities list
- `vp-crystallize`: bump version → `0.5.0`, thêm "UI direction hard gate (ENH-026)" trong capabilities list

**Acceptance**:
- [ ] Version bumped trong frontmatter
- [ ] ENH-026 mention trong description/capabilities

### Task 42.5 — Jest contract tests
**File**: `tests/vp-enh026-ui-extraction-contracts.test.cjs` (new)

**Tests**:
1. `brainstorm background extraction: signal threshold ≥3 triggers accumulation` — verify keyword list contains expected terms
2. `brainstorm surface dialogue: option 2 mentions UI Direction Mode` — string check trong workflow
3. `crystallize hard gate: blocks when ui scope detected + no artifacts` — string check "⚠️ UI Direction" + "STOP" / block language
4. `crystallize hard gate: option 2 writes to ARCHITECTURE.md` — string check assumptions path
5. `crystallize multi-page check: Pages inventory validation present` — verify still in Step 1A

**Acceptance**:
- [ ] All 5 tests pass
- [ ] `npm test` total count ≥ (baseline + 5)

### Task 42.6 — docs update: ui-direction.md
**File**: `docs/user/features/ui-direction.md`

**Changes**:
- Thêm section `## Background Extraction` mô tả luồng tự động
- Update `## Crystallize Integration` để phản ánh hard gate behavior
- Update version note cuối file

**Acceptance**:
- [ ] Section Background Extraction có ví dụ thực tế
- [ ] Hard gate behavior được mô tả với screenshots/dialogue examples

## Files Changed Summary
- `workflows/brainstorm.md` — background extraction section (42.1, 42.2)
- `workflows/crystallize.md` — hard gate Step 1A (42.3)
- `skills/vp-brainstorm/SKILL.md` — version bump + note (42.4)
- `skills/vp-crystallize/SKILL.md` — version bump + note (42.4)
- `tests/vp-enh026-ui-extraction-contracts.test.cjs` — new (42.5)
- `docs/user/features/ui-direction.md` — update (42.6)

## Version
MINOR bump: **1.9.11 → 1.10.0**

## Verification Commands
```bash
npm test
grep -n "Background UI Extraction" workflows/brainstorm.md
grep -n "hard gate\|⚠️ UI Direction" workflows/crystallize.md
```
