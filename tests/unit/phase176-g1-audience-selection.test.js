'use strict';

const sim = require('../../lib/proposal-simulation.cjs');
const pr = require('../../lib/proposal-review.cjs');
const audience = require('../../lib/proposal-audience.cjs');

const TEAM = { roles: [{ id: 'engineering', weight: 'primary' }, { id: 'product', weight: 'secondary' }] };
const OUTSIDERS = [2, 5, 6, 8, 10];

describe('BUG-035 G1 — who can be in an internal room', () => {
  test('team-intro hall seats no investor, procurement, customer, journalist or CFO', () => {
    const hall = sim.selectHall({ type: 'internal-presentation', variant: 'team-intro', audienceProfile: TEAM });
    for (const id of OUTSIDERS) expect(hall.listeners).not.toContain(id);
    expect(hall.listeners).toContain(20);
    expect(hall.primary.length).toBeGreaterThan(0);
    expect(hall.listeners.length).toBeGreaterThanOrEqual(sim.HALL_MIN);
  });

  test('quick council for an engineering team-intro has no marketing or designer', () => {
    const ids = pr.selectPersonas({ type: 'internal-presentation', variant: 'team-intro', audienceProfile: TEAM });
    expect(ids).not.toContain(14);
    expect(ids).not.toContain(13);
    for (const id of OUTSIDERS) expect(ids).not.toContain(id);
  });

  test('an outsider is seated when the audience has that role', () => {
    const hall = sim.selectHall({ type: 'internal-presentation', variant: 'team-intro', audienceProfile: { roles: [...TEAM.roles, { id: 'investors', weight: 'secondary' }] } });
    expect(hall.listeners).toContain(5);
  });

  test('external types are unrestricted; --hall all seats everyone', () => {
    expect(sim.selectHall({ type: 'product-pitch' }).listeners).toContain(5);
    expect(sim.selectHall({ type: 'internal-presentation', hall: 'all' }).listeners).toContain(5);
  });

  test('product, qa and tech-lead roles map to fitting personas', () => {
    const map = pr.loadRoleMapping();
    const names = Object.fromEntries(pr.loadPersonas().map((p) => [p.id, p.name_en]));
    expect(names[map.product[0]]).toMatch(/product/i);
    expect(names[map.qa[0]]).toMatch(/QA|test/i);
    expect(map['tech-lead']).toContain(4);
    expect(map.engineering).not.toContain(13);
  });
});

describe('BUG-035 G1 — audience profile reaches the manifest', () => {
  test('resolveAudienceProfile: manifest first, then the session decision', () => {
    expect(audience.resolveAudienceProfile({ manifest: { audienceProfile: TEAM } })).toBe(TEAM);
    expect(audience.resolveAudienceProfile({ manifest: {}, session: { decisions: { audienceProfile: { value: TEAM, source: 'auq' } } } })).toBe(TEAM);
    expect(audience.resolveAudienceProfile({})).toBeNull();
  });

  test('checkManifestAudience flags a missing or empty profile', () => {
    expect(audience.checkManifestAudience({ audience: 'Đội kỹ thuật' })[0]).toMatch(/missing/);
    expect(audience.checkManifestAudience({ audienceProfile: { roles: [] } })[0]).toMatch(/roles/);
    expect(audience.checkManifestAudience({ audienceProfile: TEAM })).toEqual([]);
  });

  test('workflow manifest schema is valid JSON-shaped and requires audienceProfile', () => {
    const wf = require('fs').readFileSync(require('path').join(__dirname, '../../workflows/proposal.md'), 'utf8');
    expect(wf).not.toMatch(/"project-proposal",,/);
    expect(wf).toMatch(/checkManifestAudience/);
    expect(wf).toMatch(/resolveAudienceProfile/);
  });
});
