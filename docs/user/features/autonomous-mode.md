# Feature: Autonomous Mode (`/vp-auto`)

Autonomous mode là tính năng cốt lõi của ViePilot — AI tự động thực thi toàn bộ project phases mà không cần bạn can thiệp từng bước.

## Overview

```
/vp-auto
  │
  ├── Phase 1 → Task 1.1 → Task 1.2 → Task 1.3 → Phase 1 ✅
  ├── Phase 2 → Task 2.1 → Task 2.2 → ...        → Phase 2 ✅
  └── Phase N → ...                               → Done 🎉
```

Mỗi task:
1. Tạo git checkpoint tag (`vp-p{N}-t{T}`)
2. Implement theo acceptance criteria
3. Verify (automated + manual nếu cần)
4. Commit với conventional commit message
5. Tạo done tag (`vp-p{N}-t{T}-done`)

## Flags

```bash
/vp-auto                  # Bắt đầu từ phase chưa complete
/vp-auto --from 3         # Bắt đầu từ phase 3
/vp-auto --phase 2        # Chỉ chạy phase 2
/vp-auto --fast           # Skip optional verifications
/vp-auto --dry-run        # Preview, không execute
```

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

## Checkpoints

Mỗi task tạo 2 git tags:

```bash
vp-p2-t3        # Bắt đầu task 3 của phase 2
vp-p2-t3-done   # Hoàn thành task 3 của phase 2
```

Khi phase complete:
```bash
vp-p2-complete  # Phase 2 hoàn thành
```

Xem tất cả checkpoints:
```bash
vp-tools checkpoints
```

## Tips

- **Đừng interrupt** khi AI đang execute — đợi đến control point
- **Dùng `--dry-run`** trước khi chạy phase mới để preview
- **Mở terminal riêng** để chạy `vp-tools progress` theo dõi
- **Commit thường xuyên** — mỗi task là một atomic commit
