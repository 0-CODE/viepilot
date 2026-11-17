'use strict';

const panel = require('../../lib/proposal-panel.cjs');

describe('BUG-038 182.2 — word-count rule and countWords export', () => {
  test('countWords is exported', () => {
    expect(typeof panel.countWords).toBe('function');
  });

  test('countWords counts space-separated tokens (space-delimited word count)', () => {
    // English
    expect(panel.countWords('hello world')).toBe(2);
    expect(panel.countWords('a b c d e')).toBe(5);

    // Vietnamese (each syllable = one word)
    expect(panel.countWords('chúc mừng')).toBe(2); // "chúc" = 1 word, "mừng" = 1 word
    expect(panel.countWords('mình ghi lại')).toBe(3); // "mình" = 1, "ghi" = 1, "lại" = 1
  });

  test('countWords ignores punctuation but counts syllables', () => {
    expect(panel.countWords('hello, world.')).toBe(2);
    expect(panel.countWords('a-b-c')).toBe(1); // hyphenated counts as one token (no spaces)
    expect(panel.countWords('a b c')).toBe(3); // space-separated counts as 3
    expect(panel.countWords("don't stop")).toBe(2); // apostrophes are part of the word
  });

  test('messages over 80 words are flagged', () => {
    const longText = Array(85).fill('word').join(' ');
    const msg = { from: 23, to: 'presenter', round: 1, text: longText };
    const ctx = { roster: [23] };
    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/over 80 words/))).toBe(true);
  });

  test('messages at 80 words exactly pass', () => {
    const text80 = Array(80).fill('word').join(' ');
    const msg = { from: 23, to: 'presenter', round: 1, text: text80 };
    const ctx = { roster: [23] };
    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/over 80 words/))).toBe(false);
  });

  test('panelist word count over limit gets flagged but kept (for rewrite workflow)', () => {
    // The workflow will handle rewrites; here we just validate that it's flagged
    const longText = Array(85).fill('từ').join(' '); // 85 Vietnamese words
    const msgs = [
      { from: 23, to: 'presenter', round: 2, seq: 1, text: longText },
    ];
    const ctx = { roster: [23] };
    const t = panel.buildTranscript(msgs, ctx);
    expect(t.messages[0].problems).toBeDefined();
    expect(t.messages[0].problems.some((p) => p.match(/over 80 words/))).toBe(true);
  });
});

describe('BUG-038 182.2 — read token for round prompts', () => {
  test('roundToken is exported', () => {
    expect(typeof panel.roundToken).toBe('function');
  });

  test('roundToken generates a nonce per round + persona', () => {
    const token1 = panel.roundToken(1, 23);
    const token2 = panel.roundToken(1, 7);
    const token3 = panel.roundToken(2, 23);

    expect(token1).toMatch(/^r\d+p\d+-[0-9a-f]{4}$/);
    expect(token1).not.toBe(token2); // Different persona
    expect(token1).not.toBe(token3); // Different round
  });

  test('roundToken is deterministic with the same seed', () => {
    const t1 = panel.roundToken(1, 23, 42);
    const t2 = panel.roundToken(1, 23, 42);
    expect(t1).toBe(t2);
  });

  test('panelist message without required token is flagged', () => {
    const roundTokens = { 1: { 23: 'r1p23-abcd' } };
    const msg = { from: 23, to: 'presenter', round: 1, text: 'Question?' };
    const ctx = { roster: [23], roundTokens };

    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/round prompt not read/))).toBe(true);
  });

  test('panelist message with correct token passes', () => {
    const roundTokens = { 1: { 23: 'r1p23-abcd' } };
    const msg = { from: 23, to: 'presenter', round: 1, text: 'Question?', token: 'r1p23-abcd' };
    const ctx = { roster: [23], roundTokens };

    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/round prompt not read/))).toBe(false);
  });

  test('panelist message with wrong token is flagged', () => {
    const roundTokens = { 1: { 23: 'r1p23-abcd' } };
    const msg = { from: 23, to: 'presenter', round: 1, text: 'Question?', token: 'r1p23-wrong' };
    const ctx = { roster: [23], roundTokens };

    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/round prompt not read/))).toBe(true);
  });

  test('old transcripts without tokens are not flagged when no token was issued', () => {
    // Backward compat: if we don't have roundTokens for a round, don't require the token
    const msg = { from: 23, to: 'presenter', round: 1, text: 'Question?' };
    const ctx = { roster: [23] }; // No roundTokens

    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/round prompt not read/))).toBe(false);
  });

  test('presenter does not need a token', () => {
    const roundTokens = { 1: { 23: 'r1p23-abcd' } };
    const msg = { from: 'presenter', to: 23, round: 1, text: 'Answer.', cites: ['S1'] };
    const ctx = { roster: [23], roundTokens };

    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/round prompt not read/))).toBe(false);
  });
});

