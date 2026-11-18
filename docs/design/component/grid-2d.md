# Grid2D 二维布局 · `grid-2d` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/grid-2d) · Amis：`/zh-CN/components/grid-2d`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Grid2D 当前是**绝对定位二维网格**（34 行）：grids 数组，每格 class/style + body 子 schema；容器样式由 grid2dContainerStyle 计算。没有拖拽调整/编辑态/themeCss；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **grids**：数组、visible 过滤；每格 gridClassName/grid2dCellStyle；空数组不崩。
2. **定位**：容器/单元格 style 由 grid2d 纯函数计算；不要模板里算 x/y/w/h。
3. **子 schema**：layoutNodes(grid) 渲染；空 body 不占内容。
4. **编辑拖拽**：未接；不要按可编辑网格验收。
5. **包边界**：无 `<style>`、无 fetch；grid-2d token。

### 边界用例

- 空 grids/单格/多格/隐藏格
- 非法 x/y/w/h/负值/重叠
- 空 body/多节点/嵌套 grid2d
- 窄屏/深色
- 编辑器拖拽（未接）

### 优先级

1. grids/定位；2. 子 schema/空态；3. 重叠/响应式；4. 编辑器。

## 2. 复杂度

- 等级：**M 中**（Amis 232 行；Vamis 34 行）；依赖 container。
- 风险：绝对定位/重叠/编辑器。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `grids` | 网格项 | 已接 |
| x/y/w/h/gridClassName | 定位/样式 | 已接 |
| body | 子 schema | 已接 |
| 编辑器拖拽/themeCss | 目标 | 未接 |

## 4. 架构

- [`layout/Grid2D.vue`](../../../packages/vamis/src/renderers/layout/Grid2D.vue)：grids/containerStyle/cell。
- [`grid2d.ts`](../../../packages/vamis-core/src/utils/grid2d.ts)：container/cell style。
- [`layout/utils.ts`](../../../packages/vamis/src/renderers/layout/utils.ts)：layoutNodes。

## 5. 样式

- 绝对定位/格样式；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

编辑器拖拽/themeCss/重叠策略/响应式。

## 7. 验收

- grids/定位/隐藏/空 body/嵌套/窄屏；未接不误标。

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

编辑器拖拽单独立项；静态布局补重叠/响应式。

---

返回 [组件设计索引](README.md)
