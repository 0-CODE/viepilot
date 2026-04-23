# Phase 28 — ENH-017: Node-native installer (`npx viepilot install`)

## Milestone
M1.24 — target npm **1.7.0** on phase complete (MINOR: cross-platform install path).

## Goal
- **`npx viepilot install`** chạy logic cài đặt **thuần Node** (`lib/viepilot-install.cjs` hoặc tương đương): không `spawnSync('bash', [install.sh])` cho luồng chính.
- **Parity** với `install.sh` hiện tại theo từng `VIEPILOT_INSTALL_PROFILE` / target (copy skills/workflows, `~/.cursor/viepilot`, optional symlink skills, `cloc` best-effort messaging, biến `VIEPILOT_SYMLINK_SKILLS`, `VIEPILOT_AUTO_YES`).
- **`install.sh`**: thin wrapper gọi Node **hoặc** deprecate có ghi chú migration — quyết định trong task 28.4; clone/dev vẫn có đường chạy rõ ràng.
- **Docs + tests**: troubleshooting/quick-start phản ánh “không cần Bash cho NPX trên Windows”; Jest in-process / temp dir theo pattern repo.

## Dependencies
- Phase 27 (FEAT-008) complete — installer entrypoint `bin/viepilot.cjs` ổn định.
- ENH-016 (doc upgrade path) — giữ đồng bộ sau khi đổi engine cài.

## Risks
- **Path semantics** Windows vs Unix (`os.homedir()`, `USERPROFILE`) — phải khớp hành vi uninstall hiện có trong `viepilot.cjs`.
- **Shim** (`/usr/local/bin`) trên Windows — có thể no-op hoặc doc-only; tránh hứa hẹn không thực hiện được.
- **Scope creep**: `dev-install.sh` toàn bộ có thể tách follow-up; phase này ưu tiên NPX `install` + `install.sh` parity tối thiểu.
