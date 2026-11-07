# Workflow: vp-proposal — Proposal Package Generation
Tool policy: follow `<tool_policy>` in the invoking skill (source: templates/tool-policy.md)

**Skill:** `/vp-proposal`  
**Version:** 0.3.0  
**Output:** `docs/proposals/{slug}/versions/{version}/{slug}.pptx` + `.docx` + `.md` (+ scripts, review, optional `-slides.txt`) — immutable versions (ENH-126)

<purpose>
Convert a brainstorm session (or direct brief) into a professional proposal package suitable
for client, partner, or investor presentations. Generates three synchronized files:
- .pptx — presentation (ViePilot branded, dark navy/charcoal, for direct delivery)
- .docx — detailed supporting document (full narrative, specs, appendix)
- .md  — Markdown source of truth (version-controlled, diff-friendly)
Supports 6 proposal types (internal and research types with variants); optional Google Slides upload.
</purpose>

## Implementation routing guard (ENH-021)

This workflow generates **proposal output artifacts** (`docs/proposals/`) — not ViePilot framework
shipping code. Use `/vp-request` → `/vp-evolve` → `/vp-auto` for framework feature work.

<process>

## Session, gates and output location (ENH-124 / ENH-126 — MANDATORY)

- **State lives on disk, not in memory.** `lib/proposal-session.cjs` keeps `docs/proposals/{slug}/session.json`.
  After EVERY step: `recordStep(root, slug, step)`; every confirmed choice: `recordDecision(root, slug, key, value, source)`
  with `source` = `auq` | `flag` | `auto` | `inferred`; every gate: `recordGate(root, slug, step, 'input'|'output', result)`.
  Before asking, `setPendingGate(root, slug, '<step>:<kind>')`.
- **Every gate asks the user via AskUserQuestion** (Claude Code; preload with ToolSearch `select:AskUserQuestion`).
  Other adapters: numbered text with the same options. Each step below declares an **input gate** (before it consumes a
  decision or data) and/or an **output gate** (after it produces something the user judges: accept / change /
  regenerate / stop). Compute-only steps say `covered by gate: <step>`. The registry is `lib/proposal-gates.cjs`
  (`GATES`); `lintWorkflowGates` keeps this file honest.
- **`--yes`** auto-accepts the recommended option at every gate and records `auto-accepted`; it never auto-accepts a
  material-risk item.
- **Outputs never overwrite.** `lib/proposal-store.cjs`: every run writes into a new `versions/v{n}-{date}/` folder
  (`newVersion`, `versionPaths`); `{version}` in the paths below is that folder. Until Confirm Output the folder is a
  **draft**: a regenerated file simply replaces the earlier draft (no new version needed). Confirm Output **seals** it
  (`writeProvenance(..., { seal: true })`); after that `assertWritable` refuses writes and any change goes to a new
  version — only `simulation/` runs may be added, followed by `refreshProvenance(...)`. `setCurrentVersion(...)`
  updates `proposal.json` and `session.currentVersion` together.
- **Staying inside the skill.** While a session is active, any user message about this proposal re-enters the workflow
  (`/vp-proposal --resume <slug>`; Claude Code: invoke the skill again with the Skill tool) and routes through
  **Step 11: Iterate**. Optional hooks: `vp-tools hooks install --proposal-context` (consent-gated) remind the agent
  on every prompt and after compaction.

### Gate inventory
| Step | Gates |
|---|---|
| detect_existing | input |
| initialize | input |
| context_detection | input |
| purpose_consult | input, output |
| audience_intake | input |
| type_selection | input |
| language_selection | input |
| voice_profile | input |
| story_brief | input |
| quality_brief | input |
| outline_gate | input, output |
| source_inventory | input |
| content_map | output |
| manifest_generation | output |
| generate_docx_content | output |
| spoken_script | output |
| detect_visual_artifacts | input |
| curation_check | output |
| template_resolution | covered by gate: generate_pptx |
| generate_pptx | output |
| animation_hook | output |
| deck_qa | output |
| generate_docx | output |
| generate_md | output |
| persona_review_council | input, output |
| google_slides_upload | input, output |
| confirm_output | output |
| rehearsal_hall | input, output |
| iterate | input, output |


<step name="initialize">
## Step 1: Initialize

```bash
Read lib/proposal-generator.cjs  → PROPOSAL_TYPES, resolveTemplate, detectBrainstormSession, buildLangInstruction,
                                    VOICE_LEVELS, buildVoiceInstruction, AI_CLICHE_BLACKLIST, detectCliches, loadPromptContract
Read lib/viepilot-config.cjs      → getProposalLang, recordProposalLang
Read package.json                 → verify pptxgenjs + docx dependencies present
```

Read `~/.viepilot/config.json` → `proposal.recentLangs` via `getProposalLang()`.
If `--lang` flag provided: validate ISO 639-1 code; set `lang = flag value`.
**Document skills (ENH-127 — MANDATORY on Claude Code):** run `assessEnvironment({ sessionSkills })` from
`lib/proposal-env.cjs` (`sessionSkills` = the skill names this session lists). Record the result with
`recordDecision(root, slug, 'environment', result, 'auto')`. When a document skill or a dependency is missing,
AskUserQuestion: Install / enable it and retry (Recommended — show the hints) / Continue with ViePilot's built-in
generators (explicit consent; every check that cannot run is reported as `checks.<name>.reason`, e.g.
"skipped — missing soffice", in the summary and the review report — never as passed). Other adapters use the built-in
generators and the same labelling.

**Resume (ENH-124):** `--resume [slug]` → `loadSession(root, slug)` (latest active session when slug is omitted;
`vp-tools proposal resume` prints the same). Restore every recorded decision, skip gates already accepted, and continue
at `currentStep` / `pendingGate`. Never re-ask a confirmed decision unless the user asks to change it.

**Input gate (ENH-124):** when flags leave choices open, AskUserQuestion once to confirm the run mode
(New run / Resume `<slug>` when an active session exists). `recordGate(root, slug, 'initialize', 'input', result)`.

If `--voice <1-4>` flag provided: validate against `VOICE_LEVELS`; set `voice.level = flag value` (skips the Voice Profile prompt).

> **Task list (ENH-125):** create the run's task list in the host todo tool before Step 2 — one item per workflow step that will run (Claude Code: `TodoWrite`, or `TaskCreate`/`TaskUpdate` when the session exposes them; Codex `update_plan`; Antigravity `write_todos`; otherwise a `## Todo` checklist in the summary). Keep exactly one item in progress and mark each step done as soon as its output gate is accepted.

> **AUQ preload — Claude Code adapter (ENH-059):** Before the first interactive prompt, call `ToolSearch` with `query: "select:AskUserQuestion"` to load the deferred schema. Skip only if `ToolSearch` errors → use the numbered-text fallback for the session. Other adapters always use numbered text.

Display startup banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► PROPOSAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

</step>

<step name="detect_existing">
## Step 1b: Detect Existing Proposal (ENH-126)

Run `detectExisting(root, { slug, topic })` from `lib/proposal-store.cjs` (topic = `--from` session topic or the brief's
project name; with neither, list everything). It returns versioned proposals and legacy flat files
(`docs/proposals/{slug}-{date}.*`, from before versioning).

If nothing matches: `createProposal(...)`, `startSession(root, slug)`, `newVersion(root, slug)` → continue to Step 2.

If something matches, **input gate** — AskUserQuestion "An earlier proposal exists: {slug} ({version}, made with ViePilot
{provenance.viepilotVersion}). What should we do?":
1. **Upgrade** (Recommended after a ViePilot update) — `upgradePlan(provenance, installedVersion)` from
   `lib/proposal-gates.cjs` lists `missing`, `changed`, `reuse` and `newInputs`. Restore confirmed decisions from the
   previous `manifest.json` / `session.json`, run only the missing and changed steps (with their gates), ask only
   `newInputs`, write everything into a new version and add `upgrade-report.md` (what changed and why, old vs new
   council scores).
2. **Revise** — new version based on the previous one; collect the changes, then route through Step 11: Iterate.
3. **New proposal** — choose a new slug; the existing one is untouched.
4. **Keep as is** — summarize the current version and stop.

Legacy flat files: offer `vp-tools proposal migrate` first (dry-run plan shown, non-destructive), then continue as Upgrade.

**Hand edits:** before Upgrade or Revise run `detectHandEdits(root, slug, version)`. If any artifact differs from its
recorded hash, AskUserQuestion: Import the edited text and notes into the manifest (pptx document skill
`scripts/slide_text.py` → `parseSlideText` → `diffAgainstManifest` → `formatImportDiff` shown for confirmation per slide or
all → `applyImport`, from `lib/proposal-import.cjs`; .docx text read with the docx skill, best effort) /
Keep the edited file as-is next to the new version / Regenerate (the edited file stays in its old version folder).

`recordDecision(root, slug, 'existing', choice, 'auq')`; `recordGate(root, slug, 'detect_existing', 'input', result)`.

---

</step>

<step name="context_detection">
## Step 2: Context Detection

Priority order:
1. `--from <file>` flag → load specified session file
2. Auto-detect: scan `docs/brainstorm/` for `session-*.md` → sort descending → load latest
3. No session found → standalone brief mode (go to Step 2B)

### Step 2A: Load brainstorm session
```
Session loaded: docs/brainstorm/session-{date}.md
Topic: {topic from session}
Key decisions: {D1, D2, D3...}
```
Extract from session:
- Project name / topic
- Problem statement
- Key decisions and features
- Target audience (if stated)

### Step 2B: Standalone brief (no session)
Prompt user:
```
No brainstorm session found. Please provide a brief:

1. Project name?
2. One-line description?
3. Target audience? (client / partner / investor / internal)
4. 3–5 key points to cover?
5. Any specific requirements or constraints?
```


**Gate (input, ENH-124):** AskUserQuestion — confirm the source: show the detected brainstorm session (topic, date, key decisions) or say none was found. Options: Use this session (Recommended) / Pick another session / Write a brief instead (Step 2B). Skip the question only when `--from` or `--yes` supplies the answer, and say so. `recordGate(root, slug, 'context_detection', 'input', result)`; on accept `recordStep(root, slug, 'context_detection')`.

---

</step>

<step name="purpose_consult">
## Step 2b+: Purpose Consult

