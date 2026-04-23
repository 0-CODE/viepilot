# Phase 29 — ENH-018: Crystallize + ARCHITECTURE Mermaid (complexity-gated)

## Milestone
M1.25 — target framework/npm **1.8.0** on phase complete (MINOR: template + workflow contract).

## Goal
- **Brainstorm → crystallize** thu thập tín hiệu độ phức tạp; **Step 4** sinh ma trận **diagram applicability** (required / optional / N/A + lý do) — **không** bắt đủ 6 loại Mermaid mọi dự án.
- **Template `ARCHITECTURE.md`**: heading cố định cho system-overview, data-flow, event-flows, module-dependencies, deployment, user-use-case; mỗi mục có hướng dẫn + `mermaid` hoặc **N/A**.
- **Cross-skill**: `vp-crystallize`, `vp-audit` (kiểm tra nhất quán matrix ↔ nội dung), `vp-debug`, `vp-auto` (tham chiếu / cập nhật có điều kiện).

## Dependencies
- ENH-014 (horizon trong crystallize) — giữ tương thích checklist.
- Không chặn M1.24 / Phase 28 (có thể triển khai song song theo ưu tiên).

## Risks
- Template dài → duy trì README metrics / skills-reference sync.
- Audit false positive nếu rule quá cứng — nhấn mạnh **matrix-driven** không “6/6 bắt buộc”.
