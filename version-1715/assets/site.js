(() => {
  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  function bindMenu() {
    const button = qs('[data-menu-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  function bindHero() {
    const hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    const prev = qs('[data-hero-prev]', hero);
    const next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;
    const show = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5000);
    };
    prev && prev.addEventListener('click', () => {
      show(index - 1);
      start();
    });
    next && next.addEventListener('click', () => {
      show(index + 1);
      start();
    });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  function getQueryValue() {
    const params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function bindSearch() {
    const input = qs('[data-search-input]');
    const cards = qsa('[data-card]');
    const selects = qsa('[data-select-filter]');
    if (!cards.length) {
      return;
    }
    const queryValue = getQueryValue();
    if (input && queryValue) {
      input.value = queryValue;
    }
    const apply = () => {
      const term = input ? input.value.trim().toLowerCase() : '';
      const filters = {};
      selects.forEach((select) => {
        filters[select.getAttribute('data-select-filter')] = select.value;
      });
      cards.forEach((card) => {
        const text = (card.getAttribute('data-search-text') || '').toLowerCase();
        const byTerm = !term || text.includes(term);
        const byRegion = !filters.region || card.getAttribute('data-region') === filters.region;
        const byYear = !filters.year || card.getAttribute('data-year') === filters.year;
        card.classList.toggle('is-hidden', !(byTerm && byRegion && byYear));
      });
    };
    input && input.addEventListener('input', apply);
    selects.forEach((select) => select.addEventListener('change', apply));
    apply();
  }

  function bindPlayer() {
    const block = qs('[data-player]');
    if (!block) {
      return;
    }
    const video = qs('video', block);
    const mask = qs('.player-mask', block);
    const stream = block.getAttribute('data-stream');
    if (!video || !mask || !stream) {
      return;
    }
    let ready = false;
    let hls = null;
    const prepare = () => {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      ready = true;
    };
    const play = () => {
      prepare();
      mask.classList.add('hidden');
      video.controls = true;
      const action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(() => {});
      }
    };
    mask.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (!ready) {
        play();
      }
    });
    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindMenu();
    bindHero();
    bindSearch();
    bindPlayer();
  });
})();
