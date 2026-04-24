# Task 108.3 — Domain Packs: 5 JSON files + brainstorm.md injection + install-domain subcommand

## Objective
Create 5 built-in domain pack JSON files under `lib/domain-packs/`. Extend
`workflows/brainstorm.md` with domain pack topic injection (reads active persona → injects
domain-specific topics + reorders by `topic_priority` + hides `topic_skip` topics).
Add `install-domain` subcommand to `bin/viepilot.cjs` for community packs.

## Paths
```
lib/domain-packs/web-saas.json        ← new
lib/domain-packs/data-science.json    ← new
lib/domain-packs/mobile.json          ← new
lib/domain-packs/devops.json          ← new
lib/domain-packs/ai-product.json      ← new
workflows/brainstorm.md               ← extend: persona domain pack injection
bin/viepilot.cjs                      ← extend: install-domain subcommand
```

## File-Level Plan

### Domain Pack JSON schema (all 5 follow same shape)
```json
{
  "id": "web-saas",
  "label": "Web SaaS",
  "topic_priority": ["auth", "user-data", "api", "billing", "admin", "onboarding"],
  "extra_topics": [
    { "id": "billing", "label": "Billing & Subscriptions", "questions": ["Payment provider?", "Pricing model?", "Trial/freemium?"] },
    { "id": "multi-tenant", "label": "Multi-tenancy", "questions": ["Tenant isolation strategy?", "Shared DB vs schema-per-tenant?"] },
    { "id": "onboarding", "label": "User Onboarding", "questions": ["Onboarding flow steps?", "Email verification?", "Guided setup?"] }
  ],
  "phase_template": {
    "name": "lean-startup",
    "phases": ["Auth & Identity", "Core Features", "Monetization", "Scale & Ops"]
  },
  "architect_pages": ["billing.html", "tenant.html"],
  "stacks_hint": ["nextjs", "nestjs", "postgresql", "stripe", "redis"]
}
```

**5 files to create:**
1. `web-saas.json` — extra_topics: Billing, Multi-tenant, Trial/freemium, Onboarding; phases: Auth→Core→Monetize→Scale; pages: billing.html, tenant.html
2. `data-science.json` — extra_topics: Dataset mgmt, Model versioning, Drift monitoring, Eval pipeline; phases: Data→EDA→Train→Serve→Monitor; pages: ml-pipeline.html, data-lineage.html
3. `mobile.json` — extra_topics: Push notifications, Offline sync, App store submission, Deep links; phases: Auth→Core→Offline→Submit; pages: mobile-flow.html, push.html
4. `devops.json` — extra_topics: IaC, CI/CD pipeline, SLO/SLA, Incident management; phases: Infra→CI/CD→Observe→Runbooks; pages: infra-topology.html, slo.html
5. `ai-product.json` — extra_topics: LLM integration, RAG pipeline, Prompt management, Eval/feedback loop; phases: Wrapper→Prompt→RAG→Eval→UX; pages: llm-arch.html, rag-flow.html

### `workflows/brainstorm.md` — domain pack injection

Add section **"Persona Domain Pack Integration (ENH-073)"** after existing topic template setup:

```markdown
## Persona Domain Pack Integration (ENH-073)

At session start, before presenting topics:
1. Run: `node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context`
   → reads resolved persona for $PWD
2. Load domain pack from `lib/domain-packs/{persona.domain}.json`
   (if domain is array from merge, load all and union)
3. Apply to topic list:
   - Prepend extra_topics not already in template
   - Reorder template topics by topic_priority (matched topics float to top)
   - Remove topics in persona.brainstorm.topic_skip
4. Suggest phase_template from domain pack when discussing phases
5. Suggest architect_pages from domain pack when entering Architect Design Mode
6. If persona.confidence < 0.6: show inline note "(auto-detected, may be inaccurate)"
   — not a blocking prompt, just context annotation
```

### `bin/viepilot.cjs` — `install-domain` subcommand

Add `install-domain <pack-name>` handler:
1. `npm install viepilot-domain-{pack-name}` in viepilot package root
2. Look for `domain-pack.json` in installed package
3. Copy to `lib/domain-packs/{pack-name}.json`
4. Print: `Domain pack '{pack-name}' installed.`
5. Silently fail with message on npm error

## Verification
```bash
node -e "console.log(require('./lib/domain-packs/web-saas.json').extra_topics.map(t=>t.id))"
# → ['billing', 'multi-tenant', 'onboarding']

node -e "console.log(require('./lib/domain-packs/ai-product.json').phase_template.phases)"
# → ['Wrapper', 'Prompt', 'RAG', 'Eval', 'UX']

grep -c "Persona Domain Pack Integration" workflows/brainstorm.md
# → ≥ 1
```
