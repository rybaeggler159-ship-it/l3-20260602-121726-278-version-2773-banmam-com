(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function activateHero(index) {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        if (!slides.length) {
            return;
        }
        var nextIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === nextIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === nextIndex);
        });
        hero.dataset.current = String(nextIndex);
    }

    function initHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        if (!slides.length) {
            return;
        }
        hero.dataset.current = "0";
        var next = qs("[data-hero-next]", hero);
        var prev = qs("[data-hero-prev]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        if (next) {
            next.addEventListener("click", function () {
                activateHero(Number(hero.dataset.current || 0) + 1);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                activateHero(Number(hero.dataset.current || 0) - 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activateHero(Number(dot.dataset.heroDot));
            });
        });
        window.setInterval(function () {
            activateHero(Number(hero.dataset.current || 0) + 1);
        }, 5200);
    }

    function initMenu() {
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initBackTop() {
        var button = qs("[data-back-top]");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            button.classList.toggle("show", window.scrollY > 420);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function initYearFilters() {
        var scope = qs("[data-filter-scope]");
        var grid = qs("[data-filter-grid]");
        if (!scope || !grid) {
            return;
        }
        var cards = qsa(".movie-card", grid);
        qsa("[data-filter-year]", scope).forEach(function (button) {
            button.addEventListener("click", function () {
                var year = button.dataset.filterYear;
                qsa("[data-filter-year]", scope).forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                cards.forEach(function (card) {
                    var matched = year === "all" || card.dataset.year === year;
                    card.classList.toggle("is-hidden", !matched);
                });
            });
        });
    }

    function buildSearchCard(item) {
        var tags = (item.tags || "").split("|").filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
            "<a href=\"" + escapeHtml(item.url) + "\" class=\"card-link\">" +
            "<div class=\"poster-wrap\">" +
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<div class=\"poster-shade\"></div>" +
            "<div class=\"card-labels\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.year) + "</span></div>" +
            "<div class=\"play-hover\">▶</div>" +
            "</div>" +
            "<div class=\"card-body\">" +
            "<h2>" + escapeHtml(item.title) + "</h2>" +
            "<p class=\"card-desc\">" + escapeHtml(item.oneLine) + "</p>" +
            "<p class=\"meta-line\">" + escapeHtml(item.region) + " · " + escapeHtml(item.genre) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</a>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearch() {
        var results = qs("[data-search-results]");
        var title = qs("[data-search-title]");
        var input = qs("[data-search-input]");
        if (!results || !title || !input || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim();
        input.value = keyword;
        if (!keyword) {
            return;
        }
        var lower = keyword.toLowerCase();
        var matched = window.SEARCH_INDEX.filter(function (item) {
            return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category]
                .join(" ")
                .toLowerCase()
                .indexOf(lower) !== -1;
        }).slice(0, 120);
        title.textContent = matched.length ? "搜索结果" : "未找到匹配内容";
        results.innerHTML = matched.length ? matched.map(buildSearchCard).join("") : "<p class=\"empty-result\">换一个关键词试试。</p>";
    }

    function attachPlayer(source) {
        var video = qs("#movie-player");
        var overlay = qs("[data-player-overlay]");
        if (!video || !source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
        var start = function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {});
            }
        };
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
    }

    window.initMoviePlayer = attachPlayer;

    document.addEventListener("DOMContentLoaded", function () {
        initHero();
        initMenu();
        initBackTop();
        initYearFilters();
        initSearch();
    });
})();
