(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = selectAll(".hero-slide");
        var posters = selectAll(".hero-poster");
        var thumbs = selectAll(".hero-thumb");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (item, i) {
                item.classList.toggle("active", i === index);
            });
            posters.forEach(function (item, i) {
                item.classList.toggle("active", i === index);
            });
            thumbs.forEach(function (item, i) {
                item.classList.toggle("active", i === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var search = document.querySelector(".movie-search");
        var year = document.querySelector(".movie-year-filter");
        var type = document.querySelector(".movie-type-filter");
        var cards = selectAll(".movie-card");
        if (!cards.length || (!search && !year && !type)) {
            return;
        }
        function apply() {
            var q = normalize(search && search.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-text"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (y && cardYear !== y) {
                    ok = false;
                }
                if (t && cardType !== t) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
            });
        }
        [search, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    window.initMoviePlayer = function (videoId, source, triggerId) {
        var video = document.getElementById(videoId);
        var trigger = document.getElementById(triggerId);
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        function load() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                });
            }
            video.src = source;
            return Promise.resolve();
        }
        function play() {
            load().then(function () {
                video.controls = true;
                if (trigger) {
                    trigger.classList.add("hidden");
                }
                var action = video.play();
                if (action && action.catch) {
                    action.catch(function () {});
                }
            });
        }
        if (trigger) {
            trigger.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
