const mobileButton = document.querySelector("[data-mobile-menu-button]");
const mobilePanel = document.querySelector("[data-mobile-panel]");

if (mobileButton && mobilePanel) {
    mobileButton.addEventListener("click", () => {
        const isOpen = mobilePanel.classList.toggle("is-open");
        mobileButton.setAttribute("aria-expanded", String(isOpen));
    });
}

const heroCarousel = document.querySelector("[data-hero-carousel]");

if (heroCarousel) {
    const slides = Array.from(heroCarousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(heroCarousel.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;

    const showSlide = (nextIndex) => {
        if (!slides.length) {
            return;
        }

        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === activeIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === activeIndex);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => showSlide(index));
    });

    if (slides.length > 1) {
        window.setInterval(() => showSlide(activeIndex + 1), 5200);
    }
}

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const applyFilters = (scope) => {
    const input = scope.querySelector("[data-filter-input]");
    const yearSelect = scope.querySelector("[data-year-filter]");
    const sortSelect = scope.querySelector("[data-sort-filter]");
    const grid = document.querySelector("[data-movie-grid]");
    const cards = grid ? Array.from(grid.querySelectorAll("[data-movie-card]")) : [];
    const counter = scope.querySelector("[data-result-count]");
    const noResults = document.querySelector("[data-no-results]");

    if (!grid || !cards.length) {
        return;
    }

    const query = normalizeText(input ? input.value : "");
    const year = yearSelect ? yearSelect.value : "";
    let visibleCount = 0;

    cards.forEach((card) => {
        const haystack = normalizeText([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.category,
        ].join(" "));
        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = !year || card.dataset.year === year;
        const isVisible = matchesQuery && matchesYear;

        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
            visibleCount += 1;
        }
    });

    if (sortSelect && sortSelect.value !== "default") {
        const visibleCards = cards.filter((card) => card.style.display !== "none");
        const sortedCards = visibleCards.sort((a, b) => {
            if (sortSelect.value === "year-desc") {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }

            if (sortSelect.value === "year-asc") {
                return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
            }

            return normalizeText(a.dataset.title).localeCompare(normalizeText(b.dataset.title), "zh-Hans-CN");
        });

        sortedCards.forEach((card) => grid.appendChild(card));
    }

    if (counter) {
        counter.textContent = String(visibleCount);
    }

    if (noResults) {
        noResults.classList.toggle("is-visible", visibleCount === 0);
    }
};

const filterScope = document.querySelector("[data-filter-scope]");

if (filterScope) {
    const input = filterScope.querySelector("[data-filter-input]");
    const yearSelect = filterScope.querySelector("[data-year-filter]");
    const sortSelect = filterScope.querySelector("[data-sort-filter]");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (input && query) {
        input.value = query;
    }

    [input, yearSelect, sortSelect].filter(Boolean).forEach((control) => {
        control.addEventListener("input", () => applyFilters(filterScope));
        control.addEventListener("change", () => applyFilters(filterScope));
    });

    applyFilters(filterScope);
}
