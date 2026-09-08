#!/usr/bin/env node
/**
 * Build sổ tay eli5: ghép `_assets/eli5.css` + fragment trong `_content/<track>/<slug>.html`
 * thành các trang HTML standalone trong `js/` và `angular/`, kèm trang mục lục.
 *
 *   node docs/eli5/build.mjs
 *
 * Fragment bắt đầu bằng khối meta:
 *   <!--meta
 *   title: ...
 *   eyebrow: ...
 *   lede: ...
 *   -->
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CSS = fs.readFileSync(path.join(ROOT, '_assets/eli5.css'), 'utf8');
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800' +
  '&family=Be+Vietnam+Pro:wght@300;400;600&family=JetBrains+Mono:wght@400;700&display=swap">';

// Thứ tự bài của track js phải khai tay (tên file không mang số thứ tự).
const JS_ORDER = [
  'scope', 'hoisting', 'use-strict', 'primitive-vs-reference', 'pass-by-value-vs-reference',
  'immutable-vs-mutable', 'loose-vs-strict-equality', 'this-keyword', 'call-apply', 'bind-part-1', 'bind-part-2', 'closure-var-settimeout',
  'null-vs-undefined', 'event-loop', 'browser-storage', 'nullish-logical-operators', 'service-worker', 'async-javascript',
];
// Track rxjs cũng khai tay thứ tự bài (tên file không mang số thứ tự).
const RXJS_ORDER = [
  'transformation-operators',
  'throttle-vs-debounce',
  'distinct-until-changed',
  'higher-order-observable',
  'take-until-destroyed',
  'combine-latest',
  'fork-join',
  'subject-va-bien-the',
  'share-vs-sharereplay',
  'behaviorsubject-vs-replaysubject',
  'promise-vs-observable',
];
// Track angular đánh số sẵn trong tên file (day-01-…) nên chỉ cần sort; nhóm suy ra từ số ngày.
const NG_GROUPS = [
  [1, 9, 'Cơ bản về Angular & Directives', 'Dựng môi trường, data binding và các directive nền tảng.'],
  [10, 18, 'Thành phần nâng cao & TypeScript', 'Truy vấn view/content, kiểu dữ liệu, projection, DI, pipe.'],
  [19, 26, 'Lập trình phản ứng & RxJS', 'Observable và bộ toán tử dùng hằng ngày trong Angular.'],
  [27, 32, 'Định tuyến hệ thống — Angular Router', 'Route, lazy loading, guard và resolver.'],
  [33, 37, 'Làm việc với biểu mẫu — Forms', 'Template-driven, reactive form và async validator.'],
  [38, 56, 'Chủ đề nâng cao & thực hành', 'Dynamic component, micro frontend, CDK, directive nâng cao, change detection, render hook, zoneless, rò rỉ bộ nhớ, kiểu dữ liệu TypeScript, tối ưu hiệu năng toàn diện.'],
];
// Trang đứng riêng trong angular/: tự dựng, KHÔNG sinh từ _content/, chỉ được liệt kê ở mục lục.
const NG_EXTRA = [
  {
    slug: 'vong-doi-component-angular',
    meta: {
      eyebrow: 'Angular · Ngoài lộ trình',
      title: 'Vòng đời của một Component',
      lede: 'Tám hook Angular tự gọi, thứ tự chạy, hook nào đã bị signal thay và hook nào vẫn còn chỗ đứng — kèm bộ câu hỏi phỏng vấn.',
    },
  },
];
const TRACKS = {
  js: {
    label: 'JavaScript',
    title: 'Sổ tay JavaScript',
    lede: 'Những cơ chế lõi của JavaScript — mỗi bài một trang: giải thích như cho người mới, kèm ưu điểm, nhược điểm và cạm bẫy thực tế.',
  },
  angular: {
    label: 'Angular',
    title: 'Sổ tay Angular 56 ngày',
    lede: 'Lộ trình 56 bài từ dựng môi trường tới tối ưu hiệu năng toàn diện — mỗi bài một trang, luôn kèm phần được gì / mất gì.',
  },
  rxjs: {
    label: 'RxJS',
    title: 'Sổ tay RxJS',
    lede: 'Đi sâu từng nhóm toán tử của RxJS — mỗi bài một trang: chọn cái nào, hỏng ở đâu, và kèm ưu điểm, nhược điểm thực tế.',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function readFragment(track, slug) {
  const raw = fs.readFileSync(path.join(ROOT, '_content', track, slug + '.html'), 'utf8');
  const m = raw.match(/^<!--meta([\s\S]*?)-->\s*/);
  const meta = {};
  if (m) {
    for (const line of m[1].trim().split('\n')) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: raw.slice(m ? m[0].length : 0).trim() };
}

