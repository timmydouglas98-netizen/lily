/* app.js — loads content/site.json and content/works.json, then renders the site.
   Routes: #cover · #index · #archive · #info · #contact · #work-<slug> · anything else is the 404.
   No dependencies, no build step. */
(function () {
  "use strict";

  /* ---------- settings ---------- */
  // Images are resized by Netlify's image CDN. Off automatically when previewing locally.
  // If the site ever moves off Netlify, set this to false.
  var host = location.hostname;
  var IMAGE_CDN = location.protocol !== "file:" && host !== "localhost" && host !== "127.0.0.1" && host !== "";
  var WIDTHS = [800, 1200, 1600, 2400];

  var view = document.getElementById("view");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var S, W, ALL, yMin, yMax, years;

  /* ---------- helpers ---------- */
  var pad = function (n, l) { return String(n).padStart(l || 2, "0"); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  };
  var ratio = function (r) { var p = String(r || "4:5").split(":"); var v = Number(p[0]) / Number(p[1]); return v > 0 ? v : 0.8; };
  var cap = function (w) { return [w.title, w.client, w.year].filter(Boolean).join(", "); };
  var slugify = function (s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
  };
  var fileName = function (p) { return String(p || "").split("/").pop() || "no image yet"; };
  var imgUrl = function (src, w) {
    if (!src) return "";
    if (!IMAGE_CDN || /^https?:/.test(src)) return src;
    return "/.netlify/images?url=" + encodeURIComponent(src) + "&w=" + w;
  };
  var vimeoId = function (u) { var m = String(u || "").match(/vimeo\.com\/(?:.*\/)?(\d{5,})/); return m ? m[1] : null; };

  /* ---------- content ---------- */
  function normalise(site, works) {
    S = site || {};
    S.name = S.name || "Untitled";
    S.disciplines = S.disciplines || [];
    var used = {};
    W = (works || []).filter(function (w) { return w && w.title; }).map(function (w, i) {
      var slug = w.slug ? slugify(w.slug) : slugify(w.title);
      while (used[slug]) slug += "-" + (i + 1);
      used[slug] = true;
      var images = (w.images || []).filter(Boolean).map(function (im) {
        return { image: im.image || "", ratio: im.ratio || "4:5", alt: im.alt || w.title, caption: im.caption || "", vimeo: im.vimeo || "", video: im.video || "" };
      });
      if (!images.length) images = [{ image: "", ratio: "4:5", alt: w.title, caption: "" }];
      return {
        no: i + 1, slug: slug, title: w.title, year: w.year || "", discipline: w.discipline || "",
        client: w.client || "", role: w.role || "", summary: w.summary || "", featured: !!w.featured,
        images: images, credits: (w.credits || []).filter(function (c) { return c && (c.role || c.name); })
      };
    });
    ALL = [];
    W.forEach(function (w) { w.images.forEach(function (im, k) { ALL.push({ w: w, im: im, k: k }); }); });
    years = W.map(function (w) { return Number(w.year); }).filter(Boolean);
    yMin = years.length ? Math.min.apply(null, years) : "";
    yMax = years.length ? Math.max.apply(null, years) : "";
  }

  /* ---------- media ---------- */
  // o.still: show the image only (thumbnails, archive, lightbox). o.decorative: empty alt.
  function media(im, o) {
    o = o || {};
    var p = String(im.ratio).split(":"), r = ratio(im.ratio);
    var style = 'style="aspect-ratio:' + p[0] + "/" + p[1] + ";--r:" + r.toFixed(4) + '"';
    var vid = vimeoId(im.vimeo);
    if (!o.still && vid) {
      return '<div class="m" ' + style + '><iframe src="https://player.vimeo.com/video/' + vid + '?dnt=1&title=0&byline=0&portrait=0" title="' + esc(im.alt) + '" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
    }
    if (!o.still && im.video) {
      return '<div class="m" ' + style + '><video controls preload="none" playsinline' + (im.image ? ' poster="' + esc(imgUrl(im.image, 1600)) + '"' : "") + ' aria-label="' + esc(im.alt) + '"><source src="' + esc(im.video) + '" type="video/mp4"></video></div>';
    }
    if (!im.image) return placeholder(im, style, o);
    var srcset = IMAGE_CDN ? ' srcset="' + WIDTHS.map(function (w) { return esc(imgUrl(im.image, w)) + " " + w + "w"; }).join(", ") + '" sizes="' + (o.sizes || "100vw") + '"' : "";
    return '<div class="m" ' + style + '><img src="' + esc(imgUrl(im.image, 1600)) + '"' + srcset +
      ' alt="' + (o.decorative ? "" : esc(im.alt)) + '" ' + (o.eager ? 'fetchpriority="high"' : 'loading="lazy"') +
      ' decoding="async" data-file="' + esc(fileName(im.image)) + '" data-ratio="' + esc(im.ratio) + '"></div>';
  }
  function placeholder(im, style, o) {
    var aria = o.decorative ? 'aria-hidden="true"' : 'role="img" aria-label="' + esc(im.alt) + '"';
    return '<div class="m ph" ' + style + " " + aria + "><span>" + esc(fileName(im.image) + " · " + im.ratio) + "</span></div>";
  }

  // A file that hasn't been uploaded yet shows as a flat block at its ratio, never a broken icon.
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || !img.parentElement || !img.parentElement.classList.contains("m")) return;
    var m = img.parentElement, alt = img.getAttribute("alt");
    m.classList.add("ph");
    if (alt) { m.setAttribute("role", "img"); m.setAttribute("aria-label", alt); } else m.setAttribute("aria-hidden", "true");
    m.innerHTML = "<span>" + esc(img.dataset.file + " · " + img.dataset.ratio) + "</span>";
  }, true);

  // If the chosen shape doesn't match the photo, correct it from the photo itself.
  document.addEventListener("load", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || !img.naturalWidth || !img.parentElement || !img.parentElement.classList.contains("m")) return;
    var real = img.naturalWidth / img.naturalHeight, declared = ratio(img.dataset.ratio);
    if (Math.abs(real - declared) / declared < 0.02) return;
    var m = img.parentElement;
    m.style.aspectRatio = img.naturalWidth + "/" + img.naturalHeight;
    m.style.setProperty("--r", real.toFixed(4));
    var p = m.parentElement;
    if (p && (p.classList.contains("frame") || p.classList.contains("cover-plate"))) p.style.setProperty("--r", real.toFixed(4));
  }, true);

  /* ---------- layout rhythm: never the same width twice in a row; at most two full-bleeds ---------- */
  var WIDTH = { full: 3, rhalf: 2, lhalf: 2, sleft: 1, sright: 1 };
  var CYCLE = ["sleft", "rhalf", "sright", "lhalf"];
  function layouts(images) {
    var out = [], prev = null, i = 0, full = 0;
    images.forEach(function (im, k) {
      var r = ratio(im.ratio), L, moving = im.vimeo || im.video;
      var canFull = (moving || r >= 1.3) && full < 2 && prev !== "full" && (k === 0 || k >= 3);
      if (canFull) { L = "full"; full++; }
      else {
        L = CYCLE[i % 4]; i++;
        if (prev && WIDTH[L] === WIDTH[prev]) { L = CYCLE[i % 4]; i++; }
      }
      out.push(L); prev = L;
    });
    return out;
  }
  function row(L, figHtml, capHtml) {
    return '<div class="row grid12 L-' + L + '"><figure class="fig">' + figHtml + "</figure>" +
      '<figcaption class="cap">' + capHtml + "</figcaption></div>";
  }
  var sizesFor = function (L) { return L === "full" ? "100vw" : L.charAt(0) === "s" ? "(max-width: 720px) 72vw, 35vw" : "(max-width: 720px) 82vw, 60vw"; };

  /* ---------- views ---------- */
  function vCover() {
    var feat = W.filter(function (w) { return w.featured; });
    if (!feat.length) feat = W.slice(0, 6);
    var lead = feat[0];
    var parts = S.name.split(" ").map(esc).join("<br>");
    var plate = "";
    var leadIm = null;
    if (lead) {
      leadIm = lead.images.filter(function (im) { return ratio(im.ratio) < 1 && im.image; })[0] || lead.images[0];
      plate = '<a class="cover-plate" href="#work-' + lead.slug + '" aria-label="' + esc(lead.title) + '" style="--r:' + ratio(leadIm.ratio).toFixed(4) + '">' +
        media(leadIm, { eager: true, still: true, sizes: "(max-width: 720px) 78vw, 50vw" }) + "</a>";
    }
    var L = ["sleft", "rhalf", "full", "sright", "lhalf", "sleft"];
    var picks = feat.slice(0, 6).map(function (w) {
      var im = w.images[0];
      if (w === lead && im === leadIm && w.images[1]) im = w.images[1];
      return { w: w, im: im };
    });
    var stream = picks.map(function (p, i) {
      var Li = L[i];
      if (Li === "full" && ratio(p.im.ratio) < 1.3) Li = "rhalf" === L[i - 1] ? "lhalf" : "rhalf";
      return row(Li, '<a href="#work-' + p.w.slug + '" aria-label="' + esc(p.w.title) + '">' + media(p.im, { still: true, sizes: sizesFor(Li) }) + "</a>",
        '<a href="#work-' + p.w.slug + '">' + esc(cap(p.w)) + "</a>");
    }).join("");
    var span = yMin === yMax ? yMin : yMin + "–" + yMax;
    return '<section class="cover" aria-label="Cover">' +
      '<div class="cover-text"><div><h1 class="display">' + parts + "</h1>" +
      '<div class="cover-sub meta"><span>' + S.disciplines.map(esc).join(" · ") + "</span><span>" + esc(S.city) + "</span></div></div>" +
      '<p class="cover-foot meta">Work ' + span + " · " + W.length + " projects</p></div>" + plate +
      "</section>" +
      (stream ? '<section class="stream wrap" aria-label="Selected work">' + stream + "</section>" : "");
  }

  var filt = { d: "All", y: "All" };
  function disciplinesUsed() {
    var seen = W.map(function (w) { return w.discipline; }).filter(Boolean);
    var order = S.disciplines.filter(function (d) { return seen.indexOf(d) > -1; });
    seen.forEach(function (d) { if (order.indexOf(d) < 0) order.push(d); });
    return order;
  }
  function vIndex() {
    var ds = ["All"].concat(disciplinesUsed());
    var ys = ["All"]; for (var y = yMax; y >= yMin; y--) if (years.indexOf(y) > -1) ys.push(String(y));
    if (ds.indexOf(filt.d) < 0) filt.d = "All";
    if (ys.indexOf(filt.y) < 0) filt.y = "All";
    var btn = function (k, v) { return '<button type="button" data-f="' + k + '" data-v="' + esc(v) + '" aria-pressed="' + (filt[k] === v) + '">' + esc(v) + "</button>"; };
    var rows = W.map(function (w) {
      return '<li data-d="' + esc(w.discipline) + '" data-y="' + esc(w.year) + '"><a class="toc-row" href="#work-' + w.slug + '" data-i="' + (w.no - 1) + '">' +
        '<span class="mthumb">' + media(w.images[0], { still: true, decorative: true, sizes: "52px" }) + "</span>" +
        '<span class="n meta">' + pad(w.no) + "</span>" +
        '<span class="t">' + esc(w.title) + "</span>" +
        '<span class="c">' + esc(w.client) + (w.discipline ? ' <span class="d meta muted">· ' + esc(w.discipline) + "</span>" : "") + "</span>" +
        '<span class="y meta">' + esc(w.year) + "</span></a></li>";
    }).join("");
    return '<section class="wrap"><header class="page-head grid12"><h1 class="title">Index</h1>' +
      '<p class="aside meta">' + W.length + " projects" + (yMin ? ", " + (yMin === yMax ? yMin : yMin + "–" + yMax) : "") + "</p></header>" +
      '<div class="toc grid12">' +
      '<div class="filters meta" role="group" aria-label="Filter by discipline"><span class="lbl">Discipline</span>' + ds.map(function (d) { return btn("d", d); }).join("") + "</div>" +
      '<div class="filters meta" role="group" aria-label="Filter by year"><span class="lbl">Year</span>' + ys.map(function (y) { return btn("y", y); }).join("") + "</div>" +
      '<div class="toc-thumb" aria-hidden="true"></div>' +
      '<ol class="toc-list">' + rows + "</ol>" +
      '<p class="toc-empty" hidden>Nothing in that year for this discipline.</p>' +
      "</div></section>";
  }

  function vWork(w) {
    var i = W.indexOf(w), prev = W[(i - 1 + W.length) % W.length], next = W[(i + 1) % W.length];
    var Ls = layouts(w.images), n = w.images.length;
    var plates = w.images.map(function (im, k) {
      var c = '<span class="meta muted">' + pad(k + 1) + " / " + pad(n) + "</span>";
      if (k === 0) c += "<span>" + esc(cap(w)) + "</span>";
      else if (im.caption) c += "<span>" + esc(im.caption) + "</span>";
      return row(Ls[k], media(im, { eager: k === 0, sizes: sizesFor(Ls[k]) }), c);
    }).join("");
    var facts = [["Client", w.client], ["Year", w.year], ["Role", w.role]].filter(function (f) { return f[1]; })
      .map(function (f) { return "<dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd>"; }).join("");
    var credits = w.credits.map(function (c) { return "<dt>" + esc(c.role) + "</dt><dd>" + esc(c.name) + "</dd>"; }).join("");
    var pager = W.length > 1 ? '<nav class="pager" aria-label="Projects">' +
      '<a href="#work-' + prev.slug + '" rel="prev"><span class="meta muted">Previous · ' + pad(prev.no) + '</span><span class="t">' + esc(prev.title) + "</span></a>" +
      '<a href="#work-' + next.slug + '" rel="next"><span class="meta muted">Next · ' + pad(next.no) + '</span><span class="t">' + esc(next.title) + "</span></a></nav>" : "";
    return '<article class="work">' +
      '<header class="work-head wrap grid12"><div class="lead">' +
      '<p class="meta muted" style="margin:0">No. ' + pad(w.no) + (w.discipline ? " · " + esc(w.discipline) : "") + "</p>" +
      '<h1 class="title">' + esc(w.title) + "</h1>" +
      (facts ? '<dl class="facts meta">' + facts + "</dl>" : "") + "</div>" +
      (w.summary ? '<div class="summary prose"><p>' + esc(w.summary) + "</p></div>" : "") + "</header>" +
      '<div class="wrap plates">' + plates + "</div>" +
      '<footer class="work-foot wrap grid12">' +
      (credits ? '<h2 class="credits-h meta">Credits</h2><dl class="credits meta">' + credits + "</dl>" : "") +
      pager + "</footer></article>";
  }

  function vArchive() {
    var frames = ALL.map(function (f, i) {
      return '<button type="button" class="frame" data-i="' + i + '" style="--r:' + ratio(f.im.ratio).toFixed(4) + '" aria-label="' + esc(f.im.alt + " — " + f.w.title + ", " + f.w.year) + '">' +
        media(f.im, { still: true, decorative: true, sizes: "(max-width: 720px) 50vw, (max-width: 1024px) 34vw, 240px" }) + '<span class="fn" aria-hidden="true">' + pad(i + 1, 3) + "</span></button>";
    }).join("");
    return '<section><header class="page-head wrap grid12"><h1 class="title">Archive</h1>' +
      '<p class="aside meta">' + ALL.length + " frames from " + W.length + " projects</p></header>" +
      '<div class="sheet">' + frames + "</div>" +
      '<p class="readout meta" aria-hidden="true"></p></section>';
  }

  function vInfo() {
    var list = function (arr) { return "<ul>" + (arr || []).filter(Boolean).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; };
    var sec = function (title, body) { return '<section><h2 class="meta">' + title + "</h2>" + body + "</section>"; };
    var press = (S.press || []).filter(function (p) { return p && p.title; });
    var pressHtml = press.length ? sec("Press", "<ul>" + press.map(function (p) {
      return '<li class="row2"><span>' + esc(p.title) + (p.note ? ", <i>" + esc(p.note) + "</i>" : "") + '</span><span class="meta">' + esc(p.year || "") + "</span></li>";
    }).join("") + "</ul>") : "";
    var avail = (S.available || []).filter(function (a) { return a && a.title; });
    var availHtml = S.show_available && avail.length ? sec("Available work", "<ul>" + avail.map(function (a) {
      return "<li>" + esc(a.title) + (a.note ? ' <span class="muted">— ' + esc(a.note) + "</span>" : "") + "</li>";
    }).join("") + "</ul>" + (S.available_note ? '<p class="meta muted" style="margin:0">' + esc(S.available_note) + "</p>" : "")) : "";
    var ig = S.instagram ? "<div>" + (S.instagram_url ? '<a href="' + esc(S.instagram_url) + '" rel="noopener">' + esc(S.instagram) + "</a>" : esc(S.instagram)) + "</div>" : "";
    var cv = S.cv ? '<p style="margin:0"><a class="copy-btn" href="' + esc(S.cv) + '" download>Download CV (PDF)</a></p>' : '<p class="meta muted" style="margin:0">CV on request</p>';
    var more = String(S.bio_more || "").split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    var email = S.email ? '<div class="contact-line"><a id="email-text" href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a><button type="button" class="copy-btn meta" data-copy="' + esc(S.email) + '">Copy</button></div>' : "";
    return '<section class="wrap"><header class="page-head grid12"><h1 class="title">Info</h1>' +
      '<p class="aside meta">' + esc(S.name) + (S.pronouns ? " · " + esc(S.pronouns) : "") + "</p></header>" +
      '<div class="info-body grid12">' +
      '<div class="bio prose"><p class="first">' + esc(S.bio) + "</p>" +
      (more.length ? '<button type="button" class="more-btn meta" aria-expanded="false" aria-controls="bio-extra">Read more</button>' +
        '<div class="extra" id="bio-extra" hidden>' + more.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" : "") + "</div>" +
      '<div class="facts-col">' +
      '<section id="contact-block" tabindex="-1"><h2 class="meta">Contact</h2>' + email + ig +
      (S.representation ? '<div class="muted">' + esc(S.representation) + "</div>" : "") + cv + "</section>" +
      ((S.services || []).length ? sec("Services", list(S.services)) : "") +
      ((S.clients || []).length ? sec("Selected clients", list(S.clients)) : "") +
      pressHtml + availHtml + "</div></div></section>";
  }

  function v404() {
    return '<section class="wrap nf"><header class="page-head grid12"><h1 class="title">Not in the index</h1>' +
      '<p class="aside meta">Page not found</p></header>' +
      '<div class="grid12"><p class="links meta"><a href="#index">Go to the Index</a><a href="#cover">Back to the cover</a></p></div></section>';
  }

  /* ---------- router ---------- */
  function resolve() {
    var h = decodeURIComponent((location.hash || "").slice(1));
    if (!h || h === "cover") return { v: "cover", t: S.name };
    if (h === "index") return { v: "index", t: "Index — " + S.name };
    if (h === "archive") return { v: "archive", t: "Archive — " + S.name };
    if (h === "info" || h === "contact") return { v: "info", t: "Info — " + S.name, contact: h === "contact" };
    if (h.indexOf("work-") === 0) {
      var w = W.filter(function (x) { return x.slug === h.slice(5); })[0];
      if (w) return { v: "work", w: w, t: w.title + " — " + S.name };
    }
    return { v: "404", t: "Not found — " + S.name };
  }
  function html(r) {
    if (r.v === "cover") return vCover();
    if (r.v === "index") return vIndex();
    if (r.v === "archive") return vArchive();
    if (r.v === "info") return vInfo();
    if (r.v === "work") return vWork(r.w);
    return v404();
  }

  var current = null, timer = null;
  function render(first) {
    var r = resolve(), key = r.v + (r.w ? r.w.slug : "");
    if (current && current.key === key) { if (r.contact) focusContact(); return; }
    var swap = function () {
      view.innerHTML = html(r);
      document.body.setAttribute("data-view", r.v);
      document.title = r.t;
      markNav(r);
      window.scrollTo(0, 0);
      wire(r);
      current = { key: key, r: r };
      if (r.contact) focusContact();
      else if (!first) { var h1 = view.querySelector("h1"); if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); } }
    };
    clearTimeout(timer);
    if (first || reduce.matches) { swap(); return; }
    view.classList.add("out");
    timer = setTimeout(function () {
      swap();
      view.classList.remove("out");
      view.classList.add("settle");
      void view.offsetWidth;
      view.classList.remove("settle");
    }, 230);
  }
  function focusContact() {
    var c = document.getElementById("contact-block");
    if (c) { c.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" }); c.focus({ preventScroll: true }); }
  }
  function markNav(r) {
    document.querySelectorAll(".mast-nav a").forEach(function (a) {
      var t = a.getAttribute("href").slice(1);
      var on = r.contact ? t === "contact" : t === r.v;
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  /* ---------- per-view behaviour ---------- */
  var cleanup = [];
  function wire(r) {
    cleanup.forEach(function (f) { f(); }); cleanup = [];
    if (r.v === "index") wireIndex();
    if (r.v === "archive") wireArchive();
    if (r.v === "info") wireInfo();
  }

  function wireIndex() {
    var list = view.querySelector(".toc-list"), toc = view.querySelector(".toc");
    var thumb = view.querySelector(".toc-thumb"), empty = view.querySelector(".toc-empty");
    function apply() {
      var shown = 0;
      list.querySelectorAll("li").forEach(function (li) {
        var ok = (filt.d === "All" || li.dataset.d === filt.d) && (filt.y === "All" || li.dataset.y === filt.y);
        li.hidden = !ok; if (ok) shown++;
      });
      empty.hidden = shown > 0;
      view.querySelectorAll(".filters button").forEach(function (b) { b.setAttribute("aria-pressed", String(filt[b.dataset.f] === b.dataset.v)); });
    }
    view.querySelectorAll(".filters button").forEach(function (b) {
      b.addEventListener("click", function () { filt[b.dataset.f] = b.dataset.v; apply(); });
    });
    apply();

    // Thumbnail in the left margin, following the pointer loosely.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var y = 0, ty = 0, raf = 0, active = -1;
    function tick() {
      y += (ty - y) * (reduce.matches ? 1 : 0.14);
      thumb.style.transform = "translateY(" + y.toFixed(1) + "px)";
      raf = Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    }
    list.addEventListener("pointermove", function (e) {
      var a = e.target.closest(".toc-row"); if (!a) return;
      var i = Number(a.dataset.i);
      if (i !== active) { active = i; thumb.innerHTML = media(W[i].images[0], { still: true, decorative: true, sizes: "220px" }); }
      var tr = toc.getBoundingClientRect(), h = thumb.offsetHeight || 200;
      ty = Math.max(0, Math.min(e.clientY - tr.top - h / 2, toc.offsetHeight - h));
      if (!thumb.classList.contains("on")) { y = ty; thumb.classList.add("on"); }
      if (!raf) raf = requestAnimationFrame(tick);
    });
    list.addEventListener("pointerleave", function () { thumb.classList.remove("on"); active = -1; });
    cleanup.push(function () { cancelAnimationFrame(raf); });
  }

  function wireArchive() {
    var sheet = view.querySelector(".sheet"), readout = view.querySelector(".readout");
    var show = function (e) {
      var f = e.target.closest(".frame"); if (!f) return;
      var x = ALL[Number(f.dataset.i)];
      readout.textContent = pad(Number(f.dataset.i) + 1, 3) + " · " + x.w.title + ", " + x.w.year;
      readout.classList.add("on");
    };
    var hide = function () { readout.classList.remove("on"); };
    sheet.addEventListener("pointerover", show);
    sheet.addEventListener("focusin", show);
    sheet.addEventListener("pointerleave", hide);
    sheet.addEventListener("focusout", hide);
    sheet.addEventListener("click", function (e) { var f = e.target.closest(".frame"); if (f) openLB(Number(f.dataset.i), f); });
  }

  function wireInfo() {
    var b = view.querySelector(".more-btn"), x = document.getElementById("bio-extra");
    if (b) b.addEventListener("click", function () {
      var open = x.hidden; x.hidden = !open;
      b.setAttribute("aria-expanded", String(open));
      b.textContent = open ? "Read less" : "Read more";
    });
    view.querySelectorAll("[data-copy]").forEach(function (c) {
      c.addEventListener("click", function () {
        var reset = function () { setTimeout(function () { c.textContent = "Copy"; }, 1600); };
        var fallback = function () {
          var t = document.getElementById("email-text"), s = window.getSelection(), rg = document.createRange();
          rg.selectNodeContents(t); s.removeAllRanges(); s.addRange(rg); c.textContent = "Selected"; reset();
        };
        try { navigator.clipboard.writeText(c.dataset.copy).then(function () { c.textContent = "Copied"; reset(); }, fallback); } catch (e) { fallback(); }
      });
    });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lb"), lbStage = lb.querySelector(".lb-stage"), lbCap = lb.querySelector(".lb-cap");
  var lbCount = lb.querySelector(".lb-count"), lbI = 0, lbReturn = null;
  function drawLB() {
    var x = ALL[lbI];
    lbStage.innerHTML = media(x.im, { still: true, sizes: "90vw" });
    lbCount.textContent = pad(lbI + 1, 3) + " / " + pad(ALL.length, 3);
    lbCap.innerHTML = '<span class="c">' + esc(x.im.caption || cap(x.w)) + "</span>" +
      '<a class="meta" href="#work-' + x.w.slug + '">View project</a>';
  }
  function step(d) { lbI = (lbI + d + ALL.length) % ALL.length; drawLB(); }
  function openLB(i, from) {
    lbI = i; lbReturn = from; drawLB();
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    lb.querySelector("[data-lb=next]").focus();
  }
  function closeLB() { if (lb.open) lb.close(); }
  lb.addEventListener("close", function () { if (lbReturn && document.body.contains(lbReturn)) lbReturn.focus(); });
  lb.addEventListener("click", function (e) {
    var a = e.target.closest("[data-lb]");
    if (a) { var d = a.dataset.lb; if (d === "close") closeLB(); if (d === "next") step(1); if (d === "prev") step(-1); return; }
    if (e.target.closest(".lb-cap a")) { closeLB(); return; }
    if (e.target === lbStage) closeLB();
  });

  /* ---------- phone menu ---------- */
  var toggle = document.querySelector(".mast-toggle"), overlay = document.getElementById("overlay");
  function openMenu() { overlay.hidden = false; toggle.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; overlay.querySelector("a").focus(); }
  function hideMenu() { overlay.hidden = true; toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
  function closeMenu() { hideMenu(); toggle.focus(); }
  toggle.addEventListener("click", openMenu);
  overlay.querySelector(".overlay-close").addEventListener("click", closeMenu);
  overlay.addEventListener("click", function (e) { if (e.target.closest("a")) hideMenu(); });
  overlay.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = overlay.querySelectorAll("a, button"), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.metaKey || e.ctrlKey || !W) return;
    if (lb.open) { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); return; }
    if (!overlay.hidden) { if (e.key === "Escape") closeMenu(); return; }
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT|VIDEO|IFRAME/.test(tag)) return;
    if (current && current.r.v === "work" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      var a = view.querySelector(e.key === "ArrowRight" ? ".pager [rel=next]" : ".pager [rel=prev]");
      if (a) location.hash = a.getAttribute("href").slice(1);
    }
  });

  /* ---------- start ---------- */
  function start(site, works) {
    normalise(site, works);
    document.querySelector(".mast-name").textContent = S.name;
    document.querySelectorAll("[data-name]").forEach(function (n) { n.textContent = S.name; });
    document.querySelector("[data-year]").textContent = new Date().getFullYear();
    document.querySelector("[data-credit]").textContent = S.design_credit || "";
    var desc = document.querySelector('meta[name="description"]');
    if (desc && S.description) desc.setAttribute("content", S.description);
    overlay.querySelector(".projects ol").innerHTML = W.map(function (w) {
      return '<li><a href="#work-' + w.slug + '"><span class="meta muted">' + pad(w.no) + '</span><span class="t">' + esc(w.title) + '</span><span class="meta muted">' + esc(w.year) + "</span></a></li>";
    }).join("");
    window.addEventListener("hashchange", function () { closeLB(); render(false); });
    render(true);
  }

  var get = function (u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(u + " " + r.status); return r.json(); }); };
  Promise.all([get("content/site.json"), get("content/works.json")]).then(function (d) { start(d[0], d[1]); }).catch(function (err) {
    view.innerHTML = '<section class="wrap nf"><header class="page-head grid12"><h1 class="title">Not loaded</h1>' +
      '<p class="aside meta">The content files could not be read</p></header><div class="grid12"><p class="prose" style="grid-column:1/-1">' +
      (location.protocol === "file:" ? "This page was opened as a file. Preview it through a local server (see README) or on the live site." : esc(err.message)) + "</p></div></section>";
  });
})();
