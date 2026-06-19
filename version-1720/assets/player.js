(function () {
  var instances = new WeakMap();

  function startPlayer(box) {
    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var url = box.getAttribute('data-play-url');

    if (!video || !url) {
      return;
    }

    if (cover) {
      cover.hidden = true;
    }

    box.classList.add('is-playing');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', url);
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = instances.get(video);

      if (!hls) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        instances.set(video, hls);
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', url);
    }
    video.play().catch(function () {});
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('.player-cover, .movie-player');
    if (!trigger) {
      return;
    }
    startPlayer(trigger.closest('.player-box'));
  });
})();
