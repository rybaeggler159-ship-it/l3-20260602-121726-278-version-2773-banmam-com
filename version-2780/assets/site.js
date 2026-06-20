(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function auto() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                auto();
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            show(0);
            auto();
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = "./search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });

        document.querySelectorAll("[data-filter-form]").forEach(function (form) {
            var textInput = form.querySelector("[data-filter-text]");
            var yearSelect = form.querySelector("[data-filter-year]");
            var categorySelect = form.querySelector("[data-filter-category]");
            var results = document.querySelector("[data-filter-results]");
            var empty = document.querySelector("[data-empty-state]");
            var cards = results ? Array.prototype.slice.call(results.querySelectorAll("[data-movie-card]")) : [];
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (textInput && initialQuery) {
                textInput.value = initialQuery;
            }

            function applyFilters() {
                var query = normalize(textInput ? textInput.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var category = normalize(categorySelect ? categorySelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var matchCategory = !category || normalize(card.getAttribute("data-category")) === category;
                    var isVisible = matchQuery && matchYear && matchCategory;
                    card.style.display = isVisible ? "" : "none";
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [textInput, yearSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        });
    });

    window.initPlayer = function (source) {
        ready(function () {
            var box = document.querySelector("[data-player]");
            if (!box) {
                return;
            }
            var video = box.querySelector("video");
            var overlay = box.querySelector("[data-player-overlay]");
            var button = box.querySelector("[data-player-button]");
            var started = false;
            var hls = null;

            function start() {
                if (!video || started || !source) {
                    return;
                }
                started = true;
                video.controls = true;
                video.setAttribute("playsinline", "");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }

                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.stopPropagation();
                    start();
                });
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        start();
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    };
})();
