'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const VIEPILOT_DIR = path.join(os.homedir(), '.viepilot');
const PERSONAS_DIR = path.join(VIEPILOT_DIR, 'personas');
const ACTIVE_PERSONA_FILE = path.join(VIEPILOT_DIR, 'persona.json');
const CONTEXT_MAP_FILE = path.join(VIEPILOT_DIR, 'context-map.json');
const PENDING_REVIEW_FILE = path.join(VIEPILOT_DIR, 'pending-review.md');

// Known stack names to match from dependency files
const STACK_PATTERNS = {
  js: ['nextjs', 'next', 'nestjs', 'express', 'fastify', 'koa', 'hapi',
       'react', 'vue', 'angular', 'svelte', 'remix', 'nuxt',
       'prisma', 'typeorm', 'sequelize', 'mongoose',
       'postgresql', 'pg', 'mysql', 'mysql2', 'redis', 'mongodb',
       'stripe', 'tailwindcss', 'tailwind', 'graphql', 'trpc',
       'socket.io', 'bull', 'kafka', 'rabbitmq'],
  python: ['fastapi', 'django', 'flask', 'starlette', 'tornado',
           'langchain', 'openai', 'anthropic', 'llama-index',
           'pytorch', 'torch', 'tensorflow', 'keras',
           'pandas', 'numpy', 'scikit-learn', 'sklearn',
           'sqlalchemy', 'alembic', 'celery', 'pydantic'],
  cmake: ['freertos', 'esp-idf', 'zephyr', 'stm32', 'arduino',
          'mbedtls', 'lwip', 'fatfs', 'cmsis'],
};

// Domain signal detection rules
const DOMAIN_SIGNALS = [
  {
    domain: 'web-saas',
    checks: [
      (dir) => fileExists(dir, 'package.json') ? 0.4 : 0,
      (dir) => dirExists(dir, 'prisma') ? 0.4 : 0,
      (dir) => fileExists(dir, 'next.config.js') || fileExists(dir, 'next.config.ts') ? 0.2 : 0,
    ],
  },
  {
    domain: 'embedded',
    checks: [
      (dir) => fileExists(dir, 'CMakeLists.txt') ? 0.4 : 0,
      (dir) => fileExists(dir, 'sdkconfig') || fileExists(dir, 'sdkconfig.defaults') ? 0.4 : 0,
      (dir) => fileExists(dir, 'platformio.ini') ? 0.3 : 0,
      (dir) => fileExists(dir, '.pio') || dirExists(dir, '.pio') ? 0.2 : 0,
    ],
  },
  {
    domain: 'data-science',
    checks: [
      (dir) => fileExists(dir, 'requirements.txt') ? 0.3 : 0,
      (dir) => dirExists(dir, 'notebooks') || globExists(dir, '*.ipynb') ? 0.4 : 0,
      (dir) => fileExists(dir, 'pyproject.toml') && hasPythonMLDeps(dir) ? 0.3 : 0,
    ],
  },
  {
    domain: 'mobile',
    checks: [
      (dir) => fileExists(dir, 'pubspec.yaml') ? 0.5 : 0,
      (dir) => globExists(dir, '*.xcodeproj') || globExists(dir, '*.xcworkspace') ? 0.5 : 0,
      (dir) => fileExists(dir, 'android/app/build.gradle') ? 0.4 : 0,
      (dir) => fileExists(dir, 'metro.config.js') ? 0.3 : 0,
    ],
  },
  {
    domain: 'devops',
    checks: [
      (dir) => fileExists(dir, 'Dockerfile') || fileExists(dir, 'docker-compose.yml') ? 0.4 : 0,
      (dir) => dirExists(dir, 'terraform') || globExists(dir, '*.tf') ? 0.4 : 0,
      (dir) => dirExists(dir, '.github/workflows') || dirExists(dir, '.gitlab-ci.yml') ? 0.3 : 0,
      (dir) => fileExists(dir, 'ansible.cfg') || dirExists(dir, 'playbooks') ? 0.2 : 0,
    ],
  },
  {
    domain: 'ai-product',
    checks: [
      (dir) => fileExists(dir, 'pyproject.toml') && hasAIDeps(dir) ? 0.4 : 0,
      (dir) => fileExists(dir, 'requirements.txt') && hasAIDeps(dir) ? 0.3 : 0,
      (dir) => fileExists(dir, 'package.json') && hasJSAIDeps(dir) ? 0.35 : 0,
    ],
  },
];

// Helpers

