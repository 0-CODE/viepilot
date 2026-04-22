'use strict';

const fs   = require('fs');
const path = require('path');

const AUTONOMOUS_MD = fs.readFileSync(
  path.join(__dirname, '../../workflows/autonomous.md'), 'utf8'
);
const SCAFFOLD_DOC = fs.readFileSync(
  path.join(__dirname, '../../docs/user/features/scaffold-first.md'), 'utf8'
);

describe('Phase 102 — BUG-020 Scaffold-First Gate contracts', () => {

  describe('workflows/autonomous.md — Scaffold-First Gate section', () => {
    test('1. contains Scaffold-First Gate (BUG-020) section header', () => {
      expect(AUTONOMOUS_MD).toContain('Scaffold-First Gate (BUG-020)');
    });

    test('2. contains init_command: field reference', () => {
      expect(AUTONOMOUS_MD).toContain('init_command:');
    });

    test('3. contains marker_file: field reference', () => {
      expect(AUTONOMOUS_MD).toContain('marker_file:');
    });

    test('4. contains laravel scaffold command (composer create-project)', () => {
      expect(AUTONOMOUS_MD).toContain('composer create-project');
    });

    test('5. contains nextjs scaffold command (create-next-app)', () => {
      expect(AUTONOMOUS_MD).toContain('create-next-app');
    });

    test('6. contains nestjs scaffold command (@nestjs/cli)', () => {
      expect(AUTONOMOUS_MD).toContain('@nestjs/cli');
    });

    test('7. contains rails scaffold command (rails new)', () => {
      expect(AUTONOMOUS_MD).toContain('rails new');
    });

    test('8. contains django scaffold command (django-admin startproject)', () => {
      expect(AUTONOMOUS_MD).toContain('django-admin startproject');
    });

    test('9. contains spring-boot scaffold entry', () => {
      expect(AUTONOMOUS_MD).toContain('spring-boot');
    });

    test('10. block list contains artisan', () => {
      expect(AUTONOMOUS_MD).toContain('`artisan`');
    });

    test('11. block list contains manage.py', () => {
      expect(AUTONOMOUS_MD).toContain('`manage.py`');
    });

    test('12. block list contains next.config', () => {
      expect(AUTONOMOUS_MD).toContain('next.config');
    });

    test('13. block list contains nest-cli.json', () => {
      expect(AUTONOMOUS_MD).toContain('`nest-cli.json`');
    });

    test('14. contains ⛔ stop signal for block list violation', () => {
      expect(AUTONOMOUS_MD).toContain('⛔ Scaffold-First Gate');
    });

    test('15. references docs/user/features/scaffold-first.md', () => {
      expect(AUTONOMOUS_MD).toContain('scaffold-first.md');
    });

    test('16. gate is positioned before Task start checkpoint', () => {
      const gateIdx = AUTONOMOUS_MD.indexOf('Scaffold-First Gate (BUG-020)');
      const checkpointIdx = AUTONOMOUS_MD.indexOf('Task start checkpoint');
      expect(gateIdx).toBeGreaterThan(-1);
      expect(checkpointIdx).toBeGreaterThan(-1);
      expect(gateIdx).toBeLessThan(checkpointIdx);
    });
  });

  describe('docs/user/features/scaffold-first.md', () => {
    test('17. file exists and is non-empty', () => {
      expect(SCAFFOLD_DOC.length).toBeGreaterThan(100);
    });

    test('18. contains ## Scaffold section header example', () => {
      expect(SCAFFOLD_DOC).toContain('## Scaffold');
    });

    test('19. contains init_command: field example', () => {
      expect(SCAFFOLD_DOC).toContain('init_command:');
    });

    test('20. contains marker_file: field example', () => {
      expect(SCAFFOLD_DOC).toContain('marker_file:');
    });

    test('21. contains supported stacks table', () => {
      expect(SCAFFOLD_DOC).toContain('laravel');
      expect(SCAFFOLD_DOC).toContain('nextjs');
      expect(SCAFFOLD_DOC).toContain('nestjs');
    });

    test('22. contains never-handcraft block list section', () => {
      expect(SCAFFOLD_DOC).toContain('Never-Handcraft');
    });

    test('23. contains bypass/waiver documentation', () => {
      expect(SCAFFOLD_DOC).toContain('scaffold_gate_waiver');
    });
  });

});
