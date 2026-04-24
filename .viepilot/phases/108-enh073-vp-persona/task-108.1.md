# Task 108.1 — `lib/viepilot-persona.cjs`: inferPersona + resolvePersona + persona-context.md

## Objective
Create the core persona library. `inferPersona(projectDir)` reads project files + git history and
returns a full persona JSON with confidence score. `resolvePersona(projectDir)` implements 3-layer
resolution (project-override > context-map > global). `generatePersonaContext(persona)` writes
`persona-context.md` string. All operations are silent on error.

## Paths
```
lib/viepilot-persona.cjs          ← new file
```

## File-Level Plan

### `lib/viepilot-persona.cjs`

**Exports:**
```js
module.exports = {
  inferPersona,          // (projectDir) → persona JSON + confidence
  resolvePersona,        // (projectDir, opts) → resolved persona JSON
  mergePersonas,         // (personaA, personaB) → hybrid persona
  generatePersonaContext,// (persona) → markdown string
  readActivePersona,     // () → persona JSON or null
  writePersona,          // (name, persona) → void (saves to ~/.viepilot/personas/{name}.json)
  setActivePersona,      // (name) → void (writes ~/.viepilot/persona.json)
  listPersonas,          // () → [{ name, path, active }]
};
```

**`inferPersona(projectDir)`:**
1. Detect domain from file signals:
   - `package.json` + `prisma/` → `web-saas`, confidence +0.4 each
   - `CMakeLists.txt` + `sdkconfig` → `embedded`, confidence +0.4 each
   - `requirements.txt` + `notebooks/` → `data-science`, confidence +0.4 each
   - `pubspec.yaml` OR `*.xcodeproj` → `mobile`, confidence +0.5
   - `Dockerfile` + `terraform/` → `devops`, confidence +0.4 each
   - `pyproject.toml` + `langchain` in deps → `ai-product`, confidence +0.4 each
2. Infer `stacks` from deps: parse `package.json#dependencies`, `requirements.txt`, `CMakeLists.txt`
3. Infer `team_size` via `git shortlog -sn --no-merges | wc -l` (silent on error → `unknown`):
   - 1 → `solo`, 2–5 → `small`, 6+ → `team`
4. Infer `role` from majority file extension in git: `.ts`/`.tsx`/`.jsx` → frontend; `.go`/`.py`/`.rs`/`.c`/`.cpp` → backend; mix → fullstack; `.ino`/`.c`+`CMake` → embedded
5. Default `output_style: lean`, `phase_template` from domain pack default
6. When 2+ domains detected with confidence ≥ 0.35 each → `mergePersonas()` the top two
7. Return `{ name: 'auto-{domain}', source: 'auto', domain, role, stacks, team_size, output_style, phase_template, brainstorm: { topic_priority, topic_skip }, confidence, inferred_at }`
8. Clamp confidence to [0, 1.0]
9. Silent on all errors → return `{ name: 'auto-generic', domain: 'generic', confidence: 0, source: 'auto' }`

**`resolvePersona(projectDir, opts = {})`:**
1. Check `.viepilot/persona-override.json` in projectDir → return if exists
2. Check `~/.viepilot/context-map.json` for longest matching path prefix → return if found
3. Read `~/.viepilot/persona.json` active pointer → load personas/{name}.json → return if found
4. Fallback: run `inferPersona(projectDir)` → write to personas/auto-{domain}.json → set active → return
5. Silent on all errors at every step

**`mergePersonas(a, b)`:**
- `name`: `merge-{a.domain}-{b.domain}`
- `domain`: `[a.domain, b.domain]` (array)
- `stacks`: union of a.stacks + b.stacks (dedup)
- `topic_priority`: union of both domain packs' topic_priority
- `phase_template`: `hybrid-${a.domain}-${b.domain}`
- `confidence`: min(a.confidence, b.confidence)
- `source`: `merge`

**`generatePersonaContext(persona)`:**
Returns markdown string:
```
## User Persona
- Role: {role}
- Domain: {domain}
- Preferred stacks: {stacks.join(' / ')}
- Output style: {output_style}
- Phase template: {phase_template}
- Team size: {team_size}
```

## Best Practices
- All file reads wrapped in try/catch → silent fail
- `execSync` for git with `{ cwd: projectDir, stdio: 'pipe', timeout: 3000 }` → silent on error
- All writes atomic: write temp → rename (or direct write with try/catch)
- `os.homedir()` for `~/.viepilot/` paths (no string `~` expansion)
- No external npm deps — Node.js built-ins only (`fs`, `os`, `path`, `child_process`)
- `JSON.parse` always wrapped in try/catch

## Verification
```bash
node -e "const p = require('./lib/viepilot-persona.cjs'); console.log(Object.keys(p))"
# → inferPersona, resolvePersona, mergePersonas, generatePersonaContext, readActivePersona, writePersona, setActivePersona, listPersonas

node -e "
const { inferPersona } = require('./lib/viepilot-persona.cjs');
inferPersona(process.cwd()).then(r => console.log(r.domain, r.confidence));
"
# → web-saas 0.4 (or similar from this repo's signals)

node -e "
const { generatePersonaContext } = require('./lib/viepilot-persona.cjs');
console.log(generatePersonaContext({ role:'full-stack', domain:'web-saas', stacks:['nextjs','postgresql'], output_style:'lean', phase_template:'lean-startup', team_size:'solo' }));
"
# → ## User Persona block
```

## Implementation Notes
- `inferPersona` must be async (file reads + git exec)
- Domain signal scoring: sum scores per domain, pick highest; secondary domain if score ≥ 0.35 triggers merge
- `stacks` parsing: `package.json` deps keys → match known stack names list (nextjs, nestjs, express, prisma, postgresql, mysql, redis, stripe, tailwind, react, vue, angular); requirements.txt lines → match (fastapi, django, flask, langchain, pytorch, tensorflow, pandas); CMakeLists: `target_link_libraries` or `find_package` calls
