<p align="center">
<img src="https://cdnbye.oss-cn-beijing.aliyuncs.com/pic/cdnbye.png" alt="CBPlayer" width="100">
</p>
<h1 align="center">CBPlayer</h1>

> 🍭 Wow, such a lovely HTML5 danmaku video player

[![npm](https://img.shields.io/npm/v/cbplayer.svg?style=flat-square)](https://www.npmjs.com/package/dplayer)
[![npm](https://img.shields.io/npm/l/cbplayer.svg?style=flat-square)](https://github.com/MoePlayer/DPlayer/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dt/cbplayer.svg?style=flat-square)](https://www.npmjs.com/package/dplayer)

## Introduction

CBPlayer 是基于 DPlayer 开发的，内置 CDNBye P2P 插件的 H5 播放器，加入了记忆播放等实用功能。

<br>
CBPlayer的API与DPlayer保持一致，可以参考DPLayer的官方文档：

**[Docs](http://dplayer.js.org)**

**[中文文档](http://dplayer.js.org/#/zh-Hans/)**

## 集成方法

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cbplayer@latest/dist/CBPlayer.min.css" />
<div id="cbplayer"></div>
<script src="https://cdn.jsdelivr.net/npm/cbplayer@latest"></script>
<script>
    new CBPlayer({
        container: document.getElementById('cbplayer'),
        autoplay: true,
        video: {
            url: 'http://cn1.kankia.com/hls/20191220/596ff11e1db2c3969da01367fc41d3b0/1576776716/index.m3u8',
        },
    });
</script>
```
