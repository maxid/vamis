# Audio 音频 · `audio` 设计

> 状态：**进行中 50%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/audio) · Amis：`/zh-CN/components/audio`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Audio 是**自定义音频播放器**（172 行）：src、inline、loop/autoPlay、controls(play/time/process/volume/rates)、自定义进度/音量/倍速/静音；没有皮肤像素/直播流/字幕/事件动作。

## 1. 边界与优先级（先读）

1. **src**：audioSrc 插值；无 src 不播放/不显示进度。
2. **controls**：play/time/process/volume/rates 分别显隐；无 control 时只留 audio。
3. **播放状态**：playing/muted/volume/rate/played/duration；timer 按 rate 刷新，卸载清理。
4. **inline**：true 内联，否则独立布局；不要用 CSS 强改。
5. **安全**：src 由宿主决定；不 fetch 音频内容。
6. **包边界**：无 `<style>`、无 fetch；audio token。

### 边界用例

- 空 src/非法 URL/autoPlay/loop/muted
- controls 组合/rates/音量/进度/静音
- 播放结束/loop/倍速/seek
- 卸载 timer/窄屏/深色/直播流（未接）

### 优先级

1. src/播放状态；2. controls/seek/volume/rate；3. 卸载/事件；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 510 行；Vamis 172 行）；依赖 audio 工具。
- 风险：自定义播放器状态/timer。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src | 音频源 | 已接 |
| inline/loop/autoPlay | 布局/播放 | 已接 |
| controls | play/time/process/volume/rates | 已接 |
| 直播/皮肤/事件 | 目标 | 未接 |

## 4. 架构

- [`display/Audio.vue`](../../../packages/vamis/src/renderers/display/Audio.vue)：audio/controls/timer。
- [`audio.ts`](../../../packages/vamis-core/src/utils/audio.ts)：src/controls/format/rate。

## 5. 样式

- 播放器/进度/音量/倍速 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

直播流/皮肤像素/事件动作/深色。

## 7. 验收

- src/controls/播放/seek/倍速/卸载/窄屏；未接不误标。

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

事件/皮肤单独立项；保持 timer 清理。

---

返回 [组件设计索引](README.md)
