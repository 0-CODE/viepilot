<purpose>
Curate, classify, and store reusable UI components for future brainstorm and implementation.
</purpose>

<process>

<step name="prepare_store">
## 1. Prepare Component Stores

Ensure both stores exist:

```bash
mkdir -p "$HOME/.viepilot/ui-components"
mkdir -p ".viepilot/ui-components"
```

Use:
- Global store (`$HOME/.viepilot/ui-components`) for cross-project reuse
- Local store (`.viepilot/ui-components`) for project-specific variants
</step>

<step name="collect_input">
## 2. Collect Source Input

Accept sources:
- 21st.dev prompt/link/snippet
- Existing component markup
- User-written constraints and style notes

Capture metadata:
- source
- intent
- target contexts (landing, dashboard, form, etc.)
</step>

<step name="classify_component">
## 3. Classify and Normalize

Classify component under one of:
- base
- navigation
- marketing
- form
- feedback
- data-display
- composite

Normalize naming:
- kebab-case component id
- minimal README with usage and constraints
- keep "raw inspiration" and "adapted draft" clearly separated
</step>

<step name="write_artifacts">
## 4. Write Artifacts

For each component, create:

```text
{store}/{category}/{component-id}/
  README.md
  SOURCE.md
  component.html
  component.css
  metadata.json
```

`metadata.json` minimum fields:
- `id`
- `category`
- `source`
- `tags`
- `stack_notes`
- `status` (`raw` | `adapted` | `approved`)
</step>

<step name="sync_index">
## 5. Update Index

Update:
- `$HOME/.viepilot/ui-components/INDEX.md`
- `.viepilot/ui-components/INDEX.md`

Each entry includes:
- component id
- category
- status
- source link/reference
- last updated date
</step>

<step name="integration_notes">
## 6. Integration with Brainstorm/Crystallize

When relevant:
- Recommend curated components during `/vp-brainstorm --ui`
- Reference selected component IDs in brainstorm session files
- Ensure `/vp-crystallize` can map selected IDs to implementation decisions
</step>

</process>

<success_criteria>
- [ ] Global and local stores exist
- [ ] Component classified with consistent taxonomy
- [ ] README + SOURCE + metadata created
- [ ] Global/local indexes updated
- [ ] Component is reusable in future UI direction sessions
</success_criteria>
