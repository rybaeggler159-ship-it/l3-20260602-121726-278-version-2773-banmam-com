(function () {
  const input = document.getElementById('site-search-input');
  const button = document.getElementById('site-search-button');
  const results = document.getElementById('search-results');
  const movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];

  if (!input || !button || !results) {
    return;
  }

  function card(movie) {
    const tagList = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
      '<span class="poster-frame">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="poster-play">▶</span>' +
      '<span class="poster-badges"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></span>' +
      '</span>' +
      '<span class="card-body">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span class="card-line">' + escapeHtml(movie.oneLine) + '</span>' +
      '<span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</span>' +
      '<span class="tag-list">' + tagList + '</span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function render() {
    const query = input.value.trim().toLowerCase();
    const list = query ? movies.filter(function (movie) {
      return movie.searchText.indexOf(query) !== -1;
    }) : movies.slice(0, 48);

    results.innerHTML = list.slice(0, 96).map(card).join('');
  }

  button.addEventListener('click', render);
  input.addEventListener('input', render);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      render();
    }
  });

  input.value = getQueryFromUrl();
  render();
})();
