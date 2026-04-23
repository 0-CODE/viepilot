# Phase 12 Specification - vp-audit Stack Compliance + Research Fallback

## Metadata
- **Phase**: 12
- **Milestone**: M1.9 - Stack-Aware Audit Intelligence
- **Request**: ENH-009
- **Priority**: high
- **Status**: planned

## Objective
Upgrade `vp-audit` to evaluate stack-specific best-practice compliance and code quality, with a research fallback path when stack guidance is missing or insufficient.

## Scope
1. Add stack-aware audit checks in `workflows/audit.md`.
2. Add web research fallback policy using `WebSearch` and `WebFetch` for uncached stacks.
3. Align output contract with `vp-auto` preflight stack lookup behavior.
4. Keep implementation token-efficient: summary-first, details on demand.

## Out of Scope
- Full implementation of all stack rules for every framework.
- Auto-remediation for all code quality findings in this phase.

## Tasks

### 12.1 Stack compliance audit layer
- Detect relevant stack(s) per project/task context.
- Evaluate code patterns against stack Do/Don't and anti-pattern heuristics.
- Report findings with severity and file/module references.

### 12.2 Research fallback pipeline
- Trigger fallback when cache missing or quality signal is weak.
- Prioritize official docs and credible sources.
- Synthesize outputs into structured sections:
  - Do / Don't
  - Common pitfalls
  - Recommended structure
  - Implementation checklist
  - Code quality heuristics

### 12.3 vp-auto alignment contract
- Define output format so `vp-auto` can consume checklist/guardrails.
- Keep compatibility with current preflight behavior in `skills/vp-auto/SKILL.md`.

## Acceptance Criteria
- [ ] Audit output has dedicated sections for stack best practices and code quality by stack.
- [ ] Missing-stack cases can trigger documented web research fallback.
- [ ] Audit artifacts can be reused by `vp-auto` preflight.
- [ ] Updated skill/workflow docs are consistent and backward compatible.

## Verification Plan
- Run `/vp-audit --report` on a repo with known stack cache.
- Run `/vp-audit --report` on a repo with intentionally missing stack cache to verify fallback path.
- Validate output format against `vp-auto` preflight requirements.

## Risks
- Overly broad stack detection may generate noisy findings.
- Non-official sources may reduce guidance quality if source filtering is weak.

## Mitigations
- Add source-priority policy (official > major maintainers > community references).
- Limit fallback scope to detected stacks only.
