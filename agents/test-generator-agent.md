# test-generator-agent

## Purpose
Generate contract test files for a given phase/feature, run the test suite, and report
pass/fail counts. Replaces the "write tests manually at the end of every phase" pattern
with a structured agent that receives acceptance criteria and produces verifiable tests.
Invoked as the last task in each phase (the `N.last` contract-test task pattern).

## Inputs
- `phase`: phase number (e.g. `83`)
- `feature_id`: request ID being tested (e.g. `"ENH-057"`)
- `test_file`: output path for the test file (e.g. `"tests/unit/vp-agents-system.test.js"`)
- `acceptance_criteria`: list of strings to test (from the phase SPEC.md)
- `framework` (optional): test framework (default: `"jest"`)
- `min_tests` (optional): minimum test count to enforce (default: `6`)

## Outputs
- Generated test file at `test_file` path
- Test run results: N passing, N failing
- PASS if `passing ≥ min_tests AND failing === 0`; FAIL otherwise
- List of uncovered acceptance criteria (if any)

## Invocation Pattern

### Claude Code (terminal)
```
Agent({
  subagent_type: "general-purpose",
  description: "Generate + run tests for {feature_id} (Phase {phase})",
  prompt: `
    You are test-generator-agent. Generate contract tests for:
    - Feature: {feature_id}
    - Test file: {test_file}
    - Acceptance criteria to test:
      {acceptance_criteria}

    Generate Jest tests covering each criterion. Use fs.existsSync for file checks,
    string matching for content checks. Run npm test and report pass/fail count.
    Minimum passing tests: {min_tests}.
  `
})
```

### Cursor / Codex / Antigravity
Write test file inline, then run `npm test` (or equivalent) and report results.

## Adapter Behavior
| Adapter | Behavior |
|---------|----------|
| Claude Code | Spawns general-purpose subagent with write + bash access |
| Cursor | Inline test writing + shell execution |
| Codex | Inline test writing + shell execution |
| Antigravity | Inline test writing; manual run instruction if shell unavailable |

## Notes
- Always run tests after generating — never report PASS without a green suite
- Test one criterion per `test()` block — granular failures are more useful than monolithic ones
- If a criterion is untestable automatically, add a `test.skip()` with a manual check note
- Existing tests must still pass — add `--passWithNoTests` safeguard if suite is empty
