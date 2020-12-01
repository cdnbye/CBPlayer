<p align="center">
<img src="https://cdnbye.oss-cn-beijing.aliyuncs.com/pic/cdnbye.png" alt="CBPlayer" width="100">
</p>
<h1 align="center">CBPlayer2</h1>

> 🍭 Wow, such a lovely HTML5 danmaku video player

[![npm](https://img.shields.io/npm/v/cbplayer2.svg?style=flat-square)](https://www.npmjs.com/package/cbplayer2)
[![npm](https://img.shields.io/npm/l/cbplayer2.svg?style=flat-square)](https://github.com/MoePlayer/DPlayer/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dt/cbplayer2.svg?style=flat-square)](https://www.npmjs.com/package/cbplayer2)
[![npm](https://data.jsdelivr.com/v1/package/npm/cbplayer2/badge)](https://www.jsdelivr.com/package/npm/cbplayer2)

## Introduction

CBPlayer 是基于 DPlayer 开发的，内置 CDNBye P2P 插件的 H5 播放器，加入了记忆播放等实用功能，右键可以查看p2p实时数据。支持HLS、MP4和MPEG-DASH三种格式的P2P加速。

<br>
CBPlayer的API与DPlayer保持一致，可以参考DPLayer的官方文档：

**[Docs](http://dplayer.js.org)**

**[中文文档](http://dplayer.js.org/#/zh-Hans/)**

## 集成方法(Usage)

```html
<meta charset="UTF-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/p2p-dplayer@latest/dist/DPlayer.min.css">
<style type="text/css">
    body,html{width:100%;height:100%;background:#000;padding:0;margin:0;overflow-x:hidden;overflow-y:hidden}
    *{margin:0;border:0;padding:0;text-decoration:none}
    #dplayer{position:inherit}
</style>
<div id="dplayer"></div>
<script src="https://cdn.jsdelivr.net/npm/cdnbye@latest/dist/hlsjs-p2p-engine.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/hls.js@0.14.13"></script>
<script src="https://cdn.jsdelivr.net/npm/cbplayer2@latest"></script>
<script>
    var dp = new CBPlayer({
        container: document.getElementById('dplayer'),
        autoplay: true,
        // live: true,
        playState: true,   // 记忆播放
        video: {
            url: 'https://example.m3u8',
        },
        pluginOptions: {
            hls: {
                debug: false,
                p2pConfig: {
                    logLevel: false,
                    // live: true,
                    // Other p2pConfig options provided by CDNBye
                }
            }
        },
    });
</script>
```

## 后台管理系统
在接入P2P插件后，访问`https://www.cdnbye.com/oms`，注册并绑定域名，即可查看该域名的P2P流量、在线人数、用户地理分布等信息。

## Console
Register your domain in `https://oms.cdnbye.com`, where you can view p2p-related information.
