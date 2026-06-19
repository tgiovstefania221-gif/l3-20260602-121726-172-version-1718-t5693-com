(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-cover]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.dataset.missing = 'true';
      const shell = image.closest('.poster-shell, .hero-image-layer, .detail-backdrop, .hero-thumb');
      if (shell) {
        shell.classList.add('missing-cover');
      }
    }, { once: true });
  });

  document.querySelectorAll('form[action$="search.html"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      const value = input.value.trim();
      if (!value) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const thumbs = Array.from(carousel.querySelectorAll('[data-hero-thumb]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const setSlide = function (index) {
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
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        restart();
      });
    });

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        setSlide(index);
        restart();
      });
    });

    setSlide(0);
    restart();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const textInput = filterPanel.querySelector('[data-filter-text]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const regionInput = filterPanel.querySelector('[data-filter-region]');
    const clearButton = filterPanel.querySelector('[data-filter-clear]');
    const list = document.querySelector('[data-filter-list]');
    const empty = document.querySelector('[data-no-results]');
    const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];

    const applyFilters = function () {
      const text = textInput ? textInput.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value.trim() : '';
      const region = regionInput ? regionInput.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const search = (card.dataset.search || '').toLowerCase();
        const cardYear = card.dataset.year || '';
        const cardRegion = (card.dataset.region || '').toLowerCase();
        const matchesText = !text || search.includes(text);
        const matchesYear = !year || cardYear === year;
        const matchesRegion = !region || cardRegion.includes(region);
        const show = matchesText && matchesYear && matchesRegion;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [textInput, yearSelect, regionInput].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (regionInput) {
          regionInput.value = '';
        }
        applyFilters();
      });
    }
  }

  const searchResults = document.getElementById('searchResults');
  const searchInput = document.getElementById('searchInput');
  const searchHeading = document.querySelector('[data-search-heading]');
  const searchSummary = document.querySelector('[data-search-summary]');
  const searchEmpty = document.getElementById('searchEmpty');

  if (searchResults && window.SEARCH_DATA) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    const createCard = function (movie) {
      const tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
        '    <figure class="poster-shell">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy" data-cover>',
        '      <span class="cover-fallback">' + escapeHtml(movie.title.slice(0, 8)) + '</span>',
        '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '    </figure>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta">',
        '      <a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '    </div>',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.description) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '    <div class="card-foot">',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '      <strong>推荐指数 ' + escapeHtml(String(movie.score)) + '</strong>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    };

    const render = function (query) {
      const normalized = query.trim().toLowerCase();
      const terms = normalized.split(/\s+/).filter(Boolean);
      let results = window.SEARCH_DATA;

      if (terms.length) {
        results = window.SEARCH_DATA.filter(function (movie) {
          const text = movie.search.toLowerCase();
          return terms.every(function (term) {
            return text.includes(term);
          });
        });
      } else {
        results = window.SEARCH_DATA.slice(0, 24);
      }

      results = results.slice(0, 160);
      searchResults.innerHTML = results.map(createCard).join('');

      searchResults.querySelectorAll('img[data-cover]').forEach(function (image) {
        image.addEventListener('error', function () {
          image.dataset.missing = 'true';
          const shell = image.closest('.poster-shell');
          if (shell) {
            shell.classList.add('missing-cover');
          }
        }, { once: true });
      });

      if (searchHeading) {
        searchHeading.textContent = terms.length ? '搜索结果' : '推荐片单';
      }

      if (searchSummary) {
        searchSummary.textContent = terms.length
          ? '已显示与关键词匹配的影片。'
          : '可直接搜索完整片库，也可先浏览下方推荐作品。';
      }

      if (searchEmpty) {
        searchEmpty.hidden = results.length !== 0;
      }
    };

    const searchForm = document.querySelector('.search-page-form');
    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = searchInput ? searchInput.value : '';
        const nextUrl = query.trim() ? 'search.html?q=' + encodeURIComponent(query.trim()) : 'search.html';
        window.history.replaceState({}, '', nextUrl);
        render(query);
      });
    }

    render(initialQuery);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
}());
