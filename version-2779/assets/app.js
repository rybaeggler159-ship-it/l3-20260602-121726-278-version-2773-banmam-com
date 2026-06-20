(function () {
  var nav = document.querySelector(".nav-links");
  var toggle = document.querySelector(".mobile-toggle");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      document.body.classList.toggle("no-scroll", nav.classList.contains("open"));
    });
  }

  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.matches && target.matches("img.cover-image")) {
      target.closest(".cover-frame, .hero-slide, .detail-bg")?.classList.add("cover-fallback");
      target.style.display = "none";
    }
  }, true);

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle("active", itemIndex === heroIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle("active", itemIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    showHero(0);
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
  var emptyState = document.querySelector(".empty-state");

  function applyFilter(value) {
    var query = value.trim().toLowerCase();
    var visible = 0;
    filterCards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      var match = !query || text.indexOf(query) !== -1;
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  if (filterInput) {
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
  }

  var heroSearch = document.querySelector("[data-hero-search]");
  if (heroSearch) {
    heroSearch.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector("input");
      var value = input ? input.value.trim() : "";
      var target = "./library.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q");
  if (q && filterInput) {
    filterInput.value = q;
    applyFilter(q);
  }
})();