function fileExists(dir, name) {
  try { return fs.statSync(path.join(dir, name)).isFile(); } catch { return false; }
}
function dirExists(dir, name) {
  try { return fs.statSync(path.join(dir, name)).isDirectory(); } catch { return false; }
}
function globExists(dir, pattern) {
  try {
    const prefix = pattern.replace('*', '');
    return fs.readdirSync(dir).some(f => f.endsWith(prefix.slice(1)) || f.includes(prefix.replace('.', '')));
  } catch { return false; }
}
function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}
function writeJsonSafe(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch { /* silent */ }
}
function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
}

function hasPythonMLDeps(dir) {
  const content = readFileSafe(path.join(dir, 'requirements.txt')) +
                  readFileSafe(path.join(dir, 'pyproject.toml'));
  return /torch|tensorflow|sklearn|scikit|pandas|numpy|xgboost|lightgbm|catboost/.test(content);
}
function hasAIDeps(dir) {
  const content = readFileSafe(path.join(dir, 'requirements.txt')) +
                  readFileSafe(path.join(dir, 'pyproject.toml'));
  return /langchain|openai|anthropic|llama.index|transformers|huggingface|litellm/.test(content);
}
function hasJSAIDeps(dir) {
  const pkg = readJsonSafe(path.join(dir, 'package.json'));
  if (!pkg) return false;
  const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
  return deps.some(d => /openai|anthropic|langchain|ai-sdk|vercel\/ai|llm/.test(d));
}

