# QRCode 二维码 · `qrcode` 设计

> 状态：**进行中 45%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/qrcode) · Amis：`/zh-CN/components/qrcode`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

QRCode 当前是**自研二维码 SVG**（58 行）：value/qrcode、codeSize、前景/背景、level L/M/Q/H、imageSettings logo。没有下载/容错提示/长内容优化/事件；45% 是“可生成”而非完整。

## 1. 边界与优先级（先读）

1. **内容**：readText value/qrcode；空显示 placeholder；过长无法编码显示错误。
2. **纠错级别**：L/M/Q/H；未知回落 L；级别影响容量。
3. **样式**：foreground/background/codeSize；logo imageSettings 支持模板/x/y/w/h。
4. **安全**：logo src 是作者内容；二维码内容可能含敏感信息，不要日志输出。
5. **包边界**：无 `<style>`、无 fetch；qr token。

### 边界用例

- 空/短/长/超长/中文/URL
- level 四档/未知/颜色/尺寸
- logo 无/有/模板/坐标
- 深色/窄屏

### 优先级

1. 内容/编码；2. 纠错/样式；3. logo/容量；4. 下载/事件。

## 2. 复杂度

- 等级：**M 中**（Amis 318 行；Vamis 58 行）；依赖自研 qr。
- 风险：编码容量/纠错。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/qrcode | 内容 | 已接 |
| codeSize/foreground/background | 样式 | 已接 |
| level | 纠错 | 已接 |
| imageSettings | logo | 已接 |
| 下载/事件 | 目标 | 未接 |

## 4. 架构

- [`display/QRCode.vue`](../../../packages/vamis/src/renderers/display/QRCode.vue)：value/size/level/logo/svg。
- [`display/qr.ts`](../../../packages/vamis/src/renderers/display/qr.ts)：encodeQr/qrPath。
- [`prop.ts`](../../../packages/vamis/src/renderers/display/prop.ts)：readText。

## 5. 样式

- SVG 前景/背景/尺寸；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

下载/容量优化/事件/深色。

## 7. 验收

- 内容/级别/颜色/尺寸/logo/超长/窄屏；未接不误标。

## 8. 后续

补下载（可选）；容量/纠错按库能力；事件动作后置。

---

返回 [组件设计索引](README.md)
