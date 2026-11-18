# Images 图片集 · `images` 设计

> 状态：**进行中 50%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/images) · Amis：`/zh-CN/components/images`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Images 当前是**缩略图平铺**（32 行）：source 变量/options/list/value，固定 80×80 object-cover。没有画廊/预览/删除/排序/标题/列数/懒加载；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **数据**：source `$var` 从 data 取；否则 options/list/value；非数组兜底。
2. **项**：string 或 `{src,url,image}`；空 src 仍渲染 img（浏览器裂图），需明确。
3. **布局**：固定 h-20 w-20；没有列数/响应式/标题。
4. **交互**：无预览/画廊/删除/排序；不要按 gallery 验收。
5. **包边界**：无 `<style>`、无 fetch；images token。

### 边界用例

- 空/字符串数组/对象数组/source 变量/非数组
- 空 src/重复/裂图
- 列数/预览/删除（未接）
- 窄屏/深色

### 优先级

1. 数据/项；2. 空/裂图/布局；3. 画廊/删除/排序；4. 样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 998 行；Vamis 32 行）；依赖 image。
- 风险：当前仅平铺。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| source/options/list | 数据 | 已接 |
| 项 src/url/image | 项 | 已接 |
| 列数/预览/删除/排序 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`Images.vue`](../../../packages/vamis/src/renderers/Images.vue)：list/srcOf。
- [`Image`](image.md)：单图（未复用）。

## 5. 样式

- flex 缩略图；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

画廊/删除/排序/列数/裂图/深色。

## 7. 验收

- 数据/项/空/窄屏；未接不误标。

## 8. 后续

先复用 Image/ImageGallery，再做删除/排序；不要重复图片预览实现。

---

返回 [组件设计索引](README.md)
