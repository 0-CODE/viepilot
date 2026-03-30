# ViePilot Examples

Three example projects showing ViePilot in different contexts.

| Example | Stack | Complexity | Shows |
|---------|-------|------------|-------|
| [web-app](./web-app/) | Next.js, SQLite | Medium | Frontend + API + DB |
| [api-service](./api-service/) | Express, PostgreSQL, JWT | Medium-High | Auth + mid-build features |
| [cli-tool](./cli-tool/) | Node.js (no deps) | Low-Medium | CLI + evolve workflow |

## How to Use These Examples

Each example contains:
- `README.md` — Overview, expected structure, phases
- `viepilot-setup.md` (where applicable) — Exact brainstorm prompts and expected crystallize output

### Fastest Path

```bash
# Install ViePilot
git clone https://github.com/0-CODE/viepilot && cd viepilot && ./install.sh

# Pick an example, create project dir
mkdir my-project && cd my-project && git init

# Follow the README in the chosen example
```

## Estimated Times

| Example | Brainstorm | Auto Execution | Total |
|---------|-----------|----------------|-------|
| cli-tool | 5 min | 20 min | ~25 min |
| web-app | 8 min | 30 min | ~38 min |
| api-service | 10 min | 45 min | ~55 min |

*Times vary based on AI response speed and hardware.*
