# IFrame 内嵌页 · `iframe` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/iframe) · Amis：`/zh-CN/components/iframe`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

IFrame 当前是**受白名单 URL 校验的内嵌页**（40 行）：src/宽高/title/name/allow/sandbox/referrerpolicy；非法 src 显示拒绝提示。没有 postMessage/加载态/高度自适应；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **src 安全**：仅 dataURL 或相对/绝对 http(s)/blob；其他拒绝并提示；空 src 不渲染。
2. **尺寸**：width 100%/height 360 默认，cssSize；minHeight 160。
3. **属性**：sandbox/allow/referrerpolicy 透传；不要默认放宽 sandbox。
4. **加载/通信**：无 loading/postMessage/自适应高度；不要按这些验收。
5. **包边界**：无 `<style>`、无 fetch；iframe token。

### 边界用例

- 空/合法 http/相对/dataURL/非法协议
- sandbox/allow/referrerpolicy/尺寸
- 加载失败/跨域/postMessage（未接）
- 窄屏/深色

### 优先级

1. src 安全/尺寸；2. sandbox/属性；3. 加载/通信；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 329 行；Vamis 40 行）；依赖 prop 工具。
- 风险：URL 安全/跨域通信。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src | 地址 | 已接（白名单） |
| width/height | 尺寸 | 已接 |
| allow/sandbox/referrerpolicy | 安全 | 透传 |
| loading/postMessage | 目标 | 未接 |

## 4. 架构

- [`display/Iframe.vue`](../../../packages/vamis/src/renderers/display/Iframe.vue)：src/safe/size/iframe。
- [`prop.ts`](../../../packages/vamis/src/renderers/display/prop.ts)：readSrc/cssSize。

## 5. 样式

- iframe 边框/圆角/空态；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

loading/postMessage/高度自适应/深色。

## 7. 验收

- src 安全/尺寸/sandbox/非法/空；未接不误标。

## 8. 后续

通信/自适应单独立项；先保持安全白名单。

---

返回 [组件设计索引](README.md)
