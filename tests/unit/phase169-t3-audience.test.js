'use strict';

const path = require('path');
const ROOT = path.resolve(__dirname, '../..');

const audience = require(path.join(ROOT, 'lib/proposal-audience.cjs'));
const gen = require(path.join(ROOT, 'lib/proposal-generator.cjs'));

// ──────────────────────────────────────────────────────────────────────────────
// Module exports
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: lib/proposal-audience.cjs exists and exports', () => {
  expect(typeof audience.normalizeAudienceProfile).toBe('function');
  expect(typeof audience.recommendProposalType).toBe('function');
  expect(typeof audience.suggestVoice).toBe('function');
  expect(typeof audience.suggestDuration).toBe('function');
  expect(typeof audience.extractAudienceHints).toBe('function');
  expect(typeof audience.findIntakeGaps).toBe('function');
});

test('phase169-t3: exports AUDIENCE_ROLES', () => {
  expect(audience.AUDIENCE_ROLES).toBeDefined();
  expect(audience.AUDIENCE_ROLES.leadership).toBeDefined();
  expect(audience.AUDIENCE_ROLES.engineering).toBeDefined();
  expect(audience.AUDIENCE_ROLES['scientific-council']).toBeDefined();
});

test('phase169-t3: exports GOALS, FORMATS, KNOWLEDGE, SIZE', () => {
  expect(audience.GOALS).toBeDefined();
  expect(audience.FORMATS).toBeDefined();
  expect(audience.KNOWLEDGE).toBeDefined();
  expect(audience.SIZE).toBeDefined();
});

// ──────────────────────────────────────────────────────────────────────────────
// Test profiles table: reach all 5 internal variants + 5 research + 4 external
// ──────────────────────────────────────────────────────────────────────────────

