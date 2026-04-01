---
name: vp-update
description: "Nâng cấp package viepilot qua npm (dry-run, --yes, --global) qua vp-tools"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-update`, `/vp-update`, "upgrade viepilot", "cập nhật viepilot npm"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>

<objective>
Chạy **`vp-tools update`** để lên kế hoạch và (khi được xác nhận) thực thi `npm` nâng cấp `viepilot`.

**Ràng buộc an toàn:**
- **Non-interactive** (CI, agent không TTY): bắt buộc **`--dry-run`** hoặc **`--yes`**; nếu không sẽ exit lỗi.
- Luôn ưu tiên **`--dry-run`** trước khi apply, trừ khi user đã yêu cầu rõ apply.

**Phân biệt target:** trong repo **không phải** ViePilot nhưng có `node_modules/viepilot`, lệnh có thể cập nhật **local dependency**. Muốn chỉ nâng **global**, thêm **`--global`**.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/bin/vp-tools.cjs
</execution_context>

<process>

### Step 1: Dry run (mặc định khi tự động)
```bash
vp-tools update --dry-run
```
Đọc output: planned npm command, phiên bản hiện tại vs latest, cảnh báo ambiguous/global.

### Step 2: Apply (sau khi user đồng ý hoặc đã yêu cầu rõ)
```bash
vp-tools update --yes
```
Hoặc ép global:
```bash
vp-tools update --global --dry-run
vp-tools update --global --yes
```

### Step 3: Interactive
Nếu terminal tương tác và **không** có `--yes`, CLI có thể hỏi xác nhận trước khi chạy npm.

### Step 4: Rollback gợi ý
Output dry-run/update thường gợi ý `npm install -g viepilot@<previous>` — giữ phiên bản cũ từ `vp-tools info` nếu cần hoàn tác.
</process>

<success_criteria>
- [ ] Không chạy apply trong non-interactive mà thiếu `--yes`
- [ ] Nêu rõ target (local vs global) khi user đang ở project lạ
- [ ] Ghi nhận khi đã `already up to date` (no-op thành công)
</success_criteria>