function inferStacks(dir) {
  const stacks = new Set();
  const pkg = readJsonSafe(path.join(dir, 'package.json'));
  if (pkg) {
    const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
    for (const dep of deps) {
      const normalized = dep.replace(/^@[^/]+\//, '').toLowerCase();
      if (STACK_PATTERNS.js.some(s => normalized.includes(s) || s.includes(normalized))) {
        const match = STACK_PATTERNS.js.find(s => normalized.includes(s));
        if (match) stacks.add(match);
      }
    }
    // Detect next.js specifically
    if (deps.includes('next')) stacks.add('nextjs');
    if (deps.some(d => d.includes('nest'))) stacks.add('nestjs');
    if (deps.includes('prisma') || deps.includes('@prisma/client')) stacks.add('prisma');
    if (deps.some(d => d === 'pg' || d === 'postgres')) stacks.add('postgresql');
    if (deps.some(d => d.includes('stripe'))) stacks.add('stripe');
    if (deps.includes('tailwindcss')) stacks.add('tailwind');
    if (deps.includes('react')) stacks.add('react');
  }
  const reqs = readFileSafe(path.join(dir, 'requirements.txt'));
  if (reqs) {
    for (const pattern of STACK_PATTERNS.python) {
      if (reqs.toLowerCase().includes(pattern)) stacks.add(pattern);
    }
  }
  const cmake = readFileSafe(path.join(dir, 'CMakeLists.txt'));
  if (cmake) {
    for (const pattern of STACK_PATTERNS.cmake) {
      if (cmake.toLowerCase().includes(pattern)) stacks.add(pattern);
    }
  }
  return Array.from(stacks).slice(0, 8);
}

function inferTeamSize(dir) {
  try {
    const out = execSync('git shortlog -sn --no-merges', {
      cwd: dir, stdio: 'pipe', timeout: 3000, encoding: 'utf8',
    });
    const count = out.trim().split('\n').filter(Boolean).length;
    if (count <= 1) return 'solo';
    if (count <= 5) return 'small';
    return 'team';
  } catch { return 'unknown'; }
}

function inferRole(dir) {
  try {
    const out = execSync('git log --name-only --pretty=format: -n 200', {
      cwd: dir, stdio: 'pipe', timeout: 3000, encoding: 'utf8',
    });
    const files = out.split('\n').filter(Boolean);
    let frontend = 0, backend = 0, embedded = 0;
    for (const f of files) {
      if (/\.(tsx|jsx|css|scss|html|svelte|vue)$/.test(f)) frontend++;
      else if (/\.(ts|js|py|go|java|rb|php|rs)$/.test(f)) backend++;
      else if (/\.(c|cpp|h|ino|s|asm)$/.test(f)) embedded++;
    }
    if (embedded > backend && embedded > frontend) return 'embedded';
    if (frontend > 0 && backend > 0) return 'full-stack';
    if (frontend > backend) return 'frontend';
    return 'backend';
  } catch { return 'full-stack'; }
}

function domainPhaseTemplate(domain) {
  const templates = {
    'web-saas': 'lean-startup',
    'embedded': 'firmware',
    'data-science': 'ml-pipeline',
    'mobile': 'mobile-launch',
    'devops': 'infra-ops',
    'ai-product': 'ai-product',
    'generic': 'generic',
  };
  return templates[domain] || 'generic';
}

function domainTopicPriority(domain) {
  const priorities = {
    'web-saas': ['auth', 'user-data', 'api', 'billing', 'admin', 'onboarding'],
    'embedded': ['hw-topology', 'drivers', 'rtos', 'protocols', 'power-budget'],
    'data-science': ['dataset', 'model-training', 'evaluation', 'serving', 'monitoring'],
    'mobile': ['auth', 'core-features', 'offline-sync', 'push-notifications', 'app-store'],
    'devops': ['infra', 'ci-cd', 'observability', 'slo', 'incident-mgmt'],
    'ai-product': ['llm-integration', 'rag-pipeline', 'prompt-mgmt', 'eval', 'ux'],
    'generic': ['core-features', 'auth', 'api', 'admin'],
  };
  return priorities[domain] || priorities['generic'];
}

// Public API

async function inferPersona(projectDir) {
  const dir = path.resolve(projectDir);
  try {
    // Score each domain
    const scores = {};
    for (const { domain, checks } of DOMAIN_SIGNALS) {
      scores[domain] = checks.reduce((sum, check) => {
        try { return sum + check(dir); } catch { return sum; }
      }, 0);
    }

    // Find top domains
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [topDomain, topScore] = sorted[0];
    const [secondDomain, secondScore] = sorted[1] || ['generic', 0];

    // Check for multi-domain merge condition
    if (topScore >= 0.35 && secondScore >= 0.35) {
      const personaA = await _buildPersona(dir, topDomain, topScore);
      const personaB = await _buildPersona(dir, secondDomain, secondScore);
      return mergePersonas(personaA, personaB);
    }

    const confidence = Math.min(topScore, 1.0);
    return await _buildPersona(dir, confidence >= 0.1 ? topDomain : 'generic', confidence);
  } catch {
    return { name: 'auto-generic', source: 'auto', domain: 'generic', confidence: 0, inferred_at: new Date().toISOString() };
  }
}

async function _buildPersona(dir, domain, confidence) {
  const stacks = inferStacks(dir);
  const teamSize = inferTeamSize(dir);
  const role = inferRole(dir);
  return {
    name: `auto-${domain}`,
    source: 'auto',
    domain,
    role,
    stacks,
    team_size: teamSize,
    output_style: 'lean',
    phase_template: domainPhaseTemplate(domain),
    brainstorm: {
      topic_priority: domainTopicPriority(domain),
      topic_skip: [],
    },
    confidence: Math.round(Math.min(confidence, 1.0) * 100) / 100,
    inferred_at: new Date().toISOString(),
  };
}

function mergePersonas(a, b) {
  const domainA = Array.isArray(a.domain) ? a.domain : [a.domain];
  const domainB = Array.isArray(b.domain) ? b.domain : [b.domain];
  const domains = [...new Set([...domainA, ...domainB])];
  const domainSlug = domains.join('-');
  return {
    name: `merge-${domainSlug}`,
    source: 'merge',
    domain: domains,
    role: a.role || b.role || 'full-stack',
    stacks: [...new Set([...(a.stacks || []), ...(b.stacks || [])])],
    team_size: a.team_size || b.team_size || 'unknown',
    output_style: a.output_style || 'lean',
    phase_template: `hybrid-${domainSlug}`,
    brainstorm: {
      topic_priority: [...new Set([...(a.brainstorm?.topic_priority || []), ...(b.brainstorm?.topic_priority || [])])],
      topic_skip: [...new Set([...(a.brainstorm?.topic_skip || []), ...(b.brainstorm?.topic_skip || [])])],
    },
    confidence: Math.min(a.confidence || 0, b.confidence || 0),
    inferred_at: new Date().toISOString(),
  };
}

function resolvePersona(projectDir, opts = {}) {
  const dir = path.resolve(projectDir || process.cwd());
  try {
    // Layer 1: project-level override
    const override = readJsonSafe(path.join(dir, '.viepilot', 'persona-override.json'));
    if (override) return override;
  } catch { /* silent */ }

  try {
    // Layer 2: context-map lookup (longest matching prefix)
    const contextMap = readJsonSafe(CONTEXT_MAP_FILE) || {};
    let bestMatch = null, bestLen = 0;
    for (const [mappedDir, personaName] of Object.entries(contextMap)) {
      if (dir.startsWith(mappedDir) && mappedDir.length > bestLen) {
        bestMatch = personaName;
        bestLen = mappedDir.length;
      }
    }
    if (bestMatch) {
      const persona = readJsonSafe(path.join(PERSONAS_DIR, `${bestMatch}.json`));
      if (persona) return persona;
    }
  } catch { /* silent */ }

  try {
    // Layer 3: global active persona
    const active = readJsonSafe(ACTIVE_PERSONA_FILE);
    if (active && active.name) {
      const persona = readJsonSafe(path.join(PERSONAS_DIR, `${active.name}.json`));
      if (persona) return persona;
    }
  } catch { /* silent */ }

  // Fallback: run infer synchronously (blocking variant for sync callers)
  return null;
}

function generatePersonaContext(persona) {
  if (!persona) return '';
  const domain = Array.isArray(persona.domain) ? persona.domain.join(' + ') : (persona.domain || 'unknown');
  const stacks = (persona.stacks || []).join(' / ') || 'not specified';
  return [
    '## User Persona',
    `- Role: ${persona.role || 'developer'}`,
    `- Domain: ${domain}`,
    `- Preferred stacks: ${stacks}`,
    `- Output style: ${persona.output_style || 'lean'}`,
    `- Phase template: ${persona.phase_template || 'generic'}`,
    `- Team size: ${persona.team_size || 'unknown'}`,
  ].join('\n');
}

function readActivePersona() {
  try {
    const active = readJsonSafe(ACTIVE_PERSONA_FILE);
    if (!active || !active.name) return null;
    return readJsonSafe(path.join(PERSONAS_DIR, `${active.name}.json`)) || null;
  } catch { return null; }
}

function writePersona(name, persona) {
  try {
    fs.mkdirSync(PERSONAS_DIR, { recursive: true });
    writeJsonSafe(path.join(PERSONAS_DIR, `${name}.json`), { ...persona, name });
  } catch { /* silent */ }
}

function setActivePersona(name) {
  try {
    fs.mkdirSync(VIEPILOT_DIR, { recursive: true });
    writeJsonSafe(ACTIVE_PERSONA_FILE, { name, updated_at: new Date().toISOString() });
  } catch { /* silent */ }
}

function listPersonas() {
  try {
    const active = readJsonSafe(ACTIVE_PERSONA_FILE);
    const activeName = active?.name || null;
    const files = fs.readdirSync(PERSONAS_DIR).filter(f => f.endsWith('.json'));
    return files.map(f => {
      const data = readJsonSafe(path.join(PERSONAS_DIR, f)) || {};
      const name = f.replace('.json', '');
      return {
        name,
        domain: Array.isArray(data.domain) ? data.domain.join('+') : (data.domain || 'unknown'),
        confidence: data.confidence ?? '—',
        active: name === activeName,
      };
    });
  } catch { return []; }
}

function updateContextMap(projectDir, personaName) {
  try {
    const dir = path.resolve(projectDir);
    const map = readJsonSafe(CONTEXT_MAP_FILE) || {};
    map[dir] = personaName;
    fs.mkdirSync(VIEPILOT_DIR, { recursive: true });
    writeJsonSafe(CONTEXT_MAP_FILE, map);
  } catch { /* silent */ }
}

async function autoSwitch(projectDir) {
  const dir = path.resolve(projectDir || process.cwd());
  try {
    let persona = resolvePersona(dir);
    if (!persona) {
      persona = await inferPersona(dir);
      writePersona(persona.name, persona);
      setActivePersona(persona.name);
      updateContextMap(dir, persona.name);
    } else {
      const active = readActivePersona();
      if (!active || active.name !== persona.name) {
        setActivePersona(persona.name);
        updateContextMap(dir, persona.name);
      }
    }
    if ((persona.confidence || 0) < 0.6) {
      appendPendingReview(`Auto-detected persona '${persona.name}' for ${path.basename(dir)} with low confidence (${persona.confidence}). Run /vp-persona to review.`, persona.name);
    }
    return persona;
  } catch { return null; }
}

function appendPendingReview(message, personaName) {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const line = `- [${date}] 🟡 ${message} (persona: ${personaName}) — run /vp-persona to review\n`;
    fs.mkdirSync(VIEPILOT_DIR, { recursive: true });
    fs.appendFileSync(PENDING_REVIEW_FILE, line, 'utf8');
  } catch { /* silent */ }
}

module.exports = {
  inferPersona,
  resolvePersona,
  mergePersonas,
  generatePersonaContext,
  readActivePersona,
  writePersona,
  setActivePersona,
  listPersonas,
  updateContextMap,
  autoSwitch,
  appendPendingReview,
};
