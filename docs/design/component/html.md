# Html 富文本 · `html` 设计

> 状态：**进行中 90%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/html) · Amis：`/zh-CN/components/html`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Html **没有独立渲染器**：注册表把它作为 `tpl` 的别名。行为、maxLine/showNativeTitle/事件与 Tpl 完全一致；差异只是“语义上用于 HTML”，不要复制一套实现。

## 1. 边界与优先级（先读）

1. **别名**：html → Tpl；改行为只改 Tpl/公式。
2. **信任边界**：默认插值转义，`|raw` 才插入变量 HTML；作者静态 HTML 是可信内容。
3. **HTML 插入**：始终 HTML 渲染；不要用 textContent 替代。
4. **maxLine/showNativeTitle/事件**：继承 Tpl。
5. **包边界**：无 `<style>`、无 fetch；tpl token。

### 边界用例

- 空/纯文本/HTML/raw/不可信变量
- maxLine/tag/class/style/事件
- 深色/窄屏
- P1 过滤器（未接）

### 优先级

1. 转义/raw；2. HTML/tag；3. 事件/样式；4. 过滤器。

## 2. 复杂度

- 等级：**L 重**（Amis 284 行；Vamis 复用 Tpl 74 行）；依赖 tpl/badge。
- 风险：信任边界。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| tpl/HTML | 内容 | 继承 Tpl |
| maxLine/tag/class | 展示 | 继承 |
| click/mouse 事件 | 事件 | 继承 |
| P1 过滤器 | 目标 | 未接 |

## 4. 架构

- [`register.ts`](../../../packages/vamis/src/register.ts) alias → [`Tpl.vue`](../../../packages/vamis/src/renderers/Tpl.vue)。
- [`tpl`](tpl.md)：全部行为。

## 5. 样式

- 同 Tpl；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

P1 过滤器/深色；信任策略保持。

## 7. 验收

- 确认走 Tpl；转义/raw/HTML/事件；不要复制实现。

## 8. 后续

随 Tpl 统一补过滤器；不新增 Html.vue。

---

返回 [组件设计索引](README.md)
