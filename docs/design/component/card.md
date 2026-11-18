# Card 卡片 · `card` 设计

> 状态：**进行中 70%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/card) · Amis：`/zh-CN/components/card`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Card 是单卡展示组件，也是 Cards 的行渲染器。它负责**单卡外观 + 点击优先级 + 媒体 + 工具栏/操作 + 可选勾选**；不负责数据列表、分页、拖拽、CRUD 选择（这些在 Cards/CRUD）。设计时先分清“独立 Card”和“Cards 里的 Card”两种上下文。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **点击优先级**：内部控件（button/a/input/textarea/select/role=button/toolbar/actions）不触发卡片点击；卡片点击顺序：勾选（checkOnItemClick）→ href（blank/jumpTo）→ itemAction。不能颠倒。
2. **选择上下文**：在 Cards 里用 `useCardsSelect`（host 或本地）；独立 Card 只能本地勾选；勾选状态不维护第二份。
3. **内容结构**：header（avatar/title/subtitle/description/toolbar）+ media（left/top/right/bottom）+ body fields + footer actions；空内容不画空壳。
4. **媒体**：image/video 的 url/poster/autoPlay/position/className 走 `cardMedia*`；视频不自动劫持点击。
5. **字段/标签**：`label` 模式与单元格/字段值走 `cardField*`；SchemaRenderer 的 extra-data 是行数据，不是页面根域。
6. **工具栏/操作**：toolbar 与 footer actions 都是 Action schema；点击必须阻止冒泡到卡片。
7. **包边界**：无 `<style>`、无直接 fetch；卡片/媒体/工具栏走 `@vamis/ui` token；作者 className 只落节点。

### 1.2 边界用例

- 独立 Card / Cards 行 / CRUD cards 模式
- 空 header/body/footer / 只有标题 / 只有媒体
- image/video 位置/封面/自动播放/无 url
- href blank false / itemAction / 两者同时配置
- checkOnItemClick + 内部按钮/链接
- 卡内字段（文本/标签/单元格/弹层）与 label 模式
- toolbar/actions 点击不冒泡
- 选中/修改态
- 窄屏、深色、长文本

### 1.3 优先级

1. 点击优先级与选择上下文
2. 内容结构/媒体
3. 字段/工具栏/操作
4. 样式/窄屏/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `Card.tsx` 940 行；Vamis 319 行）
- 依赖：`cards` 选择上下文、`action`、`avatar`、`image`、`video`、`toolbar`
- 风险：单卡内容组合多，点击冒泡/选择态最容易回归

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'card'`
- Amis 渲染器：`packages/amis/src/renderers/Card.tsx`
- 在线文档：[Vamis `/components/card`](/components/card)

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `header` / `title` / `subTitle` / `description` | 头部 | 支持模板/SchemaNode；空不画 |
| `avatar` / `avatarText` | 头像 | 文本/图片；颜色 token |
| `media` | 图片/视频 | position/url/poster/autoPlay/className |
| `body` | 字段/文本/单元格 | 由 cardBody* 派生；SchemaRenderer extra=行 |
| `actions` / `toolbar` | 操作/工具栏 | Action schema；点击阻止冒泡 |
| `href` / `blank` | 链接 | 优先于 itemAction；blank 新窗口 |
| `itemAction` | 卡片动作 | href 无时才执行 |
| `selectable` / `checkOnItemClick` / `selected` | 勾选 | Cards 上下文优先 |
| `useCardLabel` | 标签模式 | 字段 label 展示 |
| `highlight` / `secondary` | 强调/次要 | 样式状态 |
| `themeCss` / `className` | 作者覆盖 | themeCss 未完整 |

### 3.3 事件/动作

Card 没有独立事件/动作表；交互由 `itemAction` / toolbar/actions / href 承担。不要自造 `click` 事件或把 Card 当 Action。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Card.vue`](../../../packages/vamis/src/renderers/Card.vue) | 内容布局、媒体、字段、操作、点击/选择 |
| [`card.ts`](../../../packages/vamis-core/src/utils/card.ts) | title/media/body/actions/href/checkable 等纯函数 |
| [`Cards.vue`](../../../packages/vamis/src/renderers/Cards.vue) | 列表/选择/拖拽上下文；向 Card 传行数据 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | card 内容/媒体/工具栏/选中 token |

### 4.2 点击/选择

```text
click → isInteractive? return
      → Cards selectable + checkOnItemClick? toggle → return
      → href? blank ? window.open : env.jumpTo
      → itemAction? runAction
```

- `select` 来自 `useCardsSelect`；有 host 时写 host，否则本地。
- 独立 Card `selectable` + `checkOnItemClick` 只改本地 checked 并 return。
- 内部控件/工具栏/actions 必须 `isInteractive` 拦截。

### 4.3 内容

- header：avatar/title/subtitle/description/toolbar；有媒体时位置影响布局。
- media：image/video，`mediaPos` left/top/right/bottom；cover 由 Cards 布局配合。
- body：`bodyNodes` / plain text / fields；字段 className 由 cardField* 处理。
- footer：secondary text + action groups；没有就省略。

## 5. 样式与边界

- 默认类：`.vamis-card`、`is-link`、`is-checked`、`is-media-*`、`.vamis-card-media`、`.vamis-card-actions`、`.vamis-card-toolbar`。
- 卡内间距/圆角/头像/媒体/工具栏走 token；无 `<style>`。
- 窄屏卡宽/媒体比例/长文本；深色选中/悬停/修改态单独核。
- 作者 className/themeCss 不替代默认皮肤。

## 6. 当前状态与缺口

- 已对齐：header/avatar/title/subtitle/description、media、body/fields、toolbar/actions、href/itemAction、勾选/修改态、label 模式。
- 缺：`themeCss`、部分单元格/标签样式像素级、深色逐章、卡片内复杂 schema 的窄屏。
- 对照：TODO 记录 card 主路径；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Card / card 工具 / Cards 上下文已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（Card 无独立事件）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Card 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page card` 桌面
- [ ] `pnpm compare --page card --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 点击优先级/内部控件不冒泡
- 独立 vs Cards 选择
- 媒体位置/空内容
- href vs itemAction
- 工具栏/actions

## 8. 后续

1. themeCss / 像素级字段样式单独立项。
2. 深色/窄屏/长文本专项。
3. 与 Cards 的边界测试：同一 Card 在列表/独立两种上下文。

---

返回 [组件设计索引](README.md)
