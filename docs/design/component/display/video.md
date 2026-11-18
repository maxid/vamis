# Video 视频 · `video` 设计

> 状态：**进行中 45%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/video) · Amis：`/zh-CN/components/video`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Video 当前是**原生 video 播放器**（25 行）：src/poster、controls、autoPlay/muted/loop。没有弹幕/直播/自定义控制/事件/封面错误处理；45% 是真实缺口。

## 1. 边界与优先级（先读）

1. **src**：readSrc；空 src 显示“未配置视频 src”。
2. **poster**：filterTpl；空不设置。
3. **原生属性**：controls 固定；autoPlay/muted/loop 透传；浏览器策略可能阻止自动播放（muted 才可靠）。
4. **弹幕/直播**：未接；不要按 Amis 高级播放器验收。
5. **包边界**：无 `<style>`、无 fetch；video token。

### 边界用例

- 空 src/合法 URL/poster/autoPlay/muted/loop
- 自动播放被浏览器阻止/加载失败
- 弹幕/直播/自定义控制（未接）
- 窄屏/深色

### 优先级

1. src/poster/播放；2. 自动播放策略/错误；3. 弹幕/直播；4. 样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 863 行；Vamis 25 行）；依赖原生 video。
- 风险：被误认为完整播放器。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src/poster | 视频/封面 | 已接 |
| controls/autoPlay/muted/loop | 播放 | 已接 |
| 弹幕/直播/自定义控制 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`display/Video.vue`](../../../../packages/vamis/src/renderers/display/Video.vue)：readSrc/poster/video。
- [`prop.ts`](../../../../packages/vamis/src/renderers/display/prop.ts)：readSrc。

## 5. 样式

- 视频 w-full 黑底；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

弹幕/直播/自定义控制/事件/加载错误/深色。

## 7. 验收

- src/poster/播放/空/窄屏；未接不误标。

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

弹幕/直播单独立项；先补加载错误/自动播放策略提示。

---

返回 [组件设计索引](../README.md)
