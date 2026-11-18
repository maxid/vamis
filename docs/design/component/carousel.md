# Carousel 轮播 · `carousel` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/carousel) · Amis：`/zh-CN/components/carousel`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Carousel 当前是**图片/HTML/Schema 轮播**（127 行）：items、auto/interval/loop、controls dots/arrows、hover 暂停、itemSchema。没有触摸滑动/动画细节/懒加载；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **items**：readList；空显示 placeholder；单条不自动轮播。
2. **自动**：auto false 停；interval 默认 5000；hover 暂停；卸载 clear timer。
3. **切换**：loop 环绕；非 loop clamp；controls dots/arrows。
4. **内容**：string 图片 / html / itemSchema；extraOf current。
5. **包边界**：无 `<style>`、无 fetch；carousel token。

### 边界用例

- 空/单/多/loop/auto false/interval
- controls/dots/arrows/hover 暂停
- 图片/html/Schema/窄屏/深色
- 触摸滑动（未接）

### 优先级

1. items/自动；2. 切换/controls；3. 内容/响应式；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 976 行；Vamis 127 行）；依赖 tpl/container。
- 风险：timer/loop/内容分支。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| items | 轮播项 | 已接 |
| auto/interval/loop | 自动 | 已接 |
| controls | dots/arrows | 已接 |
| 触摸/懒加载 | 目标 | 未接 |

## 4. 架构

- `display/Carousel.vue`：items/index/timer/controls。
- `prop.ts`：readList/cssSize。

## 5. 样式

- carousel 边框/圆角/dots/arrows token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

触摸滑动/动画/懒加载/深色。

## 7. 验收

- items/自动/loop/controls/hover/空/窄屏；未接不误标。

## 8. 后续

触摸/懒加载单独立项；保持 timer 清理。

---

返回 [组件设计索引](README.md)