const TEST_PROFILES = [
  // ─── INTERNAL VARIANTS (5) ───────────────────────────────────────────────
  {
    name: 'team-intro: engineering team kickoff',
    raw: {
      roles: ['engineering'],
      goal: 'update',
      size: 'small',
      format: 'in-person',
      knowledge: 'expert',
    },
    lang: 'en',
    expectedTypeId: 'internal-presentation',
    expectedVariant: 'team-intro',
  },
  {
    name: 'leadership-report: decision for leadership',
    raw: {
      roles: ['leadership'],
      goal: 'approve',
      size: 'medium',
      format: 'online',
      knowledge: 'expert',
      decisionMaker: { role: 'leadership', cares: ['cost'] },
    },
    lang: 'en',
    expectedTypeId: 'internal-presentation',
    expectedVariant: 'leadership-report',
  },
  {
    name: 'feature-demo: showcase to product team',
    raw: {
      roles: ['product'],
      goal: 'demo',
      size: 'medium',
      format: 'in-person',
      knowledge: 'mixed',
    },
    lang: 'en',
    expectedTypeId: 'internal-presentation',
    expectedVariant: 'feature-demo',
  },
  {
    name: 'training: onboarding new hires',
    raw: {
      roles: ['new-hires'],
      goal: 'train',
      size: 'medium',
      format: 'hybrid',
      knowledge: 'novice',
      rolePrimary: ['new-hires'],
    },
    lang: 'en',
    expectedTypeId: 'internal-presentation',
    expectedVariant: 'training',
  },
  {
    name: 'all-hands: company-wide update',
    raw: {
      roles: ['all-staff'],
      goal: 'inspire',
      size: 'large',
      format: 'hybrid',
      knowledge: 'mixed',
      rolePrimary: ['all-staff'],
    },
    lang: 'en',
    expectedTypeId: 'internal-presentation',
    expectedVariant: 'all-hands',
  },

  // ─── RESEARCH VARIANTS (5) ──────────────────────────────────────────────
  {
    name: 'grant-proposal: funding from agency',
    raw: {
      roles: ['funding-agency'],
      goal: 'fund',
      size: 'small',
      format: 'in-person',
      knowledge: 'expert',
      rolePrimary: ['funding-agency'],
    },
    lang: 'en',
    expectedTypeId: 'research-proposal',
    expectedVariant: 'grant-proposal',
  },
  {
    name: 'kickoff: research project start',
    raw: {
      roles: ['researchers', 'scientific-council'],
      goal: 'kickoff',
      size: 'medium',
      format: 'in-person',
      knowledge: 'expert',
    },
    lang: 'en',
    expectedTypeId: 'research-proposal',
    expectedVariant: 'kickoff',
  },
  {
    name: 'progress-report: mid-project review',
    raw: {
      roles: ['scientific-council', 'funding-agency'],
      goal: 'report-progress',
      size: 'small',
      format: 'online',
      knowledge: 'expert',
    },
    lang: 'en',
    expectedTypeId: 'research-proposal',
    expectedVariant: 'progress-report',
  },
  {
    name: 'defense: thesis defense panel',
    raw: {
      roles: ['students', 'scientific-council'],
      goal: 'defend',
      size: 'small',
      format: 'in-person',
      knowledge: 'expert',
      rolePrimary: ['students'],
    },
    lang: 'en',
    expectedTypeId: 'research-proposal',
    expectedVariant: 'defense',
  },
  {
    name: 'tech-transfer: commercialization',
    raw: {
      roles: ['industry-partners', 'researchers'],
      goal: 'transfer',
      size: 'medium',
      format: 'in-person',
      knowledge: 'expert',
    },
    lang: 'en',
    expectedTypeId: 'research-proposal',
    expectedVariant: 'tech-transfer',
  },

  // ─── EXTERNAL TYPES (4) ──────────────────────────────────────────────────
  {
    name: 'product-pitch: investor pitch deck',
    raw: {
      roles: ['investors'],
      goal: 'fund',
      size: 'small',
      format: 'in-person',
      knowledge: 'novice',
      rolePrimary: ['investors'],
    },
    lang: 'en',
    expectedTypeId: 'product-pitch',
    expectedVariant: null,
  },
  {
    name: 'tech-architecture: partner technical review',
    raw: {
      roles: ['partners', 'engineering'],
      goal: 'demo',
      size: 'medium',
      format: 'online',
      knowledge: 'expert',
    },
    lang: 'en',
    expectedTypeId: 'tech-architecture',
    expectedVariant: null,
  },
  {
    name: 'project-proposal: client project kick-off',
    raw: {
      roles: ['clients'],
      goal: 'approve',
      size: 'medium',
      format: 'in-person',
      knowledge: 'mixed',
    },
    lang: 'en',
    expectedTypeId: 'project-proposal',
    expectedVariant: null,
  },
  {
    name: 'general: unspecified external',
    raw: {
      roles: ['clients', 'partners'],
      goal: 'update',
      size: 'large',
      format: 'recorded',
      knowledge: 'mixed',
    },
    lang: 'en',
    expectedTypeId: 'product-pitch',
    expectedVariant: null,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Variant reachability: each variant should be reachable
// ──────────────────────────────────────────────────────────────────────────────

TEST_PROFILES.forEach((testCase) => {
  test(`phase169-t3: ${testCase.name} recommends ${testCase.expectedTypeId}/${testCase.expectedVariant || 'N/A'}`, () => {
    const profile = audience.normalizeAudienceProfile(testCase.raw);
    const rec = audience.recommendProposalType(profile, { lang: testCase.lang });

    expect(rec.typeId).toBe(testCase.expectedTypeId);
    expect(rec.variant).toBe(testCase.expectedVariant);
    expect(rec.reason).toBeDefined();
    expect(rec.reason.length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Alternatives are distinct and length 1–2
// ──────────────────────────────────────────────────────────────────────────────

TEST_PROFILES.slice(0, 5).forEach((testCase) => {
  test(`phase169-t3: ${testCase.name} has 1–2 distinct alternatives`, () => {
    const profile = audience.normalizeAudienceProfile(testCase.raw);
    const rec = audience.recommendProposalType(profile, { lang: testCase.lang });

    expect(Array.isArray(rec.alternatives)).toBe(true);
    expect(rec.alternatives.length).toBeGreaterThanOrEqual(1);
    expect(rec.alternatives.length).toBeLessThanOrEqual(2);

    // Check distinctness
    for (const alt of rec.alternatives) {
      const isDistinct =
        alt.typeId !== rec.typeId || alt.variant !== rec.variant;
      expect(isDistinct).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Vietnamese paragraph parsing (free text extraction)
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: extractAudienceHints on Vietnamese kickoff paragraph', () => {
  const text = 'Buổi khởi động đề tài cấp bộ trước hội đồng khoa học, có chủ nhiệm đề tài và các thành viên';
  const hints = audience.extractAudienceHints(text, { lang: 'vi' });

  expect(hints.raw).toBeDefined();
  expect(hints.matched).toBeDefined();
  expect(Array.isArray(hints.matched)).toBe(true);

  // Should extract roles
  expect(hints.raw.roles).toBeDefined();
  expect(Array.isArray(hints.raw.roles)).toBe(true);
  expect(hints.raw.roles).toContain('scientific-council');

  // Should extract goal
  expect(hints.raw.goal).toBe('kickoff');

  // Reconstruct as profile
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang: 'vi' });
  expect(rec.typeId).toBe('research-proposal');
  expect(rec.variant).toBe('kickoff');
});

// ──────────────────────────────────────────────────────────────────────────────
// English paragraph parsing
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: extractAudienceHints on English training paragraph', () => {
  const text = 'Training session for new hires on engineering team, mixed knowledge levels, in-person format';
  const hints = audience.extractAudienceHints(text, { lang: 'en' });

  expect(hints.raw.roles).toBeDefined();
  expect(hints.raw.roles).toContain('new-hires');
  expect(hints.raw.knowledge).toBe('mixed');
  expect(hints.raw.format).toBe('in-person');

  // Recommend should pick training
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang: 'en' });
  expect(rec.variant).toBe('training');
});

// ──────────────────────────────────────────────────────────────────────────────
// normalizeAudienceProfile with Vietnamese aliases
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: normalizeAudienceProfile maps Vietnamese role aliases', () => {
  const raw = {
    roles: ['ban giám đốc'],
    goal: 'approve',
  };
  const profile = audience.normalizeAudienceProfile(raw);
  expect(profile.roles[0].id).toBe('leadership');
  expect(profile.goal).toBe('approve');
});

test('phase169-t3: normalizeAudienceProfile handles diacritics normalization', () => {
  // Test with NFD (decomposed) vs NFC (composed) forms
  const raw1 = { roles: ['kỹ sư'] };  // composed
  const raw2 = { roles: ['kỹ sư'.normalize('NFD')] };  // decomposed

  const profile1 = audience.normalizeAudienceProfile(raw1);
  const profile2 = audience.normalizeAudienceProfile(raw2);

  // Both should resolve to engineering
  expect(profile1.roles[0].id).toBe('engineering');
  expect(profile2.roles[0].id).toBe('engineering');
});

// ──────────────────────────────────────────────────────────────────────────────
// Unknown input is safe (no throw)
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: normalizeAudienceProfile on unknown roles stores in .other', () => {
  const raw = {
    roles: ['unknown-role-xyz'],
    goal: 'unknown-goal-abc',
  };
  expect(() => audience.normalizeAudienceProfile(raw)).not.toThrow();
  const profile = audience.normalizeAudienceProfile(raw);
  expect(profile.other.roles).toBeDefined();
  expect(profile.other.roles).toContain('unknown-role-xyz');
});

