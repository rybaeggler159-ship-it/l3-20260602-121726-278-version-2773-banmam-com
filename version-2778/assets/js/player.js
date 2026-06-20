(function () {
  function init(streamUrl) {
    const video = document.querySelector('.movie-video');
    const overlay = document.querySelector('.player-overlay');
    const trigger = document.querySelector('.play-trigger');

    if (!video || !streamUrl) {
      return;
    }

    let hls = null;
    let attached = false;

    function attachStream() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function startPlayback() {
      attachStream();
      hideOverlay();
      video.controls = true;
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', startPlayback);
    }

    if (overlay && overlay !== trigger) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', hideOverlay);

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = { init: init };
})();
