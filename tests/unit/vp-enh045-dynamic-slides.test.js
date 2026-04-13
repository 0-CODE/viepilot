'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

describe('ENH-045 Dynamic Slides + Visual Design', () => {

  describe('workflows/proposal.md — slide count + designConfig', () => {
    let content;
    beforeAll(() => { content = read('workflows/proposal.md'); });

    test('hardcap rule removed — no "slides.length MUST equal" text', () => {
      expect(content).not.toMatch(/slides\.length MUST equal/);
    });

    test('dynamic slide count rule documented', () => {
      expect(content).toMatch(/ENH-045.*dynamic|dynamic.*ENH-045|no hard maximum/i);
    });

    test('designConfig field documented in manifest schema', () => {
      expect(content).toMatch(/designConfig/);
    });

    test('modern-tech layoutStyle listed', () => {
      expect(content).toMatch(/modern-tech/);
    });

    test('enterprise layoutStyle listed', () => {
      expect(content).toMatch(/enterprise/);
    });

    test('creative layoutStyle listed', () => {
      expect(content).toMatch(/creative/);
    });

    test('content-aware split rules documented (technicalNarrative)', () => {
      expect(content).toMatch(/technicalNarrative|technical.*narrative/i);
    });

    test('content-aware split rules documented (team > 4)', () => {
      expect(content).toMatch(/team.*4|4.*team/i);
    });

    test('DESIGN SELECTION block present in proposal.md', () => {
      expect(content).toMatch(/DESIGN SELECTION/);
    });

    test('success_criteria updated — slide count check uses >= base skeleton', () => {
      expect(content).not.toMatch(/slide count matches PROPOSAL_TYPES spec/);
      expect(content).toMatch(/designConfig.*field present|field present.*designConfig/i);
    });
  });

  describe('lib/proposal-generator.cjs — DESIGN_CONFIGS + getDesignConfig', () => {
    let gen;
    beforeAll(() => { gen = require(path.join(ROOT, 'lib', 'proposal-generator.cjs')); });

    test('DESIGN_CONFIGS exported', () => {
      expect(gen.DESIGN_CONFIGS).toBeDefined();
      expect(typeof gen.DESIGN_CONFIGS).toBe('object');
    });

    test('DESIGN_CONFIGS has modern-tech key', () => {
      expect(gen.DESIGN_CONFIGS['modern-tech']).toBeDefined();
    });

    test('DESIGN_CONFIGS has enterprise key', () => {
      expect(gen.DESIGN_CONFIGS['enterprise']).toBeDefined();
    });

    test('DESIGN_CONFIGS has creative key', () => {
      expect(gen.DESIGN_CONFIGS['creative']).toBeDefined();
    });

    test('getDesignConfig exported', () => {
      expect(typeof gen.getDesignConfig).toBe('function');
    });

    test('getDesignConfig: fintech/banking context returns enterprise config', () => {
      const cfg = gen.getDesignConfig({ sector: 'banking finance' });
      expect(cfg.layoutStyle).toBe('enterprise');
    });

    test('getDesignConfig: startup/creative context returns creative config', () => {
      const cfg = gen.getDesignConfig({ sector: 'startup creative agency' });
      expect(cfg.layoutStyle).toBe('creative');
    });

    test('getDesignConfig: no context returns modern-tech config', () => {
      const cfg = gen.getDesignConfig({});
      expect(cfg.layoutStyle).toBe('modern-tech');
    });

    test('each DESIGN_CONFIGS entry has colorPalette, layoutStyle, fontPair', () => {
      for (const key of ['modern-tech', 'enterprise', 'creative']) {
        const cfg = gen.DESIGN_CONFIGS[key];
        expect(cfg.colorPalette).toBeTruthy();
        expect(cfg.layoutStyle).toBeTruthy();
        expect(cfg.fontPair).toBeTruthy();
      }
    });
  });

  describe('scripts/gen-proposal-pptx.cjs — PALETTES + rich layouts', () => {
    let scriptContent;
    beforeAll(() => { scriptContent = read('scripts/gen-proposal-pptx.cjs'); });

    test('PALETTES map present', () => {
      expect(scriptContent).toMatch(/const PALETTES\s*=/);
    });

    test('PALETTES has modern-tech key', () => {
      expect(scriptContent).toMatch(/['"]modern-tech['"]/);
    });

    test('PALETTES has enterprise key', () => {
      expect(scriptContent).toMatch(/['"]enterprise['"]/);
    });

    test('PALETTES has creative key', () => {
      expect(scriptContent).toMatch(/['"]creative['"]/);
    });

    test('addTimelineGanttSlide function defined', () => {
      expect(scriptContent).toMatch(/function addTimelineGanttSlide/);
    });

    test('addTeamCardSlide function defined', () => {
      expect(scriptContent).toMatch(/function addTeamCardSlide/);
    });

    test('addInvestmentVisualSlide function defined', () => {
      expect(scriptContent).toMatch(/function addInvestmentVisualSlide/);
    });

    test('3 project-proposal palette variants generated in main()', () => {
      // variants built dynamically: `project-proposal-${pal}.pptx`
      expect(scriptContent).toMatch(/project-proposal.*\$\{pal\}|project-proposal.*modern-tech|modern-tech.*enterprise.*creative/);
      // confirm all 3 palette keys are iterated
      expect(scriptContent).toMatch(/['"]modern-tech['"].*['"]enterprise['"].*['"]creative['"]/s);
    });

    test('makePres accepts paletteKey parameter', () => {
      expect(scriptContent).toMatch(/function makePres\s*\(\s*paletteKey/);
    });
  });

  describe('templates/proposal/pptx — generated variants', () => {
    test('project-proposal-modern-tech.pptx exists', () => {
      expect(exists('templates/proposal/pptx/project-proposal-modern-tech.pptx')).toBe(true);
    });

    test('project-proposal-enterprise.pptx exists', () => {
      expect(exists('templates/proposal/pptx/project-proposal-enterprise.pptx')).toBe(true);
    });

    test('project-proposal-creative.pptx exists', () => {
      expect(exists('templates/proposal/pptx/project-proposal-creative.pptx')).toBe(true);
    });
  });

});
