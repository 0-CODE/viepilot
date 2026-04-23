# ViePilot - Roadmap

## Milestone: M1 - Foundation Enhancement

### Overview
- **Version**: 0.2.0
- **Goal**: Hoàn thiện core framework và thêm tính năng nâng cao
- **Phases**: 4
- **Status**: ✅ Complete (2026-03-30)

---

### Phase 1: CLI Enhancement ✅
**Goal**: Cải thiện CLI tools với error handling và UX tốt hơn
**Estimated Tasks**: 4
**Dependencies**: None
**Directory**: `.viepilot/phases/01-cli-enhancement/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 1.1 | Add input validation | CLI validates all inputs, shows helpful errors | M |
| 1.2 | Add colorful output | Progress bars, colored status, clear formatting | S |
| 1.3 | Add interactive prompts | Confirm destructive actions, guide user choices | M |
| 1.4 | Add help system | `vp-tools help {command}` with examples | S |

**Verification**:
- [ ] All CLI commands handle invalid input gracefully
- [ ] Output is readable and informative
- [ ] Help available for all commands

---

### Phase 2: Advanced Features ✅
**Goal**: Thêm các tính năng nâng cao cho power users
**Estimated Tasks**: 5
**Dependencies**: Phase 1
**Directory**: `.viepilot/phases/02-advanced-features/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 2.1 | Add vp-debug skill | Systematic debugging with state tracking | L |
| 2.2 | Add vp-rollback skill | Rollback to any checkpoint safely | M |
| 2.3 | Add parallel execution | Execute independent tasks in parallel | L |
| 2.4 | Add conflict detection | Detect and warn about potential conflicts | M |
| 2.5 | Add progress persistence | Resume exactly from interruption point | M |

**Verification**:
- [ ] vp-debug can track and resolve issues
- [ ] vp-rollback recovers state correctly
- [ ] Parallel execution doesn't cause conflicts

---

### Phase 3: Integration & Testing ✅
**Goal**: Thêm tests và integrations
**Estimated Tasks**: 4
**Dependencies**: Phase 2
**Directory**: `.viepilot/phases/03-integration-testing/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 3.1 | Add unit tests for CLI | Jest tests for all CLI commands | M |
| 3.2 | Add integration tests | End-to-end workflow tests | L |
| 3.3 | Add CI/CD pipeline | GitHub Actions for testing | M |
| 3.4 | Add AI provider tests | Test with different AI providers | M |

**Verification**:
- [ ] All CLI commands have tests
- [ ] CI runs on all PRs
- [ ] Coverage > 80%

---

### Phase 4: Documentation & Examples ✅
**Goal**: Hoàn thiện documentation và thêm examples
**Estimated Tasks**: 4
**Dependencies**: Phase 3
**Directory**: `.viepilot/phases/04-docs-examples/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 4.1 | Add video tutorials | Record setup and usage videos | M |
| 4.2 | Add example projects | 3 example projects (web, api, cli) | L |
| 4.3 | Add troubleshooting guide | Common issues and solutions | S |
| 4.4 | Add advanced usage guide | Power user features documentation | M |

**Verification**:
- [ ] All skills documented with examples
- [ ] Example projects work end-to-end
- [ ] Troubleshooting covers common issues

---

## Progress Summary

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 1. CLI Enhancement | ✅ Complete | 4 | 4 | 100% |
| 2. Advanced Features | ✅ Complete | 5 | 5 | 100% |
| 3. Integration & Testing | ✅ Complete | 4 | 4 | 100% |
| 4. Documentation & Examples | ✅ Complete | 4 | 4 | 100% |

**Total**: 17 tasks, 17 completed, **100%** 🎉

---

---

## Milestone: M1.5 - ENH Backlog Implementation

### Overview
- **Version**: 0.3.0
- **Goal**: Implement 5 enhancement requests từ debug sessions — fix framework drift gaps
- **Phases**: 3
- **Status**: ✅ Complete (2026-03-30)

---

### Phase 5: vp-docs Enhancements ✅
**Goal**: Fix vp-docs để không còn placeholder URLs và tự động sync skills-reference.md
**Estimated Tasks**: 2
**Dependencies**: None
**Directory**: `.viepilot/phases/05-vp-docs-enhancements/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 5.1 | Inject git remote URL | No `your-org`/`YOUR_USERNAME` after `/vp-docs` | ENH-004 |
| 5.2 | Scan skills/ for skills-reference.md | skills-reference.md always has N sections = N skills | ENH-005 |

**Verification**:
- [ ] `workflows/documentation.md` reads `git remote` before generating
- [ ] `docs/skills-reference.md` built by scanning `skills/` directory
- [ ] No placeholder URLs remain after generation

---

### Phase 6: ROOT Document Sync ✅
**Goal**: vp-auto và vp-docs tự động sync README.md và ROADMAP.md
**Estimated Tasks**: 2
**Dependencies**: Phase 5
**Directory**: `.viepilot/phases/06-root-sync/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 6.1 | vp-auto sync ROADMAP.md + README.md | No drift after milestone complete | ENH-001 |
| 6.2 | vp-docs sync README.md | Documentation table updated after `/vp-docs` | ENH-002 |

**Verification**:
- [ ] `workflows/autonomous.md` syncs ROADMAP.md per-phase
- [ ] `workflows/autonomous.md` syncs README.md on milestone complete
- [ ] `skills/vp-docs/SKILL.md` updates README.md Documentation table

---

### Phase 7: vp-audit Drift Detection ✅
**Goal**: vp-audit trở thành safety net detect mọi loại drift
**Estimated Tasks**: 3
**Dependencies**: Phase 5 & 6
**Directory**: `.viepilot/phases/07-audit-drift/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 7.1 | Add ROOT drift checks to audit workflow | README.md + ROADMAP.md drift detected | ENH-003 |
| 7.2 | Add docs/ drift checks to audit workflow | skills-reference.md + placeholder URLs detected | ENH-003 |
| 7.3 | Update vp-audit SKILL.md objective | Skill declares all drift check capabilities | ENH-003 |

**Verification**:
- [ ] `/vp-audit` reports README.md badge drift
- [ ] `/vp-audit` reports ROADMAP.md status drift
- [ ] `/vp-audit` reports skills-reference.md missing skills
- [ ] `/vp-audit` reports placeholder URLs in docs/

---

## Progress Summary (M1.5)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 5. vp-docs Enhancements | ✅ Complete | 2 | 2 | 100% |
| 6. ROOT Document Sync | ✅ Complete | 2 | 2 | 100% |
| 7. vp-audit Drift Detection | ✅ Complete | 3 | 3 | 100% |

**Total**: 7 tasks, 7 completed, **100%** 🎉

---

---

## Milestone: M1.6 - Generalize for User Projects

### Overview
- **Version**: 0.4.0
- **Goal**: Làm cho vp-audit và workflows hoạt động đúng trên bất kỳ project nào, không chỉ viepilot
- **Phases**: 2
- **Status**: ✅ Complete (2026-03-30)

---

### Phase 8: Generalize Workflows (ENH-007) ✅
**Goal**: Xóa viepilot framework assumptions khỏi autonomous.md và documentation.md
**Estimated Tasks**: 3
**Dependencies**: None
**Directory**: `.viepilot/phases/08-generalize-workflows/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 8.1 | autonomous.md: guard Steps 5b + 6a | Steps skip gracefully on non-framework projects | ENH-007 |
| 8.2 | documentation.md: remove framework counts from Step 0, guard Step 3B | No skills/workflows count for user projects | ENH-007 |
| 8.3 | autonomous.md Step 6a: generic version sync | Uses package.json/pom.xml/pyproject.toml | ENH-007 |

---

### Phase 9: Generalize vp-audit (ENH-006) ✅
**Goal**: vp-audit hoạt động có ý nghĩa trên mọi project với 3-tier architecture
**Estimated Tasks**: 2
**Dependencies**: Phase 8
**Directory**: `.viepilot/phases/09-generalize-audit/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 9.1 | workflows/audit.md: 3-tier rewrite | Tier 1 (state) + Tier 2 (docs) always; Tier 3 (framework) conditional | ENH-006 |
| 9.2 | skills/vp-audit/SKILL.md: rewrite objective + flags | Skill declares project-agnostic scope | ENH-006 |

---

## Progress Summary (M1.6)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 8. Generalize Workflows | ✅ Complete | 3 | 3 | 100% |
| 9. Generalize vp-audit | ✅ Complete | 2 | 2 | 100% |

**Total**: 5 tasks, 5 completed, **100%** 🎉

---

---

## Milestone: M1.7 - Brainstorm Intelligence Upgrade

### Overview
- **Version**: 0.5.0
- **Goal**: Nâng cấp brainstorm để hỗ trợ Landing Page layout selection và research ngay trong phiên
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-30)

---

### Phase 10: Brainstorm Landing + Research ✅
**Goal**: Khi brainstorm về landing page, hỏi thêm bố cục và tham khảo 21st.dev; hỗ trợ research trực tiếp trong phiên brainstorm
**Estimated Tasks**: 3
**Dependencies**: Phase 9
**Directory**: `.viepilot/phases/10-brainstorm-intelligence/`

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 10.1 | Add landing-page layout deep-dive flow | Brainstorm asks explicit layout questions (A/B/C/D/custom) |
| 10.2 | Add in-session research mode | User can request research without leaving brainstorm session |
| 10.3 | Update evolve routing to enhanced brainstorm | `/vp-evolve` routes landing/research-heavy requests to `/vp-brainstorm --landing --research` |

---

## Progress Summary (M1.7)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 10. Brainstorm Landing + Research | ✅ Complete | 3 | 3 | 100% |

**Total**: 3 tasks, 3 completed, **100%** 🎉

---

---

## Milestone: M1.8 - Stack Intelligence for Crystallize + Auto

### Overview
- **Version**: 0.6.0
- **Goal**: Bắt buộc research chính thống theo tech stack và tái sử dụng best practices qua global cache
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-30)

---

### Phase 11: Stack Intelligence Cache (ENH-008) ✅
**Goal**: vp-crystallize research official docs theo stack và vp-auto tra cứu nhanh cache để code đúng best practices
**Estimated Tasks**: 3
**Dependencies**: Phase 10
**Directory**: `.viepilot/phases/11-stack-intelligence/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 11.1 | Add research gate in crystallize workflow | Each selected stack requires official-source research summary before architecture lock | ENH-008 |
| 11.2 | Define global stack cache structure | `~/.viepilot/stacks/{stack}/` has SUMMARY/BEST-PRACTICES/ANTI-PATTERNS/SOURCES files | ENH-008 |
| 11.3 | Add vp-auto stack preflight lookup | vp-auto reads stack SUMMARY first, expands only when needed | ENH-008 |

---

## Progress Summary (M1.8)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 11. Stack Intelligence Cache | ✅ Complete | 3 | 3 | 100% |

**Total**: 3 tasks, 3 completed, **100%** 🎉

---

---

## Milestone: M1.9 - Stack-Aware Audit Intelligence

### Overview
- **Version**: 0.7.0
- **Goal**: Nâng cấp vp-audit để kiểm tra best practices/code quality theo tech stack và tự research khi thiếu tri thức stack
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-31)

---

### Phase 12: vp-audit Stack Compliance + Research Fallback (ENH-009) ✅
**Goal**: Biến vp-audit thành quality gate theo stack-specific best practices, đồng bộ policy với vp-auto và bổ sung research fallback
**Estimated Tasks**: 3
**Dependencies**: Phase 11
**Directory**: `.viepilot/phases/12-audit-stack-compliance/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 12.1 | Extend audit workflow with stack best-practice + code quality checks | Report includes "Stack Best Practices" and "Code Quality by Stack" with severity mapping | ENH-009 |
| 12.2 | Add web-research fallback for missing/weak stack cache | If stack cache is missing or stale, audit can gather official sources and synthesize structured guidance | ENH-009 |
| 12.3 | Align vp-audit outputs with vp-auto stack preflight contract | Audit output can be consumed as guardrails/checklists by vp-auto before implementation | ENH-009 |

**Verification**:
- [ ] `workflows/audit.md` includes stack compliance checks and research fallback path
- [ ] `skills/vp-audit/SKILL.md` objective/process/success criteria reflect stack-aware auditing
- [ ] Result format includes severity-tagged findings tied to files/modules
- [ ] Cache update guidance (`~/.viepilot/stacks/{stack}/`) is generated when new research is performed

---

## Progress Summary (M1.9)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 12. vp-audit Stack Compliance + Research Fallback | ✅ Complete | 3 | 3 | 100% |

**Total**: 3 tasks, 3 completed, **100%** 🎉

---

---

## Milestone: M1.10 - Execution Trace Reliability

### Overview
- **Version**: 0.8.0
- **Goal**: Chuẩn hóa task decomposition chi tiết và state-sync theo từng task/sub-task để không mất dấu vết khi bị gián đoạn
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-31)

---

### Phase 13: Detailed Task Decomposition + Real-time State Sync (ENH-010) ✅
**Goal**: Nâng cấp `vp-auto` và workflow liên quan để enforce kế hoạch task chi tiết (path/file/best-practices/verification) và cập nhật state ngay sau mỗi task
**Estimated Tasks**: 4
**Dependencies**: Phase 12
**Directory**: `.viepilot/phases/13-task-granularity-state-sync/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 13.1 | Enforce detailed task contract in autonomous workflow | Each implementation task must include objective, file paths, file-level description, best practices, and verification checklist | ENH-010 |
| 13.2 | Add per-task state-sync checkpoints | `PHASE-STATE`, `TRACKER`, `HANDOFF` are updated immediately after each PASS task/sub-task | ENH-010 |
| 13.3 | Introduce reusable detailed task template | Template includes Paths, Implementation notes, Best practices, Do/Don't, Verification, State update checklist | ENH-010 |
| 13.4 | Extend audit to detect late state-update anti-pattern | Audit can flag batch-only state updates and missing per-task traceability | ENH-010 |

**Verification**:
- [ ] `workflows/autonomous.md` explicitly requires detailed decomposition before coding
- [ ] Task completion flow updates state files incrementally (not batch-only at phase end)
- [ ] A concrete task template is available and referenced by implementation skills
- [ ] `workflows/audit.md` can report missing per-task update traces

---

## Progress Summary (M1.10)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 13. Detailed Task Decomposition + Real-time State Sync | ✅ Complete | 4 | 4 | 100% |

**Total**: 4 tasks, 4 completed, **100%** 🎉

---

---

## Milestone: M1.11 - ROOT documentation alignment

### Overview

- **Version**: 0.8.1
- **Goal**: Đồng bộ tài liệu ROOT và giảm drift giữa shield, TRACKER, CHANGELOG, wording audit tier
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-31)

---

### Phase 14: ROOT documentation + drift cross-check (ENH-011) ✅

**Goal**: Khớp README/CHANGELOG/workflows với framework SemVer thực tế; quét drift mẫu (version cũ, ví dụ CLI)
**Estimated Tasks**: 1
**Dependencies**: Phase 13
**Directory**: `.viepilot/phases/14-root-documentation-alignment/`

| Task | Description | Acceptance Criteria | ENH |
|------|-------------|---------------------|-----|
| 14.1 | ROOT + audit + changelog + selective docs | README shield = TRACKER framework version; dual-version note; audit banner 4 tiers; CHANGELOG có `[0.8.1]` ENH-011; grep sạch drift framework | ENH-011 |

**Verification**:

- [ ] `README.md` badge và đoạn Versioning khớp policy
- [ ] `workflows/audit.md` không còn mismatch “3 tiers” vs implementation 4 tiers
- [ ] `CHANGELOG.md` phản ánh release patch
- [ ] Báo cáo audit cập nhật sau fix (PASS hoặc issues tối thiểu)

---

## Progress Summary (M1.11)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 14. ROOT documentation + drift cross-check | ✅ Complete | 1 | 1 | 100% |

**Total**: 1 task, 1 completed, **100%** 🎉

---

---

## Milestone: M1.12 — Doc-first autonomous execution (BUG-001)

### Overview

- **Version**: 0.8.2
- **Goal**: Không cho `/vp-auto` âm thầm “code trước — tài liệu sau”; ép thứ tự validate → ghi nhận kế hoạch/docs gate → rồi mới implement.
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-31)

---

### Phase 15: vp-auto doc-first gates (BUG-001) ✅

**Goal**: Đồng bộ `autonomous.md`, `vp-auto` skill, `TASK.md` template và `audit.md` để phát hiện / ngăn execute-first drift.

**Estimated Tasks**: 4
**Dependencies**: Phase 14
**Directory**: `.viepilot/phases/15-vp-auto-doc-first-gates/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 15.1 | Doc-first gate trong `workflows/autonomous.md` | Thứ tự rõ: contract → pre-doc gate → (stack) → implement; STOP nếu gate fail | BUG-001 |
| 15.2 | Mirror gate trong `skills/vp-auto/SKILL.md` | Skill forbid implement trước khi gate ghi nhận | BUG-001 |
| 15.3 | Checklist pre-execution trong `templates/phase/TASK.md` | Section checklist bắt buộc / có template | BUG-001 |
| 15.4 | Heuristic audit execute-first trong `workflows/audit.md` | Mục Tier có hướng dẫn heuristic + labeling | BUG-001 |

**Verification**:

- [x] `workflows/autonomous.md` có subsection doc-first / pre-execution gate trước implementation
- [x] `skills/vp-auto/SKILL.md` khớp thứ tự
- [x] `templates/phase/TASK.md` có checklist
- [x] `workflows/audit.md` có heuristic BUG-001

---

## Progress Summary (M1.12)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 15. vp-auto doc-first gates (BUG-001) | ✅ Complete | 4 | 4 | 100% |

**Total**: 4 tasks, 4 completed, **100%** 🎉

---

---

## Milestone: M1.13 — UI Direction + Component Curation (FEAT-002)

### Overview

- **Version**: 0.9.0 (target on completion)
- **Goal**: Brainstorm cho dự án design/UI có HTML preview sống (UI direction) và có workflow sưu tầm/tái dùng UI component từ 21st.dev (global + project-local stock).
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-31)

---

### Phase 16: UI direction artifacts + reusable UI component library (FEAT-002) ✅

**Goal**: Bổ sung pipeline UI-first từ brainstorm đến crystallize và thư viện component tái sử dụng.

**Estimated Tasks**: 5  
**Dependencies**: Phase 15  
**Directory**: `.viepilot/phases/16-ui-direction-and-component-library/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 16.1 | Brainstorm UI mode tạo/cập nhật HTML direction | Có `ui-direction/{session}/index.html`, `style.css`, `notes.md` trong brainstorm flow | FEAT-002 |
| 16.2 | Crystallize tham chiếu UI direction đã chốt | `crystallize` đọc UI direction và map lại theo tech stack đích | FEAT-002 |
| 16.3 | Workflow/skill curation component từ 21st.dev | Có ingest + classify + metadata + lưu kho global/project | FEAT-002 |
| 16.4 | Bootstrap stock components trong install scripts | `install.sh` / `dev-install.sh` cài/symlink baseline ui-components | FEAT-002 |
| 16.5 | Docs cho quy trình UI direction + component library | Có docs usage, conventions, reuse flow | FEAT-002 |

**Verification**:

- [x] Brainstorm UI session tạo được preview artifact và update theo thay đổi
- [x] Crystallize sử dụng artifact UI direction làm input bắt buộc
- [x] Component curation lưu đúng cấu trúc global (`~/.viepilot/ui-components`) và local (`.viepilot/ui-components`)
- [x] Install scripts có stock components cơ bản
- [x] Docs có hướng dẫn tái sử dụng component library

---

## Progress Summary (M1.13)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 16. UI direction + component curation (FEAT-002) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%** 🎉

---

---

## Milestone: M1.14 — Guided NPX Installer (FEAT-003)

### Overview

- **Version**: 0.10.0 (target on completion)
- **Goal**: Cho phép người dùng clone repo rồi chạy `npx viepilot install` với wizard chọn môi trường cài đặt (Claude Code, Cursor Agent, Cursor IDE).
- **Phases**: 1
- **Status**: ✅ Complete (2026-03-31)

---

### Phase 17: npx guided installer with target profiles (FEAT-003) ✅