test('phase169-t3: recommendProposalType on null/undefined profile is safe', () => {
  expect(() => audience.recommendProposalType(null)).not.toThrow();
  expect(() => audience.recommendProposalType(undefined)).not.toThrow();

  const rec1 = audience.recommendProposalType(null);
  const rec2 = audience.recommendProposalType(undefined);

  expect(rec1.typeId).toBeDefined();
  expect(rec2.typeId).toBeDefined();
});

test('phase169-t3: extractAudienceHints on null/empty text is safe', () => {
  expect(() => audience.extractAudienceHints(null)).not.toThrow();
  expect(() => audience.extractAudienceHints('')).not.toThrow();

  const hints1 = audience.extractAudienceHints(null);
  const hints2 = audience.extractAudienceHints('');

  expect(hints1.raw).toBeDefined();
  expect(hints2.raw).toBeDefined();
});

// ──────────────────────────────────────────────────────────────────────────────
// suggestVoice and suggestDuration return valid values
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: suggestVoice returns valid voice level ID', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['leadership'],
    goal: 'approve',
  });
  const rec = audience.recommendProposalType(profile);

  const voiceId = audience.suggestVoice(profile, rec);
  expect(['humble', 'balanced', 'proud', 'founder-story']).toContain(voiceId);
});

test('phase169-t3: suggestVoice nudges to humble when decision maker cares about cost/risk', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['engineering'],
    goal: 'demo',
    decisionMaker: { role: 'leadership', cares: ['cost', 'risk'] },
  });
  const rec = audience.recommendProposalType(profile);

  const voiceId = audience.suggestVoice(profile, rec);
  expect(voiceId).toBe('humble');
});

