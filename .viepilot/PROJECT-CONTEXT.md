# ViePilot — Project Context

*Profile binding not configured (`META.md` or global profile file missing).*

<domain_knowledge>
## What This System Does

ViePilot là AI-powered framework giúp solo developer thực hiện các dự án phức tạp (thường đòi hỏi cả team) thông qua structured workflow: brainstorm → crystallize → autonomous execution với human-in-the-loop control points.

**Core promise**: Một solo dev với ViePilot có thể execute dự án enterprise-scale mà bình thường cần 5–15 người.

**Core loop**:
1. `/vp-brainstorm` — Thu thập ideas, decisions, architecture qua Q&A
2. `/vp-crystallize` — Chuyển brainstorm thành `.viepilot/` artifacts (ROADMAP, tasks, state)
3. `/vp-auto` — Thực thi autonomous với recovery layers + control points

## Key Concepts

| Term | Definition |
|------|------------|
| Control Point | Thời điểm AI dừng, hỏi user trước khi tiếp tục (human-in-the-loop gate) |
| Recovery Layer | Tầng tự động sửa lỗi trước khi surface cho user (L1: lint, L2: test, L3: scope reduce) |
| Recovery Budget | Số lần tối đa mỗi recovery layer được thử, xác định theo task complexity (S/M/L/XL) |
| write_scope | Danh sách files/dirs mà 1 task được phép modify (scope contract) |
| recovery_overrides | Per-task override của recovery behavior (ví dụ: block L3 cho compliance tasks) |
| HANDOFF.json | Machine-readable state: vị trí hiện tại, recovery attempts, active context stacks |
| HANDOFF.log | Append-only audit trail mỗi event (task start/pass/fail, recovery attempts) |
| PHASE-STATE.md | Runtime state machine cho phase đang chạy (typed transitions + sub-task tracking) |
| Typed transition | State thay đổi có tên cụ thể (executing, recovering_l1, control_point, pass) thay vì prose |
| Scope contract | Fork boilerplate buộc AI chỉ execute trong defined scope + output PASS/FAIL/BLOCKED |
| Scope drift | AI write ra ngoài write_scope đã khai báo — phát hiện post-task |
| vp-auto | Autonomous execution skill — chạy tasks liên tục với recovery |
| vp-resume | Resume từ interrupted session (3 tiers: quick/standard/full restore) |
| active_stacks | Context stacks đang active trong HANDOFF.json (ví dụ: ["auth-service", "migrations"]) |
| compliance domain | Domain mà L3 scope reduction unsafe (auth, payment, data migrations, crypto) |
| horizon-aware routing | vp-request check ROADMAP Post-MVP trước khi route request |

## Business Rules (Framework)

1. **Doc-first**: Mọi task phải có plan (Paths + File-Level Plan) trước khi implementation commits
2. **Git persistence**: Mọi task complete = git commit + tag; state luôn recoverable từ git
3. **Non-breaking v1→v2**: v2 artifacts backward-compatible; v1 projects skip unknown TASK.md fields
4. **Skill namespace**: Chỉ dùng `vp-*` skills trong ViePilot workflows (BUG-004)
5. **Planning vs execution separation**: `/vp-brainstorm`, `/vp-evolve`, `/vp-request` = plan only; `/vp-auto` = execute
6. **Control point protocol**: AI không tự quyết định khi uncertain — surface to user via control point
7. **Compliance safety**: write_scope paths matching auth/payment/data/crypto → auto-block L3 recovery

## Data Relationships

```
HANDOFF.json ──► PHASE-STATE.md (position reference)
     │
     └──► HANDOFF.log (event append per sub-task)

TASK.md
  ├── write_scope → scope drift detection
  ├── recovery_budget → L1/L2/L3 attempt caps
  └── recovery_overrides → per-task compliance blocks

TRACKER.md (index ≤30 dòng)
  ├── logs/decisions.md (on-demand)
  ├── logs/blockers.md (on-demand)
  └── logs/version-history.md (on-demand)
```
</domain_knowledge>

<product_vision>
## Product Vision & Phased Scope

> Aligns với **`ROADMAP.md` → Post-MVP / Product horizon** và brainstorm tier tags.

### MVP boundary (ship first — v2.0.0)

**Execution layer**:
- Typed state machine trong vp-auto (PHASE-STATE.md execution_state block)
- 3-layer silent recovery (L1 lint, L2 test fix, L3 scope reduce) với recovery budget
- recovery_overrides per-task (Gap B) — L1/L2/L3 block boolean
- Compliance domain detection auto-block L3 (Gap G) — auth/payment/data/crypto paths
- Scope drift detection post-task
- 3-tier validation pipeline: contract → write_scope lock → git gate
- Control point state protocol (HANDOFF.json flag + vp-status detection)

**State management**:
- Continuous HANDOFF.json write sau mỗi sub-task
- HANDOFF.log append-only JSONL + phase-boundary rotation (Gap D)
- vp-resume 3-tier restore (quick/standard/full)
- Parallel context loading (batch read instruction)
- Static/dynamic boundary trong AI-GUIDE.md

**Templates**:
- TRACKER.md → index ≤30 dòng + logs/ directory
- TASK.md → type, write_scope, recovery_budget, can_parallel_with, recovery_overrides
- PHASE-STATE.md → execution_state YAML + sub-task tracking table
- HANDOFF.json v2 schema (position.sub_task, recovery.*, context.active_stacks, control_point.*)