**Goal**: Tạo one-command onboarding có interactive selector + non-interactive flags cho automation.

**Estimated Tasks**: 5  
**Dependencies**: Phase 16  
**Directory**: `.viepilot/phases/17-npx-guided-installer/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 17.1 | Add npm bin entrypoint for `npx viepilot` | Package có `bin` mapping và CLI entrypoint hợp lệ | FEAT-003 |
| 17.2 | Build guided install selector | `npx viepilot install` có menu chọn Claude/Cursor targets | FEAT-003 |
| 17.3 | Implement profile handlers | Setup logic riêng theo target profile, giữ idempotent | FEAT-003 |
| 17.4 | Add non-interactive flags | Hỗ trợ `--target`, `--yes`, `--dry-run` cho script/CI | FEAT-003 |
| 17.5 | Update docs for onboarding | README/docs có flow NPX install và ví dụ target profile | FEAT-003 |

**Verification**:

- [x] `npx viepilot install` chạy được và hiển thị target selection.
- [x] Install profile cho Claude Code, Cursor Agent, Cursor IDE hoạt động.
- [x] Non-interactive flags hoạt động đúng cho automation.
- [x] Tài liệu onboarding cập nhật đầy đủ.

---

## Progress Summary (M1.14)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 17. npx guided installer (FEAT-003) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%** 🎉

---

---

## Milestone: M1.15 — npm Publish Distribution (FEAT-004)

### Overview

- **Version**: 0.11.0 (target on completion)
- **Goal**: Publish chính thức ViePilot package lên npmjs với release flow an toàn để user dùng trực tiếp `npx viepilot install`.
- **Phases**: 2
- **Status**: ✅ Complete

---

### Phase 18: npm publish distribution and release safety (FEAT-004) ✅

**Goal**: Hoàn thiện package distribution pipeline cho npm registry và bảo đảm verify/rollback rõ ràng.

**Estimated Tasks**: 5  
**Dependencies**: Phase 17  
**Directory**: `.viepilot/phases/18-npm-publish-distribution/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 18.1 | Harden package metadata for npm publish | Tarball chỉ chứa artifacts cần thiết, metadata chuẩn | FEAT-004 |
| 18.2 | Add publish scripts and prepublish checks | Có prepublish guardrails + release scripts reproducible | FEAT-004 |
| 18.3 | Add secure npm release workflow | Publish workflow dùng token secret an toàn, không lộ creds | FEAT-004 |
| 18.4 | Add post-publish smoke verification flow | Verify được `npx viepilot install --help` sau publish | FEAT-004 |
| 18.5 | Document npm release and rollback guide | Có checklist publish + rollback playbook cho maintainers | FEAT-004 |

**Verification**:

- [x] Publish flow chạy được (manual hoặc CI) với token secret.
- [x] `npx viepilot install --help` hoạt động từ npm package đã publish.
- [x] Có docs release/rollback rõ ràng cho maintainers.

---

### Phase 19: installer UX + uninstall + symlink reliability (FEAT-005) ✅

**Goal**: Nâng UX installer lên arrow/space select, loại bỏ rủi ro symlink làm mất skill discovery, và thêm command uninstall đầy đủ vòng đời cài đặt.

**Estimated Tasks**: 5  
**Dependencies**: Phase 17  
**Directory**: `.viepilot/phases/19-installer-ux-and-uninstall/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 19.1 | Build arrow/space interactive selector (multi + radio) | Chọn target bằng keyboard, UX không cần nhập số thủ công | FEAT-005 |
| 19.2 | Fix symlink install mode causing missing skill detection | Cài đặt không còn lỗi "install xong nhưng không nhận skills" | FEAT-005 |
| 19.3 | Add `npx viepilot uninstall` command | Có uninstall với confirm, `--yes`, và summary rõ ràng | FEAT-005 |
| 19.4 | Add selector/uninstall/regression tests | Test unit cover selector behavior + uninstall routing + regression symlink | FEAT-005 |
| 19.5 | Update install/uninstall docs and troubleshooting | Docs user/dev cập nhật đầy đủ cho flow mới | FEAT-005 |

**Verification**:

- [x] Interactive selector chạy đúng (arrow/space, multi + radio mode).
- [x] Install path không còn phụ thuộc symlink gây lỗi skill discovery.
- [x] `npx viepilot uninstall` chạy an toàn và có summary.
- [x] Test và docs cập nhật cho flow install/uninstall mới.

---

## Progress Summary (M1.15)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 18. npm publish distribution (FEAT-004) | ✅ Complete | 5 | 5 | 100% |
| 19. installer UX + uninstall + symlink reliability (FEAT-005) | ✅ Complete | 5 | 5 | 100% |

**Total**: 10 tasks, 10 completed, **100%**

---

## Milestone: M1.16 — README Automation & Project Support (FEAT-006)

### Overview

- **Version**: 1.1.0 (target on completion)
- **Goal**: Tự động đồng bộ README metrics bằng `cloc` trong workflow và bổ sung donate section (PayPal/MOMO).
- **Phases**: 1
- **Status**: ✅ Complete

---

### Phase 20: README sync via cloc + donate section (FEAT-006) ✅

**Goal**: Giảm drift README bằng metric auto-sync khi chạy workflow và thêm section donate nhỏ gọn.

**Estimated Tasks**: 5  
**Dependencies**: Phase 19  
**Directory**: `.viepilot/phases/20-readme-sync-and-donate/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 20.1 | Design README LOC auto-sync flow with `cloc` | Có design rõ trigger, command và parser strategy | FEAT-006 |
| 20.2 | Implement workflow hook for README metric updates | README metric block được update tự động sau workflow run | FEAT-006 |
| 20.3 | Add fallback/guard when `cloc` is missing | Không làm vỡ workflow khi thiếu `cloc`; có thông báo rõ | FEAT-006 |
| 20.4 | Add donate section (PayPal + MOMO) to README/docs | README có section donate với link chính xác | FEAT-006 |
| 20.5 | Add tests/verification and docs updates | Có verify/test giảm nguy cơ drift tái diễn | FEAT-006 |

**Verification**:

- [x] README LOC metrics được cập nhật tự động qua workflow path đã chọn.
- [x] Fallback khi thiếu `cloc` hoạt động an toàn.
- [x] Donate section hiển thị đúng link PayPal/MOMO.
- [x] Có docs/test/verify cho cơ chế mới.

---

## Progress Summary (M1.16)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 20. README sync via cloc + donate section (FEAT-006) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.17 — Repository Hygiene + README Metric Reliability (ENH-013)

### Overview

- **Version**: 1.1.0 (target on completion)
- **Goal**: Căn chỉnh lại README metrics theo source of truth và tách `.viepilot` khỏi tracked repository state.
- **Phases**: 1
- **Status**: ✅ Complete

---

### Phase 21: README metric realign + `.viepilot` ignore/untrack (ENH-013) ✅

**Goal**: Khôi phục độ tin cậy cho metric README và đảm bảo `.viepilot` chỉ còn là local operational artifacts.

**Estimated Tasks**: 5  
**Dependencies**: Phase 20  
**Directory**: `.viepilot/phases/21-readme-metrics-and-viepilot-ignore/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 21.1 | Recompute and sync README metrics | Metric block khớp số liệu hiện tại từ script chuẩn | ENH-013 |
| 21.2 | Add verify/re-sync guidance | Có command/checklist để sync lại ở các lần sau | ENH-013 |
| 21.3 | Add repo ignore rule for `.viepilot` | `.viepilot` được ignore trong cấu hình git phù hợp | ENH-013 |
| 21.4 | Untrack `.viepilot` from git index safely | `.viepilot` không còn tracked nhưng dữ liệu local còn nguyên | ENH-013 |
| 21.5 | Update docs/changelog/tracker state | Tài liệu trạng thái phản ánh phase mới nhất | ENH-013 |

**Verification**:

- [ ] `README.md` metrics đã được cập nhật đúng.
- [ ] Sync command/verification steps rõ ràng và chạy được.
- [ ] `.viepilot` bị ignore cho các commit mới.
- [ ] `git status` không còn report `.viepilot` as tracked modifications sau khi untrack.

---

## Progress Summary (M1.17)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 21. README metric realign + `.viepilot` ignore/untrack (ENH-013) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.18 — Project-scoped checkpoint tags (BUG-002)

### Overview

- **Version**: 1.2.0 (target on completion)
- **Goal**: Tránh collision git checkpoint tags giữa nhiều dự án bằng naming strategy có tiền tố dự án.
- **Phases**: 1
- **Status**: ✅ Complete

---

### Phase 22: project-prefixed git checkpoint tags + compatibility (BUG-002) ✅

**Goal**: Đảm bảo checkpoint tags là project-scoped, không trùng giữa các repo, vẫn tương thích tags cũ.

**Estimated Tasks**: 5  
**Dependencies**: Phase 21  
**Directory**: `.viepilot/phases/22-project-scoped-git-tags/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 22.1 | Define deterministic project slug for tag prefix | Prefix ổn định từ repo/project name, normalize an toàn | BUG-002 |
| 22.2 | Update tag creation in autonomous flow | Tag mới có format project-scoped cho phase/task/checkpoint | BUG-002 |
| 22.3 | Update checkpoint list/lookup/recovery logic | `vp-tools`/flow đọc được cả format cũ và mới | BUG-002 |
| 22.4 | Add tests for tag naming and compatibility | Có test cover create/list/fallback legacy tags | BUG-002 |
| 22.5 | Update docs and migration notes | Docs nêu quy ước tag mới + lưu ý backward compatibility | BUG-002 |

**Verification**:

- [ ] Tạo checkpoint từ 2 project khác nhau không còn collision naming.
- [ ] `checkpoints`/rollback flow hoạt động với cả legacy tags.
- [ ] Unit tests cho tag parser/naming pass.
- [ ] Docs được cập nhật ví dụ format tag mới.

---

## Progress Summary (M1.18)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 22. project-prefixed git checkpoint tags + compatibility (BUG-002) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.19 — vp-auto Git Persistence Guarantees (BUG-003)

### Overview

- **Version**: 1.3.0 (target on completion)
- **Goal**: Bắt buộc commit/push nhất quán trong `/vp-auto` để tránh thiếu commit khi đã mark task/phase complete.
- **Phases**: 1
- **Status**: ✅ Complete

---

### Phase 23: enforce commit/push persistence gate in `/vp-auto` (BUG-003) ✅

**Goal**: Đảm bảo state progression chỉ xảy ra khi git persistence đạt yêu cầu.

**Estimated Tasks**: 5  
**Dependencies**: Phase 22  
**Directory**: `.viepilot/phases/23-vp-auto-git-persistence-gate/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 23.1 | Define persistence gate policy | Có định nghĩa rõ commit/push bắt buộc theo task/phase | BUG-003 |
| 23.2 | Enforce gate in autonomous workflow | Không mark done nếu git step fail/chưa chạy | BUG-003 |
| 23.3 | Add control-point handling for git failures | Có nhánh retry/skip/stop minh bạch | BUG-003 |
| 23.4 | Add verification/tests for persistence behavior | Có test hoặc verify script tái hiện bug và chứng minh fix | BUG-003 |
| 23.5 | Update docs/skills for deterministic git persistence | Tài liệu mô tả đúng contract mới | BUG-003 |

**Verification**:

- [ ] Task PASS path fail-fast khi commit/push lỗi.
- [ ] State files không đi trước git persistence.
- [ ] Có flow retry/rollback rõ ràng cho git failure.
- [ ] Unit/integration verify pass cho persistence gate.

---

## Progress Summary (M1.19)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 23. enforce commit/push persistence gate in `/vp-auto` (BUG-003) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.20 — Multi-page UI Direction + Crystallize site map (FEAT-007)

### Overview

- **Version**: 1.4.0 (target on completion)
- **Goal**: Brainstorm UI theo từng page (file HTML riêng), giữ manifest / `notes.md` đồng bộ khi thêm page, để `/vp-crystallize` nắm đủ số page và chức năng khi lên kiến trúc UI.
- **Phases**: 1
- **Status**: ✅ Complete

---

### Phase 24: multi-page UI Direction artifacts + manifest hooks (FEAT-007) ✅

**Goal**: Chuẩn hóa layout `pages/*.html` + hub `index.html`, hook cập nhật inventory trong `notes.md` (hoặc manifest), và tiêu thụ đầy đủ trong crystallize.

**Estimated Tasks**: 5  
**Dependencies**: Phase 23  
**Directory**: `.viepilot/phases/24-multi-page-ui-direction-manifest/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 24.1 | Define artifact + manifest contract | Layout + schema documented; legacy single-file path preserved | FEAT-007 |
| 24.2 | Update brainstorm workflow | Multi-page steps + mandatory post-page notes/manifest hook | FEAT-007 |
| 24.3 | Update vp-brainstorm skill | Skill mirrors workflow; links user doc | FEAT-007 |
| 24.4 | Update crystallize workflow + skill | Reads page list + each `pages/*.html` when present | FEAT-007 |
| 24.5 | User docs + optional verification | `ui-direction.md` updated; optional drift check documented | FEAT-007 |

**Verification**:

- [x] Old sessions (only `index.html`) still work end-to-end.
- [x] New multi-page session updates inventory whenever pages change.
- [x] Crystallize output references every page in inventory.

---

## Progress Summary (M1.20)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 24. multi-page UI Direction + manifest (FEAT-007) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.21 — Product horizon in Brainstorm + Crystallize (ENH-014)

### Overview

- **Version**: 1.5.0 (target on completion)
- **Goal**: Không để nội dung post-MVP chỉ nằm trong session brainstorm; crystallize phải đưa **horizon / deferred capabilities** vào `ROADMAP.md` và **product vision theo pha** vào `PROJECT-CONTEXT.md`, kèm template + checklist validation.
- **Phases**: 1
- **Status**: ✅ Complete (2026-04-01)

---

### Phase 25: brainstorm horizon tags + crystallize ROADMAP/PROJECT-CONTEXT post-MVP (ENH-014)

**Goal**: Chuẩn hóa cấu trúc horizon trong brainstorm, mở rộng crystallize Step 1 + Step 7, cập nhật template ROADMAP/PROJECT-CONTEXT và skill success criteria; bổ sung hướng dẫn user ngắn gọn.

**Estimated Tasks**: 5  
**Dependencies**: Phase 24  
**Directory**: `.viepilot/phases/25-brainstorm-crystallize-product-horizon/`

| Task | Description | Acceptance Criteria | Req |
|------|-------------|---------------------|-----|
| 25.1 | Horizon contract trong brainstorm workflow | Session template có MVP vs Post-MVP vs Future; hướng dẫn tag rõ ràng | ENH-014 |
| 25.2 | Crystallize: extract + validate horizon | Step 1 checklist trích deferred; gate “horizon documented hoặc explicit none” | ENH-014 |
| 25.3 | Template ROADMAP + PROJECT-CONTEXT | Section Post-MVP / Future milestones + Product vision & phased scope | ENH-014 |
| 25.4 | Skills `vp-brainstorm` + `vp-crystallize` | Version bump; success criteria mirror workflow | ENH-014 |
| 25.5 | Docs + AI-GUIDE hook | `docs/user/` hoặc skills-reference; AI-GUIDE load order ghi horizon | ENH-014 |

**Verification**:

- [x] Brainstorm session mới có chỗ cố định cho post-MVP (không chỉ rải rác).
- [x] ROADMAP sinh ra có block horizon (hoặc ghi rõ single-release).
- [x] PROJECT-CONTEXT có phased scope / vision đồng bộ brainstorm.

---

## Progress Summary (M1.21)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 25. brainstorm horizon + crystallize post-MVP (ENH-014) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%** 🎉

---

## Milestone: M1.22 — Doc-sync backlog closure (ENH-001 ~ ENH-005)

### Overview

- **Version**: 1.5.1
- **Goal**: Xác minh và đóng backlog enhancement doc-sync / audit drift từ M1.5; bảo đảm contract được giữ bằng regression tests.
- **Phases**: 1
- **Status**: ✅ Complete (2026-04-01)

### Phase 26: ENH-001 ~ ENH-005 verification (no new workflow prose)

**Goal**: So khớp request files với implementation hiện có trong repo; thêm test Jest khóa contract.

**Estimated Tasks**: 1 (verification + ship)

| Task | Description | Acceptance | Req |
|------|-------------|------------|-----|
| 26.1 | Verify autonomous / documentation / audit workflows + vp-auto / vp-docs / vp-audit skills; add `tests/unit/enh-backlog-workflow-contracts.test.js`; bump **1.5.1** | Tests pass; CHANGELOG; README shields | ENH-001~005 |

**Verification**:

- [x] ENH request files marked `done` with resolution notes
- [x] `npm test` includes new contract suite
- [x] `docs/skills-reference.md` section count matches `skills/*/SKILL.md` count

---

## Progress Summary (M1.22)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 26. ENH backlog verification | ✅ Complete | 1 | 1 | 100% |

**Total**: 1 task, 1 completed, **100%** 🎉

---

## Milestone: M1.23 — `vp-info` + `vp-update` (FEAT-008)

### Overview

- **Version**: 1.6.0 (**released** 2026-04-01)
- **Goal**: CLI + skills để xem phiên bản ViePilot/skills/workflows, so sánh với npm, và cập nhật có kiểm soát.
- **Phases**: 1
- **Status**: ✅ Complete

### Phase 27: vp-tools info/update + skills + docs

**Goal**: Ship `vp-tools info` (`--json`), `vp-tools update` (`--dry-run`, `--yes`, `--global`), skills `vp-info` / `vp-update`, documentation, tests, release **1.6.0**.

**Directory**: `.viepilot/phases/27-vp-info-vp-update/`

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 27.1 | `vp-tools info` + `lib/viepilot-info.cjs` | JSON + table; skills versions; workflows list | FEAT-008 |
| 27.2 | `vp-tools update` | dry-run / yes / global; no-op when latest | FEAT-008 |
| 27.3 | Skills vp-info, vp-update | SKILL.md mirror CLI | FEAT-008 |
| 27.4 | docs + README | skills-reference, cli-reference, quick-start | FEAT-008 |
| 27.5 | Tests + 1.6.0 + FEAT done | verify:release; tags | FEAT-008 |

**Verification**:

- [x] `vp-tools info` và `info --json` chạy trong repo viepilot
- [x] `vp-tools update --dry-run` không mutate
- [x] `npm run verify:release` pass

---

## Progress Summary (M1.23)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 27. vp-info + vp-update (FEAT-008) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%** 🎉

---

## Milestone: M1.24 — Node-native installer (ENH-017)

### Overview

- **Version**: **1.7.0** (target on phase complete)
- **Goal**: `npx viepilot install` dùng **Node** thay cho `bash install.sh`; đa OS (Windows CMD/PowerShell, macOS, Linux) với cùng codebase.
- **Phases**: 1
- **Status**: ✅ Complete (2026-04-01)

### Phase 28: `lib/viepilot-install.cjs` + `viepilot.cjs` wiring

**Goal**: Parity với `install.sh`, bỏ spawn bash cho luồng cài chính; cập nhật doc/tests; ship **1.7.0**.

**Directory**: `.viepilot/phases/28-node-native-installer/`

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 28.1 | Đọc `install.sh`, liệt kê bước + env; scaffold `lib/viepilot-install.cjs` (API + dry-run hooks) | Module load được; dry-run trả về plan text/struct | ENH-017 |
| 28.2 | Copy skills/workflows, `~/.cursor/viepilot`, symlink optional, cloc hints, profile mapping | Hành vi khớp từng profile như bash (manual spot-check + so sánh checklist) | ENH-017 |
| 28.3 | `bin/viepilot.cjs`: `install` gọi lib; **không** `spawnSync('bash', …)` cho install | Windows không cần bash trên PATH cho NPX install | ENH-017 |
| 28.4 | `install.sh`: exec Node hoặc deprecate + README/troubleshooting | `./install.sh` hoặc doc thay thế rõ ràng | ENH-017 |
| 28.5 | Jest tests, `docs/troubleshooting.md` + quick-start, CHANGELOG **[1.7.0]**, `package.json`, ENH-017 **done** | `npm run verify:release` pass | ENH-017 |

**Verification**:

- [x] `npx viepilot install --target cursor-agent --yes --dry-run` không gọi bash
- [x] Verify trên Unix hiện tại; Windows path handling được bảo vệ bằng `os.homedir()` fallback + `path_shim` skip rule
- [x] ENH-017 acceptance criteria trong request file được tick

---

## Progress Summary (M1.24)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 28. Node-native installer (ENH-017) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%** 🎉

---

## Milestone: M1.25 — Crystallize ARCHITECTURE + Mermaid (ENH-018)

### Overview

- **Version**: **1.8.0** (target on phase complete)
- **Goal**: Diagram Mermaid trong `.viepilot/ARCHITECTURE.md` **theo điều kiện** (tín hiệu brainstorm / độ phức tạp); catalog 6 loại; hợp đồng cho vp-auto / vp-audit / vp-debug / vp-request.
- **Phases**: 1
- **Status**: ✅ Complete (2026-04-01)

### Phase 29: Workflows + template + skills + audit hooks

**Goal**: Ship complexity-gated diagram contract; **1.8.0**; đóng ENH-018.

**Directory**: `.viepilot/phases/29-crystallize-architecture-mermaid/`

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 29.1 | `workflows/brainstorm.md` tín hiệu; `crystallize.md` Step 4 — matrix required/optional/N/A trước nội dung chi tiết | Matrix ghi trong artifact hoặc section ARCHITECTURE | ENH-018 |
| 29.2 | `templates/project/ARCHITECTURE.md` — 6 heading + mermaid hoặc N/A | Template ship trong package | ENH-018 |
| 29.3 | `skills/vp-crystallize`, `skills/vp-audit` (+ `workflows/audit.md` nếu cần) | Audit kiểm tra khớp matrix, không checklist cứng 6 diagram | ENH-018 |
| 29.4 | `skills/vp-debug`, `workflows/autonomous.md` — tham chiếu diagram có điều kiện | Không bắt refresh full sáu loại mọi task | ENH-018 |
| 29.5 | `docs/skills-reference.md`, optional test, CHANGELOG **[1.8.0]**, `package.json`, ENH-018 **done** | `npm run verify:release` pass | ENH-018 |

**Verification**:

- [x] Dự án ví dụ “CLI nhỏ” có thể hợp lệ với majority N/A + lý do
- [x] Dự án ví dụ “nhiều service” có ≥2 diagram required có `mermaid` thật

---

## Progress Summary (M1.25)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 29. Crystallize + Mermaid (ENH-018) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.26 — ViePilot skill scope guard (BUG-004)

### Overview

- **Version**: **1.8.1** (target on phase complete)
- **Goal**: Ràng buộc ViePilot workflows/skills chỉ tham chiếu hệ `vp-*` theo mặc định; skill ngoài framework chỉ dùng khi explicit opt-in.
- **Phases**: 1
- **Status**: ✅ Complete (2026-04-01)

### Phase 30: vp-only scope guard across skills/workflows/docs

**Goal**: Chặn drift tham chiếu skill ngoài hệ sinh thái ViePilot trong mode mặc định; ship patch **1.8.1**; đóng BUG-004.

**Directory**: `.viepilot/phases/30-vp-skill-scope-guard/`

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 30.1 | Policy contract + terminology | Có policy rõ: default `vp-*`, external phải opt-in | BUG-004 |
| 30.2 | Cập nhật `skills/vp-*/SKILL.md` | Tất cả skills có scope guard nhất quán | BUG-004 |
| 30.3 | Cập nhật workflows lõi | Route/gợi ý không lộ skill ngoài khi default mode | BUG-004 |
| 30.4 | Docs + skills-reference | User docs mô tả behavior + opt-in rõ ràng | BUG-004 |
| 30.5 | Tests/verify/release closeout | `npm run verify:release` pass; BUG-004 done; 1.8.1 | BUG-004 |

**Verification**:

- [x] Không còn phản hồi mặc định đề cập skill ngoài `vp-*`
- [x] Có cơ chế opt-in và được tài liệu hóa

---

## Progress Summary (M1.26)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 30. vp-only skill scope guard (BUG-004) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.27 — Global project profiles + meta intake (FEAT-009)

### Overview

- **Version**: **1.9.0** (target on phase complete)
- **Goal**: Sau brainstorm khởi tạo đã chốt scope, bắt buộc phase **project meta intake** (Q&A tuần tự, có đề xuất); lưu tái sử dụng tại `~/.viepilot/profiles/<slug>.md` và registry `~/.viepilot/profile-map.md`; project bind profile active; **crystallize** / **vp-docs** tiêu thụ đúng profile.
- **Phases**: 1
- **Status**: Complete

### Phase 31: contracts, brainstorm gate, installer, downstream docs, release

**Goal**: Triển khai FEAT-009 end-to-end; ship **1.9.0**.

**Directory**: `.viepilot/phases/31-global-project-profiles-fe009/`

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 31.1 | Hợp đồng file: profile schema (frontmatter/sections), `profile-map.md` columns, project binding field(s) (e.g. `.viepilot/META.md` or `HANDOFF`) | SPEC + task plans reviewed; paths khớp `~/.viepilot/` như `ui-components/` / `stacks/` | FEAT-009 |
| 31.2 | `workflows/brainstorm.md` + `skills/vp-brainstorm`: gate **sau scope lock**, một câu/lượt, proposal accept/edit; bắt buộc chọn profile khi map có >1 match | Flow không thể “end session” mà bỏ qua intake (trừ explicit escape documented nếu có) | FEAT-009 |
| 31.3 | `lib/viepilot-install.cjs` (và doc): `mkdir -p ~/.viepilot/profiles`, seed `profile-map.md` template nếu thiếu | Parity với prepare store trong `workflows/ui-components.md` | FEAT-009 |
| 31.4 | `workflows/crystallize.md`, `workflows/documentation.md`, skills `vp-crystallize`, `vp-docs`: đọc **active profile** + merge vào artifact docs | PROJECT-CONTEXT / generated docs phản ánh org/branding từ profile đã chọn | FEAT-009 |
| 31.5 | Jest contract tests (paths + binding + policy no-secrets), user docs (`docs/user/`), CHANGELOG **[1.9.0]**, `package.json`, FEAT-009 **done** | `npm run verify:release` pass | FEAT-009 |

**Verification**:

- [x] Global home có `profiles/` + `profile-map.md` sau install/first-run path
- [x] Brainstorm first-init: intake chạy và ghi profile + binding
- [x] Crystallize/docs không dùng nhầm profile khi có nhiều entry trong map

---

## Progress Summary (M1.27)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 31. Global project profiles + meta intake (FEAT-009) | ✅ Complete | 5 | 5 | 100% |

**Total**: 5 tasks, 5 completed, **100%**

---

## Milestone: M1.28 — UI Direction UX walkthrough (FEAT-010)

### Overview

- **Version**: **1.9.1** (FEAT-010); follow-up patches **1.9.2** (ENH-019~021) shipped npm
- **Goal**: Chuẩn hóa prompt thực tế “user simulation → UX designer + web research → chỉnh prototype” thành slash **`/research-ui`** / **`/research ui`** trong `/vp-brainstorm --ui`; ghi **`## UX walkthrough log`** trong `notes.md`; giữ hook multi-page (hub + **Pages inventory**).
- **Phases**: 1
- **Status**: Complete (implementation on `main`; semver **1.9.1** khi cut release)

