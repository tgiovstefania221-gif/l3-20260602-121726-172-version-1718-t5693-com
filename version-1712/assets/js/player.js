import { H as Hls } from './hls-dru42stk.js';

function setStatus(player, message) {
  var status = player.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function initializePlayer(player) {
  var video = player.querySelector('video');
  var source = video ? video.getAttribute('data-hls-src') : '';

  if (!video || !source) {
    setStatus(player, '播放源未找到');
    return Promise.resolve(false);
  }

  if (player.dataset.ready === '1') {
    return video.play().then(function () {
      return true;
    });
  }

  player.dataset.ready = '1';
  setStatus(player, '正在初始化高清播放源...');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus(player, '播放源已就绪');
    return video.play().then(function () {
      player.classList.add('is-started');
      return true;
    });
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(player, '播放源已就绪');
      video.play().then(function () {
        player.classList.add('is-started');
      }).catch(function () {
        setStatus(player, '请点击播放按钮开始观看');
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus(player, '播放源连接异常，请刷新后重试');
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      }
    });

    player._hls = hls;
    return Promise.resolve(true);
  }

  setStatus(player, '当前浏览器不支持 HLS 播放');
  return Promise.resolve(false);
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
  var start = player.querySelector('[data-play-button]');
  var video = player.querySelector('video');

  if (start) {
    start.addEventListener('click', function () {
      initializePlayer(player).catch(function () {
        setStatus(player, '请再次点击播放按钮');
      });
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      player.classList.add('is-started');
      setStatus(player, '正在播放');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        setStatus(player, '已暂停');
      }
    });

    video.addEventListener('ended', function () {
      setStatus(player, '播放结束，可重新播放');
    });
  }
});
