'use strict';

/**
 * Test suite for phase 169, task 5: ENH-119/120 workflow updates
 * Verifies: purpose_consult, audience_intake, recommendation flow, variant documentation
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('Phase 169.5 — ENH-119/120 Workflow Updates', () => {

  let workflowContent;
  let skillContent;
  let genLib;

  beforeAll(() => {
    const workflowPath = path.join(__dirname, '../../workflows/proposal.md');
    const skillPath = path.join(__dirname, '../../skills/vp-proposal/SKILL.md');

    workflowContent = fs.readFileSync(workflowPath, 'utf8');
    skillContent = fs.readFileSync(skillPath, 'utf8');

    // Load lib/proposal-generator.cjs to get TYPE_VARIANTS
    genLib = require('../../lib/proposal-generator.cjs');
  });

  describe('Step order validation', () => {
    it('should have purpose_consult step before audience_intake', () => {
      const purposeIdx = workflowContent.indexOf('<step name="purpose_consult">');
      const audienceIdx = workflowContent.indexOf('<step name="audience_intake">');

      assert(purposeIdx !== -1, 'purpose_consult step not found');
      assert(audienceIdx !== -1, 'audience_intake step not found');
      assert(purposeIdx < audienceIdx, 'purpose_consult must come before audience_intake');
    });

    it('should have audience_intake step before type_selection', () => {
      const audienceIdx = workflowContent.indexOf('<step name="audience_intake">');
      const typeIdx = workflowContent.indexOf('<step name="type_selection">');

      assert(audienceIdx !== -1, 'audience_intake step not found');
      assert(typeIdx !== -1, 'type_selection step not found');
      assert(audienceIdx < typeIdx, 'audience_intake must come before type_selection');
    });
  });

  describe('API function references', () => {
    it('should reference extractAudienceHints in purpose_consult', () => {
      const purposeSection = workflowContent.slice(
        workflowContent.indexOf('<step name="purpose_consult">'),
        workflowContent.indexOf('<step name="audience_intake">')
      );
      assert(purposeSection.includes('extractAudienceHints'),
        'extractAudienceHints not referenced in purpose_consult');
    });

    it('should reference findIntakeGaps in audience_intake', () => {
      const audienceSection = workflowContent.slice(
        workflowContent.indexOf('<step name="audience_intake">'),
        workflowContent.indexOf('<step name="type_selection">')
      );
      assert(audienceSection.includes('findIntakeGaps'),
        'findIntakeGaps not referenced in audience_intake');
    });

    it('should reference recommendProposalType in type_selection', () => {
      assert(workflowContent.includes('recommendProposalType'),
        'recommendProposalType not referenced in type_selection');
    });

    it('should reference getSkeleton for variants', () => {
      assert(workflowContent.includes('getSkeleton'),
        'getSkeleton not referenced for variant documentation');
    });
  });

  describe('Variant documentation', () => {
    it('should document internal-presentation variants section', () => {
      assert(workflowContent.includes('### internal-presentation (variants)'),
        'internal-presentation variants section not found');
    });

    it('should document research-proposal variants section', () => {
      assert(workflowContent.includes('### research-proposal (variants)'),
        'research-proposal variants section not found');
    });

    it('should list all 5 internal variants with correct IDs', () => {
      const internalVariants = genLib.TYPE_VARIANTS['internal-presentation'];
      const variantIds = Object.keys(internalVariants);

      for (const variantId of variantIds) {
        const variant = internalVariants[variantId];
        // Check for variant label section (e.g., "#### team-intro (8 slides)")
        const pattern = `#### ${variantId} (${variant.slides} slides)`;
        assert(workflowContent.includes(pattern),
          `internal variant "${variantId}" not properly documented`);
      }
    });

    it('should list all 5 research variants with correct IDs', () => {
      const researchVariants = genLib.TYPE_VARIANTS['research-proposal'];
      const variantIds = Object.keys(researchVariants);

      for (const variantId of variantIds) {
        const variant = researchVariants[variantId];
        // Check for variant label section (e.g., "#### grant-proposal (12 slides)")
        const pattern = `#### ${variantId} (${variant.slides} slides)`;
        assert(workflowContent.includes(pattern),
          `research variant "${variantId}" not properly documented`);
      }
    });

    it('should note that research variants have citations/references section', () => {
      const researchSection = workflowContent.slice(
        workflowContent.indexOf('### research-proposal (variants)'),
        workflowContent.indexOf('If `--dry-run`')
      );
      assert(researchSection.includes('citations: true'),
        'research variants should note citations: true');
      assert(researchSection.includes('references section'),
        'research variants should mention references section');
    });
  });

  describe('Manifest and error handling', () => {
    it('should include variant field in manifest example', () => {
      assert(workflowContent.includes('"variant":'),
        'manifest example missing variant field');
    });

    it('should include audienceProfile field in manifest example', () => {
      assert(workflowContent.includes('"audienceProfile":'),
        'manifest example missing audienceProfile field');
    });

    it('should include unknown --variant error row in error table', () => {
      const start = workflowContent.indexOf('## Error Handling');
      const errorTable = workflowContent.slice(start, workflowContent.indexOf('\n---', start));
      assert(errorTable.includes('Unknown `--variant`'),
        'error table missing unknown --variant row');
    });

    it('documents suggestDuration default and the type-aware research rubric', () => {
      assert(workflowContent.includes('suggestDuration('), 'Step 4b missing suggestDuration default');
      assert(workflowContent.includes('getRubric(type)'), 'Step 8b missing getRubric(type)');
    });
  });

  describe('Success criteria updates', () => {
    it('should have purpose_consult in success criteria', () => {
      assert(workflowContent.includes('Purpose consult'),
        'success criteria missing purpose_consult item');
    });

    it('should have audience_intake in success criteria', () => {
      assert(workflowContent.includes('Audience intake'),
        'success criteria missing audience_intake item');
    });

    it('should have type recommendation in success criteria', () => {
      assert(workflowContent.includes('Type recommendation'),
        'success criteria missing type recommendation item');
    });
  });

  describe('Step 8b persona review updates', () => {
    it('should pass variant and audienceProfile to selectPersonas', () => {
      const step8Section = workflowContent.slice(
        workflowContent.indexOf('<step name="persona_review_council">'),
        workflowContent.indexOf('<step name="google_slides_upload">')
      );
      assert(step8Section.includes('variant'),
        'selectPersonas call should pass variant parameter');
      assert(step8Section.includes('audienceProfile'),
        'selectPersonas call should pass audienceProfile parameter');
    });
  });

  describe('SKILL.md version and flags', () => {
    it('should be version 0.4.0 or higher (>=0.4.0)', () => {
      const versionMatch = skillContent.match(/version:\s*([\d.]+)/);
      assert(versionMatch, 'version field not found in SKILL.md');

      const version = versionMatch[1];
      const [major, minor] = version.split('.').map(Number);
      const isValid = major > 0 || (major === 0 && minor >= 4);
      assert(isValid, `SKILL version ${version} must be >= 0.4.0`);
    });

    it('should document --purpose flag', () => {
      assert(skillContent.includes('--purpose'),
        'SKILL.md missing --purpose flag documentation');
      assert(skillContent.includes('purpose, context, audience, desired outcome'),
        '--purpose flag should describe purpose/context/audience/outcome');
    });

    it('should document --audience flag', () => {
      assert(skillContent.includes('--audience'),
        'SKILL.md missing --audience flag documentation');
      assert(skillContent.includes('normalizeAudienceProfile'),
        '--audience flag documentation should mention normalizeAudienceProfile');
    });

    it('should document --variant flag with all variant IDs', () => {
      assert(skillContent.includes('--variant'),
        'SKILL.md missing --variant flag documentation');

      // Check for all internal variant IDs
      const internalVariants = Object.keys(genLib.TYPE_VARIANTS['internal-presentation']);
      for (const id of internalVariants) {
        assert(skillContent.includes(id),
          `SKILL.md should mention internal variant "${id}"`);
      }

      // Check for all research variant IDs
      const researchVariants = Object.keys(genLib.TYPE_VARIANTS['research-proposal']);
      for (const id of researchVariants) {
        assert(skillContent.includes(id),
          `SKILL.md should mention research variant "${id}"`);
      }
    });

    it('should document new proposal types: internal-presentation and research-proposal', () => {
      assert(skillContent.includes('internal-presentation'),
        'SKILL.md should document internal-presentation type');
      assert(skillContent.includes('research-proposal'),
        'SKILL.md should document research-proposal type');
    });

    it('should mention Purpose Consult step', () => {
      assert(skillContent.includes('Purpose Consult'),
        'SKILL.md should mention Purpose Consult step');
    });

    it('should mention Audience Intake step', () => {
      assert(skillContent.includes('Audience Intake'),
        'SKILL.md should mention Audience Intake step');
    });

    it('should mention recommendation flow', () => {
      assert(skillContent.includes('recommendation'),
        'SKILL.md should mention recommendation flow');
      assert(skillContent.includes('recommendProposalType'),
        'SKILL.md should reference recommendProposalType');
    });

    it('should update invocation banner version to 0.4.0 or later', () => {
      const m = skillContent.match(/VP-PROPOSAL\s+v(\d+)\.(\d+)\.(\d+)/);
      assert(m, 'banner version not found');
      const [maj, min] = [Number(m[1]), Number(m[2])];
      assert(maj > 0 || min >= 4, `banner v${m[1]}.${m[2]}.${m[3]} must be >= 0.4.0`);
    });
  });

  describe('No Vietnamese text in workflow/SKILL (enh031 test)', () => {
    it('should not have Vietnamese text in workflow', () => {
      // Common Vietnamese words/phrases that would appear in examples
      const vietnamesePatterns = [
        /ban\s+gi[áa]m\s+đ[ốo]c/i,  // ban giám đốc
        /nh[âa]n\s+vi[êe]n/i,        // nhân viên
        /kh[âa]ch\s+h[àa]ng/i,       // khách hàng
        /đ[ối]i\s+t[ác]/i,           // đối tác
      ];

      for (const pattern of vietnamesePatterns) {
        assert(!pattern.test(workflowContent),
          `Vietnamese text detected in workflow: ${pattern}`);
      }
    });

    it('should not have Vietnamese text in SKILL.md', () => {
      const vietnamesePatterns = [
        /ban\s+gi[áa]m\s+đ[ốo]c/i,  // ban giám đốc
        /nh[âa]n\s+vi[êe]n/i,        // nhân viên
        /kh[âa]ch\s+h[àa]ng/i,       // khách hàng
        /đ[ối]i\s+t[ác]/i,           // đối tác
      ];

      for (const pattern of vietnamesePatterns) {
        assert(!pattern.test(skillContent),
          `Vietnamese text detected in SKILL.md: ${pattern}`);
      }
    });
  });

  describe('Variant ID enumeration (computed from TYPE_VARIANTS)', () => {
    it('should include all internal variant IDs in documentation', () => {
      const internalVariants = genLib.TYPE_VARIANTS['internal-presentation'];
      const variantIds = Object.keys(internalVariants);

      assert.strictEqual(variantIds.length, 5, 'should have 5 internal variants');

      // Verify each is in workflow docs
      const internalSection = workflowContent.slice(
        workflowContent.indexOf('### internal-presentation (variants)'),
        workflowContent.indexOf('### research-proposal (variants)')
      );

      for (const id of variantIds) {
        assert(internalSection.includes(`#### ${id}`),
          `internal variant "${id}" should be documented`);
      }
    });

    it('should include all research variant IDs in documentation', () => {
      const researchVariants = genLib.TYPE_VARIANTS['research-proposal'];
      const variantIds = Object.keys(researchVariants);

      assert.strictEqual(variantIds.length, 5, 'should have 5 research variants');

      // Verify each is in workflow docs
      const researchSection = workflowContent.slice(
        workflowContent.indexOf('### research-proposal (variants)'),
        workflowContent.indexOf('If `--dry-run`')
      );

      for (const id of variantIds) {
        assert(researchSection.includes(`#### ${id}`),
          `research variant "${id}" should be documented`);
      }
    });

    it('should have total of 10 variants documented (5 internal + 5 research)', () => {
      const internalCount = Object.keys(genLib.TYPE_VARIANTS['internal-presentation']).length;
      const researchCount = Object.keys(genLib.TYPE_VARIANTS['research-proposal']).length;

      assert.strictEqual(internalCount + researchCount, 10,
        'should document exactly 10 variants (5 + 5)');
    });
  });

});