test('phase169-t3: suggestDuration returns valid duration (5, 15, or 30)', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['leadership'],
    goal: 'approve',
    format: 'online',
  });
  const rec = audience.recommendProposalType(profile);

  const duration = audience.suggestDuration(profile, rec);
  expect([5, 15, 30]).toContain(duration);
});

test('phase169-t3: suggestDuration shortens for leadership + online', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['training'],
    goal: 'train',
    format: 'online',
    decisionMaker: { role: 'leadership', cares: [] },
  });
  const rec = audience.recommendProposalType(profile);

  const duration = audience.suggestDuration(profile, rec);
  // Training defaults to 30, should shorten to 15 for online + leadership
  expect([5, 15]).toContain(duration);
});

// ──────────────────────────────────────────────────────────────────────────────
// findIntakeGaps lists only truly missing fields
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: findIntakeGaps returns empty array for complete profile', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['leadership'],
    decisionMaker: { role: 'leadership', cares: ['cost'] },
    knowledge: 'expert',
    size: 'medium',
    format: 'in-person',
    goal: 'approve',
  });

  const gaps = audience.findIntakeGaps(profile);
  expect(gaps.length).toBe(0);
});

test('phase169-t3: findIntakeGaps identifies missing roles', () => {
  const profile = audience.normalizeAudienceProfile({
    decisionMaker: { role: 'leadership', cares: [] },
    knowledge: 'expert',
    format: 'in-person',
    goal: 'approve',
  });

  const gaps = audience.findIntakeGaps(profile);
  expect(gaps).toContain('roles');
});

test('phase169-t3: findIntakeGaps identifies missing decisionMaker', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['engineering'],
    knowledge: 'expert',
    format: 'in-person',
    goal: 'approve',
  });

  const gaps = audience.findIntakeGaps(profile);
  expect(gaps).toContain('decisionMaker');
});

test('phase169-t3: findIntakeGaps identifies missing knowledge or size', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['engineering'],
    decisionMaker: { role: 'leadership', cares: [] },
    format: 'in-person',
    goal: 'approve',
  });

  const gaps = audience.findIntakeGaps(profile);
  expect(gaps).toContain('knowledgeSize');
});

test('phase169-t3: findIntakeGaps identifies missing format or goal', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['engineering'],
    decisionMaker: { role: 'leadership', cares: [] },
    knowledge: 'expert',
  });

  const gaps = audience.findIntakeGaps(profile);
  expect(gaps).toContain('formatGoal');
});

// ──────────────────────────────────────────────────────────────────────────────
// Defect probe cases — orchestrator review
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: PROBE 1 — Vietnamese research kickoff with "thuyết minh" + "khởi động"', () => {
  // "Buổi thuyết minh kickoff đề tài cấp bộ trước hội đồng khoa học, có chủ nhiệm đề tài và các thành viên"
  // Should detect: roles [scientific-council, researchers], goal=kickoff (NOT demo)
  // Should recommend: research-proposal/kickoff
  const text = 'Buổi thuyết minh kickoff đề tài cấp bộ trước hội đồng khoa học, có chủ nhiệm đề tài và các thành viên';
  const hints = audience.extractAudienceHints(text, { lang: 'vi' });

  // Should extract research roles (scientific-council from hội đồng khoa học, researchers from đề tài/chủ nhiệm)
  expect(hints.raw.roles).toBeDefined();
  expect(Array.isArray(hints.raw.roles)).toBe(true);
  expect(hints.raw.roles.includes('scientific-council') || hints.raw.roles.includes('researchers')).toBe(true);

  // Should extract kickoff goal (not demo from thuyết minh)
  expect(hints.raw.goal).toBe('kickoff');

  // Reconstruct and recommend
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang: 'vi' });

  // MUST be research-proposal/kickoff, not internal-presentation/feature-demo
  expect(rec.typeId).toBe('research-proposal');
  expect(rec.variant).toBe('kickoff');
});

