# Phase 30 — ViePilot skill-scope guard (BUG-004)

## Goal
Ràng buộc toàn bộ workflows/skills của ViePilot chỉ tham chiếu hệ skill `vp-*` theo mặc định, tránh drift sang skills ngoài framework khi không có opt-in rõ ràng.

## Scope
- Chuẩn hóa guardrail trong `skills/vp-*/SKILL.md` cho scope `vp-*`.
- Cập nhật workflows lõi để enforce policy theo mode ViePilot.
- Cập nhật docs để người dùng hiểu default behavior và opt-in mở rộng.
- Bổ sung verification/test để phát hiện đề cập skill ngoài framework trái policy.

## Tasks
- **30.1**: Policy contract + terminology (default `vp-*`, explicit opt-in external skills)
- **30.2**: Update all skill contracts (`skills/vp-*/SKILL.md`) with scope guard
- **30.3**: Update core workflows (`autonomous`, `request`, `debug`, `documentation`, `audit`, `evolve`, `crystallize`, `brainstorm`)
- **30.4**: Docs + user guidance (`docs/skills-reference.md`, user docs)
- **30.5**: Tests/verification + release closeout (BUG-004 done, target 1.8.1)

## Acceptance Criteria
- [ ] Không còn hướng dẫn skill ngoài `vp-*` trong phản hồi mặc định của ViePilot workflows.
- [ ] Có cơ chế opt-in rõ ràng khi muốn mở rộng ngoài framework.
- [ ] Docs và skills-reference mô tả chính xác scope behavior.
- [ ] Test/verification bắt được regression khi lộ đề cập skill ngoài policy.
