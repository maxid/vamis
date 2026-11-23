# Transfer Schema 对齐

> 状态：部分落地 · 2026-11-23
> 水标：Amis `AMISTransferSchemaBase` / `packages/amis/src/renderers/Form/Transfer.tsx`
> 设计：[Transfer](../../../../design/component/form/transfer.md)
> 文档：[Transfer](/components/form/transfer)

## 结论

Amis 的 Transfer schema 以 `selectMode`、`selectTitle`、`resultTitle` 为主字段。Vamis 保留 `mode`、`leftTitle`、`rightTitle` 仅作兼容别名，不能继续把它们写成 Amis 主字段。

编辑器补全和对外属性表必须列全 Amis schema。运行时未接字段要在说明里明确标记，不能因为字段出现在补全中就宣称已支持。

## 字段矩阵

| 字段 | Amis 语义 | Vamis 状态 |
|---|---|---|
| `options` / `source` | 静态 / 动态选项 | 已接 |
| `joinValues` / `delimiter` / `extractValue` | 值形态 | 基本路径已接；`extractValue` 复杂对象矩阵仍待逐项核 |
| `labelField` / `valueField` | 选项映射 | 已接 |
| `selectMode` | list/table/tree/chained/associated | 已接 |
| `mode` | 非 Amis 字段 | 仅 Vamis 兼容别名 |
| `leftOptions` / `leftDefaultValue` | associated 左栏 | 已接 |
| `leftMode` / `rightMode` | associated 左右模式 | 已接 |
| `selectTitle` / `resultTitle` | 左右标题 | 已接 |
| `leftTitle` / `rightTitle` | 非 Amis 字段 | 仅 Vamis 兼容别名 |
| `searchable` / `searchPlaceholder` | 左侧搜索 | 已接 |
| `virtualThreshold` / `itemHeight` | 虚拟窗口 | list/table 已接；tree 固定 32px，不消费 `itemHeight` |
| `showArrow` | 中间箭头 | 未接 |
| `sortable` | 结果拖拽排序 | 未接 |
| `resultListModeFollowSelect` | 结果区跟随模式 | 未接 |
| `searchResultMode` / `searchResultColumns` | 搜索结果面板 | 未接 |
| `columns` | table 模式列配置 | 未接，当前固定名称 / 值两列 |
| `resultSearchable` / `resultSearchPlaceholder` | 右侧结果搜索 | 未接 |
| `searchApi` | 左侧远程搜索 | 未接 |
| `menuTpl` / `valueTpl` | 选项 / 结果自定义渲染 | 未接 |
| `statistics` | 选择统计 | 未接 |
| `showInvalidMatch` | 未匹配值飘红 | 未接 |
| `onlyChildren` / `initiallyOpen` / `autoCheckChildren` | 树模式行为 | 未接 |
| `pagination` | list/table 分页 | 未接 |

## 验收要求

1. `catalogFor('transfer').properties` 与 Amis `AMISTransferSchemaBase` 字段同名、同拼写。
2. 对外属性表列全字段；未接项必须在说明中标出。
3. `selectTitle` / `resultTitle` 优先于兼容别名。
4. 每补一个运行时字段，都补行为测试并从“未接”矩阵移到“已接”。
5. 不以 schema 补全齐全替代运行时实现，也不虚增组件进度。
