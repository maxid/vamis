# GridNav 宫格导航 · `grid-nav` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/grid-nav) · Amis：`/zh-CN/components/grid-nav`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

GridNav 当前是**宫格入口**（76 行）：options/items、columnNum、center/border/square/horizontal/gutter、icon/链接/badge。没有分组/拖拽/权限/懒加载；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **items**：resolveItems；icon/text/link/badge；空不崩。
2. **布局**：columnNum 最小值 1；gutter CSS size；center/border/square/horizontal。
3. **链接**：link/href 插值，env.jumpTo；无 action 分支。
4. **图标**：URL 用 img，否则 fallback 文本；icon class 未接。
5. **包边界**：无 `<style>`、无 fetch；grid-nav token。

### 边界用例

- 空/单/多/columnNum/gutter/center/border/square
- icon URL/class/空/text/link/badge
- 窄屏/深色
- 分组/拖拽（未接）

### 优先级

1. items/布局；2. 链接/图标；3. badge/响应式；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 224 行；Vamis 76 行）；依赖 icon/link/badge。
- 风险：宫格响应式/图标。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| options/items | 入口 | 已接 |
| columnNum/gutter | 布局 | 已接 |
| center/border/square/horizontal | 外观 | 已接 |
| link/icon/badge | 内容 | 已接 |
| 分组/拖拽 | 目标 | 未接 |

## 4. 架构

- `layout/GridNav.vue`：items/grid/onClick。
- `grid-nav.ts`：items/columns/cssSize。

## 5. 样式

- 宫格/边框/gutter token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

分组/拖拽/权限/icon class/深色。

## 7. 验收

- items/布局/链接/图标/badge/空/窄屏；未接不误标。

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

分组/拖拽后置；保持链接/图标简单。

---

返回 [组件设计索引](README.md)