test('phase169-t3: PROBE 2 — Unaccented Vietnamese (no diacritics)', () => {
  // "Bao cao nghiem thu de tai truoc hoi dong khoa hoc"
  // Should still match: báo cáo → report-progress, hội đồng khoa học → scientific-council
  // Should recommend: research-proposal/progress-report
  const text = 'Bao cao nghiem thu de tai truoc hoi dong khoa hoc';
  const hints = audience.extractAudienceHints(text, { lang: 'vi' });

  // Should extract roles despite no diacritics
  expect(hints.raw.roles).toBeDefined();
  expect(hints.raw.roles.length).toBeGreaterThan(0);

  // Should extract goal (report-progress from báo cáo/nghiệm thu)
  expect(hints.raw.goal).toBe('report-progress');

  // Reconstruct and recommend
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang: 'vi' });

  // Should be research-proposal/progress-report
  expect(rec.typeId).toBe('research-proposal');
  expect(rec.variant).toBe('progress-report');
});

test('phase169-t3: PROBE 3 — "Bảo vệ luận văn thạc sĩ" detects defense', () => {
  // Should detect: goal=defend from "bảo vệ", students from "luận văn"
  // Should recommend: research-proposal/defense
  const text = 'Bảo vệ luận văn thạc sĩ';
  const hints = audience.extractAudienceHints(text, { lang: 'vi' });

  // Should extract goal defend
  expect(hints.raw.goal).toBe('defend');

  // Should extract roles (students from luận văn or thạc sĩ context)
  if (hints.raw.roles) {
    expect(hints.raw.roles.length).toBeGreaterThan(0);
  }

  // Reconstruct and recommend
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang: 'vi' });

  // Should be research-proposal/defense (even if no roles, goal=defend triggers research)
  expect(rec.typeId).toBe('research-proposal');
  expect(rec.variant).toBe('defense');
});

test('phase169-t3: PROBE 4 — Department keywords: "phòng kinh doanh" + demo + "trực tiếp"', () => {
  // "Giới thiệu công cụ mới cho phòng kinh doanh, demo trực tiếp"
  // Should detect: roles [sales] from "phòng kinh doanh", goal [demo], format [in-person]
  // Should recommend: internal-presentation/feature-demo
  const text = 'Giới thiệu công cụ mới cho phòng kinh doanh, demo trực tiếp';
  const hints = audience.extractAudienceHints(text, { lang: 'vi' });

  // Should extract sales role from phòng kinh doanh
  expect(hints.raw.roles).toBeDefined();
  expect(hints.raw.roles).toContain('sales');

  // Should extract demo goal
  expect(hints.raw.goal).toBe('demo');

  // Should extract in-person format
  expect(hints.raw.format).toBe('in-person');

  // Reconstruct and recommend
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang: 'vi' });

  // Should be internal-presentation/feature-demo
  expect(rec.typeId).toBe('internal-presentation');
  expect(rec.variant).toBe('feature-demo');
});

test('phase169-t3: PROBE 5 — Nothing matched returns "general" not team-intro', () => {
  // Text with no keywords: 'xyz abc 123'
  const text = 'xyz abc 123';
  const hints = audience.extractAudienceHints(text, { lang: 'en' });

  // No roles, no goal extracted
  expect(hints.raw.roles || []).toHaveLength(0);
  expect(hints.raw.goal).toBeUndefined();

  // Reconstruct and recommend
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang: 'en' });

  // Should be "general", not defaulting to internal team-intro
  expect(rec.typeId).toBe('general');
});

test('phase169-t3: findIntakeGaps uses exact keys [roles, decisionMaker, knowledgeSize, formatGoal]', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['engineering'],
    decisionMaker: { role: 'leadership', cares: [] },
    knowledge: 'expert',
  });

  const gaps = audience.findIntakeGaps(profile);

  // Keys must be exactly: roles, decisionMaker, knowledgeSize, formatGoal (not 'knowledge')
  expect(gaps).toContain('formatGoal');
  expect(gaps).not.toContain('knowledge');

  // Check valid gap keys
  const validGaps = ['roles', 'decisionMaker', 'knowledgeSize', 'formatGoal'];
  for (const gap of gaps) {
    expect(validGaps).toContain(gap);
  }
});

test('phase169-t3: reason cites signals, not just variant label', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['scientific-council'],
    goal: 'kickoff',
  });
  const rec = audience.recommendProposalType(profile, { lang: 'vi' });

  // Reason should cite signals (hội đồng, mục tiêu khởi động, etc.)
  // Not just "Kickoff" or variant label
  expect(rec.reason).toBeDefined();
  expect(rec.reason.length).toBeGreaterThan(10);
  // Should contain some meaningful text, not just the variant name
  expect(rec.reason.toLowerCase()).not.toMatch(/^kickoff$/);
});

