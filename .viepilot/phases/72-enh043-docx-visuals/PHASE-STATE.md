# Phase 72 — State

## Status: ✅ complete

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 72.1 | ✅ done | lib/screenshot-artifact.cjs — isMmdcAvailable() + renderMermaidToPng(source, outPath) |
| 72.2 | ✅ done | scripts/gen-proposal-docx.cjs — imageRunFromPng() + Mermaid PNG + ui/architect screenshot embedding |
| 72.3 | ✅ done | workflows/proposal.md — Step 7 update: docx diagram PNG + ui artifact injection |
| 72.4 | ✅ done | Tests (769/769) + CHANGELOG 2.10.0 |

## Blockers
None

## Decisions
- mmdc: optional CLI tool — `child_process.spawnSync('mmdc', ['--version'])` guard
- puppeteer: optional (already in lib/screenshot-artifact.cjs from ENH-042)
- docx ImageRun: `{ data: Buffer, transformation: { width: 500, height: 300 }, type: 'png' }`
- Diagram Reference: replace preformatted text with PNG when mmdc available; keep text fallback
- ui-direction screenshot injected before Executive Summary (first content section)
- architect/architecture.html screenshot injected after Technical Approach section
