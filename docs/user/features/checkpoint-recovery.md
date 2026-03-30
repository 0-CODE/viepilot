# Feature: Checkpoint Recovery (`/vp-rollback`)

ViePilot tạo git checkpoint tags tại mỗi task — cho phép rollback an toàn đến bất kỳ điểm nào.

## Overview

```
vp-p1-t1 ──► vp-p1-t1-done ──► vp-p1-t2 ──► vp-p1-t2-done ──► vp-p1-complete
                                                    ↑
                                              Rollback đến đây
```

## How to Rollback

```
/vp-rollback
```

ViePilot hiển thị danh sách checkpoints:

```
Select checkpoint to restore:

1. vp-p2-t3-done  (Phase 2 Task 3 complete)   2026-03-30 14:30
2. vp-p2-t2-done  (Phase 2 Task 2 complete)   2026-03-30 13:45
3. vp-p2-t1-done  (Phase 2 Task 1 complete)   2026-03-30 12:00
4. vp-p2-complete (Phase 2 complete)           2026-03-30 11:00
5. vp-p1-complete (Phase 1 complete)           2026-03-29 18:00
```

Chọn số → ViePilot rollback về checkpoint đó.

## Safety

Rollback dùng `git revert` — **không phải** `git reset`:
- Lịch sử git được giữ nguyên
- Có thể undo rollback nếu cần
- Không mất commits

## Listing Checkpoints

```bash
vp-tools checkpoints
```

Output:
```
ViePilot Checkpoints

  TAG                         COMMIT    DATE
  ─────────────────────────────────────────────────────
  ✅ vp-p2-complete           a1b2c3d   2026-03-30 14:00
  ✔️  vp-p2-t3-done            b2c3d4e   2026-03-30 13:45
  📌 vp-p2-t3                  c3d4e5f   2026-03-30 12:00

  Total: 8 checkpoints
```

**Icons**:
- ✅ Phase complete
- ✔️ Task done
- 📌 Task start

## Manual Rollback (Advanced)

```bash
# Rollback đến specific tag
git revert --no-commit $(git rev-list vp-p2-t3..HEAD)
git commit -m "revert: rollback to vp-p2-t3"
```

## When to Use

- Task tạo ra code không đúng → rollback về task start
- Phase có vấn đề → rollback về phase start
- Muốn thử approach khác → rollback và retry
