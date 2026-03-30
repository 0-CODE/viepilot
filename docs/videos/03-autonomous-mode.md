# Video Script: Mastering Autonomous Mode

**Target duration**: 7 minutes  
**Audience**: Developers comfortable with ViePilot basics  
**Tool**: Cursor IDE with an existing ViePilot project

---

## 0:00 — Overview

> "Autonomous mode is ViePilot's superpower. In this video, we cover advanced
> techniques: control points, recovery, parallel tasks, and quality gates."

---

## 0:30 — Control Points

> "vp-auto pauses automatically when it needs your input."

Show: a blocker scenario — conflicting files detected

```
⚠ Phase 2 (Database): Issue Encountered
Conflicting migration files detected.

Options:
1. Fix and retry
2. Skip task
3. Rollback task
4. Stop autonomous mode
```

> "Enter '1' to auto-fix, '2' to skip, '3' to rollback, '4' to stop."

---

## 1:30 — Rollback

> "Made a mistake? Roll back to any checkpoint."

```
/vp-rollback
```

Show: list of available checkpoints (git tags)

```
1. vp-p2-t3      (Phase 2 Task 3 start)
2. vp-p2-t2-done (Phase 2 Task 2 complete)
3. vp-p2-t1-done (Phase 2 Task 1 complete)
```

> "Select a checkpoint to restore."

---

## 2:30 — Debug Mode

> "When something goes wrong and you need to track down why:"

```
/vp-debug investigate: API tests failing after database migration
```

Show: vp-debug creating a debug session, tracking hypothesis attempts

---

## 3:30 — Running Specific Phases

> "Skip ahead or repeat a specific phase:"

```
/vp-auto --phase 3
```

> "Or start from a specific phase:"

```
/vp-auto --from 2
```

---

## 4:00 — Fast Mode

> "Skip optional verifications for speed (not recommended for production):"

```
/vp-auto --fast
```

---

## 4:30 — Dry Run

> "Preview what would happen without executing:"

```
/vp-auto --dry-run
```

Show: plan displayed without any file changes

---

## 5:00 — Quality Gates

> "vp-auto enforces quality at every step. Here's what it checks:"

```
quality_gate:
  ✅ acceptance_criteria_met
  ✅ automated_tests_pass
  ✅ no_lint_errors
```

> "If any gate fails, you get a control point — not a silent failure."

---

## 5:30 — Monitoring with vp-status

> "Keep a second terminal open with status:"

```
/vp-status
```

Show: updating dashboard as phases complete

---

## 6:30 — Summary

> "Key takeaways: control points keep you in charge, rollback makes mistakes safe,
> and quality gates ensure every commit is clean. ViePilot's autonomy has guardrails."

Show: final project with all phases complete, `vp-p4-complete` tag in git log

---

## Recording Notes

- Use a project with a deliberate error in phase 2 to demonstrate control points
- Show the git log with checkpoint tags prominently
- Keep terminal font large for readability
