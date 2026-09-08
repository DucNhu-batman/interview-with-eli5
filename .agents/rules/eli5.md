# Quy tắc phát triển Sổ tay eli5

Dự án này là site tĩnh **Sổ tay eli5** (`docs/eli5` hoặc workspace `eli5`), tự động build bằng `build.mjs`. Bất kỳ thay đổi nào cũng phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 1. Quy tắc khi nhận lệnh `/eli5 <topic>` hoặc yêu cầu giải thích ELI5

Khi người dùng gõ lệnh `/eli5 <chủ đề>` hoặc yêu cầu giải thích bất kỳ chủ đề nào:
* **BẮT BUỘC** tạo trực tiếp bài viết thành một trang trong Sổ tay eli5 này (dưới dạng fragment trong `_content/<track>/<slug>.html`).
* **Tự động gắn vào sổ tay:** Xác định track phù hợp (`js`, `rxjs`, `angular`), khai báo vào `build.mjs` (`JS_ORDER` / `RXJS_ORDER` / đặt tên đúng chuẩn `day-NN-...`), và chạy `node build.mjs` để cập nhật site.
* **KHÔNG** chỉ trả về đoạn văn chat hay artifact rời trừ khi người dùng yêu cầu rõ ràng.

---

## 2. Kiến trúc nguồn & File sinh ra

```
_content/<track>/<slug>.html       ← NGUỒN nội dung (HTML fragment), CHỈ SỬA Ở ĐÂY
_assets/eli5.css                   ← NGUỒN CSS dùng chung cho toàn bộ bài
build.mjs                          ← Script build ghép CSS + fragment thành trang standalone
js/  angular/  rxjs/  index.html   ← FILE SINH RA, TUYỆT ĐỐI KHÔNG SỬA TAY
```

> **CẢNH BÁO:** Sửa trực tiếp file trong `js/`, `angular/`, `rxjs/` hoặc `index.html` sẽ bị ghi đè và mất trắng khi chạy `node build.mjs`.

---

## 2. Quy trình thêm & sửa bài

