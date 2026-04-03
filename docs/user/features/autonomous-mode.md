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

## Recovery Layers (v2)

Khi verification fails, ViePilot **im lặng** thử recovery trước khi hỏi bạn:

```
Task fails verification
  └── L1 (Lint/format auto-fix) → re-verify → PASS? ✅ done
      └── L2 (Targeted test fix) → re-verify → PASS? ✅ done
          └── L3 (Scope reduction*) → re-verify → PASS? ✅ done (PARTIAL)
              └── Budget exhausted → Control Point ⚠ (bạn mới thấy)
```

**Silent contract**: Bạn **không thấy** L1/L2/L3 recovery đang chạy. Chỉ khi budget cạn → control point xuất hiện.

### Recovery Budget

| Complexity | L1 (lint) | L2 (test fix) | L3 (scope reduce) |
|---|---|---|---|
| S | 1 | 1 | 0 |
| M | 1 | 2 | 0 |
| L | 2 | 2 | 1 |
| XL | 2 | 3 | 1 |

Budget mặc định: M (khi task không khai báo `recovery_budget`).

### Recovery Overrides

```yaml
# Trong TASK.md — Task Metadata:
recovery_overrides:
  L3:
    block: true
    reason: "auth domain — scope reduction tạo security holes"
```

*L3 scope reduction bị auto-block cho compliance paths (auth, payment, crypto).*

### Gap G Extended — keyword scan (task text)

Trước **Execute Task**, workflow quét nội dung TASK.md (Objective, Acceptance Criteria, File-Level Plan, …) với **`COMPLIANCE_KEYWORDS_EXTENDED`**: `password`, `token`, `session`, `encrypt`, `stripe`, `payment`, `bcrypt`, `tls`, `migration`, `schema` (khớp chuỗi con, không phân biệt hoa thường).

- Nếu có hit và **`recovery_overrides.L3.block` chưa `true`** → **control point**: gợi ý bật `L3.block` + lý do, hoặc **chấp nhận rủi ro** (ghi nhận trong log).
- Khi user chọn tiếp tục **không** bật `L3.block`, append JSONL (non-blocking):

```jsonl
{"ts":"...","event":"compliance_keyword_ack","task":"2.3","phase":"02","hits":["stripe","payment"],"ack":"user_proceed_without_l3_block"}
```

Ở **crystallize** (sinh task mới): cùng danh sách từ khóa trên text mô tả task — **không tự động** set `L3.block` chỉ vì keyword nếu path-based (G1) chưa kích hoạt; bắt **user xác nhận** trước khi ghi Task Metadata (xem `workflows/crystallize.md` Step 10 G2).

## Scope Contract (v2)

Mỗi task khai báo `write_scope` — danh sách files/dirs được phép sửa:

```yaml
write_scope:
  - "src/feature-a/"
  - "tests/feature-a/"
```

Sau mỗi execution, ViePilot chạy **scope drift detection** (Tier 2 validation):
```bash
git diff --name-only HEAD
# so sánh với write_scope
```

Nếu có file ngoài `write_scope` → **control point ngay** (không recovery). HANDOFF.log sẽ có event `scope_drift`.

## HANDOFF.log — Audit Trail

`.viepilot/HANDOFF.log` là append-only JSONL log của mọi events:

```jsonl
{"ts":"...","event":"task_start","task":"2.3","phase":"02","complexity":"M"}
{"ts":"...","event":"token_budget_warning","task":"2.3","phase":"02","sub_task":"2.3a","used_pct":78,"severity":"warn"}
{"ts":"...","event":"l1_recovery","task":"2.3","attempt":1,"trigger":"lint_error"}
{"ts":"...","event":"scope_drift","task":"2.3","violations":["src/other/"]}
{"ts":"...","event":"task_pass","task":"2.3","phase":"02"}
```

**HANDOFF.log không được commit** (gitignored). Rotate tự động ở cuối mỗi phase → `logs/handoff-phase-N.log`.

## Control Points (v2)

ViePilot tự động dừng và hỏi bạn khi:

```
━━━ CONTROL POINT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: 2.3 — Continuous HANDOFF write
 Reason: recovery budget exhausted after L1x1 L2x2 L3x0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Options:
1. Fix and retry
2. Skip task
3. Rollback task
4. Stop autonomous mode
```

**State trong HANDOFF.json khi control point active:**
```json
{
  "control_point": {
    "active": true,
    "reason": "recovery budget exhausted...",
    "ts": "2026-04-02T14:30:00Z"
  }
}
```

Dùng `/vp-status` để xem control point banner bất cứ lúc nào.

**Khi nào xảy ra**:
- Recovery budget exhausted (sau L1/L2/L3 attempts)
- Scope drift violation (file ngoài write_scope)
- Task contract validation fail
- Gap G Extended: task text có keyword nhạy cảm nhưng chưa `L3.block` (xem mục Gap G Extended)
- Quality gate failures cần user decision

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
