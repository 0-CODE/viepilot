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
  const text = `${ticket.title || ''} ${ticket.description || ''}`.toLowerCase();

  for (const kw of BUG_KEYWORDS) {
    if (text.includes(kw)) return 'BUG';
  }
  for (const kw of ENH_KEYWORDS) {
    if (text.includes(kw)) return 'ENH';
  }
  return 'UNCLEAR';
}

module.exports = { classifyTicket };
