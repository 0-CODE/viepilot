# Interactive Prompts (AskUserQuestion)

> **ENH-048** — Introduced in v2.15.0

ViePilot skills that ask user questions now use **adapter-aware interactive prompts**.
In Claude Code (terminal), questions appear as structured click-to-select UI.
All other adapters fall back to plain-text numbered lists automatically.

---

## How It Works

When a vp-* skill needs input (e.g. "What type of request?"), it checks whether
the `AskUserQuestion` tool is available in the current adapter:

| Adapter | Experience |
|---------|------------|
| **Claude Code (terminal)** | Click-to-select options with descriptions, optional multi-select, preview panels |
| **Claude Code (VS Code ext)** | Terminal mode — same as above (VS Code interactive UI pending [#12609](https://github.com/anthropics/claude-code/issues/12609)) |
| **Cursor — Plan Mode** | `AskQuestion` available in Plan Mode only |
| **Cursor — Agent/Skills** | Text fallback (AskQuestion not in Agent Mode) |
| **Codex CLI** | Text fallback (native tool N/A) |
| **Antigravity native** | Text fallback (Artifact model, no raw tool calls) |

No configuration needed. The fallback is automatic.

---

## Affected Skills and Prompts

### /vp-crystallize
| Prompt | AUQ Options |
|--------|-------------|
| License selection | MIT / Apache-2.0 / GPL-3.0 / Proprietary |
| Brownfield overwrite confirm | Yes, continue / No, abort |
| Polyrepo related-repos | Yes, I'll list them / Skip for now |
| UI direction gate | Return to brainstorm / Continue with assumptions |
| Architect mode suggestion | Yes, architect mode / No, continue now |

### /vp-brainstorm
| Prompt | AUQ Options |
|--------|-------------|
| Session intent | Continue recent / Review specific / New session |
| Landing page layout | Layout A (Hero) / Layout B (Problem-Solution) / Layout C (Storytelling) / Layout D (SaaS) |

### /vp-request
| Prompt | AUQ Options |
|--------|-------------|
| Request type | Bug / Feature / Enhancement / Tech Debt |
| Bug severity | Critical / High / Medium / Low |
| Feature priority | Must-have / Should-have / Nice-to-have |

### /vp-evolve
| Prompt | AUQ Options |
|--------|-------------|
| Evolve intent | Add Feature / New Milestone / Refactor |
| Complexity | S (Small) / M (Medium) / L (Large) / XL (Extra Large) |
| Brainstorm routing | Yes, brainstorm first / No, plan directly |

---

## AskUserQuestion Tool Constraints

The `AskUserQuestion` tool has a strict JSON schema. Violating any constraint causes
`InputValidationError: invalid parameter` and the prompt silently fails.

| Field | Rule |
|-------|------|
| `questions` | Array, 1–4 items |
| `question` | String, full sentence ending in `?` |
| `header` | String, **≤ 12 characters** — chip label shown above options |
| `multiSelect` | Boolean, required (default: false) |
| `options` | Array, **2–4 items** (UI appends an automatic "Other" option) |
| `options[].label` | String, 1–5 words |
| `options[].description` | String, 1–2 sentences — **required** |
| `options[].preview` | String, optional — only valid when `multiSelect: false` |

---

## Correct Call Template

Copy-paste ready — all fields shown with annotations:

```javascript
{
  questions: [
    {
      question: "Which approach should we use?",  // full sentence ending with ?
      header: "Approach",                          // ≤12 chars — REQUIRED, chip label
      multiSelect: false,                          // bool — REQUIRED
      options: [                                   // 2–4 items
        {
          label: "Option A",                       // 1–5 words
          description: "Explain the tradeoff.",    // 1–2 sentences — REQUIRED
          // preview: "optional markdown block"    // single-select only
        },
        {
          label: "Option B",
          description: "Another tradeoff.",
        }
        // add up to 2 more options (max 4 total)
      ]
    }
    // add up to 3 more questions (max 4 total)
  ]
}
```

---

## Anti-Patterns (Common Failures)

| Pattern | Bad ❌ | Good ✅ | Error |
|---------|--------|---------|-------|
| `header` >12 chars | `"Brownfield Mode"` (15) | `"Brownfield"` (10) | `InputValidationError` |
| `header` >12 chars | `"Admin & Governance"` (18) | `"Admin"` (5) | `InputValidationError` |
| <2 options | `options: [{label:"A",description:"..."}]` | add a second option | `InputValidationError` |
| >4 options | 5 options in one call | split or rephrase to ≤4 | `InputValidationError` |
| missing `description` | `{label: "MIT"}` | `{label: "MIT", description: "Permissive open-source."}` | `InputValidationError` |
| `preview` + multiSelect | `multiSelect: true, preview: "..."` | previews only work with `multiSelect: false` | `InputValidationError` |
| >4 questions per call | 5 questions | split into 2 `AskUserQuestion` calls | `InputValidationError` |
| no ToolSearch preload | call AUQ before ToolSearch | call ToolSearch first at session start | `Tool not found` |

---

## Research Notes (Adapter Support)

Research conducted 2026-04-13 confirmed:

- **Cursor Agent/Skills Mode** does not expose `AskQuestion` — it only works in Plan Mode
  ([community request](https://forum.cursor.com/t/allow-askquestion-tool-calls-in-agent-mode-or-any-mode/152517))
- **Codex CLI** `ask_user_question` is a community MCP skill, not a native tool
  ([openai/codex#9926](https://github.com/openai/codex/issues/9926))
- **Antigravity** uses an "Artifacts" model for agent output — no raw tool execution for interactive UI

All non-Claude-Code adapters receive identical plain-text prompts as before ENH-048.