### Phase 32: workflow, skill, user docs, contract tests

**Goal**: Triển khai FEAT-010 trong repo; `npm test` + có thể `verify:release` trước bump version.

**Directory**: `.viepilot/phases/32-ui-direction-ux-walkthrough-fe010/`

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 32.1 | `workflows/brainstorm.md` (3 phase + commands + template), `vp-brainstorm` 0.6.0, `docs/user/features/ui-direction.md`, `docs/skills-reference.md`, Jest `vp-fe010-*` | Contract strings present; tests pass | FEAT-010 |

**Verification**:

- [x] User có thể tra cứu `/research-ui` trong `ui-direction.md` và `brainstorm.md`
- [x] `/research {topic}` vẫn tách biệt hành vi “research nhanh”

---

## Progress Summary (M1.28)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 32. UI Direction UX walkthrough (FEAT-010) | ✅ Complete | 1 | 1 | 100% |

**Total**: 1 task, 1 completed, **100%**

---

## Milestone: M1.29 — Next focus (kickoff)

### Overview

- **Version**: **1.9.5** — Phase **35** / **ENH-022** shipped (crystallize architecture `.mermaid` sidecars)
- **Goal**: **FEAT-001** (đã ship) + **ENH-022** (đã ship) — crystallize ghi diagram kiến trúc ra `.viepilot/architecture/<diagram>.mermaid` đồng bộ matrix ENH-018.
- **Phases**: 4 (phase **33** kickoff + **34** FEAT-001 + **35** ENH-022 + optional close-out)
- **Status**: Phase **35** ✅; M1.29 có thể đóng hoặc mở backlog mới

### Phase 33: M1.29 scope kickoff

**Goal**: Chốt mục tiêu M1.29 + semver target trên ROADMAP; không implement shipping.

**Directory**: `.viepilot/phases/33-m129-scope-kickoff/`

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 33.1 | Cập nhật Overview M1.29, goal, version target; TRACKER | ROADMAP + TRACKER nhất quán | — |

**Verification**:

- [x] M1.29 Overview có goal text (hoặc TBD + explicit next command)
- [x] Phase 33 có `SPEC.md` + `PHASE-STATE.md` + `tasks/33.1.md`

---

### Phase 34: Claude Code dev environment (FEAT-001)

**Goal**: Tài liệu + contract tests để người dùng Claude Code cài ViePilot và verify `vp-tools info` (global hoặc `node` từ clone); làm rõ skills/workflows nằm ở đâu so với Cursor (`~/.cursor/...`) và Claude Code (`.claude/`, `~/.claude/`).

**Directory**: `.viepilot/phases/34-claude-code-dev-env-feat001/`

**Dependencies**: Phase 33 (scope đã chốt FEAT-001)

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 34.1 | Thêm `docs/user/claude-code-setup.md`: PATH, `npm i -g viepilot` hoặc clone, copy/symlink `skills/` + `workflows/`, bootstrap `.viepilot/`, verify `vp-tools info` | Doc đủ bước từ máy sạch; link docs Claude chính thức | FEAT-001 |
| 34.2 | Cross-link từ `docs/getting-started.md`, `docs/user/quick-start.md`, `docs/user/faq.md` (và `docs/README.md` nếu có mục lục) | User tìm được “Claude Code” từ các entrypoint hiện có | FEAT-001 |
| 34.3 | Jest `tests/unit/vp-feat001-claude-code-docs-contracts.test.js` — file tồn tại + các chuỗi bắt buộc (PATH, `vp-tools`, `.claude`) | `npm test` pass | FEAT-001 |

**Verification**:

- [x] Đọc guide — reproduce được trên macOS/Linux (Windows: ghi rõ giới hạn nếu có)
- [x] `npm test` bao gồm contract FEAT-001

---

### Phase 35: Crystallize — architecture `.mermaid` files on disk (ENH-022)

**Goal**: **vp-crystallize** / `workflows/crystallize.md` Step 4 — mỗi diagram được sinh (theo matrix `required` / `optional` có nội dung) phải có bản lưu tại **`.viepilot/architecture/<diagram>.mermaid`**; `ARCHITECTURE.md` tham chiếu rõ; skill + audit nhất quán.

**Directory**: `.viepilot/phases/35-crystallize-architecture-files-en022/`

**Dependencies**: Phase 29 / **ENH-018** (matrix + Mermaid trong ARCHITECTURE); Phase 34 không chặn.

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 35.1 | `workflows/crystallize.md` Step 4: quy ước thư mục `.viepilot/architecture/`, map tên file ↔ 6 loại diagram, khi **không** tạo file (N/A / rỗng), chính sách trùng khớp nội dung vs khối trong `ARCHITECTURE.md` | Workflow có đoạn bắt buộc AI tuân theo khi crystallize | ENH-022 |
| 35.2 | `templates/project/ARCHITECTURE.md`: mỗi mục diagram có hướng dẫn link tới `architecture/<name>.mermaid` + ví dụ | Template mới không mâu thuẫn matrix | ENH-022 |
| 35.3 | `skills/vp-crystallize/SKILL.md`: objective / process / success criteria nhắc artifact `.viepilot/architecture/*.mermaid` | Skill đồng bộ workflow | ENH-022 |
| 35.4 | `skills/vp-audit/SKILL.md` (matrix ↔ file) + Jest contract nhỏ (chuỗi bắt buộc trong `crystallize.md` + template) | `npm test` pass | ENH-022 |

**Verification**:

- [x] Chạy crystallize trên dự án mẫu: các mục `required` có file `.mermaid` tương ứng (manual hoặc checklist trong task)
- [x] Không tạo file thừa cho diagram N/A
- [x] `npm test` pass sau task 35.4

---

### Phase 36: vp-auto Step 3 PASS — ROADMAP.md sync (ENH-023)

**Goal**: Fix gap trong `workflows/autonomous.md` Step 3 Handle Result PASS: thêm instruction cập nhật `ROADMAP.md` (phase progress %) tại task-level, không chỉ phase-complete.

**Directory**: `.viepilot/phases/36-vp-auto-roadmap-sync-enh023/`

**Dependencies**: Phase 35

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 36.1 | `workflows/autonomous.md` Step 3 PASS: thêm dòng `Update ROADMAP.md: sync phase progress % và task count nếu phase status/progress thay đổi` sau `CHANGELOG.md` | `grep "Update ROADMAP.md" autonomous.md` trả về ≥2 occurrences | ENH-023 |

**Verification**:

- [ ] Step 3 PASS list có 6 entries (bao gồm ROADMAP.md)
- [ ] Step 4 `update_state` không bị duplicate/mâu thuẫn
- [ ] Step 5a vẫn còn (phase-complete sync không bị xóa)

---

### Phase 37: ui-direction context forward (ENH-024)

**Goal**: Fix chuỗi truyền tải ui-direction qua crystallize → vp-auto. Hiện tại task files không có `context_required` trỏ vào ui-direction, dẫn đến vp-auto implement mà không nhìn thấy design artifacts từ brainstorm.

**Directory**: `.viepilot/phases/37-ui-direction-context-forward-enh024/`

**Dependencies**: Phase 36

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 37.1 | `crystallize.md` Step 1A: đổi trigger thành mandatory khi `ui-direction/` exists | Step 1A có hard check `ls .viepilot/ui-direction/` thay vì soft heuristic | ENH-024 |
| 37.2 | `crystallize.md` Step 10: inject `context_required` ui-direction vào task files cho UI tasks | Step 10 có subsection "UI Direction context injection" với template block | ENH-024 |
| 37.3 | `autonomous.md` Step 3a: thêm UI safety check — warn + auto-load nếu UI task thiếu context | Step 3a có block detect UI task + auto-load logic | ENH-024 |
| 37.4 | `templates/project/AI-GUIDE.md`: thêm row ui-direction vào Quick Lookup table | Quick Lookup có row ui-direction notes.md | ENH-024 |

**Verification**:

- [ ] crystallize Step 1A mandatory khi `ui-direction/` exists
- [ ] crystallize Step 10 inject `context_required` cho UI tasks
- [ ] autonomous Step 3a có safety net
- [ ] AI-GUIDE.md template có ui-direction row

---

### Phase 38: Claude Code install env path fix (BUG-005)

**Goal**: Khi install cho `claude-code` target, mirror `workflows/`, `bin/`, `templates/`, `lib/` vào `~/.claude/viepilot/` và rewrite `execution_context` paths trong mirrored skill files (`.cursor/viepilot` → `.claude/viepilot`). Cursor targets không bị ảnh hưởng.

**Directory**: `.viepilot/phases/38-bug005-claude-install-env-path/`

**Dependencies**: Phase 37

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 38.1 | `buildInstallPlan`: add `claudeViepilotDir` + mkdir/copy steps cho workflows/templates/bin/lib khi `claude-code` target | `paths.claudeViepilotDir` đúng; plan có đủ mkdir + copy steps | BUG-005 |
| 38.2 | New step kind `rewrite_paths_in_dir` trong `buildInstallPlan` + handler trong `applyInstallPlan` + dry-run output | step tồn tại trong plan; handler rewrite `.md` files; dry-run log đúng | BUG-005 |
| 38.3 | Jest tests: 6 tests mới cover `claudeViepilotDir`, mkdir/copy steps, rewrite step, apply rewrite | `npm test` pass | BUG-005 |

**Verification**:

- [ ] `node bin/vp-tools.cjs install --target claude-code --dry-run` hiển thị `viepilot (Claude Code): ~/.claude/viepilot` + rewrite step
- [ ] `npm test` pass (308+ tests)
- [ ] Cursor-only plan không có `claudeViepilotDir` hay `rewrite_paths_in_dir` step

---

### Phase 41: install script missing package.json for claude-code target (BUG-007)

**Goal**: Fix `buildInstallPlan()` để copy `package.json` vào `~/.claude/viepilot/` khi target là `claude-code`. `resolveViepilotPackageRoot()` tìm root bằng cách walk upward tìm `package.json` có `name==="viepilot"` — thiếu file này khiến `vp-tools info` crash khi CWD không phải viepilot source repo.

**Directory**: `.viepilot/phases/41-bug007-install-missing-packagejson/`

**Dependencies**: Phase 40 (BUG-006)

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 41.1 | `buildInstallPlan`: thêm `copy_file` step cho `package.json` → `claudeViepilotDir/package.json` trong claude-code block | plan có step `{ kind: 'copy_file', from: '{root}/package.json', to: '{claudeViepilotDir}/package.json' }`; cursor targets không bị ảnh hưởng | BUG-007 |
| 41.2 | Jest test: verify `package.json` copy step xuất hiện trong claude-code plan; cursor plan không có step này | `npm test` pass (318 → 320) | BUG-007 |

**Verification**:

- [ ] `node -e "const {buildInstallPlan}=require('./lib/viepilot-install.cjs'); const p=buildInstallPlan('/r',{},{installTargets:['claude-code'],overrideHomedir:'/h'}); console.log(p.steps.find(s=>s.from&&s.from.endsWith('package.json')&&s.to.includes('.claude'))?.kind)"` prints `copy_file`
- [ ] `npm test` pass (≥320 tests)

---

### Phase 40: claude-code install missing lib files (BUG-006)

**Goal**: Fix `buildInstallPlan()` để copy đủ 4 lib files vào `~/.claude/viepilot/lib/` khi target là `claude-code`. BUG-005 bỏ qua `viepilot-info.cjs`, `viepilot-update.cjs`, `viepilot-install.cjs` dẫn đến crash khi chạy `vp-tools info/update`.

**Directory**: `.viepilot/phases/40-bug006-claude-lib-missing/`

**Dependencies**: Phase 38 (BUG-005)

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 40.1 | `buildInstallPlan`: thêm copy steps cho `viepilot-info.cjs`, `viepilot-update.cjs`, `viepilot-install.cjs` trong claude-code target | plan có 3 copy steps mới; cursor targets không bị ảnh hưởng | BUG-006 |
| 40.2 | Jest tests: 4 tests mới verify 3 copy steps + 1 negative cursor check | `npm test` pass (314 → 318) | BUG-006 |

**Verification**:

- [ ] `node -e "const {buildInstallPlan}=require('./lib/viepilot-install.cjs'); const p=buildInstallPlan({target:'claude-code',home:'/h',root:'/r'}); ['viepilot-info','viepilot-update','viepilot-install'].forEach(f=>console.log(p.steps.find(s=>s.to.endsWith(f+'.cjs'))?.kind))"` prints `copy_file` x3
- [ ] `npm test` pass (≥318 tests)

---

