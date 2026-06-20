function initMoviePlayer(source) {
  var video = document.querySelector(".site-player");
  var overlay = document.querySelector(".play-overlay");

  if (!video || !source) {
    return;
  }

  var attached = false;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    attach();
    if (overlay) {
      overlay.classList.add("hidden");
    }
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        if (overlay) {
          overlay.classList.remove("hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  });
}
