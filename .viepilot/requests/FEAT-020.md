# ✨ FEATURE: ViePilot Skill Registry System

## Meta
- **ID**: FEAT-020
- **Type**: Feature
- **Status**: triaged
- **Priority**: high
- **Created**: 2026-04-20
- **Reporter**: User
- **Assignee**: AI
- **Brainstorm**: `docs/brainstorm/session-2026-04-20.md`

## Summary

Add a full Skill Registry System to ViePilot: third-party skill installation (npm / GitHub / local), a `vp-tools scan-skills` scanner that indexes all skills across adapter dirs, and a 3-stage workflow integration pipeline (brainstorm silent apply → crystallize lock → vp-auto silent execution).

## Problem Statement

ViePilot hiện tại chỉ dùng built-in `vp-*` skills. Không có cơ chế nào để:
1. Cài thêm skills từ bên thứ 3 (npm, GitHub, local)
2. Phát hiện skills đang có sẵn trên máy
3. Tận dụng skill context trong brainstorm / crystallize / vp-auto
4. Lock quyết định "dùng skill nào" trước khi vp-auto thực thi (tránh re-ask)

## Proposed Solution

### Architecture

```
[Install]  vp-tools install-skill <npm|github|local>
     ↓
[Discover] vp-tools scan-skills → ~/.viepilot/skill-registry.json
     ↓
[Apply]    brainstorm (silent) → crystallize (lock) → vp-auto (execute, no re-ask)
```

### Component 1 — SKILL.md Extended Format
Third-party skills thêm 3 sections vào SKILL.md:

```markdown
## Capabilities
- ui-generation
- component-design
- responsive-layout

## Tags
ui, design, frontend, css, html

## Best Practices
- Mobile-first: design breakpoints from 320px up
- Use design tokens for consistency
```

Scanner đọc sections này để index. Skills cũ (không có sections mới) vẫn được scan — fallback tự parse description + content.

### Component 2 — Skill Registry (`~/.viepilot/skill-registry.json`)
- Ghi bởi `vp-tools scan-skills`
- Schema: `{ version, last_scan, scan_paths, skills[] }`
- Mỗi skill: `id, name, source, version, capabilities[], tags[], best_practices[], adapters[], installed_paths{}`

### Component 3 — Installation (`vp-tools install-skill`)
| Channel | Syntax |
|---------|--------|
| npm | `vp-tools install-skill @vp-skills/frontend-design` |
| GitHub | `vp-tools install-skill github:org/repo` |
| Local | `vp-tools install-skill ./my-skill` |

Post-install: auto-run `scan-skills`. Commands bổ sung: `uninstall-skill`, `update-skill`, `list-skills`.

### Component 4 — Brainstorm Integration (silent)
Khi brainstorm có UI signals: load registry → match skills → **silent apply** best practices vào HTML generation → record `## skills_used` trong `notes.md`.

### Component 5 — Crystallize Gate (lock)
Bước mới trong `vp-crystallize`: đọc `## skills_used` từ notes.md → AUQ confirm required vs optional → ghi vào `PROJECT-CONTEXT.md ## Skills`.

### Component 6 — vp-auto Silent Execution
Đọc `## Skills` từ `PROJECT-CONTEXT.md` → per-task skill context injection → **không hỏi lại user**.

## Key Architectural Decision

**Crystallize-time lock**: quyết định dùng skill được lock tại crystallize, không tại execution. vp-auto đọc và thực thi — không ra quyết định mới.

## Acceptance Criteria

- [ ] `vp-tools scan-skills` quét `~/.claude/skills/`, `~/.cursor/skills/`, `~/.codex/skills/`, `~/.antigravity/skills/`
- [ ] `~/.viepilot/skill-registry.json` được tạo/cập nhật sau mỗi lần scan
- [ ] `vp-tools install-skill` hỗ trợ npm + github + local; auto-runs scan-skills sau install
- [ ] SKILL.md extended format backward compat (skills cũ không bị break)
- [ ] Brainstorm tự apply skill best practices khi UI signals detected (silent, no prompt)
- [ ] `notes.md ## skills_used` được ghi sau brainstorm session
- [ ] Crystallize AUQ confirm → `PROJECT-CONTEXT.md ## Skills` được ghi
- [ ] vp-auto đọc skills từ PROJECT-CONTEXT.md và inject context per-task, không hỏi lại
- [ ] `npm test` passes toàn bộ phases

## Phase Plan

| Phase | Deliverable | Version |
|-------|-------------|---------|
| 90 | Skill registry + scanner (`vp-tools scan-skills` + registry JSON + extended SKILL.md spec + tests) | 2.26.0 |
| 91 | Third-party skill installation (`vp-tools install-skill` multi-channel + uninstall + list + tests) | 2.27.0 |
| 92 | Brainstorm UI-Direction integration (silent apply + notes.md skills_used + tests) | 2.28.0 |
| 93 | Crystallize skill decision gate (AUQ confirm + PROJECT-CONTEXT.md ## Skills + tests) | 2.29.0 |
| 94 | vp-auto silent skill execution (per-task injection + tests) | 2.30.0 |

## Related
- **Brainstorm**: `docs/brainstorm/session-2026-04-20.md`
- **Dependencies**: ENH-048 (AUQ) ✅, ENH-059 (ToolSearch preload) ✅
- **Files affected**:
  - New: `lib/skill-registry.cjs`, `lib/skill-installer.cjs`
  - Modified: `bin/viepilot.cjs`, `workflows/brainstorm.md`, `workflows/crystallize.md`, `workflows/autonomous.md`
  - New tests: 5 test files (~55 contract tests total)
  - New docs: `docs/user/features/skill-registry.md`
  - Template: `templates/project/PROJECT-CONTEXT.md` (add `## Skills` section)

## Open Questions
- Q2: Skill versioning — nếu skill update sau crystallize, có cần re-crystallize không? *(resolve before Phase 93)*
- Q3: Skill conflict — 2 skills cùng capability, workflow ưu tiên cái nào? *(resolve before Phase 92)*

## Resolution
_Pending — triaged → Phase 90–94_
