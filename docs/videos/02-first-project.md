# Video Script: Your First ViePilot Project

**Target duration**: 8 minutes  
**Audience**: Developers who completed installation  
**Tool**: Cursor IDE with a blank Node.js project

---

## 0:00 — What We're Building

> "We're building a simple REST API with ViePilot guiding us through every step —
> from brainstorm to deployed code."

Show: final project structure in file tree

---

## 0:30 — Start Brainstorm

> "Open your project in Cursor and start a brainstorm session."

```
/vp-brainstorm Build a REST API for managing todo items
```

Show: ViePilot asking clarifying questions about tech stack, features, constraints

---

## 1:30 — Answer Questions

> "ViePilot gathers requirements through conversation. Answer naturally."

Demo conversation:
- Tech stack: Node.js + Express + SQLite
- Features: CRUD todos, tags, due dates
- Constraints: No auth needed for MVP

---

## 2:30 — Crystallize

> "Now convert the brainstorm into your project plan."

```
/vp-crystallize
```

Show: `.viepilot/` directory being created with:
- `ROADMAP.md` (phases)
- `TRACKER.md` (current state)
- `HANDOFF.json` (machine state)

---

## 3:30 — Review the Roadmap

> "Let's see what ViePilot planned for us."

```bash
cat .viepilot/ROADMAP.md
```

Show: 3 phases — Project Setup, Core API, Testing

---

## 4:00 — Start Autonomous Execution

> "One command to start building:"

```
/vp-auto
```

Show: progress banner, then watch Phase 1 tasks execute:
- Creating project structure
- Installing dependencies
- Setting up Express

---

## 5:30 — Check Progress

> "At any point, check where you are:"

```
/vp-status
```

Show: visual dashboard with progress bars and current task

---

## 6:00 — Phase Complete

> "When Phase 1 completes, ViePilot creates a checkpoint tag and moves on."

Show: git log with `vp-p1-complete` tag

---

## 6:30 — Pause and Resume

> "Need to step away? Pause cleanly:"

```
/vp-pause
```

> "When you're back:"

```
/vp-resume
```

Show: context restored with same phase and task

---

## 7:30 — Summary

> "That's the core ViePilot flow: brainstorm → crystallize → auto.
> Next: Advanced features with `/vp-debug` and `/vp-rollback`."

---

## Recording Notes

- Use a fresh project directory
- Pre-configure with working Node.js and git initialized
- Keep Cursor Chat visible throughout
