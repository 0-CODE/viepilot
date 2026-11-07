'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Diacritics stripping utility for unaccented Vietnamese matching
// ─────────────────────────────────────────────────────────────────────────────
function stripDiacritics(str) {
  if (!str) return '';
  // NFD: decompose to base + combining marks
  let result = str.normalize('NFD');
  // Remove combining marks (accents, diacritics)
  result = result.replace(/[̀-ͯ]/g, '');
  // Handle special Vietnamese characters (đ, ð, etc.)
  result = result.replace(/đ/gi, 'd');
  result = result.replace(/ð/gi, 'd');
  return result.toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Audience Roles — tagged internal | external, with 'research' for academic roles
// ─────────────────────────────────────────────────────────────────────────────
const AUDIENCE_ROLES = Object.freeze({
  leadership: { id: 'leadership', label_en: 'Leadership', label_vi: 'Ban lãnh đạo', tag: 'internal' },
  engineering: { id: 'engineering', label_en: 'Engineering', label_vi: 'Kỹ sư', tag: 'internal' },
  product: { id: 'product', label_en: 'Product', label_vi: 'Sản phẩm', tag: 'internal' },
  sales: { id: 'sales', label_en: 'Sales', label_vi: 'Bán hàng', tag: 'internal' },
  marketing: { id: 'marketing', label_en: 'Marketing', label_vi: 'Marketing', tag: 'internal' },
  operations: { id: 'operations', label_en: 'Operations', label_vi: 'Vận hành', tag: 'internal' },
  hr: { id: 'hr', label_en: 'HR', label_vi: 'Nhân sự', tag: 'internal' },
  finance: { id: 'finance', label_en: 'Finance', label_vi: 'Tài chính', tag: 'internal' },
  legal: { id: 'legal', label_en: 'Legal', label_vi: 'Pháp lý', tag: 'internal' },
  'new-hires': { id: 'new-hires', label_en: 'New Hires', label_vi: 'Nhân viên mới', tag: 'internal' },
  'all-staff': { id: 'all-staff', label_en: 'All Staff', label_vi: 'Toàn bộ nhân viên', tag: 'internal' },
  clients: { id: 'clients', label_en: 'Clients', label_vi: 'Khách hàng', tag: 'external' },
  partners: { id: 'partners', label_en: 'Partners', label_vi: 'Đối tác', tag: 'external' },
  investors: { id: 'investors', label_en: 'Investors', label_vi: 'Nhà đầu tư', tag: 'external' },
  'scientific-council': { id: 'scientific-council', label_en: 'Scientific Council', label_vi: 'Hội đồng khoa học', tag: 'internal', research: true },
  'funding-agency': { id: 'funding-agency', label_en: 'Funding Agency', label_vi: 'Cơ quan tài trợ', tag: 'external', research: true },
  researchers: { id: 'researchers', label_en: 'Researchers', label_vi: 'Nhà nghiên cứu', tag: 'internal', research: true },
  students: { id: 'students', label_en: 'Students', label_vi: 'Sinh viên', tag: 'internal', research: true },
  'industry-partners': { id: 'industry-partners', label_en: 'Industry Partners', label_vi: 'Đối tác công nghiệp', tag: 'external', research: true },
});

// ─────────────────────────────────────────────────────────────────────────────
// Goals
// ─────────────────────────────────────────────────────────────────────────────
const GOALS = Object.freeze({
  approve: { id: 'approve', label_en: 'Approval', label_vi: 'Phê duyệt' },
  update: { id: 'update', label_en: 'Update', label_vi: 'Cập nhật' },
  demo: { id: 'demo', label_en: 'Demo', label_vi: 'Thuyết minh' },
  train: { id: 'train', label_en: 'Training', label_vi: 'Đào tạo' },
  inspire: { id: 'inspire', label_en: 'Inspire', label_vi: 'Truyền cảm hứng' },
  sell: { id: 'sell', label_en: 'Sell', label_vi: 'Bán' },
  fund: { id: 'fund', label_en: 'Funding', label_vi: 'Tài trợ' },
  kickoff: { id: 'kickoff', label_en: 'Kickoff', label_vi: 'Khởi động' },
  'report-progress': { id: 'report-progress', label_en: 'Progress Report', label_vi: 'Báo cáo tiến độ' },
  defend: { id: 'defend', label_en: 'Defense', label_vi: 'Bảo vệ' },
  transfer: { id: 'transfer', label_en: 'Tech Transfer', label_vi: 'Chuyển giao' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Formats, Knowledge, Size
// ─────────────────────────────────────────────────────────────────────────────
const FORMATS = Object.freeze({
  'in-person': { id: 'in-person', label_en: 'In-Person', label_vi: 'Trực tiếp' },
  online: { id: 'online', label_en: 'Online', label_vi: 'Trực tuyến' },
  recorded: { id: 'recorded', label_en: 'Recorded', label_vi: 'Ghi hình' },
  hybrid: { id: 'hybrid', label_en: 'Hybrid', label_vi: 'Kết hợp' },
});

const KNOWLEDGE = Object.freeze({
  novice: { id: 'novice', label_en: 'Novice', label_vi: 'Mới bắt đầu' },
  mixed: { id: 'mixed', label_en: 'Mixed', label_vi: 'Hỗn hợp' },
  expert: { id: 'expert', label_en: 'Expert', label_vi: 'Chuyên gia' },
});

const SIZE = Object.freeze({
  small: { id: 'small', label_en: 'Small (≤10)', label_vi: 'Nhỏ (≤10)' },
  medium: { id: 'medium', label_en: 'Medium (11–50)', label_vi: 'Trung bình (11–50)' },
  large: { id: 'large', label_en: 'Large (>50)', label_vi: 'Lớn (>50)' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Keyword tables for extractAudienceHints (Vietnamese + English)
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORD_TABLES = {
  roles: {
    vi: [
      { keyword: 'ban giám đốc', role: 'leadership' },
      { keyword: 'ban quản lý', role: 'leadership' },
      { keyword: 'lãnh đạo', role: 'leadership' },
      { keyword: 'kỹ sư', role: 'engineering' },
      { keyword: 'công nghệ', role: 'engineering' },
      { keyword: 'phòng kỹ thuật', role: 'engineering' },
      { keyword: 'sản phẩm', role: 'product' },
      { keyword: 'bán hàng', role: 'sales' },
      { keyword: 'phòng kinh doanh', role: 'sales' },
      { keyword: 'marketing', role: 'marketing' },
      { keyword: 'vận hành', role: 'operations' },
      { keyword: 'phòng vận hành', role: 'operations' },
      { keyword: 'nhân sự', role: 'hr' },
      { keyword: 'phòng nhân sự', role: 'hr' },
      { keyword: 'tài chính', role: 'finance' },
      { keyword: 'kế toán', role: 'finance' },
      { keyword: 'phòng tài chính', role: 'finance' },
      { keyword: 'pháp lý', role: 'legal' },
      { keyword: 'nhân viên mới', role: 'new-hires' },
      { keyword: 'toàn bộ nhân viên', role: 'all-staff' },
      { keyword: 'toàn công ty', role: 'all-staff' },
      { keyword: 'khách hàng', role: 'clients' },
      { keyword: 'đối tác', role: 'partners' },
      { keyword: 'nhà đầu tư', role: 'investors' },
      { keyword: 'hội đồng khoa học', role: 'scientific-council' },
      { keyword: 'cơ quan tài trợ', role: 'funding-agency' },
      { keyword: 'nhà nghiên cứu', role: 'researchers' },
      { keyword: 'sinh viên', role: 'students' },
      { keyword: 'đối tác công nghiệp', role: 'industry-partners' },
      { keyword: 'đề tài', role: 'researchers' },
      { keyword: 'chủ nhiệm đề tài', role: 'researchers' },
      { keyword: 'cấp bộ', role: 'researchers' },
      { keyword: 'nghiên cứu', role: 'researchers' },
      { keyword: 'luận văn', role: 'students' },
      { keyword: 'luận án', role: 'students' },
      { keyword: 'thạc sĩ', role: 'students' },
      { keyword: 'tiến sĩ', role: 'students' },
    ],
    en: [
      { keyword: 'leadership', role: 'leadership' },
      { keyword: 'executive', role: 'leadership' },
      { keyword: 'engineering', role: 'engineering' },
      { keyword: 'engineer', role: 'engineering' },
      { keyword: 'product', role: 'product' },
      { keyword: 'sales', role: 'sales' },
      { keyword: 'marketing', role: 'marketing' },
      { keyword: 'operations', role: 'operations' },
      { keyword: 'hr', role: 'hr' },
      { keyword: 'human resources', role: 'hr' },
      { keyword: 'finance', role: 'finance' },
      { keyword: 'legal', role: 'legal' },
      { keyword: 'new hires', role: 'new-hires' },
      { keyword: 'all staff', role: 'all-staff' },
      { keyword: 'clients', role: 'clients' },
      { keyword: 'customers', role: 'clients' },
      { keyword: 'partners', role: 'partners' },
      { keyword: 'investors', role: 'investors' },
      { keyword: 'scientific council', role: 'scientific-council' },
      { keyword: 'funding agency', role: 'funding-agency' },
      { keyword: 'researchers', role: 'researchers' },
      { keyword: 'students', role: 'students' },
      { keyword: 'industry partners', role: 'industry-partners' },
      { keyword: 'research topic', role: 'researchers' },
      { keyword: 'thesis', role: 'students' },
      { keyword: 'dissertation', role: 'students' },
    ],
  },
  goals: {
    vi: [
      { keyword: 'khởi động', goal: 'kickoff' },
      { keyword: 'kickoff', goal: 'kickoff' },
      { keyword: 'bảo vệ', goal: 'defend' },
      { keyword: 'luận văn', goal: 'defend' },
      { keyword: 'luận án', goal: 'defend' },
      { keyword: 'báo cáo tiến độ', goal: 'report-progress' },
      { keyword: 'nghiệm thu', goal: 'report-progress' },
      { keyword: 'chuyển giao', goal: 'transfer' },
      { keyword: 'phê duyệt', goal: 'approve' },
      { keyword: 'cập nhật', goal: 'update' },
      { keyword: 'đào tạo', goal: 'train' },
      { keyword: 'truyền cảm hứng', goal: 'inspire' },
      { keyword: 'bán', goal: 'sell' },
      { keyword: 'tài trợ', goal: 'fund' },
      { keyword: 'tiến độ', goal: 'report-progress' },
      { keyword: 'hội thảo', goal: 'defend' },
      { keyword: 'demo', goal: 'demo' },
    ],
    en: [
      { keyword: 'kickoff', goal: 'kickoff' },
      { keyword: 'approval', goal: 'approve' },
      { keyword: 'approve', goal: 'approve' },
      { keyword: 'update', goal: 'update' },
      { keyword: 'demo', goal: 'demo' },
      { keyword: 'training', goal: 'train' },
      { keyword: 'train', goal: 'train' },
      { keyword: 'inspire', goal: 'inspire' },
      { keyword: 'sell', goal: 'sell' },
      { keyword: 'funding', goal: 'fund' },
      { keyword: 'progress', goal: 'report-progress' },
      { keyword: 'defense', goal: 'defend' },
      { keyword: 'defend', goal: 'defend' },
      { keyword: 'thesis', goal: 'defend' },
      { keyword: 'dissertation', goal: 'defend' },
      { keyword: 'conference', goal: 'defend' },
      { keyword: 'tech transfer', goal: 'transfer' },
    ],
  },
  formats: {
    vi: [
      { keyword: 'trực tiếp', format: 'in-person' },
      { keyword: 'trực tuyến', format: 'online' },
      { keyword: 'ghi hình', format: 'recorded' },
      { keyword: 'kết hợp', format: 'hybrid' },
      { keyword: 'online', format: 'online' },
    ],
    en: [
      { keyword: 'in-person', format: 'in-person' },
      { keyword: 'in person', format: 'in-person' },
      { keyword: 'online', format: 'online' },
      { keyword: 'recorded', format: 'recorded' },
      { keyword: 'hybrid', format: 'hybrid' },
    ],
  },
  sizes: {
    vi: [
      { keyword: 'nhỏ', size: 'small' },
      { keyword: 'trung bình', size: 'medium' },
      { keyword: 'lớn', size: 'large' },
    ],
    en: [
      { keyword: 'small', size: 'small' },
      { keyword: 'medium', size: 'medium' },
      { keyword: 'large', size: 'large' },
    ],
  },
  knowledge: {
    vi: [
      { keyword: 'mới bắt đầu', knowledge: 'novice' },
      { keyword: 'chuyên gia', knowledge: 'expert' },
      { keyword: 'hỗn hợp', knowledge: 'mixed' },
    ],
    en: [
      { keyword: 'novice', knowledge: 'novice' },
      { keyword: 'beginner', knowledge: 'novice' },
      { keyword: 'expert', knowledge: 'expert' },
      { keyword: 'mixed', knowledge: 'mixed' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Normalize text for keyword matching (NFC + lowercase, also provide stripped version)
// ─────────────────────────────────────────────────────────────────────────────
function normalizeForMatching(text) {
  if (!text) return '';
  return text.normalize('NFC').toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract keywords from text (for hints and free-text extraction)
// Orders by appearance in text. Match with both NFC and diacritic-stripped forms.
// ─────────────────────────────────────────────────────────────────────────────
function extractKeywords(text, category, lang = 'en') {
  if (!text || !KEYWORD_TABLES[category] || !KEYWORD_TABLES[category][lang]) {
    return [];
  }

  const normalized = normalizeForMatching(text);
  const stripped = stripDiacritics(text);
  const keywords = KEYWORD_TABLES[category][lang];
  const matches = [];  // Array of {position, field, id}
  const seenIds = new Set();

  for (const entry of keywords) {
    const normalizedKeyword = normalizeForMatching(entry.keyword);
    const strippedKeyword = stripDiacritics(entry.keyword);

    // Try both NFC-normalized and diacritic-stripped matching
    let pos = normalized.indexOf(normalizedKeyword);
    if (pos < 0) {
      pos = stripped.indexOf(strippedKeyword);
    }

    if (pos >= 0) {
      // Get the value key from the entry (role, goal, format, size, knowledge)
      const valueKey = Object.keys(entry).find(k => k !== 'keyword');
      if (valueKey) {
        const id = entry[valueKey];
        if (!seenIds.has(id)) {
          seenIds.add(id);
          matches.push({ position: pos, field: valueKey, id });
        }
      }
    }
  }

  // Sort by position in text
  matches.sort((a, b) => a.position - b.position);
  return matches.map(m => ({ field: m.field, id: m.id }));
}

// ─────────────────────────────────────────────────────────────────────────────
// normalizeAudienceProfile
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Normalize raw audience input into a structured profile.
 * @param {Object} raw - Raw profile object
 * @returns {Object} Normalized profile with roles (primary/secondary), decisionMaker, knowledge, size, format, goal, internal (bool)
 */
function normalizeAudienceProfile(raw) {
  if (!raw) raw = {};

  const profile = {
    roles: [],
    decisionMaker: null,
    knowledge: null,
    size: null,
    format: null,
    goal: null,
    internal: true,
    other: {},
  };

  // Normalize roles (vi + en aliases)
  if (raw.roles) {
    const roleList = Array.isArray(raw.roles) ? raw.roles : [raw.roles];
    for (const roleInput of roleList) {
      if (!roleInput) continue;
      const normalized = normalizeForMatching(roleInput);
      let found = false;

      // Try exact match by ID
      if (AUDIENCE_ROLES[normalized]) {
        profile.roles.push({
          id: normalized,
          weight: raw.rolePrimary && raw.rolePrimary.includes(roleInput) ? 'primary' : 'secondary',
        });
        found = true;
      }

      // Try vi/en label matching
      if (!found) {
        for (const [id, roleInfo] of Object.entries(AUDIENCE_ROLES)) {
          const normalizedVi = normalizeForMatching(roleInfo.label_vi);
          const normalizedEn = normalizeForMatching(roleInfo.label_en);

          // Try exact match
          if (normalizedVi === normalized || normalizedEn === normalized) {
            profile.roles.push({
              id,
              weight: raw.rolePrimary && raw.rolePrimary.includes(roleInput) ? 'primary' : 'secondary',
            });
            found = true;
            break;
          }
        }
      }

      // Try keyword table matching (vi + en)
      if (!found) {
        const viKeywords = KEYWORD_TABLES.roles.vi || [];
        const enKeywords = KEYWORD_TABLES.roles.en || [];
        const allKeywords = [...viKeywords, ...enKeywords];

        for (const entry of allKeywords) {
          const normalizedKeyword = normalizeForMatching(entry.keyword);
          if (normalizedKeyword === normalized) {
            profile.roles.push({
              id: entry.role,
              weight: raw.rolePrimary && raw.rolePrimary.includes(roleInput) ? 'primary' : 'secondary',
            });
            found = true;
            break;
          }
        }
      }

      if (!found) {
        if (!profile.other.roles) profile.other.roles = [];
        profile.other.roles.push(roleInput);
      }
    }
  }

  // Normalize decision maker
  if (raw.decisionMaker) {
    const dmRole = normalizeForMatching(raw.decisionMaker.role);
    let foundRole = null;

    if (AUDIENCE_ROLES[dmRole]) {
      foundRole = dmRole;
    } else {
      for (const [id, roleInfo] of Object.entries(AUDIENCE_ROLES)) {
        if (normalizeForMatching(roleInfo.label_vi) === dmRole ||
            normalizeForMatching(roleInfo.label_en) === dmRole) {
          foundRole = id;
          break;
        }
      }
    }

    if (foundRole) {
      profile.decisionMaker = {
        role: foundRole,
        cares: raw.decisionMaker.cares || [],
      };
    } else if (raw.decisionMaker.role) {
      if (!profile.other.decisionMaker) profile.other.decisionMaker = {};
      profile.other.decisionMaker = raw.decisionMaker;
    }
  }

  // Normalize knowledge
  if (raw.knowledge) {
    const k = normalizeForMatching(raw.knowledge);
    if (KNOWLEDGE[k]) {
      profile.knowledge = k;
    } else {
      profile.other.knowledge = raw.knowledge;
    }
  }

  // Normalize size (handle numbers)
  if (raw.size) {
    let sizeId = null;
    if (typeof raw.size === 'number') {
      if (raw.size <= 10) sizeId = 'small';
      else if (raw.size <= 50) sizeId = 'medium';
      else sizeId = 'large';
    } else if (typeof raw.size === 'string') {
      const s = normalizeForMatching(raw.size);
      if (SIZE[s]) {
        sizeId = s;
      } else {
        profile.other.size = raw.size;
      }
    }
    if (sizeId) profile.size = sizeId;
  }

  // Normalize format
  if (raw.format) {
    const f = normalizeForMatching(raw.format);
    if (FORMATS[f]) {
      profile.format = f;
    } else {
      profile.other.format = raw.format;
    }
  }

  // Normalize goal
  if (raw.goal) {
    const g = normalizeForMatching(raw.goal);
    if (GOALS[g]) {
      profile.goal = g;
    } else {
      profile.other.goal = raw.goal;
    }
  }

  // Determine internal flag (all primary roles are internal)
  const primaryRoles = profile.roles.filter(r => r.weight === 'primary');
  if (primaryRoles.length > 0) {
    profile.internal = primaryRoles.every(pr => AUDIENCE_ROLES[pr.id].tag === 'internal');
  } else if (profile.roles.length > 0) {
    profile.internal = profile.roles.every(r => AUDIENCE_ROLES[r.id].tag === 'internal');
  }

  return profile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lazy-load TYPE_VARIANTS to avoid circular dependencies
// ─────────────────────────────────────────────────────────────────────────────
function getTypeVariants() {
  try {
    const gen = require('./proposal-generator.cjs');
    return gen.TYPE_VARIANTS;
  } catch (e) {
    // Fallback if can't require
    return {
      'internal-presentation': {},
      'research-proposal': {},
    };
  }
}

function getVoiceLevels() {
  try {
    const gen = require('./proposal-generator.cjs');
    return gen.VOICE_LEVELS;
  } catch (e) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// recommendProposalType
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Recommend a proposal type and variant based on audience profile.
 * @param {Object} profile - Normalized audience profile
 * @param {Object} opts - Options { lang: 'en'|'vi' }
 * @returns {Object} { typeId, variant|null, reason, alternatives: [{typeId, variant, reason}] }
 */
function recommendProposalType(profile, opts = {}) {
  if (!profile) {
    profile = normalizeAudienceProfile({});
  }

  const lang = opts.lang || 'en';

  // Check if profile is completely empty (nothing matched)
  const isEmpty = (!profile.roles || profile.roles.length === 0) && !profile.goal && !profile.format && !profile.size && !profile.knowledge;
  if (isEmpty) {
    // Return general when absolutely nothing is known
    return {
      typeId: 'general',
      variant: null,
      reason: lang === 'vi' ? 'Chưa có thông tin rõ ràng' : 'Insufficient context',
      alternatives: [
        { typeId: 'internal-presentation', variant: 'team-intro', reason: lang === 'vi' ? 'Nếu nội bộ' : 'If internal' },
        { typeId: 'product-pitch', variant: null, reason: lang === 'vi' ? 'Nếu bên ngoài' : 'If external' },
      ],
    };
  }

  const recommendations = [];

  // Helper: check if profile has a role
  function hasRole(roleId) {
    return profile.roles && profile.roles.some(r => r.id === roleId);
  }

  // Helper: check if profile has a role with 'research' tag
  function hasResearchRole() {
    return profile.roles && profile.roles.some(r => AUDIENCE_ROLES[r.id] && AUDIENCE_ROLES[r.id].research);
  }

  // Helper: check if primary role matches
  function hasPrimaryRole(roleId) {
    return profile.roles && profile.roles.some(r => r.id === roleId && r.weight === 'primary');
  }

  // Helper: check if size is large
  function isLargeSize() {
    return profile.size === 'large';
  }

  // Helper: cite signals for reason
  function buildReason(signals, viText, enText) {
    return lang === 'vi' ? viText : enText;
  }

  // RESEARCH RULES — check first (applies to both internal and external)
  if (hasResearchRole()) {
    // funding-agency primary or goal fund + research roles → grant-proposal
    if (hasPrimaryRole('funding-agency') || (profile.goal === 'fund' && hasResearchRole())) {
      recommendations.push({
        typeId: 'research-proposal',
        variant: 'grant-proposal',
        reason: buildReason(['funding-agency', 'fund'], 'Cơ quan tài trợ + mục tiêu tài trợ → đề xuất cấp kinh phí', 'Funding agency + fund goal → grant proposal'),
      });
    }

    // goal kickoff → kickoff
    if (profile.goal === 'kickoff') {
      recommendations.push({
        typeId: 'research-proposal',
        variant: 'kickoff',
        reason: buildReason(['kickoff', 'research'], 'Mục tiêu khởi động → thuyết minh khởi động đề tài', 'Kickoff goal → research project kickoff'),
      });
    }

    // goal report-progress → progress-report
    if (profile.goal === 'report-progress') {
      recommendations.push({
        typeId: 'research-proposal',
        variant: 'progress-report',
        reason: buildReason(['report-progress', 'research'], 'Mục tiêu báo cáo tiến độ → báo cáo thực hiện đề tài', 'Progress report goal → research progress report'),
      });
    }

    // goal defend or students/council → defense
    if (profile.goal === 'defend' || hasPrimaryRole('students') || hasPrimaryRole('scientific-council')) {
      recommendations.push({
        typeId: 'research-proposal',
        variant: 'defense',
        reason: buildReason(['defend', 'students', 'council'], 'Mục tiêu bảo vệ hoặc sinh viên/hội đồng → bảo vệ luận văn', 'Defense goal or thesis defense audience → thesis defense'),
      });
    }

    // goal transfer or industry-partners + research roles → tech-transfer
    if (profile.goal === 'transfer' || (hasRole('industry-partners') && hasResearchRole())) {
      recommendations.push({
        typeId: 'research-proposal',
        variant: 'tech-transfer',
        reason: buildReason(['transfer', 'industry'], 'Mục tiêu chuyển giao hay đối tác công nghiệp → chuyển giao công nghệ', 'Tech transfer goal or industry partners → technology transfer'),
      });
    }

    // If research rules matched, return with alternatives
    if (recommendations.length > 0) {
      const pick = recommendations[0];
      const alternatives = recommendations.slice(1, 3);

      // Ensure at least 1 alternative if none exist
      if (alternatives.length === 0) {
        // Add a reasonable fallback research variant
        const fallbackVariant = ['progress-report', 'kickoff', 'defense'].find(v => v !== pick.variant);
        if (fallbackVariant) {
          alternatives.push({
            typeId: 'research-proposal',
            variant: fallbackVariant,
            reason: lang === 'vi' ? 'Lựa chọn khác' : 'Alternative',
          });
        }
      }

      return {
        typeId: pick.typeId,
        variant: pick.variant,
        reason: pick.reason,
        alternatives: alternatives.slice(0, 2),
      };
    }
  }

  // EXTERNAL RULES
  if (!profile.internal) {
    // external + goal fund/investors primary → product-pitch
    if ((profile.goal === 'fund' || hasRole('investors')) && hasRole('investors')) {
      recommendations.push({
        typeId: 'product-pitch',
        variant: null,
        reason: buildReason(['investors', 'fund'], 'Nhà đầu tư + mục tiêu tài trợ → bản pitch sản phẩm', 'Investors + funding goal → product pitch'),
      });
    }

    // external + engineering/partners technical → tech-architecture
    if ((hasRole('engineering') || hasRole('industry-partners')) && hasRole('partners')) {
      recommendations.push({
        typeId: 'tech-architecture',
        variant: null,
        reason: buildReason(['partners', 'technical'], 'Đối tác + kỹ thuật → kiến trúc kỹ thuật', 'Partners + technical → tech architecture'),
      });
    }

    // external + clients approve/sell → project-proposal
    if ((profile.goal === 'approve' || profile.goal === 'sell') && hasRole('clients')) {
      recommendations.push({
        typeId: 'project-proposal',
        variant: null,
        reason: buildReason(['clients', 'approve'], 'Khách hàng + phê duyệt/bán → đề xuất dự án', 'Clients + approval/sell → project proposal'),
      });
    }

    // Fallback external → product-pitch
    if (recommendations.length === 0) {
      recommendations.push({
        typeId: 'product-pitch',
        variant: null,
        reason: buildReason(['external'], 'Đối tượng bên ngoài → bản pitch sản phẩm', 'External audience → product pitch'),
      });
    }
  }
  // INTERNAL RULES
  else {
    // Collect all matching variants in priority order
    const internalMatches = [];

    // goal approve or decision maker leadership → leadership-report
    if (profile.goal === 'approve' || (profile.decisionMaker && profile.decisionMaker.role === 'leadership')) {
      internalMatches.push({
        typeId: 'internal-presentation',
        variant: 'leadership-report',
        reason: buildReason(['approve', 'leadership'], 'Mục tiêu phê duyệt hoặc quyết định của lãnh đạo → báo cáo cho lãnh đạo', 'Approval goal or leadership decision → leadership report'),
      });
    }

    // goal train or new-hires primary → training
    if (profile.goal === 'train' || hasPrimaryRole('new-hires')) {
      internalMatches.push({
        typeId: 'internal-presentation',
        variant: 'training',
        reason: buildReason(['train', 'new-hires'], 'Mục tiêu đào tạo hoặc nhân viên mới → khóa đào tạo', 'Training goal or new hires → team training'),
      });
    }

    // goal demo → feature-demo
    if (profile.goal === 'demo') {
      internalMatches.push({
        typeId: 'internal-presentation',
        variant: 'feature-demo',
        reason: buildReason(['demo'], 'Mục tiêu thuyết minh tính năng → demo tính năng', 'Demo goal → feature demo'),
      });
    }

    // all-staff or size large + inspire/update → all-hands
    if (hasPrimaryRole('all-staff') || (isLargeSize() && (profile.goal === 'inspire' || profile.goal === 'update'))) {
      internalMatches.push({
        typeId: 'internal-presentation',
        variant: 'all-hands',
        reason: buildReason(['all-staff', 'inspire'], 'Toàn bộ nhân viên hoặc lớn + truyền cảm hứng → họp toàn bộ', 'All-staff or large + inspire → all-hands'),
      });
    }

    // Ensure we have at least team-intro as default
    if (internalMatches.length === 0) {
      internalMatches.push({
        typeId: 'internal-presentation',
        variant: 'team-intro',
        reason: buildReason([], 'Giới thiệu nội bộ', 'Internal introduction'),
      });
    }

    // Add alternatives if not enough
    if (internalMatches.length === 1) {
      const picked = internalMatches[0];
      const otherVariants = ['team-intro', 'feature-demo', 'training', 'leadership-report', 'all-hands']
        .filter(v => v !== picked.variant);

      for (const variant of otherVariants.slice(0, 2)) {
        internalMatches.push({
          typeId: 'internal-presentation',
          variant,
          reason: lang === 'vi' ? 'Lựa chọn khác' : 'Alternative',
        });
      }
    }

    if (internalMatches.length > 0) {
      recommendations.push(...internalMatches);
    }
  }

  // Pick the first recommendation as primary
  const pick = recommendations[0] || {
    typeId: 'general',
    variant: null,
    reason: lang === 'vi' ? 'Đề xuất chung' : 'General proposal',
  };

  // Build alternatives (1-2 distinct from pick)
  const alternatives = [];
  for (let i = 1; i < recommendations.length && alternatives.length < 2; i++) {
    const alt = recommendations[i];
    if (alt.typeId !== pick.typeId || alt.variant !== pick.variant) {
      alternatives.push(alt);
    }
  }

  // Ensure at least 1 alternative if none exist
  if (alternatives.length === 0) {
    const fallback = profile.internal
      ? { typeId: 'internal-presentation', variant: 'team-intro', reason: lang === 'vi' ? 'Lựa chọn khác' : 'Alternative' }
      : { typeId: 'product-pitch', variant: null, reason: lang === 'vi' ? 'Lựa chọn khác' : 'Alternative' };
    if (fallback.typeId !== pick.typeId || fallback.variant !== pick.variant) {
      alternatives.push(fallback);
    }
  }

  return {
    typeId: pick.typeId,
    variant: pick.variant,
    reason: pick.reason,
    alternatives: alternatives.slice(0, 2),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// suggestVoice
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Suggest a voice level based on profile and recommendation.
 * @param {Object} profile - Audience profile
 * @param {Object} rec - Recommendation from recommendProposalType
 * @returns {string} Voice level ID (humble, balanced, proud, founder-story)
 */
function suggestVoice(profile, rec) {
  if (!rec || !rec.variant) return 'balanced';

  const TYPE_VARIANTS = getTypeVariants();
  const typeVariants = TYPE_VARIANTS[rec.typeId] || {};
  const variant = typeVariants[rec.variant];

  if (!variant) return 'balanced';

  let voiceId = variant.suggestedVoice || 'balanced';

  // Nudge to humble if decision maker cares about risk/cost
  if (profile.decisionMaker && profile.decisionMaker.cares) {
    if (profile.decisionMaker.cares.includes('risk') ||
        profile.decisionMaker.cares.includes('cost')) {
      voiceId = 'humble';
    }
  }

  return voiceId;
}

// ─────────────────────────────────────────────────────────────────────────────
// suggestDuration
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Suggest a duration based on profile and recommendation.
 * @param {Object} profile - Audience profile
 * @param {Object} rec - Recommendation from recommendProposalType
 * @returns {number} Duration in minutes (5, 15, or 30)
 */
function suggestDuration(profile, rec) {
  if (!rec || !rec.variant) return 15;

  const TYPE_VARIANTS = getTypeVariants();
  const typeVariants = TYPE_VARIANTS[rec.typeId] || {};
  const variant = typeVariants[rec.variant];

  if (!variant) return 15;

  let duration = variant.defaultDuration || 15;

  // Shorten for leadership + online or large + online
  if (profile.format === 'online') {
    if (profile.decisionMaker && profile.decisionMaker.role === 'leadership') {
      // Shorten one step (30→15, 15→5)
      duration = duration === 30 ? 15 : Math.max(5, duration - 10);
    } else if (profile.size === 'large') {
      duration = duration === 30 ? 15 : Math.max(5, duration - 10);
    }
  }

  return duration;
}

// ─────────────────────────────────────────────────────────────────────────────
// extractAudienceHints — Free-text hint extraction
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Extract audience hints from free text.
 * @param {string} text - Free text description
 * @param {Object} opts - { lang: 'en'|'vi' }
 * @returns {Object} { raw (partial profile), matched: [{field, keyword}] }
 */
function extractAudienceHints(text, opts = {}) {
  if (!text) return { raw: {}, matched: [] };

  const lang = opts.lang || 'en';
  const raw = {};
  const matched = [];

  // Extract roles
  const roleMatches = extractKeywords(text, 'roles', lang);
  if (roleMatches.length > 0) {
    raw.roles = roleMatches.map(m => m.id);
    for (const match of roleMatches) {
      matched.push({ field: 'role', keyword: match.id });
    }
  }

  // Extract goals - take first one found in text order
  const goalMatches = extractKeywords(text, 'goals', lang);
  if (goalMatches.length > 0) {
    raw.goal = goalMatches[0].id;
    for (const match of goalMatches) {
      matched.push({ field: 'goal', keyword: match.id });
    }
  }

  // Extract formats - take first one found in text order
  const formatMatches = extractKeywords(text, 'formats', lang);
  if (formatMatches.length > 0) {
    raw.format = formatMatches[0].id;
    for (const match of formatMatches) {
      matched.push({ field: 'format', keyword: match.id });
    }
  }

  // Extract sizes - take first one found in text order
  const sizeMatches = extractKeywords(text, 'sizes', lang);
  if (sizeMatches.length > 0) {
    raw.size = sizeMatches[0].id;
    for (const match of sizeMatches) {
      matched.push({ field: 'size', keyword: match.id });
    }
  }

  // Extract knowledge - take first one found in text order
  const knowledgeMatches = extractKeywords(text, 'knowledge', lang);
  if (knowledgeMatches.length > 0) {
    raw.knowledge = knowledgeMatches[0].id;
    for (const match of knowledgeMatches) {
      matched.push({ field: 'knowledge', keyword: match.id });
    }
  }

  return { raw, matched };
}

// ─────────────────────────────────────────────────────────────────────────────
// findIntakeGaps
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Find what's still missing from an audience profile.
 * @param {Object} profile - Normalized profile
 * @returns {string[]} Subset of ['roles', 'decisionMaker', 'knowledgeSize', 'formatGoal']
 */
function findIntakeGaps(profile) {
  const gaps = [];

  if (!profile.roles || profile.roles.length === 0) gaps.push('roles');
  if (!profile.decisionMaker) gaps.push('decisionMaker');
  if (!profile.knowledge || !profile.size) gaps.push('knowledgeSize');
  if (!profile.format || !profile.goal) gaps.push('formatGoal');

  // Remove duplicates
  return [...new Set(gaps)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  AUDIENCE_ROLES,
  GOALS,
  FORMATS,
  KNOWLEDGE,
  SIZE,
  normalizeAudienceProfile,
  recommendProposalType,
  suggestVoice,
  suggestDuration,
  extractAudienceHints,
  findIntakeGaps,
};
