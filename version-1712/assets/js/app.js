(function () {
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAutoPlay();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-select]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
    var count = scope.querySelector('[data-filter-count]');
    var empty = scope.querySelector('[data-empty-state]');

    if (!input && !select) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input && !input.value) {
      input.value = query;
    }

    function applyFilter() {
      var text = normalize(input ? input.value : '');
      var category = select ? select.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardCategory = card.getAttribute('data-category') || '';
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesCategory = !category || category === cardCategory;
        var shouldShow = matchesText && matchesCategory;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(setupFilter);
})();