Ask user for free-text description of the proposal's purpose, context, audience, and desired outcome.

```
Let's understand the purpose of this proposal.

Please tell me:
1. What is this proposal about? (purpose, context, who is in the room, outcome wanted)
```

User provides text (or skip with Enter). If provided:

```js
const hints = extractAudienceHints(text, { lang });
const gaps = findIntakeGaps(hints.matched);
```

Render the consult via `templates/proposal/purpose-consult-prompt.md` (placeholders: `{user_text}`, `{hints_json}`, `{gaps}`, `{recommendation_json}`, `{lang}`):

```
What I understood:
- Your proposal is about: {extracted purpose from hints}
- Key audience types detected: {roles from hints}
- Decision maker perspective: {if mentioned}
- Knowledge level: {if mentioned}
- Format / delivery goal: {if mentioned}

Is this right? (yes / no / clarify)
```

User confirms or corrects. If corrects, re-extract and re-show until confirmed.

**Non-interactive:** `--purpose "<text>"` supplies the text directly; auto-confirm.

Output: `purposeText`, `audienceHints` (from `extractAudienceHints`).


**Gate (input, ENH-124):** AskUserQuestion — ask for the free-text purpose in one question (the user answers through Other / free text). Options: Describe it now (Recommended) / Skip — answer the audience questions instead. Skip the question only when `--purpose` or `--yes` supplies the answer, and say so. `recordGate(root, slug, 'purpose_consult', 'input', result)`; on accept `recordStep(root, slug, 'purpose_consult')`.

**Gate (output, ENH-124):** AskUserQuestion — show the consult (What I understood, recommendation, outline and duration, watch-outs, still missing). Options: Correct (Recommended) / Correct with changes / Start over. `recordGate(root, slug, 'purpose_consult', 'output', result)`; on accept `recordStep(root, slug, 'purpose_consult')`.

---

</step>

<step name="audience_intake">
## Step 2c: Audience Intake

Build the starting profile from the consult hints: `const profile = normalizeAudienceProfile(audienceHints.raw)`.
Only if `findIntakeGaps(profile)` returns gaps, ask them (never show this step when there are no gaps). Merge the answers into the same raw object and normalize again.

Ask the gaps via a single `AskUserQuestion` call (Claude Code) or numbered text (other adapters), ≤4 questions:

1. **Roles** (multiSelect, if gap includes 'roles') — mark the primary one in "Other/notes"
2. **Decision Maker** (single choice or text, if 'decisionMaker' in gaps) — "who makes the final call? what do they care about?"
3. **Knowledge level** (choice: novice / mixed / expert, if 'knowledgeSize' in gaps) — "what is the audience's technical depth and group size?"
4. **Format & Goal** (choice or text, if 'formatGoal' in gaps) — "in-person, online, recorded, hybrid? approval, demo, training, fund, etc?"

Text fallback (numbered list for non-Claude Code):
```
Answer only what applies:

1. Roles: [list with checkboxes or comma-separated]
2. Decision Maker: [who & what they care about]
3. Knowledge: [novice / mixed / expert] and size: [small ≤10 / medium 11–50 / large >50]
4. Format & Goal: [delivery mode & what audience should do]
```

Parse responses into `normalizeAudienceProfile(raw)` → `audienceProfile` object.

**Non-interactive:** `--audience "<free text>"` skips the questions; parse it with `extractAudienceHints(text, { lang })`, merge into the raw hints, then `normalizeAudienceProfile(raw)`.

Output: `audienceProfile` (with roles, decisionMaker, knowledge, format, goal fields).

---

</step>



<step name="type_selection">
## Step 3: Proposal Type Selection

### Step 3a: Recommendation

If `--type` provided: validate + optional `--variant` (if type has variants); skip to Step 3c.

If not provided, call:
```js
const recommendation = recommendProposalType(audienceProfile, { lang });
```

Show recommendation via `AskUserQuestion` (Claude Code) or numbered text:

```
Based on your audience and goals, I recommend:

  {recommendation.typeId} — {label}
  Why: {recommendation.reason}
  Typical slide count: {slideCount}

  Other options:
  - {alternatives[0].typeId} — {alternatives[0].reason}
  - {alternatives[1].typeId} — {alternatives[1].reason}

  Or show all proposal types?
```

User chooses: Recommended → set `typeId`; Alternative → set `typeId`; Show all types → go to Step 3b.

### Step 3b: Full Menu (if "show all types" selected)

Present menu with all 6 types:

```
Select proposal type:

1. Project Proposal     (10 slides) — scope, timeline, budget for clients
2. Technical Architecture (12 slides) — system design for technical partners
3. Product Pitch Deck   (12 slides) — problem/solution, traction for investors
4. General Proposal     (8 slides) — flexible structure for any audience
5. Internal Presentation (variants available) — team intro, training, all-hands, etc.
6. Science & Technology Research (variants available) — grant, defense, tech transfer, etc.
```

User selects by number → set `typeId`.

### Step 3c: Variant Confirmation (internal-presentation or research-proposal)

If `typeId` is `internal-presentation` or `research-proposal` and no `--variant` provided:

For `internal-presentation`, call getSkeleton for each variant:
- team-intro
- leadership-report
- feature-demo
- training
- all-hands

For `research-proposal`, call getSkeleton for each variant:
- grant-proposal
- kickoff
- progress-report
- defense
- tech-transfer

Show via `AskUserQuestion` (Claude Code) or numbered text:

```
Which variant fits your audience?

1. {variant.label} — {variant.goal}
   Slides: {variant.slides}
   
[for each variant, compute from getSkeleton call]
```

User selects → set `variant`.

If `--type` supplied with `--variant`, validate both.

Output: `typeId` (string), `variant` (string if applicable, else null), `slideCount` (number).

---
---

</step>

<step name="language_selection">
## Step 3b: Language Selection

If `--lang` provided: skip prompt; use flag value directly.

If `--lang` not provided:
```
Language for this proposal?

  1. {recentLangs[0]} (most recently used)   ← only shown if recentLangs non-empty
  2. English (en)
  3. Vietnamese (vi)
  4. Other — enter ISO 639-1 code (e.g. ja, fr, zh, ko)
```
- `recent = getProposalLang()` from config
- Present numbered menu; save selected `lang`

Output: `lang` (ISO 639-1 string), `langContentOnly` (boolean from `--lang-content-only` flag)


**Gate (input, ENH-124):** AskUserQuestion — choose the output language (recent languages first). Options: <most recent> (Recommended) / English / Vietnamese / Other. Skip the question only when `--lang` or `--yes` supplies the answer, and say so. `recordGate(root, slug, 'language_selection', 'input', result)`; on accept `recordStep(root, slug, 'language_selection')`.

---

</step>

<step name="voice_profile">
## Step 3c: Voice Profile

Asked **every run** (ENH-117 user decision) — never silently reuse a previous choice.

If `--voice <1-4>` provided: skip the prompt; resolve the level from `VOICE_LEVELS`.

Pre-select `suggestVoice(audienceProfile, recommendation)` as **Recommended** (user still chooses every run; ENH-117 decision).

**Claude Code (terminal):** call `AskUserQuestion` (preloaded via `ToolSearch select:AskUserQuestion`, ENH-059) with one question and the options below, built from `VOICE_LEVELS`.

**Other adapters / AUQ unavailable — numbered-text fallback:**
```
Voice for this proposal? (how proudly the maker speaks)

  1. Humble          — "we" voice, pride shown through customer results
  2. Balanced        — confident, evidence-led, default
  3. Proud           — owns the achievement, every claim backed by proof
  4. Founder story   — first-person maker narrative, story-driven

  (Show each label in the proposal language: use `label_vi` / `label_en` from `VOICE_LEVELS`.)
```

Store in manifest:
```json
{ "voice": { "level": 2, "id": "balanced" } }
```

Output: `voice` object; later passed to `buildVoiceInstruction(voice.level, lang)`.

---

</step>

<step name="story_brief">
## Step 3e: Story Brief

Collect real material so the proposal sounds like a person, not a template. Ask via `AskUserQuestion` (Claude Code) or numbered text. **Every question is skippable** (Enter / "skip").

```
Story Brief — answer what you can, skip the rest:

1. Why did you build this? (the origin, in your own words)
2. Hardest moment — what nearly stopped you?
3. Proudest moment — what are you most proud of?
4. One real customer / user story (who, what changed)
5. The one number to remember (e.g. "96%", "3x faster")
6. The one sentence you want the audience to repeat
```

Store in manifest:
```json
{
  "story": {
    "why": "", "hardest": "", "proudest": "",
    "customerStory": "", "number": "", "repeatLine": ""
  }
}
```

**No-fabrication rule:** an empty answer stays empty. The AI MUST NOT invent anecdotes, customers, or numbers to fill the gap. Where a slide would need that material, write the "needs real material" marker defined in the prompt contract (Vietnamese form for `vi` runs, `[needs real material]` otherwise) and let the user supply the truth.

---

</step>

<step name="quality_brief">
## Step 3f: Quality Brief

Ask these 4 questions regardless of whether a session was loaded:

```
To sharpen the proposal, please answer briefly:

1. Decision / CTA: What should this proposal make the audience do?
   (e.g. "sign the contract", "approve budget", "schedule a demo")

2. Budget range: Approximate investment level?
   (e.g. "$50K–$100K", "internal only", or skip with Enter)

3. Timeline: Key deadline or constraint?
   (e.g. "present end of month", "no fixed deadline")

4. Decision-maker: Who is the primary audience?
   (e.g. "non-technical CEO", "CTO + engineering team", "procurement committee")
```

Store answers in manifest `meta` object:
```json
{
  "meta": {
    "cta": "sign the contract",
    "budget": "$50K–$100K",
    "timeline": "present end of month",
    "decisionMaker": "non-technical CEO"
  }
}
```

These drive sharper content in Step 4 (manifest_generation): tone, word choice, CTA on closing slide. `meta.decisionMaker` also feeds the TONE line together with the Voice Profile.


**Gate (input, ENH-124):** AskUserQuestion — confirm the quality brief (decision maker, tone, must-have points, constraints) as one summary. Options: Looks right (Recommended) / Edit an answer / Answer again. `recordGate(root, slug, 'quality_brief', 'input', result)`; on accept `recordStep(root, slug, 'quality_brief')`.

