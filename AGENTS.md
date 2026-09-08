# AGENTS.md — Hướng dẫn cho Agent trong dự án Sổ tay eli5

Xem chi tiết bộ quy tắc hoàn chỉnh tại [.agents/rules/eli5.md](file:///Users/duc/eli5/.agents/rules/eli5.md).

## Tóm tắt nhanh các quy tắc cốt lõi:

0. **Lệnh `/eli5 <chủ đề>`:** Tự động tạo bài viết mới trong sổ tay (viết fragment vào `_content/<track>/<slug>.html`, đăng ký vào `build.mjs` và chạy build), không chỉ trả lời bằng text chat rời.
1. **Không sửa file sinh ra:** `js/`, `angular/`, `rxjs/`, `index.html` được sinh tự động. CHỈ viết và sửa file fragment trong `_content/<track>/<slug>.html` và CSS trong `_assets/eli5.css`.
2. **Khai báo bài mới:**
   - Track `js`: Khai báo slug vào `JS_ORDER` trong [build.mjs](file:///Users/duc/eli5/build.mjs).
   - Track `rxjs`: Khai báo slug vào `RXJS_ORDER` trong [build.mjs](file:///Users/duc/eli5/build.mjs).
   - Track `angular`: Đặt tên file `day-NN-<slug>.html`.
3. **Cấu trúc nhịp 4-5 phần:** Mỗi bài bắt buộc có đủ các phần:
   - *Là gì* (ví dụ đời thường + callout tóm tắt)
   - *Cơ chế / Vấn đề / So sánh* (kèm SVG / flow chi tiết)
   - *Được gì — mất gì* (panel `.pro` + `.con` + ví dụ code `.ex` + `.callout.good` kèm code sống chung an toàn)
   - *Nói trong phỏng vấn* (trả lời 30 giây như Senior + các thẻ `.card` câu hỏi bẫy/loại ứng viên)
   - *Từ điển* (bảng dịch thuật ngữ)
4. **Quy tắc ngôn ngữ & Tooltip chú giải hai chiều:**
   - Chú thích tiếng Việt trong ngoặc cho MỌI từ chuyên ngành khi xuất hiện lần đầu.
   - Sử dụng `<span class="gl" data-gl="..." tabindex="0">` làm tooltip đối ứng:
     * Từ viết tắt / tiếng Anh (`FCP`, `DI`, `SPA`, `Router`...): `data-gl` chứa nghĩa/giải thích tiếng Việt.
     * Thuật ngữ đang là tiếng Việt (tải lười, tiêm phụ thuộc, đơn thực thể...): `data-gl` chứa từ tiếng Anh gốc tương ứng.
5. **Build kiểm tra:** Luôn chạy `node build.mjs` sau khi thay đổi và kiểm tra số lượng bài output.