### Phân loại Track:
1. **Track `js`:**
   - Tạo file trong `_content/js/<slug>.html`.
   - **BẮT BUỘC:** Khai báo slug vào mảng `JS_ORDER` trong [build.mjs](file:///Users/duc/eli5/build.mjs) đúng vị trí mong muốn hiển thị. Nếu không có trong `JS_ORDER`, bài viết sẽ không được build.
2. **Track `angular`:**
   - Tên file bắt buộc theo định dạng: `day-NN-<slug>.html` (NN là số 2 chữ số: `01`, `02`,...).
   - Tự động sort theo tên file. Nếu số ngày vượt ngoài các nhóm `NG_GROUPS` trong [build.mjs](file:///Users/duc/eli5/build.mjs), cần cập nhật thêm khoảng ngày cho `NG_GROUPS`.
3. **Track `rxjs`:**
   - Tạo file trong `_content/rxjs/<slug>.html`.
   - **BẮT BUỘC:** Khai báo slug vào mảng `RXJS_ORDER` trong [build.mjs](file:///Users/duc/eli5/build.mjs).

### Cấu trúc khối Meta đầu file:
Mỗi fragment phải mở đầu bằng comment meta (mỗi dòng `key: value`, không quote, không xuống dòng giữa chừng):

```html
<!--meta
title: Tiêu đề bài viết
eyebrow: JavaScript · Bài N / Angular · Day NN / RxJS · Bài N
short: Tên ngắn (dùng cho breadcrumb)
lede: Một đoạn 1–3 câu tóm tắt trực diện vấn đề đời thường mà bài này giải quyết.
-->
```

---

## 3. Nhịp 4-5 phần chuẩn cho mỗi bài viết

Mỗi `<section>` bắt đầu bằng `<div class="sec-head"><p class="eyebrow">…</p><h2>…</h2></div>`:

1. **Là gì:** Giải thích bằng hình tượng đời thường, kết bằng một thẻ `.callout` tóm gọn bản chất bài.
2. **Cơ chế / So sánh / Vấn đề:** Chỗ đặt hình minh họa SVG (`<figure>`), bảng so sánh hoặc flow hoạt động chi tiết.
3. **Được gì — mất gì:** 
   - Sử dụng `.pc` chứa `.panel.pro` (Ưu điểm) + `.panel.con` (Nhược điểm), mỗi bên 4–5 gạch đầu dòng `<li>` kèm khối `.ex` code ví dụ minh họa.
   - Kết thúc bằng `.callout.good` nêu quy tắc sống chung an toàn (kèm code minh họa xử lý thực tế).
   - **Đây là chữ ký đặc trưng của sổ tay eli5 — không bài nào được thiếu.**
4. **Nói trong phỏng vấn (Góc nhìn Senior):**
   - `.board.col` chứa câu "Trả lời 30 giây" gãy gọn, đúng trọng tâm kỹ thuật.
   - `.cards` chứa các thẻ câu hỏi phỏng vấn hay gặp, câu hỏi bẫy, câu hỏi loại ứng viên kèm cách trả lời ăn điểm.
   - `.callout.bad` vạch trần câu trả lời sai kinh điển của ứng viên non tay.
5. **Từ điển:** Bảng 2 cột `Thuật ngữ | Nghĩa tiếng Việt`, gom toàn bộ các từ chuyên ngành đã xuất hiện trong bài.

---

## 4. Quy tắc hành văn & Kỹ thuật (Code/CSS)

* **Ngôn ngữ:** 100% Tiếng Việt, văn phong giải thích đơn giản, trực quan.
* **Chú thích thuật ngữ & Tooltip chú giải hai chiều (`.gl`):**
   - Mọi từ chuyên ngành/hàn lâm (kể cả từ quen thuộc như *token, cookie, API, build, route, module, selector, constructor, Promise, cache, interceptor...*) đều **phải chú thích tiếng Việt trong ngoặc đơn ngay lần đầu tiên xuất hiện** trong bài.
   - **Tooltip chú giải thuật ngữ (`.gl` với `data-gl`):** Sử dụng `<span class="gl" data-gl="..." tabindex="0">...</span>` cho các thuật ngữ:
     + **Từ viết tắt / Thuật ngữ tiếng Anh** (ví dụ: `FCP`, `INP`, `DOM`, `SPA`, `DI`, `Router`, `Observable`...): thuộc tính `data-gl` bắt buộc phải là nghĩa/giải thích tiếng Việt (ví dụ: `<span class="gl" data-gl="Thời gian hiển thị nội dung đầu tiên" tabindex="0">FCP</span>`, `<span class="gl" data-gl="bộ định tuyến" tabindex="0">Router</span>`).
     + **Thuật ngữ đang viết bằng tiếng Việt** (ví dụ: "tải lười", "tiêm phụ thuộc", "đơn thực thể", "phát hiện thay đổi"...): thuộc tính `data-gl` bắt buộc phải là thuật ngữ tiếng Anh gốc (ví dụ: `<span class="gl" data-gl="lazy loading" tabindex="0">tải lười</span>`, `<span class="gl" data-gl="dependency injection" tabindex="0">tiêm phụ thuộc</span>`, `<span class="gl" data-gl="singleton" tabindex="0">đơn thực thể</span>`).
     + Luôn có `tabindex="0"` để hỗ trợ người dùng dùng phím Tab/focus và thiết bị trợ năng xem được tooltip.
     + Tuyệt đối **không** dùng `.gl` bên trong các khối `<pre><code>`.
* **Không hardcode màu sắc:** Toàn bộ màu dùng CSS variable trong `_assets/eli5.css` (`var(--accent)`, `var(--surface)`, `var(--muted)`...). Hình SVG dùng `fill="currentColor"` hoặc `var(--surface-2)` để tương thích dark mode.
* **Không chèn `<style>`, `<script>`, CDN hay ảnh ngoài** vào file fragment `_content/`.
* **Khối Code `<pre><code>`:**
   - Tô màu thủ công bằng class `.kw` (từ khoá), `.str` (chuỗi), `.cm` (chú thích), `.out` (kết quả in), `<b>` (nhấn mạnh).
   - Nền khối code là nền tối duy nhất. Tuyệt đối không để phần tử con nào bên trong mang nền sáng.
   - Escape ký tự HTML: `<` thành `&lt;` và `>` thành `&gt;`.

---

## 5. Quy trình Build & Kiểm tra

Sau khi tạo hoặc chỉnh sửa fragment:
```bash
node build.mjs
```
Kiểm tra log đầu ra: `build xong: js=N bài · angular=M bài · rxjs=K bài`. Đảm bảo số lượng bài tăng đúng và file HTML trong thư mục build tương ứng đã được sinh ra chính xác.
