(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initPlayer();
  });

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var scope = panel.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var searchInput = panel.querySelector("[data-search-input]");
      var categoryFilter = panel.querySelector("[data-category-filter]");
      var yearFilter = panel.querySelector("[data-year-filter]");
      var count = panel.querySelector("[data-filter-count]");
      var noResults = scope.querySelector("[data-no-results]");

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var keyword = normalize(searchInput && searchInput.value);
        var category = normalize(categoryFilter && categoryFilter.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.textContent + " " + Object.values(card.dataset).join(" "));
          var cardCategory = normalize(card.querySelector(".category-mini") && card.querySelector(".category-mini").textContent);
          var cardYear = parseInt(card.dataset.year || "0", 10);
          var yearValue = parseInt(year || "0", 10);
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          if (category && cardCategory !== category) {
            matched = false;
          }

          if (year && (Number.isNaN(cardYear) || cardYear < yearValue)) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible;
        }

        if (noResults) {
          noResults.classList.toggle("show", visible === 0);
        }
      }

      [searchInput, categoryFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");

    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-play-overlay]");
    var button = player.querySelector("[data-play-button]");
    var status = player.querySelector("[data-player-status]");
    var source = player.getAttribute("data-source");
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function startVideo() {
      if (overlay) {
        overlay.classList.add("hidden");
      }

      setStatus("正在初始化高清播放源，请保持网络连接稳定。");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {
          setStatus("浏览器阻止自动播放，请再次点击播放器开始观看。");
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪，正在播放。");
          video.play().catch(function () {
            setStatus("浏览器阻止自动播放，请再次点击播放器开始观看。");
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("当前网络下播放源加载失败，请刷新页面或稍后重试。");
          }
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {
        setStatus("当前浏览器不支持 HLS 播放，请更换浏览器或启用 HLS 支持。");
      });
    }

    button.addEventListener("click", startVideo);
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
  }
})();
