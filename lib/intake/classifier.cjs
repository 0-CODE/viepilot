'use strict';

const BUG_KEYWORDS = [
  'bug', 'error', 'fail', 'crash', 'broken', 'fix', 'exception', 'regression',
  'wrong', 'incorrect', 'unexpected', 'null', 'undefined', '500', '404',
  'performance', 'slow', 'timeout', 'hang', 'freeze', 'unresponsive',
  // Vietnamese
  'lỗi', 'sự cố', 'không hoạt động', 'hỏng', 'sai', 'vá lỗi', 'bị lỗi',
  'chậm', 'treo', 'tắc', 'không phản hồi',
];

const ENH_KEYWORDS = [
  'add', 'new', 'feature', 'improve', 'enhance', 'update', 'upgrade',
  'support', 'request', 'implement', 'integrate', 'extend',
  // Vietnamese
  'thêm', 'nâng cấp', 'tính năng', 'cải tiến', 'tích hợp', 'mở rộng',
  'yêu cầu', 'bổ sung', 'phát triển',
];

function classifyTicket(ticket) {
  const titleWords = (ticket.title || '').trim().split(/\s+/).filter(Boolean);
  const totalWords = titleWords.length || 1;
  const text = `${ticket.title || ''} ${ticket.description || ''}`.toLowerCase();

  let matchedKeywords = 0;
  let classified = 'UNCLEAR';

  for (const kw of BUG_KEYWORDS) {
    if (text.includes(kw)) {
      classified = 'BUG';
      matchedKeywords += titleWords.filter((w) => w.toLowerCase().includes(kw)).length || 1;
      break;
    }
  }

  if (classified === 'UNCLEAR') {
    for (const kw of ENH_KEYWORDS) {
      if (text.includes(kw)) {
        classified = 'ENH';
        matchedKeywords += titleWords.filter((w) => w.toLowerCase().includes(kw)).length || 1;
        break;
      }
    }
  }

  const confidence = classified === 'UNCLEAR' ? 0.0 : Math.min(matchedKeywords / totalWords, 1.0);
  return { classified, confidence };
}

module.exports = { classifyTicket };
