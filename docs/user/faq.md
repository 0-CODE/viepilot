# Frequently Asked Questions

## General

### Q: ViePilot có yêu cầu AI provider cụ thể không?

A: ViePilot hoạt động với bất kỳ AI assistant nào có thể đọc Markdown và thực thi code. Hiện có host adapters rõ ràng cho **Cursor**, **Claude Code**, và **Codex**.

---

### Q: ViePilot có thể dùng với VS Code không?

A: Có. Phần workflow và CLI (`vp-tools`) hoạt động độc lập editor. Host bundles hiện hỗ trợ Cursor, Claude Code, và Codex.

---

### Q: Làm sao dùng ViePilot với Claude Code?

A: Chạy `npx viepilot install --target claude-code --yes` (ViePilot **≥ 1.9.4**): installer **tự copy** `vp-*` vào **`~/.claude/skills/`**. Với bản cũ hoặc chỉ target Cursor, symlink/copy thủ công từ `~/.cursor/skills/`. Chi tiết, verify `vp-tools info`, và chuỗi **`/vp-request` → `/vp-evolve` → `/vp-auto`**: xem [ViePilot trên Claude Code](claude-code-setup.md).

---

### Q: Làm sao dùng ViePilot với Codex?

A: Chạy `npx viepilot install --target codex --yes`. Installer sẽ copy `vp-*` vào `~/.codex/skills/` và mirror runtime bundle vào `~/.codex/viepilot/`. Chi tiết xem [ViePilot trên Codex](codex-setup.md).

---

### Q: Tôi có cần biết code để dùng ViePilot không?

A: Không nhất thiết. ViePilot giúp AI code cho bạn. Tuy nhiên, để review code và approve control points, hiểu biết cơ bản về programming sẽ hữu ích.

---

### Q: ViePilot có tốn tiền không?

A: ViePilot framework là **miễn phí và open source**. Bạn chỉ trả tiền cho AI provider (Cursor subscription hoặc Claude API).

---

## Technical

### Q: `.viepilot/` directory là gì?

A: Thư mục chứa toàn bộ project state của ViePilot:
```
.viepilot/
├── AI-GUIDE.md       # Navigation guide cho AI
├── TRACKER.md        # Progress tracking
├── ROADMAP.md        # Phases và tasks
├── HANDOFF.json      # Machine-readable state
└── phases/           # Phase-specific files
```

Commit thư mục này vào git — nó là "memory" của dự án.

---

### Q: HANDOFF.json là gì?

A: File JSON chứa machine-readable state: phase hiện tại, task, git HEAD, context. Được update sau mỗi task. Dùng để resume chính xác sau khi pause.

---

### Q: Tôi có thể edit `.viepilot/` files thủ công không?

A: Có, nhưng cẩn thận:
- `TRACKER.md`, `ROADMAP.md` — OK để edit
- `HANDOFF.json` — Dùng `vp-tools save-state` thay vì edit trực tiếp
- Phase PHASE-STATE.md — OK để edit status

---

### Q: Git tags `vp-p*` là gì?

A: Checkpoint tags được tạo tự động bởi ViePilot:
- `vp-p1-t1` — Bắt đầu task 1 của phase 1
- `vp-p1-t1-done` — Hoàn thành task 1
- `vp-p1-complete` — Hoàn thành phase 1

Dùng để rollback an toàn. Xem: `vp-tools checkpoints`

---

### Q: Tại sao `vp-tools progress` hiển thị 0% dù đã làm xong tasks?

A: `progress` command đọc `✅ Done` pattern trong PHASE-STATE.md. Nếu AI dùng format khác (ví dụ: `✔ Complete`), progress sẽ không tính đúng.

Fix: Update PHASE-STATE.md để dùng `✅ Done` format.

---

### Q: Tôi có thể dùng ViePilot cho dự án đã có sẵn không?

A: Có! Chạy `/vp-brainstorm` trong thư mục dự án hiện tại. ViePilot sẽ analyze existing code và tạo roadmap cho phần còn lại.

---

## Workflow

### Q: Khác nhau giữa `/vp-pause` và đóng Cursor là gì?

A: `/vp-pause` lưu full context vào `HANDOFF.json` và tạo `.continue-here.md` với instructions. Đóng Cursor không lưu context — bạn sẽ cần `/vp-resume` để restore state đúng cách.

---

### Q: Tôi có thể chạy nhiều phases song song không?

A: Không — ViePilot chạy phases tuần tự theo dependency order. Tuy nhiên, trong một phase, các independent tasks có thể được execute song song (tùy AI implementation).

---

### Q: `/vp-auto` dừng giữa chừng — phải làm gì?

A: Dùng `/vp-resume` để tiếp tục từ điểm dừng. Nếu có lỗi, dùng `/vp-debug` để investigate, sau đó `/vp-auto --from N` để restart từ phase N.

---

### Q: Làm sao thêm feature mới khi project đang chạy?

A: **`/vp-request --feature`** để **log** yêu cầu (file request + backlog). **`/vp-evolve`** (Add feature / New milestone) để **thêm phase + tasks** trên ROADMAP. **`/vp-auto`** để **implement** theo task plan. (ENH-021: không implement trực tiếp trong thread request/evolve trừ khi bạn explicit bypass.)

---

### Q: Khi nào nên dùng `/vp-evolve` vs `/vp-request`?

A:
- **`/vp-request`** — Ghi nhận bug/feature/enhancement vào `.viepilot/requests/*` + TRACKER; **không** thay thế bước plan/implement.
- **`/vp-evolve`** — **Planning**: thêm phase trên ROADMAP, tạo `SPEC`/tasks, cập nhật milestone; sau đó gọi **`/vp-auto`**.
- Milestone **mới** (M2, M3…) hoặc scope lớn → thường bắt đầu bằng **`/vp-evolve`**; ý tưởng rời rạc → có thể **`/vp-request`** trước rồi evolve.
