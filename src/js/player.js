import Promise from 'promise-polyfill';

import utils from './utils';
import handleOption from './options';
import i18n from './i18n';
import Template from './template';
import Icons from './icons';
import Danmaku from './danmaku';
import Events from './events';
import FullScreen from './fullscreen';
import User from './user';
import Subtitle from './subtitle';
import Bar from './bar';
import Timer from './timer';
import Bezel from './bezel';
import Controller from './controller';
import Setting from './setting';
import Comment from './comment';
import HotKey from './hotkey';
import ContextMenu from './contextmenu';
import InfoPanel from './info-panel';
import tplVideo from '../template/video.art';
import PlayState from './play-state';

let index = 0;
const instances = [];

class DPlayer {
    /**
     * DPlayer constructor function
     *
     * @param {Object} options - See README
     * @constructor
     */
    constructor(options) {
        this.options = handleOption({ preload: options.video.type === 'webtorrent' ? 'none' : 'metadata', ...options });

        if (this.options.video.quality) {
            this.qualityIndex = this.options.video.defaultQuality;
            this.quality = this.options.video.quality[this.options.video.defaultQuality];
        }
        this.tran = new i18n(this.options.lang).tran;
        this.events = new Events();
        this.user = new User(this);
        this.container = this.options.container;

        this.container.classList.add('dplayer');
        if (!this.options.danmaku) {
            this.container.classList.add('dplayer-no-danmaku');
        }
        if (this.options.live) {
            this.container.classList.add('dplayer-live');
        }
        if (utils.isMobile) {
            this.container.classList.add('dplayer-mobile');
        }
        this.arrow = this.container.offsetWidth <= 500;
        if (this.arrow) {
            this.container.classList.add('dplayer-arrow');
        }

        this.template = new Template({
            container: this.container,
            options: this.options,
            index: index,
            tran: this.tran,
        });

        this.video = this.template.video;

        this.bar = new Bar(this.template);

        this.bezel = new Bezel(this.template.bezel);

        this.fullScreen = new FullScreen(this);

        this.controller = new Controller(this);

        if (this.options.danmaku) {
            this.danmaku = new Danmaku({
                container: this.template.danmaku,
                opacity: this.user.get('opacity'),
                callback: () => {
                    setTimeout(() => {
                        this.template.danmakuLoading.style.display = 'none';

                        // autoplay
                        if (this.options.autoplay) {
                            this.play();
                        }
                    }, 0);
                },
                error: (msg) => {
                    this.notice(msg);
                },
                apiBackend: this.options.apiBackend,
                borderColor: this.options.theme,
                height: this.arrow ? 24 : 30,
                time: () => this.video.currentTime,
                unlimited: this.user.get('unlimited'),
                api: {
                    id: this.options.danmaku.id,
                    address: this.options.danmaku.api,
                    token: this.options.danmaku.token,
                    maximum: this.options.danmaku.maximum,
                    addition: this.options.danmaku.addition,
                    user: this.options.danmaku.user,
                },
                events: this.events,
                tran: (msg) => this.tran(msg),
            });

            this.comment = new Comment(this);
        }

        this.setting = new Setting(this);
        this.plugins = {};

        document.addEventListener(
            'click',
            () => {
                this.focus = false;
            },
            true
        );
        this.container.addEventListener(
            'click',
            () => {
                this.focus = true;
            },
            true
        );

        this.paused = true;

        this.timer = new Timer(this);

        this.hotkey = new HotKey(this);

        this.contextmenu = new ContextMenu(this);

        // P2P
        this.p2pInfo = {
            version: '',
            httpDownloaded: 0, // 单位KB
            p2pDownloaded: 0, // 单位KB
            uploaded: 0, // 单位KB
            peerId: '',
            peers: 0,
            decoder: '',    // 解码内核
        };

        this.initVideo(this.video, (this.quality && this.quality.type) || this.options.video.type);

        this.infoPanel = new InfoPanel(this);

        if (!this.danmaku && this.options.autoplay) {
            this.play();
        }

        // 记忆播放 使用前先判空
        if (!this.options.live && this.options.playState) {
            this.playState = new PlayState(this.video, this.options.video.url);
            // console.warn(`this.playState.getLastState() ${this.playState.getLastState()}`)
            const lastTime = this.playState.getLastState();
            if (lastTime) {
                this.seek(lastTime - 1);
            }

            this.playState.startRecord();
        }

        index++;
        instances.push(this);
    }