**Workflow integration**:
- crystallize auto-populate write_scope/type/recovery_budget (Gap A)
- crystallize Gap G compliance domain detection từ write_scope paths
- vp-request NLP intake — description-first, 2-band confidence threshold
- vp-request horizon-aware routing + UI direction route detection (Gap C)
- vp-evolve generate v2 TASK.md template
- paths: frontmatter cho vp-* skills

### Post-MVP themes

- Fork state updates — background bookkeeping sau task PASS (non-blocking TRACKER/CHANGELOG update)
- Parallel task execution dựa trên dependency graph (can_parallel_with field)
- AutoDream consolidation cho project knowledge → STACKS.md (post-phase trigger)
- Gap G extended: description keyword scan + vp-auto pre-flight warning
- Gap G extended: consensus/contract compliance domains

### Future / exploratory north star

- Multi-agent coordinator cho complex phases (AI điều phối AI)
- ML-based auto-approval cho low-risk tasks
- Token budget awareness trong vp-auto
- Team memory sync cho multi-developer projects
- Gap E: /vp-status --all cross-project aggregation (multi-project consultants)
- Gap F: Career documentation export từ logs/decisions.md across projects

### Anti-goals & explicit non-scope (MVP v2)

- Thay đổi skill file format (SKILL.md giữ nguyên)
- Breaking changes với ViePilot v1 projects
- Rewrite vp-tools CLI
- Parallel task execution (cần dependency graph infrastructure trước)
- AutoDream (cần layered context architecture trước)
</product_vision>

<conventions>
## Naming Conventions

### Framework files
- Skill dirs: `vp-{name}/` (kebab-case, always `vp-` prefixed)
- Workflow files: `{verb}.md` (lowercase, no prefix)
- Template vars: `{{UPPER_SNAKE_CASE}}` (double braces)
- Phase dirs: `{NN}-{slug}/` (zero-padded number + kebab slug)
- Task files: `{N}.{M}.md` or `{N}.{M}{letter}.md` for sub-variants
- State files: UPPER-CASE.md or UPPER-CASE.json (project state)

### Git
- Commit types: feat/fix/docs/refactor/chore/style/test (Conventional Commits)
- Scopes: `(workflows)`, `(templates)`, `(skills)`, `(lib)`, `(install)`, `(docs)`
- Tags: `{prefix}-p{N}-t{M}` (per-task) và `{prefix}-p{N}-t{M}-done` (task complete)
- Version tags: `vN.M.P`

### Documentation
- User docs: `docs/user/`
- Dev docs: `docs/dev/`
- Brainstorm: `docs/brainstorm/session-{YYYY-MM-DD}.md`
- Requests: `.viepilot/requests/{TYPE}-{N}.md`

## Code Patterns

### Preferred Patterns
- Markdown với XML process tags (`<step name="...">`) cho structured workflows
- YAML frontmatter cho skill metadata
- Bash heredoc cho multi-line prompts trong workflow instructions
- Flat file structure trong `.viepilot/` — không nest quá 3 levels

### Anti-patterns to Avoid
- Prose-only workflows (không structured steps)
- Monolithic state files (blob TRACKER.md > 30 lines)
- Sequential context loading trong vp-auto (phải batch parallel)
- Hardcoded file paths trong skills (dùng relative từ project root)
</conventions>

<constraints>
## Must Have

- Mọi thay đổi workflow/skill/template có git commit riêng với conventional commit message
- vp-auto phải verify write_scope sau mỗi sub-task (scope drift detection)
- HANDOFF.json phải được ghi sau mỗi sub-task complete (không chỉ on stop)
- Recovery layers phải silent (không surface cho user trừ khi budget exhausted)
- control_point.active flag trong HANDOFF.json phải sync với actual control point state

## Must NOT

- Không implement application code trực tiếp trong `/vp-request`, `/vp-brainstorm`, `/vp-evolve`
- Không breaking changes với v1 project structure
- Không thay đổi SKILL.md format (frontmatter schema giữ nguyên)
- Không commit HANDOFF.log (local audit trail only)
- Không L3 scope reduction cho tasks với compliance write_scope (auth/payment/data/crypto)

## Performance Requirements

- Context loading: tất cả files cho 1 task phải đọc trong ≤1 batch turn
- TRACKER.md: phải ≤30 dòng sau v2 refactor (index only)
- HANDOFF.log: không cần đọc trong normal flow; chỉ tail 20 events trên full restore

## Security Requirements

- Không hardcode credentials trong bất kỳ workflow/skill/template file nào
- HANDOFF.log và HANDOFF.json không được commit (gitignore)
- write_scope verification phải chạy post-task (không bypass)
</constraints>

<external_dependencies>
## Third-party Services

| Service | Purpose | Notes |
|---------|---------|-------|
| Claude Code CLI | Runtime environment | Skills execution platform |
| Git | Version control + state persistence | Required |
| GitHub | Remote repository | https://github.com/0-CODE/viepilot |

## Libraries & Frameworks

| Library | Purpose |
|---------|---------|
| Bash | Shell scripts trong lib/ + bin/ |
| Markdown | Skill/workflow/template format |
| YAML | Frontmatter + structured data blocks |
| JSON | HANDOFF.json + HANDOFF.log (JSONL) |
</external_dependencies>
