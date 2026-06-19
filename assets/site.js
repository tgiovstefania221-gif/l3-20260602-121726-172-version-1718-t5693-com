document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-header-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      window.location.href = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
    });
  });

  var hero = document.querySelector("[data-hero-carousel]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll("[data-filter-root]").forEach(function (root) {
    var input = root.querySelector("[data-filter-input]");
    var year = root.querySelector("[data-year-filter]");
    var type = root.querySelector("[data-type-filter]");
    var reset = root.querySelector("[data-reset-filter]");
    var empty = root.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!selectedYear || cardYear === selectedYear) && (!selectedType || cardType === selectedType);
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    [input, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        apply();
      });
    }
    apply();
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var overlay = player.querySelector(".play-overlay");
    var hlsInstance = null;
    var prepared = false;
    if (!video) {
      return;
    }
    var prepare = function () {
      if (prepared) {
        return;
      }
      var source = video.getAttribute("data-m3u8");
      if (!source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
      prepared = true;
    };
    var play = function () {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
