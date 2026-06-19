(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-pressed", String(dotIndex === index));
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var gridId = panel.getAttribute("data-filter-panel");
      var grid = document.querySelector('[data-filter-grid="' + gridId + '"]');
      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]"));
      var searchInput = panel.querySelector("[data-filter-search]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var countNode = document.querySelector('[data-result-count="' + gridId + '"]');
      var emptyNode = document.querySelector('[data-no-results="' + gridId + '"]');

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(searchInput && searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-genre"));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
          var matchType = !type || normalize(card.getAttribute("data-type")) === type;
          var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
          var visible = matchKeyword && matchRegion && matchType && matchYear;
          card.classList.toggle("hidden-by-filter", !visible);
          if (visible) {
            visibleCount += 1;
          }
        });

        if (countNode) {
          countNode.textContent = "当前显示 " + visibleCount + " 部影片";
        }
        if (emptyNode) {
          emptyNode.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (wrap) {
      var video = wrap.querySelector("video");
      var cover = wrap.querySelector("[data-play-cover]");
      var message = wrap.querySelector("[data-player-message]");
      if (!video) {
        return;
      }

      var source = video.getAttribute("data-src");
      var initialized = false;
      var hlsInstance = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
      }

      function hideCover() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            showMessage("浏览器已阻止自动播放，请再次点击播放器开始观看。");
          });
        }
      }

      function initialize() {
        if (!source) {
          showMessage("当前影片暂未配置播放源。");
          return;
        }

        hideCover();
        video.setAttribute("controls", "controls");

        if (initialized) {
          playVideo();
          return;
        }

        initialized = true;
        var Hls = window.Hls;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          return;
        }

        if (Hls && typeof Hls.isSupported === "function" && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          if (Hls.Events && Hls.Events.MANIFEST_PARSED) {
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
          } else {
            video.addEventListener("canplay", playVideo, { once: true });
          }
          if (Hls.Events && Hls.Events.ERROR) {
            hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                showMessage("视频加载失败，请刷新页面或稍后重试。");
              }
            });
          }
          return;
        }

        video.src = source;
        video.addEventListener("canplay", playVideo, { once: true });
        video.addEventListener("error", function () {
          showMessage("当前浏览器不支持此播放源，请换用支持 HLS 的浏览器。");
        }, { once: true });
      }

      if (cover) {
        cover.addEventListener("click", initialize);
      }
      video.addEventListener("click", function () {
        if (!initialized) {
          initialize();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
