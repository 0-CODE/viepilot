# Phase 27 — FEAT-008: `vp-info` + `vp-update`

## Milestone
M1.23 — target framework/npm **1.6.0** on phase complete.

## Goal
- **`vp-tools info`** (human + `--json`): ViePilot package version đang chạy, latest npm, danh sách skills (version từ YAML frontmatter), workflows (path + policy “no semver in markdown”).
- **`vp-tools update`** (`--dry-run`, `--yes`, optional `--global`): so sánh current vs latest; chạy `npm install` phù hợp (global/local) hoặc in hướng dẫn `npx` / copy-install — không đụng file ngoài bundle ViePilot.
- **Skills** `vp-info`, `vp-update` mirror CLI; docs + tests.

## Dependencies
- FEAT-003/004/005 installer semantics — update path phải document rõ (global npm vs dev clone).

## Risks
- `npm view` cần network; fail gracefully.
- Non-interactive: `update` requires `--yes` hoặc `--dry-run` only.
