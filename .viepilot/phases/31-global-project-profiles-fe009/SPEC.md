# Phase 31 — Global project profiles + project meta intake (FEAT-009)

## Normative contract (repo)
**Source of truth:** `docs/dev/global-profiles.md` (profile schema, `profile-map.md` table, `.viepilot/META.md` binding, resolution order).

## Goal
Sau brainstorm khởi tạo khi **scope đã chốt**, bắt buộc một phase **project meta intake**: hỏi tuần tự, có đề xuất, lưu tái sử dụng tại `~/.viepilot/profiles/<slug>.md`, registry `~/.viepilot/profile-map.md`, bind profile vào project; **crystallize** và **vp-docs** dùng đúng profile active.

## Scope
- Hợp đồng file + paths machine-level (cùng home `~/.viepilot/` với `stacks/`, `ui-components/`).
- Brainstorm workflow + `vp-brainstorm` skill: gate không bỏ qua mặc định; disambiguation khi nhiều profile.
- Node installer: khởi tạo thư mục + template map.
- Downstream: crystallize + documentation workflows và skills liên quan.
- Tests + user docs + release **1.9.0**.

## Non-goals
- Sync profile lên cloud / team (follow-up).
- Lưu secrets / credentials trong profile.

## Tasks
- **31.1** — Contracts: profile schema, `profile-map.md`, project binding
- **31.2** — Brainstorm gate + sequential Q&A + proposals
- **31.3** — Installer / first-run directory + map seed
- **31.4** — Crystallize + vp-docs consume active profile
- **31.5** — Tests, docs, release closeout

## Acceptance Criteria
- [ ] Paths và schema được mô tả trong repo (workflows/skills) và kiểm tra bởi tests tối thiểu.
- [ ] Intake gắn với “scope locked” trong luồng brainstorm first-init.
- [ ] Project ghi nhận profile id/slug active; docs sinh ra merge meta từ profile đó.
- [ ] `npm run verify:release` pass trước khi đánh dấu phase complete.
