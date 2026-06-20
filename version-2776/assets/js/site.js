(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        var showSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        var startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterPanel && filterList) {
        var input = filterPanel.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-filter-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q') || '';

        if (input && initialKeyword) {
            input.value = initialKeyword;
        }

        var readSelect = function (name) {
            var found = selects.find(function (select) {
                return select.getAttribute('data-filter-select') === name;
            });
            return found ? found.value.trim().toLowerCase() : '';
        };

        var applyFilter = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var collection = readSelect('collection');
            var region = readSelect('region');
            var type = readSelect('type');
            var shown = 0;

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchCollection = !collection || (card.getAttribute('data-collection') || '').toLowerCase() === collection;
                var matchRegion = !region || (card.getAttribute('data-region') || '').toLowerCase() === region;
                var matchType = !type || (card.getAttribute('data-type') || '').toLowerCase() === type;
                var visible = matchKeyword && matchCollection && matchRegion && matchType;

                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        };

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });

        applyFilter();
    }
})();

function initializeMoviePlayer(source) {
    var video = document.querySelector('.movie-player');
    var cover = document.querySelector('.player-cover');

    if (!video || !cover || !source) {
        return;
    }

    var loaded = false;
    var hlsInstance = null;

    var playVideo = function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                cover.classList.remove('is-hidden');
            });
        }
    };

    var loadVideo = function () {
        if (loaded) {
            cover.classList.add('is-hidden');
            video.controls = true;
            playVideo();
            return;
        }

        loaded = true;
        cover.classList.add('is-hidden');
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                hlsInstance.loadSource(source);
            });
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = source;
                    video.load();
                    playVideo();
                }
            });
            return;
        }

        video.src = source;
        video.load();
        playVideo();
    };

    cover.addEventListener('click', loadVideo);

    video.addEventListener('click', function () {
        if (!loaded) {
            loadVideo();
        }
    });
}
