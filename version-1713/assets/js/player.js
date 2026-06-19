import { H as Hls } from './hls-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
  const video = player.querySelector('video[data-stream]');
  const button = player.querySelector('[data-play-button]');
  const status = player.querySelector('[data-player-status]');
  let hls = null;
  let prepared = false;

  if (!video || !button) {
    return;
  }

  const setStatus = function (message) {
    if (status) {
      status.textContent = message;
    }
  };

  const prepare = function () {
    if (prepared) {
      return Promise.resolve();
    }

    prepared = true;
    const stream = video.dataset.stream;

    if (!stream) {
      setStatus('当前影片未绑定播放源。');
      return Promise.reject(new Error('missing stream'));
    }

    setStatus('正在加载播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(stream);
      hls.attachMedia(video);

      return new Promise(function (resolve, reject) {
        const timeout = window.setTimeout(function () {
          reject(new Error('hls timeout'));
        }, 8000);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          window.clearTimeout(timeout);
          resolve();
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            window.clearTimeout(timeout);
            reject(new Error(data.details || 'hls error'));
          }
        });
      });
    }

    video.src = stream;
    return Promise.resolve();
  };

  const start = function () {
    prepare()
      .then(function () {
        return video.play();
      })
      .then(function () {
        button.classList.add('is-hidden');
        setStatus('正在播放。');
      })
      .catch(function () {
        prepared = false;
        if (hls) {
          hls.destroy();
          hls = null;
        }
        button.classList.remove('is-hidden');
        setStatus('播放源暂时无法加载，请检查对应的本地 m3u8 文件。');
      });
  };

  button.addEventListener('click', start);

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });
});