    /**
     * Seek video
     */
    seek(time) {
        time = Math.max(time, 0);
        if (this.video.duration) {
            time = Math.min(time, this.video.duration);
        }
        if (this.video.currentTime < time) {
            this.notice(`${this.tran('FF')} ${(time - this.video.currentTime).toFixed(0)} ${this.tran('s')}`);
        } else if (this.video.currentTime > time) {
            this.notice(`${this.tran('REW')} ${(this.video.currentTime - time).toFixed(0)} ${this.tran('s')}`);
        }

        this.video.currentTime = time;

        if (this.danmaku) {
            this.danmaku.seek();
        }

        this.bar.set('played', time / this.video.duration, 'width');
        this.template.ptime.innerHTML = utils.secondToTime(time);
    }

    /**
     * Play video
     */
    play() {
        this.paused = false;
        if (this.video.paused) {
            this.bezel.switch(Icons.play);
        }

        this.template.playButton.innerHTML = Icons.pause;

        const playedPromise = Promise.resolve(this.video.play());
        playedPromise
            .catch(() => {
                this.pause();
            })
            .then(() => {});
        this.timer.enable('loading');
        this.container.classList.remove('dplayer-paused');
        this.container.classList.add('dplayer-playing');
        if (this.danmaku) {
            this.danmaku.play();
        }
        if (this.options.mutex) {
            for (let i = 0; i < instances.length; i++) {
                if (this !== instances[i]) {
                    instances[i].pause();
                }
            }
        }
    }

    /**
     * Pause video
     */
    pause() {
        this.paused = true;
        this.container.classList.remove('dplayer-loading');

        if (!this.video.paused) {
            this.bezel.switch(Icons.pause);
        }

        this.template.playButton.innerHTML = Icons.play;
        this.video.pause();
        this.timer.disable('loading');
        this.container.classList.remove('dplayer-playing');
        this.container.classList.add('dplayer-paused');
        if (this.danmaku) {
            this.danmaku.pause();
        }
    }

    switchVolumeIcon() {
        if (this.volume() >= 0.95) {
            this.template.volumeIcon.innerHTML = Icons.volumeUp;
        } else if (this.volume() > 0) {
            this.template.volumeIcon.innerHTML = Icons.volumeDown;
        } else {
            this.template.volumeIcon.innerHTML = Icons.volumeOff;
        }
    }

    /**
     * Set volume
     */
    volume(percentage, nostorage, nonotice) {
        percentage = parseFloat(percentage);
        if (!isNaN(percentage)) {
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.bar.set('volume', percentage, 'width');
            const formatPercentage = `${(percentage * 100).toFixed(0)}%`;
            this.template.volumeBarWrapWrap.dataset.balloon = formatPercentage;
            if (!nostorage) {
                this.user.set('volume', percentage);
            }
            if (!nonotice) {
                this.notice(`${this.tran('Volume')} ${(percentage * 100).toFixed(0)}%`);
            }

            this.video.volume = percentage;
            if (this.video.muted) {
                this.video.muted = false;
            }
            this.switchVolumeIcon();
        }

        return this.video.volume;
    }

