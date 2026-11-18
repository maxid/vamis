# Sparkline 走势图 · `sparkline` 设计

> 状态：**进行中 55%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/sparkline) · Amis：`/zh-CN/components/sparkline`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Sparkline 当前是**折线/面积 SVG**（56 行）：数值数组、width/height、min/max 归一、area。没有坐标轴/点/颜色配置/空值过滤；55% 是精简。

## 1. 边界与优先级（先读）

1. **数据**：readRaw 数组；低于 2 点显示 placeholder；非数值转 0。
2. **归一**：min/max；跨度 0 用 1；y 反转。
3. **样式**：width 100/height 30；area + line；颜色走 primary。
4. **包边界**：无 `<style>`、无 fetch；sparkline token。

### 边界用例

- 空/1 点/2 点/多值/负数/相同值
- width/height/placeholder
- 深色/窄屏

## 2. 复杂度

- 等级：**S 轻**（Amis 134 行；Vamis 56 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value 数组 | 数据 | 已接 |
| width/height | 尺寸 | 已接 |
| 颜色/点/轴 | 目标 | 未接 |

## 4. 架构

- `display/Sparkline.vue`：points/path/area。
- `prop.ts`：readRaw。

## 5. 缺口

颜色/点/轴/空值过滤/深色。

## 6. 验收

- 空/1 点/多值/相同值/深色；未接不误标。

## 7. 后续

颜色/点按需扩展；保持 SVG 精简。

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

---

返回 [组件设计索引](../README.md)
