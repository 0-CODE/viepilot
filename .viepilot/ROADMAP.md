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

**Total (to date)**: 83 tasks done (phases 33–49)

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

## Notes
- Created: 2026-03-30
- Last Updated: 2026-04-06 (Phase **47** BUG-009 shipped → v1.15.0)
- Estimated completion: M1.x iterative releases (see TRACKER)
