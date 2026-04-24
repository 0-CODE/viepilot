# Task 108.4 — `skills/vp-persona/SKILL.md` + workflow injections (all 4 workflows + all vp-* skills)

## Objective
Create the `vp-persona` skill with SKILL.md. Inject persona-context reading into
`workflows/autonomous.md`, `workflows/crystallize.md`, `workflows/evolve.md`.
Add a `<persona_context>` injection note to all 18 existing `skills/vp-*/SKILL.md` files.
`workflows/brainstorm.md` already updated in 108.3.

## Paths
```
skills/vp-persona/SKILL.md           ← new skill
workflows/autonomous.md              ← extend: persona-context injection
workflows/crystallize.md             ← extend: output_style adaptation
workflows/evolve.md                  ← extend: phase_template suggestion
skills/vp-auto/SKILL.md              ← extend: <persona_context> block
skills/vp-brainstorm/SKILL.md        ← extend: <persona_context> block
skills/vp-crystallize/SKILL.md       ← extend: <persona_context> block
skills/vp-evolve/SKILL.md            ← extend: <persona_context> block
skills/vp-request/SKILL.md           ← extend: <persona_context> block
skills/vp-docs/SKILL.md              ← extend: <persona_context> block
skills/vp-status/SKILL.md            ← extend: <persona_context> block
skills/vp-audit/SKILL.md             ← extend: <persona_context> block
skills/vp-scan/SKILL.md              ← extend: <persona_context> block
skills/vp-clean/SKILL.md             ← extend: <persona_context> block
skills/vp-debug/SKILL.md             ← extend: <persona_context> block
skills/vp-test/SKILL.md              ← extend: <persona_context> block
skills/vp-review/SKILL.md            ← extend: <persona_context> block
skills/vp-deploy/SKILL.md            ← extend: <persona_context> block
skills/vp-migrate/SKILL.md           ← extend: <persona_context> block
skills/vp-rollback/SKILL.md          ← extend: <persona_context> block
skills/vp-persona/SKILL.md           ← new (covered below)
```

## File-Level Plan

### `skills/vp-persona/SKILL.md`

Full skill definition with:
- `<greeting>` banner: `VIEPILOT ► VP-PERSONA  v1.0.0 (fw 2.42.0)`
- `<version_check>` block (same pattern as all other skills)
- `<objective>`: manage cross-project personas (show active, refine, list, bind, merge, export/import, reset)
- `<commands>`:
  - `/vp-persona` → show active persona + inferred fields + confidence
  - `/vp-persona --refine` → field-by-field AUQ correction of active persona
  - `/vp-persona --list` → list all saved personas
  - `/vp-persona --bind . <name>` → override auto-detection for current dir
  - `/vp-persona --merge <a> <b>` → manual hybrid persona creation
  - `/vp-persona --export` / `--import` → backup/share
  - `/vp-persona --reset` → clear all personas
- `<process>`: reads `persona context` via vp-tools; shows persona YAML; for `--refine` runs AUQ per field
- `<pending_review>`: on invocation, check `~/.viepilot/pending-review.md` for unread entries → show 1-line notice if non-empty

### `<persona_context>` block for all vp-* SKILL.md files

Insert after `</version_check>` in each file:
```xml
<persona_context>
## Persona Context Injection (ENH-073)
At skill start, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
Inject the output as `## User Persona` context before any task execution.
Silent if command unavailable or errors.
</persona_context>
```

Use a Node.js script to insert the block programmatically in all 18 existing skills (after `</version_check>`).

### `workflows/autonomous.md` — persona injection

Add section **"Persona Context (ENH-073)"** in the Initialize step (Step 1):
```markdown
### Persona Context (ENH-073)
After loading AI-GUIDE.md and TRACKER.md, run:
`node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context`
Inject output as `## User Persona` block into task context. Use persona.stacks for
stack preflight matching. Silent if unavailable.
```

### `workflows/crystallize.md` — output_style adaptation

Add to Step 1 (document generation) a conditional check:
```markdown
**output_style adaptation (ENH-073):**
- Read active persona via `vp-tools persona get`
- If `output_style: lean` → concise docs (summary sections, skip boilerplate headers)
- If `output_style: balanced` → standard docs
- If `output_style: enterprise` → full docs + compliance sections + decision rationale appendix
- Silent if persona unavailable → use `balanced` default
```

### `workflows/evolve.md` — phase_template suggestion

Add to Step 3A (Add Feature flow), after architecture compatibility check:
```markdown
**Phase template suggestion (ENH-073):**
Read `persona.phase_template` via `vp-tools persona context`. When suggesting phases,
offer domain pack phase ordering as default (e.g. for web-saas: Auth→Core→Monetize→Scale).
User can override freely. Silent if persona unavailable.
```

## Best Practices
- `<persona_context>` block inserted **after** `</version_check>` (before any objective/cursor_skill_adapter tags)
- Use same Node.js script pattern as task 107.3 for batch insertion across 18 SKILL.md files
- Workflow injections are additive sections — do not restructure existing workflow content
- `vp-tools persona auto-switch` is always called first (updates context-map, switches if needed)

## Verification
```bash
grep -l "persona_context" skills/vp-*/SKILL.md | wc -l
# → 18

grep -c "Persona Context (ENH-073)" workflows/autonomous.md
# → ≥ 1

grep -c "output_style adaptation" workflows/crystallize.md
# → ≥ 1

grep -c "phase_template suggestion" workflows/evolve.md  # or similar label
# → ≥ 1

test -f skills/vp-persona/SKILL.md && echo "exists"
# → exists
```