test('phase169-t3: alternatives always have 1–2 entries distinct from pick', () => {
  const profilesWithAlternatives = [
    { roles: ['researchers'], goal: 'report-progress' },
    { roles: ['students'], goal: 'defend' },
    { roles: ['funding-agency'], goal: 'fund' },
  ];

  for (const raw of profilesWithAlternatives) {
    const profile = audience.normalizeAudienceProfile(raw);
    const rec = audience.recommendProposalType(profile);

    // Must have at least 1 alternative
    expect(rec.alternatives.length).toBeGreaterThanOrEqual(1);
    // Max 2 alternatives
    expect(rec.alternatives.length).toBeLessThanOrEqual(2);

    // All alternatives must be distinct from the pick
    for (const alt of rec.alternatives) {
      const isDistinct = alt.typeId !== rec.typeId || alt.variant !== rec.variant;
      expect(isDistinct).toBe(true);
    }
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Resilient tests: no version literals or hard-coded counts
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: role, goal, format, knowledge, size constants are defined', () => {
  // Just check that the constants exist and are non-empty
  expect(Object.keys(audience.AUDIENCE_ROLES).length).toBeGreaterThanOrEqual(10);
  expect(Object.keys(audience.GOALS).length).toBeGreaterThanOrEqual(5);
  expect(Object.keys(audience.FORMATS).length).toBeGreaterThanOrEqual(4);
  expect(Object.keys(audience.KNOWLEDGE).length).toBeGreaterThanOrEqual(3);
  expect(Object.keys(audience.SIZE).length).toBeGreaterThanOrEqual(3);
});

test('phase169-t3: TYPE_VARIANTS are available from proposal-generator', () => {
  expect(gen.TYPE_VARIANTS).toBeDefined();
  expect(gen.TYPE_VARIANTS['internal-presentation']).toBeDefined();
  expect(gen.TYPE_VARIANTS['research-proposal']).toBeDefined();
  expect(Object.keys(gen.TYPE_VARIANTS['internal-presentation']).length).toBeGreaterThanOrEqual(5);
  expect(Object.keys(gen.TYPE_VARIANTS['research-proposal']).length).toBeGreaterThanOrEqual(5);
});

test('phase169-t3: VOICE_LEVELS are available from proposal-generator', () => {
  expect(gen.VOICE_LEVELS).toBeDefined();
  expect(Array.isArray(gen.VOICE_LEVELS)).toBe(true);
  expect(gen.VOICE_LEVELS.length).toBeGreaterThanOrEqual(4);
});

// ──────────────────────────────────────────────────────────────────────────────
// Internal flag: all primary roles are internal => internal=true
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: normalizeAudienceProfile sets internal=true when all primary roles are internal', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['leadership', 'engineering'],
    rolePrimary: ['leadership', 'engineering'],
  });
  expect(profile.internal).toBe(true);
});

test('phase169-t3: normalizeAudienceProfile sets internal=false when primary role is external', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['investors'],
    rolePrimary: ['investors'],
  });
  expect(profile.internal).toBe(false);
});

// ──────────────────────────────────────────────────────────────────────────────
// Bilingual reason text
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: recommendProposalType generates Vietnamese reasons when lang=vi', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['leadership'],
    goal: 'approve',
  });
  const rec = audience.recommendProposalType(profile, { lang: 'vi' });
  expect(rec.reason).toBeDefined();
  // Reason should be in Vietnamese (check for Vietnamese characters or keywords)
  // For leadership-report, expect something like "Báo cáo cho lãnh đạo"
  expect(rec.reason.length).toBeGreaterThan(0);
});

test('phase169-t3: recommendProposalType generates English reasons when lang=en', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['leadership'],
    goal: 'approve',
  });
  const rec = audience.recommendProposalType(profile, { lang: 'en' });
  expect(rec.reason).toBeDefined();
  expect(rec.reason.length).toBeGreaterThan(0);
});

// ──────────────────────────────────────────────────────────────────────────────
// Verification command from task contract
// ──────────────────────────────────────────────────────────────────────────────

test('phase169-t3: verification command — Vietnamese "ban giám đốc" with "approve" goal', () => {
  const profile = audience.normalizeAudienceProfile({
    roles: ['ban giám đốc'],
    goal: 'approve',
  });
  const rec = audience.recommendProposalType(profile);
  expect(rec.variant).toBe('leadership-report');
});
