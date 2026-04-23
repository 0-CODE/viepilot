# Phase 88 SPEC — ENH-060: vp-brainstorm UI Direction Proactive Suggestion

## Goal
Bring UI Direction Mode suggestion parity with Architect Design Mode in `vp-brainstorm`. Currently, Architect Design proactively banners the user when heuristics fire (≥3 components / ≥1 stack mention). UI Direction runs silently until ≥5 signals or a manual `/save` command — users never get invited to use it.

## Changes

### `workflows/brainstorm.md`
1. **Lower accumulation threshold**: from "begin silent accumulation at ≥3 signals" → begin at **≥1 signal**
2. **Lower surface threshold**: from "show dialogue at ≥5 signals" → show at **≥2 unique signal keywords**
3. **Add early-session check**: if the user's *initial* brainstorm message contains ≥1 UI keyword, show the UI Direction suggestion banner **immediately** (before topic selection) — analogous to how Architect Mode fires early when the first message mentions architecture/services
4. **Add proactive banner** (new wording, parallel to Architect):
   ```
   🎨 I noticed this session involves UI/UX design.
   Activate UI Direction Mode to generate an HTML prototype direction?
   ```

### `skills/vp-brainstorm/SKILL.md`
- Update "UI Direction Mode" documentation block to say it auto-suggests itself (like Architect)
- Add the new lower threshold and proactive banner reference

## Version Target
2.23.0 → **2.24.0** (MINOR)

## Tasks

| ID | Title | Complexity |
|----|-------|------------|
| 88.1 | Update `workflows/brainstorm.md` — threshold + proactive banner | M |
| 88.2 | Update `skills/vp-brainstorm/SKILL.md` — docs parity | S |
| 88.3 | Contract tests + CHANGELOG + version 2.24.0 | S |

## Acceptance Criteria
- [ ] `workflows/brainstorm.md`: surface threshold = ≥2 signals (was ≥5)
- [ ] `workflows/brainstorm.md`: early-session UI keyword check present
- [ ] `workflows/brainstorm.md`: proactive banner `🎨` present
- [ ] `skills/vp-brainstorm/SKILL.md`: UI Direction auto-suggestion documented
- [ ] Contract tests pass
- [ ] `npm test` all pass
- [ ] package.json = "2.24.0"
