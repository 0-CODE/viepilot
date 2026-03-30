# ViePilot - Roadmap

## Milestone: M1 - Foundation Enhancement

### Overview
- **Version**: 0.2.0
- **Goal**: Hoàn thiện core framework và thêm tính năng nâng cao
- **Phases**: 4
- **Status**: Not Started

---

### Phase 1: CLI Enhancement
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

### Phase 2: Advanced Features
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

### Phase 3: Integration & Testing
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

### Phase 4: Documentation & Examples
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
| 1. CLI Enhancement | Not Started | 4 | 0 | 0% |
| 2. Advanced Features | Not Started | 5 | 0 | 0% |
| 3. Integration & Testing | Not Started | 4 | 0 | 0% |
| 4. Documentation & Examples | Not Started | 4 | 0 | 0% |

**Total**: 17 tasks, 0 completed, 0%

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
- Last Updated: 2026-03-30
- Estimated completion: M1 - 0.2.0 release
