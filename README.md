<p align="center">
<img src="https://cdnbye.oss-cn-beijing.aliyuncs.com/pic/cdnbye.png" alt="CBPlayer" width="100">
</p>
<h1 align="center">CBPlayer</h1>

> 🍭 Wow, such a lovely HTML5 danmaku video player

[![npm](https://img.shields.io/npm/v/cbplayer.svg?style=flat-square)](https://www.npmjs.com/package/cbplayer)
[![npm](https://img.shields.io/npm/l/cbplayer.svg?style=flat-square)](https://github.com/MoePlayer/DPlayer/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dt/cbplayer.svg?style=flat-square)](https://www.npmjs.com/package/cbplayer)
[![npm](https://data.jsdelivr.com/v1/package/npm/cbplayer/badge)](https://www.jsdelivr.com/package/npm/cbplayer)

## Introduction

CBPlayer 是基于 DPlayer 开发的，内置 CDNBye P2P 插件的 H5 播放器，加入了记忆播放等实用功能，右键可以查看p2p实时数据。

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
        pluginOptions: {
            hls: {
                p2pConfig: {
                    live: false,
                    // Other p2pConfig options provided by CDNBye
                    // https://docs.cdnbye.com/#/API
                }
            }
        },
    });
</script>
```

## 完整php版调用代码
调用方式：http://example.com?url=
```php
<html>
<head>
    <title>dplayer增加记忆+P2P播放</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=11" />
    <meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" id="viewport" name="viewport">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cbplayer@latest/dist/CBPlayer.min.css" />
    <style type="text/css">
        body,html{width:100%;height:100%;background:#000;padding:0;margin:0;overflow-x:hidden;overflow-y:hidden}
        *{margin:0;border:0;padding:0;text-decoration:none}
        #video{position:inherit}
    </style>
</head>
<body style="background:#000" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" oncontextmenu=window.event.returnValue=false>
<div id="video"></div>
<script src="https://cdn.jsdelivr.net/npm/cbplayer@latest"></script>
<script>
    var url = '<?php echo($_REQUEST['url']);?>';
    var dp = new CBPlayer({
        container: document.getElementById('video'),
        autoplay: true,
        hotkey: true,  // 移动端全屏时向右划动快进，向左划动快退。
        video: {
            url:url,
            // pic: 'loading_wap.gif',
        },
    });
    dp.on('fullscreen', function () {
        if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            screen.orientation.lock('landscape');
        }
    });
</script>
</body>
</html>
```
