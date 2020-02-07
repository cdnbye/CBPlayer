/* global DPLAYER_VERSION GIT_HASH */

class InfoPanel {
    constructor(player) {
        this.container = player.template.infoPanel;
        this.template = player.template;
        this.video = player.video;
        this.player = player;

        this.template.infoPanelClose.addEventListener('click', () => {
            this.hide();
        });
    }

    show() {
        this.beginTime = Date.now();
        this.update();
        this.player.timer.enable('info');
        this.player.timer.enable('fps');
        this.container.classList.remove('dplayer-info-panel-hide');
    }

    hide() {
        this.player.timer.disable('info');
        this.player.timer.disable('fps');
        this.container.classList.add('dplayer-info-panel-hide');
    }

    triggle() {
        if (this.container.classList.contains('dplayer-info-panel-hide')) {
            this.show();
        } else {
            this.hide();
        }
    }

    update() {
        this.template.infoVersion.innerHTML = `v${DPLAYER_VERSION}`;
        this.template.infoType.innerHTML = this.player.type;
        this.template.infoUrl.innerHTML = this.player.options.video.url;
        this.template.infoResolution.innerHTML = `${this.player.video.videoWidth} x ${this.player.video.videoHeight}`;
        this.template.infoDuration.innerHTML = this.player.video.duration;
        if (this.player.options.danmaku) {
            this.template.infoDanmakuId.innerHTML = this.player.options.danmaku.id;
            this.template.infoDanmakuApi.innerHTML = this.player.options.danmaku.api;
            this.template.infoDanmakuAmount.innerHTML = this.player.danmaku.dan.length;
        }
        // P2P Info
        this.template.infoP2pVersion.innerHTML = this.player.plugins.hls ? `v${this.player.p2pInfo.version}` : '';
        this.template.infoP2pDownloaded.innerHTML = `${(this.player.p2pInfo.downloaded / 1024).toFixed(2)}MB`;
        this.template.infoP2pUploaded.innerHTML = `${(this.player.p2pInfo.uploaded / 1024).toFixed(2)}MB`;
        this.template.infoPeerid.innerHTML = `${this.player.p2pInfo.peerId}`;
        this.template.infoPeers.innerHTML = `${this.player.p2pInfo.peers}`;
    }

    fps(value) {
        this.template.infoFPS.innerHTML = `${value.toFixed(1)}`;
    }
}

export default InfoPanel;