    /**
     * Toggle between play and pause
     */
    toggle() {
        if (this.video.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    /**
     * attach event
     */
    on(name, callback) {
        this.events.on(name, callback);
    }

    /**
     * Switch to a new video
     *
     * @param {Object} video - new video info
     * @param {Object} danmaku - new danmaku info
     */
    switchVideo(video, danmakuAPI) {
        this.pause();

        // 销毁之前的p2p
        if (this.plugins.p2pEngine) {
            // console.warn('destroy this.plugins.p2pEngine')
            this.plugins.p2pEngine.destroy();
            this.plugins.p2pEngine = null;
            if (this.plugins.dash) {
                // console.warn('this.plugins.dash.attachSource(null)')
                this.plugins.dash.attachSource(null)
            } else if (this.plugins.hls) {
                this.plugins.hls.destroy();
            } else if (this.plugins.shaka) {

            }
        }

        this.video.poster = video.pic ? video.pic : '';
        this.video.src = video.url;

        // console.warn('this.video.src ' + video.url);
        //
        // console.warn('initMSE');

        this.initMSE(this.video, video.type || 'auto');
        if (danmakuAPI) {
            this.template.danmakuLoading.style.display = 'block';
            this.bar.set('played', 0, 'width');
            this.bar.set('loaded', 0, 'width');
            this.template.ptime.innerHTML = '00:00';
            this.template.danmaku.innerHTML = '';
            if (this.danmaku) {
                this.danmaku.reload({
                    id: danmakuAPI.id,
                    address: danmakuAPI.api,
                    token: danmakuAPI.token,
                    maximum: danmakuAPI.maximum,
                    addition: danmakuAPI.addition,
                    user: danmakuAPI.user,
                });
            }
        }
    }

    initMSE(video, type) {
        this.type = type;
        // console.warn(video.src)
        if (this.options.video.customType && this.options.video.customType[type]) {
            if (Object.prototype.toString.call(this.options.video.customType[type]) === '[object Function]') {
                this.options.video.customType[type](this.video, this);
            } else {
                console.error(`Illegal customType: ${type}`);
            }
        } else {
            if (this.type === 'auto') {
                if (/m3u8(#|\?|$)/i.exec(video.src)) {
                    this.type = 'hls';
                } else if (/.flv(#|\?|$)/i.exec(video.src)) {
                    this.type = 'flv';
                } else if (/.mpd(#|\?|$)/i.exec(video.src)) {
                    this.type = 'dash';
                } else if (/.mp4(#|\?|$)/i.exec(video.src)) {
                    this.type = 'mp4';
                } else {
                    this.type = 'normal';
                }
            }

            if (!utils.isP2pSupported) {
                this.type = 'normal';
            }

            switch (this.type) {
                // https://github.com/video-dev/hls.js
                case 'hls':
                    if (window.Hls) {
                        this.p2pInfo.decoder = 'Hls.js';
                        this.initHlsjs(video);
                    }
                    else if (window.shaka) {
                        this.p2pInfo.decoder = 'Shaka-Player';
                        this.initShaka(video);
                    }
                    else {
                        this.notice("Error: Can't find hls.js.");
                    }
                    break;

                // https://github.com/Bilibili/flv.js
                case 'flv':
                    if (window.flvjs) {
                        if (window.flvjs.isSupported()) {
                            this.p2pInfo.decoder = 'Flv.js';
                            const options = Object.assign(this.options.pluginOptions.flvjs, {
                                type: 'flv',
                                url: video.src,
                            });
                            const flvPlayer = window.flvjs.createPlayer(options);
                            this.plugins.flvjs = flvPlayer;
                            flvPlayer.attachMediaElement(video);
                            flvPlayer.load();
                            this.events.once('destroy', () => {
                                flvPlayer.unload();
                                flvPlayer.detachMediaElement();
                                flvPlayer.destroy();
                                delete this.plugins.flvjs;
                            });
                        } else {
                            this.notice('Error: flvjs is not supported.');
                        }
                    } else {
                        this.notice("Error: Can't find flvjs.");
                    }
                    break;

                // https://github.com/Dash-Industry-Forum/dash.js
                case 'dash':
                    // console.warn('case dash')
                    if (window.dashjs) {
                        // console.warn('this.initDashjs(video)')
                        this.p2pInfo.decoder = 'Dash.js';
                        this.initDashjs(video);
                    }
                    else if (window.shaka) {
                        this.p2pInfo.decoder = 'Shaka-Player';
                        this.initShaka(video);
                    }
                    else {
                        this.notice("Error: Can't find dashjs or shaka-player.");
                    }
                    break;

                case 'mp4':
                    // console.warn('case mp4')
                    if (window.P2PEngineMp4) {
                        this.p2pInfo.decoder = 'VideoStream';
                        this.initMp4(video);
                    } else {
                        this.notice("Error: Can't find P2PEngineMp4.");
                    }
                    break;

                // https://github.com/webtorrent/webtorrent
                case 'webtorrent':
                    if (window.WebTorrent) {
                        if (window.WebTorrent.WEBRTC_SUPPORT) {
                            this.container.classList.add('dplayer-loading');
                            const options = this.options.pluginOptions.webtorrent;
                            const client = new window.WebTorrent(options);
                            this.plugins.webtorrent = client;
                            const torrentId = video.src;
                            video.src = '';
                            video.preload = 'metadata';
                            video.addEventListener('durationchange', () => this.container.classList.remove('dplayer-loading'), { once: true });
                            client.add(torrentId, (torrent) => {
                                const file = torrent.files.find((file) => file.name.endsWith('.mp4'));
                                file.renderTo(this.video, {
                                    autoplay: this.options.autoplay,
                                });
                            });
                            this.events.once('destroy', () => {
                                client.remove(torrentId);
                                client.destroy();
                                delete this.plugins.webtorrent;
                            });
                        } else {
                            this.notice('Error: Webtorrent is not supported.');
                        }
                    } else {
                        this.notice("Error: Can't find Webtorrent.");
                    }
                    break;
            }
        }
    }

    initVideo(video, type) {
        this.initMSE(video, type);

        /**
         * video events
         */
        // show video time: the metadata has loaded or changed
        this.on('durationchange', () => {
            // compatibility: Android browsers will output 1 or Infinity at first
            if (video.duration !== 1 && video.duration !== Infinity) {
                this.template.dtime.innerHTML = utils.secondToTime(video.duration);
            }
        });

        // show video loaded bar: to inform interested parties of progress downloading the media
        this.on('progress', () => {
            const percentage = video.buffered.length ? video.buffered.end(video.buffered.length - 1) / video.duration : 0;
            this.bar.set('loaded', percentage, 'width');
        });

        // video download error: an error occurs
        this.on('error', () => {
            if (!this.video.error) {
                // Not a video load error, may be poster load failed, see #307
                return;
            }
            this.tran && this.notice && this.type !== 'webtorrent' && this.notice(this.tran('Video load failed'), -1);
        });

        // video end
        this.on('ended', () => {
            this.bar.set('played', 1, 'width');
            if (!this.setting.loop) {
                this.pause();
            } else {
                this.seek(0);
                this.play();
            }
            if (this.danmaku) {
                this.danmaku.danIndex = 0;
            }
        });

        this.on('play', () => {
            if (this.paused) {
                this.play();
            }
        });

        this.on('pause', () => {
            if (!this.paused) {
                this.pause();
            }
        });

        this.on('timeupdate', () => {
            this.bar.set('played', this.video.currentTime / this.video.duration, 'width');
            const currentTime = utils.secondToTime(this.video.currentTime);
            if (this.template.ptime.innerHTML !== currentTime) {
                this.template.ptime.innerHTML = currentTime;
            }
        });

        for (let i = 0; i < this.events.videoEvents.length; i++) {
            video.addEventListener(this.events.videoEvents[i], () => {
                this.events.trigger(this.events.videoEvents[i]);
            });
        }

        this.volume(this.user.get('volume'), true, true);

        if (this.options.subtitle) {
            this.subtitle = new Subtitle(this.template.subtitle, this.video, this.options.subtitle, this.events);
            if (!this.user.get('subtitle')) {
                this.subtitle.hide();
            }
        }
    }

    switchQuality(index) {
        index = typeof index === 'string' ? parseInt(index) : index;
        if (this.qualityIndex === index || this.switchingQuality) {
            return;
        } else {
            this.qualityIndex = index;
        }
        this.switchingQuality = true;
        this.quality = this.options.video.quality[index];
        this.template.qualityButton.innerHTML = this.quality.name;

        const paused = this.video.paused;
        this.video.pause();
        const videoHTML = tplVideo({
            current: false,
            pic: null,
            screenshot: this.options.screenshot,
            preload: 'auto',
            url: this.quality.url,
            subtitle: this.options.subtitle,
        });
        const videoEle = new DOMParser().parseFromString(videoHTML, 'text/html').body.firstChild;
        this.template.videoWrap.insertBefore(videoEle, this.template.videoWrap.getElementsByTagName('div')[0]);
        this.prevVideo = this.video;
        this.video = videoEle;
        this.initVideo(this.video, this.quality.type || this.options.video.type);
        this.seek(this.prevVideo.currentTime);
        this.notice(`${this.tran('Switching to')} ${this.quality.name} ${this.tran('quality')}`, -1);
        this.events.trigger('quality_start', this.quality);

        this.on('canplay', () => {
            if (this.prevVideo) {
                if (this.video.currentTime !== this.prevVideo.currentTime) {
                    this.seek(this.prevVideo.currentTime);
                    return;
                }
                this.template.videoWrap.removeChild(this.prevVideo);
                this.video.classList.add('dplayer-video-current');
                if (!paused) {
                    this.video.play();
                }
                this.prevVideo = null;
                this.notice(`${this.tran('Switched to')} ${this.quality.name} ${this.tran('quality')}`);
                this.switchingQuality = false;

                this.events.trigger('quality_end');
            }
        });
    }

    notice(text, time = 2000, opacity = 0.8) {
        this.template.notice.innerHTML = text;
        this.template.notice.style.opacity = opacity;
        if (this.noticeTime) {
            clearTimeout(this.noticeTime);
        }
        this.events.trigger('notice_show', text);
        if (time > 0) {
            this.noticeTime = setTimeout(() => {
                this.template.notice.style.opacity = 0;
                this.events.trigger('notice_hide');
            }, time);
        }
    }

    resize() {
        if (this.danmaku) {
            this.danmaku.resize();
        }
        if (this.controller.thumbnails) {
            this.controller.thumbnails.resize(160, (this.video.videoHeight / this.video.videoWidth) * 160, this.template.barWrap.offsetWidth);
        }
        this.events.trigger('resize');
    }

    speed(rate) {
        this.video.playbackRate = rate;
    }

    destroy() {
        instances.splice(instances.indexOf(this), 1);
        this.pause();
        this.controller.destroy();
        this.timer.destroy();
        if (this.playState) {
            this.playState.destroy();
        }
        this.video.src = '';
        this.container.innerHTML = '';
        if (this.options.live) {
            this.container.classList.remove('dplayer-live');    // TODO 验证
        }
        this.events.trigger('destroy');
    }

    static get version() {
        /* global DPLAYER_VERSION */
        return DPLAYER_VERSION;
    }

    initHlsjs(video) {
        if (window.Hls.isSupported()) {
            let options = this.options.pluginOptions.hls || {};
            const p2pConfig = options.p2pConfig || {};
            // p2pConfig.logLevel = 'debug'
            if (this.options && this.options.live === true) {
                p2pConfig.live = true;
            }

            if (!p2pConfig.useHttpRange) {
                p2pConfig.useHttpRange = false;
            }
            delete options.p2pConfig;
            // options.debug = true;
            // options.enableWorker = false;
            const liveConfig = {
                maxBufferSize: 0,
                maxBufferLength: 10,
                liveSyncDurationCount: 15,
            };
            if (p2pConfig.live) {
                options = Object.assign(liveConfig, options);
            }
            // console.warn('new window.Hls')
            // console.warn(options);
            const hls = new window.Hls(options);

            if (window.P2PEngine && window.P2PEngine.isSupported()) {
                // console.warn('new window.P2PEngine');

                this.plugins.p2pEngine = hls.p2pEngine = new window.P2PEngine(hls, p2pConfig);
                this.p2pInfo.version = hls.p2pEngine.version;
            }

            this.plugins.hls = hls;
            hls.loadSource(video.src);
            hls.attachMedia(video);
            this.setupP2PListeners(hls.p2pEngine);
            this.events.once('destroy', () => {
                // console.warn('player destroy');
                hls.p2pEngine.destroy();
                delete this.plugins.p2pEngine;
                hls.destroy();
                delete this.plugins.hls;
            });
        } else {
            this.notice('Error: hls.js is not supported.');
        }
    }

    initShaka(video) {
        shaka.polyfill.installAll();
        const options = this.options.pluginOptions.shaka || {};
        const p2pConfig = options.p2pConfig;
        delete options.p2pConfig;
        const src = video.src;
        let shakaPlayer = this.plugins.shaka;
        if (!shakaPlayer) {
            shakaPlayer = new shaka.Player(video);
            // console.warn(options)
            shakaPlayer.configure(options);
        }
        shakaPlayer.load(src);
        this.plugins.shaka = shakaPlayer;
        if (window.P2PEngineShaka && window.P2PEngineShaka.isSupported()) {
            const engine = new window.P2PEngineShaka(shakaPlayer, p2pConfig);
            this.plugins.p2pEngine = engine;
            this.p2pInfo.version = engine.version;
            this.setupP2PListeners(engine);
        }
        this.events.once('destroy', () => {
            this.plugins.p2pEngine.destroy();
            delete this.plugins.p2pEngine;
            delete this.plugins.shaka;
        });
    }

    initDashjs(video) {
        // console.warn('initDashjs')
        const options = this.options.pluginOptions.dash || {};
        const p2pConfig = options.p2pConfig;
        delete options.p2pConfig;
        let mediaPlayer = this.plugins.dash;
        if (!mediaPlayer) {
            // console.warn('create MediaPlayer')
            mediaPlayer = window.dashjs.MediaPlayer().create();
            mediaPlayer.initialize(video, video.src, this.options.autoplay);
            mediaPlayer.updateSettings(options);
        } else {
            // console.warn('mediaPlayer.attachSource')
            mediaPlayer.attachSource(video.src)
        }
        if (window.P2PEngineDash && window.P2PEngineDash.isSupported()) {
            const engine = new window.P2PEngineDash(mediaPlayer, p2pConfig);
            this.plugins.p2pEngine = mediaPlayer.p2pEngine = engine;
            this.p2pInfo.version = engine.version;
        }

        this.plugins.dash = mediaPlayer;
        this.events.once('destroy', () => {
            this.plugins.p2pEngine.destroy();
            delete this.plugins.p2pEngine;
            // window.dashjs.MediaPlayer().reset();
            this.plugins.dash.reset();
            delete this.plugins.dash;
        });
        this.setupP2PListeners(mediaPlayer.p2pEngine);
    }

    initMp4(video) {
        // console.warn('initMp4');
        const options = this.options.pluginOptions.mp4 || {};
        var engine = new P2PEngineMp4(video, options);
        // console.warn('after new P2PEngineMp4');
        this.plugins.p2pEngine = engine;
        this.events.once('destroy', () => {
            this.plugins.p2pEngine.destroy();
            delete this.plugins.p2pEngine;
        });
        // console.warn('engine.loadSource ' + video.src);
        engine.loadSource(video.src);
        this.p2pInfo.version = P2PEngineMp4.version;
        this.setupP2PListeners(engine);
    }

    // P2P
    setupP2PListeners(engine) {
        if (engine) {
            engine
                .on('stats', (stats) => {
                    this.p2pInfo.p2pDownloaded = stats.totalP2PDownloaded;
                    this.p2pInfo.httpDownloaded = stats.totalHTTPDownloaded;
                    this.p2pInfo.uploaded = stats.totalP2PUploaded;
                    this.events.trigger('stats', stats);
                })
                .on('peerId', (peerId) => {
                    this.p2pInfo.peerId = peerId;
                    this.events.trigger('peerId', peerId);
                })
                .on('peers', (peers) => {
                    this.p2pInfo.peers = peers.length;
                    this.events.trigger('peers', peers);
                });
        }
    }
}

// function requestScript(url, callback) {
//     // Adding the script tag to the head
//     const head = document.getElementsByTagName('head')[0];
//     const script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = url;
//
//     // Then bind the event to the callback function.
//     // There are several events for cross browser compatibility.
//     script.onreadystatechange = callback;
//     script.onload = callback;
//
//     // Fire the loading
//     head.appendChild(script);
// }

export default DPlayer;
