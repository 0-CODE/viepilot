# Task 73.2 — workflows/proposal.md: Step 4c + Step 7 mandatory enforcement

## Objective
Update `workflows/proposal.md` Steps 4c and 7 to enforce mandatory visual embedding when artifacts exist. Silent skip must be replaced with explicit WARNING emission + fallback action.

## Paths
- workflows/proposal.md

## File-Level Plan

### Step 4c — Mandatory visualSlides population

**Current behavior (optional/conditional):**
```
If detectVisualArtifacts() → empty → skip (log, continue)
If puppeteer absent → skip visual slides
```

**New behavior (mandatory enforcement):**
```
Call detectVisualArtifacts() — ALWAYS.
If result is non-empty:
  - visualSlides[] MUST be populated (not empty)
  - If isPuppeteerAvailable() → screenshotArtifact() → addImage()
  - If puppeteer absent → warnMissingTool('puppeteer', 'npm install puppeteer')
                         → addPlaceholderVisual() for each artifact
  - visualSlides[] CANNOT be empty when artifacts exist
```

**Language to add/replace in Step 4c:**
- Replace "optional embedding" / "when available" with "MANDATORY when artifacts exist"
- Add WARNING block showing warnMissingTool() call site
- Document that placeholder slides count as valid visualSlides entries
- Remove any "skip if absent" language

### Step 7 — Mandatory Mermaid + ui/arch sections in docx

**Current behavior (optional/conditional):**
```
If mmdc absent → keep preformatted text (no WARNING)
If puppeteer absent → skip ui/arch screenshots (no WARNING)
```

**New behavior (mandatory enforcement):**
```
diagrams[] non-empty:
  - Attempt renderMermaidToPng() — always
  - If isMmdcAvailable() → renderMermaidToPng() → embed PNG image
  - If mmdc absent → warnMissingTool('mmdc', 'npm install -g @mermaid-js/mermaid-cli')
                   → embed preformatted text block (fallback — NOT skip)

detectVisualArtifacts() non-empty:
  - Attempt screenshotArtifact() — always
  - If isPuppeteerAvailable() → screenshot → ImageRun
  - If puppeteer absent → warnMissingTool('puppeteer', 'npm install puppeteer')
                        → embed placeholder text paragraph (fallback — NOT skip)

Both warnings allowed in same run — not mutually exclusive.
```

**Language to add/replace in Step 7:**
- Add mandatory enforcement note: "section MUST be added when diagrams exist OR artifacts exist"
- Add WARNING subsection for mmdc absent case with warnMissingTool() call site
- Add WARNING subsection for puppeteer absent case with warnMissingTool() call site
- Replace any "if available" / "skip" language with "fallback to text/placeholder"

## Best Practices
- Use `warnMissingTool()` (from Task 73.1) — do NOT add raw `process.stderr.write()` calls in workflow doc
- One call per missing tool per generation run (not per-diagram/per-artifact)
- Both steps must make clear: fallback (placeholder/text) is acceptable; silence is not

## Verification
```bash
grep -n "warnMissingTool\|mandatory\|MANDATORY\|WARNING" workflows/proposal.md
# Should show hits in Step 4c and Step 7

grep -n "skip\|optional\|when available" workflows/proposal.md | grep -i "visual\|puppeteer\|mmdc"
# Should return empty (no silent-skip language remaining in visual sections)
```

## Acceptance Criteria
- [ ] Step 4c: language says `visualSlides[]` MUST be non-empty when artifacts exist
- [ ] Step 4c: puppeteer-absent path calls `warnMissingTool()` + `addPlaceholderVisual()`
- [ ] Step 7: Mermaid section MUST be added when `diagrams.length > 0` (PNG or text fallback)
- [ ] Step 7: mmdc-absent path calls `warnMissingTool('mmdc', ...)`
- [ ] Step 7: puppeteer-absent path calls `warnMissingTool('puppeteer', ...)`
- [ ] No "silent skip" language remains in visual embedding sections
