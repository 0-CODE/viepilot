# Feature: Debug Mode (`/vp-debug`)

`/vp-debug` giúp bạn track và resolve issues một cách có hệ thống, với state được lưu lại qua các sessions.

## Overview

Thay vì debug theo kiểu "thử cái này, thử cái kia", `/vp-debug` tổ chức:
- **Problem statement** rõ ràng
- **Hypotheses** được track
- **Attempts** với kết quả
- **Resolution** khi tìm ra

## Starting a Debug Session

```
/vp-debug investigate: API returns 500 after adding auth middleware
```

ViePilot tạo `DEBUG-001.md`:

```markdown
# Debug Session: API returns 500 after adding auth middleware

## Problem
API returns 500 after adding auth middleware

## Hypotheses
- [ ] Middleware order incorrect
- [ ] JWT secret not loaded from env
- [ ] Token format mismatch

## Attempts
### Attempt 1: Check middleware order
...

## Resolution
_Pending_
```

## Continuing Across Sessions

Debug state được lưu — có thể tiếp tục sau khi close Cursor:

```
/vp-debug continue
```

ViePilot load lại debug session và tiếp tục từ hypothesis chưa test.

## Closing a Session

```
/vp-debug close: Fixed by moving auth middleware before route handlers
```

ViePilot:
- Mark session resolved
- Log fix vào CHANGELOG.md
- Archive debug file

## Multiple Sessions

```
/vp-debug list
```

```
Active debug sessions:
1. DEBUG-001 — API 500 error (in progress)
2. DEBUG-002 — Test flakiness (open)
```

## Tips

- Mô tả problem cụ thể: "X happens when Y" thay vì "something is broken"
- Một session per issue — không mix nhiều bugs
- Dùng `/vp-debug continue` sau context reset để không mất progress
- Theo policy BUG-004, `/vp-debug` mặc định chỉ dùng hệ skill `vp-*`; external skills chỉ dùng khi bạn explicit opt-in.
