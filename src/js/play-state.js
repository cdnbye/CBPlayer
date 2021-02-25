const prefix = 'Vod';

class PlayState {
    constructor(video, url) {
        this.video = video;

        this.url = url;

        this.key = prefix + this.url + ' ';
    }

    startRecord() {
        this.timer = window.setInterval(() => {
            // console.warn(`set ${this.key} ${this.video.currentTime}`);
            this.set(this.key, this.video.currentTime);
        }, 1000);
    }

    getLastState() {
        const lastTime = this.get(this.key);
        return lastTime;
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    set(key, val) {
        window.sessionStorage.setItem(key, val);
    }

    get(key) {
        return window.sessionStorage.getItem(key);
    }

    del(key) {
        window.sessionStorage.removeItem(key);
    }

    clear() {
        window.sessionStorage.clear();
    }
}

export default PlayState;
