# Sổ tay eli5

Site tĩnh giải thích các khái niệm JavaScript, Angular và RxJS theo lối dễ hiểu nhất có thể —
mỗi bài một trang, luôn kèm phần *được gì / mất gì* và phần *nói trong phỏng vấn*.

## Cấu trúc

```
_content/<track>/<slug>.html   ← NGUỒN, chỉ sửa ở đây (fragment, không có <html>/<head>)
_assets/eli5.css               ← NGUỒN của toàn bộ style
build.mjs                      ← ghép CSS + fragment → trang standalone
js/  angular/  rxjs/  index.html   ← SINH RA, không sửa tay
```

Sửa file trong `js/`, `angular/`, `rxjs/` là mất trắng ở lần build kế tiếp.

## Build

```bash
node build.mjs      # in "build xong: js=N bài · angular=M bài · rxjs=K bài"
```

Không có dependency, không cần `npm install` — chỉ cần Node.

Bản build được commit vào repo để mở trực tiếp bằng trình duyệt, hoặc phục vụ qua GitHub Pages.

## Thêm bài

Xem skill `eli5-page` (`~/.claude/skills/eli5-page/SKILL.md`) — quy ước khối meta, nhịp 4 section
bắt buộc, vốn class CSS dùng chung và checklist trước khi bàn giao.
