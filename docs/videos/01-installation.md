# Video Script: ViePilot Installation

**Target duration**: 5 minutes  
**Audience**: Developers new to ViePilot  
**Tool**: Terminal + Cursor IDE

---

## 0:00 — Introduction

> "Welcome to ViePilot — the autonomous vibe coding framework. In this video,
> we'll get ViePilot installed and running your first project in under 5 minutes."

Show: ViePilot README on GitHub

---

## 0:30 — Prerequisites

> "You'll need: Git, Node.js 18+, and Cursor IDE with Claude enabled."

```bash
node --version   # v18+
git --version    # any recent version
```

---

## 1:00 — Installation

> "Clone the repository and run the install script."

```bash
git clone https://github.com/0-CODE/viepilot
cd viepilot
./install.sh
```

> "The installer copies skills to `~/.cursor/skills/` and workflows to
> `~/.cursor/viepilot/`. You'll see confirmation for each file."

Show: installer output with ✔ checkmarks

---

## 1:45 — Verify Installation

> "Let's verify everything is set up correctly."

```bash
vp-tools help
```

Show: help output listing all 13 commands

> "And check that skills are accessible in Cursor:"

Show: Cursor → open a project → type `/vp-` to see skill completions

---

## 2:30 — Create Your First Project

> "Navigate to your project directory and initialize ViePilot."

```bash
cd ~/my-project
/vp-brainstorm
```

Show: Cursor Chat with /vp-brainstorm producing a brainstorm template

---

## 3:30 — Run Crystallize

> "Now crystallize the brainstorm into executable artifacts."

```bash
/vp-crystallize
```

Show: Cursor generating `.viepilot/` directory structure with TRACKER.md, ROADMAP.md

---

## 4:15 — Start Autonomous Mode

> "With your project structure ready, kick off autonomous execution:"

```bash
/vp-auto
```

Show: vp-auto banner displaying project name, phase, progress bar

---

## 4:45 — Summary

> "In just 5 minutes you've installed ViePilot and initialized your first project.
> Next video: Creating your first feature with `/vp-brainstorm` in depth."

Show: `/vp-status` dashboard with progress bars

---

## Recording Notes

- Record at 1920×1080
- Use large terminal font (18pt+)
- Pause 2 seconds after each command before showing output
- Add captions for accessibility
