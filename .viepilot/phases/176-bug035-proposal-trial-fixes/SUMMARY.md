# Phase 176 Summary — BUG-035: vp-proposal trial fixes + AskUserQuestion for every question (v3.22.2)

## Result
All 8 tasks done. Full suite: 3245 passed. Release commit: fc6056a.

## What changed
- G0 (d6132ad): parseListener baseline = first state; uncited drop held and counted once.
- G1: isEligible / requires_role keep outsiders out of internal rooms; #32 Product manager, #33 QA; role map fixes; manifest audienceProfile helpers.
- G2: session.currentVersion sync; byKind gates (session schema v2 + migration); -outline.json; missingArtifacts; seal + assertWritable; refreshProvenance.
- G3/G4: qa, tech-lead roles; adopt goal → team-intro; classifier skips code/tests, exact CHANGELOG, docs/user; findStaleFacts.
- G5: fixedSec / qaSec in planDuration + timeline; script header + Q&A fallback.
- G6: dev-note sense guards, per-line quotes, keep; localized backstage; checkConsistency; findPlaceholders.
- G7: no builds on sldNum/dt/ftr/hdr; builds vs [click] in validator; stripZipDirs; NODE_PATH.
- G8: AUQ rule in every SKILL.md (templates/auq-policy.md); proposal closing AUQ; Stop hook `hooks install --auq-check`.
- G9: review prompt duplication, per-section simulation label, install docs.

## Tests added
tests/unit/phase176-g1…g9 (9 files) + updated phase169-t4, phase171-t2.

## Not done / follow-ups
- Installed copy (~/.claude/viepilot) still 3.22.1 until reinstalled.
- Old trial proposal folder (docs/proposals/viepilot-team-intro) left untracked.
