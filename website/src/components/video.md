---
title: Video 视频
outline: deep
---

# Video 视频

::: warning 实现进度 45% · 进行中
能播；弹幕/直播未齐
:::

`video` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

## 基本用法

```schema: scope="body"
{
  "type": "video",
  "src": "raw:https://amis.bj.bcebos.com/amis/2019-12/1577157317579/trailer_hd.mp4",
  "poster": "raw:https://internal-amis-res.cdn.bcebos.com/images/2019-12/1577157239810/da6376bf988c.png"
}
```

## flv 和 hls 直播

需要设置 `isLive: true`，目前 flv 和 hls 是通过文件后缀来判断的，还可以通过设置 videoType 来指定，它有两个值：

- `video/x-flv`，使用 [mpegts.js](https://github.com/xqq/mpegts.js) 播放 flv
- `application/x-mpegURL`，使用 [hls.js](https://github.com/video-dev/hls.js/) 播放 hls 格式

## 视频帧切换功能

可以定义一组视频帧，渲染的时候会列出来这些帧，点击的时候会自动跳转到对应位置开始播放。

```schema: scope="body"
{
  "type": "video",
  "src": "https://amis.bj.bcebos.com/amis/2019-12/1577157317579/trailer_hd.mp4",
  "poster": "https://internal-amis-res.cdn.bcebos.com/images/2019-12/1577157239810/da6376bf988c.png",
  "jumpFrame": true,
  "jumpBufferDuration": 0,
  "frames": {
    "00:10": "",
    "00:20": "",
    "00:30": ""
  }
}
```

可以设置帧图片如果有的话，这个示例偷懒直接用封面了。

```schema: scope="body"
{
  "type": "video",
  "src": "https://amis.bj.bcebos.com/amis/2019-12/1577157317579/trailer_hd.mp4",
  "poster": "https://internal-amis-res.cdn.bcebos.com/images/2019-12/1577157239810/da6376bf988c.png",
  "jumpFrame": true,
  "jumpBufferDuration": 0,
  "stopOnNextFrame": true,
  "frames": {
    "00:10": "https://internal-amis-res.cdn.bcebos.com/images/2019-12/1577157239810/da6376bf988c.png",
    "00:20": "https://internal-amis-res.cdn.bcebos.com/images/2019-12/1577157239810/da6376bf988c.png",
    "00:30": "https://internal-amis-res.cdn.bcebos.com/images/2019-12/1577157239810/da6376bf988c.png"
  }
}
```

## 属性表

| 属性名             | 类型      | 默认值    | 说明                                                                      |
| ------------------ | --------- | --------- | ------------------------------------------------------------------------- |
| type               | `string`  | `"video"` | 指定为 video 渲染器                                                       |
| className          | `string`  |           | 外层 Dom 的类名                                                           |
| src                | `string`  |           | 视频地址                                                                  |
| isLive             | `boolean` | false     | 是否为直播，视频为直播时需要添加上，支持`flv`和`hls`格式                  |
| videoType          | `string`  |           | 指定直播视频格式                                                          |
| poster             | `string`  |           | 视频封面地址                                                              |
| muted              | `boolean` |           | 是否静音                                                                  |
| loop               | `boolean` |           | 是否循环播放                                                              |
| autoPlay           | `boolean` |           | 是否自动播放                                                              |
| rates              | `array`   |           | 倍数，格式为`[1.0, 1.5, 2.0]`                                             |
| frames             | `object`  |           | key 是时刻信息，value 可以为空，也可设置为图片地址，请看上方示例          |
| jumpBufferDuration | `boolean` |           | 点击帧的时候默认是跳转到对应的时刻，如果想提前 3 秒钟，可以设置这个值为 3 |
| stopOnNextFrame    | `boolean` |           | 到了下一帧默认是接着播放，配置这个会自动停止                              |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：能播；弹幕/直播未齐。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。
