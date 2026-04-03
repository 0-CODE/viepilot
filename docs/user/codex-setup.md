# ViePilot trên Codex

Hướng dẫn cài đặt và kiểm tra ViePilot khi bạn dùng **Codex**. Tài liệu này bổ sung cho [Quick Start](quick-start.md) và [Getting Started](../getting-started.md).

## Đường dẫn cài đặt

| Thành phần | Codex |
|---|---|
| Skills (global) | `~/.codex/skills/<id>/SKILL.md` |
| Runtime bundle | `~/.codex/viepilot/` |
| Project skills (nếu team tự quản lý) | `.codex/skills/<id>/SKILL.md` |

Bundled skill ViePilot vẫn dùng frontmatter `name: vp-*`. Trên Codex, bạn dùng các skill/workflow tương ứng như **`vp-auto`**, **`vp-request`**, **`vp-status`** theo host adapter của Codex.

## Bước 1 — Cài bundle ViePilot

```bash
npx viepilot install --target codex --yes
```

Hoặc từ clone:

```bash
git clone https://github.com/0-CODE/viepilot.git
cd viepilot
node bin/viepilot.cjs install --target codex --yes
```

Kết quả điển hình:

- `~/.codex/skills/vp-*/SKILL.md`
- `~/.codex/viepilot/workflows/`
- `~/.codex/viepilot/templates/`
- `~/.codex/viepilot/bin/vp-tools.cjs`
- `~/.viepilot/profiles/` và `~/.viepilot/profile-map.md`

Sau khi cài: mở session Codex mới nếu runtime chưa thấy bundle mới.

## Bước 2 — Kiểm tra CLI

```bash
~/.codex/viepilot/bin/vp-tools.cjs info
# hoặc
node ~/.codex/viepilot/bin/vp-tools.cjs info --json
```

Nếu muốn thêm vào `PATH` thủ công:

```bash
export PATH="$HOME/.codex/viepilot/bin:$PATH"
```

## Bước 3 — Bootstrap project đích

Trong repo ứng dụng:

1. Mở project trong Codex.
2. Chạy `vp-crystallize` để sinh `.viepilot/`.
3. Tiếp tục với `vp-request` / `vp-evolve` / `vp-auto`.

## Lưu ý runtime

- `~/.codex/viepilot/` là **READ-ONLY runtime path**. Không patch trực tiếp tại đây.
- Source repo thật của bạn mới là nơi được phép ghi mã.
- Nếu team muốn distribute theo project thay vì global, có thể commit `.codex/skills/` trong repo.

## Kiểm tra nhanh

| Bước | Hành động | Kỳ vọng |
|---|---|---|
| CLI | `~/.codex/viepilot/bin/vp-tools.cjs info` | In `installedVersion`, `skills[]` |
| Skills | Runtime Codex load `vp-*` | Có thể invoke flow ViePilot |
| Project | Có `.viepilot/TRACKER.md` sau crystallize | Ready cho `vp-auto` |
