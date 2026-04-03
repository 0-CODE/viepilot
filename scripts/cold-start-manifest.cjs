#!/usr/bin/env node
/**
 * ENH-031: Recompute byte sizes for documented /vp-auto cold-start artifacts.
 * Writes .viepilot/cold-start-manifest.json and prints a short summary to stdout.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".viepilot", "cold-start-manifest.json");

/** Ordered groups match docs/user/features/autonomous-mode.md (cold start section). */
const GROUPS = {
  initialize_batch: [
    { path: ".viepilot/TRACKER.md", role: "Initialize — current phase and task pointer" },
    {
      path: ".viepilot/ROADMAP.md",
      role: "Initialize — full roadmap (optional if ROADMAP-INDEX.md used; see workflows/autonomous.md Step 1)",
    },
    { path: ".viepilot/ROADMAP-INDEX.md", role: "Initialize — compact phase slice when present (replaces ROADMAP read for listing only)" },
    { path: ".viepilot/AI-GUIDE.md", role: "Initialize — static project guide" },
  ],
  runtime_workflow: [
    { path: "workflows/autonomous.md", role: "Normative vp-auto process (project copy under {project_cwd})" },
    { path: "skills/vp-auto/SKILL.md", role: "Skill routing + pointer to workflow (install or repo)" },
  ],
  per_task_batch: [
    { path: ".viepilot/SYSTEM-RULES.md", role: "Per-task batch (new session = no real cache)" },
    { path: ".viepilot/AI-GUIDE.md", role: "Repeated in task batch per autonomous.md (same file)" },
  ],
};

function byteSize(rel) {
  const abs = path.join(ROOT, rel);
  try {
    return fs.statSync(abs).size;
  } catch {
    return null;
  }
}

function buildManifest() {
  const groups = {};
  let totalListed = 0;
  const byPath = new Map();

  for (const [name, entries] of Object.entries(GROUPS)) {
    groups[name] = entries.map((e) => {
      const bytes = byteSize(e.path);
      if (typeof bytes === "number") totalListed += bytes;
      if (!byPath.has(e.path) || byPath.get(e.path) == null) {
        byPath.set(e.path, bytes);
      }
      return { ...e, bytes };
    });
  }

  let deduped = 0;
  for (const b of byPath.values()) {
    if (typeof b === "number") deduped += b;
  }

  return {
    version: 1,
    generated_at: new Date().toISOString(),
    repo_root: ROOT,
    note:
      "Byte counts are from the working tree at generation time. Heuristic token estimate: divide bytes by ~3.5–4 for Latin/ASCII-heavy markdown. sum_bytes_all_listed_files follows workflow batches (may count the same path twice). deduped_union_bytes counts each relative path once.",
    groups,
    totals: {
      sum_bytes_all_listed_files: totalListed,
      deduped_union_bytes: deduped,
      sum_excludes_optional_missing: true,
    },
  };
}

function main() {
  const manifest = buildManifest();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const t = manifest.totals.sum_bytes_all_listed_files;
  const d = manifest.totals.deduped_union_bytes;
  const tokLo = Math.round(d / 4);
  const tokHi = Math.round(d / 3.5);
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
  console.log(
    `Batch-sum (may double-count): ${t} bytes | Deduped union: ${d} bytes (~${tokLo}–${tokHi} tokens heuristic)`
  );
  for (const [g, rows] of Object.entries(manifest.groups)) {
    console.log(`\n## ${g}`);
    for (const row of rows) {
      const b = row.bytes == null ? "missing" : row.bytes;
      console.log(`  ${b}\t${row.path}`);
    }
  }
}

main();
