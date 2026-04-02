---
name: vp-info
description: "Hiển thị phiên bản ViePilot, npm latest, danh sách skills/workflows qua vp-tools"
version: 0.1.1
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-info`, `/vp-info`, "viepilot version", "phiên bản viepilot", "skills list bundle"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **Inventory / version info** — không implement shipping; implement qua **`/vp-auto`**. Xem `workflows/request.md`.
</implementation_routing_guard>


<objective>
Chạy **`vp-tools info`** để lấy metadata bundle ViePilot (không cần `.viepilot/` trong project đích).

**Output hữu ích cho agent:**
- `installedVersion`, `packageName`, `packageRoot`
- `latestNpm` (ok + version hoặc lỗi mạng/registry)
- `gitHead` (nếu clone có git)
- `skills[]`: `id`, `version`, `relativePath`
- `workflows[]`: `id`, `relativePath`, `note`

Dùng **`vp-tools info --json`** khi cần parse hoặc so sánh phiên bản trong script.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/bin/vp-tools.cjs
</execution_context>

<process>

### Step 1: Resolve CLI
Ưu tiên theo thứ tự:
1. `vp-tools info` — khi ViePilot đã có trên `PATH` (npm global hoặc shim).
2. `node <viepilot-package>/bin/vp-tools.cjs info` — từ repo clone hoặc `node_modules/viepilot`.

### Step 2: Chạy lệnh
```bash
vp-tools info
# hoặc
vp-tools info --json
```

### Step 3: Diễn giải JSON (khi dùng `--json`)
- **`packageRoot`**: gốc package `viepilot` CLI đang resolve được.
- **`installedVersion`**: semver trong `package.json` của bundle đó.
- **`latestNpm`**: `{ ok, version }` hoặc `{ ok: false, error }`.
- **`skills`**: inventory skill trong `skills/*/SKILL.md` (version từ frontmatter).
- **`workflows`**: file `workflows/*.md`.

### Step 4: Lỗi thường gặp
Nếu báo không tìm thấy package root: cài global (`npm i -g viepilot`), hoặc chạy từ project có dependency `viepilot`, hoặc trỏ thẳng tới `bin/vp-tools.cjs` trong clone.
</process>

<success_criteria>
- [ ] Đã gọi đúng subcommand `info` (hoặc `--json` khi cần parse)
- [ ] Nêu rõ `installedVersion` và (nếu có) `latestNpm.version`
- [ ] Khi user hỏi “có những skill nào trong bundle”, tóm tắt từ `skills[]` hoặc output bảng CLI
</success_criteria>
