# Product horizon — từ brainstorm tới roadmap (không để post-MVP “chết” trong session)

Ý tưởng **sau MVP** dễ chỉ nằm trong file brainstorm rồi bị AI bỏ qua khi code. ViePilot chuẩn hóa **horizon** để mọi người (và AI) luôn thấy nó ở chỗ đúng.

## Quy tắc ngắn

1. Trong brainstorm: luôn có section **`## Product horizon`** với tag `(MVP)` / `(Post-MVP)` / `(Future)` — xem [Brainstorm & product horizon](brainstorm.md).
2. Sau **`/vp-crystallize`**: horizon phải xuất hiện trong **`ROADMAP.md`** (Post-MVP / Future) và **vision theo pha** trong **`PROJECT-CONTEXT.md`** — không được “chỉ để trong `docs/brainstorm/`”.
3. Khi AI bắt đầu task implementation sâu: đọc **vision + horizon trước**, rồi mới khóa kiến trúc chi tiết — xem thứ tự trong `AI-GUIDE.md` (file được crystallize tạo dưới `.viepilot/AI-GUIDE.md`).

## Single-release

Nếu không có lộ trình sau MVP, ghi rõ một dòng trong horizon (ví dụ *Single-release — no separate horizon epics*) để crystallize không bịa thêm epic.

## Liên kết

- Workflow brainstorm: `workflows/brainstorm.md` (trong repo ViePilot).
- Workflow crystallize: `workflows/crystallize.md` — bước trích horizon và gate “không được lặng lẽ bỏ sót”.
