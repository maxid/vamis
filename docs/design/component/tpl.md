# Tpl 模板 · `tpl` 设计

> 状态：**进行中 92%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/tpl) · Amis：`/zh-CN/components/tpl`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Tpl 是**模板 → HTML** 的基础展示组件：插值默认转义、`|raw` 才插入 HTML；支持 tag/className/style、maxLine、showNativeTitle、click/mouseenter/mouseleave 事件。主路径成熟；P0 过滤器可用，其余 P1。

## 1. 边界与优先级（先读）

1. **信任边界**：插值默认转义；`|raw`/字符串函数只在可信内容；不要把用户输入 raw。
2. **HTML 插入**：模板结果始终 HTML 插入；空 tpl/空值按空串，不崩。
3. **tag**：包装标签；className/style 只作用根。
4. **maxLine**：CSS 行数裁剪；不改变文本内容/事件。
5. **事件**：click/mouseenter/mouseleave；payload 当前数据域；可 preventDefault。
6. **包边界**：无 `<style>`、无 fetch；tpl token。

### 边界用例

- 空/纯文本/转义/raw/HTML 标签
- tag/className/style/maxLine/showNativeTitle
- click/mouse 事件/阻止
- 不可信输入/深色/窄屏

### 优先级

1. 转义/raw；2. HTML/tag；3. maxLine/事件；4. 过滤器。

## 2. 复杂度

- 等级：**M 中**（Amis 284 行；Vamis 74 行）；依赖 badge/tpl 工具。
- 风险：信任边界/maxLine。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| tpl | 模板 | 已接 |
| tag/className/style | 包装 | 已接 |
| maxLine/showNativeTitle | 展示 | 已接 |
| click/mouseenter/leave | 事件 | 已接 |
| 过滤器 | P0/P1 | P0 可用，余 P1 |

## 4. 架构

- [`Tpl.vue`](../../../packages/vamis/src/renderers/Tpl.vue)：rendered/html/tag/maxLine/事件。
- [`formula`/tpl 工具]：filterTpl/raw/过滤器。
- [`BadgeHost`]：badge。

## 5. 样式

- tpl/maxLine token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

P1 过滤器；深色/窄屏；raw 信任策略需保持。

## 7. 验收

- 转义/raw/HTML/tag/maxLine/事件/不可信输入；未接不误标。

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

P1 过滤器按公式层统一补；不要把 raw 默认打开。

---

返回 [组件设计索引](README.md)
