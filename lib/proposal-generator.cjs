'use strict';

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// Variant framework — shared across types (internal-presentation, research-proposal, etc.)
// ─────────────────────────────────────────────────────────────────────────────
const INTERNAL_VARIANTS = Object.freeze({
  'team-intro': {
    id: 'team-intro',
    label: 'Team Intro',
    slides: 8,
    skeleton: [
      { title: 'Cover', beat: 'context' },
      { title: 'Why we are here', beat: 'context' },
      { title: 'The problem we saw', beat: 'conflict' },
      { title: 'What we built/plan', beat: 'solution' },
      { title: 'How it works', beat: 'proof' },
      { title: 'What it means for your team', beat: 'turning point' },
      { title: 'Timeline & who to ask', beat: 'invitation' },
      { title: 'Q&A / how to get involved', beat: 'invitation' },
    ],
    diagrams: ['flowchart'],
    defaultDuration: 15,
    suggestedVoice: 'balanced',
    goal: 'Introduce the team\'s work and engage for involvement',
  },
  'leadership-report': {
    id: 'leadership-report',
    label: 'Leadership Report',
    slides: 8,
    skeleton: [
      { title: 'Cover', beat: 'context' },
      { title: 'Bottom line first', beat: 'solution' },
      { title: 'Where we are vs plan', beat: 'proof' },
      { title: 'Key numbers', beat: 'proof' },
      { title: 'Risks & blockers', beat: 'conflict' },
      { title: 'Options & recommendation', beat: 'solution' },
      { title: 'Ask / decision needed', beat: 'invitation' },
      { title: 'Appendix pointer', beat: 'invitation' },
    ],
    diagrams: ['gantt'],
    defaultDuration: 5,
    suggestedVoice: 'humble',
    goal: 'Drive decisions with data and clear recommendations',
  },
  'feature-demo': {
    id: 'feature-demo',
    label: 'Feature Demo',
    slides: 7,
    skeleton: [
      { title: 'Cover', beat: 'context' },
      { title: 'The pain today', beat: 'conflict' },
      { title: 'Live demo flow', beat: 'proof' },
      { title: 'Before/after', beat: 'turning point' },
      { title: 'How to start using it', beat: 'solution' },
      { title: 'Known limits & roadmap', beat: 'invitation' },
      { title: 'Feedback channel', beat: 'invitation' },
    ],
    diagrams: ['sequenceDiagram', 'flowchart'],
    defaultDuration: 15,
    suggestedVoice: 'proud',
    goal: 'Show the feature in action and drive adoption',
  },
  'training': {
    id: 'training',
    label: 'Training',
    slides: 9,
    skeleton: [
      { title: 'Cover', beat: 'context' },
      { title: 'What you will be able to do', beat: 'invitation' },
      { title: 'Concepts', beat: 'context' },
      { title: 'Step-by-step 1', beat: 'proof' },
      { title: 'Step-by-step 2', beat: 'proof' },
      { title: 'Common mistakes', beat: 'conflict' },
      { title: 'Practice / exercise', beat: 'proof' },
      { title: 'Cheatsheet', beat: 'solution' },
      { title: 'Where to get help', beat: 'invitation' },
    ],
    diagrams: ['flowchart'],
    defaultDuration: 30,
    suggestedVoice: 'balanced',
    goal: 'Build competence through structured learning',
  },
  'all-hands': {
    id: 'all-hands',
    label: 'All Hands',
    slides: 8,
    skeleton: [
      { title: 'Cover', beat: 'context' },
      { title: 'Where we came from', beat: 'context' },
      { title: 'Wins worth celebrating', beat: 'turning point' },
      { title: 'What we learned', beat: 'proof' },
      { title: 'What is next', beat: 'solution' },
      { title: 'How each team fits', beat: 'solution' },
      { title: 'Thank you', beat: 'invitation' },
      { title: 'Q&A', beat: 'invitation' },
    ],
    diagrams: ['flowchart'],
    defaultDuration: 15,
    suggestedVoice: 'founder-story',
    goal: 'Unite the organization around shared mission and progress',
  },
});

