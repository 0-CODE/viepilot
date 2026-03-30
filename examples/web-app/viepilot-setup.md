# ViePilot Setup for Web App Example

## Brainstorm Prompt

Use this prompt with `/vp-brainstorm`:

```
Build a todo web app with Next.js

Requirements:
- Create, read, update, delete todos
- Mark todos as complete
- Filter by status (all/active/completed)
- Persist to SQLite database
- TypeScript + Tailwind CSS
- No authentication needed
```

## Expected Crystallize Output

After `/vp-crystallize`, your `.viepilot/ROADMAP.md` should contain ~5 phases:

```markdown
## Phase 1: Project Setup
- 1.1 Initialize Next.js with TypeScript
- 1.2 Configure Tailwind CSS
- 1.3 Setup SQLite with better-sqlite3

## Phase 2: Database Layer
- 2.1 Create todos table schema
- 2.2 Write migration script
- 2.3 Create database helper functions
- 2.4 Seed test data

## Phase 3: API Routes
- 3.1 GET /api/todos
- 3.2 POST /api/todos
- 3.3 PATCH /api/todos/:id

## Phase 4: Frontend Components
- 4.1 TodoList component
- 4.2 TodoItem component
- 4.3 AddTodo form component
- 4.4 FilterBar component

## Phase 5: Polish
- 5.1 Loading states
- 5.2 Error handling
```

## vp-auto Expected Behavior

1. **Phase 1**: Creates Next.js project, installs deps (~2 min)
2. **Phase 2**: Creates DB schema and helpers (~3 min)
3. **Phase 3**: Creates API routes with error handling (~2 min)
4. **Phase 4**: Creates React components with TypeScript (~5 min)
5. **Phase 5**: Adds loading/error states (~2 min)

Total: ~14 minutes of autonomous coding

## Verification

After all phases complete:

```bash
npm run dev
# Open http://localhost:3000
# Should show empty todo list
# Add a todo → persists to SQLite
# Mark complete → updates in real-time
```
