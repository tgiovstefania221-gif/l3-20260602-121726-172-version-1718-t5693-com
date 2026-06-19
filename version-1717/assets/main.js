(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeSlide);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initFilter(block) {
    var input = qs('[data-filter-input]', block);
    var typeSelect = qs('[data-filter-type]', block);
    var yearSelect = qs('[data-filter-year]', block);
    var sortSelect = qs('[data-sort]', block);
    var list = qs('[data-card-list]', block);
    var cards = qsa('[data-card]', block);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var typeValue = normalize(typeSelect ? typeSelect.value : '');
      var yearValue = normalize(yearSelect ? yearSelect.value : '');
      var visibleCards = [];

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' '));
        var type = normalize(card.getAttribute('data-type'));
        var year = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (typeValue && type !== typeValue) {
          matched = false;
        }

        if (yearValue && year !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visibleCards.push(card);
        }
      });

      if (sortSelect && list) {
        var mode = sortSelect.value;
        visibleCards.sort(function (a, b) {
          if (mode === 'popular') {
            return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
          }

          if (mode === 'old') {
            return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
          }

          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });

        visibleCards.forEach(function (card) {
          list.appendChild(card);
        });
      }

      block.classList.toggle('no-results', visibleCards.length === 0);
    }

    [input, typeSelect, yearSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  qsa('[data-filter-block]').forEach(initFilter);
})();
