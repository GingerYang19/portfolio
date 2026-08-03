/* ==========================================================================
   杨可欣 · 作品集  —  滚动动效 / 导航联动
   无依赖，原生实现；尊重 prefers-reduced-motion
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------- 进场：滚动显现 */

  function initReveal() {
    var targets = document.querySelectorAll(".reveal, .mask, .zoom-in, .rule");
    if (!targets.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------- 自动为成组元素写入错落延迟 */

  function initStagger() {
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var step = parseFloat(group.getAttribute("data-stagger")) || 0.09;
      var kids = group.querySelectorAll(":scope > *");
      kids.forEach(function (kid, i) {
        if (!kid.style.getPropertyValue("--d")) {
          kid.style.setProperty("--d", (i * step).toFixed(2) + "s");
        }
      });
    });
  }

  /* ---------------------------------------- 顶部：进度条 + 导航状态 */

  function initScrollChrome() {
    var bar = document.querySelector(".progress");
    var nav = document.querySelector(".nav");
    var ticking = false;

    function paint() {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      }
      if (nav) {
        nav.classList.toggle("is-stuck", y > 12);
      }
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
  }

  /* --------------------------------------------- 导航高亮当前板块 */

  function initSectionSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".nav__link[href^='#']")
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      sections.push(section);
    });

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.remove("is-active");
          });
          var active = map[entry.target.id];
          if (active) active.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* --------------------------------------------------- 轻量视差位移 */

  function initParallax() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-parallax]")
    );
    if (!items.length || reduced) return;

    var ticking = false;

    function paint() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.08;
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        el.style.setProperty("--p", (-progress * speed * 100).toFixed(2) + "px");
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    paint();
  }

  /* ------------------------------- 视频：滚出视口自动暂停，节省资源 */

  function initVideoPause() {
    var videos = document.querySelectorAll("video");
    if (!videos.length || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (!entry.isIntersecting && !v.paused) v.pause();
        });
      },
      { threshold: 0.15 }
    );

    videos.forEach(function (v) {
      io.observe(v);
    });
  }

  /* --------------------------- 详情页：图集点灯箱放大查看 */

  function initLightbox() {
    var figures = document.querySelectorAll("[data-lightbox] img");
    if (!figures.length) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "图片查看");
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="关闭">&times;</button>' +
      '<img alt="" />';
    document.body.appendChild(box);

    var big = box.querySelector("img");

    function open(src, alt) {
      big.src = src;
      big.alt = alt || "";
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    figures.forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        open(img.currentSrc || img.src, img.alt);
      });
    });

    box.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------------------------------------------------- 启动 */

  function boot() {
    initStagger();
    initReveal();
    initScrollChrome();
    initSectionSpy();
    initParallax();
    initVideoPause();
    initLightbox();
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