function page({ track, title, crumbNow, hero, main, depth, extra }) {
  const up = '../'.repeat(depth);
  return '<!doctype html>\n<html lang="vi" data-track="' + track + '">\n<head>\n' +
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(title) + '</title>\n' + FONTS + '\n<style>\n' + CSS + '</style>\n</head>\n<body>\n' +
    '<div class="wrap">\n<nav class="crumb"><a href="' + up + 'index.html">eli5</a><span>/</span>' +
    crumbNow + '</nav>\n' + hero + '\n' + main + '\n</div>\n' + (extra || '') + '</body>\n</html>\n';
}

function card(it) {
  return '<li><a href="' + it.slug + '.html"><span class="n">' + esc(it.meta.eyebrow || '') +
    '</span><span class="t">' + esc(it.meta.title) + '</span><span class="d">' +
    esc(it.meta.lede || '') + '</span></a></li>';
}

function buildTrack(track, slugs) {
  const t = TRACKS[track];
  const items = slugs.map((slug) => Object.assign({ slug }, readFragment(track, slug)));

  items.forEach((it, i) => {
    const prev = items[i - 1];
    const next = items[i + 1];
    const pager = '<nav class="pager">' +
      (prev ? '<a class="prev" href="' + prev.slug + '.html"><span class="dir">← Bài trước</span>' +
        '<span class="nm">' + esc(prev.meta.title) + '</span></a>' : '<span></span>') +
      (next ? '<a class="next" href="' + next.slug + '.html"><span class="dir">Bài tiếp →</span>' +
        '<span class="nm">' + esc(next.meta.title) + '</span></a>' : '') + '</nav>';
    const hero = '<header class="hero col">\n<p class="eyebrow">' + esc(it.meta.eyebrow || t.label) +
      '</p>\n<h1>' + esc(it.meta.title) + '</h1>\n<p class="lede">' + esc(it.meta.lede || '') +
      '</p>\n</header>';
    const html = page({
      track,
      title: it.meta.title,
      crumbNow: '<a href="index.html">' + t.label + '</a><span>/</span><span class="now">' +
        esc(it.meta.short || it.meta.title) + '</span>',
      hero,
      main: it.body + '\n' + pager + '\n<footer class="page-foot col"><p>Sổ tay eli5 · ' +
        esc(t.label) + ' · trang ' + (i + 1) + '/' + items.length + '</p></footer>',
      depth: 2,
    });
    fs.writeFileSync(path.join(ROOT, track, it.slug + '.html'), html, 'utf8');
  });

  let body = '';
  if (track === 'angular') {
    for (const g of NG_GROUPS) {
      const part = items.filter((it) => {
        const mm = it.slug.match(/^day-(\d+)/);
        const n = mm ? Number(mm[1]) : -1;
        return n >= g[0] && n <= g[1];
      });
      if (!part.length) continue;
      body += '<section class="grp">\n<h2>' + esc(g[2]) + '</h2>\n<p class="grp-note">' + esc(g[3]) +
        ' · Day ' + g[0] + '–' + g[1] + '</p>\n<ul class="idx">\n' +
        part.map(card).join('\n') + '\n</ul>\n</section>';
    }
    if (NG_EXTRA.length) {
      body += '<section class="grp">\n<h2>Bài đứng riêng</h2>\n<p class="grp-note">' +
        'Trang tự dựng ngoài lộ trình đánh số ngày — không sinh từ _content/.</p>\n<ul class="idx">\n' +
        NG_EXTRA.map(card).join('\n') + '\n</ul>\n</section>';
    }
  } else {
    body = '<section class="grp">\n<ul class="idx">\n' + items.map(card).join('\n') +
      '\n</ul>\n</section>';
  }
  const total = items.length + (track === 'angular' ? NG_EXTRA.length : 0);
  const idx = page({
    track,
    title: t.title,
    crumbNow: '<span class="now">' + t.label + '</span>',
    hero: '<header class="hero col"><p class="eyebrow">' + total + ' bài</p><h1>' +
      esc(t.title) + '</h1><p class="lede">' + esc(t.lede) + '</p></header>',
    main: body,
    depth: 2,
  });
  fs.writeFileSync(path.join(ROOT, track, 'index.html'), idx, 'utf8');
  const all = track === 'angular' ? items.concat(NG_EXTRA) : items;
  const entries = all.map((it) => ({
    t: it.meta.title,
    e: it.meta.eyebrow || t.label,
    u: track + '/' + it.slug + '.html',
  }));
  return { total, entries };
}

