import { H as Hls } from "./hls-dru42stk.js";

export function initMoviePlayer(source) {
    const video = document.querySelector("[data-movie-player]");
    const playButton = document.querySelector("[data-play-button]");

    if (!video || !playButton || !source) {
        return;
    }

    let attached = false;

    const attachSource = () => {
        if (attached) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        attached = true;
    };

    const startPlayback = async () => {
        attachSource();
        video.controls = true;
        playButton.classList.add("is-hidden");

        try {
            await video.play();
        } catch (error) {
            playButton.classList.remove("is-hidden");
        }
    };

    playButton.addEventListener("click", startPlayback);

    video.addEventListener("click", () => {
        if (!attached || video.paused) {
            startPlayback();
        }
    });
}
