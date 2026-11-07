#!/usr/bin/env node
'use strict';
/**
 * ViePilot AskUserQuestion check (BUG-035 G8). Claude Code Stop hook, opt-in
 * (`vp-tools hooks install --auq-check [warn|block]`).
 *
 * When the last assistant message of the turn ends with a question written in prose and the turn made no
 * AskUserQuestion call, it reports it: `warn` (default) shows a system message to the user; `block` asks the
 * agent to continue and re-ask with AskUserQuestion (once — skipped when `stop_hook_active` is set).
 *
 * Never fails the session: errors go to stderr, exit code is always 0.
 */

const fs = require('fs');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch (_) { return ''; }
}

const isToolResultOnly = (content) => Array.isArray(content) && content.length > 0 && content.every((c) => c && c.type === 'tool_result');

/**
 * The current turn: transcript entries after the last real user prompt (tool results are not prompts).
 * @param {object[]} entries parsed JSONL lines
 */
function lastTurn(entries) {
  let start = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    const msg = e && e.message;
    if (e && e.type === 'user' && msg && !isToolResultOnly(msg.content)) { start = i + 1; break; }
  }
  return entries.slice(start);
}

/** Text of the last assistant text block, with fenced code removed. */
function lastAssistantText(turn) {
  for (let i = turn.length - 1; i >= 0; i--) {
    const e = turn[i];
    if (!e || e.type !== 'assistant' || !e.message) continue;
    const content = Array.isArray(e.message.content) ? e.message.content : [{ type: 'text', text: String(e.message.content || '') }];
    const texts = content.filter((c) => c && c.type === 'text' && String(c.text || '').trim());
    if (texts.length) return texts[texts.length - 1].text.replace(/```[\s\S]*?```/g, '').trim();
  }
  return '';
}

function usedAskUserQuestion(turn) {
  return turn.some((e) => e && e.type === 'assistant' && e.message && Array.isArray(e.message.content)
    && e.message.content.some((c) => c && c.type === 'tool_use' && c.name === 'AskUserQuestion'));
}

/** True when the text's last line ends with a question mark (ASCII or full-width). */
function endsWithQuestion(text) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return false;
  return /[?？]\s*[*_)"'”»]*$/.test(lines[lines.length - 1]);
}

/**
 * @param {object[]} entries
 * @returns {{violation: boolean, question: string}}
 */
function checkTranscript(entries) {
  const turn = lastTurn(entries);
  const text = lastAssistantText(turn);
  const violation = endsWithQuestion(text) && !usedAskUserQuestion(turn);
  const lastLine = text.split('\n').map((l) => l.trim()).filter(Boolean).pop() || '';
  return { violation, question: violation ? lastLine : '' };
}

function readTranscript(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
}

function main() {
  let payload = {};
  try { payload = JSON.parse(readStdin() || '{}'); } catch (_) { payload = {}; }
  const mode = process.argv.includes('block') ? 'block' : 'warn';
  if (!payload.transcript_path || !fs.existsSync(payload.transcript_path)) return;
  const { violation, question } = checkTranscript(readTranscript(payload.transcript_path));
  if (!violation) return;
  const msg = `[viepilot] The turn ended with a question in prose ("${question.slice(0, 120)}") — ViePilot asks every question with AskUserQuestion (templates/auq-policy.md).`;
  if (mode === 'block' && !payload.stop_hook_active) {
    process.stdout.write(JSON.stringify({ decision: 'block', reason: `${msg} Ask it again with AskUserQuestion, with concrete options.` }) + '\n');
  } else {
    process.stdout.write(JSON.stringify({ systemMessage: msg }) + '\n');
  }
}

if (require.main === module) {
  try { main(); } catch (e) { process.stderr.write(`[viepilot auq-check] ${e.message}\n`); }
  process.exit(0);
}

module.exports = { checkTranscript, lastTurn, endsWithQuestion, usedAskUserQuestion };
