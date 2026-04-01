# ViePilot trên Claude Code

Hướng dẫn cài đặt và kiểm tra ViePilot khi bạn dùng **Claude Code** (CLI/IDE), bổ sung cho [Quick Start](quick-start.md) và [Getting Started](../getting-started.md).

## Claude Code vs Cursor (đường dẫn skills)

| | **Cursor** | **Claude Code** |
|---|------------|-----------------|
| Skills (global) | `~/.cursor/skills/<id>/SKILL.md` | `~/.claude/skills/<id>/SKILL.md` |
| Skills (project) | Rules / project config tùy Cursor | `.claude/skills/<id>/SKILL.md` trong repo |
| Tài liệu chính thức | — | [Extend Claude with skills](https://code.claude.com/docs/en/skills), [Explore the .claude directory](https://code.claude.com/docs/en/claude-directory) |

Bundled skill ViePilot dùng frontmatter `name: vp-*` — trên Claude Code bạn gọi tương đương **`/vp-auto`**, **`/vp-request`**, … như trong [Skills Reference](../skills-reference.md).

**Lưu ý:** Nội dung skill hiện nhắc tới công cụ kiểu Cursor (`ReadFile`, `ApplyPatch`, …). Trên Claude Code, agent sẽ map sang tool tương đương (đọc/ghi file, terminal, …). Phần **workflow** và **chuỗi lệnh** (`/vp-evolve` → `/vp-auto`) vẫn giữ nguyên ý nghĩa.

## Bước 1 — Cài bundle ViePilot (CLI)

Với **`--target claude-code`**, installer (ViePilot **≥ 1.9.4**) **tự copy** toàn bộ `skills/vp-*` vào **`~/.claude/skills/`** (Claude Code mới thấy lệnh `/vp-*`). Đồng thời vẫn mirror vào **`~/.cursor/skills/`** và **`~/.cursor/viepilot/`** (workflows, bin) như trước.

```bash
npx viepilot install --target claude-code --yes
```

Hoặc clone repo và chạy từ thư mục gốc package:

```bash
git clone https://github.com/0-CODE/viepilot.git
cd viepilot
npx viepilot install --target claude-code --yes
```

Kết quả điển hình:

- **`~/.claude/skills/vp-*/SKILL.md`** — dùng trực tiếp trong Claude Code
- **`~/.cursor/skills/vp-*/`** — giữ cho Cursor / tương thích
- Workflows, templates, `bin/*.cjs` tới **`~/.cursor/viepilot/`**
- Seed **`~/.viepilot/profiles/`** và `~/.viepilot/profile-map.md` (xem [Global profiles](../dev/global-profiles.md))

Sau khi cài: **khởi động lại / mở session Claude Code mới** nếu menu `/` chưa thấy `vp-*`.

**Cập nhật sau này:** chạy lại `npx viepilot install --target claude-code --yes` từ bản npm/git mới để refresh cả hai cây skills.

## Bước 2 — Tuỳ chọn: symlink / copy thủ công (bản cũ hoặc chỉ Cursor)

Nếu bạn dùng ViePilot **&lt; 1.9.4** hoặc đã cài **`--target cursor-*`** mà **không** gồm `claude-code`, Claude Code **không** đọc `~/.cursor/skills` — khi đó đồng bộ thủ công vào **`~/.claude/skills/<tên-thư-mục>/SKILL.md`**.

### Cách A — Symlink (khuyến nghị cho máy cá nhân)

```bash
mkdir -p ~/.claude/skills
for d in ~/.cursor/skills/vp-*; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  ln -sfn "$d" "$HOME/.claude/skills/$name"
done
```

### Cách B — Copy (ổn cho máy không dùng symlink)

```bash
mkdir -p ~/.claude/skills
for d in ~/.cursor/skills/vp-*; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  rm -rf "$HOME/.claude/skills/$name"
  cp -R "$d" "$HOME/.claude/skills/$name"
done
```

Sau mỗi lần `npm update -g viepilot` hoặc reinstall: với **copy** cần chạy lại lệnh copy; với **symlink** chỉ cần cập nhật phía `~/.cursor/skills`.

### Cách C — Skills chỉ trong một project

Trong repo của bạn:

```bash
mkdir -p .claude/skills
# symlink hoặc copy từng vp-* từ clone viepilot hoặc từ ~/.cursor/skills
```

Commit `.claude/skills/` nếu team cần dùng chung (xì [Where skills live](https://code.claude.com/docs/en/skills#where-skills-live)).

## Bước 3 — Workflows và `execution_context`

Nhiều skill trỏ tới workflow qua đường dẫn kiểu **`~/.cursor/viepilot/workflows/...`**. Sau `npx viepilot install`, thư mục này đã có bản mirror — **giữ nguyên** và đảm bảo skill không bị sandbox chặn đọc `$HOME`.

Nếu bạn **không** dùng installer: từ clone, có thể đọc trực tiếp `workflows/*.md` trong repo hoặc tự mirror sang `~/.cursor/viepilot/workflows/` cho khớp văn bản skill.

## Bước 4 — `vp-tools` trên PATH

**Sau installer**, thử:

```bash
~/.cursor/viepilot/bin/vp-tools.cjs info
# hoặc nếu đã thêm vào PATH:
vp-tools info
vp-tools info --json
```

**npm global:**

```bash
npm i -g viepilot
vp-tools info
```

**Chỉ có clone, không cài global:**

```bash
node /đường-dẫn/tới/viepilot/bin/vp-tools.cjs info --json
```

Chi tiết lệnh: [CLI Reference](../dev/cli-reference.md).

## Bước 5 — Bootstrap `.viepilot/` cho project đích

Trong thư mục project (không nhất thiết là repo `viepilot`):

1. Mở project trong Claude Code.
2. Chạy **`/vp-crystallize`** (hoặc tương đương theo skill) để sinh `.viepilot/` — hoặc copy thủ công từ [`templates/project/`](../../templates/project/) theo [Getting Started](../getting-started.md).

Một số repo framework **gitignore** `.viepilot/`; với **ứng dụng của bạn** thường nên **commit** để cả team (và agent) cùng thấy ROADMAP/TRACKER.

## Kiểm tra nhanh

| Bước | Lệnh / hành động | Kỳ vọng |
|------|------------------|---------|
| CLI | `vp-tools info` hoặc `node .../vp-tools.cjs info` | In `installedVersion`, `skills[]` |
| Claude | Gõ `/` trong Claude Code | Thấy các skill `vp-*` đã cài |
| Project | Có `.viepilot/TRACKER.md` sau crystallize | Theo [FAQ](faq.md) |

## Windows

- Symlink có thể cần quyền Developer Mode hoặc chạy terminal elevated; nếu không, dùng **copy** (cách B).
- `path_shim` tới `/usr/local/bin` chỉ phù hợp Unix; trên Windows dùng `node ...\vp-tools.cjs` hoặc thêm thư mục chứa `vp-tools.cjs` vào **PATH** thủ công.

## Chuỗi làm việc gợi ý (ENH-021)

1. **`/vp-request`** — ghi yêu cầu  
2. **`/vp-evolve`** — lên ROADMAP / phase  
3. **`/vp-auto`** — thực thi task có plan  

Xem thêm: [Autonomous mode](features/autonomous-mode.md), [Troubleshooting](../troubleshooting.md).