### Phase 42: brainstorm UI mode background extraction + crystallize hard gate (ENH-026)
**Goal**: Background extraction của UI ideas trong mọi phiên brainstorm; crystallize hard gate khi UI scope detected nhưng thiếu artifacts.
**Estimated Tasks**: 6
**Dependencies**: Phase 41
**Directory**: `.viepilot/phases/42-enh026-brainstorm-ui-extraction/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 42.1 | brainstorm.md: UI signal keywords + background extraction spec | Section present, ≥20 keywords, non-blocking rule | M |
| 42.2 | brainstorm.md: periodic surface + confirmation dialogue | Dialogue template, 3 options, option 2 links UI Direction Mode | S |
| 42.3 | crystallize.md: Step 1A → hard gate | Hard gate with 2 options, ARCHITECTURE.md assumptions path | M |
| 42.4 | skills vp-brainstorm + vp-crystallize SKILL.md update | Version bumped, ENH-026 noted | S |
| 42.5 | Jest contract tests (5 tests) | All pass, npm test green | M |
| 42.6 | docs/user/features/ui-direction.md update | Background extraction + hard gate documented | S |

**Verification**:
- [ ] Background extraction section in brainstorm.md
- [ ] Hard gate in crystallize.md Step 1A
- [ ] All 5 tests pass

---

### Phase 43: Architect Design Mode (FEAT-011)
**Goal**: Chế độ mới collaborative architecture brainstorm với live HTML generation (architecture, data-flow, decisions, tech-stack, tech-notes, feature-map) + crystallize Step 1C để consume artifacts.
**Estimated Tasks**: 8
**Dependencies**: Phase 42
**Directory**: `.viepilot/phases/43-feat011-architect-design-mode/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 43.1 | brainstorm.md: Architect Design Mode section | Full section, workspace layout, cadence, diagrams | L |
| 43.2 | HTML templates: 7 pages + style.css in templates/architect/ | All 8 files, dark mode, .updated, Mermaid CDN | L |
| 43.3 | brainstorm.md: incremental update rules + notes.md YAML schema | Rules + schema present | M |
| 43.4 | brainstorm.md: auto-activate heuristic | 3 trigger conditions, prompt, 3 options | M |
| 43.5 | crystallize.md: Step 1C — Consume Architect Artifacts | Step exists, ARCHITECTURE.md import, open_questions surface | L |
| 43.6 | skills vp-brainstorm (0.9.0) + vp-crystallize (0.6.0) update | Versions bumped, FEAT-011 noted | S |
| 43.7 | docs/user/features/architect-design-mode.md (new) | 8 sections, workspace table, notes.md schema | M |
| 43.8 | Jest contract tests (8 tests) | All pass, npm test green | M |

**Verification**:
- [ ] Architect Design Mode section in brainstorm.md
- [ ] templates/architect/ with 8 files
- [ ] Step 1C in crystallize.md
- [ ] All 8 tests pass

---

### Phase 39: ui-direction source of truth guard (ENH-025)

**Goal**: Thêm explicit READ-ONLY prohibition vào 3 workflows (`autonomous.md`, `crystallize.md`, `request.md`) để ngăn LLM write/modify `.viepilot/ui-direction/` artifacts ngoài phiên `vp-brainstorm`. Enforce design principle: ui-direction = frozen design contract, chỉ writable trong brainstorm session.

**Directory**: `.viepilot/phases/39-enh025-ui-direction-sot-guard/`

**Dependencies**: Phase 38

| Task | Description | Acceptance (summary) | Req |
|------|-------------|----------------------|-----|
| 39.1 | `autonomous.md` ENH-024 block: thêm `⛔ READ-ONLY` guard line sau auto-load instruction | `grep "READ-ONLY" autonomous.md` có kết quả trong ENH-024 block | ENH-025 |
| 39.2 | `crystallize.md` `consume_ui_direction` step: thêm "Source of truth policy" note ở đầu step | `grep "Source of truth policy" crystallize.md` có kết quả | ENH-025 |
| 39.3 | `request.md` `brainstorm_continuation` step: thêm guard — nếu topic là UI changes, redirect sang `/vp-brainstorm --ui` thay vì tự modify ui-direction | `grep "READ-ONLY\|vp-brainstorm --ui" request.md` có kết quả trong brainstorm_continuation block | ENH-025 |

**Verification**:

- [ ] `grep -n "READ-ONLY" ~/.cursor/viepilot/workflows/autonomous.md` trả về ít nhất 1 dòng trong ENH-024 block
- [ ] `grep -n "Source of truth policy" ~/.cursor/viepilot/workflows/crystallize.md` trả về ≥1 dòng
- [ ] `grep -n "READ-ONLY\|vp-brainstorm" ~/.cursor/viepilot/workflows/request.md` trả về dòng trong brainstorm_continuation block

---

## Progress Summary (M1.29)

| Phase | Status | Tasks | Completed | Progress |
|-------|--------|-------|-----------|----------|
| 33. M1.29 scope kickoff | ✅ Complete | 1 | 1 | 100% |
| 34. Claude Code dev env (FEAT-001) | ✅ Complete | 3 | 3 | 100% |
| 35. Crystallize architecture files (ENH-022) | ✅ Complete | 4 | 4 | 100% |
| 36. vp-auto ROADMAP.md sync (ENH-023) | ✅ Complete | 1 | 1 | 100% |
| 37. ui-direction context forward (ENH-024) | ✅ Complete | 4 | 4 | 100% |
| 38. Claude Code install env path fix (BUG-005) | ✅ Complete | 3 | 3 | 100% |
| 39. ui-direction source of truth guard (ENH-025) | ✅ Complete | 3 | 3 | 100% |
| 40. claude-code install missing lib files (BUG-006) | ✅ Complete | 2 | 2 | 100% |
| 41. install missing package.json for claude-code (BUG-007) | ✅ Complete | 2 | 2 | 100% |
| 42. brainstorm UI extraction + crystallize hard gate (ENH-026) | ✅ Complete | 6 | 6 | 100% |
| 43. Architect Design Mode + crystallize Step 1C (FEAT-011) | ✅ Complete | 8 | 8 | 100% |
| 44. Architect ERD + User Use Cases (ENH-027 + ENH-028) | ✅ Complete | 9 | 9 | 100% |
| 45. Architect System/Sequence/Deployment/APIs (ENH-029) | ✅ Complete | 11 | 11 | 100% |
| 46. Remove MVP/Post-MVP concept — phases+tasks only (ENH-030) | ✅ Complete | 10 | 10 | 100% |
| 47. Task path guard — repo-relative enforcement (BUG-009) | ✅ Complete | 4 | 4 | 100% |
| 48. Language standardization — English-primary (ENH-031) | ✅ Complete | 9 | 9 | 100% |
| 49. Language configuration system (ENH-032) | ✅ Complete | 8 | 8 | 100% |
| 50. Architect HTML: item IDs + Approve/Edit buttons (ENH-033) | ✅ Complete | 9 | 9 | 100% |
| 51. Fix diagram card IDs missing from ENH-033 (BUG-010) | ✅ Complete | 3 | 3 | 100% |
| 52. Architect delta sync — brainstorm → HTML (ENH-034) | ✅ Complete | 4 | 4 | 100% |
| 53. Dynamic adapter system (FEAT-013) | ✅ Complete | 5 | 5 | 100% |
| 54. Brainstorm staleness hook (FEAT-012) | ✅ Complete | 4 | 4 | 100% |

**Total (to date)**: 108 tasks done (phases 33–54)

---

### Phase 47: Task Path Guard — Repo-Relative Enforcement (BUG-009)
**Goal**: Add guards to `vp-evolve` (task generation) and `vp-auto` (task execution) to enforce repo-relative paths in task `## Paths` blocks. Prevents silent editing of live ViePilot install instead of source codebase.
**Estimated Tasks**: 4
**Dependencies**: None (prerequisite for phases 48 + 49)
**Directory**: `.viepilot/phases/47-bug009-path-guard/`
**Version target**: 1.15.0

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 47.1 | workflows/evolve.md — add TASK PATH RULE guard | Guard present before task generation step; CORRECT/INCORRECT examples listed | S |
| 47.2 | workflows/autonomous.md — preflight path validation | Preflight aborts on ~/  or / prefix; error names path + task file | S |
| 47.3 | skills/vp-evolve/SKILL.md + skills/vp-auto/SKILL.md — document path convention | BUG-009 note in <context> of both skills | S |
| 47.4 | Jest contract tests: vp-bug009-path-guard.test.js | 4 test groups pass; existing phase files validated | M |

**Verification**:
- [ ] Guard present in `workflows/evolve.md` before task generation step
- [ ] Preflight check present in `workflows/autonomous.md`
- [ ] `vp-tools install` + create new phase → task files use repo-relative paths
- [ ] All 4 test groups in `vp-bug009-path-guard.test.js` pass

---

### Phase 48: Language Standardization — English-Primary (ENH-031) ✅
**Goal**: Standardize all skills, workflows, and templates to English-primary. Vietnamese permitted only in `cursor_skill_adapter` invocation trigger keywords.
**Estimated Tasks**: 9
**Dependencies**: Phase 47 (BUG-009)
**Directory**: `.viepilot/phases/48-enh031-language-standardization/`
**Version target**: 1.16.0 ✅

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 48.1 | HIGH workflows: crystallize.md, autonomous.md, audit.md | No Vietnamese prose outside triggers | L |
| 48.2 | HIGH skills objective blocks: vp-audit, vp-crystallize, vp-brainstorm | objective + guard blocks fully English | M |
| 48.3 | Remaining workflows batch (9 files) | All prose English; triggers intact | M |
| 48.4 | MEDIUM skills batch 1: vp-request, vp-auto, vp-docs | Metadata + objective + process English | M |
| 48.5 | MEDIUM skills batch 2: vp-pause, vp-resume, vp-rollback | Metadata + objective + process English | M |
| 48.6 | MEDIUM skills batch 3: vp-ui-components, vp-evolve, vp-update | Metadata + objective + process English | M |
| 48.7 | Residual skills: vp-info, vp-task, vp-status, vp-debug | All Vietnamese prose removed | S |
| 48.8 | Template: templates/project/AI-GUIDE.md | All headers/labels/prose English | S |
| 48.9 | Jest contract tests for language standardization | 5 test groups pass, npm test green | M |

**Verification**:
- [ ] `grep` for Vietnamese diacritics in objective/process blocks returns 0 matches across all files
- [ ] `cursor_skill_adapter` invocation trigger keywords intact (untouched)
- [ ] All 5 test groups in vp-enh031 test file pass

---

### Phase 49: Language Configuration System (ENH-032) ✅
**Goal**: Installer prompts for communication/document language; crystallize/brainstorm/autonomous read config at runtime. Defaults: en/en.
**Estimated Tasks**: 8
**Dependencies**: Phase 48 (ENH-031 must ship first)
**Directory**: `.viepilot/phases/49-enh032-language-config/`
**Version target**: 1.17.0 ✅
**Version target**: 1.17.0

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 49.1 | New lib/viepilot-config.cjs — schema, read/write, defaults | 4 exported functions; defaults en/en | M |
| 49.2 | lib/viepilot-install.cjs — language setup prompts | Prompts at install end; --yes skips | M |
| 49.3 | bin/vp-tools.cjs — config get/set/reset CLI commands | All 3 commands work; help lists config | M |
| 49.4 | workflows/crystallize.md — inject COMMUNICATION_LANG + DOCUMENT_LANG | load_language_config step present; file writes reference DOCUMENT_LANG | M |
| 49.5 | workflows/brainstorm.md — auto-detect session language for file storage | detect_session_language step; files in BRAINSTORM_LANG | M |
| 49.6 | workflows/autonomous.md — use COMMUNICATION_LANG for banners | load_language_config step; banners reference COMMUNICATION_LANG | S |
| 49.7 | SKILL.md: vp-crystallize, vp-brainstorm, vp-auto — document language config | ENH-032 notes present in all 3 | S |
| 49.8 | Jest contract tests for ENH-032 | 4 test groups pass; npm test green | M |

**Verification**:
- [ ] `vp-tools config set language.communication vi && vp-tools config get language.communication` prints `vi`
- [ ] `~/.claude/viepilot/config.json` created after install with correct values
- [ ] load_language_config step present in crystallize.md, autonomous.md
- [ ] detect_session_language step present in brainstorm.md
- [ ] All 4 test groups in vp-enh032 test file pass

---

### Phase 50: Architect HTML — Item IDs + Approve/Edit Prompt-Copy Buttons (ENH-033) ✅
**Goal**: Add stable per-item IDs and Approve/Edit clipboard-copy buttons to all 11 Architect HTML content pages. Isolation rule: each action is scoped to one item on one page — no cross-page cascading.
**Estimated Tasks**: 9
**Dependencies**: Phase 49 (ENH-032)
**Directory**: `.viepilot/phases/50-enh033-architect-item-actions/`
**Version target**: 1.18.0

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 50.1 | `templates/architect/style.css` — button + badge styles | `.arch-id-badge`, `.arch-btn-approve`, `.arch-btn-edit`, hover-reveal classes added | S |
| 50.2 | `templates/architect/architect-actions.js` — shared JS: copyArchPrompt() + button injection | copyArchPrompt(type,slug,id,title,excerpt) works; Approve/Edit inject on DOMContentLoaded | M |
| 50.3 | `decisions.html` + `architecture.html` — data-arch-id on rows + script include | data-arch-id present on all items; buttons render | M |
| 50.4 | `erd.html` + `user-use-cases.html` — data-arch-id + script include | data-arch-id present; buttons render | M |
| 50.5 | `apis.html` + `deployment.html` — data-arch-id + script include | data-arch-id present; buttons render | M |
| 50.6 | `data-flow.html` + `sequence-diagram.html` — data-arch-id + script include | data-arch-id present; buttons render | M |
| 50.7 | `tech-stack.html` + `tech-notes.html` + `feature-map.html` — data-arch-id + script include | data-arch-id present; buttons render | M |
| 50.8 | `workflows/brainstorm.md` — document isolation rule in Architect Design Mode section | isolation rule paragraph present; per-page scoping documented | S |
| 50.9 | Jest contract tests for ENH-033 | 4 test groups pass; npm test green | M |

**Verification**:
- [ ] All 11 content pages have `data-arch-id` on item rows/cards
- [ ] `architect-actions.js` exists in `templates/architect/`
- [ ] `style.css` has `.arch-id-badge` and `.arch-btn-*` classes
- [ ] Prompt format: `[ARCH:{slug}:{id}] APPROVE/EDIT — "{title}"...`
- [ ] `workflows/brainstorm.md` isolation rule paragraph present
- [ ] All contract tests pass; npm test green

---

### Phase 51: Fix Diagram Card IDs Missing from ENH-033 (BUG-010)
**Goal**: Add `data-arch-id` + `data-arch-title` to all 9 Mermaid diagram cards across 6 pages. The `architect-actions.js` div branch and CSS hover rules already handle this — only HTML templates need patching.
**Estimated Tasks**: 3
**Dependencies**: Phase 50 (ENH-033)
**Directory**: `.viepilot/phases/51-bug010-diagram-card-ids/`
**Version target**: 1.18.1

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 51.1 | `architecture.html` + `data-flow.html` — data-arch-id on 2+2 diagram cards | ARCH-DIAG1/2, DF-DIAG1/2 present with data-arch-title | S |
| 51.2 | `erd.html` + `user-use-cases.html` + `sequence-diagram.html` + `deployment.html` — 1+1+2+1 diagram cards | ERD-DIAG1, UC-DIAG1, SEQ-DIAG1/2, DEP-DIAG1 present | S |
| 51.3 | Jest contract tests — Test Group 5 for all 9 diagram card IDs | 9 new tests pass; npm test green | S |

**Verification**:
- [ ] 9 diagram cards have `data-arch-id` across 6 pages
- [ ] All IDs have matching `data-arch-title`
- [ ] npm test green

---

### Phase 52: vp-brainstorm UI — Architect Delta Sync (ENH-034) ✅
**Goal**: When a UI brainstorm session surfaces architect-related gaps or changes, automatically sync them back to the relevant architect HTML workspace pages. Full-content update (Option B): parse session for deltas → update `<tr>` / `<div class="card">` content → mark with `data-updated` → record in `notes.md`.
**Estimated Tasks**: 4
**Dependencies**: Phase 51 (BUG-010 — data-arch-id complete on all items)
**Directory**: `.viepilot/phases/52-enh034-architect-delta-sync/`
**Version target**: 1.19.0

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 52.1 | `workflows/brainstorm.md` — `architect_delta_sync` step: trigger, gap detection, HTML update, notes.md recording | Step present; `/sync-arch` command; isolation rule respected; notes.md schema updated | M |
| 52.2 | `templates/architect/style.css` — `.arch-stale` + `.arch-gap-badge` amber indicator classes | Amber badge + left-border for `[data-arch-stale]`; light-mode override | S |
| 52.3 | `templates/architect/architect-actions.js` — `markStale()` + `injectStaleBadges()` on DOMContentLoaded | markStale(id, reason) works; badge injected for `[data-arch-stale="true"]`; `window.vpMarkStale` exposed | S |
| 52.4 | Jest contract tests: 12 tests for ENH-034 | All 12 pass; npm test green | M |

**Verification**:
- [ ] `workflows/brainstorm.md` has `architect_delta_sync` step with `/sync-arch` trigger documented
- [ ] Step: detects gaps → maps to pages → updates HTML content → records in notes.md
- [ ] `[data-arch-stale="true"]` shows amber "⚠ gap" badge in architect HTML
- [ ] `markStale(id, reason)` callable from browser console or workflow output
- [ ] 12 contract tests pass; npm test green

---

### Phase 53: Dynamic Agent Adapter System (FEAT-013) ✅
**Goal**: Replace hardcoded Cursor paths in install logic with a dynamic adapter registry. Each AI agent platform (Claude Code, Cursor, future: Antigravity, Codex…) is a self-contained `lib/adapters/{id}.cjs` module. Default install target changes from Cursor to Claude Code. No regression for existing Cursor users.
**Estimated Tasks**: 5
**Dependencies**: Phase 52 (ENH-034 — framework stable)
**Directory**: `.viepilot/phases/53-feat013-adapter-system/`
**Version target**: 2.0.0 (MAJOR)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 53.1 | `lib/adapters/` — adapter interface + registry + `claude-code.cjs` + `cursor.cjs` | Adapter spec: id/name/skillsDir/viepilotDir/hooks/isAvailable; registry getAdapter()/listAdapters() | M |
| 53.2 | `lib/viepilot-install.cjs` — refactor `buildInstallPlan()` to loop over selected adapters | No hardcoded `.cursor/` paths; default targets → claude-code; cursor-agent/cursor-ide deduplicated | L |
| 53.3 | `bin/viepilot.cjs` + `dev-install.sh` — TARGETS from registry; `VIEPILOT_ADAPTER` env var; default=claude-code | `VIEPILOT_ADAPTER=claude-code` → `~/.claude/`; `VIEPILOT_ADAPTER=cursor-agent` → `~/.cursor/`; backward compat alias | M |
| 53.4 | `bin/vp-tools.cjs` — `hooks scaffold [--adapter <id>]` subcommand | Prints settings.json snippet for Claude Code; prints Cursor explanation for cursor adapter | S |
| 53.5 | Jest contract tests — `viepilot-adapters.test.js` (~18 tests) | Adapter shape, registry, install plan paths, dev-install.sh adapter var | M |

**Verification**:
- [ ] `lib/adapters/claude-code.cjs` + `cursor.cjs` + `index.cjs` exist with correct interface
- [ ] `buildInstallPlan({}, [], {installTargets:[]})` → installs to `~/.claude/` by default
- [ ] `buildInstallPlan({}, [], {installTargets:['cursor-agent']})` → `~/.cursor/` (no regression)
- [ ] `dev-install.sh` default `VIEPILOT_ADAPTER=claude-code`
- [ ] `vp-tools hooks scaffold` prints Claude Code settings.json snippet
- [ ] All ~18 adapter tests pass + full suite green
- [ ] Adding a new adapter = only `lib/adapters/{id}.cjs` + registry entry (documented)

---

