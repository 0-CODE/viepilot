# Feature: Autonomous Mode (`/vp-auto`)

Autonomous mode điều phối **toàn bộ** phase và task theo `workflows/autonomous.md`. Bạn **ít can thiệp** so với làm tay từng file, nhưng vẫn có **control points** và (trong chat) thường **phải tiếp tục** qua nhiều lượt nếu một lượt AI chỉ kịp một task.

## Overview

```
/vp-auto
  │
  ├── Phase 1 → Task 1.1 → Task 1.2 → Task 1.3 → Phase 1 ✅
  ├── Phase 2 → Task 2.1 → Task 2.2 → ...        → Phase 2 ✅
  └── Phase N → ...                               → Done 🎉
```

Mỗi task:
1. Tạo git checkpoint tag (`{project}-vp-p{N}-t{T}`)
2. Implement theo acceptance criteria
3. Verify (automated + manual nếu cần)
4. Commit với conventional commit message
5. Tạo done tag (`{project}-vp-p{N}-t{T}-done`)
6. Pass Git persistence gate (clean + pushed) trước khi mark done

## Flags

```bash
/vp-auto                  # Bắt đầu từ phase chưa complete (không bật --fast)
/vp-auto --from 3         # Bắt đầu từ phase 3
/vp-auto --phase 2        # Chỉ chạy phase 2
/vp-auto --fast           # Skip optional verifications
/vp-auto --dry-run        # Preview, không execute
```

## ViePilot Scope Policy (BUG-004)

- Mặc định, `/vp-auto` chỉ route/gợi ý các skill thuộc namespace `vp-*`.
- Nếu môi trường runtime có skills ngoài framework, workflow sẽ bỏ qua và ưu tiên skill ViePilot tương đương.
- Chỉ khi bạn ghi rõ yêu cầu mở rộng (explicit opt-in), agent mới được phép dùng external skills.

### Implementation routing (ENH-021)

- **`/vp-auto`** là **lane mặc định** để **implement** mã shipping sau khi đã có **phase/task plan** trên ROADMAP.
- **`/vp-request`** chỉ **ghi backlog** (`.viepilot/requests/*`, TRACKER) — **không** thay evolve + auto.
- **`/vp-evolve`** chỉ **planning** (ROADMAP, thư mục phase, SPEC/tasks) — **không** implement thay `/vp-auto`.
- **Chuỗi khuyến nghị:** `vp-request` → `vp-evolve` → **`vp-auto`**. Ngoại lệ: user **explicit** (*hotfix*, *sửa trong chat này*) — phải nêu rõ bypass.

### Doc-first gate (v0.8.2 / BUG-001)

Workflow `autonomous.md` yêu cầu **ghi nhận kế hoạch trong file task** và **`PHASE-STATE` → `in_progress`** trước khi chỉnh sửa deliverable. Xem `workflows/autonomous.md` — *Pre-execution documentation gate*.

### `/vp-auto` không có thêm arg — hiểu đúng

- **Không** có nghĩa “mỗi task bắt buộc dừng một lần” trong tài liệu workflow; đó không phải cờ ẩn.
- Có nghĩa bạn không truyền `--fast`, `--from`, `--phase`, `--dry-run` — verify *tùy chọn* sẽ được xử lý đầy đủ hơn so với `--fast`.
- Nếu **mọi phase** đã complete, workflow dừng ở banner “All phases complete” (không còn lặp task).

### Tại sao vẫn thấy “dừng” sau mỗi task?

1. **Chat / Cursor** — Một turn thường đủ cho một task (implement → verify → cập nhật state). Task tiếp theo: gọi lại `/vp-auto` hoặc nhắc tiếp trong cùng thread.
2. **Control points** — Conflict, fail quality gate, blocker, hoặc menu retry/skip/rollback.
3. **Manual verification** — Nếu `tasks/*.md` định nghĩa bước manual, AI được hướng dẫn hỏi bạn.
4. **Task contract** — Task thiếu mục bắt buộc (ENH-010) thì phải refine task trước khi code (dừng có chủ đích).

**Gợi ý:** Dùng `--fast` khi muốn giảm các bước verify *optional* (vẫn không bỏ gate bắt buộc đã mô tả trong task).

## Control Points

ViePilot tự động dừng và hỏi bạn khi:

```
⚠ Phase 2 (Database): Issue Encountered

Conflicting migration files detected.

Options:
1. Fix and retry
2. Skip task
3. Rollback task
4. Stop autonomous mode
```

**Khi nào xảy ra**:
- Conflicts với existing code
- Quality gate failures (tests fail, lint errors)
- Task cần user decision
- Blockers không thể tự resolve

## Quality Gates

Trước khi mark task done, ViePilot kiểm tra:

```
✅ acceptance_criteria_met
✅ automated_tests_pass
✅ no_lint_errors
```

Nếu bất kỳ gate nào fail → control point.

## Git Persistence Gate (BUG-003)

Trước khi `/vp-auto` được phép mark task/phase là PASS:

```bash
node bin/vp-tools.cjs git-persistence --strict
```

Gate chỉ PASS khi:
- Working tree sạch (không còn thay đổi chưa commit)
- Nhánh hiện tại có upstream
- Không còn commit local chưa push (`ahead_count = 0`)

Nếu fail, workflow phải vào control point và **không được** cập nhật state sang `done/complete`.

## Checkpoints

Mỗi task tạo 2 git tags:

```bash
viepilot-vp-p2-t3        # Bắt đầu task 3 của phase 2
viepilot-vp-p2-t3-done   # Hoàn thành task 3 của phase 2
```

Khi phase complete:
```bash
viepilot-vp-p2-complete  # Phase 2 hoàn thành
```

Legacy tags `vp-p...` vẫn được hỗ trợ khi list/rollback để tương thích dự án cũ.

Xem tất cả checkpoints:
```bash
vp-tools checkpoints
```

## Tips

- **Đừng interrupt** khi AI đang execute — đợi đến control point
- **`/vp-auto` không arg** ≠ bắt buộc dừng từng task trong spec; **`--fast`** giúp ít dừng ở verify tùy chọn
- **Sau mỗi task xong** — nếu AI kết thúc turn, chạy tiếp `/vp-auto` hoặc yêu cầu rõ task kế theo `PHASE-STATE.md`
- **Dùng `--dry-run`** trước khi chạy phase mới để preview
- **Mở terminal riêng** để chạy `vp-tools progress` theo dõi
- **Commit thường xuyên** — mỗi task là một atomic commit
