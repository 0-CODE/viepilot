# research-agent

## Purpose
Perform WebSearch + WebFetch + summarize for feasibility studies, technology research,
and external dependency lookup. Runs in an isolated context so search results don't
pollute the main skill conversation. Returns a structured summary with findings and
source URLs that the calling skill can embed directly into request files or brainstorm
sessions.

## Inputs
- `topic`: research topic (e.g. "GitHub Copilot Extensions API third-party integration")
- `questions`: list of specific questions to answer (e.g. ["What SDK exists?", "What config dir?"])
- `allowed_domains` (optional): restrict search to specific domains
- `output_format`: `summary` (default) | `bullet-list` | `markdown-section`

## Outputs
- Structured findings matching `output_format`
- `## Research Findings` section ready to paste into a request `.md`
- `## Sources` list of URLs with titles

## Invocation Pattern

### Claude Code (terminal)
```
Agent({
  subagent_type: "general-purpose",
  description: "Research: {topic}",
  prompt: `
    You are research-agent. Perform web research on this topic:
    Topic: {topic}
    Questions to answer:
    {questions}

    Use WebSearch and WebFetch tools. Return findings as:
    ## Research Findings
    ### Feasibility: ✅/⚠️/❌ [HIGH/MEDIUM/LOW]
    {structured findings per question}

    ## Sources
    - [Title](URL)
    ...

    Be concise. Focus on actionable technical facts.
  `
})
```

### Cursor / Codex / Antigravity
If web search tools available: perform inline research and return findings.
If unavailable: inform the user that manual research is needed for this topic.

## Adapter Behavior
| Adapter | Behavior |
|---------|----------|
| Claude Code | Spawns research subagent with WebSearch + WebFetch access |
| Cursor | Inline web search if available; else text instruction |
| Codex | Inline web search if available; else text instruction |
| Antigravity | Inline web search if available; else text instruction |

## Notes
- Always include a `## Sources` section — required for research integrity
- Feasibility rating: ✅ HIGH / ⚠️ MEDIUM / ❌ LOW with brief rationale
- Trigger automatically in `request.md` Step 1B when request involves new platform/API
- Do not make assumptions about APIs — search first, then summarize
