(function () {
  function getHls() {
    return window.Hls || window.LocalHls || null;
  }

  function prepareVideo(shell) {
    var video = shell.querySelector('.movie-player');
    var stream = shell.getAttribute('data-stream');
    if (!video || !stream) {
      return null;
    }
    if (video.getAttribute('data-ready') === '1') {
      return video;
    }
    var Hls = getHls();
    if (Hls && Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
      shell.hlsPlayer = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      video.src = stream;
    }
    video.setAttribute('data-ready', '1');
    return video;
  }

  function playShell(shell) {
    var cover = shell.querySelector('.player-cover');
    var video = prepareVideo(shell);
    if (!video) {
      return;
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  document.addEventListener('click', function (event) {
    var target = event.target.closest('.player-cover, .movie-player');
    if (!target) {
      return;
    }
    var shell = target.closest('.player-shell');
    if (shell) {
      playShell(shell);
    }
  });
})();