### Phase 54: Brainstorm Staleness Hook (FEAT-012) ✅
**Goal**: Ship ViePilot's first Claude Code hook — a `Stop` event handler that automatically detects stale architect/ui-direction content after each AI response in a brainstorm session, and marks affected HTML items with `data-arch-stale="true"` (amber badge). Option A (flag-only); non-blocking.
**Estimated Tasks**: 4
**Dependencies**: Phase 53 (FEAT-013 ✅ — adapter system + hooks scaffold)
**Directory**: `.viepilot/phases/54-feat012-staleness-hook/`
**Version target**: 2.1.0 (MINOR)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 54.1 | `lib/hooks/brainstorm-staleness.cjs` — Stop event handler: read stdin, find session, detect stale, patch HTML | Non-blocking (exit 0); keyword detection; idempotent HTML patch | L |
| 54.2 | `bin/vp-tools.cjs` — `hooks install [--adapter <id>]` subcommand | Merges hook entry into settings.json; idempotent | M |
| 54.3 | `docs/user/features/hooks.md` + `workflows/brainstorm.md` hook reference | Install doc; adapter table; brainstorm step auto-mode note | S |
| 54.4 | Jest contract tests — `brainstorm-staleness-hook.test.js` (~20 tests) | Hook parsing, detection, HTML patch, install command | M |

**Verification**:
- [ ] `lib/hooks/brainstorm-staleness.cjs` exists, handles empty stdin, exits 0
- [ ] Keyword detection returns correct pages for known content
- [ ] HTML patching is idempotent (no duplicate attrs)
- [ ] `vp-tools hooks install` writes Stop entry to `~/.claude/settings.json`
- [ ] Re-run is idempotent
- [ ] ~20 new tests pass + full suite green

---

### Phase 56: PATH RESOLUTION RULE — codebase vs install (BUG-012) ✅
**Goal**: Prevent vp-auto from editing production install files (`~/.claude/`) instead of codebase source. Add `⛔ PATH RESOLUTION RULE (BUG-012)` to `autonomous.md` and cwd-resolution note to `evolve.md`. Blocks Phase 55 until fixed.
**Estimated Tasks**: 3
**Dependencies**: Phase 54 ✅
**Directory**: `.viepilot/phases/56-bug012-path-resolution-rule/`
**Version target**: 2.1.1 (PATCH)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 56.1 | `workflows/autonomous.md` — add `⛔ PATH RESOLUTION RULE (BUG-012)` block after BUG-009 preflight | Block present; forbids `~/.claude/` + `~/.cursor/`; defines `{cwd}` as resolution anchor | S |
| 56.2 | `workflows/evolve.md` — append BUG-012 cwd-resolution clarification to TASK PATH RULE section | BUG-012 marker + `{cwd}` note present; no existing text removed | S |
| 56.3 | `tests/unit/vp-bug012-path-resolution-rule.test.js` — 3 contract tests | All 3 pass; no regression | S |

**Verification**:
- [ ] `autonomous.md` has PATH RESOLUTION RULE block with `{cwd}`, `~/.claude/`, `~/.cursor/` references
- [ ] `evolve.md` has BUG-012 cwd note in TASK PATH RULE
- [ ] 3 new tests pass
- [ ] `npm test` green

---

### Phase 57: Untrack .viepilot/ + Gitignore-Aware Staging Guard (BUG-013)
**Goal**: Fix recurring issue where `.viepilot/` files (gitignored) are tracked by git and repeatedly staged/pushed by vp-auto. Untrack via `git rm --cached`, add GITIGNORE-AWARE STAGING RULE to `autonomous.md`.
**Estimated Tasks**: 3
**Dependencies**: Phase 56 ✅
**Directory**: `.viepilot/phases/57-bug013-gitignore-untrack/`
**Version target**: 2.1.2 (PATCH — recurring bug fix)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 57.1 | `git rm -r --cached .viepilot/` — untrack all .viepilot files from git index; commit result | `git ls-files .viepilot/` empty; files still on disk; clean porcelain | S |
| 57.2 | `workflows/autonomous.md` — add `⛔ GITIGNORE-AWARE STAGING RULE (BUG-013)` to commit block + BUG-013 note in git persistence gate | Rule present; references `git check-ignore`; `.viepilot/` named explicitly | S |
| 57.3 | `tests/unit/vp-bug013-gitignore-staging-rule.test.js` — 3 contract tests | All 3 pass; no regression | S |

**Verification**:
- [ ] `git ls-files .viepilot/` returns empty
- [ ] `git status --porcelain` is clean after commit
- [ ] `autonomous.md` has GITIGNORE-AWARE STAGING RULE (BUG-013) block
- [ ] 3 new tests pass
- [ ] `npm test` green

---

### Phase 55: ui-direction Path Disambiguation Guard (BUG-011)
**Goal**: Fix silent path ambiguity where LLM reads `{root}/ui-direction/` (user reference dir) instead of `{root}/.viepilot/ui-direction/` (ViePilot SOT). Add PATH GUARD to `crystallize.md` and fix ambiguous path reference in `brainstorm.md` confirmation dialogue.
**Estimated Tasks**: 3
**Dependencies**: Phase 57 ✅ (BUG-013 must ship first)
**Directory**: `.viepilot/phases/55-bug011-ui-direction-path-guard/`
**Version target**: 2.1.3 (PATCH — after Phase 57/BUG-013)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 55.1 | `workflows/brainstorm.md` — fix confirmation dialogue option 1 from bare `ui-direction/notes.md` to `.viepilot/ui-direction/{session-id}/notes.md` | Option 1 path unambiguous; ENH-026 tests still pass | S |
| 55.2 | `workflows/crystallize.md` — add `⛔ PATH GUARD (BUG-011)` block at start of `consume_ui_direction` step | Guard present before UI Scope Detection; explicitly ignores `{root}/ui-direction/` | S |
| 55.3 | `tests/unit/vp-bug011-ui-direction-path-guard.test.js` — 3 contract tests verifying guards | All 3 tests pass; no regression on ENH-026's 6 tests | S |

**Verification**:
- [ ] `brainstorm.md` dialogue option 1 contains `.viepilot/ui-direction/{session-id}/notes.md`
- [ ] `crystallize.md` has `⛔ PATH GUARD (BUG-011)` before UI Scope Detection section
- [ ] 3 new tests pass
- [ ] All existing ENH-026 tests (6) still pass
- [ ] `npm test` green

---

### Phase 58: {envToolDir} template variable — replace .cursor/viepilot in skill sources (ENH-035)
**Goal**: Replace all 28 hardcoded `.cursor/viepilot` occurrences in `skills/*/SKILL.md` with the canonical placeholder `{envToolDir}`. Install step resolves it to each adapter's `executionContextBase`. Remove `pathRewrite` field from all adapters.
**Estimated Tasks**: 4
**Dependencies**: Phase 55 ✅
**Directory**: `.viepilot/phases/58-enh035-envtooldir-template/`
**Version target**: 2.2.0 (MINOR — adapter interface change)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 58.1 | 14× `skills/*/SKILL.md` — find-replace `$HOME/.cursor/viepilot/` → `$HOME/{envToolDir}/` | 0 `.cursor/viepilot` matches remain in `skills/`; 14 files have `{envToolDir}` | S |
| 58.2 | `lib/viepilot-install.cjs` — unconditional `{envToolDir}` → `adapter.executionContextBase` substitution (remove `pathRewrite` gate) | `from: '{envToolDir}'` always emitted; no `adapter.pathRewrite` reference | S |
| 58.3 | `lib/adapters/claude-code.cjs` + `cursor.cjs` — remove `pathRewrite` field | Neither file has `pathRewrite` key or comment | S |
| 58.4 | `tests/unit/viepilot-adapters.test.js` — remove `pathRewrite` assertion; update rewrite step test to `from: '{envToolDir}'` | All tests pass; rewrite test checks `{envToolDir}` → `executionContextBase` | S |

**Verification**:
- [ ] `grep -r '\.cursor/viepilot' skills/` returns 0 matches
- [ ] `grep -r '{envToolDir}' skills/` matches 14 files
- [ ] Install plan rewrite step uses `from: '{envToolDir}'`
- [ ] `npm test` green

---

### Phase 59: Antigravity adapter — vp-* skills in Google Antigravity IDE (FEAT-014)
**Goal**: Add `antigravity` as a first-class adapter. After Phase 58 (ENH-035), no `pathRewrite` needed — just `executionContextBase: '.antigravity/viepilot'`.
**Estimated Tasks**: 6
**Dependencies**: Phase 58 ✅ (ENH-035 — clean adapter shape)
**Directory**: `.viepilot/phases/59-feat014-antigravity-adapter/`
**Version target**: 2.3.0 (MINOR)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 59.1 | `lib/adapters/antigravity.cjs` — new adapter (no pathRewrite) | `getAdapter('antigravity')` OK; skillsDir/viepilotDir correct; no pathRewrite field | S |
| 59.2 | `lib/adapters/index.cjs` — register `antigravity` | `listAdapters()` returns 3 unique adapters | S |
| 59.3 | `dev-install.sh` — add `antigravity` case | `VIEPILOT_ADAPTER=antigravity` sets `.antigravity` dirs; error msg updated | S |
| 59.4 | `bin/viepilot.cjs` — add Antigravity to TARGETS + help text | `viepilot --list-targets` shows antigravity; dry-run works | S |
| 59.5 | `tests/unit/vp-adapter-antigravity.test.js` — 9 contract tests | All pass; `listAdapters()` returns 3; install plan resolves {envToolDir} correctly | S |
| 59.6 | `docs/user/features/adapters.md` — supported platforms table + install examples | All 3 adapters documented; "adding adapter" section explains ENH-035 pattern | S |

**Verification**:
- [ ] `getAdapter('antigravity')` resolves
- [ ] `listAdapters()` returns 3 unique adapters
- [ ] `viepilot install --target antigravity --yes --dry-run` runs without error
- [ ] 9 new tests pass
- [ ] `npm test` green

---

### Phase 60: Remove shell installers — install.sh + dev-install.sh (ENH-036) ✅
**Goal**: Delete both bash wrapper scripts — they are fully redundant since `bin/viepilot.cjs install --target <adapter>` covers all install functionality. Clean up `package.json` publish manifest, README.md references, and tests that only verified shell script content.
**Estimated Tasks**: 3
**Dependencies**: Phase 59 ✅ (FEAT-014 — last change to dev-install.sh)
**Directory**: `.viepilot/phases/60-enh036-remove-shell-installers/`
**Version target**: 2.3.1 (PATCH)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 60.1 | Delete `install.sh` + `dev-install.sh`; strip from `package.json` `files` | Both files gone; `npm pack --dry-run` does not include them | S |
| 60.2 | `README.md` — remove all references to deleted scripts | `grep install.sh README.md` returns 0 matches | S |
| 60.3 | Remove dev-install.sh test coverage from 2 test files (4 tests) | `npm test` green; test count drops by 4 | S |

**Verification**:
- [ ] `ls install.sh dev-install.sh` errors (files gone)
- [ ] `npm pack --dry-run` lists neither file
- [ ] `grep -n "install.sh\|dev-install.sh" README.md` → 0 matches
- [ ] `npm test` passes

---

### Phase 61: Adapter-driven post-install hints (ENH-037) ✅
**Goal**: Replace the hardcoded "Next actions" block in `bin/viepilot.cjs` with a loop over installed targets — each adapter carries its own `postInstallHint` string, so adding a new adapter automatically adds its hint without touching the CLI print logic.
**Estimated Tasks**: 3
**Dependencies**: Phase 60 ✅ (ENH-036 — shell installer cleanup)
**Directory**: `.viepilot/phases/61-enh037-post-install-hints/`
**Version target**: 2.3.2 (PATCH)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 61.1 | Add `postInstallHint` string to `claude-code.cjs`, `cursor.cjs`, `antigravity.cjs` | Each adapter has a `postInstallHint` string field | S |
| 61.2 | `bin/viepilot.cjs` — replace hardcoded lines 340-343 with adapter loop | `--target antigravity --dry-run` output contains "Antigravity:"; `--target all` shows all 3 | S |
| 61.3 | Tests — 3 shape assertions + 1 CLI output test | `npm test` passes; count +3 (595 → 598) | S |

**Verification**:
- [ ] `viepilot install --target antigravity --yes --dry-run` prints "- Antigravity: Open project..."
- [ ] `viepilot install --target all --yes --dry-run` shows Claude Code, Cursor, Antigravity hints
- [ ] `npm test` passes

---

### Phase 62: Codex CLI adapter (FEAT-015) ✅
**Goal**: Add `codex` as a first-class adapter for OpenAI Codex CLI (`~/.codex/`). SKILL.md format is natively compatible; only difference is `$skill-name` invocation syntax vs `/skill-name`. Also removes stale `dev-install.sh` reference from `docs/user/features/adapters.md`.
**Estimated Tasks**: 4
**Dependencies**: Phase 61 ✅ (ENH-037 — postInstallHint), Phase 60 ✅ (ENH-036 — shell cleanup)
**Directory**: `.viepilot/phases/62-feat015-codex-adapter/`
**Version target**: 2.4.0 (MINOR)

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 62.1 | `lib/adapters/codex.cjs` — new adapter; `postInstallHint` uses `$vp-status` | `getAdapter('codex')` OK; skillsDir/viepilotDir correct; postInstallHint contains `$vp-status` | S |
| 62.2 | `lib/adapters/index.cjs` + `bin/viepilot.cjs` — register + TARGETS + help | `--list-targets` shows codex; dry-run outputs "Codex:"; `listAdapters()` → 4 | S |
| 62.3 | `tests/unit/vp-adapter-codex.test.js` (10 tests) + update 2 existing test files | `npm test` passes; count +10 | S |
| 62.4 | `docs/user/features/adapters.md` — Codex row + `$skill-name` note + remove dev-install ref | `grep dev-install` → 0; Codex documented | S |

**Verification**:
- [ ] `viepilot install --target codex --yes --dry-run` outputs "Codex: Open project and type $vp-status..."
- [ ] `listAdapters()` returns 4 unique adapters
- [ ] `npm test` passes
- [ ] No `dev-install.sh` reference in adapters.md

---

## M1.30 — FEAT-016: vp-proposal skill (v2.5.0)

### Overview
- **Version**: 2.5.0
- **Goal**: New `/vp-proposal` skill — convert brainstorm notes → .pptx + .docx + .md proposal package
- **Phases**: 5 (63–67)
- **Status**: 🔲 Planned (2026-04-11)

---

### Phase 63: Core Infrastructure ✅
**Goal**: Add pptxgenjs + docx dependencies; `lib/proposal-generator.cjs` with template resolution
**Estimated Tasks**: 3
**Dependencies**: Phase 62 ✅
**Directory**: `.viepilot/phases/63-feat016-proposal-core/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 63.1 | Add npm dependencies | `pptxgenjs` + `docx` in dependencies; `@googleapis/slides` in optionalDependencies | S |
| 63.2 | `lib/proposal-generator.cjs` | Template resolution (2-tier) + base pptx/docx writer API + JSON slide manifest schema | L |
| 63.3 | Unit tests: template resolution | Jest: project override → stock fallback; missing template → error; 4 type IDs valid | M |

**Verification**:
- [ ] `node -e "require('./lib/proposal-generator.cjs')"` no errors
- [ ] Template resolution picks `.viepilot/proposal-templates/` over stock
- [ ] `npm test` passes

---

### Phase 64: Skill + Workflow ✅
**Goal**: `skills/vp-proposal/SKILL.md` + `workflows/proposal.md`; context detection; 4 proposal types wired
**Estimated Tasks**: 3
**Dependencies**: Phase 63
**Directory**: `.viepilot/phases/64-feat016-proposal-skill/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 64.1 | `skills/vp-proposal/SKILL.md` | Skill definition: objective, context, process, success criteria; `--type`, `--from`, `--slides` flags | M |
| 64.2 | `workflows/proposal.md` | Full step-by-step: context detection → AI content structure → generate files → optional upload | L |
| 64.3 | Context detection spec | Auto-load latest `docs/brainstorm/session-*.md`; fallback to standalone brief; `--from` override | M |

**Verification**:
- [ ] SKILL.md has all required sections
- [ ] workflow.md covers all 4 proposal types
- [ ] Context detection logic documented and testable

---

