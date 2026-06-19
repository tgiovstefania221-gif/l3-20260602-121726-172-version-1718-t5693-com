(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterPanel = document.querySelector('.filter-panel');
  if (filterPanel) {
    var keyword = filterPanel.querySelector('.filter-keyword');
    var year = filterPanel.querySelector('.filter-year');
    var region = filterPanel.querySelector('.filter-region');
    var type = filterPanel.querySelector('.filter-type');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function applyFilters() {
      var query = keyword ? keyword.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';

      cards.forEach(function (card) {
        var matchedQuery = !query || (card.getAttribute('data-search') || '').indexOf(query) !== -1;
        var matchedYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchedRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matchedType = !selectedType || card.getAttribute('data-type') === selectedType;
        card.classList.toggle('hidden-card', !(matchedQuery && matchedYear && matchedRegion && matchedType));
      });
    }

    [keyword, year, region, type].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilters);
        field.addEventListener('change', applyFilters);
      }
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');

  function renderSearch() {
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = searchInput && searchInput.value.trim() ? searchInput.value.trim() : (params.get('q') || '').trim();
    if (searchInput) {
      searchInput.value = query;
    }
    var normalized = query.toLowerCase();
    var matched = window.SEARCH_INDEX.filter(function (item) {
      return !normalized || item.search.indexOf(normalized) !== -1;
    }).slice(0, 120);

    results.innerHTML = matched.map(function (item) {
      return [
        '<article class="search-item">',
        '<h2><a href="' + item.url + '">' + item.title + '</a></h2>',
        '<p>' + item.oneLine + '</p>',
        '<div class="meta-row"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span><span>' + item.genre + '</span></div>',
        '</article>'
      ].join('');
    }).join('');
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput ? searchInput.value.trim() : '';
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      history.replaceState(null, '', url);
      renderSearch();
    });
  }

  renderSearch();
})();
