<purpose>
Interactive brainstorm session để thu thập ý tưởng, requirements, và quyết định cho dự án.
</purpose>

<process>

<step name="detect_sessions">
## 1. Detect Previous Sessions

```bash
ls -la docs/brainstorm/session-*.md 2>/dev/null | tail -5
```

Parse results to get list of existing sessions.
</step>

<step name="ask_intent">
## 2. Ask User Intent

**If previous sessions exist:**
```
Tôi tìm thấy các phiên brainstorm trước đó:
{list sessions with dates}

Bạn muốn:
1. Tiếp tục phiên gần nhất
2. Xem lại một phiên cụ thể  
3. Tạo mới phiên brainstorm
```

**If no sessions:**
Tự động tạo phiên mới.
</step>

<step name="load_context">
## 3. Load Context (nếu tiếp tục)

Nếu user chọn tiếp tục:
1. Đọc file phiên trước đó
2. Tóm tắt nội dung đã thảo luận
3. Xác định các open questions / action items còn lại
4. Tiếp tục từ điểm dừng
</step>

<step name="brainstorm_mode">
## 4. Brainstorm Mode

### Topics Template
Gợi ý các topics để brainstorm:

1. **Domain Analysis**
   - Mục tiêu dự án
   - User personas
   - Core use cases

2. **Architecture**
   - System components
   - Data flow
   - Technology stack

3. **Data Model**
   - Core entities
   - Relationships
   - Storage strategy

4. **API Design**
   - Endpoint structure
   - Authentication
   - Real-time requirements

5. **Infrastructure**
   - Deployment strategy
   - Monitoring
   - Scaling

### Interactive Q&A
Cho mỗi topic:
1. Đặt câu hỏi cụ thể
2. Đợi user trả lời
3. Tổng hợp và đặt follow-up questions
4. Đề xuất alternatives nếu cần
5. Ghi nhận decisions

### Kết thúc mỗi topic
- Tóm tắt decisions
- List action items
- Note open questions
</step>

<step name="save_session">
## 5. Save Session

Tạo/cập nhật file: `docs/brainstorm/session-{YYYY-MM-DD}.md`

```markdown
# Brainstorm Session - {YYYY-MM-DD}

## Session Info
- **Date**: {full date}
- **Participants**: User, Claude
- **Status**: In Progress | Completed

## Topics Discussed

### Topic 1: {Name}
**Context**: {brief context}

**Discussion**:
- Point 1
- Point 2

**Decisions**:
- [x] Decision 1
- [x] Decision 2

**Open Questions**:
- Question 1?

---

## Summary

### Key Decisions
1. Decision summary

### Action Items
- [ ] Action 1
- [ ] Action 2

### Next Steps
- What to do next

### Open Questions
- Unresolved questions
```

Commit:
```bash
mkdir -p docs/brainstorm
git add docs/brainstorm/
git commit -m "docs: brainstorm session {date}"
git push
```
</step>

<step name="suggest_next">
## 6. Suggest Next Action

```
✓ Brainstorm session saved

Summary:
- Topics covered: {count}
- Decisions made: {count}
- Open questions: {count}

Next step: /vp-crystallize
This will transform your brainstorm into:
- Project structure
- Architecture documents
- Development roadmap
```
</step>

</process>

<commands>
User có thể dùng các lệnh trong phiên brainstorm:

- `/topic {name}` - Chuyển sang topic mới
- `/summary` - Xem tóm tắt phiên hiện tại
- `/save` - Lưu tiến độ ngay
- `/end` - Kết thúc và lưu phiên
- `/questions` - Xem danh sách open questions
</commands>

<success_criteria>
- [ ] Session file created với đầy đủ sections
- [ ] Decisions có rationale
- [ ] Open questions tracked
- [ ] Action items captured
- [ ] Git committed
</success_criteria>