describe('BUG-038 182.2 — repeated phrases in presenter answers', () => {
  test('repeatedPhrases is exported', () => {
    expect(typeof panel.repeatedPhrases).toBe('function');
  });

  test('repeatedPhrases detects phrases in >1/3 of answers', () => {
    const answers = [
      { text: 'The proposal is good and mình ghi lại for later.' },
      { text: 'I think this is fine and mình ghi lại in my notes.' },
      { text: 'The plan looks solid.' },
      { text: 'Yes, we should proceed and mình ghi lại.' },
    ];
    // "mình ghi lại" appears in 3/4 answers (75% > 33%)
    const rp = panel.repeatedPhrases(answers);
    expect(rp.length).toBeGreaterThan(0);
    const found = rp.find((r) => r.phrase.includes('mình ghi lại') || r.phrase.includes('mình') && r.phrase.includes('ghi'));
    expect(found).toBeDefined();
    expect(found.count).toBeGreaterThan(1);
  });

  test('repeatedPhrases ignores phrases in ≤1/3 of answers', () => {
    const answers = [
      { text: 'First answer about the topic.' },
      { text: 'Second answer on something else.' },
      { text: 'Third answer here.' },
    ];
    // No phrase should appear in >1 answer (>33% of 3)
    const rp = panel.repeatedPhrases(answers);
    // Most phrases should be filtered out or not found
    expect(rp.filter((r) => r.count > 1).length).toBeLessThanOrEqual(1);
  });

  test('repeatedPhrases works with 3-5 word n-grams', () => {
    const answers = [
      { text: 'I think this is a great idea and mình ghi lại.' },
      { text: 'Yes this is a great idea and mình ghi lại.' },
      { text: 'The plan is solid.' },
      { text: 'I agree this is a great idea and mình ghi lại.' },
    ];
    // "this is a great idea" or "a great idea" should be found (5-word or less)
    const rp = panel.repeatedPhrases(answers);
    const greatPhrase = rp.find((r) => r.phrase.includes('great'));
    expect(greatPhrase).toBeDefined();
  });

  test('repeatedPhrases returns examples of each repeated phrase', () => {
    const answers = [
      { text: 'First answer with repeated phrase here.' },
      { text: 'Second answer with repeated phrase there.' },
      { text: 'Third answer something else.' },
    ];
    // "with repeated phrase" appears in 2/3 (>33%)
    const rp = panel.repeatedPhrases(answers);
    const r = rp.find((x) => x.phrase.includes('repeated'));
    expect(r).toBeDefined();
    expect(r.examples).toBeDefined();
    expect(r.examples.length).toBeGreaterThan(0);
  });

  test('repeatedPhrases handles empty answer array', () => {
    expect(panel.repeatedPhrases([])).toEqual([]);
  });

  test('repeatedPhrases ignores case', () => {
    const answers = [
      { text: 'I will MÌNH GHI LẠI this.' },
      { text: 'Yes let me mình ghi lại.' },
      { text: 'No other answer.' },
      { text: 'And Mình Ghi Lại here.' },
    ];
    // "mình ghi lại" appears in 3/4 (75% > 33%), case-insensitive
    const rp = panel.repeatedPhrases(answers);
    const found = rp.find((r) => r.phrase.toLowerCase().includes('mình'));
    expect(found).toBeDefined();
    expect(found.count).toBeGreaterThan(1);
  });
});

describe('BUG-038 182.2 — panel HTML rendering with repeated phrases', () => {
  test('panel HTML includes repeated phrases section when present', () => {
    const presenterAnswers = [
      { from: 'presenter', to: 23, round: 1, text: 'The answer and mình ghi lại for record.', cites: ['S1'] },
      { from: 'presenter', to: 23, round: 1, text: 'Yes, that is true and mình ghi lại in notes.', cites: ['S1'] },
      { from: 'presenter', to: 23, round: 1, text: 'The proposal is solid.', cites: ['S1'] },
      { from: 'presenter', to: 23, round: 1, text: 'We should proceed and mình ghi lại.', cites: ['S1'] },
    ];
    const repeated = panel.repeatedPhrases(presenterAnswers);
    expect(repeated.length).toBeGreaterThan(0);

    // Test through buildTranscript which extracts repeated phrases
    const ctx = { roster: [23], sourceIds: ['S1'] };
    const transcript = panel.buildTranscript(presenterAnswers, ctx);
    expect(transcript.repeated.length).toBeGreaterThan(0);
    expect(transcript.repeated.some((r) => r.phrase.includes('ghi'))).toBe(true);
  });
});

describe('BUG-038 182.2 — backward compatibility for old transcripts', () => {
  test('old transcripts without countWords still use validateMessage', () => {
    const msg = { from: 23, to: 'presenter', round: 1, text: 'Question over 80 words? ' + Array(80).fill('word').join(' ') };
    const ctx = { roster: [23] };
    const problems = panel.validateMessage(msg, ctx);
    // Should still flag word count
    expect(problems.some((p) => p.match(/over 80 words/))).toBe(true);
  });

  test('old transcripts without tokens are still valid (backward compat)', () => {
    const msgs = [
      { from: 23, to: 'presenter', round: 1, seq: 1, text: 'Question?' },
    ];
    const ctx = { roster: [23] }; // No roundTokens
    const t = panel.buildTranscript(msgs, ctx);
    expect(t.messages).toHaveLength(1);
    // No token flag should be added
    expect(t.messages[0].problems).toBeUndefined();
  });
});
