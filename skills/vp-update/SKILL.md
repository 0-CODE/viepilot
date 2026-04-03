---
name: vp-update
description: "Nâng cấp package viepilot qua npm (dry-run, --yes, --global) qua vp-tools"
version: 0.1.1
---

<host_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-update`, `/vp-update`, "upgrade viepilot", "cập nhật viepilot npm"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. Tool Usage
Use the host's native tools for terminal/shell, file reads, glob/`rg`, patch/edit, web fetch/search, and delegation when available.
</host_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **Nâng cấp ViePilot package** (npm) — không implement feature product trong repo đang làm việc mặc định; feature code qua **`/vp-auto`**. Xem `workflows/request.md`.
</implementation_routing_guard>


<objective>
Chạy **`vp-tools update`** để lên kế hoạch và (khi được xác nhận) thực thi `npm` nâng cấp `viepilot`.

**Ràng buộc an toàn:**
- **Non-interactive** (CI, agent không TTY): bắt buộc **`--dry-run`** hoặc **`--yes`**; nếu không sẽ exit lỗi.
- Luôn ưu tiên **`--dry-run`** trước khi apply, trừ khi user đã yêu cầu rõ apply.

**Phân biệt target:** trong repo **không phải** ViePilot nhưng có `node_modules/viepilot`, lệnh có thể cập nhật **local dependency**. Muốn chỉ nâng **global**, thêm **`--global`**.
</objective>

<execution_context>
@bin/vp-tools.cjs
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