function listAngular() {
  const dir = path.join(ROOT, '_content/angular');
  return fs.readdirSync(dir).filter((f) => f.endsWith('.html'))
    .map((f) => f.replace(/\.html$/, '')).sort();
}

const jsSlugs = JS_ORDER.filter((s) => fs.existsSync(path.join(ROOT, '_content/js', s + '.html')));
const ngSlugs = listAngular();
const rxSlugs = RXJS_ORDER.filter((s) => fs.existsSync(path.join(ROOT, '_content/rxjs', s + '.html')));
const EMPTY = { total: 0, entries: [] };
const bJs = jsSlugs.length ? buildTrack('js', jsSlugs) : EMPTY;
const bNg = ngSlugs.length ? buildTrack('angular', ngSlugs) : EMPTY;
const bRx = rxSlugs.length ? buildTrack('rxjs', rxSlugs) : EMPTY;
const nJs = bJs.total, nNg = bNg.total, nRx = bRx.total;
const searchIndex = bJs.entries.concat(bNg.entries, bRx.entries);

// Ô tìm bài viết ở trang mục lục: gõ tên → gợi ý → bấm vào là sang trang bài đó.
const SEARCH_MARKUP =
  '<section class="search" id="search">\n' +
  '<label class="search-lbl" for="q">Tìm bài viết</label>\n' +
  '<div class="search-box">\n' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle>' +
  '<path d="m20 20-3.6-3.6"></path></svg>\n' +
  '<input id="q" type="text" autocomplete="off" spellcheck="false" ' +
  'placeholder="Gõ tên bài viết… ví dụ: closure, guard, debounce" ' +
  'aria-label="Tìm bài viết theo tên" role="combobox" aria-expanded="false" ' +
  'aria-controls="sug" aria-autocomplete="list">\n' +
  '<button type="button" id="qclear" class="search-clear" hidden aria-label="Xoá ô tìm">&#215;</button>\n' +
  '<kbd class="search-kbd">/</kbd>\n' +
  '</div>\n' +
  '<ul class="sug" id="sug" role="listbox" aria-label="Gợi ý bài viết" hidden></ul>\n' +
  '<p class="search-empty" id="qempty" hidden>Không có bài nào khớp tên đang gõ.</p>\n' +
  '</section>';

