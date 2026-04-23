# Phase 18 Specification — npm publish distribution (FEAT-004)

## Metadata
- **Phase**: 18
- **Milestone**: M1.15
- **Request**: FEAT-004
- **Priority**: high
- **Status**: planned

## Objective
Ship ViePilot to npmjs with a safe, repeatable release flow so users can run `npx viepilot install` directly from npm registry.

## Scope
1. Finalize package metadata and published file set for npm distribution.
2. Add release/publish scripts and prepublish checks.
3. Add secure publish workflow (token-based, no secret leakage).
4. Add smoke verification plan for `npx viepilot install` post-publish.
5. Document maintainer publish guide and rollback strategy.

## Out of Scope
- Multi-registry publishing (npm + GitHub Packages) in same phase.
- Full semantic-release migration.

## Success Criteria
- [ ] `npm publish` (or release workflow) can publish package successfully.
- [ ] `npx viepilot install --help` works from npm-published package.
- [ ] Publish process has clear security controls for token usage.
- [ ] Maintainer docs include release checklist and verify steps.
- [ ] Rollback guidance exists for bad publish scenarios.
