# Cards 卡片组 · `cards` 设计

> 状态：**进行中 70%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/cards) · Amis：`/zh-CN/components/cards`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Cards 是“列表数据 → 卡片网格”的容器：它自己管理本地行、选择、拖拽排序、未保存条，并把每行交给 `Card` 渲染。与 Table2 类似，它有一套 CRUD host / 独立使用两条路径；和 Card 的边界是：Cards 管数据/选择/拖拽，Card 管单卡外观/媒体/工具条/操作。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **数据域**：`source` / `items` → `rows`；本地修改/拖拽用 `localRows` 覆盖源数据；`sourceRow` 保留原始引用。不要把 rows 另存成第二份互不同步的数组。
2. **选择**：有 CRUD host 时选择写 host；否则本地 `localSelected`；`selected` / `selectedChange` 事件只在用户交互时派发；`checkOnItemClick` 与内部按钮要区分。
3. **拖拽**：只有 `draggable` / initDrag 才启用；拖拽中清选择；`orderChange` 可阻止；未保存条提交/放弃要能还原顺序。
4. **未保存修改**：`localRows` + origin 标记 + `modifiedCount`；提交/放弃只处理本地修改，不写远端。
5. **Card 契约**：Cards 只传 `schema.card` + 行数据；单卡选择态/点击/媒体/工具条由 Card 负责，不要在 Cards 里重复画卡内容。
6. **布局**：columns / masonry/h-stretch/cover 由 Cards 计算；窄屏列数/卡片宽度走 token，不写死 px。
7. **包边界**：无 `<style>`、无直接 fetch；默认皮肤在 `@vamis/ui`；作者 className 只落 `div.vamis-node`。

### 1.2 边界用例

- 空 source / 单行 / 多行 / 非对象行
- columns / masonry / h-stretch / cover / 瀑布流
- CRUD 内（bulkActions/全选）与独立使用
- `selectable` / `multiple` / `checkOnItemClick` / hideCheckToggler
- 选择菜单、全选、取消全选
- 拖拽排序、orderChange 被阻止、提交/放弃顺序
- 行内表单项修改、未保存条、itemClassName
- `header` / `footer` / `title` / placeholder
- 行点击 vs 内部按钮/复选
- 窄屏、深色、长内容

### 1.3 优先级

1. 数据/本地行/选择
2. 拖拽/未保存
3. Card 渲染/布局
4. CRUD host 边界
5. 样式/窄屏/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `Cards.tsx` 1318 行；Vamis 500 行）
- 依赖：`card`、`list`、`popOver`
- 风险：选择/拖拽/本地修改/CRUD host 四套状态叠加

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'cards'`
- Amis 渲染器：`packages/amis/src/renderers/Cards.tsx`
- 在线文档：[Vamis `/components/cards`](/components/cards)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `source` / `items` | 卡片数据 | 默认 `${items}`；空态 placeholder |
| `card` | 单卡 schema | 交给 Card；Cards 只传行数据 |
| `columns` / `masonry` / `hStretch` / `cover` | 布局 | 瀑布流/等高/封面；窄屏列数 |
| `selectable` / `multiple` / `checkOnItemClick` | 选择 | host 优先；本地回退 |
| `draggable` | 拖拽 | initDrag 后启用；清选择 |
| `header` / `footer` / `title` | 头尾 | SchemaNode/模板 |
| `itemClassName` | 单卡 class | 按行动态；当前像素级未核 |
| `hideQuickSaveBtn` | 未保存条 | 关闭后自行提交/放弃 |
| `checkAll` / `hideCheckToggler` | 全选/勾选列 | 与 Card 勾选一致 |
| `placeholder` | 空态 | 文本或 SchemaNode |

### 3.3 事件

已接：`selectedChange`、`selected`、`rowClick`、`orderChange`。

- `selected` / `selectedChange` 携带 selectedItems/unSelectedItems/selectIndexes；
- `rowClick` 在行点击（非内部控件）派发；
- `orderChange` 可阻止，阻止后不提交顺序。

### 3.4 动作/API

已接：`select` / `selectAll` / `clearAll` / `initDrag` / `cancelDrag` / `setValue`（含 index/condition）。

组件 API：`getData()`（items/rows/total/selectedItems）、`setData(values, replace, index, condition)`。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Cards.vue`](../../../../packages/vamis/src/renderers/Cards.vue) | 数据/选择/拖拽/未保存/CRUD host/API |
| [`Card.vue`](../../../../packages/vamis/src/renderers/Card.vue) | 单卡标题/媒体/描述/工具条/操作/勾选 |
| ``cards.ts`` | card schema/title/masonry/placeholder/select 纯函数 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | cards 网格/卡片/未保存条 token |

### 4.2 状态

```text
source/items ──> rows（localRows 优先）──> selectedList
      ├─ header/footer/title/placeholder
      ├─ columns/masonry 布局
      ├─ dragging + order snapshot
      └─ localRows + origin → modifiedCount / 未保存条
```

- `rows` 是渲染源；`localRows` 为本地修改/拖拽覆盖；`sourceRow` 保留源引用。
- `selectedList` 从 host 或 localSelected 取；选择只改这一份。
- 拖拽用 snapshot 保存旧顺序，cancel/reset 恢复。

### 4.3 CRUD host

- 在 CRUD 内：选择/全选/批量条由 CRUD 注入；Cards 不重复画 bulk 区。
- 独立使用：本地选择、全选、未保存条都自己管。
- 事件 target 与数据域：行点击/选择用 `eventCtx` 统一 payload。

## 5. 样式与边界

- 默认类：`.vamis-cards`、`.vamis-cards-wrap`、`.vamis-cards-item`、`.vamis-cards-title/toolbar/actions`、`.vamis-card-drag` 等。
- 网格/卡片/未保存条走 token；无 `<style>`。
- 瀑布流（masonry）不能用固定高度假装；窄屏/深色/悬停/选中态单独核。

## 6. 当前状态与缺口

- 已对齐：基本用法、CRUD 勾选/批量/全选、瀑布流 h-stretch/cover、属性/事件/动作主路径、未保存条、拖拽、跳转/操作。
- 缺：`submitQuickEdit`、`itemClassName` 像素级栅格、`themeCss`；逐章节深色未核；Card 视觉深度另篇。
- 对照：TODO 记录 cards 主路径；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Cards / Card / cards 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Cards 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page cards` 桌面
- [ ] `pnpm compare --page cards --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 选择/全选/跨页 host 数据
- 拖拽与未保存条
- 本地修改与源数据同步
- CRUD 内外两套上下文
- 瀑布流/窄屏

## 8. 后续

1. 补 `submitQuickEdit` 与 itemClassName 像素级栅格。
2. 深色/窄屏/瀑布流专项。
3. Card 单卡深化单独做，不与 Cards 数据状态混刀。

---

返回 [组件设计索引](../README.md)