### Phase 65: Stock Templates ✅
**Goal**: Generate 4 dark navy/charcoal .pptx + 1 .docx stock templates; include in npm package
**Estimated Tasks**: 4
**Dependencies**: Phase 63
**Directory**: `.viepilot/phases/65-feat016-proposal-templates/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 65.1 | `scripts/gen-proposal-pptx.cjs` | Script generates 4 stock .pptx templates via pptxgenjs; dark navy (#1a1f36) / charcoal (#2d3142) palette | L |
| 65.2 | `scripts/gen-proposal-docx.cjs` | Script generates 1 stock .docx template via docx package; matching style | M |
| 65.3 | Run scripts → committed templates | `templates/proposal/pptx/*.pptx` + `templates/proposal/docx/*.docx` present | S |
| 65.4 | `package.json` files array | Add `templates/proposal/` to ensure templates ship in npm package | S |

**Verification**:
- [ ] `ls templates/proposal/pptx/` shows 4 files
- [ ] `ls templates/proposal/docx/` shows 1 file
- [ ] `npm pack --dry-run` includes `templates/proposal/`

---

### Phase 66: Google Slides Export ✅
**Goal**: `--slides` flag → upload .pptx to Google Slides via service account auth
**Estimated Tasks**: 3
**Dependencies**: Phase 64
**Directory**: `.viepilot/phases/66-feat016-google-slides/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 66.1 | `lib/google-slides-exporter.cjs` | Service account auth; upload .pptx → Google Slides; return public URL | L |
| 66.2 | Wire `--slides` into skill + workflow | SKILL.md `--slides` flag documented; workflow Step 7 calls exporter; writes URL to `*-slides.txt` | M |
| 66.3 | Google Slides setup docs | `docs/user/features/proposal.md` section: create service account, download JSON key, set env var | M |

**Verification**:
- [ ] `@googleapis/slides` loads only when `--slides` flag present
- [ ] Missing credentials gives clear error message (not crash)
- [ ] URL written to `docs/proposals/{slug}-{date}-slides.txt`

---

### Phase 67: Tests + Docs ✅
**Goal**: Jest contracts; full user guide; update skills-reference + README; CHANGELOG 2.5.0
**Estimated Tasks**: 5
**Dependencies**: Phases 63–66
**Directory**: `.viepilot/phases/67-feat016-tests-docs/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 67.1 | `tests/unit/vp-proposal-contracts.test.js` | Tests: SKILL.md exists, workflow.md exists, proposal-generator exports resolveTemplate, 4 type IDs valid, optionalDep check | M |
| 67.2 | `docs/user/features/proposal.md` | Full user guide: usage, output files, proposal types, template override, Google Slides setup | M |
| 67.3 | `docs/skills-reference.md` update | Add `/vp-proposal` section with flags, output, examples | S |
| 67.4 | README.md update | Skills count 16→17; add vp-proposal row to Skills Reference table | S |
| 67.5 | CHANGELOG.md 2.5.0 | Add `[2.5.0]` entry; bump `package.json` version 2.4.0→2.5.0 | S |

**Verification**:
- [ ] `npm test` passes (all suites including new vp-proposal-contracts)
- [ ] README skills badge shows 17
- [ ] `npm version` shows 2.5.0

---

## Future Milestones (Backlog)

### M2 - Enterprise Features
- Multi-workspace support
- Team collaboration
- Custom skill marketplace
- Enterprise SSO

### M3 - AI Enhancements
- Multi-model support (GPT, Gemini, etc.)
- Context optimization
- Cost tracking
- Quality scoring

---

---

## M1.31 — ENH-039: vp-proposal language selection (v2.6.0)

### Overview
- **Version**: 2.6.0
- **Goal**: `--lang <code>` flag for `/vp-proposal` — AI-generated content in chosen language; MRU config persistence
- **Phases**: 1 (68)
- **Status**: ✅ Complete (2026-04-10)

---

### Phase 68: vp-proposal language selection ✅
**Goal**: `--lang` + `--lang-content-only` flags; `getProposalLang` / `recordProposalLang` config helpers; MRU prompt UX; tests
**Estimated Tasks**: 4
**Dependencies**: Phase 67 ✅ (FEAT-016 base)
**Directory**: `.viepilot/phases/68-enh039-proposal-lang/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 68.1 | `lib/viepilot-config.cjs` | Add `proposal.recentLangs` to DEFAULTS; `getProposalLang()` + `recordProposalLang()` helpers | M |
| 68.2 | `lib/proposal-generator.cjs` | `buildLangInstruction(lang, contentOnly)` — returns AI prompt language instruction | M |
| 68.3 | SKILL.md + workflows/proposal.md | `--lang`/`--lang-content-only` flags documented; Step 3b Language Selection UX (MRU prompt); manifest Step 4 injects lang instruction | M |
| 68.4 | Tests + CHANGELOG 2.6.0 | `vp-enh039-proposal-lang.test.js` (13 tests); contract tests updated; version 2.6.0 | M |

**Verification**:
- [ ] `--lang vi` sets Vietnamese for all generated content
- [ ] No `--lang` → MRU prompt shown
- [ ] Used language saved to `~/.viepilot/config.json → proposal.recentLangs`
- [ ] `--lang-content-only` keeps structural labels in English
- [ ] `npm test` passes

---

---

## M1.32 — ENH-040: vp-proposal quality uplift (v2.7.0)

### Overview
- **Version**: 2.7.0
- **Goal**: Comprehensive quality uplift — workflow brief, richer AI prompt, distinct .pptx layouts, .docx tables + narrative
- **Phases**: 1 (69)
- **Status**: ✅ Complete (2026-04-10)

---

### Phase 69: vp-proposal quality uplift ✅
**Goal**: 4-layer improvement: Step 2C quality brief, AI prompt contract, 5 distinct pptx layouts, docx tables/narrative
**Estimated Tasks**: 5
**Dependencies**: Phase 68 ✅ (ENH-039)
**Directory**: `.viepilot/phases/69-enh040-proposal-quality/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 69.1 | workflows/proposal.md + lib | Step 2C: 4 quality-brief questions; manifest meta field (cta, budget, timeline, decisionMaker) | M |
| 69.2 | workflows/proposal.md | Richer AI prompt contract: 8–15 word bullets, 3–5 sentence notes, outcome-oriented, concrete CTA | M |
| 69.3 | scripts/gen-proposal-pptx.cjs + templates | 5 distinct layouts: cover, section, two-column, data, closing; regenerate 4 stock .pptx | L |
| 69.4 | scripts/gen-proposal-docx.cjs + templates | Timeline table, Budget table, narrative paragraphs, regenerate stock .docx | L |
| 69.5 | Tests + CHANGELOG 2.7.0 | vp-enh040-proposal-quality.test.js (16 tests); contract tests +2; version 2.7.0 | M |

**Verification**:
- [ ] `workflow.md` Step 2C present with 4 quality-brief questions
- [ ] AI prompt contract specifies 8–15 word bullets + 3–5 sentence notes
- [ ] 4 `.pptx` files regenerated with 5 distinct layouts
- [ ] `.docx` template has Timeline + Budget tables
- [ ] `npm test` passes

---

---

## M1.33 — ENH-041: vp-proposal docx AI-native + UML diagrams (v2.8.0)

### Overview
- **Version**: 2.8.0
- **Goal**: Docx becomes an AI-native independent document with deep content + Mermaid UML diagrams
- **Phases**: 1 (70)
- **Status**: 🔲 Planned (2026-04-10)

---

### Phase 70: vp-proposal docx AI-native generation ✅
**Goal**: Step 4b separate AI pass for docx; getDiagramTypes(); Mermaid in .md; Risk Register + Glossary in .docx
**Estimated Tasks**: 5
**Dependencies**: Phase 69 ✅ (ENH-040)
**Directory**: `.viepilot/phases/70-enh041-proposal-docx-ai/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 70.1 | workflows/proposal.md | Step 4b `generate_docx_content` — separate AI prompt contract; docxContent JSON schema | M |
| 70.2 | lib/proposal-generator.cjs | `getDiagramTypes(typeId)` — returns diagram array per proposal type | S |
| 70.3 | workflows/proposal.md | Step 7 uses docxContent; Step 8 embeds Mermaid fenced blocks | M |
| 70.4 | scripts/gen-proposal-docx.cjs + templates | `riskRegisterTable()` + `glossaryTable()` + Risk Register + Glossary sections; regenerate | M |
| 70.5 | Tests + CHANGELOG 2.8.0 | vp-enh041-proposal-docx-ai.test.js (17 tests); contracts +5; version 2.8.0 | M |

**Verification**:
- [x] `workflow.md` Step 4b present with `docxContent` schema
- [x] `getDiagramTypes('tech-architecture')` returns `['flowchart', 'sequenceDiagram', 'classDiagram']`
- [x] `.md` output contains Mermaid fenced code blocks
- [x] `.docx` template has Risk Register + Glossary sections
- [x] `npm test` passes (717/717)

---

---

## M1.34 — ENH-042: vp-proposal PPTX Visual Imagery (v2.9.0)

### Overview
- **Version**: 2.9.0
- **Goal**: PPTX slides get visual screenshots from ui-direction & architect HTML artifacts; fallback placeholder shape when puppeteer absent
- **Phases**: 1 (71)
- **Status**: 🔲 Planned (2026-04-11)

---

### Phase 71: vp-proposal PPTX visual imagery ✅
**Goal**: detectVisualArtifacts() + Step 4c + screenshotArtifact() + placeholder shape
**Estimated Tasks**: 4
**Dependencies**: Phase 70 ✅ (ENH-041), Phase 69 ✅ (ENH-040)
**Directory**: `.viepilot/phases/71-enh042-proposal-visuals/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 71.1 | lib/proposal-generator.cjs | `detectVisualArtifacts(sessionDir)` — scans ui-direction + architect pages | S |
| 71.2 | workflows/proposal.md | Step 4c `detect_visual_artifacts` — artifact→slide mapping + `visualSlides[]` manifest field | M |
| 71.3 | lib/screenshot-artifact.cjs + scripts/gen-proposal-pptx.cjs | `screenshotArtifact()` (puppeteer optional) + `addPlaceholderVisual()` + runtime integration | M |
| 71.4 | Tests + CHANGELOG 2.9.0 | vp-enh042-proposal-visuals.test.js (≥15 tests); contracts +3; version 2.9.0 | M |

**Verification**:
- [x] `detectVisualArtifacts('/nonexistent')` returns `{ uiPages: [], architectPages: [], sessionDir: null }` (no throw)
- [x] `screenshotArtifact()` returns `null` when puppeteer absent (no crash)
- [x] `workflows/proposal.md` has Step 4c with `visualSlides[]` schema
- [x] Stock `gen-proposal-pptx.cjs` still generates all 4 templates cleanly
- [x] `npm test` passes (747/747)

---

---

## M1.35 — ENH-043: vp-proposal .docx Visual Embedding (v2.10.0)

### Overview
- **Version**: 2.10.0
- **Goal**: .docx embeds Mermaid charts as rendered PNG images + HTML artifact screenshots
- **Phases**: 1 (72)
- **Status**: 🔲 Planned (2026-04-11)

---

### Phase 72: vp-proposal .docx visual embedding ✅
**Goal**: renderMermaidToPng() + imageRunFromPng() + screenshot injection in docx
**Estimated Tasks**: 4
**Dependencies**: Phase 71 ✅ (ENH-042), Phase 70 ✅ (ENH-041)
**Directory**: `.viepilot/phases/72-enh043-docx-visuals/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 72.1 | lib/screenshot-artifact.cjs | `isMmdcAvailable()` + `renderMermaidToPng(source, outPath)` | S |
| 72.2 | scripts/gen-proposal-docx.cjs | `imageRunFromPng()` + runtime embedding comment (Mermaid + ui + architect) | M |
| 72.3 | workflows/proposal.md | Step 7 update: document PNG rendering + screenshot injection + fallback | S |
| 72.4 | Tests + CHANGELOG 2.10.0 | vp-enh043-docx-visuals.test.js (≥14 tests); contracts +2; version 2.10.0 | M |

**Verification**:
- [ ] `isMmdcAvailable()` + `renderMermaidToPng()` exported and return without throwing when mmdc absent
- [ ] `imageRunFromPng(null)` returns null (no crash)
- [ ] `workflows/proposal.md` Step 7 documents `renderMermaidToPng` + `screenshotArtifact`
- [ ] Stock `gen-proposal-docx.cjs` still generates cleanly
- [ ] `npm test` passes

---

---

## M1.36 — ENH-044: vp-proposal Mandatory Visual Enforcement (v2.10.1)

### Overview
- **Version**: 2.10.1
- **Goal**: When `detectVisualArtifacts()` returns non-empty, visual embedding is mandatory — no silent skip
- **Phases**: 1 (73)
- **Status**: ✅ Complete (2026-04-11)

---

### Phase 73: vp-proposal mandatory visual enforcement ✅
**Goal**: warnMissingTool() helper + Step 4c/Step 7 mandatory enforcement language
**Estimated Tasks**: 3
**Dependencies**: Phase 72 ✅ (ENH-043), Phase 71 ✅ (ENH-042)
**Directory**: `.viepilot/phases/73-enh044-visual-enforce/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 73.1 | lib/screenshot-artifact.cjs | `warnMissingTool(tool, installCmd)` exported helper — stderr ⚠ warning with install hint | S |
| 73.2 | workflows/proposal.md | Step 4c + Step 7: mandatory enforcement language; warnMissingTool() call sites; remove silent-skip | M |
| 73.3 | Tests + CHANGELOG 2.10.1 | vp-enh044-visual-enforce.test.js (≥8 tests); version 2.10.1 | S |

**Verification**:
- [ ] `warnMissingTool()` exported and writes to stderr with ⚠, tool name, install command
- [ ] `workflows/proposal.md` Step 4c: no silent-skip language; warnMissingTool + placeholder path documented
- [ ] `workflows/proposal.md` Step 7: warnMissingTool for mmdc + puppeteer absent paths
- [ ] `npm test` passes (all suites)

---

## Notes
- Created: 2026-03-30
---

## M1.37 — ENH-045: vp-proposal Dynamic Slide Count + AI-driven Visual Design (v2.11.0)

### Overview
- **Version**: 2.11.0
- **Goal**: Dynamic slide count (no hard max) + designConfig (3 palette styles) + rich visual layouts
- **Phases**: 1 (74)
- **Status**: 🔲 Planned (2026-04-11)

---

### Phase 74: vp-proposal dynamic slides + visual design ✅
**Goal**: Remove slide hardcap + designConfig + rich layouts (timeline-gantt, team-card, investment-visual)
**Estimated Tasks**: 4
**Dependencies**: Phase 73 ✅ (ENH-044), Phase 71 ✅ (ENH-042)
**Directory**: `.viepilot/phases/74-enh045-dynamic-slides/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 74.1 | workflows/proposal.md | Remove slide hardcap + designConfig field + content-aware split rules + AI prompt DESIGN SELECTION | M |
| 74.2 | lib/proposal-generator.cjs | `getDesignConfig(projectContext)` + `DESIGN_CONFIGS` (3 styles) | S |
| 74.3 | scripts/gen-proposal-pptx.cjs | Palette-driven layouts + 3 rich layouts + 3 palette PPTX variants for project-proposal | L |
| 74.4 | Tests + CHANGELOG 2.11.0 | vp-enh045-dynamic-slides.test.js (≥12 tests); version 2.11.0 | S |

**Verification**:
- [ ] `getDesignConfig({sector:'fintech'})` returns `enterprise` layout
- [ ] `workflows/proposal.md` no longer has `slides.length MUST equal` hardcap
- [ ] `templates/proposal/pptx/project-proposal-{modern-tech,enterprise,creative}.pptx` exist
- [ ] Timeline slide uses gantt bars; Team slide uses card layout
- [ ] `npm test` passes (all suites)

---

### Phase 75: vp-crystallize Brownfield Mode ✅
**Goal**: Bootstrap `.viepilot/` project context from an existing codebase — no brainstorm session required. Runs a 12-category scanner, produces a structured Scan Report with gap detection, interactively fills missing context, then generates the full `.viepilot/` artifact set.
**Estimated Tasks**: 4
**Dependencies**: Phase 73 ✅ (ENH-044)
**Directory**: `.viepilot/phases/75-feat018-brownfield/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 75.1 | workflows/crystallize.md | Brownfield detection step + Signal Cat 1–6 (build manifests, frameworks, arch layers, DB, API contracts, infra) + Scan Report schema stub | M |
| 75.2 | workflows/crystallize.md | Signal Cat 7–12 (env, tests, quality, docs, git, lang survey) + finalized Scan Report + Gap Detection Rules + gap-filling + brainstorm stub + safety rules + TRACKER annotation | M |
| 75.3 | skills/vp-crystallize/SKILL.md + skills/vp-audit/SKILL.md | `--brownfield` flag docs + 12-category summary + audit brownfield stub compatibility rule | S |
| 75.4 | Tests + CHANGELOG 2.12.0 | vp-feat018-brownfield.test.js (≥15 tests); version 2.12.0 | S |

---

### Phase 76: Git Forge Agnostic Remote URL Parsing ✅
**Goal**: Generalize `workflows/documentation.md` URL parser and `workflows/crystallize.md` Step 0 label so ViePilot works with GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, and self-hosted remotes — not just `github.com`.
**Estimated Tasks**: 2
**Dependencies**: Phase 75 ✅ (FEAT-018)
**Directory**: `.viepilot/phases/76-enh046-git-forge/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 76.1 | workflows/documentation.md | Forge-agnostic URL parser (SSH + HTTPS + Azure DevOps); rename GITHUB_OWNER/REPO → GIT_HOST/GIT_OWNER/GIT_REPO | S |
| 76.2 | crystallize.md label + vp-docs SKILL.md + tests + CHANGELOG 2.13.0 | Step 0 forge-agnostic wording; ≥5 tests; version 2.13.0 | S |

**Verification**:
- [ ] `--brownfield` flag recognized; auto-detection triggers when no brainstorm session + no .viepilot/
- [ ] All 12 signal categories present in workflows/crystallize.md
- [ ] Scan Report YAML schema with open_questions[] present
- [ ] MUST-DETECT gap blocks artifact generation until user fills
- [ ] `session-brownfield-import.md` stub creation documented
- [ ] Safety rules: `.env` never read; skip `node_modules/` `.git/` `target/` `build/` `dist/`
- [ ] `vp-audit` brownfield stub compatibility rule present
- [ ] `npm test` passes (≥15 new tests green)

---

---

### Phase 77: Brownfield Multi-Repo, Git Submodules & Per-Module Gap Detection ✅
**Goal**: Extend the Phase 75 brownfield scanner with: (A) git submodule detection via `.gitmodules`; (B) polyrepo/multi-repo signals + interactive user prompt; (C) per-module gap tier with `must_detect_status{}` and root rollup rule.
**Estimated Tasks**: 4
**Dependencies**: Phase 75 ✅ (FEAT-018), Phase 76 ✅ (ENH-046)
**Directory**: `.viepilot/phases/77-enh047-multi-repo/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 77.1 | crystallize.md — Gap A: git submodule detection | .gitmodules parsed; modules[] type/submodule_url/initialized fields; safety rule documented | S |
| 77.2 | crystallize.md — Gap B: polyrepo hints + prompt | 6 signal sources table; polyrepo_hints[]/related_repos[] in schema; prompt + gap-fill ASSUMED rule | M |
| 77.3 | crystallize.md + skills/vp-crystallize/SKILL.md — Gap C: per-module gap | must_detect_status{}; gap_tier per module; root rollup; pause-and-ask; SKILL.md update | M |
| 77.4 | Tests + CHANGELOG 2.14.0 | vp-enh047-multi-repo.test.js ≥8 tests; version 2.14.0 | S |

---

### Phase 78: AskUserQuestion Adapter-Aware Integration (ENH-048) ✅
**Goal**: Integrate `AskUserQuestion` tool into all vp-* workflows that ask user questions. Claude Code (terminal) gets structured click-to-select UI; Cursor, Codex, Antigravity, and other adapters fall back to existing text prompts automatically.
**Estimated Tasks**: 5
**Dependencies**: Phase 77 ✅ (ENH-047)
**Directory**: `.viepilot/phases/78-enh048-askuserquestion/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 78.1 | crystallize.md — adapter pattern + question blocks | Adapter-aware pattern on all question blocks; compatibility table; text fallback preserved | M |
| 78.2 | brainstorm.md — question blocks | Session type, scope, related-feature questions updated; open-ended questions kept as text | S |
| 78.3 | request.md + evolve.md — question blocks | Type detection, severity, priority, intent, complexity questions updated | M |
| 78.4 | SKILL.md × 3 + contract tests | Adapter Compatibility section in vp-{crystallize,brainstorm,request}/SKILL.md; ≥10 tests | M |
| 78.5 | CHANGELOG + version 2.15.0 | CHANGELOG [2.15.0]; package.json = "2.15.0" | S |

**Verification**:
- [ ] All 4 workflow files have `Adapter-aware prompt` + `AskUserQuestion` markers
- [ ] 3 SKILL.md files have `Adapter Compatibility` section
- [ ] ≥10 contract tests pass
- [ ] package.json = 2.15.0

---

### Phase 79: vp-audit Tier 4 Silent Mode (ENH-049) ✅
**Goal**: Make Tier 4 (Framework Integrity) checks completely silent when passing or skipped. Only surface Tier 4 output in the audit report when issues (⚠️) are detected. Eliminates noise from "Tier 4 Skipped" and "✅ In sync" lines.
**Estimated Tasks**: 3
**Dependencies**: Phase 78 ✅ (ENH-048)
**Directory**: `.viepilot/phases/79-enh049-audit-tier4-silent/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 79.1 | `workflows/audit.md` — Tier 4 silent patches | 4 edits: remove skip echo, 4f conditional, All Clear no Tier 4, Issues banner conditional | S |
| 79.2 | `skills/vp-audit/SKILL.md` + contract tests | Behavior note updated; ≥5 contract tests pass | S |
| 79.3 | CHANGELOG + version 2.16.0 | [2.16.0] entry; package.json = "2.16.0" | S |

**Verification**:
- [ ] No `echo "→ Tier 4 skipped"` in `workflows/audit.md`
- [ ] Step 4f wrapped in `TIER4_ISSUES > 0` guard
- [ ] All Clear banner has no Tier 4 line
- [ ] ≥5 contract tests pass
- [ ] package.json = 2.16.0

---

---

### Phase 80: Git Tag Format — Branch + Version (ENH-050) ✅
**Goal**: Enrich vp-auto git tags to include the active branch and package version, making tags fully self-describing. Old: `viepilot-vp-p77-t4`. New: `viepilot-main-2.17.0-vp-p77-t4`.
**Estimated Tasks**: 3
**Dependencies**: Phase 79 ✅ (ENH-049)
**Directory**: `.viepilot/phases/80-enh050-git-tag-format/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 80.1 | `workflows/autonomous.md` — BRANCH_SAFE + VERSION + 3 tag patterns | TAG_PREFIX resolution block; task/phase tag patterns updated | S |
| 80.2 | `workflows/audit.md` + `workflows/rollback.md` — regex update | Both legacy + new format matched; `.` added to char classes | S |
| 80.3 | Contract tests + CHANGELOG + version 2.17.0 | ≥5 tests pass; [2.17.0]; package.json = "2.17.0" | S |

**Verification**:
- [ ] `workflows/autonomous.md` has `BRANCH_SAFE`, `VERSION`, `TAG_PREFIX` block
- [ ] All 3 tag creation patterns use `{TAG_PREFIX}`
- [ ] `audit.md` regex matches `viepilot-main-2.17.0-vp-p80-complete` AND `viepilot-vp-p60-complete`
- [ ] ≥5 contract tests pass
- [ ] package.json = "2.17.0"

---

---

### Phase 81: Workflow Consistency Fixes (BUG-014 + ENH-051–055) ✅
**Goal**: Fix 6 workflow inconsistencies found by codebase audit: enriched tag parse in rollback, brownfield step clarity in crystallize, pre-save validation in brainstorm, version bump unification, audit auto-hook integration, and AskUserQuestion enforcement.
**Estimated Tasks**: 7
**Dependencies**: Phase 80 ✅ (ENH-050)
**Directory**: `.viepilot/phases/81-workflow-consistency-fixes/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 81.1 | `workflows/rollback.md` — enriched tag parse (BUG-014) | Step 7 handles 3 tag formats; HANDOFF.json restored correctly | S |
| 81.2 | `workflows/crystallize.md` — brownfield execution path table (ENH-051) | Explicit RUN/SKIP/CONDITIONAL table for Steps 1/1A–1D | S |
| 81.3 | `workflows/brainstorm.md` — pre-save phase validation gate (ENH-052) | Save blocked when phases empty; exploratory mode bypass documented | S |
| 81.4 | Version bump unification — `SYSTEM-RULES.md` + evolve.md + autonomous.md (ENH-053) | Single authoritative table; both workflows reference it | M |
| 81.5 | `workflows/audit.md` + `workflows/autonomous.md` — exact auto-hook integration (ENH-054) | Concrete `<step>` XML block in autonomous.md; post-phase audit runs Tier 1+2 | M |
| 81.6 | AUQ enforcement in 4 workflows + 4 SKILL.md (ENH-055) | All AUQ blocks marked REQUIRED for Claude Code; contract tests ≥4 | M |
| 81.7 | Contract tests + CHANGELOG + version 2.18.0 | ≥12 new tests; [2.18.0] entry; package.json = "2.18.0" | S |

**Verification**:
- [ ] `rollback.md` Step 7 parses `{p}-{b}-{v}-vp-p{N}-t{M}` format correctly
- [ ] `crystallize.md` has brownfield execution path table (RUN/SKIP/CONDITIONAL per sub-step)
- [ ] `brainstorm.md` Step 6 blocks save when `## Phases` missing or Phase 1 empty
- [ ] `SYSTEM-RULES.md` has version bump canonical table; evolve.md + autonomous.md reference it
- [ ] `autonomous.md` has `<step name="post_phase_audit">` block after phase complete step
- [ ] All 4 workflows have "Claude Code — REQUIRED" in every AUQ block
- [ ] ≥12 contract tests pass
- [ ] package.json = "2.18.0"

---

### Phase 82: Skill Invocation Greeting Banner (ENH-056) ✅
**Goal**: Every `vp-*` skill prints a version banner on invocation so users can confirm which version is running — needed after Claude Code stopped showing skill-load indicators.
**Estimated Tasks**: 2
**Dependencies**: Phase 81 ✅
**Directory**: `.viepilot/phases/82-skill-greeting-banner/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 82.1 | Add `<greeting>` block to all 17 `skills/vp-*/SKILL.md` | All 17 files have `<greeting>` block with banner template + version fields | M |
| 82.2 | Contract tests + CHANGELOG + version 2.19.0 | ≥85 new tests (17 skills × ≥5 checks); `[2.19.0]` in CHANGELOG; package.json = "2.19.0" | S |

**Verification**:
- [ ] `grep -l '<greeting>' skills/*/SKILL.md | wc -l` == 17
- [ ] Each banner includes skill name, skill version, framework version
- [ ] Banner outputs BEFORE any questions or work
- [ ] All tests pass

---

---

### Phase 83: ViePilot Agents System (ENH-057)
**Goal**: Create a lightweight agents layer — 6 dedicated sub-agents (tracker, research, file-scanner, changelog, test-generator, doc-sync) that handle repetitive/parallelizable operations currently embedded inline in skill workflows. Reduces context bloat, eliminates skill coupling, and enables concurrent execution.
**Estimated Tasks**: 5
**Dependencies**: Phase 82 ✅ (ENH-056)
**Directory**: `.viepilot/phases/83-enh057-agents-system/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 83.1 | Create 6 agent `.md` files in `viepilot/agents/` | All 6 files exist with Purpose/Inputs/Outputs/Invocation/Adapter Behavior sections | M |
| 83.2 | Wire tracker-agent + changelog-agent into `autonomous.md` | Inline TRACKER/changelog blocks replaced with invoke-agent patterns; ENH-053 resolved | M |
| 83.3 | Wire research-agent into `request.md` feasibility gate | Step 1B added; auto-triggers on Feature requests requiring tech feasibility | S |
| 83.4 | Wire doc-sync-agent into `autonomous.md` bulk-edit pattern | Bulk-edit detection (≥5 identical files) triggers doc-sync-agent; worked example present | S |
| 83.5 | Contract tests + `docs/developer/agents.md` + CHANGELOG + version 2.20.0 | ≥6 tests pass; docs/developer/agents.md; [2.20.0]; package.json = "2.20.0" | S |

**Verification**:
- [ ] `viepilot/agents/` contains exactly 6 `.md` files
- [ ] Each agent has all required sections (Purpose, Inputs, Outputs, Invocation Pattern, Adapter Behavior)
- [ ] `autonomous.md` has `<agents>` delegation table + invoke-agent blocks
- [ ] `request.md` has Step 1B feasibility gate referencing research-agent
- [ ] ≥6 contract tests pass
- [ ] package.json = "2.20.0"

---

### Phase 84: GitHub Copilot Adapter (FEAT-019) ✅ complete
**Goal**: Add `copilot` as a first-class ViePilot adapter enabling vp-* skills in VS Code Copilot Chat and GitHub Copilot CLI. Research confirmed HIGH feasibility: GitHub Copilot SDK supports custom agents via `.agent.md`; third-party agents GA April 2026.
**Estimated Tasks**: 5 / **Completed**: 2026-04-18 / **Version**: 2.21.0
**Dependencies**: Phase 83 ✅ (ENH-057 — doc-sync-agent used for bulk SKILL.md update)
**Directory**: `.viepilot/phases/84-feat019-copilot-adapter/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 84.1 | `lib/adapters/copilot.cjs` + register in `lib/adapters/index.cjs` | Adapter fields correct; getAdapter("copilot") resolves; isAvailable checks gh-copilot dir + gh binary | S |
| 84.2 | `lib/viepilot-install.cjs` — add `copilot` install target | `viepilot install --adapter copilot` works; post-install message correct | S |
| 84.3 | Update all 17 SKILL.md — add Copilot adapter row (via doc-sync-agent) | All 17 SKILL.md have `GitHub Copilot` row; `grep -l 'GitHub Copilot' skills/*/SKILL.md \| wc -l` == 17 | M |
| 84.4 | `docs/user/features/adapters.md` — document Copilot surface variants | Section covers VS Code Chat, CLI, cloud (preview), JetBrains (pending); config dir shown | S |
| 84.5 | Contract tests + CHANGELOG + version 2.21.0 | ≥8 tests pass; [2.21.0] in CHANGELOG; package.json = "2.21.0" | S |

**Verification**:
- [ ] `lib/adapters/copilot.cjs` exists with correct `id`, `skillsDir`, `viepilotDir`, `isAvailable`
- [ ] `lib/adapters/index.cjs` has `'copilot': require('./copilot.cjs')`
- [ ] `viepilot install --adapter copilot` targets `~/.config/gh-copilot/`
- [ ] `grep -l 'GitHub Copilot' skills/*/SKILL.md | wc -l` == 17
- [ ] ≥8 contract tests pass
- [ ] package.json = "2.21.0"

---

---

### Phase 85: Workflow Continuation Prompt (ENH-058) ✅ complete
**Goal**: Replace static "Next:" text at the end of `vp-evolve` and `vp-request` with `AskUserQuestion` prompts that actively offer the next action and immediately invoke the chosen skill — eliminating manual command re-typing.
**Estimated Tasks**: 2 / **Completed**: 2026-04-18 / **Version**: 2.22.0
**Dependencies**: Phase 83 ✅ (request.md edited at Step 1B; Phase 85 edits Step 6 — must apply sequentially)
**Directory**: `.viepilot/phases/85-enh058-workflow-continuation/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 85.1 | AUQ continuation in `evolve.md` Step 5 + `request.md` Step 6 + SKILL.md AUQ tables | Both workflows have AUQ block + text fallback; both SKILL.md AUQ tables updated | S |
| 85.2 | Contract tests + CHANGELOG + version 2.22.0 | ≥4 tests pass (≥6 recommended); [2.22.0]; package.json = "2.22.0" | S |

**Verification**:
- [ ] `evolve.md` Step 5 has AUQ with "Execute now → /vp-auto" option that invokes skill
- [ ] `request.md` Step 6 has AUQ with "Plan phase → /vp-evolve" option that invokes skill
- [ ] Text fallback for Cursor/Codex/Antigravity adapters
- [ ] Both SKILL.md "Prompts using AUQ" tables updated with new Step entries
- [ ] ≥4 contract tests pass
- [ ] package.json = "2.22.0"

---

### Phase 86: CLI TARGETS Fix (BUG-015) ✅ complete
**Goal**: Add `copilot` to the hardcoded `TARGETS` array and help text in `bin/viepilot.cjs` so `--list-targets` and `install --target copilot` work correctly.
**Estimated Tasks**: 2
**Dependencies**: Phase 84 ✅ (copilot adapter exists in lib/adapters/)
**Directory**: `.viepilot/phases/86-bug015-copilot-cli-targets/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 86.1 | Fix `bin/viepilot.cjs` TARGETS + printHelp() | `--list-targets` shows copilot; `--target copilot --dry-run` passes | S |
| 86.2 | Contract test + CHANGELOG + version 2.22.1 | ≥5 tests pass; [2.22.1] in CHANGELOG; package.json = "2.22.1" | S |

**Verification**:
- [ ] `node bin/viepilot.cjs --list-targets` includes `copilot`
- [ ] `node bin/viepilot.cjs install --target copilot --dry-run --yes` runs cleanly
- [ ] `npm test` all pass

---

### Phase 87: AUQ ToolSearch Preload (ENH-059) ✅ complete
**Goal**: Add `ToolSearch` preload instructions to all 5 AUQ-using SKILL.md files and 3 workflow files, so `AskUserQuestion` schema is always loaded before the first interactive prompt on Claude Code adapter — eliminating deferred-tool fallback to text menus.
**Estimated Tasks**: 3
**Dependencies**: ENH-048 ✅, ENH-055 ✅
**Directory**: `.viepilot/phases/87-enh059-auq-preload/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 87.1 | Add AUQ preload block to 5 SKILL.md files | `grep -l "select:AskUserQuestion" skills/*/SKILL.md \| wc -l` = 5 | S |
| 87.2 | Add AUQ preload step to 3 workflow files | `grep -l "select:AskUserQuestion" workflows/*.md \| wc -l` ≥ 3 | S |
| 87.3 | Contract tests + CHANGELOG + version 2.23.0 | ≥8 tests pass; [2.23.0] in CHANGELOG; package.json = "2.23.0" | S |

**Verification**:
- [ ] All 5 SKILL.md files contain `select:AskUserQuestion`
- [ ] All 3 workflow files contain `select:AskUserQuestion`
- [ ] `npm test` all pass

---

---

### Phase 88: vp-brainstorm UI Direction Proactive Suggestion (ENH-060) ✅ complete
**Goal**: Bring UI Direction Mode suggestion parity with Architect Design Mode — early-session detection, lower thresholds (≥1 accumulate / ≥2 surface), and a proactive 🎨 activation banner.
**Estimated Tasks**: 3
**Dependencies**: FEAT-002 ✅, FEAT-011 ✅
**Directory**: `.viepilot/phases/88-enh060-brainstorm-ui-direction-proactive/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 88.1 | Update `workflows/brainstorm.md` — threshold + proactive banner | `grep -c "🎨" workflows/brainstorm.md` ≥1; early-session block present | M |
| 88.2 | Update `skills/vp-brainstorm/SKILL.md` — docs parity | auto-suggestion documented; 🎨 present | S |
| 88.3 | Contract tests + CHANGELOG + version 2.24.0 | ≥6 tests pass; [2.24.0] in CHANGELOG; package.json = "2.24.0" | S |

**Verification**:
- [ ] `grep -c "🎨" workflows/brainstorm.md` ≥ 1
- [ ] `grep -c "Early-session detection" workflows/brainstorm.md` ≥ 1
- [ ] `grep -c "≥2 unique signals" workflows/brainstorm.md` ≥ 1
- [ ] `npm test` all pass

---

---

### Phase 89: vp-brainstorm Idea-to-Architecture Breakdown Loop (ENH-061) ✅ complete
**Goal**: Add structured breakdown loop — Feature→Coverage mapping, Architect→UI reverse sync, pre-save completeness gate, and recommended 8-step ordering — so ideas are fully mapped to both architect and UI Direction artifacts.
**Estimated Tasks**: 5
**Dependencies**: ENH-034 ✅, FEAT-011 ✅, FEAT-002 ✅, ENH-060 ✅
**Directory**: `.viepilot/phases/89-enh061-brainstorm-breakdown-loop/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 89.1 | Recommended breakdown ordering + Feature→Coverage mapping | `grep -c "Coverage Mapping" workflows/brainstorm.md` ≥1 | M |
| 89.2 | `arch_to_ui_sync` reverse sync + `/sync-ui` command | `grep -c "arch_to_ui_sync" workflows/brainstorm.md` ≥2 | M |
| 89.3 | Expand pre-save CHECK 3 completeness gate | `grep -c "CHECK 3" workflows/brainstorm.md` ≥1 | S |
| 89.4 | Update `skills/vp-brainstorm/SKILL.md` — breakdown loop docs | ENH-061 + arch_to_ui_sync in SKILL.md | S |
| 89.5 | Contract tests + CHANGELOG + version 2.25.0 | ≥9 tests pass; [2.25.0] in CHANGELOG | S |

**Verification**:
- [ ] `grep -c "Recommended Breakdown Ordering" workflows/brainstorm.md` ≥ 1
- [ ] `grep -c "arch_to_ui_sync" workflows/brainstorm.md` ≥ 2
- [ ] `grep -c "CHECK 3" workflows/brainstorm.md` ≥ 1
- [ ] `npm test` all pass

---

---

### Phase 90: Skill Registry Foundation (FEAT-020 Phase 1) ✅ complete
**Goal**: Implement `vp-tools scan-skills` + `~/.viepilot/skill-registry.json` schema + extended SKILL.md format spec (Capabilities/Tags/Best Practices) + ≥15 contract tests.
**Estimated Tasks**: 4
**Dependencies**: FEAT-014 ✅, FEAT-015 ✅ (all adapters registered in `lib/adapters/index.cjs`)
**Directory**: `.viepilot/phases/90-feat020-skill-registry/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 90.1 | `lib/skill-registry.cjs` — scanner + registry builder | `scanSkills()` + `loadRegistry()` exported; registry JSON written; legacy compat | M |
| 90.2 | `bin/viepilot.cjs` — `scan-skills` + `list-skills` subcommands | Both in --help; scan outputs summary; list reads registry | S |
| 90.3 | `docs/user/features/skill-registry.md` — format spec + scanner docs | Extended SKILL.md format documented; scanner paths; registry schema | S |
| 90.4 | Contract tests + CHANGELOG [2.26.0] + version bump | ≥15 tests pass; [2.26.0] in CHANGELOG; package.json = "2.26.0" | S |

**Verification**:
- [ ] `vp-tools scan-skills` runs without error; writes `~/.viepilot/skill-registry.json`
- [ ] `vp-tools list-skills` displays table from registry
- [ ] Legacy SKILL.md (no extended sections) indexed without error
- [ ] `npm test` all pass

---

---

### Phase 91: Third-party Skill Installation (FEAT-020 Phase 2) ✅
**Goal**: `vp-tools install-skill` (npm + GitHub + local) + `uninstall-skill` + `update-skill` + auto-scan post-install.
**Estimated Tasks**: 3
**Status**: ✅ Complete → v2.27.0
**Dependencies**: Phase 90 ✅ (`lib/skill-registry.cjs`)
**Directory**: `.viepilot/phases/91-feat020-skill-installer/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 91.1 | `lib/skill-installer.cjs` — multi-channel installer | npm/github/local channels; skill-meta.json; auto-scanSkills | M |
| 91.2 | `bin/viepilot.cjs` — install-skill + uninstall-skill + update-skill | 3 commands in --help; correct lib calls | S |
| 91.3 | Tests (≥12) + CHANGELOG [2.27.0] + version bump | All tests pass; package.json = "2.27.0" | S |

**Verification**:
- [ ] `vp-tools install-skill ./test-skill` copies SKILL.md to all active adapter dirs
- [ ] `vp-tools uninstall-skill test-skill` removes dirs + re-scans
- [ ] `npm test` all pass

---

### Phase 92: Brainstorm UI-Direction Skill Integration (FEAT-020 Phase 3) ✅
**Goal**: Brainstorm silently loads registry, matches skills by capabilities to UI signals, applies best practices to HTML, records `## skills_used` in notes.md.
**Estimated Tasks**: 3
**Status**: ✅ Complete → v2.28.0
**Dependencies**: Phase 91 ✅, Phase 90 ✅
**Directory**: `.viepilot/phases/92-feat020-brainstorm-skill-integration/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 92.1 | `workflows/brainstorm.md` — Skill Registry Integration section | Load→match→silent apply→skills_used pattern; no prompt | M |
| 92.2 | `skills/vp-brainstorm/SKILL.md` — FEAT-020 docs | Integration section present; crystallize lock reference | S |
| 92.3 | Tests (≥10) + CHANGELOG [2.28.0] + version bump | All tests pass; package.json = "2.28.0" | S |

**Verification**:
- [ ] `grep -c "Skill Registry Integration" workflows/brainstorm.md` ≥ 1
- [ ] `grep -c "skills_used" workflows/brainstorm.md` ≥ 2
- [ ] `npm test` all pass

---

### Phase 93: Crystallize Skill Decision Gate (FEAT-020 Phase 4) ✅
**Goal**: New Step 1E in crystallize: read `## skills_used` → AUQ confirm → write `## Skills` to `PROJECT-CONTEXT.md`.
**Estimated Tasks**: 4
**Status**: ✅ Complete → v2.29.0
**Dependencies**: Phase 92 ✅, ENH-048 ✅, ENH-059 ✅
**Directory**: `.viepilot/phases/93-feat020-crystallize-skill-gate/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 93.1 | `workflows/crystallize.md` — Step 1E skill gate | Gate step present; skip-condition; AUQ spec; lock semantics | M |
| 93.2 | `templates/project/PROJECT-CONTEXT.md` — `## Skills` section | Table format present; comment instruction | S |
| 93.3 | `skills/vp-crystallize/SKILL.md` — FEAT-020 gate docs | Step 1E documented; cross-refs | S |
| 93.4 | Tests (≥10) + CHANGELOG [2.29.0] + version bump | All tests pass; package.json = "2.29.0" | S |

**Verification**:
- [ ] `grep -c "Step 1E" workflows/crystallize.md` ≥ 1
- [ ] `grep -c "## Skills" templates/project/PROJECT-CONTEXT.md` ≥ 1
- [ ] `npm test` all pass

---

### Phase 94: vp-auto Silent Skill Execution (FEAT-020 Phase 5) ✅
**Goal**: vp-auto reads `PROJECT-CONTEXT.md ## Skills` at init, injects skill best practices per task — silently, no re-asking. FEAT-020 fully complete.
**Estimated Tasks**: 3
**Status**: ✅ Complete → v2.30.0 — **FEAT-020 fully complete (Phases 90–94)**
**Dependencies**: Phase 93 ✅, Phase 90 ✅ (`loadRegistry()`)
**Directory**: `.viepilot/phases/94-feat020-auto-skill-execution/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 94.1 | `workflows/autonomous.md` — Skill Context Load + per-task injection | SKILL_CONTEXT_MAP; absent→no-op; never prompt; skills_applied | M |
| 94.2 | `skills/vp-auto/SKILL.md` — FEAT-020 execution docs | Silent inject; no-prompt; cross-refs | S |
| 94.3 | Tests (≥8) + CHANGELOG [2.30.0] + version bump | All tests pass; package.json = "2.30.0"; FEAT-020 marked done in TRACKER | S |

**Verification**:
- [ ] `grep -c "Skill Context Load" workflows/autonomous.md` ≥ 1
- [ ] `grep -c "skills_applied" workflows/autonomous.md` ≥ 1
- [ ] `npm test` all pass

---

### Phase 95: `/vp-skills` Slash Command + BUG-016 + BUG-017 Fix (ENH-062) ✅ complete
**Goal**: New `skills/vp-skills/SKILL.md` agent slash command + `get-registry` CLI + fix non-executable `loadRegistry()` in workflows (BUG-016) + fix missing AUQ in vp-evolve/vp-request SKILL.md `<process>` body (BUG-017).
**Estimated Tasks**: 5
**Status**: ✅ Complete → v2.31.0
**Dependencies**: FEAT-020 ✅, ENH-058 ✅, ENH-059 ✅, BUG-016, BUG-017, ENH-062
**Directory**: `.viepilot/phases/95-enh062-vp-skills-slash-command/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 95.1 | `skills/vp-skills/SKILL.md` — new slash command skill | 6 commands; installed path; cross-project | M |
| 95.2 | `bin/vp-tools.cjs` — `get-registry [--id <id>]` subcommand | JSON output; null fallback; --help | S |
| 95.3 | Fix `workflows/autonomous.md` + `workflows/brainstorm.md` (BUG-016) | No `Call loadRegistry()`; uses get-registry shell cmd | S |
| 95.4 | Fix `skills/vp-evolve/SKILL.md` + `skills/vp-request/SKILL.md` (BUG-017) | Step 5/6 has AUQ call in `<process>` body | S |
| 95.5 | Tests (≥15) + CHANGELOG [2.31.0] + version bump | All tests pass; package.json = "2.31.0" | S |

**Verification**:
- [ ] `ls skills/vp-skills/SKILL.md` exists
- [ ] `node bin/vp-tools.cjs get-registry 2>/dev/null` outputs JSON or null
- [ ] `grep -c "loadRegistry()" workflows/autonomous.md` = 0
- [ ] `grep -c "loadRegistry()" workflows/brainstorm.md` = 0
- [ ] `grep -c "AskUserQuestion" skills/vp-evolve/SKILL.md` ≥ 2
- [ ] `grep -c "AskUserQuestion" skills/vp-request/SKILL.md` ≥ 2
- [ ] `npm test` all pass

---

### Phase 96: Brainstorm Governance & Workspace Improvements (BUG-018 + ENH-063 + ENH-064)
**Goal**: (1) BUG-018: unified workspace mode-selection AUQ after scope lock — user chooses Architect/UI Direction/Both/Neither upfront; (2) ENH-063: Admin & Governance Topic 6 + proactive heuristic + admin coverage gate + admin.html + crystallize export; (3) ENH-064: cross-workspace HUB links + crystallize mandatory read gates (no silent skip).
**Estimated Tasks**: 5
**Status**: ✅ Complete → v2.32.0
**Dependencies**: ENH-061 ✅, ENH-060 ✅, FEAT-011 ✅, ENH-029 ✅, ENH-048 ✅, BUG-018, ENH-063, ENH-064
**Directory**: `.viepilot/phases/96-bug018-enh063-enh064-brainstorm-governance/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 96.1 | BUG-018: unified workspace mode-selection AUQ (brainstorm.md + vp-brainstorm SKILL) | Step 2B AUQ; Architect heuristic suppressed after selection | M |
| 96.2 | ENH-063 brainstorm side: Topic 6 + proactive heuristic + admin.html + YAML schema | Topic 6 in template; 🔐 banner; admin.html architect page | M |
| 96.3 | ENH-063 crystallize side: admin export + template section | crystallize Step 1D admin export; PROJECT-CONTEXT.md template | S |
| 96.4 | ENH-064: HUB cross-links + crystallize mandatory read gates | MANDATORY READ GATE in Step 1A + 1D; Step 1F cross-ref gate | L |
| 96.5 | Tests (≥15) + CHANGELOG [2.32.0] + version bump | All tests pass; package.json = "2.32.0" | S |

**Verification**:
- [ ] `grep -c "Workspace Mode Selection" workflows/brainstorm.md` ≥1
- [ ] `grep -c "Admin & Governance" workflows/brainstorm.md` ≥2
- [ ] `grep -c "admin.html" workflows/brainstorm.md` ≥1
- [ ] `grep -c "MANDATORY READ GATE" workflows/crystallize.md` ≥2
- [ ] `grep -c "architect_read_complete" workflows/crystallize.md` ≥2
- [ ] `grep -c "## Admin & Governance" templates/project/PROJECT-CONTEXT.md` ≥1
- [ ] `npm test` all pass

---

### Phase 97: Brainstorm Topic 7 — Content Management Coverage (ENH-065)
**Goal**: Add "Content Management" as Topic 7 to brainstorm Topics Template — covering content types, lifecycle, media, taxonomy, localization, search, versioning, SEO. Proactive 🗂️ heuristic, content coverage gate, `content.html` Architect page, `notes.md ## content` YAML schema, crystallize export to PROJECT-CONTEXT.md.
**Estimated Tasks**: 3
**Status**: ✅ Complete → v2.33.0
**Dependencies**: ENH-063 ✅, ENH-065
**Directory**: `.viepilot/phases/97-enh065-content-management/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 97.1 | ENH-065 brainstorm side: Topic 7 + proactive heuristic + content.html + YAML schema | Topic 7 in template; 🗂️ banner; content.html architect page | M |
| 97.2 | ENH-065 crystallize side: content export + template section | crystallize Step 1D content export; PROJECT-CONTEXT.md template | S |
| 97.3 | Tests (≥10) + CHANGELOG [2.33.0] + version bump | All tests pass; package.json = "2.33.0" | S |

**Verification**:
- [ ] `grep -c "Content Management" workflows/brainstorm.md` ≥2
- [ ] `grep -c "content.html" workflows/brainstorm.md` ≥1
- [ ] `grep -c "Content Management" workflows/crystallize.md` ≥1
- [ ] `grep -c "## Content Management" templates/project/PROJECT-CONTEXT.md` ≥1
- [ ] `npm test` all pass

---

## Notes
- Created: 2026-03-30
---

### Phase 98: Brainstorm Topic 8 — User Data Management Coverage (ENH-066)
**Goal**: Add "User Data Management" as Topic 8 to brainstorm Topics Template — covering end-user controls over their own data: profile/account settings, notification preferences, privacy rights (GDPR export/erasure), activity history, connected OAuth accounts, session/device management, 2FA, consent management. Proactive 👤 heuristic, user data coverage gate, `user-data.html` Architect page, crystallize export. Phase assignment renumbered to Topic 9.
**Estimated Tasks**: 3
**Status**: 🔲 Planned → v2.34.0
**Dependencies**: ENH-063 ✅, ENH-065 ✅, ENH-066
**Directory**: `.viepilot/phases/98-enh066-user-data-management/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 98.1 | ENH-066 brainstorm side: Topic 8 + proactive heuristic + user-data.html + YAML schema | Topic 8 in template; 👤 banner; user-data.html architect page | M |
| 98.2 | ENH-066 crystallize side: user_data export + template section | crystallize Step 1D user_data export; PROJECT-CONTEXT.md template | S |
| 98.3 | Tests (≥10) + CHANGELOG [2.34.0] + version bump | All tests pass; package.json = "2.34.0" | S |

**Verification**:
- [ ] `grep -c "User Data Management" workflows/brainstorm.md` ≥2
- [ ] `grep -c "user-data.html" workflows/brainstorm.md` ≥1
- [ ] `grep -c "User Data Management" workflows/crystallize.md` ≥1
- [ ] `grep -c "## User Data Management" templates/project/PROJECT-CONTEXT.md` ≥1
- [ ] `npm test` all pass

---

### Phase 99: Workflow Upgrade Awareness (ENH-067)
**Goal**: When ViePilot is updated, existing sessions and crystallize artifacts silently miss new topic coverage. Add two mechanisms: (A) `vp-brainstorm` gap detection — on `--continue`, detect missing topics vs. current Topics Template, show upgrade banner, run inline Q&A, append `## Upgrade supplement`; (B) `vp-crystallize --upgrade` re-scan — detect `crystallize_version` delta, list missing artifact sections, offer Patch (non-destructive append) or Full re-generate (backup + overwrite); (C) version stamps — `workflow_version` in session headers, `crystallize_version` in PROJECT-CONTEXT.md.
**Estimated Tasks**: 4
**Status**: 🔲 Planned → v2.35.0
**Dependencies**: ENH-063 ✅, ENH-065 ✅, ENH-066 ✅, Phase 98 ✅
**Directory**: `.viepilot/phases/99-enh067-workflow-upgrade-awareness/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 99.1 | Part C — version stamps: session `workflow_version` + artifact `crystallize_version` + SKILL.md docs | stamps documented in both workflows + SKILL.md ENH-067 reference | S |
| 99.2 | Part A — brainstorm gap detection: Step 1B, upgrade banner (AUQ), `## Upgrade supplement` format, idempotency stamp | Step 1B section; AUQ spec; supplement format; SKILL.md bullet | M |
| 99.3 | Part B — crystallize --upgrade re-scan: Step 0-B, delta computation, Patch/Re-generate menu, backup logic | Step 0-B section; AUQ spec; patch + regen behavior; SKILL.md bullet | M |
| 99.4 | Tests (≥10) + CHANGELOG [2.35.0] + version bump | All tests pass; package.json = "2.35.0" | S |

**Verification**:
- [ ] `grep -c "workflow_version" workflows/brainstorm.md` ≥1
- [ ] `grep -c "Upgrade supplement" workflows/brainstorm.md` ≥1
- [ ] `grep -c "crystallize_version" workflows/crystallize.md` ≥1
- [ ] `grep -c "\-\-upgrade" workflows/crystallize.md` ≥1
- [ ] `npm test` all pass

---

---

### Phase 100: Brainstorm Topic 7 — Admin Entity Data Management (ENH-068)
**Goal**: Add "Admin Entity Management" as Topic 7 in the brainstorm Topics Template — covering CRUD interfaces for all business domain entities in the DB (products, orders, categories, tenants, etc.): list views with filter/sort/pagination/bulk ops, create/edit forms, delete semantics (soft vs. hard), import/export CSV, audit trail per entity, multi-tenant scoping, read-only vs. editable entities. Proactive 🗄️ heuristic, coverage gate (cross-references ERD), `entity-mgmt.html` Architect page, `## entity_mgmt` YAML schema, crystallize export. Renumbers Content Management → 8, User Data → 9, Phase assignment → 10.
**Estimated Tasks**: 3
**Status**: 🔲 Planned → v2.36.0
**Dependencies**: ENH-063 ✅, ENH-027 ✅, ENH-065 ✅, ENH-066 ✅, Phase 99 ✅
**Directory**: `.viepilot/phases/100-enh068-admin-entity-management/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 100.1 | ENH-068 brainstorm side: Topic 7 + 🗄️ heuristic + entity-mgmt.html + YAML + renumber | Topic 7; heuristic; ERD coverage gate; entity-mgmt.html; YAML schema | M |
| 100.2 | ENH-068 crystallize side: entity_mgmt export + MANDATORY READ GATE + template | Step 1D item 10; item 15 in read gate; PROJECT-CONTEXT.md template | S |
| 100.3 | Tests (≥10) + ENH-031 exemption + CHANGELOG [2.36.0] + version bump | All tests pass; package.json = "2.36.0" | S |

**Verification**:
- [ ] `grep -c "Admin Entity Management" workflows/brainstorm.md` ≥2
- [ ] `grep -c "entity-mgmt.html" workflows/brainstorm.md` ≥1
- [ ] `grep -c "Admin Entity Management" workflows/crystallize.md` ≥1
- [ ] `grep -c "## Admin Entity Management" templates/project/PROJECT-CONTEXT.md` ≥1
- [ ] `grep "10\. \*\*Phase assignment" workflows/brainstorm.md` shows Topic 10
- [ ] `npm test` all pass

---

---

### Phase 101: BUG-019 — `vp-tools scan-skills` CLI Not Implemented
**Goal**: Add the missing `scan-skills` subcommand to `bin/vp-tools.cjs`. The underlying `scanSkills()` function already exists in `lib/skill-registry.cjs` (shipped in FEAT-020 Phase 1, v2.26.0). Only the CLI routing, help text, and usage summary line are missing. Fix makes `vp-tools scan-skills` scan installed skills and write `~/.viepilot/skill-registry.json`.
**Estimated Tasks**: 2
**Status**: ✅ Complete → v2.36.1
**Dependencies**: FEAT-020 ✅, Phase 100 ✅
**Directory**: `.viepilot/phases/101-bug019-scan-skills-cli/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 101.1 | Add `scan-skills` handler + help entry + usage line to bin/vp-tools.cjs | `vp-tools scan-skills` exits 0; help lists it; hint includes it | S |
| 101.2 | Verify SKILL.md refs + tests (≥8) + CHANGELOG [2.36.1] + version bump | All tests pass; package.json = "2.36.1" | S |

**Verification**:
- [ ] `node bin/vp-tools.cjs scan-skills` → "✔ Scanned N skill(s) → ~/.viepilot/skill-registry.json"
- [ ] `node bin/vp-tools.cjs help scan-skills` → shows usage
- [ ] `node bin/vp-tools.cjs help` → lists `scan-skills`
- [ ] `npm test` all pass

---

## Notes
- Created: 2026-03-30
- Last Updated: 2026-04-22 (Phase 102 planned: BUG-020 scaffold-first gate → v2.37.0)

---

### Phase 102: BUG-020 — Scaffold-First Gate for Framework Projects
**Goal**: Prevent `vp-auto` from handcrafting framework-generated files. Add a scaffold-first enforcement gate to `workflows/autonomous.md`: when a task is detected as a "project setup/init" for a known framework stack (Laravel, Next.js, NestJS, Rails, Django, Spring Boot, etc.), vp-auto MUST run the canonical scaffold command (e.g. `composer create-project laravel/laravel`) before creating any files. Built-in heuristic table + optional `init_command:` field in stack SUMMARY.md. Never-handcraft block list for framework-native files (artisan, manage.py, next.config.*, nest-cli.json, pom.xml, etc.).
**Estimated Tasks**: 3
**Status**: ✅ Complete → v2.37.0
**Dependencies**: FEAT-020 ✅, Phase 101 ✅
**Directory**: `.viepilot/phases/102-bug020-scaffold-first-gate/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 102.1 | Add scaffold-first gate section to workflows/autonomous.md | Gate section present; heuristic table; block list; SUMMARY.md field reference | M |
| 102.2 | Convention doc (docs/user/features/scaffold-first.md) + 7 stack SUMMARY.md updates | Doc created; 7 stacks have `## Scaffold` + init_command + marker_file | S |
| 102.3 | Tests (≥18) + CHANGELOG [2.37.0] + version bump | All tests pass; package.json = "2.37.0" | S |

**Verification**:
- [ ] `grep -c "Scaffold-First Gate" workflows/autonomous.md` ≥1
- [ ] `grep -c "composer create-project" workflows/autonomous.md` ≥1
- [ ] `grep -c "init_command:" workflows/autonomous.md` ≥1
- [ ] `ls docs/user/features/scaffold-first.md` exists
- [ ] `npm test` all pass
- Estimated completion: M1.x iterative releases (see TRACKER)

---

---

### Phase 103: ENH-069 — Crystallize UI→Task Binding (10-Gap Fix)
**Goal**: Close the 10-gap chain where `crystallize` reads UI Direction artifacts but never binds them to implementation tasks, causing prototype pages to remain stubs after all phases complete. Fixes span crystallize Step 1A (UI Pages→Component Map, UX walkthrough P0/P1 processing, Background ideas gate), Step 1D (arch_to_ui_sync noted items, feature-map discrepancy resolution, design staleness check), Step 1F (coverage gaps blocking), Step 7 (ROADMAP cross-check), and autonomous.md (UI Prototype Reference field + UI Coverage Gate at phase completion).
**Estimated Tasks**: 5
**Status**: ✅ Complete → v2.38.0
**Dependencies**: ENH-064 ✅, BUG-020 ✅, Phase 102 ✅
**Directory**: `.viepilot/phases/103-enh069-ui-task-binding/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 103.1 | crystallize Step 1A: emit UI Pages→Component Map + UX walkthrough P0/P1→tasks + Background ideas gate | Component map built; P0/P1 pain items generate UX-fix tasks; background ideas gate blocks Step 7 | L |
| 103.2 | crystallize Step 1D: arch_to_ui_sync noted→map + feature-map explicit resolution + design staleness warning | arch_to_ui_sync noted items added to map; discrepancies require resolution; staleness warning emitted | M |
| 103.3 | crystallize Step 1F blocking gate + Step 7 ROADMAP cross-check | coverage gaps blocking for scoped features; Step 7 auto-adds missing component tasks | M |
| 103.4 | autonomous.md + TASK.md: UI Prototype Reference field + phase UI Coverage Gate | TASK.md has field; autonomous populates it; phase PASS gated on non-stub UI coverage | M |
| 103.5 | Tests (≥20) + CHANGELOG [2.38.0] + version bump | All tests pass; package.json = "2.38.0" | S |

**Verification**:
- [ ] `grep -c "UI Pages → Component Map" workflows/crystallize.md` ≥ 3
- [ ] `grep -c "Design Staleness" workflows/crystallize.md` ≥ 2
- [ ] `grep -c "UI Coverage Gate" workflows/autonomous.md` ≥ 2
- [ ] `grep -c "UI Prototype Reference" templates/phase/TASK.md` ≥ 1
- [ ] `npm test` all pass

---

---

### Phase 104: ENH-070 — vp-audit Auto-Log Gaps → Direct vp-evolve Routing
**Goal**: Eliminate the manual `/vp-request` step after audit. When `vp-audit` detects gaps (Tier 1–4), it auto-logs each finding as a `.viepilot/requests/` file with duplicate detection, updates TRACKER.md, and offers a direct `/vp-evolve` route via a post-audit routing banner + AUQ prompt. `--no-autolog` flag for report-only mode.
**Estimated Tasks**: 3
**Status**: ✅ Complete → v2.39.0
**Dependencies**: ENH-069 ✅, Phase 103 ✅
**Directory**: `.viepilot/phases/104-enh070-audit-autolog/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 104.1 | audit.md: Auto-Log Gate (Tier 1–4) + duplicate detection + TRACKER update | Gate present; auto-creates requests; dedup logic; TRACKER updated | M |
| 104.2 | audit.md: Post-audit routing banner + AUQ + `--no-autolog` flag; SKILL.md docs | Banner shows IDs + /vp-evolve; flag skips gate; SKILL.md documents feature | S |
| 104.3 | Tests (≥12) + CHANGELOG [2.39.0] + version bump | All tests pass; package.json = "2.39.0" | S |

**Verification**:
- [ ] `grep -c "Auto-Log Gate" workflows/audit.md` ≥ 1
- [ ] `grep -c "auto-logged by vp-audit" workflows/audit.md` ≥ 1
- [ ] `grep -c "no-autolog" workflows/audit.md` ≥ 2
- [ ] `grep -c "vp-evolve" workflows/audit.md` ≥ 2
- [ ] `grep -c "Auto-Log Behavior" skills/vp-audit/SKILL.md` ≥ 1
- [ ] `npm test` all pass

---

### Phase 105: BUG-021 — Antigravity Adapter Path Update (.antigravity → .gemini/antigravity)
**Goal**: Fix Antigravity adapter to install skills to `~/.gemini/antigravity/skills/` (new discovery path after Google Gemini ecosystem rebrand). Add backward-compat `isAvailable` fallback for old `.antigravity/` installs.
**Estimated Tasks**: 3
**Status**: planned → v2.39.1
**Dependencies**: Phase 104 ✅
**Directory**: `.viepilot/phases/105-bug021-antigravity-path/`

| Task | Description | Acceptance Criteria | Complexity |
|------|-------------|---------------------|------------|
| 105.1 | `lib/adapters/antigravity.cjs` — update skillsDir, viepilotDir, executionContextBase, isAvailable | All 4 fields use `.gemini/antigravity/`; isAvailable fallback checks `.antigravity/` too | S |
| 105.2 | `bin/viepilot.cjs` uninstall help + `docs/user/features/adapters.md` + `docs/user/features/skill-registry.md` | All user-visible `.antigravity` paths updated | S |
| 105.3 | `tests/unit/vp-adapter-antigravity.test.js` updates + CHANGELOG [2.39.1] + version bump | All tests pass; package.json = "2.39.1" | S |

**Verification**:
- [ ] `skillsDir('/fake/home')` contains `.gemini/antigravity/skills`
- [ ] `viepilotDir('/fake/home')` contains `.gemini/antigravity/viepilot`
- [ ] `executionContextBase === '.gemini/antigravity/viepilot'`
- [ ] `isAvailable` true for `.gemini/antigravity/` AND `.antigravity/` dirs
- [ ] `npm test` all pass
- [ ] `package.json` version = `2.39.1`
