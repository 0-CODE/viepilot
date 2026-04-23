# FEAT: Guided NPX installer for Claude/Cursor environments

## Meta
- **ID**: FEAT-003
- **Type**: Feature
- **Status**: ✅ done
- **Priority**: high
- **Created**: 2026-03-31
- **Reporter**: User
- **Assignee**: AI

## Summary
Provide a zero-friction installer so users can clone the repo and run `npx viepilot install`, then choose target environment(s) such as Claude Code, Cursor Agent, and Cursor IDE from an interactive setup flow.

## Details

### Problem
- Current onboarding depends on manually running shell scripts.
- New users need clearer choices for target environment setup.
- No single entrypoint for guided installation and post-install verification.

### Brainstorm Deep Dive

#### User Personas
- **New adopter**: vừa clone repo, muốn setup nhanh trong 1 lệnh.
- **Team lead**: muốn chuẩn hóa cách cài cho cả team, giảm lỗi do setup tay.
- **CI maintainer**: cần mode non-interactive để automation.

#### Core User Flows
1. **Interactive happy path**
   - User chạy `npx viepilot install`
   - Wizard detect environment + hiển thị menu target
   - User chọn `Claude Code`, `Cursor Agent`, `Cursor IDE` (1 hoặc nhiều)
   - Installer thực thi theo profile, in checklist hậu cài đặt
2. **Automation path**
   - User chạy `npx viepilot install --target cursor-agent --yes`
   - Installer bỏ prompt và trả summary machine-friendly
3. **Safe dry-run path**
   - User chạy `npx viepilot install --dry-run`
   - Chỉ hiển thị actions sẽ chạy, không ghi file

#### CLI Contract (proposed)
- `npx viepilot install`
- `npx viepilot install --target <claude-code|cursor-agent|cursor-ide>`
- `npx viepilot install --target all --yes`
- `npx viepilot install --dry-run`
- `npx viepilot install --list-targets`

#### Target Profile Expectations
- **Claude Code**
  - Cài skill/workflow cần thiết vào thư mục Claude/Cursor compatible path.
  - Verify path tồn tại và quyền ghi.
- **Cursor Agent**
  - Cài skill bundles và runtime workflow config.
  - Verify command discovery + references.
- **Cursor IDE**
  - Cài đầy đủ skills/workflows/templates/bin theo hướng stable installer.
  - Verify quick-start commands hoạt động.

#### Non-functional Requirements
- Idempotent: chạy lại không làm bể setup cũ.
- Observable: in rõ từng bước, warning, next action.
- Backward compatible: không phá `install.sh` / `dev-install.sh`.
- Fail-safe: profile nào fail thì report rõ, không che lỗi.

### Desired Behavior
1. `npx viepilot install` starts interactive guided setup.
2. User selects one or more targets:
   - Claude Code
   - Cursor Agent
   - Cursor IDE
3. Installer applies profile-specific steps and validations.
4. Installer prints next actions for selected targets.
5. A non-interactive mode supports automation/CI.

### Scope Notes
- Keep existing `install.sh` and `dev-install.sh` backward compatible.
- Add npm `bin`/entrypoint support for `npx viepilot ...` usage.
- Ensure installer remains idempotent.

## Acceptance Criteria
- [x] `npx viepilot install` available as official install entrypoint.
- [x] Interactive target selection menu includes Claude Code, Cursor Agent, Cursor IDE.
- [x] Profile-specific install logic and checks implemented.
- [x] Non-interactive flags supported for scriptable usage.
- [x] Docs updated with quick-start for NPX guided installer.
- [x] `--dry-run` prints planned actions without filesystem mutations.
- [x] `--list-targets` returns supported targets for scripting.
- [x] Re-running install is idempotent and reports already-installed state.
- [x] Exit codes are deterministic for CI (`0` success, non-zero on failure).

## Related
- Phase: **M1.14 / Phase 17** — `.viepilot/phases/17-npx-guided-installer/`
- Route: `/vp-auto --phase 17`
- Expected areas:
  - `package.json`
  - `bin/`
  - installer workflows/docs
- Candidate files (refined):
  - `bin/viepilot.cjs` (new entrypoint)
  - `bin/install-guided.cjs` (target selector + profile handlers)
  - `tests/unit/installer-guided.test.js`
  - `README.md`, `docs/user/quick-start.md`, `docs/troubleshooting.md`

## Risks & Open Questions
- Có cần hỗ trợ chọn nhiều target trong một lần chạy ngay từ v1 không?
- Mức độ chuẩn hóa đường dẫn cho từng target trên macOS/Linux/Windows.
- Có cần telemetry/log file tối thiểu cho debug cài đặt hay chỉ console output?

## Resolution
- 2026-03-31: Triaged and planned into **M1.14 / Phase 17**.
- 2026-03-31: Brainstorm deep-dive completed; request scope/contract refined for implementation.
- 2026-03-31: Implemented and shipped in framework release **v0.10.0**.