const SEARCH_SCRIPT =
  '<script>\n(function () {\n' +
  '  var DATA = ' + JSON.stringify(searchIndex) + ';\n' +
  '  var box = document.getElementById("q");\n' +
  '  var list = document.getElementById("sug");\n' +
  '  var empty = document.getElementById("qempty");\n' +
  '  var clear = document.getElementById("qclear");\n' +
  '  if (!box || !list) return;\n' +
  '  // Bỏ dấu tiếng Việt để gõ "bien doi" vẫn ra "biến đổi". Độ dài chuỗi giữ nguyên\n' +
  '  // (mỗi ký tự có dấu → đúng 1 ký tự không dấu) nên vị trí khớp dùng lại được để tô sáng.\n' +
  '  function norm(s) {\n' +
  '    return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")\n' +
  '      .replace(/\\u0111/g, "d").replace(/\\u0110/g, "D").toLowerCase();\n' +
  '  }\n' +
  '  DATA.forEach(function (d) { d.kt = norm(d.t); d.ke = norm(d.e); });\n' +
  '  var hits = [], active = -1;\n' +
  '  function esc(s) {\n' +
  '    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");\n' +
  '  }\n' +
  '  function mark(text, key, term) {\n' +
  '    var i = term ? key.indexOf(term) : -1;\n' +
  '    if (i < 0) return esc(text);\n' +
  '    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + term.length)) +\n' +
  '      "</mark>" + esc(text.slice(i + term.length));\n' +
  '  }\n' +
  '  function search(raw) {\n' +
  '    var terms = norm(raw).split(/\\s+/).filter(Boolean);\n' +
  '    if (!terms.length) return [];\n' +
  '    var out = [];\n' +
  '    DATA.forEach(function (d) {\n' +
  '      var hay = d.kt + " " + d.ke;\n' +
  '      for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) < 0) return;\n' +
  '      var at = d.kt.indexOf(terms[0]);\n' +
  '      out.push({ d: d, rank: at < 0 ? 9999 : at, term: terms[0] });\n' +
  '    });\n' +
  '    out.sort(function (a, b) { return a.rank - b.rank || a.d.t.localeCompare(b.d.t, "vi"); });\n' +
  '    return out.slice(0, 12);\n' +
  '  }\n' +
  '  function close() {\n' +
  '    hits = []; active = -1; list.hidden = true; list.innerHTML = "";\n' +
  '    empty.hidden = true; box.setAttribute("aria-expanded", "false");\n' +
  '  }\n' +
  '  function render() {\n' +
  '    var raw = box.value.trim();\n' +
  '    clear.hidden = !box.value;\n' +
  '    if (!raw) { close(); return; }\n' +
  '    hits = search(raw); active = -1;\n' +
  '    empty.hidden = hits.length > 0;\n' +
  '    if (!hits.length) { list.hidden = true; list.innerHTML = ""; box.setAttribute("aria-expanded", "false"); return; }\n' +
  '    list.innerHTML = hits.map(function (h, i) {\n' +
  '      return \'<li role="option" id="sug-\' + i + \'" aria-selected="false"><a href="\' +\n' +
  '        h.d.u + \'"><span class="n">\' + mark(h.d.e, h.d.ke, h.term) +\n' +
  '        \'</span><span class="t">\' + mark(h.d.t, h.d.kt, h.term) + "</span></a></li>";\n' +
  '    }).join("");\n' +
  '    list.hidden = false; box.setAttribute("aria-expanded", "true");\n' +
  '  }\n' +
  '  function move(step) {\n' +
  '    if (!hits.length) return;\n' +
  '    var items = list.children;\n' +
  '    if (active >= 0) { items[active].classList.remove("on"); items[active].setAttribute("aria-selected", "false"); }\n' +
  '    active = (active + 1 + step + hits.length + 1) % (hits.length + 1) - 1;\n' +
  '    if (active < 0) { box.removeAttribute("aria-activedescendant"); return; }\n' +
  '    items[active].classList.add("on"); items[active].setAttribute("aria-selected", "true");\n' +
  '    box.setAttribute("aria-activedescendant", "sug-" + active);\n' +
  '    items[active].scrollIntoView({ block: "nearest" });\n' +
  '  }\n' +
  '  box.addEventListener("input", render);\n' +
  '  box.addEventListener("focus", function () { if (box.value.trim() && !hits.length) render(); });\n' +
  '  box.addEventListener("keydown", function (e) {\n' +
  '    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }\n' +
  '    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }\n' +
  '    else if (e.key === "Enter") {\n' +
  '      var pick = active >= 0 ? hits[active] : hits[0];\n' +
  '      if (pick) { e.preventDefault(); location.href = pick.d.u; }\n' +
  '    } else if (e.key === "Escape") { box.value = ""; close(); clear.hidden = true; }\n' +
  '  });\n' +
  '  clear.addEventListener("click", function () { box.value = ""; close(); clear.hidden = true; box.focus(); });\n' +
  '  document.addEventListener("click", function (e) {\n' +
  '    if (!document.getElementById("search").contains(e.target)) close();\n' +
  '  });\n' +
  '  document.addEventListener("keydown", function (e) {\n' +
  '    if (e.key === "/" && document.activeElement !== box) { e.preventDefault(); box.focus(); box.select(); }\n' +
  '  });\n' +
  '})();\n<' + '/script>\n';

const home = page({
  track: 'js',
  title: 'Sổ tay eli5',
  crumbNow: '<span class="now">mục lục</span>',
  hero: '<header class="hero col"><p class="eyebrow">' + (nJs + nNg + nRx) +
    ' bài giải thích</p><h1>Sổ tay eli5</h1><p class="lede">Giải thích các khái niệm JavaScript và ' +
    'Angular, RxJS theo lối dễ hiểu nhất có thể — mỗi bài đều nói rõ được gì, mất gì, và hỏng ở đâu.</p></header>',
  main: SEARCH_MARKUP + '\n<section class="grp"><div class="track-cards">\n' +
    '<a href="js/index.html"><span class="cnt">' + nJs + ' bài</span><h2>JavaScript</h2>' +
    '<p>Scope, hoisting, strict mode, tham trị – tham chiếu, bất biến, == và ===, this, bind/call, closure.</p></a>\n' +
    '<a href="angular/index.html"><span class="cnt">' + nNg + ' bài</span><h2>Angular</h2>' +
    '<p>Lộ trình 56 ngày: directive, DI, RxJS, router, form, dynamic component, render hook, tối ưu hiệu năng.</p></a>\n' +
    '<a href="rxjs/index.html"><span class="cnt">' + nRx + ' bài</span><h2>RxJS</h2>' +
    '<p>Đi sâu từng nhóm toán tử: biến đổi, lọc, kết hợp, xử lý lỗi — chọn cái nào và hỏng ở đâu.</p></a>\n' +
    '</div></section>',
  depth: 1,
  extra: SEARCH_SCRIPT,
});
fs.writeFileSync(path.join(ROOT, 'index.html'), home, 'utf8');
console.log('build xong: js=' + nJs + ' bài · angular=' + nNg + ' bài · rxjs=' + nRx + ' bài');
