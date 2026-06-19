(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menu = document.querySelector('.menu-toggle');
    if (menu) {
      menu.addEventListener('click', function () {
        document.body.classList.toggle('menu-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (slides.length) {
      var current = 0;
      var show = function (index) {
        current = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }

    var queryInput = document.querySelector('[data-search-input]');
    var yearInput = document.querySelector('[data-year-filter]');
    var regionInput = document.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-genre]'));
    var filter = function () {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var y = yearInput ? yearInput.value : '';
      var r = regionInput ? regionInput.value : '';
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.category, card.textContent].join(' ').toLowerCase();
        var ok = (!q || hay.indexOf(q) !== -1) && (!y || card.dataset.year === y) && (!r || card.dataset.region.indexOf(r) !== -1);
        card.style.display = ok ? '' : 'none';
      });
    };
    [queryInput, yearInput, regionInput].forEach(function (el) {
      if (el) {
        el.addEventListener('input', filter);
        el.addEventListener('change', filter);
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-overlay');
      var source = shell.getAttribute('data-source');
      var initialized = false;
      var initialize = function () {
        if (initialized || !video || !source) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      };
      var play = function () {
        initialize();
        shell.classList.add('playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      };
      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('playing');
        });
        video.addEventListener('click', function () {
          initialize();
        });
      }
    });
  });
})();
