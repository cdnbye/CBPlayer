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
        const p2pInfo = this.player.p2pInfo;
        // console.warn(`${p2pInfo.p2pDownloaded} ${p2pInfo.httpDownloaded}`)
        this.template.infoP2pVersion.innerHTML = `v${p2pInfo.version}`;
        this.template.infoP2pDownloaded.innerHTML = `${(p2pInfo.p2pDownloaded / 1024).toFixed(2)}MB`;
        this.template.infoP2pRatio.innerHTML = `${Math.round(p2pInfo.p2pDownloaded/(p2pInfo.p2pDownloaded + p2pInfo.httpDownloaded)*100).toFixed(0)}%`;
        this.template.infoP2pUploaded.innerHTML = `${(p2pInfo.uploaded / 1024).toFixed(2)}MB`;
        this.template.infoPeerid.innerHTML = `${p2pInfo.peerId}`;
        this.template.infoPeers.innerHTML = `${p2pInfo.peers}`;
        this.template.infoDecoder.innerHTML = `${p2pInfo.decoder}`;
    }

    fps(value) {
        this.template.infoFPS.innerHTML = `${value.toFixed(1)}`;
    }
}

export default InfoPanel;