---

</step>

<step name="outline_gate">
## Step 3g: Outline First (ENH-122 — MANDATORY)

No slide content exists yet. Build the outline from the confirmed type / variant, duration and briefs:
`buildOutline({ type, variant, keyMessage, durationMin })` from `lib/proposal-outline.cjs` → per slide: title, beat,
**job** (what the audience will think / feel / do after it), **evidence needed** (number | demo | quote | diagram |
comparison | none), time budget. Draft the key message (one sentence the audience must remember) from the Story
Brief and the consult.

**Gate (input, ENH-124):** AskUserQuestion — confirm or rewrite the key message. Options: Use this key message
(Recommended) / Rewrite it / Show alternatives.

**Gate (output, ENH-124):** AskUserQuestion — show `formatOutline(outline)`. Options: Approve (Recommended) / Edit jobs
or evidence / Reorder, add or remove slides / Start over. Apply edits as `overrides`, re-run `validateOutline` (must be
`ok`). Slide generation is blocked until the outline is approved; `--yes` auto-approves and records `auto-accepted`.
Save as `versionPaths(...).outline` (`{slug}-outline.json`; `readOutline` still reads the old `-outline.md`). `recordGate(root, slug, 'outline_gate', 'input'|'output', result)`.

---

</step>

<step name="source_inventory">
## Step 3h: Source Inventory (ENH-122)

`inventorySources(root, { include: --source globs, exclude: --exclude globs })` from `lib/proposal-sources.cjs`
classifies candidate sources **by path only** (it never opens a file) into product-value, evidence, architecture,
visual, roadmap-future, process-log and sensitive. Only `readableSources(...)` may be opened afterwards — sensitive
files are never read. Process-log sources (CHANGELOG, TRACKER, phase/request files, git log) may only be TRANSFORMed
into an outcome or a proof point, never copied. Code and tests (`scripts/`, `tests/`, `*.test.*`) are skipped —
they are implementation detail, not proof — unless the user adds them with `--source`; user docs (`docs/user/**`)
count as product-value. When a fact carries a version number, `findStaleFacts(text, { version })` flags numbers that
disagree with the current version (a stale README) — re-check them with the user or DROP them.

**Gate (input, ENH-124):** AskUserQuestion — show counts per kind and the files that will be read. Options: Use these
sources (Recommended) / Add a source / Exclude a source. `recordGate(root, slug, 'source_inventory', 'input', result)`.

---

</step>

<step name="content_map">
## Step 3i: Content Map (ENH-122 / ENH-123)

