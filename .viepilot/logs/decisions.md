# Decision Log

> Load này file **chỉ khi** cần rationale cho một decision cụ thể.
> Không load mặc định trong vp-auto context.

## Format
```
| Date | Decision | Rationale | Phase |
```

---

| Date | Decision | Rationale | Phase |
|------|----------|-----------|-------|
| 2026-04-02 | Typed state machine thay prose workflow | AI phải re-read 468 dòng mỗi lần; typed transitions = AI biết state hiện tại mà không đọc lại | Setup |
| 2026-04-02 | TRACKER.md ≤30 dòng + logs/ directory | Token waste mỗi task khi load blob; selective loading = efficient context | Setup |
| 2026-04-02 | HANDOFF.json ghi sau mỗi sub-task | Context loss giữa sessions = lost state cho L/XL projects; continuous write = recoverable always | Setup |
| 2026-04-02 | 3-layer silent recovery trước control point | v1: first failure → user interruption → momentum break; v2: silent layers → chỉ surface khi thực sự cần | Setup |
| 2026-04-02 | Recovery budget theo complexity (S/M/L/XL) | Flat budget quá rigid; per-complexity = M tasks có nhiều recovery room hơn S | Setup |
| 2026-04-02 | recovery_overrides.L3.block cho compliance tasks | L3 scope reduction = partial auth/payment implementation = security/data risk; compliance cần binary correctness | Setup |
| 2026-04-02 | Compliance domain detection từ write_scope paths (không phải description NLP) | Path-based detection precision cao hơn; description NLP có false positive cao hơn; defer NLP to Post-MVP | Setup |
| 2026-04-02 | vp-request NLP intake 2-band threshold (≥85% auto / 60-84% 1 question / <60% top-3) | Single threshold quá rigid; 2-band = optimal UX với minimal friction | Setup |
| 2026-04-02 | HANDOFF.log rotate on phase-boundary | Phase = natural semantic unit; rotation = fresh log + clear audit trail; size tiny (<25KB/phase) | Setup |
| 2026-04-02 | Parallel context loading = instruction language change only | Claude Code tool đã support multi-tool per turn; chỉ cần thay đổi workflow instruction language | Setup |
| 2026-04-02 | v2 non-breaking với v1 projects | v1 user base không được abandon; new TASK.md fields optional; vp-auto gracefully skip | Setup |
| 2026-04-02 | Scope B crystallize (no schemas/) | ViePilot là framework, không có DB/API schemas; schemas/ directory không applicable | Setup |
