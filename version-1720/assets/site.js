(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var current = slides.findIndex(function (slide) {
    return slide.classList.contains('is-active');
  });

  if (current < 0) {
    current = 0;
  }

  function showSlide(next) {
    if (!slides.length) {
      return;
    }

    slides[current].classList.remove('is-active');
    current = (next + slides.length) % slides.length;
    slides[current].classList.add('is-active');
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-text') || '').toLowerCase();
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var keywordMatch = !keyword || text.indexOf(keyword) >= 0 || title.indexOf(keyword) >= 0;
      var yearMatch = !year || cardYear === year;
      var show = keywordMatch && yearMatch;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (filterInput) {
    var initial = readQuery();
    if (initial) {
      filterInput.value = initial;
    }
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterYear) {
    filterYear.addEventListener('change', applyFilter);
  }

  applyFilter();
})();
