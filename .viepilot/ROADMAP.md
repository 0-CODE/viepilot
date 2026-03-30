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
- Last Updated: 2026-03-31 (M1.11 / ENH-011)
- Estimated completion: M1 - 0.2.0 release