Read the readable sources and, for every candidate fact, decide against the approved outline and the audience with
`addItem(map, …)`: **FIT** (serves a slide's job → assigned to that slide), **TRANSFORM** (true but phrased as process →
rewritten as outcome or proof, e.g. "Phase 165 added 4 voice levels (v3.13.0)" → "You choose how boldly the deck
speaks"), **DROP** (irrelevant, too detailed or history with no bearing on the decision — with a reason),
**SENSITIVE** (never shown) or **BACKSTAGE** (presenter-only, with a reason). The rules are enforced by `addItem`
(process-log is never FIT; sensitive is only SENSITIVE). A slide whose job has no evidence is a **gap**: ask the user
for real material — never invent (same rule as the Story Brief).

**Gate (output, ENH-124):** AskUserQuestion — show `summarizeContentMap(map)` (counts, dropped and backstage items with
reasons, gaps). Options: Approve (Recommended) / Move items / Restore a dropped item / Answer the gaps.
`recordGate(root, slug, 'content_map', 'output', result)`.

---

</step>

<step name="manifest_generation">
## Step 4: AI Slide Manifest Generation

Build language instruction and prepend to prompt:
```js
const langInstruction = buildLangInstruction(lang, langContentOnly);
// Prepend langInstruction to the AI content generation prompt before the slide structure spec.
```

Generate a structured JSON manifest from the loaded context.

**Audience profile in the manifest (BUG-035 G1):** `audienceProfile` is REQUIRED — copy the profile confirmed at
Step 2c verbatim. Check with `checkManifestAudience(manifest)` from `lib/proposal-audience.cjs` before rendering; the
council and the Rehearsal Hall read it through `resolveAudienceProfile({ manifest, session })`.

**Manifest schema:**
```json
{
  "title": "Project Name",
  "subtitle": "One compelling sentence — not just a date",
  "type": "project-proposal",
  "variant": "team-intro",
  "audienceProfile": {
    "roles": [{ "id": "engineering", "weight": "primary" }, { "id": "leadership", "weight": "secondary" }],
    "decisionMaker": { "role": "engineering", "cares": ["risk", "technical"] },
    "knowledge": "expert",
    "size": "medium",
    "format": "in-person",
    "goal": "approve"
  },
  "audience": "client|partner|investor|internal",
  "meta": {
    "cta": "sign the contract",
    "budget": "$50K–$100K",
    "timeline": "present end of month",
    "decisionMaker": "non-technical CEO"
  },
  "voice": { "level": 2, "id": "balanced" },
  "story": {
    "why": "", "hardest": "", "proudest": "",
    "customerStory": "", "number": "", "repeatLine": ""
  },
  "designConfig": {
    "colorPalette": "navy-electric",
    "layoutStyle": "modern-tech",
    "fontPair": "Calibri / Calibri Light"
  },
  "animation": { "transition": "fade|push|wipe" },
  "slides": [
    {
      "index": 1,
      "layout": "cover",
      "heading": "Title",
      "body": "Subtitle / prepared by / date",
      "speakerNotes": "Full spoken words, spoken style.\nShort sentences.\nBreak at breath points.",
      "durationSec": 20,
      "builds": [0]
    },
    {
      "index": 2,
      "layout": "section",
      "heading": "Section Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Full spoken words for this slide.\n96% of users finished in one session.",
      "durationSec": 45,
      "builds": "auto"
    }
  ]
}
```

`speakerNotes` = the **full spoken words** in spoken style — short sentences, a line break at each breath point, numbers kept as digits (`96%`), never spelled out. `durationSec` = estimated speaking time for the slide. (Full rules and estimation are finalised in Step 4b.)

`animation.transition` (one style per deck: `fade`, `push` or `wipe`) and per-slide `builds` are REQUIRED (see Step 6b). `builds` is `"auto"` (every body text shape except the heading) or an array of 0-based content-shape indices; cover and closing use their own simple build (title, then subtitle / CTA). The number of `[click]` cues in a slide's `speakerNotes` MUST equal that slide's build count, so generate `builds` and `speakerNotes` together.

## AI Prompt Contract

Assemble the prompt from these parts, in order:

```js
const contract = loadPromptContract();                      // templates/proposal/prompt-contract.md
const voiceInstruction = buildVoiceInstruction(voice.level, lang);
const langInstruction = buildLangInstruction(lang, langContentOnly);
// prompt = header + contract + voiceInstruction + langInstruction + story material
```

```
You are generating a proposal slide manifest that reads like a person wrote it.

AUDIENCE: {meta.decisionMaker || "business decision-maker"}
CTA: {meta.cta || "approve the proposal"}
BUDGET CONTEXT: {meta.budget || "not specified"}
TIMELINE: {meta.timeline || "not specified"}
TONE: derived from voice level + decision-maker, not binary —
      {voiceInstruction} Adjust register for the audience: a technical decision-maker
      gets precise, data-grounded phrasing; a non-technical one gets plain language and
      outcomes first.
{langInstruction}

{contract}   // voice, rhythm, narrative arc, real material, numbers, banned cliches

STORY MATERIAL (use only what is provided):
  why: {story.why}  hardest: {story.hardest}  proudest: {story.proudest}
  customer story: {story.customerStory}  number: {story.number}  repeat line: {story.repeatLine}
  Empty field → do NOT invent; write the needs-real-material marker (per contract) where the slide needs it.

CONTENT RULES — apply to every slide:
- Cover subtitle: one sentence that states the value, in the maker's voice (NOT just a date)
- Bullets state the outcome but are never formulaic: vary length and structure; a slide may be one strong sentence
- Closing slide: concrete CTA matching meta.cta — NOT "Thank you" alone
- Data/metrics slide: include at least one quantified metric (estimate is fine, label as such)
- Every claim of pride carries evidence (number, customer, demo)
- Follow the narrative arc beats listed per slide below
```

**Post-generation check:** run `detectCliches(text)` over all generated slide text and speaker notes; rewrite any hit before continuing. The cliche list lives in `AI_CLICHE_BLACKLIST` / the contract — it is not duplicated here.

**Slide layout types:**
- `cover` — full-bleed title slide (index 1 always)
- `section` — heading + bullet list (main content slides)
- `two-column` — heading + two content columns (for comparisons)
- `data` — heading + key metric callouts
- `closing` — CTA block matching meta.cta (last slide always)

**Slide count rules (ENH-045 — dynamic):**
- Base skeleton per type defines the minimum set of slides (see structure below).
- AI may add extra slides when content warrants — there is **no hard maximum**.
- Content-aware split triggers:
  - `technicalNarrative` has > 4 paragraphs → split into 2 Technical Approach slides
  - `team` has > 4 members → split into 2 Team slides
  - `phases` / timeline has > 4 items → split into 2 Timeline slides
  - `riskRegister` has > 3 items → add a dedicated Risk slide
- Every generated manifest MUST include a `designConfig` field (see **Design Selection** below).

**Design Selection (ENH-045):**

The AI MUST choose a `designConfig` based on project context (sector, audience, tone) and include it in the manifest:

```json
"designConfig": {
  "colorPalette": "navy-electric | navy-gold | dark-vibrant",
  "layoutStyle":  "modern-tech | enterprise | creative",
  "fontPair":     "Calibri / Calibri Light | Georgia / Calibri | Calibri / Calibri"
}
```

Selection heuristic:
- **enterprise** → finance, banking, legal, compliance, government, corporate audience
- **creative** → startup, design agency, gaming, media, art, consumer product
- **modern-tech** → default; SaaS, developer tools, technical architecture, general tech

Add this block to the AI prompt immediately after the TONE line:

```
DESIGN SELECTION:
Choose one layoutStyle based on project context:
  enterprise  — if sector/audience is: finance, banking, legal, compliance, government, corporate
  creative    — if sector/audience is: startup, design, gaming, media, agency, consumer
  modern-tech — default for SaaS, dev tools, tech architecture, general
Include "designConfig": { "colorPalette": ..., "layoutStyle": ..., "fontPair": ... } in the manifest root.
```

**Slide structure by type:**

Each skeleton slide is annotated with its narrative-arc beat (context → conflict → turning point → solution → proof → invitation). The skeleton is the minimum set (ENH-045); extra slides inherit the beat of the slide they split from.

### project-proposal (10 slides)
1. Cover — project name, client name, date  ← _context_
2. Agenda — what we'll cover  ← _context_
3. Problem / Opportunity  ← _conflict_
4. Proposed Solution  ← _turning point_
5. Key Features & Deliverables  ← _solution_
6. Technical Approach (high level)  ← _solution_
7. Project Timeline  ← _proof_
8. Team & Expertise  ← _proof_
9. Investment / Budget Estimate  ← _proof_
10. Next Steps & CTA  ← _invitation_

### tech-architecture (12 slides)
1. Cover  ← _context_
2. Executive Summary  ← _context_
3. Problem Statement  ← _conflict_
4. Architecture Overview (diagram description)  ← _turning point_
5. Component Breakdown  ← _solution_
6. Data Flow  ← _solution_
7. Tech Stack  ← _solution_
8. Security & Compliance  ← _proof_
9. Scalability & Performance  ← _proof_
10. Integration Points  ← _proof_
11. Implementation Roadmap  ← _proof_
12. Next Steps & CTA  ← _invitation_

### product-pitch (12 slides)
1. Cover  ← _context_
2. The Problem  ← _conflict_
3. Our Solution  ← _turning point_
4. Market Opportunity  ← _context_
5. Product Demo / Screenshots  ← _solution_
6. Business Model  ← _solution_
7. Traction & Validation  ← _proof_
8. Competitive Landscape  ← _proof_
9. Team  ← _proof_
10. Roadmap  ← _solution_
11. Ask / Investment  ← _invitation_
12. Thank You & Contact  ← _invitation_

### general (8 slides)
1. Cover  ← _context_
2. Overview  ← _context_
3. Problem / Context  ← _conflict_
4. Solution / Proposal  ← _turning point_
5. Key Benefits  ← _solution_
6. Approach & Timeline  ← _solution_
7. About Us / Credentials  ← _proof_
8. Next Steps & CTA  ← _invitation_

### internal-presentation (variants)

The Internal Presentation type supports 5 variants, each optimized for different internal communications:

#### team-intro (8 slides)
Introduce the team's work and engage for involvement.
```
1. Cover  ← _context_
2. Why we are here  ← _context_
3. The problem we saw  ← _conflict_
4. What we built/plan  ← _solution_
5. How it works  ← _proof_
6. What it means for your team  ← _turning point_
7. Timeline & who to ask  ← _invitation_
8. Q&A / how to get involved  ← _invitation_
```

#### leadership-report (8 slides)
Drive decisions with data and clear recommendations.
```
1. Cover  ← _context_
2. Bottom line first  ← _solution_
3. Where we are vs plan  ← _proof_
4. Key numbers  ← _proof_
5. Risks & blockers  ← _conflict_
6. Options & recommendation  ← _solution_
7. Ask / decision needed  ← _invitation_
8. Appendix pointer  ← _invitation_
```

#### feature-demo (7 slides)
Show the feature in action and drive adoption.
```
1. Cover  ← _context_
2. The pain today  ← _conflict_
3. Live demo flow  ← _proof_
4. Before/after  ← _turning point_
5. How to start using it  ← _solution_
6. Known limits & roadmap  ← _invitation_
7. Feedback channel  ← _invitation_
```

#### training (9 slides)
Build competence through structured learning.
```
1. Cover  ← _context_
2. What you will be able to do  ← _invitation_
3. Concepts  ← _context_
4. Step-by-step 1  ← _proof_
5. Step-by-step 2  ← _proof_
6. Common mistakes  ← _conflict_
7. Practice / exercise  ← _proof_
8. Cheatsheet  ← _solution_
9. Where to get help  ← _invitation_
```

#### all-hands (8 slides)
Unite the organization around shared mission and progress.
```
1. Cover  ← _context_
2. Where we came from  ← _context_
3. Wins worth celebrating  ← _turning point_
4. What we learned  ← _proof_
5. What is next  ← _solution_
6. How each team fits  ← _solution_
7. Thank you  ← _invitation_
8. Q&A  ← _invitation_
```

### research-proposal (variants)

The Research Proposal type supports 5 variants for academic and research contexts. All research variants include a references section in the generated `.docx` (mirror `INTERNAL_VARIANTS` via `citations: true` flag).

#### grant-proposal (12 slides)
Secure funding for research through clear question, methodology, and impact.
```
1. Cover  ← _context_
2. Why this matters now  ← _conflict_
3. State of the art & gap  ← _context_
4. Research questions & hypotheses  ← _solution_
5. Objectives  ← _solution_
6. Methodology  ← _proof_
7. Work plan & timeline  ← _proof_
8. Expected outputs  ← _solution_
9. Team & capacity  ← _solution_
10. Budget  ← _proof_
11. Risks & mitigation  ← _conflict_
12. Impact & ask  ← _invitation_
```
_References section in .docx: citations, bibliography_

#### kickoff (10 slides)
Align team on project scope, roles, and immediate actions.
```
1. Cover  ← _context_
2. Why we started  ← _context_
3. Goals & scope  ← _solution_
4. Work packages  ← _solution_
5. Roles & responsibilities  ← _solution_
6. Milestones & deliverables  ← _solution_
7. Data & resources  ← _proof_
8. Risks & assumptions  ← _conflict_
9. Reporting cadence & tools  ← _proof_
10. First 30 days  ← _invitation_
```
_References section in .docx: key documents, data sources_

#### progress-report (10 slides)
Demonstrate progress with evidence, address risks, and chart next steps.
```
1. Cover  ← _context_
2. Bottom line vs objectives  ← _proof_
3. Results per objective  ← _proof_
4. Outputs & publications  ← _proof_
5. Evidence & data highlights  ← _proof_
6. Deviations & why  ← _conflict_
7. Budget use  ← _proof_
8. Issues & support needed  ← _conflict_
9. Next period plan  ← _solution_
10. Conclusion & request  ← _invitation_
```
_References section in .docx: publications, deliverables_

#### defense (10 slides)
Present research findings and defend contribution to field.
```
1. Cover  ← _context_
2. Research question  ← _context_
3. Why it matters  ← _conflict_
4. Related work & gap  ← _context_
5. Contribution  ← _turning point_
6. Method  ← _proof_
7. Results  ← _proof_
8. Discussion & limitations  ← _solution_
9. Future work  ← _solution_
10. Thank you & questions  ← _invitation_
```
_References section in .docx: citations, related work_

#### tech-transfer (10 slides)
Demonstrate technology readiness and secure partnership interest.
```
1. Cover  ← _context_
2. Industry problem  ← _conflict_
3. Our technology  ← _solution_
4. Readiness level  ← _proof_
5. Evidence & benchmarks  ← _proof_
6. IP & ownership  ← _solution_
7. Integration path  ← _solution_
8. Partnership models  ← _solution_
9. Pilot plan & costs  ← _proof_
10. Next step  ← _invitation_
```
_References section in .docx: technical documentation, benchmarks_


If `--dry-run`: print manifest as JSON and stop here.



**Content Map only (ENH-122):** the manifest follows the approved outline slide for slide; every slide's content
comes from Content Map items assigned to it and lists them in `refs`. `validateManifestAgainstMap(manifest, map)` must
be `ok` before the output gate; reported gaps go back to the user.

**Budget workbook (ENH-127):** when `budgetApplies(type, variant)` (`lib/proposal-budget.cjs`: project-proposal,
research grant-proposal and progress-report, internal leadership-report), every budget, investment or "ask" figure
comes from one workbook — never typed into slides by hand:
1. **Input gate** — AskUserQuestion for the line items, rates and co-funding still unknown (pre-filled from the Story and
   Quality Briefs; nothing is invented — unknown values stay 0 and are flagged on the slide as "to confirm").
2. `budgetSpec(type, variant, inputs)` → `renderOpenpyxlScript(spec, '<version>/<slug>-budget.xlsx')`; the xlsx document
   skill (`anthropic-skills:xlsx`) runs it and then its `recalc.py` (mandatory for formulas).
3. `renderReadBackScript(spec, …)` prints the recalculated values; slides, notes and the .docx quote exactly these.
   When recalculation cannot run (`checks.xlsxRecalc.reason`), use `evaluateSpec(spec)` and label the figures
   "computed by ViePilot — workbook not recalculated".

**Research references (ENH-127):** for `research-proposal`, ask for reference PDFs in the Story Brief; read them with the
pdf document skill (`anthropic-skills:pdf`) for the state-of-the-art slide and the references section — every cited
claim names its source. Optional: export the deck as a PDF handout with the same skill.

**Gate (output, ENH-124):** AskUserQuestion — preview the slide list: number, title, arc beat, one-line key point per slide, total count. Options: Accept (Recommended) / Change slides (add / remove / reorder / rename) / Regenerate / Stop. `recordGate(root, slug, 'manifest_generation', 'output', result)`; on accept `recordStep(root, slug, 'manifest_generation')`.

---

</step>

<step name="generate_docx_content">
## Step 4a: AI Docx Content Generation (independent pass)

This is a **separate AI call** from the slide manifest generation.
- Input: brainstorm session + quality brief meta + proposal type + slide manifest (for context only)
- Output: `docxContent` JSON — per-section rich content + diagram specs
- This content is deeper and longer than slides; it is NOT derived from slide bullets

**Docx content AI prompt contract:**

```
You are generating the DETAILED DOCUMENT for a professional proposal.
This document is the deep technical and narrative companion to the slides.

CONTEXT:
- Proposal type: {typeId} — {label}
- Audience: {meta.decisionMaker}
- CTA: {meta.cta}
- Budget: {meta.budget}
- Timeline: {meta.timeline}
- Brainstorm session summary: {sessionSummary or "none"}
- Slide headings (for context only): {slides.map(s => s.heading).join(', ')}
{langInstruction}

DIAGRAM TYPES to generate: {getDiagramTypes(typeId)}
  project-proposal  → flowchart, gantt
  tech-architecture → flowchart, sequenceDiagram, classDiagram
  product-pitch     → flowchart, sequenceDiagram
  general           → flowchart

GENERATE a JSON object with this exact schema:
{
  "executiveSummary": ["paragraph1 (3–6 sentences)", "paragraph2", "paragraph3"],
  "problemStatement": ["paragraph1", "paragraph2"],
  "solutionNarrative": ["paragraph1", "paragraph2"],
  "technicalNarrative": ["paragraph1"],
  "riskRegister": [
    { "risk": "...", "probability": "High|Med|Low", "impact": "High|Med|Low", "mitigation": "..." }
  ],
  "glossary": [
    { "term": "...", "definition": "plain-language definition" }
  ],
  "diagrams": [
    {
      "type": "flowchart|sequenceDiagram|classDiagram|erDiagram|gantt",
      "title": "diagram title",
      "mermaidSource": "valid Mermaid 10+ source code"
    }
  ]
}

CONTENT RULES:
- Each paragraph: 3–6 sentences, states the outcome, uses data from brainstorm session
- riskRegister: 3–5 rows covering the most likely project risks
- glossary: 5–10 key terms the decision-maker may not know
- diagrams: generate one diagram per type in getDiagramTypes(typeId)
- Mermaid source MUST be syntactically valid Mermaid 10+ syntax
- flowchart uses `flowchart TD` (not `graph TD`)
- gantt must include `dateFormat YYYY-MM-DD` and at least 3 sections
- AVOID placeholder text — generate real content from the brainstorm session context
```

Store result as `docxContent` variable for use in Steps 7 and 8.

Apply the same voice rules here: run `buildVoiceInstruction(voice.level, lang)` and the `loadPromptContract()` text in this prompt, and check output with `detectCliches()`.


**Gate (output, ENH-124):** AskUserQuestion — preview the document outline: section headings, diagram list, appendix items. Options: Accept (Recommended) / Change sections / Regenerate / Stop. `recordGate(root, slug, 'generate_docx_content', 'output', result)`; on accept `recordStep(root, slug, 'generate_docx_content')`.

---

</step>


<step name="spoken_script">
## Step 4b: Spoken Script & Speaker Notes

Every slide ALWAYS ships with a script. This step fills `speakerNotes` and `durationSec` for every slide and adds `qa[]` and a per-slide `optional` flag to the manifest.

Load the rules from `lib/proposal-script.cjs`:
```js
const { SPOKEN_NOTES_RULES, validateSpeakerNotes, DURATIONS, planDuration, buildScriptMarkdown } = require('./lib/proposal-script.cjs');
```
Inject `SPOKEN_NOTES_RULES` (together with `buildVoiceInstruction()` and the `loadPromptContract()` text) into the generation prompt.

**Default duration (ENH-119):** when `--duration` is not given, the primary script uses `suggestDuration(audienceProfile, recommendation)` from `lib/proposal-audience.cjs` (variant default, shortened for leadership or large online audiences). The 5 / 15 / 30 versions are still produced.

**Spoken-notes rules (user decision, ENH-117):**
- Speaker notes are the **full spoken words**, in spoken style - not keywords, not an essay
- Short sentences, one idea per line, a line break at each breath point; no line over 40 words
- Natural particles and contractions are allowed
- Numbers stay as digits and symbols (`96%`, `3x`, `$50K`, `2026`) - never spelled out in words
- Optional stage cues in brackets, English names: `[pause]`, `[stress]`, `[click]`. The localized cue words come from `SPOKEN_NOTES_RULES` in `lib/proposal-script.cjs`

**Manifest additions:**
- `slides[].optional` (boolean): true for slides that can be dropped from shorter versions. Cover and closing slides are never optional.
- `slides[].transition` (string, optional): one spoken line leading into the next slide.
- `qa[]`: at least 3 hard questions the audience may ask, each `{ "question": "...", "answer": "..." }`, answered in the chosen voice.

**Validation:** run `validateSpeakerNotes(manifest.slides, lang)` right after generation. Issue codes: `missing`, `spelled-number`, `essay`, `cliche`. On any issue, regenerate only the affected slides' notes once, then re-validate and report any remaining issues in the Step 10 summary.

**Script files** (written after the manifest is final; default duration = `--duration` flag value from `DURATIONS` [5, 15, 30], else 15):
| File | Content |
|------|---------|
| `docs/proposals/{slug}/versions/{version}/{slug}-script.md` | script for the chosen duration (default 15 min) |
| `docs/proposals/{slug}/versions/{version}/{slug}-script-5min.md` | 5-minute version |
| `docs/proposals/{slug}/versions/{version}/{slug}-script-30min.md` | 30-minute version |
| `docs/proposals/{slug}/versions/{version}/{slug}-script.docx` | same content as the default script, generated by the AI at runtime with the `docx` package (same pattern as Step 7) |

Each markdown file comes from `buildScriptMarkdown(manifest, { minutes })`: header (title, duration, audience, voice), one `### Slide N - heading (mm:ss)` section per included slide with spoken text and a transition line, then the Expected Q&A section. `planDuration(slides, minutes)` drops `optional` slides only for the 5 min version (kept for 15 and 30), scales each slide's seconds proportionally so the total lands within 10% of the target (up or down), caps any single slide at about 25% of the total, and always keeps the cover and closing slides.

**Fixed blocks (BUG-035 G5):** a live demo or video on a slide is `slides[].fixedSec` (with optional `fixedLabel`,
e.g. "live demo"), and the Q&A is the deck-level `qaSec`. `planDuration(slides, minutes, { qaSec })` takes them
off the target first and spreads only the spoken time, so a 15-min talk with a 4-min demo and 3-min Q&A does not flag
every slide as underrun; the Rehearsal Hall timeline inserts them as non-spoken segments. Ask for both in the Quality
Brief when the talk has a demo or Q&A. Pass the council's likely questions as
`buildScriptMarkdown(manifest, { minutes, expectedQuestions })` so the Q&A section is never empty when `manifest.qa`
is missing; the Audience header falls back to `audienceProfile`.

Progress: `[script] Writing 3 script files + docx...`


**Gate (output, ENH-124):** AskUserQuestion — show per-slide timing for the chosen duration, total time, and two sample speaker notes. Options: Accept (Recommended) / More conversational / Shorter / Regenerate. `recordGate(root, slug, 'spoken_script', 'output', result)`; on accept `recordStep(root, slug, 'spoken_script')`.

---

</step>

<step name="detect_visual_artifacts">
## Step 4c: Detect Visual Artifacts (MANDATORY visual pass when artifacts exist)

This step runs **after Step 4b (Script)** and **before template resolution**.

**ENH-044 enforcement rule:** When `detectVisualArtifacts()` returns non-empty results, `visualSlides[]` MUST be populated — silent skip is not allowed. If puppeteer is absent, use `addPlaceholderVisual()` and emit a WARNING.

1. Call `detectVisualArtifacts()` from `lib/proposal-generator.cjs`:
   ```js
   const { detectVisualArtifacts } = require('./lib/proposal-generator.cjs');
   const artifacts = detectVisualArtifacts(); // auto-detects latest .viepilot/ui-direction/ session
   ```

2. **If no artifacts found** (`artifacts.uiPages.length === 0 && artifacts.architectPages.length === 0`):
   - Set `visualSlides = []`
   - Log: `[visuals] No HTML artifacts found — skipping screenshot pass`
   - Continue to Step 5

3. **If artifacts are found** — `visualSlides[]` MUST be populated (never left empty):

   **3a. When puppeteer is available** (`isPuppeteerAvailable()` returns true):
   - Use `screenshotArtifact(htmlPath)` → `addImage()` for each mapped artifact
   - `visualSlides[]` entries use real screenshots

   **3b. When puppeteer is absent** (MANDATORY fallback):
   ```js
   const { warnMissingTool, isPuppeteerAvailable } = require('./lib/screenshot-artifact.cjs');
   if (!isPuppeteerAvailable()) {
     warnMissingTool('puppeteer', 'npm install puppeteer');
     // Use addPlaceholderVisual(slide, label) for each mapped artifact — do NOT skip
   }
   ```
   - Call `addPlaceholderVisual(slide, label)` for each entry that would have had a screenshot
   - `visualSlides[]` is still populated — placeholder entries count as valid visual slides
   - Do NOT leave `visualSlides[]` empty when artifacts exist

   **Produce `visualSlides[]`** by mapping slide topics to artifact files using AI judgment:

   **Artifact → slide mapping rules:**
   | Slide topic keywords | Artifact to use | artifactType |
   |----------------------|-----------------|--------------|
   | UI, interface, mockup, design, screens | `artifacts.uiPages[0]` (index.html) | `ui-overview` |
   | Specific UI page (login, dashboard…) | matching `artifacts.uiPages[N]` | `ui-page` |
   | Architecture, system design, components | `architecture.html` in architectPages | `architect-arch` |
   | Database, entities, ERD, data model | `erd.html` in architectPages | `architect-erd` |
   | Flow, sequence, interactions, API calls | `sequence-diagram.html` in architectPages | `architect-seq` |
   | Features, feature map | `feature-map.html` in architectPages | `architect-features` |
   | Users, roles, use cases, actors | `user-use-cases.html` in architectPages | `architect-usecases` |

4. `visualSlides[]` schema — one entry per slide that should receive a visual:
   ```json
   [
     {
       "slideIndex": 3,
       "artifactType": "ui-overview",
       "htmlPath": "/absolute/path/to/index.html",
       "label": "UI Prototype Overview"
     },
     {
       "slideIndex": 7,
       "artifactType": "architect-arch",
       "htmlPath": "/absolute/path/to/architecture.html",
       "label": "System Architecture"
     }
   ]
   ```
   - `slideIndex`: 0-based index in the slides array
   - Maximum **1 visual per slide**
   - **Only assign visuals to content slides** — do NOT assign to cover (slide 0), section dividers, or closing/CTA slides
   - Maximum 3–4 visual slides per proposal to avoid visual overload

5. Store as `visualSlides` variable for use in Step 6 (`generate_pptx`).

Progress: `[visuals] Found {N} artifact(s) → {M} slides will have screenshots`


**Gate (input, ENH-124):** AskUserQuestion — list the visual artifacts found (UI prototype pages, diagrams) and how they will be used. Options: Include all (Recommended) / Choose which / Include none. `recordGate(root, slug, 'detect_visual_artifacts', 'input', result)`; on accept `recordStep(root, slug, 'detect_visual_artifacts')`.

---

</step>

<step name="curation_check">
## Step 4d: Curation Check — no changelog, no dev notes (ENH-122 / ENH-123)

Runs on the manifest **and** the spoken script, before anything is rendered:
1. `detectProcessLeak(manifest, { type, variant, audienceProfile, script })` — versions, phase/task/request ids, commit
   hashes, file paths and function names (non-technical audiences), changelog verbs, dated "what we did" lists,
   "first we… then we…" narration. Every finding is rewritten through TRANSFORM and re-checked; anything left is
   fail-loud (rendering does not start).
2. `detectDevNotes(manifest, script, { keep })` — not-done work, "remaining / watch-out" lists, hedges, quoted line by
   line (only in their work-item sense: "forgets what it is doing" or an honest "no numbers yet" is not a dev note). Each finding
   goes to the **Backstage Editor (#31)**, who decides `fix | reframe | backstage | remove | keep` with a reason (`keep`
   = false positive or deliberate; pass kept lines back as `keep` on re-checks); `enforceMaterialRule`
   forbids hiding a material risk (budget, delay, security, legal) from a decision audience — reframe it as
   risk → mitigation → ask instead.
3. `buildBackstage(decisions, { title, lang, manifest, contentMap })` → `versionPaths(...).backstage` (presenter-only,
   headings in the deck language: tough questions with prepared answers, open items with owner and date — not
   repeating the questions —, reframes that are really on the slides (others listed as pending), fixes, removals
   including the Content Map DROP items). `findBackstageLeaks` must be `ok`: no
   backstage or removed text may remain on slides, in notes or in the script. Speaker notes may keep a short
   `[Backstage]` pointer where a question is likely.

**Gate (output, ENH-124):** AskUserQuestion — the curation result (leaks fixed, dev notes and the Backstage Editor's
decisions, material items and how they were handled). Options: Accept all (Recommended) / Review material items one by
one / Restore an item to the slides / Stop. `recordGate(root, slug, 'curation_check', 'output', result)`.

---

</step>

<step name="template_resolution">
## Step 5: Template Resolution

```js
const pptxTemplate = resolveTemplate(typeId, 'pptx', projectRoot);
const docxTemplate = resolveTemplate('project-detail', 'docx', projectRoot);
```

- If project override found: `[override] Using .viepilot/proposal-templates/{type}.pptx`
- If stock fallback: `[stock] Using ViePilot template for {type}`
- If stock file missing (not yet generated): warn user and continue with programmatic fallback

Ensure output directory:
```bash
mkdir -p docs/proposals/
```


Compute-only step — covered by gate: `generate_pptx` (the template used is shown there). `recordStep(root, slug, 'template_resolution')`.

---

</step>

<step name="generate_pptx">
## Step 6: Generate .pptx

**Claude Code:** load the pptx document skill first (Skill tool → `anthropic-skills:pptx`) and follow its
"Creating with pptxgenjs" gotchas and structured-deck guidance while executing the steps below; ViePilot's manifest,
spoken notes and template rules stay the source of truth. Other adapters: the steps below as written.

Using `pptxgenjs`:
1. Create new `pptxgen` instance
2. Define Slide Master from template (dark navy `#1a1f36` background, accent `#4f6ef7`)
3. For each slide in manifest:
   - Apply layout-appropriate template slide
   - Inject `heading`, `bullets` / `body`
   - Call `slide.addNotes(slide.speakerNotes)` for **every** slide (no slide may ship without notes)
4. Before writing, run `validateSpeakerNotes(manifest.slides, lang)`; on issues regenerate the affected notes once, then report remaining issues
5. Write to `docs/proposals/{slug}/versions/{version}/{slug}.pptx`

Progress: `[pptx] Generating {N} slides...`


**Gate (output, ENH-124):** AskUserQuestion — report the written .pptx (path, template used — this also covers template_resolution —, slide count). Options: Accept (Recommended) / Use another template / Regenerate / Stop. `recordGate(root, slug, 'generate_pptx', 'output', result)`; on accept `recordStep(root, slug, 'generate_pptx')`.

---

</step>

<step name="animation_hook">
## Step 6b: Animation (MANDATORY)

Runs right after the `.pptx` is written in Step 6. This step cannot be skipped or disabled.

1. Build the plan from the manifest:
   ```js
   const { applyAnimations, validatePptxAnimations } = require('./lib/pptx-animate.cjs');
   const plan = {
     transition: manifest.animation.transition,   // 'fade' | 'push' | 'wipe'
     build: 'fade',                               // or 'appear'
     slides: manifest.slides.map(s => ({ index: s.index, builds: s.builds })), // 'auto' | number[]; optional per-slide transition
   };
   await applyAnimations(pptxPath, plan);
   ```
   `'auto'` builds every body text shape except the heading (title placeholder or top-most text shape) and the
   slide-number, date, footer and header placeholders.
2. Validate: `const res = await validatePptxAnimations(pptxPath, { manifest })` returns
   `{ ok, slides: [{ index, hasTransition, buildCount, clickCues, mismatch }], dirEntries }` — with the manifest it
   compares every slide's builds with its `[click]` cues itself (`mismatch: true` fails `ok`).
3. **`[click]` rule:** for every slide, the number of `[click]` cues in `speakerNotes` (localized cue words are defined in `SPOKEN_NOTES_RULES` in `lib/proposal-script.cjs`; count with `countClickCues(notes)`) MUST equal that slide's `buildCount`.
4. **Fail-loud rule (no silent skip):** if any slide has no transition (`hasTransition === false`), or a content slide (not cover/closing) has `buildCount === 0`, or the `[click]` count differs from `buildCount`, STOP generation with an error listing the offending slide indices, e.g. `Animation validation failed: slides 3, 5 have no transition / 0 builds`. Never continue to Step 7 and never silently skip animation (same enforcement as ENH-044).

Progress: `[anim] {N} slides, {M} builds`



**Packaging (BUG-035 G7):** `applyAnimations` writes the archive without directory entries; for any other generated
.pptx/.docx (pptxgenjs before animation, the docx package, the script .docx) run `stripZipDirs(path)` from
`lib/pptx-animate.cjs`. The pptx skill's `apply_theme.js` resolves `pptxgenjs`/`jszip` from ViePilot's install, so run
it with `NODE_PATH="$HOME/.claude/viepilot/node_modules"` (the adapter's ViePilot dir on other hosts).

**File validation (ENH-127):** after `validatePptxAnimations` passes, run the pptx skill's validator on the animated
deck: `python <pptx-skill-dir>/scripts/office/validate.py <deck>.pptx` (add `--original <template>.pptx` when the deck
came from a template). Any failure is fatal (fail-loud) — fix the generator or the timing XML and rebuild. When the
check cannot run, report `checks.pptxFileQA.reason`.

**Gate (output, ENH-124):** AskUserQuestion — show builds per slide and the click-cue check ([click] count = build count). Options: Accept (Recommended) / Fewer builds / Regenerate animations. `recordGate(root, slug, 'animation_hook', 'output', result)`; on accept `recordStep(root, slug, 'animation_hook')`.

---

</step>

<step name="deck_qa">
## Step 6c: Deck QA (ENH-127 — MANDATORY when the pptx skill is available)

Run the pptx skill's three QA passes on the final deck (paths relative to the skill directory found by
`detectDocumentSkills`):
1. **Content QA** — `python scripts/slide_text.py <deck>.pptx`: every manifest slide present, in order, with its
   speaker notes; then grep the output for leftover placeholders (`xxx`, `lorem`, `ipsum`, `TODO`, `[insert`).
2. **File QA** — `python scripts/office/validate.py <deck>.pptx` (`--original` for template-based decks).
3. **Visual QA** — `python scripts/office/soffice.py --headless --convert-to pdf <deck>.pptx`, then
   `pdftoppm -jpeg -r 150 <deck>.pdf slide`; inspect EVERY slide image with fresh eyes (Claude Code: one subagent via the
   Agent tool, given only the images and the skill's defect checklist — overflow first, overlap, margins, contrast,
   alignment, numbers split from units, leftover placeholders). Keep the images in the version folder (`qa/`) — the
   Rehearsal Hall reuses them.
Fix every defect in the generator, rebuild, rerun Step 6b on the rebuilt deck, and re-render only the changed slides.
Checks that cannot run are listed with `checks.<name>.reason` ("skipped — …").

**Gate (output, ENH-124):** AskUserQuestion — show the QA results (defects found / fixed / remaining, skipped checks
with reasons, a few slide images). Options: Accept (Recommended) / Fix the remaining issues / Regenerate / Stop.
`recordGate(root, slug, 'deck_qa', 'output', result)`; on accept `recordStep(root, slug, 'deck_qa')`.

---

</step>

<step name="generate_docx">
## Step 7: Generate .docx

**Claude Code:** load the docx document skill (Skill tool → `anthropic-skills:docx`) and follow its docx-js gotchas;
after writing, run the skill's verification step and report `checks.docxVerify.reason` when it cannot run. Optional: when
the persona council (Step 8b) produces Improve items, add them to the .docx as Word comments with the skill's comment
script so the author sees them in context.

Using `docx` package, consuming **`docxContent`** (from Step 4a) for all narrative paragraphs:

1. Build `Document` with structured sections
2. **Cover page**: title (H1, large), subtitle, prepared-for, date
3. **Body sections** — sourced from `docxContent`:

   | Section | Source | Content |
   |---------|--------|---------|
   | Executive Summary | `docxContent.executiveSummary[]` | Paragraphs rendered as Word body text |
   | Problem & Opportunity | `docxContent.problemStatement[]` | Paragraphs rendered as Word body text |
   | Proposed Solution | `docxContent.solutionNarrative[]` | Paragraphs rendered as Word body text |
   | Technical Approach | `docxContent.technicalNarrative[]` | Paragraph(s); omit section if array is empty |
   | **Project Timeline** | slide manifest `meta` | **Gantt-style table: Phase \| Milestone \| Duration \| Dependencies** |
   | **Investment Estimate** | slide manifest `meta` | **Budget table: Line Item \| Estimate \| Notes** (use meta.budget as header context) |
   | Team & Expertise | slide manifest | Role \| Experience \| Responsibility table |
   | **Risk Register** | `docxContent.riskRegister[]` | **Risk \| Probability \| Impact \| Mitigation table** |
   | **Diagram Reference** | `docxContent.diagrams[]` | **Per diagram: render `mermaidSource` → PNG via `renderMermaidToPng()` → `ImageRun`; fallback: preformatted Mermaid source text when mmdc absent** |
   | Why Choose Us | slide manifest | 2–3 differentiator bullets |
   | Next Steps | slide manifest `meta.cta` | Numbered action list |
   | **Glossary** | `docxContent.glossary[]` | **Term \| Definition table** |
   | Appendix | session file | Full brainstorm session notes (if session loaded) |

4. Timeline table structure:
   ```
   | Phase | Milestone | Duration | Dependencies |
   |-------|-----------|----------|--------------|
   | 1     | Discovery | 2 weeks  | —            |
   | 2     | Design    | 3 weeks  | Phase 1      |
   ```

5. Budget table structure:
   ```
   | Line Item        | Estimate   | Notes              |
   |------------------|------------|--------------------|
   | Discovery & UX   | $X,000     | Fixed fee          |
   | Development      | $XX,000    | Time & materials   |
   | Testing & QA     | $X,000     | Included           |
   | Total            | $XX,000    | {meta.budget}      |
   ```

6. Risk Register table structure (from `docxContent.riskRegister[]`):
   ```
   | Risk | Probability | Impact | Mitigation |
   |------|-------------|--------|------------|
   | {r.risk} | {r.probability} | {r.impact} | {r.mitigation} |
   ```

7. Diagram Reference structure (one block per diagram in `docxContent.diagrams[]`):

   **MANDATORY (ENH-044):** This section MUST be added when `docxContent.diagrams.length > 0` — do not skip.

   - Heading: `{diagram.title} ({diagram.type})`
   - **If `isMmdcAvailable()`**: render `mermaidSource` → PNG via `renderMermaidToPng()` → embed as `ImageRun` in a Paragraph
   - **Fallback** (mmdc absent): emit WARNING + embed preformatted text:
     ```js
     const { warnMissingTool, isMmdcAvailable } = require('./lib/screenshot-artifact.cjs');
     if (!isMmdcAvailable()) {
       warnMissingTool('mmdc', 'npm install -g @mermaid-js/mermaid-cli');
       // Add monospace paragraph with preformatted mermaidSource text (NOT skip)
     }
     ```
   - Cleanup temp PNG immediately after embedding (`cleanupScreenshot()`)

8. Glossary table structure (from `docxContent.glossary[]`):
   ```
   | Term | Definition |
   |------|------------|
   | {g.term} | {g.definition} |
   ```

9. **Visual embedding** (ENH-043/ENH-044 — MANDATORY when artifacts exist):

   **MANDATORY (ENH-044):** When `detectVisualArtifacts()` returns non-empty, visual sections MUST be added to the document — do not skip silently. If puppeteer is absent, emit WARNING and add a placeholder text paragraph instead.

   **Mermaid diagram images** — for each `docxContent.diagrams[]` entry:
   ```js
   const { renderMermaidToPng, isMmdcAvailable, warnMissingTool, cleanupScreenshot } = require('./lib/screenshot-artifact.cjs');
   const tmpPng = path.join(os.tmpdir(), `vp-mmdc-${Date.now()}.png`);
   const rendered = renderMermaidToPng(diagram.mermaidSource, tmpPng);
   if (rendered) {
     const imgRun = imageRunFromPng(rendered);
     if (imgRun) children.push(new Paragraph({ children: [imgRun] }));
     cleanupScreenshot(rendered);
   }
   // Fallback: preformatted mermaid source text already added (step 7, always present)
   ```

   **UI prototype screenshot** — MANDATORY when `artifacts.uiPages.length > 0`:
   ```js
   const { screenshotArtifact, isPuppeteerAvailable, warnMissingTool, cleanupScreenshot } = require('./lib/screenshot-artifact.cjs');
   const artifacts = detectVisualArtifacts();
   if (artifacts.uiPages.length > 0) {
     if (isPuppeteerAvailable()) {
       const tmpPng = await screenshotArtifact(artifacts.uiPages[0]);
       if (tmpPng) {
         const imgRun = imageRunFromPng(tmpPng);
         if (imgRun) executiveSummaryChildren.unshift(
           new Paragraph({ children: [imgRun], spacing: { before: 120, after: 200 } })
         );
         cleanupScreenshot(tmpPng);
       }
     } else {
       warnMissingTool('puppeteer', 'npm install puppeteer');
       // Add placeholder paragraph — do NOT skip the section
       executiveSummaryChildren.unshift(
         new Paragraph({ text: '[UI Prototype screenshot — install puppeteer to embed]', style: 'Caption' })
       );
     }
   }
   ```

   **Architecture screenshot** — MANDATORY when `architecture.html` in `artifacts.architectPages`:
   ```js
   const archHtml = artifacts.architectPages.find(p => p.endsWith('architecture.html'));
   if (archHtml) {
     if (isPuppeteerAvailable()) {
       const tmpPng = await screenshotArtifact(archHtml);
       if (tmpPng) {
         const imgRun = imageRunFromPng(tmpPng);
         if (imgRun) techSectionChildren.push(
           new Paragraph({ children: [imgRun], spacing: { before: 200, after: 120 } })
         );
         cleanupScreenshot(tmpPng);
       }
     } else {
       // warnMissingTool already called above (once per run — not repeated per artifact)
       techSectionChildren.push(
         new Paragraph({ text: '[Architecture diagram screenshot — install puppeteer to embed]', style: 'Caption' })
       );
     }
   }
   ```

   Rule: `warnMissingTool()` is called **once per missing tool per generation run** — not per-diagram or per-artifact.

10. Write to `docs/proposals/{slug}/versions/{version}/{slug}.docx`

Progress: `[docx] Building detailed document...`


**Gate (output, ENH-124):** AskUserQuestion — report the written .docx (path, sections, diagrams embedded or placeholders). Options: Accept (Recommended) / Regenerate / Stop. `recordGate(root, slug, 'generate_docx', 'output', result)`; on accept `recordStep(root, slug, 'generate_docx')`.

---

</step>

<step name="generate_md">
## Step 8: Generate .md Summary

Write a Markdown document combining the slide manifest and `docxContent` diagrams:

```markdown
# {title}

**Type:** {label}  
**Date:** {date}  
**Audience:** {audience}

---

## Slides

### Slide {N}: {heading}

{bullets as - list}

> Script: see [{slug}-{date}-script.md]({slug}-{date}-script.md) (5 / 15 / 30 min versions available)

---

## Diagrams

For each entry in `docxContent.diagrams[]`, emit a fenced Mermaid code block:

### {diagram.title}

```{diagram.type}
{diagram.mermaidSource}
```

_(repeat for each diagram)_
```

- Mermaid fences use the diagram type as the language identifier (e.g. ` ```flowchart `, ` ```sequenceDiagram `)
- Diagrams section is omitted if `docxContent.diagrams` is empty or unavailable

Write to `docs/proposals/{slug}/versions/{version}/{slug}.md`


**Gate (output, ENH-124):** AskUserQuestion — report the written .md summary (path, sections). Options: Accept (Recommended) / Regenerate. `recordGate(root, slug, 'generate_md', 'output', result)`; on accept `recordStep(root, slug, 'generate_md')`.

---

</step>

<step name="persona_review_council">
## Step 8b: Persona Review Council

Always-on final quality step. A council of 20 reviewer personas (library: `templates/proposal/review-personas.md`, logic: `lib/proposal-review.cjs`) scores the generated package against the rubric. Persona 20 ("Humanity editor") is locked and always runs.

### Flag: `--review off|quick|full`
- `quick` (default): the persona set from `selectPersonas({type, variant, audience, decisionMaker, audienceProfile, mode:'quick'})`.
- `full`: the full council (`mode:'full'`).
- `off`: skip the council but STILL run persona 20 only (`mode:'off'`). The humanity check is never skipped.

### 1. Select personas
```js
const pr = require('../lib/proposal-review.cjs');
const { reviewers: ids, observers } = pr.selectCouncil({ type, variant, audience, decisionMaker, audienceProfile, mode, add, remove });
// observers = [31] Backstage Editor: runs in every council (all modes), never counted among the reviewers; its
// findings update backstage.md and it raises `material-risk-hidden` / `process-log-instead-of-proposal` blockers.
```
Use the type-aware rubric and blockers: `pr.getRubric(type)` and `pr.getBlockers(type)`. For `research-proposal` they add R1 Novelty & contribution, R2 Methodological rigor, R3 Feasibility & reproducibility and the blocker "unsupported scientific claim / key claim without citation"; `pr.evaluateGate(reviews, { type })` applies them. Other types keep the original rubric.

Optional AskUserQuestion (skipped with `--review off`): show the selected personas and offer accept / add / remove. Persona 20 is locked and cannot be removed. Claude Code preloads AskUserQuestion via ToolSearch `select:AskUserQuestion` (ENH-059); other adapters use a numbered text fallback.

### 2. Run reviews (independent, parallel)
Fill `templates/proposal/persona-review-prompt.md` per persona (`{persona_card}`, `{rubric}`, `{voice_level}`, `{manifest_json}`, `{script_md}`, `{lang}`).
- **Claude Code:** spawn one `Agent` (general-purpose) per persona, all in parallel in one message. Each agent receives ONLY its own persona card + rubric + manifest + script. NEVER pass any other persona's output (independence).
- **Text-only adapters (no subagents):** run the personas sequentially in-thread, and tell the user that reviews ran sequentially in a single thread, so independence is weaker. Reset context per persona: do not reference earlier reviews.

### 3. Parse and gate
```js
const reviews = raw.map(r => pr.parseReview(r).review);   // pass .review onward; log dropped items
const gate = pr.evaluateGate(reviews);                    // {pass, perCriterion, blockers, failing}
```
Gate pass: write the report (step 7) and continue.

### 4. Fail: synthesize and rewrite (max 2 rounds)
```js
const fb = pr.synthesizeFeedback(reviews, { primaryPersonaIds });  // {keep, improve, reject}
```
- Rewrite ONLY the slides / notes / script lines listed under Improve. Keep slides stay verbatim. Reject items are not applied.
- **Conflict rule:** when the same slide + criterion appears in both Keep and Improve, and the Improve comes from persona 20 on H1/H2, the humanity veto wins: rewrite that slide and record the Keep as "overridden by humanity veto" in the report.
- After a rewrite, re-run Step 6 (notes), Step 6b (animation) and Step 4b (script) for the changed slides only, then re-review (back to step 2).
- Maximum **2 rounds** of rewrite + re-review.

### 5. Still failing after round 2
AskUserQuestion with the scoreboard (`perCriterion`) and the top issues. Options:
- Accept current version
- Run one more round
- I'll give feedback directly
- Provide more real material (go back to Step 3d Story Brief, then regenerate)

### 6. Final humanity check (always)
AskUserQuestion on the slide with the lowest H1 score: "Read slide {X} aloud. Does it sound like you?" Options:
- Sounds like me
- Needs more pride
- Needs more humility
- I'll edit directly

A "more pride / more humility" answer rewrites that slide's notes and script lines with the adjusted voice level (evidence rules from Step 3c still apply).

### 7. Write review report
```js
const md = pr.buildReviewReport({ rounds, decisions, gate });
// -> docs/proposals/{slug}/versions/{version}/{slug}-review.md
```
List the file in the Step 10 banner.

---

</step>

<step name="google_slides_upload">
## Step 9: Optional Google Slides Upload (`--slides`)

```js
const { uploadToSlides } = require('../lib/google-slides-exporter.cjs');
try {
  const url = await uploadToSlides(pptxPath, title);
  fs.writeFileSync(slidesUrlPath, url);
  console.log(`[slides] ${url}`);
} catch (err) {
  console.warn(`[slides] Upload failed: ${err.message}`);
  // Files already written — non-fatal
}
```

Prerequisites (shown if auth fails):
- `npm install @googleapis/slides`
- Create service account → download JSON key
- `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`


**Gate (input, ENH-124):** AskUserQuestion — ask whether to upload now and to which account (only when `--slides` is set or credentials are present). Options: Upload (Recommended) / Skip upload. Skip the question only when `--slides` or `--yes` supplies the answer, and say so. `recordGate(root, slug, 'google_slides_upload', 'input', result)`; on accept `recordStep(root, slug, 'google_slides_upload')`.

**Gate (output, ENH-124):** AskUserQuestion — show the Google Slides URL or the setup guidance when the upload could not run. Options: Accept (Recommended) / Retry / Skip. `recordGate(root, slug, 'google_slides_upload', 'output', result)`; on accept `recordStep(root, slug, 'google_slides_upload')`.

---

</step>

<step name="confirm_output">
## Step 10: Confirm Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► PROPOSAL GENERATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Type:    {label}  ({N} slides)
 Context: {session file or "direct brief"}
 Animation: ✓ {N} slides, {M} builds

 Files:
   docs/proposals/{slug}/versions/{version}/{slug}.md    ({size})
   docs/proposals/{slug}/versions/{version}/{slug}.pptx  ({size})
   docs/proposals/{slug}/versions/{version}/{slug}.docx  ({size})
   docs/proposals/{slug}/versions/{version}/{slug}-script.md        (default duration)
   docs/proposals/{slug}/versions/{version}/{slug}-script-5min.md
   docs/proposals/{slug}/versions/{version}/{slug}-script-30min.md
   docs/proposals/{slug}/versions/{version}/{slug}-script.docx
   docs/proposals/{slug}/versions/{version}/{slug}-review.md        (persona review report)
   [docs/proposals/{slug}/versions/{version}/{slug}-slides.txt]

 Next:
   Open .pptx in PowerPoint / Keynote / LibreOffice Impress
   Share .docx as supporting document
   /vp-proposal --slides   to upload to Google Slides
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update MRU config:
```js
recordProposalLang(lang)  // → update ~/.viepilot/config.json proposal.recentLangs
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Unknown `--type` | Show valid types list; ask user to select |
| `--from` file not found | Show path; ask to continue with auto-detect |
| Stock template missing (not yet generated) | Warn; use pptxgenjs programmatic fallback |
| `@googleapis/slides` not installed | Clear install instructions; continue without upload |
| `GOOGLE_APPLICATION_CREDENTIALS` not set | Clear setup guide; continue without upload |
| `docs/proposals/` write error | Show path and permission error; stop |
| Unknown `--variant` | Show valid variants for type; ask user to select |


**Completeness check (BUG-035 G2):** before this gate run `missingArtifacts(root, slug, version)` from
`lib/proposal-store.cjs` (pptx, docx, md, the three scripts, `-script.docx`, review, backstage, outline, manifest).
Generate anything missing first; list what is still missing in the gate question.

**Consistency and placeholders (BUG-035 G6):** run `checkConsistency(manifest, [{ name: 'backstage', text }])` and
`findPlaceholders(manifest)` from `lib/proposal-curation.cjs`. Fix contradictions (e.g. "before the session" on the
slide vs "after the session" in the notes) before the gate. Remaining placeholders (`[fill in name + channel]`) are
listed in the gate question and Accept becomes "Accept with N placeholders"; never auto-accept them under `--yes`.

**Gate (output, ENH-124):** AskUserQuestion — the package is complete: Accept this version (Recommended) / Iterate on something (Step 11) / Run the Rehearsal Hall (Step 10b) / Stop. On accept: `writeProvenance(..., { seal: true, gatesPassed })`, `setCurrentVersion(...)`, `finishSession(...)`; `recordGate(root, slug, 'confirm_output', 'output', result)`. Gate records keep every kind per step (`gates[step].byKind.input` / `.output`).

---

</step>

<step name="rehearsal_hall">
## Step 10b: Rehearsal Hall (ENH-121)

Offered at the end of every run and re-runnable later with `/vp-proposal --simulate <docs/proposals/{slug}>` (uses the
current version; options `--duration 5|15|30`, `--hall all`, `--add <ids>`, `--remove <ids>`).

**Gate (input, ENH-124):** AskUserQuestion — "Rehearse this deck in a simulated hall?" Options: Run the rehearsal
(Recommended) / Choose who sits in the hall / Skip. `recordGate(root, slug, 'rehearsal_hall', 'input', result)`.

1. `buildTimeline(manifest, { durationMin, lang })` from `lib/proposal-simulation.cjs` (speaking rate vi 150 / en 140 wpm,
   `[click]` cues, pauses) and `slideLoad` per slide.
2. `selectHall({ type, variant, audienceProfile: resolveAudienceProfile({ manifest, session }), hall, add, remove })` → 12–16 listeners by default (`--hall all` = every
   reviewer persona), #20 always present, primary-audience personas weighted ×2; #31 observes. For an
   internal-presentation only personas who can be in the room are seated (`isEligible`: investor, procurement,
   existing customer, journalist and CFO need a matching audience role); `short: true` means fewer than 12 fit —
   say so in the input gate instead of padding with outsiders.
3. **Listeners (Claude Code):** one subagent per listener via the Agent tool, all in parallel, each given only
   `templates/proposal/simulation/listener-prompt.md` filled with its own persona card, the audience context, the
   timeline JSON and the Deck QA slide images when they exist. Text-only adapters run listeners sequentially and say so.
4. `parseListener(json, timeline)` for each answer — negative reactions without a quote from their segment are dropped.
5. `aggregate({ timeline, listeners, manifest, primary, keyMessages, keywords, previous })` from
   `lib/proposal-sim-aggregate.cjs`; `previous` = the latest earlier run's `data.json` for run-over-run deltas.
6. `writeRun(versionPaths(...).simulationDir, { agg, timeline, listeners, hall, meta })` from `lib/proposal-sim-report.cjs`,
   then `refreshProvenance(root, slug, version)` so the run's files are hashed with the sealed version. Output:
   `simulation/run-{n}/report.html` (self-contained, opens offline, 3D hall replay with a 2D fallback),
   `summary.md`, `data.json` — every page labelled "AI simulation — not real audience data". When the installed
   ViePilot has no `three` package, the report shows the 2D hall only.

**Gate (output, ENH-124):** AskUserQuestion — headline results (retention, tune-outs, would-act %, key-message recall,
top 3 improvements) and the report path. Options: Iterate on the top improvements (Recommended — Step 11) / Open the
report / Run again with another hall / Done. `recordGate(root, slug, 'rehearsal_hall', 'output', result)`.

---

</step>

<step name="iterate">
## Step 11: Iterate (ENH-124)

Every follow-up request about this proposal — "slide 3 is too long", "make it more humble", "add a pricing slide" —
comes here instead of being handled ad hoc.

1. **Input gate** — AskUserQuestion restating the request and its scope: Apply to these slides (Recommended) /
   Apply to the whole deck / Cancel.
2. Classify the change and list the invalidated steps (content → manifest_generation, spoken_script, animation_hook,
   generate_*; voice → voice_profile + everything after; audience → audience_intake + type_selection + persona
   council; template → generate_pptx).
3. Create a new version (`newVersion`) and rerun only the invalidated steps, each with its own gates.
4. **Output gate** — AskUserQuestion with a diff summary (`vp-tools proposal diff <slug>`): Accept (Recommended) /
   Change more / Revert to the previous version. On accept: `writeProvenance`, `setCurrentVersion`.

`recordGate(root, slug, 'iterate', 'input'|'output', result)` for both gates.

---

</step>

</process>

<success_criteria>
- [ ] Purpose consult step precedes audience intake, which precedes type selection
- [ ] Audience intake asks only findIntakeGaps groups via one AskUserQuestion (≤4 questions)
- [ ] Type recommendation via recommendProposalType; user confirms or shows all types menu
- [ ] Internal and research variants documented with skeletons; all 10 variants listed
- [ ] Step 8b passes variant and audienceProfile to selectPersonas
- [ ] Manifest example includes variant and audienceProfile fields
- [ ] Manifest generated with correct structure; `designConfig` field present
- [ ] Error table includes unknown --variant row
- [ ] SKILL.md 0.4.0 documents --type internal-presentation|research-proposal, --variant, --purpose, --audience
- [ ] No Vietnamese text in workflow/SKILL (enh031 test passes)</success_criteria>