// Generic TYPE_VARIANTS framework for extensible type support
const TYPE_VARIANTS = {
  'internal-presentation': INTERNAL_VARIANTS,
};

// ─────────────────────────────────────────────────────────────────────────────
// Proposal type definitions
// ─────────────────────────────────────────────────────────────────────────────
const PROPOSAL_TYPES = {
  'project-proposal':  { slides: 10, label: 'Project Proposal' },
  'tech-architecture': { slides: 12, label: 'Technical Architecture' },
  'product-pitch':     { slides: 12, label: 'Product Pitch Deck' },
  'general':           { slides: 8,  label: 'General Proposal' },
  'internal-presentation': { slides: 8, label: 'Internal Presentation', variants: true },
};

// ─────────────────────────────────────────────────────────────────────────────
// Template resolution — 3-tier
//   Tier 1: {projectRoot}/.viepilot/proposal-templates/{type}.{ext}  (project override)
//   Tier 2: {packageRoot}/templates/proposal/{ext}/{type}.{ext}       (stock type-specific)
//   Tier 3: {packageRoot}/templates/proposal/{ext}/general.{ext}      (stock fallback)
// ─────────────────────────────────────────────────────────────────────────────
function resolveTemplate(type, ext, projectRoot) {
  const override = path.join(projectRoot, '.viepilot', 'proposal-templates', `${type}.${ext}`);
  if (fs.existsSync(override)) return override;

  // Stock type-specific template
  const typeStock = path.join(__dirname, '..', 'templates', 'proposal', ext, `${type}.${ext}`);
  if (fs.existsSync(typeStock)) return typeStock;

  // Fallback to general template
  const generalStock = path.join(__dirname, '..', 'templates', 'proposal', ext, `general.${ext}`);
  return generalStock;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context detection — auto-load latest brainstorm session
// ─────────────────────────────────────────────────────────────────────────────
function detectBrainstormSession(projectRoot) {
  const dir = path.join(projectRoot, 'docs', 'brainstorm');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('session-') && f.endsWith('.md'))
    .sort()
    .reverse();
  return files.length ? path.join(dir, files[0]) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal type and variant validation
// ─────────────────────────────────────────────────────────────────────────────
function validateType(type) {
  if (!PROPOSAL_TYPES[type]) {
    throw new Error(
      `Unknown proposal type "${type}". Valid types: ${Object.keys(PROPOSAL_TYPES).join(', ')}`
    );
  }
  return PROPOSAL_TYPES[type];
}

/**
 * Validate and return variant for a given type.
 * For types with variants: validates variant exists, defaults to first variant if omitted.
 * For types without variants: throws if variant is provided.
 * @param {string} type - Proposal type ID
 * @param {string} [variant] - Optional variant ID
 * @returns {string} The validated variant ID
 * @throws {Error} If type has no variants but variant is provided, or if variant is unknown
 */
function validateVariant(type, variant) {
  const typeInfo = PROPOSAL_TYPES[type];
  if (!typeInfo) {
    throw new Error(
      `Unknown proposal type "${type}". Valid types: ${Object.keys(PROPOSAL_TYPES).join(', ')}`
    );
  }

  // If type has variants, validate or apply default
  if (typeInfo.variants && TYPE_VARIANTS[type]) {
    const variantIds = Object.keys(TYPE_VARIANTS[type]);

    // Default to first variant if omitted
    if (!variant) {
      return variantIds[0];
    }

    // Validate variant exists
    if (!TYPE_VARIANTS[type][variant]) {
      throw new Error(
        `Unknown variant "${variant}" for type "${type}". Valid variants: ${variantIds.join(', ')}`
      );
    }

    return variant;
  }

  // Type does not support variants; reject if variant provided
  if (variant) {
    throw new Error(
      `Type "${type}" does not support variants, but variant "${variant}" was provided.`
    );
  }

  return variant;
}

/**
 * Get the slide skeleton for a proposal type and optional variant.
 * For types with variants: returns the variant's skeleton array.
 * For types without variants: returns undefined (skeleton not modelled in code).
 * @param {string} type - Proposal type ID
 * @param {string} [variant] - Optional variant ID
 * @returns {Array<{title: string, beat: string}>|undefined} Skeleton array or undefined
 */
function getSkeleton(type, variant) {
  if (variant && TYPE_VARIANTS[type] && TYPE_VARIANTS[type][variant]) {
    return TYPE_VARIANTS[type][variant].skeleton;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifest meta schema (ENH-040)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Manifest meta object — collected via Step 2C quality brief.
 *
 * @typedef {Object} ProposalMeta
 * @property {string} cta           - Decision/action the proposal should drive
 * @property {string} [budget]      - Approximate budget range (optional)
 * @property {string} [timeline]    - Key deadline or constraint (optional)
 * @property {string} decisionMaker - Who is the primary audience/decision-maker
 */

// ─────────────────────────────────────────────────────────────────────────────
// Output path builder
// ─────────────────────────────────────────────────────────────────────────────
function buildOutputPaths(slug, projectRoot) {
  const date = new Date().toISOString().slice(0, 10);
  const base = path.join(projectRoot, 'docs', 'proposals', `${slug}-${date}`);
  return {
    md:     `${base}.md`,
    pptx:   `${base}.pptx`,
    docx:   `${base}.docx`,
    slides: `${base}-slides.txt`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Language instruction builder (ENH-039)
// ─────────────────────────────────────────────────────────────────────────────

const LANG_NAMES = {
  vi: 'Vietnamese', ja: 'Japanese', fr: 'French', zh: 'Chinese',
  ko: 'Korean', de: 'German', es: 'Spanish', pt: 'Portuguese',
  it: 'Italian', th: 'Thai', ar: 'Arabic', hi: 'Hindi',
};

/**
 * Build a language instruction string to prepend to the AI content generation prompt.
 *
 * @param {string} lang - ISO 639-1 code (e.g. 'vi', 'en', 'ja')
 * @param {boolean} [contentOnly=false] - if true, translate content only; keep structural labels English
 * @returns {string} Instruction to inject into AI prompt (empty string for English)
 */
function buildLangInstruction(lang, contentOnly = false) {
  if (!lang || lang === 'en') {
    return '';  // English is default — no explicit instruction needed
  }
  const langName = LANG_NAMES[lang] || lang.toUpperCase();

  if (contentOnly) {
    return (
      `LANGUAGE INSTRUCTION: Generate all slide content (bullet points, body text, ` +
      `speaker notes, and paragraph content) in ${langName}. ` +
      `Keep structural labels, section names, and template placeholders in English.`
    );
  }
  return (
    `LANGUAGE INSTRUCTION: Generate ALL content — slide headings, bullet points, ` +
    `body text, speaker notes, document section titles, and paragraph content — in ${langName}. ` +
    `Do not mix languages.`
  );
}

/** @type {Record<string, string[]>} */
const DIAGRAM_TYPES_BY_PROPOSAL = {
  'project-proposal':  ['flowchart', 'gantt'],
  'tech-architecture': ['flowchart', 'sequenceDiagram', 'classDiagram'],
  'product-pitch':     ['flowchart', 'sequenceDiagram'],
  'general':           ['flowchart'],
};

/**
 * Returns the list of Mermaid diagram types to generate for a given proposal type and optional variant.
 * For types with variants (e.g. 'internal-presentation'), the variant parameter determines the diagrams.
 * @param {string} typeId - Proposal type ID (e.g. 'project-proposal')
 * @param {string} [variant] - Optional variant ID for types that support variants
 * @returns {string[]} Array of Mermaid diagram type identifiers
 */
function getDiagramTypes(typeId, variant) {
  // If variant provided and type has variants, use variant's diagrams
  if (variant && TYPE_VARIANTS[typeId] && TYPE_VARIANTS[typeId][variant]) {
    return TYPE_VARIANTS[typeId][variant].diagrams || ['flowchart'];
  }

  // Fall back to proposal type diagrams
  return DIAGRAM_TYPES_BY_PROPOSAL[typeId] || ['flowchart'];
}

/** Known architect workspace page filenames (from vp-brainstorm --architect) */
const ARCHITECT_PAGES = [
  'architecture.html',
  'erd.html',
  'sequence-diagram.html',
  'feature-map.html',
  'user-use-cases.html',
  'deployment.html',
  'apis.html',
  'tech-notes.html',
  'data-flow.html',
  'decisions.html',
];

/**
 * Detect available HTML visual artifacts for screenshot embedding in PPTX slides.
 * Scans the ui-direction session directory for index.html, pages/*.html, and
 * architect workspace pages (architecture.html, erd.html, etc.).
 *
 * @param {string} [sessionDir] - Absolute path to a .viepilot/ui-direction/{session}/ dir.
 *   If omitted, auto-detects the latest session by scanning CWD/.viepilot/ui-direction/.
 * @returns {{ uiPages: string[], architectPages: string[], sessionDir: string|null }}
 */
function detectVisualArtifacts(sessionDir) {
  const fs   = require('fs');
  const path = require('path');

  // Auto-detect latest session when no dir provided
  let resolvedDir = sessionDir || null;
  if (!resolvedDir) {
    const uiBase = path.join(process.cwd(), '.viepilot', 'ui-direction');
    if (fs.existsSync(uiBase)) {
      const entries = fs.readdirSync(uiBase)
        .filter(e => {
          try { return fs.statSync(path.join(uiBase, e)).isDirectory(); } catch { return false; }
        })
        .sort()
        .reverse();  // ISO date dirs: latest first
      if (entries.length > 0) resolvedDir = path.join(uiBase, entries[0]);
    }
  }

  const result = { uiPages: [], architectPages: [], sessionDir: resolvedDir };
  if (!resolvedDir || !fs.existsSync(resolvedDir)) return result;

  // ui-direction index page
  const indexHtml = path.join(resolvedDir, 'index.html');
  if (fs.existsSync(indexHtml)) result.uiPages.push(indexHtml);

  // ui-direction sub-pages
  const pagesDir = path.join(resolvedDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir)
      .filter(f => f.endsWith('.html'))
      .sort()
      .map(f => path.join(pagesDir, f));
    result.uiPages.push(...pageFiles);
  }

  // Architect workspace pages (in same session dir)
  for (const page of ARCHITECT_PAGES) {
    const p = path.join(resolvedDir, page);
    if (fs.existsSync(p)) result.architectPages.push(p);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Design configs — ENH-045
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_CONFIGS = {
  'modern-tech': {
    colorPalette: 'navy-electric',
    layoutStyle:  'modern-tech',
    fontPair:     'Calibri / Calibri Light',
  },
  'enterprise': {
    colorPalette: 'navy-gold',
    layoutStyle:  'enterprise',
    fontPair:     'Georgia / Calibri',
  },
  'creative': {
    colorPalette: 'dark-vibrant',
    layoutStyle:  'creative',
    fontPair:     'Calibri / Calibri',
  },
};

/**
 * Choose design config based on project context signals (ENH-045).
 * @param {Object} ctx - { sector?, audience?, tone?, proposalType? }
 * @returns {{ colorPalette: string, layoutStyle: string, fontPair: string }}
 */
function getDesignConfig(ctx = {}) {
  const { sector = '', audience = '', tone = '' } = ctx;
  const lower = `${sector} ${audience} ${tone}`.toLowerCase();
  if (/bank|financ|enterprise|corp|legal|compliance|government/.test(lower))
    return DESIGN_CONFIGS['enterprise'];
  if (/startup|creative|design|game|media|agency|art/.test(lower))
    return DESIGN_CONFIGS['creative'];
  return DESIGN_CONFIGS['modern-tech'];
}

// ─────────────────────────────────────────────────────────────────────────────
// Voice Profile — 4 levels (ENH-117)
// ─────────────────────────────────────────────────────────────────────────────
const VOICE_LEVELS = [
  {
    level: 1,
    id: 'humble',
    label_vi: 'Khiêm tốn',
    label_en: 'Humble',
    instruction: 'Use "we" voice focused on customer benefit. Pride is implicit, shown through customer success and measurable results. Every claim must have evidence: customer name, metric, or demo.',
  },
  {
    level: 2,
    id: 'balanced',
    label_vi: 'Cân bằng',
    label_en: 'Balanced',
    instruction: 'Share why you made this product. Include 1–2 moments of pride backed by evidence: a customer outcome, a number, or a demo. Every claim of pride must carry proof (number, customer, demo).',
  },
  {
    level: 3,
    id: 'proud',
    label_vi: 'Tự hào',
    label_en: 'Proud',
    instruction: 'Speak as the maker with clear voice. "This is what we\'re proud of…" — but every single claim of pride must have evidence (number, customer, demo). No unbacked absolutes.',
  },
  {
    level: 4,
    id: 'founder-story',
    label_vi: 'Founder story',
    label_en: 'Founder story',
    instruction: 'Open with a personal story, an anecdote, or a moment that sparked the product. Speak from the founder\'s perspective with emotion and conviction. Every claim of pride must carry evidence (number, customer, demo).',
  },
];

/**
 * Build the voice instruction for a given level.
 * Falls back to level 2 (Balanced) if the level is invalid.
 * Always appends the evidence-for-pride rule.
 *
 * @param {number} level - Voice level (1–4)
 * @param {string} [lang='en'] - Language code (vi, en, etc.)
 * @returns {string} The instruction for the level with evidence rule appended
 */
function buildVoiceInstruction(level, lang = 'en') {
  // Validate and fall back to level 2 if invalid
  const voiceLevel = VOICE_LEVELS.find(v => v.level === level) || VOICE_LEVELS[1];

  const evidenceRule =
    lang === 'vi'
      ? ' Luôn ghi nhớ: mỗi lời tự hào phải kèm theo bằng chứng (số liệu, khách hàng, demo). Cấm những tính từ tuyệt đối không bằng chứng như "tốt nhất", "đột phá", "revolutionary".'
      : ' Always remember: every claim of pride must carry evidence (number, customer, demo). No unbacked absolutes like "best-in-class", "revolutionary", or "game-changer".';

  return voiceLevel.instruction + evidenceRule;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Cliché Blacklist (ENH-117)
// ─────────────────────────────────────────────────────────────────────────────
const AI_CLICHE_BLACKLIST = {
  vi: [
    'Trong thời đại số',
    'Không chỉ… mà còn',
    'Hãy cùng khám phá',
    'giải pháp toàn diện',
    'nâng tầm',
    'đột phá',
    'tối ưu hoá trải nghiệm',
    'hệ sinh thái',
    'trong bối cảnh hiện nay',
    'đóng vai trò quan trọng',
    'mang lại giá trị',
    'không ngừng nỗ lực',
  ],
  en: [
    'In today\'s fast-paced world',
    'leverage',
    'seamless',
    'unlock the power',
    'cutting-edge',
    'game-changer',
    'revolutionize',
    'synergy',
    'best-in-class',
    'delve',
    'in conclusion',
    'it is important to note',
  ],
};

/**
 * Build a word pattern for single English words to match inflections.
 * Handles silent 'e' in words like "leverage" -> "leverag(e)?\w*\b".
 * @private
 */
function buildEnglishWordPattern(word) {
  // For words ending in 'e' (which often drop it before -ing/-ed), use optional 'e'
  // e.g., "leverage" -> "leverag[e]?\w*\b" matches "leverage", "leveraging", "leveraged"
  if (word.endsWith('e') && word.length > 2) {
    const stem = word.slice(0, -1);  // Remove final 'e'
    return `\\b${stem}[e]?\\w*\\b`;
  }
  // For other words, use standard pattern
  return `\\b${word}\\w*\\b`;
}

/**
 * Detect clichés in text against the blacklist.
 * Handles ellipsis patterns as wildcards, word boundaries for single words,
 * case-insensitive Vietnamese with diacritics, and English inflections.
 *
 * @param {string} text - Text to scan
 * @param {string} [lang] - Language code (vi, en). If omitted, scans both lists.
 * @returns {Array<{ phrase: string, index: number }>} Array of found clichés with their position
 */
function detectCliches(text, lang) {
  const results = [];
  const langsToCheck = lang ? [lang] : ['vi', 'en'];

  // Normalize text to NFC to handle composed vs decomposed diacritics
  const normalizedText = text.normalize('NFC');

  for (const l of langsToCheck) {
    if (!AI_CLICHE_BLACKLIST[l]) continue;

    for (const phrase of AI_CLICHE_BLACKLIST[l]) {
      let pattern;

      // Check for ellipsis patterns before building regex
      const hasEllipsis = phrase.includes('…') || phrase.includes('...');

      if (hasEllipsis) {
        // Ellipsis as wildcard: match up to ~40 characters
        // Use a placeholder to avoid interfering with regex escaping
        // Normalize the phrase for consistent matching
        const normalizedPhrase = phrase.normalize('NFC');
        pattern = normalizedPhrase
          .replace(/\.\.\./g, '<<<ELLIPSIS>>>')  // Handle ...
          .replace(/…/g, '<<<ELLIPSIS>>>')       // Handle …
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape regex special chars
          .replace(/<<<ELLIPSIS>>>/g, '[^.!?\\n]{1,40}');  // Replace with wildcard (non-terminal punctuation)
      } else if (l === 'en' && /^\w+$/.test(phrase)) {
        // Single English words: build pattern to match inflections
        // "leverage" becomes "leverag[e]?\w*\b" to match "leverage", "leveraging", "leveraged"
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = buildEnglishWordPattern(escaped);
      } else {
        // Multi-word phrases or Vietnamese: escape and normalize
        const normalizedPhrase = phrase.normalize('NFC');
        pattern = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      // Flags: case-insensitive (i) + global (g) for both languages
      // NFC normalization ensures Vietnamese diacritics are handled correctly
      const flags = 'gi';
      const regex = new RegExp(pattern, flags);

      let match;
      while ((match = regex.exec(normalizedText)) !== null) {
        results.push({ phrase, index: match.index });
      }
    }
  }

  return results;
}

/**
 * Load the prompt contract template file.
 *
 * @returns {string} The contents of templates/proposal/prompt-contract.md
 */
function loadPromptContract() {
  const contractPath = path.join(__dirname, '..', 'templates', 'proposal', 'prompt-contract.md');
  return fs.readFileSync(contractPath, 'utf8');
}

module.exports = {
  PROPOSAL_TYPES,
  TYPE_VARIANTS,
  INTERNAL_VARIANTS,
  resolveTemplate,
  detectBrainstormSession,
  validateType,
  validateVariant,
  getSkeleton,
  buildOutputPaths,
  buildLangInstruction,
  getDiagramTypes,
  detectVisualArtifacts,
  DESIGN_CONFIGS,
  getDesignConfig,
  VOICE_LEVELS,
  buildVoiceInstruction,
  AI_CLICHE_BLACKLIST,
  detectCliches,
  loadPromptContract,
};
