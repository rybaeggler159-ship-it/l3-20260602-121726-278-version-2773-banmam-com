(function() {
    var menu = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (menu && panel) {
        menu.addEventListener('click', function() {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, idx) {
            slide.classList.toggle('active', idx === current);
        });
        dots.forEach(function(dot, idx) {
            dot.classList.toggle('active', idx === current);
        });
    }

    dots.forEach(function(dot, idx) {
        dot.addEventListener('click', function() {
            showSlide(idx);
        });
    });

    if (slides.length > 1) {
        setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    var filterInput = document.querySelector('.page-filter');
    var yearSelect = document.querySelector('.year-filter');
    var categorySelect = document.querySelector('.category-filter');
    var items = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card, .searchable-list .rank-item'));

    function cardText(item) {
        return normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-year'),
            item.getAttribute('data-category'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-region'),
            item.textContent
        ].join(' '));
    }

    function applyFilter() {
        var q = normalize(filterInput ? filterInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var category = categorySelect ? categorySelect.value : '';
        items.forEach(function(item) {
            var text = cardText(item);
            var okText = !q || text.indexOf(q) !== -1;
            var okYear = !year || item.getAttribute('data-year') === year || text.indexOf(year) !== -1;
            var okCategory = !category || item.getAttribute('data-category') === category || text.indexOf(normalize(category)) !== -1;
            item.classList.toggle('is-hidden', !(okText && okYear && okCategory));
        });
    }

    if (filterInput || yearSelect || categorySelect) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && filterInput) {
            filterInput.value = q;
        }
        [filterInput, yearSelect, categorySelect].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }
}());
