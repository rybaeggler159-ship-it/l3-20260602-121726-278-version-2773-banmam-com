(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-target="movies"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var suffix = query ? '?q=' + encodeURIComponent(query) : '';
      window.location.href = 'movies.html' + suffix;
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var scope = form.closest('main') || document;
    var input = form.querySelector('[data-filter-input]');
    var yearSelect = form.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-card'));
    var empty = scope.querySelector('[data-filter-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    var apply = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    if (input) {
      input.addEventListener('input', apply);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }

    apply();
  });
})();

function initMoviePlayer(videoId, src, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var started = false;
  var hls = null;

  if (!video || !src) {
    return;
  }

  var hideOverlay = function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  };

  var tryPlay = function () {
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  };

  var start = function () {
    hideOverlay();

    if (!started) {
      started = true;
      video.controls = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          tryPlay();
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', tryPlay, { once: true });
      } else {
        video.src = src;
      }
    }

    tryPlay();
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });

  video.addEventListener('play', hideOverlay);

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
